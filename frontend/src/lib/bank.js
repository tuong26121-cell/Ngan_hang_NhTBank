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
export function vietQrUrl(amount, note) {
  const params = new URLSearchParams({
    amount: String(amount),
    addInfo: `MO PHONG KHONG CHUYEN TIEN ${note}`.slice(0, 100),
    accountName: "NHTBANK SANDBOX",
  });
  return `https://img.vietqr.io/image/970422-0000000000-compact2.png?${params}`;
}
