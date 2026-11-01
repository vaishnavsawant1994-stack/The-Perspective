# The Perspective current-state reconciliation

**Evidence date:** 1 November 2026 (Asia/Kolkata)  
**Repository:** `vaishnavsawant1994-stack/The-Perspective`  
**Status:** Production is deployed. V1.0 is **not certified**.

This report supersedes the current-production facts in [the 31 October reconciliation](./CURRENT-STATE-RECONCILIATION-2026-10-31.md). That file remains the historical record for its stated source snapshots.

## Exact source and deployment

| Evidence | Current value |
| --- | --- |
| GitHub `main` | `060e0bcdf10293c50edd3acc5ccd51dbd0834e77` |
| Merged UI-control qualification | PR [#30](https://github.com/vaishnavsawant1994-stack/The-Perspective/pull/30), squash commit `060e0bcdf10293c50edd3acc5ccd51dbd0834e77` |
| Production deployment | [Vercel deployment](https://vercel.com/vishnu26/the-perspective/GAMoYFogdsYr7ZDeHvXSzGZMJd95), `dpl_GAMoYFogdsYr7ZDeHvXSzGZMJd95`, `READY` |
| Production source | `main@060e0bcdf10293c50edd3acc5ccd51dbd0834e77` |
| Aliases | `the-perspective-vishnu26.vercel.app`, `the-perspective-liart.vercel.app` |
| Runtime | Node.js 24, Vercel `fra1`; Neon PostgreSQL 16, Frankfurt |

The project was selected through its Vercel production alias. Read-only HTTP checks against the alias after the deployment became READY returned:

| Route | Observed result |
| --- | --- |
| `/` | HTTP 200 |
| `/login` | HTTP 200 |
| `/api/health/live` | HTTP 200, `{"status":"live"}` |
| `/api/health/ready` | HTTP 200, `{"status":"ready"}` |
| `/personal-magazines/discover` | HTTP 200 |
| `/my/library` without a session | HTTP 200 login page; canonical URL is `/login` |

The sampled health responses included HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy`. These are scoped HTTP observations, not a complete production security certification.

PR #30 passed all 24 exact-head check runs on `ce39604f4e95399fac1fed6161a5a0d4e349dd35`, including the full authenticated static UI control audit and Vercel preview, before merge. GitHub rejected the earlier merge attempt while that branch was behind `main`; the branch was updated to `main@027c7d1`, requalified, and merged only after the updated head passed.

## Current implementation and operations evidence

- **Route and UI qualification:** PR #30's Chromium audit passed against a disposable PostgreSQL database and production build. The suite checks route responses, errors, console output, overflow, accessible names, dead links, and focusability. It does not click mutation controls and does not claim full WCAG conformance or cross-browser coverage.
- **Editorial authenticity:** The fictional public profile/interview selected for removal was unpublished in PR #43. It is not represented as a verified person or interview.
- **Encrypted backups:** The daily GitHub Actions backup workflow writes encrypted dumps to a private bucket in the separate Neon Free backup project, with 30-day object retention. Run [41313449319](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/41313449319) completed upload/read-back/decryption and a disposable PostgreSQL restore of 146 application tables. The destination is a second project in the same Neon account/provider, so this does not protect against loss of that account or provider. Production Neon PITR remains six hours; the selected Neon plan does not provide the requested automatic snapshot schedule. No paid-plan upgrade was made.
- **First-owner setup:** Draft PR [#49](https://github.com/vaishnavsawant1994-stack/The-Perspective/pull/49) is at head `3ef8c8ed044223dcc5c76e3b04110a12b6615773`, based on current main. All 17 qualification workflows and 24 exact-head checks plus the Vercel preview passed. It adds guarded first-owner bootstrap and makes R01 activation depend on a fresh password plus verified TOTP login. The bootstrap has not been run and no production owner identity was created. The PR remains gated on independent security review; Codex's supplemental review is not independent.
- **Production authentication and tenancy:** Disposable-database CI coverage passes, but positive production login, MFA, tenant selection, same-tenant authorization, tenant switching, and cross-tenant denial have not been demonstrated with a legitimate production identity.
- **Alerts:** Runtime logs and liveness/readiness checks exist. No configured alerting channel has delivered a synthetic failure alert and received human acknowledgement.
- **Rollback:** A prior READY deployment is retained as a rollback candidate. No rollback rehearsal has been recorded.
- **GitHub controls:** `main` is protected and its merge gate enforced required checks during PR #30. This GitHub connection cannot read the detailed branch-protection endpoint (403); the owner-level read-back of exact rules, administrators, reviews, and environment restrictions remains an R14 evidence item.
- **Providers:** V1 has no production email/notification, payment, signature, or external distribution provider. Provider-backed actions must remain fail-closed.
- **V1.1:** Profile Network remains a proposal. No Profile Network route, schema migration, or AI automation is part of this release.

## R14 / V1.0 decision

Technical qualification, successful deployment, green CI, working health endpoints, and the completed UI-control audit do not equal certification. The R14 independent-review contract requires a reviewer separate from the authoring agent; it explicitly excludes an agent self-review, green workflows, and an owner waiver. The owner has no separate reviewer available at this time.

Do not create a V1.0 release tag, state that V1.0 is certified, or run the production first-owner bootstrap until the mandatory review and remaining production acceptance gates are closed by evidence. The current release status is **PRODUCTION DEPLOYED — V1.0 NOT CERTIFIED**.

## Immediate remaining gates, in order

1. Obtain a separate reviewer for PR #49's exact current head and resolve any findings. Codex can provide supplemental review but cannot fulfill this gate.
2. After review and release authorization, provision the first owner through the guarded production flow; then verify production MFA, session lifecycle, tenant selection, authorization, and cross-tenant denial.
3. Configure a real alert delivery path and prove synthetic alert delivery plus human acknowledgement.
4. Rehearse rollback and a forward recovery without destructive production database rollback.
5. Obtain an owner-level read-back of GitHub branch protections and production deployment environment restrictions.
6. Decide whether to add an account/provider-independent backup copy. The current daily encrypted restore is verified, but its storage shares the Neon account/provider.
7. Complete any remaining manual cross-browser and accessibility review required by the R14 contract.

The generated [implementation matrix](./MASTER-IMPLEMENTATION-MATRIX-2026-11-01.csv) records route-module presence separately from design, API, database, provider, end-to-end, and production evidence. Its source snapshot is named in the `sourceSnapshotSha` column.
