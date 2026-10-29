/**
 * Chuyển bản ghi SePay API v2 thành cấu trúc giao dịch NhTBank.
 *
 * Bộ chuyển đổi thuần dữ liệu, KHÔNG gọi mạng, KHÔNG lưu token, KHÔNG
 * xác thực ngân hàng hoặc thực hiện giao dịch. Chỉ dùng kết quả đã được
 * máy chủ tin cậy xác thực; không gọi SePay trực tiếp từ trình duyệt.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validVnd(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function transactionDate(value) {
  if (typeof value !== "string") {
    throw new Error("Ngày giao dịch SePay không hợp lệ.");
  }
  // API v2 cho phép YYYY-MM-DD HH:mm:ss theo giờ Việt Nam hoặc ISO 8601.
  const iso = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
    ? value.replace(" ", "T") + "+07:00"
    : value;
  // Buộc ISO có múi giờ để không phụ thuộc múi giờ máy người dùng.
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(iso)) {
    throw new Error("Ngày giao dịch SePay phải kèm múi giờ.");
  }
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Ngày giao dịch SePay không hợp lệ.");
  }
  return parsed.toISOString();
}

export function mapSePayV2Transaction(record) {
  if (!record || typeof record !== "object" || Array.isArray(record)) {
    throw new Error("Giao dịch SePay không hợp lệ.");
  }
  const { id, transfer_type: direction, amount_in: incoming, amount_out: outgoing } = record;
  if (typeof id !== "string" || !UUID.test(id)) {
    throw new Error("Thiếu định danh UUID của giao dịch SePay.");
  }
  if ((direction !== "in" && direction !== "out") ||
      !validVnd(incoming) || !validVnd(outgoing) ||
      (direction === "in" && (incoming === 0 || outgoing !== 0)) ||
      (direction === "out" && (outgoing === 0 || incoming !== 0))) {
    throw new Error("Hướng giao dịch hoặc số tiền SePay không hợp lệ.");
  }
  const description = typeof record.transaction_content === "string"
    ? record.transaction_content.slice(0, 250)
    : "";
  return {
    id: `sepay:${id.toLowerCase()}`,
    name: direction === "in" ? "Tiền vào (SePay)" : "Tiền ra (SePay)",
    detail: description || "Không có nội dung giao dịch",
    category: direction === "in" ? "Tiền vào" : "Tiền ra",
    amount: direction === "in" ? incoming : -outgoing,
    date: transactionDate(record.transaction_date),
    icon: "transfer",
    source: "sepay",
  };
}

export function mapSePayV2Transactions(records) {
  if (!Array.isArray(records)) {
    throw new Error("Danh sách giao dịch SePay không hợp lệ.");
  }
  const seen = new Set();
  const result = [];
  for (const record of records) {
    const transaction = mapSePayV2Transaction(record);
    if (seen.has(transaction.id)) continue;
    seen.add(transaction.id);
    result.push(transaction);
  }
  return result;
}
