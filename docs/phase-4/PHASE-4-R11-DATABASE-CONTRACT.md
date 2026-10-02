# R11 database contract

Contract: `PHASE-4-R11-G0-FREEZE.md`

Migration: `prisma/migrations/20261002220000_r11_growth_seo_analytics/migration.sql`

It does not edit an accepted migration. Schema `growth`.

| Table | Purpose |
|---|---|
| `growth.observations` | One row per organization, subject, and dedupe key |
| `growth.attributions` | One last-touch row per observation |
| `growth.report_runs` | Server snapshot and approval state |
| `growth.signals` | Renewal, upsell, or growth signal |
| `growth.automation_rules` | Typed rule |
| `growth.automation_executions` | One row per rule and trigger key |
| `growth.search_documents` | Public index |

`growth.r11_execute` is `SECURITY DEFINER` and is the only team mutation path. Runtime receives `SELECT` and `EXECUTE`, not `INSERT`. RLS is enabled and forced. Policies compare `owner_organization_id` to `platform.current_organization_id()`.

Public functions are `growth.r11_public_observe`, `growth.r11_public_meta`, and `growth.r11_public_search`. Worker functions are `growth.r11_reindex` and `growth.r11_run`.

Idempotency scope is `r11.` plus the command. A changed hash returns `IDEMPOTENCY_CONFLICT`. A completed key returns the stored result. A unique violation rolls the function block back and returns `CONFLICT`.
