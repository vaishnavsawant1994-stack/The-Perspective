# R3 authentication migration deployment

Apply with `npm run db:migrate:deploy` after a verified R2 backup.

The migration is forward-only. Any R2 session or recovery-contract rows are explicitly revoked before R3-required columns become non-null; R1/R2 never issued operational sessions or recovery challenges.

After deployment:

1. run the R2 and R3 verification SQL;
2. run `npm run db:migrate:status` and the drift check;
3. configure R3 session mode only after database and server cryptographic settings validate;
4. keep the boundary in `deny-all` mode if any R3 prerequisite is unavailable.

Rollback is a forward recovery migration or restoration to a clean R2 database. Do not drop authentication evidence or attempt destructive down migration in a shared environment.
