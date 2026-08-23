Correct. We continue strictly with the frozen **Design 028 — Event Production / Event Operations Workspace**.

This is the fourth major product-specific execution surface under Project 360. Its architecture must support **pre-event planning → event-day operations → post-event delivery** without turning the generic Project, Contact, Company, Task, File, or Publishing models into Event-specific duplicates.

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 028 — Event Production / Event Operations Workspace

| Audit field                    | Classification                                                                                                                                                                           |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                  | **028**                                                                                                                                                                                  |
| **Canonical name**             | **Event Production / Event Operations Workspace**                                                                                                                                        |
| **Product area**               | Events / Production / Operations / Project Delivery                                                                                                                                      |
| **User surface**               | Team Workspace                                                                                                                                                                           |
| **Screen class**               | Product-Specific Production + Live Operations Workspace                                                                                                                                  |
| **Classification**             | **Unique Anchor — Event Operations Workspace Family**                                                                                                                                    |
| **Primary purpose**            | Coordinate one Event engagement from planning and participant confirmation through agenda, venue/logistics, registration, live-day execution, post-event assets and completion/reporting |
| **Primary domain entity**      | **Event**                                                                                                                                                                                |
| **Primary execution entity**   | **EventOccurrence / EventEdition**                                                                                                                                                       |
| **Core child entities**        | EventSession, AgendaItem, EventParticipantAssignment, EventPartnerAssignment, EventRegistration, Attendance/CheckIn, EventRunOfShow, LogisticsRequirement                                |
| **Shared supporting entities** | Project, Client, Company, Contact, User, Task, Milestone, File/Asset, ApprovalRequest, Meeting, Publication, DistributionCampaign, Report, Activity                                      |
| **Parent shell**               | `InternalAppShell` — Design 001                                                                                                                                                          |
| **Parent business record**     | Project — Design 023                                                                                                                                                                     |
| **Template family**            | `ProductExecutionWorkspaceTemplate` + live-operations extensions                                                                                                                         |
| **Composition**                | `EventOperationsComposition`                                                                                                                                                             |
| **Auth**                       | Required                                                                                                                                                                                 |
| **Permissions**                | Project + event + registration + participant + operations + publishing scopes                                                                                                            |
| **Implementation priority**    | **Core / Critical**                                                                                                                                                                      |
| **Reuse level**                | **Extremely High**                                                                                                                                                                       |

---

# 1. Functional responsibility

Design 028 answers:

> **“For this Event, what exactly are we producing, which occurrence is being operated, who is participating, what is scheduled, what remains unconfirmed or blocked, what is happening live, and what must happen after the Event before the Project is actually complete?”**

The execution chain becomes:

```text
PROJECT
Design 023
   ↓
EVENT WORKSTREAM
Design 028
   │
   ├── Event / Edition
   ├── Speakers
   ├── Partners
   ├── Agenda / Sessions
   ├── Venue
   ├── Logistics
   ├── Registrations
   ├── Production Requirements
   ├── Event-Day Operations
   ├── Attendance
   ├── Media / Assets
   └── Post-Event Deliverables
   ↓
PUBLISHING / DISTRIBUTION
   ↓
REPORTING / CLOSEOUT
```

The central domain rule is:

> **Project ≠ Event ≠ EventOccurrence ≠ Session ≠ Registration ≠ Attendance.**

---

# 2. Project ≠ Event

Design 023 remains the generic delivery umbrella.

Design 028 owns Event-specific production and operations.

Correct:

```text
Project
   ↓
Event
```

Avoid turning generic Project into:

```text
project.venue
project.speakerCount
project.registrationCount
project.checkInCount
project.sessionAgenda
project.eventStartTime
```

as the primary Event architecture.

Those belong to the Event domain.

---

# 3. Event ≠ Event occurrence / edition

This distinction is critical.

### Event

The reusable event identity/program.

Example:

**The Perspective Leadership Summit**

### EventOccurrence / EventEdition

One actual occurrence.

```text
The Perspective Leadership Summit
│
├── 2026 Edition
├── 2027 Edition
└── 2028 Edition
```

Each occurrence can have different:

* dates,
* venue,
* speakers,
* partners,
* agenda,
* registrations,
* attendance,
* assets.

Therefore:

> **Do not overwrite the Event master every year with the new occurrence's operational data.**

---

# 4. Event recurrence must preserve history

Incorrect:

```text
event.date = 2027-05-10
event.venue = newVenue
```

when the same Event happened in 2026.

Correct:

```text
Event
├── Occurrence 2026
│   ├── date
│   ├── venue
│   └── participants
└── Occurrence 2027
    ├── date
    ├── venue
    └── participants
```

Historical editions remain reconstructable.

---

# 5. Client ≠ Event organizer ≠ Partner

A Client may commission the Event.

A Partner may support it.

The platform organization may produce it.

These roles must remain distinct.

Example:

```text
Client:
Acme Group

Event Producer:
The Perspective

Event Partner:
Global Leadership Association
```

One Company record can participate in different roles without being duplicated.

---

# 6. Company ≠ EventPartnerAssignment

A canonical Company may partner with many Events.

Correct:

```text
Company
   ↓
EventPartnerAssignment
   ↓
EventOccurrence
```

The assignment can hold Event-specific data such as:

* role/type,
* confirmed status,
* deliverables,
* branding obligations,
* contact person,
* visibility level.

Do not create duplicate Company records for partners.

---

# 7. Contact ≠ Speaker

Similarly:

```text
Contact
   ↓
EventParticipantAssignment
   ↓
EventOccurrence
```

The Contact remains the canonical person.

The Event assignment holds:

* Speaker,
* Moderator,
* Panelist,
* Host,
* VIP,
* Organizer,

or other approved Event role.

---

# 8. Participant assignment needs occurrence context

The same person may be:

```text
2026:
Keynote Speaker

2027:
Panel Moderator
```

Therefore role belongs to the EventOccurrence relationship—not the Contact profile itself.

---

# 9. Speaker confirmation ≠ Event readiness

A confirmed keynote does not mean the Event is operationally ready.

Example:

```text
Speaker:
CONFIRMED

Event Readiness:
BLOCKED

Reason:
Venue production approval missing
```

Participant state and Event readiness must remain separate.

---

# 10. Event lifecycle ≠ occurrence lifecycle

An Event master may remain:

```text
ACTIVE PROGRAM
```

while a specific occurrence is:

```text
PLANNING
LIVE
COMPLETED
CANCELLED
```

Exact enums wait for Phase 3D.

The requirement is simply:

```text
Event lifecycle
≠
Occurrence execution state
```

---

# 11. Occurrence state ≠ health

Example:

```text
Occurrence:
PLANNING

Health:
AT_RISK
```

because:

* keynote unconfirmed,
* venue deadline missed,
* production assets incomplete.

Health is derived operational condition.

---

# 12. Progress ≠ readiness

An Event can be:

```text
Progress:
90%

Event-Day Readiness:
NOT READY
```

because a mandatory safety/venue/production requirement remains unresolved.

The same distinction already established for onboarding, magazine, Podcast and Video remains mandatory.

---

# 13. Event readiness should use explicit gates

Conceptually:

```text
EventReadiness
├── venue confirmed
├── required participants confirmed
├── agenda approved
├── production requirements ready
├── logistics ready
├── registration configuration ready
├── required assets ready
└── critical approvals satisfied
```

Exact rules remain configuration-driven.

A user should not casually toggle:

```text
eventReady = true
```

without gate validation.

---

# 14. Agenda ≠ Session

### Agenda

The ordered composition of Event content.

### Session

One structured program item.

Example:

```text
Agenda
├── 09:00 Registration
├── 10:00 Keynote
├── 11:00 Panel
├── 12:00 Networking
└── 13:00 Workshop
```

The Agenda is the ordered presentation.

Each meaningful Session remains an entity.

---

# 15. Session should be structured

Conceptually:

```text
EventSession
├── occurrenceId
├── title
├── description
├── startAt
├── endAt
├── location/room
├── session type
├── speakers/moderators
├── status
└── production requirements
```

Do not represent the entire agenda only as rich text.

---

# 16. Session ≠ Meeting

A Session is public/program Event content.

A Meeting is a calendar/business interaction.

They may reuse:

* datetime primitives,
* participants,
* timezone handling,

but:

```text
EventSession
≠
Meeting
```

Do not force keynote/panel sessions into the generic Meeting domain.

---

# 17. Agenda ordering must be canonical

Reordering sessions changes Event operations.

Correct:

```text
reorderAgenda()
      ↓
server validation
      ↓
conflict checks
      ↓
persist ordering
```

rather than UI-only drag state.

Potential conflicts include:

* overlapping sessions,
* speaker conflicts,
* venue/room conflicts.

---

# 18. Timezone is critical

All Event scheduling must preserve canonical timestamps and occurrence timezone.

Store authoritative time safely.

Display in relevant timezone.

Do not persist ambiguous:

```text
"10:00 AM"
```

without date/timezone context.

---

# 19. Venue ≠ location text

A Venue should ideally be structured.

Conceptually:

```text
Venue
├── name
├── address
├── timezone/location context
└── operational metadata
```

while the EventOccurrence references the chosen Venue.

Avoid storing everything as:

```text
event.location = "Grand Hotel"
```

if logistics depend on it.

---

# 20. Venue master ≠ Event venue snapshot

A Venue's address/contact details can change.

Historical Event occurrences may require a snapshot of the venue configuration used at that time.

Conceptually:

```text
EventOccurrence
├── venueId
└── venueSnapshot
```

where historical fidelity matters.

---

# 21. Venue ≠ room / stage

Large Events may contain:

```text
Venue
├── Main Hall
├── Room A
└── Studio B
```

Sessions should be assignable to appropriate sublocations where the approved scope requires it.

No new screen is required; this is safe Event-domain structure.

---

# 22. Logistics ≠ Task

A logistics requirement describes an operational dependency.

A Task describes work someone performs.

Example:

```text
Requirement:
Stage lighting ready

Task:
Confirm lighting vendor delivery
```

They can be related, but they are not automatically the same object.

---

# 23. Logistics Requirement model

Conceptually:

```text
LogisticsRequirement
├── category
├── occurrence
├── responsible party
├── dueAt
├── state
├── supplier/partner where applicable
├── evidence
└── blocker relationship
```

Potential categories might include venue, production, transport, catering, technical equipment, signage—only where actually supported.

---

# 24. Internal dependency ≠ Partner dependency

As with Client onboarding:

```text
INTERNAL
PARTNER
VENUE
SPEAKER
EXTERNAL
```

or equivalent responsibility semantics should remain distinguishable.

Operations must be able to answer:

> **Who are we waiting on?**

---

# 25. Registrant ≠ Contact automatically

A person registering for an Event does not automatically need to become a canonical CRM Contact.

Correct conceptual flow:

```text
EventRegistration
      ↓
identity matching
      ↓
existing Contact?
      │
      ├── YES → optional linkage
      └── NO  → remain Event registration record
```

The CRM admission policy decides whether a Contact is created.

---

# 26. Registration ≠ attendance

This distinction is mandatory.

```text
REGISTERED
≠
ATTENDED
```

Example:

```text
Registrations:
500

Attendees:
382
```

Do not overwrite Registration status simply to represent actual attendance without preserving both concepts.

---

# 27. Attendance ≠ check-in event

Conceptually:

```text
EventRegistration
      ↓
CheckInEvent
      ↓
Attendance
```

A check-in operation is an event/action.

Attendance is the resulting business fact.

This separation supports duplicate scanning/retries without double-counting.

---

# 28. Registration lifecycle is independent

Conceptual states may include:

```text
REGISTERED
CANCELLED
WAITLISTED
```

where supported.

Exact states belong to Phase 3D.

These remain separate from:

* occurrence state,
* payment state,
* attendance.

---

# 29. Do not automatically invent ticketing commerce

Design 028 is an Event operations workspace.

It does **not** automatically require us to create a new Event-ticket payment system.

If paid registration belongs to the frozen business requirements later, it should reuse the canonical Finance/Payment domain.

No additional screen or commerce engine is being introduced by this audit.

---

# 30. Registration source

Registrations should preserve useful provenance where applicable:

```text
source
campaign
invitation
partner referral
```

without coupling Event registration directly to Outreach or CRM internals.

This can support later reporting.

---

# 31. Capacity belongs to occurrence/session where relevant

Capacity may exist at:

```text
EventOccurrence
```

and sometimes:

```text
EventSession
```

Do not assume one global number fits every operational model.

Exact scope waits for Phase 3D.

---

# 32. Speaker assets

Speaker operations may require:

* biography,
* photograph,
* title/company,
* presentation/deck,
* session information.

These should use canonical:

**Contact + File/Asset**

records.

Avoid duplicate blobs like:

```text
speaker.headshotBase64
```

inside Event records.

---

# 33. Speaker asset received ≠ production ready

Uploaded biography/headshot/deck may still require review.

Therefore:

```text
RECEIVED
≠
ACCEPTED / READY
```

where the workflow requires validation.

This follows Designs 024–027.

---

# 34. Event approvals

Potential approval subjects can include:

* agenda,
* speaker material,
* branding,
* partner deliverable,
* final event program,
* post-event asset.

Use the shared Approval service.

Approval must bind to the exact version/artifact/subject.

---

# 35. Approval ≠ confirmation

A Speaker saying:

> “Yes, I will attend”

is confirmation.

A manager approving:

> “Agenda v3”

is approval.

These are different business events.

Do not collapse them.

---

# 36. Run of Show ≠ public agenda

This is an important Event-specific distinction.

### Public Agenda

What attendees see.

### Run of Show

Internal operational execution plan.

Example:

```text
09:57 — microphone check
09:59 — speaker backstage
10:00 — stage cue
10:01 — keynote begins
```

Internal Run-of-Show data must never automatically appear in public/client-facing agenda views.

---

# 37. Run of Show should be versioned where material

Last-minute Event operations can change.

A canonical version/history allows teams to know:

> Which run-of-show was active during the Event?

Exact version semantics can remain lightweight.

But the system should avoid one mutable text document with no audit trail.

---

# 38. Event-day operation ≠ planning workflow

Design 028 spans both.

Pre-event:

```text
PLANNING
PREPARATION
```

Event day:

```text
LIVE EXECUTION
```

Post-event:

```text
POST-EVENT DELIVERY
```

These operational phases can share one workspace without pretending they are identical workflows.

---

# 39. Live operational condition

During the Event, useful operational state may include:

* currently active Session,
* delayed Session,
* technical issue,
* missing Speaker,
* urgent Task,
* unresolved blocker.

These should derive from canonical Session/Task/Incident-like operational records where supported.

Do not create a separate ad-hoc “live dashboard database.”

---

# 40. Session actual time ≠ planned time

For reporting and operational accuracy:

```text
plannedStart
plannedEnd
actualStart
actualEnd
```

can differ.

Never overwrite the planned schedule with actual Event-day timing.

This allows delay analysis later.

---

# 41. Cancellation ≠ deletion

If an EventOccurrence is cancelled:

preserve:

* occurrence,
* registrations,
* participants,
* tasks,
* reason,
* cancellation timestamp,
* related activity.

Do not delete it.

---

# 42. Rescheduled ≠ rewritten history

If an Event moves from:

```text
12 September
```

to:

```text
3 October
```

preserve meaningful rescheduling history.

This affects:

* participants,
* venue,
* registrations,
* reporting.

---

# 43. Files / Assets remain canonical

Event assets should use the common File/Asset system.

Examples:

* agenda PDFs,
* signage,
* decks,
* photography,
* video recordings,
* branding,
* event reports.

No separate Event file storage implementation.

---

# 44. Event-day captured media ≠ Event itself

Photography and video generated during the Event are Assets linked to the occurrence/session.

```text
EventOccurrence
      ↓
CapturedAsset
```

These Assets can later feed:

* articles,
* videos,
* Podcast clips,
* social content,
* post-event reports.

---

# 45. Post-event assets need lineage

An Event highlight Video should know:

```text
sourceEventOccurrenceId
```

and potentially relevant Session/source Assets.

This enables later content/distribution reporting without copying Event data.

---

# 46. Event complete ≠ post-event work complete

Example:

```text
Event occurred:
COMPLETED

Post-event deliverables:
IN_PROGRESS
```

because:

* videos still editing,
* photographs awaiting delivery,
* report pending,
* social distribution pending.

Therefore Event-day completion and Project/workstream completion remain separate.

---

# 47. Publishing boundary

An Event occurrence can generate publishable content:

* Event page,
* recap,
* session videos,
* speaker interviews,
* photographs.

Actual publishing belongs to the canonical Publishing domain.

Correct:

```text
Event Output
     ↓
Publication
```

not:

```text
event.published = true
```

as the only source.

---

# 48. Distribution boundary

Similarly:

```text
Publication
     ↓
DistributionCampaign
```

Design 028 can show downstream progress.

It should not duplicate channel-level distribution execution.

---

# 49. Reporting ≠ operational source

Post-event reporting may aggregate:

* registrations,
* attendance,
* Session performance,
* assets,
* publishing/distribution results.

The Report remains an output/read model.

It must not become the authoritative source of registration or attendance truth.

---

# 50. Event metrics need canonical definitions

Potential Event metrics include:

**Registrations**
**Attendance**
**Attendance Rate**
**Confirmed Speakers**
**Sessions Completed**
**Event Readiness**
**Tasks Overdue**
**Post-Event Deliverables Complete**

Definitions must remain centralized.

For example:

```text
Attendance Rate =
canonical attended registrations /
eligible registrations
```

according to Phase 3D rules.

---

# 51. Registration count must respect deduplication

Repeated registration submissions should not blindly inflate:

```text
registrationCount
```

The Registration service needs duplicate/idempotency controls based on the permitted identity rules.

---

# 52. Check-in must be idempotent

Example:

```text
attendee QR scanned twice
```

must not produce:

```text
2 attendees
```

Correct:

```text
one canonical attendance
multiple scan attempts/history if necessary
```

This is especially important for Event-day reliability.

---

# 53. Offline / degraded Event-day operation

Live Events can have weak connectivity.

Architecture should be resilient enough that temporary connectivity problems do not corrupt Event state.

Exact offline functionality belongs later.

At minimum, the system should distinguish:

```text
check-in sync pending
```

from:

```text
not checked in
```

if offline support is implemented.

No new visual screen is required.

---

# 54. Partial failure behavior

Example:

```text
Event core          ✓
Agenda              ✓
Speakers            ✓
Registrations       ✕
Tasks               ✓
Assets              ✓
```

Correct behavior:

> Event Workspace remains operational and Registration areas show degraded status.

Incorrect:

> Entire Event Workspace fails.

---

# 55. Unknown ≠ zero

If the Registration service fails:

do not display:

> Registrations: 0

if the data is unavailable.

Display:

> Registration data unavailable.

The Design 150 system-state contract applies fully here.

---

# 56. Task integration

Event operational work should reuse the canonical Task domain.

Examples:

* confirm speaker,
* approve stage design,
* verify AV,
* prepare registration desk,
* upload final photographs.

No Event-specific general task engine is needed.

---

# 57. Milestones

Milestones remain separate from Tasks.

Potential examples:

```text
Venue Confirmed
Agenda Locked
Registration Open
Production Ready
Event Live
Event Completed
Post-Event Delivery Complete
```

Use the canonical Project Milestone infrastructure.

---

# 58. Risks vs blockers

As established in Project architecture:

### Risk

Potential future problem.

### Blocker

Current impediment.

Example:

```text
Risk:
Keynote flight could be delayed.

Blocker:
Venue power inspection failed.
```

Design 028 can summarize these from the canonical Project risk/blocker system.

---

# 59. Next Action

A canonical Event next-action resolver could prioritize:

```text
critical overdue Task
unconfirmed Speaker
venue/logistics blocker
next Session/live action
registration issue
required approval
post-event deliverable
```

Do not maintain a separate manually editable “next action” value that conflicts with Tasks/Workflow.

---

# 60. Relationship to Design 023

The distinction is clear:

### Design 023 — Project 360

Cross-domain Project view.

### Design 028 — Event Operations

Deep Event-specific execution.

```text
Project 360
   ↓
Event workstream
   ↓
Event Production / Operations
```

**DO NOT MERGE.**

---

# 61. Relationship to Designs 024–027

The reusable family now becomes:

```text
ProductExecutionWorkspaceTemplate
│
├── 024 Editorial
├── 025 Magazine
├── 026 Podcast
├── 027 Video
└── 028 Event
```

All share:

* Project context,
* workflow,
* Tasks,
* files,
* approvals,
* activity,
* progress/readiness,
* Client/internal dependencies.

But their specialized domain engines remain separate.

---

# 62. Event's unique reusable layer

Design 028 adds reusable **live-operations primitives** beyond earlier production screens:

`EventOccurrenceHeader`
`AgendaTimeline`
`SessionCard`
`ParticipantAssignmentCard`
`SpeakerReadinessCard`
`PartnerStatusCard`
`VenueSummary`
`LogisticsRequirementList`
`RegistrationSummary`
`AttendanceSummary`
`RunOfShowPanel`
`LiveSessionIndicator`
`EventReadinessCard`
`PostEventDeliverablesPanel`

This becomes a reusable Event-family component layer.

---

# 63. Permission architecture

Potential Phase 3D capabilities include:

```text
event.read
event.edit
event.assign
event.move_stage

event.participant.manage
event.partner.manage
event.agenda.manage
event.session.manage
event.venue.manage
event.logistics.manage

event.registration.read
event.registration.manage
event.checkin.manage

event.run_of_show.manage
event.approval.manage
event.mark_ready
```

Exact names are deferred to Phase 3D.

---

# 64. Registration permission ≠ general Event edit permission

A front-desk operator may have:

```text
registration.read
checkin.manage
```

without:

```text
event.agenda.manage
event.partner.manage
```

Likewise, a Producer may manage logistics without access to all registration personal information.

This is an important data-minimization boundary.

---

# 65. Participant information permissions

Registration lists can contain personal information.

Viewing Event 028 should not automatically grant:

* bulk registrant export,
* private contact details,
* marketing permissions.

As elsewhere:

> **VIEW EVENT ≠ EXPORT ATTENDEE DATA.**

---

# 66. Client visibility

Client-facing Event projections may show:

* agenda,
* confirmed speakers,
* milestones,
* approved assets,
* relevant registration metrics,
* post-event deliverables.

They should not automatically expose:

* internal Run of Show,
* production notes,
* risks,
* staff assignments,
* internal comments,
* private registrant data.

Backend projection remains mandatory.

---

# 67. Speaker / partner visibility

External speakers or partners should receive only their approved contextual information.

A Speaker should not gain raw Team Workspace access merely because they are an Event participant.

---

# 68. Activity history

Meaningful Event activity can include:

**Event occurrence created**
**Venue confirmed**
**Speaker invited**
**Speaker confirmed/declined**
**Partner confirmed**
**Session created**
**Agenda updated/locked**
**Registration opened**
**Registration milestone reached**
**Event readiness gate satisfied**
**Event started**
**Session started/completed**
**Attendance recorded**
**Event completed**
**Post-event asset uploaded**
**Report generated**
**Publication/distribution handoff created**

Each event should reference its canonical source record.

---

# 69. Audit history

Stronger auditing is especially important for:

* participant/partner changes,
* agenda changes near Event time,
* registration data exports,
* manual attendance adjustments,
* readiness overrides,
* cancellation/rescheduling,
* externally visible materials.

---

# 70. Concurrency

Event operations are extremely collaborative.

Example:

```text
Producer changes agenda
Registration team checks attendees in
Speaker manager updates confirmation
AV team resolves blocker
Content team uploads photos
```

These must use domain-specific commands.

Never save one gigantic Event workspace object that can overwrite simultaneous changes.

---

# 71. Agenda concurrency

Example:

```text
User A moves Session A to 11:00

User B simultaneously moves Session B into 11:00
```

The server must re-evaluate:

* room,
* participant,
* schedule conflicts

before accepting changes.

---

# 72. Check-in concurrency

Multiple desks may check the same attendee simultaneously.

The Attendance service needs an atomic/idempotent command such as conceptually:

```text
checkInRegistration()
```

with duplicate protection.

---

# 73. Backend read model

A useful composed view is:

```text
EventOperationsView
├── Project summary
├── Event
├── EventOccurrence
├── status / health / readiness
├── participants
├── partners
├── agenda / sessions
├── venue
├── logistics
├── registration summary
├── attendance summary
├── Run of Show
├── Tasks / milestones
├── risks / blockers
├── files / assets
├── post-event deliverables
├── publication/distribution summary
└── activity
```

This is a **read composition**.

---

# 74. Do not PATCH EventOperationsView

Avoid:

```text
PATCH /event-workspace
{
  speakerConfirmed: true,
  venueReady: true,
  registrationCount: 400,
  eventCompleted: true,
  reportPublished: true
}
```

Use explicit canonical commands:

```text
createOccurrence()
assignParticipant()
confirmParticipant()
updateSession()
reorderAgenda()
assignVenue()
updateLogisticsRequirement()
registerAttendee()
checkInRegistration()
startSession()
completeSession()
evaluateEventReadiness()
completeEventOccurrence()
```

---

# 75. Backend architecture

```text
Event Operations UI
        ↓
EventOperationsQueryService
        ↓
Tenant + Permission Scope
        ↓
Event Domain
        │
        ├── Event
        ├── EventOccurrence
        ├── Participant Assignments
        ├── Partner Assignments
        ├── Agenda / Sessions
        ├── Venue / Logistics
        ├── Registrations
        ├── Attendance / Check-in
        └── Run of Show
        │
        ├── Project / Workflow Service
        ├── Contact / Company Service
        ├── Task / Milestone Service
        ├── File / Asset Service
        ├── Approval Service
        ├── Publishing Service
        ├── Distribution Service
        └── Reporting Service
```

---

# 76. Backend requirements

| Requirement                          | Status       |
| ------------------------------------ | ------------ |
| Authentication                       | **Required** |
| Tenant isolation                     | **Critical** |
| Event/Project RBAC                   | **Critical** |
| Canonical Event entity               | **Critical** |
| EventOccurrence / Edition separation | **Critical** |
| Project linkage                      | **Critical** |
| Participant assignment model         | **Critical** |
| Partner assignment model             | **Required** |
| Structured Agenda / Session model    | **Critical** |
| Timezone-safe scheduling             | **Critical** |
| Venue/logistics model                | **Required** |
| Task/Milestone integration           | **Critical** |
| Registration model                   | **Critical** |
| Registration deduplication           | **Critical** |
| Attendance / check-in separation     | **Critical** |
| Idempotent check-in                  | **Critical** |
| Run-of-Show model                    | **Required** |
| File/Asset integration               | **Critical** |
| Approval integration                 | **Required** |
| Event readiness evaluation           | **Critical** |
| Client/external-safe projections     | **Critical** |
| Publishing handoff                   | **Required** |
| Distribution linkage                 | **Required** |
| Reporting integration                | **Required** |
| Concurrency protection               | **Critical** |
| Partial-failure handling             | **Required** |
| Activity history                     | **Required** |
| Audit history                        | **Required** |

---

# 77. Responsive contract — Desktop

Desktop remains the strongest Event-operations surface:

```text
Event Header
↓
Status / Progress / Readiness
↓
Agenda / Participants / Venue
↓
Registrations / Logistics
↓
Run of Show
↓
Tasks / Blockers
↓
Live Operations
↓
Post-Event Delivery
```

Dense operational information is appropriate here.

---

# 78. Responsive contract — Tablet

Following Design 152:

* Event metrics reflow,
* Agenda remains timeline-friendly,
* participants become cards,
* Run-of-Show uses a focused panel,
* registration and logistics tables reduce columns,
* touch-safe Event-day actions remain prominent.

Tablet may be particularly important operationally on Event day.

---

# 79. Responsive contract — Mobile

Following Design 151, mobile should prioritize:

```text
Event Identity
↓
Current Operational Phase
↓
Next Session / Live Session
↓
Critical Blockers
↓
Speaker / Participant Alerts
↓
Event-Day Actions
↓
Registration / Attendance Summary
↓
Next Action
↓
Tasks
↓
Post-Event Requirements
```

Do not compress the entire desktop planning board onto a phone.

---

# 80. Mobile event-day actions

High-value permitted actions can include:

* check in attendee,
* confirm participant,
* open Run of Show,
* start/complete Session,
* resolve Task,
* flag issue/blocker,
* upload Event asset.

Complex agenda restructuring remains safer on larger surfaces.

---

# 81. State coverage

Design 028 inherits Design 150 plus Event-specific states such as:

**Event Loading**
**Event Not Found**
**Occurrence Draft**
**Planning**
**Registration Open**
**Speaker Confirmation Pending**
**Venue Pending**
**Agenda Incomplete**
**Logistics Blocked**
**Event-Day Ready**
**Event Live**
**Session Delayed**
**Occurrence Completed**
**Occurrence Cancelled**
**Post-Event Work In Progress**
**Post-Event Complete**
**Registration Data Unavailable**
**Check-In Sync Pending**
**Permission Restricted**
**Record Updated Elsewhere**
**Partial Service Failure**

These must not all become one giant `EventStatus` enum.

---

# 82. Main implementation risks

The Design 028 audit flags:

**Project/Event conflation** — Event-specific operational fields polluting generic Project.

**Event/Occurrence conflation** — annual/recurring editions overwriting historical Event data.

**Contact/Speaker conflation** — participant roles stored directly on canonical Contact.

**Company/Partner conflation** — Event partnership becoming permanent Company identity state.

**Agenda/Session conflation** — entire program stored as unstructured rich text.

**Session/Meeting conflation** — public program sessions forced into generic Calendar meetings.

**Venue/string conflation** — logistics relying on one location text field.

**Registration/Contact conflation** — every attendee automatically entering CRM.

**Registration/Attendance conflation** — registered people counted as attendees.

**Attendance/check-in-event conflation** — duplicate scans inflating actual attendance.

**Agenda/Run-of-Show conflation** — internal production cues exposed publicly.

**Planning/live-operation conflation** — one generic Event status unable to represent Event-day execution.

**Event completion/Project completion conflation** — post-event assets/reporting lost.

**Progress/readiness conflation** — high planning completion incorrectly treated as Event-day readiness.

**Client/internal visibility leakage** — internal risks, logistics notes or registrant data exposed externally.

**Mega-save concurrency** — live Event teams overwriting each other.

**Zero-on-outage errors** — Registration or attendance outages displayed as zero.

None requires an additional visual design.

They require correct Event-domain architecture.

# Design 028 Audit Verdict

## **PASS — EVENT PRODUCTION & LIVE OPERATIONS WORKSPACE ANCHOR**

**Template directive:** Design 028 becomes the canonical Event composition of `ProductExecutionWorkspaceTemplate`, extended with live-operations capabilities.

**Domain directive:** **Project ≠ Event ≠ EventOccurrence ≠ Session ≠ Registration ≠ Attendance.**

**Occurrence directive:** Recurring Event editions/occurrences must preserve their own dates, venue, participants, agenda, registration and operational history.

**Identity directive:** Speakers and Partners reuse canonical Contact/Company identities through Event-specific assignment records.

**Agenda directive:** Agenda remains an ordered composition of structured Sessions rather than one rich-text schedule.

**Scheduling directive:** Session timing is timezone-safe, server-authoritative and conflict-aware.

**Venue directive:** Venue/logistics data belongs to EventOccurrence context and must remain distinguishable from simple location display text.

**Registration directive:** Event registrations are first-class records and do not automatically create CRM Contacts.

**Attendance directive:** Registration, check-in event and actual attendance remain separate; Event-day check-in requires idempotent/atomic processing.

**Operations directive:** Public Agenda and internal Run of Show remain separate structures with different visibility.

**Dependency directive:** Internal, partner, venue and participant dependencies remain distinguishable so Operations can identify the true source of delay.

**Readiness directive:** Event-day readiness is a canonical gate evaluation rather than planning percentage or a manually toggled boolean.

**Completion directive:** Event occurrence completion does not automatically mean post-event production, publishing, distribution or Project closeout is complete.

**Publishing directive:** Event-generated media/content hands off to the canonical Publishing and Distribution domains rather than duplicating them.

**Permission directive:** registration data, attendance operations, agenda control, logistics management, participant management and publication authority remain separately enforceable.

**Resilience directive:** Registration/check-in/live-operation services require concurrency, idempotency and partial-failure behavior appropriate for real Event-day use.

**Reuse directive:** Designs **024–028** now formally share the `ProductExecutionWorkspaceTemplate`, while Event adds the reusable live-operations layer.

**Consolidation directive:** **STANDARDIZE EVENT OCCURRENCE + PARTICIPANT ASSIGNMENT + AGENDA/SESSION + REGISTRATION/ATTENDANCE + LIVE OPERATIONS INFRASTRUCTURE — DO NOT MERGE EVENT OPERATIONS WITH PROJECT 360, CRM CONTACTS, GENERIC MEETINGS, PUBLISHING, DISTRIBUTION OR REPORTING.**

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **28 / 153** |
| **PASS**                                   |                         **28** |
| **STANDARDIZE decisions**                  |                         **26** |
| **Potential implementation-overlap flags** |                         **19** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

### Product-specific execution architecture after Design 028

```text
ProductExecutionWorkspaceTemplate
│
├── 024 Editorial Production
│
├── 025 Personal Magazine Production
│
├── 026 Podcast Production
│
├── 027 Video Production
│
└── 028 Event Production / Operations
    │
    ├── Event / Occurrence
    ├── Speakers / Partners
    ├── Agenda / Sessions
    ├── Venue / Logistics
    ├── Registrations
    ├── Attendance
    ├── Run of Show
    ├── Live Operations
    └── Post-Event Delivery
```

A useful product-level pattern is now firmly established:

```text
                    PROJECT
                       ↓
          PRODUCT-SPECIFIC WORKSTREAM
                       ↓
 ┌──────────┬──────────┬──────────┬──────────┐
 Editorial  Magazine   Podcast    Video      Event
    ↓          ↓          ↓          ↓         ↓
 Specialized domain execution + shared infrastructure
                       ↓
              APPROVED / READY OUTPUT
                       ↓
                 PUBLISHING
                       ↓
                DISTRIBUTION
                       ↓
                  REPORTING
```

# Next Sequential Audit Target

## **Phase 3A.1 — Design 029 Audit**

For **Design 029**, we should first retrieve its **exact frozen identity from the approved 153-design inventory** before auditing it.

We should not infer Design 029 from the Event workflow or assume the next screen is an agenda builder, registration view, event-day console, publishing screen, or another product workspace.

Once the frozen identity is verified, we continue with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no guessing, no redesign, no additional screen and no sequence change.**

