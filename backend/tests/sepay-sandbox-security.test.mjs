import test from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { createSandboxServer, verifySePayWebhook } from "../sepay-sandbox-server.mjs";

const INTERNAL_TOKEN = "nht-test-internal-token-0123456789-abcdef";
const WEBHOOK_SECRET = "nht-test-webhook-secret-0123456789-abcdef";
const ACCOUNT_ID = "123e4567-e89b-12d3-a456-426614174000";
const TX_ID = "123e4567-e89b-12d3-a456-426614174001";
const FIXED_NOW = 1_800_000_000_000;

function sign(body, timestamp, secret = WEBHOOK_SECRET) {
  return "sha256=" + createHmac("sha256", secret)
    .update(String(timestamp) + ".")
    .update(body)
    .digest("hex");
}

async function startServer(t, options = {}) {
  const server = createSandboxServer(options);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  t.after(() => new Promise(resolve => server.close(resolve)));
  const address = server.address();
  return "http://127.0.0.1:" + address.port;
}

async function postWebhook(base, {
  body = Buffer.from('{"id":"event-1"}'),
  timestamp = String(Math.floor(FIXED_NOW / 1000)),
  signature,
  contentType = "application/json"
} = {}) {
  return fetch(base + "/api/webhooks/sepay", {
    method: "POST",
    headers: {
      "content-type": contentType,
      "x-sepay-timestamp": timestamp,
      "x-sepay-signature": signature ?? sign(body, timestamp)
    },
    body
  });
}

test("HMAC accepts an exact raw-body signature within the timestamp window", () => {
  const body = Buffer.from('{"event":"transfer"}');
  const ts = String(Math.floor(FIXED_NOW / 1000));
  assert.equal(verifySePayWebhook(body, ts, sign(body, ts), WEBHOOK_SECRET, FIXED_NOW), true);
});

test("HMAC rejects a modified body, wrong secret, malformed headers and stale timestamps", () => {
  const body = Buffer.from('{"event":"transfer"}');
  const ts = String(Math.floor(FIXED_NOW / 1000));
  assert.equal(verifySePayWebhook(Buffer.from('{"event":"tampered"}'), ts, sign(body, ts), WEBHOOK_SECRET, FIXED_NOW), false);
  assert.equal(verifySePayWebhook(body, ts, sign(body, ts, "x".repeat(40)), WEBHOOK_SECRET, FIXED_NOW), false);
  assert.equal(verifySePayWebhook(body, "not-a-timestamp", sign(body, ts), WEBHOOK_SECRET, FIXED_NOW), false);
  assert.equal(verifySePayWebhook(body, ts, "sha256=abc", WEBHOOK_SECRET, FIXED_NOW), false);
  assert.equal(verifySePayWebhook(body, String(Number(ts) - 301), sign(body, String(Number(ts) - 301)), WEBHOOK_SECRET, FIXED_NOW), false);
  assert.equal(verifySePayWebhook(body, String(Number(ts) + 301), sign(body, String(Number(ts) + 301)), WEBHOOK_SECRET, FIXED_NOW), false);
  assert.equal(verifySePayWebhook(body, ts, sign(body, ts), "short", FIXED_NOW), false);
});

test("health endpoint is unauthenticated, non-sensitive and has defensive headers", async t => {
  const base = await startServer(t, { clock: () => FIXED_NOW });
  const res = await fetch(base + "/healthz");
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: "ok", environment: "sepay-sandbox", connected: false });
  assert.equal(res.headers.get("cache-control"), "no-store");
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.match(res.headers.get("content-security-policy"), /default-src 'none'/);
});

test("unknown route returns 404 and transaction endpoint rejects non-GET", async t => {
  const base = await startServer(t);
  assert.equal((await fetch(base + "/missing")).status, 404);
  assert.equal((await fetch(base + "/api/transactions", { method: "POST" })).status, 405);
});

test("transactions endpoint rejects absent and malformed internal bearer credentials", async t => {
  const base = await startServer(t, { env: {
    NHT_INTERNAL_ACCESS_TOKEN: INTERNAL_TOKEN,
    SEPAY_SANDBOX_TOKEN: "sandbox-token",
    NHT_SANDBOX_BANK_ACCOUNT_ID: ACCOUNT_ID
  }});
  assert.equal((await fetch(base + "/api/transactions")).status, 401);
  assert.equal((await fetch(base + "/api/transactions", {
    headers: { authorization: "Bearer short" }
  })).status, 401);
  assert.equal((await fetch(base + "/api/transactions", {
    headers: { authorization: "bearer " + INTERNAL_TOKEN }
  })).status, 401);
});

test("transactions endpoint fails closed when sandbox configuration is missing or invalid", async t => {
  const base = await startServer(t, { env: { NHT_INTERNAL_ACCESS_TOKEN: INTERNAL_TOKEN }});
  const res = await fetch(base + "/api/transactions", {
    headers: { authorization: "Bearer " + INTERNAL_TOKEN }
  });
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { error: "sandbox_not_configured" });
});

test("transactions endpoint calls only the fixed sandbox provider with bounded query and redirect rejection", async t => {
  let captured;
  const env = {
    NHT_INTERNAL_ACCESS_TOKEN: INTERNAL_TOKEN,
    SEPAY_SANDBOX_TOKEN: "sandbox-token",
    NHT_SANDBOX_BANK_ACCOUNT_ID: ACCOUNT_ID
  };
  const fetchImpl = async (url, options) => {
    captured = { url: new URL(url), options };
    return {
      ok: true,
      json: async () => ({
        status: "success",
        data: [{
          id: TX_ID,
          bank_account_id: ACCOUNT_ID,
          transfer_type: "in",
          amount_in: 125000,
          amount_out: 0,
          transaction_content: "TEST inbound",
          transaction_date: "2026-10-31T10:00:00+07:00"
        }]
      })
    };
  };
  const base = await startServer(t, { env, fetchImpl });
  const res = await fetch(base + "/api/transactions", {
    headers: { authorization: "Bearer " + INTERNAL_TOKEN }
  });
  assert.equal(res.status, 200);
  const payload = await res.json();
  assert.equal(payload.environment, "sandbox");
  assert.equal(payload.balance, null);
  assert.equal(payload.transactions.length, 1);
  assert.equal(payload.transactions[0].amount, 125000);
  assert.equal(captured.url.origin, "https://userapi-sandbox.sepay.vn");
  assert.equal(captured.url.pathname, "/v2/transactions");
  assert.equal(captured.url.searchParams.get("bank_account_id"), ACCOUNT_ID);
  assert.equal(captured.url.searchParams.get("per_page"), "20");
  assert.equal(captured.options.headers.Authorization, "Bearer sandbox-token");
  assert.equal(captured.options.redirect, "error");
  assert.ok(captured.options.signal);
});

test("transactions endpoint rejects provider records outside the configured sandbox account", async t => {
  const env = {
    NHT_INTERNAL_ACCESS_TOKEN: INTERNAL_TOKEN,
    SEPAY_SANDBOX_TOKEN: "sandbox-token",
    NHT_SANDBOX_BANK_ACCOUNT_ID: ACCOUNT_ID
  };
  const base = await startServer(t, {
    env,
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({
        status: "success",
        data: [{
          id: TX_ID, bank_account_id: randomUUID(), transfer_type: "in",
          amount_in: 100, amount_out: 0,
          transaction_date: "2026-10-31T10:00:00+07:00"
        }]
      })
    })
  });
  const res = await fetch(base + "/api/transactions", {
    headers: { authorization: "Bearer " + INTERNAL_TOKEN }
  });
  assert.equal(res.status, 502);
  assert.deepEqual(await res.json(), { error: "sandbox_account_scope_mismatch" });
});

test("transactions endpoint hides upstream errors and malformed payloads", async t => {
  const env = {
    NHT_INTERNAL_ACCESS_TOKEN: INTERNAL_TOKEN,
    SEPAY_SANDBOX_TOKEN: "sandbox-token",
    NHT_SANDBOX_BANK_ACCOUNT_ID: ACCOUNT_ID
  };
  const failed = await startServer(t, { env, fetchImpl: async () => ({ ok: false, status: 500 }) });
  const failedRes = await fetch(failed + "/api/transactions", {
    headers: { authorization: "Bearer " + INTERNAL_TOKEN }
  });
  assert.equal(failedRes.status, 502);
  assert.deepEqual(await failedRes.json(), { error: "sandbox_provider_unavailable" });

  const invalid = await startServer(t, { env, fetchImpl: async () => ({ ok: true, json: async () => ({ status: "error", data: [] }) }) });
  const invalidRes = await fetch(invalid + "/api/transactions", {
    headers: { authorization: "Bearer " + INTERNAL_TOKEN }
  });
  assert.equal(invalidRes.status, 502);
  assert.deepEqual(await invalidRes.json(), { error: "sandbox_invalid_response" });
});

test("webhook refuses to ACK a valid signature before durable storage exists", async t => {
  const env = { SEPAY_WEBHOOK_SECRET: WEBHOOK_SECRET };
  const base = await startServer(t, { env, clock: () => FIXED_NOW });
  const body = Buffer.from('{"id":"event-1"}');
  const res = await postWebhook(base, { body });
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { error: "durable_webhook_storage_not_configured" });
});

test("webhook rejects invalid HMAC without exposing details", async t => {
  const base = await startServer(t, {
    env: { SEPAY_WEBHOOK_SECRET: WEBHOOK_SECRET },
    clock: () => FIXED_NOW
  });
  const body = Buffer.from('{"id":"event-1"}');
  const ts = String(Math.floor(FIXED_NOW / 1000));
  const res = await postWebhook(base, { body, timestamp: ts, signature: "sha256=" + "0".repeat(64) });
  assert.equal(res.status, 401);
  assert.deepEqual(await res.json(), { error: "invalid_webhook_signature" });
});

test("webhook requires configured secret and strict JSON media type", async t => {
  const unconfigured = await startServer(t, { env: {} });
  const noSecret = await fetch(unconfigured + "/api/webhooks/sepay", {
    method: "POST", headers: { "content-type": "application/json" }, body: "{}"
  });
  assert.equal(noSecret.status, 503);
  assert.deepEqual(await noSecret.json(), { error: "webhook_not_configured" });

  const configured = await startServer(t, { env: { SEPAY_WEBHOOK_SECRET: WEBHOOK_SECRET }, clock: () => FIXED_NOW });
  const badType = await postWebhook(configured, { contentType: "application/jsonp" });
  assert.equal(badType.status, 415);
  const plainText = await postWebhook(configured, { contentType: "text/plain" });
  assert.equal(plainText.status, 415);
});

test("webhook enforces the raw request body size ceiling", async t => {
  const base = await startServer(t, {
    env: { SEPAY_WEBHOOK_SECRET: WEBHOOK_SECRET },
    clock: () => FIXED_NOW
  });
  const body = Buffer.alloc(65_537, 0x61);
  const res = await postWebhook(base, { body });
  assert.equal(res.status, 413);
  assert.deepEqual(await res.json(), { error: "body_too_large" });
});

test("webhook route rejects non-POST requests", async t => {
  const base = await startServer(t);
  assert.equal((await fetch(base + "/api/webhooks/sepay")).status, 405);
});

test("sandbox HTTP server applies bounded request/header/keep-alive settings", () => {
  const server = createSandboxServer();
  assert.equal(server.requestTimeout, 15_000);
  assert.equal(server.headersTimeout, 10_000);
  assert.equal(server.keepAliveTimeout, 5_000);
  assert.equal(server.maxHeadersCount, 50);
});
