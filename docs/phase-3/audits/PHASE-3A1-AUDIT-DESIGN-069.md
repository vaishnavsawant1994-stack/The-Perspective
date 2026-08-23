# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 069 — Client Designs / Proofs Library

Its frozen identity and supplied route annotation **`/client/designs`** are locked. Exact route connections remain a **Phase 3B** concern and are not being redesigned here.

Design 069 should become the **canonical Client Portal cross-Project visual-proof discovery/library surface** for Design/Proof artifacts and exact Client-released ProofVersions that the current Portal member is authorized to see, review, or approve.

Its governing boundary is:

> **Design/Proof ≠ ProofVersion ≠ ClientReleasedProofVersion ≠ RenderDerivative ≠ ReviewSession ≠ VisualAnnotation ≠ ReviewComment ≠ ApprovalRequest ≠ LibraryEntry/Projection ≠ ClientAction.**

The central implementation rule is:

> **Design 069 must never resolve “the latest Proof.” It must resolve the exact ProofVersion deliberately released to the Client, keep visual annotations and review history pinned to that version, and preserve a strict distinction between technical render files, review feedback, and formal Approval.**

---

# 1. Classification

| Audit field                         | Classification                                                                                                                                                                              |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                       | **069**                                                                                                                                                                                     |
| **Canonical name**                  | **Client Designs / Proofs Library**                                                                                                                                                         |
| **Product area**                    | Client Portal / Visual Design / Proof Review                                                                                                                                                |
| **User surface**                    | **Client Portal**                                                                                                                                                                           |
| **Screen class**                    | Cross-Project Visual Proof Library / Review Discovery Workspace                                                                                                                             |
| **Classification**                  | **Portal Collection Variant — Client Proof, Version & Visual Review Library Family**                                                                                                        |
| **Primary purpose**                 | Let authorized Client users discover visual Proofs across Projects, identify the exact Client-visible version, understand review/approval state, and open the correct proof-review workflow |
| **Primary business entity**         | **Design / Proof**                                                                                                                                                                          |
| **Version entity**                  | **ProofVersion**                                                                                                                                                                            |
| **Client visibility concept**       | **ClientReleasedProofVersion / release visibility**                                                                                                                                         |
| **Technical rendering entity**      | **RenderDerivative**                                                                                                                                                                        |
| **Review entity**                   | **ReviewSession**                                                                                                                                                                           |
| **Visual feedback entity**          | **VisualAnnotation**                                                                                                                                                                        |
| **Comment entity**                  | **ReviewComment / AnnotationThread**                                                                                                                                                        |
| **Formal approval entity**          | **ApprovalRequest / ApprovalDecision**                                                                                                                                                      |
| **Library projection**              | **ClientProofLibraryEntry**                                                                                                                                                                 |
| **Canonical production foundation** | Design 025 and applicable visual-production domains                                                                                                                                         |
| **Canonical Client visual review**  | Design 050                                                                                                                                                                                  |
| **Approval foundation**             | Designs 029 / 052                                                                                                                                                                           |
| **Project dependency**              | Designs 023 / 043                                                                                                                                                                           |
| **Media Project dependency**        | Designs 065 / 066                                                                                                                                                                           |
| **Client Action dependency**        | Design 047                                                                                                                                                                                  |
| **Asset dependency**                | Design 030                                                                                                                                                                                  |
| **Draft-review shared foundation**  | Designs 049 / 068                                                                                                                                                                           |
| **Notification dependency**         | Designs 061 / 064                                                                                                                                                                           |
| **Activity dependency**             | Design 063                                                                                                                                                                                  |
| **Parent shell**                    | `ClientPortalShell` — Design 002                                                                                                                                                            |
| **Primary read model**              | `ClientProofsLibraryView`                                                                                                                                                                   |
| **Template family**                 | `ClientVisualProofLibraryTemplate`                                                                                                                                                          |
| **Auth**                            | Required                                                                                                                                                                                    |
| **Authorization**                   | Portal membership + Project entitlement + exact released ProofVersion visibility + Review/Approval participant policy                                                                       |
| **Implementation priority**         | **Critical Visual Review / Client Sign-off / Production Integrity**                                                                                                                         |
| **Reuse level**                     | **Extremely High with Designs 050, 052 and 068**                                                                                                                                            |

Design 069 should answer:

> **“Which designs/proofs have been released to me across my Projects, what exact version am I reviewing, is feedback still required, are there unresolved annotations, is formal approval pending, what happened to earlier released versions, and which proof should I open?”**

Canonical architecture:

```text
Design / Proof
      ↓
ProofVersion(s)
      ↓
Client Release / Visibility
      ↓
RenderDerivative(s)
      ↓
ReviewSession
   ├── VisualAnnotation
   ├── ReviewComment / Thread
   └── Feedback Submission
           ↓
     ApprovalRequest
           ↓
     ApprovalDecision
           ↓
ClientProofLibraryEntry[]
           ↓
       Design 069
```

---

# 2. Reuse

## Design 050 remains the canonical visual-review engine

Design 050 already established:

> **Design/Proof ≠ ProofVersion ≠ ReviewSession ≠ VisualAnnotation ≠ ReviewComment ≠ ApprovalRequest.**

Design 069 must reuse exactly that foundation.

Do **not** create:

```text
ClientProof
PortalDesign
DesignLibraryProof
ClientDesignVersion
```

as separate business entities.

Correct:

```text
Design 069
Cross-Project Proof discovery
        ↓
exact Client-released ProofVersion
        ↓
Design 050
Version-specific visual review
```

One backend.

Different screen purpose.

---

## Design 069 ≠ Design 050

### Design 050

Focused review of one exact visual ProofVersion.

### Design 069

Cross-Project discovery of released visual Proofs and their current review/approval state.

Therefore Design 069 should not duplicate:

* canvas/pager review engine,
* annotation placement,
* annotation threads,
* comment editing,
* ReviewSession completion,
* Approval decisions.

---

## Reuse the same review foundation as Drafts

Design 068 and 069 should share low-level review concepts:

```text
ReviewSession
ReviewParticipant
ReviewComment
Review state
Feedback submission
Approval linkage
```

But review anchors remain media-specific.

### Draft review

Text-oriented anchors:

```text
paragraph
block
text range
```

### Proof review

Visual anchors:

```text
page
normalized x/y
region/box
visual object where supported
```

Shared infrastructure must not erase those differences.

---

## Reuse Design 025 / specialized visual-production truth

Magazine/design production remains authoritative for:

* cover/page designs,
* production proofs,
* Client-proof release eligibility,
* exact approved visual artifacts.

Design 069 does not become a visual-production workflow engine.

---

## Reuse Design 043 / 066 Project context

The same Proof may appear in:

```text
Design 043 — Project Detail
Design 066 — Media Project Detail
Design 069 — Proofs Library
```

All must agree on:

* Project ID,
* Design/Proof ID,
* exact Client ProofVersion,
* ReviewSession,
* Approval state.

---

## Reuse Design 047 ClientAction

Potential actions include:

* Review Proof,
* Continue Review,
* Submit Feedback,
* Approve Proof.

The action is derived:

```text
ProofVersion
+
ReviewSession
+
ApprovalRequest
+
current participant
       ↓
ClientActionResolver
       ↓
ClientActionView
```

Never store a separate mutable:

```text
proof.requiresAction = true
```

for the Library.

---

## Reuse Design 052 for formal Approval

Formal sign-off remains:

```text
ProofVersion
     ↓
ApprovalRequest
     ↓
ApprovalParticipant
     ↓
ApprovalDecision
```

Design 069 only projects this state.

---

## Reuse Design 030 for render/image files

ProofVersion is the business review version.

Actual rendered pages/images/PDFs belong to Asset/FileVersion infrastructure.

Correct:

```text
ProofVersion PV-6
     ↓
RenderSet
     ├── Page 1 image derivative
     ├── Page 2 image derivative
     └── PDF derivative
```

The files are representations of ProofVersion.

They do not replace it.

---

# 3. Entities

## Design/Proof ≠ ProofVersion

`Design/Proof` is the stable logical visual work identity.

Example:

```text
Proof PR-101
├── ProofVersion v1
├── ProofVersion v2
├── ProofVersion v3
└── ProofVersion v4
```

Versions must remain explicit.

---

## ProofVersion becomes immutable once released for Client review

Once v4 is released:

> The visual content represented by v4 must not change in place.

Any material visual change produces v5.

Otherwise:

* annotations move,
* approval loses meaning,
* review evidence becomes untrustworthy.

---

## Latest internal Proof ≠ latest Client-released Proof

Critical example:

```text
Latest internal:
v9

Latest Client-released:
v6
```

Design 069 must show **v6**.

Never use:

```text
proof.latestVersion
```

for Client visibility.

Use an explicit resolver for:

```text
latestClientReleasedProofVersion
```

under the current membership/audience.

---

## ClientReleasedProofVersion needs explicit evidence

The platform must know:

* which ProofVersion was released,
* to which Client/account,
* to which ReviewSession/audience,
* when,
* whether it was later superseded.

This cannot be inferred from version number.

---

## Released ≠ reviewed

A Proof can be visible and still untouched by the Client.

---

## Viewed ≠ feedback submitted

Opening a proof does not mean:

> Client completed review.

---

## Feedback submitted ≠ approved

Permanent boundary:

```text
Visual feedback submitted
≠
ApprovalDecision APPROVED
```

---

## ProofVersion ≠ RenderDerivative

This is essential.

`ProofVersion` answers:

> Which business version is being reviewed?

`RenderDerivative` answers:

> Which technical image/PDF representation is used to display that business version?

Example:

```text
ProofVersion v6
├── web PNG tiles
├── retina page images
├── PDF
└── mobile thumbnails
```

All can represent the same ProofVersion.

---

## Regenerating a derivative ≠ new ProofVersion

If compression is improved without changing content:

```text
ProofVersion v6
```

remains v6.

A new RenderDerivative can be generated.

Do not create v7 merely because technical rendering changed.

---

## Content change ≠ derivative regeneration

Conversely, if design content changes materially:

a new ProofVersion is required.

Do not overwrite v6's files and call it the same reviewed version.

---

## RenderDerivative lineage

Conceptually:

```text
RenderDerivative
├── proofVersionId
├── page/index
├── kind
├── dimensions
├── checksum
├── processing state
└── Asset/FileVersion reference
```

Exact schema later.

---

## ReviewSession binds exact ProofVersion

Correct:

```text
ReviewSession RS-45
→ ProofVersion PV-6
```

Never:

```text
ReviewSession
→ Proof
→ latest version
```

---

## VisualAnnotation binds exact ProofVersion

Every annotation must preserve:

```text
proofVersionId
page/index
anchor geometry
```

At minimum.

---

## Annotation coordinates should be normalized

For responsive rendering, use normalized geometry rather than raw screen pixels where practical.

Conceptually:

```text
x = 0.42
y = 0.18
width = 0.10
height = 0.06
```

relative to the canonical page/render coordinate system.

This allows the same annotation to display correctly on:

* desktop,
* tablet,
* mobile,
* different render resolutions.

---

## Raw browser pixels ≠ canonical annotation coordinates

Do not store:

```text
left: 832px
top: 411px
```

as the only anchor.

That will break across responsive/device render sizes.

---

## Page identity should be stable inside ProofVersion

Page 5 should be identified reliably.

Do not rely only on:

> array position 4

if pages can be inserted/reordered within production before a version is frozen.

Exact implementation Phase 3D.

---

## Annotation ≠ ReviewComment

VisualAnnotation identifies the spatial subject.

ReviewComment contains conversational feedback.

Conceptually:

```text
VisualAnnotation A-12
→ page 4 / region

ReviewThread
├── Comment 1
├── Comment 2
└── Comment 3
```

---

## Annotation ≠ approval

A green check marker or resolved annotation never substitutes for formal Proof approval.

---

## Comment ≠ feedback submission

Users can comment without finishing the ReviewSession.

---

## Annotation resolved ≠ change implemented

Permanent.

Resolution can mean:

* discussion closed,
* reviewer satisfied,
* no further conversation.

It does not prove production changed the design.

---

## Annotation resolved ≠ Proof approved

Also permanent.

---

## Carry-forward annotation needs explicit lineage

If an issue still exists in v7:

```text
Annotation A-12
originally on v6
        ↓
CarriedForwardReference
        ↓
Annotation/context on v7
```

Do not mutate A-12's original `proofVersionId`.

---

## Annotation geometry cannot blindly carry across versions

A page layout may change dramatically between v6 and v7.

Coordinates from v6 may no longer point to the same content.

Carry-forward should be explicit and possibly require re-anchoring.

---

## ReviewSession ≠ Annotation collection only

A ReviewSession may remain valid even with zero annotations if the Client simply reviews and formally approves.

Do not require comments to establish review.

---

## Superseded Proof ≠ rejected Proof

Example:

```text
v6 released
v7 released after normal revisions
```

v6 can become:

> Superseded

without any rejection.

---

## Rejected ≠ superseded

`REJECTED` represents a formal business decision.

`SUPERSEDED` represents version lineage.

Keep separate.

---

## Approval binds exact ProofVersion

Approval of v6 does not approve:

* v7,
* another render with changed content,
* another page layout.

Permanent:

```text
Approval(ProofVersion v6)
≠
Approval(Proof)
```

---

## Approved ProofVersion ≠ newest internal version

Example:

```text
v6 APPROVED
v7 INTERNAL WORKING
```

Design 069 must not imply v7 is approved.

---

## Approved ProofVersion ≠ publication artifact automatically

Approval is an eligibility/gate.

Publishing must still consume an explicit approved exact artifact/version.

Design 031 remains canonical for release.

---

## ProofVersion ≠ PublicationVersion

A visual proof can become input to a publication artifact, but:

```text
ProofVersion
≠
PublicationVersion
```

They have separate lifecycle responsibilities.

---

## Proof ≠ Deliverable

A review Proof can be temporary.

A final Deliverable is deliberately released to the Client.

---

## LibraryEntry ≠ Proof

`ClientProofLibraryEntry` is a read projection.

Conceptually:

```text
ClientProofLibraryEntry
├── proofId
├── Client-visible ProofVersionId
├── title
├── Project/media context
├── version label
├── representative thumbnail
├── releasedAt
├── Review state
├── annotation summary
├── Approval state
├── current Client action
└── updatedAt
```

None of those become independently mutable source truth.

---

## One Proof should normally appear once in the primary library

The Library should generally summarize the current relevant released version.

Do not create:

```text
Cover v4
Cover v5
Cover v6
```

as unrelated Proofs merely because versions exist.

Historical version browsing belongs to the review/detail context unless frozen UI says otherwise.

---

## Current ProofVersion resolver must be canonical

Conceptually:

```text
resolveCurrentClientProofVersion(
  proof,
  membership,
  project
)
```

should consider:

* release visibility,
* active ReviewSession,
* supersession,
* Approval state,
* current entitlement.

Not highest version number.

---

## Thumbnail ≠ ProofVersion

The Library thumbnail is a Client-safe derivative from the exact selected ProofVersion.

It is presentation only.

---

## Thumbnail cache must respect version

When v7 becomes the current Client version:

do not keep showing cached v6 thumbnail while labeling it v7.

---

## Annotation count needs defined semantics

If the Library shows:

> 6 comments

define whether it means:

* all annotations,
* unresolved annotations,
* threads,
* Client annotations,
* comments on current version.

One governed definition is required.

---

## Review state ≠ Approval state

Valid example:

```text
Review:
FEEDBACK_SUBMITTED

Approval:
PENDING
```

or:

```text
Review:
CLOSED

Approval:
NOT_REQUIRED
```

Do not flatten them.

---

## ClientAction ≠ Review state

The Proof can be under Review while the current member has no action.

Example:

```text
ReviewSession OPEN
Current member = Viewer
ClientAction = NONE
```

---

## Notification ≠ Proof state

A Notification saying:

> New proof ready

is only attention delivery.

---

## Activity ≠ Proof state

Design 063 may record:

> Proof v6 released.

The release domain remains canonical.

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
Proof access
+
exact Client-release visibility
+
ReviewSession participation
+
annotation/comment capability
+
ApprovalParticipant state
```

---

## Same Client ≠ same Proof library

Different Client members may see different visual work.

For example:

```text
CEO
→ final executive cover proofs

Marketing lead
→ campaign visual proofs

Finance user
→ no design proofs
```

---

## Project access ≠ Proof access automatically

A user can know:

> design is in review

without access to the actual visual Proof.

---

## Proof read ≠ annotate

Conceptually:

```text
proof.read
≠
proof.annotate
```

---

## Annotate ≠ submit feedback

If the review model distinguishes them:

```text
review.annotate
≠
review.submit_feedback
```

---

## Submit feedback ≠ approve

Permanent.

---

## Approval capability ≠ exact ApprovalParticipant

A broadly authorized Client approver still needs participation/eligibility for the exact ApprovalRequest.

---

## Portal Admin ≠ Proof reviewer automatically

Design 062 access administration must not expose every visual proof.

---

## Internal ProofVersions are never Client-accessible by version guessing

A Client must not retrieve:

```text
PV-9 internal
```

because they know Proof ID.

Each ProofVersion is independently authorized.

---

## RenderDerivative access follows ProofVersion access

A technical derivative cannot bypass the business-version visibility rule.

Never expose derivative Asset URL before confirming access to its ProofVersion.

---

## Raw source files ≠ review derivatives

A Client reviewing:

* PNG,
* PDF,
* rendered page tiles,

does not thereby gain access to:

* PSD,
* AI,
* INDD,
* raw layout/source project files.

---

## Direct Asset URL security

Short-lived/authorized delivery from Design 030/051 remains required.

Do not make render URLs permanent public secrets.

---

## Annotation visibility

Client ReviewSession must exclude:

* internal designer annotations,
* internal QA notes,
* private editorial comments.

Server-side separation is required.

---

## Internal reviewer identity

Where internal participants are shown, return only approved Client-safe presentation.

No unnecessary staff metadata.

---

## Version history access

Only released Client-visible versions should appear.

Internal iterations remain absent.

---

## Search authorization

Search across Proofs operates only on authorized Client-visible Proofs/versions.

Do not leak restricted Project names or thumbnails.

---

## Thumbnail authorization

A thumbnail can itself expose confidential visual content.

Return only after authorization.

---

## Approval action must revalidate

When user clicks:

> Approve Proof

the source command revalidates:

* current membership,
* exact ProofVersion,
* ApprovalRequest,
* participant eligibility,
* non-superseded state,
* current policy.

A stale Library card is never sufficient authority.

---

# 5. States

Design 069 should separate Library/query, rendering, release/version, Review, Annotation, Approval, and action states.

### Library/query state

```text
Proof Library Loading
Proofs Available
No Proofs
No Results for Filters
Loading More
Load More Failed
```

### Client release/version state

```text
No Client Proof Yet
Client Proof Available
New Client Proof Version Available
Proof Superseded
Proof Restricted
```

### Render state

```text
Render Processing
Render Available
Partial Render Available
Render Failed
Render Outdated / Regenerating
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

### Annotation state

```text
No Annotations
Open Annotations
Resolved Annotations
Annotation Data Unavailable
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
Review Proof
Continue Review
Submit Feedback
Approve / Decide
Waiting on Another Participant
Action Restricted
Action State Unavailable
```

These must never become one `proof.status`.

---

## No Client Proof ≠ render failed

A proof not yet released is different from a released ProofVersion whose derivative failed to render.

---

## Internal Proof exists ≠ Client Proof exists

The Library must remain empty for that item until a Client release exists.

---

## Render processing ≠ Proof unavailable conceptually

The business ProofVersion can exist while its visual derivative is still processing.

---

## Partial render ≠ full review ready

If only 7 of 10 pages rendered:

the system should not claim complete review readiness unless policy allows partial review.

---

## Render failure ≠ ProofVersion rejected

Technical failure has no approval meaning.

---

## Review Open ≠ action required for this user

Participant eligibility remains separate.

---

## Annotation count zero ≠ Review complete

Client may review and approve without annotations.

---

## All annotations resolved ≠ approved

Permanent.

---

## Feedback Submitted ≠ Approval Pending automatically

Approval may be:

* not required,
* already pending,
* created later.

Use canonical source state.

---

## Approved ≠ latest version approved

Exact version semantics remain visible.

---

## New version available ≠ old version rejected

Permanent.

---

## Superseded ≠ rejected

Permanent.

---

## Rejected ≠ deleted

Historical visual evidence remains.

---

## Approval service unavailable ≠ approval not required

Critical.

---

## Annotation service unavailable ≠ zero annotations

Unknown is not zero.

---

## Render service unavailable ≠ no proof

Unknown/technical failure must remain distinct.

---

## Action resolver unavailable ≠ no action

Critical.

---

## Thumbnail unavailable ≠ Proof absent

Use safe fallback.

---

## Updated elsewhere

While Design 069 is open:

* another reviewer submits feedback,
* a newer ProofVersion is released,
* an ApprovalDecision occurs.

The Library must refresh/reconcile.

---

## State Coverage

Design 069 inherits Design 150 plus:

```text
Proof Library Loading
Proof Library Available

No Proofs
No Results for Filters

Client Proof Available
New Client Proof Version Available
Proof Superseded
Proof Restricted

Proof Render Processing
Proof Render Available
Proof Render Partially Available
Proof Render Failed

Review Not Started
Review In Progress
Feedback Submitted
Review Closed
Review State Unavailable

No Annotations
Open Annotations
Annotations Resolved
Annotation State Unavailable

Approval Not Required
Approval Pending
Proof Approved
Proof Rejected
Approval Superseded
Approval State Unavailable

Review Action Required
Continue Review
Submit Feedback
Approve Proof
Waiting on Another Reviewer
Action Restricted
Action State Unavailable

Thumbnail Unavailable
Partial Proof Service Failure
```

---

# 6. Responsive Behavior

## Desktop

Desktop should optimize visual-proof discovery.

Conceptually:

```text
Designs / Proofs
↓
Summary / Filters if frozen
↓
Proof Library
    ├── thumbnail / representative page
    ├── proof title
    ├── Project/media context
    ├── exact Client-visible version
    ├── review state
    ├── annotation summary
    ├── approval state
    ├── current-user action
    └── Open / Review
```

The frozen design remains authoritative.

---

## Desktop must not become an internal design-production board

Do not expose:

* raw source-design files,
* render jobs,
* internal QA notes,
* internal unapproved versions,
* designer-only annotations,
* production-tool metadata.

---

## Tablet

Following Design 152:

* visual cards scale cleanly,
* thumbnails preserve aspect ratio,
* exact version remains visible,
* Review and Approval remain separate labels,
* action controls remain obvious,
* filter controls can collapse.

---

## Mobile

Priority:

```text
Designs / Proofs
↓
Proof Card
   ├── visual thumbnail
   ├── title
   ├── Project
   ├── exact version
   ├── Review state
   ├── Approval state
   └── Review / View
↓
Next Proof
```

No dense desktop matrix.

---

## Mobile proof-review entry

The user should always know exactly what they are opening:

> Cover Design — Proof v6

not:

> Latest Design.

---

## Mobile annotation display

Design 050's normalized annotation model should allow review overlays to reposition correctly as the proof scales.

Never scale annotations using hardcoded desktop pixel coordinates.

---

## Mobile annotation interaction

Touch targets for:

* pins,
* regions,
* comment markers

must be large enough without changing canonical anchor geometry.

---

## Mobile state clarity

Use text such as:

* 3 unresolved annotations
* Feedback submitted
* Approval pending
* Approved v6
* Superseded by v7

not just colors/icons.

---

## Accessibility

A Library entry should communicate something equivalent to:

> Executive Magazine Cover, Proof version 6, Project Executive Magazine, three unresolved annotations, approval pending. Review proof.

where canonical data supports it.

---

## Visual review accessibility

Annotations should have a non-spatial list representation so users do not need to visually locate markers on the canvas to understand feedback.

This remains consistent with Design 050.

---

# 7. Backend Requirements

## Library query architecture

```text
Design 069
    ↓
ClientPortalSessionContext
    ↓
Proof Library Authorization
    ↓
ClientProofLibraryQueryService
    │
    ├── authorized Proofs
    ├── Client-released ProofVersions
    ├── Project/media context
    ├── representative RenderDerivative
    ├── current ReviewSession
    ├── annotation summary
    ├── formal Approval summary
    └── current ClientAction
    ↓
ClientProofLibraryEntry[]
    ↓
ClientProofsLibraryView
```

---

## Proof is the logical collection anchor

Query authorized logical Proofs, then resolve the relevant Client-released ProofVersion.

Do not query every ProofVersion and deduplicate in application/UI code.

---

## Current Client ProofVersion resolver

Conceptually:

```text
resolveCurrentClientProofVersion(
    proofId,
    membershipId,
    projectId
)
```

must consider:

* release visibility,
* ReviewSession,
* supersession,
* Approval state,
* current access.

Never use `MAX(versionNumber)`.

---

## Release/audience resolver

The backend must retain:

```text
ProofVersion
→ Client release/audience
→ ReviewSession
```

with enough lineage to prove why the Client can see the version.

---

## RenderDerivative resolver

For the selected ProofVersion:

```text
resolveClientRenderDerivative(
  proofVersionId,
  device/use case
)
```

can choose an appropriate representation.

But every derivative must still reference the same canonical ProofVersion.

---

## Render processing architecture

Conceptually:

```text
ProofVersion created/frozen
      ↓
Render Job
      ↓
RenderDerivative(s)
      ↓
Asset/FileVersion
```

Rendering should be async/idempotent.

---

## Rendering idempotency

Retry of one render job must not create uncontrolled duplicate derivatives.

Use:

* ProofVersion,
* derivative kind,
* render specification/version

as deterministic identity dimensions where useful.

---

## Content checksum/version integrity

The platform should be able to verify that a derivative truly represents the intended ProofVersion.

Do not accidentally display a stale image from another version due to cache/path reuse.

---

## Review resolver

For selected ProofVersion:

```text
resolveClientReviewSession(
  exact ProofVersion,
  current membership
)
```

returns only the correct Client ReviewSession.

---

## Annotation query

Annotations must be constrained by:

```text
reviewSessionId
proofVersionId
pageId/index
audience
```

and current user permissions.

---

## Annotation coordinate contract

A canonical geometry representation should support:

```text
point
rectangle/region
possibly polygon/object reference where later needed
```

using normalized proof-space coordinates.

Exact implementation Phase 3D.

---

## Render dimensions must not redefine annotation coordinates

UI converts normalized proof-space anchors to current viewport coordinates.

Stored annotations remain independent of current CSS dimensions.

---

## Annotation creation command

Conceptually:

```text
createVisualAnnotation(
  reviewSessionId,
  proofVersionId,
  pageId,
  normalizedAnchor,
  comment
)
```

Backend verifies:

* exact version,
* active ReviewSession,
* participant,
* coordinate bounds,
* current permission.

---

## Annotation mutation must preserve provenance

Moving/changing an annotation should create/update appropriate review state without silently changing which ProofVersion it originally belongs to.

---

## Review feedback submission

Use the canonical Design 050 command, e.g.:

```text
submitProofReviewFeedback()
```

not a generic Proof PATCH.

---

## Approval resolver

Use Designs 029/052:

```text
ProofVersion
→ ApprovalRequest
→ ApprovalParticipant
→ ApprovalDecision
```

No review-derived approval inference.

---

## Approval command

Formal approval command revalidates:

* exact ProofVersion,
* current non-superseded eligibility,
* participant,
* current request state,
* current authorization.

---

## Supersession event handling

When v7 is released:

```text
ProofVersionReleasedToClient
```

should trigger reevaluation of:

* Design 069 Library entry,
* Design 050 ReviewSession state,
* pending ClientAction,
* Notifications,
* Activity,
* related Project/media summary.

---

## Stale ReviewSession protection

If v6 has been superseded:

the system must define whether:

* review closes automatically,
* review remains historical/read-only,
* limited remaining actions are permitted.

What it must not do is silently redirect v6 ReviewSession to v7.

---

## Stale approval protection

A CTA for v6 must fail/reconcile if v6 was superseded before the decision.

---

## Project workflow integration

Proof feedback/Approval can trigger canonical Project/workflow evaluation:

```text
Proof Review / Approval event
          ↓
Project workflow evaluator
```

Design 069 frontend never patches Project stage.

---

## Publication integration

Once an exact ProofVersion is approved, downstream production can use that evidence.

But Publication must explicitly consume an approved artifact/version.

Do not auto-publish from Design 069.

---

## Search

Index only Client-safe:

* Proof title,
* Project,
* media/design type,
* released version metadata.

Do not index internal proof titles/assets.

---

## Thumbnail generation

Library thumbnails should use dedicated safe derivatives.

Do not fetch full-resolution proof pages merely to render small cards.

---

## Pagination

Server-side cursor pagination for larger visual libraries.

---

## Counts

If frozen UI shows counts such as:

```text
Needs Review
Awaiting Approval
Approved
```

derive them from the same authorized Review/Approval definitions.

---

## Permission-safe caching

Cache dimensions should include:

```text
membershipId
Project entitlement revision
Proof release revision
ProofVersion
Review revision
Approval revision
Render revision
```

Do not reuse Client-admin proof results for a restricted viewer.

---

## CDN/cache safety

Rendered proof imagery may use CDN caching, but access strategy must prevent unauthorized retrieval.

Possible implementation patterns are Phase 3D concerns.

The invariant is:

> cached technical delivery must not bypass ProofVersion authorization.

---

## Partial failure

Example:

```text
Proof/release data  ✓
Render service      ✕
Review state        ✓
Approval state      ✓
```

Return:

> Render temporarily unavailable

rather than:

> No Proof.

---

## Backend Requirement Matrix

| Requirement                                | Status                    |
| ------------------------------------------ | ------------------------- |
| Client Portal authentication               | **Critical**              |
| Active Portal membership                   | **Critical**              |
| Canonical Design/Proof reuse               | **Critical**              |
| Immutable ProofVersion                     | **Critical**              |
| Proof/ProofVersion separation              | **Critical**              |
| Explicit Client-release semantics          | **Critical**              |
| Latest internal/Client-released separation | **Critical**              |
| Current Client ProofVersion resolver       | **Critical**              |
| Client audience/version authorization      | **Critical**              |
| ProofVersion/RenderDerivative separation   | **Critical**              |
| RenderDerivative lineage                   | **Critical**              |
| Async/idempotent rendering                 | **Critical**              |
| Render/version integrity                   | **Critical**              |
| Client-safe thumbnail derivatives          | **Critical**              |
| ReviewSession exact-version binding        | **Critical**              |
| VisualAnnotation entity                    | **Critical**              |
| Normalized annotation geometry             | **Critical**              |
| Version/page-specific annotation anchoring | **Critical**              |
| Annotation/ReviewComment separation        | **Critical**              |
| Annotation/feedback-submission separation  | **Critical**              |
| Review/formal Approval separation          | **Critical**              |
| Design 029/052 Approval reuse              | **Critical**              |
| Exact-version Approval binding             | **Critical**              |
| Reviewer/Approver separation               | **Critical**              |
| Superseded/rejected separation             | **Critical**              |
| Carry-forward annotation lineage           | **Required**              |
| Project/Proof separation                   | **Critical**              |
| Multi-Proof-per-Project support            | **Required**              |
| ClientProofLibraryEntry projection         | **Critical**              |
| Design 047 ClientAction reuse              | **Critical**              |
| Direct ProofVersion reauthorization        | **Critical**              |
| RenderDerivative authorization             | **Critical**              |
| Source-file restriction                    | **Critical**              |
| Internal-review exclusion                  | **Critical**              |
| Design 030 Asset/FileVersion reuse         | **Critical**              |
| Secure delivery/CDN strategy               | **Critical**              |
| Stale ReviewSession protection             | **Critical**              |
| Stale Approval protection                  | **Critical**              |
| Idempotent feedback submission             | **Critical**              |
| Approval concurrency/idempotency           | **Critical**              |
| Project workflow event integration         | **Critical**              |
| Publication handoff separation             | **Critical**              |
| Permission-safe search                     | **Critical**              |
| Server pagination                          | **Required**              |
| Permission-safe counts                     | **Critical**              |
| Permission-safe caching                    | **Critical**              |
| Partial-service degradation                | **Critical**              |
| Design 050 backend reuse                   | **Critical**              |
| Designs 043/066 consistency                | **Critical**              |
| Design 068 shared review-foundation reuse  | **Critical architecture** |

---

# 8. Consolidation

Design 069 exposes several major implementation risks.

**Design/Proof / ProofVersion conflation**
Visual revisions overwrite review evidence.

**Latest internal / latest Client version conflation**
Unreleased visual work leaks to the Portal.

**Highest version / Client visibility conflation**
Newest version is assumed released.

**Client release / review conflation**
Making a version visible marks it reviewed.

**Viewed / feedback-submitted conflation**
Opening the Proof closes review.

**ProofVersion / RenderDerivative conflation**
Technical image/PDF file becomes the business review identity.

**Derivative regeneration / new business version conflation**
Compression/render changes create unnecessary ProofVersions.

**Content change / same derivative lineage conflation**
Material design changes overwrite an already-reviewed ProofVersion.

**ReviewSession / Proof conflation**
Review attaches to logical Proof instead of exact version.

**VisualAnnotation / ReviewComment conflation**
Spatial anchor and conversational feedback become one unstructured blob.

**Raw pixels / normalized coordinates conflation**
Annotations break across screen sizes and render resolutions.

**Page index / stable page identity conflation**
Annotations shift when page ordering changes.

**Annotation resolved / change implemented conflation**
Review state falsely claims production work is done.

**Annotation resolved / approval conflation**
All pins cleared means approved.

**Comment / feedback submission conflation**
Any annotation finishes the ReviewSession.

**Review feedback / ApprovalDecision conflation**
Comments become formal sign-off.

**Reviewer / Approver conflation**
Annotation permission grants approval power.

**ApprovalRequest / Decision conflation**
Pending approval and immutable decision merge.

**Proof-level approval / version-level approval conflation**
Approval spreads to later versions.

**Approved v6 / internal v7 conflation**
Unapproved new iteration inherits approval.

**Superseded / rejected conflation**
Normal newer-version release looks like formal rejection.

**Rejected / deleted conflation**
Historical sign-off evidence disappears.

**Carry-forward annotation mutation**
v6 annotations are moved to v7 without preserving provenance.

**Coordinate carry-forward assumption**
Old anchors incorrectly point to changed page locations.

**Proof / Publication conflation**
Approval automatically means live/publication complete.

**ProofVersion / PublicationVersion conflation**
Review artifact and release artifact lose independent lifecycle.

**Proof / Deliverable conflation**
Temporary review render becomes final deliverable.

**LibraryEntry / Proof conflation**
Read-model data becomes independently editable.

**One Library item per version**
One logical Proof appears as many unrelated Proofs.

**Project access / Proof access conflation**
Any Project viewer sees confidential designs.

**Proof read / annotation conflation**
Viewer can comment.

**Annotation / submit-feedback conflation**
Any commenter can close ReviewSession.

**Portal Admin / reviewer conflation**
Access administrator sees every design.

**General approval capability / exact participant conflation**
Any broad approver can approve every Proof.

**Direct ProofVersion bypass**
Client guesses internal version ID.

**RenderDerivative bypass**
Direct image/PDF URL avoids Proof authorization.

**Review derivative / source file conflation**
Viewing a PNG grants PSD/AI/INDD source access.

**Internal annotation / Client annotation conflation**
Private design QA leaks.

**Internal employee metadata leakage**
Review UI exposes unnecessary staff data.

**Thumbnail / ProofVersion conflation**
Cached thumbnail does not correspond to displayed version.

**Thumbnail visibility / source visibility conflation**
Confidential design leaks through library imagery.

**Annotation count ambiguity**
Different screens count pins, comments, unresolved threads differently.

**Review state / Approval state conflation**
One `status` hides whether feedback and sign-off differ.

**ClientAction / Review state conflation**
Viewer sees action solely because ReviewSession is open.

**Notification / Proof truth conflation**
Reading notification changes Review state.

**Activity / Proof truth conflation**
Activity event becomes release evidence.

**Render failure / Proof absent conflation**
Technical pipeline issue hides valid ProofVersion.

**Partial render / review-ready conflation**
Client is asked to approve before all required pages exist.

**Approval service unavailable / not required conflation**
Formal sign-off disappears during failure.

**Annotation service unavailable / zero annotations conflation**
Unknown is presented as clean review.

**Action resolver unavailable / no action conflation**
Required approval is missed.

**Stale ReviewSession after supersession**
v6 review silently moves to v7.

**Stale Approval CTA after supersession**
Client approves obsolete version.

**Frontend Project-stage mutation**
Proof review directly patches Project workflow.

**Automatic publication after approval**
Design 069 bypasses Publishing controls.

**069/050 duplicate Proof-review backend**
Library creates another annotation/review engine.

**069/068 duplicate review infrastructure**
Draft and visual reviews implement incompatible participant/comment/approval semantics.

**069/043/066 duplicate current-proof resolver**
Each surface chooses a different current Client ProofVersion.

No new screen is required.

These are **visual-version identity, rendering, annotation geometry, exact-version review, Approval, release visibility, authorization, and cross-Project library requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT CROSS-PROJECT VISUAL PROOF, VERSION, ANNOTATION & APPROVAL LIBRARY ANCHOR**

**Domain directive:**
**Design/Proof ≠ ProofVersion ≠ ClientReleasedProofVersion ≠ RenderDerivative ≠ ReviewSession ≠ VisualAnnotation ≠ ReviewComment ≠ ApprovalRequest ≠ ClientProofLibraryEntry ≠ ClientAction.**

**Reuse directive:**
Design 050 remains the canonical visual Proof review engine. Design 069 is only a broader authorized cross-Project library over it.

**Version directive:**
every Client visual-review experience references an exact immutable ProofVersion. The newest internal ProofVersion is never automatically Client-visible.

**Release directive:**
explicit Client-release/audience lineage determines which ProofVersion is visible. Version number alone never controls Client access.

**Rendering directive:**
ProofVersion remains the business review identity while technical images, page tiles, thumbnails and PDFs remain replaceable/versioned RenderDerivatives under Design 030 Asset/FileVersion infrastructure.

**Integrity directive:**
render regeneration without content changes does not create a new ProofVersion; material content changes require a new business ProofVersion so historical Review and Approval remain trustworthy.

**Review directive:**
every ReviewSession binds to one exact ProofVersion and never resolves through `latest`.

**Annotation directive:**
every VisualAnnotation binds to the exact ProofVersion and page using normalized proof-space geometry so desktop/tablet/mobile rendering does not change its semantic position.

**Carry-forward directive:**
annotations carried into a new ProofVersion preserve provenance and require explicit re-anchoring where layout changed; original version bindings are immutable.

**Comment directive:**
VisualAnnotation, ReviewComment/thread, feedback submission and ReviewSession state remain distinct concepts.

**Approval directive:**
formal approval remains Designs 029/052 `ApprovalRequest + ApprovalParticipant + ApprovalDecision`, bound to the exact ProofVersion. Feedback/resolved annotations never constitute approval.

**Reviewer directive:**
viewer, annotator, feedback submitter and formal approver remain separately enforceable. Portal administration never automatically grants review/sign-off rights.

**Supersession directive:**
a newly released ProofVersion may supersede an older version without implying rejection. `SUPERSEDED` and `REJECTED` remain distinct outcomes.

**Approval-version directive:**
approval of v6 never automatically applies to v7 or any materially changed successor.

**Library directive:**
`ClientProofLibraryEntry` is a source-derived read projection over the current relevant Client-visible ProofVersion, ReviewSession, annotation summary and Approval state. It never becomes independently mutable visual-production truth.

**Project directive:**
Proofs retain canonical Project/media lineage while remaining separate entities. One Project can own multiple visual Proofs.

**Asset directive:**
thumbnails and review renders are explicitly Client-safe derivatives. Internal source files, raw production assets and unprocessed renders remain protected.

**Authorization directive:**
Project visibility, exact ProofVersion visibility, render access, annotation capability, feedback submission, formal Approval and source-file access are independently server-enforced.

**Direct-access directive:**
knowing a ProofVersion ID, derivative ID or Asset URL never bypasses membership/release/Review authorization.

**Current-version directive:**
Designs 043, 050, 066 and 069 must share one canonical Client-visible ProofVersion resolver so every Client surface identifies the same active/released proof.

**Action directive:**
Design 047 determines whether the current member needs to Review, Continue Feedback, Submit Feedback or Approve. Design 069 never stores its own business action state.

**Mutation directive:**
Design 069 remains primarily discovery/navigation. Annotation, feedback and Approval mutations use the canonical Design 050/052 commands; generic `PATCH proof.status` behavior is prohibited.

**Workflow directive:**
Proof review/Approval events can feed the Project workflow evaluator, but Client visual-review screens never directly edit Project stages.

**Publication directive:**
approved ProofVersion may become an input to Publishing, but Design 031 remains canonical for release/schedule/publish/verification. Approval never auto-publishes content.

**Failure directive:**
render unavailable, annotation unavailable, Review unavailable, Approval unavailable and action unavailable are explicit unknown/error states rather than false `No Proof`, `0 annotations`, `Approval not required`, or `No action`.

**Responsive directive:**
desktop emphasizes visual portfolio scanning; mobile retains exact version identity and responsive annotation positioning while providing a non-spatial accessible review/comment representation.

**Shared-review directive:**
Designs 068 and 069 should standardize ReviewSession, participant, comment/thread, feedback-submission and Approval foundations while retaining Draft-specific text anchors versus Proof-specific visual geometry.

**Overlap directive:**
Designs **025, 029–030, 043, 047, 050, 052, 063–069 and downstream Publishing surfaces** must ultimately consume one exact-version visual Proof + release + render + review + annotation + approval + ClientAction foundation.

**Consolidation directive:**
**STANDARDIZE ONE VERSION-SPECIFIC VISUAL REVIEW FOUNDATION — CANONICAL DESIGN/PROOF + IMMUTABLE PROOFVERSION + EXPLICIT CLIENT RELEASE/VISIBILITY + PROOFVERSION-BACKED RENDER DERIVATIVES + NORMALIZED VERSION/PAGE-SPECIFIC VISUAL ANNOTATIONS + REVIEWSESSION + REVIEW THREADS + FEEDBACK SUBMISSION + SEPARATE FORMAL APPROVAL + SUPERSESSION + CLIENT ACTION RESOLUTION — AND BUILD DESIGN 069 ONLY AS AN AUTHORIZED CROSS-PROJECT LIBRARY OVER THAT FOUNDATION, NEVER AS A SECOND DESIGN, PROOF, RENDER, ANNOTATION OR APPROVAL BACKEND.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **69 / 153** |
| **PASS**                                   |                         **69** |
| **STANDARDIZE decisions**                  |                         **67** |
| **Potential implementation-overlap flags** |                         **60** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**69 / 153 = 45.1% audited.**

### Canonical visual-proof architecture after Design 069

```text
                    DESIGN / PROOF
                          │
                          ↓
                     ProofVersion
                          │
               ┌──────────┴──────────┐
               ↓                     ↓
         Internal Version     Client Released Version
                                     │
                                     ↓
                              Render Derivatives
                              ├── thumbnails
                              ├── page renders
                              └── PDF
                                     │
                                     ↓
                                ReviewSession
                        ┌────────────┼────────────┐
                        ↓            ↓            ↓
                  VisualAnnotation Comments   Feedback Submit
                        │
                        ↓
                normalized version/page
                       anchors
                                     │
                                     ↓
                               ApprovalRequest
                                     │
                                     ↓
                               ApprovalDecision
```

And the Client surfaces remain separated:

```text
Design 069
Proofs Library
      ↓
“Which released visual proofs exist across my Projects?”

Design 050
Visual Proof Review
      ↓
“Review this exact ProofVersion and its annotations.”

Design 066
Media Project Detail
      ↓
“How does this Proof relate to this media Project?”

Design 047
Client Actions
      ↓
“What review/approval action currently requires me?”
```

All four consume the **same ProofVersion, release visibility, ReviewSession, annotation and Approval state**.

# Next Sequential Audit Target

## **Design 070 — Client Contract Detail & Digital Signing**

Its frozen identity and supplied route annotation **`/client/contracts/[contractId]`** are already locked.

The next audit must preserve the contract-execution boundary:

> **Contract ≠ ContractVersion ≠ ContractParty ≠ Signer ≠ SignatureRequest ≠ SignatureEvent/Evidence ≠ Approval ≠ ExecutedArtifact ≠ ClientAction.**

It must reconcile the Contract foundation from **Design 019**, the Client Contract library from **Design 053**, and formal signing/execution semantics while preserving:

* exact issued ContractVersion,
* party ≠ signer,
* approval ≠ signature,
* viewed ≠ signed,
* signature request ≠ signature evidence,
* partial signing ≠ fully executed,
* executed Contract artifact remains immutable,
* profile/company changes never rewrite historical Contract-party/signer snapshots.

After Design 070 we continue strictly:

**071 Client Invoice / Payment Detail → 072 Client Publishing / Live Links Detail → 073 Client Distribution Detail → 074 Client Message Thread Detail → 075 Client Sign In → 076 Client Portal Activation / Accept Invite → 077 Client Access Recovery**

with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
