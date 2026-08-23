# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 136 — Operations Command Center

Design 136 should become the **canonical Team Workspace cross-domain operational-attention, live exception-management, delivery-risk, blocked-work, failed-execution, dependency, approval, integration-health, and source-specific action surface**.

It must remain distinct from **Design 006 — Operations Dashboard** and **Design 135 — Analytics Executive Dashboard**.

Design 006 answers:

> “How are day-to-day operations doing overall?”

Design 135 answers:

> “What do the executive metrics and trends say?”

Design 136 answers:

> **“What currently needs operational attention, why, how severe/urgent is it, who is responsible, what canonical source state caused it, and what source-specific action is actually safe now?”**

Design 136 must **not create a generic operational database that duplicates Tasks, Risks, Blockers, Approvals, Client Requests, Publishing failures, Distribution failures, Automation runs, Integration health, or Incidents**.

Instead, it should build a **permission-safe cross-domain `OperationalAttentionItem` projection** over those canonical source domains and delegate every mutation back to the appropriate source service.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **OperationalAttentionItem ≠ SourceDomainRecord ≠ Task ≠ ProjectRisk ≠ ProjectBlocker ≠ ApprovalRequest ≠ ClientRequest ≠ PublicationSchedule/Attempt ≠ DistributionExecution ≠ ScheduledReportRun ≠ AutomationRun ≠ IntegrationHealth ≠ Incident ≠ Notification ≠ AuditEvent ≠ Metric/KPI.**

The central implementation rule is:

> **The Operations Command Center may aggregate and prioritize operational conditions, but it never becomes their source of truth. Every attention item must retain an exact typed source reference, current source-derived condition, severity/priority/urgency, responsibility context, freshness, and available source-specific actions. Acknowledging, assigning, snoozing, or viewing an attention item must never falsely resolve its underlying Task, Blocker, Approval, Client dependency, publication failure, delivery failure, automation failure, Integration issue, or Incident.**

---

# 1. Classification

| Audit field                                | Classification                                                                                                                                                                                                                                          |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                              | **136**                                                                                                                                                                                                                                                 |
| **Canonical name**                         | **Operations Command Center**                                                                                                                                                                                                                           |
| **Product area**                           | Team Workspace / Operations / Cross-Domain Command & Exception Management                                                                                                                                                                               |
| **User surface**                           | **Authenticated Team Workspace**                                                                                                                                                                                                                        |
| **Screen class**                           | Cross-Domain Operational Command Workspace / Exception Queue / Attention Surface                                                                                                                                                                        |
| **Classification**                         | **Canonical Operational Attention, Exception Prioritization & Source-Specific Action Orchestration Anchor**                                                                                                                                             |
| **Primary purpose**                        | Aggregate current operational issues across delivery, projects, approvals, client dependencies, publishing, distribution, reporting, automations, integrations and incidents; prioritize them safely; and provide governed source-specific next actions |
| **Routine operations overview dependency** | Design 006                                                                                                                                                                                                                                              |
| **Executive analytics boundary**           | Design 135                                                                                                                                                                                                                                              |
| **Personal work boundary**                 | Design 078                                                                                                                                                                                                                                              |
| **Notification boundary**                  | Design 080                                                                                                                                                                                                                                              |
| **Task foundation**                        | Design 034                                                                                                                                                                                                                                              |
| **Project risk/blocker foundation**        | Design 113                                                                                                                                                                                                                                              |
| **Project approval dependency**            | Design 115 / canonical Approval engine Design 029                                                                                                                                                                                                       |
| **Client dependency foundation**           | Design 116 / ClientRequest Design 047                                                                                                                                                                                                                   |
| **Publishing operational inputs**          | Designs 124–126                                                                                                                                                                                                                                         |
| **Distribution operational inputs**        | Designs 127–129                                                                                                                                                                                                                                         |
| **Scheduled reporting operational inputs** | Design 134                                                                                                                                                                                                                                              |
| **Integration-health dependency**          | Designs 139–140                                                                                                                                                                                                                                         |
| **Automation-run dependency**              | Designs 141–142                                                                                                                                                                                                                                         |
| **Alert-rule boundary**                    | Design 143                                                                                                                                                                                                                                              |
| **System incident boundary**               | Design 147                                                                                                                                                                                                                                              |
| **Primary cross-domain projection**        | `OperationalAttentionItem`                                                                                                                                                                                                                              |
| **Condition representation**               | `OperationalConditionProjection` / typed condition summary                                                                                                                                                                                              |
| **Responsibility projection**              | `OperationalResponsibility` / source-derived assignment context                                                                                                                                                                                         |
| **Allowed-action projection**              | `OperationalActionDescriptor`                                                                                                                                                                                                                           |
| **Command Center read model**              | `OperationsCommandCenterView`                                                                                                                                                                                                                           |
| **Primary query service**                  | `OperationsCommandCenterQueryService`                                                                                                                                                                                                                   |
| **Condition registry**                     | `OperationalConditionRegistry`                                                                                                                                                                                                                          |
| **Attention resolver**                     | `OperationalAttentionResolver`                                                                                                                                                                                                                          |
| **Priority resolver**                      | `OperationalPriorityResolver`                                                                                                                                                                                                                           |
| **Responsibility resolver**                | `OperationalResponsibilityResolver`                                                                                                                                                                                                                     |
| **Action resolver**                        | `OperationalActionResolver`                                                                                                                                                                                                                             |
| **Parent shell**                           | `InternalAppShell` — Design 001                                                                                                                                                                                                                         |
| **Auth**                                   | Required                                                                                                                                                                                                                                                |
| **Authorization**                          | Active OrganizationMembership + source-domain read/action permissions                                                                                                                                                                                   |
| **Implementation priority**                | **Critical Operations Safety / Cross-Domain Actionability / Exception Integrity**                                                                                                                                                                       |
| **Reuse level**                            | **Extremely High across Tasks, Projects, Publishing, Distribution, Reporting, Integrations, Automation and Incident Management**                                                                                                                        |

Canonical command-center model:

```text
Canonical operational domains
        │
        ├── Tasks / Milestones
        ├── Risks / Blockers
        ├── Approvals
        ├── Client Requests
        ├── Publishing
        ├── Distribution
        ├── Scheduled Reports
        ├── Integrations
        ├── Automation Runs
        └── System Incidents
                 │
                 ↓
       Source-specific adapters
                 │
                 ↓
     OperationalAttentionResolver
                 │
                 ↓
       OperationalAttentionItem[]
                 │
          ┌──────┼──────┐
          ↓      ↓      ↓
       Severity Owner  Actionability
          │      │      │
          └──────┼──────┘
                 ↓
        Operations Command Center
```

---

# 2. Reuse

## Design 006 and Design 136 must remain separate

### Design 006 — Operations Dashboard

Routine overview:

* active workload;
* deadlines;
* blockers;
* delivery health;
* broad capacity/operational summaries.

### Design 136 — Operations Command Center

Exception/action focus:

* what requires attention now;
* what is blocked;
* what failed;
* what is overdue;
* what has unknown external outcome;
* what needs intervention.

Correct:

```text
Design 006
“How are operations doing?”

        ≠

Design 136
“What needs action now?”
```

They can share:

* status cards;
* summary primitives;
* filters;
* project/owner displays.

They must not maintain different operational truth.

---

## Design 135 Analytics ≠ Design 136 Operations

Critical.

Analytics may show:

> Blocked-project rate increased 8%.

Command Center should show:

> Project PR-102 blocked by ClientRequest CR-55.

A KPI movement is not an actionable source record.

---

## `OperationalAttentionItem` ≠ source business entity

This is Design 136's strongest architecture rule.

Correct:

```text
OperationalAttentionItem
sourceType = PROJECT_BLOCKER
sourceId   = PB-20
```

or:

```text
sourceType = PUBLICATION_ATTEMPT
sourceId   = PA-41
```

The attention item is a **projection**.

Do not create:

```text
OperationalIssue
CommandCenterTask
OpsProblem
ExceptionRecord
```

as competing source truth for every operational domain.

---

## OperationalAttentionItem ≠ Task

Permanent.

Some attention items require creation of a Task.

Others are themselves:

* overdue canonical Task;
* Approval;
* Client dependency;
* failed execution;
* Incident.

Do not flatten them into one giant Task model.

---

## Design 078 My Work ≠ Command Center

### My Work

Personal responsibility queue.

### Command Center

Organization/team-level operational visibility and exceptions.

The same source may appear in both projections when appropriate.

Correct:

```text
Approval A-20

→ My Work
  because I am approver

→ Operations Command Center
  because it is blocking publication
```

Still one ApprovalRequest.

---

## Design 080 Notifications ≠ Command Center

Critical.

Notification:

> A report delivery failed.

Operational Attention Item:

> ReportDeliveryAttempt DA-20 currently requires reconciliation/retry.

Reading/dismissing the Notification does not fix the delivery.

---

## ProjectRisk ≠ OperationalAttentionItem

Design 113 remains Risk authority.

The Command Center can project:

> High-severity active Risk.

It does not own:

* likelihood;
* impact;
* mitigation;
* status history.

---

## ProjectBlocker ≠ OperationalAttentionItem

Same principle.

---

## ApprovalRequest ≠ attention item

Canonical Approval remains Design 029.

Attention projection may say:

> Approval pending for 3 days and blocking Project stage.

But approving occurs through Approval service.

---

## ClientRequest ≠ attention item

Design 047/116 remain canonical.

Command Center may show:

> Client assets overdue 4 days.

It must not copy the ClientRequest state.

---

## Publication failures remain Publishing truth

Examples:

* schedule due but blocked;
* publication execution failed;
* provider outcome unknown;
* verification missing.

Design 136 consumes Designs 124–126.

It does not create:

```text
PublishingOperationalIssue
```

as replacement state.

---

## Distribution failures remain Distribution truth

Same for:

* ChannelExecution unknown;
* Placement mismatch;
* verification missing;
* delivery partial.

Designs 127–129 remain authoritative.

---

## ScheduledReportRun remains Design 134 authority

Design 136 may surface:

> Monthly Client Report run failed.

It must not own the run lifecycle or delivery state.

---

## Integration health remains Designs 139–140 authority

Command Center can show:

> LinkedIn integration degraded.

It cannot reconnect tokens by directly editing Command Center state.

Any permitted reconnect action delegates to Integration service.

---

## AutomationRun remains Designs 141–142 authority

Operational attention may include:

> Automation run failed.

But the canonical run/failure/retry lineage remains Automation domain.

---

## Incident remains Design 147 authority

Critical.

A system Incident can appear in Design 136.

But Design 136 does not replace:

* Incident lifecycle;
* severity;
* timeline;
* postmortem;
* system status.

---

## AlertRule remains Design 143 authority

Design 136 may consume alerts/conditions.

It must not become the system for defining alert thresholds/rules.

---

## Attention item ≠ Alert

Permanent.

An Alert may be generated by rule evaluation.

An operational attention item may be directly derived from a canonical source state even without an alert.

---

## Activity ≠ Attention

Design 119/063-style Activity records what happened.

Command Center answers what needs attention now.

Historical event ≠ current actionable condition.

---

## AuditEvent ≠ Attention

Permanent.

Audit is governance evidence, not operational queue.

---

# 3. Entities

## OperationalAttentionItem

Canonical **read-model**, not source-domain business entity.

Conceptually:

```text
OperationalAttentionItem
├── id / stable projection key
├── organizationId
├── conditionType
├── sourceType
├── sourceId
├── sourceVersionId?
├── title
├── context
├── severity
├── urgency
├── priority
├── operationalImpact
├── responsibility
├── dueAt?
├── detectedAt
├── stateAsOf
├── freshness
├── actionability
├── allowedActions[]
└── sourceRevision
```

Exact schema belongs to Phase 3D.

---

## Projection key

A stable key could conceptually derive from:

```text
conditionType
+
sourceType
+
sourceId
```

where appropriate.

This helps prevent duplicate attention cards for the same condition.

---

## Attention item ID ≠ source ID

Permanent.

One source entity can produce more than one distinct operational condition.

Example:

```text
Project P-10

Condition 1:
Client dependency overdue

Condition 2:
Required Approval rejected
```

Do not force one generic "project issue."

---

## OperationalConditionType

Use a typed registry.

Conceptually:

```text
TASK_OVERDUE
PROJECT_BLOCKED
HIGH_RISK
APPROVAL_BLOCKING
CLIENT_DEPENDENCY_OVERDUE
PUBLICATION_FAILED
PUBLICATION_OUTCOME_UNKNOWN
DISTRIBUTION_FAILED
PLACEMENT_MISMATCH
REPORT_RUN_FAILED
REPORT_DELIVERY_PARTIAL
INTEGRATION_DEGRADED
AUTOMATION_FAILED
SYSTEM_INCIDENT
```

Exact catalog belongs to Phase 3D and should only include conditions supported by frozen domains.

---

## ConditionType ≠ AlertRule

The type defines what a condition means.

An AlertRule decides whether some condition/event triggers an alert/notification.

---

## Condition registry

`OperationalConditionRegistry` can define:

* source adapter;
* severity policy;
* freshness policy;
* action resolver;
* display category;
* valid states.

It must not contain arbitrary executable business logic from users.

---

## Severity ≠ Priority

Critical.

### Severity

How serious is the operational impact?

### Priority

How should it rank for attention/action?

Example:

> High-severity issue due next week

may rank below:

> Medium-severity issue blocking publication due today.

---

## Priority ≠ Urgency

Permanent.

---

## Urgency ≠ Due date

A due date is one fact.

Urgency is derived context.

---

## Severity ≠ Risk score

Permanent.

Project Risk likelihood/impact remains Design 113.

Command Center may map it to an operational severity projection but does not replace Risk assessment.

---

## Severity ≠ Incident severity

System Incident severity remains Design 147.

Command Center should display the canonical incident severity where relevant.

---

## Health ≠ Severity

Permanent.

A degraded Integration may have:

```text
health = DEGRADED
operational severity = LOW
```

or:

```text
health = DEGRADED
operational severity = CRITICAL
```

depending on impacted workflows.

---

## Operational impact

Useful derived context such as:

```text
BLOCKING_RELEASE
BLOCKING_CLIENT
BLOCKING_PROJECT
DELAY_RISK
FINANCIAL_IMPACT
SERVICE_IMPACT
```

where actual frozen domains support it.

This is a projection, not source lifecycle.

---

## Responsibility

`OperationalResponsibility` should resolve current operational ownership without creating another assignment domain.

Conceptually:

```text
OperationalResponsibility
├── responsibleMembershipId?
├── responsibleTeamId?
├── sourceOwnerId?
├── escalationContext?
└── resolutionBasis
```

---

## Responsibility ≠ authorization

Absolute.

Assigned/responsible person does not automatically gain permission to act.

---

## Responsibility ≠ source ownership universally

Example:

A Project owner may own context while a specific Task assignee owns the action.

Keep both where relevant.

---

## Assigned-to attention item ≠ Task assignment

If the frozen design supports a Command Center operator assignment/triage owner, that triage assignment must remain separate from the canonical source entity's business assignment.

Do not invent one unless frozen.

---

## Actionability

Derived state such as:

```text
ACTIONABLE
WAITING_EXTERNAL
BLOCKED
READ_ONLY
UNKNOWN
```

Conceptually useful.

---

## Actionability ≠ source lifecycle

Permanent.

An ApprovalRequest may be:

```text
PENDING
```

while for the current user:

```text
actionability = READ_ONLY
```

because they are not an approver.

---

## Allowed action descriptor

Conceptually:

```text
OperationalActionDescriptor
├── actionKey
├── sourceType
├── sourceId
├── label
├── permissionRequirement
├── expectedRevision
└── confirmationRequirement?
```

The descriptor is UI/query metadata.

The source-specific command performs the actual mutation.

---

## Acknowledge state

If the frozen Design 136 includes acknowledgement:

```text
OperationalAcknowledgement
```

should be treated as operational triage metadata.

Critical:

> **Acknowledged ≠ source resolved.**

---

## Snooze state

If present:

> Snoozed ≠ fixed.

A snoozed item may be hidden temporarily from an operator view, but source condition continues to exist.

Do not invent snooze if absent.

---

## Escalation

If present in frozen design, it should reference canonical responsibility/notification policies rather than create a parallel source severity lifecycle.

---

## `detectedAt` ≠ source occurredAt

Critical.

Example:

A Task became overdue at midnight.

The projection may detect it at 00:02.

Both can differ.

---

## `stateAsOf`

Command Center should expose when the source state was last confirmed.

This is important for external providers/automation/integrations.

---

## Freshness

Condition freshness should be source-aware.

A Task from local DB may be effectively current.

An external provider condition may be stale.

---

# 4. Permissions

Design 136 should conceptually distinguish:

```text
operationsCommandCenter.read

operationalAttention.read
operationalAttention.acknowledge
operationalAttention.snooze

task.manage
projectRisk.manage
projectBlocker.manage
approval.decide
clientRequest.manage

publication.retry
distribution.retry
reportRun.retry
reportDelivery.retry

integration.manage
automation.retry
incident.manage
```

Exact permission identifiers belong to Phase 3D.

---

## Command Center read ≠ source action permission

Critical.

A user may see:

> Publication failed

without being allowed to retry publishing.

---

## Source-specific permission must win

The Command Center cannot introduce one:

```text
operations.resolveAll
```

permission that bypasses domain rules.

---

## Read aggregated condition ≠ read full source record

Potentially important.

A manager might see:

> 3 Finance issues need attention

without permission to inspect every Invoice.

Aggregate-only visibility must be explicit.

---

## Attention-item deep link reauthorizes

Absolute.

---

## Action descriptor ≠ authorization

Even if the UI displays a button based on current permissions:

the command endpoint reauthorizes.

---

## Acknowledge ≠ Resolve permission

Permanent.

A coordinator may acknowledge an issue without permission to modify its source.

---

## Assignment/triage permission ≠ source mutation permission

If triage assignment exists.

---

## Retry Publication ≠ Retry Distribution

Permanent.

---

## Retry Distribution ≠ Retry Report Delivery

Permanent.

---

## Automation retry ≠ Integration management

Permanent.

---

## Integration read ≠ Integration reconnect/manage

Permanent.

---

## Incident read ≠ Incident manage

Permanent.

---

## Approval visibility ≠ Approval decision authority

Absolute.

---

## Project manager title ≠ permission

Design 037 remains canonical authorization authority.

---

## Operations role ≠ unrestricted cross-domain access

Critical.

Do not grant broad Finance/Client/Contract/etc. access solely because someone uses Command Center.

---

## Cross-tenant attention aggregation prohibited

Absolute.

---

## Counts/facets permission-safe

If Command Center shows:

> Critical 12
> Publishing 4
> Finance 3

these counts must only reflect conditions the user may know exist.

---

# 5. States

Design 136 must keep **source lifecycle, operational condition, severity, urgency, priority, actionability, acknowledgement, assignment, freshness, and dependency availability** separate.

### Attention condition

Conceptually:

```text
Active
Resolved-by-Source
No-Longer-Applicable
Unknown
```

### Severity

```text
Critical
High
Medium
Low
Unknown
```

### Priority

Conceptually:

```text
P0 / P1 / P2 / P3
```

or the frozen platform's equivalent.

Exact taxonomy belongs to Phase 3D.

### Actionability

```text
Actionable
Waiting External
Blocked
Read Only
Unknown
```

### Freshness

```text
Fresh
Aging
Stale
Unknown
```

### Acknowledgement, if present

```text
Unacknowledged
Acknowledged
```

These must never collapse into one generic `ops_status`.

---

## Source failed ≠ attention unresolved forever

Once canonical source recovers:

the attention projection should disappear or become resolved historical state according to projection policy.

Do not require manual "close issue" if source truth already proves resolution unless acknowledgement workflow explicitly requires it.

---

## Acknowledged ≠ Resolved

Absolute.

---

## Assigned ≠ Resolved

Absolute.

---

## Snoozed ≠ Resolved

Absolute.

---

## Viewed ≠ Acknowledged

Permanent.

---

## Notification read ≠ Acknowledged

Permanent.

---

## Source resolved ≠ Notification dismissed

Permanent.

---

## High severity ≠ highest priority universally

Critical.

---

## Overdue ≠ Failed

Permanent.

---

## Blocked ≠ Failed

Permanent.

---

## Waiting Client ≠ internal Blocker source

A ClientRequest may cause a ProjectBlocker, but the Request and Blocker remain separate canonical entities.

---

## Outcome Unknown ≠ Failed

Critical for:

* Publishing;
* Distribution;
* report delivery;
* automation/integrations.

Do not expose blind retry.

---

## Integration degraded ≠ down

Permanent.

---

## System Incident open ≠ all dependent workflows failed

Permanent.

---

## Source service unavailable ≠ no attention items

Absolute.

Return partial/unknown condition data.

---

## Command Center empty ≠ all systems healthy universally

If some source adapters are unavailable:

correct state is:

> No known current items from available sources; some sources unavailable.

Not:

> Everything healthy.

---

## State Coverage

Design 136 inherits Design 150 plus:

```text
Operations Command Center Loading
Operations Command Center Available
Operations Command Center Empty
Operations Command Center Restricted
Operations Command Center Partial
Operations Command Center Unavailable

Attention Active
Attention Resolved By Source
Attention No Longer Applicable
Attention State Unknown

Severity Critical
Severity High
Severity Medium
Severity Low
Severity Unknown

Priority Highest
Priority High
Priority Normal
Priority Low
Priority Unknown

Actionable
Waiting External
Blocked
Read Only
Actionability Unknown

Acknowledged
Unacknowledged

Fresh
Aging
Stale
Freshness Unknown

Task Overdue
Task Blocked
Project Risk High
Project Blocker Active
Approval Blocking
Client Dependency Overdue

Publication Failed
Publication Outcome Unknown
Publication Verification Missing

Distribution Failed
Distribution Outcome Unknown
Placement Mismatch

Scheduled Report Failed
Report Delivery Partial
Report Delivery Outcome Unknown

Integration Degraded
Integration Unavailable
Integration State Unknown

Automation Failed
Automation Outcome Unknown

Incident Active
Incident Resolved
Incident State Unknown

Source Updated Elsewhere
Source Resolved Elsewhere
Responsibility Changed Elsewhere
Permission Changed
Attention Projection Stale
Source Adapter Unavailable
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize:

1. highest actionable conditions;
2. condition source;
3. severity/priority;
4. impact;
5. responsible person/team;
6. freshness;
7. source-specific next action.

Conceptually:

```text
Operations Command Center
↓
Critical / High Attention
↓
Publishing / Projects / Client / Distribution / Automation
↓
Operational item

Publication failure
Executive Magazine v4
Website target
Severity: High
Impact: Release blocked
Owner: Publishing Ops
State: Known failure
Action: Retry publication
```

Only the elements in the frozen Design 136 should render.

---

## Priority and severity must be visually distinct

Avoid one color conveying:

* severity;
* due urgency;
* actionability;
* source state;

simultaneously.

---

## Source domain should remain visible

The operator needs to know whether an item is:

* Project Blocker;
* Approval;
* Publication failure;
* Integration issue;
* Incident.

Do not make every card look like a generic Task.

---

## Current source state should remain inspectable

Example:

> Distribution execution: Outcome Unknown

not:

> Distribution failed

if uncertainty remains.

---

## Action button should be source-specific

Safer:

> Reconcile execution

than:

> Resolve.

Safer:

> Open Approval

than:

> Fix.

---

## Operator attention metadata should not dominate source truth

If acknowledgement exists:

> Acknowledged

should appear secondary to:

> Publication still failed.

---

## Filters

If the frozen Command Center includes filters, canonical dimensions may include:

* source domain;
* severity;
* priority;
* owner/team;
* project/client;
* actionability;
* age.

They must be server-authorized.

---

## Tablet

Following Design 152:

* highest-severity/actionable conditions remain first;
* context metadata stacks;
* filter rail becomes compact;
* secondary provenance/freshness moves into expandable detail;
* primary source-specific action remains visible.

---

## Mobile

Priority:

```text
Severity / Priority
↓
Operational condition
↓
Source entity
↓
Impact
↓
Responsibility
↓
Due/age
↓
Current source state
↓
Allowed action
```

Avoid compressing a desktop multi-column incident table horizontally.

---

## Mobile action labels

Prefer:

> Open blocker
> Review approval
> Reconcile publication
> Retry report delivery

instead of generic:

> Resolve.

---

## Accessibility

An attention item could communicate:

> High-priority operational issue. Publication PUB-100 version 4 failed on the Website target. The failure is known and the release is currently blocked. The Publishing Operations team is responsible. The source state was last confirmed two minutes ago. You are authorized to retry this exact publication attempt.

or:

> Distribution execution E-30 has an unknown external outcome. Retry is not currently available because reconciliation is required first.

where canonical authorized data supports it.

---

# 7. Backend Requirements

## Canonical Command Center architecture

```text
Design 136
    ↓
Authenticated Workspace Context
    ↓
OperationsCommandCenterQueryService
    │
    ├── TaskAttentionAdapter
    ├── ProjectRiskBlockerAdapter
    ├── ApprovalAttentionAdapter
    ├── ClientDependencyAdapter
    ├── PublishingAttentionAdapter
    ├── DistributionAttentionAdapter
    ├── ScheduledReportAttentionAdapter
    ├── IntegrationHealthAdapter
    ├── AutomationRunAdapter
    └── IncidentAdapter
    ↓
OperationalAttentionResolver
    ↓
Priority / Responsibility / Action Resolver
    ↓
OperationsCommandCenterView
```

---

## Source adapters are mandatory

Design 136 should not directly query arbitrary tables and invent conditions ad hoc.

Each domain adapter should expose a typed contract such as:

```text
getOperationalConditions(
    organizationScope,
    timeContext,
    authorizationScope
)
```

---

## Adapter responsibilities

Each source adapter should provide:

* exact source reference;
* current canonical state;
* detected operational condition;
* source-derived severity inputs;
* due/age context;
* responsibility;
* freshness;
* candidate actions.

The central resolver normalizes presentation/prioritization.

---

## Adapter does not mutate source

Permanent.

---

## Operational Condition Registry

Conceptually:

```text
OperationalConditionDefinition
├── conditionType
├── sourceTypes
├── category
├── default severity policy
├── priority inputs
├── freshness policy
├── action resolver
└── display semantics
```

This is platform configuration/code governance.

Do not allow arbitrary user scripts/eval.

---

## Condition detection

Examples:

### Overdue Task

Source:

```text
Task.status != COMPLETED
AND dueAt < now
```

according to canonical Task policy.

### Blocking Approval

Source:

```text
ApprovalRequest pending/rejected
+
source workflow currently requires it
```

according to canonical gate/workflow state.

### Publication failure

Derived from canonical PublicationSchedule/Attempt state.

### Distribution outcome unknown

Derived from `ChannelExecution`.

The Command Center does not invent separate booleans.

---

## Current-state revalidation

Before any mutation:

re-read the canonical source.

Critical race:

```text
Command Center shows:
Task overdue

Meanwhile:
Task completed elsewhere

Operator clicks action.
```

The server must return current source state rather than applying stale action.

---

## Attention projection freshness

Every item should carry enough state revision/freshness to detect stale operations.

---

## Priority resolver

Conceptually:

```text
OperationalPriorityResolver.resolve(
    condition,
    severity,
    urgency,
    dueContext,
    businessImpact,
    dependencies
)
```

Priority should be deterministic and versioned/configurable through governed policy—not frontend sorting heuristics.

---

## Priority ≠ one universal numeric score

Important.

Do not collapse:

* severity;
* financial impact;
* due urgency;
* client impact;
* source confidence;

into an unexplained magic number unless a documented policy explicitly does so.

A structured ranking model is safer.

---

## Ordering ties

Use deterministic stable tie-breakers such as:

```text
priority
severity
dueAt
detectedAt
sourceId
```

according to policy.

---

## Condition deduplication

One source condition should not appear as five duplicate cards because:

* Notification exists;
* Activity event exists;
* Alert exists;
* source status exists.

Use canonical condition keying.

---

## Correlated conditions ≠ duplicate conditions

Example:

```text
ClientRequest overdue
        ↓
ProjectBlocker active
        ↓
Publication delayed
```

These may be three legitimate canonical states.

Command Center may visually correlate them.

It must not merge them into one entity or double-count blindly.

---

## Causal relationships

Where canonical source references prove dependency:

the view can show:

> Publication blocked by Project approval.

Do not infer causality merely because events occurred around the same time.

---

## OperationalAttentionItem storage

Prefer a rebuildable/materialized projection.

If persisted for performance:

it must remain derivable from canonical source conditions.

Do not make operators manually edit source state through projection fields.

---

## Materialized attention projection

Could be maintained through:

* domain outbox events;
* incremental projection handlers;
* scheduled reconciliation.

Still requires periodic source reconciliation.

---

## Event-driven projection ≠ source truth

Absolute.

If an event is missed, reconciliation must rebuild correct attention state.

---

## Full reconciliation

A scheduled/recoverable reconciliation process should ensure projection consistency.

---

## Action resolver

Conceptually:

```text
OperationalActionResolver.resolve(
    attentionItem,
    currentMembership
)
```

returns only actions that are:

* valid for current source state;
* authorized;
* safe for current external-outcome state.

---

## Source-specific command routing

Examples:

```text
Complete Task
→ TaskService

Approve
→ ApprovalService

Retry Publication
→ PublicationExecutionService

Reconcile Distribution
→ DistributionExecutionReconciliationService

Retry Report Delivery
→ ReportDeliveryService

Retry Automation
→ AutomationRunService

Acknowledge Incident
→ IncidentService
```

No generic:

```text
resolveOperationalItem()
```

that directly writes all domain states.

---

## Generic "Open Source" action is safe

The Command Center can always provide source navigation where authorized.

Mutations remain domain-specific.

---

## Acknowledgement command

If frozen:

```text
acknowledgeOperationalAttention(
    attentionProjectionKey,
    expectedSourceRevision
)
```

should update only triage metadata.

Never source lifecycle.

---

## Snooze command

If frozen:

snooze only the operator/team visibility according to policy.

The source condition remains active.

---

## Triage metadata retention

If acknowledgement/snooze/triage ownership exists, it can be a small dedicated operational-metadata domain.

Do not let it become a second Task/Incident system.

---

## Responsibility resolver

Should reuse:

* Task assignee;
* Project team;
* source owner;
* integration owner;
* incident commander;

according to source semantics.

Never infer owner solely from last editor.

---

## Source owner deactivated

Resolver must handle:

> no active responsible person

as an attention state or responsibility gap, not silently assign someone else.

---

## Personal My Work integration

Design 078 can consume same canonical Task/Approval/etc. assignments.

Command Center does not write My Work rows.

---

## Notification integration

Design 080/143 may notify when high-priority conditions arise.

The Command Center itself should not create one Notification every time it is loaded.

Use event/outbox-driven policies.

---

## Alert Rules integration

Design 143 may define:

> notify ops when publication failure remains unresolved for X minutes.

That is separate from condition existence.

---

## Integration health

Design 140 remains source.

Command Center may show:

```text
Connection degraded
last healthy 22m ago
affected workflows 3
```

if canonical services expose that safely.

---

## System incidents

Design 147 owns Incident.

Command Center may include:

```text
Incident INC-4
severity = SEV1
state = ACTIVE
```

with safe open/action links.

---

## System Incident ≠ business blocker

Even if an Incident causes project delays, keep both source entities.

---

## Automation Runs

Design 141/142 should provide:

* Run state;
* failure class;
* retry eligibility;
* outcome certainty.

Command Center consumes those.

---

## Scheduled Report Runs

Same principle with Design 134.

---

## External outcome safety

For Publishing, Distribution, report delivery, Automation integrations:

```text
OUTCOME_UNKNOWN
```

must produce:

> Reconcile

not:

> Retry

unless source service determines retry is safe.

---

## Bulk actions

If frozen Design 136 supports bulk actions:

each item must be:

* same compatible source/action type or safely handled per item;
* individually authorized;
* current-state checked;
* partial-outcome aware.

Never generic bulk "Resolve All."

---

## Example bulk result

```text
8 selected publication failures

5 retried
1 already recovered
1 now outcome unknown
1 permission denied
```

This is valid partial outcome.

---

## Query architecture

Conceptually:

```text
getOperationsCommandCenter(
    filters,
    sort,
    cursor,
    currentMembership
)
```

should:

1. authenticate;
2. resolve tenant;
3. resolve authorized operational domains;
4. query attention projection/source adapters;
5. permission-filter before counts/facets;
6. resolve current severity/priority;
7. resolve responsibility;
8. resolve actionability/actions;
9. preserve source freshness;
10. return stable pagination.

---

## Permission before counts

Absolute.

---

## Source unavailable

If Integration/Automation/Publishing adapter is unavailable:

the Command Center should return:

```text
sourceAvailability = UNAVAILABLE
```

not zero items.

---

## Overall Command Center state

If:

```text
Tasks ✓
Projects ✓
Publishing ✕
Distribution ✓
```

overall:

> Partial.

Not:

> Healthy.

---

## N+1 avoidance

Do not query source detail separately for every attention card.

Use:

* materialized projections;
* batched source summaries;
* typed joins/read models.

---

## Pagination

Use stable cursor ordering.

High-volume historical resolved items should not overload current command queue.

---

## Current vs historical

Design 136 should primarily focus on current actionable/attention state.

Historical activity remains source domains/Audit/Activity.

Do not turn Command Center into another Audit log.

---

## Metrics in Command Center

Counts such as:

* 5 critical;
* 9 blocking;
* 4 awaiting client;

are operational summaries.

They must derive from the same authorized attention projection.

Do not create separate analytics formulas that disagree with items listed below.

---

## Analytics integration

Design 135 may show:

> 7 blocked projects.

Design 136 may show the exact current blocked Project items.

These numbers should reconcile where their scope/period/definition are equivalent, but analytics history and live operational attention remain distinct systems.

---

## Idempotency

Required for:

* acknowledgement/snooze if present;
* delegated retry commands;
* bulk actions;
* reconciliation-trigger commands.

The source domain remains responsible for idempotent business side effects.

---

## Optimistic concurrency

Every source mutation should carry:

* source ID;
* expected source revision/state;
* idempotency key where needed.

---

## Caching

Command Center cache must vary by:

```text
organizationMembershipId
authorizationRevision
filters
priority policy revision
source projection revisions
responsibility revisions
integration/automation/incident revisions
triage metadata revision
```

---

## Time-derived conditions

Overdue/age/urgency cannot be cached indefinitely.

---

## Performance

Use:

* incremental attention projections;
* indexed severity/priority/due fields;
* batched source lookups;
* lazy detail loading;
* server filtering;
* cursor pagination;
* event-driven updates with reconciliation.

Avoid full-table scans across every domain on every Command Center load.

---

## Real-time updates

Where frozen UX supports live updates:

use event-driven invalidation/subscription.

Still reauthorize and revalidate source state for every action.

---

## Partial failure contract

Example:

```text
Tasks                ✓
Projects             ✓
Publishing           ✓
Automation           ✕
Incidents            ✓
```

Correct:

> Command Center is partially available. Automation conditions are currently unavailable.

Incorrect:

> No automation issues.

Another:

```text
Publication item:
source state = OUTCOME_UNKNOWN
provider reconciliation service = unavailable
```

Correct:

> External outcome remains unknown. Reconciliation is currently unavailable; retry remains disabled.

Not:

> Failed — Retry.

Another:

```text
Incident adapter unavailable
other operational sources available
```

Correct:

> Current system-incident status cannot be loaded.

Not:

> No active incidents.

---

## Backend Requirement Matrix

| Requirement                                       | Status                                |
| ------------------------------------------------- | ------------------------------------- |
| Design 006 Operations overview reuse              | **Critical architecture**             |
| Design 135 Analytics separation                   | **Critical architecture**             |
| No generic operational business entity            | **Critical**                          |
| OperationalAttentionItem/source-record separation | **Critical**                          |
| Typed source references                           | **Critical**                          |
| Canonical source-domain mutation only             | **Critical**                          |
| Task/Attention separation                         | **Critical**                          |
| Risk/Blocker/Attention separation                 | **Critical**                          |
| Approval/Attention separation                     | **Critical**                          |
| ClientRequest/Attention separation                | **Critical**                          |
| Publication/Distribution failure reuse            | **Critical**                          |
| ScheduledReportRun reuse                          | **Critical**                          |
| Integration-health reuse                          | **Critical**                          |
| AutomationRun reuse                               | **Critical**                          |
| Incident reuse                                    | **Critical**                          |
| AlertRule/condition separation                    | **Critical**                          |
| Notification/Attention separation                 | **Critical**                          |
| Activity/Audit/Attention separation               | **Critical**                          |
| Severity/Priority/Urgency separation              | **Critical**                          |
| Health/Severity separation                        | **Critical**                          |
| Actionability/source lifecycle separation         | **Critical**                          |
| Responsibility/authorization separation           | **Critical**                          |
| Acknowledged/resolved separation                  | **Critical if acknowledgment exists** |
| Snoozed/resolved separation                       | **Critical if snooze exists**         |
| Source-derived freshness                          | **Critical**                          |
| Condition registry                                | **Critical architecture**             |
| Source-specific adapters                          | **Critical architecture**             |
| Condition deduplication                           | **Critical**                          |
| Proven causal links only                          | **Critical**                          |
| Central priority resolver                         | **Critical**                          |
| No unexplained universal score                    | **Critical**                          |
| Source-specific action resolver                   | **Critical**                          |
| Current-state revalidation before mutation        | **Critical**                          |
| Outcome-unknown reconciliation safety             | **Critical**                          |
| Permission before counts/facets                   | **Critical**                          |
| Cross-tenant aggregation prohibited               | **Critical**                          |
| Source adapter unavailable ≠ zero items           | **Critical**                          |
| Partial dependency handling                       | **Critical**                          |
| Projection rebuildability/reconciliation          | **Critical**                          |
| Event-driven projection not source truth          | **Critical**                          |
| Optimistic concurrency                            | **Critical**                          |
| Idempotent delegated actions                      | **Critical**                          |
| Bulk partial outcomes                             | **Critical if bulk exists**           |
| Stable cursor pagination                          | **Critical performance**              |
| Design 141–143/147 shared source identities       | **Critical architecture**             |
| Audit/Activity/observability separation           | **Required**                          |

---

# 8. Consolidation

Design 136 creates one of the largest cross-domain overlap risks in the platform because a Command Center can easily become a giant second database of every problem.

**Design 006 / Design 136 conflation**
Routine operations overview and exception command surface become one ambiguous dashboard.

**Design 135 / Design 136 conflation**
Analytics KPI movement becomes operational action truth.

**OperationalAttentionItem / source entity conflation**
Projection becomes canonical business record.

**OperationalAttentionItem / Task conflation**
Every problem becomes a Task.

**OperationalAttentionItem / Incident conflation**
Business exceptions become system incidents.

**OperationalAttentionItem / Alert conflation**
Current source condition and alert notification merge.

**OperationalAttentionItem / Notification conflation**
Reading notification appears to resolve operation.

**OperationalAttentionItem / ActivityEvent conflation**
Historical event becomes current action state.

**OperationalAttentionItem / AuditEvent conflation**
Governance evidence becomes work queue.

**Source state / projection state conflation**
Command Center can contradict canonical domain.

**Task overdue / generic operational failure conflation**
Work scheduling and failure semantics merge.

**ProjectRisk / Blocker conflation**
Future exposure and current impediment merge again.

**Risk severity / Command Center priority conflation**
High Risk automatically becomes highest operational priority.

**Severity / priority conflation**
Business impact and action order merge.

**Urgency / severity conflation**
Near deadline looks like catastrophic impact.

**Due date / urgency conflation**
No contextual priority model.

**Health / severity conflation**
Degraded provider is always treated critical.

**Priority / one magic score conflation**
Decision logic becomes opaque.

**Responsibility / authorization conflation**
Assigned person gains permissions implicitly.

**Source owner / action owner conflation**
Project owner is assumed to own every operational fix.

**Triage assignment / canonical Task assignment conflation**
Ops coordinator rewrites project staffing.

**Acknowledged / resolved conflation**
Operator click falsely fixes source issue.

**Viewed / acknowledged conflation**
Opening card removes attention.

**Snoozed / resolved conflation**
Hidden item appears fixed.

**Notification read / acknowledgement conflation**
Inbox state changes operational state.

**Source resolved / acknowledgement requirement conflation**
Already-fixed issue remains artificially open.

**Approval pending / operational blocker conflation**
Every pending Approval is assumed blocking.

**Approval visibility / decision authority conflation**
Ops user can approve because card is visible.

**ClientRequest overdue / ProjectBlocker conflation**
External dependency and internal blocker lose identity.

**Client waiting / Task waiting conflation**
External responsibility becomes employee Task status.

**PublicationSchedule / PublicationAttempt conflation**
Scheduled release and execution failure merge.

**Publication failure / Distribution failure conflation**
Canonical release and promotion execution become one issue type.

**Provider accepted / verified live conflation**
Operations prematurely marks success.

**Distribution outcome unknown / failed conflation**
Blind retry creates duplicate Placements.

**Report generation failed / delivery failed conflation**
Different recovery actions disappear.

**Report delivery partial / Report Run failed conflation**
Successful recipients disappear.

**AutomationRun / generic operational issue conflation**
Automation-specific retry/step lineage is lost.

**Integration health / Automation failure conflation**
Connection issue and execution issue become the same thing.

**Integration degraded / Integration down conflation**
Operational response is overstated.

**System Incident / Integration issue conflation**
Platform incident model is bypassed.

**Incident severity / business priority conflation**
SEV1 automatically determines every downstream item's priority.

**AlertRule / condition registry conflation**
Command Center starts owning thresholds/notification policy.

**Condition / alert notification conflation**
Disabling alert hides real operational problem.

**One source / one attention item conflation**
Different legitimate conditions get merged.

**Related source conditions / duplicate condition conflation**
ClientRequest→Blocker→Publication Delay is incorrectly deduped to one record.

**Duplicate Notifications / duplicate attention items conflation**
One real issue appears multiple times.

**Event-driven projection / canonical truth conflation**
Missed event leaves permanent wrong state.

**Projection stale / source stale conflation**
User repeats resolved action.

**Source adapter unavailable / zero issues conflation**
Outage appears as healthy system.

**Command Center empty / everything healthy conflation**
Partial source outage is hidden.

**Current condition / historical activity conflation**
Command Center becomes another log viewer.

**Current attention / Analytics history conflation**
Operational queue becomes BI time-series.

**Operational KPI count / listed-items count conflation**
Two separate calculators disagree.

**Priority resolver / frontend sort conflation**
Client controls operational prioritization.

**Action descriptor / authorization conflation**
Visible button is treated as permission.

**Generic Resolve / source-specific command conflation**
One action bypasses domain rules.

**Retry / reconcile conflation**
Unknown external outcomes duplicate side effects.

**Retry Publication / Retry Distribution conflation**
Different idempotency semantics disappear.

**Retry Delivery / Regenerate Report conflation**
Transport failure mutates report output.

**Bulk resolve / bulk source action conflation**
Heterogeneous domains get unsafe mass mutation.

**Bulk complete success / partial outcomes conflation**
Some failed actions disappear.

**Role/title / operational authority conflation**
"Operations Manager" bypasses RBAC.

**Command Center access / all-domain access conflation**
Cross-domain data leaks.

**Counts before permissions / counts after permissions conflation**
Restricted operational volume leaks.

**Broad-role cache / narrow-role cache conflation**
Sensitive conditions leak.

**Triage metadata / source workflow state conflation**
Ops notes/assignment become business workflow.

**Application log / condition evidence conflation**
Infrastructure errors become operational business truth.

**Observability alert / Incident conflation**
Telemetry spike automatically creates Incident state.

**Generic `ops_issue` table**
Duplicates every source domain.

**Generic `resolved=true`**
Cannot represent source-specific resolution.

**Generic `severity` only**
Loses priority, urgency, health, impact, freshness.

**Generic `owner_id`**
Conflates source ownership, task assignment, triage, responsibility.

**Generic `retry` endpoint**
Unsafe across external-side-effect domains.

**136/006 duplicate Operations state**
Overview and Command Center disagree.

**136/078 duplicate work queue**
Personal work and organizational attention fork.

**136/080 duplicate Notification state**
Attention depends on inbox reads.

**136/113 duplicate Risk/Blocker truth**
Project operational state forks.

**136/124–129 duplicate Publishing/Distribution execution state**
External operations diverge.

**136/134 duplicate Scheduled Report state**
Generation/delivery runs fork.

**136/139–140 duplicate Integration state**
Command Center stores health/credentials.

**136/141–142 duplicate AutomationRun state**
Automation monitoring forks.

**136/143 duplicate Alert Rule engine**
Command Center owns alerts.

**136/147 duplicate Incident system**
System-status lifecycle forks.

No additional screen is required.

These are **cross-domain operational-attention projection, source-domain ownership, severity/priority/actionability separation, source-specific commands, reconciliation-before-retry, permission-safe aggregation, projection freshness/rebuildability, and strict Analytics/Notifications/Automation/Incident boundaries**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL OPERATIONAL ATTENTION, EXCEPTION PRIORITIZATION & SOURCE-SPECIFIC ACTION ORCHESTRATION ANCHOR**

**Domain directive:**
**OperationalAttentionItem ≠ SourceDomainRecord ≠ Task ≠ ProjectRisk ≠ ProjectBlocker ≠ ApprovalRequest ≠ ClientRequest ≠ PublicationSchedule/Attempt ≠ DistributionExecution ≠ ScheduledReportRun ≠ AutomationRun ≠ IntegrationHealth ≠ Incident ≠ Notification ≠ AuditEvent ≠ Metric/KPI.**

**Foundation directive:**
Design 136 is a cross-domain operational projection/orchestration surface. It never becomes a new master domain for Tasks, Risks, Blockers, Approvals, Client Requests, Publishing, Distribution, Scheduled Reports, Automations, Integrations, or Incidents.

**Operations-dashboard directive:**
Design 006 remains routine operational overview; Design 136 remains exception/action command surface. They share canonical source projections rather than duplicate calculations.

**Analytics directive:**
Design 135 measures performance/trends. Design 136 presents current operational conditions requiring attention. KPI movement never becomes source operational state automatically.

**Attention-item directive:**
`OperationalAttentionItem` is a rebuildable permission-safe projection with exact typed source reference, condition, impact, severity, priority, responsibility, freshness, actionability and permitted source-specific actions.

**No-generic-issue directive:**
the platform must not create a giant mutable `OpsIssue` entity that copies statuses from every source domain.

**Condition-registry directive:**
one typed `OperationalConditionRegistry` defines supported condition semantics, adapters, priority inputs, freshness expectations and action resolution without arbitrary user executable code.

**Source-adapter directive:**
Tasks, Projects, Approvals, Client dependencies, Publishing, Distribution, Reporting, Integrations, Automations and Incidents expose operational summaries through source-specific adapters while retaining ownership of their lifecycle.

**Projection directive:**
event-driven/materialized Command Center projections are optimization only and remain fully rebuildable/reconcilable from canonical sources.

**Reconciliation directive:**
periodic/source-triggered reconciliation repairs missed projection events; projection state can never outrank current source truth.

**Current-state directive:**
every mutating action re-fetches/revalidates canonical source state before execution. A stale Command Center card can never perform an obsolete operation blindly.

**Severity directive:**
severity describes impact and remains separate from priority, urgency, due date, Risk score, Incident severity, Integration health and actionability.

**Priority directive:**
one governed `OperationalPriorityResolver` ranks attention using structured inputs such as severity, urgency, dependency/blocking impact and due context without relying on unexplained frontend sorting or a magic universal score.

**Urgency directive:**
deadline proximity does not automatically redefine severity.

**Health directive:**
Integration/system health is an input to operational context and never itself substitutes for business impact/severity.

**Responsibility directive:**
`OperationalResponsibilityResolver` derives current responsible Team/User/source owner according to each canonical domain and remains separate from RBAC authorization.

**Authorization directive:**
being responsible for an item never grants permission to mutate it; Design 037/source-specific authorization remains authoritative.

**My-Work directive:**
Design 078 and Design 136 may project the same canonical source object into personal and organizational views respectively without creating duplicate work identities.

**Notification directive:**
Design 080 Notification read/dismiss state is entirely separate from operational condition/action state.

**Acknowledgement directive:**
if frozen Design 136 includes acknowledgement, it records triage awareness only. Acknowledged never equals source resolved.

**Snooze directive:**
if present, snooze affects presentation/triage visibility only and never alters canonical source state.

**Risk/Blocker directive:**
Design 113 remains canonical Risk/Blocker authority. Command Center consumes current summaries and cannot mutate probability/impact/mitigation via generic operational fields.

**Approval directive:**
Design 029/115 remain Approval authority. The Command Center can surface blocking Approvals but approval decisions execute through the exact canonical ApprovalRequest/participant/policy semantics.

**Client-dependency directive:**
Design 047/116 remain ClientRequest authority. Waiting on Client, Project Blocker and internal Task remain separately canonical even when causally related.

**Publishing directive:**
Designs 124–126 remain PublicationSchedule/Attempt/Verification authority. The Command Center consumes failures, overdue schedules, unknown outcomes and readiness issues without creating duplicate release state.

**Distribution directive:**
Designs 127–129 remain ChannelExecution/Placement/Verification authority. Unknown external outcome is never flattened to failure or blind retry.

**Scheduled-report directive:**
Design 134 remains ScheduledReportDefinition/Run/Delivery authority. Generation failure, Approval wait, Portal release, email delivery and bounce remain distinct when projected into operations.

**Integration directive:**
Designs 139–140 remain provider connection/health/credential authority. Command Center can surface degradation and delegate allowed actions but never owns secrets or connection lifecycle.

**Automation directive:**
Designs 141–142 remain canonical AutomationRun/failure-investigation authority. Command Center projects actionable failures and delegates retry/reconciliation to Automation services.

**Alert directive:**
Design 143 owns AlertRule definitions and alert/notification policy. Operational conditions can exist regardless of whether an AlertRule currently emits a notification.

**Incident directive:**
Design 147 remains canonical system Incident lifecycle/status authority. Command Center may surface active Incidents and affected operations but never creates a second Incident system.

**Actionability directive:**
Actionable, Waiting External, Blocked, Read Only and Unknown describe operator capability/context and never replace source lifecycle.

**Action resolver directive:**
one `OperationalActionResolver` exposes only source-state-valid, permission-safe actions and always routes execution to the source service.

**No-generic-resolve directive:**
there must be no generic `resolveOperationalIssue()` command that directly changes heterogeneous source-domain states.

**Unknown-outcome directive:**
Publishing, Distribution, report delivery, Automation and other external side-effect states marked `OUTCOME_UNKNOWN` expose reconciliation—not blind retry—until source service proves retry safety.

**Bulk directive:**
if frozen UI supports bulk actions, each selected source is individually current-state checked, authorized and executed with partial outcomes; generic heterogeneous “Resolve All” is prohibited.

**Counts directive:**
Command Center totals/facets derive from the same permission-safe attention projection used for the list and cannot reveal hidden-domain issue counts.

**Permission-before-query directive:**
tenant/domain/resource authorization applies before condition aggregation, filtering, counts, facets, ranking and drilldown.

**Source-unavailable directive:**
unavailable operational adapters remain explicitly unavailable. They can never be interpreted as zero issues or healthy status.

**Empty-state directive:**
an empty queue means no known attention items among successfully queried authorized sources—not necessarily universal system health.

**Freshness directive:**
attention items preserve `stateAsOf`/source freshness so stale provider/integration state cannot appear current.

**Deduplication directive:**
the Command Center deduplicates duplicate representations of the same source condition while preserving genuinely different correlated canonical conditions.

**Causality directive:**
causal/dependency relationships are shown only when backed by canonical references, never inferred from temporal proximity.

**Activity directive:**
Design 119 remains historical event/activity projection. The Command Center focuses current operational conditions rather than becoming another timeline.

**Audit directive:**
Design 039 remains governance evidence. Material triage/delegated actions may generate source-aware Audit events, but operational cards themselves are not Audit records.

**Observability directive:**
worker logs, API errors, queue latency and monitoring telemetry remain observability. They become Command Center conditions only through typed source/Incident/Integration/Automation semantics.

**Idempotency directive:**
acknowledgement/snooze if present, delegated retries, reconciliation triggers and bulk action commands are replay-safe; the canonical source domain remains responsible for external side-effect idempotency.

**Concurrency directive:**
source revision/state checks prevent stale actions when an item is resolved, reassigned, claimed, retried or changed elsewhere.

**Caching directive:**
Command Center caches include authorization scope, source projection revisions, priority-policy revision, responsibility state, triage metadata and time-sensitive due/freshness context.

**Performance directive:**
use indexed/materialized attention projections, batched source adapters, event-driven incremental updates, periodic reconciliation, cursor pagination and lazy details rather than scanning every operational table synchronously on every load.

**Partial-failure directive:**
Tasks, Projects, Publishing, Distribution, Reporting, Integrations, Automation and Incidents may fail independently. `Unavailable` can never become `Healthy`, `Resolved`, `0 issues`, `Failed`, or `Safe to retry` without evidence.

**Future-reuse directive:**
Design **137 — Team Performance / Workload Analytics** must reuse the canonical workforce, ProjectTeamMembership, ResourceAllocation, TaskAssignment, capacity and Metric Registry foundations established by Designs 036, 112 and 135. It must remain analytical rather than becoming another assignment/work queue or employee-evaluation system.

**Overlap directive:**
Designs **006, 034, 078, 080, 113–147** must preserve one continuous **canonical source-domain state → typed operational-condition adapter → permission-safe OperationalAttentionItem projection → governed priority/responsibility/actionability → source-specific command/reconciliation → canonical source state change**, while Analytics, Notifications, Alerts, Activity, Audit and Incidents remain independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE OPERATIONS COMMAND FOUNDATION — CANONICAL SOURCE-DOMAIN OWNERSHIP + TYPED OPERATIONAL-CONDITION REGISTRY + REBUILDABLE OPERATIONALATTENTIONITEM PROJECTION + EXPLICIT SEVERITY/PRIORITY/URGENCY/HEALTH/ACTIONABILITY SEPARATION + SOURCE-DERIVED RESPONSIBILITY + PERMISSION-BEFORE-COUNTS/RANKING + SOURCE-FRESHNESS METADATA + DEDUPLICATED CONDITION KEYS + CURRENT-STATE REVALIDATION + SOURCE-SPECIFIC ACTION RESOLUTION + OUTCOME-UNKNOWN RECONCILIATION + PARTIAL-FAILURE AWARENESS + DESIGN-139–147 INTEGRATION/AUTOMATION/ALERT/INCIDENT REUSE — AND NEVER ALLOW GENERIC OPSISSUE TABLES, `RESOLVED=true`, MAGIC PRIORITY SCORES, NOTIFICATION READ STATE, TRIAGE ACKNOWLEDGEMENT, JOB TITLES, FRONTEND BUTTONS, STALE PROJECTIONS OR GENERIC RETRY/RESOLVE ENDPOINTS TO SUBSTITUTE FOR OR REWRITE CANONICAL OPERATIONAL SOURCE TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **136 / 153** |
| **PASS**                                   |                        **136** |
| **STANDARDIZE decisions**                  |                        **134** |
| **Potential implementation-overlap flags** |                        **127** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**136 / 153 = 88.9% audited.**

### Canonical Operations Command architecture after Design 136

```text
CANONICAL SOURCE DOMAINS
        │
        ├── Task T-20
        ├── Blocker B-7
        ├── Approval A-4
        ├── ClientRequest CR-9
        ├── PublicationAttempt PA-3
        ├── DistributionExecution DE-8
        ├── ScheduledReportRun SR-6
        ├── AutomationRun AR-2
        └── Incident INC-1
                 │
                 ↓
       Operational Adapters
                 │
                 ↓
     OperationalAttentionItem
                 │
       Severity / Priority
       Responsibility
       Actionability
       Freshness
                 │
                 ↓
       Design 136 Command Center
                 │
                 ↓
        Source-specific command
                 │
                 ↓
       CANONICAL SOURCE DOMAIN
```

The strongest source-truth rule is now explicit:

```text
Command Center says:

Publication failed.

Operator clicks:
Retry Publication.

Design 136 does NOT set:

attentionItem.resolved = true

Instead:

Publication service executes
the canonical retry.

If source later becomes healthy,
the attention projection updates.

Source truth comes first.
```

Acknowledgement remains non-destructive:

```text
Operational condition:
Client assets overdue

Operator:
Acknowledges item

RESULT:

Attention acknowledged

BUT:

ClientRequest remains overdue
Project may remain blocked
Publication may remain delayed

Acknowledged
        ≠
Resolved
```

Unknown external outcomes remain protected:

```text
Distribution execution:
OUTCOME UNKNOWN

Command Center action:

Reconcile

NOT:

Retry

because a blind retry
could create a duplicate
external placement.
```

And Analytics/Operations stay cleanly separated:

```text
Design 135:

Blocked Project Rate
= 12%

        ↓

Measurement / trend

        ≠

Design 136:

Project A blocked by Approval
Project B blocked by Client Request
Project C blocked by missing asset

        ↓

Current operational attention
and source-specific action
```

## Next Sequential Audit Target

### **Design 137 — Team Performance / Workload Analytics**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
