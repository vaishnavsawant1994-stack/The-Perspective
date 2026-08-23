# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 080 — Team Notifications Center

Design 080 should become the **canonical authenticated Team Workspace recipient-specific notification inbox** using the same platform notification infrastructure already established through Designs 061 and 064.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **DomainEvent ≠ NotificationRecord ≠ Recipient ≠ NotificationType ≠ ReadState ≠ DeliveryAttempt ≠ DeliveryChannel ≠ NotificationPreference ≠ ClientAction/WorkItem ≠ ActivityEvent ≠ AuditEvent.**

The central implementation rule is:

> **A notification tells a specific authorized recipient that something happened or may require attention. It does not become the underlying business event, Task, Approval, Message, ClientAction, source-domain status, Activity history, or Audit evidence. Reading or dismissing a notification changes only recipient-level notification state.**

---

# 1. Classification

| Audit field                             | Classification                                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Design ID**                           | **080**                                                                                           |
| **Canonical name**                      | **Team Notifications Center**                                                                     |
| **Product area**                        | Team Workspace / Notifications / Personal Attention                                               |
| **User surface**                        | **Authenticated Team Workspace**                                                                  |
| **Screen class**                        | Recipient-Specific Notification Inbox / Attention Center                                          |
| **Classification**                      | **Team Notification Inbox Anchor — Cross-Domain Recipient Attention Family**                      |
| **Primary purpose**                     | Give the current Team member one authorized inbox of system/domain notifications relevant to them |
| **Canonical trigger**                   | **DomainEvent**                                                                                   |
| **Primary notification entity**         | **NotificationRecord**                                                                            |
| **Recipient entity/context**            | **User / OrganizationMembership recipient binding**                                               |
| **Notification taxonomy**               | **NotificationType**                                                                              |
| **Attention state**                     | **ReadState**                                                                                     |
| **External delivery entity**            | **DeliveryAttempt**                                                                               |
| **Delivery mechanism**                  | **DeliveryChannel**                                                                               |
| **Preference foundation**               | Design 061                                                                                        |
| **Client notification center analogue** | Design 064                                                                                        |
| **Personal work dependency**            | Design 078 — explicitly separate                                                                  |
| **Search dependency**                   | Design 079 — explicitly separate                                                                  |
| **Activity dependency**                 | Design 063                                                                                        |
| **Audit dependency**                    | Design 039                                                                                        |
| **Messaging dependency**                | Designs 014 / 074                                                                                 |
| **Approval dependency**                 | Design 029                                                                                        |
| **Task dependency**                     | Design 034                                                                                        |
| **Parent shell**                        | `InternalAppShell` — Design 001                                                                   |
| **Primary query service**               | `TeamNotificationQueryService`                                                                    |
| **Generation/orchestration service**    | `NotificationOrchestrator`                                                                        |
| **Auth**                                | Required                                                                                          |
| **Authorization**                       | Current authenticated OrganizationMembership + recipient identity + current source authorization  |
| **Implementation priority**             | **Critical Attention / Privacy / Cross-Domain Event Delivery**                                    |
| **Reuse level**                         | **Extremely High — same platform notification infrastructure as Designs 061/064**                 |

Design 080 should answer:

> **“What notifications were generated for me in this workspace, which ones are unread, what caused each notification, is its source still accessible/actionable, and which safe destination can I open?”**

Conceptually:

```text
Canonical DomainEvent
        ↓
NotificationType / policy
        ↓
Recipient resolution
        ↓
Current authorization
        ↓
NotificationRecord per recipient
        ↓
In-app notification inbox
        │
        ├── ReadState
        └── optional DeliveryAttempts
                ├── Email
                ├── Push
                └── other configured channels
        ↓
Design 080
```

---

# 2. Reuse

## Designs 061 and 064 already establish the canonical notification foundation

Design 061 established the preference/policy boundary:

> **Notification Event ≠ Notification Record ≠ Delivery Attempt ≠ Channel ≠ Notification Preference ≠ Organization Default ≠ Read State ≠ Client Action ≠ Message.**

Design 064 established the recipient-specific inbox model.

Design 080 must reuse the same platform infrastructure.

Do **not** create:

```text
TeamNotification
InternalNotification
EmployeeNotification
WorkspaceAlertNotification
```

as another independent backend.

Correct:

```text
Platform Notification Infrastructure
        │
        ├── Design 064
        │   Client recipient projection
        │
        └── Design 080
            Team recipient projection
```

Different audience and permissions.

Same foundational engine.

---

## Design 080 ≠ Design 078 My Work

This distinction is permanent.

### Design 078

> What work currently requires me?

### Design 080

> What relevant events/information were delivered to my attention?

Therefore:

```text
Notification
≠
PersonalWorkQueueEntry
```

Examples:

```text
“Contract fully executed”
→ Notification
→ usually no personal work
```

while:

```text
“Approval required from you”
→ Notification may exist
+
ApprovalParticipant obligation
→ My Work entry may exist
```

The notification and the work obligation remain separate projections over the source domain.

---

## Work can exist without Notification

A Task may be assigned to a user even if:

* notification generation failed,
* notifications were disabled where allowed,
* the notification has been dismissed,
* the notification expired from the inbox.

The Task remains work.

---

## Notification can exist without Work

Examples:

* Project completed.
* Contract signed.
* New Client joined.
* Report generated.
* Publication verified live.

These can be informative notifications without any PersonalWorkQueueEntry.

---

## Design 080 ≠ Design 063 Activity

### Notifications

Recipient-specific attention.

### Activity

Cross-domain historical account/client/project activity projection.

Permanent:

```text
NotificationRecord
≠
ActivityEvent
```

An ActivityEvent can exist without notifying every user.

---

## Design 080 ≠ Design 039 Audit

Audit records are governance/security evidence.

Notification records are recipient-facing attention records.

Never build Notifications by exposing AuditEvent payloads directly.

---

## Design 080 ≠ Message Inbox

A notification:

> New message from Sarah.

is not the Message.

Opening it should lead to the canonical Conversation/Message system.

Designs 014/074 remain authoritative.

---

## Reuse canonical source-domain actions

A notification about:

* Approval,
* Task,
* Invoice,
* Contract,
* Project,
* Message,

must link to the canonical source entity.

It must not perform its own duplicate business mutation.

---

## Reuse Design 061 preference resolution

The same policy stack should conceptually support:

```text
NotificationType policy
+
Organization defaults
+
Recipient preference
+
mandatory/security policy
+
channel availability
```

Team Workspace may have its own preference surface elsewhere, but it should still use the **same underlying preference/policy model**, not another delivery engine.

---

# 3. Entities

## DomainEvent

A DomainEvent represents something meaningful that happened in a canonical source domain.

Examples:

```text
TaskAssigned
ApprovalRequested
ContractSigned
InvoiceOverdue
MessageCreated
ProjectDeadlineChanged
PublicationVerified
```

DomainEvent is not itself a NotificationRecord.

---

## One DomainEvent can produce zero, one, or many notifications

Example:

```text
ApprovalRequested AR-100
        ↓
Recipients:
Alice
Bob
Carol
        ↓
NotificationRecord N1 → Alice
NotificationRecord N2 → Bob
NotificationRecord N3 → Carol
```

This is required.

Do not model:

```text
one event
=
one global notification row shared by everybody
```

if recipient read/dismissal state is personal.

---

## DomainEvent ≠ NotificationType

`DomainEvent` says what happened.

`NotificationType` says how a relevant event should be represented/delivered to a recipient.

Example:

```text
DomainEvent:
ApprovalParticipantActivated

NotificationType:
APPROVAL_REQUIRED
```

---

## NotificationType should be registry-driven

Conceptually:

```text
NotificationType
├── key
├── category
├── safe template
├── priority/importance policy
├── allowed channels
├── preference policy
├── mandatory flag
├── deep-link resolver
├── retention behavior
└── deduplication policy
```

Exact schema belongs to Phase 3D.

---

## NotificationType ≠ NotificationRecord

The type is definition/configuration.

The record is one recipient-specific occurrence.

---

## NotificationRecord

Conceptually:

```text
NotificationRecord
├── id
├── organizationId
├── recipient reference
├── notificationType
├── source event ID
├── source type
├── source entity ID
├── safe rendered/snapshot parameters
├── createdAt
├── read-state reference
└── recipient presentation state
```

It should preserve enough lineage to identify why the notification exists.

---

## NotificationRecord ≠ source entity

Permanent.

Example:

```text
Notification:
“Invoice INV-102 is overdue”

≠

Invoice INV-102
```

Deleting/dismissing the Notification never changes the Invoice.

---

## Recipient ≠ NotificationRecord

Recipient represents who is supposed to receive the notification.

The same person can receive many records.

---

## Team recipient should normally be membership/workspace-aware

For multi-organization users:

```text
User U1
├── OrganizationMembership A
└── OrganizationMembership B
```

Design 080 should not accidentally mix unrelated workspace notifications.

Conceptually the record needs enough context to bind:

```text
recipient User
+
Organization / Membership context
```

where appropriate.

---

## User ≠ recipient context universally

A globally scoped security notification may conceptually be User-scoped.

A workspace Task notification is OrganizationMembership/workspace scoped.

Architecture should support explicit recipient scope rather than assuming every notification has identical tenancy semantics.

Design 080 itself remains Team Workspace scoped.

---

## NotificationRecord ≠ ReadState

Read is recipient attention state.

Conceptually:

```text
NotificationReadState
├── notificationId
├── recipientId
└── readAt
```

The physical model could optimize this differently, but the concepts remain separate.

---

## Unread ≠ actionable

Critical.

A Notification may be unread while the source action is already complete.

Example:

```text
Notification:
“Approval required”

Meanwhile another workflow event:
Approval withdrawn
```

The notification remains historically unread, but no approval action is currently available.

---

## Read ≠ source viewed

Reading the notification center item does not necessarily mean the underlying:

* Contract,
* Invoice,
* Message,
* Project,
* Draft

was opened/viewed.

---

## Read ≠ source action completed

Permanent:

```text
notification.readAt != null
≠
Task completed
≠
Approval decided
≠
Message replied
```

---

## Dismissed ≠ read

If frozen Design 080 supports dismissal/archive:

```text
ReadState
≠
DismissalState
```

A notification could be:

* unread but dismissed through bulk behavior,
* read but still retained,
* archived after reading,

depending on product policy.

Do not collapse dismissal into source action.

---

## Dismissal ≠ source deletion

Permanent.

---

## NotificationRecord ≠ DeliveryAttempt

The in-app record can exist independently of:

* email,
* push,
* external provider delivery.

Correct:

```text
NotificationRecord N1
├── in-app available
├── Email DeliveryAttempt E1
└── Push DeliveryAttempt P1
```

---

## DeliveryAttempt ≠ DeliveryChannel

Channel identifies the delivery mechanism.

Attempt identifies one actual delivery operation.

---

## One NotificationRecord can have multiple DeliveryAttempts

Example:

```text
Notification N1
├── Email attempt 1 — failed
├── Email attempt 2 — delivered
└── Push attempt 1 — delivered
```

No duplicate NotificationRecord is needed for retries.

---

## DeliveryState ≠ ReadState

Permanent:

```text
EMAIL_DELIVERED
≠
NOTIFICATION_READ
```

Provider delivery only proves transport behavior.

---

## Provider accepted ≠ recipient received/read

Permanent.

---

## External delivery failure ≠ in-app Notification failure

This is essential.

Example:

```text
NotificationRecord created ✓
Email provider down ✕
```

Design 080 should still show the in-app Notification.

---

## NotificationPreference ≠ NotificationRecord

Preference influences eligible **future delivery/generation behavior** according to policy.

Changing a preference does not rewrite historical NotificationRecords.

---

## NotificationPreference ≠ mandatory policy

A user preference might be:

```text
Task updates → disabled for email
```

but a mandatory security notification can still be required.

---

## Mandatory ≠ guaranteed transport success

Mandatory means:

> preference cannot suppress the required notification/delivery policy.

It does not mean an external provider can never fail.

Failed mandatory delivery should be retried/escalated according to policy.

---

## Mandatory notification ≠ unrestricted data disclosure

Even mandatory events must respect safe content and recipient identity.

“Mandatory” bypasses ordinary preference suppression, not privacy/authorization.

---

## NotificationPreference ≠ channel availability

A user can prefer email while email delivery is temporarily unavailable.

The preference remains enabled; the channel's operational state is separate.

---

## Source event ≠ notification content snapshot

The notification may render a safe snapshot such as:

> “Proposal approval requested.”

But source truth continues to evolve independently.

---

## Historical NotificationRecord ≠ permanent access entitlement

Design 064's invariant applies fully here.

Example:

```text
T1:
User can access Contract C1
Notification N1 generated

T2:
Contract permission revoked

T3:
User opens Notification N1
```

The deep link must deny access according to current Contract authorization.

---

## Notification content after access revocation

The record may remain for historical recipient state, but sensitive rendering should remain safe.

Depending on policy:

* suppress sensitive details,
* show a generic “This item is no longer available,”
* hide the record from active inbox projection.

What it must not do is leak current restricted source content.

---

## Source state ≠ Notification state

Example:

```text
Notification:
UNREAD

Task:
COMPLETED
```

Valid.

---

## Source deleted/archived ≠ Notification deletion automatically

Historical notification can remain with safe unavailable-source treatment.

---

## NotificationRecord ≠ ClientAction / WorkItem

A notification can point to a current source action.

It does not own the action.

Correct:

```text
Notification
      ↓
SourceActionResolver
      ↓
Task / Approval / FollowUp
```

not:

```text
notification.actionCompleted = true
```

as business truth.

---

## NotificationRecord ≠ ActivityEvent

A DomainEvent can independently produce both:

```text
DomainEvent
├── NotificationRecord
└── ActivityEvent
```

These projections can have different:

* recipients,
* visibility,
* retention,
* presentation.

---

## NotificationRecord ≠ AuditEvent

Same principle.

---

## Duplicate notification prevention

A retried DomainEvent should not create duplicate recipient notifications.

Stable identity can conceptually include:

```text
sourceEventId
+
recipient
+
NotificationType
```

or an equivalent dedupe key.

---

## Similar events ≠ necessarily duplicates

Example:

```text
Task assigned at 10:00
Task reassigned at 12:00
```

These are two real events.

Do not dedupe purely on title text.

---

## Notification grouping ≠ identity

If frozen UI groups similar notifications visually:

grouping remains presentation.

Underlying records preserve their individual event lineage.

---

## Notification count is recipient-specific

Unread counts must be derived from the same:

* recipient,
* workspace,
* visibility,
* ReadState

policy as the list.

---

# 4. Permissions

Design 080 requires **two distinct authorization moments**:

1. before notification generation;
2. when opening/currently rendering sensitive source context.

Conceptually:

```text
DomainEvent
      ↓
resolve candidate recipients
      ↓
canRecipientBeNotified(source, event)?
      ↓
create NotificationRecord
```

Then later:

```text
Notification clicked
      ↓
resolve canonical source
      ↓
fresh can(actor, action, resource)
      ↓
open or deny safely
```

---

## Recipient resolution must be server-side

The source/browser must not submit arbitrary:

```text
recipientUserIds = [...]
```

without canonical policy validation.

---

## Event actor ≠ recipient

The person who caused an event may or may not receive its notification.

Keep separate.

---

## Same Organization ≠ notification recipient

A Task assignment should notify the intended assignee(s), not every employee in the organization.

---

## Project membership ≠ every Project notification

Recipient policy may depend on:

* assignee,
* owner,
* approver,
* watcher/subscriber if supported,
* responsible manager,
* explicit participant.

Do not broadcast by default.

---

## Notification generation must respect source visibility

A user should not receive a notification containing:

> Confidential Contract C-99...

if they cannot access the Contract under the source policy.

---

## Recipient authorization can change after generation

Therefore the inbox query/deep link must not blindly trust historical recipient eligibility.

---

## Notification possession ≠ source access

Permanent.

---

## Read permission ≠ source action permission

A user can read:

> Approval requested.

but source `decideApproval()` still requires exact ApprovalParticipant eligibility.

---

## Team Notification Center is self-scoped

Ordinary endpoint should be conceptually:

```text
getMyNotifications(currentMembership)
```

not:

```text
getNotifications(userIdFromBrowser)
```

---

## Manager ≠ read all employee notifications automatically

Notifications can contain private/sensitive details.

Oversight belongs to dedicated administrative/audit surfaces, not personal notification inbox impersonation.

---

## Multi-tenant isolation

No Organization A notification should appear inside Organization B workspace context.

---

## Direct Notification ID must reauthorize recipient

Knowing:

```text
notificationId
```

must not allow another user to fetch it.

---

## Notification source snapshot minimization

Store/display only necessary safe source metadata.

Do not copy entire source entity payloads into NotificationRecord.

---

## Message notifications

Opening a Message notification requires current ConversationParticipant authorization.

Design 074 rules continue.

---

## Contract notifications

Opening requires current Contract authorization and Signer/participant rules for actions.

---

## Invoice notifications

Finance permissions remain authoritative.

---

## Approval notifications

Read is different from decision authority.

---

## Audit/security notification content

Mandatory/security notifications should be appropriately scoped to the intended User and not expose secrets.

---

## Preferences are self-scoped unless separately administered

Users should not edit another employee's personal notification preferences through ordinary Team Notifications.

---

## Mandatory policy cannot be disabled through request tampering

Even if browser submits:

```text
disabled = true
```

for a mandatory security type, server policy remains authoritative.

---

# 5. States

Design 080 must keep **inbox/query state, ReadState, dismissal/presentation state, source actionability, external delivery state, and source availability** separate.

### Inbox/query state

```text
Loading
Available
Empty
Filter Empty
Loading More
Partial Results
Failed
```

### Read state

```text
Unread
Read
Read Updating
Read Update Failed
```

### Presentation state, if frozen design supports it

```text
Active
Dismissed / Archived
```

### Source/action state

```text
Informational
Action Available
Action Already Completed
Action Withdrawn
Action Restricted
Source No Longer Available
Action State Unavailable
```

### Delivery state

```text
Not Requested
Queued
Sending
Provider Accepted
Delivered
Failed
Retrying
Delivery State Unknown
```

These must not collapse into one `notification.status`.

---

## Empty inbox ≠ notification service failure

Permanent.

---

## Zero unread ≠ unread resolver unavailable

Critical.

---

## Unread ≠ action required

Permanent.

---

## Read ≠ action complete

Permanent.

---

## Dismissed ≠ action complete

Permanent.

---

## Action complete ≠ notification read

A Task can be completed without the notification ever being opened.

---

## Source unavailable ≠ Notification never existed

Historical recipient record can remain safely represented.

---

## Source access revoked ≠ source deleted

Keep separate.

---

## Delivery failed ≠ notification unavailable in app

Permanent.

---

## Email delivery successful ≠ read

Permanent.

---

## Push opened ≠ source action complete

Permanent.

---

## Provider unavailable ≠ Notification generation failed

In-app record can still exist.

---

## Notification generation failed ≠ source event failed

A Contract signing transaction must not roll back merely because notification infrastructure is unavailable.

---

## Preference disabled ≠ historical notifications removed

Permanent.

---

## Mandatory preference conflict ≠ mandatory notification suppressed

Server policy wins.

---

## Mark all read race

Critical.

If user executes:

```text
Mark all read
```

at time/sequence T:

a Notification arriving after T must remain unread.

Use a server-side cutoff/sequence, not an unsafe blanket update race.

---

## Read-state update failure ≠ source action failure

Marking the notification read can fail while the underlying Task/Approval remains perfectly valid.

---

## Duplicate event replay ≠ duplicate notification

Idempotent generation required.

---

## Partial source failure

Example:

```text
Notification records     ✓
Task action resolver      ✓
Approval action resolver  ✕
Message resolver          ✓
```

Design 080 should retain notifications and mark Approval action state unavailable rather than deleting them.

---

## State Coverage

Design 080 inherits Design 150 plus:

```text
Notifications Loading
Notifications Available
Notifications Empty
Notifications Filter Empty

Notifications Partial Results
Notification Service Failed

Notification Unread
Notification Read
Read State Updating
Read State Update Failed

Notification Active
Notification Dismissed / Archived

Informational Notification
Action Available
Action Already Completed
Action Withdrawn
Action Restricted
Action State Unavailable

Source Available
Source No Longer Accessible
Source Deleted / Archived
Source Resolver Unavailable

Delivery Queued
Delivery Sending
Provider Accepted
Delivery Successful
Delivery Failed
Delivery Retrying
Delivery State Unknown

Mandatory Notification
Preference-Suppressible Notification

Partial Source Resolver Failure
```

---

# 6. Responsive Behavior

## Desktop

Desktop should optimize personal attention scanning.

Conceptually:

```text
Notifications
↓
Summary / filters if frozen
↓
Notification list
    ├── NotificationType/category
    ├── safe source summary
    ├── event time
    ├── read/unread state
    ├── current actionability
    └── safe deep-link action
```

Only fields/actions actually present in the frozen design should render.

---

## Desktop should not become another My Work queue

Avoid presenting every notification with a generic:

> Complete

button.

If a canonical action is available, it should remain clearly source-specific.

---

## Informational vs actionable should be distinguishable

Examples:

```text
Informational:
“Contract fully executed.”

Actionable:
“Your approval is required.”
```

But actionability must come from the **current source state**, not merely from NotificationType.

---

## Tablet

Following Design 152:

* notification rows compact cleanly,
* unread state remains visible,
* source/domain category stays identifiable,
* timestamp remains legible,
* action CTA stays tied to correct record.

---

## Mobile

Priority:

```text
Notifications
↓
Notification Card
   ├── source/category
   ├── notification text
   ├── time
   ├── unread/read state
   └── current safe action
↓
Next notification
```

No compressed wide notification table.

---

## Mobile unread state

Do not rely solely on:

* colored dot,
* background shade.

Use semantic state accessible to assistive technology.

---

## Mobile source clarity

A notification should indicate whether it relates to:

* Task,
* Project,
* Approval,
* Message,
* Contract,
* Invoice,

where the frozen UI provides that context.

---

## Long notification content

Use controlled truncation/wrapping.

Do not copy large source documents or Message bodies into the notification list.

---

## Accessibility

A notification should communicate something equivalent to:

> Unread. Approval required for Acme proposal. Received 12 minutes ago. Approval is still pending. Open approval.

or:

> Read. Contract for Acme Corporation was fully executed yesterday. No action required.

where current source state supports it.

---

## Keyboard behavior

Desktop users should be able to:

* navigate notifications,
* mark read,
* open source action,
* use filters,

without ambiguous focus movement.

---

## Live updates

New incoming notifications should be announced non-disruptively.

Do not unexpectedly steal focus from work the user is doing.

---

# 7. Backend Requirements

## Notification generation architecture

```text
Canonical DomainEvent
        ↓
NotificationOrchestrator
        │
        ├── NotificationTypeRegistry
        ├── RecipientResolver
        ├── AuthorizationResolver
        ├── PreferencePolicyResolver
        └── DeduplicationResolver
        ↓
NotificationRecord(s)
        ↓
In-App Notification Store
        │
        └── Delivery Pipeline
               ↓
         DeliveryAttempt(s)
```

---

## NotificationType Registry

A canonical registry should define notification behavior.

Conceptually:

```text
NotificationTypeDefinition
├── key
├── source event types
├── audience resolver
├── safe template
├── allowed channels
├── default policy
├── mandatory/security classification
├── preference behavior
├── deep-link resolver
└── retention/dedup semantics
```

---

## Recipient resolver

Conceptually:

```text
resolveNotificationRecipients(
    domainEvent,
    organizationContext
)
```

should use source-specific semantics.

Examples:

### TaskAssigned

→ assignee.

### ApprovalParticipantActivated

→ exact participant.

### MessageCreated

→ authorized conversation participants excluding sender where policy dictates.

### Project deadline changed

→ defined Project recipients/subscribers if such policy exists.

Do not use one global `notifyEveryoneInOrg()` behavior.

---

## Recipient authorization before generation

Before writing the NotificationRecord:

```text
canReceiveNotification(
    recipient,
    event,
    source
)
```

should verify current source entitlement and audience policy.

---

## Notification generation should be idempotent

A stable uniqueness boundary can conceptually use:

```text
sourceEventId
+
notificationType
+
recipientContext
```

so event replay does not create duplicates.

---

## Transaction/outbox integration

Canonical source operations should emit durable events/outbox messages.

Notification provider failure should not roll back:

* Task assignment,
* Approval creation,
* Contract execution,
* Invoice update,
* Message sending.

---

## Notification worker replay safety

Repeated processing must return/create the same logical recipient notification rather than duplicates.

---

## Notification record creation should precede optional external delivery

Conceptually:

```text
NotificationRecord created
        ↓
in-app available
        ↓
DeliveryAttempt email/push
```

This ensures provider failure cannot destroy in-app truth.

---

## Preference policy resolver

Conceptually:

```text
resolveNotificationDeliveryPolicy(
    NotificationType,
    recipient,
    organization defaults,
    user preference,
    mandatory policy,
    available channels
)
```

---

## Preference precedence

A canonical model can support:

```text
MANDATORY POLICY
      ↓ highest precedence

User explicit preference
Organization default
System default
```

Exact precedence Phase 3D.

The invariant:

> mandatory/security requirements cannot be disabled by ordinary recipient preference.

---

## Preferences affect future behavior

Changing a preference should not mutate existing NotificationRecords or retroactively delete DeliveryAttempts.

---

## Delivery channel adapter

Conceptually:

```text
NotificationDeliveryAdapter
├── send()
├── getStatus()
├── normalizeProviderResponse()
└── handleProviderCallback()
```

for each configured channel.

---

## DeliveryAttempt idempotency

Retrying external delivery should not generate duplicate NotificationRecords.

Provider-level idempotency should be used where supported.

---

## Provider accepted ≠ delivered

Preserve normalized channel states.

---

## Provider callbacks

Where applicable:

* authenticate callbacks,
* replay-protect,
* normalize provider event,
* bind to exact DeliveryAttempt.

---

## In-app notification should not depend on email provider

Critical architectural separation.

---

## Team inbox query architecture

```text
Design 080
      ↓
Authenticated Team Context
      ↓
TeamNotificationQueryService
      │
      ├── recipient-scoped NotificationRecords
      ├── ReadState
      ├── source safe metadata
      ├── current source authorization
      ├── current actionability
      └── safe deep-link descriptor
      ↓
TeamNotificationView
```

---

## Query anchored on current recipient

Conceptually:

```text
getMyNotifications(currentOrganizationMembership)
```

not arbitrary browser `recipientId`.

---

## Deep-link resolver

Do not store arbitrary executable URLs if avoidable.

Prefer typed source context:

```text
sourceType
sourceId
actionKind
```

resolved through the application's canonical navigation registry.

Exact routes remain Phase 3B.

---

## Deep link must reauthorize

Critical:

```text
Notification
      ↓
user clicks
      ↓
resolve canonical source
      ↓
fresh source authorization
      ↓
open or deny safely
```

---

## Current action resolver

An actionable notification should query current source state.

Example:

```text
Notification:
Approval requested

Current source:
Approval already withdrawn
```

Result:

```text
Action no longer available
```

not stale Approve CTA.

---

## Do not store action completion on Notification

The Notification can cache/display a projection, but canonical source state remains authoritative.

---

## Read-state command

Prefer something like:

```text
markNotificationRead(notificationId)
```

with:

* recipient verification,
* idempotency,
* server timestamp.

---

## Mark-all-read command

Use a cutoff:

```text
markNotificationsReadThrough(
    recipient,
    sequence / createdAt cutoff
)
```

so newly arriving notifications are not incorrectly marked read.

---

## Read-state synchronization

Read state should be server-backed and consistent across devices.

---

## Dismiss/archive command, if frozen

Must affect only recipient presentation state.

Never invoke source deletion/completion.

---

## Notification count service

Unread counts and list entries must use the same recipient/filter policy.

Avoid:

```text
badge says 5
list shows 3
```

due to inconsistent permission filters.

---

## Sensitive source changes

If access is revoked after notification creation:

the query/deep-link resolver must protect sensitive source detail.

---

## Source deletion/archive

Notification lineage remains, but current display can safely indicate:

> Item no longer available.

---

## Multi-organization caching

Cache should vary by:

```text
organizationMembershipId
recipient identity
authorization revision
notification revision
read-state revision
```

not just global User ID.

---

## Realtime delivery

If Design 080 updates in real time:

subscriptions must be:

* authenticated,
* recipient-scoped,
* tenant-scoped,
* revoked when membership/session becomes invalid.

---

## Do not trust websocket topic name as authorization

Knowing a channel/topic ID must not permit subscription.

---

## Notification retention

Notification retention can differ from:

* Activity retention,
* Audit retention,
* source-domain retention.

Keep policies independent.

---

## Search indexing

Notifications generally should not become another copy of the underlying source in Global Search.

If Notification search exists inside Design 080, it should index only recipient-safe notification metadata.

Do not mix NotificationRecord into Design 079 as canonical source replacement.

---

## Audit

Meaningful notification-system administrative changes can be audited.

Ordinary actions such as:

* read,
* unread,

usually should not flood the compliance Audit Log unless policy specifically requires it.

---

## Failure model

Notification system should support partial behavior.

Example:

```text
DomainEvent                    ✓
NotificationRecord creation    ✓
In-app delivery                ✓
Email provider                 ✕
Push delivery                  ✓
```

Result:

> in-app notification remains correct; email delivery is failed/retrying.

---

## Backend Requirement Matrix

| Requirement                                   | Status                        |
| --------------------------------------------- | ----------------------------- |
| Authenticated Team Workspace                  | **Critical**                  |
| Active OrganizationMembership                 | **Critical**                  |
| Same platform infrastructure as 061/064       | **Critical**                  |
| DomainEvent/NotificationRecord separation     | **Critical**                  |
| NotificationType registry                     | **Critical**                  |
| Recipient-specific NotificationRecord         | **Critical**                  |
| One event → many recipient records            | **Critical**                  |
| User/recipient-context separation             | **Critical**                  |
| Multi-organization recipient safety           | **Critical**                  |
| Recipient authorization before generation     | **Critical**                  |
| Fresh source authorization on open            | **Critical**                  |
| Notification possession/access separation     | **Critical**                  |
| Notification/PersonalWork separation          | **Critical**                  |
| Notification/Activity separation              | **Critical**                  |
| Notification/Audit separation                 | **Critical**                  |
| Notification/Message separation               | **Critical**                  |
| Notification/ClientAction separation          | **Critical**                  |
| Read/source-completion separation             | **Critical**                  |
| Dismiss/source-deletion separation            | **Critical**                  |
| Delivery/read separation                      | **Critical**                  |
| NotificationRecord/DeliveryAttempt separation | **Critical**                  |
| DeliveryChannel/DeliveryAttempt separation    | **Critical**                  |
| Multiple delivery attempts per notification   | **Critical**                  |
| In-app truth/provider delivery separation     | **Critical**                  |
| Preference/record separation                  | **Critical**                  |
| Preference/mandatory-policy separation        | **Critical**                  |
| Preference/channel-availability separation    | **Critical**                  |
| Mandatory notification enforcement            | **Critical**                  |
| Server-side recipient resolution              | **Critical**                  |
| Event replay deduplication                    | **Critical**                  |
| Notification generation idempotency           | **Critical**                  |
| Outbox/async generation                       | **Required**                  |
| Provider adapter abstraction                  | **Required**                  |
| Provider callback verification                | **Critical where used**       |
| External-delivery idempotency                 | **Critical**                  |
| Recipient-scoped query service                | **Critical**                  |
| Server-backed ReadState                       | **Critical**                  |
| Race-safe mark-all-read cutoff                | **Critical**                  |
| Safe source/action resolver                   | **Critical**                  |
| Typed deep-link descriptor                    | **Critical**                  |
| No arbitrary URL execution                    | **Critical**                  |
| Current actionability resolution              | **Critical**                  |
| Safe treatment after access revocation        | **Critical**                  |
| Unread-count/list consistency                 | **Critical**                  |
| Permission-safe caching                       | **Critical**                  |
| Realtime subscription authorization           | **Critical if realtime used** |
| Independent retention policy                  | **Required**                  |
| Partial channel/service failure support       | **Critical**                  |
| No second Team notification backend           | **Critical**                  |

---

# 8. Consolidation

Design 080 exposes several major cross-domain attention-system risks.

**DomainEvent / NotificationRecord conflation**
One business event becomes the recipient-facing notification itself.

**NotificationRecord / source entity conflation**
Notification becomes editable Task, Approval, Contract, Invoice, or Message truth.

**Global event / recipient record conflation**
One shared row cannot support individual read/dismissal state safely.

**Recipient / User globally conflation**
Multi-organization users receive mixed workspace notifications.

**Same Organization / recipient conflation**
Every employee gets every event.

**Event actor / recipient conflation**
The person causing an event is assumed to be the one needing notification.

**NotificationType / NotificationRecord conflation**
Template/configuration changes rewrite historical notifications.

**ReadState / NotificationRecord identity conflation**
Per-user attention semantics cannot scale to multiple recipients.

**Unread / actionable conflation**
Old unread notification continues showing an obsolete action.

**Read / source viewed conflation**
Notification center view marks underlying resource viewed.

**Read / work completed conflation**
Reading Task notification completes Task.

**Read / ApprovalDecision conflation**
Opening approval alert approves/rejects nothing.

**Dismiss / source deletion conflation**
Removing a notification deletes the Task/Message/etc.

**Dismiss / work completion conflation**
Hiding attention clears business obligation.

**Notification / PersonalWork conflation**
Design 080 duplicates Design 078.

**Notification recipient / Work owner conflation**
Every notification becomes assigned work.

**Work existence / notification existence conflation**
Failed notification means Task disappears.

**Notification / Message conflation**
New-message alert becomes Message content.

**Notification read / Message read conflation**
Dismissing alert marks Conversation read.

**Notification / Activity conflation**
Recipient inbox becomes account history.

**Notification / Audit conflation**
User-facing text becomes compliance evidence.

**NotificationRecord / DeliveryAttempt conflation**
Email retry creates another in-app notification.

**DeliveryChannel / DeliveryAttempt conflation**
Channel configuration and individual sending operation merge.

**Provider accepted / delivered conflation**
External API acknowledgement is presented as successful delivery.

**Delivered / read conflation**
Email success means human saw it.

**Provider failure / in-app failure conflation**
Email outage removes in-app notifications.

**Preference / NotificationRecord conflation**
Changing settings rewrites historical inbox.

**Preference disabled / mandatory disabled conflation**
Security notification becomes suppressible.

**Mandatory / authorization bypass conflation**
Required notification leaks restricted source data.

**Preference / channel health conflation**
Provider outage changes user preference.

**Notification generation / source transaction conflation**
Email provider failure rolls back Contract/Task/Approval state.

**Repeated DomainEvent / repeated notification conflation**
Queue/event replay creates duplicate alerts.

**Text-based dedupe**
Distinct events with similar titles are collapsed.

**Notification grouping / identity conflation**
Grouped presentation destroys individual event lineage.

**Notification count / global count conflation**
Unread badge includes other users/workspaces.

**List authorization / deep-link authorization conflation**
Historical notification acts as permanent source-access token.

**Access revoked / Notification deleted conflation**
Historical recipient record is physically erased merely to protect source data.

**Historical record / unrestricted sensitive snapshot conflation**
Old notification leaks confidential data after access revocation.

**Deep link / arbitrary stored URL conflation**
Notification payload becomes open redirect/command execution vector.

**Source action snapshot / current actionability conflation**
Stale notification still exposes Approve/Pay/Sign action.

**Mark all read / blanket UPDATE race**
New notifications are silently marked read before user sees them.

**Read-state failure / source failure conflation**
Unable to mark read is reported as Task/Approval failure.

**Team Notifications / Client Notifications duplicate backend**
Designs 064 and 080 drift into separate infrastructure.

**Team Notifications / System Alert Rules conflation**
Later Design 143's administrative alert-rule configuration becomes the user's personal inbox.

**Realtime channel / authorization conflation**
Knowing subscription topic leaks another user's notifications.

**Cache by User only / workspace context conflation**
Multi-org notification data crosses tenant context.

**Notification retention / Audit retention conflation**
Personal inbox becomes permanent compliance store.

**080/061 duplicate preference policy**
Team system creates incompatible notification preference semantics.

**080/064 duplicate inbox model**
Client and Team read/delivery logic diverges.

**080/078 duplicate attention engine**
Notifications become generic work queue.

No additional screen is required.

These are **recipient identity, event projection, read/delivery separation, preference policy, mandatory delivery, source authorization, deep-link safety, idempotency, cross-tenant privacy, and cross-domain attention requirements**.

---

# 9. Implementation Verdict

## **PASS — TEAM RECIPIENT-SPECIFIC NOTIFICATION INBOX, POLICY & MULTI-CHANNEL DELIVERY ANCHOR**

**Domain directive:**
**DomainEvent ≠ NotificationRecord ≠ Recipient ≠ NotificationType ≠ ReadState ≠ DeliveryAttempt ≠ DeliveryChannel ≠ NotificationPreference ≠ ClientAction/WorkItem ≠ ActivityEvent ≠ AuditEvent.**

**Reuse directive:**
Designs 061, 064 and 080 must use **one canonical platform notification infrastructure**. Client and Team Workspace inboxes are audience-specific projections, not separate notification engines.

**Event directive:**
canonical source domains emit DomainEvents. Notification infrastructure consumes those events asynchronously and never becomes the source-domain transaction itself.

**Recipient directive:**
each relevant recipient receives their own recipient-scoped NotificationRecord or equivalent personal receipt relationship so read/dismissal state is never global.

**Workspace directive:**
Team notifications remain scoped to the authenticated OrganizationMembership/workspace context, preventing multi-organization users from receiving mixed tenant data.

**Type directive:**
NotificationType is registry/configuration metadata governing templates, recipient policy, channels, preferences, mandatory classification, deep links, retention and deduplication. It is not a notification occurrence.

**Record directive:**
NotificationRecord preserves event/source lineage and safe recipient-facing context while remaining separate from Task, Approval, Message, Contract, Invoice, Project and all other canonical entities.

**Authorization-at-generation directive:**
candidate recipients are server-resolved and source-authorized before notification generation. Organization membership alone never implies eligibility for every source event.

**Authorization-at-open directive:**
every sensitive notification deep link reauthorizes the canonical source using current permissions. Possessing or previously receiving a NotificationRecord is never a persistent resource-access grant.

**Revocation directive:**
if source access is later revoked, sensitive source information must be safely suppressed/redacted/unavailable in the current projection without allowing the historical notification to bypass authorization.

**Read directive:**
ReadState records only recipient attention. Reading a notification never completes a Task, decides an Approval, replies to a Message, signs a Contract, pays an Invoice or changes any source-domain lifecycle.

**Dismissal directive:**
if the frozen design supports dismissal/archive, that operation affects notification presentation only. It never deletes or completes the underlying source entity.

**Work directive:**
Design 078 remains the canonical personal-work projection. A Notification may correspond to work, but Notification existence/read/dismissal and WorkItem/source obligation remain independent.

**Message directive:**
Message notifications only point toward Designs 014/074. Notification delivery/read state never becomes Message delivery/read state automatically.

**Activity directive:**
Design 063 remains the historical Activity projection. The same DomainEvent may produce Activity and Notification records independently according to separate audience/retention policies.

**Audit directive:**
Design 039 remains canonical governance evidence. Notification text is not Audit truth, and ordinary read-state changes should not flood Audit unless policy explicitly requires it.

**Delivery directive:**
in-app NotificationRecord and external DeliveryAttempts remain separate. Email/push/provider outages cannot corrupt or erase canonical in-app notification truth.

**Channel directive:**
each external DeliveryAttempt binds a specific DeliveryChannel and preserves retry/provider state independently. Retrying delivery never creates another in-app notification.

**Provider directive:**
provider acceptance, delivery and human read remain separate states. Provider-specific results are normalized behind delivery adapters.

**Preference directive:**
NotificationPreference influences future eligible delivery according to the shared policy engine. Preference changes do not rewrite historical NotificationRecords.

**Mandatory-policy directive:**
mandatory/security notification policy has higher authority than ordinary opt-out preferences. Browser request tampering cannot suppress mandatory types.

**Privacy directive:**
mandatory delivery never bypasses recipient authorization or safe-content rules. “Mandatory” means preference-unsuppressible, not privacy-unrestricted.

**Idempotency directive:**
notification generation is deduplicated/idempotent against source-event replay using stable event + recipient + type semantics. External delivery retries likewise remain idempotent.

**Outbox directive:**
source transactions emit durable events/outbox records so notification or provider failure cannot roll back valid Task, Contract, Approval, Invoice, Message or Project operations.

**Actionability directive:**
any source CTA shown in Design 080 is resolved against **current canonical source state and current permissions**. A stale notification never keeps an obsolete Approve/Pay/Sign/Complete action alive.

**Deep-link directive:**
notifications should use typed source/deep-link descriptors resolved through the application navigation system rather than arbitrary executable URLs stored in notification data.

**Read-sync directive:**
recipient ReadState is server-backed and cross-device consistent. Bulk mark-read uses a safe sequence/time cutoff so newly arriving notifications remain unread.

**Count directive:**
unread counts and inbox rows use the same recipient/workspace/authorization/read policy so badges cannot disagree with the actual list.

**Realtime directive:**
if live notification delivery is implemented, subscriptions remain tenant- and recipient-authorized and terminate/reject future events after session or membership revocation.

**Failure directive:**
notification creation, source resolution, ReadState, email delivery, push delivery and source actionability can fail independently. Provider/service failures never silently become `read`, `no action`, `0 notifications`, or source completion.

**Retention directive:**
Notification retention remains independent from source-domain, Activity and Audit retention. The personal inbox must not become a substitute compliance archive.

**Design 143 boundary directive:**
later **Design 143 — System Notifications / Alert Rules Management** may configure/administer alert rules and system notification behavior, while Design 080 remains the **recipient's personal Team notification inbox**. Rule administration and personal attention records must never collapse into one entity/screen backend.

**Performance directive:**
Design 080 should use recipient-scoped indexed queries, batched source/action resolution, permission-aware caching and incremental/realtime updates where needed rather than querying every source domain individually from the browser.

**Overlap directive:**
Designs **029, 034, 039, 061, 063–064, 074, 078, 080 and later 143** must ultimately share one event-driven notification/policy foundation while keeping source work, Messages, Activity, Audit and system alert configuration separate.

**Consolidation directive:**
**STANDARDIZE ONE PLATFORM NOTIFICATION PIPELINE — CANONICAL DOMAIN EVENTS + NOTIFICATIONTYPE REGISTRY + SERVER-SIDE RECIPIENT/AUTHORIZATION RESOLUTION + RECIPIENT-SPECIFIC NOTIFICATIONRECORDS + INDEPENDENT READ/PRESENTATION STATE + SHARED PREFERENCE/MANDATORY POLICY ENGINE + SEPARATE IDEMPOTENT DELIVERYATTEMPTS/CHANNEL ADAPTERS + CURRENT SOURCE ACTION RESOLUTION + FRESH DEEP-LINK AUTHORIZATION — AND NEVER ALLOW NOTIFICATION READ/DISMISSAL, PROVIDER DELIVERY, USER PREFERENCES, OR HISTORICAL NOTIFICATION POSSESSION TO BECOME SOURCE-DOMAIN WORK, AUTHORIZATION OR BUSINESS TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **80 / 153** |
| **PASS**                                   |                         **80** |
| **STANDARDIZE decisions**                  |                         **78** |
| **Potential implementation-overlap flags** |                         **71** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**80 / 153 = 52.3% audited.**

### Canonical notification architecture after Design 080

```text
                    CANONICAL DOMAIN EVENT
                              │
                              ↓
                   NotificationType Registry
                              │
                              ↓
                     Recipient Resolver
                              │
                              ↓
                  Current Authorization
                              │
               ┌──────────────┼──────────────┐
               ↓              ↓              ↓
          Recipient A    Recipient B    Recipient C
               │              │              │
               ↓              ↓              ↓
       Notification N1  Notification N2  Notification N3
               │              │              │
          ReadState       ReadState       ReadState
               │              │              │
               └──────────────┼──────────────┘
                              ↓
                    Optional Delivery Layer
                      ┌───────┴────────┐
                      ↓                ↓
                  Email Attempt     Push Attempt
```

The critical attention boundary is now:

```text
DOMAIN SOURCE
   │
   ├── Task / Approval / Message / Contract / Project
   │
   └── canonical state/action
              │
              ↓
         DomainEvent
              │
       ┌──────┴──────┐
       ↓             ↓
Notification      Activity
Design 080       Design 063
       │
       ↓
Read / Dismiss

Read ≠ Source Completed
Dismiss ≠ Source Deleted
Notification ≠ Work
```

And provider delivery remains independent:

```text
NotificationRecord EXISTS
        │
        ├── Email delivered
        ├── Email failed
        ├── Push delivered
        └── Push unavailable

The in-app record remains valid regardless of external provider failure.
```

# Next Sequential Audit Target

## **Design 081 — Lead Sources / Source Management**

The next audit should preserve the Lead-source/provenance boundary:

> **Source ≠ SourceConfiguration ≠ SourceCredential/Secret ≠ SourceRun ≠ RawObservation/RawRecord ≠ ProspectCandidate ≠ Lead ≠ Import ≠ Provenance.**

It will need to reconcile **Design 008 Lead Finder**, **Design 009 Data Extraction**, and the CRM admission boundary while preserving:

* a source defines where candidate data originates; it is not itself a Lead,
* source configuration ≠ credentials/secrets,
* one source can produce many extraction/discovery runs,
* raw source record ≠ normalized ProspectCandidate,
* ProspectCandidate ≠ CRM Lead until explicit admission,
* provenance survives normalization/dedupe/import,
* disabling a source stops future acquisition without deleting historical candidates/leads/evidence,
* source failures must not rewrite downstream canonical CRM history,
* no second Lead Finder/Data Extraction backend.

The sequence continues strictly with **Design 081 only next**, under the unchanged audit contract.
