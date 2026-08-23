# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 052 — Client Approvals

Design 052 should become the **canonical Client Portal approval queue and formal-decision workspace** for ApprovalRequests in which the authenticated Client Portal member is an authorized viewer, participant, or approver.

It must be a Client-safe projection of the platform-wide Approval infrastructure established by **Design 029**, not a second approval engine.

The non-negotiable boundary is:

> **Review ≠ ApprovalRequest ≠ ApprovalParticipant ≠ ApprovalDecision ≠ ApprovalPolicy ≠ Source Workflow State.**

And every approval that concerns a versioned artifact must bind to the **exact immutable version** the Client actually reviewed.

| Audit field                   | Classification                                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Design ID**                 | **052**                                                                                                        |
| **Canonical name**            | **Client Approvals**                                                                                           |
| **Product area**              | Client Portal / Approvals / Governance / Collaboration                                                         |
| **User surface**              | **Client Portal**                                                                                              |
| **Screen class**              | Formal Decision Queue / Approval Workspace                                                                     |
| **Classification**            | **Portal Workspace Variant — Client Approval Operations Family**                                               |
| **Primary purpose**           | Show Client ApprovalRequests, required decisions, deadlines, decision history and safe links to exact subjects |
| **Primary canonical entity**  | **ApprovalRequest**                                                                                            |
| **Participant entity**        | **ApprovalParticipant**                                                                                        |
| **Decision entity**           | **ApprovalDecision**                                                                                           |
| **Policy entity**             | **ApprovalPolicy**                                                                                             |
| **Primary source dependency** | Design 029 — Approval Center / Approval Workspace                                                              |
| **Review dependencies**       | Designs 049–050                                                                                                |
| **Project dependency**        | Design 043                                                                                                     |
| **Client Action dependency**  | Design 047                                                                                                     |
| **Asset/version dependency**  | Design 030 / 051                                                                                               |
| **Later internal overlap**    | Design 115 — Project Approval Gates / Approval History                                                         |
| **Parent shell**              | `ClientPortalShell` — Design 002                                                                               |
| **Primary read model**        | `ClientApprovalsView`                                                                                          |
| **Template family**           | `ClientApprovalWorkspaceTemplate`                                                                              |
| **Composition**               | `ClientApprovalsComposition`                                                                                   |
| **Auth**                      | Required                                                                                                       |
| **Authorization**             | Portal membership + ApprovalRequest visibility + participant/decision capability                               |
| **Implementation priority**   | **Critical Governance / Client Delivery**                                                                      |
| **Reuse level**               | **Extremely High with Design 029**                                                                             |

The governing invariant is:

> **An approval is a formal decision about a precisely identified subject. It is never inferred merely because a Client commented, reviewed, downloaded, viewed, signed, or because a Project entered an “approval” stage.**

---

# 1. Classification — Functional Responsibility

Design 052 should answer:

> **“Which items formally require my approval, which exact artifact/version am I approving, why is my decision required, when is it due, who else is involved, what decision has already been recorded, and what happens after my decision?”**

Canonical architecture:

```text
Canonical Source Domain
        │
        ├── DraftVersion
        ├── ProofVersion
        ├── ReportVersion
        ├── ContractVersion where approval is required
        └── other explicit approvable subject
                 ↓
           ApprovalPolicy
                 ↓
          ApprovalRequest
                 ↓
       ApprovalParticipant(s)
                 ↓
        Client-safe Projection
                 ↓
         Design 052
                 ↓
          ApprovalDecision
                 ↓
     Workflow / Source Domain reacts
```

Design 052 is therefore a **formal decision surface**.

It does not own Draft, Proof, Report, Contract, Project, or publication state.

---

# 2. Reuse — Design 029 remains canonical

Design 029 already established the cross-platform Approval foundation.

Design 052 must reuse:

* ApprovalRequest,
* ApprovalParticipant,
* ApprovalDecision,
* ApprovalPolicy,
* subject references,
* exact-version binding,
* multi-approver logic,
* reassignment where supported,
* supersession,
* escalation,
* audit,
* workflow integration.

Correct:

```text
Canonical Approval Domain — Design 029
            │
      ┌─────┴─────┐
      ↓           ↓
 Internal      Client-safe
 Approval      Approval
 Workspace     Workspace
  Design 029    Design 052
```

There must be **one approval engine**.

---

# 3. ApprovalRequest ≠ source artifact

An ApprovalRequest may point to:

```text
DraftVersion
ProofVersion
ReportVersion
ContractVersion
Publication artifact
other approved subject type
```

but it remains its own canonical record.

Example:

```text
ApprovalRequest AR-204
subjectType = PROOF_VERSION
subjectId   = PV-5
```

The ProofVersion does not itself become the ApprovalRequest.

---

# 4. Exact subject binding is mandatory

Dangerous:

```text
ApprovalRequest
→ designId
→ load latest proof
```

Correct:

```text
ApprovalRequest
→ ProofVersion PV-5
```

If PV-6 is created after the Request was issued, the Client must still know:

> **You were asked to approve PV-5.**

---

# 5. Approved v5 ≠ approved v6

A formal decision applies to the exact subject version.

```text
Proof v5
→ APPROVED

Proof v6
→ no decision yet
```

unless an explicit governed policy says otherwise.

Approval must never automatically migrate because versions share the same parent artifact.

---

# 6. Draft approval follows the same rule

```text
DraftVersion DV-4
→ ApprovalRequest
→ ApprovalDecision
```

A later DraftVersion DV-5 requires separate decision semantics when formal approval is required.

---

# 7. Report approval follows the same rule

An approved ReportVersion remains stable.

A later regenerated Report cannot silently inherit approval merely because its title is the same.

---

# 8. Contract approval ≠ Contract signature

This is especially important for Designs 053 and 070.

A Client may:

```text
approve commercial/legal content
```

and separately:

```text
sign ContractVersion
```

Therefore:

> **ApprovalDecision ≠ Signature.**

Contract execution remains the canonical Contract/signing domain.

---

# 9. Signature ≠ approval evidence automatically

A legally valid signature may imply contractual acceptance according to business/legal policy, but the architecture should not generically convert every SignatureEvent into `ApprovalDecision.APPROVED`.

The two concepts remain domain-specific.

---

# 10. Review ≠ Approval

Designs 049–050 established:

```text
ReviewSession
ReviewComment
Feedback Submission
```

These are collaborative review operations.

Formal approval is:

```text
ApprovalRequest
→ ApprovalDecision
```

No comment text should be parsed to infer a decision.

---

# 11. “Looks good” ≠ Approved

A Client comment:

> Looks perfect.

is not sufficient formal approval.

Only the explicit Approval command creates an ApprovalDecision.

---

# 12. Feedback submitted ≠ Approved

Likewise:

```text
ReviewSession.FEEDBACK_SUBMITTED
≠
ApprovalDecision.APPROVED
```

This prevents accidental workflow advancement.

---

# 13. ApprovalRequest should be first-class

Conceptually:

```text
ApprovalRequest
├── id
├── subject type
├── exact subject/version ID
├── Project/context
├── policy/version
├── requester
├── requestedAt
├── dueAt
├── lifecycle state
├── participant configuration
└── source workflow reference
```

Exact schema belongs to Phase 3D.

---

# 14. ApprovalParticipant should be first-class

Conceptually:

```text
ApprovalParticipant
├── approvalRequestId
├── participant identity
├── participant role
├── sequence/group if applicable
├── eligibility
├── status
└── actedAt
```

This supports formal attribution.

---

# 15. Viewer ≠ approver

A Client executive may be permitted to see:

> Final Design awaiting CEO approval.

but not be an eligible approver.

Therefore:

```text
approval.read
≠
approval.decide
```

---

# 16. Reviewer ≠ approver

Someone authorized to comment on Design 050 does not automatically become an ApprovalParticipant.

---

# 17. Client Portal Admin ≠ approver

Managing Client Portal users in Design 062 must not grant automatic authority to approve:

* Drafts,
* designs,
* Contracts,
* Reports.

Approval authority comes from explicit Approval policy/participant assignment.

---

# 18. Requested participant ≠ Client account globally

An ApprovalRequest may be directed to:

* one named executive,
* several executives,
* a Client approval group,
* sequential approvers.

Do not expose it as actionable to every Client user.

---

# 19. Same Client ≠ same Approval queue

Example:

```text
CEO
→ Contract approval
→ Final magazine approval

Marketing Director
→ Draft/design approval

Finance Contact
→ no editorial approval authority
```

Design 052 results legitimately differ per Portal membership.

---

# 20. ApprovalPolicy ≠ ApprovalRequest

`ApprovalPolicy` describes the decision rules.

`ApprovalRequest` is one concrete execution of those rules.

Example:

```text
Policy:
Final Magazine Approval
requires 2 Client approvers

Request:
AR-404 for ProofVersion PV-8
```

---

# 21. Policy changes must not rewrite active/historical approvals

If policy changes from:

> one approver

to:

> two approvers,

existing historical ApprovalRequests must remain interpretable according to the policy/version they actually used.

Use snapshot/version semantics where needed.

---

# 22. Policy ≠ UI configuration

The fact that the Client UI shows two buttons does not define the approval rule.

The server-side ApprovalPolicy remains authoritative.

---

# 23. Sequential approval

Where supported:

```text
Approver A
   ↓
Approver B
   ↓
Complete
```

Approver B may not be eligible until A has acted.

The UI must not infer sequence independently.

---

# 24. Parallel approval

Where supported:

```text
Approver A ─┐
Approver B ─┼→ policy evaluation
Approver C ─┘
```

The Request completes according to ApprovalPolicy.

Not simply:

> first person who clicks Approve wins.

---

# 25. Quorum/threshold policy

If a future/frozen workflow requires:

> 2 of 3 approvals

that belongs to ApprovalPolicy.

Do not encode special-case arithmetic in Design 052.

---

# 26. Request lifecycle ≠ individual participant state

Example:

```text
ApprovalRequest:
PENDING

Participant A:
APPROVED

Participant B:
PENDING
```

Both can be true simultaneously.

---

# 27. ApprovalDecision should be immutable evidence

Once formally recorded, a decision should preserve:

```text
approvalRequestId
participant/actor
decision
timestamp
subject version
safe decision context
```

Do not overwrite one person's decision when another approver acts.

---

# 28. Decision ≠ aggregate outcome

Individual:

```text
Participant A → APPROVED
Participant B → APPROVED
```

can cause:

```text
ApprovalRequest → APPROVED/COMPLETED
```

according to policy.

The aggregate Request result and individual decisions remain distinguishable.

---

# 29. Decision types require governed semantics

Potential formal outcomes may include:

* Approve,
* Decline/Reject,
* possibly request changes,

depending on the frozen business workflow.

Exact decision vocabulary belongs to Phase 3D.

Do not invent dozens of approval outcomes.

---

# 30. “Request changes” can overlap with Review

If the formal approval policy includes a decision like:

> Changes Required

that is still a formal ApprovalDecision.

The detailed feedback/comments can remain in Review.

Correct:

```text
ApprovalDecision:
CHANGES_REQUIRED

ReviewComments:
specific requested edits
```

when product policy supports that pattern.

---

# 31. Rejected ≠ review comment

A formal Reject decision should be explicit.

Do not derive it because a reviewer left negative comments.

---

# 32. Source workflow state ≠ ApprovalRequest state

Example:

```text
ApprovalRequest:
PENDING

Project Workflow:
CLIENT_APPROVAL_GATE
```

The workflow may be waiting because of the ApprovalRequest.

But these remain separate records.

---

# 33. Client must never directly patch workflow stage

Dangerous:

```text
Client clicks Approve
↓
PATCH project.stage = DESIGN_APPROVED
```

Correct:

```text
decideApproval()
↓
ApprovalDecision persisted
↓
ApprovalPolicy evaluated
↓
ApprovalRequest resolves
↓
workflow dependency/gate reevaluated
↓
workflow may advance
```

---

# 34. Approval gate ≠ workflow stage

Design 115 later will expose Project Approval Gates internally.

An Approval gate may block a transition.

It should not become a Project stage itself unless the workflow model deliberately says so.

---

# 35. Design 115 relationship

Later:

**Design 115 — Project Approval Gates / Approval History**

Expected architecture:

```text
Canonical Approval Domain
        │
        ├── Design 052
        │   Client decision queue
        │
        └── Design 115
            Internal Project approval-gate/history view
```

One ApprovalRequest/Decision foundation.

Different audience and operational depth.

---

# 36. Design 029 vs 115 vs 052

Three surfaces, one domain:

```text
029
Cross-domain internal Approval operations

052
Client Portal formal decision queue

115
Project-specific internal Approval gates/history
```

No screen merge is decided in Phase 3A.1.

Backend reuse is mandatory.

---

# 37. Design 047 integration

Design 047 may surface:

> Approve Final Cover.

Its source lineage must identify the exact ApprovalRequest.

Opening that action routes to the relevant subject/review/approval experience.

---

# 38. Design 041 consistency

Dashboard:

> 2 approvals pending

must come from the same authorized ApprovalRequest population used in Design 052.

No separate approval counting logic.

---

# 39. Design 042 consistency

A Project card may show:

> Approval required.

That indicator must derive from the canonical ApprovalRequest, not Project stage text.

---

# 40. Design 043 consistency

Project Detail can summarize Project-specific approvals.

Design 052 owns the broader Client approval collection.

---

# 41. Design 044 integration

Timeline can show:

```text
Proof sent for approval
Client approved Proof v5
```

through source lineage from canonical Approval events.

Timeline never stores its own approval status.

---

# 42. Designs 049–050 integration

Draft/Design Review can expose related formal approval actions.

The Approval Request must still live in Design 029's domain.

---

# 43. Design 053 Contract relationship

Client Contracts can have:

* internal approval,
* Client approval,
* signing/execution.

These are different gates.

Design 052 should surface only formal ApprovalRequests intended for the Client.

---

# 44. Design 056 Report relationship

A final Client Report might require approval before publication/delivery.

If so:

```text
ReportVersion
→ ApprovalRequest
```

and exact-version semantics apply.

---

# 45. Design 031 Publishing relationship

Publication readiness may depend on required approvals.

But:

```text
Approved
≠
Published
```

Approval removes/fulfills one gate.

Publishing remains Design 031's lifecycle.

---

# 46. Design 025 Magazine production relationship

Magazine production may require:

* Draft approval,
* Cover approval,
* Final proof approval.

Each can be separate ApprovalRequests tied to exact artifacts.

Do not create one ambiguous:

```text
project.approved = true
```

Boolean.

---

# 47. Project approval ≠ artifact approval

Example:

```text
Cover v4 approved
```

does not mean:

```text
Entire Project approved
```

unless formal Project policy explicitly says that artifact decision completes a particular gate.

---

# 48. Multiple approvals per Project

A Project can legitimately contain many approvals:

```text
Draft
Cover
Full proof
Publication release
Report
```

Design 052 must treat ApprovalRequest as first-class collection items.

---

# 49. Current vs historical approvals

Design 052 can conceptually distinguish:

```text
Needs Your Decision
Waiting on Others
Completed
Historical/Superseded
```

according to frozen UI.

These are query/presentation categories, not separate approval tables.

---

# 50. Waiting on others ≠ no approval required

A Client may have visibility into an approval but no current action because another participant must act first.

That must not count as their required action.

---

# 51. Client Action Resolver behavior

Only approvals actually requiring the current member's action should contribute to their actionable queue/count.

Conceptually:

```text
ApprovalRequest visible
+
participant eligible now
+
decision not recorded
+
request active
        ↓
Client Action
```

---

# 52. Pending ≠ actionable by this user

An ApprovalRequest can be globally pending but not currently actionable to the logged-in Client.

This distinction is essential.

---

# 53. Due date

ApprovalRequest can have a due date.

Due condition remains separate:

```text
Approval lifecycle:
PENDING

Schedule condition:
OVERDUE
```

Do not create an `OVERDUE` ApprovalDecision.

---

# 54. Due Soon ≠ Priority

A due-soon condition can be computed from schedule.

Priority, if product supports it, is a separate business classification.

---

# 55. Timezone/date semantics

Approval deadlines should use canonical timezone/date-only handling from Designs 035/040.

Browser-local time cannot be the sole authority.

---

# 56. Expired ApprovalRequest

If approval opportunity expires according to policy:

```text
EXPIRED
```

or equivalent is different from:

```text
REJECTED
```

No decision was necessarily made.

---

# 57. Withdrawn/Cancelled Request

Requester may withdraw an ApprovalRequest before decision.

That remains distinct from rejection.

---

# 58. Superseded ApprovalRequest

If ProofVersion v5 is replaced by v6 before the decision:

the old Request can become:

```text
SUPERSEDED
```

while a new ApprovalRequest targets v6.

Old decision/history remains traceable.

---

# 59. Superseded ≠ Rejected

Permanent distinction:

```text
SUPERSEDED
≠
REJECTED
```

The Client did not necessarily reject the artifact.

---

# 60. Superseded Request should disappear from active ClientAction queue

But it can remain visible in appropriate historical approval context.

---

# 61. Decision concurrency

Example:

```text
Client has AR-40 open in two tabs.
Tab A → Approve.
Tab B → Approve.
```

Only one valid participant decision should be persisted.

The second command must be idempotent/current-state aware.

---

# 62. Concurrent supersession

Example:

```text
Client prepares to approve v5.
Internal team supersedes v5 with v6.
Client clicks Approve.
```

Server must reject or safely resolve against current ApprovalRequest state.

It must never transfer the decision to v6.

---

# 63. Idempotency

`decideApproval()` must be replay-safe.

Network retries should never produce duplicate ApprovalDecision records.

---

# 64. Decision confirmation

High-impact formal decisions should clearly identify:

* subject,
* exact version,
* Project/context,
* decision being recorded.

This is especially important on mobile.

---

# 65. Comment/reason

If ApprovalPolicy requires a reason/comment for certain outcomes:

that validation belongs to the policy/decision command.

Do not enforce it solely in the frontend.

---

# 66. Decision comment ≠ ReviewComment necessarily

A formal ApprovalDecision may have:

```text
decision reason
```

while detailed artifact feedback belongs in Review.

The two can be linked but remain semantically distinct.

---

# 67. Approval history

Historical approvals should preserve:

* request identity,
* subject/version,
* participants,
* decisions,
* timestamps,
* supersession/withdrawal,
* policy context.

Do not reduce history to:

> Approved by John.

---

# 68. Actor history survives deactivation

If an approving Client user later loses Portal access:

the historical ApprovalDecision must still identify the actor meaningfully.

Membership revocation does not erase decision evidence.

---

# 69. Approval access revocation

If a Client participant loses access before acting:

they must no longer be able to decide.

The ApprovalRequest may require:

* reassignment,
* policy reevaluation,
* another participant.

Do not silently auto-approve or cancel.

---

# 70. Reassignment

If Approval participant reassignment is supported:

history must preserve:

```text
original participant
replacement participant
who reassigned
when
why where required
```

Reassignment ≠ deletion of original participation record.

---

# 71. Delegation

Delegation, if the product supports it later, is not identical to reassignment.

No delegation feature is added here.

The architecture should simply not infer approval authority from job title or account admin status.

---

# 72. Internal vs Client approvals

A Project may need:

```text
Internal Editorial Approval
↓
Client Approval
```

These must remain different ApprovalRequests/audiences.

A Client should never see internal approval participants or internal rejection reasons unless explicitly intended.

---

# 73. Client-safe projection

Design 052 should receive only fields appropriate for the Client:

```text
ClientApprovalSummary
├── approvalRequestId
├── subject type
├── safe subject title
├── exact Client-visible version
├── Project/context
├── requested decision
├── due condition
├── current participant state
├── safe aggregate state
├── requester safe identity
└── permitted actions
```

No internal workflow diagnostics.

---

# 74. Internal notes remain internal

Internal ApprovalRequest may contain:

* escalation notes,
* operational comments,
* staff discussion,
* internal risk.

Do not send them to Client payloads and hide them with CSS.

---

# 75. Subject visibility must be independently authorized

An ApprovalRequest being visible does not mean every underlying artifact field/version is accessible.

The Client must be authorized for the subject representation being shown.

---

# 76. Approval read ≠ artifact download

A Client may approve an in-browser Design proof while being forbidden from downloading its source/high-resolution artifact.

```text
approval.read
≠
asset.download
```

---

# 77. Approval read ≠ Contract download

Similarly, a Client may see a Contract approval summary without automatically gaining unrestricted Contract file access if legal policy says otherwise.

---

# 78. Search

Design 052 can search/filter authorized ApprovalRequests by:

* Project,
* subject,
* status/presentation category,
* due condition.

Authorization must apply before search.

---

# 79. Search leakage

Unauthorized Client members must not discover:

> Acquisition Contract requires approval

through search/autocomplete.

Approval subjects can themselves be sensitive.

---

# 80. Filters ≠ permissions

Status filters such as:

```text
Pending
Completed
Overdue
Project
Type
```

are query/presentation state only.

They never expand authorization.

---

# 81. Permission architecture

Potential Phase 3D Client capabilities may conceptually include:

```text
portal.approvals.read
portal.approvals.decide
portal.approvals.view_history
```

Exact names later.

The ApprovalParticipant/policy check remains mandatory even if a broad capability is present.

---

# 82. Broad capability ≠ resource authority

Having:

```text
portal.approvals.decide
```

should mean:

> can decide ApprovalRequests for which this membership is an eligible participant.

Not:

> can approve every Client artifact.

---

# 83. Project permission ≠ approval permission

```text
portal.projects.read
≠
portal.approvals.decide
```

Project visibility alone never authorizes a formal decision.

---

# 84. Review permission ≠ approval permission

```text
portal.designs.comment
≠
portal.approvals.decide
```

This remains especially important around Design 050.

---

# 85. Approval decision should be server-authoritative

UI button visibility is not security.

`decideApproval()` must verify:

* authenticated Portal actor,
* active membership,
* ApprovalRequest active,
* exact participant eligibility,
* policy sequence/quorum,
* exact subject version,
* request not superseded/expired,
* decision not already recorded.

---

# 86. Approval event integration

Canonical domain events can include conceptually:

```text
ApprovalRequested
ApprovalParticipantAdded
ApprovalDecisionRecorded
ApprovalRequestCompleted
ApprovalRequestSuperseded
ApprovalRequestWithdrawn
```

These can feed:

* Client Action Resolver,
* Project workflow,
* Notifications,
* Activity,
* Audit.

---

# 87. Notification integration

Events such as:

* new Approval required,
* approval due soon,
* approval superseded,
* approval completed,

can generate Notifications.

But:

```text
Notification read
≠
Approval decided
```

---

# 88. Design 064 Notifications relationship

Client Notifications Center later consumes approval notifications.

Design 052 remains the formal Approval source.

---

# 89. Activity integration

Design 063 may show:

> Final Proof approved by Michael.

The Activity event references canonical ApprovalDecision.

Activity does not become decision evidence.

---

# 90. Audit integration

Formal approval is high-value and should have strong Design 039 Audit linkage.

An AuditEvent should preserve:

```text
actor
ApprovalRequest
subject/version
decision action
timestamp
organization/Client context
request/correlation metadata
outcome
```

without unnecessarily duplicating entire artifact contents.

---

# 91. Audit ≠ Approval history

Approval history is a business-domain projection.

Audit is forensic/accountability evidence.

Both can reference the same underlying event but remain different systems.

---

# 92. ApprovalDecision should remain reconstructable

For sensitive workflows, the platform should be able to answer:

> Exactly what did this person approve?

That requires:

```text
ApprovalDecision
→ ApprovalRequest
→ exact subject version
```

plus actor/time/policy lineage.

---

# 93. Source artifact deletion restrictions

An artifact/version referenced by a formal ApprovalDecision should not be casually hard-deleted in a way that destroys evidence.

Design 030 retention/dependency rules must account for approval references.

---

# 94. Approved artifact ≠ final publication automatically

Even after all required approvals:

```text
Approval gate satisfied
```

only means the source workflow can evaluate its next transition.

Publication remains a separate process.

---

# 95. State Coverage

Design 052 inherits Design 150 plus Approval-specific states:

```text
Approvals Loading
Approvals Available

No Approvals
No Approvals Requiring Your Action
No Results for Filters

Approval Requested
Pending Your Decision
Waiting on Another Approver
Decision Recorded
Approval Completed

Approved
Rejected / Declined where policy supports
Changes Required where policy supports

Due Soon
Overdue
Expired

Withdrawn
Superseded

Subject Available
Subject Rendering Unavailable
Subject Access Restricted

Decision Submitting
Decision Recorded
Decision Failed
Decision Already Recorded

Approval Updated Elsewhere
Participant Removed
Access Revoked

Approval State Partially Available
Partial Service Failure
```

These must **not** become one giant Approval status enum.

---

# 96. No Approvals ≠ no action required

The Client may have no ApprovalRequests but still have:

* Questionnaire action,
* file request,
* payment action.

Design 047 remains the cross-domain action surface.

---

# 97. No approvals for me ≠ no approvals on Project

A Project might have a pending ApprovalRequest assigned to another Client participant.

Design 052 needs clear viewer/action semantics.

---

# 98. Pending ≠ waiting on me

Already critical enough to repeat:

```text
ApprovalRequest pending
≠
current user action required
```

The Client Action resolver must evaluate participant eligibility.

---

# 99. Subject unavailable ≠ Approval completed

If Proof rendering temporarily fails:

do not make approval disappear.

The Request remains pending but the Client may be unable to decide until the subject is safely viewable.

---

# 100. Approval service unavailable ≠ zero approvals

Design 041/047 must not show:

> You're all caught up.

if the Approval service cannot be evaluated.

---

# 101. Decision failed ≠ rejected

Technical failure submitting:

> Approve

must never turn into a business:

> Rejected.

Infrastructure and decision outcomes stay separate.

---

# 102. Responsive Behavior — Desktop

Desktop should preserve a clear formal-decision queue:

```text
Client Approvals
↓
Summary / Counts
↓
Needs Your Decision
↓
Approval Cards/List
    ├── Subject
    ├── Project
    ├── Exact version
    ├── Requested by
    ├── Due date
    ├── Approval state
    └── Review / Decide
↓
Waiting on Others
↓
Completed / History
```

Where artifact review is required, the approval workspace deep-links to the relevant exact-version review/detail screen.

---

# 103. Responsive — Tablet

Following Design 152:

* approval rows become cards where necessary,
* subject/version remains prominent,
* due status remains visible,
* decision controls stay touch-safe,
* historical details move into drawer/detail view.

---

# 104. Responsive — Mobile

Priority:

```text
Approvals
↓
Needs Your Decision
↓
Approval Card
    ├── Project
    ├── Exact Subject / Version
    ├── Why approval is required
    ├── Due date
    └── Review & Decide
↓
Waiting on Others
↓
Completed
```

Mobile must never collapse the exact version/context just to save space.

---

# 105. Mobile formal-decision safety

Before recording a decision, confirm enough context to prevent accidental approval:

```text
Project
Subject
Version
Decision
```

Where appropriate:

> You are approving Final Magazine Proof — Version 5.

---

# 106. Accessibility

Approval status cannot rely only on:

* green check,
* red cross,
* orange dot.

Use explicit semantic text:

> Awaiting your approval
> Approved August 18
> Waiting for another approver
> Superseded by Version 6

Decision controls must be fully keyboard/screen-reader accessible.

---

# 107. Backend Query Model

Conceptually:

```text
ClientApprovalsView
├── current Portal membership
├── authorized ApprovalRequests
├── exact subject summaries
├── Project/context
├── participant state
├── safe aggregate Approval state
├── due condition
├── Client-safe requester
├── formal decision history if permitted
├── available actions
├── filters/counts
└── partial-data state
```

This is a Client-safe read model over Design 029.

---

# 108. Backend Mutation Architecture

The principal Client write should be narrow:

```text
decideApproval(
  approvalRequestId,
  decision,
  expectedSubjectVersion,
  idempotencyKey
)
```

Conceptually.

It validates current policy and participant eligibility server-side.

Avoid:

```text
PATCH /client/approvals/:id
{
  approved: true,
  projectStage: "next",
  proofStatus: "approved"
}
```

That would destroy domain boundaries.

---

# 109. Backend Architecture

```text
Design 052
    ↓
ClientPortalSessionContext
    ↓
Client Approval Authorization
    ↓
ApprovalRequest Query
    ↓
ApprovalParticipant / Policy Evaluation
    ↓
Exact Subject Projection
    ↓
ClientApprovalsView
```

Decision path:

```text
Client Decide
    ↓
decideApproval()
    ↓
ApprovalDecision
    ↓
ApprovalPolicy Evaluation
    ↓
ApprovalRequest aggregate outcome
    ↓
Domain Event
    ├── Client Action Resolver
    ├── Project/Workflow gate
    ├── Notifications
    ├── Activity
    └── Audit
```

---

# 110. Backend Requirements

| Requirement                                         | Status                        |
| --------------------------------------------------- | ----------------------------- |
| Client Portal authentication                        | **Critical**                  |
| Active Portal membership                            | **Critical**                  |
| Client/account isolation                            | **Critical**                  |
| Canonical ApprovalRequest reuse                     | **Critical**                  |
| ApprovalParticipant model                           | **Critical**                  |
| ApprovalDecision model                              | **Critical**                  |
| ApprovalPolicy / policy snapshot/version            | **Critical**                  |
| Exact-version subject binding                       | **Critical**                  |
| Subject type + subject ID lineage                   | **Critical**                  |
| Client/Internal approval audience separation        | **Critical**                  |
| Viewer vs approver separation                       | **Critical**                  |
| Participant eligibility evaluation                  | **Critical**                  |
| Sequential/parallel policy support where required   | **Critical**                  |
| Individual decision vs aggregate outcome separation | **Critical**                  |
| Supersession semantics                              | **Critical**                  |
| Withdrawn/expired distinction                       | **Critical**                  |
| Due-condition calculation                           | **Critical**                  |
| Source artifact authorization                       | **Critical**                  |
| DraftVersion integration                            | **Critical where applicable** |
| ProofVersion integration                            | **Critical where applicable** |
| ReportVersion integration                           | **Critical where applicable** |
| ContractVersion integration                         | **Critical where applicable** |
| Review/Approval separation                          | **Critical**                  |
| Signature/Approval separation                       | **Critical**                  |
| Client Action Resolver integration                  | **Critical**                  |
| Project/workflow gate integration                   | **Critical**                  |
| Idempotent decision submission                      | **Critical**                  |
| Concurrency/current-state validation                | **Critical**                  |
| Notification integration                            | **Required**                  |
| Activity integration                                | **Required**                  |
| Audit integration                                   | **Critical**                  |
| Historical decision preservation                    | **Critical**                  |
| Actor attribution after offboarding                 | **Critical**                  |
| Permission-safe search                              | **Critical**                  |
| Partial source/render failure                       | **Critical**                  |
| Design 029 backend reuse                            | **Critical**                  |
| Design 115 infrastructure reuse                     | **Critical architecture**     |

---

# 111. Consolidation — Main Implementation Risks

Design 052 exposes several critical risks:

**Review/Approval conflation**
Client feedback becomes a formal decision.

**Comment/ApprovalDecision conflation**
“Looks good” becomes Approved.

**ApprovalRequest/source-artifact conflation**
Approval state is stored directly on the Draft/Proof.

**Latest-version approval bug**
Request points to parent artifact instead of exact version.

**Approval transitivity bug**
Approval of v5 automatically applies to v6.

**Approval/Signature conflation**
Contract signature and business approval become one state.

**ApprovalParticipant/Portal Role conflation**
Client administrator automatically becomes approver.

**Client account/participant conflation**
Every Client member can approve.

**Viewer/approver conflation**
Any user who can see the request can decide it.

**Project access/approval authority conflation**
Project read grants formal decision rights.

**Policy/Request conflation**
Changing approval policy rewrites active/historical requests.

**Participant state/request state conflation**
One person's decision marks the entire multi-approver request complete.

**Individual Decision/aggregate outcome conflation**
Evidence of who decided what is lost.

**Sequential/parallel policy hard-coding**
UI determines approval order.

**Pending/actionable conflation**
Client Action queue shows approvals belonging to someone else.

**Due condition/lifecycle conflation**
Overdue becomes formal decision state.

**Expired/rejected conflation**
No-decision expiration becomes Client rejection.

**Withdrawn/rejected conflation**
Requester cancellation appears as rejection.

**Superseded/rejected conflation**
New artifact version makes old approval look rejected.

**Workflow-state/Approval-state conflation**
Client button directly advances Project stage.

**Artifact approval/Project approval conflation**
Cover approval marks whole Project approved.

**Approved/published conflation**
Formal decision automatically publishes content.

**Subject visibility/download conflation**
Approver receives source/high-resolution files unintentionally.

**Approval search leakage**
Sensitive subject names appear to unauthorized Client users.

**Decision technical failure/business rejection conflation**
API failure records a Reject decision.

**Duplicate decision submission**
Network retry creates multiple decisions.

**Stale decision execution**
Client approves a Request already superseded by another version.

**Approval history/Audit conflation**
Business history and forensic Audit become duplicate/contradictory systems.

**052/029 duplicate Approval engines**
Client Portal creates a second approval model.

**052/115 duplicate approval-gate systems**
Project Approval History gets separate decision truth.

**052/049–050 duplicate approval buttons/state machines**
Artifact Review screens implement their own approval logic.

No additional design is required.

These are **formal decision, policy, versioning, authorization, evidence, concurrency, and workflow-boundary requirements**.

# Design 052 Audit Verdict

## **PASS — CLIENT FORMAL APPROVAL QUEUE & EXACT-VERSION DECISION ANCHOR**

**Domain directive:** **Review ≠ ApprovalRequest ≠ ApprovalParticipant ≠ ApprovalDecision ≠ ApprovalPolicy ≠ source workflow state.**

**Reuse directive:** Design 029 remains the single canonical Approval infrastructure for internal and Client-facing approval operations. Design 052 is a Client-safe queue/projection over that engine.

**Subject directive:** every ApprovalRequest references an explicit subject type and exact immutable subject/version ID. “Latest artifact” is never acceptable formal approval evidence.

**Version directive:** approval of Draft/Proof/Report/Contract version N applies only to that exact version unless a separately governed policy explicitly defines otherwise.

**Review directive:** ReviewComments, annotations, feedback submission and resolved discussions from Designs 049–050 remain collaboration signals, never formal decisions.

**Participant directive:** ApprovalParticipant explicitly determines who may act. Viewer, reviewer, Portal administrator, Project viewer and approver remain different roles.

**Policy directive:** sequential, parallel, quorum or other approval rules belong to versioned/snapshotted ApprovalPolicy semantics—not frontend logic.

**Decision directive:** each formal ApprovalDecision is immutable, actor-attributed, time-stamped and linked through the ApprovalRequest to the exact subject version.

**Aggregate directive:** individual participant decisions and overall ApprovalRequest outcome remain separate so multi-approver workflows remain reconstructable.

**Contract directive:** Contract approval and Contract signature/execution remain distinct concepts; Design 052 must not replace Designs 019/053/070 signing semantics.

**Action directive:** only ApprovalRequests currently requiring action from the logged-in eligible participant feed that participant's `ClientActionView`.

**Workflow directive:** Approval completion emits domain state that a Project/workflow gate can consume. Design 052 never directly mutates Project or production stage.

**Supersession directive:** withdrawn, expired, superseded, rejected and approved are distinct outcomes/conditions. A new artifact version never rewrites historical Approval evidence.

**Authorization directive:** `approval.read`, `approval.decide`, Project access and underlying artifact permissions remain separately evaluated.

**Security directive:** Client Approval DTOs exclude internal notes, internal approval participants, internal escalation data and workflow diagnostics.

**Idempotency directive:** `decideApproval()` performs fresh participant, policy, request-state and exact-version validation and is replay-safe.

**Audit directive:** formal Approval actions are high-value Design 039 Audit events while Approval history remains the canonical business-domain decision history.

**Reliability directive:** pending, waiting-on-others, overdue, expired, withdrawn, superseded, subject-unavailable, restricted and technical-failure states remain distinct.

**Responsive directive:** desktop provides the full decision queue/history; mobile prioritizes exact subject/version → Project → due state → formal decision, with enough confirmation context to prevent accidental approval.

**Overlap directive:** Designs **029, 041–044, 047, 049–053, 056 and 115** must consume one ApprovalRequest + Participant + Policy + Decision + exact-subject + audit/workflow integration foundation.

**Consolidation directive:** **STANDARDIZE ONE PLATFORM-WIDE FORMAL APPROVAL ENGINE — APPROVALREQUEST + EXACT SUBJECT VERSION + APPROVALPARTICIPANT + VERSIONED POLICY + APPROVALDECISION + AGGREGATE OUTCOME + SUPERSESSION + WORKFLOW GATE + AUDIT — WITH INTERNAL AND CLIENT-SAFE PROJECTIONS, AND DO NOT BUILD APPROVAL STATE MACHINES INSIDE DRAFT REVIEW, DESIGN REVIEW, CONTRACTS, REPORTS OR PROJECT SCREENS.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **52 / 153** |
| **PASS**                                   |                         **52** |
| **STANDARDIZE decisions**                  |                         **50** |
| **Potential implementation-overlap flags** |                         **43** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**52 / 153 = 34.0% audited.**

### Canonical Approval architecture after Design 052

```text
                 APPROVAL POLICY
                       │
                       ↓
                APPROVAL REQUEST
                       │
              Exact Subject Version
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
     Participant A  Participant B  Participant C
          │            │            │
          ↓            ↓            ↓
       Decision      Decision      Decision
          └────────────┬────────────┘
                       ↓
              POLICY EVALUATION
                       ↓
           APPROVAL REQUEST OUTCOME
                       ↓
     ┌─────────────────┼─────────────────┐
     ↓                 ↓                 ↓
Workflow Gate    Client Action       Audit/Event
                     Resolver
```

And the audience architecture remains:

```text
                 ONE APPROVAL DOMAIN
                         │
        ┌────────────────┼─────────────────┐
        ↓                ↓                 ↓
 Design 029         Design 052        Design 115
 Internal           Client Portal     Project Gate /
 Approval Center    Approvals         Approval History
```

while artifact collaboration stays separate:

```text
Draft / Proof Version
        │
        ├── ReviewSession
        │      └── Comments / Feedback
        │
        └── ApprovalRequest
               └── Formal Decision
```

# Next Sequential Audit Target

## **Design 053 — Client Contracts**

Its frozen identity is already locked.

The next audit must preserve the next major legal/business boundary:

> **Proposal ≠ Contract ≠ ContractVersion ≠ ContractParty ≠ Signer ≠ ApprovalRequest ≠ SignatureRequest ≠ SignatureEvent ≠ Contract Execution State.**

It must also reconcile the canonical Contract foundation already established by **Design 019** with the Client Portal contract workspace, while keeping **formal approval and legally meaningful signing/execution separate**.

After Design 053 we continue strictly:

**054 Client Invoices & Payments → 055 Client Publishing & Distribution → 056 Client Reports & Downloads → 057 Client Renewal / Continuation Workspace → … → 077 Client Access Recovery**

with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
