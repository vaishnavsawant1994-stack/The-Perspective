import { describe, expect, it } from "vitest";

import {
  canRewriteProposalVersion,
  canTransitionProposal,
  canTransitionContract,
  invoiceIsMutable,
  isIssuedProposalState,
  isProviderOwnedPaymentState,
  isProviderOwnedContractState,
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

  it("allows SIGNED only as a provider-owned terminal Contract transition", () => {
    expect(canTransitionContract("DRAFT", "READY_FOR_SIGNATURE")).toBe(true);
    expect(canTransitionContract("READY_FOR_SIGNATURE", "OUT_FOR_SIGNATURE")).toBe(true);
    expect(canTransitionContract("OUT_FOR_SIGNATURE", "SIGNED")).toBe(true);
    expect(canTransitionContract("DRAFT", "SIGNED")).toBe(false);
    expect(canTransitionContract("SIGNED", "DRAFT")).toBe(false);
    expect(canTransitionContract("SIGNED", "VOID")).toBe(false);
    expect(isProviderOwnedContractState("SIGNED")).toBe(true);
    expect(isProviderOwnedContractState("OUT_FOR_SIGNATURE")).toBe(false);
  });

});
