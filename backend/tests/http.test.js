import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createServerApp } from "../src/server.js";
async function setup(t, options = {}) {
  const folder = mkdtempSync(join(tmpdir(), "nht-http-")),
    app = createServerApp({
      database: join(folder, "db.sqlite"),
      backupDir: join(folder, "backups"),
      frontendOrigins: ["http://test.local"],
      labEnabled: true,
      worker: false,
      ...options,
    });
  await new Promise((r) => app.server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${app.server.address().port}`;
  t.after(async () => {
    await app.close();
    rmSync(folder, { recursive: true, force: true });
  });
  return { app, base };
}
async function login(base, identity = "customer") {
  const response = await fetch(base + "/api/v1/session", {
      method: "POST",
      headers: {
        Origin: "http://test.local",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pin: "123456", identity }),
    }),
    body = await response.json();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("set-cookie"), /HttpOnly; SameSite=Strict/);
  return {
    Cookie: response.headers.get("set-cookie").split(";")[0],
    Origin: "http://test.local",
    "Content-Type": "application/json",
    "X-CSRF-Token": body.csrf,
  };
}
const input = {
  bank: "MB Bank",
  account: "123456789",
  recipient: "Người nhận mẫu",
  amount: "100000",
  note: "Kiểm tra API",
  pin: "123456",
};
test("HTTP sessions, origin/CSRF and roles are enforced on server", async (t) => {
  const { base } = await setup(t);
  assert.equal((await fetch(base + "/api/v1/snapshot")).status, 401);
  const headers = await login(base);
  assert.equal(
    (await fetch(base + "/api/v1/reconciliations", { method: "POST", headers }))
      .status,
    403,
  );
  assert.equal(
    (
      await fetch(base + "/api/v1/transfers", {
        method: "POST",
        headers: { ...headers, Origin: "http://evil.invalid" },
        body: JSON.stringify(input),
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await fetch(base + "/api/v1/transfers", {
        method: "POST",
        headers: { ...headers, "X-CSRF-Token": "wrong" },
        body: JSON.stringify(input),
      })
    ).status,
    403,
  );
  await fetch(base + "/api/v1/session", { method: "DELETE", headers });
  assert.equal(
    (await fetch(base + "/api/v1/snapshot", { headers })).status,
    401,
  );
});
test("HTTP parallel retries post once and caller cannot forge approver role", async (t) => {
  const { base, app } = await setup(t),
    headers = await login(base),
    key = crypto.randomUUID();
  const responses = await Promise.all(
    Array.from({ length: 8 }, () =>
      fetch(base + "/api/v1/transfers", {
        method: "POST",
        headers: { ...headers, "Idempotency-Key": key },
        body: JSON.stringify({ ...input, actor: { role: "approver" } }),
      }),
    ),
  );
  assert.ok(responses.every((r) => r.status === 200));
  const bodies = await Promise.all(responses.map((r) => r.json()));
  assert.equal(new Set(bodies.map((b) => b.id)).size, 1);
  assert.equal(app.store.read().accounts[0].balance, 3956000);
  assert.equal(app.store.read().ledger.length, 4);
});
test("HTTP operator and separate approver finish the incident workflow", async (t) => {
  const { base, app } = await setup(t),
    operator = await login(base, "operator");
  assert.equal(
    (
      await fetch(base + "/api/v1/lab/projection-drift", {
        method: "POST",
        headers: operator,
      })
    ).status,
    200,
  );
  await fetch(base + "/api/v1/reconciliations", {
    method: "POST",
    headers: operator,
  });
  const incident = app.store.read().incidents[0];
  const proposed = await fetch(
    base + `/api/v1/incidents/${incident.id}/proposals`,
    {
      method: "POST",
      headers: operator,
      body: JSON.stringify({ reason: "Đối chiếu rồi xây lại bộ đệm số dư" }),
    },
  );
  const proposal = await proposed.json();
  assert.equal(
    (
      await fetch(base + `/api/v1/proposals/${proposal.id}/approve`, {
        method: "POST",
        headers: operator,
        body: JSON.stringify({ reason: "Tự phê duyệt không được phép" }),
      })
    ).status,
    403,
  );
  const approver = await login(base, "approver");
  assert.equal(
    (
      await fetch(base + `/api/v1/proposals/${proposal.id}/approve`, {
        method: "POST",
        headers: approver,
        body: JSON.stringify({ reason: "Đã kiểm tra sổ gốc và bằng chứng" }),
      })
    ).status,
    200,
  );
  assert.equal(app.store.read().accounts[0].status, "active");
  assert.equal(app.store.read().accounts[0].balance, 4056000);
});
test("HTTP failed PIN attempts are rate limited and malformed JSON is rejected", async (t) => {
  const { base } = await setup(t);
  const jsonHeaders = {
    Origin: "http://test.local",
    "Content-Type": "application/json",
  };
  assert.equal(
    (
      await fetch(base + "/api/v1/session", {
        method: "POST",
        headers: jsonHeaders,
        body: "invalid-json",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await fetch(base + "/api/v1/session", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({ pin: "x".repeat(20000) }),
      })
    ).status,
    413,
  );
  let response;
  for (let i = 0; i < 6; i++)
    response = await fetch(base + "/api/v1/session", {
      method: "POST",
      headers: {
        Origin: "http://test.local",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pin: "bad" }),
    });
  assert.equal(response.status, 429);
});

test("automatic outbox worker only notifies after a durable posting", async (t) => {
  const { base, app } = await setup(t, { worker: true }),
    headers = await login(base);
  await fetch(base + "/api/v1/transfers", {
    method: "POST",
    headers: { ...headers, "Idempotency-Key": crypto.randomUUID() },
    body: JSON.stringify(input),
  });
  const deadline = Date.now() + 4000;
  while (app.store.read().notifications.length === 0 && Date.now() < deadline)
    await new Promise((r) => setTimeout(r, 50));
  assert.equal(app.store.read().notifications.length, 1);
  assert.equal(app.store.read().ledger.length, 4);
  assert.equal(app.store.read().outbox[0].status, "delivered");
});
