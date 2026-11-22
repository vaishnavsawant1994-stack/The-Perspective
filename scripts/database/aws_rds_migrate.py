#!/usr/bin/env python3
"""Guarded Neon -> AWS RDS PostgreSQL copy utility; NO production cutover.

Requires a runner that can access BOTH databases, PostgreSQL CLI tools,
and SOURCE_DATABASE_URL / TARGET_DATABASE_URL injected from a secret store.
No secrets are written to source or logged. Source is never modified.
"""
import argparse
import hashlib
import json
import os
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qs, unquote, urlsplit


class MigrationError(RuntimeError):
    pass


def connection(url):
    p = urlsplit(url)
    if p.scheme not in ("postgresql", "postgres") or not p.hostname or not p.path.strip("/"):
        raise MigrationError("Valid PostgreSQL connection URL required")
    db = unquote(p.path.lstrip("/"))
    if not db or "/" in db:
        raise MigrationError("URL must contain exactly one database name")
    qs = parse_qs(p.query)
    mode = qs.get("sslmode", ["verify-full"])[0]
    if mode != "verify-full":
        raise MigrationError("TLS with full server identity verification (sslmode=verify-full) is required")
    if not p.username or not p.password:
        raise MigrationError("Database credentials must come from a secret-store URL")
    env = {
        "PGHOST": p.hostname, "PGPORT": str(p.port or 5432),
        "PGDATABASE": db, "PGUSER": unquote(p.username),
        "PGPASSWORD": unquote(p.password), "PGSSLMODE": mode,
        "PGCONNECT_TIMEOUT": "12",
    }
    for option, var in (("sslrootcert", "PGSSLROOTCERT"), ("channel_binding", "PGCHANNELBINDING")):
        if qs.get(option):
            env[var] = qs[option][0]
    return env


def run(args, database, capture=False):
    env = os.environ.copy()
    for key in ("PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD",
                "PGSSLMODE", "PGSSLROOTCERT", "PGCHANNELBINDING", "PGSERVICE"):
        env.pop(key, None)
    env.update(database)
    result = subprocess.run(args, env=env, capture_output=True, text=True, check=False)
    if result.returncode:
        # Never echo server error text: it can disclose connection details.
        raise MigrationError(f"{args[0]} failed with exit code {result.returncode}")
    return result.stdout.strip() if capture else ""


def sql(database, statement):
    return run(["psql", "-X", "-A", "-t", "-v", "ON_ERROR_STOP=1", "-c", statement],
               database, capture=True)


def quoted(name):
    return '"' + name.replace('"', '""') + '"'


def tables(database):
    rows = sql(database, "SELECT table_schema || chr(9) || table_name FROM information_schema.tables "
                         "WHERE table_type='BASE TABLE' AND table_schema NOT IN "
                         "('pg_catalog','information_schema') ORDER BY 1")
    return [tuple(line.split("\t", 1)) for line in rows.splitlines()] if rows else []


def counts(database):
    items = tables(database)
    if not items:
        return {}
    statements = []
    for schema, table in items:
        name = (schema + "." + table).replace("'", "''")
        statements.append(
            f"SELECT '{name}' AS name, count(*)::bigint AS rows FROM {quoted(schema)}.{quoted(table)}"
        )
    data = sql(database, "SELECT name || chr(9) || rows::text FROM ("
               + " UNION ALL ".join(statements) + ") AS c ORDER BY name")
    return {name: int(value) for name, value in
            (line.rsplit("\t", 1) for line in data.splitlines())}


def identity(database):
    data = sql(database, "SELECT current_database() || chr(9) || current_setting('server_version_num')")
    db, version = data.split("\t", 1)
    return {"database": db, "server_version_num": version, "host": database["PGHOST"]}


def checksum(file):
    h = hashlib.sha256()
    with file.open("rb") as stream:
        for buf in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(buf)
    return h.hexdigest()


def preflight(source, target):
    if all(source[k] == target[k] for k in ("PGHOST", "PGPORT", "PGDATABASE")):
        raise MigrationError("Source and target databases cannot be identical")
    src, dst = identity(source), identity(target)
    if not tables(source):
        raise MigrationError("Source has no tables")
    if tables(target):
        raise MigrationError("Target is not empty; refusing to overwrite data")
    return src, dst


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--mode", choices=("preflight", "copy", "verify"), default="preflight")
    p.add_argument("--output-dir", default="aws-rds-migration-private")
    p.add_argument("--apply", action="store_true")
    p.add_argument("--confirm-target-db")
    args = p.parse_args()
    for name in ("psql", "pg_dump", "pg_restore"):
        if not shutil.which(name):
            raise MigrationError(f"Missing utility: {name}")

    source = connection(os.getenv("SOURCE_DATABASE_URL", ""))
    target = connection(os.getenv("TARGET_DATABASE_URL", ""))
    directory = Path(args.output_dir).resolve()
    dump = directory / "perspective.dump"
    manifest = directory / "manifest.json"

    if args.mode == "preflight":
        src, dst = preflight(source, target)
        print(json.dumps({"preflight": "PASS", "source": src, "target": dst,
                          "source_tables": len(tables(source))}, indent=2))
        return

    if args.mode == "copy":
        if not args.apply or args.confirm_target_db != target["PGDATABASE"]:
            raise MigrationError("Must use --apply and --confirm-target-db <exact target DB>")
        src, dst = preflight(source, target)
        directory.mkdir(parents=True, exist_ok=True, mode=0o700)
        if dump.exists() or manifest.exists():
            raise MigrationError("Previous output exists; choose a new private directory")
        run(["pg_dump", "--format=custom", "--no-owner", "--no-acl", "--no-tablespaces",
             "--file", str(dump)], source)
        os.chmod(dump, 0o600)
        record = {
            "created_utc": datetime.now(timezone.utc).isoformat(),
            "source": src, "target": dst, "dump_sha256": checksum(dump),
            "source_table_counts": counts(source),
        }
        manifest.write_text(json.dumps(record, indent=2, sort_keys=True), encoding="utf-8")
        os.chmod(manifest, 0o600)
        run(["pg_restore", "--exit-on-error", "--single-transaction", "--no-owner",
             "--no-privileges", "--no-tablespaces", "--dbname", target["PGDATABASE"],
             str(dump)], target)

    if not dump.is_file() or not manifest.is_file():
        raise MigrationError("Missing backup dump or manifest")
    record = json.loads(manifest.read_text(encoding="utf-8"))
    if checksum(dump) != record["dump_sha256"]:
        raise MigrationError("Dump SHA-256 mismatch")
    if identity(target) != record["target"]:
        raise MigrationError("Wrong target DB; manifest identity mismatch")
    actual = counts(target)
    expected = record["source_table_counts"]
    mismatches = {name: [n, actual.get(name)] for name, n in expected.items()
                  if actual.get(name) != n}
    extra = sorted(set(actual) - set(expected))
    if mismatches or extra:
        print(json.dumps({"count_mismatches": mismatches, "extra_tables": extra}, indent=2))
        raise MigrationError("Table row-count verification failed")
    print(json.dumps({"verify": "PASS", "tables": len(actual),
                      "target_db": target["PGDATABASE"], "dump_sha256": record["dump_sha256"]},
                     indent=2))


if __name__ == "__main__":
    try:
        main()
    except (MigrationError, OSError, ValueError, KeyError) as exc:
        print(f"Migration blocked: {exc}", file=sys.stderr)
        sys.exit(1)
