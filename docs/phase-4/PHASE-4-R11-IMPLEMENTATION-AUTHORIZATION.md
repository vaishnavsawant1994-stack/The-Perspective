# R11 implementation authorization

STATUS: **IMPLEMENTATION AUTHORIZED — NOT ACCEPTED, NOT MERGED**
DATE: 2 October 2026
ACCEPTED G0: `58add80657307fdd56464dee2bf71bf5f9b771a4`
FREEZE SHA: `d738a893937ffa12261e48e2375730cd5c5a22b9`
ACCEPTANCE RECORD: `docs/phase-4/PHASE-4-R11-G0-ACCEPTED.md`

The owner's R11 directive authorizes implementation of the accepted freeze. It does not accept the result in advance, it does not merge it, and it does not authorize R12.

## Allowed

The commands, tables, public reads, worker routes, and growth desk in the freeze. Migration `20261002220000_r11_growth_seo_analytics` may be added. It may not edit an accepted migration.

Active keys are only `analytics.distribution.view`, `report.view`, `report.create`, `report.approve`, `renewal.view`, `renewal.edit`, and `renewal.manage`. Activation is an allow-list in the existing evaluator while stage R11 is active. Registry strings are not edited.

## Forbidden

R12 portal, member platform, checkout, subscriptions, and entitlements. New permission keys. `publish.execute`, `magazine.reader.publish`, and every `client.*` key. A browser-supplied aggregate. External delivery or engagement. A commercial, invoice, or payment mutation. An automation action other than `CREATE_GROWTH_SIGNAL`.

## Required proof before acceptance

PostgreSQL RLS under `perspective_runtime`, observation dedupe, last-touch attribution, report separation of duties, renewal without a contract write, automation replay, hostile HTTP, Chromium on the growth desk, inherited R3–R10 workflows, lint, typecheck, production build, and the production dependency audit. The hosted environment is GitHub Actions with `postgres:16`. That is not a production deployment.

## Ceiling

R11 ends at server-derived growth evidence and one allowlisted automation action. R12 implementation is not authorized.
