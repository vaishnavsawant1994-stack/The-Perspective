# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 119 — Project Activity / Project Audit Timeline

Design 119 should become the **canonical Team Workspace Project chronological activity-composition, state-change history, actor attribution, source-event trace, and Project-specific audit-evidence surface** for explaining what happened across one Project and when.

It must compose events from the canonical Project domain and every Project-related source domain already established—Tasks/Milestones, Team assignments, Risks/Blockers, Files/Deliverables, Approvals, Client Requests, Change Requests, Timeline/schedule changes, publishing, and later closeout—while preserving the strict distinction between **business Activity**, **immutable security/governance Audit**, and **the actual source-domain records those events describe**.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **ProjectActivityEvent ≠ AuditEvent ≠ DomainEvent ≠ StateTransitionRecord ≠ ApplicationLog ≠ Notification ≠ Comment/Message ≠ ProjectTimelineItem ≠ SourceDomainRecord ≠ Current Project State.**

The central implementation rule is:

> **Design 119 is primarily a chronological projection over canonical domain events and selected Project-scoped Audit evidence. It must never become another mutable Project-state backend or a hand-written activity feed that replaces source history. “Task completed,” “Approval granted,” “Deliverable version changed,” “Client Request fulfilled,” “Change applied,” and “Project stage moved” must always remain provable from their canonical source records. Activity entries summarize those facts; Audit events preserve governance/security evidence; neither may be edited to rewrite what actually happened.**

---

# 1. Classification

| Audit field                       | Classification                                                                                                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**                     | **119**                                                                                                                                                                        |
| **Canonical name**                | **Project Activity / Project Audit Timeline**                                                                                                                                  |
| **Product area**                  | Team Workspace / Projects / History / Governance                                                                                                                               |
| **User surface**                  | **Authenticated Team Workspace**                                                                                                                                               |
| **Screen class**                  | Project Detail Variant / Chronological Activity & Audit Projection                                                                                                             |
| **Classification**                | **Canonical Project Activity Composition, Cross-Domain Event History & Project-Scoped Audit Anchor**                                                                           |
| **Primary purpose**               | Explain the chronological history of one Project across all canonical source domains while preserving actor, source record, exact version/state transition, and audit evidence |
| **Primary parent**                | **Project** — Design 023                                                                                                                                                       |
| **Business-history projection**   | `ProjectActivityEvent` / `ProjectActivityEntry`                                                                                                                                |
| **Canonical governance evidence** | **AuditEvent** — Design 039                                                                                                                                                    |
| **Source events**                 | canonical domain events from Project/Task/Milestone/etc.                                                                                                                       |
| **Project workflow input**        | Project stage/state transitions                                                                                                                                                |
| **Task/Milestone input**          | Design 111                                                                                                                                                                     |
| **Resource/team input**           | Design 112                                                                                                                                                                     |
| **Risk/Blocker input**            | Design 113                                                                                                                                                                     |
| **File/Deliverable input**        | Design 114                                                                                                                                                                     |
| **Approval input**                | Design 115                                                                                                                                                                     |
| **ClientRequest input**           | Design 116                                                                                                                                                                     |
| **Change Request input**          | Design 117                                                                                                                                                                     |
| **Schedule input**                | Design 118                                                                                                                                                                     |
| **Client-safe activity boundary** | Design 063                                                                                                                                                                     |
| **Notification boundary**         | Design 080                                                                                                                                                                     |
| **Global audit boundary**         | Design 039                                                                                                                                                                     |
| **System Incident boundary**      | Design 147                                                                                                                                                                     |
| **Primary query service**         | `ProjectActivityTimelineQueryService`                                                                                                                                          |
| **Activity projection service**   | `ProjectActivityProjectionService`                                                                                                                                             |
| **Audit query dependency**        | canonical `AuditQueryService`                                                                                                                                                  |
| **Event registry**                | `ProjectActivityTypeRegistry`                                                                                                                                                  |
| **Actor resolver**                | `HistoricalActorResolver`                                                                                                                                                      |
| **Source resolver**               | `ProjectActivitySourceResolver`                                                                                                                                                |
| **Parent shell**                  | `InternalAppShell` — Design 001                                                                                                                                                |
| **Auth**                          | Required                                                                                                                                                                       |
| **Authorization**                 | Active OrganizationMembership + Project/history/audit permissions                                                                                                              |
| **Implementation priority**       | **Critical Historical Explainability / Governance / Cross-Domain Traceability**                                                                                                |
| **Reuse level**                   | **Extremely High across Project 360, compliance, reporting, incident review and closeout**                                                                                     |

Design 119 should answer:

> **“What happened on this Project, in what order, which canonical source record changed, who or what caused the change, what exact version/state was involved, whether it was a human/system/integration action, and which entries are ordinary business activity versus governed Audit evidence?”**

Canonical composition:

```text
Project PR-100
      │
      ├── Project workflow events
      ├── Task / Milestone events
      ├── Team / Resource events
      ├── Risk / Blocker events
      ├── Asset / Deliverable events
      ├── Approval events
      ├── ClientRequest events
      ├── ChangeRequest events
      └── Schedule events
                │
                ↓
          Domain Event Stream
                │
       ┌────────┴─────────┐
       ↓                  ↓
Activity Projection    Audit Events
       │                  │
       └────────┬─────────┘
                ↓
     Project Activity / Audit Timeline
```

---

# 2. Reuse

## Design 039 remains the canonical Audit system

This is the strongest Design 119 reuse requirement.

Design 039 already established:

> **AuditEvent ≠ Activity ≠ Application Log ≠ Security Alert.**

Design 119 must preserve that invariant.

Correct:

```text
Project Activity Timeline
        │
        ├── business activity entries
        │
        └── selected Project-scoped Audit evidence
                       ↓
                 AuditEvent
                 Design 039
```

Do not create:

```text
ProjectAuditEvent
ProjectAuditLog
ProjectSecurityLog
```

as independent substitutes for the canonical Audit domain.

---

## Activity ≠ Audit

### Activity

Human-readable operational history such as:

> Maya completed “Final Draft Review.”

### Audit

Governance/security evidence such as:

> Actor OM-42 invoked `TaskCompleted` on Task T-55 from revision 12 → 13.

They can describe the same underlying action.

They are not the same record or retention policy.

---

## Activity entry ≠ source-domain record

Critical.

Example:

```text
Task T-10
status = COMPLETED
completedAt = ...
        │
        ↓
Activity:
“Alex completed Draft Review.”
```

Deleting/hiding the activity projection must not alter the Task.

Likewise editing the Task through Design 111 must occur through TaskService—not through Design 119.

---

## Design 118 Timeline ≠ Design 119 Activity Timeline

This distinction must remain explicit.

### Design 118

> When work is planned/forecast/actually scheduled.

### Design 119

> What changes/actions actually happened chronologically.

Example:

```text
Design 118:
Milestone target → Sep 20

Design 119:
Aug 22 · Maya changed milestone target from Sep 18 to Sep 20
```

One is schedule state.

One is historical activity.

---

## DomainEvent ≠ ActivityEvent

A canonical domain event may be technical/business structured evidence:

```text
TaskCompleted {
  taskId,
  projectId,
  actorId,
  occurredAt
}
```

Activity Projection renders:

> “Maya completed Cover Design.”

The projection can be rebuilt.

---

## DomainEvent ≠ AuditEvent

A DomainEvent exists to describe a business state change and feed other bounded contexts.

An AuditEvent exists for governance/accountability.

Some actions may produce both.

Do not force one event type to serve every purpose.

---

## Notification ≠ Activity

Design 080 may notify:

> Change Request approved.

The Activity Timeline may show:

> Change Request CR-20 v3 approved.

Reading or dismissing the notification changes no Activity/source state.

---

## Message ≠ Activity

Client/internal messages remain canonical Conversation/Message records.

Design 119 may show:

> “New client message received”

where frozen design supports it.

It must not copy full Conversation state into Activity.

---

## Comments ≠ Activity

A Task/Risk/Deliverable comment remains a comment.

Activity may summarize:

> “Alex added a comment.”

Do not store the comment body as the only copy inside activity history.

---

## Design 063 remains client-safe account history

Design 063 is the Client Portal-safe activity projection.

Design 119 is internal Team Project activity.

They may share:

* event registry concepts,
* source-event normalization,
* actor formatting primitives.

But they require different authorization and visibility filters.

---

## Internal Activity ≠ Client Activity

A Project event may be:

```text
internal-visible = yes
client-visible = no
```

because it contains:

* staff discussions,
* financial details,
* internal risks,
* operational comments,
* security changes.

Never reuse Design 119 payload directly for Design 063.

---

# 3. Entities

## ProjectActivityEvent

Prefer a **projection/read-model identity**, not a second canonical business record.

Conceptually:

```text
ProjectActivityEvent
├── id / projection key
├── organizationId
├── projectId
├── activityType
├── sourceDomain
├── sourceType
├── sourceId
├── sourceVersionId?
├── sourceEventId
├── actor reference
├── occurredAt
├── recordedAt
├── summary payload
├── visibility classification
├── correlationId?
├── causationId?
└── projectionRevision
```

Exact schema belongs to Phase 3D.

---

## ProjectActivityEvent ≠ DomainEvent

The Activity projection can be regenerated from canonical structured events.

If materialization is used for performance, it must remain a disposable/rebuildable read model.

---

## ActivityType Registry

A typed registry should standardize event semantics.

Examples conceptually:

```text
PROJECT_CREATED
PROJECT_STAGE_CHANGED

TASK_CREATED
TASK_ASSIGNED
TASK_COMPLETED
TASK_REOPENED

MILESTONE_ACHIEVED

PROJECT_MEMBER_ADDED
RESOURCE_ALLOCATION_CHANGED

RISK_CREATED
RISK_ASSESSED
BLOCKER_CREATED
BLOCKER_RESOLVED

FILE_VERSION_CREATED
DELIVERABLE_ARTIFACT_CHANGED

APPROVAL_REQUESTED
APPROVAL_DECISION_SUBMITTED
APPROVAL_COMPLETED

CLIENT_REQUEST_CREATED
CLIENT_REQUEST_FULFILLED

CHANGE_REQUEST_SUBMITTED
CHANGE_REQUEST_APPROVED
CHANGE_APPLIED

TASK_RESCHEDULED
MILESTONE_TARGET_CHANGED
SCHEDULE_BASELINE_CHANGED
```

Exact visible event catalog belongs to Phase 3D.

---

## ActivityType ≠ UI string

Critical.

Store:

```text
TASK_COMPLETED
```

not only:

```text
"Maya completed a task"
```

Typed events support:

* filtering,
* localization,
* deterministic rendering,
* analytics.

---

## Human-readable summary should be derived

Prefer:

```text
activityType
+
structured safe payload
+
actor/source resolver
```

over storing only opaque prose.

---

## SourceReference

Every meaningful Project Activity should retain canonical source identity.

Conceptually:

```text
ActivitySourceReference
├── sourceDomain
├── sourceType
├── sourceId
├── sourceVersionId?
└── sourceRevision?
```

---

## Source version matters

Example:

> Client approved Proof v7.

Activity should retain:

```text
source = ApprovalRequest A-10
subject = ProofVersion v7
```

not:

> Client approved the latest proof.

---

## ActorReference

Must distinguish:

```text
Human user
Client portal user
System
Automation
Integration
API/service
```

Do not assume all Activity has a human User actor.

---

## Actor ≠ User globally

For human Team actions, actor should preserve the tenant-specific OrganizationMembership/security context.

For Client action:

preserve Portal/client participant context.

For automation:

preserve automation/service identity.

---

## Historical actor snapshot

Critical.

If Maya later:

* changes name,
* changes job title,
* leaves organization,

historical entries must remain understandable.

The event should preserve enough historical actor evidence to render:

> Maya Singh

as she was known at the time, while optionally linking to current identity if still accessible.

---

## Historical identity ≠ current authorization

A user seeing an old activity entry does not automatically gain access to the actor's current profile.

---

## occurredAt ≠ recordedAt

Critical.

### occurredAt

When the business action happened.

### recordedAt

When the platform persisted/received the event.

These may differ for:

* integrations,
* offline processing,
* delayed webhooks.

---

## Event ordering cannot rely solely on ingestion time

Example:

```text
10:00 provider event occurred
10:03 internal Task updated
10:05 provider webhook arrives
```

The timeline should preserve deterministic ordering semantics.

---

## Sequence/order metadata

For events with equal/ambiguous timestamps, use deterministic ordering such as:

* aggregate sequence,
* event sequence,
* stable ID.

Do not rely on random database return order.

---

## CorrelationId

Useful for linking one user/business action that triggers several domain events.

Example:

```text
ChangeApplication CA-10
correlationId = C-900

→ DeliverableCreated
→ TaskCreated
→ ResourceAllocationChanged
→ ProjectBaselineChanged
```

Activity can group these if the frozen design supports grouping.

---

## Correlation ≠ collapse

Grouping several related events does not delete their individual canonical evidence.

---

## CausationId

Useful to express:

```text
ApprovalCompleted
      ↓ causes
GateReevaluated
      ↓ enables
ProjectStageTransition
```

without pretending all three are one event.

---

## AuditEvent

Canonical Design 039 entity.

Conceptually:

```text
AuditEvent
├── id
├── organizationId
├── actor
├── action
├── target
├── context
├── before/after safe changes
├── occurredAt
├── request/correlation evidence
└── append-oriented metadata
```

Design 119 queries relevant Project-scoped Audit events.

---

## AuditEvent ≠ ActivityEvent

Permanent.

Audit may include events that do not belong in normal Project Activity, such as:

* access-policy change,
* sensitive export,
* permission override.

Activity may include routine business events not worth full compliance-detail rendering.

---

## StateTransitionRecord

Source domains may keep canonical transition history, e.g.:

```text
ProjectStageTransition
Task lifecycle transition
ApprovalDecision
ClientRequest lifecycle transition
```

Activity summarizes those.

It does not replace them.

---

## Before/after state

Where the Activity UI shows a change:

> Due date moved Sep 10 → Sep 15

the before/after data should derive from canonical event/evidence.

Do not reconstruct historical old values from current state alone.

---

## Activity comment/description

If Activity allows a manual note **and the frozen design actually includes it**, that note should be a clearly typed Project Note/Comment or ActivityAnnotation.

Do not allow editing arbitrary past source events.

---

## Activity deletion

Canonical event history should generally not support ordinary destructive deletion.

If a projection entry becomes invalid because of a processing bug:

* correct/rebuild projection,
* preserve Audit/source evidence.

If content must be redacted for policy/privacy:

use governed redaction, not state-history deletion.

---

## Redaction ≠ deletion of event

Critical.

Example:

> “Sensitive comment redacted”

can preserve:

* event occurred,
* actor,
* timestamp,
* source,

without revealing protected content.

---

# 4. Permissions

Design 119 should conceptually distinguish:

```text
projectActivity.read

projectActivity.internal.read
projectActivity.sensitive.read

projectAudit.read
projectAudit.export

projectActivity.source.open
```

Exact permission names belong to Phase 3D.

---

## Project read ≠ full Project Audit read

Critical.

A Team user may see ordinary Project activity without having access to:

* security changes,
* sensitive exports,
* permission events,
* financial modifications.

---

## Activity read ≠ source-resource read

Permanent.

A user might be allowed to see:

> Contract updated

without access to the Contract contents.

Deep links must reauthorize the source.

---

## Activity entry visibility ≠ source authorization

Never put sensitive source fields into an Activity payload simply because the event itself is visible.

---

## Audit export requires separate permission

Design 039 invariant.

---

## Project owner ≠ Audit administrator

Permanent.

---

## Project Team membership ≠ sensitive Audit access

Permanent.

---

## Actor profile access remains separate

Seeing:

> Maya changed the deadline

does not imply permission to inspect Maya's HR profile.

---

## Internal activity ≠ Client visibility

Absolute.

Client Portal activity projection must run independent client-safe authorization.

---

## Source deep links reauthorize

Every:

> View Task
> View Approval
> View Change Request

action must recheck current source permissions.

---

## Historical deleted/deactivated actor

A deactivated user remains renderable historically without reactivating access.

---

## System/automation actor details

Do not expose:

* secrets,
* tokens,
* internal credentials,
* private integration configuration.

---

## Cross-tenant activity leakage prohibited

Absolute.

Project Activity query must scope every event/source to:

```text
organizationId
+
authorized Project
```

---

## Search/filter permission

Filtering by:

* actor,
* source domain,
* sensitive action type

must not leak the existence of unauthorized records through counts/facets.

---

# 5. States

Design 119 must keep **source business state, activity projection state, Audit availability, event visibility, event processing, and chronological ordering/freshness** separate.

### Activity projection state

```text
Available
Partial
Rebuilding
Stale
Unavailable
```

### Event processing

```text
Projected
Projection Pending
Projection Failed
Late Arriving
Corrected / Reprojected
```

### Visibility

```text
Visible
Restricted
Redacted
Source Restricted
```

### Audit availability

```text
Available
Restricted
Unavailable
```

These must never collapse into source-domain lifecycle.

---

## Activity exists ≠ source still exists/currently accessible

Permanent.

A historical event can remain while a source record is:

* archived,
* completed,
* restricted.

---

## Source unavailable ≠ event invalid

Critical.

Historical evidence may still be valid even if the current source service is temporarily unavailable.

---

## Activity projection unavailable ≠ no Project history

Absolute.

---

## Audit service unavailable ≠ no Audit events

Absolute.

---

## Late-arriving event ≠ event occurred late

Critical.

A provider callback can arrive late but represent an earlier business event.

---

## Projection failed ≠ business action failed

Permanent.

Example:

```text
Task actually completed ✓
Activity projection failed ✕
```

Task remains complete.

---

## Activity event redacted ≠ event deleted

Permanent.

---

## Source access restricted ≠ event absent

Where safe:

> Approval updated — source restricted.

rather than falsely implying nothing happened.

---

## Notification dismissed ≠ Activity removed

Permanent.

---

## Current state changed later ≠ historical Activity rewritten

Absolute.

Example:

```text
Aug 10:
Task completed

Aug 12:
Task reopened
```

Timeline must show both.

Do not replace history with only:

> Task currently In Progress.

---

## State Coverage

Design 119 inherits Design 150 plus:

```text
Project Activity Loading
Project Activity Available
Project Activity Empty
Project Activity Restricted
Project Activity Partial
Project Activity Unavailable

Activity Projection Fresh
Activity Projection Stale
Activity Projection Rebuilding
Activity Projection Failed

Activity Event Visible
Activity Event Restricted
Activity Event Redacted
Activity Source Restricted
Activity Source Unavailable

Human Actor
Client Actor
System Actor
Automation Actor
Integration Actor
Historical Actor Unavailable

Audit Evidence Available
Audit Evidence Restricted
Audit Evidence Unavailable

Source Event Available
Source Event Delayed
Source Event Late Arriving
Source Event Reprojected

Project Activity Updated
Earlier Event Arrived
Activity Ordering Recalculated

Task Activity Available
Approval Activity Available
Client Request Activity Available
Change Request Activity Available
Schedule Activity Available

Project Activity Partial Dependency Failure
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize:

1. **chronology;**
2. **actor;**
3. **activity type;**
4. **source entity/version;**
5. **important before/after state;**
6. **Audit distinction where applicable.**

Conceptually:

```text
Project Activity
↓
Aug 22

10:30 · Maya
Task completed
“Final Draft Review”
Source: Task T-55

10:42 · Client
Approval submitted
Proof Version 7 → Approved
Source: Approval A-20

11:10 · System
Project gate reevaluated
Blocked → Pass

11:12 · Alex
Project stage changed
Design Review → Design Approved
```

Each event remains independently canonical.

---

## Activity and Audit should be visually distinguishable

Do not make every normal Project event look like a severe compliance/security log.

Potential distinction:

> Activity
> Audit evidence

within the same frozen composition where applicable.

---

## Source type should remain visible

Examples:

* Task
* Approval
* Client Request
* Change Request
* Deliverable
* Project Stage

This improves explainability.

---

## Version context should remain visible when material

Correct:

> Client approved Proof v7

not:

> Client approved Proof.

---

## Before/after changes should be compact and explicit

Example:

> Target date: Sep 10 → Sep 15

rather than:

> Timeline changed.

---

## Grouping must not destroy chronology

If frozen design groups related events:

```text
Change CR-20 applied
  ├── 2 Deliverables updated
  ├── 4 Tasks added
  └── Project baseline revised
```

users must still be able to inspect the underlying chronological source events where authorized.

---

## Tablet

Following Design 152:

* chronology remains vertical,
* actor/source metadata stacks,
* change details collapse into secondary rows,
* source links remain touch-safe,
* filter controls compress.

---

## Mobile

Priority:

```text
Timestamp
↓
Actor
↓
What happened
↓
Source / exact version
↓
Important before → after
↓
Open source if authorized
```

Avoid a wide audit-table representation.

---

## Mobile filtering

If frozen design includes filters:

use compact controls for:

* event type,
* actor,
* date,
* source domain.

Do not expose unauthorized filter counts.

---

## Accessibility

An entry could communicate:

> August 22 at 10:42 AM. Client user Sarah Lee approved Magazine Proof version 7 through Approval Request A-20. This approval later allowed the Design Approval Gate to pass but did not itself change the Project stage.

where authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical Project Activity architecture

```text
Canonical Source Domains
        │
        ├── Project
        ├── Tasks/Milestones
        ├── Team/Resources
        ├── Risks/Blockers
        ├── Assets/Deliverables
        ├── Approvals
        ├── ClientRequests
        ├── ChangeRequests
        └── Schedule
                 │
                 ↓
             Outbox / Events
                 │
       ┌─────────┴───────────┐
       ↓                     ↓
Activity Projector       Audit Service
       │                     │
       ↓                     ↓
ProjectActivityEntry[]   AuditEvent[]
       │                     │
       └──────────┬──────────┘
                  ↓
     ProjectActivityTimelineQueryService
```

---

## Event-driven projection

Source-domain mutations should emit structured events through a reliable outbox/event mechanism.

Do not have Design 119 poll tables and invent incomplete history from `updatedAt` fields alone.

---

## `updatedAt` ≠ activity history

Critical.

One current row cannot explain:

```text
Assigned to Maya
→ reassigned to Alex
→ completed
→ reopened
```

Structured transitions/events are required.

---

## Transactional outbox

Where source state mutation and event emission must remain consistent:

```text
domain transaction
├── update canonical record
└── insert outbox event
```

Then project asynchronously/reliably.

This prevents:

> state changed but no event ever emitted.

---

## Event ID idempotency

Every canonical event needs a stable unique ID.

Activity projector should enforce:

```text
UNIQUE(sourceEventId, projectionType)
```

or equivalent.

Retries must not duplicate timeline entries.

---

## Event replay

Activity projection must be safely rebuildable.

Running the projector twice produces the same logical activity history.

---

## Projection correction

If rendering/mapping logic changes:

rebuild ProjectActivity projection from canonical event history where possible.

Do not rewrite source domain records.

---

## Domain event schema versioning

Structured events should retain:

```text
eventType
eventSchemaVersion
```

so future consumers can interpret historical events safely.

---

## EventType registry

Use a central Project Activity registry mapping:

```text
DomainEvent type
→ Activity type
→ actor formatting
→ safe summary fields
→ visibility policy
→ source link policy
```

This prevents inconsistent event formatting across screens.

---

## Safe payloads

Activity events should not blindly copy entire domain objects.

Avoid:

```text
before = full database row
after = full database row
```

because that can include:

* credentials,
* private notes,
* personal data,
* sensitive file metadata.

Use allowlisted structured change fields.

---

## Audit safe changes

Same Design 039 rule:

Audit before/after must be safe/allowlisted.

Never log:

* passwords,
* tokens,
* raw secrets,
* confidential provider credentials.

---

## Chronological ordering

Recommended query ordering:

```text
occurredAt DESC
eventSequence DESC
eventId DESC
```

or equivalent deterministic order.

---

## Late-arriving events

If a webhook arrives late:

the Activity projection may insert it at its correct `occurredAt`.

Pagination/cursors must tolerate events appearing earlier in history after initial ingestion.

---

## Stable cursor pagination

Do not paginate solely on mutable page number.

Prefer keyset/cursor based on:

```text
occurredAt
+
stable sequence/event ID
```

---

## occurredAt validation

External providers may supply timestamps.

Normalize/verify plausibility.

Do not blindly accept absurd dates that reorder the whole Project history.

---

## recordedAt preservation

Keep local ingestion/persistence time for diagnostics.

---

## Actor resolution

Conceptually:

```text
HistoricalActorResolver.resolve(event.actorReference)
```

returns permission-safe:

```text
displayName
actorType
avatar/reference if allowed
historical/current relation
```

---

## Actor fallback

If account deleted/deactivated:

render:

> Former team member
> Historical actor ID/reference

or preserved historical display label according to policy.

Do not show:

> Unknown

when canonical historical evidence exists.

---

## System actors

Use explicit identities:

```text
SYSTEM
AUTOMATION
INTEGRATION
API_CLIENT
```

rather than fake User records.

---

## Source deep-link resolver

Conceptually:

```text
ProjectActivitySourceResolver
```

maps:

```text
TASK → Task detail
APPROVAL → Approval context
CHANGE_REQUEST → Change workspace
DELIVERABLE → Deliverable detail
```

Routing itself is Phase 3B.

Design 119 only requires canonical source references.

---

## Source reauthorization

At click/open time:

reload/authorize source.

Never rely on Activity visibility as access permission.

---

## Project-scoped event filtering

Events should carry/reliably resolve:

```text
projectId
```

or contextual Project relation.

Do not use fragile text search like:

> message contains "PR-100".

---

## Multi-context events

One event may affect several Projects, e.g. global System Incident.

Preferred model:

```text
canonical Incident
+
typed ProjectImpact references
```

so Design 119 can safely project the Project-specific effect.

Do not clone the Incident event incorrectly.

---

## Activity creation should not be an ordinary public CRUD API

Avoid:

```text
POST /project/:id/activity
{
  text: "Task completed"
}
```

for canonical system activity.

Business events are generated by source-domain actions.

If manual Project notes exist, use a distinct note/comment command.

---

## Activity mutation prohibited by default

No generic:

```text
PATCH ActivityEntry
DELETE ActivityEntry
```

for canonical generated history.

---

## Audit query

Design 119 may request Project-scoped Audit evidence:

```text
getAuditEventsForProject(
    projectId,
    currentMembership,
    filters
)
```

through canonical Design 039 services.

---

## Activity/Audit merge projection

If the frozen design visually combines both:

use a discriminated read model:

```text
ProjectHistoryEntry
├── kind = ACTIVITY | AUDIT
├── occurredAt
├── actor
├── summary
├── source reference
└── permissions
```

Do not merge the underlying domains.

---

## Before/after rendering

For event:

```text
MilestoneTargetChanged
```

payload may contain:

```text
previousTargetDate
newTargetDate
```

as explicit safe evidence.

Do not query current milestone twice to reconstruct old/new values.

---

## Exact-version history

For:

```text
DeliverableArtifactChanged
```

retain:

```text
oldArtifactVersionId
newArtifactVersionId
```

when material.

---

## Approval history

Formal Approval history remains Design 115/029 source truth.

Design 119 can show:

```text
Approval completed
```

but detailed participant decisions should link to Approval workspace.

---

## Change Application history

Design 117 may emit correlated events.

Activity can group them if frozen UI supports it.

The grouping should be based on:

```text
correlationId = ChangeApplication.id
```

not timing guesswork.

---

## Schedule changes

Design 118 source services emit:

```text
TaskRescheduled
MilestoneTargetChanged
ScheduleBaselineChanged
DependencyChanged
```

Activity records historical changes.

Gantt itself does not write Activity rows directly.

---

## Closeout integration

Design 120 later emits:

* closeout started,
* Project completed,
* Project reopened/corrected if supported.

Design 119 projects those facts.

---

## Publishing integration

Later publishing/distribution events may be Project-related.

Design 119 can safely project:

* publication released,
* distribution campaign completed,

without duplicating publication/distribution state.

---

## Event retention

Business Activity projection retention may differ from:

* canonical domain history,
* Audit retention,
* application logs.

Do not use one retention policy for everything.

---

## Audit retention should be governed independently

Potentially longer/non-deletable according to compliance policy.

---

## Redaction service

Where legally/security required:

```text
ProjectActivityRedactionService
```

or canonical governance mechanism should preserve:

* event ID,
* timestamp,
* action type,
* redaction reason,

while removing protected payload fields.

---

## Redaction permissions

Separate:

* see redacted event exists,
* see original sensitive content.

---

## Export

If frozen Design 119 includes export:

Project Activity export and Audit export may require different permission/payload schemas.

Audit export must use Design 039 controls.

---

## Search/filter

Server-side filter dimensions may include:

```text
date range
actor type
actor
source domain
activity type
event kind
```

subject to authorization.

---

## Filter counts

Must be permission-safe.

Do not leak:

> 4 Contract events

to someone who cannot know the Project has a restricted Contract context.

---

## Full-text search

If supported, index only safe activity summary fields.

Do not copy restricted source content into search index.

---

## Eventual consistency

Activity projection may lag slightly behind source mutation.

UI should tolerate:

```text
Task completed ✓
Activity entry pending
```

without treating Task as incomplete.

---

## Projection freshness

Expose internally:

```text
lastProjectedAt
lastEventSequence
```

for diagnostics.

User-facing stale indicator only where meaningful.

---

## Projection failure handling

A projector failure should:

* retry safely,
* alert operations,
* preserve outbox event,
* not roll back already committed source action.

---

## Outbox dead-letter/recovery

Unprocessable historical event should be:

* quarantined,
* observable,
* repairable/replayable.

It should not block all later Project activity projection indefinitely.

---

## Ordering after repair

When recovered event is replayed:

insert according to business occurrence order.

---

## Application logs remain separate

Operational logs such as:

```text
HTTP 500
database timeout
worker retry
```

belong to observability.

Do not flood Project Activity with system logs unless they produce a canonical Project-relevant Incident/event.

---

## System Incident integration

Design 147 may produce:

```text
IncidentAffectedProject
IncidentResolved
```

Project Activity can project meaningful business impact.

It should not ingest raw monitoring logs.

---

## Notifications

Design 080 can subscribe to domain events separately.

Activity creation should not depend on Notification delivery success.

---

## Activity does not trigger source actions

The normal direction is:

```text
Source action
→ event
→ Activity
```

not:

```text
Activity text
→ infer source mutation
```

---

## Optimistic concurrency

No ordinary Activity mutation means less direct concurrency.

But source event payloads must preserve exact source revision so conflicting state changes remain explainable.

---

## Idempotent projections

Critical.

Retries of:

* outbox delivery,
* webhook normalization,
* projector workers,

cannot duplicate Activity entries.

---

## Cache strategy

Project Activity cache/query results should vary by:

```text
organizationMembershipId
projectId
authorizationRevision
activityProjectionRevision
auditVisibilityRevision
filter/cursor
```

---

## Cache invalidation

New Activity can prepend/inject timeline entries.

Do not use long-lived page caches that hide recent history.

---

## Performance

Use:

* Project/event composite indexes;
* cursor pagination;
* partitioning where event volume becomes large;
* denormalized safe actor/source labels in projection where justified;
* lazy source-detail expansion;
* batched actor/source resolution;
* archived history retrieval.

Avoid loading entire Project history on every open.

---

## Partial failure contract

Example:

```text
Project Activity Projection ✓
Task events                 ✓
Approval events             ✓
Audit service               ✕
```

Correct:

> Project activity is available. Project-scoped Audit evidence is currently unavailable.

Incorrect:

> No Audit events.

Another:

```text
Activity projection ✓
Source Deliverable  ✕
```

Correct:

> “Deliverable artifact changed” — source detail currently unavailable.

Not:

> Deliverable change did not occur.

---

## Backend Requirement Matrix

| Requirement                                               | Status                                     |
| --------------------------------------------------------- | ------------------------------------------ |
| Canonical Project reuse from 023                          | **Critical**                               |
| Design 039 Audit reuse                                    | **Critical**                               |
| Activity/Audit separation                                 | **Critical**                               |
| DomainEvent/Activity projection separation                | **Critical**                               |
| DomainEvent/AuditEvent separation                         | **Critical**                               |
| Activity/source-record separation                         | **Critical**                               |
| Activity/current-state separation                         | **Critical**                               |
| Design 118 schedule timeline/Activity timeline separation | **Critical**                               |
| Typed ActivityType registry                               | **Critical**                               |
| Structured safe event payload                             | **Critical**                               |
| SourceReference retained                                  | **Critical**                               |
| Exact source-version references                           | **Critical where material**                |
| Historical ActorReference                                 | **Critical**                               |
| Human/System/Automation/Integration actor separation      | **Critical**                               |
| Actor/current profile separation                          | **Critical**                               |
| occurredAt/recordedAt separation                          | **Critical**                               |
| Deterministic event ordering                              | **Critical**                               |
| Late-arriving event handling                              | **Critical**                               |
| Stable cursor pagination                                  | **Critical**                               |
| Correlation/causation support                             | **Required for cross-domain traceability** |
| Transactional outbox                                      | **Critical**                               |
| Event ID idempotency                                      | **Critical**                               |
| Projection replay/rebuild                                 | **Critical**                               |
| Event schema versioning                                   | **Critical**                               |
| Projection failure/source failure separation              | **Critical**                               |
| Application logs/Project Activity separation              | **Critical**                               |
| Notifications/Activity separation                         | **Critical**                               |
| Comments/Messages/Activity separation                     | **Critical**                               |
| Design 063 client-safe projection separation              | **Critical**                               |
| Permission-safe event summaries                           | **Critical**                               |
| Source deep-link reauthorization                          | **Critical**                               |
| Sensitive-data redaction                                  | **Critical**                               |
| Redaction/deletion separation                             | **Critical**                               |
| Audit retention/Activity retention separation             | **Critical**                               |
| Audit export separate permission                          | **Critical if export exists**              |
| Activity filters permission-safe                          | **Critical**                               |
| Search indexing safe payload only                         | **Critical**                               |
| Cross-tenant event isolation                              | **Critical**                               |
| Multi-source partial failure handling                     | **Critical**                               |
| Design 111 event reuse                                    | **Critical architecture**                  |
| Design 112 event reuse                                    | **Critical architecture**                  |
| Design 113 event reuse                                    | **Critical architecture**                  |
| Design 114 event reuse                                    | **Critical architecture**                  |
| Design 115 event reuse                                    | **Critical architecture**                  |
| Design 116 event reuse                                    | **Critical architecture**                  |
| Design 117 event reuse                                    | **Critical architecture**                  |
| Design 118 event reuse                                    | **Critical architecture**                  |
| Design 120 closeout event reuse                           | **Critical architecture**                  |
| Audit/outbox observability                                | **Required**                               |

---

# 8. Consolidation

Design 119 creates significant architectural risk if the Project Activity screen becomes a manually written “log table” that substitutes for canonical source history.

**Activity / Audit conflation**
Human-readable business history becomes compliance evidence.

**Audit / Application Log conflation**
HTTP/system diagnostics pollute governance history.

**Activity / Application Log conflation**
Technical retries appear as business actions.

**Activity / DomainEvent conflation**
Read projection becomes event bus contract.

**DomainEvent / AuditEvent conflation**
Business integration events and compliance evidence share unsuitable schemas/retention.

**ActivityEntry / source record conflation**
History row becomes Task/Approval/Deliverable truth.

**Activity / Current Project state conflation**
Latest event is treated as current state without source revalidation.

**Project Activity Timeline / Project Schedule Timeline conflation**
Chronological history and Gantt schedule become one model.

**Activity timestamp / schedule date conflation**
“Task rescheduled at Aug 22” becomes Task's due date.

**Activity text / source mutation conflation**
Editing a history sentence changes Project state.

**Generic manual Activity CRUD**
Users can fabricate canonical system history.

**Activity deletion / source correction conflation**
Deleting history hides real business action.

**Redaction / deletion conflation**
Privacy protection destroys evidence that an event occurred.

**Current actor profile / historical actor identity conflation**
Old events change when employee profile changes.

**User / actor conflation**
System/integration actions require fake user accounts.

**OrganizationMembership / actor display conflation**
Tenant context disappears.

**Client actor / internal actor conflation**
Client actions become attributed to Team user.

**Actor / authorization conflation**
Seeing actor identity grants profile access.

**occurredAt / recordedAt conflation**
Late webhooks appear to have happened late.

**Database insertion order / business chronology conflation**
Timeline order changes unpredictably.

**Timestamp alone / deterministic sequence conflation**
Same-time events reorder randomly.

**Late arrival / incorrect event conflation**
Valid provider event is discarded.

**Source current values / historical before-after conflation**
Past changes cannot be reconstructed.

**`updatedAt` / event history conflation**
Intermediate transitions disappear.

**Activity summary string / event type conflation**
Filtering/localization becomes brittle.

**UI label / canonical ActivityType conflation**
Renaming UI breaks historical analytics.

**Full source object / safe event payload conflation**
Secrets/private data leak into immutable logs.

**Audit before/after / full database row conflation**
Tokens and confidential data become permanent.

**Project event / client-visible event conflation**
Internal Project history leaks to Portal.

**Design 119 / Design 063 conflation**
Client sees staff risks, financial/internal notes, security events.

**Activity visible / source visible conflation**
Event preview leaks source details.

**Source restricted / event absent conflation**
History becomes misleading.

**Audit restricted / no Audit records conflation**
Permissions are mistaken for empty history.

**Projection unavailable / no Project history conflation**
Infrastructure failure looks like zero activity.

**Projection failure / source action failure conflation**
Completed Task appears incomplete.

**Event replay / duplicate Activity conflation**
Outbox retry creates repeated history rows.

**Webhook retry / duplicate event conflation**
Provider action appears several times.

**Projection correction / source-state rewrite conflation**
Fixing Activity renderer mutates business records.

**Correlation / collapse conflation**
Grouped Change Application hides individual downstream events.

**Causation / identity conflation**
Approval, Gate Pass and Stage Transition appear as one event.

**Approval Activity / Approval history conflation**
Project timeline replaces formal participant/decision evidence.

**Task Activity / Task lifecycle conflation**
Timeline string becomes Task state.

**Milestone Activity / Milestone state conflation**
“Milestone achieved” text is treated as achievement evidence.

**Resource Activity / ResourceAllocation conflation**
History row becomes staffing plan.

**Risk Activity / RiskAssessment conflation**
Assessment details exist only in timeline text.

**Deliverable Activity / FileVersion history conflation**
Exact artifact versions disappear.

**ClientRequest Activity / request lifecycle conflation**
History becomes external dependency truth.

**Change Activity / ChangeApplication conflation**
“Change applied” text replaces durable application evidence.

**Schedule Activity / schedule baseline conflation**
Reschedule event becomes current planned dates.

**Notification / Activity conflation**
Reading alert removes or changes history.

**Message / Activity conflation**
Conversation content is duplicated unsafely.

**Comment / Activity conflation**
Editing comment rewrites activity evidence.

**Search index / Activity authority conflation**
Stale indexed summary becomes historical source.

**Audit retention / Activity retention conflation**
Compliance history is deleted with ordinary UI history.

**Activity export / Audit export conflation**
Unauthorized compliance evidence is exposed.

**Filter count / permission leakage**
Restricted event categories reveal confidential Project data.

**Raw provider event / user-facing Activity conflation**
Webhook payload leaks into UI.

**Raw system log / Project Incident conflation**
Technical noise floods Project history.

**System Incident / raw monitoring event conflation**
Observability records become Project business events.

**Generic `ProjectHistory` writable table**
All source-domain history is flattened into one mutable record type.

**Generic Activity mega-PATCH**
History can be rewritten independently of canonical domains.

**119/039 duplicate Audit backend**
Project and global Audit disagree.

**119/063 duplicate Client Activity truth**
Internal/client projections diverge unsafely.

**119/080 duplicate Notification history**
Inbox events become Project history source.

**119/111 duplicate Task/Milestone history**
Activity replaces work-state transitions.

**119/112 duplicate staffing history**
Project role/allocation state exists only as text.

**119/113 duplicate Risk history**
Risk assessments disappear into Activity.

**119/114 duplicate File/Deliverable version history**
Artifact lineage becomes generic entries.

**119/115 duplicate Approval history**
Formal decisions become timeline strings.

**119/116 duplicate ClientRequest history**
Request lifecycle loses source evidence.

**119/117 duplicate Change-control history**
Application evidence becomes descriptive text.

**119/118 duplicate schedule state**
Activity Timeline starts owning dates.

**119/120 duplicate completion history**
Project closeout evidence is reduced to “Project completed.”

No additional screen is required.

These are **chronological projection, Audit separation, event identity, source/version traceability, actor history, ordering, outbox reliability, idempotent projection, visibility/redaction, cross-domain event composition, and source-of-truth preservation requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PROJECT ACTIVITY COMPOSITION, CROSS-DOMAIN EVENT HISTORY & PROJECT-SCOPED AUDIT ANCHOR**

**Domain directive:**
**ProjectActivityEvent ≠ AuditEvent ≠ DomainEvent ≠ StateTransitionRecord ≠ ApplicationLog ≠ Notification ≠ Comment/Message ≠ ProjectTimelineItem ≠ SourceDomainRecord ≠ Current Project State.**

**Project directive:**
Design 023 remains the canonical Project. Design 119 explains its historical activity but never stores another mutable Project lifecycle or state.

**Activity directive:**
`ProjectActivityEvent` is a permission-safe chronological read projection derived from canonical source events. It is not a general-purpose writable Project-history entity.

**Audit directive:**
Design 039 remains the single canonical Audit domain. Design 119 may surface Project-scoped Audit evidence but never maintains a second Project Audit backend.

**Activity/Audit directive:**
business Activity and governance Audit remain separately typed, retained, authorized and rendered even where they describe the same underlying action.

**Domain-event directive:**
source services emit structured typed DomainEvents when canonical business state changes. Project Activity consumes those events rather than inferring history from current rows or `updatedAt`.

**Outbox directive:**
canonical state mutation and event publication use reliable transactional-outbox or equivalent semantics so committed business changes cannot silently disappear from historical event processing.

**Projection directive:**
Activity materialization is replayable/rebuildable. Projection corruption or renderer changes can be repaired without mutating Project/Task/Approval/etc. source records.

**Idempotency directive:**
every source event has stable identity and Activity projection enforces replay safety. Worker retries, webhook retries and event replay cannot create duplicate history entries.

**Schema-version directive:**
DomainEvent schemas are versioned so historical activity remains interpretable after payload/model evolution.

**Activity-type directive:**
one typed `ProjectActivityTypeRegistry` governs event taxonomy, safe summary fields, visibility rules, actor rendering and source linking. Human-readable strings are presentation, not canonical event identity.

**Source directive:**
each meaningful Activity entry retains typed canonical `sourceType/sourceId` and exact source-version references where material. “Latest” mutable references are never substituted for historical identity.

**Version directive:**
Approval, Draft, Proof, Deliverable, Change Request and other version-sensitive events preserve exact version IDs in historical context.

**Actor directive:**
historical ActorReference distinguishes Team user, Client user, system, automation, integration and API/service identities. Not every event requires a fake User.

**Historical-actor directive:**
actor attribution remains explainable after employee/contact rename, role change, deactivation or departure. Current profiles may change without rewriting old Activity history.

**Authorization directive:**
seeing an Activity entry never grants access to the underlying source entity, actor profile, Audit record or sensitive payload. Every source deep link reauthorizes.

**Client-visibility directive:**
Design 063 remains the separately authorized client-safe history projection. Internal Design 119 payloads are never passed directly into the Portal.

**Visibility directive:**
Activity projection applies event-level/field-level authorization before presentation and filtering. Restricted source existence/details cannot leak through summaries or facets.

**Redaction directive:**
governed redaction removes protected payload while retaining event identity/action/time where policy permits. Redaction is never destructive rewriting of the underlying source event.

**Chronology directive:**
business `occurredAt`, platform `recordedAt`, deterministic event sequence, and stable event ID remain separate so delayed/out-of-order events can be placed accurately.

**Late-event directive:**
late-arriving provider/integration events can be projected into their correct historical position without being mistaken for newly occurring business actions.

**Pagination directive:**
large Project histories use deterministic cursor/keyset pagination based on chronology + stable sequence/ID rather than unstable page-number ordering.

**Correlation directive:**
correlation IDs link several events caused by one higher-level action such as ChangeApplication while preserving each canonical downstream event.

**Causation directive:**
causation IDs can explain chains such as `ApprovalCompleted → GatePassed → ProjectStageTransition` without collapsing those different states/actions into one Activity record.

**Before/after directive:**
historical field transitions come from structured source-event evidence or canonical transition records, not from comparing only today's database values.

**Task directive:**
Design 111 remains authoritative for Task/Milestone lifecycle. Design 119 summarizes Task events but can never complete/reopen/reschedule work directly through Activity records.

**Resource directive:**
Design 112 remains authoritative for Project membership, roles and allocations. Activity records staffing changes but never becomes the staffing plan.

**Risk directive:**
Design 113 remains authoritative for Risk/Blocker lifecycle and assessments. Activity summarizes changes without replacing risk evidence.

**Deliverable directive:**
Design 114 remains authoritative for Asset/FileVersion/Deliverable lineage. Activity retains exact changed versions where material but does not become file history authority.

**Approval directive:**
Design 115/029 remain authoritative for ApprovalRequests, participants and decisions. Activity may show “Proof v7 approved,” but participant-level/formal evidence remains in Approval history.

**ClientRequest directive:**
Design 116 remains authoritative for external client obligations. Activity summarizes request creation/fulfillment/supersession without owning request lifecycle.

**Change-control directive:**
Design 117 remains authoritative for ChangeRequestVersion/Impact/Approval/Application evidence. Activity can group correlated application effects but never substitutes for durable ChangeApplication records.

**Schedule directive:**
Design 118 remains authoritative for current planned/forecast/actual schedule composition. Design 119 records schedule-change history; it never becomes another schedule database.

**Notification directive:**
Design 080 may subscribe to the same DomainEvents but Notification delivery/read state remains entirely independent from Project Activity.

**Message/comment directive:**
Messages and comments remain their own canonical records. Activity may announce their creation without storing the only copy of communication content.

**Application-log directive:**
raw HTTP/database/worker logs stay in observability. Only canonical Project-relevant business incidents/events belong in Activity.

**Incident directive:**
Design 147 may supply meaningful Incident/Project-impact events while raw monitoring telemetry remains outside the Project history domain.

**Event-retention directive:**
business Activity projections, canonical source history, Audit evidence, and technical logs can have different retention policies. Audit retention is never shortened merely because Activity UI retention changes.

**No-edit directive:**
generated Project Activity has no normal generic edit/delete API. Source corrections occur in the owning domain and produce additional historical evidence.

**Manual-note directive:**
if frozen Design 119 contains manually added Project history notes, they must be distinctly typed Project Note/Comment records—not arbitrary edits to generated historical entries.

**Search directive:**
Activity search indexes only permission-safe structured summaries and never becomes source-domain or Audit authority.

**Filter directive:**
server-side filters/facets honor source/event authorization and cannot leak restricted event categories through counts.

**Caching directive:**
Activity caches vary by Project authorization, projection revision, Audit visibility, filters and cursors. New/late events invalidate affected chronological windows.

**Partial-failure directive:**
Activity projection, Audit service, actor resolver and source-domain detail may fail independently. `Unavailable` can never become `No history`, `No Audit events`, `Unknown actor` without evidence, or source-state rollback.

**Performance directive:**
use Project/event indexes, typed event partitions where scale requires, cursor pagination, batched actor/source resolution and lazy expanded evidence rather than loading an entire Project lifetime by default.

**Observability directive:**
projection lag, outbox backlog, failed event mappings and replay/dead-letter conditions require operational monitoring so missing Activity can be detected without corrupting source truth.

**Audit directive:**
Project-scoped formal governance activity remains supported by Design 039 with append-oriented, actor/target/context-aware evidence and separately controlled export/read permissions.

**Future-reuse directive:**
Design **120 — Project Completion / Closeout Workspace** must emit and consume canonical closeout/completion evidence while Design 119 simply projects those actions chronologically. A “Project completed” Activity entry must never itself constitute the Project's completion decision or readiness proof.

**Overlap directive:**
Designs **023, 039, 063, 080, 111–120** must preserve one continuous **canonical source-domain mutation → structured DomainEvent/outbox → optional AuditEvent → permission-safe Project Activity projection → chronological Team history / separately sanitized Client history** lineage while keeping business state, workflow transitions, schedule, formal approval, client dependencies, Audit evidence and presentation independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE PROJECT ACTIVITY & HISTORY FOUNDATION — CANONICAL SOURCE-DOMAIN EVENTS + RELIABLE TRANSACTIONAL OUTBOX + TYPED VERSIONED EVENT SCHEMAS + IDEMPOTENT REPLAYABLE PROJECT ACTIVITY PROJECTION + DISTINCT DESIGN-039 AUDIT EVIDENCE + HISTORICAL HUMAN/CLIENT/SYSTEM/INTEGRATION ACTORS + EXACT SOURCE/VERSION REFERENCES + DETERMINISTIC OCCURRED/RECORDED ORDERING + CORRELATION/CAUSATION TRACEABILITY + PERMISSION-SAFE SUMMARIES/REDACTION + SEPARATELY AUTHORIZED CLIENT HISTORY — AND NEVER ALLOW GENERIC ACTIVITY STRINGS, `updatedAt` VALUES, RAW APPLICATION LOGS, NOTIFICATION STATE, CURRENT SOURCE VALUES, MANUAL TIMELINE EDITS OR AUDIT-LIKE UI ROWS TO SUBSTITUTE FOR OR REWRITE CANONICAL PROJECT, TASK, APPROVAL, DELIVERABLE, CLIENTREQUEST, CHANGE, SCHEDULE OR AUDIT TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **119 / 153** |
| **PASS**                                   |                        **119** |
| **STANDARDIZE decisions**                  |                        **117** |
| **Potential implementation-overlap flags** |                        **110** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**119 / 153 = 77.8% audited.**

### Canonical Project history architecture after Design 119

```text
CANONICAL PROJECT ACTION

Task T-55:
IN_PROGRESS → COMPLETED
        │
        ├───────────────┐
        ↓               ↓
DomainEvent         AuditEvent
TaskCompleted       governed evidence
        │
        ↓
Activity Projector
        │
        ↓
Project Activity:
“Maya completed Final Draft Review.”
```

The source-of-truth boundary is strict:

```text
Activity says:
“Task completed”

        ≠

Task completion truth.

Task T-55 itself remains
the canonical state/evidence.
```

Activity and Audit are also separate:

```text
ACTIVITY
“Maya changed the milestone date
from Sep 10 to Sep 15.”

        ≠

AUDIT
Actor OM-42 performed
MilestoneTargetChanged
M-10 revision 7 → 8
with governed context/evidence.
```

Chronology must tolerate delayed integration events:

```text
Business occurrence:

10:00  Client signed
10:03  Team updated Project
10:05  Signing webhook arrived

Timeline should still explain:

10:00  Client signature occurred
10:03  Project action occurred

while recordedAt preserves
that the webhook arrived at 10:05.
```

Correlation can explain complex actions without flattening them:

```text
Change Application CA-20
        │
        ├── Deliverable added
        ├── 4 Tasks created
        ├── Resource allocation changed
        └── Schedule baseline revised

One correlated business action,
multiple canonical events.
```

And current state never rewrites history:

```text
Aug 10
Task completed

Aug 12
Task reopened

CURRENT:
Task = IN_PROGRESS

HISTORY:
both events remain visible.
```

## Next Sequential Audit Target

### **Design 120 — Project Completion / Closeout Workspace**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
