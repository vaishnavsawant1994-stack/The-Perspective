# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 147 — System Health / Status & Incident Management

Design 147 should become the **canonical Team Workspace platform-health, service/component status, dependency health, SLO/availability observation, operational incident lifecycle, impact assessment, incident timeline, mitigation/recovery evidence, and system-reliability command surface**.

Its job is to answer:

> **“Is the platform healthy right now, which canonical service/component is degraded or unavailable, what evidence supports that status, what users/Organizations/capabilities are affected, has the condition become a formal Incident, who is responding, what mitigation/recovery state exists, and when can the Incident be considered resolved based on actual system evidence rather than an acknowledgement button?”**

Design 147 must remain distinct from:

* Design 136 — **Operations Command Center**;
* Designs 139–140 — **IntegrationConnection health**;
* Designs 141–142 — **Automation Run execution/failure**;
* Design 143 — **Alert Rules / Notifications**;
* Design 138 — **Audit / Compliance evidence**;
* Design 146 — **API/Webhook developer access**;
* generic infrastructure logs/metrics/traces.

The strongest boundary is:

> **HealthObservation ≠ CurrentHealth ≠ AlertOccurrence ≠ OperationalAttentionItem ≠ Incident ≠ IncidentImpact ≠ IncidentUpdate ≠ MitigationAction ≠ RecoveryEvidence ≠ ApplicationLog ≠ AuditEvent.**

No exact route is being invented or finalized during Phase 3A.1.

The central implementation rule is:

> **System health is derived from current evidence; Incident state is a governed operational lifecycle. A failed health probe does not automatically become an Incident, an Alert acknowledgement does not resolve an Incident, and manually setting a green status cannot override unhealthy canonical evidence. Incidents must preserve exact component/dependency impact, severity, chronology, mitigation, recovery and post-resolution evidence while logs, metrics, traces, Integration failures, Automation failures, API failures, and Alerts remain canonical in their own systems.**

---

# 1. Classification

| Audit field                       | Classification                                                                                                                                                                        |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                     | **147**                                                                                                                                                                               |
| **Canonical name**                | **System Health / Status & Incident Management**                                                                                                                                      |
| **Product area**                  | Team Workspace / Platform Operations / Reliability                                                                                                                                    |
| **User surface**                  | **Authenticated Team Workspace**                                                                                                                                                      |
| **Screen class**                  | Reliability Command Workspace / Health Monitor / Incident Operations                                                                                                                  |
| **Classification**                | **Canonical Platform Health, Service Status, Incident Lifecycle & Reliability-Response Anchor**                                                                                       |
| **Primary purpose**               | Observe platform health, inspect service/dependency degradation, determine impact, create/manage formal Incidents, coordinate response, and confirm recovery using canonical evidence |
| **Primary component identity**    | `SystemComponent` / `ServiceComponent`                                                                                                                                                |
| **Dependency identity**           | `SystemDependency`                                                                                                                                                                    |
| **Health evidence**               | `HealthObservation`                                                                                                                                                                   |
| **Current-health projection**     | `CurrentComponentHealth`                                                                                                                                                              |
| **Availability/SLO evidence**     | `ServiceLevelIndicatorObservation` / governed reliability metrics                                                                                                                     |
| **Formal incident identity**      | `Incident`                                                                                                                                                                            |
| **Incident impact identity**      | `IncidentImpact`                                                                                                                                                                      |
| **Incident status history**       | `IncidentStateTransition`                                                                                                                                                             |
| **Incident communication/update** | `IncidentUpdate` if present in frozen design                                                                                                                                          |
| **Mitigation evidence**           | `IncidentMitigationAction` / typed action reference                                                                                                                                   |
| **Recovery evidence**             | `RecoveryVerification`                                                                                                                                                                |
| **Alert dependency**              | Design 143                                                                                                                                                                            |
| **Operations dependency**         | Design 136                                                                                                                                                                            |
| **Integration health dependency** | Designs 139–140                                                                                                                                                                       |
| **Automation dependency**         | Designs 141–142                                                                                                                                                                       |
| **Developer access dependency**   | Design 146                                                                                                                                                                            |
| **Audit dependency**              | Designs 039 / 138                                                                                                                                                                     |
| **Analytics dependency**          | Design 038 / 135                                                                                                                                                                      |
| **Authorization dependency**      | Design 144                                                                                                                                                                            |
| **Tenant dependency**             | Design 145                                                                                                                                                                            |
| **Global configuration boundary** | Design 149                                                                                                                                                                            |
| **Health read model**             | `SystemHealthView`                                                                                                                                                                    |
| **Incident read model**           | `IncidentDetailView` / `IncidentOperationsView`                                                                                                                                       |
| **Primary health query service**  | `SystemHealthQueryService`                                                                                                                                                            |
| **Health resolver**               | `SystemHealthResolver`                                                                                                                                                                |
| **Incident service**              | `IncidentService`                                                                                                                                                                     |
| **Impact resolver**               | `IncidentImpactResolver`                                                                                                                                                              |
| **Recovery verifier**             | `IncidentRecoveryService`                                                                                                                                                             |
| **Reliability metric resolver**   | canonical Metric Registry / observability adapters                                                                                                                                    |
| **Parent shell**                  | `InternalAppShell` — Design 001                                                                                                                                                       |
| **Auth**                          | Required                                                                                                                                                                              |
| **Authorization**                 | Active Membership + system-health/incident permissions                                                                                                                                |
| **Implementation priority**       | **Critical Reliability / Incident Response / Production Safety**                                                                                                                      |
| **Reuse level**                   | **Platform-wide across Integrations, Automations, Developer Access, API, queues, storage, publishing, delivery, notifications and core services**                                     |

Design 147 should answer:

> **“Which components are healthy, degraded, unavailable, stale, or unknown; which dependencies are causing impact; what is the blast radius; which formal Incidents are open; what evidence started them; what response actions occurred; what remains affected; and what independent recovery evidence proves the Incident can safely close?”**

Canonical architecture:

```text
Metrics / probes / dependencies / provider evidence
                    │
                    ↓
             HealthObservation
                    │
                    ↓
             SystemHealthResolver
                    │
                    ↓
           CurrentComponentHealth
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
      Healthy             Degraded /
                          Unavailable
                               │
                               ↓
                    Alert / attention may fire
                               │
                               ↓
                     Formal Incident if warranted
                               │
                  ┌────────────┼────────────┐
                  ↓            ↓            ↓
               Impact       Response     Recovery
                  │            │            │
                  └────────────┼────────────┘
                               ↓
                         Incident resolved
```

---

# 2. Reuse

## System health must not become another Integration-health system

Designs 139–140 already own:

> **Is this exact external IntegrationConnection healthy?**

Design 147 owns:

> **Is the platform/service capability healthy at system level?**

Example:

```text
LinkedIn connection IC-20
= DEGRADED

does not automatically mean:

Distribution Platform
= INCIDENT
```

One customer/tenant Integration may be broken while the platform itself is healthy.

---

## Integration health can contribute evidence

Correct:

```text
many LinkedIn connections failing
+
same provider error
+
same time window
+
platform connector failure rate spike
        ↓
possible system incident
```

But Design 147 must not rewrite each `IntegrationConnection`.

---

## Automation failure ≠ System Incident

Critical.

One:

```text
AutomationRun AR-20 failed
```

is normally an Automation failure.

A broad condition such as:

```text
82% of AutomationRuns
failing because queue workers unavailable
```

may warrant a System Incident.

---

## API request failure ≠ System Incident

Design 146 API request failures remain API/runtime telemetry.

Broad API service degradation can contribute to an Incident.

---

## Webhook delivery failure ≠ System Incident

One external endpoint returning `503` is typically receiver-specific.

A platform outbound delivery worker outage affecting many Organizations may be a System Incident.

---

## AlertOccurrence ≠ Incident

Permanent.

### Alert

> Policy matched and raised operator notification.

### Incident

> A formal reliability event requiring managed response.

One Incident may have:

* many Alerts;
* many health observations;
* many affected components.

---

## OperationalAttentionItem ≠ Incident

Design 136 can surface:

> Incident requires update
> Service degraded
> recovery verification overdue

but it remains a projection.

---

## Incident ≠ ApplicationLog

Absolute.

Logs are technical evidence.

Incident is operational/governance lifecycle.

---

## Incident ≠ AuditEvent

Permanent.

Audit may record:

* Incident created;
* severity changed;
* Incident resolved;
* override actions.

But Audit is not the incident timeline itself.

---

## HealthObservation ≠ IncidentUpdate

Critical.

Automated evidence:

> API error rate = 19%.

Human/system operational update:

> Database connection pool increased; error rate falling.

Different records.

---

## IncidentUpdate ≠ AuditEvent

An Incident update is response communication/context.

Audit is governance evidence about actions.

---

## Health state ≠ Incident state

Critical.

Possible valid state:

```text
Component health = HEALTHY

Incident = MONITORING
```

because service recovered but responders are validating stability.

Or:

```text
Component health = DEGRADED

Incident = MITIGATING
```

These cannot share one status enum.

---

## Incident severity ≠ component health

Permanent.

A degraded low-impact internal service may be low severity.

A narrow outage of a critical payment/publishing capability may be high severity.

---

## Incident severity ≠ Alert severity

Permanent.

---

## Incident severity ≠ operational priority

Design 136 priority remains separate.

---

## Component status ≠ SLO compliance

Critical.

A service can currently be healthy while monthly availability SLO is already breached.

---

## SLO breach ≠ Incident automatically

A long-term reliability target breach may require review without a current outage.

---

# 3. Entities

## SystemComponent

Canonical reliability-observation subject.

Conceptually:

```text
SystemComponent
├── id
├── componentKey
├── displayName
├── componentType
├── criticality
├── owner/team reference?
├── lifecycle
└── revision
```

Examples should come from actual implementation architecture later, not be invented as arbitrary UI cards.

---

## Component ≠ deployment instance

Permanent.

Example:

> API Service

can be the operational component identity.

Individual pods/containers belong observability unless product explicitly exposes them.

---

## Component hierarchy

If needed:

```text
Platform
├── API
├── Background Processing
├── Notification Delivery
└── Integration Runtime
```

Hierarchy must be explicit.

Do not infer from card nesting.

---

## SystemDependency

Conceptually:

```text
SystemDependency
├── id
├── componentId
├── dependencyType
├── targetComponentId?
├── externalProvider?
├── criticality
└── revision
```

This can represent:

* internal service dependencies;
* queues;
* storage;
* external providers;

without merging them into IntegrationConnections.

---

## External provider dependency ≠ IntegrationConnection

Critical.

Example:

> Microsoft Graph provider availability

is system-level dependency.

`IntegrationConnection IC-20`

is tenant/account-specific authorization.

---

## HealthObservation

Append-oriented evidence.

Conceptually:

```text
HealthObservation
├── id
├── componentId
├── observationType
├── healthClass
├── observedAt
├── recordedAt
├── source
├── freshness
├── safeEvidence
├── region/context?
└── revision/schemaVersion
```

---

## Health sources

May include:

* synthetic probes;
* service metrics;
* queue measurements;
* dependency health;
* application error-rate aggregates;
* provider availability.

But raw telemetry remains in observability.

---

## Observation ≠ raw metric sample

Only normalized operational evidence required by product health model should become `HealthObservation`.

Do not duplicate entire monitoring backend.

---

## CurrentComponentHealth

Derived projection.

Conceptually:

```text
CurrentComponentHealth
├── componentId
├── healthClass
├── derivedAt
├── dataThrough
├── freshness
├── confidence/evidence state
├── contributingObservationRefs[]
└── healthPolicyVersion
```

---

## Health policy must be centralized

No individual card should decide:

```text
if errorRate > 5:
  red
```

in frontend.

---

## Health classes

Conceptually:

```text
HEALTHY
DEGRADED
UNAVAILABLE
UNKNOWN
```

Potential maintenance state only if frozen product supports it.

---

## Unknown ≠ Healthy

Absolute.

---

## No telemetry ≠ Healthy

Absolute.

---

## Stale evidence ≠ current Healthy

Permanent.

---

## ServiceLevelIndicatorObservation

If Design 147 shows uptime/performance metrics:

reuse Design-038 Metric Registry semantics.

Conceptually:

```text
SLI observation
├── MetricDefinition
├── period
├── numerator
├── denominator
├── value
├── freshness
└── provenance
```

No local formulas.

---

## SLI ≠ SLO

### SLI

Measured reliability.

### SLO

Target.

---

## Error budget

If frozen UI exposes it:

derive from canonical SLO/SLI policy.

Do not invent otherwise.

---

# Incident entity

## Incident

Canonical formal reliability event.

Conceptually:

```text
Incident
├── id
├── organizationScope / platform scope
├── title
├── incidentState
├── severity
├── startedAt
├── detectedAt
├── declaredAt
├── resolvedAt?
├── primaryComponentId?
├── incidentCommander/owner?
├── causeState
├── createdBy
└── revision
```

Exact scope needs Phase 3D.

Because Design 147 is system-level, Incidents may be platform-global or internally scoped rather than ordinary tenant business records.

This must be explicitly separated from Organization-owned operational records.

---

## Incident scope

Critical.

Possible:

```text
PLATFORM_GLOBAL
REGION
SERVICE
TENANT_IMPACTING
```

according to real infrastructure.

Do not create tenant Incident copies for one global outage unless intentional.

---

## Platform Incident ≠ Organization business Incident

Design 147 is system reliability.

Do not mix:

> Client project risk/blocker

with:

> platform database outage.

---

## Incident start time ≠ detection time

Important.

Example:

```text
actual degradation began: 10:02
detected: 10:05
incident declared: 10:08
```

All may matter.

---

## Incident resolvedAt ≠ last healthy observation

Resolution is a governed decision based on recovery evidence.

---

## Incident severity

Versioned/governed taxonomy.

Example conceptually:

```text
SEV1
SEV2
SEV3
SEV4
```

or Critical/High/Medium/Low according to frozen system.

Exact names later.

---

## Severity ≠ status

Permanent.

---

## IncidentState

Conceptually:

```text
DECLARED
INVESTIGATING
IDENTIFIED
MITIGATING
MONITORING
RESOLVED
```

Only use states supported by frozen Design 147 / Phase 3D.

Do not overfit labels now.

---

## Incident state transition

Prefer append-oriented:

```text
IncidentStateTransition
├── incidentId
├── fromState
├── toState
├── actor
├── occurredAt
├── reason?
└── revision
```

Historical chronology must remain.

---

## IncidentImpact

First-class.

Conceptually:

```text
IncidentImpact
├── incidentId
├── component/capability reference
├── impactClass
├── affectedScope
├── startedAt
├── endedAt?
├── evidenceRefs[]
└── revision
```

---

## Impact ≠ cause

Critical.

Example:

> API requests failing

is impact.

> expired database credential

may be cause.

Do not conflate.

---

## Impact ≠ severity

Severity is derived/governed from impact/criticality, not identical to any one impact record.

---

## Root cause

Do not require known root cause before Incident declaration.

Use:

```text
causeState = UNKNOWN / SUSPECTED / CONFIRMED
```

or equivalent if tracked.

---

## Suspected cause ≠ confirmed cause

Absolute.

---

## IncidentUpdate

If present in frozen UI:

```text
IncidentUpdate
├── incidentId
├── author/system actor
├── updateType
├── message
├── createdAt
└── visibility
```

Could represent internal operational updates.

Do not invent public status-page publishing unless frozen product supports it.

---

## IncidentUpdate ≠ root cause

Permanent.

---

## IncidentMitigationAction

Could be a typed reference to actual source actions:

* rollback deployment;
* disable feature;
* switch provider;
* pause queue.

But do not create generic executable free-form commands inside Incident itself.

---

## MitigationAction ≠ successful mitigation

Record:

* intended action;
* execution reference;
* outcome.

---

## RecoveryVerification

Strong concept.

Conceptually:

```text
RecoveryVerification
├── incidentId
├── componentId
├── verifiedAt
├── healthEvidenceRefs[]
├── verificationWindow
├── result
└── policyVersion
```

This supports:

> recovery has remained healthy for X evidence window.

---

## Green button ≠ recovery verification

Absolute.

---

## Resolution ≠ data deletion

Historical Incident remains immutable enough for retrospective/compliance.

---

# 4. Permissions

Design 147 should conceptually distinguish:

```text
systemHealth.read
systemHealth.readDiagnostics

incident.read
incident.create
incident.update
incident.changeSeverity
incident.assign
incident.mitigate
incident.resolve

incident.readSensitiveDiagnostics
incident.export
```

Exact identifiers belong to Phase 3D.

---

## System-health read ≠ Incident administration

Permanent.

---

## Incident create ≠ Incident resolve

Permanent.

---

## Incident update ≠ severity change

Could require separate permission for high-impact changes.

---

## Incident resolve ≠ manually set component healthy

Absolute.

---

## Health diagnostics read ≠ raw infrastructure-secret access

Permanent.

---

## Incident operator ≠ Integration admin

A responder can investigate:

> Microsoft connector failures

without being able to rotate every customer's credentials.

---

## Incident operator ≠ developer-access admin

Likewise.

---

## Incident response ≠ Role admin

Design 144 remains security authority.

---

## System component ownership ≠ authorization

A Team listed as operational owner does not automatically gain security permissions.

---

## Cross-tenant health details

System-wide responders may need aggregate/platform visibility.

Ordinary Organization admins should not gain details about other Organizations from platform health data.

---

## Tenant impact counts need privacy controls

Example:

> 137 Organizations affected

may be safe aggregate.

Names/details require explicit permission.

---

## Incident deep links reauthorize

Opening:

* IntegrationConnection;
* AutomationRun;
* API key;
* Organization;
* AuditEvent;

requires source-domain permissions.

---

## Diagnostic metadata may be sensitive

Do not expose:

* internal hostnames;
* database credentials;
* security controls;
* secret configuration;
* customer identifiers;

merely because user can read incident summaries.

---

# 5. States

Design 147 must keep **component health, evidence freshness, Incident lifecycle, severity, cause certainty, impact state, mitigation state, recovery verification, Alert state, and operational attention state** separate.

### Component health

```text
Healthy
Degraded
Unavailable
Unknown
```

### Evidence freshness

```text
Fresh
Aging
Stale
Unknown
```

### Incident lifecycle

Conceptually:

```text
Declared
Investigating
Identified
Mitigating
Monitoring
Resolved
```

### Cause state

```text
Unknown
Suspected
Confirmed
```

### Impact

```text
Active
Reduced
Recovered
Unknown
```

### Recovery

```text
Not Started
Pending Evidence
Verifying
Verified
Failed Verification
```

These must never collapse into:

```text
system_status
```

---

## Health degraded ≠ Incident declared

Permanent.

---

## Incident open ≠ all components unavailable

Permanent.

---

## Component recovered ≠ Incident resolved immediately

Critical.

Monitoring/recovery verification may still be required.

---

## Incident resolved ≠ SLO restored retrospectively

Permanent.

A resolved outage still contributes to monthly downtime/SLO impact.

---

## Incident acknowledged ≠ Incident resolved

If acknowledgement exists.

---

## Alert acknowledged ≠ Incident acknowledged

Separate entities.

---

## Incident severity lowered ≠ component recovered

Permanent.

---

## Root cause identified ≠ mitigation complete

Permanent.

---

## Mitigation applied ≠ recovery verified

Critical.

---

## Monitoring ≠ resolved

Permanent.

---

## No open Incidents ≠ platform healthy

Absolute.

Health evidence could be degraded before Incident declaration.

---

## No failing health checks ≠ complete telemetry

If evidence unavailable:

health may be Unknown.

---

## Partial observability ≠ Healthy

Absolute.

---

## Current healthy ≠ historical no outage

Permanent.

---

## State Coverage

Design 147 inherits Design 150 plus:

```text
System Health Loading
System Health Available
System Health Partial
System Health Restricted
System Health Unavailable

Component Healthy
Component Degraded
Component Unavailable
Component Health Unknown

Health Evidence Fresh
Health Evidence Aging
Health Evidence Stale
Health Evidence Unknown

Incident Declared
Incident Investigating
Incident Identified
Incident Mitigating
Incident Monitoring
Incident Resolved
Incident State Unknown

Incident Severity Critical/High/Medium/Low
or canonical equivalent

Cause Unknown
Cause Suspected
Cause Confirmed

Impact Active
Impact Reduced
Impact Recovered
Impact Unknown

Mitigation Planned
Mitigation In Progress
Mitigation Completed
Mitigation Failed
Mitigation Outcome Unknown

Recovery Not Started
Recovery Pending Evidence
Recovery Verifying
Recovery Verified
Recovery Verification Failed

Dependency Healthy
Dependency Degraded
Dependency Unavailable
Dependency Unknown

Alert Active
Alert Acknowledged
Alert Cleared

Incident Updated Elsewhere
Health Observation Updated
Severity Updated Elsewhere
Impact Updated Elsewhere
Recovery Evidence Arrived
Dependency State Changed
System Health Projection Stale
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize:

```text
Overall platform health
↓
Critical components
↓
Degraded/unavailable dependencies
↓
Open Incidents
↓
Severity + impact
↓
Incident chronology
↓
Mitigation / recovery
↓
Evidence freshness
```

Only regions present in frozen Design 147 should render.

---

## Overall status must never hide partial health

Incorrect:

> Platform Operational

while one critical service is unavailable.

Correct system should reflect governed aggregate health semantics.

---

## Component cards need evidence age

Better:

> API — Healthy · verified 45 sec ago

than:

> API — Healthy.

---

## Unknown should have its own visual state

Do not use green/gray ambiguity.

---

## Incident summary should emphasize impact

Example:

> SEV-2 · Notification delivery delayed
> API unaffected
> 24% of outbound notifications delayed

where canonical evidence supports it.

---

## Do not make raw infrastructure diagnostics the default UI

Primary operator view should show:

* component;
* impact;
* timeline;
* evidence;
* mitigation;
* recovery.

Raw logs/traces belong observability tooling.

---

## Incident timeline

If present in frozen design, chronology should differentiate:

```text
10:02 degradation began
10:05 alert fired
10:08 incident declared
10:17 cause suspected
10:23 mitigation deployed
10:31 health recovered
10:45 recovery verified
10:48 incident resolved
```

Do not flatten these into one timestamp.

---

## Historical vs current health should be clear

Example:

> At incident start: unavailable
> Current: healthy
> Incident: monitoring

This is valid.

---

## Resolve action

If present:

server should expose it only when recovery policy permits.

The UI must not independently decide:

> all cards green → enable resolve.

---

## Tablet

Following Design 152:

* global health first;
* component cards stack;
* Incidents become condensed cards;
* impact/timeline details move into expandable sections;
* recovery status remains visible.

---

## Mobile

Priority:

```text
Overall health
↓
Critical degraded component
↓
Open Incident
↓
Severity
↓
Impact
↓
Current response state
↓
Recovery evidence
↓
Allowed action
```

Avoid dense infrastructure matrices.

---

## Mobile Incident card

Conceptually:

> SEV-2
> Notification Delivery Delay
> Status: Monitoring
> Impact: outbound notifications delayed
> Current component health: Healthy
> Recovery verification: 8 of 15 minutes complete

if supported by canonical recovery policy.

---

## Accessibility

An Incident could communicate:

> Incident INC-24 is severity 2 and is currently in Monitoring state. Notification Delivery was unavailable from 10:02 to 10:31. The component is currently healthy, but the Incident remains open while recovery verification continues. The suspected cause is a queue-processing failure and is not yet confirmed. Current health evidence was collected forty-five seconds ago.

where evidence supports it.

---

# 7. Backend Requirements

## Canonical System Health architecture

```text
Synthetic probes
Service metrics
Queue metrics
Dependency health
Provider health
API failure rates
Worker heartbeat
        │
        ↓
Observability adapters
        │
        ↓
Normalized HealthObservations
        │
        ↓
SystemHealthResolver
        │
        ↓
CurrentComponentHealth
```

Incident architecture:

```text
Health / Alert / operator evidence
                │
                ↓
           IncidentService
                │
                ↓
             Incident
                │
       ┌────────┼─────────┐
       ↓        ↓         ↓
     Impact   Timeline   Response
                           │
                           ↓
                     Recovery evidence
                           │
                           ↓
                      Resolution gate
```

---

## Do not build a replacement observability platform

Design 147 should **consume normalized evidence from monitoring/observability systems**.

It should not replicate:

* complete logs;
* traces;
* Prometheus/time-series storage;
* APM data;
* infrastructure dashboards.

---

## Observability adapters

Conceptually:

```text
HealthObservationAdapter
├── ApplicationMetricAdapter
├── QueueHealthAdapter
├── DependencyHealthAdapter
├── IntegrationPlatformHealthAdapter
├── DeveloperApiHealthAdapter
└── WorkerHealthAdapter
```

Only adapters actually needed by implementation should exist.

---

## HealthObservation normalization

Raw telemetry should map to governed health evidence.

Example:

```text
API 5xx rate
= 18%

HealthObservation:
component API
health = DEGRADED
observedAt = ...
source = error-rate policy v3
```

---

## Health policy registry

Strongly recommended:

```text
SystemHealthPolicyRegistry
```

defines:

* component;
* evidence sources;
* thresholds;
* required quorum;
* freshness;
* aggregation;
* degradation rules.

No frontend health formulas.

---

## Health policy versioning

Important.

If threshold changes:

historical health interpretations should remain explainable.

---

## No single-probe truth where inappropriate

Example:

one failed synthetic probe from one region may not justify:

> API unavailable globally.

Health resolver should use governed evidence semantics.

---

## Regional health

If infrastructure is regional and frozen UI exposes it:

region/context must be first-class.

Do not invent geography if absent.

---

## Dependency-aware health

Example:

```text
Notification Service
healthy internally

Email Provider
unavailable
```

Effective capability may be degraded even if internal worker is healthy.

Keep:

* component health;
* dependency health;
* effective capability health;

separate where needed.

---

## Current-health query

Conceptually:

```text
getSystemHealth(currentMembership)
```

should:

1. authenticate;
2. authorize system-health visibility;
3. load canonical component registry;
4. load current health projections;
5. include freshness/evidence state;
6. permission-filter sensitive diagnostics;
7. return open Incident summaries.

---

# Incident declaration

## Incident creation

Conceptually:

```text
declareIncident(
    title,
    severity,
    affectedComponents,
    sourceEvidenceRefs,
    currentMembership
)
```

should:

1. authorize;
2. validate component references;
3. capture source evidence;
4. prevent accidental duplicate active Incident where correlation policy applies;
5. record declaredAt/actor;
6. create Incident;
7. emit Audit/outbox;
8. optionally trigger Alert/Operations projections.

---

## Automatic incident declaration

Do not assume.

Alerts/health conditions can suggest/create Incident candidates only if explicit product policy exists.

Otherwise require authorized human declaration.

---

## Duplicate Incident detection

Important.

One outage should not create:

```text
API Incident
Queue Incident
Notification Incident
Integration Incident
```

if they are clearly one causal event, unless intentionally separate.

Use correlation suggestions/policies, not automatic blind merging.

---

## Incident merge

Do not introduce merge workflow unless frozen UI supports it.

Phase 3D can maintain correlation metadata without inventing a screen action.

---

## Incident severity resolver

Severity may be manually declared with guardrails or derived/advised from:

* criticality;
* affected users;
* affected capability;
* duration;
* scope.

If UI lets operator select severity, server still validates permitted taxonomy and change authority.

---

## Severity change

Preserve history.

Never overwrite original severity without transition evidence.

---

## Incident impact resolver

Conceptually:

```text
IncidentImpactResolver.resolve(incidentId)
```

may combine:

* affected components;
* dependency graph;
* error rates;
* tenant/capability counts;
* downstream failures.

---

## Affected Organization count

If derived:

permission/privacy-safe aggregation required.

---

## Do not infer all customers impacted from component failure

Use actual evidence where possible.

---

## Incident assignment

If frozen design includes owner/commander:

assignment is operational responsibility.

It does not grant RBAC.

---

## Incident ownership ≠ authorization

Permanent.

---

## Incident updates

If present:

append updates.

Do not overwrite one mutable `incident.notes` blob.

---

## Update chronology

Each update preserves:

* actor;
* time;
* visibility;
* type.

---

## Incident mitigation actions

Should reference canonical execution where possible.

Example:

```text
FeatureFlag change
Deployment rollback
Queue restart
Integration disable
```

Incident records evidence/reference.

Source system performs actual action.

---

## Generic arbitrary shell command from Incident UI

Prohibited unless separate secure operations tooling explicitly supports it.

Do not turn Design 147 into a remote-command console.

---

## Recovery verification

Critical.

Conceptually:

```text
verifyIncidentRecovery(
    incidentId,
    currentMembership/system
)
```

should evaluate:

* current health;
* required components;
* dependency health;
* freshness;
* stabilization window;
* unresolved critical impacts.

---

## Recovery window

Should be policy-based where needed.

Example:

> Healthy continuously for 15 minutes.

Do not hard-code frontend timer.

---

## Recovery evidence must survive restart

Use persisted timestamps/observations.

---

## Resolve Incident

Conceptually:

```text
resolveIncident(
    incidentId,
    expectedRevision,
    resolutionSummary?,
    currentMembership
)
```

must:

1. authorize;
2. re-read current Incident;
3. re-run recovery/impact checks;
4. ensure required recovery policy satisfied or require explicit governed override;
5. record transition;
6. preserve recovery evidence;
7. set resolvedAt;
8. emit Audit/outbox.

---

## Manual override

If frozen product allows resolve despite incomplete verification:

require:

* stronger permission;
* reason;
* AuditEvent;
* preservation of failed recovery evidence.

Do not invent if absent.

---

## Reopen semantics

If service degrades again shortly after resolution:

normally create a new incident episode or explicitly reopen based on governed policy.

Do not silently rewrite prior resolved period.

Exact policy Phase 3D.

---

## Incident cause

Root-cause analysis may remain incomplete during Incident.

Never block mitigation because cause unknown.

---

## Cause confirmation

If cause is eventually confirmed:

append/update structured cause state without rewriting earlier suspected chronology.

---

# Integration with Design 143

Alert Rules can observe:

* service degraded;
* Incident declared;
* recovery failed.

Notification delivery does not alter Incident.

---

# Integration with Design 136

Command Center may surface:

* critical open Incident;
* recovery verification needed;
* component degradation.

Attention acknowledgement does not alter Incident.

---

# Integration with Designs 139–140

System health can consume aggregate connector/provider evidence.

It must never:

* rotate tenant credentials;
* disconnect customer IntegrationConnection;
* mark all connections failed from one platform Incident.

---

# Integration with Designs 141–142

Automation failure-rate spikes may contribute health/Incident evidence.

Historical Runs remain unchanged.

---

# Integration with Design 146

Potential system-level health signals:

* API authentication service unavailable;
* developer webhook delivery worker outage;
* event queue backlog;
* signing service failure.

Individual revoked keys or customer endpoint failures are not System Incidents by themselves.

---

# Integration with Design 138

Material Incident governance actions should Audit:

* declared;
* severity changed;
* owner changed;
* resolved;
* privileged override.

Routine health observations should not flood Audit.

---

## Incident timeline vs Audit

Incident timeline may contain:

* automatic health changes;
* responder updates;
* mitigation;
* recovery.

Audit remains narrower governance evidence.

---

## Idempotency

Required for:

* health-observation ingestion;
* Incident declaration requests;
* state transitions;
* mitigation references;
* recovery verification;
* resolution.

---

## Concurrency

Critical races:

### Two responders declare same Incident

Dedup/correlation guard where applicable.

### Component recovers while Incident severity changes

Both facts remain; re-evaluate state safely.

### Two responders resolve Incident simultaneously

Expected revision / transactional state transition.

### New failure arrives during recovery verification

Recovery must fail/reset according to policy.

### Incident resolved while late health evidence arrives

Late evidence must not silently rewrite resolved history; may trigger a new/open condition according to policy.

---

## Incident state machine

Server-authoritative.

No arbitrary:

```text
PATCH incident.status = "resolved"
```

without transition validation.

---

## Transition registry

Conceptually:

```text
IncidentStateMachine
```

defines valid transitions and required permissions/evidence.

---

## Health projections

Materialized/current health projections are rebuildable.

Raw normalized observations remain canonical evidence.

---

## SLO calculation

Reuse Design-038 Metric Registry.

Do not compute uptime locally in Design 147.

---

## Availability calculation

Be careful with:

* partial outages;
* regions;
* maintenance;
* unknown telemetry;
* excluded windows.

MetricDefinition must own semantics.

---

## Zero errors ≠ healthy if telemetry absent

Absolute.

---

## Alert storm correlation

A global service outage may produce hundreds of Design-143 alerts.

Design 147 should correlate at component/Incident level rather than count Alerts as independent outages.

---

## Status communication

If frozen Design 147 includes internal status updates, reuse IncidentUpdate.

Do **not** invent a public status page, subscriber system, or customer-status portal in Phase 3A.1.

---

## Incident retrospective

Do not duplicate Design 122 project retrospective.

A future incident postmortem would be a reliability-domain artifact only if frozen product includes it.

Do not invent it here.

---

## Retention

Incidents and recovery evidence should remain long-lived operational history according to governance policy.

Health observations may have different retention tiers.

---

## Search

Incident/health search must be permission-safe.

Sensitive component names/configuration may require restricted diagnostics permission.

---

## Cache

System-health cache can vary by:

```text
componentRegistryRevision
healthObservationRevision
healthPolicyVersion
dependencyHealthRevision
incidentRevision
authorizationScope
```

Health caches must be short-lived/freshness-aware.

---

## Never cache green status indefinitely

Absolute.

---

## Performance

Use:

* continuously maintained current-health projections;
* time-series/observability backend for raw telemetry;
* indexed active Incident records;
* compact Incident summaries;
* lazy timeline/evidence;
* batched component health queries;
* event-driven invalidation.

Do not query every provider/log source synchronously when Design 147 opens.

---

## Partial failure contract

Example:

```text
API health             ✓
Queue health           ✓
External provider data ✕
```

Correct:

> Core platform health is available. External provider dependency state is currently unknown.

Incorrect:

> All systems operational.

Another:

```text
Incident record       ✓
Current telemetry     unavailable
```

Correct:

> Incident remains open. Current recovery status cannot be verified.

Not:

> Incident resolved because no new errors are visible.

Another:

```text
Component healthy     ✓
Impact resolver       partial
```

Correct:

> Component has recovered; full affected-tenant impact is still being calculated.

Not:

> All users recovered.

---

## Backend Requirement Matrix

| Requirement                                       | Status                    |
| ------------------------------------------------- | ------------------------- |
| HealthObservation/CurrentHealth separation        | **Critical**              |
| CurrentHealth/Incident separation                 | **Critical**              |
| AlertOccurrence/Incident separation               | **Critical**              |
| OperationalAttention/Incident separation          | **Critical**              |
| Incident/ApplicationLog separation                | **Critical**              |
| Incident/AuditEvent separation                    | **Critical**              |
| Incident/IntegrationConnection separation         | **Critical**              |
| Incident/AutomationRun separation                 | **Critical**              |
| Incident/API/Webhook failure separation           | **Critical**              |
| Component health/SLO separation                   | **Critical**              |
| SLI/SLO separation                                | **Critical**              |
| Central component registry                        | **Critical architecture** |
| Central health policy resolver                    | **Critical**              |
| Timestamped append-oriented health evidence       | **Critical**              |
| Health freshness                                  | **Critical**              |
| Unknown ≠ Healthy                                 | **Critical**              |
| Partial telemetry handling                        | **Critical**              |
| Dependency-aware health                           | **Critical**              |
| Platform dependency/tenant Integration separation | **Critical**              |
| Incident stable identity                          | **Critical**              |
| Started/detected/declared time separation         | **Critical**              |
| Incident status/severity separation               | **Critical**              |
| Impact/cause separation                           | **Critical**              |
| Suspected/confirmed cause separation              | **Critical**              |
| Incident updates/history preservation             | **Critical**              |
| State-transition history                          | **Critical**              |
| Mitigation action/source command separation       | **Critical**              |
| Recovery evidence/green badge separation          | **Critical**              |
| Recovery verification before resolution           | **Critical**              |
| Server-authoritative Incident state machine       | **Critical**              |
| Resolve current-state revalidation                | **Critical**              |
| Optional override strongly governed               | **Critical if present**   |
| Design 038 Metric Registry reuse for SLOs         | **Critical**              |
| Design 136 projection reuse                       | **Critical architecture** |
| Design 143 Alert reuse                            | **Critical architecture** |
| Designs 139–140 health evidence reuse             | **Critical architecture** |
| Designs 141–142 automation evidence reuse         | **Critical architecture** |
| Design 146 developer-access health reuse          | **Critical architecture** |
| Design 138 privileged-change Audit reuse          | **Critical**              |
| Sensitive diagnostic permissions                  | **Critical**              |
| Permission-safe impact aggregation                | **Critical**              |
| No synchronous provider fan-out on page load      | **Critical performance**  |
| Idempotency                                       | **Critical**              |
| Optimistic concurrency/state transitions          | **Critical**              |
| Freshness-aware caching                           | **Critical**              |
| Partial dependency failure handling               | **Critical**              |

---

# 8. Consolidation

Design 147 carries major overlap risk because almost every technical domain has its own concept of `"failed"`, `"degraded"`, `"error"`, `"alert"`, or `"incident"`.

**HealthObservation / CurrentHealth conflation**
One probe result becomes permanent system status.

**CurrentHealth / Incident conflation**
Every degraded component becomes an Incident.

**Incident / AlertOccurrence conflation**
Notification lifecycle becomes reliability response lifecycle.

**Incident / OperationalAttentionItem conflation**
Command Center acknowledgement changes Incident state.

**Incident / IntegrationConnection failure conflation**
One customer's expired OAuth grant becomes platform outage.

**Incident / AutomationRun failure conflation**
One failed workflow becomes production Incident.

**Incident / developer webhook delivery failure conflation**
Customer endpoint outage becomes platform Incident.

**Incident / API request failure conflation**
One bad request becomes service outage.

**Incident / ApplicationLog conflation**
Stack traces become incident lifecycle.

**Incident / AuditEvent conflation**
Compliance record becomes response timeline.

**Health / observability telemetry conflation**
Design 147 tries to replicate monitoring backend.

**Health probe / service health conflation**
One failed check marks service unavailable.

**No health data / Healthy conflation**
Monitoring outage appears green.

**Stale green / current green conflation**
Old evidence masks outage.

**Dependency health / component health conflation**
Internal service and provider dependency semantics disappear.

**External provider health / IntegrationConnection health conflation**
Global Microsoft status rewrites tenant credential state.

**Current service health / SLO compliance conflation**
Recovered service appears to meet monthly reliability target.

**SLO breach / active Incident conflation**
Historical error budget failure appears as current outage.

**Incident status / severity conflation**
SEV1 becomes equivalent to Investigating.

**Incident impact / severity conflation**
One impact record becomes global severity.

**Incident impact / cause conflation**
Symptoms become root cause.

**Suspected cause / confirmed cause conflation**
Early hypothesis becomes historical fact.

**Incident start / detection conflation**
Detection delay disappears.

**Detection / declaration conflation**
Operational response timing becomes inaccurate.

**Component recovered / Incident resolved conflation**
No stabilization window.

**Mitigation deployed / recovery verified conflation**
Change execution appears successful without evidence.

**Health green / recovery verification conflation**
One good probe closes Incident.

**Resolve button / canonical recovery conflation**
Operator manually paints Incident green.

**Acknowledged Alert / Incident resolved conflation**
Awareness becomes recovery.

**Incident owner / RBAC authority conflation**
Assigned responder gets unauthorized platform powers.

**Component owner / authorization conflation**
Team ownership bypasses permissions.

**Incident update / AuditEvent conflation**
Response communication floods compliance log.

**Incident timeline / ApplicationLog conflation**
Raw logs dominate operational chronology.

**Incident mitigation / arbitrary shell command conflation**
Reliability UI becomes remote admin console.

**Incident resolution / delete Incident conflation**
History disappears.

**Resolved Incident / erased SLO impact conflation**
Reliability reporting becomes false.

**Late health evidence / rewrite resolved Incident conflation**
Historical closure changes silently.

**Repeated outage / same Incident forever conflation**
Distinct episodes lose boundaries.

**Multiple Alerts / multiple Incidents conflation**
Alert storm generates Incident storm.

**Multiple affected components / multiple causal Incidents conflation**
One platform outage fragmented arbitrarily.

**Tenant-specific impact / platform-global Incident conflation**
One Organization issue is shown as universal.

**Platform-global Incident / tenant-owned business entity conflation**
Incident stored like ordinary Client/Project data without scope semantics.

**Affected Organization count / customer identity disclosure conflation**
Reliability view leaks cross-tenant information.

**Component name / infrastructure secret conflation**
Internal architecture unnecessarily exposed.

**Raw metric formula / health policy conflation**
Frontend calculates status independently.

**Generic `is_healthy`**
No evidence/freshness/dependency semantics.

**Generic `status = red/yellow/green`**
No health/Incident/impact distinction.

**Generic `incident.status = resolved` PATCH**
Bypasses recovery gate.

**Generic `root_cause` text set immediately**
Suspected/confirmed cause lost.

**Generic `last_error`**
No normalized evidence/history.

**Generic `affected_users` integer**
No provenance/scope.

**Generic `uptime` formula**
Duplicates Design 038 Metric Registry.

**Generic `maintenance=true`**
Can hide real incidents if not governed.

**147/136 duplicate operations state**
Command Center becomes Incident authority.

**147/138 duplicate compliance timeline**
Incident and Audit histories merge.

**147/139–140 duplicate Integration health**
Tenant/provider health forks.

**147/141–142 duplicate Automation failure state**
Runs become system incidents.

**147/143 duplicate Alert lifecycle**
Acknowledgements mutate Incident.

**147/146 duplicate API/Webhook failure state**
Developer endpoint problems become platform status.

No additional screen is required.

These are **canonical health-evidence normalization, current-health derivation, formal Incident lifecycle, impact/severity/cause separation, recovery verification, observability reuse, and strict Alert/Operations/Integration/Automation/API boundaries**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PLATFORM HEALTH, SERVICE STATUS, INCIDENT LIFECYCLE & RELIABILITY-RESPONSE ANCHOR**

**Domain directive:**
**SystemComponent ≠ SystemDependency ≠ HealthObservation ≠ CurrentComponentHealth ≠ ServiceLevelIndicator ≠ SLO ≠ AlertOccurrence ≠ OperationalAttentionItem ≠ Incident ≠ IncidentImpact ≠ IncidentStateTransition ≠ IncidentUpdate ≠ MitigationAction ≠ RecoveryVerification ≠ ApplicationLog ≠ AuditEvent.**

**Health-foundation directive:**
Design 147 owns normalized system-level health/Incident management but does not replace the underlying observability platform, Integration health, Automation execution, Developer API telemetry, or source-domain state.

**Component directive:**
one canonical `SystemComponent` registry identifies product/service health subjects; individual containers/pods/processes remain observability details unless explicitly modeled.

**Observation directive:**
`HealthObservation` is timestamped normalized evidence and never a manually editable system status.

**Current-health directive:**
`CurrentComponentHealth` is a rebuildable projection derived by one server-side governed `SystemHealthResolver` from recent evidence, dependencies, health policies and freshness.

**No-data directive:**
missing, unavailable, partial, or stale health evidence never resolves to Healthy by default.

**Freshness directive:**
every current-health conclusion carries evidence freshness/data-through context; green status cannot outlive its evidence indefinitely.

**Health-policy directive:**
thresholds, quorum, dependency effects and aggregation rules belong to a versioned server-side health policy registry rather than frontend color logic.

**Dependency directive:**
internal dependency health and external provider/platform dependency health remain distinct from tenant-specific `IntegrationConnection` health.

**Integration directive:**
Designs 139–140 remain exact tenant connection/auth/capability authority. Design 147 may consume aggregate connector/provider reliability evidence but never rewrites individual IntegrationConnections.

**Automation directive:**
Designs 141–142 remain AutomationRun truth. Individual failed Runs do not become Incidents; system-level Automation-engine degradation can contribute Incident evidence.

**Developer-access directive:**
Design 146 remains API credential/developer webhook authority. Individual invalid keys or customer webhook endpoints are not system Incidents, while shared API auth/delivery worker outages can contribute health evidence.

**Alert directive:**
Design 143 AlertOccurrences notify/triage on conditions but never become canonical Incident state. Alert acknowledgement/dismissal cannot resolve Incident or source health.

**Operations directive:**
Design 136 may surface Incident/health conditions as `OperationalAttentionItem`s but acknowledgement, snooze or prioritization never alters canonical health or Incident lifecycle.

**Audit directive:**
Design 138 records privileged Incident governance actions such as declaration, severity change, owner reassignment, resolution and override while routine probes/telemetry remain outside global Audit noise.

**Observability directive:**
logs, traces, metrics, queue telemetry and technical diagnostics remain in observability systems and are referenced/normalized rather than duplicated wholesale into Design 147.

**Metric directive:**
SLO/availability/error-budget metrics reuse Design-038 canonical MetricDefinition/Aggregate semantics, including unit, denominator, window, freshness and provenance.

**SLI/SLO directive:**
measured service reliability and reliability target remain separate; current health and historical SLO compliance cannot substitute for one another.

**Incident directive:**
`Incident` is a durable formal reliability-response identity and never a synonym for a failed probe, Alert, log entry, AutomationRun, Integration error or OperationalAttentionItem.

**Incident-scope directive:**
Incident scope explicitly distinguishes platform/global/service/region/tenant-impact dimensions where needed; a global outage is not duplicated as unrelated tenant business records.

**Time directive:**
incident start, detection, declaration, mitigation, recovery and resolution timestamps remain separately preserved.

**Severity directive:**
Incident severity remains independent from Incident state, component-health state, Alert severity and Design-136 priority.

**Impact directive:**
`IncidentImpact` records affected components/capabilities/scopes with evidence and remains separate from severity and root cause.

**Cause directive:**
unknown, suspected and confirmed cause remain distinct; responders can mitigate before root cause is confirmed.

**State-machine directive:**
Incident lifecycle transitions are validated server-side through one canonical state machine and cannot be updated through unrestricted `status` PATCH operations.

**Transition-history directive:**
Incident state/severity changes preserve append-oriented history with actors/timestamps/reasons instead of overwriting chronology.

**Update directive:**
if frozen Design 147 contains responder/status updates, those are append-oriented `IncidentUpdate` records and remain distinct from AuditEvents and raw logs.

**Mitigation directive:**
Incident records reference typed mitigation actions/source operations while actual changes execute through their canonical services; Design 147 does not become a generic remote-command or arbitrary shell-execution console.

**Recovery directive:**
service/component recovery and Incident resolution remain different facts.

**Recovery-verification directive:**
one canonical recovery service evaluates fresh component/dependency evidence, stabilization window and unresolved impact before Incident resolution.

**Green-badge directive:**
one successful probe or visually green component card can never, by itself, prove Incident recovery.

**Monitoring directive:**
an Incident may remain in Monitoring after current health recovers while stability evidence accumulates.

**Resolution directive:**
Incident resolution revalidates current canonical health/impact/recovery state and preserves exact recovery evidence plus resolvedAt.

**Override directive:**
if frozen product permits resolution despite incomplete recovery evidence, it requires stronger permission, explicit reason, Audit evidence and preservation of the failed/incomplete verification state.

**Historical-reliability directive:**
resolving an Incident never removes its effect from historical uptime/SLO/error-budget calculations.

**Reoccurrence directive:**
a later degradation after recovery follows explicit reopen/new-incident episode policy and never silently rewrites the prior resolved interval.

**Impact-privacy directive:**
affected Organization/user counts are authorization/privacy-safe aggregates; tenant names/details require explicit higher permission.

**Ownership directive:**
Incident commander/owner and SystemComponent ownership represent operational responsibility and never grant RBAC privileges.

**Authorization directive:**
system-health read, detailed diagnostics, Incident create/update/severity/assign/mitigate/resolve/export remain independently server-authorized through Design 144.

**Diagnostic directive:**
incident-health views expose normalized safe diagnostics and never reveal credentials, internal security controls, raw secret-bearing logs or unnecessary customer data.

**Idempotency directive:**
health ingestion, Incident declaration, transitions, mitigation references, recovery verification and resolution actions are replay-safe.

**Concurrency directive:**
duplicate declarations, simultaneous severity/state changes, recovery evidence arrival and competing resolution attempts use revision/transaction safeguards.

**Late-evidence directive:**
late health/provider evidence never silently rewrites resolved Incident chronology; it may affect subsequent condition/incident handling according to explicit policy.

**Projection directive:**
`SystemHealthView`, `IncidentDetailView`, impact summaries and current-health projections are rebuildable from canonical Incident/evidence records and never become independent writable truth.

**Caching directive:**
system-health caches include component-registry, health-policy and observation revisions and are aggressively freshness-aware; Incident caches include current revision and authorization scope.

**Performance directive:**
Design 147 reads continuously maintained local health projections and compact Incident summaries, lazily loading deeper evidence/timelines rather than synchronously querying every log, provider, Integration or metric system at page load.

**Partial-failure directive:**
component evidence, dependency evidence, Incident data, impact computation and recovery verification may fail independently. `Unavailable` can never become `Healthy`, `Resolved`, `No impact`, `Cause confirmed`, or `Recovery verified` without evidence.

**Future-reuse directive:**
Design **148 — Data Import / Export Administration** must remain a separate data-governance/administration workspace. Import/export job failures may surface as health/Incident evidence only when they reflect a genuine shared platform failure; individual import/export Runs must preserve their own canonical job/file/result lifecycle rather than becoming Incident records.

**Overlap directive:**
Designs **136, 138–149** must preserve one continuous **observability/provider/runtime evidence → normalized HealthObservation → derived CurrentComponentHealth → optional typed Alert/OperationalAttention → formal Incident → Impact/State/Updates/Mitigation → RecoveryVerification → Resolution**, while Integrations, Automation Runs, Developer API/Webhook executions, Notifications, AuditEvents and source-domain records retain their own canonical identities.

**Consolidation directive:**
**STANDARDIZE ONE SYSTEM HEALTH & INCIDENT FOUNDATION — CANONICAL SYSTEMCOMPONENT/DEPENDENCY REGISTRY + APPEND-ORIENTED NORMALIZED HEALTHOBSERVATIONS + FRESHNESS-AWARE CURRENT-HEALTH RESOLUTION + DESIGN-038 SLI/SLO METRICS + FORMAL INCIDENT IDENTITY/STATE-MACHINE + DISTINCT SEVERITY/IMPACT/CAUSE/UPDATE/MITIGATION/RECOVERY MODELS + RECOVERY VERIFICATION BEFORE RESOLUTION + SAFE OBSERVABILITY REFERENCES + STRICT DESIGN-136/138–146 DOMAIN BOUNDARIES — AND NEVER ALLOW GENERIC `IS_HEALTHY`, RED/YELLOW/GREEN FLAGS, `LAST_ERROR`, ALERT ACKNOWLEDGEMENT, COMMAND-CENTER TRIAGE, CURRENT INTEGRATION STATUS, FAILED AUTOMATION RUNS, HTTP ERRORS, ONE SUCCESSFUL PROBE OR GENERIC `INCIDENT.STATUS=RESOLVED` PATCHES TO SUBSTITUTE FOR OR REWRITE CANONICAL HEALTH, INCIDENT, IMPACT OR RECOVERY TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **147 / 153** |
| **PASS**                                   |                        **147** |
| **STANDARDIZE decisions**                  |                        **145** |
| **Potential implementation-overlap flags** |                        **138** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**147 / 153 = 96.1% audited.**

Only **6 frozen designs remain** in Phase 3A.1.

### Canonical reliability architecture after Design 147

```text
RAW OBSERVABILITY
metrics / probes / dependencies
          │
          ↓
 HEALTH OBSERVATIONS
          │
          ↓
 CURRENT COMPONENT HEALTH
          │
     ┌────┴─────┐
     ↓          ↓
  Healthy    Degraded
                │
                ↓
          Alert / Attention
                │
                ↓
             INCIDENT
                │
      ┌─────────┼─────────┐
      ↓         ↓         ↓
    Impact   Mitigation  Updates
                │
                ↓
          Health recovers
                │
                ↓
       Recovery Verification
                │
                ↓
             RESOLVED
```

The strongest incident boundary is now explicit:

```text
Integration IC-20
authorization expired

This means:

Integration problem

NOT automatically:

Platform Incident
```

Whereas:

```text
95% of Microsoft-backed
connections fail concurrently

because shared connector auth
service is unavailable

may produce:

System component degradation
        ↓
Alert
        ↓
Formal Incident
```

Recovery can no longer be faked by one green indicator:

```text
10:31

Component becomes Healthy.

This does NOT require:

Incident = Resolved


Correct:

Component = Healthy
Incident = Monitoring
Recovery verification = Running


After required fresh
stability evidence:

Recovery = Verified
        ↓
Incident may be Resolved
```

Alert acknowledgement remains separate:

```text
Alert:
ACKNOWLEDGED

Incident:
MITIGATING

Component:
DEGRADED


Meaning:

Someone knows about it.

It does NOT mean:

the system recovered.
```

And system health remains distinct from long-term reliability:

```text
Current API health:
HEALTHY

Monthly availability:
99.70%

Target SLO:
99.90%


The service is healthy NOW.

The monthly SLO
is still breached.
```

## Next Sequential Audit Target

### **Design 148 — Data Import / Export Administration**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
