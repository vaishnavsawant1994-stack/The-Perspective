# R11 inventory

STATUS: **PLANNING EVIDENCE — NOT A FREEZE**
DATE: 2 October 2026
BASE: `65f43283d50903335fabbc0853e1f6c617774042`

## What already exists

| Area | Evidence | R11 use |
|---|---|---|
| Permission registry | `analytics.distribution.view`, `report.view`, `report.create`, `report.approve`, `renewal.view`, `renewal.edit`, `renewal.manage` are stamped `R11` | Only keys that may be activated |
| Dormant after R10 | those keys, plus `publish.execute`, `magazine.reader.publish`, and `client.*` | Unrelated keys stay dormant |
| Public projection | `production.r9_public_issue`, `r9_public_sitemap`, `r9_public_search` admit only `ISSUE_PUBLISHED` and `ISSUE_ARCHIVED` | SEO and indexing source. Drafts stay out |
| Sitemap route | `src/app/sitemap.ts` already calls that projection | Do not replace it with a hand-maintained list |
| Fixture reader | `/magazine/read/[slug]` still renders designed fixture issues that are not database drafts | Leave the accepted reader alone |
| Robots | `src/app/robots.ts` allows `/` and names `/sitemap.xml` | Private prefixes are not yet disallowed |
| Distribution evidence | `distribution.delivery_evidence` is SITE-only and URL-constrained | Distribution metrics read this table. They do not invent provider engagement |
| Commercial truth | `commercial.contracts` and `commercial.client_accounts` | Renewal and upsell may reference a row. They must not update it |
| Automation vocabulary | `platform.automation_runs` is an R2 outbox primitive. There is no automation permission key | Do not add a key. Rule control binds to `renewal.manage` |
| Idempotency and audit | `platform.idempotency_receipts`, `audit.audit_events` | Same receipt and audit shape as R10 |
| RLS runtime | `perspective_runtime` is `NOSUPERUSER` `NOBYPASSRLS` | New tables follow the R10 grant pattern |

## Capability matrix

| Capability | Foundation | R11 change | Permission | Persistence | API | UI | Worker |
|---|---|---|---|---|---|---|---|
| Public sitemap | R9 projection | Inherited. No second list | None | None new | Existing sitemap | None | None |
| Robots | Allow-all | Disallow `/app/`, `/api/`, `/client/` | None | None | `robots.txt` | None | None |
| Canonical metadata | Reader metadata for published issues | Public meta read for a published slug only | None | None | `GET /api/v1/r11/public/meta/{slug}` | None | None |
| Structured data | Fixture reader script | JSON-LD only on the database-published reader | None | None | HTML | Published reader | None |
| Search index | R9 SQL search | Persisted public index rebuilt from the same published rows | None to read publicly | `growth.search_documents` | `GET /api/v1/r11/public/search` | None | `reindex` |
| Content analytics | None | One observation per published slug and dedupe key. No submitted count | None for the public write | `growth.observations` | `POST /api/v1/r11/public/observations` | None | None |
| Distribution analytics | Delivery evidence | Report counts evidence in a date range | `analytics.distribution.view`, `report.*` | `growth.report_runs` | report commands | Growth desk | None |
| Attribution | Campaigns | Last-touch only, and only for a launched or closed campaign in the issue's organization | None on the public write | `growth.attributions` | Returned by observe | None | None |
| Reporting | Keys exist, dormant | Server-derived CONTENT, DISTRIBUTION, GROWTH snapshots | `report.view`, `report.create`, `report.approve` | `growth.report_runs` | `/api/v1/r11/reports` | Growth desk creates a content report | None |
| Renewal | Contracts | Candidate signal. No contract write | `renewal.edit`, `renewal.view`, `renewal.manage` | `growth.signals` | `/api/v1/r11/signals` | Desk lists | None |
| Upsell | Client accounts | Signal only. No account write | same renewal keys | `growth.signals` | same | Desk lists | None |
| Automation | No key | Typed rule, one action `CREATE_GROWTH_SIGNAL`, worker claim | `renewal.manage`, `renewal.view` | `growth.automation_rules`, `growth.automation_executions` | `/api/v1/r11/rules` | Desk lists | `run` |
| SEO health | None | Count of indexed public documents. Not a score | `analytics.distribution.view` | search documents | `GET /api/v1/r11/analytics` | Desk | reindex |
| Member portal, checkout, entitlements | Fixture screens | Deferred. Not implemented | `client.*` stays dormant | None | None | None | None |

## Prohibited

New permission keys. Browser-supplied aggregates. External engagement. Multi-touch attribution. Commercial mutation from a signal or a rule. Arbitrary automation code. Indexing a draft. R12 portal or subscription work.
