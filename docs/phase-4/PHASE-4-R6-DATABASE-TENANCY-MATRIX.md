# Phase 4 — R6 Database Tenancy / RLS Matrix

**Record:** P4-R6-DB-TENANCY-01  
**Date:** September 27, 2026  
**Planning baseline:** `main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`  
**Status:** G0 CANDIDATE — NO R6 TABLES AUTHORIZED YET

## 0. Inherited database rule

R6 extends, never replaces, the accepted PostgreSQL boundary.

Inherited R4 floor:

- restricted role `perspective_runtime`;
- `NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS`;
- transaction-local trusted tenant claims;
- `ENABLE ROW LEVEL SECURITY` + `FORCE ROW LEVEL SECURITY` on protected tenant tables;
- restricted table privileges;
- server-only transaction helper.

Every new R6 table must be in this matrix before migration qualification can pass.

## 1. Classification

**DIRECT RLS**  
Table carries authoritative owner organization and receives forced RLS directly.

**PARENT RLS + FK**  
Child table does not duplicate tenant ownership; access must join through an RLS-protected parent under a repository pattern that cannot bypass the parent. Direct runtime grants are restricted accordingly.

**EVIDENCE / SYSTEM RESTRICTED**  
Append-only/provider evidence still has explicit organization linkage or protected parent, but ordinary application reads go through constrained repositories rather than broad CRUD.

No R6 table may be “tenant neutral” merely because it is a child table.

## 2. CRM tables

| Table | Tenant source | RLS class | Resource-backed | Critical DB invariants |
|---|---|---|---|---|
| `crm.lead_sources` | `owner_organization_id` | DIRECT RLS | yes | unique live org+name; status/health controlled |
| `crm.extraction_jobs` | owner org | DIRECT RLS | yes | source belongs same org; idempotent request/attempt identity |
| `crm.staged_records` | extraction job | PARENT RLS + FK | conditional/actionable | unique job+source_record_key; no cross-job target resource |
| `crm.enrichment_jobs` | owner org + target resource | DIRECT RLS | yes | target resource same org; unique active request hash |
| `crm.enrichment_facts` | enrichment job/target | EVIDENCE / PARENT | no separate resource by default | target/job org agreement; accepted actor FK |
| `crm.companies` | owner org | DIRECT RLS | yes | reviewed domain uniqueness policy |
| `crm.contacts` | owner org | DIRECT RLS | yes | person/company same allowed org graph |
| `crm.leads` | owner org | DIRECT RLS | yes | company/contact/source same org; one controlled converted_deal link |
| `crm.lead_scores` | lead | EVIDENCE / PARENT | no | append-only observation; unique lead+model+time |
| `crm.lead_status_history` | lead | EVIDENCE / PARENT | no | append-only transition evidence |
| `crm.lead_lists` | owner org | DIRECT RLS | yes | unique live org+owner+name |
| `crm.lead_list_members` | list + lead | PARENT RLS + FK | no | unique list+lead; same org required |
| `crm.qualifications` | lead/deal resource | DIRECT or parent-derived with explicit owner org | yes if independently actionable | one reviewed record/version as contracted |
| `crm.duplicate_candidates` | owner org | DIRECT RLS | yes | both candidate resources same org |
| `crm.suppression_entries` | owner org | DIRECT RLS | yes | unique active org+channel+normalized destination hash |

## 3. Communications tables

| Table | Tenant source | RLS class | Resource-backed | Critical DB invariants |
|---|---|---|---|---|
| `comms.sending_accounts` | owner org | DIRECT RLS | yes | provider connection same org; unique connection+address |
| `comms.message_templates` | owner org | DIRECT RLS | yes | unique live org+owner+name |
| `comms.message_template_versions` | template | EVIDENCE / PARENT | no | immutable version; unique template+version |

D15 Resolution A makes the two template tables R6 **read-only reference/catalog storage** if they are implemented at all. The R6 runtime role receives no template mutation path through `template.manage`; baseline rows must come only from an explicitly reviewed immutable seed/import manifest, and missing approved versions fail campaign readiness.
| `comms.outreach_campaigns` | owner org | DIRECT RLS | yes | list/sequence/sender same org |
| `comms.sequences` | owner org | DIRECT RLS | yes | unique live org+owner+name |
| `comms.sequence_steps` | sequence | PARENT RLS + FK | no | unique sequence+version+position; template version same org |
| `comms.campaign_recipients` | campaign | PARENT RLS + FK | no | unique campaign+recipient identity; recipient same org |
| `comms.message_deliveries` | campaign recipient/message | EVIDENCE / PARENT | no | provider event unique; append-only chronology |
| `comms.conversations` | owner org | DIRECT RLS | yes | provider thread key unique within connection/org |
| `comms.conversation_participants` | conversation | PARENT RLS + FK | no | unique conversation+normalized participant/channel |
| `comms.messages` | conversation | EVIDENCE / PARENT | yes only if cross-domain asset/activity needs individual message resource | immutable provider message key; direction fixed |
| `comms.meetings` | owner org | DIRECT RLS | yes | linked deal/client same allowed tenant graph |
| `comms.meeting_participants` | meeting | PARENT RLS + FK | no | unique meeting+person/membership; membership org valid |
| `comms.meeting_notes` | meeting | PARENT RLS + FK | no | author membership valid; visibility explicit |

### 3.1 D15 template persistence rule

Gate-A D15 Resolution A keeps `template.manage` dormant at `R6+`.

R6 may materialize `comms.message_templates` / `comms.message_template_versions` only as a read/reference boundary for already-approved immutable versions. R6 runtime user commands may not create, edit, version, approve, publish or archive templates.

An empty approved-template set is valid. Campaign readiness must fail closed when no approved immutable template version is available; R6 may not generate placeholder template truth to bypass D15.

## 4. Commercial R6 tables

| Table | Tenant source | RLS class | Resource-backed | Critical DB invariants |
|---|---|---|---|---|
| `commercial.deal_pipelines` | owner org | DIRECT RLS | yes | unique org+name+version |
| `commercial.deal_stages` | pipeline | PARENT RLS + FK | no | unique pipeline version+key and position |
| `commercial.deals` | owner org | DIRECT RLS | yes | company/contact/lead/pipeline/stage tenant/version agreement |
| `commercial.deal_stage_history` | deal | EVIDENCE / PARENT | no | immutable stage movement |
| `commercial.client_accounts` | Platform owner org + `client_organization_id` | DIRECT RLS | yes | one active per client org |
| `commercial.client_relationships` | client account | PARENT RLS + FK | no or resource if independently actionable | unique active client+person+role; person/contact linkage valid |

Gate-A D01 is approved as Resolution A. The following tables are explicitly **not R6 tables** and remain R7-owned:

- `commercial.proposals`
- `commercial.proposal_versions`
- `commercial.proposal_acceptances`

They therefore have no R6 migration/RLS implementation and must be rejected by the R6 exclusion verifier.

## 5. Explicitly prohibited R6 tables

Under current release ownership R6 migrations must not add:

- commercial products/packages unless separately amended;
- contracts/contract versions/signers/signature events;
- invoices/invoice lines/credit notes;
- payments/allocations/refunds/ledger;
- member subscriptions;
- entitlements;
- R8 project/workflow production tables;
- R11 search/analytics/renewal implementation tables.

Contract qualification must compare changed schema/migration paths and fail if prohibited domains appear.

## 6. Tenant claim semantics

R6 Team runtime access uses the selected Team organization as owner organization claim.

A future Client projection never swaps Team owner organization with caller-provided client organization.

For client-safe access, trusted server code binds the selected Client organization and requires the resource/domain relationship to that client plus explicit shared/client-safe projection rules.

## 7. Runtime grants

The R6 migration must not simply grant broad DML to `perspective_runtime`.

Each R6 table needs a reviewed privilege decision:

- required SELECT;
- required INSERT/UPDATE via server transaction model;
- DELETE normally absent in favor of archive/history;
- no TRUNCATE;
- no schema ownership;
- no BYPASSRLS;
- no unrestricted evidence mutation.

If Prisma requires DML privileges under the restricted role, RLS and command repositories remain mandatory; direct SQL database tests must prove cross-tenant DML is denied.

## 8. Cross-tenant foreign keys

Application checks are insufficient for relationships that can be constrained structurally.

Where PostgreSQL cannot express same-tenant FK directly without redundant keys, R6 must use one of:

- composite tenant-aware unique/FK keys;
- transaction-time trusted invariant checks plus resource-envelope agreement;
- constraint triggers where justified and reviewed.

No relationship may rely on a browser-supplied owner organization value to “match” two records.

## 9. Resource atomicity

For resource-backed aggregates:

~~~text
domain insert/update
+ platform.resource insert/update
+ lifecycle/history
+ outbox if required
+ audit if required
= one transaction
~~~

If resource registration fails, domain mutation rolls back.

If business mutation is denied, no resource/outbox/history success residue may remain.

## 10. RLS qualification

Future R6 implementation qualification must enumerate actual database tables and compare them to this matrix.

Required attacks:

- no tenant claim;
- correct Team owner claim;
- foreign Team owner claim;
- Client claim against INTERNAL record;
- Client claim against CLIENT_SHARED record;
- cross-tenant direct UUID SELECT;
- cross-tenant UPDATE;
- cross-tenant INSERT relationship;
- child-table access attempting to bypass protected parent;
- direct runtime role against every DIRECT RLS table;
- evidence table mutation attempts where immutable;
- owner/migration connection not accepted as runtime proof.

A new R6 table missing from the qualification inventory is a blocking failure.

## 11. Migration verification

Every R6 migration package must ship a `verify.sql` or equivalent machine verifier proving:

- schemas exist;
- runtime role remains non-privileged/NOBYPASSRLS;
- expected RLS tables have ENABLE + FORCE;
- expected policies exist;
- required unique/check/FK/index invariants exist;
- evidence immutability exists where required;
- prohibited runtime privileges are absent;
- no R7 table was introduced.

## 12. Current state

No R6 tables exist at the authorized planning baseline.

That is an expected pre-implementation state, not a defect.

This matrix is design evidence only and does not authorize schema changes.
