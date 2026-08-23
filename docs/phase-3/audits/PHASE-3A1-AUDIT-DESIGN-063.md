# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 063 — Client Activity / Account History

Its frozen identity is locked.

Design 063 should become the **canonical Client Portal account-history projection** for Client-safe events that have occurred across Projects, approvals, Contracts, billing, publishing, Reports, support, access administration, and other Client-visible workflows.

Its governing boundary is:

> **Activity Event ≠ AuditEvent ≠ Notification ≠ Message ≠ Source-Domain Record ≠ State Change ≠ Timeline Projection ≠ Client-visible Account History.**

The core implementation principle is:

> **Design 063 is a read-only Client-safe projection of canonical business history. It may summarize what happened, but it must never become the system that decides what happened.**

---

# 1. Classification

| Audit field                      | Classification                                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Design ID**                    | **063**                                                                                                     |
| **Canonical name**               | **Client Activity / Account History**                                                                       |
| **Product area**                 | Client Portal / Activity / History / Transparency                                                           |
| **User surface**                 | **Client Portal**                                                                                           |
| **Screen class**                 | Cross-Domain Client Activity Feed / Account History                                                         |
| **Classification**               | **Portal Projection Anchor — Client-Safe Activity & Account History Family**                                |
| **Primary purpose**              | Present an authorized chronological history of meaningful Client-visible business events across the account |
| **Primary projection concept**   | `ClientActivityEntry` / `ActivityFeedEntry`                                                                 |
| **Underlying truth**             | Canonical domain records + canonical domain events                                                          |
| **Audit dependency**             | Design 039                                                                                                  |
| **Project Timeline distinction** | Design 044                                                                                                  |
| **Notification distinction**     | Designs 061 / 064                                                                                           |
| **Messaging distinction**        | Designs 045 / 074                                                                                           |
| **Project activity overlap**     | Design 119                                                                                                  |
| **System Audit overlap**         | Design 138                                                                                                  |
| **Identity dependency**          | Designs 036 / 059 / 062                                                                                     |
| **Asset dependency**             | Design 030 only where a safe referenced artifact is shown                                                   |
| **Parent shell**                 | `ClientPortalShell` — Design 002                                                                            |
| **Primary read model**           | `ClientAccountActivityView`                                                                                 |
| **Template family**              | `ActivityHistoryFeedTemplate`                                                                               |
| **Auth**                         | Required                                                                                                    |
| **Authorization**                | Active Portal membership + Client/account scope + event/resource visibility policy                          |
| **Implementation priority**      | **High Transparency / Client Trust / Traceability**                                                         |
| **Reuse level**                  | **Very High across nearly every canonical business domain**                                                 |

Design 063 should answer:

> **“What meaningful things have happened across my authorized Client account, when did they happen, who or what caused them where appropriate, what Project or business object were they related to, and where can I safely inspect the underlying record?”**

Canonical architecture:

```text
Canonical Source Domains
        │
        ├── Projects
        ├── Approvals
        ├── Contracts
        ├── Billing
        ├── Meetings
        ├── Files
        ├── Publishing
        ├── Reports
        ├── Support
        └── Portal Access
                ↓
        Domain Events / Outbox
                ↓
      Client Activity Projection
                ↓
      authorization + redaction
                ↓
       ClientActivityEntry
                ↓
           Design 063
```

---

# 2. Reuse

## Source domains remain authoritative

Every Activity entry must retain lineage back to a canonical source.

Example:

```text
Activity:
“Final Proof v5 was approved.”

Source:
ApprovalDecision AD-901

Subject:
ProofVersion PV-5
```

The Activity record does **not** become another ApprovalDecision.

---

## Reuse domain events rather than inventing page-local history

Design 063 should consume event output from domains such as:

```text
ProjectCompleted
ApprovalDecisionRecorded
ContractExecuted
InvoicePaid
ReportReleased
SupportRequestResolved
PortalMembershipActivated
PublicationVerified
```

rather than each screen manually writing arbitrary strings into a generic history table.

---

## Reuse one activity-projection infrastructure

Design 063 should establish a reusable Client-safe Activity projection that later surfaces can consume where appropriate.

Potential consumers include:

* Client Dashboard,
* Client Project Detail,
* Project activity summaries,
* Account History.

But each surface applies its own scope.

---

## Design 063 ≠ Design 044

### Design 044 — Project Timeline / Progress

Answers:

> Where is this Project in its planned/actual delivery journey?

### Design 063 — Client Activity

Answers:

> What meaningful events occurred across my Client account?

Therefore:

```text
Project Timeline
≠
Account Activity Feed
```

An Approval may appear in both as different projections of the same source event.

---

## Design 063 ≠ Design 119

Later:

**Design 119 — Project Activity / Project Audit Timeline**

Expected architecture:

```text
Canonical Domain Events
        │
        ├── Design 063
        │   Client-safe account-wide history
        │
        └── Design 119
            Internal Project-specific activity/history
```

One source event foundation.

Different audience, scope, and detail.

---

## Design 063 ≠ Design 039 / 138

Design 039 established platform Audit.

Design 138 later gives the deeper System Audit interface.

Audit answers:

> Who did what, to which protected object, with what outcome and forensic context?

Client Activity answers:

> What meaningful Client-visible event happened?

A single source action may create both:

```text
Contract signed
    ├── Activity entry
    └── AuditEvent
```

but they are separate representations.

---

## Design 063 ≠ Design 064

### Activity

Historical account events.

### Notifications

Attention-oriented recipient records.

Example:

```text
Report released
     │
     ├── Activity:
     │   “August Performance Report became available.”
     │
     └── Notification:
         “Your August report is ready.”
```

Reading/dismissing the Notification cannot remove the historical Activity.

---

## Design 063 ≠ Message history

Design 045 remains canonical for Messages.

Activity may say:

> New conversation started.

or perhaps:

> Sarah replied to your support request.

if Client-safe and useful.

But Design 063 should not reproduce full Message content/history.

---

# 3. Entities

## Activity Event ≠ source-domain event

A source business event may contain rich internal data.

Example:

```text
ApprovalDecisionRecorded
{
  actorId,
  approvalRequestId,
  internalCorrelationId,
  workflowGateId,
  ...
}
```

The Client Activity projection may become:

```text
ClientActivityEntry
“Final magazine proof was approved.”
```

The projection is deliberately reduced and safe.

---

## ClientActivityEntry should retain source lineage

Conceptually:

```text
ClientActivityEntry
├── id
├── client/account scope
├── event type
├── source domain
├── source entity type
├── source entity ID
├── source event ID
├── Project/context reference where allowed
├── safe actor reference
├── occurredAt
├── recordedAt
├── client-safe metadata
├── audience/visibility classification
└── projection schema version
```

Exact schema belongs to Phase 3D.

---

## ActivityEntry ≠ source record duplication

Do not copy full:

* Contract,
* Invoice,
* Report,
* Message,
* Approval,
* Project

payloads into Activity.

Store enough Client-safe display/context metadata and source lineage.

---

## Activity Event ≠ State Change

A state change can produce an Activity event, but they are not identical.

Example:

```text
Invoice:
PARTIALLY_PAID → PAID
```

may produce:

> Invoice INV-104 was paid in full.

The Invoice's canonical state remains Finance truth.

---

## Not every state change requires Client Activity

Internal transitions such as:

```text
payment reconciliation attempt retried
worker job reassigned
render job entered queue
OAuth token refreshed
```

should generally remain internal.

Design 063 is **meaningful Client history**, not an internal event dump.

---

## Activity ≠ application logs

Never expose:

* request traces,
* database errors,
* queue retries,
* worker IDs,
* stack traces,
* HTTP status diagnostics.

Those are operational logs.

---

## Activity ≠ AuditEvent

Audit can preserve:

```text
actor
action
target
outcome
correlation
change set
security context
```

Client Activity usually needs only safe business interpretation.

Do not expose raw audit payloads.

---

## Activity ≠ Notification

Notification carries recipient attention state such as:

```text
unread
read
dismissed
```

Activity normally does not require recipient-specific read semantics.

---

## Activity ≠ ClientAction

An Activity entry:

> Contract sent for signature.

does not mean the current user has authority to sign.

Design 047 determines whether an actionable obligation exists.

---

## Activity ≠ Message

An Activity item may reference a Conversation.

It should not contain the entire Message body unless the product explicitly requires a safe preview.

Message remains Design 045 truth.

---

## Account History ≠ Project Timeline

Activity can include:

* Projects,
* Contracts,
* Reports,
* payments,
* account membership,
* support.

Project Timeline is delivery/workflow focused.

---

## Meaningful Activity taxonomy

A governed activity-type registry should exist.

Potential Client-safe families:

```text
PROJECT
APPROVAL
MEETING
FILE / DELIVERABLE
CONTRACT
BILLING
PUBLISHING
DISTRIBUTION
REPORT
SUPPORT
ACCOUNT ACCESS
```

Exact types later.

Avoid arbitrary event names generated by each frontend.

---

## Event type ≠ free-form message

Do not make this the canonical schema:

```text
activity.text = "John did something"
```

Prefer:

```text
activityType
sourceType
sourceId
safe metadata
```

with the display text composed from a governed presentation layer.

---

## Activity copy can evolve

Because presentation copy is derived from structured type/metadata, the UI can improve wording later without changing historical source truth.

---

## Historical meaning must remain stable

Changing UI wording from:

> Contract completed

to:

> Contract fully executed

should not create a new historical event.

---

## Actor identity

Activity may have actor types such as:

```text
CLIENT_USER
INTERNAL_USER
SYSTEM
AUTOMATION
INTEGRATION
```

where appropriate.

Do not assume every event has a human actor.

---

## Actor ≠ current profile presentation only

If historical readability matters, store or derive safe historical actor context carefully.

Example:

A Client user was:

> Sarah Patel — Marketing Director

when she approved a Proof.

Later she changes title.

The Activity should still reference the same stable User, while formal approval evidence remains Design 052 truth.

---

## Internal actor identity may need redaction

A Client-safe Activity might say:

> The Perspective team published your magazine.

instead of exposing:

> Backend contractor Adam Smith published it.

if internal employee identity is not Client-visible.

Actor projection policy must be explicit.

---

## System/automation attribution

Automated events can safely show:

> Your report was generated.

without pretending a human employee performed the action.

---

## occurredAt ≠ recordedAt

Important event-time boundary:

```text
occurredAt
```

when the business event happened.

```text
recordedAt
```

when the Activity projection was stored/indexed.

They may differ because of:

* async processing,
* delayed provider events,
* backfills.

---

## Activity ordering

Primary chronological ordering should generally use authoritative event time with deterministic tie-breaking.

Example:

```text
occurredAt DESC
activityId DESC
```

or equivalent stable cursor semantics.

---

## Delayed event ingestion

If a Contract-provider webhook arrives late, Activity may need to insert an event at its true historical occurrence time.

Do not rewrite source timestamps to ingestion time.

---

## Backfill ≠ newly happened

When old historical events are backfilled:

they should not look like they occurred today.

---

## Project/context reference

An Activity entry can safely reference:

```text
Project P-101
Report R-22
Invoice INV-104
```

only if the viewer is authorized for the relevant context.

---

## Source resource deleted/restricted

If a linked source is no longer accessible:

the Activity system should not expose forbidden detail through the old entry.

Possible safe presentation:

> This item is no longer available.

depending on policy.

---

## Historical visibility policy

This requires explicit Phase 3D rules.

Two legitimate models may coexist by activity type:

1. account-wide event remains visible historically because it is intrinsically Client-safe;
2. source-dependent detail is visible only while current authorization allows it.

Do not make all past access permanent automatically.

---

## Current authorization ≠ historical authorization snapshot

A user who once had Project A access and later loses it should not necessarily retain detailed Activity content for Project A forever.

Access policy determines what history remains visible.

---

## Event audience

A useful concept may be:

```text
CLIENT_ACCOUNT
PROJECT_MEMBERS
SPECIFIC_PORTAL_MEMBERS
CLIENT_ADMIN_ONLY
```

or equivalent.

Exact model later.

This helps avoid assuming every Client-safe event is visible to every Client user.

---

## Account-wide ≠ organization-wide sensitive

Example:

> Company profile updated

may be account-wide.

But:

> Finance administrator changed billing access

might be Client-admin-only or Audit-only.

---

## Sensitive administrative events

Design 062 access changes may produce safe Activity.

But do not expose:

* low-level permission IDs,
* internal security rationale,
* session revocation details.

---

## Contract Activity

Safe examples can include:

```text
Contract became available
Contract signed
Contract fully executed
```

Source remains Contract/Signature domain.

---

## Finance Activity

Safe examples:

```text
Invoice issued
Payment received
Refund completed
```

But Activity is not a ledger.

Amounts should appear only if Client/user permissions allow.

---

## Approval Activity

Safe:

> Final proof approved.

Do not infer approval from comments or review completion.

Use canonical ApprovalDecision.

---

## Publishing Activity

Safe:

> Magazine publication verified live.

Do not create this entry merely from provider acceptance.

Use canonical Publishing/Verification state.

---

## Distribution Activity

Safe:

> LinkedIn placement verified.

Metric updates should not create noisy Activity for every impressions refresh.

---

## Report Activity

Safe:

> August Performance Report released.

Report release is canonical Design 033/056 truth.

---

## Support Activity

Safe:

> Support request SR-104 resolved.

Do not include internal root-cause notes.

---

## Membership Activity

Potentially:

> Sarah joined the Client Portal.

> Team access was updated.

But client-visible detail should respect administration/privacy policy.

---

## Activity retention

Retention policy may differ from Audit.

Client Activity can have product-facing retention requirements.

Audit can have longer compliance retention.

Do not assume deleting one deletes the other.

---

## Activity deletion

Users should not generally be able to delete canonical account-history events merely because they dislike them.

If Activity presentation supports hiding/filtering, that is not deletion of source truth.

No deletion feature is introduced here.

---

## Source correction

If a source record is corrected:

do not blindly edit old Activity history into something false.

Depending on materiality:

* old event remains,
* corrective/new event is emitted,
* safe display metadata may be updated where purely presentational.

Exact event-correction policy later.

---

## Event schema versioning

Because Activity projections span many domains, projection/event schemas should be versioned or evolution-safe.

A future metadata format change must not break historical feed rendering.

---

## Idempotency

The same source domain event processed twice must not create duplicate ClientActivityEntries.

Conceptually:

```text
sourceEventId
+
projection type
+
audience
```

can participate in deduplication.

---

# 4. Permissions

Authorization is fundamental because the Activity feed aggregates many sensitive domains.

Conceptually:

```text
Portal membership
+
Client/account scope
+
Activity audience
+
source-domain visibility
+
safe-field policy
```

determines each entry.

---

## Client account membership ≠ all Activity

A Client organization can have users with different:

* Project access,
* Finance access,
* Contract access,
* Report access.

Design 063 must reflect those distinctions.

---

## Account feed must be permission-filtered before retrieval

Dangerous:

```text
load all Client Activity
→ hide unauthorized entries in browser
```

Correct:

```text
authorized Activity candidate set
→ return Client-safe feed
```

---

## Activity search/filter must preserve authorization

If filtering by:

* Project,
* category,
* person,
* date,

the filter can only narrow already-authorized data.

---

## Search snippets can leak

Never return unauthorized event labels such as:

> Confidential Acquisition Contract executed

through search/autocomplete.

---

## Activity read ≠ source read automatically

Depending on event policy, a safe summary might remain visible while source detail is not.

But clicking through must perform fresh authorization.

---

## Activity entry ≠ authorization token

Permanent rule:

> A historical Activity link never bypasses current source permissions.

---

## Finance Activity

Only users with appropriate billing/Finance visibility should see sensitive amounts/details.

A generic account member should not infer outstanding balances from Activity.

---

## Contract Activity

Contract-sensitive titles/parties/actions need Contract authorization.

---

## Project Activity

Project-scoped Activity respects current Project/resource scope according to policy.

---

## Approval Activity

A user may see:

> Approval completed

without necessarily seeing all Approval participants/internal detail.

Client-safe projection controls metadata.

---

## Portal access Activity

Only appropriate Client administrators may receive detailed membership-access events.

Other users may receive a simpler event or none.

---

## Internal employee data

Client Activity must not expose:

* internal employee performance,
* workload,
* internal role changes,
* private staff notes.

---

## Sales/CRM data

Never expose:

* Deal probability,
* renewal risk,
* Sales notes,
* outreach status,
* lead scoring,
* internal account health,

through Activity unless there is a deliberately Client-visible source event.

---

## Security events

Sensitive forensic events generally belong to Audit/security tooling.

Client Activity may expose carefully chosen account-security events if product policy requires it.

Never expose:

* IP address,
* token identifiers,
* device fingerprints,
* internal detection logic,

by default.

---

## Audit access ≠ Activity access

A Client with Activity access does not gain Design 039 Audit access.

---

## Activity export

If export ever exists, it should require separate permission and respect the same authorization projection.

No export feature is added here.

---

# 5. States

Design 063 should preserve feed/query state separately from source-event state.

### Feed state

```text
Activity Loading
Activity Available
No Activity Yet
No Activity Matching Filters
Older Activity Loading
Activity Page Failed
```

### Entry context state

```text
Source Available
Source Restricted
Source Removed
Source Temporarily Unavailable
```

### Projection state

```text
Activity Current
Activity Projection Delayed
Activity Backfilled
Activity Metadata Partially Available
```

These are not source-domain lifecycle states.

---

## No Activity ≠ no business history

A newly provisioned Client or restricted user may have no visible Activity even though underlying historical records exist.

---

## No visible Activity ≠ no Projects

Do not infer account emptiness from Activity emptiness.

---

## Source unavailable ≠ event did not happen

If Report service is down:

> Report released

Activity can remain historical truth while detail navigation is temporarily unavailable.

---

## Restricted ≠ deleted

If permission was revoked:

the Activity entry/detail may become restricted according to policy.

Do not report that the historical event was deleted.

---

## Projection delayed ≠ source event pending

The canonical business action may already be complete while Activity indexing lags.

Do not use Activity feed presence as workflow success confirmation.

---

## Feed generation failure ≠ source transaction failure

Example:

Contract successfully executes but Activity projection worker fails.

Contract remains executed.

Activity can backfill later.

---

## Duplicate projection

Retry should not show:

```text
Contract signed
Contract signed
Contract signed
```

for one source event.

---

## Out-of-order events

Late asynchronous events should not corrupt chronology.

Use authoritative event occurrence times.

---

## Infinite-scroll / pagination failure

Older-feed loading failure should preserve already loaded Activity instead of replacing entire screen with an error.

---

## Partial domain availability

Example:

```text
Projects      ✓
Reports       ✓
Finance       ✕
Support       ✓
```

A precomputed Activity projection can still show known safe history.

If live enrichment is unavailable, degrade only that enrichment.

---

## State Coverage

Design 063 inherits Design 150 plus:

```text
Activity Loading
Activity Available

No Activity Yet
No Results for Filters

Loading Older Activity
Older Activity Load Failed

Activity Entry Available
Activity Source Restricted
Activity Source No Longer Available
Activity Source Temporarily Unavailable

Client-safe Metadata Partial
Actor Details Restricted

Activity Projection Delayed
Activity Backfill In Progress where operationally relevant

Current User Activity Access Revoked

Partial Activity Service Failure
```

These states must not mutate underlying source records.

---

# 6. Responsive Behavior

## Desktop

Desktop should preserve chronological scanability:

```text
Activity / Account History
↓
Search / Filters / Date Range if frozen
↓
Chronological Feed
    ├── event icon/type
    ├── semantic event title
    ├── safe actor
    ├── Project/context
    ├── occurred date/time
    ├── safe supporting metadata
    └── authorized source link
↓
Load older activity / pagination
```

It should remain a Client-facing business-history feed, not an Audit-log table.

---

## Tablet

Following Design 152:

* feed remains single-column or compact structured rows,
* filters can collapse into drawer/dropdown,
* actor/context metadata wraps cleanly,
* source links remain touch-safe,
* timestamps stay associated with the correct event.

---

## Mobile

Priority:

```text
Account Activity
↓
Activity Entry
   ├── event title
   ├── Project/context
   ├── safe actor
   ├── date/time
   └── Open related item
↓
Next event
```

Avoid turning history into a dense multi-column table.

---

## Mobile chronological grouping

If the frozen design groups by:

* Today,
* Yesterday,
* Earlier,

those are presentation groups.

The underlying event timestamps remain exact.

---

## Mobile source-link safety

The CTA should describe the destination:

> View report
> View invoice
> Open support request

rather than ambiguous repeated:

> View.

---

## Accessibility

Each Activity entry needs a useful semantic sentence.

For example:

> Final Magazine Proof version 5 was approved by Sarah Patel on August 22 at 10:14 AM.

where actor visibility is permitted.

Do not rely solely on:

* icons,
* colored dots,
* timeline line position.

---

## Time accessibility

Where relative time is shown:

> 2 hours ago

an accessible/full exact timestamp should also be available where useful.

---

# 7. Backend Requirements

## Projection architecture

```text
Canonical Domain Transaction
        ↓
Domain Event / Transactional Outbox
        ↓
Activity Projection Processor
        ↓
Activity Type Registry
        ↓
Client-safe metadata mapper
        ↓
Audience / visibility policy
        ↓
ClientActivityEntry
        ↓
Activity Query Service
        ↓
Design 063
```

This keeps Activity out of source-domain write paths.

---

## Source event requirements

Domain events feeding Activity should include stable references such as:

```text
eventId
eventType
sourceDomain
sourceEntityType
sourceEntityId
organization/client context
Project/context where applicable
actor
occurredAt
schemaVersion
```

plus domain-specific safe/derivable metadata.

---

## Transactional outbox

For meaningful business events:

```text
source transaction commits
        ↓
outbox event persists
        ↓
Activity projection processes asynchronously
```

This reduces:

> business action succeeded but Activity event was permanently lost.

---

## Activity must not block source transaction

Example:

```text
Payment confirmed
↓
Finance commit succeeds
↓
Activity pipeline temporarily unavailable
```

Payment must still succeed.

Activity can catch up later.

---

## Projection idempotency

Processor should enforce something equivalent to:

```text
unique(sourceEventId, projectionAudience)
```

or another stable idempotency key.

---

## Projection replay/backfill

The architecture should permit controlled replay of historical domain events when:

* projection logic improves,
* an index is rebuilt,
* missing Activity is repaired.

Replay must not create duplicates.

---

## Projection schema evolution

Historical entries must remain readable as Activity type definitions evolve.

Possible approaches:

* versioned projection payload,
* migration,
* stable structured metadata.

Avoid unversioned arbitrary JSON with undocumented assumptions.

---

## Activity Type Registry

Conceptually:

```text
ActivityTypeDefinition
├── eventType
├── client visible?
├── audience policy
├── safe metadata mapper
├── actor display policy
├── source-link resolver
└── presentation template/version
```

This centralizes safety.

---

## Redaction before persistence or response

Sensitive metadata should ideally never enter Client Activity projection in the first place.

Do not store full internal event payload then rely on frontend hiding fields.

---

## Client Activity DTO

Conceptually:

```text
ClientActivityEntryView
├── activityId
├── activityType
├── title / semantic label
├── safe actor
├── safe Project/context
├── occurredAt
├── safe metadata
├── source availability
└── authorized deep-link descriptor
```

No internal correlation IDs or audit payloads.

---

## Query authorization

```text
current Portal membership
↓
Client/account scope
↓
allowed Activity audiences
↓
current resource/security policy
↓
filter/search/pagination
```

Authorization is performed before entries are returned.

---

## Cursor pagination

Activity feeds should use stable cursor pagination rather than offset-based pagination where history volume/insertions can make offsets inconsistent.

Conceptually:

```text
occurredAt + activityId
```

can form a deterministic cursor.

---

## Timezones

Store canonical timestamps.

Display according to current user/organization display preferences without changing event truth.

Historical occurrence time remains stable.

---

## Source-link resolver

Design 063 should not hard-code URLs as business data.

A source-link resolver can map:

```text
REPORT + ID
INVOICE + ID
PROJECT + ID
SUPPORT_REQUEST + ID
```

to the correct authorized destination during Phase 3B implementation.

Exact route finalization remains deferred.

---

## Source reauthorization

Before opening the destination:

the source screen's canonical authorization runs again.

---

## Activity filtering

Potential filters, only if frozen, can use:

* category/type,
* Project/context,
* date range,
* actor.

They are query criteria, not authorization.

---

## Search indexing

If Activity search exists:

index only Client-safe fields and preserve:

* tenant scope,
* audience scope,
* resource visibility dimensions.

---

## Actor resolution

The query can use:

```text
stable actor identity
+
Client-safe presentation projection
```

while formal historical snapshot/evidence remains in source domain.

---

## Deleted/deactivated actor

If a former Portal member is deactivated:

historical Activity can still show an appropriate preserved safe identity label.

Do not display:

> Unknown User

merely because Membership is inactive.

---

## Source-data failure

Because Activity entries are intentionally denormalized safe projections, the feed can often remain available even when one source service is temporarily unavailable.

Deep link/detail may be degraded separately.

---

## Notification integration

Activity creation should generally derive from the original source event, not from Notification creation.

Correct:

```text
Source Event
├── Activity projection
└── Notification projection
```

Not:

```text
Notification created
↓
Activity created
```

because notification preferences/delivery could otherwise alter history.

---

## Audit integration

Same pattern:

```text
Source action/event
├── AuditEvent
└── ClientActivityEntry
```

Each has independent policy.

---

## Project Timeline integration

Design 044 can consume:

* Project workflow history,
* milestones,
* relevant source events.

It should not simply filter Design 063's account feed and call it Project Timeline.

---

## Design 119 integration

Design 119 may consume richer internal Project event metadata while sharing the event/projection infrastructure.

---

## Activity event corrections

If a projection generated incorrect safe text due to a mapping bug:

presentation can be repaired without rewriting source business truth.

If the underlying business event itself is reversed/corrected:

emit/source a compensating domain event where appropriate.

---

## Backend Requirement Matrix

| Requirement                                    | Status                    |
| ---------------------------------------------- | ------------------------- |
| Client Portal authentication                   | **Critical**              |
| Active Portal membership                       | **Critical**              |
| Client/account isolation                       | **Critical**              |
| Canonical source-domain lineage                | **Critical**              |
| Activity projection separate from source truth | **Critical**              |
| Domain Event / Outbox integration              | **Critical**              |
| Stable source event IDs                        | **Critical**              |
| `occurredAt` vs `recordedAt` separation        | **Critical**              |
| ClientActivityEntry projection                 | **Critical**              |
| Activity type registry                         | **Critical**              |
| Client-safe metadata mapper                    | **Critical**              |
| Audience/visibility policy                     | **Critical**              |
| Internal metadata exclusion                    | **Critical**              |
| Actor type support                             | **Required**              |
| Client-safe actor projection                   | **Critical**              |
| Source entity references                       | **Critical**              |
| Current source reauthorization                 | **Critical**              |
| Account-wide vs Project/resource scope         | **Critical**              |
| Permission-safe search                         | **Critical**              |
| Permission-safe filtering                      | **Critical**              |
| Cursor pagination                              | **Required**              |
| Stable chronological ordering                  | **Critical**              |
| Event idempotency/deduplication                | **Critical**              |
| Replay/backfill support                        | **Required**              |
| Projection schema evolution                    | **Required**              |
| Partial source-service failure handling        | **Critical**              |
| Deactivated-user historical identity           | **Critical**              |
| Notification separation                        | **Critical**              |
| Message separation                             | **Critical**              |
| ClientAction separation                        | **Critical**              |
| Audit separation                               | **Critical**              |
| Project Timeline separation                    | **Critical**              |
| Design 039 Audit reuse                         | **Critical**              |
| Design 044 Timeline integration                | **Critical**              |
| Design 064 Notification integration            | **Critical**              |
| Design 119 future Project activity reuse       | **Critical architecture** |
| Design 138 future Audit reuse                  | **Critical architecture** |

---

# 8. Consolidation

Design 063 exposes several major implementation risks.

**Activity / source truth conflation**
A feed entry becomes authoritative business state.

**Activity / state-change conflation**
Every database status mutation becomes Client-visible history.

**Activity / Audit conflation**
Raw forensic security records are exposed to Clients.

**Activity / Notification conflation**
Historical events disappear when a Notification is dismissed.

**Activity / Message conflation**
Account History becomes another conversation inbox.

**Activity / ClientAction conflation**
Past event summaries become actionable tasks.

**Activity / Project Timeline conflation**
Cross-account history replaces structured Project progress.

**Activity / application-log conflation**
Technical stack traces, retries and provider errors enter Client Portal.

**Source Event / ClientActivityEntry conflation**
Full internal event payload is stored and exposed as Client Activity.

**Free-text-only Activity model**
No source lineage, event type or structured metadata remains.

**Client Activity / internal Activity Feed conflation**
Internal employee notes and operational data leak.

**Account membership / all-history access conflation**
Every Client user sees every organization's sensitive event.

**Project access / historical-access-forever conflation**
A user retains confidential Project history after access removal without deliberate policy.

**Activity entry / authorization-token conflation**
Old deep link bypasses current source access.

**Actor / current profile conflation**
Historical meaning changes when a user edits their Profile.

**Deactivated actor / deleted identity conflation**
Old Activity shows unknown user or loses attribution.

**Internal actor leakage**
Client sees private employee names/roles unnecessarily.

**Activity timestamp / ingestion timestamp conflation**
Late provider events appear to have occurred on the wrong date.

**Backfill / new Activity conflation**
Historical backfill looks like new business events.

**Duplicate event processing**
One source event appears several times.

**Projection delay / business-action failure conflation**
Missing feed entry makes successful payment/approval look incomplete.

**Notification-delivery dependency**
Activity exists only when optional Notification was delivered.

**Audit dependency**
Client Activity exists only if Audit is enabled/accessible.

**No Activity / no business records conflation**
Restricted/new user sees empty feed and system assumes account has no history.

**Source unavailable / event did not happen conflation**
Report-service outage removes historical release event.

**Restricted / deleted conflation**
Revoked source access tells user historical event was deleted.

**Source correction / silent historical rewrite**
Old Activity is changed into something that never happened.

**Activity retention / Audit retention conflation**
Client product history and compliance retention become one policy.

**Finance Activity / ledger conflation**
Activity entries are used for balance/payment calculations.

**Approval Activity / formal decision conflation**
Activity text “approved” becomes Approval evidence.

**Contract Activity / signature evidence conflation**
History feed replaces signature provider/Contract records.

**Publishing Activity / verification conflation**
Provider acceptance creates “published” Activity before verification.

**Metric-update noise**
Every analytics refresh creates Activity spam.

**Search leakage**
Unauthorized Contract/Finance/Project event text appears in search.

**Offset pagination instability**
New events cause duplicates/skipped rows while scrolling.

**063/044 duplicate timeline engine**
Project progress and account activity get separate/contradictory history truth.

**063/119 duplicate Project history domain**
Internal Project Activity invents another event model.

**063/138 duplicate Audit system**
Audit Logs and Client Account History are backed by incompatible events.

**063/064 duplicate recipient-history models**
Notifications Center and Activity feed each try to own business history.

No new screen is required.

These are **event lineage, projection safety, authorization, chronology, historical identity, replay, and cross-domain traceability requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT-SAFE CROSS-DOMAIN ACTIVITY & ACCOUNT HISTORY PROJECTION ANCHOR**

**Domain directive:**
**ActivityEvent ≠ AuditEvent ≠ Notification ≠ Message ≠ SourceDomainRecord ≠ StateChange ≠ ProjectTimeline ≠ ClientAccountHistory projection.**

**Source-of-truth directive:**
Projects, Approvals, Contracts, Finance, Publishing, Reports, Support, Membership and other canonical domains remain authoritative. Design 063 only projects meaningful Client-visible history from them.

**Projection directive:**
`ClientActivityEntry` is a read-model/projection with stable source-event and source-entity lineage. It must never become a second workflow/state database.

**Event directive:**
meaningful domain events flow through an outbox/event pipeline into Activity projection. Frontend pages should not manually append arbitrary history strings.

**Safety directive:**
Client Activity is produced through a governed ActivityTypeDefinition + safe metadata projection. Internal operational, security, Sales, employee and Audit-only data must never enter the Client payload by default.

**Audit directive:**
Designs 039/138 remain forensic/audit infrastructure. The same canonical business action can produce both an AuditEvent and a ClientActivityEntry, but the two remain independent.

**Notification directive:**
Designs 061/064 remain attention/delivery infrastructure. Reading, dismissing or disabling Notifications never alters historical Activity.

**Messaging directive:**
Design 045 remains Conversation/Message truth. Activity can reference safe messaging events without becoming a Message archive.

**Action directive:**
Design 047 remains Client action truth. Activity records what happened; it does not decide what currently requires action.

**Timeline directive:**
Design 044 remains the Project progress/timeline projection. Design 063 provides broader account history. They may consume the same canonical source events without sharing screen semantics.

**Actor directive:**
Activity retains stable actor lineage and uses Client-safe actor presentation. Role/profile changes or membership deactivation never destroy historical attribution.

**Chronology directive:**
`occurredAt` and projection/recording time remain separate; late provider events, replay, and backfill preserve true historical occurrence times.

**Authorization directive:**
the feed is permission-scoped before retrieval. Client membership does not imply visibility of every Finance, Contract, Project or administrative event.

**Historical-access directive:**
past Activity visibility follows explicit audience/resource policy. A historical Activity record is never itself an authorization token for an underlying resource.

**Deep-link directive:**
opening a related Project, Report, Invoice, Contract, SupportRequest or other object always triggers current source-domain authorization.

**Idempotency directive:**
source event IDs and projection identifiers prevent duplicate Activity entries during retries and replay.

**Replay directive:**
Activity projections must be rebuildable/backfillable without changing source-domain truth or creating duplicates.

**Schema directive:**
structured event/activity metadata should be evolution-safe/versioned so older entries remain renderable as new event types and UI wording evolve.

**Failure directive:**
Activity projection failure must never fail the underlying Approval, Payment, Contract, Publication or other source transaction. Projection catches up asynchronously.

**Reliability directive:**
empty feed, restricted source, source unavailable, delayed projection, older-page load failure and complete Activity service failure remain distinct states.

**Responsive directive:**
desktop provides chronologically rich account history with filtering; tablet/mobile reduce this to readable semantic event cards without becoming a dense forensic Audit table.

**Overlap directive:**
Designs **039, 041, 043–045, 052–064, 080, 119 and 138** must ultimately share canonical domain-event lineage and projection infrastructure while preserving separate Client Activity, Notification, Project Timeline and Audit products.

**Consolidation directive:**
**STANDARDIZE ONE DOMAIN-EVENT / OUTBOX FOUNDATION WITH DISTINCT PROJECTIONS — CLIENT ACTIVITY, PROJECT ACTIVITY/TIMELINE, NOTIFICATIONS AND AUDIT — AND BUILD DESIGN 063 AS A PERMISSION-SAFE CLIENTACTIVITYENTRY READ MODEL WITH SOURCE LINEAGE, SAFE METADATA, STABLE ACTOR IDENTITY, TRUE OCCURRENCE TIME, IDEMPOTENT REPLAY AND FRESH SOURCE AUTHORIZATION. DO NOT BUILD A SECOND BUSINESS-HISTORY SOURCE OF TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **63 / 153** |
| **PASS**                                   |                         **63** |
| **STANDARDIZE decisions**                  |                         **61** |
| **Potential implementation-overlap flags** |                         **54** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**63 / 153 = 41.2% audited.**

### Canonical history architecture after Design 063

```text
                 CANONICAL DOMAIN ACTION
                         │
                         ↓
                   DOMAIN EVENT
                         │
                  Transactional Outbox
                         │
        ┌────────────────┼─────────────────┐
        ↓                ↓                 ↓
 Client Activity     Notification       AuditEvent
  Design 063         Designs 064/080      039/138
        │                │                 │
“What happened?”   “What needs my      “Who did what,
                    attention?”          with forensic
                                         evidence?”
```

Project history stays a different projection:

```text
Domain Events / Workflow History
            │
      ┌─────┴──────┐
      ↓            ↓
Design 044      Design 119
Client Project  Internal Project
Timeline        Activity/Audit Timeline
```

And none replaces source truth:

```text
ApprovalDecision
Contract
Invoice / Payment
Publication
ReportVersion
SupportRequest
PortalMembership
        │
        └── remain canonical
```

# Next Sequential Audit Target

## **Design 064 — Client Notifications Center**

Its frozen identity and supplied route annotation are already locked.

The next audit must preserve:

> **NotificationEvent ≠ NotificationRecord ≠ ReadState ≠ DeliveryAttempt ≠ Notification Preference ≠ ClientAction ≠ Message ≠ ActivityEvent ≠ Source-Domain State.**

It must also reconcile **Design 061's notification policy/preferences** with the actual recipient-specific notification inbox while preserving:

* unread ≠ actionable,
* notification read ≠ source action completed,
* notification deletion/dismissal ≠ source record deletion,
* deep links must reauthorize the underlying resource,
* mandatory delivery policy and historical notification records remain separate from user preferences.

After Design 064 we continue strictly:

**065 Client Media Projects / Media Center → 066 Client Media Project Detail → 067 Client Questionnaires Library → 068 Client Drafts Library → … → 077 Client Access Recovery**

with the unchanged audit contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
