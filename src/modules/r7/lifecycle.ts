export const R7_PROPOSAL_STATES = [
  "DRAFT",
  "READY",
  "SENT",
  "VIEWED",
  "ACCEPTED",
  "DECLINED",
  "EXPIRED",
  "SUPERSEDED",
] as const;

export type R7ProposalState = (typeof R7_PROPOSAL_STATES)[number];

export const R7_INVOICE_STATES = [
  "DRAFT",
  "FINALIZED",
  "PARTIALLY_PAID",
  "PAID",
  "VOID",
  "CREDITED",
] as const;

export type R7InvoiceState = (typeof R7_INVOICE_STATES)[number];

export const R7_PAYMENT_STATES = [
  "CREATED",
  "PENDING_PROVIDER",
  "SUCCEEDED",
  "FAILED",
  "CANCELED",
] as const;

export type R7PaymentState = (typeof R7_PAYMENT_STATES)[number];

export const R7_SUBSCRIPTION_STATES = [
  "TRIALING",
  "ACTIVE",
  "PAST_DUE",
  "CANCELED",
  "EXPIRED",
] as const;

const PROPOSAL_EDGES: Record<R7ProposalState, readonly R7ProposalState[]> = {
  DRAFT: ["READY"],
  READY: ["SENT", "DRAFT"],
  SENT: ["VIEWED", "ACCEPTED", "DECLINED", "EXPIRED", "SUPERSEDED"],
  VIEWED: ["ACCEPTED", "DECLINED", "EXPIRED", "SUPERSEDED"],
  ACCEPTED: [],
  DECLINED: [],
  EXPIRED: [],
  SUPERSEDED: [],
};

export function canTransitionProposal(from: R7ProposalState, to: R7ProposalState) {
  return PROPOSAL_EDGES[from].includes(to);
}

export function isIssuedProposalState(state: R7ProposalState) {
  return state !== "DRAFT" && state !== "READY";
}

export function canRewriteProposalVersion(state: R7ProposalState) {
  return !isIssuedProposalState(state);
}

export function isProviderOwnedPaymentState(state: R7PaymentState) {
  return state === "SUCCEEDED" || state === "FAILED" || state === "CANCELED";
}

export function invoiceIsMutable(state: R7InvoiceState) {
  return state === "DRAFT";
}
