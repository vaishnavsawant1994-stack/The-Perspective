# R2 foundation migration deployment note

- Owner: Platform Engineering
- Direction: forward-only
- Expected lock profile: schema creation and new-table DDL only; no existing business table rewrite
- Data backfill: none
- Required extension: `citext`
- Apply: `npm run db:migrate:deploy`
- Verify: `npm run db:verify`
- Rollback during R2 validation: discard the isolated validation database and recreate it
- Production rollback after later stages: roll back application code and use a reviewed roll-forward schema correction; destructive down migrations are not assumed safe

This migration creates only the R2 `iam`, `platform`, and `audit` foundation. It does not enable authentication, tenant resolution, RBAC evaluation, provider processing, or business workflows.
