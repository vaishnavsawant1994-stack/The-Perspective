# R8 Security and Qualification Contract

Status: **FROZEN WITH P4-R8-G0 — IMPLEMENTATION NOT AUTHORIZED**
Contract: `PHASE-4-R8-G0-FREEZE.md`

## Authority chain

The chain stays the R5 chain:

authenticated identity → organization membership → role → permission → scope → trusted resource context → record, field, and workflow policy → allow or deny → command → transaction → PostgreSQL → audit.

A permission is not a bypass. A project membership is not a role. A credit is not a grant. A client-safe label is not authorization. The browser never supplies organization, membership, permission, actor, state, approval, or audit identity.

## Hostile cases the implementation must keep failing

These cases are requirements. They are not tests yet, because implementation is not authorized. When implementation starts, each row becomes a permanent regression. A later repair may not delete the assertion.

| Area | Attack that must fail closed |
|---|---|
| Authentication | anonymous call, invalid session, expired session |
| Tenant | wrong organization on a project, draft, asset, questionnaire, or approval |
| Authorization | missing permission, wrong surface, TEAM caller on `approval.client.decide`, client caller on a TEAM command |
| Laundering | body contains permission, organization, membership, resource id, or actor |
| Workflow | skipped state, chosen arbitrary target, transition after `COMPLETED` or `CANCELLED`, design or publish side effect |
| Approval | client decision on the wrong version, on a superseded version, or twice; staff decision stored as client approval; editorial approval treated as client approval |
| Version | stale draft row version, edit of an issued version, foreign version id |
| Questionnaire | second response, receive after lock, client route, response body that names a different client |
| Task | complete while the blocker is open, dependency across projects, task completion moving the project |
| Asset | foreign asset read, internal asset on a client projection, `cleared` without `approved` and `licensed`, caller storage key |
| Projection | client response contains notes, audit, rights notes, or another tenant |
| Replay | same key with a changed payload, duplicate upload, duplicate decision |
| Transaction | forced audit failure leaves no row and no completed receipt |

Concealment is a 404 for a foreign or missing id. A validation failure on a row the caller is allowed to see is not turned into success.

## Defect rule

A real failure stays a failure. The repair is the smallest change that makes the frozen rule true, plus the regression that caught it. Qualification then runs again on the new head.

The implementation must not remove the test, weaken the expected status, skip authorization, drop RLS, or change this freeze so the code will pass. A change to the freeze requires an owner addendum before the code changes.

## Qualification sequence

R8 is not qualified because a laptop build passed. The sequence is:

1. Owner freeze of this G0 package.
2. Separate implementation authorization.
3. Implementation only of the frozen commands.
4. Focused tests for the command just built.
5. Hostile HTTP tests.
6. Real PostgreSQL tests, including RLS, concurrency, and rollback.
7. Inherited R1–R7 regression on that same head.
8. Lint, TypeScript, migration status, drift check, and production build.
9. Exact-head hosted qualification of that commit.
10. A permanent R8 checkpoint that names the SHA and the run.
11. Owner acceptance.
12. Merge into `main` by merge commit, the same method as R6 and R7.
13. Only then may R9 planning be authorized.

Until step 2, steps 3 through 13 do not start.

## Acceptance requirements

R8 implementation can be accepted only when all of the following are true:

- this G0 is still the contract, or a named owner addendum has replaced a specific section
- every authorized command exists and no dormant key was activated
- no R9 publish, magazine, distribution, or portal page was built
- tenant isolation, client projection, workflow, and version rules have hosted evidence
- PostgreSQL RLS, migrations, and drift are clean
- concurrency, idempotency, and rollback have hosted evidence
- the checkpoint names one exact SHA and one successful exact-head run
- the owner acceptance and the merge commit exist

A green local test run does not satisfy that list.

## What this package is

This package is Authorization A. It is the inventory, the domain, the workflow, the API matrix, the database contract, and the security contract. It is not Authorization B. It is not owner acceptance of the freeze. It creates no table and no route.
