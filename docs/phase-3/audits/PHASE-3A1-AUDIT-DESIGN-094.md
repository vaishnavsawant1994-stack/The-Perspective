# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 094 — Meeting Detail / Meeting Outcome Workspace

Design 094 should become the **canonical Team Workspace Meeting detail, occurrence-context, attendance, outcome-capture, and governed post-meeting action surface** built on the Meeting foundation already established by Designs 015, 035 and 046.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary should be:

> **Meeting ≠ MeetingOccurrence ≠ CalendarEvent/ProviderEvent ≠ MeetingParticipant ≠ RSVP ≠ Attendance ≠ MeetingOutcome ≠ OutcomeDecision ≠ Note/Transcript ≠ FollowUp ≠ Task ≠ Lead/Contact/Company/Deal ≠ ActivityEvent.**

The central implementation rule is:

> **A Meeting is the canonical business interaction/scheduling entity. Its calendar-provider representation, participant responses, actual attendance, outcome record, notes, resulting FollowUps/Tasks, and related Lead/Deal context remain separate. Completing a Meeting does not automatically qualify a Lead, advance a Deal, create a FollowUp, or imply that an Outcome was captured; every downstream business effect must occur through an explicit governed source-domain command.**

---

# 1. Classification

| Audit field                         | Classification                                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**                       | **094**                                                                                                                                    |
| **Canonical name**                  | **Meeting Detail / Meeting Outcome Workspace**                                                                                             |
| **Product area**                    | Team Workspace / Meetings / Sales & Relationship Operations                                                                                |
| **User surface**                    | **Authenticated Team Workspace**                                                                                                           |
| **Screen class**                    | Entity Detail / Interaction Outcome Workspace                                                                                              |
| **Classification**                  | **Canonical Meeting Detail, Occurrence, Outcome & Post-Meeting Action Anchor**                                                             |
| **Primary purpose**                 | Inspect one canonical Meeting, participants and schedule context; record the actual outcome; and initiate governed downstream work/actions |
| **Primary entity**                  | **Meeting** — Design 015                                                                                                                   |
| **Occurrence entity**               | **MeetingOccurrence**, where recurrence exists                                                                                             |
| **Calendar projection/integration** | Design 035                                                                                                                                 |
| **Portal Meeting reuse**            | Design 046                                                                                                                                 |
| **Participant entity**              | **MeetingParticipant**                                                                                                                     |
| **Invitation response**             | **RSVP / ParticipantResponse**                                                                                                             |
| **Actual participation**            | **Attendance**                                                                                                                             |
| **Outcome entity**                  | **MeetingOutcome**                                                                                                                         |
| **Outcome decision/action linkage** | **OutcomeDecision / OutcomeActionReference**                                                                                               |
| **Lead dependency**                 | Designs 011 / 089                                                                                                                          |
| **Contact dependency**              | Designs 086–087                                                                                                                            |
| **Company dependency**              | Designs 084–085                                                                                                                            |
| **Deal dependency**                 | Designs 016–017                                                                                                                            |
| **Follow-up dependency**            | Design 015 / upcoming Design 095                                                                                                           |
| **Task dependency**                 | Design 034                                                                                                                                 |
| **Provider-calendar dependency**    | Design 035                                                                                                                                 |
| **Notification dependency**         | Design 080                                                                                                                                 |
| **Audit dependency**                | Design 039                                                                                                                                 |
| **Primary query service**           | `MeetingDetailQueryService`                                                                                                                |
| **Meeting service**                 | `MeetingService`                                                                                                                           |
| **Outcome service**                 | `MeetingOutcomeService`                                                                                                                    |
| **Participant service**             | `MeetingParticipantService`                                                                                                                |
| **Calendar sync service**           | `CalendarSyncService` / provider adapters                                                                                                  |
| **Post-meeting orchestration**      | `MeetingOutcomeActionOrchestrator`                                                                                                         |
| **Parent shell**                    | `InternalAppShell` — Design 001                                                                                                            |
| **Auth**                            | Required                                                                                                                                   |
| **Authorization**                   | OrganizationMembership + Meeting + outcome + participant + related-source permissions                                                      |
| **Implementation priority**         | **Critical Interaction History / Outcome Integrity / Sales Workflow Boundary**                                                             |
| **Reuse level**                     | **Extremely High across CRM, Deals, Calendar, Tasks and Follow-ups**                                                                       |

Design 094 should answer:

> **“What exact Meeting is this, when and where was it scheduled, who was invited, who actually attended, which Lead/Contact/Company/Deal context is related, what was the real outcome, and which explicit post-meeting actions were actually created or executed?”**

Canonical composition:

```text
Meeting
   │
   ├── schedule / occurrence
   ├── MeetingParticipant[]
   │      ├── RSVP
   │      └── Attendance
   │
   ├── CalendarProvider linkage
   │
   ├── Lead / Contact / Company / Deal context
   │
   ├── MeetingOutcome
   │      ├── structured outcome
   │      ├── notes/evidence references
   │      └── OutcomeActionReference[]
   │
   ├── FollowUp[]
   ├── Task[]
   └── Activity
            │
            ↓
      MeetingDetailView
```

---

# 2. Reuse

## Design 015 remains the canonical Meeting foundation

Design 094 must use the exact same canonical Meeting identity introduced in Design 015.

Correct:

```text
Design 015
Meeting M-100
    ↓
Design 094
Meeting Detail / Outcome
```

Not:

```text
MeetingDetailRecord
SalesMeeting
CompletedMeeting
OutcomeMeeting
```

as parallel Meeting identities.

---

## Design 035 remains Calendar/Scheduling authority

The canonical Meeting can be represented in:

* internal Calendar,
* external Google/Microsoft calendar,
* schedule projections.

But:

> **Meeting ≠ CalendarEvent ≠ ProviderEvent.**

Design 094 should consume provider synchronization state without making the provider record the Meeting itself.

---

## Design 046 remains Client Portal Meeting projection

A client-visible Meeting and Team Workspace Meeting must reference the same canonical Meeting where they represent the same business interaction.

Portal-safe visibility remains separate from internal Meeting detail.

---

## Reuse canonical Contact identities

Meeting participants that resolve to CRM Contacts should reference Design 086's canonical Contact IDs.

Do not copy:

```text
participantName
participantCompany
participantEmail
```

as the only person identity when canonical Contact linkage exists.

Historical invitee/address snapshots may still be retained separately.

---

## Reuse Company context

Company-related Meeting context must reference the canonical Company from Design 084.

Meeting is not Company Activity storage.

---

## Reuse Lead 360

If Meeting originated from Lead work:

```text
Lead L-100
    ↓
Meeting M-200
```

the Meeting can reference the Lead context.

Lead status remains Design 011/089 truth.

---

## Reuse Deal domain

If a Meeting concerns a Deal:

```text
Deal D-100
    ↓
Meeting M-200
```

Deal stage remains canonical in Designs 016–017.

Meeting outcome can inform an explicit Deal command.

It does not own Deal stage.

---

## Reuse canonical FollowUp from Design 015

A post-meeting FollowUp must be a real FollowUp.

Correct:

```text
MeetingOutcome
      ↓
FollowUp F-100
```

Not:

```text
meeting.nextFollowUpDate
```

as a second follow-up backend.

---

## Reuse Task from Design 034

Internal work created after a Meeting remains a Task.

---

## Reuse Design 080 Notification infrastructure

Notifications can communicate:

* Meeting approaching,
* Meeting changed,
* outcome still required,
* FollowUp due,

but Notification state never changes Meeting/Outcome truth.

---

# 3. Entities

## Meeting

`Meeting` remains the durable business interaction identity.

Conceptually:

```text
Meeting
├── id
├── organizationId
├── subject/title
├── schedule context
├── organizer
├── lifecycle
├── related business contexts
├── createdAt
└── revision
```

Exact schema belongs to Phase 3D.

---

## Meeting ≠ scheduled time

Changing:

```text
Monday 2 PM
→
Tuesday 4 PM
```

does not inherently create a new Meeting identity.

Schedule revisions/history should preserve what happened.

---

## Meeting ≠ occurrence

Where recurrence exists, distinguish:

```text
Meeting / MeetingSeries
      ↓
MeetingOccurrence #1
MeetingOccurrence #2
MeetingOccurrence #3
```

An Outcome belongs to the actual occurrence reviewed.

Do not record one recurring-series outcome and make it appear to apply to every occurrence.

---

## Non-recurring Meeting can still use occurrence semantics internally

Implementation may model the one scheduled instance as an occurrence or keep simpler Meeting scheduling fields.

The important invariant is:

> outcome/attendance must bind the exact interaction that occurred.

---

## MeetingOccurrence ≠ Calendar provider occurrence

Permanent.

External provider representation is integration state.

---

## Planned time ≠ actual time

Potentially preserve:

```text
scheduledStart
scheduledEnd

actualStart
actualEnd
```

where outcome workflow captures them.

Do not rewrite the planned schedule simply because the Meeting started late.

---

## Rescheduled ≠ cancelled necessarily

Permanent.

---

## Cancelled ≠ no-show

Permanent.

### Cancelled

Meeting intentionally did not proceed.

### No-show

Meeting remained expected but one/all required participants did not attend.

Different operational meaning.

---

## CalendarEvent / ProviderEvent

External provider data can conceptually include:

```text
ExternalCalendarEventLink
├── meetingId
├── providerConnection
├── providerEventId
├── provider calendar
├── sync revision
└── sync state
```

---

## ProviderEvent ≠ Meeting

Permanent.

---

## Provider event deletion ≠ Meeting deletion automatically

A provider user can accidentally delete the external calendar item.

That should produce a sync/conflict state requiring canonical policy—not destroy internal Meeting history blindly.

---

## Provider event update ≠ automatically trusted Meeting edit

Provider synchronization needs:

* version/conflict handling,
* actor/source provenance,
* authorization policy.

---

## MeetingParticipant

Participants should be explicit relations.

Conceptually:

```text
MeetingParticipant
├── meeting/occurrenceId
├── participantType
├── Contact/User/external reference
├── invitation address snapshot
├── role
├── RSVP
└── Attendance
```

---

## Participant ≠ Contact

Some participants may be:

* external invitees,
* Team Users,
* Client contacts,
* unresolved people.

Do not force every attendee into CRM Contact creation.

---

## Invited participant ≠ attendee

Critical.

---

## RSVP ≠ Attendance

One of the strongest Design 094 boundaries.

Example:

```text
RSVP = ACCEPTED
Attendance = NO_SHOW
```

valid.

Or:

```text
RSVP = NO_RESPONSE
Attendance = ATTENDED
```

also possible.

---

## RSVP lifecycle

Conceptually:

```text
No Response
Accepted
Declined
Tentative
```

depending on provider/product semantics.

---

## Attendance lifecycle

Conceptually:

```text
Unknown
Attended
Partially Attended
No-show
```

where appropriate.

Exact enums Phase 3D.

---

## RSVP change ≠ Meeting lifecycle change

One participant declining does not automatically cancel the Meeting.

---

## Attendance ≠ MeetingOutcome

Permanent.

Knowing:

> Sarah attended

does not explain:

> Deal advanced / needs follow-up / no interest.

---

## Organizer ≠ Meeting owner necessarily

Organizer, CRM owner, Deal owner and operational Meeting owner can be different roles.

Do not collapse them.

---

## Meeting business context

A Meeting may reference:

```text
Lead
Contact
Company
Deal
Client relationship
Project
```

according to valid domain needs.

Do not force every Meeting to have all of them.

---

## One Meeting can have multiple contexts

Example:

```text
Meeting
├── Contact C1
├── Company CO1
├── Lead L1
└── Deal D1
```

These references are related context—not ownership of those entities.

---

## MeetingOutcome

`MeetingOutcome` should be first-class rather than a generic status string.

Conceptually:

```text
MeetingOutcome
├── id
├── meetingOccurrenceId
├── capturedBy
├── capturedAt
├── outcome classification/disposition
├── summary
├── decision/context
├── revision
└── action references
```

Exact content follows frozen UI/business requirements.

---

## MeetingOutcome ≠ Meeting status

Critical.

A Meeting can be:

```text
Meeting lifecycle = COMPLETED
Outcome = NOT CAPTURED
```

This must be representable.

---

## Completed Meeting ≠ Outcome captured

Permanent.

---

## Outcome captured ≠ FollowUp created

Permanent.

---

## Outcome captured ≠ Lead qualified

Permanent.

---

## Outcome captured ≠ Deal advanced

Permanent.

---

## Outcome captured ≠ Client converted

Permanent.

---

## Outcome should bind exact occurrence/revision

For recurring/rescheduled Meetings, Outcome must identify exactly which occurrence/interacting record it describes.

---

## MeetingOutcome should be version/history aware

If a reviewer corrects an outcome later:

do not silently replace the historical outcome without trace.

Prefer:

```text
Outcome v1
   ↓ superseded/corrected by
Outcome v2
```

or append-oriented revision history.

---

## Human correction ≠ original outcome rewrite

Audit/history should preserve both.

---

## OutcomeDecision

Where the frozen design includes structured decisions, distinguish:

```text
MeetingOutcome
```

from explicit:

```text
OutcomeDecision
```

or action semantics.

For example:

> “Interested”

is outcome interpretation.

> “Advance Deal to Proposal”

is a business action requiring DealService authorization.

---

## Outcome classification ≠ source-domain mutation

Permanent.

---

## Notes

If Design 094 includes Meeting Notes:

Notes remain contextual content.

A Note can contain:

> They liked the proposal.

That is not automatically:

* Lead qualification,
* Deal stage,
* MeetingOutcome,
* FollowUp.

---

## Note ≠ transcript

Permanent.

---

## Transcript / Recording

If present in the frozen design:

* transcript,
* recording,
* generated summary,

remain their own media/content artifacts with access controls.

They do not become MeetingOutcome automatically.

---

## AI-generated summary ≠ human OutcomeDecision

If any AI summary exists later, human/business decision authority remains separate.

---

## FollowUp

Canonical FollowUp:

```text
FollowUp
├── sourceContext = Meeting/Outcome
├── responsible Team member
├── due time
├── status
└── business context
```

---

## FollowUp ≠ Task

Design 015 boundary remains.

A FollowUp means a relationship/sales follow-up obligation.

Task can represent broader internal work.

---

## FollowUp creation should preserve source linkage

Example:

```text
FollowUp F1
sourceMeetingId = M1
sourceOutcomeId = O1
```

or equivalent.

---

## Task

A Meeting may generate:

> Prepare revised proposal

as a canonical Task.

---

## Task completion ≠ MeetingOutcome modification

Permanent.

---

## Lead

Meeting Outcome can inform Lead handling.

But:

```text
MeetingOutcome
≠
LeadStatus
≠
Qualification
```

---

## Explicit Lead command required

Example:

```text
MeetingOutcome
      ↓
authorized user chooses
      ↓
LeadService.updateQualification(...)
```

This records a separate Lead-domain action.

---

## Deal

Same principle:

```text
MeetingOutcome
      ↓
authorized decision
      ↓
DealService.changeStage(...)
```

Outcome evidence remains Meeting-domain history.

Deal mutation remains Deal-domain history.

---

## Contact/Company current profile changes

If after the Meeting:

* Contact changes title,
* Company changes name/domain,

the Meeting participant and outcome history must remain reconstructable as it existed at the interaction time where snapshots are required.

---

## ActivityEvent

Meeting Activity can include:

* scheduled,
* rescheduled,
* participant accepted,
* Meeting completed,
* Outcome recorded,
* FollowUp created.

Activity remains projection.

---

## ActivityEvent ≠ Meeting

Permanent.

---

## Activity ≠ Audit

Design 039 remains governance history.

---

# 4. Permissions

Design 094 should conceptually distinguish:

```text
meeting.read
meeting.create
meeting.edit
meeting.reschedule
meeting.cancel

meeting.participants.read
meeting.participants.manage

meeting.outcome.read
meeting.outcome.record
meeting.outcome.correct

meeting.notes.read
meeting.notes.manage

meeting.calendarSync.read
meeting.calendarSync.manage

followUp.create
task.create

lead.read / mutate
deal.read / mutate
```

Exact permission keys belong to Phase 3D.

---

## Meeting read ≠ Meeting edit

Permanent.

---

## Meeting edit ≠ outcome recording

A coordinator could schedule Meetings without being allowed to record sensitive outcome data.

---

## Outcome read ≠ outcome edit

Permanent.

---

## Outcome edit ≠ Lead update

Permanent.

---

## Outcome edit ≠ Deal update

Permanent.

---

## Participant management ≠ CRM Contact management

Adding/removing invitees does not permit editing Contact profile.

---

## Contact visibility ≠ all Contact PII visibility

Meeting detail should expose only safe participant context.

---

## Meeting access ≠ Deal value access

A participant or scheduler may know a Meeting is related to Deal D1 without permission to view confidential Deal amount.

---

## Meeting access ≠ Lead provenance/raw evidence access

Permanent.

---

## Meeting access ≠ private Note/transcript access

Sensitive meeting content requires its own permission.

---

## Provider-calendar administration ≠ Meeting business authority

Someone who manages calendar connections does not automatically gain authority to change Lead/Deal outcomes.

---

## Meeting organizer ≠ security permission

Operational organizer status cannot grant additional application permissions.

---

## RSVP link/action ≠ Workspace access

External RSVP behavior must not create Team/Portal authorization.

---

## Outcome author derives from session

Browser cannot supply:

```text
capturedBy = anotherUser
```

as authoritative identity.

---

## Related Lead/Deal commands reauthorize

Even if the user can record Meeting Outcome:

a requested Lead or Deal mutation must separately pass its source-domain permission.

---

## FollowUp creation reauthorizes

Same.

---

## Task creation reauthorizes

Same.

---

## Meeting occurrence direct ID reauthorizes

Knowing occurrence ID grants no access.

---

## Provider event IDs are not authorization tokens

Permanent.

---

## Client-visible Meeting permission remains separate

Design 046's Portal projection should expose only client-safe data.

An internal MeetingOutcome/Note must never become client-visible merely because the client attended.

---

# 5. States

Design 094 must keep **Meeting lifecycle, occurrence state, RSVP, attendance, Outcome state, provider-sync state, downstream action state and related-domain state** separate.

### Meeting lifecycle

Conceptually:

```text
Draft / Proposed
Scheduled
In Progress
Completed
Cancelled
```

Exact canonical enum remains Phase 3D.

### Occurrence state

Where recurrence exists:

```text
Scheduled
Rescheduled
In Progress
Completed
Cancelled
No-show / Did Not Occur
```

### RSVP

```text
No Response
Accepted
Tentative
Declined
```

### Attendance

```text
Unknown
Attended
Partially Attended
No-show
```

### Outcome

```text
Not Captured
Draft
Recorded / Finalized
Corrected / Superseded
```

### Calendar synchronization

```text
Not Linked
Synced
Sync Pending
Sync Conflict
Sync Failed
Provider Unavailable
```

### Downstream actions

```text
No Action Requested
Action Pending
Action Completed
Partially Completed
Action Failed
Action Restricted
```

These must never collapse into one `meeting.status`.

---

## Scheduled ≠ confirmed by all participants

Permanent.

---

## Accepted RSVP ≠ attended

Permanent.

---

## Declined RSVP ≠ Meeting cancelled

Permanent.

---

## No-show ≠ cancelled

Permanent.

---

## Completed ≠ Outcome recorded

Permanent.

---

## Outcome recorded ≠ FollowUp completed

Permanent.

---

## Outcome positive ≠ Lead qualified

Permanent.

---

## Outcome positive ≠ Deal won

Permanent.

---

## Outcome negative ≠ Lead deleted

Permanent.

---

## Outcome corrected ≠ Meeting rescheduled

Permanent.

---

## Calendar sync failed ≠ Meeting failed

Critical.

---

## Provider event deleted ≠ Meeting deleted

Critical.

---

## Provider unavailable ≠ Meeting cancelled

Permanent.

---

## No FollowUp ≠ FollowUp service unavailable

Critical.

---

## No related Deal ≠ Deal service unavailable

Critical.

---

## No transcript ≠ transcript service failure

If transcript is supported, keep those states separate.

---

## Meeting core available + related-domain outage

Example:

```text
Meeting core      ✓
Participants      ✓
Calendar sync     ✓
Lead              ✓
Deal              ✕
Outcome           ✓
FollowUps         ✕
Activity          ✓
```

Design 094 still renders.

Deal/FollowUp sections become explicitly unavailable.

---

## State Coverage

Design 094 inherits Design 150 plus:

```text
Meeting Loading
Meeting Available
Meeting Restricted
Meeting Cancelled
Meeting Completed
Meeting No Longer Accessible

Occurrence Scheduled
Occurrence Rescheduled
Occurrence In Progress
Occurrence Completed
Occurrence Cancelled
Occurrence No-show

RSVP No Response
RSVP Accepted
RSVP Tentative
RSVP Declined

Attendance Unknown
Participant Attended
Participant Partially Attended
Participant No-show

Outcome Not Captured
Outcome Draft
Outcome Recorded
Outcome Corrected
Outcome Needs Review

Calendar Not Linked
Calendar Synced
Calendar Sync Pending
Calendar Sync Conflict
Calendar Sync Failed
Calendar Provider Unavailable

Lead Context Available
Lead Context Restricted
Lead Service Unavailable

Deal Context Available
No Related Deal
Deal Context Restricted
Deal Service Unavailable

FollowUps Available
No FollowUp
FollowUp Service Unavailable

Tasks Available
No Tasks
Task Service Unavailable

Downstream Action Pending
Downstream Action Completed
Downstream Action Partially Completed
Downstream Action Failed
Downstream Action Restricted

Meeting Updated Elsewhere
Partial Meeting Detail Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should preserve Meeting identity and separate schedule/participants/outcome from downstream business effects.

Conceptually:

```text
Meeting identity / lifecycle
↓
Schedule / occurrence
↓
Participants
   ├── RSVP
   └── Attendance
↓
Lead / Contact / Company / Deal context
↓
Meeting Outcome
↓
Post-meeting actions
   ├── FollowUp
   ├── Task
   ├── Lead command
   └── Deal command
↓
Activity
```

Only sections actually present in frozen Design 094 should render.

---

## Lifecycle, RSVP and Attendance must not share one badge

Example:

```text
Meeting: Completed
Sarah RSVP: Accepted
Sarah Attendance: No-show
Outcome: Recorded
```

All can coexist.

---

## Business context should remain secondary

A Deal badge must not visually make the Meeting appear to be a Deal Detail screen.

---

## Outcome and downstream actions should remain separate

Correct:

```text
Outcome:
Interested in premium package

Actions:
FollowUp created
Deal stage updated
```

Not one generic:

> Successful.

---

## Tablet

Following Design 152:

* Meeting summary stays first,
* participant rows become compact cards,
* Outcome section stacks,
* post-meeting actions remain domain-labeled,
* provider sync details stay secondary.

---

## Mobile

Priority:

```text
Meeting
↓
Date / time / location
↓
Meeting lifecycle
↓
Participants
↓
Attendance / RSVP
↓
Business context
↓
Outcome
↓
FollowUp / Task / explicit business actions
↓
Activity
```

Exact ordering follows frozen responsive design.

---

## Mobile participant states

Use explicit text, not color only:

> RSVP: Accepted
> Attendance: No-show

---

## Partial failure on mobile

A Deal-service error should affect only Deal context, not replace the full Meeting with a global error.

---

## Accessibility

A Meeting detail view could communicate:

> Meeting with Sarah Patel and two other participants. Completed August 22. Sarah accepted the invitation and attended. Meeting outcome recorded. One follow-up due tomorrow. Related Deal context unavailable.

where current authorized data supports it.

---

# 7. Backend Requirements

## Canonical Meeting detail architecture

```text
Design 094
    ↓
Authenticated Workspace Context
    ↓
MeetingDetailQueryService
    │
    ├── MeetingAdapter
    ├── OccurrenceAdapter
    ├── ParticipantAdapter
    ├── CalendarSyncAdapter
    ├── Contact/CompanyAdapter
    ├── LeadAdapter
    ├── DealAdapter
    ├── MeetingOutcomeAdapter
    ├── FollowUpAdapter
    ├── TaskAdapter
    └── ActivityAdapter
    ↓
MeetingDetailView
```

This is a **read composition layer**.

---

## Query anchors on canonical Meeting ID

Conceptually:

```text
getMeetingDetail(meetingId, occurrenceId?, currentMembership)
```

First:

```text
authorize Meeting
```

Then independently authorize sensitive sections.

---

## No giant MeetingDetail business record

Avoid:

```text
MeetingDetailRecord {
  meeting,
  participantsJson,
  leadJson,
  dealJson,
  outcomeJson,
  tasksJson,
  activityJson
}
```

as canonical truth.

A read cache/materialization is acceptable only if rebuildable and source-derived.

---

## Recurrence handling

If Meetings can recur:

```text
Meeting / MeetingSeries
       ↓
MeetingOccurrence
```

Outcome/attendance must reference exact occurrence.

Do not attach occurrence-specific outcome to the whole series.

---

## Scheduling revision

Reschedule should preserve schedule history or revision evidence.

Example:

```text
Occurrence O1
scheduled initially 10:00
rescheduled to 11:00
```

should remain auditable/reconstructable.

---

## Timezone normalization

Store timestamps in canonical absolute form plus relevant timezone/calendar context.

Do not persist only:

```text
3:00 PM
```

without timezone.

---

## DST safety

Recurring Meetings especially require provider/calendar-aware timezone semantics.

---

## Participant persistence

Participant relationships should preserve:

* participant reference,
* exact invite/address snapshot where necessary,
* invitation state,
* RSVP,
* attendance.

---

## RSVP update idempotency

Provider callback/sync can repeat.

Repeated:

> Accepted

must not create duplicate participant response records.

---

## RSVP event history

Where useful, preserve response changes:

```text
Tentative
→ Accepted
```

rather than only current state if historical reconstruction matters.

---

## Attendance recording

Attendance is an internal/event-result update.

It should not overwrite RSVP.

---

## Attendance concurrency

Two users updating attendance simultaneously should use revision/concurrency control.

---

## Provider calendar sync

Canonical architecture:

```text
Meeting
   ↓
ExternalCalendarEventLink
   ↓
Provider Adapter
```

Provider adapter handles:

* create,
* update,
* cancel,
* reconcile,
* webhook normalization.

---

## Provider adapter ≠ Meeting repository

Permanent.

---

## Calendar sync idempotency

Repeated scheduler/provider events must reuse the same external-event linkage rather than creating duplicate calendar events.

---

## Provider event IDs

Namespace by:

```text
provider
connection/account
calendar
providerEventId
```

as needed.

---

## Provider conflict detection

If internal and provider sides both changed:

surface a conflict according to policy.

Do not silently last-write-wins sensitive schedule changes.

---

## Provider webhook replay

Provider callbacks should be:

* authenticated,
* deduplicated,
* tenant-bound,
* replay-safe.

---

## Meeting cancellation

Cancelling should:

1. validate Meeting state;
2. preserve Meeting history;
3. cancel/update provider representation when applicable;
4. retain participant history;
5. cancel future applicable reminders;
6. emit event/Audit.

It must not delete the Meeting.

---

## Meeting completion

Use explicit command:

```text
completeMeeting(meetingId/occurrenceId)
```

with validated state.

This only records Meeting occurrence completion.

It does **not** automatically imply:

* outcome recorded,
* FollowUp created,
* Lead qualified,
* Deal advanced.

---

## MeetingOutcome service

Prefer narrow operations:

```text
createMeetingOutcome()
updateOutcomeDraft()
finalizeMeetingOutcome()
correctMeetingOutcome()
```

or equivalent.

---

## Outcome revision/concurrency

Outcome records should use expected revision or append/supersede semantics.

Two reviewers cannot silently overwrite each other.

---

## Outcome finalization

Finalizing should record:

* exact occurrence,
* actor,
* time,
* structured outcome,
* summary/evidence references,
* requested downstream actions.

---

## Outcome data ≠ hidden multi-domain mutation

Recording:

> Interested — wants proposal

must not itself patch:

* Lead,
* Deal,
* Task.

Downstream actions remain explicit.

---

## Post-meeting action orchestration

Conceptually:

```text
MeetingOutcome
      ↓
MeetingOutcomeActionOrchestrator
      ├── FollowUpService
      ├── TaskService
      ├── LeadService
      └── DealService
```

Each action calls canonical domain services.

---

## Action idempotency

Submitting Outcome twice must not create:

* two identical FollowUps,
* two Tasks,
* repeated Deal stage transitions.

Use stable OutcomeAction identity/idempotency keys.

---

## OutcomeActionReference

Useful conceptual linkage:

```text
OutcomeActionReference
├── meetingOutcomeId
├── actionType
├── targetEntityId
├── command/request identity
└── result state
```

This is action lineage, not duplicated source state.

---

## Partial downstream actions

Example:

```text
Outcome finalized        ✓
Lead qualification       ✓
FollowUp creation        ✓
Deal stage update        ✕
```

The Meeting Outcome remains finalized.

Deal action is explicitly failed/retryable.

Do not report ambiguous full success.

---

## Distributed transaction boundary

Do not create one database transaction spanning Meeting + Lead + Deal + Task if domains/services are separate.

Use:

* source-domain transactions,
* durable outbox/command orchestration,
* idempotent action execution.

---

## Lead action

Meeting Outcome can request:

```text
LeadService.changeStatus(...)
LeadService.updateQualification(...)
```

only through canonical Lead policies.

---

## Deal action

Likewise:

```text
DealService.changeStage(...)
```

with current Deal revision/state validation.

---

## Meeting Outcome cannot bypass Design 096

Future Deal Qualification/Stage detail should use the same Deal rules.

Design 094 is only one potential evidence/action origin.

---

## FollowUp creation

A created FollowUp should preserve source linkage to:

* Meeting,
* Outcome,
* Lead/Contact/Deal context as appropriate.

Design 095 should later consume exactly this canonical FollowUp.

---

## Task creation

Same for Task source linkage.

---

## Notes

If notes exist, use a typed contextual Note service rather than mutable `meeting.notes` blob.

---

## Transcript/recording, if present

Should reference canonical Asset/File/Media infrastructure with separate:

* access,
* processing,
* retention.

Never store large media directly inside Meeting row.

---

## Activity projection

Meeting activity should be built from source events.

Every Activity row should preserve:

```text
sourceType
sourceId
sourceEventId
occurredAt
safe actor
safe summary
```

---

## Notification integration

Events can include:

```text
MeetingScheduled
MeetingRescheduled
MeetingCancelled
MeetingCompleted
MeetingOutcomeRecorded
MeetingOutcomeActionFailed
FollowUpCreatedFromMeeting
```

and feed Design 080 where notification rules require.

Notification failure never rolls back Meeting/Outcome.

---

## Search integration

Design 079 may index safe Meeting metadata if frozen search supports Meetings.

Do not index:

* sensitive internal outcome notes,
* transcripts,
* confidential Deal context

without explicit authorization policy.

---

## Audit

Material user actions should include:

```text
MeetingCreated
MeetingRescheduled
MeetingCancelled
ParticipantsChanged
AttendanceRecorded
MeetingCompleted
MeetingOutcomeRecorded
MeetingOutcomeCorrected
```

with safe metadata.

Source-domain Lead/Deal/Task mutations remain audited in their own domains.

---

## Caching

MeetingDetail cache should vary by:

```text
organizationMembershipId
meetingId
occurrenceId
authorization revision
meeting revision
participant revision
outcome revision
related-section revisions
```

Never only Meeting ID.

---

## Performance

Use:

* batched participant lookup,
* safe Contact/Company summaries,
* summary Lead/Deal adapters,
* lazy Activity,
* paginated notes/history where needed.

Do not N+1 fetch every participant and related entity.

---

## Partial failure contract

Example:

```text
Meeting core        ✓
Participants        ✓
Calendar sync       ✕
Lead context        ✓
Deal context        ✕
Outcome             ✓
FollowUps           ✓
Tasks               ✓
Activity            ✓
```

Return:

> Meeting available; calendar sync and Deal context unavailable.

Not:

> Meeting not found.

---

## Backend Requirement Matrix

| Requirement                                    | Status                               |
| ---------------------------------------------- | ------------------------------------ |
| Canonical Meeting reuse from 015               | **Critical**                         |
| Meeting/Occurrence separation                  | **Critical where recurrence exists** |
| Meeting/CalendarEvent separation               | **Critical**                         |
| Meeting/provider-event separation              | **Critical**                         |
| Provider sync not source of business identity  | **Critical**                         |
| MeetingParticipant first-class                 | **Critical**                         |
| Participant/Contact separation                 | **Critical**                         |
| RSVP/Attendance separation                     | **Critical**                         |
| Planned/actual interaction separation          | **Required where captured**          |
| Reschedule/cancel/no-show separation           | **Critical**                         |
| Exact occurrence outcome binding               | **Critical**                         |
| Meeting/MeetingOutcome separation              | **Critical**                         |
| Completed/Outcome recorded separation          | **Critical**                         |
| Outcome revision/history                       | **Critical**                         |
| MeetingOutcome/LeadStatus separation           | **Critical**                         |
| MeetingOutcome/Qualification separation        | **Critical**                         |
| MeetingOutcome/DealStage separation            | **Critical**                         |
| Note/Outcome separation                        | **Critical**                         |
| Transcript/Outcome separation                  | **Critical if transcript exists**    |
| FollowUp/Meeting separation                    | **Critical**                         |
| FollowUp/Task separation                       | **Critical**                         |
| Canonical FollowUp creation                    | **Critical**                         |
| Canonical Task creation                        | **Critical**                         |
| Lead action through LeadService                | **Critical**                         |
| Deal action through DealService                | **Critical**                         |
| Post-meeting action idempotency                | **Critical**                         |
| Partial downstream-action results              | **Critical**                         |
| No generic cross-domain mega-PATCH             | **Critical**                         |
| Durable action orchestration                   | **Required**                         |
| Participant/RSVP provider sync idempotency     | **Critical**                         |
| Calendar provider webhook replay safety        | **Critical**                         |
| Provider conflict handling                     | **Critical**                         |
| Timezone/DST correctness                       | **Critical**                         |
| Client-safe Meeting projection reuse from 046  | **Critical**                         |
| Section-level authorization                    | **Critical**                         |
| Outcome/notes/transcript sensitive permissions | **Critical**                         |
| Meeting core survives related service failure  | **Critical**                         |
| Partial composition state                      | **Critical**                         |
| Permission-safe caching                        | **Critical**                         |
| Audit integration                              | **Required**                         |
| Design 080 Notification reuse                  | **Required**                         |
| Design 079 safe search reuse                   | **Required if indexed**              |
| Design 095 FollowUp reuse                      | **Critical architecture**            |
| Design 096 Deal-stage reuse                    | **Critical architecture**            |

---

# 8. Consolidation

Design 094 exposes significant risks if scheduling, participation, outcome and Sales state are collapsed.

**Meeting / MeetingDetailView conflation**
Read composition becomes another Meeting backend.

**Meeting / CalendarEvent conflation**
External calendar provider becomes business source of truth.

**Meeting / ProviderEvent conflation**
Provider callback mutates business identity directly.

**Provider calendar deletion / Meeting deletion conflation**
External mistake destroys CRM history.

**Calendar sync failure / Meeting failure conflation**
Integration outage makes valid Meeting disappear.

**Meeting / occurrence conflation**
Recurring-series state overwrites one specific interaction.

**Series outcome / occurrence outcome conflation**
One meeting result appears to apply to every recurrence.

**Scheduled time / actual interaction time conflation**
Late/short meeting rewrites planning history.

**Rescheduled / cancelled conflation**
Timing change incorrectly closes Meeting.

**Cancelled / no-show conflation**
Operational meaning is lost.

**MeetingParticipant / Contact conflation**
Every invitee becomes CRM Contact automatically.

**Participant / RSVP conflation**
Being invited means accepted.

**RSVP / Attendance conflation**
Accepted invite is reported as attended.

**Declined RSVP / Meeting cancellation conflation**
One invitee cancels entire interaction.

**Organizer / owner conflation**
Calendar organizer becomes CRM responsibility owner.

**Organizer / authorization conflation**
Invite creator gains unrelated CRM permissions.

**Meeting / Lead conflation**
Interaction lifecycle becomes Sales lifecycle.

**Meeting completed / Lead qualified conflation**
Attending a call automatically changes qualification.

**Meeting completed / Deal stage advance conflation**
Calendar completion advances pipeline.

**MeetingOutcome / Meeting status conflation**
Completed interaction cannot be represented without outcome.

**Outcome not captured / Meeting incomplete conflation**
Meeting is incorrectly left open operationally.

**MeetingOutcome / LeadStatus conflation**
Meeting disposition directly overwrites CRM lifecycle.

**MeetingOutcome / Qualification conflation**
Outcome phrase becomes qualification state automatically.

**MeetingOutcome / DealStage conflation**
“Interested” moves Deal to Proposal without governed command.

**Positive outcome / Deal won conflation**
Interest becomes commercial close.

**Negative outcome / Lead deletion conflation**
Historical prospect identity disappears.

**Outcome / FollowUp conflation**
Writing “follow up” creates no real work object.

**Outcome / Task conflation**
Action item is embedded inside outcome text.

**FollowUp / Task conflation**
Relationship action and internal task become one entity.

**FollowUp created / FollowUp completed conflation**
Creation is reported as completed work.

**MeetingOutcome / Note conflation**
Freeform notes become formal business decisions.

**Note / transcript conflation**
Internal annotation becomes verbatim meeting record.

**Transcript / OutcomeDecision conflation**
Recorded speech becomes authorized CRM action.

**AI summary / human decision conflation**
Generated interpretation gains mutation authority.

**Outcome correction / historical rewrite conflation**
Original reviewer outcome disappears.

**Current Contact profile / historical attendee evidence conflation**
Old Meeting appears to involve new title/email.

**Current Company name / historical Meeting evidence conflation**
Interaction history is rewritten after rename.

**Meeting access / Contact PII access conflation**
Scheduler sees private CRM details.

**Meeting access / Deal-value access conflation**
Participant sees confidential opportunity value.

**Meeting outcome permission / Lead mutation permission conflation**
Reviewer changes Sales lifecycle without authority.

**Meeting outcome permission / Deal mutation permission conflation**
Meeting recorder advances Pipeline.

**Participant management / Contact management conflation**
Adding invitee edits CRM person.

**Provider connection admin / Meeting outcome authority conflation**
Calendar administrator changes Sales decisions.

**External RSVP / platform authorization conflation**
Invite recipient gains application access.

**Outcome finalize / all side effects success conflation**
Failed Deal update is hidden behind “Meeting saved.”

**Task service failure / Outcome failure conflation**
Valid outcome is lost.

**Deal service failure / Meeting failure conflation**
Meeting disappears because opportunity system is unavailable.

**No Deal / Deal service unavailable conflation**
User sees false “No deal.”

**No FollowUp / FollowUp service unavailable conflation**
System falsely shows no action needed.

**Provider sync status / Meeting lifecycle conflation**
Unsynced Meeting appears cancelled.

**Provider callback last-write-wins**
Older schedule state overwrites newer state.

**Timezone / local wall-clock conflation**
Meetings shift incorrectly across DST.

**Meeting Detail mega-record**
Participants, CRM, Deal, Task and Outcome become stale copied JSON.

**Generic MeetingDetail PATCH**
One endpoint mutates Meeting, Deal, Lead and Tasks directly.

**Distributed mega-transaction**
Recording an outcome depends on every downstream service succeeding.

**Cache by Meeting ID only**
Sensitive outcome/Deal data leaks to users with fewer permissions.

**094/015 duplicate Meeting backend**
Meeting workspace and detail use different Meeting records.

**094/035 duplicate Calendar model**
Meeting detail invents another calendar event system.

**094/046 duplicate Portal Meeting model**
Client and Team see unrelated Meeting identities.

**094/089 duplicate Lead state**
Meeting outcome starts owning qualification/status.

**094/017 duplicate Deal stage**
Meeting detail becomes second Deal workflow.

**094/034 duplicate Task backend**
Meeting action items become private checklist rows.

**094/095 duplicate FollowUp backend**
Meeting-specific follow-ups diverge from Follow-up Queue.

No additional screen is required.

These are **Meeting identity, recurrence/occurrence, calendar synchronization, participant response, attendance, outcome governance, downstream actioning, historical interaction evidence, authorization and partial-failure requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL MEETING DETAIL, OCCURRENCE, OUTCOME & GOVERNED POST-MEETING ACTION ANCHOR**

**Domain directive:**
**Meeting ≠ MeetingOccurrence ≠ CalendarEvent/ProviderEvent ≠ MeetingParticipant ≠ RSVP ≠ Attendance ≠ MeetingOutcome ≠ OutcomeDecision ≠ Note/Transcript ≠ FollowUp ≠ Task ≠ Lead/Contact/Company/Deal ≠ ActivityEvent.**

**Identity directive:**
Design 015 remains the sole canonical Meeting identity foundation. Design 094 composes detail/outcome context around that Meeting rather than introducing a separate SalesMeeting/CompletedMeeting entity.

**Occurrence directive:**
where recurrence exists, occurrence-specific schedule, attendance and outcome bind to the exact MeetingOccurrence rather than the entire recurring Meeting/series.

**Scheduling directive:**
planned schedule, reschedule history and actual interaction timing remain distinguishable. Reschedule, cancel and no-show must never collapse into one condition.

**Calendar directive:**
Design 035 remains canonical scheduling/provider integration architecture. External CalendarEvents/ProviderEvents are synchronization representations and never replace internal Meeting identity.

**Provider-sync directive:**
provider callbacks are verified, tenant-bound, idempotent and conflict-aware. Provider deletion/outage/sync failure never automatically deletes or fails the Meeting.

**Timezone directive:**
meeting timestamps and recurrence use explicit timezone/DST-safe semantics rather than ambiguous local wall-clock strings.

**Participant directive:**
MeetingParticipant is an explicit relationship around the Meeting. Team Users, Contacts, Client contacts and external invitees remain independent identities and are never created/merged solely from participant strings.

**RSVP directive:**
invitation response remains distinct from actual attendance. `Accepted` never means `Attended`, and `Declined` never means the entire Meeting was cancelled.

**Attendance directive:**
actual attendance is occurrence evidence and remains separate from Meeting lifecycle and Outcome.

**Outcome directive:**
MeetingOutcome is a first-class, occurrence-bound, revision-aware record describing what happened and what was concluded. It is not merely `meeting.status`.

**Completion directive:**
Meeting completion and Outcome recording remain independent. A Meeting may be completed while its outcome is still pending.

**Correction directive:**
material correction of an Outcome preserves prior history through revision/supersession rather than silently rewriting what the original reviewer recorded.

**Lead directive:**
Meeting Outcome may inform Lead decisions but never directly becomes LeadStatus or Qualification. Any Lead mutation must go through the canonical Lead service and permissions.

**Deal directive:**
Meeting Outcome may inform Deal decisions but never directly becomes DealStage. Any Deal change uses the canonical Deal state machine and remains separately audited.

**Conversion directive:**
a positive Meeting Outcome never means Deal won, Client created or Lead converted automatically. Those remain explicit downstream domain transitions.

**Note directive:**
Meeting Notes remain authored contextual records and must not automatically become formal MeetingOutcome or source-domain business decisions.

**Transcript directive:**
where transcripts/recordings exist, they remain separate evidence/assets with their own permission and retention. Transcript content or automated summaries never gain business mutation authority by themselves.

**Follow-up directive:**
post-meeting relationship work creates a canonical FollowUp referencing the Meeting/Outcome. Design 095 must consume that exact FollowUp identity.

**Task directive:**
internal post-meeting work creates canonical Design 034 Tasks. Outcome text never substitutes for Task lifecycle.

**Action directive:**
post-meeting actions are explicit, source-specific and idempotent. Lead, Deal, FollowUp and Task changes use their own domain services instead of direct Meeting-table side effects.

**Partial-action directive:**
Outcome persistence and downstream actions remain separately observable. If the Outcome saves while a Deal update fails, the valid Outcome remains intact and the Deal action is explicitly failed/retryable.

**Transaction directive:**
Design 094 is not a distributed mega-transaction boundary. Meeting Outcome should persist independently, while cross-domain actions use durable, idempotent orchestration.

**Historical-evidence directive:**
later Contact email/title/employer changes, Company renames, Deal progression and Lead conversion never rewrite historical Meeting participant, schedule, attendance or Outcome evidence.

**Authorization directive:**
Meeting read/edit, participant management, Outcome access/editing, Notes/transcripts, Calendar integration, Lead mutation, Deal mutation, FollowUp creation and Task creation remain independently server-authorized.

**Portal directive:**
Design 046 continues to expose a client-safe projection of the canonical Meeting. Internal Outcome, Notes, CRM data and Deal context must never leak merely because the client is a participant.

**Activity directive:**
Meeting Activity is a source-referenced operational projection. It does not replace Meeting, Outcome, Task, FollowUp or Design 039 Audit truth.

**Notification directive:**
Design 080 may notify about Meeting timing, changes, missing Outcomes or resulting work, but notification read/dismissal never changes Meeting/Outcome state.

**Partial-failure directive:**
Meeting core, participant data, provider sync, Lead/Deal context, Outcome, FollowUps, Tasks and Activity can fail independently. A related service failure must never make the canonical Meeting appear missing or falsely empty.

**Caching directive:**
Meeting detail caches vary by OrganizationMembership, authorization revision, occurrence, Meeting revision, participant revision, Outcome revision and related-source revisions. Meeting ID alone is insufficient.

**Performance directive:**
use batched participant/context summaries, source-specific projections and lazy history/Activity instead of repeatedly loading complete Contact/Company/Deal histories.

**Audit directive:**
schedule changes, cancellation, participant changes, attendance recording, Meeting completion, Outcome capture and Outcome corrections create appropriate Audit evidence; Lead/Deal/Task mutations remain audited by their own domains.

**Future-reuse directive:**
Design 095 must reuse canonical FollowUps created from Meetings, Replies, Leads and other valid sources rather than introducing Meeting-specific follow-up objects. Design 096 must continue to own Deal qualification/stage decisions even when Meeting Outcome supplies evidence.

**Overlap directive:**
Designs **015, 034–035, 046, 080, 087, 089, 093–096** must ultimately share one continuous **Meeting → Occurrence → Participants/Attendance → Outcome → Explicit FollowUp/Task/Lead/Deal Action** lineage while preserving Calendar provider state, CRM entities, work records and business lifecycles independently.

**Consolidation directive:**
**STANDARDIZE ONE MEETING OUTCOME FOUNDATION — CANONICAL MEETING IDENTITY + OPTIONAL EXACT MEETINGOCCURRENCE + PROVIDER-INDEPENDENT CALENDAR LINKAGE + EXPLICIT MEETINGPARTICIPANTS + SEPARATE RSVP/ATTENDANCE + REVISION-AWARE MEETINGOUTCOME + DISTINCT NOTES/TRANSCRIPT EVIDENCE + IDEMPOTENT OUTCOMEACTION REFERENCES + CANONICAL FOLLOWUP/TASK CREATION + GOVERNED LEAD/DEAL COMMANDS + PARTIAL-FAILURE-AWARE DETAIL COMPOSITION — AND NEVER ALLOW CALENDAR PROVIDER STATE, ACCEPTED INVITES, MEETING COMPLETION, FREEFORM NOTES OR OUTCOME LABELS TO SILENTLY BECOME ATTENDANCE, SALES QUALIFICATION, DEAL STAGE, CLIENT CONVERSION OR WORK COMPLETION.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **94 / 153** |
| **PASS**                                   |                         **94** |
| **STANDARDIZE decisions**                  |                         **92** |
| **Potential implementation-overlap flags** |                         **85** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**94 / 153 = 61.4% audited.**

### Canonical Meeting architecture after Design 094

```text
                         MEETING
                    canonical identity
                           │
                           ↓
                  MeetingOccurrence
                  where applicable
                           │
            ┌──────────────┼──────────────┐
            ↓              ↓              ↓
      Participants       Schedule      Calendar Link
            │                              │
      ┌─────┴─────┐                        ↓
      ↓           ↓                   Provider Event
    RSVP       Attendance             integration only
            │
            └──────────────┐
                           ↓
                    MeetingOutcome
                           │
              ┌────────────┼────────────┐
              ↓            ↓            ↓
          FollowUp        Task      Explicit Sales Action
                                         │
                                    ┌────┴────┐
                                    ↓         ↓
                                  Lead       Deal
```

The most important Meeting rule is:

```text
Meeting = COMPLETED
        ≠
Outcome = RECORDED
        ≠
FollowUp = CREATED
        ≠
Lead = QUALIFIED
        ≠
Deal = ADVANCED
```

Each is a separate state or explicit operation.

Likewise:

```text
RSVP = ACCEPTED
        ≠
ATTENDED

and

RSVP = DECLINED
        ≠
MEETING CANCELLED
```

The downstream-action boundary is also now strict:

```text
MeetingOutcome recorded               ✓
FollowUp created                       ✓
Task created                           ✓
Lead qualification updated            ✓
Deal stage update                      ✕

RESULT:
Meeting Outcome remains valid.
Successful actions remain valid.
Deal action is explicitly failed/retryable.

NOT:
roll everything back

and NOT:
mark everything "successful."
```

## Next Sequential Audit Target

### **Design 095 — Follow-up Queue / Follow-up Detail Workspace**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
