# The Perspective — Functional Audit Snapshot

**Evidence date:** 2026-11-19 UTC

**Production baseline:** `main@3fa80397963761d29d4e972fadf4f098e50e8c75`
**Status:** Partial qualification. V1.0 is not certified; V1.1 is not released.

This is an evidence snapshot, not a completion claim. Counts are tied to the source and test runs shown below. Historical files may describe different commits or hosting configurations.

## Source and automated UI inventory

The checked V1.1 candidate was `9fd5ba19faec91a421b9345e420d9eee33949287` in [PR #73](https://github.com/vaishnavsawant1994-stack/The-Perspective/pull/73). GitHub's `V1 UI Control Qualification` run [44349785195](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/44349785195) passed on that exact source commit.

| Measure | Result | Scope |
| --- | ---: | --- |
| Static authenticated routes inspected | 168 | Team Workspace (including the Profile Network editorial screen), Client Portal and My Perspective; dynamic and public routes excluded |
| Visible controls discovered | 12,251 | Links, buttons, inputs, selects, textareas, summaries and ARIA/tabindex controls |
| Enabled controls that accepted focus | 12,219 | Disabled controls are not counted as focusable |
| Reported route/control failures | 0 | Route response/render checks, accessible names, dead links, keyboard focus, console/API errors, and desktop/mobile horizontal overflow |
| Full functional control activations | Not measured | The scanner does not click every control or verify every business transaction and persisted effect |
| Public route coverage | Not measured | No complete public-route or dynamic-slug browser matrix is represented here |

The per-route evidence is in [ROUTE-AND-CONTROL-MATRIX.csv](./ROUTE-AND-CONTROL-MATRIX.csv). The GitHub artifact is retained through 2026-12-02. It records route-level counts and outcomes, not screenshots or proof that each action was activated.

A later exact-head V1 UI Control Qualification on PR #75 head `1c9ced0c11209bc1841abd6ef7df4bb8a7b3187c` passed 17/17 GitHub workflows. Its retained artifact reports 167 authenticated routes, 12,185 visible controls, 12,153 controls accepting focus, zero scanner failures, and no desktop or mobile overflow. This run is a separate V1.0 route-fix candidate; it does not supersede the PR #73 V1.1 result above. It still does not activate each control or verify every persisted workflow.

The current PR #73 head is still open and draft. Its 17 exact-head Actions runs passed at `9fd5ba1…`; the PR remains unmerged. A separate timezone repair is in [PR #74](https://github.com/vaishnavsawant1994-stack/The-Perspective/pull/74), whose current exact head is `90e553b0e797f64cdd470faadeaa3d127b8d2cbe`. On 2026-11-19, GitHub qualification passed 17/17 runs on that exact head. Local qualification passed 647 unit tests, 266 database tests, TypeScript, production build, migration status, schema drift, and database contract verification. PR #74 is open and awaits its required human review.

## Live endpoint probes

Read-only HTTP probes were made on 2026-11-19:

| Environment | Path | Result | Interpretation |
| --- | --- | --- | --- |
| Production `www.thetimesofperspective.com` | `/` | HTTP 200 | Homepage responds; this does not prove authenticated workflows |
| Production | `/api/health/live` | HTTP 200 | Liveness endpoint responds |
| Production | `/api/health/ready` | HTTP 200 | Readiness endpoint responds |
| Hostinger staging `daily-limegreen-woodcock-36.hostingersite.com` | `/` | HTTP 200 | Homepage responds |
| Hostinger staging | `/api/health/ready` | HTTP 200 | Readiness endpoint responds |
| Hostinger staging | `/companies`, `/professionals`, `/editors` | HTTP 404 | Profile Network directory routes are not available at this staging URL |
| Hostinger staging | `/companies/nonexistent-codex-probe` | HTTP 404 | Unknown profile route is not available; this does not verify application-level 404 behavior |

The Hostinger connector is configured and enabled in local Codex configuration, but its tools were not loaded into this session. The computer-use browser host was unavailable. Therefore hPanel deployment IDs/source SHA, environment variables, runtime logs, and staging database role were not independently read back. No hosting, database, DNS, or production settings were changed.

### Production public-route probe

Against `main@3fa80397963761d29d4e972fadf4f098e50e8c75`, the source contains 240 page files. Removing route groups and deduplicating yielded 222 static URL paths; 18 dynamic page files were excluded from this probe. All 222 static paths were requested on production: 39 returned HTTP 200, 168 returned the expected login redirect (307), 14 returned canonical redirects (308), and `/500` returned its intentional error response. This establishes route reachability only, not content correctness or interaction behavior.

A separate read-only crawl tested 300 URLs discovered through the production sitemap and homepage links. It found no HTTP 4xx responses or transport errors and recorded 12 redirects. The crawl was capped at 300 URLs and is not exhaustive. Independently, the eight production targets repaired by [PR #75](https://github.com/vaishnavsawant1994-stack/The-Perspective/pull/75) returned HTTP 404: `/travel`, `/books`, `/strategy`, `/opinion`, `/design`, and the three legacy magazine issue URLs. PR #75 is open, unmerged, and its 17/17 required workflow runs passed on head `1c9ced0c11209bc1841abd6ef7df4bb8a7b3187c`. Its local qualification passed 649 unit tests, TypeScript, changed-file lint, and a production build; its Hostinger preview verified the repaired routes. Production does not yet contain that repair.

## Database and security evidence

On 2026-11-19, Neon readback showed production branch `br-icy-mountain-bak8ooxk` in project `nameless-surf-82295602` and staging branch `br-cold-hat-ba18b0tj` in project `hidden-haze-29775614` are both `ready` and `protected=false`. Neither branch protection state or database schema was changed. The production role membership change is recorded below.

Read-only production catalog inspection on 2026-11-19 confirmed three idle PgBouncer sessions under login role `perspective_hostinger_runtime`. Although it is `NOSUPERUSER`, `NOCREATEROLE`, `NOCREATEDB`, and `NOBYPASSRLS`, this login has `SELECT`, `INSERT`, `UPDATE`, and `DELETE` on all 18 `iam` tables, all 11 `platform` tables, and `audit.audit_events`. RLS is disabled on 30 of those 31 tables; only `platform.resources` has RLS enabled and forced. This is a high-severity least-privilege and database-containment gap: compromise of this credential or a suitable injection path would not be contained by table-level RLS/grant restrictions on those 30 tables. The catalog finding alone does not demonstrate a breach or an exploitable injection path, and these grants may support current application queries.

The production login initially lacked membership in `perspective_runtime`; `pg_has_role(..., 'SET')` returned false. The application source uses `SET LOCAL ROLE perspective_runtime` in tenant-scoped transaction helpers used by R6–R13 modules. On 2026-11-19, a narrowly scoped membership was granted with `INHERIT FALSE, SET TRUE`, matching the existing restricted role pattern. Readback confirmed the login can set the role without inheriting its privileges, and a read-only transaction successfully ran `SET LOCAL ROLE perspective_runtime`; inside it `current_user` was `perspective_runtime`, `platform.resources` SELECT was allowed, and INSERT was denied. No application rows were read or written. This repairs the database role-switch prerequisite for those code paths if this login is the deployed Hostinger `DATABASE_URL` identity; that hPanel mapping and a real authenticated workflow remain unverified. The direct DML grants on the 30 no-RLS tables remain unresolved and require least-privilege review. The repository's R4 migration defines the restricted `NOLOGIN`, `NOBYPASSRLS` role; the R14 contract verifies role flags but does not map production login grants to least-privilege operations.

The staging database is not empty: read-only inspection found 24 migration records, 146 application tables, and approximately 1,372 estimated rows. The data provenance has not been confirmed as synthetic, so no test writes were made. The staging login role has elevated role/database creation and RLS-bypass attributes and was not seen in active application sessions during the sample.

The production branch has no automatic snapshot schedule. Neon lists one manual snapshot, `production-safety-check-2026-11-17`, expiring 2026-11-24; project history retention is six hours. No restore or rollback drill was performed in this session.

The local database qualification used a disposable PostgreSQL 17 cluster on loopback in `Asia/Calcutta`, applied all 28 migrations for the tested V1.1 worktree, and used guarded synthetic seed data. It verified migration status, no schema drift using a fresh shadow database, catalog/RLS contracts, and 266 database tests. No Neon or production database was used for test writes. The temporary PostgreSQL server was stopped after qualification.

## Remaining acceptance gates

| Gate | Status | What is still needed |
| --- | --- | --- |
| Production tenant runtime role switching | Database prerequisite repaired | `perspective_hostinger_runtime` can now `SET ROLE perspective_runtime` without inheriting its privileges; a live transaction verified SELECT/INSERT boundaries. Verify this is the deployed Hostinger login and run authenticated R6–R13 workflows |
| Production runtime database least privilege | **High-severity release gate** | On 2026-11-19, read-only catalog checks confirmed `perspective_hostinger_runtime` has full table DML on 30 tables with RLS disabled, including all 18 IAM tables. This is a capability/containment finding, not evidence of breach. Trace legitimate application and migration needs, document and approve an appropriate least-privilege boundary, add regression coverage, and retest authentication, MFA, tenancy and critical workflows before accepting the permission model. No table-level grants were changed; the restricted-role membership is documented above |
| Hostinger source identity and runtime configuration | Partial / blocked | Neon shows a restricted Hostinger-named runtime login with active pooled sessions, but hPanel deployment SHA/ID, environment variables, runtime logs, and database-target mapping remain unverified because Hostinger tools and reliable browser control were unavailable |
| Production routes repaired by PR #75 | Blocked | Eight current production URLs still return 404; merge requires a human review under the active branch protection, and the repair is not deployed |
| Staging data provenance and role safety | Blocked | Staging contains 24 migrations, 146 tables and estimated rows; confirm data is synthetic and replace/disable the elevated app login before using the database for fixtures |
| Staging Profile Network acceptance | Blocked | Deploy an approved candidate to staging after verifying its target; then run authenticated editorial and public directory workflows, including unknown-slug behavior |
| Production owner login and MFA | Not tested | Legitimate owner performs the real authentication/MFA flow against the verified production source |
| Production tenant isolation | Not accepted | Run positive and cross-tenant denial journeys with authorized production/staging test identities on the exact verified release candidate |
| Human alert delivery and acknowledgement | Not tested | Trigger a safe synthetic alert and observe an authorized human notification and acknowledgement |
| Backup recovery and rollback | Blocked / partial historical | No automatic snapshot schedule is configured; the listed manual snapshot expires 2026-11-24 and history retention is six hours. Repeat encrypted backup, isolated restore, and rollback rehearsal in verified nonproduction and document recovery objectives |
| Neon production branch protection | Blocked | Production remains unprotected due to the reported plan limit; resolve without weakening another branch or purchasing an unapproved upgrade |
| Independent review | Blocked | The required separate reviewer is not available through the connected GitHub account; an `omgaj` review request was rejected because that account is not a repository collaborator. No self-approval was used |
| V1.1 final acceptance | Blocked | Complete exact Hostinger source/config verification, editorial end-to-end workflow, accessibility/responsive browser acceptance and approved content/source review |
| Final release certification | Not eligible | Close required technical/operational gates, verify final deployed SHA, then make the release decision; V1.0 remains uncertified and V1.1 remains unreleased |

## Evidence limits

The 168-route and 167-route CI scans are authenticated UI evidence, but neither is a manual click-through of every route in the repository. They do not exercise every state-changing control, test every successful and denied API mutation, inspect every public route or dynamic slug, verify production persistence, validate journalism, or prove Hostinger is running the tested source. A passing CI or HTTP health probe must not be presented as full product acceptance.
