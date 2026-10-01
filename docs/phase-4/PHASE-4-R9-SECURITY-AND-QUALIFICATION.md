# R9 Security and Qualification Contract

Status: **FROZEN WITH P4-R9-G0 — IMPLEMENTATION NOT AUTHORIZED**
Contract: `PHASE-4-R9-G0-FREEZE.md`

## Authority chain

The chain stays the R5 chain:

```text
authenticated identity
  → organization membership
  → role
  → permission
  → scope
  → trusted resource context
  → record, field, and workflow policy
  → allow or deny
  → command
  → transaction
  → PostgreSQL
  → audit
```

A permission is not a bypass. A byline is not a grant. The first membership to open a desk is not a grant. The browser never supplies organization, membership, permission, actor, issue state, readiness, clearance, digest, or snapshot identity.

Helena Marlow is a legal fixture only when the test seed creates a user, a membership, and an explicit permission grant. A test that sets `actor = "Helena Marlow"` in the request body is a hostile case, not a setup.

## Hostile cases the implementation must keep failing

These cases are requirements. They are not tests yet, because implementation is not authorized. When implementation starts, each row becomes a permanent regression. A later repair may not delete the assertion.

| Area | Attack that must fail closed |
|---|---|
| Authentication | anonymous desk call, invalid session, expired session |
| Tenant | wrong organization on an issue, placement, snapshot, schedule, or shelf |
| Authorization | missing permission, editor calling `publication.publish` or `publish.schedule`, client calling a TEAM command |
| Laundering | body contains permission, organization, membership, actor, status, or `ready` |
| First-login grant | a user with no publishing grant becomes publisher by opening the desk |
| Workflow | skipped state, mark ready from `ISSUE_DRAFT`, publish from assembly, archive of an unpublished issue |
| Readiness | approved but uncleared story, uncleared Harbor Press, unprepared story, browser readiness flag |
| Version | placement of a foreign version, publish of a superseded version, later revision mutating Issue 12 |
| Schedule | second pending time, past time, worker publishing after clearance was removed |
| Replay | same key with a changed payload, second snapshot, second edition |
| Projection | unpublished title, dek, body, slug, or premium count on any public route, sitemap, or metadata |
| Direct URL | unpublished article or issue described as existing, or returning the draft body |
| RLS | a non-bypass role reading another tenant's draft, or a superuser session offered as the RLS proof |
| Transaction | forced audit failure leaves no snapshot and no completed receipt |

Concealment is a 404 for a foreign, missing, or unpublished public id. A validation failure on a row the desk caller is allowed to see is not turned into success.

## RLS qualification

The hosted test connects as the application role that HTTP uses. That role is not a superuser and does not bypass RLS. The test sets `app.organization_id` for tenant A and proves tenant B's draft issue is absent. It then unsets the setting and proves the desk function returns nothing.

A test that connects as the migration owner, a superuser, or any role with `BYPASSRLS` and then reports success is a failed qualification. Application-level filtering without that role test is also a failed qualification.

## Concurrency qualification

Two database sessions, not one session run twice, both attempt publication of the same issue. Separately, both attempt scheduling of the same issue at different times.

The required outcome is one authoritative snapshot, one published issue, no second edition, and no torn row. The loser receives the conflict defined in the API matrix, or the idempotent original if it presented the same key and payload. A stale `row_version` check on a single connection is required and is not sufficient.

## Defect rule

A real failure stays a failure. The repair is the smallest change that makes the frozen rule true, plus the regression that caught it. Qualification then runs again on the new head.

The implementation must not remove the test, weaken the expected status, skip authorization, drop RLS, connect the test as a superuser to turn it green, or change this freeze so the code will pass. A change to the freeze requires an owner addendum before the code changes.

## Qualification sequence

R9 is not qualified because a laptop build passed, and it is not qualified because a reference preview rendered a magazine. The sequence is:

1. Owner freeze of this G0 package.
2. Separate implementation authorization.
3. Implementation only of the frozen commands, on a branch from the then-current `main`.
4. Focused tests for the command just built, including the four fixtures.
5. Hostile HTTP tests.
6. Real PostgreSQL tests: non-bypass RLS, two-session concurrency, idempotency, and rollback.
7. Inherited R1–R8 regression on that same head.
8. Lint, TypeScript, migration status, drift check, and production build.
9. Reader qualification on the existing `/magazine/read/[slug]` route: pages, thumbnails, type size, fullscreen, keyboard arrows, and a mobile viewport with no horizontal overflow.
10. Public-projection qualification on the existing routes, sitemap, and metadata.
11. Exact-head hosted qualification of that commit.
12. A permanent R9 checkpoint that names the SHA and the run.
13. Owner acceptance.
14. Merge into `main` by merge commit, the same method as R6, R7, and R8.
15. Only then may R10 planning be authorized.

Until step 2, steps 3 through 15 do not start. This G0 commit is not step 1. Step 1 is the owner's acceptance of the freeze.

## Acceptance requirements

R9 implementation can be accepted only when all of the following are true:

- this G0 is still the contract, or a named owner addendum has replaced a specific section
- every authorized command exists and no dormant key was activated
- no R10 distribution, portal, checkout, or second application was built
- the four fixtures have hosted evidence, including Issue 12 remaining on its published version after a later revision
- unpublished Meridian, Winter Index before clearance, and The Unset Table before publication are absent from every public surface
- tenant isolation has hosted evidence from a non-bypass role
- two-session concurrency, idempotency, and rollback have hosted evidence
- the checkpoint names one exact SHA and one successful exact-head run
- the owner acceptance and the merge commit exist

A green local test run does not satisfy that list. The reference preview does not satisfy that list.

## What this package is

This package is Authorization A. It is the inventory, the domain, the workflow, the API matrix, the database contract, and the security contract. It is not Authorization B. It is not owner acceptance of the freeze. It creates no table and no route. It does not publish Meridian.
