# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 073 — Client Distribution Detail

Its frozen identity and supplied route annotation **`/client/distribution`** are locked. Exact route connections remain a **Phase 3B** concern and are not being redesigned here.

Design 073 should become the **canonical Client Portal distribution-detail and delivery-evidence surface** for Client-visible DistributionCampaigns, their individual DistributionItems, per-channel executions, verified placements, and safely comparable performance evidence.

Its governing boundary is:

> **Publication ≠ DistributionCampaign ≠ DistributionItem ≠ ChannelExecution ≠ Placement ≠ Verification ≠ PerformanceMetric ≠ MetricObservation/Aggregate ≠ Report ≠ ClientAction.**

The central implementation rule is:

> **Design 073 must consume canonical published/released artifacts and placements from Publishing; it must never recreate Publication state. Distribution execution, placement verification, and performance measurement are separate layers, and every metric shown to the Client must preserve its source, definition, freshness, and provenance.**

---

# 1. Classification

| Audit field                           | Classification                                                                                                                                                              |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                         | **073**                                                                                                                                                                     |
| **Canonical name**                    | **Client Distribution Detail**                                                                                                                                              |
| **Product area**                      | Client Portal / Distribution / Delivery / Performance                                                                                                                       |
| **User surface**                      | **Client Portal**                                                                                                                                                           |
| **Screen class**                      | Distribution Campaign + Channel Execution + Verified Placement Detail                                                                                                       |
| **Classification**                    | **Portal Delivery Detail Anchor — Client Distribution, Placement Verification & Performance Family**                                                                        |
| **Primary purpose**                   | Show how canonical published content was distributed across channels, what executions succeeded, where placements were verified, and what performance evidence is available |
| **Canonical Distribution foundation** | Design 032                                                                                                                                                                  |
| **Client overview foundation**        | Design 055                                                                                                                                                                  |
| **Publishing/Placement foundation**   | Design 072 / Design 031                                                                                                                                                     |
| **Primary campaign entity**           | **DistributionCampaign**                                                                                                                                                    |
| **Per-destination work entity**       | **DistributionItem**                                                                                                                                                        |
| **Execution entity**                  | **ChannelExecution**                                                                                                                                                        |
| **Resulting destination entity**      | **Placement**                                                                                                                                                               |
| **Evidence entity**                   | **Verification / PlacementVerification**                                                                                                                                    |
| **Metric-definition entity**          | **PerformanceMetric / MetricDefinition**                                                                                                                                    |
| **Metric evidence entity**            | **MetricObservation / MetricAggregate**                                                                                                                                     |
| **Reporting dependency**              | Designs 033 / 056 / 130–134                                                                                                                                                 |
| **Analytics dependency**              | Design 038                                                                                                                                                                  |
| **Client Action dependency**          | Design 047 where genuine Client input exists                                                                                                                                |
| **Notification dependency**           | Designs 061 / 064                                                                                                                                                           |
| **Activity dependency**               | Design 063                                                                                                                                                                  |
| **Internal distribution overlap**     | Designs 127–130                                                                                                                                                             |
| **Parent shell**                      | `ClientPortalShell` — Design 002                                                                                                                                            |
| **Primary read model**                | `ClientDistributionDetailView`                                                                                                                                              |
| **Template family**                   | `ClientDistributionPerformanceDetailTemplate`                                                                                                                               |
| **Auth**                              | Required                                                                                                                                                                    |
| **Authorization**                     | Active Portal membership + Project/Publication access + Distribution/Placement/Metric visibility                                                                            |
| **Implementation priority**           | **Critical Delivery Evidence / Channel Verification / Performance Trust**                                                                                                   |
| **Reuse level**                       | **Extremely High with Designs 032, 055 and 072**                                                                                                                            |

Design 073 should answer:

> **“Which published content was distributed, through which campaign and channel executions, which placements were actually verified, what performance data is genuinely available for each placement/channel, how trustworthy/fresh is that data, and what should not be compared directly across channels?”**

Canonical architecture:

```text
Canonical Publication / PublicationVersion
                  │
                  ↓
         DistributionCampaign
                  │
            ┌─────┴─────┐
            ↓           ↓
     DistributionItem  DistributionItem
            │           │
            ↓           ↓
     ChannelExecution  ChannelExecution
            │           │
            ↓           ↓
         Placement    Placement
            │           │
            ↓           ↓
        Verification Verification
            │           │
            ↓           ↓
      MetricObservation(s)
            │
            ↓
       MetricAggregate(s)
            │
            ↓
 Client-safe Distribution Detail
            │
            ↓
          Design 073
```

---

# 2. Reuse

## Design 032 remains the canonical Distribution engine

Design 032 already established:

> **Publication ≠ DistributionCampaign ≠ DistributionItem ≠ Placement ≠ PerformanceMetric.**

Design 073 must consume that same foundation directly.

Do **not** create:

```text
ClientDistribution
PortalDistribution
ClientPlacement
DistributionPerformanceRecord
```

as parallel truth.

Correct:

```text
Design 032
Canonical Distribution domain
        │
        ├── Design 055
        │   Client publishing/distribution overview
        │
        └── Design 073
            Client distribution detail
```

---

## Design 072 remains authoritative for primary Publication/Placement truth

Design 073 should start from canonical release references such as:

```text
Publication
PublicationVersion
PublicationArtifact
Placement
Verification
```

where distribution is anchored to a published release.

It must not re-decide:

> Was this content published?

That belongs to Design 031/072.

---

## Distribution should consume exact release/version references

Correct:

```text
DistributionCampaign DC-101
→ PublicationVersion PV-7
→ exact approved/released artifact
```

Not:

```text
DistributionCampaign
→ Project
→ use latest media asset
```

The campaign must know exactly what version/content it distributed.

---

## Design 073 ≠ Design 072

### Design 072

Primary release / live-placement truth.

### Design 073

Downstream distribution/amplification and channel performance.

Example:

```text
Publication:
Magazine issue live on The Perspective.

Distribution:
LinkedIn post
Newsletter placement
Medium article
PR placement
Podcast promotion
```

They can share Placement/Verification infrastructure without becoming one workflow.

---

## Reuse Design 038 Metric Registry

Design 038 established:

> **Operational record ≠ MetricDefinition ≠ aggregate ≠ visualization.**

Design 073 should reuse one canonical Metric Registry for:

* impressions,
* views,
* clicks,
* engagement,
* opens,
* conversions,

where those metrics exist.

Do not invent channel-specific metric names independently in the Client Portal.

---

## Reuse Designs 033 / 056 for finalized reporting

Design 073 can show current distribution performance.

But a finalized Client Report remains:

```text
Report
→ ReportVersion
→ frozen/reconstructable metric snapshot
```

Do not turn the live Distribution detail into a finalized Report automatically.

---

## Reuse Design 063 Activity separately

Meaningful events can project:

> LinkedIn placement verified.

> Distribution campaign completed.

But Activity is not Placement or Metric truth.

---

## Reuse Design 064 Notifications separately

Notifications can alert:

> Your distribution campaign is complete.

That notification should derive from canonical campaign/verification state.

---

## Reuse Design 047 only for genuine Client actions

If a Client genuinely needs to:

* provide channel information,
* approve distribution copy,
* supply credentials through a governed integration flow,

a ClientAction may exist.

Internal channel retries or metric-fetch failures are not Client actions by default.

---

# 3. Entities

## Publication ≠ DistributionCampaign

A Publication establishes released content.

A DistributionCampaign defines an organized effort to distribute/amplify that content.

Example:

```text
Publication PUB-101
→ Magazine Issue v3

DistributionCampaign DC-101
→ “Executive Magazine Launch Distribution”
```

The campaign references the publication.

It does not replace it.

---

## DistributionCampaign can reference exact PublicationVersion

Critical:

```text
DistributionCampaign
→ PublicationVersion PV-3
```

not merely:

```text
→ Publication PUB-101
→ whatever is current
```

Historical distribution evidence must remain tied to what was actually distributed.

---

## Publication can have multiple DistributionCampaigns

Example:

```text
Publication PV-3
├── Initial launch campaign
├── 30-day amplification campaign
└── Renewal promotion campaign
```

No one-to-one assumption.

---

## DistributionCampaign ≠ DistributionItem

`DistributionCampaign` is the coordinating container.

`DistributionItem` represents a specific unit of channel/destination work.

Conceptually:

```text
DistributionCampaign
├── DistributionItem LinkedIn
├── DistributionItem Newsletter
├── DistributionItem Medium
└── DistributionItem PR
```

---

## DistributionItem should preserve exact content/copy/artifact references

One campaign can distribute different channel-specific representations.

Example:

```text
DistributionItem LinkedIn
→ copy v2
→ thumbnail FileVersion F-3

DistributionItem Newsletter
→ newsletter module v1
→ cover image F-5
```

Do not assume all channels use identical content payloads.

---

## DistributionItem ≠ ChannelExecution

`DistributionItem` represents what should be delivered on a channel.

`ChannelExecution` represents an actual attempt/run to perform that distribution.

Example:

```text
DistributionItem DI-10
├── Execution E1 — failed
└── Execution E2 — succeeded
```

---

## ChannelExecution ≠ Placement

Execution means:

> we attempted to deliver.

Placement means:

> a destination/result exists.

Permanent:

```text
Attempted Delivery
≠
Successful Placement
```

---

## Successful API execution ≠ verified Placement

Provider may return:

> accepted.

That still does not prove:

* public post exists,
* correct content is there,
* link remains live.

Verification remains separate.

---

## ChannelExecution should preserve provider outcome

Conceptually:

```text
ChannelExecution
├── distributionItemId
├── attempt number
├── provider/account reference
├── startedAt
├── completedAt
├── normalized result
└── provider-event lineage
```

Exact schema Phase 3D.

---

## Retry ≠ new DistributionItem

If one channel attempt fails:

```text
DistributionItem LinkedIn
├── Execution 1 failed
└── Execution 2 succeeded
```

Do not create two LinkedIn distribution items just because there were retries.

---

## Outcome unknown ≠ failed

As with Payments and Publishing:

```text
network timeout
≠
confirmed failure
```

Before retrying an uncertain external distribution attempt, verify provider/channel state where possible to avoid duplicate posts.

---

## Placement is the verified/external result identity

Conceptually:

```text
Placement
├── distributionItemId
├── channel
├── external resource ID
├── URL
├── first observed time
├── current lifecycle
└── related PublicationVersion
```

---

## Distribution Placement ≠ primary Publication Placement necessarily

A primary Publication placement may be:

> magazine article page.

Distribution placement may be:

> LinkedIn promotional post pointing to that page.

They can share the same Placement abstraction but have different business purpose/context.

---

## Placement should preserve purpose/context

The system needs to distinguish:

```text
placementPurpose = PRIMARY_PUBLICATION
```

from:

```text
placementPurpose = DISTRIBUTION
```

or equivalent.

Exact schema later.

---

## Placement ≠ Verification

Placement records where the result should/does exist.

Verification records evidence that it exists/was accessible at a specific time.

---

## Verification must remain freshness-aware

Design 072's invariant applies here too:

> A placement verified once is not permanently verified.

Distribution placements can later:

* be deleted,
* expire,
* be removed,
* become private,
* redirect,
* break.

---

## Verified Placement ≠ metric availability

This is essential.

Example:

```text
LinkedIn post:
Verified live ✓

Metrics:
Unavailable
```

This is legitimate.

Do not infer performance data merely because a placement exists.

---

## MetricDefinition ≠ MetricObservation

`MetricDefinition` says:

> What does “impressions” mean for this provider/context?

`MetricObservation` says:

> At timestamp T, provider reported value X.

---

## MetricObservation ≠ MetricAggregate

Observation:

```text
Aug 22 10:00
views = 1,203
```

Aggregate:

```text
Campaign 7-day views
= 8,420
```

These require explicit semantics.

---

## MetricAggregate ≠ Report

A live aggregate is not a finalized Report snapshot.

---

## PerformanceMetric name ≠ universally comparable meaning

This is one of the most important Design 073 rules.

Example:

```text
LinkedIn Impression
≠
Newsletter Impression
≠
YouTube View
```

even if UI labels them all broadly as “reach.”

Do not naively sum unrelated metrics.

---

## Metric definitions need channel/provider context

Conceptually:

```text
MetricDefinition
├── key
├── canonical label
├── channel/provider
├── unit
├── calculation semantics
├── aggregation rule
├── comparability group
└── effective-version metadata
```

---

## MetricDefinition can evolve

Providers change measurement semantics.

Historical metrics should preserve the definition/version used when collected or aggregated.

---

## Zero ≠ unavailable

Permanent:

```text
value = 0
≠
value unavailable
```

Example:

* 0 clicks = observed zero.
* unavailable clicks = provider did not return metric.

Never coerce null/unknown into 0.

---

## Missing ≠ zero

Same rule for:

* impressions,
* views,
* opens,
* conversions,
* engagement.

---

## Estimated ≠ Verified

Design 032/038 provenance model continues:

```text
VERIFIED
ESTIMATED
MANUAL
UNAVAILABLE
```

Each metric observation/aggregate should preserve provenance.

---

## VERIFIED ≠ necessarily audited by third party

“Verified” here means the metric value has strong canonical/provider-backed evidence under the metric policy.

Do not overstate the word's legal meaning.

---

## ESTIMATED should preserve estimation basis

If a metric is estimated:

the backend should know:

* estimation method,
* source,
* timestamp,
* confidence/quality where appropriate.

The Client UI may show a safe summary.

---

## MANUAL must be visibly distinct

A manually entered metric must never masquerade as provider-synced.

---

## UNAVAILABLE ≠ zero

Permanent and must remain visible.

---

## Metric freshness matters

Example:

```text
LinkedIn metrics:
updated 15 minutes ago

Newsletter metrics:
updated 2 days ago
```

Do not present both as equally current.

---

## Metric observation timestamp ≠ placement published time

Keep:

```text
publishedAt
metricObservedAt
aggregatePeriod
```

separate.

---

## Cumulative metric ≠ period metric

Example:

```text
Total views since publication
≠
Views in last 7 days
```

The Client UI must not compare them without explicit period semantics.

---

## Metric period must be explicit

Conceptually:

```text
MetricAggregate
├── periodStart
├── periodEnd
├── timezone
└── aggregation method
```

---

## Cross-channel totals require normalized definitions

If the system displays:

> Total Reach

that metric must be backed by a deliberate canonical definition.

Do not compute:

```text
LinkedIn impressions
+ YouTube views
+ email opens
```

without a governed metric definition.

---

## Engagement rate comparability

Even same-named rates can differ by denominator.

Example:

```text
LinkedIn engagement rate
= interactions / impressions

Email engagement rate
= clicks / delivered
```

Do not compare them as identical metrics.

---

## DistributionCampaign status ≠ metric performance

Campaign can be:

> Complete

with low performance.

Execution completion and business outcome remain separate.

---

## Distribution complete ≠ all metrics available

Metrics can arrive later or provider APIs may be unavailable.

---

## Placement verified ≠ successful campaign performance

A live placement can generate zero measured engagement.

That is still a successful delivery placement.

---

## Report ≠ live Distribution detail

Design 073 may show current metrics.

A formal Client Report must preserve a frozen data snapshot and metric definitions.

---

## ClientAction ≠ campaign health

Poor performance does not automatically become a Client action.

Only genuine Client-owned dependencies should become Design 047 actions.

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
Publication access
+
DistributionCampaign visibility
+
Placement visibility
+
Metric visibility
```

---

## Publication access ≠ Distribution access automatically

A user may be permitted to see:

> magazine live

without seeing all downstream distribution campaign/performance details.

---

## Distribution read ≠ distribution management

Client visibility should not imply:

* retry execution,
* edit copy,
* reconnect providers,
* delete placements,
* change schedule,
* post manually,

unless explicitly frozen as Client functionality.

---

## Same Client ≠ same metric access

Some users may see delivery status but not detailed analytics.

Example:

```text
Project Viewer
→ placement status

Marketing Admin
→ placement + performance

Finance Contact
→ neither
```

---

## Metric access can differ from Placement access

A user may know a LinkedIn post is live while performance numbers remain restricted.

---

## Internal provider data remains hidden

Never expose:

* OAuth tokens,
* API account IDs unnecessarily,
* rate-limit diagnostics,
* raw webhooks,
* internal retries,
* provider billing information.

---

## Manual metric editing should not be Client-side by default

If manual data exists:

entry/approval belongs to internal operations unless frozen Client design explicitly supports it.

Design 073 should primarily read Client-safe evidence.

---

## Direct Campaign/Item/Execution IDs need reauthorization

Knowing:

```text
campaignId
distributionItemId
executionId
placementId
```

does not grant access.

---

## Direct metric-query access

A malicious user must not query metrics for another Client's placement by swapping IDs.

Tenant/resource checks remain server-side.

---

## Link access

A verified placement URL should only be returned when current user can see that Placement.

---

## Historical metrics after access revocation

If Project/Distribution access is removed:

old metrics should not remain accessible merely because the user viewed them previously.

---

## Report access ≠ metric detail access automatically

A user can potentially have access to a released Report while lacking live analytics detail.

The finalized Report itself is a separate authorized artifact.

---

# 5. States

Design 073 requires separate Campaign, DistributionItem, Execution, Placement, Verification, Metric, and reporting states.

### Campaign state

```text
Draft / Planned
Scheduled
Active
Partially Complete
Complete
Paused / Cancelled
```

where applicable.

### DistributionItem state

```text
Pending
Ready
Scheduled
Executing
Delivered
Failed
Cancelled
Blocked
```

### ChannelExecution state

```text
Queued
Processing
Provider Accepted
Succeeded
Failed
Outcome Unknown
Cancelled
```

### Placement state

```text
No Placement
Placement Created
Placement Active
Placement Removed
Placement Retracted
```

### Verification state

```text
Not Verified
Verification Pending
Verified Current
Verification Stale
Broken
Unreachable
Verification Unavailable
```

### Metric state

```text
Metric Loading
Metric Available
Metric Zero
Metric Unavailable
Metric Stale
Metric Estimated
Metric Manual
Metric Provider-Synced / Verified
```

### ClientAction state

```text
No Action
Client Input Required
Waiting on Distribution
Action Restricted
Action State Unavailable
```

These must not become one `distribution.status`.

---

## Campaign Active ≠ all items executing

Permanent.

---

## Campaign Complete ≠ all placements verified necessarily

Depends on canonical campaign completion policy.

Do not infer completeness from simple item count.

---

## Execution succeeded ≠ Placement verified

Permanent.

---

## Provider accepted ≠ execution success

Permanent.

---

## Outcome unknown ≠ failed

Permanent.

---

## Placement verified ≠ metrics available

Permanent.

---

## Metric unavailable ≠ zero

Permanent.

---

## Metric stale ≠ unavailable

Historical value may exist but freshness is insufficient.

---

## Estimated ≠ unavailable

Estimated value can exist with explicit provenance.

---

## Manual ≠ provider-synced

Permanent.

---

## Zero impressions ≠ provider failure

An observed zero is legitimate evidence.

---

## Performance service unavailable ≠ zero performance

Critical.

---

## Distribution API/provider unavailable ≠ campaign failed

Known historical placement and performance evidence remain.

---

## Placement broken ≠ campaign never completed historically

Historical delivery evidence remains intact.

---

## Campaign completed ≠ Report finalized

Permanent.

---

## Report finalized ≠ live metrics frozen forever

Report is historical snapshot; live Distribution metrics can continue changing.

---

## Partial metrics

Example:

```text
Impressions   12,500 VERIFIED
Clicks           320 VERIFIED
Conversions        — UNAVAILABLE
```

The whole placement should not become:

> Metrics unavailable.

Metric-level state matters.

---

## Mixed freshness

Different metrics can have different update times.

Do not assign one universal `lastUpdated` if it misrepresents underlying data.

---

## Updated externally

Provider can edit/delete a post or change metric reporting after initial collection.

Design 073 must refresh/reconcile.

---

## State Coverage

Design 073 inherits Design 150 plus:

```text
Distribution Detail Loading
Distribution Detail Available
Distribution Detail Restricted

Campaign Planned
Campaign Active
Campaign Partially Complete
Campaign Complete
Campaign Cancelled

Distribution Item Pending
Distribution Item Executing
Distribution Item Delivered
Distribution Item Failed

Channel Execution Processing
Provider Accepted
Execution Outcome Pending
Execution Outcome Unknown
Execution Failed

Placement Created
Placement Verified
Placement Verification Stale
Placement Broken
Placement Unreachable
Verification Unavailable

Metrics Loading
Metrics Available
Metrics Partially Available
Metrics Zero
Metrics Unavailable
Metrics Stale

Metric Provenance Verified
Metric Provenance Estimated
Metric Provenance Manual
Metric Provenance Unavailable

Client Input Required
No Client Action Required
Client Action State Unavailable

Partial Distribution Service Failure
Partial Metrics Service Failure
```

---

# 6. Responsive Behavior

## Desktop

Desktop should emphasize channel-by-channel delivery evidence and performance.

Conceptually:

```text
Distribution Detail
↓
Campaign Summary
├── related Publication / Project
├── exact distributed PublicationVersion
├── campaign state
└── distribution period
↓
Channel / Distribution Items
    ├── channel
    ├── execution state
    ├── placement
    ├── verification state
    ├── last verified
    ├── key metrics
    ├── metric freshness/provenance
    └── open placement
↓
Overall Performance Summary
```

Only frozen sections should render.

---

## Desktop should not become internal campaign operations

Do not expose:

* reconnect buttons,
* API credentials,
* raw provider errors,
* webhook replay,
* queue controls,
* retry internals,
* internal notes.

---

## Metric provenance should remain visible

If a metric is:

```text
ESTIMATED
MANUAL
UNAVAILABLE
```

that distinction must not disappear in a tooltip-only implementation.

The Client should not be misled into thinking all values are equivalent provider truth.

---

## Cross-channel comparisons need careful labeling

Instead of an ambiguous table:

```text
LinkedIn   Reach 10k
YouTube    Reach 8k
Email      Reach 12k
```

the UI should preserve the canonical metric definition associated with each channel.

If a normalized aggregate exists, label it as that deliberate metric.

---

## Tablet

Following Design 152:

* channel rows can become structured cards,
* placement and verification remain grouped,
* metrics wrap into compact groups,
* provenance/freshness stay visible,
* long links do not cause overflow.

---

## Mobile

Priority:

```text
Distribution
↓
Campaign / Publication
↓
Channel Card
   ├── channel
   ├── delivery state
   ├── placement verification
   ├── live link
   ├── key metrics
   ├── freshness
   └── provenance
↓
Next channel
```

---

## Mobile metric semantics

Do not show:

```text
12.4K
3.2%
```

without labels.

Use:

> Impressions: 12.4K
> Engagement rate: 3.2%
> Updated 20 minutes ago
> Provider verified

where canonical data supports it.

---

## Mobile unavailable metrics

Use explicit:

> Click data unavailable

rather than:

> 0 clicks.

---

## Mobile estimated/manual provenance

Provide semantic text/badge:

> Estimated
> Manually reported

not merely a different color.

---

## Accessibility

A distribution card should communicate something equivalent to:

> LinkedIn. Placement verified live. 12,420 impressions, provider verified, last updated August 22 at 12:40 PM. 320 clicks. Open placement.

where source data supports it.

---

## Metric charts

If the frozen design contains charts:

* every chart requires textual values/labels,
* different units cannot share an unlabeled scale,
* unavailable intervals should not be plotted as zero,
* estimated/manual values should preserve provenance in accessible representation.

---

# 7. Backend Requirements

## Read architecture

```text
Design 073
    ↓
ClientPortalSessionContext
    ↓
Distribution Authorization
    ↓
ClientDistributionDetailQueryService
    │
    ├── DistributionCampaign
    ├── exact Publication/PublicationVersion references
    ├── DistributionItems
    ├── ChannelExecutions
    ├── Placements
    ├── Verification records
    ├── MetricDefinitions
    ├── MetricObservations
    ├── MetricAggregates
    ├── metric provenance/freshness
    └── current ClientAction where applicable
    ↓
ClientDistributionDetailView
```

---

## Campaign must pin exact source release

At campaign creation:

```text
DistributionCampaign
→ PublicationVersion PV-x
```

or exact approved Artifact references.

Never resolve `latest publication` dynamically during execution.

---

## DistributionItem creation

Conceptually:

```text
createDistributionItem(
    campaignId,
    channelTarget,
    exact content/copy/artifact refs
)
```

with server validation.

Items should preserve channel-specific copy/media version lineage.

---

## ChannelExecution service

Use explicit execution records:

```text
executeDistributionItem()
```

creating:

```text
ChannelExecution
```

rather than patching DistributionItem directly to `posted=true`.

---

## Channel adapter abstraction

Conceptually:

```text
DistributionChannelAdapter
├── createPlacement()
├── getExecutionStatus()
├── fetchPlacement()
├── verifyPlacement()
├── fetchMetrics()
└── normalizeProviderEvent()
```

Providers may support different subsets.

---

## Execution idempotency

Repeated worker retries must not create duplicate external placements where the provider supports idempotency.

Use stable execution intent keys.

---

## Uncertain outcome verification

If external delivery request times out:

```text
ChannelExecution
→ OUTCOME_UNKNOWN
```

Then:

```text
provider status lookup
and/or placement search
```

before retry.

This prevents duplicate channel posts.

---

## Provider-event normalization

Raw provider callbacks map into canonical execution/placement events.

Do not expose provider status strings throughout the domain.

---

## Placement creation

A Placement should be created only when enough evidence identifies the actual external result.

Potential evidence:

* provider resource ID,
* canonical URL,
* creation timestamp,
* channel account,
* exact DistributionItem.

---

## Shared Placement foundation

Design 072 and 073 should preferably reuse the same underlying Placement/Verification infrastructure with contextual purpose.

This prevents:

```text
PublishingPlacement
DistributionPlacement
```

from becoming two incompatible external-resource models.

---

## Placement verification service

Reuse Design 072's verification machinery where possible:

```text
verifyPlacement()
```

with channel/provider-specific adapters.

---

## Historical verification

Preserve Verification records rather than overwriting one boolean.

This allows:

```text
Verified Aug 1
Broken Aug 20
Restored Aug 21
```

to remain reconstructable.

---

## Metric registry

One canonical `MetricDefinition` registry must support:

```text
metric key
display label
channel/provider scope
unit
aggregation semantics
comparability class
provenance policy
definition version
```

---

## Metric ingestion architecture

Conceptually:

```text
Provider API / trusted source
      ↓
raw provider metric payload
      ↓
normalization
      ↓
MetricObservation
      ↓
validation/provenance
      ↓
MetricAggregate
```

Do not write provider JSON directly into Client UI.

---

## MetricObservation should preserve provenance

Conceptually:

```text
MetricObservation
├── metricDefinitionId
├── subjectType
├── subjectId
├── observedAt
├── period
├── value
├── source/provider
├── provenance
├── source freshness
└── ingestion metadata
```

---

## Metric identity needs subject binding

Metric values can apply to:

* Placement,
* DistributionItem,
* Campaign,
* Publication,

depending on definition.

Do not attach every metric directly to Campaign.

---

## Metric aggregation service

Conceptually:

```text
aggregateMetrics(
    observations,
    MetricDefinition,
    period,
    scope
)
```

must honor each metric's valid aggregation behavior.

---

## Do not sum non-additive metrics

Examples that are often non-additive:

* unique reach,
* engagement rate,
* CTR,
* average watch time.

The backend MetricDefinition controls aggregation.

---

## Cross-channel normalization

If a cross-channel KPI is intentionally defined:

it should have its own `MetricDefinition`.

Example:

```text
NormalizedEngagedAudience
```

rather than silently adding incompatible source metrics.

---

## Zero preservation

Store/return observed numerical zero distinctly from:

```text
null / unavailable
```

No `COALESCE(metric, 0)` in Client-facing analytical truth unless definition explicitly supports it.

---

## Provenance enum

Preserve:

```text
VERIFIED
ESTIMATED
MANUAL
UNAVAILABLE
```

or equivalent canonical semantics.

---

## Provenance is per metric observation/aggregate

Do not assume one channel has one universal provenance.

Example:

```text
Impressions → VERIFIED
Conversions → MANUAL
```

on the same placement can be legitimate.

---

## Freshness resolver

Centralize:

```text
resolveMetricFreshness(
    observation,
    metricDefinition,
    channel policy,
    now
)
```

Do not let each screen invent “stale after X hours.”

---

## Provider metrics outage

Retain last known values with explicit freshness/provenance.

Do not overwrite them with zero.

---

## Historical correction

Providers can revise historical metrics.

The system should retain sufficient observation lineage to know that values changed.

Whether full time-series history or latest authoritative observation is stored depends on metric requirements.

---

## Report snapshot integration

When Design 130/132 creates a final Report:

```text
MetricDefinitions
+
selected MetricObservations/Aggregates
+
period
+
provenance
       ↓
ReportDatasetSnapshot
       ↓
ReportVersion
```

This freezes report evidence without stopping live metrics from changing later.

---

## Campaign aggregate resolver

A central service should derive:

* planned items,
* delivered items,
* verified placements,
* failed/unknown executions,
* metric availability.

Frontend should not compute campaign completion from card count.

---

## Required vs optional DistributionItems

If campaign policy differentiates critical items:

completion logic should account for it.

Do not assume all channels have equal required weight.

---

## ClientAction resolver

Where genuine Client dependency exists:

```text
DistributionCampaign
+
required Client dependency
+
current member
      ↓
ClientActionResolver
```

Internal operational retries/metric-fetch issues remain internal work.

---

## Notifications

Potential canonical events:

```text
DistributionCampaignStarted
DistributionPlacementVerified
DistributionCampaignCompleted
DistributionPlacementBroken
```

can feed notification policy.

Do not send “campaign completed” merely because all execution API requests returned accepted.

---

## Activity

Safe milestones may feed Design 063:

> Distribution campaign completed.

> LinkedIn placement verified.

Activity remains projection.

---

## Audit

Material operations should produce Audit events such as:

```text
DistributionCampaignCreated
DistributionItemCreated
ChannelExecutionStarted
ChannelExecutionCompleted
PlacementCreated
PlacementVerified
MetricDataImported
ManualMetricRecorded
```

without provider secrets.

---

## Permission-safe caching

Cache dimensions may include:

```text
membershipId
campaignId
distribution revision
placement revision
verification revision
metric revision
permission revision
```

---

## Partial failure handling

Example:

```text
Campaign data       ✓
Placements          ✓
Verification        ✓
LinkedIn metrics    ✓
Newsletter metrics  ✕
```

Design 073 should show partial evidence accurately.

Do not replace the whole performance section with zero/empty.

---

## Backend Requirement Matrix

| Requirement                                       | Status                        |
| ------------------------------------------------- | ----------------------------- |
| Client Portal authentication                      | **Critical**                  |
| Active Portal membership                          | **Critical**                  |
| Canonical DistributionCampaign reuse              | **Critical**                  |
| Publication/Distribution separation               | **Critical**                  |
| Exact PublicationVersion/artifact pinning         | **Critical**                  |
| Campaign/DistributionItem separation              | **Critical**                  |
| Channel-specific content/version lineage          | **Critical**                  |
| DistributionItem/ChannelExecution separation      | **Critical**                  |
| Retry history preservation                        | **Critical**                  |
| Execution/Placement separation                    | **Critical**                  |
| Provider acceptance/Placement separation          | **Critical**                  |
| Outcome-unknown/failed separation                 | **Critical**                  |
| Verify-before-retry semantics                     | **Critical**                  |
| Execution idempotency                             | **Critical**                  |
| Provider abstraction                              | **Critical**                  |
| Provider-event normalization                      | **Critical**                  |
| Placement entity reuse                            | **Critical**                  |
| Placement purpose/context                         | **Required architecture**     |
| Placement/Verification separation                 | **Critical**                  |
| Verification freshness                            | **Critical**                  |
| Historical verification records                   | **Critical**                  |
| Verified Placement/metric availability separation | **Critical**                  |
| MetricDefinition registry                         | **Critical**                  |
| MetricDefinition versioning                       | **Critical**                  |
| MetricObservation model                           | **Critical**                  |
| MetricAggregate model                             | **Critical**                  |
| Metric subject binding                            | **Critical**                  |
| Zero/unavailable separation                       | **Critical**                  |
| VERIFIED/ESTIMATED/MANUAL/UNAVAILABLE provenance  | **Critical**                  |
| Metric-level provenance                           | **Critical**                  |
| Metric freshness                                  | **Critical**                  |
| Provider outage/zero separation                   | **Critical**                  |
| Cross-channel comparability rules                 | **Critical**                  |
| Non-additive metric protection                    | **Critical**                  |
| Governed cross-channel normalized KPIs            | **Critical**                  |
| Live metrics/Report snapshot separation           | **Critical**                  |
| Designs 033/056 reporting reuse                   | **Critical**                  |
| Design 038 Metric Registry reuse                  | **Critical**                  |
| Client-safe metric projection                     | **Critical**                  |
| Design 047 ClientAction reuse                     | **Required where actionable** |
| Notification integration                          | **Required**                  |
| Activity integration                              | **Required**                  |
| Audit integration                                 | **Critical**                  |
| Permission-safe caching                           | **Critical**                  |
| Partial metrics/provider failure handling         | **Critical**                  |
| Designs 127–130 future internal reuse             | **Critical architecture**     |

---

# 8. Consolidation

Design 073 exposes several major implementation risks.

**Publication / Distribution conflation**
Promotional delivery recreates primary release state.

**DistributionCampaign / Publication conflation**
Every campaign becomes a duplicate Publication.

**DistributionCampaign / DistributionItem conflation**
One channel item represents the entire campaign.

**DistributionItem / ChannelExecution conflation**
Retries create duplicate business items.

**Execution / Placement conflation**
Attempted delivery is treated as successful public placement.

**Provider accepted / successful delivery conflation**
API acknowledgement becomes live-placement evidence.

**Outcome unknown / failed conflation**
Ambiguous timeout triggers duplicate retry/post.

**Retry / new DistributionItem conflation**
One logical channel item fragments into several unrelated records.

**Placement / Verification conflation**
Stored URL becomes verified delivery.

**Primary Publication Placement / Distribution Placement conflation**
Primary release and promotional placement lose business purpose.

**Verification / permanent truth conflation**
One successful check means the placement is considered live forever.

**Stale / broken conflation**
Old verification data is treated as active failure.

**Broken now / never delivered conflation**
Historical delivery evidence disappears.

**Verified Placement / metric availability conflation**
Live post is assumed to have analytics.

**Metric unavailable / zero conflation**
Missing provider data becomes 0.

**Provider outage / zero performance conflation**
Client sees false poor performance.

**MetricDefinition / MetricObservation conflation**
Values have no stable semantic definition.

**MetricObservation / MetricAggregate conflation**
Single timestamp value is presented as period performance.

**MetricAggregate / Report conflation**
Live metric summary becomes finalized evidence.

**Metric name / universal meaning conflation**
“Impressions” across channels are assumed identical.

**Cross-channel metric summation**
Incompatible views, opens, impressions, and reach are added together.

**Non-additive metric summation**
Unique reach/ratios are summed incorrectly.

**Cumulative / period metric conflation**
All-time views compared with 7-day views.

**PublishedAt / observedAt conflation**
Metric timestamps become release timestamps.

**Metric freshness / placement freshness conflation**
Fresh link verification is assumed to mean fresh analytics.

**Metric provenance / channel conflation**
One channel label implies every metric is provider-verified.

**ESTIMATED / VERIFIED conflation**
Estimated number presented as exact provider truth.

**MANUAL / VERIFIED conflation**
Human-entered value masquerades as integrated data.

**UNAVAILABLE / zero conflation**
Missing measurement becomes numeric zero.

**Metric definition drift**
Provider semantics change but historical values retain the new meaning.

**Performance / campaign completion conflation**
Low engagement makes campaign appear operationally incomplete.

**Campaign completion / report finalization conflation**
Completed distribution automatically creates final Report truth.

**Final Report / live metric conflation**
Changing metrics rewrite historical Report evidence.

**Project/Publication access / metric access conflation**
Every Project viewer sees performance analytics.

**Distribution read / management conflation**
Client viewer can retry/delete/repost.

**Portal Admin / distribution administrator conflation**
Team-access role grants external channel controls.

**Manual metric entry / Client visibility conflation**
Client can alter reported performance.

**Direct Campaign ID bypass**
Another Client's campaign becomes accessible.

**Direct Placement ID bypass**
Restricted live link leaks.

**Direct Metric subject ID bypass**
Another Client's performance is exposed.

**Internal provider metadata leakage**
API account/credential details reach Portal.

**Activity / campaign evidence conflation**
Timeline event substitutes for delivery proof.

**Notification / campaign completion conflation**
Alert becomes campaign truth.

**Action / operational issue conflation**
Internal provider failure becomes Client obligation.

**Partial metric failure / whole performance zero conflation**
One unavailable provider makes entire dashboard show zeros.

**Campaign cache / authorization conflation**
Broad-access user's analytics payload leaks to restricted user.

**073/032 duplicate Distribution engine**
Client detail creates separate Campaign/Execution/Placement truth.

**073/055 duplicate Client summary logic**
Overview/detail disagree about delivery status.

**073/072 duplicate Placement model**
Publishing and Distribution independently model external links.

**073/038 duplicate metric registry**
Distribution defines its own metric semantics.

**073/033/056 duplicate reporting semantics**
Distribution live metrics are treated as final Report snapshots.

**073/127–130 duplicate internal Distribution backend**
Client and internal surfaces diverge in campaign/execution/metric identity.

No additional screen is required.

These are **campaign identity, exact release lineage, execution/placement separation, verification, metric provenance, comparability, reporting, authorization, and performance-evidence requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT DISTRIBUTION CAMPAIGN, VERIFIED PLACEMENT & PERFORMANCE EVIDENCE DETAIL ANCHOR**

**Domain directive:**
**Publication ≠ DistributionCampaign ≠ DistributionItem ≠ ChannelExecution ≠ Placement ≠ Verification ≠ PerformanceMetric ≠ MetricObservation/Aggregate ≠ Report ≠ ClientAction.**

**Reuse directive:**
Design 032 remains the single canonical Distribution engine, Design 055 remains the Client overview, and Design 073 becomes the Client-safe detailed projection of those same Campaign, Item, Execution, Placement, Verification, and metric entities.

**Publication directive:**
Distribution always references an exact canonical PublicationVersion/artifact or another explicitly approved source artifact. It never recreates or infers primary Publication state.

**Campaign directive:**
DistributionCampaign is the coordinating distribution effort; each DistributionItem represents one specific channel/destination/content unit. Campaign and Item remain separate.

**Execution directive:**
ChannelExecution records each actual delivery attempt and preserves retry history. Attempted delivery and provider acceptance never imply a verified Placement.

**Uncertain-outcome directive:**
an ambiguous channel execution enters `OUTCOME_UNKNOWN` and is verified against provider/placement state before retrying, preventing duplicate posts or placements.

**Placement directive:**
a Placement represents the actual resulting external/internal channel resource. It remains distinct from the execution attempt and retains exact DistributionItem + PublicationVersion lineage.

**Shared-placement directive:**
Designs 072 and 073 should standardize one Placement/Verification foundation while preserving contextual purpose such as primary publication versus downstream distribution.

**Verification directive:**
Placement and Verification remain separate. Distribution placement verification is evidence-based, freshness-aware, repeatable, and historical rather than one permanent boolean.

**Historical directive:**
a placement that was once verified remains part of distribution history even if it later becomes stale, broken, removed, or retracted.

**Metric-definition directive:**
Design 038's Metric Registry remains canonical. Every Client performance value is interpreted through a specific versioned MetricDefinition rather than a free-form provider label.

**Observation directive:**
MetricObservation records what a source reported for a defined metric at a defined time/period. Observations remain separate from aggregates and presentation.

**Aggregate directive:**
MetricAggregate is computed using the MetricDefinition's valid aggregation semantics. Non-additive ratios, unique reach, averages, and rates must never be blindly summed.

**Zero directive:**
an observed numerical zero is a valid value; unavailable data remains unavailable. `null → 0` coercion is prohibited for Client performance truth.

**Provenance directive:**
every metric preserves **VERIFIED / ESTIMATED / MANUAL / UNAVAILABLE** or equivalent provenance at the metric level. One channel can legitimately contain metrics with different provenance.

**Freshness directive:**
metric freshness is explicit and separate from Placement verification freshness. Last-known provider values remain historical data when stale and are never silently replaced by zero.

**Comparability directive:**
same-looking metrics from different channels are not assumed equivalent. Cross-channel totals or KPIs require deliberately governed canonical metric definitions/comparability groups.

**Period directive:**
cumulative, point-in-time, and period metrics preserve explicit periods/timezones and cannot be compared as if they were the same measurement window.

**Report directive:**
Designs 033/056 and later 130–134 remain the finalized reporting system. Design 073 displays live/current Distribution evidence; a ReportVersion freezes a defined metric dataset/period/provenance separately.

**Completion directive:**
operational campaign completion, placement verification, performance level, metric availability, and Report finalization remain independent dimensions.

**Authorization directive:**
Project/Publication access, Distribution visibility, Placement access, performance-metric access, and internal channel-management authority are independently server-enforced.

**Management directive:**
Client Distribution detail is primarily read/evidence oriented. Provider retries, reconnects, credential administration, manual corrections, and internal channel operations remain internal unless explicitly present in frozen Client functionality.

**ClientAction directive:**
Design 047 is used only for genuine Client-owned dependencies. Internal execution failures, placement verification failures, or missing provider metrics do not automatically become Client actions.

**Notification directive:**
Designs 061/064 may notify Clients of verified placements or completed campaigns according to canonical policy, but notification status never becomes delivery or metric evidence.

**Activity directive:**
Design 063 may record distribution milestones, while canonical ChannelExecution, Placement, Verification, and metric records remain authoritative.

**Audit directive:**
Campaign creation, execution, Placement creation, verification, provider metric ingestion, and manual metric entry should produce auditable events with source/provenance while excluding credentials/secrets.

**Failure directive:**
campaign data, execution state, Placement verification, and each metric source can fail independently. Unknown/unavailable must never silently become `Failed`, `Broken`, `0`, or `No Performance`.

**Performance directive:**
multi-channel distribution detail should be assembled through batched/read-model architecture and a canonical metric layer rather than browser-side provider calls or per-card N+1 requests.

**Internal reuse directive:**
future Designs 127–130 must consume the same Campaign, DistributionItem, ChannelExecution, Placement, Verification, MetricDefinition, Observation, and Aggregate foundation; internal surfaces expose deeper controls, not different data truth.

**Responsive directive:**
desktop emphasizes campaign → channel → execution → verified placement → metrics/provenance/freshness; mobile reduces each channel to delivery status → verification → safe live link → clearly labeled performance evidence.

**Overlap directive:**
Designs **031–033, 038, 043, 047, 055–056, 063–066, 072–073 and later 127–134** must ultimately consume one exact release + distribution + placement + verification + metric foundation while preserving live performance and frozen reporting as different products.

**Consolidation directive:**
**STANDARDIZE ONE DISTRIBUTION EVIDENCE FOUNDATION — EXACT PUBLICATION/ARTIFACT REFERENCES + DISTRIBUTIONCAMPAIGN + CHANNEL-SPECIFIC DISTRIBUTIONITEMS + IDEMPOTENT CHANNELEXECUTIONS + VERSION-BOUND PLACEMENTS + FRESHNESS-AWARE VERIFICATION + VERSIONED METRIC DEFINITIONS + PROVENANCE-PRESERVING METRIC OBSERVATIONS/AGGREGATES + GOVERNED CROSS-CHANNEL COMPARABILITY — AND NEVER ALLOW PROVIDER ACCEPTANCE, STORED URLS, MISSING METRICS, OR NAIVE CROSS-CHANNEL SUMS TO BECOME CLIENT DELIVERY/PERFORMANCE TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **73 / 153** |
| **PASS**                                   |                         **73** |
| **STANDARDIZE decisions**                  |                         **71** |
| **Potential implementation-overlap flags** |                         **64** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**73 / 153 = 47.7% audited.**

### Canonical Distribution architecture after Design 073

```text
          CANONICAL PUBLICATION VERSION
                     Design 072
                         │
                         ↓
                DistributionCampaign
                         │
             ┌───────────┴───────────┐
             ↓                       ↓
      DistributionItem A      DistributionItem B
             │                       │
             ↓                       ↓
      ChannelExecution         ChannelExecution
             │                       │
             ↓                       ↓
         Placement               Placement
             │                       │
             ↓                       ↓
        Verification            Verification
             │                       │
             ↓                       ↓
      MetricObservation(s)    MetricObservation(s)
             │                       │
             └───────────┬───────────┘
                         ↓
                  MetricAggregate
                         │
                         ↓
                    Design 073
```

The critical delivery ladder remains:

```text
Distribution Item Created
          ↓
Execution Attempted
          ↓
Provider Accepted
          ↓
Placement Identified
          ↓
Placement Verified
          ↓
Metrics Available? ── No → UNAVAILABLE
          │
         Yes
          ↓
Metric Observation
+
Provenance
+
Freshness
```

And the performance boundary remains:

```text
0
= observed numeric zero

UNAVAILABLE
= no valid metric value

ESTIMATED
= derived value with declared estimation provenance

MANUAL
= human-entered evidence

VERIFIED
= canonical/provider-backed measurement under policy
```

These four conditions are never interchangeable.

# Next Sequential Audit Target

## **Design 074 — Client Message Thread Detail**

Its frozen identity and supplied route annotation **`/client/messages/[threadId]`** are already locked.

The next audit must preserve the communication-detail boundary:

> **Conversation/Thread ≠ Message ≠ MessageVersion/Edit ≠ Participant ≠ ReadState ≠ DeliveryState ≠ Attachment ≠ InternalNote ≠ Notification ≠ ActivityEvent ≠ ClientAction.**

It must reconcile the shared messaging foundation from **Design 014**, the Client Messages collection from **Design 045**, and the exact thread-detail experience while preserving:

* one Conversation/Thread can contain many Messages,
* Message sender ≠ Conversation participant,
* Message read ≠ replied/resolved,
* delivery ≠ read,
* internal note ≠ Client-visible Message,
* editing/deleting presentation must not silently rewrite historical communication evidence,
* attachments use canonical Asset/FileVersion access,
* Notification about a Message ≠ the Message itself,
* Project/Support/Contract context does not automatically expose every Conversation.

After Design 074 we continue strictly:

**075 Client Sign In → 076 Client Portal Activation / Accept Invite → 077 Client Access Recovery**

with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
