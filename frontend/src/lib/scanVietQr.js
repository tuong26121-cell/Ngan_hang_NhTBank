// NAPAS VietQR reader. Parse locally. No bank transaction or network request.
export function readTlv(raw) {
  if (typeof raw !== "string" || raw.length > 1024) throw new Error("Mã QR quá dài hoặc không hợp lệ.");
  const values = {};
  let index = 0;
  while (index < raw.length) {
    if (index + 4 > raw.length) throw new Error("Cấu trúc mã QR bị thiếu.");
    const tag = raw.slice(index, index + 2);
    const len = raw.slice(index + 2, index + 4);
    if (!/^\d{2}$/.test(tag) || !/^\d{2}$/.test(len))
      throw new Error("Cấu trúc dữ liệu QR không hợp lệ.");
    index += 4;
    const count = Number(len);
    if (index + count > raw.length) throw new Error("Độ dài dữ liệu QR không hợp lệ.");
    if (Object.hasOwn(values, tag)) throw new Error("Trùng trường dữ liệu QR.");
    values[tag] = raw.slice(index, index + count);
    index += count;
  }
  return values;
}

export function crc16Ccitt(input) {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++)
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function parseVietQr(raw) {
  if (typeof raw !== "string" || raw.length > 1024 || !/^[\x20-\x7E]+$/.test(raw))
    throw new Error("Mã không thuộc định dạng VietQR hỗ trợ.");
  const root = readTlv(raw);
  if (root["00"] !== "01" || root["53"] !== "704" || root["58"] !== "VN")
    throw new Error("Đây không phải mã VietQR ngân hàng Việt Nam.");
  if (!root["63"] || !raw.endsWith("6304" + root["63"]) ||
      crc16Ccitt(raw.slice(0, -4)) !== root["63"])
    throw new Error("Mã QR không vượt qua kiểm tra toàn vẹn CRC.");
  const napas = readTlv(root["38"] || "");
  if (napas["00"] !== "A000000727")
    throw new Error("Không tìm thấy mã chuyển tiền NAPAS hợp lệ.");
  const recipient = readTlv(napas["01"] || "");
  const bankBin = recipient["00"];
  const account = recipient["01"];
  if (!/^\d{6}$/.test(bankBin || "") || !/^\d{5,19}$/.test(account || ""))
    throw new Error("Thiếu mã ngân hàng hoặc số tài khoản thụ hưởng.");
  const amount = root["54"] || "";
  if (amount && (!/^\d{1,12}$/.test(amount) || !Number.isSafeInteger(Number(amount)) || Number(amount) < 1))
    throw new Error("Số tiền trong mã không hợp lệ.");
  let note = "";
  if (root["62"]) {
    const additional = readTlv(root["62"]);
    note = (additional["08"] || additional["05"] || "").slice(0, 80);
  }
  return {
    bankBin,
    account,
    amount,
    note,
    service: napas["02"] || "",
    merchant: (root["59"] || "").slice(0, 60),
    verified: false, // CRC validates encoding, not beneficiary identity.
  };
}
