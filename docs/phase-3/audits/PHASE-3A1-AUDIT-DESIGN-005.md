We continue strictly with Design 005 — Editorial Dashboard, preserving the frozen sequence and applying the same Phase 3A.1 audit contract.

Phase 3A.1 — Master 153-Design Inventory Audit
Design 005 — Editorial Dashboard
Audit field	Classification
Design ID	005
Canonical name	Editorial Dashboard
Product area	Editorial / Content Production
User surface	Team Workspace
Screen class	Department Dashboard / Operational Overview
Classification	Template Variant — Dashboard Family
Primary purpose	Give Editorial leadership and production staff a live overview of editorial workload, content stages, drafts, reviews, approvals, deadlines, client dependencies and publication readiness
Primary entities	Project, EditorialProject, Draft, DraftVersion, EditorialReview, ApprovalRequest
Supporting entities	Client, Contact, Questionnaire, Response, ResearchItem, Asset, Task, Milestone, User, Comment, Publication
Parent shell	InternalAppShell — Design 001
Parent page family	Shared Dashboard Architecture established by Design 003
Suggested composition	EditorialDashboardComposition
Auth	Required
Permissions	Editorial role + project/department/assignment scope
Implementation priority	Core / High
Reuse level	High
1. Functional responsibility

Design 005 should answer:

“What editorial work is moving, what is stalled, what requires review, and what must happen next to keep every piece on schedule?”

It is an aggregation and prioritization surface—not a second Editorial Studio.

A draft requiring review should deep-link to the canonical editorial project or draft-review workspace. A missing questionnaire should open the corresponding questionnaire/client dependency. A pending client approval should open the approval record. A publication-ready piece should move the user toward its canonical publishing workflow.

The dashboard therefore summarizes the editorial system while the underlying records remain owned by their canonical modules.

2. Canonical Editorial Dashboard regions

The top KPI layer should concentrate on metrics such as Active Editorial Projects, Drafts in Progress, Internal Reviews Pending, Client Reviews Pending, Approvals Waiting, Publication Ready, Overdue Items, and Deadlines This Week.

The main operational areas should cover Editorial Pipeline, showing content by stage; Needs My Review, showing work assigned to the current editor; Deadlines & Risk, highlighting overdue or at-risk content; Client Dependencies, including questionnaires, assets and feedback; Team Workload, showing assignments/capacity where permitted; Recent Drafts & Revisions; Approval Queue; Publication Readiness; and Editorial Activity.

A canonical stage summary can aggregate:

Brief → Questionnaire → Research → Drafting → Internal Review → Client Review → Revisions → Approved → SEO/Finalization → Publication Ready

But this dashboard should never become the interface used to author every transition manually.

3. Reusable component mapping

Design 005 should heavily reuse the Dashboard family already established by Designs 003 and 004:

PageHeader
DateRangeSelector
KpiCard
KpiTrend
ChartCard
StatusSummary
AttentionCard
ActivityFeed
EntityMiniList
ProgressCard
WidgetSkeleton
WidgetErrorState

Editorial-specific composites can then sit above those primitives:

EditorialPipelineWidget
DraftReviewQueueWidget
EditorialDeadlineWidget
ClientDependencyWidget
PublicationReadinessWidget
EditorialWorkloadWidget
RevisionSummaryWidget
EditorialApprovalWidget

The implementation pattern is therefore:

shared primitives → shared dashboard system → editorial-specific widgets → Design 005 composition

—not a new dashboard framework.

4. Consolidation decision

Design 005 belongs to the same broad Dashboard family as Designs 003 and 004:

DashboardTemplate
├── 003 Executive / Admin Dashboard
├── 004 Sales Dashboard
├── 005 Editorial Dashboard
├── 006 Operations Dashboard
├── 007 Finance Dashboard
├── 135 Analytics Executive Dashboard
├── 136 Operations Command Center
└── 137 Team Performance / Workload Analytics
Audit classification

STANDARDIZE — REUSE DASHBOARD FAMILY

Merge with another screen?

NO.

Editorial has a distinct operational purpose and permission/data model, so Design 005 remains its own screen composition.

5. Required data architecture

Conceptually, the dashboard should consume a purpose-built read model rather than load entire editorial datasets into the browser:

EditorialDashboardSummary
├── ProjectSummary
├── StageSummary
├── DraftSummary
├── ReviewSummary
├── ApprovalSummary
├── ClientDependencySummary
├── DeadlineSummary
├── TeamWorkloadSummary
├── PublicationReadinessSummary
└── EditorialActivitySummary

Important aggregated data includes project counts by editorial stage; drafts by status/version; internal vs client reviews; revisions requested; missing questionnaires/responses; missing assets; pending approvals; overdue deadlines; publication readiness; editor/writer assignments; and recent activity.

6. Critical separation: internal vs client review

This is one of the most important architectural rules for Design 005.

The dashboard must maintain separate concepts for:

Internal Review
and
Client Review

They cannot be represented by one generic “Review” state.

Internal comments, fact-check notes, staff discussions and rejected working drafts remain internal.

Client users should only receive explicitly shared versions, client-visible comments and approval requests.

Therefore queries should understand concepts such as:

INTERNAL_ONLY
CLIENT_VISIBLE

rather than filtering sensitive information after it has already reached the browser.

7. Permission behavior
Editorial Lead / Editor-in-Chief

May see department-wide workloads, reviews, overdue work, publication readiness and editorial bottlenecks.

Editor

Usually sees assigned projects plus editorial records within their scope and work requiring their review.

Writer

Primarily sees assigned briefs, drafts, revisions, deadlines and editorial feedback relevant to their work.

Account Manager

May see client-facing editorial progress and dependencies without necessarily receiving unrestricted editorial notes.

Admin

May have broader visibility according to effective permissions.

The backend should enforce scopes such as organization, department, assigned project and own work.

A writer must not obtain department-wide confidential drafts simply because a dashboard widget exists.

8. Quick-action architecture

Suitable dashboard shortcuts include:

Create Editorial Project
Assign Writer
Open Review Queue
Request Client Input
Create Task
Open Approval Queue
Open Publication-Ready Items

But these actions should call canonical workflows.

For example:

Assign Writer
→ canonical project/team assignment flow.

Review Draft
→ exact DraftVersion review workspace.

Request Client Approval
→ canonical approval workflow.

Design 005 must not implement duplicate mini-versions of those systems.

9. Versioning requirements

Editorial content is inherently versioned.

The dashboard should never merely display:

“Draft Approved”

without knowing which DraftVersion was approved.

The conceptual relationship should remain:

Draft
├── DraftVersion v1
├── DraftVersion v2
├── DraftVersion v3 ← client reviewed
└── DraftVersion v4 ← current revision

An approval against v3 must not imply that v4 is also approved.

Dashboard status aggregation must derive from version-aware canonical records.

10. Deadline and blocker logic

The dashboard should distinguish:

Overdue editorial work
Blocked by internal team
Waiting on client
Waiting on approval
Waiting on assets
At risk but not overdue

These are materially different operational states.

This allows the editor to understand whether the next action is:

write → review → chase client → request asset → approve → publish

rather than treating everything as simply “late.”

11. Responsive contract
Desktop

Multi-column editorial operations dashboard with KPI strip, editorial pipeline, review queues, deadlines, workload and activity.

Tablet

Following Design 152, the dashboard should move to approximately two-column composition. Priority review/deadline information remains high, while secondary activity and workload sections stack lower.

Mobile

Following Design 151, prioritize:

Urgent reviews → overdue deadlines → client dependencies → assigned drafts → publication-ready items → workload/activity

Complex stage charts should transform into compact stage summaries/cards rather than becoming illegible miniature desktop charts.

12. State coverage

Design 005 inherits Design 150 for:

Initial Loading
Widget Loading
No Editorial Projects
No Reviews Pending
No Client Dependencies
No Results After Filtering
Permission Restricted
Partial API Failure
Stale Editorial Data

Partial degradation is particularly important.

For example:

Editorial Pipeline       ✓
Review Queue             ✓
Client Dependencies      ✓
Publishing Readiness     ✕ service unavailable
Deadline Summary         ✓

Only the unavailable widget should fail where possible.

13. Backend architecture requirement

Recommended conceptual flow:

EditorialDashboard
        ↓
EditorialDashboardQueryService
        ↓
Effective Permission Scope
        ↓
Projects / DraftVersions /
Reviews / Approvals /
Tasks / Dependencies /
Publication Readiness

Architecture requirements:

Requirement	Needed
Authentication	Yes
Organization isolation	Yes
Department/project scope	Yes
RBAC	Yes
Version-aware queries	Yes — critical
Client visibility enforcement	Yes — critical
Aggregation service	Yes
Caching	Recommended
Data-freshness metadata	Recommended
Heavy direct mutation	No
14. Relationship to Design 024

This distinction must remain extremely clear during implementation:

Design 005 — Editorial Dashboard

Cross-project editorial overview

Answers:

“What editorial work needs attention across my scope?”

Design 024 — Editorial Project / Editorial Workflow Workspace

One specific editorial project's production workspace

Answers:

“How do we execute this particular editorial project?”

They should share components such as status badges, review cards, draft summaries and workflow indicators, but must not be merged.

Design 005 navigates into Design 024-style detailed records.

15. Relationship to Publishing

The Editorial Dashboard may show:

Publication Ready: 12

But the editorial team's responsibility ends at the approved handoff point according to the workflow.

Actual publishing execution belongs to the Publishing system.

This keeps:

Editorial readiness
separate from
Publication execution

and prevents editors from bypassing publishing controls.

16. Main implementation risks

The audit identifies several areas that need architectural discipline:

Status drift — different screens using incompatible editorial stage names.

Version confusion — showing approval without linking it to the exact DraftVersion.

Client-data leakage — exposing internal comments through shared dashboard queries.

Duplicate review logic — dashboard implementing review transitions instead of the canonical workflow service.

Incorrect readiness — marking content publication-ready despite missing approvals or assets.

Metric inconsistency — “Overdue Draft” or “Review Pending” being calculated differently across Dashboard, Project and Reports.

These are implementation concerns, not reasons to redesign Design 005.

Design 005 Audit Verdict
PASS — DASHBOARD TEMPLATE VARIANT

Implementation directive: Build Design 005 as an editorial-specific composition of the canonical Dashboard framework established from Design 003.

Data directive: Use centralized, version-aware editorial aggregation services. Do not calculate critical workflow state independently in frontend widgets.

Visibility directive: Internal editorial review and client-facing review remain strictly separated at the backend/query level.

Navigation directive: Drafts, approvals, client dependencies, projects and publication-ready items should deep-link to their canonical detailed workspaces.

Consolidation directive: STANDARDIZE COMPONENTS — DO NOT MERGE SCREENS.

Phase 3A.1 — Running Audit
Result	Count
Audited	5 / 153
PASS	5
STANDARDIZE decisions	3
MERGE screen candidates	0
FIX BEFORE CODE	0
New designs	0
Canonical architecture discovered

001 → InternalAppShell
002 → ClientPortalShell
003 → Executive Dashboard composition
004 → Sales Dashboard composition
005 → Editorial Dashboard composition

Designs 003–005 now clearly share one reusable Dashboard infrastructure while remaining separate product compositions.

