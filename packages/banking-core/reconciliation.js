// Independent projection and relationship checks, including balanced-but-wrong journals.
export function inspectLedger(state) {
  const issues = [],
    balances = new Map(state.accounts.map((a) => [a.id, 0n])),
    rows = new Map();
  const add = (code, t, extra = {}) =>
    issues.push({
      code,
      transactionId: t.id,
      accountId: t.accountId,
      ...extra,
    });
  const transactions = new Map(state.transfers.map((t) => [t.id, t]));
  for (const row of state.ledger) {
    if (
      !Number.isSafeInteger(row.amount) ||
      row.amount === 0 ||
      !balances.has(row.accountId) ||
      !transactions.has(row.transactionId)
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
    if (!rows.has(row.transactionId)) rows.set(row.transactionId, []);
    rows.get(row.transactionId).push(row);
  }
  const reversed = new Set();
  for (const t of state.transfers) {
    const entries = rows.get(t.id) || [];
    if (
      entries.length !== 2 ||
      entries.reduce((n, r) => n + BigInt(r.amount), 0n) !== 0n
    )
      add("UNBALANCED_TRANSACTION", t);
    const amount = t.amount;
    let destination =
      t.destinationAccountId ||
      (t.kind === "opening" ? "opening-equity" : "sandbox-clearing");
    const direction = t.kind === "transfer" ? -1 : 1;
    if (
      !Number.isSafeInteger(amount) ||
      amount <= 0 ||
      t.accountId === destination ||
      !balances.has(t.accountId) ||
      !balances.has(destination) ||
      entries.filter(
        (r) => r.accountId === t.accountId && r.amount === direction * amount,
      ).length !== 1 ||
      entries.filter(
        (r) => r.accountId === destination && r.amount === -direction * amount,
      ).length !== 1
    )
      add("POSTING_RELATION_MISMATCH", t);
    if (!["opening", "transfer", "reversal"].includes(t.kind))
      add("INVALID_TRANSACTION_KIND", t);
    if (t.kind === "transfer" && t.internal) {
      const target = state.accounts.find((a) => a.id === destination);
      if (!target || target.number !== t.account || target.kind !== "customer")
        add("INTERNAL_ACCOUNT_MISMATCH", t);
    }
    if (t.kind === "reversal") {
      const original = transactions.get(t.reversesId);
      if (
        !original ||
        original.kind !== "transfer" ||
        reversed.has(t.reversesId) ||
        original.amount !== amount ||
        original.accountId !== t.accountId ||
        (original.destinationAccountId || "sandbox-clearing") !== destination
      )
        add("INVALID_REVERSAL", t);
      reversed.add(t.reversesId);
      const p = state.proposals.find((p) => p.id === t.proposalId);
      if (
        !p ||
        p.type !== "reverse-transfer" ||
        p.status !== "applied" ||
        p.reversalId !== t.id ||
        p.transactionId !== t.reversesId ||
        p.requestedBy === p.decidedBy
      )
        add("REVERSAL_APPROVAL_MISMATCH", t);
    }
    if (t.kind !== "opening") {
      const operations = state.operations.filter(
        (op) => op.result?.id === t.id && op.status === "posted",
      );
      if (operations.length !== 1) add("MISSING_RESULT", t);
      else {
        const op = operations[0],
          result = op.result;
        const expectedAmount = t.kind === "transfer" ? -amount : amount;
        if (
          result.amount !== expectedAmount ||
          result.accountId !== t.accountId ||
          result.value !== amount ||
          (result.destinationAccountId || "sandbox-clearing") !== destination ||
          result.status !== "posted"
        )
          add("RESULT_MISMATCH", t);
        const receipt = state.requests?.find((r) => r.id === op.id);
        if (
          !receipt ||
          receipt.fingerprint !== op.fingerprint ||
          JSON.stringify(receipt.command) !== receipt.fingerprint
        )
          add("REQUEST_RESULT_MISMATCH", t);
        if (
          t.kind === "transfer" &&
          receipt &&
          (Number(receipt.command.amount) !== amount ||
            receipt.command.accountId !== t.accountId ||
            receipt.command.bank !== t.bank ||
            receipt.command.account !== t.account)
        )
          add("COMMAND_POSTING_MISMATCH", t);
      }
      const events = state.outbox.filter((e) => e.transactionId === t.id);
      if (events.length !== 1) add("MISSING_EVENT", t);
      else if (
        events[0].accountId !== t.accountId ||
        events[0].payload.amount !== amount
      )
        add("EVENT_MISMATCH", t);
    }
  }
  for (const op of state.operations) {
    if (op.status === "posted" && !transactions.has(op.result?.id))
      issues.push({ code: "ORPHAN_RESULT", transactionId: op.result?.id });
    if (!["posted", "rejected"].includes(op.status))
      issues.push({ code: "INVALID_RESULT_STATE" });
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
