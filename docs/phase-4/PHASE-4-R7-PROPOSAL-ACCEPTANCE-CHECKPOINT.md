# R7 Proposal Customer Acceptance Qualification Checkpoint

Status: **QUALIFIED — acceptance slice only**  
Implementation HEAD: `c70931f398d2fb54b71ac3e263e52aff631b1b26`  
Parent: `f2a2d80c6b55f0ab30d69a47eb16200f31a7c318`  
Exact-head qualification: [R7 Implementation Qualification #83](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36557763995) — **SUCCESS**  
Date: 29 September 2026

This checkpoint closes the R7 customer Proposal Acceptance mutation and HTTP slice. It does not qualify the whole Proposal API, Invoice HTTP, Payment/Reconciliation HTTP, or R7 as a release. Proposal read, create, edit, and send retain their own qualification evidence. R7 remains incomplete, unaccepted, and unmerged. R8 remains locked.

## Frozen authority and command

The owner-authorized G0 addendum selects authenticated CLIENT membership as the digital acceptance authority. The customer organization must match the canonical client organization associated with the proposal's commercial client account. No TEAM/staff or external-token fallback exists in this slice.

The HTTP command is `POST /api/v1/r7/proposals/:proposalId/accept`. It requires same-origin, a strict body containing only exact proposal version identifiers and row-version tokens, and a bounded idempotency key. The route resolves authenticated CLIENT context, loads the server-side proposal/customer/version relationship, authorizes `proposal.accept`, enforces exact-current-version, lifecycle, optimistic concurrency, and separation of duties, then invokes the explicit domain command. It never invokes `proposal.approve`; that remains separate R6 review authority.

The transaction-scoped database command revalidates active CLIENT membership, selected customer organization, canonical client-account relationship, distinct creator identity, current proposal/version identity, immutable sent version, expected row version, and lifecycle while holding the appropriate locks. The server generates the acceptance timestamp. Proposal/version state, immutable acceptance evidence, audit, and a completed idempotency receipt commit atomically. The evidence row binds owner and client organizations, account, proposal, exact version and accepted row version, actor user/membership, timestamp, idempotency key, and request/after hashes. Evidence has forced RLS, no direct runtime table privileges, and rejects update/delete; runtime can execute only the narrow SECURITY DEFINER command.

## Hostile and database evidence

Permanent HTTP tests cover wrong origin, malformed/extra body fields, invalid idempotency keys, anonymous and TEAM denial, foreign-resource concealment, CLIENT permission denial, SoD denial, stale or superseded versions, and invocation of only the explicit customer acceptance command.

Real PostgreSQL tests cover atomic audit-failure rollback with no proposal/version/evidence/audit/receipt residue, successful exact-version acceptance, immutable evidence and actor binding, one audit and completed receipt, and simultaneous identical-key requests. The concurrency assertion requires one non-replayed initial result and one replayed result with the same durable acceptance outcome. A different payload under an already-used key is rejected.

Run #82 failed one assertion because the test incorrectly expected the duplicate response's `replayed` flag to equal the initial response's flag. PostgreSQL returned the intended values (`false` for the first execution and `true` for the duplicate). The repair changed only the assertion to explicitly prove those semantics. The full exact-head run #83 then passed; no production logic or existing security test was weakened.

## Exact-head qualification

Run #83 at `c70931f398d2fb54b71ac3e263e52aff631b1b26` passed:

- clean dependency installation;
- Prisma validation and generation;
- isolated shadow database creation;
- R2–R7 migration deployment, status, and drift;
- full unit test suite;
- deterministic inherited seed and seed assertions;
- isolated R7 finance live test;
- full live PostgreSQL suite, including acceptance rollback and concurrency;
- ESLint;
- TypeScript typecheck;
- production build.

## Boundaries and next step

This checkpoint does not claim whole-Proposal API falsification. That integrated attack tranche must cover the already-qualified read routes together with create, edit, send, and accept, including authentication, origin/CSRF, tenant selection, IDOR, permission and field laundering, lifecycle/version enforcement, idempotency/replay, concurrency, rollback, and audit. It is the next authorized tranche after this documentation HEAD independently qualifies.

Invoice and Payment/Reconciliation HTTP remain unimplemented. Contracts, credits/refunds, provider/webhook processing, subscriptions, entitlements, and reconciliation remain outside this checkpoint. R8 remains locked.
