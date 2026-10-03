# R13 database contract

STATUS: **G0**
DATE: 3 October 2026
MIGRATION: `20261003130000_r13_enterprise_operations`

Schema `ops`. Tables:

- `ops.organization_settings` — one row per owner organization, typed checks, `row_version`
- `ops.integration_declarations` — unique `(owner_organization_id, integration_type)`, states `DECLARED` and `DISABLED` only
- `ops.integration_attempts` — `result` may only be `PROVIDER_UNAVAILABLE`

No secret column. No JSON authority blob. RLS ENABLE and FORCE on all three. `perspective_runtime` remains `NOSUPERUSER` and `NOBYPASSRLS`, with `SELECT` only. Mutations go through `SECURITY DEFINER` functions `ops.r13_read` and `ops.r13_command`, which filter on `platform.current_organization_id()` and the actor membership.

Accepted R1–R12 migrations are not edited. `iam.organizations.settings` is not updated.
