# Phase 4 — R6 Resource Context & Field Policy

**Record:** P4-R6-RESOURCE-FIELD-01  
**Date:** September 27, 2026  
**Planning baseline:** `main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`  
**Status:** G0 CANDIDATE — R6 NOT ACTIVE  
**R6 implementation:** NOT AUTHORIZED

## 0. Purpose

R6 may not activate CRM/commercial permissions merely because the permission registry already contains R6 keys.

Every R6 authorization decision must be based on:

~~~text
trusted selected tenant
+ current R5 grant path
+ server-loaded R6 resource context
+ declared action family
+ explicit field policy
+ lifecycle/workflow policy
= ALLOW | DENY
~~~

Caller-supplied owner, tenant, department, assignment, lifecycle, version, client, consent, provenance, score, suppression or provider metadata is never authority.

## 1. Existing accepted resource envelope

R6 inherits `platform.resources`:

- `id`
- `resource_type`
- `owner_organization_id`
- `client_organization_id`
- `project_id`
- `visibility`
- `sensitivity`
- archive state

R6 domain aggregates that participate in resource policy register a resource row atomically with their domain row.

The generic resource envelope is necessary but not sufficient for R6 scope decisions. R6 trusted loaders must enrich it from domain-owned data such as owner membership, department, assignments, lifecycle state and row version.

## 2. Trusted R6 resource types

| Resource type | Trusted context required | Default visibility | Default sensitivity |
|---|---|---|---|
| `lead-source` | owner org, lifecycle/health | INTERNAL | CONFIDENTIAL |
| `extraction-job` | owner org, requester/owner membership, lifecycle, version | INTERNAL | CONFIDENTIAL |
| `staged-record` | owner org via job, lifecycle, source/provenance class | INTERNAL | PII |
| `enrichment-job` | owner org, target resource, lifecycle, version | INTERNAL | CONFIDENTIAL |
| `enrichment-fact` | owner org via target/job, lifecycle/accepted state | INTERNAL | PII |
| `company` | owner org, department if used, owner/assigned memberships, lifecycle, version | INTERNAL | STANDARD |
| `contact` | owner org, company, owner/assigned memberships, lifecycle, version | INTERNAL | PII |
| `lead` | owner org, department, owner/assigned memberships, lifecycle, version | INTERNAL | CONFIDENTIAL |
| `lead-list` | owner org, owner membership, department, lifecycle, version | INTERNAL | CONFIDENTIAL |
| `duplicate-candidate` | owner org, candidate resources, lifecycle | INTERNAL | CONFIDENTIAL |
| `suppression-entry` | owner org, channel, lifecycle/effective state | INTERNAL | PII |
| `sending-account` | owner org, owning team/member, lifecycle/health, version | INTERNAL | SECURITY |
| `message-template` | owner org, owner/team, lifecycle, version | INTERNAL | STANDARD |
| `outreach-campaign` | owner org, owner/team, audience/list, sender, lifecycle, exact version | INTERNAL | CONFIDENTIAL |
| `sequence` | owner org, owner/team, lifecycle, exact version | INTERNAL | STANDARD |
| `conversation` | owner org, assigned memberships, linked lead/deal/client, lifecycle, version | INTERNAL | PII |
| `message` | owner org via conversation, direction, visibility, immutable version/evidence | INTERNAL | PII |
| `meeting` | owner org, owner/attendee memberships, linked deal/client, lifecycle, version | INTERNAL | CONFIDENTIAL |
| `deal-pipeline` | owner org, department, version, lifecycle | INTERNAL | CONFIDENTIAL |
| `deal` | owner org, department, owner/assigned memberships, company/contact/lead links, lifecycle, version | INTERNAL | FINANCIAL |
| `client-account` | Platform owner org, client organization, AM/owner assignments, lifecycle, version | INTERNAL | CONFIDENTIAL |
| `client-relationship` | owner org + client organization through client account, lifecycle | INTERNAL | PII |
| `portal-access` | owner org + client org + target membership/person, lifecycle/version | INTERNAL | SECURITY |

`proposal` is not an active R6 resource type. Gate-A D01 is approved as Resolution A: proposal persistence/versioning/send/acceptance are R7-owned.

## 3. Resource loader rules

R6 trusted loaders must:

1. start from the selected R4 tenant context;
2. constrain the domain lookup to that tenant before returning metadata;
3. load the canonical `platform.resource`;
4. prove resource/domain owner organization agreement;
5. prove resource type matches the expected domain aggregate;
6. load server-owned owner/assignment/department/lifecycle/version fields;
7. return null/concealed result for foreign or nonexistent records;
8. never accept the caller's copy of ResourceContext as authoritative;
9. execute inside the same transaction used for sensitive mutations when stale authority could matter.

A mismatch between domain row and resource envelope fails closed and emits security evidence where appropriate.

## 4. Team field policy groups

Every R6 resource has concrete server-owned field groups. Constraint group names do not define their own field membership.

### 4.1 Lead source / extraction / enrichment

**public-business**
- display name;
- source type;
- health summary;
- safe provenance label;
- requested/processed counts;
- safe timestamps.

**internal-operations**
- query/configuration snapshot;
- reviewer/owner;
- job attempt state;
- normalized preview;
- confidence;
- dedupe candidate state;
- enrichment requested fields.

**pii**
- raw email/phone/contact destination;
- person identifiers;
- raw extracted personal fields;
- enrichment values classified as PII.

**restricted-provider**
- raw provider payload;
- source/provider internal IDs;
- request/response metadata;
- compliance notes requiring restricted visibility.

**security**
- credentials;
- credential references where sensitive;
- provider tokens/secrets;
- signature material;
- network-policy internals.

Security fields are never readable through ordinary CRM permissions.

### 4.2 Company

Readable candidate fields:
- id/resource ID;
- name/legal name;
- domain/website;
- industry;
- size/revenue bands;
- country;
- lifecycle/archive state;
- owner/assignment safe labels;
- safe activity summary.

Mutable candidate fields:
- approved business identity fields;
- ownership/assignment through explicit command;
- archive state through command.

Restricted:
- merge/dedupe internals;
- raw enrichment provenance;
- client conversion internals not needed for normal editing;
- audit/security metadata.

### 4.3 Contact

Readable candidate fields:
- id;
- person/company identity;
- title/relationship;
- preferred channel;
- masked contact information;
- consent/contactability status appropriate to actor;
- owner/assignment safe labels.

PII-restricted:
- normalized/raw email;
- phone;
- source/enrichment facts;
- consent evidence;
- suppression linkage.

Mutable fields must never include trusted organization/owner/suppression authority directly.

### 4.4 Lead

Readable operational fields:
- company/contact references;
- source/provenance summary;
- lifecycle;
- current score summary;
- qualification summary;
- owner/assignment;
- last activity.

Restricted:
- raw score components;
- raw provider payload;
- internal legal/compliance evidence;
- suppression hash/destination;
- audit data.

Mutable:
- allowed descriptive fields;
- owner/assignment through explicit command;
- notes/reference fields where contracted.

Lifecycle, score, qualification and conversion state change only through domain commands/evidence.

### 4.5 Lead list

Readable:
- id/name;
- static/dynamic type;
- safe filter summary;
- owner/team;
- member count derived from authorized membership;
- lifecycle.

Mutable:
- name/configuration;
- controlled member add/remove;
- archive.

Frozen campaign audience snapshots are immutable after launch approval.

### 4.6 Sending account

Ordinary readable:
- id;
- display address;
- display name;
- provider label;
- owner/team;
- health;
- sync state;
- safe send limits.

Never exposed:
- OAuth/access/refresh tokens;
- secret references where disclosure adds risk;
- SMTP/API credentials;
- webhook secrets;
- raw provider auth errors.

### 4.7 Campaign / sequence / template

Campaign readable:
- name;
- owner/team;
- audience/list reference;
- sequence reference;
- sender reference;
- schedule;
- lifecycle;
- KPI counters;
- exact frozen version/hash.

Campaign mutable:
- draft name/audience/sequence/sender/schedule until guarded state permits;
- pause/cancel only through actions.

Sequence/template:
- approved content/version metadata according to authority;
- no mutation of frozen version used by an approved/started campaign.

### 4.8 Conversation / message

Conversation readable:
- subject/channel;
- owner/assignment;
- linked lead/deal/client safe identifiers;
- lifecycle;
- participant safe projection;
- latest message summary.

Message field groups:
- external/shared message content;
- internal note;
- attachment metadata;
- PII participant addresses;
- provider metadata.

Internal notes can never enter client-safe/shared message projections.

### 4.9 Meeting

Readable:
- title/type;
- schedule/timezone;
- safe participant projection;
- linked deal/client;
- owner/attendee scope;
- lifecycle;
- location/link according to actor.

Restricted:
- internal notes;
- recording/transcript assets;
- provider internals;
- private participant data.

### 4.10 Deal

Readable Team candidate:
- company/contact/lead;
- pipeline/stage;
- owner/team;
- expected close;
- amount/currency where role policy allows;
- probability/forecast;
- lifecycle/history summary.

Restricted commercial:
- internal cost;
- margin;
- discount-exception evidence;
- private forecast notes;
- R7 contract/payment evidence.

Mutable:
- draft descriptive/commercial fields by `deal.edit`;
- assignment through explicit command;
- lifecycle only via `deal.move`.

### 4.11 Client account / relationships

Team readable:
- client organization;
- account manager;
- health/onboarding summary only to extent owned by R6;
- primary/billing/approver relationship labels;
- portal access status summary.

Restricted:
- client-user IAM internals;
- invitation/token material;
- other-client relationships;
- R7 billing/finance;
- R8 production internals.

## 5. Client-safe policy

R6 does not complete the R12 Client Portal.

However client-account conversion may create canonical records that later become Client projections.

Any R6 client-safe projection must be explicit and minimal.

Allowed foundation examples:
- client organization display identity;
- client relationship person's own safe display fields;
- portal invitation/access status;
- explicitly CLIENT_SHARED meeting/message/resource metadata where separately authorized.

Always omitted:
- prospect/lead lifecycle;
- lead score/qualification;
- extraction/enrichment/provenance;
- suppression/DNC internals;
- campaign/outreach internals;
- other contacts not shared;
- staff-only notes;
- sales forecast/margin/cost;
- sender/provider credentials;
- audit/security data;
- other clients.

Client surface permissions remain R12 except the already accepted R3/R12 identity operations. R6 Team-side `client.*` permissions do not grant Client Portal read authority.

## 6. Mutation authority fields

These fields are server-owned or command-owned and cannot be generic PATCH inputs:

- owner organization;
- client organization;
- resource type;
- sensitivity;
- trusted visibility transition;
- owner/assigned membership IDs;
- department authority;
- lifecycle/status;
- score;
- qualification disposition;
- suppression effective state;
- audience frozen hash;
- provider delivery outcome;
- message direction/provider event status;
- deal stage;
- immutable version/hash fields;
- audit/outbox evidence.

## 7. Missing context behavior

For a protected R6 permission:

- missing ResourceContext => DENY;
- mismatched resource type => DENY;
- missing trusted ownership/assignment fields required by scope => DENY;
- missing field policy when metadata requires one => DENY;
- unrecognized requested field => DENY;
- unrecognized field group constraint => DENY.

R6 may not repeat the R5 closure gap where policy behavior existed but executable proof was missing; each case must be directly tested from the first R6 qualification candidate.

## 8. G0 completion condition

Before P4-R6-G0 freeze:

- concrete field arrays must be generated for every implemented R6 projection;
- every R6 API/query must name a resource type and field policy;
- Client-safe projections must be separate serializers, not filtered Team objects;
- A16/A17/A22/A23/A24/A25/A61/A83 from the R6 threat model have mapped executable tests;
- no Proposal/Product/Package/Contract/Invoice/Payment R6 field policy exists;
- `template.manage` has no R6 mutation field policy under approved D15.
