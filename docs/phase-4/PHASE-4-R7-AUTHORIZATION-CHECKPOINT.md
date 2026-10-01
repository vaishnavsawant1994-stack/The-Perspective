# R7 Authorization Checkpoint

Status date: 29 September 2026

Status: authorization implementation qualified on code SHA `06b3c688bdc816b40710572b11134ec70b30c11c`. This record requires its own exact-head qualification before the checkpoint is complete.

## Contract resolution

Owner-accepted G0 is recorded in `PHASE-4-R7-G0-ACCEPTED.md` at G0 contract SHA `f720f22f2500a89ae48819c715eb0e72f21e532e`. G0 freezes the proposal lifecycle as `DRAFT → READY → SENT → VIEWED → ACCEPTED | DECLINED | EXPIRED | SUPERSEDED`, defines acceptance as an auditable command, and names `POST /api/v1/r7/proposals/:id/accept`.

The registry's `proposal.approve` key is an R6 Commercial review permission whose actions are review, approve, and reject. It does not represent customer acceptance and remains R6-only. R7 implements the separately named `proposal.accept` permission. Tests pin both the distinction and the fail-closed behavior: an R6 `proposal.approve` grant cannot authorize R7 acceptance. Neither permission is duplicated or aliased.

## Qualified code head

Implementation SHA: `06b3c688bdc816b40710572b11134ec70b30c11c`

Parent: `0cc60b4f159fcb7975f1b7ffa2ed65ee49f3e3ee`

Exact-head run: [R7 Implementation Qualification #39](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36520334857) — SUCCESS, on the implementation SHA above.

The run passed dependency installation, Prisma validation and generation, R2–R7 migrations, unit tests, deterministic inherited fixture seeding, isolated R7 finance live tests, the full live PostgreSQL suite, ESLint, TypeScript, and the production build. The unit suite included R7 authorization tests and inherited R3–R6 authentication, tenant-isolation, and authorization regressions. The database suite included inherited authorization boundaries. The permanent R7 persistence foundation checkpoint remains recorded separately.

## Active R7 authorization surface

All operations below are exercised through `evaluateAuthorization`, with allow cases and denied cases when required authority or obligations are missing:

- `proposal.view`, `proposal.edit`, `proposal.send`, `proposal.accept`
- `invoice.view`, `invoice.edit`, `invoice.issue`, `invoice.send`
- `payment.view`, `payment.reconcile`

The active-stage configuration is `{R5, R6, R7}`. The compatibility test pins `proposal.view`, `proposal.edit`, and `proposal.send` as registry keys stamped R6 but routed to R7 policy while R7 is active. With R7 absent, those R7 operations deny; they never fall through to the R6 binder. `proposal.approve` remains an R6 operation and does not authorize R7 acceptance.

## Hostile authorization evidence

Permanent tests cover:

- Cross-tenant resource IDs, wrong resource types, selected-organization and membership-context mismatch, and forged resource/organization claims.
- Missing, inactive, revoked, or expired authority; missing permissions; and R6-to-R7 permission laundering.
- Caller-supplied field-policy attempts, unsupported fields, invalid scopes, forged surfaces, and unknown permission keys.
- Lifecycle bypass, absent workflow obligations, stale proposal versions, separation-of-duties failures, and required invoice-issue/payment-reconciliation obligations.
- Client-style payment status forgery and resource-context laundering.
- Physical table presence is not authorization; permission decisions are made through the registry, stage routing, trusted context, and policy evaluator.

An observed selected-organization mismatch was repaired in the R7 policy: the tenant's organization, membership ID, and surface must agree with the authenticated membership context. Resolver tests exercise active membership and reject inactive, revoked, or expired authority.

## Dormant and excluded capabilities

These registered R7 capabilities remain denied:

- `commercial.exception.approve`
- `contract.edit`, `contract.send`, `contract.view`
- `package.manage`
- `payment.refund`

Other G0 vocabulary not present in the registry and not activated by this checkpoint includes `contract.manage`, `contract.sign.request`, `invoice.manage`, `invoice.finalize`, `subscription.view`, `subscription.manage`, `entitlement.view`, and `catalogue.manage`. No permission is activated merely because a corresponding database table exists.

## Boundaries and next gate

This checkpoint covers authorization only. No R7 HTTP routes, browser operations, CSRF/origin behavior, API projections, or API-level attack evidence exist yet. Contract/signature, package, refund, subscription, entitlement, provider, webhook, and other later R7 slices remain unimplemented or dormant as listed above.

R7 Authorization may be called QUALIFIED, and R7 HTTP may be unlocked, only after the full exact-head qualification succeeds on the commit containing this checkpoint. This does not constitute R7 acceptance, merge authorization, or unlock any R8+ work.
