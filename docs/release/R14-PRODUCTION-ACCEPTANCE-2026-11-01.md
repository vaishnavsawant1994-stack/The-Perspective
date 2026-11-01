# R14 Production Acceptance Evidence — 2026-11-01

## Release identity

| Field | Evidence |
| --- | --- |
| Production source | `main` at `75b9a700afc58ccbd2197d9b5f490ae92d32eaaa` |
| Vercel production deployment | `dpl_J5jE2QmX1dARM4UgPVtSt1YHCtKv` — READY |
| Application aliases | `https://the-perspective-liart.vercel.app`, `https://the-perspective-vishnu26.vercel.app` |
| Release decision | **V1.0 NOT CERTIFIED** |

The deployment is current and serving traffic. This operational fact does not satisfy the identity, recovery, editorial, monitoring or independent-review gates below.

## Acceptance matrix

| Gate | Result | Evidence and remaining work |
| --- | --- | --- |
| Production release identity | PASS | Vercel reports READY for the exact `main` SHA and deployment above. |
| Core public HTTP surfaces | PASS (sampled) | On the current deployment, homepage, discovery, privacy, terms, cookies, editorial standards, accessibility, community guidelines, `robots.txt`, sitemap and `/api/health/ready` returned HTTP 200. A fabricated edition route returned 404. Seven audited utility/discovery pages had matching canonical URLs. This is a route sample, not exhaustive browser coverage. |
| Production build | PASS | Current-main and changed-branch Next.js 16.4.3 production builds succeeded. The changed branch generated 469 static pages (six fewer after removing the Anika profile/interview surfaces). |
| Lint and TypeScript | PASS | Current-main lint completed with 0 errors and 3 existing unused-variable warnings; TypeScript check passed. |
| Unit suite | PASS | Current-main Vitest: 81 files, 625 tests passed using isolated dummy session configuration and a closed loopback database URL. The initial run without required auth environment failed 19 tests at configuration validation; rerun with the workflow's non-production test values passed. The same 625 tests passed after the editorial unpublish edits. No production database was used. |
| Prisma schema | PASS | `prisma validate` passed. No migration was run against production. |
| Dependency audit | PASS (scope limited) | Clean `npm ci` reported 0 npm audit vulnerabilities. This does not close or dismiss GitHub Dependabot records. |
| Authentication and tenant acceptance | BLOCKED | Production IAM counts are zero for accounts, organizations, memberships, sessions, invitations and password credentials. Signup is deliberately unavailable; invitations require an authenticated user, so no legitimate first-admin provisioning path is present. Positive production login, tenant selection and role tests cannot be performed without an authorized real principal. Disposable fixtures were not enabled in production. |
| Negative authentication/API checks | NOT TESTED in production | CI and unit falsification tests exist, but do not prove production identity-provider configuration or production tenant isolation. |
| Editorial authenticity | BLOCKED | Public mock content includes an explicitly fictional Anika Rao/Asteria Systems profile and interview, fictional-edition fallback copy, unsupported author/company claims and image rights without source records. The disposition matrix is in `EDITORIAL-AUTHENTICITY-MATRIX-2026-11-01.md`. Do not certify public factual authenticity until an editor decides and source verification is complete. |
| Durable recovery | BLOCKED | Neon production project is on Free plan; 6-hour history window; no automated snapshot schedule; one manual snapshot from 2026-10-10 expires 2026-11-09; no production object-storage bucket or verified off-platform logical backup. No measured restore drill with recorded RTO exists. |
| Monitoring and human alert | BLOCKED (partial channel test) | Vercel grouped runtime errors showed no errors in the queried 24-hour window. Hobby runtime-log query for the latest 30 minutes returned no records. Observability Plus is not enabled; webhook access was denied. A proposed hourly GitHub Actions smoke check for liveness, database readiness and the homepage is included in this PR; it is not active until merged and its failure notification path is not yet tested. A safe synthetic email was sent to the owner-authorized `vaishnavsawant1994@gmail.com`; Gmail accepted it, but recipient acknowledgment is pending. The manual email does not validate an automated Vercel/GitHub alert integration. |
| Rollback | NOT TESTED | A previous production deployment is available as a candidate, but there is no isolated rollback rehearsal evidence in the release record. Production traffic was not redirected. |
| GitHub branch protection | BLOCKED | GitHub integration could read the repository's active release-tag ruleset but received 403 on branch-protection readback. Required branch checks, approval policy and environment restrictions are therefore unverified from this access path. |
| Release-tag ruleset | PASS (narrow) | Active repository ruleset `26278001`, “Protect release tags”, applies to `refs/tags/v*` and prohibits update/deletion. It does not establish branch protection. No release tag was created. |
| Independent review | BLOCKED | No independent reviewer has examined this exact production SHA and evidence package. The implementing agent does not self-approve or certify. |

## Current-main local qualification

Environment: Node.js `v24.20.0`; clean install from committed lockfile; test database URL pointed to closed loopback port `127.0.0.1:1` and was not reachable. The unit suite uses test doubles for database-facing falsification cases. CI provides disposable PostgreSQL 16 for database-backed qualification.

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 534 packages installed; npm reported 0 vulnerabilities |
| `npm run lint` | PASS; 0 errors, 3 warnings |
| `npm run typecheck` | PASS |
| `npm test` | PASS after setting the workflow's dummy auth variables; 625/625 |
| `npm run db:validate` | PASS |
| `npm run build` on current `main` | PASS; Next.js 16.4.3 compiled and generated 475 static pages. |
| `npm run build` with editorial removal | PASS; Next.js 16.4.3 compiled and generated 469 static pages. |

The three lint warnings are existing unused values in `src/modules/comms/r6-communications.database.test.ts` (two) and `src/modules/r7/commands.ts` (one). The editorial removal branch also passed lint, typecheck and 625/625 unit tests.

After the editorial removal, local production-server probes returned 404 for `/people/anika-rao` and `/article/the-next-era-of-leadership-human-purpose-in-an-ai-world`, and 200 for `/` and `/api/health/live`. These probes validate the branch build only; production remains unchanged pending review, merge and Vercel deployment.

## Recovery facts and decision boundary

Neon readback: project `nameless-surf-82295602`, production branch `br-icy-mountain-bak8ooxk`, Free plan, 21,600-second history window, 67,051,520-byte logical database size, no automated snapshot schedule. The only listed snapshot is `snap-quiet-dawn-bab1x4dv`, a manual snapshot dated 2026-10-10 that expires 2026-11-09. Production branch object-storage bucket listing is empty. The older issue #32 assertion that a verified dump exists in a Neon bucket is not supported by current provider readback.

Neon's current public pricing states that the Free plan has a six-hour history window and Launch supports up to seven days; a 30-day history window is on Scale. Scheduled snapshots are separately priced. A rough storage-only estimate for 30 full copies at the current logical size and the published snapshot rate of $0.09/GB-month is about $0.17/month before copy-on-write effects, data growth, regular database storage, compute or egress. This is an estimate, not a bill quote. A 30-day continuous PITR window is a different capability and requires Scale. Sources: [Neon pricing](https://neon.com/pricing), [history-window documentation](https://neon.com/docs/postgres/backup-restore/history-window), [automated pg_dump guide](https://neon.com/docs/manage/backup-pg-dump-automate).

No paid plan/infrastructure change was applied, and no database restore branch was created. An off-platform encrypted `pg_dump` path needs a destination account, encryption/key ownership, least-privilege credentials, retention policy, recurring-job owner and measured isolated restore. Those inputs and a recurring-cost cap are not present, so this remains blocked. Never store a dump or database credential in the repository or a public issue.

## PR and workflow reconciliation

| Item | Current evidence | Disposition |
| --- | --- | --- |
| PR #30 | Refreshed against current `main`; head `55b2fe921b3042e01b5701bce4a4770fde3bf456`. Exact-head Vercel status and all listed workflows except its new V1 UI Control Qualification passed. The UI auditor built the app, provisioned only a disposable Postgres fixture, and scanned 167 authenticated routes / 12,519 controls. It found 569 control/accessibility/navigation issues (unnamed controls, dead `#` links and a console 403 among reported examples), so the audit failed. | Keep open and unmerged. Preserve the useful audit, fix findings in bounded UI tranches, and rerun exact-head qualification. Do not weaken the audit to turn findings green. |
| PR #31 | Broad grouped development dependency changes include major version jumps; its old exact-head checks failed 15 of 16 reported qualifications. | Keep open and unmerged pending a scoped, current-base dependency proposal and full qualification. |
| PR #33 | Adds `/news` alias contrary to the current route contract test, which explicitly rejects that alias; most related route repairs are already on `main`. | Superseded/conflicting; do not merge. |
| PR #38 | Old base; its old-head checks passed, but it proposes grouped updates without an established active advisory need. Current `main` audit reports zero npm findings. | Keep open and unmerged pending current-base requalification and security/advisory reconciliation. |
| PR #36 database retry | Initial database-backed qualification had one concurrency failure in two simultaneous lead-conversion attempts; a later rerun passed. Provider logs were not available through the connected GitHub integration, so the test failure cannot be classified confidently as test-fixture contention or product flakiness. Preserve both attempts in the review record. |

GitHub Dependabot alert details are unavailable through the connected integration. Do not close or dismiss alerts based solely on the clean local `npm audit`. The repository is public. The connected GitHub integration cannot read branch protection (403), although repository ruleset readback succeeded for the tag rule above.

## Required closure evidence

1. Editor disposition and source/rights verification for every public mock identity, quote, company claim, author credential and portrait. See the editorial matrix.
2. A legitimate first-admin provisioning path reviewed for abuse resistance, followed by production positive login/session tests with an authorized account and production negative cross-tenant/role/revocation/API tests.
3. Owner-approved recovery budget and destination; scheduled backup or encrypted off-platform backup; isolated restore with measured RPO/RTO and documented operator steps.
4. Monitoring configuration with actual delivery and human acknowledgement of a synthetic alert to an authorized recipient.
5. Isolated rollback/recovery rehearsal with exact deployment and data compatibility evidence.
6. Authorized readback of branch protection, required status checks and production environment policy; reconcile Dependabot records against the lockfile and SBOM.
7. Independent review of the exact deployed SHA, provider settings and evidence; record reviewer identity and findings.

Until all mandatory gates pass, V1.0 remains **NOT CERTIFIED**. Do not create a `v1.0.0` tag.
