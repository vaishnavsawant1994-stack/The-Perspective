# The Perspective — Amazon RDS PostgreSQL migration

**State: PREPARED, NOT EXECUTED. Production is still on Neon until a verified cutover.**

This work is strictly for moving the existing PostgreSQL backend; it does not authorize a switch from Hostinger hosting to a new hosting provider.

## Verified on 21 November 2026

- Source project: Neon the-perspective-production; production database: perspective; PostgreSQL 16.16.
- A read-only production catalog query found **82 base tables across the six application schemas** and **24 completed Prisma migrations**. The restore must include all additional public/system metadata and dependencies, not only those 82.
- Existing AWS DB: perspective-staging in us-east-1, PostgreSQL 17.11, available, private, encrypted, single-AZ, default SG with no inbound 5432, 1-day backup retention and deletion protection OFF. SQL contents, application connectivity, permissions and actual restore status are NOT VERIFIED.
- AWS Frankfurt (eu-central-1): no existing RDS DB.
- Hostinger staging had historical /api/health/ready failures and its actual environment/connection path is UNVERIFIED. The production Vercel deployment also appears in older records. Verify where requests are really served before changing deployment variables.
- Current backup: .github/workflows/neon-database-backup.yml performs encrypted off-site-like dumps and isolated restore checks. **Do not remove or disable it before the AWS backup replacement has been tested.**
- AWS connector was found authenticated using the **root** principal. Use least-privilege IAM roles for production operations and CI instead.

## 1. Production AWS architecture decision (required before creating resources)

**Preferred:** Private RDS PostgreSQL in the same AWS region/VPC as the serving application. For European hosting, Frankfurt is a better default than the existing Virginia staging instance; check application latency, cost, compliance and actual hosting region. Use dedicated production instance/database, not the existing staging DB.

If The Perspective continues on Hostinger, **prove private application-to-VPC connectivity first**. A private RDS endpoint cannot be reached directly from shared hosting or ordinary Internet-hosted GitHub Actions runners. A Hostinger VPS may support a managed VPN to AWS; verify routing, reliability, fixed egress and permissions. Alternately, hosting the application on AWS compute within the same VPC can keep RDS private, but is a separate hosting decision. Never open PostgreSQL port 5432 to 0.0.0.0/0. An Internet-facing RDS instance with a narrowly restricted fixed-IP allowlist and verified TLS should be a last resort, not an automatic fallback.

Recommended production RDS requirements: encrypted storage, private subnets and tightly scoped security groups, dedicated least-privilege roles, managed secrets, deletion protection, 7+ days backup/PITR, CloudWatch alerting, verified snapshot restore and a planned upgrade/maintenance window. Multi-AZ availability is a cost/uptime decision. Do not provision a new paid instance without confirming plan and architecture.

## 2. Isolated rehearsal — safe migration utility

scripts/database/aws_rds_migrate.py is a standalone, conservative command-line tool. It NEVER changes source DB, never drops/replaces target tables, refuses identical source/target, and refuses a target containing application tables. All database credentials come from environment variables and are not written to logs.

The runner needs **psql, pg_dump and pg_restore** (PostgreSQL 17 client recommended), Python 3.11+, source Neon access, and a tested private path to AWS RDS. Inject SOURCE_DATABASE_URL and TARGET_DATABASE_URL from a secret manager, not a pasted command. Use TLS with sslmode=verify-full and a trusted root certificate. Keep the output directory on encrypted private storage: pg_dump contains sensitive data.

1. Confirm SOURCE_DATABASE_URL is production Neon and TARGET_DATABASE_URL is an independently created **empty** isolated AWS rehearsal database.
2. Run: python3 scripts/database/aws_rds_migrate.py --mode preflight
3. Run: python3 scripts/database/aws_rds_migrate.py --mode copy --output-dir /secure/unique-rehearsal-dir --apply --confirm-target-db perspective_rehearsal
4. Run: python3 scripts/database/aws_rds_migrate.py --mode verify --output-dir /secure/unique-rehearsal-dir

The script uses pg_dump custom format, pg_restore with --single-transaction and --exit-on-error, dump SHA-256, identity verification and per-table row counts. **Row counts are not a complete content integrity proof.** Source writes after the dump begins can also make counts diverge. Use additional application-level data reconciliation and a full write freeze for final migration.

Against **only the restored staging environment**, run:

    npm ci
    npm run db:migrate:status
    npm run db:verify
    npm run test:db
    npm run lint
    npm run typecheck
    npm run build

Check actual schema objects, extension compatibility, sequences, indexes, data samples/hashes, login/MFA, tenant isolation, personal magazines, CRM, editorial workflows, payments and backups. Do not seed production data or run prisma migrate reset.

## 3. Production cutover

1. Verify the deployed application host, release SHA, RDS private routing, new credentials, successful staging acceptance, encrypted source backup and tested RDS restore.
2. Announce maintenance; pause **all** writes: website, API, webhooks, jobs, queues and background workers.
3. Take and verify a fresh production export into a new empty AWS database, not the stale rehearsal copy. Ensure no source writes occurred after capture.
4. Validate row counts, schema and integrity, especially cross-tenant authorization and legitimate owner access.
5. Update the actual serving host's protected DATABASE_URL secret to RDS (verified TLS). Never commit credentials. Deploy and verify /api/health/live, /api/health/ready and authenticated routes, then enable writes.
6. Observe RDS new writes/connections and real alerts. Retain Neon intact as rollback source for an agreed period. After new RDS writes, returning to Neon without reconciling the delta **can lose data**; do not perform a simple pointer rollback.
7. Verify RDS automated backup, PITR and isolated restore before retiring the Neon backup pipeline. Decommission Neon only in a separate explicit follow-up after validation.

## Unclosed execution gates

| Gate | Status |
| --- | --- |
| AWS RDS staging inventory | VERIFIED |
| Live Neon source metadata | VERIFIED |
| Secured IAM deployment identity | NOT DONE (root connection observed) |
| Dedicated AWS production RDS, private networking and secrets | NOT DONE |
| Hostinger/application-to-RDS connection | UNVERIFIED |
| Neon-to-AWS data transfer | NOT DONE |
| Target-side database and authenticated acceptance | NOT DONE |
| Serving-host DATABASE_URL cutover | NOT DONE |
| AWS backups, recovery and live alerts | NOT DONE |
| Neon retirement | NOT DONE — MUST KEEP SOURCE |

A passed script unit test or this runbook is not evidence of a completed cloud migration. Record command outputs, cloud resource IDs, checks, deployed SHA, backup/restore evidence and a production release decision before marking a gate PASS.
