import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createMemoryStore,
  DEMO_IDENTITIES,
  PRIMARY_ACCOUNT,
} from "../../packages/banking-core/model.js";
import { createPlatform } from "../../packages/banking-core/platform.js";
import { inspectLedger } from "../../packages/banking-core/reconciliation.js";
import { createSQLiteStore } from "../src/sqlite-store.js";
import { createBackupService } from "../src/backups.js";
const command = {
  bank: "MB Bank",
  account: "123456789",
  recipient: "Trần Minh Anh",
  amount: "100000",
  note: "Thử nghiệm",
};
for (const kind of ["memory", "sqlite"]) {
  function setup(t, options = {}) {
    const folder = mkdtempSync(join(tmpdir(), "nht-core-")),
      file = join(folder, "ledger.sqlite");
    const store =
      kind === "memory" ? createMemoryStore() : createSQLiteStore(file);
    let time = Date.parse("2026-10-29T02:00:00Z");
    const actor = (role) => ({
      ...DEMO_IDENTITIES[role],
      expiresAt: time + 3600000,
    });
    const platform = createPlatform(store, {
      clock: () => time,
      labEnabled: true,
      ...options,
    });
    t.after(() => {
      store.close();
      rmSync(folder, { recursive: true, force: true });
    });
    return { store, platform, actor, folder, file, tick: (n) => (time += n) };
  }
  test(`${kind}: atomic balanced journal, immutable result and same-key replay`, (t) => {
    const { store, platform, actor } = setup(t);
    const c = actor("customer"),
      key = crypto.randomUUID();
    const first = platform.transfer(c, command, key),
      again = platform.transfer(c, command, key);
    assert.deepEqual(again, first);
    const s = store.read();
    assert.equal(s.accounts[0].balance, 3956000);
    assert.equal(s.ledger.length, 4);
    assert.equal(s.outbox.length, 1);
    assert.equal(s.operations.length, 1);
    assert.equal(
      s.audit.filter((a) => a.action === "transfer.posted").length,
      1,
    );
    assert.equal(inspectLedger(s).balanced, true);
    assert.throws(
      () => platform.transfer(c, { ...command, amount: "200000" }, key),
      { code: "KEY_CONFLICT" },
    );
    assert.equal(store.read().accounts[0].balance, 3956000);
    assert.throws(
      () =>
        store.transact((d) => {
          d.ledger[0].amount = 1;
        }),
      { code: "IMMUTABLE_RECORD" },
    );
  });
  test(`${kind}: rollback after debit and before commit, including domain errors`, (t) => {
    for (const stage of ["after-debit", "before-commit"]) {
      const { store, platform, actor } = setup(t, {
        failpoint: (s) => {
          if (s === stage) throw new Error("disk fault");
        },
      });
      const before = store.read();
      assert.throws(
        () =>
          platform.transfer(actor("customer"), command, crypto.randomUUID()),
        /disk fault/,
      );
      const after = store.read();
      for (const collection of [
        "accounts",
        "transfers",
        "ledger",
        "operations",
        "outbox",
        "notifications",
      ])
        assert.deepEqual(after[collection], before[collection]);
      assert.equal(after.requests.length, 1);
      assert.equal(after.audit.at(-1).action, "request.accepted");
    }
  });
  test(`${kind}: expiry, account ownership, role, receiver and rejected-result replay`, (t) => {
    const { platform, actor, store } = setup(t);
    assert.throws(
      () =>
        platform.transfer(
          { ...actor("customer"), expiresAt: 0 },
          command,
          crypto.randomUUID(),
        ),
      { code: "SESSION_EXPIRED" },
    );
    assert.throws(
      () => platform.transfer(actor("operator"), command, crypto.randomUUID()),
      { code: "FORBIDDEN" },
    );
    assert.throws(
      () =>
        platform.transfer(
          actor("customer"),
          { ...command, accountId: "sandbox-clearing" },
          crypto.randomUUID(),
        ),
      { code: "ACCOUNT_FORBIDDEN" },
    );
    const key = crypto.randomUUID();
    assert.throws(
      () =>
        platform.transfer(
          actor("customer"),
          { ...command, amount: "9000000" },
          key,
        ),
      { code: "INSUFFICIENT_FUNDS" },
    );
    assert.throws(
      () =>
        platform.transfer(
          actor("customer"),
          { ...command, amount: "9000000" },
          key,
        ),
      { code: "INSUFFICIENT_FUNDS" },
    );
    assert.equal(store.read().operations.length, 1);
    assert.equal(store.read().ledger.length, 2);
    for (const amount of ["1e6", "1.5", "-1000", "9007199254740992"]) {
      assert.throws(
        () =>
          platform.transfer(
            actor("customer"),
            { ...command, amount },
            crypto.randomUUID(),
          ),
        { code: "INVALID_AMOUNT" },
      );
    }
    assert.throws(
      () =>
        platform.transfer(
          actor("customer"),
          { ...command, account: "0788818374" },
          crypto.randomUUID(),
        ),
      { code: "INVALID_RECIPIENT" },
    );
  });
  test(`${kind}: single/day limits are checked in same unit of work`, (t) => {
    const { platform, actor, store } = setup(t);
    assert.throws(
      () =>
        platform.transfer(
          actor("customer"),
          { ...command, amount: "2100000" },
          crypto.randomUUID(),
        ),
      { code: "LIMIT_EXCEEDED" },
    );
    platform.transfer(
      actor("customer"),
      { ...command, amount: "2000000" },
      crypto.randomUUID(),
    );
    assert.throws(
      () =>
        platform.transfer(
          actor("customer"),
          { ...command, amount: "1100000" },
          crypto.randomUUID(),
        ),
      { code: "LIMIT_EXCEEDED" },
    );
    assert.equal(store.read().accounts[0].balance, 2056000);
  });
  test(`${kind}: retry/dead-letter cannot undo posting; lease recovery deduplicates inbox`, async (t) => {
    const { platform, actor, store, tick } = setup(t);
    platform.transfer(actor("customer"), command, crypto.randomUUID());
    for (let i = 0; i < 5; i++) {
      const r = await platform.dispatch(actor("operator"), {
        deliver: async () => {
          throw new Error("notification unavailable");
        },
      });
      assert.equal(r.delivered, false);
      tick(100000);
    }
    assert.equal(store.read().outbox[0].status, "dead-letter");
    assert.equal(store.read().accounts[0].balance, 3956000);
    assert.equal(store.read().ledger.length, 4);
    platform.transfer(actor("customer"), command, crypto.randomUUID());
    await assert.rejects(
      platform.dispatch(actor("operator"), { crashAfterDelivery: true }),
      /crash/,
    );
    assert.equal(store.read().notifications.length, 1);
    tick(31000);
    await platform.dispatch(actor("operator"));
    assert.equal(store.read().notifications.length, 1);
    assert.equal(store.read().outbox[1].status, "delivered");
  });
  test(`${kind}: reconciliation quarantines, separate approver rebuilds only projection`, (t) => {
    const { platform, actor, store } = setup(t);
    platform.injectDrift(actor("operator"));
    const run = platform.reconcile(actor("operator"));
    assert.equal(run.balanced, false);
    assert.equal(store.read().accounts[0].status, "quarantined");
    assert.throws(
      () => platform.transfer(actor("customer"), command, crypto.randomUUID()),
      { code: "ACCOUNT_QUARANTINED" },
    );
    const incident = store.read().incidents[0],
      proposal = platform.propose(
        actor("operator"),
        incident.id,
        "Đối chiếu sổ cái và xây lại bộ đệm số dư",
      );
    assert.deepEqual(
      platform.propose(
        actor("operator"),
        incident.id,
        "Đối chiếu sổ cái và xây lại bộ đệm số dư",
      ),
      proposal,
    );
    assert.equal(store.read().proposals.length, 1);
    assert.throws(
      () =>
        platform.propose(
          actor("operator"),
          incident.id,
          "Một đề xuất khác khi bản trước còn chờ",
        ),
      { code: "PROPOSAL_PENDING" },
    );
    assert.throws(
      () =>
        platform.decide(
          { ...actor("approver"), id: actor("operator").id },
          proposal.id,
          true,
        ),
      { code: "SELF_APPROVAL" },
    );
    const before = store.read().ledger;
    platform.decide(actor("approver"), proposal.id, true);
    assert.deepEqual(store.read().ledger, before);
    assert.equal(store.read().accounts[0].balance, 4056000);
    assert.equal(store.read().incidents[0].status, "resolved");
    assert.equal(inspectLedger(store.read()).balanced, true);
  });
  test(`${kind}: stale evidence and rejected approvals never unfreeze accounts`, (t) => {
    const { platform, actor, store } = setup(t);
    platform.injectDrift(actor("operator"));
    platform.reconcile(actor("operator"));
    const p = platform.propose(
      actor("operator"),
      store.read().incidents[0].id,
      "Kiểm tra bằng chứng trước khi sửa bộ đệm",
    );
    store.transact((s) => {
      s.accounts[0].balance += 1;
    });
    assert.throws(() => platform.decide(actor("approver"), p.id, true), {
      code: "EVIDENCE_CHANGED",
    });
    platform.decide(
      actor("approver"),
      p.id,
      false,
      "Từ chối vì bằng chứng đã thay đổi",
    );
    assert.equal(store.read().accounts[0].status, "quarantined");
  });
}
test("SQLite restart keeps idempotency results and double-entry state", (t) => {
  const folder = mkdtempSync(join(tmpdir(), "nht-restart-")),
    file = join(folder, "db.sqlite"),
    key = crypto.randomUUID(),
    actor = { ...DEMO_IDENTITIES.customer, expiresAt: Date.now() + 3600000 };
  let store = createSQLiteStore(file),
    platform = createPlatform(store);
  const first = platform.transfer(actor, command, key);
  store.close();
  store = createSQLiteStore(file);
  platform = createPlatform(store);
  assert.deepEqual(platform.transfer(actor, command, key), first);
  assert.equal(store.read().ledger.length, 4);
  store.close();
  rmSync(folder, { recursive: true, force: true });
});
test("backup restores isolated copy; corrupt copy is rejected; live ledger untouched", async (t) => {
  const folder = mkdtempSync(join(tmpdir(), "nht-backup-")),
    store = createSQLiteStore(join(folder, "live.sqlite")),
    actor = { ...DEMO_IDENTITIES.operator, expiresAt: Date.now() + 3600000 };
  t.after(() => {
    store.close();
    rmSync(folder, { recursive: true, force: true });
  });
  const service = createBackupService(store, join(folder, "backups")),
    record = await service.create(actor),
    before = store.read().ledger;
  assert.equal(service.drill(actor, record.id).status, "verified");
  assert.deepEqual(store.read().ledger, before);
  appendFileSync(join(folder, "backups", record.id + ".sqlite"), "corruption");
  assert.throws(() => service.drill(actor, record.id), {
    code: "BACKUP_CORRUPT",
  });
});
test("dirty projection is blocked before it can fund a transfer", () => {
  const store = createMemoryStore(),
    actor = (role) => ({
      ...DEMO_IDENTITIES[role],
      expiresAt: Date.now() + 3600000,
    }),
    platform = createPlatform(store, { labEnabled: true });
  platform.injectDrift(actor("operator"));
  assert.throws(
    () => platform.transfer(actor("customer"), command, crypto.randomUUID()),
    { code: "RECONCILIATION_REQUIRED" },
  );
  assert.equal(store.read().ledger.length, 2);
  assert.equal(store.read().accounts[0].status, "quarantined");
});
test("SQLite statement failure after account write rolls back the actual database", (t) => {
  const folder = mkdtempSync(join(tmpdir(), "nht-sql-rollback-")),
    store = createSQLiteStore(join(folder, "db.sqlite"));
  t.after(() => {
    store.close();
    rmSync(folder, { recursive: true, force: true });
  });
  const before = store.read();
  assert.throws(
    () =>
      store.transact((s) => {
        s.accounts[0].balance -= 1000;
        s.ledger.push({
          id: crypto.randomUUID(),
          transactionId: "opening",
          accountId: "missing-account",
          amount: -1000,
          date: new Date().toISOString(),
        });
      }),
    /FOREIGN KEY/,
  );
  assert.deepEqual(store.read(), before);
});
test("separate writer processes serialize one idempotency key in SQLite", async (t) => {
  const { spawn } = await import("node:child_process"),
    folder = mkdtempSync(join(tmpdir(), "nht-processes-")),
    file = join(folder, "db.sqlite"),
    initial = createSQLiteStore(file);
  initial.close();
  t.after(() => rmSync(folder, { recursive: true, force: true }));
  const key = crypto.randomUUID(),
    code = `import{createSQLiteStore}from ${JSON.stringify(new URL("../src/sqlite-store.js", import.meta.url).href)};import{createPlatform}from ${JSON.stringify(new URL("../../packages/banking-core/platform.js", import.meta.url).href)};const s=createSQLiteStore(${JSON.stringify(file)});const result=createPlatform(s).transfer({id:"demo-customer",role:"customer",expiresAt:Date.now()+60000},${JSON.stringify(command)},${JSON.stringify(key)});console.log(result.id);s.close();`;
  const run = () =>
    new Promise((resolve, reject) => {
      const p = spawn(process.execPath, ["--input-type=module", "-e", code]);
      let output = "",
        error = "";
      p.stdout.on("data", (d) => (output += d));
      p.stderr.on("data", (d) => (error += d));
      p.on("error", reject);
      p.on("exit", (c) =>
        c === 0 ? resolve(output.trim()) : reject(Error(error)),
      );
    });
  const ids = await Promise.all(Array.from({ length: 4 }, run));
  assert.equal(new Set(ids).size, 1);
  const after = createSQLiteStore(file);
  assert.equal(after.read().ledger.length, 4);
  assert.equal(after.read().accounts[0].balance, 3956000);
  after.close();
});

test("empty worker polling does not advance the data version", async () => {
  for (const store of [createMemoryStore(), createSQLiteStore(":memory:")]) {
    try {
      const before = store.read(),
        platform = createPlatform(store);
      await platform.dispatch({
        ...DEMO_IDENTITIES.operator,
        expiresAt: Date.now() + 60000,
      });
      assert.deepEqual(store.read(), before);
    } finally {
      store.close();
    }
  }
});
