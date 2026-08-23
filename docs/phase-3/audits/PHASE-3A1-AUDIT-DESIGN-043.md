# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 043 — Client Project Detail

Design 043 should become the **canonical one-project Client Portal 360 composition**.

Its job is to let an authorized Client Portal member understand one Project end-to-end—its safe status, progress, milestones, required actions, people, meetings, questionnaires, Drafts, Designs, Files, approvals, contractual/billing information where permitted, publishing/distribution status, Reports, and communication—without exposing the internal operational Project 360 from Design 023.

| Audit field                      | Classification                                                                                                                                                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                    | **043**                                                                                                                                                                                                                |
| **Canonical name**               | **Client Project Detail**                                                                                                                                                                                              |
| **Product area**                 | Client Portal / Projects / Client Delivery                                                                                                                                                                             |
| **User surface**                 | **Client Portal**                                                                                                                                                                                                      |
| **Screen class**                 | Client-Safe Entity Detail / Project 360 Workspace                                                                                                                                                                      |
| **Classification**               | **Portal Entity Detail Variant — Canonical Client Project 360 Anchor**                                                                                                                                                 |
| **Primary purpose**              | Provide one authorized, client-safe view of a Project and all Client-relevant relationships/actions                                                                                                                    |
| **Primary canonical entity**     | **Project** — Design 023                                                                                                                                                                                               |
| **Primary projection**           | `ClientProjectDetailView`                                                                                                                                                                                              |
| **Supporting canonical domains** | Client, Workflow/Milestone, ClientRequest, ApprovalRequest, Questionnaire, DraftVersion, Design/Proof Version, Asset/FileVersion, Meeting, MessageThread, Contract, Invoice, Publication, DistributionCampaign, Report |
| **Parent shell**                 | `ClientPortalShell` — Design 002                                                                                                                                                                                       |
| **Collection parent**            | Design 042 — My Projects                                                                                                                                                                                               |
| **Timeline dependency**          | Design 044                                                                                                                                                                                                             |
| **Template family**              | `ClientPortalEntityDetailTemplate`                                                                                                                                                                                     |
| **Composition**                  | `ClientProjectDetailComposition`                                                                                                                                                                                       |
| **Auth**                         | Required                                                                                                                                                                                                               |
| **Authorization**                | Portal membership + Project entitlement + subresource permissions                                                                                                                                                      |
| **Implementation priority**      | **Critical Client Portal Core**                                                                                                                                                                                        |
| **Reuse level**                  | **Extremely High**                                                                                                                                                                                                     |

The governing invariant is:

> **Project ≠ ClientProjectDetailView ≠ Internal Project 360 ≠ Client-visible workflow/progress.**

---

# 1. Functional Responsibility

Design 043 answers:

> **“What is happening with this specific Project, where are we now, what happens next, what do you need from me, what has been delivered, what can I review or approve, and which Project-related records am I authorized to access?”**

Canonical architecture:

```text
CANONICAL PROJECT
Design 023
      │
      ├── Workflow / Milestones
      ├── Client Requests
      ├── Approvals
      ├── Questionnaires
      ├── Drafts
      ├── Designs
      ├── Assets
      ├── Meetings
      ├── Messages
      ├── Contracts
      ├── Invoices
      ├── Publishing
      ├── Distribution
      └── Reports
            ↓
    CLIENT-SAFE PROJECTION
            ↓
 Portal Membership + Project Scope
            ↓
       DESIGN 043
```

Design 043 **composes** these domains.

It owns none of them independently.

---

# 2. Design 023 vs Design 043

This is the most important boundary.

### Design 023 — Internal Project 360

Can legitimately contain:

* workflow internals,
* Tasks,
* staff assignments,
* risks,
* blockers,
* internal dependencies,
* internal notes,
* cost/margin,
* operational health,
* QA,
* provider failures.

### Design 043 — Client Project Detail

Contains only Client-safe information.

Therefore:

```text
Project
   ├── Internal Project View
   └── ClientProjectDetailView
```

Do **not** return `Project360View` and hide internal fields in React.

---

# 3. One canonical Project

There must not be:

```text
Project
ClientProject
PortalProject
MediaClientProject
```

as four independent business records.

Correct:

```text
Project
   ↓
different authorized projections
```

Design 043 consumes the same Project ID as Designs 023 and 042.

---

# 4. Design 042 → 043 consistency

The Project selected from **My Projects** should retain the same:

* Client-facing status,
* progress definition,
* Project type,
* next relevant milestone,
* action-required semantics.

Design 043 can show more detail, but should not contradict Design 042.

---

# 5. Opening detail requires fresh authorization

Even after a Project appeared in Design 042:

```text
GET Client Project Detail
        ↓
authenticate
        ↓
validate active Portal membership
        ↓
validate Project entitlement
        ↓
build safe projection
```

Authorization cannot be inherited from the previous UI page.

---

# 6. Project permission ≠ subresource permission

This is a critical rule.

A Client member may be allowed to view the Project but not:

* Finance,
* Contract,
* specific confidential files,
* some Reports.

Therefore:

> **`project.read` does not mean unrestricted access to every Project-related entity.**

---

# 7. ClientProjectDetailView

A conceptual read model:

```text
ClientProjectDetailView
├── Project identity
├── Client-safe Project type/status
├── Client-visible progress
├── current milestone/stage summary
├── next milestone
├── Client actions required
├── account/project contacts
├── recent Client-safe activity
├── meetings
├── questionnaires
├── Draft/Design review summaries
├── deliverables/files
├── approvals
├── Contract summary if allowed
├── billing summary if allowed
├── publishing/distribution summary
├── Reports
└── permitted CTAs
```

This is a **read composition**, not another entity.

---

# 8. Tabs/sections ≠ independent data silos

If frozen Design 043 includes sections/tabs, those are views over canonical domains.

For example:

```text
Overview
Timeline
Files
Approvals
Messages
Billing
```

must not become six separate Project truth stores.

Exact navigation routing is deferred to Phase 3B.

---

# 9. Client-facing status

The same centralized mapping established for Design 042 should be reused.

Internal:

```text
DRAFT_REVIEW_INTERNAL
```

might safely resolve to:

> Content Preparation

Client-facing mappings should be defined once and reused throughout the Portal.

---

# 10. Status ≠ progress

Client status:

> Design Review

and progress:

> 68%

remain independent concepts.

Do not derive percentage by:

```text
currentStageIndex / totalStages
```

unless the canonical Project model explicitly defines progress that way.

---

# 11. Internal Project health ≠ Client-facing Project status

Internal:

```text
Health:
AT_RISK
```

may relate to staff capacity or provider problems.

That must not automatically appear as:

> Your Project is at risk.

Client communication requires an intentional external-facing condition/presentation policy.

---

# 12. Client-facing transparency must still be truthful

Safe projection does not mean hiding every real issue.

If something genuinely changes Client delivery:

* delayed milestone,
* blocked Client dependency,
* revised due date,

the Portal should show whatever Client-facing state the canonical business policy says.

The solution is **intentional projection**, not fabricated optimism.

---

# 13. Progress requires one platform definition

Designs 041, 042, and 043 must all use the same Project progress resolver.

Conceptually:

```text
Project
+
workflow/milestones
+
product-specific readiness
        ↓
ClientProjectProgressResolver
```

No page-specific percentages.

---

# 14. Project phase/stage summary

A safe phase may be derived from:

* canonical workflow stage,
* product-specific workflow,
* external presentation mapping.

This should be a projection rather than another independently maintained string.

---

# 15. Project Timeline boundary

Design 043 can show:

* current phase,
* upcoming milestone,
* compact timeline preview.

But **Design 044 — Project Timeline / Progress** owns the full Client timeline experience.

Do not recreate the entire Timeline inside Design 043.

---

# 16. Milestone ≠ Task

Client Project Detail can show milestones.

It should not expose every internal Task behind those milestones.

Example:

```text
Client-visible:
Final Design Review — Sep 5

Internal Tasks:
- export v6
- QA bleed
- verify fonts
- internal reviewer check
```

The latter remain private unless explicitly client-facing.

---

# 17. Next Milestone ≠ Client Action

Example:

```text
Next milestone:
Final Publication

Client action:
Approve Cover Proof
```

Both can coexist.

Never reduce the Project to one ambiguous `nextStep`.

---

# 18. Client Actions

Reuse Design 041/042's canonical Client Action resolver.

Possible source records include:

```text
ApprovalRequest
ClientRequest
QuestionnaireResponse requirement
Requested Asset requirement
Payment requirement
```

These remain canonical source records.

---

# 19. Internal Tasks remain private

Design 034 Task:

> Resolve typo on page 17

should not be exposed merely because it belongs to this Project.

Design 047 later is **Client Tasks / Requests**, which must be built from explicitly Client-facing work/request concepts rather than internal Tasks wholesale.

---

# 20. ClientRequest ≠ internal Task

Permanent rule:

```text
Task
≠
ClientRequest
```

Design 043 may summarize Client Requests such as:

> Please upload 3 high-resolution images.

The original source remains the ClientRequest/dependency system.

---

# 21. Questionnaires

Design 048 will handle full Client Questionnaire interaction.

Design 043 should only show contextual summary such as:

* questionnaire requested,
* submitted,
* pending,
* required action.

---

# 22. Questionnaire definition ≠ response

The separation established in Design 024 remains:

```text
Questionnaire Definition / Version
≠
Client Response
```

Design 043 must not flatten questionnaire completion into a Project Boolean.

---

# 23. Draft Review

Design 049 owns detailed Client Draft Review.

Design 043 may show:

```text
Draft v4
Awaiting your review
```

but must reference the **exact DraftVersion**.

Never:

```text
project.latestDraft
```

for an approval/review action.

---

# 24. Draft version lineage

If Client was asked to review Draft v4 and internal users create v5:

the Portal must not silently switch the pending review to v5.

The review/action remains pinned to v4 unless superseded through controlled workflow.

---

# 25. Design / Proof Review

Same rule for Design 050:

```text
Proof v3
→ Client Review
```

The Project Detail can summarize it, but exact-version detail belongs to Design 050.

---

# 26. Internal design files ≠ Client proofs

Designers may have:

* InDesign source files,
* alternate covers,
* unfinished exports.

Only explicitly released Proof/Design versions should appear to Clients.

---

# 27. Approvals

Design 052 later provides the full Client Approvals collection.

Design 043 can show Project-specific approvals.

All decisions remain owned by Design 029's canonical Approval domain.

---

# 28. Review ≠ Approval

A Client can comment on a Draft without formally approving it.

Therefore:

```text
Review feedback
≠
ApprovalDecision
```

Do not convert “Looks good” comment into formal approval automatically.

---

# 29. Approval binds exact version

Permanent invariant:

```text
ApprovalRequest
→ DraftVersion / ProofVersion / ReportVersion / etc.
```

Design 043 cannot display generic:

> Approved Project

when only one particular artifact was approved.

---

# 30. Files & Assets

Design 051 later owns Client Files & Assets.

Design 043 can show:

* recent files,
* requested upload,
* deliverables,
* latest Client-visible artifact.

All reuse Design 030.

---

# 31. File visibility is contextual

A File attached to a Project is **not automatically Client-visible**.

Correct evaluation:

```text
Asset/FileVersion
+
Usage
+
Visibility
+
Project entitlement
+
Portal permission
        ↓
Client access
```

---

# 32. Latest File ≠ released File

The Portal should access the exact Client-released FileVersion.

Internal newer versions remain internal until deliberately published/released to Client.

---

# 33. Upload destination

If Design 043 provides a Client file-upload CTA, uploaded content should enter canonical Asset infrastructure with:

* uploader attribution,
* Project usage,
* processing/scanning,
* visibility,
* requirement linkage.

Uploaded ≠ ready for internal use until processing succeeds.

---

# 34. Meetings

Design 046 later owns the Client Meetings workspace.

Design 043 may show:

* next meeting,
* recent meeting,
* Project-related meeting.

Canonical Meeting domain remains Design 015/035 infrastructure.

---

# 35. Meeting ≠ Project milestone

A Client review meeting can happen near a milestone, but they remain separate records.

---

# 36. Calendar privacy

Client Project Detail should only expose meetings/participants intended for that Portal member.

Internal staff schedule entries stay private.

---

# 37. Messages

Design 045 later owns Client Messages.

Design 043 may show:

* unread count,
* latest thread,
* Project communication CTA.

Do not embed the full internal Unified Inbox.

---

# 38. Message thread ≠ internal notes

Internal notes/comments associated with the Project must never appear in Client Messages.

Client communication needs explicitly safe thread membership/content.

---

# 39. Account Manager / Project Team

The Portal can show approved Client-facing contacts.

Possible:

```text
Account Manager
Project Lead
Producer
```

depending on frozen UI.

This uses a constrained Design 036 projection.

---

# 40. Client-visible team ≠ internal project staffing

Internal Project could contain:

* freelancers,
* QA staff,
* Finance reviewer,
* editors,
* administrators.

Do not expose the full ProjectMembership list automatically.

---

# 41. Employee field safety

Client-safe Team member projection might contain:

```text
name
safe title
profile image
approved contact method
```

and exclude:

* workload,
* Role permissions,
* Department internals,
* private employee metadata.

---

# 42. Contract summary

Design 053 is the Client Contracts library.

Design 070 later owns Contract Detail/Signing.

Design 043 can expose a Project-associated Contract summary only if the current member has Contract permission.

---

# 43. Contract lifecycle remains canonical

Design 019/100 owns Contract execution.

Client Project Detail cannot independently label:

> Signed

without reading the canonical Contract state.

---

# 44. Contract visibility ≠ Project visibility

A marketing user may view Project progress while Contract access is restricted to executive/legal Client members.

This is legitimate.

---

# 45. Invoice / payment summary

Design 054 owns Client Invoices & Payments.

Design 071 later owns detail.

Design 043 can show safe Project billing information if permitted.

---

# 46. Finance access is independent

```text
portal.projects.read
≠
portal.finance.read
```

Never include invoice totals in every Project detail payload.

---

# 47. Amount semantics

Where shown:

* amount,
* currency,
* due date,
* invoice status,

come directly from the canonical Finance service.

Outstanding ≠ overdue remains enforced.

---

# 48. Publishing summary

Design 055 later owns Client Publishing & Distribution.

Design 043 can summarize:

* publication readiness where Client-visible,
* published status,
* live artifact/link when verified.

Design 031 remains authoritative.

---

# 49. Publishing internal failures stay internal

Do not expose provider retry codes, account disconnections, worker errors, or other implementation details.

Client-safe operational status needs an intentional mapping.

---

# 50. Distribution summary

Likewise, Client-visible:

* verified placements,
* Client-approved channel status,
* properly qualified metrics.

Internal:

* failed attempts,
* credentials,
* queue retries,
* operational troubleshooting.

stay private.

---

# 51. Verified vs estimated

If performance appears on Design 043:

```text
Reach: 1.2M estimated
```

must retain the qualification.

Never turn an estimate into a Client-facing fact.

---

# 52. Reports

Design 056 owns Client Reports & Downloads.

Design 043 can surface Project-specific final Reports.

Only approved/final Client ReportVersions from Design 033 should appear.

---

# 53. Report draft ≠ deliverable

Internal Report v5 being generated does not mean:

> New Report available.

Only the Client-released exact version becomes visible.

---

# 54. Project activity

Design 043 may contain recent Project activity.

This is:

```text
Client-safe Project Activity
```

not:

```text
internal activity
```

and not:

```text
AuditEvent
```

---

# 55. Safe activity examples

Potential Client-visible events:

* Questionnaire submitted.
* Draft ready for review.
* Approval completed.
* Invoice paid.
* Publication went live.
* Report became available.

Potential internal-only events:

* Team reassigned.
* Risk escalated.
* Provider retry failed.
* Internal Draft rejected.
* Permission changed.

---

# 56. Activity projection must be server-safe

Never return internal events and filter by `visibility` in the browser.

The query should only return events already authorized for the Portal.

---

# 57. Primary CTA

Design 043's primary action can be context-dependent:

```text
Pending approval
↓ else
Submit requested information
↓ else
Upload requested asset
↓ else
Pay invoice if permitted
↓ else
View next Project milestone
```

Exact presentation follows frozen design.

The backend should provide safe available actions.

---

# 58. Available actions ≠ hard-coded frontend logic

Instead of React inferring:

```text
if stage === "CLIENT_REVIEW":
   show Approve
```

a permission-aware action resolver can provide:

```text
availableActions[]
```

derived from canonical state + user entitlement.

---

# 59. Backend action authorization remains mandatory

An action being displayed does not guarantee it can still execute.

Between render and click:

* approval may have been completed,
* Project access may have changed,
* version may be superseded.

Every command validates fresh state.

---

# 60. Concurrency

Example:

```text
Client A:
approves Proof v3

Client B:
simultaneously submits changes
```

The Approval/Review domain must resolve according to current state/version policy.

Design 043 cannot rely on stale card state.

---

# 61. Superseded actions

If a Draft/Proof has been superseded:

the Project Detail must no longer present the old action as current.

Historical items can remain visible appropriately.

---

# 62. Project completion

When a Project completes, Design 043 should still support historical Client access according to policy:

* final deliverables,
* final Report,
* live links,
* Contract/invoice history where authorized.

Completed ≠ inaccessible.

---

# 63. Project closeout

Design 120/121 internally handle Project completion and final handover.

Client Project Detail should consume their safe output/results rather than inventing a second closeout state.

---

# 64. Renewal

Design 057 owns renewal/continuation.

Design 043 may show a relevant CTA after completion if the canonical renewal relationship allows it.

It does not own Renewal logic.

---

# 65. Project archive

Internal archive state should not automatically remove Client history.

Portal availability requires a separate explicit policy.

---

# 66. Relationship to Design 044

Design 043:

**one Project's broad Client-safe 360.**

Design 044:

**deep Project Timeline / Progress.**

Correct architecture:

```text
ClientProjectDetailView
        │
        ├── summary progress
        └── Timeline projection
                ↓
             044
```

One Project/workflow source.

Two depths.

---

# 67. Relationship to Designs 045–056

Design 043 is the contextual hub.

The specialized screens remain canonical for deeper workflows:

```text
045 Messages
046 Meetings
047 Tasks / Requests
048 Questionnaires
049 Draft Review
050 Design Review
051 Files & Assets
052 Approvals
053 Contracts
054 Invoices & Payments
055 Publishing & Distribution
056 Reports & Downloads
```

Design 043 **links/summarizes** them.

It does not duplicate them.

---

# 68. Relationship to Design 066

Later:

**Design 066 — Client Media Project Detail**

This is a major overlap checkpoint.

Current architectural expectation:

```text
Canonical Project
      │
      ├── 043 Client Project Detail
      │   broad project-safe 360
      │
      └── 066 Client Media Project Detail
          media-specialized detail
```

No merge decision yet.

But **one Project identity and entitlement engine are mandatory**.

---

# 69. Permissions architecture

Potential Phase 3D Client Portal capabilities include:

```text
portal.projects.read
portal.projects.view_progress

portal.requests.read
portal.requests.respond

portal.meetings.read

portal.questionnaires.read
portal.questionnaires.submit

portal.drafts.read
portal.drafts.comment

portal.designs.read
portal.designs.comment

portal.approvals.read
portal.approvals.decide

portal.files.read
portal.files.download
portal.files.upload

portal.contracts.read
portal.contracts.sign

portal.finance.read
portal.payment.perform

portal.publishing.read
portal.distribution.read

portal.reports.read
portal.reports.download
```

Exact names later.

The key principle is **subresource separation**.

---

# 70. Project access ≠ Project mutation

Portal users generally should not edit:

* internal owner,
* workflow,
* Project health,
* Project priority,
* Team assignments.

Client writes occur through specialized domain commands.

---

# 71. Internal actions must not appear

Even if canonical Project service supports:

```text
changeProjectOwner()
changeWorkflowStage()
closeProject()
```

those should not enter `availableActions` for Client Portal users unless explicitly part of the frozen Client product—which they are not assumed to be.

---

# 72. Permission-safe caching

A Project detail cache must include:

```text
Client/Portal organization
membership
Project entitlement
subresource capabilities
Project revision where relevant
```

A Finance-enabled Client user and a restricted Client user cannot share an identical unrestricted cached payload.

---

# 73. Prefer segmented safe composition

Rather than one enormous globally cacheable Project payload, Design 043 can compose permission-aware sections.

Example:

```text
Project core        ✓
Approvals           ✓
Finance             restricted
Contracts           restricted
Reports             ✓
```

This improves safety and partial failure handling.

---

# 74. Partial service failure

Example:

```text
Project core         ✓
Timeline             ✓
Files                ✓
Finance              ✕
Publishing           ✓
Messages             ✓
```

Design 043 should remain usable.

Finance shows a localized unavailable state.

---

# 75. Unknown ≠ none

If Approval service fails:

do not show:

> No approvals pending.

If Files service fails:

do not show:

> No files yet.

If Finance fails:

do not show:

> $0 outstanding.

Unknown remains unknown.

---

# 76. Restricted ≠ unavailable

If Finance is permission-restricted:

show a deliberate restricted/hidden section according to UX policy.

Do not tell the Client:

> Billing system unavailable.

The backend knows the difference.

---

# 77. Stale ≠ unavailable

Publishing/distribution/analytics may be delayed.

Where relevant show:

> Updated 6 hours ago

rather than hiding useful but stale information or presenting it as current.

---

# 78. Client-safe error messages

Portal errors should not expose:

* internal service names,
* provider IDs,
* worker failures,
* staff names,
* stack traces.

Use safe product-level language.

---

# 79. State coverage

Design 043 inherits Design 150 and requires states such as:

```text
Project Detail Loading
Project Available

Project Access Restricted
Project Access Revoked
Project Not Found

Project Active
Project Upcoming
Project Completed
Project Cancelled where applicable

Client Action Required
No Client Action Required
Client Action State Unknown

Progress Available
Progress Unavailable

Approval Pending
Review Pending
Questionnaire Pending
Asset Requested

Deliverable Available
No Deliverables Yet

Finance Restricted
Finance Unavailable

Publishing Data Stale
Distribution Data Unavailable

Partial Service Failure
Record Updated Elsewhere
```

These should not become one giant Project status enum.

---

# 80. Responsive — Desktop

Desktop should preserve the broad Client Project context:

```text
Project Header
↓
Status / Progress / Key Dates
↓
Action Required
↓
Project Sections / Navigation
↓
Overview
├── Timeline Summary
├── Client Actions
├── Reviews / Approvals
├── Deliverables
├── Meetings / Messages
├── Billing where permitted
├── Publishing / Distribution
└── Reports
```

The emphasis should remain Client clarity, not internal operational density.

---

# 81. Responsive — Tablet

Following Design 152 principles:

* summary cards reflow,
* Project navigation collapses,
* contextual details stack,
* Timeline preview becomes horizontal/vertical depending on available space,
* action-required remains prominent,
* deep sections use drawers/cards where appropriate.

---

# 82. Responsive — Mobile

Mobile priority:

```text
Project Identity
↓
Action Required
↓
Status / Progress
↓
Next Milestone
↓
Approvals / Reviews
↓
Deliverables
↓
Messages / Meetings
↓
Billing if permitted
↓
Publishing / Reports
```

The Client should not need to scroll past decorative content before finding an approval/request.

---

# 83. Mobile action safety

Before Client actions such as:

* Approve,
* Sign,
* Pay,
* Submit,

show enough context to prevent mistakes:

* Project,
* artifact/version,
* amount/currency,
* requested action.

No ambiguous icon-only destructive/high-impact actions.

---

# 84. Accessibility

Project progress/status/action indicators require text.

Examples:

> 68% complete
> Design approval required
> Next milestone: Final Proof, September 4

Do not communicate these solely through:

* progress-ring color,
* icons,
* card borders.

---

# 85. Backend query architecture

```text
Design 043
   ↓
ClientPortalSessionContext
   ↓
Portal Authorization
   ↓
ClientProjectDetailQueryService
   │
   ├── Project safe projection
   ├── Client status/progress resolver
   ├── Client Action resolver
   ├── Timeline summary
   ├── Questionnaire projection
   ├── Draft/Design safe projection
   ├── Approval projection
   ├── Asset/Deliverable projection
   ├── Meeting/Message projection
   ├── Contract safe projection
   ├── Finance safe projection
   ├── Publishing/Distribution projection
   └── Report projection
   ↓
ClientProjectDetailView
```

---

# 86. Mutation architecture

Do **not** expose:

```text
PATCH /client/projects/:id
{
  approval,
  invoice,
  file,
  status,
  draft,
  message
}
```

Prefer canonical source commands:

```text
respondToClientRequest()
submitQuestionnaire()
submitDraftFeedback()
submitDesignFeedback()
decideApproval()
uploadRequestedAsset()
signContract()
initiatePayment()
sendClientMessage()
```

Project Detail is the orchestration surface.

Source domains own mutations.

---

# 87. Backend requirements

| Requirement                            | Status                                 |
| -------------------------------------- | -------------------------------------- |
| Client Portal authentication           | **Critical**                           |
| Active Portal membership               | **Critical**                           |
| Project entitlement validation         | **Critical**                           |
| Canonical Project reuse                | **Critical**                           |
| `ClientProjectDetailView`              | **Critical**                           |
| Explicit Client-safe DTOs              | **Critical**                           |
| Client-facing status mapping           | **Critical**                           |
| Canonical Project progress resolver    | **Critical**                           |
| Client Action resolver reuse           | **Critical**                           |
| Milestone/Timeline integration         | **Critical**                           |
| Questionnaire integration              | **Required**                           |
| Exact DraftVersion integration         | **Critical**                           |
| Exact Design/Proof version integration | **Critical**                           |
| Approval integration                   | **Critical**                           |
| Asset/FileVersion integration          | **Critical**                           |
| Client-safe Meeting projection         | **Required**                           |
| Client-safe Messaging projection       | **Required**                           |
| Contract permission/projection         | **Critical**                           |
| Finance permission/projection          | **Critical**                           |
| Publication-safe projection            | **Required**                           |
| Distribution provenance/freshness      | **Required/Critical if metrics shown** |
| Final ReportVersion projection         | **Required**                           |
| Client-safe activity projection        | **Critical**                           |
| Context-aware action resolver          | **Required**                           |
| Permission-safe caching                | **Critical**                           |
| Subresource authorization              | **Critical**                           |
| Membership/access revocation           | **Critical**                           |
| Partial service failure                | **Critical**                           |
| Unknown/zero/empty separation          | **Critical**                           |
| Audit attribution for Client actions   | **Critical for sensitive actions**     |
| Design 044–056 reuse                   | **Critical architecture**              |
| Design 066 reuse                       | **Critical architecture**              |

---

# 88. Main implementation risks

Design 043 exposes major Client Portal risks:

**Project/ClientProject duplication** — second Project database.

**Internal Project 360 exposure** — internal payload sent to Portal and visually redacted.

**Project/subresource permission conflation** — viewing Project unlocks Finance, Contracts and files automatically.

**Status projection drift** — 042 and 043 show different Client statuses.

**Progress formula drift** — every Portal screen calculates progress differently.

**Health/status conflation** — internal operational risk leaked directly.

**Task/ClientRequest conflation** — employee Tasks become Client obligations.

**Milestone/action conflation** — Project deadline and Client responsibility become one field.

**Latest-version bug** — Client review silently switches to newer internal Draft/Proof.

**Review/approval conflation** — comments interpreted as formal approval.

**File/Deliverable conflation** — every Project attachment becomes Client-downloadable.

**Client-visible/public conflation** — private deliverables use permanent public URLs.

**Internal/Client staff projection conflation** — employee details exposed unnecessarily.

**Project/Finance authorization conflation** — any Project viewer sees invoices.

**Publication/Distribution conflation** — one generic “live” status obscures real lifecycle.

**Verified/estimated conflation** — estimated performance presented as guaranteed.

**Internal activity leakage** — internal notes/retries/risks exposed.

**Generic Project PATCH** — Client actions mutate multiple unrelated domains through one endpoint.

**Stale-action execution** — superseded approval/review still actionable.

**Partial failure/empty conflation** — service outage shown as no files/no approvals/$0.

**Permission-unsafe caching** — privileged Project view leaks to restricted Client user.

**043/066 duplicate Project-detail engines** — Media Project Detail receives separate backend.

No extra design is required.

These are **projection, permission, versioning, and domain-boundary requirements**.

# Design 043 Audit Verdict

## **PASS — CANONICAL CLIENT PROJECT 360 & SAFE DETAIL COMPOSITION ANCHOR**

**Domain directive:** **Project ≠ ClientProjectDetailView ≠ Internal Project 360 ≠ Client-visible Progress/Status.**

**Project directive:** Design 023 remains the one canonical Project domain; Design 043 is a Client-safe composition over that Project.

**Projection directive:** no internal Project 360 payload is ever reused directly in the Portal. Every section consumes explicit Client-safe projections.

**Consistency directive:** Designs 041–043 share exactly one Client Project access, status, progress and Client Action foundation.

**Authorization directive:** Project visibility and Project subresource access remain separate; Project access never automatically unlocks Contracts, Finance, files, Reports or other protected records.

**Status directive:** internal workflow/project state and Client-facing state are centrally mapped instead of translated independently by screens.

**Progress directive:** one canonical Client Project progress resolver feeds Dashboard, My Projects, Project Detail and Timeline.

**Timeline directive:** Design 043 shows only summary timeline/progress; Design 044 owns the deeper timeline workspace.

**Action directive:** Client actions come from canonical Approval, ClientRequest, Questionnaire, Asset, Payment and other source domains—not from internal Tasks or Notifications.

**Version directive:** Draft, Proof, Design, Asset and Report interactions always pin exact approved/released versions and never silently follow “latest.”

**Review directive:** comments/review feedback and formal Approval decisions remain distinct.

**Asset directive:** every Client file/deliverable uses Design 030's canonical Asset/FileVersion infrastructure plus explicit Client visibility.

**People directive:** staff information uses a deliberate Client-safe workforce projection rather than exposing Design 036 Employee records.

**Finance directive:** Contract and Invoice/Payment data require their own Portal capabilities even when related to an accessible Project.

**Publishing directive:** Publishing/Distribution remain authoritative in Designs 031–032; Client Project Detail receives only safe, truthful, provenance-aware summaries.

**Reporting directive:** only final/approved exact ReportVersions become Client-visible.

**Activity directive:** Client-safe Project Activity is separate from internal Activity and Design 039 Audit Logs.

**Mutation directive:** Project Detail orchestrates specialized domain commands; there is no universal Client Project mega-PATCH.

**Reliability directive:** restricted, empty, unavailable, stale, superseded and zero remain distinct states throughout the composition.

**Responsive directive:** desktop provides the broad Project 360, while mobile prioritizes action required → status/progress → next milestone → review/deliverable → communication → billing/reporting.

**Overlap directive:** Designs **043–056 and 066** must share one Client Project identity, entitlement, status/progress, action resolver and safe-domain projection layer.

**Consolidation directive:** **STANDARDIZE ONE CLIENT-PORTAL PROJECT DETAIL COMPOSITION + SUBRESOURCE AUTHORIZATION + CLIENT STATUS/PROGRESS + ACTION RESOLUTION + VERSION-SAFE DOMAIN PROJECTION INFRASTRUCTURE — DO NOT BUILD SEPARATE PROJECT DETAIL BACKENDS FOR TIMELINE, REVIEWS, FILES, APPROVALS, BILLING, PUBLISHING, REPORTS OR MEDIA PROJECT DETAIL.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **43 / 153** |
| **PASS**                                   |                         **43** |
| **STANDARDIZE decisions**                  |                         **41** |
| **Potential implementation-overlap flags** |                         **34** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**43 / 153 = 28.1% audited.**

### Client Project architecture after Design 043

```text
                 CANONICAL PROJECT
                    Design 023
                        │
                Portal entitlement
                        │
              Client-safe projection
                        │
        ┌───────────────┼────────────────┐
        ↓               ↓                ↓
     041 Dashboard   042 My Projects   043 Project Detail
                                         │
                ┌────────────────────────┼────────────────────────┐
                ↓                        ↓                        ↓
          044 Timeline              045–052                  053–056
                                   Client Work           Legal/Finance/
                                   & Reviews             Publish/Reports
```

The crucial architecture now is:

```text
CLIENT PORTAL PROJECT
        │
        ├── one canonical Project
        ├── one Portal entitlement model
        ├── one Client status mapping
        ├── one Project progress resolver
        ├── one Client Action resolver
        └── many permission-safe domain projections
```

# Next Sequential Audit Target

## **Design 044 — Project Timeline / Progress**

Its frozen identity is already locked.

For Design 044 we continue strictly with:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

Then sequentially:

**045 Client Messages → 046 Meetings → 047 Tasks / Requests → 048 Client Questionnaires → 049 Client Draft Review → 050 Client Design Review → … → 077 Client Access Recovery**

with **no redesign, no extra screen, no skipping and no sequence change.**

