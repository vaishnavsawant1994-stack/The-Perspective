import { describe, expect, it } from "vitest";

import { assembleProposalVersion } from "./proposals";

describe("R7 proposal assembly", () => {
  it("totals draft lines in integer currency", () => {
    const result = assembleProposalVersion("DRAFT", "USD", [
      {
        description: "Magazine package",
        quantity: 2,
        unitAmountMinor: BigInt(150000),
      },
    ]);
    expect(result).toEqual({
      kind: "ok",
      value: {
        currency: "USD",
        lines: [
          {
            description: "Magazine package",
            quantity: 2,
            unitAmountMinor: BigInt(150000),
            lineTotalMinor: BigInt(300000),
          },
        ],
        subtotalMinor: BigInt(300000),
        taxMinor: BigInt(0),
        totalMinor: BigInt(300000),
      },
    });
  });

  it("refuses to rewrite a sent proposal version", () => {
    expect(
      assembleProposalVersion("SENT", "USD", [
        { description: "x", quantity: 1, unitAmountMinor: BigInt(1) },
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
        { description: "x", quantity: 1, unitAmountMinor: BigInt(1) },
      ]),
    ).toEqual({ kind: "error", code: "INVALID_CURRENCY" });
  });
});
