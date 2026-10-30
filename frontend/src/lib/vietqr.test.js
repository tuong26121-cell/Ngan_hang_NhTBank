import { describe, expect, it } from "vitest";
import { buildVietQrUrl, validateVietQr } from "./vietqr";

const valid = {
  bank: "MB",
  account: "0788818374",
  amount: "500000",
  description: "NHAN TIEN",
  template: "compact",
  showinfo: true,
  fullacc: false,
  holder: "NGUYEN NHUT TUONG",
  store: "",
};

describe("opt-in VietQR link builder (not demo transfers)", () => {
  it("encodes all supported parameters and download mode", () => {
    const url = new URL(buildVietQrUrl({ ...valid, description: "Mừng & cảm ơn" }));
    expect(url.origin).toBe("https://vietqr.app");
    expect(url.pathname).toBe("/img");
    expect(url.searchParams.get("bank")).toBe("MB");
    expect(url.searchParams.get("acc")).toBe("0788818374");
    expect(url.searchParams.get("amount")).toBe("500000");
    expect(url.searchParams.get("des")).toBe("Mừng & cảm ơn");
    expect(url.searchParams.get("holder")).toBe(valid.holder);
    expect(url.searchParams.get("template")).toBe("compact");
    expect(url.searchParams.get("showinfo")).toBe("true");
    expect(url.searchParams.get("fullacc")).toBe("false");
    expect(url.searchParams.has("download")).toBe(false);
    expect(new URL(buildVietQrUrl(valid, { download: true })).searchParams.get("download")).toBe("true");
  });
  it("supports QR without an amount or note", () => {
    const url = new URL(buildVietQrUrl({
      ...valid, amount: "", description: "", holder: "", store: "", template: "qronly",
    }));
    expect(url.searchParams.has("amount")).toBe(false);
    expect(url.searchParams.has("des")).toBe(false);
    expect(url.searchParams.has("holder")).toBe(false);
  });
  it.each([
    [{ ...valid, bank: "BAD" }, "ngân hàng"],
    [{ ...valid, account: "1&bank=VCB" }, "Số tài khoản"],
    [{ ...valid, account: "1234" }, "Số tài khoản"],
    [{ ...valid, amount: "-1" }, "Số tiền"],
    [{ ...valid, amount: "1e8" }, "Số tiền"],
    [{ ...valid, amount: "500000000" }, "Số tiền"],
    [{ ...valid, amount: "999999999999999999999" }, "Số tiền"],
    [{ ...valid, description: "a".repeat(61) }, "Nội dung"],
    [{ ...valid, template: "unknown" }, "Mẫu QR"],
  ])("rejects invalid or unsafe input", (form, message) => {
    expect(validateVietQr(form)).toContain(message);
    expect(() => buildVietQrUrl(form)).toThrow();
  });
});
