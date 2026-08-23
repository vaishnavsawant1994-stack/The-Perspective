# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 098 — Proposal Review / Approval Detail

Design 098 should become the **canonical Team Workspace Proposal-version review and internal approval detail surface** built on the Proposal/ProposalVersion foundation from Design 018, the centralized Approval engine from Design 029, and the Proposal discovery foundation from Design 097.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary should be:

> **Proposal ≠ ProposalVersion ≠ ReviewSession ≠ ReviewComment ≠ ApprovalRequest ≠ ApprovalParticipant ≠ ApprovalDecision ≠ ApprovalPolicy ≠ AggregateApprovalState ≠ Issue/Delivery ≠ ClientAcceptance ≠ DealStage ≠ Contract.**

The central implementation rule is:

> **Proposal review and approval must always operate against one exact ProposalVersion. Review comments are discussion/evidence, not approval decisions; individual approver decisions are not the aggregate approval state; approval of one version never transfers silently to a newer version; internal approval never means the Proposal was issued, delivered, accepted by the client, or converted into a Contract.**

---

# 1. Classification

| Audit field                       | Classification                                                                                                                                                                     |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                     | **098**                                                                                                                                                                            |
| **Canonical name**                | **Proposal Review / Approval Detail**                                                                                                                                              |
| **Product area**                  | Team Workspace / Sales / Proposals / Approvals                                                                                                                                     |
| **User surface**                  | **Authenticated Team Workspace**                                                                                                                                                   |
| **Screen class**                  | Versioned Document Review / Approval Detail Workspace                                                                                                                              |
| **Classification**                | **Canonical Proposal-Version Review, Approval Decision & Commercial Release-Gate Anchor**                                                                                          |
| **Primary purpose**               | Review one exact ProposalVersion, inspect comments/context, collect governed approval decisions, and determine whether that exact version satisfies internal approval requirements |
| **Primary commercial entity**     | **Proposal** — Design 018                                                                                                                                                          |
| **Reviewed subject**              | **ProposalVersion**                                                                                                                                                                |
| **Review entity**                 | **ReviewSession**, if required by the frozen workflow                                                                                                                              |
| **Discussion entity**             | **ReviewComment / CommentThread**                                                                                                                                                  |
| **Approval entity**               | **ApprovalRequest** — Design 029                                                                                                                                                   |
| **Approver relation**             | **ApprovalParticipant**                                                                                                                                                            |
| **Decision entity**               | **ApprovalDecision**                                                                                                                                                               |
| **Approval configuration**        | **ApprovalPolicy / PolicyVersion**                                                                                                                                                 |
| **Aggregate approval projection** | **ApprovalState / ApprovalResolution**                                                                                                                                             |
| **Proposal library dependency**   | Design 097                                                                                                                                                                         |
| **Deal dependency**               | Designs 016–017 / 096                                                                                                                                                              |
| **Client acceptance dependency**  | Proposal acceptance domain from Design 018                                                                                                                                         |
| **Contract dependency**           | Designs 019 / upcoming 099–100                                                                                                                                                     |
| **Activity/Audit dependency**     | Activity projection / Design 039                                                                                                                                                   |
| **Primary query service**         | `ProposalReviewApprovalQueryService`                                                                                                                                               |
| **Approval service**              | canonical `ApprovalService` from Design 029                                                                                                                                        |
| **Proposal version service**      | `ProposalVersionService`                                                                                                                                                           |
| **Review service**                | `ProposalReviewService` if ReviewSession is canonical                                                                                                                              |
| **Parent shell**                  | `InternalAppShell` — Design 001                                                                                                                                                    |
| **Auth**                          | Required                                                                                                                                                                           |
| **Authorization**                 | OrganizationMembership + Proposal read + review + approval-decision permissions                                                                                                    |
| **Implementation priority**       | **Critical Commercial Governance / Exact-Version Approval Integrity**                                                                                                              |
| **Reuse level**                   | **Extremely High across Proposals, Contracts, publishing/review and centralized approvals**                                                                                        |

Design 098 should answer:

> **“Which exact ProposalVersion am I reviewing, what changed or requires attention, what comments exist, which approval policy applies, who is authorized to decide, what has each required participant decided, and is this exact version actually approved for the next commercial step?”**

Canonical composition:

```text
Proposal P-100
      │
      ├── ProposalVersion v2
      └── ProposalVersion v3
                 │
                 ↓
         ReviewSession / comments
                 │
                 ↓
          ApprovalRequest
                 │
        ┌────────┼─────────┐
        ↓        ↓         ↓
   Participant A B         C
        ↓        ↓         ↓
     Decision  Decision  Decision
        │        │         │
        └────────┼─────────┘
                 ↓
        AggregateApprovalState
                 │
                 ↓
          exact v3 approved
```

---

# 2. Reuse

## Design 018 remains canonical for Proposal and ProposalVersion

Design 098 must consume the exact:

```text
Proposal.id
ProposalVersion.id
```

from Design 018.

Do not create:

```text
ReviewedProposal
ApprovalProposal
ApprovedProposalRecord
ProposalApprovalDocument
```

as additional commercial entities.

---

## Design 029 remains the single Approval engine

This is critical.

Design 098 should be a Proposal-specific composition over:

```text
ApprovalRequest
ApprovalParticipant
ApprovalDecision
ApprovalPolicy
```

It must not create a Proposal-only approval backend.

---

## Design 097 remains Proposal discovery

Design 097 can show:

> Approval pending

as a derived summary.

Opening that item should resolve to the same canonical ProposalVersion and ApprovalRequest used by Design 098.

---

## Review ≠ Approval

This boundary must remain permanent.

### Review

Answers:

> What should be discussed, corrected or clarified?

### Approval

Answers:

> Is this exact version formally authorized under the configured policy?

A person can review without approving.

A person can comment without having approval authority.

---

## ReviewComment ≠ ApprovalDecision

Permanent.

Example:

> “Please change the payment term from 15 days to 30 days.”

is a ReviewComment.

It is not:

> Rejected.

unless an authorized approver separately records that decision.

---

## Design 098 ≠ Client Draft Review

Design 049 established client-side version review.

Design 098 is internal Proposal review/approval.

Do not reuse client review permissions or expose internal commercial comments to clients.

Low-level review primitives may be shared.

Business visibility remains separate.

---

## Design 052 / Design 029 approval foundation reuse

Client Approvals and internal Proposal Approvals may use the same foundational Approval engine.

But:

```text
Internal Proposal Approval
≠
Client Acceptance
```

and permissions/audiences differ.

---

## Design 096 remains Deal stage authority

Proposal approval may satisfy a Deal stage gate.

It does not directly become Deal stage.

Correct:

```text
ProposalVersion approved
        ↓
Deal gate may now evaluate PASS
        ↓
explicit DealStageTransition
```

Not:

```text
Proposal approved
→ deal.stage = Negotiation
```

---

## Contract domain remains separate

An approved ProposalVersion may later be:

* issued,
* accepted,
* converted to Contract lineage.

Approval alone does none of those things.

---

# 3. Entities

## Proposal

Proposal remains the stable commercial-document identity.

Design 098 does not approve an abstract mutable Proposal if its contents can change.

The meaningful approval subject is the exact ProposalVersion.

---

## ProposalVersion

`ProposalVersion` is the commercial artifact/content revision under review.

It contains the exact:

* line-item snapshot,
* package snapshot,
* pricing,
* currency,
* terms,
* recipient/party context where applicable,
* authored content,

established by Design 018.

---

## Approval must bind exact ProposalVersion

Correct:

```text
ApprovalRequest AR-10
subjectType = PROPOSAL_VERSION
subjectId   = PV-3
```

Not:

```text
subjectId = Proposal P-100
```

if P-100 can later contain v4.

---

## Approval v3 ≠ approval v4

Absolute.

Example:

```text
Proposal v3
$10,000
→ Approved

Proposal v4
$12,000
→ NOT APPROVED merely because v3 was.
```

---

## New version must not inherit approval silently

When material content changes and v4 is created:

v3 approval remains historical.

v4 requires the applicable approval process again.

---

## Material vs non-material metadata changes

Commercial content changes absolutely require version-aware approval.

Pure display/library metadata that does not alter the approved ProposalVersion may not require reapproval depending on canonical Proposal policy.

The exact distinction belongs to Phase 3D.

---

## ReviewSession

If the canonical workflow needs a dedicated review session, it should represent:

> a review process around one exact ProposalVersion.

Conceptually:

```text
ReviewSession
├── id
├── proposalVersionId
├── participants
├── lifecycle
├── openedAt
├── closedAt
└── revision
```

Do not create this entity merely because the UI has a “Review” section; it is only justified if review lifecycle itself is persistent.

---

## ReviewSession ≠ ApprovalRequest

Permanent.

A ReviewSession can facilitate discussion.

ApprovalRequest carries formal decision authority.

---

## ReviewSession ≠ ProposalVersion

Permanent.

---

## ReviewComment

Comments should bind:

* exact ProposalVersion,
* optionally exact section/line item/content anchor,
* author,
* time,
* visibility.

Conceptually:

```text
ReviewComment
├── id
├── proposalVersionId
├── author
├── body
├── anchor
├── visibility
├── createdAt
└── resolution context
```

---

## Comment anchor must be version-specific

If a comment refers to:

> line item #3

that anchor should not silently move to v4 where structure may differ.

---

## Comment resolved ≠ Proposal approved

Permanent.

---

## All comments resolved ≠ approval granted

Permanent.

Those may both be required conditions under policy, but they remain separate facts.

---

## ApprovalRequest

ApprovalRequest is the formal authorization workflow around exact ProposalVersion.

Conceptually:

```text
ApprovalRequest
├── id
├── subject = ProposalVersion
├── policyVersion
├── requestedBy
├── requestedAt
├── lifecycle
├── participants
└── aggregate resolution
```

---

## ApprovalRequest ≠ ApprovalDecision

Permanent.

Request = approval process.

Decision = one participant's formal decision.

---

## ApprovalRequest ≠ aggregate state

The request can contain multiple participant decisions.

Aggregate approval is resolved from them according to policy.

---

## ApprovalParticipant

Participant represents one authorized person/role in this exact approval workflow.

Conceptually:

```text
ApprovalParticipant
├── approvalRequestId
├── user/membership
├── approval role
├── order/group if required
├── participation state
└── decision eligibility
```

---

## Participant ≠ generic User permission

Being listed as an approver on AR-10 does not grant:

* Proposal edit,
* Deal edit,
* Contract authority,
* global approval access.

---

## Participant ≠ reviewer necessarily

Permanent.

A reviewer may comment but not formally approve.

An approver may be expected only to decide.

---

## ApprovalDecision

A formal decision should be append-oriented and exact-version bound.

Conceptually:

```text
ApprovalDecision
├── approvalRequestId
├── participantId
├── proposalVersionId
├── decision
├── rationale where required
├── decidedBy
├── decidedAt
└── supersession/correction lineage
```

---

## Decision actor derives from authenticated membership

Browser cannot submit:

```text
decidedBy = CFOUserId
```

as authoritative identity.

---

## Decision ≠ comment

Permanent.

---

## Decision ≠ Proposal lifecycle

Approval changes Approval state.

Proposal/version lifecycle may react through a governed Proposal command/resolver.

Do not duplicate lifecycle mutations casually.

---

## Individual approval ≠ aggregate approval

Example:

```text
Approver A = APPROVED
Approver B = PENDING

Aggregate state = PENDING
```

not:

> Approved.

---

## Individual rejection ≠ aggregate rejection universally

That depends on ApprovalPolicy.

For a unanimous policy, one rejection may reject the request.

For other policies, semantics may differ.

Therefore aggregation belongs to a centralized policy engine.

---

## ApprovalPolicy

Approval requirements should be versioned.

Conceptually:

```text
ApprovalPolicy
├── version
├── participant requirements
├── sequencing/groups
├── quorum / unanimity semantics
├── rejection semantics
├── expiry/timeout semantics
└── override rules where permitted
```

Exact policy features belong to Phase 3D.

---

## Policy changes must not rewrite an in-flight approval silently

ApprovalRequest should pin the relevant ApprovalPolicyVersion.

If policy changes tomorrow:

historical/in-flight request remains explainable under the version it was created with unless explicitly migrated.

---

## AggregateApprovalState

Aggregate state is derived/resolved from:

* ApprovalRequest lifecycle,
* participant decisions,
* policy.

Do not allow direct:

```text
approvalRequest.status = APPROVED
```

through arbitrary CRUD.

---

## Approval state ≠ Proposal issue state

Permanent.

---

## Approval state ≠ recipient acceptance

Permanent.

---

## Approval state ≠ Deal stage

Permanent.

---

## Approval state ≠ Contract state

Permanent.

---

## Approval expiry

If approval requests/decisions expire under policy:

expiry is approval-domain state.

It does not delete ProposalVersion.

---

## Approval withdrawn

If the request is withdrawn:

prior decisions remain historical.

A new approval request can later target the same or newer version according to policy.

---

## ProposalVersion superseded during review

Important.

Suppose:

```text
v3 → approval pending

before completion:
v4 created
```

v3's ApprovalRequest must not silently move to v4.

The system may:

* continue v3 review historically,
* withdraw/supersede v3 request,
* initiate a new request for v4,

according to workflow policy.

But the subject identity never changes.

---

## Approved version later superseded

Approval remains:

> v3 was approved.

It does not mean:

> current latest Proposal is approved.

---

## Issue readiness

If Design 098 shows “Ready to send” or equivalent, that should be a derived release/readiness result such as:

```text
exact version approved
AND version remains current/eligible
AND required Proposal checks pass
```

It must not be a manually editable status.

---

## Issue readiness ≠ issued

Permanent.

---

## Client acceptance

Client acceptance remains Proposal-domain external commitment on an exact issued version.

Internal approvers cannot create client acceptance.

---

## Contract

Contract creation/execution remains downstream.

Approved Proposal may never even be sent.

Therefore:

> approval ≠ Contract lineage automatically.

---

# 4. Permissions

Design 098 should conceptually distinguish:

```text
proposal.read
proposalVersion.read

proposalReview.read
proposalReview.comment
proposalReview.resolveComment

proposalApproval.read
proposalApproval.request
proposalApproval.decide
proposalApproval.withdraw

proposal.editDraft
proposal.issue
```

Exact permission names belong to Phase 3D.

---

## Proposal read ≠ commercial-detail read necessarily

Sensitive pricing/margins/terms may require narrower permission.

---

## Review read ≠ comment

Permanent.

---

## Comment ≠ approve

Critical.

---

## Proposal edit ≠ approve

Permanent.

An author must not become approver automatically unless policy explicitly permits it.

---

## Proposal owner ≠ approval authority

Permanent.

---

## Deal owner ≠ approval authority

Permanent.

---

## Approval participant membership must be server-validated

The browser cannot add itself to required approvers by manipulating participant IDs.

---

## Approval decision requires current participant eligibility

At decision time verify:

* actor membership active,
* actor corresponds to authorized participant,
* request is actionable,
* exact subject version unchanged,
* participant has not already made a non-replaceable decision.

---

## Role/job title ≠ approval role

Design 037 boundary remains.

“Director” in EmployeeProfile must never automatically imply commercial approval permission unless an explicit Role/Policy says so.

---

## Approval request creation ≠ approval decision

A Sales user may request approval without having authority to approve it.

---

## Approval ≠ issue authority

A CFO could approve pricing but not necessarily send the Proposal.

---

## Issue authority ≠ approval override

Permanent.

---

## Gate override ≠ Proposal approval override

Design 096 Deal gate override and Proposal approval are different controls.

---

## Review comments visibility

Internal comments must never leak into:

* Client Portal,
* issued Proposal artifact,
* Contract,

unless deliberately incorporated into the Proposal content.

---

## Sensitive approver rationale

Rationale/notes may require restricted internal visibility.

Do not assume every Proposal viewer can inspect executive/commercial approval reasoning.

---

## Direct ApprovalRequest ID reauthorizes

Knowing the ID grants nothing.

---

## Direct ProposalVersion ID reauthorizes

Permanent.

---

## Cross-tenant approver/reference prohibited

Absolute.

---

## Deactivated user decision history remains

If an approver later leaves the organization:

historical ApprovalDecision remains attributed to their historical identity.

Do not delete it.

They simply cannot perform future decisions.

---

# 5. States

Design 098 must keep **ProposalVersion state, review state, comment state, ApprovalRequest lifecycle, participant decision state, aggregate approval state, issue readiness, issue/delivery state and client acceptance** separate.

### ProposalVersion

Conceptually:

```text
Draft
Reviewable
Approved Version
Issued
Superseded
Historical
```

depending on canonical Design 018 lifecycle.

### Review state

```text
Not Started
In Review
Review Complete
Needs Revision
Superseded
```

where persistent review lifecycle exists.

### Comment state

```text
Open
Resolved
Reopened
```

where supported.

### ApprovalRequest lifecycle

```text
Pending
In Progress
Resolved
Withdrawn
Expired
Superseded
```

### Participant decision

```text
Pending
Approved
Rejected
Abstained / Not Required
```

only if supported by policy.

### Aggregate approval

```text
Not Requested
Pending
Approved
Rejected
Withdrawn
Expired
Superseded
```

### Issue readiness

```text
Not Ready
Ready
Blocked
Unknown
```

### Issuance

```text
Not Issued
Issued
Delivery Pending
Delivered
Delivery Failed / Unknown
```

### Client acceptance

```text
Not Accepted
Accepted
Declined
Expired
```

These must never collapse into one `proposal.status`.

---

## Review complete ≠ approved

Permanent.

---

## Comments resolved ≠ approved

Permanent.

---

## One approver approved ≠ aggregate approved

Permanent.

---

## Aggregate approved ≠ issued

Permanent.

---

## Issued ≠ accepted

Permanent.

---

## Accepted ≠ Contract signed

Permanent.

---

## New draft created ≠ old approval deleted

Permanent.

---

## New draft created ≠ old approval transferred

Critical.

---

## Approval rejected ≠ Proposal deleted

Permanent.

---

## Approval rejected ≠ Deal lost

Permanent.

---

## Approval expired ≠ Proposal expired

Critical.

Approval workflow expiry and client-facing Proposal expiry are distinct.

---

## Proposal expired ≠ ApprovalRequest expired necessarily

Permanent.

---

## Approval withdrawn ≠ prior decisions erased

Permanent.

---

## Participant deactivated ≠ prior decision invalidated automatically

Historical evidence remains.

In-flight policy may need participant replacement/re-resolution.

---

## Approval service unavailable ≠ rejected

Critical.

---

## Comment service unavailable ≠ no comments

Critical.

---

## ProposalVersion unavailable ≠ approval subject can be guessed

If the exact subject cannot be loaded/verified, formal approval action must fail safely.

---

## Latest Proposal version changes while page open

The UI must be able to indicate conceptually:

> You are reviewing v3; v4 now exists.

Do not silently retarget.

---

## Concurrent decision

If two actions race, each decision remains individually validated against current ApprovalRequest revision/state.

---

## State Coverage

Design 098 inherits Design 150 plus:

```text
Proposal Review Loading
Proposal Review Available
Proposal Review Restricted
Proposal Version No Longer Available

Review Not Started
Review In Progress
Review Complete
Review Needs Revision
Review Superseded

No Comments
Comments Available
Comment Open
Comment Resolved
Comment Reopened
Comments Service Unavailable

Approval Not Requested
Approval Pending
Approval In Progress
Approval Approved
Approval Rejected
Approval Withdrawn
Approval Expired
Approval Superseded
Approval Service Unavailable

Approver Pending
Approver Approved
Approver Rejected
Approver No Longer Eligible

Issue Readiness Not Ready
Issue Readiness Ready
Issue Readiness Blocked
Issue Readiness Unknown

Newer Proposal Version Exists
Reviewed Version Is Historical
Approval Version Conflict

Proposal Updated Elsewhere
Approval Updated Elsewhere

Partial Proposal Review Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should keep the **exact ProposalVersion being reviewed** visually primary.

Conceptually:

```text
Proposal / exact version
↓
Commercial/version context
↓
Review content
   ├── proposal sections
   ├── line items
   └── comments if frozen
↓
Approval
   ├── policy / requirement summary
   ├── participants
   ├── individual decisions
   └── aggregate resolution
↓
Issue readiness
```

Only fields/actions present in frozen Design 098 should render.

---

## Version identity must remain persistent on screen

A reviewer should never lose track of:

> Proposal P-100 — Version 3

especially if Version 4 exists concurrently.

---

## Newer version warning

If v4 is created while v3 is being reviewed, the screen should not silently switch.

The architecture must support an explicit stale/superseded indication.

---

## Comments and decisions must look different

A comment:

> “Please reduce the discount.”

must not visually resemble an approval decision:

> Rejected.

---

## Individual and aggregate decisions must remain distinct

Example:

```text
Finance: Approved
Editorial: Pending

Overall approval: Pending
```

Not:

> Approved

because one participant acted.

---

## Internal approval and client acceptance must not share labels

Avoid generic:

> Approved

when one means internal authorization and another means client acceptance.

Use contextual semantics.

---

## Tablet

Following Design 152:

* Proposal/version identity remains sticky/prominent,
* review content stacks,
* approver rows become compact,
* aggregate approval remains distinct from participant decisions,
* actions remain touch-safe.

---

## Mobile

Priority:

```text
Proposal
↓
Exact ProposalVersion
↓
Version/commercial summary
↓
Review content
↓
Comments / issues
↓
Approval participants
↓
Aggregate approval
↓
Readiness / allowed action
```

Do not hide exact version identity inside a desktop-only side panel.

---

## Mobile decision controls

Where frozen design permits approve/reject:

* the exact version,
* action,
* any required rationale

must remain clear before submission.

---

## Accessibility

A review detail could communicate:

> Proposal Executive Brand Package, version 3. Internal review in progress. Finance approved. Editorial approval pending. Overall approval pending. A newer draft version 4 exists.

where canonical authorized data supports it.

---

# 7. Backend Requirements

## Canonical review/approval composition

```text
Design 098
    ↓
Authenticated Workspace Context
    ↓
ProposalReviewApprovalQueryService
    │
    ├── ProposalAdapter
    ├── exact ProposalVersionAdapter
    ├── ReviewSession/CommentAdapter
    ├── ApprovalRequestAdapter
    ├── ApprovalParticipantAdapter
    ├── ApprovalDecisionAdapter
    ├── ApprovalPolicyAdapter
    └── IssueReadinessResolver
    ↓
ProposalReviewApprovalView
```

This is a read-composition surface.

---

## Every formal action anchors exact ProposalVersion ID

Never accept only:

```text
proposalId
```

for approval.

Require:

```text
proposalId
proposalVersionId
```

and validate their relationship.

---

## Approval request creation

Conceptually:

```text
requestProposalApproval(
    proposalId,
    proposalVersionId,
    policyId/version,
    expectedProposalRevision,
    idempotencyKey
)
```

should:

1. authenticate/authorize requester;
2. load exact ProposalVersion;
3. verify version is eligible for review;
4. resolve exact ApprovalPolicyVersion;
5. resolve participants server-side;
6. create ApprovalRequest;
7. pin ProposalVersion + PolicyVersion;
8. create participant records;
9. emit event/Audit;
10. return ApprovalRequest ID.

---

## Request idempotency

Double-click/network retry must not create duplicate approval workflows for the same exact approval intent.

---

## Participant resolution must be server-side

Do not trust a browser-generated list of “required approvers” without policy validation.

---

## ApprovalPolicy pinning

ApprovalRequest must store:

```text
approvalPolicyVersionId
```

or equivalent.

Later policy changes cannot silently alter an existing request.

---

## Approval decision command

Conceptually:

```text
decideApproval(
    approvalRequestId,
    proposalVersionId,
    expectedApprovalRevision,
    decision,
    rationale,
    idempotencyKey
)
```

should:

1. authenticate actor;
2. load request;
3. verify exact ProposalVersion subject;
4. verify request actionable;
5. verify actor's ApprovalParticipant;
6. verify actor still eligible;
7. verify no superseding Proposal-version policy invalidates this action;
8. append ApprovalDecision;
9. recompute aggregate resolution through policy engine;
10. update request resolution atomically where appropriate;
11. emit event/Audit.

---

## Decision idempotency

Network retry cannot create multiple decisions from the same actor/action.

---

## Decision uniqueness/history

Depending on policy:

* one active final decision per participant,
* corrections create superseding records,

rather than arbitrary overwrite.

---

## Decision concurrency

Two participants can approve concurrently safely.

Aggregate resolution must be transactionally/revision-safe.

---

## Aggregate resolver

Use centralized:

```text
ApprovalResolutionService
```

from Design 029.

Do not calculate Proposal approval differently from other Approval domains.

---

## Aggregate resolver consumes

Conceptually:

```text
ApprovalPolicyVersion
+
required participants
+
current valid decisions
+
request lifecycle
```

and returns canonical aggregate state.

---

## Frontend must never calculate final approval

Critical.

The UI can display it.

The server owns it.

---

## Review comment service

Comments should use separate narrow commands:

```text
createReviewComment()
resolveReviewComment()
reopenReviewComment()
```

where those actions exist.

Do not mutate ApprovalDecision when a comment resolves.

---

## Comment write ≠ ProposalVersion edit

If a reviewer requests changes:

the author edits/creates a new ProposalVersion through ProposalVersionService.

The comment itself does not patch commercial fields.

---

## New version during active approval

This needs an explicit resolver/workflow.

Conceptually:

```text
ProposalVersion v3 approval pending
          ↓
ProposalVersion v4 created
          ↓
ProposalApprovalSupersessionPolicy
```

which can determine whether v3 request:

* remains historical,
* becomes superseded/withdrawn,
* can finish but no longer grants current release readiness.

It must **never** retarget AR-v3 to v4.

---

## Approved v3 + new v4

IssueReadinessResolver should distinguish:

```text
v3 = approved
v4 = draft
```

and never return:

> v4 approved.

---

## Issue readiness resolver

Conceptually:

```text
resolveProposalIssueReadiness(proposalVersionId)
```

may consider:

* exact approval state,
* version lifecycle,
* supersession,
* required Proposal validation.

It returns:

```text
READY
BLOCKED
UNKNOWN
```

with reasons.

---

## Readiness resolver ≠ issue command

Permanent.

---

## Issuance uses Design 018/097 Proposal service

Design 098 should call/hand off to the canonical issue command.

Do not send Proposal directly from ApprovalService.

---

## Approval completion event

Example:

```text
ProposalVersionApproved
```

can trigger:

* library projection refresh,
* notification,
* Deal gate invalidation/re-evaluation.

It should not itself move Deal stage.

---

## Deal gate integration

Design 096 StageGateEvaluation can query:

> Is required ProposalVersion approval complete?

using canonical Approval state.

No duplicated:

```text
deal.proposalApproved
```

flag as source truth.

---

## Client acceptance remains separate

No approval command can create `ProposalAcceptance`.

Only the external/client acceptance workflow can.

---

## Contract creation remains separate

No ApprovalDecision creates Contract automatically.

---

## ProposalVersion immutability

If the reviewed version is already protected/issued, review action never mutates its commercial content.

Any correction requires a new version.

---

## Commercial calculation integrity

Review screen should consume totals from canonical ProposalVersion calculation/snapshot.

Never recalculate pricing independently in approval UI.

---

## Optimistic concurrency

Proposal review should protect against:

* ProposalVersion changing/superseding,
* ApprovalRequest updating,
* comments resolving concurrently.

Use appropriate revision IDs.

---

## Stale browser protection

Approve action opened on v3 must fail safely if:

* request withdrawn,
* participant removed under valid policy,
* v3 no longer approval-eligible,
* request already resolved.

Do not rely on stale button state.

---

## Outbox/events

Useful events include:

```text
ProposalApprovalRequested
ApprovalParticipantAssigned
ProposalApprovalDecisionRecorded
ProposalApprovalResolved
ProposalApprovalRejected
ProposalApprovalWithdrawn
ProposalApprovalSuperseded
```

---

## Notification integration

Design 080 may notify:

* approval requested,
* approval assigned,
* decision recorded,
* approval completed/rejected.

Notification read state never changes Approval state.

---

## My Work integration

If approval responsibility appears in Design 078:

```text
ApprovalParticipant
      ↓
PersonalWorkQueueEntry
```

Design 078 remains a projection.

Completing the approval from My Work must call the same ApprovalService.

---

## Activity integration

Proposal Activity may project:

* approval requested,
* approved,
* rejected,
* version superseded.

Activity is not Approval truth.

---

## Audit

Critical human commercial decisions should record:

* actor,
* exact ProposalVersion,
* policy,
* decision,
* timestamp,
* rationale where required.

Do not rely only on generic Activity.

---

## Search

Design 079 may expose safe Proposal approval metadata if useful.

Do not broadly index:

* confidential rationale,
* sensitive internal comments.

---

## Caching

ProposalReviewApprovalView caches must vary by:

```text
organizationMembershipId
proposalVersionId
authorization revision
proposal/version revision
approvalRequest revision
comment/review revision
```

Never cache solely by Proposal ID.

---

## Performance

Use:

* one exact ProposalVersion query,
* batched participant/decision load,
* cached immutable ProposalVersion snapshot where safe,
* paginated comments/history if large.

Do not repeatedly reconstruct the full Proposal library.

---

## Partial failure contract

Example:

```text
Proposal core      ✓
ProposalVersion    ✓
Comments           ✕
ApprovalRequest    ✓
Participants       ✓
Policy             ✓
Deal context       ✕
```

Design 098 still renders the exact ProposalVersion and Approval state.

Comments and Deal context show explicit unavailability.

Formal approval can proceed only if all required approval dependencies are trustworthy.

---

## Backend Requirement Matrix

| Requirement                                    | Status                                     |
| ---------------------------------------------- | ------------------------------------------ |
| Canonical Proposal reuse from 018              | **Critical**                               |
| Exact ProposalVersion subject                  | **Critical**                               |
| Proposal/ProposalVersion separation            | **Critical**                               |
| Review/Approval separation                     | **Critical**                               |
| ReviewComment/ApprovalDecision separation      | **Critical**                               |
| ReviewSession/ApprovalRequest separation       | **Critical if ReviewSession persists**     |
| ApprovalRequest/ApprovalDecision separation    | **Critical**                               |
| Individual decision/aggregate state separation | **Critical**                               |
| Approval binds exact version                   | **Critical**                               |
| Approval vN does not transfer to vN+1          | **Critical**                               |
| New-version supersession handling              | **Critical**                               |
| Approved/latest-version distinction            | **Critical**                               |
| Version-specific comment anchors               | **Critical where anchored comments exist** |
| Central Approval engine reuse from 029         | **Critical**                               |
| Versioned ApprovalPolicy                       | **Critical**                               |
| ApprovalRequest pins PolicyVersion             | **Critical**                               |
| Server-side participant resolution             | **Critical**                               |
| Participant/role authorization                 | **Critical**                               |
| Decision actor server-derived                  | **Critical**                               |
| Approval request idempotency                   | **Critical**                               |
| Approval decision idempotency                  | **Critical**                               |
| Approval concurrency handling                  | **Critical**                               |
| Aggregate resolver server-authoritative        | **Critical**                               |
| Frontend aggregate calculation prohibited      | **Critical**                               |
| Approval correction/supersession history       | **Critical**                               |
| Approval/issue separation                      | **Critical**                               |
| Approval/client acceptance separation          | **Critical**                               |
| Approval/Deal stage separation                 | **Critical**                               |
| Approval/Contract execution separation         | **Critical**                               |
| Issue readiness as derived state               | **Critical**                               |
| Readiness/issue command separation             | **Critical**                               |
| Proposal pricing calculation reuse             | **Critical**                               |
| Internal comments client-isolated              | **Critical**                               |
| Sensitive rationale permissions                | **Critical**                               |
| My Work projection reuse                       | **Required**                               |
| Design 080 Notification reuse                  | **Required**                               |
| Design 039 Audit integration                   | **Critical**                               |
| Design 096 gate integration                    | **Critical**                               |
| Designs 099–100 Contract separation            | **Critical architecture**                  |
| Optimistic concurrency                         | **Critical**                               |
| Stale-browser protection                       | **Critical**                               |
| Permission-safe caching                        | **Critical**                               |
| Partial dependency failure handling            | **Critical**                               |

---

# 8. Consolidation

Design 098 creates major risk if review, approval, versioning and commercial workflow are collapsed.

**Proposal / ProposalVersion conflation**
Approval targets mutable document instead of exact terms.

**ProposalVersion / ApprovalRequest conflation**
Document lifecycle becomes approval lifecycle.

**Review / Approval conflation**
Discussion becomes formal authorization.

**ReviewComment / ApprovalDecision conflation**
“Please revise this” is treated as rejection.

**Comment resolved / Proposal approved conflation**
Editorial cleanup grants commercial authority.

**Review complete / Approval complete conflation**
Review process bypasses formal decision policy.

**ApprovalRequest / ApprovalDecision conflation**
Workflow and one participant's decision become the same record.

**Participant approved / Aggregate approved conflation**
One approver determines outcome before policy resolves it.

**Aggregate state / manually editable status conflation**
Frontend or generic CRUD can force Approval.

**ApprovalPolicy / request current configuration conflation**
Changing policy rewrites in-flight approval requirements.

**Job title / Approval role conflation**
“Director” automatically gains approval rights.

**Proposal owner / approver conflation**
Author self-approves by ownership.

**Deal owner / approver conflation**
Sales ownership becomes commercial authority.

**Review assignment / permission conflation**
Assigned reviewer automatically gains approval authority.

**Approve v3 / approve v4 conflation**
New commercial terms inherit old authorization.

**Latest ProposalVersion / approved ProposalVersion conflation**
Library/UI reports newest draft as approved.

**New version / mutate active ApprovalRequest subject conflation**
v3 approval silently retargets v4.

**Superseded version / deleted approval history conflation**
Commercial governance evidence disappears.

**Approval correction / history rewrite conflation**
Original decision vanishes.

**Human decision / machine suggestion conflation**
Automated assessment gains approval authority if later introduced.

**Approval state / issue readiness conflation**
Approved version is assumed sendable despite supersession/validation issues.

**Issue readiness / issued conflation**
Ready state sends Proposal automatically.

**Approval / issuance conflation**
Approver action causes client send.

**Approval / delivery conflation**
Internal authorization appears as external delivery.

**Approval / client acceptance conflation**
Employee approval appears as client commitment.

**Internal “Approved” / client “Accepted” label conflation**
UI semantics become ambiguous.

**Approval / Deal stage conflation**
Proposal approval moves Pipeline automatically.

**Approval / Deal lifecycle conflation**
Proposal approval closes Deal.

**Approval / Contract creation conflation**
Internal commercial authorization creates legal document automatically.

**Approval / Contract signed conflation**
Internal state appears legal execution.

**Approval expiry / Proposal expiry conflation**
Internal workflow timeout alters client terms.

**Approval rejection / Proposal deletion conflation**
Rejected version disappears instead of remaining history.

**Approval rejection / Deal lost conflation**
Commercial revision request closes opportunity.

**Approval withdrawal / decision deletion conflation**
Historical decisions disappear.

**Deactivated approver / historical decision deletion conflation**
Governance evidence is lost when employee leaves.

**Proposal edit / Approval mutation conflation**
Editor can change terms after approval without new version.

**Commercial total recalculated in review UI**
Approval screen displays different numbers from ProposalVersion.

**Comment anchor / latest document anchor conflation**
Comment moves to wrong paragraph/line item after revision.

**Internal comment / client-visible Proposal content conflation**
Sensitive commentary leaks externally.

**Internal rationale / ordinary Proposal read conflation**
Confidential commercial reasoning leaks.

**ApprovalRequest creation / participant client-supplied trust**
Requester chooses convenient approvers.

**Browser-supplied decision actor**
User impersonates authorized approver.

**Frontend-calculated approval state**
Client can manipulate aggregate outcome.

**Approval decision retry / duplicate decision conflation**
Double click creates inconsistent records.

**Concurrent approvals / last-write-wins conflation**
One approver overwrites another.

**Stale approval screen / valid authority conflation**
User approves a withdrawn/superseded request.

**Approval service unavailable / rejected conflation**
Outage appears as business rejection.

**Comments unavailable / no comments conflation**
Review appears clean incorrectly.

**Deal service unavailable / no Deal context conflation**
Related opportunity appears missing.

**ProposalVersion unavailable / guess latest version conflation**
System approves wrong terms.

**Approval summary projection / canonical approval truth conflation**
Proposal Library badge becomes writable source.

**My Work Approval item / ApprovalRequest conflation**
Personal queue projection becomes second approval backend.

**Notification read / approval complete conflation**
Clearing alert resolves commercial review.

**Activity event / ApprovalDecision conflation**
Timeline row becomes formal authority.

**AuditEvent / ApprovalDecision conflation**
Audit log substitutes for structured business decision.

**Approval mega-PATCH**
One endpoint changes Proposal, Approval, Deal and Contract state.

**Cache by Proposal ID only**
v3/v4 and permission-specific approval data collide.

**098/018 duplicate Proposal review state**
Builder and Approval Detail disagree.

**098/029 duplicate Approval backend**
Proposal invents custom approval engine.

**098/049 duplicate review/comment semantics**
Internal Proposal review and client Draft Review drift at primitive level.

**098/052 duplicate approval semantics**
Internal and Portal approvals use incompatible engines.

**098/096 duplicate Deal gate state**
Proposal approval writes Deal-stage readiness manually.

**098/097 duplicate approval summary truth**
Library badge and Approval Detail diverge.

**098/099–100 duplicate Contract execution state**
Approval screen begins owning legal handoff.

No additional screen is required.

These are **exact-version review, centralized approval-engine reuse, participant decisions, policy versioning, supersession, internal/client separation, Deal gate integration, commercial release readiness, authorization, concurrency and historical-governance requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PROPOSAL-VERSION REVIEW, APPROVAL DECISION & COMMERCIAL RELEASE-GATE ANCHOR**

**Domain directive:**
**Proposal ≠ ProposalVersion ≠ ReviewSession ≠ ReviewComment ≠ ApprovalRequest ≠ ApprovalParticipant ≠ ApprovalDecision ≠ ApprovalPolicy ≠ AggregateApprovalState ≠ Issue/Delivery ≠ ClientAcceptance ≠ DealStage ≠ Contract.**

**Identity directive:**
Design 018 remains canonical for Proposal/ProposalVersion. Design 098 reviews and approves the exact existing ProposalVersion and never creates an ApprovedProposal/ReviewProposal entity.

**Exact-version directive:**
every ReviewSession, comment anchor, ApprovalRequest and ApprovalDecision that depends on document content must bind the exact ProposalVersion being reviewed.

**Version-isolation directive:**
approval of v3 means only **v3 was approved**. A later v4 draft has no inherited approval unless an explicit new approval process approves v4.

**Supersession directive:**
creation of a newer ProposalVersion never retargets an in-flight ApprovalRequest. Existing requests remain tied to their original subject and are continued, withdrawn or superseded according to governed policy.

**Review directive:**
review discussion and formal approval remain separate. Review completion/comment resolution can contribute to readiness but can never substitute for an authorized ApprovalDecision.

**Comment directive:**
comments are exact-version contextual records with author/time/visibility and, where applicable, version-specific anchors. Internal comments never become client-visible Proposal content automatically.

**Approval-engine directive:**
Design 029 remains the one canonical Approval engine. Proposal-specific approval uses its ApprovalRequest, ApprovalParticipant, ApprovalDecision and policy-resolution foundation rather than a parallel Proposal status system.

**Participant directive:**
approval participants are resolved and validated server-side under the exact ApprovalPolicyVersion. Job title, Proposal ownership, Deal ownership or reviewer assignment never grants approval authority implicitly.

**Decision directive:**
each formal decision is authenticated, exact-version bound, append-oriented/idempotent, timestamped and attributable to the actual authorized participant.

**Aggregate directive:**
overall approval state is resolved server-side from the pinned ApprovalPolicyVersion and valid participant decisions. One person's approval never equals aggregate approval unless the policy explicitly says that one decision is sufficient.

**Policy directive:**
every ApprovalRequest pins its governing ApprovalPolicyVersion. Later policy edits never silently rewrite an in-flight or historical commercial decision.

**Correction directive:**
decision corrections/revisions preserve prior decision history rather than silently replacing earlier governance evidence.

**Approval/readiness directive:**
aggregate approval and Proposal issue readiness remain separate. Readiness is derived from exact approval state + version eligibility + required Proposal checks and is never a manually editable status.

**Issue directive:**
Design 018/097 Proposal services remain responsible for issuance. Approval completion never sends the Proposal automatically unless an explicit governed workflow invokes the canonical issue command.

**Delivery directive:**
internal approval remains separate from Proposal issue, transport delivery and recipient view state.

**Client-acceptance directive:**
client acceptance remains an external Proposal-domain commitment against one exact issued ProposalVersion. Internal ApprovalDecision can never substitute for client acceptance.

**Deal directive:**
Design 096 remains authoritative for Deal stage. Proposal approval may satisfy/re-evaluate a stage gate but cannot perform the stage transition itself.

**Contract directive:**
Designs 019/099–100 remain authoritative for Contract creation/signing/execution. Internal Proposal approval is neither Contract creation nor legal execution.

**Historical-evidence directive:**
approved/rejected/withdrawn/superseded Proposal versions, participant decisions and governing policies remain reconstructable even after newer versions, employee deactivation, Deal progression or Contract creation.

**Authorization directive:**
Proposal read, commercial detail read, review/comment, approval-request creation, formal decision, approval withdrawal, Proposal edit and Proposal issue remain independently server-authorized.

**Stale-client directive:**
formal decision commands revalidate ApprovalRequest lifecycle, actor eligibility, subject ProposalVersion and request revision. A stale UI button cannot approve a superseded/withdrawn/resolved request.

**Concurrency directive:**
participant decisions, request resolution and version changes use revision/transaction protection so concurrent approvers/editors cannot silently corrupt the aggregate approval state.

**Idempotency directive:**
approval-request creation and formal approval/rejection actions must be replay-safe. UI retry/double-click cannot generate duplicate workflows or duplicate decisions.

**Partial-failure directive:**
Proposal core and exact ProposalVersion remain visible when Comments, Deal context, Notifications or other support services fail. Formal approval proceeds only when the Approval engine and required subject/policy data are trustworthy; dependency failure must never be converted into approval/rejection.

**My-Work directive:**
Design 078 can project required ApprovalParticipant work, but completing it always invokes the canonical ApprovalService. The queue projection never owns approval state.

**Notification directive:**
Design 080 can notify approvers about requests/decisions, but notification read/dismissal never changes review or approval state.

**Activity directive:**
Proposal review/approval events can appear in operational Activity, but Activity remains a projection and never replaces ApprovalDecision.

**Audit directive:**
formal commercial ApprovalRequests, participant decisions, withdrawals, supersession and exceptional policy actions generate structured Audit evidence preserving actor, exact ProposalVersion and policy context.

**Caching directive:**
Proposal review caches must be keyed by exact ProposalVersion plus membership/authorization and review/Approval revisions. Caching solely by Proposal ID is prohibited because concurrent versions can have different approval states.

**Performance directive:**
use exact-version snapshots, batched participant/decision retrieval, immutable-version caching and paginated comment/history retrieval rather than duplicating Proposal/Approval state.

**Future-reuse directive:**
Design 099 Proposal-to-Contract library context and Design 100 Contract execution must consume exact accepted/approved Proposal lineage without turning Proposal Approval into Contract status.

**Overlap directive:**
Designs **018–019, 029, 049, 052, 078, 096–100** must share one continuous **Proposal → ProposalVersion → Review → ApprovalRequest → ApprovalDecision → Issue → Client Acceptance → Contract** lineage while keeping every review, authorization, external acceptance and legal-execution state independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE PROPOSAL APPROVAL FOUNDATION — CANONICAL PROPOSALVERSION SUBJECT + VERSION-SPECIFIC REVIEW/COMMENTS + CENTRAL APPROVALREQUEST/PARTICIPANT/DECISION ENGINE + PINNED APPROVALPOLICYVERSION + SERVER-AUTHORITATIVE AGGREGATE RESOLUTION + NON-TRANSFERABLE VERSION APPROVAL + EXPLICIT SUPERSESSION + DERIVED ISSUE READINESS + GOVERNED DEAL-GATE INTEGRATION + STRICT SEPARATION FROM CLIENT ACCEPTANCE AND CONTRACT EXECUTION — AND NEVER ALLOW COMMENTS, REVIEW COMPLETION, INDIVIDUAL APPROVER STATE, NEWER DRAFTS, NOTIFICATIONS OR GENERIC “APPROVED” BADGES TO BECOME COMMERCIAL AUTHORITY FOR A DIFFERENT VERSION OR SILENTLY MOVE THE DEAL/CONTRACT WORKFLOW.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **98 / 153** |
| **PASS**                                   |                         **98** |
| **STANDARDIZE decisions**                  |                         **96** |
| **Potential implementation-overlap flags** |                         **89** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**98 / 153 = 64.1% audited.**

### Canonical Proposal approval architecture after Design 098

```text
                         PROPOSAL
                            │
               ┌────────────┼────────────┐
               ↓            ↓            ↓
              v2           v3           v4
                            │
                      exact subject
                            ↓
                     ReviewSession
                            │
                     ReviewComments
                            │
                            ↓
                    ApprovalRequest
                            │
              ┌─────────────┼─────────────┐
              ↓             ↓             ↓
        Participant A  Participant B  Participant C
              │             │             │
           Decision       Decision      Decision
              │             │             │
              └─────────────┼─────────────┘
                            ↓
                 ApprovalResolution
                            │
                            ↓
                       v3 APPROVED
```

The strongest invariant is:

```text
Proposal v3
$10,000
→ APPROVED

Proposal v4 created
$12,000

v4 approval = NOT REQUESTED / PENDING
according to workflow.

v3 approval does NOT transfer to v4.
```

The individual/aggregate distinction is equally strict:

```text
Finance approver     = APPROVED
Editorial approver   = PENDING
Legal approver       = PENDING

Aggregate approval   = PENDING

NOT:
“Proposal approved”
```

And the commercial workflow remains:

```text
Internal Review Complete
        ≠
Internal Approval Granted
        ≠
Proposal Issued
        ≠
Proposal Delivered
        ≠
Client Accepted
        ≠
Deal Stage Changed
        ≠
Contract Signed
```

Each remains a separate canonical state or explicit governed command.

## Next Sequential Audit Target

### **Design 099 — Contract Library / Contract List**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
