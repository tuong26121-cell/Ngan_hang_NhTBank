import { createHash, randomUUID } from "node:crypto";
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  existsSync,
  rmSync,
} from "node:fs";
import { resolve, join } from "node:path";
import { createSQLiteStore } from "./sqlite-store.js";
import { inspectLedger } from "../../packages/banking-core/reconciliation.js";
import {
  BankingError,
  requirePermission,
} from "../../packages/banking-core/model.js";
const hash = (file) =>
  createHash("sha256").update(readFileSync(file)).digest("hex");
export function createBackupService(store, directory) {
  const folder = resolve(directory);
  mkdirSync(folder, { recursive: true, mode: 0o700 });
  const fileFor = (id) => {
    if (!/^[0-9a-f-]{36}$/.test(id))
      throw new BankingError("INVALID_BACKUP", "Mã bản sao không hợp lệ.");
    return join(folder, id + ".sqlite");
  };
  return {
    async create(actor) {
      requirePermission(actor, "backup:create");
      const id = randomUUID(),
        file = fileFor(id);
      await store.backupTo(file);
      const candidate = createSQLiteStore(file, { readonly: true });
      let check;
      try {
        if (candidate.integrity() !== "ok")
          throw new Error("SQLite integrity failure");
        check = inspectLedger(candidate.read());
      } finally {
        candidate.close();
      }
      if (!check.balanced) {
        rmSync(file, { force: true });
        throw new BankingError(
          "BACKUP_UNRECONCILED",
          "Chưa sao lưu bản đang có sai lệch; cần xử lý sự cố trước.",
          409,
        );
      }
      const record = {
        id,
        status: "created",
        checksum: hash(file),
        date: new Date().toISOString(),
        schemaVersion: 1,
      };
      writeFileSync(file + ".json", JSON.stringify(record, null, 2), {
        mode: 0o600,
      });
      store.transact((s) => {
        s.backups.push(record);
        s.audit.push({
          id: randomUUID(),
          actorId: actor.id,
          action: "backup.created",
          subjectId: id,
          date: record.date,
          detail: "SQLite online backup; không chứa phiên đăng nhập.",
        });
      });
      return record;
    },
    drill(actor, id) {
      requirePermission(actor, "backup:create");
      const file = fileFor(id);
      const original = store.read().backups.find((b) => b.id === id);
      if (!original || !existsSync(file))
        throw new BankingError(
          "BACKUP_NOT_FOUND",
          "Không tìm thấy bản sao.",
          404,
        );
      const manifest = JSON.parse(readFileSync(file + ".json", "utf8"));
      if (
        manifest.checksum !== original.checksum ||
        hash(file) !== original.checksum
      )
        throw new BankingError(
          "BACKUP_CORRUPT",
          "Bản sao không khớp checksum; chưa được khôi phục.",
          409,
        );
      const target = join(folder, "drill-" + randomUUID() + ".sqlite");
      let candidate, check;
      try {
        copyFileSync(file, target);
        candidate = createSQLiteStore(target, { readonly: true });
        if (candidate.integrity() !== "ok")
          throw new Error("SQLite integrity failure");
        check = inspectLedger(candidate.read());
        if (!check.balanced)
          throw new BankingError(
            "DRILL_FAILED",
            "Đối soát bản khôi phục không đạt.",
            409,
          );
      } finally {
        candidate?.close();
        rmSync(target, { force: true });
      }
      return store.transact((s) => {
        const row = s.backups.find((b) => b.id === id);
        row.lastDrillAt = new Date().toISOString();
        row.status = "verified";
        s.audit.push({
          id: randomUUID(),
          actorId: actor.id,
          action: "backup.drill-passed",
          subjectId: id,
          date: row.lastDrillAt,
          detail:
            "Khôi phục sang bản sao cách ly; không ghi đè cơ sở dữ liệu đang chạy.",
        });
        return row;
      });
    },
  };
}
