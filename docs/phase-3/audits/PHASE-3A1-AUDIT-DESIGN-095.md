# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 095 — Follow-up Queue / Follow-up Detail Workspace

Design 095 should become the **canonical Team Workspace Follow-up operations surface** for discovering, prioritizing, assigning, completing, rescheduling, and tracing relationship/sales follow-up obligations created from Meetings, Leads, Deals, Replies, Clients, or other governed source workflows.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **FollowUp ≠ Task ≠ Meeting ≠ Lead ≠ Contact ≠ Company ≠ Deal ≠ FollowUpSource/Context ≠ Assignment ≠ DueSchedule ≠ FollowUpOutcome/Completion ≠ Notification ≠ ActivityEvent.**

The central implementation rule is:

> **A FollowUp is a canonical relationship/sales action obligation with its own identity, assignee, due semantics, lifecycle, source context, and completion/outcome. It may originate from a Meeting, Reply, Lead, Deal, Client relationship, or manual action, but it never becomes those source records. Completing, rescheduling, reassigning, snoozing, or cancelling a FollowUp must not silently mutate Lead status, Deal stage, Meeting Outcome, Contact identity, Task state, or Notification state. Any downstream business change requires an explicit source-domain command.**

---

# 1. Classification

| Audit field                    | Classification                                                                                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                  | **095**                                                                                                                                                                               |
| **Canonical name**             | **Follow-up Queue / Follow-up Detail Workspace**                                                                                                                                      |
| **Product area**               | Team Workspace / Sales / Relationship Work                                                                                                                                            |
| **User surface**               | **Authenticated Team Workspace**                                                                                                                                                      |
| **Screen class**               | Personal/Team Action Queue + Entity Detail Workspace                                                                                                                                  |
| **Classification**             | **Canonical Follow-up Queue, Scheduling, Completion & Outcome Anchor**                                                                                                                |
| **Primary purpose**            | Surface actionable FollowUps, preserve their source/business context, manage responsibility and due semantics, and record completion without duplicating Tasks or source-domain state |
| **Primary entity**             | **FollowUp** — originally established by Design 015                                                                                                                                   |
| **Source/context relation**    | **FollowUpContext / SourceReference**                                                                                                                                                 |
| **Responsibility relation**    | **FollowUpAssignment / Assignee**                                                                                                                                                     |
| **Due semantics**              | **FollowUpSchedule / DueAt**                                                                                                                                                          |
| **Completion/outcome concept** | **FollowUpOutcome / CompletionRecord**                                                                                                                                                |
| **Meeting dependency**         | Designs 015 / 094                                                                                                                                                                     |
| **Reply dependency**           | Design 093                                                                                                                                                                            |
| **Lead dependency**            | Designs 011 / 089                                                                                                                                                                     |
| **Contact dependency**         | Designs 086–087                                                                                                                                                                       |
| **Company dependency**         | Designs 084–085                                                                                                                                                                       |
| **Deal dependency**            | Designs 016–017                                                                                                                                                                       |
| **Task dependency**            | Design 034                                                                                                                                                                            |
| **Calendar dependency**        | Design 035 where scheduled projection is relevant                                                                                                                                     |
| **Personal Work dependency**   | Design 078                                                                                                                                                                            |
| **Notification dependency**    | Design 080                                                                                                                                                                            |
| **Audit dependency**           | Design 039                                                                                                                                                                            |
| **Queue projection**           | `FollowUpQueueEntry`                                                                                                                                                                  |
| **Detail projection**          | `FollowUpDetailView`                                                                                                                                                                  |
| **Primary query service**      | `FollowUpQueryService`                                                                                                                                                                |
| **Mutation service**           | `FollowUpService`                                                                                                                                                                     |
| **Outcome service**            | `FollowUpOutcomeService` or equivalent                                                                                                                                                |
| **Scheduling service**         | `FollowUpSchedulingService`                                                                                                                                                           |
| **Auth**                       | Required                                                                                                                                                                              |
| **Authorization**              | Active OrganizationMembership + FollowUp/context/action permissions                                                                                                                   |
| **Implementation priority**    | **Critical Sales Execution / Next-Action Integrity / Deadline Semantics**                                                                                                             |
| **Reuse level**                | **Extremely High across Leads, Meetings, Replies, Deals, Clients and My Work**                                                                                                        |

Design 095 should answer:

> **“Which relationship follow-ups require attention, who owns each one, when is it actually due, what canonical business context caused it, what is its current lifecycle, what happened when it was completed, and which explicit downstream action—if any—was created afterward?”**

Canonical architecture:

```text
                         FOLLOWUP
                    canonical action identity
                           │
       ┌───────────────────┼────────────────────┐
       ↓                   ↓                    ↓
   Assignment          DueSchedule         SourceContext
                                                │
                   ┌───────────────┬────────────┼─────────────┐
                   ↓               ↓            ↓             ↓
                Meeting          Reply         Lead          Deal
                   │                             │
                   └───────────────┬─────────────┘
                                   ↓
                           FollowUp Outcome
                                   │
                      ┌────────────┼────────────┐
                      ↓            ↓            ↓
                   New FollowUp   Task    Explicit Lead/Deal
                                           domain command
```

---

# 2. Reuse

## Design 015 remains the canonical FollowUp foundation

Design 095 must use the same FollowUp identity introduced by Design 015.

Correct:

```text
Design 015
FollowUp F-100
     ↓
Design 095
Queue / Detail
```

Not:

```text
FollowUpQueueItem
MeetingFollowUp
ReplyFollowUp
LeadFollowUp
DealFollowUp
```

as separate business entities.

---

## Design 095 ≠ Design 034 Task Workspace

This distinction must remain permanent.

### FollowUp

Represents a relationship/sales continuation obligation such as:

> Call Sarah next Thursday.

### Task

Represents general internal work such as:

> Prepare revised proposal deck.

They can be related.

They are not interchangeable.

---

## FollowUp can generate a Task

Correct:

```text
FollowUp F1 completed
     ↓
Internal work required
     ↓
Task T1
```

But F1 does not transform into T1.

---

## Task completion ≠ FollowUp completion

Permanent.

---

## Reuse Design 094 Meeting Outcome linkage

Design 094 established:

```text
MeetingOutcome
      ↓
FollowUp
```

Design 095 must consume that exact canonical FollowUp.

Do not create another Meeting-specific follow-up table.

---

## Reuse Design 093 Reply Review linkage

Design 093 may create:

```text
ReviewDecision
      ↓
FollowUp F-200
```

Design 095 must surface F-200 directly.

No Reply-specific action system.

---

## Reuse canonical Lead context

A FollowUp may reference Lead L-100.

That does not make:

```text
lead.nextFollowUp
```

the FollowUp's canonical storage.

Lead 360 can derive its “next action” from canonical FollowUps.

---

## Reuse Contact/Company context

FollowUp can reference a Contact and/or Company for presentation/business context.

Contact and Company remain canonical entities.

---

## Reuse Deal context

If FollowUp concerns an active opportunity:

```text
Deal D1
   ↓
FollowUp F1
```

Deal stage remains separate.

---

## Reuse Design 078 My Work

A FollowUp assigned to the current user can project into the Personal Work Queue.

Correct:

```text
FollowUp F1
     ↓
PersonalWorkQueueEntry
```

Not:

```text
FollowUp
→ copied into generic WorkItem
```

Design 078 already prohibited a giant cross-domain mutable WorkItem.

---

## Reuse Design 035 Calendar projection

A dated FollowUp may appear in Calendar.

That should be a `ScheduleEntry` projection.

Permanent:

> **FollowUp ≠ CalendarEvent.**

---

## Reuse Design 080 Notification infrastructure

A reminder such as:

> Follow-up due in one hour

can be a Notification.

But:

```text
Notification
≠
FollowUp
```

and clearing the notification never completes the FollowUp.

---

# 3. Entities

## FollowUp

`FollowUp` is the stable canonical relationship-action identity.

Conceptually:

```text
FollowUp
├── id
├── organizationId
├── subject / intent
├── source/context references
├── assignee
├── dueAt / schedule semantics
├── lifecycle
├── priority where canonical
├── createdBy
├── createdAt
├── completedAt
└── revision
```

Exact schema belongs to Phase 3D.

---

## FollowUp ≠ source record

A FollowUp can originate from:

* Meeting,
* Reply,
* Lead,
* Deal,
* Client interaction,
* manual CRM action.

Its source provides context.

The source does not become FollowUp identity.

---

## FollowUpSource / Context

Use typed canonical references rather than freeform origin text.

Conceptually:

```text
FollowUpContext
├── followUpId
├── contextType
├── contextId
├── contextRole
└── provenance
```

A FollowUp may legitimately relate to several contexts.

Example:

```text
FollowUp F1
├── Contact C1
├── Company CO1
├── Lead L1
├── Deal D1
└── source Meeting M1
```

---

## Source context ≠ ownership

Meeting/Lead/Deal ownership does not necessarily determine FollowUp assignee.

---

## Source state ≠ FollowUp state

A Deal closing does not retroactively rewrite historical FollowUp lifecycle.

Current actionability may change, but state history remains.

---

## FollowUp ≠ Lead “next action” field

Critical.

`nextFollowUp`, `nextAction`, or similar fields on Lead can be derived projections.

Canonical work remains `FollowUp`.

---

## FollowUp ≠ Contact activity

A Contact can have many FollowUps.

Contact itself is never mutated to represent the action lifecycle.

---

## FollowUp ≠ Meeting

Scheduling:

> Call again Friday

does not create a Meeting unless the workflow explicitly schedules an actual Meeting entity.

---

## FollowUp ≠ reminder

A reminder is a notification/timing mechanism around the FollowUp.

The business obligation remains FollowUp.

---

## FollowUp ≠ CalendarEvent

Permanent.

Calendar can render:

```text
ScheduleEntry
sourceType = FOLLOWUP
sourceId = F-100
```

without creating another business action.

---

## Assignment

`FollowUpAssignment` or canonical `assigneeMembershipId` answers:

> Who is responsible?

It is separate from:

* Lead owner,
* Deal owner,
* Meeting organizer,
* Reply reviewer.

---

## Reassigning FollowUp ≠ reassigning Lead

Permanent.

---

## Reassigning FollowUp ≠ changing Deal owner

Permanent.

---

## Assignment ≠ authorization

A user assigned a FollowUp must still be allowed to access enough of the underlying context to perform it.

---

## DueSchedule

Due semantics require more care than a generic date string.

Conceptually:

```text
FollowUpSchedule
├── followUpId
├── dueAt
├── timezone/context where relevant
├── reminder policy
├── scheduling state
└── revision/history
```

Physical separation into an entity is optional; semantic separation is mandatory.

---

## DueAt ≠ createdAt

Permanent.

---

## DueAt ≠ reminder time

Permanent.

Example:

```text
FollowUp due: Friday 4 PM
Reminder: Friday 3 PM
```

---

## DueAt ≠ Meeting scheduled time

Permanent.

---

## Reschedule ≠ new FollowUp necessarily

Changing:

```text
Friday
→ Monday
```

typically preserves FollowUp identity while recording schedule change history.

---

## Reschedule ≠ snooze necessarily

These semantics should remain distinguishable.

### Reschedule

Changes the actual due commitment.

### Snooze/reminder deferment

May only delay when the user is reminded, depending on frozen behavior.

Do not make “snooze” silently rewrite business due date unless product semantics intentionally define it that way.

---

## Due ≠ overdue

`Overdue` is derived:

```text
currentTime > dueAt
AND lifecycle is actionable
```

It should not be stored as an independent mutable business status.

---

## Overdue ≠ failed

Permanent.

---

## Overdue ≠ cancelled

Permanent.

---

## FollowUp lifecycle

Conceptually:

```text
Open
In Progress
Completed
Cancelled
```

with any additional frozen states defined later.

Do not overload due condition into this lifecycle.

---

## Lifecycle ≠ due condition

Valid:

```text
Lifecycle = Open
Due condition = Overdue
```

---

## Lifecycle ≠ assignment state

Valid:

```text
Lifecycle = Open
Assignment = Unassigned
```

---

## FollowUpOutcome / CompletionRecord

Completing a FollowUp should preserve what happened.

Conceptually:

```text
FollowUpOutcome
├── followUpId
├── completedBy
├── completedAt
├── disposition/outcome
├── summary
├── resulting action references
└── revision
```

Exact structured outcomes depend on frozen design.

---

## Completed ≠ Outcome captured

If the product permits quick completion and later outcome entry, those states must remain distinct.

If the frozen workflow requires outcome at completion, enforce that explicitly rather than conflating concepts architecturally.

---

## Completion ≠ success

Critical.

A completed FollowUp could result in:

* connected,
* no response,
* not interested,
* reschedule,
* Meeting booked.

“Completed” means the action was processed, not that the commercial result was positive.

---

## Completion ≠ Lead qualified

Permanent.

---

## Completion ≠ Deal advanced

Permanent.

---

## Completion ≠ new Meeting created

Permanent.

---

## Outcome ≠ Lead status

Example:

```text
FollowUp Outcome:
Interested

Lead status:
still requires explicit governed transition
```

---

## Outcome ≠ next FollowUp

If a user decides:

> Try again next week

create another canonical FollowUp or reschedule the existing one according to business semantics.

Do not bury the future obligation only in completion notes.

---

## Recurring/repeated FollowUps

If another distinct outreach attempt is required after completing F1:

prefer lineage:

```text
FollowUp F1
completed
    ↓
creates successor
    ↓
FollowUp F2
```

where the action is a new obligation.

Do not reopen historical F1 silently.

---

## Reschedule vs successor FollowUp

Important distinction:

### Before execution

Changing due time usually reschedules same FollowUp.

### After execution

“Follow up again next week” is generally a new FollowUp with lineage.

Exact policy belongs to Phase 3D.

---

## Successor relation

Conceptually:

```text
FollowUpRelation
├── previousFollowUpId
├── nextFollowUpId
└── relationType = CONTINUATION
```

or equivalent lineage.

Do not create circular chains.

---

## Cancelled ≠ completed

Permanent.

---

## Cancelled FollowUp should preserve cancellation reason/history where required

Do not hard-delete it simply because it is no longer actionable.

---

## Lead

A FollowUp can affect Lead workflows only through explicit LeadService commands.

---

## Contact

The Contact can remain current even if FollowUp is cancelled/completed.

---

## Company

Same.

---

## Deal

A FollowUp completion can produce evidence for Deal progress.

But the Deal owns its stage.

---

## Meeting

A FollowUp outcome might result in:

> Meeting booked.

That should create/link a canonical Meeting.

Not:

```text
followUp.status = MEETING
```

---

## Task

A FollowUp can generate supporting internal work.

Task remains independent.

---

## Note

If FollowUp detail contains notes:

Note remains contextual authored content.

Note does not become:

* completion outcome,
* Lead status,
* source provenance.

---

## ActivityEvent

FollowUp Activity can include:

* created,
* assigned,
* rescheduled,
* reminder sent,
* completed,
* cancelled,
* outcome recorded,
* successor created.

Activity is a projection.

---

## Activity ≠ Audit

Permanent.

---

# 4. Permissions

Design 095 should conceptually distinguish:

```text
followUp.read
followUp.create
followUp.edit
followUp.assign
followUp.reschedule
followUp.complete
followUp.cancel
followUp.outcome.read
followUp.outcome.manage

lead.read / mutate
deal.read / mutate
meeting.create
task.create
```

Exact permission keys belong to Phase 3D.

---

## FollowUp read ≠ complete

Permanent.

---

## FollowUp edit ≠ assign

Permanent.

---

## FollowUp assign ≠ Lead assign

Critical.

---

## FollowUp complete ≠ Lead mutation permission

Permanent.

---

## FollowUp complete ≠ Deal mutation permission

Permanent.

---

## FollowUp read ≠ full Contact PII access

A FollowUp assignee may receive enough Contact information to perform the action according to policy, but not every sensitive Contact field.

---

## FollowUp read ≠ Company full-detail access

Same.

---

## Source permissions remain authoritative

If F1 references a confidential Deal:

a user may be permitted to perform the FollowUp without seeing every Deal field.

Use safe source projections.

---

## Assignment target validation

A FollowUp can only be assigned to a valid OrganizationMembership/user eligible under workspace policy.

---

## Assignment cannot grant context access automatically

If target user cannot access required context:

assignment should be rejected or handled by explicit policy—not silently grant permissions.

---

## Complete actor derives from authenticated session

Do not trust:

```text
completedBy = arbitraryUserId
```

from browser payload.

---

## Reassignment actor similarly server-derived

Permanent.

---

## Downstream actions reauthorize independently

If FollowUp completion requests:

* Lead qualification,
* Deal stage update,
* Meeting creation,
* Task creation,

each target service performs fresh authorization.

---

## Direct FollowUp ID reauthorizes

Knowing ID grants nothing.

---

## Cross-tenant source references prohibited

A FollowUp in Tenant A cannot reference:

* Lead in Tenant B,
* Deal in Tenant B,
* Contact in Tenant B.

---

## Queue visibility is permission-aware

Queue counts and rows must reflect current authorized FollowUps.

---

## Team queue ≠ permission escalation

Managers may have broader review visibility according to role policy, but this must be explicit.

“Manager” job title alone cannot imply authorization.

---

# 5. States

Design 095 must keep **FollowUp lifecycle, due condition, assignment, reminder state, outcome state, source actionability and downstream action state** separate.

### FollowUp lifecycle

Conceptually:

```text
Open
In Progress
Completed
Cancelled
```

### Due condition

Derived:

```text
No Due Date
Upcoming
Due Today
Due Now
Overdue
```

or exact canonical UX vocabulary later.

### Assignment state

```text
Assigned
Unassigned
Reassigned
```

### Reminder state

```text
No Reminder
Scheduled
Triggered
Dismissed
Unavailable
```

where reminders exist.

### Outcome state

```text
Not Captured
Draft
Recorded
Corrected
```

where applicable.

### Source-context actionability

```text
Source Active
Source Changed
Source Completed
Source Restricted
Source Unavailable
```

### Downstream actions

```text
No Action Requested
Pending
Completed
Partially Completed
Failed
Restricted
```

These must never become one `followUp.status`.

---

## Open ≠ upcoming

Permanent.

---

## Open ≠ overdue

Permanent.

---

## Overdue ≠ failed

Permanent.

---

## Completed ≠ successful commercial result

Permanent.

---

## Cancelled ≠ completed

Permanent.

---

## Reminder dismissed ≠ FollowUp completed

Critical.

---

## Notification read ≠ FollowUp completed

Critical.

---

## Rescheduled ≠ completed

Permanent.

---

## Reassigned ≠ reopened

Permanent.

---

## Source Lead converted ≠ FollowUp completed automatically

Critical.

Current actionability may require reassessment.

History must remain.

---

## Deal won ≠ historical FollowUps deleted

Permanent.

---

## Contact changed employer ≠ FollowUp recreated automatically

Permanent.

Current context can resolve updated Contact/Company information while historical source linkage persists.

---

## Source unavailable ≠ no source

Critical.

---

## No Task created ≠ Task service unavailable

Permanent.

---

## No Meeting created ≠ Meeting service unavailable

Permanent.

---

## Queue empty ≠ query service failure

Permanent.

---

## Partial queue failure

If source context fails for some rows:

the FollowUp identity/due/assignee can still be displayed where safe.

Do not drop the row entirely unless authorization requires it.

---

## State Coverage

Design 095 inherits Design 150 plus:

```text
Follow-up Queue Loading
Follow-up Queue Available
Follow-up Queue Empty
Follow-up Queue Restricted
Follow-up Queue Partial

FollowUp Open
FollowUp In Progress
FollowUp Completed
FollowUp Cancelled

No Due Date
FollowUp Upcoming
FollowUp Due Today
FollowUp Due Now
FollowUp Overdue

FollowUp Assigned
FollowUp Unassigned
FollowUp Reassigned

Reminder Not Set
Reminder Scheduled
Reminder Triggered
Reminder Dismissed
Reminder State Unavailable

Outcome Not Captured
Outcome Draft
Outcome Recorded
Outcome Corrected

Source Context Available
Source Context Changed
Source Context Restricted
Source Context Unavailable

No Downstream Action
Downstream Action Pending
Downstream Action Completed
Downstream Action Partially Completed
Downstream Action Failed
Downstream Action Restricted

FollowUp Updated Elsewhere
FollowUp No Longer Accessible
Partial FollowUp Detail Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should optimize **action triage first, context second, completion third**.

Conceptually:

```text
Follow-up Queue
↓
FollowUp rows
   ├── action/subject
   ├── Contact / Company
   ├── source context
   ├── assignee
   ├── due condition
   ├── lifecycle
   └── available action

Selected FollowUp / Detail
   ├── canonical context
   ├── scheduling
   ├── related Lead / Deal / Meeting
   ├── history
   ├── outcome
   └── explicit downstream actions
```

Only elements present in frozen Design 095 should render.

---

## Due state and lifecycle should not be visually conflated

Correct:

> **Open · Overdue**

or:

> **Completed · was overdue by 2 days**

depending on frozen presentation.

Do not store/render:

> Status = Overdue

as the only lifecycle.

---

## Source domain should be clear

Where frozen design shows origin:

* Meeting,
* Reply,
* Lead,
* Deal,

label it as source/context.

Do not make every FollowUp look like it belongs to one source type.

---

## Assignment should remain visibly separate from Lead owner

Where both are present, use distinct labels.

---

## Completion should not use an ambiguous “Done” if outcome is required

If frozen design captures outcome, UI should keep:

* lifecycle completion,
* outcome/disposition,
* downstream work

visually distinct.

---

## Tablet

Following Design 152:

* queue table can become structured rows/cards,
* due state stays prominent,
* source context and assignee compact,
* detail stacks vertically,
* completion/action controls remain touch-safe.

---

## Mobile

Priority:

```text
FollowUp
↓
What needs to happen
↓
Who / Company
↓
Due condition
↓
Source context
↓
Assignee
↓
Outcome / Complete
↓
Explicit next action
```

No wide sales-action table compressed onto the phone.

---

## Mobile overdue state

Use text/icon semantics, not color alone:

> Overdue by 1 day

where available.

---

## Mobile partial failure

If Deal context is unavailable:

the user should still be able to inspect the FollowUp's own:

* subject,
* due time,
* assignee,
* permissible completion action.

---

## Accessibility

A FollowUp queue entry could communicate:

> Follow up with Sarah Patel at Globex. Due today at 4 PM. Assigned to Alex. Source: meeting on August 22. Open.

where canonical authorized data supports it.

---

# 7. Backend Requirements

## Canonical FollowUp architecture

```text
Design 095
    ↓
Authenticated Workspace Context
    ↓
FollowUpQueryService
    │
    ├── FollowUp
    ├── assignment
    ├── due-condition resolver
    ├── source-context adapter
    ├── Contact / Company safe summary
    ├── Lead / Deal safe summary
    ├── outcome
    ├── downstream action references
    └── activity
    ↓
FollowUpQueueEntry / FollowUpDetailView
```

---

## Canonical mutations go through FollowUpService

Use source-specific commands such as:

```text
createFollowUp()
assignFollowUp()
rescheduleFollowUp()
completeFollowUp()
cancelFollowUp()
```

rather than unrestricted:

```text
PATCH /followup/:id
{
  status: ...,
  assignee: ...,
  dueAt: ...
}
```

---

## Create FollowUp

A create command should:

1. authorize actor;
2. validate tenant;
3. validate typed source contexts;
4. validate assignee;
5. validate due semantics;
6. prevent inappropriate duplicates where source action idempotency exists;
7. create canonical FollowUp;
8. emit event/Audit.

---

## Source-created FollowUps need idempotency

Example:

```text
MeetingOutcome O1
→ create FollowUp
```

If Outcome processing retries:

it must reuse the same FollowUp/action request rather than create F1/F2/F3 duplicates.

Same for Design 093 Reply actions.

---

## Idempotency identity

Conceptually derive from:

```text
sourceEvent / actionRequest
+
action type
+
intended FollowUp context
```

where applicable.

Manual independent FollowUps remain distinct.

---

## Typed source references

Avoid:

```text
sourceType = arbitrary string
sourceId = unchecked UUID
```

without validation.

Use a governed source-reference registry/policy.

---

## Source relation must validate tenant

Absolute.

---

## Assignment command

Conceptually:

```text
assignFollowUp(
    followUpId,
    assigneeMembershipId,
    expectedRevision
)
```

should:

* authorize actor,
* validate target membership,
* validate context visibility,
* update responsibility,
* preserve assignment history/event.

---

## Reassignment history

Where operationally important, retain:

```text
Alice → Bob
```

rather than only current assignee.

---

## Scheduling command

Conceptually:

```text
rescheduleFollowUp(
    followUpId,
    dueAt,
    timezoneContext,
    expectedRevision
)
```

should preserve prior schedule history/event.

---

## Due time storage

Store canonical absolute timestamp with relevant timezone context.

Do not store only:

> Tomorrow afternoon

as authoritative persistence.

Natural-language input, if present later, must resolve to exact stored semantics before commit.

---

## Overdue calculation

Centralize:

```text
FollowUpDueResolver
```

Do not implement overdue logic independently in:

* Queue,
* Dashboard,
* My Work,
* Calendar,
* Notifications.

Designs 004, 015, 078, 095 must agree.

---

## “Due today” timezone

Use workspace/user/FollowUp policy explicitly.

Do not mix server UTC date with local user date.

---

## Reminder scheduling

If reminders exist:

create scheduling/notification jobs referencing FollowUp.

Reminder delivery does not mutate FollowUp lifecycle.

---

## Reminder retries

Must not create duplicate NotificationRecords where Design 080 dedupe semantics apply.

---

## Calendar projection

If a FollowUp appears in Design 035:

generate/read a `ScheduleEntry` projection.

Do not duplicate FollowUp into a Calendar business record.

---

## Completion command

Conceptually:

```text
completeFollowUp(
    followUpId,
    expectedRevision,
    completionInput,
    idempotencyKey
)
```

should:

1. authorize;
2. reload current FollowUp;
3. validate actionable lifecycle;
4. record completion actor/time;
5. record outcome if required/provided;
6. emit completion event;
7. queue explicit downstream actions;
8. return source action references/results.

---

## Completion idempotency

Double-clicking Complete must not:

* duplicate Outcome,
* duplicate successor FollowUp,
* duplicate Task,
* duplicate Meeting,
* repeat Lead/Deal mutation.

---

## Completed FollowUp should be terminal unless explicit correction/reopen policy exists

Do not silently mutate back to Open because someone changes a note.

If reopening is supported, make it explicit and audited.

Do not invent frozen UI for reopening.

---

## FollowUpOutcome service

Where structured outcomes exist:

```text
recordFollowUpOutcome()
correctFollowUpOutcome()
```

should preserve revision/history.

---

## Outcome correction

Correction must not rerun prior downstream actions automatically.

Example:

```text
Outcome v1:
Interested
→ Deal action already executed

Outcome corrected to:
Needs more information
```

Do not automatically reverse Deal unless explicit governed compensation is requested.

---

## Downstream action orchestration

Conceptually:

```text
FollowUpOutcome / completion
          ↓
FollowUpActionOrchestrator
   ├── FollowUpService      successor follow-up
   ├── MeetingService
   ├── TaskService
   ├── LeadService
   └── DealService
```

Every command remains source-owned.

---

## Successor FollowUp idempotency

“Follow up again next week” should create one successor, not one per retry.

---

## Meeting creation

If outcome is:

> Meeting booked

create canonical Meeting using `MeetingService`.

Do not store only a date/string on FollowUp.

---

## Lead mutation

If permitted action requests:

> qualify Lead

invoke canonical `LeadService`.

No direct DB patch.

---

## Deal mutation

Same for DealService.

---

## Partial action handling

Example:

```text
FollowUp completed        ✓
Outcome recorded          ✓
Successor FollowUp        ✓
Task creation             ✓
Deal stage command        ✕
```

Correct response:

* FollowUp remains completed.
* Outcome remains recorded.
* successful actions remain.
* Deal action explicitly failed/retryable.

Do not roll everything back.

Do not mark everything successful.

---

## Distributed transaction boundary

Use:

* FollowUp transaction,
* durable outbox/action requests,
* idempotent downstream commands.

Do not hold one transaction across Lead/Deal/Meeting/Task domains.

---

## Source context changes

If related Lead or Deal changes while FollowUp is open:

current detail can show latest authorized context.

Historical FollowUp creation/source evidence remains preserved.

---

## Source archive/merge handling

Examples:

### Contact merged

FollowUp can navigate to canonical surviving Contact while preserving source lineage.

### Lead converted

FollowUp remains historical and may still be actionable depending on policy.

### Deal closed

Current actionability can be re-evaluated.

None requires deleting FollowUp.

---

## Actionability resolver

Design 095 benefits from:

```text
FollowUpActionabilityResolver
```

which considers:

* lifecycle,
* due state,
* assignment,
* source context,
* permissions,
* source closure/restriction.

It should not silently rewrite FollowUp lifecycle.

---

## Queue query

Conceptually:

```text
getFollowUps(
   currentMembership,
   filters,
   pagination
)
```

Current membership determines user/team visibility.

Never accept browser userId as authoritative for “My FollowUps.”

---

## Queue ordering

Centralize business ordering where frozen UI depends on it.

Potential factors may include:

* overdue,
* dueAt,
* priority,
* assignment.

Do not independently sort differently across Design 015/078/095 without explicit reason.

---

## Queue counts

Sidebar/dashboard/My Work counts and Design 095 counts should derive from the same lifecycle/due/actionability semantics.

---

## Queue projection ≠ FollowUp entity

`FollowUpQueueEntry` should remain:

* permission safe,
* rebuildable,
* optimized for listing.

It never owns canonical mutation state.

---

## Optimistic concurrency

FollowUp mutations should use revision/version.

Example:

Reviewer A completes F1 while Reviewer B reschedules it.

One operation must detect changed state and reconcile rather than silently overwrite.

---

## Completion vs reschedule race

Critical.

If completion wins:

reschedule must fail/reload.

If reschedule wins first:

completion should use current revised state.

---

## Assignment vs completion race

Completion records actual authenticated actor separately from current assignee.

The person completing need not always equal assignee if policy allows it.

Do not rewrite assignee history.

---

## Activity

FollowUp events can include:

```text
FollowUpCreated
FollowUpAssigned
FollowUpReassigned
FollowUpRescheduled
FollowUpBecameOverdue   ← projection/event policy if needed
FollowUpCompleted
FollowUpCancelled
FollowUpOutcomeRecorded
SuccessorFollowUpCreated
```

Be cautious with high-volume derived “became overdue” Audit noise; it may belong in operational projections rather than compliance Audit.

---

## Audit

Material human actions should be audited:

* creation,
* reassignment,
* material due-date changes,
* completion,
* cancellation,
* outcome correction.

---

## Notifications

Design 080 consumes canonical events such as:

```text
FollowUpAssigned
FollowUpDueSoon
FollowUpOverdue
```

but Notification state remains independent.

---

## Personal Work integration

Design 078 should project open/actionable assigned FollowUps.

Correct lineage:

```text
FollowUp F1
    ↓
PersonalWorkQueueEntry
```

Completing from My Work should call `FollowUpService.completeFollowUp()`, not mutate the projection.

---

## Search

Design 079 may index safe FollowUp metadata if frozen Universal Search supports this entity.

Sensitive Notes/outcomes/context fields should remain permission controlled.

---

## Performance

Use:

* indexed assignee + lifecycle + dueAt,
* tenant-scoped cursor pagination,
* batched Contact/Company/Lead/Deal summaries,
* derived due-state calculation,
* lazy history/Activity.

Avoid N+1 source detail fetches for queue rows.

---

## Useful indexes conceptually

Depending on physical schema:

```text
organizationId + assignee + lifecycle + dueAt
organizationId + lifecycle + dueAt
organizationId + sourceType/sourceId
```

Exact database strategy belongs to Phase 3D.

---

## Partial failure contract

Example:

```text
FollowUp core      ✓
Contact context    ✓
Company context    ✓
Lead context       ✓
Deal context       ✕
Outcome            ✓
Task service       ✕
Activity           ✓
```

Design 095 still renders the FollowUp.

Deal context and Task action show explicit unavailability.

Not:

> FollowUp not found.

---

## Backend Requirement Matrix

| Requirement                               | Status                                 |
| ----------------------------------------- | -------------------------------------- |
| Canonical FollowUp reuse from 015         | **Critical**                           |
| FollowUp/Task separation                  | **Critical**                           |
| FollowUp/Meeting separation               | **Critical**                           |
| FollowUp/Lead separation                  | **Critical**                           |
| FollowUp/Contact separation               | **Critical**                           |
| FollowUp/Company separation               | **Critical**                           |
| FollowUp/Deal separation                  | **Critical**                           |
| Typed source/context references           | **Critical**                           |
| Multiple valid source contexts            | **Required**                           |
| Source context/ownership separation       | **Critical**                           |
| FollowUp assignment/Lead owner separation | **Critical**                           |
| Assignment/authorization separation       | **Critical**                           |
| FollowUp due/reminder separation          | **Critical**                           |
| Due condition/lifecycle separation        | **Critical**                           |
| Overdue as derived condition              | **Critical**                           |
| Timezone-correct due calculation          | **Critical**                           |
| Reschedule/reminder snooze distinction    | **Critical**                           |
| Completion/outcome separation             | **Critical**                           |
| Completion/commercial success separation  | **Critical**                           |
| Outcome/LeadStatus separation             | **Critical**                           |
| Outcome/DealStage separation              | **Critical**                           |
| Completion/new Meeting separation         | **Critical**                           |
| Successor FollowUp lineage                | **Critical where continuation exists** |
| Source-created FollowUp idempotency       | **Critical**                           |
| Completion idempotency                    | **Critical**                           |
| Downstream action idempotency             | **Critical**                           |
| Canonical Meeting creation                | **Critical**                           |
| Canonical Task creation                   | **Critical**                           |
| Explicit LeadService commands             | **Critical**                           |
| Explicit DealService commands             | **Critical**                           |
| Partial downstream-action outcomes        | **Critical**                           |
| No generic cross-domain mega-PATCH        | **Critical**                           |
| Durable action/outbox coordination        | **Required**                           |
| Optimistic concurrency                    | **Critical**                           |
| Completion/reschedule race handling       | **Critical**                           |
| Queue projection/source separation        | **Critical**                           |
| Permission-aware queue counts             | **Critical**                           |
| Design 078 Personal Work reuse            | **Critical**                           |
| Design 035 Calendar projection reuse      | **Required**                           |
| Design 080 Notification reuse             | **Required**                           |
| Design 094 Meeting Outcome reuse          | **Critical**                           |
| Design 093 Reply Review reuse             | **Critical**                           |
| Source-domain partial failure handling    | **Critical**                           |
| Permission-safe caching                   | **Critical**                           |
| Cursor pagination/indexing                | **Required at scale**                  |
| Audit integration                         | **Required**                           |
| Design 096 Deal-state separation          | **Critical architecture**              |

---

# 8. Consolidation

Design 095 exposes significant risk of creating yet another generic work or CRM-state system.

**FollowUp / FollowUpQueueEntry conflation**
Queue projection becomes canonical work record.

**FollowUp / Task conflation**
Relationship action and internal work merge into generic checklist item.

**FollowUp / Meeting conflation**
Planned call becomes Meeting without actual Meeting entity.

**FollowUp / reminder conflation**
Notification mechanism becomes business obligation.

**FollowUp / CalendarEvent conflation**
Scheduling projection becomes canonical source.

**FollowUp / Lead next-action field conflation**
CRM Lead stores duplicate actionable truth.

**FollowUp / Contact activity conflation**
Person timeline becomes work engine.

**FollowUp / Deal stage conflation**
Post-sale action changes Pipeline directly.

**Source context / FollowUp identity conflation**
Meeting/Reply-specific follow-up tables proliferate.

**MeetingFollowUp / ReplyFollowUp / LeadFollowUp duplication**
Multiple backends represent the same action type.

**Source state / FollowUp state conflation**
Deal closes and FollowUp disappears historically.

**Source ownership / assignee conflation**
Lead owner automatically becomes FollowUp assignee.

**FollowUp assignment / Lead assignment conflation**
Queue routing changes CRM ownership.

**FollowUp assignment / authorization conflation**
Assigned user gains source access automatically.

**DueAt / reminder time conflation**
Snoozing a notification changes business deadline.

**Reschedule / snooze conflation**
Attention management rewrites obligation date.

**Due condition / lifecycle conflation**
Overdue becomes canonical status.

**Overdue / failed conflation**
Late obligation is treated as failed work.

**Completed / successful conflation**
“No answer” follow-up is reported as positive success.

**Completed / Outcome recorded conflation**
System cannot distinguish processed action from missing outcome.

**Outcome / LeadStatus conflation**
“Interested” directly qualifies Lead.

**Outcome / DealStage conflation**
“Send proposal” automatically advances Deal.

**Outcome / Note conflation**
Freeform commentary becomes structured business disposition.

**Outcome / next FollowUp conflation**
“Try again next week” creates no actual future obligation.

**Rescheduled FollowUp / successor FollowUp conflation**
Historical attempts become indistinguishable from future obligations.

**Successor FollowUp / reopen old FollowUp conflation**
Completed history is mutated back to Open.

**Cancelled / completed conflation**
Unperformed work appears executed.

**Reminder dismissed / FollowUp completed conflation**
Clearing alert removes obligation.

**Notification read / FollowUp completed conflation**
Attention state becomes work state.

**FollowUp completion / Meeting creation conflation**
“Meeting booked” is stored only as FollowUp state.

**FollowUp completion / Task creation conflation**
Internal work remains hidden in outcome notes.

**Task creation failure / FollowUp completion failure conflation**
Completed relationship action is rolled back because Task service failed.

**Lead service failure / FollowUp disappearance conflation**
Valid action vanishes because CRM context is unavailable.

**Deal service failure / no Deal conflation**
Context outage is shown as absence.

**Source restricted / no source conflation**
User is misled about origin.

**Contact changed employer / FollowUp recreated conflation**
Current CRM change duplicates obligation.

**Lead converted / FollowUp deleted conflation**
Historical action lineage disappears after conversion.

**Deal won / FollowUp auto-completed conflation**
Source transition falsifies actual work completion.

**Manual complete / downstream mega-mutation conflation**
One button patches Lead, Deal, Meeting, Task and FollowUp tables.

**Outcome retry / duplicate successor creation**
Double-click creates several future FollowUps.

**Outcome retry / duplicate Meeting creation**
One booked meeting becomes several Meetings.

**Outcome retry / duplicate Task creation**
Repeated action generates duplicate internal work.

**Concurrent complete/reschedule race**
Completed FollowUp reopens with new due date.

**Concurrent assignment/complete race**
Assignee/history becomes inaccurate.

**Browser supplied completedBy / actor identity conflation**
User falsifies who completed action.

**“My FollowUps” browser userId trust**
User queries another employee's private queue.

**Queue count / Notification count conflation**
Attention and work obligations disagree.

**Queue count / My Work count drift**
Design 078 and 095 use different actionability semantics.

**FollowUp list / Task list merge by convenience**
Canonical type boundaries disappear.

**Calendar copy / FollowUp truth conflation**
Deleting calendar projection deletes action.

**Mega FollowUp table with copied Contact/Company/Deal data**
CRM context becomes stale.

**Cache by FollowUp ID only**
Restricted Deal/Contact context leaks.

**095/015 duplicate FollowUp backend**
Meetings/workspace and detailed queue disagree.

**095/034 duplicate Task backend**
FollowUps become generic internal work.

**095/035 duplicate Calendar backend**
Due follow-ups become standalone events.

**095/078 duplicate My Work truth**
Projection becomes second source.

**095/089 duplicate Lead next-action backend**
Lead 360 stores FollowUp separately.

**095/093 duplicate Reply action backend**
Reply Review creates private follow-up rows.

**095/094 duplicate Meeting Outcome action backend**
Post-meeting follow-ups diverge.

No additional screen is required.

These are **FollowUp identity, source-context lineage, deadline semantics, assignment, completion/outcome, continuation, source-domain actions, idempotency, concurrency, My Work/Calendar projection reuse, and partial-failure requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL FOLLOW-UP QUEUE, DEADLINE, COMPLETION & CONTINUATION-ACTION ANCHOR**

**Domain directive:**
**FollowUp ≠ Task ≠ Meeting ≠ Lead ≠ Contact ≠ Company ≠ Deal ≠ FollowUpSource/Context ≠ Assignment ≠ DueSchedule ≠ FollowUpOutcome/Completion ≠ Notification ≠ ActivityEvent.**

**Identity directive:**
Design 015 remains the sole canonical FollowUp foundation. Design 095 provides queue/detail projections and actions over that same FollowUp identity rather than introducing MeetingFollowUp, ReplyFollowUp, LeadFollowUp, or another generic WorkItem.

**Purpose directive:**
FollowUp represents a relationship/sales continuation obligation. General internal work remains canonical Task.

**Source directive:**
every FollowUp may retain typed source/business context—Meeting, Reply, Lead, Contact, Company, Deal, Client, or other authorized source—without becoming or copying that source entity.

**Context-history directive:**
later Contact/Company edits, Lead conversion, Deal progression, or source archival never rewrite the historical reason/context that created the FollowUp.

**Assignment directive:**
FollowUp assignee is operational responsibility for this action only. It remains independent from Lead owner, Deal owner, Meeting organizer, Reply reviewer, role, and authorization.

**Scheduling directive:**
FollowUp business due time remains distinct from reminder time, calendar projection, created time and Meeting scheduling.

**Overdue directive:**
overdue is a derived due condition over current time + dueAt + actionable lifecycle. It is never a replacement for FollowUp lifecycle.

**Reschedule directive:**
rescheduling changes the current due commitment while preserving history. Reminder snooze/dismissal must not silently change dueAt unless the canonical product explicitly defines that behavior.

**Lifecycle directive:**
Open/In Progress/Completed/Cancelled remain independent from assignment and due condition. `Completed` means the obligation was processed—not that the commercial outcome was positive.

**Outcome directive:**
FollowUpOutcome/Completion evidence records what actually happened and remains distinct from LeadStatus, Qualification, DealStage, Meeting status and Task lifecycle.

**Continuation directive:**
when a completed FollowUp produces a genuine new future relationship obligation, create a canonical successor FollowUp with lineage rather than reopening or rewriting the completed FollowUp.

**Meeting directive:**
a booked Meeting creates a canonical Meeting through the Meeting service. FollowUp state never substitutes for Meeting identity.

**Task directive:**
post-FollowUp internal work creates canonical Design 034 Tasks. FollowUp outcome notes do not become a second Task system.

**Lead directive:**
FollowUp completion/outcome can request an explicit Lead-domain action, but it never silently changes Lead status, qualification, owner, conversion or identity.

**Deal directive:**
FollowUp outcome can request an explicit Deal-domain action, but Deal stage/value/lifecycle remain canonical in the Deal domain and are never derived solely from FollowUp completion.

**Idempotency directive:**
source-created FollowUps, completion, successor creation, Meeting creation, Task creation and downstream Lead/Deal commands must be replay-safe so UI retries, event redelivery or network errors never duplicate obligations/actions.

**Concurrency directive:**
FollowUp mutations use revision protection. Completion, reschedule, reassignment and cancellation races must be detected rather than resolved through silent last-write-wins.

**Actionability directive:**
current actionability may consider FollowUp lifecycle, due state, assignment, permissions and source context, but actionability remains a projection/resolver and never silently rewrites lifecycle.

**Partial-action directive:**
FollowUp completion/outcome persists independently from optional downstream actions. Successful actions remain valid when another target domain fails, and each failed action remains separately retryable/auditable.

**Transaction directive:**
Design 095 is not a distributed transaction boundary. Cross-domain effects use canonical service commands plus durable/idempotent orchestration instead of direct multi-table mutation.

**Queue directive:**
`FollowUpQueueEntry` and `FollowUpDetailView` remain permission-safe read projections. Queue filtering, sorting, counts and display metadata can be optimized but must never become editable canonical FollowUp truth.

**Personal-Work directive:**
Design 078 consumes FollowUp as one typed work source. Completing a FollowUp from My Work must call the same `FollowUpService`, ensuring Design 078 and Design 095 never diverge.

**Calendar directive:**
Design 035 can expose FollowUps through ScheduleEntry projections. Calendar deletion/movement must not silently delete or mutate FollowUp without the canonical FollowUp command.

**Notification directive:**
Design 080 may notify about assignment, due-soon or overdue states, but Notification read/dismissal never completes, cancels, reschedules or reassigns the FollowUp.

**Authorization directive:**
FollowUp read/create/edit/assign/reschedule/complete/cancel/outcome permissions remain independent from source Lead/Deal/Contact permissions and downstream action permissions. Every source-domain command performs fresh authorization.

**Actor directive:**
assignee, completion actor and mutation actor identities derive from authenticated membership/server validation rather than arbitrary browser-supplied authority.

**Timezone directive:**
due-time and “due today/overdue” calculations use one canonical timezone-aware resolver shared with Design 015, My Work, Dashboard, Calendar and Notifications.

**Partial-failure directive:**
FollowUp core data remains available when Contact, Company, Lead, Deal, Task, Calendar, Notification, or Activity dependencies fail. `Unavailable` must never become false `No source`, `No Deal`, `No Task`, or missing FollowUp.

**Performance directive:**
use tenant-scoped indexed queue queries over assignee/lifecycle/dueAt, batched context projections, cursor pagination, lazy history and centralized due/actionability resolvers rather than N+1 source loading.

**Audit directive:**
material creation, assignment/reassignment, rescheduling, completion, cancellation and outcome correction generate safe Audit evidence, while derived overdue/reminder projections remain operational unless audit policy explicitly requires them.

**Future-reuse directive:**
Design 096 must consume canonical Lead/Deal state reached through explicit commands originating from FollowUps/Meetings/Replies, and it must not interpret FollowUp completion itself as Deal qualification or stage truth.

**Overlap directive:**
Designs **015, 034–035, 078, 080, 089, 093–096** must share one continuous **Source Context → Canonical FollowUp → Assignment/Due → Completion/Outcome → Explicit Successor/Meeting/Task/Lead/Deal Action** lineage while keeping Work, Calendar, Notification, CRM, Deal and Meeting state independent.

**Consolidation directive:**
**STANDARDIZE ONE FOLLOW-UP FOUNDATION — CANONICAL FOLLOWUP IDENTITY + TYPED SOURCE/CONTEXT REFERENCES + INDEPENDENT ASSIGNMENT + TIMEZONE-SAFE DUE SCHEDULE + DERIVED OVERDUE/ACTIONABILITY + REVISION-AWARE COMPLETION/OUTCOME + EXPLICIT SUCCESSOR FOLLOWUP LINEAGE + CANONICAL MEETING/TASK CREATION + GOVERNED LEAD/DEAL COMMANDS + SHARED MY-WORK/CALENDAR/NOTIFICATION PROJECTIONS + IDEMPOTENT PARTIAL-FAILURE-AWARE ACTION ORCHESTRATION — AND NEVER ALLOW REMINDERS, OVERDUE FLAGS, SOURCE STATE, QUEUE ROWS, COMPLETION BUTTONS OR OUTCOME LABELS TO BECOME TASK TRUTH, LEAD LIFECYCLE, DEAL STAGE, MEETING IDENTITY OR HIDDEN CROSS-DOMAIN MUTATION.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **95 / 153** |
| **PASS**                                   |                         **95** |
| **STANDARDIZE decisions**                  |                         **93** |
| **Potential implementation-overlap flags** |                         **86** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**95 / 153 = 62.1% audited.**

### Canonical Follow-up architecture after Design 095

```text
                         FOLLOWUP
                  canonical action identity
                           │
        ┌──────────────────┼─────────────────┐
        ↓                  ↓                 ↓
    Assignment          DueAt           Source Context
                                             │
                   ┌─────────┬─────────┬─────┴─────┐
                   ↓         ↓         ↓           ↓
                Meeting     Reply     Lead        Deal
                                             │
                                             ↓
                                    FollowUp Outcome
                                             │
                     ┌───────────────────────┼──────────────────┐
                     ↓                       ↓                  ↓
              Successor FollowUp           Task              Meeting
                                             │
                                             ↓
                                   explicit Lead/Deal
                                      domain commands
```

The lifecycle/deadline boundary is now explicit:

```text
FollowUp lifecycle = OPEN
Due condition      = OVERDUE

These are separate.

and

Reminder dismissed
        ≠
FollowUp completed
```

Likewise, completing an action is not the same as obtaining a positive business result:

```text
FollowUp = COMPLETED
Outcome  = NO RESPONSE

is completely valid.
```

And continuation must preserve history:

```text
FollowUp F1
“Call Sarah Friday”
        ↓
Completed Friday
Outcome: “Asked me to call again next week”
        ↓
FollowUp F2
“Call Sarah next Friday”

F1 remains COMPLETED.
F2 is the new obligation.

F1 is NOT reopened.
```

The post-completion boundary is equally strict:

```text
FollowUp completed            ✓
Outcome recorded              ✓
Successor FollowUp created    ✓
Task created                  ✓
Deal update                   ✕

RESULT:
FollowUp and successful actions remain valid.
Deal update is explicitly failed/retryable.

NOT:
roll everything back

and NOT:
claim full success.
```

## Next Sequential Audit Target

### **Design 096 — Deal Qualification / Deal Stage Detail**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
