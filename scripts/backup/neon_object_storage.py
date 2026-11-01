#!/usr/bin/env python3
"""Upload, verify, and age out encrypted V1 database backup objects."""

from __future__ import annotations

import argparse
import hashlib
import os
import re
import tempfile
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Iterable

BACKUP_PREFIX = "backups/perspective-v1/daily/"
BACKUP_KEY_PATTERN = re.compile(
    r"^backups/perspective-v1/daily/\d{4}-\d{2}-\d{2}/[A-Za-z0-9._-]+\.dump\.gpg$"
)


def retention_candidates(
    objects: Iterable[dict[str, Any]], cutoff: datetime, prefix: str = BACKUP_PREFIX
) -> list[str]:
    """Select only valid backup keys older than cutoff under the fixed prefix."""
    expired: list[str] = []
    for item in objects:
        key = item.get("Key")
        modified = item.get("LastModified")
        if not isinstance(key, str) or not key.startswith(prefix):
            continue
        if not BACKUP_KEY_PATTERN.fullmatch(key):
            continue
        if not isinstance(modified, datetime):
            continue
        if modified.tzinfo is None:
            modified = modified.replace(tzinfo=timezone.utc)
        if modified.astimezone(timezone.utc) < cutoff.astimezone(timezone.utc):
            expired.append(key)
    return expired


def make_client():
    import boto3
    from botocore.config import Config

    endpoint = os.environ["AWS_ENDPOINT_URL_S3"]
    region = os.environ["AWS_REGION"]
    return boto3.client(
        "s3",
        endpoint_url=endpoint,
        region_name=region,
        config=Config(signature_version="s3v4", s3={"addressing_style": "path"}),
    )


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def upload_and_verify(source: Path, destination: Path, bucket: str, key: str) -> None:
    if not key.startswith(BACKUP_PREFIX) or not BACKUP_KEY_PATTERN.fullmatch(key):
        raise ValueError("Backup object key is outside the allowed backup namespace.")
    client = make_client()
    client.upload_file(
        str(source),
        bucket,
        key,
        ExtraArgs={
            "ContentType": "application/pgp-encrypted",
            "Metadata": {"format": "postgres-custom-dump-gpg-aes256"},
        },
    )
    destination.parent.mkdir(parents=True, exist_ok=True)
    client.download_file(bucket, key, str(destination))
    if sha256(source) != sha256(destination):
        raise RuntimeError("Downloaded backup ciphertext does not match the uploaded file.")
    print(f"Verified encrypted remote object: s3://{bucket}/{key}")


def expire_old_backups(bucket: str, retention_days: int) -> int:
    if not 1 <= retention_days <= 30:
        raise ValueError("Retention must be between 1 and 30 days.")
    client = make_client()
    cutoff = datetime.now(timezone.utc) - timedelta(days=retention_days)
    paginator = client.get_paginator("list_objects_v2")
    deleted = 0
    for page in paginator.paginate(Bucket=bucket, Prefix=BACKUP_PREFIX):
        keys = retention_candidates(page.get("Contents", []), cutoff)
        for key in keys:
            client.delete_object(Bucket=bucket, Key=key)
            deleted += 1
    print(f"Expired {deleted} backup object(s) older than {retention_days} days.")
    return deleted


def main() -> None:
    parser = argparse.ArgumentParser()
    commands = parser.add_subparsers(dest="command", required=True)

    upload = commands.add_parser("upload-verify")
    upload.add_argument("--source", type=Path, required=True)
    upload.add_argument("--download", type=Path, required=True)
    upload.add_argument("--bucket", required=True)
    upload.add_argument("--key", required=True)

    expire = commands.add_parser("expire")
    expire.add_argument("--bucket", required=True)
    expire.add_argument("--retention-days", type=int, default=30)

    args = parser.parse_args()
    if args.command == "upload-verify":
        upload_and_verify(args.source, args.download, args.bucket, args.key)
    else:
        expire_old_backups(args.bucket, args.retention_days)


if __name__ == "__main__":
    main()
