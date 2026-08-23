Confirmed. The exact frozen identity is now:

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 034 — Tasks & Work Management Workspace

This screen should become the **canonical cross-domain work-management workspace for the Team Workspace**.

Its purpose is not to create separate task engines for Sales, Editorial, Projects, Magazine, Podcast, Video, Events, Publishing, or Distribution. It should provide one authoritative system for actionable internal work while preserving the important distinction between **Task, Follow-up, Meeting, Milestone, Approval, Workflow Stage, Client Request, Risk, and Blocker**.

---

## 1. Classification

| Audit field                     | Classification                                                                                                                                                    |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                   | **034**                                                                                                                                                           |
| **Canonical name**              | **Tasks & Work Management Workspace**                                                                                                                             |
| **Product area**                | Work Management / Operations / Productivity                                                                                                                       |
| **User surface**                | Team Workspace                                                                                                                                                    |
| **Screen class**                | Cross-Domain Work Queue + Task Operations Workspace                                                                                                               |
| **Classification**              | **Unique Anchor — Platform Work Management Family**                                                                                                               |
| **Primary purpose**             | Create, assign, organize, prioritize, execute, monitor and complete actionable internal work across all business and production domains                           |
| **Primary entity**              | **Task**                                                                                                                                                          |
| **Core child/support entities** | TaskAssignment, TaskDependency, TaskChecklistItem/Subtask where supported, TaskComment, TaskAttachment                                                            |
| **Related canonical entities**  | Project, Client, Lead, Deal, Meeting, FollowUp, ApprovalRequest, WorkflowStageInstance, Milestone, ClientRequest, Risk, Blocker, File/Asset, User, Team, Activity |
| **Parent shell**                | `InternalAppShell` — Design 001                                                                                                                                   |
| **Template family**             | `WorkManagementWorkspaceTemplate`                                                                                                                                 |
| **Composition**                 | `TasksWorkspaceComposition`                                                                                                                                       |
| **Auth**                        | Required                                                                                                                                                          |
| **Permissions**                 | Task read/create/edit/assign/complete/reopen/bulk/export + scope controls                                                                                         |
| **Implementation priority**     | **Core / Critical**                                                                                                                                               |
| **Reuse level**                 | **Platform-wide / Maximum**                                                                                                                                       |

The core platform rule becomes:

> **One canonical Task domain; many business contexts.**

---

# 2. Reuse Architecture

Design 034 should establish the common infrastructure consumed by:

* CRM work,
* Editorial work,
* Client onboarding,
* Project delivery,
* Magazine production,
* Podcast production,
* Video production,
* Event operations,
* Publishing,
* Distribution,
* internal Operations.

Conceptually:

```text
CRM ───────────────┐
Projects ──────────┤
Editorial ─────────┤
Magazine ──────────┤
Podcast ───────────┤
Video ─────────────┤
Events ────────────┤
Publishing ────────┤
Distribution ──────┘
        ↓
  CANONICAL TASK DOMAIN
        ↓
Design 034
Tasks & Work Management
```

Product-specific screens can display contextual Tasks, but they should not create independent task databases.

---

# 3. Task ≠ generic “work item”

The platform contains several things that represent work but should remain distinct:

```text
Task
≠
FollowUp
≠
Meeting
≠
ApprovalRequest
≠
WorkflowStage
≠
Milestone
≠
ClientRequest
≠
Risk
≠
Blocker
```

Design 034 can aggregate or link these concepts, but it should not collapse all of them into one enormous `WorkItem` record simply for UI convenience.

---

# 4. Task ≠ Follow-up

This distinction was already established in Design 015.

### Task

A concrete unit of work.

Example:

> Prepare final cover revision.

### Follow-up

A future relationship/sales action.

Example:

> Follow up with Arjun regarding proposal.

They can share:

* due date,
* assignee,
* priority,
* completion primitives.

But they retain different domain semantics.

**DO NOT MERGE THE DOMAIN MODELS.**

---

# 5. Task ≠ Meeting

A Meeting represents a scheduled interaction with:

* start/end time,
* participants,
* calendar synchronization,
* meeting outcome.

A Task represents an actionable obligation.

Example:

```text
Meeting:
Client Review — Tuesday 3:00 PM

Task:
Prepare proof before Client Review
```

The Task may depend on the Meeting date, but they remain separate records.

---

# 6. Task ≠ Workflow Stage

Example:

```text
Editorial Stage:
CLIENT REVIEW

Tasks:
- Send Draft v4 to Client
- Resolve comment #18
- Prepare revision notes
```

The workflow stage describes process position.

Tasks describe actions needed while in or around that stage.

A stage cannot simply be implemented as a Task with a different label.

---

# 7. Task ≠ Milestone

### Task

Work to perform.

### Milestone

A significant delivery checkpoint.

Example:

```text
Task:
Finish final proof.

Milestone:
Final Magazine Approval.
```

Tasks can contribute to a Milestone.

Completing one Task does not necessarily complete the Milestone.

---

# 8. Task ≠ Approval

A Task can say:

> Request final Client approval.

But the actual decision belongs to:

```text
ApprovalRequest
    ↓
ApprovalDecision
```

from Design 029.

Never implement an approval as:

```text
task.status = APPROVED
```

---

# 9. Task ≠ Client Request

This becomes important for Project and Client workflows.

### Internal Task

> Resize final cover.

### Client Request

> Client must upload 3 high-resolution photographs.

The system needs to know:

> **Who are we waiting on?**

Client dependencies should not be disguised as internal employee Tasks.

---

# 10. Task ≠ Risk / Blocker

### Risk

Potential future problem.

### Blocker

Current impediment.

### Task

Action to resolve/manage work.

Example:

```text
Blocker:
Missing Client headshot

Task:
Contact Client for replacement headshot
```

They are related but not equivalent.

---

# 11. Canonical Task

Conceptually:

```text
Task
├── id
├── organization/workspace
├── title
├── description
├── status
├── priority
├── assignee(s)
├── creator
├── due date
├── start date where applicable
├── contextual relationship
├── dependencies
├── attachments
├── comments
├── completion metadata
└── activity
```

Exact schema and enums belong to Phase 3D.

---

# 12. Task context must be typed

A Task can belong to or reference:

* Project,
* Lead,
* Deal,
* Client,
* EditorialProject,
* MagazineIssue,
* PodcastEpisode,
* VideoProject,
* EventOccurrence,
* Publication,
* DistributionCampaign.

Avoid only storing:

```text
task.relatedTo = "TechNova magazine"
```

as free text.

Use typed canonical relationships.

---

# 13. Context ≠ ownership

A Task can belong to:

```text
Project: TechNova Personal Magazine
```

while being assigned to:

```text
User: Emma Wilson
```

These are different relationships.

Likewise:

```text
Project Owner
≠
Task Assignee
```

---

# 14. Task assignment history

If work changes hands:

```text
Emma
 ↓
Michael
 ↓
Sarah
```

the system should preserve meaningful assignment history rather than simply overwrite `assigneeId`.

This supports:

* accountability,
* workload analysis,
* operational audits.

---

# 15. One assignee vs multiple assignees

Phase 3D should decide whether the canonical business rule is:

```text
one accountable assignee
+
collaborators
```

or true multiple assignees.

What should be avoided is inconsistent behavior where some modules assume one owner and others assume unlimited assignees.

---

# 16. Creator ≠ assignee

A manager can create a Task for another team member.

Therefore:

```text
createdBy
≠
assignedTo
```

and both should remain historically identifiable.

---

# 17. Task status ≠ due condition

Example:

```text
Status:
OPEN

Due condition:
OVERDUE
```

These are different facts.

`OVERDUE` should generally be derived from:

```text
task not completed
+
dueAt < now
```

rather than becoming another lifecycle status.

---

# 18. Task lifecycle ≠ priority

Conceptually:

```text
Status: IN_PROGRESS
Priority: HIGH
```

or:

```text
Status: OPEN
Priority: LOW
```

These remain independent dimensions.

Exact lifecycle vocabulary should be normalized in Phase 3D.

---

# 19. Task lifecycle ≠ health

For complex Tasks, a Task may be:

```text
Status:
IN_PROGRESS

Condition:
BLOCKED
```

if blocked state is represented separately.

Do not create dozens of composite values such as:

```text
HIGH_PRIORITY_OVERDUE_BLOCKED
```

---

# 20. Completion must be authoritative

Completing a Task should record:

```text
completedAt
completedBy
```

and potentially completion outcome where required.

Do not simply remove it from the active list.

Historical work must remain available.

---

# 21. Complete ≠ delete

Completed Tasks remain part of:

* Project history,
* workload analytics,
* audit,
* retrospectives,
* SLA calculations.

Never implement completion by deleting the Task.

---

# 22. Reopen should preserve history

If:

```text
Task completed
↓
problem discovered
↓
Task reopened
```

preserve:

* original completion,
* reopen actor,
* timestamp,
* reason where required.

Do not make the record appear as though it was never completed.

---

# 23. Task dependencies

A Task may depend on another Task:

```text
Design final cover
      ↓
Generate final proof
      ↓
Request Client approval
```

The platform should support controlled dependency semantics where actually required.

---

# 24. Dependency ≠ arbitrary automation

Task dependencies should answer:

> Can B begin/complete before A?

They should not become a hidden general workflow-programming engine.

Design 013/110 cover richer workflow definitions.

---

# 25. Circular dependency protection

The backend must reject structures such as:

```text
Task A depends on B
Task B depends on C
Task C depends on A
```

where dependencies are enforced.

Graph validation belongs server-side.

---

# 26. Subtask vs checklist item

These should be normalized deliberately.

### Checklist item

Small completion element inside a Task.

### Subtask

Potentially a real Task with:

* assignee,
* due date,
* priority,
* comments,
* context.

Do not use both concepts interchangeably.

Exact V1 behavior belongs to Phase 3D.

---

# 27. Checklist completion ≠ parent completion automatically

Example:

```text
Checklist:
4 / 4 complete

Task:
requires final review
```

The system should not automatically close a parent unless the Task policy explicitly says so.

---

# 28. Comments

Task collaboration should reuse the common Comment infrastructure.

A Comment should preserve:

```text
author
body
timestamp
visibility
edits/history where supported
```

rather than one mutable `task.notes` string.

---

# 29. Internal comments ≠ Client-visible comments

Most Tasks are internal operational objects.

If any Task-related information appears in Client Portal, backend projections must explicitly determine what is safe.

Never expose all Task comments because the Task belongs to the Client's Project.

---

# 30. Attachments reuse Design 030

Correct:

```text
TaskAttachment
      ↓
Asset/FileVersion
```

Incorrect:

```text
Task
├── upload implementation #1
Project
├── upload implementation #2
Editorial
└── upload implementation #3
```

One Asset infrastructure should serve every Task context.

---

# 31. My Tasks vs all Tasks

Design 034 can provide views such as:

```text
My Tasks
Assigned by Me
Team Tasks
All Authorized Tasks
Overdue
Due Today
Upcoming
Completed
```

These are query projections over the same canonical Task domain.

They are not separate task tables.

---

# 32. Saved views

Reuse the Saved View infrastructure established in CRM and Approval/Publishing queues.

Example:

```text
My Editorial Tasks
High-Priority Client Work
Overdue Production Tasks
This Week
```

A Saved View stores:

* filters,
* sort,
* grouping,
* display preference.

It does not duplicate Tasks.

---

# 33. List / Board / Calendar presentation

If the frozen Task workspace visually supports multiple presentations, these should be projections of one dataset:

```text
List
Board
Calendar
```

not separate records.

```text
Task
 ↓
same query model
 ├── List view
 ├── Board view
 └── Calendar view
```

---

# 34. Board columns must have clear semantics

If Kanban is supported, columns might represent lifecycle state.

But they should not arbitrarily combine:

* assignee,
* priority,
* workflow stage,
* domain.

The grouping definition must be explicit.

---

# 35. Drag-and-drop is a business command

As established for Deals:

```text
drag Task
   ↓
server command
   ↓
permission check
   ↓
transition validation
   ↓
persist
   ↓
audit/activity
```

Do not treat dragging between columns as frontend-only state.

---

# 36. Bulk operations

Potential bulk actions can include:

* assign,
* change priority,
* move due date,
* complete where allowed,
* archive.

Every record requires server-side permission validation.

One user may be able to edit 8 of 10 selected Tasks.

The backend should support partial results safely.

---

# 37. Bulk complete needs policy

Not every Task should necessarily support mass completion.

Tasks attached to controlled operational gates may require individual confirmation.

Phase 3D must classify safe bulk commands.

---

# 38. Recurring Tasks

If the frozen product requires recurring operational work, do not repeatedly mutate one Task.

Conceptually:

```text
Recurrence Rule
      ↓
Task Instance
      ↓
Task Instance
      ↓
Task Instance
```

Historical completions must remain independent.

No new screen is required.

---

# 39. Task template ≠ Task

If reusable Task templates exist later:

```text
TaskTemplate
     ↓ instantiate
Task
```

Changing the Template should not rewrite active Tasks automatically.

Same principle used across Workflow, Magazine, and Report templates.

---

# 40. Workload calculations

Design 034 may display workload indicators.

A real workload model must define what counts:

```text
open tasks?
estimated effort?
priority weighting?
due dates?
capacity?
```

A colorful “85% workload” gauge with no canonical formula should not become production truth.

---

# 41. Task effort ≠ actual time spent

If estimates/time tracking exist:

```text
Estimated effort
≠
Actual effort
```

Do not conflate them.

The audit does not introduce time tracking unless already part of frozen requirements.

---

# 42. Next Action integration

Designs 015–017 and 023 introduced canonical Next Action logic.

The Task domain should participate in:

```text
NextActionResolver
```

alongside:

* FollowUps,
* Meetings,
* Client dependencies,
* Approvals.

Do not add another manually maintained `nextAction` field per Project.

---

# 43. Task → Activity

Meaningful Task events can include:

```text
Task created
Assigned
Reassigned
Started
Priority changed
Due date changed
Blocked
Unblocked
Completed
Reopened
Comment added
Attachment added
```

Activity provides readable operational history.

---

# 44. Activity ≠ Audit

Audit-grade history may additionally preserve:

```text
actor
command
previous value
new value
timestamp
authorization context
```

especially for:

* reassignment,
* due-date manipulation,
* bulk completion,
* deletion/archive,
* restricted Client work.

---

# 45. Relationship to Design 078 — My Work

This is a major future relationship.

### Design 034

Broad Task and work management.

### Design 078

Personal cross-domain work queue.

Expected:

```text
Canonical Work Sources
├── Tasks
├── Approvals
├── FollowUps
├── Meetings
└── other assigned actions
       ↓
Design 078 My Work
```

Design 078 should **not** create another Task database.

---

# 46. Relationship to Design 111

Later frozen design:

**111 — Project Tasks / Milestones Detail**

This is a strong implementation-overlap checkpoint.

Expected architecture:

```text
Canonical Task Domain
      │
      ├── Design 034
      │   Cross-domain Task workspace
      │
      └── Design 111
          Project-scoped Tasks / Milestones
```

One Task service.

Different composition/scope.

**DO NOT MERGE THE SCREENS YET.**

---

# 47. Relationship to Design 015

Design 015 remains the canonical Meetings & Follow-ups workspace.

Shared primitives can include:

* assignee,
* due date,
* priority,
* completion control.

But:

```text
Task Service
≠
FollowUp Service
≠
Meeting Service
```

They can share UI/utilities without losing domain meaning.

---

# 48. Relationship to Design 022

Client Onboarding steps may generate/associate Tasks.

Correct:

```text
OnboardingStep
      ↓
Task(s)
```

when actual internal work is needed.

The Onboarding Step itself remains the workflow/checklist truth.

---

# 49. Relationship to Designs 024–028

Editorial, Magazine, Podcast, Video, and Event workspaces should consume contextual Task lists from this canonical domain.

For example:

```text
Video Production
   ↓
Tasks where context = VideoProject
```

No `VideoTask`, `PodcastTask`, `MagazineTask` generic tables are needed.

---

# 50. Relationship to Publishing and Distribution

Designs 031–032 can generate or reference Tasks such as:

* fix failed metadata,
* reconnect provider,
* review distribution copy.

But Task completion should not directly fake a Publication/Distribution state change.

Source-domain commands remain authoritative.

---

# 51. Permissions

Potential Phase 3D capability dimensions:

```text
task.read
task.create
task.edit
task.assign
task.reassign
task.complete
task.reopen
task.archive
task.bulk_manage
task.export
```

Exact names later.

Important:

> **READ ≠ EDIT ≠ ASSIGN ≠ COMPLETE ≠ BULK MANAGE ≠ EXPORT.**

---

# 52. Task permission ≠ source-record permission automatically

Suppose a user is assigned:

> Prepare Client invoice attachment.

They may need enough Task context to perform their work.

That assignment should not automatically grant unrestricted access to the Client's:

* invoices,
* Contracts,
* payments,
* confidential notes.

Context projection must remain permission-aware.

---

# 53. Source permission ≠ Task mutation permission

Likewise, someone who can view a Project does not automatically gain permission to edit every Task in it.

Task-level and source-level capabilities both matter.

---

# 54. Manager scopes

Potential access scopes may include:

```text
own
assigned
created-by-me
team
department
organization
Project/context
```

Managers can obtain broader visibility without giving every employee organization-wide access.

Exact policy belongs to Phase 3D.

---

# 55. Assigning ≠ granting source access

A manager should not be able to bypass security by assigning a sensitive Task to someone who otherwise has no right to see the underlying record.

The backend must evaluate whether the assignment is valid or provide a deliberately limited context projection.

---

# 56. Export permission

As elsewhere:

> **View Team Tasks ≠ export every employee's workload.**

Task exports may expose:

* Client names,
* confidential Projects,
* employee productivity data.

Export requires explicit policy.

---

# 57. States

Design 034 inherits Design 150 and requires Task-specific UI states such as:

```text
Workspace Loading
No Tasks
No Tasks Matching Filters
No Tasks Assigned to Me

Task Open
Task In Progress
Task Completed
Task Reopened

Due Soon
Due Today
Overdue

Blocked
Waiting on Dependency

Saving
Save Failed
Assignment Failed
Completion Failed

Dependency Conflict
Concurrent Update
Permission Restricted
Source Record Restricted
Source Record Unavailable
Partial Service Failure
```

These should **not** all be collapsed into one persisted Task status enum.

---

# 58. Empty ≠ unavailable

Correct:

> **You have no tasks assigned.**

means the query succeeded and found none.

If Task Service fails:

> **Tasks temporarily unavailable.**

Do not congratulate users with:

> **You're all caught up**

during a backend outage.

---

# 59. Blocked ≠ overdue

A Task can be:

```text
Blocked:
YES

Due:
Tomorrow
```

or:

```text
Blocked:
NO

Due:
3 days overdue
```

Operational analytics should preserve the difference.

---

# 60. Responsive — Desktop

Desktop should remain the richest Task-management environment:

```text
Work Management Header
↓
Task Metrics
↓
Search / Filters / Saved Views
↓
List / Board
↓
Selected Task Detail
↓
Context / Dependencies / Attachments
↓
Comments / Activity
↓
Allowed Actions
```

Dense cross-domain work management is appropriate at desktop scale.

---

# 61. Responsive — Tablet

Following Design 152:

* filters move into adaptive sheets,
* table columns reduce,
* board remains horizontally navigable where needed,
* Task detail becomes side sheet/full overlay,
* touch-safe drag alternatives exist,
* context/dependency information remains accessible.

---

# 62. Responsive — Mobile

Following Design 151, prioritize:

```text
My Work Summary
↓
Overdue / Due Today
↓
High Priority
↓
Task Cards
↓
Open Task
↓
Context
↓
Description / Checklist
↓
Dependencies
↓
Comments / Attachments
↓
Complete / Reassign where permitted
```

Do not compress an enterprise desktop table onto a phone.

---

# 63. Mobile completion safety

Before completing a context-sensitive Task, mobile should clearly show:

* Task identity,
* Client/Project context,
* required checklist/dependencies,
* any blocking requirement.

A one-swipe destructive completion pattern should not be the only option for high-impact work.

---

# 64. Accessibility

Task management must not rely solely on:

* drag and drop,
* color,
* hover.

Every board move should have a keyboard/menu alternative.

Priority/status should include text/semantic labels.

---

# 65. Backend read model

A useful composed read model:

```text
WorkManagementView
├── queue metrics
├── Task summaries
├── assignments
├── due conditions
├── priorities
├── context summaries
├── dependencies
├── source-record state
├── saved view
├── permission-aware actions
└── workload summaries
```

This is a read composition.

---

# 66. Avoid a giant generic WorkItem model

A tempting implementation would be:

```text
WorkItem
├── TASK
├── APPROVAL
├── MEETING
├── FOLLOW_UP
├── CLIENT_REQUEST
└── MILESTONE
```

and then force every domain into one table.

That would destroy important semantics.

A safer architecture is:

```text
Task
ApprovalRequest
Meeting
FollowUp
ClientRequest
Milestone
        │
        ↓
 Unified Work Read Model
```

when a combined queue is needed.

This distinction will become particularly important for Design 078.

---

# 67. Command architecture

Avoid generic:

```text
PATCH /tasks/:id
{
  status,
  assignee,
  completed,
  priority,
  dependency
}
```

for every operation.

Prefer explicit conceptual commands:

```text
createTask()
updateTaskDetails()
assignTask()
reassignTask()
changeTaskPriority()
changeTaskDueDate()
addTaskDependency()
removeTaskDependency()
completeTask()
reopenTask()
archiveTask()
```

This allows appropriate validation and audit.

---

# 68. Completion transaction

Conceptually:

```text
completeTask()
   ↓
verify permission
   ↓
load fresh Task
   ↓
validate dependencies / required conditions
   ↓
record completion
   ↓
emit TaskCompleted
   ↓
activity/audit
   ↓
dependent systems reevaluate
```

The UI should not directly mutate related Project workflow stages.

---

# 69. Task events

Normalized events can include:

```text
TaskCreated
TaskAssigned
TaskReassigned
TaskUpdated
TaskBlocked
TaskUnblocked
TaskCompleted
TaskReopened
TaskArchived
```

Other domains can react without coupling their core state to Design 034.

---

# 70. Workflow integration

Example:

```text
All required Tasks completed
        ↓
Workflow Engine reevaluates gate
```

rather than:

```text
last Task completed
        ↓
Task UI directly changes Project stage
```

This preserves one canonical Workflow engine.

---

# 71. Notification integration

Task events may trigger:

* assignment notification,
* due reminder,
* overdue notice,
* reassignment notification.

Use the canonical Notification infrastructure.

Do not create a separate Task-only notification backend.

---

# 72. Recurring reminder ≠ Task status

A reminder being sent or missed should not change the Task lifecycle automatically.

Notifications are delivery mechanisms, not work truth.

---

# 73. Concurrency

Example:

```text
User A reassigns Task to Emma
User B simultaneously marks Task complete
```

The backend must evaluate the current Task revision/state.

Another:

```text
User A moves due date
User B updates priority
```

Domain commands should avoid stale full-object overwrites.

---

# 74. Completion race

Two users may click Complete simultaneously.

Result:

```text
one canonical completion
```

not:

* duplicate completion events,
* duplicate downstream workflow transitions,
* duplicate notifications.

Completion must be idempotent.

---

# 75. Dependency concurrency

If Task B depends on Task A:

```text
User 1 completes A
User 2 simultaneously adds new blocking dependency C to B
```

the server must evaluate fresh state before declaring B unblocked.

---

# 76. Partial failure

Example:

```text
Task core        ✓
Project context  ✓
Attachments      ✕
Comments         ✓
Workload stats   ✕
```

The Task workspace stays usable.

Only affected regions show localized failure.

---

# 77. Unknown ≠ zero

If workload analytics fail:

do not show:

> **0 open tasks**

unless the underlying Task query genuinely returned zero.

If Project context fails:

do not silently display:

> No related Project.

Unavailable and absent remain distinct.

---

# 78. Backend architecture

```text
Tasks & Work Management UI
          ↓
TaskQueryService
          ↓
Tenant + Permission Scope
          ↓
Task Domain
          │
          ├── Task
          ├── TaskAssignment
          ├── TaskDependency
          ├── Checklist/Subtask model
          ├── Comments
          └── Attachment References
          │
          ├── User / Team Service
          ├── Project Service
          ├── CRM Context
          ├── Workflow Service
          ├── Asset/File Service
          ├── Notification Service
          ├── Activity / Audit
          └── Unified Work Read Model
```

---

# 79. Backend requirements

| Requirement                            | Status                                 |
| -------------------------------------- | -------------------------------------- |
| Authentication                         | **Required**                           |
| Tenant isolation                       | **Critical**                           |
| Task RBAC                              | **Critical**                           |
| Canonical Task entity                  | **Critical**                           |
| Typed contextual relationships         | **Critical**                           |
| Assignment model/history               | **Critical**                           |
| Priority/status separation             | **Critical**                           |
| Derived due/overdue condition          | **Critical**                           |
| Completion history                     | **Critical**                           |
| Reopen support                         | **Required**                           |
| Dependency model                       | **Required**                           |
| Circular dependency validation         | **Critical if dependencies supported** |
| Checklist/Subtask semantics            | **Required normalization**             |
| Comment integration                    | **Required**                           |
| Asset/File attachments                 | **Critical**                           |
| Saved views                            | **Required**                           |
| Server-side search/filter/pagination   | **Critical**                           |
| Board/list shared query model          | **Required**                           |
| Bulk action infrastructure             | **Required**                           |
| Permission-aware source context        | **Critical**                           |
| Workflow integration                   | **Critical**                           |
| Next Action integration                | **Required**                           |
| Notification integration               | **Required**                           |
| Idempotent completion                  | **Critical**                           |
| Concurrency protection                 | **Critical**                           |
| Activity history                       | **Required**                           |
| Audit history                          | **Required**                           |
| Partial service failure handling       | **Required**                           |
| Unified Work projection for Design 078 | **Critical architecture**              |

---

# 80. Canonical Task metrics

Metrics requiring one platform definition include:

**Open Tasks**
**Tasks Due Today**
**Overdue Tasks**
**Completed Tasks**
**Completion Rate**
**Average Completion Time**
**Blocked Tasks**
**Tasks by Assignee**
**Tasks by Project**
**Tasks by Priority**
**On-Time Completion Rate**

Any workload/capacity metrics must additionally define their methodology.

These may later feed:

* Executive Dashboard,
* Operations Dashboard,
* Project 360,
* My Work,
* Team Performance,
* Operations Command Center.

No independent frontend formulas.

---

# 81. Main implementation risks

Design 034 exposes major consolidation risks:

**Multiple Task engines**
Every module independently creates `EditorialTask`, `VideoTask`, `EventTask`, etc.

**Task/Follow-up conflation**
CRM follow-ups lose their sales semantics.

**Task/Meeting conflation**
Calendar interactions become generic work items.

**Task/Approval conflation**
Completing a Task incorrectly counts as formal approval.

**Task/Workflow-stage conflation**
Project/process stage implemented as a Task.

**Task/Milestone conflation**
Delivery checkpoints become ordinary checklist items.

**Task/Client-request conflation**
Waiting on Client appears as an employee performance problem.

**Task/Risk/Blocker conflation**
Operational problem state becomes indistinguishable from work to resolve it.

**Status/overdue conflation**
Derived due conditions become lifecycle states.

**Complete/delete conflation**
Historical work disappears.

**Folder/context/free-text relationships**
Tasks cannot be reliably queried by Project/Client/domain.

**Assignment permission leakage**
Assigning a Task grants unauthorized access to sensitive source records.

**Board frontend-only state**
Drag-and-drop appears successful but server truth differs.

**Bulk-action privilege leakage**
One batch command bypasses per-record permissions.

**Mega PATCH concurrency**
Assignee/due-date/priority changes overwrite one another.

**Fake workload analytics**
Percentages shown without capacity/effort methodology.

**Task-specific notification engine**
Duplicate reminders instead of shared Notification infrastructure.

**034/078/111 duplicate work models**
Later My Work and Project Tasks screens create parallel task systems.

None requires another design.

These are implementation and domain-consolidation requirements.

---

# Design 034 Audit Verdict

## **PASS — PLATFORM TASK & WORK MANAGEMENT ANCHOR**

**Domain directive:** **Task ≠ FollowUp ≠ Meeting ≠ ApprovalRequest ≠ WorkflowStage ≠ Milestone ≠ ClientRequest ≠ Risk ≠ Blocker.**

**Platform directive:** one canonical Task domain must serve CRM, Projects, Editorial, Magazine, Podcast, Video, Events, Publishing, Distribution and Operations.

**Context directive:** Tasks reference canonical source records through typed relationships instead of duplicated product-specific Task tables or arbitrary free-text links.

**Assignment directive:** creator, accountable assignee, collaborators and assignment history remain distinguishable.

**Lifecycle directive:** Task lifecycle, priority, due condition, blocked state and dependency state remain separate dimensions.

**Completion directive:** completion is a canonical, idempotent business event with actor/timestamp history; completion never means deletion.

**Dependency directive:** Task dependencies are server-validated and protected from circular structures; dependencies do not become a second generic Workflow engine.

**Checklist directive:** Checklist items and true Subtasks must receive one consistent platform definition rather than being used interchangeably.

**Asset directive:** Task attachments consume Design 030's canonical Asset/FileVersion infrastructure.

**Workflow directive:** Task completion emits events and lets the canonical Workflow Engine reevaluate progression; Design 034 never directly mutates unrelated Project/Product stages.

**Next-action directive:** Tasks contribute to the shared Next Action resolver alongside Meetings, FollowUps, Approvals and other actionable dependencies.

**Permission directive:** read, edit, assign, complete, reopen, bulk-manage and export remain independently enforceable; Task assignment never automatically grants unrestricted source-record access.

**Responsive directive:** desktop remains the full cross-domain management surface, while mobile prioritizes personal/urgent execution without shrinking enterprise tables.

**Unified-work directive:** My Work later should aggregate canonical Task + Approval + FollowUp + Meeting sources through a read model rather than merging all those domains into one `WorkItem` table.

**Overlap directive:** Designs **034, 078 and 111** must ultimately consume one canonical Task/Assignment/Dependency infrastructure.

**Consolidation directive:** **STANDARDIZE ONE PLATFORM-WIDE TASK + ASSIGNMENT + DEPENDENCY + COMPLETION + CONTEXTUAL WORK INFRASTRUCTURE — DO NOT BUILD SEPARATE TASK ENGINES FOR CRM, PROJECTS, EDITORIAL, MAGAZINE, PODCAST, VIDEO, EVENTS, PUBLISHING OR DISTRIBUTION.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **34 / 153** |
| **PASS**                                   |                         **34** |
| **STANDARDIZE decisions**                  |                         **32** |
| **Potential implementation-overlap flags** |                         **25** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**34 / 153 = 22.2% audited.**

### Shared platform architecture after Design 034

```text
PRODUCT / BUSINESS DOMAINS
       │
       ├── CRM
       ├── Projects
       ├── Editorial
       ├── Magazine
       ├── Podcast
       ├── Video
       ├── Events
       ├── Publishing
       └── Distribution
              │
              ↓
       034 TASK DOMAIN
              │
              ├── Task
              ├── Assignment
              ├── Dependency
              ├── Checklist/Subtask
              ├── Completion
              ├── Comments
              ├── Asset Attachments
              └── Activity
```

And the broader shared-service layer now contains:

```text
029 → Approval Infrastructure
030 → Asset / File Infrastructure
031 → Publishing Infrastructure
032 → Distribution Infrastructure
033 → Reporting Infrastructure
034 → Task / Work Management Infrastructure
```

# Next Sequential Audit Target

## Phase 3A.1 — Design 035 Audit

For **Design 035**, we should again verify its **exact frozen identity from the approved 153-design inventory before starting**.

We should not infer it from Tasks & Work Management or assume it is Calendar, Team, My Work, Project Tasks, Notifications, Automation, or another productivity screen.

Once its frozen identity is confirmed, we continue with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no guessing, no redesign, no additional screen and no sequence change.**

