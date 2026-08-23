Correct. I retrieved the frozen identity rather than deriving it from the surrounding workflow.

The approved Project 360 design asset is explicitly titled **“Project Workspace / Project 360”** and contains the Project ID, client, package, workflow, project owner, account manager, status, health, priority, dates, progress, current stage, next action, budget, time, workflow, tasks, team, messages, meetings, files, editorial, design/media, approvals, publishing, distribution, reports and activity areas. 

So the exact frozen identity is:

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 023 — Project Workspace / Project 360

| Audit field                  | Classification                                                                                                                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                | **023**                                                                                                                                                                                                       |
| **Canonical name**           | **Project Workspace / Project 360**                                                                                                                                                                           |
| **Product area**             | Projects / Delivery / Operations                                                                                                                                                                              |
| **User surface**             | Team Workspace                                                                                                                                                                                                |
| **Screen class**             | Entity Detail / Delivery Operations 360                                                                                                                                                                       |
| **Classification**           | **Entity Detail Variant — Canonical Project Delivery Anchor**                                                                                                                                                 |
| **Primary purpose**          | Serve as the single operational command surface for one delivery Project from creation through workflow execution, tasks, team, files, approvals, production, publishing, distribution, reporting and closure |
| **Primary entity**           | **Project**                                                                                                                                                                                                   |
| **Core supporting entities** | ProjectMember, WorkflowInstance, WorkflowStageInstance, Task, Milestone, ProjectDependency, ClientRequest, Asset/File, ApprovalRequest                                                                        |
| **Related domain entities**  | Client, Deal, Contract, Package/Product, Meeting, Conversation, EditorialProject, Publication, DistributionCampaign, Report, User                                                                             |
| **Parent shell**             | `InternalAppShell` — Design 001                                                                                                                                                                               |
| **Parent template**          | `EntityDetailWorkspaceTemplate` — Design 017                                                                                                                                                                  |
| **Composition**              | `Project360Composition`                                                                                                                                                                                       |
| **Auth**                     | Required                                                                                                                                                                                                      |
| **Permissions**              | Project + related-domain + assignment/role scoped                                                                                                                                                             |
| **Implementation priority**  | **Core / Critical**                                                                                                                                                                                           |
| **Reuse level**              | **Extremely High**                                                                                                                                                                                            |

The Project 360 design itself confirms that this is much broader than an editorial-only screen: its tabs explicitly span **Workflow, Tasks, Team, Messages, Meetings, Files, Editorial, Design/Media, Approvals, Publishing, Distribution, Reports and Activity**. 

---

# 1. Functional responsibility

Design 023 answers:

> **“For this specific Client deliverable, what are we delivering, where is it in the workflow, who is responsible, what is blocked, what must happen next, and what is happening across every supporting production domain?”**

The canonical transition is:

```text
Client Onboarding
Design 022
       ↓
Project creation / intake
       ↓
PROJECT
       ↓
Project 360
Design 023
       │
       ├── Workflow
       ├── Tasks
       ├── Team
       ├── Meetings
       ├── Files
       ├── Editorial
       ├── Design / Media
       ├── Approvals
       ├── Publishing
       ├── Distribution
       └── Reporting
```

The central architectural rule is:

> **Project 360 is a composition over project-related domains. It is not a mega-record that duplicates every domain inside `Project`.**

---

# 2. Client ≠ Project

A Client represents the ongoing relationship.

A Project represents one defined delivery engagement.

```text
Client
│
├── Project A — Personal Magazine
├── Project B — Podcast
├── Project C — Leadership Article
└── Project D — Event Partnership
```

Therefore:

```text
Client status
≠
Project status
```

A Client may remain Active after ten Projects have been completed.

---

# 3. Deal ≠ Project

A Deal represents the commercial opportunity.

A Project represents delivery of sold work.

The clean lineage is:

```text
Deal
  ↓
Won
  ↓
Client conversion / handoff
  ↓
Project
```

The originating Deal should remain linked where available.

Do not convert a Deal row itself into a Project row.

---

# 4. Contract ≠ Project

Likewise:

```text
Contract
= agreement governing delivery

Project
= operational execution
```

A Project can reference the Contract/commercial scope that authorized it.

But Project workflow status should never become the authoritative Contract status.

---

# 5. Package ≠ Project

A Package is reusable commercial/product configuration.

A Project is a particular delivery instance.

Conceptually:

```text
Package
   ↓
Project creation
   ↓
Project scope snapshot
```

If the master package changes later, an existing Project must not silently acquire new deliverables or timelines.

---

# 6. Project scope snapshot

Design 023 therefore requires a stable delivery snapshot containing the relevant sold scope.

Conceptually:

```text
Project
├── packageReference
├── scopeSnapshot
├── deliverables
├── target dates
└── workflowTemplateVersion
```

This is analogous to the Proposal/Contract snapshot principles already frozen.

---

# 7. Project ≠ Workflow

This distinction becomes crucial now.

### Project

The delivery/business record.

### Workflow Template

Reusable definition of how that type of Project normally proceeds.

### Workflow Instance

The actual workflow running for this particular Project.

Correct:

```text
WorkflowTemplate
       ↓ instantiate
WorkflowInstance
       ↓ belongs to
Project
```

Not:

```text
Project.status
=
the entire workflow engine
```

---

# 8. Workflow Template ≠ Workflow Instance

Suppose a Personal Magazine workflow template contains 12 stages. The approved workflow asset indeed demonstrates a reusable Personal Magazine template containing stages, durations, tasks, milestones, approval counts, visibility and entry/exit criteria. 

Once Project 023 is created:

```text
WorkflowTemplate Version
          ↓
WorkflowInstance
          ↓
Project
```

Changing the master template later must not silently rewrite a live Project's workflow.

This repeats the safe template-instance discipline established in Design 022.

---

# 9. Project status ≠ Workflow stage

Example:

```text
Project Status:
ACTIVE

Workflow Stage:
DESIGN_AND_LAYOUT
```

Both are valid and distinct.

Another:

```text
Project Status:
ACTIVE

Workflow Stage:
CLIENT_REVIEW
```

Do not create Project statuses such as:

```text
ACTIVE_IN_CLIENT_REVIEW_WAITING_FOR_IMAGES
```

to encode every workflow condition.

---

# 10. Project health is another independent dimension

The frozen design explicitly shows Project **Status**, **Health**, **Priority**, **Progress**, **Current Stage**, **Next Action** and dates as separate fields. 

Therefore this is valid:

```text
Status: ACTIVE
Stage: DESIGN
Health: AT_RISK
Priority: HIGH
Progress: 58%
```

None should overwrite the others.

---

# 11. Project health should be derived

Potential health signals include:

**overdue critical tasks**
**blocked workflow stage**
**overdue client dependencies**
**missed milestone**
**approvals overdue**
**target date risk**

A canonical `ProjectHealthService` or read-model calculation should produce the result.

Do not persist arbitrary:

```text
redBadge = true
```

as business truth.

---

# 12. Progress ≠ stage

A Project can be:

```text
Current Stage:
Design

Progress:
58%
```

Stage answers:

> Where are we?

Progress answers:

> How much of the configured work is complete?

They require separate calculation.

---

# 13. Progress requires one canonical definition

Possible inputs include:

* workflow stages,
* tasks,
* milestones,
* weighted deliverables.

The product must choose a single authoritative calculation.

Design 023, dashboards, Client Portal and analytics must not each compute Project progress differently.

---

# 14. Progress ≠ readiness

Like onboarding:

```text
Project Progress:
92%

Publication Readiness:
NOT READY
```

can be correct if one mandatory approval remains outstanding.

Therefore readiness gates belong to the relevant workflow/publishing domain.

A percentage cannot replace them.

---

# 15. Project owner ≠ Account Manager

The approved Project 360 explicitly shows both **Project Owner** and **Account Manager**. 

### Project Owner

Responsible for delivery execution.

### Account Manager

Responsible for the ongoing Client relationship.

These roles can be held by different users.

```text
Account Manager:
Michael

Project Owner:
Sarah
```

is valid.

---

# 16. Project owner ≠ stage/task assignee

A Project Owner coordinates the Project.

Individual work belongs to:

```text
Task assignees
Stage owners
Reviewers
Designers
Editors
Publishers
```

Do not automatically assign every Project Task to the Project Owner.

---

# 17. Project team

Project membership should be first-class.

Conceptually:

```text
ProjectMember
├── projectId
├── userId
├── role
├── joinedAt
├── endedAt?
└── permissions/context
```

This allows Project-specific collaboration without changing organization-level roles.

---

# 18. Project role ≠ organization role

For example:

```text
Organization Role:
Editor

Project Role:
Lead Editor
```

or:

```text
Organization Role:
Designer

Project Role:
Cover Designer
```

These can differ.

Project assignment is contextual.

---

# 19. Project 360 should not own all its child records

The Project has relationships:

```text
Project
├── Tasks
├── Files
├── Meetings
├── Approvals
├── Editorial work
├── Publications
├── Distribution campaigns
└── Reports
```

But these remain canonical domain records.

Do not store:

```text
project.tasksJson
project.filesJson
project.approvalsJson
```

as independent copies.

---

# 20. Workflow tab

The Workflow tab should consume:

```text
Project
   ↓
WorkflowInstance
   ↓
StageInstances
```

Stage transition commands must go through the workflow engine.

The Project 360 UI must never directly mutate:

```text
project.currentStage = "Design"
```

without validating transition rules.

---

# 21. Stage transition

Correct:

```text
Advance Stage
     ↓
WorkflowTransitionService
     ↓
permission
     ↓
entry/exit criteria
     ↓
blocking dependencies
     ↓
required approvals
     ↓
transition persisted
     ↓
activity/audit
```

This applies whether the transition originates from Design 023 or any later workflow screen.

---

# 22. Workflow Template criteria become runtime checks

The frozen workflow asset already includes concepts such as **Entry Criteria**, **Exit Criteria**, required stages, skip rules, task locks and auto-advance. 

Those configuration fields need corresponding runtime semantics.

They cannot exist only as decorative template settings.

---

# 23. Tasks tab

Project Tasks must use the canonical Task system.

```text
Project
 ↓
Task Query
```

not a Project-specific checklist database.

Later **Design 111 — Project Tasks / Milestones Detail** should use exactly the same task records.

---

# 24. Task ≠ Workflow Stage

A Stage may contain multiple Tasks.

```text
Stage: Design
├── Create cover concept
├── Prepare layout
├── Internal review
└── Upload proof
```

Stage progression and Task completion are related but not the same concept.

---

# 25. Milestone ≠ Task

A Milestone represents a meaningful delivery checkpoint.

A Task represents actionable work.

```text
Tasks
    ↓
Milestone:
Cover Approved
```

A Milestone may be satisfied by multiple tasks and/or approval conditions.

---

# 26. Project timeline ≠ Activity timeline

We should distinguish:

### Planned timeline

Dates, milestones, dependencies, forecast schedule.

### Activity timeline

Historical events that already happened.

Design 023 may summarize both, but they use different underlying records.

Later **Design 118 — Project Timeline / Gantt Detail** and **119 — Project Activity / Project Audit Timeline** make this separation even more important.

---

# 27. Meetings

Meetings visible inside Project 360 must remain canonical Meeting records from Design 015.

Example:

```text
Project
├── Kickoff Meeting
├── Cover Review
└── Final Proof Meeting
```

No second `ProjectMeeting` implementation is needed unless merely a relationship table.

---

# 28. Messages

Likewise, Project messages must originate from the canonical communication/message system.

Project 360 can filter/link conversations by Project.

It must not implement a second email/chat database.

---

# 29. Files

The frozen Project 360 contains a substantial **Recent Files** area. 

Files must use one canonical Asset/File service with:

**versions**
**owner**
**rights**
**visibility**
**approval relationship**

Later Design 114 must reuse the same file records.

---

# 30. File visibility

Every Project file should support appropriate access policy such as:

```text
INTERNAL_ONLY
CLIENT_VISIBLE
```

where needed.

Client Portal users must never gain access solely because:

```text
file.projectId = theirProjectId
```

Visibility still requires explicit authorization.

---

# 31. Editorial relationship

Design 023 includes an Editorial area, but it is not itself the full Editorial workflow.

Correct:

```text
Project
   ↓
EditorialProject / Editorial work
   ↓
Design 024 and later Editorial screens
```

Project 360 provides summary, navigation and cross-domain context.

---

# 32. Design / Media relationship

The same principle applies to:

**Magazine production**
**Podcast**
**Video**
**Event**

Project 360 is the common delivery shell.

Product-specific production workspaces remain specialized.

This supports the frozen architecture rule that product work should attach to one common Project rather than independent project databases.

---

# 33. Approval relationship

Project 360 may show:

**5 pending approvals**

but must consume the canonical Approval service.

```text
Project
 ↓
ApprovalRequests scoped to Project
```

It should not store:

```text
project.approvalCount = 5
```

as independently mutable truth except as an explicit cached projection.

---

# 34. Client actions vs internal actions

The Project 360 design visibly distinguishes **Pending Client Actions** and **Pending Internal Actions**. 

That is an important domain distinction.

The backend must preserve:

```text
responsibleParty = INTERNAL
```

versus:

```text
responsibleParty = CLIENT
```

for tasks/requests/dependencies.

This builds directly on Design 022's dependency architecture.

---

# 35. Client request ≠ internal Task

Later **Design 116 — Project Client Requests / Dependency Tracker** exists specifically because client dependencies require distinct operational semantics.

A Client Request might result in a Task internally, but they should not automatically be the same record.

For example:

```text
Client Request:
Upload final headshots

Internal Task:
Review uploaded headshots
```

These have different owners and lifecycles.

---

# 36. Project blockers

A blocker should identify:

```text
source
affected stage/task
severity
responsible party
createdAt
resolvedAt
```

rather than simply:

```text
project.isBlocked = true
```

This allows Design 023 to explain **why** a Project is blocked.

---

# 37. Risk ≠ blocker

### Risk

Something that may cause future impact.

### Blocker

Something currently preventing progress.

Later **Design 113 — Project Risks / Blockers Workspace** should maintain that distinction.

Design 023 summarizes both where appropriate.

---

# 38. Next Action

Design 023 should reuse the cross-domain Next Action Resolver concept.

Potential candidate sources:

```text
Overdue critical Task
Upcoming Meeting
Client Request due
Required Approval
Workflow transition requirement
```

Then:

```text
Project
 ↓
ProjectNextActionResolver
 ↓
Next Action summary
```

Do not maintain conflicting manual text across the Project, Workflow and Tasks systems.

---

# 39. Project budget

The approved Project 360 includes Budget and Spent information. 

These require a clear source.

At minimum:

```text
Commercial value
≠
Project budget
≠
actual internal cost
≠
invoice amount
```

The audit should prevent those numbers from being treated interchangeably.

---

# 40. Project commercial value vs delivery budget

Example:

```text
Contract Value:
$54,000

Project Delivery Budget:
$25,000

Actual Internal Cost:
$17,400
```

All three can legitimately differ.

Any Project budget/cost feature must use precise definitions.

---

# 41. Permissions

Design 023 requires layered authorization.

Potential future capabilities include:

```text
project.read
project.edit
project.assign
project.move_stage

project.task.manage
project.file.read
project.file.upload
project.approval.request
project.client_request.manage
```

Exact names belong to Phase 3D.

---

# 42. Project membership does not imply every domain permission

A user assigned to the Project may be allowed to:

**view project summary**
**complete assigned tasks**

without automatically receiving:

**finance details**
**contract details**
**all internal notes**
**publish authority**

Related-domain permissions remain independent.

---

# 43. Permission-aware tabs

Example:

```text
Overview       ✓
Workflow       ✓
Tasks          ✓
Files          ✓
Editorial      ✓
Approvals      ✓
Publishing     ✕
Finance        ✕
```

The backend must enforce each related query.

Tab hiding alone is not security.

---

# 44. Client visibility

Project 360 itself remains an internal Team Workspace screen.

Client Portal receives a separate, whitelisted Project projection.

The architecture source of truth explicitly states that Client Portal users must never receive internal notes, internal review comments, margins, employee-only activity or other protected internal data. 

Therefore:

```text
Internal Project 360
        ≠
Client Project Detail
```

even though both reference the same canonical Project.

---

# 45. Reusable component mapping

Design 023 should reuse Design 017's:

`RecordHeader`
`RecordTabs`
`RecordMetricStrip`
`ActivityTimeline`
`RelatedEntityCard`
`OwnerControl`
`RecordActionMenu`

and formalize Project-specific composites:

`ProjectSummaryHeader`
`ProjectProgressCard`
`ProjectHealthIndicator`
`WorkflowStageSummary`
`MilestoneList`
`PendingClientActions`
`PendingInternalActions`
`ProjectTeamCard`
`RecentFilesCard`
`UpcomingMeetingsCard`
`ProjectNextActionCard`
`ProjectReadinessSummary`

---

# 46. Template classification

Design 023 does **not** require a completely new page-shell family.

It is:

```text
EntityDetailWorkspaceTemplate
        +
Project Delivery Components
        +
Cross-domain Operational Composition
        =
Project360Composition
```

This is exactly the reusable architecture we wanted Phase 3A to uncover.

---

# 47. Relationship to Design 024

The next frozen screen is **Design 024 — Editorial Project / Editorial Workflow Workspace**.

The distinction should be:

### Design 023 — Project Workspace / Project 360

Cross-domain master Project record.

### Design 024

Editorial execution/workflow within that Project.

Conceptually:

```text
Project 360
Design 023
    ↓
Editorial
    ↓
Editorial Project / Workflow
Design 024
```

Do not merge them.

---

# 48. Relationship to Designs 108–123

The later roadmap contains specialized Project operations:

**108 Project Intake / Creation**
**111 Tasks / Milestones**
**112 Team / Resource Assignment**
**113 Risks / Blockers**
**114 Files / Deliverables**
**115 Approval Gates**
**116 Client Requests**
**117 Change Requests**
**118 Timeline / Gantt**
**119 Activity / Audit Timeline**
**120 Completion / Closeout**
**121 Final Handover**
**122 Retrospective**
**123 Archive**

The Project 360 should compose summaries from all those canonical domains.

It must not duplicate their full specialized workflows.

---

# 49. This is a major overlap checkpoint

We can now flag a broad architectural relationship:

```text
                 Project Domain
                      │
        ┌─────────────┴─────────────┐
        ↓                           ↓
023 Project 360           Specialized Project Screens
                           108–123
```

This is **intended reuse**, not a reason to delete approved screens.

The later audits will determine where tabs, drawers and separate routes should share implementation.

---

# 50. Partial failure behavior

Because Project 360 composes many domains, this is critical.

Example:

```text
Project core         ✓
Workflow             ✓
Tasks                ✓
Files                ✓
Editorial            ✓
Publishing           ✕
Distribution         ✓
```

Correct:

> Project 360 remains functional; Publishing section shows a localized failure/retry.

Incorrect:

> Entire Project Workspace fails.

---

# 51. Lazy loading

The Project core/header should render first.

Then heavier domains can load independently:

```text
Workflow
Tasks
Activity
Files
Editorial
Approvals
Publishing
Distribution
Reports
```

A Project with thousands of activity events/files must not block the entire page.

---

# 52. Read model

Design 023 is a strong candidate for:

```text
Project360View
├── Project core
├── Client summary
├── scope/package
├── owners/team
├── workflow summary
├── progress/health
├── milestones
├── next action
├── pending client actions
├── pending internal actions
├── files summary
├── meeting summary
├── approval summary
└── production/publishing summaries
```

This is a read composition.

---

# 53. Never PATCH Project360View

Incorrect:

```text
PATCH /project360
{
  task: ...,
  workflow: ...,
  approval: ...,
  publication: ...
}
```

Correct:

```text
ProjectService
WorkflowService
TaskService
FileService
ApprovalService
PublishingService
DistributionService
```

remain authoritative for writes.

The Project 360 endpoint/query is not a universal mutation API.

---

# 54. Concurrency

Multiple teams will operate the same Project simultaneously.

For example:

```text
Editor completes Task
Designer uploads File
PM advances Stage
Client submits Asset
```

These must not overwrite one another because a giant Project object was saved wholesale.

Domain-specific writes sharply reduce this risk.

---

# 55. Stage transition concurrency

Example:

```text
User A attempts:
Design → Client Review

User B marks a required Design approval rejected
```

The Workflow service must evaluate fresh canonical state before transition.

Stale browser state cannot decide.

---

# 56. Responsive contract — Desktop

Desktop should preserve the rich Project 360 composition shown in the approved design:

**header + project metrics + tabs + progress/workflow + pending actions + files + meetings + team + contextual sidebar**. 

This is appropriately desktop-dense.

---

# 57. Responsive contract — Tablet

Following Design 152:

* Project header reflows,
* metrics reduce to priority cards,
* tabs become scrollable,
* right-side panels become drawers/stacked sections,
* workflow summary remains understandable,
* tables reduce to priority columns.

---

# 58. Responsive contract — Mobile

Following Design 151, prioritize:

```text
Project Identity
↓
Status / Health / Progress
↓
Current Stage
↓
Next Action
↓
Urgent Client/Internal Actions
↓
Upcoming Milestone
↓
Tasks
↓
Approvals
↓
Files
↓
Team
↓
Activity
```

The full desktop 14-tab surface must not simply shrink horizontally.

---

# 59. Mobile urgent actions

Critical mobile actions can include:

**Open next Task**
**Complete Task**
**Upload requested File**
**Request/record Approval**
**Open Meeting**
**Update allowed Stage**

More complex production editors remain desktop-first.

---

# 60. State coverage

Design 023 inherits Design 150 plus Project-specific states:

**Project Loading**
**Project Not Found**
**Project Planned / Not Started**
**Project Active**
**Project Blocked**
**Project At Risk**
**Project Completed**
**Project Archived**
**No Tasks Yet**
**No Files Yet**
**No Meetings**
**No Approvals**
**Workflow Not Instantiated**
**Stage Transition Pending**
**Stage Transition Rejected**
**Record Updated Elsewhere**
**Permission Restricted**
**Related Service Failure**
**Partial Data Failure**

These remain semantically distinct.

---

# 61. Completed ≠ archived

A Completed Project is a successful workflow outcome.

An Archived Project is a storage/retention state.

Later Design 123 reinforces this distinction.

```text
COMPLETED
≠
ARCHIVED
```

A Project may remain accessible and reportable after completion before eventual archival.

---

# 62. Project closeout ≠ deletion

Project history must remain available after delivery.

This includes:

* activity,
* files,
* approvals,
* commercial lineage,
* deliverables,
* publishing/distribution,
* reports.

Hard deletion should be a restricted administrative/data-retention operation, not ordinary project completion.

---

# 63. Backend architecture

Recommended conceptual structure:

```text
Project 360 UI
      ↓
Project360QueryService
      ↓
Tenant + Permission Scope
      ↓
Canonical Project
      │
      ├── Client / Commercial Context
      ├── Workflow Engine
      ├── Task / Milestone Service
      ├── Team / Resource Service
      ├── Meeting / Communication
      ├── File / Asset Service
      ├── Approval Service
      ├── Editorial / Media Domains
      ├── Publishing
      ├── Distribution
      └── Reporting
```

Commands remain domain-specific.

---

# 64. Backend requirements

| Requirement                             | Status       |
| --------------------------------------- | ------------ |
| Authentication                          | **Required** |
| Tenant isolation                        | **Critical** |
| Project RBAC / record scope             | **Critical** |
| Canonical Project entity                | **Critical** |
| Client/Deal/Contract lineage            | **Critical** |
| Package/scope snapshot                  | **Critical** |
| Workflow Template → Instance separation | **Critical** |
| Workflow version/snapshot               | **Critical** |
| Stage Transition service                | **Critical** |
| ProjectMember model                     | **Required** |
| Task/Milestone integration              | **Critical** |
| Client dependency integration           | **Critical** |
| File/Asset integration                  | **Critical** |
| Approval integration                    | **Critical** |
| Editorial/media integration             | **Critical** |
| Publishing/distribution integration     | **Required** |
| Project health derivation               | **Required** |
| Project progress canonical calculation  | **Critical** |
| Next Action resolution                  | **Required** |
| Permission-aware related queries        | **Critical** |
| Lazy/paginated read model               | **Required** |
| Partial-failure support                 | **Required** |
| Concurrency protection                  | **Critical** |
| Activity history                        | **Required** |
| Audit history                           | **Required** |

---

# 65. Canonical Project metrics

Metrics that need centralized definitions include:

**Project Progress**
**Project Health**
**Active Projects**
**Projects At Risk**
**Blocked Projects**
**On-Time Delivery**
**Average Delivery Time**
**Overdue Tasks**
**Pending Client Actions**
**Pending Approvals**

These may appear across:

**Design 003 Executive Dashboard**
**Design 006 Operations Dashboard**
**Design 021 Client 360**
**Design 023 Project 360**
**Design 136 Operations Command Center**
**Analytics / Reports**

They must share one definition.

---

# 66. Main implementation risks

The Design 023 audit flags several major risks:

**Client/Project conflation**
Treating one delivery engagement as the Client relationship itself.

**Project/Workflow conflation**
Using Project status as the entire workflow engine.

**Template/live-instance conflation**
Master workflow edits silently changing active Projects.

**Mega-record architecture**
Tasks, files, meetings, approvals and production data duplicated inside Project.

**Progress drift**
Different screens showing different Project percentages.

**Health/status overload**
Workflow stage, Project status, health and priority collapsed into one field.

**Owner conflation**
Account Manager, Project Owner and individual task/stage owners treated as one role.

**Client/internal-action conflation**
Unable to determine whether delays belong to the Client or internal team.

**Permission leakage**
Every Project member receiving commercial, finance or publishing authority.

**Internal → Portal leakage**
Internal notes/stages/files accidentally exposed to external users.

**Cross-domain save collisions**
One giant Project form overwriting changes made simultaneously by multiple teams.

**Project 360 overgrowth**
Implementing full specialized project workflows inside every tab rather than linking to canonical services.

None requires a new visual screen.

They require correct composition and domain boundaries.

# Design 023 Audit Verdict

## **PASS — CANONICAL PROJECT DELIVERY / PROJECT 360 ANCHOR**

**Template directive:** Design 023 reuses the `EntityDetailWorkspaceTemplate` through a canonical `Project360Composition`; it does not require another independent 360 framework.

**Domain directive:** **Client ≠ Project ≠ Workflow ≠ WorkflowStage ≠ Task ≠ Milestone.**

**Commercial directive:** Project preserves lineage to Client, originating Deal/Contract and sold Package/scope without duplicating those domains.

**Snapshot directive:** Project scope and Workflow Template configuration must be frozen/versioned appropriately at instantiation so later master-data changes do not rewrite live delivery.

**Workflow directive:** Stage progression is owned by one server-authoritative Workflow Transition service with entry/exit criteria, dependencies and approval checks.

**Ownership directive:** Account Manager, Project Owner, Project Members, stage owners and Task assignees remain separate contextual roles.

**Progress directive:** Project progress has one canonical calculation shared by internal dashboards and allowed client-facing projections.

**Health directive:** Project status, current workflow stage, health, priority, progress and readiness remain independent dimensions.

**Dependency directive:** Client actions/dependencies remain distinguishable from internal work and blockers.

**Composition directive:** Tasks, Meetings, Files, Approvals, Editorial, Publishing, Distribution and Reports remain canonical linked domains rather than Project-owned duplicates.

**Permission directive:** Project access does not automatically grant Finance, Contract, Publishing or internal-note access; related sections enforce their own permissions.

**Client-visibility directive:** Client Portal consumes a separately authorized client-safe Project projection rather than the raw Team Workspace Project 360 read model.

**Performance directive:** Project 360 requires lazy/paginated related queries and section-level failure isolation.

**Reuse directive:** Designs **108–123** must reuse the same canonical Project domain, while Design 023 remains the overall cross-domain 360 composition.

**Consolidation directive:** **STANDARDIZE PROJECT 360 + ENTITY DETAIL + WORKFLOW SUMMARY INFRASTRUCTURE — DO NOT MERGE PROJECT 360 WITH EDITORIAL WORKFLOW, PROJECT TASKS, FILES, RISKS, CLIENT REQUESTS, GANTT, CLOSEOUT OR ARCHIVE SCREENS.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **23 / 153** |
| **PASS**                                   |                         **23** |
| **STANDARDIZE decisions**                  |                         **21** |
| **Potential implementation-overlap flags** |                         **14** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

### Reusable architecture through Design 023

```text
InternalAppShell
│
├── Dashboard Family                         003–007
├── Data Acquisition Family                  008–009
├── Data Quality / Enrichment                010
├── CRM List Workspace                       011
├── Campaign Operations                      012
├── Versioned Workflow Builder               013
├── Unified Communication                    014
├── Action & Scheduling                      015
├── Pipeline Board                           016
├── Entity Detail / 360                      017
│   ├── Deal Detail                          017
│   ├── Client 360                           021
│   └── Project 360                          023
├── Versioned Commercial Document            018
├── Contract Execution Workspace             019
├── Billing & Payment Workspace              020
└── Guided Workflow / Checklist              022
```

The operational transition is now clean:

```text
COMMERCIAL
Deal → Proposal → Contract → Invoice/Payment
                     ↓
CLIENT
Design 021
                     ↓
ONBOARDING
Design 022
                     ↓
PROJECT
Design 023
                     ↓
PRODUCT-SPECIFIC DELIVERY WORKFLOWS
Editorial / Magazine / Podcast / Video / Event
```

# Next Sequential Audit Target

## **Phase 3A.1 — Design 024: Editorial Project / Editorial Workflow Workspace Audit**

Design 024 is the next frozen screen. It should be audited as the first major **product-specific execution layer underneath Project 360**, establishing the separation between the canonical Project, EditorialProject/editorial context, workflow stages, Questionnaire, Draft and DraftVersion, internal review, client review, approvals, assets and publication readiness.

We continue with exactly the same contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no redesign, no additional screen and no sequence change.**

