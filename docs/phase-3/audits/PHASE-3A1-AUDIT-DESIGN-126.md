# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 126 — Publishing Calendar / Release Schedule

Design 126 should become the **canonical Team Workspace publishing-schedule calendar, release-time visualization, exact-version rescheduling, target-level release planning, and schedule-conflict surface** built directly on the `PublicationSchedule` foundation already established by Designs **031, 124, and 125**.

Design 126 must **not create a second calendar-backed publishing scheduler**. Its calendar entries are projections over canonical `PublicationSchedule` records. Any move, reschedule, cancellation, or other scheduling action present in the frozen design must invoke the same `PublicationScheduleService` used by the Publishing Queue and Publication Detail surfaces.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **PublishingCalendarView ≠ PublishingCalendarEntry ≠ PublicationSchedule ≠ Publication ≠ PublicationVersion ≠ PublicationTarget ≠ PublicationAttempt ≠ ProviderEvent ≠ Global Calendar ScheduleEntry ≠ Calendar Display Timezone ≠ Canonical Scheduled Instant.**

The central implementation rule is:

> **The calendar displays publishing intent; it does not become publishing truth. Every scheduled release must remain bound to one exact immutable PublicationVersion and exact PublicationTarget. Moving a calendar item changes only that canonical schedule through the server—it never silently selects the latest PublicationVersion, edits release content, marks an Attempt successful, or publishes anything by itself. Schedule timezone, actual execution, provider acceptance, verification, and live publication remain separately canonical facts.**

---

# 1. Classification

| Audit field                         | Classification                                                                                                                                                                    |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                       | **126**                                                                                                                                                                           |
| **Canonical name**                  | **Publishing Calendar / Release Schedule**                                                                                                                                        |
| **Product area**                    | Team Workspace / Publishing / Release Scheduling                                                                                                                                  |
| **User surface**                    | **Authenticated Team Workspace**                                                                                                                                                  |
| **Screen class**                    | Specialized Calendar Workspace / Publication Schedule Projection                                                                                                                  |
| **Classification**                  | **Canonical Publication Schedule Calendar, Exact-Version Rescheduling & Release-Planning Anchor**                                                                                 |
| **Primary purpose**                 | Visualize upcoming/past publication schedules chronologically and safely manage future release timing while preserving exact release Version/Target identity and schedule history |
| **Canonical publishing foundation** | Design 031                                                                                                                                                                        |
| **Operational queue dependency**    | Design 124                                                                                                                                                                        |
| **Publication detail dependency**   | Design 125                                                                                                                                                                        |
| **Primary scheduling entity**       | **PublicationSchedule**                                                                                                                                                           |
| **Stable publishing identity**      | **Publication**                                                                                                                                                                   |
| **Pinned release identity**         | **PublicationVersion**                                                                                                                                                            |
| **Destination identity**            | **PublicationTarget**                                                                                                                                                             |
| **Calendar representation**         | `PublishingCalendarEntry` — read projection only                                                                                                                                  |
| **Global Calendar relationship**    | Design 035 `ScheduleEntry` projection family                                                                                                                                      |
| **Execution dependency**            | `PublicationAttempt`                                                                                                                                                              |
| **Verification dependency**         | `PublicationVerification`                                                                                                                                                         |
| **Integration health dependency**   | Designs 139–140                                                                                                                                                                   |
| **Client publishing boundary**      | Designs 055 / 072                                                                                                                                                                 |
| **Distribution boundary**           | Designs 127–130                                                                                                                                                                   |
| **Primary query service**           | `PublishingCalendarQueryService`                                                                                                                                                  |
| **Schedule service**                | canonical `PublicationScheduleService`                                                                                                                                            |
| **Calendar projection service**     | `PublishingCalendarProjectionService`                                                                                                                                             |
| **Schedule conflict resolver**      | `PublicationScheduleConflictResolver`                                                                                                                                             |
| **Timezone service**                | centralized scheduling/timezone utility                                                                                                                                           |
| **Parent shell**                    | `InternalAppShell` — Design 001                                                                                                                                                   |
| **Auth**                            | Required                                                                                                                                                                          |
| **Authorization**                   | Active OrganizationMembership + publication schedule/read/edit permissions                                                                                                        |
| **Implementation priority**         | **Critical Release Timing / Version Integrity / Scheduler Safety**                                                                                                                |
| **Reuse level**                     | **Extremely High with Queue, Publication Detail, Global Calendar and execution workers**                                                                                          |

Design 126 should answer:

> **“What exact releases are scheduled, when will they execute, in which timezone, to which exact destinations, which release version is pinned, which schedules are still editable, which have already been claimed/executed, and what timing conflicts or operational concerns need attention?”**

Canonical architecture:

```text
Publication PUB-100
       │
       ├── PublicationVersion v3
       │
       └── PublicationTarget Website
                    │
                    ↓
          PublicationSchedule PS-20
                    │
          Aug 25 · 09:00 Berlin
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
Design 124 Queue       Design 126 Calendar
          │                   │
          └─────────┬─────────┘
                    ↓
        same PublicationSchedule
                    │
                    ↓
             Scheduler Worker
                    │
                    ↓
          PublicationAttempt
```

---

# 2. Reuse

## `PublicationSchedule` remains canonical

Designs 124, 125, and 126 must use the **same exact schedule IDs**.

Correct:

```text
PublicationSchedule PS-20

Design 124
→ queue schedule summary

Design 125
→ publication target schedule detail

Design 126
→ calendar entry
```

Do not create:

```text
CalendarPublicationSchedule
ReleaseCalendarEvent
ScheduledPublicationItem
PublishingCalendarRecord
```

as parallel scheduling truth.

---

## PublishingCalendarEntry ≠ PublicationSchedule

Permanent.

`PublishingCalendarEntry` is a display projection.

It can contain:

* title;
* exact release version;
* destination;
* local/display time;
* schedule lifecycle;
* publication state;
* conflict summary.

It never owns scheduling lifecycle.

---

## Design 035 Global Calendar and Design 126 share canonical dates

Design 035 already established:

> Calendar `ScheduleEntry` is a projection over source-domain schedules.

Design 126 is a specialized publishing calendar.

Correct:

```text
PublicationSchedule PS-20
        │
        ├── Global Calendar projection
        └── Publishing Calendar projection
```

Both display the same canonical scheduled release.

---

## Global Calendar entry ≠ Publishing Schedule

Absolute.

Editing from either authorized surface routes to:

```text
PublicationScheduleService
```

not to a generic Calendar table.

---

## Calendar entry ≠ Publication

Permanent.

A Publication may have:

* several Targets;
* several schedules;
* reschedule history;
* several Versions.

One calendar item cannot safely represent the whole Publication as a mutable object.

---

## Calendar entry ≠ PublicationVersion

Permanent.

But every scheduled item must visibly retain its exact pinned Version.

---

## Calendar entry ≠ PublicationTarget

Permanent.

The same Publication Version may be scheduled to several targets.

---

## Multi-target calendar grouping ≠ one canonical schedule

If the frozen UI groups:

> Website + Magazine Platform + Partner Feed — 09:00

that can be a visual grouping.

Underneath, target-specific canonical scheduling must remain unambiguous.

Example:

```text
PUB-100 v3

PS-20 → Website 09:00
PS-21 → Platform 09:00
PS-22 → Partner 09:00
```

A grouped calendar card is not a replacement for those three schedule identities.

---

## Design 124 remains queue operations authority

The Publishing Queue should immediately reflect canonical schedule changes made from Design 126.

No manual synchronization or copied `scheduledAt`.

---

## Design 125 remains deep Publication detail

Calendar can open one canonical Publication/Target schedule context.

The target/version/attempt history remains Design 125's detail responsibility.

---

## PublicationSchedule ≠ PublicationAttempt

One of the permanent boundaries.

```text
Schedule:
Publish v3 to Website at 09:00.

Attempt:
Worker actually tried at 09:00:04.
```

These are separate facts.

---

## Scheduled time ≠ execution time

Permanent.

---

## Execution time ≠ verified publication time

Permanent.

Example:

```text
Scheduled:          09:00
Attempt started:    09:00:04
Provider accepted:  09:00:07
Verified live:      09:01:18
```

Design 126 should not collapse these into one `publishedAt`.

---

## Schedule ≠ provider calendar/job

If an external provider itself supports scheduled publication:

the canonical `PublicationSchedule` remains internal business truth.

Provider scheduled-job identity can be external execution evidence.

---

## New PublicationVersion ≠ schedule update

Critical.

Example:

```text
PS-20 pins v3.

Later:
v4 created.
```

PS-20 remains v3 until an explicit governed schedule change selects v4.

Calendar rendering must not silently display v4.

---

## Move calendar item ≠ choose latest Version

Absolute.

Dragging:

```text
Aug 25 → Aug 27
```

means:

> reschedule the same exact v3/Target intent.

Not:

> reschedule whatever version is newest on Aug 27.

---

## Reschedule ≠ republish

Permanent.

A future unexecuted schedule can be changed.

An already executed release requires a new release/correction operation—not moving its historical calendar entry.

---

## Cancel Schedule ≠ cancel Publication

Permanent.

---

## Cancel Schedule ≠ unpublish

Absolute.

---

## Historical schedule ≠ current schedule

When rescheduled:

historical intent should remain explainable.

---

# 3. Entities

## PublicationSchedule

Canonical schedule entity already established.

Conceptually:

```text
PublicationSchedule
├── id
├── organizationId
├── publicationId
├── publicationVersionId
├── publicationTargetId
├── scheduledInstant
├── scheduleTimezone
├── intendedLocalDateTime
├── lifecycle
├── createdBy
├── createdAt
├── claimedAt?
├── cancelledAt?
├── supersededByScheduleId?
└── revision
```

Exact schema belongs to Phase 3D.

---

## Canonical scheduled instant

The system should preserve an unambiguous execution instant.

Example:

```text
2026-08-25T07:00:00Z
```

paired with original business scheduling context:

```text
09:00 Europe/Berlin
```

---

## Schedule timezone ≠ viewer timezone

Critical.

A release scheduled:

> 09:00 Europe/Berlin

may display to another user as:

> 12:30 Asia/Kolkata

depending on view settings.

The viewer's timezone must not rewrite the schedule.

---

## Display timezone

Conceptually:

```text
PublishingCalendarView.timezone
```

is presentation/query context.

It is not schedule identity.

---

## Intended local time

Useful for preserving:

> 9 AM local destination time

across DST semantics.

Do not retain only a floating text date/time with no timezone.

---

## DST ambiguous/nonexistent times

Critical for scheduled public releases.

Example:

During DST transition:

> 02:30 may occur twice or not exist.

Scheduling command must explicitly resolve/reject ambiguous local times.

Do not leave resolution to server default timezone libraries silently.

---

## Calendar entry projection

Conceptually:

```text
PublishingCalendarEntry
├── scheduleId
├── publicationId
├── publicationVersionId
├── targetId
├── publication title
├── release version label
├── target summary
├── scheduled instant
├── displayed local time
├── schedule lifecycle
├── readiness summary
├── attempt summary?
└── conflict summary
```

Rebuildable only.

---

## Schedule lifecycle

Conceptually:

```text
DRAFT / PENDING
SCHEDULED
DUE
CLAIMED
EXECUTING
EXECUTED
CANCELLED
SUPERSEDED
```

Exact enum belongs to Phase 3D.

The important part is that execution state remains separable.

---

## `DUE` may be derived

`scheduledInstant <= now` does not necessarily mean a stored lifecycle change is required.

Could be derived until worker claims it.

Phase 3D decides exact representation.

---

## Claimed schedule

A durable worker may claim a schedule before creating/executing the Attempt.

This protects against duplicate workers.

---

## CLAIMED ≠ EXECUTED

Critical.

---

## Schedule revision/history

Rescheduling requires historical trace.

Two valid architecture approaches:

### Option A

Same `PublicationSchedule` with append-only revision/history.

### Option B

Supersede PS-20 with PS-21.

Do not finalize the physical choice in Phase 3A.1.

The invariant is:

> old timing intent must remain explainable where operationally material.

---

## Reschedule history ≠ Activity only

Activity can summarize:

> Release moved from Aug 25 → Aug 27.

But canonical schedule change evidence must exist in the schedule domain.

---

## Conflict projection

`PublicationScheduleConflict` should preferably be derived:

```text
PublicationScheduleConflictView
├── scheduleId
├── conflictType
├── severity
├── related schedule/target refs
├── evaluatedAt
└── reason
```

It should not become one generic blocking status unless the policy requires hard blocking.

---

## Conflict ≠ invalid schedule universally

Possible conflicts might include, where applicable:

* same destination has overlapping releases;
* provider/account constraint;
* target blackout/restriction;
* known integration outage;
* organizational publishing limit.

Do not invent exact policies that are not in the frozen system.

---

## Warning ≠ hard block

Critical.

A central policy decides whether a conflict:

```text
WARN
BLOCK
UNKNOWN
```

not the frontend.

---

## Integration health ≠ schedule conflict

A degraded provider connection may be operational concern, not a schedule collision.

Keep dimensions separate.

---

## Publication readiness ≠ schedule validity

A release can have a valid time but not yet be content-ready.

Example:

```text
Schedule valid       ✓
Release readiness    BLOCKED
```

Likewise:

```text
Release ready        ✓
Schedule invalid     ✕
```

These are separate.

---

## Schedule target requirement ≠ distribution channel

Permanent.

This remains publishing scheduling.

---

# 4. Permissions

Design 126 should conceptually distinguish:

```text
publishingCalendar.read

publicationSchedule.read
publicationSchedule.create
publicationSchedule.reschedule
publicationSchedule.cancel

publication.publishNow

publicationVersion.read
publicationTarget.read
```

Exact permission keys belong to Phase 3D.

---

## Calendar read ≠ Schedule edit

Absolute.

---

## Schedule edit ≠ Publication content edit

Permanent.

---

## Schedule edit ≠ Target management

Permanent.

---

## Schedule edit ≠ Publish Now

Potentially distinct and important.

A planner may schedule future releases without being allowed to trigger immediate public release.

---

## Publish Now ≠ drag to current time

Critical.

Dragging an event to:

> now

must not accidentally bypass Publish Now permissions/readiness rules.

The server should interpret scheduling semantics safely.

---

## Cancel Schedule ≠ unpublish permission

Absolute.

---

## Reschedule ≠ correction authority

Permanent.

---

## Reschedule ≠ Version-edit authority

Permanent.

The exact Version remains pinned.

---

## Global Calendar edit permission ≠ Publication Schedule permission

Design 035 may allow general Calendar editing.

Publication schedule mutations must still check publishing-specific permissions.

---

## Target-specific publishing permissions apply

A user may schedule Website releases but not a restricted executive/social Target.

---

## Integration credentials never exposed

Schedule users should not receive:

* tokens;
* passwords;
* provider secrets.

---

## Direct Schedule ID reauthorizes

Permanent.

---

## Direct Publication ID reauthorizes

Permanent.

---

## Direct Version/Target IDs reauthorize

Permanent.

---

## Cross-tenant schedule creation prohibited

Absolute.

Publication, Version, Target, provider connection, schedule, and Project context must all belong to the same authorized tenant.

---

# 5. States

Design 126 must keep **schedule lifecycle, release readiness, publication lifecycle, execution lifecycle, verification state, conflict state, and integration health** separate.

### Schedule state

Conceptually:

```text
Unscheduled
Scheduled
Due
Claimed
Executing
Executed
Cancelled
Superseded
```

### Readiness

```text
Ready
Blocked
Unknown
Unavailable
```

### Conflict

```text
No Known Conflict
Warning
Blocking Conflict
Unknown
```

### Execution

Owned by `PublicationAttempt`.

### Verification

Owned by `PublicationVerification`.

These must never collapse into one generic Calendar color/status.

---

## Scheduled ≠ Ready

Permanent.

---

## Ready ≠ Scheduled

Permanent.

---

## Scheduled ≠ Executed

Absolute.

---

## Due ≠ Claimed

Permanent.

---

## Claimed ≠ Provider request sent

Permanent.

---

## Attempt started ≠ schedule completed universally

The scheduler may record execution handoff, while provider Attempt independently progresses.

---

## Executed ≠ verified live

Absolute.

---

## Calendar item in the past ≠ published

Critical.

Past scheduled time with no successful Attempt may indicate:

* missed execution;
* scheduler delay;
* failure;
* unknown state.

Never color every past item as published.

---

## Cancelled ≠ Failed

Permanent.

---

## Superseded ≠ Cancelled

Permanent.

---

## Rescheduled ≠ executed late

Permanent.

---

## Conflict warning ≠ schedule failure

Permanent.

---

## Provider degraded ≠ schedule blocked universally

Policy-specific.

---

## Readiness unknown ≠ schedule invalid

Permanent.

---

## Integration unavailable ≠ schedule deleted

Absolute.

---

## Publication Version superseded ≠ Schedule auto-updated

Critical.

An old exact Version can remain intentionally scheduled until explicitly changed, subject to current policy/readiness.

---

## State Coverage

Design 126 inherits Design 150 plus:

```text
Publishing Calendar Loading
Publishing Calendar Available
Publishing Calendar Empty
Publishing Calendar Restricted
Publishing Calendar Partial
Publishing Calendar Unavailable

Schedule Unscheduled
Schedule Scheduled
Schedule Due
Schedule Claimed
Schedule Executing
Schedule Executed
Schedule Cancelled
Schedule Superseded

Release Ready
Release Blocked
Release Readiness Unknown
Release Readiness Unavailable

No Schedule Conflict
Schedule Warning
Schedule Blocking Conflict
Schedule Conflict Unknown

Exact Release Version Scheduled
Newer Release Version Available
Scheduled Version Historical
Scheduled Version Restricted

Target Available
Target Restricted
Target Configuration Unknown

Provider Healthy
Provider Degraded
Provider Unavailable
Provider Health Unknown

Attempt Not Started
Attempt Running
Attempt Failed
Attempt Outcome Unknown
Attempt Completed

Verification Not Started
Verification Pending
Verification Verified
Verification Unknown

Schedule Updated Elsewhere
Schedule Claimed While Editing
Publication Version Updated Elsewhere
Target Updated Elsewhere
Provider State Updated Elsewhere
Calendar Projection Stale
Reschedule Conflict
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize:

1. calendar chronology;
2. exact release identity/version;
3. destination;
4. time/timezone;
5. readiness/conflict;
6. execution state.

Conceptually:

```text
Publishing Calendar
↓
Month / Week / Day view if frozen
↓
Aug 25

09:00
Leadership Interview
Release v3
Website
Scheduled

09:30
Executive Magazine
Release v2
Platform
Readiness blocked
```

Only calendar modes present in the frozen Design 126 should be implemented.

---

## Exact Version must remain visible

Correct:

> Leadership Feature · v3

not:

> Leadership Feature

when v4 exists.

---

## Multi-target grouping must preserve detail

If several exact target schedules are visually grouped:

> 09:00 · v3 · 3 Targets

the user should still be able to determine which targets are represented and their individual states.

---

## Timezone must remain understandable

If the calendar uses a selected display timezone:

show it clearly.

Example:

> Calendar timezone: Europe/Berlin

For destination-specific schedules where original timezone matters, preserve that detail in item/detail context.

---

## Past entries should communicate actual outcome

A past event should distinguish:

> Verified
> Failed
> Outcome unknown
> Cancelled

rather than all looking like completed calendar appointments.

---

## Conflict indication must explain why

Prefer:

> Two required releases target the same property within the configured publishing window

where canonical policy supports it.

Not:

> Conflict.

---

## Drag/drop, if frozen design supports it

Dragging should mean:

> request reschedule of this exact Schedule.

It must:

* show intended new date/time;
* preserve Version/Target;
* invoke server validation;
* handle race with scheduler claim.

---

## Claimed/executing items should stop behaving like freely draggable events

If a worker already claimed the release, ordinary reschedule should be disabled/rejected.

---

## Tablet

Following Design 152:

* shorter timeline range;
* larger calendar cells;
* schedule cards stack;
* target/version metadata remains readable;
* detail can move into selected-item panel;
* drag behavior remains touch-safe only if frozen.

---

## Mobile

A dense month grid should not be the only useful representation.

Priority adaptation:

```text
Today / Date
↓
Scheduled releases
↓
Exact Version
↓
Target
↓
Time
↓
Readiness / Execution
```

Agenda/list representation is valid responsive behavior while preserving the same canonical schedule data.

---

## Mobile editing

Prefer deliberate date/time controls over precision drag if drag is unsafe at phone width.

---

## Accessibility

A calendar entry could communicate:

> Publication PUB-100, Leadership Interview release version 3, scheduled for the Website target on August 25 at 9 AM Europe/Berlin. The release is ready. A newer release version 4 exists but is not scheduled. No execution attempt has started.

where canonical authorized data supports it.

---

# 7. Backend Requirements

## Canonical Publishing Calendar architecture

```text
Design 126
    ↓
Authenticated Workspace Context
    ↓
PublishingCalendarQueryService
    │
    ├── PublicationAdapter
    ├── PublicationVersionAdapter
    ├── PublicationTargetAdapter
    ├── PublicationScheduleAdapter
    ├── ReadinessAdapter
    ├── AttemptAdapter
    ├── VerificationAdapter
    ├── ConflictResolver
    └── IntegrationHealthAdapter
    ↓
PublishingCalendarView
```

All mutations use canonical `PublicationScheduleService`.

---

## Calendar query

Conceptually:

```text
getPublishingCalendar(
    startInstant,
    endInstant,
    displayTimezone,
    filters,
    currentMembership
)
```

should:

1. authenticate/authorize;
2. validate bounded date range;
3. query canonical schedules;
4. permission-filter Publications/Targets;
5. project exact Version identity;
6. convert display times safely;
7. resolve readiness/conflict summaries;
8. include compact execution/verification state;
9. return revision/freshness metadata.

---

## Bounded range required

Do not query the organization's entire publishing history for every month/week view.

Use date indexes on canonical scheduled instant.

---

## Schedule creation

Conceptually:

```text
createPublicationSchedule(
    publicationId,
    publicationVersionId,
    targetId,
    intendedLocalDateTime,
    timezone,
    expectedPublicationRevision,
    idempotencyKey
)
```

must:

1. authorize scheduling;
2. verify canonical Publication;
3. verify exact Version;
4. verify Target;
5. ensure same tenant;
6. resolve local datetime + timezone to valid instant;
7. fresh-check scheduling eligibility/readiness policy;
8. run conflict policy;
9. create durable Schedule;
10. emit Audit/outbox.

---

## Schedule must pin exact Version

Absolute.

---

## Schedule must pin exact Target

Absolute.

---

## Timezone validation

Use IANA timezone identifiers where applicable.

Avoid ambiguous abbreviations such as:

```text
CST
IST
PST
```

because they may be ambiguous.

---

## DST validation

For nonexistent local time:

> 02:30 during spring-forward

server should reject or explicitly resolve according to defined scheduling policy.

For repeated local time:

> 01:30 during fall-back

system should require deterministic resolution.

---

## Reschedule command

Conceptually:

```text
reschedulePublication(
    scheduleId,
    newLocalDateTime,
    timezone,
    expectedScheduleRevision,
    idempotencyKey
)
```

must:

1. authorize;
2. load Schedule;
3. verify still editable;
4. verify no active Attempt/claim makes move unsafe;
5. preserve exact PublicationVersion/Target;
6. resolve timezone;
7. re-run conflict/readiness policy;
8. preserve schedule-change history;
9. emit Audit/outbox.

---

## Reschedule never substitutes Version

Critical.

If operator wants to change from:

```text
v3 → v4
```

that requires an explicit release-version/schedule operation.

It is not a side effect of date movement.

---

## Change Version on existing future Schedule

If frozen UI permits selecting another Version:

use a deliberate command such as:

```text
replaceScheduledPublicationVersion(...)
```

that:

* verifies exact new Version;
* preserves old scheduling lineage;
* requires fresh readiness;
* remains explicit.

Do not hide this inside generic reschedule.

---

## Schedule edit eligibility

A schedule should generally be editable only while it is safely future/unclaimed.

Conceptually:

```text
SCHEDULED
```

may be editable.

```text
CLAIMED
EXECUTING
EXECUTED
```

normally are not.

Exact policy Phase 3D.

---

## Scheduler race protection

Critical race:

```text
08:59:59 operator drags release to tomorrow
09:00:00 scheduler claims release
```

The server must serialize/validate schedule revision/claim state.

Possible result:

> Reschedule rejected because execution already began.

Never silently both reschedule and publish.

---

## Scheduler architecture

Same durable scheduler from Design 124.

Use:

* DB due records;
* durable queue;
* worker leases;
* atomic claim;
* heartbeat where necessary.

---

## Calendar never schedules through browser timers

Absolute.

---

## Schedule execution key

One canonical execution intent should derive stable uniqueness from:

```text
scheduleId
+
publicationVersionId
+
targetId
```

or equivalent.

---

## Calendar projection lag

If a schedule changes but calendar projection is stale:

the canonical Schedule remains correct.

Do not let the old calendar item trigger another mutation without revision revalidation.

---

## Conflict Resolver

Conceptually:

```text
PublicationScheduleConflictResolver.evaluate(
    publicationVersionId,
    targetId,
    instant,
    organizationPolicy
)
```

may return:

```text
CLEAR
WARNING
BLOCKED
UNKNOWN
```

with structured reasons.

---

## Conflict resolver must be centralized

Queue, Detail, and Calendar must not calculate conflicting rules independently.

---

## Conflict detection examples

Where business/provider policy actually requires them:

* overlapping releases to same Target;
* target-specific minimum interval;
* provider scheduling constraint;
* blackout/maintenance window;
* known target unavailability.

Do not hard-code arbitrary rules without policy.

---

## Conflict ≠ capacity system

Do not repurpose Design 112 resource capacity for publishing schedule collision unless human staffing is actually part of the frozen workflow.

---

## Readiness checks

Scheduling eligibility and execution readiness may differ.

Example:

> Allow scheduling while Approval pending, but block execution unless approved.

or:

> Require Approval before scheduling.

This should be policy-driven.

Do not assume one global rule.

---

## Execution-time readiness

Even if a release was valid when scheduled:

worker should revalidate critical conditions before external side effect.

Example:

* Approval revoked;
* source artifact quarantined;
* Target disabled;
* connection invalid.

---

## Schedule-ready ≠ execute-ready forever

Critical.

---

## Failed execution should not rewrite Schedule history

The schedule still proves:

> this release was intended for 09:00.

Attempt history proves what happened.

---

## Missed schedule

If no Attempt was created due to scheduler failure/outage:

represent this explicitly.

Do not fabricate an Attempt success or silently move the release.

---

## Scheduler recovery

On worker restart/outage:

scan/claim due unprocessed schedules idempotently.

Execution uniqueness prevents duplicate publication.

---

## Late execution

If recovery executes:

```text
scheduled 09:00
actual 09:12
```

preserve both.

---

## Schedule delay metrics

Derived later from:

```text
attempt.initiatedAt - schedule.scheduledInstant
```

not stored as manual calendar status.

---

## Cancel Schedule command

Conceptually:

```text
cancelPublicationSchedule(
    scheduleId,
    reason?,
    expectedRevision,
    idempotencyKey
)
```

must:

1. authorize;
2. validate not already irreversibly executing;
3. change only future schedule intent;
4. preserve cancellation evidence;
5. emit outbox/Audit.

---

## Cancel race

If provider execution has already begun:

cancellation may fail or enter a special outcome.

Do not claim:

> Cancelled

unless execution prevention is known.

---

## Bulk rescheduling

If frozen design supports multi-select/bulk movement:

each Schedule must retain:

* exact Version;
* exact Target;
* authorization;
* conflict result;
* editable state.

---

## Bulk operation must support partial outcomes

Example:

```text
12 schedules selected

10 rescheduled
1 already claimed
1 blocked by Target policy
```

Do not report complete success.

---

## Recurrence

Do not invent recurring PublicationSchedule semantics unless the frozen product explicitly includes recurring release scheduling.

Most publication releases should remain explicit exact release intents.

---

## Calendar filters

If present, server-supported dimensions should use canonical fields:

* Publication type;
* Target;
* Version/release state;
* readiness;
* schedule state;
* verification state.

Do not filter only client-side over partially loaded calendar results.

---

## Current time

Backend rather than client clock should determine authoritative:

* due;
* missed;
* editable cutoffs.

Client time is display assistance.

---

## Design 035 integration

Global Calendar should consume:

```text
ScheduleEntry {
  sourceType = PUBLICATION_SCHEDULE
  sourceId = PS-20
}
```

or equivalent projection.

It never copies/owns the release date.

---

## Design 124 integration

Queue schedule summaries come from canonical `PublicationScheduleService`.

A calendar move invalidates Queue summary projections.

---

## Design 125 integration

Publication Detail shows same Schedule and history.

---

## Design 127 integration

Distribution may schedule promotion after Publication verification.

Do not place Distribution scheduling records in Publishing Calendar unless explicitly differentiated in a later design.

---

## Client Portal integration

Clients may see verified publication date/live state through Design 072.

They should not see internal future scheduling details unless the frozen client experience explicitly exposes them.

---

## Integration-health integration

Calendar may show operational warnings from Designs 139–140.

Health data never becomes schedule authority.

---

## Activity

Design 119 may project:

```text
PublicationScheduled
PublicationRescheduled
PublicationScheduleCancelled
PublicationScheduleClaimed
PublicationExecutionDelayed
```

where materially useful.

Activity is not Schedule source truth.

---

## Audit

Material actions should capture:

* schedule creation;
* reschedule;
* cancellation;
* bulk schedule operation;
* Version replacement on a future schedule;
* exceptional override.

---

## Notification

Design 080 may notify:

* upcoming release;
* schedule conflict;
* missed release;
* execution failure.

Notification state never mutates Schedule.

---

## Idempotency

Critical for:

* create Schedule;
* reschedule;
* cancel;
* bulk operations;
* scheduler claim;
* due execution handoff.

---

## Optimistic concurrency

Critical for:

* drag/drop;
* manual edits;
* Queue vs Calendar edits;
* scheduler claim vs operator edit;
* Target disable vs Schedule edit.

---

## Caching

Publishing Calendar caches should vary by:

```text
organizationMembershipId
authorizationRevision
date window
display timezone
scheduleRevision
publicationRevision
publicationVersionRevision
targetRevision
readinessRevision
attemptRevision
verificationRevision
integrationHealthRevision
filters
```

---

## Time-derived state caching

`Due`, `upcoming`, etc. cannot be cached indefinitely.

---

## Performance

Use:

* indexed `scheduledInstant`;
* bounded date windows;
* target/publication summary joins;
* batched readiness/conflict status;
* lazy deep history;
* compact calendar payloads;
* range-aware cache keys.

Avoid loading full Publication Detail for every calendar entry.

---

## Partial failure contract

Example:

```text
Schedules            ✓
Publications          ✓
Versions              ✓
Targets               ✓
Integration health    ✕
```

Correct:

> Publishing schedule is available; current provider-health warnings are unavailable.

Incorrect:

> Provider healthy.

Another:

```text
Schedule PS-20        ✓
Readiness service     ✕
```

Correct:

> Release remains scheduled for Aug 25; current release readiness cannot be verified.

Not:

> Release not ready.

Another:

```text
Schedule due          ✓
Attempt service       unavailable
```

Correct:

> Schedule is past due; execution status is currently unavailable.

Not:

> Publication failed.

---

## Backend Requirement Matrix

| Requirement                                  | Status                      |
| -------------------------------------------- | --------------------------- |
| Design 031 canonical Publication reuse       | **Critical**                |
| Design 124/125 same Schedule backend         | **Critical**                |
| No second calendar scheduler                 | **Critical**                |
| PublishingCalendarEntry/Schedule separation  | **Critical**                |
| Design 035 Calendar projection reuse         | **Critical**                |
| Schedule/Publication separation              | **Critical**                |
| Schedule/PublicationVersion separation       | **Critical**                |
| Schedule/Target separation                   | **Critical**                |
| Schedule/Attempt separation                  | **Critical**                |
| Schedule pins exact Version                  | **Critical**                |
| Schedule pins exact Target                   | **Critical**                |
| No latest-Version resolution at execution    | **Critical**                |
| Reschedule preserves exact Version/Target    | **Critical**                |
| Reschedule/Version replacement separation    | **Critical**                |
| Schedule/execution time separation           | **Critical**                |
| Execution/verification time separation       | **Critical**                |
| Canonical instant/view timezone separation   | **Critical**                |
| IANA timezone handling                       | **Critical**                |
| DST ambiguity/nonexistent-time handling      | **Critical**                |
| Historical reschedule evidence               | **Critical**                |
| Schedule/cancel/unpublish separation         | **Critical**                |
| Schedule claimed/editable-state separation   | **Critical**                |
| Scheduler/operator race protection           | **Critical**                |
| Durable scheduler                            | **Critical**                |
| Atomic scheduler claim                       | **Critical**                |
| Execution idempotency                        | **Critical**                |
| Missed schedule recovery                     | **Critical**                |
| Late execution preserves scheduled vs actual | **Critical**                |
| Central conflict resolver                    | **Critical**                |
| Warning/block/unknown conflict separation    | **Critical**                |
| Readiness/schedule-validity separation       | **Critical**                |
| Execution-time fresh readiness               | **Critical**                |
| Provider-health/schedule-state separation    | **Critical**                |
| Bulk operation per-item validation           | **Critical if bulk exists** |
| Bulk partial outcomes                        | **Critical if bulk exists** |
| Server-authoritative current time            | **Critical**                |
| Target-specific authorization                | **Critical**                |
| Schedule/Publish Now permission separation   | **Critical**                |
| Cross-tenant schedule prohibition            | **Critical**                |
| Optimistic concurrency                       | **Critical**                |
| Audit/outbox integration                     | **Required**                |
| Partial dependency failure handling          | **Critical**                |

---

# 8. Consolidation

Design 126 has substantial overlap with Publishing Queue, Publication Detail, and Global Calendar, so its main implementation risk is accidentally becoming a fourth schedule database.

**PublishingCalendarEntry / PublicationSchedule conflation**
Visual event becomes canonical scheduling record.

**Design 126 / Design 124 schedule duplication**
Calendar and Queue disagree.

**Design 126 / Design 125 schedule duplication**
Calendar and Publication Detail disagree.

**Design 126 / Design 035 Calendar duplication**
Two calendar backends own the same release date.

**Calendar event / Publication conflation**
One event represents an entire multi-target Publication incorrectly.

**Grouped calendar card / one Schedule conflation**
Target-specific state disappears.

**Schedule / PublicationVersion conflation**
Release timing and release content identity merge.

**Scheduled version / latest version conflation**
New content is published automatically.

**Calendar move / Version replacement conflation**
Drag operation changes release content.

**Schedule / Target conflation**
Same release to several destinations cannot be represented safely.

**Channel name / Target identity conflation**
Multiple provider properties collapse.

**Schedule date / viewer timezone conflation**
Different users change execution time accidentally.

**Viewer timezone / canonical schedule timezone conflation**
Presentation rewrites business intent.

**Floating local time / scheduled instant conflation**
DST/timezone makes execution ambiguous.

**Timezone abbreviation / IANA zone conflation**
`IST`, `CST`, etc. become ambiguous.

**DST invalid time / valid schedule conflation**
Release executes at unintended instant.

**Schedule time / Attempt start time conflation**
Worker delay is hidden.

**Attempt start / provider acceptance conflation**
Execution evidence loses detail.

**Provider acceptance / verified live time conflation**
Public release confirmation is wrong.

**Past calendar event / Published conflation**
Missed schedules look successful.

**Due / executed conflation**
Calendar crossing the time boundary triggers display-only success.

**Claimed / executed conflation**
Worker reservation becomes public side effect.

**Claimed / editable conflation**
Operator reschedules while worker publishes.

**Rescheduled / historical schedule deleted conflation**
Release planning history disappears.

**Rescheduled / late execution conflation**
Performance metrics become wrong.

**Cancel Schedule / Cancel Publication conflation**
Future timing change kills Publication identity.

**Cancel Schedule / Unpublish conflation**
Live content is removed unintentionally.

**Cancel requested / execution prevented conflation**
Race condition creates false assurance.

**Conflict / failure conflation**
Planning warning becomes execution failure.

**Conflict warning / hard blocker conflation**
Frontend invents policy.

**Provider degraded / schedule invalid conflation**
Operational warning destroys scheduling intent.

**Readiness / schedule validity conflation**
Content readiness and timing rules merge.

**Scheduled while blocked / scheduling impossible conflation**
Policy flexibility disappears.

**Readiness at scheduling time / readiness at execution time conflation**
Revoked Approval or unsafe artifact is ignored later.

**Calendar drag / Publish Now conflation**
Moving to current time bypasses release permission.

**Global Calendar edit / publishing permission conflation**
General calendar user gains publication scheduling authority.

**Scheduler queue job / PublicationSchedule conflation**
Infrastructure message becomes business record.

**Browser timer / durable scheduler conflation**
Release is lost when browser/server restarts.

**Scheduler retry / duplicate publication conflation**
Same target released twice.

**Missed schedule / automatic failure conflation**
Scheduler outage becomes provider failure.

**Recovery / duplicate execution conflation**
Restart publishes same content twice.

**Bulk drag / blind bulk mutation conflation**
Some schedules are already claimed/restricted.

**Bulk partial success / complete success conflation**
Operators believe all releases moved.

**Calendar filter / source-state authority conflation**
Partially loaded local data hides releases.

**Current device clock / server time conflation**
Due state differs between users.

**Archive state / schedule cancellation conflation**
Archived Project prevents legitimate immutable release.

**Publishing Calendar / Distribution Calendar conflation**
Promotion and canonical publication schedules mix.

**Client publication date / internal schedule conflation**
Unverified future date leaks as published truth.

**Integration health / schedule state conflation**
Credential outage rewrites schedule lifecycle.

**Notification reminder / schedule conflation**
Alert timing becomes release timing.

**Activity entry / schedule history conflation**
Human-readable text replaces canonical schedule revision.

**Audit event / schedule record conflation**
Governance evidence becomes execution intent.

**Search index / Schedule authority conflation**
Stale date controls publishing.

**Generic `scheduledAt` on Publication only**
Cannot model Version + Target + retries/multi-target scheduling.

**Generic Calendar event backend**
Publishing-specific invariants disappear.

**Generic `calendar_status`**
Schedule, readiness, conflict, execution and verification collapse.

**126/031 duplicate publishing schedule**
Foundation forks.

**126/035 duplicate Calendar state**
Global and Publishing calendars diverge.

**126/124 duplicate Queue dates**
Operations show different release times.

**126/125 duplicate Publication Detail schedules**
Target detail differs from Calendar.

**126/139–140 duplicate provider health**
Calendar starts owning integration state.

No additional screen is required.

These are **canonical PublicationSchedule reuse, exact-version scheduling, target identity, timezone/DST safety, reschedule history, scheduler durability, operator/worker concurrency, conflict/readiness separation, Global Calendar reuse, and execution-state boundaries**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PUBLICATION SCHEDULE CALENDAR, EXACT-VERSION RESCHEDULING & RELEASE-PLANNING ANCHOR**

**Domain directive:**
**PublishingCalendarView ≠ PublishingCalendarEntry ≠ PublicationSchedule ≠ Publication ≠ PublicationVersion ≠ PublicationTarget ≠ PublicationAttempt ≠ ProviderEvent ≠ Global Calendar ScheduleEntry ≠ Calendar Display Timezone ≠ Canonical Scheduled Instant.**

**Foundation directive:**
Design 031 remains canonical Publication foundation, while Designs 124–126 share the same Publication/Version/Target/Schedule/Attempt model.

**Schedule directive:**
`PublicationSchedule` is the only canonical publishing-time intent. Design 126 renders it; it does not create a Calendar-specific publishing record.

**Global-calendar directive:**
Design 035 Global Calendar and Design 126 Publishing Calendar are separate projections over the same source schedule. Neither owns a duplicate release date.

**Projection directive:**
`PublishingCalendarEntry` is a rebuildable permission-safe read model and never participates directly in external publishing side effects.

**Version directive:**
every PublicationSchedule pins one exact immutable PublicationVersion. Schedule execution never queries or substitutes “latest.”

**Target directive:**
every Schedule resolves an exact PublicationTarget. Visual grouping of several targets never removes individual schedule/target identity.

**Multi-target directive:**
one PublicationVersion may have several target-specific Schedules at the same or different times; their execution and verification states remain independent.

**Reschedule directive:**
moving/rescheduling a future Calendar item changes timing for the same exact Version/Target intent unless the user explicitly performs a separately governed Version replacement.

**No-silent-upgrade directive:**
creation of PublicationVersion v4 never alters a Schedule pinned to v3. Calendar may warn that a newer Version exists but cannot substitute it.

**Version-replacement directive:**
if future schedules can switch release versions, that is an explicit server command with exact old/new Version identities, fresh readiness and preserved schedule lineage—not a side effect of drag/drop.

**Timezone directive:**
schedule business intent preserves an unambiguous canonical instant plus relevant IANA timezone/original local scheduling context.

**Display-timezone directive:**
calendar display timezone is presentation only. User location/timezone conversion never changes the canonical release instant.

**DST directive:**
ambiguous/nonexistent local times during daylight-saving transitions must be explicitly validated/resolved rather than silently interpreted by application/server defaults.

**Chronology directive:**
scheduled time, scheduler claim time, Attempt start time, provider acceptance time and verification/live time remain different facts.

**Past-event directive:**
a Calendar event moving into the past never means publication succeeded. Past Schedule with missing/failed/unknown Attempt remains visibly unresolved.

**History directive:**
material rescheduling/cancellation history remains explainable through canonical Schedule revisions/supersession evidence rather than Activity text alone.

**Cancellation directive:**
cancelling a future Schedule is distinct from cancelling a Publication and entirely separate from unpublishing already-live content.

**Claim directive:**
durable scheduler workers atomically claim due Schedule intents. Claiming and executing remain distinct, and already-claimed items cannot be freely rescheduled from stale Calendar state.

**Scheduler directive:**
execution uses durable DB/queue scheduling and worker leases/claims—not browser timers, frontend state or single-server memory.

**Recovery directive:**
scheduler restarts recover due/unprocessed Schedules idempotently while execution keys prevent duplicate public releases.

**Late-execution directive:**
if a release scheduled for 09:00 executes at 09:12 after outage/recovery, both times are preserved. Schedule intent is never rewritten to hide delay.

**Conflict directive:**
one centralized `PublicationScheduleConflictResolver` evaluates target/policy conflicts consistently across Queue, Detail and Calendar.

**Conflict-semantics directive:**
warning, blocking conflict and unknown state remain distinct. Frontend visual overlap never becomes automatic execution prohibition without server policy.

**Readiness directive:**
schedule validity, publication content readiness and provider operational readiness remain separate dimensions.

**Execution-readiness directive:**
critical release conditions are revalidated at execution time because Approval, artifact safety, Target configuration or provider connection may change after initial scheduling.

**Publish-now directive:**
Publish Now remains a distinct permissioned release operation. Dragging a Calendar item near/current time must not bypass publishing authorization or execution safeguards.

**Permissions directive:**
calendar read, schedule create/reschedule/cancel, Publish Now, Version editing, Target management and provider integration administration remain independently server-authorized.

**Target-permission directive:**
schedule permission may be Target-specific; authorized access to one publishing property never grants another automatically.

**Concurrency directive:**
Calendar edits, Queue edits, Publication Detail edits, Target changes and scheduler claims all use revision/state validation to prevent stale rescheduling or duplicate execution.

**Idempotency directive:**
schedule creation, reschedule, cancellation, bulk changes, scheduler claim and execution handoff are replay-safe.

**Bulk directive:**
if frozen UI supports bulk scheduling/rescheduling, every Schedule is individually authorized, editable-state checked and conflict-validated with partial outcomes preserved.

**Current-time directive:**
authoritative due/editability windows use server-side time and canonical timezone rules rather than trusting client-device clocks.

**Archive directive:**
Design 123 Archive state does not itself cancel legitimate future PublicationSchedules referencing immutable approved release artifacts.

**Queue directive:**
Design 124 immediately reflects canonical Calendar schedule changes through shared query/projection invalidation; no copied `scheduledAt` synchronization exists.

**Detail directive:**
Design 125 shows the exact same Schedule IDs and timing/version history.

**Client directive:**
Design 072 consumes safe verified publication dates/live state—not internal future calendar intent unless client-facing scheduling is explicitly allowed elsewhere.

**Distribution directive:**
Designs 127–130 own Distribution scheduling/execution. Publishing Calendar cannot become a generic Distribution campaign calendar.

**Integration directive:**
Designs 139–140 remain canonical provider connection/health authority. Design 126 may display health warnings without owning credentials or connection lifecycle.

**Activity directive:**
Design 119 may project scheduling/rescheduling/cancellation events but Activity never becomes canonical release timing.

**Audit directive:**
material schedule creation, rescheduling, cancellation, Version replacement, bulk scheduling and exceptional overrides generate actor/version/target-aware Audit evidence.

**Caching directive:**
calendar caches are date-range/timezone/filter/revision aware. Time-derived Due state and current readiness cannot remain indefinitely cached.

**Partial-failure directive:**
Schedule, Publication, readiness, integration health, execution and verification services may fail independently. `Unavailable` can never become `Cancelled`, `Failed`, `Published`, or “no conflict.”

**Performance directive:**
use indexed canonical scheduled instants, bounded range queries, batched Publication/Target summaries and lazy deep history instead of loading every Publication execution record for each Calendar view.

**Future-reuse directive:**
Design **127 — Distribution Campaign Management** must begin from canonical verified Publication/Placement eligibility and create its own DistributionCampaign identity. It must not reuse PublicationSchedule as a Distribution schedule or treat a verified release as an automatically started promotional campaign.

**Overlap directive:**
Designs **031, 035, 072, 114–140** must preserve one continuous **exact PublicationVersion + exact PublicationTarget → canonical timezone-safe PublicationSchedule → Queue/Detail/Calendar projections → durable scheduler claim → idempotent PublicationAttempt → ProviderEvent → Verification/live Placement → separate Distribution workflow** lineage.

**Consolidation directive:**
**STANDARDIZE ONE PUBLICATION SCHEDULING FOUNDATION — DESIGN-031/124/125 CANONICAL PUBLICATIONS + EXACT VERSION/TARGET-BOUND PUBLICATIONSCHEDULES + SAME DESIGN-035/126 CALENDAR PROJECTION SOURCE + CANONICAL INSTANT + IANA TIMEZONE/DST SAFETY + EXPLICIT RESCHEDULE HISTORY + NO SILENT VERSION UPGRADES + DURABLE ATOMIC SCHEDULER CLAIMING + IDEMPOTENT OUTAGE RECOVERY + CENTRAL READINESS/CONFLICT POLICY + OPERATOR/WORKER CONCURRENCY PROTECTION + SEPARATE ATTEMPT/PROVIDER/VERIFICATION STATE — AND NEVER ALLOW CALENDAR CARDS, DRAG POSITION, VIEWER TIMEZONE, `LATEST` VERSION LOOKUPS, PAST DATES, GENERIC `SCHEDULEDAT` FIELDS, CLIENT CLOCKS OR GLOBAL CALENDAR EVENTS TO SUBSTITUTE FOR OR REWRITE CANONICAL PUBLICATION SCHEDULE, RELEASE VERSION, TARGET EXECUTION OR VERIFIED PUBLICATION TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **126 / 153** |
| **PASS**                                   |                        **126** |
| **STANDARDIZE decisions**                  |                        **124** |
| **Potential implementation-overlap flags** |                        **117** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**126 / 153 = 82.4% audited.**

### Canonical Publishing Calendar architecture after Design 126

```text
PUBLICATION PUB-100
        │
        ↓
PublicationVersion v3
        │
        ↓
Website Target
        │
        ↓
PublicationSchedule PS-20
Aug 25 · 09:00 Europe/Berlin
        │
    ┌───┼──────────────┐
    ↓   ↓              ↓
 Queue Detail       Calendar
 124   125            126
    │   │              │
    └───┴──────┬───────┘
               ↓
        same PS-20
               ↓
        Scheduler Worker
               ↓
       PublicationAttempt
```

The exact-version scheduling rule remains absolute:

```text
PS-20:
Aug 25
Website
Release v3

Later:
Release v4 created

Calendar still shows:

Aug 25
Website
v3

v4 is NEVER substituted
without an explicit
governed Version change.
```

Timezone semantics are also now protected:

```text
Business intent:
09:00 Europe/Berlin

Canonical execution instant:
07:00 UTC

User in India may see:
12:30 Asia/Kolkata

But viewing the Calendar
from India does NOT change
the release time.
```

Scheduler/operator concurrency remains explicit:

```text
08:59:59
Operator tries to move
the release to tomorrow

09:00:00
Worker claims PS-20

Server resolves one
authoritative state.

It must NEVER:

publish today
AND
silently show tomorrow.
```

And Calendar chronology does not equal publishing outcome:

```text
Scheduled for 09:00
        ≠
Attempt started

Attempt started
        ≠
Provider accepted

Provider accepted
        ≠
Verified live

Calendar date passed
        ≠
Published
```

Each remains independently canonical.

## Next Sequential Audit Target

### **Design 127 — Distribution Campaign Management**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
