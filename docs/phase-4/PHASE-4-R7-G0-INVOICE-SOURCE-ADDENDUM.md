# P4-R7-G0 — Invoice Source Addendum

STATUS: OWNER DECISION RECORDED — ADDITIVE CLARIFICATION TO FROZEN R7 G0  
BASE G0: owner-accepted R7 G0 contract f720f22f2500a89ae48819c715eb0e72f21e532e  
Decision date: 29 September 2026  
Decision source: Owner instruction in the R7 execution conversation  
R8+: EXCLUDED

## Owner decision — invoice source contract

Select Option 3: invoice source is determined by transaction type and server-side business rules, not caller choice.

For normal contract-governed client engagements, an invoice MUST originate from an immutable SIGNED ContractVersion. The invoice retains the canonical contract/version reference used as its source.

An immutable ACCEPTED ProposalVersion MAY be used directly only for transaction types whose frozen R7 rules explicitly permit proposal-direct invoicing without a signed contract. G0 currently identifies no such eligible transaction type. Until an eligible type is explicitly frozen, proposal-direct invoicing is disabled and fails closed.

The caller cannot choose between Proposal and Contract when both exist. The server determines which source is permitted and requires the strongest source applicable to the transaction.

Ordinary manual source-less TEAM invoice creation is not authorized in the normal R7 workflow.

Each invoice has exactly one authoritative commercial source relationship. Source provenance is server-owned, and source version plus financial snapshot are immutable after creation. Invoice creation copies the financially relevant snapshot from the exact source version; later changes to the Proposal or Contract cannot rewrite the invoice.

## Permission mapping

- G0 invoice.manage is represented by the existing R7 invoice.edit permission for draft creation and permitted DRAFT-only edits. No invoice.manage permission is added.
- G0 invoice.finalize is represented by the existing R7 invoice.issue permission for the explicit DRAFT → FINALIZED domain command. No invoice.finalize permission is added.
- invoice.view remains read-only.
- invoice.edit does not authorize issue or send.
- invoice.send remains a distinct delivery operation after finalization.

## Snapshot and arithmetic boundary

The source-version line snapshot consists of description, positive integer quantity, integer-minor-unit unit amount, and stable position. The server computes line totals and aggregate totals using checked integer arithmetic. Currency comes from the exact source version and is not caller-supplied.

G0 does not define discounts or per-line tax semantics; they are not supported by this addendum. If the source version carries an aggregate tax snapshot, invoice creation copies it; callers cannot supply or change it. FINALIZED financial values are immutable. Corrections require a separate authorized accounting operation such as CreditNote.

Draft writes require tenant/resource authorization, field authorization, optimistic row-version protection, transactionally durable audit evidence, and command-appropriate idempotency. DRAFT commands cannot change their authoritative source, source version, source-derived financial line data, or currency. Any additional draft-only nonfinancial mutable fields must be explicitly frozen before exposure.

## Implementation dependency

Contract, ContractVersion, ContractSigner, and verified provider-owned signature completion are in the frozen G0 but are not yet implemented. Therefore the normal contract-source invoice draft command cannot be implemented until a trusted ContractVersion and verified SIGNED state exist. The database must enforce source ownership/version consistency and exactly one source relation when invoice persistence is extended. InvoiceLine persistence, draft/issue/send domain commands, audit/idempotency, real-PostgreSQL hostile tests, and exact-head qualification remain required before Invoice mutation HTTP is exposed.

This addendum freezes invoice source authority and the conservative snapshot boundary. It does not claim Invoice mutations are implemented or qualified, does not unlock R8, and does not accept or merge R7.
