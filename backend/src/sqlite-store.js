import { DatabaseSync, backup } from "node:sqlite";
import { readFileSync, mkdirSync, chmodSync } from "node:fs";
import { dirname } from "node:path";
import {
  COLLECTIONS,
  IMMUTABLE_COLLECTIONS,
  SCHEMA_VERSION,
  seedState,
  assertAppendOnly,
} from "../../packages/banking-core/model.js";
const migration = readFileSync(
  new URL("../migrations/001-ledger.sql", import.meta.url),
  "utf8",
);
export function createSQLiteStore(path, { readonly = false } = {}) {
  if (path !== ":memory:" && !readonly)
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(path, { readOnly: readonly });
  db.exec("PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;");
  if (!readonly) {
    db.exec("PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;");
    const version = db.prepare("PRAGMA user_version").get().user_version;
    if (version !== 0 && version !== SCHEMA_VERSION) {
      db.close();
      throw new Error("Unsupported database schema");
    }
    db.exec(migration);
    for (const table of IMMUTABLE_COLLECTIONS)
      for (const action of ["UPDATE", "DELETE"])
        db.exec(
          `CREATE TRIGGER IF NOT EXISTS ${table}_${action.toLowerCase()}_immutable BEFORE ${action} ON ${table} BEGIN SELECT RAISE(ABORT,'immutable record'); END;`,
        );
    if (path !== ":memory:") chmodSync(path, 0o600);
  }
  function readUnsafe() {
    const meta = db.prepare("SELECT body FROM metadata WHERE id=1").get();
    if (!meta) return null;
    const state = JSON.parse(meta.body);
    for (const table of COLLECTIONS)
      state[table] = db
        .prepare(`SELECT body FROM ${table} ORDER BY position`)
        .all()
        .map((row) => JSON.parse(row.body));
    return state;
  }
  function save(previous, next) {
    assertAppendOnly(previous, next);
    // Account rows and immutable results are inserted before their journal FK references.
    for (const table of COLLECTIONS) {
      const old = new Map(
        previous[table].map((row) => [row.id, JSON.stringify(row)]),
      );
      next[table].forEach((row, position) => {
        const body = JSON.stringify(row);
        if (old.get(row.id) === body) return;
        if (table === "ledger")
          db.prepare(
            "INSERT INTO ledger(id,position,body,account_id,transaction_id,amount) VALUES(?,?,?,?,?,?)",
          ).run(
            row.id,
            position,
            body,
            row.accountId,
            row.transactionId,
            row.amount,
          );
        else if (IMMUTABLE_COLLECTIONS.includes(table))
          db.prepare(
            `INSERT INTO ${table}(id,position,body) VALUES(?,?,?)`,
          ).run(row.id, position, body);
        else
          db.prepare(
            `INSERT INTO ${table}(id,position,body) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body`,
          ).run(row.id, position, body);
      });
    }
    const metadata = Object.fromEntries(
      Object.entries(next).filter(([key]) => !COLLECTIONS.includes(key)),
    );
    db.prepare(
      "INSERT INTO metadata(id,body) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET body=excluded.body",
    ).run(JSON.stringify(metadata));
  }
  if (!readonly) {
    db.exec("BEGIN IMMEDIATE");
    try {
      if (!readUnsafe()) {
        const initial = seedState();
        save(
          {
            ...initial,
            ...Object.fromEntries(COLLECTIONS.map((c) => [c, []])),
          },
          initial,
        );
      }
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      db.close();
      throw error;
    }
  }
  return {
    kind: "sqlite",
    path,
    read() {
      db.exec("BEGIN");
      try {
        const s = readUnsafe();
        db.exec("COMMIT");
        if (!s || s.schemaVersion !== SCHEMA_VERSION)
          throw new Error("Invalid snapshot schema");
        return s;
      } catch (error) {
        if (db.isTransaction) db.exec("ROLLBACK");
        throw error;
      }
    },
    transact(fn) {
      if (readonly) throw new Error("Read-only database");
      db.exec("BEGIN IMMEDIATE");
      try {
        const before = readUnsafe(),
          next = structuredClone(before),
          result = fn(next);
        if (result?.then) throw new Error("Unit of work must be synchronous");
        if (JSON.stringify(next) === JSON.stringify(before)) {
          db.exec("COMMIT");
          return structuredClone(result);
        }
        next.version = before.version + 1;
        save(before, next);
        db.exec("COMMIT");
        return structuredClone(result);
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
    async backupTo(target) {
      if (readonly) throw new Error("Read-only database");
      await backup(db, target);
      chmodSync(target, 0o600);
    },
    integrity() {
      const check = db.prepare("PRAGMA integrity_check").get().integrity_check;
      return check === "ok" &&
        db.prepare("PRAGMA foreign_key_check").all().length === 0
        ? "ok"
        : "integrity-or-foreign-key-failure";
    },
    close() {
      db.close();
    },
  };
}
