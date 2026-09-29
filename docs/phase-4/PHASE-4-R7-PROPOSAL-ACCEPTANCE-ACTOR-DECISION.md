# R7 Proposal Acceptance Actor Model — Owner Decision Required

Status: **BLOCKED — no actor model is frozen**  
Reviewed branch HEAD: `c7e0d21fd469049391aa5056beba3dfeb140974e`  
Reviewed qualification: R7 Implementation Qualification #48 — SUCCESS  
G0 contract: `f720f22f2500a89ae48819c715eb0e72f21e532e`

## Finding

The frozen contract settles the business meaning: `proposal.accept` is an auditable customer-acceptance command; `proposal.approve` is a separate R6 review permission and cannot substitute for it.

The frozen contract does **not** settle how the customer proves identity or how that principal is authorized to accept. That omission conflicts with the current R7 implementation, which assigns `proposal.accept` to TEAM / TEAM_ROLE and only accepts TEAM authority.

No acceptance endpoint or mutation is exposed. No permission, principal, token, or evidence model is being activated by this clarification.

## Repository evidence

- `PHASE-4-R7-G0-FREEZE.md` defines the ProposalAcceptance entity, says acceptance is an auditable command, freezes the lifecycle, and sketches `POST /api/v1/r7/proposals/:id/accept`. It does not specify an acceptance actor, customer authentication method, token protocol, or evidence source.
- `PHASE-4-R7-AUTHORIZATION-CHECKPOINT.md` pins `proposal.approve` as R6 review and `proposal.accept` as a separate R7 permission. It does not resolve the latter's actor identity.
- `src/modules/authorization/registry.ts` currently defines `proposal.accept` as surface TEAM, assignability TEAM_ROLE, scopes ORG/DEPT/ASN/OWN, with audit, exact-version, and SoD obligations. `proposal.approve` is separately stamped R6.
- `src/modules/authorization/policy.ts` routes active R7 permissions through an R7 policy that currently requires TEAM surface and TEAM_ROLE. R7 active policy has no client-safe acceptance binding.
- `src/modules/r7/http.ts` exposes only `resolveR7TeamRequest`.
- `src/modules/commercial/persistence.ts` rejects non-TEAM commercial contexts, sets `app.client_organization_id` to empty, and runs owner-organization transactions. The R7 migration applies owner-organization-only RLS to commercial proposals and related records.
- `CommercialProposal` has a nullable `clientAccountId`; `CommercialClientAccount` maps an agency-owned client account to a `clientOrganizationId`. There is no R7 `ProposalAcceptance` model/table or persistence command.
- The shared identity and authorization model supports CLIENT sessions, memberships, CLIENT-scoped grants, and client-safe projections. Existing client workflow permissions are staged for later releases; that general capability does not itself authorize a new R7 customer-acceptance path.
- R7 authorization tests prove the `proposal.approve` grant does not authorize the R7 acceptance command. They do not establish customer identity or consent evidence.

## Models considered

| Model | Existing support | Missing contract or implementation |
|---|---|---|
| Authenticated client/customer membership | CLIENT authentication, memberships, CLIENT scope, and customer-organization linkage exist elsewhere in the architecture. | G0 does not select this actor. R7 policy, request resolver, persistence transaction, RLS, field projection, and acceptance evidence currently support TEAM/owner organization only. |
| External acceptance principal/token | No R7 acceptance-token or external-principal protocol is present in the frozen contract or current R7 implementation. | Principal issuance, recipient binding, expiry/revocation, replay protection, evidence assurance, and tenant/resource correlation would need explicit authorization. An invitation token cannot be assumed equivalent. |
| Team recording independently verified customer acceptance | TEAM permission and audit infrastructure exist. | No frozen definition of acceptable independent evidence, verification responsibility, evidence retention, or how SoD applies. A staff action alone is not proof of customer consent. |

The repository does not establish one of these models strongly enough to implement customer acceptance without inventing authority.

## Invariants already fixed

Whichever model is selected, implementation must retain:

- `proposal.accept` as the only permission for the R7 acceptance command; `proposal.approve` remains R6-only.
- Binding to the canonical proposal, customer relationship, and exact current proposal version.
- Valid SENT/VIEWED lifecycle state; superseded or stale versions cannot be accepted.
- Durable acceptance evidence and audit in the same transaction as the state transition.
- Idempotent duplicate handling and replay protection.
- SoD and tenant/resource checks required by the frozen policy.
- No generic status PATCH and no browser-supplied identity, organization, resource context, lifecycle state, or evidence claims.

## Owner decision required

Choose exactly one authority model before implementation proceeds:

1. **Authenticated client/customer membership.** Confirm that the accepting actor must have an active CLIENT membership in the customer organization bound to the proposal.
2. **External acceptance principal/token.** Specify the intended verification and token lifecycle authority, or authorize a narrow follow-up contract design before implementation.
3. **Team recording verified customer consent.** Define the independently verifiable evidence source and the staff verification/SoD requirements.

Until that choice is recorded in the R7 contract, `proposal.accept` remains non-routable. Proposal read-only HTTP remains qualified. No R8 behavior is introduced.
