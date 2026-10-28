import { createTransferRecovery } from "./transfer-recovery.js";
import {
  createMemoryStore,
  DEMO_IDENTITIES,
  BankingError,
  PRIMARY_ACCOUNT,
} from "../../../packages/banking-core/model.js";
import { createPlatform } from "../../../packages/banking-core/platform.js";
import { createMemorySnapshots } from "../../../packages/banking-core/snapshots.js";
export { DEMO_IDENTITIES, PRIMARY_ACCOUNT };
export function createPlatformClient({
  mode = new URLSearchParams(window.location.search).get("runtime") === "server"
    ? "server"
    : "memory",
} = {}) {
  let store = createMemoryStore(),
    platform = createPlatform(store, { labEnabled: true }),
    snapshots = createMemorySnapshots(store),
    actor = null,
    csrf = null;
  const listeners = new Set();
  const notify = () => listeners.forEach((fn) => fn());
  let recovery;
  function getRecovery() {
    if (mode !== "server" || !actor || actor.role !== "customer") return null;
    if (recovery?.actorId === actor.id) return recovery.manager;
    let storage;
    try {
      storage = window.localStorage;
    } catch {
      storage = {
        getItem() {
          throw Error();
        },
      };
    }
    const manager = createTransferRecovery({
      storage,
      scope: window.location.origin + ":" + actor.id,
      locks: navigator.locks,
      send: (form, key, pin) => client.transfer(form, key, pin),
      lookup: (key) => client.lookup(key),
      notify,
    });
    recovery = { actorId: actor.id, manager };
    return manager;
  }
  async function request(path, method = "GET", body, key) {
    let response;
    const controller = new AbortController(),
      timeout = setTimeout(() => controller.abort(), 12000);
    try {
      response = await fetch("/api/v1" + path, {
        method,
        signal: controller.signal,
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          ...(csrf ? { "X-CSRF-Token": csrf } : {}),
          ...(key ? { "Idempotency-Key": key } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      });
    } catch {
      clearTimeout(timeout);
      throw new BankingError(
        "CONNECTION_UNKNOWN",
        "Chưa nhận được kết quả máy chủ. Gửi lại cùng nội dung sẽ dùng lại mã chống lặp; đừng tạo lệnh khác khi chưa kiểm tra.",
        503,
      );
    }
    let data;
    try {
      data = await response.json();
    } catch {
      clearTimeout(timeout);
      throw new BankingError(
        "INVALID_RESPONSE",
        "Máy chủ chưa trả JSON hợp lệ. Kiểm tra backend và chế độ kết nối.",
        503,
      );
    }
    clearTimeout(timeout);
    if (!response.ok)
      throw new BankingError(
        data.error?.code || "REQUEST_FAILED",
        data.error?.message || "Không xử lý được yêu cầu.",
        response.status,
      );
    return data;
  }
  const client = {
    mode,
    getRecovery,
    subscribeRecovery(fn) {
      listeners.add(fn);
      window.addEventListener("storage", fn);
      return () => {
        listeners.delete(fn);
        window.removeEventListener("storage", fn);
      };
    },
    lookup(key) {
      return mode === "server"
        ? request("/transfer-requests/" + encodeURIComponent(key))
        : platform.lookup(actor, key);
    },
    login(identity = "customer", pin = "123456") {
      if (mode === "server")
        return request("/session", "POST", { identity, pin }).then((data) => {
          actor = data.actor;
          csrf = data.csrf;
          return client.snapshot();
        });
      if (pin !== "123456" || !Object.hasOwn(DEMO_IDENTITIES, identity))
        throw new BankingError("INVALID_PIN", "PIN mô phỏng chưa đúng.", 401);
      actor = { ...DEMO_IDENTITIES[identity], expiresAt: Date.now() + 1800000 };
      return client.snapshot();
    },
    resume() {
      if (mode !== "server") return null;
      return request("/session").then((data) => {
        actor = data.actor;
        csrf = data.csrf;
        return client.snapshot();
      });
    },
    snapshot() {
      return mode === "server"
        ? request("/snapshot")
        : platform.snapshot(actor);
    },
    transfer(form, key, pin = "123456") {
      return mode === "server"
        ? request("/transfers", "POST", { ...form, pin }, key)
        : platform.transfer(actor, form, key);
    },
    logout() {
      if (mode === "server")
        return request("/session", "DELETE").then(() => {
          actor = null;
          csrf = null;
        });
      store = createMemoryStore();
      platform = createPlatform(store, { labEnabled: true });
      snapshots = createMemorySnapshots(store);
      actor = null;
    },
    action(name, args = {}) {
      if (mode === "server") {
        const routes = {
          reversal: [
            `/transfers/${args.id}/reversal-proposals`,
            { reason: args.reason },
          ],
          reconcile: ["/reconciliations", {}],
          dispatch: ["/outbox/dispatch", {}],
          inject: ["/lab/projection-drift", {}],
          propose: [`/incidents/${args.id}/proposals`, { reason: args.reason }],
          approve: [`/proposals/${args.id}/approve`, { reason: args.reason }],
          reject: [`/proposals/${args.id}/reject`, { reason: args.reason }],
          backup: ["/backups", {}],
          drill: [`/backups/${args.id}/drill`, {}],
        };
        if (!routes[name]) throw new Error("Unknown platform action");
        return request(routes[name][0], "POST", routes[name][1]);
      }
      switch (name) {
        case "reversal":
          return platform.proposeReversal(actor, args.id, args.reason);
        case "reconcile":
          return platform.reconcile(actor);
        case "dispatch":
          return platform.dispatch(actor);
        case "inject":
          return platform.injectDrift(actor);
        case "propose":
          return platform.propose(actor, args.id, args.reason);
        case "approve":
          return platform.decide(actor, args.id, true, args.reason);
        case "reject":
          return platform.decide(actor, args.id, false, args.reason);
        case "backup":
          return snapshots.create(actor);
        case "drill":
          return snapshots.drill(actor, args.id);
        default:
          throw new Error("Unknown platform action");
      }
    },
  };
  return client;
}
