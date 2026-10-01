# R7 Proposal HTTP Qualification Checkpoint

Status: **QUALIFIED — whole Proposal HTTP surface only**  
Implementation/test HEAD: `7bc35e52d99f4aa08b84abf828c438b0d8346be0`  
Parent: `364a573dd613925c3c57bed8f2604e2970f2bbce`  
Exact-head qualification: [R7 Implementation Qualification #85](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36558923341) — **SUCCESS**  
Date: 29 September 2026

This checkpoint qualifies the complete current R7 Proposal HTTP surface: list, detail, create, edit, send, and customer acceptance. It does not qualify Invoice HTTP, Payment/Reconciliation HTTP, the later commercial/finance/provider/subscription/entitlement domains, or R7 as a release. R7 remains incomplete, unaccepted, and unmerged. R8 remains locked.

## Route inventory and ownership

The qualified route inventory is:

| Route | Owner / permission | Command |
|---|---|---|
| `GET /api/v1/r7/proposals` | TEAM / `proposal.view` | Tenant-filtered list projection |
| `GET /api/v1/r7/proposals/:proposalId` | TEAM / `proposal.view` | Tenant-filtered detail projection |
| `POST /api/v1/r7/proposals` | TEAM / `proposal.edit` | Create mutable draft through `createDraftProposal` |
| `POST /api/v1/r7/proposals/:proposalId/edit` | TEAM / `proposal.edit` | Edit current mutable version through `editDraftProposal` |
| `POST /api/v1/r7/proposals/:proposalId/send` | TEAM / `proposal.send` | Explicit send/queue command through `sendProposal` |
| `POST /api/v1/r7/proposals/:proposalId/accept` | CLIENT / `proposal.accept` | Customer acceptance through `acceptProposal` |

There is no generic proposal PATCH, PUT, or DELETE route. Lifecycle changes use explicit operations. Proposal acceptance requires the authenticated customer membership linked to the canonical client account; R6 `proposal.approve` cannot authorize it. Team-owned writes use shared same-origin, session, selected-organization, active-membership, trusted-resource, field-policy, lifecycle/version, and domain-command boundaries. Customer acceptance uses the corresponding CLIENT authority and its transactionally revalidated relationship.

## Hostile and regression evidence

The exact-head run executes hostile tests for list/detail, create, edit, send, and accept, along with the integrated API boundary test. The permanent integrated boundary test verifies the exact route inventory, required explicit command implementation and permission on each mutation, no generic lifecycle HTTP method, CLIENT resolution for acceptance, and continued separation between `proposal.accept` and `proposal.approve`. It also pins that every route family retains its dedicated hostile test suite.

Route tests cover anonymous/session denials, same-origin rejection, malformed identifiers and strict bodies, forged tenant/ownership/lifecycle/financial fields, missing permission, TEAM/CLIENT boundary, cross-tenant concealment, stale/superseded version, invalid lifecycle, required idempotency, payload replay/conflict, and invocation only of the authorized explicit command. Real PostgreSQL coverage exercises proposal command transactions, tenant and relationship constraints, derived totals, edit/send/acceptance races, audit failure rollback, idempotency, immutable acceptance evidence, and durable audit/outbox evidence.

Run #82 exposed a test-only expectation error for acceptance duplicate replay; the database returned `replayed: true` for the duplicate. The permanent test now requires exactly one initial execution and one replay. Run #83 passed the repaired acceptance implementation. Run #84 independently qualified the acceptance documentation HEAD. Run #85 passed the integrated Proposal API regression on `7bc35e52d99f4aa08b84abf828c438b0d8346be0`; the test change only replaces an obsolete “no acceptance route” assertion with the current frozen route/ownership inventory and hostile-coverage checks.

## Exact-head qualification

Run #85 passed on the exact implementation/test SHA:

- dependency installation;
- Prisma validate and generate;
- isolated shadow database creation;
- R2–R7 migrations, migration status, and drift;
- complete unit test suite, including all Proposal HTTP hostile tests;
- deterministic seed and seed assertions;
- isolated R7 finance PostgreSQL test;
- complete live PostgreSQL suite;
- ESLint;
- TypeScript typecheck;
- production build.

## Boundaries and next tranche

The operation matrix records Invoice routes as not implemented. Current Invoice persistence does not yet provide all qualified draft, issue, send, and line commands. The next R7 tranche is to complete only the frozen invoice domain prerequisites and expose those operations through thin authorized adapters. Money remains integer minor units, browser input cannot set totals or canonical status, and issued documents remain immutable.

Payment/Reconciliation HTTP, products/packages beyond the authorized catalogue scope, contracts/signatures, refunds/ledger expansion, providers/webhooks, subscriptions, entitlements, and reconciliation remain incomplete. This checkpoint does not unlock R8.
