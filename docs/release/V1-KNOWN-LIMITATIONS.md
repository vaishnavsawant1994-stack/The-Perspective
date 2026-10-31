# V1 known limitations

**STATUS: LIMITATIONS — PRODUCTION DEPLOYED — V1.0 NOT CERTIFIED**

Current exact source and environment evidence are recorded in [CURRENT-STATE-RECONCILIATION-2026-10-31.md](./CURRENT-STATE-RECONCILIATION-2026-10-31.md). This list describes the current release boundary, not the earlier pre-production state.

- Production runs from `main@9c266451fbc5c07788993ba453c5a9997e5453cf` on Vercel/Node.js 24 with Neon PostgreSQL 16. Liveness and readiness checks returned HTTP 200 during the 31 October 2026 reconciliation.
- No legitimate production user, organization, membership, or session is available for positive production login, session lifecycle, tenant-switch, same-tenant, and cross-tenant acceptance. Do not use disposable account fixtures in production.
- An independent external V1 review has not been performed. V1.0 is not certified.
- The current Neon snapshot schedule is empty. A manual backup/restore and a private baseline are recorded, but an automated retained schedule and protected production branch remain unresolved under current account capabilities.
- GitHub repository review/check enforcement and force-push/deletion protection need administrator confirmation. The existing R14 handoff issue names the prior candidate SHA and must be reconciled to current `main` and deployment evidence.
- Runtime logs and hourly liveness/readiness checks are available; a tested human paging path under simulated failure is not demonstrated.
- The V1 surface has no live email/notification delivery, payment collection, signature provider, object-storage upload product, external distribution provider, or AI assistant. Provider-facing actions must keep failing closed where specified.
- The local development checkout has no `.env` or `.env.local`. UI rendering in the local server is not evidence of production data access or authentication.
- The August 2026 57-page audit contains useful source-level observations but its implementation/data assessments are historical. The 153-design audit is a specification audit, not per-screen runtime qualification. See the generated 31 October matrix for the exact distinctions and the currently unmatched `/personal-magazines/discover` route.
- Existing cross-browser, accessibility, responsive, performance, and business-journey evidence is limited to the exact scope listed in the R14 records. Do not turn a Chromium check or a green workflow into a broad compatibility or WCAG claim.

No V1.0 tag or certification claim is permitted until every mandatory gate is closed by evidence and the independent reviewer has recorded a verdict through the approved process.
