# R10 security and qualification

STATUS: **PART OF THE R10 G0 FREEZE — NOT AN IMPLEMENTATION**

## Hostile cases that must become tests

| Case | Required result |
|---|---|
| Anonymous, invalid, or expired session | 401 |
| Client surface or missing permission | 401 or 403, no write |
| Dormant `analytics.distribution.view` or `publish.execute` cannot launch | 403 |
| Cross-origin mutation | 403 |
| Foreign or unknown id | 404 |
| Malformed id | 400 |
| `actor`, `organizationId`, `state`, `url`, `delivered`, `trusted`, `digest` in the body | 400 |
| Wrong lifecycle, including prepare from draft and launch of a draft issue | 409 `INELIGIBLE` |
| Stale `expectedRowVersion` | 409 `STALE_WRITE` |
| Same key and same payload | 200 replay, one row |
| Same key and changed payload | 409 `IDEMPOTENCY_CONFLICT` |
| Two launch sessions | one evidence set |
| External target | `PROVIDER_UNCONFIGURED`, no evidence |
| Worker without the token, or with the wrong token | 403, no evidence |
| Missing tenant context | no desk rows |
| Runtime `INSERT` | permission denied |
| Public slug that was never delivered | 404, no secret title |
| Superuser is not the role under test | `perspective_runtime` is `NOSUPERUSER` `NOBYPASSRLS` |

## Qualification bar

GitHub Actions on `ubuntu-latest` with the `postgres:16` service image is the hosted qualification environment. It is not a production deployment. The R10 workflow runs migrations, drift, unit tests, the live PostgreSQL suite, lint, typecheck, the production build, the production dependency audit, and a Chromium pass over the four desks plus the public delivery route.

Inherited R3 through R9 workflows must pass on the same candidate. A production vulnerability at or above the existing high threshold blocks acceptance. Development-only Dependabot alerts stay visible and are not relabeled as product success.
