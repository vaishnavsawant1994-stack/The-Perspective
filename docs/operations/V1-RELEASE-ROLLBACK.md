# V1 release rollback

STATUS: **PROCEDURE — NO RELEASE HAS BEEN MADE**

## Application rollback

Start the previously built SHA. Use it only when the database was not migrated afterward.

## Migration compatibility

Migrations from R2 through R13 are forward-only in this repository. An older application on a newer schema is unsupported unless that pair was tested. It has not been.

## Database restoration threshold

If a migration ran and the new application is unhealthy, restore the dump taken before that migration. Do not drop individual tables by hand.

## Verification

`/api/health/ready` is ready, `public._prisma_migrations` matches the restored dump, and the running SHA is the one that was qualified against that schema.

There is no production release to roll back.
