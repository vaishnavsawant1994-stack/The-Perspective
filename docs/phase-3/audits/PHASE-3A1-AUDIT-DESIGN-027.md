Verified from the frozen project record rather than inferred from the neighboring Podcast design:

**Design 027 — Video Production Workspace**

The approved visual asset independently matches that identity: its page title is **“Video Production Workspace”**, and it contains Video Type, format, aspect ratio, featured person, producer/editor/project owner, shoot date, publishing target, production workflow, script, pre-production, footage, editing, reviews, approvals, thumbnail, captions, clips, publishing, distribution, tasks and activity.  

The frozen architecture also defines Video Production as management of **brief → script → shoot → edit → client review → publish preparation**, backed by the common Project/workflow, storage, approval and publishing systems rather than an isolated Video app. 

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 027 — Video Production Workspace

| Audit field                  | Classification                                                                                                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                | **027**                                                                                                                                                                                     |
| **Canonical name**           | **Video Production Workspace**                                                                                                                                                              |
| **Product area**             | Video Studio / Media Production / Project Delivery                                                                                                                                          |
| **User surface**             | Team Workspace                                                                                                                                                                              |
| **Screen class**             | Product-Specific Production 360 Workspace                                                                                                                                                   |
| **Classification**           | **Unique Anchor — Video Production Workspace Family**                                                                                                                                       |
| **Primary purpose**          | Coordinate one Video deliverable from brief/script and pre-production through shoot, footage, editing, internal/client review, approval, thumbnail/captions/clips and publication readiness |
| **Primary execution entity** | **VideoProject / VideoProduction**                                                                                                                                                          |
| **Parent business entity**   | **Project** — Design 023                                                                                                                                                                    |
| **Core child entities**      | Script, ScriptVersion, Shoot, Shot, FootageAsset, VideoEdit, VideoVersion, CaptionTrack, Thumbnail, VideoClip                                                                               |
| **Shared entities**          | Contact, Client, User, Task, Milestone, File/Asset, Review, ApprovalRequest, Publication, DistributionCampaign, Activity                                                                    |
| **Parent shell**             | `InternalAppShell` — Design 001                                                                                                                                                             |
| **Template family**          | `ProductExecutionWorkspaceTemplate`                                                                                                                                                         |
| **Composition**              | `VideoProductionComposition`                                                                                                                                                                |
| **Auth**                     | Required                                                                                                                                                                                    |
| **Permissions**              | Project + video-production + media/review/approval/publishing scopes                                                                                                                        |
| **Implementation priority**  | **Core / Critical**                                                                                                                                                                         |
| **Reuse level**              | **Extremely High across time-based media production**                                                                                                                                       |

---

# 1. Functional responsibility

Design 027 answers:

> **“For this Video Project, what are we producing, what has been prepared and shot, which footage/edit version is authoritative, what remains under review, what is waiting on the Client, and what is still required before the exact approved video can be published?”**

The canonical chain becomes:

```text
PROJECT
Design 023
   ↓
VIDEO PRODUCTION
Design 027
   │
   ├── Brief
   ├── Script
   ├── Pre-Production
   ├── Shoot
   ├── Footage
   ├── Edit Versions
   ├── Internal Review
   ├── Client Review
   ├── Approval
   ├── Thumbnail
   ├── Captions
   ├── Clips
   └── Publication Readiness
   ↓
PUBLISHING
   ↓
DISTRIBUTION
```

The frozen UI itself exposes essentially this exact production structure through its tabs. 

---

# 2. Project ≠ VideoProject

Design 023 remains the common business/delivery umbrella.

Design 027 owns the Video-specific production state.

Correct:

```text
Project
   ↓
VideoProject / VideoProduction
```

Avoid polluting generic Project with fields such as:

```text
project.shotListCompleted
project.colorGradePercent
project.thumbnailApproved
project.captionFile
project.roughCutVersion
```

Those belong to the Video domain.

---

# 3. VideoProject ≠ Publication

A finished Video can exist before release.

Example:

```text
Video Production:
READY

Publication:
SCHEDULED
```

Therefore:

**production complete ≠ published**

and:

**published ≠ distributed**.

Publishing and Distribution remain canonical downstream domains.

---

# 4. Video Production is another ProductExecution composition

We can now extend the architecture discovered in Designs 024–026:

```text
ProductExecutionWorkspaceTemplate
│
├── 024 Editorial Production
├── 025 Magazine Production
├── 026 Podcast Production
└── 027 Video Production
```

These screens should share:

* production headers,
* workflow/stage summaries,
* progress,
* tasks,
* files,
* reviews,
* approvals,
* activity,
* readiness components.

They should **not** share one generic production database.

---

# 5. Video workflow must use the common Workflow Engine

The approved design shows a production sequence including:

**Idea / Brief → Guest Confirmed → Script → Pre-Production → Shoot Scheduled → Shoot / Recording → Editing → Internal Review → Client Review → Client Approved → Thumbnail Ready → Metadata Ready → Publication Ready → Published → Clips Created → Distributed → Completed.** 

This must become configuration/runtime workflow data.

Do not scatter:

```ts
if (stage === "Editing") ...
```

across frontend components.

The wider architecture already mandates **one workflow engine** for product-specific workflows. 

---

# 6. Production stage ≠ Project status

Example:

```text
Project Status:
ACTIVE

Video Stage:
EDITING
```

is valid.

Likewise:

```text
Project Status:
ACTIVE

Video Stage:
CLIENT_REVIEW
```

The generic Project lifecycle must not be overloaded with Video production terminology.

---

# 7. Stage ≠ Health ≠ Progress

The approved Video screen separately exposes:

* overall progress,
* production workflow,
* content/production status,
* production health,
* key dates,
* task status. 

Therefore this is legitimate:

```text
Stage: EDITING
Progress: 58%
Health: AT_RISK
Priority: HIGH
```

These are separate dimensions.

---

# 8. Production Health needs a real formula

The visual contains a Production Health score with Schedule, Budget, Quality, Team Performance and Risk. 

These values must eventually have canonical definitions.

Avoid decorative precision such as:

> Quality 90%

unless the system can explain what generated that number.

Phase 3D should define whether each score is:

* deterministic,
* weighted,
* source-backed,
* or only a qualitative state.

---

# 9. Brief ≠ Script

### Brief

Defines the intended Video:

* purpose,
* audience,
* topic,
* format,
* objectives.

### Script

Defines the actual spoken/visual content plan.

```text
VideoProject
├── Brief
└── Script
```

Do not collapse them into one arbitrary `description` field.

---

# 10. Script should support meaningful versioning

The approved production workspace explicitly includes a Script stage/tab and an **Upload Script** action. 

A professional implementation should support:

```text
Script
├── v1
├── v2
└── approved production version
```

where revisions matter.

A Shoot should know which Script Version it was prepared against.

---

# 11. Script approval must bind to exact version

Permanent rule:

```text
Script v3
APPROVED
```

does not imply:

```text
Script v4
APPROVED
```

after a later change.

Reuse the exact-version approval discipline already established for Drafts, Proposals, Contracts, magazine Proofs and Podcast media.

---

# 12. Script ≠ talking points

Some video formats may use a formal script.

Others may use:

* interview questions,
* talking points,
* shot prompts.

The Video domain should support the approved production type without forcing every Video into one rigid content model.

But those editorial inputs still require stable production references where approval matters.

---

# 13. Featured Person ≠ Client

The approved screen separately identifies the Client and Featured Person. 

Therefore:

```text
Client
≠
FeaturedPerson / Speaker Assignment
```

The featured individual can reference a canonical Contact while holding Video-specific participation metadata.

---

# 14. Contact ≠ VideoParticipantAssignment

Correct:

```text
Contact
   ↓
VideoParticipantAssignment
   ↓
VideoProject
```

The assignment may hold:

* role,
* confirmation state,
* appearance requirements,
* release/consent context where required,
* shoot schedule relationship.

Do not duplicate the underlying person.

---

# 15. Producer ≠ Editor ≠ Project Owner

The frozen screen explicitly displays separate **Video Producer, Editor and Project Owner**. 

These are different responsibilities.

```text
Project Owner
→ overall delivery accountability

Video Producer
→ production coordination

Editor
→ post-production execution
```

One `ownerId` cannot correctly represent all three.

---

# 16. Pre-Production must be structured

The approved design tracks:

* Shot List,
* Production Checklist,
* Locations & Logistics,
* Equipment. 

These should be operational records or projections over canonical Tasks/Assets/requirements—not four hard-coded progress bars.

---

# 17. Shot List ≠ Task list

A Shot represents planned media capture.

A Task represents work.

Example:

```text
Shot:
CEO entering headquarters

Task:
Confirm headquarters shooting permission
```

They can be related, but should not be the same entity.

---

# 18. Shot needs production metadata

Conceptually:

```text
Shot
├── videoProjectId
├── order
├── description
├── scene/location
├── subject
├── shot type
├── production state
└── captured footage references
```

Exact schema waits for Phase 3D.

The approved UI's **36 / 45 Shots Completed** strongly indicates that shots are meaningful structured production units. 

---

# 19. Shot completion ≠ usable footage

A camera may capture the planned Shot but:

* focus could fail,
* audio could be unusable,
* another take may be selected.

Therefore:

```text
SHOT CAPTURED
≠
FINAL SELECT READY
```

where the production process requires media validation.

---

# 20. Schedule ≠ Shoot

A Calendar/Meeting record represents planned timing.

A `Shoot` represents the actual production session.

Correct:

```text
Calendar / Meeting
      ↓
Shoot
      ↓
Footage Assets
```

Use the canonical scheduling infrastructure from Design 015 while preserving Video-specific shoot data.

---

# 21. Shoot model

Conceptually a Shoot may contain:

```text
Shoot
├── scheduled start/end
├── actual start/end
├── location
├── participants
├── crew
├── equipment context
├── shot list
├── production notes
└── footage references
```

Do not force all of this into generic Meeting metadata.

---

# 22. Scheduled ≠ completed shoot

Permanent distinction:

```text
Schedule:
COMPLETED / OCCURRED

Shoot:
FOOTAGE_PENDING
```

A Calendar event finishing does not prove usable footage exists.

---

# 23. Footage remains File/Asset data

Video footage should use the common File/Asset service mandated by the frozen architecture. 

Conceptually:

```text
Shoot
  ↓
FootageAsset
├── camera original
├── audio source
├── B-roll
├── alternate takes
└── graphics/source media
```

No second Video-specific object-storage system.

---

# 24. Master footage must remain immutable

Raw/source media should not be overwritten by editing.

Correct:

```text
Master Footage
      ↓
Video Edit
      ↓
VideoVersion v1
      ↓
VideoVersion v2
      ↓
Approved Final Version
```

The source recording remains recoverable.

---

# 25. VideoEdit ≠ VideoVersion

### VideoEdit

Logical editing workstream.

### VideoVersion

One rendered/reviewable cut.

```text
VideoEdit
├── Rough Cut v1
├── Rough Cut v2
├── Fine Cut v3
└── Final v4
```

Review and approval need exact-version references.

---

# 26. Never approve “the video” ambiguously

Incorrect:

```text
video.approved = true
```

Correct:

```text
ApprovalRequest
      ↓
VideoVersion v4
```

Then the system can answer:

> Which exact file did the Client approve?

---

# 27. New edit invalidates inherited approval

If:

```text
VideoVersion v3
CLIENT APPROVED
```

and production creates:

```text
VideoVersion v4
```

then v4 remains unapproved unless policy explicitly permits a non-material revision path.

Approval must never silently transfer.

---

# 28. Internal Review ≠ Client Review

The frozen UI deliberately has separate tabs for both. 

### Internal Review

Team quality/brand/editorial review.

### Client Review

External Client-facing decision workflow.

Different:

* reviewers,
* comments,
* visibility,
* authority,
* deadlines.

One generic `reviewStatus` would be inadequate.

---

# 29. Review ≠ Approval

A Client can:

* review,
* comment,
* request changes,

before formally approving.

Therefore:

```text
Review session
≠
Approval decision
```

Reuse one common Approval service, as required by the frozen architecture. 

---

# 30. Time-coded media comments

Video review requires the media-review primitive already identified during Podcast audit.

Conceptually:

```text
MediaComment
├── mediaVersionId
├── timecode / timeRange
├── author
├── text
├── visibility
└── resolution state
```

Example:

> 05:42 — Replace this shot.

---

# 31. Comments bind to exact version

Timecodes can move after editing.

Therefore a comment at:

```text
05:42 on v2
```

must remain associated with v2.

It cannot automatically move to v3.

---

# 32. Internal comments must remain internal

Internal feedback could contain:

* technical problems,
* performance concerns,
* sensitive Client comments,
* editing strategy.

Client-facing review projections must exclude them server-side.

The frozen platform rules explicitly state Client Portal users must never see internal-only messages/review comments. 

---

# 33. Editing progress subdomains

The approved screen separately tracks:

**Editing Progress**
**Audio Mix**
**Color Grade**
**Graphics / Titles**
**Captions / Transcript**
**Thumbnail**
**Clips / Shorts**. 

These are useful production dimensions.

They should derive from actual work/version/readiness records—not arbitrary progress sliders with no source.

---

# 34. Audio mix ≠ Video edit

Audio post-production belongs to the overall Video Version but can have its own production state/artifacts.

Likewise:

```text
Video Edit
≠
Color Grade
≠
Graphics
≠
Captions
```

They are related components of one final release package.

---

# 35. Captions ≠ Transcript

As established during Podcast audit:

```text
Transcript
≠
Timed Captions
```

Caption files require timing and a specific format/language.

They can be generated from a transcript, but they remain separate release artifacts.

---

# 36. Captions need source-version lineage

If captions are generated from Final Video v4:

```text
CaptionTrack
     ↓
sourceVideoVersionId = v4
```

A new v5 whose timing changes may invalidate/recreate the caption alignment.

The system needs to know that relationship.

---

# 37. Multilingual captions

If later supported:

```text
VideoVersion
├── captions EN
├── captions DE
└── captions HI
```

should be multiple caption tracks related to the same Video Version.

No additional screen is being added here; this is simply safe domain architecture.

---

# 38. Thumbnail ≠ Video

Thumbnail is a derivative visual asset.

Conceptually:

```text
VideoProject
    ↓
Thumbnail
    ↓
ThumbnailVersion(s)
```

If Client approval is required, it must reference the exact Thumbnail Version.

A mutable `thumbnailUrl` cannot represent professional approval history alone.

---

# 39. Clips ≠ Final Video

A final Video can produce multiple derivatives:

```text
Final Video v4
├── 60s clip
├── 30s clip
├── vertical short
├── teaser
└── quote clip
```

Each should retain source lineage.

---

# 40. VideoClip model

Conceptually:

```text
VideoClip
├── sourceVideoVersionId
├── start/end time
├── format
├── aspect ratio
├── media asset
├── caption metadata
└── production state
```

Exact schema belongs to Phase 3D.

---

# 41. Horizontal ≠ vertical derivative

The master Video may be:

```text
16:9
```

while clips might be:

```text
9:16
1:1
```

These are derivative renders, not duplicate Projects.

The approved workspace explicitly stores format/aspect ratio at the production level. 

---

# 42. Metadata ≠ Publication

Publishing metadata can include:

* title,
* description,
* tags,
* thumbnail,
* captions,
* destinations,
* scheduled date.

Completing metadata does not itself publish the Video.

---

# 43. Publication readiness ≠ production progress

Correct:

```text
Overall Progress:
95%

Publication Readiness:
BLOCKED

Reason:
Final Client Approval missing
```

The approved workflow itself separately includes **Metadata Ready**, **Publication Ready**, and **Published** stages. 

That separation should survive implementation.

---

# 44. Publication readiness service

A canonical readiness evaluation can check configured requirements such as:

```text
approved VideoVersion
thumbnail ready
captions ready if required
metadata complete
Client approval satisfied if required
technical render validated
```

The exact gates depend on product configuration.

Do not implement:

```text
markReady = true
```

as an unrestricted frontend toggle.

---

# 45. Technical output validation

A Video may need validation for:

* codec/container,
* resolution,
* aspect ratio,
* audio,
* caption compatibility,
* file integrity.

These can become part of publication readiness without inventing another UI screen.

---

# 46. Media processing must be asynchronous

Large Video operations include:

* upload,
* transcoding,
* proxy generation,
* thumbnail generation,
* caption generation,
* clip rendering,
* final export.

They must use background jobs/workers.

The browser must not remain open for processing to succeed.

---

# 47. Processing state ≠ readiness

Example:

```text
File Upload:
COMPLETE

Transcode:
PROCESSING

Review Ready:
NO
```

The platform must distinguish them.

---

# 48. Job failure must preserve source media

Example:

```text
Footage Asset      ✓
Transcoding        ✕
VideoProject       ✓
```

The failed derivative job should be retryable.

Do not require the user to upload source media again unless the source itself is invalid.

---

# 49. Relationship to Design 026

Designs 026 and 027 have strong implementation overlap around:

* media versions,
* players,
* time-coded comments,
* transcript/captions,
* review,
* approvals,
* clips,
* media-processing jobs.

This is a **standardization opportunity**.

But:

```text
PodcastEpisode
≠
VideoProject
```

and:

```text
Audio production workflow
≠
Video shoot/post-production workflow
```

### Decision

**SHARE MEDIA-PRODUCTION INFRASTRUCTURE — KEEP PODCAST AND VIDEO DOMAINS SEPARATE.**

---

# 50. Relationship to Design 023

Design 023 remains the broad Project 360.

Design 027 is deeper Video execution.

```text
Project 360
Design 023
     ↓
Video workstream
     ↓
Video Production
Design 027
```

Project 360 can show summary state but must not recreate the Script/Shoot/Edit/Review workspace.

---

# 51. Relationship to later specialized Video screens

The frozen operational architecture also contains specialized Video surfaces for **Shoot Schedule, Video Review and Video Publish Prep** around the same canonical Video Project. 

Therefore Design 027 should remain the overall Video production composition.

It should not independently implement three different backend systems for scheduling, review and publishing.

---

# 52. Reusable component mapping

Design 027 should reuse/formalize:

```text
ProductionWorkspaceHeader
ProductionStageTracker
VideoProjectSummary
ParticipantCard
PreProductionReadiness
ShotListProgress
ShootSummary
FootageStatus
MediaVersionSelector
VideoReviewPlayer
TimecodedCommentPanel
InternalReviewPanel
ClientReviewPanel
ApprovalSummary
CaptionStatus
ThumbnailStatus
ClipProductionSummary
PublicationReadinessCard
ProductionHealthCard
MilestoneList
TaskSummary
ActivityTimeline
```

The approved screen's workflow/status cards, shot progress, approvals and quick actions support this decomposition.  

---

# 53. Permissions

Potential Phase 3D capability dimensions:

```text
video.read
video.edit
video.assign
video.move_stage

video.script.manage
video.preproduction.manage
video.shoot.manage
video.footage.manage
video.edit_version.manage

video.review.perform
video.client_review.request
video.approval.manage

video.thumbnail.manage
video.caption.manage
video.clip.manage
video.mark_ready
```

Exact names wait for Phase 3D.

---

# 54. Editing ≠ approval ≠ publishing authority

A Video Editor may:

```text
upload edit
```

without permission to:

```text
approve edit
```

An Account Manager may:

```text
request client review
```

without permission to:

```text
publish
```

A Producer may:

```text
manage shoot
```

without access to unrelated Finance or Client records.

Backend enforcement is mandatory.

---

# 55. Assignment ≠ permission

Assigning a user as Editor/Producer should establish work context.

It must not bypass organization-level RBAC.

If a user lacks `video.publish` authority, assigning them to the Video Project should not grant it implicitly.

---

# 56. Client-facing projection

Clients may legitimately access:

* frozen Video review version,
* selected comments,
* approval action,
* requested assets,
* relevant milestones.

They must not receive:

* internal notes,
* internal review comments,
* budget/margin,
* staff performance,
* technical production logs.

This requires a dedicated server-side safe projection.

---

# 57. Activity history

Meaningful events include:

```text
Video Project created
Script uploaded/versioned
Script approved
Shoot scheduled
Shoot completed
Footage uploaded
Edit Version created
Internal review requested
Internal changes requested
Client review requested
Client approved Version
Thumbnail uploaded/approved
Captions generated/reviewed
Clips created
Publication readiness achieved
```

Activity events should reference their authoritative source records.

---

# 58. Audit history

Higher-value auditable operations include:

* Client approvals/overrides,
* final Video Version selection,
* publication-readiness overrides,
* source media replacement,
* stage transitions,
* Client-visible file changes.

Again:

**Activity ≠ Audit.**

---

# 59. Concurrency

Video production is highly parallel.

For example:

```text
Editor uploads Cut v3
Caption editor updates captions
Producer updates Shot status
AM requests Client Review
```

These should be domain-specific operations.

Do not persist one enormous `VideoWorkspace` object whose save can overwrite the others.

---

# 60. Review race condition

Example:

```text
Client reviewing v3
       ↓
Editor renders v4
```

Canonical result:

```text
v3 review remains attached to v3
v4 remains new/unapproved
```

The UI may indicate a newer version exists, but must not move the Client decision to v4.

---

# 61. Stage transition concurrency

Example:

```text
Producer requests:
EDITING → CLIENT_REVIEW

simultaneously

Internal reviewer:
CHANGES_REQUESTED
```

The Workflow Engine must evaluate fresh authoritative state before allowing the transition.

---

# 62. Idempotency

Important idempotent operations include:

* footage import callbacks,
* media-processing completion,
* caption generation callbacks,
* review decision submission,
* Client approval,
* publication handoff.

Duplicate webhooks/jobs must not create duplicate versions, approvals or publications.

---

# 63. Partial failure behavior

Example:

```text
Video core          ✓
Footage             ✓
Editing             ✓
Captions            ✕
Approvals           ✓
Tasks               ✓
```

The Video workspace remains operational.

Only Caption-dependent areas show degraded state.

---

# 64. Unknown ≠ incomplete

If caption-processing infrastructure is unavailable:

do not display:

> Captions: 0%

if the true state cannot be determined.

Use:

> Caption status unavailable.

Likewise for Footage, Approval, Publishing or media-processing services.

---

# 65. Responsive contract — Desktop

Desktop preserves the frozen dense command-center experience:

**header → production status → workflow → production summary → shot/pre-production state → edits/reviews → milestones → health/tasks → approvals/actions.**

The design is clearly optimized for wide operational use. 

---

# 66. Responsive contract — Tablet

Following Design 152:

* summary cards reduce columns,
* tabs become scrollable,
* Video player remains prominent,
* review/comments move into drawers/stacked areas,
* production status remains readable,
* touch targets replace hover dependency.

---

# 67. Responsive contract — Mobile

Following Design 151, transform to:

```text
Video Identity
↓
Current Stage / Progress
↓
Shoot / Publish Target
↓
Next Action
↓
Critical Production Blockers
↓
Current Edit / Review
↓
Client Approval
↓
Thumbnail / Captions
↓
Tasks / Milestones
↓
Publication Readiness
```

Do not shrink the entire desktop board into an unreadable phone layout.

---

# 68. Mobile production boundary

Useful mobile actions can remain:

* inspect schedule,
* update permitted task/status,
* upload supporting media,
* comment on edit,
* approve/request changes,
* review milestone.

Full Video editing/color grading/rendering remains desktop/specialized-tool oriented.

---

# 69. State coverage

Design 027 inherits Design 150 and requires Video-specific operational states including:

```text
Video Loading
Video Not Found
Brief Incomplete
Script In Progress
Script Approval Pending
Pre-Production
Shoot Scheduled
Shoot In Progress
Shoot Completed
Footage Uploading
Footage Processing
Footage Processing Failed
Editing In Progress
Internal Review Pending
Changes Requested
Client Review Pending
Client Approved
Thumbnail Pending
Captions Processing
Clips In Progress
Publication Ready
Published downstream
Permission Restricted
Record Updated Elsewhere
Partial Service Failure
```

These should not become one enormous `VideoStatus` enum.

---

# 70. Read model

A composed read model can be:

```text
VideoProductionView
├── Project summary
├── VideoProject
├── participants/team
├── production workflow
├── brief
├── active Script Version
├── pre-production summary
├── Shot progress
├── Shoot summary
├── Footage summary
├── active VideoVersion
├── internal review
├── client review
├── approvals
├── thumbnail
├── captions
├── clips
├── milestones/tasks
├── production health
├── publication readiness
└── activity
```

This is a **read composition**.

---

# 71. Do not PATCH the entire workspace

Avoid:

```text
PATCH /video-workspace
{
  scriptApproved: true,
  shootCompleted: true,
  footageUploaded: true,
  videoApproved: true,
  captionsReady: true,
  published: true
}
```

Use canonical commands/services such as:

```text
createScriptVersion()
scheduleShoot()
completeShoot()
registerFootage()
createVideoVersion()
requestInternalReview()
requestClientReview()
recordApproval()
createCaptionTrack()
createClip()
evaluatePublicationReadiness()
```

---

# 72. Backend architecture

```text
Video Production UI
        ↓
VideoProductionQueryService
        ↓
Tenant + Permission Scope
        ↓
Video Domain
        │
        ├── VideoProject
        ├── Participant Assignments
        ├── Script / Versions
        ├── Shoot / Shot List
        ├── Footage Assets
        ├── VideoEdit / Versions
        ├── Captions
        ├── Thumbnail
        └── Clips
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

The frozen architecture explicitly requires common workflow, approval and file services across Video and the other production domains. 

---

# 73. Backend requirements

| Requirement                           | Status       |
| ------------------------------------- | ------------ |
| Authentication                        | **Required** |
| Tenant isolation                      | **Critical** |
| Video/Project RBAC                    | **Critical** |
| Canonical VideoProject entity         | **Critical** |
| Generic Project linkage               | **Critical** |
| Script + ScriptVersion                | **Critical** |
| Participant assignments               | **Required** |
| Canonical Shoot model                 | **Critical** |
| Structured Shot List                  | **Required** |
| Calendar/Meeting integration          | **Required** |
| File/Asset service                    | **Critical** |
| Immutable source footage preservation | **Critical** |
| VideoEdit / VideoVersion              | **Critical** |
| Exact-version review                  | **Critical** |
| Internal vs Client Review separation  | **Critical** |
| Version-specific Approval             | **Critical** |
| Time-coded comments                   | **Critical** |
| Thumbnail/version lineage             | **Required** |
| CaptionTrack/source-version lineage   | **Critical** |
| VideoClip/source lineage              | **Required** |
| Async media-processing jobs           | **Critical** |
| Workflow Transition Service           | **Critical** |
| Publication readiness evaluation      | **Critical** |
| Publishing handoff                    | **Critical** |
| Distribution linkage                  | **Required** |
| Client-safe projection                | **Critical** |
| Concurrency protection                | **Critical** |
| Event/job idempotency                 | **Critical** |
| Partial-service failure handling      | **Required** |
| Activity history                      | **Required** |
| Audit history                         | **Required** |

---

# 74. Canonical Video metrics

These need centralized definitions:

**Videos In Production**
**Shots Completed**
**Editing Progress**
**Videos Awaiting Internal Review**
**Videos Awaiting Client Review**
**Client Approval Time**
**Publication Ready Videos**
**Average Production Duration**
**Internal Production Time**
**Client Waiting Time**
**On-Time Publication**
**Clip Completion**

They may later appear across:

**Project 360**
**Video Production**
**Operations Dashboard**
**Analytics / Reports**

No separate frontend formulas.

---

# 75. Main implementation risks

Design 027 flags the following high-priority risks:

**Project/Video conflation** — Video fields polluting the generic Project model.

**Shoot/Meeting conflation** — scheduled Calendar event mistaken for actual production.

**Shot/Task conflation** — shot list reduced to generic checklist items.

**Footage/Edit conflation** — original media overwritten by edits.

**Latest-version bug** — Client review or publishing accidentally uses newest rather than approved Video Version.

**Internal/Client Review conflation** — internal comments leaking externally.

**Approval ambiguity** — `videoApproved=true` with no exact artifact/version.

**Transcript/Caption conflation** — one text object used for unrelated media outputs.

**Thumbnail/file conflation** — no version/approval lineage.

**Clip lineage loss** — derivatives cannot identify the source Video Version.

**Upload/processing conflation** — uploaded footage considered review-ready before processing.

**Progress/readiness conflation** — high completion percentage bypassing mandatory release gates.

**Fake Production Health** — numeric quality/budget/team scores with no authoritative formula.

**Workflow hard-coding** — 17-stage lifecycle duplicated throughout UI code.

**Mega-save concurrency** — Producer, Editor and reviewer actions overwriting each other.

**Publishing/Distribution conflation** — Published assumed to mean distributed to every destination.

None requires another visual design.

They require correct domain architecture.

# Design 027 Audit Verdict

## **PASS — VIDEO PRODUCTION WORKSPACE ANCHOR**

**Template directive:** Design 027 is the canonical Video implementation of `ProductExecutionWorkspaceTemplate`.

**Domain directive:** **Project ≠ VideoProject ≠ Shoot ≠ FootageAsset ≠ VideoVersion ≠ Publication.**

**Participant directive:** Client/Contact identities remain canonical; Featured Person, Producer and other Video roles are contextual relationships rather than duplicate identities.

**Script directive:** Production content uses controlled Script Versions where material, and approvals reference the exact Script Version.

**Shoot directive:** Calendar scheduling and actual Shoot execution remain related but separate records.

**Media directive:** Source Footage remains immutable canonical media; edits produce derived `VideoVersion` records instead of replacing originals.

**Version directive:** Every internal/client review and approval binds to the exact Video Version under consideration.

**Review directive:** Internal Review and Client Review remain structurally separated with backend-enforced visibility.

**Media-feedback directive:** time-coded comments bind to exact media versions.

**Caption directive:** Transcript and timed Caption Tracks remain separate, with Caption Tracks tied to the source Video Version.

**Derivative directive:** Thumbnail and Video Clips are first-class derivative/versioned assets with source lineage.

**Progress directive:** Shot count, edit progress, overall progress and production health use canonical definitions rather than decorative frontend values.

**Readiness directive:** Publication readiness is policy/gate-driven and remains separate from production percentage.

**Processing directive:** media transcoding/rendering/caption/clip operations use asynchronous jobs with retry/idempotency and preservation of source Assets.

**Publishing directive:** Design 027 hands the exact approved Video Version into the Publishing domain; Publishing and Distribution remain separate.

**Permission directive:** production editing, shoot management, review, Client review initiation, approval, readiness and publish authority are independently enforceable.

**Reuse directive:** Designs **026 and 027** should strongly share versioned-media, player, time-coded review and asynchronous media-processing infrastructure while retaining distinct Podcast and Video domains.

**Consolidation directive:** **STANDARDIZE VIDEO/PODCAST MEDIA-PRODUCTION + VERSIONED MEDIA + REVIEW + APPROVAL + PROCESSING + READINESS INFRASTRUCTURE — DO NOT MERGE VIDEO PRODUCTION WITH PROJECT 360, PODCAST PRODUCTION, SHOOT SCHEDULING, VIDEO REVIEW, PUBLISH PREP, PUBLISHING OR DISTRIBUTION.**

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **27 / 153** |
| **PASS**                                   |                         **27** |
| **STANDARDIZE decisions**                  |                         **25** |
| **Potential implementation-overlap flags** |                         **18** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

### Product-specific execution architecture

```text
ProductExecutionWorkspaceTemplate
│
├── 024 Editorial Production
│   └── Versioned written content
│
├── 025 Personal Magazine Production
│   └── Cover / pages / proofs / reader
│
├── 026 Podcast Production
│   └── Recording / audio-media / transcript / clips
│
└── 027 Video Production
    └── Script / shoot / footage / video versions /
        captions / thumbnail / clips
```

A major reusable media foundation is now visible:

```text
                    MediaProductionCore
                           │
             ┌─────────────┴─────────────┐
             ↓                           ↓
     Podcast Production            Video Production
          Design 026                  Design 027
             │                           │
             ├── Source Media            ├── Source Footage
             ├── Media Versions          ├── Video Versions
             ├── Time-coded Review       ├── Time-coded Review
             ├── Approval                ├── Approval
             ├── Transcript              ├── Captions
             ├── Clips                   ├── Clips
             └── Publishing Handoff      └── Publishing Handoff
```

# Next Sequential Audit Target

The exact frozen next identity is:

## **Phase 3A.1 — Design 028: Event Production / Event Operations Workspace Audit**

That audit should establish the canonical separation between **Project, Event, Event edition/occurrence, speaker/partner assignments, agenda/session, venue/logistics, registrations, event-day execution, post-event assets, publishing/distribution and reporting**, while keeping Event operations attached to the same Project, Client, Contact, File, Task, Approval and Activity foundations.

We continue with exactly the same audit contract and with **no redesign, no additional screen and no sequence change.**

