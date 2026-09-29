# R7 Invoice Mutation Contract — Owner Decision Required

Status: NOT FROZEN — invoice mutations remain blocked
Evidence baseline: 419846838df0214491b4b6d993a69a7bbf21fbd0
Invoice read implementation: dd8ddae9d1018d8205c09aa00086fb52fb576302 (#87 SUCCESS); read checkpoint documentation HEAD 419846838df0214491b4b6d993a69a7bbf21fbd0 (#88 SUCCESS).

This record captures repository evidence and the remaining authority decision. It does not activate permissions or authorize mutation implementation.

## Repository facts

- Frozen R7 G0 defines invoice lifecycle as DRAFT → FINALIZED → PARTIALLY_PAID → PAID, VOID, or CREDITED.
- G0 requires integer minor-unit totals, currency, and immutable finalized invoices; corrections use CreditNote.
- G0 lists invoice.view, invoice.manage, and invoice.finalize, and sketches POST /api/v1/r7/invoices/:id/finalize.
- The active R7 authorization registry instead exposes invoice.view, invoice.edit, invoice.issue, and invoice.send.
- The existing policy maps both issue and finalize actions to the single invoice.issue permission. Keep invoice.issue as the candidate canonical finalize command; do not create invoice.finalize without contract evidence.
- The current persistence table stores client_account_id and optional proposal_id, but has no contract_id, subscription/billing source reference, or invoice-line table.
- G0's workflow sketch is Proposal → Contract/Signature → Invoice, but it does not state whether an invoice must come from a signed contract, an accepted proposal, another billing source, or a permitted manual source.
- G0 does not define invoice-line fields, draft line add/remove/reorder rules, source snapshot behavior, or exact version/concurrency semantics.
- Existing invoice.edit policy allows create/update/edit actions and currently permits currency as a mutable field; this implementation policy does not replace a frozen business contract.

## Already established

- invoice.view remains read-only.
- Finalized invoice financial truth is immutable; corrections use CreditNote.
- invoice.issue is the sole registry permission corresponding to G0 finalization, with server-owned lifecycle transition.
- All totals and canonical financial state must be server-derived.
- Invoice list/detail HTTP remains qualified and must not be reopened without regression evidence.
- No invoice create/edit/issue/send route may be added until the source, line, field, version, audit, and idempotency contract is frozen.

## Owner decision required

Freeze one source-creation rule:

1. invoices are created only from an accepted, exact ProposalVersion;
2. invoices are created only from a signed, exact ContractVersion;
3. invoices may be created from a frozen subset of proposal/contract/billing sources; or
4. manual invoice creation is allowed under an explicitly bounded TEAM operation.

For the chosen source, specify the canonical foreign-key relationship and snapshot/version semantics. Also freeze the InvoiceLine structure and allowed draft line operations; whether draft creation uses the existing invoice.edit authority or a distinct permission; currency consistency; server-side total derivation; draft mutability; optimistic concurrency; issue idempotency; and atomic audit behavior.

Until this decision is recorded in the frozen contract, the safe state is to keep Invoice mutation implementation and HTTP exposure blocked. R7 remains incomplete and R8 remains locked.