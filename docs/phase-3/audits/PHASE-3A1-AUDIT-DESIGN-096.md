# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 096 — Deal Qualification / Deal Stage Detail

Design 096 should become the **canonical Team Workspace Deal qualification, stage-governance, transition-history, and stage-action surface** built on the Deal foundation established by Designs 016–017.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary should be:

> **Deal ≠ DealStageDefinition ≠ PipelineDefinition/Version ≠ CurrentStage ≠ StageTransition ≠ QualificationAssessment ≠ QualificationCriteria/Policy ≠ GateEvaluation ≠ Probability ≠ DealHealth ≠ DealLifecycle ≠ Proposal/Contract ≠ Meeting/FollowUp/Task.**

The central implementation rule is:

> **The Deal remains the stable commercial opportunity identity. Its current pipeline stage is governed state referencing a canonical stage definition; qualification is a separately recorded assessment; probability and health remain independent dimensions; and every movement between stages must occur through a validated, authorized, revision-safe transition command that preserves history rather than directly patching a stage field.**

---

# 1. Classification

| Audit field                   | Classification                                                                                                                    |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                 | **096**                                                                                                                           |
| **Canonical name**            | **Deal Qualification / Deal Stage Detail**                                                                                        |
| **Product area**              | Team Workspace / Sales CRM / Deals                                                                                                |
| **User surface**              | **Authenticated Team Workspace**                                                                                                  |
| **Screen class**              | Deal Workflow Detail / Qualification & Stage Governance Workspace                                                                 |
| **Classification**            | **Canonical Deal Qualification, Stage Transition & Pipeline Governance Anchor**                                                   |
| **Primary purpose**           | Inspect one canonical Deal's current stage, qualification, gate readiness and stage history while performing governed transitions |
| **Primary entity**            | **Deal** — Designs 016–017                                                                                                        |
| **Pipeline configuration**    | **PipelineDefinition / PipelineVersion**                                                                                          |
| **Stage configuration**       | **DealStageDefinition**                                                                                                           |
| **Current-stage reference**   | canonical Deal workflow state                                                                                                     |
| **History entity**            | **StageTransition**                                                                                                               |
| **Qualification entity**      | **QualificationAssessment**                                                                                                       |
| **Criteria/configuration**    | **QualificationPolicy / QualificationCriteriaVersion**                                                                            |
| **Gate result**               | **StageGateEvaluation**                                                                                                           |
| **Lead dependency**           | Designs 011 / 089                                                                                                                 |
| **Meeting dependency**        | Design 094                                                                                                                        |
| **Follow-up dependency**      | Design 095                                                                                                                        |
| **Task dependency**           | Design 034                                                                                                                        |
| **Proposal dependency**       | Design 018 / upcoming 097–098                                                                                                     |
| **Contract dependency**       | Designs 019 / upcoming 099–100                                                                                                    |
| **Activity/Audit dependency** | Activity projection / Design 039                                                                                                  |
| **Primary query service**     | `DealStageDetailQueryService`                                                                                                     |
| **Deal service**              | `DealService`                                                                                                                     |
| **Stage-transition service**  | `DealStageTransitionService`                                                                                                      |
| **Qualification service**     | `DealQualificationService`                                                                                                        |
| **Gate service**              | `DealStageGateService`                                                                                                            |
| **Auth**                      | Required                                                                                                                          |
| **Authorization**             | Active OrganizationMembership + Deal/qualification/stage-transition permissions                                                   |
| **Implementation priority**   | **Critical Pipeline Integrity / Commercial Governance / Conversion Safety**                                                       |
| **Reuse level**               | **Extremely High across Deals, Meetings, FollowUps, Proposals and Contracts**                                                     |

Design 096 should answer:

> **“What exact Deal is this, what pipeline/stage currently governs it, how was it qualified, which requirements are satisfied or unresolved, what stage transitions occurred historically, and is the requested next transition actually authorized and valid?”**

Canonical structure:

```text
                         DEAL
                 canonical opportunity
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
     Lifecycle      Qualification    Current Stage
                         │              │
                         ↓              ↓
              QualificationPolicy   StageDefinition
                                        │
                                        ↓
                                 StageGateEvaluation
                                        │
                                        ↓
                                  StageTransition
                                        │
                                        ↓
                                Transition History
```

---

# 2. Reuse

## Design 016 remains the canonical Deal pipeline

Design 016's pipeline board and Design 096 must operate on the same:

```text
Deal D-100
```

A drag/drop stage change from Design 016 and a detailed stage transition from Design 096 must call the **same canonical transition engine**.

Do not create:

```text
PipelineDeal
StageDetailDeal
QualifiedDeal
```

as separate entities.

---

## Design 017 remains Deal 360

Design 017 composes the overall Opportunity.

Design 096 specializes:

* qualification,
* current stage,
* gates,
* transition history,
* stage actions.

Both consume the same Deal ID.

---

## Design 096 ≠ Deal 360 duplicate

Design 096 should not reimplement:

* Company 360,
* Contact 360,
* complete Deal activity,
* Proposal workspace,
* Contract workspace.

Those may appear as safe supporting context only where present in the frozen design.

---

## Reuse Lead conversion lineage

If the Deal originated from Lead L-100:

```text
Lead L-100
    ↓
LeadConversion
    ↓
Deal D-200
```

Design 096 may expose that lineage.

It must not make Lead qualification equivalent to Deal qualification.

---

## Lead qualification ≠ Deal qualification

Permanent.

A Lead can have been qualified enough to create a Deal while the resulting Deal still requires a separate commercial qualification process.

---

## Reuse Design 094 Meeting outcomes

A MeetingOutcome can provide evidence relevant to qualification or transition.

It does not itself own DealStage.

Correct:

```text
MeetingOutcome
      ↓ evidence / explicit user action
DealStageTransitionService
      ↓
Deal stage changes
```

---

## Reuse Design 095 FollowUps

FollowUps can represent outstanding next actions around the Deal.

An overdue FollowUp does not itself alter Deal stage.

---

## Reuse Proposal/Contract domains

Where a stage depends on Proposal or Contract state, Design 096 should query those canonical entities.

Do not duplicate:

```text
deal.proposalApproved = true
deal.contractSigned = true
```

as replacement truth.

---

# 3. Entities

## Deal

The Deal remains the stable opportunity identity.

Conceptually:

```text
Deal
├── id
├── organizationId
├── companyId
├── primary contact/stakeholder relations
├── pipelineId/version context
├── currentStage
├── lifecycle
├── owner
├── probability where explicitly deal-owned
├── health projection/reference
├── amount/currency
├── createdAt
└── revision
```

Exact schema belongs to Phase 3D.

---

## Deal ≠ current stage

Critical.

Changing:

```text
Discovery
→ Proposal
```

does not create a new Deal.

---

## CurrentStage ≠ Deal lifecycle

This boundary from Design 016 remains strict.

Conceptually:

### Stage

Where the Deal is within its configured sales pipeline.

### Lifecycle

Whether the Deal is broadly:

```text
OPEN
WON
LOST
CANCELLED
```

or canonical equivalent.

These are not interchangeable.

---

## “Won” as stage ≠ lifecycle blindly

Even if the UI pipeline visually contains a terminal Won column, backend architecture should distinguish:

* pipeline-stage representation,
* canonical Deal closure/lifecycle semantics.

A validated terminal transition may update both through one domain command, but they remain different facts.

---

## DealStageDefinition

`DealStageDefinition` describes one configured pipeline stage.

Conceptually:

```text
DealStageDefinition
├── id
├── pipelineVersionId
├── stable key
├── display label
├── ordering
├── transition policy
├── gate policy reference
├── default probability where used
└── lifecycle semantics
```

Exact fields Phase 3D.

---

## Stage label ≠ identity

Changing:

> Proposal

to:

> Commercial Proposal

must not rewrite historical transition identity.

Use stable stage identifiers.

---

## Stage order ≠ stage identity

Permanent.

Reordering stages must not turn historical transitions into different stages.

---

## PipelineDefinition / Version

Pipeline configuration should be version-aware.

Conceptually:

```text
Pipeline
├── Version 1
│   ├── Stage A
│   ├── Stage B
│   └── Stage C
└── Version 2
    ├── Stage A
    ├── Stage B2
    └── Stage C
```

---

## Editing pipeline ≠ rewriting existing Deal history

Critical.

Historical:

```text
Deal D1
Discovery → Proposal
```

must remain explainable even after stage configuration changes.

---

## Active Deal pipeline migration must be deliberate

If pipeline configuration changes materially, existing Deal movement to the new version requires governed migration/reconciliation semantics.

Do not silently make all active Deals follow latest pipeline definitions.

---

## PipelineVersion ≠ Deal

Permanent.

---

## StageTransition

Every material stage change should preserve transition history.

Conceptually:

```text
StageTransition
├── id
├── dealId
├── fromStageId
├── toStageId
├── pipeline/version context
├── requestedBy
├── transitionedAt
├── reason/context
├── gate evaluation reference
├── deal revision before/after
└── idempotency reference
```

---

## Current stage ≠ transition history

Current stage is derived/current Deal state.

Transition history records how it got there.

Do not overwrite:

```text
deal.stage
```

without preserving a StageTransition.

---

## StageTransition should be append-oriented

Permanent.

Moving:

```text
Discovery
→ Proposal
→ Negotiation
→ Proposal
```

should preserve all three transitions.

Do not collapse history to:

> Current stage = Proposal.

---

## Backward transition ≠ history deletion

Permanent.

If policy allows Deal moving backwards:

the previous forward transition remains historical.

---

## Stage transition ≠ activity event

A StageTransition can generate Activity.

The Activity row is a projection.

---

## Stage transition ≠ AuditEvent

A user-initiated stage transition can also generate Audit.

The transition remains domain truth.

---

## QualificationAssessment

Qualification must be first-class.

Conceptually:

```text
QualificationAssessment
├── id
├── dealId
├── policy/version
├── evaluated criteria
├── result
├── evaluator/actor/system
├── evidence references
├── assessedAt
└── revision/supersession
```

---

## QualificationAssessment ≠ DealStatus

Permanent.

---

## QualificationAssessment ≠ stage

Permanent.

A Deal could be:

```text
Stage = Discovery
Qualification = Qualified
```

or:

```text
Stage = Proposal
Qualification = Needs Review
```

depending on canonical policy.

---

## Qualification result ≠ probability

A Deal can meet qualification criteria while still having moderate probability.

---

## Qualification ≠ Deal health

Permanent.

Example:

```text
Qualification = Qualified
Health = At Risk
```

is valid.

---

## Qualification ≠ Lead qualification

Permanent.

---

## Qualification criteria should be versioned

If criteria later change:

historical assessment should preserve which policy evaluated the Deal.

---

## Assessment correction ≠ silent rewrite

If qualification is corrected:

preserve previous assessment/result history or supersession linkage.

---

## Automated assessment ≠ human assessment

If both exist, record source/actor.

Do not make machine inference appear as human approval.

---

## Qualification evidence

Evidence can reference canonical:

* Lead information,
* Company,
* Contact/stakeholder context,
* Meetings,
* FollowUps,
* Proposal,
* other permitted source records.

Evidence references never copy/mutate those domains.

---

## Qualification evidence ≠ canonical field snapshot by default

Current source state may change.

Where historical assessment reproducibility requires it, preserve enough assessment-time values/policy references without duplicating whole CRM entities.

---

## StageGateEvaluation

Stage transition may require gates.

Conceptually:

```text
StageGateEvaluation
├── dealId
├── fromStage
├── targetStage
├── gatePolicyVersion
├── requirement results
├── blockers
├── evaluatedAt
└── freshness
```

---

## GateEvaluation ≠ StageTransition

Critical.

A gate can evaluate:

> Ready.

That does not move the Deal.

The user/system must execute an authorized transition.

---

## GateEvaluation ≠ qualification

Some gate requirements may use qualification, but gate readiness can also depend on other conditions.

---

## GateEvaluation ≠ permanent truth

Current Deal/source data can change.

Gate results need freshness.

---

## Passed gate ≠ permanent bypass

A gate evaluation from last month cannot automatically authorize today's transition if required source conditions changed.

---

## QualificationPolicy ≠ StageGatePolicy

They may share low-level rule primitives.

They remain separate business concepts.

---

## Probability

If Deal probability exists:

keep:

```text
Deal probability
≠
stage default probability
```

A pipeline stage may supply a default/suggestion.

It must not silently overwrite an explicitly governed Deal probability every time stage changes unless policy explicitly defines that behavior.

---

## Probability ≠ qualification confidence

Permanent.

---

## DealHealth

Health may represent:

* stalled,
* at risk,
* healthy,

according to product semantics.

It is independent from stage.

---

## Advanced stage ≠ healthy Deal

Permanent.

---

## Early stage ≠ unhealthy Deal

Permanent.

---

## Stage age

If frozen design shows:

> 12 days in stage

derive from latest successful StageTransition into the current stage.

Do not store manually maintained stale duration.

---

## Stage SLA/breach ≠ Deal lifecycle

If such a condition exists:

it is a derived operational condition.

Not:

```text
deal.status = OVERDUE
```

---

## Owner

Deal owner remains operational responsibility.

Owner ≠ stage.

Owner ≠ qualification.

Owner ≠ authorization.

---

## Proposal

Proposal may be a related commercial artifact.

Proposal status does not automatically equal Deal stage.

Example:

```text
Proposal = SENT
Deal stage = Proposal
```

may correlate, but one must not replace the other.

---

## Proposal accepted ≠ Deal won necessarily

Permanent.

Further Contract/payment/client-handoff requirements can remain.

---

## Contract

Contract execution remains separate.

Contract signed ≠ Deal lifecycle unless an explicit Deal closing command/policy says so.

---

## Meeting / FollowUp / Task

They remain evidence/actions around the Deal.

None owns stage truth.

---

# 4. Permissions

Design 096 should conceptually distinguish:

```text
deal.read
deal.edit
deal.assign

deal.qualification.read
deal.qualification.assess
deal.qualification.correct

deal.stage.read
deal.stage.transition
deal.stage.overrideGate

deal.pipelineContext.read

proposal.read
contract.read
meeting.read
followUp.read
task.read
```

Exact keys belong to Phase 3D.

---

## Deal read ≠ stage transition

Permanent.

---

## Deal edit ≠ stage transition

Critical.

A generic Deal editor must not bypass workflow by PATCHing `stageId`.

---

## Qualification read ≠ qualification assess

Permanent.

---

## Qualification assess ≠ qualification correct historical result

Potentially separate authority.

---

## Qualification authority ≠ stage transition authority

A reviewer can assess a Deal without advancing it.

---

## Stage transition authority ≠ gate override

Critical.

Normal transition:

> gates must pass.

Override:

> authorized exceptional bypass.

Separate permission and Audit trail.

---

## Gate override ≠ arbitrary field mutation

An override authorizes a specific blocked transition under governed policy.

It does not disable the gate system globally.

---

## Deal owner ≠ gate-override authority

Permanent.

---

## Meeting Outcome permission ≠ Deal-stage permission

Design 094 remains intact.

---

## FollowUp completion permission ≠ Deal-stage permission

Design 095 remains intact.

---

## Proposal read ≠ Deal-stage transition

Permanent.

---

## Contract access ≠ Deal close authority

Permanent.

---

## Sensitive gate evidence needs source permission

A user may see:

> Requirement unresolved

without permission to see confidential source details.

---

## Gate result must be field-safe

Example:

> Commercial approval required

can be exposed without necessarily revealing restricted Proposal/Contract financial data.

---

## Direct transition ID reauthorizes

Knowing IDs grants nothing.

---

## Browser target stage cannot be trusted

Server validates:

* Deal,
* current stage,
* pipeline/version,
* target stage,
* actor permission,
* allowed transition,
* gates.

---

## Cross-tenant pipeline/stage IDs prohibited

Absolute.

---

## Historical transitions remain permission-safe

A user who can view Deal may still lack permission to inspect sensitive transition reasons/evidence.

---

# 5. States

Design 096 must keep **Deal lifecycle, current stage, qualification, gate readiness, stage transition state, health, probability and related-source availability** separate.

### Deal lifecycle

Canonical conceptually:

```text
Open
Won
Lost
Cancelled
```

### Qualification

Conceptually:

```text
Not Assessed
Assessing
Qualified
Unqualified
Needs Review
```

Exact values follow final domain rules.

### Gate readiness

```text
Not Evaluated
Ready
Blocked
Partially Evaluated
Stale
Unavailable
```

### Stage transition execution

```text
Not Requested
Validating
Pending
Completed
Rejected
Failed
Outcome Unknown
```

### Deal health

Independent canonical/derived semantics.

### Probability

Independent numeric/qualitative value where supported.

These must never collapse into one `deal.status`.

---

## Qualified ≠ stage advanced

Permanent.

---

## Stage advanced ≠ qualified

If an authorized override allows it, this distinction becomes especially important.

---

## Gate ready ≠ transitioned

Permanent.

---

## Gate blocked ≠ Deal lost

Permanent.

---

## Transition rejected ≠ Deal failed

Permanent.

---

## Transition failed ≠ Deal missing

Permanent.

---

## Stage change ≠ Deal lifecycle closure

Unless target transition explicitly includes terminal lifecycle semantics.

---

## Proposal sent ≠ stage changed automatically

Permanent unless explicit workflow policy performs a stage command.

---

## Contract signed ≠ Deal won automatically

Same principle.

---

## Meeting completed ≠ stage changed

Permanent.

---

## FollowUp completed ≠ stage changed

Permanent.

---

## Deal health degraded ≠ stage regressed

Permanent.

---

## Probability changed ≠ stage changed

Permanent.

---

## Stage definition unavailable ≠ Deal missing

Critical.

Deal core remains canonical.

---

## Gate service unavailable ≠ gates passed

Critical.

Fail closed for gated transitions according to policy.

---

## Qualification service unavailable ≠ unqualified

Critical.

Use:

> Qualification unavailable.

---

## Related Proposal service unavailable ≠ no Proposal

Critical.

---

## State Coverage

Design 096 inherits Design 150 plus:

```text
Deal Loading
Deal Available
Deal Restricted
Deal Archived / Closed where applicable
Deal No Longer Accessible

Current Stage Available
Current Stage Historical
Pipeline Context Available
Pipeline Context Unavailable

Qualification Not Assessed
Qualification In Progress
Qualification Qualified
Qualification Unqualified
Qualification Needs Review
Qualification Restricted
Qualification Service Unavailable

Stage Gates Not Evaluated
Stage Gates Ready
Stage Gates Blocked
Stage Gates Partially Evaluated
Stage Gates Stale
Stage Gate Service Unavailable

Stage Transition Validating
Stage Transition Pending
Stage Transition Completed
Stage Transition Rejected
Stage Transition Failed
Stage Transition Outcome Unknown

Transition Requires Override
Transition Override Authorized
Transition Override Denied

Proposal Context Available
Proposal Context Restricted
Proposal Service Unavailable

Contract Context Available
Contract Context Restricted
Contract Service Unavailable

Meeting / FollowUp Evidence Available
Evidence Restricted
Evidence Service Unavailable

Deal Updated Elsewhere
Stage Changed Elsewhere
Partial Deal Stage Detail Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should make the current Deal-stage/qualification context primary while keeping related evidence and actions clearly secondary.

Conceptually:

```text
Deal identity
↓
Current stage / pipeline
↓
Qualification
↓
Stage readiness / gates
↓
Allowed next transitions
↓
Related evidence
   ├── Meetings
   ├── FollowUps
   ├── Proposal
   └── Contract
↓
Transition history
```

Only sections present in frozen Design 096 should render.

---

## Stage, qualification, lifecycle and health need distinct presentation

Correct semantics:

> Stage: Proposal
> Qualification: Qualified
> Lifecycle: Open
> Health: At Risk

Do not collapse them into one badge.

---

## Gate status should not look like Deal status

Use semantics such as:

> Ready for next stage
> 2 requirements unresolved

rather than:

> Deal blocked

unless that is explicitly the frozen language.

---

## Transition action should identify target stage

If frozen design provides transition controls, actions should be explicit:

> Move to Negotiation

rather than ambiguous:

> Complete.

---

## Override, if present, must be visually exceptional

Gate override should never look like normal transition behavior.

It requires:

* explicit reason,
* permission,
* Audit.

Do not invent an override UI if absent from the frozen design.

---

## Tablet

Following Design 152:

* Deal identity/stage remain first,
* qualification/gates stack,
* transition history becomes compact rows/cards,
* evidence sections collapse appropriately,
* stage actions remain touch-safe.

---

## Mobile

Priority:

```text
Deal
↓
Current stage
↓
Qualification
↓
Gate readiness
↓
Allowed next action
↓
Key evidence
↓
Stage history
```

Do not compress a wide pipeline history table horizontally.

---

## Partial failure

If Proposal service is down:

Deal, qualification, stage history and other evidence should still render.

Gate status may become:

> Partially evaluated / unavailable

rather than falsely “ready.”

---

## Accessibility

A Deal stage detail could communicate:

> Deal Acme Executive Magazine. Current stage Proposal. Lifecycle Open. Qualification Qualified. Two of three next-stage requirements satisfied. Contract information unavailable. Last stage transition occurred August 20.

where current authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical architecture

```text
Design 096
    ↓
Authenticated Workspace Context
    ↓
DealStageDetailQueryService
    │
    ├── DealAdapter
    ├── Pipeline/StageAdapter
    ├── QualificationAdapter
    ├── GateEvaluationAdapter
    ├── Proposal/ContractAdapter
    ├── Meeting/FollowUpAdapter
    └── StageHistoryAdapter
    ↓
DealStageDetailView
```

This is a read composition.

---

## All stage changes use one transition service

Both:

```text
Design 016 pipeline drag
```

and:

```text
Design 096 stage action
```

must call conceptually:

```text
DealStageTransitionService.transitionDeal(...)
```

There must be no parallel drag/drop stage logic.

---

## Transition command

Conceptually:

```text
transitionDeal(
    dealId,
    expectedDealRevision,
    targetStageId,
    reason/context,
    idempotencyKey
)
```

should:

1. authenticate/authorize;
2. load canonical Deal;
3. verify expected revision;
4. resolve Deal's pipeline/version;
5. validate target stage belongs to correct pipeline;
6. validate allowed from→to transition;
7. evaluate required stage gates;
8. enforce/record any governed override;
9. update canonical current stage;
10. append StageTransition;
11. apply terminal lifecycle semantics if explicitly required;
12. emit event/Audit;
13. return canonical Deal revision/state.

---

## Direct `stageId` PATCH prohibited

Avoid:

```text
PATCH /deals/:id
{
  stageId: target
}
```

through generic CRUD.

Stage transitions have domain invariants.

---

## Transactional current-stage + history update

Critical.

Updating Deal current stage and writing StageTransition should occur atomically inside the Deal-domain transaction.

Never allow:

```text
Deal says Negotiation
but transition history still says Proposal.
```

---

## Transition idempotency

Double-click or network retry must not create duplicate transitions.

Stable operation identity should recognize:

```text
same Deal
same expected transition intent
same idempotency key
```

---

## Concurrency

Example:

```text
User A: Proposal → Negotiation
User B: Proposal → Lost
```

Only one operation should win against the expected Deal revision/current stage.

The other must reload/reconcile.

---

## Transition outcome unknown

For a local DB transaction this should be rare, but client/network uncertainty can occur.

The client should reload canonical Deal before resubmitting rather than blindly creating another transition.

---

## Stage machine validation

Allowed transitions should come from canonical pipeline/stage policy.

Do not trust frontend arrows/buttons.

---

## Backward transition

If permitted:

record as a normal explicit StageTransition.

Do not erase later history.

---

## Terminal transition

A transition representing Won/Lost should invoke canonical closure semantics.

Conceptually:

```text
transitionDealToWon()
```

may atomically update:

* current stage,
* Deal lifecycle,
* closedAt,
* StageTransition/DealLifecycle event,

according to Deal policy.

Still:

> stage and lifecycle remain separately modeled.

---

## Closing reason

Lost/cancelled lifecycle may require structured reason/context.

Do not overload stage label with closure reason.

---

## Pipeline version pinning

Active Deal should know which pipeline/stage definition semantics govern its state.

Do not dynamically interpret it through whichever pipeline version is currently newest.

---

## Pipeline migration

If Deal must move to a newer pipeline configuration:

use an explicit migration command/process preserving:

* previous pipeline/version,
* previous stage,
* mapped target stage,
* actor/system reason,
* migration time.

---

## Pipeline migration ≠ StageTransition silently

If migration changes semantic workflow context, retain specific migration lineage even if it also produces a stage transition.

---

## Qualification service

Conceptually:

```text
assessDealQualification(
    dealId,
    policyVersion,
    assessmentInput/evidence,
    expectedRevision
)
```

should:

1. authorize assessor;
2. load current Deal/context;
3. load exact qualification policy version;
4. evaluate/record criteria;
5. preserve evidence references;
6. record actor/system;
7. append new assessment/supersession;
8. emit event/Audit.

---

## No generic `deal.qualified = true`

Avoid reducing qualification to a mutable boolean.

At minimum preserve:

* assessment state,
* assessment provenance,
* policy version,
* assessedAt.

---

## Qualification evidence should be permission-safe

A Deal can be marked:

> Needs review

while restricted evidence remains hidden.

Do not copy confidential source content into QualificationAssessment indiscriminately.

---

## Qualification reassessment

Source data changes do not automatically rewrite a prior assessment.

They can make it:

* stale,
* trigger/recommend reassessment,
* produce a later assessment.

---

## Qualification freshness

Where automated criteria depend on current CRM data:

record evaluatedAt/source revision as needed.

---

## Gate service

Conceptually:

```text
evaluateTransitionGates(
    dealId,
    currentStage,
    targetStage,
    actorContext
)
```

returns typed requirements:

```text
Requirement A → PASS
Requirement B → BLOCKED
Requirement C → UNKNOWN
```

not merely one boolean.

---

## Gate unknown ≠ pass

Critical.

If Proposal service is unavailable:

a Proposal-dependent gate should become:

> Unknown / unavailable.

Do not allow transition as if absent requirement passed.

---

## Gate engine should use canonical source services/projections

Examples may include:

* QualificationAssessment,
* Proposal state,
* Contract state,
* Meeting evidence,
* required Deal fields.

It should not maintain copied source truth.

---

## Gate policy should be versioned

Historical StageTransition should be able to explain which gate policy governed it.

---

## Gate evaluation should be reproducible enough for Audit

Store:

* gate policy/version,
* result,
* blockers/requirement IDs,
* evaluatedAt,

without needlessly copying entire sensitive source records.

---

## Override service

If gate overrides are supported:

```text
overrideTransitionGate(...)
```

requires:

* special permission,
* explicit reason,
* actor,
* exact blocked requirements,
* Audit,
* transition linkage.

---

## Override ≠ remove qualification requirements globally

Permanent.

---

## Stage probability

If stage has a default probability:

centralize the resolver.

A stage change may suggest/update Deal probability only according to explicit policy.

Do not bury:

```text
deal.probability = stage.defaultProbability
```

in arbitrary frontend logic.

---

## Stage age

Compute:

```text
currentTime - enteredCurrentStageAt
```

using canonical latest transition.

If current Deal was migrated, the stage-entry semantics must remain explicit.

---

## Related Proposal/Contract queries

Use safe canonical projections.

Never reconstruct their state from Activity strings.

---

## Meeting/FollowUp evidence

Use explicit source references and current authorized states.

Do not infer qualification solely from:

* “a Meeting exists,”
* “FollowUp completed.”

---

## Source-specific mutations

Examples:

```text
record qualification
→ DealQualificationService

change stage
→ DealStageTransitionService

change owner
→ DealService

create Proposal
→ ProposalService

create FollowUp
→ FollowUpService
```

Never generic `PATCH DealStageDetail`.

---

## Events/outbox

Useful domain events:

```text
DealQualificationAssessed
DealQualificationCorrected

DealStageTransitionRequested
DealStageChanged
DealStageTransitionRejected
DealStageOverrideUsed

DealWon
DealLost
DealPipelineMigrated
```

---

## Activity integration

Stage/qualification events can project into Deal Activity.

Activity is not source truth.

---

## Audit

Material operations should audit:

* qualification assessment/correction,
* stage transition,
* gate override,
* terminal Deal closure,
* pipeline migration.

---

## Notification integration

Design 080 can notify:

* Deal stage changed,
* stage blocked,
* Deal stalled,
* approval/action required,

if rules exist.

Notification state never changes Deal stage.

---

## Search integration

Design 079 can index safe current Deal stage/qualification metadata.

Historical sensitive gate details need not be broadly searchable.

---

## Caching

DealStageDetail cache must vary by:

```text
organizationMembershipId
dealId
authorization revision
deal revision
pipeline version
qualification revision
gate-source revisions
```

Do not cache only by Deal ID.

---

## Performance

Use:

* canonical Deal/Stage joins,
* latest QualificationAssessment projection,
* batched gate-source checks,
* paginated transition history,
* derived current stage duration.

Do not N+1 query every evidence source for every timeline row.

---

## Partial failure contract

Example:

```text
Deal core          ✓
Pipeline/Stage     ✓
Qualification      ✓
Meetings           ✓
FollowUps          ✓
Proposal           ✕
Contract           ✓
Gate evaluation    partial
Stage history      ✓
```

Design 096 remains available.

The next transition becomes:

> Cannot fully evaluate required gates.

Not:

> Deal not found.

And not:

> Ready to advance.

---

## Backend Requirement Matrix

| Requirement                                  | Status                          |
| -------------------------------------------- | ------------------------------- |
| Canonical Deal reuse from 016–017            | **Critical**                    |
| Deal/Stage separation                        | **Critical**                    |
| Stage/Lifecycle separation                   | **Critical**                    |
| Stage/Qualification separation               | **Critical**                    |
| Qualification/Probability separation         | **Critical**                    |
| Stage/Health separation                      | **Critical**                    |
| Stable DealStageDefinition IDs               | **Critical**                    |
| Stage label/order ≠ identity                 | **Critical**                    |
| Versioned PipelineDefinition                 | **Critical**                    |
| Historical pipeline semantics preserved      | **Critical**                    |
| Explicit pipeline migration                  | **Critical**                    |
| Current stage/StageTransition separation     | **Critical**                    |
| Append-oriented StageTransition history      | **Critical**                    |
| Atomic current-stage + transition write      | **Critical**                    |
| One shared transition engine for 016/096     | **Critical**                    |
| Direct generic stage PATCH prohibited        | **Critical**                    |
| Server-side allowed-transition validation    | **Critical**                    |
| Stage-transition authorization               | **Critical**                    |
| Transition idempotency                       | **Critical**                    |
| Optimistic concurrency                       | **Critical**                    |
| Backward transition history preservation     | **Critical**                    |
| Terminal stage/lifecycle coordination        | **Critical**                    |
| QualificationAssessment first-class          | **Critical**                    |
| Versioned qualification policy               | **Critical**                    |
| Assessment evidence/provenance               | **Critical**                    |
| Qualification correction/history             | **Critical**                    |
| Lead/Deal qualification separation           | **Critical**                    |
| StageGateEvaluation first-class              | **Critical**                    |
| Gate policy versioning                       | **Critical**                    |
| Gate result/transition separation            | **Critical**                    |
| Gate unknown ≠ pass                          | **Critical**                    |
| Gate evidence remains source-owned           | **Critical**                    |
| Gate override separate permission            | **Critical if override exists** |
| Override reason/Audit                        | **Critical if override exists** |
| MeetingOutcome/DealStage separation          | **Critical**                    |
| FollowUp completion/DealStage separation     | **Critical**                    |
| Proposal/DealStage separation                | **Critical**                    |
| Contract/Deal lifecycle separation           | **Critical**                    |
| Stage-default probability policy centralized | **Required if used**            |
| Stage-duration derived from history          | **Required**                    |
| Source-specific mutations                    | **Critical**                    |
| No DealStageDetail mega-PATCH                | **Critical**                    |
| Permission-aware source projections          | **Critical**                    |
| Partial dependency failure handling          | **Critical**                    |
| Permission-safe caching                      | **Critical**                    |
| Audit integration                            | **Required**                    |
| Design 097–100 downstream reuse              | **Critical architecture**       |

---

# 8. Consolidation

Design 096 exposes substantial risk of collapsing the entire commercial process into one `deal.status`.

**Deal / CurrentStage conflation**
Stage movement becomes Deal recreation.

**Deal / DealStageDefinition conflation**
Configured workflow stage becomes opportunity identity.

**Stage label / stage identity conflation**
Renaming stage corrupts history.

**Stage order / identity conflation**
Reordering pipeline rewrites previous transitions.

**Current stage / transition history conflation**
Only latest value survives.

**Backward transition / history deletion conflation**
Previous movement is rewritten.

**Pipeline definition / Deal state conflation**
Editing pipeline rewrites active Deals.

**Latest pipeline / Deal's governing version conflation**
Existing Deals silently adopt new rules.

**Pipeline migration / silent config update conflation**
Commercial history becomes unexplained.

**Stage / Deal lifecycle conflation**
Proposal/Open/Won/Lost semantics become one enum.

**Terminal stage / Deal closure conflation**
Deal appears won without canonical closure data.

**Deal lifecycle / qualification conflation**
Qualified becomes Won/Open state.

**Qualification / stage conflation**
Qualified automatically moves pipeline.

**Lead qualification / Deal qualification conflation**
Pre-opportunity assessment substitutes commercial qualification.

**Qualification / probability conflation**
Qualified becomes 100%.

**Qualification / health conflation**
Qualified Deal appears healthy despite risk.

**Qualification boolean / assessment history conflation**
No record of who/why/policy.

**Current source data / historical qualification evidence conflation**
Old assessment rewrites when Company/Contact changes.

**Automated assessment / human assessment conflation**
Machine conclusion appears human-approved.

**GateEvaluation / StageTransition conflation**
Passing criteria moves Deal automatically.

**Gate blocked / Deal lost conflation**
Temporary readiness issue becomes commercial failure.

**Gate unknown / passed conflation**
Dependency outage allows invalid transition.

**Stale gate result / current readiness conflation**
Old evaluation authorizes new movement.

**Qualification policy / gate policy conflation**
Commercial fit and stage-entry requirements become same rules.

**Normal transition / gate override conflation**
Any stage mover can bypass requirements.

**Override / global gate removal conflation**
Exceptional action weakens future Deals.

**Deal edit / stage transition conflation**
Generic CRUD bypasses workflow invariants.

**Drag/drop / direct DB mutation conflation**
Design 016 has different transition rules from 096.

**Concurrent transition / last-write-wins conflation**
Two users silently overwrite stage.

**Transition retry / duplicate history conflation**
One move appears several times.

**Stage default probability / Deal probability conflation**
Every move overwrites commercial judgment.

**Probability / qualification confidence conflation**
Two unrelated scores collapse.

**Advanced stage / healthy Deal conflation**
Stalled/at-risk Deal looks healthy.

**Stage age / mutable counter conflation**
Duration drifts from actual history.

**Meeting completed / Deal stage transition conflation**
Calendar action moves pipeline.

**MeetingOutcome / DealStage conflation**
“Interested” becomes Proposal automatically.

**FollowUp completed / DealStage conflation**
Sales action completion advances pipeline.

**Proposal sent / Deal stage conflation**
Document state replaces opportunity workflow.

**Proposal accepted / Deal won conflation**
Commercial acceptance skips Contract/other policy.

**Contract signed / Deal won conflation**
Execution automatically changes Deal without canonical closure command.

**Task completed / Deal stage conflation**
Internal work updates Sales workflow.

**ActivityEvent / StageTransition conflation**
Timeline string becomes stage truth.

**AuditEvent / StageTransition conflation**
Compliance log becomes operational state.

**Deal read / stage transition permission conflation**
Viewer can advance pipeline.

**Deal edit / gate override permission conflation**
Normal editor bypasses governance.

**Deal owner / override authority conflation**
Operational owner becomes superuser.

**Meeting outcome permission / Deal mutation permission conflation**
Meeting recorder advances pipeline.

**FollowUp completion permission / Deal mutation permission conflation**
Task performer controls commercial workflow.

**Gate result / sensitive evidence leak**
User learns restricted Proposal/Contract details.

**Proposal service unavailable / no Proposal conflation**
Gate becomes incorrectly blocked/passed.

**Qualification service unavailable / unqualified conflation**
Outage changes business meaning.

**Gate service unavailable / ready conflation**
System fails open.

**Stage definition unavailable / Deal missing conflation**
Configuration issue hides canonical Deal.

**DealStageDetail mega-record**
Proposal/Meeting/Contract state becomes copied stale JSON.

**Generic DealStageDetail PATCH**
One endpoint mutates qualification/stage/Proposal/Contract.

**Cache by Deal ID only**
Sensitive gate/evidence data leaks.

**096/016 duplicate pipeline engine**
Board and detail allow different transitions.

**096/017 duplicate Deal backend**
Deal 360 and Stage Detail drift.

**096/089 duplicate qualification concept**
Lead and Deal qualification collapse.

**096/094 duplicate Meeting-outcome workflow**
Meeting state directly controls Deal.

**096/095 duplicate FollowUp state**
FollowUp outcome becomes stage engine.

**096/097–100 duplicate Proposal/Contract state**
Deal stage starts owning commercial documents.

No additional screen is required.

These are **Deal identity, pipeline-versioning, stage-history, qualification, gates, transition authority, concurrency, downstream commercial-document boundaries and partial-failure requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL DEAL QUALIFICATION, STAGE GOVERNANCE & TRANSITION-HISTORY ANCHOR**

**Domain directive:**
**Deal ≠ DealStageDefinition ≠ PipelineDefinition/Version ≠ CurrentStage ≠ StageTransition ≠ QualificationAssessment ≠ QualificationCriteria/Policy ≠ GateEvaluation ≠ Probability ≠ DealHealth ≠ DealLifecycle ≠ Proposal/Contract ≠ Meeting/FollowUp/Task.**

**Identity directive:**
Designs 016–017 remain the sole canonical Deal foundation. Design 096 specializes qualification/stage governance over the same Deal ID and never creates a StageDeal/QualifiedDeal entity.

**Pipeline directive:**
Deal pipeline configuration uses stable, version-aware PipelineDefinition and DealStageDefinition identities. Stage names/order may evolve without rewriting historical commercial state.

**Version directive:**
an active/historical Deal must remain interpretable under the pipeline/version that governed it. Material migration to newer pipeline semantics is explicit, traceable and never silent.

**Stage directive:**
current Deal stage is controlled Deal state referencing a canonical StageDefinition. It is not the Deal itself and not Deal lifecycle.

**Lifecycle directive:**
open/won/lost/cancelled or canonical closure semantics remain independent from pipeline stage. Terminal transition commands may coordinate both atomically while retaining separate fields/history.

**History directive:**
every successful stage movement appends a canonical `StageTransition` containing from/to stages, governing pipeline/version, actor, time, reason, gate context and revision lineage.

**Transition-engine directive:**
Design 016 pipeline drag/drop and Design 096 stage-detail actions must use one `DealStageTransitionService`. Parallel transition implementations are prohibited.

**Mutation directive:**
generic `PATCH deal.stageId` is prohibited. Stage changes occur only through server-authoritative commands validating current state, allowed transitions, permissions, gates and optimistic revision.

**Concurrency directive:**
simultaneous stage changes use expected Deal revision/current-stage checks. Silent last-write-wins is prohibited.

**Idempotency directive:**
UI retry/double-click must not append duplicate transitions or repeat terminal lifecycle effects.

**Qualification directive:**
Deal qualification is a first-class `QualificationAssessment` governed by exact policy/version, actor/system context, evidence and time. It is not a boolean substitute for stage/lifecycle.

**Lead-boundary directive:**
Lead qualification and Deal qualification remain distinct assessments. Creating a Deal from a qualified Lead does not eliminate Deal-level commercial qualification.

**Assessment-history directive:**
reassessment/correction preserves previous qualification history rather than rewriting earlier business decisions.

**Evidence directive:**
Meetings, FollowUps, Company/Contact data, Proposals and other canonical entities may supply qualification/gate evidence while remaining source-owned.

**Gate directive:**
StageGateEvaluation answers whether current conditions satisfy a specific from→to transition policy. Passing a gate never performs the transition itself.

**Freshness directive:**
gate results are freshness-aware. Changed or unavailable underlying evidence must make outdated/partial results stale or unknown rather than silently reusable.

**Fail-safe directive:**
`Unknown`, `Unavailable`, and `Blocked` remain distinct. Required gate evidence that cannot be evaluated must never be silently interpreted as `Pass`.

**Override directive:**
if the product supports gate overrides, they require separate authority, exact blocked-gate context, explicit reason and immutable Audit/transition linkage. Normal stage-transition permission does not include override authority.

**Probability directive:**
Deal-specific probability remains independent from qualification and stage. Stage defaults can inform probability only through one explicit canonical policy.

**Health directive:**
Deal health remains independent from stage, qualification and probability. Advanced stage does not guarantee healthy Deal.

**Meeting directive:**
Design 094 MeetingOutcome may provide evidence/request an explicit Deal command but never owns stage truth.

**Follow-up directive:**
Design 095 completion/outcome may provide evidence/request an explicit Deal command but never advances the pipeline by itself.

**Proposal directive:**
Designs 018/097–098 remain canonical Proposal domains. Proposal status may satisfy stage gates but never becomes Deal stage.

**Contract directive:**
Designs 019/099–100 remain canonical Contract domains. Contract execution can inform closure rules without becoming Deal lifecycle automatically.

**Authorization directive:**
Deal read/edit, qualification, stage transition and exceptional gate override remain separately server-authorized. Supporting evidence uses independent source permissions.

**Partial-failure directive:**
Deal core, stage history and healthy sections remain visible when Qualification, Proposal, Contract, Meeting, FollowUp or gate-source services fail. Dependency failure never turns into false qualification, false readiness, or Deal-not-found.

**Transaction directive:**
Deal current-stage update and StageTransition append occur atomically within the Deal domain. Cross-domain Proposal/Contract/Meeting/FollowUp records remain outside that transaction.

**Activity directive:**
stage and qualification events can produce Activity projections but Activity never replaces domain transition/assessment records.

**Audit directive:**
qualification assessments/corrections, stage transitions, gate overrides, pipeline migrations and terminal Deal closure create appropriate Audit evidence with actor and policy context.

**Caching directive:**
Deal-stage-detail caches vary by OrganizationMembership, authorization revision, Deal revision, pipeline version, qualification revision and gate-source revisions. Deal ID alone is insufficient.

**Performance directive:**
use canonical stage/qualification projections, batched gate-source evaluation, indexed transition history and derived stage-duration calculations instead of copied cross-domain commercial state.

**Future-reuse directive:**
Designs **097–100** must reuse the same Deal ID and exact Proposal/Contract relationships. Proposal review, signing and execution must never create a second Deal-stage backend.

**Overlap directive:**
Designs **016–019, 089, 094–100** must share one continuous **Lead → Deal → Qualification → Governed StageTransition → Proposal → Contract** commercial lineage while preserving each entity's lifecycle and evidence independently.

**Consolidation directive:**
**STANDARDIZE ONE DEAL WORKFLOW FOUNDATION — CANONICAL DEAL IDENTITY + VERSIONED PIPELINE/STAGE DEFINITIONS + DISTINCT DEAL LIFECYCLE/HEALTH/PROBABILITY + FIRST-CLASS VERSIONED QUALIFICATIONASSESSMENT + FRESH PER-TRANSITION STAGEGATEEVALUATION + ONE AUTHORIZED/REVISION-SAFE/IDEMPOTENT STAGETRANSITION SERVICE + APPEND-ORIENTED TRANSITION HISTORY + EXPLICIT PIPELINE MIGRATION + SOURCE-OWNED MEETING/FOLLOWUP/PROPOSAL/CONTRACT EVIDENCE — AND NEVER ALLOW DRAG/DROP, GENERIC CRUD, QUALIFICATION LABELS, MEETING OUTCOMES, FOLLOW-UP COMPLETION OR DOWNSTREAM DOCUMENT STATUS TO SILENTLY BECOME DEAL STAGE OR DEAL LIFECYCLE TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **96 / 153** |
| **PASS**                                   |                         **96** |
| **STANDARDIZE decisions**                  |                         **94** |
| **Potential implementation-overlap flags** |                         **87** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**96 / 153 = 62.7% audited.**

### Canonical Deal-stage architecture after Design 096

```text
                         DEAL
                  canonical opportunity
                           │
          ┌────────────────┼────────────────┐
          ↓                ↓                ↓
      Lifecycle       Qualification       Health
                           │
                           ↓
                 QualificationAssessment

                           DEAL
                            │
                            ↓
                    PipelineVersion
                            │
                            ↓
                   Current Stage
                            │
                            ↓
                 StageGateEvaluation
                            │
                       explicit command
                            ↓
                    StageTransition
                            │
                            ↓
                   New Current Stage
```

The central state distinction is now strict:

```text
Deal lifecycle   = OPEN
Stage            = PROPOSAL
Qualification    = QUALIFIED
Probability      = 65%
Health           = AT RISK

All five can coexist.
None replaces another.
```

A stage change is therefore:

```text
User requests:
Proposal → Negotiation
        ↓
Authorize
        ↓
Validate Deal revision
        ↓
Validate pipeline/version
        ↓
Validate allowed transition
        ↓
Evaluate stage gates
        ↓
PASS
        ↓
Atomic:
  update current stage
  +
  append StageTransition
        ↓
Emit Activity/Audit
```

Not:

```text
PATCH deal.stage = "Negotiation"
```

And supporting workflow evidence remains separate:

```text
Meeting Outcome recorded
FollowUp completed
Proposal sent
Contract signed

        ≠

Deal stage changed

unless an explicit governed Deal transition command
actually executes the transition.
```

## Next Sequential Audit Target

### **Design 097 — Proposal Library / Proposal List**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
