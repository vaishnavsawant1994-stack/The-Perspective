Correct. We continue strictly with the frozen **Design 015 — Meetings & Follow-ups**. This audit defines the canonical scheduling and next-action architecture without turning Meetings, Follow-ups, Tasks, Calendar events, or Deal activity into the same object.

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 015 — Meetings & Follow-ups

| Audit field                 | Classification                                                                                                                 |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**               | **015**                                                                                                                        |
| **Canonical name**          | **Meetings & Follow-ups**                                                                                                      |
| **Product area**            | Sales / CRM / Activity Management                                                                                              |
| **User surface**            | Team Workspace                                                                                                                 |
| **Screen class**            | Activity Queue + Scheduling Workspace                                                                                          |
| **Classification**          | **Unique Anchor — Action & Scheduling Workspace Family**                                                                       |
| **Primary purpose**         | Manage scheduled meetings and future sales actions arising from Leads, Conversations, Campaigns, Deals and client interactions |
| **Primary entities**        | **Meeting, FollowUp**                                                                                                          |
| **Supporting entities**     | Contact, Company, Lead, Deal, Conversation, Campaign, User, Task, CalendarConnection, Activity                                 |
| **Parent shell**            | `InternalAppShell` — Design 001                                                                                                |
| **Template family**         | `ActionSchedulingWorkspaceTemplate`                                                                                            |
| **Auth**                    | Required                                                                                                                       |
| **Permissions**             | Meeting/follow-up + ownership/team/calendar scopes                                                                             |
| **Implementation priority** | **Core / Critical**                                                                                                            |
| **Reuse level**             | **Very High**                                                                                                                  |

---

# 1. Functional responsibility

Design 015 answers:

> **“What meetings are scheduled, which follow-ups are due, what happened in completed meetings, and what sales action must happen next?”**

The natural handoff from Design 014 is:

```text
Reply / Conversation
        ↓
Needs human action
        ↓
┌───────────────────┐
│ Meeting           │
│ Follow-up         │
└───────────────────┘
        ↓
Outcome / Next Action
        ↓
Lead / Deal progression
```

The central architectural rule is:

> **Meeting ≠ Follow-up ≠ Task ≠ Calendar Event ≠ Activity Event.**

They can be related, but they must not all become one generic record.

---

# 2. Meeting as a canonical business entity

A Meeting represents an actual scheduled business interaction.

Conceptually:

```text
Meeting
├── title / purpose
├── startAt
├── endAt
├── timezone
├── participants
├── owner
├── location / meeting link
├── status
├── related Lead / Contact / Deal
├── calendar synchronization
├── outcome
└── follow-up relationship
```

Examples include:

**Discovery Call**
**Proposal Review**
**Negotiation Call**
**Client Meeting**
**Internal Handoff**

The exact meeting types belong to Phase 3D.

---

# 3. Follow-up as a separate canonical entity

A Follow-up represents:

> **A required future action associated with a business relationship or event.**

For example:

```text
FollowUp
├── subject
├── dueAt
├── owner
├── priority
├── related record
├── status
├── source/reason
└── completion metadata
```

Examples:

**Send proposal**
**Call after meeting**
**Ask for missing information**
**Follow up after positive reply**
**Check contract decision**

A Follow-up is not inherently a calendar meeting.

---

# 4. Meeting vs Follow-up

This distinction must remain explicit.

### Meeting

Has:

**scheduled start/end**
**participants**
**meeting location/link**
**calendar semantics**

### Follow-up

Has primarily:

**action + due time + responsible person**

For example:

```text
Meeting:
Discovery Call
Tomorrow 2:00–2:30 PM
```

can produce:

```text
Follow-up:
Send customized proposal
Due Friday
```

They are linked, but not the same object.

---

# 5. Follow-up vs Task

This requires careful architecture because the platform later contains a substantial Project Task system.

A useful distinction is:

### Follow-up

Business-relationship action associated with Sales/CRM interaction.

### Task

General actionable work item used across Projects and operational workflows.

For example:

```text
Follow-up:
Call Sarah about proposal
```

versus:

```text
Project Task:
Design 12-page magazine layout
```

They can share lower-level components:

* assignee
* due date
* priority
* status
* reminders

but should not automatically share identical domain semantics.

---

# 6. Possible Task-backed Follow-up architecture

Implementation may eventually choose:

```text
ActionItem
├── FollowUp
└── ProjectTask
```

or maintain separate domain entities sharing primitives.

That decision belongs to Phase 3D.

The important audit requirement is:

> **Do not casually merge Follow-up and Project Task just because both have a due date and checkbox.**

Sales attribution, Lead relationships and follow-up metrics require domain meaning.

---

# 7. Calendar Event vs Meeting

External calendar providers may represent a Meeting as a provider event.

But:

```text
Canonical Meeting ≠ Google Calendar Event ≠ Outlook Event
```

Correct architecture:

```text
Canonical Meeting
       ↓
Calendar Sync Service
       ↓
Provider Event
```

The Meeting remains the platform's business record.

Provider event IDs are synchronization references.

---

# 8. Why the platform needs its own Meeting record

If the platform stores only an external calendar event, it becomes difficult to preserve:

**Lead relationship**
**Deal relationship**
**Campaign attribution**
**Meeting outcome**
**sales stage impact**
**follow-up created from meeting**
**meeting performance analytics**

Therefore:

> **Calendar provider handles calendar transport; the platform owns business context.**

---

# 9. Canonical Meeting lifecycle

A Meeting should have a clear lifecycle.

Conceptually:

```text
SCHEDULED
   ↓
COMPLETED
```

with branches such as:

```text
CANCELLED
NO_SHOW
RESCHEDULED
```

Exact states belong to Phase 3D.

Important:

```text
Meeting lifecycle ≠ Calendar sync health
```

A Meeting can be:

**SCHEDULED**

while:

**calendar sync = FAILED**

Those are different conditions.

---

# 10. Rescheduling architecture

Rescheduling should preserve history.

Incorrect:

```text
change startAt
forget old schedule
```

Better conceptual behavior:

```text
Original Meeting
10:00 AM
   ↓
Rescheduled
   ↓
11:30 AM
```

with an activity/history record showing:

* old time,
* new time,
* actor,
* timestamp.

Whether a separate Meeting record or historical version is used will be decided later.

---

# 11. Meeting cancellation

Cancellation should not delete the Meeting.

It should preserve:

**participants**
**scheduled time**
**related Lead/Deal**
**reason where applicable**
**cancellation actor/time**

This information matters for reporting and future relationship context.

---

# 12. Meeting outcome must be structured

After completion, users should not be limited to an unstructured note.

A Meeting Outcome may conceptually include:

```text
MeetingOutcome
├── outcome category
├── summary
├── next action
├── commercial intent
├── follow-up date
└── createdBy
```

Examples of outcome categories might later include:

**Positive**
**Needs Follow-up**
**Proposal Requested**
**Negotiation**
**Not Interested**
**No Show**

Exact taxonomy belongs to Phase 3D.

---

# 13. Outcome ≠ Meeting status

For example:

```text
Meeting Status:
COMPLETED

Outcome:
PROPOSAL_REQUESTED
```

Another:

```text
Meeting Status:
COMPLETED

Outcome:
NOT_INTERESTED
```

Both are completed Meetings.

Their business outcomes differ.

Do not put `PROPOSAL_REQUESTED` into the Meeting status enum.

---

# 14. Follow-up lifecycle

A Follow-up should have its own lifecycle.

Conceptually:

```text
OPEN
 ↓
COMPLETED
```

with possible additional states such as:

```text
CANCELLED
```

Overdue should normally be derived:

```text
status = OPEN
AND
dueAt < now
```

rather than stored as a permanent status.

This avoids:

```text
OVERDUE_COMPLETED
```

style contradictions.

---

# 15. Due state vs workflow state

Correct:

```text
FollowUp Status:
OPEN

Due Condition:
OVERDUE
```

or:

```text
FollowUp Status:
OPEN

Due Condition:
DUE_TODAY
```

This matches the architectural discipline established in Design 006.

---

# 16. Priority is another independent dimension

A Follow-up may be:

```text
Status: OPEN
Due Condition: DUE_TODAY
Priority: HIGH
```

These should remain independent fields.

One giant status field should not represent all three.

---

# 17. Canonical Meetings & Follow-ups workspace regions

Without redesigning the approved UI, its implementation should normalize into:

### Summary layer

Potential metrics:

**Meetings Today**
**Upcoming Meetings**
**Follow-ups Due Today**
**Overdue Follow-ups**
**Completed Meetings**
**No Shows**

### Main views

Potentially:

**Meetings**
**Follow-ups**
**Upcoming**
**Overdue**
**Completed**

The exact visible tabs follow the approved design.

### Meeting list

Priority fields:

**Contact / Company**
**Meeting Type**
**Date / Time**
**Owner**
**Related Lead / Deal**
**Status**
**Outcome**

### Follow-up list

Priority fields:

**Action**
**Contact / Company**
**Due**
**Owner**
**Priority**
**Related Record**
**Status**

### Quick actions

**Schedule Meeting**
**Create Follow-up**
**Mark Complete**
**Reschedule**
**Record Outcome**
**Open Lead / Deal**

---

# 18. Meeting creation from Conversation

From Design 014:

```text
Conversation
    ↓
Schedule Meeting
    ↓
Meeting creation
    ↓
Contact automatically linked
Lead/Campaign context preserved
```

The user should not have to manually reconstruct context that the system already knows.

---

# 19. Meeting creation from Lead

Likewise:

```text
Lead
 ↓
Schedule Meeting
 ↓
Meeting
```

should preserve:

**Lead ID**
**Contact**
**Company**
**owner**
**source context**

This creates useful attribution.

---

# 20. Meeting creation from Deal

During an active commercial opportunity:

```text
Deal
 ↓
Negotiation Meeting
```

The Meeting may relate primarily to the Deal while still linking Contact and Company participants.

This allows:

```text
Deal
├── Meetings
├── Proposals
├── Follow-ups
└── Activities
```

without duplicating records.

---

# 21. Multi-record relationship model

A Meeting may reasonably relate to several entities:

```text
Meeting
├── Company
├── Contact(s)
├── Lead
├── Deal
└── Conversation
```

The data model should avoid stuffing all this into one `relatedTo` text field.

Canonical typed relationships are preferable.

---

# 22. Participant architecture

Meeting participants are not identical to CRM Contacts.

Participants can include:

**internal team users**
**external CRM Contacts**
**external email addresses not yet canonical Contacts**

Therefore conceptually:

```text
MeetingParticipant
├── type
├── userId?
├── contactId?
├── email?
├── attendance state?
└── response state?
```

Exact schema waits for Phase 3D.

---

# 23. Calendar synchronization

Correct architecture:

```text
Meeting Command
      ↓
Canonical Meeting
      ↓
Calendar Sync Service
      ↓
Connected Calendar
Design 092/Integration layer
      ↓
Google / Microsoft provider
```

If provider synchronization fails:

```text
Meeting record       ✓
Calendar sync        ✕
```

The business Meeting should not disappear.

---

# 24. Sync state must be separate

Conceptually:

```text
Meeting:
SCHEDULED

CalendarSync:
FAILED
```

The UI can show:

> Meeting saved; calendar synchronization needs attention.

This is more accurate than failing the entire Meeting creation after the business record has already persisted.

The exact transaction/retry policy will need careful implementation.

---

# 25. External calendar changes

If a user edits an externally synchronized event directly in Google Calendar or Outlook, the platform needs explicit sync semantics.

Potential architecture:

```text
Provider change
      ↓
Calendar sync event
      ↓
Conflict / reconciliation policy
      ↓
Canonical Meeting update
```

The system must define who wins in conflict scenarios.

This belongs to Phase 3D/integration architecture.

---

# 26. Calendar connection ownership

A Meeting may be associated with an organizer's connected calendar account.

That does **not** mean every user can schedule through every team's calendar connection.

Calendar-account use requires permission and ownership controls.

---

# 27. Timezone architecture

Meetings require timezone-explicit storage.

Recommended conceptual pattern:

```text
startAt = absolute timestamp
endAt   = absolute timestamp
display timezone = contextual
```

while preserving relevant timezone intent where required.

Never store ambiguous:

```text
"Tuesday at 2"
```

without timezone semantics.

---

# 28. Daylight-saving correctness

Because users and Contacts may be in different countries, Meeting scheduling must use timezone-aware libraries/data.

Fixed numeric offsets alone are not always sufficient because daylight-saving changes.

This is backend/domain correctness, not UI styling.

---

# 29. Follow-up scheduling

Follow-ups can be generated manually or automatically from canonical business events.

Examples:

```text
Positive Reply
      ↓
Create Follow-up
```

or:

```text
Meeting completed
      ↓
Outcome = Proposal Requested
      ↓
Follow-up = Send Proposal
```

Automation can suggest/create Follow-ups only under canonical workflow policy.

---

# 30. Next action architecture

This audit should formally solve the “Next Action” problem raised during Design 011.

Instead of storing random text directly on Lead:

```text
Lead.nextAction = "call tomorrow"
```

a cleaner architecture is:

```text
Lead
 ↓
related open Follow-ups / Meetings
 ↓
NextActionResolver
 ↓
next actionable item
```

Then Design 011 can display:

> Follow up Aug 24

without duplicating the underlying action.

---

# 31. Canonical Next Action Resolver

Conceptually:

```text
NextActionResolver
├── open FollowUps
├── upcoming Meetings
├── required Tasks where relevant
└── business priority rules
```

It returns a summarized view.

The resolver must be centralized so Lead CRM, Sales Dashboard and Lead Detail do not calculate next action differently.

---

# 32. Follow-up source / reason

A Follow-up should retain why it exists.

For example:

```text
sourceType: CONVERSATION
sourceId: conversation-123
```

or:

```text
sourceType: MEETING_OUTCOME
sourceId: meeting-456
```

This produces traceability.

---

# 33. Follow-up completion

When marked complete, preserve:

**completedAt**
**completedBy**
**completion note/outcome where applicable**

Do not simply remove the item from all records.

Historical actions are valuable.

---

# 34. Follow-up recurrence

If recurring Follow-ups are part of the approved functional scope later, recurrence should use a canonical recurrence model.

But this audit does **not invent recurring Follow-ups** merely because calendar systems support recurrence.

No new feature is added.

---

# 35. Meeting reminders vs Follow-ups

These are different.

### Meeting Reminder

Notification related to an existing scheduled Meeting.

### Follow-up

Independent business action requiring completion.

Example:

> “Meeting begins in 15 minutes” = reminder.

> “Send proposal tomorrow” = Follow-up.

Do not create Follow-up rows solely to implement notification reminders.

---

# 36. Notifications integration

Design 015 can generate or consume notification events such as:

**Meeting starting soon**
**Follow-up due**
**Follow-up overdue**
**Meeting rescheduled**

But canonical Notifications remain a separate system.

This eventually connects with Designs 080 and 143.

---

# 37. Activity history

Important business events include:

```text
Meeting scheduled
Meeting rescheduled
Meeting cancelled
Meeting completed
Meeting outcome recorded
Follow-up created
Follow-up reassigned
Follow-up completed
Follow-up cancelled
```

These contribute to relevant:

**Lead activity**
**Contact activity**
**Deal activity**

without copying the full Meeting/Follow-up record into every domain.

---

# 38. Activity ≠ source record

A timeline event can say:

> Meeting completed.

But the actual Meeting remains the source record.

Correct:

```text
Meeting
   ↓
Activity Event
```

not:

```text
Activity Event becomes only stored Meeting data
```

This pattern should later be reused across the product.

---

# 39. Reusable component mapping

Design 015 introduces or formalizes:

`ActionSchedulingWorkspace`
`MeetingList`
`MeetingCard`
`FollowUpList`
`FollowUpCard`
`DueDateBadge`
`PriorityBadge`
`MeetingStatusBadge`
`MeetingOutcomeBadge`
`AssigneeControl`
`ScheduleMeetingDialog`
`FollowUpForm`
`OutcomeCaptureForm`
`CalendarSyncIndicator`
`NextActionSummary`
`QuickCompleteAction`

Shared components reuse:

`PageHeader`
`FilterBar`
`SearchInput`
`Tabs`
`DataTable`
`Drawer`
`Modal`
`DatePicker`
`TimePicker`
`Avatar`
`EmptyState`
`LoadingState`
`ErrorState`

---

# 40. New reusable family

Architecture now gains:

```text
Action & Scheduling Workspace Family
        │
        └── 015 Meetings & Follow-ups
```

Later screens such as:

**Design 094 — Meeting Detail / Meeting Outcome Workspace**
**Design 095 — Follow-up Queue / Follow-up Detail Workspace**

must reuse this canonical Meeting/Follow-up domain.

They must not create new Meeting or Follow-up models.

---

# 41. Important overlap flag: Designs 015, 094 and 095

This is now formally flagged.

### Design 015

Cross-record overview / operational queue.

### Design 094

Detailed one-Meeting workspace.

### Design 095

Detailed Follow-up queue/workspace.

Expected architecture:

```text
Canonical Meeting Service
    ├── Design 015
    └── Design 094

Canonical FollowUp Service
    ├── Design 015
    └── Design 095
```

### Audit decision

**SHARED DOMAIN + COMPONENTS — KEEP APPROVED SCREENS SEPARATE UNTIL LATER AUDITS.**

---

# 42. Relationship to Project Tasks

Later Design 111 contains project tasks/milestones.

Shared infrastructure may include:

**Assignee**
**Priority**
**Due Date**
**Status controls**

But:

```text
Sales FollowUp Service
≠
Project Workflow/Task Service
```

unless Phase 3D deliberately defines a shared generic action foundation with domain-specific layers.

Do not accidentally make project-task workflow rules govern CRM Follow-ups.

---

# 43. Relationship to Design 079 — Global Search

Meetings and Follow-ups should eventually be searchable as canonical entities where permissions permit.

Search result should deep-link to:

* Meeting Detail,
* Follow-up Detail,
* related Lead/Deal.

But search indexing must respect user/tenant permissions.

---

# 44. Permission architecture

Potential capabilities later include:

```text
meeting.read
meeting.create
meeting.edit
meeting.reschedule
meeting.cancel
meeting.complete
meeting.record_outcome

followup.read
followup.create
followup.edit
followup.assign
followup.complete
followup.cancel
```

Exact names belong to Phase 3D.

Important separation:

```text
VIEW
≠
RESCHEDULE
≠
CANCEL
```

and:

```text
VIEW FOLLOW-UP
≠
REASSIGN FOLLOW-UP
```

---

# 45. Scope architecture

Possible visibility:

### Sales Rep

Typically:

**own Meetings**
**own Follow-ups**
**Meetings related to permitted Leads/Deals**

### Sales Manager

May see team Meetings and Follow-ups.

### Executive/Admin

May have broader authorized access.

### Other departments

Should not automatically see Sales meeting details unless business access requires it.

Scope enforcement belongs server-side.

---

# 46. Privacy of meeting notes

Meeting notes/outcomes may contain commercially sensitive information.

The architecture should support different data sensitivity from basic Meeting metadata.

For example, a user may be able to see:

**Meeting scheduled Aug 25**

without necessarily reading:

**private negotiation notes**

if permission policy later requires such distinction.

---

# 47. Bulk actions

Follow-up queues may support:

**Assign**
**Reschedule Due Date**
**Complete**
**Change Priority**

Bulk operations should use canonical server-side services.

A large reassignment should not create hundreds of uncontrolled frontend mutations.

---

# 48. Concurrency

Example:

```text
User A opens Follow-up
User B completes it
User A tries to reschedule it
```

The system should not silently reopen or overwrite the completed record.

Likewise:

```text
User A reschedules Meeting
User B cancels Meeting
```

significant state transitions require concurrency protection.

---

# 49. Idempotency

External calendar synchronization can deliver repeated events/webhooks.

Repeated provider event:

```text
event.updated
event.updated
```

should not create duplicate Meetings or duplicate activity events.

Likewise repeated Meeting creation retries must be handled safely where external calendar creation is involved.

---

# 50. Scheduling conflict support

The architecture should be capable of checking availability where required.

Conceptually:

```text
Proposed Meeting Time
      ↓
Availability Service
      ↓
Organizer / relevant calendars
      ↓
Conflict result
```

This should be centralized rather than independently reimplemented by every Meeting creation surface.

The audit does not add a separate availability page.

---

# 51. Calendar provider abstraction

Correct:

```text
Meeting Service
      ↓
Calendar Integration Service
      ↓
┌──────────────┬──────────────┐
Google         Microsoft
└──────────────┴──────────────┘
```

Design 015 should not contain provider-specific business rules.

---

# 52. Responsive contract — Desktop

Desktop should preserve a high-productivity overview with:

**summary cards → tabs/filters → Meetings list → Follow-ups list/queue → contextual actions**

The exact approved layout remains unchanged.

---

# 53. Responsive contract — Tablet

Following Design 152:

* calendar/time controls become touch-safe,
* lists reduce to priority columns,
* meeting/follow-up details can use overlays,
* filters collapse,
* actions remain accessible without hover.

---

# 54. Responsive contract — Mobile

Following Design 151, prioritize:

**Due / Overdue Follow-ups**
→ **Today's Meetings**
→ **Upcoming Meetings**
→ **Next Actions**

Meeting card:

```text
Contact / Company
Time
Purpose
Status
Join / Open
```

Follow-up card:

```text
Action
Due
Priority
Lead / Deal
Complete
```

Do not compress the full desktop table.

---

# 55. Mobile scheduling

Meeting scheduling on mobile should use native-feeling date/time selection and a single-column flow.

Critical information:

**date**
**start/end**
**timezone**
**participants**
**meeting method**
**related record**

must remain understandable.

---

# 56. State coverage

Design 015 inherits Design 150 plus scheduling-specific states:

**No Meetings Yet**
**No Follow-ups**
**Nothing Due Today**
**No Overdue Follow-ups**
**Meeting Scheduled**
**Meeting Rescheduled**
**Meeting Cancelled**
**Meeting Completed**
**Meeting No-show**
**Follow-up Due**
**Follow-up Overdue**
**Follow-up Completed**
**Calendar Syncing**
**Calendar Sync Failed**
**Calendar Disconnected**
**Scheduling Conflict**
**Permission Restricted**
**Partial Service Failure**

These states must remain semantically distinct.

---

# 57. Positive empty state

Examples:

> **No overdue follow-ups — you're up to date.**

is positive.

Versus:

> **Follow-up data unavailable.**

is an error.

Similarly:

> **No meetings today**

is not the same as:

> **Calendar synchronization failed.**

Design 150 patterns should preserve this distinction.

---

# 58. Partial-failure behavior

Example:

```text
Platform Meetings       ✓
Follow-ups              ✓
Google Calendar Sync    ✕
```

Design 015 should remain functional using canonical platform records.

The Calendar integration problem should be visible without taking down the entire workspace.

---

# 59. Backend architecture

Recommended conceptual structure:

```text
Meetings & Follow-ups UI
           ↓
Query / Command Layer
           ↓
Tenant + Permission Scope
           │
           ├── Meeting Domain Service
           │     ├── Schedule
           │     ├── Reschedule
           │     ├── Cancel
           │     ├── Complete
           │     └── Record Outcome
           │
           └── FollowUp Domain Service
                 ├── Create
                 ├── Assign
                 ├── Reschedule
                 ├── Complete
                 └── Cancel
           ↓
Activity / Next Action
           ↓
CRM / Deal Context
```

Calendar infrastructure remains separate:

```text
Meeting Domain
      ↓
Calendar Sync Service
      ↓
Provider Adapter
      ↓
Google / Microsoft
```

---

# 60. Backend requirements

| Requirement                          | Status                            |
| ------------------------------------ | --------------------------------- |
| Authentication                       | **Required**                      |
| Tenant isolation                     | **Critical**                      |
| Meeting/Follow-up RBAC               | **Critical**                      |
| Canonical Meeting entity             | **Critical**                      |
| Canonical FollowUp entity            | **Critical**                      |
| Meeting outcome model                | **Required**                      |
| Typed CRM/Deal relationships         | **Critical**                      |
| Assignment history                   | **Required**                      |
| Timezone-safe scheduling             | **Critical**                      |
| Calendar-provider abstraction        | **Critical**                      |
| Calendar sync state                  | **Required**                      |
| Idempotent provider processing       | **Critical**                      |
| Availability/conflict service        | Required where scheduling uses it |
| Concurrency protection               | **Required**                      |
| Activity history                     | **Required**                      |
| Next Action resolver                 | **High priority**                 |
| Server-side search/filter            | **Required**                      |
| Partial integration failure handling | **Required**                      |

---

# 61. Canonical metric contract

Definitions that must eventually be centralized include:

**Meetings Scheduled**
**Meetings Completed**
**Meetings Cancelled**
**No-show Rate**
**Meetings Generated from Outreach**
**Follow-ups Due**
**Follow-ups Overdue**
**Follow-ups Completed**
**Average Response / Follow-up Time**

These metrics may appear in:

**Design 004 — Sales Dashboard**
**Design 012 — Outreach Hub**
**Design 015 — Meetings & Follow-ups**
**Design 094/095 detailed workspaces**
**Design 135 — Analytics**
**Reports**

No individual screen should define them independently.

---

# 62. Relationship to Design 004 — Sales Dashboard

Design 004 may summarize:

**Meetings this week**
**Overdue follow-ups**

Design 015 is the canonical operational workspace behind those summaries.

```text
Sales Dashboard
Design 004
     ↓
Meetings & Follow-ups
Design 015
     ↓
Meeting / Follow-up detail
Designs 094 / 095
```

---

# 63. Relationship to Design 014

The handoff is:

```text
Conversation
Design 014
      ↓
Schedule Meeting / Create Follow-up
      ↓
Design 015
```

Conversation context should remain linked rather than duplicated as free-text notes.

---

# 64. Relationship to Deals

Meeting outcome may influence Deal progression.

But:

> **Completing a Meeting should not automatically mutate Deal stage unless canonical workflow rules explicitly require it.**

Safer flow:

```text
Meeting completed
      ↓
Outcome captured
      ↓
Suggested / permitted next Deal action
      ↓
Canonical Deal service
```

This preserves business control.

---

# 65. Relationship to Client Portal

Some Meetings could eventually involve Client users, but Team Workspace Meeting internals must not automatically become Client Portal content.

Internal notes, outcomes and sales strategy remain private unless deliberately exposed.

This is a future visibility boundary, not an additional screen requirement.

---

# 66. Main implementation risks

The audit flags several important risks:

**Meeting/Calendar conflation**
External provider events becoming the business data model.

**Follow-up/Task conflation**
CRM next actions accidentally inheriting unrelated project-task semantics.

**Status overload**
Meeting lifecycle, outcome and calendar sync stored in one field.

**Next-action duplication**
Lead, Deal and Follow-up each storing conflicting “next action” values.

**History loss**
Reschedules/cancellations overwriting prior context.

**Timezone errors**
Ambiguous local scheduling.

**Calendar provider coupling**
Google/Microsoft logic embedded directly in page components.

**Sync failure destroys Meeting**
Canonical platform record depending entirely on external calendar success.

**CRM context loss**
Meeting created without preserving Lead/Conversation/Deal lineage.

**Permission leakage**
Team-wide sensitive meeting notes visible through generic scheduling queries.

**Duplicate provider events**
Repeated sync webhooks creating duplicate records/activity.

**Over-automation**
Meeting outcome silently changing Lead/Deal state without explicit canonical rules.

None require another design.

They require correct domain boundaries.

# Design 015 Audit Verdict

## **PASS — ACTION & SCHEDULING WORKSPACE ANCHOR**

**Template directive:** Design 015 establishes the reusable `ActionSchedulingWorkspaceTemplate`.

**Domain directive:** **Meeting ≠ FollowUp ≠ Task ≠ Calendar Event ≠ Activity Event.**

**Meeting directive:** Platform Meetings remain canonical business records containing CRM/Deal context; external calendars are synchronized representations.

**Follow-up directive:** Follow-ups represent CRM/business next actions and maintain lifecycle, ownership, due date, priority and source context.

**Outcome directive:** Meeting lifecycle and Meeting outcome remain separate dimensions.

**Time directive:** Meeting scheduling must be timezone-aware and preserve rescheduling/cancellation history.

**Next-action directive:** Lead/Deal “Next Action” should derive from canonical actionable records wherever possible rather than duplicated free-text fields.

**Calendar directive:** Google/Microsoft connections operate behind one canonical Calendar Sync Service with provider IDs, sync state, retry and idempotency.

**Integration-resilience directive:** Calendar failure must not erase otherwise valid platform Meetings.

**Permission directive:** Viewing, scheduling, rescheduling, cancellation, outcome capture, Follow-up reassignment and completion require independently enforceable authority.

**Reuse directive:** Designs **015, 094 and 095** must share one canonical Meeting/Follow-up domain and reusable components.

**Consolidation directive:** **STANDARDIZE SCHEDULING/ACTION INFRASTRUCTURE — DO NOT MERGE DESIGN 015 WITH MEETING DETAIL, FOLLOW-UP DETAIL, PROJECT TASKS OR EXTERNAL CALENDAR MANAGEMENT.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                           Count |
| ------------------------------------------ | ------------------------------: |
| **Audited**                                |                    **15 / 153** |
| **PASS**                                   |                          **15** |
| **STANDARDIZE decisions**                  |                          **13** |
| **Potential implementation-overlap flags** |                           **6** |
| **MERGE screen candidates**                | **0 pending later comparisons** |
| **FIX BEFORE CODE**                        |                           **0** |
| **New designs**                            |                           **0** |

### Reusable page families discovered

```text
InternalAppShell
│
├── Dashboard Family
│   └── 003–007
│
├── Data Acquisition Family
│   └── 008–009
│
├── Data Quality / Enrichment Family
│   └── 010
│
├── CRM List Workspace Family
│   └── 011
│
├── Campaign Operations Family
│   └── 012
│
├── Versioned Workflow Builder Family
│   └── 013
│
├── Unified Communication Workspace Family
│   └── 014
│
└── Action & Scheduling Workspace Family
    └── 015
```

The canonical sales workflow is now mapped through the first major human-action checkpoint:

```text
DISCOVER
008
  ↓
EXTRACT
009
  ↓
ENRICH
010
  ↓
CRM LEAD
011
  ↓
CAMPAIGN
012
  ↓
SEQUENCE
013
  ↓
MESSAGE / REPLY
014
  ↓
MEETING / FOLLOW-UP
015
  ↓
COMMERCIAL OPPORTUNITY / DEAL
```

## Next Sequential Audit Target

# **Phase 3A.1 — Design 016 Audit**

For Design 016, we should again retrieve its **exact frozen identity from the approved 153-design inventory first**, and only then apply the same audit contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no guessing, no redesign, no extra screen and no sequence change.**

