# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 137 — Team Performance / Workload Analytics

Design 137 should become the **canonical Team Workspace workforce-capacity, workload, assignment, delivery-throughput, utilization, availability, and team-level operational analytics surface** built directly on the workforce, Project-resource, Task, and Analytics foundations established by **Designs 036, 034, 112, 111, and 135/038**.

Design 137 must **not become an employee appraisal, surveillance, ranking, payroll, timesheet, or generic “productivity score” system** unless those capabilities exist independently in the frozen product.

Its purpose is operational planning and workload understanding:

> **Who has capacity, who is allocated, where work is concentrated, what workload is becoming unhealthy, how teams are delivering against operational measures, and which workload/resource conditions need planning attention?**

It must preserve strict distinctions between:

> **Capacity ≠ Availability ≠ ResourceAllocation ≠ TaskAssignment ≠ Workload ≠ Utilization ≠ Throughput ≠ Completion ≠ Timeliness ≠ Quality ≠ EmployeePerformanceEvaluation.**

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **User ≠ OrganizationMembership ≠ EmployeeProfile ≠ TeamMembership ≠ ProjectTeamMembership ≠ ResourceAllocation ≠ Capacity ≠ Availability ≠ TaskAssignment ≠ WorkloadObservation ≠ MetricObservation ≠ MetricAggregate ≠ TeamPerformanceProjection ≠ IndividualPerformanceEvaluation ≠ AuditEvent.**

The central implementation rule is:

> **Design 137 is an analytical projection over canonical workforce and work-delivery data. It may calculate governed workload/capacity/team-performance indicators using Design-038 MetricDefinitions, but it must never rewrite assignments, infer employment performance from incomplete operational data, produce undocumented employee scores, or use Audit/Activity/Notification behavior as a proxy for productivity. Every figure must preserve its scope, period, data completeness, metric semantics, and authorization context.**

---

# 1. Classification

| Audit field                              | Classification                                                                                                                                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**                            | **137**                                                                                                                                                                                                      |
| **Canonical name**                       | **Team Performance / Workload Analytics**                                                                                                                                                                    |
| **Product area**                         | Team Workspace / Team / Analytics / Resource Operations                                                                                                                                                      |
| **User surface**                         | **Authenticated Team Workspace**                                                                                                                                                                             |
| **Screen class**                         | Workforce Analytics Workspace / Capacity & Workload Analysis                                                                                                                                                 |
| **Classification**                       | **Canonical Workforce Capacity, Workload, Utilization & Team Delivery Analytics Anchor**                                                                                                                     |
| **Primary purpose**                      | Analyze workforce capacity, availability, allocation, assignment load, workload distribution, delivery throughput, and team-level operational performance using canonical source data and metric definitions |
| **Canonical workforce identity**         | Design 036                                                                                                                                                                                                   |
| **Canonical Task identity**              | Design 034                                                                                                                                                                                                   |
| **Project Tasks dependency**             | Design 111                                                                                                                                                                                                   |
| **Project-resource foundation**          | Design 112                                                                                                                                                                                                   |
| **Project/Delivery dependency**          | Design 023                                                                                                                                                                                                   |
| **Operations overview dependency**       | Design 006                                                                                                                                                                                                   |
| **Operations command boundary**          | Design 136                                                                                                                                                                                                   |
| **Executive Analytics dependency**       | Design 135                                                                                                                                                                                                   |
| **Canonical Analytics foundation**       | Design 038                                                                                                                                                                                                   |
| **RBAC dependency**                      | Design 037                                                                                                                                                                                                   |
| **Activity boundary**                    | Design 119                                                                                                                                                                                                   |
| **Audit boundary**                       | Design 039 / next Design 138                                                                                                                                                                                 |
| **Primary analytical source identities** | OrganizationMembership, EmployeeProfile, TeamMembership, ProjectTeamMembership, ResourceAllocation, TaskAssignment                                                                                           |
| **Capacity representation**              | `CapacityProjection` / canonical resource-capacity service                                                                                                                                                   |
| **Availability representation**          | `AvailabilityProjection`                                                                                                                                                                                     |
| **Workload representation**              | `WorkloadProjection`                                                                                                                                                                                         |
| **Analytics representation**             | `TeamPerformanceProjection`                                                                                                                                                                                  |
| **Metric authority**                     | Design-038 `MetricDefinition`                                                                                                                                                                                |
| **Primary query service**                | `TeamWorkloadAnalyticsQueryService`                                                                                                                                                                          |
| **Capacity service**                     | canonical `ResourceCapacityService` shared with Design 112                                                                                                                                                   |
| **Workload resolver**                    | `TeamWorkloadResolver`                                                                                                                                                                                       |
| **Utilization resolver**                 | `UtilizationMetricResolver`                                                                                                                                                                                  |
| **Delivery analytics service**           | `TeamDeliveryAnalyticsService`                                                                                                                                                                               |
| **Data quality resolver**                | canonical Analytics data-quality/freshness infrastructure                                                                                                                                                    |
| **Parent shell**                         | `InternalAppShell` — Design 001                                                                                                                                                                              |
| **Auth**                                 | Required                                                                                                                                                                                                     |
| **Authorization**                        | Active OrganizationMembership + workforce/analytics/team-scope permissions                                                                                                                                   |
| **Implementation priority**              | **Critical Resource Planning / Workforce Privacy / Metric Integrity**                                                                                                                                        |
| **Reuse level**                          | **Extremely High across Projects, Operations, Executive Analytics, Tasks and resource planning**                                                                                                             |

Design 137 should answer:

> **“How much usable capacity exists, how much planned work is allocated, how much current work is assigned, where workload is concentrated, which Teams or members appear over/under capacity according to governed definitions, how delivery is trending over the selected period, and how complete/reliable are those conclusions?”**

Canonical architecture:

```text
OrganizationMembership / EmployeeProfile
                 │
                 ├── TeamMembership
                 ├── ProjectTeamMembership
                 ├── Capacity / Availability
                 ├── ResourceAllocation
                 └── TaskAssignment
                           │
                           ↓
                  Analytics Adapters
                           │
                           ↓
                   Metric Registry
                    Design 038
                           │
                           ↓
             Workload / Utilization /
             Delivery Aggregation
                           │
                           ↓
              TeamPerformanceProjection
                           │
                           ↓
                    Design 137
```

---

# 2. Reuse

## Design 036 remains workforce identity authority

Design 137 must not create parallel identities such as:

```text
AnalyticsEmployee
PerformanceUser
WorkloadPerson
TeamAnalyticsMember
```

Correct:

```text
OrganizationMembership OM-20
EmployeeProfile EP-20

same identity used in:
Design 036 Team Management
Design 112 Project Team
Design 137 Team Analytics
```

---

## User ≠ EmployeeProfile ≠ OrganizationMembership

The Design-036 distinction remains mandatory.

### User

Authentication/platform identity.

### OrganizationMembership

Tenant participation and active/deactivated membership.

### EmployeeProfile

Workforce/business profile.

Analytics should normally scope to canonical Membership/EmployeeProfile relationships, not authentication identity alone.

---

## TeamMembership ≠ ProjectTeamMembership

Critical.

A person can belong to:

> Editorial Team

organizationally while also participating in:

> Project P-100

with a project-specific delivery role.

Design 137 must preserve both contexts.

---

## Project delivery role ≠ RBAC Role

Absolute.

Design 112 already established:

> Delivery role is operational responsibility.

Design 037:

> RoleAssignment is security authority.

Analytics must never derive permissions from workload role labels.

---

## ResourceAllocation remains Design-112 canonical

Design 137 should consume exact allocations.

It must not create:

```text
analyticsAllocation
workloadAssignment
```

as alternate records.

---

## ResourceAllocation ≠ TaskAssignment

One of the strongest boundaries.

### ResourceAllocation

Planned capacity commitment.

Example:

> 40% of this member's capacity allocated to Project A.

### TaskAssignment

Concrete responsibility for a Task.

Example:

> Assigned Task T-45.

A member can have:

```text
high allocation
+
few current tasks
```

or:

```text
low planned allocation
+
many urgent tasks
```

Those are different operational conditions.

---

## Capacity ≠ Availability

Critical.

### Capacity

How much work resource is normally available under the workforce model.

### Availability

How much of that capacity is currently usable after leave, schedule, other commitments, etc., where canonical data supports it.

Do not treat:

> 40 hours/week nominal capacity

as:

> 40 hours currently available.

---

## Capacity ≠ Allocation

Absolute.

---

## Allocation ≠ Utilization

Absolute.

Planned:

> 80% allocated

does not prove:

> 80% actually utilized.

---

## Workload ≠ Utilization

Permanent.

A person may have many lightweight tasks but low actual utilization.

Another may have one complex task occupying substantial capacity.

---

## Task count ≠ Workload

Critical.

This is a major anti-bad-analytics rule.

Incorrect:

```text
10 Tasks
>
5 Tasks

therefore:
Person A has twice the workload.
```

Unless all Tasks have equivalent governed workload units—which is unlikely.

Task count can be a metric.

It is not automatically a workload measure.

---

## Estimated effort ≠ actual effort

If Tasks carry estimates:

those can contribute to planned workload.

Do not treat estimates as actual time spent.

---

## Actual effort/time ≠ available unless canonical source exists

Do not invent a Timesheet domain to calculate utilization.

If the platform has no canonical time tracking:

Design 137 should calculate only what supported source data permits and mark metrics accordingly.

---

## Workload ≠ Employee performance

Absolute.

Being heavily loaded does not mean:

> high performer.

Being lightly loaded does not mean:

> poor performer.

---

## Throughput ≠ productivity

Critical.

Completing more Tasks may depend on:

* Task complexity;
* role;
* Project type;
* work stage;
* support dependencies.

Do not rank employees by raw completion count.

---

## Completion ≠ Quality

Permanent.

---

## Speed ≠ Quality

Permanent.

---

## On-time rate ≠ overall employee performance

Permanent.

It is one operational metric.

---

## Blocked work ≠ employee failure

Critical.

A member can have overdue Tasks because:

* Client input missing;
* Approval delayed;
* integration unavailable;
* dependent Task incomplete.

Use canonical dependency context before interpreting delivery.

---

## Project health ≠ Team performance

Permanent.

A Project can be unhealthy for reasons unrelated to staffing.

---

## Design 135 and Design 137 share Metric Registry

Design 135 can consume high-level workforce KPIs.

Design 137 provides deeper Team/member workload analysis.

No duplicate formulas.

---

## Design 136 ≠ Design 137

### Design 136

Current operational attention:

> Team member currently overallocated on three critical Projects.

### Design 137

Analytical understanding:

> Allocation trend and workload distribution by Team over the selected period.

Operations action queue ≠ analytics.

---

## Design 006 may reuse summaries

Design 006 can consume compact:

* capacity;
* overloaded-resource counts;
* current workload health.

Again, same backend.

---

## Audit/Event data ≠ employee productivity

This deserves a permanent architecture rule.

Do not use:

* number of clicks;
* login frequency;
* AuditEvent count;
* ActivityEvent count;
* Notifications read;
* messages sent;

as default employee-performance metrics.

These systems exist for different purposes.

---

# 3. Entities

## OrganizationMembership

Canonical tenant-member identity.

Analytics scope should use active/historical membership semantics correctly.

---

## Deactivated Membership

Historical analytics may still include past work performed while membership was active.

Current staffing/capacity views should not treat deactivated memberships as active capacity.

---

## EmployeeProfile

Workforce information.

Current job title/team profile may differ from historical assignment context.

Historical analytics should preserve appropriate temporal context where required.

---

## TeamMembership

Should ideally support temporal membership if analytics requires historical Team attribution.

Example:

```text
Member belonged to Editorial
Jan–Jun

Moved to Publishing
Jul onward
```

A May report should not retroactively count all May work under Publishing.

---

## ProjectTeamMembership

Canonical Design-112 relation.

Conceptually:

```text
ProjectTeamMembership
├── projectId
├── organizationMembershipId
├── deliveryRole
├── effectiveFrom
├── effectiveTo?
└── lifecycle
```

---

## ResourceAllocation

Canonical planned commitment.

Conceptually:

```text
ResourceAllocation
├── organizationMembershipId
├── projectId / context
├── allocationPeriod
├── allocationAmount
├── allocationUnit
├── effective interval
├── createdAt
└── revision
```

Exact schema Phase 3D.

---

## Allocation unit must be explicit

Examples could include:

* percentage;
* hours;
* capacity units;

depending on established project model.

Do not mix them without normalization.

---

## Capacity

Canonical/derived resource-capacity value.

Conceptually:

```text
CapacityProjection
├── membershipId
├── period
├── nominalCapacity
├── unit
├── source
└── calculatedAt
```

---

## Capacity source

Capacity may depend on:

* workforce schedule;
* working calendar;
* membership status;
* explicit working-hours configuration;

only where those data exist.

Do not guess.

---

## Availability

Conceptually:

```text
AvailabilityProjection
├── membershipId
├── period
├── availableCapacity
├── unavailableCapacity
├── source reasons
└── calculatedAt
```

---

## Available capacity ≠ unallocated capacity

Critical.

Example:

```text
Available = 40h
Allocated = 32h

Unallocated = 8h
```

But if the member has an unplanned urgent Task load, operational workload may still exceed that.

---

## Planned free capacity

Derived:

```text
availableCapacity - plannedAllocation
```

where units and periods are compatible.

---

## ResourceAllocation overlap

Multiple allocations can legitimately coexist.

Example:

```text
Project A = 50%
Project B = 30%
Operations = 20%
```

Total = 100%.

---

## Over-allocation

Derived under one centralized capacity policy.

Example:

```text
available = 80%
allocated = 110%

over-allocation = 30 percentage points
```

Do not persist generic `overloaded=true` as source truth unless as rebuildable projection.

---

## WorkloadProjection

Analytical/read-model concept.

Conceptually:

```text
WorkloadProjection
├── membershipId/teamId
├── period
├── assignedWork
├── dueWork
├── overdueWork
├── blockedWork
├── plannedAllocation
├── availableCapacity
├── workloadIndicators
├── completeness
└── calculatedAt
```

---

## WorkloadProjection ≠ work source

Permanent.

---

## Workload measurement requires explicit metric semantics

Potential canonical metrics may include:

* open assigned Tasks;
* due Tasks;
* estimated workload;
* planned allocation;
* blocked Tasks;
* overdue Tasks;

only where supported.

Do not combine all of these into one undocumented number.

---

## Utilization

If validly measurable:

```text
UtilizationMetric
```

must have a canonical MetricDefinition answering:

> utilization of what capacity, measured from what evidence, over what period?

Examples of materially different concepts:

```text
Allocated utilization
Actual tracked utilization
Billable utilization
Delivery utilization
```

They cannot all be called simply:

> Utilization.

---

## No actual-effort source → no actual-utilization claim

Absolute.

If only allocation data exists:

label the metric accordingly:

> Planned allocation rate

not:

> Actual utilization.

---

## TeamPerformanceProjection

Read-only analytical composition.

Conceptually:

```text
TeamPerformanceProjection
├── teamId
├── period
├── capacity metrics
├── allocation metrics
├── workload metrics
├── delivery metrics
├── timeliness metrics
├── blocked-work metrics
├── data quality
└── comparison context
```

---

## TeamPerformanceProjection ≠ performance review

Permanent.

---

## Individual member analytical projection

If frozen Design 137 shows individual rows, they should be operational workforce analytics, not employment evaluation.

Example:

```text
MemberWorkloadProjection
```

can show:

* current allocations;
* assigned work;
* due dates;
* workload condition;
* availability.

It should not become:

```text
EmployeePerformanceScore
```

without a separate explicit product/domain.

---

## MetricDefinition

Canonical Design 038.

Examples conceptually:

```text
PLANNED_ALLOCATION_RATE
OPEN_ASSIGNED_TASKS
OVERDUE_ASSIGNED_TASKS
TASK_COMPLETION_RATE
ON_TIME_COMPLETION_RATE
```

only where business definitions are intentionally approved.

---

## Metric definitions must define denominator/scope

Example:

> On-time completion rate

requires:

* what counts as completed;
* what due-date snapshot applies;
* what happens if due date changes;
* which Task types qualify;
* period attribution.

Do not write:

```text
completedOnTime / allTasks
```

ad hoc.

---

## Changed due dates

Important.

If a Task due date moves from Aug 1 to Aug 10:

historical timeliness semantics need policy.

Current due date cannot blindly rewrite all historical performance interpretation.

---

## Task complexity

If complexity/effort data does not exist:

do not imply throughput metrics are complexity-adjusted.

---

## Delivery quality

Do not infer quality from Approval count or revision count without a governed MetricDefinition.

More review rounds may reflect:

* complex work;
* demanding Client;
* process quality;
* scope changes.

Not necessarily employee weakness.

---

## DataCompleteness

Critical for individual/team analytics.

Potential inputs:

* missing allocations;
* missing task estimates;
* incomplete source domains;
* unknown availability.

A polished percentage without completeness context is dangerous.

---

## ComparisonContext

Same Design-135 infrastructure.

Team analytics may compare:

* period vs prior period;
* Team vs Team;

only when metrics are semantically comparable.

---

## Team comparison

Different Team functions may not be comparable.

Example:

> Editorial throughput vs Finance throughput

may use completely different work units.

Do not rank them under one generic metric.

---

## Benchmark

If frozen design shows benchmarks:

benchmark identity/source must be explicit.

Do not invent company-wide averages as meaningful across heterogeneous roles.

---

# 4. Permissions

Design 137 requires particularly careful workforce privacy.

Conceptually distinguish:

```text
teamAnalytics.read
teamAnalytics.readAggregate
teamAnalytics.readIndividual

workload.read
capacity.read
allocation.read

teamAnalytics.export

workforceSensitive.read
```

Exact permissions belong to Phase 3D.

---

## Team aggregate access ≠ individual-member analytics access

Critical.

A manager may legitimately see:

> Team utilization 82%

without being permitted to inspect every individual's detail.

---

## Individual analytics ≠ Employee profile administration

Permanent.

---

## Workload read ≠ Task edit

Permanent.

---

## Resource analytics ≠ ResourceAllocation edit

Permanent.

Design 112 owns allocation commands.

---

## Capacity analytics ≠ workforce schedule edit

Permanent.

---

## Manager relation ≠ permission

Absolute.

Design 036 Manager relationship is operational structure.

Design 037 still determines authorization.

---

## Job title ≠ permission

Permanent.

---

## TeamMembership ≠ analytics access

Being on the Team does not automatically mean seeing all coworkers' workload/performance analytics.

---

## Cross-Team access must be explicit

Permanent.

---

## Sensitive individual metrics require stronger control

Especially if the frozen screen contains:

* named member performance;
* absence/availability indicators;
* individual delivery comparisons.

Only expose data necessary for legitimate operational management.

---

## Restricted metric ≠ zero

Absolute.

---

## Permission before aggregation

Critical.

If a user is authorized only for Team A:

do not calculate organization-wide workforce metrics and hide Team B rows afterward.

---

## Aggregate-only policy

Can be legitimate:

> organization capacity summary

without individual identities.

This must be explicit.

---

## Drilldown authorization separate

A user may see Team aggregate but not member-level breakdown.

---

## Source Task permission

If individual workload drilldown opens Tasks:

canonical Task access reauthorizes.

---

## Export requires separate permission

Workforce exports can be more sensitive than screen access.

---

## Search/facet counts permission-safe

If filters show:

> Editorial 12
> Sales 7

counts must respect authorization.

---

## Deactivated employees

Historical reporting access should follow retention/governance.

Deactivation does not mean their historical work analytics becomes public or disappears.

---

# 5. States

Design 137 must keep **capacity, availability, allocation, workload, utilization, delivery condition, data completeness, freshness, and authorization** separate.

### Capacity

```text
Known
Partial
Unknown
Unavailable
```

### Availability

```text
Available
Partially Available
Unavailable
Unknown
```

### Allocation

```text
Under Allocated
Within Capacity
Near Capacity
Over Allocated
Unknown
```

Exact thresholds Phase 3D.

### Workload

Conceptually:

```text
Light
Balanced
High
Critical
Unknown
```

only if governed definitions exist.

### Data quality

```text
Complete
Partial
Unknown
```

### Freshness

```text
Fresh
Aging
Stale
Unknown
```

These states must never collapse into a generic `employee_status`.

---

## Underallocated ≠ underperforming

Absolute.

---

## Overallocated ≠ high performing

Absolute.

---

## High workload ≠ high utilization automatically

Permanent.

---

## Low Task count ≠ low workload

Permanent.

---

## High Task count ≠ overloaded automatically

Permanent.

---

## Overdue Task ≠ employee failure

Permanent.

---

## Blocked Task ≠ poor performance

Absolute.

---

## Availability unknown ≠ zero capacity

Absolute.

---

## Allocation unknown ≠ no allocation

Absolute.

---

## Capacity missing ≠ employee inactive

Permanent.

---

## Member inactive ≠ historical metrics unavailable

Permanent.

---

## Team with fewer completions ≠ worse Team

Absolute without normalized metric semantics.

---

## Comparison unavailable ≠ equal performance

Absolute.

---

## Zero completed Tasks ≠ no work necessarily

Critical.

The person's work may involve:

* long-duration Tasks;
* milestone work;
* non-Task responsibilities.

---

## Data partial ≠ poor performance

Absolute.

---

## State Coverage

Design 137 inherits Design 150 plus:

```text
Team Analytics Loading
Team Analytics Available
Team Analytics Empty
Team Analytics Restricted
Team Analytics Partial
Team Analytics Unavailable

Team Active
Team Historical
Team Restricted

Member Active
Member Deactivated
Member Historical
Member Restricted

Capacity Known
Capacity Partial
Capacity Unknown
Capacity Unavailable

Availability Known
Availability Partial
Availability Unknown
Availability Unavailable

Allocation Within Capacity
Allocation Near Capacity
Allocation Over Capacity
Allocation Under Capacity
Allocation State Unknown

Workload Balanced
Workload Elevated
Workload High
Workload State Unknown

Assigned Work Available
Assigned Work Partial
Assigned Work Unavailable

Delivery Metrics Available
Delivery Metrics Partial
Delivery Metrics Unavailable

Metric Zero
Metric Available
Metric Partial
Metric Restricted
Metric Unavailable

Data Complete
Data Partial
Data Completeness Unknown

Analytics Fresh
Analytics Aging
Analytics Stale
Freshness Unknown

Comparison Available
Comparison Partial
Comparison Not Comparable
Comparison Unavailable

Capacity Updated Elsewhere
Allocation Updated Elsewhere
Task Assignment Updated Elsewhere
Team Membership Updated Elsewhere
Permission Updated Elsewhere
Analytics Projection Stale
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize:

1. Team capacity/workload summary;
2. workload distribution;
3. member/resource planning context;
4. allocation and availability;
5. delivery metrics;
6. data completeness/freshness.

Conceptually:

```text
Team Performance / Workload
↓
Selected Team / period
↓
Capacity & Allocation summary
↓
Workload distribution
↓
Team delivery analytics
↓
Member workload rows
↓
Project / Task breakdown
↓
Data quality / freshness
```

Only frozen Design 137 sections should render.

---

## Workload indicators must not look like employee grades

Avoid UI semantics such as:

> A / B / C employee

or:

> Productivity score 78

unless explicitly present and canonically defined in the frozen product.

Operational language is safer:

> Allocation 110%
> 3 overdue assigned Tasks
> 2 blocked Tasks
> Available capacity uncertain

---

## Capacity and allocation should appear together

Example:

> Available capacity: 32h
> Planned allocation: 36h
> Over-allocation: 4h

rather than one isolated:

> 112% utilization

when actual utilization has not been measured.

---

## Planned vs actual must remain explicit

If only planned allocation exists:

label it:

> Planned allocation

not:

> Utilization.

---

## Blocked work needs context

Correct:

> 4 blocked Tasks · 3 waiting on Client

not:

> 4 failures.

---

## Team vs individual scope should be obvious

The operator must know whether a card/chart is:

* Team aggregate;
* member-specific;
* Project-specific.

---

## Period should remain visible

Workload today and delivery over last quarter are different temporal contexts.

Do not mix them without labels.

---

## Comparison semantics should remain visible

Example:

> On-time completion 88%
> vs previous comparable period +3pp

only when canonical comparison is valid.

---

## Data quality should remain visible

If Task estimates are incomplete:

> Workload estimate is partial

rather than showing false precision.

---

## Tablet

Following Design 152:

* Team/period context remains top;
* summary cards reduce columns;
* member rows stack;
* workload/allocation details become expandable;
* charts become full-width;
* data-quality indicators remain visible.

---

## Mobile

Priority:

```text
Team / period
↓
Capacity
↓
Allocation
↓
Workload condition
↓
Delivery summary
↓
Members requiring planning attention
↓
Member detail
```

Avoid squeezing a dense workforce matrix onto small screens.

---

## Mobile member card

A safe representation could conceptually communicate:

> Maya Patel
> Planned allocation 90%
> 7 open assigned Tasks
> 1 overdue
> 2 blocked
> Availability known
> No employee-performance score

without inventing frozen UI content.

---

## Accessibility

A resource summary could communicate:

> This Team has 320 available capacity hours for the selected week and 344 planned allocation hours, resulting in 24 hours of planned over-allocation. Allocation data is complete. Task workload data is partial because 18 percent of active Tasks do not contain governed effort estimates. The over-allocation indicator is a planning measure and is not an employee-performance score.

where canonical data supports it.

---

# 7. Backend Requirements

## Canonical Team Analytics architecture

```text
Design 137
    ↓
Authenticated Workspace Context
    ↓
TeamWorkloadAnalyticsQueryService
    │
    ├── WorkforceAdapter
    ├── TeamMembershipAdapter
    ├── ProjectTeamAdapter
    ├── CapacityAdapter
    ├── AvailabilityAdapter
    ├── ResourceAllocationAdapter
    ├── TaskAssignmentAdapter
    ├── DeliveryMetricAdapter
    ├── MetricRegistry
    └── AuthorizationScopeResolver
    ↓
TeamPerformanceProjection
```

---

## Workforce query contract

Conceptually:

```text
getTeamWorkloadAnalytics(
    teamScope,
    period,
    comparison?,
    filters,
    currentMembership
)
```

should:

1. authenticate;
2. authorize Team/workforce analytics scope;
3. resolve exact period/timezone;
4. resolve active/historical Team membership appropriately;
5. load capacity/availability;
6. load ResourceAllocations;
7. load TaskAssignments and supported workload evidence;
8. resolve canonical metrics;
9. calculate completeness/freshness;
10. return Team/member projections only within allowed scope.

---

## Permission before aggregation

Absolute.

---

## Historical Team membership

Analytics for a past period should use membership effective during that period where temporal data exists.

Do not attribute historical work solely to today's Team membership.

---

## Capacity service reuse

Design 112 and Design 137 should use one:

```text
ResourceCapacityService
```

or equivalent.

Do not calculate resource capacity differently across Project staffing and analytics.

---

## Capacity period normalization

All capacity/allocation comparisons require compatible:

* periods;
* units;
* working calendars.

---

## Example

Incorrect:

```text
weekly capacity 40h
compared to
monthly allocation 120h
```

without normalization.

---

## Working calendar

Where configured, capacity calculations should respect canonical:

* working days;
* timezone;
* schedule.

Do not assume 8h × 5 days for every person.

---

## Availability

Availability sources should be explicit.

If leave/calendar data is unavailable:

return:

> availability unknown

rather than assuming full capacity.

---

## ResourceAllocation aggregation

Conceptually:

```text
sum allocations
by membership + overlapping interval
```

while avoiding double-counting and unit mismatch.

---

## Allocation interval overlap

If Allocation A runs:

> Aug 1–15

and Allocation B:

> Aug 10–31

analytics must account for overlap by date/period semantics rather than simply summing full-month percentages blindly.

---

## Allocation policy

Central service should resolve:

* current planned allocation;
* period-average allocation;
* peak allocation;

as separate metrics if needed.

Do not label all of these:

> Allocation.

---

## Peak allocation ≠ average allocation

Critical.

A member may average 80% during the month but hit 140% during one week.

---

## Team capacity aggregation

Team total capacity should include only eligible active capacity for the selected period.

Historical/deactivated members must follow temporal membership policy.

---

## TaskAssignment adapter

Design 034 remains Task authority.

Workload analytics should consume:

* assignment;
* status;
* due date;
* priority;
* blocking;
* effort estimate if canonical.

It does not modify Tasks.

---

## Task status semantics

Use canonical Task status resolver.

Do not infer:

> incomplete

from absence of completion date alone.

---

## Overdue logic

Use one centralized Task due-state rule.

Do not write a separate Design-137 overdue calculation.

---

## Task reassignment history

Historical member delivery analytics may require temporal assignment history.

Current `task.assigneeId` alone may be insufficient.

If historical assignment is not available, do not pretend attribution is exact.

Mark analytical limitations.

---

## Task estimate version/history

If estimates change over time and historical workload matters:

pin/retain relevant history where source domain supports it.

Do not overbuild if current Task domain has no estimate history.

---

## Planned workload resolver

Conceptually:

```text
TeamWorkloadResolver.resolvePlannedWorkload(...)
```

may combine:

* available capacity;
* ResourceAllocation;
* authorized Task workload measures.

It must expose what contributed to the result.

---

## No magic workload score

Critical.

Avoid:

```text
workloadScore = tasks*2 + overdue*5 + allocations...
```

without governed MetricDefinition/policy.

Prefer multiple transparent indicators.

---

## Utilization resolver

Conceptually:

```text
UtilizationMetricResolver
```

must clearly define the evidence.

### If based on planned allocation

call it:

> planned allocation utilization.

### If based on actual tracked effort

only use when canonical actual-effort source exists.

---

## No inferred actual time from UI activity

Absolute.

Do not calculate:

> hours worked

from:

* login duration;
* AuditEvents;
* page activity;
* message count.

---

## Delivery metrics

Use canonical MetricDefinitions.

Potential measures may include:

* completed assigned Tasks;
* on-time completion;
* overdue work;
* blocked work;
* throughput;

only where frozen Design 137 presents them and business definitions are approved.

---

## Member attribution

A Task completed by one member after reassignment from another requires an explicit attribution policy.

Do not use current assignee blindly.

---

## Shared Tasks

If Task supports multiple assignees, do not count one completion as one completion per assignee unless metric semantics intentionally do that.

---

## Team throughput

If work units are heterogeneous:

raw Task completion count should be labeled exactly that.

Do not call it universal productivity.

---

## Quality metrics

Only consume real source-domain quality/evaluation measures where they exist.

Do not derive quality from:

* number of comments;
* revision count;
* Approval rejection count;

without approved semantics.

---

## Workload vs delivery metrics

Keep two families conceptually:

```text
RESOURCE / WORKLOAD
Capacity
Availability
Allocation
Assigned workload
Overdue/blocked load

DELIVERY / PERFORMANCE
Throughput
Timeliness
Completion
Other governed delivery metrics
```

They should not be collapsed.

---

## Comparison engine

Reuse Design 135 comparison infrastructure.

---

## Team/member comparability

`AnalyticsComparisonService` should block/qualify comparisons where:

* role types differ;
* units differ;
* incomplete data differs materially;
* periods aren't comparable.

---

## Individual ranking

Do not rank named employees by a generic composite score unless the frozen design explicitly and validly defines such a metric.

Even then, it would require separate strong governance.

Default implementation should avoid it.

---

## Data Quality Resolver

Conceptually:

```text
TeamAnalyticsDataQualityResolver
```

should consider:

* capacity coverage;
* allocation coverage;
* Task assignment completeness;
* effort-estimate coverage;
* historical attribution quality;
* source availability.

---

## Example

```text
Open Tasks = 120
Effort estimate coverage = 62%
```

A workload-by-effort chart should report:

> Partial.

---

## Missing estimates ≠ zero effort

Absolute.

---

## Missing assignment ≠ unowned work automatically

There may be canonical unassigned Task state.

Use source semantics.

---

## Freshness

Internal DB-based Tasks may be near-real-time.

External availability/capacity sources may refresh differently.

Per-source freshness should be preserved.

---

## Operational attention integration

If member planned allocation exceeds policy threshold:

Design 136 may consume a derived:

> Resource over-allocation condition.

But source truth remains:

* Capacity;
* ResourceAllocation.

Do not create a manually resolved "overallocated" business entity.

---

## Correcting over-allocation

Action should delegate to:

* Design 112 ResourceAssignment/Allocation service;
* Task reassignment where appropriate.

Design 137 analytics does not directly change workforce records.

---

## Executive Analytics integration

Design 135 can query:

* Team capacity summary;
* over-allocation rate;
* workload trend;

from the same analytics service.

No duplicate formula.

---

## Activity boundary

Design 119 Activity is not a performance input by default.

---

## Audit boundary

Design 039/138 Audit is never a workload/performance metric source merely because it records actions.

Important next-design boundary:

> **More AuditEvents ≠ more productive employee.**

---

## Privacy / minimization

Team analytics queries should return only the individual-level fields required by the frozen screen.

Avoid including:

* unnecessary personal profile details;
* authentication details;
* sensitive HR data.

---

## Exports

If frozen UI supports export:

the export must carry:

* Team/member scope;
* period;
* metric definitions;
* completeness;
* provenance.

It requires explicit permission.

---

## Audit of analytics access

Do not automatically log every ordinary view as a business AuditEvent unless governance demands it.

Sensitive workforce export/administrative actions may be auditable.

---

## No write-through

Design 137 should mostly be query-only.

Any actions such as:

* reallocate;
* reassign Task;
* open Team member;

must delegate to canonical source domains.

---

## Materialized analytics

For scale, use:

* daily capacity aggregates;
* allocation interval aggregates;
* Task workload summaries;
* Team-level metric projections.

All remain rebuildable.

---

## Aggregate versioning

Aggregates should identify:

* MetricDefinition version;
* source revisions;
* period.

---

## Historical corrections

If Task history or allocation is corrected:

live historical Analytics may recalculate.

Frozen reports remain unchanged.

---

## Idempotency

Background aggregate builds are replay-safe.

---

## Concurrency

ResourceAllocation may change while analytics loads.

The projection should expose an `asOf`/revision context where needed.

Source mutation still occurs through Design 112.

---

## Caching

Team analytics cache should vary by:

```text
organizationMembershipId
authorizationScopeRevision
teamScope
period
timezone
filters
metricDefinitionVersionSet
capacityRevision
availabilityRevision
resourceAllocationRevision
taskAssignmentRevision
teamMembershipRevision
aggregateRevision
```

---

## Sensitive cache isolation

Absolute.

Do not reuse named individual workload results across users with different workforce access.

---

## Performance

Use:

* period-indexed allocations;
* TeamMembership indexes;
* Task assignment/status/due indexes;
* precomputed Team aggregates;
* batched member summaries;
* server-side pagination;
* lazy member drilldown.

Avoid one expensive query per employee card.

---

## Member row virtualization/pagination

For large organizations, do not render hundreds/thousands of member analytics rows at once.

---

## Partial failure contract

Example:

```text
Capacity             ✓
Resource allocations ✓
Task assignments     ✓
Availability source  ✕
```

Correct:

> Planned workload analytics are available, but current availability is unknown.

Incorrect:

> Full capacity available.

Another:

```text
Task assignments       ✓
Effort estimates       only 55% complete
```

Correct:

> Task-count metrics are available; effort-based workload estimates are partial.

Incorrect:

> Workload = 55%.

Another:

```text
Team aggregate        ✓
Individual analytics  restricted
```

Correct:

> Team-level analytics are available; member-level breakdown is restricted.

Not:

> No member data.

---

## Backend Requirement Matrix

| Requirement                                       | Status                                |
| ------------------------------------------------- | ------------------------------------- |
| Design 036 workforce identity reuse               | **Critical**                          |
| Design 034 Task identity reuse                    | **Critical**                          |
| Design 112 ResourceAllocation reuse               | **Critical**                          |
| Design 038/135 Metric Registry reuse              | **Critical**                          |
| No employee-performance parallel entity           | **Critical**                          |
| User/Membership/EmployeeProfile separation        | **Critical**                          |
| TeamMembership/ProjectTeamMembership separation   | **Critical**                          |
| Project delivery role/RBAC Role separation        | **Critical**                          |
| Capacity/Availability separation                  | **Critical**                          |
| Capacity/Allocation separation                    | **Critical**                          |
| Allocation/TaskAssignment separation              | **Critical**                          |
| Allocation/Utilization separation                 | **Critical**                          |
| Workload/Utilization separation                   | **Critical**                          |
| Task count/Workload separation                    | **Critical**                          |
| Estimated effort/actual effort separation         | **Critical**                          |
| No actual-utilization claim without actual source | **Critical**                          |
| Workload/Employee performance separation          | **Critical**                          |
| Throughput/Productivity separation                | **Critical**                          |
| Completion/Quality separation                     | **Critical**                          |
| Blocked work/employee failure separation          | **Critical**                          |
| Team analytics/performance review separation      | **Critical**                          |
| Audit/Activity/Productivity separation            | **Critical**                          |
| Temporal TeamMembership handling                  | **Critical for historical analytics** |
| Temporal Task assignment limitations surfaced     | **Critical**                          |
| Allocation unit/period normalization              | **Critical**                          |
| Allocation overlap handling                       | **Critical**                          |
| Peak/average allocation separation                | **Critical**                          |
| Working-calendar-aware capacity                   | **Critical where configured**         |
| Missing availability ≠ full availability          | **Critical**                          |
| Missing estimate ≠ zero effort                    | **Critical**                          |
| Canonical overdue resolver reuse                  | **Critical**                          |
| Central workload resolver                         | **Critical architecture**             |
| No magic workload score                           | **Critical**                          |
| Metric denominator/scope definitions              | **Critical**                          |
| Non-comparable Team/role metrics qualified        | **Critical**                          |
| Aggregate/member permission separation            | **Critical**                          |
| Permission before aggregation                     | **Critical**                          |
| Sensitive member-level analytics controls         | **Critical**                          |
| Cross-tenant Team analytics prohibited            | **Critical**                          |
| Authorization-aware caching                       | **Critical**                          |
| Design 136 over-allocation attention reuse        | **Critical architecture**             |
| Design 135 executive summary reuse                | **Critical architecture**             |
| Query-only analytics / source-command delegation  | **Critical**                          |
| Rebuildable analytics aggregates                  | **Critical**                          |
| Partial-data quality handling                     | **Critical**                          |
| Audit/observability separation                    | **Required**                          |

---

# 8. Consolidation

Design 137 creates substantial risk if "Team Performance" is implemented as a simplistic employee-ranking dashboard.

**Design 036 / Design 137 employee duplication**
Analytics creates a second workforce identity.

**User / EmployeeProfile conflation**
Authentication identity becomes employment identity.

**OrganizationMembership / EmployeeProfile conflation**
Tenant lifecycle and workforce profile become one object.

**TeamMembership / ProjectTeamMembership conflation**
Organizational Team and delivery Team are treated identically.

**Project delivery role / RBAC Role conflation**
Operational role becomes authorization.

**Manager relation / permission conflation**
Manager automatically sees everything.

**Capacity / Availability conflation**
Nominal working capacity appears fully usable.

**Availability / free capacity conflation**
Available time ignores allocations.

**Capacity / Allocation conflation**
Planned work becomes available resource.

**Allocation / Utilization conflation**
Planned commitment becomes actual effort.

**Workload / Utilization conflation**
Assigned work is treated as time actually spent.

**Task count / Workload conflation**
Ten small Tasks look twice as heavy as five large Tasks.

**Task count / Productivity conflation**
Raw completion count becomes employee ranking.

**Task completion / Quality conflation**
Fast completion is assumed good work.

**On-time completion / Employee performance conflation**
One operational measure becomes full evaluation.

**Blocked Task / Employee failure conflation**
External dependency becomes poor performance.

**Overdue work / Employee failure conflation**
Client/Approval/system delay becomes employee attribution.

**High workload / High performance conflation**
Overloaded staff appear more productive.

**Low workload / Poor performance conflation**
Unallocated capacity appears underperformance.

**Overallocation / Employee quality conflation**
Planning problem becomes personnel judgment.

**Throughput / Productivity conflation**
Different Task complexities are ignored.

**Revision count / Quality conflation**
Complex/client-driven work looks low-quality.

**Approval rejection / Employee quality conflation**
Review workflow is misused as performance evaluation.

**Messages sent / Productivity conflation**
Communication volume becomes performance.

**Login time / Hours worked conflation**
App presence becomes labor evidence.

**ActivityEvents / Productivity conflation**
Historical activity becomes employee score.

**AuditEvents / Productivity conflation**
Compliance evidence becomes surveillance metric.

**Notifications read / Responsiveness/performance conflation**
Inbox behavior becomes work evaluation.

**Estimated effort / Actual effort conflation**
Plan becomes time spent.

**No timesheet data / inferred actual utilization conflation**
Platform fabricates actual effort.

**Current assignee / historical attribution conflation**
Reassignment rewrites who did the work.

**Current Team / historical Team conflation**
Employee transfer rewrites old Team analytics.

**Current job title / historical role conflation**
Past work is recategorized incorrectly.

**Allocation percentage / hours conflation**
Units are summed incorrectly.

**Weekly capacity / monthly allocation conflation**
Periods are mismatched.

**Average allocation / peak allocation conflation**
Short severe overload disappears.

**Missing availability / full availability conflation**
Unknown leave/schedule information produces false capacity.

**Missing effort estimate / zero effort conflation**
Unestimated Tasks become weightless.

**No Task assignment / no work conflation**
Other canonical responsibilities disappear.

**Team total / individual detail permission conflation**
Aggregate access leaks member data.

**TeamMembership / analytics permission conflation**
Coworkers see each other's sensitive metrics.

**Manager title / sensitive analytics permission conflation**
Org chart bypasses RBAC.

**MetricDefinition / workload widget conflation**
Frontend decides workload formula.

**One `workloadScore` / structured workload indicators conflation**
Opaque ranking replaces capacity/allocation/task evidence.

**One `productivityScore` / multi-dimensional delivery analytics conflation**
Different work concepts collapse.

**Capacity score / performance score conflation**
Resource planning becomes appraisal.

**Data completeness / performance quality conflation**
Missing data makes people look better/worse.

**Restricted data / zero data conflation**
Permission boundary appears as no workload.

**Partial data / full analytics conflation**
Incomplete Task estimates produce precise workload charts.

**Comparison / ranking conflation**
Trend analysis becomes employee league table.

**Team A / Team B direct comparison conflation**
Different job functions are treated as equivalent.

**Benchmark / universal target conflation**
Unrelated roles use one expected throughput.

**Metric direction / employee grade conflation**
Higher count is always treated better.

**Overdue count / source dependency conflation**
No causal context.

**ResourceAllocation edit / analytics mutation conflation**
Design 137 starts owning staffing.

**Task reassignment / analytics action conflation**
Dashboard mutates work directly without Task service.

**Design 136 / Design 137 conflation**
Analytical workload trends become operational queue.

**Design 135 / Design 137 duplicate workforce metrics**
Executive and Team formulas diverge.

**Design 006 / Design 137 duplicate capacity logic**
Operations overview and Analytics disagree.

**Design 039/138 / Design 137 conflation**
Compliance activity becomes employee monitoring.

**Generic `employee_performance_score`**
No semantic legitimacy.

**Generic `utilization` number**
No distinction between planned and actual.

**Generic `workload_score`**
No transparent source/units.

**Generic `available_hours`**
No capacity/availability source semantics.

**Generic `tasks_completed` ranking**
Task complexity/context ignored.

**137/034 duplicate Task workload state**
Analytics becomes Task authority.

**137/036 duplicate workforce identity**
People records diverge.

**137/112 duplicate ResourceAllocation**
Staffing and analytics disagree.

**137/135 duplicate Metric Registry**
Executive and Team KPIs diverge.

**137/136 duplicate over-allocation state**
Analytics and operations create competing workload issues.

**137/138 misuse of Audit Logs**
Compliance logs become productivity telemetry.

No additional screen is required.

These are **workforce identity reuse, capacity/availability/allocation/workload/utilization separation, transparent metric semantics, historical attribution, member-level privacy, no-surveillance constraints, Team-vs-individual analytics boundaries, and strict Analytics/Operations/Audit separation requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL WORKFORCE CAPACITY, WORKLOAD, UTILIZATION & TEAM DELIVERY ANALYTICS ANCHOR**

**Domain directive:**
**User ≠ OrganizationMembership ≠ EmployeeProfile ≠ TeamMembership ≠ ProjectTeamMembership ≠ ResourceAllocation ≠ Capacity ≠ Availability ≠ TaskAssignment ≠ WorkloadObservation ≠ MetricObservation ≠ MetricAggregate ≠ TeamPerformanceProjection ≠ IndividualPerformanceEvaluation ≠ AuditEvent.**

**Workforce directive:**
Design 036 remains the single canonical workforce identity foundation. Design 137 consumes OrganizationMembership, EmployeeProfile and TeamMembership without creating analytical employee duplicates.

**Project-Team directive:**
Design 112 remains canonical ProjectTeamMembership and ResourceAllocation authority. Project delivery roles remain operational and never become RBAC roles.

**Task directive:**
Design 034 remains canonical Task/TaskAssignment authority. Design 137 consumes assignment/status/due/blocking/effort evidence without owning Task state.

**Analytics directive:**
Design 038/135 remain the canonical Metric Registry and comparison/data-quality infrastructure. Design 137 introduces no independent workforce KPI formula engine.

**Capacity directive:**
capacity represents resource potential under a defined period/calendar and remains distinct from current availability, planned allocation, assigned work and utilization.

**Availability directive:**
availability represents usable capacity according to known source data. Missing availability is `UNKNOWN`, never assumed full capacity or zero.

**Allocation directive:**
ResourceAllocation is planned capacity commitment and remains distinct from TaskAssignment and actual effort.

**Utilization directive:**
planned allocation and actual utilization are different metrics. Design 137 may call allocation-based measures “planned allocation/utilization” only when definitions are explicit.

**No-fabricated-utilization directive:**
actual utilization cannot be inferred from Task count, login duration, page activity, AuditEvent volume, messages, Notification reads, or other interaction telemetry.

**Workload directive:**
workload is a multidimensional analytical concept built from transparent canonical indicators—not an unexplained magic `workloadScore`.

**Task-count directive:**
Task count may be shown as Task count; it cannot automatically be treated as workload, complexity, productivity or employee performance.

**Estimate directive:**
Task estimates remain planned evidence and never become actual hours worked. Missing estimates remain missing, never zero effort.

**Throughput directive:**
completed-work count measures throughput under a defined scope and never becomes universal productivity across heterogeneous Tasks/roles.

**Timeliness directive:**
on-time/overdue measures require exact denominator, due-date and attribution semantics and never alone define employee performance.

**Quality directive:**
Task completion speed, revision count, Approval rejection count, communication volume and activity volume cannot be used as quality/performance proxies without explicit separately governed MetricDefinitions.

**Dependency directive:**
blocked/overdue work must preserve canonical dependency context; Client, Approval, system or Task dependencies cannot be attributed automatically as employee failure.

**Performance-review directive:**
Design 137 remains workforce operations analytics. It does not become an employee appraisal, compensation, disciplinary, ranking, or universal performance-scoring system.

**Individual-score directive:**
a named-member `productivityScore`, `performanceScore`, or composite employee ranking is prohibited unless a separate explicit canonical business capability and governed metric model exists in the frozen product.

**Team directive:**
Team-level analytics and individual-member analytics remain different access scopes. Team aggregates do not automatically grant member-level detail.

**Team-membership directive:**
historical analytics should use temporal TeamMembership/ProjectTeamMembership context where source history permits; current Team membership must not silently rewrite past analytics.

**Assignment-history directive:**
historical individual Task attribution requires suitable assignment history. Where that history is unavailable, analytics must expose uncertainty rather than fabricate precision.

**Capacity-service directive:**
one canonical `ResourceCapacityService` supplies Design 112, Design 137, and executive/operations summaries so staffing and analytics cannot disagree.

**Calendar directive:**
capacity calculations honor configured working calendars/timezones rather than assuming universal 8-hour/5-day schedules.

**Unit directive:**
capacity/allocation units and periods are normalized before arithmetic; hours, percentages, days and different period lengths cannot be summed blindly.

**Allocation-overlap directive:**
overlapping allocation intervals are calculated according to exact period overlap rather than full-period summation.

**Peak/average directive:**
peak allocation and average period allocation remain separate metrics; short periods of severe overload cannot disappear inside averages.

**Over-allocation directive:**
over-allocation is a derived planning condition from canonical capacity/allocation and never itself becomes a manually editable employee state.

**Under-allocation directive:**
under-allocation means spare planned capacity—not low employee performance.

**Metric-definition directive:**
all workforce/delivery measures reference canonical Design-038 MetricDefinitions with scope, units, aggregation behavior, calculation version and period semantics.

**Comparison directive:**
Team/member comparisons use canonical comparison services and must qualify/block comparisons between incompatible roles, work units, periods or incomplete datasets.

**No-universal-benchmark directive:**
heterogeneous Teams/roles cannot be ranked using one universal throughput/productivity benchmark without a formally valid comparable MetricDefinition.

**Completeness directive:**
capacity coverage, allocation coverage, Task assignment coverage, effort-estimate coverage and historical-attribution quality contribute to explicit data-completeness state.

**Missing-data directive:**
`Unavailable`, `Unknown`, `Partial`, `Restricted`, and numeric zero remain different facts throughout the Team analytics UI/API.

**Freshness directive:**
Team analytics preserve source `asOf/dataThrough` context and do not present stale availability/allocation data as current.

**Authorization directive:**
Team aggregate read, member-level read, capacity read, workload read, sensitive workforce analytics, drilldown and export remain independently server-authorized.

**Manager directive:**
manager relationships, job titles, Team membership and Project delivery roles never substitute for Design-037 RBAC authorization.

**Permission-before-aggregation directive:**
authorization scope is applied before member/Team totals, counts, comparisons, facets and drilldowns, preventing restricted workforce information from leaking through aggregates.

**Sensitive-dimension directive:**
individual/member-level workload and performance-adjacent data receives stricter access controls than broad organization/Team aggregates where required.

**Task-drilldown directive:**
opening a Task, Project, Client dependency or other source from analytics reauthorizes that canonical source separately.

**Export directive:**
workforce exports, if present in frozen Design 137, require separate permission and preserve period/metric/completeness semantics.

**Operations directive:**
Design 136 may consume over-allocation or workload conditions as operational attention, but operational resolution delegates to Design-112 ResourceAllocation or canonical Task/Project commands.

**Executive directive:**
Design 135 consumes high-level Team/workload KPI summaries from this same analytical foundation and never recalculates workforce metrics independently.

**Operations-dashboard directive:**
Design 006 reuses compact workload/capacity summaries rather than implementing another resource-calculation engine.

**Activity directive:**
Design 119 Activity remains historical operational context and is not treated as employee productivity evidence by default.

**Audit directive:**
Design 039 and forthcoming Design 138 remain governance/compliance evidence. Audit-event volume, login traces, configuration changes or system actions must never become default Team performance measures.

**Privacy directive:**
Design 137 returns the minimum workforce-identifying data required by the frozen analytical UI and avoids unnecessary personal/authentication/sensitive HR information.

**Write-boundary directive:**
Design 137 remains primarily analytical/read-only. Reallocation, Task reassignment, Team changes and capacity changes delegate to their canonical source services.

**Rebuildability directive:**
materialized capacity/workload/Team metric projections remain fully rebuildable from canonical workforce, Project, allocation, Task and MetricDefinition sources.

**Idempotency directive:**
background aggregate/materialization jobs are replay-safe and never mutate canonical workforce or work records.

**Concurrency directive:**
analytics queries and source actions use revisions/as-of state so changing allocations, memberships and assignments do not produce unsafe stale writes.

**Caching directive:**
workforce analytics caches include user authorization scope, Team/member scope, period/timezone, MetricDefinition versions, capacity, allocation, Task assignment and membership revisions.

**Sensitive-cache directive:**
individual workload data can never be served from a cache computed for a broader manager/executive authorization scope.

**Performance directive:**
use indexed temporal allocations/memberships, batched member workload summaries, precomputed Team aggregates, server pagination and lazy drilldowns rather than N+1 employee/task queries.

**Partial-failure directive:**
capacity, availability, allocations, Task workload and delivery metrics may fail independently. `Unavailable` can never become `0 capacity`, `fully available`, `underperforming`, `low workload`, or a clean utilization percentage without evidence.

**Future-reuse directive:**
Design **138 — System Audit Logs / Compliance Activity** must remain a canonical governance/compliance inspection surface over Design-039 AuditEvents. It must never repurpose AuditEvents into employee productivity, workload or performance scoring and must keep Audit, Activity, observability, security events and workforce analytics semantically separate.

**Overlap directive:**
Designs **006, 034, 036–039, 111–112, 135–138** must preserve one continuous **canonical workforce identity → temporal Team/Project membership → capacity/availability → ResourceAllocation + TaskAssignment → Design-038 governed MetricObservations/Aggregates → privacy-safe TeamPerformance/Workload projections → optional Design-136 attention**, while employee appraisal, Audit, Activity and security monitoring remain separate domains.

**Consolidation directive:**
**STANDARDIZE ONE TEAM PERFORMANCE & WORKLOAD ANALYTICS FOUNDATION — DESIGN-036 CANONICAL WORKFORCE IDENTITY + DESIGN-112 TEMPORAL PROJECTTEAMMEMBERSHIP/RESOURCEALLOCATION + DESIGN-034 CANONICAL TASKASSIGNMENT + ONE CAPACITY/AVAILABILITY SERVICE + DESIGN-038 METRIC REGISTRY + TRANSPARENT CAPACITY/ALLOCATION/WORKLOAD/UTILIZATION/THROUGHPUT SEPARATION + HISTORICAL ATTRIBUTION + DATA-COMPLETENESS/FRESHNESS METADATA + PERMISSION-BEFORE-AGGREGATION + MEMBER-LEVEL PRIVACY + DESIGN-135 EXECUTIVE AND DESIGN-136 OPERATIONS REUSE — AND NEVER ALLOW TASK COUNTS, AUDIT EVENTS, ACTIVITY VOLUME, LOGIN TIME, MESSAGES, NOTIFICATION READS, CURRENT ASSIGNEES, GENERIC WORKLOAD SCORES, GENERIC UTILIZATION VALUES OR JOB TITLES TO SUBSTITUTE FOR OR REWRITE CANONICAL RESOURCE, WORK, METRIC, AUTHORIZATION OR EMPLOYEE TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **137 / 153** |
| **PASS**                                   |                        **137** |
| **STANDARDIZE decisions**                  |                        **135** |
| **Potential implementation-overlap flags** |                        **128** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**137 / 153 = 89.5% audited.**

### Canonical Team workload architecture after Design 137

```text
EMPLOYEE / MEMBERSHIP
        │
        ├── Capacity
        ├── Availability
        │
        ├── Resource Allocation
        │       ↓
        │   Planned workload
        │
        └── Task Assignment
                ↓
          Current work context
                │
                ↓
          Metric Registry
            Design 038
                │
                ↓
      Team Workload Analytics
                │
      ┌─────────┼─────────┐
      ↓         ↓         ↓
   Capacity  Workload   Delivery
                │
                ↓
            Design 137
```

The strongest resource-planning distinction is now explicit:

```text
Capacity = 40h

Availability = 32h

Planned allocation = 36h

Open Tasks = 7

Actual hours worked = UNKNOWN

Therefore:

we may conclude:
planned over-allocation = 4h

we may NOT conclude:
actual utilization = 112.5%

unless canonical actual-effort
evidence exists.
```

Task volume can no longer become employee scoring:

```text
Person A:
10 completed Tasks

Person B:
5 completed Tasks

This does NOT prove:

A is twice as productive.

The Tasks may differ in:
complexity
duration
role
dependencies
project type
quality requirements
```

Blocked work also remains properly attributed:

```text
Task T-20 overdue

because:

ClientRequest CR-7
is still waiting on Client.

Correct analytics:

Task overdue
External dependency active

Incorrect analytics:

Employee failed deadline
```

And the Audit boundary is now explicitly protected:

```text
Employee A:
120 AuditEvents

Employee B:
40 AuditEvents

This tells us:

how many auditable actions/events
were recorded.

It does NOT tell us:

A is 3× more productive.

Audit activity
        ≠
workload
        ≠
performance.
```

## Next Sequential Audit Target

### **Design 138 — System Audit Logs / Compliance Activity**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
