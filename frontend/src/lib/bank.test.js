import { describe, expect, it } from "vitest";
import { INITIAL_BALANCE, money, validateTransfer, vietQrUrl } from "./bank";
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
      validateTransfer({ ...valid, amount: "7829891" }, INITIAL_BALANCE),
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
  it("formats VND", () => expect(money(INITIAL_BALANCE)).toBe("7.829.890"));
  it("encodes QR content without allowing query injection", () => {
    const url = new URL(vietQrUrl(100000, "DEMO & amount=9000"));
    expect(url.hostname).toBe("img.vietqr.io");
    expect(url.pathname).toContain("0000000000");
    expect(url.searchParams.get("amount")).toBe("100000");
    expect(url.searchParams.get("addInfo")).toBe(
      "MO PHONG KHONG CHUYEN TIEN DEMO & amount=9000",
    );
  });
});
