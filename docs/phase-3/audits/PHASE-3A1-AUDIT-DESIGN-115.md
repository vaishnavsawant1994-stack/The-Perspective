# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 115 — Project Approval Gates / Approval History

Design 115 should become the **canonical Team Workspace Project approval-gate runtime, exact-version approval status, participant decision, gate-evaluation, and approval-history surface** for one Project.

It must reuse the single Approval engine established by Design 029, exact artifact/version lineage from Design 114, Workflow Gate definitions from Design 110, Project runtime state from Design 023, and Client Approval projections from Design 052.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **GateDefinition ≠ ProjectApprovalGateInstance ≠ GateEvaluation ≠ ApprovalRequest ≠ ApprovalParticipant ≠ ApprovalDecision ≠ ApprovalPolicy/Version ≠ ReviewSession/Comment ≠ SubjectVersion ≠ AggregateApprovalState ≠ ProjectStageTransition ≠ ProjectLifecycle ≠ ActivityEvent ≠ AuditEvent.**

The central implementation rule is:

> **A Project approval gate says that an exact Project condition or exact subject/version requires governed approval. The ApprovalRequest is the formal approval workflow used to satisfy that requirement. Individual decisions remain separate from aggregate approval state; approval always applies to the exact subject/version reviewed; and passing an approval gate never silently changes Project stage, lifecycle, Deliverable version, publication state, or client handover. New content versions require fresh evaluation and, where policy requires, a new ApprovalRequest.**

---

# 1. Classification

| Audit field                        | Classification                                                                                                                                                                                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**                      | **115**                                                                                                                                                                                                      |
| **Canonical name**                 | **Project Approval Gates / Approval History**                                                                                                                                                                |
| **Product area**                   | Team Workspace / Projects / Governance / Approvals                                                                                                                                                           |
| **User surface**                   | **Authenticated Team Workspace**                                                                                                                                                                             |
| **Screen class**                   | Project Detail Variant / Approval Governance & History Workspace                                                                                                                                             |
| **Classification**                 | **Canonical Project Approval-Gate Runtime, Exact-Version Approval & Decision-History Anchor**                                                                                                                |
| **Primary purpose**                | Show which Project gates require approval, what exact subject/version is under review, who must decide, what each participant decided, whether the gate currently passes, and the immutable approval history |
| **Primary parent**                 | **Project** — Design 023                                                                                                                                                                                     |
| **Reusable gate definition**       | **GateDefinition** — Design 110                                                                                                                                                                              |
| **Runtime gate relation**          | **ProjectApprovalGateInstance** or equivalent runtime requirement                                                                                                                                            |
| **Runtime evaluation**             | **GateEvaluation**                                                                                                                                                                                           |
| **Formal approval workflow**       | **ApprovalRequest** — Design 029                                                                                                                                                                             |
| **Participant entity**             | **ApprovalParticipant**                                                                                                                                                                                      |
| **Decision entity**                | **ApprovalDecision**                                                                                                                                                                                         |
| **Policy entity**                  | **ApprovalPolicy / ApprovalPolicyVersion**                                                                                                                                                                   |
| **Subject identity**               | typed exact `SubjectReference` + exact subject/version ID                                                                                                                                                    |
| **Artifact dependency**            | Deliverable / DraftVersion / ProofVersion / FileVersion / ReportVersion / other exact version from source domain                                                                                             |
| **Review dependency**              | Designs 049–050; Review ≠ Approval                                                                                                                                                                           |
| **Client approval dependency**     | Design 052                                                                                                                                                                                                   |
| **Workflow definition dependency** | Design 110                                                                                                                                                                                                   |
| **Project work dependency**        | Design 111                                                                                                                                                                                                   |
| **File/deliverable dependency**    | Design 114                                                                                                                                                                                                   |
| **Client request dependency**      | upcoming Design 116                                                                                                                                                                                          |
| **Timeline dependency**            | Design 118                                                                                                                                                                                                   |
| **Activity dependency**            | Design 119                                                                                                                                                                                                   |
| **Closeout dependency**            | Design 120                                                                                                                                                                                                   |
| **My Work dependency**             | Design 078                                                                                                                                                                                                   |
| **Notifications dependency**       | Design 080                                                                                                                                                                                                   |
| **Audit dependency**               | Design 039                                                                                                                                                                                                   |
| **Primary query service**          | `ProjectApprovalGateQueryService`                                                                                                                                                                            |
| **Approval engine**                | canonical `ApprovalService` from Design 029                                                                                                                                                                  |
| **Gate evaluation service**        | `ProjectApprovalGateEvaluationService`                                                                                                                                                                       |
| **Approval policy resolver**       | `ApprovalPolicyResolver`                                                                                                                                                                                     |
| **Project transition service**     | canonical Project workflow transition service, separate from Approval                                                                                                                                        |
| **Parent shell**                   | `InternalAppShell` — Design 001                                                                                                                                                                              |
| **Auth**                           | Required                                                                                                                                                                                                     |
| **Authorization**                  | Active OrganizationMembership + Project + approval/gate permissions                                                                                                                                          |
| **Implementation priority**        | **Critical Governance / Exact-Version Authorization / Workflow Safety**                                                                                                                                      |
| **Reuse level**                    | **Extremely High across Project workflows, Deliverables, Client review, closeout and publishing**                                                                                                            |

Design 115 should answer:

> **“Which approval gates apply to this Project, what exact version is each gate evaluating, who is required to decide, what decisions already exist, what is still pending or rejected, whether the gate currently passes, and what approval history proves that result?”**

Canonical composition:

```text
WorkflowTemplateVersion
        │
        ↓
GateDefinition
        │
        ↓ instantiate
ProjectApprovalGateInstance
        │
        ├── exact subject/version
        │
        ├── ApprovalPolicyVersion
        │
        └── ApprovalRequest
                 │
                 ├── ApprovalParticipant A
                 │       └── ApprovalDecision
                 │
                 ├── ApprovalParticipant B
                 │       └── ApprovalDecision
                 │
                 └── aggregate approval state
                          │
                          ↓
                    GateEvaluation
                          │
                          ↓
                 eligible Project action
                 / transition evaluation

Gate passes
    ≠
Project stage automatically changed.
```

---

# 2. Reuse

## Design 029 remains the single canonical Approval engine

This is the strongest reuse requirement.

Design 115 must not create:

```text
ProjectApproval
ProjectApprovalDecision
ProjectApprovalHistoryRecord
```

as parallel replacements for:

```text
ApprovalRequest
ApprovalParticipant
ApprovalDecision
ApprovalPolicy
```

from Design 029.

Correct:

```text
Design 115
   ↓
Project-specific projection/context
   ↓
canonical ApprovalRequest A-100
```

---

## Design 052 uses the same Approval backend

Client Portal approval is a different user surface over the same formal workflow.

Correct:

```text
Internal Team
Design 115
        │
        ↓
ApprovalRequest A-100
        ↑
        │
Client Portal
Design 052
```

The Client Portal must not maintain a separate client approval truth.

---

## Internal approval ≠ Client approval

Even though the engine is shared:

```text
Internal approval requirement
≠
Client approval requirement
```

They can differ by:

* participant set,
* policy,
* visibility,
* subject,
* authority.

Do not collapse them because both use ApprovalRequest.

---

## GateDefinition remains Design 110 configuration

Design 110 defines reusable workflow semantics such as:

> Approval required before Design Approved.

Design 115 operates the **runtime Project instance** of that requirement.

Correct:

```text
GateDefinition GD-7
      ↓ instantiate
Project PR-100
      ↓
ProjectApprovalGateInstance PG-50
```

---

## GateDefinition ≠ runtime Gate

Permanent.

The reusable definition never stores:

* actual approvers,
* actual decisions,
* actual approval timestamps,
* Project-specific pass/fail.

---

## ProjectApprovalGateInstance ≠ ApprovalRequest

Critical.

The gate answers:

> What Project condition must be satisfied?

The ApprovalRequest answers:

> What formal approval workflow is currently being performed to satisfy it?

One runtime gate may need more than one ApprovalRequest over time because:

* a new artifact version supersedes an old one,
* a request is withdrawn,
* a rejected version is revised,
* approval must be requested again.

---

## ApprovalRequest exact-version principle

Design 029 already established:

> **ApprovalRequest always targets an exact versioned subject.**

Example:

```text
Deliverable D-10

ProofVersion v7
   ↓
ApprovalRequest A-20
   ↓
APPROVED
```

Later:

```text
ProofVersion v8 created
```

Then:

```text
Approval A-20 still proves v7 approval.
```

It does **not** prove v8 approval.

---

## Design 114 exact artifact lineage must be preserved

Design 115 must consume:

```text
Deliverable
   ↓
exact ProofVersion / DraftVersion / FileVersion
```

rather than:

```text
Deliverable → latest file
```

Approval can never attach ambiguously to a mutable Deliverable pointer.

---

## Review remains separate

Designs 049–050 established:

> Review ≠ Approval.

Correct:

```text
ProofVersion v7
   ├── ReviewSession
   │      └── comments / annotations
   │
   └── ApprovalRequest
          └── formal decisions
```

Resolving all comments does not automatically create approval.

---

## Design 111 Tasks/Milestones remain separate

A Project gate may depend on:

* Milestone achieved,
* Task completion,
* Approval passed.

But:

```text
Task complete
≠
Approval
```

and:

```text
Milestone achieved
≠
ApprovalDecision
```

---

## Design 078 My Work reuses ApprovalParticipant

If the current user must approve something:

Design 078 can project:

```text
ApprovalParticipant
→ PersonalWorkQueueEntry
```

It must not create a duplicate approval Task.

---

## Notification ≠ Approval action

Design 080 can notify:

> Approval requested.

Reading/dismissing that Notification never means:

* viewed subject,
* approved,
* rejected,
* completed.

---

## Design 039 Audit remains separate

Approval history contains business approval evidence.

Audit records security/governance events.

These can overlap factually but are not the same backend.

---

# 3. Entities

## GateDefinition

Reusable design-time rule from Design 110.

Conceptually:

```text
GateDefinition
├── id
├── workflowTemplateVersionId
├── stableKey
├── gateType
├── requirement configuration
├── policy reference
├── blocking semantics
└── metadata
```

---

## GateDefinition ≠ ApprovalPolicy

Critical.

GateDefinition says:

> this Project transition/action requires approval.

ApprovalPolicy says:

> who must approve and how aggregate approval is determined.

---

## ApprovalPolicyVersion

Where approval rules can change:

```text
ApprovalPolicy
   ↓
ApprovalPolicyVersion
```

should preserve exact governance semantics.

Possible policy concepts include:

* all participants required,
* one-of-many,
* role/group requirement,
* ordering,
* quorum.

Exact policy belongs to Phase 3D.

---

## In-flight ApprovalRequest pins policy version

Critical.

If:

```text
ApprovalRequest A-10
uses ApprovalPolicyVersion P3
```

and administrator later publishes P4:

A-10 continues under P3.

Do not silently recalculate an existing approval under new policy.

---

## ProjectApprovalGateInstance

Where runtime workflow gates are persisted, it should represent the Project-specific instantiated requirement.

Conceptually:

```text
ProjectApprovalGateInstance
├── id
├── projectId
├── projectWorkflowId
├── sourceGateDefinitionId
├── sourceWorkflowTemplateVersionId
├── subject context
├── requiredApprovalPolicyVersionId
├── lifecycle / requirement context
├── createdAt
└── revision
```

If the runtime gate can be deterministically reconstructed and does not need independent persistence, Phase 3D may model it as runtime workflow configuration instead.

Do not create unnecessary persistence merely because the UI displays a gate.

---

## Gate instance ≠ ApprovalRequest

Permanent.

---

## SubjectReference

Formal approval subject must be typed and exact.

Conceptually:

```text
SubjectReference
├── subjectType
├── subjectId
├── subjectVersionId
└── Project/context provenance
```

Possible subjects:

* DraftVersion,
* ProofVersion,
* FileVersion,
* Deliverable artifact version,
* ReportVersion,
* ChangeRequestVersion,
* other versioned Project artifact.

---

## Mutable subject without version is unsafe

Avoid:

```text
subjectType = DELIVERABLE
subjectId = D-10
```

if D-10 can point to a different artifact tomorrow.

Prefer exact immutable subject/version.

---

## ApprovalRequest

Stable formal approval workflow identity.

Conceptually:

```text
ApprovalRequest
├── id
├── organizationId
├── subject reference
├── approvalPolicyVersionId
├── lifecycle
├── requestedBy
├── requestedAt
├── expiresAt?
├── supersedes / supersededBy?
├── revision
└── context
```

---

## ApprovalRequest ≠ ApprovalParticipant

Permanent.

One request can involve several participants.

---

## ApprovalParticipant

Represents one required/eligible decision role in the exact request.

Conceptually:

```text
ApprovalParticipant
├── id
├── approvalRequestId
├── participant identity/type
├── participant role/context
├── state
└── revision
```

---

## Participant ≠ User globally

A participant might represent:

* specific User,
* client signer/portal member,
* role/policy-resolved participant,

according to policy.

The Approval engine must resolve exact authorized participant identity.

---

## Participant ≠ permission

Being a participant means:

> you may/must decide on this ApprovalRequest.

It does not grant unrelated Project access.

---

## ApprovalDecision

Append-oriented formal decision.

Conceptually:

```text
ApprovalDecision
├── id
├── approvalRequestId
├── approvalParticipantId
├── decision
├── rationale/comment
├── actor identity
├── decidedAt
├── subjectVersionId
└── evidence/context
```

---

## ApprovalDecision ≠ participant state

Participant state can be derived from formal decisions/current request context.

Do not use one mutable:

```text
participant.status = APPROVED
```

as the only evidence.

---

## Decision actor must be server-derived

Never trust:

```text
approvedBy = browserUserId
```

The server determines current authenticated participant/actor.

---

## Decision applies only to exact subject version

Absolute.

---

## Individual decision ≠ aggregate approval

Critical.

Example:

```text
Participant A = APPROVED
Participant B = PENDING
```

does not mean:

```text
ApprovalRequest = APPROVED
```

unless the pinned policy explicitly requires only A.

---

## AggregateApprovalState

Should be resolved server-side:

```text
ApprovalAggregateResolver
(
  ApprovalPolicyVersion,
  participants,
  decisions
)
```

Frontend must never infer final Approval by counting green badges.

---

## Aggregate approval state ≠ Request lifecycle

Potentially distinct.

For example:

* Request lifecycle = ACTIVE
* Aggregate result = PENDING

or:

* Request lifecycle = SUPERSEDED
* historical aggregate result = APPROVED on old version

Exact storage can be normalized later.

---

## GateEvaluation

Runtime evaluation answering:

> Does this gate currently pass?

Conceptually:

```text
GateEvaluation
├── gateInstanceId
├── result
├── approvalRequestId
├── subjectVersionId
├── evaluatedAt
├── source revisions
├── freshness
└── reason
```

---

## GateEvaluation result needs UNKNOWN

At minimum conceptually:

```text
PASS
BLOCKED
UNKNOWN
```

If Approval service cannot be trusted:

`UNKNOWN`.

Never:

`PASS`.

---

## GateEvaluation ≠ ApprovalDecision

Permanent.

---

## GateEvaluation ≠ ProjectStageTransition

Permanent.

---

## ApprovalHistory

Design 115's “Approval History” should be a **read projection** over canonical records:

```text
ApprovalRequest
ApprovalParticipant
ApprovalDecision
request supersession
request withdrawal/expiry
subject versions
policy versions
```

Do not create a second mutable `ApprovalHistory` truth table just for display.

---

## History must preserve exact version transitions

Example:

```text
Proof v5
Approval A1 → REJECTED

Proof v6
Approval A2 → APPROVED

Proof v7
Approval A3 → PENDING
```

The UI/history must not reduce that to:

> Latest approval: Pending

and lose the legal/governance trail.

---

## Supersession

If a new subject version requires fresh approval:

the prior ApprovalRequest may become:

```text
SUPERSEDED
```

or remain completed historical, according to policy.

Never retarget A1 from v5 to v6.

---

## Withdrawal ≠ Rejection

Critical.

### Rejected

An authorized participant made a negative formal decision.

### Withdrawn

The requester/system intentionally ended the request before completion.

Different evidence.

---

## Expired ≠ Rejected

Permanent.

---

## Superseded ≠ Rejected

Permanent.

---

## Approval correction

If erroneous decision correction is supported:

do not delete/overwrite the original decision.

Use an explicit corrected/superseding decision or administrative correction record with reason and authority.

---

## Gate override

If exceptional gate override exists in the frozen product:

it should be separate from ApprovalDecision.

Conceptually:

```text
ProjectApprovalGateOverride
├── gateInstanceId
├── actor
├── reason
├── scope
├── createdAt
└── expiry? / revocation?
```

An override means:

> allow the Project gate despite missing/failed approval under exceptional authority.

It does **not** mean:

> ApprovalRequest was approved.

---

# 4. Permissions

Design 115 should conceptually distinguish:

```text
projectApproval.read
projectApproval.request

approvalRequest.read
approvalRequest.create
approvalRequest.withdraw

approvalDecision.submit

approvalPolicy.read

projectApprovalGate.read
projectApprovalGate.evaluate
projectApprovalGate.override

approvalHistory.read
```

Exact permission names belong to Phase 3D.

---

## Project read ≠ Approval read universally

Sensitive approval rationale may require stronger access.

---

## Approval read ≠ Approval decide

Permanent.

---

## Request approval ≠ approve request

Critical separation of duties.

A person creating an ApprovalRequest must not necessarily be able to satisfy it.

---

## Approval participant ≠ request administrator

Permanent.

---

## Participant identity must be exact

The server must validate:

* current authenticated identity,
* participant relation,
* request still active,
* exact subject/version,
* current decision eligibility.

---

## Project owner ≠ automatic approver

Permanent.

---

## Task assignee ≠ approver

Permanent.

---

## Deliverable owner ≠ approver

Permanent.

---

## Review author ≠ approver

Permanent.

---

## Client Project access ≠ client approval authority

A Client Portal user may view a Project but only explicitly authorized ApprovalParticipants can decide.

---

## Internal user cannot impersonate client approver

Absolute.

If administrative override is supported, it remains an explicit different action with audit/reason.

---

## Approver cannot change approval policy

Permanent.

---

## Approval policy admin ≠ approver

Permanent.

---

## Gate override needs elevated permission

If supported.

Ordinary:

```text
approvalDecision.submit
```

must not imply:

```text
projectApprovalGate.override
```

---

## Gate override cannot alter Approval history

Permanent.

---

## Direct ApprovalRequest ID reauthorizes

Knowing the ID grants nothing.

---

## Direct Participant ID reauthorizes

Permanent.

---

## Direct subject/version ID reauthorizes

Permanent.

---

## Cross-tenant approval prohibited

Absolute.

All of:

* Project,
* ApprovalRequest,
* participants,
* exact subject,
* policy,

must resolve inside the authorized tenant/security context.

---

## Source-domain authorization still applies

Seeing an Approval summary does not necessarily grant access to every sensitive source artifact.

Use permission-safe subject projections where necessary.

---

# 5. States

Design 115 must keep **Gate requirement state, ApprovalRequest lifecycle, participant state, individual Decision, aggregate approval state, subject-version currency, override state, and Project workflow state** separate.

### Gate evaluation

```text
Not Evaluated
Pass
Blocked
Unknown
```

### Approval request lifecycle

Conceptually:

```text
Draft / Prepared
Active / Requested
Completed
Withdrawn
Expired
Superseded
Cancelled
```

Exact enum Phase 3D.

### Participant state

```text
Pending
Viewed
Decision Submitted
Unavailable / Replaced
```

where applicable.

### Decision

```text
Approved
Rejected
Abstained / Needs Changes
```

only where supported by the final approval model.

### Aggregate approval

```text
Pending
Approved
Rejected
Blocked
Unknown
```

### Subject currency

```text
Current Subject Version
Newer Version Exists
Subject Superseded
Subject Unavailable
```

### Override

```text
No Override
Override Active
Override Expired
Override Revoked
```

if supported.

These must never collapse into one generic `approval.status`.

---

## Requested ≠ Viewed

Permanent.

---

## Viewed ≠ Approved

Permanent.

---

## Participant Approved ≠ aggregate Approved

Critical.

---

## Aggregate Approved ≠ Gate Pass universally

Other gate conditions may also exist.

Example:

```text
Approval = APPROVED
Required Deliverable readiness = BLOCKED
```

Gate remains blocked.

---

## Gate Pass ≠ Project stage transitioned

Absolute.

---

## Approval Approved ≠ Project stage moved

Absolute.

---

## Approval Approved ≠ Deliverable released

Permanent.

---

## Approval Approved ≠ Project completed

Absolute.

---

## Approval Approved ≠ Published

Permanent.

---

## Rejected ≠ Withdrawn

Permanent.

---

## Expired ≠ Rejected

Permanent.

---

## Superseded ≠ Expired

Permanent.

---

## New subject version ≠ prior Approval invalid historically

Critical.

Approval of v7 remains valid evidence **for v7**.

It simply does not satisfy v8 if the gate now evaluates v8.

---

## New subject version ≠ request retargeted

Absolute.

---

## Approval service unavailable ≠ Pending

Critical.

Pending is a known business state.

Unavailable is a dependency state.

---

## Approval service unavailable ≠ Rejected

Absolute.

---

## Policy service unavailable ≠ Gate Pass

Absolute.

---

## Participant service unavailable ≠ no approvers

Absolute.

---

## Approval History unavailable ≠ no history

Permanent.

---

## Gate override active ≠ Approval approved

Critical.

---

## State Coverage

Design 115 inherits Design 150 plus:

```text
Project Approval Workspace Loading
Project Approval Workspace Available
Project Approval Workspace Empty
Project Approval Workspace Restricted
Project Approval Workspace Partial

Approval Gate Not Evaluated
Approval Gate Pass
Approval Gate Blocked
Approval Gate Unknown

Approval Not Requested
Approval Request Prepared
Approval Requested
Approval In Progress
Approval Completed
Approval Withdrawn
Approval Expired
Approval Superseded
Approval Cancelled

Participant Pending
Participant Viewed
Participant Decision Submitted
Participant Unavailable

Decision Approved
Decision Rejected
Decision Needs Changes where supported
Decision Corrected / Superseded where supported

Aggregate Approval Pending
Aggregate Approval Approved
Aggregate Approval Rejected
Aggregate Approval Unknown

Exact Subject Version Current
Newer Subject Version Exists
Subject Version Superseded
Subject Version Restricted
Subject Version Unavailable

Internal Approval Pending
Internal Approval Complete
Client Approval Pending
Client Approval Complete

Gate Override None
Gate Override Active
Gate Override Expired
Gate Override Revoked

Approval Policy Available
Approval Policy Restricted
Approval Policy Unavailable

Approval Updated Elsewhere
Subject Version Updated Elsewhere
Participant Updated Elsewhere
Gate Evaluation Stale
Approval Conflict

Approval History Available
Approval History Restricted
Approval History Unavailable
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize:

1. **which gate is being evaluated;**
2. **which exact version is the subject;**
3. **who must decide;**
4. **individual decisions;**
5. **aggregate approval;**
6. **whether the Project gate passes;**
7. **historical requests/versions.**

Conceptually:

```text
Project Approval Gates
↓
Gate
   ├── stage/action context
   ├── exact subject/version
   ├── required policy
   ├── ApprovalRequest
   ├── participants
   ├── decisions
   ├── aggregate result
   └── gate evaluation

Approval History
   ├── v5 rejected
   ├── v6 approved
   └── v7 pending
```

Only frozen Design 115 UI elements should render.

---

## Exact subject version must remain visually explicit

Correct:

> Magazine Proof — Version 7
> Approval: Approved

Not merely:

> Magazine Proof — Approved

when Version 8 already exists.

---

## Newer-version warning is essential

Where applicable:

> Approved version: v7
> Current working version: v8
> v8 requires approval

This prevents the most dangerous approval ambiguity.

---

## Individual and aggregate states must be visually distinct

Example:

> Maya — Approved
> Client — Pending
> Overall — Pending

Do not show one green Approval badge merely because one participant approved.

---

## Internal vs Client approvals should be distinguishable

Where both exist:

> Internal Editorial Approval
> Client Final Approval

must remain separate workflows/gates.

---

## Approval History should preserve chronology + version context

Not just:

> Approved / Rejected / Pending

but conceptually:

> v5 rejected → v6 approved → v7 pending.

---

## Tablet

Following Design 152:

* gate summary remains first,
* subject/version remains visible,
* participant decisions stack,
* aggregate state remains prominent,
* history collapses into chronological cards,
* actions remain deliberate/touch-safe.

---

## Mobile

Priority:

```text
Gate
↓
Exact subject/version
↓
Overall approval state
↓
My decision/action if applicable
↓
Other participants
↓
Gate evaluation
↓
Approval history
```

Do not compress participant/decision/history data into a wide matrix.

---

## Mobile approval safety

The primary action must make the exact subject clear before decision.

Conceptually:

> Approve Proof v7

rather than:

> Approve.

---

## Accessibility

An approval gate could communicate:

> Design Approval Gate. Subject is Magazine Proof version 7. Two approvals are required. Maya approved on August 21. Client approval is pending. Overall approval is pending and the Project gate remains blocked. A newer version 8 exists and is not covered by this request.

where authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical Project Approval architecture

```text
Design 115
    ↓
Authenticated Workspace Context
    ↓
ProjectApprovalGateQueryService
    │
    ├── ProjectWorkflowAdapter
    ├── GateDefinition/RuntimeGateAdapter
    ├── SubjectVersionAdapter
    ├── ApprovalRequestAdapter
    ├── ApprovalParticipantAdapter
    ├── ApprovalDecisionAdapter
    ├── ApprovalPolicyAdapter
    ├── GateEvaluationAdapter
    └── ApprovalHistoryProjection
    ↓
ProjectApprovalGateView
```

All formal approval mutations go through canonical Design 029 services.

---

## Runtime Gate instantiation

When Project workflow is instantiated from Design 110:

```text
GateDefinition GD-10
        ↓
Project/runtime gate context
```

must preserve:

```text
sourceGateDefinitionId
sourceWorkflowTemplateVersionId
required ApprovalPolicyVersion
```

where applicable.

Later WorkflowTemplate edits never mutate this Project's gate semantics.

---

## Gate instance creation must be idempotent

Project initialization retries cannot create duplicate runtime gates for the same definition.

---

## Create ApprovalRequest command

Conceptually:

```text
createApprovalRequest(
    projectId,
    gateInstanceId?,
    exactSubjectReference,
    approvalPolicyVersionId,
    expectedSourceRevision,
    idempotencyKey
)
```

must:

1. authenticate/authorize;
2. validate Project;
3. validate exact subject/version;
4. validate gate context if present;
5. verify subject is eligible for approval;
6. resolve exact ApprovalPolicyVersion;
7. resolve required participants;
8. create ApprovalRequest;
9. create/pin participant set as policy requires;
10. emit Audit/outbox.

---

## Approval request idempotency

Critical.

Repeated click/network retry must not create several active equivalent requests for:

```text
same Project
same gate
same subject version
same approval purpose
```

unless an explicit re-request workflow is intended.

---

## Subject eligibility must be server-validated

The browser cannot submit:

```text
proofVersionId = old convenient approved-looking version
```

arbitrarily.

The server checks the gate/current business context.

---

## Do not resolve “latest” after Request creation

Absolute.

Once A-20 targets v7:

```text
A-20.subjectVersionId = v7
```

forever.

---

## Participant resolution

Use the pinned policy and authorized identities.

Do not let frontend supply arbitrary approver IDs as authoritative unless the policy explicitly allows selectable approvers and server validates them.

---

## Participant set should be historically reconstructable

If a team member changes later, the system must still know who was expected to approve A-20.

---

## Participant replacement

If supported due to employee departure/delegation:

perform an explicit policy-governed participant replacement/delegation operation.

Do not silently overwrite the participant identity.

---

## Submit decision command

Conceptually:

```text
submitApprovalDecision(
    approvalRequestId,
    decision,
    rationale?,
    expectedRequestRevision,
    idempotencyKey
)
```

must:

1. authenticate;
2. resolve actor;
3. verify actor matches an eligible current ApprovalParticipant;
4. verify request Active;
5. verify exact subject still available;
6. validate allowed decision;
7. append Decision;
8. update/recompute participant and aggregate projections;
9. emit Audit/outbox.

---

## Decision idempotency

Repeated submit caused by retry must not create duplicate equivalent Decisions.

---

## Decision correction

If supported, must use explicit correction/supersession semantics.

Never:

```text
UPDATE ApprovalDecision
SET decision='APPROVED'
```

over historical rejection with no trace.

---

## Aggregate Approval resolver

Central service:

```text
ApprovalAggregateResolver.resolve(
    approvalRequestId
)
```

uses:

* pinned policy version,
* participant set,
* decisions,
* request lifecycle.

Frontend does not calculate it.

---

## Policy determinism

For identical request/policy/decision evidence:

aggregate result must be deterministic.

---

## Policy changes do not recalculate in-flight requests silently

Critical.

---

## Gate Evaluation service

Conceptually:

```text
ProjectApprovalGateEvaluationService.evaluate(
    gateInstanceId,
    projectId
)
```

may evaluate:

```text
exact subject version
approval aggregate state
other gate conditions
override state
source freshness
```

and return:

```text
PASS
BLOCKED
UNKNOWN
```

with structured reasons.

---

## Approval aggregate ≠ Gate evaluation

Critical.

Example:

```text
Approval = APPROVED
Artifact safety = UNKNOWN
```

Gate may remain:

```text
UNKNOWN/BLOCKED
```

---

## Gate result should include structured blockers

Examples:

```text
APPROVAL_NOT_REQUESTED
APPROVAL_PENDING
APPROVAL_REJECTED
SUBJECT_VERSION_CHANGED
APPROVAL_SERVICE_UNAVAILABLE
APPROVAL_POLICY_UNAVAILABLE
REQUIRED_PARTICIPANT_PENDING
```

---

## Fresh gate evaluation before Project transition

Critical.

When the user tries to transition Project stage:

```text
transitionProjectStage(...)
```

must freshly evaluate required gates.

It must not trust Design 115's cached green badge.

---

## Approval does not itself transition Project

Correct:

```text
ApprovalDecision
        ↓
Approval aggregate changes
        ↓
Gate becomes PASS
        ↓
Project transition becomes eligible
```

Then:

```text
ProjectTransitionService
```

owns the actual stage change.

---

## Optional automated transition

If the product explicitly supports:

> transition automatically when all gates pass,

that should still be an explicit versioned workflow automation/policy invoking the canonical Project transition command.

Never an implicit database trigger hidden inside ApprovalDecision persistence.

Do not invent this feature if absent from frozen design.

---

## New subject version handling

When:

```text
Proof v8
```

supersedes v7:

the gate evaluation should recognize:

```text
approved request applies to v7
current required subject = v8
```

and return blocked/new approval required under policy.

Do not modify old request.

---

## Superseding ApprovalRequest

Conceptually:

```text
A-20 → v7 approved
A-21 → v8 pending
```

Preserve explicit lineage if:

```text
A-21 supersedes A-20 for current gate satisfaction
```

while A-20 remains historical evidence.

---

## Withdrawal command

Conceptually:

```text
withdrawApprovalRequest(
    approvalRequestId,
    reason,
    expectedRevision,
    idempotencyKey
)
```

must preserve existing decisions/history.

Withdrawal does not delete them.

---

## Expiry

If requests can expire:

expiry should be server/time-driven and distinguish:

* request expiry,
* subject expiry,
* Project deadline.

---

## Request expiry ≠ gate removed

Permanent.

The gate may simply require a new request.

---

## Approval History projection

Build history from canonical Approval data.

Conceptually:

```text
ApprovalHistoryEntry
├── requestId
├── subjectType
├── subjectVersion
├── policyVersion
├── participant decisions
├── aggregate result
├── lifecycle
├── createdAt
└── completed/supersededAt
```

This is rebuildable read data.

---

## History ordering

Use canonical event/request/decision timestamps, not frontend insertion order.

---

## Gate override

If supported:

```text
overrideProjectApprovalGate(
    gateInstanceId,
    reason,
    scope,
    expectedRevision,
    idempotencyKey
)
```

requires elevated authority.

It creates independent override evidence.

---

## Override does not create fake ApprovalDecision

Absolute.

History should be able to say:

> Approval remained rejected; gate overridden by authorized administrator.

not:

> Approved.

---

## Override expiry/revocation

If an override can expire:

Gate Evaluation must re-evaluate after expiry.

---

## Design 114 integration

When Deliverable artifact changes:

emit an event such as:

```text
DeliverableArtifactAssigned
```

that invalidates affected GateEvaluation.

Do not mutate ApprovalRequests directly.

---

## Design 111 integration

Milestone/Task events can invalidate gate state where the gate includes those requirements.

Again, no approval mutation.

---

## Design 116 integration

Client dependency completion may affect gate evaluation but remains ClientRequest truth.

---

## Design 120 integration

Project closeout can require:

```text
required Project approval gates satisfied
```

through canonical GateEvaluation.

No count of “approved” rows alone.

---

## Design 121 integration

Final handover may require exact final Deliverables with Approval gates satisfied.

It consumes exact version evidence.

---

## Publishing integration

Publication services can require a designated approved artifact/version.

They query canonical approval/gate readiness.

They do not infer approval from Deliverable labels.

---

## My Work integration

ApprovalParticipants that are currently actionable should project into Design 078.

When decision is submitted:

My Work recomputes from source ApprovalParticipant state.

---

## Notifications

Useful source events:

```text
ApprovalRequested
ApprovalDecisionSubmitted
ApprovalCompleted
ApprovalRejected
ApprovalWithdrawn
ApprovalSuperseded
ApprovalGatePassed
ApprovalGateBlocked
```

Notification state remains separate.

---

## Audit

Material events should preserve:

* request creation,
* participant resolution/change,
* individual decision,
* correction,
* withdrawal,
* supersession,
* override,
* policy/version context.

---

## Audit ≠ Approval History

Approval History is user-facing formal workflow history.

Audit is governance/security evidence.

Both may reference the same business action.

---

## Activity

Design 119 can show:

> Client approved Proof v7.

But Activity is a projection, never formal approval evidence.

---

## Concurrency

Critical race examples:

### Two approvers decide simultaneously

Both decisions should append safely.

Aggregate resolver processes the resulting evidence deterministically.

### New subject version arrives while approval is submitted

The Decision still applies to its exact request/version.

Gate Evaluation then determines whether that request still satisfies the current gate.

### Withdrawal vs decision

Use expected revision/transaction rules so final lifecycle is deterministic and historical evidence preserved.

---

## Approval decision outcome unknown

If request reached server/provider but response was lost:

idempotency key must reconcile before user retries.

---

## External approval provider

If future approvals integrate external signing/review platforms:

normalize provider evidence into canonical Approval entities.

Do not create:

```text
ProviderProjectApproval
```

as a second truth.

---

## Caching

Project Approval caches should vary by:

```text
organizationMembershipId
projectId
authorizationRevision
projectWorkflowRevision
gateRevision
subjectVersionRevision
approvalRequestRevision
participant/decision revision
policyVersion
override revision
```

---

## Cached PASS is never transition authority

Project transition re-evaluates.

---

## Performance

Use:

* Project-scoped gate indexes,
* batched ApprovalRequest/participant/decision loading,
* latest/current request pointers where safe,
* lazy full historical decision evidence,
* no per-gate N+1 participant/policy calls.

---

## Partial failure contract

Example:

```text
Project             ✓
Gate definitions    ✓
Subject versions    ✓
Approval requests   ✓
Participant service ✓
Policy service      ✕
```

Correct:

> Approval evidence available; current aggregate/gate evaluation cannot be fully verified because policy resolution is unavailable.

Incorrect:

> Approved.

Another:

```text
Approval core       ✓
Artifact service    ✕
```

Correct:

> Approval v7 exists; current subject-version applicability cannot be verified.

Not:

> Gate passed.

---

## Backend Requirement Matrix

| Requirement                                         | Status                    |
| --------------------------------------------------- | ------------------------- |
| Design 029 canonical Approval engine reuse          | **Critical**              |
| Design 052 same Approval backend reuse              | **Critical**              |
| Internal/Client approval separation                 | **Critical**              |
| GateDefinition/runtime gate separation              | **Critical**              |
| Gate instance/ApprovalRequest separation            | **Critical**              |
| GateEvaluation/Approval aggregate separation        | **Critical**              |
| ApprovalRequest/Participant separation              | **Critical**              |
| Participant/Decision separation                     | **Critical**              |
| Individual Decision/Aggregate state separation      | **Critical**              |
| ApprovalPolicy/ApprovalPolicyVersion separation     | **Critical**              |
| In-flight request policy-version pinning            | **Critical**              |
| Typed exact SubjectReference                        | **Critical**              |
| Exact subject-version approval                      | **Critical**              |
| Mutable Deliverable/latest-file approval prohibited | **Critical**              |
| Design 114 exact artifact reuse                     | **Critical**              |
| Review/Approval separation                          | **Critical**              |
| Approval/ProjectStageTransition separation          | **Critical**              |
| Approval/Deliverable release separation             | **Critical**              |
| Approval/Publication separation                     | **Critical**              |
| Approval/Project completion separation              | **Critical**              |
| New version does not inherit approval               | **Critical**              |
| ApprovalRequest never retargeted                    | **Critical**              |
| Approval supersession lineage                       | **Critical**              |
| Withdrawal/Rejection separation                     | **Critical**              |
| Expiry/Rejection separation                         | **Critical**              |
| Superseded/Rejection separation                     | **Critical**              |
| Append-oriented Decision history                    | **Critical**              |
| Decision correction preserves history               | **Critical if supported** |
| Server-derived decision actor                       | **Critical**              |
| Participant authorization                           | **Critical**              |
| Request creation idempotency                        | **Critical**              |
| Decision submission idempotency                     | **Critical**              |
| Gate instantiation idempotency                      | **Critical**              |
| Aggregate resolver centralized                      | **Critical**              |
| Gate evaluation centralized                         | **Critical**              |
| UNKNOWN gate state                                  | **Critical**              |
| Fresh gate check before Project transition          | **Critical**              |
| Cached PASS not mutation authority                  | **Critical**              |
| Gate override/ApprovalDecision separation           | **Critical if supported** |
| Override elevated permission/reason                 | **Critical if supported** |
| Approval History as projection                      | **Critical**              |
| Approval History/Audit separation                   | **Critical**              |
| Approval History/Activity separation                | **Critical**              |
| Design 078 My Work reuse                            | **Critical**              |
| Design 080 notification separation                  | **Critical**              |
| Design 111 work requirement reuse                   | **Critical architecture** |
| Design 116 ClientRequest reuse                      | **Critical architecture** |
| Design 118 timeline projection reuse                | **Critical architecture** |
| Design 119 Activity reuse                           | **Critical architecture** |
| Design 120 closeout reuse                           | **Critical architecture** |
| Cross-tenant approval prohibited                    | **Critical**              |
| Optimistic concurrency                              | **Critical**              |
| Permission-safe subject/history projection          | **Critical**              |
| Audit/outbox integration                            | **Required**              |
| Partial dependency failure handling                 | **Critical**              |

---

# 8. Consolidation

Design 115 creates serious architectural risk if Project gate state, Approval workflow, exact artifact versions, individual decisions, and Project transitions are flattened into one `approved` flag.

**GateDefinition / runtime gate conflation**
Reusable workflow configuration stores Project-specific state.

**Runtime gate / ApprovalRequest conflation**
Project requirement and formal approval workflow become one record.

**ApprovalRequest / ApprovalDecision conflation**
Workflow identity becomes one mutable response.

**ApprovalRequest / ApprovalParticipant conflation**
Multi-person approval becomes impossible.

**Participant / User conflation**
Global user identity becomes formal approval authority everywhere.

**Participant / Permission conflation**
Being an approver grants unrelated access.

**Participant decision / aggregate result conflation**
One person's approval closes multi-party workflow.

**Aggregate approval / request lifecycle conflation**
Pending/completed/superseded semantics collapse.

**GateEvaluation / aggregate approval conflation**
Other gate conditions are ignored.

**GateEvaluation / ProjectStageTransition conflation**
Passing a gate moves Project automatically.

**ApprovalDecision / Project stage mutation conflation**
Approver becomes workflow-transition operator implicitly.

**Approval / Project lifecycle conflation**
Approved artifact completes Project.

**Approval / Deliverable release conflation**
Formal approval exposes file to Client automatically.

**Approval / Publication conflation**
Approved artifact goes live automatically.

**Approval / Handover conflation**
Approval becomes final delivery evidence.

**Review / Approval conflation**
Resolved comments become formal authorization.

**Review comment / ApprovalDecision conflation**
Editorial feedback and governed decision lose distinction.

**Subject / exact SubjectVersion conflation**
Approval follows mutable Deliverable/file.

**Deliverable ID / approved version conflation**
New artifact silently inherits old approval.

**Latest FileVersion / approved FileVersion conflation**
Unreviewed file receives approval.

**ProofVersion / rendered derivative conflation**
Approval applies to wrong artifact identity.

**Report / ReportVersion conflation**
Changed metrics retain old approval.

**Approval v7 / approval v8 conflation**
Version history becomes unsafe.

**New version / request retargeting conflation**
Historical decision changes subject retroactively.

**New version / old request deletion conflation**
Prior approval evidence disappears.

**ApprovalPolicy / ApprovalPolicyVersion conflation**
Policy edits change past/in-flight requirements.

**Current policy / in-flight request conflation**
Approval rules shift while people are deciding.

**Policy label / policy identity conflation**
Historical governance cannot be reconstructed.

**Request creator / approver conflation**
Separation of duties disappears.

**Project owner / approver conflation**
Ownership becomes formal authorization.

**Task assignee / approver conflation**
Work responsibility becomes governance authority.

**Deliverable owner / approver conflation**
Content creator approves own output automatically.

**Internal approval / Client approval conflation**
One actor type satisfies both governance layers.

**Client Project access / Client Approval authority conflation**
Every Portal user can approve.

**Internal admin / client impersonation conflation**
Team member manufactures Client decision.

**Approved / Viewed conflation**
Opening request counts as authorization.

**Approved / Requested conflation**
Sending request counts as success.

**Rejected / Withdrawn conflation**
Negative formal decision and administrative withdrawal become indistinguishable.

**Rejected / Expired conflation**
No response becomes rejection.

**Rejected / Superseded conflation**
New version appears formally rejected.

**Accepted old version / current gate satisfied conflation**
Approval remains green after artifact changed.

**Approval service unavailable / Pending conflation**
Infrastructure outage is reported as business wait.

**Approval service unavailable / Rejected conflation**
System failure becomes negative decision.

**Policy unavailable / Gate PASS conflation**
System fails open.

**Participant resolver unavailable / no approvers conflation**
Required people disappear.

**History unavailable / no history conflation**
Governance trail appears empty.

**Approval History / duplicated event log conflation**
Second mutable approval truth drifts.

**Approval History / Audit log conflation**
Formal business history and security history merge.

**Approval History / Activity feed conflation**
Human-readable timeline replaces decision evidence.

**Decision correction / decision overwrite conflation**
Original formal decision disappears.

**Gate override / ApprovalDecision conflation**
Administrative exception falsely states approver agreed.

**Gate override / ordinary approval permission conflation**
Any approver bypasses required workflow.

**Override active / approval approved conflation**
History misrepresents actual decision.

**Gate PASS / cached badge conflation**
Stale UI authorizes transition.

**Aggregate computed in frontend**
Manipulated client decides approval result.

**Approver supplied by frontend / policy resolution conflation**
Requester chooses unauthorized approvers.

**Approval request duplicate / retry conflation**
Several active requests exist for same version.

**Decision duplicate / retry conflation**
One approver counts several times.

**Concurrent subject update / decision invalidation conflation**
Valid historical decision is lost.

**Concurrent withdrawal / decision last-write-wins conflation**
Governance result becomes nondeterministic.

**Task completed / Approval passed conflation**
Internal work bypasses formal approval.

**Milestone achieved / Approval passed conflation**
Checkpoint substitutes authorization.

**ClientRequest completed / Approval passed conflation**
Client dependency substitutes approval.

**Notification read / Approval viewed conflation**
Inbox behavior changes approval evidence.

**Notification dismissed / Approval complete conflation**
Reminder dismissal closes workflow.

**My Work item / ApprovalRequest conflation**
Personal projection becomes second approval record.

**Search index / Approval state authority conflation**
Stale indexed approval drives workflow.

**Generic `approved: boolean`**
Cannot represent multi-participant/versioned governance.

**Generic Approval mega-PATCH**
Request, participants, decisions, policy, gate and Project stage mutate together.

**115/029 duplicate Approval backend**
Project Approval and Approval Center diverge.

**115/052 duplicate Client Approval truth**
Portal and Team see different decisions.

**115/110 duplicate GateDefinition state**
Runtime surface edits template rules.

**115/111 duplicate milestone/task state**
Approval workspace owns work completion.

**115/114 duplicate artifact/version state**
Approval workspace chooses mutable latest file.

**115/116 duplicate ClientRequest state**
Approval gate stores external dependency status.

**115/118 duplicate timeline truth**
Approval dates become independent schedule data.

**115/119 duplicate history backend**
Activity feed becomes formal approval evidence.

**115/120 duplicate closeout logic**
Green approvals automatically complete Project.

No additional screen is required.

These are **Approval-engine reuse, runtime gate separation, exact-version subject integrity, policy versioning, participant/decision modeling, aggregate approval resolution, gate evaluation, history, authorization, concurrency, and Project-transition safety requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PROJECT APPROVAL-GATE RUNTIME, EXACT-VERSION DECISION & APPROVAL-HISTORY ANCHOR**

**Domain directive:**
**GateDefinition ≠ ProjectApprovalGateInstance ≠ GateEvaluation ≠ ApprovalRequest ≠ ApprovalParticipant ≠ ApprovalDecision ≠ ApprovalPolicy/Version ≠ ReviewSession/Comment ≠ SubjectVersion ≠ AggregateApprovalState ≠ ProjectStageTransition ≠ ProjectLifecycle ≠ ActivityEvent ≠ AuditEvent.**

**Approval-engine directive:**
Design 029 remains the single canonical Approval engine for Team, Project, Client, Proposal and other approval contexts. Design 115 specializes Project gate composition/history rather than creating a Project-specific approval backend.

**Portal directive:**
Design 052 consumes the same ApprovalRequest/Participant/Decision identities. Client Portal approval and internal Project approval remain separate policy/participant contexts over one engine.

**Gate-definition directive:**
Design 110's `GateDefinition` remains immutable reusable workflow configuration. Runtime Project gate state is instantiated/evaluated separately and never written back into the template.

**Runtime-gate directive:**
a Project approval gate represents a Project-specific requirement; an ApprovalRequest represents one formal attempt/workflow used to satisfy it. One gate may accumulate several historical requests across artifact versions or retries.

**Subject directive:**
every ApprovalRequest pins an exact typed immutable subject/version. Approval against a mutable Deliverable or “latest file” pointer is prohibited.

**Artifact directive:**
Design 114 remains authoritative for Deliverables and exact Draft/Proof/File/Report/artifact versions. Design 115 consumes those IDs and never re-resolves “latest” after approval creation.

**Version directive:**
Approval of v7 is evidence only for v7. Creating v8 does not invalidate v7 historically, but it prevents v7 approval from satisfying a gate that now requires v8.

**No-retarget directive:**
an ApprovalRequest is never retargeted from one version to another. New subject version means a new request where policy requires approval.

**Review directive:**
review sessions/comments and formal Approval remain separate. Resolving all review comments cannot manufacture ApprovalDecision evidence.

**Policy directive:**
ApprovalRequest pins the exact `ApprovalPolicyVersion` governing participants/quorum/decision aggregation. Later policy edits affect future requests only.

**Participant directive:**
ApprovalParticipants represent exact formal decision responsibilities and remain separate from Users, Project owners, Task assignees, Client contacts and general permissions.

**Decision directive:**
ApprovalDecision is append-oriented, actor-authenticated and exact-version bound. Formal decisions are never represented only through mutable participant-status flags.

**Aggregate directive:**
individual participant decisions and aggregate Approval result remain distinct. One centralized server-side resolver applies the pinned policy; frontend vote counting is never authoritative.

**Lifecycle directive:**
requested, viewed, participant-decided, aggregate-approved, withdrawn, expired, superseded and rejected remain independently meaningful states.

**Withdrawal directive:**
withdrawal ends an approval workflow administratively without fabricating rejection. Existing decision evidence remains historical.

**Supersession directive:**
when a newer artifact/request takes over current gate satisfaction, the old request remains immutable historical evidence rather than being rewritten or deleted.

**Correction directive:**
if formal decision correction is supported, correction preserves the original decision and records authorized superseding/corrective evidence.

**Gate-evaluation directive:**
`ProjectApprovalGateEvaluationService` combines exact approval evidence with any other configured gate requirements and returns `PASS`, `BLOCKED`, or `UNKNOWN` with structured reasons.

**Unknown-state directive:**
Approval/policy/subject service failure can never become PASS, Pending by assumption, Rejected, or no-history. Uncertainty is represented explicitly.

**Transition directive:**
Approval/Gate PASS makes a Project workflow action eligible; it does not itself execute the Project stage transition. Canonical Project workflow services own runtime transitions.

**Fresh-transition directive:**
every governed Project stage transition re-evaluates required approval gates server-side immediately before mutation. Cached green UI state is never transition authority.

**Automation directive:**
if automatic transition-after-approval is ever supported, it must be an explicit versioned automation that invokes the canonical transition service—not an implicit side effect inside ApprovalDecision persistence.

**Override directive:**
if Project gate overrides exist, they are separately authorized/reasoned Audit evidence and never rewritten into fake ApprovalDecisions or fake participant approval.

**Separation-of-duties directive:**
request creation, formal decision, policy management, gate override and Project transition permissions remain independently server-governed.

**Identity directive:**
decision actor derives from authenticated identity and exact ApprovalParticipant eligibility; browser-supplied `approvedBy` values are never trusted.

**Client-authority directive:**
Client Project access alone never grants approval authority. Only exact authorized Client ApprovalParticipants can decide through the Portal.

**No-impersonation directive:**
internal Team users cannot submit decisions as client participants. Administrative intervention, if supported, uses explicitly separate override/correction semantics.

**History directive:**
Design 115's Approval History is a rebuildable chronology over canonical requests, versions, participants, decisions, supersession, withdrawal and policy context—not a second mutable history table.

**Audit directive:**
Design 039 remains separate Audit evidence. Approval History explains formal business authorization; Audit records governed system/user actions.

**Activity directive:**
Design 119 may project approval events for human-readable Project history but Activity never substitutes for formal ApprovalRequest/Decision evidence.

**My Work directive:**
Design 078 projects actionable ApprovalParticipants from the canonical Approval engine. It never creates generic Tasks to represent formal approval.

**Notification directive:**
Design 080 notifications alert recipients about approval work but read/dismiss state never modifies approval or gate state.

**Closeout directive:**
Design 120 may require designated gates to pass before Project completion, but Approval alone never marks a Project complete.

**Handover directive:**
Design 121 may require approved exact Deliverables before handover; handover freezes the exact versions and remains a separate business event.

**Publishing directive:**
Publishing consumes exact approved publication artifacts and remains independent from Approval state. Approved does not equal published.

**Idempotency directive:**
gate instantiation, ApprovalRequest creation, Decision submission, withdrawal, supersession processing and overrides must all be replay-safe.

**Concurrency directive:**
simultaneous decisions, withdrawal, subject-version changes and policy-sensitive actions use expected revision/transaction rules so valid historical decisions are preserved and aggregate results remain deterministic.

**Tenant directive:**
Project, gate, subject, ApprovalRequest, policy, participants and decisions remain strictly tenant/security-context scoped.

**Caching directive:**
Project Approval caches vary by authorization, Project/workflow/gate/subject/request/decision/policy revisions. Cached aggregate or gate PASS is never used directly as mutation authority.

**Partial-failure directive:**
Project workflow, subject artifacts, ApprovalRequest, participants and policy resolution can fail independently. A dependency outage can never silently become Approved, Rejected, no approvers, or gate PASS.

**Performance directive:**
use Project-scoped gate/request indexes, batched participants/decisions/policies, current-request pointers where safe and lazy historical evidence rather than N+1 approval lookups.

**Future-reuse directive:**
Design **116 — Project Client Requests / Dependency Tracker** must reuse canonical `ClientRequest` entities from Design 047 and may feed Project gate evaluation as an external dependency, but it must never turn ClientRequest completion into an ApprovalDecision or create a parallel approval state.

**Overlap directive:**
Designs **023, 029, 049–052, 078, 080, 110–121** must preserve one continuous **Workflow GateDefinition → Project runtime gate → exact subject/version → ApprovalRequest → Participants → Decisions → aggregate approval → GateEvaluation → eligible Project transition / handover / closeout action** lineage while keeping review, approval, workflow transition, client dependency, release and Project lifecycle independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE PROJECT APPROVAL-GATE FOUNDATION — CANONICAL DESIGN-029 APPROVALREQUEST/PARTICIPANT/DECISION ENGINE + EXACT VERSIONED SUBJECT REFERENCES + PINNED APPROVALPOLICYVERSIONS + DISTINCT WORKFLOW GATE DEFINITIONS/RUNTIME GATES + APPEND-ORIENTED INDIVIDUAL DECISIONS + SERVER-RESOLVED AGGREGATE APPROVAL + FRESH PASS/BLOCKED/UNKNOWN GATE EVALUATION + EXPLICIT REQUEST SUPERSESSION/WITHDRAWAL + NON-DESTRUCTIVE APPROVAL HISTORY + SEPARATELY GOVERNED OVERRIDES + CANONICAL PROJECT-TRANSITION REVALIDATION — AND NEVER ALLOW MUTABLE DELIVERABLE POINTERS, “LATEST” FILES, REVIEW COMMENTS, SINGLE-PARTICIPANT BADGES, CLIENT ACCESS, CACHED GREEN STATES OR GENERIC `APPROVED` BOOLEANS TO SUBSTITUTE FOR OR REWRITE EXACT-VERSION APPROVAL, PROJECT WORKFLOW, RELEASE, HANDOVER OR CLOSEOUT TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **115 / 153** |
| **PASS**                                   |                        **115** |
| **STANDARDIZE decisions**                  |                        **113** |
| **Potential implementation-overlap flags** |                        **106** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**115 / 153 = 75.2% audited.**

### Canonical approval architecture after Design 115

```text
Workflow GateDefinition
        │
        ↓
Project Approval Gate
        │
        ↓
Exact ProofVersion v7
        │
        ↓
ApprovalRequest A-20
        │
   ┌────┴────┐
   ↓         ↓
Maya       Client
Approved   Pending
   │         │
   └────┬────┘
        ↓
Aggregate = PENDING
        ↓
Gate = BLOCKED
```

The exact-version rule is now absolute:

```text
Proof v7
   ↓
Approval A-20
   ↓
APPROVED

Later:
Proof v8 created

RESULT:

v7 remains historically APPROVED.

v8 is NOT approved.

A-20 is never retargeted.
```

Individual approval and aggregate approval remain separate:

```text
Approver A = APPROVED
Approver B = PENDING

Overall Approval
      =
PENDING

not APPROVED.
```

And Approval does not execute workflow movement:

```text
Approval becomes APPROVED
        ↓
GateEvaluation = PASS
        ↓
Project transition becomes eligible
        ↓
ProjectTransitionService
performs the actual stage change
```

Finally, history remains truthful:

```text
Proof v5 → REJECTED
Proof v6 → APPROVED
Proof v7 → PENDING

Approval History preserves all three.

It does not overwrite them with:
“Current approval = Pending.”
```

## Next Sequential Audit Target

### **Design 116 — Project Client Requests / Dependency Tracker**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
