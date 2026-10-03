# R13 reliability contract

STATUS: **G0 — NOT R14 CERTIFICATION**
DATE: 3 October 2026

R13 reliability is the failure behavior of the two commands. It is not uptime, backup, or a production deploy.

| Behavior | Contract |
|---|---|
| Provider missing | verify writes `PROVIDER_UNAVAILABLE` and does not change the declaration |
| Duplicate command | same idempotency key and payload replays; a changed payload conflicts |
| Concurrent declare | one row per organization and type |
| Concurrent settings write | `expectedVersion` plus a row lock; the loser is `STALE_WRITE` |
| Transaction failure | no partial settings row, declaration, attempt, receipt, or audit event |
| Retry loop | none. No worker requeues verify |
| Health metric | none. No invented SLA |

No R13 worker token exists. Browser sessions cannot call a worker route that does not exist.
