# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 066 — Client Media Project Detail

Its frozen identity is locked. The previously supplied route annotation **`/client/media/[projectId]`** is also locked, while exact route architecture and route-to-route connection finalization remain deferred to **Phase 3B**.

Design 066 should become the **canonical Client Portal media-specialized Project detail composition** for one authorized media engagement.

Its governing boundary is:

> **Project ≠ ClientMediaProjectDetail ≠ Specialized Production Entity ≠ Workflow/Progress ≠ Questionnaire ≠ DraftVersion ≠ ProofVersion ≠ Deliverable ≠ Publication ≠ Distribution ≠ ClientAction.**

The central implementation rule is:

> **Design 066 does not own a second Project 360 backend. It composes Design 043’s canonical Client Project identity/access model with Designs 024–028’s specialized production data and the existing Questionnaire, Draft, Proof, Deliverable, Publishing, Distribution, Reporting, Messaging, Meeting and Client Action domains.**

---

# 1. Classification

| Audit field                          | Classification                                                                                                                                            |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                        | **066**                                                                                                                                                   |
| **Canonical name**                   | **Client Media Project Detail**                                                                                                                           |
| **Product area**                     | Client Portal / Media / Project Delivery                                                                                                                  |
| **User surface**                     | **Client Portal**                                                                                                                                         |
| **Screen class**                     | Media-Specialized Client Project Detail / Composition Workspace                                                                                           |
| **Classification**                   | **Portal Entity Detail Variant — Client Media Project Composition Family**                                                                                |
| **Primary purpose**                  | Present one authorized media Project with its Client-safe production context, progress, current actions, review artifacts, deliverables and release state |
| **Primary canonical entity**         | **Project** — Design 023                                                                                                                                  |
| **Generic Client detail foundation** | **ClientProjectDetailView** — Design 043                                                                                                                  |
| **Media collection parent**          | Design 065                                                                                                                                                |
| **Media detail projection**          | `ClientMediaProjectDetail`                                                                                                                                |
| **Specialized production entities**  | EditorialProject / MagazineIssue / Podcast production / VideoProject / Event                                                                              |
| **Workflow/progress dependency**     | Designs 023 / 044                                                                                                                                         |
| **Questionnaire dependency**         | Designs 048 / 067                                                                                                                                         |
| **Draft dependency**                 | Designs 024 / 049 / 068                                                                                                                                   |
| **Proof/design dependency**          | Designs 025 / 050 / 069                                                                                                                                   |
| **Approval dependency**              | Designs 029 / 052                                                                                                                                         |
| **File/deliverable dependency**      | Designs 030 / 051                                                                                                                                         |
| **Publishing dependency**            | Designs 031 / 055 / 072                                                                                                                                   |
| **Distribution dependency**          | Designs 032 / 055 / 073                                                                                                                                   |
| **Reporting dependency**             | Designs 033 / 056                                                                                                                                         |
| **Messaging dependency**             | Designs 045 / 074                                                                                                                                         |
| **Meetings dependency**              | Design 046                                                                                                                                                |
| **Client-action dependency**         | Design 047                                                                                                                                                |
| **Parent shell**                     | `ClientPortalShell` — Design 002                                                                                                                          |
| **Primary read model**               | `ClientMediaProjectDetailView`                                                                                                                            |
| **Template family**                  | `ClientMediaProjectDetailTemplate`                                                                                                                        |
| **Auth**                             | Required                                                                                                                                                  |
| **Authorization**                    | Active Portal membership + Project entitlement + specialized-resource/subresource access                                                                  |
| **Implementation priority**          | **Critical Client Delivery / Media Engagement Detail**                                                                                                    |
| **Reuse level**                      | **Extremely High across Designs 023–032, 043–056 and 065–069**                                                                                            |

Design 066 should answer:

> **“What media engagement am I viewing, where is it in its Client-visible journey, what specialized production is happening, what needs my attention, which Questionnaire/Draft/Proof/Deliverables belong to it, what has been published or distributed, and which underlying item can I safely open?”**

Canonical composition:

```text
                         PROJECT
                       Design 023
                           │
                           ↓
                  Client Project Layer
                     Design 043
                           │
                           ↓
              Media-specialized composition
                           │
       ┌───────────────────┼────────────────────┐
       ↓                   ↓                    ↓
Specialized production  Workflow/Progress   Client Actions
 Designs 024–028          023 / 044            047
       │
       ├── Questionnaire
       ├── DraftVersion
       ├── ProofVersion
       ├── Deliverables
       ├── Publication
       ├── Distribution
       └── Reports
                           │
                           ↓
             ClientMediaProjectDetailView
                           │
                           ↓
                      DESIGN 066
```

---

# 2. Reuse

## Design 043 remains the generic Client Project Detail foundation

Design 043 already established the canonical Client Project 360 boundary:

> **Project ≠ ClientProjectDetailView ≠ Internal Project 360 ≠ Client-visible workflow/progress.**

Design 066 must specialize that existing model.

Correct:

```text
Project P-101
     │
     ├── ClientProjectDetailView       → Design 043
     │
     └── ClientMediaProjectDetailView  → Design 066
```

Both reference the same canonical Project.

There must not be:

```text
Project
ClientProject
ClientMediaProject
```

as three separate business records.

---

## Design 066 ≠ Design 043

The distinction is composition depth.

### Design 043

Generic Client Project 360:

* overview,
* status,
* actions,
* milestones,
* files,
* messages,
* meetings,
* commercial summaries,
* publishing/report summaries.

### Design 066

Media-specialized detail:

* media type,
* specialized production context,
* media review artifacts,
* production-specific deliverables,
* media release status,
* media-specific Client interactions.

Therefore:

> **Design 066 specializes the Project experience; it does not replace Design 043’s Project identity/access/status foundation.**

---

## Design 065 → 066 must preserve identity

Opening an item from Design 065 should pass the canonical Project identity and any typed specialized-media reference needed.

Correct:

```text
ClientMediaSummary
    projectId = P-101
    mediaKind = MAGAZINE
    specializedRef = MagazineIssue MI-22
          ↓
Design 066
```

Do not resolve detail by:

* card title,
* displayed image,
* media label text.

---

## Reuse Design 024 — Editorial

Editorial-specific facts remain Design 024 truth:

* Draft lifecycle,
* Questionnaire use,
* editorial versions,
* review states,
* editorial approval dependencies.

Design 066 consumes only a Client-safe projection.

---

## Reuse Design 025 — Magazine

Magazine-specific truth remains:

* MagazineIssue,
* ReaderBuild,
* page/cover production,
* ProofVersions,
* final reader artifacts.

Design 066 does not build another Magazine model.

---

## Reuse Design 026 — Podcast

Podcast truth remains:

* Show,
* Episode,
* RecordingSession,
* MediaVersion,
* transcript/caption derivatives.

Design 066 only composes Client-safe media status and approved/released artifacts.

---

## Reuse Design 027 — Video

Video truth remains:

* VideoProject,
* Shoot,
* FootageAsset,
* VideoVersion,
* captions/clips/thumbnails.

Raw production complexity remains internal unless deliberately released.

---

## Reuse Design 028 — Event

Event truth remains:

* Event,
* EventOccurrence,
* Session,
* logistics,
* registration/attendance.

Design 066 may show appropriate Client-safe media/Event context without turning Project detail into Event Operations.

---

## Reuse Design 044 for progress/timeline

Design 066 may contain a progress/timeline summary.

It must use the same canonical:

* workflow history,
* milestone history,
* Client-safe stage mapping,
* progress resolver

established by Design 044.

Do not create:

```text
mediaProgress
```

as an independently editable number.

---

## Reuse Design 047 for Client actions

Design 066 can prominently show:

> Questionnaire required
> Review Draft
> Approve Proof
> Upload images

but those come from canonical source domains through `ClientActionResolver`.

No:

```text
mediaProject.actionRequired = true
```

parallel truth.

---

## Reuse Designs 048 / 067 for Questionnaires

Design 066 may show:

* current Questionnaire,
* completion state,
* due context.

But canonical entities remain:

```text
QuestionnaireDefinition
QuestionnaireVersion
QuestionnaireAssignment
QuestionnaireResponse
```

Design 067 later owns broader Questionnaire library discovery.

---

## Reuse Designs 049 / 068 for Drafts

Design 066 may show the current Client-visible Draft.

But:

```text
Draft
≠
DraftVersion
```

and the detail must point to an exact released version.

Design 068 later owns broader Draft library discovery.

---

## Reuse Designs 050 / 069 for Proofs

Design 066 may show the current design/proof review state.

It must reference:

* exact ProofVersion,
* current ReviewSession,
* formal Approval where applicable.

Design 069 later owns the broader Client Proof library.

---

## Reuse Design 052 for formal approval

A media Project can be:

> Waiting for approval

but the formal truth remains:

```text
ApprovalRequest
+
ApprovalParticipant
+
ApprovalDecision
```

not media-project status.

---

## Reuse Designs 030 / 051 for files and deliverables

Any:

* final PDF,
* approved artwork,
* podcast audio,
* video deliverable,
* publication package

must use Asset/FileVersion/Deliverable infrastructure.

Design 066 cannot become a media-specific file store.

---

## Reuse Publishing and Distribution

Primary publication state comes from Design 031.

Distribution comes from Design 032.

Design 066 may summarize them while Designs 072/073 later own deeper Client delivery detail.

---

## Reuse Design 056 for finalized Reports

If media Project detail shows a Report:

it should reference the exact Client-released `ReportVersion`.

No live Analytics masquerading as historical report truth.

---

## Reuse Designs 045/046

Project communication and Meetings remain canonical Conversation/Meeting entities.

Media specialization does not create media-specific chat or calendar systems.

---

# 3. Entities

## Project ≠ ClientMediaProjectDetail

`Project` remains canonical.

`ClientMediaProjectDetail` is a composed read model.

Conceptually:

```text
ClientMediaProjectDetail
├── Project identity
├── Client-safe Project status
├── progress
├── media classification
├── specialized production summary
├── current Client actions
├── Questionnaire summary
├── Draft summary
├── Proof/design summary
├── deliverables
├── Publication summary
├── Distribution summary
├── Report summary
└── supporting communication/context
```

It should not be independently mutated.

---

## ClientMediaProjectDetail ≠ database mega-record

Avoid storing one enormous record such as:

```text
client_media_project_details
├── questionnaireStatus
├── latestDraft
├── proofStatus
├── publicationStatus
├── distributionStatus
├── actionRequired
└── ...
```

as duplicate source truth.

Those values should be composed from canonical domains.

---

## Specialized Production Entity ≠ Project

A media Project can have an explicit relation such as:

```text
Project P-101
      ↓
MagazineIssue MI-20
```

or:

```text
Project P-200
      ↓
Podcast Episode / production context
```

The specialized entity retains its own lifecycle and identity.

---

## One Project may have multiple specialized outputs

Architecture should tolerate:

```text
Project
├── MagazineIssue
├── PodcastEpisode
└── Video output
```

for bundled media engagements where business rules allow them.

Do not force one nullable `specializedEntityId`.

---

## Typed production relationships

Prefer explicit typed relationships or governed references:

```text
ProjectMediaRelation
├── projectId
├── mediaKind
├── specializedEntityId
└── relation purpose
```

if needed.

Exact schema Phase 3D.

---

## Media type ≠ specialized record

`MAGAZINE` tells the UI which adapter/composition applies.

It is not the MagazineIssue itself.

---

## Workflow ≠ Specialized Production state

Project workflow can say:

> Client Review

while Magazine production can say:

> Proof v5 generated.

Both are useful, but they are separate state sources.

---

## Progress ≠ workflow stage

A Client-visible progress percentage cannot simply equal:

```text
currentStageIndex / stageCount
```

unless a deliberate progress model defines that.

Reuse canonical progress resolution.

---

## Progress ≠ readiness

Permanent:

```text
90% complete
≠
ready to publish
```

---

## Questionnaire ≠ Project stage

A Questionnaire may be required to unblock work.

But its response lifecycle remains its own domain.

---

## QuestionnaireAssignment ≠ QuestionnaireResponse

Design 066 should show:

> Questionnaire 80% complete

from the assigned Questionnaire workflow—not one generic `project.questionnaireStatus`.

---

## Questionnaire completion ≠ workflow completion

A submitted Questionnaire may still require:

* review,
* clarification,
* acceptance.

Do not auto-complete Project stages purely from frontend submission.

---

## Draft ≠ DraftVersion

The Project may have one logical Draft with many immutable versions.

Client detail must reference the exact released/current Client-visible version.

---

## Current Client-visible Draft ≠ latest internal Draft

Critical:

```text
latest internal = v8
latest Client-released = v6
```

Design 066 must show v6 unless v8 has deliberately been released.

---

## Draft review ≠ Draft approval

Feedback/comments remain Design 049 ReviewSession truth.

Formal Approval remains Design 052.

---

## Proof ≠ ProofVersion

Visual design/proof identity may have many versions.

Design 066 should bind all review/approval information to exact ProofVersion.

---

## Latest Proof ≠ approved Proof automatically

Example:

```text
v5 APPROVED
v6 INTERNAL WORKING
```

The Client must not suddenly see v6 merely because it is newest.

---

## Proof review ≠ ApprovalDecision

No annotations/comments does not mean approved.

---

## Deliverable ≠ Project

A media Project can have multiple deliverables.

---

## Deliverable ≠ Asset

Business release designation and file identity remain separate.

---

## Client-visible file ≠ deliverable automatically

A supporting uploaded reference may be Client-visible without being a final contractual deliverable.

---

## Deliverable version must be exact

If Final Magazine PDF v3 was delivered:

do not later make that historical delivery point to v4 automatically.

---

## Publication ≠ production completion

A media Project can be production-complete but unpublished.

---

## Scheduled ≠ Published

Permanent.

---

## Published ≠ Verified Live

Provider acceptance is not sufficient.

Use Design 031/055 Verification truth.

---

## Publication ≠ Distribution

Primary release and downstream amplification remain separate.

---

## Distribution Campaign ≠ media Project

A Project can have zero, one, or multiple DistributionCampaigns.

Do not put all distribution execution state directly on Project.

---

## Distribution complete ≠ media Project complete necessarily

Other deliverables/reports/closeout obligations may remain.

---

## Report ≠ Project completion

Final Report can be one later Project output.

Its release does not rewrite Project history.

---

## ClientAction ≠ Project lifecycle

Example:

```text
Project:
IN REVIEW

ClientAction:
Approve Proof v5
```

The action is a separate current obligation.

---

## ClientAction can disappear without historical mutation

If another eligible Client participant completes the approval:

Design 066 should stop showing that action for this user.

The Project history remains intact.

---

## ClientAction ≠ Notification

Notification can point to the action.

Design 066 should resolve action directly from source truth, not from unread notifications.

---

## Media summary ≠ Media detail

Design 065 `ClientMediaSummary` is compact.

Design 066 `ClientMediaProjectDetail` is richer.

Both must resolve from the same canonical entities.

---

## Detail title ≠ identity

Changing the Project/client-facing title does not create a new media Project.

Stable Project IDs and specialized IDs remain canonical.

---

## Representative asset ≠ current proof

A cover/thumbnail used at the top of Design 066 is presentation.

It is not necessarily the artifact currently under review.

---

## Current media image ≠ latest upload

Only deliberately selected/released Client-safe Asset derivatives should be used.

---

## Media-specific sections should be adapter-driven

Conceptually:

```text
MagazineDetailAdapter
PodcastDetailAdapter
VideoDetailAdapter
EventDetailAdapter
EditorialDetailAdapter
```

can map specialized domain information into common Client detail sections.

This is preferable to hundreds of conditional fields in one generic component.

---

## Adapter ≠ business logic owner

Adapters perform:

* safe mapping,
* normalization,
* composition.

They do not:

* approve Proof,
* submit Questionnaire,
* publish,
* mutate production state.

Those commands remain in source domains.

---

# 4. Permissions

Authorization should be layered:

```text
active Portal membership
+
Client/account scope
+
Project entitlement
+
specialized resource visibility
+
section/subresource permission
+
current source-domain participant rules
```

---

## Project read ≠ entire Design 066 payload

This is critical.

A user may see the media Project but not:

* Contract,
* Finance,
* confidential Draft,
* particular Proof,
* internal Deliverables,
* Messages.

Server-side composition must omit unauthorized sections/data.

---

## Specialized production access

Project entitlement does not automatically expose:

* raw Podcast recordings,
* Video footage,
* design source files,
* internal Editorial revisions.

---

## Questionnaire access

The current Portal member must be:

* assigned/authorized,
* or otherwise permitted by Questionnaire policy.

Project access alone is insufficient.

---

## Draft access

Only Client-released DraftVersions can appear.

Internal Drafts must never enter the Client DTO.

---

## Draft comment access

Reading Draft does not automatically grant comment permission.

---

## Draft approval access

Reading/commenting does not grant formal Approval authority.

---

## Proof access

Only explicitly released ProofVersions can appear.

---

## Proof annotate ≠ approve

Separate capabilities.

---

## Deliverable read ≠ download

Design 051 rules continue.

The user can potentially see that a Deliverable exists while lacking direct file-download permission.

---

## Publication summary ≠ publication management

Client Project readers do not gain:

* publish,
* reschedule,
* retry,
* delete-placement

authority.

---

## Distribution summary ≠ integration access

Never expose:

* OAuth tokens,
* provider diagnostics,
* connected-account credentials.

---

## Report summary ≠ Report access

If a Report is mentioned but this member lacks Report entitlement, safe composition should omit/restrict it.

---

## Messages

Project access does not automatically expose every Conversation.

Conversation participation/visibility remains Design 045 truth.

---

## Meetings

Same principle.

A Project member is not automatically an attendee in every Meeting.

---

## Contract/Finance sections if frozen

Any commercial summaries shown in Design 066 must still obey separate Contract/Finance permissions.

Media Project visibility alone is never sufficient.

---

## Current action authorization

A CTA such as:

> Approve Design

must be returned only when the current user:

1. can see the exact ProofVersion;
2. is an eligible ApprovalParticipant;
3. has the required approval capability;
4. request is currently actionable.

---

## Backend revalidates every action

Even if Design 066 rendered the CTA seconds ago, the source mutation command revalidates current state.

---

## Hidden section ≠ security

Do not send internal/sensitive section payloads and hide them in UI.

Client-safe BFF/query projection must omit them.

---

## Direct subresource IDs

If a user manipulates URLs/API payloads with:

* DraftVersion ID,
* ProofVersion ID,
* FileVersion ID,

each source domain independently reauthorizes.

---

## Cross-tenant protection

Every Project and specialized resource relation must be confirmed to belong to the current Client context.

No arbitrary typed resource references.

---

## Search/navigation references

Design 066's related-resource navigation must never expose another Project's data because IDs were guessed.

---

# 5. States

Design 066 is a multi-domain composition and therefore must avoid a giant combined status.

### Detail/query states

```text
Media Project Loading
Media Project Available
Media Project Restricted
Media Project Not Available
Partial Detail Available
```

### Project/progress state

```text
Client-safe Project status
Progress available
Progress unavailable
```

### Questionnaire state

```text
Not Assigned
Not Started
Draft
Submitted
Accepted
Revision Requested
Unavailable / Restricted
```

### Draft state

```text
No Client Draft Yet
Client Draft Available
Review In Progress
Feedback Submitted
Superseded
Restricted
```

### Proof/design state

```text
Proof Preparing
Proof Available
Review In Progress
Feedback Submitted
Approval Pending
Approved
Superseded
Restricted
```

### Deliverable state

```text
No Deliverable Yet
Deliverable Preparing
Deliverable Available
Download Restricted
```

### Publication state

```text
Not Scheduled
Scheduled
Publishing
Outcome Verifying
Published
Verified Live
Publication State Unavailable
```

### Distribution state

```text
Not Started
Scheduled
In Progress
Partially Complete
Complete
Distribution State Unavailable
```

### Client-action state

```text
No Current Action
Action Required
Action Completed Elsewhere
Action Restricted
Action State Unavailable
```

These remain separate dimensions.

---

## Project Available ≠ all sections available

A partial failure should not make the entire media Project disappear.

---

## No Questionnaire ≠ Questionnaire service unavailable

Separate.

---

## No Draft yet ≠ Draft restricted

Separate.

---

## No Proof yet ≠ Proof rendering failed

Separate.

---

## No Deliverable yet ≠ Deliverable download unavailable

Separate.

---

## Published ≠ distribution complete

Permanent.

---

## Distribution complete ≠ Report ready

Permanent.

---

## Action data unavailable ≠ no action required

Critical safety rule.

---

## Progress unavailable ≠ zero

Do not show 0%.

---

## Questionnaire submitted ≠ accepted

Permanent.

---

## Draft feedback submitted ≠ Draft approved

Permanent.

---

## Proof comments resolved ≠ Proof approved

Permanent.

---

## Approval completed ≠ new version approved

Approval binds exact version.

---

## Superseded version ≠ rejected version

Keep historical semantics.

---

## Provider unavailable ≠ unpublished

Publication/Distribution provider outage does not rewrite prior verified delivery truth.

---

## Restricted subresource

If access to one Proof or file is revoked:

keep the Project detail available where still authorized.

---

## Updated elsewhere

A Client action can be completed by another participant while Design 066 is open.

The UI must reconcile/reload source state rather than allow stale duplicate action.

---

## State Coverage

Design 066 inherits Design 150 plus:

```text
Media Project Detail Loading
Media Project Detail Available
Media Project Restricted
Media Project Not Found / Not Available

Partial Media Detail Available
Specialized Production Data Unavailable

Progress Loading
Progress Available
Progress Unavailable

Questionnaire Available
Questionnaire Restricted
Questionnaire State Unavailable

Draft Available
Draft Review Active
Draft Restricted
Draft State Unavailable

Proof Available
Proof Review Active
Approval Pending
Proof Approved
Proof Restricted
Proof State Unavailable

Deliverable Preparing
Deliverable Available
Deliverable Restricted

Publication Scheduled
Publication Processing
Publication Verified Live
Publication State Unavailable

Distribution In Progress
Distribution Complete
Distribution State Unavailable

Client Action Required
No Client Action Required
Action Completed Elsewhere
Action State Unavailable

Related Messages Unavailable
Related Meetings Unavailable

Partial Service Failure
```

---

# 6. Responsive Behavior

## Desktop

Desktop should preserve media-specific depth without becoming an internal production dashboard.

Conceptually:

```text
Media Project Detail
↓
Media Hero / Project Summary
├── media type
├── title
├── Client-safe status
├── progress
├── representative visual
└── current action
↓
Production / Progress Summary
↓
Client Work
├── Questionnaire
├── Draft Review
├── Design / Proof Review
└── Approval
↓
Deliverables
↓
Publishing / Distribution
↓
Reports / Supporting Project context
```

Only sections present in the frozen design should be rendered.

---

## Desktop ≠ internal Project 360

Do not expose:

* assignment boards,
* internal Tasks,
* resource utilization,
* raw blockers,
* render queues,
* internal QA,
* provider diagnostics.

Design 066 is Client-safe.

---

## Tablet

Following Design 152:

* hero summary stacks cleanly,
* media visual remains proportional,
* progress/action remain near the top,
* artifact/review sections become cards,
* deeper detail can use focused drawers/panels if frozen,
* no horizontal workflow boards.

---

## Mobile

Priority:

```text
Media Project
↓
Title + Media Type
↓
Current Status / Progress
↓
Action Required
↓
Current Client Work
    Questionnaire
    Draft
    Proof
↓
Deliverables
↓
Publishing / Distribution
↓
Supporting information
```

The Client should understand:

1. where the Project is;
2. what they need to do;
3. what has been delivered.

---

## Mobile action prominence

If an action exists:

> Review Draft
> Approve Proof
> Complete Questionnaire

it should not be buried beneath long history.

But source authorization remains canonical.

---

## Mobile version clarity

Artifact cards should clearly expose exact version where relevant:

> Draft v4
> Proof v6

rather than ambiguous:

> Latest.

---

## Mobile media variation

Magazine, Podcast, Video and Event sections may differ.

Use reusable adapters/components rather than forcing identical information into every type.

---

## Accessibility

The page must not communicate status only through:

* timelines,
* progress bars,
* thumbnails,
* color.

Semantic text should communicate:

> Magazine Project. Design review. Proof version 5 requires your approval.

where canonical data supports it.

---

## Review accessibility

Visual Proof annotations should retain the non-spatial accessible representation already required by Design 050.

---

## Media accessibility

Audio/video content, if present in frozen design, should expose appropriate controls/captions/transcripts only through canonical released assets.

---

# 7. Backend Requirements

## Composition architecture

```text
Design 066
    ↓
ClientPortalSessionContext
    ↓
Project Authorization
    ↓
ClientMediaProjectDetailQueryService
    │
    ├── canonical Project
    ├── Client Project status/progress
    ├── specialized production adapter
    ├── Questionnaire summary
    ├── DraftVersion / Review summary
    ├── ProofVersion / Review / Approval summary
    ├── Deliverables
    ├── Publication
    ├── Distribution
    ├── Report summary
    ├── Client Actions
    ├── Messages summary
    └── Meetings summary
    ↓
field/section authorization
    ↓
ClientMediaProjectDetailView
```

---

## Reuse Design 043 Project query layer

The Project identity, safe title, account context, status and Project entitlement should come from the same Client Project service used by Design 043.

Do not rebuild authorization in the media adapter.

---

## Media adapter registry

Conceptually:

```text
ClientMediaDetailAdapter
├── EditorialMediaDetailAdapter
├── MagazineMediaDetailAdapter
├── PodcastMediaDetailAdapter
├── VideoMediaDetailAdapter
└── EventMediaDetailAdapter
```

Each adapter maps specialized production safely.

---

## Adapter interface

Conceptually:

```text
getClientMediaDetail(
    project,
    membership,
    specializedRef
)
→ ClientSafeSpecializedMediaDetail
```

It should never return internal production entities wholesale.

---

## Specialized relation resolver

A central service should resolve which specialized production entities actually belong to the Project.

Do not trust:

```text
projectId=P1
proofId=some-arbitrary-ID
```

from the browser.

---

## Progress resolver

Reuse the canonical Client progress resolver:

```text
Project
+
Workflow history
+
Milestones
+
safe production context
→ Client progress
```

No page-local calculations.

---

## Questionnaire resolver

Return only:

* authorized Assignment,
* exact QuestionnaireVersion,
* latest authorized response checkpoint,
* actionable state.

Do not return internal editorial use notes.

---

## Draft resolver

Resolve:

```text
latestClientReleasedDraftVersion
```

not:

```text
latestDraftVersion
```

---

## Proof resolver

Resolve:

```text
currentClientReleasedProofVersion
+
ReviewSession
+
current user's ApprovalParticipant state
```

where applicable.

---

## Deliverable resolver

Use explicit Client-released Deliverable records.

Do not enumerate every Project Asset and label them Deliverables.

---

## Publication resolver

Return canonical:

* target,
* schedule,
* Publication state,
* verified Placement/live link where authorized.

---

## Distribution resolver

Return safe campaign/channel summaries without provider secrets.

---

## Client Action resolver

Use source-specific canonical state.

Potential priority/ranking of several Client actions should be centralized rather than hard-coded into Design 066.

---

## Partial composition strategy

Because Design 066 aggregates many domains, the backend should differentiate:

### Required core

* Project identity,
* authorization,
* basic media classification.

### Optional/degradable enrichment

* publication summary,
* Report summary,
* Meeting summary,
* secondary supporting data.

Critical Client action data may need stronger failure signaling.

---

## No false negative on critical actions

If Approval service is unavailable:

do not return:

```text
actionRequired = false
```

Return:

> action state unavailable

or fail that critical section safely.

---

## Batching / request efficiency

Avoid:

```text
Project query
+ Questionnaire query
+ Draft query
+ 5 Proof queries
+ file query per artifact
+ publication query
+ channel query per placement
```

as uncontrolled serial/N+1 behavior.

Use composed/batched read services.

---

## Parallel safe enrichment

Independent sections can often load/compose concurrently on the backend while preserving consistent authorization.

---

## Snapshot consistency

Where multiple sections must reconcile at one meaningful point in time, read-model revision/version metadata can help avoid contradictory states such as:

> Proof approved

while action section still says:

> Approval required.

---

## Event-driven invalidation

Relevant events should invalidate/update the read projection, such as:

```text
ProjectStatusChanged
QuestionnaireSubmitted
DraftVersionReleased
ReviewFeedbackSubmitted
ProofVersionReleased
ApprovalDecisionRecorded
DeliverableReleased
PublicationVerified
DistributionPlacementVerified
ReportReleased
PortalScopeChanged
```

Exact names later.

---

## Materialized read model

If needed for performance:

```text
ClientMediaProjectDetailProjection
```

can be materialized/cache-backed.

But it must remain:

* permission-aware,
* source-derived,
* replayable/rebuildable.

Never manually edit it as canonical truth.

---

## Permission-safe caching

Cache key dimensions may include:

```text
projectId
membershipId / entitlement revision
Client projection revision
media specialization revision
```

Do not serve one fully privileged Client admin's detail payload to a restricted member.

---

## Access revocation

Design 062 scope changes must invalidate/recheck:

* Project detail,
* Draft/Proof links,
* Deliverable downloads,
* Publication links,
* Report links.

---

## Mutation architecture

Design 066 itself should have almost no generic mutation API.

Actions route to canonical commands:

```text
submitQuestionnaire()
submitReviewFeedback()
decideApproval()
uploadRequestedAsset()
```

etc., only if present in frozen design.

Never:

```text
PATCH /client/media/project/:id
{
  stage: "approved",
  proofApproved: true,
  questionnaireDone: true
}
```

---

## Source-specific mutation result

After a successful domain command:

```text
domain event
→ Project/workflow resolver
→ ClientAction resolver
→ media detail projection
```

updates Design 066.

Frontend does not manually synchronize multiple status fields.

---

## Deep-link integrity

Design 066 references later libraries/details using canonical typed IDs.

Phase 3B will finalize actual routes.

---

## Backend Requirement Matrix

| Requirement                                       | Status                    |
| ------------------------------------------------- | ------------------------- |
| Client Portal authentication                      | **Critical**              |
| Active Portal membership                          | **Critical**              |
| Canonical Project identity reuse                  | **Critical**              |
| Design 043 Project-detail foundation reuse        | **Critical**              |
| Design 065 collection/detail identity consistency | **Critical**              |
| `ClientMediaProjectDetail` as read model          | **Critical**              |
| Typed specialized production relations            | **Critical**              |
| Editorial specialization reuse                    | **Critical**              |
| Magazine specialization reuse                     | **Critical**              |
| Podcast specialization reuse                      | **Critical**              |
| Video specialization reuse                        | **Critical**              |
| Event specialization reuse                        | **Critical**              |
| Multi-output Project safety                       | **Required**              |
| Media detail adapter registry                     | **Critical**              |
| Internal/client production projection separation  | **Critical**              |
| Canonical Project status mapping                  | **Critical**              |
| Canonical progress resolver                       | **Critical**              |
| Progress/readiness separation                     | **Critical**              |
| Design 048 Questionnaire reuse                    | **Critical**              |
| Exact QuestionnaireVersion/Assignment             | **Critical**              |
| Design 049 Draft review reuse                     | **Critical**              |
| Exact Client-released DraftVersion                | **Critical**              |
| Design 050 Proof review reuse                     | **Critical**              |
| Exact Client-released ProofVersion                | **Critical**              |
| Design 052 Approval reuse                         | **Critical**              |
| Review/Approval separation                        | **Critical**              |
| Design 030 Asset reuse                            | **Critical**              |
| Design 051 Deliverable reuse                      | **Critical**              |
| Asset/Deliverable separation                      | **Critical**              |
| Design 031 Publication reuse                      | **Critical**              |
| Design 032 Distribution reuse                     | **Critical**              |
| Verified-live semantics                           | **Critical**              |
| Design 056 Report reuse                           | **Required where shown**  |
| Design 047 ClientAction reuse                     | **Critical**              |
| Action/source-state separation                    | **Critical**              |
| Conversation/Meeting reuse                        | **Required where shown**  |
| Section-level authorization                       | **Critical**              |
| Project/subresource permission separation         | **Critical**              |
| Direct-resource-ID reauthorization                | **Critical**              |
| Cross-tenant validation                           | **Critical**              |
| Client-safe version filtering                     | **Critical**              |
| Source-file restriction                           | **Critical**              |
| Permission-safe caching                           | **Critical**              |
| Batched composition / N+1 prevention              | **Critical**              |
| Partial service degradation                       | **Critical**              |
| Critical-action unknown-state handling            | **Critical**              |
| Event-driven invalidation                         | **Required**              |
| Replayable/materializable projection              | **Required architecture** |
| Canonical source-specific mutations only          | **Critical**              |
| Designs 067–069 future library reuse              | **Critical architecture** |

---

# 8. Consolidation

Design 066 exposes several major implementation risks.

**Project / ClientMediaProjectDetail conflation**
The read model becomes a second editable Project.

**066 / 043 duplicate Project 360**
Generic and media details independently model Project status/access.

**065 / 066 identity drift**
Media collection card and detail resolve different specialized entities.

**Project / specialized production conflation**
Magazine/Podcast/Video/Event identity disappears into Project.

**One Project / one media output assumption**
Bundled/multi-output engagements become impossible.

**Generic media mega-record**
Every specialized field is placed into one nullable Project table.

**Media adapter / business service conflation**
Projection adapter starts approving/publishing/mutating production.

**Workflow / media production state conflation**
Project stage and specialized production stage become one enum.

**Progress / workflow-stage conflation**
Detail calculates fake percentages from stage position.

**Progress / readiness conflation**
High percentage means publishable.

**Questionnaire / Project stage conflation**
Submitted response directly edits Project state from frontend.

**QuestionnaireAssignment / response conflation**
No exact issued Questionnaire/version remains.

**Latest Draft / Client-released Draft conflation**
Internal unreleased content leaks.

**Draft / DraftVersion conflation**
Review history cannot bind to immutable content.

**Draft review / Approval conflation**
Feedback completion becomes formal approval.

**Latest Proof / Client-visible Proof conflation**
Internal design iteration appears in Portal.

**Proof / ProofVersion conflation**
Annotations lose exact version binding.

**Proof comment / ApprovalDecision conflation**
“Looks good” becomes formal approval.

**Approval / Project lifecycle conflation**
Client Approval directly patches Project stage.

**Asset / Deliverable conflation**
Every file becomes a final Client deliverable.

**Project file visibility / source download conflation**
Raw source files leak.

**Deliverable / Publication conflation**
Sending a file to Client means it is publicly published.

**Production-ready / published conflation**
Media appears live too early.

**Scheduled / published conflation**
Future publication shown as completed.

**Provider accepted / verified-live conflation**
API response becomes proof of live placement.

**Publication / Distribution conflation**
Primary release and downstream delivery use one status.

**Distribution complete / Project complete conflation**
Channel delivery automatically closes Project.

**Report released / Project completed conflation**
Final report state overwrites Project state.

**ClientAction / Project status conflation**
“Approval required” becomes lifecycle enum.

**Notification / ClientAction conflation**
Unread notification determines action requirement.

**Action resolver failure / no-action conflation**
Client misses required work during service outage.

**Project access / Questionnaire access conflation**
Any Project viewer can answer a Questionnaire.

**Project access / Draft review conflation**
Any Project viewer sees confidential Drafts.

**Project access / Proof approval conflation**
Any viewer becomes Approver.

**Project access / file download conflation**
Any viewer can download final/source files.

**Project access / Contract/Finance conflation**
Media detail leaks commercial records.

**Project access / Conversation access conflation**
Any Project member sees every Message thread.

**Hidden section / security conflation**
Sensitive data is delivered then hidden in React.

**Direct subresource ID bypass**
User guesses Draft/Proof/File IDs.

**Representative visual / current review artifact conflation**
Hero artwork is mistaken for the current ProofVersion.

**One section failure / whole-detail failure**
Report or Publishing outage makes entire Project inaccessible.

**Unknown progress / zero conflation**
Missing data becomes 0%.

**Publication unavailable / unpublished conflation**
Provider/service outage becomes false “not published.”

**N+1 composition**
Media detail performs uncontrolled downstream queries.

**Stale composite read model**
Approval says complete while action still says pending.

**Projection cache / permission conflation**
Admin-level payload leaks to restricted membership.

**Materialized projection / source truth conflation**
Cached detail gets manually updated independently.

**Generic media PATCH**
One Client endpoint modifies Questionnaire, Approval, Project, Deliverable and Publication simultaneously.

**066/067 duplicate Questionnaire domain**
Detail creates custom Questionnaire state instead of using library/workflow backend.

**066/068 duplicate Draft domain**
Detail stores latest Draft itself.

**066/069 duplicate Proof domain**
Detail creates its own proof/review model.

**066/072–073 duplicate release engines**
Media detail creates separate Publishing/Distribution state.

No new screen is required.

These are **Project identity, specialized production, version-specific artifact, compositional authorization, Client action, publication, and cross-domain read-model requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT MEDIA PROJECT SPECIALIZED DETAIL & CROSS-DOMAIN DELIVERY COMPOSITION ANCHOR**

**Domain directive:**
**Project ≠ ClientMediaProjectDetail ≠ SpecializedProductionEntity ≠ Workflow/Progress ≠ Questionnaire ≠ DraftVersion ≠ ProofVersion ≠ Deliverable ≠ Publication ≠ Distribution ≠ ClientAction.**

**Project directive:**
Design 023 remains the single canonical Project identity. Design 066 is never another Project 360 database.

**Generic-detail directive:**
Design 043 remains the canonical Client Project detail/access/status foundation. Design 066 specializes that foundation for media-production context.

**Collection directive:**
Design 065 and Design 066 must use the same Project and typed specialized-resource lineage so collection/detail identity cannot drift.

**Projection directive:**
`ClientMediaProjectDetailView` is an authorization-aware cross-domain read model composed from canonical sources rather than an independently editable entity.

**Specialization directive:**
Designs 024–028 remain authoritative for Editorial, Magazine, Podcast, Video and Event production. Design 066 uses typed adapters to expose only deliberate Client-safe data.

**Cardinality directive:**
the architecture must tolerate Projects with one or multiple specialized media outputs rather than assuming Project ID equals one MagazineIssue/Episode/Video/Event.

**Workflow directive:**
Project workflow, specialized-production lifecycle and Client-facing media status remain distinguishable. Internal production stages are never copied directly into Portal status.

**Progress directive:**
Design 066 reuses the canonical Project/client progress resolver; no arbitrary stage-count percentages or media-local progress truth.

**Questionnaire directive:**
QuestionnaireDefinition, exact QuestionnaireVersion, Assignment and Response remain the Design 048/067 domain. Project detail only summarizes/links them.

**Draft directive:**
only deliberately Client-released exact DraftVersions may appear. “Latest internal Draft” must never be resolved implicitly.

**Proof directive:**
visual review always references exact Client-released ProofVersion and ReviewSession. New internal versions never silently replace the version under Client review.

**Approval directive:**
Review feedback and formal ApprovalDecision remain separate. Approval binds exact artifact version and never becomes a generic media status mutation.

**Deliverable directive:**
Designs 030/051 remain authoritative for Asset/FileVersion/Deliverable. Client detail only lists explicitly released, authorized deliverables.

**Publishing directive:**
Design 031 remains source truth for scheduled, attempted, published and verified-live state. Production readiness never means published.

**Distribution directive:**
Design 032 remains source truth for Campaign, ChannelExecution, Placement and Verification. Publication and Distribution remain separate.

**Reporting directive:**
any report shown references an exact final/released ReportVersion from Design 056 rather than live operational analytics.

**Action directive:**
Design 047's `ClientActionResolver` determines what currently requires this user's attention. Design 066 never stores its own action truth.

**Messaging/meeting directive:**
Conversations and Meetings remain Designs 045/046 domains; Project/media access does not automatically expose every thread or meeting.

**Authorization directive:**
Project access is only the first gate. Questionnaire, Draft, Proof, Approval, Deliverable, Report, Conversation, Contract, Finance and Publication resources retain their own server-side authorization.

**Mutation directive:**
Design 066 uses narrow canonical source commands where frozen Client actions exist. A generic media-Project PATCH capable of changing multiple domains is prohibited.

**Failure directive:**
Project core, specialized production, review artifacts, Publication, Reports and ClientAction enrichments degrade independently. Unknown action/progress/release state must never become false negative business state.

**Performance directive:**
composition should use batched/adapted queries or a replayable permission-aware read model rather than uncontrolled cross-domain N+1 requests.

**Cache directive:**
any materialized/cache-backed Client media detail remains source-derived and membership/entitlement-aware; it is never canonical business ownership.

**Responsive directive:**
desktop gives rich media delivery context while remaining Client-safe; mobile prioritizes media identity → status/progress → current action → review artifacts → deliverables → publication/distribution.

**Overlap directive:**
Designs **023–032, 043–056 and 065–073** must ultimately consume one canonical Project + specialized-production + Questionnaire + Draft + Proof + Approval + Asset/Deliverable + Publication/Distribution + ClientAction foundation through specialized Client-safe projections.

**Consolidation directive:**
**STANDARDIZE ONE CLIENT MEDIA DETAIL COMPOSITION LAYER — CANONICAL PROJECT + DESIGN 043 PROJECT ACCESS/STATUS + TYPED DESIGNS 024–028 PRODUCTION ADAPTERS + EXACT QUESTIONNAIRE/DRAFT/PROOF VERSIONS + CANONICAL APPROVAL + CLIENT-RELEASED DELIVERABLES + PUBLICATION/DISTRIBUTION + CLIENT ACTION RESOLUTION — AND DO NOT CREATE A SECOND MEDIA PROJECT 360, SECOND ARTIFACT WORKFLOW, OR GENERIC CROSS-DOMAIN MUTATION BACKEND.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **66 / 153** |
| **PASS**                                   |                         **66** |
| **STANDARDIZE decisions**                  |                         **64** |
| **Potential implementation-overlap flags** |                         **57** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**66 / 153 = 43.1% audited.**

### Canonical Client media-detail architecture after Design 066

```text
                         PROJECT
                       Design 023
                           │
                           ↓
                CLIENT PROJECT FOUNDATION
                      Design 043
                           │
                           ↓
                  MEDIA DETAIL COMPOSER
                           │
        ┌──────────────────┼──────────────────┐
        ↓                  ↓                  ↓
 Specialized Media      Progress          Client Action
 Designs 024–028        Design 044          Design 047
        │
        ├── Questionnaire ───── 048 / 067
        ├── DraftVersion ────── 049 / 068
        ├── ProofVersion ────── 050 / 069
        ├── Approval ────────── 052
        ├── Deliverable ─────── 030 / 051
        ├── Publication ─────── 031 / 072
        ├── Distribution ────── 032 / 073
        └── Report ──────────── 033 / 056
                           │
                           ↓
             ClientMediaProjectDetailView
                           │
                           ↓
                      DESIGN 066
```

The critical identity chain is:

```text
Design 065 Media Summary
        ↓
canonical Project ID
+
typed specialized-resource reference
        ↓
Design 066 Media Detail
        ↓
same canonical domains
```

No duplicate Project, media-production, Draft, Proof, Deliverable, Publication, or action state is introduced.

# Next Sequential Audit Target

## **Design 067 — Client Questionnaires Library**

Its frozen identity and supplied route annotation **`/client/questionnaires`** are already locked.

The next audit must preserve the questionnaire-library boundary:

> **QuestionnaireDefinition ≠ QuestionnaireVersion ≠ QuestionnaireAssignment ≠ QuestionnaireResponse ≠ ResponseRevision ≠ LibraryEntry/Projection ≠ ClientAction ≠ Project.**

It must reconcile **Design 048’s canonical Client Questionnaire completion workflow** with this broader cross-Project library/discovery surface while preserving:

* exact assigned QuestionnaireVersion,
* Assignment ≠ Response,
* Draft response ≠ submitted response ≠ accepted response,
* reusable Definition ≠ Project-specific Assignment,
* Client Action is a projection of current obligation rather than Questionnaire truth,
* no second Questionnaire backend for the library.

After Design 067 we continue strictly:

**068 Client Drafts Library → 069 Client Designs / Proofs Library → 070 Client Contract Detail & Digital Signing → 071 Client Invoice / Payment Detail → … → 077 Client Access Recovery**

with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
