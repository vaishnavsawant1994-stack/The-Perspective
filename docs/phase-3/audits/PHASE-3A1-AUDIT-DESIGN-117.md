# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 117 — Project Change Requests / Scope Change Workspace

Design 117 should become the **canonical Team Workspace Project change-control, scope-delta, impact-assessment, approval, commercial-impact, and governed application surface** for changes requested after a Project has already been created.

It must reuse the canonical Project from Design 023, original commercial/scope lineage established through Designs 018–020/104–108, Deliverables from Design 114, Approval engine from Designs 029/115, Client Requests from Design 116, Risks/Blockers from Design 113, Tasks/Milestones from Design 111, resources from Design 112, and later Timeline/Closeout surfaces.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **ProjectChangeRequest ≠ ChangeRequestVersion ≠ ProposedScopeDelta ≠ ChangeImpactAssessment ≠ ApprovalRequest/Decision ≠ AppliedProjectChange ≠ ProjectCurrentScope ≠ ClientRequest ≠ Risk/Blocker ≠ Task ≠ Deliverable ≠ Proposal/Contract/Invoice Amendment ≠ ProjectStage ≠ ProjectLifecycle.**

The central implementation rule is:

> **A Project Change Request proposes a change; it does not itself alter the Project. The exact requested scope delta, timeline/cost/resource implications, affected Deliverables, and approval/commercial evidence must be versioned and reviewable. Only an explicitly approved and still-current ChangeRequestVersion may be applied through canonical Project/Deliverable/Timeline/Resource/Commercial services. Rejection, withdrawal, cancellation, approval, and application are different facts. Client feedback or a Project blocker may initiate a Change Request, but neither may directly rewrite contracted scope or operational Project truth.**

---

# 1. Classification

| Audit field                          | Classification                                                                                                                                                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**                        | **117**                                                                                                                                                                                                                        |
| **Canonical name**                   | **Project Change Requests / Scope Change Workspace**                                                                                                                                                                           |
| **Product area**                     | Team Workspace / Projects / Change Control / Scope Governance                                                                                                                                                                  |
| **User surface**                     | **Authenticated Team Workspace**                                                                                                                                                                                               |
| **Screen class**                     | Project Detail Variant / Change Control / Scope Governance Workspace                                                                                                                                                           |
| **Classification**                   | **Canonical Project Change Request, Scope-Delta, Impact-Assessment & Governed Application Anchor**                                                                                                                             |
| **Primary purpose**                  | Capture proposed Project changes, version the requested delta, assess consequences, obtain required approval/commercial authorization, and apply approved changes safely without rewriting original Project/commercial history |
| **Primary parent**                   | **Project** — Design 023                                                                                                                                                                                                       |
| **Primary entity**                   | **ProjectChangeRequest**                                                                                                                                                                                                       |
| **Version entity**                   | **ChangeRequestVersion**                                                                                                                                                                                                       |
| **Proposed change model**            | **ProposedScopeDelta**                                                                                                                                                                                                         |
| **Impact entity**                    | **ChangeImpactAssessment**                                                                                                                                                                                                     |
| **Formal approval**                  | **ApprovalRequest / ApprovalDecision** — Design 029 / 115                                                                                                                                                                      |
| **Application record**               | **AppliedProjectChange / ChangeApplication**                                                                                                                                                                                   |
| **Current Project scope dependency** | canonical Project scope/delivery configuration                                                                                                                                                                                 |
| **Commercial lineage**               | Deal / ProposalVersion / ContractVersion / commercial snapshot                                                                                                                                                                 |
| **Commercial amendment dependency**  | canonical Proposal/Contract/Invoice domains if commercial change is required                                                                                                                                                   |
| **Deliverable dependency**           | Design 114                                                                                                                                                                                                                     |
| **Task/Milestone dependency**        | Design 111                                                                                                                                                                                                                     |
| **Resource dependency**              | Design 112                                                                                                                                                                                                                     |
| **Risk/Blocker dependency**          | Design 113                                                                                                                                                                                                                     |
| **Client dependency**                | Design 116                                                                                                                                                                                                                     |
| **Approval dependency**              | Design 115                                                                                                                                                                                                                     |
| **Timeline dependency**              | Design 118                                                                                                                                                                                                                     |
| **Activity dependency**              | Design 119                                                                                                                                                                                                                     |
| **Closeout dependency**              | Design 120                                                                                                                                                                                                                     |
| **Primary query service**            | `ProjectChangeRequestQueryService`                                                                                                                                                                                             |
| **Change service**                   | `ProjectChangeRequestService`                                                                                                                                                                                                  |
| **Impact service**                   | `ProjectChangeImpactAssessmentService`                                                                                                                                                                                         |
| **Application service**              | `ProjectChangeApplicationService`                                                                                                                                                                                              |
| **Commercial requirement resolver**  | `ChangeCommercialRequirementResolver`                                                                                                                                                                                          |
| **Readiness resolver**               | `ChangeApplicationReadinessResolver`                                                                                                                                                                                           |
| **Parent shell**                     | `InternalAppShell` — Design 001                                                                                                                                                                                                |
| **Auth**                             | Required                                                                                                                                                                                                                       |
| **Authorization**                    | Active OrganizationMembership + Project/change-control/approval/commercial permissions                                                                                                                                         |
| **Implementation priority**          | **Critical Scope Integrity / Commercial Protection / Historical Reproducibility**                                                                                                                                              |
| **Reuse level**                      | **Extremely High across Project, commercial, Deliverable, Timeline, resource, Approval and closeout domains**                                                                                                                  |

Design 117 should answer:

> **“What exactly is being proposed to change, compared with which current Project baseline, why is it changing, what does it affect, what will it cost in time/resources/money, which exact version has been approved, whether commercial/legal authorization is still required, and has that exact approved change actually been applied to the Project?”**

Canonical flow:

```text
Current Project Baseline
        │
        ↓
ProjectChangeRequest CR-10
        │
        ↓
ChangeRequestVersion v3
        │
        ├── ProposedScopeDelta
        ├── Deliverable impact
        ├── Timeline impact
        ├── Resource impact
        ├── Cost/commercial impact
        └── ChangeImpactAssessment
                  │
                  ↓
           ApprovalRequest
                  │
                  ↓
          v3 APPROVED
                  │
                  ↓
     ChangeApplicationReadiness
                  │
                  ↓
      ProjectChangeApplication
                  │
       ┌──────────┼───────────┐
       ↓          ↓           ↓
   Project    Deliverables   Timeline/
   Scope      Tasks/etc.     Resources

Approved
   ≠
Applied.
```

---

# 2. Reuse

## Design 023 remains canonical Project authority

Design 117 changes the canonical Project through governed commands.

It must never create:

```text
ChangedProject
RevisedProject
ScopeChangeProject
```

as a parallel Project identity.

Correct:

```text
Project PR-100
   ↓
approved Change Request
   ↓
canonical Project commands
   ↓
same Project PR-100
with preserved change history
```

---

## Change Request ≠ Project

Permanent.

A Change Request is a proposed modification to the Project.

The Project is the operational delivery entity.

---

## Change Request ≠ ClientRequest

This is one of the strongest boundaries.

### ClientRequest

> We need an action from the client.

### ProjectChangeRequest

> Someone proposes that the Project's agreed scope/delivery baseline should change.

Example:

```text
Client says:
“Can we add two more executive profiles?”
```

This might lead to:

```text
ProjectChangeRequest CR-20
```

It is not itself merely a `ClientRequest`.

---

## Client message/feedback ≠ Change Request automatically

A conversation such as:

> Could we maybe add another article?

must not silently modify scope or even necessarily create formal change control.

An authorized internal/user action may convert/reference that request into a canonical Change Request.

---

## Risk/Blocker ≠ Change Request

Design 113 remains separate.

A Blocker may reveal:

> Current approach is impossible; scope needs alteration.

That can trigger:

```text
ProjectBlocker
   ↓
ProjectChangeRequest
```

but:

```text
ProjectBlocker
≠
ProjectChangeRequest
```

---

## Change Request ≠ mitigation Task

Preparing impact analysis, revised copy, estimates, or amendment documents may require Tasks.

Those remain canonical Design 034/111 Tasks.

---

## Design 114 Deliverables remain canonical

A Change Request can propose:

* add Deliverable,
* remove Deliverable,
* modify Deliverable obligation,
* change expected artifact/output.

It must not edit Deliverable records until the change is approved and applied.

---

## Proposed Deliverable change ≠ runtime Deliverable change

Critical.

Correct:

```text
ChangeRequestVersion v3
proposes:
+ Deliverable D-new

before application:
Project does NOT yet have D-new

after approved Application:
canonical DeliverableService creates D-new
```

---

## Design 111 Tasks/Milestones remain runtime work authority

A proposed change can calculate that:

> 4 additional Tasks and one Milestone will be required.

Those are impact/planning information.

They should not become actual runtime Tasks before the Change is applied unless explicitly approved preparatory work.

---

## Design 112 remains resource authority

A Change Impact Assessment can say:

> Designer +20 hours.

But actual ResourceAllocation changes happen only during the governed application phase through Design 112's service.

---

## Design 115/029 remain formal Approval authority

A Project Change Request may require:

* internal approval,
* client approval,
* financial approval,

according to policy.

Correct:

```text
ChangeRequestVersion v3
       ↓ exact subject
ApprovalRequest A-30
```

Do not create a second:

```text
changeRequest.approved = true
```

truth.

---

## Approval applies to exact ChangeRequestVersion

Critical.

```text
CR-10 v2 → APPROVED
```

Then:

```text
CR-10 v3 created
```

v2's Approval does not transfer to v3.

---

## Proposal/Contract remain separate commercial documents

If the Change alters:

* price,
* commercial deliverables,
* legal obligations,
* contract dates,

then the Project change may require a new:

* ProposalVersion,
* ContractVersion/amendment,
* Invoice adjustment,

under canonical commercial policy.

Design 117 must not mutate the original signed Contract.

---

## Change Request ≠ Contract amendment

Permanent.

The Project Change Request explains the operational scope change.

A Contract amendment/revised ContractVersion provides legal/commercial authorization where required.

---

## Project scope ≠ Contract scope

They are related but independently canonical.

After an authorized change:

* commercial agreement history remains immutable;
* Project current scope updates through Project domain;
* lineage connects the two.

---

# 3. Entities

## ProjectChangeRequest

Stable identity for one change-control case.

Conceptually:

```text
ProjectChangeRequest
├── id
├── organizationId
├── projectId
├── title/reference
├── reason/category
├── requester context
├── lifecycle
├── currentDraftVersionId?
├── currentSubmittedVersionId?
├── approvedVersionId?
├── appliedVersionId?
├── source context
├── createdAt
└── revision
```

Exact schema belongs to Phase 3D.

---

## ProjectChangeRequest ≠ ChangeRequestVersion

Permanent.

Stable Change Request answers:

> Which change-control case is this?

Version answers:

> What exact proposed change did we assess/approve?

---

## ChangeRequestVersion

Strongly recommended because scope proposals evolve before approval.

Conceptually:

```text
ChangeRequestVersion
├── id
├── changeRequestId
├── version
├── proposedScopeDelta
├── assumptions
├── requested dates
├── deliverable changes
├── commercial implications
├── impact assessment reference
├── createdBy
├── createdAt
└── lifecycle
```

---

## Submitted/approved versions should be immutable

Once a version is formally submitted for approval:

material scope/impact content should not mutate in place.

If revision is required:

```text
v2 rejected / needs revision
↓
create v3
```

not:

```text
UPDATE v2
```

---

## Latest draft ≠ submitted version

Permanent.

---

## Latest draft ≠ approved version

Permanent.

---

## Approved version ≠ applied version

Critical.

Valid:

```text
latest draft     = v4
submitted        = v3
approved         = v3
applied          = none
```

or:

```text
approved         = v3
applied          = v3
new draft        = v4
```

These are different facts.

---

## ProposedScopeDelta

Should represent the **difference** being proposed relative to a known baseline.

Conceptually:

```text
ProposedScopeDelta
├── baselineReference / revision
├── additions
├── removals
├── modifications
├── Deliverable impacts
├── schedule impacts
├── resource impacts
└── commercial implications
```

Do not treat it as a complete duplicate Project object.

---

## Scope delta ≠ Project snapshot

Critical.

Avoid copying the entire Project into each change request and then replacing it wholesale.

Store/derive precise intended changes with sufficient baseline/version context.

---

## Baseline reference

Every ChangeRequestVersion should be evaluated against a known Project baseline/revision.

Conceptually:

```text
baselineProjectRevision = 42
```

or an explicit ProjectScopeSnapshot.

This matters because PR-100 may change while the request is being reviewed.

---

## Baseline stale ≠ Change Request rejected

Critical.

It means:

> impact/application must be revalidated because Project state changed.

Do not blindly apply stale deltas.

---

## ProjectScopeSnapshot

If the system needs strong reproducibility:

a snapshot/read model may preserve the relevant scope baseline.

Do not necessarily create another giant persistent Project duplicate unless required.

Exact persistence belongs to Phase 3D.

---

## ChangeImpactAssessment

First-class/history-aware assessment is useful because impact can change as the proposal is revised.

Conceptually:

```text
ChangeImpactAssessment
├── id
├── changeRequestVersionId
├── schedule impact
├── resource impact
├── cost/revenue impact
├── Deliverable impact
├── workflow impact
├── risk impact
├── assumptions
├── assessedBy
├── assessedAt
├── policy/version
└── source freshness
```

---

## Impact assessment ≠ scope delta

Permanent.

### Scope delta

What changes?

### Impact assessment

What consequences will that change cause?

---

## Schedule impact ≠ actual Timeline change

Permanent.

Assessment:

> +7 days

does not update Design 118 until approved Change is applied.

---

## Resource impact ≠ ResourceAllocation

Permanent.

Assessment:

> +20 designer hours

does not allocate those hours yet.

---

## Cost impact ≠ Invoice

Permanent.

Assessment:

> +$500

does not create or modify an Invoice automatically.

---

## Commercial impact

A resolver should determine whether the proposed change requires formal commercial/legal handling.

Conceptually:

```text
NO_COMMERCIAL_CHANGE
COMMERCIAL_APPROVAL_REQUIRED
PROPOSAL_REVISION_REQUIRED
CONTRACT_AMENDMENT_REQUIRED
BILLING_CHANGE_REQUIRED
UNKNOWN
```

Exact values Phase 3D.

---

## Commercial impact ≠ commercial document state

Permanent.

---

## ApprovalRequest

Formal approval targets:

```text
ChangeRequestVersion v3
```

not mutable `ProjectChangeRequest`.

---

## AppliedProjectChange / ChangeApplication

A separate immutable application record is strongly recommended.

Conceptually:

```text
ProjectChangeApplication
├── id
├── projectChangeRequestId
├── changeRequestVersionId
├── baselineProjectRevision
├── appliedProjectRevision
├── appliedBy
├── appliedAt
├── operation outcomes
├── commercial evidence refs
└── idempotency reference
```

This proves:

> which exact approved change was actually applied.

---

## Approval ≠ Application

Absolute.

This is Design 117's strongest implementation rule.

---

## Applied ≠ completed commercial amendment universally

Change application readiness should ensure all required commercial/legal evidence exists first.

---

## Application ≠ Project stage transition

Permanent.

Project stage changes may result or become eligible separately through canonical workflow services.

---

## Change lifecycle

Conceptually:

```text
Draft
Submitted
Under Assessment
Pending Approval
Approved
Rejected
Withdrawn
Approved Pending Application
Applied
Cancelled / Superseded
```

Exact states Phase 3D.

The key is separation from version/approval/application states.

---

## Rejected ≠ Withdrawn

Permanent.

---

## Rejected ≠ Cancelled

Permanent.

---

## Approved ≠ Applied

Absolute.

---

## Applied ≠ Project completed

Permanent.

---

## Superseded version ≠ rejected version

Permanent.

---

## Change requester

Requester may be:

* internal user,
* Client-originated context,
* system/governed process.

Requester ≠ Approver.

---

## Requester ≠ ClientContact identity necessarily

If client initiated the concept through a Message/ClientRequest, preserve source lineage rather than copying actor identity incorrectly.

---

## Change reason/source

Typed source references may include:

* Client feedback,
* ProjectBlocker,
* Risk,
* Deliverable issue,
* strategy/internal decision.

These remain source context, not change identity.

---

# 4. Permissions

Design 117 should conceptually distinguish:

```text
projectChange.read
projectChange.create
projectChange.editDraft
projectChange.submit
projectChange.assessImpact
projectChange.withdraw
projectChange.cancel

projectChange.requestApproval
projectChange.apply

projectChange.commercialImpact.read
projectChange.commercialImpact.manage

projectChange.override
```

Exact permission keys belong to Phase 3D.

---

## Project read ≠ Change Request creation

Permanent.

---

## Change creation ≠ Change submission

Potentially separate.

---

## Change submission ≠ Approval

Absolute.

---

## Requester ≠ Approver

Critical separation of duties.

---

## Approver ≠ Change applier

Potentially separate.

A manager can approve a change without having permission to modify commercial or Project scope systems.

---

## Impact assessor ≠ commercial approver

Permanent.

---

## Project manager ≠ Contract amendment authority

Critical.

Operational Project authority does not automatically grant legal/commercial authority.

---

## Change apply ≠ Contract edit

Absolute.

Where Contract modification is required, canonical Contract service/permissions remain authoritative.

---

## Change apply ≠ Invoice permission

Permanent.

---

## Client approval authority remains Design 115/052

A client cannot approve a scope change merely because they can view the Project.

They must be the authorized participant in the exact ApprovalRequest.

---

## Internal user cannot impersonate Client approval

Absolute.

---

## Scope override needs elevated authority

If an emergency override exists:

it must be separately authorized, reasoned, time/context bound, and Audited.

It cannot create fake client/commercial approval evidence.

---

## Direct ChangeRequest ID reauthorizes

Permanent.

---

## Direct ChangeRequestVersion ID reauthorizes

Permanent.

---

## Direct baseline/project revision revalidated

A supplied baseline cannot bypass current Project-state checking.

---

## Cross-tenant change forbidden

All linked:

* Project,
* Client,
* Proposal,
* Contract,
* Deliverable,
* resources,
* approvals

must resolve inside the authorized tenant.

---

# 5. States

Design 117 must keep **Change Request lifecycle, Version lifecycle, impact-assessment state, Approval state, commercial readiness, application readiness, and application execution** independent.

### Change Request lifecycle

Conceptually:

```text
Draft
Submitted
Under Review
Pending Approval
Approved
Rejected
Withdrawn
Applied
Cancelled
```

### ChangeRequestVersion

```text
Draft
Submitted
Superseded
Approved
Rejected
Historical
```

### Impact assessment

```text
Not Assessed
Assessment In Progress
Assessed
Assessment Stale
Assessment Incomplete
Assessment Unavailable
```

### Commercial readiness

```text
No Commercial Action Required
Commercial Approval Required
Proposal/Contract Update Required
Billing Update Required
Commercial Requirement Satisfied
Unknown
```

### Approval

Owned by canonical Approval engine.

### Application readiness

```text
Not Ready
Ready
Blocked
Stale Baseline
Unknown
```

### Application execution

```text
Not Applied
Applying
Applied
Partially Applied / Requires Reconciliation
Failed
Outcome Unknown
```

These must never collapse into one generic `change.status`.

---

## Submitted ≠ Approved

Permanent.

---

## Approved ≠ Applied

Absolute.

---

## Applied ≠ Project completed

Permanent.

---

## Impact assessed ≠ Approved

Permanent.

---

## Impact assessed ≠ application-ready

Commercial authorization may still be missing.

---

## Client approved ≠ Contract updated

Critical.

---

## Contract amended ≠ Project scope applied

Permanent.

Both sides may be required.

---

## Proposal revised ≠ Change Request approved

Permanent.

---

## Invoice created ≠ scope applied

Permanent.

---

## Baseline stale ≠ Change rejected

Permanent.

It requires revalidation/reassessment/application handling.

---

## Partially applied ≠ Applied

Critical.

If some downstream updates succeed and others fail, the system must enter an explicit reconciliation state.

---

## Application outcome unknown ≠ not applied

Absolute.

Reconcile before retry.

---

## Rejected version ≠ entire Change Request deleted

Permanent.

A later v4 may be submitted.

---

## Withdrawn ≠ Rejected

Permanent.

---

## Superseded ≠ Rejected

Permanent.

---

## State Coverage

Design 117 inherits Design 150 plus:

```text
Change Request Loading
Change Request Available
Change Request Empty
Change Request Restricted
Change Request Partial

Change Draft
Change Submitted
Change Under Assessment
Change Pending Approval
Change Approved
Change Rejected
Change Withdrawn
Change Applied
Change Cancelled

Change Version Draft
Change Version Submitted
Change Version Approved
Change Version Rejected
Change Version Superseded
Change Version Historical

Impact Not Assessed
Impact Assessment In Progress
Impact Assessed
Impact Assessment Stale
Impact Assessment Incomplete
Impact Assessment Unavailable

Scope Impact Available
Timeline Impact Available
Resource Impact Available
Commercial Impact Available
Impact Data Partial

No Commercial Change Required
Commercial Approval Required
Proposal Revision Required
Contract Amendment Required
Billing Adjustment Required
Commercial Requirement Satisfied
Commercial Requirement Unknown

Approval Not Requested
Approval Pending
Approval Approved
Approval Rejected
Approval State Unavailable

Application Not Ready
Application Ready
Application Blocked
Application Baseline Stale
Application Readiness Unknown

Change Applying
Change Applied
Change Partially Applied
Change Application Failed
Change Application Outcome Unknown

Project Baseline Updated Elsewhere
Deliverable Updated Elsewhere
Commercial Source Updated Elsewhere
Approval Updated Elsewhere
Change Request Conflict
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize:

1. **what is changing;**
2. **against which baseline;**
3. **why;**
4. **impact;**
5. **approval/commercial readiness;**
6. **application state.**

Conceptually:

```text
Project Change Request
↓
Current baseline / version
↓
Proposed scope changes
   ├── additions
   ├── removals
   └── modifications
↓
Impact
   ├── Deliverables
   ├── Timeline
   ├── Resources
   └── Commercial
↓
Approvals
↓
Application readiness
↓
Apply approved change
```

Only frozen Design 117 elements should render.

---

## Before/after semantics should remain clear

Where frozen design visualizes scope differences:

> Current: 3 executive profiles
> Proposed: 5 executive profiles
> Delta: +2

is safer than replacing the current value visually before approval.

---

## Proposed and current states must be visually distinct

Never make an unapproved proposal look like current Project truth.

---

## Impact should be separated by domain

Correct:

> Timeline: +7 days
> Resource: +20 design hours
> Commercial: +$500 proposed

rather than one generic:

> Impact: High.

---

## Approval and application need separate indicators

Correct:

> Approved · Not yet applied

not:

> Completed.

---

## Stale baseline warning must be explicit

Example:

> Project scope changed after this version was assessed. Revalidation is required before application.

Do not silently apply against new Project state.

---

## Tablet

Following Design 152:

* proposed scope summary first,
* current/proposed differences stack,
* impact domains become cards,
* approval/commercial readiness stack,
* application action remains deliberate.

---

## Mobile

Priority:

```text
Change title
↓
What changes
↓
Current vs proposed
↓
Key impact
↓
Commercial requirement
↓
Approval state
↓
Application readiness
↓
Allowed action
```

Do not compress a desktop diff matrix horizontally.

---

## Mobile approval safety

If user can approve:

the exact ChangeRequestVersion should be explicit:

> Approve Change Request CR-20 · Version 3

not:

> Approve change.

---

## Accessibility

A change could communicate:

> Change Request CR-20 version 3 proposes adding two executive profiles to Project PR-100. The assessed impact is seven additional delivery days, twenty design hours, and five hundred dollars. Client and internal approvals are complete, but the required contract amendment has not yet been executed, so the change cannot yet be applied.

where authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical Change Control architecture

```text
Design 117
    ↓
Authenticated Workspace Context
    ↓
ProjectChangeRequestQueryService
    │
    ├── ProjectBaselineAdapter
    ├── ChangeRequestAdapter
    ├── ChangeRequestVersionAdapter
    ├── DeliverableAdapter
    ├── TimelineAdapter
    ├── ResourceAdapter
    ├── CommercialAdapter
    ├── ApprovalAdapter
    ├── Risk/BlockerAdapter
    └── ApplicationReadinessResolver
    ↓
ProjectChangeRequestView
```

Mutations go through dedicated change-control/application commands.

---

## Create Change Request

Conceptually:

```text
createProjectChangeRequest(
    projectId,
    sourceContext?,
    initialReason,
    expectedProjectRevision,
    idempotencyKey
)
```

should:

1. authenticate/authorize;
2. validate canonical Project;
3. capture source/context;
4. establish current Project baseline reference;
5. create stable ChangeRequest;
6. create initial draft version if appropriate;
7. emit Audit/outbox.

---

## Change creation idempotency

Retry must not create duplicate change-control cases for one explicit creation intent.

Do not over-dedupe distinct legitimate requested changes based merely on title similarity.

---

## Create/edit draft version

Conceptually:

```text
createChangeRequestVersion(
    changeRequestId,
    sourceVersionId?,
    expectedChangeRequestRevision,
    idempotencyKey
)
```

or targeted draft-edit commands.

---

## Draft copy isolation

If v3 is created from v2:

editing v3 must not mutate v2.

---

## Submitted version immutability

Once formally submitted for impact/approval:

material proposed scope changes should be immutable.

Revisions create another version.

---

## Baseline pinning

Every submitted ChangeRequestVersion must preserve the baseline used for its scope comparison/impact analysis.

Never evaluate:

```text
change delta vs whatever Project looks like now
```

without baseline context.

---

## Impact Assessment service

Conceptually:

```text
assessProjectChangeImpact(
    changeRequestVersionId,
    expectedVersionRevision
)
```

should evaluate against canonical sources:

* Project scope;
* Deliverables;
* Tasks/Milestones;
* Timeline;
* resource allocations/capacity;
* commercial snapshot/contract;
* risks/blockers.

---

## Impact assessment can be partially unavailable

Example:

```text
Scope impact      ✓
Timeline impact   ✓
Resource impact   ✕
Commercial impact ✓
```

Result:

> Assessment incomplete / resource impact unavailable.

Not:

> Resource impact = 0.

---

## Impact assessment freshness

Store/reconstruct source revisions:

```text
projectRevision
deliverableRevision
timelineRevision
resourceRevision
commercialRevision
```

so the system can mark an assessment stale.

---

## Reassessment

If upstream Project state changes:

do not overwrite old assessment.

Create/recompute a current assessment while preserving prior evidence where materially important.

---

## Commercial Requirement Resolver

Conceptually:

```text
ChangeCommercialRequirementResolver.resolve(
    changeRequestVersionId
)
```

determines whether exact commercial actions are required before application.

---

## Resolver must use historical agreement

Use:

* exact ProposalVersion,
* executed ContractVersion,
* Project commercial snapshot.

Do not compare only to today's Package catalog.

---

## Commercial source unavailable fails safe

Return:

```text
UNKNOWN
```

rather than assuming no commercial action required.

---

## Approval Request

Create canonical ApprovalRequest with:

```text
subject = ChangeRequestVersion v3
```

through Design 029.

---

## Approval request idempotency

One exact version/purpose must not generate duplicate equivalent active requests on retry.

---

## New ChangeRequestVersion invalidates applicability of prior approval

Correct:

```text
v3 approved
v4 created
```

v3 approval remains historical.

v4 requires fresh approval according to policy.

---

## ChangeApplicationReadinessResolver

Conceptually:

```text
ChangeApplicationReadinessResolver.resolve(versionId)
```

should validate:

1. exact version still current/eligible;
2. Project baseline compatibility;
3. current approval state;
4. required commercial/legal evidence;
5. required billing authorization;
6. source dependencies available;
7. no conflicting application already completed;
8. actor authorization.

---

## Ready ≠ Apply

Permanent.

---

## Application command

Conceptually:

```text
applyProjectChange(
    changeRequestId,
    changeRequestVersionId,
    expectedProjectRevision,
    expectedChangeRevision,
    idempotencyKey
)
```

must:

1. authenticate/authorize;
2. load exact ChangeRequestVersion;
3. fresh-evaluate readiness;
4. verify approved exact version;
5. verify baseline compatibility;
6. verify required commercial evidence;
7. establish application intent;
8. invoke canonical downstream services;
9. record all outcomes;
10. update Project change lineage;
11. mark Application applied only after required effects succeed/reconcile;
12. emit Audit/outbox.

---

## No direct generic Project patch

Prohibited pattern:

```text
PATCH /project/:id
{
  scope: ...
  tasks: ...
  deliverables: ...
  timeline: ...
  price: ...
}
```

based only on browser-provided Change Request data.

---

## Downstream services remain authoritative

Application may invoke:

```text
ProjectService
DeliverableService
Task/MilestoneService
ResourceAllocationService
Timeline/Scheduling services
```

and commercial services where explicitly authorized.

---

## Commercial document mutations remain source-domain commands

If contract amendment required:

```text
ContractService
```

owns it.

If revised Proposal required:

```text
ProposalService
```

owns it.

If billing adjustment required:

```text
Invoice/BillingService
```

owns it.

ProjectChangeApplication must never directly mutate those tables.

---

## Commercial prerequisite may be completed before Project application

Example:

```text
Change v3 approved
↓
Contract amendment executed
↓
Application readiness = READY
↓
Project scope applied
```

This is valid.

---

## Distributed application atomicity

Because multiple domains may be involved, full ACID transaction across everything may be impossible.

Use orchestration/saga-like semantics with:

* durable application record;
* idempotent downstream commands;
* per-step outcomes;
* reconciliation.

---

## Partial application must be explicit

Example:

```text
Project scope update     ✓
Deliverable creation     ✓
Resource allocation      ✕
Timeline adjustment      ?
```

Do not report:

> Applied.

Use:

> Partial application / reconciliation required.

---

## Application retry

Critical.

Retry must not:

* add duplicate Deliverables;
* duplicate Tasks;
* add time twice;
* allocate resources twice;
* invoice twice.

Each downstream operation needs stable application lineage/idempotency keys.

---

## Application outcome unknown

If response is lost:

reconcile by:

```text
ChangeApplication.id
```

before retrying.

---

## Baseline conflict

Example:

```text
Change v3 assessed at Project revision 42.

Before application:
Project revision becomes 47
because another Change v2 applied.
```

Application must detect conflict.

Correct:

> Revalidate/rebase/reassess.

Incorrect:

> blindly apply v3 delta.

---

## Rebase ≠ silent baseline update

If a Change must be reworked against a new baseline:

create a revised ChangeRequestVersion or explicit revalidation record.

Do not silently edit approved v3's baseline.

---

## Competing Change Requests

Two approved changes may conflict.

Application readiness must consider:

* changed baseline;
* overlapping Deliverables/scope;
* timeline/resource collisions.

Do not assume approvals make changes commutative.

---

## Deliverable application

If approved change adds/removes/modifies Deliverables:

use Design 114 `ProjectDeliverableService`.

Removal should preserve historical Deliverable evidence.

Do not hard delete delivered/approved artifacts.

---

## Task/Milestone application

Use canonical Task/Milestone services.

Template/proposal change must not create duplicate runtime work.

---

## Resource application

Use Design 112 ResourceAllocationService.

Capacity should be revalidated at **application time**, not only assessment time.

---

## Timeline integration

Design 118 consumes actual applied schedule changes.

An assessment:

> +7 days

remains proposed until application.

---

## Risk integration

Change application can:

* mitigate Risk,
* resolve/alter Blocker context,
* create new risk evidence.

But Risk/Blocker services remain authoritative.

---

## ClientRequest integration

A client scope request may be source evidence.

Completing or approving a ProjectChangeRequest does not mark an unrelated ClientRequest fulfilled unless explicit source-policy semantics say so.

---

## Approval integration

Approval remains exact-version.

Change application should store:

```text
approvalRequestId / approval evidence
```

used for readiness.

---

## Contract lineage

If application relied on:

```text
ContractVersion CV-4
```

the ChangeApplication should preserve that exact legal evidence.

Later CV-5 does not rewrite application history.

---

## Billing integration

Commercial impact may result in:

* new Invoice,
* adjusted Invoice/line item,
* credit/debit,

according to canonical billing rules.

Never manipulate money from the Project Change Request directly.

---

## Money/currency safety

Impact estimates and approved commercial changes must use decimal-safe amount/currency handling.

Estimate ≠ billed amount ≠ paid amount.

---

## Estimate ≠ commercial authorization

Critical.

A $500 impact estimate does not mean the client agreed to pay $500.

---

## Approval ≠ payment

Permanent.

---

## Change application event

Useful event:

```text
ProjectChangeApplied
```

with exact:

* Project;
* ChangeRequest;
* ChangeRequestVersion;
* Application;
* baseline/applied revisions;
* commercial evidence.

---

## Activity

Design 119 may project:

```text
ChangeRequested
ChangeVersionSubmitted
ChangeImpactAssessed
ChangeApproved
ChangeRejected
ChangeApplied
```

Activity remains projection.

---

## Audit

Material actions should include:

* Change creation/version edits;
* submission;
* impact assessment approval/manual changes;
* withdrawal/cancellation;
* formal approval references;
* Application attempt/result;
* emergency override;
* commercial evidence linking.

---

## Notifications

Design 080 may notify:

* new Change Request;
* assessment required;
* approval required;
* commercial action required;
* change applied/failed.

Notification state does not alter change lifecycle.

---

## Search

Design 079 may index safe:

* Change Request title/reference;
* Project;
* lifecycle;
* current version.

Search never becomes scope/application authority.

---

## Caching

Change workspace caches should vary by:

```text
organizationMembershipId
projectId
authorizationRevision
projectRevision
changeRequestRevision
changeVersionRevision
impactAssessmentRevision
approvalRevision
commercialRevision
deliverable/timeline/resource revisions
```

---

## Cached READY is never Application authority

Fresh application-time validation is mandatory.

---

## Performance

Use:

* Project-scoped ChangeRequest indexes;
* compact current version/approval/impact summaries;
* batched affected Deliverables/resources;
* lazy full version/assessment/history;
* no complete Project clone per list row.

---

## Partial failure contract

Example:

```text
Change core          ✓
Project baseline     ✓
Deliverables         ✓
Timeline             ✓
Resources            ✕
Commercial source    ✓
Approval             ✓
```

Correct:

> Change Request v3 is available and approved, but resource impact/readiness cannot currently be verified. Application remains blocked/unknown.

Incorrect:

> Ready to apply.

Another:

```text
Project update       ✓
Deliverable update   ✓
Resource update      ✕
```

Correct:

> Change application partially completed and requires reconciliation.

Incorrect:

> Failed — try Apply again

because blind retry could duplicate successful operations.

---

## Backend Requirement Matrix

| Requirement                                          | Status                                 |
| ---------------------------------------------------- | -------------------------------------- |
| Canonical Project reuse from 023                     | **Critical**                           |
| ProjectChangeRequest/Project separation              | **Critical**                           |
| ProjectChangeRequest/ChangeRequestVersion separation | **Critical**                           |
| Proposed delta/current Project state separation      | **Critical**                           |
| Baseline/version pinning                             | **Critical**                           |
| Draft/submitted/approved/applied version separation  | **Critical**                           |
| Submitted version immutability                       | **Critical**                           |
| Change Impact/Scope Delta separation                 | **Critical**                           |
| Schedule impact/Timeline mutation separation         | **Critical**                           |
| Resource impact/Allocation separation                | **Critical**                           |
| Cost estimate/Invoice separation                     | **Critical**                           |
| ClientRequest/ChangeRequest separation               | **Critical**                           |
| Risk/Blocker/ChangeRequest separation                | **Critical**                           |
| Task/ChangeRequest separation                        | **Critical**                           |
| Deliverable proposal/runtime Deliverable separation  | **Critical**                           |
| ChangeRequest/Contract amendment separation          | **Critical**                           |
| ChangeRequest/ProposalVersion separation             | **Critical**                           |
| ChangeRequest/Billing adjustment separation          | **Critical**                           |
| Exact ChangeRequestVersion Approval                  | **Critical**                           |
| New version does not inherit Approval                | **Critical**                           |
| Approval/Application separation                      | **Critical**                           |
| Application/Project stage separation                 | **Critical**                           |
| Commercial Requirement resolver                      | **Critical**                           |
| Current catalog/historical agreement separation      | **Critical**                           |
| Impact assessment source freshness                   | **Critical**                           |
| Assessment stale state                               | **Critical**                           |
| ChangeApplicationReadiness resolver                  | **Critical**                           |
| Fresh readiness before Apply                         | **Critical**                           |
| Baseline conflict detection                          | **Critical**                           |
| Competing change conflict detection                  | **Critical**                           |
| AppliedProjectChange/Application record              | **Critical**                           |
| Application idempotency                              | **Critical**                           |
| Downstream command idempotency                       | **Critical**                           |
| Partial application reconciliation                   | **Critical**                           |
| Unknown application outcome reconciliation           | **Critical**                           |
| Rebase does not rewrite approved version             | **Critical**                           |
| Design 114 Deliverable reuse                         | **Critical**                           |
| Design 111 Task/Milestone reuse                      | **Critical**                           |
| Design 112 Resource reuse                            | **Critical**                           |
| Design 113 Risk/Blocker reuse                        | **Critical**                           |
| Design 115 Approval reuse                            | **Critical**                           |
| Design 116 ClientRequest reuse                       | **Critical**                           |
| Design 118 Timeline reuse                            | **Critical architecture**              |
| Design 119 Activity reuse                            | **Critical architecture**              |
| Design 120 Closeout separation                       | **Critical architecture**              |
| Contract/Proposal/Billing service boundaries         | **Critical**                           |
| Decimal-safe commercial amounts                      | **Critical if monetary impact exists** |
| Estimate/approved/billed/paid separation             | **Critical**                           |
| Cross-tenant references prohibited                   | **Critical**                           |
| Permission-safe impact/commercial summaries          | **Critical**                           |
| Optimistic concurrency                               | **Critical**                           |
| Audit/outbox integration                             | **Required**                           |
| Partial dependency failure handling                  | **Critical**                           |

---

# 8. Consolidation

Design 117 exposes one of the highest governance risks in the Project domain because it sits between **client requests, operational scope, commercial/legal agreements, approvals, and runtime delivery**.

**ProjectChangeRequest / Project conflation**
Proposed state becomes current Project state.

**Change Request / generic edit form conflation**
Users bypass change control by editing Project directly.

**Change Request / ClientRequest conflation**
Client obligation and scope-change governance collapse.

**Client feedback / Change Request conflation**
Casual message changes contractual delivery.

**ProjectRisk / Change Request conflation**
Possible problem becomes scope modification automatically.

**ProjectBlocker / Change Request conflation**
Current obstacle directly changes Project scope.

**Mitigation Task / Change Request conflation**
Internal corrective work becomes contract/scope change.

**ChangeRequest / ChangeRequestVersion conflation**
Revisions overwrite historical proposals.

**Latest draft / submitted version conflation**
Approval evaluates changing content.

**Latest draft / approved version conflation**
Unapproved edits inherit authority.

**Approved version / applied version conflation**
Green badge means Project already changed.

**Applied version / latest Change version conflation**
Later drafts rewrite what was actually applied.

**Submitted version mutation**
Approvers authorize one thing but system applies another.

**Scope delta / entire Project clone conflation**
Application can overwrite unrelated Project changes.

**Proposed delta / current scope conflation**
Unapproved additions appear in Project operations.

**Baseline / current Project revision conflation**
Stale changes apply blindly.

**Baseline stale / rejected conflation**
Valid change request is discarded instead of reassessed.

**Silent rebase / approved-version mutation conflation**
Approved proposal meaning changes retroactively.

**Impact assessment / Scope delta conflation**
“What changes” and “what it causes” become inseparable.

**Impact assessment / actual mutation conflation**
Estimating +7 days changes Timeline.

**Schedule impact / Timeline conflation**
Proposed dates become operational dates.

**Resource impact / ResourceAllocation conflation**
Estimated staffing demand reserves resources immediately.

**Cost impact / Invoice conflation**
Estimate becomes billing.

**Estimate / approved commercial amount conflation**
Client is charged before agreement.

**Approved amount / billed amount conflation**
Commercial authorization becomes Invoice state.

**Billed amount / paid amount conflation**
Payment status is inferred.

**Package / Project scope conflation**
Current catalog modifies Project change baseline.

**Current Proposal / original agreed ProposalVersion conflation**
Historical commercial truth changes.

**Current Contract / executed ContractVersion conflation**
Wrong legal baseline is assessed.

**ChangeRequest / Contract amendment conflation**
Operational approval is mistaken for legal modification.

**Change approved / Contract amended conflation**
Formal legal work is skipped.

**Contract amended / Project applied conflation**
Legal agreement changes but operational Project remains stale.

**ChangeRequest / Proposal revision conflation**
Sales document and delivery governance become one entity.

**ChangeRequest / Invoice adjustment conflation**
Project manager gains billing mutation.

**ApprovalRequest / ChangeRequest status conflation**
One generic approved flag replaces exact Approval workflow.

**Approval of v2 / approval of v3 conflation**
Revision inherits old approval.

**Requester / Approver conflation**
User approves own scope expansion automatically.

**Approver / Change applier conflation**
Governance authority and system mutation privilege merge.

**Project owner / Contract authority conflation**
Operational role becomes legal authority.

**Client Project access / client scope-approval authority conflation**
Any Portal user can agree to changed commercial terms.

**Internal user / client approver impersonation conflation**
Team fabricates consent.

**Deliverable proposal / runtime Deliverable conflation**
Unapproved output appears in Project Files.

**Deliverable removal proposal / hard delete conflation**
Historical delivered artifact disappears.

**Task impact / runtime Task creation conflation**
Estimated work appears before change approved.

**Milestone impact / runtime Milestone creation conflation**
Project work plan changes prematurely.

**Resource estimate / allocation booking conflation**
Capacity is consumed before approval.

**Timeline estimate / schedule commitment conflation**
Projected delay becomes actual schedule.

**Risk mitigation / scope application conflation**
Closing Risk directly changes Project.

**Blocker resolved / Change applied conflation**
Issue management bypasses change application.

**ClientRequest fulfilled / Change approved conflation**
Client action becomes formal scope consent.

**Approval passed / Apply automatically conflation**
Commercial prerequisites are bypassed.

**Apply / Project stage transition conflation**
Scope update also advances workflow invisibly.

**Apply / Project completion conflation**
Change application closes Project.

**Application outcome unknown / not applied conflation**
Retry duplicates scope changes.

**Partial application / failed application conflation**
Successful downstream mutations repeat.

**Application retry / duplicate Deliverables conflation**
Outputs duplicate.

**Application retry / duplicate Tasks conflation**
Work duplicates.

**Application retry / duplicate allocation conflation**
Capacity doubles.

**Application retry / duplicate Invoice conflation**
Client billed twice.

**Competing approved Changes / commutative assumption**
Two changes overwrite each other's baseline.

**Generic Project Scope JSON replacement**
Unrelated scope/history is lost.

**Generic `change.status`**
Draft, approval, commercial, application and baseline freshness collapse.

**Generic Change mega-PATCH**
Project, Contract, Deliverables, Tasks, resources and Invoice mutate together.

**117/023 duplicate Project scope backend**
Change workspace stores alternate Project state.

**117/018–020 duplicate commercial backend**
Change workspace owns Proposal/Contract/Invoice mutations.

**117/104–105 current catalog leakage**
Current Package overwrites Project agreement.

**117/111 duplicate Task/Milestone state**
Impact analysis becomes runtime work.

**117/112 duplicate ResourceAllocation state**
Estimated resource impact becomes actual allocation.

**117/113 duplicate Risk/Blocker state**
Change reason becomes issue backend.

**117/114 duplicate Deliverable state**
Proposed deliverables become current outputs.

**117/115 duplicate Approval state**
Change has its own approval boolean.

**117/116 duplicate ClientRequest state**
Client change request and client obligation collapse.

**117/118 duplicate Timeline state**
Assessment dates become actual schedule.

**117/119 duplicate history state**
Activity feed becomes change-control evidence.

**117/120 duplicate closeout logic**
Applied change automatically completes Project.

No additional screen is required.

These are **Project scope governance, versioned change proposals, baseline integrity, impact assessment, commercial/legal separation, exact-version approval, application orchestration, idempotency, reconciliation, concurrency, and historical-accountability requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PROJECT CHANGE REQUEST, VERSIONED SCOPE-DELTA, IMPACT & GOVERNED APPLICATION ANCHOR**

**Domain directive:**
**ProjectChangeRequest ≠ ChangeRequestVersion ≠ ProposedScopeDelta ≠ ChangeImpactAssessment ≠ ApprovalRequest/Decision ≠ AppliedProjectChange ≠ ProjectCurrentScope ≠ ClientRequest ≠ Risk/Blocker ≠ Task ≠ Deliverable ≠ Proposal/Contract/Invoice Amendment ≠ ProjectStage ≠ ProjectLifecycle.**

**Project directive:**
Design 023 remains the single canonical Project. Design 117 proposes and applies governed modifications to that same Project and never establishes a second “changed Project” identity.

**Change-request directive:**
`ProjectChangeRequest` is the stable governance case; `ChangeRequestVersion` is the exact proposed change content. These identities remain distinct.

**Version directive:**
draft, submitted, approved, rejected, superseded and applied ChangeRequestVersions remain historically identifiable. Material submitted/approved versions are immutable.

**No-inheritance directive:**
Approval of Change v3 applies only to v3. Creating v4 never transfers v3's Approval or commercial authorization.

**Current-version directive:**
latest draft, currently submitted version, approved version and applied version may all legitimately differ and must be stored/resolved explicitly.

**Scope-delta directive:**
Change versions describe precise intended additions/removals/modifications relative to a known baseline rather than replacing the entire Project with a browser-submitted object.

**Baseline directive:**
each submitted ChangeRequestVersion pins the Project baseline/revision used for assessment. Application must detect stale/conflicting baselines rather than blindly replaying old changes.

**Rebase directive:**
revalidation against a new Project baseline cannot silently modify an approved ChangeRequestVersion. Meaningful rebasing/revision produces new versioned evidence.

**Impact directive:**
`ChangeImpactAssessment` remains distinct from proposed scope and evaluates schedule, Deliverables, resources, workflow, risk and commercial consequences using canonical source data.

**Freshness directive:**
impact assessments retain relevant source revision/freshness evidence. Upstream Project/Deliverable/resource/commercial changes can make an assessment stale without rewriting its history.

**Timeline directive:**
timeline impact remains proposed until Change Application. Design 118 remains authoritative for actual Project schedule state.

**Resource directive:**
resource impact is an estimate/planning result. Actual ResourceAllocation changes occur only through Design 112's canonical service during application.

**Deliverable directive:**
proposed Deliverable changes remain inside the Change version until approved/applied. Design 114 remains authoritative for runtime Deliverable identity/artifact state.

**Task directive:**
estimated Tasks/Milestones are impact information. Actual runtime work is created/updated only through canonical Design 111 services during application.

**Client-request directive:**
Design 116 remains canonical for things owed by the Client. Client feedback/request may originate a Change Request but never directly rewrites Project scope.

**Risk directive:**
Design 113 remains canonical for Risks/Blockers. Risk/Blocker may motivate a Change Request but cannot mutate scope itself.

**Approval directive:**
Designs 029/115 remain authoritative for formal approval. Approval targets one exact ChangeRequestVersion and never a mutable ChangeRequest pointer.

**Approval/application directive:**
Approval means the exact proposed Change is authorized. It does not mean that the Project has already been changed.

**Commercial directive:**
one centralized resolver determines whether a Change requires Proposal revision, Contract amendment, billing adjustment or other commercial authorization based on exact historical agreement evidence.

**Historical-commercial directive:**
current Product/Package catalog definitions never determine existing Project change obligations when an exact ProposalVersion/ContractVersion/commercial snapshot exists.

**Contract directive:**
ProjectChangeRequest is not a Contract amendment. If legal terms must change, the canonical Contract domain produces exact new/amended ContractVersion evidence.

**Proposal directive:**
ProjectChangeRequest is not a ProposalVersion. Sales/commercial revision remains canonical Design 018 logic.

**Billing directive:**
estimated/approved change value, invoiced amount, payment and settlement remain distinct. Project Change services never directly manufacture payment state.

**Money directive:**
all monetary impact uses decimal-safe amount/currency semantics and preserves estimate vs approved vs billed vs paid distinctions.

**Readiness directive:**
`ChangeApplicationReadinessResolver` freshly verifies exact approved version, baseline compatibility, commercial/legal evidence, billing prerequisites where applicable, source availability and actor authorization before mutation.

**Apply directive:**
application is an explicit authorized command operating on one exact ChangeRequestVersion. Browser `approved=true` or cached ready state is never sufficient.

**Application-record directive:**
a durable `ProjectChangeApplication` or equivalent immutable application record proves which exact change was applied, against what baseline, by whom, when, and with which downstream outcomes/evidence.

**Application-idempotency directive:**
repeated Apply calls resolve to the same application intent/result. They cannot duplicate Deliverables, Tasks, allocations, commercial documents or billing effects.

**Distributed-application directive:**
cross-domain application uses durable orchestration with idempotent downstream commands and reconciliation rather than pretending a multi-system change is one fragile giant transaction.

**Partial-application directive:**
if only some downstream operations succeed, state is explicitly `partial/reconciliation required`. The system must never report fully applied or blindly restart all operations.

**Unknown-outcome directive:**
if application may have committed but the response was lost, reconcile by Application ID/idempotency lineage before retrying.

**Concurrency directive:**
Project revision, Change version revision, Approval state and application intent use optimistic/transactional safeguards. Concurrent Project changes cannot silently overwrite one another.

**Competing-change directive:**
several approved Change Requests may conflict. Approval alone does not guarantee they are mutually compatible; application readiness must revalidate current baseline and overlapping scope/resource/timeline effects.

**No-generic-patch directive:**
Design 117 cannot send one generic nested payload that directly rewrites Project, Contract, Invoice, Deliverables, Tasks, resources and schedule. Each canonical domain remains authoritative.

**Stage directive:**
applying scope changes does not automatically perform Project workflow transitions unless an explicit governed Project transition operation separately occurs.

**Closeout directive:**
Design 120 remains Project completion authority. Applying, rejecting, or withdrawing a Change Request never completes the Project automatically.

**Identity directive:**
requester, impact assessor, approver, commercial approver and change applier are distinct operational/security responsibilities and cannot be inferred from one Project role.

**Client-authority directive:**
Client Project access does not imply scope-change approval authority. Exact authorized Client ApprovalParticipants decide through canonical Approval workflows.

**Override directive:**
if emergency change override exists, it requires elevated authority, exact scope, reason and Audit evidence and never creates fake client/legal approval records.

**Tenant directive:**
Project, Change Request/version, Client, Deliverables, Approval, Proposal, Contract, resources and billing references remain strictly tenant-scoped.

**Caching directive:**
change-control caches vary by authorization, Project baseline, Change/version, assessment, Approval, commercial, Deliverable/resource/timeline revisions. Cached `READY` never authorizes application.

**Partial-failure directive:**
Project baseline, impact domains, Approval, commercial/legal evidence, resources, Deliverables and Timeline may fail independently. `Unavailable` never becomes `no impact`, `approved`, `commercially clear`, or `ready to apply`.

**Performance directive:**
use Project-scoped ChangeRequest/version indexes, compact current approval/assessment/application summaries, batched impacted-resource/deliverable reads and lazy full version/history loading rather than duplicating entire Project snapshots repeatedly.

**Activity directive:**
Design 119 may project change request creation, approval and application events but Activity never substitutes for immutable ChangeRequestVersion, Approval or Application records.

**Audit directive:**
Change creation/versioning, submission, material impact assessment, approval references, withdrawal/cancellation, commercial evidence, application attempts/results, partial reconciliation and overrides generate actor/version/source-aware Audit evidence.

**Future-reuse directive:**
Design **118 — Project Timeline / Gantt Detail** must visualize the **current applied Project schedule and canonical Tasks/Milestones**, while separately identifying proposed schedule impact from unapplied Change Requests where the frozen design supports it. Gantt edits must never apply a Project Change Request implicitly.

**Overlap directive:**
Designs **018–020, 023, 029, 104–120** must preserve one continuous **historical commercial agreement + current Project baseline → ProjectChangeRequest → exact ChangeRequestVersion → impact assessment → exact approval/commercial authorization → durable ChangeApplication → canonical Project/Deliverable/Task/Resource/Timeline mutations** lineage while keeping proposals, contracts, invoices, risks, client dependencies, approvals and current Project state independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE PROJECT CHANGE-CONTROL FOUNDATION — STABLE PROJECTCHANGEREQUEST IDENTITY + IMMUTABLE SUBMITTED CHANGEREQUESTVERSIONS + PRECISE BASELINE-BOUND SCOPE DELTAS + VERSION/FRESHNESS-AWARE IMPACT ASSESSMENTS + EXACT DESIGN-029 APPROVAL OF THE PROPOSED VERSION + HISTORICAL COMMERCIAL/CONTRACT REQUIREMENT RESOLUTION + DISTINCT APPROVED/APPLIED STATE + DURABLE IDEMPOTENT CHANGEAPPLICATION ORCHESTRATION + BASELINE CONFLICT DETECTION + PARTIAL-APPLICATION RECONCILIATION + CANONICAL DOWNSTREAM SERVICE MUTATIONS + NON-DESTRUCTIVE HISTORY — AND NEVER ALLOW CLIENT FEEDBACK, PROJECT BLOCKERS, CURRENT PACKAGE DATA, IMPACT ESTIMATES, APPROVAL BADGES, STALE BASELINES, GANTT DRAGS OR GENERIC PROJECT PATCHES TO SUBSTITUTE FOR OR REWRITE CANONICAL PROJECT SCOPE, COMMERCIAL AGREEMENT, DELIVERABLE, RESOURCE, BILLING OR APPLICATION TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **117 / 153** |
| **PASS**                                   |                        **117** |
| **STANDARDIZE decisions**                  |                        **115** |
| **Potential implementation-overlap flags** |                        **108** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**117 / 153 = 76.5% audited.**

### Canonical Project change-control architecture after Design 117

```text
PROJECT PR-100
Baseline revision 42
        │
        ↓
Change Request CR-20
        │
        ├── v1 historical
        ├── v2 rejected
        └── v3 submitted
                 │
                 ├── Scope delta
                 ├── Timeline +7 days
                 ├── Resource +20 hours
                 ├── Commercial +$500 estimate
                 └── Impact Assessment
                           │
                           ↓
                   ApprovalRequest A-10
                           │
                           ↓
                        APPROVED
                           │
                           ↓
                   Commercial checks
                           │
                           ↓
                  Application readiness
                           │
                           ↓
                ProjectChangeApplication
                           │
              ┌────────────┼─────────────┐
              ↓            ↓             ↓
         Deliverables    Resources      Timeline
```

The strongest change-control boundary is now explicit:

```text
PROPOSED
   ≠
APPROVED
   ≠
APPLIED.
```

Exact-version approval also remains mandatory:

```text
Change v2 → APPROVED

Then v3 changes:
+ additional Deliverable
+ extra cost

RESULT:

v2 remains historically approved.

v3 is NOT approved.

Approval never transfers.
```

Commercial approval and operational application remain separate:

```text
Client approves Change v3
        ↓
Contract amendment required
        ↓
Contract amendment not yet executed

RESULT:

Change v3 = approved

Application readiness = BLOCKED

Project scope remains unchanged.
```

Baseline safety is equally important:

```text
Change v3 assessed against
Project revision 42

Another approved Change
moves Project to revision 47

Before applying v3:

system detects stale baseline
        ↓
revalidate / revise / rebase

NOT:
blindly apply v3.
```

And cross-domain application must be replay-safe:

```text
Application attempt:

Project scope       ✓
Deliverable created ✓
Resource update     ✕

RESULT:

PARTIAL / RECONCILIATION REQUIRED

NOT:

“Failed — retry everything”

because retrying everything could duplicate
the successful Deliverable change.
```

## Next Sequential Audit Target

### **Design 118 — Project Timeline / Gantt Detail**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
