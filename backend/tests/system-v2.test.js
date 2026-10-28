import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { createSQLiteStore } from "../src/sqlite-store.js";
import { createBackupService } from "../src/backups.js";
import {
  createMemoryStore,
  DEMO_IDENTITIES,
  COLLECTIONS,
} from "../../packages/banking-core/model.js";
import { createPlatform } from "../../packages/banking-core/platform.js";
import { inspectLedger } from "../../packages/banking-core/reconciliation.js";
import { inspectRecovery } from "../../packages/banking-core/recovery.js";
const command = {
  bank: "MB Bank",
  account: "123456789",
  recipient: "Trần Minh Anh",
  amount: "100000",
  note: "Kiểm thử V2",
};
const actor = (role) => ({
  ...DEMO_IDENTITIES[role],
  expiresAt: Date.now() + 3600000,
});
for (const kind of ["memory", "sqlite"]) {
  function setup(t, options = {}) {
    const folder = mkdtempSync(join(tmpdir(), "nht-v2-"));
    const store =
      kind === "memory"
        ? createMemoryStore()
        : createSQLiteStore(join(folder, "db.sqlite"));
    t.after(() => {
      store.close();
      rmSync(folder, { recursive: true, force: true });
    });
    return { store, platform: createPlatform(store, options), folder };
  }
  test(`${kind}: accepted receipt survives posting crash; worker settles exact intent once`, (t) => {
    const { store, platform } = setup(t, {
      failpoint: (stage) => {
        if (stage === "after-acceptance") throw Error("process crash");
      },
    });
    const key = crypto.randomUUID();
    assert.equal(platform.lookup(actor("customer"), key).status, "not_found");
    assert.throws(
      () => platform.transfer(actor("customer"), command, key),
      /process crash/,
    );
    assert.equal(platform.lookup(actor("customer"), key).status, "accepted");
    assert.equal(store.read().ledger.length, 2);
    const recovered = createPlatform(store);
    assert.equal(recovered.settleAccepted(actor("operator")).processed, true);
    const found = recovered.lookup(actor("customer"), key);
    assert.equal(found.status, "posted");
    assert.deepEqual(
      recovered.transfer(actor("customer"), command, key),
      found.result,
    );
    assert.equal(store.read().ledger.length, 4);
    assert.equal(
      recovered.lookup({ ...actor("customer"), id: "other-owner" }, key).status,
      "not_found",
    );
    assert.throws(() => recovered.lookup(actor("operator"), key), {
      code: "FORBIDDEN",
    });
  });
  test(`${kind}: durable rejection can be looked up after a fresh session`, (t) => {
    const { platform, store } = setup(t),
      key = crypto.randomUUID();
    assert.throws(
      () =>
        platform.transfer(
          actor("customer"),
          { ...command, amount: "9000000" },
          key,
        ),
      { code: "INSUFFICIENT_FUNDS" },
    );
    assert.equal(platform.lookup(actor("customer"), key).status, "rejected");
    assert.equal(
      platform.lookup(actor("customer"), key).error.code,
      "INSUFFICIENT_FUNDS",
    );
    assert.equal(store.read().ledger.length, 2);
  });
  test(`${kind}: internal debit and credit commit together; failure leaves only acceptance`, (t) => {
    const { store, platform } = setup(t);
    const result = platform.transfer(
      actor("customer"),
      { ...command, bank: "NhTBank Sandbox", account: "0900000002" },
      crypto.randomUUID(),
    );
    assert.equal(result.destinationAccountId, "peer-vnd");
    assert.equal(result.recipientVerification, "sandbox-internal");
    assert.ok(
      platform
        .snapshot({ ...actor("customer"), id: "demo-peer" })
        .transfers.some((t) => t.id === result.id),
    );
    assert.equal(
      store.read().accounts.find((a) => a.id === "peer-vnd").balance,
      100000,
    );
    assert.equal(
      store.read().accounts.find((a) => a.id === "sandbox-clearing").balance,
      0,
    );
    assert.equal(inspectLedger(store.read()).balanced, true);
    const before = store.read();
    const broken = createPlatform(store, {
      failpoint: (stage) => {
        if (stage === "after-debit") throw Error("power loss");
      },
    });
    assert.throws(() =>
      broken.transfer(
        actor("customer"),
        { ...command, bank: "NhTBank Sandbox", account: "0900000002" },
        crypto.randomUUID(),
      ),
    );
    assert.deepEqual(store.read().accounts, before.accounts);
    assert.deepEqual(store.read().ledger, before.ledger);
  });
  test(`${kind}: approved compensation preserves original, rejects self-approval and duplicate reversal`, (t) => {
    const { platform, store } = setup(t);
    const original = platform.transfer(
      actor("customer"),
      { ...command, bank: "NhTBank Sandbox", account: "0900000002" },
      crypto.randomUUID(),
    );
    const before = store.read();
    const p = platform.proposeReversal(
      actor("operator"),
      original.id,
      "Hai bên đối chiếu và đề nghị bút toán bù",
    );
    assert.throws(
      () =>
        platform.decide(
          { ...actor("approver"), id: actor("operator").id },
          p.id,
          true,
        ),
      { code: "SELF_APPROVAL" },
    );
    const decided = platform.decide(actor("approver"), p.id, true);
    assert.ok(decided.reversalId);
    assert.equal(store.read().accounts[0].balance, 4056000);
    assert.equal(
      store.read().accounts.find((a) => a.id === "peer-vnd").balance,
      0,
    );
    assert.deepEqual(
      store.read().transfers.find((t) => t.id === original.id),
      before.transfers.find((t) => t.id === original.id),
    );
    assert.deepEqual(store.read().ledger.slice(0, 4), before.ledger);
    assert.deepEqual(platform.decide(actor("approver"), p.id, true), decided);
    assert.throws(
      () =>
        platform.proposeReversal(
          actor("operator"),
          original.id,
          "Đề nghị đảo thêm lần nữa bị từ chối",
        ),
      { code: "ALREADY_REVERSED" },
    );
    assert.equal(inspectLedger(store.read()).balanced, true);
  });
  test(`${kind}: reversal rollback and insufficient recipient funds keep original book intact`, (t) => {
    const { platform, store } = setup(t);
    const original = platform.transfer(
      actor("customer"),
      { ...command, bank: "NhTBank Sandbox", account: "0900000002" },
      crypto.randomUUID(),
    );
    const p = platform.proposeReversal(
      actor("operator"),
      original.id,
      "Thử rollback bút toán bù khi đang ghi sổ",
    );
    const before = store.read();
    const broken = createPlatform(store, {
      failpoint: (stage) => {
        if (stage === "reversal-after-debit") throw Error("disk failure");
      },
    });
    assert.throws(
      () => broken.decide(actor("approver"), p.id, true),
      /disk failure/,
    );
    assert.deepEqual(store.read(), before);
    platform.transfer(
      { ...actor("customer"), id: "demo-peer" },
      { ...command, accountId: "peer-vnd" },
      crypto.randomUUID(),
    );
    assert.throws(() => platform.decide(actor("approver"), p.id, true), {
      code: "REVERSAL_FUNDS",
    });
    assert.equal(store.read().proposals[0].status, "pending");
  });
  test(`${kind}: balanced wrong amounts, accounts, result/event links are found independently`, (t) => {
    const { platform, store } = setup(t);
    platform.transfer(actor("customer"), command, crypto.randomUUID());
    for (const mutate of [
      (s) => {
        s.ledger[2].amount = -200000;
        s.ledger[3].amount = 200000;
        s.accounts[0].balance -= 100000;
        s.accounts.find((a) => a.id === "sandbox-clearing").balance += 100000;
      },
      (s) => {
        s.ledger[3].accountId = "peer-vnd";
        s.accounts.find((a) => a.id === "sandbox-clearing").balance = 0;
        s.accounts.find((a) => a.id === "peer-vnd").balance = 100000;
      },
      (s) => {
        s.operations[0].result.amount = -1;
      },
      (s) => {
        s.outbox[0].accountId = "peer-vnd";
      },
    ]) {
      const s = store.read();
      mutate(s);
      assert.equal(inspectLedger(s).balanced, false);
    }
  });
  test(`${kind}: recovery blocks accepted-at-cut and posted-after-cut even if backup itself balances`, (t) => {
    const { platform, store } = setup(t);
    const clean = store.read();
    assert.equal(inspectRecovery(clean, clean).readyToOpen, true);
    const broken = createPlatform(store, {
      failpoint: (stage) => {
        if (stage === "after-acceptance") throw Error();
      },
    });
    assert.throws(() =>
      broken.transfer(actor("customer"), command, crypto.randomUUID()),
    );
    const cut = store.read();
    assert.equal(inspectRecovery(cut, cut).readyToOpen, false);
    platform.settleAccepted(actor("operator"));
    const report = inspectRecovery(cut, store.read());
    assert.equal(report.readyToOpen, false);
    assert.equal(report.aroundCut[0].atCut, "accepted");
    assert.equal(report.aroundCut[0].current, "posted");
    assert.equal(report.missingPostings.length, 2);
    assert.equal(
      inspectRecovery(clean, store.read()).aroundCut[0].atCut,
      "not_in_backup",
    );
  });
}
test("SQLite backup boundary report never claims an old balanced snapshot is ready to open", async (t) => {
  const folder = mkdtempSync(join(tmpdir(), "nht-cut-")),
    store = createSQLiteStore(join(folder, "db.sqlite"));
  t.after(() => {
    store.close();
    rmSync(folder, { recursive: true, force: true });
  });
  const backups = createBackupService(store, join(folder, "backups")),
    record = await backups.create(actor("operator"));
  createPlatform(store).transfer(
    actor("customer"),
    command,
    crypto.randomUUID(),
  );
  const before = store.read().ledger;
  const drill = backups.drill(actor("operator"), record.id);
  assert.equal(drill.status, "investigation-required");
  assert.equal(drill.recovery.readyToOpen, false);
  assert.deepEqual(store.read().ledger, before);
});
test("schema 1 migration preserves historical records and backfills lookup receipts", (t) => {
  const folder = mkdtempSync(join(tmpdir(), "nht-migrate-")),
    file = join(folder, "db.sqlite");
  t.after(() => rmSync(folder, { recursive: true, force: true }));
  const memory = createMemoryStore(),
    platform = createPlatform(memory),
    key = crypto.randomUUID();
  platform.transfer(actor("customer"), command, key);
  const state = memory.read();
  state.schemaVersion = 1;
  delete state.requests;
  state.accounts = state.accounts.filter((a) => a.id !== "peer-vnd");
  const db = new DatabaseSync(file);
  db.exec(
    readFileSync(
      new URL("../migrations/001-ledger.sql", import.meta.url),
      "utf8",
    ),
  );
  for (const table of COLLECTIONS.filter((c) => c !== "requests"))
    state[table].forEach((row, i) => {
      if (table === "ledger")
        db.prepare(
          "INSERT INTO ledger(id,position,body,account_id,transaction_id,amount) VALUES(?,?,?,?,?,?)",
        ).run(
          row.id,
          i,
          JSON.stringify(row),
          row.accountId,
          row.transactionId,
          row.amount,
        );
      else
        db.prepare(`INSERT INTO ${table}(id,position,body) VALUES(?,?,?)`).run(
          row.id,
          i,
          JSON.stringify(row),
        );
    });
  const meta = Object.fromEntries(
    Object.entries(state).filter(([k]) => !COLLECTIONS.includes(k)),
  );
  db.prepare("INSERT INTO metadata(id,body) VALUES(1,?)").run(
    JSON.stringify(meta),
  );
  db.close();
  const upgraded = createSQLiteStore(file);
  t.after(() => upgraded.close());
  assert.deepEqual(upgraded.read().ledger, state.ledger);
  assert.deepEqual(upgraded.read().operations, state.operations);
  assert.equal(upgraded.read().schemaVersion, 2);
  assert.equal(
    createPlatform(upgraded).lookup(actor("customer"), key).status,
    "posted",
  );
  assert.equal(inspectLedger(upgraded.read()).balanced, true);
});

test("recovery flags notification delivery after cut, prefix reordering and dirty live sources", async () => {
  const store = createMemoryStore(),
    platform = createPlatform(store);
  platform.transfer(actor("customer"), command, crypto.randomUUID());
  const cut = store.read();
  await platform.dispatch(actor("operator"));
  const result = inspectRecovery(cut, store.read());
  assert.equal(result.readyToOpen, false);
  assert.equal(result.eventsToReview.length, 1);
  assert.equal(result.eventsToReview[0].atCut, "pending");
  assert.equal(result.eventsToReview[0].current, "delivered");
  const swapped = store.read();
  [swapped.ledger[0], swapped.ledger[1]] = [
    swapped.ledger[1],
    swapped.ledger[0],
  ];
  assert.ok(
    inspectRecovery(swapped, store.read()).issues.some(
      (i) => i.code === "HISTORY_DIVERGED",
    ),
  );
  const live = store.read();
  live.accounts[0].balance++;
  assert.ok(
    inspectRecovery(store.read(), live).issues.some(
      (i) => i.code === "LIVE_SOURCE_UNRECONCILED",
    ),
  );
});

test("SQLite accepted receipt survives a closed connection and resumes after restart", (t) => {
  const folder = mkdtempSync(join(tmpdir(), "nht-accepted-restart-")),
    file = join(folder, "db.sqlite"),
    key = crypto.randomUUID();
  let store = createSQLiteStore(file);
  const crash = createPlatform(store, {
    failpoint: (stage) => {
      if (stage === "after-acceptance") throw Error("stopped");
    },
  });
  assert.throws(
    () => crash.transfer(actor("customer"), command, key),
    /stopped/,
  );
  store.close();
  store = createSQLiteStore(file);
  t.after(() => {
    store.close();
    rmSync(folder, { recursive: true, force: true });
  });
  const recovered = createPlatform(store);
  assert.equal(recovered.lookup(actor("customer"), key).status, "accepted");
  recovered.settleAccepted(actor("operator"));
  assert.equal(recovered.lookup(actor("customer"), key).status, "posted");
  recovered.transfer(actor("customer"), command, key);
  assert.equal(store.read().ledger.length, 4);
});

test("old backup schema is rejected explicitly before a recovery copy is opened", async (t) => {
  const folder = mkdtempSync(join(tmpdir(), "nht-old-backup-")),
    store = createSQLiteStore(join(folder, "db.sqlite"));
  t.after(() => {
    store.close();
    rmSync(folder, { recursive: true, force: true });
  });
  const backups = createBackupService(store, join(folder, "backups")),
    record = await backups.create(actor("operator"));
  const manifestFile = join(folder, "backups", record.id + ".sqlite.json");
  const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
  manifest.schemaVersion = 1;
  writeFileSync(manifestFile, JSON.stringify(manifest));
  const before = store.read();
  assert.throws(() => backups.drill(actor("operator"), record.id), {
    code: "BACKUP_SCHEMA_UNSUPPORTED",
  });
  assert.deepEqual(store.read(), before);
});
