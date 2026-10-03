# P4-R13-C1 — Enterprise operations qualification

STATUS: **P4-R13-C1 — ACCEPTED. NOT MERGED.**

DATE: 3 October 2026

OWNER ACCEPTANCE: the owner's R13 directive, after the exact-head gates in this file passed. This is not V1.0 certification and it does not start R14 implementation.

The product behavior this record accepts is `f56ec78eb7304e8883507cf5fe579302e770ec2c`. A later documentation commit that only cites this record is not a new product head.

## Authority

| Record | SHA / reference |
|---|---|
| Previous main | `8717ad284ef65bbd8105bb5f5849184d9306896a` |
| G0 freeze | `cdc4e8518a34a4787ac5268b9f7798fe25d1d25a` |
| G0 acceptance | `560937214f293ae798011a26862cf321ebf84c1f` |
| Implementation authorization | `40426c370c97a66f15878c11fe9d2b3ea94dec03` — `docs/phase-4/PHASE-4-R13-IMPLEMENTATION-AUTHORIZATION.md` |
| Qualification head | `f56ec78eb7304e8883507cf5fe579302e770ec2c` |
| Pull request | #23 |
| Owner acceptance | `docs/phase-4/PHASE-4-R13-IMPLEMENTATION-ACCEPTED.md` |

## What passed on `f56ec78eb7304e8883507cf5fe579302e770ec2c`

GitHub Actions, `ubuntu-latest`, PostgreSQL 16 (`postgres:16`). There is no separate production deploy of this SHA.

| Workflow | Result | Run |
|---|---|---|
| R3 Review Qualification | success | [37119116199](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37119116199) |
| R3 Browser Qualification | success | [37119116269](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37119116269) |
| R4 Tenancy Qualification | success | [37119116213](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37119116213) |
| R4 Browser Qualification | success | [37119116237](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37119116237) |
| R5 Contract Enhanced Qualification | success | [37119116247](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37119116247) |
| R5 Implementation Qualification | success | [37119116355](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37119116355) |
| R5 Browser Qualification | success | [37119116171](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37119116171) |
| R6 Implementation Qualification | success | [37119116166](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37119116166) |
| R7 Implementation Qualification | success | [37119116242](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37119116242) |
| R8 Implementation Qualification | success | [37119116225](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37119116225) |
| R9 Implementation Qualification, `qualify` and `reader` | success | [37119116159](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37119116159) |
| R10 Implementation Qualification, `qualify` and `desk` | success | [37119116210](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37119116210) |
| R11 Implementation Qualification, `qualify` and `desk` | success | [37119116309](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37119116309) |
| R12 Implementation Qualification, `qualify` and `desk` | success | [37119116303](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37119116303) |
| R13 Implementation Qualification, `qualify` and `desk` | success | [37119116233](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37119116233) |

R13 `qualify`: `r13_verified: true`, `runtime_bypass_rls: false`, drift **No difference detected**, unit tests **74 files / 610 passed** (including `r13-policy.test.ts`, 3 tests), live PostgreSQL tests **36 files / 252 passed** (including `r13-operations.database.test.ts`, 2 tests, and `src/app/api/v1/r13/hostile-http.database.test.ts`, 1 test), lint, typecheck, production build, and `npm audit --omit=dev --audit-level=high` reported **0 vulnerabilities**. Desk job `111191615641` succeeded (`R13 desk qualification passed`).

`npm ci` still reports 7 high findings in the development tree. The production audit is the release gate. Dependabot on the default branch reported 1 high and 2 moderate at push time. Those findings are outside that gate. This hosted qualification is not a production deployment.

## Accepted surface

Organization operational preferences in `ops.organization_settings`: timezone limited to UTC, Asia/Kolkata, America/New_York, or Europe/London; week start Monday or Sunday; support label 1–80 characters without controls; optimistic `expectedVersion`. Integration declarations for EMAIL, STORAGE, and PAYMENT only, stored as DECLARED or DISABLED. A missing row reads as UNCONFIGURED. Verify on a DECLARED row inserts `ops.integration_attempts` with result `PROVIDER_UNAVAILABLE` and does not change state. No secret column. No VERIFIED state. Commands are team-only, same-origin, reason-bound, recent-auth and MFA bound, idempotent, and audited. The browser cannot supply organization, role, admin, verified, status, or secret. UI is `/app/operations/desk` only. Opening the desk grants nothing. `iam.organizations.settings` stays `{}`.

Activated keys, already frozen, now stage-active: `settings.manage` and `integration.manage`. No new permission key. Registry length stays 131.

## Still locked

Teams, departments, invitations, and role administration stay the accepted R5/R3 surfaces and are not reimplemented. `notification.read.own` and `emailaccount.manage` are not an R13 notification or email engine. `file.view` and `file.version` are not R13 storage. `platform.incidents` stays an R2 table with no new incident API. No AI provider and no AI trust-boundary file, because no AI permission exists. No R13 worker and no worker token. No backup, deployment, monitoring, or V1.0 certification. Fixture screens other than `/app/operations/desk` are not replaced. Open pull requests #8 and #10 are not part of this acceptance. R14/V1.0 remains excluded from the owner-approved enhanced qualification waiver and still requires genuine external independent review.

## Merge

Not merged. Merge waits until the documentation commit that cites this record is green, and then uses a merge commit. R14 may enter G0 / V1.0 certification planning only after that merge is recorded. R14 implementation is not authorized.
