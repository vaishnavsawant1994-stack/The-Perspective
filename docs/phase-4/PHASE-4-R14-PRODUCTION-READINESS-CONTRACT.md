# R14 production-readiness contract

STATUS: **CONTRACT — PRODUCTION IS NOT READY**

## Architecture that actually exists

- Application: Next.js 16 production build (`npm run build`, `npm start`). No hosting provider is selected.
- Database: PostgreSQL 16. Qualification uses GitHub Actions `postgres:16` and, locally, the sandbox server. There is no production database.
- Secrets: environment variables. No production secret store is connected.
- Domain and DNS: none authorized.
- TLS: none, until a host exists. HSTS is therefore conditional.
- CI: GitHub Actions workflows `r3` through `r13`, plus the R14 workflow this authorization allows.
- Persistent uploads: not a V1 operations feature.
- Payments, email, and integration providers: not configured.

## Mandatory before anyone may say production-ready

1. The owner selects a host and database, in writing, and provides credentials out of band.
2. Production sets `PERSPECTIVE_REQUIRE_PRODUCTION_CONFIG=true`, a unique data key, `sessions` mode, an `https` origin, and a runtime role that is `NOSUPERUSER` and `NOBYPASSRLS`.
3. Migrations are applied with `npm run db:migrate:deploy` after a backup.
4. The deployed SHA equals the certified SHA. No certification exists yet, so nothing may be deployed as V1.0.
5. Smoke against that host: home, an article, reader, search, login, `/app` anonymous denial, client entry, member entry, `/api/health/live`, `/api/health/ready`.
6. An alert channel the owner operates has fired at least once on a safe synthetic failure.

Until item 1 happens, production deployment is an external blocker. This contract does not pick a paid vendor.

## Staging

GitHub Actions `postgres:16` plus `npm start` is the qualification environment. It is not staging-as-production and it must not be described as one.
