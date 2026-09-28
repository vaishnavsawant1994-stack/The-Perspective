import { describe, expect, it } from "vitest";

import { assembleProposalVersion } from "./proposals";

describe("R7 proposal assembly", () => {
  it("totals draft lines in integer currency", () => {
    const result = assembleProposalVersion("DRAFT", "USD", [
      { description: "Magazine package", quantity: 2, unitAmountMinor: 150000n },
    ]);
    expect(result).toEqual({
      kind: "ok",
      value: {
        currency: "USD",
        lines: [
          {
            description: "Magazine package",
            quantity: 2,
            unitAmountMinor: 150000n,
            lineTotalMinor: 300000n,
          },
        ],
        subtotalMinor: 300000n,
        taxMinor: 0n,
        totalMinor: 300000n,
      },
    });
  });

  it("refuses to rewrite a sent proposal version", () => {
    expect(
      assembleProposalVersion("SENT", "USD", [
        { description: "x", quantity: 1, unitAmountMinor: 1n },
      ]),
    ).toEqual({ kind: "error", code: "PROPOSAL_IMMUTABLE" });
  });

  it("rejects empty and cross-currency-invalid drafts", () => {
    expect(assembleProposalVersion("DRAFT", "USD", [])).toEqual({
      kind: "error",
      code: "PROPOSAL_EMPTY",
    });
    expect(
      assembleProposalVersion("DRAFT", "usd", [
        { description: "x", quantity: 1, unitAmountMinor: 1n },
      ]),
    ).toEqual({ kind: "error", code: "INVALID_CURRENCY" });
  });
});
