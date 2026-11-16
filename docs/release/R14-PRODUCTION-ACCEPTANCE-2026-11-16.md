# R14 Production Acceptance Evidence â€” 2026-11-16

## Decision

**V1.0 remains NOT CERTIFIED.** This record reflects production and exact-candidate evidence gathered on 2026-11-16. No production data write, migration, rollback, or V1 release tag was performed. PR #55's documentation and CI-only merge triggered the normal Vercel production workflow; application behavior was not changed by that PR.

## Release identity and live probes

| Field | Evidence |
| --- | --- |
| Current production source | `main` at `531d8198dc3e1758ffcc15e130a9a3ffa3e2812c` (PR #55 squash merge) |
| GitHub source visibility | Public; confirmed 2026-11-16 after the repository owner changed visibility |
| Production host probed | `https://the-perspective-liart.vercel.app` |
| Main Vercel status | GitHub reports the deployment completed successfully; Vercel deployment detail API is inaccessible to the connected Vercel account |
| Live HTTP evidence | `/api/health/live` returned 200; homepage returned 200 |
| Probe date | 2026-11-16 |

Sampled production pages, health endpoints, sitemap, robots file, editorial routes, magazine routes, profile routes and auth routes were previously probed. `/api/health/live` and `/api/health/ready` returned 200; unauthenticated session access returned 401; protected app/client paths redirected to login. Withdrawn fictional article paths returned 404 while an unaffected article returned 200. This is route smoke evidence, not exhaustive production browser acceptance.

Production headers include HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, strict-origin referrer policy and a restrictive permissions policy. A fresh probe still showed `X-Powered-By: Next.js`. PR #56 contains `poweredByHeader: false`, and its local production build omitted that header, but PR #56 has not deployed.

## PR #56 exact-candidate qualification

| Field | Evidence |
| --- | --- |
| PR | [#56](https://github.com/vaishnavsawant1994-stack/The-Perspective/pull/56) |
| Fully qualified application/evidence head | `1ac34c7f53cad33832d9c1dcf9e1309a5e5300ff` |
| Current base | `531d8198dc3e1758ffcc15e130a9a3ffa3e2812c` |
| State | Open; not merged |
| GitHub check runs | 24/24 successful at this head |
| Combined Vercel status | **FAIL: deployment was blocked** |

PR #56 incorporates the Ubuntu 24.04 runner compatibility fix after PR #55 merged. Head `1ac34c7` passed all 24 GitHub check runs; the combined Vercel status remains failed because preview deployment was blocked. This includes the R14 technical workflow with disposable PostgreSQL 16 migrations, schema/drift/seed checks, live database tests, backup/restore verification, inventory and secret scans, lint, typecheck, production build, and dependency audit. The R14 production-server smoke built and exercised a local app with a disposable PostgreSQL database and Chromium.

The separate V1 UI-control workflow created temporary synthetic team/client identities and invitation fixtures in its disposable PostgreSQL service, signed in through the application, and audited authenticated Team, Client and Member routes. Its uploaded run output reports **167 routes, 12,185 controls, 12,153 focusable controls, and 0 failures**. These are nonproduction fixtures, not production user accounts.

### Demo fixture inventory and journey coverage

The R2 baseline seed is guarded by `PERSPECTIVE_ALLOW_DEMO_SEED=true` and refuses databases containing unknown organizations. Its asserted summary is 3 organizations, 3 memberships, 3 resource records, 1 audit event, 2 outbox attempts and 2 automation runs. The browser fixture adds 3 ephemeral organizations, 2 active synthetic users (one Team and one Client), 1 invitation, and a restricted Team role with 6 permissions. Test passwords/tokens are generated per workflow run and exist only in the disposable CI job. This is repeatable CI test data, not a persistent staging/demo account set or a complete CRM/editorial/finance catalogue.

| Journey / area | Database or route qualification | Complete browser action journey |
| --- | --- | --- |
| Reader and publishing | PASS: R9 publishing and reader qualification; R14 public route smoke | NOT TESTED end-to-end from category through search, article and magazine archive |
| Editorial | PASS: R8, R9, R10 and R11 module/desk qualification | NOT TESTED through draft, revision, approval and publication in one browser journey |
| CRM | PASS: R6 platform qualification and database tests | NOT TESTED through lead creation, qualification, pipeline and reporting in one browser journey |
| Commercial and finance | PASS: R7 platform qualification on disposable PostgreSQL | NOT TESTED as one browser journey; no live charge/signature provider action was made |
| Client/member | PASS: authenticated Client fixture and route audit; R4 tenancy and R12 member qualification | NOT TESTED through all service-request and cross-tenant browser actions |
| Administration | PASS: authenticated Team fixture and route audit; R13 enterprise qualification | NOT TESTED through the complete user/role/revocation browser workflow |
| Tenant isolation | PASS: R4 database-backed tenancy qualification on disposable PostgreSQL | NOT TESTED in a persistent staging site |

The UI audit tested Chromium at desktop and 390px mobile widths, accessible names, focusability, overflow, route responses, browser console errors and API 5xx responses. It does not provide Firefox or WebKit coverage, screen-reader testing, full keyboard task completion, or independent accessibility certification.

The Vercel status for PR head `60ae517` is failed with â€œDeployment was blocked.â€ The repository is now public, but no fresh deployment result after that visibility change is available yet. A prior branch alias responded to HTTP probes, but the connected Vercel API cannot establish that alias's source SHA; it is not treated as verified staging for the current head. The connected Vercel account lists team `team-vs`, while the deployment status targets `vishnu26`. Deployment readback returned 403; the consent-link tool returned 404 for that team. No exact-head Vercel preview acceptance is established.

## Local qualification

Worktree: `F:\\TP-r14-readiness`; branch `codex/r14-readiness-20261116`.

| Check | Result |
| --- | --- |
| `npm ci` | PASS; audit reported 0 npm vulnerabilities |
| Prisma schema validation | PASS |
| Unit tests | PASS; 628/628 across 81 files with isolated test configuration |
| Lint | PASS; 0 errors and 3 existing unused-variable warnings |
| TypeScript | PASS in the production build |
| Production build | PASS; Next.js 16.4.3 generated 469 pages |
| Local production-server smoke | PASS; `/` and `/api/health/live` returned 200, `X-Powered-By` absent |
| Database-backed tests | PASS in GitHub Actions on disposable PostgreSQL 16; local Docker could not be started in this Windows session |
| Secret and certification-claim scans | PASS; no production-key patterns, 0 certification claims, no independent-review record |

## Recovery and alert evidence

The production Neon project remains on the Free plan, with a six-hour history window and no scheduled snapshots. A separate free Neon backup project exists in the same Neon account/provider. The daily GitHub backup workflow has successful runs through 2026-11-16. Its latest run verified a remotely stored AES-256 encrypted dump, restored it in isolation, and verified 146 application tables; its 30-day retention selection test passed. This supports the automated backup and restore workflow, but not independent-account/provider recovery or a longer production PITR window.

The hourly production health workflow checks liveness, database readiness and homepage HTTP response. It has no automated notification step or verified human destination. Alert delivery and acknowledgment remain **NOT VERIFIED**. A prior manual synthetic email does not prove automated alerting.

## Remaining release gates

| Gate | Status | Evidence needed to close |
| --- | --- | --- |
| Production authentication and tenant isolation | BLOCKED | Authorized production principal and positive login/session/tenant plus negative cross-tenant, role and revocation tests |
| Persistent staging URL and exact Vercel candidate | BLOCKED | Vercel access to deployment team `vishnu26`; current preview status says deployment blocked. The accessible branch alias is not proven to match the exact head. |
| Durable recovery | PARTIAL | Current automated encrypted backup and isolated restore verified; independent account/provider protection and production recovery objectives remain |
| Monitoring and human alert | BLOCKED | Configured automated destination, controlled end-to-end delivery and human acknowledgment |
| Rollback | NOT TESTED | Isolated rehearsal with previous deployment and data-compatibility evidence |
| Browser and accessibility | PARTIAL | CI Chromium audit passed on 167 authenticated routes; Firefox, WebKit/Safari, keyboard interaction beyond focusability, screen-reader and production browser checks remain |
| GitHub governance | UNVERIFIED | Authorized readback of branch protection, required checks and production environment controls |
| Independent review | BLOCKED | External reviewer must examine the exact final production candidate |

## PRs and reviewer access

- **PR #55** merged at `531d8198dc3e1758ffcc15e130a9a3ffa3e2812c` after 24/24 check runs passed. Its diff was limited to the handbook/README and Ubuntu 24.04 runner pins; it did not change application or database code.
- **PR #56** remains open and unmerged. GitHub check runs are green, but the Vercel status is failed because deployment was blocked. This authoring agent does not approve or independently certify its own changes.
- **PR #49** remains draft. A request for review from `omgaj` was rejected by GitHub because that account is not a repository collaborator. No independent review is recorded.

## Release conclusion

Exact-head GitHub qualification and the disposable PostgreSQL/authenticated Chromium UI-control suite now pass. Public production health is responsive, and recurring encrypted backups restore successfully in isolation. Production authentication ownership, exact Vercel preview/deployment access, automated human alerting, rollback rehearsal, some browser/accessibility coverage, governance readback, and independent review remain incomplete. Keep V1.0 **NOT CERTIFIED** and do not create a release tag.

## Current-state correction — 2026-11-16 (supersedes stale PR #56 status above)

This addendum records the state after PR #56 was merged. Earlier references in this file describing PR #56 as open, Vercel as blocked, or `531d8198...` as the current production source are historical checkpoints and are not the current state.

| Field | Updated evidence |
| --- | --- |
| Current production source | `main` at `caf439f196f3fd71893202af38ed7272667aa262` (PR #56 squash merge) |
| PR #56 candidate | Head `c04588037077e2d03315082384b6c1fc859ca400`; 17/17 GitHub Actions workflows passed; Vercel status succeeded |
| Production deployment | Vercel reported the main deployment successful for the merged source |
| Production HTTP probes | Homepage, `/api/health/live`, and `/api/health/ready` returned HTTP 200 on 2026-11-16 |
| Production headers | HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, strict-origin referrer policy, and restrictive permissions policy present; `X-Powered-By` absent |
| Source visibility | GitHub repository is public, confirmed 2026-11-16 |

Production probes establish availability and readiness at the probe time. They do not establish complete browser acceptance, authentication ownership, tenant isolation, or R14 certification.

### Local isolated staging evidence

An empty PostgreSQL 16 project was created under the Neon Free account specifically for staging (`the-perspective-staging-20261116`, project `aged-breeze-02168533`, branch `br-shiny-frog-ba6l0nu5`). It is separate from production. No production database URL or data was used for these checks.

- Prisma schema validation and client generation passed.
- All 24 migrations deployed; the resulting database contained 146 application tables.
- Database verification passed: 31 foundation tables, 27 immutable triggers, runtime bypass-RLS disabled, resource RLS enabled and forced, runtime select permitted and mutation denied, and R10–R13 checks passed.
- Guarded synthetic seed passed: 3 organizations, 3 memberships, 3 resource records, 1 audit event, 2 outbox attempts and 2 automation runs.
- A separate synthetic browser fixture created Team and Client identities plus an invitation. Chromium completed Team and Client sign-in, cross-surface denial, invitation acceptance, generic recovery, mobile visual checks and anonymous protection. The run captured 13 local screenshots, with zero unexpected network failures or console errors.
- Local production build served on `http://127.0.0.1:3000`; homepage and live/ready health endpoints returned HTTP 200.
- `npm run db:migrate:status` returned a generic Prisma schema-engine error even though `db:migrate:deploy`, direct migration ledger verification, and `db:verify` passed. This status command remains an explicit tooling limitation.

The local staging database and synthetic credentials are for isolated review only. The app is not exposed through a persistent staging URL. The connected Vercel account still cannot inspect the project team `vishnu26` or configure the staging database environment there.

### Updated local qualification

| Check | Result |
| --- | --- |
| Unit tests | PASS; 628/628 tests across 81 files |
| Lint | PASS; 0 errors, 3 existing unused-variable warnings |
| TypeScript typecheck | PASS |
| Production build | PASS; Next.js 16.4.3 generated 469 pages |
| Staging migrations and database verification | PASS, with the `db:migrate:status` limitation noted above |
| Chromium R3 browser workflow | PASS; invitation acceptance and all other listed journeys completed |

### Current pending pull requests

- **PR #57** — [Make R3 browser fixture creation atomic](https://github.com/vaishnavsawant1994-stack/The-Perspective/pull/57), head `4a3b58136bdd9a3ae650febc568a1ab960dfa57a`. This changes one fixture script only. Local lint/typecheck and browser acceptance pass; Vercel status is successful. At the time of this addendum, all associated GitHub workflows except the long-running V1 UI-control audit had completed successfully; that audit was still running. Do not treat it as merged until the audit completes.
- **PR #49** remains draft and unmerged. The requested review from `omgaj` was rejected by GitHub (HTTP 422): review requests can only target repository collaborators. Public repository visibility does not grant review-request eligibility. The previous supplemental AI peer review is not independent human review.

### Current R14 blockers (V1.0 remains NOT CERTIFIED)

1. **Independent security review:** no independent human reviewer has completed review of the exact final production candidate. `omgaj` cannot be requested until made a repository collaborator by an owner.
2. **Production authentication and tenant isolation:** no authorized production owner principal or exact-production positive login/session plus negative cross-tenant, role and revocation evidence.
3. **Human alerting:** hourly health checks run, but end-to-end automated alert delivery and human acknowledgement are unverified.
4. **Rollback rehearsal:** no isolated rollback rehearsal with data-compatibility evidence.
5. **Browser and accessibility:** staging Chromium desktop/mobile flows passed, but production browser acceptance, Firefox/WebKit, screen-reader testing and complete keyboard task testing are outstanding.
6. **Recovery independence:** automated encrypted backups and isolated restore exist, but the backup and production database are in the same Neon account/provider; independent-account recovery and production recovery objectives remain unverified.
7. **Governance readback:** branch protections, required checks and production environment controls have not been independently verified from authorized GitHub settings.
8. **Persistent preview with database:** the current accepted staging path is local-only. The connected Vercel account lacks access to the `vishnu26` project team, so an exact-head preview wired to the isolated staging database has not been established.

Keep the V1.0 release uncertified and do not create a release tag until the required evidence closes these gates.

## Follow-up after PR #57 merge — 2026-11-16

| Field | Current evidence |
| --- | --- |
| Current `main` source | `a9e7fedab1dac7f1c9f423bdddc54f03ed5ac2b4` (PR #57 squash merge) |
| PR #57 | Merged at `a9e7fedab1dac7f1c9f423bdddc54f03ed5ac2b4`; exact head `4a3b58136bdd9a3ae650febc568a1ab960dfa57a`; all 17/17 GitHub workflows passed; Vercel status succeeded |
| Production HTTP verification after merge | Homepage, `/api/health/live`, and `/api/health/ready` each returned HTTP 200 |
| PR #58 | Open documentation-only R14 evidence refresh; this branch includes the latest `main` source |

PR #57 changed only the synthetic browser-fixture script. Its merge did not modify application runtime or database behavior. The latest production verification still does not close the R14 certification gates listed above.


## Owner-side current-state audit - 2026-11-16

This read-only audit supersedes any earlier statements above that say PR #56 is open, PR #58 is pending, the current production source is an earlier commit, or GitHub governance is unverified. No production writes, credentials, user records, environment secrets, rollback, or release tag were used.

| Area | Current evidence |
| --- | --- |
| Current source | `main` at `d0026c9d7f23e276f44227e3aac46438a93da1d9`. GitHub reports the Vercel production status succeeded for deployment `5Dnfky6bWeAcsFby71YXPX1R7aqw`. |
| Merged readiness PRs | PRs #56, #57, and #58 are merged. PR #58 is the documentation refresh at the current `main` commit. |
| Open pull requests | PR #49 is the only open PR observed. It remains a draft at head `e1ccd3072109fc9fea3d40bc686a0dedf25c1d28`, based on `73bebc14accdc3232b6d3d01dfbcb939086ef0fd`, not current `main`. Its 24 check runs passed on 2026-11-02; these do not qualify the current production candidate. Submitted PR reviews: 0. |
| Main branch rules | GitHub reports `main` is not protected. Required status check enforcement is off and the required context list is empty. |
| Repository rulesets | The only repository ruleset returned is active `Protect release tags`, matching `refs/tags/v*` and blocking tag updates and deletion, with no bypass actors. No branch-targeting ruleset was returned. |
| Current production status | GitHub commit status for current `main` is Vercel `success` and says deployment completed. This is a deployment status, not a Vercel configuration or environment-variable readback. |
| Vercel access | The connected account lists only team `team-vs`; its accessible project listing is empty. Project/team readback for `vishnu26` returns 403. Consent-link attempts using both the known team ID and slug return 404. No staging Vercel project, deployment, environment, or health-check configuration could be read or changed. |
| Neon staging | Separate project `aged-breeze-02168533` (`the-perspective-staging-20261116`) and ready branch `br-shiny-frog-ba6l0nu5` exist; production is separate project `nameless-surf-82295602`. The staging database contains the 146-table application schema. Read-only PostgreSQL catalog estimates show 19 rows in `public._prisma_migrations` and zero estimated rows in application tables; no application row contents were read. These estimates do not establish data provenance. The remote ledger has 19 migrations while the prior isolated qualification recorded 24, so do not assume this cloud branch is current. The staging branch has no automatic snapshot schedule. |
| Recovery separation | Production and backup projects are in the same Neon organization/provider. The daily backup workflow writes encrypted backups to Neon object storage; its isolated restore has previously passed. The backup project branch is archived, its snapshot listing is empty, and production PITR remains six hours with no scheduled Neon snapshots. Independent-account/provider recovery remains unproven. |
| Automated alerts | The production health workflow checks liveness, readiness, and the homepage hourly, then fails the job on a non-200 response. It has no notification destination, retry/deduplication or recovery notice, or human acknowledgement path. No delivery test was performed. |
| Rollback and browser acceptance | No persistent Vercel staging deployment connected to the Neon staging project was verified. No rollback rehearsal or current-candidate staging browser acceptance was performed. Existing CI browser results remain useful qualification evidence but do not close the persistent staging, full journey, Firefox/WebKit, keyboard, or screen-reader gates. |
| Workspace preservation | The current workspace root is not a Git checkout. The referenced `F:\\TP-r14-readiness` path exists but access was denied; it was not opened or changed. |

### Required next actions

1. Restore authorized Vercel access to the actual `vishnu26` team/project. Verify project identity and Preview environment controls before adding any database variable. Then use a verified empty/synthetic-only Neon staging branch, apply the current migrations, and connect only that staging URL.
2. Configure main-branch pull request and required-check rules after confirming the exact current check names. The current readback shows these protections are disabled.
3. Choose an authorized alert destination, configure a secret-safe notifier, and verify failure, deduplication, recovery, and human acknowledgement end to end.
4. Rehearse deployment rollback only in the verified nonproduction Vercel staging environment with database compatibility checks.
5. Arrange a genuinely independent human security review of PR #49 against the final candidate; do not merge PR #49 or perform production owner bootstrap before that review and release authorization.
6. Complete the outstanding production-owner identity/tenant tests and browser/accessibility acceptance with authorized accounts.

**Decision remains V1.0 NOT CERTIFIED.** Do not create a release tag until all mandatory gates have current evidence and the release is authorized.


## Owner-side update — 2026-11-16 (GitHub ruleset and Vercel access)

This addendum records the owner-side changes and access check performed after the audit above. It does not change the NOT CERTIFIED decision.

| Area | Current evidence |
| --- | --- |
| GitHub main ruleset | Saved and verified active repository ruleset **Protect main**, ID `27392549`, targeting `~DEFAULT_BRANCH` (currently `main`). No bypass actors are configured and the connected account cannot bypass it. |
| Main branch requirements | Pull request required; one approving review; stale approvals dismissed after new pushes; latest reviewable push approval required; conversation resolution required; branch must be up to date; force pushes and deletions blocked. |
| Required status checks | `R14 full qualification`, `R14 production smoke`, and `browser-qualify` are required. The latest inspected check-run list also contains a successful `R4 tenant isolation qualification`, but that check was not added to the ruleset and remains an action for the authorized GitHub owner. |
| Vercel account/team | The connected account lists only team `team-vs` (`TEAM VS`). Project search did not find `the-perspective-staging-r14`; project readback by its earlier ID returned 404. Creating/linking a staging project was rejected with 403. Authorizing team slug `vishnu26` returned 404. No staging database URL or other secret was saved to Vercel. |
| Neon staging | Separate Neon staging project `aged-breeze-02168533` exists in the same Neon organization/provider as production. It has not been connected to an accessible Vercel staging project. |
| Alerts, rollback, acceptance | Automated alert destination and delivery/acknowledgment remain unverified. No staging rollback rehearsal or current-candidate browser acceptance was possible without a working persistent staging deployment. |

The independent human security review for PR #49 remains outstanding. Keep V1.0 **NOT CERTIFIED** and do not create a release tag.
