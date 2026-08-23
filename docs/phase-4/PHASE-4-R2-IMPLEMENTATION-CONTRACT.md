# Phase 4 — R2 Implementation Contract

## PostgreSQL / Prisma Schema, Migrations, Constraints & Seed Baseline

**Contract:** P4-R2-G0  
**Date:** August 23, 2026  
**Status:** AUTHORIZED — R2 ONLY  
**Depends on:** Accepted P4-R1-C1  
**Next stage:** R3 remains locked

## 1. Purpose

R2 establishes the production-compatible PostgreSQL persistence spine required by later authentication, tenancy, authorization, domain, API, worker, audit, recovery, and certification stages. It implements database structure and evidence, not product workflows.

The R1 typed route registry remains the single route source of truth. R2 does not modify Designs 001–153, create Design 154, redesign UI, or connect routed fixtures to database records.

## 2. Authoritative inputs

- P4-R0 findings F004, F009, and F016;
- accepted P4-R1-C1 route/security/module baseline;
- Phase 2C master database architecture;
- Phase 2C field/key specification;
- Phase 2C PostgreSQL/Prisma seed and migration architecture;
- frozen audit distinctions including Person ≠ User Account ≠ Membership, Organization ≠ Client Account, activity ≠ audit, and immutable attempt/version/event history.

## 3. Physical scope

R2 implements only the shared foundation schemas:

### `iam`

- organizations and people;
- user-account persistence without authentication behavior;
- external identity references without credentials;
- departments and organization memberships;
- roles, permissions, role-permission grants, and membership-role assignments without authorization evaluation;
- session, MFA, invitation, and recovery persistence contracts for R3, without login/session/MFA/recovery services.

### `platform`

- the canonical resource envelope with organization/client/project context, visibility, and sensitivity;
- command idempotency receipts;
- transactional outbox events and immutable delivery attempts;
- inbound callback/webhook receipts and immutable processing attempts;
- automation run and linked immutable execution attempts sufficient to preserve retry lineage;
- incident records and append-only incident events;
- reconciliation runs and append-only findings;
- deterministic seed ownership metadata only where required for safe reruns.

### `audit`

- append-only sensitive-action/security audit events with actor, target, correlation, redacted evidence, and chronology.

Later domain tables for CRM, communications, commercial, delivery, content, publishing, reporting, and integrations remain deferred to their authorized stages. R2 may create their PostgreSQL schemas as empty namespaces to freeze ownership, but it must not invent their physical business models.

## 4. Dependency map

```text
R1 foundation contracts and route boundary
  → R2 PostgreSQL schemas and migration history
      → R3 authentication/session services
      → R4 active organization/workspace membership isolation
      → R5 permission evaluation
      → R6 canonical business aggregates and transitions
      → R7 APIs and commands
      → later integrations/workers/UI binding
```

R2 database code may depend on R1 foundation contracts. R1 foundation code must not depend on Prisma or PostgreSQL.

## 5. Migration strategy

- Use Prisma 7 with the PostgreSQL driver adapter and an explicit generated-client output.
- Use checked-in forward-only Prisma migration SQL plus reviewed custom SQL.
- Create extensions and logical schemas before tables.
- Apply strict foreign keys, unique constraints, check constraints, partial indexes, and tenant-leading indexes in SQL where Prisma cannot express them.
- Install transaction-local RLS context helpers and a resource-envelope defense-in-depth policy; R4 later supplies verified request context and expands isolation coverage.
- Install append-only triggers on immutable evidence tables.
- Give each migration a verification SQL file and deployment/roll-forward note.
- Use expand/migrate/contract for later changes; do not assume destructive down migrations.

## 6. Integrity requirements

- UUID identifiers are supplied by the trusted application/seed layer; provider IDs never become primary keys.
- UTC timestamps use `timestamptz(6)`.
- active organization membership is unique per organization/user;
- role/permission and membership/role grants are unique and validity windows are coherent;
- session, invitation, recovery, and MFA secret material is stored only as hashes or secret references;
- resources always have an owning organization and explicit visibility/sensitivity;
- idempotency keys are unique inside their owner/scope;
- outbox and callback attempts are unique by parent and attempt number;
- retry attempts link to the original run and cannot overwrite previous attempts;
- audit, attempt, incident-event, and reconciliation-finding rows reject update/delete;
- no seed credential, provider secret, real email, or production identifier is committed.

## 7. Deterministic seed strategy

- Fixed UUIDv5-compatible IDs derived from named fictional scenarios;
- fixed UTC demo epoch; no random IDs or current-time-dependent canonical rows;
- one Platform organization and two fictional isolated Client organizations;
- overlapping resource titles across the two clients to support later leakage tests;
- staff/client memberships and minimal role/permission reference data;
- internal and client-shared resource variants;
- immutable audit/outbox/callback/attempt/incident/reconciliation examples;
- rerunning the seed produces identical IDs and stable counts;
- seeding requires an explicit opt-in, refuses production, and refuses databases containing unknown organizations.

R2 seed data is a persistence test baseline. It does not claim to support every visual screen and does not implement business workflows.

## 8. Backup and restore strategy

- Provide scripts using PostgreSQL native custom-format backup/restore tools.
- Rehearse backup from the migrated/seeded validation database into a separate empty database.
- Re-run migration verification and seed assertions against the restored database.
- Record checksum, schema/object counts, and integrity results in the R2 checkpoint.
- Production scheduling, retention, encryption keys, off-site replication, and recovery-time objectives require the later deployment/reliability stage.

## 9. R2 exclusions

- authentication, password verification, OAuth, session issuance, MFA, activation, or recovery flows;
- active request tenant resolution or RBAC policy evaluation;
- CRM, finance, project, content, publishing, distribution, reporting, automation execution, or other business workflows;
- provider integrations, callbacks handlers, workers, queues, or schedulers;
- API routes, server actions, broad repositories/services, or UI data binding;
- production data import or migration;
- broad component or visual changes;
- R3 or any later remediation stage.

## 10. Objective acceptance criteria

P4-R2-C1 may be created only when all criteria are evidenced:

1. Current Prisma/PostgreSQL tooling is pinned, configured, and passes schema validation plus client generation.
2. The physical schema is limited to the approved `iam`, `platform`, and `audit` foundation inventory; later domain namespaces contain no speculative tables.
3. A clean PostgreSQL 16+ database applies every checked-in migration successfully using the production deployment command.
4. Foreign keys, checks, partial uniqueness, tenant-leading indexes, and validity constraints are verified from PostgreSQL catalogs or negative tests.
5. Transaction-local context helpers and resource RLS prevent cross-client reads under a restricted validation role.
6. Immutable audit/attempt/incident/reconciliation evidence rejects update and delete; linked retry attempts preserve originals.
7. The deterministic seed is explicitly gated, production-refusing, rerunnable, and proves stable IDs/counts plus two-client isolation fixtures.
8. Migration verification SQL and automated tests cover schema inventory, constraints, RLS, immutability, idempotency, and seed safety.
9. A schema drift check reports no difference between migration history and the Prisma schema/custom SQL contract.
10. A native PostgreSQL backup/restore rehearsal succeeds and restored-data assertions pass.
11. ESLint, strict TypeScript, automated tests, production build, and accepted dependency audit pass without weakening R1 protected-route tests.
12. P4-R2-C1 records files changed, versions, migration/seed/restore evidence, unresolved risks, and surgical rollback instructions, then stops before R3.

## 11. Gate state

```text
P4-R1-C1 accepted
  → P4-R2-G0 authorized
  → R2 implementation only
  → P4-R2-C1 checkpoint
  → STOP
  → R3 remains locked
```
