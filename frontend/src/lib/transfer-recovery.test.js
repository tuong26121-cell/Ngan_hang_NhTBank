import { describe, it, expect, vi } from "vitest";
import { createTransferRecovery } from "./transfer-recovery.js";
const form = {
  bank: "MB Bank",
  account: "123456789",
  recipient: "Người nhận mẫu",
  amount: "100000",
  note: "Thử mất phản hồi",
};
function setup() {
  const data = new Map(),
    storage = {
      getItem: (key) => data.get(key) || null,
      setItem: (key, value) => data.set(key, value),
      removeItem: (key) => data.delete(key),
    };
  let queue = Promise.resolve();
  const locks = {
    request: (name, fn) => {
      const next = queue.then(fn);
      queue = next.catch(() => {});
      return next;
    },
  };
  const result = { id: "NHT-TEST", status: "posted" };
  const send = vi.fn(async () => result),
    lookup = vi.fn(async (key) => ({ key, status: "not_found" }));
  const options = {
    storage,
    locks,
    send,
    lookup,
    scope: "origin:demo-customer",
  };
  return {
    data,
    options,
    result,
    send,
    lookup,
    manager: createTransferRecovery(options),
  };
}
describe("durable transfer intent", () => {
  it("saves before sending, reloads the same key, and reads a committed result without resending", async () => {
    const { manager, options, send, lookup, result } = setup();
    send.mockImplementationOnce(async () => {
      expect(manager.read().command.amount).toBe("100000");
      throw new Error("lost response");
    });
    await expect(manager.submit(form, "123456")).rejects.toThrow(
      "lost response",
    );
    const old = manager.read();
    expect(JSON.stringify(old)).not.toContain('123456"'); // PIN is never persisted.
    const reloaded = createTransferRecovery(options);
    lookup.mockImplementation(async (key) => ({
      key,
      status: "posted",
      result,
    }));
    expect((await reloaded.check()).result).toEqual(result);
    expect(reloaded.read().key).toBe(old.key);
    expect(send).toHaveBeenCalledTimes(1);
    await reloaded.clear();
    expect(reloaded.read()).toBeNull();
  });
  it("only replays saved content after not_found and persists a server rejection", async () => {
    const { manager, send, lookup } = setup();
    send.mockRejectedValueOnce(new Error("offline"));
    await expect(manager.submit(form, "123456")).rejects.toThrow();
    const key = manager.read().key;
    await expect(
      manager.submit({ ...form, amount: "200000" }, "123456"),
    ).rejects.toMatchObject({ code: "PENDING_REQUEST" });
    await manager.submit(form, "123456");
    expect(send.mock.calls[1][1]).toBe(key);
    expect(lookup).toHaveBeenCalledWith(key);
    lookup.mockImplementation(async (key) => ({
      key,
      status: "rejected",
      error: { code: "LIMIT_EXCEEDED", message: "Vượt hạn mức" },
    }));
    expect((await manager.check()).status).toBe("rejected");
  });
  it("accepted is not resent and an unresolved intent cannot be discarded", async () => {
    const { manager, send, lookup } = setup();
    send.mockRejectedValueOnce(new Error("offline"));
    await expect(manager.submit(form, "123456")).rejects.toThrow();
    lookup.mockImplementation(async (key) => ({ key, status: "accepted" }));
    expect((await manager.submit(form, "123456")).status).toBe("accepted");
    expect(send).toHaveBeenCalledTimes(1);
    await expect(manager.clear()).rejects.toMatchObject({
      code: "UNRESOLVED_REQUEST",
    });
  });
  it("two tabs serialize one intent and never create a new key for a pending command", async () => {
    const { manager, options, send, lookup, result } = setup();
    lookup.mockImplementation(async (key) => ({
      key,
      status: "posted",
      result,
    }));
    const other = createTransferRecovery(options);
    await Promise.all([
      manager.submit(form, "123456"),
      other.submit(form, "123456"),
    ]);
    expect(send).toHaveBeenCalledTimes(1);
  });
  it("blocked storage, corrupt intent and absent locks fail before sending", async () => {
    const { options, send, manager, data } = setup();
    const blocked = createTransferRecovery({
      ...options,
      storage: {
        getItem: () => null,
        setItem: () => {
          throw Error();
        },
      },
    });
    await expect(blocked.submit(form, "123456")).rejects.toMatchObject({
      code: "RECOVERY_STORAGE_REQUIRED",
    });
    data.set(manager.storageKey, "bad json");
    expect(() => manager.read()).toThrow();
    const unsupported = createTransferRecovery({ ...options, locks: null });
    expect(() => unsupported.submit(form, "123456")).toThrow();
    expect(send).not.toHaveBeenCalled();
  });
  it("a stale retry in another tab cannot create a new intent after the result was closed", async () => {
    const { manager, options, send, lookup, result } = setup();
    await manager.submit(form, "123456");
    const key = manager.read().key;
    const other = createTransferRecovery(options);
    await manager.clear();
    await expect(other.submit(form, "123456", key)).rejects.toMatchObject({
      code: "REQUEST_CHANGED",
    });
    expect(send).toHaveBeenCalledTimes(1);
  });
});
