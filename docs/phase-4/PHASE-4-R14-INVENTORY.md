# R14 inventory

STATUS: **PLANNING INVENTORY — NOT CERTIFICATION**
BASELINE: `087f0f526292a2f1dc37cb88a74ce7c7aa86cae3`
DATE: 3 October 2026

R14 adds no product capability and no permission key. Classifications below are against accepted R1–R13. "Qualified" means an inherited exact-head workflow already passed on the R13 record. It does not mean production deployment.

| Area | Classification | Evidence / gap |
|---|---|---|
| Authentication, sessions, MFA, recovery | qualified; R14 requalification required | R3 workflows. Re-run on the R14 candidate. |
| Authorization and 131-key registry | qualified; R14 requalification required | R5. No new key. Dormant keys stay dormant. |
| Tenancy and organizations | qualified | R4. |
| Teams, departments, roles | qualified | R5. Not an R14 rebuild. |
| CRM, communications, commercial | qualified | R6. |
| Proposals, contracts, signatures, invoices, payments | qualified | R7. No provider-owned PAID/SIGNED from the browser. |
| Editorial production | qualified | R8. |
| Publishing, magazines, reader | qualified | R9. Drafts are not public reader documents. |
| Podcasts, video, events, distribution | qualified | R10. Provider absence stays `PROVIDER_UNAVAILABLE`. |
| Growth, SEO, analytics, reporting, automation, search | qualified | R11. |
| Client portal | qualified | R12. Same-owner client isolation stays denied. |
| Member platform, offers, entitlements | qualified | R12. No real payment provider. Checkout is not operational charging. |
| Subscriptions as a second member ledger | intentionally deferred | R12 does not write `commercial.subscriptions` as member truth. |
| Settings and integration declarations | qualified | R13. Declarations are not configured providers. |
| Notifications and email delivery | intentionally absent | No engine and no provider. Not a silent V1 promise. |
| Object storage / uploads as an operations product | intentionally absent | R8 file versions are not an R13/R14 blob store. |
| AI assistance | intentionally absent | No permission and no provider. |
| Workers | qualified | R9–R12 worker routes exist. No R13 worker. Tokens are server env, not browser input. |
| Audit | qualified | Append-only events. No new incident API. |
| Public website | qualified as fixture-backed editorial routes plus accepted publishing reads | R14 smoke must hit home, login, and a public article route. |
| APIs | qualified | Inherited hostile HTTP tests. |
| PostgreSQL, migrations, RLS | qualified through R13 | 24 migrations. Runtime `NOSUPERUSER` / `NOBYPASSRLS`. |
| CI/CD | qualified as GitHub Actions | Actions are not production. |
| Dependencies | production gate 0 high; dev-tree and Dependabot separate | Re-run `npm audit --omit=dev --audit-level=high`. |
| Secrets in source | requalification required | Scan. CI passwords already committed in workflows are qualification secrets, not production secrets. |
| Backup and restore | production-readiness gap | No backup exists. R14 must take and restore a qualification dump or it has no backup evidence. |
| Monitoring and alerts | external-review and infrastructure gap | No host, no alert vendor, no tested alert path. A health route is not an alert. |
| Incident handling | production-readiness gap | No runbook is implemented. R14 may write procedures for the real architecture only. |
| Deployment, DNS, TLS, production database | blocker until the owner selects a host and supplies credentials | Do not invent a provider. |
| Independent review | external-review gap and certification blocker | GOV-REVIEW-01 section 4. This agent cannot self-attest. |
| Open PRs #8 and #10 | intentionally deferred | Drafts. Not V1 scope. |

No area above may be marked production-certified by this inventory.
