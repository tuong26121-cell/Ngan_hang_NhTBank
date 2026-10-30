// Kept separate from bank.js: demo QR must never become a payment payload.
export const VIETQR_BANKS = [
  { code: "MB", label: "MB Bank" },
  { code: "VCB", label: "Vietcombank" },
  { code: "TCB", label: "Techcombank" },
  { code: "KLB", label: "KienlongBank" },
  { code: "VBA", label: "Agribank" },
  { code: "ACB", label: "ACB" },
  { code: "BIDV", label: "BIDV" },
  { code: "TPB", label: "TPBank" },
  { code: "VPB", label: "VPBank" },
  { code: "VIB", label: "VIB" },
  { code: "ICB", label: "VietinBank" },
  { code: "STB", label: "Sacombank" },
];
// A curated set of supported codes from https://vietqr.app/banks.json.
// Add banks only after checking their current supported status.
export const VIETQR_TEMPLATES = ["compact", "qronly", "standee"];

export function validateVietQr(form) {
  const account = String(form.account ?? "").trim();
  const amount = String(form.amount ?? "").trim();
  const description = String(form.description ?? "").trim();
  const holder = String(form.holder ?? "").trim();
  const store = String(form.store ?? "").trim();
  if (!VIETQR_BANKS.some((bank) => bank.code === form.bank))
    return "Vui lòng chọn ngân hàng được hỗ trợ.";
  if (!/^\d{5,19}$/.test(account))
    return "Số tài khoản cần có từ 5 đến 19 chữ số.";
  if (
    amount &&
    (!/^\d+$/.test(amount) ||
      !Number.isSafeInteger(Number(amount)) ||
      Number(amount) < 1 ||
      Number(amount) >= 500000000)
  )
    return "Số tiền phải là số nguyên từ 1 đến dưới 500 triệu VNĐ hoặc để trống.";
  if (description.length > 60) return "Nội dung tối đa 60 ký tự.";
  if (holder.length > 80) return "Tên chủ tài khoản tối đa 80 ký tự.";
  if (store.length > 80) return "Tên cửa hàng tối đa 80 ký tự.";
  if (!VIETQR_TEMPLATES.includes(form.template))
    return "Mẫu QR không hợp lệ.";
  return "";
}

export function buildVietQrUrl(form, { download = false } = {}) {
  const error = validateVietQr(form);
  if (error) throw new Error(error);
  const url = new URL("https://vietqr.app/img");
  url.searchParams.set("acc",String(form.account).trim());
  url.searchParams.set("bank",form.bank);
  if (String(form.amount ?? "").trim())
    url.searchParams.set("amount",String(form.amount).trim());
  if (String(form.description ?? "").trim())
    url.searchParams.set("des",String(form.description).trim());
  url.searchParams.set("template",form.template);
  url.searchParams.set("showinfo",String(Boolean(form.showinfo)));
  url.searchParams.set("fullacc",String(Boolean(form.fullacc)));
  if (String(form.holder ?? "").trim())
    url.searchParams.set("holder",String(form.holder).trim());
  if (String(form.store ?? "").trim())
    url.searchParams.set("store",String(form.store).trim());
  if (download) url.searchParams.set("download","true");
  return url.toString();
}
