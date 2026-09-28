import { describe, expect, it } from "vitest";

import { addMoney, lineTotal, money, subMoney } from "./money";

describe("R7 money", () => {
  it("rejects floating currency and negative amounts", () => {
    expect(() => money("usd", 100)).toThrow("INVALID_CURRENCY");
    expect(() => money("USD", -1)).toThrow("NEGATIVE_MONEY");
  });

  it("adds and subtracts same-currency minor units", () => {
    const due = money("USD", 10_000);
    const paid = money("USD", 2_500);
    expect(addMoney(due, paid).amountMinor).toBe(BigInt(12_500));
    expect(subMoney(due, paid).amountMinor).toBe(BigInt(7_500));
  });

  it("refuses over-allocation and currency mismatch", () => {
    expect(() => subMoney(money("USD", 100), money("USD", 101))).toThrow(
      "INSUFFICIENT_FUNDS",
    );
    expect(() => addMoney(money("USD", 100), money("EUR", 100))).toThrow(
      "CURRENCY_MISMATCH",
    );
  });

  it("computes line totals in integer arithmetic", () => {
    expect(lineTotal(BigInt(1999), 3)).toBe(BigInt(5997));
    expect(() => lineTotal(BigInt(100), 0)).toThrow("INVALID_QUANTITY");
  });
});
