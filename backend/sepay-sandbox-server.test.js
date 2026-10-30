// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { createHmac } from "node:crypto";
import { createSandboxServer, verifySePayWebhook } from "./sepay-sandbox-server.mjs";

const ACCESS = "access-token-" + "a".repeat(48);
const SEPAY = "sandbox-token-example-only";
const SECRET = "webhook-secret-" + "w".repeat(40);
const ACCOUNT = "f9e8d7c6-b5a4-3210-fedc-ba0987654321";
const TX = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  bank_account_id: ACCOUNT,
  transfer_type: "in",
  amount_in: 120000,
  amount_out: 0,
  transaction_date: "2026-10-29T10:00:00+07:00",
  transaction_content: "Sandbox test",
};
const NOW = Date.UTC(2026, 9, 29, 10, 0, 0);
const open = [];
async function launch(env = {}, fetchImpl = vi.fn()) {
  const server = createSandboxServer({
    env: { NHT_INTERNAL_ACCESS_TOKEN: ACCESS, SEPAY_SANDBOX_TOKEN: SEPAY,
      NHT_SANDBOX_BANK_ACCOUNT_ID: ACCOUNT, ...env },
    fetchImpl, clock: () => NOW,
  });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  open.push(server);
  return "http://127.0.0.1:" + server.address().port;
}
const auth = { Authorization: "Bearer " + ACCESS };
function sign(raw, timestamp, secret = SECRET) {
  return "sha256=" + createHmac("sha256", secret)
    .update(String(timestamp) + ".").update(raw).digest("hex");
}
afterEach(async () => {
  for (const server of open.splice(0)) await new Promise(resolve => server.close(resolve));
});

describe("Sandbox gateway security boundary", () => {
  it("exposes non-sensitive health and no cache or cross-origin access", async () => {
    const base = await launch();
    const res = await fetch(base + "/healthz");
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("access-control-allow-origin")).toBeNull();
    expect(await res.json()).toEqual({ status: "ok", environment: "sepay-sandbox", connected: false });
  });
  it("rejects unauthorized data reads before calling provider", async () => {
    const upstream = vi.fn();
    const base = await launch({}, upstream);
    for (const header of [undefined, "Bearer wrong", "Basic " + ACCESS]) {
      const res = await fetch(base + "/api/transactions", {
        headers: header ? { Authorization: header } : {},
      });
      expect(res.status).toBe(401);
    }
    expect(upstream).not.toHaveBeenCalled();
  });
  it("fails closed when required configuration is absent", async () => {
    const base = await launch({ NHT_SANDBOX_BANK_ACCOUNT_ID: "" });
    const response = await fetch(base + "/api/transactions", { headers: auth });
    expect(response.status).toBe(503);
  });
  it("uses only fixed sandbox endpoint, scoped account and server-side token", async () => {
    const upstream = vi.fn(async () =>
      new Response(JSON.stringify({ status: "success", data: [TX, { ...TX }] }), { status: 200 }));
    const base = await launch({}, upstream);
    const res = await fetch(base + "/api/transactions?bank_account_id=evil&per_page=100", { headers: auth });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.balance).toBeNull();
    expect(data.transactions).toHaveLength(1);
    expect(data.transactions[0].amount).toBe(120000);
    expect(JSON.stringify(data)).not.toContain(SEPAY);
    const [url, options] = upstream.mock.calls[0];
    expect(url.hostname).toBe("userapi-sandbox.sepay.vn");
    expect(url.searchParams.get("bank_account_id")).toBe(ACCOUNT);
    expect(url.searchParams.get("per_page")).toBe("20");
    expect(options.headers.Authorization).toBe("Bearer " + SEPAY);
  });
  it("rejects records outside the authorized account", async () => {
    const upstream = vi.fn(async () => new Response(JSON.stringify({
      status: "success", data: [{ ...TX, bank_account_id: "00000000-0000-0000-0000-000000000000" }],
    })));
    const base = await launch({}, upstream);
    const res = await fetch(base + "/api/transactions", { headers: auth });
    expect(res.status).toBe(502);
    expect((await res.json()).error).toBe("sandbox_account_scope_mismatch");
  });
  it("rejects malformed provider data without leaking records", async () => {
    const upstream = vi.fn(async () => new Response(JSON.stringify({ status: "success", data: "bad" })));
    const base = await launch({}, upstream);
    expect((await fetch(base + "/api/transactions", { headers: auth })).status).toBe(502);
  });
  it("hides upstream exceptions and failure details", async () => {
    const upstream = vi.fn(async () => { throw new Error("Do not leak secret"); });
    const base = await launch({}, upstream);
    const res = await fetch(base + "/api/transactions", { headers: auth });
    expect(res.status).toBe(502);
    expect(await res.text()).not.toContain("Do not leak secret");
  });
  it("blocks unsupported HTTP methods and routes", async () => {
    const base = await launch();
    expect((await fetch(base + "/api/transactions", { method: "POST" })).status).toBe(405);
    expect((await fetch(base + "/unknown")).status).toBe(404);
  });
  it("verifies raw SePay body, timestamp window and constant-time HMAC", () => {
    const timestamp = Math.floor(NOW / 1000);
    const raw = Buffer.from('{"note":"Tiếng Việt", "amount":100}', "utf8");
    const sig = sign(raw, timestamp);
    expect(verifySePayWebhook(raw, timestamp, sig, SECRET, NOW)).toBe(true);
    expect(verifySePayWebhook(Buffer.from('{"amount":100,"note":"Tiếng Việt"}'), timestamp, sig, SECRET, NOW)).toBe(false);
    expect(verifySePayWebhook(raw, timestamp - 301, sign(raw, timestamp - 301), SECRET, NOW)).toBe(false);
    expect(verifySePayWebhook(raw, timestamp, "sha256=" + "0".repeat(64), SECRET, NOW)).toBe(false);
    expect(verifySePayWebhook(raw, timestamp, sig, "wrong", NOW)).toBe(false);
  });
  it("never ACKs webhook without durable storage, even for valid signature", async () => {
    const base = await launch({ SEPAY_WEBHOOK_SECRET: SECRET });
    const raw = JSON.stringify(TX);
    const timestamp = Math.floor(NOW / 1000);
    const bad = await fetch(base + "/api/webhooks/sepay", {
      method: "POST", headers: { "Content-Type": "application/json",
        "X-SePay-Timestamp": String(timestamp), "X-SePay-Signature": "sha256=" + "0".repeat(64) }, body: raw,
    });
    expect(bad.status).toBe(401);
    const good = await fetch(base + "/api/webhooks/sepay", {
      method: "POST", headers: { "Content-Type": "application/json",
        "X-SePay-Timestamp": String(timestamp), "X-SePay-Signature": sign(Buffer.from(raw), timestamp) }, body: raw,
    });
    expect(good.status).toBe(503);
    expect((await good.json()).error).toBe("durable_webhook_storage_not_configured");
  });
  it("caps webhook request body size", async () => {
    const base = await launch({ SEPAY_WEBHOOK_SECRET: SECRET });
    const res = await fetch(base + "/api/webhooks/sepay", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "a".repeat(65537),
    });
    expect(res.status).toBe(413);
  });
  it("rejects webhook unless its secret is provisioned", async () => {
    const base = await launch();
    const res = await fetch(base + "/api/webhooks/sepay", { method: "POST",
      headers: { "Content-Type": "application/json" }, body: "{}" });
    expect(res.status).toBe(503);
  });
});
