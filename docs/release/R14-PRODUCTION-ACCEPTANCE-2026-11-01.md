# R14 Production Acceptance Evidence — 2026-11-01

## Release identity

| Field | Evidence |
| --- | --- |
| Production source | `main` at `099dff6b0f1e0b9d0e7eb1afd9d43f00be9e3401` |
| Vercel production deployment | `dpl_AXggSrAD7G6vrpR5xRTxY6vkqUhJ` — READY |
| Application aliases | `https://the-perspective-liart.vercel.app`, `https://the-perspective-vishnu26.vercel.app` |
| Release decision | **V1.0 NOT CERTIFIED** |

The deployment is current and serving traffic. This operational fact does not satisfy the identity, recovery, editorial, monitoring or independent-review gates below.

## Acceptance matrix

| Gate | Result | Evidence and remaining work |
| --- | --- | --- |
| Production release identity | PASS | Vercel reports READY for exact `main` SHA `099dff6b0f1e0b9d0e7eb1afd9d43f00be9e3401` on deployment `dpl_AXggSrAD7G6vrpR5xRTxY6vkqUhJ`, with both production aliases. |
| Core public HTTP surfaces | PASS (sampled) | After the deployment became READY, live production returned 404 for `/people/anika-rao`, the associated Anika article and `/images/home/anika-rao-cutout.png`; `/`, `/api/health/live` and `/api/health/ready` returned 200. Homepage HTML no longer contains Anika Rao or Asteria Systems; `/events` no longer contains Asteria Systems. Earlier production samples covered discovery, privacy, terms, cookies, editorial standards, accessibility, community guidelines, `robots.txt`, sitemap and exact canonicals. This is a route sample, not exhaustive browser coverage. |
| Production build | PASS | PR #43 exact head built successfully with Next.js 16.4.3 and generated 469 static pages. PR #44's synced exact head also passed the R14 full qualification production build and deployed successfully on current `main`. |
| Lint and TypeScript | PASS | Current-main lint completed with 0 errors and 3 existing unused-variable warnings; TypeScript check passed. |
| Unit suite | PASS | Current-main Vitest: 81 files, 625 tests passed using isolated dummy session configuration and a closed loopback database URL. The initial run without required auth environment failed 19 tests at configuration validation; rerun with the workflow's non-production test values passed. The same 625 tests passed after the editorial unpublish edits. No production database was used. |
| Prisma schema | PASS | `prisma validate` passed. No migration was run against production. |
| Dependency audit | PASS (scope limited) | Clean `npm ci` reported 0 npm audit vulnerabilities. This does not close or dismiss GitHub Dependabot records. |
| Authentication and tenant acceptance | BLOCKED | Production IAM counts are zero for accounts, organizations, memberships, sessions, invitations and password credentials. Signup is deliberately unavailable; invitations require an authenticated user, so no legitimate first-admin provisioning path is present. Positive production login, tenant selection and role tests cannot be performed without an authorized real principal. Disposable fixtures were not enabled in production. |
| Negative authentication/API checks | NOT TESTED in production | CI and unit falsification tests exist, but do not prove production identity-provider configuration or production tenant isolation. |
| Editorial authenticity | BLOCKED (partial remediation) | Editor-approved removal of the explicitly fictional Anika Rao/Asteria Systems profile, interview, homepage/podcast references, public portrait and unsupported event attribution is live; direct production probes confirmed 404 for the profile/article/asset. Other mock identities, author credentials, company claims, fallback fiction language and image rights still require verification or removal. See `EDITORIAL-AUTHENTICITY-MATRIX-2026-11-01.md`. |
| Durable recovery | BLOCKED | Neon production project remains on Free plan with a 6-hour history window and no scheduled snapshots. The 2026-10-10 manual snapshot expires 2026-11-09; production object-storage bucket listing is empty and no off-platform logical backup was verified. The owner previously approved daily/30-day snapshots, but Neon rejected the schedule: “backup schedule creation is not enabled for this project.” No plan change was made. Provider metadata shows production was finalized from snapshot `snap-quiet-dawn-bab1x4dv`; associated restore branch `br-crimson-pond-baeb2xdu` is now archived. No elapsed restore time or post-restore validation record is available, so this does not meet the measured restore gate. |
| Monitoring and human alert | BLOCKED (partial channel test) | Vercel grouped runtime errors showed no errors in the queried 24-hour window; Hobby runtime logs had no records in the latest 30 minutes; Observability Plus is not enabled and webhook readback was denied. The hourly GitHub Actions smoke workflow is merged and checks liveness, database readiness and the homepage; its first scheduled run and human notification path are not yet verified. Gmail accepted the owner's safe synthetic email; acknowledgment is pending. The manual email does not verify automated alert delivery. |
| Rollback | NOT TESTED | A previous production deployment is available as a candidate, but there is no isolated rollback rehearsal evidence in the release record. Production traffic was not redirected. |
| GitHub branch protection | BLOCKED | GitHub integration could read the repository's active release-tag ruleset but received 403 on branch-protection readback. Required branch checks, approval policy and environment restrictions are therefore unverified from this access path. |
| Release-tag ruleset | PASS (narrow) | Active repository ruleset `26278001`, “Protect release tags”, applies to `refs/tags/v*` and prohibits update/deletion. It does not establish branch protection. No release tag was created. |
| Independent review | BLOCKED | No independent reviewer has examined this exact production SHA and evidence package. The implementing agent does not self-approve or certify. |

## Local and exact-PR qualification

Environment: Node.js `v24.20.0`; clean install from committed lockfile; test database URL pointed to closed loopback port `127.0.0.1:1` and was not reachable. The unit suite uses test doubles for database-facing falsification cases. CI provides disposable PostgreSQL 16 for database-backed qualification.

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 534 packages installed; npm reported 0 vulnerabilities |
| `npm run lint` | PASS; 0 errors, 3 warnings |
| `npm run typecheck` | PASS |
| `npm test` | PASS after setting the workflow's dummy auth variables; 625/625 |
| `npm run db:validate` | PASS |
| `npm run build` before editorial removal | PASS; Next.js 16.4.3 compiled and generated 475 static pages. |
| `npm run build` on PR #43 head | PASS; Next.js 16.4.3 compiled and generated 469 static pages. |
| PR #43 exact-head GitHub qualification | PASS; all 16 workflow runs succeeded. Vercel Preview status succeeded. |
| PR #44 synced exact-head qualification | PASS; head `0934bb20e45adfbe58bd8d82fdd49241632b0e53` has 23/23 check runs completed successfully, including R4 tenancy, R14 full qualification and Vercel Preview. Merged as `099dff6b0f1e0b9d0e7eb1afd9d43f00be9e3401`; production deployment `dpl_AXggSrAD7G6vrpR5xRTxY6vkqUhJ` is READY. |
| Production dependency SBOM | PASS; CycloneDX 1.5, 28 production dependency components; generated locally and not committed. |
| `npm audit` | PASS; 0 vulnerabilities (0 critical/high/moderate/low). GitHub alert records remain unresolved due integration access. |

The three lint warnings are existing unused values in `src/modules/comms/r6-communications.database.test.ts` (two) and `src/modules/r7/commands.ts` (one). The PR #43 branch also passed lint, typecheck and 625/625 unit tests.

After PR #44 deployed, current production probes returned 404 for `/people/anika-rao`, `/article/the-next-era-of-leadership-human-purpose-in-an-ai-world` and `/images/home/anika-rao-cutout.png`; `/`, `/api/health/live` and `/api/health/ready` returned 200. Current homepage HTML contains neither Anika Rao nor Asteria Systems. The live deployment source is exact `main` SHA `099dff6b0f1e0b9d0e7eb1afd9d43f00be9e3401`.

## Recovery facts and decision boundary

Neon readback: project `nameless-surf-82295602`, production branch `br-icy-mountain-bak8ooxk`, Free plan, 21,600-second history window, 67,051,520-byte logical database size, no automated snapshot schedule. The only listed snapshot is `snap-quiet-dawn-bab1x4dv`, a manual snapshot dated 2026-10-10 that expires 2026-11-09. The owner had previously selected and approved a daily schedule with 30-day retention; the exact request (`daily`, 03:00 UTC, 2,592,000-second retention) was rejected by Neon as unavailable on this project. The account exposes no plan-upgrade operation through the connected Neon tool. Production branch object-storage bucket listing is empty. The older issue #32 claim of a verified dump in a Neon bucket is not supported by current provider readback.

Historical restore metadata: Neon reports production as finalized from `snap-quiet-dawn-bab1x4dv`, with `restored_as=br-crimson-pond-baeb2xdu`. That separate branch, named `v1-recovery-restore-check-20261010 (1)`, is archived and has 50,085,888 bytes logical size. This confirms a historical snapshot-based branch restore occurred; it does not provide elapsed time, recovery-point verification or application validation after restore. Therefore RTO and full restore acceptance remain unproven. No new restore branch was created.

Neon's current public pricing states that the Free plan has a six-hour history window and Launch supports up to seven days; a 30-day history window is on Scale. Scheduled snapshots are separately priced. A rough storage-only estimate for 30 full copies at the current logical size and the published snapshot rate of $0.09/GB-month is about $0.17/month before copy-on-write effects, data growth, regular database storage, compute or egress. This is an estimate, not a bill quote. A 30-day continuous PITR window is a different capability and requires Scale. Sources: [Neon pricing](https://neon.com/pricing), [history-window documentation](https://neon.com/docs/postgres/backup-restore/history-window), [automated pg_dump guide](https://neon.com/docs/manage/backup-pg-dump-automate).

No plan change or off-platform backup infrastructure was applied. An encrypted off-platform `pg_dump` path needs a destination account, encryption/key ownership, least-privilege credentials, retention policy, recurring-job owner and measured isolated restore. Do not store a dump or database credential in the repository or a public issue.

## PR and workflow reconciliation

| Item | Current evidence | Disposition |
| --- | --- | --- |
| PR #30 | Refreshed against current `main`; head `55b2fe921b3042e01b5701bce4a4770fde3bf456`. Exact-head Vercel status and all listed workflows except its new V1 UI Control Qualification passed. The UI auditor built the app, provisioned only a disposable Postgres fixture, and scanned 167 authenticated routes / 12,519 controls. It found 569 control/accessibility/navigation issues (unnamed controls, dead `#` links and a console 403 among reported examples), so the audit failed. | Keep open and unmerged. Preserve the useful audit, fix findings in bounded UI tranches, and rerun exact-head qualification. Do not weaken the audit to turn findings green. |
| PR #31 | Broad grouped development dependency changes include major version jumps; its old exact-head checks failed 15 of 16 reported qualifications. | Keep open and unmerged pending a scoped, current-base dependency proposal and full qualification. |
| PR #33 | Adds `/news` alias contrary to the current route contract test, which explicitly rejects that alias; most related route repairs are already on `main`. | Closed as superseded/conflicting on 2026-11-01 with rationale recorded on the PR. |
| PR #38 | Old base; its old-head checks passed, but it proposes grouped updates without an established active advisory need. Current `main` audit reports zero npm findings. | Keep open and unmerged pending current-base requalification and security/advisory reconciliation. |
| PR #43 | Editor-approved unpublish of explicitly fictional Anika/Asteria content plus R14 evidence and hourly health smoke workflow. | Merged after 16/16 exact-head GitHub workflows and Vercel Preview passed. Production deployment `dpl_CKXdtPVgQmoP81EqFaTH35s57T4N` is READY; live routes confirm the fictional profile/article/portrait return 404. |
| PR #36 database retry / PR #44 follow-up | Initial R4 PostgreSQL attempt failed in `contains concurrent lead conversion to one canonical deal`: one same-lead conversion returned `error` where `ok` was expected (1 of 252 DB tests failed). The workflow config sets `fileParallelism: false`, and the test intentionally issues two concurrent conversions; database logs showed serialization conflicts. Rerun passed 252/252 database tests and 625/625 unit tests. | PR #44 adds a bounded 20/40/60/80 ms backoff across the existing five conflict/stale-write/deadlock retries. After syncing to current `main`, exact head `0934bb20e45adfbe58bd8d82fdd49241632b0e53` had 23/23 GitHub check runs completed successfully, including R4 Tenancy Qualification and R14 Technical Certification; Vercel Preview succeeded. Merged as `099dff6b0f1e0b9d0e7eb1afd9d43f00be9e3401`. Production deployment `dpl_AXggSrAD7G6vrpR5xRTxY6vkqUhJ` is READY and live route probes passed. An earlier pre-sync merge request returned `23 of 23 required status checks are expected`; syncing to current main and requalifying resolved the merge gate. |

GitHub Dependabot alert details are unavailable through the connected integration. Do not close or dismiss alerts based solely on the clean local `npm audit`. The repository is public. The connected GitHub integration cannot read branch protection (403), although repository ruleset readback succeeded for the tag rule above.

## Required closure evidence

1. Complete source/rights verification and editor disposition for the remaining public mock identities, quotes, company claims, author credentials and portraits. The explicitly fictional Anika/Asteria content is unpublished; see the editorial matrix.
2. A legitimate first-admin provisioning path reviewed for abuse resistance, followed by production positive login/session tests with an authorized account and production negative cross-tenant/role/revocation/API tests.
3. Owner-approved recovery budget and destination; scheduled backup or encrypted off-platform backup; isolated restore with measured RPO/RTO and documented operator steps.
4. Verify the hourly workflow has run on `main`; configure an automated human notification path where available and record delivery plus acknowledgment. Gmail accepted the owner-authorized synthetic email (message `1a195397893aa5ae`); human acknowledgment remains pending. The manual email does not verify automated alert delivery.
5. Isolated rollback/recovery rehearsal with exact deployment and data compatibility evidence.
6. Authorized readback of branch protection, required status checks and production environment policy; reconcile Dependabot records against the lockfile and SBOM.
7. Independent review of the exact deployed SHA, provider settings and evidence; record reviewer identity and findings.

GitHub issue #32 now has dated 2026-11-01 comments reconciling the prior release record with current production and the remaining gates. Its original history remains intact.

Until all mandatory gates pass, V1.0 remains **NOT CERTIFIED**. Do not create a `v1.0.0` tag.
