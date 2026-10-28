import { BankingError } from "../../../packages/banking-core/model.js";
import {
  normalizeCommand,
  validateKey,
} from "../../../packages/banking-core/commands.js";
const fail = (code, message) => {
  throw new BankingError(code, message, 409);
};
export function createTransferRecovery({
  storage,
  scope,
  locks,
  send,
  lookup,
  clock = () => Date.now(),
  newKey = () => crypto.randomUUID(),
  notify = () => {},
}) {
  const storageKey = "nhtbank:transfer-v2:" + scope;
  function read() {
    try {
      const raw = storage.getItem(storageKey);
      if (!raw) return null;
      const row = JSON.parse(raw);
      validateKey(row.key);
      if (
        row.version !== 1 ||
        row.scope !== scope ||
        row.fingerprint !== JSON.stringify(normalizeCommand(row.command)) ||
        !["unknown", "accepted", "not_found", "posted", "rejected"].includes(
          row.status,
        )
      )
        throw Error();
      return row;
    } catch {
      fail(
        "RECOVERY_STORAGE_INVALID",
        "Không đọc được hồ sơ yêu cầu đã lưu. Chưa gửi thêm giao dịch; kiểm tra lịch sử và liên hệ vận hành trước khi xóa dữ liệu trình duyệt.",
      );
    }
  }
  function write(row) {
    try {
      const raw = JSON.stringify(row);
      storage.setItem(storageKey, raw);
      if (storage.getItem(storageKey) !== raw) throw Error();
    } catch {
      fail(
        "RECOVERY_STORAGE_REQUIRED",
        "Không lưu được hồ sơ yêu cầu trên thiết bị. Chưa tạo mã khác; hãy giữ mã hiện tại và kiểm tra lịch sử trước khi thử tiếp.",
      );
    }
    notify();
    return row;
  }
  function exclusive(fn) {
    if (!locks?.request)
      fail(
        "RECOVERY_LOCK_REQUIRED",
        "Trình duyệt cần hỗ trợ Web Locks trên HTTPS hoặc localhost để chống tạo lệnh trùng giữa các tab.",
      );
    return locks.request(storageKey, fn);
  }
  function saveOutcome(row, outcome) {
    if (
      !["posted", "rejected", "accepted", "not_found"].includes(
        outcome?.status,
      ) ||
      outcome.key !== row.key ||
      (outcome.status === "posted" &&
        (!outcome.result?.id || outcome.result.status !== "posted")) ||
      (outcome.status === "rejected" && !outcome.error?.code)
    )
      fail(
        "CONNECTION_UNKNOWN",
        "Kết quả máy chủ chưa hợp lệ; giữ nguyên mã yêu cầu để kiểm tra lại.",
      );
    return write({
      ...row,
      status: outcome.status,
      checkedAt: clock(),
      result: outcome.result,
      error: outcome.error,
    });
  }
  async function checkCurrent() {
    const row = read();
    if (!row) return null;
    return saveOutcome(row, await lookup(row.key));
  }
  return {
    storageKey,
    read,
    check: () => exclusive(checkCurrent),
    submit: (form, pin, expectedKey) =>
      exclusive(async () => {
        const command = normalizeCommand(form),
          fingerprint = JSON.stringify(command);
        let row = read(),
          fresh = !row;
        if (expectedKey && row?.key !== expectedKey)
          fail(
            "REQUEST_CHANGED",
            "Yêu cầu đã đóng hoặc thay đổi ở tab khác. Kiểm tra lịch sử; chưa gửi thêm lệnh.",
          );
        if (row && row.fingerprint !== fingerprint)
          fail(
            "PENDING_REQUEST",
            "Còn yêu cầu đã lưu. Hoàn tất tra cứu và đóng kết quả trước khi tạo lệnh khác.",
          );
        if (!row)
          row = write({
            version: 1,
            scope,
            key: newKey(),
            command,
            fingerprint,
            status: "unknown",
            createdAt: clock(),
          });
        if (!fresh) {
          row = await checkCurrent();
          if (row.status !== "not_found") return row;
        }
        // The exact saved command/key, never PIN/session/token, survives navigation and reload.
        try {
          const result = await send(row.command, row.key, pin);
          return saveOutcome(row, { key: row.key, status: "posted", result });
        } catch (error) {
          if (
            error.status >= 400 &&
            error.status < 500 &&
            error.code !== "SESSION_EXPIRED"
          ) {
            try {
              const found = await lookup(row.key);
              if (["posted", "rejected", "accepted"].includes(found.status))
                return saveOutcome(row, found);
            } catch {
              /* Preserve the intent when lookup itself is unavailable. */
            }
          }
          // Even a 4xx response may be from a gateway/session boundary: only lookup closes the intent.
          write({
            ...row,
            status: "unknown",
            lastError: error.code || "CONNECTION_UNKNOWN",
          });
          throw error;
        }
      }),
    clear: () =>
      exclusive(() => {
        const row = read();
        if (row && !["posted", "rejected"].includes(row.status))
          fail(
            "UNRESOLVED_REQUEST",
            "Chưa có kết quả cuối từ máy chủ; không thể tạo mã khác.",
          );
        storage.removeItem(storageKey);
        notify();
      }),
  };
}
