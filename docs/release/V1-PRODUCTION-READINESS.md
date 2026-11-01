# V1 production readiness

**STATUS: PRODUCTION DEPLOYED — V1.0 NOT CERTIFIED**

**Current source:** `main@060e0bcdf10293c50edd3acc5ccd51dbd0834e77`

**Current Vercel deployment:** `dpl_GAMoYFogdsYr7ZDeHvXSzGZMJd95` (`READY`, production, Node.js 24, `fra1`)

The [1 November current-state reconciliation](./CURRENT-STATE-RECONCILIATION-2026-11-01.md) records exact deployment checks, backup/restore evidence, and remaining R14 gates. The [31 October reconciliation](./CURRENT-STATE-RECONCILIATION-2026-10-31.md) preserves its earlier historical source snapshot.

| Gate | Current state |
| --- | --- |
| Production host | Vercel production serves current `main`; sampled routes and liveness/readiness return HTTP 200 |
| Runtime parity | Main qualification workflows and production use Node.js 24 |
| Authenticated UI controls | PR #30 merged after all 24 exact-head checks passed, including the Chromium UI audit |
| Production authentication and tenant isolation | Not qualified with a legitimate production owner identity |
| First-owner setup | Draft PR #49; all code changes remain unreleased pending a separate independent security review |
| Backup | Daily encrypted dumps with 30-day retention; isolated restore of 146 application tables passed; destination shares the Neon account/provider |
| Neon PITR and snapshots | Six-hour PITR; automatic Neon snapshot scheduling unavailable on the selected Free plan; no paid upgrade made |
| Human alert | No synthetic alert delivery with human acknowledgement demonstrated |
| Rollback | Previous READY deployment retained; rollback rehearsal not recorded |
| Branch controls | Protected `main` and required-check enforcement observed; owner-level detail read-back remains open |
| External providers | Email, payments, signatures, and external distribution are not connected in the V1 surface |
| Independent security review | Not performed; mandatory under the R14 contract |
| V1.0 release tag | Prohibited until every mandatory gate closes and the independent review is recorded |

R14 technical qualification, deployment, and passing smoke checks do not equal V1.0 certification. Do not create a V1.0 tag or claim certification while any mandatory gate remains open.
