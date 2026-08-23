# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 118 — Project Timeline / Gantt Detail

Design 118 should become the **canonical Team Workspace Project schedule-composition, timeline, Gantt, dependency-visualization, planned/forecast/actual date, and schedule-impact surface** for one Project.

It must compose the canonical Project from Design 023, runtime Tasks/Milestones from Design 111, Project workflow stages from Designs 108–110, resource allocations from Design 112, Client Requests from Design 116, applied scope changes from Design 117, Deliverables from Design 114, Approvals from Design 115, and Risks/Blockers from Design 113.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **ProjectTimelineView ≠ GanttItem ≠ ScheduleEntry ≠ Project ≠ ProjectWorkflowStage ≠ Task ≠ Milestone ≠ TaskDependency ≠ ClientRequest ≠ Deliverable ≠ ResourceAllocation ≠ ChangeRequest ≠ ProjectRisk/Blocker ≠ PlannedDate ≠ ForecastDate ≠ ActualDate.**

The central implementation rule is:

> **Design 118 visualizes and coordinates canonical scheduled Project entities; it does not create a second Gantt-specific Project model. Every bar, marker, dependency line, date, and milestone must resolve to a canonical source entity. Timeline drag/resizing, dependency changes, or date edits—if present in the frozen design—must invoke the owning Task, Milestone, Project workflow, ClientRequest, Deliverable, or resource service. Proposed schedule impacts from an unapplied Change Request remain proposals and cannot become current schedule merely because they appear in the Gantt. Planned, forecast, and actual dates must remain separate historical facts.**

---

# 1. Classification

| Audit field                        | Classification                                                                                                                                                                                       |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                      | **118**                                                                                                                                                                                              |
| **Canonical name**                 | **Project Timeline / Gantt Detail**                                                                                                                                                                  |
| **Product area**                   | Team Workspace / Projects / Scheduling & Delivery Planning                                                                                                                                           |
| **User surface**                   | **Authenticated Team Workspace**                                                                                                                                                                     |
| **Screen class**                   | Project Detail Variant / Timeline / Gantt / Schedule Coordination Workspace                                                                                                                          |
| **Classification**                 | **Canonical Project Schedule Composition, Gantt Projection & Dependency-Impact Anchor**                                                                                                              |
| **Primary purpose**                | Visualize one Project's current applied schedule across canonical Tasks, Milestones, stages, dependencies and other scheduled Project entities while safely coordinating authorized schedule changes |
| **Primary parent**                 | **Project** — Design 023                                                                                                                                                                             |
| **Primary work inputs**            | Task / Milestone — Design 111                                                                                                                                                                        |
| **Workflow input**                 | ProjectWorkflow / ProjectStageInstance                                                                                                                                                               |
| **Dependency input**               | TaskDependency / Milestone dependency/requirement                                                                                                                                                    |
| **Resource input**                 | ResourceAllocation — Design 112                                                                                                                                                                      |
| **Risk input**                     | ProjectRisk / ProjectBlocker — Design 113                                                                                                                                                            |
| **Deliverable input**              | Deliverable — Design 114                                                                                                                                                                             |
| **Approval input**                 | Project Approval Gate / ApprovalRequest — Design 115                                                                                                                                                 |
| **Client dependency input**        | ClientRequest — Design 116                                                                                                                                                                           |
| **Change-control input**           | Applied Project Change / proposed schedule impact — Design 117                                                                                                                                       |
| **Calendar dependency**            | Design 035                                                                                                                                                                                           |
| **Client timeline dependency**     | Design 044                                                                                                                                                                                           |
| **Activity dependency**            | Design 119                                                                                                                                                                                           |
| **Closeout dependency**            | Design 120                                                                                                                                                                                           |
| **Timeline projection**            | `ProjectTimelineView`                                                                                                                                                                                |
| **Visual item projection**         | `ProjectTimelineItem` / `GanttItem`                                                                                                                                                                  |
| **Primary query service**          | `ProjectTimelineQueryService`                                                                                                                                                                        |
| **Schedule orchestration service** | `ProjectScheduleCoordinationService`                                                                                                                                                                 |
| **Dependency analysis service**    | `ProjectScheduleDependencyResolver`                                                                                                                                                                  |
| **Forecast resolver**              | `ProjectScheduleForecastResolver`                                                                                                                                                                    |
| **Critical-path resolver**         | `ProjectCriticalPathResolver` if actually required                                                                                                                                                   |
| **Parent shell**                   | `InternalAppShell` — Design 001                                                                                                                                                                      |
| **Auth**                           | Required                                                                                                                                                                                             |
| **Authorization**                  | Active OrganizationMembership + Project/schedule/source-entity permissions                                                                                                                           |
| **Implementation priority**        | **Critical Delivery Scheduling / Dependency Integrity / Date-History Safety**                                                                                                                        |
| **Reuse level**                    | **Extremely High across Project operations, Calendar, client progress, workload, reporting and closeout**                                                                                            |

Design 118 should answer:

> **“What is the Project's actual current schedule, which canonical items occupy that schedule, what depends on what, what was originally planned, what is now forecast, what has actually happened, which items are late or blocking others, and what would be affected by an authorized date/dependency change?”**

Canonical composition:

```text
Project PR-100
      │
      ├── ProjectWorkflow stages
      ├── Tasks
      ├── Milestones
      ├── ClientRequests
      ├── Deliverables
      ├── Approvals / gates
      └── Resource context
              │
              ↓
      ProjectTimelineQueryService
              │
              ↓
       ProjectTimelineView
              │
       ┌──────┼───────┐
       ↓      ↓       ↓
     Bars   Markers  Dependency lines

GanttItem is a projection.
Source entities remain canonical.
```

---

# 2. Reuse

## Design 111 remains Task/Milestone authority

Design 118 must reuse the same canonical:

```text
Task.id
Milestone.id
TaskDependency
```

already used by:

* Design 034,
* Design 078,
* Design 111,
* Design 035.

Do not create:

```text
GanttTask
TimelineTask
TimelineMilestone
```

as parallel runtime entities.

---

## GanttItem ≠ Task

Critical.

Correct:

```text
Task T-100
    ↓ project timeline adapter
GanttItem GI-100
```

`GI-100` is a projection for visualization.

Task state remains in `TaskService`.

---

## GanttItem ≠ Milestone

Same rule.

---

## GanttItem ≠ ProjectStageInstance

Same rule.

---

## One timeline may contain heterogeneous source types

Conceptually:

```text
ProjectTimelineItem
├── TASK
├── MILESTONE
├── WORKFLOW_STAGE
├── CLIENT_REQUEST
├── DELIVERABLE
└── other frozen-supported type
```

A discriminated projection is correct.

A generic writable `TimelineItem` business entity is not.

---

## Design 035 Calendar and Design 118 share schedule facts

Calendar may project:

```text
Task dueAt
Milestone targetDate
Meeting time
Publication schedule
```

Design 118 may visualize some of the same facts.

Neither Calendar nor Gantt should maintain independent duplicate dates.

---

## Calendar event ≠ Gantt item

Permanent.

Both are projections over source scheduling facts.

---

## Design 044 Client Timeline uses a client-safe projection

Design 044 and Design 118 may share:

* Project stage history,
* milestone dates,
* forecasted progress.

But they require different projections.

Internal schedule may include:

* internal Tasks,
* resource constraints,
* sensitive blockers.

Client timeline must remain filtered and simplified.

---

## Design 117 proposed schedule impact ≠ current schedule

This is one of Design 118's strongest boundaries.

Example:

```text
Current Project end forecast: Sep 20

Change Request CR-20 proposes:
+7 days
```

Until applied:

```text
canonical Project schedule
remains Sep 20
```

The proposed impact may appear as:

* comparison,
* overlay,
* warning,

**if present in the frozen design**.

It cannot overwrite the current timeline.

---

## Applied Change becomes canonical schedule input

After Design 117 applies the change through canonical services:

Design 118 simply reads the updated dates/dependencies.

It does not maintain a separate "changed timeline."

---

## Design 112 ResourceAllocation remains staffing truth

Gantt may visualize resource conflict context.

But:

```text
Gantt bar owner
≠
ResourceAllocation
```

and moving a Task does not automatically alter resource allocation unless an explicit canonical resource operation is required.

---

## Design 113 Risks/Blockers remain separate

A Blocker can affect schedule forecast.

It is not a Gantt task.

A Risk may influence forecast uncertainty.

It does not become an actual schedule delay until canonical dates/forecast reflect it.

---

## Design 115 Approval remains separate

An Approval gate may block stage progress.

Design 118 can visualize that dependency.

It cannot create or resolve Approval state.

---

## Design 116 ClientRequest remains separate

A Client dependency can delay downstream work.

The timeline may reflect its due date or dependent items.

Changing its deadline must use `ClientRequestService`.

---

# 3. Entities

## ProjectTimelineView

A rebuildable read projection.

Conceptually:

```text
ProjectTimelineView
├── projectId
├── timeline window
├── items[]
├── dependencyEdges[]
├── currentDate
├── schedule summary
├── forecast summary
├── critical-path summary?
├── calculatedAt
└── source revisions
```

It is not canonical write storage.

---

## ProjectTimelineItem / GanttItem

Conceptually:

```text
ProjectTimelineItem
├── sourceType
├── sourceId
├── sourceRevision
├── label
├── plannedStart?
├── plannedEnd?
├── forecastStart?
├── forecastEnd?
├── actualStart?
├── actualEnd?
├── due/target date?
├── progress projection?
├── dependency state
└── permission-safe metadata
```

All writable values must resolve back to canonical source entities.

---

## Planned date ≠ Forecast date ≠ Actual date

Absolute.

### Planned

Original/current approved schedule baseline.

### Forecast

Current expected timing based on Project reality.

### Actual

What actually happened.

Example:

```text
Planned completion: Sep 10
Forecast completion: Sep 15
Actual completion: —
```

Do not overwrite Sep 10 with Sep 15.

---

## Planned dates should preserve history

If the Project schedule is formally rebaselined:

preserve:

* original plan,
* approved revised baseline,
* current forecast.

Do not mutate history invisibly.

Exact baseline model belongs to Phase 3D.

---

## Forecast ≠ commitment

Permanent.

A forecast can change without a formal scope/baseline change.

---

## Actual dates should be event-driven where possible

Example:

```text
actualTaskCompletedAt
```

should derive from canonical Task completion evidence.

Do not manually drag an actual-completion bar to another date.

---

## Task dates

Possible canonical Task scheduling facts include:

```text
plannedStartAt
plannedDueAt / dueAt
startedAt
completedAt
```

Exact schema Phase 3D.

Timeline should not invent different fields for the same semantics.

---

## Milestone dates

Conceptually:

```text
targetDate
forecastDate?
achievedAt
```

Target ≠ achieved.

---

## Workflow stage timing

Runtime stage history may preserve:

```text
enteredAt
exitedAt
planned window?
forecast exit?
```

Actual stage history remains Project workflow truth.

---

## Stage duration ≠ Task duration

Permanent.

---

## DependencyEdge

The Gantt can project:

```text
TaskDependency
MilestoneDependency
stage dependency
other supported typed dependency
```

as edges.

The edge visualization is not the dependency entity.

---

## Visual dependency line ≠ canonical dependency

Absolute.

Deleting a line visually must invoke the owning dependency service.

---

## Dependency type should be explicit

Where richer scheduling is supported, types may conceptually include:

* finish-to-start,
* start-to-start,
* finish-to-finish,
* lag/lead.

Do not invent these if frozen product only requires simple dependencies.

Architecture should not infer semantics merely from a line.

---

## Lag ≠ date

A dependency rule like:

> start two days after predecessor completes

is distinct from the resulting calculated date.

---

## Due date ≠ duration

Permanent.

---

## Duration ≠ effort

Critical.

A Task may take:

* 5 calendar days,
* 12 hours of effort.

These are not equivalent.

---

## Duration ≠ ResourceAllocation

Permanent.

---

## Progress projection

If bars show percentage/progress:

that value must come from canonical source rules.

For a Task:

* lifecycle/completion.

For a stage:

* stage-specific progress resolver.

For Project:

* Design 023 Project progress.

Never derive universal progress from elapsed time alone unless explicitly defined.

---

## 50% elapsed time ≠ 50% Task complete

Absolute.

---

## Schedule baseline

If formal baseline snapshots are supported:

```text
ProjectScheduleBaseline
├── id
├── projectId
├── version
├── approvedAt
├── source change/control reference
└── schedule snapshot/reference
```

could preserve approved schedule state.

Do not create it unnecessarily if planned-date history already supports the requirement.

Exact physical model Phase 3D.

---

## Critical path

If the frozen design displays a critical path:

it must be a derived calculation over:

* canonical dependencies,
* durations,
* calendars,
* current schedule.

It is not a manually editable Task flag.

---

## Critical ≠ high priority

Permanent.

A low-priority Task may be on the critical path.

A high-priority Task may have schedule slack.

---

## Slack/float

If used, derived.

Never manually persisted as long-term source truth unless materialized with source revisions.

---

## Project forecast

`ProjectScheduleForecast` should be derived using current canonical schedule/dependency data.

Conceptually:

```text
forecastCompletion
scheduleVariance
affectedItems
calculatedAt
sourceRevisions
```

---

## Forecast completion ≠ target completion

Permanent.

---

## Schedule variance

Derived from comparable planned vs forecast/actual dates.

Do not store multiple conflicting formulas across dashboards/reports.

---

# 4. Permissions

Design 118 should conceptually distinguish:

```text
projectTimeline.read

task.schedule.edit
task.dependencies.manage

milestone.schedule.edit
milestone.dependencies.manage

projectSchedule.forecast.read
projectSchedule.baseline.manage

projectWorkflow.schedule.edit

clientRequest.schedule.edit

resourceSchedule.read
```

Exact permission keys belong to Phase 3D.

---

## Timeline read ≠ Task edit

Permanent.

---

## Task edit ≠ Task schedule edit necessarily

Potentially separate.

---

## Gantt drag permission ≠ all source edit permissions

Critical.

A user may be able to move:

* Tasks,

but not:

* ClientRequests,
* Approval gates,
* contract-driven milestones.

Each source type must validate separately.

---

## Project owner ≠ schedule override authority universally

Permanent.

---

## Schedule baseline change may require stronger permission

Especially if it represents formal approved delivery commitment.

---

## Forecast edit vs baseline edit

If forecast is system-derived, users cannot arbitrarily edit it.

If manual forecasting exists, it should be separately governed.

---

## Actual dates should not be freely editable

Historical actuals derive from canonical events.

Correction requires explicit source-domain correction authority.

---

## Direct GanttItem ID grants nothing

Because GanttItem is projection.

Mutation request must identify and authorize canonical source entity.

---

## Source entity reauthorization required

Every timeline action rechecks:

* Project access,
* source access,
* operation permission,
* current revision.

---

## Client-visible timeline permissions remain separate

Internal schedule access never implies that the same data can be exposed in Design 044.

---

## Resource detail access can be restricted

Timeline can display:

> Resource conflict

without exposing confidential workloads from unrelated Projects.

---

## Cross-tenant dependency edges prohibited

Absolute.

---

## Cross-Project dependencies require explicit policy

Design 118 must not assume that one Project Task can depend on another Project's Task.

If future cross-Project dependencies are supported, they require explicit authorization and modeling.

---

# 5. States

Design 118 must keep **source lifecycle, schedule condition, planned/forecast/actual timing, dependency condition, variance, baseline state, and data freshness** independent.

### Timeline item schedule condition

Conceptually:

```text
Not Scheduled
Scheduled
Due Soon
Overdue
Completed On Time
Completed Late
Blocked
Schedule Unknown
```

### Dependency condition

```text
Satisfied
Waiting
Blocked
Unknown
Invalid
```

### Forecast

```text
On Track
Forecast Delay
Forecast Ahead
Unknown
```

### Baseline

```text
No Baseline
Current Baseline
Superseded Baseline
Baseline Stale
```

### Timeline data

```text
Fresh
Stale
Partial
Unavailable
```

These must not collapse into one generic `timeline.status`.

---

## Scheduled ≠ Started

Permanent.

---

## Started ≠ On Track

Permanent.

---

## Overdue ≠ Blocked

Critical.

---

## Blocked ≠ Delayed universally

A short-lived blocker may not yet move forecast.

---

## Forecast delayed ≠ baseline changed

Absolute.

---

## Baseline changed ≠ Change Request proposed

Only applied/authorized schedule change changes current baseline.

---

## Proposed change ≠ current schedule

Absolute.

---

## Completed ≠ completed on time

Permanent.

---

## Completed late history must remain visible

Do not remove variance after completion.

---

## Actual completion ≠ target date

Permanent.

---

## Dependency unknown ≠ satisfied

Critical.

---

## Resource data unavailable ≠ no conflict

Absolute.

---

## ClientRequest unavailable ≠ dependency cleared

Absolute.

---

## Approval unavailable ≠ gate clear

Absolute.

---

## Gantt projection unavailable ≠ source records deleted

Permanent.

---

## State Coverage

Design 118 inherits Design 150 plus:

```text
Project Timeline Loading
Project Timeline Available
Project Timeline Empty
Project Timeline Restricted
Project Timeline Partial

Timeline Item Scheduled
Timeline Item Not Scheduled
Timeline Item In Progress
Timeline Item Completed
Timeline Item Cancelled

Item Not Due
Item Due Soon
Item Due Today
Item Overdue
Item Due State Unknown

Planned Date Available
Planned Date Missing
Forecast Date Available
Forecast Date Unknown
Actual Date Available
Actual Date Not Yet Available

Schedule On Track
Schedule Forecast Delay
Schedule Forecast Ahead
Schedule Forecast Unknown

Dependency Satisfied
Dependency Waiting
Dependency Blocked
Dependency Unknown
Dependency Invalid

Current Schedule Baseline
No Schedule Baseline
Schedule Baseline Superseded
Schedule Baseline Stale

Current Applied Schedule
Proposed Change Impact Available
Proposed Change Not Applied
Applied Change Reflected

Resource Conflict Detected
Resource Availability Unknown

Client Dependency Active
Client Dependency Unavailable

Approval Gate Active
Approval Gate Unknown

Timeline Updated Elsewhere
Task Schedule Updated Elsewhere
Milestone Updated Elsewhere
Dependency Updated Elsewhere
Project Baseline Updated Elsewhere
Timeline Conflict
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize:

1. **time scale;**
2. **canonical scheduled items;**
3. **dependencies;**
4. **planned/forecast/actual differences;**
5. **schedule variance;**
6. **frozen-design editing controls.**

Conceptually:

```text
Project Timeline / Gantt
↓
Schedule summary
↓
time scale
↓
Task / Milestone / Stage rows
      ├── planned
      ├── forecast
      ├── actual
      └── dependency lines
↓
schedule impact / variance
```

Only elements present in the frozen Design 118 should render.

---

## Current schedule and proposed changes must not look identical

If Design 117's proposed schedule impact is shown:

use a clearly secondary/differentiated comparison state.

Never visually imply:

> proposed +7 days has already changed the Project.

---

## Planned vs forecast should be distinguishable

Example:

> Planned finish: Sep 10
> Forecast finish: Sep 15

not one bar whose original commitment disappears.

---

## Actual completion should remain immutable-looking

Historical actuals should not appear as ordinary draggable planned bars.

---

## Dependency lines must retain meaning

A visual line must correspond to:

* canonical dependency source,
* source/target IDs,
* dependency semantics.

No decorative/implicit connectors.

---

## Tablet

Following Design 152:

* timeline window shortens,
* horizontal scrolling can be controlled,
* source item details become compact,
* dependency details can move to selected-item panels,
* dates/variance stay readable.

---

## Mobile

A full desktop Gantt should not be miniaturized into unreadability.

Priority should become:

```text
Project schedule summary
↓
Next milestone
↓
Overdue / blocked items
↓
Task / Milestone chronological list
↓
Dependencies
↓
Planned vs forecast dates
```

A structured timeline/list representation is a valid responsive adaptation while preserving the same canonical data.

---

## Mobile schedule editing

If frozen design allows date changes:

use deliberate date/dependency controls rather than precision drag gestures that are unsafe on small screens.

---

## Accessibility

A timeline item could communicate:

> Task T-42, Cover Design. Planned August 20 through August 24. Current forecast completion August 27, three days late. Work began August 20. The task is blocked by Client Request CRQ-20 and Milestone M-4 depends on its completion.

where authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical timeline architecture

```text
Design 118
    ↓
Authenticated Workspace Context
    ↓
ProjectTimelineQueryService
    │
    ├── ProjectWorkflowAdapter
    ├── TaskAdapter
    ├── MilestoneAdapter
    ├── DependencyAdapter
    ├── ClientRequestAdapter
    ├── DeliverableAdapter
    ├── ApprovalGateAdapter
    ├── ResourceAdapter
    ├── Risk/BlockerAdapter
    ├── ChangeApplicationAdapter
    └── ForecastResolver
    ↓
ProjectTimelineView
```

Timeline writes route back through owning source services.

---

## Do not persist a duplicate Gantt database

Avoid canonical tables like:

```text
GanttTask
GanttMilestone
GanttDependency
```

if they merely duplicate Task/Milestone/dependency records.

Materialized read projections are acceptable if rebuildable.

---

## Timeline query service

Conceptually:

```text
getProjectTimeline(
    projectId,
    window,
    filters,
    currentMembership
)
```

should:

1. authorize Project;
2. load canonical schedule sources;
3. create permission-safe projections;
4. resolve dates/dependencies;
5. calculate forecast/variance;
6. return source revisions/freshness.

---

## Typed timeline adapters

Prefer:

```text
TaskTimelineAdapter
MilestoneTimelineAdapter
WorkflowStageTimelineAdapter
ClientRequestTimelineAdapter
DeliverableTimelineAdapter
```

rather than one generic mutable schedule record.

---

## Date mutation command

If a Task is moved:

```text
rescheduleTask(
    taskId,
    newStart?,
    newDue?,
    expectedTaskRevision,
    idempotencyKey
)
```

through canonical TaskService.

If Milestone target changes:

use MilestoneService.

If ClientRequest due date changes:

use ClientRequestService.

---

## Gantt drag must not directly patch projection rows

Absolute.

---

## Source-specific rules still apply

Moving:

* a Task may be allowed;
* contract-derived milestone may require change control;
* ClientRequest due date may need client communication;
* Project stage actual dates may be non-editable.

One generic drag handler cannot bypass these rules.

---

## Schedule coordination service

For multi-item adjustments, use an orchestration layer:

```text
ProjectScheduleCoordinationService
```

which invokes canonical source-domain commands.

It is not a second source of schedule truth.

---

## Dependency mutation

If a timeline edge changes:

invoke:

```text
TaskDependencyService
MilestoneDependencyService
```

or the relevant canonical dependency service.

---

## Cycle validation

Blocking dependency edits require cycle detection before commit.

---

## Dependency changes can have downstream impact

Before accepting change, system may need to evaluate:

* affected dates,
* blocked successors,
* milestone forecast,
* Project completion forecast.

Exact UX depends on frozen design.

---

## Planned-date preservation

A reschedule command must distinguish:

### Forecast adjustment

> current expectation changed.

from:

### Baseline change

> formally approved planned commitment changed.

These should not be implemented as the same field update.

---

## Baseline changes

Where formal baseline control exists, use:

```text
createProjectScheduleBaseline(...)
```

or a governed revision mechanism linked to:

* Project Change Application,
* authorized rebaseline action.

Do not simply overwrite old planned dates.

---

## Design 117 integration

When ChangeApplication succeeds:

its downstream schedule commands update canonical dates/baselines.

Design 118 then reflects them.

For unapplied changes:

timeline may only show a proposal/impact projection if supported.

---

## Proposed timeline overlay cannot be mutation source

Dragging a proposed Change impact must not silently apply the ChangeRequest.

---

## Forecast resolver

Conceptually:

```text
ProjectScheduleForecastResolver.resolve(projectId)
```

may consider:

* incomplete Tasks;
* actual progress;
* dependency chain;
* Milestones;
* active Blockers;
* ClientRequests;
* resource constraints;
* workflow stage.

---

## Forecast needs freshness metadata

```text
calculatedAt
sourceRevisions
forecastPolicyVersion
```

where appropriate.

---

## Forecast ≠ deterministic promise

If input is uncertain, return uncertainty/unknown rather than fabricated precision.

---

## Critical path resolver

If frozen Design 118 exposes critical path:

derive from canonical durations/dependencies.

It must:

* re-run after dependency/date changes;
* be project-scoped;
* respect working calendars if supported;
* expose calculation freshness.

---

## Critical path cannot be manually toggled

Absolute.

---

## Working calendar/timezone

Scheduling must use centralized:

* Project timezone,
* Organization calendar,
* working-day rules,

where applicable.

Do not calculate `+2 days` independently in frontend.

---

## DST/timezone safety

Store canonical timestamps with timezone-aware semantics.

Date-only milestones must remain date concepts if no specific time is intended.

---

## Date-only ≠ midnight UTC

Critical.

A Milestone "August 30" should not become August 29/31 in another timezone due to careless timestamp conversion.

---

## Duration calculations

Use working/calendar-day policy consistently.

Do not let:

* Timeline,
* Calendar,
* Reporting

calculate durations differently.

---

## Actual start/end

Source-domain events should update actual dates.

Examples:

```text
TaskStarted
TaskCompleted
MilestoneAchieved
ProjectStageEntered
ProjectStageExited
```

Timeline consumes those events.

---

## Actual date correction

If incorrect historical data must be corrected:

use explicit source correction with Audit.

Never drag an actual marker casually.

---

## Resource integration

Task schedule change may cause:

```text
ResourceAllocation conflict
```

but Timeline must query Design 112's capacity resolver.

It does not write:

```text
resource.available = false
```

itself.

---

## Resource conflict does not block scheduling automatically universally

Whether to:

* warn,
* block,
* require override

is policy-driven.

---

## ClientRequest integration

Due changes use ClientRequest service and may trigger new reminders/notifications.

Changing a Gantt marker cannot bypass request policy.

---

## Approval integration

Timeline may show:

> Approval gate pending.

It cannot forecast as complete unless the gate actually passes or forecast policy explicitly models expected timing.

Known approval state and estimated future approval timing must be different data.

---

## Risk/Blocker integration

Active Blocker can contribute to forecast delay.

Resolving Blocker invalidates forecast.

Risk may contribute to forecast uncertainty rather than definite date changes.

---

## Deliverable integration

Deliverable target dates remain canonical Deliverable/Project schedule data.

File upload timestamp ≠ Deliverable completion date.

---

## Project completion forecast

May be derived from:

* required terminal Milestone,
* workflow completion,
* remaining critical schedule.

It is not Project lifecycle completion.

---

## Timeline progress

Do not infer Task completion from bar length/time elapsed.

Consume canonical Task/Milestone/workflow progress.

---

## Bulk schedule movement

If frozen Design 118 supports moving multiple items:

use an orchestrated command with:

* per-source authorization;
* dependency validation;
* baseline impact;
* idempotency;
* partial-outcome handling.

No blind mass date updates.

---

## Partial bulk mutation

If 8 of 10 date changes succeed:

do not present complete success.

Return per-item outcomes and reconcile dependent forecast.

---

## Optimistic concurrency

All schedule edits need expected revisions.

Common race:

```text
Manager A moves Task to Sep 8
Manager B completes Task from stale screen
```

The final result must preserve completion truth and reject/resolve incompatible scheduling edits.

---

## Idempotency

Schedule commands and dependency edits must be replay-safe.

---

## Forecast recalculation events

Useful triggers:

```text
TaskRescheduled
TaskCompleted
TaskReopened
MilestoneTargetChanged
MilestoneAchieved
DependencyChanged
ClientRequestUpdated
ProjectBlockerCreated
ProjectBlockerResolved
ResourceAllocationChanged
ProjectChangeApplied
```

---

## Calendar integration

Design 035 reads the same canonical dates.

If a Task due date changes from Design 118:

Calendar reflects it after canonical mutation.

There is no second calendar sync write required internally beyond projection invalidation.

---

## Client Timeline integration

Design 044 consumes a sanitized:

```text
ClientProjectTimelineView
```

derived from the same source facts.

Internal-only Task/dependency/resource details remain excluded.

---

## Activity

Design 119 may project:

* Task rescheduled;
* Milestone target changed;
* baseline revised;
* Change applied.

Activity does not become schedule truth.

---

## Audit

Material schedule actions should include:

* baseline changes;
* major date shifts;
* dependency changes;
* exceptional resource conflict override;
* actual-date corrections;
* bulk schedule operations.

Routine forecast recalculation is operational telemetry/read-model activity, not necessarily Audit noise.

---

## Notifications

Design 080 may notify:

* date reassignment;
* deadline moved;
* milestone risk;
* dependency change.

Notification read state never changes schedule.

---

## Search

Design 079 may index safe Task/Milestone dates.

Search is never date/update authority.

---

## Caching

Project Timeline caches should vary by:

```text
organizationMembershipId
projectId
authorizationRevision
projectWorkflowRevision
taskRevision aggregate
milestoneRevision
dependencyRevision
clientRequestRevision
deliverableRevision
resourceRevision
blockerRevision
changeApplicationRevision
forecastRevision
```

---

## Forecast caches require source revision awareness

A forecast from before:

```text
TaskCompleted
```

must not continue to appear current.

---

## Performance

Use:

* Project-scoped indexed date queries;
* bounded timeline windows;
* batched source adapters;
* dependency graph preloading;
* aggregated schedule summary;
* lazy detail/history;
* incremental forecast recalculation where appropriate.

Avoid one backend request per bar/edge.

---

## Partial failure contract

Example:

```text
Project core        ✓
Tasks               ✓
Milestones          ✓
Dependencies        ✓
Resources           ✕
ClientRequests      ✓
Forecast            partial
```

Correct:

> Project schedule is available. Resource-aware forecast/conflict analysis is currently incomplete.

Incorrect:

> No resource conflicts.

Another:

```text
Timeline projection ✓
Task service        ✓
Approval service    ✕
```

Correct:

> Approval-dependent timeline state unavailable.

Not:

> Approval completed.

---

## Backend Requirement Matrix

| Requirement                                            | Status                          |
| ------------------------------------------------------ | ------------------------------- |
| Canonical Project reuse from 023                       | **Critical**                    |
| Canonical Task/Milestone reuse from 111                | **Critical**                    |
| Timeline projection/source-entity separation           | **Critical**                    |
| GanttItem/Task separation                              | **Critical**                    |
| GanttItem/Milestone separation                         | **Critical**                    |
| GanttItem/Stage separation                             | **Critical**                    |
| Visual edge/canonical dependency separation            | **Critical**                    |
| Design 035 schedule fact reuse                         | **Critical**                    |
| Design 044 client-safe timeline reuse                  | **Critical**                    |
| Planned/forecast/actual separation                     | **Critical**                    |
| Forecast/commitment separation                         | **Critical**                    |
| Actual dates/source events separation                  | **Critical**                    |
| Target/actual Milestone date separation                | **Critical**                    |
| Duration/effort separation                             | **Critical**                    |
| Duration/ResourceAllocation separation                 | **Critical**                    |
| Due date/duration separation                           | **Critical**                    |
| Progress/elapsed-time separation                       | **Critical**                    |
| Baseline/forecast separation                           | **Critical**                    |
| Baseline history retention                             | **Critical if baseline exists** |
| Proposed Change/current schedule separation            | **Critical**                    |
| Applied Change/current schedule integration            | **Critical**                    |
| Stale proposed Change cannot mutate schedule           | **Critical**                    |
| Task reschedule through TaskService                    | **Critical**                    |
| Milestone reschedule through MilestoneService          | **Critical**                    |
| ClientRequest date change through ClientRequestService | **Critical**                    |
| Dependency change through canonical service            | **Critical**                    |
| Dependency cycle validation                            | **Critical**                    |
| Source-specific drag/drop authorization                | **Critical if editable**        |
| Actual-date direct editing prohibited/default          | **Critical**                    |
| Resource conflict resolver reuse                       | **Critical**                    |
| Risk/Blocker forecast integration                      | **Critical**                    |
| Approval gate integration                              | **Critical**                    |
| Forecast freshness/source revisions                    | **Critical**                    |
| Working-calendar consistency                           | **Critical where used**         |
| Timezone/DST safety                                    | **Critical**                    |
| Date-only/timestamp separation                         | **Critical**                    |
| Critical path derived, not stored manually             | **Critical if present**         |
| Bulk edit per-source validation                        | **Critical if present**         |
| Schedule mutation idempotency                          | **Critical**                    |
| Optimistic concurrency                                 | **Critical**                    |
| Permission-safe timeline projection                    | **Critical**                    |
| Cross-tenant dependency prohibition                    | **Critical**                    |
| Cross-Project dependency explicit policy               | **Critical**                    |
| Design 119 Activity separation                         | **Critical architecture**       |
| Design 120 closeout separation                         | **Critical architecture**       |
| Audit/outbox integration                               | **Required**                    |
| Partial dependency failure handling                    | **Critical**                    |

---

# 8. Consolidation

Design 118 creates major architectural risk because Gantt UIs frequently become accidental duplicate scheduling databases.

**ProjectTimelineView / Project conflation**
Read projection becomes Project source truth.

**GanttItem / Task conflation**
Visual bar becomes another Task.

**GanttItem / Milestone conflation**
Marker becomes another Milestone.

**GanttItem / ProjectStage conflation**
Workflow state is stored in timeline objects.

**Timeline row / source identity conflation**
One generic record erases Task/Milestone/ClientRequest semantics.

**Visual dependency line / TaskDependency conflation**
Frontend connector becomes backend relationship.

**Display order / dependency conflation**
Items next to each other appear dependent.

**TaskDependency / workflow transition conflation**
Work planning and Project stage rules merge.

**Planned date / forecast date conflation**
Original commitment disappears when forecast slips.

**Forecast date / actual date conflation**
Prediction becomes historical fact.

**Target date / actual completion conflation**
Milestone evidence is rewritten.

**Schedule variance / lifecycle state conflation**
Late Project appears failed automatically.

**Overdue / blocked conflation**
Time condition and dependency condition merge.

**Blocked / delayed conflation**
Temporary blocker automatically changes baseline.

**Forecast delay / baseline change conflation**
Prediction rewrites approved plan.

**Baseline change / ordinary drag conflation**
User silently changes formal delivery commitment.

**Baseline change / Change Request proposal conflation**
Unapproved scope adjustment becomes Project truth.

**Proposed Change impact / applied schedule conflation**
Design 117 governance is bypassed.

**Applied Change / alternate timeline conflation**
Two Project schedules coexist.

**Task date / Calendar projection conflation**
Calendar and Project dates diverge.

**Gantt date / Task due date conflation**
Timeline stores independent deadline.

**Milestone marker / Milestone target conflation**
Visual position becomes canonical date.

**Actual start / draggable start conflation**
Historical evidence can be rewritten casually.

**Actual completion / forecast completion conflation**
Expected completion appears done.

**Duration / effort conflation**
Five-day Task becomes 40 hours automatically.

**Duration / allocation conflation**
Long Task implies full-time assignment.

**Elapsed time / Task progress conflation**
Half the bar elapsed means 50% done.

**Task progress / Project progress conflation**
Gantt completion controls Project percent.

**Critical path / priority conflation**
Scheduling mathematics becomes business priority.

**Critical path / manual flag conflation**
Users mark arbitrary Tasks critical.

**Slack / manually editable field conflation**
Derived schedule math becomes stale.

**Resource conflict / Task blocker conflation**
Capacity warning directly blocks work.

**Resource conflict / ProjectBlocker conflation**
Every over-allocation becomes formal issue.

**Resource availability / calendar availability conflation**
Private schedule data becomes Project resource truth.

**ClientRequest due date / Project Task date conflation**
External/client obligation becomes internal schedule item.

**ClientRequest timeline item / ClientRequest identity conflation**
Gantt edits bypass external dependency policy.

**Approval expected date / Approval completed date conflation**
Forecast and formal decision evidence merge.

**Approval unavailable / timeline cleared conflation**
Unknown gate appears complete.

**Risk forecast / actual delay conflation**
Potential risk immediately moves schedule.

**Blocker / Timeline item conflation**
Issue record becomes work item.

**Deliverable target / file upload date conflation**
Technical file activity changes delivery schedule.

**Project end forecast / Project completion conflation**
Predicted date becomes lifecycle completion.

**Working-day / calendar-day conflation**
Different screens calculate inconsistent dates.

**Date-only / timestamp conflation**
Timezone conversion shifts milestones.

**DST / fixed-hour arithmetic conflation**
Scheduled timestamps drift.

**Gantt drag / direct DB mutation conflation**
Source validation and permission are bypassed.

**One drag handler / all source types conflation**
User edits protected milestones/ClientRequests like ordinary Tasks.

**Bulk movement / blind date update conflation**
Dependencies and domain rules are skipped.

**Partial bulk success / full success conflation**
Timeline becomes inconsistent.

**Forecast cache / current forecast conflation**
Old schedule remains green after source changes.

**Timeline unavailable / Project deleted conflation**
Projection failure appears as missing Project data.

**Resource service unavailable / no conflicts conflation**
System fails open.

**Approval service unavailable / no gate conflation**
Unknown dependency disappears.

**Client service unavailable / no external dependency conflation**
Schedule becomes falsely clear.

**Internal timeline / Client timeline conflation**
Sensitive Tasks/resources leak to Portal.

**Activity event / schedule truth conflation**
History text substitutes source dates.

**Audit log / schedule state conflation**
Compliance evidence becomes current plan.

**Search result / date authority conflation**
Stale indexed date drives mutation.

**Generic `TimelineItem` writable entity**
All source-domain semantics collapse.

**Generic Gantt mega-PATCH**
Task, Milestone, ClientRequest, Project stage and resources mutate in one unsafe payload.

**118/035 duplicate schedule backend**
Calendar and Gantt disagree.

**118/044 duplicate client timeline truth**
Portal/internal progress diverge.

**118/111 duplicate Task/Milestone data**
Gantt becomes second work store.

**118/112 duplicate resource allocation**
Timeline bars become staffing records.

**118/113 duplicate Risk/Blocker schedule state**
Issue impact is copied.

**118/114 duplicate Deliverable dates**
Files workspace and Gantt disagree.

**118/115 duplicate Approval state**
Timeline owns gate completion.

**118/116 duplicate ClientRequest dates**
External dependency deadlines diverge.

**118/117 duplicate Change application state**
Gantt applies scope changes.

**118/119 duplicate history store**
Timeline history and Activity conflict.

**118/120 duplicate Project completion logic**
Gantt endpoint closes Project.

No additional screen is required.

These are **timeline projection, source-entity reuse, planned/forecast/actual separation, canonical dependencies, schedule baseline integrity, Change Request boundaries, date editing, resource/approval/client dependency integration, forecasting, concurrency, and responsive Gantt requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PROJECT SCHEDULE COMPOSITION, GANTT PROJECTION & DEPENDENCY-IMPACT ANCHOR**

**Domain directive:**
**ProjectTimelineView ≠ GanttItem ≠ ScheduleEntry ≠ Project ≠ ProjectWorkflowStage ≠ Task ≠ Milestone ≠ TaskDependency ≠ ClientRequest ≠ Deliverable ≠ ResourceAllocation ≠ ChangeRequest ≠ ProjectRisk/Blocker ≠ PlannedDate ≠ ForecastDate ≠ ActualDate.**

**Projection directive:**
Design 118 is primarily a schedule composition/read-model surface over canonical Project entities. A Gantt bar or marker never becomes the source entity itself.

**Task directive:**
Designs 034/111 remain the single Task authority. Task timing, completion and dependency mutations originating from Design 118 call those same services.

**Milestone directive:**
Design 111 remains canonical for Milestones. Target/achieved dates and requirements are never duplicated into Gantt-only records.

**Workflow directive:**
Project stage timing and actual stage transitions remain canonical ProjectWorkflow state. Timeline visualization cannot directly write stage history.

**Dependency directive:**
dependency lines project canonical dependency relations. Add/remove/change operations route through typed dependency services with cycle/reference validation.

**Calendar directive:**
Design 035 and Design 118 consume the same source scheduling facts. Calendar entries and Gantt items are projections, not independent deadline stores.

**Client-timeline directive:**
Design 044 derives a permission-safe client timeline from the same Project facts. Internal Tasks, resources, risks and confidential schedule detail remain excluded unless explicitly client-visible.

**Planned-date directive:**
planned schedule is preserved as Project commitment/baseline evidence rather than overwritten every time delivery expectations shift.

**Forecast directive:**
forecast dates represent current expected timing and remain distinct from approved planned dates and historical actual dates.

**Actual directive:**
actual start/completion timestamps come from canonical lifecycle events. Ordinary Gantt dragging cannot rewrite historical actual evidence.

**Variance directive:**
schedule variance is centrally derived from compatible planned/forecast/actual facts. Different dashboards/reports must not implement independent lateness formulas.

**Progress directive:**
Gantt progress consumes canonical source progress. Time elapsed, bar width or calendar percentage never becomes Task, Milestone or Project completion truth.

**Duration directive:**
calendar duration, working duration, effort and ResourceAllocation remain separate quantities with explicit units/policies.

**Baseline directive:**
formal schedule baseline changes preserve history and require governed commands. Ordinary forecast adjustment or visual drag cannot silently rebaseline the Project.

**Change-control directive:**
Design 117 remains authoritative for proposed scope/schedule changes. An unapplied Change Request may be visualized as proposed impact but cannot alter current schedule.

**Applied-change directive:**
once Design 117 applies an approved change through canonical downstream services, Design 118 simply renders those updated schedule facts. No secondary changed-timeline backend is created.

**Stale-change directive:**
a stale or superseded Change Request cannot be applied via Gantt manipulation.

**Resource directive:**
Design 112 remains authoritative for staffing/capacity. Resource conflicts may inform schedule warnings/forecasting but timeline bars never become ResourceAllocations.

**Risk directive:**
Design 113 remains authoritative for Risks/Blockers. They may affect forecast/visibility but Design 118 never creates or resolves them by moving bars.

**Approval directive:**
Design 115 remains authoritative for gate/Approval truth. Approval dependencies may block/affect timeline state but timeline interaction cannot fabricate an Approval decision.

**Client-dependency directive:**
Design 116 remains authoritative for ClientRequests. Their due dates and satisfaction state can affect timeline/dependencies, while any edit routes back to ClientRequestService.

**Deliverable directive:**
Design 114 remains authoritative for Deliverables/artifacts. Timeline shows delivery dates but never infers Deliverable completion from file uploads or bar position.

**Forecast-resolver directive:**
one `ProjectScheduleForecastResolver` should calculate forecast/variance using canonical schedule/dependency/blocker/resource/client inputs with source revision/freshness metadata.

**Unknown-forecast directive:**
missing source/resource/approval/client data results in partial/unknown forecast, never fabricated on-track status.

**Critical-path directive:**
if critical path exists in the frozen design, it is derived from the canonical dependency graph and schedule policy and never stored as an arbitrary user toggle.

**Working-calendar directive:**
date arithmetic uses one centralized Project/Organization calendar/timezone policy so Timeline, Calendar, reporting and workflow rules cannot produce different dates.

**Date-only directive:**
date-only milestones remain date semantics and must not be carelessly converted to midnight UTC timestamps that change calendar day across timezones.

**Drag/drop directive:**
if the frozen design supports Gantt dragging/resizing, each interaction becomes a source-specific authorized command. One generic frontend drag mutation cannot alter every entity type.

**Bulk-edit directive:**
bulk timeline changes require per-source authorization, dependency validation, concurrency control and partial-outcome handling.

**Concurrency directive:**
schedule edits use expected revisions so rescheduling, completion, dependency edits and Change Application cannot silently overwrite one another from stale views.

**Idempotency directive:**
rescheduling/dependency/orchestration commands are replay-safe. Network retries cannot add duplicate dependencies or apply date shifts twice.

**Cross-project directive:**
cross-Project dependencies are not assumed. They require explicit future domain policy and authorization if supported.

**Tenant directive:**
Project schedule items, dependencies and referenced resources remain tenant-scoped; cross-tenant schedule edges are prohibited.

**Permission directive:**
timeline read, Task/Milestone scheduling, dependency management, baseline management and source-domain editing remain independently server-authorized.

**Caching directive:**
timeline/forecast caches vary by Project/workflow/Task/Milestone/dependency/client/resource/blocker/change revisions and authorization. Cached forecast or green schedule status is never mutation authority.

**Performance directive:**
use bounded timeline windows, batched typed adapters, dependency graph preloading, aggregate summaries and lazy history instead of one call per bar/edge.

**Partial-failure directive:**
Tasks, Milestones, resources, ClientRequests, Approvals, Blockers, Deliverables and forecast services can fail independently. Missing dependencies never silently become no conflict, satisfied, or on schedule.

**Activity directive:**
Design 119 may project reschedules, dependency changes and baseline revisions, but Activity remains observational rather than canonical schedule state.

**Audit directive:**
formal baseline changes, significant schedule/date changes, dependency mutations, historical actual-date corrections and exceptional overrides generate actor/source-aware Audit evidence.

**Future-reuse directive:**
Design **119 — Project Activity / Project Audit Timeline** must consume canonical events produced by Tasks, Milestones, schedule changes, Approvals, ClientRequests, Deliverables, Risks, Change Requests and other Project domains. It must remain a chronological projection rather than another mutable Project state or schedule backend.

**Overlap directive:**
Designs **023, 035, 044, 111–120** must preserve one continuous **canonical Project/Task/Milestone/Stage/ClientRequest/Deliverable/resource facts → typed schedule adapters → internal Timeline/Gantt + client-safe Timeline + Calendar projections → forecast/variance/impact analysis** lineage while keeping current schedule, proposed changes, formal baselines, actual history and source-domain state independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE PROJECT TIMELINE & SCHEDULE-COMPOSITION FOUNDATION — CANONICAL SOURCE-ENTITY DATES + NON-MUTABLE GANTT/TIMELINE PROJECTIONS + EXPLICIT TYPED DEPENDENCY EDGES + DISTINCT PLANNED/FORECAST/ACTUAL DATES + HISTORY-PRESERVING SCHEDULE BASELINES + CENTRAL FORECAST/VARIANCE/CALENDAR LOGIC + SOURCE-SPECIFIC AUTHORIZED DATE/DEPENDENCY COMMANDS + EXACT DESIGN-117 PROPOSED/APPLIED CHANGE SEPARATION + RESOURCE/CLIENT/APPROVAL/BLOCKER-AWARE FORECASTING + IDEMPOTENT CONCURRENCY-SAFE SCHEDULE MUTATION — AND NEVER ALLOW VISUAL BAR POSITION, GANTT DRAGGING, ELAPSED TIME, “LATEST” CHANGE PROPOSALS, CACHED FORECASTS, RESOURCE WARNINGS OR GENERIC TIMELINE ITEMS TO SUBSTITUTE FOR OR REWRITE CANONICAL TASK, MILESTONE, WORKFLOW, CLIENT-DEPENDENCY, DELIVERABLE, APPROVAL, PROJECT-BASELINE OR PROJECT-COMPLETION TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **118 / 153** |
| **PASS**                                   |                        **118** |
| **STANDARDIZE decisions**                  |                        **116** |
| **Potential implementation-overlap flags** |                        **109** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**118 / 153 = 77.1% audited.**

### Canonical Project timeline architecture after Design 118

```text
                    PROJECT PR-100
                           │
        ┌────────────┬─────┼─────┬─────────────┐
        ↓            ↓     ↓     ↓             ↓
      Tasks      Milestones Stages ClientRequests Deliverables
        │            │     │     │             │
        └────────────┴─────┼─────┴─────────────┘
                           ↓
                 canonical schedule facts
                           ↓
               ProjectTimelineQueryService
                           ↓
                  ProjectTimelineView
                           ↓
                     GANTT / TIMELINE
```

The strongest date distinction is now explicit:

```text
Task T-100

Planned finish  = Sep 10
Forecast finish = Sep 15
Actual finish   = —

These are three different facts.

Forecast slipping to Sep 15
does NOT erase the Sep 10 plan.
```

Gantt remains a projection:

```text
Task T-100
      ↓
Gantt bar

Move the Gantt bar
      ↓
TaskService.reschedule(...)
      ↓
Task date changes
      ↓
Timeline re-renders

The Gantt bar itself
never owns the date.
```

Change-control safety also remains intact:

```text
Current Project finish = Sep 20

Change Request v3 proposes:
+7 days

Before application:

Current schedule = Sep 20
Proposed impact  = Sep 27

After Design 117 applies v3:

Canonical Project schedule changes
        ↓
Design 118 reflects Sep 27.
```

And schedule projections stay separate from execution:

```text
Bar reached today
        ≠
Task completed

Milestone date passed
        ≠
Milestone achieved

Approval marker reached
        ≠
Approval granted

Forecast Project finish reached
        ≠
Project completed
```

Each remains governed by its canonical source domain.

## Next Sequential Audit Target

### **Design 119 — Project Activity / Project Audit Timeline**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
