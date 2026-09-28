# P4-R7-G0 — Commercial / Finance Freeze

STATUS: DRAFT FOR OWNER FREEZE — IMPLEMENTATION NOT AUTHORIZED
BASE: main 4d53032e25b770a1318804da8150b9fb1deee743 (R6 accepted + merged record)
R6 MERGE: b74a1fce13fa873aa628b5ac01bc2e3e6c3523ec
R6 CEILING HANDOFF: PROPOSAL_PREPARATION
R8+: EXCLUDED FROM THIS RELEASE
NO DESIGN 154
NO PAGE 58+

## Purpose
Turn a deal that has reached PROPOSAL_PREPARATION into financially enforceable customer state:
Proposal → Contract/Signature → Invoice → Payment → Ledger → Subscription/Entitlement.

R7 does not implement editorial workflow, magazine publishing, media, search, member portal completion, or production hardening.

## Authority chain (unchanged)
Browser input → authentication → selected Organization → Membership → trusted ResourceContext → Permission → Resource policy → Field policy → Lifecycle → Domain command → transaction → PostgreSQL → audit.

Never trust browser-supplied organizationId, membership, permissionKey, provider truth, payment truth, signature truth, or PAID/SIGNED status.

## Entities (canonical)
Catalogue: Product, Package, PackageItem, Price (integer minor units + ISO currency; no float money).
Proposal: Proposal, ProposalVersion (immutable once SENT), ProposalLine, ProposalAcceptance.
Contract: Contract, ContractVersion, ContractSigner, SignatureEvent (provider-owned completion).
Finance: Invoice, InvoiceLine, CreditNote, Payment, PaymentAllocation, Refund, LedgerEntry.
Access: Subscription, SubscriptionPeriod, Entitlement.
Evidence: ProviderEvent, IdempotencyReceipt (reuse R6 receipt pattern).

## Proposal lifecycle (frozen)
DRAFT → READY → SENT → VIEWED → ACCEPTED | DECLINED | EXPIRED | SUPERSEDED.
SENT versions are immutable. Edits create a new ProposalVersion and SUPERSEDE the prior issued version.
Acceptance is an auditable command, not a field write.

## Contract / signature (frozen)
DRAFT → READY_FOR_SIGNATURE → OUT_FOR_SIGNATURE → SIGNED | VOID | EXPIRED.
status=SIGNED is illegal from the browser. SIGNED only after verified provider event + idempotent reconciliation.
Webhook replay must be a no-op after first successful apply.

## Invoice (frozen)
DRAFT → FINALIZED → PARTIALLY_PAID → PAID | VOID | CREDITED.
FINALIZED invoices are not CRM-editable. Corrections use CreditNote, not silent rewrite.
Totals stored as integer minor units. Currency required and immutable after FINALIZED.

## Payment (frozen)
CREATED → PENDING_PROVIDER → SUCCEEDED | FAILED | CANCELED.
SUCCEEDED only from verified provider event. Allocations must not exceed invoice remaining balance.
Duplicate provider event id → same Payment, no second money.
Refunds create Refund + reversing LedgerEntry; they do not delete Payment.

## Subscription / entitlement (frozen)
Subscription: TRIALING | ACTIVE | PAST_DUE | CANCELED | EXPIRED.
Entitlement is derived from verified commercial state. Hiding UI is not access control.
Member/Client surfaces may consume entitlements; they are not defined as new public pages.

## Permissions to activate in R7 (additive; R6 37 keys stay)
proposal.view, proposal.edit, proposal.send, proposal.accept
contract.view, contract.manage, contract.sign.request
invoice.view, invoice.manage, invoice.finalize
payment.view, payment.reconcile
subscription.view, subscription.manage
entitlement.view
catalogue.manage

Dormant until G0 owner freeze + implementation authorization. Do not activate in code in this commit.

## Financial invariants
1. Money is integer minor units + currency code.
2. No float arithmetic for balances.
3. Ledger is append-only.
4. Invoice remaining = finalized total − allocations + applied credits, never negative without explicit overpayment policy (R7 default: reject over-allocation).
5. Provider event unique (provider, providerEventId).
6. Idempotency key + payload hash on convert-like financial commands.
7. Fail closed if webhook signature invalid.
8. Tenant isolation on every table via ownerOrganizationId + RLS.

## Ownership
Browser: draft proposal/invoice fields on authorized allowlists; start checkout; request signature send.
Server: version immutability, totals, tax snapshot, lifecycle, ledger, entitlements.
Provider: payment capture, signature completion, settlement timestamps.

## API sketch (not implemented here)
POST/GET /api/v1/r7/proposals
POST /api/v1/r7/proposals/:id/versions
POST /api/v1/r7/proposals/:id/send
POST /api/v1/r7/proposals/:id/accept
POST/GET /api/v1/r7/contracts
POST /api/v1/r7/invoices/:id/finalize
POST /api/v1/r7/internal/providers/payments/webhook
POST /api/v1/r7/internal/providers/signatures/webhook
No /api/v1/r6/* expansion for these resources.

## Falsification plan (implementation phase)
Foreign tenant proposal/invoice/payment IDs.
Browser status=SIGNED / status=PAID.
Mass-assigned totals/currency/organizationId.
Replay and out-of-order webhooks.
Duplicate provider events.
Concurrent accept + supersede.
Concurrent allocate beyond balance.
Partial failure leaves no half-paid invoice without ledger.
R8 project/editorial routes remain unbound.

## Explicit exclusions (R8+)
Projects, workflows, questionnaires, assets, editorial drafts, publications, magazines,
podcasts, video, events, search, SEO, analytics, member /my completion, client portal completion,
enterprise admin, production hardening.
Existing visual R7 pages stay DISPLAY-ONLY until implementation authorization.

## Gate
This document is G0. Implementation starts only after owner freeze of this contract
and a separate implementation-authorization message.
