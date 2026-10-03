# V1 observability

STATUS: **HEALTH ROUTES ONLY — NO ALERT VENDOR**

| Signal | What exists |
|---|---|
| Liveness | `GET /api/health/live` returns `{"status":"live"}`. No database and no configuration. |
| Readiness | `GET /api/health/ready` runs `SELECT 1`. Failure is HTTP 503 `{"status":"not-ready"}` with no SQL or secret. |
| Application logs | Must not contain passwords, session cookies, data keys, worker tokens, or provider payloads. |
| Database health | Readiness is the only check. |
| Job failure | Worker routes already fail closed. There is no job dashboard. |
| Provider failure | Product responses use `PROVIDER_UNAVAILABLE`. |
| Authentication anomalies | Existing audit events. No new detector. |
| Alerts | None. No vendor is configured, and none has been tested. |

A workflow curl of these routes is a qualification check. It is not an alert, and it does not prove a human would be paged.
