# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 142 — Automation Run Detail / Failure Investigation

Design 142 should become the **canonical Team Workspace single-AutomationRun forensic inspection, Step/Attempt lineage, failure diagnosis, external-outcome investigation, reconciliation, retry-safety, source-domain traceability, Integration dependency, and execution-evidence workspace** built directly on the Automation runtime foundation established by **Design 141 — Automation / Workflow Runs Monitor**.

Design 142 must open **one exact canonical `AutomationRun`** from Design 141. It must not create a second failure entity, a separate automation-debugging database, or a generic mutable error record.

Design 141 answers:

> **“Which Runs exist, which ones failed, and which need attention?”**

Design 142 answers:

> **“Exactly what happened inside this Run, which Attempt and Step failed, what evidence proves that, what external/domain side effects already happened, is the outcome known or uncertain, and what remediation is safe without duplicating or corrupting business state?”**

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **AutomationRun ≠ AutomationRunAttempt ≠ AutomationStepRun ≠ AutomationActionExecution ≠ AutomationFailure ≠ FailureObservation ≠ ExternalOutcomeEvidence ≠ RetryDecision ≠ ReconciliationAttempt ≠ IntegrationConnection ≠ ProviderEvent ≠ DomainExecution ≠ SourceDomainRecord ≠ ApplicationLog ≠ AuditEvent ≠ OperationalAttentionItem.**

The central implementation rule is:

> **Failure investigation is evidence reconstruction, not status editing. Design 142 must trace one exact AutomationRun through its pinned AutomationDefinitionVersion, TriggerInvocation, Attempts, StepRuns, ActionExecutions, Integration/provider evidence, and canonical source-domain outcomes. Operators may retry, reconcile, cancel, or invoke other repair actions only through narrowly scoped source/runtime services after the backend re-evaluates current state and duplicate-side-effect risk. A red error badge is never enough evidence to justify retry.**

---

# 1. Classification

| Audit field                         | Classification                                                                                                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**                       | **142**                                                                                                                                                                                                |
| **Canonical name**                  | **Automation Run Detail / Failure Investigation**                                                                                                                                                      |
| **Product area**                    | Team Workspace / Platform / Automation / Execution Diagnostics                                                                                                                                         |
| **User surface**                    | **Authenticated Team Workspace**                                                                                                                                                                       |
| **Screen class**                    | Entity Detail / Execution Forensics / Failure Investigation Workspace                                                                                                                                  |
| **Classification**                  | **Canonical AutomationRun Detail, Step-Level Failure Evidence, Reconciliation & Safe-Remediation Anchor**                                                                                              |
| **Primary purpose**                 | Investigate one AutomationRun in depth, reconstruct exact execution lineage, identify failed/unknown Steps, inspect source/provider evidence, determine retry safety, and execute governed remediation |
| **Canonical Automation foundation** | **Design 141**                                                                                                                                                                                         |
| **Primary canonical identity**      | `AutomationRun`                                                                                                                                                                                        |
| **Definition lineage**              | `AutomationDefinition` + exact `AutomationDefinitionVersion`                                                                                                                                           |
| **Trigger lineage**                 | `TriggerInvocation`                                                                                                                                                                                    |
| **Attempt identity**                | `AutomationRunAttempt`                                                                                                                                                                                 |
| **Step execution identity**         | `AutomationStepRun`                                                                                                                                                                                    |
| **Action execution identity**       | `AutomationActionExecution`                                                                                                                                                                            |
| **Failure representation**          | normalized failure evidence, not a competing business entity                                                                                                                                           |
| **External outcome evidence**       | ProviderEvent / domain-side execution evidence                                                                                                                                                         |
| **Reconciliation identity**         | `AutomationReconciliationAttempt` or typed reconciliation result where durable execution requires it                                                                                                   |
| **Retry decision**                  | derived `AutomationRetryDecision` / eligibility projection                                                                                                                                             |
| **Integration dependency**          | Designs 139–140                                                                                                                                                                                        |
| **Operations dependency**           | Design 136                                                                                                                                                                                             |
| **Audit dependency**                | Designs 039 / 138                                                                                                                                                                                      |
| **Publishing dependency**           | Designs 124–126                                                                                                                                                                                        |
| **Distribution dependency**         | Designs 127–129                                                                                                                                                                                        |
| **Scheduled reporting dependency**  | Design 134                                                                                                                                                                                             |
| **Outreach boundary**               | Designs 012–013 / 090                                                                                                                                                                                  |
| **Project Workflow boundary**       | Designs 023 / 110                                                                                                                                                                                      |
| **Alert dependency**                | Design 143                                                                                                                                                                                             |
| **Incident boundary**               | Design 147                                                                                                                                                                                             |
| **Detail projection**               | `AutomationRunDetailView`                                                                                                                                                                              |
| **Execution graph projection**      | `AutomationExecutionTrace`                                                                                                                                                                             |
| **Failure analysis projection**     | `AutomationFailureInvestigationView`                                                                                                                                                                   |
| **Primary query service**           | `AutomationRunDetailQueryService`                                                                                                                                                                      |
| **Trace resolver**                  | `AutomationExecutionTraceResolver`                                                                                                                                                                     |
| **Failure classifier**              | `AutomationFailureClassifier`                                                                                                                                                                          |
| **Outcome resolver**                | `AutomationOutcomeResolver`                                                                                                                                                                            |
| **Reconciliation service**          | `AutomationReconciliationService`                                                                                                                                                                      |
| **Retry eligibility resolver**      | same canonical resolver from Design 141                                                                                                                                                                |
| **Remediation service**             | typed Automation/source-domain command services                                                                                                                                                        |
| **Parent shell**                    | `InternalAppShell` — Design 001                                                                                                                                                                        |
| **Auth**                            | Required                                                                                                                                                                                               |
| **Authorization**                   | Active OrganizationMembership + Run detail/evidence/remediation/source permissions                                                                                                                     |
| **Implementation priority**         | **Critical Forensic Integrity / Duplicate-Side-Effect Prevention / Safe Automation Recovery**                                                                                                          |
| **Reuse level**                     | **Very High across provider-backed automations, Operations, Integration diagnostics, Alerts, Audit, and incident investigation**                                                                       |

Design 142 should answer:

> **“Which exact AutomationDefinitionVersion ran, what triggered it, what happened in every Attempt and Step, which Steps caused business/provider side effects, which side effects are confirmed, failed, partial, or unknown, what dependencies were involved, and what exact remediation is safe now?”**

Canonical detail lineage:

```text
AutomationDefinition A-10
        │
        └── Version v4
                │
                ↓
         TriggerInvocation TI-20
                │
                ↓
          AutomationRun AR-30
                │
         ┌──────┴──────┐
         ↓             ↓
      Attempt 1     Attempt 2
         │
    ┌────┼────┐
    ↓    ↓    ↓
   S1   S2   S3
   ✓    ✓    TIMEOUT
              │
              ↓
        ActionExecution AE-7
              │
              ↓
        Provider request
              │
      ┌───────┴────────┐
      ↓                ↓
 provider confirms   no confirmation
 side effect         available yet
      ↓                ↓
  SUCCEEDED       OUTCOME UNKNOWN
                       │
                       ↓
                 RECONCILIATION
```

---

# 2. Reuse

## Design 141 remains canonical Run authority

Design 142 must use the exact same:

```text
automationRunId
```

selected from Design 141.

It must not create:

```text
AutomationFailureCase
AutomationDebugRun
FailedWorkflowRecord
ExecutionInvestigation
```

as competing business identities.

---

## `AutomationRunDetailView` ≠ `AutomationRun`

The detail page may compose:

* Run;
* DefinitionVersion;
* Trigger;
* Attempts;
* Steps;
* ActionExecutions;
* source records;
* provider evidence;
* Integration health;
* retry eligibility;
* reconciliation history.

It remains a read composition.

---

## AutomationRun ≠ AutomationFailure

Critical.

A Run can contain:

* several successful Steps;
* one failed Step;
* one unknown Step;
* partial business effects.

Do not turn:

```text
automationFailure = true
```

into the primary domain model.

---

## Failure classification ≠ source truth

`AutomationFailureClassifier` can derive:

> Missing permission
> Integration unavailable
> Domain conflict
> Timeout

but canonical evidence remains:

* StepRun;
* ActionExecution;
* provider/source response;
* source-domain state.

---

## Failure reason ≠ retry decision

This must remain explicit.

Example:

```text
FailureClass = TIMEOUT
```

does **not** automatically mean:

```text
Retry = SAFE
```

Outcome evidence determines that.

---

## Step failure ≠ Run failure universally

Critical.

A non-critical/optional Step may fail while the Run resolves:

> Partial

or even:

> Succeeded with optional failure

if the versioned AutomationDefinition explicitly supports that policy.

Do not infer from color.

---

## Run failure ≠ source-domain failure

Permanent.

Example:

Automation:

> Create Project → Send Welcome Email

If:

```text
Project created = SUCCESS
Welcome email = FAILED
```

then:

```text
Project remains created.
```

The automation may be Partial/Failed depending on policy.

It must never roll back the Project merely to clear the red Run state.

---

## Source-domain execution ≠ Automation action execution

Example:

```text
AutomationActionExecution
→ invoke PublicationService
```

is different from:

```text
PublicationAttempt
```

The latter remains Publishing authority.

Design 142 can link them.

It cannot replace them.

---

## ProviderEvent ≠ Automation Step

Permanent.

Provider events can prove what happened externally.

They do not become Automation Step state themselves.

---

## Integration Detail ≠ Automation failure investigation

### Design 140

> Is connection IC-20 healthy and correctly authorized?

### Design 142

> What happened in AutomationRun AR-30 using IC-20?

The same connection may be healthy now even though the historical Run failed earlier.

---

## Current Integration health ≠ health at execution time

Critical.

Design 142 should preserve both where available:

> At execution: Authorization expired
> Current state: Healthy

Do not rewrite historical failure cause using current health.

---

## Current source state ≠ source state at execution

Permanent.

Example:

Task may now be completed.

The Run still needs historical context:

> Task was Open at Step execution time.

Where exact historical snapshot does not exist, display limitations rather than fabricate history.

---

## Automation logs ≠ Application logs

Design 142 can show:

* normalized Step transitions;
* retry history;
* safe execution metadata;
* provider/source references.

It should not expose raw:

* stack traces;
* SQL;
* headers;
* secrets;
* complete request bodies;

as canonical failure evidence.

---

## Automation logs ≠ AuditEvents

Design 138 remains governance evidence.

A Step timeline can be much more detailed than global Audit.

Do not copy every Step into Audit.

---

## Automation detail ≠ Operations Command Center

Design 136 may say:

> AR-30 requires reconciliation.

Design 142 performs the actual evidence investigation.

Command Center acknowledgement does not alter Run/Step truth.

---

# 3. Entities

## AutomationRun

Same canonical Design-141 entity.

Design 142 should expose:

* stable Run ID;
* DefinitionVersion;
* TriggerInvocation;
* state;
* outcome certainty;
* source context;
* created/started/completed times;
* current attempt;
* failure summary.

---

## AutomationDefinitionVersion

Exact immutable version.

The detail screen must be able to answer:

> What logic was actually executed?

Not:

> What does the Automation look like today?

---

## Definition snapshot

Where helpful, Detail can resolve the exact immutable Version configuration.

It should never substitute the current Draft/latest Definition.

---

## TriggerInvocation

Evidence of why Run exists.

Should expose safe context such as:

```text
triggerType
source reference
domain/provider event ID
scheduled occurrence
manual actor
occurredAt
receivedAt
deduplication key
```

where authorized.

---

## Trigger input ≠ raw provider payload

Permanent.

Only safe normalized trigger context should be exposed.

---

## AutomationRunAttempt

One whole-Run execution attempt.

Conceptually:

```text
AutomationRunAttempt
├── id
├── automationRunId
├── attemptNumber
├── initiatedBy
├── retryReason?
├── startedAt
├── completedAt?
├── state
└── revision
```

---

## Attempt 2 does not erase Attempt 1

Absolute.

Historical failure/retry evidence is append-oriented.

---

## Attempt initiatedBy

Can distinguish:

* automatic retry;
* human operator;
* system repair;
* backoff retry.

Do not attribute all retry Attempts to the original Run creator.

---

## AutomationStepRun

Detail must preserve exact Step identity and Attempt context.

Conceptually:

```text
AutomationStepRun
├── id
├── attemptId
├── stepDefinitionId
├── sequence/path
├── state
├── startedAt?
├── completedAt?
├── actionExecutionId?
├── failureObservationId?
├── outputReference?
├── retryCount
└── revision
```

---

## StepDefinition identity

Stable within AutomationDefinitionVersion.

If the user later reorders/edit Steps in v5:

historical v4 Step identity remains stable.

---

## Step path

For conditional/branching automation:

Step context may need:

```text
branch / path
```

so Detail can explain why some Steps were skipped.

---

## `SKIPPED` reason

If a Step is skipped because:

> condition evaluated false

that should be distinguishable from:

> skipped because earlier failure aborted branch.

---

## AutomationActionExecution

Typed external/domain action execution.

Conceptually:

```text
AutomationActionExecution
├── id
├── stepRunId
├── actionType
├── targetReference
├── integrationConnectionId?
├── providerOperationId?
├── domainCommandId?
├── initiatedAt
├── acknowledgedAt?
├── outcomeState
├── outcomeCertainty
├── idempotencyKeyReference
└── revision
```

---

## Action type ≠ arbitrary function name

Use stable semantic action keys.

Example:

```text
TASK.CREATE
REPORT.DELIVER
PUBLICATION.RELEASE
EMAIL.SEND
```

according to platform capabilities.

---

## Action target ≠ free-form URL/string

Use typed references where possible.

---

## FailureObservation

A normalized evidence record/projection can represent:

```text
FailureObservation
├── failureClass
├── source
├── firstObservedAt
├── lastObservedAt
├── safeCode
├── safeMessage
├── retryabilityHint
└── evidenceRefs
```

It must not become editable canonical truth.

---

## Raw provider error ≠ FailureObservation

Provider-specific response should be normalized/redacted before operator exposure.

---

## Error message ≠ identity

Never use free-text message as deduplication key.

---

## FailureClass

Examples:

```text
VALIDATION_FAILURE
PERMISSION_DENIED
DOMAIN_CONFLICT
INTEGRATION_UNAVAILABLE
AUTHORIZATION_EXPIRED
RATE_LIMITED
TIMEOUT
PROVIDER_REJECTED
SOURCE_NOT_FOUND
OUTCOME_UNKNOWN
SYSTEM_FAILURE
```

Exact registry Phase 3D.

---

## FailureClass should be stable/versioned

Provider wording may change.

Platform failure classification should not.

---

## ExternalOutcomeEvidence

Conceptually:

```text
ExternalOutcomeEvidence
├── actionExecutionId
├── evidenceType
├── providerEventId?
├── externalObjectId?
├── observedAt
├── receivedAt
├── verificationState
├── outcome
└── safeMetadata
```

---

## External object ID ≠ success alone

An external ID may indicate object creation but verification may still be incomplete.

Use provider/domain semantics.

---

## Outcome certainty

Should remain explicit:

```text
CONFIRMED
PARTIALLY_CONFIRMED
UNKNOWN
```

---

## ReconciliationAttempt

When a Step has unknown external outcome, reconciliation itself may deserve durable lineage.

Conceptually:

```text
AutomationReconciliationAttempt
├── id
├── actionExecutionId
├── initiatedBy
├── startedAt
├── completedAt?
├── evidenceFound
├── resolvedOutcome?
├── state
└── revision
```

---

## Reconciliation ≠ retry

Absolute.

---

## Reconciliation ≠ repair

It determines what happened.

Repair/retry follows only after outcome becomes sufficiently known.

---

## RetryDecision

A derived projection:

```text
AutomationRetryDecision
├── scope
├── eligibility
├── reason
├── earliestRetryAt?
├── requiredPrecondition?
└── derivedAt
```

Not user editable.

---

## Retry scope

Can distinguish:

```text
RETRY_STEP
RETRY_RUN
RETRY_DOWNSTREAM_DOMAIN_OPERATION
NO_RETRY
```

where source systems support it.

---

## Retry scope ≠ generic restart

Critical.

---

## SourceDomainReference

The detail page should expose typed references to affected:

* Deal;
* Project;
* Task;
* Client;
* ReportVersion;
* Publication;
* Distribution Placement;
* etc.

Each deep link reauthorizes.

---

## Source snapshot

If Automation needs reproducibility, store minimal safe event-time input/snapshot where required.

Avoid unbounded source object duplication.

---

## ApplicationLogReference

If support/engineering can access deeper logs, the Run may hold an internal correlation reference.

The normal Automation Detail should not copy logs into business history.

---

# 4. Permissions

Design 142 should conceptually distinguish:

```text
automationRun.read
automationRun.readDetails
automationRun.readExecutionEvidence
automationRun.readSensitiveEvidence

automationRun.retry
automationRun.reconcile
automationRun.cancel

automationRun.overrideFailure
automationRun.invokeRepair
```

Exact names Phase 3D.

---

## Run summary access ≠ detailed evidence access

Critical.

Detailed inputs/outputs may contain sensitive Client/business data.

---

## Detailed evidence access ≠ raw provider secret/log access

Absolute.

---

## Retry permission ≠ reconciliation permission

Permanent.

---

## Reconciliation permission ≠ override permission

Permanent.

---

## Override should be exceptional

If the frozen product includes manual override:

it should require stronger permission, reason, Audit evidence, and exact expected state.

Do not invent it if absent.

---

## Retry Run ≠ retry downstream source command automatically

Permanent.

---

## Step retry permission ≠ whole Run retry

Permanent.

---

## Cancel permission ≠ delete Run

Absolute.

Historical Run evidence must remain.

---

## Source record access separate

A user may investigate Automation mechanics without seeing all details of the source Client/Invoice/etc.

---

## Integration Detail permission separate

Seeing:

> Integration IC-20 caused auth failure

does not automatically grant Design-140 connection management.

---

## Provider evidence permission

Detailed external evidence may be more sensitive than normalized failure class.

Use separate access where needed.

---

## Cross-tenant Run/evidence access prohibited

Absolute.

---

## Correlation references reauthorize

Opening:

* ProviderEvent;
* AuditEvent;
* PublicationAttempt;
* ScheduledReportRun;

must use that domain's authorization.

---

## Counts in Step/evidence summaries permission-safe

Do not leak restricted downstream entities through:

> 12 records processed

unless user is allowed to know the aggregate.

---

# 5. States

Design 142 must keep **Run state, Attempt state, Step state, action outcome, outcome certainty, failure class, reconciliation state, retry eligibility, source state, and current dependency health** separate.

### Run

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

### Attempt

```text
Pending
Running
Succeeded
Partial
Failed
Cancelled
Unknown
```

### Step

```text
Pending
Ready
Running
Waiting
Succeeded
Skipped
Failed
Cancelled
Outcome Unknown
```

### Action outcome

```text
Not Started
Submitted
Accepted
Succeeded
Rejected
Failed
Outcome Unknown
```

### Reconciliation

```text
Not Required
Required
Pending
Running
Resolved
Failed
Unavailable
```

### Retry

```text
Safe
Requires Reconciliation
Retry After
Not Retryable
Restricted
Unknown
```

These must not collapse into a generic `failure_status`.

---

## Step failed ≠ external action failed

Critical.

Example:

Automation worker crashes after provider accepted request.

Step execution may fail internally while external action succeeded.

---

## Provider accepted ≠ external business outcome finalized

Permanent.

---

## Retry safe ≠ retry currently authorized

Both conditions must be true.

---

## Retry authorized ≠ retry safe

Absolute.

Permission is not safety.

---

## Reconciliation resolved success ≠ Step originally succeeded

Historical truth remains:

> original Step had uncertain outcome; later reconciliation confirmed side effect succeeded.

Do not rewrite the original event chronology.

---

## Reconciliation resolved no side effect ≠ original timeout disappeared

Permanent.

Original timeout remains historical evidence.

---

## Current source success ≠ original Step success

Example:

Another human may have manually completed the missing action later.

Do not attribute that outcome to the Automation unless evidence proves it.

---

## Current Integration healthy ≠ historical Integration healthy

Permanent.

---

## Source missing ≠ source deleted conclusively

Could be restricted or unavailable.

---

## One evidence service unavailable ≠ Run evidence lost

The Detail page should degrade by section.

---

## State Coverage

Design 142 inherits Design 150 plus:

```text
Automation Run Detail Loading
Automation Run Detail Available
Automation Run Detail Restricted
Automation Run Detail Partial
Automation Run Detail Unavailable

Run Queued
Run Running
Run Waiting
Run Succeeded
Run Partial
Run Failed
Run Cancelled
Run Needs Reconciliation
Run State Unknown

Attempt Pending
Attempt Running
Attempt Succeeded
Attempt Partial
Attempt Failed
Attempt Cancelled
Attempt State Unknown

Step Pending
Step Ready
Step Running
Step Waiting
Step Succeeded
Step Skipped
Step Failed
Step Cancelled
Step Outcome Unknown

Failure Validation
Failure Permission
Failure Domain Conflict
Failure Integration
Failure Rate Limit
Failure Timeout
Failure Provider Rejection
Failure System
Failure Unknown

Outcome Confirmed
Outcome Partially Confirmed
Outcome Unknown

Reconciliation Not Required
Reconciliation Required
Reconciliation Pending
Reconciliation Running
Reconciliation Resolved
Reconciliation Failed
Reconciliation Unavailable

Retry Safe
Retry Requires Reconciliation
Retry After
Retry Not Allowed
Retry Restricted
Retry Eligibility Unknown

Source Available
Source Restricted
Source Changed
Source Unavailable

Integration Healthy Now
Integration Degraded Now
Integration Unavailable Now
Historical Integration State Available
Historical Integration State Unknown

Provider Evidence Available
Provider Evidence Partial
Provider Evidence Restricted
Provider Evidence Unavailable

Run Updated Elsewhere
Provider Evidence Arrived
Source Updated Elsewhere
Integration Recovered
Retry Eligibility Changed
Investigation Projection Stale
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize the forensic order:

```text
Run identity
↓
Definition version + trigger
↓
Run outcome / certainty
↓
Attempt timeline
↓
Step execution graph
↓
Selected failed/unknown Step
↓
Failure evidence
↓
External/provider evidence
↓
Source-domain result
↓
Current retry/reconcile decision
```

Only frozen Design-142 regions should render.

---

## Exact version should remain visible

The operator should always know:

> Investigating Automation v4

rather than current v5.

---

## Run and Attempt chronology should be clear

Example:

```text
Attempt 1
10:02–10:03
Failed

Attempt 2
10:08–10:09
Outcome Unknown
```

Do not flatten to:

> Failed twice.

---

## Step topology should preserve execution path

If branching exists:

* executed;
* skipped by condition;
* skipped due upstream failure;

should look distinct.

---

## Failure evidence should be layered

A useful hierarchy:

> Normalized failure
> Outcome certainty
> Safe provider/domain evidence
> Retry eligibility
> Current dependency state

Do not lead with a raw stack trace.

---

## Historical vs current dependency state should be visually separated

Example:

> At failure: Microsoft authorization expired
> Now: Microsoft authorization valid

This helps avoid misdiagnosis.

---

## Retry and Reconcile must look materially different

Critical UX safety.

Correct:

> Reconcile outcome

vs:

> Retry Step

Do not put both behind one generic:

> Try Again.

---

## Danger actions must explain scope

Where frozen UI allows retry:

> Retry failed email Step only

or:

> Retry entire Automation attempt

must be explicit.

---

## Never hide already completed side effects

Before whole-Run retry, operator needs to know:

> Task already created
> Contract already updated
> Email uncertain

so duplicate business effects are understandable.

---

## Technical identifiers should be secondary

Useful IDs:

* Run ID;
* Attempt ID;
* Step ID;
* provider request ID;
* correlation ID.

But human-readable failure/source context should remain primary.

---

## Tablet

Following Design 152:

* Run/version/outcome stay top;
* attempt/Step timeline stacks;
* selected Step details move below;
* provider/source evidence becomes expandable;
* retry/reconcile controls remain clearly distinguished.

---

## Mobile

Priority:

```text
Run state
↓
Outcome certainty
↓
Automation + version
↓
Trigger/source
↓
Failed/unknown Step
↓
Failure class
↓
External evidence
↓
Already completed side effects
↓
Safe next action
```

Do not force a wide workflow graph onto mobile.

---

## Mobile failure card

Conceptually:

> Client Won Handoff · v4
> Run AR-30
> Step: Send Welcome Email
> Timeout
> External outcome unknown
> Task creation already completed
> Action: Reconcile email delivery

---

## Accessibility

A detailed failure could communicate:

> Automation run AR-30 used Client Won Handoff definition version 4. Attempt 1 completed the Create Project and Create Onboarding steps successfully. The Send Welcome Email step timed out. The provider's final delivery outcome is not currently known. Because prior side effects already exist and the email may have been sent, retrying the entire Run is not currently safe. Reconciliation is required first.

where canonical evidence supports it.

---

# 7. Backend Requirements

## Canonical failure-investigation architecture

```text
AutomationRun AR-30
      │
      ├── DefinitionVersion v4
      ├── TriggerInvocation
      │
      └── Attempts
             │
             ↓
          StepRuns
             │
             ↓
       ActionExecutions
             │
       ┌─────┼────────┐
       ↓     ↓        ↓
   Domain  Integration Provider
   result     state    evidence
       │       │        │
       └───────┼────────┘
               ↓
        Outcome Resolver
               ↓
       Retry Eligibility
               ↓
        Safe remediation
```

---

## Detail query

Conceptually:

```text
getAutomationRunDetail(
    automationRunId,
    currentMembership
)
```

should:

1. authenticate;
2. resolve tenant;
3. authorize Run;
4. load exact AutomationDefinitionVersion;
5. load TriggerInvocation;
6. load Attempts;
7. load StepRuns;
8. load ActionExecutions;
9. resolve safe failure observations;
10. resolve provider/domain evidence;
11. resolve historical/current Integration context;
12. resolve source-domain references;
13. derive outcome certainty;
14. derive retry/reconciliation eligibility;
15. return permission-safe detail.

---

## ExecutionTrace resolver

One canonical:

```text
AutomationExecutionTraceResolver
```

should assemble chronology from:

* trigger;
* Run;
* Attempts;
* Steps;
* action executions;
* provider/source evidence.

Do not reconstruct chronology in React components.

---

## Ordering

Use stable:

* sequence;
* attempt number;
* startedAt;
* completedAt;
* provider event occurrence/receive times.

Do not assume DB insertion order is execution order.

---

## Parallel Steps

If Automation supports parallel branches:

timeline/model must represent concurrency.

Do not fake a simple linear sequence.

---

## Execution graph ≠ visual graph only

The backend should provide structural relationships:

```text
dependsOn
branch
parentStep
path
```

where applicable.

---

## Step diagnostics

Conceptually:

```text
getAutomationStepInvestigation(
    stepRunId,
    currentMembership
)
```

may return:

* StepDefinition metadata;
* Attempt;
* action target;
* normalized input summary;
* normalized output summary;
* failure evidence;
* external outcome;
* Integration state;
* retry decision.

---

## Safe input/output summaries

Never automatically persist/display full raw Step inputs/outputs.

Use:

* field allowlists;
* redaction;
* typed references;
* size limits.

---

## Secret redaction before persistence

Same Design-138 principle.

If secrets are stored in Automation execution history then hidden visually, the security failure already happened.

---

## Data minimization

Do not persist entire:

* Client records;
* email bodies;
* provider payloads;
* documents;

merely for debugging unless explicitly required by canonical domain/evidence policy.

Prefer references plus minimal safe snapshots.

---

## Failure classifier

Central:

```text
AutomationFailureClassifier.classify(
    stepRun,
    actionExecution,
    sourceResult,
    providerEvidence
)
```

returns stable normalized failure class.

---

## Failure classifier does not decide retry alone

Permanent.

---

## Outcome resolver

Central:

```text
AutomationOutcomeResolver.resolve(
    actionExecution,
    sourceEvidence,
    providerEvents,
    reconciliationResults
)
```

returns:

```text
CONFIRMED_SUCCESS
CONFIRMED_FAILURE
PARTIAL
UNKNOWN
```

or equivalent.

---

## External-side-effect safety

Critical example:

```text
POST /send-email
↓
network timeout
```

Do not infer:

> email not sent.

Search/provider reconciliation must determine whether external request committed.

---

## Provider request IDs

If provider offers:

* idempotency key;
* request ID;
* message ID;
* transaction ID;

store safe references needed for reconciliation.

---

## Provider request ID ≠ secret

But still treat as sensitive operational metadata where appropriate.

---

## Reconciliation service

Conceptually:

```text
reconcileAutomationActionExecution(
    actionExecutionId,
    currentMembership,
    idempotencyKey
)
```

should:

1. authorize;
2. verify state is reconcilable;
3. inspect source/provider evidence without creating side effects;
4. persist ReconciliationAttempt/result;
5. update derived outcome certainty;
6. recompute retry eligibility;
7. emit appropriate operational/Audit evidence.

---

## Reconciliation must be side-effect free

Absolute.

---

## Reconciliation can be asynchronous

For slow providers:

state may be:

```text
RECONCILIATION_PENDING
```

Do not block browser request indefinitely.

---

## Reconciliation failure ≠ external failure

Permanent.

If provider lookup is down:

outcome remains unknown.

---

## Retry Step

Conceptually:

```text
retryAutomationStep(
    runId,
    stepRunId,
    expectedRunRevision,
    idempotencyKey
)
```

must:

1. authorize;
2. re-read canonical Run/Step state;
3. recompute retry eligibility;
4. ensure prior side effect is absent or retry-safe;
5. reuse original DefinitionVersion/StepDefinition;
6. preserve source context;
7. create new Attempt/Step execution lineage;
8. use downstream idempotency.

---

## Retry uses original DefinitionVersion

Absolute.

---

## Retry does not use current latest config

Absolute.

---

## Retry input semantics

If retry should use original resolved values, pin original safe input snapshot/references.

If business semantics require current source state, this must be an explicit action/policy.

Do not silently mix historical configuration with current input data.

---

## Original input vs current state

This is important.

Example:

Automation originally attempted:

> send invoice amount $1,000.

Invoice is now amended to $1,200.

Retry policy must explicitly decide whether it is:

* retry original business intent;
* or generate a new Automation invocation against new state.

Never silently send the new value under the old Run.

---

## Source-version pinning

Where actions depend on versioned source artifacts:

retain exact source version.

Examples:

* ReportVersion;
* ContractVersion;
* PublicationVersion;
* DraftVersion.

---

## Whole-Run retry

Should only be permitted if:

* already completed side effects are idempotent;
* or Step engine skips confirmed-complete Steps safely;
* or definition explicitly supports rerun semantics.

Otherwise whole-Run retry can duplicate business operations.

---

## Resume vs retry

If durable runtime can continue after repair:

> Resume

may be semantically safer than:

> Retry whole Run.

Only expose if frozen runtime supports it.

Do not invent UI otherwise.

---

## Completed-Step preservation

A retry/resume should normally preserve confirmed successful Step effects.

Do not repeat:

* created Task;
* created Client;
* sent contract;
* published item;

unless domain semantics explicitly allow idempotent replay.

---

## Downstream source command results

Store typed references:

```text
Task T-10
ReportVersion RV-4
PublicationAttempt PA-7
```

so investigation can distinguish:

> command submission failed

from:

> downstream command succeeded but later processing failed.

---

## Integration context

Historical run should retain:

```text
integrationConnectionId
capability
credentialVersion?
authorization state observation?
```

where safe and useful.

Do not retain secret values.

---

## Current Integration state

Fetched from Design 140 separately.

---

## Current Integration repair ≠ Automation retry

After user fixes Integration:

Design 142 recomputes retry eligibility.

It does not automatically execute retry.

---

## Provider evidence arrival

A late webhook may convert:

```text
OUTCOME_UNKNOWN
```

to:

```text
CONFIRMED_SUCCESS
```

without any new retry.

This should update Run detail and potentially close Design-136 attention.

---

## Event-driven evidence updates

Design 142 can update through event/subscription invalidation where frozen UX supports live changes.

---

## Source record updates

A human may manually repair source state.

Automation Detail should display:

> source now resolved manually

without rewriting what Automation originally did.

---

## Manual resolution

If frozen UI includes:

> Mark resolved

this must be treated very carefully.

Prefer a typed:

> suppress/reclassify operational attention

rather than falsifying Run/Step success.

Do not invent a `markRunSucceeded` control.

---

## Override

If an authorized operator must override runtime state:

require:

* strong permission;
* explicit reason;
* expected revision;
* append-only override record;
* AuditEvent;
* preservation of original execution evidence.

No destructive overwrite.

---

## Cancellation

Before cancellation:

resolve:

* current Step;
* side-effect phase;
* cancellability.

If currently inside uncertain external request:

state may become:

> cancellation requested / outcome unknown.

---

## Automatic retry visibility

Design 142 should distinguish:

```text
automatic retry scheduled
```

from:

```text
manual retry available
```

---

## Backoff visibility

If frozen UI includes retry timing:

show:

> Retry eligible after 10:42

rather than generic Disabled.

---

## Definition comparison

Do not compare v4 Run against current v5 by default unless frozen Design 142 provides it.

If shown, keep:

> historical execution v4

and:

> newer definition v5

clearly separate.

---

## Application logs

For deeper engineering diagnostics, use correlation IDs to external observability systems.

Do not make raw application logs part of canonical Run detail payload.

---

## Audit integration

Material actions from Design 142 may generate AuditEvents:

* manual retry;
* cancel;
* reconciliation initiation/result where governance requires;
* privileged override.

Routine viewing/Step details do not need Audit noise.

---

## Operations integration

Design 136 should resolve current attention based on canonical Run/outcome state.

If reconciliation confirms success:

attention can disappear/resolve through projection update.

---

## Alert integration

Design 143 may produce:

* Run failure alert;
* repeated failure alert;
* long-running alert;
* reconciliation-needed alert.

Alert acknowledgement never changes Run state.

---

## Incident integration

If a platform-wide Automation engine failure occurs:

Design 147 Incident may reference affected Run sets.

Individual AutomationRun history remains unchanged.

---

## Idempotency

Required for:

* reconciliation attempts;
* Step retry;
* Run retry;
* cancellation;
* override commands;
* repair-trigger commands.

---

## Concurrency

Critical races:

### Provider evidence arrives while operator retries

Recompute eligibility inside transaction before retry.

### Automatic retry starts while human clicks retry

Deduplicate Attempt creation.

### Integration is repaired while reconciliation running

Allow reconciliation to finish; do not infer success.

### Source record changes while Step retry starts

Source-domain revision rules win.

### Run state updates while Detail page is stale

Command rejects stale expected revision.

---

## Cache

Detail cache should vary by:

```text
organizationMembershipId
authorizationRevision
runRevision
attemptRevision
stepRevision
actionExecutionRevision
providerEvidenceRevision
sourceRevision
integrationHealthRevision
retryDecisionRevision
reconciliationRevision
```

---

## Sensitive evidence cache

Do not cache privileged Step evidence into broader shared caches.

---

## Performance

Use:

* compact execution trace summaries;
* lazy Step/evidence loading;
* batched source/provider references;
* cursor pagination for long Attempt/Step histories;
* event-driven invalidation.

Do not return megabytes of raw Step input/output for every Run open.

---

## Partial failure contract

Example:

```text
Run core               ✓
Attempts               ✓
Steps                  ✓
Provider evidence      ✕
```

Correct:

> Execution history is available. External outcome remains unknown because provider evidence cannot currently be queried.

Incorrect:

> Provider action failed.

Another:

```text
Run evidence           ✓
Current Integration    unavailable
```

Correct:

> Historical failure evidence is available. Current connection health cannot be determined.

Not:

> Integration still broken.

Another:

```text
Source record          restricted
ActionExecution        ✓
```

Correct:

> Automation action evidence is available; current source details are restricted.

Not:

> Source deleted.

---

## Backend Requirement Matrix

| Requirement                                         | Status                                         |
| --------------------------------------------------- | ---------------------------------------------- |
| Design 141 exact `AutomationRun` identity reuse     | **Critical**                                   |
| No separate failure business entity                 | **Critical**                                   |
| Run/Attempt separation                              | **Critical**                                   |
| Attempt/Step separation                             | **Critical**                                   |
| Step/ActionExecution separation                     | **Critical**                                   |
| ActionExecution/external side effect separation     | **Critical**                                   |
| DefinitionVersion pinning                           | **Critical**                                   |
| Historical Definition/latest Definition separation  | **Critical**                                   |
| Trigger evidence preservation                       | **Critical**                                   |
| Stable StepDefinition identity                      | **Critical**                                   |
| Branch/skip semantics                               | **Critical where branching exists**            |
| Safe normalized failure classification              | **Critical**                                   |
| Failure class/retry eligibility separation          | **Critical**                                   |
| Run state/outcome certainty separation              | **Critical**                                   |
| Provider accepted/final business outcome separation | **Critical**                                   |
| Historical/current Integration state separation     | **Critical**                                   |
| Historical/current source state separation          | **Critical**                                   |
| ProviderEvent/Automation Step separation            | **Critical**                                   |
| ApplicationLog/Automation evidence separation       | **Critical**                                   |
| AuditEvent/Automation evidence separation           | **Critical**                                   |
| Secret redaction before persistence                 | **Critical**                                   |
| Input/output minimization                           | **Critical**                                   |
| Typed source references                             | **Critical**                                   |
| Typed downstream result references                  | **Critical**                                   |
| Central ExecutionTrace resolver                     | **Critical**                                   |
| Central Outcome resolver                            | **Critical**                                   |
| Central RetryDecision resolver                      | **Critical**                                   |
| Durable reconciliation attempts                     | **Critical where external side effects exist** |
| Reconciliation side-effect free                     | **Critical**                                   |
| Reconciliation failure/outcome failure separation   | **Critical**                                   |
| Provider request/idempotency references             | **Critical**                                   |
| Retry reuses original DefinitionVersion             | **Critical**                                   |
| Retry does not silently use latest data/config      | **Critical**                                   |
| Original intent/current source state policy         | **Critical**                                   |
| Exact versioned source pinning                      | **Critical where applicable**                  |
| Whole-Run retry duplicate prevention                | **Critical**                                   |
| Successful Step preservation                        | **Critical**                                   |
| Downstream domain idempotency reuse                 | **Critical**                                   |
| Current-state revalidation before remediation       | **Critical**                                   |
| Late provider evidence updates outcome              | **Critical**                                   |
| Manual repair/history preservation                  | **Critical**                                   |
| No `markRunSucceeded` history rewrite               | **Critical**                                   |
| Strongly governed override if present               | **Critical if override exists**                |
| Auto/manual retry distinction                       | **Critical**                                   |
| Cancellation/unknown outcome safety                 | **Critical**                                   |
| Permission before evidence access                   | **Critical**                                   |
| Cross-tenant isolation                              | **Critical**                                   |
| Source deep-link reauthorization                    | **Critical**                                   |
| Designs 136/138/140/143/147 reuse                   | **Critical architecture**                      |
| Idempotency                                         | **Critical**                                   |
| Optimistic concurrency                              | **Critical**                                   |
| Sensitive cache isolation                           | **Critical**                                   |
| Partial dependency failure handling                 | **Critical**                                   |

---

# 8. Consolidation

Design 142 has one of the highest duplicate-side-effect risks in the entire platform. A careless `"retry failed workflow"` implementation could resend emails, recreate Tasks, republish content, re-charge providers, duplicate Client messages, or corrupt source-domain history.

**Design 141 / Design 142 Run duplication**
Monitor and Detail use different execution identities.

**AutomationRun / AutomationFailure conflation**
One failure boolean replaces multi-Step execution evidence.

**Failure entity / StepRun evidence conflation**
Diagnostic projection becomes canonical runtime state.

**Run state / Attempt state conflation**
Retry history disappears.

**Attempt / Step conflation**
Cannot identify which execution unit failed.

**StepDefinition / StepRun conflation**
Historical configuration gets mutated by runtime state.

**Step / ActionExecution conflation**
Provider submission and Step logic become indistinguishable.

**ActionExecution / external side effect conflation**
Network timeout becomes external failure.

**Internal failure / business failure conflation**
Successful source mutation is rolled back mentally or technically.

**Step failure / Run failure conflation**
Optional/non-critical failure semantics disappear.

**Run failure / source-domain failure conflation**
Deal/Project/Report state is rewritten incorrectly.

**Failure reason / retry safety conflation**
Timeout always exposes Retry.

**Permission to retry / safety to retry conflation**
Authorized operator creates duplicate side effects.

**Provider accepted / delivered/verified conflation**
Execution appears fully successful too early.

**Outcome unknown / failed conflation**
Blind retry duplicates external actions.

**Reconciliation / retry conflation**
Investigation itself causes new side effects.

**Reconciliation unavailable / failure confirmed conflation**
Lack of evidence becomes negative evidence.

**Reconciliation success / original Step success conflation**
Historical chronology is rewritten.

**Current source success / Automation success conflation**
Human manual repair is attributed to Automation.

**Current Integration health / historical Integration health conflation**
Recovered connection hides original failure cause.

**Current source state / historical execution input conflation**
Old Run meaning changes after source edits.

**Latest Automation version / executed version conflation**
Investigation displays logic that never ran.

**Retry original Run / new Automation invocation conflation**
Different business intents mix.

**Retry Step / retry whole Run conflation**
Already-successful Steps duplicate.

**Retry / Resume conflation**
Runtime restarts more work than necessary.

**Retry / Compensation conflation**
System deletes or reverses successful domain actions.

**Retry input / current source value conflation**
Old Run retries with new Invoice/Report/Contract data silently.

**Versioned source / current source version conflation**
Report v3 retry accidentally operates on v4.

**Completed Step / rerunnable Step conflation**
Successful email/Task creation happens again.

**Provider request ID / provider success conflation**
An ID is treated as complete delivery evidence.

**External ID / verified external object conflation**
Incomplete provider state appears final.

**Automatic retry / manual retry conflation**
Actor/governance history is lost.

**Retry after / not retryable conflation**
Rate-limited Step appears permanently blocked.

**Cancellation requested / cancelled conflation**
In-flight external side effect is ignored.

**Cancellation / rollback conflation**
Already-created business records are removed.

**Skipped by condition / skipped due failure conflation**
Execution path is misrepresented.

**Parallel execution / linear timeline conflation**
Chronology becomes false.

**ProviderEvent / DomainEvent conflation**
External evidence bypasses normalization.

**ProviderEvent / Step log conflation**
Provider evidence is copied into Automation history inconsistently.

**FailureObservation / raw provider response conflation**
Sensitive provider payloads leak.

**FailureObservation / raw stack trace conflation**
Engineering internals become business evidence.

**Automation detail / observability log viewer conflation**
Canonical Run history becomes ephemeral debugging UI.

**Automation Step history / AuditEvent conflation**
Global Audit store becomes execution log.

**Automation detail / Integration Detail conflation**
Design 142 starts rotating credentials.

**Automation detail / Operations Command Center conflation**
Design 142 manages triage instead of Run evidence.

**Automation detail / Incident conflation**
Single failed Run becomes system Incident.

**Alert state / Run state conflation**
Acknowledging alert changes failure.

**Opaque input JSON / typed execution context conflation**
Sensitive data/security lineage disappears.

**Raw output JSON / evidence model conflation**
Huge unbounded payloads become permanent history.

**Secret redaction in UI / pre-persistence redaction conflation**
Tokens remain stored.

**Error message / failure identity conflation**
Provider text change breaks logic.

**Generic `error_code` / normalized failure class conflation**
Cross-provider behavior becomes inconsistent.

**Generic `retry()` / source-specific remediation conflation**
Unsafe side effects duplicate.

**Generic `mark_fixed=true`**
Operator falsifies execution history.

**Generic `mark_success=true`**
Canonical evidence becomes editable.

**Generic `debug_payload` JSON**
Secrets/privacy/performance risk.

**Generic `last_error`**
No Attempt/Step/provider evidence.

**Generic `previous_status/current_status` only**
Cannot reconstruct multi-Step execution.

**142/136 duplicate attention resolution**
Triage and execution truth merge.

**142/138 duplicate forensic/Audit evidence**
Governance and execution logs merge.

**142/140 duplicate Integration diagnostics**
Run Detail becomes connection authority.

**142/141 duplicate Runtime state**
Monitor and Detail disagree.

**142/143 duplicate alert acknowledgement**
Notifications mutate Run state.

**142/147 duplicate Incident investigation**
Single-run failure becomes incident lifecycle.

No additional screen is required.

These are **exact Run/Attempt/Step lineage, failure-vs-outcome distinction, safe provider/domain evidence, historical-vs-current context, reconciliation-before-retry, original-intent preservation, source-version pinning, duplicate-side-effect protection, and strict Automation/Integration/Audit/Operations boundaries**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL AUTOMATIONRUN DETAIL, STEP-LEVEL FAILURE EVIDENCE, RECONCILIATION & SAFE-REMEDIATION ANCHOR**

**Domain directive:**
**AutomationRun ≠ AutomationRunAttempt ≠ AutomationStepRun ≠ AutomationActionExecution ≠ AutomationFailure ≠ FailureObservation ≠ ExternalOutcomeEvidence ≠ RetryDecision ≠ ReconciliationAttempt ≠ IntegrationConnection ≠ ProviderEvent ≠ DomainExecution ≠ SourceDomainRecord ≠ ApplicationLog ≠ AuditEvent ≠ OperationalAttentionItem.**

**Foundation directive:**
Design 141 remains canonical Automation runtime/Run identity. Design 142 is an exact-Run evidence and remediation workspace over the same Run/Attempt/Step/ActionExecution records.

**No-second-failure-domain directive:**
there must be no independent `AutomationFailureCase`, `DebugRun`, or editable error record duplicating canonical execution evidence.

**Version directive:**
every investigation shows the exact `AutomationDefinitionVersion` that actually executed, never the latest/current Draft definition by default.

**Trigger directive:**
TriggerInvocation remains part of the forensic chain so operators can identify exactly why the Run existed and which domain/provider/schedule/manual event created it.

**Attempt directive:**
each automatic/manual retry preserves a distinct `AutomationRunAttempt`; retry history never overwrites the original Attempt.

**Step directive:**
every StepRun preserves stable StepDefinition identity, Attempt, execution path, timing, state, and action reference.

**Branch directive:**
executed, condition-skipped, upstream-failure-skipped, waiting and cancelled paths remain distinguishable.

**Action directive:**
AutomationActionExecution remains separate from canonical source/domain/provider effect and stores typed references rather than opaque business-state copies.

**Failure directive:**
normalized FailureObservation explains what was observed but never becomes the source of Run/Step truth.

**Failure-class directive:**
validation, permission, domain conflict, Integration failure, timeout, rate-limit, provider rejection, system error and unknown classes remain semantically distinct.

**Failure/retry directive:**
failure classification alone never determines retry safety.

**Outcome-certainty directive:**
known success, known failure, partial confirmation and unknown external outcome remain explicit and independent of red/green Run status.

**Timeout directive:**
a timeout/network disconnect during an external side effect cannot be interpreted automatically as external failure.

**Provider-evidence directive:**
provider request IDs, external object IDs and ProviderEvents may contribute evidence but must be validated against provider semantics before confirming success.

**Reconciliation directive:**
unknown external outcomes are investigated through a side-effect-free reconciliation service before retry where duplicate external action is possible.

**Reconciliation-history directive:**
reconciliation attempts/results are append-oriented evidence and do not erase the original timeout/unknown state from execution chronology.

**Reconciliation-failure directive:**
failure to query provider evidence means outcome remains unknown; it never proves the side effect failed.

**Retry-decision directive:**
one canonical `AutomationRetryEligibilityResolver` produces retry scope, safety, prerequisites, and optional retry-after time from current Run/Step/provider/source evidence.

**Permission/safety directive:**
being authorized to retry does not make retry safe, and retry being technically safe does not grant user permission.

**Original-version directive:**
a retry of an existing Run/Step continues the original pinned AutomationDefinitionVersion unless the user/system intentionally creates a completely new Automation invocation.

**Original-intent directive:**
retry semantics explicitly determine whether the operation uses original resolved inputs/source versions or current source state; the platform may never silently mix old Run logic with newly changed business values.

**Source-version directive:**
version-sensitive actions retain exact ReportVersion, ContractVersion, PublicationVersion, DraftVersion, ProofVersion, or other canonical source-version references where applicable.

**Whole-Run retry directive:**
whole-Run retry is permitted only when already-completed side effects are idempotent/skippable or the Automation version explicitly defines safe rerun semantics.

**Completed-side-effect directive:**
confirmed successful Tasks, messages, Projects, Reports, Publications, or other side effects remain preserved and are not repeated merely to clear a failed Run.

**Compensation directive:**
already-completed canonical business mutations are never automatically rolled back unless a separately defined domain compensation/saga policy explicitly requires it.

**Domain directive:**
Tasks, Clients, Deals, Projects, Publications, Distribution executions, Reports and other source records remain authoritative in their own services. Design 142 references and reauthorizes them instead of editing copied execution state.

**Current-source directive:**
current source state may differ from event-time source state; the Detail UI must not rewrite historical automation evidence from today's source record.

**Integration directive:**
Design 140 remains current IntegrationConnection/auth/capability/health authority. Design 142 may show historical/current Integration context but cannot own credential/configuration repair.

**Historical-health directive:**
a healthy Integration today does not rewrite an Automation failure caused by expired authorization yesterday.

**Connection-repair directive:**
successful Integration repair only changes current provider capability. It may make retry eligible but never automatically reruns the Automation or marks the historical Step successful.

**Provider-event directive:**
late verified provider evidence can move an uncertain action outcome to confirmed success/failure without generating a duplicate side effect.

**Execution-trace directive:**
one server-side `AutomationExecutionTraceResolver` constructs chronology/branch relationships from canonical Run, Attempts, Steps, ActionExecutions, and evidence; frontend code does not invent execution history.

**Parallelism directive:**
parallel branches remain structurally represented and must not be mis-rendered as a false serial timeline.

**Input/output directive:**
Automation execution history stores only minimum typed/redacted values necessary for reproducibility/investigation; credentials, tokens, unbounded provider payloads, entire Client records, and unnecessary personal data are excluded.

**Secret directive:**
redaction and data minimization occur before execution-evidence persistence; UI masking is insufficient.

**Diagnostic directive:**
operator-facing errors use normalized safe failure classes/messages. Raw logs, Authorization headers, credentials, SQL and provider payloads remain observability/private infrastructure.

**Observability directive:**
application logs and stack traces can be correlated using safe IDs but never become canonical AutomationRun state.

**Audit directive:**
Design 138 records material manual retry/cancel/reconciliation/override actions where governance requires, while detailed Step traces remain Automation execution evidence rather than AuditEvent spam.

**Operations directive:**
Design 136 may surface failed/reconciliation-required Runs through OperationalAttentionItems, but acknowledgement/snooze/resolution of that projection never mutates Run truth.

**Alert directive:**
Design 143 may notify on Automation failure or prolonged reconciliation; alert acknowledgement/dismissal never changes the Run.

**Incident directive:**
Design 147 may correlate widespread Automation failures into a platform Incident, but individual AutomationRuns preserve their own failure/evidence history.

**Manual-repair directive:**
if a source-domain record is manually repaired by a human, Design 142 may show that current source state has recovered without falsely attributing the repair to the original Automation.

**Override directive:**
if frozen product allows privileged state override, it must append a reasoned, actor-aware, revision-aware override record and AuditEvent while preserving original Run evidence. Direct `markRunSucceeded=true` history rewriting is prohibited.

**Cancellation directive:**
cancel requested, cancelled, and cancellation with external outcome unknown remain distinct. Cancellation never implies rollback of already-completed effects.

**Idempotency directive:**
reconciliation, Step retry, Run retry, cancellation and any repair command use stable idempotency keys and preserve Attempt lineage.

**Concurrency directive:**
late provider callbacks, automatic retries, human retries, source edits, Integration repairs and Run updates require current-state/revision re-evaluation before every remediation.

**Projection directive:**
`AutomationRunDetailView` and `AutomationFailureInvestigationView` remain rebuildable read compositions; they never become writable execution truth.

**Authorization directive:**
Run read, detailed evidence read, sensitive evidence access, retry, reconcile, cancel and any override remain independently server-authorized.

**Source-access directive:**
source-domain and Integration/Audit/provider-evidence deep links reauthorize their own resources; Run visibility alone never grants source access.

**Tenant directive:**
Run, Attempts, Steps, ActionExecutions, provider evidence and source references remain strictly tenant/context scoped.

**Cache directive:**
Detail caches vary by Run/Attempt/Step/Action/provider/source/Integration/reconciliation/retry-decision revisions and authorization scope; privileged evidence is never shared through broader caches.

**Performance directive:**
load a compact execution trace first, then lazily load heavy Step/provider/source evidence; use batched references and bounded pagination for long-running/retried Automations instead of returning unbounded raw histories.

**Partial-failure directive:**
Run core, source-domain resolution, current Integration health, provider evidence and reconciliation services may fail independently. `Unavailable` can never become `Failed`, `Safe to retry`, `Source deleted`, `Integration broken`, or `Outcome known` without evidence.

**Future-reuse directive:**
Design **143 — System Notifications / Alert Rules Management** should consume typed Automation failure/reconciliation conditions as alert inputs while retaining its own AlertRule/Alert/Notification semantics. Alert Rules may observe AutomationRun state but must never define or mutate Automation execution state.

**Overlap directive:**
Designs **136, 138, 140–147** must preserve one continuous **AutomationRun → Attempt → StepRun → ActionExecution → provider/source evidence → normalized FailureObservation → outcome certainty → reconciliation → derived RetryDecision → safe source/runtime remediation**, while Operations, Integration, Audit, Alert, and Incident surfaces remain projections or adjacent authorities rather than alternate execution truth.

**Consolidation directive:**
**STANDARDIZE ONE AUTOMATION FAILURE-INVESTIGATION FOUNDATION — DESIGN-141 EXACT RUN IDENTITY + PINNED DEFINITIONVERSION/TRIGGER + APPEND ATTEMPT/STEPRUN/ACTIONEXECUTION LINEAGE + SAFE NORMALIZED FAILURE EVIDENCE + HISTORICAL/CURRENT INTEGRATION AND SOURCE CONTEXT + EXPLICIT OUTCOME CERTAINTY + SIDE-EFFECT-FREE RECONCILIATION + CENTRAL RETRY-DECISION ENGINE + ORIGINAL-INTENT/SOURCE-VERSION PRESERVATION + SOURCE-DOMAIN IDEMPOTENCY + STRONG CURRENT-STATE REVALIDATION + STRICT DESIGN-136/138/140/143/147 BOUNDARIES — AND NEVER ALLOW GENERIC `LAST_ERROR`, `RETRY=true`, `MARK_SUCCESS`, RAW PAYLOAD DEBUGGING, CURRENT INTEGRATION HEALTH, LATEST AUTOMATION DEFINITION, FRONTEND RETRY BUTTONS, COMMAND-CENTER ACKNOWLEDGEMENT OR PROVIDER TIMEOUTS TO SUBSTITUTE FOR OR REWRITE CANONICAL AUTOMATION EXECUTION AND EXTERNAL-OUTCOME TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **142 / 153** |
| **PASS**                                   |                        **142** |
| **STANDARDIZE decisions**                  |                        **140** |
| **Potential implementation-overlap flags** |                        **133** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**142 / 153 = 92.8% audited.**

### Canonical failure-investigation architecture after Design 142

```text
AUTOMATION RUN AR-30
        │
        ├── Definition v4
        ├── Trigger TI-20
        │
        └── Attempt 1
               │
        ┌──────┼──────┐
        ↓      ↓      ↓
      Step A Step B Step C
       ✓      ✓     TIMEOUT
                      │
                      ↓
               ActionExecution
                      │
                      ↓
             Provider evidence
                      │
          ┌───────────┴──────────┐
          ↓                      ↓
    confirmed external       no reliable
       side effect           evidence yet
          ↓                      ↓
       SUCCESS             OUTCOME UNKNOWN
                                 │
                                 ↓
                           RECONCILIATION
                                 │
                      ┌──────────┴──────────┐
                      ↓                     ↓
                side effect found      none found
                      ↓                     ↓
                 no retry needed         safe retry
```

The strongest retry-safety rule is now explicit:

```text
Step:
Send Client Email

Worker receives timeout.

The system knows:

request was submitted

but DOES NOT know:

email definitely failed.


Therefore:

FailureClass = TIMEOUT
Outcome = UNKNOWN
Retry = NOT YET SAFE


Correct action:

RECONCILE

Only after evidence shows
the first email was not sent
can retry become SAFE.
```

Historical and current Integration state also remain distinct:

```text
At Run time:

Microsoft authorization = EXPIRED

Automation Step = FAILED


Today:

Microsoft authorization = VALID
Connection health = HEALTHY


Correct:

Historical Run still shows
authorization failure.

Current connection shows
recovered.

The old Run may now become
eligible for retry.

It does NOT become
historically successful.
```

Whole-Run retry also cannot duplicate completed work:

```text
Original Run:

1. Create Project       ✓
2. Create Onboarding    ✓
3. Send Welcome Email   ✕


Unsafe:

“Retry Run”
→ creates second Project
→ creates second Onboarding
→ sends email


Safe retry:

preserve confirmed Steps 1–2

retry only Step 3
when its external outcome
is known and retry-safe.
```

And current business data cannot silently replace original Run intent:

```text
Run AR-30 originally used:

ReportVersion v3

Later:

ReportVersion v4 exists


Retry AR-30 must NOT
silently operate on v4.

Either:

retry the original v3 intent

or

create a new Automation invocation
for v4.

Historical execution
must remain reproducible.
```

## Next Sequential Audit Target

### **Design 143 — System Notifications / Alert Rules Management**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
