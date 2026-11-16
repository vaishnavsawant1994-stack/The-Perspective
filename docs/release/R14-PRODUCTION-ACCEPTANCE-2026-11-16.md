# R14 Production Acceptance Evidence — 2026-11-16

## Decision

**V1.0 remains NOT CERTIFIED.** This record reflects production and exact-candidate evidence gathered on 2026-11-16. No production data write, migration, rollback, or V1 release tag was performed. PR #55's documentation and CI-only merge triggered the normal Vercel production workflow; application behavior was not changed by that PR.

## Release identity and live probes

| Field | Evidence |
| --- | --- |
| Current production source | `main` at `531d8198dc3e1758ffcc15e130a9a3ffa3e2812c` (PR #55 squash merge) |
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

The preview deployment status from Vercel is failed with “Deployment was blocked.” A prior branch alias responded to HTTP probes, but the connected Vercel API cannot establish that alias's source SHA; it is not treated as verified staging for the current head. The connected Vercel account lists team `team-vs`, while the deployment status targets `vishnu26`. Deployment readback returned 403; the consent-link tool returned 404 for that team. No exact-head Vercel preview acceptance is established.

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
