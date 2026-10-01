# R7 Invoice Mutation Contract — Owner Decision Recorded

Status: **SOURCE AUTHORITY FROZEN; DOMAIN CONTRACT DETAILS REMAIN TO BE IMPLEMENTED**  
Owner decision recorded: 29 September 2026  
Decision baseline: aa70e76941d9fe5f9893a2ccc02d35d905ff7e3c  
Invoice read implementation: dd8ddae9d1018d8205c09aa00086fb52fb576302 (#87 SUCCESS); read checkpoint documentation HEAD 419846838df0214491b4b6d993a69a7bbf21fbd0 (#88 SUCCESS).

This record is paired with PHASE-4-R7-G0-INVOICE-SOURCE-ADDENDUM.md. It records the selected source authority rule, not implementation qualification or permission activation beyond existing R7 policy.

## Frozen source rule — Option 3

An invoice must be created from the strongest available qualified commercial source for its transaction.

- For normal contract-governed client engagements, a draft invoice MUST originate from an immutable SIGNED ContractVersion. The exact ContractVersion is the authoritative source and remains referenced immutably by the Invoice.
- An immutable ACCEPTED ProposalVersion may be the direct source only for a transaction type whose frozen R7 rules explicitly permit invoicing without a signed contract. G0 currently names no such eligible transaction type, so direct proposal invoicing is presently closed and must fail closed.
- The server determines the permitted source from the transaction type. A caller cannot choose a weaker source when a stronger contract source governs or both exist.
- Source-less/manual TEAM invoice creation is not authorized in the normal R7 workflow.
- Every invoice has exactly one authoritative source relationship. Source provenance is server-owned and immutable.
- Invoice creation copies a financial snapshot from the exact source version. Later source changes cannot rewrite the invoice snapshot.

## Frozen permission mapping

- G0 invoice.manage maps to the existing R7 invoice.edit permission for draft creation and permitted DRAFT-only edits. Do not add a second invoice-manage key.
- G0 invoice.finalize maps to the existing R7 invoice.issue permission for the DRAFT → FINALIZED command. Do not add invoice.finalize.
- invoice.send remains a separate delivery command after finalization.
- invoice.view remains read-only. invoice.edit alone never grants issue or send authority.

## Financial integrity rules

- Currency is copied from the exact source version and cannot be supplied or changed by the caller.
- Source line snapshots carry description, positive integer quantity, integer-minor-unit unit amount, and source position. The server calculates line totals and aggregate totals with checked integer arithmetic.
- Discounts and per-line taxes are not supported unless a frozen R7 contract explicitly adds their semantics. Where the source has an aggregate tax snapshot, invoice creation copies it; the server does not accept a browser-supplied tax or total.
- FINALIZED invoice financial values and source snapshots are immutable. Corrections use separately authorized accounting lifecycle operations such as CreditNote; they do not rewrite the issued snapshot.
- DRAFT writes require optimistic row-version concurrency, tenant/resource authorization, field authorization, durable audit in the same transaction, and idempotency appropriate to the command.
- No DRAFT invoice may change the authoritative source, source version, or source-derived financial snapshot. Any draft-only nonfinancial mutable fields must be explicitly allowlisted before a command exposes them.

## Remaining implementation dependency

The frozen G0 defines Contract, ContractVersion, ContractSigner, and provider-owned SignatureEvent, but these persistence/domain entities are not implemented yet. The current invoice table has no contract-version reference or InvoiceLine table. ContractVersion persistence and verified SIGNED-state production are therefore prerequisites for the normal invoice draft command.

No invoice mutation routes are authorized until the source schema, InvoiceLine persistence, draft commands, issue/send commands, audit/idempotency behavior, and hostile PostgreSQL qualification are complete.