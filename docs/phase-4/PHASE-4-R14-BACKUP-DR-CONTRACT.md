# R14 backup and disaster-recovery contract

STATUS: **CONTRACT**

## Qualification backup (required, executable)

`scripts/certification/backup-restore.mjs` must:

1. `pg_dump --format=custom --no-owner --no-acl` the qualification database.
2. SHA-256 the dump file.
3. Restore into an empty database whose name matches `^[a-z0-9_]+$`.
4. Compare `prisma._prisma_migrations` success counts.
5. Print elapsed milliseconds, checksum, and counts. It must not print the dump or a connection string.

A dump that is not restored does not count. The dump stays on the runner or in `/tmp`. It is not uploaded as a public artifact.

## Production backup

There is no production database, so there is no production backup. Frequency, retention, and encryption for production are not invented here. They are chosen with the host. The handbook must say that plainly.

## Restore and rollback

- Qualification restore is the procedure above.
- Application rollback is redeploying a previously built SHA. It is not a git revert of a migration that already ran.
- Schema changes from R2 through R13 are not trivially reversible. Restoring an earlier application onto a newer schema is unsupported unless that pair has been tested. The supported recovery for a bad migration is restore the qualification-proven dump into a replacement database, then start the application SHA that matches that dump.
- There is no repository RPO or RTO. The script records measured qualification restore time. That number is not a customer commitment.

## Disasters the runbook may cover

Application process down, qualification or future production database unreachable, failed migration, leaked credential, provider outage, suspected cross-tenant access. Each procedure must match the tools that exist: process restart, dump/restore, env rotation, and the inherited fail-closed provider behavior.
