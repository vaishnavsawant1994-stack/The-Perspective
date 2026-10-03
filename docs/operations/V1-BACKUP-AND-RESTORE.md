# V1 backup and restore

STATUS: **QUALIFICATION PROCEDURE ONLY — NO PRODUCTION BACKUP**

There is no production database. Nothing here claims a production backup schedule, retention period, or encrypted off-site copy.

## Qualification

`node scripts/certification/backup-restore.mjs` dumps the database in `DATABASE_URL` with `pg_dump --format=custom --no-owner --no-acl`, SHA-256s the file, restores it into `perspective_r14_restore` (override with `R14_RESTORE_DATABASE`), and compares successful `public._prisma_migrations` rows.

The dump path defaults to `/tmp/r14-qualification.dump`. Do not upload it to a public artifact. The script prints the checksum and elapsed time, not the connection string.

`R14_PG_BIN` may point at a directory that contains `pg_dump` and `pg_restore` when they are not on `PATH`.

## Production, when a host exists

Take this same custom-format dump before `npm run db:migrate:deploy`. Store it in the host's private backup location. Restore by creating an empty database and running `pg_restore --no-owner --exit-on-error`. Point the application at the restored database only after the migration count matches the dump and `/api/health/ready` returns ready.

No RPO or RTO is defined by the product contract. The script's elapsed time is a measurement, not a commitment.
