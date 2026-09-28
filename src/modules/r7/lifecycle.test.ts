import { describe, expect, it } from "vitest";

import {
  canRewriteProposalVersion,
  canTransitionProposal,
  invoiceIsMutable,
  isIssuedProposalState,
  isProviderOwnedPaymentState,
} from "./lifecycle";

describe("R7 lifecycle", () => {
  it("issues proposals immutably after SENT", () => {
    expect(canTransitionProposal("DRAFT", "READY")).toBe(true);
    expect(canTransitionProposal("READY", "SENT")).toBe(true);
    expect(canTransitionProposal("SENT", "ACCEPTED")).toBe(true);
    expect(canTransitionProposal("ACCEPTED", "DRAFT")).toBe(false);
    expect(isIssuedProposalState("SENT")).toBe(true);
    expect(canRewriteProposalVersion("SENT")).toBe(false);
    expect(canRewriteProposalVersion("DRAFT")).toBe(true);
  });

  it("keeps finalized invoices and succeeded payments server/provider owned", () => {
    expect(invoiceIsMutable("DRAFT")).toBe(true);
    expect(invoiceIsMutable("FINALIZED")).toBe(false);
    expect(invoiceIsMutable("PAID")).toBe(false);
    expect(isProviderOwnedPaymentState("SUCCEEDED")).toBe(true);
    expect(isProviderOwnedPaymentState("CREATED")).toBe(false);
  });
});
