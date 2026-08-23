# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 068 — Client Drafts Library

Its frozen identity and supplied route annotation **`/client/drafts`** are locked. Exact route connections remain a **Phase 3B** concern and are not being redesigned here.

Design 068 should become the **canonical Client Portal cross-Project Draft discovery/library surface** for Drafts and exact Client-released DraftVersions the current Portal member is authorized to access.

Its governing boundary is:

> **Draft ≠ DraftVersion ≠ ClientReleasedVersion ≠ ReviewSession ≠ ReviewComment ≠ ApprovalRequest ≠ LibraryEntry/Projection ≠ Project ≠ ClientAction.**

The central implementation rule is:

> **Design 068 must never ask for “the latest Draft.” It must resolve the latest version deliberately released to this Client/member, preserve exact-version Review history, and keep comments/feedback separate from formal Approval.**

---

# 1. Classification

| Audit field                        | Classification                                                                                                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                      | **068**                                                                                                                                                                           |
| **Canonical name**                 | **Client Drafts Library**                                                                                                                                                         |
| **Product area**                   | Client Portal / Editorial / Draft Review                                                                                                                                          |
| **User surface**                   | **Client Portal**                                                                                                                                                                 |
| **Screen class**                   | Cross-Project Draft Library / Review Discovery Workspace                                                                                                                          |
| **Classification**                 | **Portal Collection Variant — Client Draft & Version Library Family**                                                                                                             |
| **Primary purpose**                | Let authorized Client users discover Drafts across Projects, identify the exact Client-visible version, understand review/approval state, and open the appropriate Draft workflow |
| **Primary canonical entity**       | **Draft**                                                                                                                                                                         |
| **Version entity**                 | **DraftVersion**                                                                                                                                                                  |
| **Client visibility concept**      | **ClientReleasedVersion / ReleaseRecord**                                                                                                                                         |
| **Review entity**                  | **ReviewSession**                                                                                                                                                                 |
| **Comment entity**                 | **ReviewComment / ReviewThread**                                                                                                                                                  |
| **Formal approval entity**         | **ApprovalRequest / ApprovalDecision**                                                                                                                                            |
| **Library projection**             | **ClientDraftLibraryEntry**                                                                                                                                                       |
| **Canonical editorial foundation** | Design 024                                                                                                                                                                        |
| **Canonical Client Draft Review**  | Design 049                                                                                                                                                                        |
| **Approval foundation**            | Designs 029 / 052                                                                                                                                                                 |
| **Project dependency**             | Designs 023 / 043                                                                                                                                                                 |
| **Media Project dependency**       | Designs 065 / 066                                                                                                                                                                 |
| **Client Action dependency**       | Design 047                                                                                                                                                                        |
| **Asset dependency**               | Design 030 where Draft exports/attachments exist                                                                                                                                  |
| **Notification dependency**        | Designs 061 / 064                                                                                                                                                                 |
| **Activity dependency**            | Design 063                                                                                                                                                                        |
| **Parent shell**                   | `ClientPortalShell` — Design 002                                                                                                                                                  |
| **Primary read model**             | `ClientDraftsLibraryView`                                                                                                                                                         |
| **Template family**                | `ClientDraftLibraryTemplate`                                                                                                                                                      |
| **Auth**                           | Required                                                                                                                                                                          |
| **Authorization**                  | Portal membership + Project entitlement + exact DraftVersion release/review visibility                                                                                            |
| **Implementation priority**        | **Critical Editorial Review / Client Approval Workflow**                                                                                                                          |
| **Reuse level**                    | **Extremely High with Designs 024 and 049**                                                                                                                                       |

Design 068 should answer:

> **“Which Drafts have been released to me across my Projects, what exact version am I allowed to view, is feedback still required, what happened to earlier versions, whether formal approval is pending, and which Draft should I open?”**

Canonical architecture:

```text
Draft
  ↓
DraftVersion(s)
  ↓
Client Release / Visibility
  ↓
ReviewSession
  ├── ReviewComments / Threads
  └── Feedback submission
          ↓
ApprovalRequest
  └── ApprovalDecision
          ↓
Client-safe Library Projection
          ↓
ClientDraftLibraryEntry[]
          ↓
Design 068
```

---

# 2. Reuse

## Design 024 remains canonical for Draft production

Design 024 owns:

* Draft,
* DraftVersion,
* editorial production,
* internal review,
* Client-release eligibility,
* downstream editorial workflow.

Design 068 must not create:

```text
ClientDraft
PortalDraft
DraftLibraryDraft
```

as alternative Draft entities.

---

## Design 049 remains canonical for Client Draft Review

Design 049 already established:

> **Draft ≠ DraftVersion ≠ ReviewSession ≠ ReviewComment ≠ ApprovalRequest ≠ ApprovalDecision.**

Design 068 must reuse the same exact-version Review infrastructure.

Correct:

```text
Design 068
Cross-Project Draft discovery
        ↓
exact Client-visible DraftVersion
        ↓
Design 049
Version-specific review workflow
```

One backend.

Different screen purpose.

---

## Design 068 ≠ Design 049

### Design 049

Focused review of one exact DraftVersion.

### Design 068

Cross-Project Draft discovery and review-status library.

Therefore Design 068 should not duplicate:

* inline commenting engine,
* text anchors,
* feedback submission logic,
* Approval decisions.

---

## Reuse Design 043 / 066 Project context

The same Draft may appear:

```text
Design 043
Project Detail

Design 066
Media Project Detail

Design 068
Drafts Library
```

All must reference the same canonical:

* Draft ID,
* DraftVersion ID,
* Project,
* ReviewSession,
* Approval state.

---

## Reuse Design 047 ClientAction

A Draft can generate an action such as:

* Review Draft,
* Continue Feedback,
* Submit Feedback,
* Approve Draft,

depending on source state and current-user eligibility.

The action remains a projection.

Correct:

```text
DraftVersion / ReviewSession / ApprovalRequest
              ↓
       ClientActionResolver
              ↓
        ClientActionView
```

---

## Reuse Design 052 formal Approval

If the frozen design includes formal approval:

```text
DraftVersion
   ↓
ApprovalRequest
   ↓
ApprovalParticipant
   ↓
ApprovalDecision
```

Design 068 shows the state; it does not invent another Draft approval flag.

---

## Reuse Design 030 for generated files

If a Draft has:

* PDF export,
* downloadable document,
* attached reference file,

reuse `Asset/FileVersion`.

The DraftVersion remains the editorial content identity.

---

# 3. Entities

## Draft ≠ DraftVersion

`Draft` is the stable editorial work identity.

Example:

```text
Draft D-101
├── DraftVersion v1
├── DraftVersion v2
├── DraftVersion v3
└── DraftVersion v4
```

Version history must remain explicit.

---

## DraftVersion should be immutable once issued for Client review

Once v4 is released to a Client ReviewSession:

> content belonging to v4 must not be edited in place.

Changes produce v5.

Otherwise comments, approvals, and historical evidence lose their exact subject.

---

## Latest internal Draft ≠ latest Client-released Draft

Critical example:

```text
Latest internal DraftVersion:
v8

Latest Client-released DraftVersion:
v6
```

Design 068 must show **v6**, not v8.

Never resolve:

```text
draft.latestVersion
```

for Client access.

Resolve:

```text
latestClientReleasedDraftVersion(
  draft,
  current membership
)
```

or equivalent.

---

## ClientReleasedVersion is a visibility/release concept

The architecture needs explicit evidence that a particular version was made available to the Client.

This can be modeled through:

* a release record,
* version visibility state,
* ReviewSession audience/release linkage,

according to Phase 3D.

But the system must be able to answer:

> **Exactly when and why did DraftVersion v6 become Client-visible?**

---

## Released ≠ reviewed

Making a Draft available does not mean the Client has reviewed it.

---

## Viewed ≠ feedback submitted

Opening a DraftVersion does not count as formal review completion.

---

## Feedback submitted ≠ approved

Permanent:

```text
ReviewSession feedback submitted
≠
ApprovalDecision APPROVED
```

---

## ReviewSession binds exact DraftVersion

Correct:

```text
ReviewSession RS-30
→ DraftVersion DV-6
```

Never:

```text
ReviewSession
→ Draft D-101
→ load latest version
```

---

## ReviewSession ≠ ReviewComment

ReviewSession represents the overall review engagement.

ReviewComment represents one feedback item/thread.

---

## Comment ≠ feedback submission

A Client can leave several comments while the ReviewSession remains open.

There should be an explicit:

> submit feedback

or equivalent canonical transition if the workflow requires one.

---

## Comment resolved ≠ implemented

Design 049 already established this.

A thread can be marked resolved according to review workflow without proving the editorial team implemented the requested change.

---

## Comment resolved ≠ Draft approved

Also permanent.

---

## ReviewComment exact anchoring

For text Draft review, comments should preserve version-specific anchors such as:

* section,
* block,
* paragraph,
* text range,

according to Design 049.

Comments on v4 must not silently move to v5.

---

## Carry-forward comments must preserve provenance

If feedback remains relevant to a new version:

```text
Comment C-10
from DraftVersion v4
carried to v5
```

must be an explicit relationship.

Do not mutate its original version binding.

---

## Superseded version ≠ rejected version

This distinction is mandatory.

Example:

```text
v5 released
v6 later released
```

v5 may become:

> Superseded

without ever being formally rejected.

---

## Rejected ≠ superseded

A formal ApprovalDecision `REJECTED` is a business decision.

`SUPERSEDED` means a newer version replaced it in the active workflow.

They cannot share one state.

---

## Approval binds exact DraftVersion

Approval of v6 does not apply to v7.

Permanent:

```text
Approval(DraftVersion v6)
≠
Approval(Draft D)
```

---

## ApprovalRequest ≠ ApprovalDecision

The Request represents the active approval process.

The Decision represents immutable participant evidence.

---

## Reviewer ≠ approver

A user may:

* read,
* comment,
* submit feedback,

without authority to formally approve.

---

## ClientReleasedVersion ≠ approved version

A version can be released for review before it is approved.

---

## Approved version ≠ newest internal version

Example:

```text
v6 APPROVED
v7 INTERNAL DRAFT
```

Design 068 should continue to present v6 as the approved Client version until v7 is deliberately released.

---

## DraftVersion ≠ generated PDF

If the UI offers a Draft PDF:

```text
DraftVersion DV-6
      ↓
Generated Artifact
      ↓
Asset / FileVersion
```

The PDF is a representation of the DraftVersion.

It does not replace the DraftVersion.

---

## Draft ≠ Project

One Project may contain:

```text
Draft A
Draft B
Draft C
```

where product/editorial workflows require multiple pieces.

Do not encode:

```text
project.draftId
```

as a universal one-to-one assumption.

---

## Same Draft may have one Project lineage

Every Draft should retain canonical Project/editorial context.

The Library entry must never lose where the Draft belongs.

---

## LibraryEntry ≠ Draft

`ClientDraftLibraryEntry` is a read projection.

Conceptually:

```text
ClientDraftLibraryEntry
├── draftId
├── Client-visible DraftVersionId
├── title
├── Project context
├── version label
├── release date
├── review state
├── comment/feedback summary
├── approval state
├── current Client action
└── updated/reviewed time
```

These values remain source-derived.

---

## One Draft should normally appear once in the library

The Library should generally represent the current relevant Client-visible Draft state.

It should not create:

```text
Draft v4 card
Draft v5 card
Draft v6 card
```

as three separate Drafts unless the frozen design explicitly shows version history at collection level.

Version history belongs under the Draft workflow/detail.

---

## Historical versions remain discoverable through lineage

Hiding superseded versions from the primary Library collection does not mean deleting them.

They remain available where authorized/history is supported.

---

## Library current version selection needs a canonical resolver

Conceptually:

```text
resolveClientDraftVersion(
  draft,
  membership,
  project
)
```

must consider:

* released versions,
* current ReviewSession,
* approval state,
* supersession.

Do not choose by maximum version number alone.

---

## Review state ≠ Approval state

Potential valid combination:

```text
Review:
FEEDBACK_SUBMITTED

Approval:
PENDING
```

or:

```text
Review:
COMPLETED

Approval:
NOT_REQUIRED
```

Keep separate.

---

## ClientAction ≠ review state

Example:

```text
ReviewSession:
OPEN

Current User:
not a reviewer

ClientAction:
NONE
```

The Draft can be under review without requiring action from this user.

---

## Current-user action may disappear

If another authorized participant submits feedback or approves:

Design 068 should reevaluate current actionability.

Do not retain stale:

> Review Draft

CTA.

---

## Notification ≠ Draft state

Design 064 can say:

> New Draft available.

Reading it never changes review state.

---

## Activity ≠ Draft state

Design 063 may record:

> Draft version 6 released.

That is historical projection, not canonical release state.

---

# 4. Permissions

Authorization should evaluate:

```text
Portal membership
+
Client/account scope
+
Project entitlement
+
Draft access
+
exact DraftVersion Client-release state
+
ReviewSession participant/audience
+
ApprovalParticipant state where relevant
```

---

## Same Client ≠ same Draft library

Different Portal members can have different Draft visibility.

Example:

```text
CEO
→ all Client-released executive Drafts

PR Director
→ PR/article Drafts

Finance Contact
→ no editorial Drafts
```

---

## Project access ≠ Draft access automatically

A Project viewer may see:

> Editorial drafting underway

without access to confidential Draft text.

---

## Draft read ≠ comment

Conceptually:

```text
draft.read
≠
draft.review.comment
```

Exact permission names Phase 3D.

---

## Comment ≠ submit feedback

If collaborative review policy distinguishes them:

```text
review.comment
≠
review.submit_feedback
```

---

## Submit feedback ≠ approve

Permanent.

---

## Approval capability ≠ ApprovalParticipant

Even if the Portal role permits approvals generally:

the exact ApprovalRequest must include this person as an eligible ApprovalParticipant.

---

## Portal Admin ≠ Draft reviewer automatically

Design 062 administration authority must never imply access to all editorial Drafts.

---

## Client Draft access ≠ internal Draft access

A user must never be able to access unreleased/internal versions by changing:

```text
versionId
```

in a request.

Every exact DraftVersion must be independently authorized.

---

## Version history access

A Client may only see versions deliberately released/authorized for them.

Internal iterations must remain invisible.

---

## Direct Draft ID ≠ access

Knowing a Draft ID is insufficient.

The backend needs to resolve an authorized released version.

---

## Direct DraftVersion ID ≠ access

Even more important.

A user guessing internal v8 must receive denial.

---

## Comment visibility

Client-visible ReviewComments must be audience-filtered.

Internal editorial notes and internal ReviewSessions never enter Client payloads.

---

## Comment author privacy

Only return safe participant information.

Do not expose internal workforce details beyond the product's Client-visible policy.

---

## Download permission

If a Draft artifact can be downloaded:

```text
draft.read
≠
draft.download
```

where separate policy exists.

Design 030 secure FileVersion access still applies.

---

## Search authorization

Search across Drafts must operate on authorized Client-visible Drafts/versions only.

No internal title/snippet leakage.

---

## Search content

Full Draft-text search may be sensitive.

If frozen Design 068 only searches titles/Projects, do not index entire Draft content unnecessarily.

---

# 5. States

Design 068 should separate Library/query, release, Review, Approval, version and action states.

### Library/query states

```text
Draft Library Loading
Drafts Available
No Drafts
No Results for Filters
Loading More
Load More Failed
```

### Client release/version state

```text
No Client Version Yet
Client Version Available
New Client Version Available
Version Superseded
Version Restricted
```

### Review state

```text
Review Not Started
Review Open
Feedback In Progress
Feedback Submitted
Review Closed
Revision Issued
```

### Approval state

```text
Approval Not Required
Approval Pending
Approved
Rejected
Approval Superseded
```

### Current-user action

```text
No Action
Review Draft
Continue Feedback
Submit Feedback
Approve / Decide where eligible
Waiting on Another Participant
Action Restricted
Action State Unavailable
```

These must not become one `draft.status`.

---

## No Client Draft ≠ Draft service unavailable

Separate.

---

## Internal Draft exists ≠ Client Draft exists

Do not expose an item merely because editorial has started an internal Draft.

The Library needs at least an authorized Client-release state.

---

## Released ≠ reviewed

Permanent.

---

## Review Open ≠ action required for this user

Participant eligibility matters.

---

## Feedback Submitted ≠ approval pending automatically

Some review workflows may not require formal approval.

Use canonical Approval state.

---

## Approved ≠ final forever

A later DraftVersion can be created.

Approval remains exact-version evidence.

---

## New version available ≠ previous version rejected

Permanent.

---

## Superseded ≠ rejected

Permanent.

---

## Rejected ≠ deleted

Historical rejected version remains evidence.

---

## Review service unavailable ≠ no review

Do not show:

> No feedback required

if review data failed.

---

## Approval service unavailable ≠ not required

Critical:

```text
Approval state unavailable
≠
Approval not required
```

---

## Action resolver unavailable ≠ no action

Same invariant as Designs 065–067.

---

## Comment count unavailable ≠ zero comments

Unknown is not zero.

---

## Draft artifact unavailable ≠ DraftVersion missing

Generated PDF failure should not erase structured Draft access.

---

## Updated elsewhere

Another reviewer can submit feedback or another version can be released while the library is open.

Design 068 must refresh/reconcile.

---

## State Coverage

Design 068 inherits Design 150 plus:

```text
Draft Library Loading
Draft Library Available

No Drafts
No Results for Filters

Client Draft Available
New Client Draft Version Available
Draft Version Superseded
Draft Restricted

Review Not Started
Review In Progress
Feedback Submitted
Review Closed
Review State Unavailable

Approval Not Required
Approval Pending
Draft Approved
Draft Rejected
Approval Superseded
Approval State Unavailable

Review Action Required
Continue Feedback
Submit Feedback
Waiting on Another Reviewer
Action Restricted
Action State Unavailable

Draft Artifact Available
Draft Artifact Processing
Draft Artifact Unavailable

Comment Summary Available
Comment Summary Unavailable

Older Drafts Loading
Older Drafts Load Failed

Partial Draft Service Failure
```

---

# 6. Responsive Behavior

## Desktop

Desktop should optimize cross-Project Draft discovery:

```text
Drafts
↓
Summary / Filters if frozen
↓
Draft Library
    ├── Draft title
    ├── Project / media context
    ├── Client-visible version
    ├── released/updated date
    ├── review state
    ├── approval state
    ├── current-user action
    └── Open / Review
```

It should not become an internal Editorial management table.

---

## Desktop must not expose internal versions

No internal version selector showing:

```text
v1
v2
v3 internal
v4 internal
v5 Client
```

unless those versions are deliberately Client-visible.

---

## Tablet

Following Design 152:

* dense rows reflow to compact cards,
* Project and version stay visible,
* Review and Approval remain distinguishable,
* actions remain touch-safe,
* filters can collapse.

---

## Mobile

Priority:

```text
Drafts
↓
Draft Card
   ├── title
   ├── Project
   ├── version
   ├── review state
   ├── approval state where relevant
   └── Review / View
↓
Next Draft
```

No horizontally compressed editorial table.

---

## Mobile exact-version clarity

Always communicate:

> Draft v6

or equivalent version label where version matters.

Avoid ambiguous:

> Latest Draft.

---

## Mobile state clarity

Use explicit text such as:

> Feedback submitted
> Approval pending
> Superseded by Draft v7

instead of relying only on badge colors.

---

## Accessibility

A Draft entry should expose something equivalent to:

> Leadership Article Draft, version 6, Project Executive Magazine, feedback required, released August 22. Review Draft.

where source data supports it.

---

## Review accessibility

Design 049's text-comment anchor accessibility requirements continue unchanged.

---

# 7. Backend Requirements

## Library query architecture

```text
Design 068
    ↓
ClientPortalSessionContext
    ↓
Draft Library Authorization
    ↓
ClientDraftLibraryQueryService
    │
    ├── authorized Drafts
    ├── Client-released DraftVersions
    ├── Project/media context
    ├── current ReviewSession
    ├── Review summary
    ├── formal Approval summary
    ├── current ClientAction
    └── optional Draft artifact
    ↓
ClientDraftLibraryEntry[]
    ↓
ClientDraftsLibraryView
```

---

## Draft is the logical collection anchor

The library query should conceptually start from:

```text
authorized Client-visible Drafts
```

and resolve the correct released version for each.

Not:

```text
all DraftVersions
```

followed by naïve deduplication.

---

## Client-visible version resolver

This is critical.

Conceptually:

```text
resolveCurrentClientDraftVersion(
    draftId,
    membershipId,
    projectId
)
```

must consider:

* release eligibility,
* Client visibility,
* supersession,
* current ReviewSession,
* permission.

Never use `MAX(versionNumber)`.

---

## Release record / audience resolver

The backend must know which DraftVersion was released to:

* which Client/account,
* which Project,
* which Portal members/audience,
* at what time.

This prevents accidental leakage of internal revisions.

---

## Review resolver

For the selected Client-visible DraftVersion:

```text
resolveReviewSession(
  exact DraftVersion,
  current membership
)
```

returns only Client-safe ReviewSession/Comment state.

---

## Approval resolver

Formal Approval is resolved independently:

```text
DraftVersion
→ ApprovalRequest
→ ApprovalParticipant
→ current aggregate state
```

No inference from Review comments.

---

## Action resolver

Conceptually:

```text
DraftVersion
+
ReviewSession
+
ApprovalRequest
+
current user permissions
       ↓
ClientActionResolver
```

Possible result:

* Review,
* Continue feedback,
* Submit feedback,
* Approve,
* none,
* unavailable.

---

## Exact-version opening

Design 068 should open Review using:

```text
draftId
+
draftVersionId / ReviewSession
```

or equivalent canonical context.

The review screen must not resolve `latest`.

---

## Review comments query

Comments are keyed to exact version and anchor.

Do not merge comments from multiple versions into one count unless the UI explicitly distinguishes them.

---

## Comment count

If Library shows:

> 4 comments

define whether that means:

* all comments,
* unresolved comments,
* Client comments,
* comments on current version.

One governed definition must be used.

---

## Version history resolver

Where Library/detail supports history:

return only authorized Client-released versions.

Internal versions must remain absent from the DTO.

---

## Draft artifact generation

If an export is available:

```text
DraftVersion
      ↓
Artifact generator
      ↓
Asset / FileVersion
```

Generation can be async/idempotent.

Artifact failure does not alter DraftVersion.

---

## Mutation architecture

Design 068 itself should remain primarily read/navigation-oriented.

Source-specific mutations belong to:

```text
addReviewComment()
submitReviewFeedback()
decideApproval()
```

through Designs 049/052.

Never:

```text
PATCH /client/drafts/:id
{
  approved: true,
  reviewed: true,
  status: "complete"
}
```

---

## Review submission idempotency

Submitting feedback must tolerate retries without creating duplicate review-submission events.

---

## Approval idempotency/concurrency

Formal decision uses Design 029/052 semantics:

* exact ApprovalRequest,
* exact DraftVersion,
* eligible participant,
* current state,
* replay-safe command.

---

## New-version event handling

When editorial releases v7:

```text
DraftVersionReleasedToClient
```

should update:

* Design 068 Library,
* Design 043/066 summary,
* ClientAction,
* Notifications,
* Activity,

through canonical event/projection logic.

---

## Old action invalidation

Any pending action against v6 must be reevaluated if v6 is superseded.

Never allow a stale Library CTA to approve a superseded version unless policy explicitly permits historical decision.

---

## Project workflow integration

Approval/feedback may affect Project workflow through backend evaluators:

```text
Review/Approval event
       ↓
Project workflow evaluator
```

Design 068 frontend does not patch Project stage.

---

## Search

Index only Client-safe Draft metadata.

If content search is supported later, authorization must include exact Client-visible DraftVersion.

---

## Pagination

Server-side pagination/cursor semantics for growing historical libraries.

---

## Counts

If the frozen design contains counts:

```text
Needs Review
Awaiting Approval
Completed
```

derive them from the same authorized Draft/Review/Approval query definitions.

---

## Permission-safe caching

Cache dimensions should include:

```text
membershipId
Project entitlement revision
Draft release revision
Review revision
Approval revision
```

Do not reuse an Approver's library projection for a Viewer.

---

## Partial failure

Example:

```text
Draft/release data ✓
Project metadata   ✓
Review service     ✕
Approval service   ✓
```

Do not infer:

> Review not required.

Return Review state unavailable.

---

## Backend Requirement Matrix

| Requirement                                   | Status                           |
| --------------------------------------------- | -------------------------------- |
| Client Portal authentication                  | **Critical**                     |
| Active Portal membership                      | **Critical**                     |
| Canonical Draft reuse                         | **Critical**                     |
| Immutable DraftVersion                        | **Critical**                     |
| Draft/DraftVersion separation                 | **Critical**                     |
| Explicit Client-release semantics             | **Critical**                     |
| Latest internal vs Client-released separation | **Critical**                     |
| Current Client-version resolver               | **Critical**                     |
| Client audience/version authorization         | **Critical**                     |
| ReviewSession exact-version binding           | **Critical**                     |
| ReviewSession/ReviewComment separation        | **Critical**                     |
| Version-specific comment anchors              | **Critical**                     |
| Review feedback/formal Approval separation    | **Critical**                     |
| Design 029/052 Approval reuse                 | **Critical**                     |
| Exact-version Approval binding                | **Critical**                     |
| Superseded/rejected separation                | **Critical**                     |
| Reviewer/Approver separation                  | **Critical**                     |
| ClientDraftLibraryEntry projection            | **Critical**                     |
| Project/Draft separation                      | **Critical**                     |
| Multi-Draft-per-Project safety                | **Required**                     |
| Design 047 ClientAction reuse                 | **Critical**                     |
| Action/source-state separation                | **Critical**                     |
| Internal Draft exclusion                      | **Critical**                     |
| Client-visible version history filtering      | **Critical**                     |
| Direct DraftVersion reauthorization           | **Critical**                     |
| Design 030 Asset reuse                        | **Required where exports exist** |
| Artifact/DraftVersion separation              | **Critical**                     |
| Idempotent review submission                  | **Critical**                     |
| Approval concurrency/idempotency              | **Critical**                     |
| Project workflow event integration            | **Critical**                     |
| Notification integration                      | **Required**                     |
| Activity integration                          | **Required**                     |
| Permission-safe search                        | **Critical**                     |
| Server pagination                             | **Required**                     |
| Permission-safe counts                        | **Critical**                     |
| Permission-safe caching                       | **Critical**                     |
| Partial-service degradation                   | **Critical**                     |
| Design 024 backend reuse                      | **Critical**                     |
| Design 049 backend reuse                      | **Critical**                     |
| Designs 043/066 consistency                   | **Critical**                     |
| Design 069 review-platform reuse              | **Critical architecture**        |

---

# 8. Consolidation

Design 068 exposes several major implementation risks.

**Draft / DraftVersion conflation**
Content revisions overwrite review history.

**Latest internal / latest Client version conflation**
Unreleased editorial content leaks into the Portal.

**Version number / visibility conflation**
Highest version number is assumed Client-visible.

**Client release / approval conflation**
Making Draft available means it is considered approved.

**Released / reviewed conflation**
Client visibility is treated as proof the Client reviewed it.

**Viewed / feedback-submitted conflation**
Opening Draft completes review.

**ReviewSession / Draft conflation**
Review state is stored directly on the logical Draft.

**ReviewSession / ReviewComment conflation**
One comment becomes whole-review status.

**Comment / feedback-submission conflation**
Any comment closes ReviewSession.

**Resolved comment / implemented change conflation**
Editorial work is falsely considered completed.

**Resolved comment / formal approval conflation**
Thread cleanup becomes legal/business decision.

**Feedback / ApprovalDecision conflation**
“Looks good” or submitted comments approve the Draft.

**Reviewer / Approver conflation**
Comment permission grants formal approval authority.

**ApprovalRequest / ApprovalDecision conflation**
Pending process and immutable decision merge.

**Draft-level approval / version-level approval conflation**
Approval incorrectly applies to all future DraftVersions.

**Approved v6 / latest v7 conflation**
New internal version inherits approval.

**Superseded / rejected conflation**
Normal version replacement appears as Client rejection.

**Rejected / deleted conflation**
Historical decision evidence disappears.

**Carry-forward comment mutation**
v4 comments are silently reassigned to v5.

**Client Draft / generated PDF conflation**
Artifact becomes editorial source truth.

**Project / Draft conflation**
One Project is forced to one Draft.

**LibraryEntry / Draft conflation**
Projection fields become independently editable.

**Response/list item per DraftVersion**
One Draft appears repeatedly as separate logical Drafts.

**Project access / Draft access conflation**
Any Project viewer reads confidential editorial content.

**Draft read / comment conflation**
Viewer can submit feedback.

**Comment / submit-feedback conflation**
Any collaborator can finalize review.

**Portal Admin / Draft reviewer conflation**
Team-access administrator sees/reviews all editorial material.

**General approval permission / exact participant conflation**
Any broadly authorized approver can decide every Draft.

**Direct DraftVersion ID bypass**
User guesses internal/unreleased version.

**Internal review / Client review conflation**
Private editorial notes leak.

**Comment author / internal workforce leakage**
Portal reveals unnecessary staff data.

**Download / read conflation**
Draft viewer automatically gets export access.

**Notification / Draft truth conflation**
Read notification changes Review state.

**Activity / Draft truth conflation**
Activity entry becomes release evidence.

**Action / Draft truth conflation**
Dismissing action changes Review/Approval state.

**Review service unavailable / no review conflation**
Unknown state appears complete.

**Approval service unavailable / approval not required conflation**
Critical formal step disappears.

**Comment count unavailable / zero conflation**
Unknown comments appear absent.

**Artifact unavailable / Draft missing conflation**
PDF generation failure hides structured Draft.

**Stale action after supersession**
Client approves v6 after v7 replaces it.

**Frontend Project-stage mutation**
Review/Approval action directly edits Project lifecycle.

**Generic Draft PATCH**
One endpoint changes review, approval, Project and version state.

**068/049 duplicate review engine**
Library builds its own comment/feedback workflow.

**068/024 duplicate Draft backend**
Client library creates separate Draft/Version records.

**068/043/066 duplicate current-Draft logic**
Each screen chooses a different “current” version.

**068/069 duplicate review foundation**
Draft and Proof libraries independently implement version/review/approval mechanics despite shared infrastructure.

No additional screen is required.

These are **exact-version identity, Client-release visibility, review, approval, authorization, supersession, and cross-Project library requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT CROSS-PROJECT DRAFT VERSION, REVIEW & APPROVAL LIBRARY ANCHOR**

**Domain directive:**
**Draft ≠ DraftVersion ≠ ClientReleasedVersion ≠ ReviewSession ≠ ReviewComment ≠ ApprovalRequest ≠ ClientDraftLibraryEntry ≠ Project ≠ ClientAction.**

**Reuse directive:**
Design 024 remains the canonical Draft/DraftVersion production engine, while Design 049 remains the canonical Client Draft Review workflow. Design 068 is only a broader authorized cross-Project library over them.

**Version directive:**
every Client Draft experience resolves an exact immutable DraftVersion. “Latest internal version” must never be used as Client-visible truth.

**Release directive:**
the system maintains explicit Client-release/visibility semantics so it can distinguish internal v8 from Client-released v6 reliably.

**Review directive:**
every ReviewSession binds to one exact DraftVersion; review state never attaches vaguely to the Draft as a whole.

**Comment directive:**
ReviewComments/threads remain version-specific collaboration records. Commenting, resolving or submitting feedback does not constitute formal Approval.

**Approval directive:**
formal Approval remains Designs 029/052 `ApprovalRequest + ApprovalParticipant + ApprovalDecision`, bound to the exact DraftVersion.

**Reviewer directive:**
reviewer, commenter and approver remain separate roles/capabilities. Portal administration never automatically grants editorial review or approval authority.

**Supersession directive:**
a newer DraftVersion can supersede an older released version without implying rejection. `SUPERSEDED` and `REJECTED` remain separate business outcomes.

**Approval-version directive:**
approval of DraftVersion v6 never propagates automatically to v7 or another materially changed version.

**Library directive:**
`ClientDraftLibraryEntry` is a source-derived read projection representing the current relevant Client-visible Draft/version state. It never becomes independently mutable Draft truth.

**Project directive:**
Drafts retain Project/editorial lineage, but Project and Draft remain separate entities; Projects can support multiple Drafts where required.

**Action directive:**
Design 047 determines whether this current user needs to Review, Continue Feedback, Submit Feedback or Approve. Action state never becomes editorial source truth.

**Asset directive:**
generated Draft PDFs/downloads reuse Design 030 Asset/FileVersion infrastructure and remain representations of exact DraftVersions rather than editorial source content.

**Authorization directive:**
Project access, Draft read, exact-version visibility, commenting, feedback submission, formal approval and download remain separately enforceable. Direct version IDs never bypass release/access policy.

**Internal-privacy directive:**
internal DraftVersions, internal ReviewSessions, private editorial notes and internal-only participants are excluded server-side from Client DTOs.

**Current-version directive:**
Designs 043, 049, 066 and 068 must share one Client-visible DraftVersion resolver so “current Draft” cannot differ across screens.

**Mutation directive:**
Design 068 itself remains principally read/navigation oriented. Review feedback and Approval use the source-domain commands established by Designs 049/052; generic Draft status PATCH operations are prohibited.

**Event directive:**
new Client Draft releases, Review submissions, Approval decisions and supersession events update Project summaries, ClientAction, Notifications and Activity through canonical event/projection infrastructure.

**Failure directive:**
Review unavailable, Approval unavailable, action unavailable, comment-count unavailable and artifact unavailable remain distinct from `not required`, `none`, `0`, or Draft absence.

**Responsive directive:**
desktop provides cross-Project Draft/version/review scanning; mobile prioritizes title → Project → exact Client version → Review state → Approval state → current authorized action.

**Shared-review directive:**
Design 069 should reuse the same ReviewSession/participant/comment/approval foundation as Design 068, while preserving text-specific anchors for Drafts and visual/page-region anchors for Proofs.

**Overlap directive:**
Designs **024, 029, 043, 047, 049, 052, 063–069** must ultimately share one DraftVersion + Client Release + ReviewSession + Comment + Approval + ClientAction foundation without duplicating Draft review logic across Portal screens.

**Consolidation directive:**
**STANDARDIZE ONE VERSION-SPECIFIC DRAFT REVIEW FOUNDATION — CANONICAL DRAFT + IMMUTABLE DRAFTVERSION + EXPLICIT CLIENT RELEASE/VISIBILITY + EXACT-VERSION REVIEWSESSION + VERSION-SPECIFIC COMMENTS/THREADS + FEEDBACK SUBMISSION + SEPARATE FORMAL APPROVAL + SUPERSESSION + CLIENT ACTION RESOLUTION — AND BUILD DESIGN 068 ONLY AS AN AUTHORIZED CROSS-PROJECT LIBRARY OVER THAT FOUNDATION, NEVER AS A SECOND DRAFT OR REVIEW BACKEND.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **68 / 153** |
| **PASS**                                   |                         **68** |
| **STANDARDIZE decisions**                  |                         **66** |
| **Potential implementation-overlap flags** |                         **59** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**68 / 153 = 44.4% audited.**

### Canonical Draft architecture after Design 068

```text
                      DRAFT
                       │
                       ↓
                  DraftVersion
                       │
              ┌────────┴────────┐
              ↓                 ↓
        Internal Version   Client Released Version
                                │
                                ↓
                          ReviewSession
                         ┌───────┴───────┐
                         ↓               ↓
                 ReviewComments     Feedback Submit
                                         │
                                         ↓
                                   ApprovalRequest
                                         │
                                         ↓
                                   ApprovalDecision
```

The Client surfaces remain separated:

```text
Design 068
Drafts Library
      ↓
“Which Drafts/Client versions exist across my Projects?”

Design 049
Draft Review
      ↓
“Review this exact DraftVersion.”

Design 066
Media Project Detail
      ↓
“How does this Draft relate to this media Project?”

Design 047
Client Actions
      ↓
“What Draft review/approval action currently requires me?”
```

All consume the **same canonical DraftVersion, ReviewSession and Approval state**.

# Next Sequential Audit Target

## **Design 069 — Client Designs / Proofs Library**

Its frozen identity and supplied route annotation **`/client/designs`** are already locked.

The next audit must preserve:

> **Design/Proof ≠ ProofVersion ≠ ClientReleasedProofVersion ≠ RenderDerivative ≠ ReviewSession ≠ VisualAnnotation ≠ ReviewComment ≠ ApprovalRequest ≠ LibraryEntry/Projection ≠ ClientAction.**

It must reconcile **Design 050's exact-version visual Proof review workflow** with a broader cross-Project Proof library while preserving:

* latest internal Proof ≠ latest Client-released Proof,
* business ProofVersion ≠ technical render derivative,
* annotations bind exact ProofVersion/page/normalized coordinates,
* Review feedback ≠ formal ApprovalDecision,
* superseded Proof ≠ rejected Proof,
* no second Proof/design backend for the library.

After Design 069 we continue strictly:

**070 Client Contract Detail & Digital Signing → 071 Client Invoice / Payment Detail → 072 Client Publishing / Live Links Detail → 073 Client Distribution Detail → 074 Client Message Thread Detail → 075 Client Sign In → 076 Client Portal Activation / Accept Invite → 077 Client Access Recovery**

with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
