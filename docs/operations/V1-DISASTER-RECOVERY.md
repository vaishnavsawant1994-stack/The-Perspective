# V1 disaster recovery

STATUS: **PROCEDURE — NO PRODUCTION DRILL**

There is no production host. These steps are the ones an operator can actually perform.

## Application process down

Detection: `/api/health/live` does not answer. Containment: stop the bad process. Recovery: start `npm start` from the last built SHA that matches the current schema. Check: `/api/health/ready` is ready and the public home returns 200.

## Database unreachable

Detection: `/api/health/ready` is HTTP 503 with `{"status":"not-ready"}` and no error detail. Containment: stop deploys. Recovery: restore the last dump using `docs/operations/V1-BACKUP-AND-RESTORE.md`, or repair the database process without granting the application role `BYPASSRLS`. Check: migration count and readiness.

## Wrong SHA deployed

Detection: the running build does not match the intended SHA. Containment: stop it. Recovery: if migrations did not run, start the previous SHA. If they did, restore the pre-migrate dump and start the SHA that matches that dump. Do not point an older application at a newer schema unless that pair was tested.

## Migration failure

Detection: `npm run db:migrate:deploy` exits non-zero. Containment: do not start the new application. Recovery: restore the pre-migrate dump. Prisma will not silently continue a failed migration.

## Credential leak

Detection: a key, worker token, or database URL was exposed. Containment: treat it as compromised. Recovery: rotate it in the secret store, restart the process, and revoke sessions through the existing authentication revocation path. Do not commit the replacement.

## Provider outage

Detection: distribution, checkout, or integration verify returns `PROVIDER_UNAVAILABLE`. Containment: do not mark the row verified, paid, or delivered. Recovery: none inside the product. The provider is not configured.

## Authentication incident

Containment: revoke the affected sessions using the accepted R3 revocation behavior. Do not add a new admin route in an incident.

## Suspected cross-tenant read

Containment: preserve the audit row, disable the suspected credential, and do not turn off RLS to investigate. Recovery: inspect as the migration owner in a copy of the database, not as `perspective_runtime` with bypass. Check: runtime role is still `NOSUPERUSER` and `NOBYPASSRLS`.

## Restore

Follow `docs/operations/V1-BACKUP-AND-RESTORE.md`. The qualification restore is the only restore that this repository has executed.
