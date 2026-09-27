# Phase 4 — R6 CRM & Commercial Engine Implementation Contract

**Contract:** P4-R6-G0  
**Version:** 0.1-planning-candidate  
**Date:** September 27, 2026  
**Planning baseline:** `main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`  
**Planning branch:** `phase4/r6-crm-commercial-g0-20260927`  
**Status:** DRAFT G0 CANDIDATE — PRODUCTION IMPLEMENTATION NOT AUTHORIZED  
**Depends on:** P4-R1-C1 through P4-R5-C1, V1 Master Completion Bible, frozen Phase-2C/2D/2E/2F  
**R7+:** LOCKED  
**Design 154:** NOT AUTHORIZED  
**V1.0 certification:** NOT AUTHORIZED

## 0. Mission

R6 materializes the existing canonical CRM/commercial architecture behind the frozen Team Workspace responsibilities.

R6 is not a UI redesign and not a second CRM.

The accepted direction is:

~~~text
frozen UI responsibility
 + Phase-2C canonical entities
 + Phase-2D canonical lifecycles
 + Phase-2F service/API contracts
 + accepted R1–R5 security/runtime architecture
 = production CRM/commercial domain behavior
~~~

R6 must preserve:

~~~text
authentication != tenant selection != authorization != domain workflow state
~~~

## 1. Inherited accepted architecture

R6 must preserve without weakening:

- `Organization` as durable tenant boundary;
- explicit selected `OrganizationMembership`;
- R3 session/MFA/invitation/recovery;
- R4 restricted runtime database role and tenant isolation;
- R5 exact permission registry and same-grant authorization paths;
- trusted server-side resource context;
- field/action/workflow/obligation policy;
- immutable/redacted authorization evidence;
- R5 default stage activation as fail-closed;
- forward-only reviewed migrations;
- server-only Prisma construction;
- `platform.resource` as cross-domain security/routing envelope;
- transactional outbox/idempotency/audit patterns established by accepted persistence.

R6 must use the accepted `src/modules` architecture.

## 2. Required companion records

This contract incorporates:

- `PHASE-4-R6-PLANNING-AUTHORIZATION.md`
- `PHASE-4-R6-PREDESIGN-AUDIT.md`
- `PHASE-4-R6-GATE-A-DECISIONS.md`
- `PHASE-4-R6-THREAT-MODEL.md`

Future Gate-B/falsification/qualification records become part of G0 only when created and qualified.

## 3. G0 blockers

P4-R6-G0 may not become frozen until:

1. Proposal release ownership D01 is explicitly resolved;
2. Email-template permission stage ownership D15 / R6-G02 is explicitly resolved;
3. R6 action-family authorization binding is specified for all activated R6 permissions;
4. all R6 resources have trusted ResourceContext definitions;
5. R6 field policies are defined for staff and any client-safe projections;
6. tenant/RLS policy inventory is complete for every new table;
7. lifecycle commands and guards are mapped to canonical Phase-2D states;
8. all applicable R6 threat cases map to executable qualification;
9. R7+ exclusions are machine-verifiable;
10. all BLOCKING/HIGH contract findings are closed;
11. exact G0 candidate SHA passes enhanced contract qualification;
12. owner explicitly freezes/accepts P4-R6-G0;
13. owner separately authorizes implementation.

Until item 13: **production R6 implementation is prohibited**.

## 4. Domain module ownership

When implementation is separately authorized, extend the accepted structure:

~~~text
src/modules/
  crm/
  communications/
  commercial/
~~~

### CRM module owns

- sources;
- extraction jobs / attempts;
- staged records;
- enrichment jobs/facts;
- companies;
- contacts;
- leads;
- lead scores;
- lead lifecycle history;
- lead lists/membership;
- qualifications;
- duplicate candidates;
- suppression/contactability.

### Communications module owns

- sending accounts;
- message templates/versions;
- outreach campaigns;
- sequence versions/steps;
- campaign recipients;
- delivery/provider evidence;
- conversations;
- participants;
- messages/internal notes;
- calls if implemented in R6;
- meetings/participants/notes.

### Commercial module owns — uncontested R6

- deal pipelines/versions;
- deal stages;
- deals;
- deal stage history;
- client accounts;
- client relationships;
- idempotent client conversion.

Gate-A D01 is OWNER-APPROVED as Resolution A. Proposal persistence/versioning/send/acceptance remain R7-owned and inactive in R6.

### Prohibited parallel architecture

Do not create a second `src/server/domains` stack merely because older Phase-2F prose showed that illustrative layout.

## 5. Database schema contract

R6 implementation may extend Prisma with logical PostgreSQL schemas:

- `crm`
- `comms`
- `commercial`

It must keep:

- `iam`
- `platform`
- `audit`

as accepted inherited schemas.

### 5.1 Common tenant envelope

Every tenant-scoped mutable R6 aggregate must carry or derive:

- owner organization;
- client organization when legitimately applicable;
- department when scopeable;
- assigned membership/owner where applicable;
- visibility;
- sensitivity;
- created/updated actor/time;
- row version or equivalent optimistic concurrency token.

Browser input cannot establish these authority fields.

### 5.2 Resource registration

Any aggregate that can receive authorization/resource policy, comments, files, activity, notifications, approvals, tasks or cross-domain links must have a canonical `platform.resource`.

Domain row + resource registration must be atomic.

### 5.3 RLS / database defense in depth

Every R6 tenant table must be classified:

- RLS required;
- system/evidence table with controlled access;
- child table whose tenant is proven through an RLS-protected parent.

Migration qualification must fail if a new R6 tenant table is absent from the RLS inventory.

### 5.4 Uniqueness and race safety

Database constraints must back application checks for, at minimum:

- canonical active company domain where policy allows;
- reviewed person/company contact identity;
- lead-list membership;
- provider/source record identity;
- active duplicate conversion key;
- campaign recipient identity;
- provider message/event IDs;
- pipeline stage key/position per version;
- idempotent lead→deal conversion;
- one active client account per client organization.

## 6. Initial entity set

### 6.1 CRM

Required candidate tables:

- `crm.lead_sources`
- `crm.extraction_jobs`
- `crm.staged_records`
- `crm.enrichment_jobs`
- `crm.enrichment_facts`
- `crm.companies`
- `crm.contacts`
- `crm.leads`
- `crm.lead_scores`
- `crm.lead_status_history`
- `crm.lead_lists`
- `crm.lead_list_members`
- `crm.qualifications`
- `crm.duplicate_candidates`
- `crm.suppression_entries`

### 6.2 Communications

Required candidate tables:

- `comms.sending_accounts`
- `comms.message_templates`
- `comms.message_template_versions`

Under owner-approved D15 Resolution A these tables are **read-only reference/catalog infrastructure during R6**:

- no R6 runtime create/edit/version/archive/publish command exists;
- `template.manage` remains `R6+` and dormant;
- R6 may select only an already-approved immutable version;
- any production baseline template/version must come from an explicitly reviewed immutable seed/import manifest included in the future implementation qualification, not from browser authority or a hidden admin path;
- if no approved immutable template version exists, campaign/sequence readiness fails closed;
- later template mutation requires its separately authorized owning release.
- `comms.outreach_campaigns`
- `comms.sequences`
- `comms.sequence_steps`
- `comms.campaign_recipients`
- `comms.message_deliveries`
- `comms.conversations`
- `comms.conversation_participants`
- `comms.messages`
- `comms.meetings`
- `comms.meeting_participants`
- `comms.meeting_notes`

### 6.2A D15 template persistence boundary

`comms.message_templates` and immutable template-version persistence may exist in R6 only as a reference/read boundary for already-approved versions.

R6 runtime commands may not create/edit/version/approve/archive templates because `template.manage` remains `R6+`.

If no approved immutable template version exists, campaign readiness fails closed. R6 must not synthesize placeholder content or silently activate `template.manage`.

### 6.3 Commercial — uncontested

Required candidate tables:

- `commercial.deal_pipelines`
- `commercial.deal_stages`
- `commercial.deals`
- `commercial.deal_stage_history`
- `commercial.client_accounts`
- `commercial.client_relationships`

Explicitly prohibited in R6 under approved D01:

- `commercial.proposals`
- `commercial.proposal_versions`
- `commercial.proposal_acceptances`

R7-owned contract/finance/subscription entities are prohibited in R6.

## 7. Canonical lifecycle contract

Persisted state names and transitions come from Phase-2D.

UI labels may not invent alternate persisted states.

### 7.1 Lead

R6 must support the canonical progression and guards for discovery/extraction/enrichment/qualification/outreach/contact/reply/interest/conversion.

DNC/suppression is a first-class safety state/event and must stop future dispatch.

Lead conversion is command-only and idempotent.

### 7.2 Extraction and enrichment

Retry appends attempt/evidence.

No retry overwrites prior provider/source outcome.

Enrichment facts are candidates until accepted by policy/authorized review.

### 7.3 Campaign

Draft/configuration may be edited through guarded commands.

Launch inputs are version-bound.

`outreach.launch` is required for approval/launch execution.

Dispatch rechecks safety at execution time.

### 7.4 Conversation

Inbound/outbound messages are immutable evidence.

Thread status transitions are command-driven.

Internal notes have explicit visibility and can never be projected as client messages.

### 7.5 Meeting

Schedule/reschedule/complete/cancel/no-show use command transitions.

Reschedule history is immutable.

### 7.6 Deal

Persist the canonical state vocabulary but enforce a release-owned command ceiling.

R6 cannot cross into states whose truth depends on R7 artifacts.

Under approved D01 Resolution A, transitions past `PROPOSAL_PREPARATION` remain dormant in R6.

### 7.7 Client conversion

Conversion is one explicit idempotent command.

It must not create project, contract, invoice or payment truth.

## 8. R5 authorization integration

### 8.1 Existing R6 vocabulary

R5 freezes 41 permission keys with historical `activationStage: "R6"`.

Gate-A D01 Resolution A narrows four proposal permissions to R7 production ownership without rewriting accepted R5 history.

Therefore the R6 candidate active subset is exactly **37** keys:

`41 historical R6-stage keys - proposal.view - proposal.edit - proposal.send - proposal.approve`.

R6 planning must reuse the accepted keys; do not create aliases merely for convenience.

### 8.2 Stage activation

Current default active stage is exactly `R5`.

Planning changes must not change that.

During separately authorized R6 implementation, activation must be server-owned and require both:

- `activeStages` contains R6; and
- the permission key appears in an explicit approved R6 active-permission allowlist.

The active allowlist is the 37-key subset defined above. Historical proposal keys do not activate in R6 even though their frozen metadata says R6.

R7+ remains inactive.

### 8.3 Mandatory action-family binding

Current R5 policy action binding is intentionally limited to:

~~~text
activationStage === "R5"
~~~

Therefore R6 implementation must extend authorization policy with an explicit R6 permission→allowed-action map before any R6 permission can become active.

No R6 permission may be activated if its action family is undeclared or if it is absent from the approved 37-key active-permission allowlist.

This is a G0 security requirement.

### 8.4 Candidate action families

The exact matrix must be frozen before implementation, but categories include:

- `lead.view`: read/view/list;
- `lead.discover`: discover/search/request-discovery;
- `lead.extract.run`: start/retry extraction;
- `lead.import.review`: review/approve/reject staged record;
- `lead.enrich`: request/accept enrichment;
- `lead.edit`: create/update/assign;
- `lead.review`: review;
- `lead.qualify`: qualify/disqualify;
- `lead.list.manage`: create/update/add/remove/archive list;
- `company.view/edit`;
- `contact.view/edit`;
- `campaign.view/manage`;
- `outreach.prepare`;
- `outreach.launch`;
- `sequence.manage`;
- `emailaccount.manage`;
- `reply.view/handle/assign`;
- `inbox.view`;
- `message.read/send`;
- `meeting.view/edit`;
- `deal.view/edit/move/manage`;
- client account/contact/portal permissions;
- proposal permissions remain dormant in R6 under approved D01.

### 8.5 ResourceContext

Every permission must map to a server-owned resource type and trusted fields.

Representative contexts:

- lead: org, department, owner membership, assigned memberships, sensitivity;
- company/contact: org + ownership/assignment + linked client only when legitimately converted;
- campaign: org, owner/team, audience/list resource;
- conversation: org, assigned membership, linked lead/deal/client;
- meeting: org, owner/participants, linked deal/client;
- deal: org, owner, assignments, company/contact/lead, client only after conversion;
- client account: platform owner org + client organization + account manager.

## 9. Field policy

Field policy must distinguish:

- internal provenance/raw provider data;
- PII/contact channels;
- suppression/legal-basis data;
- internal lead scoring components;
- company/contact public/business fields;
- internal notes;
- sender credentials/connection metadata;
- message content/attachments;
- deal internal forecast/value/cost;
- client-safe account/contact fields.

No Client Portal projection may receive prospecting history, internal lead scores, raw enrichment, other-client data, sender credentials or unrestricted commercial internals.

## 10. API contract

Use current accepted route/application layering:

~~~text
route handler
 -> parse + authenticated/tenant context
 -> R5/R6 authorization
 -> application command/query
 -> domain service
 -> repository transaction
 -> outbox/activity/audit
 -> projection
~~~

### 10.1 CRM endpoints

Candidate Phase-2F-compatible routes:

- `GET/POST /api/v1/workspace/lead-searches`
- `GET/POST /api/v1/workspace/extraction-jobs`
- `POST /api/v1/workspace/extraction-jobs/{id}/commands/start`
- `POST /api/v1/workspace/extraction-jobs/{id}/commands/retry`
- `GET /api/v1/workspace/extraction-jobs/{id}/staged-records`
- `POST /api/v1/workspace/staged-records/commands/approve`
- `GET/POST /api/v1/workspace/enrichment-jobs`
- `POST /api/v1/workspace/enrichment-jobs/{id}/commands/accept`
- `GET/POST /api/v1/workspace/leads`
- `GET/PATCH /api/v1/workspace/leads/{leadId}`
- `POST /api/v1/workspace/leads/{leadId}/commands/qualify`
- `POST /api/v1/workspace/leads/{leadId}/commands/convert`
- `GET/POST /api/v1/workspace/companies`
- `GET/PATCH /api/v1/workspace/companies/{companyId}`
- `GET/POST /api/v1/workspace/contacts`
- `GET/PATCH /api/v1/workspace/contacts/{contactId}`
- `GET/POST /api/v1/workspace/lead-lists`

Lifecycle state is never mutated through generic `PATCH status=...`.

### 10.2 Outreach / communications

Candidate routes:

- campaigns list/create/read/edit;
- submit/approve/launch/pause/cancel commands;
- sequence version routes;
- conversations list/detail;
- message send/internal-note commands;
- assign/snooze/resolve/reopen commands;
- meetings list/detail;
- reschedule/complete/cancel/no-show commands.

### 10.3 Deals / clients

Candidate routes:

- deals list/create/detail/update allowed draft fields;
- move-stage command;
- explicit conversion/client-account command;
- clients list/detail/contact relationships/access foundation.

`mark-won` must remain denied until all required owning-stage evidence exists.

### 10.4 Proposal routes

Gate-A D01 Resolution A is authoritative. Proposal persistence/versioning/send/acceptance routes are R7-owned. R6 proposal screens may remain prototype/readiness only and all proposal production permissions remain inactive.

## 11. Idempotency contract

Required idempotency keys for:

- lead→deal conversion;
- deal/client conversion;
- extraction start/retry;
- enrichment request/accept where side-effecting;
- campaign launch;
- outbound send;
- provider dispatch;
- inbound provider/webhook processing;
- any command that may be retried after timeout.

Same key + different normalized payload returns conflict.

Same key + same payload returns prior result without repeating side effect.

## 12. Outbox / worker contract

Business transaction writes domain state + required history + outbox atomically.

Workers:

- never grant authority;
- never trust message payload tenant/role claims;
- reload current business state;
- enforce dispatch-time safety;
- are idempotent;
- record attempt/outcome;
- never convert provider failure into business success.

## 13. Provider contract

Extraction/enrichment/sending/calendar provider adapters must expose narrow interfaces.

Provider outputs are untrusted evidence until normalized/validated.

Credentials are referenced from the accepted secret/integration boundary and never stored in R6 domain rows or client props.

Test adapters may be deterministic, but production code may not silently fall back to a fake-success adapter.

## 14. Canonical route binding

Screens 11–44 remain the approved responsibility.

At planning baseline, only 15/34 exact canonical route files exist.

When implementation is authorized:

- materialize missing canonical dynamic/list routes;
- reuse existing presentation components;
- resolve entities by canonical stable IDs/slugs from server data;
- unknown IDs return safe not-found/concealed behavior;
- hard-coded demo routes are removed, redirected or explicitly test-only;
- route files remain thin and do not own persistence.

## 15. Prototype-to-production rule

Existing hard-coded names, values, dates and statuses are demonstration content.

They must not seed production truth merely because they appear in the UI.

Production fixtures/seeds must be explicit, deterministic, development/test scoped and clearly separate from real tenant data.

## 16. R7 boundary

R6 must not implement or activate:

- contract lifecycle;
- signature/provider envelope truth;
- invoice issue/open/paid truth;
- payment/reconciliation/refund/ledger;
- subscriptions/entitlements;
- R7 provider side effects;
- R7 permissions.

Products/packages and Proposal are R7-owned under approved Gate-A D01 Resolution A.

## 17. R11/R12+ boundary

R6 does not claim:

- production global search/indexing;
- analytics/reporting;
- renewal/upsell engine;
- full Client Portal production completion;
- project/editorial production;
- broad automation platform completion.

It may emit future-compatible events without implementing those later releases.

## 18. Audit / evidence

Sensitive commands must produce durable evidence with:

- request ID;
- actor user/membership;
- selected organization;
- permission/action/resource decision;
- reason where required;
- before/after hashes or redacted diff;
- immutable lifecycle/history evidence;
- provider/event references where applicable.

Raw secrets/tokens/full provider credentials must never enter audit.

## 19. Qualification requirements

Before R6 acceptance, qualification must include:

### Schema/migration
- Prisma validate/generate;
- migration deploy/status/drift;
- tenant/RLS inventory verification;
- FK/unique/check constraints;
- resource registration atomicity;
- evidence immutability.

### Unit/domain
- every Phase-2D R6 transition/guard;
- invalid transition;
- stale version;
- DNC/suppression;
- dedupe;
- idempotency;
- action-family binding;
- field projections.

### Live PostgreSQL
- cross-tenant read/write attacks;
- RLS direct runtime-role attacks;
- duplicate conversion races;
- transactional rollback;
- history/outbox/audit atomicity.

### API
- 401/403/404 concealment;
- problem+json;
- optimistic concurrency;
- changed-payload idempotency reuse;
- pagination/count safety;
- no generic status mutation.

### Browser
- canonical routes;
- real server-backed records;
- foreign ID attacks;
- role/scope denial;
- DNC/launch guard behavior;
- client-safe projection;
- no prototype-only success.

### Provider/worker
- webhook signature;
- replay/dedupe;
- out-of-order events;
- provider failure;
- duplicate send;
- stopped campaign;
- DNC race.

Every applicable threat in P4-R6-THREAT-01 must have an executable disposition.

## 20. Implementation sequencing after future authorization

Only after G0 freeze + separate implementation authorization:

1. schema/migration + RLS/resource contracts;
2. repository primitives;
3. CRM core and negative DB tests;
4. communications persistence and safety;
5. deal/client conversion core;
6. authorization action/resource/field policy;
7. API commands/queries;
8. provider/outbox workers;
9. canonical route binding;
10. browser qualification;
11. adversarial falsification;
12. exact-head full qualification;
13. P4-R6-C1 owner acceptance;
14. controlled merge;
15. only then consider R7 authorization.

No progress-only commit may claim a stage complete.

## 21. Current disposition

~~~text
R1–R5: ACCEPTED
R6 planning: AUTHORIZED
R6 G0 candidate: DRAFT — GATE-A APPROVED
R6-G01 Proposal scope: CLOSED — D01 Resolution A
R6-G02 Template permission stage ownership: CLOSED — D15 Resolution A
R6 active-permission allowlist: 37 KEYS REQUIRED BEFORE ACTIVATION
R6 action-family binding: REQUIRED BEFORE ACTIVATION
R6 production implementation: NOT AUTHORIZED
R7+: LOCKED
Design 154: LOCKED
V1.0 certification: NOT AUTHORIZED
~~~
