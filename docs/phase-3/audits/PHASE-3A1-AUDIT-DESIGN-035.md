Confirmed. The frozen identity is now authoritative:

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 035 — Calendar / Scheduling Workspace

Design 035 should become the **canonical cross-domain scheduling and time-based coordination surface for the Team Workspace**.

Its most important architectural responsibility is to avoid turning everything displayed on a calendar into the same database entity. Meetings, Task due dates, Project milestones, Podcast recordings, Video shoots, Event sessions, approval deadlines, and Publication schedules can all appear on one calendar while remaining owned by their original domains.

---

## 1. Classification

| Audit field                       | Classification                                                                                                                                      |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                     | **035**                                                                                                                                             |
| **Canonical name**                | **Calendar / Scheduling Workspace**                                                                                                                 |
| **Product area**                  | Calendar / Scheduling / Productivity / Operations                                                                                                   |
| **User surface**                  | Team Workspace                                                                                                                                      |
| **Screen class**                  | Cross-Domain Schedule Aggregation + Scheduling Operations Workspace                                                                                 |
| **Classification**                | **Unique Anchor — Platform Scheduling & Calendar Family**                                                                                           |
| **Primary purpose**               | Aggregate authorized time-based work across the platform and provide controlled scheduling/rescheduling for entities whose source domains permit it |
| **Primary scheduling entity**     | **Meeting** for canonical business meetings                                                                                                         |
| **Primary calendar abstraction**  | **ScheduleEntry / CalendarEntry projection**                                                                                                        |
| **Supporting canonical entities** | MeetingParticipant, CalendarConnection, ExternalCalendar, ExternalEventLink, Availability/FreeBusy data, Reminder                                   |
| **Projected source entities**     | Task, FollowUp, Milestone, RecordingSession, Shoot, EventSession/EventOccurrence, ApprovalRequest, PublicationSchedule, Project                     |
| **Parent shell**                  | `InternalAppShell` — Design 001                                                                                                                     |
| **Template family**               | `CalendarSchedulingWorkspaceTemplate`                                                                                                               |
| **Composition**                   | `CalendarSchedulingComposition`                                                                                                                     |
| **Auth**                          | Required                                                                                                                                            |
| **Permissions**                   | Calendar/schedule view + source-specific scheduling permissions                                                                                     |
| **Implementation priority**       | **Core / Critical**                                                                                                                                 |
| **Reuse level**                   | **Platform-wide / Maximum**                                                                                                                         |

The first governing rule is:

> **One Calendar experience does not mean one Calendar entity for every type of scheduled work.**

---

# 2. Calendar is primarily an aggregation surface

Design 035 can display items coming from many domains:

```text
Meetings
Tasks / Due Dates
FollowUps
Project Milestones
Podcast Recordings
Video Shoots
Event Sessions
Approval Deadlines
Publication Schedules
```

But the correct architecture is:

```text
Meeting ───────────────┐
Task ──────────────────┤
FollowUp ──────────────┤
Milestone ─────────────┤
RecordingSession ──────┤
Shoot ─────────────────┤
EventSession ──────────┤
ApprovalRequest ───────┤
PublicationSchedule ───┘
          ↓
   Schedule Projection
          ↓
Design 035 Calendar
```

Not:

```text
everything
↓
CalendarEvent table
```

---

# 3. ScheduleEntry should normally be a read-model abstraction

A reusable projection can conceptually look like:

```text
ScheduleEntry
├── sourceType
├── sourceId
├── title
├── startAt
├── endAt
├── timezone
├── allDay
├── owner/assignee
├── context
├── display category
├── scheduling capability
└── permission-aware actions
```

This allows one Calendar UI without destroying domain boundaries.

---

# 4. CalendarEntry ≠ canonical source record

Example:

```text
Calendar:
"Final Proof Due — Aug 25"
```

may come from:

```text
Task.dueAt
```

or:

```text
Milestone.targetDate
```

The Calendar representation is not a second authoritative Task or Milestone.

---

# 5. Meeting remains a canonical entity

Design 015 already established the Meeting domain.

Therefore:

```text
Meeting
├── start
├── end
├── participants
├── organizer
├── business context
├── meeting status
├── outcome
└── calendar sync
```

Design 035 should consume this same Meeting infrastructure.

It must **not** create another `CalendarMeeting` record.

---

# 6. Meeting ≠ external calendar event

This distinction remains critical.

```text
Canonical Meeting
       ↓
Calendar Sync
       ↓
Google / Outlook Event
```

The external event is a synchronized provider representation.

The business Meeting remains canonical inside the platform.

---

# 7. External provider event may exist without internal Meeting

Connected calendars may contain:

* personal meetings,
* external invitations,
* busy blocks,
* unrelated appointments.

Those should not automatically become CRM/Project `Meeting` records.

Conceptually:

```text
External Calendar Event
        ↓
Calendar Projection
```

unless the user deliberately links/imports it into a business context.

---

# 8. External event ≠ CRM activity automatically

A user's:

> Dentist — 4 PM

must not appear in a Client activity timeline merely because their Google Calendar is connected.

Business-context linking must be explicit.

---

# 9. CalendarConnection

A canonical connection abstraction should conceptually include:

```text
CalendarConnection
├── user/workspace
├── provider
├── account identity
├── authorization state
├── sync state
├── sync cursor/checkpoint
└── health
```

Provider secrets/tokens remain protected server-side.

---

# 10. ExternalCalendar ≠ CalendarConnection

One connected Google account can expose:

```text
Primary Calendar
Leadership Team
Personal
Company Events
```

Therefore:

```text
CalendarConnection
      ↓
ExternalCalendar(s)
```

should remain separate where multiple calendars are supported.

---

# 11. My / Team / Department / Company calendars are scopes

If Design 035 exposes these calendar perspectives, they should generally represent:

```text
query scope
+
visibility policy
+
calendar selection
```

not four independent scheduling databases.

Correct:

```text
Calendar Query
├── Mine
├── Team
├── Department
└── Organization
```

over authorized underlying records.

---

# 12. Calendar selection ≠ permission

A user hiding:

> Company Events

from their current view does not revoke their access.

Similarly, selecting a calendar cannot grant access to events they are unauthorized to see.

UI selection is presentation preference.

Authorization remains backend policy.

---

# 13. Private/busy calendar information

Connected calendar data can contain sensitive information.

A team availability view may need to reveal only:

```text
BUSY
```

rather than:

> Medical appointment with Dr. X

depending on privacy/provider settings.

Therefore:

> **Free/busy access ≠ full event-detail access.**

---

# 14. Task due date ≠ calendar event

Design 034 owns Tasks.

Correct:

```text
Task
   ↓
dueAt
   ↓
Calendar projection
```

Moving that Task on the Calendar must invoke:

```text
changeTaskDueDate()
```

not mutate an independent calendar event.

---

# 15. Follow-up due date ≠ Task due date

Design 015 owns FollowUps.

Calendar can show both:

```text
Task Due
FollowUp Due
```

but changes route back to different domain services.

---

# 16. Milestone ≠ Task ≠ Meeting

A Project Milestone can appear at:

```text
Aug 31
Final Publication Ready
```

while individual Tasks and Meetings contribute to it.

The Calendar aggregates these.

It must not collapse them into one type.

---

# 17. Podcast recording ≠ Meeting

Design 026 established:

```text
Meeting / Calendar booking
      ↓
RecordingSession
```

The Calendar can show both scheduling context and recording context.

But RecordingSession remains Podcast-domain truth.

---

# 18. Video shoot ≠ Meeting

Likewise:

```text
Calendar booking
      ↓
Shoot
```

Design 027 owns the actual production session.

Design 035 displays/schedules it but does not absorb the Video production model.

---

# 19. Event Session ≠ generic Calendar Meeting

Design 028 established:

```text
EventSession
≠
Meeting
```

Calendar can project Event Sessions by:

* planned start,
* planned end,
* venue/room.

Actual Event execution remains in the Event domain.

---

# 20. PublicationSchedule is particularly important

Design 031 already established a canonical release schedule.

Correct:

```text
Publication
    ↓
PublicationSchedule
    ↓
Design 035 Calendar projection
```

Design 035 must **never create a competing publication scheduler**.

---

# 21. Moving a Publication on Calendar is a Publishing command

If authorized:

```text
drag scheduled Publication
Aug 25 → Aug 27
```

should invoke:

```text
reschedulePublication()
```

through the Publishing domain.

It should not directly change a generic `calendar_events.start`.

---

# 22. Same principle applies everywhere

Calendar actions should route to source-domain commands:

```text
Meeting
→ rescheduleMeeting()

Task
→ changeTaskDueDate()

FollowUp
→ rescheduleFollowUp()

Publication
→ reschedulePublication()

Event Session
→ updateEventSessionSchedule()

Video Shoot
→ rescheduleShoot()
```

This is one of Design 035's most important implementation requirements.

---

# 23. Day / Week / Month / Agenda are presentations

These views should share one canonical schedule query architecture.

```text
Schedule Query
      ↓
├── Day
├── Week
├── Month
└── Agenda
```

Do not create separate APIs/business logic for each view.

---

# 24. View-specific query optimization is still allowed

Month view may need:

* compact summaries,
* counts,
* lightweight context.

Day view may need:

* detailed timing,
* attendees,
* conflicts.

They can have optimized projections while sharing the same source truth.

---

# 25. Time range queries are essential

The Calendar should request only the relevant interval.

Example:

```text
rangeStart
rangeEnd
timezone
scope
selected calendars
filters
```

Do not load every historical Task/Meeting/Publication into the browser.

---

# 26. Timezone is a first-class requirement

The platform may involve international Clients, speakers, executives, and team members.

Canonical storage should use absolute timestamps appropriately, with timezone context where needed.

Never persist ambiguous:

```text
3:00 PM
```

without enough date/timezone information.

---

# 27. User display timezone ≠ Event timezone

Example:

```text
Podcast recording:
3 PM New York

User viewing from India:
12:30 AM IST
```

Both representations may be useful.

The system should know the canonical source timezone and the viewer display timezone.

---

# 28. DST must be handled by timezone-aware libraries

Recurring and scheduled events across daylight-saving boundaries are especially dangerous.

Do not implement offsets manually as:

```text
UTC - 5
```

because offsets change seasonally.

Use proper IANA timezone identifiers where appropriate.

---

# 29. All-day date ≠ midnight timestamp automatically

An all-day milestone such as:

> Contract renewal date — Sep 1

has different semantics from:

> Meeting at 00:00.

The data model should preserve all-day/date semantics instead of blindly converting everything into midnight events.

---

# 30. Availability / free-busy

Scheduling meetings may require a canonical service that asks:

```text
When are these participants free?
```

Conceptually:

```text
AvailabilityQueryService
     ↓
Internal schedule
+
Connected provider free/busy
     ↓
available windows
```

The exact algorithm belongs to Phase 3D.

---

# 31. Availability ≠ appointment creation

Finding:

```text
Tuesday 2–3 PM available
```

does not reserve that slot.

The Meeting creation transaction must still re-check current availability where required.

---

# 32. Conflict ≠ invalid automatically

Some overlaps are legitimate.

Example:

```text
Task deadline
+
Meeting
```

is not necessarily a scheduling conflict.

Even two meetings may overlap intentionally for some users.

Therefore conflict detection should distinguish:

* warning,
* hard constraint,
* informational overlap.

Exact rules belong to Phase 3D.

---

# 33. Resource conflicts may matter

Event rooms, recording studios, equipment, or team resources may eventually introduce conflict checks.

Where already supported by source domains:

```text
resource availability
```

can feed scheduling validation.

Do not turn Calendar into the resource-management source of truth.

---

# 34. Recurrence

Recurring schedule items need safe semantics.

For external/calendar-native events:

```text
RecurrenceRule
      ↓
instances / exceptions
```

where applicable.

Editing:

> this occurrence

must differ from:

> this and future occurrences

or:

> entire series

if those options exist.

---

# 35. Recurring Meeting ≠ repeated copy of same Meeting record

A recurring series requires predictable history.

Conceptually:

```text
MeetingSeries
    ↓
MeetingOccurrence(s)
```

or another normalized recurrence model.

Exact schema belongs to Phase 3D.

---

# 36. Recurring Task ≠ recurring Meeting

Design 034's recurring Tasks, if supported, generate Task instances.

Calendar recurrence for Meetings uses scheduling semantics.

Do not force both through one generic recurrence implementation without preserving source meaning.

---

# 37. Reschedule history

A Meeting changing:

```text
Aug 12, 10:00
↓
Aug 12, 15:00
```

should preserve meaningful rescheduling history.

This can affect:

* participants,
* reminders,
* external calendar synchronization,
* activity.

---

# 38. Cancel ≠ delete

Cancelled Meetings should preserve:

* original time,
* attendees,
* business context,
* reason/history,
* provider state.

Deletion should not be used to represent cancellation.

---

# 39. Meeting lifecycle ≠ calendar sync health

Example:

```text
Meeting:
SCHEDULED

Google Calendar Sync:
FAILED
```

is valid.

Do not change the business Meeting to `FAILED` merely because provider synchronization failed.

---

# 40. Sync status should be separate

Conceptually:

```text
CalendarSyncState
├── synced
├── pending
├── failed
├── conflict
└── disconnected
```

Exact values later.

These are integration conditions, not Meeting lifecycle.

---

# 41. Provider sync architecture

A safe direction is:

```text
Canonical Meeting
      ↓
Calendar Sync Service
      ↓
Provider Adapter
      ↓
Google / Microsoft
```

and inbound:

```text
Provider webhook/sync
      ↓
Provider Adapter
      ↓
dedupe + correlation
      ↓
Canonical reconciliation
```

---

# 42. Sync loops must be prevented

Dangerous:

```text
internal update
→ Google update
→ webhook
→ interpreted as external update
→ internal update
→ Google update
→ ...
```

The sync layer needs provider revision IDs/origin markers/checkpoints or equivalent loop-prevention logic.

---

# 43. Provider webhook idempotency

The same event can arrive multiple times.

Processing must not create:

* duplicate Meetings,
* duplicate attendees,
* duplicate activity,
* repeated reminders.

Webhook/event processing needs idempotency.

---

# 44. Provider cursor/checkpoint

Efficient synchronization should preserve:

```text
sync cursor / delta token
last successful sync
```

where the provider supports it.

Do not full-download entire calendars every few minutes.

---

# 45. External deletion

If a synced external event is deleted:

the reconciliation policy must determine whether:

* canonical Meeting is cancelled,
* sync link is removed,
* user review is required.

Do not silently delete the business Meeting.

---

# 46. External update conflict

Example:

```text
Internal user:
moves Meeting to 2 PM

At same time external organizer:
moves provider event to 4 PM
```

The sync service needs explicit conflict/reconciliation behavior.

Last-write-wins without domain awareness can be dangerous.

---

# 47. Attendee ≠ Contact necessarily

A Meeting attendee can be:

* internal User,
* canonical Contact,
* external email participant.

Conceptually:

```text
MeetingParticipant
├── participant type
├── identity reference
├── email snapshot
├── role
└── response state
```

This follows Design 015.

---

# 48. Invitation response ≠ Meeting status

Example:

```text
Meeting:
SCHEDULED

Client participant:
DECLINED
```

The Meeting still exists.

Participant RSVP states remain separate.

---

# 49. Organizer ≠ owner

The person responsible for the business relationship may not be the technical calendar organizer.

Keep:

```text
Meeting owner
Calendar organizer
```

distinguishable where relevant.

---

# 50. Reminder ≠ Notification

A Reminder is a scheduling rule/context.

The actual alert delivery belongs to the shared Notification system.

Conceptually:

```text
Reminder
   ↓
Notification Service
   ↓
in-app / email / supported channel
```

No Calendar-only notification engine.

---

# 51. Reminder delivery failure ≠ Meeting failure

If reminder email fails:

```text
Meeting remains scheduled
```

The notification gets its own failure/retry state.

---

# 52. Calendar Workspace ≠ Notification Center

Design 080 later owns Notifications.

Correct:

```text
Calendar Item
    ↓
Reminder event
    ↓
Notification
    ↓
Design 080
```

Do not merge.

---

# 53. Relationship to Design 015

Design 015:

**Meetings & Follow-ups**

Design 035:

**Cross-domain Calendar / Scheduling**

Correct:

```text
Meeting Service
     │
     ├── Design 015
     │   Meeting/follow-up operations
     │
     └── Design 035
         Time-based calendar composition
```

One Meeting domain.

Two different workflows.

---

# 54. Relationship to Design 034

Design 034 owns Tasks.

Design 035 can project:

```text
Task.dueAt
Task.startAt where supported
```

into the Calendar.

Calendar does not own Task lifecycle.

---

# 55. Relationship to Design 026

Podcast Recording Sessions can appear in Calendar.

Scheduling changes must ultimately use Podcast/Meeting services according to ownership.

No separate Podcast calendar database.

---

# 56. Relationship to Design 027

Video Shoots can appear similarly.

Design 035 does not become a Shoot production workspace.

---

# 57. Relationship to Design 028

Event occurrence/session schedules can be rendered here.

Event operational timing remains canonical in Event domain.

---

# 58. Relationship to Design 031

Publication schedules are a particularly strong reuse point.

Design 035 can show publication dates across content products.

But actual release scheduling remains:

```text
Publishing Service
```

---

# 59. Relationship to Design 126

Later frozen roadmap includes:

**Design 126 — Publishing Calendar / Release Schedule**

This becomes a major overlap checkpoint.

Expected architecture:

```text
PublicationSchedule
      │
      ├── Design 035
      │   broad organizational Calendar
      │
      └── Design 126
          publishing-specialized Calendar
```

One scheduling source.

**DO NOT MERGE THE SCREENS YET.**

---

# 60. Calendar 035 vs Publishing Calendar 126

Design 035 answers:

> What is happening across my/team/company schedule?

Design 126 should answer:

> How is the content release calendar specifically organized?

That specialization is legitimate.

The backend scheduler must still be shared.

---

# 61. Relationship to My Work — Design 078

My Work may display:

* Tasks due today,
* Meetings today,
* FollowUps,
* Approvals.

It should consume canonical source records.

Design 035 and Design 078 may share:

```text
Unified Work/Schedule Read Model
```

without sharing one giant persisted WorkItem entity.

---

# 62. Calendar search

Search/filtering can operate over:

* title,
* participant,
* Client,
* Project,
* type,
* owner,
* department,
* date range.

But the query must remain permission scoped.

A private calendar event title can itself reveal sensitive information.

---

# 63. Server-side range queries

A conceptual service:

```text
ScheduleQueryService.getRange({
  from,
  to,
  timezone,
  scopes,
  calendars,
  types,
  filters
})
```

can compose authorized entries efficiently.

---

# 64. Schedule data federation

The service may query/federate from several domains.

For scale, Phase 3D can choose:

* runtime composition,
* indexed schedule projection,
* event-driven materialized read model.

But if a projection is used:

> **Projection ≠ source of truth.**

---

# 65. Materialized schedule projection

At larger scale:

```text
Domain Events
     ↓
Schedule Projection
     ↓
Calendar Query
```

can avoid expensive joins across many services.

Example:

```text
TaskDueDateChanged
→ update Task schedule projection
```

But mutation always routes back to Task Service.

---

# 66. Stale projection behavior

If the Calendar projection lags briefly:

the source record remains authoritative.

High-impact changes such as rescheduling should validate against fresh source state before commit.

---

# 67. Permissions architecture

Potential Phase 3D capabilities include:

```text
calendar.read
calendar.team_read
calendar.organization_read

meeting.create
meeting.edit
meeting.reschedule
meeting.cancel

availability.read
calendar_connection.manage
```

plus source-domain permissions.

Exact names come later.

---

# 68. Calendar visibility ≠ source mutation permission

A user can potentially view:

```text
Company Publication — Friday
```

without being authorized to reschedule it.

Therefore:

```text
SEE ON CALENDAR
≠
EDIT SOURCE
```

The Calendar must derive action availability per entry.

---

# 69. Team calendar visibility

Managers may be allowed to see team scheduling information.

That does not necessarily grant full access to:

* Meeting notes,
* Client details,
* private external events.

Read models should provide appropriate summaries.

---

# 70. Sensitive event redaction

A user may see:

```text
Emma — Busy 2:00–3:00 PM
```

without receiving the private external event title or attendees.

This should be backend-enforced.

---

# 71. Connection management permission

A user who can schedule a Meeting should not automatically manage:

* workspace-wide Google OAuth,
* Microsoft connection credentials,
* shared corporate calendars.

Designs 139–140 later own broader Integration administration.

---

# 72. Drag-and-drop

Moving events is a high-value interaction.

For every draggable entry:

```text
drag
 ↓
identify source domain
 ↓
permission check
 ↓
validate schedule
 ↓
invoke source command
 ↓
persist
 ↓
refresh projection
```

No frontend-only mutation.

---

# 73. Drag-and-drop must have accessible alternatives

Because Design 153 requires accessible component behavior:

every reschedule should also be possible through:

* keyboard/menu action,
* date/time editor,
* accessible dialog.

Calendar usability cannot depend on a mouse.

---

# 74. Concurrency

Example:

```text
User A moves Meeting to 3 PM
User B simultaneously cancels Meeting
```

The backend must evaluate the latest source revision.

Another:

```text
User A reschedules Publication
Scheduler worker simultaneously begins release
```

Publishing's atomic transition rules must decide the result.

---

# 75. Availability race

A 4 PM slot may appear free.

Before creation:

```text
another Meeting is scheduled
```

Therefore Meeting creation should re-check current conflict policy at commit time when required.

---

# 76. Partial service failure

Example:

```text
Meetings            ✓
Tasks               ✓
Publication Schedule ✓
Google Calendar     ✕
Event Sessions       ✓
```

The Calendar should remain usable with internal entries.

External-calendar regions show degraded sync state.

---

# 77. Provider outage must not erase internal schedule

If Google/Outlook is unavailable:

canonical Meetings and internal schedules remain intact.

Never render:

> No Meetings

because the provider API failed.

---

# 78. Unknown ≠ free

This is particularly important for availability.

If an external calendar cannot be queried:

do not assume:

```text
AVAILABLE
```

The state is:

```text
AVAILABILITY UNKNOWN
```

unless enough authoritative internal information exists.

---

# 79. Unknown ≠ no events

Likewise:

> Nothing scheduled.

should only appear if all relevant sources queried successfully and genuinely returned none.

Partial failure requires a partial/degraded state.

---

# 80. State coverage

Design 035 inherits Design 150 plus scheduling-specific states such as:

```text
Calendar Loading
No Scheduled Items
No Results After Filters

Meeting Scheduled
Meeting Rescheduled
Meeting Cancelled

Due Today
Upcoming
Past

Schedule Conflict
Availability Unknown
Participant Declined

Sync Pending
Synced
Sync Failed
External Change Detected
Connection Expired
External Calendar Unavailable

Scheduling
Rescheduling
Scheduling Failed

Permission Restricted
Private Event / Busy Only
Source Record Unavailable
Record Updated Elsewhere
Partial Service Failure
```

These are not all one persisted Calendar status.

---

# 81. Responsive — Desktop

Desktop should preserve the rich scheduling experience:

```text
Calendar Header
↓
Date Navigation
↓
Day / Week / Month / Agenda
↓
Calendar / Scope Selection
↓
Main Timeline/Grid
↓
Selected Entry Detail
↓
Participants / Project / Tasks / Files
↓
Allowed Scheduling Actions
```

This is the ideal surface for dense schedule management.

---

# 82. Responsive — Tablet

Following Design 152:

* Week/Day remain usable,
* Month cells become more compact,
* details move to a drawer,
* calendar filters become sheets,
* touch targets increase,
* drag operations get explicit alternatives.

Tablet can be especially useful for Event and production teams.

---

# 83. Responsive — Mobile

Following Design 151, prioritize:

```text
Today
↓
Next Scheduled Item
↓
Agenda List
↓
Date Navigation
↓
Open Schedule Item
↓
Time / Participants / Context
↓
Conflict / Availability
↓
Allowed Actions
```

Agenda/Day becomes more important than attempting to squeeze a seven-column desktop Week grid onto the phone.

---

# 84. Mobile scheduling

Mobile should support:

* create Meeting,
* reschedule,
* cancel,
* inspect attendees,
* open related Project,
* view Task deadline,
* join/open linked meeting where available.

Complex team-wide scheduling may remain desktop/tablet optimized.

---

# 85. Performance

Month/Week views can involve many entries.

Implementation should support:

* range queries,
* pagination/virtualization for agenda lists,
* lightweight event projections,
* lazy detail loading,
* caching with permission safety.

Do not load complete Project/Client records for every calendar cell.

---

# 86. Read model

A useful composed model:

```text
CalendarSchedulingView
├── selected range
├── viewer timezone
├── calendar/scope selections
├── ScheduleEntry projections
├── availability summaries
├── connection health
├── conflict indicators
├── permission-aware actions
└── selected-entry detail
```

This is a read composition.

---

# 87. Do not PATCH CalendarSchedulingView

Avoid:

```text
PATCH /calendar
{
  taskDueDate: "...",
  meetingDate: "...",
  publicationDate: "...",
  shootDate: "..."
}
```

Use source commands:

```text
createMeeting()
rescheduleMeeting()
cancelMeeting()

changeTaskDueDate()
rescheduleFollowUp()

rescheduleRecordingSession()
rescheduleShoot()
updateEventSessionSchedule()

reschedulePublication()
```

The Calendar orchestrates commands—it does not own their business state.

---

# 88. Backend architecture

```text
Calendar / Scheduling UI
          ↓
ScheduleQueryService
          ↓
Tenant + Permission Scope
          ↓
Unified Schedule Projection
          │
          ├── Meetings
          ├── Tasks
          ├── FollowUps
          ├── Milestones
          ├── Recording Sessions
          ├── Video Shoots
          ├── Event Sessions
          ├── Approval Deadlines
          └── Publication Schedules
          │
          ├── Meeting Service
          ├── Availability Service
          ├── Task Service
          ├── Project/Workflow Service
          ├── Product Domain Services
          ├── Publishing Service
          ├── Calendar Sync Service
          ├── Provider Adapters
          └── Notification Service
```

---

# 89. Backend requirements

| Requirement                              | Status                                       |
| ---------------------------------------- | -------------------------------------------- |
| Authentication                           | **Required**                                 |
| Tenant isolation                         | **Critical**                                 |
| Calendar/schedule RBAC                   | **Critical**                                 |
| Unified Schedule projection              | **Critical**                                 |
| Canonical Meeting integration            | **Critical**                                 |
| Task due-date integration                | **Critical**                                 |
| FollowUp integration                     | **Required**                                 |
| Milestone integration                    | **Required**                                 |
| Podcast Recording integration            | **Required**                                 |
| Video Shoot integration                  | **Required**                                 |
| Event Session integration                | **Required**                                 |
| Approval-deadline integration            | **Required**                                 |
| PublicationSchedule integration          | **Critical**                                 |
| Timezone-safe timestamps                 | **Critical**                                 |
| All-day/date semantics                   | **Required**                                 |
| DST-safe scheduling                      | **Critical**                                 |
| Availability/free-busy service           | **Critical for scheduling**                  |
| Conflict detection                       | **Required**                                 |
| Recurrence architecture                  | **Required where recurrence supported**      |
| External Calendar connection abstraction | **Critical**                                 |
| Provider adapter layer                   | **Critical**                                 |
| ExternalCalendar mapping                 | **Required**                                 |
| External event link/correlation          | **Critical**                                 |
| Sync cursor/checkpoint                   | **Required**                                 |
| Idempotent webhooks/sync                 | **Critical**                                 |
| Sync-loop prevention                     | **Critical**                                 |
| Privacy/free-busy redaction              | **Critical**                                 |
| Source-domain command routing            | **Critical**                                 |
| Backend reminder integration             | **Required**                                 |
| Notification integration                 | **Required**                                 |
| Concurrency protection                   | **Critical**                                 |
| Partial provider failure                 | **Critical**                                 |
| Activity history                         | **Required**                                 |
| Audit history                            | **Required for high-value schedule changes** |

---

# 90. Canonical scheduling metrics

Metrics that may later appear include:

**Meetings Today**
**Meetings This Week**
**Upcoming Deadlines**
**Overdue Scheduled Work**
**Schedule Conflicts**
**Meeting Completion Rate**
**Meeting Reschedule Rate**
**Publication Deadlines This Week**
**Upcoming Production Sessions**

If productivity metrics are added later, the methodology must avoid simplistic conclusions such as:

> More meetings = more productive.

No decorative workforce-scoring formulas.

---

# 91. Main implementation risks

Design 035 exposes several major risks:

**Everything-as-CalendarEvent architecture**
Tasks, Meetings, Publications and Event Sessions lose their domain semantics.

**Calendar/Meeting conflation**
External calendar items automatically become business Meetings.

**Task/calendar duplication**
Task deadlines copied into independent calendar records.

**Publication scheduler duplication**
Design 035 creates a second release scheduler competing with Design 031/126.

**Event/Meeting conflation**
Event Sessions forced into the Meeting schema.

**Recording/Meeting conflation**
Calendar booking incorrectly represents actual Podcast recording or Video shoot completion.

**Timezone bugs**
Ambiguous local timestamps cause missed international meetings/publications.

**DST bugs**
Recurring meetings drift by an hour.

**All-day/midnight conflation**
Deadlines appear at arbitrary midnight times.

**View/permission conflation**
Selecting Team/Company calendar exposes unauthorized event details.

**Free-busy/detail leakage**
Private external event titles exposed to managers.

**Drag-and-drop direct mutation**
Moving an item changes UI but bypasses source-domain validation.

**Provider/business-status conflation**
Google sync failure marks business Meeting failed.

**Sync loops**
Internal and provider changes continuously rewrite each other.

**Webhook duplication**
Duplicate provider events create duplicate Meetings/activity.

**Availability-unknown/free conflation**
Provider outage interpreted as a free timeslot.

**Calendar outage/empty conflation**
Missing source data shown as “nothing scheduled.”

**035/126 duplicate scheduling infrastructure**
General and Publishing calendars receive separate schedulers.

None requires another design.

These are domain, synchronization and reuse requirements.

---

# Design 035 Audit Verdict

## **PASS — PLATFORM CALENDAR & SCHEDULING ANCHOR**

**Aggregation directive:** Design 035 is a **cross-domain Schedule projection**, not a universal persisted `CalendarEvent` replacement for Tasks, Meetings, FollowUps, Milestones, production sessions, Events, Approvals or Publications.

**Meeting directive:** canonical business Meetings remain owned by the Meeting domain established in Design 015.

**Source-of-truth directive:** every projected item retains its source domain; Calendar mutations invoke that domain's authoritative command.

**Task directive:** Task dates come from Design 034's canonical Task records; Calendar never duplicates Task lifecycle.

**Production directive:** Podcast Recording Sessions, Video Shoots and Event Sessions remain specialized production records while appearing in the unified schedule.

**Publishing directive:** Publication schedules remain owned by Design 031's Publishing domain; Design 035 only provides broad calendar visibility and authorized rescheduling orchestration.

**Timezone directive:** all scheduling uses timezone-aware, DST-safe semantics with explicit handling for all-day dates.

**Availability directive:** free/busy, detailed event access and actual scheduling authority remain separate permission/data concerns.

**Privacy directive:** private connected-calendar events can be projected as Busy without exposing unauthorized titles, participants or descriptions.

**Integration directive:** Google/Microsoft/etc. calendars connect through canonical provider adapters with sync cursors, correlation, idempotency and loop protection.

**Sync directive:** external provider synchronization health remains separate from the lifecycle of canonical Meetings and other business records.

**Recurrence directive:** recurring schedules preserve series/occurrence semantics and must not be implemented as destructive repeated edits.

**Reminder directive:** Calendar reminders use the shared Notification infrastructure rather than creating another notification system.

**Permission directive:** seeing an item on Calendar never automatically grants permission to edit/reschedule its source record.

**Accessibility directive:** all drag/reschedule operations require non-drag keyboard/menu alternatives.

**Reliability directive:** provider/source outages produce partial/unknown states and never false “free” or “nothing scheduled” results.

**Overlap directive:** Designs **015, 034, 035, 078, 094–095 and 126** must ultimately share their relevant Meeting/Task/Schedule foundations without collapsing their distinct business entities.

**Consolidation directive:** **STANDARDIZE ONE PLATFORM-WIDE SCHEDULE PROJECTION + MEETING/CALENDAR SYNC + AVAILABILITY + TIMEZONE + PROVIDER-INTEGRATION INFRASTRUCTURE — DO NOT BUILD SEPARATE CALENDARS OR SCHEDULERS FOR TASKS, PODCAST, VIDEO, EVENTS, PROJECTS OR PUBLISHING.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **35 / 153** |
| **PASS**                                   |                         **35** |
| **STANDARDIZE decisions**                  |                         **33** |
| **Potential implementation-overlap flags** |                         **26** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**35 / 153 = 22.9% audited.**

### Shared productivity architecture after Design 035

```text
                   TEAM WORKSPACE
                         │
            ┌────────────┴────────────┐
            ↓                         ↓
      034 TASK DOMAIN          015 MEETING DOMAIN
            │                         │
            ├──────────┬──────────────┤
                       ↓
             035 SCHEDULE PROJECTION
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
     Tasks          Meetings       FollowUps
     Milestones     Recordings     Video Shoots
     Events         Approvals      Publications
                       │
                       ↓
              Calendar Workspace
        Day / Week / Month / Agenda
```

And the platform-wide shared service layer now contains:

```text
029 → Approval Infrastructure
030 → Asset / File Infrastructure
031 → Publishing Infrastructure
032 → Distribution Infrastructure
033 → Reporting Infrastructure
034 → Task / Work Infrastructure
035 → Calendar / Scheduling Infrastructure
```

# Next Sequential Audit Target

## Phase 3A.1 — Design 036 Audit

For **Design 036**, we should again verify its **exact frozen identity from the approved 153-design inventory before starting the audit**.

We should not infer it from Calendar/Scheduling or assume it is People & Teams, Roles & Permissions, Notifications, My Work, Settings, or another productivity/admin workspace.

Once the frozen identity is confirmed, we continue with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no guessing, no redesign, no additional screen and no sequence change.**

