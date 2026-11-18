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

The current PR #73 head is still open and draft. Its 17 exact-head Actions runs passed at `9fd5ba1…`; the PR remains unmerged. A separate timezone repair is in [PR #74](https://github.com/vaishnavsawant1994-stack/The-Perspective/pull/74), repair commit `2c7ae7252b8a102de43bbdebbd6e1e069db26c68`. On 2026-11-19, local qualification of that patch passed 647 unit tests, 266 database tests, TypeScript, production build, migration status, schema drift, and database contract verification. Confirm GitHub qualification on PR #74's latest exact head before closing the defect or merging.

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

## Database and security evidence

On 2026-11-19, Neon readback showed production branch `br-icy-mountain-bak8ooxk` in project `nameless-surf-82295602` and staging branch `br-cold-hat-ba18b0tj` in project `hidden-haze-29775614` are both `ready` and `protected=false`. Neither was modified.

The local database qualification used a disposable PostgreSQL 17 cluster on loopback in `Asia/Calcutta`, applied all 28 migrations for the tested V1.1 worktree, and used guarded synthetic seed data. It verified migration status, no schema drift using a fresh shadow database, catalog/RLS contracts, and 266 database tests. No Neon or production database was used for test writes. The temporary PostgreSQL server was stopped after qualification.

## Remaining acceptance gates

| Gate | Status | What is still needed |
| --- | --- | --- |
| Hostinger source identity and runtime configuration | Blocked | Load the already authorized Hostinger connector or restore browser access; read back deployment SHA/ID, runtime logs, database target and role without exposing secret values |
| Staging Profile Network acceptance | Blocked | Deploy an approved candidate to staging after verifying its target; then run authenticated editorial and public directory workflows, including unknown-slug behavior |
| Production owner login and MFA | Not tested | Legitimate owner performs the real authentication/MFA flow against the verified production source |
| Production tenant isolation | Not accepted | Run positive and cross-tenant denial journeys with authorized production/staging test identities on the exact verified release candidate |
| Human alert delivery and acknowledgement | Not tested | Trigger a safe synthetic alert and observe an authorized human notification and acknowledgement |
| Backup recovery and rollback | Partial/historical | The 2026-11-18 status record reports encrypted dump restore evidence; repeat current restore/rollback rehearsal in verified nonproduction and document recovery objectives |
| Neon production branch protection | Blocked | Production remains unprotected due to the reported plan limit; resolve without weakening another branch or purchasing an unapproved upgrade |
| V1.1 final acceptance | Blocked | Complete exact Hostinger source/config verification, editorial end-to-end workflow, accessibility/responsive browser acceptance and approved content/source review |
| Final release certification | Not eligible | Close required technical/operational gates, verify final deployed SHA, then make the release decision; V1.0 remains uncertified and V1.1 remains unreleased |

## Evidence limits

The 168-route CI scanner is valuable authenticated UI evidence, but it is not a manual click-through of every route in the repository. It does not exercise every state-changing control, test every successful and denied API mutation, inspect every public route or dynamic slug, verify production persistence, validate journalism, or prove Hostinger is running the tested source. A passing CI or HTTP health probe must not be presented as full product acceptance.
