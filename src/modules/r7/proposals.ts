import { lineTotal, money } from "@/modules/finance/money";
import { canRewriteProposalVersion, type R7ProposalState } from "./lifecycle";

export type ProposalLineInput = {
  description: string;
  quantity: number;
  unitAmountMinor: bigint;
};

export function assembleProposalVersion(
  state: R7ProposalState,
  currency: string,
  lines: ProposalLineInput[],
  taxMinor = 0n,
) {
  if (!canRewriteProposalVersion(state)) {
    return { kind: "error" as const, code: "PROPOSAL_IMMUTABLE" };
  }
  if (lines.length === 0) {
    return { kind: "error" as const, code: "PROPOSAL_EMPTY" };
  }
  try {
    const priced = lines.map((line) => {
      const total = lineTotal(line.unitAmountMinor, line.quantity);
      money(currency, total);
      return { ...line, lineTotalMinor: total };
    });
    const subtotalMinor = priced.reduce((sum, line) => sum + line.lineTotalMinor, 0n);
    const tax = money(currency, taxMinor).amountMinor;
    return {
      kind: "ok" as const,
      value: {
        currency,
        lines: priced,
        subtotalMinor,
        taxMinor: tax,
        totalMinor: subtotalMinor + tax,
      },
    };
  } catch (error) {
    return {
      kind: "error" as const,
      code: error instanceof Error ? error.message : "INVALID_MONEY",
    };
  }
}
