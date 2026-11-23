# The Perspective — Functional Audit Snapshot

## Latest verification update — 2026-11-23

The [2026-11-23 exact-head and infrastructure refresh](#exact-head-and-infrastructure-refresh-2026-11-23) supersedes older **current-state** labels below where they conflict; the dated evidence that follows remains historical.

### Exact V1.1 candidate

- The product-code checkpoint tested in this refresh is `e7bcd7e37843bc5040013208f9784153b0d83e79`, based on `main@ce7c1513bb61e45cb0f9081bf672befa2a4e6804`. PR #73 remains open and draft. GitHub reports **17/17 workflow runs successful** and Vercel success on that code checkpoint; the [V1 UI Control Qualification](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/45092178546) published artifact [14782093865](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/45092178546/artifacts/14782093865), retained through 2026-12-07. The dated audit update below is documentation only; consult PR #73 for its live branch-head SHA and checks.
- The control scanner checks configured routes and control accessibility/rendering; it does not activate every control or prove all business effects persisted. Fresh local exact-head evidence is recorded below.
- No PR review submissions are recorded for PR #73. It remains draft; CI success is not a release or production-acceptance decision.

### Local exact-head requalification — 2026-11-23

On `e7bcd7e37843bc5040013208f9784153b0d83e79`, `npm test -- --reporter=dot` passed **679 tests across 92 files**; TypeScript passed; Prisma schema validation passed; ESLint completed with **0 errors and 3 warnings** (two unused fixture identifiers in `r6-communications.database.test.ts`, one unused type import in `r7/commands.ts`). The production build passed and generated **470 pages**. The build and local server used an intentionally invalid loopback-only PostgreSQL URL; no cloud database was contacted.

A local production-server HTTP probe returned 200 for `/`, `/login`, `/client/login`, `/companies`, `/professionals`, `/editors`, `/personal-magazines/discover`, and `/api/health/live`; `/travel` and `/books` returned 307 redirects; an unknown article slug returned 404; anonymous `GET /api/v1/auth/session` returned 401; `GET /api/v1/profile-network/requests` returned 405. `/api/health/ready` returned 503 because the intentionally invalid local database URL cannot authenticate. An unknown company detail slug returned 500 for the same unavailable-database condition, so it is **not** a valid 404 acceptance result. The PostgreSQL 17 Windows service is running locally, but local database authentication requires credentials unavailable to this session; no schema, seed, or data changes were attempted.

These local checks validate build and public route behavior under the stated isolated configuration. They do not establish database-backed page behavior, authenticated journeys, staging identity, production behavior, or release readiness.

#### Follow-up with a disposable local PostgreSQL database

A new PostgreSQL 17 cluster was initialized under the Windows temporary directory, bound to `127.0.0.1` on a dynamically selected port, and stopped after qualification. Its fresh `perspective_pr73_test` database received all **28** migrations. The explicit synthetic seed, seed assertions, database contract verifier, migration status, and Prisma drift check passed. `npm run test:db` passed **266 tests across 40 files**. This cluster was separate from the existing Windows PostgreSQL service and all cloud databases.

The local production server then used that disposable database. Readiness returned 200; unknown Company, Professional, and Editor slugs returned 404; and anonymous session access returned 401. A Playwright check confirmed the Company profiles page title/H1, its labeled search box, search submission to `?q=Asteria`, the no-match state, and the Clear search link returning to `/companies`. Browser console reported zero errors and CSS preload warnings. This verifies selected local flows against synthetic data only; it does not verify real owner MFA, production tenant isolation, or a Hostinger deployment.

### Live public endpoint recheck

Read-only HTTP probes on 2026-11-22 against `https://www.thetimesofperspective.com` returned HTTP 200 for `/`, `/api/health/live`, `/api/health/ready`, `/travel`, `/books`, `/strategy`, `/opinion`, and `/design`. The five editorial paths resolve after canonical redirects where applicable. This establishes HTTP reachability only and does not identify the deployed source SHA or prove authenticated workflows.

Homepage HTML on that check contained “Independent analysis, worldwide” and “Market data unavailable”; it did not contain the unsupported “150,000+ readers” count or the checked stale NIFTY, SENSEX, and USD/INR figures.

The historical aliases `the-perspective-liart.vercel.app` and `the-perspective-vishnu26.vercel.app` now return Vercel `404 DEPLOYMENT_NOT_FOUND`. They are not valid current production endpoints. Vercel project listing in the connected accounts returned no matching project. The public production domain is responding, but Hostinger connector access currently requests reauthentication, so its deployed source SHA, runtime logs, app-entry mapping, and production `DATABASE_URL` identity remain unverified.

### Production database security and recovery gates

Read-only Neon checks on 2026-11-22 confirmed production project `nameless-surf-82295602`, branch `br-icy-mountain-bak8ooxk` (`production`), is ready and `protected=false`. Its automatic snapshot schedule is empty. The runtime login is `NOSUPERUSER`, `NOCREATEROLE`, `NOCREATEDB`, and `NOBYPASSRLS`, but it has direct `SELECT`, `INSERT`, `UPDATE`, and `DELETE` privileges on all 18 `iam` tables, all 12 `platform` tables, and the one `audit` table. RLS is enabled and forced on one of the 12 `platform` tables; the other listed tables have RLS disabled. This remains a high-severity least-privilege/containment gate. No grants, branch settings, snapshots, database rows, hosting settings, or DNS were changed.

The scheduled encrypted-backup workflow's latest successful run observed on 2026-11-22 was [run history](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/workflows/neon-database-backup.yml), created 2026-11-21 at `main@3fa80397963761d29d4e972fadf4f098e50e8c75`. The current `main` is `bc190530d6ab0a76ddeff4874c1ea5e0d5fb28e0`, updated on 2026-11-22; no backup run on that newer main SHA was yet visible at the time of this check. The latest success therefore verifies the backup workflow run and its recorded artifact checks, not a post-merge backup from the current main revision.

These facts do not establish a breach or an exploitable injection path. Any privilege repair still requires a complete application privilege map and qualification against an isolated, verified nonproduction database before production use.

### Application privilege map — initial source trace (2026-11-22)

This is a source trace of the high-risk IAM access paths, not yet a complete all-module ACL matrix:

- Authentication in [`service.ts`](../../src/modules/authentication/service.ts#L106) performs root-client reads and writes across `authentication_attempts`, `audit_events`, `organization_memberships`, `sessions`, `user_identities`, `password_credentials`, `mfa_challenges`, `authentication_secrets`, `invitations`, `user_accounts`, `mfa_methods`, `membership_roles`, `people`, and `recovery_challenges`. Its direct transactions do not issue `SET LOCAL ROLE`.
- Role administration in [`admin.ts`](../../src/modules/authorization/admin.ts#L454) reads and mutates `roles`, `role_permissions`, and `membership_roles`, and checks `organization_memberships`; the root-client transactions in this module do not issue `SET LOCAL ROLE`.
- [`resolver.ts`](../../src/modules/authorization/resolver.ts#L229) reads a selected membership and related membership roles, role permissions, and permissions through the root Prisma client. [`session/route.ts`](../../src/app/api/v1/auth/session/route.ts#L25) also reads `membership_roles` and `mfa_methods` directly.
- The R6 outbox worker in [`worker.ts`](../../src/modules/r6/worker.ts#L416) uses the root Prisma client to read and update `platform.outbox_events`, create/update `platform.outbox_delivery_attempts`, and record success/failure state. This path does not switch to `perspective_runtime` before those operations. Its downstream campaign/dispatch handlers must be assessed separately; this observation covers the worker's outbox bookkeeping only.
- The guarded first-owner path in [`first-owner-bootstrap.ts`](../../src/modules/authentication/first-owner-bootstrap.ts#L51) reads IAM/audit counts, then creates the platform organization, canonical permissions and role links, first-owner invitation, and audit event in a root-client transaction. It does not switch roles; its one-time empty-database and explicit-production-target guards are part of its privilege boundary.
- Recovery handling in [`service.ts`](../../src/modules/authentication/service.ts#L1402) writes a `platform.outbox_events` row through a root-client transaction. The R6 tenant-scoped enqueue helper uses the restricted role, but this authentication recovery path does not.
- Client proposal acceptance in [`resources.ts`](../../src/modules/r7/resources.ts#L111), called by the R7 accept route, uses root-client raw SQL to read `iam.organization_memberships` while resolving the client and creator memberships. It does not set a local role. R7 command/replay paths also invoke narrowly granted `platform.*` functions; those function calls are separate from direct table DML.
- Authorization telemetry in [`audit.ts`](../../src/modules/authorization/audit.ts#L97) can write `audit.audit_events` through its default root Prisma client; some callers may pass a transaction client. The role-administration audit helper in [`admin.ts`](../../src/modules/authorization/admin.ts#L265) writes within the module's root-client transaction, which also does not set a local role.
- [`authorization/resource-context.ts`](../../src/modules/authorization/resource-context.ts#L54) contains a direct `platform.resources` read helper, but this scan found no non-test call site for that helper. By contrast, the active [`tenancy/resource-context.ts`](../../src/modules/tenancy/resource-context.ts#L17) helper reads `platform.resources` inside a transaction after `SET LOCAL ROLE perspective_runtime`.
- By comparison, tenant-scoped CRM and commercial work explicitly executes `SET LOCAL ROLE perspective_runtime` before its transaction callback in [`crm/persistence.ts`](../../src/modules/crm/persistence.ts#L25) and [`commercial/persistence.ts`](../../src/modules/commercial/persistence.ts#L39). That boundary is not applied uniformly to authentication and authorization administration.

This trace explains why immediately revoking every direct IAM grant would likely break login, MFA, session, invitation, recovery, role-administration, or authorization-resolution flows. It does not justify the present breadth: the runtime login still has direct DML on tables outside these paths and on tables with RLS disabled. Before changing production grants, complete the full query-to-table/action matrix, introduce and exercise an explicit least-privilege boundary for the direct paths, and run positive and negative authentication, MFA, authorization, and tenant-isolation journeys using the candidate runtime role on an isolated database.

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
| Production routes repaired by PR #75 | Live route behavior verified; source SHA not verified | PR #75 is merged into `main`. On 2026-11-22, all five repaired shorthand routes returned HTTP 307 to their canonical pages and production health endpoints returned HTTP 200. Hostinger's deployment readback still does not identify the source SHA serving the custom domain |
| Staging data provenance and role safety | Blocked | Staging contains 24 migrations, 146 tables, and estimated rows. `perspective_app` is a `BYPASSRLS` owner of 619 catalog relations (146 tables and 473 indexes) and member of `neon_superuser`; data provenance is unconfirmed. Establish a tested least-privilege application login and verify data provenance before using this database for fixtures |
| Staging Profile Network acceptance | Blocked | Deploy an approved candidate to staging after verifying its target; then run authenticated editorial and public directory workflows, including unknown-slug behavior |
| Production owner login and MFA | Not tested | Legitimate owner performs the real authentication/MFA flow against the verified production source |
| Production tenant isolation | Not accepted | Run positive and cross-tenant denial journeys with authorized production/staging test identities on the exact verified release candidate |
| Human alert delivery and acknowledgement | Not tested | Trigger a safe synthetic alert and observe an authorized human notification and acknowledgement |
| Backup recovery and rollback | Partial | Daily encrypted dump workflow and retention tests passed on 2026-11-18 UTC; the remote object was verified and restored in an isolated PostgreSQL service (146 application tables). Neon PITR remains six hours with one manual snapshot expiring 2026-11-24. Backup storage is within the same Neon provider/account. Still rehearse manual restore/cutover and rollback in verified nonproduction, document recovery objectives, and add a second-provider copy if cross-provider disaster recovery is required |
| Neon production branch protection | Blocked | A 2026-11-19 attempt to protect `production` returned HTTP 422: the plan has reached its protected-branch limit. No other branch was unprotected and no plan upgrade was made |
| Independent external review | Waived for V1.0 by owner decision | `GOV-REVIEW-02` (2026-11-17) waives mandatory independent review for R14/V1.0. No independent review is claimed. The active `Protect main` ruleset now requires zero approvals while retaining pull requests, three required status checks, up-to-date checks, and resolved conversations |
| V1.1 final acceptance | Blocked | Complete exact Hostinger source/config verification, editorial end-to-end workflow, accessibility/responsive browser acceptance and approved content/source review |
| Final release certification | Not eligible | Close required technical/operational gates, verify final deployed SHA, then make the release decision; V1.0 remains uncertified and V1.1 remains unreleased |

## Evidence limits

The 168-route and 167-route CI scans are authenticated UI evidence, but neither is a manual click-through of every route in the repository. They do not exercise every state-changing control, test every successful and denied API mutation, inspect every public route or dynamic slug, verify production persistence, validate journalism, or prove Hostinger is running the tested source. A passing CI or HTTP health probe must not be presented as full product acceptance.

## Exact-head and Hostinger follow-up (2026-11-22)

### Repository and qualification

- At the start of this follow-up, PR #73 was open, draft, and mergeable at `71ccd925c3e930d70f25e629ca78bd16cf26ec57`, based on `main@bc190530d6ab0a76ddeff4874c1ea5e0d5fb28e0`; that prior exact head passed 17/17 workflows and Vercel. No review submissions were recorded.
- The tested TLS compatibility patch was pushed as `82fd4a0b6ced394ccda1fd9e6f002021106862dc`; that exact head passed 17/17 GitHub workflows and the Vercel status. The PR remained open and draft. Technical checks do not establish production acceptance.
- Local qualification for the TLS patch passed 669/669 unit tests, 266/266 database tests on a fresh disposable PostgreSQL 17 database, TypeScript, changed-file lint, and a clean-install production build that generated 470 pages. Migration, seed, schema verification, drift, backup/restore, and dependency-audit checks passed; the clean install and `npm audit --audit-level=moderate` reported zero vulnerabilities.
- A fresh disposable PostgreSQL 17 cluster on loopback received all 28 migrations. Migration status, database contract verification, schema drift, guarded synthetic seed and seed assertions passed. All 266 database tests across 40 files passed. The R14 backup/restore rehearsal reported the dump SHA-256 and restored 28 migration records into a separate database. The database server was stopped afterward. No Neon, AWS RDS, Hostinger or production database was used for these test writes.
- Read-only local HTTP checks against the running PR worktree returned 200 for `/`, `/companies`, `/professionals`, `/editors`, `/api/health/live`, and `/api/health/ready`; unknown company, professional and editor slugs returned 404. The local server's database identity is unknown, so its readiness response is not used as evidence for any named staging or production database.

### Current Hostinger mapping

| Site | Verified mapping and runtime | Limit |
| --- | --- | --- |
| `expansive-darkslategray-raccoon-18.hostingersite.com` | `thetimesofperspective.com` is attached as a parked domain; the latest completed Node.js 24 deployment is build `01a200cc-c5fc-72ba-bc40-b558d09c09df` from `main@bc190530d6ab0a76ddeff4874c1ea5e0d5fb28e0`; root and readiness returned HTTP 200 | `DATABASE_URL` is configured but its value is masked, so the database target is unverified. Runtime logs still contain 3 `pg-connection-string` TLS-mode compatibility warnings |
| `daily-limegreen-woodcock-36.hostingersite.com` | No custom domain is attached; the latest completed Node.js 24 deployment is build `01a200cc-c58c-724c-a048-3592e669753c` from `main@bc190530d6ab0a76ddeff4874c1ea5e0d5fb28e0`; root and readiness returned HTTP 200 | `DATABASE_URL` is configured but its value is masked, so the database target and staging isolation are unverified. The readiness endpoint checks connectivity with `SELECT 1`; it does not verify migrations or schema |

The refreshed Hostinger readback on 2026-11-22 UTC confirms both sites auto-deploy `main`; it does not show PR #73 running on staging. Environment-variable key lists contain `DATABASE_URL` on both sites, with values masked. Staging runtime logs contained five ordinary `LOG` entries and no warning or error entries in the inspected day. Do not apply migrations, change environment values, or use either database for fixtures until the staging database target and data provenance are verified.

The TLS repair in `src/modules/persistence/database-environment.ts` normalizes legacy PostgreSQL `sslmode=prefer`, `require`, and `verify-ca` aliases to explicit `verify-full`, preserving the driver's current stricter behavior before a future dependency major changes it. The readiness route uses the same normalization. The repair is committed and pushed as `82fd4a0b6ced394ccda1fd9e6f002021106862dc`; that code head passed 17/17 GitHub workflows and the Vercel status. Hostinger is still running `main@bc190530…`; its three production runtime TLS warnings confirm the repair has not reached production. Later documentation-only updates to PR #73 trigger new workflow and Vercel checks; read qualification from the current exact PR head, separately from production acceptance.

### Profile request rate-limit follow-up (2026-11-22)

Source review found that the PN-04 request key combined the IP address and user-agent, allowing a client to rotate user-agent strings to bypass the nominal three-requests-per-IP daily bucket. The local repair now derives the HMAC bucket from the forwarded client IP alone and has focused tests for user-agent rotation, Hostinger's documented `X-Real-IP` / last-`X-Forwarded-For` selection, and invalid/missing address rejection. Hostinger's official guidance confirms this header selection for Node.js traffic through its CDN, while warning that direct-to-origin requests can bypass the CDN and supply arbitrary headers ([Hostinger CDN visitor IP guidance](https://www.hostinger.com/support/hostinger-cdn-visitor-ip-addresses-in-logs-and-analytics/)). The database's global 200-per-day ceiling remains. Local qualification on the working tree passed **672 unit tests across 90 files**, targeted ESLint, and TypeScript. Do not enable request intake on Hostinger until the actual staging DB target and origin-proxy behavior are verified; no staging database writes or deployments were made.

### AWS staging connection and remaining release gates

The owner-provided AWS CloudShell output for RDS `perspective-staging` reported `PubliclyAccessible=false`, security group `sg-0e3937e5c957ebacc` with only a self-referencing inbound rule, no SSM-managed instance, and no VPC endpoints. This does not provide a network path from Hostinger to the private RDS instance. The local AWS CLI is installed, but this session has no authenticated local AWS identity. No AWS, database, hosting, DNS or production configuration was changed.

V1.0 remains uncertified. Production owner authentication/MFA, tenant-isolation journeys, monitoring and human alert acknowledgement, restore/cutover, and rollback remain open. Independent external review is waived for V1.0 under the recorded owner decision; none is claimed. V1.1 remains unreleased: authenticated staging editorial acceptance, target database/source verification, privacy and abuse-control acceptance, and the required review/release decision remain open. Keep PR #73 draft and do not describe the successful technical checks as production readiness.

### Production route and branch-rule refresh (2026-11-22)

GitHub main is `bc190530d6ab0a76ddeff4874c1ea5e0d5fb28e0`, which contains merged PRs #75 (public route repairs) and #74 (R7 timestamp repair). A fresh read-only probe of `www.thetimesofperspective.com` returned HTTP 307 from `/travel`, `/books`, `/strategy`, `/opinion`, and `/design` to their canonical sections; `/api/health/live` and `/api/health/ready` returned HTTP 200. This verifies those live route behaviors, not the serving application SHA or authenticated user flows.

Read-only GitHub ruleset `Protect main` (ID `27392549`) is active and requires zero approving reviews, pull requests, current required checks (`R14 full qualification`, `R14 production smoke`, and `browser-qualify`), and resolved review conversations; it blocks branch deletion and non-fast-forward updates. The V1.0 governance waiver is reflected in this configuration. Production source identity, authenticated acceptance, operational recovery, and V1.1 staging acceptance remain open.

## Exact-head and infrastructure refresh (2026-11-23)

### GitHub and PR #73

- `main` is `ce7c1513bb61e45cb0f9081bf672befa2a4e6804`.
- PR #73 is open and draft at `dad3f21a371d92be0d6ed7e09eb578abfbfadab3`, based on that `main` commit. The exact head passed **17/17 GitHub Actions workflows** and the Vercel status check. This includes the R3 authenticated browser workflow, R4 browser and tenant-isolation workflows, R5 browser/implementation workflows, and R14 technical qualification. R3 now completes team sign-in and verifies the protected Settings page; the browser helper waits for page-specific semantic content instead of global `networkidle`.
- The V1 UI control run passed on the exact head: **171 routes, 12,446 controls, 12,414 focusable controls, zero scanner failures**. This is a rendering/focus audit, not proof that every control persists its intended business effect.
- The active `Protect main` repository ruleset (ID `27392549`) is confirmed active. It requires pull requests, zero approving reviews under the owner waiver, up-to-date required checks (`R14 full qualification`, `R14 production smoke`, `browser-qualify`), and resolved review conversations; force pushes and deletion are blocked.

PR #73 is still a code candidate only. No merge, Hostinger deployment, DNS change, Neon migration, or production data write occurred during this refresh.

### Hostinger deployment and live HTTP

| Site | Current deployment | Observed HTTP |
| --- | --- | --- |
| `expansive-darkslategray-raccoon-18.hostingersite.com` (parked domain `thetimesofperspective.com`) | Build `01a204db-f5cc-7047-aacb-8a54054c122c`, completed, Node 24, `main@ce7c1513bb61e45cb0f9081bf672befa2a4e6804` | Production homepage, `/api/health/live`, and `/api/health/ready`: 200 |
| `daily-limegreen-woodcock-36.hostingersite.com` (no custom domain) | Build `01a204db-f54e-727d-b217-adb0df38d5d8`, completed, Node 24, `main@ce7c1513bb61e45cb0f9081bf672befa2a4e6804` | Homepage and `/api/health/ready`: 200 |

Hostinger confirms `DATABASE_URL` is configured on both sites, but masks its value. The staging site's actual Neon target and the production runtime role therefore remain unverified. The production environment also contains bootstrap-related keys; their values were not read. Runtime log review for the last day found 15 raw production lines and 5 raw staging lines, with no ERROR/WARN entries returned. HTTP readiness proves database connection/query health only, not migrations, account flows, or tenancy.

### Neon catalogs and privilege boundaries

All queries below were read-only catalog/role/schema/migration checks; no application table rows were read.

- Neon production project `nameless-surf-82295602`, branch `production` (`br-icy-mountain-bak8ooxk`), database `perspective`: `protected=false`, 24 completed Prisma migrations, and six-hour history retention. The automatic snapshot schedule is empty. The only manual snapshot returned by the API is `production-safety-check-2026-11-17`, expiring **2026-11-24**. This is not evidence of an automatic snapshot schedule or a current restore drill.
- The production candidate login `perspective_hostinger_runtime` is non-superuser, `NOCREATEDB`, `NOCREATEROLE`, and `NOBYPASSRLS`. It can `SET ROLE perspective_runtime` without inheriting that role's privileges. Catalog checks show effective write privileges on **30 tables without RLS**: 18 in `iam`, 11 in `platform`, and 1 in `audit`. RLS is enabled and forced on the inspected `commercial`, `comms`, `crm`, `distribution`, `growth`, `media`, `member`, `ops`, `portal`, and `production` tables. The deployed Hostinger connection has not been tied to this role, and authentication/admin direct database paths still need least-privilege review.
- The specifically identified staging target is Neon project `hidden-haze-29775614`, branch `staging` (`br-cold-hat-ba18b0tj`), database `perspective_staging`. It is ready, `protected=false`, has 24 completed migrations and 146 application tables; the PR #73 worktree contains 28 migration directories. The Hostinger staging `DATABASE_URL` remains masked, so its mapping to this target is not verified.
- Staging login `perspective_app` has `LOGIN`, `CREATEDB`, `CREATEROLE`, and `BYPASSRLS`; it is a member of `neon_superuser`, `perspective_runtime`, and `perspective_public`, and has effective DML on all 146 staging tables. It owns the staging database. This is a high-severity staging boundary failure. Do not run migrations, create fixtures, or use it for authenticated acceptance until a least-privilege application login and migration path are designed and verified. Blindly revoking grants is unsafe because authentication and administration still include direct Prisma database operations.

### Release disposition

- **V1.0: NOT CERTIFIED.** Open gates include verified production `DATABASE_URL`/role mapping; production owner sign-in and MFA; positive and negative tenant journeys against the deployed SHA; least-privilege remediation for the active code paths; monitoring alert delivery and human acknowledgement; backup restore/cutover and rollback rehearsal; and production branch protection/recovery evidence.
- **V1.1: NOT RELEASED.** PR #73 is open and draft. It has exact-head code/CI and UI-control qualification, but no verified staging source/database mapping, no authenticated editorial workflow against an isolated least-privilege staging database, and no deployment acceptance. The 24-migration staging database is behind the branch's 28-migration schema.
- Owner waiver `GOV-REVIEW-02` makes independent external review optional for V1.0; no independent review is claimed. The active ruleset no longer requires an approving review. Neither waiver nor green CI certifies a release.
- No production rows, credentials, DNS records, branch protection settings, role grants, migrations, or deployments were changed during this refresh. No database connection strings or secret values were printed.
