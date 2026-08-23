# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 135 — Analytics Executive Dashboard

Design 135 should become the **canonical Team Workspace executive analytics, cross-domain KPI aggregation, trend/comparison, data-quality, freshness, and permission-safe decision-support dashboard** built directly on the Analytics foundation established by **Design 038 — Analytics Workspace**.

Design 135 must **not create a second analytics engine, duplicate domain totals, or hard-code executive KPI calculations inside dashboard components**. It should consume one canonical Metric Registry, source-domain metric observations/aggregates, permission-safe analytical read models, and explicit time/comparison contexts.

It must also remain architecturally distinct from:

* Design 003 — Executive / Admin Dashboard;
* Designs 004–007 — functional operational dashboards;
* Design 038 — canonical Analytics Workspace;
* Design 129 — Distribution Performance;
* Designs 131–134 — frozen Reporting;
* Design 136 — Operations Command Center;
* Design 137 — Team Performance / Workload Analytics.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **MetricDefinition ≠ MetricObservation ≠ MetricAggregate ≠ KPIProjection ≠ ExecutiveDashboardView ≠ DashboardWidget ≠ DashboardViewConfiguration ≠ ComparisonPeriod ≠ Target/Goal ≠ ReportMetric ≠ ReportDatasetSnapshot ≠ OperationalAlert ≠ SourceDomainRecord.**

The central implementation rule is:

> **Design 135 displays executive interpretations of canonical analytical data; it does not own the business records or metric formulas beneath them. Every KPI must identify its canonical MetricDefinition, scope, period, aggregation/calculation version, freshness, provenance, data-completeness state, and authorization context. A number that is unavailable, stale, estimated, partial, restricted, or based on incomparable periods must never be rendered as a clean authoritative total. Executive Dashboard values remain live analytical projections and must never rewrite frozen Reports or source-domain state.**

---

# 1. Classification

| Audit field                               | Classification                                                                                                                                                                               |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                             | **135**                                                                                                                                                                                      |
| **Canonical name**                        | **Analytics Executive Dashboard**                                                                                                                                                            |
| **Product area**                          | Team Workspace / Analytics / Executive Intelligence                                                                                                                                          |
| **User surface**                          | **Authenticated Team Workspace**                                                                                                                                                             |
| **Screen class**                          | Executive Analytics Dashboard / Cross-Domain KPI Workspace                                                                                                                                   |
| **Classification**                        | **Canonical Executive KPI, Cross-Domain Metric Aggregation, Trend & Decision-Support Anchor**                                                                                                |
| **Primary purpose**                       | Present authorized high-level business KPIs, trend/comparison context, cross-domain performance summaries, data freshness/quality, and safe drilldowns using canonical analytics definitions |
| **Canonical Analytics foundation**        | **Design 038 — Analytics Workspace**                                                                                                                                                         |
| **Executive dashboard family reuse**      | Design 003                                                                                                                                                                                   |
| **Sales analytics inputs**                | Designs 004 / 011 / 016 / 090 etc.                                                                                                                                                           |
| **Editorial analytics inputs**            | Designs 005 / 023–029                                                                                                                                                                        |
| **Operations analytics inputs**           | Designs 006 / 034 / 112–123                                                                                                                                                                  |
| **Finance analytics inputs**              | Designs 007 / 020 / 101–103                                                                                                                                                                  |
| **Distribution analytics inputs**         | Designs 032 / 129                                                                                                                                                                            |
| **Reporting boundary**                    | Designs 033 / 130–134                                                                                                                                                                        |
| **Team analytics boundary**               | Design 137                                                                                                                                                                                   |
| **Operations command boundary**           | Design 136                                                                                                                                                                                   |
| **Metric authority**                      | `MetricDefinition` / canonical Metric Registry                                                                                                                                               |
| **Observation evidence**                  | `MetricObservation`                                                                                                                                                                          |
| **Aggregate identity/read model**         | `MetricAggregate`                                                                                                                                                                            |
| **Dashboard metric representation**       | `ExecutiveKPIProjection`                                                                                                                                                                     |
| **Dashboard composition**                 | `ExecutiveDashboardView`                                                                                                                                                                     |
| **Widget projection**                     | `DashboardWidgetView`                                                                                                                                                                        |
| **Comparison context**                    | `AnalyticsComparisonContext`                                                                                                                                                                 |
| **Optional user/dashboard configuration** | `DashboardViewConfiguration` if frozen design supports customization                                                                                                                         |
| **Primary query service**                 | `ExecutiveAnalyticsQueryService`                                                                                                                                                             |
| **Metric registry**                       | canonical Design-038 `MetricRegistry`                                                                                                                                                        |
| **Aggregation service**                   | `AnalyticsAggregationService`                                                                                                                                                                |
| **Comparison service**                    | `AnalyticsComparisonService`                                                                                                                                                                 |
| **Freshness resolver**                    | `AnalyticsFreshnessResolver`                                                                                                                                                                 |
| **Data-quality resolver**                 | `AnalyticsDataQualityResolver`                                                                                                                                                               |
| **Drilldown service**                     | `ExecutiveAnalyticsDrilldownService`                                                                                                                                                         |
| **Parent shell**                          | `InternalAppShell` — Design 001                                                                                                                                                              |
| **Auth**                                  | Required                                                                                                                                                                                     |
| **Authorization**                         | Active OrganizationMembership + analytics/domain metric permissions                                                                                                                          |
| **Implementation priority**               | **Critical Executive Decision Integrity / Metric Governance / Permission-Safe Aggregation**                                                                                                  |
| **Reuse level**                           | **Extremely High across dashboards, reporting, Distribution, Team analytics and executive decision surfaces**                                                                                |

Design 135 should answer:

> **“How is the business performing across the executive metrics I am authorized to see, over what exact period, compared with what baseline, how fresh and complete is each figure, which business area is driving the change, and where can I drill into the underlying authorized analytical/source context without changing canonical data?”**

Canonical architecture:

```text
Canonical source domains
        │
        ├── Sales / CRM
        ├── Editorial / Projects
        ├── Finance
        ├── Publishing
        ├── Distribution
        └── Team / Operations
                 │
                 ↓
          Metric Observations
                 │
                 ↓
            Metric Registry
                 │
                 ↓
         Aggregation Services
                 │
        ┌────────┼────────┐
        ↓        ↓        ↓
      KPI      Trends   Comparisons
        │        │        │
        └────────┼────────┘
                 ↓
       ExecutiveDashboardView
                 │
                 ↓
            Design 135
```

---

# 2. Reuse

## Design 038 remains the sole Analytics foundation

This is the strongest Design 135 requirement.

Design 135 must not create:

```text
ExecutiveMetric
DashboardMetric
ExecutiveAnalyticsValue
KpiDefinition135
```

as competing metric-definition systems.

Correct:

```text
MetricDefinition MD-10
      │
      ├── Design 038 Analytics Workspace
      ├── Design 129 Distribution Performance
      ├── Design 135 Executive Analytics
      ├── Design 137 Team Analytics
      └── Reporting metrics where applicable
```

The semantic meaning stays centralized.

---

## Design 003 and Design 135 share dashboard primitives, not data logic

### Design 003

Broad Executive/Admin landing dashboard.

### Design 135

Dedicated analytical executive workspace.

They may share:

* KPI cards;
* trend cards;
* chart shells;
* filter primitives;
* data-quality indicators.

They must not duplicate metric calculations.

---

## ExecutiveDashboardView ≠ MetricAggregate

Permanent.

`ExecutiveDashboardView` composes many authorized analytical results.

It is not a canonical metric store.

---

## KPI card ≠ MetricDefinition

Critical.

A KPI card might show:

> Revenue — $182,000

The card is presentation.

The definition of:

* Revenue;
* eligible transactions;
* currency;
* period;
* aggregation;

belongs to canonical Analytics/Finance semantics.

---

## KPI projection ≠ source-domain value

Permanent.

Example:

```text
Executive KPI:
Active Projects = 42
```

is a derived authorized projection over canonical Project data.

It does not create:

```text
organization.activeProjects = 42
```

as new business truth.

---

## MetricObservation ≠ MetricAggregate

Permanent.

Raw observations/evidence remain distinct from derived executive totals.

---

## MetricAggregate ≠ Executive KPI

A MetricAggregate can be reused across multiple surfaces.

The Executive KPI may add:

* formatting;
* comparison;
* freshness;
* data-quality;
* scope label.

---

## MetricDefinition ≠ dashboard label

Absolute.

Changing:

> Total Revenue

to:

> Revenue

does not create a new metric identity.

---

## Design 129 remains Distribution performance authority

Design 135 may display:

> Distribution impressions
> Verified placements
> Distribution reach

only through canonical Design-129/038 analytical summaries.

It must not independently poll providers or recalculate distribution metrics.

---

## Design 137 remains Team Performance / Workload Analytics authority

Design 135 may consume high-level workforce metrics.

Design 137 owns detailed:

* utilization;
* allocation;
* workload;
* team-level analysis.

Do not rebuild those calculations in Design 135.

---

## Design 136 remains Operations Command Center

Critical distinction:

### Design 135

> What do the executive trends and KPIs say?

### Design 136

> What currently requires operational attention/action?

Analytics ≠ command operations.

---

## Analytics ≠ Reports

Permanent.

Design 135 is current analytical projection.

Design 130/132 reports may be frozen.

Correct:

```text
Executive Dashboard today:
Revenue = 182,000

Released Q2 Report:
Revenue = 174,000
frozen at quarter close
```

Both can be valid.

---

## Dashboard time filter ≠ Reporting period mutation

Changing:

> Last 30 days → Last quarter

changes analytical query context.

It does not rewrite a finalized report.

---

## Comparison period ≠ primary period

Critical.

Example:

```text
Primary:
Aug 1–31

Comparison:
Jul 1–31
```

They must remain separately represented.

---

## Comparison value ≠ target

Permanent.

> +12% vs prior month

is not:

> 12% above goal.

---

## Target/Goal ≠ MetricDefinition

If frozen Design 135 shows goals/targets:

target values are separate planning/governance data.

They do not alter measured metric truth.

---

## Dashboard widget ≠ canonical metric state

Permanent.

Removing/hiding a widget does not delete its metric.

---

## Dashboard configuration ≠ Organization Settings

If personalization exists:

* widget layout;
* hidden cards;
* selected defaults;

belong to dashboard/user view configuration.

They do not rewrite global analytics definitions.

---

## Dashboard configuration ≠ permissions

Absolute.

Hiding a widget is not authorization.

Showing one does not grant its data permission.

---

## Search/index ≠ analytics source

Design 079 may help navigation.

Search index counts do not become executive metrics unless explicitly sourced/defined.

---

# 3. Entities

## MetricDefinition

Canonical Design-038 identity.

Conceptually:

```text
MetricDefinition
├── id
├── stableKey
├── semanticName
├── owningDomain
├── unit
├── aggregationBehavior
├── calculationVersion
├── compatibleDimensions
├── defaultFreshnessPolicy
├── provenancePolicy
├── accessPolicy
└── lifecycle
```

---

## MetricDefinition versioning

If a metric's semantic formula materially changes:

historical analytics comparisons/reports must know which version was used.

Do not silently redefine a KPI.

---

## MetricObservation

Canonical measurement/source evidence.

Examples:

* payment event-derived values;
* project counts;
* Distribution provider measurements;
* task/workload observations.

---

## MetricAggregate

Derived analytical value.

Conceptually:

```text
MetricAggregate
├── metricDefinitionId
├── scope
├── periodStart
├── periodEnd
├── dimensions
├── value?
├── availability
├── provenance
├── completeness
├── calculatedAt
├── dataThrough
├── calculationVersion
└── sourceRevisionSet
```

---

## `calculatedAt` ≠ `dataThrough`

Important.

Example:

```text
calculatedAt:
10:15

dataThrough:
09:45
```

A dashboard refreshed at 10:15 is not necessarily using data through 10:15.

---

## KPIProjection

Read-model concept.

Conceptually:

```text
ExecutiveKPIProjection
├── metricDefinitionId
├── displayValue
├── unit
├── primaryPeriod
├── comparisonPeriod?
├── comparisonValue?
├── comparisonDirection?
├── availability
├── freshness
├── completeness
├── provenance
└── drilldownCapability
```

Rebuildable only.

---

## KPIProjection ≠ persisted source truth

Permanent.

---

## ExecutiveDashboardView

Read composition.

Conceptually:

```text
ExecutiveDashboardView
├── queryContext
├── KPI projections
├── trend series
├── breakdowns
├── data-quality summary
├── drilldown capabilities
└── dependency freshness
```

---

## AnalyticsQueryContext

Strongly useful.

Conceptually:

```text
AnalyticsQueryContext
├── organizationId
├── primaryPeriod
├── timezone
├── comparisonMode
├── comparisonPeriod?
├── permitted dimensions
├── filters
└── queryAsOf
```

---

## Primary period should be explicit

Never persist:

> this month

as final query truth.

Resolve it to exact boundaries at query time.

---

## Timezone

Analytics period boundaries can change based on timezone.

Example:

> August revenue Europe/Berlin

may differ from:

> August revenue UTC

around boundaries.

Use explicit timezone semantics.

---

## ComparisonContext

Conceptually:

```text
AnalyticsComparisonContext
├── comparisonType
├── primaryPeriod
├── comparisonPeriod
├── normalizationPolicy?
└── comparability
```

---

## Comparison type

Possible concepts:

```text
PREVIOUS_PERIOD
PREVIOUS_YEAR
CUSTOM_PERIOD
```

only where frozen design supports them.

Do not invent forecasting.

---

## Comparison periods need comparable semantics

Critical.

Comparing:

> 31-day month

to:

> incomplete 12-day current month

requires either:

* explicit partial-period comparison;
* normalized comparison policy;
* visible qualification.

Do not show misleading `+80%`.

---

## Current incomplete period

If today is Aug 15 and dashboard says:

> This month

the period is not complete.

That needs explicit semantics where material.

---

## DataCompleteness

Derived analytical metadata.

Conceptually:

```text
COMPLETE
PARTIAL
UNKNOWN
```

not a business KPI itself.

---

## MetricAvailability

Canonical distinction:

```text
AVAILABLE
PARTIAL
UNAVAILABLE
```

and, where applicable:

* estimated;
* manual;
* stale.

---

## Freshness

Can be derived from:

```text
dataThrough
+
metric freshness policy
+
current time
```

---

## Freshness ≠ completeness

Critical.

A metric can be:

```text
Fresh + Partial
```

because some sources are unavailable.

Or:

```text
Complete + Stale
```

because full data exists but has not refreshed recently.

---

## Provenance

Executive KPIs should preserve provenance quality where material:

```text
VERIFIED
PROVIDER_REPORTED
DERIVED
ESTIMATED
MANUAL
MIXED
```

Exact taxonomy remains Design-038 governance.

---

## Mixed provenance

Cross-domain aggregates may combine evidence types.

Do not label the total as fully verified if some required components are estimates unless policy explicitly supports it.

---

## DashboardWidgetView

Presentation projection.

Conceptually:

```text
DashboardWidgetView
├── widgetKey
├── visualizationType
├── metricRefs
├── queryContext
├── layout
└── state
```

No independent business truth.

---

## DashboardViewConfiguration

If frozen Design 135 supports customization:

```text
DashboardViewConfiguration
├── user/membership scope
├── widget visibility
├── ordering
├── default period
└── revision
```

This stays separate from:

* Metric Registry;
* role permissions;
* organization-wide metric definitions.

---

## DrilldownResult

Read projection.

Conceptually:

```text
ExecutiveAnalyticsDrilldownResult
├── metricDefinition
├── scope
├── period
├── dimension
├── rows
├── totals
├── freshness
├── completeness
└── source refs
```

---

## Drilldown row ≠ source record

Where the row maps to:

* Client;
* Project;
* Deal;
* Invoice;
* Placement;

use typed source reference and reauthorize on open.

---

# 4. Permissions

Design 135 should conceptually distinguish:

```text
analyticsExecutive.read

analyticsMetric.read
analyticsMetric.readSensitive

analyticsDimension.read
analyticsDrilldown.read

analyticsDashboard.configure

analyticsExport.read
```

Exact keys belong to Phase 3D.

---

## Executive Dashboard access ≠ access to every KPI

Critical.

Individual metric/source restrictions must still apply.

---

## Permission before aggregation

Absolute.

The system must not:

```text
aggregate all tenant data
↓
remove restricted rows afterward
```

because aggregate totals can leak hidden data.

Authorization participates before aggregation.

---

## KPI count permission-safe

Example:

If the user cannot access confidential Finance data:

do not return:

> Revenue: Restricted but total = $4.8M

unless policy explicitly permits aggregate-only exposure.

---

## Aggregate-only permission can be legitimate

If the organization intentionally grants:

> executive total access without row-level transaction access,

that needs explicit analytical access policy.

Do not infer it from title.

---

## Job title ≠ executive analytics authority

Absolute.

"CEO", "Director", "Manager" labels do not automatically grant permissions.

Design 037 remains authority.

---

## Dashboard configuration ≠ metric permission

Permanent.

---

## Drilldown permission ≠ KPI permission

Critical.

A user may be allowed:

> Total Revenue

but not:

> individual Invoice rows.

---

## Source deep link reauthorizes

Absolute.

---

## Analytics read ≠ Report export

Permanent.

---

## Dashboard view ≠ raw data export

Permanent.

---

## Sensitive metric export should require separate permission

Where frozen export exists.

---

## Team metrics may require stronger access

Design 137 may contain workforce-sensitive dimensions.

Design 135 cannot expose individual employee performance just because it can show total utilization.

---

## Finance metrics may require separate access

Same principle.

---

## Client-specific breakdowns reauthorize Client scope

Permanent.

---

## Direct MetricDefinition/dimension IDs validate

Do not trust client-supplied metric/dimension keys blindly.

---

## Cross-tenant aggregation prohibited

Absolute.

---

## Filtered dashboard cannot broaden authorization

Client-side filters only narrow authorized data.

---

# 5. States

Design 135 must keep **metric availability, freshness, completeness, provenance, comparison validity, dependency health, and dashboard rendering state** separate.

### Metric availability

```text
Available
Partial
Unavailable
```

### Freshness

```text
Fresh
Aging
Stale
Unknown
```

### Completeness

```text
Complete
Partial
Unknown
```

### Provenance

```text
Verified
Provider Reported
Derived
Estimated
Manual
Mixed
Unknown
```

### Comparison

```text
Comparable
Partially Comparable
Not Comparable
Comparison Unavailable
```

### Dashboard data state

```text
Available
Partial
Restricted
Unavailable
```

These must never collapse into one generic KPI color.

---

## Metric zero ≠ unavailable

Absolute.

---

## Negative value ≠ bad universally

Critical.

Example:

> Expenses decreased by -12%

may be favorable.

Directional interpretation belongs to metric semantics.

Do not hard-code green = positive number.

---

## Positive number ≠ good universally

Permanent.

Example:

> overdue invoices +20%

is negative business movement.

---

## Comparison delta ≠ KPI value

Permanent.

---

## Stale ≠ unavailable

Permanent.

---

## Partial ≠ zero

Absolute.

---

## Fresh ≠ complete

Permanent.

---

## Complete ≠ verified provenance

Permanent.

---

## Estimated ≠ unavailable

Permanent.

Estimated can be a valid value with lower confidence/provenance.

---

## Restricted ≠ zero

Absolute.

---

## Current-period incomplete ≠ bad performance

Critical.

---

## Comparison unavailable ≠ no change

Absolute.

---

## Source dependency unavailable ≠ KPI zero

Absolute.

---

## One domain unavailable ≠ entire dashboard unavailable

Permanent.

Dashboard must degrade section-by-section.

---

## State Coverage

Design 135 inherits Design 150 plus:

```text
Executive Analytics Loading
Executive Analytics Available
Executive Analytics Empty
Executive Analytics Restricted
Executive Analytics Partial
Executive Analytics Unavailable

Metric Available
Metric Zero
Metric Partial
Metric Unavailable
Metric Restricted

Metric Fresh
Metric Aging
Metric Stale
Metric Freshness Unknown

Data Complete
Data Partial
Data Completeness Unknown

Metric Verified
Metric Provider Reported
Metric Derived
Metric Estimated
Metric Manual
Metric Mixed Provenance
Metric Provenance Unknown

Comparison Available
Comparison Partial
Comparison Not Comparable
Comparison Unavailable

Current Period Complete
Current Period Incomplete
Current Period State Unknown

Trend Available
Trend Partial
Trend Unavailable

Drilldown Available
Drilldown Empty
Drilldown Partial
Drilldown Restricted
Drilldown Unavailable

Source Updated Elsewhere
Metric Definition Updated
Aggregate Recalculated
Dashboard Projection Stale
Dashboard Configuration Updated Elsewhere
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize the hierarchy:

```text
Analytics Executive Dashboard
↓
Exact period / timezone / comparison
↓
Executive KPI summary
↓
Cross-domain trend analysis
↓
Functional breakdowns
↓
Freshness / completeness / provenance
↓
Authorized drilldowns
```

Only frozen Design 135 sections/widgets should be implemented.

---

## Query context must remain visible

The user should always understand:

> Last 30 days
> compared with previous 30 days
> Europe/Berlin timezone

or equivalent frozen controls.

---

## KPI cards need more than a number

Where space permits, each KPI should expose enough context to understand:

* metric;
* value;
* period;
* comparison;
* freshness/data quality.

---

## Data quality should not be hidden only in tooltips

If a KPI is partial/stale/estimated, this is decision-relevant and should remain visibly communicated.

---

## Trend direction must follow metric semantics

Correct:

> Overdue invoices ↓ 15% — positive outcome

if the canonical metric semantics define lower-is-better.

Do not use generic arrow-color rules.

---

## Cross-domain visual consistency

Finance, Sales, Editorial, Distribution, and Team KPIs should share consistent:

* units;
* date semantics;
* availability language;
* comparison semantics.

---

## Charts must make partial data obvious

Do not draw an uninterrupted clean line across missing periods unless interpolation is explicitly supported and labeled.

---

## Comparison should state what it compares against

Avoid:

> +12%

without:

> vs previous period.

---

## Drilldown preserves current analytical context

Example:

```text
Revenue
↓
by Client
↓
by Invoice
```

should preserve:

* period;
* applied filters;
* metric definition.

---

## Tablet

Following Design 152:

* period/comparison controls remain near top;
* KPI cards adapt into fewer columns;
* major charts stack;
* secondary cross-domain breakdowns collapse;
* freshness/partial indicators remain visible.

---

## Mobile

Priority:

```text
Dashboard period
↓
Executive KPI cards
↓
Attention-worthy stale/partial data
↓
Top trends
↓
Domain summaries
↓
Drilldown
```

Avoid shrinking a desktop multi-column executive grid.

---

## Mobile KPI example

> Revenue
> $182K
> +8.4% vs previous period
> Fresh · Complete

or:

> Distribution reach
> 82K
> Partial · one provider unavailable

---

## Mobile charts

Use:

* tap-friendly inspection;
* readable legends;
* summary/table alternatives;
* no hover-only interaction.

---

## Accessibility

A KPI could communicate:

> Revenue for August 1 through August 31 is 182 thousand dollars, up 8.4 percent compared with July 1 through July 31. The metric is calculated from complete Finance data through August 31 at 11:59 PM Europe/Berlin.

or:

> Distribution impressions are 82 thousand for the selected period. Data is partial because one provider source is currently unavailable; the value should not be interpreted as complete campaign performance.

where canonical authorized data supports it.

---

# 7. Backend Requirements

## Canonical Executive Analytics architecture

```text
Design 135
    ↓
Authenticated Workspace Context
    ↓
ExecutiveAnalyticsQueryService
    │
    ├── MetricRegistry
    ├── AnalyticsAggregationService
    ├── ComparisonService
    ├── FreshnessResolver
    ├── DataQualityResolver
    ├── Domain Analytics Adapters
    └── Permission Scope Resolver
    ↓
ExecutiveDashboardView
```

---

## Query contract

Conceptually:

```text
getExecutiveAnalytics(
    primaryPeriod,
    comparisonMode?,
    timezone,
    filters,
    currentMembership
)
```

should:

1. authenticate;
2. resolve tenant;
3. validate period/timezone;
4. resolve comparison period;
5. resolve authorized metric set;
6. apply permission scope before aggregation;
7. query canonical aggregates/read models;
8. calculate comparison safely;
9. resolve freshness/completeness/provenance;
10. return drilldown capabilities;
11. return query-as-of/data-through metadata.

---

## Bounded periods

Dashboard queries must be bounded.

Do not let an unrestricted client request:

> every metric for all time at all dimensions.

---

## Default period

If the frozen dashboard has a default:

resolve relative values server-side/query context into exact timestamps.

Do not persist:

```text
period = "today"
```

as historical analytical identity.

---

## Timezone-safe period resolver

Centralize:

```text
AnalyticsPeriodResolver
```

for:

* today;
* this week;
* month-to-date;
* previous month;
* quarter;

where frozen UI supports these.

---

## Relative period ≠ fixed duration

Critical.

"Previous calendar month" is not always 30 days.

---

## Comparison Resolver

Conceptually:

```text
AnalyticsComparisonService.compare(
    metricDefinition,
    primaryAggregate,
    comparisonAggregate,
    comparisonPolicy
)
```

must respect:

* metric semantics;
* completeness;
* period comparability;
* availability;
* lower/higher-is-better interpretation where defined.

---

## Percentage-change divide-by-zero

Critical.

If prior period value = 0:

do not produce:

```text
+Infinity%
```

The metric comparison policy should return:

* not applicable;
* new activity;
* unavailable comparison;

according to semantics.

---

## Negative-value comparison

Do not assume normal percentage-change formula is meaningful for every signed metric.

Metric-specific comparison policy may be needed.

---

## Partial periods

If comparing month-to-date:

prefer comparable:

> Aug 1–15 vs Jul 1–15

where metric policy/frozen UX specifies such comparison.

Do not silently compare 15 days vs full prior month and present it as equivalent.

---

## Metric Registry

All KPI cards must reference canonical:

```text
metricDefinitionId
```

Never hard-code formulas inside React components/API route handlers.

---

## Domain analytical adapters

Conceptually:

```text
SalesAnalyticsAdapter
FinanceAnalyticsAdapter
ProjectAnalyticsAdapter
DistributionAnalyticsAdapter
TeamAnalyticsAdapter
```

These expose standardized analytical contracts over canonical source domains.

Do not let Design 135 query arbitrary raw tables directly.

---

## Source domain remains authoritative

Example:

Revenue should derive from Finance's canonical settlement/payment/reconciliation policy—not:

```text
SUM(invoice.amount)
```

unless the MetricDefinition explicitly defines billed revenue.

---

## Example finance distinction

Keep separate metrics such as:

```text
Invoiced Revenue
Collected Cash
Recognized Revenue
Outstanding Receivables
```

where supported.

Do not collapse them into one vague `Revenue` number.

---

## Example sales distinction

Keep separate:

```text
Pipeline Value
Weighted Forecast
Won Revenue
Active Deals
```

where existing metric definitions support them.

Do not equate pipeline with revenue.

---

## Example project distinction

Keep separate:

```text
Active Projects
On-Time Milestones
Blocked Projects
Project Progress
```

and preserve exact resolvers established in Projects domain.

---

## Example Distribution distinction

Reuse Design 129:

* verified Placements;
* performance observations;
* zero/unavailable;
* provenance.

---

## Example workforce distinction

Reuse Design 112/137:

```text
Capacity
Allocation
Utilization
Workload
Availability
```

remain distinct.

---

## No giant analytics SQL endpoint

Avoid:

```text
/api/analytics?metric=x&table=y&formula=z
```

allowing arbitrary query composition.

Use Metric Registry + typed query contract.

---

## Permission scope resolver

Critical.

Conceptually:

```text
AnalyticsAuthorizationScopeResolver
```

determines:

* allowed metrics;
* allowed dimensions;
* row/domain scope;
* aggregate-only privileges.

---

## Authorization before aggregation

Absolute.

---

## Cache keys must include authorization scope

Never serve executive totals cached for one broader role to another narrower role.

---

## Metric observation ingestion

Design 135 does not ingest raw metrics itself.

It consumes canonical analytics services.

---

## Aggregate precomputation

For expensive cross-domain KPIs:

use:

* incremental aggregates;
* materialized views/read models;
* background calculations;

where appropriate.

These remain rebuildable.

---

## Aggregate ≠ source truth

Permanent.

---

## Aggregate recalculation

Must be idempotent and version-aware.

---

## Data-quality resolver

Conceptually:

```text
AnalyticsDataQualityResolver.resolve(
    metricDefinition,
    sourceStates,
    expectedSources,
    aggregate
)
```

can return:

```text
COMPLETE
PARTIAL
UNKNOWN
```

with structured reasons.

---

## Do not infer completeness from non-null value

Critical.

A number can exist while one expected source is missing.

---

## Freshness Resolver

Conceptually:

```text
AnalyticsFreshnessResolver.resolve(
    metricDefinition,
    dataThrough,
    sourceRefreshPolicies
)
```

---

## Freshness should be metric/source-aware

Finance ledger data and social-provider analytics may have different expected refresh windows.

---

## Mixed-source freshness

For cross-domain KPI:

return the weakest/material freshness or structured source breakdown according to policy.

Do not label aggregate fresh because one component updated recently.

---

## Provenance Resolver

Cross-domain KPI must indicate if inputs include:

* estimated;
* manual;
* provider-reported.

Do not upgrade mixed data to verified automatically.

---

## Trend series

Time-series queries should preserve:

* bucket timezone;
* missing bucket state;
* partial data;
* metric version.

---

## Missing point ≠ zero

Absolute.

---

## Interpolation

Do not interpolate missing data unless metric semantics explicitly allow it and the UI clearly marks it.

---

## Drilldown

Conceptually:

```text
drillDownExecutiveMetric(
    metricDefinitionId,
    primaryPeriod,
    filters,
    dimension,
    currentMembership
)
```

must:

1. authorize metric;
2. authorize dimension;
3. preserve period;
4. apply tenant/resource scope before aggregation;
5. return permission-safe grouped results;
6. provide canonical source references only when authorized.

---

## Drilldown dimension allowlist

Examples:

* Client;
* Project;
* Campaign;
* Channel;
* time bucket;

only where the metric supports them.

No arbitrary database columns.

---

## Drilldown aggregation consistency

The sum of child rows should reconcile with parent only where metric semantics are additive.

Do not force reconciliation for:

* unique counts;
* ratios;
* medians;
* deduplicated reach.

---

## Export

If frozen Design 135 includes export:

export exact:

* query context;
* metric definitions;
* period;
* comparison;
* freshness/completeness;
* authorized rows.

An executive export is not automatically a canonical ReportVersion.

---

## Dashboard export ≠ Report

Critical.

Formal reporting remains Designs 131–134.

---

## Dashboard configuration

If frozen design supports personal widget arrangement:

save configuration separately.

Never let personal layout changes affect other users or Metric Registry.

---

## Shared executive dashboard configuration

If organization-level presets exist, they require explicit governed configuration—not reuse user preferences as organizational truth.

Do not invent this if absent.

---

## Design 003 integration

Design 003 can consume selected executive KPI projections from the same service.

No duplicate formulas.

---

## Design 136 integration

Design 136 can consume operational condition/readiness summaries but should not reuse Design 135 as an action queue.

Analytics informs operations; it does not replace source operational state.

---

## Design 137 integration

Design 137 exposes detailed workforce analytics using the same Metric Registry and Resource Capacity foundation.

Design 135 consumes only executive-level workforce summaries.

---

## Reporting integration

Designs 131–134 may use the same canonical MetricDefinitions but freeze their own DatasetSnapshots.

Design 135 never modifies report snapshots.

---

## Notification/alerts

If a KPI crosses an AlertRule later, Design 143 may create alerts/notifications.

The dashboard itself does not become an alert engine.

---

## Audit

Ordinary dashboard viewing/filtering generally is not business Audit.

Material administrative changes to shared analytics definitions/settings—if allowed elsewhere—may be audited.

---

## Observability

Track:

* query latency;
* cache hit rate;
* data-source lag;
* aggregation failures;
* stale aggregate detection.

These are operational metrics and not executive business KPIs unless separately defined.

---

## Idempotency

Aggregation/precomputation jobs must be idempotent.

Read queries naturally repeat.

---

## Concurrency

Metric-definition change during aggregate computation should pin calculation version.

Do not calculate half with v3 and half with v4 semantics.

---

## Data backfill

If historical source data arrives late:

live analytics may recalculate prior periods.

This is acceptable for live Design 135.

It must not silently rewrite frozen ReportSnapshots.

---

## Historical analytical corrections

If a MetricDefinition or observation is corrected:

Design 135 can show corrected live history.

Reports remain immutable unless revised explicitly.

---

## Caching

Executive analytics cache should vary by:

```text
organizationMembershipId
authorizationScopeRevision
primaryPeriod
comparisonPeriod
timezone
filters
metricDefinitionVersionSet
aggregateRevision
sourceFreshnessRevision
dashboardConfigurationRevision
```

---

## Sensitive cache isolation

Critical.

Never cache only by:

```text
organizationId + period
```

if different users see different scopes.

---

## Performance

Use:

* precomputed aggregates for expensive KPIs;
* time-series indexes;
* materialized executive read models;
* batched multi-metric query execution;
* lazy secondary widgets;
* server-side drilldowns;
* bounded date ranges;
* deterministic cache keys.

Avoid N independent expensive source queries for N KPI cards.

---

## Batch KPI query

Prefer:

```text
ExecutiveAnalyticsQueryService
→ resolves all requested metrics in one governed query plan
```

rather than each React card calling its own endpoint.

---

## Partial failure contract

Example:

```text
Sales analytics          ✓
Finance analytics        ✓
Distribution analytics   ✕
Team analytics           ✓
```

Correct:

> Executive dashboard is partially available; Distribution analytics are currently unavailable.

Incorrect:

> Distribution = 0.

Another:

```text
Revenue value      182K
dataThrough        yesterday
freshness policy   hourly
```

Correct:

> Revenue value available but stale.

Not:

> Revenue unavailable.

Another:

```text
Current period data      complete
Comparison period data   partial
```

Correct:

> Current KPI is complete; comparison is partial and should be qualified.

Not:

> +12.4% authoritative.

---

## Backend Requirement Matrix

| Requirement                                 | Status                    |
| ------------------------------------------- | ------------------------- |
| Design 038 canonical Analytics reuse        | **Critical**              |
| Design 003 dashboard primitive reuse        | **Critical architecture** |
| No second KPI/Metric Definition engine      | **Critical**              |
| MetricDefinition/KPI projection separation  | **Critical**              |
| MetricObservation/Aggregate separation      | **Critical**              |
| MetricAggregate/DashboardView separation    | **Critical**              |
| DashboardWidget/Metric truth separation     | **Critical**              |
| Live analytics/frozen Report separation     | **Critical**              |
| Primary period/comparison period separation | **Critical**              |
| Comparison/Target separation                | **Critical**              |
| Exact timezone/period semantics             | **Critical**              |
| Calendar-relative period correctness        | **Critical**              |
| Current partial-period handling             | **Critical**              |
| Metric-definition versioning                | **Critical**              |
| Server-authoritative aggregation            | **Critical**              |
| Domain analytical adapters                  | **Critical**              |
| No arbitrary analytics SQL endpoint         | **Critical**              |
| Permission before aggregation               | **Critical**              |
| Aggregate-only vs drilldown permissions     | **Critical**              |
| Cross-tenant aggregation prohibited         | **Critical**              |
| Permission-safe counts/facets/drilldowns    | **Critical**              |
| Zero/unavailable separation                 | **Critical**              |
| Freshness/completeness separation           | **Critical**              |
| Provenance preservation                     | **Critical**              |
| Partial-data preservation                   | **Critical**              |
| Comparison comparability checks             | **Critical**              |
| Divide-by-zero comparison handling          | **Critical**              |
| Metric directional semantics                | **Critical**              |
| Missing time-series point/zero separation   | **Critical**              |
| Non-additive drilldown safety               | **Critical**              |
| Design 129 Distribution metric reuse        | **Critical architecture** |
| Design 137 workforce metric reuse           | **Critical architecture** |
| Designs 131–134 reporting boundary          | **Critical**              |
| Design 136 Operations separation            | **Critical architecture** |
| Revision-aware aggregate calculation        | **Critical**              |
| Idempotent aggregate jobs                   | **Critical**              |
| Authorization-aware caching                 | **Critical**              |
| Batched KPI querying                        | **Critical performance**  |
| Audit/observability separation              | **Required**              |
| Partial dependency failure handling         | **Critical**              |

---

# 8. Consolidation

Design 135 has major overlap with almost every business domain, so its implementation risk is becoming a giant hand-written dashboard of duplicated formulas.

**Design 038 / Design 135 analytics duplication**
Executive Dashboard creates its own metric engine.

**Design 003 / Design 135 dashboard duplication**
UI and KPI query logic diverge.

**MetricDefinition / KPI card conflation**
Presentation becomes semantic authority.

**Dashboard label / Metric identity conflation**
Renaming the card changes metric semantics.

**MetricObservation / MetricAggregate conflation**
Raw evidence and executive totals merge.

**MetricAggregate / KPI projection conflation**
Aggregation storage becomes UI contract.

**KPI projection / source-domain record conflation**
Derived number is persisted back into source truth.

**Dashboard widget / Metric Definition conflation**
Deleting widget deletes metric semantics.

**Widget layout / permission conflation**
Hidden widget is treated as access control.

**Personal dashboard configuration / Organization Settings conflation**
User preference becomes global policy.

**Dashboard configuration / Metric Registry conflation**
Moving cards changes metric definition.

**Revenue / invoiced value conflation**
Billing and cash/recognized revenue semantics merge.

**Pipeline / Revenue conflation**
Potential sales is treated as actual earnings.

**Collected payment / invoiced amount conflation**
Finance reports become incorrect.

**Project progress / task completion percentage conflation**
Design-111 distinction is lost.

**Capacity / allocation / utilization / workload conflation**
Team analytics becomes misleading.

**Distribution provider total / canonical performance conflation**
Design 129 provenance rules are bypassed.

**Provider success / verified Placement conflation**
Distribution truth is overstated.

**Analytics / operational state conflation**
Dashboard metric becomes workflow state.

**Analytics / Operations Command Center conflation**
Design 135 becomes Design 136.

**Analytics / My Work conflation**
Executive KPI becomes action queue.

**Metric trend / Alert conflation**
Any negative movement becomes system alert.

**Metric anomaly / business failure conflation**
Statistical signal becomes source-domain failure.

**Live analytics / ReportSnapshot conflation**
Reports silently change.

**Dashboard export / ReportVersion conflation**
Ad-hoc export becomes formal report.

**Current period / comparison period conflation**
Delta calculations become meaningless.

**Comparison / target conflation**
Prior-period performance is mistaken for goal.

**Current partial month / prior full month conflation**
Executive delta is misleading.

**Relative period / fixed seconds conflation**
Calendar months/weeks are wrong.

**Viewer timezone / canonical period conflation**
Users see different business totals unintentionally.

**Metric calculatedAt / dataThrough conflation**
Freshly computed stale data looks current.

**Freshness / completeness conflation**
Complete old data looks fresh.

**Completeness / provenance conflation**
Full estimated data looks verified.

**Stale / unavailable conflation**
Old value disappears.

**Partial / zero conflation**
Missing source becomes low performance.

**Restricted / zero conflation**
Permission boundaries look like business underperformance.

**Unavailable / no activity conflation**
Provider outage appears as zero results.

**Estimated / verified conflation**
Confidence is hidden.

**Manual / provider metric conflation**
Human-entered figures appear system-derived.

**Mixed provenance / verified total conflation**
Executive trust becomes overstated.

**Positive delta / good performance conflation**
Metrics where lower is better become incorrectly colored.

**Negative delta / bad performance conflation**
Cost reductions appear negative.

**Metric direction / visual arrow conflation**
Frontend owns business semantics.

**Percentage change / divide-by-zero conflation**
Infinity/NaN reaches UI.

**Non-additive metric / additive total conflation**
Unique counts and rates become mathematically invalid.

**Missing time bucket / zero bucket conflation**
Charts imply activity/absence incorrectly.

**Interpolation / observation conflation**
Fabricated trend points look measured.

**KPI permission / drilldown permission conflation**
Aggregate access leaks row-level details.

**Job title / analytics permission conflation**
Org title becomes authorization.

**Dashboard access / all metric access conflation**
Executive screen leaks restricted Finance/Team metrics.

**Permission after aggregation / permission before aggregation conflation**
Hidden data leaks through totals.

**Cached broad-role metric / narrower-role metric conflation**
Authorization leaks through cache.

**Filter / authorization conflation**
Client manipulates filter to broaden source scope.

**Metric dimension / arbitrary DB field conflation**
Sensitive source fields leak.

**Drilldown row / source entity conflation**
Opening analytical row bypasses source permission.

**Drilldown additive reconciliation / non-additive semantics conflation**
Totals are forced to match incorrectly.

**Metric formula version / current formula conflation**
Historical trend changes after formula update.

**Live backfill / frozen historical report conflation**
Late data rewrites Client report.

**Analytics aggregate / source truth conflation**
Materialized read model becomes authoritative record.

**Aggregate recalculation / business mutation conflation**
Analytics job changes source-domain state.

**Dashboard freshness / application refresh conflation**
Clicking Refresh appears to update source data.

**Observability metric / business KPI conflation**
Queue latency appears in executive business analytics unintentionally.

**Generic `kpis JSON`**
No canonical metric identity, provenance, period, freshness or permissions.

**Generic `trendPercent` field**
No comparison period/comparability semantics.

**Generic `isPositive` boolean**
Frontend hard-codes business direction.

**Generic `dashboard_score`**
Unrelated metrics collapse into arbitrary single number.

**Generic `lastUpdated`**
No per-metric `dataThrough`/freshness.

**135/003 duplicate Executive Dashboard logic**
Landing dashboard and Analytics diverge.

**135/038 duplicate Metric Registry**
Analytics formulas fork.

**135/129 duplicate Distribution analytics**
Provider data is recalculated differently.

**135/130–134 duplicate Reporting data**
Live analytics and Reports merge.

**135/136 duplicate operational condition model**
Dashboard becomes Command Center.

**135/137 duplicate workforce calculations**
Capacity/workload semantics diverge.

No additional screen is required.

These are **central Metric Registry reuse, cross-domain analytical adapters, exact period/comparison semantics, provenance/freshness/completeness, permission-before-aggregation, non-additive metric behavior, live-vs-frozen reporting, dashboard configuration boundaries, and executive decision-integrity requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL EXECUTIVE KPI, CROSS-DOMAIN METRIC AGGREGATION, TREND & DECISION-SUPPORT ANCHOR**

**Domain directive:**
**MetricDefinition ≠ MetricObservation ≠ MetricAggregate ≠ KPIProjection ≠ ExecutiveDashboardView ≠ DashboardWidget ≠ DashboardViewConfiguration ≠ ComparisonPeriod ≠ Target/Goal ≠ ReportMetric ≠ ReportDatasetSnapshot ≠ OperationalAlert ≠ SourceDomainRecord.**

**Foundation directive:**
Design 038 remains the single canonical Analytics/Metric Registry foundation. Design 135 is a cross-domain executive analytical projection over that foundation, not a parallel KPI engine.

**Dashboard-family directive:**
Design 003 and Design 135 share dashboard presentation/query primitives where useful, while Design 135 remains the dedicated deeper analytical surface.

**Metric directive:**
every executive KPI references one canonical MetricDefinition with stable semantic identity, unit, calculation behavior, aggregation behavior and version.

**No-component-formula directive:**
React components, chart components and page loaders cannot define or silently alter KPI formulas.

**Observation directive:**
source measurement evidence remains `MetricObservation`; executive totals remain derived aggregates/read models.

**Aggregate directive:**
`MetricAggregate` remains rebuildable analytical output and never becomes source-domain business truth.

**Projection directive:**
`ExecutiveKPIProjection` adds display/comparison/freshness/completeness/provenance context but never becomes an independent metric record.

**Period directive:**
primary analytical period is explicit, timezone-safe and resolved to exact boundaries rather than stored as ambiguous `"this month"` text.

**Calendar directive:**
month/week/quarter semantics use calendar boundaries and timezone rules—not fixed 30/7/90-day assumptions unless the metric intentionally defines rolling windows.

**Comparison directive:**
comparison periods remain explicit independent query contexts; prior-period comparison is never treated as a target/goal.

**Partial-period directive:**
incomplete current periods are first-class and comparison services must avoid misleading full-period deltas.

**Comparability directive:**
one `AnalyticsComparisonService` determines whether two periods/values are actually comparable and qualifies partial/incompatible comparisons.

**Zero-denominator directive:**
percentage change from zero or other undefined comparisons never produces Infinity/NaN; canonical metric policy decides meaningful representation.

**Directional directive:**
higher-is-better/lower-is-better/neutral interpretation belongs to metric semantics and never to generic arrow/color frontend logic.

**Availability directive:**
`0`, `Unavailable`, `Partial`, and `Restricted` remain distinct.

**Freshness directive:**
metric `dataThrough`, calculation time, and freshness remain independently represented. Newly calculated stale source data is still stale.

**Completeness directive:**
metric completeness reflects expected source coverage and cannot be inferred merely because a numeric value exists.

**Freshness/completeness directive:**
Fresh+Partial and Complete+Stale are both valid states and must remain representable.

**Provenance directive:**
Verified, provider-reported, derived, estimated, manual, mixed, and unknown evidence classes remain explicit according to Design-038 governance.

**Mixed-provenance directive:**
cross-domain KPI aggregation never upgrades mixed/estimated evidence into fully verified truth without explicit policy.

**Sales directive:**
pipeline value, weighted forecast, won value and realized revenue remain separate canonical metrics.

**Finance directive:**
invoiced amount, collected cash, outstanding receivables, refunds, reconciled settlements and any recognized-revenue metric remain semantically distinct.

**Project directive:**
project lifecycle, stage, health, readiness, Task completion, Milestone achievement and progress resolvers remain source-domain semantics and cannot be recomputed simplistically inside Design 135.

**Distribution directive:**
Design 129 remains canonical Placement verification/performance source; Design 135 consumes summarized analytical projections without re-ingesting provider data.

**Workforce directive:**
Designs 112/137 remain authority for capacity, allocation, workload, availability and utilization semantics. Design 135 may only consume high-level governed aggregates.

**Operations directive:**
Design 136 remains operational action/attention authority. Executive analytical change does not automatically become an operational incident/action state.

**Reporting directive:**
Designs 130–134 remain frozen Reporting authority. Design 135 is live analytics and can recalculate/backfill historical analytical periods without rewriting finalized ReportDatasetSnapshots.

**Export directive:**
if executive analytical export exists in the frozen design, it retains query period/metric/provenance/freshness context and does not automatically become a formal ReportVersion.

**Authorization directive:**
dashboard access, individual KPI access, sensitive metric access, drilldown access, dimension access, export and dashboard configuration remain independently server-authorized.

**Permission-before-aggregation directive:**
tenant/resource authorization is applied before aggregation, counts, breakdowns, comparisons and drilldown generation.

**Aggregate-only directive:**
where aggregate-only executive access is valid, it is explicit authorization policy and never inferred from title or job role.

**Role directive:**
Job title, Team membership, Project role and manager status do not replace Design-037 permission/authorization rules.

**Drilldown directive:**
executive metric drilldowns use typed allowlisted dimensions and preserve exact period/filter context while reauthorizing underlying source records independently.

**Non-additive directive:**
unique counts, ratios, averages, medians, deduplicated reach and other non-additive metrics must not be forced into generic SUM-based drilldown reconciliation.

**Time-series directive:**
missing data points remain missing; they are never silently zero-filled or interpolated unless canonical metric policy explicitly permits and labels interpolation.

**Metric-version directive:**
aggregation jobs pin MetricDefinition/calculation versions so one KPI result cannot mix incompatible formula revisions.

**Backfill directive:**
late-arriving source data may legitimately recalculate Design-135 live analytics, while previously released Reports remain frozen until explicitly revised.

**Domain-adapter directive:**
canonical domain analytical adapters encapsulate Sales, Finance, Projects, Distribution, Team and other source-specific semantics rather than Design 135 querying arbitrary domain tables directly.

**No-arbitrary-query directive:**
Design 135 cannot expose unrestricted metric/formula/table query parameters or arbitrary SQL/JS analytical execution.

**Data-quality directive:**
one centralized analytical quality resolver communicates availability, completeness, provenance and freshness consistently across executive widgets.

**Dashboard-configuration directive:**
if frozen Design 135 supports customization, widget visibility/order/default period live in DashboardViewConfiguration and never change Metric Registry, authorization or source data.

**Client-filter directive:**
dashboard filters can only narrow authorized analytical scope and can never broaden tenant/resource access.

**Cache directive:**
analytics caches include membership/authorization scope, metric-definition versions, periods, timezone, filters, aggregate revisions and freshness context. Broad-role cached totals must never leak to narrower roles.

**Batch-query directive:**
executive KPI loading should use batched governed query plans/read models rather than N independent heavy queries from individual cards.

**Performance directive:**
expensive cross-domain KPIs should use indexed analytical read models/materialized aggregates/background calculations where justified while remaining completely rebuildable from canonical source domains.

**Idempotency directive:**
aggregate/precomputation jobs are replay-safe and cannot create duplicate observations or mutate source-domain records.

**Activity directive:**
viewing/filtering Design 135 does not become platform Activity; source-domain events remain canonical history.

**Audit directive:**
ordinary analytical viewing is not Audit. Governance changes to shared metric definitions/configuration, where performed elsewhere, may be audited.

**Observability directive:**
dashboard query latency, aggregation worker lag and cache failures remain operational telemetry and never masquerade as executive business metrics without their own explicit MetricDefinitions.

**Partial-failure directive:**
Finance, Sales, Projects, Distribution, Team and other analytical domains may fail independently. `Unavailable`, `Restricted`, `Partial`, and `Stale` never become zero or complete executive truth.

**Future-reuse directive:**
Design **136 — Operations Command Center** must reuse canonical operational/project/task/risk/blocker/approval/integration-health state and may consume Design-135 analytical indicators as context, but it must not treat KPI movement as operational source truth. Design 136's job is prioritized actionable operational conditions, while Design 135 remains measurement/analysis.

**Overlap directive:**
Designs **003–007, 038, 129–137** must preserve one continuous **canonical source-domain records → typed MetricObservations → Design-038 MetricDefinitions/calculation versions → permission-safe MetricAggregates → freshness/completeness/provenance-aware executive KPI projections → Design-135 analytical exploration → optional frozen ReportSnapshots**, while operational/action surfaces remain separate.

**Consolidation directive:**
**STANDARDIZE ONE EXECUTIVE ANALYTICS FOUNDATION — DESIGN-038 CANONICAL METRIC REGISTRY + DOMAIN-SPECIFIC ANALYTICAL ADAPTERS + VERSIONED METRIC SEMANTICS + EXACT PERIOD/TIMEZONE/COMPARISON CONTEXT + PERMISSION-BEFORE-AGGREGATION + ZERO/UNAVAILABLE/RESTRICTED/PARTIAL SEPARATION + FRESHNESS/COMPLETENESS/PROVENANCE METADATA + DIRECTIONALLY CORRECT COMPARISON LOGIC + NON-ADDITIVE METRIC SAFETY + AUTHORIZATION-AWARE CACHING + DESIGN-003 SHARED DASHBOARD PRIMITIVES + DESIGN-129/137 SPECIALIZED ANALYTICS REUSE + STRICT DESIGN-130–134 REPORT AND DESIGN-136 OPERATIONS SEPARATION — AND NEVER ALLOW HARD-CODED CARD FORMULAS, GENERIC KPI JSON, RAW DOMAIN SUMS, `LASTUPDATED`, `TRENDPERCENT`, `ISPOSITIVE`, ZERO-FILLING, JOB TITLES, UI FILTERS OR BROAD-ROLE CACHE RESULTS TO SUBSTITUTE FOR OR REWRITE CANONICAL METRIC, AUTHORIZATION, SOURCE-DOMAIN OR REPORTING TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **135 / 153** |
| **PASS**                                   |                        **135** |
| **STANDARDIZE decisions**                  |                        **133** |
| **Potential implementation-overlap flags** |                        **126** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**135 / 153 = 88.2% audited.**

### Canonical Executive Analytics architecture after Design 135

```text
CANONICAL BUSINESS DOMAINS
       │
       ├── Sales
       ├── Finance
       ├── Projects
       ├── Distribution
       └── Workforce
               │
               ↓
       Metric Observations
               │
               ↓
       Design 038 Metric Registry
               │
               ↓
       Permission-Safe Aggregation
               │
          ┌────┼─────┐
          ↓    ↓     ↓
        KPI  Trend Comparison
          │    │     │
          └────┼─────┘
               ↓
       Design 135 Executive
          Analytics Dashboard
```

The strongest KPI-integrity rule is now explicit:

```text
Revenue = $182K

is not enough.

Canonical analytical result also knows:

Metric Definition
Period
Timezone
Calculation Version
Data Through
Freshness
Completeness
Provenance
Authorization Scope
Comparison Period
```

Zero and unavailable remain completely different:

```text
New Deals = 0
availability = AVAILABLE

        ≠

New Deals = unavailable
because CRM analytics failed

        ≠

New Deals = restricted
because user cannot see Sales data
```

Comparison semantics also remain governed:

```text
August 1–15
Revenue = $90K

July 1–31
Revenue = $160K

The system must NOT
blindly report:

-43.75%

as a normal month-over-month
performance comparison.

The periods are not equivalent
unless the comparison policy
explicitly permits/qualifies it.
```

And Analytics remains distinct from Operations:

```text
Design 135 says:

Blocked Project Rate ↑ 8%

        ≠

Design 136 says:

These 7 Projects
require action now.

Analytics measures.

Operations commands/actionizes.
```

## Next Sequential Audit Target

### **Design 136 — Operations Command Center**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
