import { createServer } from "node:http";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createSQLiteStore } from "./sqlite-store.js";
import { createBackupService } from "./backups.js";
import { createPlatform } from "../../packages/banking-core/platform.js";
import {
  BankingError,
  DEMO_IDENTITIES,
  SCHEMA_VERSION,
} from "../../packages/banking-core/model.js";
const root = resolve(fileURLToPath(new URL("../../", import.meta.url)));
const digest = (value) => createHash("sha256").update(value).digest("hex");
const same = (a, b) => {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
export function createServerApp({
  database = join(root, "backend/.data/ledger.sqlite"),
  backupDir = join(root, "backend/.data/backups"),
  port = 3001,
  frontendOrigins = ["http://127.0.0.1:5173", "http://localhost:5173"],
  labEnabled = false,
  worker = true,
  sessionTtlMs = 1800000,
  clock = () => Date.now(),
} = {}) {
  const store = createSQLiteStore(database),
    platform = createPlatform(store, { clock, labEnabled }),
    backups = createBackupService(store, backupDir),
    sessions = new Map(),
    failures = new Map();
  const origins = new Set([
    `http://127.0.0.1:${port}`,
    `http://localhost:${port}`,
    ...frontendOrigins,
  ]);
  function response(res, status, body, headers = {}) {
    res.writeHead(status, {
      "Content-Type": "application/json;charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...headers,
    });
    res.end(JSON.stringify(body));
  }
  async function json(req) {
    if (!req.headers["content-type"]?.startsWith("application/json"))
      throw new BankingError("JSON_REQUIRED", "Yêu cầu phải dùng JSON.", 415);
    return new Promise((resolve, reject) => {
      let size = 0,
        parts = [],
        tooLarge = false;
      req.on("data", (chunk) => {
        size += chunk.length;
        if (size > 16384) {
          tooLarge = true;
          parts = [];
        } else if (!tooLarge) parts.push(chunk);
      });
      req.on("error", () =>
        reject(
          new BankingError("BODY_READ_FAILED", "Không đọc được yêu cầu.", 400),
        ),
      );
      req.on("end", () => {
        if (tooLarge)
          return reject(
            new BankingError(
              "BODY_TOO_LARGE",
              "Nội dung yêu cầu quá lớn.",
              413,
            ),
          );
        try {
          const body = JSON.parse(Buffer.concat(parts).toString());
          if (!body || typeof body !== "object" || Array.isArray(body))
            throw Error();
          resolve(body);
        } catch {
          reject(new BankingError("INVALID_JSON", "JSON không hợp lệ."));
        }
      });
    });
  }

  function session(req) {
    const raw = req.headers.cookie
      ?.split(";")
      .map((v) => v.trim())
      .find((v) => v.startsWith("nht_session="))
      ?.slice(12);
    const value = raw && sessions.get(digest(raw));
    if (!value || value.actor.expiresAt <= clock()) {
      if (raw) sessions.delete(digest(raw));
      throw new BankingError(
        "SESSION_EXPIRED",
        "Phiên hết hạn hoặc chưa đăng nhập.",
        401,
      );
    }
    return value;
  }
  const secureCookie = process.env.NHT_COOKIE_SECURE === "1" ? "; Secure" : "";
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      if (!url.pathname.startsWith("/api/")) {
        if (req.method !== "GET")
          return response(res, 405, {
            error: {
              code: "METHOD_NOT_ALLOWED",
              message: "Phương thức không hỗ trợ.",
            },
          });
        const dist = join(root, "dist"),
          path =
            url.pathname === "/"
              ? join(dist, "index.html")
              : url.pathname.startsWith("/assets/") &&
                  /^\/assets\/[A-Za-z0-9_.-]+$/.test(url.pathname)
                ? join(dist, url.pathname)
                : null;
        if (!path || !existsSync(path))
          return response(res, 404, {
            error: {
              code: "WEB_NOT_BUILT",
              message:
                "Không tìm thấy trang. Chạy npm run build trước khi dùng bản máy chủ.",
            },
          });
        const content = readFileSync(path),
          type = path.endsWith(".js")
            ? "text/javascript"
            : path.endsWith(".css")
              ? "text/css"
              : path.endsWith(".ttf")
                ? "font/ttf"
                : "text/html";
        res.writeHead(200, {
          "Content-Type": type,
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "no-cache",
          "Content-Security-Policy":
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'",
        });
        res.end(content);
        return;
      }
      if (req.method === "GET" && url.pathname === "/api/v1/health")
        return response(res, 200, {
          status: "ok",
          mode: "sandbox",
          storage: "sqlite",
          schemaVersion: SCHEMA_VERSION,
        });
      if (
        req.method !== "GET" &&
        !origins.has(req.headers.origin) &&
        req.headers.origin !== `http://127.0.0.1:${req.socket.localPort}` &&
        req.headers.origin !== `http://localhost:${req.socket.localPort}`
      )
        throw new BankingError(
          "ORIGIN_REJECTED",
          "Nguồn yêu cầu không được phép.",
          403,
        );
      if (req.method === "POST" && url.pathname === "/api/v1/session") {
        const address = req.socket.remoteAddress || "local",
          old = failures.get(address);
        if (old && old.until > clock() && old.count >= 5)
          throw new BankingError(
            "LOGIN_RATE_LIMIT",
            "Đã thử PIN sai nhiều lần; chờ một phút rồi thử lại.",
            429,
          );
        const body = await json(req),
          identityKey = body.identity || "customer",
          identity = Object.hasOwn(DEMO_IDENTITIES, identityKey)
            ? DEMO_IDENTITIES[identityKey]
            : null;
        if (!identity || body.pin !== "123456") {
          if (failures.size > 1000) failures.clear();
          const record =
            old && old.until > clock()
              ? old
              : { count: 0, until: clock() + 60000 };
          record.count++;
          failures.set(address, record);
          throw new BankingError(
            "INVALID_PIN",
            "PIN hoặc tài khoản thử nghiệm không đúng.",
            401,
          );
        }
        failures.delete(address);
        for (const [key, s] of sessions)
          if (s.actor.expiresAt <= clock()) sessions.delete(key);
        if (sessions.size >= 10000)
          throw new BankingError(
            "SESSION_CAPACITY",
            "Máy chủ thử nghiệm đã đủ số phiên.",
            503,
          );
        const previous = req.headers.cookie
          ?.split(";")
          .map((v) => v.trim())
          .find((v) => v.startsWith("nht_session="))
          ?.slice(12);
        if (previous) sessions.delete(digest(previous));
        const token = randomBytes(32).toString("base64url"),
          csrf = randomBytes(24).toString("base64url"),
          actor = { ...identity, expiresAt: clock() + sessionTtlMs };
        sessions.set(digest(token), { actor, csrf });
        return response(
          res,
          200,
          { actor, csrf, mode: "sandbox" },
          {
            "Set-Cookie": `nht_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${Math.floor(sessionTtlMs / 1000)}${secureCookie}`,
          },
        );
      }
      const auth = session(req);
      if (req.method !== "GET" && !same(req.headers["x-csrf-token"], auth.csrf))
        throw new BankingError(
          "CSRF_REJECTED",
          "Thiếu mã bảo vệ yêu cầu của phiên.",
          403,
        );
      if (req.method === "GET" && url.pathname === "/api/v1/session")
        return response(res, 200, {
          actor: auth.actor,
          csrf: auth.csrf,
          mode: "sandbox",
        });
      if (req.method === "DELETE" && url.pathname === "/api/v1/session") {
        const raw = req.headers.cookie
          .split(";")
          .map((v) => v.trim())
          .find((v) => v.startsWith("nht_session="))
          .slice(12);
        sessions.delete(digest(raw));
        return response(
          res,
          200,
          { loggedOut: true },
          {
            "Set-Cookie": `nht_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secureCookie}`,
          },
        );
      }
      if (req.method === "GET" && url.pathname === "/api/v1/snapshot")
        return response(res, 200, platform.snapshot(auth.actor));
      let requestMatch = url.pathname.match(
        /^\/api\/v1\/transfer-requests\/([A-Za-z0-9_-]{16,100})$/,
      );
      if (req.method === "GET" && requestMatch)
        return response(res, 200, platform.lookup(auth.actor, requestMatch[1]));
      const reversalMatch = url.pathname.match(
        /^\/api\/v1\/transfers\/([A-Za-z0-9-]+)\/reversal-proposals$/,
      );
      if (req.method === "POST" && reversalMatch) {
        const body = await json(req);
        return response(
          res,
          200,
          platform.proposeReversal(auth.actor, reversalMatch[1], body.reason),
        );
      }
      if (req.method === "POST" && url.pathname === "/api/v1/transfers") {
        const body = await json(req);
        if (body.pin !== "123456")
          throw new BankingError(
            "INVALID_PIN",
            "Mã PIN xác nhận mô phỏng chưa đúng.",
            401,
          );
        return response(
          res,
          200,
          platform.transfer(auth.actor, body, req.headers["idempotency-key"]),
        );
      }
      if (req.method === "POST" && url.pathname === "/api/v1/reconciliations")
        return response(res, 200, platform.reconcile(auth.actor));
      if (req.method === "POST" && url.pathname === "/api/v1/outbox/dispatch")
        return response(res, 200, await platform.dispatch(auth.actor));
      if (
        req.method === "POST" &&
        url.pathname === "/api/v1/lab/projection-drift"
      )
        return response(res, 200, platform.injectDrift(auth.actor));
      let match = url.pathname.match(
        /^\/api\/v1\/incidents\/([A-Za-z0-9-]+)\/proposals$/,
      );
      if (req.method === "POST" && match) {
        const body = await json(req);
        return response(
          res,
          200,
          platform.propose(auth.actor, match[1], body.reason),
        );
      }
      match = url.pathname.match(
        /^\/api\/v1\/proposals\/([A-Za-z0-9-]+)\/(approve|reject)$/,
      );
      if (req.method === "POST" && match) {
        const body = await json(req);
        return response(
          res,
          200,
          platform.decide(
            auth.actor,
            match[1],
            match[2] === "approve",
            body.reason,
          ),
        );
      }
      if (req.method === "POST" && url.pathname === "/api/v1/backups")
        return response(res, 200, await backups.create(auth.actor));
      match = url.pathname.match(/^\/api\/v1\/backups\/([a-f0-9-]+)\/drill$/);
      if (req.method === "POST" && match)
        return response(res, 200, backups.drill(auth.actor, match[1]));
      return response(res, 404, {
        error: { code: "NOT_FOUND", message: "Không tìm thấy thao tác." },
      });
    } catch (error) {
      const known = error instanceof BankingError;
      response(res, known ? error.status : 500, {
        error: {
          code: known ? error.code : "INTERNAL_ERROR",
          message: known
            ? error.message
            : "Không xử lý được yêu cầu. Chưa có xác nhận ghi sổ; thử tra cứu hoặc gửi lại cùng mã chống lặp.",
        },
      });
    }
  });
  let inFlight = Promise.resolve();
  const timer = worker
    ? setInterval(() => {
        inFlight = inFlight
          .then(() =>
            platform.settleAccepted({
              id: "system-settlement",
              role: "operator",
              expiresAt: clock() + 60000,
            }),
          )
          .catch(() => {})
          .then(() =>
            platform.dispatch({
              id: "system-outbox",
              role: "operator",
              expiresAt: clock() + 60000,
            }),
          )
          .catch(() => {});
      }, 1000)
    : null;
  timer?.unref();
  return {
    server,
    store,
    platform,
    async close() {
      clearInterval(timer);
      await inFlight;
      await new Promise((resolve, reject) =>
        server.close((e) => (e ? reject(e) : resolve())),
      );
      store.close();
    },
  };
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const port = Number(process.env.NHT_PORT || 3001),
    app = createServerApp({
      port,
      database:
        process.env.NHT_DATABASE || join(root, "backend/.data/ledger.sqlite"),
      backupDir:
        process.env.NHT_BACKUP_DIR || join(root, "backend/.data/backups"),
      labEnabled: process.env.NHT_LAB_ENABLED === "1",
      frontendOrigins: (
        process.env.NHT_FRONTEND_ORIGINS ||
        "http://127.0.0.1:5173,http://localhost:5173"
      ).split(","),
    });
  app.server.listen(port, "127.0.0.1", () =>
    console.log(
      `NhTBank Sandbox SQLite: http://127.0.0.1:${port}/?runtime=server`,
    ),
  );
  for (const signal of ["SIGINT", "SIGTERM"])
    process.once(signal, () => app.close().then(() => process.exit(0)));
}
