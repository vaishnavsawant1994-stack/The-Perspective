# Phase 4 — R6 CRM & Commercial Engine Pre-Design Repository Audit

**Record:** P4-R6-AUDIT-01  
**Date:** September 27, 2026  
**Exact audit baseline:** `main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`  
**Planning authority:** P4-R6-AUTH-PLANNING-01  
**Status:** PRE-DESIGN AUDIT COMPLETE — G0 CONTRACT WORK ONLY  
**R6 production implementation:** NOT AUTHORIZED

## 0. Audit purpose

This audit answers one question before R6 design is frozen:

> What CRM/commercial architecture already exists as frozen requirement, accepted security foundation, UI responsibility, persistence contract, permission vocabulary, prototype behavior, and actual production code?

R6 must complete that architecture. It must not create a second CRM stack, promote mock UI into fake persistence, weaken R1–R5, or absorb R7+ work.

## 1. Authority and precedence used

The audit applied the V1 Master Completion Bible precedence:

1. V1 Master Completion Bible for release scope/order;
2. newest accepted Phase-4 checkpoints;
3. Phase-4 implementation contracts;
4. frozen Phase-2C entity/database/field architecture;
5. frozen Phase-2D workflow architecture;
6. frozen Phase-2E operational screen sequence;
7. frozen Phase-2F API/service architecture;
8. Phase-3 design responsibility;
9. route/audit documents;
10. current schema/migrations/tests/code as implementation evidence.

The current accepted implementation state supersedes older illustrative folder structures where the two conflict.

## 2. Master Bible R6 boundary recovered

The Master Bible release table states:

### R6 — CRM & Commercial Domain Engine

> Implement canonical companies, contacts, leads, provenance/enrichment, suppression, qualification, lists, outreach/conversation foundations, deals/pipeline, client-account conversion and service/API contracts.

The broader Master Bible CRM/commercial progression is:

~~~text
Lead
 -> Qualified
 -> Outreach
 -> Conversation
 -> Proposal
 -> Negotiation
 -> Deal
 -> Contract
 -> Payment
 -> Client
 -> Project/Publication
 -> Renewal/Upsell
~~~

The next release is explicitly:

### R7 — Contracts, Invoices, Payments, Subscriptions & Entitlements

> Implement products/packages, proposals, contracts/signatures, invoices, payment/reconciliation/refunds, member subscriptions and server-enforced entitlements.

### Audit finding R6-G01 — proposal release ownership contradiction

There is a real retained-source contradiction:

- the broad commercial progression contains Proposal before Contract;
- frozen Phase-2C places proposal entities in the commercial schema;
- frozen Phase-2D screens 38–40 place proposal behavior in the 35–44 Deals & Client CRM operational range;
- frozen Phase-2D deal progression includes proposal/negotiation before contract;
- R5 already contains four permissions with `activationStage: "R6"`:
  - `proposal.view`
  - `proposal.edit`
  - `proposal.send`
  - `proposal.approve`
- but the Master Bible release table explicitly assigns “proposals” to R7.

**Classification:** governance/scope contradiction; not a production defect.  
**Gate impact:** BLOCKS final P4-R6-G0 freeze until explicitly resolved.  
**Current conservative rule:** do not authorize proposal production implementation from planning ambiguity.

Contracts, signatures, invoices, payments, refunds, subscriptions and entitlements remain R7+ regardless of the proposal decision.

## 3. Frozen Phase-2C domain architecture

### 3.1 CRM / lead intelligence

Frozen entities include:

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

Frozen field architecture requires explicit organization ownership, provenance, dedupe review, consent/legal basis, immutable score/history evidence, and suppression safety.

### 3.2 Communication / outreach

Frozen entities include:

- `comms.sending_accounts`
- `comms.message_templates`
- `comms.message_template_versions`
- `comms.outreach_campaigns`
- `comms.sequences`
- `comms.sequence_steps`
- `comms.campaign_recipients`
- `comms.message_deliveries`
- `comms.conversations`
- `comms.conversation_participants`
- `comms.messages`
- `comms.calls`
- `comms.meetings`
- `comms.meeting_participants`
- `comms.meeting_notes`

Audience versions, provider IDs, reply state, message immutability, suppression, sender health and meeting history are canonical requirements.

### 3.3 Commercial core relevant to uncontested R6

Uncontested R6 commercial requirements include:

- `commercial.deal_pipelines`
- `commercial.deal_stages`
- `commercial.deals`
- `commercial.deal_stage_history`
- client-account conversion:
  - `commercial.client_accounts`
  - `commercial.client_relationships`

Potentially disputed for R6 due to R6-G01:

- `commercial.deal_products`
- `commercial.proposals`
- `commercial.proposal_versions`
- `commercial.proposal_acceptances`

Explicit R7+ floor:

- products/packages where governed by R7 stage ownership;
- contracts and contract versions/signers/signature events;
- invoices/lines/credits;
- payments/allocations/refunds/ledger;
- member subscriptions/entitlements.

## 4. Frozen Phase-2D lifecycle recovery

### 4.1 Lead

The retained workflow source includes the progression:

~~~text
NEW
 -> EXTRACTED
 -> ENRICHMENT_PENDING
 -> ENRICHED
 -> QUALIFICATION_PENDING
 -> QUALIFIED
 -> OUTREACH_READY
 -> CONTACTED
 -> REPLIED
 -> INTERESTED
 -> CONVERTED
~~~

With explicit terminal/side states including DNC/suppression/disqualification/nurture according to the canonical contract.

Required guards include:

- source/provenance before extraction acceptance;
- dedupe before canonical promotion;
- legal/contactability checks before outreach;
- owner/rubric before qualification;
- suppression check before audience eligibility;
- verified send evidence before CONTACTED;
- matched inbound evidence before REPLIED;
- positive-intent evidence before INTERESTED;
- idempotent deal conversion;
- DNC stops active and future outreach.

### 4.2 Extraction/enrichment

Extraction:

`QUEUED → RUNNING → PAUSED | COMPLETED | PARTIAL | FAILED | CANCELLED`

Enrichment:

`QUEUED → RUNNING → REVIEW_REQUIRED → ACCEPTED | PARTIAL | FAILED | CANCELLED`

Retry creates an attempt; it does not overwrite prior evidence.

### 4.3 Outreach

Campaign:

`DRAFT → READY → APPROVED → SCHEDULED → RUNNING → PAUSED → COMPLETED`

with exceptional `CANCELLED` / `FAILED`.

Launch requires:

- `outreach.launch`;
- frozen audience/version;
- sender health;
- suppression filtering;
- rate/schedule rules;
- approval;
- legal/consent checks.

Editing audience, sequence or sender after approval invalidates approval.

Campaign-recipient progression includes:

`QUEUED → SENT → DELIVERED → OPENED → CLICKED → REPLIED`

plus `BOUNCED`, `UNSUBSCRIBED`, `STOPPED`, `CONVERTED`.

Positive reply must stop remaining automated steps.

### 4.4 Conversation

`OPEN → PENDING_INTERNAL | WAITING_EXTERNAL → RESOLVED → REOPENED`

with irrelevant/spam threads archivable.

### 4.5 Meeting

`PROPOSED → SCHEDULED → CONFIRMED → COMPLETED | CANCELLED | NO_SHOW`

Rescheduling preserves immutable history.

### 4.6 Deal

Retained Phase-2D progression:

~~~text
QUALIFIED
 -> INTERESTED
 -> DISCOVERY_SCHEDULED
 -> DISCOVERY_COMPLETED
 -> PROPOSAL_PREPARATION
 -> PROPOSAL_SENT
 -> NEGOTIATION
 -> VERBAL_CONFIRMATION
 -> CONTRACT_SENT
 -> CONTRACT_SIGNED
 -> PAYMENT_PENDING
 -> WON
~~~

R6 may not implement R7-owned evidence merely to satisfy later deal states.

Therefore the R6 contract must define a stage ceiling so R6 cannot synthesize contract/payment truth.

## 5. Phase-2E operational UI mapping

Screens 11–44 are the primary R6-adjacent operational responsibility set:

- 11–22 Lead Discovery, Extraction & CRM;
- 23–34 Outreach, Inbox & Communication;
- 35–44 Deals & Client CRM.

Canonical frozen routes total: **34**.

At the exact audit baseline:

- exact canonical route files present: **15 / 34**;
- canonical route files absent: **19 / 34**.

The missing exact routes are mostly dynamic/list routes for which hard-coded demonstration routes currently exist, including lead/company/contact details, campaign/sequence details, conversation/meeting details, deal detail/pipeline, proposal detail/review, and client list/dynamic client routes.

This is a route-binding gap, not permission to create new screen designs.

### Required R6 UI rule

R6 implementation must bind the frozen screens to canonical server-projected data and commands.

It must:

- reuse the existing design/component responsibility;
- introduce canonical dynamic route wrappers where frozen routes require them;
- remove hard-coded identity as business authority;
- preserve demo/legacy paths only as controlled aliases/redirects or test fixtures;
- never duplicate a second CRM page family.

## 6. Current production persistence state

Current `prisma/schema.prisma` contains 30 models across the accepted foundation/security schemas.

Current schemas configured:

- `iam`
- `platform`
- `audit`

There are currently **no** persisted `crm`, `comms`, or `commercial` domain models.

Therefore the operational CRM/commercial screen content is not backed by canonical R6 persistence today.

### Required inheritance

R6 database work, when separately authorized, must extend the accepted PostgreSQL/Prisma architecture and migration discipline.

It must not replace it or introduce a second database.

## 7. Current API/service state

Current `src/app/api/v1` contains **16** route files.

They cover:

- authentication/session/MFA/recovery/invitation;
- R5 role and MembershipRole administration.

There are currently **zero R6 CRM/comms/commercial API routes**.

Frozen Phase-2F expects, among others:

CRM:
- lead searches;
- extraction jobs and staged-record approval;
- enrichment jobs and acceptance;
- leads + qualify/convert commands;
- companies;
- contacts;
- lead lists.

Outreach/communications:
- campaigns;
- campaign commands;
- sequence versions;
- conversations/messages/notes/assign/resolve;
- calendar/meeting actions.

Commercial:
- deals;
- move-stage/mark-won command boundary;
- proposal commands subject to R6-G01.

## 8. Current UI behavior classification

The relevant workspace route files are thin wrappers around large presentation components.

Representative findings:

- `src/app/app/sales/leads/page.tsx` renders `LeadCRM`;
- `src/app/app/deals/page.tsx` renders `DealsPipeline`;
- `src/app/app/deals/proposals/page.tsx` renders `ProposalLibraryScreen`;
- hard-coded client routes render existing client screen components.

Relevant workspace components:

- contain no Prisma access;
- contain no API fetch binding for CRM/commercial data;
- contain no persisted R6 application service calls;
- contain substantial hard-coded demo identity, dates, deal values and statuses;
- use client state for visual interaction in several screens.

**Classification:** design/prototype responsibility is substantially present; production business behavior is not.

R6 must preserve the UI responsibility while replacing demonstration truth with authorized server projections and commands.

## 9. Accepted module architecture

The accepted module rule is:

~~~text
foundation
 -> authentication / tenancy / authorization
 -> domain modules
 -> application commands / queries / APIs
 -> integrations / workers
 -> UI adapters
~~~

R6 must extend `src/modules`.

Expected ownership:

- `src/modules/crm`
- `src/modules/communications`
- `src/modules/commercial`

Potential helper boundaries may be introduced inside those modules, but R6 must not create the older Phase-2F illustrative parallel `src/server/domains` stack.

## 10. R5 authorization mapping recovered

R5 currently defines **41 permission keys with `activationStage: "R6"`**:

- campaign: view/manage;
- client: view/contact.manage/portal.manage/portal.provision;
- company: view/edit;
- contact: view/edit;
- deal: view/edit/move/manage;
- sending account/inbox;
- lead discovery/edit/enrich/extract/import/list/qualify/review/view;
- meeting view/edit;
- message read/send;
- outreach dashboard/prepare/launch;
- proposal view/edit/send/approve;
- reply view/handle/assign;
- sequence manage;
- source manage.

R5 default active stages remain exactly:

~~~text
R5
~~~

Therefore R6 vocabulary is currently dormant.

### Required R6 rule

Planning must not activate R6.

Future implementation must use server-owned R6 stage activation plus the approved 37-key active-permission allowlist only after:

- P4-R6-G0 is frozen;
- implementation is explicitly authorized;
- R6 resource/action/field policies exist;
- negative tests prove future/later-stage permissions remain dormant.

## 11. Tenant/security inheritance

Every R6 aggregate must participate in the accepted R4/R5 model.

At minimum:

- explicit `owner_organization_id`;
- optional client organization only when conversion/shared visibility legitimately exists;
- server-owned resource envelope;
- trusted assignment/ownership data;
- field projection policy;
- sensitivity/visibility classification;
- RLS or equivalent database defense-in-depth where applicable;
- no browser-supplied tenant/owner/role/scope authority;
- all sensitive mutation commands reauthorize in transaction;
- no count/list/export side channel around resource policy.

## 12. Resource registry

Phase-2C requires operational aggregates that participate in files/comments/tasks/activity/approval/authorization to register a `platform.resource`.

R6 must not invent text-polymorphic relationships in place of this registry.

Expected R6 resource-backed aggregates include at minimum:

- company;
- contact;
- lead;
- lead list;
- extraction/enrichment job where actionable;
- campaign;
- conversation;
- meeting;
- deal;
- client account;
- proposal excluded from active R6 resources under owner-approved D01 Resolution A.

## 13. Idempotency / concurrency / evidence

R6 planning must preserve:

- idempotent lead-to-deal conversion;
- idempotent client-account conversion;
- idempotent extraction/enrichment retries;
- idempotent send/provider commands;
- webhook/provider dedupe;
- optimistic concurrency on mutable collaborative records;
- immutable lifecycle/history rows;
- atomic business state + resource/activity/outbox/audit evidence for sensitive commands.

## 14. Primary findings

| ID | Finding | Classification | Gate impact |
|---|---|---|---|
| R6-G01 | Proposal is assigned to both R6-adjacent frozen contracts and Master-Bible R7 release text | Governance contradiction | CLOSED — owner-approved D01 Resolution A; R7 owns Proposal |
| R6-A01 | No CRM/comms/commercial Prisma domain models exist | Expected pre-R6 implementation gap | Contract input |
| R6-A02 | No R6 API endpoints exist | Expected pre-R6 implementation gap | Contract input |
| R6-A03 | R6 screens are prototype/static, not canonical persisted behavior | Expected pre-R6 implementation gap | Contract input |
| R6-A04 | 19/34 canonical screens 11–44 lack exact canonical route files | Route binding gap | Must close during authorized implementation |
| R6-A05 | Older Phase-2F folder layout differs from accepted R1–R5 `src/modules` architecture | Superseded implementation-layout detail | Use accepted modules |
| R6-A06 | 41 R6 permissions exist but are dormant under R5-only stage activation | Correct security state | Preserve until implementation |
| R6-A07 | R7 finance/contract UI prototypes already exist visually | Scope-creep risk | Must remain non-production in R6 |
| R6-A08 | Deal lifecycle references R7 contract/payment evidence | Cross-release lifecycle dependency | R6 needs explicit stage ceiling |
| R6-A09 | Client conversion exists in Master-Bible R6 and Phase-2C commercial entities | R6 requirement | Include |
| R6-A10 | Existing prototype values include business-looking money/status data | Fake-production risk | Must not be treated as durable truth |
| R6-G02 | Screen 27 requires template mutation but `template.manage` is frozen at activation stage `R6+`, not `R6` | Governance/registry-stage mismatch | CLOSED — owner-approved D15 Resolution A; mutation remains R6+ |
| R6-G03 | Current authorization policy action-family enforcement is intentionally R5-only; activating R6 without an R6 action map would omit that protection | Expected pre-R6 security implementation gap; no current exploit because R6 is dormant | R6 action/resource matrix defines G0 requirement; BLOCKS R6 activation until implemented and tested |
| R6-G04 | Four proposal permissions retain historical R6 stage metadata after D01 narrows production ownership to R7 | Scope/activation mismatch created by preserved historical metadata, not a current exploit | CLOSED AT CONTRACT LEVEL — R6 requires explicit 37-key active-permission allowlist in addition to active stage; implementation proof still required |

## 15. Audit conclusion

R6 does not require a new product concept.

The required architecture is already distributed across frozen contracts and UI responsibilities.

The correct R6 mission is:

> materialize canonical CRM/comms/deal/client-account persistence and guarded application behavior behind the existing operational UI, using accepted R1–R5 tenancy and authorization controls, while preventing R7 contract/finance truth from leaking backward into R6.

R6-G01 and R6-G02 are closed by explicit owner Gate-A approval. Remaining G0 blockers are completion/qualification of the contract package and closure of any BLOCKING/HIGH findings produced by contract falsification.

R6-G03 is not a current vulnerability: R6 permissions remain dormant. The G0 contract now requires explicit R6 permission→action/resource binding before R6 can ever be activated.

Production implementation remains prohibited.
