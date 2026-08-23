# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 050 — Client Design Review

Design 050 should become the **canonical Client Portal visual-proof review workspace for an exact Design/Proof version**.

Its architecture should reuse the review foundation established by Design 049, while adding the special requirements of visual artifacts: **page-aware rendering, zoom/pan, coordinate/region annotations, exact visual-version binding, proof comparison, and high-resolution Asset/FileVersion lineage**.

The core boundary is:

> **Design/Proof ≠ DesignVersion/ProofVersion ≠ ReviewSession ≠ VisualAnnotation ≠ ReviewComment ≠ ApprovalRequest ≠ ApprovalDecision.**

| Audit field                        | Classification                                                                                                                                                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                      | **050**                                                                                                                                                                                                                |
| **Canonical name**                 | **Client Design Review**                                                                                                                                                                                               |
| **Product area**                   | Client Portal / Magazine Production / Visual Review                                                                                                                                                                    |
| **User surface**                   | **Client Portal**                                                                                                                                                                                                      |
| **Screen class**                   | Version-Specific Visual Proof Review / Annotation Workspace                                                                                                                                                            |
| **Classification**                 | **Portal Workflow Anchor — Visual Artifact Review Family**                                                                                                                                                             |
| **Primary purpose**                | Allow authorized Client reviewers to inspect an exact visual proof, annotate specific pages/regions, discuss requested changes, submit feedback, and perform formal approval only through the separate Approval domain |
| **Primary business artifact**      | **Design / Proof**                                                                                                                                                                                                     |
| **Version entity**                 | **DesignVersion / ProofVersion**                                                                                                                                                                                       |
| **Review entity**                  | **ReviewSession**                                                                                                                                                                                                      |
| **Visual feedback entity**         | **VisualAnnotation + ReviewComment/Thread**                                                                                                                                                                            |
| **Formal decision dependency**     | ApprovalRequest / ApprovalDecision — Designs 029 and 052                                                                                                                                                               |
| **Magazine-production dependency** | Design 025 — Personal Magazine Production                                                                                                                                                                              |
| **Asset dependency**               | Design 030 — Asset & File Library                                                                                                                                                                                      |
| **Draft-review sibling**           | Design 049                                                                                                                                                                                                             |
| **Project dependency**             | Design 043                                                                                                                                                                                                             |
| **Client Action dependency**       | Design 047                                                                                                                                                                                                             |
| **Future library overlap**         | Design 069 — Client Designs / Proofs Library                                                                                                                                                                           |
| **Parent shell**                   | `ClientPortalShell` — Design 002                                                                                                                                                                                       |
| **Template family**                | `VersionedArtifactReviewTemplate`                                                                                                                                                                                      |
| **Composition**                    | `ClientDesignReviewComposition`                                                                                                                                                                                        |
| **Auth**                           | Required                                                                                                                                                                                                               |
| **Authorization**                  | Portal membership + Project scope + exact ProofVersion review entitlement                                                                                                                                              |
| **Implementation priority**        | **Critical Magazine Production / Client Approval Workflow**                                                                                                                                                            |
| **Reuse level**                    | **Extremely High with Design 049**                                                                                                                                                                                     |

The governing invariant is:

> **The Client reviews exactly the visual artifact version that was issued to them—not the mutable design source and not whatever version happens to be newest.**

---

# 1. Classification — Functional Responsibility

Design 050 should answer:

> **“Which design/proof am I reviewing, which exact version is it, which page am I looking at, where have comments been placed, what changes are still under discussion, what has changed between versions, and am I giving feedback or making a formal approval decision?”**

Canonical flow:

```text
Magazine / Visual Production
        ↓
Design / Proof
        ↓
Exact ProofVersion
        ↓
Client ReviewSession
        ↓
Visual Annotations + Comments
        ↓
Feedback Submitted
        ↓
Internal design revision
        ↓
New ProofVersion
```

Formal approval remains parallel:

```text
Exact ProofVersion
        ↓
ApprovalRequest
        ↓
ApprovalDecision
```

The two workflows may interact, but must never collapse into one status machine.

---

# 2. Reuse — Design 049 and Design 050 share one Review foundation

The strongest reuse decision so far in the Client Portal review family is:

```text
Common Review Infrastructure
        │
        ├── Design 049 — Draft Review
        │      text/block anchors
        │
        └── Design 050 — Design Review
               page/coordinate/region anchors
```

They should reuse:

* ReviewSession,
* review participants,
* Client/Internal audience rules,
* comment/thread infrastructure,
* review due dates,
* feedback submission,
* supersession,
* Notifications,
* Activity,
* Audit,
* exact-version subject binding.

They should **not** build separate Comment or Review databases.

---

# 3. Text review and visual review are not identical

Design 049 can anchor feedback to:

* paragraph,
* section,
* text range.

Design 050 requires visual anchor semantics such as:

* page,
* normalized x/y point,
* bounding rectangle,
* region,
* potentially element/object reference where reliable.

Therefore:

> **Reuse the Review domain; specialize the artifact adapter.**

---

# 4. Entities — Design/Proof ≠ ProofVersion

A stable visual artifact can conceptually have:

```text
Magazine Design
    ├── ProofVersion v1
    ├── ProofVersion v2
    ├── ProofVersion v3
    └── ProofVersion v4
```

The Client reviews:

> **ProofVersion v4**

not merely:

> “Magazine Design.”

---

# 5. ProofVersion should be immutable once issued

Once:

```text
ProofVersion v4
→ Client ReviewSession R22
```

has been issued, internal designers should not overwrite its visual content.

Any change produces:

```text
ProofVersion v5
```

This is mandatory for reliable annotations and approval evidence.

---

# 6. Editable design source ≠ Client proof

Internal production may use:

* InDesign source,
* Figma/Canva source,
* working PSD/AI files,
* temporary exports,
* alternate covers,
* preflight versions.

The Client-facing review artifact should be a deliberate released ProofVersion.

Never expose the live design working file automatically.

---

# 7. Source design file ≠ proof rendering

Conceptually:

```text
Design Source
     ↓
Render / Export
     ↓
ProofVersion
```

A ProofVersion may contain:

* page images,
* PDF,
* web-renderable representation,
* thumbnails,
* metadata.

The proof is the stable review target.

---

# 8. ProofVersion ≠ Asset/FileVersion, but they can relate

Design 030 remains canonical for file storage/versioning.

A useful relationship may be:

```text
ProofVersion
     ↓
Rendered Artifact
     ↓
Asset / FileVersion
```

The domain-level `ProofVersion` captures visual-review semantics.

`FileVersion` captures stored-file semantics.

Do not reduce the entire review workflow to a raw PDF file ID.

---

# 9. Exact Asset/FileVersion must be pinned

If ProofVersion v4 corresponds to:

```text
proof-v4.pdf
FileVersion FV-204
```

a later `proof-v5.pdf` must never replace the historical v4 attachment/rendering.

---

# 10. Proof rendering should be reproducible

A historical Client Review should be able to render the same artifact the Client actually reviewed.

That requires stable:

* ProofVersion identity,
* file/render references,
* page count/order,
* rendering metadata.

---

# 11. ReviewSession remains version-specific

Conceptually:

```text
ReviewSession
├── subjectType = PROOF_VERSION
├── subjectId = proofVersion_v4
├── Project
├── participants
├── requestedAt
├── dueAt
└── review lifecycle
```

Never bind only to `designId`.

---

# 12. Internal Design Review ≠ Client Design Review

Internal designers may annotate:

* trim issues,
* typography,
* production marks,
* preflight errors,
* internal alternatives,
* sensitive notes.

Those annotations must not automatically enter the Client Portal.

Correct:

```text
ProofVersion
    ├── Internal Review
    └── Client Review
```

Audience isolation must be server-side.

---

# 13. Internal annotations should never reach Client payloads

Dangerous:

```text
GET allProofAnnotations
→ hide INTERNAL annotations in browser
```

Correct:

```text
ClientDesignReviewQuery
→ only Client-visible Review/Annotation data
```

This is both privacy and security architecture.

---

# 14. Review ≠ formal Approval

The Client may request:

> Make the title larger.

That is Review feedback.

It is not:

```text
ApprovalDecision = REJECTED
```

unless a separate formal ApprovalRequest requires a decision.

---

# 15. “Looks good” ≠ formal Approval

A comment:

> This looks perfect.

cannot automatically become:

```text
ApprovalDecision.APPROVED
```

Formal approval must require the canonical Design 029/052 decision command.

---

# 16. If an Approve CTA exists

If the frozen Design 050 contains:

> Approve Design

then the CTA should invoke:

```text
decideApproval()
```

against:

```text
ApprovalRequest
→ exact ProofVersion
```

It must not mutate:

```text
proof.reviewStatus = APPROVED
```

as an independent approval mechanism.

---

# 17. Review feedback ≠ design mutation

A Client should not directly alter the canonical production design through comments/annotations unless explicit collaborative editing was designed.

This audit adds no live design editor.

Correct:

```text
Client feedback
      ↓
Internal design revision
      ↓
new ProofVersion
```

---

# 18. VisualAnnotation

Conceptually:

```text
VisualAnnotation
├── reviewSessionId
├── proofVersionId
├── pageId/pageNumber
├── anchor geometry
├── author
├── comment/thread
├── state
├── createdAt
└── visibility
```

Exact schema belongs to Phase 3D.

---

# 19. Annotation coordinates must be resolution-independent

Do not store only raw browser pixels:

```text
x = 837
y = 512
```

because:

* monitor size changes,
* zoom changes,
* mobile uses different dimensions.

Prefer normalized coordinates such as conceptually:

```text
x = 0.42
y = 0.31
```

relative to the immutable proof page.

---

# 20. Page coordinate system must be canonical

Each annotation should resolve against a known:

```text
ProofVersion
+ Page
+ coordinate space
```

This prevents markers shifting when different render resolutions are generated.

---

# 21. Page identity matters

Avoid relying only on page array position if pages can be reordered during production.

Within an immutable ProofVersion, each rendered page should have stable identity/position metadata.

---

# 22. Annotation belongs to exact ProofVersion

Permanent rule:

```text
VisualAnnotation
→ ProofVersion v4
→ Page 12
→ Region
```

Never:

```text
VisualAnnotation
→ current design
```

---

# 23. Annotation on v4 must not migrate automatically to v5

Design changes can alter:

* page ordering,
* layout,
* text,
* images,
* geometry.

Therefore:

> **v4 coordinates are not automatically valid on v5.**

---

# 24. Carrying unresolved annotations forward requires explicit lineage

If later implementation supports it:

```text
Annotation v4
      ↓ carried forward
Annotation/reference v5
```

must retain original provenance.

Do not silently move the original coordinate.

No new carry-forward UI is introduced here.

---

# 25. Point annotation ≠ region annotation

Visual review may need:

```text
Point
Rectangle/Region
Page-level comment
```

The Review engine should support the actual frozen interaction type cleanly.

Avoid one ambiguous coordinate blob with no type semantics.

---

# 26. General feedback remains necessary

Not every review comment belongs to one coordinate.

Example:

> Overall, the cover feels too dark.

This should belong to the exact ReviewSession/ProofVersion even without a spatial anchor.

---

# 27. ReviewComment ≠ VisualAnnotation necessarily

A clean model can distinguish:

```text
ReviewComment
     ↓ optional
VisualAnnotation anchor
```

so general comments and spatial comments can share discussion infrastructure.

---

# 28. Comment replies

Replies should remain attached to the original ReviewComment/annotation.

Do not convert every reply into Design 045 general Messages.

---

# 29. Design Review comment ≠ Client Message

Example:

```text
Design Review:
“Please move this portrait slightly left.”
```

versus:

```text
Client Message:
“Can we schedule a call tomorrow?”
```

The first must retain exact visual context.

---

# 30. Visual marker numbering

If the UI displays annotation marker numbers:

those numbers are presentation.

They must not become permanent database identity.

Use stable comment/annotation IDs underneath.

---

# 31. Zoom ≠ artifact mutation

Zooming:

```text
50%
100%
200%
```

changes presentation only.

It must not alter stored annotation coordinates or artifact state.

---

# 32. Pan ≠ artifact mutation

Same principle.

Pan position is transient UI state.

Do not persist it as Proof data.

---

# 33. Fit-to-width / fit-page

These are rendering controls.

They belong to the review viewer component, not the visual artifact domain.

---

# 34. High-resolution proof delivery

The viewer can use multiple render qualities:

```text
Thumbnail
Preview
High-resolution review render
```

as derivatives of the same exact ProofVersion.

---

# 35. Derivative ≠ new ProofVersion

Generating:

```text
page-12-2x.webp
```

for retina viewing does not create a new design version.

Correct:

```text
ProofVersion v4
├── source PDF
├── page preview derivative
├── thumbnail derivative
└── hi-res derivative
```

Reuse Design 030 derivative lineage.

---

# 36. New design content creates a new ProofVersion

Changing:

* typography,
* image placement,
* colors,
* text,
* pagination,

is a content/version change.

That produces a new ProofVersion.

---

# 37. Technical re-render ≠ design revision

If the underlying design content is unchanged and the platform merely regenerates a broken thumbnail:

that should not increment the business ProofVersion.

Separate technical processing state from design versioning.

---

# 38. Proof processing lifecycle

A newly generated ProofVersion may have processing states such as:

```text
GENERATING
PROCESSING
READY
FAILED
```

or equivalent.

These are technical readiness states.

They are not review states.

---

# 39. Ready ≠ issued to Client

A Proof can be technically ready but still internal.

Correct:

```text
Proof processing = READY
Client release = NOT_ISSUED
```

Only explicit issuance/release makes it eligible for Client Review.

---

# 40. Issued ≠ Review started

A Client ReviewSession can exist:

```text
REQUESTED
```

before the Client opens the proof.

Opening it may move participant/view state, but not automatically complete anything.

---

# 41. Viewed ≠ feedback submitted

Permanent distinction:

```text
Viewed
≠
Reviewed
≠
Feedback Submitted
≠
Approved
```

This matters for Client-action and workflow gating.

---

# 42. Review lifecycle ≠ Proof lifecycle

Possible combination:

```text
ProofVersion:
CLIENT_RELEASED

ReviewSession:
IN_REVIEW
```

or:

```text
ProofVersion:
SUPERSEDED

ReviewSession:
HISTORICAL / SUPERSEDED
```

Keep them separate.

---

# 43. Feedback submitted ≠ new proof available

The design team may need time to process comments.

Therefore:

```text
Feedback Submitted
     ≠
New ProofVersion Ready
```

---

# 44. New ProofVersion ≠ previous feedback fully accepted

v5 may incorporate only some requested changes.

Do not mark every v4 annotation:

> Implemented

just because v5 exists.

---

# 45. Resolved annotation ≠ change implemented

A conversation may be resolved because:

* Client accepted explanation,
* change was rejected by agreement,
* duplicate feedback,
* design was revised.

Resolution requires its own semantics.

---

# 46. Implemented feedback if tracked

If product later tracks implementation state, it should be distinct from comment resolution.

No additional workflow is added unless frozen.

---

# 47. Compare Versions

If the frozen design allows visual comparison, the architecture must compare explicit versions such as:

```text
ProofVersion v4
vs
ProofVersion v5
```

Never:

```text
previous
vs
latest
```

without resolving exact IDs.

---

# 48. Comparison ≠ review subject change

While reviewing v5, the Client may compare against v4.

The active ReviewSession still targets v5.

Comparison is contextual.

---

# 49. Side-by-side comparison data

If used, both versions require independent:

* authorization,
* rendering,
* page mapping.

A Client entitled only to v5 should not automatically receive all historical internal versions.

---

# 50. Client-visible version history

As with Draft Review:

internal design iterations may look like:

```text
v1 internal
v2 internal
v3 Client review
v4 internal
v5 Client review
```

The Portal should expose only intentionally Client-released versions.

---

# 51. Version labels should not leak internal iteration counts unnecessarily

If business policy does not want the Client to know there were 17 internal design iterations, public display labels may differ from internal revision counters.

But the underlying exact version identity remains stable.

---

# 52. Review participants

Multiple Client reviewers may participate:

```text
CEO
Marketing Director
Executive Assistant
```

Review participation and formal approval authority remain independent.

---

# 53. Reviewer ≠ Approver

Permanent:

```text
ReviewParticipant
≠
ApprovalParticipant
```

A user may leave visual comments without authority to approve final design.

---

# 54. Project access ≠ proof review access

Viewing Project 123 does not automatically authorize every design proof.

ProofVersion Review entitlement remains separately evaluable.

---

# 55. Proof read ≠ comment

Potential Phase 3D capabilities:

```text
portal.designs.read
portal.designs.comment
portal.designs.submit_feedback
```

must remain distinct.

---

# 56. Comment ≠ approval

Separate:

```text
portal.designs.comment
```

from:

```text
portal.approvals.decide
```

Even if both controls appear in one workspace.

---

# 57. Download permission is separate

A Client might be permitted to review a proof in-browser but not download the underlying high-resolution/source artifact.

Therefore:

```text
design.read
≠
design.download
```

where policy requires.

---

# 58. Watermarked preview ≠ source asset

If the system uses a watermarked review derivative:

the watermark derivative remains linked to the same ProofVersion.

It is not a new ProofVersion.

---

# 59. Source files should remain restricted

Client Design Review should not accidentally expose:

* `.indd`,
* `.ai`,
* `.psd`,
* editable production assets,

unless the product intentionally delivers them.

The review artifact is typically a proof derivative.

---

# 60. Asset & File integration

Design 030 should own:

* file storage,
* FileVersion,
* processing,
* derivatives,
* secure delivery,
* rights/access.

Design 050 owns:

* visual ReviewSession,
* annotation,
* feedback,
* proof-specific review presentation.

---

# 61. Client Files relationship

Design 051 may expose approved Client files/assets.

A proof being reviewable in Design 050 does not necessarily mean it belongs in the broad downloadable Client Files library.

Visibility contexts can differ.

---

# 62. Design 069 relationship

Later:

**Design 069 — Client Designs / Proofs Library**

Expected architecture:

```text
Canonical Design / Proof Domain
        │
        ├── Design 050
        │   exact-version review
        │
        └── Design 069
            Client-visible proof library
```

One ProofVersion/release/access infrastructure.

---

# 63. Design 025 relationship

Personal Magazine Production remains authoritative for:

* cover design,
* layout production,
* page composition,
* proof generation,
* production readiness.

Design 050 is the Client-facing review surface.

---

# 64. Production stage ≠ Client Review state

The internal production workflow may be:

```text
DESIGN_REVIEW
```

while the Client ReviewSession is:

```text
FEEDBACK_SUBMITTED
```

Do not collapse the two into one status.

---

# 65. Workflow gate

Where Client Design Review is a Project gate:

```text
Review/Approval source state
       ↓
Workflow policy
       ↓
next production stage eligible
```

The Client UI never directly patches:

```text
project.stage = PUBLICATION
```

---

# 66. Review completion ≠ Approval gate satisfaction

If workflow requires formal approval:

feedback submission alone must not advance past the Approval gate.

---

# 67. Design 052 relationship

Design 052 owns the broader Client Approvals workspace.

Design 050 can display an exact version's Approval state/action if permitted.

Formal decision remains Design 029/052 infrastructure.

---

# 68. Approval binds exact ProofVersion

Correct:

```text
ApprovalRequest AR-901
      ↓
ProofVersion PV-5
```

Not:

```text
ApprovalRequest
→ Magazine Design
→ latest Proof
```

This is non-negotiable.

---

# 69. Approved v5 ≠ v6 approved

If a tiny change produces v6 after v5 was approved:

v6 does not inherit v5's Approval automatically unless an explicit business policy permits a controlled non-material change mechanism.

Never assume approval transitivity.

---

# 70. Material change semantics

Any future mechanism for preserving approval across minor technical changes would need explicit governance.

This audit does not introduce it.

Default safest principle:

> New business content version requires its own approval state.

---

# 71. Approval revocation/supersession

If an approved ProofVersion is superseded:

the historical ApprovalDecision remains attached to the old version.

Do not erase it.

---

# 72. Client Action integration

Design 047 may surface:

> Review final magazine design.

Its source should identify:

* ReviewSession,
* exact ProofVersion.

When review requirement is satisfied, the ClientAction projection updates automatically.

---

# 73. Dashboard/Project consistency

Designs 041–043 may show:

> Design review required.

They must reference the same canonical ReviewSession/Approval source state.

No separate dashboard Boolean.

---

# 74. Timeline integration

Design 044 may display:

```text
Design proof ready
Client feedback submitted
Revised proof ready
Final design approved
```

All derive from canonical Proof/Review/Approval events.

---

# 75. Notifications

Events that may produce shared Notifications include:

* Design proof ready,
* review requested,
* annotation reply,
* revised proof issued,
* approval required.

Notification read state remains separate from Review/Approval state.

---

# 76. Messaging

General communication remains Design 045.

Visual feedback remains ReviewComment/VisualAnnotation.

A notification or message can deep-link into Design 050, but must not duplicate its feedback truth.

---

# 77. Activity

Design 063 can later show:

> Proof v5 sent for review.

> Client submitted design feedback.

> Final design approved.

These remain activity projections, not source state.

---

# 78. Audit

Material events may emit Design 039 AuditEvents:

```text
ProofIssuedForClientReview
VisualAnnotationCreated
ClientDesignFeedbackSubmitted
ProofReviewSuperseded
```

Formal ApprovalDecision remains audited by the Approval domain.

---

# 79. Avoid storing image snapshots inside Audit

Audit should reference:

* ReviewSession,
* ProofVersion,
* annotation/comment IDs.

It does not need to duplicate entire proof images or comment content.

---

# 80. Concurrency — multiple reviewers

Multiple Client participants may annotate simultaneously.

Annotations should append independently.

One user's comment must not overwrite another's review state.

---

# 81. Concurrency — stale proof

Example:

```text
Client opens v4.
Internal team issues v5.
Client keeps v4 tab open.
```

The UI must not silently replace v4.

Instead, current server state can indicate:

> A newer proof is available.

---

# 82. Stale feedback submission

If v4 has been formally superseded:

submitting feedback against v4 should be rejected or handled according to policy.

The server—not the browser—decides whether the ReviewSession remains actionable.

---

# 83. Idempotent feedback submission

Double-clicking:

> Submit Feedback

must not create multiple formal submissions.

---

# 84. Comment posting idempotency

Retry after uncertain network state should also avoid duplicate comments where practical.

---

# 85. Annotation rendering failure

If proof content loads but annotation overlay fails:

the artifact remains readable.

The Client should receive a localized degraded state for feedback tools.

---

# 86. Proof rendering failure

If proof rendering fails while Review metadata loads:

do not show:

> No design available.

Show:

> This proof cannot be displayed right now.

---

# 87. Thumbnail failure ≠ proof unavailable

A failed thumbnail should not block opening the actual review artifact if the high-resolution render is healthy.

---

# 88. Partial service failure

Example:

```text
Proof render       ✓
Annotations        ✓
Comment posting    ✕
Approval state     ✓
```

The workspace remains readable.

Only commenting is temporarily unavailable.

---

# 89. Unknown Approval state ≠ not required

If Approval service is unavailable:

do not hide the Approval action and claim:

> No approval required.

Use a degraded/unknown state.

---

# 90. States

Design 050 inherits Design 150 plus visual-review-specific states:

```text
Design Review Loading
Proof Processing
Proof Ready
Proof Rendering Failed

Review Requested
Review In Progress
Feedback Submitted
Review Completed
Review Superseded

Current Proof
Historical Proof
Newer Proof Available

No Annotations
Annotation Creating
Annotation Posted
Annotation Failed
Annotation Resolved
Annotation Reopened

Zoom / Pan presentation state

Review Due Soon
Review Overdue

Approval Pending
Approval Completed
Approval State Unavailable

Attachment/Derivative Processing
Preview Unavailable
Download Restricted

Review Restricted
Proof Access Revoked
Reviewer Removed

Review Updated Elsewhere
Partial Service Failure
```

These must not become one mega `proof.status` enum.

---

# 91. No annotations ≠ approved

Permanent rule:

```text
0 annotations
≠
ApprovalDecision.APPROVED
```

---

# 92. Feedback submitted ≠ design approved

Likewise:

```text
ReviewSession.FEEDBACK_SUBMITTED
≠
ApprovalDecision.APPROVED
```

---

# 93. Proof ready ≠ Client-visible

Technical readiness and Client release are separate.

---

# 94. Historical ≠ unavailable

A superseded ProofVersion can still be intentionally accessible for comparison/history.

Do not represent it as a failed artifact.

---

# 95. Permissions

Potential Phase 3D Client capabilities:

```text
portal.designs.read
portal.designs.comment
portal.designs.submit_feedback
portal.designs.view_history
portal.designs.compare_versions
portal.designs.download
```

and separately:

```text
portal.approvals.decide
```

Exact permission names later.

---

# 96. Read ≠ annotate

A user may be allowed to inspect a proof but not leave design feedback.

---

# 97. Annotate ≠ submit final feedback

If several Client stakeholders contribute comments while one designated reviewer finalizes the Review:

```text
annotate
≠
submit_review
```

The architecture must allow this separation.

---

# 98. Submit feedback ≠ approve

Repeated because it is the most important action boundary:

```text
submitDesignReviewFeedback()
≠
decideApproval()
```

---

# 99. Responsive Behavior — Desktop

Desktop should preserve the full high-resolution proof-review experience:

```text
Review Header
├── Project
├── Proof Version
├── Review State
└── Version controls where frozen
        ↓
Proof Viewer
├── page navigation
├── zoom
├── pan
└── annotations
        +
Review Panel
├── comments
├── discussion
├── selected annotation
└── feedback state
        ↓
Submit Feedback / Separate Approval Action
```

The proof remains the dominant visual surface.

---

# 100. Responsive — Tablet

Tablet should preserve:

* full proof readability,
* pinch/zoom or equivalent safe viewer behavior,
* annotation markers,
* comments in drawer/panel,
* clear page navigation,
* clear Review/Approval distinction.

Do not shrink both proof and comment panel until neither is usable.

---

# 101. Responsive — Mobile

Mobile should become a focused sequence:

```text
Proof Identity + Version
↓
Review / Approval State
↓
Page Viewer
↓
Zoom / Pan
↓
Select Annotation Marker
↓
Comment Thread
↓
Return to Page
↓
Review Summary
↓
Submit Feedback / Separate Approval
```

The desktop split-screen layout should not simply be compressed.

---

# 102. Mobile annotation targeting

Creating a visual annotation on a small screen must remain precise enough to identify the intended area.

Avoid tiny desktop coordinate handles that are unusable with touch.

---

# 103. Mobile page navigation

For a multi-page magazine proof, mobile needs clear awareness of:

```text
Page 12 of 64
```

or equivalent frozen presentation.

Users must not lose context while navigating comments.

---

# 104. Accessibility

Visual annotations are inherently challenging for accessibility.

Every annotation must have a non-spatial semantic representation such as:

> Comment 4 — Page 12 — upper-right image: “Please replace this portrait.”

Screen-reader users should be able to traverse:

* pages,
* comments,
* authors,
* states,

without relying only on visual pins.

---

# 105. Keyboard interaction

Desktop keyboard users should be able to:

* move between pages,
* zoom where practical,
* traverse annotations,
* open comment threads,
* submit feedback.

---

# 106. Backend Query Model

Conceptually:

```text
ClientDesignReviewView
├── ReviewSession
├── exact ProofVersion
├── Client-safe artifact metadata
├── page/render manifest
├── safe derivatives
├── ReviewParticipants
├── VisualAnnotations
├── ReviewComments / Threads
├── due condition
├── related ApprovalRequest summary if permitted
├── available actions
└── partial-processing states
```

---

# 107. Render Manifest

A useful rendering layer can conceptually expose:

```text
ProofRenderManifest
├── ProofVersion ID
├── page count
├── page IDs
├── dimensions/aspect ratio
├── preview derivative references
├── high-resolution derivative references
└── processing state
```

This provides a stable coordinate basis without exposing source design files.

---

# 108. Backend Mutation Architecture

Client commands should be explicit:

```text
createVisualAnnotation()
postDesignReviewComment()
replyToDesignReviewComment()
resolveDesignReviewComment()       // where permitted
submitDesignReviewFeedback()
```

Internal production commands may include:

```text
issueProofForClientReview()
supersedeProofReview()
createNewProofVersion()
```

Formal approval remains:

```text
decideApproval()
```

---

# 109. Generic Design PATCH is prohibited

Do not expose:

```text
PATCH /client/designs/:id
{
  annotations,
  approved,
  currentVersion,
  projectStage
}
```

This would collapse Review, Approval, artifact versioning and Project workflow.

---

# 110. Backend Architecture

```text
Design 050
    ↓
ClientPortalSessionContext
    ↓
Proof Review Authorization
    ↓
ReviewSession
    ↓
Exact ProofVersion
    │
    ├── Asset/FileVersion
    ├── Render Manifest
    ├── page derivatives
    ├── Review participants
    ├── VisualAnnotations
    └── ReviewComments
    ↓
Feedback Submission
    ↓
Internal Design Workflow
    ↓
Potential New ProofVersion
```

Separate decision path:

```text
ProofVersion
     ↓
ApprovalRequest
     ↓
ApprovalDecision
```

---

# 111. Backend Requirements

| Requirement                                      | Status                            |
| ------------------------------------------------ | --------------------------------- |
| Client Portal authentication                     | **Critical**                      |
| Active Portal membership                         | **Critical**                      |
| Project/resource scope                           | **Critical**                      |
| Canonical Design/Proof artifact                  | **Critical**                      |
| Immutable ProofVersion                           | **Critical**                      |
| Exact ReviewSession subject binding              | **Critical**                      |
| Client/Internal review separation                | **Critical**                      |
| Review participant model                         | **Critical**                      |
| Shared ReviewComment/thread model                | **Critical**                      |
| VisualAnnotation model                           | **Critical**                      |
| Version-specific page/coordinate anchors         | **Critical**                      |
| Resolution-independent coordinates               | **Critical**                      |
| Stable render/page manifest                      | **Critical**                      |
| Design 030 Asset/FileVersion integration         | **Critical**                      |
| Derivative lineage                               | **Critical**                      |
| Proof processing/readiness lifecycle             | **Critical**                      |
| Client-release state separate from readiness     | **Critical**                      |
| Safe source-file isolation                       | **Critical**                      |
| Review read/comment/submit permission separation | **Critical**                      |
| Formal Approval separation                       | **Critical**                      |
| Exact Approval subject version                   | **Critical**                      |
| Client Action Resolver integration               | **Critical**                      |
| Project workflow-gate integration                | **Critical**                      |
| Version comparison authorization                 | **Required if comparison exists** |
| Version supersession semantics                   | **Critical**                      |
| Historical Client-version preservation           | **Critical**                      |
| Concurrent annotation handling                   | **Critical**                      |
| Idempotent feedback submission                   | **Critical**                      |
| Safe rich/user-generated content rendering       | **Critical**                      |
| Notification integration                         | **Required**                      |
| Activity integration                             | **Required**                      |
| Audit integration                                | **Required**                      |
| Partial render/comment/approval failures         | **Critical**                      |
| Design 049 shared Review infrastructure          | **Critical architecture**         |
| Design 069 Proof library reuse                   | **Critical architecture**         |

---

# 112. Consolidation — Main Implementation Risks

Design 050 introduces several especially serious implementation risks.

**Design/ProofVersion conflation**
Client always sees mutable “current design.”

**Source design/Client proof conflation**
Editable production files become Client-facing artifacts.

**ProofVersion/FileVersion conflation**
Business review version reduced to storage version alone.

**Ready/issued conflation**
Internally generated proof becomes visible before deliberate release.

**Review/Approval conflation**
Feedback becomes formal decision.

**Reviewer/Approver conflation**
Any commenter gains approval authority.

**Comment/design mutation conflation**
Client annotation directly edits production layout.

**Resolved/implemented conflation**
Closing a comment falsely proves requested change was applied.

**Feedback-submitted/new-version conflation**
Submission automatically fabricates the next ProofVersion.

**Latest-version bug**
Review silently moves from v4 to v5.

**Annotation migration bug**
v4 coordinates attach to different content in v5.

**Pixel-coordinate bug**
Annotations move when screen size or zoom changes.

**Page-index instability**
Comments attach to wrong page after reordering/versioning.

**Derivative/ProofVersion conflation**
Generating retina preview accidentally creates a new business version.

**Technical re-render/design revision conflation**
Thumbnail regeneration increments revision history.

**Internal annotation leakage**
Designer/preflight notes reach Client browser.

**Project/proof permission conflation**
Every Project viewer sees every proof.

**Read/comment/approve permission conflation**
One capability controls all review actions.

**Review access/download conflation**
Review entitlement exposes high-resolution/source files.

**Historical/internal version leakage**
Client sees unreleased design iterations.

**Approval transitivity bug**
Approval of v5 is automatically applied to changed v6.

**Timeline/review duplication**
Timeline stores separate Design Review status.

**Notification/review duplication**
Notification state becomes Review completion.

**Render failure/no-proof conflation**
Temporary rendering problem appears as missing design.

**No-annotations/approved conflation**
Silence is interpreted as approval.

**050/049 duplicate Review engines**
Text Review and Visual Review use separate comments/participants/lifecycle.

**050/052 duplicate Approval engines**
Design workspace maintains another approval state.

**050/069 duplicate Proof domains**
Designs Library stores separate visual-version records.

No new screen is required.

These are **visual artifact versioning, rendering, annotation, permission, review, storage, and approval-boundary requirements**.

# Design 050 Audit Verdict

## **PASS — VERSION-SPECIFIC CLIENT VISUAL PROOF REVIEW & ANNOTATION ANCHOR**

**Domain directive:** **Design/Proof ≠ ProofVersion ≠ ReviewSession ≠ VisualAnnotation ≠ ReviewComment ≠ ApprovalRequest ≠ ApprovalDecision.**

**Artifact directive:** Design 025 remains authoritative for visual/magazine production; Design 050 consumes deliberately released Client-facing ProofVersions.

**Version directive:** every ReviewSession is permanently bound to one immutable exact ProofVersion. New visual content always produces a new business version rather than mutating a reviewed proof.

**Storage directive:** ProofVersion and Design 030 FileVersion remain distinct but linked concepts: ProofVersion carries business/review identity, while Asset/FileVersion carries stored-file and derivative identity.

**Rendering directive:** one ProofVersion can produce thumbnails, page previews and high-resolution derivatives without creating extra business versions.

**Release directive:** technically ready ≠ Client issued. A proof becomes Client-visible only through explicit release/review assignment.

**Review directive:** Design 050 reuses Design 049's ReviewSession + participant + comment/thread + audience + feedback submission foundation.

**Annotation directive:** Design 050 adds a visual-artifact adapter using page-specific, resolution-independent point/region anchors bound permanently to the exact ProofVersion.

**Migration directive:** annotations from an older proof never silently move to a newer version; any carry-forward must preserve explicit lineage.

**Feedback directive:** comments and submitted visual feedback never directly mutate the production design.

**Approval directive:** formal Design approval always uses Design 029/052's ApprovalRequest → exact ProofVersion → ApprovalDecision chain. Comments, resolved annotations and submitted feedback never constitute Approval.

**Permission directive:** Proof read, annotate, feedback submission, download/history and formal approval remain independently authorized capabilities.

**Version-history directive:** only intentionally Client-released ProofVersions appear in Client history; internal working iterations remain private.

**Source-file directive:** Client Review must never accidentally expose production `.indd`, `.ai`, `.psd`, editable design sources or other restricted assets.

**Workflow directive:** Client feedback/Approval can satisfy explicit production gates, but Design 050 never directly changes the Project or Magazine workflow stage.

**Client Action directive:** Designs 041–047 surface visual review through the same ClientActionResolver and exact ReviewSession source state.

**Reliability directive:** proof-processing, proof-ready, Client-issued, Review state, Approval state, rendering failure and permission restriction remain separate dimensions.

**Accessibility directive:** every spatial annotation also requires a semantic page/context representation so the review remains understandable beyond visual pins alone.

**Responsive directive:** desktop provides the richest page + annotation + comment workspace; mobile becomes proof page → zoom/pan → annotation/thread → feedback submission rather than compressing a desktop split view.

**Reuse directive:** Designs **049 and 050** use one generalized version-aware Review Collaboration foundation with specialized text-anchor vs visual-coordinate adapters.

**Overlap directive:** Designs **025, 029–030, 043–044, 047, 049–052 and 069** must ultimately consume one exact-version visual artifact, Review, Asset and Approval foundation.

**Consolidation directive:** **STANDARDIZE ONE VERSION-AWARE ARTIFACT REVIEW PLATFORM — REVIEWSESSION + EXACT SUBJECT VERSION + PARTICIPANTS + AUDIENCE + COMMENT THREADS + ARTIFACT-SPECIFIC ANCHORS + FEEDBACK SUBMISSION — WITH ONE PROOFVERSION/RENDER-MANIFEST/ASSET DERIVATIVE PIPELINE AND A COMPLETELY SEPARATE FORMAL APPROVAL DOMAIN.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **50 / 153** |
| **PASS**                                   |                         **50** |
| **STANDARDIZE decisions**                  |                         **48** |
| **Potential implementation-overlap flags** |                         **41** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**50 / 153 = 32.7% audited.**

### Review architecture after Design 050

```text
                       REVIEW PLATFORM
                             │
              ┌──────────────┴──────────────┐
              ↓                             ↓
       DESIGN 049                      DESIGN 050
       Draft Review                    Design Review
              │                             │
        Text anchors                  Visual anchors
      section/paragraph              page/x/y/region
              │                             │
              └──────────────┬──────────────┘
                             ↓
                         ReviewSession
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
         Participants      Comments      Feedback
                             │
                             ↓
                       Exact Version
                             │
                  ┌──────────┴──────────┐
                  ↓                     ↓
              DraftVersion          ProofVersion
```

Formal decisions remain outside the Review engine:

```text
DraftVersion / ProofVersion
            ↓
      ApprovalRequest
            ↓
      ApprovalDecision
            ↓
      Designs 029 / 052
```

And visual storage/rendering remains:

```text
ProofVersion
     ↓
Asset / FileVersion
     ↓
Render Manifest
     ↓
├── Thumbnail
├── Page Preview
├── Hi-Res Review Render
└── Download Artifact where authorized
```

# Next Sequential Audit Target

## **Design 051 — Client Files & Assets**

Its frozen identity is already locked.

The next audit must preserve another major boundary:

> **Asset ≠ FileVersion ≠ StorageObject ≠ Folder ≠ Project Attachment ≠ Client Deliverable ≠ Client-visible File Access.**

It will also need to reconcile the internal platform-wide Asset foundation from **Design 030** with the Client Portal projection, without creating a separate Client file storage system.

After Design 051 we continue strictly:

**052 Client Approvals → 053 Client Contracts → 054 Client Invoices & Payments → 055 Client Publishing & Distribution → 056 Client Reports & Downloads → 057 Client Renewal / Continuation Workspace → … → 077 Client Access Recovery**

with the same audit contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**

