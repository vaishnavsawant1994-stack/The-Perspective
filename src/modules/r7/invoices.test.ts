import { describe, expect, it } from "vitest";

import { applyAllocation } from "./invoices";

describe("R7 invoice allocation", () => {
  it("pays a finalized invoice exactly", () => {
    expect(applyAllocation("FINALIZED", "USD", 10_000n, 0n, 10_000n)).toEqual({
      kind: "ok",
      value: { allocatedMinor: 10_000n, remainingMinor: 0n, status: "PAID" },
    });
  });

  it("partially pays without exceeding the total", () => {
    expect(applyAllocation("FINALIZED", "USD", 10_000n, 0n, 2_500n)).toEqual({
      kind: "ok",
      value: {
        allocatedMinor: 2_500n,
        remainingMinor: 7_500n,
        status: "PARTIALLY_PAID",
      },
    });
  });

  it("rejects draft invoices, closed invoices, and overpayment", () => {
    expect(applyAllocation("DRAFT", "USD", 10_000n, 0n, 1n).kind).toBe("error");
    expect(applyAllocation("PAID", "USD", 10_000n, 10_000n, 1n)).toEqual({
      kind: "error",
      code: "INVOICE_CLOSED",
    });
    expect(applyAllocation("FINALIZED", "USD", 10_000n, 9_000n, 2_000n)).toEqual({
      kind: "error",
      code: "INSUFFICIENT_FUNDS",
    });
  });
});
