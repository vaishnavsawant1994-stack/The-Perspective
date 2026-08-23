# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 141 — Automation / Workflow Runs Monitor

Design 141 should become the **canonical Team Workspace automation-execution monitoring, run-history, trigger/outcome summary, queue/execution-state, retry-eligibility, failure-surfacing, Integration-dependency, and operational monitoring surface** for platform automations.

Its job is to answer:

> **“Which automations ran, which exact AutomationDefinitionVersion triggered them, what caused each Run, what happened, which steps/actions completed or failed, whether external outcomes are known, whether retry is safe, what canonical domain records were affected, and which Runs currently require investigation?”**

Design 141 must **not become a second business-workflow engine**.

It must remain distinct from:

* Design 013 — Outreach Sequence Builder and Enrollment execution;
* Design 110 — Project Workflow Template / Stage Configuration;
* Designs 124–129 — Publishing and Distribution executions;
* Design 134 — `ScheduledReportRun`;
* Design 136 — Operations Command Center;
* Designs 139–140 — IntegrationConnection/health;
* Design 142 — detailed Automation Run failure investigation;
* Design 143 — Alert Rules / system notifications.

A generic automation can orchestrate or call these domains, but it cannot replace their canonical runtime identities.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **AutomationDefinition ≠ AutomationDefinitionVersion ≠ TriggerDefinition ≠ TriggerInvocation ≠ AutomationRun ≠ AutomationRunAttempt ≠ AutomationStepRun ≠ ActionExecution ≠ ExternalSideEffect ≠ ProviderEvent ≠ IntegrationConnection ≠ SourceDomainRecord ≠ ProjectWorkflowInstance ≠ ScheduledReportRun ≠ OperationalAttentionItem.**

The central implementation rule is:

> **`AutomationRun` is the durable canonical execution identity for one invocation of one exact AutomationDefinitionVersion. Every Run must preserve its trigger evidence, exact definition version, execution context, Step Runs, source-domain references, Integration dependencies, and external-outcome certainty. Retrying a Run or Step must never silently change the AutomationDefinitionVersion, trigger context, source entity, or business intent. A failed AutomationRun does not automatically mean its source business operation failed, and a successful IntegrationConnection does not automatically mean the AutomationRun succeeded.**

---

# 1. Classification

| Audit field                          | Classification                                                                                                                                                          |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                        | **141**                                                                                                                                                                 |
| **Canonical name**                   | **Automation / Workflow Runs Monitor**                                                                                                                                  |
| **Product area**                     | Team Workspace / Platform / Automation / Operations                                                                                                                     |
| **User surface**                     | **Authenticated Team Workspace**                                                                                                                                        |
| **Screen class**                     | Automation Execution Monitor / Run History / Cross-Automation Operations Workspace                                                                                      |
| **Classification**                   | **Canonical Automation Run Monitoring, Trigger Lineage & Execution-State Anchor**                                                                                       |
| **Primary purpose**                  | Monitor Automation runs, execution health, failure/partial/unknown outcomes, trigger lineage, Integration dependencies and retry eligibility across platform automation |
| **Primary execution identity**       | `AutomationRun`                                                                                                                                                         |
| **Definition identity**              | `AutomationDefinition`                                                                                                                                                  |
| **Immutable execution definition**   | `AutomationDefinitionVersion`                                                                                                                                           |
| **Trigger configuration**            | `TriggerDefinition`                                                                                                                                                     |
| **Trigger evidence**                 | `TriggerInvocation`                                                                                                                                                     |
| **Attempt identity**                 | `AutomationRunAttempt` where run-level retries need explicit lineage                                                                                                    |
| **Step execution**                   | `AutomationStepRun`                                                                                                                                                     |
| **Action execution**                 | `AutomationActionExecution` / typed action execution                                                                                                                    |
| **External side-effect evidence**    | provider/domain-specific execution reference                                                                                                                            |
| **Integration dependency**           | Designs 139–140 `IntegrationConnection`                                                                                                                                 |
| **Operational attention projection** | Design 136                                                                                                                                                              |
| **Audit dependency**                 | Designs 039 / 138                                                                                                                                                       |
| **Scheduled Report boundary**        | Design 134 `ScheduledReportRun`                                                                                                                                         |
| **Publishing boundary**              | `PublicationAttempt` / Designs 124–126                                                                                                                                  |
| **Distribution boundary**            | `ChannelExecution` / Designs 127–129                                                                                                                                    |
| **Project Workflow boundary**        | Designs 023 / 110                                                                                                                                                       |
| **Outreach runtime boundary**        | Designs 012–013 / 090                                                                                                                                                   |
| **Detailed failure investigation**   | **Design 142**                                                                                                                                                          |
| **Alerts boundary**                  | **Design 143**                                                                                                                                                          |
| **Monitor projection**               | `AutomationRunSummary`                                                                                                                                                  |
| **Primary query service**            | `AutomationRunsQueryService`                                                                                                                                            |
| **Runtime service**                  | `AutomationExecutionService`                                                                                                                                            |
| **Trigger service**                  | `AutomationTriggerService`                                                                                                                                              |
| **Retry eligibility resolver**       | `AutomationRetryEligibilityResolver`                                                                                                                                    |
| **Execution-state resolver**         | `AutomationRunStateResolver`                                                                                                                                            |
| **Integration dependency resolver**  | `AutomationIntegrationDependencyResolver`                                                                                                                               |
| **Parent shell**                     | `InternalAppShell` — Design 001                                                                                                                                         |
| **Auth**                             | Required                                                                                                                                                                |
| **Authorization**                    | Active OrganizationMembership + Automation/run/source-domain permissions                                                                                                |
| **Implementation priority**          | **Critical Automation Reliability / Duplicate-Side-Effect Prevention / Operational Traceability**                                                                       |
| **Reuse level**                      | **Platform-wide across integrations, notifications, publishing, distribution, reporting and future automation capabilities**                                            |

Canonical runtime:

```text
AutomationDefinition A-10
        │
        └── DefinitionVersion v4
                  │
                  ↓
           TriggerInvocation TI-20
                  │
                  ↓
            AutomationRun R-30
                  │
          ┌───────┼─────────┐
          ↓       ↓         ↓
        Step 1  Step 2    Step 3
        success success   failed
                            │
                            ↓
                     ActionExecution
                            │
                            ↓
                  external/domain effect
                            │
                            ↓
                confirmed / failed /
                    outcome unknown
```

---

# 2. Reuse

## `AutomationRun` must be canonical and durable

Design 141 must not build its monitor from ephemeral queue jobs alone.

Incorrect:

```text
BullMQ Job 7821
= automation history
```

Correct:

```text
AutomationRun R-30
      │
      └── may be processed by
          queue job 7821
```

Infrastructure jobs can disappear, retry, or be rescheduled.

The business execution identity must survive.

---

## AutomationDefinition ≠ AutomationDefinitionVersion

Critical.

### AutomationDefinition

Stable automation identity.

### AutomationDefinitionVersion

Exact immutable automation logic/config used by a Run.

Example:

```text
Automation A-10

v3 historical
v4 active
v5 draft

Run R-30
pins v4 forever.
```

Publishing v5 later cannot change what R-30 means.

---

## Run must never execute “latest definition”

Once created, it pins:

```text
automationDefinitionVersionId
```

not:

```text
automationDefinitionId
→ resolve latest later
```

This is essential for reproducibility.

---

## Project Workflow ≠ generic Automation

Design 110 defines project workflow stages/transitions/gates.

A Project Workflow runtime is business delivery state.

A generic Automation may react to it:

> when Project reaches Stage X → notify owner.

But AutomationRun does not become the Project workflow itself.

---

## Workflow Stage ≠ Automation Step

Permanent.

### Workflow Stage

Business lifecycle position.

### Automation Step

Technical/orchestration execution unit.

---

## Outreach Sequence ≠ generic AutomationDefinition

Design 013's outreach sequence has specialized:

* Enrollment;
* wait/delay;
* message;
* sending-account;
* reply semantics.

Do not replace it with generic AutomationRun records.

Generic monitoring may link to its execution if desired, but Outreach remains canonical.

---

## `ScheduledReportRun` ≠ `AutomationRun`

Design 134 established specialized reporting execution semantics:

* ReportingPeriodResolution;
* ReportVersion;
* Snapshot;
* Approval;
* ReportRelease;
* DeliveryAttempts.

If platform automation triggers a scheduled report, the relationship can be:

```text
AutomationRun R-20
        ↓
triggers
ScheduledReportRun SR-30
```

They remain separate identities.

---

## PublicationAttempt ≠ AutomationRun

Same principle.

---

## Distribution `ChannelExecution` ≠ AutomationRun

Same principle.

---

## IntegrationConnection ≠ AutomationRun

Critical.

An automation can depend on Microsoft/LinkedIn/etc.

Connection health and automation execution are separate.

Correct:

```text
Integration = HEALTHY
Automation = FAILED
because payload validation failed
```

or:

```text
Integration = DEGRADED
Automation = WAITING/FAILED
```

depending on actual evidence.

---

## Automation failure ≠ business-source failure

Example:

Automation:

> when Deal is won, send internal Slack-style notification.

Deal handoff may have succeeded while Notification step failed.

Correct:

```text
Deal = WON
Automation = PARTIAL/FAILED
```

Never roll source business truth backward merely because a secondary automation failed unless the canonical transaction intentionally defines a saga/compensation policy.

---

## Automation success ≠ downstream business success universally

If Automation successfully submitted a Publication command:

```text
Automation action submission = SUCCESS
```

but provider publication later fails:

```text
PublicationAttempt = FAILED
```

Do not rewrite the Automation Step as though it itself failed unless its contract was explicitly “wait for verified publication.”

---

## Automation Monitor ≠ Operations Command Center

### Design 141

All/filtered run monitoring and execution history.

### Design 136

Current cross-domain operational attention.

Failed AutomationRuns may appear in both:

```text
AutomationRun AR-50
        │
        ├── Design 141
        │   execution history
        │
        └── Design 136
            attention item
```

Still one AutomationRun.

---

## Design 142 remains Run Detail authority

Design 141 should provide summary-level information:

* automation;
* version;
* trigger;
* start/end;
* overall run state;
* failed/blocked step summary;
* retry eligibility;
* Integration dependency summary.

Design 142 investigates exact:

* Step Runs;
* attempts;
* input/output metadata;
* failure evidence;
* external outcome;
* repair/retry path.

---

# 3. Entities

## AutomationDefinition

Stable identity.

Conceptually:

```text
AutomationDefinition
├── id
├── organizationId
├── name
├── automationType
├── lifecycle
├── currentPublishedVersionId?
├── owner/context
├── createdAt
└── revision
```

Design 141 should normally read this rather than configure it.

Do not invent a Builder page here.

---

## AutomationDefinitionVersion

Immutable once published/used.

Conceptually:

```text
AutomationDefinitionVersion
├── id
├── automationDefinitionId
├── versionNumber
├── triggerDefinition
├── stepDefinitions[]
├── executionPolicy
├── timeoutPolicy
├── retryPolicy
├── publishedAt?
└── schemaVersion
```

---

## DefinitionVersion ≠ Runtime state

Do not update v4 with:

```text
lastRunFailed = true
```

as business logic.

Run history belongs to AutomationRun projections.

---

## TriggerDefinition

What should start the Automation.

Potential trigger families may include:

* domain event;
* schedule;
* webhook/provider event;
* manual invocation;

only where supported.

---

## TriggerDefinition ≠ TriggerInvocation

Critical.

Definition:

> When a Deal becomes WON.

Invocation:

> Deal D-20 became WON at 14:02 and triggered Run R-30.

---

## TriggerInvocation

Durable trigger evidence.

Conceptually:

```text
TriggerInvocation
├── id
├── automationDefinitionVersionId
├── triggerType
├── sourceReference
├── sourceEventId?
├── occurredAt
├── receivedAt?
├── deduplicationKey
├── authorization/system context
└── safeInputSnapshot
```

---

## Trigger event deduplication

Critical.

One domain/provider event must not accidentally create multiple Runs due to delivery retries.

Use stable:

* DomainEvent ID;
* ProviderEvent ID;
* schedule occurrence ID;
* manual invocation ID;

where available.

---

## Scheduled Trigger occurrence ≠ clock timestamp alone

Same safety as Design 134.

Use stable occurrence identity to prevent duplicate Run creation.

---

## Manual invocation

If frozen product supports “Run now”:

preserve:

```text
triggerType = MANUAL
actor = exact membership
```

It must remain distinguishable from automatic Runs.

---

## AutomationRun

Canonical execution.

Conceptually:

```text
AutomationRun
├── id
├── organizationId
├── automationDefinitionId
├── automationDefinitionVersionId
├── triggerInvocationId
├── runState
├── startedAt?
├── completedAt?
├── sourceContext
├── currentAttemptId?
├── failureClass?
├── outcomeCertainty
├── createdAt
└── revision
```

---

## Run state ≠ outcome certainty

Very important.

A Run may be:

```text
state = FAILED
outcomeCertainty = KNOWN
```

or:

```text
state = NEEDS_RECONCILIATION
outcomeCertainty = UNKNOWN
```

Do not collapse both into red `Failed`.

---

## AutomationRunAttempt

Useful where retrying the whole automation is allowed.

Conceptually:

```text
AutomationRunAttempt
├── id
├── automationRunId
├── attemptNumber
├── startedAt
├── completedAt?
├── state
├── retryReason?
└── worker/execution revision
```

---

## Retry ≠ new AutomationRun automatically

For the same original business invocation, retry can remain:

```text
AutomationRun R-30
  ├── Attempt 1
  └── Attempt 2
```

depending on runtime architecture.

A new independent trigger creates a new AutomationRun.

---

## New trigger ≠ retry

Absolute.

---

## AutomationStepRun

One runtime instance of one StepDefinition.

Conceptually:

```text
AutomationStepRun
├── id
├── automationRunAttemptId
├── stepDefinitionId
├── sequence/path
├── state
├── startedAt?
├── completedAt?
├── actionExecutionId?
├── failureClass?
├── outputReference?
└── revision
```

---

## Step definition ID must be stable within DefinitionVersion

Do not rely only on array index.

This matters for failure investigation/version comparison.

---

## Step state

Conceptually:

```text
PENDING
READY
RUNNING
SUCCEEDED
FAILED
SKIPPED
WAITING
CANCELLED
OUTCOME_UNKNOWN
```

Exact state machine Phase 3D.

---

## SKIPPED ≠ SUCCEEDED

Permanent.

A conditional branch that did not execute is not a successful side effect.

---

## WAITING ≠ FAILED

Permanent.

---

## Timeout ≠ known failure automatically

Critical.

If the Step timed out while calling an external provider, external outcome may be unknown.

---

## AutomationActionExecution

Typed execution of a Step's action.

Examples conceptually:

* create Task;
* send message;
* call Integration capability;
* update allowed source state;
* generate report;
* invoke another domain command.

It should reference the target domain command/result.

---

## ActionExecution ≠ ExternalSideEffect

Example:

```text
AutomationActionExecution
→ request sent to provider adapter

ExternalSideEffect
→ provider actually created object/message
```

Outcome may remain unknown until provider evidence arrives.

---

## Domain command action

Where an Automation executes:

> create Task

the canonical Task service creates the Task.

Automation Step stores:

```text
resultReference = Task T-20
```

It must not create an `AutomationTask`.

---

## ProviderEvent

External evidence remains Designs 139–140 Integration infrastructure.

Automation should reference it when needed.

---

## SourceDomainReference

Typed reference to the business context:

```text
sourceType
sourceId
sourceVersionId?
```

Never store important source IDs only inside opaque arbitrary JSON.

---

## Safe execution input

Automation history may need enough input metadata for reproducibility.

But never store:

* credentials;
* secrets;
* unnecessary raw personal data;
* unbounded webhook payloads.

Use redacted/versioned snapshots/references.

---

## FailureClass

Normalized taxonomy.

Conceptual examples:

```text
VALIDATION_FAILURE
PERMISSION_DENIED
INTEGRATION_UNAVAILABLE
RATE_LIMITED
TIMEOUT
DOMAIN_CONFLICT
EXTERNAL_REJECTED
OUTCOME_UNKNOWN
SYSTEM_FAILURE
```

Provider-specific raw codes remain secondary diagnostics.

---

## FailureClass ≠ retry eligibility

Critical.

Two timeouts can have different retry safety depending on whether an external side effect may have succeeded.

---

## RetryEligibility

Derived:

```text
SAFE
REQUIRES_RECONCILIATION
NOT_RETRYABLE
RETRY_AFTER
UNKNOWN
```

not an operator-editable flag.

---

## AutomationRunSummary

Design-141 read projection.

Conceptually:

```text
AutomationRunSummary
├── runId
├── automation name
├── definition version
├── trigger summary
├── source context
├── startedAt
├── duration
├── run state
├── failed/blocked step
├── outcome certainty
├── retry eligibility
├── integration dependencies
└── attention state
```

It does not own any of these source states.

---

# 4. Permissions

Design 141 should conceptually distinguish:

```text
automationRun.read
automationRun.readDetails

automationRun.retry
automationRun.cancel
automationRun.reconcile

automationRun.invokeManual

automationDefinition.read

automationExecution.readSensitive
```

Exact permission names belong to Phase 3D.

---

## Run Monitor read ≠ Automation definition edit

Permanent.

---

## Automation Run read ≠ source-domain read

Critical.

A user might be permitted to see:

> Automation failed against Client C-20

without permission to inspect Client details.

Source links reauthorize.

---

## Run read ≠ Step sensitive-input access

Permanent.

Execution metadata may contain sensitive business details.

---

## Retry permission ≠ source-domain mutation permission automatically

The Automation runtime must reauthorize under the defined execution authority model.

Do not let a user bypass source-domain controls merely by retrying an Automation.

---

## Manual Run permission ≠ Retry permission

Permanent.

---

## Cancel permission ≠ Retry permission

Permanent.

---

## Reconcile permission ≠ Retry permission

Critical for unknown external outcomes.

---

## Automation operator ≠ Integration administrator

A user may retry an Automation without being allowed to rotate OAuth credentials.

---

## Integration administrator ≠ Automation operator

The inverse also holds.

---

## Job title ≠ Automation authority

Design 037 remains RBAC authority.

---

## Cross-tenant Runs prohibited

Absolute.

---

## Counts/facets permission-safe

If the Monitor shows:

> Failed 18
> Running 7

those counts must be computed only over Runs the user may know exist.

---

## Correlation links reauthorize

Opening:

* source Deal;
* generated Task;
* Publication;
* Integration;
* Report;

uses source-domain authorization.

---

# 5. States

Design 141 must keep **Run lifecycle, Attempt state, Step state, trigger state, outcome certainty, retry eligibility, Integration state, and source-domain outcome** separate.

### Run state

Conceptually:

```text
Queued
Running
Waiting
Succeeded
Partial
Failed
Cancelled
Needs Reconciliation
Unknown
```

### Outcome certainty

```text
Known
Unknown
Partially Known
```

### Retry eligibility

```text
Safe
Requires Reconciliation
Retry After
Not Retryable
Unknown
```

### Trigger

```text
Accepted
Duplicate
Rejected
Invalid
Unknown
```

### Integration dependency

```text
Healthy
Degraded
Unavailable
Unknown
```

These must never collapse into one generic `automation_status`.

---

## Queued ≠ Running

Permanent.

---

## Waiting ≠ Failed

Permanent.

---

## Partial ≠ Failed universally

Critical.

Example:

```text
Step 1 create Task    success
Step 2 send email     failed
```

Business effect is partial.

---

## Succeeded ≠ every external downstream state finalized

If Automation's contract was asynchronous submission, later domain/provider outcome can still fail.

---

## Cancel requested ≠ Cancelled

Permanent.

A worker may already be executing a non-cancellable external side effect.

---

## Timeout ≠ Failed conclusively

Critical.

Could be `OUTCOME_UNKNOWN`.

---

## Outcome unknown ≠ retryable

Absolute.

---

## Integration unavailable ≠ Automation definition invalid

Permanent.

---

## Permission denied ≠ Integration failure

Permanent.

---

## Validation failure ≠ system failure

Permanent.

---

## Duplicate trigger ≠ failed Run

Ideally duplicate trigger produces no second canonical Run or is explicitly deduplicated.

---

## Definition disabled ≠ historical Runs invalid

Absolute.

---

## New Automation version ≠ old Run stale

Historical Run remains valid execution evidence.

---

## Source entity changed later ≠ Run rewritten

Permanent.

---

## State Coverage

Design 141 inherits Design 150 plus:

```text
Automation Monitor Loading
Automation Monitor Available
Automation Monitor Empty
Automation Monitor Restricted
Automation Monitor Partial
Automation Monitor Unavailable

Run Queued
Run Running
Run Waiting
Run Succeeded
Run Partial
Run Failed
Run Cancel Requested
Run Cancelled
Run Needs Reconciliation
Run State Unknown

Trigger Accepted
Trigger Duplicate
Trigger Rejected
Trigger State Unknown

Step Pending
Step Running
Step Waiting
Step Succeeded
Step Skipped
Step Failed
Step Cancelled
Step Outcome Unknown

Outcome Known
Outcome Partially Known
Outcome Unknown

Retry Safe
Retry Requires Reconciliation
Retry After Delay
Retry Not Allowed
Retry Eligibility Unknown

Integration Healthy
Integration Degraded
Integration Unavailable
Integration State Unknown

Source Available
Source Restricted
Source Changed
Source Unavailable

Run Updated Elsewhere
Definition Version Changed
Integration Updated Elsewhere
Provider Evidence Arrived
Retry Eligibility Changed
Monitor Projection Stale
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize:

1. Automation identity;
2. exact DefinitionVersion;
3. trigger/source context;
4. Run state;
5. failure/blocked Step summary;
6. started/completed/duration;
7. outcome certainty;
8. retry/reconcile eligibility.

Conceptually:

```text
Automation Runs

Client Won Handoff
Run AR-250
Definition v4
Trigger: Deal D-210 → WON
Started: 10:42
State: Partial

Steps:
4 succeeded
1 failed

Failure:
Send onboarding notification

Outcome:
Known failure

Retry:
Safe
```

Only fields/actions present in frozen Design 141 should render.

---

## Definition version should remain visible

Especially when an Automation is edited later.

Correct:

> Client Handoff · v4

not only:

> Client Handoff.

---

## Failure reason and retry safety should be different

Correct:

> Timeout
> External outcome unknown
> Reconciliation required

not:

> Timeout · Retry.

---

## Source context should remain explicit

A Run should tell the operator which:

* Deal;
* Client;
* Project;
* Report;
* Publication;

caused or was affected by it where authorized.

---

## Integration state should be contextual, not dominant

Example:

> Microsoft connection healthy

does not erase:

> Automation failed validation.

---

## Running duration should not imply failure alone

Long-running may be valid depending on the Automation definition.

Timeout policy decides.

---

## Filters

If frozen Design 141 includes them, canonical filters may include:

* automation;
* run state;
* period;
* trigger type;
* failure class;
* Integration dependency;
* retry eligibility.

Filters remain server-side and permission-safe.

---

## Tablet

Following Design 152:

* Automation/Run state remain first;
* trigger and source context stack;
* Step summary compacts;
* retry eligibility remains visible;
* technical metadata moves into expandable detail.

---

## Mobile

Priority:

```text
Automation
↓
Run state
↓
Definition version
↓
Trigger/source
↓
Started / duration
↓
Failed step
↓
Outcome certainty
↓
Safe action
```

Avoid shrinking a multi-column run-monitor table horizontally.

---

## Mobile failed Run example

> Client Won Handoff
> Failed
> v4
> Deal D-210
> Step: Send Welcome Email
> External outcome unknown
> Reconciliation required

This is much safer than:

> Failed · Retry.

---

## Accessibility

A Run could communicate:

> Automation run AR-250 executed Client Won Handoff definition version 4 after Deal D-210 entered the Won state. Four of five steps completed. The email-delivery step timed out and its external outcome is currently unknown. Retry is disabled until reconciliation confirms whether the provider sent the message.

where canonical authorized evidence supports it.

---

# 7. Backend Requirements

## Canonical Automation runtime architecture

```text
Trigger Source
    │
    ├── Domain Event
    ├── Scheduled Occurrence
    ├── Verified Provider Event
    └── Manual Invocation
             │
             ↓
      TriggerInvocation
             │
             ↓
       AutomationRun
             │
             ↓
    AutomationRunAttempt
             │
       ┌─────┼─────┐
       ↓     ↓     ↓
     Step 1 Step 2 Step 3
             │
             ↓
      Typed ActionExecution
             │
             ↓
      Canonical domain /
       Integration service
```

---

## Trigger ingestion

A canonical:

```text
AutomationTriggerService
```

should:

1. validate trigger source;
2. resolve tenant;
3. resolve eligible AutomationDefinitionVersions;
4. deduplicate invocation;
5. capture safe TriggerInvocation;
6. create canonical AutomationRun idempotently.

---

## Trigger deduplication

Critical.

For a DomainEvent:

```text
automationDefinitionVersionId
+
domainEventId
```

can conceptually serve as stable invocation uniqueness.

For provider events:

use verified ProviderEvent identity.

For schedules:

use schedule occurrence identity.

For manual actions:

use invocation/idempotency key.

---

## AutomationDefinition version pinning

Run creation transaction must persist exact:

```text
automationDefinitionVersionId
```

before execution begins.

---

## Runtime must not reread latest DefinitionVersion midway

Absolute.

Every Step comes from the pinned version.

---

## Definition changes during a Run

Future Runs may use a newer published version.

Current Run continues its pinned version.

---

## Execution engine

Conceptually:

```text
AutomationExecutionService.execute(runId)
```

should:

1. claim Run;
2. load exact DefinitionVersion;
3. validate execution authority/context;
4. determine next eligible Steps;
5. execute typed actions through source services;
6. persist Step outcomes;
7. reconcile external outcomes where needed;
8. derive Run state;
9. emit operational/Audit events selectively.

---

## Durable worker claims

Do not rely on browser/in-memory execution.

Use durable queues/leases/claims.

---

## Worker crash recovery

A crashed worker must not restart external side effects blindly.

Before retry:

check Step/ActionExecution evidence.

---

## Step idempotency

Every side-effecting Step needs a stable execution intent key.

Conceptually:

```text
automationRunId
+
stepDefinitionId
+
attempt context
```

passed into downstream services/providers where supported.

---

## Domain-service idempotency remains authoritative

If automation creates a Task:

TaskService gets an idempotency key.

If it publishes:

Publication service handles PublicationAttempt safety.

Automation runtime must not invent weaker duplicate prevention.

---

## Retry policy

Retry semantics should be defined at appropriate layers:

* transient internal processing;
* Step retry;
* whole Run retry;
* provider backoff.

Do not use one generic retry counter.

---

## Automatic retry ≠ operator retry

Permanent.

Operator-triggered retries need actor/Audit context.

---

## Retry after rate limit

Use provider-supplied retry window where available.

Do not classify it as permanent failure.

---

## Retry eligibility resolver

Central:

```text
AutomationRetryEligibilityResolver.resolve(
    run,
    stepRuns,
    actionExecutions,
    provider/domain evidence
)
```

returns safe result.

Frontend cannot decide.

---

## Unknown external outcome

Strongest runtime safety rule.

Example:

```text
Step:
Send email

Provider request:
connection timed out

Possibilities:
A. provider sent it
B. provider did not send it
```

State:

```text
OUTCOME_UNKNOWN
```

Action:

> reconcile first.

Not:

> auto-retry.

---

## Reconciliation

Where provider/domain supports evidence lookup:

```text
reconcileAutomationActionExecution(...)
```

should determine whether the original side effect exists.

---

## Reconciliation does not create side effects

Permanent.

It observes/checks evidence.

---

## Compensating actions

Do not invent automatic rollback for already-completed Steps unless the AutomationDefinition/domain explicitly defines compensation.

Example:

Task creation succeeded, email failed.

Do not delete the Task just to make the automation look atomic unless that's an intentionally governed saga.

---

## Partial Run

Must be first-class for non-transactional multi-step automations.

---

## Execution context

Run should preserve enough context to understand:

* source reference;
* initiating actor/system;
* trigger;
* definition version;
* variables/input references;

without storing sensitive secrets.

---

## Variable resolution

If Automations use variables:

they should be typed/safe references/values.

Do not allow arbitrary runtime code/eval.

---

## Automation expressions

If platform supports conditions:

use the same safe typed DSL principles established for Designs 013/110/133.

No arbitrary JavaScript.

---

## Secret access

Automation Steps needing providers reference:

```text
IntegrationConnection
+
capability
```

They do not retrieve/store raw provider credentials.

The Integration runtime performs the provider call.

---

## Integration health preflight

Can help avoid clearly impossible calls.

But a healthy preflight does not guarantee execution success.

---

## Connection changes during Run

A Step must resolve current Integration capability/authorization at execution.

The Run still retains the connection ID it intended to use.

---

## Connection repaired later

Historical failed Step remains failed.

Retry creates new Step/Run Attempt lineage.

---

## Source-domain authorization

The execution authority model must be explicit.

Possible categories:

* user-authorized execution;
* organization service actor;
* automation service principal.

Do not silently run forever with the creator's stale personal permissions.

---

## Creator deactivation

An AutomationDefinition should have an explicit organizational execution/ownership policy.

Creator deactivation must not lead to:

* indefinite impersonation;
* unexplained silent failure;
* privilege retention.

---

## Execution authority ≠ UI actor

Manual invocation actor may be User A.

The automation's subsequent system actions may execute under a governed service identity with appropriate policy.

Audit should preserve both initiation and execution context.

---

## Source revision conflicts

Example:

Automation Step wants:

> move Deal to Stage X

but Deal was already changed concurrently.

Source service should return a domain conflict.

Automation must not overwrite source blindly.

---

## Run-state resolver

Central:

```text
AutomationRunStateResolver
```

should derive run state from StepRuns/attempts/outcome certainty.

Avoid manually setting arbitrary state from UI.

---

## Monitor query

Conceptually:

```text
listAutomationRuns(
    filters,
    sort,
    cursor,
    currentMembership
)
```

should:

1. authenticate;
2. resolve tenant;
3. apply Automation/source visibility before counts;
4. query Run summaries;
5. resolve failure class;
6. resolve outcome certainty;
7. resolve retry eligibility;
8. resolve Integration dependency summary;
9. return stable pagination.

---

## N+1 avoidance

Do not query:

* Automation Definition;
* source entity;
* Integration;
* failed Step;

one-by-one per row.

Use batched/materialized Run summaries.

---

## Run monitor projection

A materialized:

```text
AutomationRunSummaryProjection
```

is appropriate for scale.

It must be rebuildable from:

* Run;
* Attempts;
* StepRuns;
* Definition;
* source references.

---

## Projection lag

If monitor says Failed but reconciliation already changed state:

mutation endpoints always re-read canonical Run state.

---

## Design 142 integration

Clicking a Run must carry stable:

```text
automationRunId
```

not an ephemeral queue job ID.

---

## Design 136 integration

Conditions like:

* Automation failed;
* Run stuck;
* reconciliation required;

may create `OperationalAttentionItem` projections.

Command Center does not own Run state.

---

## Design 138 Audit

Audit-worthy actions may include:

* manual Run;
* retry;
* cancel;
* reconciliation override;
* Automation configuration publication/change elsewhere.

Routine successful Step execution should not necessarily produce global Audit noise unless the source business command itself is audit-worthy.

---

## Design 143 alerts

Alert Rules may notify on:

* failure;
* repeated failures;
* long-running Runs;
* reconciliation required.

Alert status does not change the Run.

---

## Observability

Keep operational telemetry separately:

* queue latency;
* worker utilization;
* step execution latency;
* error rates;
* retry count.

Do not make application logs canonical Run history.

---

## Cancellation

If frozen Monitor supports Cancel:

cancellation must understand safe boundaries.

### Before side effect

Can cancel straightforwardly.

### During non-cancellable provider request

May become:

> cancellation requested / outcome uncertain.

Do not promise rollback.

---

## Timeout handling

Automation timeout should be configured/versioned.

A timeout changes execution state but does not prove provider failure.

---

## Long-running workflows

If an Automation waits hours/days:

persist waiting state durably.

Do not keep an application process/thread open.

---

## Delays

Use durable wakeup scheduling.

---

## Run retention

Historical Runs are operational evidence.

Retention should be explicit and separate from:

* Audit retention;
* provider event retention;
* source-domain retention.

---

## Idempotency

Required for:

* TriggerInvocation creation;
* AutomationRun creation;
* Step action execution;
* retries;
* reconciliation commands;
* manual invocation;
* cancellation where repeatable.

---

## Concurrency

Critical cases:

### Two workers claim same Run

Use lease/claim locking.

### Provider callback arrives while retry considered

Recompute eligibility.

### User retries while automatic retry queued

Deduplicate/coordinate attempts.

### Definition updated mid-run

Run stays pinned.

### Source entity changes mid-run

Source-domain concurrency rules win.

---

## Cache

Monitor cache should vary by:

```text
organizationMembershipId
authorizationRevision
runProjectionRevision
automationDefinitionRevision
integrationHealthRevision
sourceVisibilityRevision
retryEligibilityRevision
```

---

## Time-derived state

Long-running/stuck indicators cannot be cached indefinitely.

---

## Performance

Use:

* Run summary projections;
* indexed run state/start time/definition;
* compact failure summaries;
* lazy Step detail;
* cursor pagination;
* async state updates;
* event-driven invalidation.

Do not load every Step/output/provider event for every Monitor row.

---

## Partial failure contract

Example:

```text
AutomationRun core     ✓
Integration health     ✕
```

Correct:

> Run state is Failed. Current Integration health cannot be determined.

Incorrect:

> Integration caused the failure.

Another:

```text
Run                   ✓
Source entity         restricted
```

Correct:

> Automation Run is visible; source context is restricted.

Not:

> source deleted.

Another:

```text
Step timed out
provider outcome unavailable
```

Correct:

> External outcome unknown; retry disabled pending reconciliation.

Not:

> Failed safely — retry.

---

## Backend Requirement Matrix

| Requirement                                               | Status                                      |
| --------------------------------------------------------- | ------------------------------------------- |
| Canonical `AutomationRun` identity                        | **Critical**                                |
| Queue job/AutomationRun separation                        | **Critical**                                |
| Definition/DefinitionVersion separation                   | **Critical**                                |
| Exact DefinitionVersion pinning                           | **Critical**                                |
| No `"latest"` runtime definition                          | **Critical**                                |
| TriggerDefinition/TriggerInvocation separation            | **Critical**                                |
| Trigger deduplication                                     | **Critical**                                |
| Schedule occurrence uniqueness                            | **Critical where scheduled triggers exist** |
| Manual trigger/system trigger separation                  | **Critical**                                |
| Run/Attempt separation                                    | **Critical**                                |
| New trigger/retry separation                              | **Critical**                                |
| Stable StepDefinition identities                          | **Critical**                                |
| StepRun/action execution separation                       | **Critical**                                |
| Action execution/external side effect separation          | **Critical**                                |
| Source-domain references typed                            | **Critical**                                |
| Source business state/Automation state separation         | **Critical**                                |
| Integration health/Automation state separation            | **Critical**                                |
| Project Workflow/Automation separation                    | **Critical**                                |
| Outreach runtime/Automation separation                    | **Critical**                                |
| ScheduledReportRun/AutomationRun separation               | **Critical**                                |
| Publication/Distribution execution separation             | **Critical**                                |
| `PARTIAL` first-class                                     | **Critical**                                |
| Outcome certainty separate from state                     | **Critical**                                |
| Outcome unknown ≠ retryable                               | **Critical**                                |
| Central retry-eligibility resolver                        | **Critical**                                |
| Reconciliation before uncertain retry                     | **Critical**                                |
| Durable worker claims                                     | **Critical**                                |
| Crash-safe Step idempotency                               | **Critical**                                |
| Downstream domain idempotency reuse                       | **Critical**                                |
| Safe typed expression/condition DSL                       | **Critical if automation conditions exist** |
| No arbitrary JS/eval                                      | **Critical**                                |
| Integration credentials inaccessible to Automation domain | **Critical**                                |
| Explicit execution authority/service principal            | **Critical**                                |
| Creator-deactivation handling                             | **Critical architecture**                   |
| Source-domain optimistic concurrency                      | **Critical**                                |
| Run state derived from Step evidence                      | **Critical**                                |
| Permission before counts/facets                           | **Critical**                                |
| Cross-tenant isolation                                    | **Critical**                                |
| Rebuildable Monitor projection                            | **Critical**                                |
| Stable cursor pagination                                  | **Critical performance**                    |
| Design 136 projection reuse                               | **Critical architecture**                   |
| Design 138 Audit separation                               | **Critical**                                |
| Design 140 Integration-health reuse                       | **Critical**                                |
| Design 142 same Run backend                               | **Critical architecture**                   |
| Design 143 Alert separation                               | **Critical architecture**                   |
| Observability/Run-history separation                      | **Critical**                                |
| Idempotency                                               | **Critical**                                |
| Partial dependency failure handling                       | **Critical**                                |

---

# 8. Consolidation

Design 141 has major risk because `"workflow"` can accidentally collapse several completely different runtime systems into one generic jobs table.

**AutomationDefinition / Project Workflow Template conflation**
Technical automation becomes Project lifecycle definition.

**AutomationStep / Workflow Stage conflation**
Execution unit becomes business workflow stage.

**AutomationRun / Project Workflow runtime conflation**
Project delivery state disappears.

**AutomationRun / Outreach Enrollment conflation**
Specialized outreach timing/message semantics disappear.

**AutomationRun / ScheduledReportRun conflation**
Reporting period/Snapshot/Release semantics disappear.

**AutomationRun / PublicationAttempt conflation**
Publishing verification/provider state disappears.

**AutomationRun / Distribution ChannelExecution conflation**
Placement/outcome semantics disappear.

**AutomationRun / IntegrationConnection conflation**
Connection failure and execution failure merge.

**AutomationRun / queue job conflation**
Infrastructure retries create duplicate business history.

**Definition / DefinitionVersion conflation**
Old Runs change meaning after edits.

**Latest definition / pinned version conflation**
A retry executes different logic than the original Run.

**TriggerDefinition / TriggerInvocation conflation**
Reusable trigger configuration becomes one event instance.

**ProviderEvent / TriggerInvocation conflation**
External evidence and automation invocation merge.

**Duplicate trigger / new Run conflation**
Provider retries execute automation repeatedly.

**Scheduled occurrence / timestamp conflation**
Scheduler retries duplicate Runs.

**Manual Run / scheduled Run conflation**
Initiation/audit context disappears.

**Run / Attempt conflation**
Retry history overwrites original failure.

**Retry / new trigger conflation**
Independent business event looks like retry.

**StepDefinition / StepRun conflation**
Configuration and runtime state merge.

**Step Run / action execution conflation**
One Step cannot represent provider submission/reconciliation separately.

**Action execution / external side effect conflation**
Timeout is interpreted as external failure.

**Timeout / known failure conflation**
Duplicate external messages/actions can occur.

**Failed / outcome unknown conflation**
Blind retry becomes dangerous.

**FailureClass / retry eligibility conflation**
Every timeout gets same retry behavior.

**Retry eligibility / UI button visibility conflation**
Frontend becomes safety authority.

**Automatic retry / manual retry conflation**
Actor/history semantics disappear.

**Retry whole Run / retry Step conflation**
Already-completed side effects duplicate.

**Retry / compensation conflation**
System tries to undo unrelated source-domain state.

**Partial / failed conflation**
Successful prior side effects disappear from operator view.

**Skipped / succeeded conflation**
Conditional branches falsely appear executed.

**Waiting / failed conflation**
Long-running Automations look broken.

**Cancel requested / cancelled conflation**
External side effects may continue unnoticed.

**Run success / downstream verified success conflation**
Asynchronous domain operations appear complete prematurely.

**Automation failure / business failure conflation**
Canonical source state is rolled back incorrectly.

**Business source mutation / Automation projection conflation**
Automation begins owning Tasks/Deals/Projects.

**Generated Task / AutomationTask conflation**
Duplicate Task domain appears.

**Integration capability / Automation permission conflation**
Automation bypasses RBAC.

**Creator account / Automation execution authority conflation**
Automation impersonates deactivated user forever.

**Manual invocation actor / system execution actor conflation**
Audit attribution becomes false.

**Credential access / Integration capability invocation conflation**
Automation stores tokens.

**Healthy Integration / successful Automation conflation**
Payload/domain failures are misdiagnosed.

**Automation failure / Integration failure conflation**
Connection gets repaired unnecessarily.

**Historical failed Run / repaired connection conflation**
Failure evidence is rewritten.

**Current source label/state / historical Run context conflation**
Old Run changes appearance/meaning.

**Arbitrary input JSON / safe execution context conflation**
Secrets/personal data leak into history.

**Arbitrary JavaScript / Automation conditions conflation**
Security/reproducibility collapse.

**Application log / Run history conflation**
Operational debugging becomes source execution record.

**AuditEvent / Automation Step log conflation**
Compliance store floods.

**OperationalAttentionItem / AutomationRun conflation**
Design 136 becomes execution authority.

**Alert / Automation failure conflation**
Acknowledging alert changes Run.

**Generic `workflow_run` table for everything**
Specialized domain semantics disappear.

**Generic `status=failed`**
Cannot represent partial/unknown/waiting/reconciliation.

**Generic `retry=true`**
No safety/outcome semantics.

**Generic `payload JSON`**
No typed source/version/security lineage.

**Generic `last_error`**
No Step/attempt/history/evidence.

**Generic `job_id` as Run identity**
Queue infrastructure leaks into domain.

**141/013 duplicate Outreach execution**
Sequence semantics fork.

**141/110 duplicate Project Workflow runtime**
Project stages become automation Steps.

**141/124–129 duplicate Publishing/Distribution execution**
Provider state forks.

**141/134 duplicate ScheduledReportRun**
Reporting automation loses specialized lineage.

**141/136 duplicate operational attention**
Monitor becomes Command Center.

**141/139–140 duplicate Integration failure state**
Automation becomes connection authority.

**141/142 duplicate failure detail state**
Monitor and detail disagree.

**141/143 duplicate Alert engine**
Run monitoring becomes notification policy.

No additional screen is required.

These are **canonical AutomationRun identity, immutable version pinning, trigger deduplication, durable Step/Attempt lineage, external-outcome certainty, retry/reconciliation safety, explicit execution authority, and strict separation from specialized business runtimes**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL AUTOMATION RUN MONITORING, TRIGGER LINEAGE & EXECUTION-STATE ANCHOR**

**Domain directive:**
**AutomationDefinition ≠ AutomationDefinitionVersion ≠ TriggerDefinition ≠ TriggerInvocation ≠ AutomationRun ≠ AutomationRunAttempt ≠ AutomationStepRun ≠ ActionExecution ≠ ExternalSideEffect ≠ ProviderEvent ≠ IntegrationConnection ≠ SourceDomainRecord ≠ ProjectWorkflowInstance ≠ ScheduledReportRun ≠ OperationalAttentionItem.**

**Automation-definition directive:**
`AutomationDefinition` is stable automation identity; exact published `AutomationDefinitionVersion` contains immutable trigger/Step/execution policy used by Runs.

**Version-pinning directive:**
every AutomationRun pins one exact AutomationDefinitionVersion before execution and never resolves `"latest"` midway through execution or retry.

**Historical-version directive:**
publishing/editing a newer Automation version affects only future eligible Runs and never rewrites historical Run meaning.

**Trigger directive:**
TriggerDefinition describes reusable trigger logic while TriggerInvocation records one exact accepted event/occurrence/manual invocation.

**Trigger-idempotency directive:**
DomainEvent IDs, verified ProviderEvent IDs, schedule occurrence IDs or explicit manual idempotency keys prevent one underlying trigger from creating duplicate Runs.

**Provider-event directive:**
external ProviderEvents remain Integration evidence and only become Automation trigger inputs after verification, tenant resolution and deduplication.

**Run directive:**
`AutomationRun` is the durable business execution identity and cannot be substituted with queue/job/worker IDs.

**Attempt directive:**
whole-Run retries preserve Attempt lineage under the same original invocation where appropriate; a new independent trigger creates a new AutomationRun.

**Step directive:**
AutomationStepRun represents runtime execution of a stable StepDefinition in the pinned DefinitionVersion.

**Skipped directive:**
Skipped, Waiting, Succeeded, Failed, Cancelled and Outcome Unknown remain distinct Step states.

**Action directive:**
AutomationActionExecution records typed invocation of a canonical domain/Integration capability and never creates duplicate business objects such as `AutomationTask`.

**Source-domain directive:**
Tasks, Deals, Projects, Approvals, Reports, Publications, Placements and other business records remain canonical in their source domains. Automation only references their IDs/results.

**Project-workflow directive:**
Design 110 project Workflow stages/transitions/gates remain business delivery workflow and never collapse into generic Automation Steps/Runs.

**Outreach directive:**
Design 013 Outreach Sequence/Enrollment runtime remains specialized and cannot be replaced by generic AutomationRun semantics.

**Reporting directive:**
Design 134 `ScheduledReportRun` retains reporting-period, Snapshot, Approval, Release and delivery semantics even when an Automation triggers it.

**Publishing directive:**
PublicationAttempts remain Publishing execution truth; Automation may trigger or observe them but cannot rewrite their provider/verification lifecycle.

**Distribution directive:**
ChannelExecution/Placement remain Distribution truth and retain their own reconciliation/idempotency semantics.

**Integration directive:**
Designs 139–140 remain IntegrationConnection/authorization/capability/health authority. Automation references a connection capability and never owns/decrypts its long-lived credentials.

**Credential directive:**
Automation execution services ask the trusted Integration runtime to perform provider operations; provider credentials are never persisted into Automation definitions, Runs, Steps, logs, or Monitor projections.

**Connection-health directive:**
Integration health and Automation execution state remain independent. A healthy connection can have a failed Automation; a degraded connection does not rewrite historical Run state.

**Execution-authority directive:**
Automation runtime uses an explicit organizational/system execution authority model rather than indefinite implicit impersonation of the Automation creator.

**Creator-deactivation directive:**
deactivating the creator cannot silently preserve their personal privileges or make Automation execution authority ambiguous.

**Manual-actor directive:**
manual invocation retains the initiating human actor while subsequent system/service execution remains explicitly attributed as system/Automation context.

**Run-state directive:**
one canonical `AutomationRunStateResolver` derives current Run status from Attempts, StepRuns and action/external evidence rather than editable UI fields.

**Partial directive:**
partially completed non-transactional Automations preserve `PARTIAL` state and exact completed/failed Step evidence rather than flattening everything to failed.

**Outcome-certainty directive:**
Run/Step state and external outcome certainty remain separate dimensions.

**Unknown-outcome directive:**
timeouts/network loss during external side effects can result in `OUTCOME_UNKNOWN`; unknown is never automatically converted to failure or safe retry.

**Reconciliation directive:**
where external/domain evidence can be queried, uncertain actions must be reconciled before retry. Reconciliation observes existing outcome and does not itself repeat side effects.

**Retry-eligibility directive:**
`AutomationRetryEligibilityResolver` derives SAFE / REQUIRES_RECONCILIATION / RETRY_AFTER / NOT_RETRYABLE / UNKNOWN from exact Run/Step/provider evidence. Frontend buttons never determine retry safety.

**Retry-scope directive:**
Step retry, Run retry, provider transport retry, manual retry and a brand-new trigger remain distinct concepts and preserve separate lineage.

**Idempotency directive:**
trigger ingestion, Run creation, Step side effects, manual invocation, retries, reconciliation and cancellation use stable idempotency identities.

**Downstream-idempotency directive:**
Automation reuses the stronger source-domain idempotency mechanism of Task, Publishing, Distribution, Reporting, Integration, etc., rather than implementing weaker duplicate prevention.

**Crash-recovery directive:**
durable worker claims/leases and persisted Step evidence allow safe recovery after worker/process failure without blindly repeating side effects.

**Waiting directive:**
long delays/waits are persisted as durable waiting state/wakeups and never rely on an in-memory process remaining alive.

**Cancellation directive:**
cancel-requested and cancelled remain separate. Cancellation cannot claim to undo already-completed external effects unless the canonical domain explicitly provides compensation.

**Compensation directive:**
completed source-domain side effects are never automatically rolled back simply to make a multi-step Automation appear transactionally atomic.

**Expression directive:**
if Automation conditions/variables are supported, they use typed validated DSL/allowlisted expressions with no arbitrary JavaScript/eval.

**Concurrency directive:**
worker claims, retries, provider callbacks, source-record revisions and Definition updates use transaction/revision controls so stale execution cannot overwrite current source state.

**Source-conflict directive:**
canonical source-domain optimistic-concurrency rules always outrank Automation intent; Automation cannot blindly overwrite concurrently changed business records.

**Monitor directive:**
Design 141 is primarily a permission-safe Run-summary/read projection over canonical Run/Step evidence, not an alternate Automation runtime store.

**Projection directive:**
materialized `AutomationRunSummaryProjection` is allowed for scale only if fully rebuildable from AutomationRun/Attempt/Step/Definition/source references.

**Projection-lag directive:**
retry/cancel/reconcile commands always re-read canonical Run state, never relying on a potentially stale Monitor row.

**Design-142 directive:**
Design 142 must open the exact same `automationRunId` and provide detailed Step/Attempt/provider/source evidence; it may not create a second failure-investigation Run entity.

**Operations directive:**
Design 136 may project failed/stuck/reconciliation-required AutomationRuns as OperationalAttentionItems while canonical Run state remains Design-141/142 Automation truth.

**Alert directive:**
Design 143 may generate alerts/notifications from Automation failure conditions, but acknowledging/dismissing those alerts never changes Run state.

**Audit directive:**
Design 138 records material human/governance actions such as manual Run, retry, cancel or override where required, while ordinary Step telemetry remains Automation execution history/observability rather than global Audit noise.

**Observability directive:**
queue latency, worker utilization, stack traces and technical telemetry remain observability and cannot substitute for AutomationRun/StepRun state.

**Authorization directive:**
Run read, detailed execution read, retry, reconcile, cancel and manual invocation remain independently server-authorized; source deep links and mutations reauthorize their own canonical domains.

**Permission-before-count directive:**
Automation Monitor counts, facets and filtering apply tenant/resource authorization before aggregation.

**Tenant directive:**
definitions, versions, TriggerInvocations, Runs, Attempts, Steps, Integration references and source references remain strictly tenant scoped.

**Caching directive:**
Monitor caches vary by membership/authorization, Run projections, AutomationDefinition versions, retry eligibility and relevant Integration/source visibility revisions.

**Performance directive:**
Design 141 should use indexed Run summaries, materialized failure/retry projections, stable cursor pagination and lazy Step/evidence loading rather than hydrating every full execution graph on initial load.

**Partial-failure directive:**
Automation core, source-domain lookup, Integration health, provider evidence and retry-resolution services may fail independently. `Unavailable` can never become `Failed`, `Healthy`, `Safe to retry`, `Source deleted`, or `Run succeeded` without evidence.

**Future-reuse directive:**
Design **142 — Automation Run Detail / Failure Investigation** must reuse this exact canonical Run → Attempt → StepRun → ActionExecution → provider/source evidence hierarchy and provide deep failure/reconciliation investigation without creating a second runtime model or exposing credentials/raw sensitive provider payloads.

**Overlap directive:**
Designs **013, 110, 124–143** must preserve one continuous **versioned AutomationDefinition → validated/deduplicated TriggerInvocation → durable AutomationRun → RunAttempt → exact StepRuns → typed ActionExecutions → Integration/source-domain operations → provider/domain evidence → derived Run state/retry eligibility → Design-136/143 operational projections**, while specialized Outreach, Project Workflow, Publishing, Distribution, Reporting, Integration and Alert domains retain their own canonical runtime identities.

**Consolidation directive:**
**STANDARDIZE ONE AUTOMATION EXECUTION FOUNDATION — STABLE AUTOMATIONDEFINITION + IMMUTABLE DEFINITIONVERSION + DEDUPLICATED TRIGGERINVOCATION + DURABLE AUTOMATIONRUN/ATTEMPT + STABLE STEPRUN/ACTIONEXECUTION LINEAGE + EXPLICIT SOURCE/INTEGRATION REFERENCES + KNOWN/PARTIAL/UNKNOWN OUTCOME CERTAINTY + CENTRAL RETRY-ELIGIBILITY/RECONCILIATION + SOURCE-DOMAIN IDEMPOTENCY + EXPLICIT SERVICE EXECUTION AUTHORITY + REBUILDABLE RUN-SUMMARY PROJECTIONS + STRICT DESIGN-013/110/124–143 DOMAIN BOUNDARIES — AND NEVER ALLOW QUEUE JOB IDS, `LATEST` AUTOMATION DEFINITIONS, GENERIC `STATUS=FAILED`, `RETRY=true`, OPAQUE PAYLOAD JSON, RAW CREDENTIALS, FRONTEND RETRY BUTTONS, COMMAND-CENTER ACKNOWLEDGEMENT OR INTEGRATION HEALTH TO SUBSTITUTE FOR OR REWRITE CANONICAL AUTOMATION EXECUTION TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **141 / 153** |
| **PASS**                                   |                        **141** |
| **STANDARDIZE decisions**                  |                        **139** |
| **Potential implementation-overlap flags** |                        **132** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**141 / 153 = 92.2% audited.**

### Canonical Automation execution architecture after Design 141

```text
AUTOMATION DEFINITION
        │
        ├── v3 historical
        ├── v4 published
        └── v5 draft
             │
             │
Domain Event triggers v4
             ↓
      TriggerInvocation
             ↓
       AutomationRun R-30
             │
          Attempt 1
             │
      ┌──────┼──────┐
      ↓      ↓      ↓
   Step A  Step B  Step C
   SUCCESS SUCCESS TIMEOUT
                    │
                    ↓
             Outcome UNKNOWN
                    │
                    ↓
               Reconcile
                    │
             ┌──────┴──────┐
             ↓             ↓
        side effect     no side effect
          exists            found
             ↓             ↓
          SUCCESS       safe retry
```

The strongest versioning rule is now explicit:

```text
Run R-30 started using
Automation v4.

While R-30 is running,
someone publishes v5.

R-30 continues using v4.

Retry of R-30 also follows
the original v4 execution intent
unless an explicit new Run is created.

It must NEVER silently switch
to v5.
```

External outcome safety is also protected:

```text
Automation Step:
Send Client Email

Provider request times out.

We do NOT know whether
the provider sent the message.

Correct:

Outcome = UNKNOWN
Retry = DISABLED
Action = RECONCILE

Incorrect:

Status = FAILED
Retry immediately
```

Specialized workflows remain canonical:

```text
AutomationRun
     ≠
Project Workflow Stage
     ≠
Outreach Enrollment
     ≠
PublicationAttempt
     ≠
Distribution ChannelExecution
     ≠
ScheduledReportRun
```

And Integration recovery never rewrites Run history:

```text
Yesterday:

Automation AR-20 failed
because Microsoft authorization expired.

Today:

Microsoft connection reauthorized.

RESULT:

Integration = healthy.

AR-20 remains
historical failed execution.

A retry creates
new Attempt lineage.

Connection repair
        ≠
Automation history rewrite.
```

## Next Sequential Audit Target

### **Design 142 — Automation Run Detail / Failure Investigation**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
