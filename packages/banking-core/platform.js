import {
  BankingError,
  PRIMARY_ACCOUNT,
  requirePermission,
  localDay,
} from "./model.js";
import { inspectLedger } from "./reconciliation.js";
const fail = (code, message, status = 400) => {
  throw new BankingError(code, message, status);
};
const banks = [
  "MB Bank",
  "Vietcombank",
  "Techcombank",
  "ACB",
  "NhTBank Sandbox",
];
export function createPlatform(
  store,
  {
    clock = () => Date.now(),
    id = () => crypto.randomUUID(),
    failpoint = () => {},
    labEnabled = false,
  } = {},
) {
  const now = () => new Date(clock()).toISOString();
  const audit = (s, actor, action, detail, subjectId) =>
    s.audit.push({
      id: id(),
      actorId: actor.id,
      action,
      detail,
      subjectId,
      date: now(),
    });
  const access = (actor, permission) =>
    requirePermission(actor, permission, clock());
  function authorizeAccount(actor, account) {
    access(actor, "transfer:create");
    if (!account || account.ownerId !== actor.id)
      fail(
        "ACCOUNT_FORBIDDEN",
        "Bạn không có quyền ghi nợ tài khoản này.",
        403,
      );
  }
  function transfer(actor, input, key) {
    access(actor, "transfer:create");
    if (typeof key !== "string" || !/^[A-Za-z0-9_-]{16,100}$/.test(key))
      fail("INVALID_KEY", "Mỗi lệnh cần mã chống gửi lặp hợp lệ.");
    if (!input || typeof input !== "object")
      fail("INVALID_COMMAND", "Lệnh giao dịch không hợp lệ.");
    const command = {
      accountId: input.accountId || PRIMARY_ACCOUNT,
      bank: String(input.bank || ""),
      account: String(input.account || ""),
      recipient: String(input.recipient || "").trim(),
      amount: String(input.amount || ""),
      note: String(input.note || "").trim(),
    };
    const fingerprint = JSON.stringify(command),
      operationId = actor.id + ":" + key;
    const outcome = store.transact((s) => {
      const source = s.accounts.find((a) => a.id === command.accountId);
      authorizeAccount(actor, source);
      const prior = s.operations.find((op) => op.id === operationId);
      if (prior) {
        if (prior.fingerprint !== fingerprint)
          fail(
            "KEY_CONFLICT",
            "Mã chống gửi lặp đã dùng cho nội dung khác.",
            409,
          );
        return prior;
      }
      let postingStarted = false;
      try {
        if (source.status !== "active")
          fail(
            "ACCOUNT_QUARANTINED",
            "Tài khoản đang được cô lập để đối soát; chưa thể chuyển thêm.",
            423,
          );
        if (!inspectLedger(s).balanced) {
          source.status = "quarantined";
          fail(
            "RECONCILIATION_REQUIRED",
            "Có sai lệch cần đối soát; tài khoản đã được cô lập trước khi ghi nợ.",
            423,
          );
        }
        if (
          !banks.includes(command.bank) ||
          !/^\d{6,19}$/.test(command.account) ||
          command.account === "0788818374" ||
          command.recipient.length < 2 ||
          command.recipient.length > 80 ||
          command.note.length > 120
        )
          fail(
            "INVALID_RECIPIENT",
            "Kiểm tra ngân hàng, số tài khoản, tên người nhận và nội dung mẫu.",
          );
        const amount = Number(command.amount);
        if (
          !/^\d+$/.test(command.amount) ||
          !Number.isSafeInteger(amount) ||
          amount < 1000
        )
          fail(
            "INVALID_AMOUNT",
            "Số tiền phải là số nguyên VNĐ, tối thiểu 1.000.",
          );
        if (amount > source.balance)
          fail(
            "INSUFFICIENT_FUNDS",
            "Số dư mô phỏng không đủ để chuyển khoản.",
            409,
          );
        const spent = s.transfers
          .filter(
            (t) =>
              t.kind === "transfer" &&
              t.accountId === source.id &&
              localDay(t.date) === localDay(clock()),
          )
          .reduce((sum, t) => sum + BigInt(t.amount), 0n);
        if (
          amount > source.singleLimit ||
          spent + BigInt(amount) > BigInt(source.dailyLimit)
        )
          fail(
            "LIMIT_EXCEEDED",
            "Vượt hạn mức thử nghiệm: 2.000.000 VNĐ/lần, 3.000.000 VNĐ/ngày.",
            409,
          );
        const clearing = s.accounts.find((a) => a.id === "sandbox-clearing");
        if (!Number.isSafeInteger(clearing.balance + amount))
          fail(
            "UNSAFE_AMOUNT",
            "Tổng số tiền vượt giới hạn số nguyên an toàn.",
          );
        const date = now(),
          transactionId = "NHT-" + id().toUpperCase();
        const result = {
          id: transactionId,
          kind: "transfer",
          accountId: source.id,
          name: command.recipient,
          detail: command.note || "Chuyển tiền mô phỏng",
          category: "Chuyển tiền",
          amount: -amount,
          value: amount,
          date,
          icon: "transfer",
          recipientVerification: "sandbox-format-only",
          bank: command.bank,
          account: command.account,
          status: "posted",
          mode: "sandbox",
        };
        postingStarted = true;
        source.balance -= amount;
        failpoint("after-debit");
        clearing.balance += amount;
        s.transfers.push({ ...result, amount });
        s.ledger.push(
          {
            id: id(),
            transactionId,
            accountId: source.id,
            amount: -amount,
            date,
          },
          { id: id(), transactionId, accountId: clearing.id, amount, date },
        );
        s.outbox.push({
          id: id(),
          transactionId,
          accountId: source.id,
          status: "pending",
          attempts: 0,
          nextAttemptAt: clock(),
          leaseUntil: 0,
          createdAt: date,
          payload: {
            title: "Đã ghi sổ giao dịch mô phỏng",
            amount,
            recipient: command.recipient,
          },
        });
        audit(
          s,
          actor,
          "transfer.posted",
          "Ghi sổ kép + kết quả + sự kiện trong cùng giao dịch.",
          transactionId,
        );
        const operation = {
          id: operationId,
          fingerprint,
          status: "posted",
          result,
          date,
        };
        s.operations.push(operation);
        failpoint("before-commit");
        return operation;
      } catch (error) {
        if (postingStarted || !(error instanceof BankingError)) throw error;
        const operation = {
          id: operationId,
          fingerprint,
          status: "rejected",
          error: {
            code: error.code,
            message: error.message,
            status: error.status,
          },
          date: now(),
        };
        s.operations.push(operation);
        audit(s, actor, "transfer.rejected", error.code, operationId);
        return operation;
      }
    });
    if (outcome.status === "rejected")
      throw new BankingError(
        outcome.error.code,
        outcome.error.message,
        outcome.error.status,
      );
    return outcome.result;
  }
  function snapshot(actor) {
    access(actor, actor.role === "customer" ? "account:read" : "platform:read");
    const s = store.read();
    if (actor.role !== "customer")
      return { ...s, actor, storage: store.kind, labEnabled };
    const accounts = s.accounts.filter((a) => a.ownerId === actor.id),
      ids = new Set(accounts.map((a) => a.id));
    return {
      schemaVersion: s.schemaVersion,
      version: s.version,
      storage: store.kind,
      actor,
      accounts,
      transfers: s.transfers.filter((t) => ids.has(t.accountId)),
      notifications: s.notifications.filter((n) => ids.has(n.accountId)),
      labEnabled: false,
    };
  }
  function reconcile(actor) {
    access(actor, "reconcile:run");
    return store.transact((s) => {
      const result = inspectLedger(s),
        run = {
          id: id(),
          date: now(),
          actorId: actor.id,
          version: s.version,
          ...result,
        };
      s.reconciliations.push(run);
      if (!result.balanced) {
        const affected = [
          ...new Set(result.issues.map((i) => i.accountId).filter(Boolean)),
        ];
        const scope = affected.filter((accountId) =>
          s.accounts.some((a) => a.id === accountId && a.kind === "customer"),
        );
        if (!scope.length)
          scope.push(
            ...s.accounts.filter((a) => a.kind === "customer").map((a) => a.id),
          );
        for (const accountId of scope)
          s.accounts.find((a) => a.id === accountId).status = "quarantined";
        const existing = s.incidents.find(
          (i) =>
            i.status === "open" &&
            JSON.stringify(i.accounts) === JSON.stringify(scope),
        );
        if (!existing)
          s.incidents.push({
            id: id(),
            runId: run.id,
            accounts: scope,
            issues: result.issues,
            status: "open",
            createdAt: now(),
          });
      }
      audit(
        s,
        actor,
        result.balanced
          ? "reconciliation.passed"
          : "reconciliation.quarantined",
        `${result.issues.length} sai lệch`,
        run.id,
      );
      return run;
    });
  }
  function propose(actor, incidentId, reason) {
    access(actor, "incident:propose");
    if (
      typeof reason !== "string" ||
      reason.trim().length < 10 ||
      reason.length > 500
    )
      fail("REASON_REQUIRED", "Ghi lý do xử lý từ 10 đến 500 ký tự.");
    return store.transact((s) => {
      const incident = s.incidents.find(
        (i) => i.id === incidentId && i.status === "open",
      );
      if (!incident)
        fail("INCIDENT_NOT_FOUND", "Không tìm thấy sự cố đang mở.", 404);
      const pending = s.proposals.find(
        (p) => p.incidentId === incidentId && p.status === "pending",
      );
      if (pending) {
        if (
          pending.requestedBy === actor.id &&
          pending.reason === reason.trim()
        )
          return pending;
        fail(
          "PROPOSAL_PENDING",
          "Sự cố đã có đề xuất chờ duyệt. Cần duyệt hoặc từ chối đề xuất hiện tại trước.",
          409,
        );
      }
      const check = inspectLedger(s);
      if (check.issues.some((i) => i.code !== "BALANCE_MISMATCH"))
        fail(
          "MANUAL_REVIEW_REQUIRED",
          "Sai lệch sổ gốc cần điều tra thủ công; không được tự bù tiền.",
          409,
        );
      const proposal = {
        id: id(),
        incidentId,
        requestedBy: actor.id,
        type: "rebuild-projection",
        reason: reason.trim(),
        evidence: JSON.stringify(check),
        status: "pending",
        date: now(),
      };
      s.proposals.push(proposal);
      audit(s, actor, "resolution.proposed", proposal.reason, proposal.id);
      return proposal;
    });
  }
  function decide(
    actor,
    proposalId,
    approve,
    reason = "Đã kiểm tra bằng chứng và đối soát",
  ) {
    access(actor, "incident:approve");
    if (
      typeof reason !== "string" ||
      reason.trim().length < 10 ||
      reason.length > 500
    )
      fail("REASON_REQUIRED", "Ghi nhận xét phê duyệt từ 10 đến 500 ký tự.");
    return store.transact((s) => {
      const proposal = s.proposals.find((p) => p.id === proposalId);
      if (!proposal) fail("PROPOSAL_NOT_FOUND", "Không tìm thấy đề xuất.", 404);
      if (proposal.requestedBy === actor.id)
        fail("SELF_APPROVAL", "Người đề xuất không được tự phê duyệt.", 403);
      if (proposal.status !== "pending")
        fail("ALREADY_DECIDED", "Đề xuất này đã được xử lý.", 409);
      const incident = s.incidents.find(
        (i) => i.id === proposal.incidentId && i.status === "open",
      );
      if (!incident)
        fail("INCIDENT_NOT_FOUND", "Sự cố không còn ở trạng thái mở.", 409);
      if (approve) {
        const check = inspectLedger(s);
        if (JSON.stringify(check) !== proposal.evidence)
          fail(
            "EVIDENCE_CHANGED",
            "Bằng chứng đã thay đổi. Cần đối soát và lập đề xuất mới.",
            409,
          );
        for (const accountId of incident.accounts)
          s.accounts.find((a) => a.id === accountId).balance =
            check.expected[accountId];
        const recheck = inspectLedger(s);
        if (!recheck.balanced)
          fail(
            "RECHECK_FAILED",
            "Đối soát sau xử lý chưa đạt; thay đổi đã được hủy.",
            409,
          );
        const verifiedRun = {
          id: id(),
          date: now(),
          actorId: actor.id,
          version: s.version,
          ...recheck,
        };
        s.reconciliations.push(verifiedRun);
        audit(
          s,
          actor,
          "resolution.rechecked",
          "Đã lưu đối soát sau xử lý, trước khi bỏ cô lập.",
          verifiedRun.id,
        );
        for (const accountId of incident.accounts)
          s.accounts.find((a) => a.id === accountId).status = "active";
        incident.status = "resolved";
        incident.resolvedAt = now();
      }
      Object.assign(proposal, {
        status: approve ? "applied" : "rejected",
        decidedBy: actor.id,
        decisionReason: reason.trim(),
        decidedAt: now(),
      });
      audit(
        s,
        actor,
        approve ? "resolution.applied" : "resolution.rejected",
        reason.trim(),
        proposal.id,
      );
      return proposal;
    });
  }
  async function dispatch(actor, { deliver, crashAfterDelivery = false } = {}) {
    access(actor, "outbox:dispatch");
    const event = store.transact((s) => {
      const row = s.outbox.find(
        (e) =>
          (e.status === "pending" && e.nextAttemptAt <= clock()) ||
          (e.status === "processing" && e.leaseUntil <= clock()),
      );
      if (!row) return null;
      row.status = "processing";
      row.leaseToken = id();
      row.attempts += 1;
      row.leaseUntil = clock() + 30000;
      return row;
    });
    if (!event) return { delivered: false, reason: "empty" };
    try {
      if (deliver) await deliver(event);
      store.transact((s) => {
        if (!s.notifications.some((n) => n.id === event.id))
          s.notifications.push({
            id: event.id,
            accountId: event.accountId,
            transactionId: event.transactionId,
            ...event.payload,
            date: now(),
          });
      });
      if (crashAfterDelivery)
        throw new Error("Simulated worker crash after delivery");
      store.transact((s) => {
        const row = s.outbox.find((e) => e.id === event.id);
        if (row.leaseToken !== event.leaseToken) return;
        row.status = "delivered";
        row.deliveredAt = now();
        row.leaseUntil = 0;
        audit(
          s,
          actor,
          "notification.delivered",
          "Thông báo nội bộ; khóa nhận là ID sự kiện.",
          event.id,
        );
      });
      return { delivered: true, eventId: event.id };
    } catch (error) {
      if (crashAfterDelivery) throw error;
      store.transact((s) => {
        const row = s.outbox.find((e) => e.id === event.id);
        if (row.leaseToken !== event.leaseToken) return;
        row.status = row.attempts >= 5 ? "dead-letter" : "pending";
        row.nextAttemptAt = clock() + 1000 * 2 ** Math.min(row.attempts, 10);
        row.leaseUntil = 0;
        audit(
          s,
          actor,
          "notification.retry",
          "Gửi lỗi; không hoàn tác giao dịch đã ghi sổ.",
          event.id,
        );
      });
      return { delivered: false, reason: "retry-scheduled", eventId: event.id };
    }
  }
  function injectDrift(actor) {
    access(actor, "lab:inject");
    if (!labEnabled)
      fail("LAB_DISABLED", "Chức năng gây lỗi thử nghiệm đang tắt.", 403);
    return store.transact((s) => {
      const account = s.accounts.find((a) => a.id === PRIMARY_ACCOUNT);
      if (account.status !== "active")
        fail("ACCOUNT_QUARANTINED", "Hãy xử lý sự cố hiện tại trước.", 409);
      account.balance += 1000;
      audit(
        s,
        actor,
        "lab.projection-drift",
        "THỬ NGHIỆM: cộng lệch bộ đệm 1.000 VNĐ; không thay sổ cái.",
        account.id,
      );
      return { injected: true };
    });
  }
  return {
    store,
    transfer,
    snapshot,
    reconcile,
    propose,
    decide,
    dispatch,
    injectDrift,
  };
}
