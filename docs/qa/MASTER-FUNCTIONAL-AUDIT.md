# The Perspective — Functional Audit Snapshot

## Latest verification update — 2026-11-22

This section supersedes older **current-state** labels below where they conflict; the dated evidence that follows remains historical.

### Exact V1.1 candidate

- PR #73 remains open and draft at `2bdd85102bf52f3817ddae466361885bd2c06359`, based on `main@bc190530d6ab0a76ddeff4874c1ea5e0d5fb28e0`.
- GitHub Actions: **17/17 workflows passed** on that exact head. The Vercel status check is successful. V1 UI Control Qualification run [44972099398](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/44972099398) published artifact [14734092832](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/44972099398/artifacts/14734092832), retained through 2026-12-06.
- The control scanner checks its configured routes and control accessibility/rendering; it does not activate every control or prove all business effects persisted. Exact-head local evidence is recorded in PR #73.
- No PR review submissions are recorded for PR #73. It remains draft; CI success is not a release or production-acceptance decision.

### Live public endpoint recheck

Read-only HTTP probes on 2026-11-22 against `https://www.thetimesofperspective.com` returned HTTP 200 for `/`, `/api/health/live`, `/api/health/ready`, `/travel`, `/books`, `/strategy`, `/opinion`, and `/design`. The five editorial paths resolve after canonical redirects where applicable. This establishes HTTP reachability only and does not identify the deployed source SHA or prove authenticated workflows.

The historical aliases `the-perspective-liart.vercel.app` and `the-perspective-vishnu26.vercel.app` now return Vercel `404 DEPLOYMENT_NOT_FOUND`. They are not valid current production endpoints. Vercel project listing in the connected accounts returned no matching project. The public production domain is responding, but Hostinger connector access currently requests reauthentication, so its deployed source SHA, runtime logs, app-entry mapping, and production `DATABASE_URL` identity remain unverified.

### Production database security and recovery gates

Read-only Neon checks on 2026-11-22 confirmed production project `nameless-surf-82295602`, branch `br-icy-mountain-bak8ooxk` (`production`), is ready and `protected=false`. Its automatic snapshot schedule is empty. The runtime login is `NOSUPERUSER`, `NOCREATEROLE`, `NOCREATEDB`, and `NOBYPASSRLS`, but it has direct `SELECT`, `INSERT`, `UPDATE`, and `DELETE` privileges on all 18 `iam` tables, all 12 `platform` tables, and the one `audit` table. RLS is enabled and forced on one of the 12 `platform` tables; the other listed tables have RLS disabled. This remains a high-severity least-privilege/containment gate. No grants, branch settings, snapshots, database rows, hosting settings, or DNS were changed.

These facts do not establish a breach or an exploitable injection path. Any privilege repair still requires a complete application privilege map and qualification against an isolated, verified nonproduction database before production use.

**Release status:** V1.0 remains uncertified and V1.1 remains unreleased. Production owner login/MFA, production tenant-isolation journeys, alert delivery/acknowledgement, verified Hostinger source/database mapping, least-privilege remediation, backup recovery/cutover and rollback acceptance, and the V1.1 authenticated staging editorial workflow remain unverified or incomplete.

**Evidence checked:** 2026-11-19 Asia/Kolkata (2026-11-18 UTC)

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

The current PR #73 head is still open and draft. Its 17 exact-head Actions runs passed at `9fd5ba1…`; the PR remains unmerged. A separate timezone repair is in [PR #74](https://github.com/vaishnavsawant1994-stack/The-Perspective). The code repair commit is `2c7ae7252b8a102de43bbdebbd6e1e069db26c68`. The docs-only follow-up head `90e553b0e797f64cdd470faadeaa3d127b8d2cbe` and current exact head `6c77fcda5451b55f412c1e8cf062b50ff25ea33b` each passed all 17 GitHub Actions workflows. On the current head, V1 UI Control Qualification inspected 167 authenticated routes and 12,185 visible controls; 12,153 accepted focus and there were zero scanner failures. This scanner does not activate every control or verify every persisted workflow. Local qualification of the code repair passed 647 unit tests, 266 database tests, TypeScript, production build, migration status, schema drift, and database contract verification. PR #74 is open, unmerged, and awaits required human approval.

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

At the initial audit capture, the Hostinger connector tools were not loaded and hPanel deployment details were unavailable. A later read-only Chrome/hPanel and Neon readback on 2026-11-19 is recorded below. Runtime logs and a definitive production-domain-to-webapp mapping remain unverified. No hosting, database, DNS, or production settings were changed.

### Follow-up Hostinger and staging-role readback (2026-11-19)

| Hostinger surface | Evidence | Limit |
| --- | --- | --- |
| `daily-limegreen-woodcock-36.hostingersite.com` | hPanel shows auto-deployment from `main@3fa80397963761d29d4e972fadf4f098e50e8c75`, Node 24.x; homepage and readiness return HTTP 200 | Staging application; no hPanel custom domain is attached |
| `expansive-darkslategray-raccoon-18.hostingersite.com` | hPanel shows deployment `01a1ee5b-c134-723a-b324-d119a137fd94`, also `main@3fa80397963761d29d4e972fadf4f098e50e8c75`, Node 24.x; homepage and readiness return HTTP 200 | Second app entry; no hPanel custom domain is attached |
| `www.thetimesofperspective.com` | Root and readiness return HTTP 200; response identifies Hostinger platform/panel and HCDN | Hostinger serves the domain, but the hPanel readback did not establish which app entry serves it or its `DATABASE_URL` identity |

Both visible Hostinger app entries run the V1.0 `main` baseline, not PR #75. The staging app's environment configuration was mapped to Neon project `hidden-haze-29775614`, branch `br-cold-hat-ba18b0tj`, database `perspective_staging`; secret values were not copied into this report. hPanel runtime logs were not inspected.

Read-only Neon catalog checks found the staging login role `perspective_app` is `LOGIN`, `INHERIT`, `CREATEDB`, `CREATEROLE`, and `BYPASSRLS`; it owns all 619 catalog relations in non-system schemas (146 ordinary tables and 473 indexes) and is a member of `neon_superuser`, `perspective_runtime`, and `perspective_public`. The restricted runtime/public roles themselves are `NOLOGIN`, `NOBYPASSRLS`, and own no objects. Application transaction helpers do switch to the restricted roles, but authentication services also make direct database calls; replacing the elevated login requires a complete privilege and workflow qualification, not just a flag change. No Neon settings, roles, grants, or rows were changed. Staging data provenance remains unconfirmed, so it must not be used for new test fixtures.

### Production public-route probe

Against `main@3fa80397963761d29d4e972fadf4f098e50e8c75`, the source contains 240 page files. Removing route groups and deduplicating yielded 222 static URL paths; 18 dynamic page files were excluded from this probe. All 222 static paths were requested on production: 39 returned HTTP 200, 168 returned the expected login redirect (307), 14 returned canonical redirects (308), and `/500` returned its intentional error response. This establishes route reachability only, not content correctness or interaction behavior.

A separate read-only crawl tested 300 URLs discovered through the production sitemap and homepage links. It found no HTTP 4xx responses or transport errors and recorded 12 redirects. The crawl was capped at 300 URLs and is not exhaustive. Independently, the eight production targets repaired by [PR #75](https://github.com/vaishnavsawant1994-stack/The-Perspective/pull/75) returned HTTP 404: `/travel`, `/books`, `/strategy`, `/opinion`, `/design`, and the three legacy magazine issue URLs. PR #75 is open, unmerged, and its 17/17 required workflow runs passed on head `1c9ced0c11209bc1841abd6ef7df4bb8a7b3187c`. Its local qualification passed 649 unit tests, TypeScript, changed-file lint, and a production build; its Hostinger preview verified the repaired routes. Production does not yet contain that repair.

Follow-up HTTP checks on 2026-11-19 reconfirmed the five category routes return HTTP 404 in production and HTTP 307 to their canonical sections on the PR #75 Hostinger preview. Production `/perspective` and both production health routes return HTTP 200. The two explicitly fictional article slugs withdrawn by merged PR #54 (`/article/human-purpose-ai-world` and `/article/50-leaders`) return HTTP 404 and are absent from the live XML sitemap.

### Dynamic route reachability probe (2026-11-19)

The `main` tree at `3fa80397963761d29d4e972fadf4f098e50e8c75` contains 18 dynamic page-route files. A read-only crawl of the live homepage discovered 44 distinct linked dynamic targets across articles, authors, magazine issues, and personal-magazine profiles; all 44 returned HTTP 200. This checks reachability for the discovered links, not article accuracy, source authenticity, complete page rendering, or interaction behavior.

The same source-defined datasets produced 213 distinct public dynamic targets across 11 families: 137 articles, 11 author profiles, 10 videos, 5 events, 10 topics, 5 magazine categories, 5 podcast shows, 21 podcast episodes, 3 personal-magazine profiles, 5 people, and 1 magazine reader. All 213 returned HTTP 200. Server-rendered HTML for all 213 contained a nonempty `<title>` and `<h1>`; all 5,013 rendered `<img>` tags had an `alt` attribute, and the 16 distinct image URLs found in those pages returned HTTP 200. This does not verify image decoding, browser lazy loading, layout quality, editorial authenticity, or controls.

Eighteen deliberately invalid paths were requested across the dynamic route families. Eleven public content/profile paths returned HTTP 404. Five protected Client resource paths returned HTTP 307 to `/client/login` with the requested path preserved. `/invitation/<invalid-token>` and `/client/activate/<invalid-token>` returned HTTP 200 for their client-rendered shells; the shared read-only `GET /api/v1/auth/invitations/<invalid-token>` returned HTTP 404. The client code maps that non-success response to an unavailable/invalid invitation message, but the hydrated message was not observed in a real browser during this probe. No invitation was accepted and no database write was attempted. This is HTTP behavior evidence, not an authenticated workflow or complete browser acceptance.

## Database and security evidence

On 2026-11-19, Neon readback showed production branch `br-icy-mountain-bak8ooxk` in project `nameless-surf-82295602` and staging branch `br-cold-hat-ba18b0tj` in project `hidden-haze-29775614` are both `ready` and `protected=false`. Neither branch protection state or database schema was changed. The production role membership change is recorded below.

Read-only production catalog inspection on 2026-11-19 confirmed three idle PgBouncer sessions under login role `perspective_hostinger_runtime`. Although it is `NOSUPERUSER`, `NOCREATEROLE`, `NOCREATEDB`, and `NOBYPASSRLS`, this login has `SELECT`, `INSERT`, `UPDATE`, and `DELETE` on all 18 `iam` tables, all 11 `platform` tables, and `audit.audit_events`. RLS is disabled on 30 of those 31 tables; only `platform.resources` has RLS enabled and forced. This is a high-severity least-privilege and database-containment gap: compromise of this credential or a suitable injection path would not be contained by table-level RLS/grant restrictions on those 30 tables. The catalog finding alone does not demonstrate a breach or an exploitable injection path, and these grants may support current application queries.

The production login initially lacked membership in `perspective_runtime`; `pg_has_role(..., 'SET')` returned false. The application source uses `SET LOCAL ROLE perspective_runtime` in tenant-scoped transaction helpers used by R6–R13 modules. On 2026-11-19, a narrowly scoped membership was granted with `INHERIT FALSE, SET TRUE`, matching the existing restricted role pattern. Readback confirmed the login can set the role without inheriting its privileges, and a read-only transaction successfully ran `SET LOCAL ROLE perspective_runtime`; inside it `current_user` was `perspective_runtime`, `platform.resources` SELECT was allowed, and INSERT was denied. No application rows were read or written. This repairs the database role-switch prerequisite for those code paths if this login is the deployed Hostinger `DATABASE_URL` identity; that hPanel mapping and a real authenticated workflow remain unverified. The direct DML grants on the 30 no-RLS tables remain unresolved and require least-privilege review. The repository's R4 migration defines the restricted `NOLOGIN`, `NOBYPASSRLS` role; the R14 contract verifies role flags but does not map production login grants to least-privilege operations.

The staging database is not empty: read-only inspection found 24 migration records, 146 application tables, and approximately 1,372 estimated rows. The data provenance has not been confirmed as synthetic, so no test writes were made. Follow-up catalog inspection confirms the login role has elevated role/database creation and RLS-bypass attributes, owns all 619 catalog relations in non-system schemas (146 ordinary tables and 473 indexes), and belongs to `neon_superuser`; see the detailed readback above.

The production branch has no automatic Neon snapshot schedule. Neon lists one manual snapshot, `production-safety-check-2026-11-17`, expiring 2026-11-24; project history retention is six hours. Separately, the daily encrypted dump workflow [run 44283445934](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/44283445934) succeeded on 2026-11-18 UTC at `main@3fa80397963761d29d4e972fadf4f098e50e8c75`: the 30-day retention tests passed, the private Neon Object Storage copy was downloaded and verified, AES-256 encrypted data was decrypted and matched to the source dump, and the dump restored into an isolated PostgreSQL service with 146 application tables verified. The workflow expired zero objects because none were older than 30 days. The backup bucket is in the same Neon provider/account, so this is not independent-provider disaster recovery. This session did not rehearse manual recovery/cutover or rollback against a live application.

The local database qualification used a disposable PostgreSQL 17 cluster on loopback in `Asia/Calcutta`, applied all 28 migrations for the tested V1.1 worktree, and used guarded synthetic seed data. It verified migration status, no schema drift using a fresh shadow database, catalog/RLS contracts, and 266 database tests. No Neon or production database was used for test writes. The temporary PostgreSQL server was stopped after qualification.

Follow-up local qualification at PR #75 head `1c9ced0c11209bc1841abd6ef7df4bb8a7b3187c` passed the full database suite: 254/254 tests across 36 files on a fresh, guarded, seeded PostgreSQL 17 QA database configured to UTC. All 24 migrations, seed assertions, database verification, and schema drift checks passed. Unit tests passed 649/649; TypeScript, lint (three existing warnings), and the Next.js production build passed, generating 470 static pages. GitHub currently reports 17/17 workflows passed on the exact heads of PRs #73, #74, and #75. These checks do not replace authenticated production workflows or owner acceptance.

## Remaining acceptance gates

| Gate | Status | What is still needed |
| --- | --- | --- |
| Production tenant runtime role switching | Database prerequisite repaired | `perspective_hostinger_runtime` can now `SET ROLE perspective_runtime` without inheriting its privileges; a live transaction verified SELECT/INSERT boundaries. Verify this is the deployed Hostinger login and run authenticated R6–R13 workflows |
| Production runtime database least privilege | **High-severity release gate** | On 2026-11-19, read-only catalog checks confirmed `perspective_hostinger_runtime` has full table DML on 30 tables with RLS disabled, including all 18 IAM tables. This is a capability/containment finding, not evidence of breach. Trace legitimate application and migration needs, document and approve an appropriate least-privilege boundary, add regression coverage, and retest authentication, MFA, tenancy and critical workflows before accepting the permission model. No table-level grants were changed; the restricted-role membership is documented above |
| Hostinger source identity and runtime configuration | Partial / blocked | hPanel confirms two app entries auto-deploy `main@3fa8039…` on Node 24. The public custom domain is served by Hostinger, but its app entry and production `DATABASE_URL` mapping remain unresolved; runtime logs were not inspected |
| Production routes repaired by PR #75 | Blocked | Eight current production URLs still return 404; merge requires a human review under the active branch protection, and the repair is not deployed |
| Staging data provenance and role safety | Blocked | Staging contains 24 migrations, 146 tables, and estimated rows. `perspective_app` is a `BYPASSRLS` owner of 619 catalog relations (146 tables and 473 indexes) and member of `neon_superuser`; data provenance is unconfirmed. Establish a tested least-privilege application login and verify data provenance before using this database for fixtures |
| Staging Profile Network acceptance | Blocked | Deploy an approved candidate to staging after verifying its target; then run authenticated editorial and public directory workflows, including unknown-slug behavior |
| Production owner login and MFA | Not tested | Legitimate owner performs the real authentication/MFA flow against the verified production source |
| Production tenant isolation | Not accepted | Run positive and cross-tenant denial journeys with authorized production/staging test identities on the exact verified release candidate |
| Human alert delivery and acknowledgement | Not tested | Trigger a safe synthetic alert and observe an authorized human notification and acknowledgement |
| Backup recovery and rollback | Partial | Daily encrypted dump workflow and retention tests passed on 2026-11-18 UTC; the remote object was verified and restored in an isolated PostgreSQL service (146 application tables). Neon PITR remains six hours with one manual snapshot expiring 2026-11-24. Backup storage is within the same Neon provider/account. Still rehearse manual restore/cutover and rollback in verified nonproduction, document recovery objectives, and add a second-provider copy if cross-provider disaster recovery is required |
| Neon production branch protection | Blocked | A 2026-11-19 attempt to protect `production` returned HTTP 422: the plan has reached its protected-branch limit. No other branch was unprotected and no plan upgrade was made |
| Independent external review | Optional under owner waiver | `GOV-REVIEW-02` (2026-11-17) waives mandatory independent review for R14/V1.0. No independent review is claimed. The separate GitHub ruleset still requires one PR approval, so PRs remain subject to that active merge rule until an administrator changes it under the waiver while retaining required checks |
| V1.1 final acceptance | Blocked | Complete exact Hostinger source/config verification, editorial end-to-end workflow, accessibility/responsive browser acceptance and approved content/source review |
| Final release certification | Not eligible | Close required technical/operational gates, verify final deployed SHA, then make the release decision; V1.0 remains uncertified and V1.1 remains unreleased |

## Evidence limits

The 168-route and 167-route CI scans are authenticated UI evidence, but neither is a manual click-through of every route in the repository. They do not exercise every state-changing control, test every successful and denied API mutation, inspect every public route or dynamic slug, verify production persistence, validate journalism, or prove Hostinger is running the tested source. A passing CI or HTTP health probe must not be presented as full product acceptance.
