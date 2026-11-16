# R14 Production Acceptance Evidence — 2026-11-16

## Decision

**V1.0 remains NOT CERTIFIED.** This record updates live and clean-worktree evidence gathered on 2026-11-16. It does not replace the owner decision, a genuine independent review, or exact-deployment qualification. No production write, migration, deployment, rollback, or V1 release tag was performed.

## Release identity and live probes

| Field | Evidence |
| --- | --- |
| Production source baseline | `main` at `c30c04a945885bffb25500cd25ff40b3da74eb2c` |
| Production host probed | `https://the-perspective-liart.vercel.app` |
| Deployment record | GitHub combined Vercel status succeeds for baseline; deployment ID could not be retrieved because the connected Vercel deployment endpoint returned 403 |
| Probe date | 2026-11-16 |

Homepage, sampled editorial/category/magazine/profile/auth pages, `robots.txt`, sitemap and health endpoints returned expected HTTP responses. `/api/health/live` and `/api/health/ready` returned 200; unauthenticated session request returned 401. Protected `/app` and `/client` redirected to login. The withdrawn fictional article routes returned 404, while a known article returned 200. This is a route smoke sweep, not exhaustive browser, accessibility, responsive or cross-browser acceptance.

Observed security headers included HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, strict-origin referrer policy and a restrictive permissions policy. Production still emitted `X-Powered-By: Next.js` during this probe. This branch adds `poweredByHeader: false`; that local change passed a production build before this record was written, but it has not been deployed and therefore is not production evidence.

## Qualification on isolated branch

Worktree: `F:\\TP-r14-readiness`; branch `codex/r14-readiness-20261116`; baseline `c30c04a945885bffb25500cd25ff40b3da74eb2c`.

| Check | Result |
| --- | --- |
| `npm ci` from committed lockfile | PASS; npm audit reported 0 vulnerabilities |
| Prisma schema validation | PASS |
| TypeScript | PASS; Next.js production build completed its TypeScript phase |
| Lint | PASS on changed worktree; 0 errors and 3 existing unused-variable warnings |
| Unit tests | PASS, 628/628 across 81 files, using isolated dummy sessions-mode configuration and loopback-only dummy DB URL; no production DB credentials |
| Production build | PASS on changed worktree; Next.js 16.4.3 generated 469 static pages |
| Local production-server smoke | PASS: `/api/health/live` and `/` returned 200; neither response emitted `X-Powered-By`; baseline security headers remained present |
| Database-backed local suite | NOT RUN: Docker service is installed but stopped; this session could not open/start `com.docker.service`; local PostgreSQL client tools are absent |
| Production browser acceptance | PARTIAL: public HTTP smoke only; browser, mobile, accessibility and cross-browser qualification not run in this session |

The CI R14 workflow defines a disposable PostgreSQL 16 service and database migration, verification, drift, seed, database test, backup/restore, browser and performance steps. Workflow definition is not a substitute for confirming a successful run against the exact final candidate.

## Recovery and alert evidence

The production Neon project remains on the Free plan, with a 6-hour history window and no scheduled snapshots. A separate free Neon backup project exists in the same Neon account/provider; it is not independent-provider recovery. GitHub's daily `neon-database-backup.yml` workflow has successful scheduled runs through 2026-11-16. The latest run verified a remotely stored AES-256 encrypted dump, restored it in isolation, and verified 146 application tables; the 30-day retention selection test passed and no object older than 30 days was expired. This supports the automated backup/restore workflow gate, but does not provide cross-account/provider resilience or change production PITR retention.

The hourly production health workflow checks liveness, database readiness and homepage HTTP response. Its YAML contains no notification step or configured human alert destination. Automated alert delivery and human acknowledgment are therefore **NOT VERIFIED**. A prior manually sent synthetic email is not evidence that the automated monitor pages a human.

## Remaining gates

| Gate | Status | Evidence needed to close |
| --- | --- | --- |
| Positive authentication and tenant isolation | BLOCKED | Authorized legitimate production principal plus positive login/session/tenant and negative cross-tenant, role and revocation tests |
| Durable recovery | PARTIAL | Current automated encrypted backup and isolated restore verified; independent account/provider protection and production recovery objectives/retention decision remain |
| Monitoring and human alert | BLOCKED | Configured automated alert destination, controlled end-to-end delivery and human acknowledgment |
| Rollback | NOT TESTED | Isolated rehearsal with a prior deployment and data-compatibility evidence; no production traffic switch required for rehearsal |
| UI/browser/accessibility | PARTIAL | Exact candidate mobile, responsive, accessibility and cross-browser evidence |
| GitHub governance | UNVERIFIED | Authorized readback of branch protection, required checks and production environment controls |
| Exact Vercel deployment identity | PARTIAL | Connected Vercel deployment readback currently returns 403; GitHub reports successful Vercel status |
| Independent review | BLOCKED | Genuine external reviewer examines the exact final production candidate and records findings |

## PR #55 review boundary

PR #55 head `cfe1228b0aed1a2b2f1124b56e092ab79e8763ee` is open, mergeable and has 17/17 successful GitHub workflows. Its reviewed diff is limited to handbook documentation and pinning Playwright workflows to `ubuntu-24.04`; no application or database changes were found. This was an engineering inspection by the authoring agent, **not an independent approval**. PR #55 remains unmerged pending owner decision. PR #49 remains draft/parked and is outside this work package.

## Release conclusion

The current evidence supports healthy sampled public routes, a passing local unit suite, and recurring encrypted backup plus isolated restore verification. It does not establish positive production identity/tenant acceptance, automated human alert delivery, rollback readiness, full browser acceptance, complete governance readback, exact Vercel deployment identity, or independent review. Keep V1.0 **NOT CERTIFIED** and do not create a release tag.
