# The Perspective — Project Completion Status

**Evidence checked:** 2026-11-18 UTC

**Decision:** V1.0 is **NOT CERTIFIED**. V1.1 is **qualified by CI but not released**.

This is the current status record. Older dated release reports remain historical evidence; their statements about the active provider, commits, PRs, and live deployment may be superseded here.

## GitHub and development

| Area | Status | Evidence |
| --- | --- | --- |
| `main` | PASS | `3fa80397963761d29d4e972fadf4f098e50e8c75` |
| PR #73 — Profile Network | PASS for code qualification only; NOT ACCEPTED / NOT RELEASED | Open, draft, mergeable, based on current `main`. Application/test-fixture commit `8c16a27215e58f9a9096f2a3630c444cff719e16` passed its exact-head qualification; subsequent commits on the PR branch are documentation-only. The linked PR shows the live head. [PR #73](https://github.com/vaishnavsawant1994-stack/The-Perspective/pull/73) |
| PR #73 checks | PASS on qualified application code | GitHub reported 24/24 successful checks, all 17 associated Actions workflow runs and combined status, on application commit `8c16a27215e58f9a9096f2a3630c444cff719e16`. The focused UI-control/browser qualification completed successfully. Recheck the linked PR for current exact-head checks after documentation updates. |
| Local qualification | PASS with warnings | On PR #73 head: 647 unit tests across 85 files, TypeScript, diff check, and lint with zero errors and three existing warnings. Local Docker was unavailable, so the browser/database workflow ran in GitHub Actions. |
| PR promotion / merge | BLOCKED | Keep V1.1 isolated until V1.0 is stable and its own final acceptance is complete. No merge or production deployment was performed. |

The prior browser failure was a test-fixture mismatch: a restricted Team role correctly lacked `editorial.view`. The test now checks that expected denial and uses a separate synthetic editorial identity with scoped permissions. Application authorization was not weakened.

## Hostinger, domain, and public health

| Area | Status | Evidence |
| --- | --- | --- |
| Canonical production host | PARTIAL | `https://www.thetimesofperspective.com/`, `/api/health/live`, and `/api/health/ready` returned HTTP 200 on 2026-11-18; response headers identify Hostinger. |
| Hostinger staging URL | PARTIAL | `https://daily-limegreen-woodcock-36.hostingersite.com/` and `/api/health/ready` returned HTTP 200. |
| Hostinger preview URL | FAIL for route acceptance | The preview homepage returned HTTP 200, but `/companies`, `/professionals`, and `/editors` returned only the shared site shell and omitted their expected directory headings/content. An unknown company slug also returned HTTP 200 without the expected not-found content. The Hostinger record is stale (`119686e`), so exact source and runtime cause are unverified. |
| Deployed source SHA and deployment IDs | NOT TESTED | Hostinger hPanel/runtime deployment readback is unavailable in this session; public health responses do not identify the running source commit. |
| Production owner login and MFA | NOT TESTED | No real owner authentication or MFA journey was performed. |
| DNS | PASS for observed records | Apex resolves to `88.222.243.247`; `www` CNAMEs to the apex; nameservers are `ns23.domaincontrol.com` and `ns24.domaincontrol.com`. This verifies DNS behavior, not access to the GoDaddy account. |
| TLS | PASS for observed hostnames | Apex and `www` served a Let's Encrypt certificate for `thetimesofperspective.com`, valid through 2027-02-15. |
| Production browser journeys | NOT TESTED | Health checks and route probes are not complete authenticated browser acceptance. |

## Neon database and recovery

| Area | Status | Evidence |
| --- | --- | --- |
| Production schema | PASS | Project `nameless-surf-82295602`, branch `br-icy-mountain-bak8ooxk`, database `perspective`: 146 application tables and 24 completed Prisma migrations. |
| Staging schema | PASS | Project `hidden-haze-29775614`, branch `br-cold-hat-ba18b0tj`, database `perspective_staging`: 146 application tables and 24 completed migrations. |
| RLS | PASS as catalog evidence | Both databases report 115 application tables with RLS enabled and forced. This does not substitute for production authenticated tenant-journey tests. |
| Production app runtime role | PASS for least-privilege connection probe | `perspective_hostinger_runtime` connected with `row_security=on`, `BYPASSRLS=false`, and no permission to read `_prisma_migrations`. The Hostinger environment’s use of this role is not confirmed. |
| Staging runtime role | BLOCKED | The only project-specific application login role returned by catalog inspection is `perspective_app` with `BYPASSRLS=true` and database/role creation privileges. No Hostinger `DATABASE_URL` readback is available to confirm which role the site uses. Create/configure a separate least-privilege runtime identity before treating staging authentication as accepted. |
| Production branch protection | BLOCKED by plan | The production branch currently reports `protected=false`. Enabling protection was rejected because the Neon plan has reached its maximum protected-branch count. No branch protection was removed and no plan upgrade was made. |
| Automated encrypted backup | PASS | [2026-11-18 workflow run](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/44283445934) succeeded; its log confirms a remotely stored encrypted object was read back, decrypted, and restored with 146 application tables. Destination is another project in the same Neon account/provider. |
| Snapshot/PITR coverage | PARTIAL | Production snapshot schedule is empty; PITR history is six hours. The only listed manual snapshot, `production-safety-check-2026-11-17`, expires 2026-11-24. No paid plan change was made. |
| Cross-account/provider recovery | NOT TESTED | Existing encrypted backup and restore share the Neon account/provider; independent recovery is not proven. |
| Rollback rehearsal | NOT TESTED | No safe nonproduction rollback drill with database compatibility evidence is recorded. |

## Monitoring, security, and release

| Area | Status | Evidence |
| --- | --- | --- |
| Hourly production health workflow | PASS for endpoint checks | [Latest observed run](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/44319798328) succeeded on `main` and checked liveness, readiness, and homepage. |
| Alert delivery and human acknowledgement | NOT TESTED | The workflow can create/assign a GitHub incident on failure, but no synthetic failure alert or human acknowledgement was observed. |
| GitHub branch ruleset readback | NOT TESTED in this audit | Required checks and ruleset configuration need current administrator readback before release. |
| Independent review | NOT REQUIRED by current owner waiver; NOT PERFORMED | GOV-REVIEW-02 waives the mandatory external review for V1.0. Do not describe an independent review as completed. |
| Release tag / V1.0 certification | BLOCKED | Do not tag or certify until the exact deployed SHA, production authentication, tenant tests, staging runtime-role configuration, alerts, recovery objectives, and rollback gates are closed. |
| V1.1 feature acceptance and production release | BLOCKED | CI passes, but the Hostinger preview route probe failed as described above; full editorial creation-to-withdrawal workflow, browser/accessibility acceptance, exact Hostinger source, and runtime configuration remain unverified. Keep PR #73 in draft until V1.0 is stable and V1.1 acceptance is complete. |

## Next executable work

1. Restore Hostinger hPanel access and confirm the live source SHA, deployment IDs, staging database URL role, runtime logs, and staging/production separation. Use a least-privilege runtime database role; do not use `perspective_app` for application traffic.
2. Resolve Neon’s protected-branch plan limit without unprotecting another branch or changing plans unless separately authorized. The production branch must be protected before claiming that control is in place.
3. Complete authorized production owner login/MFA and positive/negative tenant tests on the verified production source.
4. Exercise the health-workflow failure path and observe a real authorized human notification and acknowledgement.
5. Rehearse rollback in verified nonproduction and record the result.
6. Inspect Hostinger runtime logs and deployed build identity to determine why Profile Network routes return only the site shell; verify staging runtime role and configuration, then rerun directory, unknown-slug, editorial and responsive acceptance while leaving V1.1 separate from V1.0.

No production migration, DNS change, branch deletion, paid upgrade, release tag, PR #73 merge, or V1.1 production deployment was performed in this audit.
