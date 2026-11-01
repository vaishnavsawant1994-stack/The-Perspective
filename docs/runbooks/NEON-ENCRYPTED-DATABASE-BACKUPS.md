# Neon encrypted database backups

The production database backup is stored in the private `daily-encrypted-database-backups` bucket in the separate `the-perspective-backups` Neon Free project. The bucket and production database are in `aws-eu-central-1`. This is a second project in the same Neon account and provider; it does not protect against loss of that account or provider.

The scheduled GitHub Actions workflow runs daily at 02:17 UTC. It uses the dedicated `perspective_backup_reader` PostgreSQL role. Production currently has 115 tables with row-level security enabled across 11 application schemas; all 115 use `FORCE ROW LEVEL SECURITY`. A complete database dump must include rows from every tenant, so this role has PostgreSQL's `BYPASSRLS` attribute. This permits it to read all rows protected by those policies. It is not a superuser, cannot create roles or database objects, owns no application tables, and has no table or sequence write privileges. The backup script checks these role properties before every dump and stops if they drift.

Treat this credential as a full-database read credential. Keep it only in GitHub Actions secrets and do not expose it to pull-request workflows. The dump is encrypted before upload, but the ephemeral GitHub runner handles the plaintext while creating and validating the restore. Rotate or revoke the credential immediately if a runner or repository-secret exposure is suspected.

The role has SELECT access to the existing application tables and default read grants for future tables and sequences created by the `perspective` owner. The workflow creates a custom-format `pg_dump`, encrypts it with GnuPG AES-256, uploads it over the private Neon S3-compatible endpoint, downloads and checks the uploaded bytes, decrypts them, and restores them into a disposable PostgreSQL 16 service. It then deletes only well-formed backup objects older than 30 days under `backups/perspective-v1/daily/`.

## Required repository secrets

The workflow requires these GitHub Actions repository secrets:

- `PERSPECTIVE_BACKUP_DATABASE_URL`: direct (non-pooler) URL for the read-only `perspective_backup_reader` role.
- `PERSPECTIVE_BACKUP_PASSPHRASE`: random encryption passphrase. Keep a recovery copy outside GitHub and Neon.
- `NEON_BACKUP_ACCESS_KEY_ID`: Neon credential token ID scoped to `storage:read` and `storage:write` on the backup bucket branch.
- `NEON_BACKUP_SECRET_ACCESS_KEY`: the matching S3 secret access key.

The bucket name, S3 endpoint, and region are public routing metadata in the workflow. They are not credentials.

On the owner’s Windows account, a DPAPI-protected recovery copy of the passphrase is stored at `%LOCALAPPDATA%\ThePerspective\Secrets\backup-recovery-key.dpapi`. To recover it on that same Windows account and save it in an external password manager:

```powershell
$secure = ConvertTo-SecureString (Get-Content -Raw "$env:LOCALAPPDATA\ThePerspective\Secrets\backup-recovery-key.dpapi")
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
```

## Restore procedure

1. Select a successful run in **Actions → Neon encrypted database backup** and read the object key from its log.
2. Download the object with an S3 client configured with the endpoint, region, and backup storage credentials above.
3. Decrypt with the externally held `PERSPECTIVE_BACKUP_PASSPHRASE` using GnuPG AES-256.
4. Restore the custom-format dump with `pg_restore --no-owner --no-acl` into an isolated PostgreSQL 16 database.
5. Validate application table counts, migrations, and critical read-only journeys before planning any production restore.

Never restore directly over production during a drill. A production restore requires a separate reviewed recovery plan and explicit incident authorization.
