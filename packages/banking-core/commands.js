import { BankingError, PRIMARY_ACCOUNT } from "./model.js";
export function validateKey(key) {
  if (typeof key !== "string" || !/^[A-Za-z0-9_-]{16,100}$/.test(key))
    throw new BankingError(
      "INVALID_KEY",
      "Mỗi lệnh cần mã chống gửi lặp hợp lệ.",
    );
}
export function normalizeCommand(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new BankingError("INVALID_COMMAND", "Lệnh giao dịch không hợp lệ.");
  return {
    accountId: input.accountId || PRIMARY_ACCOUNT,
    bank: String(input.bank || ""),
    account: String(input.account || ""),
    recipient: String(input.recipient || "").trim(),
    amount: String(input.amount || ""),
    note: String(input.note || "").trim(),
  };
}
