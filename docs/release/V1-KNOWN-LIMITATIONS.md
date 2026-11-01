# V1 known limitations

**STATUS: PRODUCTION DEPLOYED — V1.0 NOT CERTIFIED**

Current exact source and evidence are recorded in [CURRENT-STATE-RECONCILIATION-2026-11-01.md](./CURRENT-STATE-RECONCILIATION-2026-11-01.md).

- Production runs from `main@060e0bcdf10293c50edd3acc5ccd51dbd0834e77` on Vercel/Node.js 24 with Neon PostgreSQL 16. Deployment `dpl_GAMoYFogdsYr7ZDeHvXSzGZMJd95` is READY. Sampled production routes and health endpoints returned HTTP 200.
- PR #30 passed its authenticated Chromium UI-control audit and all 24 exact-head checks before merge. This does not establish full WCAG conformance, all-browser compatibility, or positive production authentication and tenancy.
- No first-owner account was created in production. PR #49 implements guarded bootstrap and MFA-gated R01 activation but remains draft pending independent security review. No production bootstrap should run before that gate and release authorization.
- An independent security review has not happened. A Codex review of work it helped author is supplemental self-review and cannot satisfy the contract. V1.0 is not certified.
- Daily encrypted dumps use a private object-storage bucket in a separate Neon Free project, with 30-day object retention. An isolated restore of 146 application tables passed in workflow run `41313449319`. The bucket is in the same Neon account/provider; loss of that account/provider is not covered. Neon PITR remains six hours, and the selected Free plan does not provide automatic snapshot scheduling. No paid plan upgrade was made.
- A synthetic alert has not been delivered through a configured monitoring channel and acknowledged by a human. Runtime logs and health checks are not paging evidence.
- A prior READY Vercel deployment is retained as a rollback candidate, but a rollback rehearsal has not been performed.
- `main` is protected and required-check enforcement blocked an attempted merge until the branch was updated and exact-head checks passed. The GitHub connector cannot read detailed branch-protection settings; owner-level confirmation of every rule remains open.
- The V1 surface has no live email/notification, payment, signature, or external distribution provider. Provider-facing actions must continue to fail closed where specified.
- The fictional profile/interview selected for removal was unpublished. Remaining public mock editorial material must not be described as verified journalism without sourcing.
- The 57-page and 153-design inventories distinguish specification and route-module evidence from API, database, provider, end-to-end, and production behavior. See the [current implementation matrix](./MASTER-IMPLEMENTATION-MATRIX-2026-11-01.csv); its exact source snapshot is recorded per row.

Do not create a V1.0 tag or make a certification claim until every mandatory gate is supported by evidence and the independent reviewer has recorded a verdict through the approved process.
