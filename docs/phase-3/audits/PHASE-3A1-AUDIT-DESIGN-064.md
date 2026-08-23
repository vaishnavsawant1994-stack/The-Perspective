# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 064 — Client Notifications Center

Its frozen identity is locked. The previously supplied route annotation is also locked as **`/client/notifications`**, but exact route architecture remains a Phase 3B concern rather than being re-decided here.

Design 064 should become the **canonical Client Portal recipient-specific notification inbox** for notifications generated from authorized business events across Projects, approvals, Contracts, billing, publishing, Reports, support, meetings, messages, and account/access workflows.

Its governing boundary is:

> **NotificationEvent ≠ NotificationRecord ≠ ReadState ≠ DeliveryAttempt ≠ NotificationPreference ≠ ClientAction ≠ Message ≠ ActivityEvent ≠ SourceDomainState.**

The central implementation rule is:

> **Design 064 shows what this specific Client user was notified about. It never becomes the authoritative state of the Project, Approval, Invoice, Contract, Message, Report, SupportRequest, or any other source business object.**

---

# 1. Classification

| Audit field                          | Classification                                                                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                        | **064**                                                                                                                               |
| **Canonical name**                   | **Client Notifications Center**                                                                                                       |
| **Product area**                     | Client Portal / Notifications / Attention Center                                                                                      |
| **User surface**                     | **Client Portal**                                                                                                                     |
| **Screen class**                     | Recipient-Specific Notification Inbox / Attention Workspace                                                                           |
| **Classification**                   | **Portal Projection Anchor — Client Notification Inbox Family**                                                                       |
| **Primary purpose**                  | Present authorized recipient-specific notifications, unread state, safe source context, and deep links to underlying business objects |
| **Primary canonical inbox entity**   | **NotificationRecord**                                                                                                                |
| **Source event entity**              | **NotificationEvent / canonical domain event**                                                                                        |
| **Recipient-state entity**           | **NotificationReadState** or recipient-scoped state                                                                                   |
| **Delivery entity**                  | **NotificationDeliveryAttempt**                                                                                                       |
| **Preference dependency**            | Design 061                                                                                                                            |
| **Client Action dependency**         | Design 047                                                                                                                            |
| **Message dependency**               | Designs 045 / 074                                                                                                                     |
| **Activity distinction**             | Design 063                                                                                                                            |
| **Source-domain dependencies**       | Projects, Approvals, Contracts, Finance, Publishing, Reports, Support, Meetings, Access                                               |
| **Internal notifications overlap**   | Design 080                                                                                                                            |
| **Alert administration overlap**     | Design 143                                                                                                                            |
| **Authentication/access dependency** | Designs 062 / 075–077                                                                                                                 |
| **Parent shell**                     | `ClientPortalShell` — Design 002                                                                                                      |
| **Primary read model**               | `ClientNotificationsView`                                                                                                             |
| **Template family**                  | `NotificationInboxWorkspaceTemplate`                                                                                                  |
| **Auth**                             | Required                                                                                                                              |
| **Authorization**                    | Current Portal membership + recipient ownership + safe source-resource visibility                                                     |
| **Implementation priority**          | **Critical Attention / Workflow Navigation / Client Communication**                                                                   |
| **Reuse level**                      | **Extremely High with Design 061 and future Design 080**                                                                              |

Design 064 should answer:

> **“What notifications have been generated for me, which are unread, which point to something that currently requires my action, what business object caused them, and can I still safely open that underlying resource?”**

Canonical flow:

```text
Canonical business event
        ↓
Notification policy
        ↓
Recipient resolution
        ↓
NotificationRecord
        │
        ├── recipient
        ├── safe source context
        ├── created/occurred time
        └── ReadState
                ↓
        Design 064 inbox
                ↓
       authorized deep link
                ↓
      canonical source screen
```

---

# 2. Reuse

## Reuse Design 061's Notification infrastructure

Design 061 already established the shared architecture:

```text
Source Event
    ↓
Notification Policy
    ↓
Recipient Resolution
    ↓
Preference Resolution
    ↓
NotificationRecord
    ↓
DeliveryAttempt
```

Design 064 should consume the resulting `NotificationRecord` and recipient state.

It must not create:

```text
ClientInboxNotification
PortalAlert
UserAlertV2
```

as another notification truth system.

---

## Design 061 ≠ Design 064

Their responsibilities remain deliberately separate.

### Design 061

> **What optional notifications should I receive?**

### Design 064

> **Which notifications have actually been created for me?**

Therefore:

```text
NotificationPreference
≠
NotificationRecord
```

A preference change affects future eligibility according to policy.

It does not rewrite historical inbox records.

---

## Reuse recipient-specific NotificationRecord

One source event can notify several users.

Correct:

```text
ReportReleased
      ↓
NotificationRecord N1 → User A
NotificationRecord N2 → User B
```

Each recipient can independently have:

```text
User A → READ
User B → UNREAD
```

Do not store one global read state on the source event.

---

## Reuse Design 047 for actionable work

A Notification can reference an active Client action.

Example:

```text
Notification:
“Final proof requires your approval.”

        ↓

ClientActionView:
ApprovalRequest AR-501

        ↓

Design 052
formal ApprovalDecision
```

The Notification can direct attention.

Design 047/source domain owns action truth.

---

## Reuse Design 045 / 074 for Messages

A Notification may say:

> You have a new message.

But the Message itself remains:

```text
Conversation
    ↓
Message
```

Design 064 must not turn into another message inbox.

---

## Reuse Design 063 event history separately

One event can create both:

```text
ReportReleased
   ├── Notification
   │   “Your report is ready.”
   │
   └── Activity
       “August Performance Report was released.”
```

Notification focuses on recipient attention.

Activity focuses on account history.

Do not derive one from the other's read/dismissal lifecycle.

---

## Future Design 080

**Design 080 — Team Notifications Center**

Expected architecture:

```text
ONE NOTIFICATION INFRASTRUCTURE
          │
     ┌────┴────┐
     ↓         ↓
Client Center  Team Center
Design 064     Design 080
```

Different audience projections.

Same core notification identity/delivery infrastructure.

---

## Design 143 relationship

Design 143 will administer system/alert rules.

It must not become the source of per-user read state.

Correct:

```text
Alert/Notification Rules
        ↓
Notification generation
        ↓
Recipient-specific records
        ↓
064 / 080
```

---

# 3. Entities

## NotificationEvent ≠ NotificationRecord

A canonical business event such as:

```text
InvoiceIssued
ApprovalRequested
SupportReplyReceived
ReportReleased
```

can generate one or many recipient NotificationRecords.

The event is source context.

The NotificationRecord is the user-specific inbox item.

---

## NotificationRecord should be recipient-specific

Conceptually:

```text
NotificationRecord
├── id
├── recipientUserId / membership context
├── notificationType
├── category
├── sourceEventId
├── sourceEntityType
├── sourceEntityId
├── safe title
├── safe summary
├── createdAt
├── occurredAt where useful
├── importance/attention classification
├── deep-link descriptor
└── recipient-state linkage
```

Exact schema belongs to Phase 3D.

---

## NotificationRecord ≠ ReadState

A NotificationRecord can exist independently of whether the recipient has read it.

Conceptually:

```text
NotificationRecord
      ↓
Recipient state
├── UNREAD
├── READ
└── perhaps DISMISSED/ARCHIVED where supported
```

Do not mix read state into the underlying business event.

---

## Unread ≠ actionable

This is one of the most important Design 064 rules.

Example:

```text
Notification:
“Your report is ready.”
State:
UNREAD
```

This may require no action.

Conversely:

```text
Notification:
“Invoice payment is required.”
State:
READ
```

can still correspond to an outstanding action.

Therefore:

> **Unread is attention state. Actionability is business state.**

---

## Read ≠ completed

Permanent:

```text
Notification READ
≠
ApprovalDecision completed
≠
Invoice paid
≠
Contract signed
≠
SupportRequest resolved
```

---

## Read ≠ source viewed necessarily

A user might mark a Notification read without opening its source.

Do not claim:

> Client viewed Contract

unless the Contract domain/provider has actual view evidence.

---

## NotificationRecord ≠ DeliveryAttempt

A record may exist in-app while email delivery fails.

Example:

```text
NotificationRecord N-100
├── In-app available
└── Email delivery failed
```

The inbox item remains valid.

---

## DeliveryAttempt ≠ ReadState

Email delivered does not make in-app Notification read.

---

## Notification preference ≠ historical NotificationRecord

Changing:

```text
Reports Email = OFF
```

does not delete earlier Report notifications.

---

## Mandatory delivery policy ≠ inbox retention

A security/legal message may have been mandatory to send.

That does not mean its NotificationRecord must remain unread forever or be impossible to archive according to product policy.

Delivery obligation and inbox presentation are separate.

---

## Notification deletion/dismissal ≠ source deletion

If the frozen design supports dismiss/archive/delete presentation:

```text
dismiss Notification
```

must never:

* delete Invoice,
* withdraw Approval,
* remove Contract,
* delete Message,
* close SupportRequest.

---

## Dismissal ≠ Action completion

Example:

> “Approval required.”

Client dismisses notification.

Approval remains pending.

The Client Action resolver can surface it elsewhere.

---

## Dismissal ≠ NotificationEvent deletion

The underlying event/history remains.

---

## Notification ≠ ClientAction

A Notification can be about:

* informative event,
* successful completion,
* warning,
* actionable request.

ClientAction represents genuine current obligation.

Do not force every notification into a work queue.

---

## Actionability should be dynamically resolved

If a Notification originally pointed to:

> Pay Invoice.

but the Invoice was paid elsewhere:

the Notification may remain historically visible while:

```text
actionable = false
```

or its CTA changes to:

> View invoice

according to current source state.

Do not preserve stale actionability forever.

---

## Notification action state should not be manually stored independently

Avoid:

```text
notification.completed = true
```

for Approval/Payment/etc.

Instead:

```text
resolve current source state
→ determine current available CTA
```

---

## Notification ≠ Message

A Notification may include a safe message preview if frozen.

It must not duplicate full Conversation content.

---

## Notification ≠ ActivityEvent

Notification has recipient attention/read semantics.

Activity has chronological business-history semantics.

---

## Notification ≠ AuditEvent

Do not expose internal forensic information such as:

* IP addresses,
* request IDs,
* policy evaluation,
* internal actor scope,
* security traces.

---

## Notification ≠ source-domain status

Avoid fields such as:

```text
notification.invoiceStatus = PAID
```

as independently editable truth.

Safe display can include a snapshot/summary, while current action/deep-link state comes from source domain as needed.

---

## Snapshot summary vs current state

A Notification may preserve:

> Invoice INV-120 was issued for $1,500.

That historical text can remain accurate.

But if current Invoice state is now Paid, its CTA/state should reflect current canonical Finance data.

This distinction is useful:

```text
historical notification content
≠
current source actionability
```

---

## Safe source lineage

Every actionable or navigable Notification should retain:

```text
sourceType
sourceId
sourceEventId
```

or equivalent.

Do not rely only on a hard-coded URL string.

---

## Deep-link descriptor ≠ finalized route truth

Phase 3A only needs structured destination intent.

Example:

```text
sourceType = INVOICE
sourceId = INV-120
```

Phase 3B will finalize route mapping.

---

## Source removed/restricted

A Notification can outlive current resource access.

Possible safe states:

```text
Source available
Source restricted
Source no longer available
```

Do not leak source details just because an old Notification remains.

---

## Notification category

Categories may include, where frozen:

```text
PROJECT
APPROVAL
MESSAGE
MEETING
CONTRACT
BILLING
PUBLISHING
REPORT
SUPPORT
ACCOUNT
SECURITY
```

Category is presentation/filter metadata.

It does not replace source entity identity.

---

## Notification importance ≠ mandatory policy

A notification can be:

```text
high importance
```

yet optional from a delivery-policy perspective.

Do not collapse priority and mandatory delivery semantics.

---

## Notification timestamp

Useful distinctions:

```text
source occurredAt
notification createdAt
delivery attemptedAt
readAt
```

They are not interchangeable.

---

## ReadAt should be recipient-specific

If read state exists:

```text
readAt
```

belongs to the current recipient's Notification state.

---

## Mark-all-read

If frozen Design 064 contains a bulk "mark all read" action:

it should update only recipient ReadState for the eligible NotificationRecords.

It must not:

* complete ClientActions,
* dismiss Notifications unless explicitly included,
* touch source domains.

---

## Notification count

Unread count should derive from:

```text
recipient-specific visible unread NotificationRecords
```

not:

* all source events,
* all Client account notifications,
* unresolved Client actions.

---

## Badge count ≠ action count

Example:

```text
Unread notifications = 8
Pending Client actions = 3
```

Both can be correct.

Design 041/047/064 should use separate definitions.

---

## Notification coalescing

If the platform groups multiple similar events, for example:

> 3 new messages

the grouped record must preserve enough source lineage to navigate safely.

No grouping capability is added unless frozen design requires it.

---

## Notification expiry

An inbox record may eventually age out/archive according to retention.

That does not expire the underlying source action.

Example:

```text
Notification no longer in active inbox
≠
Invoice no longer due
```

---

## Retention ≠ Audit retention

Notification retention is product/attention behavior.

Audit retention is compliance/forensic behavior.

Separate policies.

---

# 4. Permissions

Design 064 is fundamentally recipient-scoped.

The first authorization rule is:

> **A Portal user can read only NotificationRecords addressed to that user/membership context or deliberately shared according to an explicit notification model.**

---

## Current recipient derived from session

Never trust:

```text
recipientUserId
```

from query parameters.

Backend derives current User/membership.

---

## Same Client ≠ same inbox

Two users in the same organization have different NotificationRecords.

Do not expose an organization-wide shared inbox accidentally.

---

## Portal admin ≠ another user's inbox reader

Client administrator status should not automatically grant access to other users' notifications.

Notifications may reveal:

* private Messages,
* approvals,
* Finance actions,
* access/security events.

---

## Notification visibility ≠ source visibility forever

A historical Notification may exist, but current source access must be evaluated when opening the resource.

---

## Deep links must reauthorize

Non-negotiable:

```text
click Notification
      ↓
resolve source
      ↓
source-domain authorization
      ↓
allow / deny
```

Never trust Notification possession as entitlement.

---

## Notification preview should be Client-safe

The inbox itself can leak data before deep-linking.

Therefore title/summary generation must only contain information the recipient was permitted to receive.

---

## Revoked resource access

If a user's Project access is removed after Notification creation:

the system should follow deliberate policy for old notification content.

At minimum, the deep link must deny access.

Highly sensitive summaries may need redaction.

---

## Source-domain authorization examples

### Approval

Notification recipient may still need:

```text
ApprovalParticipant eligibility
+
portal approval permission
```

to decide.

### Invoice

Notification does not grant Finance access/payment authority.

### Contract

Notification does not make the recipient an authorized Signer.

### Message

Conversation participation remains canonical.

### Report

Report entitlement remains canonical.

---

## Mark read permission

A user may change ReadState only for their own NotificationRecord.

No cross-user mutation.

---

## Bulk mutation

`markAllRead()` must operate only on the authenticated recipient's current authorized inbox scope.

---

## Dismiss/archive permission

If frozen UX supports it, only recipient-specific presentation state changes.

Never source records.

---

## Notification preference access

Design 064 may link to Design 061 preferences, but it should not allow arbitrary organization policy changes.

---

## Mandatory notification records

Mandatory delivery does not mean the user cannot read/dismiss/archive the in-app record unless policy explicitly says so.

The mandatory rule concerns delivery obligation, not source business state.

---

## Security-sensitive notifications

Some security/account events may intentionally have:

* reduced preview text,
* no detailed deep link,
* stronger reauthentication.

Design 064 must support safe presentation policies.

---

## Reauthentication where needed

Opening highly sensitive source actions may require the source domain/auth layer to require recent authentication.

Notification Center itself should not bypass that.

---

# 5. States

Design 064 needs several independent dimensions.

### Inbox/query state

```text
Notifications Loading
Notifications Available
No Notifications
No Notifications Matching Filter
Loading More
Load More Failed
```

### Recipient state

```text
Unread
Read
Dismissed / Archived
```

only where frozen product uses these.

### Current source/action state

```text
Informational
Currently Actionable
Action Already Completed
Action Expired
Source Restricted
Source Unavailable
```

### Delivery state

```text
In-app Available
External Delivery Pending
External Delivery Failed
External Delivery Completed
```

mostly not necessarily Client-visible.

These must not become one `notification.status`.

---

## Unread ≠ actionable

Permanent.

---

## Read ≠ no longer important

A read Contract-signature reminder can still require action.

---

## Action completed ≠ Notification read automatically

If a Client completes an Approval from another screen:

the Notification may remain unread historically until read-state policy updates it.

If product wants automatic attention resolution, it must still remain distinct from source completion.

Do not delete the record.

---

## Action expired ≠ Notification deleted

Example:

> Contract signing request expired.

The Notification can remain historical while the original CTA becomes unavailable.

---

## Source restricted ≠ Notification missing

A safe historical notification may remain, but direct detail is unavailable.

---

## Delivery failed ≠ Notification missing

Email delivery can fail while in-app Notification exists.

---

## No Notifications ≠ no ClientActions

The user can have outstanding ClientActions even if notification history was cleared/never generated.

---

## No Notifications ≠ no account Activity

Design 063 history remains separate.

---

## Notification service unavailable ≠ empty inbox

Never show:

> You're all caught up

when the notification query failed.

---

## Mark-read saving state

If the user marks a record read:

```text
Updating ReadState
Updated
Update Failed
```

should reconcile with server truth.

---

## Optimistic read updates

Optimistic UI is fine if failure rolls back/reconciles accurately.

Read state is low-risk compared with business source state, but it still must not drift silently.

---

## Cross-device read synchronization

ReadState should be server-backed.

Reading on mobile should eventually reflect on desktop.

---

## Concurrent mark-all-read

Use idempotent commands.

Repeated requests should safely produce the same result.

---

## New notification arrives during mark-all-read

The operation should define a cutoff.

Example:

> Mark notifications currently visible/existing through timestamp X as read.

A Notification arriving afterward should remain unread.

This avoids race-condition surprises.

---

## State Coverage

Design 064 inherits Design 150 plus:

```text
Notifications Loading
Notifications Available

No Notifications
No Results for Filter

Unread Notification
Read Notification
Dismissed / Archived Notification

Marking Read
Read State Updated
Read State Update Failed

Marking All Read
Mark All Read Complete
Mark All Read Failed

Source Action Available
Source Action Completed
Source Action Expired
Source Restricted
Source Temporarily Unavailable

New Notification Arrived
Notification Updated Elsewhere

Notification Service Partially Available
Notification Service Unavailable
```

These remain distinct from business-domain lifecycle state.

---

# 6. Responsive Behavior

## Desktop

Desktop should preserve fast attention scanning:

```text
Notifications
↓
Unread / All / category filters if frozen
↓
Notification Feed
    ├── unread indicator
    ├── category/icon
    ├── semantic title
    ├── concise safe summary
    ├── Project/source context
    ├── timestamp
    ├── current action indicator where applicable
    └── deep link / source CTA
↓
Older notifications / pagination
```

This is not an Activity log or Message thread.

---

## Tablet

Following Design 152:

* notification rows can become compact cards,
* category/filter controls can collapse,
* unread state remains obvious,
* CTA remains associated with correct item,
* summaries wrap without hiding source context.

---

## Mobile

Priority:

```text
Notifications
↓
Unread / All
↓
Notification Card
   ├── category
   ├── title
   ├── safe summary
   ├── timestamp
   ├── unread state
   └── source action
↓
Next Notification
```

Avoid desktop-style dense columns.

---

## Mobile unread indicator

Unread status must not rely only on:

* blue dot,
* bold text.

Accessible semantic state should exist.

---

## Mobile action clarity

Examples:

```text
Review proof
View invoice
Open message
View report
Open support request
```

are better than repeated generic:

> View.

---

## Mark-all-read on mobile

If present, it should clearly mean:

> mark notifications read

—not:

> resolve all pending actions.

---

## Accessibility

Each notification should expose something equivalent to:

> Unread. Final proof requires approval. Project Executive Magazine. Received 12 minutes ago. Review proof.

where appropriate.

Do not rely only on iconography.

---

## Screen-reader chronology

New items should be inserted without causing disruptive focus jumps.

If live updates are supported, use polite announcement behavior rather than forcing focus.

---

# 7. Backend Requirements

## Read architecture

```text
Design 064
    ↓
ClientPortalSessionContext
    ↓
Recipient Notification Authorization
    ↓
ClientNotificationsQueryService
    │
    ├── NotificationRecord
    ├── recipient ReadState
    ├── safe source metadata
    ├── notification category/type
    ├── current source availability
    └── current action/deep-link descriptor
    ↓
ClientNotificationsView
```

---

## Generation architecture

Reuse Design 061:

```text
Canonical source event
        ↓
Notification policy
        ↓
recipient resolution
        ↓
source entitlement checks
        ↓
mandatory/preference resolution
        ↓
NotificationRecord
        ↓
DeliveryAttempt(s)
```

Design 064 begins primarily after `NotificationRecord` exists.

---

## Recipient identity

NotificationRecord must bind to stable canonical recipient identity/context.

Do not use current email address as recipient primary key.

---

## ReadState architecture

Conceptually:

```text
NotificationRecipientState
├── notificationRecordId
├── recipientId
├── readAt
├── dismissedAt / archivedAt where supported
└── revision
```

If NotificationRecord is already recipient-specific, these fields can live directly there.

Phase 3D decides physical schema.

The conceptual separation remains.

---

## Read command

Prefer:

```text
markNotificationRead(notificationId)
```

with authenticated recipient inferred from session.

---

## Mark-all-read command

Conceptually:

```text
markNotificationsReadThrough(cutoff)
```

or equivalent idempotent server operation.

Do not download all IDs to the browser and update them individually if one server command can safely handle the recipient scope.

---

## Notification query pagination

Use cursor pagination suitable for chronologically changing data.

Conceptually:

```text
createdAt + notificationId
```

or equivalent stable cursor.

---

## Unread count

Provide a canonical unread-count query/service.

Design 001/002 shell badges and Design 064 must reconcile to the same definition.

Do not calculate shell badge independently.

---

## Unread count authorization

Count only current recipient's eligible/visible NotificationRecords.

---

## Actionability resolver

A useful architecture is:

```text
NotificationRecord
      ↓
source reference
      ↓
ClientAction / source status resolver
      ↓
current CTA
```

This avoids stale action state.

---

## Actionability resolver ≠ source write

It reads canonical state.

The Notification Center never directly marks:

```text
Approval approved
Invoice paid
Contract signed
```

through a generic notification action endpoint.

The CTA delegates to the source-domain command/screen.

---

## Deep-link resolution

Use structured source references:

```text
sourceType
sourceId
context
```

and resolve destination in the navigation layer.

Do not persist hard-coded routes as canonical business identity where avoidable.

---

## Fresh authorization

Before returning sensitive current source metadata—and again when opening the source—verify current entitlement.

---

## Safe preview projection

Notification creation or query service should expose only approved safe fields.

Do not hydrate the entire source record and hand it to the frontend.

---

## Mandatory policy history

Historical NotificationRecord should preserve enough context to know it was created even if future preference/policy changes.

Do not rerun today's preference and delete yesterday's Notification because the user disabled that category afterward.

---

## Preference changes affect future generation

Conceptually:

```text
Preference changed at T2
```

does not rewrite records generated at T1.

---

## DeliveryAttempt remains independent

Design 064 does not need to surface provider debugging.

The backend can retain:

```text
DeliveryAttempt
```

for reliability/operations.

---

## Notification creation idempotency

A retry of the same:

```text
sourceEvent + recipient + notificationType
```

must not create duplicate inbox records.

---

## Notification update/coalescing idempotency

If grouping/coalescing exists later, updates must preserve deterministic recipient state.

No grouping is added here.

---

## Source-event replay

If Notification projection replays an outbox event, idempotency prevents duplicates.

---

## Permission revocation

When Design 062 changes resource access:

Notification Center should eventually reflect safe current source availability.

At minimum:

* deep link reauthorizes,
* sensitive current previews do not expose revoked resources.

---

## Membership deactivation

If ClientPortalMembership is deactivated:

Design 064 becomes inaccessible.

Historical NotificationRecords remain retained according to policy.

---

## Re-activation

If membership later reactivates where supported:

historical visibility should follow retention/current authorization policy rather than recreating records.

---

## Notification read Audit

Ordinary read-state changes generally do not need heavy Audit.

They may be operationally tracked.

Material security/business actions happen in source domains and Audit there.

---

## Activity integration

Do not create Client Activity from:

> Notification marked read.

That is attention-state noise rather than meaningful account history.

---

## Message read integration

Do not automatically mark Conversation Messages read merely because the corresponding Notification was read unless a deliberate UX policy explicitly performs both with clear semantics.

Default architecture keeps them separate.

---

## Provider outage

Email/push provider outage must not break in-app Notification retrieval.

---

## Partial service degradation

Example:

```text
Notification inbox        ✓
current source action      ✓
email delivery metadata    ✕
```

The Client inbox remains usable.

---

## Backend Requirement Matrix

| Requirement                              | Status                    |
| ---------------------------------------- | ------------------------- |
| Client Portal authentication             | **Critical**              |
| Active Portal membership                 | **Critical**              |
| Current recipient derived from session   | **Critical**              |
| Canonical NotificationRecord reuse       | **Critical**              |
| NotificationEvent separation             | **Critical**              |
| Recipient-specific ReadState             | **Critical**              |
| DeliveryAttempt separation               | **Critical**              |
| Design 061 preference/policy integration | **Critical**              |
| Historical-record/preference separation  | **Critical**              |
| Mandatory-policy/history separation      | **Critical**              |
| Unread/actionable separation             | **Critical**              |
| ClientAction/source-state resolver       | **Critical**              |
| Read/source-completion separation        | **Critical**              |
| Dismissal/source-deletion separation     | **Critical**              |
| Message separation                       | **Critical**              |
| Activity separation                      | **Critical**              |
| Source-domain state separation           | **Critical**              |
| Stable source references                 | **Critical**              |
| Safe source-preview projection           | **Critical**              |
| Fresh deep-link authorization            | **Critical**              |
| Permission-revocation handling           | **Critical**              |
| Recipient isolation                      | **Critical**              |
| Portal-admin cross-inbox protection      | **Critical**              |
| Idempotent notification generation       | **Critical**              |
| Idempotent mark-read                     | **Critical**              |
| Idempotent mark-all-read                 | **Critical**              |
| Race-safe mark-all-read cutoff           | **Required**              |
| Canonical unread count                   | **Critical**              |
| Shell/inbox badge consistency            | **Critical**              |
| Cursor pagination                        | **Required**              |
| Cross-device state sync                  | **Required**              |
| Notification retention policy            | **Required**              |
| Delivery-provider independence           | **Critical**              |
| Provider outage isolation                | **Critical**              |
| Partial service failure handling         | **Critical**              |
| Design 047 ClientAction reuse            | **Critical**              |
| Designs 045/074 Message reuse            | **Critical**              |
| Design 063 Activity separation           | **Critical**              |
| Design 080 future Team Center reuse      | **Critical architecture** |
| Design 143 future rule-management reuse  | **Critical architecture** |

---

# 8. Consolidation

Design 064 exposes several major implementation risks.

**NotificationEvent / NotificationRecord conflation**
One event gets one global recipient/read state.

**NotificationRecord / ReadState conflation**
Recipient state cannot vary independently.

**Unread / actionable conflation**
Every unread item becomes a task.

**Read / completed conflation**
Opening notification approves, pays, signs, or resolves source workflow.

**Read / source-viewed conflation**
Mark-read is falsely recorded as Contract/Report view evidence.

**Notification / ClientAction conflation**
Inbox becomes the authoritative work queue.

**Notification / Message conflation**
Notification Center duplicates Conversation/Message history.

**Notification / Activity conflation**
Dismissed notifications erase account history.

**Notification / Audit conflation**
Recipient inbox becomes compliance history.

**Notification / source-domain state conflation**
Invoice/Approval/Contract state is copied and edited in the Notification record.

**Historical notification / current actionability conflation**
Old notification continues showing stale Pay/Approve CTA after source action was completed elsewhere.

**Notification Preference / historical record conflation**
Turning off a category removes earlier notifications.

**Mandatory delivery / permanent unread conflation**
Required delivery makes an inbox item impossible to manage.

**Dismissal / source deletion conflation**
Dismissing item deletes Invoice/Message/SupportRequest.

**Dismissal / action completion conflation**
User can hide outstanding approval/payment obligation by dismissing notification.

**Same Client / shared inbox conflation**
Every Client organization user sees every notification.

**Portal Admin / notification-superuser conflation**
Client administrator reads private notifications belonging to other users.

**Notification possession / authorization conflation**
Old deep link bypasses revoked resource access.

**Notification preview / safe data projection failure**
Inbox leaks confidential Contract/Finance/Message details before deep-link authorization.

**Role change / historical inbox leakage**
Revoked user retains sensitive source previews indefinitely without policy.

**Notification timestamp / source occurrence conflation**
Async delivery makes event appear to happen later than it did.

**DeliveryAttempt / inbox record conflation**
Email retries create duplicate visible notifications.

**Email delivery / read state conflation**
Delivered email marks in-app record read.

**Message notification / Message read conflation**
Reading notification alters Conversation unread state unexpectedly.

**Notification count / ClientAction count conflation**
Header badge and pending-work count become contradictory.

**Mark-all-read / complete-all-actions conflation**
Bulk attention action changes source workflows.

**Mark-all-read race**
Newly arrived notifications are accidentally marked read even though the user never saw them.

**Notification expiry / source expiry conflation**
Old inbox item disappearing cancels underlying action.

**Retention / Audit retention conflation**
Product inbox deletion changes compliance records.

**Preference disabled / delivery failure conflation**
Provider bounce or outage changes user preference automatically.

**Provider outage / source failure conflation**
Notification delivery issue affects Project/Approval/Finance workflow.

**Offset pagination instability**
New arrivals cause duplicate/missing records while browsing older notifications.

**Notification-service failure / empty inbox conflation**
System tells user “all caught up” during an outage.

**064/061 duplicate notification foundation**
Preference settings and Notification Center create separate notification identities.

**064/063 duplicate history model**
Notification and Account Activity compete as business history.

**064/080 duplicate recipient infrastructure**
Client and internal notifications use incompatible record/read models.

**064/143 duplicate event-rule logic**
Notification Center tries to decide which source events produce notifications.

No additional screen is required.

These are **recipient identity, read state, source lineage, actionability, authorization, delivery, preference, and notification-history requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT RECIPIENT-SPECIFIC NOTIFICATION INBOX & ATTENTION CENTER ANCHOR**

**Domain directive:**
**NotificationEvent ≠ NotificationRecord ≠ ReadState ≠ DeliveryAttempt ≠ NotificationPreference ≠ ClientAction ≠ Message ≠ ActivityEvent ≠ SourceDomainState.**

**Reuse directive:**
Design 061 remains the canonical Notification policy/preference foundation. Design 064 consumes recipient-specific NotificationRecords generated by that shared infrastructure.

**Recipient directive:**
every NotificationRecord belongs to an explicit recipient/User-membership context. Same Client organization never implies shared inbox visibility.

**Read-state directive:**
read/unread is recipient attention state only. It never changes Approval, Payment, Contract, Message, Support, Project, Report, or other source business state.

**Action directive:**
actionability comes from Design 047 or the canonical source-domain state. An unread Notification can be informational, and a read Notification can remain actionable.

**Current-state directive:**
historical Notification content can remain stable while current CTA/actionability is resolved from the source domain so stale actions are not presented after completion/expiry.

**Dismissal directive:**
dismiss/archive/delete-presentation operations, if present in the frozen UI, affect only recipient inbox state. They never delete the source event, source record, Account Activity, or current Client obligation.

**Preference directive:**
Design 061 preferences govern eligible future optional generation/delivery. Changing a preference never rewrites historical NotificationRecords.

**Mandatory-policy directive:**
mandatory security/legal/billing/transactional delivery policy remains separate from both user preference and recipient inbox read state.

**Delivery directive:**
NotificationRecord and DeliveryAttempt remain separate. Email/push provider failure must never duplicate or remove the in-app NotificationRecord.

**Message directive:**
Designs 045/074 remain Conversation/Message truth. Message notifications are attention signals, not another communication store.

**Activity directive:**
Design 063 remains account-history truth. Notification dismissal/read state does not alter Client Activity.

**Authorization directive:**
Notification possession is never authorization. Every deep link and sensitive source action performs fresh canonical source-domain authorization.

**Preview directive:**
inbox summaries use deliberately Client-safe metadata so restricted Contract, Finance, Message, or Project information cannot leak through notification previews.

**Scope-revocation directive:**
Project/role/membership changes from Design 062 must affect future source access immediately enough; old NotificationRecords cannot preserve revoked authority.

**Unread-count directive:**
shell badges and Design 064 must share one canonical recipient-visible unread-count definition. Notification count and ClientAction count remain independent.

**Bulk-read directive:**
mark-all-read modifies recipient ReadState only and uses idempotent/race-safe server semantics; it never resolves source actions.

**Identity directive:**
recipient linkage uses stable User/membership identity rather than mutable email address.

**Reliability directive:**
notification generation/delivery/read-state failures remain independent from the canonical business transactions that caused the notifications.

**Pagination directive:**
the inbox uses stable chronological cursor semantics capable of handling newly arriving notifications without duplicate/skipped records.

**Responsive directive:**
desktop optimizes attention scanning with unread/category/context/action; mobile becomes clear notification cards with semantic read state and destination-specific CTAs.

**Overlap directive:**
Designs **001–002, 039, 045, 047, 052–064, 074–080 and 143** must ultimately consume one NotificationEvent + Policy + Recipient + NotificationRecord + ReadState + DeliveryAttempt foundation while preserving ClientAction, Message, Activity and Audit as distinct products.

**Consolidation directive:**
**STANDARDIZE ONE PLATFORM-WIDE RECIPIENT NOTIFICATION MODEL — SOURCE EVENT + NOTIFICATION POLICY + RECIPIENT RESOLUTION + PREFERENCE/MANDATORY POLICY + NOTIFICATIONRECORD + RECIPIENT READ/DISMISS STATE + DELIVERY ATTEMPTS + SAFE SOURCE REFERENCE + CURRENT ACTIONABILITY RESOLUTION — AND DO NOT BUILD DESIGN 064 AS A SECOND WORK QUEUE, MESSAGE INBOX, ACTIVITY LOG OR SOURCE-DOMAIN STATE STORE.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **64 / 153** |
| **PASS**                                   |                         **64** |
| **STANDARDIZE decisions**                  |                         **62** |
| **Potential implementation-overlap flags** |                         **55** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**64 / 153 = 41.8% audited.**

### Canonical notification architecture after Designs 061 + 064

```text
                 SOURCE DOMAIN EVENT
                         │
                         ↓
               Notification Policy
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
     Recipient       Mandatory      Preference
     Resolution       Policy        Resolution
          │              │              │
          └──────────────┼──────────────┘
                         ↓
                 NotificationRecord
                         │
                ┌────────┴─────────┐
                ↓                  ↓
           Recipient State     DeliveryAttempt
          UNREAD / READ             │
                                    ↓
                             Email / Push / etc.
```

Design responsibilities stay clean:

```text
Design 061
Notification Preferences
        ↓
“What optional delivery do I want?”

Design 064
Notification Center
        ↓
“What notification records were generated for me?”

Design 047
Client Actions
        ↓
“What genuinely requires action from me?”

Design 063
Account Activity
        ↓
“What meaningful business history occurred?”

Design 045 / 074
Messages
        ↓
“What communication exists?”
```

And all of them continue to point back to canonical source domains rather than becoming source truth themselves.

# Next Sequential Audit Target

## **Design 065 — Client Media Projects / Media Center**

Its frozen identity and supplied route annotation are already locked.

The next audit must preserve the media-portfolio boundary:

> **Project ≠ MediaProjectProjection ≠ EditorialProject ≠ MagazineIssue ≠ PodcastEpisode/Production ≠ VideoProject ≠ Event ≠ Publication ≠ Deliverable ≠ ClientMediaSummary.**

It will need to reconcile the canonical Project foundation from **Design 023** with the specialized production domains from **Designs 024–028**, while ensuring the Client Media Center is a **cross-media discovery/projection surface rather than a second Project or production backend**.

After Design 065 we continue strictly:

**066 Client Media Project Detail → 067 Client Questionnaires Library → 068 Client Drafts Library → 069 Client Designs / Proofs Library → … → 077 Client Access Recovery**

with the unchanged audit contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
