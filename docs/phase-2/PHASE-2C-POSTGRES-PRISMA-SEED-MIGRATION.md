# Phase 2C — PostgreSQL, Prisma, Seed & Migration Architecture

**Status:** Architecture freeze candidate  
**Current repository state:** The application has no production ORM/database dependency. This document proposes structure; it does not install Prisma or mutate the current UI implementation.

## 1. Recommended implementation stack

- PostgreSQL 16+ compatible managed service.
- Prisma ORM for typed application access and migrations.
- SQL migrations alongside Prisma for RLS, partial/exclusion indexes, triggers, append-only protection, ledger constraints, and database extensions Prisma cannot fully express.
- Object storage with signed access and server-side authorization.
- Transactional outbox workers for email, payments, media, publishing, distribution, metrics, notifications, and search indexing.
- Search and analytics as rebuildable projections; PostgreSQL remains canonical.

The architecture is provider-neutral. A later hosting decision may choose Supabase, Neon, RDS, Azure Database for PostgreSQL, or another PostgreSQL-compatible provider without changing the logical model.

## 2. Suggested repository structure

```text
prisma/
├── schema.prisma                 # generator + datasource + assembled model entry
├── models/
│   ├── iam.prisma
│   ├── platform.prisma
│   ├── crm.prisma
│   ├── comms.prisma
│   ├── commercial.prisma
│   ├── delivery.prisma
│   ├── content.prisma
│   ├── magazine.prisma
│   ├── media.prisma
│   ├── events.prisma
│   ├── assets.prisma
│   ├── approvals.prisma
│   ├── publishing.prisma
│   ├── reporting.prisma
│   └── audit.prisma
├── migrations/
│   └── YYYYMMDDHHMM_phase_name/
│       ├── migration.sql
│       ├── data-backfill.sql     # optional, rerunnable/idempotent
│       └── verify.sql
└── seed/
    ├── index.ts
    ├── stable-ids.ts
    ├── reference-data.ts
    ├── roles-permissions.ts
    ├── demo-organizations.ts
    ├── demo-crm-commercial.ts
    ├── demo-projects-content.ts
    ├── demo-client-portal.ts
    └── assertions.ts

src/server/
├── auth/                         # sessions, active membership, policy context
├── db/                           # Prisma client, transaction helpers, raw SQL helpers
├── policy/                       # Phase 2B authorization and field serializers
├── repositories/                # domain repositories; no UI imports Prisma directly
├── services/                    # application commands and transaction boundaries
├── queries/                     # authorized read models / Client 360 composition
├── events/                      # outbox contracts and consumers
├── integrations/                # provider adapters
├── jobs/                         # idempotent async workers
└── validation/                   # command and DTO schemas
```

If the installed Prisma version does not support multi-file schemas in the selected toolchain, assemble the logical files into one generated `schema.prisma` during build. Logical domain ownership remains unchanged.

## 3. Prisma model pattern

Illustrative only; the complete fields are frozen in the field/key specification.

```prisma
enum Visibility {
  INTERNAL
  CLIENT_SHARED
  PUBLIC
}

enum Sensitivity {
  STANDARD
  CONFIDENTIAL
  PII
  FINANCIAL
  SECURITY
  SECRET
}

model Organization {
  id               String   @id @db.Uuid
  organizationType OrganizationType
  legalName        String
  displayName      String
  slug             String
  status           RecordStatus
  createdAt        DateTime @db.Timestamptz(6)
  updatedAt        DateTime @db.Timestamptz(6)

  memberships      OrganizationMembership[]
  resources        Resource[]

  @@unique([slug])
  @@map("organizations")
  @@schema("iam")
}

model Resource {
  id                   String      @id @db.Uuid
  resourceType         String
  ownerOrganizationId  String      @db.Uuid
  clientOrganizationId String?     @db.Uuid
  projectId            String?     @db.Uuid
  visibility           Visibility
  sensitivity          Sensitivity
  createdAt             DateTime    @db.Timestamptz(6)
  archivedAt            DateTime?   @db.Timestamptz(6)

  ownerOrganization     Organization  @relation(fields: [ownerOrganizationId], references: [id], onDelete: Restrict)
  clientOrganization    Organization? @relation("ClientResource", fields: [clientOrganizationId], references: [id], onDelete: Restrict)

  @@index([ownerOrganizationId, resourceType, archivedAt])
  @@index([clientOrganizationId, visibility, createdAt(sort: Desc)])
  @@map("resources")
  @@schema("platform")
}

model DeliverableVersion {
  id                    String   @id @db.Uuid
  deliverableId         String   @db.Uuid
  versionNumber         Int
  supersedesId          String?  @db.Uuid
  contentHash           String
  payload               Json
  manifest              Json
  createdAt             DateTime @db.Timestamptz(6)
  createdByMembershipId String?  @db.Uuid

  @@unique([deliverableId, versionNumber])
  @@unique([deliverableId, contentHash])
  @@map("deliverable_versions")
  @@schema("delivery")
}
```

## 4. PostgreSQL features and extensions

| Feature | Use |
|---|---|
| `citext` | Case-insensitive verified emails/domains |
| `pgcrypto` or application UUIDv7 | ID support; prefer app UUIDv7 for ordering consistency |
| `pg_trgm` | Internal fuzzy matching and dedupe candidate search |
| Row-level security | Tenant/client defense in depth |
| Partial indexes | Live/unarchived and active-membership uniqueness |
| Exclusion constraints | Non-overlapping role validity, optional event room conflicts |
| Generated/check constraints | Money/ledger/state invariants |
| Declarative partitioning | High-volume audit/events/metrics after sizing |

Secrets remain in a secret manager. Database fields store secret references, fingerprints, scopes, and rotation metadata only.

## 5. Row-level security baseline

The application sets transaction-local claims after authenticating and authorizing membership:

```sql
select set_config('app.user_id', :user_id, true);
select set_config('app.membership_id', :membership_id, true);
select set_config('app.organization_id', :organization_id, true);
select set_config('app.client_organization_id', coalesce(:client_org_id, ''), true);
```

Illustrative client-safe policy:

```sql
create policy client_shared_project_records on platform.resources
for select
using (
  client_organization_id = nullif(current_setting('app.client_organization_id', true), '')::uuid
  and visibility = 'CLIENT_SHARED'
);
```

This is defense in depth. The API policy service still checks permission key, scope, assignment, workflow stage, field visibility, and approval authority. Administrative database connections must not be exposed to request handlers.

## 6. Client-safe projection pattern

Never serialize Prisma records directly to Client Portal responses.

```ts
type ClientProjectSummary = {
  id: string;
  name: string;
  productType: string;
  status: string;
  progress: number;
  targetDueOn: string | null;
  accountManager: PublicPersonSummary | null;
  pendingClientActions: number;
};
```

Use explicit query/serializer modules such as:

```text
getTeamClient360(policyContext, clientId)
getClientPortalDashboard(clientContext)
getClientVisibleProject(clientContext, projectId)
getPublicPublicationByRoute(publicContext, route)
```

Each has a dedicated field allowlist. Internal fields are never fetched “just in case” for a client response.

## 7. Indexing requirements

### Universal tenant indexes

- `(owner_organization_id, status, archived_at)` on operational aggregates.
- `(client_organization_id, visibility, created_at desc)` on client-shared resource families.
- `(project_id, status, due_at)` on project work.
- `(assigned_membership_id, status, due_at)` on personal queues.
- Partial unique indexes for active memberships, active roles, live slugs, and unarchived configuration names.

### Domain indexes

| Domain | Required indexes |
|---|---|
| CRM | normalized company domain, normalized contact email/phone hash, lead owner/status/score, source/provenance, list membership |
| Communication | provider account + external thread/message ID, conversation last message, recipient next action, suppression destination hash |
| Commercial | deal stage/owner/close date, proposal/contract/invoice number, invoice status/due date, provider payment/refund ID |
| Delivery | project client/status/owner, active workflow stage, task assignee/due/status, questionnaire recipient/status |
| Content | draft/project/review state, taxonomy links, author credits, full-text projection key |
| Assets | SHA-256, storage key, project/client/type, rights state/expiry, linked resource |
| Approval | assignee/status/due date, target resource/version hash, requester/project/client |
| Publishing | canonical route/locale, scheduled time/status, target/status, provider job key, published URL |
| Reporting | resource + metric + period, source/provider identity, verification/freshness, report client/project/period |
| Audit | occurred time, actor, action, target resource, request correlation; partition by month/quarter after measured volume |

### Search

- PostgreSQL full-text/trigram is acceptable for the first internal release.
- Move to a dedicated search index when faceting, typo tolerance, ranking, or volume requires it.
- Maintain three projection families: team, client, public.
- Index only authorized projection fields and re-authorize on open.
- Queue projection changes through outbox; run reconciliation jobs to detect drift.

## 8. Retention and archival matrix

Exact durations require legal approval and jurisdiction configuration. These are baseline classes, not final legal advice.

| Data class | Baseline retention | Deletion behavior |
|---|---|---|
| Signed contracts/signature evidence | Contract term + statutory period | Immutable; legal hold supported |
| Invoices, payments, refunds, ledger | Statutory finance period (commonly 7–10 years) | No product deletion; controlled archival |
| Approval decisions/published release evidence | Life of publication/project + policy period | Immutable/superseded |
| Audit/security events | Risk-based 1–7 years; high-risk longer | Append-only, restricted, partition expiry after hold check |
| Client/project records | Relationship + contractual/legal period | Archive; selective PII erasure/anonymization |
| Lead/contact prospecting data | Purpose/consent based, reviewed regularly | Erase/anonymize/suppress when no legal basis |
| Messages/meetings/support | Business/legal policy, configurable | Archive; preserve linked contractual evidence |
| Drafts and working assets | Project + agreed revision/history period | Archive; purge only if no approval/publication/hold link |
| Raw extraction/enrichment payloads | Short operational window | Delete after normalization/review unless provenance requires subset |
| Provider webhook payloads | Minimum needed for dispute/idempotency/audit | Redact secrets/PII; retain normalized evidence |
| Search/cache/read models | Rebuildable | Immediate removal and reindex on source restriction |
| Backups | Fixed encrypted rotation | Expire automatically; restore process honors later erasure controls |

Every purge job performs a dependency and legal-hold check, writes an audit summary, removes search/object-storage projections, and uses a stable erasure request ID.

## 9. Soft delete and archive strategy

- Use `archived_at/by` for mutable operational records.
- Use explicit terminal states for lifecycle completion/cancellation; archive is not a business status.
- Do not add `deleted_at` to immutable versions/events/finance/audit as a false promise of deletion.
- Privacy erasure separates identity removal from business evidence. Replace presentation PII with irreversible anonymized references where lawful while preserving totals and evidence.
- Permanent deletion is a privileged background operation requiring policy, dependency scan, reason, two-person approval for high-risk classes, and an audit event.

## 10. Seed and demo-data architecture

### 10.1 Objectives

Seed data must:

- exercise all 17 Phase 2B roles and all scope types;
- populate the complete Lead → Renewal lifecycle;
- support each of the 151 screens with coherent linked records;
- contain both internal and client-visible variants;
- include normal, empty, loading-independent, overdue, failed, rejected, expired, archived, and permission-denied states;
- be deterministic, rerunnable, and obviously fictional.

### 10.2 Deterministic identities

Use stable UUIDv5/declared UUID constants keyed by scenario, for example:

```text
org:perspective-platform
org:asteria-systems
person:anika-rao
client:asteria
deal:asteria-personal-magazine
project:asteria-leadership-edition
```

No random IDs or dates in canonical demo fixtures. Derive relative dates from a fixed `DEMO_EPOCH` when tests require aging.

### 10.3 Seed layers

1. Reference enums, taxonomy, countries/currencies, channels, metric definitions.
2. The Perspective platform organization, departments, 17 roles, permission keys, role-permission baseline.
3. Staff people/accounts/memberships with ORG, DEPT, ASN, OWN visibility examples.
4. Fictional client/partner/vendor organizations and people/contacts.
5. Lead sources, extraction staging, enrichment provenance, leads/lists/scores.
6. Campaigns, replies, conversations, meetings, deals, proposals.
7. Contracts, invoices, payments, refunds, ledger, overdue and failed-payment examples.
8. Projects and each workflow family: editorial, magazine, podcast, video, event.
9. Assets/versions/rights, comments, approvals and exact-version decision history.
10. Publications, targets, URLs, distribution, verified/unverified metrics, reports, delivery packs, renewals.
11. Client Portal memberships and only client-shared resources.
12. Notifications, audit events, automation runs, support tickets, integration health states.

### 10.4 Required coherent scenarios

| Scenario | Purpose |
|---|---|
| Qualified lead with active outreach | Lead Finder through reply queue |
| Deal in proposal review with discount exception | Commercial separation of duties |
| Won client awaiting contract/payment | Onboarding gates |
| Active Personal Magazine project | Questionnaire, drafts, covers, proof, approval |
| Podcast awaiting audio review | Media/version/comments |
| Video publish-ready but blocked by rights | Asset rights guard |
| Event with speakers, tickets, payments, check-in | Event operations |
| Published article with distribution and verified metrics | Publishing/reporting |
| Completed project with renewal candidate | Renewal flow |
| Two isolated clients with overlapping record names | Tenant leakage tests |
| Internal comment beside client-visible comment | Field/visibility tests |
| Superseded approval after new version | History integrity |

### 10.5 Seed safety

- Production refuses demo seed unless an explicit environment gate and empty-database check pass.
- Seed emails use reserved domains such as `example.com`; phones/payment values use provider test ranges.
- Provider credentials are fake references, never secrets.
- Seed assertions verify organization isolation, version immutability, finance balance, and expected screen counts.

## 11. Migration strategy

### Stage 0 — preparation

1. Freeze Phase 2C names and IDs.
2. Select PostgreSQL provider, Prisma version, auth provider, object store, and queue runtime.
3. Establish development/staging/production databases and secret management.
4. Add migration CI against a clean database and an upgraded snapshot.

### Stage 1 — foundation migrations

Create extensions and schemas, then:

1. `iam` organizations/people/users/memberships/roles/permissions.
2. `platform.resources`, audit, outbox, integration and notification core.
3. RLS helper functions/policies and append-only protections.
4. Object-storage metadata and upload scanning pipeline.

### Stage 2 — revenue operations

CRM → communication → deals/products/proposals → Client Account → contracts → invoices/payments/ledger. Backfill Client 360 relationships before exposing operational screens.

### Stage 3 — delivery operations

Projects → workflow definitions/instances → tasks/questionnaires → deliverables/versions → comments/assets/approvals.

### Stage 4 — studios and publication

Editorial → magazine → podcast/video → events → publication snapshots → distribution.

### Stage 5 — reporting and renewals

Verified metric observations/snapshots → reports/delivery packs → renewal opportunities → analytics projections.

### Stage 6 — client portal exposure

Only after isolation tests pass:

1. provision client memberships;
2. add explicit `CLIENT_SHARED` records;
3. enable client serializers/search projection;
4. run cross-client leakage tests on every `/client/*` route;
5. enable production portal by client cohort/feature flag.

## 12. Safe schema-change method

Use expand/migrate/contract:

1. **Expand:** add nullable columns/tables/indexes without breaking old code.
2. **Dual-read/write only when unavoidable:** keep a bounded transition window and observability.
3. **Backfill:** idempotent batches with cursor, retry, metrics, and reconciliation.
4. **Validate:** counts, hashes, tenant ownership, constraints, and sample business invariants.
5. **Switch:** feature flag/application version begins using new shape.
6. **Contract:** make non-null/add strict constraints/drop old fields only after rollback window.

Avoid long blocking table rewrites. Build large indexes concurrently where supported. Treat enum removal/renaming as data migrations, not casual code edits.

## 13. Migration file contract

Each migration directory contains:

- forward-only `migration.sql`;
- optional rerunnable `data-backfill.sql`;
- `verify.sql` with zero-row failure queries or explicit expected counts;
- deployment note describing locks, duration, backfill, feature flag, rollback/roll-forward plan;
- owner and linked architecture decision.

Production rollback favors application rollback plus roll-forward schema correction. Destructive down migrations are not assumed safe.

## 14. Importing current mock/public data

The existing public website uses fixtures rather than a production database. Migration should use adapters:

```text
existing mock article/person/magazine/event records
-> validated import DTO
-> canonical person/taxonomy/content/media records
-> approved immutable publication-version snapshot
-> public read model
```

Do not point public pages at operational drafts. Preserve current public slugs with `public_route`, validate duplicate people/companies, and log import provenance. The import is repeatable in staging and one-time/idempotent in production.

## 15. Verification gates

### Database

- Foreign-key integrity and required tenant/context fields.
- No cross-client `CLIENT_SHARED` resource mismatch.
- Version hashes/sequence uniqueness.
- Balanced ledger and invoice/payment allocation reconciliation.
- No approval referencing mutable or missing target version.
- No live publication version using uncleared/expired required asset rights.

### Authorization

- All 17 roles exercise positive and negative tests.
- ORG, DEPT, ASN, OWN, CLIENT, READ, NONE scopes tested.
- Direct-route, API, server-action, export, and background-job checks.
- Client A cannot infer Client B through ID, search, counts, files, notifications, or error differences.

### Operational

- Outbox replay is idempotent.
- Webhook duplicate/reordering tests.
- Search/report projections reconcile to canonical source.
- Backup restore drill and object/database consistency check.
- Retention and erasure dry run.

## 16. Migration freeze checklist

- [ ] PostgreSQL provider and version selected.
- [ ] Prisma/toolchain version selected after checking its current documentation.
- [ ] Logical schema/model naming accepted.
- [ ] Mixed Prisma + reviewed SQL migration approach accepted.
- [ ] RLS defense-in-depth and policy context accepted.
- [ ] Deterministic seed scenarios accepted.
- [ ] Expand/migrate/contract deployment strategy accepted.
- [ ] Public fixture import and publication snapshot boundary accepted.
- [ ] Verification and cross-client leakage gates accepted.
