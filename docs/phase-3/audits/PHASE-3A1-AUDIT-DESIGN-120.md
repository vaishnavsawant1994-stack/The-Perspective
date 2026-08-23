# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 120 — Project Completion / Closeout Workspace

Design 120 should become the **canonical Team Workspace Project closeout-readiness, completion-decision, closure-evidence, unresolved-obligation, and lifecycle-transition surface** for determining when one Project is genuinely complete.

It must compose the canonical Project from Design 023 with Tasks/Milestones from Design 111, staffing/resource context from Design 112, Risks/Blockers from Design 113, Deliverables from Design 114, Approval gates from Design 115, Client Requests from Design 116, Change Requests from Design 117, schedule facts from Design 118, and historical evidence from Design 119.

It must also preserve clear boundaries with the next surfaces: **Design 121 Final Handover**, **Design 122 Retrospective**, and **Design 123 Archive**.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Project ≠ ProjectCloseout ≠ CloseoutRequirement ≠ CloseoutEvaluation ≠ CompletionDecision ≠ ProjectLifecycleTransition ≠ Task/Milestone Completion ≠ Deliverable Readiness ≠ Final Handover ≠ Approval ≠ ClientRequest ≠ Publishing ≠ Financial Settlement ≠ Retrospective ≠ Archive.**

The central implementation rule is:

> **A Project is not complete merely because Tasks are checked, Milestones are achieved, files exist, Approvals are green, the client has received something, publication occurred, or the timeline reached its planned end. Design 120 must perform a fresh server-side closeout evaluation over the Project’s required canonical obligations. Only an authorized completion command may transition the canonical Project lifecycle to Completed, and that transition must preserve exact closeout evidence. Final handover, retrospective, archive, publication, and financial settlement remain separate processes unless an explicit closeout policy requires them as prerequisites.**

---

# 1. Classification

| Audit field                   | Classification                                                                                                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**                 | **120**                                                                                                                                                                                    |
| **Canonical name**            | **Project Completion / Closeout Workspace**                                                                                                                                                |
| **Product area**              | Team Workspace / Projects / Completion & Governance                                                                                                                                        |
| **User surface**              | **Authenticated Team Workspace**                                                                                                                                                           |
| **Screen class**              | Project Detail Variant / Closeout / Completion Governance Workspace                                                                                                                        |
| **Classification**            | **Canonical Project Closeout Readiness, Completion Decision & Lifecycle-Transition Anchor**                                                                                                |
| **Primary purpose**           | Determine whether all mandatory Project obligations are satisfied, explain remaining blockers, authorize final completion, and preserve evidence of what was true when completion occurred |
| **Primary parent**            | **Project** — Design 023                                                                                                                                                                   |
| **Closeout entity**           | `ProjectCloseout` where persistence is required                                                                                                                                            |
| **Requirement model**         | `CloseoutRequirement` / typed requirement definitions                                                                                                                                      |
| **Evaluation model**          | `CloseoutEvaluation`                                                                                                                                                                       |
| **Completion evidence**       | `ProjectCompletionRecord` / lifecycle transition evidence                                                                                                                                  |
| **Task/Milestone dependency** | Design 111                                                                                                                                                                                 |
| **Resource dependency**       | Design 112 where unresolved staffing obligations matter                                                                                                                                    |
| **Risk/Blocker dependency**   | Design 113                                                                                                                                                                                 |
| **Deliverable dependency**    | Design 114                                                                                                                                                                                 |
| **Approval dependency**       | Design 115                                                                                                                                                                                 |
| **Client dependency**         | Design 116                                                                                                                                                                                 |
| **Change-control dependency** | Design 117                                                                                                                                                                                 |
| **Schedule dependency**       | Design 118                                                                                                                                                                                 |
| **Activity dependency**       | Design 119                                                                                                                                                                                 |
| **Final Handover boundary**   | upcoming Design 121                                                                                                                                                                        |
| **Retrospective boundary**    | upcoming Design 122                                                                                                                                                                        |
| **Archive boundary**          | upcoming Design 123                                                                                                                                                                        |
| **Publishing dependency**     | Designs 031 / 124–126 where policy requires                                                                                                                                                |
| **Distribution dependency**   | Designs 032 / 127–130 where policy requires                                                                                                                                                |
| **Finance dependency**        | Designs 020 / 101–103 where policy requires                                                                                                                                                |
| **Primary query service**     | `ProjectCloseoutQueryService`                                                                                                                                                              |
| **Readiness resolver**        | `ProjectCloseoutReadinessResolver`                                                                                                                                                         |
| **Completion service**        | `ProjectCompletionService`                                                                                                                                                                 |
| **Requirement registry**      | `ProjectCloseoutRequirementRegistry`                                                                                                                                                       |
| **Reopen/correction service** | `ProjectCompletionCorrectionService` if supported                                                                                                                                          |
| **Parent shell**              | `InternalAppShell` — Design 001                                                                                                                                                            |
| **Auth**                      | Required                                                                                                                                                                                   |
| **Authorization**             | Active OrganizationMembership + Project closeout/completion permissions                                                                                                                    |
| **Implementation priority**   | **Critical Lifecycle Integrity / Delivery Evidence / Governance**                                                                                                                          |
| **Reuse level**               | **Extremely High across handover, reporting, renewals, archive and analytics**                                                                                                             |

Design 120 should answer:

> **“Is this Project genuinely ready to be completed, which mandatory obligations have passed, which are still blocking or unknown, what exact evidence supports each result, what exceptions or overrides exist, who is authorized to finalize completion, and what immutable evidence will prove what was true when the Project became Completed?”**

Canonical structure:

```text
Project PR-100
      │
      ├── Tasks / Milestones
      ├── Risks / Blockers
      ├── Deliverables
      ├── Approval Gates
      ├── Client Requests
      ├── Change Requests
      ├── Schedule / Timeline
      ├── Publishing / Distribution?
      ├── Finance?
      └── Final Handover?
               │
               ↓
     ProjectCloseoutReadinessResolver
               │
        ┌──────┴──────┐
        ↓             ↓
       PASS       BLOCKED / UNKNOWN
        │
        ↓
Authorized Completion Command
        │
        ↓
ProjectLifecycleTransition
ACTIVE → COMPLETED
        │
        ↓
Completion Evidence
        │
        ↓
Activity / Audit
```

---

# 2. Reuse

## Design 023 remains canonical Project lifecycle authority

Design 120 must transition the exact same:

```text
Project.id
```

established by Design 023.

Do not create:

```text
CompletedProject
ClosedProject
FinishedProject
```

as parallel entities.

Correct:

```text
Project PR-100
status = ACTIVE

↓ governed completion

Project PR-100
status = COMPLETED
```

Same Project identity.

---

## Closeout ≠ Project lifecycle itself

Critical.

`ProjectCloseout` is the governance/evaluation process.

`Project.lifecycle` is the canonical Project state.

Correct:

```text
Closeout readiness = READY

        ≠

Project lifecycle = COMPLETED
```

until an authorized completion command succeeds.

---

## Closeout readiness ≠ completion

This is Design 120's strongest distinction.

A user may see:

> Ready for completion

but the Project remains active until:

```text
completeProject(...)
```

is explicitly executed.

---

## Design 111 remains Task/Milestone authority

Design 120 consumes:

* required Tasks,
* required Milestones,
* completion/achievement state.

It does not create:

```text
closeout.taskCompleted = true
```

as independent truth.

---

## All Tasks complete ≠ Project complete

Absolute.

The Project may still have:

* pending Approval,
* missing Deliverable,
* open ClientRequest,
* unresolved Blocker,
* unapproved Change Request,
* incomplete handover.

---

## All Milestones achieved ≠ Project complete

Same rule.

---

## Design 113 remains Risk/Blocker authority

Closeout may require:

> no unresolved blocking ProjectBlockers.

It must query canonical ProjectBlocker state.

Design 120 never resolves Blockers by completing the Project.

---

## Closed Project ≠ Risks deleted

Historical Risk/Blocker records remain.

---

## Design 114 remains Deliverable authority

Closeout may require:

* all required Deliverables exist;
* exact artifacts assigned;
* readiness satisfied.

Design 120 consumes `ProjectDeliverableReadinessResolver`.

It does not own Deliverable state.

---

## Deliverable ready ≠ handed over

Permanent.

This is important because Design 121 follows immediately.

---

## Design 115 remains Approval authority

Closeout may require:

```text
required Approval Gates = PASS
```

using the exact canonical Approval/Gate engine.

Design 120 cannot create:

```text
closeout.approved = true
```

as a shortcut.

---

## Design 116 remains ClientRequest authority

Closeout may require:

> mandatory ClientRequests fulfilled or formally cancelled/superseded under policy.

No second client-dependency status is allowed.

---

## Design 117 remains Change Request authority

An open approved-but-unapplied Change Request may block closeout.

A rejected/withdrawn/historical change may not.

The exact policy must use canonical ChangeRequest/Application state.

---

## Design 118 remains schedule authority

The planned or forecast end date arriving does not complete the Project.

A Project can be:

```text
past planned end date
```

and still active.

Likewise it can complete earlier if all governed requirements are satisfied.

---

## Design 119 remains Activity/Audit projection

When Project completion happens:

```text
ProjectCompleted
```

is emitted.

Design 119 projects it.

The Activity entry does not itself constitute completion.

---

## Design 121 Final Handover remains separate

Critical.

### Project closeout

Determines whether delivery obligations are ready/satisfied for completion.

### Final handover

Represents the formal package/event of delivering final approved artifacts to the client.

Depending on policy:

```text
Final handover
may be a closeout requirement
```

But:

```text
ProjectCloseout
≠
FinalHandover
```

---

## Design 122 Retrospective remains separate

Retrospective captures:

* lessons learned,
* what worked,
* what failed,
* future improvements.

It should not be required for technical Project completion unless an explicit organization policy says so.

---

## Design 123 Archive remains separate

Completion means:

> delivery lifecycle is complete.

Archive means:

> move Project into retained/historical inactive organization state.

Correct:

```text
ACTIVE
→ COMPLETED
→ later ARCHIVED
```

not:

```text
COMPLETE = DELETE/ARCHIVE
```

---

## Publishing ≠ completion

A magazine Project may require publishing.

Another Project might not.

Publishing is a source-domain requirement selected by Project type/policy.

Do not globally assume:

> every Project must publish before closeout.

---

## Distribution ≠ completion universally

Same rule.

---

## Invoice paid ≠ Project complete universally

Critical.

Finance may be:

* required closeout policy,
* separately managed receivable.

Do not hard-code:

> unpaid invoice blocks every Project.

Policy must define it.

---

# 3. Entities

## ProjectCloseout

Persist only if the closeout process has meaningful lifecycle/history of its own.

Conceptually:

```text
ProjectCloseout
├── id
├── organizationId
├── projectId
├── lifecycle
├── policyVersionId
├── startedAt?
├── startedBy?
├── currentEvaluationId?
├── completedAt?
├── completedBy?
└── revision
```

If the frozen workflow is only a read-only readiness screen + completion command, it may remain a service/read-model rather than a first-class durable entity.

Do not over-persist unnecessarily.

---

## ProjectCloseout ≠ Project

Permanent.

---

## Closeout policy

Strongly recommended as a versioned configuration concept.

Conceptually:

```text
ProjectCloseoutPolicy
    ↓
ProjectCloseoutPolicyVersion
```

It defines which requirements apply to which Project type/context.

Example requirements might include:

* required Tasks completed;
* required Milestones achieved;
* required Deliverables ready;
* required Approval gates pass;
* no unresolved mandatory Blockers;
* required ClientRequests resolved;
* no approved unapplied Changes;
* final handover complete.

Only actual frozen/business requirements should be enabled.

---

## Closeout policy version must be pinned

Critical.

If Project closeout begins under policy v3 and organization later publishes v4:

historical completion should remain explainable.

At final completion, store the exact policy/version used.

---

## Closeout requirement ≠ source entity

Example:

```text
CloseoutRequirement:
“All mandatory approval gates must pass.”

Source:
ProjectApprovalGate instances
```

The requirement is a rule.

The Approval records remain canonical source evidence.

---

## CloseoutRequirement

Conceptually:

```text
CloseoutRequirement
├── requirementType
├── requirementKey
├── policyVersionId
├── blocking semantics
├── source resolver type
└── parameters
```

This may be configuration rather than persisted runtime rows.

---

## CloseoutEvaluation

A derived/fresh evaluation snapshot.

Conceptually:

```text
CloseoutEvaluation
├── projectId
├── policyVersionId
├── result
├── requirementResults[]
├── evaluatedAt
├── sourceRevisions
└── evaluatorVersion
```

---

## Evaluation result

At minimum:

```text
READY
BLOCKED
UNKNOWN
```

Potentially `NEEDS_ATTENTION`.

Do not collapse uncertainty into blocked or ready blindly.

---

## CloseoutEvaluation ≠ Project completion evidence

Critical.

Evaluation says:

> At 10:00, Project appeared ready.

Completion record says:

> At 10:02, the authorized completion command revalidated and completed the Project.

---

## RequirementResult

Conceptually:

```text
CloseoutRequirementResult
├── requirementKey
├── result
├── sourceReferences[]
├── reasonCode
├── evaluatedAt
└── freshness
```

Results conceptually:

```text
PASS
BLOCKED
UNKNOWN
NOT_APPLICABLE
```

---

## NOT_APPLICABLE ≠ PASS

Important.

If a Project does not require publishing:

that requirement is `NOT_APPLICABLE`.

Do not falsely state:

> Publishing passed.

---

## UNKNOWN ≠ BLOCKED

Critical.

### BLOCKED

Known requirement is unsatisfied.

### UNKNOWN

System cannot reliably determine status.

Both may prevent completion, but they mean different things operationally.

---

## ProjectCompletionRecord

A durable completion evidence record is strongly recommended.

Conceptually:

```text
ProjectCompletionRecord
├── id
├── projectId
├── closeoutPolicyVersionId
├── finalEvaluationId / snapshot
├── completedBy
├── completedAt
├── previousProjectLifecycle
├── resultingProjectLifecycle
├── completionReason/context
├── sourceRevision manifest
└── correlationId
```

This proves the completion decision.

---

## CompletionRecord ≠ Project

Permanent.

Project current lifecycle points to the fact it is completed.

CompletionRecord explains the decision/evidence.

---

## Completion evidence should be immutable

Once Project completed:

do not rewrite:

```text
completedBy
completedAt
policyVersion
final evidence
```

in place.

Corrections require explicit correction/reopen semantics.

---

## Project lifecycle transition

The actual transition should be represented through canonical Project lifecycle history:

```text
ACTIVE
→ COMPLETING? if needed
→ COMPLETED
```

Do not assume `COMPLETING` unless domain needs a durable async state.

---

## Completion date ≠ planned end date

Absolute.

---

## Completion date ≠ final handover date

Permanent.

They may match.

They are still different facts.

---

## Completion date ≠ publication date

Permanent.

---

## Completion date ≠ archive date

Absolute.

---

## Closeout blocker

Avoid creating a new generic `CloseoutBlocker` domain when the source is already:

* pending Approval,
* unresolved ClientRequest,
* ProjectBlocker,
* missing Deliverable.

Use `CloseoutRequirementResult` pointing to canonical source.

---

## Closeout override

If exceptional completion with unsatisfied requirements is supported:

it must be an explicit governance entity/evidence.

Conceptually:

```text
CloseoutRequirementOverride
├── projectId
├── requirementKey
├── source references
├── actor
├── reason
├── approvedBy / authority
├── createdAt
└── policy context
```

---

## Override ≠ requirement PASS

Critical.

History should show:

> Requirement was not satisfied; authorized override permitted completion.

Not:

> Requirement passed.

---

## Override ≠ source mutation

An override for:

> outstanding client document

cannot mark ClientRequest fulfilled.

---

## Override version/purpose must be exact

A blanket:

```text
ignoreAllCloseoutChecks = true
```

is unsafe.

Overrides should be scoped to named requirements/evidence.

---

## Project reopening/correction

If frozen product permits reopening a completed Project:

it should create a new lifecycle transition:

```text
COMPLETED
→ ACTIVE / REOPENED
```

and preserve the prior CompletionRecord.

Do not erase:

```text
completedAt = null
```

with no history.

---

## Reopen ≠ delete CompletionRecord

Absolute.

---

## Reopen reason required

Strong governance recommendation.

---

# 4. Permissions

Design 120 should conceptually distinguish:

```text
projectCloseout.read
projectCloseout.start
projectCloseout.evaluate

projectCompletion.complete
projectCompletion.reopen

projectCloseout.overrideRequirement
projectCloseout.readSensitiveEvidence
```

Exact permission names belong to Phase 3D.

---

## Project read ≠ Project completion authority

Absolute.

---

## Task manager ≠ Project completer

Permanent.

---

## Project owner ≠ completion authority universally

Depends on organization policy.

Do not infer from Project owner alone.

---

## Closeout evaluator ≠ completer

Potentially separate.

---

## Completer ≠ Approval authority

Permanent.

All required Approvals must already exist through canonical Approval engine.

---

## Completer cannot manufacture ClientRequest fulfillment

Absolute.

---

## Completer cannot mark Deliverable approved

Absolute.

---

## Completer cannot close ProjectBlocker invisibly

Absolute.

---

## Override permission must be stronger than ordinary complete permission

If overrides exist.

---

## Requirement override must preserve reason/evidence

No anonymous bypass.

---

## Financial evidence access may require separate permission

Closeout may need to know:

> financial requirement satisfied

without exposing detailed invoice/payment data.

Use safe projections.

---

## Contract/legal evidence may be restricted

Same pattern.

---

## Direct Project ID reauthorizes

Permanent.

---

## Direct CloseoutEvaluation ID reauthorizes

Permanent.

---

## Completion command reauthorizes all relevant policy/source context

Do not trust an evaluation ID from the browser as proof of readiness.

---

## Cross-tenant completion prohibited

Absolute.

---

## Client Portal cannot complete internal Project

Unless the product explicitly defines a separate client acceptance action.

Client acceptance ≠ internal Project lifecycle completion.

---

# 5. States

Design 120 must keep **Project lifecycle, closeout lifecycle, readiness evaluation, individual requirement results, override state, final handover state, and archive state** independent.

### Project lifecycle

Canonical Design 023 lifecycle may include conceptually:

```text
Active
Completed
Archived
Cancelled
```

Exact enum Phase 3D.

### Closeout lifecycle

If persisted:

```text
Not Started
In Progress
Ready
Blocked
Completed
Cancelled
```

### Evaluation

```text
Not Evaluated
Ready
Blocked
Unknown
Stale
```

### Requirement

```text
Pass
Blocked
Unknown
Not Applicable
Overridden
```

### Completion operation

```text
Not Started
Completing
Completed
Failed
Outcome Unknown
```

if asynchronous/multi-domain behavior exists.

These must never collapse into one generic `project.status`.

---

## Closeout In Progress ≠ Project completed

Permanent.

---

## Readiness Ready ≠ Completed

Absolute.

---

## Requirement Overridden ≠ Passed

Critical.

---

## Completion Failed ≠ Project active with no side effects automatically

If completion is a simple Project transaction, failure can be straightforward.

If closeout triggers downstream durable operations, unknown/partial outcome must be reconciled.

---

## Project Completed ≠ Archived

Absolute.

---

## Project Completed ≠ Final Handover completed universally

Policy determines whether handover is prerequisite.

But identities remain separate.

---

## Project Completed ≠ Retrospective completed

Permanent.

---

## Project Completed ≠ finance settled universally

Permanent.

---

## Project Completed ≠ published universally

Permanent.

---

## Project Completed ≠ renewed

Absolute.

Renewal is Design 057/new commercial lifecycle.

---

## Reopened ≠ prior completion deleted

Absolute.

---

## Completion evaluation stale ≠ blocked

Permanent.

Stale means:

> must re-evaluate.

---

## Source service unavailable ≠ requirement passed

Absolute.

---

## Source service unavailable ≠ requirement failed

Critical.

Return UNKNOWN.

---

## State Coverage

Design 120 inherits Design 150 plus:

```text
Project Closeout Loading
Project Closeout Available
Project Closeout Restricted
Project Closeout Partial
Project Closeout Unavailable

Closeout Not Started
Closeout In Progress
Closeout Ready
Closeout Blocked
Closeout Completed

Closeout Evaluation Not Run
Closeout Evaluation Ready
Closeout Evaluation Blocked
Closeout Evaluation Unknown
Closeout Evaluation Stale

Requirement Pass
Requirement Blocked
Requirement Unknown
Requirement Not Applicable
Requirement Overridden

Tasks Requirement Pass
Tasks Requirement Blocked
Tasks Requirement Unknown

Milestones Requirement Pass
Milestones Requirement Blocked
Milestones Requirement Unknown

Deliverables Requirement Pass
Deliverables Requirement Blocked
Deliverables Requirement Unknown

Approval Requirement Pass
Approval Requirement Blocked
Approval Requirement Unknown

Client Dependency Requirement Pass
Client Dependency Requirement Blocked
Client Dependency Requirement Unknown

Risk / Blocker Requirement Pass
Risk / Blocker Requirement Blocked
Risk / Blocker Requirement Unknown

Change Request Requirement Pass
Change Request Requirement Blocked
Change Request Requirement Unknown

Final Handover Requirement Pass
Final Handover Requirement Pending
Final Handover Requirement Not Applicable
Final Handover Requirement Unknown

Publishing Requirement Pass
Publishing Requirement Pending
Publishing Requirement Not Applicable
Publishing Requirement Unknown

Financial Requirement Pass
Financial Requirement Pending
Financial Requirement Not Applicable
Financial Requirement Unknown

Project Completing
Project Completed
Completion Failed
Completion Outcome Unknown

Project Completion Updated Elsewhere
Source Requirement Updated Elsewhere
Closeout Policy Updated Elsewhere
Closeout Evaluation Stale
Completion Conflict

Project Reopened
Historical Completion Preserved
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize **completion readiness and reasons**, not a giant generic checklist.

Conceptually:

```text
Project Completion / Closeout
↓
Overall readiness
↓
Requirement groups
   ├── Work
   ├── Deliverables
   ├── Approvals
   ├── Client dependencies
   ├── Risks / blockers
   ├── Change requests
   ├── Handover?
   ├── Publishing?
   └── Finance?
↓
Blocking / unknown items
↓
Completion evidence / authorized action
```

Only requirements actually present in the frozen design/business policy should render.

---

## PASS, BLOCKED, UNKNOWN must remain visually distinct

Correct:

> Deliverables — PASS
> Approvals — BLOCKED
> Finance — UNKNOWN

Not:

> 2 of 3 complete

when one source is unavailable.

---

## Not Applicable should be explicit

Example:

> Publishing — Not required for this Project

is safer than:

> Publishing — Complete.

---

## Completion action should be deliberate

The CTA should communicate:

> Complete Project

not:

> Done

and should only become actionable under current policy/permissions.

---

## Stale evaluation warning

If any relevant source changed after evaluation:

> Project state changed since the last closeout check. Re-evaluation is required.

Do not rely on an old all-green screen.

---

## Overrides must be clearly visible

If a requirement was overridden:

> Client final metadata — Overridden by authorized user, reason recorded

not a green normal PASS indicator.

---

## Tablet

Following Design 152:

* overall readiness remains top-level,
* requirement groups become stacked cards,
* blocking evidence becomes expandable,
* completion CTA remains isolated,
* source links remain touch-safe.

---

## Mobile

Priority:

```text
Project
↓
Ready / Blocked / Unknown
↓
Blocking requirements
↓
Unknown requirements
↓
Passed requirements
↓
Overrides
↓
Completion action
```

Do not force a dense audit/checklist table.

---

## Mobile requirement item

Example:

> Final Deliverables
> Blocked
> 1 required proof still lacks client approval

is preferable to an ambiguous checkbox.

---

## Accessibility

A closeout summary could communicate:

> Project PR-100 is not ready for completion. Tasks and milestones are complete. Required deliverables are ready. One client approval is still pending, and one Project Blocker remains unresolved. Financial settlement is not a closeout requirement for this Project.

where canonical authorized data supports it.

---

# 7. Backend Requirements

## Canonical closeout architecture

```text
Design 120
    ↓
Authenticated Workspace Context
    ↓
ProjectCloseoutQueryService
    │
    ├── ProjectAdapter
    ├── Task/MilestoneAdapter
    ├── Risk/BlockerAdapter
    ├── DeliverableAdapter
    ├── ApprovalGateAdapter
    ├── ClientRequestAdapter
    ├── ChangeRequestAdapter
    ├── TimelineAdapter
    ├── HandoverAdapter
    ├── PublishingAdapter
    ├── FinanceAdapter
    └── CloseoutPolicyAdapter
    ↓
ProjectCloseoutReadinessResolver
    ↓
ProjectCloseoutView
```

Completion mutation remains a dedicated Project lifecycle command.

---

## Closeout Requirement Registry

Use typed resolvers.

Conceptually:

```text
ProjectCloseoutRequirementRegistry
├── RequiredTaskCompletionResolver
├── RequiredMilestoneResolver
├── RequiredDeliverableResolver
├── RequiredApprovalGateResolver
├── RequiredClientRequestResolver
├── RequiredBlockerResolver
├── RequiredChangeRequestResolver
├── FinalHandoverResolver
├── PublishingRequirementResolver
└── FinanceRequirementResolver
```

Only applicable requirements are invoked for that Project policy.

---

## No giant closeout boolean table

Avoid:

```text
Project {
  tasksDone: true,
  approvalsDone: true,
  filesDone: true,
  clientDone: true,
  financeDone: true,
  canClose: true
}
```

as independent mutable source truth.

These are derived requirement results.

---

## Closeout policy resolver

Conceptually:

```text
ProjectCloseoutPolicyResolver.resolve(projectId)
```

determines:

* Project type,
* contract/package context,
* organization policy,
* applicable closeout policy version.

---

## Policy should be versioned

Historical completion must remain reproducible.

Store:

```text
closeoutPolicyVersionId
```

with the CompletionRecord.

---

## Current policy ≠ historical completion policy

Critical.

A Project completed under v3 remains valid history if v4 later adds new requirements.

---

## Evaluation command

Conceptually:

```text
evaluateProjectCloseout(
    projectId,
    policyVersionId/current resolved policy
)
```

should:

1. authenticate/authorize;
2. load canonical Project;
3. resolve applicable policy;
4. evaluate each required resolver;
5. record source revisions/freshness;
6. produce PASS/BLOCKED/UNKNOWN/NOT_APPLICABLE;
7. calculate overall READY/BLOCKED/UNKNOWN.

---

## Overall READY rule

Conceptually:

```text
READY
=
all blocking requirements
are PASS or authorized OVERRIDDEN
AND
no blocking requirement is UNKNOWN
```

Exact policy semantics belong to Phase 3D.

---

## UNKNOWN fails safe

Critical.

If Approval service is unavailable:

closeout cannot assume Approval passed.

---

## Evaluation snapshot

A saved evaluation can be useful for UI/history.

But it must never become final authority for completion later.

---

## Fresh revalidation before completion

Absolute.

`completeProject(...)` must rerun or transactionally validate every required current closeout condition.

Do not accept:

```text
evaluationId = READY
```

from an earlier browser load as authority.

---

## Completion command

Conceptually:

```text
completeProject(
    projectId,
    expectedProjectRevision,
    closeoutPolicyVersionId,
    idempotencyKey
)
```

should:

1. authenticate/authorize;
2. load Project;
3. verify Project is eligible lifecycle;
4. resolve/pin exact closeout policy;
5. fresh-evaluate mandatory requirements;
6. validate overrides;
7. reject on BLOCKED/UNKNOWN;
8. atomically transition Project lifecycle;
9. create immutable ProjectCompletionRecord;
10. emit ProjectCompleted;
11. generate Audit/outbox;
12. invalidate Project/dashboard/reporting projections.

---

## Completion idempotency

Critical.

Repeated network request must return the same CompletionRecord.

It cannot create:

* duplicate completion events;
* multiple completion dates;
* duplicate closeout records.

---

## Database uniqueness

Prefer something equivalent to:

```text
one active completion state/current completion lineage per Project
```

while still allowing explicit reopen/re-complete history where product supports it.

---

## Project revision concurrency

Example:

```text
10:00 closeout screen = READY
10:01 new ClientRequest created
10:02 user clicks Complete
```

Completion must re-evaluate and detect current state.

It cannot complete based on the 10:00 screen.

---

## Requirement source revision manifest

CompletionRecord should preserve enough evidence to explain:

```text
Tasks aggregate revision
Deliverables revision
Approval gate revision
ClientRequest revision
Blocker revision
ChangeRequest revision
Handover revision
```

or exact subject references where appropriate.

---

## Evidence snapshot ≠ duplicated source records

Do not copy entire Tasks/Deliverables into CompletionRecord.

Store:

* exact source references,
* results,
* revisions,
* policy.

---

## Task requirement

Use canonical Task/ProjectWork resolver.

Possible policy:

> all required non-cancelled Tasks complete.

Do not count optional Tasks accidentally.

---

## Required/optional distinction

Critical.

An optional Task remaining open should not necessarily block closeout.

Closeout policy must know:

```text
required
optional
not applicable
```

---

## Milestone requirement

Use canonical Milestone state.

Cancelled/skipped Milestones require explicit policy semantics.

Do not automatically count cancelled as achieved.

---

## Deliverable requirement

Use:

```text
ProjectDeliverableReadinessResolver
```

from Design 114.

Where final handover is separately required, readiness alone may not be enough.

---

## Approval requirement

Use:

```text
ProjectApprovalGateEvaluationService
```

from Design 115.

Do not count ApprovalRequest rows manually.

---

## Client Request requirement

Use Design 116's canonical requirement/lifecycle evaluation.

Do not infer:

> no overdue Requests = all Client obligations complete.

A not-yet-due mandatory Request can still remain open.

---

## Risk/Blocker requirement

Closeout should generally evaluate ProjectBlockers rather than assuming every Risk must be closed.

Policy may permit:

* accepted residual Risks,
* historical/closed Risks.

Do not block completion simply because Risk records exist.

---

## Change Request requirement

Important.

Potential blockers:

```text
Approved but not applied change
Pending mandatory change
Partially applied change requiring reconciliation
```

Historical rejected/withdrawn Requests should not block.

---

## Timeline requirement

Do not simply require:

> current date >= planned end date.

Schedule timing is context, not completion evidence.

If baseline-related obligations exist, evaluate the actual source requirements.

---

## Final Handover integration

Design 121 may create:

```text
FinalHandover
```

with exact Deliverable versions.

If Project policy requires it:

```text
CloseoutRequirement
= FinalHandover COMPLETE
```

If not required:

`NOT_APPLICABLE`.

---

## Publishing integration

For publication projects, closeout policy may require:

```text
Publication verified/live
```

using Design 031/124 source truth.

Do not use:

> publication scheduled

as equivalent to published.

---

## Distribution integration

Where contractual delivery requires distribution/reporting:

use exact Distribution source state.

Do not universally require it for all Project types.

---

## Finance integration

Potential requirement:

```text
Invoice issued
Payment collected
No outstanding balance
```

must be policy-specific.

Use canonical Billing/Payment/Reconciliation domains.

Do not create a closeout finance boolean.

---

## Outstanding balance ≠ unpaid invoice count

Use canonical balance resolver.

---

## Finance unavailable

Returns UNKNOWN.

Do not assume:

> zero balance.

---

## Client acceptance ≠ Project completion

If Client final acceptance exists:

use canonical Approval/ClientRequest/Handover evidence.

The final internal completion command remains separate.

---

## Completion side effects

Project completion should generally avoid broad destructive actions.

Safe side effects may include:

* lifecycle transition;
* CompletionRecord;
* events;
* notification;
* projection updates.

It should not automatically:

* archive files;
* delete Tasks;
* disable Client Portal;
* cancel outstanding invoices;
* archive Project;
* remove Project Team.

Those belong to separate policies/processes.

---

## Project Team after completion

Historical team membership remains.

Future allocation handling may be policy-specific.

Do not delete staffing history.

---

## Open optional Tasks

If permitted after completion:

their semantics must be explicit.

Potentially:

* cancel;
* transfer to another Project;
* remain historical/open under exceptional policy.

Do not leave impossible active work invisibly.

Exact rule Phase 3D.

---

## Completion and notifications

Design 080 can notify:

> Project completed.

Notification delivery success must not be required for Project completion transaction.

---

## Activity

Design 119 receives:

```text
ProjectCloseoutStarted
CloseoutRequirementOverridden
ProjectCompleted
ProjectReopened
```

as applicable.

Activity is not completion authority.

---

## Audit

Completion should produce strong Audit evidence:

```text
actor
projectId
previous lifecycle
new lifecycle
closeout policy version
final requirement results
overrides
correlation ID
timestamp
```

without copying sensitive data unnecessarily.

---

## Completion export/certificate

Do not invent unless frozen design contains it.

If later required, generate from immutable CompletionRecord rather than current Project state.

---

## Reopen Project

If supported:

```text
reopenProject(
    projectId,
    completionRecordId,
    reason,
    expectedRevision,
    idempotencyKey
)
```

should:

1. require elevated permission;
2. preserve existing CompletionRecord;
3. create lifecycle transition;
4. record reason;
5. emit Audit/outbox;
6. invalidate completion-based projections.

---

## Reopen does not undo handover/publication/payment automatically

Absolute.

Those external facts remain historical.

A reopened Project may require new work.

---

## Re-completion

If Project later completes again:

create a **new CompletionRecord**.

Do not overwrite the old one.

---

## Renewal integration

Design 057 Renewal remains separate.

Completion may trigger a RenewalOpportunity evaluation/event.

It does not create a new Deal automatically unless explicit workflow acts.

---

## Archive integration

Design 123 can later archive:

```text
COMPLETED Project
```

according to retention/access policy.

Archive is a separate command.

---

## Retrospective integration

Design 122 may become available after completion.

It remains an independent content/process record.

---

## Project reports

Reporting can preserve:

* completion date;
* duration;
* final schedule variance;
* final Deliverables;
* closeout exceptions.

Use CompletionRecord/source data rather than Activity prose.

---

## Optimistic concurrency

Critical for:

* closeout evaluation;
* overrides;
* completion;
* reopen.

---

## Override race

If requirement becomes satisfied naturally while an override is being submitted:

preserve both facts appropriately and avoid misleading final evidence.

---

## Completion outcome unknown

If the response is lost after commit:

idempotency must reconcile by:

```text
projectId + idempotencyKey
```

before retry.

Never create a second completion.

---

## Partial completion

Prefer completion to be a compact atomic Project-domain transaction after all external prerequisites are satisfied.

Do **not** design completion as a huge cross-domain mutation saga if avoidable.

This is an important architecture simplification.

Closeout **reads** cross-domain evidence.

Completion ideally only:

```text
Project lifecycle transition
+
CompletionRecord
+
outbox
```

atomically.

---

## Why this matters

If completion itself tries to:

* close Tasks;
* close Risks;
* release Deliverables;
* mark Approvals;
* settle Finance;

partial failure becomes dangerous.

Those obligations should be satisfied **before** completion.

---

## Caching

Closeout view caches should vary by:

```text
organizationMembershipId
projectId
authorizationRevision
projectRevision
closeoutPolicyVersion
task/milestone revision
deliverable revision
approval revision
clientRequest revision
blocker revision
changeRequest revision
handover/publishing/finance revisions
```

---

## Cached READY is never completion authority

Absolute.

---

## Performance

Use:

* aggregate source-domain readiness queries;
* typed requirement resolvers;
* current revision summaries;
* lazy evidence expansion;
* parallel safe resolver execution where appropriate.

Avoid loading:

* all Task histories,
* all Approval decisions,
* all FileVersions,

just to determine closeout readiness.

---

## Partial failure contract

Example:

```text
Project core          ✓
Tasks/Milestones      ✓
Deliverables          ✓
Approvals             ✓
ClientRequests        ✓
Blockers              ✓
Final Handover        ✓
Finance service       ✕
```

If Finance is required:

> Closeout readiness unknown because required financial status cannot currently be verified.

Not:

> Ready.

If Finance is not applicable:

> Financial settlement is not a closeout requirement for this Project.

Another:

```text
Deliverables       ✓
Approval service   ✕
```

Correct:

> Approval requirement unknown.

Not:

> Approval pending.

---

## Backend Requirement Matrix

| Requirement                                             | Status                                         |
| ------------------------------------------------------- | ---------------------------------------------- |
| Canonical Project reuse from 023                        | **Critical**                                   |
| Closeout/Project lifecycle separation                   | **Critical**                                   |
| Readiness/completion separation                         | **Critical**                                   |
| CloseoutRequirement/source entity separation            | **Critical**                                   |
| CloseoutEvaluation/CompletionRecord separation          | **Critical**                                   |
| Closeout policy/versioning                              | **Critical**                                   |
| Historical policy pinning                               | **Critical**                                   |
| PASS/BLOCKED/UNKNOWN/NOT_APPLICABLE separation          | **Critical**                                   |
| Override/PASS separation                                | **Critical if override exists**                |
| Fresh server evaluation before completion               | **Critical**                                   |
| Cached READY not authority                              | **Critical**                                   |
| CompletionRecord immutable evidence                     | **Critical**                                   |
| Completion date/planned end separation                  | **Critical**                                   |
| Completion/final handover separation                    | **Critical**                                   |
| Completion/archive separation                           | **Critical**                                   |
| Completion/retrospective separation                     | **Critical**                                   |
| Completion/publishing separation                        | **Critical**                                   |
| Completion/finance settlement separation                | **Critical**                                   |
| Completion/renewal separation                           | **Critical**                                   |
| Task requirement reuse from 111                         | **Critical**                                   |
| Milestone requirement reuse from 111                    | **Critical**                                   |
| Risk/Blocker reuse from 113                             | **Critical**                                   |
| Deliverable readiness reuse from 114                    | **Critical**                                   |
| Approval gate reuse from 115                            | **Critical**                                   |
| ClientRequest reuse from 116                            | **Critical**                                   |
| ChangeRequest/application reuse from 117                | **Critical**                                   |
| Schedule timeline/current end separation                | **Critical**                                   |
| Final handover reuse from 121                           | **Critical architecture**                      |
| Retrospective separation from 122                       | **Critical architecture**                      |
| Archive separation from 123                             | **Critical architecture**                      |
| Publishing source reuse                                 | **Critical when applicable**                   |
| Distribution source reuse                               | **Critical when applicable**                   |
| Finance source reuse                                    | **Critical when applicable**                   |
| Required/optional requirement distinction               | **Critical**                                   |
| NOT_APPLICABLE semantics                                | **Critical**                                   |
| Source unavailable/failed separation                    | **Critical**                                   |
| Completion idempotency                                  | **Critical**                                   |
| Completion optimistic concurrency                       | **Critical**                                   |
| Unknown completion outcome reconciliation               | **Critical**                                   |
| Completion kept as compact atomic Project transaction   | **Strongly Preferred / Critical architecture** |
| Completion avoids cross-domain destructive side effects | **Critical**                                   |
| Reopen preserves CompletionRecord                       | **Critical if supported**                      |
| Re-completion creates new evidence                      | **Critical if supported**                      |
| Cross-tenant completion prohibited                      | **Critical**                                   |
| Sensitive evidence permission-safe                      | **Critical**                                   |
| Activity/Audit integration                              | **Required**                                   |
| Partial dependency failure handling                     | **Critical**                                   |

---

# 8. Consolidation

Design 120 carries one of the highest risks of semantic over-simplification because “Complete Project” can easily become a destructive catch-all operation.

**Project / ProjectCloseout conflation**
Readiness workflow becomes Project identity.

**Closeout / Project lifecycle conflation**
Opening closeout changes Project status.

**Ready / Completed conflation**
Green checklist immediately completes Project.

**Evaluation / CompletionRecord conflation**
Temporary readiness snapshot becomes immutable completion evidence.

**Cached readiness / current readiness conflation**
Stale browser state completes changed Project.

**PASS / UNKNOWN conflation**
Service outage fails open.

**UNKNOWN / BLOCKED conflation**
Infrastructure issue appears as business failure.

**NOT_APPLICABLE / PASS conflation**
Non-required workflows appear completed.

**Override / PASS conflation**
Exception is hidden as normal success.

**Closeout checklist / source truth conflation**
Duplicate booleans drift from Tasks/Approvals/Deliverables.

**All Tasks complete / Project complete conflation**
Approvals/client/handover obligations disappear.

**All Milestones achieved / Project complete conflation**
Other governance requirements disappear.

**Task cancelled / Task completed conflation**
Cancelled work falsely counts as delivered.

**Optional Task / mandatory Task conflation**
Minor leftover work blocks Project unnecessarily.

**Deliverable ready / handed over conflation**
Design 121 is bypassed.

**Deliverable exists / Deliverable ready conflation**
File presence replaces approval/readiness.

**Approval green / Project complete conflation**
Formal approval is only one requirement.

**ClientRequest fulfilled / Project complete conflation**
External action alone closes delivery.

**No overdue ClientRequests / all ClientRequests resolved conflation**
Future mandatory request gets ignored.

**No active Blockers / Project complete conflation**
Other work remains.

**Open Risk / completion blocked universally conflation**
Accepted residual Risks prevent closure unnecessarily.

**Risk closed / Project closeout pass conflation**
Risk lifecycle substitutes readiness.

**Change Request approved / applied conflation**
Approved but unapplied scope is ignored.

**Rejected Change / unresolved Change conflation**
Historical rejected requests block closure.

**Timeline reached end date / completion conflation**
Schedule date becomes lifecycle truth.

**Forecast finish / actual completion conflation**
Prediction closes Project.

**Final Handover / Project completion conflation**
Formal client delivery and internal lifecycle become one record.

**Project completion / Archive conflation**
Completed Project disappears from active records immediately.

**Project completion / Retrospective conflation**
Lessons-learned process becomes lifecycle requirement automatically.

**Project completion / Publication conflation**
Every project must publish.

**Project completion / Distribution conflation**
Every project must distribute.

**Project completion / Invoice payment conflation**
Operational delivery waits on finance universally.

**Invoice paid / Project completed conflation**
Finance closes delivery.

**Outstanding Invoice count / outstanding balance conflation**
Partial payments/reconciliation are ignored.

**Client approval / final handover conflation**
Acceptance and delivery package merge.

**Project owner / completion authority conflation**
Operational owner bypasses governance.

**Completer / approver conflation**
One user manufactures missing Approval.

**Completer / source-domain editor conflation**
Completion button closes Tasks/Requests/Blockers invisibly.

**Closeout override / source mutation conflation**
Exception edits ClientRequest/Approval truth.

**Global override / scoped requirement override conflation**
One button bypasses every governance rule.

**Completion / delete Tasks conflation**
Historical work evidence disappears.

**Completion / remove Team members conflation**
Staffing history is destroyed.

**Completion / disable Client Portal conflation**
Access lifecycle changes as unintended side effect.

**Completion / cancel invoices conflation**
Billing evidence is corrupted.

**Completion / archive files conflation**
Source/deliverable access disappears.

**Completion / publication action conflation**
Going live happens accidentally.

**Completion / renewal creation conflation**
New commercial cycle starts automatically.

**Reopen / erase completion conflation**
Prior completion evidence disappears.

**Reopen / reverse external facts conflation**
Publication, handover, payments are incorrectly undone.

**Re-complete / overwrite old CompletionRecord conflation**
Historical lifecycle cycles disappear.

**Current closeout policy / historical policy conflation**
Old completed Project appears non-compliant after policy update.

**Closeout policy / Project template conflation**
Template changes alter completed Project evidence.

**Current Package / closeout requirements conflation**
Catalog changes rewrite Project completion rules.

**Activity entry / CompletionRecord conflation**
“Project completed” text becomes lifecycle proof.

**Audit event / CompletionRecord conflation**
Compliance record replaces Project state transition.

**Notification / completion conflation**
Sending client notification becomes success criterion.

**Generic `project.completed = true`**
No readiness, actor, policy, source evidence, or history.

**Generic closeout checklist JSON**
Canonical source-domain status duplicated manually.

**Generic Project closeout mega-PATCH**
Tasks, Deliverables, Approvals, Finance and Project lifecycle mutate in one unsafe payload.

**120/111 duplicate Task/Milestone completion**
Closeout owns work-state booleans.

**120/113 duplicate Risk/Blocker state**
Closeout resolves issues directly.

**120/114 duplicate Deliverable readiness**
Closeout marks files delivered.

**120/115 duplicate Approval state**
Closeout has its own approval checkbox.

**120/116 duplicate ClientRequest state**
Closeout marks client obligations fulfilled.

**120/117 duplicate Change application state**
Closeout applies scope implicitly.

**120/118 duplicate schedule state**
Planned end date is treated as completion.

**120/119 duplicate completion history**
Activity feed replaces immutable lifecycle evidence.

**120/121 duplicate handover state**
Closeout and final delivery collapse.

**120/122 duplicate retrospective state**
Completion waits on or owns lessons learned incorrectly.

**120/123 duplicate Archive state**
Completion automatically archives.

No additional screen is required.

These are **closeout-policy, readiness, exact source evidence, requirement applicability, lifecycle transition, completion evidence, override, concurrency, handover/archive boundaries, and source-of-truth requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PROJECT CLOSEOUT READINESS, COMPLETION DECISION & LIFECYCLE-TRANSITION ANCHOR**

**Domain directive:**
**Project ≠ ProjectCloseout ≠ CloseoutRequirement ≠ CloseoutEvaluation ≠ CompletionDecision ≠ ProjectLifecycleTransition ≠ Task/Milestone Completion ≠ Deliverable Readiness ≠ Final Handover ≠ Approval ≠ ClientRequest ≠ Publishing ≠ Financial Settlement ≠ Retrospective ≠ Archive.**

**Project directive:**
Design 023 remains the single canonical Project identity/lifecycle domain. Design 120 may transition that exact Project to Completed but never creates a separate CompletedProject entity.

**Closeout directive:**
closeout is a governance/readiness process over canonical Project obligations. It does not itself become Project lifecycle truth.

**Readiness directive:**
`ProjectCloseoutReadinessResolver` centrally evaluates all applicable mandatory requirements and returns structured `PASS`, `BLOCKED`, `UNKNOWN`, and `NOT_APPLICABLE` results with source evidence.

**Freshness directive:**
a prior green closeout screen is never completion authority. The completion command performs fresh server-side revalidation against current source revisions.

**Policy directive:**
one versioned `ProjectCloseoutPolicy` determines which requirements apply for the Project's type/context. Completed Projects retain the exact policy version used at completion.

**Historical-policy directive:**
future policy changes never retroactively alter whether a past Project was legitimately completed under its original policy.

**Applicability directive:**
requirements that do not apply are explicitly `NOT_APPLICABLE`, never mislabeled as successfully completed.

**Unknown-state directive:**
source service failure results in `UNKNOWN` and fails safe for mandatory requirements. It never silently becomes PASS, BLOCKED-by-user, or zero outstanding work.

**Task directive:**
Design 111 remains authoritative for Task/Milestone lifecycle. Closeout consumes required-work state without directly completing/cancelling outstanding work.

**Required-work directive:**
mandatory and optional Tasks/Milestones remain distinguishable. Optional work cannot accidentally prevent closeout merely because it is still open.

**Risk directive:**
Design 113 remains authoritative for Risks/Blockers. Closeout may require no unresolved blocking ProjectBlockers while allowing accepted/historical Risks according to policy.

**Deliverable directive:**
Design 114 remains authoritative for Deliverable readiness/artifact versions. Closeout reads exact readiness but never marks Deliverables approved/released itself.

**Approval directive:**
Design 115/029 remain authoritative for Approval/Gate state. Closeout reads fresh GateEvaluation rather than maintaining approval checkboxes.

**Client-dependency directive:**
Design 116 remains authoritative for ClientRequests. Mandatory unresolved Requests can block closeout, but Design 120 cannot manufacture Client fulfillment.

**Change-control directive:**
Design 117 remains authoritative for ChangeRequest/Application state. Approved-but-unapplied or partially applied mandatory changes can block closeout; historical rejected/withdrawn changes do not automatically block.

**Schedule directive:**
Design 118 remains schedule authority. Planned/forecast end dates are context only and never constitute completion evidence.

**Handover directive:**
Design 121 remains the canonical Final Handover domain. A completed Handover may be a closeout prerequisite where policy requires it, but ProjectCloseout and FinalHandover remain separate identities.

**Retrospective directive:**
Design 122 remains a lessons-learned process after/around completion and cannot silently become Project lifecycle authority.

**Archive directive:**
Design 123 remains canonical archive management. `Completed` and `Archived` are separate lifecycle states/actions with separate retention/access semantics.

**Publishing directive:**
publication is only a closeout requirement for Project types/policies that require it. Scheduled or provider-accepted publication cannot be mistaken for verified required publishing.

**Distribution directive:**
distribution/report requirements are likewise policy-specific and use canonical distribution/reporting state rather than generic closeout flags.

**Finance directive:**
if financial clearance is a closeout requirement, Design 120 consumes canonical Invoice/Payment/Reconciliation/balance projections. It never owns finance state.

**Financial-semantics directive:**
invoice count, outstanding balance, payment, settlement and reconciliation remain distinct. A generic `financeDone` checkbox is prohibited.

**Completion directive:**
`ProjectCompletionService` performs one explicit authorized lifecycle transition only after fresh readiness evaluation passes.

**Completion-record directive:**
every completion creates immutable evidence identifying Project, actor, timestamp, prior/resulting lifecycle, exact closeout policy version, final evaluation/source revisions, overrides, and correlation context.

**Completion-date directive:**
actual Project completion time remains distinct from planned end, forecast end, publication date, final handover date, invoice payment date and archive date.

**Atomicity directive:**
Project completion should remain a compact atomic Project-domain transaction—Project lifecycle change + immutable CompletionRecord + outbox—rather than a giant cross-domain mutation saga.

**No-side-effect directive:**
completion must not automatically mark Tasks complete, resolve Blockers, approve Deliverables, fulfill ClientRequests, publish content, settle invoices, remove Team members, archive files, disable Portal access, or archive the Project.

**Override directive:**
if exceptional closeout overrides exist, they are separately authorized, requirement-scoped, reasoned and Audited. An override never rewrites an unsatisfied source requirement as PASS.

**Separation-of-duties directive:**
Project read, closeout evaluation, Project completion, source-domain approval, and requirement override remain independently server-authorized.

**Idempotency directive:**
completion is replay-safe. Retrying the same request returns the same CompletionRecord and cannot emit duplicate completion lifecycle transitions/events.

**Concurrency directive:**
Project revision and relevant source revisions are rechecked so new ClientRequests, Deliverable changes, Approval changes, Blockers, or Change Applications cannot race with stale completion.

**Outcome-unknown directive:**
if completion may have committed but response is lost, reconcile using Project/idempotency lineage before retry; never create a second completion.

**Reopen directive:**
if reopening is supported, it is an elevated explicit lifecycle transition with reason/Audit evidence. The prior CompletionRecord remains immutable.

**Re-completion directive:**
a Project completed again after reopening receives a new CompletionRecord. Earlier completion history is never overwritten.

**External-fact directive:**
reopening a Project does not reverse prior handover, publication, client access, invoices, payments or other external historical facts automatically.

**Renewal directive:**
Project completion can feed RenewalOpportunity logic from Design 057, but does not directly create a new Deal/Contract/Project without explicit canonical workflows.

**Activity directive:**
Design 119 projects closeout/completion/reopen events chronologically; Activity is never completion authority.

**Audit directive:**
completion, requirement overrides, reopen/correction and material closeout actions generate actor/policy/source-aware Design-039 Audit evidence.

**Tenant directive:**
Project, source requirements, CompletionRecord, closeout policy and actor context remain strictly tenant-scoped.

**Permission directive:**
sensitive finance/legal/source evidence can be represented through safe requirement summaries without exposing underlying restricted data.

**Caching directive:**
closeout caches vary by Project authorization, policy version and every source-domain revision involved in readiness. Cached `READY` is never allowed to authorize completion.

**Partial-failure directive:**
Tasks, Deliverables, Approval, ClientRequest, Blocker, Change, Handover, Publishing, Distribution and Finance services may fail independently. Mandatory unavailable evidence makes readiness `UNKNOWN`, not completed.

**Performance directive:**
closeout should query compact source-domain readiness aggregations in parallel where safe, with lazy evidence expansion rather than loading full histories or all file/approval/task records.

**Future-reuse directive:**
Design **121 — Client Deliverables / Final Handover Workspace** must own the formal final delivery package/event and exact handed-over artifact versions. Design 120 may consume its completion state as a closeout prerequisite, but must never generate final handover by merely marking the Project completed.

**Overlap directive:**
Designs **023, 111–123** plus canonical Approval, Publishing, Distribution and Finance services must preserve one continuous **canonical Project obligations → typed closeout requirement resolvers → fresh readiness evaluation → authorized Project completion → immutable CompletionRecord → Activity/Audit → optional Retrospective/Archive/Renewal** lineage while keeping each source domain independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE PROJECT CLOSEOUT & COMPLETION FOUNDATION — VERSIONED PROJECT-SPECIFIC CLOSEOUT POLICY + TYPED SOURCE-BACKED REQUIREMENTS + PASS/BLOCKED/UNKNOWN/NOT-APPLICABLE SEMANTICS + FRESH SERVER-SIDE READINESS RESOLUTION + REQUIREMENT-SCOPED GOVERNED OVERRIDES + IMMUTABLE PROJECTCOMPLETIONRECORD + IDEMPOTENT CONCURRENCY-SAFE PROJECT LIFECYCLE TRANSITION + STRICT FINAL-HANDOVER/RETROSPECTIVE/ARCHIVE/PUBLISHING/FINANCE SEPARATION + NON-DESTRUCTIVE REOPEN HISTORY — AND NEVER ALLOW CHECKLIST BOOLEANS, ALL-TASKS-DONE COUNTS, PLANNED END DATES, CACHED GREEN STATES, DELIVERY FILE PRESENCE, PAYMENT STATUS, ACTIVITY ENTRIES OR GENERIC “COMPLETE” BUTTON SIDE EFFECTS TO SUBSTITUTE FOR OR REWRITE CANONICAL PROJECT, DELIVERABLE, APPROVAL, CLIENTDEPENDENCY, RISK, CHANGE, HANDOVER, FINANCE OR ARCHIVE TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **120 / 153** |
| **PASS**                                   |                        **120** |
| **STANDARDIZE decisions**                  |                        **118** |
| **Potential implementation-overlap flags** |                        **111** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**120 / 153 = 78.4% audited.**

### Canonical Project completion architecture after Design 120

```text
PROJECT PR-100
      │
      ├── Tasks / Milestones
      ├── Deliverables
      ├── Approvals
      ├── Client Requests
      ├── Risks / Blockers
      ├── Change Requests
      └── Handover / other policy requirements
                    │
                    ↓
          Closeout Requirement Resolvers
                    │
            ┌───────┼────────┐
            ↓       ↓        ↓
           PASS   BLOCKED   UNKNOWN
            │
            └───────┬────────┘
                    ↓
        ProjectCloseoutReadiness
                    ↓
                  READY
                    │
                    ↓
       fresh server revalidation
                    │
                    ↓
          ProjectCompletionService
                    │
             ┌──────┴──────┐
             ↓             ↓
     Project → COMPLETED  CompletionRecord
                           immutable evidence
```

The strongest completion rule is now explicit:

```text
All Tasks complete       ✓
All Milestones achieved  ✓
Deliverables ready       ✓
Approval pending         ✕

RESULT:

Project is NOT ready
for completion.
```

Likewise:

```text
Closeout readiness = READY

        ≠

Project = COMPLETED

Only the authorized
Completion command
changes Project lifecycle.
```

Closeout does not collapse the next three screens:

```text
Project Completed
      ≠
Final Handover
      ≠
Retrospective
      ≠
Archived
```

And a completed Project retains its evidence:

```text
CompletionRecord CR-1
Completed Aug 22
under Closeout Policy v3

Later:
Policy v4 is published.

RESULT:

CR-1 still proves
why PR-100 was validly
completed under v3.
```

If reopening is later supported:

```text
ACTIVE
   ↓
COMPLETED
   ↓
REOPENED / ACTIVE
   ↓
COMPLETED AGAIN

CompletionRecord #1 preserved
CompletionRecord #2 created

History is never erased.
```

## Next Sequential Audit Target

### **Design 121 — Client Deliverables / Final Handover Workspace**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
