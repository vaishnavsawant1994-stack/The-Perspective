# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 111 — Project Tasks / Milestones Detail

Design 111 should become the **canonical Team Workspace Project work-plan detail surface** for one Project’s runtime Tasks, Milestones, task dependencies, milestone dependencies, assignments, due dates, completion, and project-level work progress—built directly on the canonical Project foundation from Design 023, Task foundation from Design 034, and exact template/runtime separation established through Designs 108–110.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Project ≠ Task ≠ TaskDefinition ≠ Milestone ≠ MilestoneDefinition ≠ TaskDependency ≠ MilestoneDependency ≠ Assignment ≠ ProjectStage ≠ WorkflowGate ≠ ApprovalRequest ≠ ClientRequest ≠ FollowUp ≠ ProjectProgress ≠ ProjectHealth.**

The central implementation rule is:

> **Design 111 operates only on canonical runtime Project Tasks and Milestones. Template definitions from Designs 109–110 may instantiate them, but they never remain live runtime work. Task completion, Milestone completion, dependency state, Project stage, Approval state, Client Requests, FollowUps, Project progress, and Project health must remain independently modeled. A user completing a Task must never directly mutate Project stage, Milestone completion, Approval, Client Request, or overall Project completion through one generic status update.**

---

# 1. Classification

| Audit field                 | Classification                                                                                                                                                                                                             |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**               | **111**                                                                                                                                                                                                                    |
| **Canonical name**          | **Project Tasks / Milestones Detail**                                                                                                                                                                                      |
| **Product area**            | Team Workspace / Projects / Delivery Execution                                                                                                                                                                             |
| **User surface**            | **Authenticated Team Workspace**                                                                                                                                                                                           |
| **Screen class**            | Project Detail Variant / Work Plan / Task & Milestone Operations Workspace                                                                                                                                                 |
| **Classification**          | **Canonical Project Task, Milestone, Dependency & Work-Progress Anchor**                                                                                                                                                   |
| **Primary purpose**         | Inspect and operate one Project’s canonical Tasks/Milestones, responsibilities, dependencies, due conditions and completion evidence without collapsing Project workflow or approval state into generic checklist progress |
| **Primary parent**          | **Project** — Design 023                                                                                                                                                                                                   |
| **Primary work entity**     | **Task** — Design 034                                                                                                                                                                                                      |
| **Milestone entity**        | **Milestone**                                                                                                                                                                                                              |
| **Template source**         | TaskDefinition / MilestoneDefinition from Designs 109–110                                                                                                                                                                  |
| **Task dependency**         | **TaskDependency**                                                                                                                                                                                                         |
| **Milestone dependency**    | **MilestoneDependency / milestone requirement relation**                                                                                                                                                                   |
| **Assignment dependency**   | canonical Project Team / Task assignment; Design 112                                                                                                                                                                       |
| **Workflow dependency**     | ProjectWorkflow / ProjectStageInstance                                                                                                                                                                                     |
| **Approval dependency**     | Design 029 / Design 115                                                                                                                                                                                                    |
| **Client dependency**       | ClientRequest — Design 047 / 116                                                                                                                                                                                           |
| **Follow-up boundary**      | FollowUp — Design 015 / 095                                                                                                                                                                                                |
| **Timeline dependency**     | Design 118                                                                                                                                                                                                                 |
| **Risk/blocker dependency** | Design 113                                                                                                                                                                                                                 |
| **Activity dependency**     | Design 119                                                                                                                                                                                                                 |
| **Primary query service**   | `ProjectWorkPlanQueryService`                                                                                                                                                                                              |
| **Task service**            | canonical `TaskService`                                                                                                                                                                                                    |
| **Milestone service**       | `ProjectMilestoneService`                                                                                                                                                                                                  |
| **Dependency service**      | `ProjectWorkDependencyService`                                                                                                                                                                                             |
| **Progress resolver**       | `ProjectWorkProgressResolver`                                                                                                                                                                                              |
| **Parent shell**            | `InternalAppShell` — Design 001                                                                                                                                                                                            |
| **Auth**                    | Required                                                                                                                                                                                                                   |
| **Authorization**           | Active OrganizationMembership + Project/Task/Milestone permissions                                                                                                                                                         |
| **Implementation priority** | **Critical Delivery Execution / Dependency Integrity / Runtime Work Tracking**                                                                                                                                             |
| **Reuse level**             | **Extremely High across Projects, My Work, Calendar, Timeline, Risks, Approvals and reporting**                                                                                                                            |

Design 111 should answer:

> **“What work actually exists for this Project, which Tasks and Milestones came from the initialized delivery plan, who is responsible, which items are blocked, what is due or overdue, what has genuinely completed, and what Project work remains—without treating task checkboxes as Project-stage or approval truth?”**

Canonical structure:

```text
Project PR-100
      │
      ├── ProjectWorkflow
      │       └── ProjectStageInstances
      │
      ├── Task[]
      │      ├── Assignment
      │      ├── TaskDependency[]
      │      ├── due / completion
      │      └── source TaskDefinition?
      │
      └── Milestone[]
             ├── MilestoneDependency[]
             ├── Task / evidence requirements
             ├── target / actual dates
             └── source MilestoneDefinition?
                       │
                       ↓
              WorkProgressResolver
```

---

# 2. Reuse

## Design 034 remains the canonical Task foundation

Design 111 must use the exact same Task identity shared across the platform.

Correct:

```text
Task T-100
├── Design 034 Work Management
├── Design 078 My Work
├── Design 035 Calendar projection
└── Design 111 Project Tasks
```

Do not create:

```text
ProjectTask
WorkflowTask
MilestoneTask
ProjectChecklistItem
```

as parallel task entities merely because the Task belongs to a Project.

---

## Project context is a relation, not a new Task type

A canonical Task can be associated with:

```text
contextType = PROJECT
contextId   = PR-100
```

or an equivalent typed relationship.

The Project does not need its own duplicate Task backend.

---

## TaskDefinition ≠ Task

Designs 109–110 already established:

```text
TaskDefinition TD-10
       ↓ instantiate
Task T-100
```

Once created, `T-100` is runtime work.

Publishing or editing a newer template does not change it.

---

## MilestoneDefinition ≠ Milestone

Same rule:

```text
MilestoneDefinition MD-5
       ↓ instantiate
Milestone M-100
```

The runtime Milestone acquires:

* target dates,
* completion evidence,
* Project-specific dependencies,
* runtime state.

The definition remains reusable configuration.

---

## Design 108 creation must instantiate idempotently

If Project PR-100 was created from a template, Design 111 must show the exact existing runtime Tasks/Milestones generated during initialization.

Opening Design 111 must never instantiate them again.

---

## Design 110 workflow stages remain separate

A Task may be associated with a workflow stage.

A Milestone may be associated with a stage/gate.

But:

> **Task ≠ Stage**
> **Milestone ≠ Stage**

Completing all Tasks shown under a stage does not automatically move the Project unless the Project workflow transition policy explicitly says so.

---

## Design 029 Approval remains separate

A Milestone may require an ApprovalRequest.

That does not turn the Milestone into the approval itself.

Correct:

```text
Milestone M-10
     ↓ requirement
ApprovalRequest A-20
```

Not:

```text
milestone.approved = true
```

as a second approval truth.

---

## Design 047/116 ClientRequest remains separate

If delivery depends on:

> client sends photos,

that is a canonical `ClientRequest`.

The Project work view may show its dependency.

It should not silently transform it into an internal Task.

---

## Task ≠ ClientRequest

Permanent.

> Team owes work → Task
> Client owes action → ClientRequest

---

## Design 015/095 FollowUp remains separate

A sales/client relationship obligation such as:

> Follow up with client Friday

does not become a Project Task merely because it is related to a Project.

If internal delivery work is required:

Task.

If relationship follow-up:

FollowUp.

---

## Design 112 will own Project Team / Resource Assignment detail

Design 111 may show Task/Milestone assignees.

It must not become another Project Team management backend.

---

## Design 118 will own timeline/Gantt composition

Design 111 owns runtime work records and their dependencies.

Design 118 may visualize them on a timeline.

Timeline position is a projection.

It must not become the source of Task/Milestone identity.

---

# 3. Entities

## Task

Canonical Task remains:

```text
Task
├── id
├── organizationId
├── context
├── title
├── description
├── lifecycle
├── priority
├── assignee / assignment relations
├── dueAt
├── startedAt
├── completedAt
├── sourceDefinitionId?
├── createdAt
└── revision
```

Exact schema belongs to Phase 3D.

---

## Task ≠ Project

Permanent.

Project completion cannot be represented as:

```text
all tasks checked = project completed
```

without canonical Project completion policy.

---

## Task lifecycle

Conceptually:

```text
NOT_STARTED
IN_PROGRESS
BLOCKED
COMPLETED
CANCELLED
```

Exact enums Phase 3D.

Due/overdue remains separate.

---

## Task lifecycle ≠ due condition

Valid:

```text
Task lifecycle = IN_PROGRESS
Due condition  = OVERDUE
```

---

## Task lifecycle ≠ blocker reason

A Task can be:

```text
BLOCKED
```

because:

* predecessor Task incomplete,
* ClientRequest incomplete,
* Approval pending,
* Asset unavailable,
* external dependency.

The blocker source should be explicit.

---

## Task completion

Task completion should preserve:

```text
completedAt
completedBy/system
completion evidence where relevant
```

---

## Complete ≠ Approved

Permanent.

---

## Complete ≠ Milestone achieved

Permanent.

---

## Complete ≠ Project stage changed

Absolute.

---

## Complete ≠ Project completed

Absolute.

---

## Reopen Task

If supported:

```text
COMPLETED
↓
REOPENED / IN_PROGRESS
```

must preserve previous completion history.

Do not simply erase `completedAt` with no trace.

---

## TaskAssignment

Assignment is conceptually separate from Task identity.

Depending on final design:

```text
TaskAssignment
├── taskId
├── assignee User/Team/role
├── assignedAt
├── assignedBy
└── active/historical state
```

or a simpler canonical assignment model.

---

## Assignee ≠ Project Team membership

A user can be on Project team but not assigned this Task.

Likewise assignment must be validated against Project/access policies.

---

## Assignee ≠ authorization

Permanent.

Being assigned a Task does not grant permission to:

* approve legal content,
* access restricted finance data,
* administer Project.

---

## TaskDependency

A first-class relationship is required.

Conceptually:

```text
TaskDependency
├── predecessorTaskId
├── successorTaskId
├── dependencyType
└── createdAt / provenance
```

---

## Dependency ≠ display order

Critical.

Task A listed above Task B does not imply B depends on A.

---

## Task dependency graph

Cycle prevention/validation is required unless an explicit dependency type allows a non-blocking relation.

For blocking dependencies:

```text
A → B
B → C
C → A
```

must not create permanent deadlock.

---

## Dependency satisfied ≠ predecessor exists

The exact condition matters:

> predecessor must be COMPLETED

or another typed condition.

---

## Blocked ≠ dependency exists

A Task with a dependency whose predecessor is complete is not blocked.

Block state must be derived/current.

---

## Milestone

A Milestone is a meaningful Project checkpoint/outcome.

Conceptually:

```text
Milestone
├── id
├── organizationId
├── projectId
├── title
├── lifecycle
├── targetDate
├── achievedAt
├── sourceDefinitionId?
├── owner/context
├── revision
└── completion evidence
```

---

## Milestone ≠ Task

Critical.

Task:

> Design magazine cover.

Milestone:

> Client design approved.

One is work.

One is an outcome/checkpoint.

---

## Milestone may depend on many Tasks

Example:

```text
Milestone: Draft Ready

requires:
Task A complete
Task B complete
Task C complete
```

But Milestone should not be represented as a parent Task checkbox.

---

## Milestone may depend on non-Task evidence

Examples conceptually:

* ApprovalRequest approved,
* ClientRequest satisfied,
* required Asset exists,
* publication state reached.

Therefore milestone achievement requires typed requirements, not just Task count.

---

## Milestone lifecycle

Conceptually:

```text
PENDING
AT_RISK
ACHIEVED
MISSED
CANCELLED
```

Exact enum Phase 3D.

But:

> milestone lifecycle ≠ due condition ≠ Project health.

Avoid one generic status.

---

## Milestone achieved ≠ Project completed

Permanent.

---

## Milestone target date ≠ Task due date

Permanent.

---

## Milestone missed ≠ Project failed

Permanent.

It may contribute to Project risk/health.

---

## Milestone actual date

`achievedAt` should be canonical evidence.

Do not infer solely from current UI position.

---

## MilestoneDependency / Requirement

A Milestone may depend on:

```text
Task
Milestone
ApprovalRequest
ClientRequest
Asset/Deliverable
ProjectStage
```

according to policy.

These should use typed relations/requirements.

---

## MilestoneDependency ≠ MilestoneRequirement necessarily

Useful distinction:

### Dependency

Milestone B depends on Milestone A.

### Requirement

Milestone B requires Approval A and Tasks T1/T2.

Exact physical model Phase 3D.

---

## Project Work Progress

`ProjectWorkProgress` should be a projection/resolver result.

Conceptually:

```text
ProjectWorkProgress
├── required Tasks total/completed
├── Milestones total/achieved
├── overdue count
├── blocked count
├── calculatedAt
└── source revisions
```

---

## Work progress ≠ Project progress universally

Critical.

Project progress might include:

* workflow stage,
* approvals,
* client dependencies,
* publishing,
* deliverables.

Therefore Design 111 work progress is only one component.

Do not redefine Project 023 progress around Tasks alone.

---

## Task percentage ≠ Project percentage

Absolute.

---

## 80% Tasks complete ≠ 80% Project complete

Permanent.

---

## Task priority ≠ Project priority

Permanent.

---

## Task blocker ≠ Project Blocker entity

Important for Design 113.

A Task can be blocked.

A `ProjectBlocker` represents a Project-level operational issue worth tracking.

A blocked Task may generate/relate to a ProjectBlocker, but they are not automatically the same entity.

---

# 4. Permissions

Design 111 should conceptually distinguish:

```text
project.read

task.read
task.create
task.edit
task.assign
task.complete
task.reopen
task.cancel

milestone.read
milestone.create
milestone.edit
milestone.achieve
milestone.reopen
milestone.cancel

projectWork.dependencies.manage
```

Exact permission keys belong to Phase 3D.

---

## Project read ≠ Task edit

Permanent.

---

## Task edit ≠ Task complete

Potentially separate where governance requires.

---

## Task complete ≠ Milestone achieve

Permanent.

---

## Milestone edit ≠ Project stage transition

Permanent.

---

## Task assignment ≠ Project Team administration

Critical.

A user can assign Tasks under policy without being able to add/remove Project team membership.

---

## Project owner ≠ all Task assignees

Permanent.

---

## Task assignee ≠ permission to reassign others

Permanent.

---

## Task assignee ≠ Milestone authority

Permanent.

---

## Milestone owner ≠ Approval authority

Permanent.

---

## Task completion cannot impersonate another user

`completedBy` derives from current authenticated actor/system.

---

## Manual Milestone achievement requires authority

If a Milestone is source-driven, manual achievement should be prohibited unless a specific override capability exists.

---

## Source-driven Milestone ≠ manually checkable

Critical.

If:

```text
Milestone requires ApprovalRequest = APPROVED
```

then a user cannot simply click:

> Mark milestone achieved.

---

## Override if supported

Any override should:

* require elevated permission,
* preserve reason,
* preserve source evidence,
* not rewrite Approval/ClientRequest/etc.

---

## Direct Task ID reauthorizes

Permanent.

---

## Direct Milestone ID reauthorizes

Permanent.

---

## Cross-tenant dependencies prohibited

Absolute.

Task A in Organization A cannot depend on Task B in Organization B.

---

## Cross-Project dependencies require policy

Do not assume allowed.

Default safe behavior for Design 111:

Task/Milestone dependencies should remain within the Project unless the final domain explicitly supports cross-Project dependency management.

---

# 5. States

Design 111 must keep **Task lifecycle, Task due condition, Task dependency/block state, Milestone lifecycle, Milestone due condition, requirement state, work progress, and Project lifecycle/stage** separate.

### Task lifecycle

```text
Not Started
In Progress
Blocked
Completed
Cancelled
```

### Task due condition

```text
No Due Date
Not Due
Due Soon
Due Today
Overdue
```

### Dependency

```text
Unblocked
Blocked by Dependency
Dependency Unknown
```

### Milestone lifecycle

```text
Pending
At Risk
Achieved
Missed
Cancelled
```

### Milestone requirement state

```text
Unsatisfied
Partially Satisfied
Satisfied
Unknown
Unavailable
```

### Work progress

```text
Available
Stale
Unavailable
```

These must never collapse into one generic Project-work status.

---

## Task Not Started ≠ Blocked

Permanent.

---

## Blocked ≠ Overdue

Permanent.

---

## Overdue ≠ Failed

Permanent.

---

## Completed ≠ On Time

Permanent.

A Task can complete late.

---

## Completed late history should remain explainable

Do not clear historical overdue context if reporting needs it.

---

## Cancelled ≠ Completed

Permanent.

---

## Skipped/not-required ≠ Completed

If the Project work model supports those states, preserve distinct semantics.

---

## Dependency unavailable ≠ dependency satisfied

Critical.

---

## Milestone pending ≠ missed

Permanent.

A future target date has not been missed.

---

## Milestone missed ≠ cancelled

Permanent.

---

## Milestone achieved ≠ Approval approved

Permanent.

The Milestone may derive from Approval, but they remain separate facts.

---

## All required Tasks complete ≠ Milestone achieved universally

Critical.

There may be:

* Approval,
* ClientRequest,
* Asset,
* Stage requirement.

---

## All Milestones achieved ≠ Project completed automatically

Absolute.

Project closeout belongs to Design 120.

---

## Project completed ≠ Tasks deleted

Historical Tasks/Milestones remain evidence.

---

## Workflow stage changed ≠ Task status changed automatically

Unless explicit stage-entry/exit automation creates/updates Tasks under governed rules.

No blanket mutation.

---

## Template changed ≠ Task changed

Permanent.

---

## Source TaskDefinition archived ≠ runtime Task archived

Absolute.

---

## State Coverage

Design 111 inherits Design 150 plus:

```text
Project Work Loading
Project Work Available
Project Work Empty
Project Work Restricted
Project Work Partial

Task Not Started
Task In Progress
Task Blocked
Task Completed
Task Cancelled
Task Reopened

Task Not Due
Task Due Soon
Task Due Today
Task Overdue
Task Due State Unknown

Task Unblocked
Task Dependency Blocked
Task Dependency Unknown

Milestone Pending
Milestone At Risk
Milestone Achieved
Milestone Missed
Milestone Cancelled
Milestone Reopened

Milestone Requirement Unsatisfied
Milestone Requirement Partial
Milestone Requirement Satisfied
Milestone Requirement Unknown
Milestone Requirement Unavailable

Milestone Not Due
Milestone Due Soon
Milestone Due Today
Milestone Overdue / Missed

Work Progress Available
Work Progress Stale
Work Progress Unavailable

Task Updated Elsewhere
Milestone Updated Elsewhere
Dependency Updated Elsewhere
Project Stage Updated Elsewhere

Task Service Unavailable
Milestone Service Unavailable
Approval Dependency Unavailable
Client Request Dependency Unavailable

Partial Project Work Detail Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize **runtime work clarity**, not template configuration.

Conceptually:

```text
Project Tasks & Milestones
↓
Project context
↓
Work summary
   ├── open Tasks
   ├── blocked Tasks
   ├── overdue Tasks
   └── upcoming/achieved Milestones
↓
Task/Milestone detail
   ├── responsibility
   ├── due/target date
   ├── dependency
   ├── runtime state
   └── source evidence
```

Only fields/actions present in frozen Design 111 should render.

---

## Task and Milestone must remain visually distinguishable

Do not make both identical generic checklist rows.

A user should understand:

* **Task = work to perform**
* **Milestone = delivery checkpoint/outcome**

---

## Blocked and overdue require separate communication

Correct:

> Blocked · Due tomorrow

or:

> In Progress · Overdue by 2 days

where both apply.

Not one ambiguous red status.

---

## Dependency explanation should be explicit

If Task T3 is blocked:

> Blocked by “Client asset review”

is safer than merely disabling the row/action.

---

## Template provenance should remain secondary

If useful in frozen design:

> Created from Workflow v7 / Task Definition TD-14

can be available for diagnostics.

But runtime work—not template configuration—is primary.

---

## Tablet

Following Design 152:

* work summary stacks,
* Task/Milestone rows become compact cards,
* dependencies become metadata/details,
* assignment/due dates remain visible,
* actions remain touch-safe.

---

## Mobile

Priority:

```text
Project
↓
Next actionable Task
↓
Blocked Tasks
↓
Overdue Tasks
↓
Upcoming Milestones
↓
Completed work
```

Do not force a dense desktop work table horizontally.

---

## Mobile Task card

Should be capable of communicating:

> Design cover
> Assigned to Alex
> Due today
> Blocked by client image upload

as four distinct facts.

---

## Mobile Milestone card

Should distinguish:

> Draft Approved
> Target Aug 30
> Approval pending
> Not achieved

rather than a checkmark-only model.

---

## Accessibility

A Task row could communicate:

> Design cover. In progress. Assigned to Alex. Due today. Blocked until client image request is completed.

A Milestone could communicate:

> Draft Approved milestone. Target August 30. Requirement approval request is pending. Milestone not yet achieved.

where canonical authorized data supports it.

---

# 7. Backend Requirements

## Canonical Project work architecture

```text
Design 111
    ↓
Authenticated Workspace Context
    ↓
ProjectWorkPlanQueryService
    │
    ├── ProjectAdapter
    ├── TaskAdapter
    ├── MilestoneAdapter
    ├── AssignmentAdapter
    ├── DependencyAdapter
    ├── ApprovalRequirementAdapter
    ├── ClientRequestRequirementAdapter
    ├── WorkflowStageAdapter
    └── ProjectWorkProgressResolver
    ↓
ProjectWorkPlanView
```

Mutations remain source-domain commands.

---

## Task query

Conceptually:

```text
getProjectTasks(
    projectId,
    filters,
    currentMembership
)
```

server-authorized and tenant-scoped.

---

## Milestone query

Same.

---

## No giant ProjectWork mutable record

Avoid:

```text
ProjectWorkPlan {
  tasksJson,
  milestonesJson,
  progressPercent,
  blockersJson
}
```

as canonical source truth.

Read projections/materialized views are acceptable if rebuildable.

---

## Task creation

Conceptually:

```text
createTask(
    projectId,
    taskInput,
    sourceDefinitionId?,
    idempotencyKey
)
```

should:

1. authorize;
2. verify Project;
3. validate context;
4. validate assignment;
5. validate due date;
6. create canonical Task;
7. establish source-definition lineage where template-generated;
8. emit Audit/outbox.

---

## Template-generated Task idempotency

Critical.

Project initialization retry must not recreate Task TD-10 twice.

Use stable lineage such as:

```text
projectId + sourceTaskDefinitionId + generationPurpose
```

or equivalent.

---

## Manual Task ≠ template-generated Task

Both are canonical Tasks.

Source provenance differs.

---

## Task update

Use targeted commands with expected revision.

Avoid broad cross-domain:

```text
PATCH /project-work
```

that can alter Tasks/Milestones/Project stage together.

---

## Complete Task command

Conceptually:

```text
completeTask(
    taskId,
    expectedRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. verify Task belongs to accessible Project;
3. validate current lifecycle;
4. validate blocking dependencies if completion policy requires;
5. record actor/time/evidence;
6. update Task;
7. emit `TaskCompleted`;
8. invalidate milestone/work-progress/readiness projections.

---

## Task complete is idempotent

Repeated completion should return current completed state.

No duplicate downstream events.

---

## Task reopen

If supported:

```text
reopenTask(...)
```

preserves prior completion history.

---

## Task cancellation

Distinct from completion.

Cancellation reason/history preserved.

---

## Task dependency creation

Conceptually:

```text
addTaskDependency(
    predecessorTaskId,
    successorTaskId,
    dependencyType,
    expectedRevision
)
```

must validate:

* same tenant,
* Project scope policy,
* no self-dependency,
* no illegal cycle,
* compatible dependency type.

---

## Dependency graph validation

For blocking finish-to-start relationships:

detect cycles before commit.

---

## Dependency recalculation

When predecessor state changes:

successor block projection invalidates/recomputes.

---

## Dependency source unavailable

If dependency state cannot be determined:

do not mark successor unblocked.

---

## Milestone creation

Conceptually:

```text
createMilestone(
    projectId,
    milestoneInput,
    sourceDefinitionId?,
    idempotencyKey
)
```

with same tenant/project/version integrity.

---

## Milestone achievement

Two modes must remain distinct.

### Manual Milestone

Can be explicitly achieved if authorized and requirements pass.

### Source-driven Milestone

Achievement is derived/commanded only after typed requirements are satisfied.

---

## Milestone requirement resolver

Conceptually:

```text
ProjectMilestoneRequirementResolver.evaluate(milestoneId)
```

can use typed adapters:

```text
TaskRequirementAdapter
ApprovalRequirementAdapter
ClientRequestRequirementAdapter
AssetRequirementAdapter
ProjectStageRequirementAdapter
MilestoneRequirementAdapter
```

---

## Requirement unknown fails safe

If Approval service is unavailable:

```text
Milestone requirement = UNKNOWN
```

not satisfied.

---

## Achieve Milestone command

Conceptually:

```text
achieveMilestone(
    milestoneId,
    expectedRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. reload Milestone;
3. fresh-evaluate requirements;
4. reject if required evidence missing;
5. persist achievement actor/time/source evidence;
6. emit event;
7. update work/timeline projections.

---

## Milestone achievement idempotency

Critical.

---

## Milestone reopen/correction

If supported:

preserve achievement history.

Do not simply erase previous achievedAt.

---

## Project stage integration

Task/Milestone events can invalidate Project workflow gate evaluation.

Example:

```text
MilestoneAchieved
    ↓
Project gate re-evaluation
```

But:

```text
MilestoneAchieved
→ project.stage = NEXT
```

must not be a hidden generic side effect unless canonical transition policy explicitly executes a transition.

---

## Stage transition remains Design 023 runtime service

Permanent.

---

## Approval integration

If a milestone requires approval:

use Design 029 ApprovalRequest state.

Do not copy `approved=true` into the Milestone as independent authority.

---

## ClientRequest integration

Use Design 047/116 canonical request state.

---

## Assignment integration

Design 112 will specialize Project Team/Resource Assignment.

Task assignment should validate:

* User/team exists,
* tenant,
* Project access/eligibility,
* assignment policy.

---

## Assignment does not grant global access

Permanent.

---

## Calendar integration

Design 035 may project Task/Milestone due/target dates as `ScheduleEntry`.

Calendar date changes, if permitted, must call Task/Milestone services.

Calendar projection cannot become independent schedule truth.

---

## My Work integration

Design 078 projects Tasks assigned/actionable to current user.

Task completion through My Work calls the same `TaskService`.

No separate MyWorkTask state.

---

## Timeline integration

Design 118 consumes:

* Task dates,
* Milestone dates,
* dependencies,
* Project stage timing.

If Gantt drag modifies due dates/dependencies, it must invoke the canonical Task/Milestone dependency services.

---

## Risk/blocker integration

Design 113 may derive or create ProjectRisk/ProjectBlocker context when work becomes seriously blocked.

A blocked Task does not automatically become a ProjectBlocker unless explicit escalation policy acts.

---

## Work progress resolver

Conceptually:

```text
ProjectWorkProgressResolver.resolve(projectId)
```

could return:

```text
tasks:
  totalRequired
  completed
  blocked
  overdue

milestones:
  totalRequired
  achieved
  atRisk
  missed
```

with freshness/source revision.

---

## Work progress does not own Project progress

Design 023 Project progress resolver may consume this as one input.

---

## Progress cache invalidation

Invalidate on:

```text
TaskCreated
TaskCompleted
TaskReopened
TaskCancelled
MilestoneCreated
MilestoneAchieved
MilestoneReopened
dependency changes
```

---

## Project completion

Design 120 owns Project completion/closeout.

Design 111 cannot complete the Project merely because all Tasks/Milestones are done.

Project completion policy may include:

* deliverables,
* approvals,
* publishing,
* client handover,
* finance/administrative checks.

---

## Optimistic concurrency

Task/Milestone edits and completions use expected revisions.

Two users cannot:

* complete and cancel,
* reopen and complete,

without conflict resolution.

---

## Bulk actions

If frozen Design 111 contains bulk operations:

each Task/Milestone must still be individually authorized/validated.

Do not implement one blind SQL status update.

Return partial per-item outcomes.

---

## Audit

Material actions should include:

```text
TaskCreated
TaskReassigned
TaskCompleted
TaskReopened
TaskCancelled

MilestoneCreated
MilestoneAchieved
MilestoneReopened
MilestoneCancelled

TaskDependencyChanged
MilestoneRequirementOverridden
```

as appropriate.

---

## Activity

Project Activity can project these events.

Activity ≠ Task/Milestone state ≠ Audit.

---

## Notifications

Design 080 may notify:

* Task assigned,
* Task overdue,
* Milestone due,
* Milestone achieved.

Notification read state never changes work state.

---

## Search

Design 079 may index safe:

* Task title,
* Milestone title,
* Project reference,

subject to permissions.

Search never becomes completion truth.

---

## Caching

Project Work caches should vary by:

```text
organizationMembershipId
projectId
authorizationRevision
projectRevision
taskRevision aggregate
milestoneRevision aggregate
dependencyRevision
source requirement revisions
```

---

## Performance

Use:

* indexed `projectId` Task/Milestone queries,
* batched assignments/dependencies,
* aggregate summary queries,
* cursor pagination if large,
* lazy Activity/history/evidence.

Avoid N+1 dependency/source-domain calls per row.

---

## Partial failure contract

Example:

```text
Project core          ✓
Tasks                 ✓
Milestones            ✓
Approval requirements ✕
ClientRequests        ✓
Assignments           ✓
```

Correct:

> Project work available. Approval-dependent milestone state cannot currently be fully evaluated.

Not:

> Approval milestone incomplete.

And never:

> Milestone achieved.

---

## Backend Requirement Matrix

| Requirement                                         | Status                    |
| --------------------------------------------------- | ------------------------- |
| Canonical Project reuse from 023                    | **Critical**              |
| Canonical Task reuse from 034                       | **Critical**              |
| Task/Project separation                             | **Critical**              |
| TaskDefinition/Task separation                      | **Critical**              |
| MilestoneDefinition/Milestone separation            | **Critical**              |
| Runtime source-definition provenance                | **Critical**              |
| Template edits do not mutate runtime work           | **Critical**              |
| Template-generated Task idempotency                 | **Critical**              |
| Template-generated Milestone idempotency            | **Critical**              |
| Task/Milestone separation                           | **Critical**              |
| Task lifecycle/due-state separation                 | **Critical**              |
| Milestone lifecycle/due-state separation            | **Critical**              |
| Task completion/Milestone achievement separation    | **Critical**              |
| Task completion/Project stage separation            | **Critical**              |
| Milestone achievement/Project stage separation      | **Critical**              |
| Task completion/Project completion separation       | **Critical**              |
| Milestone achievement/Project completion separation | **Critical**              |
| Task/ClientRequest separation                       | **Critical**              |
| Task/FollowUp separation                            | **Critical**              |
| Milestone/ApprovalRequest separation                | **Critical**              |
| TaskDependency first-class                          | **Critical**              |
| Dependency/display-order separation                 | **Critical**              |
| Dependency-cycle validation                         | **Critical**              |
| Dependency block-state derived                      | **Critical**              |
| Milestone typed requirements                        | **Critical**              |
| Requirement unknown/satisfied separation            | **Critical**              |
| Manual/source-driven Milestone separation           | **Critical**              |
| Fresh requirement evaluation before achievement     | **Critical**              |
| Task completion idempotency                         | **Critical**              |
| Milestone achievement idempotency                   | **Critical**              |
| Reopen preserves history                            | **Critical if supported** |
| Optimistic concurrency                              | **Critical**              |
| Assignment/authorization separation                 | **Critical**              |
| Design 112 resource assignment reuse                | **Critical architecture** |
| Calendar projection reuse                           | **Critical**              |
| My Work projection reuse                            | **Critical**              |
| Design 113 blocker separation                       | **Critical architecture** |
| Design 118 timeline projection reuse                | **Critical architecture** |
| Design 120 closeout separation                      | **Critical architecture** |
| Work progress/Project progress separation           | **Critical**              |
| Permission-safe bulk actions                        | **Critical if present**   |
| Cross-tenant dependency prohibition                 | **Critical**              |
| Permission-safe composition                         | **Critical**              |
| Audit/outbox integration                            | **Required**              |
| Partial dependency failure handling                 | **Critical**              |

---

# 8. Consolidation

Design 111 exposes a major risk of turning runtime delivery into one simplistic Project checklist.

**Task / ProjectTask conflation**
Project creates a second Task backend.

**Task / TaskDefinition conflation**
Template definition becomes live work.

**Milestone / MilestoneDefinition conflation**
Reusable definition carries runtime completion.

**TaskDefinition edit / runtime Task mutation conflation**
Template changes existing Projects.

**MilestoneDefinition edit / runtime Milestone mutation conflation**
Future-template changes rewrite history.

**Task / Milestone conflation**
Work item and outcome checkpoint become indistinguishable.

**Task / ClientRequest conflation**
Internal responsibility and client responsibility collapse.

**Task / FollowUp conflation**
Delivery work and relationship obligation merge.

**Task / ApprovalRequest conflation**
Ordinary work becomes formal approval.

**Milestone / ApprovalRequest conflation**
Checkpoint result becomes approval identity.

**Milestone / Task group conflation**
Milestone achievement equals all child tasks checked.

**Task completion / Approval complete conflation**
Team checkbox manufactures approval.

**Task complete / Milestone achieved conflation**
One work item closes outcome automatically.

**Task complete / Project stage transition conflation**
Workflow moves because a checkbox changes.

**Milestone achieved / Project stage transition conflation**
Checkpoint bypasses transition service.

**All Tasks complete / Project complete conflation**
Closeout gates disappear.

**All Milestones achieved / Project complete conflation**
Deliverables/handover/approval checks disappear.

**Task lifecycle / due state conflation**
Overdue becomes a status instead of a condition.

**Blocked / overdue conflation**
Dependency and time semantics collapse.

**Blocked / failed conflation**
Waiting work appears failed.

**Completed / on-time conflation**
Late work history is erased.

**Cancelled / completed conflation**
Non-delivered work counts as finished.

**Reopened / previous completion deletion conflation**
Audit history disappears.

**TaskAssignment / ProjectTeamMembership conflation**
One task assignment becomes project membership.

**Assignment / authorization conflation**
Assignee gains restricted Project powers.

**Task owner / Approval authority conflation**
Work responsibility becomes formal authorization.

**Milestone owner / Project stage authority conflation**
Checkpoint ownership becomes transition permission.

**TaskDependency / display order conflation**
Visual list determines blockers.

**TaskDependency / ProjectStage transition conflation**
Task graph becomes workflow graph.

**Dependency exists / blocked conflation**
Completed predecessor still blocks successor.

**Dependency unavailable / satisfied conflation**
System fails open.

**Dependency unavailable / incomplete conflation**
Infrastructure outage is treated as user failure.

**Dependency cycles / valid plan conflation**
Project work deadlocks.

**Milestone requirement / Milestone dependency conflation**
External evidence and predecessor checkpoint collapse.

**Milestone requirement / Task count conflation**
Approval/client/asset requirements are ignored.

**Approval pending / Milestone failed conflation**
Waiting becomes failure.

**Approval unavailable / Milestone achieved conflation**
System fails open.

**ClientRequest pending / Task pending conflation**
Responsible party becomes ambiguous.

**Task blocked / ProjectBlocker conflation**
Every minor dependency becomes formal project blocker.

**ProjectBlocker / Task blocker reason conflation**
Project-level issue and work-level condition merge.

**Task priority / Project priority conflation**
One urgent task marks entire Project urgent.

**Task percentage / Project progress conflation**
80% tasks means 80% Project.

**Milestone count / Project progress conflation**
Equal weighting is assumed.

**Work progress / Project health conflation**
Task completion is treated as health.

**Project stage / work progress conflation**
Stage position determines task percentage.

**Calendar ScheduleEntry / Task due date conflation**
Calendar projection becomes separate source truth.

**Gantt item / Task/Milestone conflation**
Timeline visual object becomes canonical work entity.

**Gantt drag / direct DB edit conflation**
Timeline bypasses Task/Milestone services.

**My Work entry / Task conflation**
Personal projection becomes another work record.

**Notification / Task state conflation**
Reading reminder completes work.

**Search result / Task state conflation**
Indexed stale status becomes authority.

**ActivityEvent / Task history conflation**
Timeline strings replace actual state transitions.

**AuditEvent / completion evidence conflation**
Audit log substitutes runtime work state.

**Bulk completion / blind status update conflation**
Dependencies/permissions bypassed.

**Cross-Project dependency / same-Project assumption conflation**
Unexpected dependency graphs form without policy.

**Cross-tenant dependency**
One organization's Task blocks another's Project.

**Generic ProjectWork mega-PATCH**
Tasks, Milestones, stage and progress mutate together.

**111/034 duplicate Task backend**
Project work and global work disagree.

**111/078 duplicate My Work state**
Personal queue has different Task completion.

**111/035 duplicate scheduling truth**
Calendar and Task due dates diverge.

**111/110 duplicate TaskDefinition/runtime state**
Template configuration carries client work.

**111/112 duplicate assignment state**
Task assignees and Project team use unrelated models.

**111/113 duplicate blocker state**
Blocked Task and ProjectBlocker are merged.

**111/118 duplicate timeline state**
Gantt becomes second Task/Milestone store.

**111/120 duplicate completion logic**
Task completion closes Project.

No additional screen is required.

These are **runtime Task/Milestone identity, template/runtime separation, typed dependency and requirement modeling, completion semantics, Project-stage separation, assignment, work-progress, concurrency, and downstream projection requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PROJECT TASK, MILESTONE, DEPENDENCY & RUNTIME WORK-PLAN ANCHOR**

**Domain directive:**
**Project ≠ Task ≠ TaskDefinition ≠ Milestone ≠ MilestoneDefinition ≠ TaskDependency ≠ MilestoneDependency ≠ Assignment ≠ ProjectStage ≠ WorkflowGate ≠ ApprovalRequest ≠ ClientRequest ≠ FollowUp ≠ ProjectProgress ≠ ProjectHealth.**

**Project directive:**
Design 023 remains authoritative for canonical Project identity, lifecycle, stage, health and readiness. Design 111 manages runtime work inside that Project and never substitutes Task/Milestone state for Project state.

**Task directive:**
Design 034 remains the single canonical Task domain. Project Tasks are canonical Tasks with Project context, not a separate `ProjectTask` entity family.

**Template directive:**
TaskDefinition and MilestoneDefinition from Designs 109–110 are reusable configuration only. They instantiate canonical runtime Tasks/Milestones with new IDs and retained source-definition provenance.

**No-auto-update directive:**
later template publication or definition edits never alter existing Project Tasks/Milestones.

**Milestone directive:**
Milestone is a first-class Project checkpoint/outcome and remains distinct from Task, Task group, ProjectStage, ApprovalRequest, and Project completion.

**Dependency directive:**
Task dependencies are explicit first-class relations. Visual ordering never creates dependency semantics, and blocking graphs require cycle/reference validation.

**Block-state directive:**
Task `Blocked` state is current/derived from explicit blocking conditions and remains separate from overdue, failure, ProjectBlocker, and Task lifecycle.

**Requirement directive:**
Milestone requirements are typed and may resolve against Tasks, other Milestones, Approvals, ClientRequests, Assets or Project workflow state without duplicating those source entities.

**Unknown-state directive:**
dependency/source service failure yields `Unknown/Unavailable`, never false `Satisfied` or false `Failed`.

**Task-completion directive:**
Task completion is an authorized, revision-safe, idempotent Task-domain command preserving actor/time/evidence. It never directly marks Milestones, Approvals, ClientRequests, Project stages or the Project itself complete.

**Milestone-achievement directive:**
Milestone achievement performs a fresh server-side evaluation of its requirements. Source-driven milestones cannot be manually forced through ordinary checkbox semantics.

**Approval directive:**
formal approvals remain canonical Design 029 ApprovalRequests. Milestones may depend on them but never own an independent approval boolean.

**Client-request directive:**
client-owned dependencies remain canonical ClientRequests; internal work remains Tasks. Their responsibilities and lifecycles remain distinct even when composed in one Project work view.

**Follow-up directive:**
relationship follow-ups remain FollowUps under Designs 015/095 and are not converted into Tasks merely because they reference a Project.

**Assignment directive:**
Task assignment remains operational responsibility and never grants Project/team/security authorization. Design 112 remains authoritative for broader Project Team/resource relationships.

**Lifecycle directive:**
Task lifecycle, due condition, dependency/block condition, Milestone lifecycle and Milestone requirement state remain independent dimensions.

**Reopen directive:**
if Tasks/Milestones can reopen, prior completion/achievement evidence remains historical. Reopening never erases the prior state transition.

**Work-progress directive:**
`ProjectWorkProgressResolver` derives Task/Milestone operational progress centrally. Work progress is one Project input and never becomes the universal Project progress percentage.

**Progress directive:**
“80% of Tasks complete” can never automatically mean “Project is 80% complete.” Project progress may also depend on workflow, approvals, client dependencies, publishing, deliverables and closeout.

**Stage directive:**
Project workflow stage changes remain canonical Project runtime transition commands. Task/Milestone events may invalidate/evaluate gates but do not secretly move the Project.

**Closeout directive:**
Design 120 remains authoritative for Project completion. Even all Tasks and Milestones complete cannot bypass closeout, deliverable, approval, handover or other governed requirements.

**Risk directive:**
a blocked Task and a ProjectBlocker remain separate. Design 113 can escalate/associate meaningful project-level blockers without turning every blocked Task into a risk record.

**Calendar directive:**
Design 035 may project Task/Milestone dates as ScheduleEntries, but changes route back through canonical Task/Milestone services rather than maintaining a second schedule truth.

**My Work directive:**
Design 078 projects the same Tasks for personal actionability. Completion from My Work and Design 111 must call the same Task service and produce identical state.

**Timeline directive:**
Design 118 visualizes the same canonical Task/Milestone dates/dependencies. Gantt items remain projections, not another runtime work domain.

**Idempotency directive:**
template instantiation, manual Task creation, Task completion, Milestone creation/achievement, dependency creation and source-event handling are replay-safe.

**Concurrency directive:**
Task/Milestone mutations use expected revisions/transactions so competing completion/reopen/cancel operations cannot silently overwrite each other.

**Bulk-action directive:**
if the frozen design includes bulk operations, each target remains individually authorized and validated; partial outcomes are explicit rather than blind bulk status writes.

**Tenant directive:**
Project, Tasks, Milestones, dependencies, assignments and source requirements remain tenant-scoped. Cross-tenant dependency relations are prohibited.

**Cross-project directive:**
cross-Project work dependencies are not assumed. They require an explicit future policy/model if supported; same-Project dependency remains the safe canonical default.

**Caching directive:**
Project work caches vary by membership authorization, Project revision, Task/Milestone/dependency revisions and relevant source requirement revisions. Cached completion/block state is not mutation authority.

**Partial-failure directive:**
Project, Tasks, Milestones, assignments, Approval dependencies, ClientRequests and timeline data can fail independently. A source outage never becomes a false incomplete/satisfied milestone or empty work plan.

**Performance directive:**
use Project-scoped indexed queries, batched assignments/dependencies, aggregate summaries, lazy histories and pagination for large plans rather than N+1 source-domain requests per Task/Milestone.

**Activity directive:**
Project Activity may project Task/Milestone state changes but remains observational and never substitutes for canonical Task/Milestone records.

**Audit directive:**
Task creation/reassignment/completion/reopen/cancel, Milestone creation/achievement/reopen, dependency changes and exceptional overrides generate actor/source-aware Audit evidence.

**Future-reuse directive:**
Design **112 — Project Team / Resource Assignment** must become the canonical Project staffing/capacity surface consumed by Task assignment without treating Task assignees as the entire Project Team or as authorization roles.

**Overlap directive:**
Designs **023, 029, 034–035, 047, 078, 108–120** must preserve one continuous **Project → runtime Workflow → Tasks/Milestones → Dependencies/Assignments → Approvals/ClientRequests → Timeline/Risk/Resource/Closeout projections** lineage while keeping reusable definitions, runtime work, formal approvals, client obligations and Project lifecycle independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE PROJECT RUNTIME WORK-PLAN FOUNDATION — CANONICAL DESIGN-034 TASKS WITH PROJECT CONTEXT + FIRST-CLASS PROJECT MILESTONES + EXACT TEMPLATE-DEFINITION PROVENANCE + IDEMPOTENT RUNTIME INSTANTIATION + EXPLICIT TASK/MILESTONE DEPENDENCIES + TYPED SOURCE-BACKED MILESTONE REQUIREMENTS + DISTINCT ASSIGNMENT/DUE/BLOCK/LIFECYCLE STATE + CENTRAL WORK-PROGRESS RESOLUTION + FRESH COMPLETION/ACHIEVEMENT VALIDATION + SHARED MY-WORK/CALENDAR/TIMELINE PROJECTIONS — AND NEVER ALLOW TEMPLATE DEFINITIONS, CHECKBOXES, DISPLAY ORDER, TASK PERCENTAGES, GANTT ITEMS, MILESTONES OR BULK STATUS PATCHES TO SUBSTITUTE FOR OR REWRITE CANONICAL PROJECT WORKFLOW, APPROVAL, CLIENT-REQUEST, PROJECT-HEALTH OR PROJECT-COMPLETION TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **111 / 153** |
| **PASS**                                   |                        **111** |
| **STANDARDIZE decisions**                  |                        **109** |
| **Potential implementation-overlap flags** |                        **102** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**111 / 153 = 72.5% audited.**

### Canonical Project work architecture after Design 111

```text
                    PROJECT PR-100
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
    ProjectWorkflow      Tasks       Milestones
          │              │              │
       Stages       Dependencies    Requirements
                         │              │
                     Assignment     Tasks / Approval /
                     Due state      ClientRequest /
                     Completion     Asset / Stage
                         │              │
                         └──────┬───────┘
                                ↓
                        WorkProgressResolver
```

The template/runtime boundary remains strict:

```text
TaskDefinition TD-10
      ↓ instantiate
Task T-100

MilestoneDefinition MD-5
      ↓ instantiate
Milestone M-100

Later template edits:

do NOT change
T-100 or M-100.
```

The Task/Milestone distinction is equally important:

```text
Task:
“Create magazine cover”

Milestone:
“Cover approved for production”

Task completed
      ≠
Milestone achieved.
```

A Milestone can require more than Tasks:

```text
Milestone: Draft Approved

Task drafting complete          ✓
Internal review complete        ✓
Client ApprovalRequest approved ✕

RESULT:

Milestone = NOT ACHIEVED
```

And Project lifecycle remains completely separate:

```text
All Tasks complete      ✓
All Milestones achieved ✓

Project Completed       ?

Still determined by
canonical Project closeout policy,
not Design 111.
```

## Next Sequential Audit Target

### **Design 112 — Project Team / Resource Assignment**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
