import { describe, expect, it } from "vitest";

import { applyAllocation } from "./invoices";

describe("R7 invoice allocation", () => {
  it("pays a finalized invoice exactly", () => {
    expect(
      applyAllocation("FINALIZED", "USD", BigInt(10_000), BigInt(0), BigInt(10_000)),
    ).toEqual({
      kind: "ok",
      value: {
        allocatedMinor: BigInt(10_000),
        remainingMinor: BigInt(0),
        status: "PAID",
      },
    });
  });

  it("partially pays without exceeding the total", () => {
    expect(
      applyAllocation("FINALIZED", "USD", BigInt(10_000), BigInt(0), BigInt(2_500)),
    ).toEqual({
      kind: "ok",
      value: {
        allocatedMinor: BigInt(2_500),
        remainingMinor: BigInt(7_500),
        status: "PARTIALLY_PAID",
      },
    });
  });

  it("rejects draft invoices, closed invoices, and overpayment", () => {
    expect(
      applyAllocation("DRAFT", "USD", BigInt(10_000), BigInt(0), BigInt(1)).kind,
    ).toBe("error");
    expect(
      applyAllocation("PAID", "USD", BigInt(10_000), BigInt(10_000), BigInt(1)),
    ).toEqual({
      kind: "error",
      code: "INVOICE_CLOSED",
    });
    expect(
      applyAllocation("FINALIZED", "USD", BigInt(10_000), BigInt(9_000), BigInt(2_000)),
    ).toEqual({
      kind: "error",
      code: "INSUFFICIENT_FUNDS",
    });
  });
});
