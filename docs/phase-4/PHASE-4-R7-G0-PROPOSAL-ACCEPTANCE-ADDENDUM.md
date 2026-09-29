# P4-R7 G0 Addendum — Proposal Customer Acceptance Authority

Status: **OWNER-AUTHORIZED R7 CONTRACT ADDENDUM**  
Owner decision date: 29 September 2026  
Original frozen G0 SHA: `f720f22f2500a89ae48819c715eb0e72f21e532e`  
Scope: clarify the actor and authority for the existing `proposal.accept` command only.

This addendum supplements the frozen G0; it does not replace the original contract or authorize R8–R14 work.

## Frozen actor model

R7 digital proposal acceptance is customer-owned and requires an authenticated CLIENT-surface user with an active CLIENT membership in the customer organization canonically associated with the proposal's commercial client account.

The server must establish this relationship from stored records:

`authenticated user → active CLIENT membership → selected customer organization → commercial client account relationship → proposal → exact current proposal version`

Browser-supplied organization IDs, client-account IDs, ownership claims, proposal state, version, customer evidence, or authorization fields are never trusted. The team organization and client organization must be derived and correlated server-side.

## Permission separation

- `proposal.accept` is the R7 customer command and must be assignable to CLIENT roles with CLIENT scope.
- A TEAM session, TEAM role, or R6 `proposal.approve` grant cannot invoke or substitute for customer acceptance.
- `proposal.approve` remains an independent R6 review operation with no authority to mark a proposal accepted.
- There is no staff-recorded-consent fallback in this R7 slice.
- There is no external bearer-token/email-link acceptance model in this R7 slice.

## Customer account availability

Digital acceptance requires an authenticated customer account and active CLIENT membership. If the customer does not have one, the proposal cannot be accepted through this digital operation until a customer account and membership are provisioned through existing identity controls. Staff must not impersonate the customer or record acceptance on their behalf. External/token acceptance would require a separately authorized contract.

## Acceptance invariants

A successful `proposal.accept` command must:

1. Load the canonical proposal, client account, customer organization, and current proposal version from tenant-scoped server reads.
2. Require the customer relationship to match the authenticated CLIENT membership's selected organization.
3. Accept only a SENT or VIEWED proposal whose exact current version is immutable and not superseded.
4. Bind durable acceptance evidence to the proposal ID, version ID/number, client account, customer organization, actor user, actor membership, and server-generated acceptance timestamp.
5. Use server time as the canonical timestamp; caller-provided timestamps and evidence are rejected.
6. Require a validated idempotency key and payload binding. A duplicate identical request returns the original outcome without a second transition/evidence effect; a conflicting reuse is rejected.
7. Persist acceptance evidence, proposal transition, idempotency receipt, and immutable audit evidence in one transaction. Audit/evidence failure rolls back the transition.
8. Revalidate active CLIENT membership and exact proposal version inside the transaction boundary. Concurrent edits, supersession, revocation, or acceptance must not produce duplicate or stale acceptance.
9. Preserve the existing audit, exact-version, and separation-of-duties obligations. Client-side SoD requires the accepting CLIENT user's account to differ from the user account attached to the proposal's creator membership. A missing or unresolvable creator membership fails closed; TEAM `proposal.approve` remains unrelated and cannot satisfy customer consent.
10. Expose only a client-safe response projection.

The acceptance route remains disabled until CLIENT authorization, trusted relationship/resource loading, transaction/RLS policy, persistence/evidence, audit, idempotency, concurrency, and hostile tests are implemented and qualified.

## Release boundary

This addendum authorizes only the customer-acceptance actor model and the work required to implement `proposal.accept` inside R7. It does not activate contract/signature, invoice/payment, provider, subscription/entitlement, client-portal completion, or any R8 capability. R8 remains locked.
