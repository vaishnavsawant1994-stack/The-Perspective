Verified from the frozen design asset: the exact identity is **Design 032 — Distribution Campaign Workspace**. The approved screen is a full Team Workspace distribution command surface covering campaign status, channels, schedule, social, newsletter, PR, external platforms, assets, approvals, analytics, live links, reports and activity.

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 032 — Distribution Campaign Workspace

| Audit field                 | Classification                                                                                                                                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**               | **032**                                                                                                                                                                                                                              |
| **Canonical name**          | **Distribution Campaign Workspace**                                                                                                                                                                                                  |
| **Product area**            | Distribution / Promotion / Placement Operations                                                                                                                                                                                      |
| **User surface**            | Team Workspace                                                                                                                                                                                                                       |
| **Screen class**            | Cross-Channel Campaign Operations Workspace                                                                                                                                                                                          |
| **Classification**          | **Unique Anchor — Distribution Campaign Operations Family**                                                                                                                                                                          |
| **Primary purpose**         | Coordinate the controlled distribution of one published content asset across multiple owned, social, newsletter, PR and external platforms while preserving schedule, execution, live-placement verification and performance lineage |
| **Primary entity**          | **DistributionCampaign**                                                                                                                                                                                                             |
| **Core child entities**     | DistributionItem, DistributionSchedule, ChannelExecution, Placement/PublishedPlacement, VerificationRecord                                                                                                                           |
| **Supporting entities**     | Publication, PublicationArtifact, Channel, ConnectedAccount/Integration, CampaignAsset, ApprovalRequest, User, Project, Client, Report, Activity                                                                                     |
| **Parent shell**            | `InternalAppShell` — Design 001                                                                                                                                                                                                      |
| **Upstream domain**         | Publishing — Design 031                                                                                                                                                                                                              |
| **Template family**         | `DistributionCampaignWorkspaceTemplate`                                                                                                                                                                                              |
| **Composition**             | `DistributionCampaignComposition`                                                                                                                                                                                                    |
| **Auth**                    | Required                                                                                                                                                                                                                             |
| **Permissions**             | Distribution + channel/account + scheduling + execution + verification + reporting scopes                                                                                                                                            |
| **Implementation priority** | **Core / Critical**                                                                                                                                                                                                                  |
| **Reuse level**             | **Platform-wide / Extremely High**                                                                                                                                                                                                   |

---

# 1. Functional responsibility

Design 032 answers:

> **“For this published content, which channels are we distributing it through, what content/copy/assets are assigned to each channel, when should each placement go live, what actually succeeded, where are the verified live links, what failed, and what performance can we truthfully attribute to each placement?”**

The correct chain is:

```text
PRODUCTION
   ↓
APPROVAL
   ↓
PUBLISHING
Design 031
   ↓
Verified Publication
   ↓
DISTRIBUTION CAMPAIGN
Design 032
   │
   ├── Website amplification
   ├── Social
   ├── Newsletter
   ├── PR
   ├── External platforms
   ├── Placements
   ├── Live links
   └── Performance
   ↓
VERIFIED REPORTING
```

The primary invariant is:

> **Publication ≠ DistributionCampaign ≠ DistributionItem ≠ Placement ≠ PerformanceMetric.**

---

# 2. Publication ≠ Distribution Campaign

Design 031 owns the canonical Publication.

Design 032 starts after an eligible publication/output exists.

```text
Publication
    ↓
DistributionCampaign
```

A Publication answers:

> What content is officially released?

A Distribution Campaign answers:

> Where and how are we amplifying/distributing that release?

Do not place all channel/post information directly on `Publication`.

---

# 3. One Publication can support multiple campaigns

A Publication may have:

```text
Publication
│
├── Launch Campaign
├── Executive Amplification Campaign
└── Anniversary / Re-promotion Campaign
```

Therefore:

```text
Publication 1:N DistributionCampaign
```

must remain architecturally possible.

Exact cardinalities belong to Phase 3D.

---

# 4. DistributionCampaign ≠ OutreachCampaign

This is another important boundary.

### Outreach Campaign — Design 012

Targets Leads/Contacts to produce sales/conversation outcomes.

### Distribution Campaign — Design 032

Amplifies published media/content across channels.

They may share low-level infrastructure such as:

* scheduling,
* campaign ownership,
* status badges,
* analytics cards,
* background jobs.

But:

```text
OutreachCampaign
≠
DistributionCampaign
```

Their audiences, compliance rules, attribution and execution engines differ.

---

# 5. Campaign ≠ channel execution

The Campaign is the umbrella.

Individual executions belong below it:

```text
DistributionCampaign
│
├── LinkedIn item
├── Instagram item
├── Newsletter item
├── Website placement
├── PR item
└── External-platform item
```

A single campaign status cannot represent every individual channel result.

---

# 6. Canonical DistributionItem

A useful conceptual entity is:

```text
DistributionItem
├── campaignId
├── channelId
├── sourcePublicationId
├── sourceArtifactVersion
├── content/copy snapshot
├── scheduledAt
├── state
├── execution reference
└── placement/result
```

Exact schema comes in Phase 3D.

The key requirement:

> One channel execution must be traceable independently.

---

# 7. DistributionItem ≠ social post only

The same abstraction may represent different distribution types:

```text
SOCIAL_POST
NEWSLETTER
PR_DISTRIBUTION
WEBSITE_PLACEMENT
EXTERNAL_PLATFORM
OTHER_SUPPORTED_PLACEMENT
```

Exact enums wait.

Do not hard-code the Distribution domain around only LinkedIn/Instagram.

---

# 8. Channel ≠ connected account

Example:

```text
Channel:
LinkedIn

Connected Account:
The Perspective Global
```

or:

```text
Channel:
Instagram

Connected Account:
@the.perspective
```

These are separate entities.

Conceptually:

```text
Channel
   ↓
ConnectedAccount / Integration
```

Channel identifies capability/type.

ConnectedAccount identifies the authorized execution context.

---

# 9. Connected account ≠ campaign

Provider credentials must remain in the Integration domain.

Never store:

```text
campaign.linkedinAccessToken
campaign.instagramRefreshToken
```

Distribution only references an approved connection.

---

# 10. Connection health affects execution

Example:

```text
Distribution Item:
SCHEDULED

Instagram Connection:
AUTH EXPIRED
```

Then the item should become operationally blocked/degraded.

Do not pretend:

> campaign failed

when the actual failure is specifically:

> Instagram authorization expired.

---

# 11. Campaign lifecycle ≠ individual item lifecycle

Example:

```text
Campaign:
ACTIVE

LinkedIn:
PUBLISHED

Instagram:
SCHEDULED

Newsletter:
DRAFT

PR:
FAILED
```

This is normal.

Therefore Campaign status should summarize the campaign, not replace individual channel states.

---

# 12. Campaign status ≠ campaign health

A campaign can be:

```text
Status:
ACTIVE

Health:
AT_RISK
```

because:

* one critical channel failed,
* schedule is slipping,
* approval missing,
* provider disconnected.

Health should be derived from operational signals.

---

# 13. Campaign progress requires one definition

The approved design visually tracks:

* total channels,
* published,
* scheduled,
* failed,
* overall progress.

Those figures must come from canonical item state.

For example:

```text
Campaign Progress
=
completed eligible DistributionItems
/
total active DistributionItems
```

or another Phase 3D-approved rule.

Do not calculate progress independently in UI cards.

---

# 14. Published item ≠ verified placement

Permanent distinction:

```text
Provider said:
Published
```

does not necessarily prove:

```text
Verified live placement exists
```

Therefore:

```text
Execution Success
≠
Placement Verification
```

This matters strongly for Client reporting.

---

# 15. Placement should be first-class

Conceptually:

```text
Placement
├── distributionItemId
├── channel
├── public/external URL
├── external resource ID
├── publishedAt
├── verification state
├── verifiedAt
└── verification evidence
```

The system should be able to answer:

> Where exactly was this content placed?

---

# 16. Live URL ≠ verification proof

A URL stored in the database is not automatically a verified result.

Potential states can conceptually distinguish:

```text
URL_CAPTURED
VERIFICATION_PENDING
VERIFIED
VERIFICATION_FAILED
UNAVAILABLE
```

Exact enums later.

---

# 17. Never fabricate live links

If an external platform cannot provide a real published URL:

do not create placeholder links simply to satisfy a UI card.

Design 032 must obey the platform's established rule:

> **Verified metrics and placements only.**

Unknown must remain unknown.

---

# 18. Distribution schedule ≠ Publishing schedule

Design 031 schedules the canonical release.

Design 032 schedules downstream amplification.

Example:

```text
Publication:
May 20 — 09:00

LinkedIn:
May 20 — 10:00

Newsletter:
May 21 — 08:00

PR:
May 21 — 14:00
```

These are related but independent schedules.

---

# 19. Distribution cannot precede required Publication

If a DistributionItem requires a live Publication:

```text
Publication verified?
   ↓
NO
   ↓
Distribution blocked
```

unless the specific channel legitimately publishes independently from the Publication.

Those rules should be channel/campaign policy—not frontend assumptions.

---

# 20. Scheduling uses backend workers

Correct:

```text
DistributionItem scheduled
      ↓
persist schedule
      ↓
background scheduler
      ↓
execution-time validation
      ↓
provider adapter
      ↓
result
```

Browser timers are unacceptable.

---

# 21. Re-check before execution

Between scheduling and execution:

* Publication may be withdrawn.
* Approval may become superseded.
* Connection may expire.
* Asset may become unavailable.
* Campaign may be paused.

The worker must re-evaluate eligibility immediately before publishing.

---

# 22. Scheduled content must be pinned

Example:

```text
LinkedIn post scheduled
Source:
Publication revision 2
Asset:
Social Creative v4
Copy:
Campaign Copy v3
```

Tomorrow, users create newer versions.

The scheduled item must not silently switch to them.

Distribution execution requires exact version/snapshot references.

---

# 23. Channel copy ≠ Publication copy

Social, PR and newsletter formats often need different messaging.

Therefore:

```text
Publication metadata
≠
DistributionItem copy
```

while lineage is preserved.

A LinkedIn post should not mutate the original Publication title/description.

---

# 24. Distribution copy should preserve history

Once a channel item is published, preserve the exact content used:

```text
caption
headline
CTA
hashtags
mentions
links
```

Later editing of campaign templates must not rewrite historical published content.

---

# 25. UTM/tracking configuration

Design 032 explicitly includes campaign tracking context.

Tracking parameters should be canonical structured data:

```text
utm_source
utm_medium
utm_campaign
utm_content
```

or equivalent tracking metadata.

Do not construct inconsistent tracking strings separately in every UI component.

---

# 26. Tracking identifier ≠ analytics truth

UTM parameters help attribution.

They do not prove:

* reach,
* impressions,
* engagement.

Those metrics still require real data sources.

---

# 27. Social distribution

Social execution should use:

```text
DistributionItem
      ↓
SocialChannelAdapter
      ↓
Connected Account
```

The Distribution domain should normalize execution/result data without letting provider-specific objects dominate the business model.

---

# 28. Newsletter distribution

Newsletter is not just another social post.

It may require:

* audience/list,
* subject,
* preheader,
* template,
* send schedule,
* delivery metrics.

Distribution can share campaign orchestration while the Newsletter provider/service retains its specialized semantics.

---

# 29. PR distribution

Likewise PR may involve:

* release copy,
* destination/provider,
* submission result,
* published placement,
* verification.

It should not be reduced to:

```text
socialPost.type = PR
```

One campaign orchestration layer can support specialized executors.

---

# 30. External-platform distribution

Platforms such as magazine readers, content syndication services or authority platforms may require:

* asset upload,
* metadata,
* processing,
* approval,
* external identifier.

Use adapters.

Do not embed platform-specific fields across the core DistributionCampaign model.

---

# 31. Distribution channel registry

A reusable concept should exist:

```text
DistributionChannel
├── type
├── capabilities
├── supported media
├── scheduling support
├── metrics support
├── verification capability
└── integration requirement
```

This prevents the frontend from assuming every channel behaves the same.

---

# 32. Capability-aware UX

Example:

```text
LinkedIn
✓ scheduling
✓ live URL
✓ engagement metrics

External Platform X
✕ scheduling
✓ manual placement
? analytics
```

The system must gracefully support different capabilities.

No fake disabled-but-working controls.

---

# 33. Automatic vs manual placements

Not every channel will have an API.

Architecture should allow:

```text
AUTOMATED
MANUAL_VERIFIED
```

execution methods where appropriate.

Manual placement should still require evidence/live URL where reporting claims verification.

---

# 34. Manual placement ≠ fabricated placement

If staff records a manual placement:

the system should capture who entered it and evidence/URL where required.

It should not become “verified” simply because an employee typed a platform name.

---

# 35. Distribution approval

Some campaign items or campaign plans may require approval.

Design 032 should consume Design 029:

```text
Distribution content/version
       ↓
ApprovalRequest
       ↓
ApprovalDecision
```

No `distributionItem.approvedByText` parallel truth.

---

# 36. Approval applies to exact content version

If:

```text
LinkedIn Copy v2
APPROVED
```

and v3 is created:

```text
v3 ≠ approved
```

unless defined non-material revision policy permits it.

The exact-version rule remains platform-wide.

---

# 37. Assets reuse Design 030

Distribution may need:

* social graphics,
* thumbnails,
* short clips,
* PDFs,
* campaign creatives.

These all reference canonical Assets/FileVersions.

```text
DistributionItem
      ↓
CampaignAssetReference
      ↓
Asset/FileVersion
```

No separate distribution file store.

---

# 38. Campaign Asset ≠ master Asset

An Asset can have campaign-specific usage context.

For example:

```text
Asset:
Executive Insights Cover

Usage:
LinkedIn campaign creative
```

Do not copy the binary to create a campaign relationship.

---

# 39. Distribution item execution

A strong execution chain is:

```text
DistributionItem
      ↓
ExecutionJob
      ↓
Provider/Manual Executor
      ↓
ExecutionResult
      ↓
Placement
      ↓
Verification
      ↓
Metrics
```

These concerns should not be represented by one `status` field.

---

# 40. Execution attempt history

Retries must preserve attempts:

```text
ChannelExecution
├── Attempt 1 — rate limited
├── Attempt 2 — provider timeout
└── Attempt 3 — published
```

Failure history is valuable operational data.

---

# 41. Retry must be idempotent

If the provider actually published but timed out before returning success:

blindly retrying could create duplicate posts.

Correct:

```text
outcome uncertain
      ↓
verify provider state
      ↓
retry only when safe
```

This mirrors Design 031's Publishing reliability requirement.

---

# 42. Failure classification

Distribution failures should identify the real source:

```text
AUTH
RATE_LIMIT
VALIDATION
PROVIDER
NETWORK
ASSET
CONTENT
UNKNOWN
```

Exact values later.

Do not only store:

```text
FAILED
```

without actionable context.

---

# 43. Campaign pause ≠ item cancellation

Pausing a campaign means future execution should stop temporarily.

Already published items remain published.

Correct:

```text
Campaign paused
├── Published item → remains published
├── Scheduled item → held
└── Future item → held
```

Do not rewrite historical placement state.

---

# 44. Campaign cancellation ≠ removal of live posts

Cancelling internal campaign execution does not necessarily remove already-live external content.

That requires explicit provider/domain action if supported.

Therefore:

```text
Campaign cancelled
≠
all external content deleted
```

---

# 45. Remove from campaign ≠ delete external publication

If the approved UI exposes “Remove from Campaign,” the command semantics must be explicit.

Removing an internal association should not silently delete the live LinkedIn/PR/etc. item unless that destructive action is specifically requested and supported.

---

# 46. Channel performance metrics

Potential verified metrics include:

```text
reach
impressions
clicks
engagement
views/plays
```

depending on channel capability.

But metric availability varies by provider.

---

# 47. Metric ≠ estimate

This is extremely important.

The frozen visual contains labels such as **Reach (Est.)**.

Architecture should distinguish:

```text
VERIFIED
ESTIMATED
MANUAL
UNAVAILABLE
```

or equivalent provenance.

Client reporting must never present an estimate as verified platform data.

---

# 48. Metric provenance

A canonical metric should conceptually preserve:

```text
metric
value
source
sourceRecord/provider
collectedAt
period
provenance/verification
```

This will become critical for Reporting.

---

# 49. Snapshot metrics vs live metrics

A campaign dashboard may show current metrics.

A generated client report should use a defined snapshot/version.

Correct:

```text
Live campaign analytics
        ↓
Report snapshot at generation time
```

Do not allow historical reports to change retroactively every time live metrics update.

---

# 50. Engagement rate needs one formula

Example:

```text
Engagement Rate
=
engagement actions / impressions
```

or provider-native definition.

Whichever rule applies must be canonical and source-aware.

LinkedIn's semantics may differ from Newsletter or Website analytics.

Do not compare incomparable metrics without normalization/context.

---

# 51. Channel ranking must use comparable metrics

The UI's “Top Performing Channels” must not compare raw metrics carelessly.

Example:

```text
Email open rate
vs
LinkedIn engagement rate
```

are not inherently equivalent.

Any “top channel” ranking needs a defined normalized metric or clearly selected measure.

---

# 52. Estimated Reach requires explicit provenance

If Reach is estimated:

the UI/report must preserve:

> Estimated

not strip that qualifier later.

This should travel with the metric record or read model.

---

# 53. Live links

A Campaign can aggregate verified placements:

```text
DistributionCampaign
      ↓
Placements
      ↓
Live Links
```

This should use canonical Placement records.

No separate unrelated “LiveLink” truth unless it is simply a projection/entity with formal linkage.

---

# 54. Link health

A placement link may later:

* disappear,
* redirect,
* return error,
* become inaccessible.

Verification can be repeated over time.

Conceptually:

```text
PlacementVerification
├── verifiedAt
├── status
└── evidence
```

History should not be overwritten blindly.

---

# 55. Initial verification ≠ permanent availability

Example:

```text
May 20:
VERIFIED

June 10:
UNAVAILABLE
```

Both facts matter.

Reporting should state which verification snapshot it uses.

---

# 56. Distribution report boundary

Design 032 may generate/launch reporting.

But canonical report generation belongs to the Reporting domain.

Correct:

```text
Campaign + Verified Metrics
       ↓
Reporting Service
       ↓
Report
```

DistributionCampaign does not become the Report itself.

---

# 57. Relationship to Design 130

Later:

**Design 130 — Final Distribution Report / Client Performance Report**

should consume the same canonical:

* campaign,
* placement,
* metric,
* verification

data.

No second reporting data pipeline.

---

# 58. Relationship to Designs 127–129

The frozen roadmap later contains:

**127 — Distribution Campaign Management**
**128 — Distribution Channel / Placement Detail**
**129 — Distribution Performance & Verification**

These are major overlap checkpoints.

Current architecture must assume:

```text
Canonical Distribution Domain
│
├── 032 Distribution Campaign Workspace
├── 127 Campaign Management
├── 128 Channel / Placement Detail
└── 129 Performance & Verification
```

We do **not** merge these screens now.

But:

> They must never become separate Distribution engines.

---

# 59. Design 032 likely represents the broad 360 composition

Architecturally:

### Design 032

Cross-channel campaign-wide command workspace.

Later specialized screens can go deeper into:

* campaign management,
* one placement/channel,
* verification/performance.

This mirrors:

```text
Project 360
→ specialized Project screens
```

and:

```text
Publishing Hub
→ Publication Detail / Calendar
```

---

# 60. Relationship to Design 031

Clear boundary:

### Design 031

**Release the canonical Publication.**

### Design 032

**Amplify/distribute that released content.**

```text
031 Publication verified/live
        ↓
032 Distribution Campaign
```

One should trigger eligibility for the other without merging lifecycles.

---

# 61. Relationship to Project 360

Design 023 may summarize:

```text
Distribution:
68%
```

but should consume the Distribution domain.

It should not reproduce all channels, metrics, live links and execution attempts.

---

# 62. Relationship to Client 360

Design 021 may summarize:

* active campaign,
* live placements,
* performance/report availability.

But it must respect permission and metric verification.

Client 360 does not calculate Distribution metrics independently.

---

# 63. Client Portal boundary

Clients may legitimately see:

* published links,
* distribution status,
* verified placements,
* approved performance metrics,
* client-safe reports.

They should not automatically see:

* provider credentials,
* internal notes,
* failed draft posts,
* internal scheduling commentary,
* staff performance,
* unverified estimates represented as facts.

Use explicit client-safe projections.

---

# 64. Permissions architecture

Potential Phase 3D capabilities include:

```text
distribution.read
distribution.create
distribution.edit
distribution.assign
distribution.schedule
distribution.publish
distribution.pause
distribution.cancel
distribution.retry
distribution.verify
distribution.metrics.read
distribution.export
```

Exact names later.

Key rule:

```text
READ
≠
EDIT COPY
≠
SCHEDULE
≠
PUBLISH
≠
RETRY
≠
VERIFY
≠
EXPORT
```

---

# 65. Channel-specific authority

A user may manage:

```text
LinkedIn
Newsletter
```

but not:

```text
PR provider
External syndication
```

Connection/channel scopes should be enforceable where needed.

---

# 66. View metrics ≠ export metrics

Users who can view campaign analytics should not automatically receive bulk export rights.

This mirrors CRM, Event and Asset security principles.

---

# 67. Publish permission ≠ connected-account administration

A Distribution Manager may use an approved LinkedIn connection.

That does not mean they may:

* replace OAuth credentials,
* disconnect the account,
* modify system integration secrets.

Designs 139–140 later own Integration administration.

---

# 68. Approval ≠ distribution publish authority

A person approving campaign copy may not be authorized to execute the external post.

These are independent duties.

---

# 69. Reusable components

Design 032 establishes/formalizes:

`DistributionCampaignHeader`
`CampaignProgressSummary`
`ChannelExecutionTable`
`ChannelStatusBadge`
`PlacementVerificationBadge`
`DistributionScheduleList`
`DistributionChecklist`
`TopChannelSummary`
`CampaignPerformanceCard`
`ChannelStatusChart`
`LiveLinkCell`
`ChannelQuickViewDrawer`
`DistributionNextActions`
`DistributionFailureIndicator`

Shared infrastructure:

`PageHeader`
`RecordTabs`
`ProgressRing`
`FilterBar`
`ActivityFeed`
`ApprovalBadge`
`AssetPreview`
`OwnerControl`

---

# 70. Template classification

Design 032 establishes:

```text
DistributionCampaignWorkspaceTemplate
```

with:

```text
Entity Detail / 360 principles
+
Campaign operations
+
Scheduling
+
Execution
+
Verification
+
Analytics
```

It is not merely another generic campaign table.

---

# 71. Responsive — Desktop

Desktop should preserve the approved dense operations layout:

```text
Campaign Header
↓
Status / Schedule / Progress
↓
Tabs
↓
Channel Execution Table
+
Distribution Checklist
+
Channel Details
↓
Performance
+
Upcoming Schedules
+
Activity
```

This is appropriately desktop-first.

---

# 72. Responsive — Tablet

Following Design 152:

* summary cards reduce columns,
* channel table retains only key fields,
* channel detail becomes drawer/sheet,
* schedule remains touch-friendly,
* charts stack,
* campaign controls remain visible.

Tablet may be useful for Distribution Managers operating away from desktop.

---

# 73. Responsive — Mobile

Following Design 151, prioritize:

```text
Campaign Identity
↓
Campaign Health / Progress
↓
Urgent Failures
↓
Scheduled Next
↓
Published / Failed Channels
↓
Selected Channel
↓
Live Link / Verification
↓
Core Metrics
↓
Retry / Reschedule / Pause
```

Do not squeeze the entire analytics table horizontally.

---

# 74. Mobile high-risk actions

For actions such as:

* Publish Now,
* Retry,
* Remove,
* Cancel Campaign,

mobile should clearly display:

* channel,
* exact content/source,
* account,
* consequence.

No destructive swipe-only interaction.

---

# 75. State coverage

Design 032 inherits Design 150 plus Distribution-specific states:

```text
Campaign Loading
Campaign Not Found

Draft
Ready
Active
Paused
Completed
Cancelled

No Channels
Channel Draft
Scheduled
Execution Pending
Publishing
Published
Verification Pending
Verified
Execution Failed
Outcome Unknown
Retrying
Skipped

Connection Expired
Provider Unavailable
Placement Missing
Metrics Unavailable
Metrics Delayed

Permission Restricted
Record Updated Elsewhere
Partial Service Failure
```

These are not necessarily one single persisted enum.

---

# 76. Empty ≠ unavailable

Examples:

> **No channels added**

is legitimate empty state.

> **Channel service unavailable**

is a system failure.

Similarly:

> **0 clicks**

is verified zero.

> **Click data unavailable**

is unknown.

This distinction is essential for Distribution.

---

# 77. Backend read model

A useful composed view:

```text
DistributionCampaignView
├── Campaign
├── Publication context
├── Project / Client context
├── owner/team
├── progress/health
├── DistributionItems
├── channel/account summaries
├── schedules
├── execution status
├── placements
├── verification
├── metric snapshots
├── approvals
├── assets
├── next actions
└── activity
```

This is a read composition.

---

# 78. Do not PATCH the entire campaign workspace

Avoid:

```text
PATCH /distribution-campaign
{
  linkedinPublished: true,
  instagramPublished: false,
  reach: 1200000,
  liveLink: "...",
  completed: true
}
```

Prefer domain commands:

```text
createDistributionCampaign()
addDistributionItem()
updateDistributionCopy()
attachCampaignAsset()
scheduleDistributionItem()
rescheduleDistributionItem()
executeDistributionItem()
retryDistributionExecution()
pauseCampaign()
resumeCampaign()
cancelCampaign()
recordManualPlacement()
verifyPlacement()
ingestDistributionMetrics()
```

---

# 79. Backend architecture

```text
Distribution Campaign UI
        ↓
DistributionQueryService
        ↓
Tenant + Permission Scope
        ↓
Distribution Domain
        │
        ├── DistributionCampaign
        ├── DistributionItem
        ├── DistributionSchedule
        ├── ChannelExecution
        ├── ExecutionAttempt
        ├── Placement
        ├── PlacementVerification
        └── Metric Snapshot
        │
        ├── Publishing Service
        ├── Asset/FileVersion Service
        ├── Approval Service
        ├── Channel Registry
        ├── Integration Service
        ├── Scheduler / Queue
        ├── Provider Adapters
        ├── Reporting Service
        └── Activity / Audit
```

---

# 80. Backend requirements

| Requirement                               | Status                    |
| ----------------------------------------- | ------------------------- |
| Authentication                            | **Required**              |
| Tenant isolation                          | **Critical**              |
| Distribution RBAC                         | **Critical**              |
| Canonical DistributionCampaign            | **Critical**              |
| Publication linkage                       | **Critical**              |
| DistributionItem model                    | **Critical**              |
| Exact source/artifact snapshots           | **Critical**              |
| Channel registry                          | **Critical**              |
| Connected-account abstraction             | **Critical**              |
| Channel capability model                  | **Required**              |
| Campaign scheduling                       | **Critical**              |
| Background execution workers              | **Critical**              |
| Execution-time eligibility re-check       | **Critical**              |
| Provider adapter abstraction              | **Critical**              |
| Manual-placement support where applicable | **Required architecture** |
| ExecutionAttempt history                  | **Critical**              |
| Idempotent execution/retry                | **Critical**              |
| Placement entity                          | **Critical**              |
| Live-link verification                    | **Critical**              |
| Metric provenance                         | **Critical**              |
| Estimated vs verified metric distinction  | **Critical**              |
| Metric snapshots                          | **Required**              |
| Approval integration                      | **Required**              |
| Asset/FileVersion integration             | **Critical**              |
| Integration health handling               | **Critical**              |
| Reporting integration                     | **Required**              |
| Concurrency protection                    | **Critical**              |
| Client-safe projections                   | **Critical**              |
| Partial failure support                   | **Critical**              |
| Activity history                          | **Required**              |
| Audit history                             | **Required**              |

---

# 81. Canonical Distribution metrics

Definitions should be centralized for:

**Campaign Progress**
**Channels Published**
**Scheduled Items**
**Failed Items**
**Verified Placements**
**Reach**
**Estimated Reach**
**Impressions**
**Clicks**
**Engagement Rate**
**Distribution Completion Rate**
**Placement Verification Rate**
**On-Time Distribution Rate**

These can appear across:

* Executive Dashboard,
* Operations Dashboard,
* Project 360,
* Client 360,
* Distribution Workspace,
* Reports,
* Analytics.

No page-local formulas.

---

# 82. Main implementation risks

Design 032 flags several critical risks:

**Publication/Distribution conflation**
Publishing and amplification treated as one lifecycle.

**Outreach/Distribution campaign conflation**
Sales-email campaigns and media distribution using the same business engine.

**Campaign/item conflation**
One campaign status unable to represent per-channel results.

**Channel/account conflation**
LinkedIn as a channel confused with a specific connected LinkedIn account.

**Schedule/browser coupling**
Distribution only executes while a user has the page open.

**Latest-content bug**
Scheduled post silently switches to a newer Asset/copy version.

**Provider-success/verification conflation**
API success treated as verified live placement.

**Live-link fabrication**
Placeholder URLs recorded as genuine distribution evidence.

**Verified/estimated metric conflation**
Estimated reach displayed as verified provider data.

**Metric formula drift**
Each dashboard calculates engagement/progress differently.

**Retry duplication**
Provider timeout produces duplicate social/PR placements.

**Campaign cancellation/external deletion conflation**
Cancelling internal Campaign accidentally removes public content.

**Internal/client visibility leakage**
Failed drafts, internal notes or provider issues exposed through Client Portal.

**Integration permission leakage**
Distribution users gain credential-administration rights.

**Mega-save concurrency**
Social, Newsletter, PR and external-platform teams overwrite each other.

**032/127–129 duplicate engines**
Later Distribution screens receive independent data models.

None requires an additional visual design.

They require canonical Distribution architecture.

# Design 032 Audit Verdict

## **PASS — CROSS-CHANNEL DISTRIBUTION CAMPAIGN OPERATIONS ANCHOR**

**Domain directive:** **Publication ≠ DistributionCampaign ≠ DistributionItem ≠ Placement ≠ PerformanceMetric.**

**Upstream directive:** Design 032 consumes canonical verified/eligible Publications from Design 031 rather than duplicating Publishing.

**Campaign directive:** `DistributionCampaign` is the cross-channel umbrella; every channel execution remains individually persisted and traceable.

**Channel directive:** Channel identity, connected account, execution capability and provider credentials remain separate concerns.

**Scheduling directive:** all distribution schedules execute through persistent backend scheduler/workers with fresh eligibility checks.

**Version directive:** scheduled channel items remain pinned to exact Publication, copy and Asset versions; they never dynamically follow “latest.”

**Execution directive:** channel executions retain attempt history and use idempotent retry behavior.

**Placement directive:** successful execution and verified live placement remain distinct; canonical Placement/Verification records preserve real URLs/evidence.

**Metrics directive:** verified, estimated, manual and unavailable metrics must remain distinguishable with explicit provenance.

**Reporting directive:** reports consume canonical Distribution campaign/placement/metric snapshots; reports do not become the operational source of truth.

**Approval directive:** Distribution approvals reuse Design 029's canonical Approval service.

**Asset directive:** campaign creatives reuse Design 030's exact Asset/FileVersion infrastructure.

**Integration directive:** platform/provider connections are consumed through Integration adapters; Distribution never owns raw credentials.

**Permission directive:** read, edit, schedule, publish, retry, pause/cancel, verify, metric access and export remain independently enforceable.

**Client directive:** client-facing Distribution status exposes only approved placements and properly qualified metrics through safe projections.

**Responsive directive:** desktop remains analytics/execution dense while mobile prioritizes failures, schedules, verification and urgent operational actions.

**Overlap directive:** Designs **032 and 127–130** must ultimately operate over one canonical Distribution/Placement/Verification/Metric infrastructure.

**Consolidation directive:** **STANDARDIZE ONE PLATFORM-WIDE DISTRIBUTION CAMPAIGN + CHANNEL EXECUTION + SCHEDULING + PLACEMENT + VERIFICATION + METRIC-PROVENANCE INFRASTRUCTURE — DO NOT BUILD SEPARATE DISTRIBUTION ENGINES FOR MAGAZINE, PODCAST, VIDEO, EVENTS, SOCIAL, NEWSLETTER, PR OR LATER DISTRIBUTION SCREENS.**

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **32 / 153** |
| **PASS**                                   |                         **32** |
| **STANDARDIZE decisions**                  |                         **30** |
| **Potential implementation-overlap flags** |                         **23** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**32 / 153 = 20.9% audited.**

### Canonical post-production architecture after Design 032

```text
PRODUCT PRODUCTION
024–028
      ↓
APPROVAL
029
      ↓
ASSET / FILE VERSION
030
      ↓
PUBLISHING
031
      │
      ├── Publication
      ├── Exact Artifact
      ├── Readiness
      ├── Schedule
      └── Verification
      ↓
DISTRIBUTION
032
      │
      ├── DistributionCampaign
      ├── DistributionItem
      ├── Channel
      ├── Connected Account
      ├── Schedule
      ├── Execution Attempts
      ├── Placement
      ├── Verification
      └── Metric Provenance
      ↓
REPORTING
```

The architecture now has a clean separation:

```text
CREATE
  ↓
APPROVE
  ↓
PUBLISH
  ↓
DISTRIBUTE
  ↓
VERIFY
  ↓
REPORT
```

# Next Sequential Audit Target

## Phase 3A.1 — Design 033 Audit

For **Design 033**, we should again retrieve its **exact frozen identity from the approved 153-design inventory before auditing it**.

We should not infer it from Distribution Campaign Workspace or assume it is Channel Detail, Distribution Analytics, Reporting, Renewal, Calendar, or another operations screen.

Once verified, we continue with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no guessing, no redesign, no additional screen and no sequence change.**

