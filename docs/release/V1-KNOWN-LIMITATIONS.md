# V1 known limitations

**STATUS: LIMITATIONS — PRODUCTION DEPLOYED — V1.0 NOT CERTIFIED**

Current exact source and environment evidence are recorded in [CURRENT-STATE-RECONCILIATION-2026-10-31.md](./CURRENT-STATE-RECONCILIATION-2026-10-31.md). This list describes the current release boundary, not the earlier pre-production state.

- Production runs from `main@28d5cc69c7534e401b03d8aa2c18a8a65f41bc3a` on Vercel/Node.js 24 with Neon PostgreSQL 16. Post-release liveness/readiness checks returned HTTP 200; see the reconciliation addendum for deployment and smoke evidence.
- No legitimate production user, organization, membership, or session is available for positive production login, session lifecycle, tenant-switch, same-tenant, and cross-tenant acceptance. Do not use disposable account fixtures in production.
- GitHub still reports 18 open Dependabot alert records (4 critical, 4 high, 9 moderate, 1 low) even though the current lockfile and GitHub SBOM resolve those packages to patched versions and both npm audits report zero. The records were not dismissed; see the alert reconciliation.
- An independent external V1 review has not been performed. V1.0 is not certified.
- The current Neon snapshot schedule is empty. A manual backup/restore and a private baseline are recorded, but an automated retained schedule and Neon production-branch recovery controls remain unresolved. GitHub `main` source protection is configured separately.
- GitHub `main` now enforces 23 required checks, up-to-date branches and administrators; force pushes/deletion are disabled. `v*` release tags cannot be updated or deleted, and GitHub Production deployments are limited to `main`. Required approvals remain unset; no outside reviewer was added. PR #39 provides Node 24 job names and passed 16/16 workflows, but is still awaiting owner review/merge. The R14 handoff issue still names an older candidate and needs reconciliation.
- Runtime logs and hourly liveness/readiness checks are available; a tested human paging path under simulated failure is not demonstrated.
- The V1 surface has no live email/notification delivery, payment collection, signature provider, object-storage upload product, external distribution provider, or AI assistant. Provider-facing actions must keep failing closed where specified.
- The local development checkout has no `.env` or `.env.local`. UI rendering in the local server is not evidence of production data access or authentication.
- The August 2026 57-page audit contains useful source-level observations but its implementation/data assessments are historical. The 153-design audit is a specification audit, not per-screen runtime qualification. See the generated 31 October matrix for the exact distinctions and the currently unmatched `/personal-magazines/discover` route.
- Existing cross-browser, accessibility, responsive, performance, and business-journey evidence is limited to the exact scope listed in the R14 records. Do not turn a Chromium check or a green workflow into a broad compatibility or WCAG claim.

No V1.0 tag or certification claim is permitted until every mandatory gate is closed by evidence and the independent reviewer has recorded a verdict through the approved process.
