import QRCode from "qrcode";

export const OWNER = "Nguyễn Nhựt Tường";
export const INITIAL_BALANCE = 4056000;
export const DEMO_PIN = "123456";
export const money = (value) => new Intl.NumberFormat("vi-VN").format(value);
export const initialTransactions = [
  {
    id: "seed-1",
    name: "Lương tháng 10",
    detail: "Công ty TNHH Sáng Tạo",
    category: "Lương & thu nhập",
    amount: 15000000,
    date: "2026-10-25T08:30:00+07:00",
    icon: "salary",
  },
  {
    id: "seed-2",
    name: "Highlands Coffee",
    detail: "Thanh toán tại cửa hàng",
    category: "Ăn uống",
    amount: -59000,
    date: "2026-10-25T07:45:00+07:00",
    icon: "coffee",
  },
  {
    id: "seed-3",
    name: "Trần Minh Anh",
    detail: "Bữa tối cuối tuần",
    category: "Chuyển tiền",
    amount: -250000,
    date: "2026-10-24T19:20:00+07:00",
    icon: "transfer",
  },
  {
    id: "seed-4",
    name: "Spotify Premium",
    detail: "Gói cá nhân hàng tháng",
    category: "Giải trí",
    amount: -59000,
    date: "2026-10-23T09:00:00+07:00",
    icon: "music",
  },
];
// Amounts are integer VND; balances are held only in React memory.
export function validateTransfer(
  { bank, account, recipient, amount, note },
  balance,
) {
  if (!bank) return "Vui lòng chọn ngân hàng nhận.";
  if (!/^\d{6,19}$/.test(account))
    return "Số tài khoản cần có từ 6 đến 19 chữ số.";
  if (recipient.trim().length < 2 || recipient.trim().length > 80)
    return "Nhập tên người nhận từ 2 đến 80 ký tự.";
  if (
    !/^\d+$/.test(String(amount)) ||
    !Number.isSafeInteger(Number(amount)) ||
    Number(amount) < 1000
  )
    return "Số tiền tối thiểu là 1.000 VNĐ, không có phần thập phân.";
  if (Number(amount) > balance)
    return "Số dư mô phỏng không đủ để chuyển khoản.";
  if (note.length > 120) return "Nội dung tối đa 120 ký tự.";
  return "";
}
// This is deliberately not an EMV/VietQR payment payload. No bank account,
// payment URL or external image service is involved, including after saving.
export function demoQrUrl(amount, note) {
  const value = Number(amount);
  if (
    !/^\d+$/.test(String(amount)) ||
    !Number.isSafeInteger(value) ||
    value < 1000 ||
    value > 500000000 ||
    typeof note !== "string" ||
    note.length > 60
  )
    throw new Error("Dữ liệu QR mô phỏng không hợp lệ.");
  const payload = `NHTBANK_SANDBOX:${JSON.stringify({
    amount: value,
    note: note.trim() || "NAP TIEN DEMO",
  })}`;
  const { modules } = QRCode.create(payload, { errorCorrectionLevel: "M" });
  const cells = [];
  for (let y = 0; y < modules.size; y++)
    for (let x = 0; x < modules.size; x++)
      if (modules.get(y, x)) cells.push(`M${x + 4} ${y + 4}h1v1h-1z`);
  // Only integer matrix coordinates are inserted into SVG; input text is
  // encoded inside the QR, never interpolated into XML markup.
  const size = modules.size + 8;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="284" viewBox="0 0 240 284"><rect width="240" height="284" fill="white"/><svg width="240" height="240" viewBox="0 0 ${size} ${size}"><path fill="black" shape-rendering="crispEdges" d="${cells.join("")}"/></svg><rect y="240" width="240" height="44" fill="#0c3699"/><text x="120" y="258" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" fill="white">DEMO · KHÔNG THANH TOÁN</text><text x="120" y="276" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="white">NhTBank Sandbox</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
