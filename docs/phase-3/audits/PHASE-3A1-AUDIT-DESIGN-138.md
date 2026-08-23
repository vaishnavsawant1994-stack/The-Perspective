# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 138 — System Audit Logs / Compliance Activity

Design 138 should become the **canonical Team Workspace system-audit inspection, compliance-evidence search, actor/action/resource traceability, privileged-change investigation, correlation analysis, and governed audit-export surface** built directly on the canonical Audit foundation established by **Design 039 — Audit Logs**.

Design 138 must **not create another audit-event store**. Design 039 already established the permanent platform boundary:

> **AuditEvent ≠ ActivityEvent ≠ ApplicationLog ≠ SecurityAlert ≠ Notification ≠ DomainEvent.**

Design 138 should therefore be treated as the **advanced system/compliance workspace over those exact canonical `AuditEvent` records**, with permission-safe querying, filtering, evidence inspection, historical actor/resource references, change summaries, correlation identifiers, and export where the frozen design includes it.

It must remain strictly separate from:

* Design 119 — Project Activity / Project Audit Timeline;
* Design 063 — Client Activity / Account History;
* Design 137 — Team Performance / Workload Analytics;
* Design 143 — System Notifications / Alert Rules;
* Design 147 — System Health / Status & Incident Management;
* operational application logs/telemetry;
* security monitoring events unless explicitly promoted into canonical AuditEvents.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **AuditEvent ≠ AuditSubjectReference ≠ ActorSnapshot ≠ AuditChangeSet ≠ DomainEvent ≠ ActivityEvent ≠ ApplicationLog ≠ SecurityEvent/Alert ≠ Incident ≠ Notification ≠ ComplianceQuery ≠ AuditExportArtifact ≠ AuditLogView.**

The central implementation rule is:

> **Design 138 reads immutable/append-oriented audit evidence; it does not edit history. Every AuditEvent must preserve who or what acted, what operation occurred, against which tenant/resource and exact subject/version where material, when it occurred, when it was recorded, how it was initiated, what material fields changed in a redacted/safe form, and which request/correlation/causation context connects it to surrounding operations. Filtering, search, export, and UI rendering must never change the canonical evidence or expose secrets.**

---

# 1. Classification

| Audit field                    | Classification                                                                                                                                                                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                  | **138**                                                                                                                                                                                                                      |
| **Canonical name**             | **System Audit Logs / Compliance Activity**                                                                                                                                                                                  |
| **Product area**               | Team Workspace / Governance / Audit & Compliance                                                                                                                                                                             |
| **User surface**               | **Authenticated Team Workspace**                                                                                                                                                                                             |
| **Screen class**               | Governance Workspace / Audit Investigation / Compliance Evidence Explorer                                                                                                                                                    |
| **Classification**             | **Canonical System Audit Inspection, Compliance Evidence & Privileged-Change Traceability Anchor**                                                                                                                           |
| **Primary purpose**            | Search and inspect authoritative AuditEvents across the platform, reconstruct sensitive actions and configuration changes, understand actor/resource/correlation context, and support governed compliance evidence workflows |
| **Canonical Audit foundation** | **Design 039 — Audit Logs**                                                                                                                                                                                                  |
| **Primary canonical entity**   | `AuditEvent`                                                                                                                                                                                                                 |
| **Subject relation**           | `AuditSubjectReference`                                                                                                                                                                                                      |
| **Historical actor context**   | `AuditActorSnapshot` / actor reference snapshot                                                                                                                                                                              |
| **Change evidence**            | `AuditChangeSet` / safe changed-field summary                                                                                                                                                                                |
| **Request correlation**        | `CorrelationId` / `CausationId` / request context                                                                                                                                                                            |
| **Activity boundary**          | Design 119 / Design 063                                                                                                                                                                                                      |
| **Notification boundary**      | Design 080 / Design 143                                                                                                                                                                                                      |
| **Security/Incident boundary** | Design 147                                                                                                                                                                                                                   |
| **Team analytics boundary**    | Design 137                                                                                                                                                                                                                   |
| **Automation dependency**      | Designs 141–142 may generate audit-worthy actions but remain separate Run domains                                                                                                                                            |
| **Integration dependency**     | Designs 139–140 may produce audit-worthy connection/config changes but remain separate Integration domains                                                                                                                   |
| **Authorization dependency**   | Design 037                                                                                                                                                                                                                   |
| **Organization context**       | Design 040 / 145                                                                                                                                                                                                             |
| **Audit read projection**      | `AuditLogView` / `AuditEventDetailView`                                                                                                                                                                                      |
| **Optional export artifact**   | Asset/FileVersion or governed generated export if frozen design supports export                                                                                                                                              |
| **Primary query service**      | `AuditQueryService`                                                                                                                                                                                                          |
| **Detail service**             | `AuditEventDetailQueryService`                                                                                                                                                                                               |
| **Audit writer**               | canonical platform `AuditEventWriter` / append pipeline                                                                                                                                                                      |
| **Redaction service**          | `AuditRedactionPolicy`                                                                                                                                                                                                       |
| **Subject resolver**           | `AuditSubjectResolver`                                                                                                                                                                                                       |
| **Actor resolver**             | `AuditActorResolver`                                                                                                                                                                                                         |
| **Correlation resolver**       | `AuditCorrelationResolver`                                                                                                                                                                                                   |
| **Export service**             | `AuditExportService` if frozen design exposes export                                                                                                                                                                         |
| **Parent shell**               | `InternalAppShell` — Design 001                                                                                                                                                                                              |
| **Auth**                       | Required                                                                                                                                                                                                                     |
| **Authorization**              | Active OrganizationMembership + strong audit/compliance permission scope                                                                                                                                                     |
| **Implementation priority**    | **Critical Security / Governance / Forensic Integrity / Compliance**                                                                                                                                                         |
| **Reuse level**                | **Platform-wide across every sensitive mutation domain**                                                                                                                                                                     |

Design 138 should answer:

> **“Who or what performed this material action, on which exact resource, in which organization, when did it occur, what changed, through which surface/integration/system process, what related operations share the same correlation context, and can the evidence be inspected/exported without exposing credentials or altering history?”**

Canonical architecture:

```text
Canonical platform mutations
        │
        ├── Users / Roles
        ├── Settings
        ├── CRM
        ├── Contracts / Finance
        ├── Projects
        ├── Publishing
        ├── Distribution
        ├── Reporting
        ├── Integrations
        └── Automation / Incidents
                 │
                 ↓
        Canonical AuditEventWriter
                 │
                 ↓
          Append-oriented AuditEvent
                 │
        ┌────────┼──────────┐
        ↓        ↓          ↓
      Actor    Subject    ChangeSet
        │        │          │
        └────────┼──────────┘
                 ↓
          Correlation / Causation
                 │
                 ↓
          Design 138 Audit UI
```

---

# 2. Reuse

## Design 039 remains the sole canonical Audit domain

This is the strongest Design-138 rule.

Design 138 must not introduce:

```text
ComplianceEvent
SystemAuditRecord
AdminHistory
SystemActivityLog
```

as competing evidence stores.

Correct:

```text
AuditEvent AE-100

same event visible through:
Design 039 foundation
Design 138 compliance workspace
source-specific audit summaries
```

---

## Design 039 and Design 138 are foundation vs advanced workspace

Design 039 established:

* canonical AuditEvent semantics;
* audit/governance boundaries;
* append-oriented evidence;
* tenant isolation;
* safe actor/change context.

Design 138 should deepen that foundation through:

* advanced filtering;
* system-wide inspection;
* exact resource context;
* compliance-oriented evidence presentation;
* correlations;
* export if present.

No separate write pipeline.

---

## `AuditLogView` ≠ `AuditEvent`

Permanent.

The UI projection may combine:

* event;
* actor snapshot;
* resource label;
* safe change summary;
* request/correlation context;
* source surface.

It remains a read projection.

---

## AuditEvent ≠ ActivityEvent

Critical.

### AuditEvent

> Governance evidence about a material action/change.

### ActivityEvent

> User-friendly operational history/timeline.

Example:

```text
Activity:
"Project was marked completed."

Audit:
actor membership OM-20
command Project.complete
project P-10
expected revision 14
result revision 15
request/correlation metadata
safe changed fields
```

These may originate from the same underlying command.

They are not the same record.

---

## Design 119 remains Project Activity authority

Project Timeline may show:

> Contract approved
> Project completed
> Asset uploaded

Design 138 may show the corresponding privileged/mutating audit evidence.

Do not make Design 119 a filtered copy of AuditEvents.

---

## Design 063 remains Client-safe Activity authority

Clients must never receive raw internal AuditEvents merely because a related Activity entry exists.

---

## AuditEvent ≠ DomainEvent

Permanent.

A DomainEvent drives system reactions.

AuditEvent records governance evidence.

Example:

```text
DomainEvent:
ContractSigned

AuditEvent:
system/provider callback validated signature request SR-10
transitioned Contract C-20 version v3
from ISSUED to EXECUTED
```

---

## AuditEvent ≠ ApplicationLog

Absolute.

Application logs answer:

> What did the software process do?

Audit answers:

> What material governed action occurred?

No stack traces, SQL, raw headers, tokens, or debug dumps should become normal AuditEvent payloads.

---

## AuditEvent ≠ observability telemetry

Permanent.

Metrics such as:

* request latency;
* queue depth;
* CPU usage;
* worker heartbeat;

belong to observability.

---

## AuditEvent ≠ Security Alert

Critical.

A security detector may generate:

> suspicious login rate.

That is not automatically an AuditEvent.

An AuditEvent may record:

> privileged role assignment changed.

If a security system consumes that event and creates an alert, the alert remains separate.

---

## AuditEvent ≠ Incident

Design 147 remains Incident authority.

Audit can provide evidence related to an Incident.

It cannot replace Incident lifecycle or remediation.

---

## AuditEvent ≠ Notification

Permanent.

Notification read/dismissal has no effect on audit evidence.

---

## AuditEvent ≠ employee productivity event

This boundary from Design 137 must remain absolute.

Counts of:

* audit actions;
* configuration changes;
* approvals;
* user operations;

must **not** become employee performance or workload scoring.

---

## Actor current profile ≠ historical actor evidence

Critical.

Suppose:

```text
Aug 1:
Jane Doe
role = Finance Admin

Sep 1:
role changed to Operations
```

An August AuditEvent should preserve enough historical actor context to reconstruct the August action.

Do not render historical evidence solely from current profile fields.

---

## Resource current name ≠ historical resource context

Similarly:

```text
Company "Acme Media"
later renamed "Acme Global"
```

Audit should keep stable canonical resource ID and, where needed, event-time display snapshot.

---

## Audit source surface ≠ authority

An action can originate from:

* Team Workspace;
* Client Portal;
* API;
* provider webhook;
* background scheduler;
* automation;
* system repair.

The originating surface is evidence.

Authorization/source-domain rules remain canonical.

---

# 3. Entities

## AuditEvent

Canonical append-oriented governance evidence.

Conceptually:

```text
AuditEvent
├── id
├── organizationId
├── eventType / actionKey
├── actorType
├── actorReference?
├── actorSnapshot?
├── subjectReferences[]
├── operation
├── outcome
├── occurredAt
├── recordedAt
├── sourceSurface
├── requestId?
├── correlationId?
├── causationId?
├── idempotencyKeyReference?
├── changeSet?
├── reason/context?
├── metadataSafe
└── schemaVersion
```

Exact schema belongs to Phase 3D.

---

## AuditEvent ID must be stable

Never use array position/time string as identity.

---

## ActorType

Audit must support more than human users.

Conceptually:

```text
HUMAN
SYSTEM
INTEGRATION
AUTOMATION
SERVICE
CLIENT_PORTAL_USER
```

Exact taxonomy Phase 3D.

---

## Human actor ≠ OrganizationMembership

The event may reference:

* User;
* OrganizationMembership;
* Portal membership;

depending on context.

Use exact historical relation.

---

## System actor

For scheduled or internal operations:

```text
actorType = SYSTEM / SERVICE
```

with explicit service identity.

Do not fabricate a human user.

---

## Automation actor

An AutomationRun may cause a mutation.

Audit should preserve:

```text
actorType = AUTOMATION
sourceRunId = AR-20
```

or equivalent correlation.

AutomationRun remains Design 141/142 authority.

---

## Integration actor

Provider webhook action should preserve:

* provider/integration identity;
* verified external event/reference;
* internal normalized actor context.

Never pretend it was performed manually.

---

## `occurredAt` ≠ `recordedAt`

Critical.

Example:

```text
provider action occurred:
10:00:00

platform recorded callback:
10:00:08
```

Both can matter.

---

## Audit action key

Prefer stable semantic values such as:

```text
role.assignment.changed
contract.version.issued
report.version.released
integration.connection.revoked
```

rather than UI labels.

Exact naming Phase 3D.

---

## Operation ≠ HTTP method

Permanent.

`POST` does not explain business meaning.

Audit should record semantic command/action.

---

## Outcome

Conceptually:

```text
SUCCEEDED
DENIED
FAILED
PARTIAL
```

where governance needs it.

Do not blindly audit every failed application request as a business AuditEvent.

Policy decides which attempts are meaningful.

---

## AuditSubjectReference

A single action can affect more than one resource.

Conceptually:

```text
AuditSubjectReference
├── auditEventId
├── subjectType
├── subjectId
├── subjectVersionId?
├── relation
└── displaySnapshot?
```

---

## Primary subject ≠ related subject

Example:

> ReportRelease RR-3 released ReportVersion RV-4 to Client C-10.

Possible references:

```text
primary:
ReportRelease RR-3

related:
ReportVersion RV-4
Client C-10
FileVersion FV-9
```

Do not flatten all IDs into metadata strings.

---

## Subject version reference

Critical for versioned domains:

* ContractVersion;
* ProposalVersion;
* ReportVersion;
* PublicationVersion;
* DraftVersion;
* ProofVersion.

Audit should identify the exact relevant version.

---

## AuditActorSnapshot

Historical safe context.

Conceptually:

```text
AuditActorSnapshot
├── displayNameAtTime?
├── organizationMembershipId?
├── authentication/source class
├── relevant role context?
└── immutable safe attributes
```

Do not snapshot unnecessary personal information.

---

## Current RoleAssignment ≠ event-time role context

Permanent.

Historical evidence must not infer past permissions from current roles.

---

## AuditChangeSet

Safe changed-field summary.

Conceptually:

```text
AuditChangeSet
├── changedFields[]
│   ├── semanticField
│   ├── oldValueSafe?
│   └── newValueSafe?
└── redactionPolicyVersion
```

---

## ChangeSet ≠ full object dump

Absolute.

Do not store every before/after object indiscriminately.

Reasons:

* secrets;
* privacy;
* massive payloads;
* accidental regulated data;
* retention burden.

---

## Secret values must never be written

Examples:

* passwords;
* session tokens;
* API keys;
* OAuth access/refresh tokens;
* provider secrets;
* signed URLs;
* encryption keys;
* payment credential payloads.

Correct audit:

> API key rotated.

Incorrect audit:

> old key = sk-... new key = sk-....

---

## Sensitive-data redaction

A centralized:

```text
AuditRedactionPolicy
```

should decide fields that are:

* stored;
* hashed/fingerprinted;
* masked;
* omitted.

Do not rely on UI hiding.

---

## Redaction occurs before persistence

Critical.

If secrets are already stored in AuditEvent then hidden in UI, the security failure already happened.

---

## Audit metadata

Should be allowlisted/typed where feasible.

Avoid arbitrary full request-body storage.

---

## CorrelationId

Allows several AuditEvents belonging to one user/business operation to be related.

Example:

```text
Won Deal Handoff
correlation = CORR-20

Audit events:
ClientRelationship created
Project created
Onboarding created
Portal invite prepared
```

They remain distinct events.

---

## Correlation ≠ causation

Permanent.

Several events can share a request/operation context without direct causal relationship.

---

## CausationId

Where useful:

```text
Domain event X
caused automation Y
caused mutation Z
```

can preserve chain semantics.

---

## RequestId ≠ CorrelationId

Permanent.

One business operation may span multiple HTTP requests/jobs.

---

## Audit schema version

Strongly recommended.

Historical audit data may span years.

A schema version helps parsers/renderers interpret old events safely.

---

## Compliance query

UI/query state:

```text
ComplianceQuery
```

may include:

* date range;
* actor;
* action;
* resource type;
* outcome;
* source surface;
* correlation.

It is not an AuditEvent.

---

## Saved filters

If frozen Design 138 supports saving filters:

treat as user/workspace query configuration.

They never alter audit evidence.

---

## AuditExportArtifact

If export exists in frozen design:

a generated export should preserve:

* exact query;
* generatedAt;
* requesting actor;
* result bounds/count;
* export format;
* integrity metadata.

Generated file can use Design-030 Asset/FileVersion infrastructure where appropriate.

Export artifact ≠ AuditEvent source truth.

---

# 4. Permissions

Design 138 should use especially strong authorization.

Conceptually distinguish:

```text
audit.read
audit.readSensitive
audit.search

audit.export

audit.viewActorContext
audit.viewChangeDetails
audit.viewCorrelation

audit.manageRetention
```

Only include management controls if they exist elsewhere/frozen product.

Exact permission identifiers belong to Phase 3D.

---

## Audit workspace access ≠ all AuditEvent access

Critical.

Events may involve:

* Finance;
* credentials/integrations;
* workforce;
* client data;
* authorization changes.

A user may need scoped audit access.

---

## Audit read ≠ source-domain read universally

Potentially, compliance officers may need audit metadata without full access to the source record.

This must be explicit.

---

## Audit read ≠ sensitive change-detail read

Permanent.

A user may see:

> Billing settings changed.

without seeing all financial details.

---

## Audit summary ≠ secret visibility

Absolute.

No audit permission should reveal secrets that should never have been persisted.

---

## Actor visibility may be scoped

Some audit records may expose actor identity only to appropriate governance roles.

Do not overexpose unnecessary workforce information.

---

## Resource deep links reauthorize

Absolute.

Audit access to an event does not grant permission to open:

* Contract;
* Invoice;
* Client;
* Project;
* Integration;

source record.

---

## Audit export ≠ Audit read

Critical.

Bulk export creates higher disclosure risk.

Use separate permission.

---

## Export must apply the same or stricter row/field authorization

Never:

> UI hides sensitive rows, export includes them.

---

## Cross-tenant audit access prohibited

Absolute.

---

## Organization administrator ≠ automatic global audit permission

Design 037 remains authority.

---

## Job title ≠ compliance access

Permanent.

---

## Integration administrator ≠ all-system audit access

Permanent.

---

## Client Portal access ≠ internal audit access

Absolute.

Design 138 is internal Team Workspace.

---

## Counts/facets permission-safe

If filters show:

> Role Changes 82
> Finance Changes 40

counts must not disclose restricted event volumes.

---

## Direct AuditEvent IDs reauthorize

Absolute.

---

## Correlation chain access

Each related AuditEvent must still satisfy authorization.

A correlation ID cannot become a bypass to view hidden events.

---

# 5. States

Design 138 must keep **event outcome, evidence availability, redaction state, actor resolution, subject resolution, export state, and source availability** separate.

### Audit event outcome

Conceptually:

```text
Succeeded
Denied
Failed
Partial
Unknown
```

where applicable.

### Actor resolution

```text
Resolved
Historical
Deleted/Deactivated
System Actor
Unavailable
```

### Subject resolution

```text
Available
Historical
Archived
Deleted/Purged Reference
Restricted
Unavailable
```

### Evidence/change details

```text
Available
Redacted
Partial
Unavailable
```

### Export

```text
Not Started
Generating
Ready
Failed
Restricted
```

These must never collapse into one `audit_status`.

---

## Actor deactivated ≠ AuditEvent invalid

Absolute.

---

## Source entity archived ≠ AuditEvent archived

Permanent.

---

## Source entity deleted/purged under policy ≠ AuditEvent deleted automatically

Audit retention and source retention are separate governance concerns.

Exact retention policy Phase 3D.

---

## Subject unavailable ≠ event unavailable

Permanent.

Audit can preserve historical evidence even when current source record no longer exists.

---

## Redacted ≠ missing

Critical.

Correct:

> Value redacted by policy.

Not:

> No value.

---

## No ChangeSet ≠ no action

Permanent.

Some actions may be:

* download;
* export;
* permission check;
* release;
* login/security operation;

without a meaningful field diff.

---

## Failed action ≠ successful mutation

Absolute.

---

## Denied action ≠ source state changed

Absolute.

---

## Partial action ≠ full success

Permanent.

---

## Audit query empty ≠ no system activity universally

It means:

> no authorized events matching this query.

---

## Audit service unavailable ≠ no events

Absolute.

---

## Correlation incomplete ≠ action independent

Could reflect:

* missing permissions;
* retained evidence boundaries;
* unavailable related service.

Do not infer.

---

## State Coverage

Design 138 inherits Design 150 plus:

```text
Audit Workspace Loading
Audit Workspace Available
Audit Workspace Empty
Audit Workspace Restricted
Audit Workspace Partial
Audit Workspace Unavailable

Audit Event Available
Audit Event Restricted
Audit Event Historical
Audit Event Partially Resolved

Actor Resolved
Actor Historical
Actor Deactivated
Actor System
Actor Integration
Actor Automation
Actor Unavailable

Subject Available
Subject Historical
Subject Archived
Subject Restricted
Subject Unavailable

Change Details Available
Change Details Redacted
Change Details Partial
Change Details Unavailable

Audit Outcome Succeeded
Audit Outcome Denied
Audit Outcome Failed
Audit Outcome Partial
Audit Outcome Unknown

Correlation Available
Correlation Partial
Correlation Restricted
Correlation Unavailable

Export Not Started
Export Generating
Export Ready
Export Failed
Export Restricted

Audit Data Updated
Permission Updated
Actor Metadata Updated
Source Resource Changed
Audit Projection Stale
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize:

1. time;
2. actor;
3. semantic action;
4. affected resource;
5. outcome;
6. source surface;
7. correlation/change evidence.

Conceptually:

```text
System Audit Logs
↓
Time / Actor / Action / Resource / Outcome
↓
AuditEvent AE-100

Actor:
Jane Doe

Action:
Role assignment changed

Subject:
Membership OM-20

Change:
Role: Editor → Admin

Occurred:
10:31:04

Source:
Team Workspace

Correlation:
CORR-200
```

Only fields/controls present in frozen Design 138 should render.

---

## Semantic action should dominate HTTP/technical metadata

Better:

> Integration connection revoked.

Not:

> DELETE /api/integrations/32.

Technical identifiers can remain secondary evidence.

---

## Actor class should be obvious

Examples:

> Human
> System
> Automation
> Integration

This helps compliance investigation.

---

## Historical actor state should be preserved

Example:

> John Lee — deactivated membership

instead of hiding the actor because the account is inactive.

---

## Change presentation should be safe

For normal configuration values:

> Notification preference: Enabled → Disabled

For secrets:

> API credential rotated

not the old/new credential.

---

## Redacted information should be explicit

Use:

> Redacted

rather than blank values.

---

## Correlation should allow investigation without becoming clutter

If the frozen design has an event detail drawer/panel, related events can appear there.

Do not create new page architecture during this audit.

---

## Filters

If present, canonical filters can map to:

* period;
* actor;
* action;
* subject type;
* source;
* outcome.

Filtering remains server-side for scale/security.

---

## Tablet

Following Design 152:

* time/action/resource remain primary;
* actor/outcome remain visible;
* technical/correlation/change details collapse into expandable detail;
* filters compress into responsive controls.

---

## Mobile

Priority:

```text
Action
↓
Resource
↓
Actor
↓
Occurred time
↓
Outcome
↓
Safe change summary
↓
Correlation / technical evidence
```

Do not force a desktop audit table horizontally across a phone.

---

## Mobile audit item

Conceptually:

> Role assignment changed
> Maya Patel
> Member: John Lee
> Editor → Admin
> 10:31 AM
> Success

---

## Accessibility

An event could communicate:

> Audit event AE-100. Human actor Maya Patel changed the role assignment for organization membership OM-20 from Editor to Admin at 10:31 AM. The operation succeeded. The event belongs to correlation CORR-200. Sensitive authentication details were excluded by audit-redaction policy.

where authorized evidence supports it.

---

# 7. Backend Requirements

## Canonical audit architecture

```text
Canonical commands / mutations
        ↓
Business transaction
        ↓
AuditEventWriter
        ↓
Safe normalization
        ↓
Redaction policy
        ↓
Append-oriented AuditEvent store
        ↓
Audit read/index projection
        ↓
Design 138
```

---

## AuditEventWriter

One centralized platform capability should capture governed audit evidence.

Source services should submit typed semantic audit inputs.

Avoid each feature manually constructing arbitrary text audit blobs.

---

## Typed write contract

Conceptually:

```text
writeAuditEvent({
  organizationId,
  actionKey,
  actor,
  subjects,
  outcome,
  occurredAt,
  correlationId,
  causationId,
  safeChangeSet,
  safeMetadata
})
```

Exact API Phase 3D.

---

## Audit capture should align with transaction truth

Critical.

For material state changes:

the AuditEvent should correspond to the committed business action.

Avoid:

```text
write "Contract Signed"
↓
database transaction fails
```

leaving false success evidence.

Use transaction/outbox coordination.

---

## Audit event generation ≠ UI request logging

Permanent.

Audit should originate from canonical commands/domain transitions, not merely button clicks.

---

## Audit on denied/failed actions

Policy-driven.

Sensitive attempts such as:

* privilege escalation;
* forbidden admin operation;
* failed credential changes;

may warrant Audit/Security evidence.

But ordinary validation failures should not flood the canonical audit store.

---

## Audit action registry

Strongly recommended:

```text
AuditActionRegistry
```

defines:

* stable action key;
* owning domain;
* expected subject types;
* severity/sensitivity class;
* allowed ChangeSet fields;
* retention class where governance defines it.

No arbitrary free-form action taxonomy.

---

## Schema validation

Audit write payloads should be validated.

Reject/strip:

* unexpected metadata;
* secrets;
* huge payloads.

---

## Redaction before persistence

Absolute.

Architectural flow:

```text
source change
   ↓
safe semantic diff
   ↓
redaction policy
   ↓
AuditEvent persistence
```

Never:

```text
store raw object
   ↓
hide secrets in frontend
```

---

## Safe diffs

Use field allowlists per domain.

Example:

For RoleAssignment:

```text
roleId:
old → new
```

For Integration:

```text
connection state:
CONNECTED → REVOKED
```

but never credential bodies.

---

## Object dumps prohibited

Do not serialize entire Prisma entities/request bodies into AuditEvent JSON automatically.

---

## Encryption

Audit storage at rest follows platform data-security policy.

But encryption does not replace redaction.

---

## Append-oriented immutability

Normal users/admins should not have CRUD endpoints:

```text
PATCH /audit/:id
DELETE /audit/:id
```

for rewriting history.

Any retention/purge mechanism must be separate governance infrastructure, not arbitrary user editing.

---

## Database privileges

The audit persistence path should be more restrictive than ordinary application CRUD where practical.

---

## Tamper evidence

For stronger governance, the backend may preserve:

* immutable IDs;
* insert-only semantics;
* integrity hashes/chaining/checksums;
* protected storage.

Exact implementation belongs to Phase 3D/security architecture.

Do not claim blockchain or overengineer without need.

---

## Audit event ordering

Do not rely solely on timestamp.

Use:

* stable event IDs/sequences;
* occurredAt;
* recordedAt;

for deterministic ordering.

---

## Clock issues

System services can have timestamp skew.

`recordedAt` should be server-controlled.

External `occurredAt` must be validated/qualified.

---

## Provider event timestamps

Never blindly trust arbitrary external times as ordering authority.

---

## Actor resolution

`AuditActorResolver` should return:

* historical snapshot;
* current canonical reference where allowed;
* active/deactivated status;

without rewriting historical identity.

---

## Subject resolution

`AuditSubjectResolver` can provide current labels/state as supplementary context.

Historical subject identity remains stable.

---

## Current label ≠ historical label

UI can display:

> Acme Global (formerly Acme Media at event time)

if evidence exists.

Do not replace event-time context.

---

## Correlation resolver

Conceptually:

```text
getRelatedAuditEvents(
    correlationId,
    currentMembership
)
```

must reapply authorization for each event.

---

## Correlation depth

Bound queries.

Do not recursively load unlimited causal graphs on initial page load.

---

## Search/index

Audit datasets may become very large.

Use indexed fields such as:

```text
organizationId
occurredAt
actor reference
actionKey
subjectType
subjectId
outcome
correlationId
sourceSurface
```

according to Phase 3D design.

---

## Full-text search

If frozen Design 138 supports search:

search only safe indexed fields.

Do not index redacted/secret content.

---

## Query service

Conceptually:

```text
searchAuditEvents(
    timeRange,
    filters,
    sort,
    cursor,
    currentMembership
)
```

should:

1. authenticate;
2. resolve tenant;
3. resolve audit authorization scope;
4. apply row/field permissions;
5. validate bounded time range/query complexity;
6. query canonical audit index/store;
7. resolve safe actor/subject labels;
8. return cursor and evidence-availability state.

---

## Time range

Default searches should be bounded for performance.

Historical broad searches may need explicit time bounds or asynchronous export where frozen functionality permits.

---

## Pagination

Use stable cursor pagination.

Avoid offset pagination for huge audit stores where possible.

---

## Counts/facets

Permission-filtered before computation.

---

## Detailed event query

Conceptually:

```text
getAuditEventDetail(
    auditEventId,
    currentMembership
)
```

returns only:

* allowed actor context;
* allowed subject references;
* allowed ChangeSet fields;
* safe metadata;
* authorized correlation links.

---

## Field-level permission/redaction

Some sensitive AuditEvents may require:

```text
event visible
+
change details restricted
```

This state should be representable.

---

## Export

If present:

```text
requestAuditExport(query, format)
```

should:

1. authorize export;
2. freeze exact query/filter boundaries;
3. execute with same row/field restrictions;
4. generate safe artifact;
5. record export actor/time/query;
6. provide protected download;
7. emit its own AuditEvent where appropriate.

---

## Audit export should itself be auditable

Because bulk compliance exports are sensitive.

This is a legitimate recursive-but-controlled use.

---

## Export does not include raw secrets

Absolute.

---

## Export result count

Should reconcile with the authorized frozen query scope used for export, not an unfiltered organization-wide count.

---

## Retention

Audit retention should be policy-driven and distinct from:

* Activity retention;
* application-log retention;
* source-domain deletion.

Exact periods belong to Phase 3D/security/compliance requirements.

---

## Source deletion

If a source entity is purged under valid policy:

AuditEvent may retain:

* stable subject reference;
* safe historical descriptor;

according to retention policy.

It must not break query integrity.

---

## User deletion/deactivation

Same principle.

Historical actor evidence remains according to governance requirements without retaining unnecessary personal data indefinitely.

---

## GDPR/privacy-style concerns

Do not make AuditEvents an excuse to retain arbitrary personal data forever.

Retention, minimization, and redaction remain explicit policies.

---

## Automation integration

Designs 141/142 may cause AuditEvents for:

* automation definition edits;
* manual retry;
* cancellation;
* privileged overrides.

Routine step telemetry belongs to Automation run logs, not global AuditEvent spam.

---

## Integration audit

Designs 139/140 should produce canonical AuditEvents for sensitive events such as:

* connection created;
* credential rotated;
* connection revoked;
* configuration changed.

Credential values never appear.

---

## Permission audit

Design 144/037 should produce strong evidence for:

* role created/changed;
* permission assignment changed;
* privileged user added/removed.

Again, exact safe diffs.

---

## API/Webhook audit

Design 146 may audit:

* API key created;
* key revoked;
* webhook created/disabled;

without secret values.

---

## Global Settings audit

Design 149 may audit privileged configuration changes.

---

## Incident relationship

Design 147 can reference AuditEvents as investigation evidence.

Incident does not mutate AuditEvent.

---

## Team Analytics prohibition

Design 137 cannot consume AuditEvent volume as employee productivity by default.

This should be enforced architecturally/documented.

---

## Activity projection

Some AuditEvents may also result in user-friendly Activity events.

Do not automatically expose all AuditEvents into Activity feeds.

---

## Idempotency

Audit event generation tied to an idempotent business command should not duplicate evidence on command retry.

Potential strategy:

```text
businessOperationId
+
auditActionKey
```

or equivalent uniqueness where applicable.

---

## Duplicate AuditEvents

Do not globally dedupe legitimate repeated actions.

Example:

Two separate exports should produce two audit records.

Deduplication must be operation-aware.

---

## Concurrency

Concurrent changes to same resource produce distinct AuditEvents preserving:

* revisions;
* order/correlation;
* actor.

---

## Revision evidence

Where source domain is revisioned:

record:

```text
previousRevision
newRevision
```

where useful and safe.

---

## Caching

Audit list cache should vary by:

```text
organizationMembershipId
authorizationRevision
query
cursor
auditIndexRevision / query freshness
field-redaction policy revision
```

But highly sensitive audit searches may warrant conservative caching.

---

## Export caching

Do not reuse an export artifact across different users/scopes unless authorization semantics explicitly permit it.

---

## Performance

Use:

* append-optimized storage;
* partitioning/time-range indexing;
* stable cursor pagination;
* dedicated read indexes;
* async export for large result sets if present;
* lazy event detail/correlation loading.

Avoid hydrating full source entities for each audit row.

---

## Partitioning

AuditEvent volume will grow platform-wide.

Phase 3D should consider:

* tenant/time partitioning;
* archival tiers;
* retention-aware indexes.

---

## No N+1 actor/resource queries

Use safe batched resolution/read projections.

---

## Partial failure contract

Example:

```text
Audit events       ✓
Current actor data ✕
```

Correct:

> Audit evidence remains available; current actor profile cannot be loaded. Historical actor snapshot is shown where available.

Incorrect:

> Unknown action.

Another:

```text
AuditEvent         ✓
Source entity      purged/unavailable
```

Correct:

> Historical audit evidence remains available. Current source record is unavailable.

Not:

> Audit record broken.

Another:

```text
Event              ✓
ChangeSet          redacted by policy
```

Correct:

> Action and subject are available; sensitive change details are redacted.

Not:

> No changes occurred.

Another:

```text
Audit service      unavailable
```

Correct:

> Audit evidence cannot currently be queried.

Not:

> No audit activity.

---

## Backend Requirement Matrix

| Requirement                                           | Status                        |
| ----------------------------------------------------- | ----------------------------- |
| Design 039 canonical AuditEvent reuse                 | **Critical**                  |
| No second audit/compliance event store                | **Critical**                  |
| AuditLogView/AuditEvent separation                    | **Critical**                  |
| AuditEvent/ActivityEvent separation                   | **Critical**                  |
| AuditEvent/DomainEvent separation                     | **Critical**                  |
| AuditEvent/ApplicationLog separation                  | **Critical**                  |
| AuditEvent/Observability separation                   | **Critical**                  |
| AuditEvent/SecurityAlert separation                   | **Critical**                  |
| AuditEvent/Incident separation                        | **Critical**                  |
| AuditEvent/Notification separation                    | **Critical**                  |
| AuditEvent/workforce-performance separation           | **Critical**                  |
| Human/System/Integration/Automation actor distinction | **Critical**                  |
| Historical actor-context preservation                 | **Critical**                  |
| Stable subject references                             | **Critical**                  |
| Exact versioned subject references                    | **Critical**                  |
| Primary/related subject separation                    | **Critical**                  |
| occurredAt/recordedAt separation                      | **Critical**                  |
| Semantic action/HTTP method separation                | **Critical**                  |
| Correlation/Causation separation                      | **Critical**                  |
| Correlation/Request ID separation                     | **Critical**                  |
| Safe ChangeSet model                                  | **Critical**                  |
| No full object/request dumps                          | **Critical**                  |
| Secret exclusion before persistence                   | **Critical**                  |
| Central redaction policy                              | **Critical**                  |
| Append-oriented immutable evidence                    | **Critical**                  |
| Transaction/outbox-aligned audit writes               | **Critical**                  |
| Schema-versioned AuditEvents                          | **Critical**                  |
| Actor/subject resolver does not rewrite history       | **Critical**                  |
| Permission-safe audit querying                        | **Critical**                  |
| Field-level redaction/access                          | **Critical**                  |
| Permission before counts/facets                       | **Critical**                  |
| Cross-tenant isolation                                | **Critical**                  |
| Correlated event reauthorization                      | **Critical**                  |
| Stable cursor pagination                              | **Critical**                  |
| Time-range/index strategy                             | **Critical performance**      |
| Audit export separate permission                      | **Critical if export exists** |
| Export itself auditable                               | **Critical if export exists** |
| Retention separate from Activity/log retention        | **Critical architecture**     |
| Source deletion does not corrupt audit history        | **Critical**                  |
| Idempotent operation-aware audit generation           | **Critical**                  |
| Designs 139–149 sensitive-change reuse                | **Critical architecture**     |
| Partial dependency failure handling                   | **Critical**                  |

---

# 8. Consolidation

Design 138 creates severe governance risk if implemented as a generic `"system activity"` table receiving arbitrary JSON from every feature.

**Design 039 / Design 138 Audit duplication**
Two audit stores disagree.

**AuditLogView / AuditEvent conflation**
UI projection becomes evidence authority.

**AuditEvent / ActivityEvent conflation**
User timeline becomes compliance record.

**AuditEvent / DomainEvent conflation**
Business event bus becomes forensic history.

**AuditEvent / ApplicationLog conflation**
Stack traces/debug data pollute governance evidence.

**AuditEvent / observability telemetry conflation**
CPU/latency events appear as user actions.

**AuditEvent / SecurityAlert conflation**
Detection state and evidence merge.

**AuditEvent / Incident conflation**
System remediation lifecycle becomes audit history.

**AuditEvent / Notification conflation**
Read/dismiss actions affect evidence.

**AuditEvent / employee productivity conflation**
Compliance volume becomes performance scoring.

**Human actor / system actor conflation**
Scheduled/automated changes are attributed falsely.

**Integration actor / human actor conflation**
Provider webhook appears manually executed.

**User / OrganizationMembership / Portal membership conflation**
Actor context becomes ambiguous.

**Current actor profile / historical actor snapshot conflation**
Past evidence changes when user profile changes.

**Current RoleAssignment / event-time role context conflation**
Historical authorization cannot be reconstructed.

**Current resource name / event-time context conflation**
Old events display rewritten historical meaning.

**Audit action / HTTP method conflation**
`POST` becomes business semantics.

**Action label / action identity conflation**
UI copy changes event taxonomy.

**occurredAt / recordedAt conflation**
External-event timing and platform ingestion lose distinction.

**RequestId / correlationId conflation**
Multi-step business operations cannot be traced.

**Correlation / causation conflation**
Related events are treated as causal.

**Primary subject / related subject conflation**
Complex mutations lose resource lineage.

**Subject entity / subject version conflation**
Audit says Contract changed but cannot identify ContractVersion.

**ChangeSet / full object snapshot conflation**
Secrets and unnecessary personal data are stored.

**UI redaction / persistence redaction conflation**
Secrets remain in DB despite being hidden visually.

**Encryption / redaction conflation**
Encrypted secrets are still unnecessary audit retention.

**Metadata / raw request body conflation**
Passwords/tokens/request internals leak.

**Audit schema / arbitrary JSON conflation**
Events cannot be validated or migrated.

**Append-only / admin-editable conflation**
Administrators can rewrite evidence.

**Retention / manual deletion conflation**
Compliance policy becomes arbitrary CRUD.

**Source entity deletion / AuditEvent deletion conflation**
Historical evidence disappears.

**User deactivation / actor disappearance conflation**
Past events become unattributed.

**Role rename / historical role rewrite conflation**
Old permission context becomes false.

**Audit success / button clicked conflation**
UI intent is recorded even when transaction fails.

**Audit success / failed transaction conflation**
False evidence created before commit.

**Denied action / successful mutation conflation**
Security event appears as completed change.

**Routine validation error / audit-worthy event conflation**
Audit store becomes noisy/unusable.

**Every automation step / AuditEvent conflation**
Global audit becomes workflow telemetry.

**Every provider callback / AuditEvent conflation**
Audit becomes integration event log.

**Every Activity event / AuditEvent conflation**
Governance signal disappears in noise.

**Every login/click / productivity Audit conflation**
Workforce surveillance appears.

**Actor displayName / actor identity conflation**
Renames make events ambiguous.

**Subject title / subject ID conflation**
Resource rename breaks traceability.

**Redacted / missing conflation**
Compliance investigator thinks no value existed.

**Source unavailable / Audit unavailable conflation**
Historical evidence disappears when operational service fails.

**Actor unavailable / event invalid conflation**
Deactivated account breaks evidence.

**No ChangeSet / no action conflation**
Non-mutating governed actions disappear.

**Correlation inaccessible / unrelated conflation**
Permission boundary is misinterpreted.

**Audit export / source truth conflation**
CSV/PDF becomes authoritative event store.

**Audit export / unrestricted bulk access conflation**
Screen permission leaks all events.

**Export query / current query conflation**
Historical exported dataset cannot be reproduced.

**Export artifact / source AuditEvents conflation**
Deleting export appears to delete evidence.

**Audit search index / canonical AuditEvent conflation**
Stale index becomes source truth.

**Search count before permissions / after permissions conflation**
Restricted event volumes leak.

**Broad-role audit cache / narrow-role audit cache conflation**
Sensitive events leak.

**Generic `system_activity` table**
No semantic governance boundaries.

**Generic `before JSON / after JSON`**
Secret/privacy disaster.

**Generic `userId` only**
Cannot represent system, integration, automation or Portal actors.

**Generic `entityType/entityId` only**
Cannot represent multiple subjects/version lineage.

**Generic `action = UPDATE`**
No business semantics.

**Generic `ip + payload` dump**
Dangerous and insufficiently structured.

**138/039 duplicate Audit foundation**
Governance truth forks.

**138/119 duplicate Activity system**
Operational timeline and compliance evidence merge.

**138/137 misuse for Team analytics**
Audit volume becomes employee score.

**138/139–140 duplicate Integration logs**
Connection diagnostics become global Audit.

**138/141–142 duplicate Automation logs**
Run telemetry becomes audit truth.

**138/143 duplicate Alerts**
Audit becomes alert engine.

**138/147 duplicate Incident history**
Incident lifecycle becomes audit record.

No additional screen is required.

These are **single canonical AuditEvent storage, append-oriented integrity, semantic action/actor/subject modeling, safe ChangeSets, secret exclusion, correlation, permission-safe investigation/export, historical identity preservation, and strict Activity/Observability/Security/Workforce boundaries**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL SYSTEM AUDIT INSPECTION, COMPLIANCE EVIDENCE & PRIVILEGED-CHANGE TRACEABILITY ANCHOR**

**Domain directive:**
**AuditEvent ≠ AuditSubjectReference ≠ ActorSnapshot ≠ AuditChangeSet ≠ DomainEvent ≠ ActivityEvent ≠ ApplicationLog ≠ SecurityEvent/Alert ≠ Incident ≠ Notification ≠ ComplianceQuery ≠ AuditExportArtifact ≠ AuditLogView.**

**Foundation directive:**
Design 039 remains the single canonical AuditEvent domain and writer. Design 138 is the advanced compliance/investigation surface over those exact events.

**No-second-store directive:**
there must be no parallel `SystemAudit`, `ComplianceEvent`, `AdminActivity`, or generic `system_activity` business table duplicating AuditEvent truth.

**Evidence directive:**
AuditEvents are append-oriented governance evidence rather than editable history records.

**Transaction directive:**
successful mutation AuditEvents must align with committed canonical business changes through transaction/outbox-safe architecture so failed writes cannot produce false successful evidence.

**Semantic-action directive:**
AuditEvents record stable business action keys such as permission change/release/revocation rather than relying on HTTP verbs, page labels, or button text.

**Actor directive:**
human, Client Portal, system, service, Integration and Automation actors remain explicitly distinguishable; the platform never fabricates human attribution for automated actions.

**Historical-actor directive:**
Audit evidence retains stable actor references and minimal safe event-time context so current profile, job-title, membership or role changes do not rewrite history.

**Authorization-history directive:**
current RoleAssignments cannot be used to infer what permissions an actor held when an old AuditEvent occurred; event-time evidence/reference must remain independently reconstructable where required.

**Subject directive:**
each AuditEvent uses typed stable subject references and can represent primary and related resources independently.

**Version directive:**
versioned domains must audit exact ProposalVersion, ContractVersion, ReportVersion, PublicationVersion, DraftVersion, ProofVersion or equivalent where material rather than only top-level entities.

**Historical-subject directive:**
resource renames, archival or current-state changes never rewrite the original resource identity/context of historical AuditEvents.

**Time directive:**
`occurredAt` and `recordedAt` remain distinct, especially for external provider/system events.

**Correlation directive:**
request, correlation and causation identifiers remain distinct so multi-step operations can be reconstructed without falsely claiming causality.

**ChangeSet directive:**
`AuditChangeSet` contains an allowlisted semantic diff suitable for governance and never an automatic full before/after object dump.

**Secret directive:**
passwords, sessions, API keys, OAuth tokens, refresh tokens, provider secrets, payment credentials, signed URLs and encryption material are excluded/redacted **before AuditEvent persistence**.

**No-UI-redaction directive:**
frontend masking is never considered sufficient protection for sensitive audit data.

**Redaction directive:**
one governed `AuditRedactionPolicy` controls safe storage and rendering of sensitive change information by domain/field/schema version.

**Metadata directive:**
audit metadata is typed/allowlisted and cannot become a raw request/header/body dumping ground.

**Schema directive:**
AuditEvents carry schema/action versions sufficient for long-lived historical rendering and migration.

**Append directive:**
normal application/admin interfaces cannot PATCH or DELETE individual AuditEvents to rewrite history. Retention/purge is separate governed infrastructure.

**Integrity directive:**
the Audit store should use restrictive insert/access patterns and suitable integrity safeguards consistent with the platform's security/compliance architecture.

**Activity directive:**
Design 119 and Design 063 remain user-friendly Activity projections. AuditEvents may support them conceptually but are never interchangeable with Activity records.

**Domain-event directive:**
DomainEvents power workflow/integration reactions; AuditEvents preserve governance evidence. Neither replaces the other.

**Observability directive:**
application logs, stack traces, queue telemetry, latency, health metrics and worker diagnostics remain observability rather than canonical AuditEvent data.

**Security directive:**
security detections/alerts remain separate from Audit evidence. Security systems may consume AuditEvents but do not rewrite them.

**Incident directive:**
Design 147 remains Incident authority. Incidents may reference AuditEvents for investigation while preserving independent lifecycle/remediation state.

**Notification directive:**
Design 080/143 notification read/dismiss state never alters AuditEvent evidence.

**Workforce directive:**
Design 137 cannot treat AuditEvent counts, configuration-change volume, approval actions or login/security records as employee workload/productivity/performance scores by default.

**Integration directive:**
Designs 139–140 may create AuditEvents for connection creation, configuration change, credential rotation/revocation and privileged Integration operations while keeping credentials completely outside audit payloads.

**Automation directive:**
Designs 141–142 may audit material automation definition changes, manual retries, cancellations and overrides while keeping routine step/run telemetry in Automation-specific logs.

**Permission directive:**
Design 144/037 role and permission changes must generate especially clear actor/subject/change evidence without exposing irrelevant account details.

**Developer-access directive:**
Design 146 API-key/webhook actions can be audited as create/revoke/configure operations while never persisting secret key material.

**Settings directive:**
Design 149 privileged platform-configuration changes should reuse the same canonical audit writer/change-set/redaction system.

**Query directive:**
Design 138 uses a bounded, server-side, permission-safe `AuditQueryService` over indexed canonical audit data; client-side filtering cannot broaden disclosure.

**Permission-before-count directive:**
authorization is applied before audit rows, search, counts, facets and correlation-chain construction.

**Field-permission directive:**
event visibility, actor detail, subject detail and ChangeSet visibility can be separately restricted where governance requires it.

**Deep-link directive:**
opening canonical source entities from Audit records reauthorizes those source domains; Audit permission never grants implicit source access.

**Correlation-access directive:**
every related AuditEvent in a correlation chain is independently authorized; shared correlation IDs are not access-control bypasses.

**Export directive:**
if frozen Design 138 supports export, audit export requires separate strong permission, freezes the exact authorized query, retains redaction rules, generates a protected artifact, and records the export itself as a material AuditEvent.

**Retention directive:**
Audit retention is explicit governance policy and remains independent from Activity, application-log and source-domain retention/deletion.

**Privacy directive:**
Audit immutability does not justify retaining arbitrary personal or secret data forever; minimization/redaction/retention remain first-class.

**Source-deletion directive:**
valid source/user archival or deletion does not silently destroy audit traceability; historical stable references remain according to retention policy.

**Idempotency directive:**
retries of one idempotent business command do not produce misleading duplicate successful AuditEvents, while genuinely separate repeated actions remain separately recorded.

**Ordering directive:**
deterministic audit ordering uses stable IDs/sequences plus occurred/recorded times rather than relying only on timestamps.

**Search directive:**
audit search indexes include safe semantic fields only and never secrets/redacted raw payloads.

**Caching directive:**
Audit query caching is authorization/redaction-policy scoped and conservative; broader compliance-reader results must never leak to narrower viewers.

**Scale directive:**
Audit storage/indexing should support long-term append volume through time/tenant indexes or partitioning, stable cursor pagination, lazy detail resolution and asynchronous large exports where required.

**Partial-failure directive:**
actor profiles, subject services, correlation services and export infrastructure may fail independently. Historical AuditEvent evidence remains available wherever the canonical store itself is available, and `Unavailable` never becomes `No events`, `No change`, or `No actor`.

**Future-reuse directive:**
Design **139 — Integration Center / Connected Services** must reuse this same canonical AuditEvent pipeline for privileged connection/configuration operations while retaining IntegrationConnection, credentials, health, capabilities and provider lifecycle as their own domain. Integration logs/health telemetry must not become global AuditEvents except for explicitly audit-worthy governance actions.

**Overlap directive:**
Designs **037, 039, 119, 137–149** must preserve one continuous **canonical domain command → committed state transition → typed/redacted AuditEvent → immutable governance evidence → permission-safe Design-138 inspection/export**, while Activity, observability, Automation logs, Integration health, Alerts, Incidents and workforce analytics remain independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE SYSTEM AUDIT & COMPLIANCE FOUNDATION — DESIGN-039 CANONICAL APPEND-ORIENTED AUDITEVENT STORE + STABLE SEMANTIC ACTION REGISTRY + HUMAN/SYSTEM/INTEGRATION/AUTOMATION ACTOR MODEL + HISTORICAL ACTOR/SUBJECT REFERENCES + EXACT VERSIONED SUBJECTS + OCCURREDAT/RECORDEDAT + CORRELATION/CAUSATION + ALLOWLISTED SAFE CHANGESETS + PRE-PERSISTENCE SECRET REDACTION + TRANSACTION/OUTBOX-ALIGNED WRITES + SCHEMA VERSIONING + PERMISSION-BEFORE-SEARCH/COUNTS + FIELD-LEVEL REDACTION + STABLE CURSOR/TIME-PARTITIONED QUERYING + GOVERNED EXPORT/RETENTION — AND NEVER ALLOW GENERIC SYSTEM-ACTIVITY TABLES, RAW BEFORE/AFTER JSON, REQUEST-BODY DUMPS, CURRENT USER/ROLE LABELS, APP LOGS, SECURITY ALERTS, ACTIVITY FEEDS, EMPLOYEE PRODUCTIVITY METRICS OR EDITABLE ADMIN HISTORY TO SUBSTITUTE FOR OR REWRITE CANONICAL AUDIT EVIDENCE.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **138 / 153** |
| **PASS**                                   |                        **138** |
| **STANDARDIZE decisions**                  |                        **136** |
| **Potential implementation-overlap flags** |                        **129** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**138 / 153 = 90.2% audited.**

### Canonical Audit architecture after Design 138

```text
USER / SYSTEM / AUTOMATION / INTEGRATION
                 │
                 ↓
        Canonical business command
                 │
                 ↓
          Transaction commits
                 │
                 ↓
          AuditEventWriter
                 │
          Redaction / validation
                 │
                 ↓
           AUDIT EVENT
                 │
       ┌─────────┼─────────┐
       ↓         ↓         ↓
     Actor     Subject    ChangeSet
       │         │         │
       └─────────┼─────────┘
                 ↓
        Correlation / Causation
                 │
                 ↓
       Design 138 Audit Workspace
```

The strongest security rule is now explicit:

```text
BAD:

before = {
  apiKey: "secret-key-123",
  role: "Editor"
}

after = {
  apiKey: "secret-key-456",
  role: "Admin"
}

then hide apiKey in UI.


CORRECT:

Before persistence:

Audit redaction removes
secret credential values.

Persist only:

Credential rotated
Role Editor → Admin
```

Historical actor identity remains trustworthy:

```text
August 1

Actor:
Jane Doe
Finance Admin

Audit:
Invoice export performed


September 1

Jane moves to Operations.

RESULT:

August AuditEvent
does NOT become:

Jane Doe
Operations user

Historical context stays preserved.
```

Activity and Audit remain distinct:

```text
ACTIVITY

“Report v3 released to Client”

        ≠

AUDIT

actor
exact ReportVersion
exact FileVersion
Client context
command
timestamp
correlation
safe changed state
```

And Design 137 is protected from surveillance misuse:

```text
Employee A:
150 AuditEvents

Employee B:
50 AuditEvents

This means:

150 vs 50 auditable events recorded.

It does NOT mean:

3× productivity
3× workload
3× quality
3× employee performance
```

## Next Sequential Audit Target

### **Design 139 — Integration Center / Connected Services**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
