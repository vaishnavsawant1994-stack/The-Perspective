# Phase 4 — R2 Checkpoint

## PostgreSQL / Prisma Schema, Migrations, Constraints & Seed Baseline

**Checkpoint:** P4-R2-C1  
**Date:** August 23, 2026  
**Status:** REVIEWED AND ACCEPTED  
**Authorized scope:** R2 only  
**R3 status:** AUTHORIZED — R3 ONLY

R2 establishes the PostgreSQL persistence foundation required by later identity, tenancy, authorization, domain, API, worker, and reliability stages. It does not implement authentication, business workflows, API routes, integrations, or UI data binding. The R1 route registry remains the single source of truth for Designs 001–153; no Design 154 or visual redesign was created.

## 1. Acceptance summary

| # | R2 acceptance criterion | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Prisma/PostgreSQL tooling is pinned, configured, validated, and generates its client | PASS | Prisma CLI/client/adapter `7.9.1`, `pg@8.23.0`, explicit `prisma.config.ts`, explicit generated-client output; `npm run db:validate` and `npm run db:generate` exit 0. |
| 2 | Physical schema is limited to approved `iam`, `platform`, and `audit` foundation inventory | PASS | One reviewed schema and migration create 27 foundation tables only; no later product-domain tables were added. |
| 3 | A clean PostgreSQL 16+ database applies all checked-in migrations using the deployment command | PASS | Disposable PostgreSQL `16.13`; `npm run db:migrate:deploy` applied `20260823180000_r2_foundation` from an empty database. |
| 4 | Foreign keys, checks, partial uniqueness, tenant-leading indexes, and validity constraints are verified | PASS | Reviewed migration SQL plus 12 live database tests, including negative uniqueness, validity, lineage, and isolation cases. |
| 5 | Transaction-local context and resource RLS prevent cross-client reads under a restricted role | PASS | Tests cover no context, Client A, Client B, and Platform context; two RLS policies are catalog-verified. |
| 6 | Immutable evidence rejects update/delete and retry history preserves originals | PASS | Six immutable triggers are catalog-verified; mutation attempts fail with SQLSTATE `55000`; retries remain linked new rows. |
| 7 | Deterministic seed is gated, production-refusing, safely rerunnable, and provides isolation fixtures | PASS | Fixed named UUIDs/UTC epoch; opt-in, production, and unknown-organization safety; two runs return identical counts. |
| 8 | Verification SQL and tests cover inventory, constraints, RLS, immutability, idempotency, and seed safety | PASS | `verify.sql`, 48 default tests, and 12 live database tests pass; verification reports 27 tables, 2 policies, and 6 triggers. |
| 9 | Migration history and Prisma/custom SQL contract have no drift | PASS | `npm run db:drift` reports no difference; migration status reports the schema is up to date. |
| 10 | Native PostgreSQL backup/restore succeeds and restored assertions pass | PASS | Custom-format backup SHA-256 `c747d9092f42ae46911862d8d976d3eb0d47ab8b6edbdf36c01b97f40c9afd63`, 101,338 bytes; separate restore passes verification and fixture assertions. |
| 11 | Repository/dependency validation passes without weakening R1 | PASS | ESLint, strict TypeScript, production build, 48 default tests, 12 database tests, and both dependency audits pass; R1 tests remain in the suite. |
| 12 | Checkpoint records scope, evidence, risks, and rollback, then stops before R3 | PASS | This document; R3 remains explicitly unauthorized. |

## 2. Implemented persistence inventory

### `iam`

- organizations, people, user accounts, and external identity references;
- departments and organization memberships;
- roles, permissions, grants, and membership-role assignments;
- session, MFA, invitation, and recovery persistence contracts only.

### `platform`

- canonical resource envelope with organization/client/project context;
- command idempotency receipts;
- transactional outbox events and immutable delivery attempts;
- callback receipts and immutable processing attempts;
- automation execution attempts with original/parent retry lineage;
- incidents and append-only incident events;
- reconciliation runs and append-only findings.

### `audit`

- append-only audit events with actor, target, correlation, redacted evidence, and chronology.

The migration creates 27 tables across these three schemas. CRM, commercial, delivery, content, publishing, reporting, integrations, and other product-domain tables remain deferred.

## 3. Migration and integrity evidence

The checked-in migration is `20260823180000_r2_foundation`. It creates logical schemas and `citext` before tables, then installs foreign keys, check constraints, partial unique indexes, tenant-leading indexes, RLS helpers/policies, and immutable-history triggers.

Verified invariants include:

- one active membership per organization/user and coherent validity windows;
- unique role/permission and membership/role grants;
- hashed or referenced secret material rather than plaintext credentials;
- required owning organization and explicit resource visibility/sensitivity;
- idempotency uniqueness within owner/scope;
- unique parent/attempt-number pairs for outbox and callback attempts;
- execution attempt 1 as the original and later attempts linked to root and parent;
- prevention of self-referential retry lineage;
- update/delete rejection for all six immutable evidence tables.

Catalog verification result:

```text
foundation_table_count: 27
resource_policy_count: 2
immutable_trigger_count: 6
```

## 4. Tenant-isolation baseline

The `platform.resources` baseline uses transaction-local organization/client context helpers and PostgreSQL row-level security:

- reads allow the owning organization;
- client context can read only its own `CLIENT_SHARED` resources;
- mutations require the owning organization context;
- absent context reveals no protected resource rows to the restricted validation role.

Two fictional clients deliberately have resources with the same title. Live tests prove title overlap does not permit cross-client access.

This is a database defense-in-depth baseline, not active request tenancy. R4 must supply verified request context, extend policy coverage, and use a non-owner runtime database role.

## 5. Deterministic seed evidence

The seed uses named UUIDv5-compatible identifiers and a fixed `2026-01-15T10:00:00Z` demo epoch. It contains fictional `example.com` identities and no usable credentials or provider secrets.

Both initial and repeated seed runs produced:

```text
organizations: 3
memberships: 3
resources: 3
audit events: 1
outbox attempts: 2
automation runs: 2
```

Seed safety is fail-closed: explicit opt-in is required, production is refused, databases with unknown organization IDs are refused before changes, and reruns retain stable identifiers and counts.

## 6. Backup and restore rehearsal

The rehearsal used PostgreSQL native custom format (`pg_dump -Fc`) with ownership and privileges excluded, then restored to a separately created empty database using `pg_restore`.

| Evidence | Result |
| --- | --- |
| Source | migrated and seeded PostgreSQL 16.13 database |
| Backup size | 101,338 bytes |
| SHA-256 | `c747d9092f42ae46911862d8d976d3eb0d47ab8b6edbdf36c01b97f40c9afd63` |
| Restored schema | 27 tables, 2 RLS policies, 6 immutable triggers |
| Restored fixtures | 3 organizations, 3 memberships, 3 resources, 1 audit event, 2 outbox attempts, 2 automation runs |

Scripts accept URLs from environment variables and embed no production credentials. Production scheduling, retention, encryption, off-site replication, and RTO/RPO certification remain deferred.

## 7. Dependency-security result

R2 pinned the Prisma/PostgreSQL toolchain and retained R1's `nanoid@3.3.18` override. Prisma's transitive `deepmerge-ts@7.1.5` advisory was constrained with a narrow `deepmerge-ts@8.0.2` override after validation; no broad `npm audit fix` was used.

```text
npm audit --omit=dev → found 0 vulnerabilities
npm audit → found 0 vulnerabilities
npm ls nanoid --all → 3.3.18 overridden
npm ls deepmerge-ts --all → 8.0.2 overridden
```

## 8. Validation evidence

| Command / check | Result |
| --- | --- |
| `npm run db:validate` | PASS — schema valid |
| `npm run db:generate` | PASS — client generated to explicit ignored output |
| `npm run db:migrate:deploy` | PASS — clean PostgreSQL 16.13 database |
| `npm run db:migrate:status` | PASS — schema up to date |
| `npm run db:verify` | PASS — 27 tables, 2 policies, 6 triggers |
| `npm run db:seed` twice | PASS — stable identifiers/counts |
| `npm run db:seed:assert` | PASS — fixtures present |
| `npm run db:drift` | PASS — no difference detected |
| `npm run test:db` | PASS — 1 file, 12 live PostgreSQL tests |
| `npm test` | PASS — 7 files, 48 tests including R1 security tests |
| `npm run lint` | PASS — exit 0 |
| `npm run typecheck` | PASS — strict TypeScript, exit 0 |
| `npm run build` | PASS — Next.js 16.3.0 production build, Proxy present |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npm audit` | PASS — 0 vulnerabilities |
| Native backup/restore | PASS — restored verification and assertions |

## 9. Files changed by R2

### Configuration and dependencies

- `.gitignore`
- `package.json`
- `package-lock.json`
- `prisma.config.ts`
- `vitest.config.mts`
- `vitest.database.config.mts`

### Schema and migrations

- `prisma/schema.prisma`
- `prisma/migrations/migration_lock.toml`
- `prisma/migrations/20260823180000_r2_foundation/migration.sql`
- `prisma/migrations/20260823180000_r2_foundation/verify.sql`
- `prisma/migrations/20260823180000_r2_foundation/DEPLOYMENT.md`

### Persistence, seed, and tests

- `src/modules/README.md`
- `src/modules/persistence/index.ts`
- `src/modules/persistence/client.ts`
- `src/modules/persistence/database-environment.ts`
- `src/modules/persistence/database-environment.test.ts`
- `prisma/seed/index.ts`
- `prisma/seed/stable-ids.ts`
- `prisma/seed/stable-ids.test.ts`
- `prisma/seed/seed-safety.ts`
- `prisma/seed/seed-safety.test.ts`
- `prisma/seed/assertions.ts`
- `prisma/tests/r2-foundation.database.test.ts`

### Operational verification and documentation

- `scripts/database/verify-database.ts`
- `scripts/database/assert-seed.ts`
- `scripts/database/backup.ps1`
- `scripts/database/restore-verify.ps1`
- `docs/phase-4/README.md`
- `docs/phase-4/PHASE-4-R1-CHECKPOINT.md`
- `docs/phase-4/PHASE-4-R2-IMPLEMENTATION-CONTRACT.md`
- `docs/phase-4/PHASE-4-R2-CHECKPOINT.md`

The worktree also contains substantial pre-existing design/audit changes. R2 did not rewrite, remove, or claim those unrelated files.

## 10. Unresolved risks and deliberate deferrals

1. **No production authentication/session/MFA service exists.** IAM tables are contracts only; R1 continues to deny protected routes.
2. **No active tenant or authorization resolver exists.** RLS tests use explicit validation context, not an authenticated request.
3. **Table owners can bypass ordinary RLS.** Production must use a restricted non-owner runtime role and complete R4 validation.
4. **RLS coverage is intentionally limited to the resource baseline.** R4 must expand organization isolation as repositories become authorized.
5. **`project_id` is intentionally not a foreign key.** The project aggregate does not exist until its authorized domain stage.
6. **No business-domain tables/workflows exist.** Visual routes remain prototype fixtures.
7. **No API, command, integration, callback handler, queue, or worker was implemented.** Persistence envelopes do not make services operational.
8. **Backup proof is local/procedural.** Production retention, encryption, scheduling, geographic separation, monitoring, RPO, and RTO are uncertified.
9. **The `deepmerge-ts` override is deliberate.** Re-evaluate on Prisma upgrades; current compatibility is covered by the R2 validations.
10. **No production database/provider was selected or connected.** Evidence used an isolated disposable local PostgreSQL environment.
11. **The worktree is not clean.** Pre-existing design/audit changes prevent a safe automatic standalone R2 commit.

## 11. Rollback instructions

Prefer a dedicated `git revert` after R2 is recorded as its own reviewed commit. Before then, do not use broad reset, checkout, clean, or recursive deletion commands because the worktree contains unrelated user work.

For surgical pre-commit rollback:

1. remove only the R2 Prisma, seed, persistence, database-test, and database-script files in Section 9;
2. restore only R2 portions of `.gitignore`, `package.json`, `package-lock.json`, `vitest.config.mts`, `src/modules/README.md`, and `docs/phase-4/README.md`, preserving R1 content;
3. remove only `prisma.config.ts`, `vitest.database.config.mts`, the R2 contract, and this checkpoint;
4. run `npm install` to reconcile dependencies;
5. rerun R1 tests, lint, strict TypeScript, production build, and dependency audit;
6. do not alter any other dirty/untracked design, audit, route, component, or stylesheet file.

If deployed to a shared database, do not attempt a destructive down migration. Provision a clean database at the prior contract or execute an explicitly reviewed forward recovery migration, preserving immutable history.

## 12. Review gate

P4-R2-C1 was reviewed and accepted on August 23, 2026. Its schema, forward-only migration history, integrity controls, deterministic seed, database verification, and repository boundaries remain the authoritative persistence baseline. R3 alone is authorized; R4 and every later stage remain locked.

```text
P4-R1-C1 accepted
  → P4-R2-G0 authorized
  → R2 implemented
  → P4-R2-C1 reviewed and accepted
  → R3 explicitly authorized
  → R4 remains locked
```
