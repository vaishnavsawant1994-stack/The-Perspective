# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 082 — Data Extraction Jobs / Extraction Runs

Design 082 should become the **canonical Team Workspace extraction-execution monitoring surface** for inspecting acquisition runs created from the Sources governed by Design 081 and executed through the canonical extraction engine established by Design 009.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Source ≠ ExtractionJob/SourceRun ≠ RunAttempt ≠ RunCheckpoint ≠ RawObservation ≠ ProcessingStage ≠ Error/Failure ≠ Retry ≠ ProspectCandidate ≠ Import.**

The central implementation rule is:

> **A Run is the durable identity of one intended extraction execution against one exact Source + configuration/connector revision. Attempts, retries, checkpoints, raw observations and downstream processing stages belong to that Run but never replace it. A retry continues or re-attempts the same governed execution intent when appropriate; a true rerun is a new Run. Neither may erase evidence from earlier attempts.**

---

# 1. Classification

| Audit field                         | Classification                                                                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                       | **082**                                                                                                                                                       |
| **Canonical name**                  | **Data Extraction Jobs / Extraction Runs**                                                                                                                    |
| **Product area**                    | Team Workspace / Lead Acquisition / Extraction Operations                                                                                                     |
| **User surface**                    | **Authenticated Team Workspace**                                                                                                                              |
| **Screen class**                    | Extraction Run Operations / Execution History / Processing Monitor                                                                                            |
| **Classification**                  | **Lead Acquisition Execution Anchor — Extraction Run, Attempt & Processing Operations Family**                                                                |
| **Primary purpose**                 | Monitor canonical extraction runs, their execution attempts, checkpoints, acquired raw evidence, processing progress, failures, retries and outcome summaries |
| **Source foundation**               | Design 081                                                                                                                                                    |
| **Canonical extraction foundation** | Design 009                                                                                                                                                    |
| **Primary execution identity**      | **ExtractionRun / SourceRun**                                                                                                                                 |
| **Execution-attempt entity**        | **RunAttempt**                                                                                                                                                |
| **Progress/resume entity**          | **RunCheckpoint**                                                                                                                                             |
| **Evidence entity**                 | **RawObservation / RawRecord**                                                                                                                                |
| **Pipeline state concept**          | **ProcessingStage**                                                                                                                                           |
| **Failure entity/concept**          | **RunError / FailureRecord**                                                                                                                                  |
| **Retry concept**                   | **RetryOperation / RetryLineage**                                                                                                                             |
| **Candidate destination**           | **ProspectCandidate** — Design 008                                                                                                                            |
| **Review/import destination**       | Design 083                                                                                                                                                    |
| **CRM destination**                 | Design 011 after explicit admission                                                                                                                           |
| **Notification dependency**         | Design 080                                                                                                                                                    |
| **Audit dependency**                | Design 039                                                                                                                                                    |
| **Parent shell**                    | `InternalAppShell` — Design 001                                                                                                                               |
| **Primary query service**           | `ExtractionRunQueryService`                                                                                                                                   |
| **Execution service**               | `ExtractionExecutionService`                                                                                                                                  |
| **Attempt service**                 | `ExtractionAttemptService`                                                                                                                                    |
| **Checkpoint service**              | `ExtractionCheckpointService`                                                                                                                                 |
| **Auth**                            | Required                                                                                                                                                      |
| **Authorization**                   | OrganizationMembership + source/run/raw-evidence/retry permissions                                                                                            |
| **Implementation priority**         | **Critical Execution Integrity / Recovery / Acquisition Evidence**                                                                                            |
| **Reuse level**                     | **Extremely High with Designs 009 and 081**                                                                                                                   |

Design 082 should answer:

> **“Which extraction executions have run, which exact Source/configuration produced each one, what happened during each attempt, how much evidence was actually captured, which processing stages succeeded or failed, where can execution safely resume, and whether a retry or a genuinely new rerun is appropriate?”**

Canonical execution structure:

```text
Source
  │
  └── SourceConfiguration Revision
              │
              ↓
        ExtractionRun R1
              │
      ┌───────┼────────┐
      ↓       ↓        ↓
 Attempt 1  Attempt 2  Attempt 3
      │
      ├── Checkpoints
      ├── Errors
      └── RawObservations
              │
              ↓
      Processing Pipeline
       ├── Normalize
       ├── Resolve/Dedupe
       └── Candidate Projection
              │
              ↓
       ProspectCandidate
              │
              ↓
        Design 083 Review
              │
              ↓
          CRM Import
```

---

# 2. Reuse

## Design 009 remains the canonical extraction engine

Design 009 already established:

> **Extraction execution → RawExtractionRecord → normalized candidate → canonical CRM admission.**

Design 082 does not create another queue/job framework.

It should be the operational surface over that same engine.

Correct:

```text
Design 081
Source configuration
        ↓
Design 009
Canonical extraction engine
        ↓
Design 082
Run/attempt monitoring and execution operations
```

---

## Design 081 remains the Source registry

Design 081 answers:

> What Sources exist and how should they operate?

Design 082 answers:

> What happened when those Sources were executed?

Therefore:

```text
Source
≠
ExtractionRun
```

---

## One canonical Run identity

The codebase should choose one canonical execution entity name, for example:

```text
ExtractionRun
```

with `SourceRun` or `ExtractionJob` treated as terminology/alias where appropriate.

Do not accidentally create:

```text
ExtractionJob
SourceRun
ExtractionRun
ScrapeRun
```

as four parallel records for the same execution.

If a future scheduler has a recurring job definition, that schedule/definition can be separate, but **Design 082's run identity must remain singular and canonical**.

---

## Design 082 ≠ Design 083

### Design 082

Execution and processing operations.

### Design 083

Review of acquired/normalized records and import/admission outcomes.

Permanent:

```text
Run success
≠
Candidate accepted
≠
Lead imported
```

---

## Reuse Design 008 ProspectCandidate

Extraction may produce candidate evidence.

Design 082 can show counts such as:

> 127 candidates resolved

but ProspectCandidate remains owned by the canonical candidate layer.

---

## Reuse Design 080 for operational alerts

A failed Run can generate:

> Extraction run failed.

That notification is not the Run.

Retrying or dismissing the notification does not change run state.

---

## Reuse Design 039 Audit

Material operations such as:

* manual run,
* retry,
* cancel,
* resume

should produce audit evidence.

But worker logs are not AuditEvents.

---

# 3. Entities

## Source ≠ ExtractionRun

A Source is durable acquisition origin.

An ExtractionRun is one intended execution against it.

```text
Source S1
├── Run R1
├── Run R2
├── Run R3
└── Run R4
```

---

## ExtractionRun pins exact Source context

Every Run should preserve at least conceptually:

```text
ExtractionRun
├── sourceId
├── sourceConfigurationRevision
├── adapter/connector revision
├── trigger type
├── requestedBy / scheduler context
├── createdAt
├── execution window
└── canonical run lifecycle
```

The current Source configuration is never used to reconstruct historical execution truth.

---

## Run ≠ current Source configuration

Critical:

```text
Run R1
→ Config v3

Current Source
→ Config v7
```

R1 remains a v3 execution forever.

---

## Run ≠ RunAttempt

The Run represents one intended extraction execution.

`RunAttempt` represents an actual worker/provider execution attempt toward that Run.

Example:

```text
Run R100
├── Attempt A1 — worker crashed
├── Attempt A2 — provider timeout
└── Attempt A3 — completed
```

Do not create three Runs for ordinary retries of the same execution intent.

---

## RunAttempt ≠ Retry

Retry is the operation/policy that causes another attempt.

Correct:

```text
Retry requested
       ↓
RunAttempt A2 created
```

The retry command is not itself the attempt record.

---

## Retry ≠ Rerun

This distinction is critical.

### Retry

Continue/re-attempt the same canonical Run intent.

```text
R100
├── A1 failed
└── A2 retry
```

### Rerun

Create a new canonical Run from an explicitly selected/current configuration and acquisition intent.

```text
R100 completed yesterday

User chooses Run Again today
        ↓
new Run R101
```

Do not call both operations simply `retry`.

---

## Rerun should not overwrite old Run

Permanent.

---

## Retry should not erase previous Attempt

Permanent.

Failed attempt evidence remains available.

---

## RunAttempt should preserve execution context

Conceptually:

```text
RunAttempt
├── runId
├── attemptNumber
├── worker/executor identity
├── startedAt
├── endedAt
├── execution state
├── error summary
├── retry lineage
└── checkpoint references
```

---

## RunAttempt ≠ worker process

A worker can crash/restart.

The canonical attempt remains the business execution record.

Infrastructure process IDs may be logged separately.

---

## RunCheckpoint

A checkpoint represents safe resumable progress.

Examples:

```text
pageCursor = 27
providerCursor = abc...
lastExternalRecordId = ...
batchNumber = 41
```

depending on source type.

Checkpoint is not the Run itself.

---

## Checkpoint ≠ completion

Having a checkpoint merely proves progress was durably recorded.

---

## Checkpoint should be attempt/run scoped

A checkpoint from:

```text
Run R1 / Config v2
```

must not be blindly applied to:

```text
Run R2 / Config v5
```

---

## Checkpoint needs compatibility validation

Before resume, verify:

* same Run,
* expected adapter revision,
* compatible configuration,
* valid provider cursor,
* checkpoint not superseded.

---

## Resume ≠ Retry necessarily

A resumable attempt might continue from last durable checkpoint.

A non-resumable failed execution may require a fresh attempt from the beginning with dedupe protection.

The engine should know which semantics apply.

---

## RawObservation ≠ Run

A Run can capture many observations.

```text
Run R1
├── O1
├── O2
├── O3
└── O10000
```

---

## RawObservation ≠ Attempt

An observation should retain both:

* Run lineage,
* specific Attempt lineage where useful.

This helps explain duplicate capture/retry behavior.

---

## Previously captured raw evidence survives retry

Critical.

Attempt A1 may capture:

```text
O1–O500
```

then fail.

Attempt A2 resumes from checkpoint and captures:

```text
O501–O1000
```

The system must not discard O1–O500 simply because A1 did not finish.

---

## Retry must not duplicate already captured observations silently

Use source-specific identity such as:

```text
sourceId
+
externalRecordId
+
source revision/hash
```

or equivalent dedupe semantics.

---

## Duplicate capture ≠ duplicate canonical evidence necessarily

The acquisition layer can detect that the same external record was observed again.

Depending on change/version semantics it can:

* deduplicate identical observation,
* record a new observation when content changed,
* attach repeated-seen evidence.

Do not blindly create duplicate Candidates.

---

## ProcessingStage

Extraction is not one binary operation.

Conceptually:

```text
ACQUISITION
RAW_PERSISTENCE
NORMALIZATION
CANDIDATE_RESOLUTION
DEDUPE
REVIEW_PREPARATION
```

or equivalent.

Exact stage names belong to Phase 3D.

---

## ProcessingStage ≠ Run lifecycle

A Run can be:

> Acquisition succeeded, normalization failed.

A single status cannot describe that accurately.

---

## Raw acquisition success ≠ normalization success

Permanent.

---

## Normalization success ≠ candidate resolution success

Permanent.

---

## Candidate resolution success ≠ import success

Permanent.

---

## Import ≠ Run

Permanent.

---

## Processing stage state should be independently observable

Example:

```text
Acquisition        SUCCEEDED
Raw persistence    SUCCEEDED
Normalization      SUCCEEDED
Candidate resolve  PARTIAL
Import             NOT STARTED
```

Do not mark entire Run simply:

> Failed.

---

## Error/Failure ≠ Run

A failure is an observed problem during an Attempt or ProcessingStage.

Conceptually:

```text
RunFailure
├── runId
├── attemptId
├── stage
├── category
├── firstSeenAt
├── lastSeenAt
├── retryability
├── safe message
├── internal diagnostics reference
└── resolution state
```

---

## Error ≠ log line

Thousands of stack traces should not become thousands of business failure records.

Normalize/reduce operational failures into meaningful Run errors while retaining detailed technical logs separately.

---

## Error category matters

Useful conceptual categories:

```text
CONFIGURATION
AUTHENTICATION
RATE_LIMIT
NETWORK
PROVIDER
PARSING
VALIDATION
NORMALIZATION
STORAGE
INTERNAL
UNKNOWN
```

This affects retry policy.

---

## Retryable ≠ failed

Failure classification can indicate:

> retryable.

That does not mean a retry already occurred.

---

## Failure resolved by retry ≠ historical failure deleted

Attempt A1 remains failed even if A2 succeeds.

---

## Run aggregate outcome should derive from attempts + stages

Do not patch one free-form `status`.

A resolver should evaluate:

* execution attempts,
* captured evidence,
* terminal stage states,
* cancellation,
* unresolved errors.

---

## Partial success

A first-class state is necessary.

Example:

```text
Expected partitions: 10
Succeeded: 8
Failed: 2
```

Usable evidence exists.

Run is neither full success nor full failure.

---

## Partial success should preserve failed scope

The system should know what was missed so a targeted retry can be possible where supported.

---

## Full success ≠ all observations useful

A technically successful Run may produce:

* duplicates,
* irrelevant records,
* low-quality candidates.

That belongs downstream.

---

## Zero observations ≠ failure

Critical:

```text
Run completed normally
records = 0
```

is valid.

Possible reasons:

* nothing new,
* query legitimately empty,
* source had no matching records.

---

## Unknown count ≠ zero

Permanent.

---

## Expected count ≠ captured count

If provider reports:

> 1000 records available

but only 950 captured:

this discrepancy should remain visible.

---

## Cancellation

Cancellation means:

> stop further processing/execution according to safe cancellation policy.

It does not mean:

* erase RawObservations,
* revert successful checkpoints,
* delete errors,
* remove Candidate evidence already created.

---

## Cancellation requested ≠ cancelled

Asynchronous workers need distinct:

```text
CANCEL_REQUESTED
CANCELLED
```

semantics where necessary.

---

## Cancelled ≠ failed

Permanent.

---

## Cancellation may occur between stages

Example:

```text
Acquisition completed
Normalization partially processed
User cancels
```

Captured raw evidence remains available for later deliberate processing.

---

## Retry after cancellation ≠ automatic

Policy should determine whether cancelled Runs may be:

* resumed,
* retried,
* rerun.

Do not silently restart.

---

## ProspectCandidate ≠ Run output row

One Candidate can be resolved from many observations/runs.

One Run can contribute to many Candidates.

---

## Import ≠ processing completion

Design 083 can later review/import only selected records.

---

# 4. Permissions

Design 082 should separate:

```text
run.read
run.start
run.cancel
run.retry
run.rerun
run.resume
run.rawEvidence.read
run.errors.read
run.internalDiagnostics.read
run.export
```

conceptually.

---

## Read Run ≠ execute Run

An analyst may inspect results without starting external acquisition.

---

## Start Run ≠ modify Source

Source configuration remains Design 081 governance.

---

## Retry Run ≠ edit configuration

If configuration must change before a new execution:

that should normally be a new Run/rerun using a new configuration revision, not mutation of historical Run context.

---

## Cancel permission ≠ delete permission

Cancelling stops execution.

It does not grant destructive history deletion.

---

## Raw evidence access ≠ Run summary access

Raw records may contain sensitive personal/contact data.

A user allowed to see:

> Run completed with 500 records

need not be allowed to inspect every RawObservation.

---

## Error summary ≠ internal diagnostics

Client-facing/internal operator safe error:

> Source authentication failed.

may be visible to more users than:

* stack trace,
* headers,
* provider request body,
* internal storage path.

---

## Secrets must never appear in error payloads

Run diagnostics must redact:

* API keys,
* cookies,
* OAuth tokens,
* authorization headers,
* signed URLs,
* credentials.

---

## Organization isolation

SourceRun, attempts, checkpoints, observations and errors remain scoped to the Source's Organization.

---

## Direct Run ID needs reauthorization

Knowing a Run ID grants nothing.

---

## Direct Attempt/Checkpoint/RawObservation IDs also reauthorize

No cross-tenant enumeration.

---

## Retry must revalidate current source authority

A historical Run may refer to Source S1, but before retry/rerun:

* actor still has permission,
* Source still exists,
* source policy still permits execution.

---

## Retry same Run vs rerun new config

Retrying same Run should preserve its pinned historical configuration context.

If the current configuration differs and policy prohibits old-config execution, then the operator should create a new rerun under the new configuration rather than rewriting the old Run.

---

## Credential access during execution

Worker obtains secrets through controlled backend secret resolution.

The user triggering the Run never receives the secret.

---

## Rate-limit policy cannot be bypassed by manual retry

Manual Run/Retry commands must still honor:

* concurrency,
* provider rate limits,
* backoff,
* circuit breakers.

---

# 5. States

Design 082 requires multiple independent state dimensions.

### Run lifecycle

```text
Queued
Preparing
Running
Cancel Requested
Cancelled
Completed
```

### Run aggregate outcome

```text
Succeeded
Partially Succeeded
Failed
Outcome Unknown
```

### Attempt state

```text
Queued
Starting
Running
Succeeded
Failed
Cancelled
Abandoned / Lost
Outcome Unknown
```

### ProcessingStage state

```text
Not Started
Pending
Running
Succeeded
Partially Succeeded
Failed
Skipped
Cancelled
```

### Checkpoint state

```text
No Checkpoint
Checkpoint Available
Checkpoint Updating
Checkpoint Invalid
Checkpoint Superseded
```

### Failure state

```text
Active
Retryable
Permanent / Non-Retryable
Resolved by Retry
Ignored / Accepted where policy permits
```

These must not become one `status`.

---

## Queued ≠ running

Permanent.

---

## Running ≠ succeeding

Permanent.

---

## Attempt failed ≠ Run failed automatically

Another Attempt may succeed.

---

## Run failed ≠ Source failed permanently

Permanent.

---

## Stage failed ≠ entire Run failed necessarily

A downstream normalization stage failure may leave successful raw acquisition.

---

## Raw acquisition success ≠ Run fully successful

Permanent.

---

## Partial success ≠ failure

Permanent.

---

## Partial success ≠ full success

Permanent.

---

## Zero captured observations ≠ failure

Permanent.

---

## Unknown record count ≠ zero

Permanent.

---

## Cancel requested ≠ cancelled

Permanent.

---

## Cancelled ≠ failed

Permanent.

---

## Retry queued ≠ retry succeeded

Permanent.

---

## Checkpoint available ≠ safe to resume

Compatibility must still be validated.

---

## Outcome unknown ≠ failed

If worker/provider connection disappears after an operation:

reconcile before starting duplicate work.

---

## Lost worker ≠ lost Run

The Run remains canonical.

Execution infrastructure can recover/reassign.

---

## Source disabled during Run ≠ historical Run invalid

Current execution policy decides how active Run behaves.

Its prior evidence remains intact.

---

## Configuration changed after start ≠ Run changed

Permanent.

---

## Credential rotation after start ≠ Run configuration rewrite

Permanent.

---

## Processing failure ≠ raw evidence loss

Permanent.

---

## Retry success ≠ original attempt success

Historical attempt states stay exact.

---

## State Coverage

Design 082 inherits Design 150 plus:

```text
Runs Loading
Runs Available
Runs Empty
Run Restricted

Run Queued
Run Preparing
Run Running
Run Cancel Requested
Run Cancelled

Run Succeeded
Run Partially Succeeded
Run Failed
Run Outcome Unknown

Attempt Queued
Attempt Running
Attempt Failed
Attempt Succeeded
Attempt Lost / Abandoned

Checkpoint Available
Checkpoint Invalid
Checkpoint Superseded

Acquisition Running
Acquisition Succeeded
Acquisition Partially Succeeded
Acquisition Failed

Raw Persistence Succeeded
Raw Persistence Failed

Normalization Pending
Normalization Running
Normalization Succeeded
Normalization Partially Succeeded
Normalization Failed

Candidate Resolution Pending
Candidate Resolution Succeeded
Candidate Resolution Failed

Zero Records Found
Record Count Unknown

Retry Available
Retry Queued
Retry In Progress
Retry Not Allowed

Rerun Available
Resume Available
Resume Not Safe

Source Disabled During Run
Configuration Changed Since Run
Credential Changed Since Run

Provider Rate Limited
Provider Temporarily Unavailable

Partial Extraction Service Failure
```

---

# 6. Responsive Behavior

## Desktop

Desktop should emphasize execution monitoring and forensic clarity.

Conceptually:

```text
Extraction Runs
↓
Run summary/list
    ├── Source
    ├── Config revision/context
    ├── Trigger
    ├── Started / duration
    ├── Run lifecycle
    ├── Aggregate outcome
    ├── records captured
    ├── processing progress
    └── allowed operation
↓
Run detail if present in frozen design
    ├── Attempts
    ├── Processing stages
    ├── Checkpoints
    ├── Errors
    └── evidence counts
```

Only frozen elements should render.

---

## Do not show one ambiguous status

Avoid:

> Failed

when the true state is:

> Acquisition succeeded; candidate resolution failed.

Stage visibility is important.

---

## Attempts should remain subordinate to Run

Desktop hierarchy should make clear:

```text
Run R-100
  Attempt 1
  Attempt 2
```

not render attempts as unrelated Runs.

---

## Retry vs rerun should not be visually interchangeable

If both actions exist in the frozen design:

* Retry = same Run execution intent.
* Run Again/Rerun = create new Run.

The labels and backend behavior must match.

---

## Tablet

Following Design 152:

* run rows may become execution cards,
* lifecycle and outcome remain distinct,
* stage progress compresses without disappearing,
* attempt counts/errors remain legible,
* retry/cancel actions remain source-authorized.

---

## Mobile

Priority:

```text
Run
↓
Source
↓
Run outcome
↓
Processing stage summary
↓
Records captured
↓
Attempts
↓
Error / retry state
↓
Allowed action
```

No oversized operations table.

---

## Mobile failure explanation

Prefer:

> Normalization failed after 742 raw records were safely captured.

over:

> Run failed.

This prevents operators from rerunning expensive acquisition unnecessarily.

---

## Mobile counts

Distinguish clearly:

```text
Raw records: 742
Candidates resolved: 610
Imported Leads: not part of this Run status
```

where such frozen metrics are present.

---

## Accessibility

A run card should communicate something equivalent to:

> Extraction run from Executive Events Directory. Started today at 10:30 AM. Acquisition succeeded with 742 raw records. Normalization failed. Two attempts. Retry normalization available.

where source state supports it.

---

# 7. Backend Requirements

## Canonical execution architecture

```text
Design 082
     ↓
ExtractionRunQueryService
     │
     ├── ExtractionRun
     ├── pinned Source/Config revision
     ├── RunAttempt[]
     ├── RunCheckpoint[]
     ├── ProcessingStage states
     ├── RunError/Failure summaries
     ├── RawObservation counts
     └── Candidate-processing summaries
     ↓
ExtractionRunView
```

---

## Execution engine

```text
ExtractionExecutionService
        ↓
resolve canonical Run
        ↓
resolve pinned Source configuration
        ↓
resolve adapter revision
        ↓
secure credential resolution
        ↓
create RunAttempt
        ↓
execute adapter
        ↓
persist checkpoints
        ↓
persist RawObservations
        ↓
advance processing stages
```

---

## Run creation

Conceptually:

```text
createExtractionRun(
    sourceId,
    triggerContext
)
```

should:

1. authorize actor/trigger;
2. resolve current Source;
3. resolve exact active configuration revision;
4. resolve adapter version;
5. establish execution/idempotency policy;
6. persist canonical Run;
7. enqueue it.

---

## Run identity should be durable

Do not use ephemeral queue job ID as the canonical Run ID.

Queue systems can retry/recreate jobs.

Business Run identity must survive infrastructure retries.

---

## QueueJob ≠ ExtractionRun

Critical.

Conceptually:

```text
ExtractionRun R1
├── QueueJob Q1
├── QueueJob Q2 after worker loss
└── QueueJob Q3
```

The queue is execution infrastructure.

---

## RunAttempt creation

Every meaningful new execution attempt should create:

```text
RunAttempt A(n)
```

before or atomically with external work.

---

## Attempt idempotency

Worker redelivery must not accidentally create a second Attempt if it is merely reprocessing the same execution lease.

Use an execution token/lease/idempotency design.

---

## Worker lease/heartbeat

Long Runs should support:

* lease ownership,
* heartbeat,
* stale-worker detection,
* safe reassignment.

This allows distinguishing:

```text
RUNNING
```

from:

```text
worker disappeared
```

---

## Lost attempt reconciliation

If a worker lease expires:

mark Attempt appropriately:

```text
LOST / ABANDONED / OUTCOME_UNKNOWN
```

then evaluate whether safe retry/resume is possible.

---

## Checkpoint durability

Checkpoint writes should be durable enough that a resumed attempt does not reprocess enormous amounts unnecessarily.

But checkpoint frequency should balance:

* cost,
* throughput,
* duplication risk.

---

## Checkpoint payload should be adapter-owned but schema-versioned

Different Sources need different checkpoint structures.

Use a validated, versioned checkpoint schema associated with adapter type/version.

---

## Checkpoint must not contain raw secrets

Provider cursors/tokens that themselves are sensitive should be encrypted/protected.

---

## Raw observation write should be idempotent

Retries/resumes must not create uncontrolled duplicate evidence.

Use source-specific observation identities/hash semantics.

---

## Raw-first stage durability

Once raw evidence is safely persisted:

downstream processing should be retryable without hitting the provider again where feasible.

---

## Processing pipeline state machine

Conceptually:

```text
ACQUIRE
  ↓
RAW_PERSIST
  ↓
NORMALIZE
  ↓
RESOLVE_CANDIDATES
  ↓
PREPARE_REVIEW
```

Each stage should have:

* startedAt,
* completedAt,
* state,
* processed count,
* failure summary,
* retry eligibility.

---

## Stage retry ≠ whole-run rerun

Critical.

If:

```text
ACQUIRE = SUCCEEDED
NORMALIZE = FAILED
```

the operator/system should retry normalization against stored RawObservations when safe.

Do not refetch Source unnecessarily.

---

## Failure classification service

Conceptually:

```text
classifyExtractionFailure(error, stage, adapter)
```

returns:

* category,
* retryability,
* recommended backoff,
* whether checkpoint resume is safe,
* whether human config/credential intervention is required.

---

## Retry policy

Transient:

* timeout,
* provider 5xx,
* temporary rate limit

may retry.

Permanent/configuration:

* invalid credential,
* malformed required configuration,
* revoked provider account

should not spin indefinitely.

---

## Exponential backoff

Automated retries should use bounded backoff/jitter according to provider policy.

---

## Retry budget

Define limits per:

* Run,
* stage,
* provider/source class.

Prevent infinite retry loops.

---

## Manual retry should not reset automated retry history

Historical attempts remain.

---

## Retry same config

A retry of an existing Run should use the Run's pinned configuration/adapter context unless the system explicitly creates a **new Run**.

This is essential to reproducibility.

---

## Rerun using current config

Conceptually:

```text
rerunExtraction(previousRunId)
        ↓
resolve Source
        ↓
resolve current valid configuration
        ↓
create NEW ExtractionRun
```

with lineage:

```text
R101.rerunOf = R100
```

or equivalent.

---

## Rerun lineage

Preserve:

* retriedFrom,
* rerunOf,
* resumedFromAttempt

as distinct relationships where needed.

Do not flatten all into one `parentRunId`.

---

## Cancellation

Conceptually:

```text
requestRunCancellation(runId)
```

should:

1. authorize;
2. mark cancellation requested;
3. notify active worker;
4. stop future scheduling/stages safely;
5. persist final cancellation state.

---

## Cancellation should be cooperative and idempotent

Repeated cancel requests should not corrupt state.

---

## Cancellation never deletes captured RawObservations

Critical.

---

## Cancellation and external provider jobs

If provider supports cancellation:

attempt it.

If not:

stop local downstream processing and reconcile provider result as needed.

---

## Count semantics

Store separately where available:

```text
plannedUnits
processedUnits
successfulUnits
failedUnits
rawObservationCount
duplicateObservationCount
candidateResolutionCount
```

Do not call everything `records`.

---

## Zero vs unknown

Database/API representation must distinguish:

```text
0
```

from:

```text
null / unavailable
```

---

## Partial-success resolver

A centralized resolver should derive Run outcome based on:

* required partitions/stages,
* captured evidence,
* unresolved failures,
* cancellation.

Frontend should not decide.

---

## Run health vs Source health

Run outcomes can feed Design 081 Source health.

But one failed Run should not directly mutate:

```text
Source.status = FAILED
```

without health policy.

---

## ProspectCandidate handoff

Candidate-resolution pipeline should emit/source canonical ProspectCandidate updates.

Design 082 shows summary counts/state.

Design 083 owns record-level review.

---

## Import boundary

No Run worker should directly create CRM Lead unless explicit admission policy is separately invoked.

Design 083 remains the review/import boundary.

---

## Event/outbox model

Useful events:

```text
ExtractionRunCreated
ExtractionRunStarted
RunAttemptStarted
RunCheckpointSaved
RawObservationsCaptured
ExtractionStageCompleted
ExtractionStageFailed
RunAttemptFailed
ExtractionRunPartiallySucceeded
ExtractionRunCompleted
ExtractionRunCancelled
```

---

## Notifications

Design 080 can consume relevant events such as:

* Run failed,
* credential intervention required,
* Run completed.

Notification failures never change Run status.

---

## Audit

Material operator actions:

* manual run,
* cancel,
* retry,
* rerun,

should be audited.

Worker heartbeat/checkpoint events belong operational telemetry, not necessarily compliance Audit.

---

## Observability

Technical telemetry should include:

* queue delay,
* execution duration,
* stage durations,
* provider latency,
* retry count,
* checkpoint age,
* records/sec,
* failure category.

No secrets/raw sensitive payloads in logs.

---

## Metrics ≠ Run source truth

Observability metrics help operations.

Canonical Run/Attempt/Stage records remain authoritative for business execution history.

---

## Retention

Different retention policies may apply to:

* Runs,
* Attempts,
* RawObservations,
* detailed worker logs.

Deleting old logs must not erase canonical Run evidence or provenance required downstream.

---

## Permission-safe query performance

Design 082 should use:

* indexed run queries,
* aggregated attempt/stage summaries,
* lazy raw-evidence drilldowns,
* cursor pagination.

Do not load all RawObservations for every run list row.

---

## Partial subsystem failure

Example:

```text
Run metadata       ✓
Attempts           ✓
Checkpoints        ✓
Raw count service  ✕
Logs               ✓
```

Return the known Run with:

> Raw record count temporarily unavailable.

Do not call it zero.

---

## Backend Requirement Matrix

| Requirement                                   | Status                             |
| --------------------------------------------- | ---------------------------------- |
| Authenticated Team Workspace                  | **Critical**                       |
| Organization isolation                        | **Critical**                       |
| Canonical ExtractionRun/SourceRun identity    | **Critical**                       |
| No parallel Design 009/082 job model          | **Critical**                       |
| Run pins exact Source                         | **Critical**                       |
| Run pins config revision                      | **Critical**                       |
| Run pins connector/adapter revision           | **Critical**                       |
| Source/Run separation                         | **Critical**                       |
| Run/RunAttempt separation                     | **Critical**                       |
| Queue job/Run separation                      | **Critical**                       |
| One Run → many attempts                       | **Critical**                       |
| Retry/Attempt separation                      | **Critical**                       |
| Retry/Rerun separation                        | **Critical**                       |
| Rerun creates new Run                         | **Critical**                       |
| Historical attempt preservation               | **Critical**                       |
| RunAttempt idempotency                        | **Critical**                       |
| Worker lease/heartbeat                        | **Required for long runs**         |
| Lost-worker reconciliation                    | **Critical**                       |
| RunCheckpoint entity                          | **Critical for resumable sources** |
| Versioned checkpoint schemas                  | **Critical**                       |
| Checkpoint compatibility validation           | **Critical**                       |
| Resume/retry distinction                      | **Critical**                       |
| RawObservation/Run separation                 | **Critical**                       |
| Raw observation attempt/run lineage           | **Critical**                       |
| Raw evidence survives failure/cancel          | **Critical**                       |
| Idempotent raw writes                         | **Critical**                       |
| Raw-first processing recovery                 | **Critical**                       |
| ProcessingStage model                         | **Critical**                       |
| Acquisition/normalization separation          | **Critical**                       |
| Normalization/candidate resolution separation | **Critical**                       |
| Run/Import separation                         | **Critical**                       |
| Stage-level retry                             | **Critical**                       |
| Failure classification                        | **Critical**                       |
| Retryability semantics                        | **Critical**                       |
| Bounded backoff/retry budget                  | **Critical**                       |
| Outcome-unknown reconciliation                | **Critical**                       |
| Partial success first-class                   | **Critical**                       |
| Zero/unknown separation                       | **Critical**                       |
| Cancel-requested/cancelled separation         | **Critical**                       |
| Cancellation idempotency                      | **Critical**                       |
| Cancellation preserves evidence               | **Critical**                       |
| Source disable/history separation             | **Critical**                       |
| Config change/historical Run isolation        | **Critical**                       |
| Credential rotation/historical Run isolation  | **Critical**                       |
| Candidate resolution reuse                    | **Critical**                       |
| No implicit CRM Lead creation                 | **Critical**                       |
| Design 083 review/import boundary             | **Critical**                       |
| Event/outbox integration                      | **Required**                       |
| Design 080 notification reuse                 | **Required**                       |
| Audit of operator actions                     | **Required**                       |
| Operational telemetry                         | **Critical**                       |
| Secret/log redaction                          | **Critical**                       |
| Cursor pagination                             | **Required**                       |
| Permission-safe raw drilldown                 | **Critical**                       |
| Partial subsystem failure handling            | **Critical**                       |

---

# 8. Consolidation

Design 082 exposes major execution-integrity risks.

**Source / Run conflation**
One Source stores only current/last execution state.

**ExtractionJob / SourceRun duplicate identity**
Designs 009 and 082 create parallel job tables.

**Run / queue-job conflation**
Infrastructure retry creates duplicate business Runs.

**Run / Attempt conflation**
Every worker retry looks like a new extraction execution.

**Attempt / Retry conflation**
Retry command and resulting execution record are the same entity.

**Retry / Rerun conflation**
Historical execution is overwritten instead of creating a new intentional Run.

**Rerun / old Run mutation**
New config is applied by rewriting historical Run.

**Current config / pinned run config conflation**
Old Runs become unreconstructable.

**Current connector version / historical connector version conflation**
Parsing behavior cannot be explained later.

**Attempt failure / Run failure conflation**
Successful later retry cannot be represented correctly.

**Failed attempt history deletion**
Recovery hides the original failure evidence.

**Worker process / Attempt conflation**
Worker restart destroys canonical execution identity.

**Worker loss / Run loss conflation**
Orphaned queue job becomes orphaned business history.

**Checkpoint / Run conflation**
Cursor becomes the only persisted execution state.

**Checkpoint / completion conflation**
Saved progress is treated as successful completion.

**Checkpoint from old config reused**
Resume starts from incompatible execution state.

**Resume / Retry conflation**
System restarts full provider fetch unnecessarily.

**Run / RawObservation conflation**
Only counts are retained; evidence disappears.

**Attempt retry / raw evidence deletion**
Captured records from failed attempt are thrown away.

**Retry / duplicate observation conflation**
Same source records create duplicate evidence/candidates.

**Identical observation / new evidence conflation**
Retries multiply unchanged raw records without policy.

**ProcessingStage / Run status conflation**
One `FAILED` hides successful acquisition.

**Raw success / normalization success conflation**
Provider is refetched because normalization worker failed.

**Normalization success / Candidate success conflation**
Identity resolution problems are hidden.

**Candidate resolution / CRM Import conflation**
Extraction automatically creates Leads.

**Error / Run conflation**
Single error row represents entire execution.

**Log line / business Failure conflation**
Thousands of noisy logs pollute operations model.

**Retryable / retried conflation**
Failure classification falsely indicates retry actually happened.

**Failure resolved / failure deleted conflation**
Historical root cause disappears.

**Partial success / full failure conflation**
Valid acquired evidence is discarded.

**Partial success / full success conflation**
Missing source partitions are hidden.

**Zero records / failure conflation**
Legitimate no-change run appears broken.

**Unknown count / zero conflation**
Telemetry outage appears as zero acquisition.

**Expected / captured count conflation**
Incomplete extraction looks complete.

**Cancel requested / cancelled conflation**
Worker still runs after UI claims cancellation.

**Cancellation / failure conflation**
Intentional operator stop appears as system error.

**Cancellation / deletion conflation**
Captured evidence disappears.

**Source disabled / active Run invalidation conflation**
Historical execution is rewritten.

**Config changed mid-run**
One Run uses multiple configs.

**Credential rotated mid-run / historical rewrite**
Execution context becomes unreconstructable.

**Manual retry / provider limits bypass**
Operator defeats backoff/rate rules.

**Infinite retry loops**
Permanent errors continuously consume workers/provider quota.

**Outcome unknown / failed conflation**
Async provider execution is duplicated.

**SourceRun / CRM import batch conflation**
One extraction execution equals one CRM import incorrectly.

**Run success / Lead creation conflation**
Operational success is reported as sales success.

**Candidate count / Lead count conflation**
Acquisition analytics become misleading.

**Run metrics / canonical execution truth conflation**
Monitoring counters substitute for durable state.

**Operational logs / Audit conflation**
Worker noise floods compliance history.

**Audit / technical log conflation**
Sensitive payloads/secrets leak into audit.

**Raw evidence permission / Run permission conflation**
Any operator can inspect personal/contact data.

**Error summary / internal diagnostics conflation**
Stack traces/provider secrets leak.

**Direct checkpoint ID bypass**
Cross-tenant execution data becomes enumerable.

**082/009 duplicate extraction engine**
Two execution semantics diverge.

**082/081 duplicate SourceRun identity**
Source manager and run monitor disagree about last runs.

**082/083 duplicate processing/import state**
Execution screen starts owning review/admission truth.

No additional screen is required.

These are **run identity, execution-attempt lineage, checkpointing, retry/rerun semantics, stage recovery, cancellation, raw-evidence durability, candidate handoff, operational observability, and idempotency requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL EXTRACTION RUN, ATTEMPT, CHECKPOINT & PROCESSING EXECUTION ANCHOR**

**Domain directive:**
**Source ≠ ExtractionRun/SourceRun ≠ RunAttempt ≠ RunCheckpoint ≠ RawObservation ≠ ProcessingStage ≠ Error/Failure ≠ Retry ≠ ProspectCandidate ≠ Import.**

**Canonical-engine directive:**
Designs 009 and 082 must use **one extraction engine and one canonical Run identity**. UI terminology such as Job/Run must not create multiple business execution tables for the same concept.

**Source directive:**
each Run references one canonical Source from Design 081 and pins the exact SourceConfiguration and connector/adapter revision used at creation.

**Historical-context directive:**
later Source configuration, adapter or credential changes never rewrite already-created Runs.

**Run directive:**
ExtractionRun represents one durable execution intent. Infrastructure queue jobs, workers and process IDs remain implementation details rather than canonical acquisition identities.

**Attempt directive:**
each meaningful execution try is a RunAttempt under the same Run. Failed attempts remain historical evidence even when later attempts succeed.

**Retry directive:**
Retry creates another governed Attempt of the same Run intent when safe; it does not rewrite previous attempt state or silently change configuration.

**Rerun directive:**
Run Again/Rerun creates a **new ExtractionRun**, usually under the current valid Source configuration, with explicit lineage back to the prior Run.

**Checkpoint directive:**
resumable Sources use durable, adapter-versioned RunCheckpoints tied to the exact Run/Attempt context. Checkpoints are validated before reuse and never treated as completion evidence.

**Resume directive:**
resume from checkpoint and fresh retry are different execution strategies. The engine chooses deliberately based on checkpoint compatibility and source semantics.

**Evidence directive:**
RawObservations already captured remain immutable durable evidence through Attempt failure, retry, cancellation or downstream processing failure.

**Idempotency directive:**
worker redelivery, checkpoint resume and retry must use source-specific idempotency/dedupe semantics so already captured evidence is not multiplied uncontrollably.

**Stage directive:**
acquisition, raw persistence, normalization, candidate resolution and review preparation remain separate ProcessingStages with independent timing/outcome state.

**Recovery directive:**
a downstream normalization/candidate-resolution failure should be retried from retained RawObservations rather than automatically refetching the external Source.

**Failure directive:**
RunError/Failure records preserve stage, attempt, category and retryability. Technical logs remain separate, and resolved failures are never deleted from historical execution evidence.

**Retry-policy directive:**
transient/provider failures can use bounded exponential backoff/jitter and retry budgets; permanent credential/configuration errors require intervention rather than infinite automated retries.

**Outcome directive:**
Succeeded, Partially Succeeded, Failed, Cancelled and Outcome Unknown remain distinct. Partial success is first-class and preserves both captured evidence and failed acquisition scope.

**Zero directive:**
a successful Run may legitimately capture zero records. Numeric zero, unknown count, and unavailable telemetry remain distinct.

**Cancellation directive:**
cancellation stops future applicable work but never deletes RawObservations, checkpoints, attempts, errors or already-resolved candidate evidence.

**Async-cancellation directive:**
Cancellation Requested and Cancelled remain distinct so the UI never claims execution has stopped while workers/provider jobs are still active.

**Candidate directive:**
ProspectCandidate remains Design 008's canonical candidate identity. Design 082 only reports extraction/candidate-processing outcome summaries.

**Import directive:**
Design 083 remains the explicit review/import boundary. Extraction success never directly becomes CRM Lead creation.

**Authorization directive:**
Run read, execution, retry, rerun, cancellation, raw-evidence access and internal-diagnostic access remain independent permissions and always tenant/source scoped.

**Credential directive:**
workers resolve Source credentials through protected backend secret infrastructure; users triggering Runs never receive raw credentials.

**Operational directive:**
long-running execution supports durable queues, worker leases/heartbeats, stale-worker detection and safe reassignment so infrastructure failures do not destroy canonical Run identity.

**Event directive:**
Run, Attempt, checkpoint and processing-stage changes emit idempotent events/outbox updates suitable for notification, projection and monitoring consumers.

**Notification directive:**
Design 080 may notify operators of failed/completed runs, but notification read/dismissal never alters the canonical Run.

**Audit directive:**
manual Run, retry, rerun and cancellation actions should be audited as operator actions; high-volume checkpoints, heartbeats and technical logs remain operational telemetry instead of compliance noise.

**Observability directive:**
queue delay, durations, throughput, failure categories, retry counts and checkpoint freshness are monitored independently of canonical business execution state and must exclude secrets/raw sensitive payloads.

**Performance directive:**
Design 082 should use indexed run summaries, precomputed stage/attempt aggregates, cursor pagination and lazy permission-aware evidence drilldowns rather than loading every RawObservation with every run.

**Future-reuse directive:**
Design 083 must consume the exact RawObservation, processing outcome, ProspectCandidate and Import lineage generated by this engine; it must not create another extraction-run model.

**Overlap directive:**
Designs **008–009, 081–083** must ultimately share one continuous Source → Run → Attempt → RawObservation → Processing → ProspectCandidate → Review/Import lineage without duplicating execution or candidate identities.

**Consolidation directive:**
**STANDARDIZE ONE EXTRACTION EXECUTION FOUNDATION — CANONICAL EXTRACTIONRUN/SOURCERUN + EXACT SOURCE/CONFIG/ADAPTER SNAPSHOT + MULTIPLE APPEND-ONLY RUNATTEMPTS + VERSIONED DURABLE CHECKPOINTS + IDEMPOTENT RAW-OBSERVATION WRITES + INDEPENDENT PROCESSING-STAGE STATE + CLASSIFIED RETRYABLE FAILURES + CLEAR RETRY/RESUME/RERUN SEMANTICS + EVIDENCE-PRESERVING CANCELLATION — AND NEVER ALLOW QUEUE JOBS, RETRIES, CURRENT CONFIGURATION, STAGE FAILURE, ZERO RESULTS OR CRM IMPORT TO OVERWRITE OR REDEFINE THE HISTORICAL EXECUTION TRUTH OF A RUN.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **82 / 153** |
| **PASS**                                   |                         **82** |
| **STANDARDIZE decisions**                  |                         **80** |
| **Potential implementation-overlap flags** |                         **73** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**82 / 153 = 53.6% audited.**

### Canonical Extraction Execution architecture after Design 082

```text
                     SOURCE
                       │
                       ↓
           SourceConfiguration Revision
                       │
                       ↓
                EXTRACTION RUN
                 canonical intent
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
      Attempt 1     Attempt 2     Attempt 3
       FAILED        FAILED        SUCCEEDED
          │            │            │
          ├── errors    ├── errors   ├── checkpoints
          ├── checkpoint└── checkpoint
          └── raw evidence           │
                       │             │
                       └──────┬──────┘
                              ↓
                    RAW OBSERVATIONS
                     durable evidence
                              │
                              ↓
                     Processing Stages
                      ├── Normalize
                      ├── Dedupe
                      └── Resolve
                              │
                              ↓
                    ProspectCandidates
                              │
                              ↓
                        Design 083
                     Review / Import
```

The retry boundary is now explicit:

```text
RETRY
Same Run
Same pinned execution context
New Attempt

RERUN
New Run
Potentially new/current Source configuration
Historical link to previous Run
```

And cancellation remains evidence-preserving:

```text
Cancellation
     ↓
Stop future applicable execution

BUT KEEP:

Run               ✓
Attempts          ✓
Checkpoints       ✓
Errors            ✓
RawObservations   ✓
Resolved evidence ✓
Provenance        ✓
```

## Next Sequential Audit Target

### **Design 083 — Extraction Review / Imported Records**

The next audit should preserve the review/admission boundary:

> **RawObservation ≠ NormalizedRecord ≠ ProspectCandidate ≠ DuplicateMatch ≠ ReviewDecision ≠ ImportBatch ≠ ImportRecord ≠ Lead/Contact/Company ≠ Provenance.**

It will need to reconcile Designs **008–011 and 081–082** while preserving:

* review works on normalized/source-linked evidence rather than mutating RawObservations,
* duplicate detection ≠ automatic destructive merge,
* ProspectCandidate ≠ Lead/Contact/Company until explicit admission,
* accept/reject/skip decisions remain auditable and idempotent,
* one ImportBatch can contain many per-record outcomes,
* partial import success must not be represented as full success or full failure,
* repeated import must not create duplicate CRM records,
* field/source provenance survives CRM admission,
* rejected or duplicate candidates must not delete source evidence,
* Design 083 is the admission/review layer, not a second extraction or CRM backend.

The sequence continues strictly with **Design 083 only next**, under the unchanged audit contract.
