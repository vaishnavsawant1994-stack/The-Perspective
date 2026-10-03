# R14 observability contract

STATUS: **CONTRACT**

## What R14 adds

- `GET /api/health/live` returns `{"status":"live"}` with no database call and no configuration echo.
- `GET /api/health/ready` runs `SELECT 1`. Success is `{"status":"ready"}`. Failure is HTTP 503 `{"status":"not-ready"}` with no error text, SQL, or connection string.
- Both are public because a monitor cannot hold a session. They reveal only those two words.

## Logs

New code must not log passwords, session tokens, cookies, data keys, worker tokens, or provider payloads. Existing qualification scripts may print a session token on stdout for the browser harness; that output is a CI secret, not an application log, and it must not be committed.

## What is not claimed

- No metrics vendor.
- No log drain.
- No paging provider.
- No tested alert.

A health URL without a subscriber is not monitoring. The production-readiness contract keeps alerting as a blocker until the owner names the channel. The R14 workflow may curl the health routes and fail the job if they fail. That is a qualification check, not an alert test.
