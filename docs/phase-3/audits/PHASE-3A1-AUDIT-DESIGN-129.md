# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 129 — Distribution Performance & Verification

Design 129 should become the **canonical Team Workspace cross-placement distribution verification, current-placement health, metric-observation, performance aggregation, provenance, freshness, and anomaly-investigation surface** built directly on the Distribution foundation established by **Design 032** and the canonical Campaign/Placement identities established by **Designs 127–128**.

Design 129 must **not create a second Placement domain, a second verification engine, or a separate distribution-analytics truth store**. It should aggregate and investigate the exact canonical `Placement`, `PlacementVerification`, `ChannelExecution`, and metric-observation records produced by the Distribution system.

It must preserve strict boundaries with:

* Design 128 — Channel / Placement Detail;
* Design 130 — Final Distribution Report;
* Design 038 — Analytics / Metric Registry;
* Designs 131–134 — Reporting;
* Design 073 — Client Distribution Detail;
* Designs 139–140 — Integration health;
* Publishing Verification from Designs 124–126.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Placement ≠ PlacementVerification ≠ VerificationObservation ≠ MetricDefinition ≠ MetricObservation ≠ MetricAggregate ≠ PerformanceSnapshot ≠ DistributionCampaign ≠ ChannelExecution ≠ PublicationVerification ≠ ReportVersion ≠ ClientPerformanceProjection.**

The central implementation rule is:

> **Design 129 measures and verifies Distribution outcomes; it does not rewrite them. A Placement may have many verification observations and many metric observations over time. `0`, `Unavailable`, `Stale`, `Estimated`, `Manual`, and `Verified` must remain distinct. Current performance dashboards are live analytical projections, while Design 130 and later Reporting must freeze exact report-period datasets separately. A provider count or client-visible percentage can never become canonical without metric definition, source, observation time, provenance, and freshness.**

---

# 1. Classification

| Audit field                           | Classification                                                                                                                                                                                                                                                 |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                         | **129**                                                                                                                                                                                                                                                        |
| **Canonical name**                    | **Distribution Performance & Verification**                                                                                                                                                                                                                    |
| **Product area**                      | Team Workspace / Distribution / Verification & Performance                                                                                                                                                                                                     |
| **User surface**                      | **Authenticated Team Workspace**                                                                                                                                                                                                                               |
| **Screen class**                      | Distribution Analytics & Verification Workspace                                                                                                                                                                                                                |
| **Classification**                    | **Canonical Distribution Placement Verification, Performance Observation & Cross-Channel Analytics Anchor**                                                                                                                                                    |
| **Primary purpose**                   | Determine whether Placements actually exist and remain valid, measure their performance through provenance-aware observations, compare channels/campaigns, expose stale/unavailable data honestly, and prepare trustworthy evidence for client/final reporting |
| **Canonical Distribution foundation** | Design 032                                                                                                                                                                                                                                                     |
| **Campaign foundation**               | Design 127                                                                                                                                                                                                                                                     |
| **Placement foundation**              | Design 128                                                                                                                                                                                                                                                     |
| **Primary operational entity**        | `Placement`                                                                                                                                                                                                                                                    |
| **Verification entity**               | `PlacementVerification`                                                                                                                                                                                                                                        |
| **Metric definition authority**       | Design 038 `MetricDefinition` / Metric Registry                                                                                                                                                                                                                |
| **Raw metric evidence**               | `MetricObservation`                                                                                                                                                                                                                                            |
| **Derived metric representation**     | `MetricAggregate` / performance read model                                                                                                                                                                                                                     |
| **Snapshot boundary**                 | `PerformanceSnapshot` only where frozen reporting/reproducibility requires it                                                                                                                                                                                  |
| **Campaign identity**                 | `DistributionCampaign`                                                                                                                                                                                                                                         |
| **Campaign version identity**         | `DistributionCampaignVersion`                                                                                                                                                                                                                                  |
| **Execution provenance**              | `ChannelExecution`                                                                                                                                                                                                                                             |
| **Provider evidence**                 | `ProviderEvent`                                                                                                                                                                                                                                                |
| **Channel identity**                  | `DistributionChannel`                                                                                                                                                                                                                                          |
| **Client projection**                 | Design 073                                                                                                                                                                                                                                                     |
| **Final report dependency**           | Design 130                                                                                                                                                                                                                                                     |
| **Reporting dependency**              | Designs 033 / 131–134                                                                                                                                                                                                                                          |
| **Executive analytics dependency**    | Designs 038 / 135                                                                                                                                                                                                                                              |
| **Integration health dependency**     | Designs 139–140                                                                                                                                                                                                                                                |
| **Publishing verification boundary**  | Designs 124–126                                                                                                                                                                                                                                                |
| **Activity dependency**               | Design 119                                                                                                                                                                                                                                                     |
| **Audit dependency**                  | Design 039                                                                                                                                                                                                                                                     |
| **Primary query service**             | `DistributionPerformanceQueryService`                                                                                                                                                                                                                          |
| **Verification service**              | canonical `DistributionPlacementVerificationService`                                                                                                                                                                                                           |
| **Metric ingestion service**          | `DistributionMetricObservationService`                                                                                                                                                                                                                         |
| **Metric aggregation service**        | `DistributionPerformanceAggregationService`                                                                                                                                                                                                                    |
| **Metric registry**                   | canonical Design-038 `MetricRegistry`                                                                                                                                                                                                                          |
| **Freshness resolver**                | `MetricFreshnessResolver`                                                                                                                                                                                                                                      |
| **Placement health resolver**         | `DistributionPlacementHealthResolver`                                                                                                                                                                                                                          |
| **Anomaly resolver**                  | `DistributionPerformanceAnomalyResolver` where frozen design requires anomalies                                                                                                                                                                                |
| **Parent shell**                      | `InternalAppShell` — Design 001                                                                                                                                                                                                                                |
| **Auth**                              | Required                                                                                                                                                                                                                                                       |
| **Authorization**                     | Active OrganizationMembership + Distribution verification/performance permissions                                                                                                                                                                              |
| **Implementation priority**           | **Critical Reporting Integrity / Verification Trust / Metric Provenance**                                                                                                                                                                                      |
| **Reuse level**                       | **Extremely High across Client reporting, final reports, analytics, renewals and operational QA**                                                                                                                                                              |

Design 129 should answer:

> **“Which downstream Placements are currently verified, which have become missing or mismatched, when were they last checked, what performance has actually been observed on each channel, how fresh and trustworthy is each metric, which data is unavailable rather than zero, and what evidence can safely feed client or final reporting?”**

Canonical architecture:

```text
DistributionCampaign DC-100
        │
        ├── Placement P-10
        ├── Placement P-11
        └── Placement P-12
                │
                ├── Verification history
                │
                └── Metric observations
                        │
                        ↓
                Metric Registry
                        │
                        ↓
              Performance Aggregation
                        │
             ┌──────────┼──────────┐
             ↓          ↓          ↓
          Channel    Campaign    Period
          summary    summary    summary
                        │
                        ↓
             Design 129 live analytics
                        │
                        ↓
            Design 130 frozen report input
```

---

# 2. Reuse

## Design 128 remains canonical Placement authority

Design 129 must use the exact same:

```text
Placement.id
PlacementVerification.id
ChannelExecution.id
```

established through Design 128.

Do not create:

```text
PerformancePlacement
VerifiedPlacement
AnalyticsPlacement
DistributionMetricPlacement
```

as parallel identities.

---

## Design 129 aggregates; Design 128 investigates one Placement

### Design 128

> What exactly happened to this one Placement?

### Design 129

> How are Placements performing and verifying across Campaigns/channels?

Correct:

```text
Placement P-10
    ↓
Design 128 detail

Placement P-10
Placement P-11
Placement P-12
    ↓
Design 129 aggregate analysis
```

Same backend.

---

## Placement ≠ PlacementVerification

Permanent.

One Placement can have many verification observations over time.

Example:

```text
P-10
├── Aug 20 VERIFIED
├── Aug 22 VERIFIED
└── Aug 25 NOT_FOUND
```

Current status may be `Missing`, but historical verification remains.

---

## Verification ≠ Performance

Critical.

### Verification

> Does this Placement exist correctly?

### Performance

> What measurable impact did this Placement produce?

A Placement can be:

```text
VERIFIED
+
Performance Unavailable
```

and that is valid.

---

## Placement Verification ≠ Publishing Verification

Permanent.

### Publishing Verification

Proves the canonical release is live at a PublicationTarget.

### Distribution Verification

Proves a downstream promotional/syndicated Placement exists correctly.

They can share low-level verification primitives.

They must remain separately typed.

---

## MetricDefinition remains Design 038 authority

This is one of the strongest Design 129 reuse requirements.

Do not define:

```text
distributionMetricType = "engagement"
```

with ad hoc formulas inside Design 129.

Use canonical metric definitions for:

* impressions;
* views;
* clicks;
* engagements;
* shares;
* referrals;
* conversion-related measures where legitimately available.

Exact metric catalog belongs to Phase 3D/business definitions.

---

## MetricDefinition ≠ MetricObservation

Critical.

### MetricDefinition

Defines what the metric means and how it is calculated.

### MetricObservation

Records an observed value from a source at a time.

---

## MetricObservation ≠ MetricAggregate

Permanent.

Example:

```text
LinkedIn provider observation:
12,450 impressions at 10:00

LinkedIn provider observation:
13,800 impressions at 16:00
```

Those are observations.

A campaign total or period delta is a derived aggregate.

---

## Aggregate ≠ Report snapshot

Critical.

Design 129 may show a live/current aggregate.

Design 130 must later freeze a reproducible period/report dataset.

---

## Live analytics ≠ frozen client report

Design 033 established this boundary.

Correct:

```text
Live:
13,800 impressions
fresh as of now

Final Report:
12,940 impressions
for Aug 1–31
based on frozen report dataset
```

Both can be valid.

They are not the same artifact.

---

## Client projection remains Design 073

Design 129 may contain:

* missing metric data;
* provider failures;
* anomaly flags;
* verification mismatches;
* internal confidence/provenance.

Design 073 receives only the client-safe approved projection.

---

## Integration health remains Designs 139–140

A provider API outage may explain why metrics are stale.

But Design 129 does not own provider credentials/connection lifecycle.

---

## DistributionCampaign ≠ performance aggregate

Permanent.

Campaign identity remains Design 032/127.

Performance is a read/analytics composition over its Placements/metrics.

---

# 3. Entities

## Placement

Canonical Design-128 entity.

It remains the anchor for:

* verification;
* channel;
* exact source;
* metric observations;
* performance reporting.

---

## PlacementVerification

Append-oriented verification evidence.

Conceptually:

```text
PlacementVerification
├── id
├── placementId
├── expectedSourceReference
├── verificationMethod
├── result
├── verifiedAt
├── evidence
├── freshness
├── verifier
└── revision
```

Design 129 should aggregate these rather than creating one mutable `verified=true`.

---

## Current verification state

Derived by:

```text
DistributionPlacementHealthResolver
```

from:

* most recent authoritative verification;
* method/provenance;
* freshness;
* known provider events;
* current Placement lifecycle.

Do not simply use:

```text
ORDER BY verifiedAt DESC LIMIT 1
```

without evidence policy.

---

## Verification history ≠ current status

Permanent.

---

## MetricDefinition

Canonical metric registry entry.

Conceptually:

```text
MetricDefinition
├── id
├── key
├── semantic name
├── unit
├── aggregation behavior
├── scope
├── source compatibility
├── calculation/version
└── lifecycle
```

Exact structure Phase 3D.

---

## Metric key must be stable

Examples conceptually:

```text
IMPRESSIONS
CLICKS
ENGAGEMENTS
REFERRALS
```

UI labels can change without altering metric identity.

---

## MetricDefinition versioning

If formula/semantic definition changes materially:

historical reports must remain explainable.

Do not silently reinterpret old metric observations under a new formula.

---

## MetricObservation

Canonical provider/manual metric evidence.

Conceptually:

```text
MetricObservation
├── id
├── organizationId
├── placementId
├── metricDefinitionId
├── provider/source
├── value
├── observedAt
├── ingestedAt
├── measurementWindow?
├── provenance
├── quality/confidence class
├── externalReference?
└── revision
```

---

## `observedAt` ≠ `ingestedAt`

Critical.

A provider may report:

> metric value as of 12:00

but the platform ingests it at:

> 12:15.

Both matter.

---

## Measurement window

Some provider metrics are:

* cumulative;
* daily;
* period-specific;
* lifetime totals.

This must be explicit.

Otherwise summing them will create false metrics.

---

## Cumulative metric ≠ incremental metric

Very important.

Example:

```text
12:00 total impressions = 10,000
18:00 total impressions = 12,000
```

You cannot sum to 22,000.

The aggregation policy belongs to the MetricDefinition/provider adapter.

---

## MetricObservation value uses correct numeric precision

Use appropriate numeric types.

Do not coerce all analytics into integer if ratios/percentages/monetary/referral values require decimals.

---

## Metric provenance

Strongly required.

Conceptually:

```text
VERIFIED_PROVIDER
PROVIDER_REPORTED
ESTIMATED
DERIVED
MANUAL
UNAVAILABLE
```

Exact enum Phase 3D.

---

## Metric provenance ≠ metric value

Permanent.

`1000 estimated impressions` and `1000 provider-reported impressions` are not identical evidence quality.

---

## Zero value

Correct:

```text
value = 0
availability = AVAILABLE
```

---

## Unavailable value

Correct:

```text
value = null
availability = UNAVAILABLE
```

Never store unavailable as `0`.

---

## Stale value

Example:

```text
value = 12,000
observedAt = 5 days ago
freshness = STALE
```

This remains different from:

* unavailable;
* current;
* zero.

---

## MetricAggregate

Derived performance result.

Conceptually:

```text
MetricAggregate
├── scope
├── campaignId?
├── placementId?
├── channelId?
├── metricDefinitionId
├── period
├── value
├── sourceObservationRefs
├── calculatedAt
├── calculationVersion
├── freshness
└── dataQuality
```

May be materialized or computed.

It remains rebuildable.

---

## Aggregate source references

For important reportable metrics, the system should be able to answer:

> Which observations contributed to this number?

---

## PerformanceSnapshot

If needed for a fixed reporting period:

```text
PerformanceSnapshot
```

should be immutable/frozen and feed Design 130.

It must not replace live MetricObservations.

---

## Snapshot ≠ current analytics

Absolute.

---

## ChannelPerformanceView

Read projection.

Conceptually:

```text
DistributionChannelPerformanceView
├── channel
├── placements
├── verified count
├── unavailable count
├── metric aggregates
├── freshness summary
└── anomaly summary
```

Not a canonical entity.

---

## CampaignPerformanceView

Same principle.

---

## PlacementHealth

Derived condition, not a new canonical Placement lifecycle unless the source domain already defines it.

Potentially:

```text
HEALTHY
DEGRADED
MISSING
UNKNOWN
```

But do not force exact enum here.

---

## Anomaly

If frozen Design 129 includes anomalies/attention states, treat them as derived analytical findings.

Conceptually:

```text
PerformanceAnomaly
├── scope
├── metricDefinition
├── period
├── baseline/reference
├── detection method/version
├── detectedAt
└── severity/condition
```

---

## Anomaly ≠ Risk/Blocker

Permanent.

A metric anomaly can generate a Task/Risk if human workflow decides so.

It is not automatically a ProjectRisk.

---

# 4. Permissions

Design 129 should conceptually distinguish:

```text
distributionPerformance.read
distributionPerformance.readSensitive
distributionPerformance.export

distributionVerification.read
distributionVerification.run
distributionVerification.manualVerify
distributionVerification.override

distributionMetric.read
distributionMetric.ingestManual
distributionMetric.manageDefinition
```

Exact keys belong to Phase 3D.

---

## Performance read ≠ raw provider evidence read

Permanent.

---

## Performance read ≠ metric-definition administration

Critical.

---

## MetricDefinition administration ≠ Distribution campaign management

Permanent.

---

## Verification read ≠ run verification

Permanent.

---

## Run verification ≠ manual verify

Permanent.

---

## Manual verification ≠ override

Potentially stronger separation.

---

## Manual metric entry ≠ normal metric read

If manual metrics are allowed, this must be separately authorized and audited.

---

## Manual metric entry must expose provenance

Never let manually entered `5000 impressions` appear provider-verified.

---

## Export permission separate

Performance export may reveal:

* client data;
* provider metrics;
* campaign details.

Archive/read access should not automatically imply bulk export.

---

## Client access remains Design 073

Internal analytics can contain more detail than client-visible data.

---

## Cross-tenant aggregation prohibited

Absolute.

A campaign/placement/metric query must filter tenant before aggregation.

---

## Permission before aggregation

Important Design-038 rule.

Never calculate global totals first and filter after.

That can leak restricted data through totals.

---

## Filter/facet counts must be permission-safe

Same rule.

---

# 5. States

Design 129 must keep **Placement verification, verification freshness, metric availability, metric provenance, metric freshness, aggregate completeness, provider health, and report readiness** independent.

### Placement verification

```text
Verified
Mismatch
Not Found
Unknown
Unavailable
```

### Verification freshness

```text
Fresh
Aging
Stale
Unknown
```

### Metric availability

```text
Available
Partial
Unavailable
```

### Metric provenance

```text
Provider Reported
Verified Provider
Derived
Estimated
Manual
Unknown
```

### Metric freshness

```text
Fresh
Stale
Unknown
```

### Aggregate completeness

```text
Complete
Partial
Unknown
```

These must never collapse into one generic `performance.status`.

---

## Verified Placement ≠ fresh metrics

Permanent.

---

## Stale metrics ≠ Placement stale

Permanent.

---

## Placement missing ≠ all historical metrics invalid

Critical.

Historical metrics may still accurately describe the period when the Placement existed.

---

## Provider unavailable ≠ metrics zero

Absolute.

---

## Metric unavailable ≠ zero

Absolute.

---

## Metric stale ≠ unavailable

Permanent.

---

## Metric estimated ≠ provider-reported

Permanent.

---

## Metric manual ≠ verified provider

Permanent.

---

## Aggregate partial ≠ zero

Absolute.

---

## Some channels unavailable ≠ campaign has no performance

Permanent.

---

## Current verification failure ≠ historical report invalid automatically

Critical.

Example:

> Placement existed during reporting period and later disappeared.

The historical report may remain valid.

---

## Verification mismatch ≠ metric invalid universally

Metrics might still describe the wrong/mismatched object, which means they require careful provenance/qualification.

Do not silently include them as intended-placement performance.

---

## State Coverage

Design 129 inherits Design 150 plus:

```text
Distribution Performance Loading
Distribution Performance Available
Distribution Performance Empty
Distribution Performance Restricted
Distribution Performance Partial
Distribution Performance Unavailable

Placement Verified
Placement Verification Pending
Placement Mismatch
Placement Not Found
Placement Verification Unknown
Placement Verification Unavailable

Verification Fresh
Verification Aging
Verification Stale
Verification Freshness Unknown

Metric Available
Metric Zero
Metric Partial
Metric Unavailable
Metric Stale

Metric Provider Reported
Metric Verified Provider
Metric Derived
Metric Estimated
Metric Manual
Metric Provenance Unknown

Aggregate Complete
Aggregate Partial
Aggregate Unknown
Aggregate Recalculating

Channel Performance Available
Channel Performance Partial
Channel Performance Unavailable

Campaign Performance Available
Campaign Performance Partial
Campaign Performance Unavailable

Provider Metrics Healthy
Provider Metrics Delayed
Provider Metrics Unavailable
Provider Metrics Health Unknown

Performance Updated Elsewhere
Verification Updated Elsewhere
Metric Observation Arrived
Metric Definition Updated
Aggregate Recalculated
Performance Projection Stale
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize:

1. verification health;
2. metric availability;
3. channel/campaign comparisons;
4. freshness/provenance;
5. operational attention.

Conceptually:

```text
Distribution Performance
↓
Overall verification health
↓
Campaign / Channel performance
↓
Placement verification states
↓
Core metric aggregates
↓
Freshness / provenance
↓
Attention / anomalies
```

Only frozen Design 129 elements should render.

---

## Verification and performance must be visually distinct

Correct:

> Placement Verified
> Metrics Unavailable

not:

> Placement failed.

---

## Zero values should be visually real numbers

Correct:

> Clicks: 0

when available.

Unavailable should be:

> Clicks: Unavailable

not `0`.

---

## Freshness must remain visible

Example:

> Impressions 12,450 · updated 2h ago

versus:

> Impressions 12,450 · stale, last updated 5 days ago

---

## Provenance should be inspectable

Where relevant:

> Provider-reported

> Estimated

> Manual

This matters especially before client reporting.

---

## Cross-channel comparison must respect non-equivalent metrics

Do not directly compare:

> views on Platform A

with:

> impressions on Platform B

unless MetricDefinition semantics say they are comparable.

---

## Aggregation labels should be semantically correct

Avoid generic:

> Engagement = 9.4K

unless the formula is defined centrally.

---

## Placement health drill-in

Design 129 should link/drill into Design 128 context for:

* mismatch;
* missing;
* unknown;
* stale verification.

No duplicate investigation workflow.

---

## Tablet

Following Design 152:

* verification summary remains first;
* performance KPI cards stack;
* channel comparisons simplify;
* provenance/freshness remains visible;
* detailed metric tables become scrollable/expandable without hiding availability state.

---

## Mobile

Priority:

```text
Verification health
↓
Key performance metrics
↓
Freshness
↓
Channel summaries
↓
Missing / Mismatched placements
↓
Unavailable metrics
↓
Detailed drill-ins
```

Do not attempt to compress a desktop comparison matrix into unreadable phone columns.

---

## Mobile metric item

Correct:

> Impressions
> 12,450
> Provider reported · updated 2h ago

or:

> Impressions
> Unavailable
> Provider metrics API unavailable

---

## Accessibility

A performance item could communicate:

> LinkedIn Placement P-10 is verified. It recorded 12,450 provider-reported impressions as of August 22 at 6 PM. The metric is fresh. Clicks are unavailable because the provider did not return click data. Zero clicks has not been recorded.

where canonical authorized data supports it.

---

# 7. Backend Requirements

## Canonical performance architecture

```text
Design 129
    ↓
Authenticated Workspace Context
    ↓
DistributionPerformanceQueryService
    │
    ├── CampaignAdapter
    ├── PlacementAdapter
    ├── VerificationAdapter
    ├── MetricDefinitionAdapter
    ├── MetricObservationAdapter
    ├── MetricAggregationAdapter
    ├── FreshnessResolver
    ├── IntegrationHealthAdapter
    └── AnomalyResolver
    ↓
DistributionPerformanceView
```

All metric semantics come from the canonical Metric Registry.

---

## Metric ingestion architecture

Conceptually:

```text
Provider / manual source
        ↓
Metric ingestion adapter
        ↓
MetricObservation
        ↓
validation / normalization
        ↓
Metric aggregation
        ↓
Performance views
```

---

## Provider adapter normalization

Different providers may call similar concepts:

* views;
* impressions;
* reaches;
* engagements.

Do not normalize merely by label similarity.

Map them deliberately to canonical metric definitions only where semantics truly match.

---

## Source-native metric preservation

Where a provider metric does not map cleanly:

retain it as a provider-specific canonical metric definition rather than forcing it into the wrong global metric.

---

## Metric ingestion idempotency

Critical.

Repeated provider polling/callback must not duplicate the same observation.

Use provider observation IDs where available or deterministic observation keys.

---

## Observation identity

Potential uniqueness:

```text
placementId
+ metricDefinitionId
+ provider/source
+ measurementWindow
+ observedAt
+ externalReference
```

as appropriate.

Exact database strategy Phase 3D.

---

## Cumulative metric handling

Critical.

If provider returns cumulative lifetime totals:

store them as cumulative observations.

Aggregation calculates:

* latest value;
* delta over period;

according to metric definition.

Do not `SUM()` snapshots.

---

## Incremental metric handling

If provider returns per-period increments:

aggregation may sum them when metric semantics allow.

---

## Counter reset

Provider cumulative counters can occasionally reset/change.

Aggregation must detect/handle anomalies rather than producing negative nonsense silently.

---

## Metric normalization

Normalize:

* numeric units;
* percentages;
* currency if ever relevant;
* provider formats.

Keep original evidence/provenance.

---

## Metric quality validation

Reject/flag:

* nonnumeric values where numeric expected;
* impossible negative counts unless definition allows;
* malformed percentages;
* overflow/outlier cases.

Do not silently coerce corrupt provider responses to zero.

---

## Metric availability model

Strongly recommended:

```text
MetricValueResult
├── availability
├── value?
├── observedAt?
├── provenance
├── freshness
└── reason?
```

This prevents `null`/`0` ambiguity.

---

## Freshness Resolver

Central:

```text
MetricFreshnessResolver.resolve(
    metricDefinition,
    observedAt,
    provider,
    currentTime
)
```

Different metrics/providers may have different expected refresh windows.

---

## Verification refresh

Placement verification can also have freshness policy.

Do not use the same timing thresholds blindly for all channels.

---

## Scheduled collection

If metrics are polled:

use durable background jobs.

Do not rely on browser page loads to update metrics.

---

## Provider rate limits

Metric collection should use:

* batching;
* rate-limit coordination;
* backoff;
* caching;
* checkpointing.

Do not hammer provider APIs from every page request.

---

## Provider unavailable

Preserve last known observation.

Return:

```text
value = last known
freshness = STALE
provider health = UNAVAILABLE
```

where appropriate.

Do not erase value to zero.

---

## No observation exists

Return:

```text
UNAVAILABLE / NOT_YET_OBSERVED
```

not `0`.

---

## Verification worker

Should periodically or event-triggeredly reverify Placements according to channel policy.

---

## Verification history is append-oriented

Never overwrite prior verification.

---

## Verification current-state resolver

Central service chooses the current Placement verification/health condition.

---

## Verification mismatch

Must retain:

* expected content/source;
* observed content/reference;
* method;
* time.

Do not silently classify as generic failed.

---

## Metric/verification coupling

Performance query may exclude or qualify metrics from:

* unverified;
* mismatched;
* wrong-source;

Placements according to reporting policy.

This should be explicit.

---

## Example

```text
P-10 expected Publication v3
P-10 currently MISMATCH → points to v2
```

Metrics from P-10 should not silently be reported as v3 performance.

---

## Campaign aggregation

Conceptually:

```text
DistributionPerformanceAggregationService.aggregateCampaign(
    campaignId,
    period,
    metricDefinitions
)
```

must:

1. authorize before aggregation;
2. resolve exact eligible Placements;
3. apply metric definitions;
4. respect measurement windows;
5. preserve unavailable/partial states;
6. calculate freshness;
7. retain contributing observation references.

---

## Cross-channel aggregation

Only aggregate semantically compatible metrics.

Example:

```text
Website referrals + LinkedIn referrals
```

may be valid if both use the same canonical metric definition.

But provider-specific `views` should not be summed into `impressions` merely because both look similar.

---

## Deduplication across channels

Do not claim:

> unique audience

by summing channel reach unless cross-channel identity/deduplication actually exists.

This is a major analytics integrity requirement.

---

## Reach ≠ impressions

Permanent unless MetricDefinition explicitly defines relationship.

---

## Clicks ≠ unique visitors

Permanent.

---

## Engagements ≠ engagement rate

Permanent.

---

## Conversion ≠ click

Permanent.

---

## Derived rates

Example:

```text
engagementRate =
engagements / impressions
```

only if canonical MetricDefinition defines:

* numerator;
* denominator;
* zero-denominator behavior;
* period;
* precision.

Do not calculate ad hoc in frontend.

---

## Divide-by-zero

If impressions = 0:

do not produce infinite/NaN rate.

Metric definition decides:

* 0;
* unavailable;
* not applicable.

---

## Metric calculation version

Store/retain formula version for derived metrics used in reporting.

---

## Performance snapshots

For reportable fixed periods:

```text
createPerformanceSnapshot(
    campaignId,
    period,
    metricDefinitionVersionSet
)
```

may freeze:

* included Placements;
* verification status;
* observation refs;
* calculated aggregates;
* calculatedAt.

Design 130 can use it.

---

## Snapshot creation ≠ live analytics mutation

Absolute.

---

## Snapshot reproducibility

Later provider updates must not rewrite a finalized historical report snapshot.

---

## Design 130 integration

Design 130 should consume:

* exact CampaignVersion;
* exact Placement set;
* exact verification evidence/snapshot;
* exact period metric snapshot.

No querying "whatever performance is current today" when generating historical final report.

---

## Design 131–134 integration

Reporting engine should use the same Metric Registry and snapshot semantics.

---

## Client Design 073 integration

Client live performance may be:

* current;
* delayed;
* selectively exposed.

Client-facing values must preserve:

* period;
* freshness where appropriate;
* unavailable vs zero.

---

## Client-facing metric curation

Internal metrics are not automatically client-visible.

Each metric may require:

* client visibility policy;
* report inclusion policy.

---

## Metric redaction/filtering

Do not leak internal operational metrics such as:

* provider failure counts;
* connection errors;
* internal QA fields,

unless intended.

---

## Manual metrics

If supported:

```text
recordManualMetricObservation(...)
```

must require:

* metric definition;
* Placement;
* value;
* observedAt/period;
* actor;
* evidence/source;
* provenance = MANUAL;
* reason where appropriate.

---

## Manual metrics cannot overwrite provider observations

They coexist with provenance.

Aggregation policy decides which are eligible.

---

## Metric correction

If a bad observation is discovered:

avoid destructive silent edit.

Use:

* correction/replacement observation;
* invalidation flag;
* lineage/Audit.

Exact method Phase 3D.

---

## Metric correction ≠ report rewrite automatically

A finalized report snapshot remains unchanged unless explicitly regenerated/revised.

---

## Anomaly detection

If frozen Design 129 includes warnings such as:

* sudden metric drop;
* missing Placement;
* stale provider feed;

use versioned detection logic.

Do not call every low metric an anomaly.

---

## Anomaly ≠ failure

Permanent.

---

## Anomaly ≠ Risk

Permanent.

It may create follow-up work separately.

---

## Integration health

Design 129 consumes:

```text
provider connection health
last successful collection
rate-limit state
```

from Designs 139/140.

No credential management here.

---

## Provider outage after historical observations

Correct:

```text
Last known impressions = 12,450
Freshness = STALE
Provider = unavailable
```

Not:

```text
Impressions = 0
```

---

## Activity

Design 119 may project:

```text
PlacementVerificationFailed
PlacementVerificationRecovered
DistributionMetricsUnavailable
```

only where materially useful.

Do not flood Activity with every metric poll.

---

## Audit

Strong Audit is appropriate for:

* manual verification;
* overrides;
* manual metric entry;
* metric correction/invalidation;
* snapshot/finalization operations;
* export where sensitive.

Routine automated metric ingestion belongs in operational telemetry/event history, not noisy human Audit for every polling cycle unless governance requires it.

---

## Operational logs ≠ MetricObservations

Absolute.

Provider polling logs remain observability.

MetricObservation contains business measurement evidence.

---

## Idempotency

Required for:

* verification ingestion;
* provider metric ingestion;
* manual observation commands;
* snapshot creation;
* correction processing;
* background aggregation.

---

## Optimistic concurrency

Most analytics are append/derived, but manual verification/correction/snapshot-finalization actions should use revision/state checks.

---

## Caching

Performance caches should vary by:

```text
organizationMembershipId
authorizationRevision
campaignId / channel / placement scope
date period
metricDefinitionVersion
placementRevision
verificationRevision
metricObservationRevision
aggregateRevision
integrationHealthRevision
filters
```

---

## Cache freshness

Metric freshness must not be hidden by a longer UI cache TTL.

---

## Performance

Use:

* time-series/metric indexes;
* preaggregations/materialized summaries where scale requires;
* bounded periods;
* channel/campaign aggregate tables/read models;
* background ingestion;
* lazy detailed observation history;
* cursor pagination for verification/observation histories.

Avoid recalculating all lifetime metrics from raw observations on every page open.

---

## Time-series scale

MetricObservation volume may become one of the larger tables.

Phase 3D should consider:

* partitioning by time/tenant;
* provider/channel indexes;
* retention/downsampling policy;
* historical snapshot preservation.

---

## Downsampling ≠ report evidence destruction

If raw high-frequency observations are later compacted, finalized report snapshots/source references must remain reconstructable according to policy.

---

## Partial failure contract

Example:

```text
Placements            ✓
Verification          ✓
LinkedIn metrics      ✓
Newsletter metrics    ✕
Partner metrics       ✓
```

Correct:

> Campaign performance is partial. Newsletter metrics are currently unavailable.

Incorrect:

> Newsletter performance = 0.

Another:

```text
Placement P-10       VERIFIED
Last metric          12,450
Provider API         unavailable
```

Correct:

> 12,450 last observed; metric is stale because provider metrics are currently unavailable.

Not:

> 0.

Another:

```text
P-10 previously VERIFIED
Current verification unavailable
```

Correct:

> Last verified Aug 22; current Placement state cannot be reverified.

Not:

> Placement missing.

---

## Backend Requirement Matrix

| Requirement                                     | Status                                      |
| ----------------------------------------------- | ------------------------------------------- |
| Design 032 canonical Distribution reuse         | **Critical**                                |
| Designs 127–128 exact Campaign/Placement reuse  | **Critical**                                |
| No second Placement or verification engine      | **Critical**                                |
| Placement/Verification separation               | **Critical**                                |
| Verification history/current state separation   | **Critical**                                |
| Publishing/Distribution verification separation | **Critical**                                |
| Verification method/provenance                  | **Critical**                                |
| Verification freshness                          | **Critical**                                |
| Verified/Mismatch/Missing/Unknown separation    | **Critical**                                |
| MetricDefinition central Design-038 reuse       | **Critical**                                |
| MetricDefinition/Observation separation         | **Critical**                                |
| MetricObservation/Aggregate separation          | **Critical**                                |
| Live aggregate/Report snapshot separation       | **Critical**                                |
| Stable metric keys/semantics                    | **Critical**                                |
| Metric-definition versioning                    | **Critical for derived/reportable metrics** |
| observedAt/ingestedAt separation                | **Critical**                                |
| Measurement-window semantics                    | **Critical**                                |
| Cumulative/incremental metric distinction       | **Critical**                                |
| Provider metric semantic normalization          | **Critical**                                |
| Zero/unavailable separation                     | **Critical**                                |
| Stale/unavailable separation                    | **Critical**                                |
| Provider-reported/estimated/manual separation   | **Critical**                                |
| Metric provenance                               | **Critical**                                |
| Metric freshness                                | **Critical**                                |
| Numeric precision/unit correctness              | **Critical**                                |
| Metric ingestion idempotency                    | **Critical**                                |
| Provider rate-limit/backoff coordination        | **Critical**                                |
| Counter reset/anomaly handling                  | **Critical**                                |
| Permission before aggregation                   | **Critical**                                |
| Cross-channel semantic compatibility            | **Critical**                                |
| No false unique-audience summation              | **Critical**                                |
| Derived formula registry/versioning             | **Critical**                                |
| Divide-by-zero policy                           | **Critical**                                |
| Placement mismatch/metric qualification         | **Critical**                                |
| Performance snapshot reproducibility            | **Critical for Design 130**                 |
| Design 130 frozen report reuse                  | **Critical architecture**                   |
| Designs 131–134 reporting reuse                 | **Critical architecture**                   |
| Design 073 client-safe performance reuse        | **Critical**                                |
| Designs 139–140 integration-health reuse        | **Critical architecture**                   |
| Manual metric provenance                        | **Critical if manual metrics exist**        |
| Metric corrections preserve lineage             | **Critical**                                |
| Finalized report snapshot not auto-rewritten    | **Critical**                                |
| Operational logs/metric evidence separation     | **Critical**                                |
| Cross-tenant aggregation prohibited             | **Critical**                                |
| Performance export separate permission          | **Critical if export exists**               |
| Idempotency                                     | **Critical**                                |
| Audit/outbox integration                        | **Required**                                |
| Partial dependency failure handling             | **Critical**                                |
| Time-series scaling/partition strategy          | **Critical architecture**                   |

---

# 8. Consolidation

Design 129 has one of the highest **data-trust risks** in the platform because performance dashboards can easily show authoritative-looking numbers without sufficient provenance.

**Design 128 / Design 129 Placement duplication**
Detail and analytics use different Placement identities.

**Placement / Verification conflation**
Placement existence becomes verified truth.

**Verification / Performance conflation**
Metric availability determines whether Placement exists.

**Publishing Verification / Distribution Verification conflation**
Canonical release and downstream placement checks lose meaning.

**Verification current state / verification history conflation**
Later missing result destroys earlier verified evidence.

**Verification stale / verification failed conflation**
Age is treated as negative result.

**Provider-reported / independently verified conflation**
Evidence quality disappears.

**Manual verification / automated verification conflation**
Human judgement appears machine-confirmed.

**Override / verified conflation**
Administrative acceptance becomes false technical fact.

**MetricDefinition / MetricObservation conflation**
Metric meaning and one measured value become one object.

**MetricObservation / MetricAggregate conflation**
Raw evidence and derived totals collapse.

**MetricAggregate / Report snapshot conflation**
Current analytics rewrites historical reports.

**Metric key / UI label conflation**
Renaming a label changes semantic identity.

**Provider metric label / canonical metric conflation**
“Views” gets mapped to “Impressions” incorrectly.

**Provider-specific metric / universal metric conflation**
Incompatible measures get aggregated.

**Cumulative / incremental metric conflation**
Snapshot totals are summed and double-counted.

**Observed time / ingestion time conflation**
Metrics are assigned to wrong reporting period.

**Lifetime metric / period metric conflation**
Historical reports overcount.

**Zero / unavailable conflation**
Provider outage looks like poor performance.

**Zero / not-yet-observed conflation**
New Placement looks like zero engagement.

**Stale / unavailable conflation**
Old data disappears.

**Stale / current conflation**
Old metrics are shown as fresh.

**Estimated / provider-reported conflation**
Confidence is hidden.

**Manual / provider-reported conflation**
Human-entered values appear external.

**Metric correction / overwrite conflation**
Original evidence disappears.

**Metric correction / report snapshot update conflation**
Published reports change silently.

**Metric current value / historical observation conflation**
Time-series evidence disappears.

**Metric value / timeless field conflation**
No observedAt/period/freshness.

**Campaign performance / Placement performance conflation**
Cannot drill down/source totals.

**Channel performance / Campaign performance conflation**
Scope becomes ambiguous.

**Cross-channel sum / unique audience conflation**
Same person counted multiple times but labeled unique reach.

**Reach / impressions conflation**
Semantics are falsified.

**Views / impressions conflation**
Provider metrics become incomparable.

**Clicks / visitors conflation**
Different concepts merge.

**Engagement / engagement rate conflation**
Count and ratio merge.

**Derived rate / raw provider metric conflation**
Formula lineage disappears.

**Divide-by-zero / zero rate conflation**
Invalid ratio is shown as valid.

**Partial aggregate / complete aggregate conflation**
Missing channels go unnoticed.

**Unavailable channel / zero contribution conflation**
Campaign total is understated without warning.

**Placement mismatch / intended Placement performance conflation**
Metrics from wrong content are credited to campaign source.

**Placement missing now / historical metrics invalid conflation**
Valid historical performance is discarded.

**Provider API unavailable / Placement missing conflation**
Integration outage becomes distribution failure.

**Provider API unavailable / metrics zero conflation**
Dashboard lies.

**Integration health / performance state conflation**
Provider issue rewrites historical analytics.

**Live analytics / final report conflation**
Numbers change after report delivery.

**Metric snapshot / current metric conflation**
Frozen period cannot be reconstructed.

**Final report / performance workspace conflation**
Design 130 becomes unnecessary or duplicate.

**Client metric / internal metric conflation**
Operational/internal measures leak.

**Performance read / export conflation**
Bulk data leakage.

**Permission after aggregation / permission before aggregation conflation**
Restricted placements leak through totals.

**Global metric total / tenant-scoped total conflation**
Cross-tenant leakage.

**Metric anomaly / failure conflation**
Low performance is treated as system error.

**Metric anomaly / Risk conflation**
Analytics directly creates ProjectRisk semantics.

**Activity event / metric observation conflation**
Every provider poll floods Activity.

**Audit event / metric observation conflation**
Business measurements become compliance log noise.

**Application log / metric evidence conflation**
Provider request logs become analytics truth.

**Search index / current performance conflation**
Stale indexed numbers become authority.

**Generic `metrics JSON`**
No definitions, periods, provenance or freshness.

**Generic `performance_score`**
Different metric dimensions collapse into one arbitrary number.

**Generic `verified=true`**
No history/method/freshness/evidence.

**129/032 duplicate Distribution analytics**
Distribution foundation forks.

**129/038 duplicate Metric Registry**
Metric definitions diverge.

**129/073 duplicate client performance truth**
Portal and internal numbers disagree.

**129/128 duplicate Placement verification**
Two engines decide whether Placement exists.

**129/130 duplicate frozen-report data**
Live metrics and final report overwrite each other.

**129/131–134 duplicate reporting metrics**
Report Builder uses different formulas.

**129/139–140 duplicate provider health**
Analytics starts owning connection state.

No additional screen is required.

These are **verification history, Metric Registry reuse, observation/aggregate/snapshot separation, provenance/freshness, zero/unavailable semantics, cross-channel metric compatibility, live-vs-frozen reporting, time-series scaling, and client-safe reporting requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL DISTRIBUTION PLACEMENT VERIFICATION, PERFORMANCE OBSERVATION & CROSS-CHANNEL ANALYTICS ANCHOR**

**Domain directive:**
**Placement ≠ PlacementVerification ≠ VerificationObservation ≠ MetricDefinition ≠ MetricObservation ≠ MetricAggregate ≠ PerformanceSnapshot ≠ DistributionCampaign ≠ ChannelExecution ≠ PublicationVerification ≠ ReportVersion ≠ ClientPerformanceProjection.**

**Foundation directive:**
Design 032 remains the canonical Distribution foundation, while Designs 127–129 share the same Campaign, ChannelExecution, Placement and verification identities.

**Placement directive:**
Design 128 remains authoritative for exact Placement provenance and detail. Design 129 aggregates those Placements and never creates a parallel performance-specific Placement entity.

**Verification directive:**
`PlacementVerification` remains append-oriented evidence. Current Placement health is resolved from verification history/method/freshness and never stored as a destructive `verified=true` shortcut.

**Verification-history directive:**
a Placement verified earlier and missing later retains both observations. Current state never erases historical existence.

**Verification-method directive:**
provider-reported, automated external, manual and overridden verification remain explicitly distinguishable.

**Publishing-verification directive:**
Distribution Placement verification remains a separate typed domain from Publication Verification even when shared technical verification primitives are reused.

**Metric-registry directive:**
Design 038's canonical Metric Registry defines semantic identity, unit, aggregation behavior, compatible sources and calculation versions for all Distribution performance metrics.

**No-local-formula directive:**
Design 129 frontend/backend cannot invent independent definitions for impressions, clicks, engagement, reach, referrals, rates or other metrics.

**Metric-definition directive:**
metric labels may change; stable MetricDefinition keys and semantic versions preserve historical/reporting consistency.

**Observation directive:**
each `MetricObservation` records an actual provider/manual/derived observation with exact Placement, metric definition, source, observed time, ingestion time, period/window, value and provenance.

**Time directive:**
`observedAt` and `ingestedAt` remain distinct so delayed provider collection cannot shift metrics into incorrect periods.

**Window directive:**
lifetime cumulative totals, per-period increments and point-in-time snapshots remain explicitly typed; aggregation never assumes they can all be summed.

**Cumulative directive:**
successive cumulative provider totals are not summed. MetricDefinition/provider adapters determine latest-value/delta behavior.

**Availability directive:**
`0`, `Unavailable`, `Not Yet Observed`, `Partial`, and `Stale` are different states and remain visible through APIs/UI.

**Zero directive:**
zero is only shown when the source actually reports or validly derives zero. Provider failure/missing data never becomes zero.

**Provenance directive:**
provider-reported, verified-provider, derived, estimated and manual metrics retain explicit provenance so downstream reports can distinguish evidence quality.

**Manual-metric directive:**
if manual observations exist, they require actor/evidence/time/provenance and never overwrite provider observations or impersonate provider data.

**Freshness directive:**
each reportable/current metric retains observation/freshness context. Old valid data may remain visible as stale rather than disappearing or becoming current.

**Quality directive:**
metric ingestion validates units, types, bounds and malformed provider responses; invalid inputs never coerce silently into zero.

**Aggregation directive:**
one `DistributionPerformanceAggregationService` produces Placement/Channel/Campaign/period aggregates from canonical observations and MetricDefinitions.

**Semantic-compatibility directive:**
only semantically compatible metrics may be aggregated across channels. Similar provider labels are insufficient.

**Unique-audience directive:**
the platform cannot claim cross-channel unique audience/reach by simple summation unless a real deduplication methodology exists.

**Derived-rate directive:**
ratios/rates use versioned canonical formulas with explicit numerator, denominator, period, precision and zero-denominator behavior.

**Partial-aggregate directive:**
when one or more required sources/channels are unavailable, aggregate completeness is `PARTIAL/UNKNOWN`; missing data is never silently counted as zero.

**Mismatch directive:**
metrics collected from a mismatched Placement must be qualified/excluded according to reporting policy and can never be silently attributed to the intended source Publication.

**Verification/performance directive:**
Placement verification and metric availability remain separate. A verified Placement can have unavailable metrics; an existing metric history can remain valid after the Placement later disappears.

**Snapshot directive:**
live Design-129 analytics remain separate from immutable/frozen `PerformanceSnapshot` datasets used for finalized reporting periods.

**Report directive:**
Design 130 must consume exact CampaignVersion, Placement, Verification and frozen metric-period evidence rather than current live dashboard values.

**Reporting directive:**
Designs 131–134 reuse the same Metric Registry, formulas, provenance and snapshot semantics; they cannot invent separate report-only metric calculations.

**Client directive:**
Design 073 consumes permission-safe approved Distribution performance projections. Internal anomalies, provider failures, retries, raw events and restricted metrics remain internal.

**Client-zero directive:**
client projections must also preserve zero vs unavailable and, where important, freshness/period semantics.

**Integration directive:**
Designs 139–140 remain provider connection/health authority. Design 129 may use health to explain stale/unavailable metrics but never owns tokens or connection lifecycle.

**Provider-outage directive:**
provider outage preserves last known values with stale/unavailable metadata where appropriate; it never resets performance to zero.

**Collection directive:**
metric collection and verification run through durable background workers/adapters rather than page-load-triggered scraping/polling.

**Rate-limit directive:**
provider collection uses batching, rate-limit coordination, backoff and caching so analytics does not destabilize external integrations.

**Idempotency directive:**
provider metric ingestion, verification observations, manual observations, corrections and snapshots are replay-safe.

**Correction directive:**
bad observations are invalidated/corrected with lineage rather than silently overwritten. Historical finalized report snapshots are not rewritten automatically.

**Permission directive:**
authorization is applied **before** aggregation/filter/facet calculation to prevent leaking restricted Placement data through totals.

**Tenant directive:**
Placement, metric observations, aggregates, snapshots and client/report projections remain strictly tenant-scoped.

**Export directive:**
performance export, where frozen UI allows it, has separate authorization and retains metric definition/provenance/period semantics.

**Anomaly directive:**
performance anomaly, if present, is a derived analytical condition and remains distinct from Placement failure, ProjectRisk, Blocker or Task.

**Activity directive:**
Design 119 may surface material verification failures/recoveries, but routine metric polling does not become Activity history.

**Audit directive:**
manual verification, overrides, manual metrics, metric corrections, frozen-snapshot creation and sensitive export can produce Audit evidence; routine automated observations remain business telemetry/data, not noisy human Audit events.

**Observability directive:**
provider polling failures, worker retries and API latency remain operational logs/metrics and never become Distribution performance observations themselves.

**Caching directive:**
performance caches vary by authorization, scope, date period, MetricDefinition version, Placement/Verification/Observation/Aggregate revisions and provider freshness state.

**Scale directive:**
MetricObservation storage should support time-series growth through appropriate indexing/partitioning/preaggregation/downsampling while preserving finalized-report reproducibility.

**Partial-failure directive:**
Placement verification, individual provider metric sources, aggregation and Integration health may fail independently. `Unavailable` can never become `0`, `Missing`, `Failed`, `Verified`, or a complete aggregate.

**Performance directive:**
initial Design 129 should load compact current verification/aggregate summaries, then lazy detailed verification histories and raw metric observations rather than recomputing full lifetime data synchronously.

**Future-reuse directive:**
Design **130 — Final Distribution Report / Client Performance Report** must freeze exact CampaignVersion, included Placements, verification state/evidence, metric-definition versions, reporting period, contributing metric observations/aggregates, freshness/provenance and generated artifact version. It must not simply render today's Design-129 live dashboard and call that a final report.

**Overlap directive:**
Designs **032, 038, 073, 127–140** must preserve one continuous **exact DistributionCampaignVersion → ChannelExecution → Placement → append-oriented PlacementVerification → provenance-aware MetricObservations → canonical MetricDefinition-driven aggregates → live Design-129 analytics → frozen PerformanceSnapshot/ReportVersion → client-safe reporting** lineage.

**Consolidation directive:**
**STANDARDIZE ONE DISTRIBUTION PERFORMANCE & VERIFICATION FOUNDATION — DESIGN-032/127/128 CANONICAL PLACEMENTS + APPEND-ORIENTED VERIFICATION HISTORY + DESIGN-038 CENTRAL METRIC REGISTRY + SOURCE/TIME/WINDOW/PROVENANCE-AWARE METRIC OBSERVATIONS + CUMULATIVE-VS-INCREMENTAL SEMANTICS + ZERO/UNAVAILABLE/STALE/ESTIMATED/MANUAL SEPARATION + PERMISSION-BEFORE-AGGREGATION + SEMANTICALLY SAFE CROSS-CHANNEL AGGREGATION + FRESHNESS-AWARE LIVE PERFORMANCE + IMMUTABLE REPORT-PERIOD SNAPSHOTS + DESIGN-130 REPORT REUSE — AND NEVER ALLOW GENERIC METRICS JSON, CURRENT DASHBOARD TOTALS, RAW PROVIDER LABELS, `VERIFIED=true`, ZERO-FILLING, STALE CACHES, MANUAL VALUES OR SIMPLE CROSS-CHANNEL SUMS TO SUBSTITUTE FOR OR REWRITE CANONICAL VERIFICATION, METRIC, PROVENANCE OR REPORTING TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **129 / 153** |
| **PASS**                                   |                        **129** |
| **STANDARDIZE decisions**                  |                        **127** |
| **Potential implementation-overlap flags** |                        **120** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**129 / 153 = 84.3% audited.**

### Canonical Distribution performance architecture after Design 129

```text
Placement P-10
      │
      ├── Aug 20 VERIFIED
      ├── Aug 22 VERIFIED
      └── Aug 25 NOT_FOUND
      │
      └── Metric observations
             ├── 10:00 impressions = 10,000
             ├── 18:00 impressions = 12,450
             └── clicks = UNAVAILABLE
                     │
                     ↓
              Metric Registry
                     │
                     ↓
              Live Aggregation
                     │
                     ↓
               Design 129
```

The strongest data-quality rule is now explicit:

```text
Impressions = 0
availability = AVAILABLE

        ≠

Impressions = unavailable

        ≠

Impressions = 12,450
freshness = STALE

        ≠

Impressions = 12,450
provenance = ESTIMATED
```

These are four different facts.

Cumulative metric handling is also protected:

```text
12:00
Total impressions = 10,000

18:00
Total impressions = 12,450

Correct current total:
12,450

Incorrect:
10,000 + 12,450
= 22,450
```

Verification and performance remain separate:

```text
Placement P-10:
VERIFIED

Metrics provider:
UNAVAILABLE

RESULT:

Placement is verified.
Performance is unavailable.

NOT:

0 performance
NOT:
Placement failed
```

And live analytics can never rewrite finalized reporting:

```text
Design 129 today:
13,800 impressions

Final August Report:
12,940 impressions
frozen at period close

Later provider updates
may change live analytics.

They do NOT silently rewrite
the finalized report.
```

## Next Sequential Audit Target

### **Design 130 — Final Distribution Report / Client Performance Report**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
