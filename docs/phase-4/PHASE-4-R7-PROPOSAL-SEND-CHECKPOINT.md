# R7 Proposal Send Qualification Checkpoint

Status: **QUALIFIED**  
Implementation HEAD: `09217a34d97011cda85f4b7beb8761de4430981e`  
Parent: `027c29491c458608a3651121a23b24879f760633`  
Exact-head qualification: [R7 Implementation Qualification #80](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36553335172) — **SUCCESS**  
Date: 29 September 2026

This checkpoint closes only the Proposal Send implementation slice. It does not qualify customer acceptance mutation, Invoice HTTP, Payment/Reconciliation HTTP, or the whole R7 API. Proposal list/detail, create, and edit retain their independent qualification evidence. R7 remains incomplete, unaccepted, and unmerged. R8 remains locked.

## Command contract

Proposal Send is an authenticated TEAM-owned explicit operation requiring `proposal.send`. The route is `POST /api/v1/r7/proposals/:proposalId/send`; it validates same-origin, strict request fields, the required idempotency key, selected organization, active membership, and the exact proposal/version/row version. It builds trusted resource context from server-loaded canonical records. Browser input cannot set tenant, ownership, lifecycle, totals, timestamp, resource policy, or financial truth.

The domain command revalidates the canonical deal stage, customer relationship, proposal and version currency, current version, ordered nonempty lines, integer-minor-unit line calculations, and persisted subtotal/tax/total. Only mutable DRAFT or READY state may proceed. DRAFT passes through server-owned READY and then SENT within the same transaction; READY proceeds to SENT. The current version becomes immutable with a server timestamp. One durable audit record, one outbox send intent, and a completed idempotency receipt commit atomically with the state transition.

The HTTP success response is `202` with `delivery: "QUEUED"`. This confirms durable outbound intent, not external email delivery. External delivery remains owned by the established outbox worker and its delivery evidence.

## Hostile and regression evidence

The permanent route and PostgreSQL tests cover same-origin and TEAM authority, strict input, required idempotency key, exact-version/stale-row rejection, foreign-tenant concealment, canonical relationship/currency/lifecycle/line validation, idempotent duplicate replay, payload mismatch, and a new key after SENT. They verify the version is immutable, proposal/version totals remain consistent, and exactly one send audit, outbox intent, and completed receipt exist.

The database test injects invalid audit context after the transaction has begun and confirms rollback leaves the proposal DRAFT, its version mutable and unissued, and no send audit, outbox event, or idempotency receipt. A successful send is replayed concurrently with the same key and produces one durable business effect.

The initial exact-head run #78 found a PostgreSQL helper-call argument type mismatch: the actor membership argument was passed as an integer instead of UUID. The call was corrected to match the migration signature. Run #79 then exposed the expected lifecycle assertion for a fresh idempotency key against an already SENT proposal; the command checked stale version before lifecycle and returned the wrong denial code. The command now rejects non-mutable lifecycle state before evaluating supplied version tokens. The existing PostgreSQL regression asserts `TRANSITION_DENIED` for this case. No test was weakened.

## Exact-head qualification evidence

Run #80 qualified implementation HEAD `09217a34d97011cda85f4b7beb8761de4430981e` with **SUCCESS**. The exact-head job passed:

- dependency installation;
- Prisma validation and generation;
- isolated shadow database creation;
- R2–R7 migrations;
- unit tests;
- deterministic inherited fixture seeding;
- isolated R7 finance live tests;
- full live PostgreSQL tests, including Proposal Send audit rollback, idempotency/replay, lifecycle, tenant isolation, and durable audit/outbox evidence;
- ESLint;
- TypeScript typecheck;
- production build.

Run #78 and #79 were failed diagnostic attempts described above; run #80 is the complete successful qualification after both repairs.

## Boundaries and next slice

Proposal Send is **QUALIFIED** only at `09217a34d97011cda85f4b7beb8761de4430981e`. The operation matrix and this checkpoint create a new documentation HEAD and require a separate complete exact-head qualification before advancing.

Customer acceptance remains disabled. Its actor model is authenticated CLIENT membership bound to the canonical customer relationship; team staff and external tokens cannot substitute. The distinct `proposal.approve` R6 review permission cannot authorize `proposal.accept`. The acceptance mutation, immutable evidence, transaction-scoped membership/version revalidation, idempotency/replay, audit, concurrency qualification, and HTTP hostile suite remain unimplemented. Invoice and Payment routes remain unimplemented. R8 remains locked.
