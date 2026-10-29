import { describe, expect, it } from "vitest";
import {
  mapSePayV2Transaction,
  mapSePayV2Transactions,
} from "./sepayAdapter";

const sample = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  transaction_date: "2026-10-29 09:30:00",
  transfer_type: "in",
  amount_in: 500000,
  amount_out: 0,
  transaction_content: "Nhận tiền thử nghiệm",
  accumulated: 6000000,
};

describe("SePay API v2 data mapping (isolated / no bank access)", () => {
  it("maps money in as positive integer VND, without inventing a balance", () => {
    const mapped = mapSePayV2Transaction(sample);
    expect(mapped.amount).toBe(500000);
    expect(mapped.date).toBe("2026-10-29T02:30:00.000Z");
    expect(mapped.id).toBe(`sepay:${sample.id}`);
    expect(mapped.detail).toBe(sample.transaction_content);
    expect(mapped).not.toHaveProperty("balance");
    expect(mapped).not.toHaveProperty("accumulated");
  });

  it("maps money out as negative integer VND", () => {
    const mapped = mapSePayV2Transaction({
      ...sample,
      id: "a1b2c3d4-e5f6-7890-abcd-ef1234567891",
      transfer_type: "out",
      amount_in: 0,
      amount_out: 78000,
      transaction_date: "2026-10-29T09:31:00+07:00",
    });
    expect(mapped.amount).toBe(-78000);
    expect(mapped.category).toBe("Tiền ra");
  });

  it("deduplicates repeated notifications by provider UUID", () => {
    const output = mapSePayV2Transactions([sample, { ...sample }]);
    expect(output).toHaveLength(1);
  });

  it.each([
    { ...sample, id: "invalid" },
    { ...sample, transfer_type: "unknown" },
    { ...sample, amount_in: "500000" },
    { ...sample, amount_in: 1.2 },
    { ...sample, amount_in: -100 },
    { ...sample, amount_out: 100 },
    { ...sample, transaction_date: "not-a-date" },
    { ...sample, transaction_date: "2026-10-29T09:30:00" },
  ])("rejects invalid or ambiguous provider record %j", (bad) => {
    expect(() => mapSePayV2Transaction(bad)).toThrow();
  });

  it("rejects non-array transaction collections", () => {
    expect(() => mapSePayV2Transactions({ data: [sample] })).toThrow();
  });
});
