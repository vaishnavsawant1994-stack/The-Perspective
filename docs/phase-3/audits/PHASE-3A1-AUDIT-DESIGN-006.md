We continue strictly with Design 006 — Operations Dashboard and preserve the frozen sequence.

Phase 3A.1 — Master 153-Design Inventory Audit
Design 006 — Operations Dashboard
Audit field	Classification
Design ID	006
Canonical name	Operations Dashboard
Product area	Operations / Delivery Management
User surface	Team Workspace
Screen class	Department Dashboard / Operational Overview
Classification	Template Variant — Dashboard Family
Primary purpose	Give Operations leadership a consolidated view of active work, deadlines, blockers, approvals, client dependencies, resource pressure, delivery health and operational exceptions
Primary entities	Project, Task, Milestone, Approval, ClientRequest / Dependency
Supporting entities	Client, User, Team, Deliverable, ChangeRequest, Risk, Blocker, Publication, DistributionCampaign, Invoice, AutomationRun, Alert
Parent shell	InternalAppShell — Design 001
Parent page family	Canonical Dashboard Architecture
Suggested composition	OperationsDashboardComposition
Auth	Required
Permissions	Operations + project/team/department scope
Implementation priority	Core / High
Reuse level	Very High
1. Functional responsibility

Design 006 should answer:

“Is work across the organization being delivered correctly and on time, and where does Operations need to intervene?”

This page is a monitoring and prioritization layer.

It should not become a substitute for:

Project Detail
Task Management
Approval Workspaces
Client Dependency Tracker
Risk / Blocker Management
Publishing Queue
Distribution Operations

Instead, it summarizes those systems and sends users to the canonical record requiring action.

Examples:

12 projects at risk
→ project/risk workspace.

34 overdue tasks
→ filtered task queue.

9 approvals overdue
→ approval queue.

6 client dependencies blocking delivery
→ dependency tracker.

3 publishing failures
→ publishing/distribution operations.

2. Canonical Operations Dashboard regions

The main KPI layer should focus on operational health rather than commercial analytics.

Typical metrics include:

Active Projects
Projects At Risk
Overdue Tasks
Blocked Work
Pending Approvals
Client Dependencies
Deadlines Today
SLA / On-Time Delivery

Secondary operational signals may include:

Team Capacity
Change Requests
Publishing Issues
Distribution Issues
Automation Failures
Overdue Client Responses

The main dashboard composition should then provide:

Project Health Overview
Work Requiring Attention
Deadline & SLA Monitor
Blockers / Risks
Approval Bottlenecks
Client Dependencies
Task Delivery Summary
Team Capacity
Publishing / Distribution Exceptions
Recent Operational Activity

3. Operational health model

Design 006 needs a canonical health language.

A project or work item should not invent arbitrary status colors per widget.

Recommended operational health states are conceptually:

Healthy
Needs Attention
At Risk
Blocked
Overdue
Critical

These are derived operational conditions, not replacements for the actual underlying workflow status.

For example:

Project status: ACTIVE
Operational health: AT_RISK

or:

Approval status: PENDING
Operational condition: OVERDUE

This distinction is important.

4. Reusable component mapping

Design 006 should reuse the canonical Dashboard family components already identified:

PageHeader
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

Operations-specific composites should include:

ProjectHealthWidget
OperationalAttentionQueue
DeadlineMonitorWidget
BlockerSummaryWidget
ApprovalBottleneckWidget
ClientDependencyWidget
TeamCapacityWidget
DeliverySlaWidget
PublishingExceptionWidget
DistributionExceptionWidget

Architecture remains:

shared design primitives
→ shared dashboard infrastructure
→ operations-specific widgets
→ Design 006 composition

No independent Operations dashboard framework should be created.

5. Consolidation classification

Design 006 belongs to the same dashboard family as Designs 003–005.

However:

Design 006 — Operations Dashboard

is an everyday operational overview.

Later:

Design 136 — Operations Command Center

is a deeper live exception-management and intervention surface.

Therefore:

Design 006 and Design 136 must not be merged.

They can share:

operational KPI primitives
risk badges
attention cards
SLA widgets
blocker components
activity feeds
project-health components

But their density, purpose and operating mode differ.

Audit classification

STANDARDIZE — REUSE DASHBOARD FAMILY

Merge screen?

NO

6. Required operational read model

A dedicated aggregate/query model is appropriate:

OperationsDashboardSummary
├── ProjectHealthSummary
├── TaskDeliverySummary
├── DeadlineSummary
├── MilestoneSummary
├── BlockerSummary
├── RiskSummary
├── ApprovalSummary
├── ClientDependencySummary
├── CapacitySummary
├── PublishingExceptionSummary
├── DistributionExceptionSummary
└── OperationalActivitySummary

Important data should include:

active projects
project health
overdue milestones
overdue tasks
blocked tasks
unresolved risks
pending approvals
overdue approvals
client dependencies
change requests
capacity pressure
release/publishing exceptions
failed distribution placements
automation/system issues relevant to delivery
7. Critical distinction: Workflow Status vs Operational Condition

This is one of the most important audit rules for Design 006.

Consider a task:

Workflow Status:
IN_PROGRESS

Operational Condition:
OVERDUE

Or:

Workflow Status:
BLOCKED

Blocker Source:
CLIENT_DEPENDENCY

Or:

Project Status:
ACTIVE

Health:
AT_RISK

The application should not overload one status field to represent all of these concepts.

This becomes important across later designs:

Project Health
Task Status
Risk Severity
Blocker State
Approval State
SLA State

must remain separate dimensions.

8. Deadline and SLA architecture

Operations should distinguish:

Due Soon
Due Today
Overdue
SLA Breached
Forecasted Delay

These should not be treated as synonyms.

For example:

a task can be overdue but not governed by an SLA;
an SLA can be breached even if the project's ultimate delivery date has not yet passed;
a project may be forecasted late while no individual task is technically overdue yet.

Design 006 should display those conditions accurately.

9. Blocker architecture

Operational blockers should carry structured context.

Conceptually:

Blocker
├── source
├── affectedRecord
├── severity
├── owner
├── createdAt
├── dueAt
├── resolutionStatus
└── resolvedAt

Possible blocker sources:

Internal Team
Client
Approval
Asset
Technical
Vendor / Integration
Finance / Payment
Publishing / Platform

This allows the dashboard to answer not only:

“What is blocked?”

but also:

“Why is it blocked, who owns resolution, and what is affected?”

10. Client dependency separation

Design 006 should reuse the canonical Client Dependency concept used later in the Project Client Requests / Dependency Tracker.

Examples include:

questionnaire unanswered
image/assets missing
draft feedback missing
approval pending
payment prerequisite
contract/signature dependency

Operations should be able to see them.

But client-facing screens should only expose the appropriate external side of those records.

Internal escalation notes must remain internal.

11. Permission behavior
Operations Director / Manager

May generally see:

organization or department project health
delivery risks
blockers
approvals
team capacity
dependencies
operational exceptions
Project Manager

May see primarily:

projects they manage
related tasks
milestones
approvals
risks
blockers
client dependencies
Individual contributor

May see:

assigned tasks
personal deadlines
relevant blockers
approvals requiring their action
Executive / Admin

May receive broader visibility.

The effective query scope must be enforced server-side.

A user must not see confidential project/customer information simply because a dashboard widget aggregates it.

12. Quick-action architecture

Appropriate actions could include:

Create Project
Create Task
Assign Owner
Open Blocker
Raise Risk
Request Approval
Request Client Input
Escalate Issue
Open Operations Queue

These should launch or navigate into the canonical workflow.

For example:

Resolve Blocker
→ blocker/project record.

Request Approval
→ canonical Approval workflow.

Reassign Task
→ canonical Task assignment interaction.

No duplicate business logic should live inside dashboard widgets.

13. Project-health derivation

Project health should ideally be calculated consistently using canonical operational signals.

It may consider:

milestone delay
overdue tasks
unresolved critical blockers
approval delay
client dependencies
capacity risk
timeline slippage
critical change requests

But Design 006 should consume the canonical health calculation.

It should not independently calculate its own “health score” in React.

The same project should not be:

Healthy on Design 006
and
At Risk on Project Detail

because two screens used different formulas.

14. Team capacity boundary

Operations may need a capacity snapshot, but Design 006 is not the full workforce analytics system.

It can summarize:

Available
Balanced
Near Capacity
Overallocated

Detailed workforce analytics belong later in:

Design 137 — Team Performance / Workload Analytics

Therefore:

Design 006 surfaces operational staffing risk; Design 137 performs deeper workforce analysis.

No merge.

15. Publishing and distribution boundary

Design 006 may show exceptions such as:

3 publishing jobs failed
6 placements require verification

But it should not become the publishing or distribution execution environment.

Those records should deep-link to:

Publishing Queue / Publication Detail
or
Distribution Campaign / Placement Detail

This maintains clear ownership between operations oversight and production execution.

16. Responsive contract
Desktop

Use a multi-column operational dashboard with:

KPI strip
project-health overview
critical attention queue
deadlines
blockers
approvals
dependencies
capacity
secondary activity
Tablet

Following Design 152:

2-column adaptive layout
critical risks stay near the top
queues become condensed lists
secondary details use drawers/overlays
touch-friendly actions
Mobile

Following Design 151, priority should become:

Critical / Blocked
→ Overdue / SLA issues
→ Approvals
→ Client Dependencies
→ Projects At Risk
→ Today's Work
→ Capacity / Secondary Metrics
→ Activity

Mobile should prioritize intervention, not mirror the desktop dashboard order blindly.

17. State coverage

Design 006 directly reuses Design 150 for:

Initial Loading
Widget Loading
Refreshing
No Active Projects
No Risks / Blockers
No Pending Approvals
No Client Dependencies
Filter Empty State
Permission Restricted
Partial Failure
Stale Operational Data

Example partial degradation:

Project Health         ✓
Deadline Monitor       ✓
Approvals              ✓
Client Dependencies    ✓
Team Capacity          ✕ service unavailable
Publishing Exceptions  ✓

The dashboard should remain usable.

18. Backend requirements

Recommended flow:

OperationsDashboard
        ↓
OperationsDashboardQueryService
        ↓
Effective Permission Scope
        ↓
Projects
Tasks
Milestones
Risks
Blockers
Approvals
Client Dependencies
Capacity
Publishing/Distribution Exceptions

Requirements:

Authentication: Required
Tenant/workspace isolation: Required
RBAC: Required
Project/team scope: Required
Aggregate query layer: Required
Canonical health calculations: Required
SLA/deadline engine: Required
Caching: Recommended
Data freshness metadata: Recommended
Heavy mutation from dashboard: Avoid

19. Relationship to Design 136 — Operations Command Center

This distinction is critical.

Design 006 — Operations Dashboard

Designed for:

routine daily visibility

It answers:

“How is delivery performing?”

Design 136 — Operations Command Center

Designed for:

live intervention and exception handling

It answers:

“What is broken right now, what is critical, and who must act?”

Design 136 is therefore more:

live
alert-heavy
exception-driven
cross-system
intervention-oriented

Design 006 remains calmer and more managerial.

Consolidation outcome

SHARED INFRASTRUCTURE
SHARED COMPONENTS
SEPARATE SCREEN COMPOSITIONS

20. Main implementation risks

The audit flags the following risks:

Status overload
Using one generic “status” for workflow state, health, risk and SLA.

Dashboard-side calculations
Different project-health formulas appearing across screens.

Permission leakage
Operational aggregates exposing restricted clients/projects.

Alert duplication
Operations Dashboard recreating System Alerts rather than consuming them.

Duplicate task actions
Dashboard-specific task mutation logic diverging from the canonical Task service.

False urgency
Treating all delayed records as equally critical.

Over-centralization
Turning Operations Dashboard into a massive control panel instead of a navigation/triage surface.

None require a redesign, but they require architectural controls.

Design 006 Audit Verdict
PASS — DASHBOARD TEMPLATE VARIANT

Implementation directive: Build Design 006 as an Operations-specific composition of the canonical Dashboard framework.

Data directive: Operational status, project health, deadlines, SLA conditions, blockers and risks must come from centralized domain/query services.

Permission directive: All aggregated results must respect organization, department, project and assignment scopes server-side.

Navigation directive: Projects, tasks, blockers, approvals, dependencies, publishing issues and distribution issues should deep-link into their canonical records.

Consolidation directive: STANDARDIZE COMPONENTS — DO NOT MERGE WITH DESIGN 136.

Phase 3A.1 — Running Audit
Result	Count
Audited	6 / 153
PASS	6
STANDARDIZE decisions	4
MERGE screen candidates	0
FIX BEFORE CODE	0
New designs	0

Current canonical family:

001 → InternalAppShell
002 → ClientPortalShell
003 → Executive Dashboard
004 → Sales Dashboard
005 → Editorial Dashboard
006 → Operations Dashboard

Designs 003–006 are now confirmed as separate compositions built on one shared Dashboard architecture.

