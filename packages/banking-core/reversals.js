import { BankingError, requirePermission } from "./model.js";
import { inspectLedger } from "./reconciliation.js";
const fail = (code, message, status = 409) => {
  throw new BankingError(code, message, status);
};
const reasonValid = (reason) => {
  if (
    typeof reason !== "string" ||
    reason.trim().length < 10 ||
    reason.length > 500
  )
    fail("REASON_REQUIRED", "Ghi lý do từ 10 đến 500 ký tự.", 400);
};
export function createReversals({ store, clock, id, audit, failpoint }) {
  const now = () => new Date(clock()).toISOString();
  return {
    propose(actor, transactionId, reason) {
      requirePermission(actor, "reversal:propose", clock());
      reasonValid(reason);
      return store.transact((s) => {
        const original = s.transfers.find(
          (t) => t.id === transactionId && t.kind === "transfer",
        );
        if (!original)
          fail(
            "TRANSFER_NOT_FOUND",
            "Không tìm thấy giao dịch có thể đảo.",
            404,
          );
        if (s.transfers.some((t) => t.reversesId === transactionId))
          fail("ALREADY_REVERSED", "Giao dịch đã có bút toán bù.");
        const pending = s.proposals.find(
          (p) =>
            p.transactionId === transactionId &&
            p.type === "reverse-transfer" &&
            p.status === "pending",
        );
        if (pending) {
          if (
            pending.requestedBy === actor.id &&
            pending.reason === reason.trim()
          )
            return pending;
          fail("PROPOSAL_PENDING", "Giao dịch đang có đề xuất đảo chờ duyệt.");
        }
        const proposal = {
          id: id(),
          type: "reverse-transfer",
          transactionId,
          requestedBy: actor.id,
          reason: reason.trim(),
          evidence: JSON.stringify(original),
          status: "pending",
          date: now(),
        };
        s.proposals.push(proposal);
        audit(s, actor, "reversal.proposed", proposal.reason, proposal.id);
        return proposal;
      });
    },
    decide(actor, proposalId, approve, reason) {
      requirePermission(actor, "reversal:approve", clock());
      reasonValid(reason);
      return store.transact((s) => {
        const p = s.proposals.find(
          (row) => row.id === proposalId && row.type === "reverse-transfer",
        );
        if (!p) fail("PROPOSAL_NOT_FOUND", "Không tìm thấy đề xuất.", 404);
        if (p.requestedBy === actor.id)
          fail("SELF_APPROVAL", "Người đề xuất không được tự phê duyệt.", 403);
        if (p.status !== "pending") {
          if (
            p.decidedBy === actor.id &&
            ((approve && p.status === "applied") ||
              (!approve && p.status === "rejected"))
          )
            return p;
          fail("ALREADY_DECIDED", "Đề xuất đã được xử lý.");
        }
        if (approve) {
          const original = s.transfers.find(
            (t) => t.id === p.transactionId && t.kind === "transfer",
          );
          if (!original || JSON.stringify(original) !== p.evidence)
            fail("EVIDENCE_CHANGED", "Bằng chứng giao dịch không còn khớp.");
          if (s.transfers.some((t) => t.reversesId === original.id))
            fail("ALREADY_REVERSED", "Giao dịch đã được đảo.");
          if (!inspectLedger(s).balanced)
            fail(
              "RECONCILIATION_REQUIRED",
              "Cần đối soát và xử lý sai lệch trước khi đảo.",
              423,
            );
          const source = s.accounts.find((a) => a.id === original.accountId),
            destination = s.accounts.find(
              (a) =>
                a.id === (original.destinationAccountId || "sandbox-clearing"),
            );
          if (
            !source ||
            !destination ||
            source.status !== "active" ||
            destination.status !== "active"
          )
            fail("ACCOUNT_QUARANTINED", "Tài khoản đang bị cô lập.", 423);
          const amount = original.amount;
          if (
            destination.balance < amount ||
            !Number.isSafeInteger(source.balance + amount)
          )
            fail(
              "REVERSAL_FUNDS",
              "Bên nhận không đủ số dư hoặc số dư sau bù vượt giới hạn.",
            );
          const transactionId = "REV-" + id().toUpperCase(),
            date = now(),
            key = id(),
            operationId = actor.id + ":" + key;
          const result = {
            id: transactionId,
            kind: "reversal",
            reversesId: original.id,
            accountId: source.id,
            destinationAccountId: destination.id,
            amount,
            value: amount,
            name: original.name,
            date,
            status: "posted",
            mode: "sandbox",
            detail: "Bút toán bù được phê duyệt",
            category: "Đảo giao dịch",
            icon: "transfer",
            proposalId,
          };
          destination.balance -= amount;
          failpoint("reversal-after-debit");
          source.balance += amount;
          s.transfers.push(result);
          s.ledger.push(
            { id: id(), transactionId, accountId: source.id, amount, date },
            {
              id: id(),
              transactionId,
              accountId: destination.id,
              amount: -amount,
              date,
            },
          );
          const command = {
              type: "approved-reversal",
              transactionId: original.id,
              proposalId,
            },
            fingerprint = JSON.stringify(command);
          s.requests.push({
            id: operationId,
            key,
            actorId: actor.id,
            command,
            fingerprint,
            date,
          });
          s.operations.push({
            id: operationId,
            status: "posted",
            fingerprint,
            result,
            date,
          });
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
              title: "Đã ghi sổ bút toán bù mô phỏng",
              amount,
              recipient: original.name,
            },
          });
          p.reversalId = transactionId;
        }
        Object.assign(p, {
          status: approve ? "applied" : "rejected",
          decidedBy: actor.id,
          decidedAt: now(),
          decisionReason: reason.trim(),
        });
        audit(
          s,
          actor,
          approve ? "reversal.posted" : "reversal.rejected",
          reason.trim(),
          p.id,
        );
        failpoint("reversal-before-commit");
        return p;
      });
    },
  };
}
