import { describe, it, expect } from "vitest";
import { crc16Ccitt, parseVietQr, readTlv } from "./scanVietQr";
const tlv = (tag, value) => `${tag}${String(value.length).padStart(2,"0")}${value}`;
export function fixtureVietQr() {
  const customer = tlv("00", "970422") + tlv("01", "0788818374");
  const bank = tlv("00", "A000000727") + tlv("01", customer) + tlv("02", "QRIBFTTA");
  const fields = tlv("00","01") + tlv("01","12") + tlv("38",bank)
    + tlv("53","704") + tlv("54","500000") + tlv("58","VN")
    + tlv("62",tlv("08","NHAN TIEN"));
  return fields + "6304" + crc16Ccitt(fields + "6304");
}
describe("offline VietQR scan parser", () => {
  it("parses valid NAPAS VietQR and never treats CRC as identity verification", () => {
    const result = parseVietQr(fixtureVietQr());
    expect(result).toMatchObject({ bankBin: "970422", account: "0788818374", amount: "500000", note: "NHAN TIEN", verified: false });
  });
  it("rejects tampering and malicious/non-VietQR values", () => {
    const valid = fixtureVietQr();
    expect(() => parseVietQr(valid.replace("500000", "900000"))).toThrow("CRC");
    expect(() => parseVietQr("https://evil.example/steal?token=123")).toThrow();
    expect(() => parseVietQr(valid.slice(0,-5))).toThrow();
    expect(() => readTlv("3805ABC")).toThrow();
    expect(() => readTlv("0002AB0002CD")).toThrow();
  });
});
