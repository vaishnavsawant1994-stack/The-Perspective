# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 113 — Project Risks / Blockers Workspace

Design 113 should become the **canonical Team Workspace Project risk-register, active-blocker, mitigation, ownership, escalation-context, and delivery-impact surface** for identifying uncertain future threats separately from currently realized impediments to delivery.

It must build directly on the canonical Project foundation from Design 023, runtime Tasks/Milestones from Design 111, staffing/capacity from Design 112, Client Requests from Designs 047/116, Approvals from Designs 029/115, and later Project Timeline/Health projections—without converting every overdue Task, resource warning, pending approval, or client dependency into a duplicated Risk/Blocker record.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **ProjectRisk ≠ ProjectBlocker ≠ RiskAssessment ≠ RiskProbability ≠ RiskImpact ≠ RiskSeverity/Priority ≠ MitigationPlan ≠ MitigationAction ≠ Task ≠ TaskBlockState ≠ Milestone ≠ ClientRequest ≠ ApprovalRequest ≠ ResourceAllocation/CapacityWarning ≠ ProjectHealth ≠ ProjectStage ≠ ChangeRequest ≠ SystemIncident.**

The central implementation rule is:

> **A Risk represents an uncertain future condition that may affect the Project; a Blocker represents a currently realized impediment preventing or materially obstructing work. They may share UI primitives and may have lineage from Risk → Blocker when a risk materializes, but they must remain different canonical records/states. Source-domain problems—blocked Tasks, overdue Client Requests, missing Approvals, resource over-allocation, missing assets, integration failures—remain canonical in their own domains. Design 113 may reference/escalate them into Project-level risk/blocker records, but it must never duplicate or rewrite their source truth.**

---

# 1. Classification

| Audit field                       | Classification                                                                                                                                                                                                      |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                     | **113**                                                                                                                                                                                                             |
| **Canonical name**                | **Project Risks / Blockers Workspace**                                                                                                                                                                              |
| **Product area**                  | Team Workspace / Projects / Delivery Governance                                                                                                                                                                     |
| **User surface**                  | **Authenticated Team Workspace**                                                                                                                                                                                    |
| **Screen class**                  | Project Detail Variant / Risk Register / Blocker Operations Workspace                                                                                                                                               |
| **Classification**                | **Canonical Project Risk, Active Blocker, Mitigation & Delivery-Impact Anchor**                                                                                                                                     |
| **Primary purpose**               | Track uncertain Project risks separately from current blockers, preserve source evidence, assign mitigation ownership, understand delivery impact, and resolve/escalate issues without mutating source-domain state |
| **Primary parent**                | **Project** — Design 023                                                                                                                                                                                            |
| **Risk entity**                   | **ProjectRisk**                                                                                                                                                                                                     |
| **Blocker entity**                | **ProjectBlocker**                                                                                                                                                                                                  |
| **Risk evaluation**               | **RiskAssessment**                                                                                                                                                                                                  |
| **Mitigation concept**            | **MitigationPlan / mitigation metadata**                                                                                                                                                                            |
| **Mitigation execution**          | canonical **Task** where real internal work is required                                                                                                                                                             |
| **Task dependency**               | Design 111                                                                                                                                                                                                          |
| **Resource/capacity dependency**  | Design 112                                                                                                                                                                                                          |
| **Client dependency**             | ClientRequest — Design 047 / upcoming 116                                                                                                                                                                           |
| **Approval dependency**           | Design 029 / upcoming 115                                                                                                                                                                                           |
| **Files/deliverables dependency** | Design 114                                                                                                                                                                                                          |
| **Change-management boundary**    | upcoming Design 117                                                                                                                                                                                                 |
| **Timeline dependency**           | Design 118                                                                                                                                                                                                          |
| **Activity dependency**           | Design 119                                                                                                                                                                                                          |
| **Project closeout dependency**   | Design 120                                                                                                                                                                                                          |
| **System incident boundary**      | Design 147                                                                                                                                                                                                          |
| **Primary query service**         | `ProjectRiskBlockerQueryService`                                                                                                                                                                                    |
| **Risk service**                  | `ProjectRiskService`                                                                                                                                                                                                |
| **Blocker service**               | `ProjectBlockerService`                                                                                                                                                                                             |
| **Assessment service**            | `ProjectRiskAssessmentService`                                                                                                                                                                                      |
| **Impact resolver**               | `ProjectDeliveryImpactResolver`                                                                                                                                                                                     |
| **Escalation resolver**           | `ProjectRiskEscalationResolver` if policy requires                                                                                                                                                                  |
| **Parent shell**                  | `InternalAppShell` — Design 001                                                                                                                                                                                     |
| **Auth**                          | Required                                                                                                                                                                                                            |
| **Authorization**                 | Active OrganizationMembership + Project risk/blocker read/manage permissions                                                                                                                                        |
| **Implementation priority**       | **Critical Delivery Governance / Risk Evidence / Blocker Integrity**                                                                                                                                                |
| **Reuse level**                   | **High across Project 360, Operations Dashboard, Timeline, workload, closeout and reporting**                                                                                                                       |

Design 113 should answer:

> **“What could still go wrong on this Project, what is already blocking delivery now, what canonical evidence supports each item, who owns the response, what is the current probability/impact or delivery consequence, what mitigation work exists, and which items are still genuinely unresolved?”**

Canonical composition:

```text
Project PR-100
      │
      ├── ProjectRisk[]
      │      ├── RiskAssessment[]
      │      ├── mitigation context
      │      ├── owner
      │      └── source references
      │
      └── ProjectBlocker[]
             ├── source reference
             ├── delivery impact
             ├── owner
             ├── mitigation Tasks
             └── resolution evidence
                     │
          ┌──────────┼────────────┐
          ↓          ↓            ↓
        Task    ClientRequest   Approval
          │          │            │
          └──────────┼────────────┘
                     ↓
           Project Health / Timeline
                 projections
```

---

# 2. Reuse

## Design 023 remains canonical Project authority

Every Risk/Blocker must reference the exact canonical:

```text
Project.id
```

from Design 023.

Do not create:

```text
RiskProject
BlockerProject
DeliveryIssueProject
```

as parallel Project identities.

---

## Risk ≠ Project Health

Critical.

`ProjectHealth` is a derived/summary condition such as:

* healthy,
* attention needed,
* at risk,

depending on final policy.

`ProjectRisk` is a concrete governed record.

Correct:

```text
ProjectRisk R-10
        ↓
may contribute to
ProjectHealthResolver
```

Not:

```text
project.health = "risk R-10"
```

---

## ProjectRisk ≠ ProjectBlocker

This is the strongest Design 113 boundary.

### Risk

> A possible future event/condition that may harm delivery.

### Blocker

> A current realized condition actively obstructing or materially preventing delivery.

Example:

```text
Risk:
Client may delay executive photos.

Later:
photos become overdue and block design.

Risk R-10
   ↓ materializes / links
Blocker B-20
```

The Risk history remains.

Do not simply mutate Risk into Blocker and lose the original risk record unless the final physical model explicitly preserves equivalent lineage/history.

---

## One Risk does not always become a Blocker

Permanent.

A Risk may:

* never occur,
* be mitigated,
* be accepted,
* become irrelevant.

---

## One Blocker does not require a prior Risk

Permanent.

Unexpected blockers can occur directly.

---

## Blocked Task ≠ ProjectBlocker automatically

Design 111 already established Task block state.

Correct:

```text
Task T-10 = BLOCKED
```

may be sufficient for local work tracking.

Only when the issue merits Project-level governance should there be:

```text
ProjectBlocker B-10
```

possibly referencing T-10.

---

## ProjectBlocker ≠ Task block reason

Permanent.

A single ProjectBlocker may affect:

* several Tasks,
* a Milestone,
* timeline,
* Project stage readiness.

---

## Resource over-allocation ≠ ProjectBlocker automatically

Design 112's:

```text
Resource = OVERALLOCATED
```

is capacity evidence.

An explicit escalation/policy may create/link:

```text
ProjectRisk
```

or:

```text
ProjectBlocker
```

when the delivery impact justifies it.

No automatic duplicate for every capacity warning.

---

## ClientRequest remains canonical

If:

> Client images are overdue.

The canonical source remains:

```text
ClientRequest CRQ-20
```

Design 113 may create/link:

```text
Blocker B-10
source = CRQ-20
```

but must not store another independent:

```text
clientImagesReceived = false
```

truth.

---

## Approval remains canonical

If publication is blocked pending approval:

```text
ApprovalRequest A-30
```

remains the source.

Blocker resolution cannot directly set:

```text
Approval = APPROVED
```

---

## Design 114 Files/Deliverables remain canonical

Missing/damaged/unapproved deliverables can support a Risk/Blocker.

The Risk record does not become file truth.

---

## Design 116 Client dependency tracker reuses the same ClientRequest domain

Design 113 should summarize only Project-level risk/blocker impact.

Design 116 later specializes external/client dependencies.

No second client-dependency backend.

---

## Design 117 Change Request remains separate

A Risk/Blocker may reveal:

> scope must change.

That can result in a canonical `ChangeRequest`.

But:

```text
ProjectRisk
≠
ChangeRequest
```

and:

```text
ProjectBlocker
≠
ScopeChange
```

---

## Design 147 System Incident remains separate

Critical.

A platform outage may block a Project.

Canonical platform failure:

```text
SystemIncident INC-20
```

Project impact:

```text
ProjectBlocker B-30
source = INC-20
```

Do not recreate the incident as a Project-local infrastructure truth.

---

## Mitigation action ≠ Risk record

If mitigation requires real work:

> Prepare backup interview date

create/reuse canonical Task.

Correct:

```text
ProjectRisk R-10
   ↓ mitigation
Task T-50
```

The Risk record may summarize mitigation status.

Task remains runtime work.

---

# 3. Entities

## ProjectRisk

`ProjectRisk` should be a stable Project-level risk identity.

Conceptually:

```text
ProjectRisk
├── id
├── organizationId
├── projectId
├── title / description
├── category/type
├── lifecycle
├── owner/context
├── currentAssessmentId?
├── mitigation strategy/context
├── source references
├── identifiedAt
├── closedAt?
└── revision
```

Exact schema belongs to Phase 3D.

---

## Risk identity ≠ current assessment

Critical.

A Risk persists while:

* probability changes,
* impact changes,
* severity changes,
* owner changes.

Do not create a new Risk merely because its assessment changed.

---

## RiskAssessment

A separate append/history-aware assessment is strongly preferable when risk evaluation changes over time.

Conceptually:

```text
RiskAssessment
├── id
├── projectRiskId
├── probability
├── impact dimensions
├── severity/priority result
├── rationale/evidence
├── assessedBy/system
├── assessedAt
├── policy/version
└── source freshness
```

---

## Probability ≠ Impact

Absolute.

Example:

```text
Probability = High
Impact      = Low
```

differs from:

```text
Probability = Low
Impact      = Critical
```

Do not combine them prematurely into one unexplained status.

---

## Severity/Risk score

If the business computes a risk rating:

```text
RiskRatingResolver(
   probability,
   impact,
   policyVersion
)
```

should own the calculation.

Do not let frontend manually decide:

> High × Medium = 12

using duplicated formulas.

---

## Risk score ≠ probability

Permanent.

---

## Risk score ≠ impact

Permanent.

---

## Risk score ≠ Project priority

Permanent.

---

## Risk assessment history should be preserved

Example:

```text
Aug 1:
Probability HIGH
Impact HIGH

Aug 10 after mitigation:
Probability LOW
Impact HIGH
```

Do not overwrite Aug 1 and lose the historical risk trajectory.

---

## Risk status

Conceptually:

```text
IDENTIFIED
MONITORING
MITIGATING
ACCEPTED
MATERIALIZED
CLOSED
```

Exact enum belongs to Phase 3D.

Do not freeze these exact values prematurely.

The important boundary is lifecycle vs assessment.

---

## Accepted Risk ≠ Resolved Risk

Critical.

`Accepted` means:

> the business consciously accepts the exposure.

It does not mean:

> the risk no longer exists.

---

## Mitigated ≠ impossible

Permanent.

Mitigation can reduce probability/impact without closing the Risk.

---

## Materialized Risk

If Risk becomes reality:

preserve:

```text
riskId
materializedAt
blockerId?
```

rather than deleting the Risk.

---

## ProjectBlocker

First-class current impediment.

Conceptually:

```text
ProjectBlocker
├── id
├── organizationId
├── projectId
├── title / description
├── lifecycle
├── blocker type/category
├── owner
├── source references
├── startedAt
├── resolvedAt?
├── resolution evidence
├── delivery impact
└── revision
```

---

## Blocker ≠ Risk

Permanent.

---

## Blocker ≠ Task

Permanent.

---

## Blocker ≠ ClientRequest

Permanent.

---

## Blocker ≠ ApprovalRequest

Permanent.

---

## Blocker ≠ Incident

Permanent.

---

## Blocker source

Use typed references.

Conceptually:

```text
BlockerSourceReference
├── sourceType
├── sourceId
├── relationship
└── sourceRevision/freshness
```

Possible sources may include:

* Task,
* ClientRequest,
* ApprovalRequest,
* ResourceAllocation/capacity condition,
* Asset/deliverable,
* ChangeRequest,
* SystemIncident.

Do not force every Blocker to have a source entity; manually identified blockers may be legitimate.

---

## Source reference ≠ copied source state

Critical.

Design 113 should query:

```text
ClientRequest = overdue
```

rather than storing a second mutable copy:

```text
blocker.clientRequestOverdue = true
```

as canonical truth.

---

## Blocker lifecycle

Conceptually:

```text
OPEN
INVESTIGATING
MITIGATING
RESOLVED
CANCELLED / INVALIDATED
```

Exact enum Phase 3D.

---

## Blocker status ≠ source status

Example:

```text
ClientRequest = COMPLETED
ProjectBlocker = still OPEN
```

can be valid briefly if:

* downstream verification still required,
* work remains obstructed for another reason.

Resolution should be explicit or policy-driven.

---

## Resolved Blocker ≠ source deleted

Permanent.

---

## Resolution evidence

Blocker resolution should preserve:

* resolvedAt,
* resolvedBy/system,
* reason,
* source condition/evidence,
* optional linked Task/Request outcome.

---

## Reopened Blocker

If a resolved condition recurs:

support explicit reopen/new recurrence semantics according to policy.

Do not silently erase prior resolution.

---

## MitigationPlan

A Risk may have structured mitigation context such as:

```text
MitigationPlan
├── strategy
├── owner
├── planned actions
├── target date
└── state
```

It may be embedded or first-class depending final requirements.

Do not over-model unless persistent independent lifecycle is needed.

---

## MitigationPlan ≠ Task list

Critical.

If actual work must be executed, use canonical Tasks.

The plan may link them.

---

## MitigationAction

Prefer:

```text
Risk/Blocker
      ↓
Task
```

rather than another generic action entity when the action is internal work.

---

## Risk owner / Blocker owner

Operational responsibility only.

Owner ≠ authorization.

Owner ≠ Project owner.

Owner ≠ Task assignee necessarily.

---

## Delivery impact

Do not collapse Project impact into only one severity.

Useful conceptual impact dimensions may include:

* timeline,
* scope,
* quality,
* cost,
* client dependency,

if the frozen model needs them.

Phase 3A.1 should not invent visible fields.

Backend should preserve the ability to reason about typed impact rather than one overloaded status.

---

## ProjectHealth

Derived projection.

Conceptually:

```text
ProjectHealthResolver
   ├── open critical risks
   ├── active blockers
   ├── overdue critical Tasks
   ├── missed Milestones
   ├── resource constraints
   └── other canonical signals
```

Design 113 supplies inputs.

It does not own health directly.

---

## Risk count ≠ Project health

Permanent.

Ten low-level Risks can be less serious than one critical Blocker.

---

# 4. Permissions

Design 113 should conceptually distinguish:

```text
projectRisk.read
projectRisk.create
projectRisk.edit
projectRisk.assess
projectRisk.close
projectRisk.accept
projectRisk.manageMitigation

projectBlocker.read
projectBlocker.create
projectBlocker.edit
projectBlocker.resolve
projectBlocker.reopen

projectRisk.override
```

Exact permission names belong to Phase 3D.

---

## Project read ≠ Risk management

Permanent.

---

## Risk create ≠ Risk close

Potentially separate.

---

## Risk assessment ≠ Risk acceptance

Critical.

Accepting a major Risk may require stronger authority than recording an assessment.

---

## Risk owner ≠ acceptance authority

Permanent.

---

## Blocker owner ≠ resolution authority universally

Depending on governance, owner may work the issue while another role verifies resolution.

---

## Risk/Blocker edit ≠ source-domain mutation

Absolute.

A user with:

```text
projectBlocker.resolve
```

cannot thereby:

* approve an ApprovalRequest,
* complete a ClientRequest,
* reassign a resource,
* close a SystemIncident.

---

## Mitigation Task creation uses Task permissions/service

Design 113 cannot bypass Task authorization.

---

## Source-resource read reauthorizes

A user may see:

> Blocker exists

without permission to see every sensitive detail of the source resource.

Section/field-level safe projections are required.

---

## Sensitive source evidence

Examples:

* finance issue,
* HR capacity issue,
* private client communication,

may need redacted blocker summaries.

---

## Risk acceptance/override requires actor/reason

If supported:

* exact Risk,
* current revision,
* actor,
* rationale,
* effective scope/time.

No anonymous bypass.

---

## Direct Risk ID reauthorizes

Permanent.

---

## Direct Blocker ID reauthorizes

Permanent.

---

## Cross-tenant source references prohibited

Absolute.

---

## Cross-Project blocker linkage requires policy

A single external/system issue may affect multiple Projects.

Preferred architecture:

* canonical source Incident/Issue,
* separate ProjectBlocker references per impacted Project or safe cross-project impact relation.

Do not simply attach one Project's Blocker record to another Project without explicit model.

---

# 5. States

Design 113 must keep **Risk lifecycle, Risk Assessment, probability, impact, mitigation state, Blocker lifecycle, source state, due/escalation condition, and Project Health** independent.

### Risk lifecycle

Conceptually:

```text
Identified
Monitoring
Mitigating
Accepted
Materialized
Closed
```

### Probability

Conceptually:

```text
Low
Medium
High
Unknown
```

Exact scales Phase 3D.

### Impact

Conceptually:

```text
Low
Medium
High
Critical
Unknown
```

Exact taxonomy Phase 3D.

### Mitigation

```text
Not Planned
Planned
In Progress
Completed
Ineffective / Needs Review
Unknown
```

### Blocker lifecycle

```text
Open
Investigating
Mitigating
Resolved
Reopened
Cancelled / Invalidated
```

### Source state

Owned by the source domain.

These must never collapse into one generic `risk.status`.

---

## High probability ≠ high impact

Permanent.

---

## High Risk score ≠ Project Blocked

Permanent.

A serious Risk may not yet have materialized.

---

## Materialized ≠ resolved

Permanent.

---

## Materialized Risk ≠ Blocker automatically in every case

A risk may materialize into:

* cost impact,
* scope change,
* quality consequence,

without becoming an active blocker.

Use explicit lineage/policy.

---

## Blocker open ≠ Task blocked

Permanent.

---

## Source completed ≠ Blocker resolved automatically universally

Critical.

Resolution must respect blocker-specific policy/evidence.

---

## Blocker resolved ≠ Risk closed

Permanent.

A Risk might remain relevant after one blocker is resolved.

---

## Risk accepted ≠ closed

Permanent.

---

## Mitigation completed ≠ Risk closed

Permanent.

A completed mitigation may reduce but not eliminate exposure.

---

## Risk closed ≠ historical record deleted

Absolute.

---

## Blocker resolved ≠ historical record deleted

Absolute.

---

## Resource availability unknown ≠ staffing Risk absent

Critical.

---

## Approval service unavailable ≠ approval blocker resolved

Absolute.

---

## ClientRequest unavailable ≠ no client blocker

Absolute.

---

## Project health red ≠ blocker lifecycle

Permanent.

---

## State Coverage

Design 113 inherits Design 150 plus:

```text
Risk Workspace Loading
Risk Workspace Available
Risk Workspace Empty
Risk Workspace Restricted
Risk Workspace Partial

Risk Identified
Risk Monitoring
Risk Mitigating
Risk Accepted
Risk Materialized
Risk Closed

Risk Probability Low
Risk Probability Medium
Risk Probability High
Risk Probability Unknown

Risk Impact Low
Risk Impact Medium
Risk Impact High
Risk Impact Critical
Risk Impact Unknown

Mitigation Not Planned
Mitigation Planned
Mitigation In Progress
Mitigation Completed
Mitigation Needs Review
Mitigation Unknown

Blocker Open
Blocker Investigating
Blocker Mitigating
Blocker Resolved
Blocker Reopened
Blocker Invalidated

Blocker Source Available
Blocker Source Restricted
Blocker Source Unavailable
Blocker Source Changed

Task Source Blocked
Client Dependency Pending
Approval Dependency Pending
Resource Constraint Active
System Incident Active

Risk Assessment Stale
Risk Assessment Unavailable

Project Impact Available
Project Impact Unknown
Project Health Available
Project Health Unavailable

Risk Updated Elsewhere
Blocker Updated Elsewhere
Source State Updated Elsewhere
Risk/Blocker Conflict
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize **Risk vs Blocker distinction, impact, owner, and evidence**.

Conceptually:

```text
Project Risks / Blockers
↓
Risk register
   ├── Risk
   ├── probability
   ├── impact
   ├── mitigation
   └── owner

Active blockers
   ├── Blocker
   ├── source
   ├── delivery impact
   ├── owner
   ├── mitigation/action
   └── resolution state
```

Only elements actually present in frozen Design 113 should render.

---

## Risks and Blockers must remain visually distinct

Do not present both as identical generic “issues.”

A user should understand:

> **Risk — may happen**

versus:

> **Blocker — happening now**

---

## Probability and impact should not collapse into one badge

If frozen design exposes them:

> Probability: High
> Impact: Medium

is preferable to:

> Status: High.

A computed rating can appear separately.

---

## Source evidence should remain visible where useful

Example:

> Blocked by Client Request CRQ-20 — photos overdue

rather than duplicating the Request's state inside the blocker form.

---

## Mitigation status should not look like Risk lifecycle

Correct:

> Risk: Monitoring
> Mitigation: In progress

Two separate dimensions.

---

## Tablet

Following Design 152:

* Risk/Blocker cards stack,
* probability/impact remain explicit,
* owner/mitigation metadata compress,
* source detail can collapse,
* resolution actions remain touch-safe.

---

## Mobile

Priority:

```text
Risks
↓
highest-impact/current concerns
↓
owner
↓
probability + impact
↓
mitigation

Blockers
↓
what is blocked now
↓
source
↓
owner
↓
resolution action
```

Avoid dense matrix/table compression.

---

## Mobile source safety

If source details are restricted:

show:

> Restricted dependency

rather than exposing sensitive information or pretending the blocker has no source.

---

## Accessibility

A Risk could communicate:

> Risk R-12, client photography may arrive late. Probability high, impact medium. Mitigation is in progress and owned by Maya.

A Blocker could communicate:

> Blocker B-8, design work is currently blocked by client photo request CRQ-20. The request is overdue. Blocker is open and owned by Alex.

where authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical risk/blocker architecture

```text
Design 113
    ↓
Authenticated Workspace Context
    ↓
ProjectRiskBlockerQueryService
    │
    ├── ProjectAdapter
    ├── ProjectRiskAdapter
    ├── RiskAssessmentAdapter
    ├── ProjectBlockerAdapter
    ├── TaskAdapter
    ├── ClientRequestAdapter
    ├── ApprovalAdapter
    ├── ResourceCapacityAdapter
    ├── Asset/DeliverableAdapter
    ├── ChangeRequestAdapter
    ├── IncidentAdapter
    └── ProjectImpact/HealthResolver
    ↓
ProjectRiskBlockerView
```

Mutations remain typed Risk/Blocker commands.

---

## Create Risk command

Conceptually:

```text
createProjectRisk(
    projectId,
    riskInput,
    initialAssessment?,
    expectedProjectRevision,
    idempotencyKey
)
```

should:

1. authenticate/authorize;
2. validate Project/tenant;
3. validate typed source references if present;
4. create Risk identity;
5. create initial RiskAssessment if supplied;
6. establish owner;
7. emit Audit/outbox.

---

## Risk creation idempotency

Retry must not duplicate the same explicitly submitted Risk.

Do not over-aggressively dedupe unrelated risks based only on similar titles.

---

## Risk assessment command

Conceptually:

```text
assessProjectRisk(
    riskId,
    probability,
    impact,
    rationale,
    expectedRiskRevision,
    idempotencyKey
)
```

should preserve a new assessment/history entry rather than overwrite the prior assessment where historical evaluation matters.

---

## Assessment policy version

If probability/impact→rating rules evolve:

pin the relevant:

```text
RiskAssessmentPolicyVersion
```

or equivalent.

Historical ratings remain explainable.

---

## Rating resolver

Use centralized:

```text
ProjectRiskRatingResolver
```

Do not duplicate risk-score formula in:

* Design 113,
* Dashboard 006,
* Analytics,
* Reports.

---

## Unknown values

Risk rating must support:

```text
UNKNOWN
```

if probability/impact are not assessable.

Do not substitute zero.

---

## Accept Risk command

If supported:

```text
acceptProjectRisk(
    riskId,
    reason,
    expectedRevision
)
```

requires appropriate authority and preserves exposure.

It does not mark the Risk resolved.

---

## Close Risk command

Should verify the lifecycle transition under policy.

Closure reason may distinguish:

* no longer applicable,
* mitigated sufficiently,
* passed without occurring,
* materialized into another record.

Exact taxonomy Phase 3D.

---

## Materialize Risk

If a Risk becomes an actual Blocker:

conceptually:

```text
materializeRiskAsBlocker(
    riskId,
    blockerInput,
    expectedRiskRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. preserve Risk;
3. create/link one canonical ProjectBlocker;
4. record materialization lineage;
5. prevent duplicate materialization retry;
6. emit events.

---

## Do not mutate Risk ID into Blocker ID

Critical.

Separate identities preserve:

* prospective history,
* actual delivery impact history.

---

## Create Blocker command

Conceptually:

```text
createProjectBlocker(
    projectId,
    sourceReference?,
    impact,
    owner,
    expectedProjectRevision,
    idempotencyKey
)
```

validates tenant/source and creates Project-level governance record.

---

## Source dedupe

If blocker is source-driven:

repeated automation should not create many blockers for the same active source/purpose.

Use a stable relation such as:

```text
projectId
+ sourceType
+ sourceId
+ blockerPurpose
```

where appropriate.

---

## But source reuse is policy-aware

The same ClientRequest could potentially:

* affect multiple Projects,
* create separate blocker contexts.

Do not make global `sourceId UNIQUE`.

---

## Blocker source adapter

Use typed source adapters such as:

```text
TaskBlockerSourceAdapter
ClientRequestBlockerSourceAdapter
ApprovalBlockerSourceAdapter
ResourceConstraintSourceAdapter
AssetBlockerSourceAdapter
SystemIncidentSourceAdapter
```

They return safe current source state/freshness.

---

## Source state remains authoritative

If:

```text
ClientRequest completes
```

the Blocker service re-evaluates.

It does not patch ClientRequest from the Blocker side.

---

## Automatic blocker resolution

Do not assume universally.

For some blocker types:

```text
source satisfied
→ blocker eligible to resolve
```

For others:

human verification may still be required.

Use typed policy.

---

## Resolve Blocker command

Conceptually:

```text
resolveProjectBlocker(
    blockerId,
    expectedRevision,
    resolutionReason/evidence,
    idempotencyKey
)
```

should:

1. authorize;
2. load current blocker/source context;
3. validate resolution policy;
4. record actor/time/evidence;
5. preserve prior history;
6. emit `ProjectBlockerResolved`;
7. invalidate Project health/timeline projections.

---

## Resolution idempotency

Critical.

---

## Reopen Blocker

If supported:

use explicit command/history.

Never just clear:

```text
resolvedAt = null
```

without evidence.

---

## Mitigation Task creation

Conceptually:

```text
TaskService.create(
   projectId,
   risk/blocker context,
   ...
)
```

Risk/Blocker retains typed linkage.

Do not create:

```text
RiskAction
```

as a duplicate Task for real internal work unless a genuinely distinct non-work planning concept is required.

---

## Mitigation Task completion ≠ Risk resolved

Critical.

After Task completes:

Risk must be reassessed or closure policy evaluated.

---

## Escalation

If escalation rules are present:

use typed policy such as:

```text
RiskEscalationPolicy
```

based on:

* rating,
* duration,
* blocker age,
* Project impact.

Do not hard-code alerts from UI colors.

---

## Escalation ≠ authorization

A high-severity Risk notification does not grant the recipient access to restricted Project/source data.

---

## Project Health integration

Design 023/006 may call:

```text
ProjectHealthResolver
```

which consumes:

* active Risk ratings,
* Blockers,
* missed Milestones,
* delivery/other signals.

Design 113 should not directly set:

```text
project.health = RED
```

as a side effect of adding a Risk.

---

## Timeline integration

Design 118 can visualize:

* Risk identified date,
* mitigation target,
* Blocker start/resolution,

as projections.

Timeline edits cannot rewrite Risk/Blocker identity directly.

---

## Task integration

Blocked Tasks remain Design 111 truth.

When Task is unblocked:

source-driven blocker may re-evaluate.

No reverse mutation of Task from blocker resolution.

---

## Resource integration

Design 112 capacity/overallocation remains canonical.

If it causes Project risk:

link current resource-condition evidence.

Do not copy global workload fields into Risk as authoritative values.

---

## Client dependency integration

Design 116 later specializes ClientRequests/dependencies.

Design 113 consumes their state for risk/blocker impact only.

---

## Approval integration

Design 115 later specializes Project approval gates.

Design 113 consumes canonical Approval state.

---

## Change Request integration

When blocker/risk leads to scope adjustment:

create/link canonical Design 117 ChangeRequest.

Do not rewrite Project scope inside Risk service.

---

## System Incident integration

If platform/service Incident affects Project:

link Design 147 Incident.

Closing the Project Blocker does not close the global Incident.

Likewise resolving the Incident may make the Project Blocker eligible for resolution.

---

## Risk/Blocker ↔ Task source loop prevention

Be careful with circular semantic creation:

```text
Risk creates mitigation Task
Task blocked creates another identical Blocker
Blocker creates another mitigation Task
```

Use source lineage/purpose keys and policy to prevent uncontrolled feedback loops.

---

## Optimistic concurrency

Risk/Blocker:

* assessment,
* ownership,
* acceptance,
* resolution,
* reopen

must use expected revisions.

---

## Parallel resolution

Two users cannot independently resolve the same blocker with conflicting evidence through last-write-wins.

---

## Bulk actions

If frozen Design 113 contains bulk risk/blocker changes:

each item still requires authorization and transition validation.

Return per-item outcomes.

---

## Events/outbox

Useful events:

```text
ProjectRiskCreated
ProjectRiskAssessed
ProjectRiskAccepted
ProjectRiskMaterialized
ProjectRiskClosed

ProjectBlockerCreated
ProjectBlockerResolved
ProjectBlockerReopened
```

---

## Activity

Design 119 can project those events.

Activity remains observational.

---

## Audit

Material actions should capture:

* Risk creation,
* material assessment changes,
* Risk acceptance/closure,
* Blocker creation,
* owner changes,
* exceptional override,
* resolution/reopen,
* mitigation links.

---

## Notifications

Design 080 may notify:

* high-risk assessment,
* new Project Blocker,
* blocker unresolved beyond threshold,
* Risk materialized.

Notification read state never changes Risk/Blocker lifecycle.

---

## My Work

If Risk/Blocker ownership creates actionable work:

prefer canonical Tasks or a typed actionable projection.

Do not make every Risk itself a generic Task.

---

## Search

Design 079 may index safe:

* Risk title,
* Blocker title,
* Project context,
* lifecycle/rating summary,

subject to permissions.

Search never becomes assessment or resolution authority.

---

## Caching

Risk/Blocker view caches should vary by:

```text
organizationMembershipId
projectId
authorizationRevision
projectRevision
riskRevision aggregate
riskAssessmentRevision
blockerRevision aggregate
source-domain revisions/freshness
health projection revision
```

---

## Source-aware cache invalidation

Examples:

```text
ClientRequestCompleted
ApprovalResolved
TaskUnblocked
ResourceAllocationChanged
IncidentResolved
```

should invalidate relevant blocker/impact projections.

---

## Performance

Use:

* Project-scoped Risk/Blocker indexes,
* latest assessment pointers or efficient history query,
* batched source-reference resolution by type,
* aggregate Risk/Blocker summaries,
* lazy assessment/resolution history.

Avoid N+1 calls to each source domain for every row.

---

## Partial failure contract

Example:

```text
Project core          ✓
Risks                 ✓
Blockers              ✓
Tasks                 ✓
ClientRequest service ✕
Approval service      ✓
Resource capacity     ✓
```

Correct:

> Project risks/blockers available. Client-request-backed blocker source state is currently unavailable.

Incorrect:

> Client blocker resolved.

or:

> Client request still pending.

Another example:

```text
Risk records          ✓
Risk assessment svc   ✕
```

show:

> Current assessment unavailable

not:

> Low risk.

---

## Backend Requirement Matrix

| Requirement                                       | Status                        |
| ------------------------------------------------- | ----------------------------- |
| Canonical Project reuse from 023                  | **Critical**                  |
| ProjectRisk/ProjectBlocker separation             | **Critical**                  |
| Risk prospective/Blocker current-state separation | **Critical**                  |
| Risk identity/RiskAssessment separation           | **Critical**                  |
| Probability/impact separation                     | **Critical**                  |
| Risk rating centrally derived                     | **Critical if rating exists** |
| Assessment history retention                      | **Critical**                  |
| Assessment policy/version awareness               | **Critical**                  |
| Accepted/closed Risk separation                   | **Critical**                  |
| Mitigated/closed separation                       | **Critical**                  |
| Risk materialization lineage                      | **Critical**                  |
| Risk→Blocker idempotency                          | **Critical**                  |
| Blocker/source record separation                  | **Critical**                  |
| Source state not duplicated                       | **Critical**                  |
| Task blocked/ProjectBlocker separation            | **Critical**                  |
| Resource warning/ProjectBlocker separation        | **Critical**                  |
| ClientRequest/ProjectBlocker separation           | **Critical**                  |
| ApprovalRequest/ProjectBlocker separation         | **Critical**                  |
| SystemIncident/ProjectBlocker separation          | **Critical**                  |
| ChangeRequest/Risk-Blocker separation             | **Critical**                  |
| Typed source references/adapters                  | **Critical**                  |
| Source freshness/unavailable state                | **Critical**                  |
| Source outage/resolved separation                 | **Critical**                  |
| Manual/source-driven Blocker support              | **Critical**                  |
| Blocker resolution policy                         | **Critical**                  |
| Blocker resolution idempotency                    | **Critical**                  |
| Reopen preserves history                          | **Critical if supported**     |
| Mitigation plan/Task separation                   | **Critical**                  |
| Mitigation Task reuse from 034                    | **Critical**                  |
| Task completion/Risk closure separation           | **Critical**                  |
| Owner/authorization separation                    | **Critical**                  |
| Risk acceptance elevated permission               | **Critical if supported**     |
| ProjectHealth/Risk-Blocker separation             | **Critical**                  |
| Timeline projection/runtime entity separation     | **Critical**                  |
| Design 114 source reuse                           | **Critical architecture**     |
| Design 115 approval reuse                         | **Critical architecture**     |
| Design 116 dependency reuse                       | **Critical architecture**     |
| Design 117 ChangeRequest reuse                    | **Critical architecture**     |
| Design 118 timeline reuse                         | **Critical architecture**     |
| Design 119 Activity reuse                         | **Critical architecture**     |
| Design 120 closeout separation                    | **Critical architecture**     |
| Design 147 Incident separation                    | **Critical architecture**     |
| Optimistic concurrency                            | **Critical**                  |
| Source-loop/duplicate escalation prevention       | **Critical**                  |
| Cross-tenant source links prohibited              | **Critical**                  |
| Permission-safe source summaries                  | **Critical**                  |
| Audit/outbox integration                          | **Required**                  |
| Partial dependency failure handling               | **Critical**                  |

---

# 8. Consolidation

Design 113 creates substantial risk of turning every warning, delay, Task problem, or system condition into one generic Project “issue.”

**ProjectRisk / ProjectBlocker conflation**
Possible future threat and current impediment become indistinguishable.

**Risk / Project Health conflation**
One record becomes a summary score.

**Blocker / Project Health conflation**
Project status becomes the blocker itself.

**Risk / RiskAssessment conflation**
Changing probability rewrites risk identity.

**Risk probability / impact conflation**
Two different dimensions become one vague severity.

**Risk rating / probability conflation**
Computed result replaces evidence.

**Risk rating / Project priority conflation**
Risk level changes delivery priority automatically.

**Risk assessment overwrite / assessment history conflation**
Cannot explain why risk changed.

**Risk accepted / Risk resolved conflation**
Business acceptance makes exposure disappear.

**Mitigation completed / Risk closed conflation**
Completed action falsely proves no remaining risk.

**Risk materialized / Risk deleted conflation**
Prospective history disappears once problem occurs.

**Materialized Risk / Blocker identity conflation**
One ID changes meaning mid-lifecycle.

**Every Risk / eventual Blocker conflation**
Non-occurring risks cannot be represented.

**Unexpected Blocker / missing Risk error conflation**
Unforeseen problems cannot be logged.

**Task blocked / ProjectBlocker conflation**
Every local dependency floods Project blocker register.

**Task block reason / Blocker entity conflation**
Task UI becomes project-level issue system.

**Blocker / Task conflation**
Current impediment and mitigation work merge.

**MitigationPlan / Task conflation**
Planning and execution become the same record.

**Mitigation Task complete / Blocker resolved conflation**
More verification may be required.

**Milestone missed / Blocker conflation**
Schedule outcome becomes active blocker automatically.

**Overdue Task / Risk conflation**
Late work becomes duplicate risk record automatically.

**Resource overallocation / Blocker conflation**
Capacity warning automatically creates formal Project blocker.

**Resource workload / Risk score conflation**
Heavy staffing load becomes Project risk without policy.

**ClientRequest / Blocker conflation**
External obligation becomes project issue identity.

**ClientRequest completed / Blocker auto-resolved conflation**
Other impact may remain.

**ApprovalRequest / Blocker conflation**
Formal approval state is duplicated.

**Blocker resolution / Approval mutation conflation**
Project manager can manufacture approval.

**Asset missing / Blocker state conflation**
File library truth duplicated.

**ChangeRequest / Risk conflation**
Scope-change workflow becomes risk record.

**ChangeRequest / Blocker resolution conflation**
Approving scope change automatically closes blocker without policy.

**SystemIncident / ProjectBlocker conflation**
Global platform failure duplicated per Project as separate incident truth.

**Project Blocker resolved / System Incident resolved conflation**
Project-specific mitigation closes global incident.

**Source reference / copied source state conflation**
Blocker drifts from canonical Task/Approval/Request.

**Source unavailable / resolved conflation**
Dependency outage causes false closure.

**Source unavailable / pending conflation**
Infrastructure failure is blamed on client/team.

**Source restricted / source absent conflation**
Unauthorized user sees misleading “no source.”

**Blocker open / Task blocked conflation**
Different lifecycles become synchronized incorrectly.

**Risk owner / Project owner conflation**
Risk responsibility changes Project ownership.

**Risk owner / authorization conflation**
Owner gains permission to accept or close.

**Blocker owner / source-resource authority conflation**
Owner can mutate Approval/ClientRequest/Incident.

**Risk acceptance / ordinary edit conflation**
Any editor can accept major exposure.

**Blocker resolution / ordinary edit conflation**
User can declare business impact gone without evidence.

**Risk category / impact conflation**
Type of risk becomes severity.

**Impact / probability conflation**
Potential magnitude and likelihood collapse.

**Impact / actual Project delay conflation**
Expected consequence becomes observed timeline fact.

**ProjectHealth / count of open Risks conflation**
Ten low risks score worse than one critical blocker accidentally.

**Risk count / progress conflation**
Project completion percentage changes from issue count.

**Project stage / blocker lifecycle conflation**
Entering a stage automatically clears blockers.

**Project stage transition / risk acceptance conflation**
Workflow action changes governance state.

**Timeline event / Risk record conflation**
Gantt marker becomes source truth.

**Timeline drag / Risk date mutation conflation**
Visualization bypasses Risk service.

**ActivityEvent / Risk state conflation**
Timeline string replaces canonical lifecycle.

**AuditEvent / assessment evidence conflation**
Audit log becomes risk register.

**Notification / escalation conflation**
Reading alert marks risk reviewed.

**Notification / Blocker state conflation**
Dismissing alert resolves blocker.

**My Work entry / Risk conflation**
Risk itself becomes generic Task.

**Risk mitigation feedback loop**
Risk creates Task → blocked Task creates same blocker → blocker creates same Task repeatedly.

**Duplicate blocker by source callback**
One overdue request creates multiple active blockers.

**Global source uniqueness / Project context conflation**
One source cannot affect several Projects correctly.

**Cross-tenant source linking**
Risk references another tenant's Task/Request/Incident.

**Generic Project Issue entity**
Risk, Blocker, Incident, Task and ChangeRequest lose semantic boundaries.

**Generic `status` field**
Risk lifecycle, probability, impact, mitigation and blocker state collapse.

**Generic Risks mega-PATCH**
Assessment, source-domain state, Project health and resolution can be overwritten together.

**113/111 duplicate Task blocker state**
Task and Risk workspace disagree about work blockers.

**113/112 duplicate capacity truth**
Risk register stores another resource-allocation model.

**113/114 duplicate deliverable/file state**
Missing asset state copied into blockers.

**113/115 duplicate approval state**
Risk workspace owns approvals.

**113/116 duplicate client dependency state**
Risk workspace owns ClientRequests.

**113/117 duplicate scope-change state**
Risk record becomes ChangeRequest.

**113/118 duplicate timeline state**
Risk dates become separate schedule truth.

**113/119 duplicate activity truth**
Risk history exists only as Activity strings.

**113/120 duplicate Project completion logic**
“No blockers” automatically completes Project.

**113/147 duplicate Incident backend**
System outages are recreated as project incidents.

No additional screen is required.

These are **Risk vs Blocker identity, time-oriented uncertainty vs current impediment, assessment history, typed source linkage, mitigation, ownership, impact, source-domain reuse, Project-health separation, concurrency and evidence requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PROJECT RISK, ACTIVE BLOCKER, MITIGATION & DELIVERY-IMPACT ANCHOR**

**Domain directive:**
**ProjectRisk ≠ ProjectBlocker ≠ RiskAssessment ≠ RiskProbability ≠ RiskImpact ≠ RiskSeverity/Priority ≠ MitigationPlan ≠ MitigationAction ≠ Task ≠ TaskBlockState ≠ Milestone ≠ ClientRequest ≠ ApprovalRequest ≠ ResourceAllocation/CapacityWarning ≠ ProjectHealth ≠ ProjectStage ≠ ChangeRequest ≠ SystemIncident.**

**Project directive:**
Design 023 remains authoritative for Project identity, lifecycle, workflow stage, health and readiness. Design 113 contributes risk/blocker evidence but never becomes another Project-state backend.

**Risk directive:**
`ProjectRisk` represents uncertain future exposure. It remains a stable identity while its probability, impact, owner, mitigation and current assessment change over time.

**Blocker directive:**
`ProjectBlocker` represents a currently realized delivery impediment. It remains distinct from Risk, Task blocked state, ClientRequest, Approval, resource warning and Incident.

**Risk/blocker directive:**
Risk and Blocker may have explicit lineage—such as Risk materializing into a Blocker—but never change identity silently or erase prospective history.

**Unexpected-blocker directive:**
a Blocker may be created without a pre-existing Risk. The model must support unforeseen delivery problems.

**Assessment directive:**
Risk probability and impact remain separately captured through historical `RiskAssessment` records or equivalent append-oriented semantics.

**Rating directive:**
if a risk rating/severity score exists, one central resolver computes it under a versioned policy. Probability, impact, score, Project priority and Project health are never synonyms.

**Assessment-history directive:**
reassessment preserves prior evaluations so the system can explain whether mitigation reduced likelihood/impact over time.

**Acceptance directive:**
Risk acceptance is an explicit governed business decision with actor/reason and does not mean the Risk disappeared or was resolved.

**Mitigation directive:**
mitigation state remains independent from Risk lifecycle. Completing a mitigation does not automatically close the Risk without reassessment/policy.

**Materialization directive:**
when Risk becomes actual, preserve the Risk and create/link the appropriate Blocker/Change/impact record idempotently rather than mutating the Risk into another entity type.

**Task directive:**
Design 111/034 remain authoritative for Tasks and Task blocked state. Project-level Blockers may reference Tasks but never duplicate their lifecycle or completion.

**Mitigation-work directive:**
actual internal mitigation work should reuse canonical Tasks. Design 113 may own mitigation strategy/context but not another generic work-management backend.

**Client-dependency directive:**
Designs 047/116 remain authoritative for ClientRequests. Design 113 can reference overdue/pending client dependencies as risk/blocker evidence without copying their state.

**Approval directive:**
Designs 029/115 remain authoritative for ApprovalRequests and decisions. Resolving a Blocker cannot manufacture an Approval outcome.

**Resource directive:**
Design 112 remains authoritative for Project staffing, capacity and allocation. Over-allocation is evidence that can influence Risk/Blocker assessment, not automatically the same entity.

**Asset directive:**
Design 114 remains authoritative for files/deliverables. Missing or invalid assets can support a Blocker without creating duplicate file-state truth.

**Change directive:**
Design 117 remains authoritative for scope/change requests. A Risk/Blocker may cause a ChangeRequest, but approval/rejection of scope change stays in that domain.

**Incident directive:**
Design 147 remains authoritative for platform/system Incidents. A ProjectBlocker can reference an Incident's impact while preserving separate Project-specific and global incident lifecycles.

**Source-reference directive:**
Risks/Blockers use typed canonical source references with permission/freshness-aware adapters. Source domain state is queried, not manually recopied into independent booleans.

**Unknown-source directive:**
source outages/restrictions become `Unavailable/Unknown`, never false `Resolved`, false `Pending`, or false absence.

**Resolution directive:**
Blocker resolution is an explicit authorized, revision-safe, idempotent action backed by current evidence/policy. It never rewrites the source Task, Approval, Request, resource allocation or Incident.

**Reopen directive:**
if Blockers/Risks can reopen, prior resolution/closure remains historical evidence rather than being erased.

**Ownership directive:**
Risk/Blocker ownership represents operational responsibility only. It does not grant Risk acceptance, source-domain mutation, Project administration or RBAC permissions.

**Authorization directive:**
Risk creation, assessment, acceptance, closure, Blocker creation, resolution, reopen and exceptional override remain independently server-authorized.

**Impact directive:**
delivery impact is distinct from probability, Risk lifecycle and Project health. If multiple impact dimensions are supported, they must remain typed rather than collapsing into a vague status.

**Health directive:**
ProjectHealth is a centralized derived projection that may consume Risks/Blockers alongside Tasks, Milestones, resources and other signals. Design 113 never directly writes health as a side effect.

**Timeline directive:**
Design 118 may project Risk/Blocker dates, but timeline objects remain visualization/read models. Timeline mutations must call Risk/Blocker services where allowed.

**Activity directive:**
Design 119 may project risk/blocker history, but Activity remains observational and never substitutes for assessments, materialization or resolution records.

**Closeout directive:**
Design 120 remains authoritative for Project completion. Having zero open Blockers or closed Risks is only one possible closeout input and never automatically completes the Project.

**Idempotency directive:**
Risk creation requests, assessments, Risk→Blocker materialization, source-driven Blocker generation, resolution, reopen and mitigation Task creation must be replay-safe.

**Duplicate-source directive:**
automatic blocker creation uses Project + source + purpose lineage where appropriate so one source event cannot create repeated active duplicate Blockers, while still allowing one source to legitimately affect multiple Projects.

**Feedback-loop directive:**
Risk/Blocker/source automation must preserve origin/purpose lineage to prevent uncontrolled loops such as Risk → mitigation Task → blocked Task → duplicate Blocker → duplicate mitigation Task.

**Concurrency directive:**
assessment, acceptance, closure, ownership and Blocker resolution use expected revisions/transactional safeguards. Competing users cannot silently overwrite materially different governance decisions.

**Tenant directive:**
Project, Risk, Blocker, Tasks, Requests, Approvals, resources, assets, ChangeRequests and Incidents remain strictly tenant-scoped where applicable.

**Caching directive:**
risk/blocker caches vary by membership authorization, Project/Risk/Assessment/Blocker revisions and source-domain freshness. Cached source state is not resolution authority.

**Partial-failure directive:**
Project, Risks, Assessments, Blockers and each source domain can become unavailable independently. A dependency outage can never be treated as a resolved blocker, low risk, zero impact, or missing source record.

**Performance directive:**
use Project-scoped indexed Risk/Blocker queries, efficient latest-assessment reads, batched typed source resolution and lazy history/evidence rather than N+1 source calls.

**Audit directive:**
Risk creation/assessment/acceptance/closure, Risk materialization, Blocker creation/resolution/reopen, significant ownership changes and exceptional overrides produce actor/source-aware Audit evidence.

**Future-reuse directive:**
Design **114 — Project Files / Deliverables Detail** must remain authoritative for file/deliverable identities and versions; Design 113 may reference missing, rejected, or delayed deliverables as Risk/Blocker evidence without creating another file/deliverable backend.

**Overlap directive:**
Designs **023, 029, 034, 047, 111–120, 147** must preserve one continuous **Project → Tasks/Milestones/Resources/ClientRequests/Approvals/Assets/Incidents → ProjectRisk or ProjectBlocker context → mitigation/resolution → Project Health/Timeline/Activity/Closeout projections** lineage while keeping uncertainty, current obstruction, source-domain state and Project lifecycle independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE PROJECT RISK & BLOCKER FOUNDATION — DISTINCT CANONICAL PROJECTRISK/PROJECTBLOCKER IDENTITIES + APPEND-ORIENTED RISKASSESSMENTS + SEPARATE PROBABILITY/IMPACT/RATING SEMANTICS + EXPLICIT MATERIALIZATION LINEAGE + TYPED PERMISSION/FRESHNESS-AWARE SOURCE REFERENCES + CANONICAL TASK-BASED MITIGATION WORK + EVIDENCE-BASED IDEMPOTENT BLOCKER RESOLUTION + CENTRAL PROJECT-HEALTH IMPACT PROJECTION + NON-DESTRUCTIVE HISTORY — AND NEVER ALLOW TASK BLOCK STATES, CLIENT REQUESTS, APPROVALS, RESOURCE WARNINGS, FILE STATES, SYSTEM INCIDENTS, UI COLORS, SOURCE OUTAGES, MITIGATION CHECKBOXES OR GENERIC “ISSUE” STATUSES TO SUBSTITUTE FOR OR REWRITE CANONICAL RISK, BLOCKER, PROJECT, AUTHORIZATION OR SOURCE-DOMAIN TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **113 / 153** |
| **PASS**                                   |                        **113** |
| **STANDARDIZE decisions**                  |                        **111** |
| **Potential implementation-overlap flags** |                        **104** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**113 / 153 = 73.9% audited.**

### Canonical Project risk/blocker architecture after Design 113

```text
PROJECT PR-100
      │
      ├── PROJECT RISK R-10
      │       │
      │       ├── Assessment A1
      │       ├── Assessment A2
      │       └── Mitigation Task T-50
      │
      └── PROJECT BLOCKER B-20
              │
              └── source
                   ClientRequest CRQ-20
```

The strongest semantic boundary is now explicit:

```text
Risk:
“Client MAY delay photos.”

        ≠

Blocker:
“Client photos ARE overdue
and design cannot continue.”
```

If the Risk materializes:

```text
Risk R-10
   │
   ├── historical assessments preserved
   │
   └── materializedAt
          ↓
     Blocker B-20
```

The Risk does not disappear.

Source truth also remains independent:

```text
ClientRequest CRQ-20
        ↓
overdue

ProjectBlocker B-20
        ↓
references CRQ-20

B-20 does NOT own
ClientRequest status.
```

And mitigation cannot substitute for reassessment:

```text
Risk R-10
Probability: High
Impact: High

Mitigation Task T-50 completed
        ↓

Risk is NOT automatically closed.

Correct:
reassess probability/impact
        ↓
then close/continue/accept
under Risk policy.
```

Finally:

```text
Blocked Task
     ≠
Project Blocker

Overallocated resource
     ≠
Project Blocker

Pending Approval
     ≠
Project Blocker

System Incident
     ≠
Project Blocker

But each MAY become
canonical evidence/source
for a Project-level Blocker
when delivery governance requires it.
```

## Next Sequential Audit Target

### **Design 114 — Project Files / Deliverables Detail**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
