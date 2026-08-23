# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 038 — Analytics Workspace

Design 038 should become the **canonical exploratory analytics workspace for the Team Workspace**.

Its responsibility is to let authorized users investigate performance across Sales, Clients, Projects, Editorial, Magazine, Podcast, Video, Events, Finance, Publishing and Distribution using **one governed metric and analytical data foundation**.

It must not become another Reporting engine, another operational database, or a collection of frontend charts with independently calculated numbers.

| Audit field                     | Classification                                                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**                   | **038**                                                                                                                  |
| **Canonical name**              | **Analytics Workspace**                                                                                                  |
| **Product area**                | Analytics / Business Intelligence / Performance                                                                          |
| **User surface**                | Team Workspace                                                                                                           |
| **Screen class**                | Cross-Domain Exploratory Analytics Workspace                                                                             |
| **Classification**              | **Unique Anchor — Platform Analytics & BI Family**                                                                       |
| **Primary purpose**             | Explore, compare, segment and drill into governed operational and performance metrics across authorized business domains |
| **Primary analytical concepts** | MetricDefinition, MetricObservation/Aggregate, Dimension, AnalyticalQuery, MetricSnapshot                                |
| **Supporting entities**         | Project, Client, Lead, Deal, Invoice, Payment, Publication, DistributionCampaign, Placement, Task, User/Team, Report     |
| **Parent shell**                | `InternalAppShell` — Design 001                                                                                          |
| **Metric dependency**           | Design 033 — Reporting foundation                                                                                        |
| **Authorization dependency**    | Design 037                                                                                                               |
| **Template family**             | `AnalyticsWorkspaceTemplate`                                                                                             |
| **Composition**                 | `CrossDomainAnalyticsComposition`                                                                                        |
| **Auth**                        | Required                                                                                                                 |
| **Permissions**                 | Analytics access + underlying domain/data scopes                                                                         |
| **Implementation priority**     | **Core / Critical**                                                                                                      |
| **Reuse level**                 | **Platform-wide / Maximum**                                                                                              |

The central invariant is:

> **Operational record ≠ Metric definition ≠ Analytical aggregate ≠ Dashboard visualization ≠ Report snapshot.**

---

# 1. Functional responsibility

Design 038 should answer questions such as:

> **“How is the business performing, why did a metric change, which Client/project/channel/team contributed to it, what period am I measuring, can I drill into the underlying records, and how trustworthy/fresh is this number?”**

Canonical flow:

```text
Canonical Operational Domains
        │
        ├── Sales
        ├── Finance
        ├── Projects
        ├── Content Production
        ├── Publishing
        ├── Distribution
        └── Work / People
        ↓
Analytical Data / Query Layer
        ↓
Metric Definitions
        ↓
Dimensions + Filters
        ↓
Aggregations
        ↓
Design 038 Analytics Workspace
        │
        ├── Explore
        ├── Compare
        ├── Segment
        ├── Trend
        └── Drill Down
```

---

# 2. Analytics ≠ Reporting

This is the most important boundary following Design 033.

### Design 038 — Analytics

Interactive, exploratory and generally current:

```text
Change date range
Filter Client
Compare channel
Drill into record
Change grouping
```

### Design 033 — Reporting

Versioned and reproducible:

```text
Fixed reporting period
Frozen metric snapshot
Approved Report Version
Exact Client-delivered artifact
```

Therefore:

> **Analytics is live/exploratory. Reporting is controlled/versioned communication.**

**DO NOT MERGE THE TWO DOMAINS.**

---

# 3. Analytics Workspace ≠ dashboard family

Designs 003–007 are purpose-specific dashboards.

They answer predefined operational questions.

Design 038 is broader:

> **Let me investigate the data.**

Correct architecture:

```text
Canonical Metric Infrastructure
      │
      ├── Executive Dashboard
      ├── Sales Dashboard
      ├── Editorial Dashboard
      ├── Operations Dashboard
      ├── Finance Dashboard
      └── Analytics Workspace
```

One metric foundation.

Different compositions.

---

# 4. Chart ≠ metric

A chart is only a visualization.

Example:

```text
Metric:
Revenue Collected

Visualization:
Line chart
```

or:

```text
Visualization:
KPI card
```

or:

```text
Visualization:
Table
```

The metric definition must remain independent from the chart component.

---

# 5. MetricDefinition must be canonical

Conceptually:

```text
MetricDefinition
├── key
├── display name
├── description
├── unit
├── calculation semantics
├── source domain
├── aggregation rules
├── compatible dimensions
├── freshness policy
└── visibility/security classification
```

Exact persistence belongs to Phase 3D.

This prevents three pages from calculating the same KPI differently.

---

# 6. Metric name ≠ formula

A label such as:

> **Conversion Rate**

is insufficient.

The system needs a canonical definition such as conceptually:

```text
Qualified/converted Leads
÷
eligible Leads
```

for a specified period/cohort.

Without this, Analytics becomes visually polished but statistically unreliable.

---

# 7. One metric definition across platform

If Design 038 shows:

> Collection Rate

and Finance Dashboard Design 007 shows:

> Collection Rate

they must use the same underlying definition unless explicitly named differently.

Likewise for:

* Revenue,
* Pipeline Value,
* Conversion Rate,
* Project Completion,
* Approval Time,
* Publication Performance,
* Distribution Reach,
* Task Completion.

---

# 8. Metric ≠ dimension

Example:

### Metric

```text
Collected Revenue
```

### Dimensions

```text
Client
Month
Sales Owner
Package
Region
```

These must be modeled separately.

---

# 9. Dimension should be governed

Potential dimensions may include:

```text
time
Client
Project
Team
user/owner
product
campaign
channel
content type
status/stage
```

but every metric should declare which dimensions are meaningful.

Do not allow arbitrary nonsensical combinations.

---

# 10. Filter ≠ permission

A user selecting:

> Client = TechNova

is analytical filtering.

It does not grant access to TechNova data.

Authorization must already restrict the candidate dataset.

Correct:

```text
Tenant scope
+
Permission scope
+
Analytics filter
```

in that order.

---

# 11. Analytics permissions must respect source domains

Having:

```text
analytics.read
```

must not automatically grant unrestricted access to:

* Finance,
* employee performance,
* Contracts,
* confidential Clients.

The analytical query layer needs source-domain authorization.

---

# 12. Row-level authorization

Example:

An Account Manager permitted to see only their Clients should receive analytics calculated only over those authorized Clients.

Not:

```text
calculate company-wide total
↓
hide breakdown rows
```

because even aggregate totals can leak information.

---

# 13. Aggregate data can still be sensitive

Example:

> Organization Revenue = $8.2M

may reveal Finance information even without invoice rows.

Therefore aggregated analytics require permission checks too.

---

# 14. Field/metric-level authorization

Certain metrics may require explicit permission:

```text
finance.analytics.read
people.workload.read
sales.analytics.read
```

or equivalent Phase 3D policy.

Design 038 cannot assume every KPI is safe because it is aggregated.

---

# 15. MetricObservation / aggregate concept

The analytical architecture may need records/materialized aggregates conceptually like:

```text
MetricObservation
├── metric
├── timestamp/period
├── dimensions
├── value
├── source/reference
├── freshness
└── provenance
```

Exact physical model depends on scale.

The audit requires analytical truth, not a specific database technology.

---

# 16. Live query vs materialized analytics

Some analytics can query canonical data directly.

Others may benefit from:

```text
Domain events
      ↓
Analytical projection
      ↓
Precomputed aggregates
```

Phase 3D can choose per metric.

Important:

> **Analytical projection ≠ operational source of truth.**

---

# 17. Eventual consistency must be visible

If analytics update every five minutes:

the UI should know/report:

```text
Data updated 2 minutes ago
```

rather than suggesting second-by-second precision.

---

# 18. Freshness is first-class

A metric can be:

```text
Value:
48,756

As of:
10:42 AM
```

This is more trustworthy than displaying an unexplained number.

The existing reusable `DataFreshnessIndicator` from dashboard audits should be used here.

---

# 19. Freshness differs by source

Example:

```text
CRM pipeline      near-real-time
Payment data      webhook/near-real-time
LinkedIn metrics  delayed
PR metrics        manual/daily
```

The Analytics layer must not pretend every source has identical freshness.

---

# 20. Verified ≠ estimated

Designs 032–033 established this invariant.

Analytics must preserve:

```text
VERIFIED
ESTIMATED
MANUAL
UNAVAILABLE
```

or equivalent provenance semantics.

A mixed chart should not visually imply every series has the same evidence quality.

---

# 21. Zero ≠ unavailable

Permanent analytics rule:

```text
0 impressions
```

means verified zero.

```text
impressions unavailable
```

means unknown.

Provider failure must never become zero.

---

# 22. Missing data ≠ poor performance

If Instagram metrics are unavailable:

the platform must not rank Instagram as the lowest-performing channel merely because it lacks values.

Missingness must be handled explicitly.

---

# 23. Time period must be explicit

Every time-dependent metric needs a clearly defined:

```text
periodStart
periodEnd
timezone
```

or equivalent period.

A KPI such as:

> $48,000 Revenue

without a date context is ambiguous.

---

# 24. Calendar period ≠ rolling period

Examples:

```text
August 2026
```

and:

```text
Last 30 days
```

are not the same analytical window.

The date-range system should represent period semantics accurately.

---

# 25. Comparison periods

If Analytics shows:

```text
+18.4%
```

it must define the baseline:

```text
vs previous period
vs same period last year
vs target
vs previous campaign
```

The comparison context must travel with the result.

---

# 26. Percentage denominator must be known

Example:

> Project Completion Rate: 82%

requires clarity about:

```text
82% of what?
```

Eligible Projects? Active Projects? Projects due in selected period?

Metric definition must answer this.

---

# 27. Cohort metrics

Some Sales metrics require cohort semantics.

For example:

> Lead conversion this month

could mean:

* Leads created this month that eventually converted,
* Deals converted this month regardless of Lead creation date.

Those are different metrics.

Design 038 should consume intentionally defined metrics rather than ambiguous labels.

---

# 28. Money analytics

Finance metrics must follow Designs 007/020.

Never sum:

```text
USD + EUR + GBP
```

into one raw total without defined conversion/reporting-currency logic.

---

# 29. Currency conversion needs time/reference context

Where conversion is supported:

```text
original amount
original currency
reporting currency
conversion rate/reference
conversion timestamp/policy
```

must remain reconstructable.

---

# 30. Revenue ≠ invoice amount

Potential metrics remain separate:

```text
Contract Value
Invoiced
Collected
Outstanding
Overdue
```

Analytics cannot label every money value as “Revenue.”

---

# 31. Pipeline metrics

Sales Analytics may consume:

* Lead counts,
* Deals,
* stage values,
* probabilities,
* expected close,
* attribution.

Weighted Pipeline must use the canonical formula established from Design 016.

---

# 32. Stage history matters for trend analytics

If the platform wants:

> Average time in Deal stage

current `deal.stage` is insufficient.

Stage-transition history is required.

Analytics architecture should rely on canonical domain history/events where such metrics are needed.

---

# 33. Project analytics

Potential Project metrics:

```text
Active Projects
On-Time Projects
At-Risk Projects
Average Cycle Time
Blocked Time
Stage Duration
```

must derive from Project/Workflow truth.

Design 038 should not create parallel Project health state.

---

# 34. Editorial analytics

Potential metrics include:

* Draft turnaround,
* Internal review time,
* Client review time,
* Publication readiness rate.

These consume Design 024 data.

Internal and Client waiting time should remain separable.

---

# 35. Production analytics

Magazine/Podcast/Video/Event analytics may use:

```text
production duration
approval wait
asset delays
revision counts
on-time readiness
```

One generic “production score” should not replace these meaningful metrics.

---

# 36. Publishing analytics

Design 031 can supply:

* Ready-to-Publish,
* scheduled,
* failures,
* on-time release,
* execution duration.

Analytics consumes this data.

It does not mutate Publication lifecycle.

---

# 37. Distribution analytics

Design 032 supplies:

* verified placements,
* reach,
* impressions,
* clicks,
* engagement,
* verification.

Design 038 must preserve channel-specific metric semantics.

---

# 38. Cross-channel comparison requires care

Comparing:

```text
Email Open Rate
LinkedIn Engagement Rate
YouTube View Rate
```

as if they were one common metric is misleading.

Any cross-channel comparison must use either:

* a legitimately normalized metric,
* or clearly separated measures.

---

# 39. Top-performing channel requires methodology

Valid:

> Highest verified clicks.

Valid:

> Highest engagement rate.

Potentially misleading:

> Best performing channel.

unless “best” has an explicit canonical scoring methodology.

---

# 40. People/workload analytics are sensitive

Design 036 already established:

> workload ≠ performance.

Design 038 must preserve this distinction.

Task counts, overdue Tasks and Project assignments can help resource planning.

They should not automatically create an employee performance score.

---

# 41. Productivity score is not allowed without methodology

A number such as:

```text
Employee Productivity: 94%
```

requires an independently defensible formula and purpose.

If no canonical methodology exists, it should not become production truth.

---

# 42. Drill-down

A major Design 038 capability should be:

```text
Metric
↓
dimension breakdown
↓
underlying authorized records
```

Example:

```text
Overdue invoices: 12
↓
View 12 invoices
```

when the user has permission.

---

# 43. Drill-down ≠ permission escalation

A KPI card may show:

```text
12 overdue invoices
```

to an authorized aggregate viewer.

Clicking it should only reveal row-level records if the actor also has record-level permission.

---

# 44. Drill-through should preserve filter context

Example:

```text
Analytics:
Client = TechNova
Period = Q2
Metric = Published Videos
```

Drill-down should carry:

```text
Client + period + metric filter
```

into the result set.

---

# 45. Analytical query state

The current workspace state may include:

```text
date range
metrics
dimensions
filters
comparison
grouping
sort
```

This is view/query state.

It should not be stored as operational business data.

---

# 46. Saved analytical views

If supported, reuse Saved View concepts.

Conceptually:

```text
AnalyticsSavedView
├── name
├── metrics
├── dimensions
├── filters
├── comparison
└── visualization configuration
```

A Saved View stores analytical configuration.

It does not store a second copy of business records.

---

# 47. Saved Analytics View ≠ Report

This distinction is important.

### Saved Analytics View

Reusable live query/configuration.

### Report

Frozen, versioned output.

```text
Saved Analytics View
      ↓ optional
Create Report Snapshot
      ↓
Design 033 Report
```

---

# 48. Export ≠ report

Exporting current chart/table data is not automatically a canonical Report.

If the user needs an approved/versioned Client deliverable:

use the Reporting domain.

---

# 49. Analytics snapshot

The system may support creating a snapshot from an analytical state.

That snapshot can feed a Report.

But:

```text
Snapshot
≠
live Analytics query
```

Historical values must remain stable once intentionally captured.

---

# 50. Chart components should be generic

Reusable analytical components include:

`MetricCard`
`MetricTrend`
`ComparisonIndicator`
`ChartCard`
`TimeSeriesChart`
`BreakdownChart`
`DistributionChart`
`FunnelChart`
`CohortTable` where required
`AnalyticsDataTable`
`DimensionSelector`
`MetricSelector`
`DateRangeSelector`
`ComparisonSelector`
`DataFreshnessIndicator`
`MetricProvenanceIndicator`

No separate chart framework per module.

---

# 51. Chart type must fit data semantics

Examples:

* Time series → line/area.
* Category comparison → bar/table.
* Pipeline distribution → funnel/bar.
* Composition → appropriate categorical visualization.

The backend metric does not dictate a decorative chart.

Visualization configuration belongs to the analytical presentation layer.

---

# 52. Pie-chart abuse / decorative visualization

Audit requirement:

Do not choose charts merely for visual variety.

Analytics must prioritize:

* accurate comparisons,
* labels,
* scales,
* readable values.

This is implementation quality, not redesign.

---

# 53. Truncated axes can mislead

Performance comparisons should use sensible axes/scales.

A chart should not exaggerate a 1% change into a dramatic visual difference without clear scale context.

---

# 54. Accessibility

Charts need nonvisual equivalents:

* labels,
* summaries,
* accessible tables where appropriate,
* keyboard/tool-tip access.

Color alone cannot communicate:

* positive/negative,
* channel,
* status.

Design 153 principles apply.

---

# 55. Metric metadata should be inspectable

A useful analytics UX can explain:

```text
Metric:
Client Approval Time

Definition:
time from approval request to final decision

Period:
Aug 1–31

Freshness:
5 minutes ago

Source:
Approval domain
```

This dramatically improves trust.

---

# 56. Metric lineage

For important metrics, the platform should conceptually support:

```text
Metric result
   ↓
MetricDefinition
   ↓
Query/aggregation
   ↓
Canonical source records
```

This enables debugging and reporting reproducibility.

---

# 57. Analytics engine should not write business state

Design 038 is primarily read/exploration.

It should never directly change:

* Deal stage,
* invoice payment state,
* Project status,
* Publication state.

Drill-down can navigate to or invoke canonical domain workflows separately.

---

# 58. Alerts ≠ Analytics

Later alert/rule systems may react to metrics.

Example:

```text
Overdue Amount > $50k
```

But Design 038 itself should not silently become a generic automation engine.

Design 143 later owns Alert Rules Management.

---

# 59. Analytics threshold ≠ persisted business status

Example:

```text
Deal inactivity > 14 days
```

may analytically classify something as:

> Stalled.

But if Deal Health is canonical in Sales, the authoritative classification rule should live centrally.

Do not duplicate health formulas inside Analytics.

---

# 60. Targets / goals

Where Analytics compares actuals to targets:

```text
Actual Revenue
vs
Target Revenue
```

the Target must come from a canonical business target record/configuration.

Avoid hard-coded goal values in dashboard components.

---

# 61. Forecast ≠ actual

Sales forecasts, projected publication numbers or estimated reach must remain clearly marked as forward-looking/estimated.

Do not graph Forecast and Actual identically without labeling.

---

# 62. Forecast version/time context

A forecast can change.

If historical forecast accuracy is analyzed later, the system needs:

```text
forecast as-of date
```

rather than only current forecast.

Exact advanced implementation can wait.

---

# 63. Analytics cache

Aggregates may benefit from caching.

Cache keys must include relevant:

```text
organization
authorization scope
metric
dimensions
filters
period
```

Never cache organization-wide analytics and accidentally serve them to a restricted user.

---

# 64. Authorization-safe caching

This is particularly critical.

Incorrect:

```text
cache["revenue-q3"] = company-wide result
```

Correct cache design incorporates access scope/policy or caches only safe lower-level aggregates and re-applies authorized filtering correctly.

---

# 65. Query cost protection

Analytics queries can become expensive.

The backend should control:

* maximum date range where relevant,
* high-cardinality dimensions,
* query timeouts,
* aggregation limits,
* asynchronous execution for heavy queries.

No arbitrary unbounded analytical SQL from the browser.

---

# 66. Heavy analytics jobs

Large exports or complex historical analysis may use background analytical jobs.

The UI should show:

```text
Query running
```

without freezing the entire application.

---

# 67. Analytics query failure ≠ zero metric

If a calculation fails:

show:

> Metric unavailable.

Do not return:

```text
0
```

because it is easier for chart rendering.

---

# 68. Partial failure

Example:

```text
Sales analytics          ✓
Project analytics        ✓
Finance analytics        ✕
Distribution analytics   ✓
```

Design 038 remains usable.

Only Finance-dependent components show unavailable/restricted state.

---

# 69. Restricted ≠ unavailable

Three separate states:

```text
0
UNAVAILABLE
RESTRICTED
```

must remain distinct.

This is particularly important when users compare teams/Clients.

---

# 70. Stale ≠ unavailable

A provider metric may be:

```text
Last updated:
8 hours ago
```

rather than unavailable.

The UI should communicate staleness rather than discard the value or pretend it is current.

---

# 71. Concurrency

Analytics is primarily read-oriented, so traditional record-edit races are lower risk.

But Saved Views/targets/configuration can still experience concurrent edits.

Use standard revision handling for those records.

---

# 72. Data correction

If canonical operational data is corrected:

live Analytics should reflect the corrected truth when projections refresh.

Historical finalized Reports remain unchanged because Design 033 snapshots them.

This is precisely why Analytics and Reporting are separate.

---

# 73. Backfills

If a new metric or historical correction requires recomputation:

analytical projections may need backfill jobs.

Backfill must not mutate operational records.

---

# 74. Metric schema/version changes

If a formula meaningfully changes:

```text
Conversion Rate v1
→
Conversion Rate v2 methodology
```

historical comparisons can become misleading.

Metric definitions should support controlled versioning/effective dates where necessary.

---

# 75. Never silently redefine a KPI

If “Engagement Rate” formula changes:

old reports and historical periods should not magically reinterpret themselves without a deliberate migration/methodology policy.

---

# 76. Relationship to Design 003–007 dashboards

These dashboards consume the same analytical foundation:

```text
Analytics / Metric Services
       │
       ├── Executive Dashboard
       ├── Sales Dashboard
       ├── Editorial Dashboard
       ├── Operations Dashboard
       └── Finance Dashboard
```

Design 038 provides deeper exploration.

---

# 77. Relationship to Design 033

This relationship is fundamental:

```text
038 Analytics Workspace
      │
      ├── live queries
      ├── exploration
      └── analysis
              ↓
       deliberate snapshot
              ↓
033 Reporting Domain
      ↓
Versioned Report
```

**ONE METRIC FOUNDATION, DIFFERENT OUTPUT SEMANTICS.**

---

# 78. Relationship to Design 135

Frozen roadmap later includes:

**Design 135 — Analytics Executive Dashboard**

This becomes a major overlap checkpoint.

Current rule:

```text
Canonical Analytics Infrastructure
      │
      ├── Design 038
      │   broad Analytics Workspace
      │
      └── Design 135
          Executive analytical composition
```

No separate metric engine.

---

# 79. Relationship to Design 137

Later:

**Design 137 — Team Performance / Workload Analytics**

This should consume:

* Task,
* Project,
* People,
* capacity,
* Analytics infrastructure.

Design 137 must not invent a second workforce analytics datastore.

---

# 80. Relationship to Design 129

Distribution Performance & Verification later should use:

```text
Distribution metrics
+
Placement verification
+
Analytics foundation
```

One metric/provenance system.

---

# 81. Relationship to Client Portal

Clients may receive selected analytics through:

* Reports,
* Client-safe dashboard projections.

They should not receive unrestricted internal Design 038 access.

The Team Analytics workspace may contain:

* margins,
* employee/workload data,
* cross-Client comparisons.

---

# 82. Cross-Client analytics confidentiality

A Client-specific employee or account role should never infer another Client's performance through:

* totals,
* comparisons,
* tooltips,
* export.

Tenant and row-level rules must apply before aggregation.

---

# 83. Permissions architecture

Potential Phase 3D capability dimensions:

```text
analytics.read
analytics.sales.read
analytics.finance.read
analytics.projects.read
analytics.distribution.read
analytics.people.read

analytics.saved_views.manage
analytics.export
```

Exact names later.

The key rule is:

> **General Analytics access does not automatically unlock every analytical domain.**

---

# 84. Export permission

Analytics export may expose far more raw data than the charts.

Therefore:

```text
analytics.read
≠
analytics.export
```

Export should retain the same authorization and filter scope as the on-screen analysis.

---

# 85. Export should preserve context

An exported dataset should ideally record/include:

```text
period
filters
dimensions
metric definitions/units
generatedAt
```

so it is not an unlabeled CSV of numbers.

---

# 86. Responsive — Desktop

Desktop should preserve the richest exploration environment:

```text
Analytics Header
↓
Date Range / Comparison
↓
Metric / Dimension / Filters
↓
KPI Summary
↓
Charts
↓
Breakdowns
↓
Detailed Table
↓
Drill-down / Context
```

This is appropriately desktop-first.

---

# 87. Responsive — Tablet

Following Design 152:

* metric filters become sheets,
* KPI grids reduce columns,
* charts stack,
* detail tables reduce fields,
* drill-down uses drawers,
* tooltips become touch-accessible.

---

# 88. Responsive — Mobile

Following Design 151, prioritize:

```text
Analytics Context
↓
Period / Core Filters
↓
Key KPIs
↓
Trend
↓
Primary Breakdown
↓
Drill-down Cards
↓
Detailed Metrics
```

Complex multi-dimension pivot-style exploration can remain desktop-oriented.

---

# 89. Mobile charts

Mobile charts should:

* avoid unreadable dense legends,
* provide concise summaries,
* allow accessible data inspection,
* use horizontal scrolling only where genuinely necessary.

Do not simply scale desktop charts down.

---

# 90. State coverage

Design 038 inherits Design 150 plus Analytics-specific states:

```text
Analytics Loading
No Data for Period
No Results for Filters

Metric Loading
Metric Available
Metric Estimated
Metric Stale
Metric Unavailable
Metric Restricted

Query Running
Query Failed
Query Timed Out

Partial Data
Provider Metrics Delayed
Comparison Period Missing

Drilldown Empty
Drilldown Restricted

Saved View Loading
Saved View Conflict

Permission Restricted
Analytics Projection Delayed
Partial Service Failure
```

These are not one analytics status enum.

---

# 91. No data ≠ zero

Again:

> No eligible records during selected period.

differs from:

> Metric = 0.

The analytics layer must preserve this distinction throughout chart rendering.

---

# 92. No comparison ≠ 0% change

If previous-period data does not exist:

do not display:

```text
0%
```

change.

Display:

> Comparison unavailable.

---

# 93. Read model / query result

A useful analytical response shape conceptually contains:

```text
AnalyticsQueryResult
├── query context
├── period
├── metrics
├── dimensions
├── series
├── comparisons
├── provenance
├── freshness
├── permission context
└── drilldown references
```

It is a computed read result, not a business entity.

---

# 94. Command boundary

Design 038 should have very few operational mutation commands.

Potential mutations relate mainly to:

```text
saveAnalyticsView()
updateAnalyticsView()
deleteAnalyticsView()
```

and perhaps deliberate snapshot/report creation.

Do not create commands such as:

```text
updateRevenueMetric()
setConversionRate()
```

because metric truth derives from source systems.

---

# 95. Backend architecture

```text
Analytics Workspace UI
        ↓
AnalyticsQueryService
        ↓
Tenant + Authorization Scope
        ↓
Metric / Analytics Layer
        │
        ├── Metric Registry
        ├── Dimension Registry
        ├── Analytical Queries
        ├── Aggregates / Projections
        ├── Metric Provenance
        ├── Freshness
        └── Saved Views
        │
        ├── CRM / Sales
        ├── Finance
        ├── Projects
        ├── Approval
        ├── Publishing
        ├── Distribution
        ├── Task / Work
        └── People
```

Design 033 Reporting consumes snapshots from this governed foundation where appropriate.

---

# 96. Backend requirements

| Requirement                               | Status                           |
| ----------------------------------------- | -------------------------------- |
| Authentication                            | **Required**                     |
| Tenant isolation                          | **Critical**                     |
| Analytics RBAC                            | **Critical**                     |
| Source-domain authorization               | **Critical**                     |
| Aggregate-level security                  | **Critical**                     |
| Canonical Metric Registry                 | **Critical**                     |
| Metric definitions/formulas               | **Critical**                     |
| Dimension definitions                     | **Critical**                     |
| Time-period semantics                     | **Critical**                     |
| Comparison-period semantics               | **Critical**                     |
| Provenance                                | **Critical**                     |
| Verified/estimated/manual distinction     | **Critical**                     |
| Zero/unavailable distinction              | **Critical**                     |
| Data freshness metadata                   | **Critical**                     |
| Analytical query service                  | **Critical**                     |
| Server-side filtering/aggregation         | **Critical**                     |
| Drill-down/query lineage                  | **Required**                     |
| Saved analytical views                    | **Required**                     |
| Permission-safe caching                   | **Critical**                     |
| Materialized projections where needed     | **Required architecture**        |
| Projection/backfill jobs                  | **Required architecture**        |
| Query cost/limit controls                 | **Critical**                     |
| Heavy-query async support                 | **Required**                     |
| Metric versioning/effective-date strategy | **Required**                     |
| Multi-currency safety                     | **Critical for Finance metrics** |
| Reporting snapshot integration            | **Critical**                     |
| Partial-service failure support           | **Critical**                     |
| Accessibility-friendly analytical outputs | **Required**                     |

---

# 97. Canonical metric families

Design 038 should consume one governed catalog across major domains:

### Sales

* Leads
* Qualified Leads
* Conversion Rate
* Pipeline Value
* Weighted Pipeline
* Win Rate

### Finance

* Invoiced
* Collected
* Outstanding
* Overdue
* Collection Rate

### Projects

* Active Projects
* At Risk
* Blocked
* On-Time Completion
* Cycle Time

### Content / Production

* Production Duration
* Review Time
* Approval Time
* Publication Readiness

### Publishing

* Ready
* Scheduled
* Published
* Failed
* On-Time Publication

### Distribution

* Placements
* Verified Placements
* Reach
* Estimated Reach
* Impressions
* Clicks
* Engagement

### Work / People

* Open Tasks
* Overdue Tasks
* Allocation/capacity where legitimately defined.

One metric definition per concept.

---

# 98. Main implementation risks

Design 038 exposes several major risks:

**Frontend-calculated analytics**
Every chart calculates KPIs independently.

**Dashboard/Analytics duplication**
Designs 003–007 and 038 use competing formulas.

**Analytics/Reporting conflation**
Live numbers silently alter historical Client reports.

**Metric/name ambiguity**
“Conversion,” “Revenue,” or “Engagement” have no precise formula.

**Dimension/metric conflation**
Arbitrary grouping creates meaningless analytics.

**Permission/filter conflation**
UI filters used as security boundaries.

**Aggregate data leakage**
Users infer Finance/cross-Client information through totals.

**Zero/unavailable conflation**
Failed providers look like poor performance.

**Verified/estimated conflation**
Estimated reach presented as verified analytics.

**Freshness opacity**
Delayed provider data displayed as current.

**Cross-channel metric abuse**
Unlike metrics ranked as though directly comparable.

**Workload/performance conflation**
Task volume turned into employee performance scoring.

**Currency aggregation error**
Mixed currencies summed directly.

**Cohort/time-window ambiguity**
Metrics change meaning depending on implementation.

**Analytics-writeback**
Dashboard attempts to become source of operational state.

**Permission-unsafe cache**
Broad analytics cached and leaked to restricted users.

**Unbounded query cost**
Complex dimensions create expensive database scans.

**Metric-methodology drift**
Formula changes silently rewrite historical meaning.

**038/135/137 duplicate analytical engines**
Later analytical screens create separate infrastructures.

No additional screen is needed.

These are analytical-governance and backend requirements.

# Design 038 Audit Verdict

## **PASS — PLATFORM ANALYTICS & BUSINESS-INTELLIGENCE ANCHOR**

**Domain directive:** **Operational Record ≠ MetricDefinition ≠ Aggregate ≠ Visualization ≠ Report Snapshot.**

**Metric directive:** one canonical Metric Registry must define formula, unit, compatible dimensions, provenance, security and freshness semantics for every platform KPI.

**Reuse directive:** Executive, Sales, Editorial, Operations, Finance and later analytical dashboards consume this same metric foundation rather than implementing page-specific formulas.

**Reporting directive:** Analytics remains live/exploratory while Design 033 Reporting remains frozen/versioned; deliberate analytical snapshots may feed Reports but the two domains remain distinct.

**Authorization directive:** analytical queries enforce tenant, domain and row-level authorization before aggregation; filters are never the security boundary.

**Aggregate-security directive:** aggregated Finance, employee or cross-Client metrics remain permission-sensitive even when individual rows are hidden.

**Provenance directive:** verified, estimated, manual, stale and unavailable analytical values remain distinguishable.

**Zero directive:** verified zero, no eligible data, unavailable data and permission-restricted data must never collapse to the same value.

**Freshness directive:** every time-sensitive metric can expose its effective data freshness/as-of context.

**Time directive:** periods, rolling windows, cohorts and comparison baselines are explicit parts of metric/query semantics.

**Finance directive:** monetary analytics remain decimal/currency-safe and never silently aggregate incompatible currencies.

**People directive:** operational workload analytics never become employee-performance scoring without a separately defined defensible methodology.

**Drilldown directive:** analytics may drill into canonical authorized source records without duplicating those records or escalating permissions.

**Performance directive:** server-side aggregation, safe caching, analytical projections, query limits and asynchronous heavy-query execution protect production workloads.

**Methodology directive:** material changes to KPI formulas require controlled metric versioning/effective-date semantics rather than silent redefinition.

**Responsive directive:** desktop supports deep multi-dimensional exploration; tablet/mobile prioritize key metrics, trends and drill-down without shrinking complex desktop BI layouts.

**Overlap directive:** Designs **003–007, 033, 038, 129–135 and 137** must ultimately share governed Metric, provenance, freshness, aggregation and analytical-query infrastructure.

**Consolidation directive:** **STANDARDIZE ONE PLATFORM-WIDE METRIC REGISTRY + DIMENSION + ANALYTICAL QUERY + PROVENANCE + FRESHNESS + AGGREGATION INFRASTRUCTURE — DO NOT BUILD SEPARATE ANALYTICS ENGINES FOR SALES, FINANCE, PROJECTS, CONTENT, DISTRIBUTION, REPORTING OR TEAM WORKLOAD.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **38 / 153** |
| **PASS**                                   |                         **38** |
| **STANDARDIZE decisions**                  |                         **36** |
| **Potential implementation-overlap flags** |                         **29** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**38 / 153 = 24.8% audited.**

### Data-to-intelligence architecture after Design 038

```text
OPERATIONAL DOMAINS
      │
      ├── CRM / Sales
      ├── Finance
      ├── Projects
      ├── Production
      ├── Publishing
      ├── Distribution
      ├── Tasks
      └── People
      ↓
CANONICAL ANALYTICS FOUNDATION
Design 038
      │
      ├── Metric Registry
      ├── Dimensions
      ├── Provenance
      ├── Freshness
      ├── Aggregations
      ├── Comparisons
      └── Drilldown
      │
      ├──────────────→ Operational Dashboards 003–007
      │
      └──────────────→ Reporting Snapshot
                             ↓
                       Design 033 Reports
```

The shared platform foundation is now:

```text
029 → Approval
030 → Asset / File
031 → Publishing
032 → Distribution
033 → Reporting
034 → Tasks / Work
035 → Calendar / Scheduling
036 → People / Workforce
037 → Roles / Permissions
038 → Analytics / Metrics
```

# Next Sequential Audit Target

## **Design 039 — Audit Logs**

Its frozen identity is already confirmed, so we proceed directly next with the same audit contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no redesign, no additional screen and no sequence change.**

