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

export const R7_CONTRACT_STATES = [
  "DRAFT",
  "READY_FOR_SIGNATURE",
  "OUT_FOR_SIGNATURE",
  "SIGNED",
  "VOID",
  "EXPIRED",
] as const;

export type R7ContractState = (typeof R7_CONTRACT_STATES)[number];

const CONTRACT_EDGES: Record<R7ContractState, readonly R7ContractState[]> = {
  DRAFT: ["READY_FOR_SIGNATURE"],
  READY_FOR_SIGNATURE: ["OUT_FOR_SIGNATURE", "VOID"],
  OUT_FOR_SIGNATURE: ["SIGNED", "VOID", "EXPIRED"],
  SIGNED: [],
  VOID: [],
  EXPIRED: [],
};

export function canTransitionContract(
  from: R7ContractState,
  to: R7ContractState,
) {
  return CONTRACT_EDGES[from].includes(to);
}

export function isProviderOwnedContractState(state: R7ContractState) {
  return state === "SIGNED";
}
