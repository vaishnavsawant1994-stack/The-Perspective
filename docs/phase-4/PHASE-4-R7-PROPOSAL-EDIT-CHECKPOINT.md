# R7 Proposal Edit Qualification Checkpoint

Status: **QUALIFIED**  
Implementation HEAD: `06a2d2ff717d2fb028f3e576e5a3c394741b4788`  
Parent: `5b596e4b8c1e40e88120d2d19709cb2ecefd1b72`  
Exact-head qualification: [R7 Implementation Qualification #76](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36549336927) — **SUCCESS**  
Date: 29 September 2026

This checkpoint closes only the Proposal Edit implementation slice. It does not qualify Proposal Send, customer acceptance mutation, Invoice HTTP, Payment HTTP, or the whole R7 API. R7 remains incomplete, unaccepted, and unmerged. R8 remains locked.

## Frozen command contract

The Owner-frozen Proposal Edit command is TEAM-owned and applies only to the current mutable DRAFT or READY proposal version. It may change proposal currency and existing line `description`, `quantity`, and `unitAmountMinor` fields. CLIENT members have no edit authority.

The command preserves READY as READY and rejects non-mutable or superseded versions, including SENT and ACCEPTED. It does not add, remove, or reorder lines. The browser cannot provide tenant, owner, lifecycle, authorization context, calculated totals, or financial truth. The server validates canonical deal currency, validates integer-minor-unit amounts and quantities under the existing financial rules, and recomputes line and version totals.

Every edit uses exact current-version and optimistic row-version checks. The proposal, version, lines, idempotency/result state, and required audit evidence are changed atomically in a serializable tenant transaction. Stale writes and lifecycle races fail safely without partial line/total/audit effects.

## Implemented surface

- Domain command: `editDraftProposal` in `src/modules/r7/proposal-edit.ts`.
- Explicit adapter: `POST /api/v1/r7/proposals/:proposalId/edit`.
- Authorization: `proposal.edit` with the explicit `edit` action and edit-only field policy. Proposal Create retains its separate create-only field policy; generic updates remain denied.
- Resource authority: server loads the canonical proposal, tenant, current version, deal relationship, and lines. Browser resource and policy claims do not establish authority.
- Audit: edit evidence is committed with the mutation. It follows the established R7 Create audit model: `target_resource_id` is null, while canonical proposal/version identifiers and the relevant redacted change evidence are stored in immutable `redacted_diff`. The caller-supplied `resource_id` is checked against the canonical proposal row and is not used as audit authority.

## Hostile and regression evidence

The exact-head run includes the project’s established install, Prisma, migration, isolated R7 finance, unit, live PostgreSQL, lint, TypeScript, and production build gates. Run #74 step history reports success for all steps.

Proposal Edit route and database tests cover authenticated TEAM authority, CLIENT denial, wrong tenant and foreign resource identifiers, unauthorized fields and field laundering, lifecycle injection, malformed and overflowing money/quantity values, currency mismatch, stale/current-version checks, line-structure mutation, edit after SENT, and no-residue behavior. The command rejects any non-mutable lifecycle state; the persisted frozen-state regression explicitly exercises SENT.

Real PostgreSQL tests cover simultaneous edit-versus-edit and edit-versus-server-owned lifecycle freeze. In the edit-wins outcome the subsequent freeze leaves a SENT immutable version with internally consistent line/subtotal/total values and exactly one edit audit. In the freeze-wins outcome edit is denied and the original line and totals remain with no edit audit residue. The separate optimistic version tests prove stale edits are denied rather than silently overwriting a newer value.

Audit atomicity is also exercised after writes have begun: the database test uses an otherwise authorized TEAM context with an empty request ID. Proposal and version/line writes proceed inside the transaction, the SECURITY DEFINER audit append rejects the missing request context, the command fails closed, and the test compares persisted line/version/row state and audit count with the pre-attempt snapshot to prove rollback/no residue.

## Exact-head qualification evidence

Qualification #76 ran on implementation HEAD `06a2d2ff717d2fb028f3e576e5a3c394741b4788` and completed **SUCCESS**. The recorded job steps passed:

- dependency installation;
- Prisma validation and generation;
- isolated shadow database setup;
- R2–R7 migration application;
- unit tests;
- deterministic inherited fixture seeding;
- isolated R7 finance live tests;
- full live PostgreSQL tests, including Proposal Edit database, audit rollback, and concurrency cases;
- ESLint;
- TypeScript typecheck;
- production build.

Earlier exact-head attempts exposed an audit-target FK mismatch. The repair aligned edit audit writes with the existing R7 Create convention rather than adding an R6 resource-envelope dependency. Qualification #73 passed on the repaired implementation. Run #74 qualified the explicit edit-versus-freeze PostgreSQL race. During checkpoint evidence review, the prior audit-negative case was found to stop at TEAM authorization and therefore did not prove audit append failure rollback. Run #75 proved failure at the audit function after writes begin and passed the complete gate. Run #76 adds an explicit assertion that the rejected append leaves the audit event count unchanged and passed the complete exact-head gate.

## Boundaries and next slice

Proposal list/detail and draft creation retain their earlier independent qualification. Proposal Edit implementation is **QUALIFIED** at `06a2d2ff717d2fb028f3e576e5a3c394741b4788`. The checkpoint documentation HEAD still requires its own full qualification; Proposal Send remains locked until that run succeeds. Customer acceptance remains disabled until its mutation, immutable evidence, idempotency/replay protection, audit, exact-version binding, and PostgreSQL concurrency/HTTP falsification are implemented and qualified. `proposal.approve` remains separate R6 review authority and cannot authorize `proposal.accept`.

Invoice, Payment/Reconciliation, product/package completion, contracts/signatures, financial completion, providers/webhooks, subscriptions, entitlements, reconciliation, whole-R7 falsification, and R1–R6 final regression remain outside this checkpoint. No R8 work is included.
