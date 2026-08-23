Verified against the frozen 153-design roadmap: the exact approved identity is:

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 029 — Approval Center / Approval Workspace

This is **not another product-specific production workspace**. It is the first major **cross-domain decision workspace** after Editorial, Magazine, Podcast, Video, and Event production.

Its job is to unify approval work without creating separate approval truth inside every module.

| Audit field                     | Classification                                                                                                                                                                                                                                |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                   | **029**                                                                                                                                                                                                                                       |
| **Canonical name**              | **Approval Center / Approval Workspace**                                                                                                                                                                                                      |
| **Product area**                | Approvals / Operations / Cross-Domain Workflow                                                                                                                                                                                                |
| **User surface**                | Team Workspace                                                                                                                                                                                                                                |
| **Screen class**                | Cross-Domain Decision Queue + Approval Operations Workspace                                                                                                                                                                                   |
| **Classification**              | **Unique Anchor — Approval Operations Family**                                                                                                                                                                                                |
| **Primary purpose**             | Provide one centralized workspace for authorized users to discover, review, decide, track, escalate, and audit approval requests originating across Editorial, Magazine, Podcast, Video, Event, Project, Commercial, and Publishing workflows |
| **Primary entity**              | **ApprovalRequest**                                                                                                                                                                                                                           |
| **Core related entities**       | ApprovalDecision, ApprovalParticipant/Approver, ApprovalPolicy, ApprovalSubjectReference                                                                                                                                                      |
| **Referenced subject entities** | DraftVersion, DesignVersion, ProofVersion, VideoVersion, PodcastMediaVersion, ProposalVersion, ContractVersion, ProjectGate, Publication/other versioned artifact                                                                             |
| **Supporting entities**         | Project, Client, User, Comment, File/Asset, Task, Notification, Activity                                                                                                                                                                      |
| **Parent shell**                | `InternalAppShell` — Design 001                                                                                                                                                                                                               |
| **Template family**             | `ApprovalQueueWorkspaceTemplate` / `ReviewApprovalTemplate`                                                                                                                                                                                   |
| **Auth**                        | Required                                                                                                                                                                                                                                      |
| **Permissions**                 | Approval read/decide/reassign/escalate/override + underlying subject access                                                                                                                                                                   |
| **Implementation priority**     | **Core / Critical**                                                                                                                                                                                                                           |
| **Reuse level**                 | **Platform-wide / Extremely High**                                                                                                                                                                                                            |

---

# 1. Functional responsibility

Design 029 answers:

> **“Across everything I am authorized to approve, what is waiting for a decision, what exactly am I approving, which version is frozen for review, when is it due, what context do I need, and what decision has already been recorded?”**

The cross-product architecture becomes:

```text
Editorial  ─────┐
Magazine   ─────┤
Podcast    ─────┤
Video      ─────┤
Event      ─────┤
Projects   ─────┤
Proposal   ─────┤
Contract   ─────┤
Publishing ─────┘
       ↓
ApprovalRequest
       ↓
DESIGN 029
Approval Center
       ↓
Decision
       ↓
Source workflow continues
```

The central rule is:

> **Approval Center aggregates approvals. It does not create a second approval model for each product.**

---

# 2. ApprovalRequest is the canonical decision record

The common architecture should revolve around a first-class:

```text
ApprovalRequest
```

Conceptually:

```text
ApprovalRequest
├── id
├── organization/workspace
├── subject reference
├── approval type/policy
├── requested by
├── requested at
├── approver(s)
├── due date
├── state
├── visibility/context
└── decision history
```

Exact schema and enums belong to Phase 3D.

---

# 3. Approval ≠ Review

This distinction has appeared repeatedly in Designs 018–028 and becomes platform-level here.

### Review

Collaborative evaluation:

* comments,
* annotations,
* discussion,
* changes requested,
* inspection.

### Approval

Authoritative decision:

> **May this exact subject/version progress?**

Therefore:

```text
Review
≠
ApprovalRequest
≠
ApprovalDecision
```

They can work together without becoming the same entity.

---

# 4. ApprovalRequest ≠ ApprovalDecision

An ApprovalRequest represents:

> **A decision that is required.**

An ApprovalDecision represents:

> **The actual authoritative outcome submitted by an authorized actor.**

Conceptually:

```text
ApprovalRequest
       ↓
ApprovalDecision
```

This distinction supports:

* pending state,
* reassignment,
* escalation,
* expiry,
* multiple approvers,
* historical decisions.

---

# 5. Approval must reference the exact subject

Never create ambiguous approvals such as:

```text
"Approve TechNova magazine"
```

when the real decision concerns:

```text
Final Proof v4
```

The request should bind to a canonical subject reference.

Examples:

```text
ApprovalRequest
 → DraftVersion v7
```

```text
ApprovalRequest
 → CoverDesignVersion v3
```

```text
ApprovalRequest
 → VideoVersion v5
```

```text
ApprovalRequest
 → ProposalVersion v2
```

---

# 6. Version-specific approval is mandatory

This is now a global invariant.

If:

```text
Proof v3
APPROVED
```

and:

```text
Proof v4
CREATED
```

then:

```text
v4 = NOT APPROVED
```

unless an explicitly defined policy handles non-material amendments.

Approval must never drift automatically to “latest version.”

---

# 7. Approval Center must not resolve subject versions dynamically

Dangerous implementation:

```text
approval.subjectId = magazineId

UI → load latest proof
```

Correct implementation:

```text
approval.subjectType = PROOF_VERSION
approval.subjectId = proofVersionId
```

or an equivalent strongly typed polymorphic reference.

The approved object must remain reconstructable forever.

---

# 8. Subject-type abstraction

Because Design 029 is cross-domain, the Approval system needs a safe subject abstraction.

Conceptually:

```text
ApprovalSubjectReference
├── subjectType
├── subjectId
└── subjectVersion/reference
```

Supported subject types should be explicitly registered.

Do not allow arbitrary user-provided table names or executable object references.

---

# 9. Approval Center ≠ subject editor

Design 029 should allow the approver to understand the subject and decide.

It should **not rebuild every source application inside the approval screen**.

Correct:

```text
Approval Center
   ↓
Preview sufficient decision context
   ↓
Open Full Subject when needed
```

For example:

* Draft → editorial workspace
* Proof → magazine proof workspace
* Video → video review
* Contract → contract workspace

---

# 10. Shared preview adapters

A clean architecture is:

```text
Approval Center
       ↓
ApprovalSubjectPresenter
       │
       ├── Draft presenter
       ├── Design/Proof presenter
       ├── Video presenter
       ├── Podcast presenter
       ├── Proposal presenter
       └── Contract presenter
```

This gives Design 029 a unified UX without forcing every artifact into one identical data model.

---

# 11. Approval state ≠ subject state

Example:

```text
VideoVersion:
READY_FOR_REVIEW

ApprovalRequest:
PENDING
```

Then:

```text
ApprovalRequest:
APPROVED
```

does not mean every unrelated VideoProject state should automatically become `APPROVED`.

The source workflow determines the downstream transition.

---

# 12. Decision → domain event → workflow transition

Correct architecture:

```text
Approver decides
       ↓
Approval Service
       ↓
ApprovalDecision persisted
       ↓
ApprovalApproved event
       ↓
Source workflow reevaluates
       ↓
Transition if rules permit
```

Incorrect:

```text
Approval UI
↓
directly set magazine.stage = "Next"
```

Design 029 must never contain hard-coded product-specific stage mutations.

---

# 13. Approved ≠ workflow automatically advanced

Some workflows can auto-advance.

Others may require:

* another approval,
* missing assets,
* payment,
* another mandatory gate.

Therefore:

```text
Approval complete
≠
workflow transition guaranteed
```

The source Workflow Engine remains authoritative.

---

# 14. Changes Requested ≠ Rejected

These require careful separation if both are supported.

### Changes Requested

> The subject should be revised and submitted again.

### Rejected

> The requested progression is denied.

These may have different downstream semantics.

Exact states belong to Phase 3D.

Do not casually collapse everything negative into:

```text
NOT_APPROVED
```

---

# 15. Decision state vs request lifecycle

Conceptually the platform may need distinctions such as:

### Request lifecycle

```text
OPEN
COMPLETED
CANCELLED
EXPIRED
```

### Decision

```text
APPROVED
CHANGES_REQUESTED
REJECTED
```

Exact enum vocabulary comes later.

The key principle:

> Request lifecycle and decision outcome are separate concepts.

---

# 16. Pending ≠ overdue

An approval can be:

```text
State:
PENDING

Due condition:
OVERDUE
```

Overdue should generally be derived from:

```text
no final decision
+
dueAt < now
```

Do not invent separate statuses such as:

```text
PENDING_OVERDUE
```

unless Phase 3D explicitly chooses that normalization.

---

# 17. Priority ≠ due condition

Example:

```text
Priority: HIGH
Due Condition: DUE_SOON
State: PENDING
```

All three communicate different facts.

Design 029 should preserve those dimensions.

---

# 18. Internal approval ≠ Client approval

This is one of the most important Approval Center boundaries.

### Internal approval

Performed by:

* Editor,
* Manager,
* Art Director,
* Finance,
* Legal,
* Admin,
* Production Lead.

### Client approval

Performed externally through Client Portal or another controlled external decision surface.

They can use the **same canonical ApprovalRequest domain** but different authorization and visibility policies.

---

# 19. One Approval backend, multiple UX surfaces

Correct architecture:

```text
                   Approval Service
                         │
          ┌──────────────┴──────────────┐
          ↓                             ↓
Team Approval Center             Client Approval UI
Design 029                       Client Portal
```

Both operate against the same authoritative ApprovalRequest/Decision system.

No parallel internal/client approval databases.

---

# 20. Approval participant ≠ arbitrary User

An Approval can involve:

* internal User,
* Client Portal user,
* possibly authorized external participant.

Therefore approver assignment should use a clear actor model.

Conceptually:

```text
ApprovalParticipant
├── actor type
├── actor reference
├── role
├── order/group
└── decision authority
```

Exact implementation waits for Phase 3D.

---

# 21. Viewer ≠ approver

A user may have permission to see an Approval Request but not decide it.

```text
approval.read
≠
approval.decide
```

This distinction must be server-side.

Hiding Approve/Reject buttons is insufficient.

---

# 22. Commenter ≠ approver

Likewise:

```text
review.comment
≠
approval.decide
```

An Editor might provide feedback without having final authority.

The Approval Center should visually explain responsibility but not collapse permissions.

---

# 23. Requester ≠ approver

For governance-sensitive approvals, the requester may not be permitted to approve their own request.

Example:

```text
Proposal creator
≠
Proposal commercial approver
```

or:

```text
Designer
≠
Final design approver
```

The Approval policy must be capable of enforcing separation of duties.

---

# 24. ApprovalPolicy

A reusable `ApprovalPolicy` concept can determine:

* required approver role,
* number of approvals,
* sequential vs parallel,
* self-approval rules,
* due SLA,
* escalation,
* override authority.

Do not hard-code these rules into each product screen.

---

# 25. Single approval vs multiple approvals

Some requests may need one decision:

```text
Art Director approval
```

Others can require:

```text
Editorial Lead
      ↓
Client
```

or:

```text
Finance + Manager
```

The underlying model should not assume every ApprovalRequest has exactly one approver.

---

# 26. Sequential vs parallel approvals

Conceptually:

### Sequential

```text
Approver A
   ↓
Approver B
   ↓
Client
```

### Parallel

```text
        ┌→ Approver A
Request ├→ Approver B
        └→ Approver C
```

Final completion rules belong to ApprovalPolicy.

This does not require additional screens.

---

# 27. Quorum / all-required semantics

The Approval service may need policy semantics such as:

```text
ALL_REQUIRED
ANY_ONE
N_OF_M
```

only if supported by actual workflows.

The audit does not force advanced approval complexity into V1.

It simply ensures the architecture does not hard-code:

> exactly one approver forever.

---

# 28. Reassignment

Approval ownership may need reassignment.

Example:

```text
Sarah
 ↓
on leave
 ↓
Michael
```

A reassignment should preserve:

* original approver,
* new approver,
* actor,
* reason,
* timestamp.

Never rewrite assignment history silently.

---

# 29. Delegation ≠ reassignment

If delegation exists later:

> Sarah remains the designated approver, but Michael may act during a defined period.

That is different from permanent reassignment.

No new feature is being designed here; Phase 3D merely needs to avoid conflating the concepts if delegation belongs to approved requirements.

---

# 30. Escalation

An overdue approval might produce:

```text
Approval overdue
       ↓
Escalation policy
       ↓
Manager notification/reassignment
```

The Approval Center may display escalation state.

But Notification delivery belongs to the canonical Notification/Automation services.

Do not build an Approval-specific notification engine.

---

# 31. Reminder ≠ escalation

A reminder says:

> Please make your decision.

An escalation says:

> This approval exceeded policy and requires elevated attention/action.

These should remain distinct operational events.

---

# 32. Approval override

Some authorized administrators/managers may need exceptional override capability.

If supported, it must preserve:

```text
override actor
reason
timestamp
original requirement
original approvers
result
```

An override should never look indistinguishable from ordinary approval.

---

# 33. Override ≠ impersonation

Do not record:

> Client approved

when an internal administrator actually overrode the Client approval gate.

Correct history:

```text
Approval requirement overridden
by Authorized Admin
Reason: ...
```

This distinction is critical for trust and auditability.

---

# 34. Approval cancellation

If the originating artifact becomes obsolete:

```text
Proof v3 approval pending
       ↓
Proof v4 replaces it
```

the v3 request may become cancelled/superseded according to policy.

Do not delete the v3 Approval Request.

History must remain.

---

# 35. Superseded request ≠ decision

If a request becomes obsolete before anyone decides:

```text
Request:
SUPERSEDED
```

is not the same as:

```text
Decision:
REJECTED
```

This matters for performance and reporting.

---

# 36. Approval comments

Decision-related comments need durable linkage.

Conceptually:

```text
ApprovalComment
├── approvalRequestId
├── actor
├── body
├── visibility
└── timestamps
```

or reuse the common Comment service with typed subject linkage.

Avoid storing one mutable:

```text
approval.notes
```

field.

---

# 37. Internal comments ≠ external comments

An Approval may involve internal and external discussion.

Visibility should be explicit:

```text
INTERNAL_ONLY
CLIENT_VISIBLE
```

or equivalent policy.

Client API serializers must filter this server-side.

---

# 38. Approval evidence

A decision should preserve enough evidence to answer:

* who decided,
* what they decided,
* when,
* which version,
* under which policy,
* optional decision comment,
* where applicable, method/context.

This is especially critical for Contract, Proposal and final publication approvals.

---

# 39. Decision immutability

Completed Approval Decisions are high-value historical records.

They should generally be append-only/immutable.

If a correction is required:

```text
original decision
      ↓
revocation/superseding decision
```

is stronger than silently editing historical truth.

---

# 40. Approval Center queue

Design 029 should support a unified queue over canonical approvals.

Useful query dimensions include:

* My approvals,
* Team approvals,
* Pending,
* Due soon,
* Overdue,
* Changes requested,
* Completed,
* subject/product type,
* Project,
* Client,
* requester,
* approver.

These are views over one Approval dataset.

---

# 41. Saved View ≠ Approval List

Reuse the Saved View architecture established in CRM.

A Saved View stores:

```text
filters
sorting
presentation
```

It does not duplicate Approval Requests into another collection.

---

# 42. Approval list should use shared list infrastructure

Design 029 can reuse:

`PageHeader`
`SearchInput`
`FilterBar`
`SavedViewSelector`
`DataTable` / responsive cards
`BulkActionBar` where permitted
`StatusBadge`
`Owner/ApproverCell`
`DueDateIndicator`

No bespoke table implementation is needed.

---

# 43. Approval quick view

A reusable:

```text
ApprovalQuickViewDrawer
```

can display:

* subject summary,
* version,
* requester,
* due date,
* context,
* preview,
* comments,
* prior decisions,
* approval controls.

But it should not recreate the entire source workspace.

---

# 44. Full review handoff

For complex subjects:

```text
Approval Center
      ↓
Open Full Review
      ↓
Domain Review Workspace
```

Examples:

* magazine proof,
* video media review,
* Contract legal review.

The Approval Center remains the queue/orchestration surface.

---

# 45. Bulk approval is high risk

Even if the visual supports bulk selection, actual bulk decision semantics require strict control.

Safe distinction:

```text
Bulk assign/remind
```

may be broadly valid.

But:

```text
Bulk approve
```

may be inappropriate for high-value/versioned artifacts.

Phase 3D should explicitly define which approval types support bulk decision.

Do not assume a generic BulkAction component means every action is legal in bulk.

---

# 46. Cross-domain subject permissions

Being assigned an Approval Request does not automatically mean the user may access every field of the underlying subject.

The query layer needs a deliberate context projection.

For example, an approver may see enough Contract information to decide without receiving unrelated Finance or Client data.

---

# 47. Approval permission + subject permission

A robust model should evaluate both:

```text
Can access ApprovalRequest?
AND
Can access required subject context?
AND
Can submit this decision?
```

The exact interaction belongs to Phase 3D.

Do not assume `approval.decide` grants unrestricted access to the entire related Project.

---

# 48. Tenant isolation

Every Approval must be organization/workspace scoped.

A cross-domain Approval Center is particularly dangerous because a query bug could expose:

* other Clients,
* commercial proposals,
* Contracts,
* unpublished content.

Tenant scoping must happen before all other filtering.

---

# 49. Client approval isolation

External approvers should only ever receive requests tied to their authorized:

```text
Client / Portal Organization
+
Project
+
subject
```

Never reuse the unrestricted internal Approval Center ORM result in Client Portal APIs.

---

# 50. Review artifact security

Approval previews may expose:

* PDFs,
* videos,
* design files,
* Contracts,
* internal documents.

Access should use canonical File/Asset permission enforcement and short-lived/safe delivery where appropriate.

A preview URL should not become an unrestricted public file URL.

---

# 51. Approval expiration vs overdue

These are different.

### Overdue

Decision is still allowed but beyond its target date.

### Expired

Request can no longer be decided without renewal/reissue.

If expiration exists for a particular policy, preserve it separately.

---

# 52. Due dates and SLA

Approvals can participate in operational SLA calculations.

Conceptually:

```text
requestedAt
dueAt
decidedAt
```

allows:

```text
approval turnaround
overdue duration
client wait time
internal wait time
```

These timestamps should be canonical.

---

# 53. Internal wait vs Client wait

Because the platform distinguishes Client and internal dependencies, Approval analytics should too.

Example:

```text
Total approval wait:
5 days

Internal approval:
1 day

Client approval:
4 days
```

This becomes extremely valuable for Project and Operations reporting.

---

# 54. Approval Center ≠ Notification Center

Design 029 shows actionable decision work.

Notifications merely inform users that something happened.

Correct:

```text
Notification
   ↓
Open Approval Request
   ↓
Approval Center
```

Do not merge Designs 029 and 080.

---

# 55. Approval Center ≠ My Work

Design 078 later aggregates personal work across:

* Tasks,
* approvals,
* follow-ups,
* other assignments.

Design 029 is deeper and Approval-specific.

Expected relationship:

```text
My Work
 ↓
Approval item
 ↓
Approval Center / Request
```

One Approval backend serves both.

---

# 56. Relationship to Project Approval Gates

Later Design 115 covers:

**Project Approval Gates / Approval History.**

Correct architecture:

```text
Canonical Approval Domain
        │
        ├── Design 029
        │   Cross-domain approval queue
        │
        └── Design 115
            Project-specific gates/history
```

Do not create another Project Approval database.

---

# 57. Relationship to Proposal Approval

Designs 018 and later 098 should use the same Approval domain.

```text
ProposalVersion
      ↓
ApprovalRequest
      ↓
Design 029 / Design 098
```

Design 098 can provide richer Proposal-specific review while Design 029 provides centralized queueing.

---

# 58. Relationship to Contract Approval

Design 019 follows the same pattern:

```text
ContractVersion
      ↓
ApprovalRequest
      ↓
Approval Center
```

Contract-specific legal rules remain in the Contract domain.

The Approval service stores the decision—not the Contract terms.

---

# 59. Relationship to Editorial approvals

Design 024:

```text
DraftVersion
      ↓
Internal Approval
      ↓
ApprovalRequest
```

Client Draft approval can use the same foundation with client-safe UX.

---

# 60. Relationship to Magazine approvals

Design 025 may generate approval subjects such as:

```text
CoverDesignVersion
ProofVersion
FinalProofVersion
```

All can enter Design 029 without magazine-specific Approval tables.

---

# 61. Relationship to Podcast/Video approvals

Designs 026–027 generate:

```text
PodcastMediaVersion
VideoVersion
ThumbnailVersion
```

where approval is required.

Design 029 should consume the same Review/Approval foundation.

This confirms a major consolidation finding:

> **One cross-domain Approval platform is mandatory.**

---

# 62. Relationship to Event approvals

Design 028 may generate approvals for:

* agenda,
* branding,
* event program,
* partner materials,
* final outputs.

Again:

```text
Event-specific subject
       ↓
ApprovalRequest
```

not an Event-only approval engine.

---

# 63. Reusable component family

Design 029 establishes:

```text
ApprovalOperationsFamily
├── ApprovalQueue
├── ApprovalCard
├── ApprovalStatusBadge
├── ApprovalPriorityBadge
├── ApprovalDueIndicator
├── ApprovalSubjectPreview
├── ApprovalContextPanel
├── ApproverAvatarGroup
├── DecisionPanel
├── DecisionHistory
├── ApprovalCommentThread
├── ReassignApproverDialog
├── EscalationIndicator
└── ApprovalQuickViewDrawer
```

These should be reused everywhere approvals appear.

---

# 64. ReviewApprovalTemplate

We can now formally separate:

```text
ApprovalQueueWorkspaceTemplate
```

for Design 029

from:

```text
ReviewApprovalTemplate
```

for detailed review surfaces.

Relationship:

```text
Queue
 ↓
specific Approval
 ↓
Review/Decision workspace
```

Both share the same Approval domain.

---

# 65. Permissions architecture

Potential capability dimensions for Phase 3D:

```text
approval.read
approval.decide
approval.comment
approval.reassign
approval.remind
approval.escalate
approval.override
approval.cancel
```

Exact naming waits.

The key distinction is:

```text
READ
≠
COMMENT
≠
DECIDE
≠
REASSIGN
≠
OVERRIDE
```

---

# 66. Scoped approval access

Potential scopes:

```text
OWN ASSIGNED
TEAM
DEPARTMENT
ORGANIZATION
CLIENT/PROJECT
```

Managers may need Team approval visibility.

Ordinary users should not automatically see all confidential organization approvals.

---

# 67. Override permission must be rare

`approval.override`—if supported—should be significantly more restricted than ordinary approval authority.

A normal approver should not automatically gain the ability to bypass:

* Client approval,
* Legal approval,
* Finance approval,
* publication gates.

---

# 68. Responsive contract — Desktop

Desktop should remain the richest Approval operations surface:

```text
Summary / queue metrics
↓
Filters / saved views
↓
Approval queue
↓
Selected subject preview/context
↓
Comments / history
↓
Decision controls
```

It can support a multi-pane productivity layout.

---

# 69. Responsive contract — Tablet

Following Design 152:

* queue remains compact,
* filters use adaptive sheets,
* selected approval opens a large drawer/detail pane,
* preview remains readable,
* decision controls remain touch-safe.

---

# 70. Responsive contract — Mobile

Following Design 151:

```text
Approval Summary
↓
Urgent / Overdue
↓
Approval Cards
↓
Open Approval
↓
Subject Preview
↓
Context
↓
Comments
↓
Approve / Request Changes / other permitted decision
```

Mobile should be particularly strong because approvals are a high-value urgent action.

---

# 71. Mobile approval safety

High-impact decisions should avoid accidental taps.

For irreversible/sensitive actions, use:

* clear subject/version identity,
* explicit decision action,
* confirmation where appropriate,
* visible consequence/context.

Do not bury the version number on mobile.

---

# 72. State coverage

Design 029 inherits Design 150 plus Approval-specific states:

```text
Approval Queue Loading
No Approvals Assigned
No Results After Filters
Approval Pending
Due Soon
Overdue
In Review
Changes Requested
Approved
Rejected
Cancelled
Superseded
Expired if supported
Awaiting Other Approvers
Decision Submitting
Decision Failed
Subject Version Unavailable
Subject Replaced
Approver Reassigned
Permission Restricted
Partial Preview Failure
Partial Service Failure
```

Not all of these need to be one persisted enum.

---

# 73. Empty state ≠ unavailable data

Important distinction:

> **No approvals assigned to you**

means the queue is genuinely empty.

> **Approval service unavailable**

means state is unknown.

Never render outages as:

> You're all caught up.

---

# 74. Subject unavailable ≠ Approval missing

An ApprovalRequest may still exist even if a related preview service is temporarily unavailable.

Example:

```text
ApprovalRequest        ✓
Video preview service  ✕
```

The system should preserve:

* request metadata,
* approver,
* due date,

while preventing unsafe decision if required context cannot be verified.

---

# 75. Decision concurrency

Two authorized approvers might act simultaneously.

Example:

```text
Approver A → Approve
Approver B → Request Changes
```

The Approval service must enforce the policy and current revision atomically.

The second decision may:

* remain valid in multi-approver policy,
* be rejected,
* trigger reconciliation,

depending on policy.

The UI cannot decide this alone.

---

# 76. Version-race protection

Example:

```text
User opens Proof v3 approval
        ↓
Production supersedes v3 with v4
        ↓
User clicks Approve on stale screen
```

The backend must verify:

```text
Is ApprovalRequest still active?
Is referenced subject still decision-eligible?
```

before accepting the decision.

---

# 77. Idempotent decision submission

Example:

```text
Approve
↓
network timeout
↓
user retries
```

must produce:

> one canonical decision

not duplicate decisions/activity/notifications.

Decision commands need idempotency.

---

# 78. Event-driven integration

The Approval service should emit normalized events such as:

```text
ApprovalRequested
ApprovalAssigned
ApprovalReassigned
ApprovalApproved
ApprovalChangesRequested
ApprovalRejected
ApprovalCancelled
ApprovalOverdue
ApprovalOverridden
```

Source domains can react without Design 029 knowing their business logic.

---

# 79. Notification integration

Approval events can trigger shared notification infrastructure:

```text
Approval Requested
     ↓
Notification Service
     ↓
Team notification / email / portal notice
```

The source of truth remains ApprovalRequest.

The notification is only delivery.

---

# 80. Activity integration

Human-readable business activity can include:

```text
Sarah requested approval for Draft v4
Michael approved Final Proof v3
Client requested changes to Video v2
```

Those events should link back to canonical ApprovalRequest and subject.

---

# 81. Audit history

Approval decisions are among the strongest audit candidates in the platform.

Audit should preserve, where appropriate:

```text
actor
decision
request id
subject type/id/version
timestamp
policy/context
prior state
resulting state
override reason
```

This is particularly important for:

* Contracts,
* commercial pricing,
* Client approvals,
* final publication decisions.

---

# 82. Activity ≠ Audit

Again:

### Activity

> Daniel approved Cover v3.

### Audit

Contains stronger immutable technical/business metadata.

Both can derive from one domain command.

Do not use the Activity feed as the sole evidence of approval.

---

# 83. Read model

A useful composed model:

```text
ApprovalCenterView
├── queue summaries
├── filtered ApprovalRequests
├── approver assignments
├── subject summaries
├── project/client context
├── due/SLA conditions
├── comments summary
├── decision status
└── recent approval activity
```

This is a **read composition**.

---

# 84. Do not PATCH ApprovalCenterView

Avoid:

```text
PATCH /approval-center
{
  approved: true,
  projectStage: "...",
  magazineReady: true
}
```

Use explicit Approval commands:

```text
submitApprovalDecision()
requestChanges()
reassignApproval()
cancelApprovalRequest()
overrideApprovalRequirement()
```

Then source domains respond to canonical Approval events.

---

# 85. Backend architecture

```text
Approval Center UI
        ↓
ApprovalQueryService
        ↓
Tenant + Permission Scope
        ↓
Approval Domain
        │
        ├── ApprovalRequest
        ├── ApprovalParticipant
        ├── ApprovalDecision
        ├── ApprovalPolicy
        └── Subject Reference
        │
        ├── Review / Comment Service
        ├── Notification Service
        ├── Activity / Audit
        └── Subject Presenter Registry
                │
                ├── Editorial
                ├── Magazine
                ├── Podcast
                ├── Video
                ├── Event
                ├── Proposal
                ├── Contract
                ├── Project
                └── Publishing
```

Source-domain workflows consume Approval events instead of being mutated directly by the Approval Center.

---

# 86. Backend requirements

| Requirement                              | Status                              |
| ---------------------------------------- | ----------------------------------- |
| Authentication                           | **Required**                        |
| Tenant isolation                         | **Critical**                        |
| Approval RBAC / actor scope              | **Critical**                        |
| Canonical ApprovalRequest                | **Critical**                        |
| ApprovalDecision entity                  | **Critical**                        |
| Exact subject/version reference          | **Critical**                        |
| Internal vs external approver support    | **Critical**                        |
| Approver assignment/history              | **Critical**                        |
| Approval policy support                  | **Critical**                        |
| Single/multiple approver architecture    | **Required**                        |
| Due/SLA handling                         | **Required**                        |
| Reassignment                             | **Required where approved**         |
| Escalation integration                   | **Required where approved**         |
| Override auditability                    | **Critical if overrides supported** |
| Review/comment integration               | **Critical**                        |
| Subject presenter/adapter layer          | **Critical**                        |
| Client-safe subject projection           | **Critical**                        |
| Event-driven workflow integration        | **Critical**                        |
| Decision concurrency protection          | **Critical**                        |
| Version-race validation                  | **Critical**                        |
| Idempotent decisions                     | **Critical**                        |
| Notification integration                 | **Required**                        |
| Activity history                         | **Required**                        |
| Immutable audit history                  | **Critical**                        |
| Partial subject-service failure handling | **Required**                        |

---

# 87. Canonical approval metrics

Definitions should be centralized for:

**Pending Approvals**
**Overdue Approvals**
**Approvals Due Soon**
**Average Approval Time**
**Internal Approval Time**
**Client Approval Time**
**Changes Requested Rate**
**Approval Completion Rate**
**Requests Awaiting Other Approvers**

These may appear across:

* Executive Dashboard,
* Editorial Dashboard,
* Operations Dashboard,
* Project 360,
* product-production workspaces,
* Approval Center,
* Operations Command Center,
* Analytics/Reports.

There must be one definition.

---

# 88. Main implementation risks

Design 029 flags several critical platform risks:

**Approval duplication** — every module creating its own approval table.

**Review/approval conflation** — comments and formal decision treated as the same state.

**Subject ambiguity** — approving a parent record rather than exact artifact/version.

**Latest-version bug** — approval dynamically following the newest version.

**Internal/client approval conflation** — external decisions mixed with staff decisions without visibility boundaries.

**Viewer/approver conflation** — record visibility incorrectly granting decision authority.

**Requester/self-approval leakage** — policy bypass through frontend action.

**Decision mutation** — historical approval decisions editable after completion.

**Approval/workflow coupling** — Approval Center directly hard-coding product stage transitions.

**Superseded/rejected conflation** — obsolete requests harming rejection analytics.

**Override impersonation** — internal override recorded as though Client approved.

**Bulk approval danger** — generic bulk-action infrastructure allowing unsafe mass decisions.

**Subject permission leakage** — Approval Center exposing unrelated underlying record data.

**Client data leakage** — internal preview/comment fields exposed to portal approvers.

**Concurrency races** — conflicting simultaneous decisions.

**Stale-version approval** — decision accepted after artifact superseded.

**Duplicate submission** — retries creating multiple decisions.

**False all-clear state** — service outage displayed as “No approvals.”

No new design is required.

These are consolidation and backend integrity requirements.

# Design 029 Audit Verdict

## **PASS — CROSS-DOMAIN APPROVAL OPERATIONS ANCHOR**

**Template directive:** Design 029 establishes the canonical `ApprovalQueueWorkspaceTemplate` / Approval Operations family.

**Domain directive:** **Review ≠ ApprovalRequest ≠ ApprovalDecision ≠ source workflow state.**

**Version directive:** Every artifact/version-sensitive approval binds permanently to the exact subject/version under decision.

**Cross-domain directive:** Editorial, Magazine, Podcast, Video, Event, Proposal, Contract, Project, and Publishing workflows must use **one canonical Approval domain**.

**Decision directive:** Approval Center records the authoritative decision; it does not directly mutate source-domain workflow stages.

**Workflow directive:** Approval events cause the source Workflow Engine/domain to reevaluate progression and remaining gates.

**Internal/external directive:** Internal and Client approvals share the same underlying Approval service while retaining separate actors, authorization, visibility, and UX projections.

**Policy directive:** Approver eligibility, self-approval rules, multi-approver behavior, deadlines, escalation, and override authority belong to canonical Approval policy—not individual React pages.

**Immutability directive:** Completed Approval Decisions are historical records and must not be silently rewritten.

**Override directive:** Exceptional overrides, where allowed, are explicitly recorded as overrides and never impersonate another approver.

**Permission directive:** read, comment, decide, reassign, escalate, cancel, and override are independently enforceable capabilities.

**Security directive:** Approval subject previews use permission-aware adapters/projections and never expose unrestricted source-domain records.

**Reliability directive:** decision submission requires concurrency checks, stale-version validation, idempotency, and partial-service-failure behavior.

**Responsive directive:** Approval is a high-priority mobile workflow; decision context and exact version identity must remain clear across desktop, tablet, and phone.

**Reuse directive:** All later Approval-specific designs—including Project Approval Gates and Client Portal Approvals—must consume the same ApprovalRequest/Decision infrastructure.

**Consolidation directive:** **STANDARDIZE ONE PLATFORM-WIDE APPROVAL + REVIEW/DECISION + SUBJECT-PREVIEW + POLICY INFRASTRUCTURE — DO NOT BUILD SEPARATE APPROVAL ENGINES FOR EDITORIAL, MAGAZINE, PODCAST, VIDEO, EVENT, PROPOSAL, CONTRACT, PROJECT, PUBLISHING OR CLIENT PORTAL.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **29 / 153** |
| **PASS**                                   |                         **29** |
| **STANDARDIZE decisions**                  |                         **27** |
| **Potential implementation-overlap flags** |                         **20** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

### Cross-domain architecture after Design 029

```text
ProductExecutionWorkspaceTemplate
│
├── 024 Editorial
├── 025 Magazine
├── 026 Podcast
├── 027 Video
└── 028 Event
        │
        │ create approval requirements
        ↓
┌──────────────────────────────────────┐
│        CANONICAL APPROVAL DOMAIN     │
│                                      │
│ ApprovalRequest                      │
│      ↓                               │
│ Subject Version                      │
│      ↓                               │
│ Approver / Policy                    │
│      ↓                               │
│ ApprovalDecision                     │
│      ↓                               │
│ Domain Event                         │
└──────────────────────────────────────┘
        │
        ↓
029 Approval Center / Approval Workspace
        │
        ↓
Source Workflow reevaluates gates
```

This is one of the most important consolidation findings so far:

> **Design 029 confirms that approvals are a platform service, not a feature independently owned by Editorial, Magazine, Podcast, Video, Event, Commercial, or Projects.**

# Next Sequential Audit Target

## **Phase 3A.1 — Design 030 Audit**

For Design 030, we should again retrieve its **exact frozen identity from the approved 153-design inventory before auditing it**. We should not infer the next screen from Approval Center or assume it is Publishing, Distribution, Task management, Files, or another queue.

Once its frozen identity is verified, we continue with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no guessing, no redesign, no additional screen and no sequence change.**

