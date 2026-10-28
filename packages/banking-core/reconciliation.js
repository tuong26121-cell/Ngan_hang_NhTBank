// Independent projection: never reads cached balances to compute expected balances.
export function inspectLedger(state) {
  const issues = [],
    balances = new Map(state.accounts.map((a) => [a.id, 0n])),
    totals = new Map(),
    counts = new Map();
  const transferIds = new Set(state.transfers.map((t) => t.id));
  for (const row of state.ledger) {
    if (
      !Number.isSafeInteger(row.amount) ||
      !balances.has(row.accountId) ||
      !transferIds.has(row.transactionId)
    ) {
      issues.push({
        code: "INVALID_POSTING",
        accountId: row.accountId,
        transactionId: row.transactionId,
      });
      continue;
    }
    balances.set(
      row.accountId,
      balances.get(row.accountId) + BigInt(row.amount),
    );
    totals.set(
      row.transactionId,
      (totals.get(row.transactionId) || 0n) + BigInt(row.amount),
    );
    counts.set(row.transactionId, (counts.get(row.transactionId) || 0) + 1);
  }
  for (const transfer of state.transfers) {
    if (totals.get(transfer.id) !== 0n || counts.get(transfer.id) !== 2)
      issues.push({
        code: "UNBALANCED_TRANSACTION",
        transactionId: transfer.id,
        accountId: transfer.accountId,
      });
    if (transfer.kind === "transfer") {
      if (
        !state.operations.some(
          (op) => op.result?.id === transfer.id && op.status === "posted",
        )
      )
        issues.push({
          code: "MISSING_RESULT",
          transactionId: transfer.id,
          accountId: transfer.accountId,
        });
      if (!state.outbox.some((e) => e.transactionId === transfer.id))
        issues.push({
          code: "MISSING_EVENT",
          transactionId: transfer.id,
          accountId: transfer.accountId,
        });
    }
  }
  const expected = {};
  for (const account of state.accounts) {
    const value = balances.get(account.id);
    if (
      value > BigInt(Number.MAX_SAFE_INTEGER) ||
      value < BigInt(Number.MIN_SAFE_INTEGER)
    ) {
      issues.push({ code: "UNSAFE_TOTAL", accountId: account.id });
      continue;
    }
    expected[account.id] = Number(value);
    if (expected[account.id] !== account.balance)
      issues.push({
        code: "BALANCE_MISMATCH",
        accountId: account.id,
        actual: account.balance,
        expected: expected[account.id],
      });
  }
  return {
    issues,
    expected,
    ledgerCount: state.ledger.length,
    balanced: issues.length === 0,
  };
}
