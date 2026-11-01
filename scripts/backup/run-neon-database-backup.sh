#!/usr/bin/env bash
set -Eeuo pipefail

: "${PERSPECTIVE_BACKUP_DATABASE_URL:?Missing read-only production database URL}"
: "${PERSPECTIVE_BACKUP_PASSPHRASE:?Missing backup encryption passphrase}"
: "${NEON_BACKUP_ACCESS_KEY_ID:?Missing Neon Storage access key}"
: "${NEON_BACKUP_SECRET_ACCESS_KEY:?Missing Neon Storage secret key}"
: "${NEON_BACKUP_BUCKET:?Missing Neon Storage bucket}"
: "${AWS_ENDPOINT_URL_S3:?Missing Neon Storage endpoint}"
: "${AWS_REGION:?Missing Neon Storage region}"
: "${RESTORE_ADMIN_URL:?Missing isolated restore test database URL}"

export AWS_ACCESS_KEY_ID="$NEON_BACKUP_ACCESS_KEY_ID"
export AWS_SECRET_ACCESS_KEY="$NEON_BACKUP_SECRET_ACCESS_KEY"
export AWS_DEFAULT_REGION="$AWS_REGION"

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

plain_dump="$tmpdir/perspective.dump"
encrypted_dump="$tmpdir/perspective.dump.gpg"
remote_dump="$tmpdir/perspective.remote.dump.gpg"
restored_dump="$tmpdir/perspective.restored.dump"

pg_dump \
  --format=custom \
  --no-owner \
  --no-acl \
  --lock-wait-timeout=30s \
  --file="$plain_dump" \
  "$PERSPECTIVE_BACKUP_DATABASE_URL"
pg_restore --list "$plain_dump" > "$tmpdir/archive.list"
grep -q 'TABLE DATA' "$tmpdir/archive.list"

printf '%s' "$PERSPECTIVE_BACKUP_PASSPHRASE" | gpg \
  --batch --yes --pinentry-mode loopback --passphrase-fd 0 \
  --symmetric --cipher-algo AES256 --s2k-digest-algo SHA512 \
  --output "$encrypted_dump" "$plain_dump"

today="$(date -u +%F)"
run_id="${GITHUB_RUN_ID:-local}-$(date -u +%H%M%S)"
object_key="backups/perspective-v1/daily/${today}/${GITHUB_SHA:-manual}-${run_id}.dump.gpg"

python scripts/backup/neon_object_storage.py upload-verify \
  --source "$encrypted_dump" \
  --download "$remote_dump" \
  --bucket "$NEON_BACKUP_BUCKET" \
  --key "$object_key"

printf '%s' "$PERSPECTIVE_BACKUP_PASSPHRASE" | gpg \
  --batch --yes --pinentry-mode loopback --passphrase-fd 0 \
  --decrypt --output "$restored_dump" "$remote_dump"
cmp --silent "$plain_dump" "$restored_dump"

restore_db="perspective_restore_verify"
createdb --maintenance-db="$RESTORE_ADMIN_URL" "$restore_db"
restore_url="${RESTORE_ADMIN_URL%/postgres}/${restore_db}"
pg_restore --no-owner --no-acl --dbname="$restore_url" "$restored_dump"
table_count="$(psql "$restore_url" --no-psqlrc --tuples-only --no-align --set=ON_ERROR_STOP=1 \
  --command="SELECT count(*) FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog','information_schema') AND table_type = 'BASE TABLE'")"
if [[ "$table_count" -lt 100 ]]; then
  echo "Restored database contains an unexpected number of public tables: $table_count" >&2
  exit 1
fi
echo "Restored and verified $table_count application tables from the uploaded encrypted object."

python scripts/backup/neon_object_storage.py expire \
  --bucket "$NEON_BACKUP_BUCKET" \
  --retention-days 30
