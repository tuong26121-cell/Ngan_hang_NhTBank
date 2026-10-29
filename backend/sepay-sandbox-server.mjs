/**
 * NhTBank read-only SePay TEST MODE gateway.
 * Not a bank backend. No real account data, payments, or frontend access tokens.
 * Node >=22. Run on loopback by default; use a TLS reverse proxy for any public host.
 */
import http from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";
import { pathToFileURL } from "node:url";
import { mapSePayV2Transactions } from "../frontend/src/lib/sepayAdapter.js";

const SANDBOX_URL = "https://userapi-sandbox.sepay.vn/v2/transactions";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BODY_BYTES = 65536;
const headers = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "Referrer-Policy": "no-referrer",
};

function reply(res, status, value) {
  res.writeHead(status, headers);
  res.end(JSON.stringify(value));
}

function hasBearer(header, secret) {
  if (typeof secret !== "string" || secret.length < 32) return false;
  const match = typeof header === "string" && /^Bearer ([A-Za-z0-9._~-]+)$/.exec(header);
  if (!match) return false;
  const provided = Buffer.from(match[1], "utf8");
  const expected = Buffer.from(secret, "utf8");
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export function verifySePayWebhook(rawBody, timestamp, signature, secret, nowMs = Date.now()) {
  if (!Buffer.isBuffer(rawBody) || typeof secret !== "string" || secret.length < 32) return false;
  if (!/^\d{10}$/.test(String(timestamp)) || !/^sha256=[0-9a-f]{64}$/i.test(String(signature))) return false;
  const seconds = Number(timestamp);
  if (!Number.isSafeInteger(seconds) || Math.abs(Math.floor(nowMs / 1000) - seconds) > 300) return false;
  const expected = createHmac("sha256", secret)
    .update(String(timestamp) + ".")
    .update(rawBody)
    .digest();
  const provided = Buffer.from(String(signature).slice(7), "hex");
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

async function rawBody(req) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BODY_BYTES) throw new Error("body_too_large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export function createSandboxHandler({ env = process.env, fetchImpl = globalThis.fetch, clock = Date.now } = {}) {
  return async (req, res) => {
    const path = new URL(req.url || "/", "http://localhost").pathname;
    if (path === "/healthz" && req.method === "GET") {
      return reply(res, 200, { status: "ok", environment: "sepay-sandbox", connected: false });
    }
    if (path === "/api/transactions") {
      if (req.method !== "GET") return reply(res, 405, { error: "method_not_allowed" });
      // This is SERVER-TO-SERVER auth, not for use in public frontend JavaScript.
      if (!hasBearer(req.headers.authorization, env.NHT_INTERNAL_ACCESS_TOKEN)) {
        return reply(res, 401, { error: "unauthorized" });
      }
      if (!env.SEPAY_SANDBOX_TOKEN || !UUID.test(env.NHT_SANDBOX_BANK_ACCOUNT_ID || "")) {
        return reply(res, 503, { error: "sandbox_not_configured" });
      }
      const target = new URL(SANDBOX_URL);
      target.searchParams.set("bank_account_id", env.NHT_SANDBOX_BANK_ACCOUNT_ID);
      target.searchParams.set("page", "1");
      target.searchParams.set("per_page", "20");
      target.searchParams.set("timestamp_format", "iso8601");
      target.searchParams.set("transaction_date_sort", "desc");
      try {
        const upstream = await fetchImpl(target, {
          headers: { Authorization: "Bearer " + env.SEPAY_SANDBOX_TOKEN, Accept: "application/json" },
          signal: AbortSignal.timeout(6000),
          redirect: "error",
        });
        if (!upstream.ok) return reply(res, 502, { error: "sandbox_provider_unavailable" });
        const payload = await upstream.json();
        if (!payload || payload.status !== "success" || !Array.isArray(payload.data) || payload.data.length > 20) {
          return reply(res, 502, { error: "sandbox_invalid_response" });
        }
        // Fail closed: never return any record outside the single authorized sandbox account.
        if (payload.data.some(x => !x || x.bank_account_id !== env.NHT_SANDBOX_BANK_ACCOUNT_ID)) {
          return reply(res, 502, { error: "sandbox_account_scope_mismatch" });
        }
        const transactions = mapSePayV2Transactions(payload.data);
        return reply(res, 200, { environment: "sandbox", balance: null, transactions });
      } catch {
        return reply(res, 502, { error: "sandbox_request_failed" });
      }
    }
    if (path === "/api/webhooks/sepay") {
      if (req.method !== "POST") return reply(res, 405, { error: "method_not_allowed" });
      // Do not ACK a webhook until durable persistence and idempotency are implemented.
      // Returning 503 encourages SePay to retry; never store events only in RAM.
      if (!env.SEPAY_WEBHOOK_SECRET || env.SEPAY_WEBHOOK_SECRET.length < 32) {
        return reply(res, 503, { error: "webhook_not_configured" });
      }
      if (!String(req.headers["content-type"] || "").toLowerCase().startsWith("application/json")) {
        return reply(res, 415, { error: "unsupported_media_type" });
      }
      let body;
      try { body = await rawBody(req); }
      catch { return reply(res, 413, { error: "body_too_large" }); }
      const ok = verifySePayWebhook(body, req.headers["x-sepay-timestamp"],
        req.headers["x-sepay-signature"], env.SEPAY_WEBHOOK_SECRET, clock());
      if (!ok) return reply(res, 401, { error: "invalid_webhook_signature" });
      return reply(res, 503, { error: "durable_webhook_storage_not_configured" });
    }
    return reply(res, 404, { error: "not_found" });
  };
}

export function createSandboxServer(options) {
  return http.createServer(createSandboxHandler(options));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const host = process.env.NHT_HOST || "127.0.0.1";
  const port = Number(process.env.NHT_PORT || 8787);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid port");
  createSandboxServer().listen(port, host, () => {
    process.stdout.write("NhTBank sandbox gateway listening on " + host + ":" + port + "\n");
  });
}
