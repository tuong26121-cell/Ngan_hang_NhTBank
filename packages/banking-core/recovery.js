import { inspectLedger } from "./reconciliation.js";
import { SCHEMA_VERSION } from "./model.js";
// A clean snapshot is insufficient: compare immutable prefixes and unresolved requests at the cut.
export function inspectRecovery(candidate, live) {
  const ledger = inspectLedger(candidate),
    issues = [];
  if (candidate.schemaVersion !== SCHEMA_VERSION)
    issues.push({ code: "SCHEMA_MISMATCH" });
  if (!ledger.balanced) issues.push({ code: "RESTORED_LEDGER_INVALID" });
  if (
    !inspectLedger(live).balanced ||
    live.accounts.some((a) => a.status !== "active") ||
    live.incidents.some((i) => i.status === "open")
  )
    issues.push({ code: "LIVE_SOURCE_UNRECONCILED" });
  for (const collection of [
    "requests",
    "operations",
    "ledger",
    "transfers",
    "audit",
    "notifications",
  ]) {
    for (const [position, row] of candidate[collection].entries())
      if (JSON.stringify(live[collection][position]) !== JSON.stringify(row))
        issues.push({ code: "HISTORY_DIVERGED", collection, id: row.id });
  }
  const candidateRequests = new Set(candidate.requests.map((r) => r.id));
  const candidateResults = new Set(candidate.operations.map((r) => r.id));
  const liveResults = new Map(live.operations.map((r) => [r.id, r]));
  const aroundCut = live.requests
    .filter((r) => !candidateRequests.has(r.id) || !candidateResults.has(r.id))
    .map((r) => ({
      id: r.id,
      key: r.key,
      acceptedAt: r.date,
      atCut: candidateRequests.has(r.id) ? "accepted" : "not_in_backup",
      current: liveResults.get(r.id)?.status || "accepted",
    }));
  const missingResults = live.operations
    .filter((r) => !candidateResults.has(r.id))
    .map((r) => r.id);
  const missingPostings = live.ledger
    .filter((r) => !candidate.ledger.some((c) => c.id === r.id))
    .map((r) => r.id);
  if (aroundCut.length || missingResults.length || missingPostings.length)
    issues.push({ code: "RECOVERY_BOUNDARY_UNRESOLVED" });
  const eventsToReview = live.outbox
    .filter((event) => {
      const saved = candidate.outbox.find((e) => e.id === event.id);
      return (
        !saved ||
        JSON.stringify(saved) !== JSON.stringify(event) ||
        (live.notifications.some((n) => n.id === event.id) &&
          !candidate.notifications.some((n) => n.id === event.id))
      );
    })
    .map((e) => ({
      id: e.id,
      transactionId: e.transactionId,
      atCut:
        candidate.outbox.find((c) => c.id === e.id)?.status || "not_in_backup",
      current: e.status,
    }));
  if (eventsToReview.length)
    issues.push({ code: "DELIVERY_BOUNDARY_UNRESOLVED" });
  return {
    readyToOpen: issues.length === 0,
    issues,
    aroundCut,
    missingResults,
    missingPostings,
    eventsToReview,
    snapshotVersion: candidate.version,
    liveVersion: live.version,
    note: "Chỉ diễn tập cách ly. Không tự nhập lại yêu cầu, không ghi đè DB hoặc mở lại giao dịch.",
  };
}
