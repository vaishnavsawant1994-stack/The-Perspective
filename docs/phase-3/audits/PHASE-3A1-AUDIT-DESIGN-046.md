# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 046 — Meetings

Design 046 should become the **canonical Client Portal meeting workspace** for meetings that an authenticated Client Portal member is explicitly authorized to see or participate in.

It must reuse the canonical Meeting and scheduling infrastructure established by Designs **015 and 035**, while exposing a deliberately simplified **Client-safe Meeting projection**. Internal follow-ups, staff notes, private attendees, CRM outcomes, calendar-provider diagnostics, sales context, and internal scheduling metadata must remain outside the Client Portal.

| Audit field                         | Classification                                                                                                                                                               |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                       | **046**                                                                                                                                                                      |
| **Canonical name**                  | **Meetings**                                                                                                                                                                 |
| **Product area**                    | Client Portal / Communication / Scheduling                                                                                                                                   |
| **User surface**                    | **Client Portal**                                                                                                                                                            |
| **Screen class**                    | Client-Safe Meeting Collection / Scheduling Workspace                                                                                                                        |
| **Classification**                  | **Portal Workspace Variant — Client Meeting & Scheduling Family**                                                                                                            |
| **Primary purpose**                 | Let authorized Client users understand upcoming/past meetings, Project context, relevant participants, meeting time/location/join information, and permitted meeting actions |
| **Primary canonical entity**        | **Meeting**                                                                                                                                                                  |
| **Primary supporting entities**     | MeetingParticipant, MeetingOccurrence, CalendarConnection/ExternalCalendarEvent, Project, Client, PortalMembership, User                                                     |
| **Related infrastructure**          | Notification, Calendar/Schedule Projection, Audit, Message/Project context                                                                                                   |
| **Parent shell**                    | `ClientPortalShell` — Design 002                                                                                                                                             |
| **Canonical Meeting foundation**    | Design 015 — Meetings & Follow-ups                                                                                                                                           |
| **Canonical Calendar foundation**   | Design 035 — Calendar / Scheduling                                                                                                                                           |
| **Internal Meeting detail overlap** | Design 094 — Meeting Detail / Meeting Outcome Workspace                                                                                                                      |
| **Primary read model**              | `ClientMeetingsView`                                                                                                                                                         |
| **Template family**                 | `ClientPortalCollectionWorkspaceTemplate`                                                                                                                                    |
| **Composition**                     | `ClientMeetingsComposition`                                                                                                                                                  |
| **Auth**                            | Required                                                                                                                                                                     |
| **Authorization**                   | Portal membership + Meeting participation/resource scope                                                                                                                     |
| **Implementation priority**         | **Core Client Collaboration**                                                                                                                                                |
| **Reuse level**                     | **Very High**                                                                                                                                                                |

The governing invariant is:

> **Meeting ≠ Calendar Event ≠ Meeting Occurrence ≠ Follow-up ≠ Task ≠ Project Milestone.**

---

# 1. Classification — Functional Responsibility

Design 046 should answer:

> **“Which meetings are relevant to me, when are they, which Project/account do they relate to, who am I meeting with, how do I join, and what Client-facing actions are available?”**

Canonical architecture:

```text
Canonical Meeting Domain
Design 015
      │
      ├── Meeting
      ├── Participants
      ├── Recurrence / Occurrence
      ├── Provider/calendar relationship
      └── Meeting lifecycle
             ↓
Calendar / Scheduling Infrastructure
Design 035
             ↓
Client-safe Meeting Projection
             ↓
Portal Membership + Meeting Entitlement
             ↓
Design 046 — Meetings
```

Design 046 therefore does **not** create its own Client-specific scheduling engine.

---

# 2. Reuse — Design 015 vs Design 046

### Design 015 — Internal Meetings & Follow-ups

May contain:

* CRM Contact/Lead/Deal context,
* internal owner,
* meeting outcome,
* next Follow-up,
* sales notes,
* internal Tasks,
* meeting disposition,
* internal participants.

### Design 046 — Client Meetings

Should expose only:

* Client-relevant meeting identity,
* authorized Project/account context,
* safe participants,
* time/date/timezone,
* location or join method,
* Client-safe status,
* permitted actions.

Correct:

```text
Meeting
   ├── Internal Meeting Projection — 015
   └── Client Meeting Projection   — 046
```

One canonical Meeting record.

---

# 3. Meeting ≠ Calendar Event

Design 035 already established this permanent rule.

A provider event from:

* Google Calendar,
* Microsoft 365,
* Outlook,

is not automatically the canonical business Meeting.

Conceptually:

```text
Meeting
   ↓
ExternalCalendarEventMapping
   ↓
Google / Microsoft / other provider
```

The canonical application record must not depend entirely on one provider's event object.

---

# 4. External event ≠ Client Meeting automatically

An internal employee may have hundreds of calendar events.

They must **not** become Client-visible simply because:

```text
client email exists in attendee list
```

Client visibility should require an intentional Meeting/participant relationship.

---

# 5. Meeting ≠ Follow-up

Design 015's distinction remains:

```text
Meeting
≠
FollowUp
```

A follow-up created after a meeting could be:

* internal,
* Client-facing,
* a Task,
* a Client Request.

Design 046 should not expose internal sales follow-up queues.

---

# 6. Meeting ≠ Task

Example:

```text
Meeting:
Quarterly Strategy Review

Internal Task:
Prepare campaign analytics
```

The Client can see the Meeting without seeing the internal preparation Task.

---

# 7. Meeting ≠ Project milestone

A meeting may occur around:

> Final Design Review

but that does not make the Meeting itself the Project milestone.

Design 044 continues to own Client Project Timeline/Progress.

---

# 8. Meeting can be Project-related

A canonical Meeting can optionally reference:

```text
Project
Client / Account
Contract
Support Request
other approved business context
```

The relationship should be structured.

Avoid relying only on:

> Subject: “Meeting about magazine project.”

---

# 9. Client Portal participant must be explicit

A Portal member should see a Meeting because they are authorized through:

```text
ClientPortalMembership
+
MeetingParticipant / resource entitlement
```

not merely because they belong to the same Client company.

---

# 10. Same Client ≠ same Meeting visibility

Example:

```text
CEO
→ Executive review

Marketing Director
→ Editorial review

Finance Contact
→ Billing discussion
```

All may belong to the same Client organization but see different Meetings.

---

# 11. MeetingParticipant

Conceptually:

```text
MeetingParticipant
├── meetingId
├── participant type
├── identity reference
├── attendance role
├── invitation/responded state
└── visibility metadata where required
```

Exact schema belongs to Phase 3D.

---

# 12. Participant identity types

Potential actor types may include:

```text
INTERNAL_USER
CLIENT_PORTAL_MEMBER
EXTERNAL_GUEST
```

where the actual product supports them.

Do not assume all attendees are internal `User` rows.

---

# 13. CRM Contact ≠ Meeting participant automatically

A CRM Contact record does not itself grant Portal Meeting access.

Where Contact and Portal identity are linked:

```text
Contact
   ↓ controlled identity link
ClientPortalMembership
   ↓
MeetingParticipant
```

Authorization still comes from the Portal context.

---

# 14. Organizer ≠ Project owner

A Meeting organizer may be:

* Account Manager,
* Project Lead,
* Client,
* scheduling service.

This remains separate from canonical Project ownership.

---

# 15. Internal attendee ≠ Client-visible participant

A meeting may internally include:

* Account Manager,
* Editor,
* Production Lead,
* Finance observer.

The Client-facing participant list should expose only approved participants.

Do not return the entire internal attendee roster automatically.

---

# 16. Safe internal participant projection

Client-visible internal participants should reuse Design 036 via a constrained projection containing only appropriate information such as:

```text
display name
approved role/title
profile image
```

Never:

* internal Role,
* Department details,
* workload,
* employee metadata.

---

# 17. Upcoming vs Past

Design 046 can naturally present:

```text
Upcoming Meetings
Past Meetings
```

as query/view categories.

These are not separate Meeting tables.

---

# 18. Meeting lifecycle ≠ temporal category

A Meeting might have lifecycle:

```text
SCHEDULED
CANCELLED
COMPLETED
```

while UI temporal condition is:

```text
UPCOMING
TODAY
PAST
```

Keep those dimensions separate.

---

# 19. Scheduled ≠ upcoming

A cancelled Meeting scheduled for tomorrow is not simply:

> Upcoming.

Lifecycle state must be considered before presentation.

---

# 20. Completed ≠ past automatically

A Meeting whose scheduled time passed may have:

```text
status = SCHEDULED
```

because outcome processing has not happened.

Do not have the browser automatically mutate it to Completed based only on current time.

---

# 21. Cancelled ≠ deleted

A cancelled Client Meeting should retain historical context where appropriate.

```text
Cancelled
≠
Removed from history
```

Do not hard-delete the Meeting solely because it was cancelled.

---

# 22. Rescheduled Meeting

Rescheduling should preserve schedule history.

Conceptually:

```text
Original:
Aug 21, 3:00 PM

Revised:
Aug 23, 4:30 PM
```

The system should not behave as though the first schedule never existed.

---

# 23. Reschedule ≠ new unrelated Meeting necessarily

If the business considers it the same Meeting:

```text
Meeting
   ↓
schedule revision
```

is preferable to creating duplicate Meeting identities.

Exact recurrence/reschedule semantics belong to Phase 3D.

---

# 24. Meeting occurrence

Recurring meetings need:

```text
Meeting Series
      ↓
MeetingOccurrence
```

or equivalent recurrence semantics.

Editing one occurrence should not accidentally rewrite the entire series.

---

# 25. Recurring series ≠ occurrence

Permanent rule:

```text
Meeting Series
≠
Occurrence
```

The Portal must correctly display:

> This meeting only

versus:

> Entire recurring series

where such actions are supported.

---

# 26. Timezone correctness

Meetings are especially sensitive to timezone errors.

Canonical data must retain:

* start instant,
* end instant,
* timezone context,
* all-day semantics if relevant.

Do not save only:

```text
"3:00 PM"
```

without timezone context.

---

# 27. Organization timezone ≠ Meeting timezone

Design 040's Organization timezone is a default.

A Meeting may explicitly occur in another timezone.

Changing organization settings must not reinterpret existing Meeting times.

---

# 28. Client display timezone

The Portal may display the Meeting in the Client user's preferred timezone.

But where ambiguity matters, show enough timezone context so:

> 3:00 PM

cannot be misunderstood.

---

# 29. DST must be handled by timezone identifiers

Use proper timezone semantics such as IANA zones.

Avoid manually maintaining offsets such as:

```text
UTC+5:30
```

for regions where daylight-saving behavior can vary.

---

# 30. All-day/date-only semantics

If a Meeting-like event is date-only, preserve date-only semantics.

Do not convert:

```text
September 3
```

to midnight UTC and accidentally show a different date.

---

# 31. Start ≠ end

Store both accurately.

Meeting duration should derive from:

```text
endAt - startAt
```

not a separately maintained string such as:

> “60 minutes”

unless that is a convenience field.

---

# 32. Join information

For virtual meetings, Design 046 may expose:

```text
join URL
provider label
Meeting ID where safe/needed
```

according to frozen UX.

Access must be restricted to authorized participants.

---

# 33. Join URL can be sensitive

A conference URL can effectively function as access information.

Do not expose it in:

* public APIs,
* unauthenticated previews,
* unrelated Client users.

---

# 34. Provider credentials ≠ Meeting join information

The Client may receive:

> Join Zoom Meeting.

They should never receive:

* OAuth token,
* provider account ID where unnecessary,
* API credentials,
* webhook metadata.

---

# 35. Physical location

If a Meeting is in-person, location information should be explicitly safe and relevant.

Internal office resource IDs or room-booking metadata do not need to be exposed.

---

# 36. Meeting agenda

If the frozen design presents an agenda:

it should be a deliberate Client-visible field/content.

Do not reuse internal staff preparation notes.

---

# 37. Agenda ≠ internal notes

Example:

### Client-visible agenda

> Review final magazine cover and publication schedule.

### Internal note

> Push for premium distribution upgrade.

These must remain separate.

---

# 38. Meeting notes

Post-meeting notes can contain highly sensitive internal information.

Do **not** expose internal MeetingOutcome/notes automatically.

If Client-visible summary/minutes exist, they should be a separate safe artifact/projection.

---

# 39. Meeting outcome ≠ Client minutes

Internal outcome:

```text
Positive
Decision maker confirmed
Potential upsell
```

Client minutes:

```text
Cover approved
Final images due Friday
```

Different audiences and purposes.

---

# 40. Design 094 relationship

Later:

**Design 094 — Meeting Detail / Meeting Outcome Workspace**

This is a major internal overlap point.

Expected architecture:

```text
Canonical Meeting
      │
      ├── Design 046
      │   Client-safe Meeting workspace
      │
      └── Design 094
          Internal Meeting Detail / Outcome
```

One Meeting domain.

Different projections.

**DO NOT MERGE THE SCREENS.**

---

# 41. Meeting outcome remains internal-domain truth

Design 094 may own richer:

* outcome,
* CRM impact,
* next actions,
* sales disposition.

Design 046 should not duplicate that operational logic.

---

# 42. Design 035 relationship

Design 035's `ScheduleEntry` remains a projection over Meetings and other scheduled objects.

Design 046 consumes canonical Meeting scheduling.

It does not create a Client-specific Calendar database.

---

# 43. Client Meetings ≠ Client Calendar necessarily

Design 046 can present Meetings in list/card/calendar-like layouts if frozen.

That does not justify creating:

```text
ClientCalendarEvent
```

as a new business entity.

---

# 44. Design 043 relationship

Client Project Detail may show:

> Next Meeting

Design 046 provides the broader Meetings collection.

Both query the same authorized Meeting set.

---

# 45. Design 044 relationship

An important Meeting can appear in Project Timeline as a Client-safe timeline item.

The source remains the canonical Meeting.

No duplicated timeline Meeting record.

---

# 46. Design 045 relationship

A Meeting can have an associated Client conversation.

But:

```text
Meeting
≠
Conversation
```

A Meeting may deep-link to a related thread where permitted.

Messaging stays Design 045/074.

---

# 47. Design 047 relationship

A Meeting may produce a Client Request such as:

> Upload revised executive headshot.

The Request remains Design 047's source entity.

Do not store required actions as unstructured Meeting notes only.

---

# 48. Design 048–052 relationship

Meetings may discuss:

* Questionnaires,
* Draft Review,
* Design Review,
* Files,
* Approvals.

But those source-domain records remain distinct and deep-linkable.

Meeting participation does not grant automatic permission to them.

---

# 49. Meeting access ≠ Project access expansion

If a Client is invited to one Meeting for Project A, that does not necessarily grant access to all Project A data.

Meeting entitlement and Project entitlement must remain independently evaluable.

---

# 50. Project access ≠ Meeting access automatically

Likewise, a user who can view Project A may not be invited to:

> Executive Contract Review.

Project access alone does not grant every associated Meeting.

---

# 51. Permissions

Potential Phase 3D Client capabilities might include:

```text
portal.meetings.read
portal.meetings.join
portal.meetings.respond
```

and, if supported:

```text
portal.meetings.request_reschedule
portal.meetings.cancel
```

Exact names and available operations depend on the frozen design.

The architecture must separate them.

---

# 52. Read ≠ join

A Client may see:

> Meeting scheduled

without yet receiving a valid join action depending on timing/access policy.

Therefore:

```text
meeting.read
≠
meeting.join
```

where necessary.

---

# 53. Read ≠ reschedule

A participant allowed to attend should not automatically be authorized to move the Meeting.

---

# 54. Reschedule ≠ cancel

Likewise:

```text
meeting.reschedule
≠
meeting.cancel
```

if the product exposes either action.

These are distinct business commands.

---

# 55. Meeting response

If RSVP is supported, participation response should be represented separately:

```text
ACCEPTED
DECLINED
TENTATIVE
NO_RESPONSE
```

or provider-neutral equivalents.

Meeting status itself does not change to Declined just because one attendee declines.

---

# 56. Participant RSVP ≠ Meeting lifecycle

Permanent distinction:

```text
Meeting:
SCHEDULED

Participant:
DECLINED
```

Both can be simultaneously true.

---

# 57. Provider RSVP synchronization

If Google/Microsoft calendar responses sync back:

the backend should reconcile provider state idempotently.

Do not let repeated webhook delivery produce duplicate RSVP events.

---

# 58. Internal provider event ≠ canonical attendee response blindly

External provider responses need identity mapping and Meeting correlation.

Do not attach a provider response to a Meeting solely because event titles match.

---

# 59. Meeting creation

Whether the Client can create/request a Meeting depends entirely on the frozen interaction design.

This audit does **not** add a new:

> Schedule Meeting

capability if it is not already present.

Architecture should simply avoid blocking such behavior if later confirmed.

---

# 60. Scheduling request ≠ confirmed Meeting

If Clients can request a meeting:

```text
MeetingRequest
≠
Confirmed Meeting
```

may be required.

But we do not introduce a separate business entity unless the frozen workflow requires it.

---

# 61. Notification integration

New, changed, or cancelled meetings can generate Notifications.

Example:

```text
Meeting rescheduled
      ↓
Client Notification
```

Notification is delivery/attention.

The Meeting remains the source truth.

---

# 62. Notification read ≠ Meeting viewed

Opening a Notification does not necessarily equal:

> Client reviewed Meeting details.

These states remain separate.

---

# 63. Email/calendar invitation delivery

Provider invitation/email can be a delivery mechanism.

The canonical Meeting must remain available in the Portal independent of provider notification state.

---

# 64. Invitation sent ≠ delivered ≠ accepted

Do not collapse:

```text
Invitation created
Invitation delivered
Participant accepted
```

into a single Boolean.

---

# 65. Calendar connection failure

If calendar-provider sync fails:

the canonical Meeting may still exist.

Correct state:

> Meeting is scheduled; calendar synchronization is temporarily delayed.

Not:

> Meeting does not exist.

---

# 66. Provider accepted ≠ application synchronized

Likewise, external provider may successfully update while the local sync callback is pending.

Provider and application synchronization state should be distinguishable internally.

---

# 67. Client-safe errors

Client Portal should not display:

> Google Calendar OAuth token refresh failed.

Use:

> Calendar synchronization is temporarily delayed.

Internal diagnostics belong to Integration/System operations.

---

# 68. Audit integration

Material actions can feed Design 039:

```text
Meeting scheduled
Meeting rescheduled
Meeting cancelled
Client RSVP changed
Participant changed
```

where policy requires.

Audit actor must preserve whether action came from:

* Client Portal member,
* internal user,
* system,
* provider integration.

---

# 69. Meeting activity

Client-safe Activity Design 063 may show:

> Strategy meeting scheduled for September 5.

But Activity does not own the Meeting.

---

# 70. Meeting history survives employee departure

If the internal Account Manager later leaves:

historical Meetings should still show meaningful participant identity.

Do not replace them with:

> Deleted User.

Design 036's historical identity rules apply.

---

# 71. Meeting history survives Client access revocation

Removing a Client Portal membership:

* stops future Meeting access,
* preserves canonical Meeting history.

Access revocation ≠ record deletion.

---

# 72. Search

Design 046 can support server-side search/filtering over authorized Meeting data such as:

* subject/title,
* Project,
* safe participant,
* date range.

The authorized Meeting scope must be applied before search.

---

# 73. Search must not leak meetings

Unauthorized meeting subjects such as:

> Contract Renegotiation

must never appear through autocomplete/search snippets to other Client users.

---

# 74. Filters

Potential query filters according to frozen UI might include:

```text
Upcoming
Past
Project
Meeting type
```

These remain query state.

They are not authorization controls.

---

# 75. Pagination

Historical Client relationships may accumulate many Meetings.

Past meetings should use scalable server-side pagination/cursor loading.

---

# 76. Read model

A useful Client-safe collection result:

```text
ClientMeetingsView
├── current Portal membership
├── authorized upcoming Meetings
├── authorized past Meetings
├── safe Project/account context
├── safe participants
├── start/end/timezone
├── location/join information
├── participant response
├── Client-safe status
├── permitted actions
└── pagination/filter state
```

This is a read model, not another Meeting entity.

---

# 77. ClientMeetingSummary

A compact record can conceptually contain:

```text
ClientMeetingSummary
├── meetingId
├── title
├── Project summary
├── start/end
├── timezone
├── safe participants
├── meeting method/location
├── current safe status
├── current participant response
└── available actions
```

Do not send the complete internal Meeting object.

---

# 78. Mutation boundary

Avoid generic:

```text
PATCH /client/meetings/:id
{
  start,
  status,
  participants,
  notes,
  outcome
}
```

Prefer explicit commands where supported:

```text
respondToMeetingInvitation()
rescheduleMeeting()
cancelMeeting()
```

Each command independently validates:

* actor,
* Meeting state,
* authorization,
* concurrency.

---

# 79. Reschedule command

If Client rescheduling is allowed, use the canonical Meeting command established with Design 035.

Do not update Calendar projection directly.

Correct:

```text
rescheduleMeeting()
      ↓
Meeting
      ↓
Calendar/provider synchronization
```

---

# 80. Calendar drag/drop principle still applies

Even if a future Portal presentation uses Calendar interactions:

moving a Meeting must invoke `rescheduleMeeting()`.

Never directly mutate a generic `ScheduleEntry`.

---

# 81. Concurrency

Example:

```text
Client:
Accepts meeting

At same time:
Account Manager reschedules meeting
```

The backend must reconcile against the authoritative Meeting revision/current occurrence.

---

# 82. Stale join link

If Meeting provider information changes:

old join information should not remain indefinitely cached.

Design 046 should query/version/cache safely around schedule/provider changes.

---

# 83. Permission-safe caching

Cache identity should include at minimum:

```text
Client/Portal account
membership
Meeting entitlement
relevant filters
```

Do not cache all Client meetings once and reuse the result for every Client user.

---

# 84. Partial failure

Example:

```text
Meeting core        ✓
Participant list    ✓
Calendar provider   ✕
Project context     ✓
```

Design 046 remains usable.

Only provider-related features show degraded state.

---

# 85. Unknown ≠ no meetings

If Meeting service fails:

do not show:

> No upcoming meetings.

Display:

> Meetings are temporarily unavailable.

---

# 86. Provider unavailable ≠ Meeting cancelled

If Zoom/Calendar integration is temporarily unavailable:

the Meeting lifecycle should not become Cancelled.

---

# 87. RSVP unavailable ≠ declined

If participant-response sync is delayed:

do not display:

> Declined.

Use:

> Response unavailable / syncing

where required.

---

# 88. Join information unavailable ≠ no virtual meeting

A provider error should not force the UI to claim:

> No meeting link.

Correctly distinguish temporary unavailability.

---

# 89. State coverage

Design 046 inherits Design 150 plus Meeting-specific states such as:

```text
Meetings Loading
Meetings Ready

No Upcoming Meetings
No Past Meetings
No Meetings Matching Filters

Meeting Scheduled
Meeting Completed
Meeting Cancelled
Meeting Rescheduled

Participant Accepted
Participant Declined
Participant Tentative
Response Pending

Meeting Starting Soon
Meeting In Progress where supported

Join Information Available
Join Information Unavailable

Calendar Sync Pending
Calendar Sync Delayed
Provider Unavailable

Meeting Restricted
Meeting Access Revoked

Partial Service Failure
Meeting Updated Elsewhere
```

These are not one Meeting status enum.

---

# 90. Responsive Behavior — Desktop

Desktop should preserve clear scheduling context:

```text
Meetings Header
↓
Upcoming / Past
↓
Search / Filters
↓
Meeting List / Cards
    ├── Meeting title
    ├── Project/account
    ├── Date / Time / Timezone
    ├── Participants
    ├── Location / Join
    ├── RSVP / Status
    └── permitted action
```

Client simplicity remains more important than internal calendar density.

---

# 91. Responsive — Tablet

Following Design 152:

* cards/list reduce columns,
* time and Project remain visible,
* participant list collapses gracefully,
* filters use compact controls,
* join/respond actions retain proper touch size.

---

# 92. Responsive — Mobile

Prioritize:

```text
Meetings
↓
Upcoming
↓
Meeting Card
   ├── Title
   ├── Project
   ├── Date / Time / Timezone
   ├── With whom
   ├── Join / location
   └── Response
↓
Past Meetings
```

The Client should not need horizontal scrolling to understand basic schedule information.

---

# 93. Mobile join safety

For virtual Meetings, the primary join action must be clearly attached to the correct:

* Meeting,
* date/time,
* Project.

Avoid ambiguous repeated:

> Join

buttons with insufficient surrounding context.

---

# 94. Accessibility

Meeting information must have semantic labels for:

* date,
* time,
* timezone,
* cancellation,
* participant response,
* virtual/in-person status.

Do not rely only on:

* calendar icons,
* colored status chips,
* provider logos.

---

# 95. Backend Requirements

| Requirement                            | Status                        |
| -------------------------------------- | ----------------------------- |
| Client Portal authentication           | **Critical**                  |
| Active Portal membership               | **Critical**                  |
| Client/account isolation               | **Critical**                  |
| Meeting-level authorization            | **Critical**                  |
| Canonical Meeting reuse                | **Critical**                  |
| MeetingParticipant model               | **Critical**                  |
| Internal/Client participant separation | **Critical**                  |
| Safe Client Meeting DTO                | **Critical**                  |
| Project/account context                | **Required**                  |
| Meeting lifecycle                      | **Critical**                  |
| RSVP/participant-response state        | **Required if exposed**       |
| Meeting vs CalendarEvent separation    | **Critical**                  |
| Calendar/provider mapping              | **Critical**                  |
| External event correlation             | **Critical**                  |
| Recurrence/occurrence model            | **Required**                  |
| Timezone/DST correctness               | **Critical**                  |
| Date-only semantics                    | **Required where applicable** |
| Planned/current scheduling history     | **Required**                  |
| Join-link access controls              | **Critical**                  |
| Client-safe participant projection     | **Critical**                  |
| Server-side search/filter              | **Required**                  |
| Permission-safe caching                | **Critical**                  |
| Idempotent RSVP/provider sync          | **Critical**                  |
| Concurrency/revision handling          | **Critical**                  |
| Notification integration               | **Required**                  |
| Audit-event integration                | **Required**                  |
| Membership/access revocation           | **Critical**                  |
| Partial provider failure handling      | **Critical**                  |
| Design 015/035 reuse                   | **Critical**                  |
| Design 094 reuse                       | **Critical architecture**     |

---

# 96. Consolidation — Main Implementation Risks

Design 046 exposes several important risks:

**Meeting/CalendarEvent conflation**
Google/Outlook event becomes the sole canonical Meeting record.

**External-event/Client-meeting conflation**
All employee calendar events leak into the Portal.

**Client/participant conflation**
Every Client company member sees every Meeting.

**Contact/participant conflation**
CRM Contacts automatically receive Portal Meeting access.

**Project/Meeting permission conflation**
Project visibility unlocks every related Meeting.

**Meeting/Project access expansion**
Invitation to one Meeting grants broad Project access.

**Meeting/Follow-up conflation**
Internal sales follow-ups become visible.

**Meeting/Task conflation**
Staff preparation work appears as Client work.

**Milestone/Meeting conflation**
Project Timeline treats Meeting as Project lifecycle truth.

**Organizer/Project-owner conflation**
Scheduling role changes Project ownership semantics.

**Internal attendee leakage**
Every internal attendee appears to the Client.

**Agenda/internal-note conflation**
Confidential preparation notes become Client-visible.

**Meeting outcome/Client-minutes conflation**
Sales disposition or private outcome becomes Portal content.

**Scheduled/upcoming conflation**
Cancelled future Meetings remain shown as upcoming.

**Past/completed conflation**
Browser clock changes Meeting lifecycle.

**Cancel/delete conflation**
Cancelled Meeting disappears from history.

**Reschedule/new-meeting duplication**
One meeting becomes multiple unrelated records.

**Series/occurrence conflation**
Editing one recurring occurrence alters the full series.

**Timezone/display conflation**
Browser timezone changes canonical schedule.

**Default timezone/Meeting timezone conflation**
Organization setting rewrites existing Meetings.

**Sent/delivered/accepted conflation**
Invitation status is represented incorrectly.

**Provider outage/Meeting cancellation conflation**
Integration failure changes business lifecycle.

**Join-link leakage**
Unauthorized Client users receive virtual meeting access.

**Search leakage**
Private Meeting subjects/participants appear in autocomplete.

**RSVP/Meeting-status conflation**
One attendee declining marks Meeting cancelled.

**Generic Meeting PATCH**
Client modifies organizer, outcome, notes, or participants beyond authority.

**Permission-unsafe caching**
One Client user's meeting set leaks to another.

**046/094 duplicate Meeting domains**
Client Meetings and internal Meeting Outcome get separate backends.

No extra design is required.

These are Meeting identity, scheduling, authorization, privacy, and synchronization requirements.

# Design 046 Audit Verdict

## **PASS — CLIENT-SAFE MEETING & SCHEDULING WORKSPACE ANCHOR**

**Domain directive:** **Meeting ≠ CalendarEvent ≠ MeetingOccurrence ≠ FollowUp ≠ Task ≠ Milestone.**

**Reuse directive:** Designs 015, 035, 046 and later 094 must use one canonical Meeting, participant, occurrence, scheduling and provider-mapping infrastructure.

**Projection directive:** Design 046 consumes explicit Client-safe `ClientMeetingSummary` projections and never receives internal Meeting notes, outcomes, CRM context, routing metadata or provider diagnostics.

**Authorization directive:** active Portal membership plus Meeting/resource participation controls visibility; belonging to a Client company or viewing a Project does not automatically expose all associated Meetings.

**Participant directive:** internal users, Client Portal members and supported external participants remain distinct identity types.

**Status directive:** Meeting lifecycle, temporal condition and individual participant RSVP are separate dimensions.

**Scheduling directive:** rescheduling mutates canonical Meeting schedule through controlled commands; generic Calendar projections are never edited as source truth.

**Recurrence directive:** recurring Meeting series and individual occurrences remain distinguishable so one occurrence can change without corrupting the series.

**Timezone directive:** Meeting timestamps use proper timezone/DST semantics; organization/browser timezone affects presentation/defaults, not historical Meeting truth.

**Privacy directive:** only deliberately Client-visible participants, agenda/context and join/location information are exposed.

**Notes directive:** internal Meeting notes/outcomes remain private unless an explicit Client-safe summary exists; they are never automatically projected.

**Join directive:** conference links are authorization-sensitive resources and must not leak through public or unrelated Client responses.

**Provider directive:** canonical Meeting state remains independent from calendar/video provider sync; provider outage does not mean the Meeting is cancelled or missing.

**RSVP directive:** invitation sent, delivery, participant response and Meeting lifecycle remain separate states.

**Notification directive:** Meeting changes can generate shared Notifications, but Notifications never become the canonical schedule.

**Audit directive:** scheduling, cancellation, participant and Client RSVP changes can emit canonical Design 039 AuditEvents with correct Client/internal/system actor context.

**Failure directive:** empty, unavailable, cancelled, synchronization-delayed, response-unknown and provider-unavailable remain distinct states.

**Responsive directive:** desktop emphasizes schedule scanning and context; mobile prioritizes Meeting → Project → date/time/timezone → participants → join/respond.

**Overlap directive:** Designs **015, 035, 046 and 094** must ultimately share one Meeting/Participant/Occurrence/Provider synchronization engine with separate internal and Client-safe projections.

**Consolidation directive:** **STANDARDIZE ONE PLATFORM-WIDE MEETING + PARTICIPANT + RECURRENCE/OCCURRENCE + CALENDAR MAPPING + TIMEZONE + PROVIDER SYNC INFRASTRUCTURE — DO NOT BUILD A SECOND CLIENT MEETING DATABASE OR CLIENT-SPECIFIC CALENDAR ENGINE.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **46 / 153** |
| **PASS**                                   |                         **46** |
| **STANDARDIZE decisions**                  |                         **44** |
| **Potential implementation-overlap flags** |                         **37** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**46 / 153 = 30.1% audited.**

### Canonical scheduling architecture after Design 046

```text
                    CANONICAL MEETING
                         Design 015
                             │
                 ┌───────────┼───────────┐
                 ↓           ↓           ↓
            Participants   Recurrence   Schedule
                                          │
                                          ↓
                              Calendar Infrastructure
                                    Design 035
                                          │
                                Provider Mapping/Sync
                                          │
                 ┌────────────────────────┴─────────────────────┐
                 ↓                                              ↓
        INTERNAL PROJECTION                            CLIENT PROJECTION
        Designs 015 / 094                              Design 046
                                                              │
                                                              ├── Project 043
                                                              ├── Timeline 044
                                                              └── Notifications
```

# Next Sequential Audit Target

## **Design 047 — Tasks / Requests**

Its frozen identity is already locked.

The next audit will need to preserve a particularly important distinction:

> **Internal Task ≠ Client Request ≠ Client Action ≠ Approval ≠ Questionnaire requirement.**

After Design 047 we continue strictly:

**048 Client Questionnaires → 049 Client Draft Review → 050 Client Design Review → 051 Client Files & Assets → 052 Client Approvals → 053 Client Contracts → 054 Client Invoices & Payments → 055 Client Publishing & Distribution → 056 Client Reports & Downloads → … → 077 Client Access Recovery**

with the unchanged audit contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**

