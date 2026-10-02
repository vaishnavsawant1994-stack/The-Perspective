# P4-R11-G0 — Growth, SEO, Analytics & Automation Freeze

STATUS: **DRAFT FOR OWNER FREEZE — IMPLEMENTATION NOT AUTHORIZED**
PHASE: R11
NAME: Growth, SEO, Analytics & Automation
BASE: `main` `65f43283d50903335fabbc0853e1f6c617774042`
R10 RECORD: `docs/phase-4/PHASE-4-R10-COMPLETION-RECORD.md`
PLANNING AUTHORIZATION: `docs/phase-4/PHASE-4-R11-G0-PLANNING-UNLOCK.md`
IMPLEMENTATION: **NOT AUTHORIZED BY THIS FILE ALONE**
R12–R14: **STILL LOCKED**
NO DESIGN 154
NO PAGE 58+

This file is the controlling R11 contract. Companions in the same commit are part of the freeze:

- `PHASE-4-R11-INVENTORY.md`
- `PHASE-4-R11-DOMAIN-AND-WORKFLOW.md`
- `PHASE-4-R11-API-OPERATION-MATRIX.md`
- `PHASE-4-R11-DATABASE-CONTRACT.md`
- `PHASE-4-R11-SECURITY-AND-QUALIFICATION.md`

If a companion disagrees with this file, this file wins.

## Authority

| Source | Ceiling |
|---|---|
| Master bible, R11 | Production search and indexing, SEO and sitemaps, public and business analytics, verified metrics and reporting, automation rules and workers, renewal and upsell, growth and distribution analytics |
| Registry | Activate only the seven keys already stamped `R11`. Do not add a key |
| R10 record | Distribution evidence is SITE verification, not external engagement |
| R9 projection | Published and archived issues are the only public SEO and index input |
| This freeze | Stricter boundary wins |

## Objective

R11 measures and operates growth on records R9 and R10 already made canonical. It does not publish, does not launch a campaign, and does not change a contract, invoice, payment, proposal, or client account.

## In scope

- robots rules that do not advertise `/app/`, `/api/`, or `/client/`
- public metadata and JSON-LD for a database-published issue only
- a public search index rebuilt from that same published projection
- one public observation per slug and dedupe key, with no submitted count
- last-touch attribution only when the campaign belongs to the issue's organization and is `CAMPAIGN_LAUNCHED` or `CAMPAIGN_CLOSED`
- three report families, `CONTENT`, `DISTRIBUTION`, and `GROWTH`, whose snapshots are computed in SQL
- report approval by a different membership, with the expected row version
- renewal and upsell signals that reference an existing contract or client account and do not update it
- automation rules whose only action is `CREATE_GROWTH_SIGNAL`
- a worker that reindexes and claims one rule execution
- one team growth desk that can request a content report and list rows

## Out of scope

R12 client portal, member dashboard, subscriptions, checkout, entitlements, and member library. `client.*`, `publish.execute`, and `magazine.reader.publish`. New permission keys. External provider metrics. Multi-touch attribution. Arbitrary code in a rule. A change to an accepted migration. Design 154.

## Permission freeze

| Key | Commands |
|---|---|
| `analytics.distribution.view` | Read analytics and SEO health |
| `report.view` | Read report runs |
| `report.create` | Create one server-derived report |
| `report.approve` | Approve one report. Audit, exact version, and separation of duties |
| `renewal.view` | Read signals and rules |
| `renewal.edit` | Open a renewal or upsell signal |
| `renewal.manage` | Review or act a signal. Create, enable, or disable a rule. Audit on manage |

## Provenance

| Metric | Source | Trust |
|---|---|---|
| Content observations | Public observe of a published slug | `INTERNAL_OBSERVATION` |
| Deliveries | `distribution.delivery_evidence` | `INTERNAL_EVIDENCE` |
| Signals | Server-created rows | `DERIVED` |
| Indexed documents | Rebuild of the published projection | `CANONICAL_PUBLIC` |

A browser field named `views`, `count`, or `conversionRate` is invalid. Aggregates are counts of stored rows.

## Attribution

Last touch only. One attribution row per observation. An unknown, foreign, draft, or external campaign is ignored. The observation still records. Ignoring a campaign is not delivery success.

## Automation

Triggers: `DISTRIBUTION_RECORDED` with field `delivery_count`, or `SIGNAL_OPEN` with field `open_signal_count`. Operators: `GT`, `EQ`. Action: `CREATE_GROWTH_SIGNAL` only. Execution identity is rule plus trigger key. A disabled rule does not run. Authorization denial is not retried.

## Gate

Implementation starts only after an acceptance record names this freeze and a separate implementation authorization names that acceptance.
