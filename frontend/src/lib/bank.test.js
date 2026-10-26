import { decodeQr } from "../test/decodeQr";
import { describe, expect, it } from "vitest";
import { INITIAL_BALANCE, money, validateTransfer, demoQrUrl } from "./bank";
const valid = {
  bank: "MB Bank",
  account: "123456789",
  recipient: "Trần Minh Anh",
  amount: "100000",
  note: "Bữa tối",
};
describe("Sandbox transfer validation", () => {
  it("accepts an integer VND transfer including full balance", () => {
    expect(validateTransfer(valid, INITIAL_BALANCE)).toBe("");
    expect(
      validateTransfer(
        { ...valid, amount: String(INITIAL_BALANCE) },
        INITIAL_BALANCE,
      ),
    ).toBe("");
  });
  it.each([
    "-1000",
    "0",
    "999",
    "1.5",
    "1e4",
    "Infinity",
    "",
    "1000abc",
    "9007199254740992",
  ])("rejects invalid amount %s", (amount) =>
    expect(validateTransfer({ ...valid, amount }, INITIAL_BALANCE)).not.toBe(
      "",
    ),
  );
  it("rejects overspending", () =>
    expect(
      validateTransfer(
        { ...valid, amount: String(INITIAL_BALANCE + 1) },
        INITIAL_BALANCE,
      ),
    ).toMatch(/không đủ/));
  it.each([
    { bank: "" },
    { account: "abc" },
    { account: "12345" },
    { recipient: " " },
    { recipient: "a".repeat(81) },
    { note: "a".repeat(121) },
  ])("rejects incomplete or excessive fields %j", (fields) =>
    expect(validateTransfer({ ...valid, ...fields }, INITIAL_BALANCE)).not.toBe(
      "",
    ),
  );
  it("formats VND", () => expect(money(INITIAL_BALANCE)).toBe("4.056.000"));
  it("creates a local non-payment QR with an embedded demo label", () => {
    const note = 'DEMO & amount=9000 <svg onload="alert(1)">';
    const url = demoQrUrl(100000, note);
    expect(url).toMatch(/^data:image\/svg\+xml;charset=utf-8,/);
    const svg = decodeURIComponent(url.slice(url.indexOf(",") + 1));
    expect(svg).toContain("DEMO · KHÔNG THANH TOÁN");
    expect(svg).not.toContain("onload");
    expect(decodeQr(url)).toBe(
      `NHTBANK_SANDBOX:${JSON.stringify({ amount: 100000, note })}`,
    );
  });
  it("round-trips Vietnamese notes without XML injection", () => {
    const note = "Nạp thử — tiếng Việt <>&";
    expect(decodeQr(demoQrUrl(500000000, note))).toBe(
      `NHTBANK_SANDBOX:${JSON.stringify({ amount: 500000000, note })}`,
    );
  });
  it.each(["999", "1e4", "500000001", "1000.5"])(
    "rejects invalid QR amount %s",
    (amount) => expect(() => demoQrUrl(amount, "DEMO")).toThrow(),
  );
  it("rejects excessive QR notes", () =>
    expect(() => demoQrUrl(100000, "a".repeat(61))).toThrow());
});
