Verified from the frozen design asset: the exact page title is **“Podcast Production Workspace.”** The approved design contains episode/show context, guest/host/producer roles, recording details, talking points, audio, transcript, internal review, guest review, approvals, clips, publishing, distribution, files, tasks and activity. The underlying frozen architecture also defines podcast production as a distinct product-specific delivery domain under the common Project/workflow system.

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 026 — Podcast Production Workspace

| Audit field                    | Classification                                                                                                                                                                                       |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                  | **026**                                                                                                                                                                                              |
| **Canonical name**             | **Podcast Production Workspace**                                                                                                                                                                     |
| **Product area**               | Podcast / Media Production / Project Delivery                                                                                                                                                        |
| **User surface**               | Team Workspace                                                                                                                                                                                       |
| **Screen class**               | Product-Specific Production 360 Workspace                                                                                                                                                            |
| **Classification**             | **Unique Anchor — Podcast Production Workspace Family**                                                                                                                                              |
| **Primary purpose**            | Coordinate one podcast episode from guest onboarding and editorial preparation through scheduling, recording, editing, transcript, review, guest approval, clips, metadata and publication readiness |
| **Primary execution entity**   | **PodcastEpisode**                                                                                                                                                                                   |
| **Parent business entity**     | **Project** — Design 023                                                                                                                                                                             |
| **Core child entities**        | PodcastGuestAssignment, RecordingSession, RecordingAsset, EpisodeEdit, EpisodeEditVersion, Transcript, ShowNotes, PodcastClip                                                                        |
| **Shared supporting entities** | Contact, Client, Meeting, Task, File/Asset, Review, ApprovalRequest, Publication, DistributionCampaign, Activity                                                                                     |
| **Parent shell**               | `InternalAppShell` — Design 001                                                                                                                                                                      |
| **Template family**            | `ProductExecutionWorkspaceTemplate`                                                                                                                                                                  |
| **Composition**                | `PodcastProductionComposition`                                                                                                                                                                       |
| **Auth**                       | Required                                                                                                                                                                                             |
| **Implementation priority**    | **Core / Critical**                                                                                                                                                                                  |
| **Reuse level**                | **Extremely High for Podcast and time-based media production**                                                                                                                                       |

---

# 1. Functional responsibility

Design 026 answers:

> **“For this specific podcast episode, who is participating, what has been prepared, when and how was it recorded, which media version is currently authoritative, what is awaiting internal or guest review, what derivative assets remain, and is the episode actually ready for publication?”**

The hierarchy is:

```text
PROJECT
Design 023
   ↓
PODCAST EPISODE / WORKSTREAM
Design 026
   │
   ├── Guest
   ├── Brief
   ├── Talking Points
   ├── Schedule
   ├── Recording
   ├── Audio / Video
   ├── Transcript
   ├── Internal Review
   ├── Guest Review
   ├── Approval
   ├── Clips
   ├── Artwork
   └── Publication Readiness
   ↓
PUBLISHING
   ↓
DISTRIBUTION
```

The central rule is:

> **Project ≠ PodcastEpisode ≠ RecordingSession ≠ MediaVersion ≠ Publication.**

---

# 2. Project ≠ Podcast Episode

Design 023 remains the generic delivery umbrella.

Design 026 represents one specialized podcast deliverable.

Correct:

```text
Project
   ↓
PodcastEpisode
```

Do not fill the generic `Project` entity with fields such as:

```text
recordingDuration
guestApproval
audioEditVersion
podcastTranscript
clipCount
```

Those belong to the Podcast domain.

---

# 3. Show ≠ Episode

The approved design contains both a **Show/Series** and a specific **Episode**.

These must remain distinct.

```text
PodcastShow
│
├── Episode 10
├── Episode 11
├── Episode 12
└── Episode 13
```

The Show owns reusable identity such as:

* title,
* artwork,
* description,
* branding,
* default publishing context.

The Episode owns:

* topic,
* participants,
* schedule,
* recording,
* edits,
* transcript,
* review,
* publication metadata.

---

# 4. Client ≠ Guest

A Client may sponsor/commission or own the Project.

A Guest is a participant in the Episode.

Example:

```text
Client:
NextPay Technologies

Guest:
Arjun Mehta
```

The Guest may be a Contact belonging to the Client, but their podcast participation is an episode-specific relationship.

---

# 5. Contact ≠ PodcastGuestAssignment

A canonical Contact may participate in multiple episodes.

Therefore the relationship should conceptually look like:

```text
Contact
   ↓
PodcastGuestAssignment
   ↓
PodcastEpisode
```

The assignment can hold episode-specific information such as:

* participation role,
* confirmation state,
* bio/assets readiness,
* guest review responsibility.

Do not duplicate the Contact simply because they became a podcast guest.

---

# 6. Guest onboarding ≠ Client onboarding

Design 022 established Client onboarding.

Podcast guest onboarding is much narrower.

It may cover:

* guest confirmation,
* biography,
* headshot,
* topic confirmation,
* talking points,
* recording requirements.

Therefore:

```text
ClientOnboarding
≠
PodcastGuestOnboarding
```

They may reuse checklist primitives but remain separate workflows.

---

# 7. Guest confirmation ≠ recording readiness

Example:

```text
Guest:
CONFIRMED

Recording Readiness:
NOT READY

Missing:
approved talking points
```

A confirmed guest does not mean all technical/editorial prerequisites have been completed.

---

# 8. Talking points need canonical versioning where material

Talking points are not just temporary UI text.

They can become the agreed editorial source for the recording.

A useful conceptual relationship is:

```text
PodcastEpisode
   ↓
TalkingPoints
   ↓
TalkingPointsVersion
```

where meaningful revisions need preservation.

Exact version semantics belong to Phase 3D.

---

# 9. Talking points approved ≠ recording completed

These are independent states.

```text
Talking Points:
APPROVED

Recording:
NOT_STARTED
```

is valid.

Likewise:

```text
Recording:
COMPLETED

Talking Points:
historical approved version
```

The production workspace should summarize these domains rather than collapsing them into one `episode.status`.

---

# 10. Schedule ≠ Recording Session

A calendar booking represents the intended recording appointment.

A RecordingSession represents the actual media-production event.

Conceptually:

```text
Meeting / Calendar Event
        ↓
RecordingSession
```

The two may be linked, but they are not identical.

---

# 11. Reuse the canonical Meeting/Calendar infrastructure

Design 015 already established Meeting architecture.

Podcast scheduling should reuse:

```text
Meeting / Calendar Service
```

for:

* scheduling,
* participants,
* timezone,
* rescheduling.

Podcast-specific technical fields can live in `RecordingSession`.

---

# 12. Recording Session

A canonical RecordingSession should conceptually preserve:

```text
scheduledAt
startedAt
endedAt
platform/location
host
producer
technical operator
recording mode
source media references
backup state
```

The exact schema belongs to Phase 3D.

This is operational production data, not generic Meeting metadata.

---

# 13. Scheduled ≠ recorded

Permanent distinction:

```text
Recording Schedule:
COMPLETED BOOKING

Recording Session:
NOT_RECORDED
```

or:

```text
Recording Session:
COMPLETED
```

The calendar event being marked complete cannot be the sole evidence that a usable recording exists.

---

# 14. Recording ≠ recording asset

The event and the resulting files must remain separate.

```text
RecordingSession
      ↓
RecordingAssets
├── master video
├── master audio
├── backup audio
└── auxiliary tracks
```

The recording session describes what happened.

The Asset service stores the actual media.

---

# 15. Files remain canonical Assets

The approved screen lists recording, audio, transcript, show-notes and thumbnail files.

These should all use the shared File/Asset infrastructure established earlier.

Do not create:

```text
podcast.audioUrl
podcast.videoUrl
podcast.thumbnailUrl
```

as the entire production model.

Those can be projections/references, not the sole truth.

---

# 16. Source recording ≠ edited episode

The master recording should be preserved.

Editing creates derived media.

Correct:

```text
Master Recording
      ↓
Edit Version 1
      ↓
Edit Version 2
      ↓
Final Approved Edit
```

Do not destructively replace the original recording with the edited version.

---

# 17. Episode Edit ≠ EpisodeEditVersion

As with Drafts and Proofs:

```text
EpisodeEdit
│
├── v1
├── v2
├── v3
└── final approved version
```

Review and approval must reference the exact version under consideration.

---

# 18. Internal review must bind to exact media version

If:

```text
Audio Edit v2
↓
Internal Review
↓
Approved
```

and then `v3` is created:

```text
v3 ≠ automatically approved
```

This is the same immutable decision rule established for:

* DraftVersions,
* ProposalVersions,
* ContractVersions,
* ProofVersions.

---

# 19. Internal Review ≠ Guest Review

This is critical.

### Internal Review

Production/editorial quality control.

### Guest Review

External participant review where the commercial/editorial agreement permits it.

Correct:

```text
EpisodeEditVersion
      │
      ├── InternalReview
      └── GuestReview
```

Their comments and visibility must remain separate.

---

# 20. Guest Review ≠ Guest Approval

A Guest may:

* view,
* comment,
* request changes,

before making a final decision.

Therefore:

```text
Review lifecycle
≠
Approval decision
```

Use the shared Review and Approval infrastructures while preserving Podcast-specific rules.

---

# 21. Guest approval applies to exact version

Permanent rule:

```text
Guest approves Edit v3
```

does not imply approval of:

```text
Edit v4
```

after a later revision.

The approval must reference the exact version/artifact.

---

# 22. Internal comments must remain internal

Podcast production may contain comments such as:

* edit out this section,
* guest answer is weak,
* cut commercial reference,
* audio quality issue.

These must not automatically appear in the guest-facing review surface.

Backend projection must enforce:

```text
INTERNAL_ONLY
≠
GUEST_VISIBLE
```

---

# 23. Transcript ≠ Recording

A Transcript is a derived content artifact.

Conceptually:

```text
Recording / Audio Asset
        ↓
TranscriptGeneration
        ↓
Transcript
        ↓
TranscriptVersion
```

It must remain linked to the media source that generated it.

---

# 24. Generated transcript ≠ verified transcript

Automatic transcription can contain errors.

Therefore:

```text
GENERATED
≠
REVIEWED / VERIFIED
```

where verification is required for:

* captions,
* public transcript,
* quotations,
* show notes.

---

# 25. Transcript corrections need history

If the Transcript is edited meaningfully:

```text
Transcript v1
↓
Editorial corrections
↓
Transcript v2
```

should remain reconstructable if the transcript is later published or used for derivative content.

---

# 26. Transcript ≠ captions

For video podcast output:

```text
Transcript
≠
Caption/Subtitles File
```

Captions can be generated from a Transcript but have their own timing/format requirements.

Avoid treating one text blob as every textual media representation.

---

# 27. Show Notes ≠ Transcript

Likewise:

```text
Transcript
      ↓
Show Notes
```

Show Notes are edited publication metadata/content.

They may contain:

* summary,
* timestamps,
* links,
* guest details,
* key ideas.

They require their own canonical content representation.

---

# 28. Clips ≠ Episode

The approved workspace explicitly tracks clips/social assets.

A Podcast Episode can produce multiple derivatives:

```text
Episode
├── full audio
├── full video
├── short clip 1
├── short clip 2
├── quote clip
└── social teaser
```

Each derivative should reference the source episode/version.

---

# 29. PodcastClip needs lineage

Conceptually:

```text
PodcastClip
├── episodeId
├── sourceEditVersionId
├── startTime
├── endTime
├── mediaAsset
├── caption/metadata
└── production state
```

Exact schema is Phase 3D.

This allows the platform to know which master edit a clip was cut from.

---

# 30. Clip completion ≠ Episode publication readiness

The approved screen tracks Clips independently.

Depending on Product configuration:

```text
Episode Edit Approved
```

might be enough for publishing while some optional clips continue afterward.

Or clips may be mandatory.

Therefore the rule belongs to Publication Readiness policy.

Do not hard-code:

```text
clips === 8
→ ready
```

inside the UI.

---

# 31. Artwork / Thumbnail is a separate creative asset

Episode artwork should use the same versioned visual-production principles as magazine cover/proof assets.

```text
EpisodeArtwork
   ↓
ArtworkVersion(s)
```

where review/approval is required.

A single mutable `thumbnailUrl` is insufficient for professional production history.

---

# 32. Publication metadata ≠ production status

Fields such as:

* episode title,
* description,
* show notes,
* tags,
* artwork,
* release date,
* destinations,

constitute publishing metadata.

They do not themselves represent the Episode's production lifecycle.

---

# 33. Production Stage ≠ Publication state

Example:

```text
Production:
READY

Publication:
SCHEDULED
```

or:

```text
Production:
COMPLETED

Publication:
PUBLISHED
```

These remain separate.

Design 026 hands off a ready Episode to the canonical Publishing domain.

---

# 34. Published ≠ distributed

Likewise:

```text
Podcast Publication:
PUBLISHED
```

does not prove distribution to:

* Spotify,
* Apple Podcasts,
* YouTube,
* website,
* social channels.

Distribution remains a separate canonical domain.

---

# 35. Publication readiness

A canonical readiness service should evaluate mandatory conditions.

Conceptually:

```text
PodcastPublicationReadiness
├── guest confirmed
├── required assets complete
├── recording complete
├── approved edit version
├── transcript/captions ready if required
├── guest approval satisfied if required
├── artwork ready
├── show notes ready
└── metadata complete
```

This should be policy/configuration-driven.

---

# 36. Progress ≠ readiness

The frozen design contains both overall progress and several detailed production statuses.

Correct:

```text
Overall Progress:
82%

Publication Readiness:
NOT READY

Reason:
Guest approval pending
```

One missing mandatory gate can prevent release even at high progress.

---

# 37. Checklist ≠ canonical truth

The frozen screen includes a Production Checklist.

That checklist should not become a second truth database.

Example:

> Recording completed

should derive from:

```text
RecordingSession / RecordingAsset
```

where possible.

> Guest approved

should derive from:

```text
ApprovalRequest
```

The checklist is an operational projection over real records.

---

# 38. Manual checklist items remain first-class only when necessary

Some items may have no stronger source record.

Those can remain persisted workflow Steps.

But whenever an authoritative service exists, reuse it.

This keeps Design 026 from becoming a giant collection of redundant booleans.

---

# 39. Roles

The frozen design distinguishes:

**Guest**
**Host**
**Producer**
**Technical production/editor roles**
**Project Owner**

These are contextual roles.

Do not reduce the Episode to one `ownerId`.

---

# 40. Host ≠ Producer ≠ Editor

Examples:

```text
Host:
Sarah

Producer:
Emma

Editor:
David
```

These users have different responsibilities and potentially different permissions.

Episode-role assignments should be explicit.

---

# 41. Account Manager ≠ Podcast Producer

As established elsewhere:

* Account Manager owns the Client relationship.
* Podcast Producer owns the media-production process.

Both may be associated with the same Project but have different authority.

---

# 42. Reuse canonical Tasks

The approved design includes Tasks.

Podcast production Tasks should use the shared Task service.

Examples:

* clean audio,
* verify transcript,
* produce five clips,
* create thumbnail.

No separate podcast checklist/task engine should be built.

---

# 43. Milestones ≠ Tasks

The frozen screen also surfaces deadlines/milestones such as:

* Recording Complete,
* Internal Review Deadline,
* Guest Review Deadline,
* Publication Ready,
* Publish Episode.

These are delivery checkpoints rather than ordinary Tasks.

Reuse Project milestone infrastructure.

---

# 44. Next Action

Design 026 should derive a canonical next operational action.

Potential candidates:

```text
Upcoming Recording
Overdue edit
Internal Review
Guest Review
Missing Asset
Approval
Publication gate
```

A `PodcastNextActionResolver` can operate over canonical domain state.

Do not maintain unrelated manual “next action” text.

---

# 45. Relationship to Design 023

The separation remains:

### Design 023 — Project 360

Cross-domain delivery overview.

### Design 026 — Podcast Production Workspace

Deep Podcast-specific execution.

Correct:

```text
Project 360
   ↓
Podcast workstream
   ↓
Podcast Production Workspace
```

**DO NOT MERGE.**

---

# 46. Relationship to Design 024

Podcast production can reuse editorial concepts, but it is not an EditorialProject.

Shared primitives can include:

* version history,
* review,
* approval,
* comments,
* assets,
* readiness.

But:

```text
Editorial Draft Workflow
≠
Podcast Media Workflow
```

---

# 47. Relationship to Design 025

Designs 025 and 026 now establish the clearest evidence for a shared product-production architecture:

```text
ProductExecutionWorkspaceTemplate
│
├── Editorial Production — 024
├── Magazine Production — 025
└── Podcast Production — 026
```

Shared structural components:

* production header,
* progress,
* workflow,
* tasks,
* files,
* reviews,
* approvals,
* activity,
* readiness.

Domain engines remain separate.

---

# 48. Reusable Podcast components

Design 026 should establish/reuse:

`ProductionWorkspaceHeader`
`EpisodeSummaryCard`
`PodcastProductionStageTracker`
`GuestSummaryCard`
`RecordingDetailsCard`
`RecordingReadinessCard`
`TalkingPointsPanel`
`MediaVersionSelector`
`AudioReviewPlayer`
`TranscriptStatus`
`GuestReviewPanel`
`PodcastApprovalPanel`
`ClipProductionSummary`
`ArtworkStatusCard`
`PodcastReadinessCard`
`ProductionChecklist`

Shared primitives come from Designs 015, 017, 022–025 and 153.

---

# 49. Time-coded comments

Audio/video review introduces a reusable media-specific requirement:

```text
MediaComment
├── mediaVersionId
├── timestamp/timeRange
├── author
├── body
├── visibility
└── resolutionState
```

This is different from ordinary document comments because feedback must often reference a specific playback position.

---

# 50. Time-coded comments must bind to exact media version

If an editor comments:

> “Remove this sentence at 18:42”

that reference applies to:

```text
Edit v3
```

not automatically to v4 where timing may have shifted.

This version association is critical.

---

# 51. Media processing should be asynchronous

Large operations such as:

* uploading recordings,
* transcoding,
* waveform generation,
* transcript generation,
* clip rendering,

must not depend on one browser request remaining open.

Use background jobs/workers with persisted states.

---

# 52. Processing state ≠ media readiness

Example:

```text
Upload:
COMPLETE

Transcode:
PROCESSING

Media Review Readiness:
NOT_READY
```

Do not mark a recording ready merely because upload completed.

---

# 53. Media job failure

If waveform/transcoding/transcript generation fails:

the canonical source recording should remain safe.

Correct:

```text
Recording Asset       ✓
Transcode Job         ✕
Episode record        ✓
```

Expose targeted retry/degraded state.

Do not require re-creating the Podcast Episode.

---

# 54. Provider integration boundary

The frozen reference mentions a recording platform context.

Whether the implementation uses Riverside, Zoom or another provider, architecture should remain:

```text
Podcast Domain
      ↓
Recording Integration Adapter
      ↓
External provider
```

Provider IDs remain integration metadata—not canonical Episode identity.

---

# 55. Permissions

Potential capability dimensions later include:

```text
podcast.read
podcast.edit
podcast.assign
podcast.move_stage

podcast.schedule.manage
podcast.recording.manage
podcast.edit_version.manage
podcast.transcript.edit
podcast.review.perform
podcast.guest_review.request
podcast.approval.manage
podcast.clip.manage
podcast.mark_ready
```

Exact names belong to Phase 3D.

---

# 56. Production edit ≠ approval ≠ publishing

A user permitted to upload/edit media should not automatically receive authority to:

* approve it,
* mark it publication-ready,
* publish it.

These are independently protected operations.

---

# 57. Guest permissions

External Guest access, where approved, should be tightly limited to relevant Episode material such as:

* brief/talking points,
* requested assets,
* frozen review version,
* comments,
* approval.

They must not receive:

* internal notes,
* production costs,
* internal review comments,
* employee performance,
* unrelated Client data.

---

# 58. Guest review is not raw Team Workspace access

The external participant should receive a dedicated client/guest-safe projection.

Never expose the internal Podcast workspace directly through permission flags alone.

---

# 59. Concurrency

Podcast production is highly collaborative.

Example:

```text
Producer updates Episode metadata
Editor uploads Edit v3
Transcript reviewer corrects transcript
AM requests Guest Review
```

These operations must use domain-specific commands.

Never save one enormous Podcast workspace object that overwrites parallel work.

---

# 60. Review race

Example:

```text
Guest reviewing Edit v3
        ↓
Editor creates v4
```

The review remains attached to v3.

The UI can indicate:

> A newer version exists.

It must never silently move the guest's comments/approval onto v4.

---

# 61. Idempotency

Important operations requiring idempotency include:

* recording import webhook,
* media processing completion,
* transcript generation callbacks,
* guest approval submission,
* publication handoff.

Duplicate provider events must not create duplicate media/version/activity records.

---

# 62. Partial failure

Example:

```text
Episode core        ✓
Recording files     ✓
Transcript          ✕
Reviews             ✓
Approvals           ✓
Publishing summary  ✓
```

The whole workspace stays operational.

Only Transcript-dependent areas should degrade.

---

# 63. Unknown ≠ incomplete

If the transcript service is unavailable:

do not show:

> Transcript 0%

as though no work exists.

Show a service-unavailable/unknown state.

This is the same Design 150 reliability rule applied throughout previous audits.

---

# 64. Responsive — Desktop

Desktop should preserve the approved dense production composition:

**episode identity → participants → production statuses → workflow → recording details → content/edit status → files → milestones → checklist → quick actions.**

Time-based media review is naturally desktop-first.

---

# 65. Responsive — Tablet

Following Design 152:

* summary cards reflow,
* tabs become horizontally scrollable,
* audio/media player remains prominent,
* transcript/review panels become drawers or stacked regions,
* checklists and milestones stack.

Touch interactions cannot rely on hover.

---

# 66. Responsive — Mobile

Following Design 151, prioritize:

```text
Episode Identity
↓
Current Stage / Progress
↓
Recording Date / Status
↓
Next Action
↓
Guest / Host
↓
Critical Review / Approval
↓
Media Status
↓
Transcript
↓
Tasks / Milestones
↓
Publication Readiness
```

Do not attempt to shrink the entire desktop production board.

---

# 67. Mobile actions

Important mobile actions can remain:

* join/open recording session,
* upload asset,
* comment on review,
* approve/request changes,
* complete Task,
* check milestone,
* update permitted status.

Full media editing remains desktop/specialized-tool oriented.

---

# 68. State coverage

Design 026 inherits Design 150 plus Podcast-specific states:

**Episode Loading**
**Episode Not Found**
**Pre-Production**
**Guest Not Confirmed**
**Guest Assets Missing**
**Recording Scheduled**
**Recording In Progress**
**Recording Completed**
**Recording Importing**
**Media Processing**
**Media Processing Failed**
**Editing In Progress**
**Internal Review Pending**
**Guest Review Pending**
**Changes Requested**
**Approved Edit**
**Transcript Generating**
**Transcript Needs Review**
**Clips In Progress**
**Publication Ready**
**Published downstream**
**Permission Restricted**
**Record Updated Elsewhere**
**Partial Service Failure**

Do not collapse these into one giant Episode status enum.

---

# 69. Read model

A useful composed model is:

```text
PodcastProductionView
├── Project summary
├── Show summary
├── PodcastEpisode
├── participants
├── production workflow
├── guest onboarding/readiness
├── talking points
├── recording schedule/session
├── recording assets
├── current edit/version
├── transcript
├── internal review
├── guest review
├── approvals
├── clips
├── artwork
├── publication readiness
├── tasks/milestones
└── activity
```

This is a read composition.

It must not become one universal mutation payload.

---

# 70. Backend architecture

Recommended structure:

```text
Podcast Production UI
        ↓
PodcastProductionQueryService
        ↓
Tenant + Permission Scope
        ↓
Podcast Domain
        │
        ├── Show
        ├── Episode
        ├── Participant Assignments
        ├── Recording Session
        ├── Edit / Media Versions
        ├── Transcript
        ├── Show Notes
        ├── Clips
        └── Artwork
        │
        ├── Project / Workflow Service
        ├── Calendar / Meeting Service
        ├── File / Asset Service
        ├── Media Processing Jobs
        ├── Review Service
        ├── Approval Service
        ├── Task Service
        ├── Publishing Service
        └── Distribution Service
```

---

# 71. Backend requirements

| Requirement                             | Status       |
| --------------------------------------- | ------------ |
| Authentication                          | **Required** |
| Tenant isolation                        | **Critical** |
| Podcast/project RBAC                    | **Critical** |
| Canonical PodcastEpisode entity         | **Critical** |
| PodcastShow/Episode separation          | **Critical** |
| Project linkage                         | **Critical** |
| Guest/participant relationship model    | **Required** |
| Guest onboarding/readiness              | **Required** |
| Calendar/Meeting integration            | **Critical** |
| RecordingSession model                  | **Critical** |
| Canonical File/Asset integration        | **Critical** |
| Immutable master recording preservation | **Critical** |
| EpisodeEdit/EditVersion model           | **Critical** |
| Version-specific reviews                | **Critical** |
| Internal vs Guest review separation     | **Critical** |
| Version-specific approval               | **Critical** |
| Transcript + provenance                 | **Required** |
| Media processing jobs                   | **Critical** |
| Time-coded comments                     | **Required** |
| PodcastClip lineage                     | **Required** |
| Artwork/version support                 | **Required** |
| Publication readiness service           | **Critical** |
| Publishing handoff                      | **Critical** |
| Distribution linkage                    | **Required** |
| Concurrency protection                  | **Critical** |
| Idempotent provider/job events          | **Critical** |
| Client/guest-safe projection            | **Critical** |
| Partial failure handling                | **Required** |
| Activity history                        | **Required** |
| Audit history                           | **Required** |

---

# 72. Canonical Podcast metrics

Definitions should be shared across Podcast production, Project 360, Operations and reporting:

**Episodes In Production**
**Recording Ready**
**Editing Progress**
**Episodes Awaiting Internal Review**
**Episodes Awaiting Guest Review**
**Publication Ready Episodes**
**Average Production Time**
**Guest Wait Time**
**Internal Production Time**
**Clip Completion**
**On-Time Publication**

No page-local formulas.

---

# 73. Main implementation risks

The Design 026 audit flags:

**Project/Episode conflation**
Podcast-specific production fields polluting generic Project.

**Show/Episode conflation**
Series metadata and one episode treated as one record.

**Meeting/Recording conflation**
Calendar booking treated as evidence that usable recording exists.

**Recording/Edit conflation**
Original master media overwritten by edited outputs.

**Latest-version bug**
Review/publishing uses newest edit instead of approved exact version.

**Internal/Guest Review conflation**
Private production feedback exposed to participants.

**Transcript/Caption/Show Notes conflation**
All textual derivatives represented as one blob.

**Checklist duplicate truth**
Checkboxes contradict real Recording/Approval/Asset state.

**Progress/readiness conflation**
High completion percentage bypasses mandatory approval.

**Upload/processing conflation**
Uploaded media incorrectly considered review-ready before transcoding/processing.

**Provider coupling**
Podcast domain tied directly to one recording platform.

**Clip lineage loss**
Derivative content cannot identify source media version.

**Mega-save concurrency**
Producer/editor/reviewer changes overwrite each other.

**Publication/Distribution conflation**
Published Episode assumed distributed everywhere.

No new screen is required.

# Design 026 Audit Verdict

## **PASS — PODCAST PRODUCTION WORKSPACE ANCHOR**

**Template directive:** Design 026 becomes the canonical Podcast composition of `ProductExecutionWorkspaceTemplate`.

**Domain directive:** **Project ≠ PodcastShow ≠ PodcastEpisode ≠ RecordingSession ≠ MediaVersion ≠ Publication.**

**Identity directive:** Contacts remain canonical people; Guest/Host participation is Episode-specific relationship data.

**Scheduling directive:** Podcast recording schedules reuse Meeting/Calendar infrastructure while RecordingSession preserves actual media-production facts.

**Media directive:** Master recordings remain immutable source Assets; edits create derived versioned media rather than overwriting originals.

**Version directive:** Internal Review, Guest Review and Approval always bind to the exact EpisodeEdit/Media Version under consideration.

**Visibility directive:** Internal comments and production notes must be removed server-side from guest/client-safe review projections.

**Transcript directive:** Transcript, captions and show notes remain related but distinct content artifacts with source/version lineage.

**Derivative directive:** Podcast clips and artwork remain first-class derivative production records linked back to the canonical Episode/source version.

**Checklist directive:** The Production Checklist should project authoritative domain state wherever possible rather than create duplicate boolean truth.

**Readiness directive:** Publication readiness is policy-driven across recording, edit, approval, transcript/metadata/artwork and other mandatory requirements—not merely overall completion percentage.

**Publishing directive:** Podcast Production hands an approved exact media version to the canonical Publishing domain; Publishing and Distribution remain separate.

**Permission directive:** Media editing, review, guest-review initiation, approval, readiness and publishing authority remain independently enforceable.

**Resilience directive:** media-processing/provider outages produce localized unavailable states rather than false zero/incomplete states.

**Reuse directive:** Designs **024, 025 and 026** now formally share the `ProductExecutionWorkspaceTemplate` while keeping Editorial, Magazine and Podcast domain engines separate.

**Consolidation directive:** **STANDARDIZE PRODUCT-PRODUCTION + VERSIONED MEDIA + REVIEW + APPROVAL + READINESS INFRASTRUCTURE — DO NOT MERGE PODCAST PRODUCTION WITH PROJECT 360, GENERIC EDITORIAL, RECORDING SCHEDULE, MEDIA REVIEW, PUBLISHING OR DISTRIBUTION.**

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **26 / 153** |
| **PASS**                                   |                         **26** |
| **STANDARDIZE decisions**                  |                         **24** |
| **Potential implementation-overlap flags** |                         **17** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

### Product-specific execution family

```text
ProductExecutionWorkspaceTemplate
│
├── 024 Editorial Project / Workflow
│
├── 025 Personal Magazine Production
│
└── 026 Podcast Production
```

And the Podcast production truth chain is now:

```text
PROJECT
   ↓
PODCAST EPISODE
   ↓
GUEST + BRIEF + TALKING POINTS
   ↓
RECORDING SCHEDULE
   ↓
RECORDING SESSION
   ↓
MASTER MEDIA ASSETS
   ↓
EDIT VERSIONS
   ↓
INTERNAL REVIEW
   ↓
GUEST REVIEW / APPROVAL
   ↓
TRANSCRIPT + SHOW NOTES + ARTWORK + CLIPS
   ↓
PUBLICATION READINESS
   ↓
PUBLISHING
   ↓
DISTRIBUTION
```

# Next Sequential Audit Target

## **Phase 3A.1 — Design 027 Audit**

For Design 027, we should again retrieve its **exact frozen identity from the approved 153-design inventory first**. We should not assume it is Video Production merely because a neighboring frozen production asset exists.

Once its numbered identity is verified, we continue with the same contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no guessing, no redesign, no additional screen and no sequence change.**

