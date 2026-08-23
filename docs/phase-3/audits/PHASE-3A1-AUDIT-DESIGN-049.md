# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 049 — Client Draft Review

Design 049 should become the **canonical Client Portal review workspace for an exact editorial Draft version**.

Its architecture must preserve the version and decision boundaries already established in Design 024 and Design 029:

> **Draft ≠ DraftVersion ≠ Review ≠ ReviewComment ≠ ApprovalRequest ≠ ApprovalDecision.**

The Client may read, annotate, comment on, and submit feedback against an exact DraftVersion. That feedback must never silently mutate the editorial Draft, silently become formal approval, or migrate to a newer DraftVersion without explicit lineage.

| Audit field                    | Classification                                                                                                                                 |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                  | **049**                                                                                                                                        |
| **Canonical name**             | **Client Draft Review**                                                                                                                        |
| **Product area**               | Client Portal / Editorial / Reviews                                                                                                            |
| **User surface**               | **Client Portal**                                                                                                                              |
| **Screen class**               | Version-Specific Client Review / Collaboration Workspace                                                                                       |
| **Classification**             | **Portal Workflow Anchor — Versioned Draft Review Family**                                                                                     |
| **Primary purpose**            | Allow authorized Client reviewers to inspect an exact DraftVersion, provide contextual feedback, and complete the requested review interaction |
| **Primary canonical entity**   | **Draft**                                                                                                                                      |
| **Version entity**             | **DraftVersion**                                                                                                                               |
| **Review concept**             | `ReviewSession` / `ClientDraftReview`                                                                                                          |
| **Feedback entities**          | ReviewComment, ReviewThread/Reply, annotation/anchor metadata where required                                                                   |
| **Formal decision dependency** | ApprovalRequest / ApprovalDecision — Design 029                                                                                                |
| **Editorial dependency**       | Design 024                                                                                                                                     |
| **Client Action dependency**   | Design 047                                                                                                                                     |
| **Project dependency**         | Design 043                                                                                                                                     |
| **Future related design**      | Design 050 — Client Design Review                                                                                                              |
| **Parent shell**               | `ClientPortalShell` — Design 002                                                                                                               |
| **Template family**            | `VersionedArtifactReviewTemplate`                                                                                                              |
| **Composition**                | `ClientDraftReviewComposition`                                                                                                                 |
| **Auth**                       | Required                                                                                                                                       |
| **Authorization**              | Portal membership + Project scope + exact DraftVersion review entitlement                                                                      |
| **Implementation priority**    | **Critical Editorial Collaboration**                                                                                                           |
| **Reuse level**                | **Very High**                                                                                                                                  |

The governing invariant is:

> **A review is always about a specific immutable DraftVersion—not “whatever the latest Draft happens to be.”**

---

# 1. Classification — Functional Responsibility

Design 049 should answer:

> **“Which Draft am I reviewing, which exact version is it, what feedback has already been left, what still requires my attention, and how do I submit my feedback without accidentally approving or modifying a different version?”**

Canonical flow:

```text
Draft
  ↓
DraftVersion
  ↓
Client Review Request / ReviewSession
  ↓
Authorized Client Reviewer
  ↓
Review Comments / Feedback
  ↓
Feedback Submitted
  ↓
Editorial team acts on feedback
  ↓
New DraftVersion if content changes
```

Formal approval, if required, remains a separate canonical Approval workflow.

---

# 2. Entities — Draft ≠ DraftVersion

`Draft` is the stable editorial document identity.

Example:

```text
Draft
"The Founder Story"
```

Its actual editorial states are represented through versions:

```text
Draft
 ├── DraftVersion v1
 ├── DraftVersion v2
 ├── DraftVersion v3
 └── DraftVersion v4
```

A Client never reviews an abstract Draft identity alone.

They review:

> **DraftVersion v4**

---

# 3. DraftVersion should become immutable once issued for review

Once v4 has been sent to the Client:

```text
DraftVersion v4
→ ReviewSession R14
```

internal editors must not edit v4 in place.

Any editorial change produces:

```text
DraftVersion v5
```

This preserves exactly what the Client saw.

---

# 4. “Latest Draft” is unsafe for review

Dangerous:

```text
review.subject = draftId

UI:
load latest DraftVersion
```

Suppose:

```text
Client was asked to review v4.
Internal editor creates v5.
Client opens review.
```

The Client might unknowingly review v5.

Correct:

```text
ReviewSession
→ DraftVersion v4
```

---

# 5. Review ≠ DraftVersion

A DraftVersion can have multiple review contexts.

Example:

```text
DraftVersion v4
├── Internal Editorial Review
└── Client Review
```

The artifact and the review process remain separate.

---

# 6. Internal Review ≠ Client Review

Design 024 already established this important distinction.

Internal review can include:

* editorial notes,
* fact-check concerns,
* strategic comments,
* internal revision requests,
* staff discussion.

Client Review must include only deliberately Client-visible review material.

Correct:

```text
DraftVersion
     │
     ├── InternalReviewSession
     └── ClientReviewSession
```

or equivalent audience-scoped review architecture.

---

# 7. Never filter internal comments only in frontend

Dangerous:

```text
GET allDraftComments()
↓
React hides comments where visibility === INTERNAL
```

Correct:

```text
ClientDraftReviewQuery
↓
returns only Client-visible ReviewComments
```

Internal comments should never reach the Client browser.

---

# 8. ReviewSession should be first-class conceptually

A useful conceptual structure:

```text
ReviewSession
├── id
├── subjectType
├── subjectVersionId
├── audience
├── Project/context
├── requested reviewers
├── requestedAt
├── dueAt
├── review lifecycle
└── submittedAt
```

Exact schema belongs to Phase 3D.

---

# 9. Review subject must be exact

Conceptually:

```text
subjectType = DRAFT_VERSION
subjectId   = draftVersion_4
```

This same exact-version principle can later support other reviewable artifacts.

---

# 10. Review ≠ Approval

A Client can review a Draft and say:

> Please rewrite the opening paragraph.

That is feedback.

It is not:

```text
ApprovalDecision = REJECTED
```

unless the formal Approval workflow explicitly records such a decision.

---

# 11. ReviewComment ≠ ApprovalDecision

Permanent rule:

```text
ReviewComment
"Looks great."
```

does **not** automatically mean:

```text
APPROVED
```

Formal Approval must go through Design 029 / Design 052.

---

# 12. If Design 049 contains an approval action

If the frozen UI includes a formal Approve control:

it should invoke the canonical:

```text
decideApproval()
```

against an exact ApprovalRequest.

It must **not** translate:

```text
button clicked
→ draft.reviewStatus = APPROVED
```

inside the Draft Review domain.

---

# 13. Review feedback ≠ content edit

A Client Review workspace should normally allow:

* comments,
* contextual annotations,
* revision feedback.

It should not directly mutate the canonical editorial Draft unless the frozen product explicitly supports collaborative Client editing.

This audit does not introduce direct Client editing.

---

# 14. Comment ≠ Suggestion ≠ Applied Change

If suggestions are supported:

```text
Client suggestion
≠
editorial content mutation
```

Editorial staff decide how the feedback affects the next DraftVersion.

---

# 15. Resolved comment ≠ implemented change

A comment may be marked resolved because:

* discussion is complete,
* clarification was provided,
* issue is no longer applicable.

That does not necessarily prove the Draft text changed.

Keep:

```text
Comment resolution
≠
Draft mutation
```

---

# 16. Review completion ≠ comment completion

A ReviewSession can contain:

```text
12 comments
10 resolved
2 open
```

Its overall review state remains separate from each comment/thread state.

---

# 17. Review lifecycle

Conceptual review states may need to distinguish:

```text
REQUESTED
IN_REVIEW
FEEDBACK_SUBMITTED
SUPERSEDED
COMPLETED
```

Exact enum belongs to Phase 3D.

Do not combine these with Draft lifecycle.

---

# 18. Draft lifecycle ≠ Review lifecycle

Example:

```text
DraftVersion:
ISSUED_FOR_REVIEW

ReviewSession:
IN_REVIEW
```

or:

```text
DraftVersion:
SUPERSEDED

Historical Review:
COMPLETED
```

These are legitimate combinations.

---

# 19. Feedback Submitted ≠ Revision Created

When Client clicks:

> Submit Feedback

the Review may become:

```text
FEEDBACK_SUBMITTED
```

But DraftVersion v5 does not yet exist automatically.

Editorial staff still need to process that feedback.

---

# 20. Revision Created ≠ Feedback Accepted Completely

Draft v5 may incorporate:

* all feedback,
* some feedback,
* editorial decisions beyond the Client comments.

Do not assume:

```text
new DraftVersion exists
=
every Client comment accepted
```

---

# 21. Superseding DraftVersion

Example:

```text
v4 → Client Review
Client submits feedback
↓
Editorial creates v5
```

v4 remains historically reviewable.

v5 becomes a new artifact version.

---

# 22. New version must not inherit comments blindly

A comment anchored to:

> Paragraph 8 in Draft v4

may not make sense in v5.

Therefore:

```text
Comment on v4
≠
Comment on v5
```

Automatically transferring comments can corrupt context.

---

# 23. Carry-forward requires explicit provenance

If future UX permits carrying unresolved comments into a new review:

preserve:

```text
original ReviewComment
original DraftVersion
new ReviewComment/reference
carry-forward relationship
```

Do not silently move the original comment.

No new carry-forward UI is required by this audit.

---

# 24. ReviewComment

Conceptually:

```text
ReviewComment
├── reviewSessionId
├── author
├── body
├── anchor/reference
├── createdAt
├── editedAt where allowed
├── state
└── visibility/audience
```

Exact schema later.

---

# 25. Comment thread

If replies are supported:

```text
ReviewComment
    ↓
Review replies/thread
```

should remain contextual to the original comment.

Do not create independent Messages for every reply.

---

# 26. Review Comment ≠ Client Message

Design 045 remains the general communication domain.

Review comments have artifact/version context.

Example:

```text
Client Message:
"Can we schedule a call tomorrow?"

Review Comment:
"Please revise this paragraph."
```

Different purpose.

---

# 27. Comment may generate Notification

Correct:

```text
ReviewComment
      ↓
Notification
```

but:

```text
Notification
≠
ReviewComment
```

Notification read state does not resolve the comment.

---

# 28. Annotation anchors

If Design 049 supports inline/contextual comments, the system needs durable anchors.

Avoid relying only on:

```text
characterStart = 412
characterEnd   = 468
```

against a mutable document.

Because the reviewed DraftVersion is immutable, offsets are safer, but stable:

* paragraph IDs,
* block IDs,
* section IDs,
* text anchors,

can improve resilience.

Exact representation Phase 3D.

---

# 29. Anchor belongs to exact version

Permanent rule:

```text
ReviewComment.anchor
→ DraftVersion v4
```

Never:

```text
ReviewComment.anchor
→ Draft latest
```

---

# 30. General comment

Not all feedback needs an inline anchor.

Architecture should also allow general Review feedback associated with the exact ReviewSession/DraftVersion.

---

# 31. Comment edit history

If Client comments can be edited after posting:

the platform should preserve enough history/audit semantics for meaningful review.

At minimum:

```text
editedAt
```

should be distinguishable from original creation.

For sensitive workflows, immutable revision history may be appropriate.

Exact policy Phase 3D.

---

# 32. Comment deletion

Hard deletion can damage editorial history.

If deletion is supported, policy should define:

* who can delete,
* whether tombstone remains,
* whether replies remain,
* audit behavior.

No deletion feature is introduced by this audit.

---

# 33. Author identity

Each Client comment should preserve:

```text
ClientPortalMembership / actor
```

so editorial staff know who gave the feedback.

Client company alone is insufficient.

---

# 34. Internal reply identity

Internal replies use canonical Design 036 member identity through a Client-safe projection.

Clients should see only appropriate:

* display name,
* safe role/title,
* avatar.

No internal Role/Team details.

---

# 35. Multiple Client reviewers

One DraftVersion may be reviewed by multiple Client participants.

Example:

```text
CEO
Marketing Director
Executive Assistant
```

Their:

* comments,
* review participation,
* formal approval authority

may differ.

---

# 36. Reviewer ≠ Approver

This must remain explicit.

```text
ReviewParticipant
≠
ApprovalParticipant
```

Someone can comment without having authority to formally approve.

---

# 37. Project access ≠ Draft review access

A Client Portal member who can view Project 123 does not necessarily have permission to review confidential Draft content.

Draft access must be separately authorized.

---

# 38. Draft read ≠ comment

Potential Phase 3D permissions:

```text
portal.drafts.read
portal.drafts.comment
portal.drafts.submit_feedback
```

are separate capabilities.

---

# 39. Comment ≠ formal approve

Likewise:

```text
portal.drafts.comment
≠
portal.approvals.decide
```

This is one of Design 049's strongest security boundaries.

---

# 40. Version history permissions

If earlier DraftVersions are visible:

access to them must be intentional.

A Client should not automatically receive every abandoned internal Draft simply because v4 was issued to them.

---

# 41. Client-visible versions

The system should explicitly know which DraftVersions were:

```text
released/issued to Client
```

versus:

```text
internal-only
```

The Client version history must use that safe subset.

---

# 42. Internal DraftVersion ≠ Client-released DraftVersion

Example:

```text
v1 internal
v2 internal
v3 internal
v4 Client review
v5 internal revision
v6 Client review
```

Portal history might legitimately show only:

```text
v4
v6
```

depending on product policy.

---

# 43. Client Action integration

Design 047 may show:

> Review Draft v4.

Its source should identify the exact ReviewSession/DraftVersion.

Opening the action routes to Design 049.

---

# 44. Completing Review should update Client Action resolver

When the canonical ReviewSession no longer requires action:

```text
Review state changes
      ↓
ClientActionResolver
      ↓
action disappears/changes
```

Do not maintain a second Client Action completion Boolean.

---

# 45. Dashboard consistency

Design 041's:

> Actions Required

must derive from the same Review/ClientAction state.

No separate dashboard Draft-review logic.

---

# 46. Project Detail consistency

Design 043 may show:

> Draft v4 awaiting review.

That summary must reference the exact same ReviewSession.

---

# 47. Timeline consistency

Design 044 may display:

```text
Draft sent for review
Feedback submitted
Revised Draft available
```

from canonical Draft/Review events.

No separate Timeline review truth.

---

# 48. Design 024 relationship

Design 024 remains authoritative for:

* Draft creation,
* DraftVersions,
* internal editorial workflow,
* internal review,
* Client review preparation.

Design 049 is the external review projection.

---

# 49. Internal editorial notes never enter Client DTO

A safe `ClientDraftVersionView` should contain only fields required for Client review.

Do not return:

```text
internalEditorNotes
factCheckFlags
AI confidence
internalReviewComments
```

even as null/hidden fields where avoidable.

---

# 50. AI provenance

If a Draft was AI-assisted:

the internal system may track that provenance.

The Client Review workspace does not need to expose raw prompts/model traces unless product policy specifically requires it.

The canonical DraftVersion remains the review subject regardless of authoring method.

---

# 51. Original Questionnaire answers ≠ Draft content

Design 048 established:

```text
QuestionnaireResponse
≠
Editorial Draft
```

The Draft may derive from Questionnaire answers, but changing the Draft must never alter the original Client answers.

---

# 52. Review feedback can influence new DraftVersion

Correct lineage:

```text
Questionnaire Response
       ↓
Draft v4
       ↓
Client Review / Comments
       ↓
Editorial revision
       ↓
Draft v5
```

Each stage remains traceable.

---

# 53. Draft rendering

The Portal should render a stable representation of the exact DraftVersion.

Avoid using a mutable editable editor state as the only historical representation.

The backend needs durable version content/snapshot semantics.

---

# 54. Rich-text security

If Draft content contains rich formatting:

render through a safe controlled schema.

Never execute arbitrary HTML/scripts embedded in Draft content.

---

# 55. Client comments are user-generated content

Comment bodies also require sanitization.

Do not render arbitrary Client HTML directly.

---

# 56. External links

If Draft content contains links:

safe link behavior and sanitization are required.

Client Review must not become an injection/phishing surface due to unsafe rich content.

---

# 57. Attachments to feedback

If frozen UI permits comment/review attachments:

reuse Design 030:

```text
ReviewComment / ReviewSession
      ↓
Asset/FileVersion
```

No review-specific blob storage.

---

# 58. Attachment upload ≠ ready

Reuse standard lifecycle:

```text
upload
→ scan
→ processing
→ ready
```

Review submission should respect required attachment readiness if attachments are mandatory.

---

# 59. Review export/download

If a Draft is downloadable:

```text
draft.read
≠
draft.download
```

where policy requires.

No export permission is implied merely by review access.

---

# 60. Comment count

Counts should derive from authorized ReviewComments.

Do not store manually synchronized:

```text
draft.commentCount
```

unless maintained as a reliable projection.

---

# 61. Open comment count ≠ review pending necessarily

A Review can be formally submitted even with open discussion threads depending on workflow.

The relationship should be defined rather than guessed by UI.

---

# 62. Review due date

If review has a deadline:

the deadline belongs to Review/ReviewRequest context.

It should not reuse the overall Project due date.

---

# 63. Due condition ≠ review lifecycle

Example:

```text
Review:
IN_REVIEW

Due condition:
OVERDUE
```

Separate dimensions.

---

# 64. Deadline timezone

Use the scheduling/date-only semantics already established in Designs 035/040/047.

Browser local time is not authoritative.

---

# 65. Submit feedback

A formal:

> Submit Feedback

should be an explicit command such as conceptually:

```text
submitDraftReviewFeedback()
```

that validates:

* active ReviewSession,
* correct DraftVersion,
* authorized reviewer,
* current revision,
* required feedback state.

---

# 66. Generic Draft PATCH is prohibited

Do not expose:

```text
PATCH /client/drafts/:id
{
  text,
  comments,
  approved,
  projectStage
}
```

This would collapse several domains.

---

# 67. Editorial team processes feedback

Once feedback is submitted:

internal editorial workflows decide:

* accept/change content,
* create new DraftVersion,
* respond to comments,
* request clarification.

The Client Portal must not directly advance internal workflow stages.

---

# 68. Project stage ≠ Review status

Client clicking Submit Feedback should not directly:

```text
project.stage = DESIGN
```

The canonical workflow engine decides whether the Review gate is satisfied.

---

# 69. Review gate

If Client Draft Review is a workflow dependency:

```text
Review requirement satisfied
      ↓
workflow policy evaluates
      ↓
next stage may become eligible
```

This should occur server-side.

---

# 70. Review requirement ≠ Approval gate

Some Projects may require:

* feedback review,
* formal approval,
* both.

Do not assume Review completion automatically satisfies Approval.

---

# 71. Design 052 relationship

Later:

**Design 052 — Client Approvals**

Design 052 is the Client's formal approval queue/workspace.

Design 049 is artifact-specific Draft feedback/review.

They can interoperate but remain separate.

---

# 72. Design 050 relationship

**Design 050 — Client Design Review**

This is the closest reuse candidate.

Both require:

* exact artifact version,
* ReviewSession,
* participants,
* comments,
* feedback submission,
* Client-safe visibility,
* formal Approval separation.

---

# 73. Draft annotation vs Design annotation

The two Review screens should share core Review infrastructure but use different anchor adapters.

### Draft Review

Potential anchors:

```text
section
paragraph
text range
```

### Design Review

Potential anchors:

```text
page
x/y coordinates
region
```

Therefore:

> **Share Review domain; specialize artifact annotation geometry.**

---

# 74. Avoid giant generic annotation schema

Do not force all artifacts into one brittle:

```text
x
y
startOffset
endOffset
page
```

record with many meaningless nullable fields.

Use typed/versioned artifact-specific anchor payloads under a common ReviewComment abstraction.

---

# 75. Design 098 relationship

Later:

**Proposal Review / Approval Detail**

Proposal review may reuse some exact-version Review primitives.

But Proposal-specific commercial semantics remain separate.

---

# 76. Design 115 relationship

Project Approval Gates/Approval History uses formal Approval infrastructure.

Do not use ReviewComment state as an Approval gate.

---

# 77. Notification integration

Events such as:

```text
Draft review requested
New review comment
Internal reply
New DraftVersion ready
```

can generate shared Notifications.

Notification read state does not equal Review completion.

---

# 78. Client Messages integration

A Review can provide a deep link to general Project communication if frozen.

But:

```text
Review thread
≠
MessageThread
```

Artifact feedback stays attached to the exact DraftVersion.

---

# 79. Activity integration

Design 063 may later show:

```text
Draft v4 sent for review
Feedback submitted
Draft v5 became available
```

These are Client-safe Activity projections.

Activity does not own the Review.

---

# 80. Audit integration

Material events can emit canonical AuditEvents:

```text
ClientDraftReviewRequested
ClientDraftFeedbackSubmitted
ReviewParticipantChanged
ReviewSuperseded
```

Formal ApprovalDecision remains emitted by the Approval domain.

---

# 81. Avoid auditing sensitive comment bodies indiscriminately

Audit can reference:

* comment ID,
* author,
* ReviewSession,
* action,
* timestamp.

It does not necessarily need to duplicate entire editorial comment text.

---

# 82. Concurrency — Client feedback

Two reviewers may comment simultaneously.

Comments should append independently without overwriting each other.

---

# 83. Concurrency — Review submission

If one designated reviewer submits final feedback while another user's view is stale:

server-side participant/policy rules determine whether:

* Review remains open,
* Review completes,
* additional reviewer feedback remains possible.

Do not let frontend state decide.

---

# 84. Stale DraftVersion

If Client opens v4 and meanwhile v5 is issued:

the screen must clearly distinguish:

```text
You are reviewing v4
Newer version v5 exists
```

according to frozen UX/policy.

Never silently swap the content.

---

# 85. Superseded Review

If v4 Review is intentionally replaced by a v5 Review:

v4 should become:

```text
SUPERSEDED
```

or equivalent historical state.

Its comments/history remain accessible according to permission.

---

# 86. Draft version unavailable

If rendering service fails:

do not show:

> No Draft.

Use:

> Draft is temporarily unavailable.

The Review record may still exist.

---

# 87. Comment service unavailable

If comments fail but Draft rendering succeeds:

the Client can still read the Draft.

Only comment/review collaboration becomes degraded.

---

# 88. Submission service unavailable

A Client should not receive:

> Feedback submitted

until authoritative command success.

---

# 89. Partial failure

Example:

```text
Draft content       ✓
Existing comments   ✓
New comment posting ✕
Notifications       ✓
```

The Review remains readable.

Only commenting is temporarily unavailable.

---

# 90. State Coverage

Design 049 inherits Design 150 plus review-specific states:

```text
Draft Review Loading
Draft Available

Review Requested
Review In Progress
Feedback Drafting
Feedback Submitted
Review Completed
Review Superseded

Newer DraftVersion Available
Current Version Historical

No Comments Yet
Comment Posting
Comment Posted
Comment Failed
Comment Resolved
Comment Reopened

Review Due Soon
Review Overdue

Formal Approval Pending
Formal Approval Completed
where separately relevant

Draft Rendering Failed
Comments Unavailable
Attachment Processing
Attachment Failed

Review Restricted
Draft Access Revoked
Review Participant Removed

Review Updated Elsewhere
Partial Service Failure
```

These are not one Draft status enum.

---

# 91. No comments ≠ no review required

A Review can be active with zero comments.

The Client may simply be reading.

---

# 92. No comments ≠ approved

Permanent rule:

```text
0 comments
≠
ApprovalDecision.APPROVED
```

---

# 93. Feedback submitted ≠ approved

Likewise:

```text
ReviewSession.FEEDBACK_SUBMITTED
≠
ApprovalDecision.APPROVED
```

unless a separate formal Approval record exists.

---

# 94. Restricted ≠ unavailable

If a Portal user is not an authorized reviewer:

the system should not claim:

> Draft unavailable.

Authorization and infrastructure failure remain distinct.

---

# 95. Permissions

Potential Phase 3D Client capabilities:

```text
portal.drafts.read
portal.drafts.comment
portal.drafts.submit_feedback
portal.drafts.view_review_history
```

and separately:

```text
portal.approvals.decide
```

Exact names later.

---

# 96. Read ≠ comment

An executive may be allowed to inspect the Draft but not add feedback.

---

# 97. Comment ≠ submit final feedback

If review policy differentiates contributors from a designated respondent:

```text
comment
≠
submit review
```

The architecture should support that distinction.

---

# 98. Submit feedback ≠ approval authority

Already emphasized because it is security-critical:

```text
submitReviewFeedback
≠
decideApproval
```

---

# 99. Responsive Behavior — Desktop

Desktop should preserve the richest review experience:

```text
Draft Review Header
↓
Project / Draft Version / Review State
↓
Draft Content
        +
Review / Comment Panel
↓
Contextual Comments / Threads
↓
Feedback Summary
↓
Submit Feedback / Formal Approval link/action if applicable
```

The exact frozen visual remains unchanged.

---

# 100. Responsive — Tablet

Following Design 152:

* Draft stays primary,
* comments can move to drawer/panel,
* version information remains visible,
* contextual anchors remain understandable,
* feedback submission remains easy to reach.

---

# 101. Responsive — Mobile

Mobile should become a focused reading/review flow:

```text
Draft Identity + Version
↓
Review State
↓
Draft Content
↓
Inline Comment Markers
↓
Open Comment Thread
↓
Return to Draft
↓
Review Summary
↓
Submit Feedback
```

Do not squeeze full desktop Draft + comments side-by-side.

---

# 102. Mobile annotation clarity

Selecting/locating comments must remain understandable without relying on tiny margin markers.

A comment should expose:

* referenced section/text,
* author,
* timestamp,
* discussion.

---

# 103. Accessibility

Review annotations cannot depend only on:

* highlights,
* colored underlines,
* small numbered markers.

Screen-reader users need explicit associations such as:

> Comment 3 applies to paragraph “Leadership has always…”

Keyboard users must be able to move between artifact and comments.

---

# 104. Backend Query Model

Conceptually:

```text
ClientDraftReviewView
├── ReviewSession
├── exact DraftVersion
├── safe rendered Draft content
├── Client-visible version metadata
├── authorized reviewers
├── ReviewComments / Threads
├── comment anchors
├── review due condition
├── current review state
├── related formal Approval summary if permitted
├── available actions
└── partial/freshness state
```

---

# 105. Backend Mutation Architecture

Prefer explicit commands:

```text
postDraftReviewComment()
replyToDraftReviewComment()
resolveReviewComment()       // where permitted
submitDraftReviewFeedback()
```

Internal/editorial:

```text
requestClientDraftReview()
issueNewDraftVersionForReview()
supersedeDraftReview()
```

Formal approval:

```text
decideApproval()
```

remains completely separate.

---

# 106. Backend Architecture

```text
Design 049
    ↓
ClientPortalSessionContext
    ↓
Draft Review Authorization
    ↓
ReviewSession
    ↓
Exact DraftVersion
    │
    ├── Client-safe rendering
    ├── ReviewComments
    ├── ReviewParticipants
    └── Review state
    ↓
Feedback Submission
    ↓
Editorial Workflow
    ↓
Potential New DraftVersion
```

Parallel formal decision path:

```text
DraftVersion
    ↓
ApprovalRequest
    ↓
ApprovalDecision
```

The two paths may interact but remain distinct.

---

# 107. Backend Requirements

| Requirement                                     | Status                               |
| ----------------------------------------------- | ------------------------------------ |
| Client Portal authentication                    | **Critical**                         |
| Active Portal membership                        | **Critical**                         |
| Project/resource scope                          | **Critical**                         |
| Canonical Draft                                 | **Critical**                         |
| Immutable/versioned DraftVersion                | **Critical**                         |
| Exact review subject binding                    | **Critical**                         |
| ReviewSession / equivalent                      | **Critical**                         |
| Client/Internal review separation               | **Critical**                         |
| Review participant model                        | **Critical**                         |
| ReviewComment model                             | **Critical**                         |
| Thread/reply support where frozen               | **Required**                         |
| Version-specific annotation anchors             | **Critical if inline review exists** |
| Client-safe Draft rendering                     | **Critical**                         |
| Rich-text sanitization                          | **Critical**                         |
| Client comment sanitization                     | **Critical**                         |
| Draft read/comment/submit permission separation | **Critical**                         |
| Approval separation                             | **Critical**                         |
| Client Action Resolver integration              | **Critical**                         |
| Project workflow dependency integration         | **Critical**                         |
| Exact Asset/FileVersion attachment support      | **Required if attachments exist**    |
| Version supersession semantics                  | **Critical**                         |
| Historical review preservation                  | **Critical**                         |
| Optimistic concurrency                          | **Critical**                         |
| Idempotent feedback submission                  | **Critical**                         |
| Notification integration                        | **Required**                         |
| Activity integration                            | **Required**                         |
| Audit integration                               | **Required**                         |
| Partial service failure                         | **Critical**                         |
| Design 050 review-core reuse                    | **Critical architecture**            |
| Design 052 Approval reuse                       | **Critical**                         |

---

# 108. Consolidation — Main Implementation Risks

Design 049 exposes several high-risk implementation errors:

**Draft/DraftVersion conflation**
Client reviews mutable “latest Draft.”

**DraftVersion/Review conflation**
Review lifecycle stored directly on DraftVersion.

**Internal/Client review conflation**
Internal editorial comments leak to Client.

**Review/Approval conflation**
Client feedback becomes formal approval.

**Comment/ApprovalDecision conflation**
“Looks good” is interpreted as Approval.

**Comment/content-edit conflation**
Client feedback directly mutates editorial text.

**Resolved/implemented conflation**
Resolving comment falsely claims change was made.

**Feedback-submitted/revision-created conflation**
Client submission automatically generates or advances Draft.

**Review/Project-stage conflation**
Submit button patches Project workflow directly.

**Latest-version bug**
Review switches from v4 to v5 after internal edit.

**Comment migration bug**
v4 annotations are silently attached to v5 content.

**Internal-version leakage**
Client sees Draft versions never issued externally.

**Reviewer/approver conflation**
Any commenter receives approval authority.

**Project/Draft permission conflation**
Project access exposes confidential Draft content.

**Artifact comment/Message conflation**
Review feedback loses exact DraftVersion context.

**Annotation-anchor corruption**
Text changes invalidate comments because anchors are not version-specific.

**Attachment/FileVersion conflation**
Historical review attachment changes when Asset receives a newer version.

**Rich-text injection**
Draft or Client comment content renders unsafe HTML.

**Comment deletion/history loss**
Editorial evidence disappears silently.

**Review submission duplication**
Network retry creates duplicate feedback submissions.

**Superseded/current conflation**
Old review remains active after new Draft issued.

**No-comments/approved conflation**
Silence becomes approval.

**Restricted/unavailable conflation**
Permission denial appears as system failure.

**049/050 duplicate review engines**
Draft and Design review get separate Comment/Participant/Review infrastructure.

**049/052 duplicate approval logic**
Draft Review invents another Approval state machine.

No additional screen is required.

These are **versioning, review, annotation, permission, workflow, and approval-boundary requirements**.

# Design 049 Audit Verdict

## **PASS — VERSION-SPECIFIC CLIENT DRAFT REVIEW & FEEDBACK ANCHOR**

**Domain directive:** **Draft ≠ DraftVersion ≠ ReviewSession ≠ ReviewComment ≠ ApprovalRequest ≠ ApprovalDecision.**

**Version directive:** every Client Review is permanently bound to one immutable exact DraftVersion; “latest Draft” is never used as the review subject.

**Editorial directive:** Design 024 remains the canonical Draft/DraftVersion and internal editorial workflow domain; Design 049 is its Client-safe review projection.

**Audience directive:** internal editorial reviews/comments and Client reviews/comments are structurally separated server-side. Internal feedback never reaches the Client payload.

**Review directive:** ReviewSession owns the review context and participants without becoming Draft lifecycle or Project lifecycle truth.

**Feedback directive:** Client comments and submitted feedback are editorial input; they never directly mutate the Draft.

**Approval directive:** Review feedback, resolved comments and “looks good” language never become formal Approval. Any formal decision uses Design 029/052's exact-version ApprovalRequest/ApprovalDecision infrastructure.

**Annotation directive:** contextual comments retain exact DraftVersion-specific anchors so historical feedback always points to the text the Client actually reviewed.

**Supersession directive:** issuing a newer DraftVersion never rewrites or silently migrates comments from the older review. Old reviews remain historically traceable.

**Client Action directive:** Designs 041–047 surface Draft review through the canonical Client Action resolver; Review completion changes the action through source state rather than a duplicate task-completion flag.

**Workflow directive:** submitted feedback may satisfy a workflow dependency, but Design 049 never directly patches Project or Editorial stage.

**People directive:** Client reviewer and internal responder identities remain attributable while internal staff use Client-safe Design 036 projections.

**Asset directive:** any Review attachments reuse Design 030's exact Asset/FileVersion and processing infrastructure.

**Security directive:** Project read, Draft read, Draft comment, feedback submission and Approval decision remain independently authorizable capabilities.

**Reliability directive:** current, superseded, unavailable, restricted, feedback-submitted and formally approved remain distinct states.

**Responsive directive:** desktop can use the full Draft + contextual comment composition; mobile becomes exact-version reading → comment context → feedback submission without compressing a desktop review canvas.

**Reuse directive:** Designs **049 and 050** should share core ReviewSession + participant + comment/thread + exact-version subject + visibility + submission infrastructure while using artifact-specific annotation adapters.

**Consolidation directive:** **STANDARDIZE ONE VERSION-AWARE REVIEW COLLABORATION FOUNDATION FOR DRAFT/PROOF ARTIFACTS — REVIEW SESSION + EXACT SUBJECT VERSION + PARTICIPANTS + CLIENT/INTERNAL AUDIENCE + COMMENTS/THREADS + ARTIFACT-SPECIFIC ANCHORS + FEEDBACK SUBMISSION — WHILE KEEPING FORMAL APPROVAL AS THE SEPARATE DESIGN 029/052 DOMAIN.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **49 / 153** |
| **PASS**                                   |                         **49** |
| **STANDARDIZE decisions**                  |                         **47** |
| **Potential implementation-overlap flags** |                         **40** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**49 / 153 = 32.0% audited.**

### Canonical Draft Review architecture after Design 049

```text
                CANONICAL DRAFT
                  Design 024
                      │
                      ↓
                 DraftVersion
                      │
          ┌───────────┴────────────┐
          ↓                        ↓
 Internal Review             Client Review
                                  │
                           ReviewSession
                                  │
                    ┌─────────────┼─────────────┐
                    ↓             ↓             ↓
                Reviewers      Comments      Feedback
                                  │
                                  ↓
                         Exact-version anchors
                                  │
                                  ↓
                        Editorial Revision
                                  │
                                  ↓
                         New DraftVersion
```

Formal approval remains a parallel, separate chain:

```text
DraftVersion
     ↓
ApprovalRequest
     ↓
ApprovalDecision
     ↓
Designs 029 / 052
```

# Next Sequential Audit Target

## **Design 050 — Client Design Review**

Its frozen identity is already locked.

The next audit will preserve the parallel but distinct artifact boundary:

> **Design/Proof ≠ DesignVersion/ProofVersion ≠ ReviewSession ≠ Visual Annotation ≠ ReviewComment ≠ ApprovalRequest ≠ ApprovalDecision.**

After Design 050 we continue strictly:

**051 Client Files & Assets → 052 Client Approvals → 053 Client Contracts → 054 Client Invoices & Payments → 055 Client Publishing & Distribution → 056 Client Reports & Downloads → … → 077 Client Access Recovery**

with the unchanged audit contract and **no redesign, no extra screen, no skipping and no sequence change.**

