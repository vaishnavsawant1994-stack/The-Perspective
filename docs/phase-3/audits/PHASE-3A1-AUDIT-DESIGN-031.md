Confirmed. We continue strictly with the frozen identity:

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 031 — Publishing Hub / Publication Queue

This is the first major **cross-product release-management workspace** after the product-production workspaces and shared Approval/File infrastructure.

Its job is to answer:

> **“Which production-ready outputs are waiting to become publications, what exact approved artifact/version will be released, what remains blocked, when and where will it go live, who owns the release, and what happened after publication?”**

It must not collapse **production completion, publication readiness, publication scheduling, actual publication, and distribution** into one status.

| Audit field                 | Classification                                                                                                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**               | **031**                                                                                                                                                                            |
| **Canonical name**          | **Publishing Hub / Publication Queue**                                                                                                                                             |
| **Product area**            | Publishing / Release Management / Operations                                                                                                                                       |
| **User surface**            | Team Workspace                                                                                                                                                                     |
| **Screen class**            | Cross-Product Publication Queue + Release Operations Workspace                                                                                                                     |
| **Classification**          | **Unique Anchor — Publishing Operations Family**                                                                                                                                   |
| **Primary purpose**         | Centralize publication-ready and scheduled outputs across Editorial, Magazine, Podcast, Video, Event and other content products and move them through controlled release execution |
| **Primary entity**          | **Publication**                                                                                                                                                                    |
| **Core related entities**   | PublicationVersion/ReleaseRevision, PublicationArtifact, PublicationTarget, PublicationSchedule, PublicationAttempt                                                                |
| **Supporting entities**     | Project, Client, Asset/FileVersion, ApprovalRequest, User, Channel/Platform, DistributionCampaign, Activity                                                                        |
| **Upstream domains**        | Editorial, Magazine, Podcast, Video, Event                                                                                                                                         |
| **Downstream domain**       | Distribution                                                                                                                                                                       |
| **Parent shell**            | `InternalAppShell` — Design 001                                                                                                                                                    |
| **Template family**         | `PublishingQueueWorkspaceTemplate`                                                                                                                                                 |
| **Composition**             | `PublishingHubComposition`                                                                                                                                                         |
| **Auth**                    | Required                                                                                                                                                                           |
| **Permissions**             | Publishing read/prepare/schedule/publish/cancel/retry + destination/channel scope                                                                                                  |
| **Implementation priority** | **Core / Critical**                                                                                                                                                                |
| **Reuse level**             | **Platform-wide / Extremely High**                                                                                                                                                 |

---

# 1. Functional responsibility

Design 031 sits at this boundary:

```text
PRODUCT PRODUCTION
      │
      ├── Editorial
      ├── Magazine
      ├── Podcast
      ├── Video
      └── Event
      ↓
APPROVED / READY OUTPUT
      ↓
PUBLISHING HUB
Design 031
      │
      ├── Validate
      ├── Prepare
      ├── Schedule
      ├── Release
      ├── Verify
      └── Record result
      ↓
PUBLICATION
      ↓
DISTRIBUTION
```

The central invariant is:

> **Production-ready ≠ Publication ≠ DistributionCampaign.**

---

# 2. Publication is a canonical entity

Publishing must not be represented only as:

```text
project.published = true
```

or:

```text
asset.isPublished = true
```

A first-class `Publication` record is required.

Conceptually:

```text
Publication
├── publication type
├── source Project/workstream
├── exact source artifact/version
├── release status
├── publication metadata
├── schedule
├── destination context
├── publishedAt
└── publication result
```

Exact schema belongs to Phase 3D.

---

# 3. Publication ≠ production record

Examples:

```text
MagazineIssue
≠
Publication
```

```text
PodcastEpisode
≠
Publication
```

```text
VideoProject
≠
Publication
```

Product records describe what was produced.

Publication describes the controlled release of that output.

---

# 4. One production record can generate multiple Publications

This is important.

A Video might result in:

```text
VideoProject
├── Website Publication
├── YouTube Publication
└── Embedded Client Page Publication
```

depending on the approved product model.

Likewise, one magazine issue might have:

```text
Digital publication
Print release record
Reader publication
```

if those are separately tracked outputs.

Therefore cardinality must not be hard-coded as:

```text
one Project = one Publication
```

---

# 5. Publication must reference an exact source artifact

This continues the version-integrity discipline from Designs 024–030.

Correct:

```text
Publication
   ↓
FileVersion / MediaVersion / ReaderBuild
```

Examples:

```text
Magazine Publication
→ Final PDF v5
```

```text
Podcast Publication
→ Approved Episode Edit v4
```

```text
Video Publication
→ Approved VideoVersion v6
```

Never:

```text
Publication
→ latest file
```

---

# 6. Approved source ≠ latest source

Example:

```text
Latest Video Version: v7
Approved Version: v6
```

The publication process must use:

```text
v6
```

unless v7 receives the required approval.

This prevents the most dangerous release-integrity error:

> publishing something that was never approved.

---

# 7. PublicationArtifact

A useful conceptual abstraction is:

```text
PublicationArtifact
├── publicationId
├── sourceAssetId
├── exactFileVersionId
├── role
└── release validation state
```

A publication may use multiple artifacts:

* primary media,
* thumbnail,
* captions,
* cover,
* PDF,
* transcript,
* metadata file.

---

# 8. Production readiness ≠ publication readiness

Upstream workspaces can declare:

> Production output ready.

Publishing still may require:

* metadata,
* title,
* slug,
* release date,
* destination configuration,
* final artifact validation,
* approval,
* platform connection.

Therefore:

```text
Production Ready
≠
Publication Ready
```

---

# 9. Publication readiness should be canonical

Conceptually:

```text
PublicationReadiness
├── valid exact source artifact
├── required approvals satisfied
├── required metadata complete
├── destination configured
├── rights/access requirements satisfied
├── technical validation passed
└── scheduling requirements valid
```

The exact gates differ by publication type.

---

# 10. Readiness ≠ status

A Publication might be:

```text
Lifecycle:
DRAFT

Readiness:
READY
```

or:

```text
Lifecycle:
SCHEDULED

Readiness:
BLOCKED
```

if a previously valid credential becomes unavailable before release.

These dimensions should not be collapsed.

---

# 11. Publication lifecycle

Conceptually a Publication may pass through states similar to:

```text
DRAFT
READY
SCHEDULED
PUBLISHING
PUBLISHED
```

with branches such as:

```text
FAILED
CANCELLED
```

Exact enums wait for Phase 3D.

The important audit rule is that lifecycle remains separate from:

* readiness,
* destination health,
* verification,
* distribution state.

---

# 12. Scheduled ≠ published

Permanent rule:

```text
Publication:
SCHEDULED
```

does not mean:

```text
PUBLISHED
```

The system must wait for actual release execution/confirmation.

---

# 13. Publish command must be server-authoritative

Correct:

```text
Publish
  ↓
Permission check
  ↓
fresh readiness evaluation
  ↓
exact artifact validation
  ↓
destination validation
  ↓
idempotent release command
  ↓
provider/internal publishing execution
  ↓
result persisted
```

Not:

```text
button click
→ status = PUBLISHED
```

---

# 14. Published ≠ verified

A publishing provider may initially return success but the final public resource may still fail.

Therefore:

```text
Publish command accepted
≠
Release verified
```

A separate verification state can answer:

> Is the expected public/live output actually reachable and correct?

---

# 15. PublicationAttempt

Release execution should preserve attempts.

Conceptually:

```text
Publication
   ↓
PublicationAttempt
├── attempt number
├── startedAt
├── provider/internal method
├── result
├── error
└── completedAt
```

This prevents retry history from disappearing.

---

# 16. Failed attempt ≠ failed Publication forever

Example:

```text
Attempt 1:
FAILED

Attempt 2:
SUCCESS
```

The Publication can ultimately become Published while preserving the failed first attempt.

Do not overwrite failure history.

---

# 17. Retry must be idempotent

A user retrying after a timeout must not accidentally create:

```text
two public articles
two podcast releases
two duplicate videos
```

Release commands require stable idempotency keys or equivalent provider-safe logic.

---

# 18. PublicationTarget ≠ Distribution channel automatically

This distinction is important.

A **publication target** is where the canonical release occurs.

A **distribution channel** may amplify/share the published content afterward.

Example:

```text
Publication target:
The Perspective Website

Distribution:
LinkedIn
Newsletter
Medium
PR platforms
```

Therefore:

```text
Publishing
≠
Distribution
```

even though both involve destinations.

---

# 19. Publishing target ≠ Integration connection

A target like:

```text
YouTube
```

is business configuration.

The connection/account that authenticates publishing is an Integration.

Conceptually:

```text
PublicationTarget
   ↓
ConnectedService / Integration
```

Do not store provider credentials directly on Publication.

---

# 20. Connection health affects readiness

Example:

```text
Video:
Approved

Metadata:
Complete

YouTube Connection:
Expired
```

Then:

```text
Publication Readiness:
BLOCKED
```

or appropriately degraded for that target.

The publishing record remains intact.

---

# 21. Credential failure ≠ source-artifact failure

The system must explain:

> Source is valid; publishing destination is unavailable.

rather than:

> Video failed.

These are different operational conditions.

---

# 22. Publication metadata must be structured

Potential fields depending on type include:

```text
title
subtitle
description
slug
excerpt
authors
featured image
publication date/time
tags/categories
SEO metadata
language
visibility
```

Do not place the entire publication configuration in one opaque JSON or HTML payload.

---

# 23. Source metadata ≠ publication metadata

An Editorial Draft might have one working title.

The final publication might use a refined headline or SEO description.

Therefore:

```text
Draft metadata
≠
Publication metadata
```

while lineage is preserved.

---

# 24. Metadata snapshot matters

Once a Publication is released, the system should preserve the metadata actually used.

If metadata is later edited:

```text
Publication revision / update
```

should retain meaningful history.

Otherwise the system cannot reconstruct what was live at release time.

---

# 25. Publication update ≠ initial publication

A live article may later be corrected.

Conceptually:

```text
Publication
├── Initial release
├── Revision/update 1
└── Revision/update 2
```

Exact model waits for Phase 3D.

But do not treat edits to already-public content as though the original publication never happened.

---

# 26. Publication revision ≠ source content version automatically

Source content may evolve independently from live publication.

For example:

```text
Draft v8
Publication revision 3
```

The relationship should explicitly identify which source version fed which release revision.

---

# 27. Schedule model

Publishing schedules need:

```text
scheduledAt
timezone/context
status
createdBy
changedBy
```

and where relevant scheduling history.

Never rely on browser-local timers.

---

# 28. Scheduled publishing uses backend jobs

Correct:

```text
Publication Scheduled
     ↓
Persisted schedule
     ↓
Background scheduler/queue
     ↓
At scheduled time
     ↓
Readiness re-check
     ↓
Publish
```

The user's browser can be closed.

---

# 29. Re-check readiness at execution time

Something may change after scheduling:

* approval revoked/superseded,
* file quarantined,
* integration expired,
* source artifact archived.

Therefore the backend should evaluate current eligibility just before release.

---

# 30. Scheduled artifact should remain pinned

Scheduling:

```text
Video v6
for tomorrow 10:00
```

must not silently become:

```text
Video v7
```

because somebody uploaded a new version overnight.

Scheduled publications remain pinned to the exact artifact/version.

---

# 31. Changing the artifact requires explicit update

If production wants to replace v6 with v7 before publication:

```text
updatePublicationSource()
```

or equivalent explicit action should occur.

That may invalidate prior approvals/readiness and require reevaluation.

---

# 32. Publish-now vs schedule

These are different commands over the same Publication domain.

```text
publishNow()
schedulePublication()
```

Neither should create separate publishing models.

---

# 33. Cancel schedule ≠ cancel Publication record

A schedule can be cancelled while the Publication remains Draft/Ready for later rescheduling.

Do not delete the Publication merely because a schedule is cancelled.

---

# 34. Publication queue

Design 031 should provide a canonical operational queue over Publication records.

Useful conceptual groupings include:

**Needs Attention**
**Ready**
**Scheduled**
**Publishing**
**Failed**
**Published**

These should be views over canonical state, not copied lists.

---

# 35. Queue ≠ publication data

A queue is a presentation/read model.

Do not maintain a separate:

```text
publication_queue_items
```

table unless it is a deliberate projection/index.

The authoritative source remains `Publication`.

---

# 36. Saved views

Reuse the saved-view/list architecture already established in Designs 011 and 029.

Examples:

```text
My Releases
This Week
Magazine
Podcast
Video
Failed Publications
```

A Saved View stores filter/sort preference—not duplicate Publications.

---

# 37. Server-side filtering

Publishing Hub can grow large.

Filtering/search/pagination must remain server-side and permission scoped.

Potential filters:

* publication type,
* status,
* readiness,
* Project,
* Client,
* owner,
* target,
* schedule date,
* failure state.

---

# 38. Publication owner ≠ Project owner

A Project Owner may manage delivery.

A Publishing Owner may be responsible for release execution.

Example:

```text
Project Owner:
Emma

Publishing Owner:
Daniel
```

This is valid.

---

# 39. Publishing owner ≠ content approver

A user may be authorized to publish without being the person who approved the artifact.

Governance should preserve:

```text
Created by
Approved by
Scheduled by
Published by
```

as potentially different actors.

---

# 40. Separation of duties

For sensitive content, the system may require:

```text
Editor
≠
Final Approver
≠
Publisher
```

The architecture must support this without hard-coding that all roles must always be different.

ApprovalPolicy and Publishing permissions determine actual rules.

---

# 41. Approval integration

Design 029 feeds Design 031.

Correct:

```text
Artifact Version
      ↓
ApprovalRequest
      ↓
ApprovalDecision
      ↓
Publishing readiness reevaluated
```

Publishing must not create another `approved=true` field independent from ApprovalRequest.

---

# 42. Approval revoked/superseded

If the approved source becomes superseded by a mandatory new version before release:

the Publication should return to an appropriate:

```text
NOT READY / NEEDS ATTENTION
```

condition.

It should not continue to publish based on stale assumptions.

---

# 43. Asset integration

Design 030 also feeds Design 031.

Correct:

```text
Publication
   ↓
PublicationArtifact
   ↓
Asset/FileVersion
```

The Publishing Hub should not upload/store a duplicate file separately.

---

# 44. Asset archived after scheduling

If the exact scheduled FileVersion becomes unavailable or blocked:

the publish command must fail safely.

Do not dynamically fall back to “latest available file.”

---

# 45. Rights/licensing integration

Where Asset rights are relevant:

```text
Asset rights valid?
```

may be part of readiness.

A technically valid and approved image is not automatically legally usable.

Design 031 should consume the canonical rights state from Design 030 infrastructure.

---

# 46. Product-specific source adapters

Publishing Hub must support different source types without forcing them into one production schema.

Conceptually:

```text
PublicationSourceAdapter
├── Editorial
├── Magazine
├── Podcast
├── Video
└── Event-generated content
```

Each adapter supplies:

* exact release artifact,
* required metadata,
* readiness requirements,
* preview/context.

---

# 47. Editorial publishing

For an Article:

```text
Approved DraftVersion
     ↓
Publication
     ↓
Website content artifact/release
```

Publication owns live release state.

Draft remains the editorial source.

---

# 48. Magazine publishing

For a Magazine:

```text
MagazineIssue
   ↓
approved final output / ReaderBuild
   ↓
Publication
```

Magazine production state stays in Design 025.

Publishing owns release.

---

# 49. Podcast publishing

For a Podcast:

```text
Approved Episode MediaVersion
+
artwork
+
show notes
+
metadata
      ↓
Publication
```

Podcast production does not itself become the canonical public-release record.

---

# 50. Video publishing

For Video:

```text
Approved VideoVersion
+
thumbnail
+
captions
+
metadata
      ↓
Publication
```

Again, publishing can fail independently of production.

---

# 51. Event publishing

Event-generated output can produce Publications:

* event page,
* recap,
* session video,
* gallery,
* report.

The Event occurrence remains the source context.

---

# 52. Public URL / destination identifier

Once published, canonical Publication should preserve provider/internal release identifiers such as:

```text
publicUrl
externalPublicationId
publishedAt
```

where applicable.

These should come from execution results, not be guessed beforehand.

---

# 53. Public URL ≠ proof of success

A URL existing in a response does not necessarily guarantee correct publication.

Verification can check:

* resource reachable,
* expected identity,
* provider status.

Exact verification depth belongs to Phase 3D.

---

# 54. Verification should not modify source content

The verification service inspects release result.

It should never mutate Draft, MagazineIssue, PodcastEpisode or VideoProject to “fix” production state.

---

# 55. Failed publication

Failures should preserve actionable details:

```text
failure category
provider/service
error reference
attempt number
retry eligibility
occurredAt
```

Avoid only storing:

```text
status = FAILED
```

with no explanation.

---

# 56. Failure classification

Conceptually failures may come from:

```text
AUTHENTICATION
VALIDATION
PROVIDER
NETWORK
CONTENT_REJECTED
RATE_LIMIT
UNKNOWN
```

Exact enums wait for Phase 3D.

This supports correct retry/escalation behavior.

---

# 57. Retryable ≠ permanent failure

Some failures are transient:

* network,
* rate limit,
* temporary provider outage.

Others require human correction:

* metadata invalid,
* rights missing,
* unsupported format.

The system should distinguish them.

---

# 58. Partial target success

If a Publication can target multiple destinations in one release operation:

```text
Website ✓
YouTube ✓
Partner platform ✕
```

the system must not collapse that into simple:

```text
FAILED
```

without destination-specific execution state.

Exact multi-target semantics belong to Phase 3D.

---

# 59. One Publication vs destination executions

A useful model may be:

```text
Publication
   ↓
PublicationTargetExecution
├── Website
├── YouTube
└── Other destination
```

or separate Publication records per release target.

Phase 3D must choose one consistent model.

What must be avoided is one opaque status that cannot represent partial results.

---

# 60. Publishing ≠ Distribution

This is the most important downstream boundary.

### Publishing

Makes the canonical content/output live.

### Distribution

Promotes, syndicates, emails, posts, places or otherwise distributes that published content.

Correct:

```text
Publication
    ↓
DistributionCampaign
```

Not:

```text
Publishing Hub
=
Social Media Scheduler
```

---

# 61. Publication event creates downstream eligibility

Once a Publication is verified/live:

```text
PublicationPublished
```

can allow:

* DistributionCampaign creation,
* newsletter inclusion,
* social promotion,
* Client deliverable updates,
* reporting.

Design 031 emits events rather than mutating all downstream modules directly.

---

# 62. Publication activity

Meaningful events include:

```text
Publication created
Source artifact selected
Readiness achieved
Publication scheduled
Schedule changed
Publication started
Publication failed
Publication retried
Publication published
Publication verified
Publication cancelled
Publication source replaced
```

Activity should reference canonical Publication and attempt records.

---

# 63. Audit history

Higher-value publishing audit fields should preserve:

```text
actor
action
source artifact/version
metadata snapshot/reference
target
scheduled time
actual publish time
attempt/result
override/reason
```

This matters because publishing is an external-impact action.

---

# 64. Publishing override

If an authorized user bypasses a normally required readiness check:

that must be explicit and auditable.

Never record:

> Readiness passed

when an administrator actually overrode it.

Correct:

```text
Readiness requirement overridden
By: ...
Reason: ...
```

---

# 65. Publish permission ≠ override permission

Important:

```text
publication.publish
≠
publication.override_readiness
```

A Publisher should not automatically gain authority to bypass:

* Client approval,
* rights validation,
* technical validation.

---

# 66. Permission architecture

Potential Phase 3D capabilities:

```text
publication.read
publication.prepare
publication.edit_metadata
publication.schedule
publication.reschedule
publication.cancel_schedule
publication.publish
publication.retry
publication.verify
publication.cancel
publication.override_readiness
```

Exact names later.

The essential distinction:

> **READ ≠ PREPARE ≠ SCHEDULE ≠ PUBLISH ≠ OVERRIDE.**

---

# 67. Destination-specific authorization

A user may be authorized to publish to:

```text
Website
```

but not:

```text
YouTube
External syndication platform
```

Destination/account scope may need separate permission or Integration access policy.

---

# 68. Client permission boundary

Clients may potentially see:

* release status,
* scheduled date,
* live link.

They should not automatically receive:

* provider credentials,
* internal failure logs,
* unpublished source files,
* internal release notes,
* team operational comments.

Client Portal uses a safe Publication projection.

---

# 69. Publication visibility ≠ public release visibility

A Publication record exists internally before anything is publicly available.

Therefore:

```text
internal Publication record
≠
public webpage/media
```

Creating the record must never accidentally expose content.

---

# 70. Relationship to Design 124

The frozen roadmap later contains:

**Design 124 — Publishing Queue / Publication Management Workspace.**

This is now a **major implementation-overlap checkpoint**.

Current architecture should assume:

```text
Canonical Publishing Domain
        │
        ├── Design 031
        │   Publishing Hub / Publication Queue
        │
        └── Design 124
            Later Publishing Queue /
            Publication Management context
```

We do **not merge or rename either screen now**.

Design 124 must receive its own sequential audit.

But we record a high-priority consolidation flag:

> **031 and 124 must not become separate Publication engines.**

---

# 71. Relationship to Design 125

Later:

**Design 125 — Publication Detail / Release Management**

Expected:

```text
Design 031
Publication Queue
     ↓
one Publication
     ↓
Design 125
Publication Detail / Release Management
```

One Publication domain.

Different list/detail depths.

---

# 72. Relationship to Design 126

Later:

**Design 126 — Publishing Calendar / Release Schedule**

Expected:

```text
PublicationSchedule
      │
      ├── Queue view — 031/124
      └── Calendar view — 126
```

One scheduling backend.

No second calendar-specific release state.

---

# 73. Reusable Publishing components

Design 031 establishes:

`PublishingQueueWorkspace`
`PublicationQueueTable`
`PublicationCard`
`PublicationTypeBadge`
`PublicationStatusBadge`
`ReadinessIndicator`
`ScheduleIndicator`
`PublicationOwnerCell`
`PublicationTargetBadge`
`SourceArtifactSummary`
`PublicationFailureBadge`
`PublishingQuickViewDrawer`
`PublishActionPanel`
`RetryPublicationAction`
`PublicationVerificationIndicator`

Plus shared:

`PageHeader`
`SearchInput`
`FilterBar`
`SavedViewSelector`
`BulkActionBar` where safe.

---

# 74. Publishing queue vs detail

The Hub should summarize enough information to answer:

```text
What needs action?
When?
Who owns it?
Is it ready?
What is blocking it?
```

Complex metadata editing, attempt history and destination-level investigation can move to Publication Detail later.

This avoids turning Design 031 into an enormous all-purpose editor.

---

# 75. Bulk operations

Potentially safe bulk actions:

* assign owner,
* change scheduling group,
* add labels,
* cancel selected drafts where allowed.

Potentially risky:

```text
Bulk Publish
```

This requires explicit Phase 3D policy.

Do not assume generic multi-select means mass publication should be supported.

---

# 76. Publishing is an external side effect

Unlike editing metadata, `publish()` can create public content outside the internal system.

Therefore it needs stronger:

* confirmation,
* permission,
* validation,
* idempotency,
* audit,
* error handling.

It should never be treated as an ordinary generic CRUD update.

---

# 77. Concurrency

Example:

```text
User A reschedules Publication to 15:00
User B publishes immediately from stale state
```

Backend commands must evaluate current canonical revision/state.

Another:

```text
User A changes source artifact
User B approves publication metadata
```

Readiness should be recomputed.

---

# 78. Optimistic concurrency

Publication command processing should include a revision/version or equivalent guard where stale changes could be destructive.

A stale client should receive:

> Publication changed since you opened it.

not silently overwrite the latest state.

---

# 79. Scheduler concurrency

At exactly the scheduled time:

* background worker may initiate publishing,
* user may simultaneously cancel.

This requires an atomic state transition.

Only one authoritative result should win.

---

# 80. Partial service failure

Example:

```text
Publishing core      ✓
Asset Service        ✓
Approval Service     ✓
YouTube Integration  ✕
Website Publisher    ✓
```

Design 031 must remain usable.

Affected Publications/targets show degraded status.

The entire Hub must not disappear.

---

# 81. Unknown ≠ failed

If a provider times out after release submission:

the state may be:

```text
UNKNOWN / VERIFYING
```

rather than immediately:

```text
FAILED
```

because the provider may actually have published.

This prevents dangerous duplicate retries.

---

# 82. Verify before retry when outcome is uncertain

Example:

```text
Publish request timed out
```

Before blindly retrying, the system should check provider/publication state where possible.

Otherwise duplicate public content can result.

---

# 83. Responsive contract — Desktop

Desktop should preserve a high-density publishing operations layout:

```text
Publishing Hub Header
↓
Queue metrics / attention summaries
↓
Filters / saved views
↓
Publication queue
↓
Selected Publication quick view
↓
Readiness / schedule / target / source
↓
Allowed actions
```

This is a productivity surface.

---

# 84. Responsive contract — Tablet

Following Design 152:

* queue reduces columns,
* filter controls use sheets,
* selected Publication opens in a large drawer,
* schedule/readiness remain prominent,
* action controls remain touch-safe.

---

# 85. Responsive contract — Mobile

Following Design 151, prioritize:

```text
Publishing Summary
↓
Needs Attention
↓
Scheduled Soon
↓
Publication Cards
↓
Open Publication
↓
Exact Source Version
↓
Readiness / Blockers
↓
Schedule
↓
Target
↓
Publish / Retry / Cancel where permitted
```

Mobile should support urgent publishing operations without hiding critical version identity.

---

# 86. Mobile publish safety

Before Publish:

the user should clearly see:

* content identity,
* exact source version,
* target,
* schedule/immediate release,
* readiness result.

Do not let mobile reduce Publish to an unlabeled icon or accidental swipe action.

---

# 87. State coverage

Design 031 inherits Design 150 plus Publishing-specific states such as:

```text
Hub Loading
Queue Empty
No Filter Results

Publication Draft
Needs Metadata
Needs Approval
Needs Artifact
Not Ready
Ready
Scheduled
Schedule Changed
Publishing
Published
Verification Pending
Verified
Publish Failed
Retrying
Outcome Unknown
Cancelled
Source Superseded
Destination Disconnected
Provider Unavailable
Permission Restricted
Record Updated Elsewhere
Partial Service Failure
```

These should not all become one giant persisted enum.

---

# 88. Empty queue ≠ system unavailable

Correct:

> **Nothing is waiting to publish.**

means genuinely empty.

Incorrect when provider/query services fail:

> **All publishing complete.**

Unknown state must remain distinguishable.

---

# 89. Publishing Hub read model

A useful composed model:

```text
PublishingHubView
├── queue metrics
├── Publication summaries
├── Project/client context
├── product type
├── source artifact/version
├── readiness
├── approval summary
├── schedule
├── owner
├── target
├── latest attempt
├── verification state
└── permission-aware actions
```

This is a read composition.

---

# 90. Never PATCH the whole PublishingHubView

Avoid:

```text
PATCH /publishing-hub
{
  ready: true,
  approved: true,
  scheduled: true,
  published: true,
  distributed: true
}
```

Use domain commands:

```text
createPublication()
selectPublicationSource()
updatePublicationMetadata()
evaluatePublicationReadiness()
schedulePublication()
reschedulePublication()
cancelPublicationSchedule()
publishNow()
retryPublication()
verifyPublication()
cancelPublication()
```

---

# 91. Backend architecture

```text
Publishing Hub UI
       ↓
PublishingQueryService
       ↓
Tenant + Permission Scope
       ↓
Publishing Domain
       │
       ├── Publication
       ├── PublicationArtifact
       ├── PublicationMetadata
       ├── PublicationSchedule
       ├── PublicationTarget
       ├── PublicationAttempt
       └── Verification
       │
       ├── Asset/FileVersion Service
       ├── Approval Service
       ├── Product Source Adapters
       ├── Scheduler / Queue
       ├── Publishing Provider Adapters
       ├── Integration Service
       ├── Activity / Audit
       └── Distribution Service
```

---

# 92. Backend requirements

| Requirement                        | Status                                        |
| ---------------------------------- | --------------------------------------------- |
| Authentication                     | **Required**                                  |
| Tenant isolation                   | **Critical**                                  |
| Publishing RBAC                    | **Critical**                                  |
| Canonical Publication entity       | **Critical**                                  |
| Project/source lineage             | **Critical**                                  |
| Exact source artifact/version      | **Critical**                                  |
| PublicationArtifact model          | **Critical**                                  |
| Structured publication metadata    | **Critical**                                  |
| Publication readiness service      | **Critical**                                  |
| Approval integration               | **Critical**                                  |
| Asset/FileVersion integration      | **Critical**                                  |
| Product source adapters            | **Critical**                                  |
| Scheduling service                 | **Critical**                                  |
| Backend scheduler/workers          | **Critical**                                  |
| Scheduled readiness re-check       | **Critical**                                  |
| Publication target model           | **Required**                                  |
| Integration/credential abstraction | **Critical**                                  |
| Provider adapters                  | **Critical where external publishing occurs** |
| PublicationAttempt history         | **Critical**                                  |
| Idempotent publishing              | **Critical**                                  |
| Uncertain-outcome verification     | **Critical**                                  |
| Retry classification               | **Required**                                  |
| Publication verification           | **Required**                                  |
| Destination-specific state         | **Required**                                  |
| Concurrency protection             | **Critical**                                  |
| Client-safe projection             | **Required**                                  |
| Distribution handoff               | **Critical**                                  |
| Activity history                   | **Required**                                  |
| Audit history                      | **Critical**                                  |
| Partial failure support            | **Required**                                  |

---

# 93. Canonical publishing metrics

Definitions should be centralized for:

**Ready to Publish**
**Scheduled Publications**
**Publishing Today**
**Failed Publications**
**Published This Period**
**On-Time Publication Rate**
**Average Ready-to-Publish Time**
**Average Publish Execution Time**
**Publications Awaiting Approval**
**Publications Blocked by Metadata**
**Publications Blocked by Integration**

These can feed:

* Executive Dashboard,
* Operations Dashboard,
* Project 360,
* production workspaces,
* Publishing Hub,
* Analytics,
* reports.

No separate page-local calculations.

---

# 94. Main implementation risks

Design 031 exposes several high-priority risks:

**Production/Publication conflation**
Product workspaces mark themselves Published without a canonical release record.

**Publication/Distribution conflation**
Release and promotion/syndication collapse into one workflow.

**Latest-version publication bug**
Publisher accidentally releases an unapproved newer artifact.

**Ready/Published conflation**
Readiness is treated as actual release.

**Scheduled/Published conflation**
Future schedule displayed as completed publication.

**Provider-success/Verified conflation**
Release marked successful without confirming actual outcome.

**Opaque retry behavior**
Timeout leads to duplicate releases.

**Artifact duplication**
Publishing creates another copy rather than referencing canonical FileVersion.

**Approval duplication**
Publishing maintains its own `approved` flag separate from Design 029.

**Integration credential leakage**
Provider credentials embedded in Publication records or frontend.

**Browser scheduler architecture**
Scheduled content only publishes if a user keeps the page open.

**Metadata/source conflation**
Editorial fields and final release metadata mutate each other unexpectedly.

**Destination-state collapse**
Multi-target partial failures cannot be represented.

**Permission collapse**
Any user who can edit publication metadata can also publish or override readiness.

**Readiness override invisibility**
Policy bypass recorded as if all gates passed normally.

**031/124 duplicate engines**
Two Publishing Queue designs later implemented with independent data/workflows.

**False empty state**
Publishing-service failure displayed as “nothing to publish.”

None requires a new visual design.

They require canonical release-management architecture.

# Design 031 Audit Verdict

## **PASS — CROSS-PRODUCT PUBLISHING & RELEASE OPERATIONS ANCHOR**

**Domain directive:** **Production workstream ≠ Publication ≠ PublicationAttempt ≠ DistributionCampaign.**

**Release directive:** One canonical `Publication` domain must manage actual release across Editorial, Magazine, Podcast, Video, Event and future content products.

**Artifact directive:** Every Publication is permanently tied to the exact approved `FileVersion`, Media Version, Reader Build or equivalent source artifact intended for release.

**Version directive:** Scheduling or publishing must never dynamically resolve to “latest” production content.

**Readiness directive:** Publication readiness is server-derived from source artifact, approval, metadata, destination, rights and technical requirements.

**Approval directive:** Publishing consumes the canonical Approval domain established in Design 029 rather than storing a competing approval truth.

**Asset directive:** Publishing consumes exact Assets/FileVersions from Design 030 rather than building duplicate file storage.

**Schedule directive:** publication schedules are persisted and executed by backend scheduler/workers with execution-time eligibility checks.

**Attempt directive:** every release attempt and failure/retry remains historically traceable.

**Idempotency directive:** ambiguous timeouts/retries must not create duplicate public releases.

**Verification directive:** accepted provider response and actually verified live publication remain distinguishable.

**Integration directive:** publication targets use canonical connected-service/provider adapters; credentials never belong in Publication UI/domain payloads.

**Permission directive:** prepare, schedule, publish, retry, cancel and readiness override remain separate authority levels.

**Distribution directive:** a verified Publication becomes eligible for downstream Distribution; Publishing does not duplicate channel-promotion execution.

**Responsive directive:** desktop remains queue-heavy while mobile preserves exact source-version/readiness/target visibility before high-impact Publish actions.

**Overlap directive:** Designs **031 and 124–126** must consume one canonical Publishing domain, scheduler and release-attempt infrastructure.

**Consolidation directive:** **STANDARDIZE ONE PLATFORM-WIDE PUBLICATION + ARTIFACT + READINESS + SCHEDULING + RELEASE ATTEMPT + VERIFICATION INFRASTRUCTURE — DO NOT BUILD SEPARATE PUBLISHING ENGINES FOR EDITORIAL, MAGAZINE, PODCAST, VIDEO, EVENT OR LATER PUBLISHING SCREENS.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **31 / 153** |
| **PASS**                                   |                         **31** |
| **STANDARDIZE decisions**                  |                         **29** |
| **Potential implementation-overlap flags** |                         **22** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**31 / 153 = 20.3% of the frozen design system audited.**

### Shared platform architecture now

```text
PRODUCT EXECUTION
024 Editorial
025 Magazine
026 Podcast
027 Video
028 Event
      │
      ├──────────────┐
      ↓              ↓
029 Approval     030 Asset/File
      │              │
      └──────┬───────┘
             ↓
      031 PUBLISHING HUB
             │
             ├── Publication
             ├── Exact Artifact Version
             ├── Metadata
             ├── Readiness
             ├── Schedule
             ├── Target
             ├── Publish Attempt
             └── Verification
             ↓
        DISTRIBUTION
```

We now have three consecutive platform-wide foundations:

```text
Design 029
→ Canonical Approval Infrastructure

Design 030
→ Canonical Asset / File Infrastructure

Design 031
→ Canonical Publishing / Release Infrastructure
```

These three systems should eliminate a large amount of duplicated backend and workflow code during implementation.

# Next Sequential Audit Target

## Phase 3A.1 — Design 032 Audit

For **Design 032**, we should again verify its **exact frozen identity from the approved 153-design inventory before starting the audit**.

We should not infer it from Publishing Hub or assume it is Distribution, Publishing Detail, Calendar, Analytics, or another content-operation surface.

Once its frozen identity is known, we continue with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no guessing, no redesign, no additional screen and no sequence change.**

