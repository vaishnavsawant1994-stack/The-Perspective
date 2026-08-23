# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 044 — Project Timeline / Progress

Design 044 should become the **canonical Client Portal timeline and progress interpretation workspace for one Project**.

Its responsibility is to explain, in client-safe language, **what has happened, where the Project is now, which milestones are complete, what is upcoming, what is waiting on the Client, and how the Project is progressing**—without exposing the internal workflow engine, internal Tasks, staff blockers, confidential dependencies, or raw operational stage machinery.

| Audit field                     | Classification                                                                                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**                   | **044**                                                                                                                                                            |
| **Canonical name**              | **Project Timeline / Progress**                                                                                                                                    |
| **Product area**                | Client Portal / Projects / Progress / Delivery                                                                                                                     |
| **User surface**                | **Client Portal**                                                                                                                                                  |
| **Screen class**                | Client-Safe Timeline + Milestone + Progress Workspace                                                                                                              |
| **Classification**              | **Portal Detail Variant — Canonical Client Project Progress Family**                                                                                               |
| **Primary purpose**             | Present an authorized, client-readable historical and forward-looking Project timeline derived from canonical workflow, milestone, schedule and Client-action data |
| **Primary canonical entity**    | **Project** — Design 023                                                                                                                                           |
| **Primary supporting entities** | WorkflowInstance, WorkflowStageInstance, Milestone, ClientRequest, ApprovalRequest, PublicationSchedule, Meeting/Event dates where relevant                        |
| **Primary read model**          | `ClientProjectTimelineView`                                                                                                                                        |
| **Parent shell**                | `ClientPortalShell` — Design 002                                                                                                                                   |
| **Parent Project detail**       | Design 043 — Client Project Detail                                                                                                                                 |
| **Project library source**      | Design 042 — My Projects                                                                                                                                           |
| **Template family**             | `ClientProjectTimelineTemplate`                                                                                                                                    |
| **Composition**                 | `ClientProjectTimelineComposition`                                                                                                                                 |
| **Auth**                        | Required                                                                                                                                                           |
| **Authorization**               | Portal membership + Project entitlement                                                                                                                            |
| **Implementation priority**     | **Critical Client Project Experience**                                                                                                                             |
| **Reuse level**                 | **Very High**                                                                                                                                                      |

The governing invariant is:

> **Internal Workflow ≠ Client Timeline ≠ Milestone ≠ Progress Percentage ≠ Client Action.**

---

# 1. Functional responsibility

Design 044 should answer:

> **“What has already happened on this Project, what stage are we currently in, what comes next, which key dates matter, what is waiting on me, and how far through the agreed Project journey are we?”**

The correct flow is:

```text
Canonical Project
      │
      ├── Workflow
      ├── Stage history
      ├── Milestones
      ├── Client Requests
      ├── Approvals
      ├── Scheduled dates
      └── Product-specific readiness
             ↓
     Client Timeline Resolver
             ↓
     Client-safe Timeline Items
             ↓
        Design 044
```

Design 044 is therefore a **projection and interpretation workspace**, not a workflow-authoring surface.

---

# 2. Design 043 vs Design 044

### Design 043 — Client Project Detail

Broad Project 360.

### Design 044 — Project Timeline / Progress

Deep focus on:

* Project journey,
* completed milestones,
* current stage,
* upcoming milestones,
* Client dependencies,
* safe progress.

Correct:

```text
043 Project Detail
      ↓
044 Timeline / Progress
```

Design 043 may show a compact preview.

Design 044 owns the deeper timeline interpretation.

---

# 3. Design 023 remains the canonical Project

Design 044 must not create:

```text
ClientTimelineProject
PortalProjectProgress
ClientWorkflow
```

as competing Project truth.

Correct:

```text
Project
  ↓
Workflow / Milestones
  ↓
Client-safe projection
```

---

# 4. Internal workflow ≠ Client timeline

The internal Project may move through detailed states such as:

```text
IQ_RECEIVED
DRAFT_GENERATED
INTERNAL_REVIEW
CLIENT_REVIEW
DESIGN_STARTED
DESIGN_QA
PUBLICATION_READY
```

The Client timeline may intentionally display a simpler journey:

```text
Questionnaire
Content Preparation
Client Review
Design
Final Approval
Publication
Distribution
```

That is acceptable only if the mapping is centralized and truthful.

---

# 5. Do not expose raw internal workflow enums

Never send internal stage codes directly to the Portal and translate them ad hoc in React.

Instead:

```text
Internal Workflow State
        ↓
ClientTimelineMappingService
        ↓
Client-safe stage
```

One mapping should feed Designs 042, 043, and 044 where appropriate.

---

# 6. Client timeline item ≠ workflow stage necessarily

A Client timeline may contain different semantic item types:

```text
Stage
Milestone
Client Action
Approval
Publication Date
Delivery Event
```

Do not force everything into one `WorkflowStage`.

---

# 7. Workflow stage ≠ milestone

Example:

```text
Stage:
Design

Milestone:
Final Design Proof Ready
```

A stage represents a span of work.

A milestone represents a meaningful checkpoint.

They remain separate.

---

# 8. Milestone ≠ Task

Example:

```text
Milestone:
Final Draft Ready
```

may require many internal Tasks.

Those Tasks should not appear in the Client timeline unless explicitly client-facing.

---

# 9. Milestone ≠ Client Action

Example:

```text
Milestone:
Final Cover Ready

Client Action:
Approve Cover
```

These can happen close together but are not the same record.

---

# 10. Client Action Resolver reuse

Design 044 should reuse the same Client Action infrastructure established in Designs 041–043.

Potential source records:

```text
ApprovalRequest
ClientRequest
Questionnaire requirement
Requested asset
Payment requirement
```

No page-specific action inference.

---

# 11. Timeline event ≠ activity feed

This distinction matters.

### Timeline

Curated Project journey.

### Activity

Fine-grained Client-visible events.

Example:

```text
Timeline:
Final Draft Approved

Activity:
Emma uploaded Draft v4
Client commented
Approval completed
```

Do not put every activity event on the progress timeline.

---

# 12. Timeline event ≠ AuditEvent

Design 039 remains forensic evidence.

The Client Timeline is a safe product narrative.

Audit must never be exposed wholesale to Clients.

---

# 13. Progress percentage must be canonical

If Design 044 shows:

```text
72% Complete
```

that value must come from the same canonical Project progress resolver used in Designs 041–043.

Never calculate progress separately here.

---

# 14. Progress ≠ completed stages divided by total stages automatically

A tempting but unreliable implementation is:

```text
completedStages / totalStages
```

because stages can vary in complexity and duration.

The Project model needs a deliberate progress methodology.

---

# 15. Progress ≠ readiness

Internal domains may calculate:

```text
Editorial readiness
Publication readiness
Distribution readiness
```

These are not automatically equal to overall Project progress.

---

# 16. Progress ≠ elapsed time

A Project halfway through its calendar duration is not necessarily 50% complete.

Do not derive progress from:

```text
(now - startDate) / (endDate - startDate)
```

unless the product explicitly defines schedule progress separately.

---

# 17. Planned progress vs actual progress

If the frozen design compares schedule against actual Project progress, architecture should distinguish:

```text
Planned
Actual
```

rather than creating one ambiguous percentage.

Do not introduce this if the design does not require it, but preserve the ability to model them separately.

---

# 18. Current stage

The Client-facing current stage should be derived from canonical workflow state.

Correct:

```text
WorkflowInstance
      ↓
current stage
      ↓
client-safe mapping
```

Avoid manually storing:

```text
project.clientCurrentStage
```

unless it is a deliberate persisted external state.

---

# 19. Stage history matters

To display:

* completed stages,
* duration,
* actual completion dates,

the backend needs historical stage transitions.

Current stage alone is insufficient.

Conceptually:

```text
WorkflowStageHistory
├── enteredAt
├── exitedAt
├── actor/source
└── outcome
```

Exact schema Phase 3D.

---

# 20. Historical completion must remain stable

If workflow configuration later changes, old Projects should preserve the timeline structure/version they actually followed.

This follows the existing workflow-template snapshot rule from Designs 022–024.

---

# 21. Workflow template ≠ active Project workflow

Correct:

```text
WorkflowTemplate Version
        ↓ snapshot
Project WorkflowInstance
```

Changing the master template must not rewrite historical Client timelines.

---

# 22. Timeline labels can evolve without rewriting facts

Presentation labels can improve later.

But canonical underlying:

* Project stage,
* dates,
* milestone completion,

must remain historically traceable.

---

# 23. Planned date ≠ actual date

Example:

```text
Milestone:
Final Draft

Planned:
Aug 20

Actual:
Aug 23
```

Both matter.

Do not overwrite the planned date with the actual completion date.

---

# 24. Original planned date ≠ current forecast date

If dates are rescheduled:

```text
Original target:
Aug 20

Revised target:
Aug 25

Actual:
Aug 24
```

all three may be analytically useful.

Exact V1 detail depends on frozen UI.

The architecture should not destroy schedule history.

---

# 25. Reschedule history

When a Client-facing milestone moves:

the system should preserve:

* previous target,
* new target,
* change timestamp,
* source/reason where appropriate.

Do not make the Project look as though the original date never existed.

---

# 26. Internal reason ≠ Client-facing explanation

An internal delay may be:

> Designer unavailable because of staffing issue.

Client-facing explanation might be:

> Design completion date updated.

Only explicit safe communication should reach the Portal.

---

# 27. Due date ≠ completion date

Permanent distinction:

```text
targetAt
≠
completedAt
```

This is critical for timeline correctness and future on-time delivery analytics.

---

# 28. Completion ≠ approval

Example:

```text
Milestone:
Draft Prepared
```

may be complete while Client approval remains pending.

Do not collapse milestone completion and ApprovalDecision.

---

# 29. Approval timeline items

When the timeline includes an Approval:

it should derive from Design 029.

Example:

```text
Proof sent for approval
↓
Client approved Proof v4
```

Exact artifact/version lineage must be retained.

---

# 30. Pending approval ≠ completed timeline stage

A stage may be operationally finished but gated by Client approval.

The Client timeline should accurately represent:

```text
Work complete
Awaiting approval
```

rather than prematurely advancing to the next Client-facing stage.

---

# 31. Superseded approval

If Proof v4 approval is superseded by v5:

the current timeline must not continue presenting v4 approval as the active action.

Historical information may remain in the completed/history context.

---

# 32. Questionnaire milestone

Questionnaire activity can appear as:

```text
Questionnaire sent
Questionnaire submitted
```

where relevant.

Definition/version and response remain separate.

Design 048 owns detailed Questionnaire interaction.

---

# 33. Client-request milestones

A Client dependency such as:

> Upload headshots

can appear as a required-action timeline marker if frozen.

The source remains `ClientRequest`, not a manually created timeline item.

---

# 34. File upload ≠ milestone complete automatically

Uploading an image may satisfy one requirement, but business validation may still be needed.

Correct:

```text
Asset uploaded
↓
Requirement validation
↓
Requirement satisfied
```

if applicable.

---

# 35. Meeting timeline inclusion

Important Project meetings may appear in the timeline where useful.

But:

```text
Meeting
≠
Milestone
```

Design 046 owns the deeper Client Meetings experience.

---

# 36. Publication dates

Design 031 remains authoritative for Publication scheduling.

Design 044 can show:

```text
Publication scheduled
Published
```

as Client-safe timeline events.

It should never maintain a second publication date.

---

# 37. Publication scheduled ≠ published

Permanent distinction:

```text
Scheduled
≠
Published
```

A future publication should never appear as completed.

---

# 38. Published ≠ verified distribution

Distribution placements happen later through Design 032.

The Project timeline should not mark:

> Distribution complete

merely because the Publication went live.

---

# 39. Distribution timeline

If the Project journey includes distribution:

Client-safe timeline should derive from canonical Distribution state.

Examples:

```text
Distribution started
Verified distribution completed
```

according to actual product behavior.

---

# 40. Report delivery

A final Report can be a later timeline milestone:

```text
Performance Report available
```

only after an approved/final Client ReportVersion exists.

Draft Report generation does not count.

---

# 41. Project completion

Client timeline completion should derive from canonical Project closeout policy.

Do not decide completion because:

```text
last visible timeline item completed
```

unless that is the formal Project rule.

---

# 42. Project status ≠ timeline completion

A Project can be:

```text
Status:
COMPLETED
```

and still have historical final activities accessible.

Likewise some post-completion reporting/distribution may continue depending on business model.

The completion rule must be explicit.

---

# 43. Client-facing timeline item model

A useful conceptual read structure:

```text
ClientTimelineItem
├── id/reference
├── source type
├── source id
├── title
├── description
├── state
├── plannedAt
├── actualAt
├── clientActionRequired
├── action due date
├── client-visible evidence/link
└── safe metadata
```

This should be a **projection**, not necessarily a persisted universal table.

---

# 44. Do not create a second generic TimelineEvent truth store

Dangerous:

```text
TimelineEvent
├── manual title
├── fake status
├── fake date
```

maintained independently from Project/Approval/Publishing records.

Preferred:

```text
Canonical domains
      ↓
Timeline projection
```

---

# 45. Materialized timeline projection is acceptable

At scale, the backend may maintain an event-driven projection:

```text
Domain Events
   ↓
ClientTimelineProjection
```

for efficient reading.

But:

> **Projection ≠ source of truth.**

Every item must maintain source lineage.

---

# 46. Source lineage

A timeline item should know what generated it.

Example:

```text
Timeline Item:
Final Design Approved

Source:
ApprovalRequest AP-221
Subject:
ProofVersion PV-4
```

This supports accurate deep linking and prevents orphaned timeline facts.

---

# 47. Timeline item ordering

Ordering should use canonical effective timestamps.

Potential rules may consider:

* actual completion time,
* planned date,
* logical stage order.

Exact UI ordering depends on frozen design.

Do not sort purely by arbitrary insertion order.

---

# 48. Future vs past timeline

The workspace should conceptually distinguish:

```text
Completed
Current
Upcoming
```

without forcing these into the Project lifecycle itself.

These are timeline presentation states.

---

# 49. Current milestone

There may be one primary current milestone or several parallel items depending on workflow.

Architecture should not assume everything is strictly linear if the production workflow allows parallel work.

---

# 50. Parallel workflow support

For example:

```text
Design Review
+
Asset Collection
```

might happen concurrently.

The Client timeline projection should support parallel items even if the visual chooses a simplified sequence.

Do not make backend workflow strictly linear only because the timeline looks linear.

---

# 51. Dependencies

Internal workflow dependencies may determine whether milestones can advance.

The Portal should not expose all internal dependency graphs.

It only needs safe external effects such as:

> Waiting for your approval.

---

# 52. Client dependency ≠ internal blocker

Design 006/113 internal blockers remain private.

A Client-facing dependency should be explicit and safe.

Do not show:

> Blocked by Editorial Team.

unless the product intentionally exposes such status.

---

# 53. Delay status

If Client-facing timeline includes delayed milestones:

the status should derive from:

```text
planned target
+
current state
+
current time
```

and explicit delivery policy.

Do not let the frontend independently mark items overdue.

---

# 54. Due condition ≠ lifecycle state

Example:

```text
Milestone state:
PENDING

Schedule condition:
OVERDUE
```

Keep them separate.

---

# 55. Today/upcoming logic requires timezone

Client timeline date calculations should respect:

* Project timezone,
* Client/user display timezone,
* organization default,

according to canonical rules from Designs 035/040.

No browser-local-only date logic.

---

# 56. Date-only milestones

Some milestones may be all-day/date-based.

Do not turn:

> Sep 10

into:

> Sep 10, 00:00

and accidentally show Sep 9 to a user in another timezone.

Date-only semantics should remain date-only.

---

# 57. Client timezone display

Where a Project has important timed events, the UI should clearly display timezone when ambiguity matters.

Particularly for:

* Meetings,
* Events,
* Publication times.

---

# 58. Calendar integration

Design 035 remains the canonical scheduling aggregation infrastructure.

Design 044 can consume Project-related schedule items but does not create another calendar engine.

---

# 59. Relationship to Design 042

Design 042 shows compact:

* progress,
* next date,
* action required.

Design 044 provides deeper explanation.

Both use exactly the same progress and Client Action foundations.

---

# 60. Relationship to Design 043

Design 043 is the Project 360 hub.

Design 044 is one specialized Project subview.

The timeline should not become an independent Project-detail backend.

---

# 61. Relationship to Design 047

Design 047 — Client Tasks / Requests should supply detailed actionable Client dependencies.

Design 044 may show them contextually on the timeline.

One ClientRequest/action system.

---

# 62. Relationship to Design 048

Questionnaire milestones can deep-link to Client Questionnaires.

The Timeline should not implement Questionnaire forms.

---

# 63. Relationship to Designs 049–050

Draft/Design review milestones should deep-link to exact review workspace/version.

No duplicate commenting/review tools.

---

# 64. Relationship to Design 052

Approval timeline items use Design 052/029 Approval infrastructure.

No separate “timeline approval” records.

---

# 65. Relationship to Design 055

Publishing & Distribution milestones consume the canonical publication/distribution domains.

No second delivery lifecycle.

---

# 66. Relationship to Design 056

Report delivery milestones consume final ReportVersion availability.

Again: no separate Report state.

---

# 67. Relationship to Design 066

Client Media Project Detail may later contain media-specific progress.

It must still reuse the same Project/workflow/timeline foundations where appropriate.

No media-only duplicate Timeline engine.

---

# 68. Relationship to Design 118

Later internal:

**Design 118 — Project Timeline / Gantt Detail**

This is a major architectural overlap checkpoint.

Expected separation:

```text
Canonical Project Schedule / Workflow
         │
         ├── Design 044
         │   Client-safe timeline/progress
         │
         └── Design 118
             Internal detailed Gantt/timeline
```

One source.

Two radically different visibility/detail levels.

**DO NOT MERGE THE SCREENS.**

---

# 69. Client Timeline vs Internal Gantt

Design 118 may show:

* Tasks,
* dependencies,
* assignees,
* critical path,
* internal milestones,
* delays,
* resource dependencies.

Design 044 should show only:

* Client-relevant milestones,
* progress,
* required Client actions,
* safe delivery dates.

This is a legitimate separate composition.

---

# 70. Permissions architecture

Potential Phase 3D Portal capabilities:

```text
portal.projects.read
portal.projects.timeline.read
portal.projects.progress.read
```

plus action-specific permissions from source domains.

Timeline access does not imply:

* billing,
* Contracts,
* files,
* approval-decision rights.

---

# 71. Timeline read ≠ Approval authority

A Client may see:

> Approval pending

without being the designated approver.

Only authorized ApprovalParticipants should receive the Decide action.

---

# 72. Timeline read ≠ file access

A timeline item may say:

> Final Design delivered.

Opening the related file still requires Asset/FileVersion permission.

---

# 73. Timeline read ≠ Project-wide entitlement expansion

Deep links must re-check the target resource's own permissions.

The timeline does not become an access-grant mechanism.

---

# 74. Client-safe descriptions

Timeline descriptions should be explicit safe fields generated/selected server-side.

Never include internal Task descriptions/comments and assume they are safe.

---

# 75. Read model

A useful composed result:

```text
ClientProjectTimelineView
├── project summary
├── client-facing current stage
├── canonical progress
├── completed items
├── current items
├── upcoming items
├── Client Action indicators
├── planned/actual dates
├── safe change/delay messaging
├── deep-link references
└── freshness / partial-data state
```

---

# 76. Mutation boundary

Design 044 is primarily read-oriented.

It should not expose:

```text
updateTimelineItem()
markStageComplete()
changeProjectProgress()
```

as generic Client commands.

Client actions route to canonical source commands:

```text
decideApproval()
submitQuestionnaire()
respondToClientRequest()
uploadRequestedAsset()
```

Internal schedule/workflow mutations stay internal.

---

# 77. Backend architecture

```text
Design 044
   ↓
ClientPortalSessionContext
   ↓
Portal Project Authorization
   ↓
ClientProjectTimelineQueryService
   │
   ├── Project
   ├── Workflow Instance
   ├── Stage History
   ├── Milestones
   ├── Client Actions
   ├── Approval
   ├── Questionnaire
   ├── Scheduling
   ├── Publishing
   ├── Distribution
   └── Reporting
   ↓
Client Timeline Resolver
   ↓
ClientProjectTimelineView
```

---

# 78. Backend requirements

| Requirement                         | Status                    |
| ----------------------------------- | ------------------------- |
| Client Portal authentication        | **Critical**              |
| Active Portal membership            | **Critical**              |
| Project entitlement                 | **Critical**              |
| Canonical Project reuse             | **Critical**              |
| WorkflowInstance integration        | **Critical**              |
| Workflow template/version snapshot  | **Critical**              |
| Stage history                       | **Critical**              |
| Milestone model                     | **Critical**              |
| Planned vs actual dates             | **Critical**              |
| Reschedule history                  | **Required**              |
| Client-safe stage mapping           | **Critical**              |
| Canonical progress resolver         | **Critical**              |
| Client Action resolver              | **Critical**              |
| Approval integration                | **Critical**              |
| Questionnaire integration           | **Required**              |
| Asset-request integration           | **Required**              |
| Scheduling/calendar integration     | **Required**              |
| Publication schedule integration    | **Required**              |
| Distribution completion integration | **Required where shown**  |
| Final ReportVersion integration     | **Required where shown**  |
| Source lineage on timeline items    | **Critical**              |
| Client-safe descriptions            | **Critical**              |
| Date/timezone safety                | **Critical**              |
| Date-only milestone semantics       | **Required**              |
| Partial-data support                | **Critical**              |
| Deep-link permission recheck        | **Critical**              |
| No generic timeline mutation API    | **Critical**              |
| Design 118 source reuse             | **Critical architecture** |

---

# 79. Concurrency

Example:

```text
Client viewing:
Approval pending

Meanwhile:
another authorized approver completes approval
```

The timeline should refresh/reconcile rather than allow stale duplicate action.

Another:

```text
Project Manager revises milestone date
while Client has old timeline open
```

The next query should reflect authoritative current schedule.

---

# 80. Stale timeline data

Where timeline projection is event-driven/materialized, expose freshness when useful.

A delayed projection should never allow a stale action to bypass canonical command validation.

---

# 81. Partial service failure

Example:

```text
Project/Workflow    ✓
Milestones          ✓
Approval             ✕
Publishing          ✓
```

Timeline should remain usable.

Approval-specific items can show:

> Approval status temporarily unavailable.

Do not collapse the entire Project timeline.

---

# 82. Unknown ≠ not required

If Approval service fails:

do not interpret that as:

> No approval required.

If Questionnaire service fails:

do not mark it complete.

Unknown remains unknown.

---

# 83. Unknown ≠ incomplete

Likewise, if timeline projection temporarily lacks one data source:

do not render that stage as incomplete simply because the system cannot confirm it.

---

# 84. Completed ≠ current data unavailable

If a historical milestone has canonical `completedAt`, an unrelated service outage should not erase that completed state.

Historical Project truth should be stable.

---

# 85. Client-safe error language

Use:

> Some Project timeline information is temporarily unavailable.

Not:

> Workflow projection worker failed.

Internal implementation details remain private.

---

# 86. State coverage

Design 044 inherits Design 150 and requires:

```text
Timeline Loading
Timeline Available

No Timeline Yet
Timeline Partially Available

Stage Completed
Stage Current
Stage Upcoming

Milestone Completed
Milestone Upcoming
Milestone Delayed

Client Action Required
Client Action Completed
Client Action Status Unknown

Approval Pending
Approval Completed
Approval Status Unavailable

Date Revised
Progress Available
Progress Unavailable

Project Completed
Project Access Restricted
Project Access Revoked

Partial Service Failure
Record Updated Elsewhere
```

These are not one giant timeline status enum.

---

# 87. No timeline ≠ timeline unavailable

A newly created Project may genuinely have no meaningful Client timeline yet.

That is different from failure to load the timeline engine.

---

# 88. Timeline ordering during partial failure

If one source is unavailable, preserve the known timeline order and mark the missing segment appropriately.

Do not reorder remaining items in a misleading way.

---

# 89. Responsive — Desktop

Desktop can preserve the richest timeline experience:

```text
Project Header
↓
Current Status + Progress
↓
Current / Next Milestone
↓
Timeline
    ├── Completed
    ├── Current
    └── Upcoming
↓
Client Action Required
↓
Relevant Dates / Details
```

The timeline can use horizontal or vertical presentation according to the frozen design.

---

# 90. Responsive — Tablet

Following Design 152:

* timeline can become vertical if horizontal space becomes constrained,
* progress summary stays prominent,
* milestone details use cards/sheets,
* touch targets increase,
* current Client action remains visible.

---

# 91. Responsive — Mobile

Mobile priority:

```text
Project
↓
Action Required
↓
Current Stage
↓
Progress
↓
Next Milestone
↓
Vertical Timeline
    Completed
    Current
    Upcoming
↓
Open Relevant Action
```

A vertical sequence is usually more legible than shrinking a desktop horizontal timeline.

---

# 92. Mobile date clarity

For each item, keep:

* date,
* state,
* title,
* action requirement,

visibly associated.

Avoid tiny timeline dots with unclear dates.

---

# 93. Accessibility

Progress and timeline states must not rely solely on:

* colors,
* connectors,
* checked circles.

Each item should have semantic text such as:

> Completed August 12
> Current stage
> Planned September 4
> Action required

---

# 94. Screen-reader order

Timeline DOM order should follow logical chronological order.

Visual positioning must not cause screen readers to encounter events in a confusing sequence.

---

# 95. Main implementation risks

Design 044 exposes several important risks:

**Workflow/Client timeline conflation**
Raw internal stages exposed externally.

**Timeline/Milestone conflation**
Every timeline item forced into Milestone records.

**Milestone/Task conflation**
Internal Tasks exposed as Client milestones.

**Timeline/Activity conflation**
Every Project activity event appears in progress history.

**Timeline/Audit conflation**
Security evidence exposed to Clients.

**Progress fabrication**
Decorative percentage without canonical methodology.

**Progress/stage conflation**
Current stage converted directly into percent complete.

**Progress/readiness conflation**
Editorial/Publishing readiness averaged into fake Project completion.

**Planned/actual-date conflation**
Historical schedule information destroyed.

**Reschedule-history loss**
New dates overwrite original commitments.

**Internal delay reason leakage**
Staff/provider issues exposed in Client descriptions.

**Approval/stage conflation**
Stage advances because work finished even though Client approval is pending.

**Latest-version bug**
Timeline points to newest Draft/Proof rather than exact requested version.

**Parallel-workflow loss**
Backend made strictly linear because the visual timeline looks linear.

**Client dependency/internal blocker conflation**
Internal operational problems shown as Client obligations.

**Publication/distribution conflation**
Published content marked as distribution complete.

**Timeline access/action authorization conflation**
Seeing approval marker gives approval authority.

**Generic timeline mutation API**
Client manually marks stages complete.

**Unknown/incomplete conflation**
Service outage makes milestones appear unfinished.

**044/118 duplicate timeline engines**
Client Timeline and internal Gantt implemented from different Project scheduling truth.

None requires another design.

These are workflow, schedule, projection, and security requirements.

# Design 044 Audit Verdict

## **PASS — CLIENT PROJECT TIMELINE & PROGRESS PROJECTION ANCHOR**

**Domain directive:** **Internal Workflow ≠ Client Timeline ≠ Milestone ≠ Progress ≠ Client Action.**

**Project directive:** Design 023 remains canonical Project truth; Design 044 is a Client-safe timeline/progress projection.

**Consistency directive:** Designs 041–044 must share the same Project entitlement, Client-facing state mapping, Project progress resolver, and Client Action resolver.

**Workflow directive:** active Projects use snapshot/versioned WorkflowInstances; master workflow-template edits never rewrite historical Client timelines.

**Stage directive:** internal workflow stages map through one centralized Client-safe presentation layer rather than being exposed or translated independently by each screen.

**Timeline directive:** timeline items retain source lineage to canonical Workflow, Milestone, Approval, ClientRequest, Publishing, Distribution, or Reporting records.

**Progress directive:** Project progress has one governed calculation and is never inferred mechanically from stage index, elapsed calendar time, or decorative UI position.

**Milestone directive:** Stage, Milestone, Task, Approval, Meeting, and Client Action remain distinct entities even if all can contribute to the timeline.

**Schedule directive:** planned dates, revised dates, and actual completion dates remain separately representable so schedule history is not destroyed.

**Action directive:** active Client actions come from canonical source domains and deep-link to the exact relevant record/version.

**Version directive:** approval/review timeline actions always reference exact Draft/Proof/Design/etc. versions; they never follow ambiguous “latest.”

**Publishing directive:** publication schedule/published status come from Design 031; Distribution completion comes separately from Design 032.

**Security directive:** viewing a timeline item does not grant access or mutation authority over its underlying subresource.

**Mutation directive:** Design 044 is primarily read-oriented; it never exposes generic `markStageComplete()` or `updateProgress()` Portal commands.

**Reliability directive:** unavailable, incomplete, delayed, restricted, stale, and completed remain distinct states.

**Responsive directive:** desktop may use the full approved timeline composition, while mobile prioritizes action required → current stage → progress → next milestone → vertical history.

**Overlap directive:** Designs **044 and 118** must share canonical Project workflow, milestone, scheduling, stage-history, and progress infrastructure while presenting completely different internal vs Client-safe detail.

**Consolidation directive:** **STANDARDIZE ONE PROJECT WORKFLOW HISTORY + MILESTONE + SCHEDULE + PROGRESS RESOLVER + CLIENT TIMELINE PROJECTION INFRASTRUCTURE — DO NOT BUILD A SEPARATE CLIENT TIMELINE DATABASE OR A SECOND PROJECT SCHEDULING ENGINE.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **44 / 153** |
| **PASS**                                   |                         **44** |
| **STANDARDIZE decisions**                  |                         **42** |
| **Potential implementation-overlap flags** |                         **35** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**44 / 153 = 28.8% audited.**

### Client Project progression architecture after Design 044

```text
CANONICAL PROJECT — 023
        │
        ├── WorkflowInstance
        ├── Stage History
        ├── Milestones
        ├── Schedule
        ├── Client Actions
        ├── Approvals
        ├── Publishing
        └── Distribution
                ↓
        CLIENT-SAFE RESOLVERS
        ├── Status Mapping
        ├── Progress Resolver
        ├── Timeline Resolver
        └── Client Action Resolver
                ↓
        CLIENT PORTAL
        ├── 041 Dashboard
        ├── 042 My Projects
        ├── 043 Project Detail
        └── 044 Timeline / Progress
```

# Next Sequential Audit Target

## **Design 045 — Client Messages**

Its frozen identity is already locked.

After Design 045, we continue strictly:

**046 Meetings → 047 Tasks / Requests → 048 Client Questionnaires → 049 Client Draft Review → 050 Client Design Review → 051 Client Files & Assets → 052 Client Approvals → … → 077 Client Access Recovery**

For Design 045, we continue with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no redesign, no extra screen, no skipping, and no sequence change.**

