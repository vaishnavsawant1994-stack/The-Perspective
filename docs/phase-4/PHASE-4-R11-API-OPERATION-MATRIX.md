# R11 API operation matrix

Contract: `PHASE-4-R11-G0-FREEZE.md`

| Method | Path | Permission | Command |
|---|---|---|---|
| GET | `/api/v1/r11/analytics` | `analytics.distribution.view` | list observations, deliveries, and index counts |
| GET | `/api/v1/r11/reports` | `report.view` | list |
| POST | `/api/v1/r11/reports` | `report.create` | `create-report` |
| POST | `/api/v1/r11/reports/{id}/approve` | `report.approve` | `approve-report` |
| GET | `/api/v1/r11/signals` | `renewal.view` | list |
| POST | `/api/v1/r11/signals/renewals` | `renewal.edit` | `open-renewal` |
| POST | `/api/v1/r11/signals/upsells` | `renewal.edit` | `open-upsell` |
| POST | `/api/v1/r11/signals/{id}/review` | `renewal.manage` | `review-signal` |
| POST | `/api/v1/r11/signals/{id}/act` | `renewal.manage` | `act-signal` |
| GET | `/api/v1/r11/rules` | `renewal.view` | list |
| POST | `/api/v1/r11/rules` | `renewal.manage` | `create-rule` |
| POST | `/api/v1/r11/rules/{id}/state` | `renewal.manage` | `set-rule` |
| POST | `/api/v1/r11/public/observations` | none, same origin | `growth.r11_public_observe` |
| GET | `/api/v1/r11/public/meta/{slug}` | none | `growth.r11_public_meta` |
| GET | `/api/v1/r11/public/search?q=` | none | `growth.r11_public_search` |
| POST | `/api/v1/internal/r11/worker/reindex` | worker token | `growth.r11_reindex` |
| POST | `/api/v1/internal/r11/worker/run` | worker token | `growth.r11_run` |

Mutations except the public observation require a team session, same origin, and `Idempotency-Key`. Unknown paths are invalid. The worker token is `PERSPECTIVE_R11_WORKER_TOKEN` and is not a browser session.

The growth desk is `/app/growth/desk`. Opening it grants nothing. It can request a `CONTENT` report for the last seven days and list reports.
