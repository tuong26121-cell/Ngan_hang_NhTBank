import { BankingError, requirePermission } from "./model.js";
import { inspectLedger } from "./reconciliation.js";
export function createMemorySnapshots(store) {
  const files = new Map();
  return {
    create(actor) {
      requirePermission(actor, "backup:create");
      const state = store.read();
      if (!inspectLedger(state).balanced)
        throw new BankingError(
          "BACKUP_UNRECONCILED",
          "Cần xử lý sai lệch trước khi chụp phiên.",
          409,
        );
      const id = crypto.randomUUID(),
        record = {
          id,
          status: "created",
          storage: "memory",
          date: new Date().toISOString(),
          note: "Bản chụp trong bộ nhớ, không phải tệp sao lưu trên máy chủ.",
        };
      files.set(id, JSON.stringify(state));
      store.transact((s) => {
        s.backups.push(record);
        s.audit.push({
          id: crypto.randomUUID(),
          actorId: actor.id,
          action: "snapshot.created",
          subjectId: id,
          date: record.date,
          detail: record.note,
        });
      });
      return record;
    },
    drill(actor, id) {
      requirePermission(actor, "backup:create");
      const raw = files.get(id);
      if (!raw)
        throw new BankingError(
          "BACKUP_NOT_FOUND",
          "Bản chụp không còn trong phiên này.",
          404,
        );
      const copy = JSON.parse(raw);
      if (copy.schemaVersion !== 1 || !inspectLedger(copy).balanced)
        throw new BankingError(
          "DRILL_FAILED",
          "Đối soát bản chụp không đạt.",
          409,
        );
      return store.transact((s) => {
        const record = s.backups.find((b) => b.id === id);
        record.status = "verified";
        record.lastDrillAt = new Date().toISOString();
        s.audit.push({
          id: crypto.randomUUID(),
          actorId: actor.id,
          action: "snapshot.drill-passed",
          subjectId: id,
          date: record.lastDrillAt,
          detail: "Khôi phục JSON vào bản cách ly; không đổi phiên đang dùng.",
        });
        return record;
      });
    },
  };
}
