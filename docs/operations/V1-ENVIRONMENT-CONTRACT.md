# V1 environment contract

STATUS: **NOT A PRODUCTION CONFIGURATION**

No secret values belong in this file. Qualification workflows already commit a non-production data key of 32 zero-ish bytes and the database password `perspective`. Those are not production credentials.

| Name | Required | Secret | Purpose |
|---|---|---|---|
| DATABASE_URL | yes for the app and readiness | yes | PostgreSQL connection for the runtime role |
| PERSPECTIVE_AUTH_BOUNDARY_MODE | yes | no | `sessions` in any real deployment. Missing or invalid stays deny-all for protected routes. |
| PERSPECTIVE_PUBLIC_APP_ORIGIN | yes | no | Exact origin. No wildcard. |
| PERSPECTIVE_AUTH_DATA_KEY | yes | yes | 32-byte key, base64. |
| PERSPECTIVE_AUTH_KEY_VERSION | yes | no | Integer version of the data key. |
| PERSPECTIVE_REQUIRE_PRODUCTION_CONFIG | production | no | When `true`, the process refuses an incomplete configuration. Qualification leaves it unset. |
| PERSPECTIVE_ALLOW_INSECURE_ORIGIN | qualification only | no | Allows `http://` only when production enforcement is on and the host is not TLS. |
| PERSPECTIVE_R9_WORKER_TOKEN | when that worker is called | yes | R9 worker. |
| PERSPECTIVE_R10_WORKER_TOKEN | when that worker is called | yes | R10 worker. |
| PERSPECTIVE_R11_WORKER_TOKEN | when that worker is called | yes | R11 worker. |
| PERSPECTIVE_R12_WORKER_TOKEN | when that worker is called | yes | R12 worker. |
| PERSPECTIVE_ALLOW_DEMO_SEED | never in production | no | Refuses to run unless explicitly true. |
| PERSPECTIVE_ALLOW_AUTH_FIXTURE | never in production | no | Browser fixtures only. |

Development, CI, and a future production environment must use different data keys and database passwords. Production values live in the host secret store, which is not selected.
