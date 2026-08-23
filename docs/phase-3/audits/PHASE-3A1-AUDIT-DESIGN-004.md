The frozen sequence identifies Design 004 exactly as “Sales Dashboard.” We continue the audit without changing its identity, purpose, or order.

Phase 3A.1 — Master 153-Design Inventory Audit
Design 004 — Sales Dashboard
Audit field	Classification
Design ID	004
Canonical name	Sales Dashboard
Product area	Sales / Revenue Operations
User surface	Team Workspace
Screen class	Department Dashboard / Operational Overview
Classification	Template Variant — Dashboard Family
Primary purpose	Give Sales Managers and Sales Executives a real-time view of pipeline, leads, outreach, meetings, proposals, forecasts, targets and sales actions
Primary entities	Lead, Deal, Campaign, Meeting, Proposal
Supporting entities	Company, Contact, Conversation, FollowUp, Task, Contract, Invoice, Payment, User/Owner
Parent shell	InternalAppShell — Design 001
Parent page family	Shared Dashboard Architecture established by Design 003
Suggested composition	SalesDashboardComposition
Auth	Required
Permissions	Sales-scope / ownership / department-aware
Implementation priority	Core / High
Reuse level	High
1. Functional responsibility

Design 004 should answer:

“How is the sales pipeline performing right now, what opportunities need attention, and what should the sales team do next?”

It is not the canonical place for editing every Lead, Deal, Campaign, Meeting or Proposal.

Instead:

Lead metric
→ opens Leads.

Campaign performance
→ opens Outreach.

Hot opportunity
→ opens Deal Detail.

Proposal awaiting action
→ opens Proposal.

Meeting due
→ opens Meeting Detail.

Overdue follow-up
→ opens Follow-up.

So, like Design 003, this is an aggregation + decision + navigation layer.

2. Canonical Sales Dashboard regions

The screen should normalize into reusable dashboard sections:

Sales KPI strip

Typical metrics:

Pipeline Value
Weighted Pipeline
Open Deals
Expected Revenue
Meetings Booked
Proposals Sent
Deals Won
Win Rate

Secondary metrics can include:

New Leads
Qualified Leads
Positive Replies
Average Deal Size
Average Sales Cycle
Target Attainment

Pipeline overview

Summarizes opportunities by stage:

Qualified → Interested → Discovery → Proposal → Negotiation → Contract → Won

But the full canonical pipeline remains the Deals module.

Leads requiring attention

Examples:

new qualified leads
high lead score
outreach ready
no owner
overdue follow-up
recent positive intent
Outreach performance

Should summarize:

enrolled leads
emails sent
delivery
replies
positive replies
meetings
bounces
unsubscribes

But detailed campaign operations remain inside Outreach.

Hot opportunities

A compact prioritized view showing:

Company → Deal → Value → Probability → Stage → Close Date → Next Action

Follow-ups

Should surface:

overdue
due today
upcoming
high-priority
Meetings

Upcoming discovery, negotiation, proposal and client calls.

Forecast / targets

Examples:

Target vs Actual
Commit
Best Case
Pipeline Coverage

Sales activity

Recent:

replies
meetings
stage changes
proposal sends
contract events
deal wins/losses
3. Reusable components extracted

Design 004 should primarily reuse components from Design 003 rather than establish a separate dashboard system.

Canonical shared components include:

PageHeader
DateRangeSelector
KpiCard
KpiTrend
ChartCard
ProgressBar
StatusBadge
EntityMiniList
ActivityFeed
AttentionCard
EmptyWidgetState
WidgetSkeleton
WidgetErrorState

Sales-specific composites can then be created:

PipelineSummaryWidget
SalesForecastWidget
TargetAttainmentWidget
HotOpportunitiesWidget
LeadAttentionWidget
OutreachPerformanceWidget
UpcomingMeetingsWidget
FollowUpQueueWidget

This means:

shared primitives
→ dashboard components
→ sales-specific widgets
→ Design 004 composition

not a completely independent Sales Dashboard component library.

4. Template consolidation decision

Design 004 should not create a new page architecture.

The correct relationship is:

DashboardTemplate
│
├── Design 003 — Executive Dashboard
├── Design 004 — Sales Dashboard
├── Design 005 — Editorial Dashboard
├── Design 006 — Operations Dashboard
├── Design 007 — Finance Dashboard
├── Design 135 — Executive Analytics
├── Design 136 — Operations Command Center
└── Design 137 — Team Performance Analytics

These screens can share layout primitives and dashboard infrastructure while keeping distinct compositions.

Audit classification

STANDARDIZE — REUSE DASHBOARD FAMILY

Screen merge?

NO.

The Sales Dashboard has a distinct user goal and should remain its own routed screen.

5. Required data model

Conceptually, Design 004 consumes an aggregated sales read model such as:

SalesDashboardSummary
├── LeadSummary
├── OutreachSummary
├── ReplySummary
├── MeetingSummary
├── PipelineSummary
├── ProposalSummary
├── ForecastSummary
├── FollowUpSummary
├── TargetSummary
└── SalesActivitySummary
Lead data
new
enriched
qualified
outreach-ready
contacted
engaged
converted
Outreach
campaigns
sent
delivered
replies
positive replies
meetings
bounce rate
unsubscribe rate
Deals
open deal count
pipeline value
weighted value
stage breakdown
expected close
deal health
stalled opportunities
Proposals
created
awaiting approval
sent
viewed
accepted
expired
Meetings/follow-ups
upcoming
overdue
due today
completed
no-show/rescheduled
Forecast
target
actual
commit
best case
remaining gap
6. Permission behavior

Design 004 has an important scope distinction.

Sales Manager

May generally see:

department-wide pipeline
salesperson performance
team targets
team follow-ups
assignment workload
broader forecasts
Sales Executive

Should primarily see:

their assigned leads
their opportunities
their campaigns where authorized
their follow-ups
their meetings
their targets
their forecast
Admin / Executive

May have organization-wide visibility depending on permissions.

The implementation should therefore support:

ORG
DEPT
ASN
OWN
READ
NONE

or the equivalent frozen permission scopes.

Critically:

Sales Dashboard scope must be enforced in the backend/query layer, not by merely filtering already-loaded records in the browser.

7. Sensitive-data boundary

Sales users may need commercial visibility, but not necessarily unrestricted finance data.

For example, they may legitimately see:

Deal value
Proposal value
Contract status
Invoice status

but perhaps not:

payment processor details
profit margins
refund controls
organization-wide financial analytics

Those remain Finance/Admin permission concerns.

8. Quick-action architecture

The dashboard may expose shortcuts such as:

Find Leads
Import Leads
Create Campaign
Add Deal
Schedule Meeting
Create Proposal
Add Task

These should invoke canonical flows, not duplicate them.

For example:

Create Proposal
→ opens canonical proposal creation flow.

It should not embed a second proposal builder inside the Sales Dashboard.

9. Responsive contract
Desktop

Multi-column dashboard with:

KPI strip
pipeline visualization
forecast
lead/deal lists
follow-ups
meetings
activity
Tablet

Following Design 152:

KPI grid becomes 2-column
charts stack/reflow
attention items remain high priority
lists preserve key commercial columns
secondary detail moves into overlays/drawers
Mobile

Following Design 151, prioritize:

Urgent follow-ups
→ Pipeline / revenue headline
→ Hot deals
→ Meetings
→ Lead actions
→ Outreach summary
→ Forecast
→ Activity

Large pipeline visualizations should become mobile-safe cards/stage summaries rather than tiny desktop charts.

10. State coverage

Design 004 must reuse Design 150 for:

Loading
Partial Loading
No Deals Yet
No Leads Assigned
No Campaign Data
No Results for Filters
Permission Restricted
Stale Metrics
Service/API Failure

Dashboard widgets should fail independently where possible.

For example:

Pipeline       ✓
Outreach       ✓
Meetings       ✓
Forecast       ✕ service failure
Follow-ups     ✓

The rest of the Sales Dashboard should remain usable.

11. Backend architecture requirement

Design 004 should use a dedicated sales aggregation/query service rather than repeatedly querying full CRM datasets from the browser.

Recommended conceptual architecture:

SalesDashboard
      ↓
SalesDashboardQueryService
      ↓
Permission Scope
      ↓
Lead / Campaign / Meeting / Deal /
Proposal / FollowUp aggregates

Useful characteristics:

Authentication: required
Tenant scope: required
RBAC: required
Ownership scope: required
Caching: recommended for expensive aggregates
Direct mutation: minimal
Data freshness metadata: required

12. Metric consistency requirement

One major audit concern is avoiding incompatible definitions.

For example:

Pipeline Value

must mean the same thing on:

Sales Dashboard
Deals Pipeline
Executive Dashboard
Analytics
Reports

Likewise:

Win Rate
Expected Revenue
Positive Reply Rate
Qualified Lead

must have canonical backend definitions.

No dashboard should invent its own formula.

13. Relationship with Design 003
Design 003 — Executive/Admin Dashboard

Broad organization-wide overview.

Design 004 — Sales Dashboard

Deep operational focus on revenue-generation activity.

They share:

dashboard grid
KPI components
chart surfaces
activity widgets
attention states
responsive behavior

But they do not share exactly the same queries or permission scopes.

Therefore:

STANDARDIZE COMPONENTS — DO NOT MERGE SCREENS
Design 004 Audit Verdict
PASS — DASHBOARD TEMPLATE VARIANT

Implementation directive:

Implement Design 004 as a Sales-specific composition of the canonical dashboard framework rather than as a standalone dashboard architecture.

Data directive:

Use canonical CRM/Sales aggregate services and permission-scoped queries; do not duplicate sales calculations in frontend widgets.

Navigation directive:

Every summarized record must deep-link to its canonical Lead, Campaign, Meeting, Deal, Proposal, Follow-up, Company or Contact workspace.

Phase 3A.1 — Running Audit
Result	Count
Audited	4 / 153
PASS	4
STANDARDIZE decisions	2
MERGE screen candidates	0
FIX BEFORE CODE	0
New designs	0
Canonical architecture identified so far

001 → InternalAppShell
002 → ClientPortalShell
003 → Executive Dashboard composition
004 → Sales Dashboard composition

Both Designs 003 and 004 now belong to the canonical shared Dashboard family, while remaining separate product screens.

