# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 128 — Distribution Channel / Placement Detail

Design 128 should become the **canonical Team Workspace single distribution-channel / placement investigation, exact campaign-source lineage, execution-attempt history, provider-evidence, placement-state, and verification-detail surface** built directly on the Distribution foundation established by **Design 032** and the Campaign-management foundation established by **Design 127**.

Design 128 must **not create a second Placement domain or a second channel-execution backend**. It should drill into the exact canonical `DistributionChannel`, `DistributionItem`, `ChannelExecution`, `Placement`, and `PlacementVerification` records that Design 127 already coordinates.

It must preserve strict boundaries with:

* canonical Publishing / `PublicationTarget`;
* Integration connection/account health;
* Distribution performance/verification workspace Design 129;
* Client-safe Distribution Design 073;
* final Distribution Report Design 130.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **DistributionCampaign ≠ DistributionCampaignVersion ≠ DistributionItem ≠ DistributionChannel ≠ ChannelExecution ≠ ProviderEvent ≠ Placement ≠ PlacementVerification ≠ PlacementPerformance ≠ PublicationTarget ≠ PublicationPlacement ≠ IntegrationConnection ≠ ClientDistributionProjection ≠ DistributionPlacementDetailView.**

The central implementation rule is:

> **A Placement Detail screen explains one exact downstream distribution result and everything that led to it. The Placement must permanently preserve which CampaignVersion, DistributionItem, exact source Publication/artifact version, concrete DistributionChannel, and ChannelExecution produced it. Provider acceptance, provider object creation, Placement existence, independent verification, current availability, and performance are different facts. Retrying, correcting, replacing, disabling a Channel, reconnecting an Integration, or discovering a newer source version must never rewrite the historical Placement that already existed.**

---

# 1. Classification

| Audit field                           | Classification                                                                                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                         | **128**                                                                                                                                                                                     |
| **Canonical name**                    | **Distribution Channel / Placement Detail**                                                                                                                                                 |
| **Product area**                      | Team Workspace / Distribution / Channel & Placement Operations                                                                                                                              |
| **User surface**                      | **Authenticated Team Workspace**                                                                                                                                                            |
| **Screen class**                      | Entity Detail Variant / Distribution Placement 360 / Channel Execution Investigation                                                                                                        |
| **Classification**                    | **Canonical Distribution Channel, Execution Evidence, Placement Lineage & Placement-State Detail Anchor**                                                                                   |
| **Primary purpose**                   | Inspect one channel/placement context, exact distributed content lineage, execution attempts, provider evidence, verification state, current availability, and safe next operational action |
| **Canonical Distribution foundation** | **Design 032**                                                                                                                                                                              |
| **Campaign-management foundation**    | **Design 127**                                                                                                                                                                              |
| **Campaign identity**                 | `DistributionCampaign`                                                                                                                                                                      |
| **Exact campaign plan**               | `DistributionCampaignVersion`                                                                                                                                                               |
| **Campaign work unit**                | `DistributionItem`                                                                                                                                                                          |
| **Destination identity**              | `DistributionChannel`                                                                                                                                                                       |
| **Execution identity**                | `ChannelExecution`                                                                                                                                                                          |
| **External evidence**                 | `ProviderEvent`                                                                                                                                                                             |
| **Result identity**                   | `Placement`                                                                                                                                                                                 |
| **Verification identity**             | `PlacementVerification`                                                                                                                                                                     |
| **Source Publication identity**       | exact `PublicationVersion` / verified Publication placement                                                                                                                                 |
| **Performance dependency**            | Design 129                                                                                                                                                                                  |
| **Final report dependency**           | Design 130                                                                                                                                                                                  |
| **Client-safe projection**            | Design 073                                                                                                                                                                                  |
| **Integration dependency**            | Designs 139–140                                                                                                                                                                             |
| **Publishing boundary**               | Designs 031 / 124–126                                                                                                                                                                       |
| **Activity dependency**               | Design 119                                                                                                                                                                                  |
| **Audit dependency**                  | Design 039                                                                                                                                                                                  |
| **Primary query service**             | `DistributionPlacementDetailQueryService`                                                                                                                                                   |
| **Execution query service**           | `DistributionExecutionHistoryQueryService`                                                                                                                                                  |
| **Placement service**                 | canonical `DistributionPlacementService`                                                                                                                                                    |
| **Reconciliation service**            | `DistributionExecutionReconciliationService`                                                                                                                                                |
| **Verification service**              | canonical `DistributionPlacementVerificationService`                                                                                                                                        |
| **Channel state resolver**            | `DistributionChannelOperationalStateResolver`                                                                                                                                               |
| **Current placement resolver**        | `DistributionCurrentPlacementResolver`                                                                                                                                                      |
| **Parent shell**                      | `InternalAppShell` — Design 001                                                                                                                                                             |
| **Auth**                              | Required                                                                                                                                                                                    |
| **Authorization**                     | Active OrganizationMembership + campaign/channel/placement/execution permissions                                                                                                            |
| **Implementation priority**           | **Critical External-Side-Effect Traceability / Placement Integrity / Recovery Safety**                                                                                                      |
| **Reuse level**                       | **Extremely High across Distribution Campaigns, Performance, Client reporting, Integrations and Audit**                                                                                     |

Design 128 should answer:

> **“What exact content was distributed here, through which concrete channel/account, under which CampaignVersion, what execution attempts happened, what did the provider report, what downstream Placement actually exists, has that exact Placement been independently verified, is it still currently available, and what corrective/retry/reconciliation action is safe?”**

Canonical composition:

```text
DistributionCampaign DC-100
        │
        ↓
CampaignVersion v2
        │
        ↓
DistributionItem DI-20
        │
        ├── Source Publication v3
        ├── exact channel payload
        └── DistributionChannel CH-10
                       │
                       ↓
                 ChannelExecution
                  ┌────┼─────┐
                  ↓    ↓     ↓
                 E1   E2    E3
                  │
            ProviderEvents
                  │
                  ↓
              Placement P-10
                  │
                  ↓
         PlacementVerification
                  │
            VERIFIED / ...
                  │
                  ↓
       Performance summaries
              Design 129
```

---

# 2. Reuse

## Design 032 remains canonical Distribution authority

Design 128 must not introduce:

```text
DistributionPlacementDetail
ChannelPlacementRecord
DistributedContentRecord
DistributionExecutionDetailEntity
```

as alternative business entities.

Correct:

```text
Placement P-10

same P-10 in:
Design 127 campaign management
Design 128 placement detail
Design 129 performance/verification
Design 073 client projection
Design 130 final report
```

---

## Design 127 and Design 128 share one backend

### Design 127

Answers:

> How is the whole Campaign performing operationally?

### Design 128

Answers:

> What exactly happened on this Channel / Placement?

Correct flow:

```text
Campaign DC-100
       ↓
DistributionItem DI-20
       ↓
Placement P-10
       ↓
Design 128
```

No data copy.

---

## DistributionPlacementDetailView ≠ Placement

Permanent.

The detail view may compose:

* Campaign;
* CampaignVersion;
* DistributionItem;
* Channel;
* Executions;
* ProviderEvents;
* Placement;
* Verification;
* metric summaries.

It remains a rebuildable read projection.

---

## DistributionChannel ≠ Placement

Critical.

### Channel

> Where can distribution occur?

### Placement

> What specific downstream object/result actually exists there?

Example:

```text
Channel:
The Perspective LinkedIn Company Page

Placement:
LinkedIn Post urn:li:share:12345
```

---

## DistributionChannel ≠ channel type

Permanent.

```text
LINKEDIN
```

is taxonomy.

```text
The Perspective LinkedIn Company Page
```

is a configured canonical DistributionChannel.

---

## DistributionChannel ≠ IntegrationConnection

Absolute.

The channel may reference:

```text
IntegrationConnection IC-20
```

but:

* reconnecting;
* refreshing OAuth;
* rotating credentials;

does not create a new Channel or rewrite historical Placements.

---

## DistributionChannel ≠ PublicationTarget

Permanent.

Publishing may target:

> The Perspective Website.

Distribution may target:

> LinkedIn Company Page.

Even if both use the same provider technology, their business semantics remain separate.

---

## DistributionItem ≠ Placement

Critical.

A planned campaign item may never successfully produce a Placement.

```text
DistributionItem
      ↓
Execution
      ↓
maybe Placement
```

---

## ChannelExecution ≠ Placement

Permanent.

One or more failed/uncertain attempts may precede a successful Placement.

---

## Placement ≠ ProviderEvent

Permanent.

Provider events are evidence.

Placement is the canonical normalized downstream result.

---

## Placement ≠ URL

Critical.

A URL:

* can redirect;
* expire;
* change;
* disappear;
* be wrong.

Canonical Placement identity should preserve stronger lineage.

---

## Placement ≠ PlacementVerification

Permanent.

A provider object may exist while independent verification is:

* pending;
* mismatch;
* unavailable.

---

## PlacementVerification ≠ Performance

Critical.

Verification answers:

> Does the intended Placement exist correctly?

Performance answers:

> What happened after it existed?

These belong to related but different data.

---

## Design 129 remains comprehensive verification/performance authority

Design 128 may display current:

* verification result;
* last verified time;
* compact metrics.

Design 129 should own deeper:

* verification operations across placements;
* metric observations;
* freshness;
* performance comparisons;
* anomalies.

Do not implement an independent Design-128 analytics engine.

---

## Design 073 remains Client-safe projection

The Client may see:

* verified Placement;
* safe channel name;
* public URL;
* approved metrics.

The Client must not see:

* raw provider payloads;
* execution retries;
* connection errors;
* access tokens;
* internal remediation notes.

---

## Exact CampaignVersion remains pinned

Historical Placement P-10 created under CampaignVersion v2 remains v2 even if:

```text
CampaignVersion v3
```

later becomes active.

---

## Exact source Publication remains pinned

If Placement P-10 distributed Publication v3:

later Publication v4 does not rewrite P-10.

Correct:

```text
Placement P-10
source = Publication v3

New campaign / corrective item
may later distribute v4.
```

---

## Source Publication correction ≠ Placement correction

Permanent.

Changing canonical Publication source content and fixing a downstream promotional Placement are distinct operations.

---

# 3. Entities

## DistributionChannel

Stable concrete destination identity.

Conceptually:

```text
DistributionChannel
├── id
├── organizationId
├── channelType
├── providerConnectionId?
├── external property/account reference
├── display identity
├── capabilities
├── lifecycle
├── createdAt
└── revision
```

---

## Channel lifecycle ≠ connection health

Critical.

A Channel can be:

```text
ENABLED
```

while provider connection health is:

```text
DEGRADED
```

or:

```text
UNKNOWN
```

These are separate.

---

## Channel enabled ≠ Placement live

Permanent.

---

## Channel disabled ≠ Placement removed

Absolute.

Disabling future execution does not automatically delete downstream content.

---

## Integration reconnected ≠ new Channel

Permanent.

Historical Placement identity remains.

---

## DistributionItem

Canonical campaign plan unit from Design 127.

Conceptually:

```text
DistributionItem
├── id
├── campaignVersionId
├── exactSourceReference
├── distributionChannelId
├── payloadVersion
├── requirementClass
├── lifecycle
└── revision
```

---

## Exact channel payload

The Item should preserve the exact promotional material intended for this Channel.

Example:

```text
Source:
Article Publication v3

Channel payload:
LinkedIn copy version 2
Image Asset/FileVersion 6
URL to verified article Placement
```

Historical execution must not rebuild that payload from current editable campaign fields.

---

## ChannelExecution

Append-oriented external execution identity.

Conceptually:

```text
ChannelExecution
├── id
├── campaignId
├── campaignVersionId
├── distributionItemId
├── distributionChannelId
├── payload fingerprint/version
├── attemptNumber
├── executionPurpose
├── parentExecutionId?
├── executionKey
├── initiatedBy
├── initiatedAt
├── providerRequestId?
├── outcomeClass
├── completedAt?
└── revision
```

---

## Execution purpose ≠ outcome

Potential purposes:

```text
INITIAL
RETRY
CORRECTIVE
REPOST
```

while outcomes independently include:

```text
ACCEPTED
FAILED
UNKNOWN
```

Do not combine them.

---

## Initial Execution ≠ Retry

Permanent.

---

## Retry ≠ Correction

Critical.

Retry:

> Repeat the exact same intended payload after known safe failure.

Correction:

> Send materially different content/payload or replace an existing Placement.

---

## ProviderEvent

Immutable provider evidence.

Conceptually:

```text
ProviderEvent
├── id
├── provider
├── externalEventId
├── channelExecutionId?
├── providerObjectId?
├── eventType
├── occurredAt
├── receivedAt
├── authenticity evidence
├── normalized data
└── raw evidence reference
```

---

## ProviderEvent received ≠ trusted

Critical.

Authenticate/verify callback origin where supported before mutating state.

---

## ProviderEvent duplicate ≠ second action

Absolute.

---

## ProviderEvent arrival order ≠ state order

Permanent.

Out-of-order callbacks require canonical state-reduction rules.

---

## Placement

Canonical downstream result.

Conceptually:

```text
Placement
├── id
├── organizationId
├── campaignId
├── campaignVersionId
├── distributionItemId
├── distributionChannelId
├── sourceContentReference
├── sourceExecutionId
├── providerObjectId?
├── placementUrl/reference?
├── createdAt
├── currentLifecycle
└── revision
```

---

## Placement should retain source provenance

Required lineage:

```text
Placement
→ ChannelExecution
→ DistributionItem
→ CampaignVersion
→ exact PublicationVersion/artifact
```

This must always be reconstructable.

---

## Provider object ID ≠ Placement ID

Permanent.

Provider IDs may:

* collide across providers;
* change formats;
* be absent.

Canonical Placement uses internal stable identity.

---

## Placement URL ≠ Placement ID

Permanent.

---

## Placement creation timestamp ≠ verification timestamp

Permanent.

---

## Placement lifecycle

Conceptually:

```text
CREATED
LIVE
MISSING
REPLACED
TAKEN_DOWN
EXPIRED
UNKNOWN
```

Exact enum belongs to Phase 3D.

Do not force all channel types into identical states if provider semantics differ.

---

## Current state ≠ historical existence

Critical.

A Placement currently missing may still have:

> existed and was verified previously.

History remains.

---

## PlacementVerification

Conceptually:

```text
PlacementVerification
├── id
├── placementId
├── expectedSourceReference
├── expectedPayloadFingerprint?
├── method
├── result
├── verifiedAt
├── evidence
├── freshness
├── verifier actor/system
└── revision
```

---

## Verification method

Keep methods explicit:

```text
PROVIDER_REPORTED
AUTOMATED_EXTERNAL_CHECK
MANUAL
COMBINED
```

as appropriate.

Provider reported ≠ independently checked.

---

## Verification result

Conceptually:

```text
VERIFIED
MISMATCH
NOT_FOUND
UNKNOWN
UNAVAILABLE
```

Exact taxonomy Phase 3D.

---

## Mismatch ≠ Missing

Critical.

Example:

> Placement exists, but points to Publication v2 instead of expected v3.

That's `MISMATCH`, not `NOT_FOUND`.

---

## Unknown ≠ Missing

Absolute.

---

## Verification unavailable ≠ failed verification

Permanent.

---

## Verification freshness

Preserve:

```text
verifiedAt
lastCheckedAt?
```

because downstream content can disappear/change later.

---

## CurrentPlacementResolver

For channels where several campaign Placements or corrected versions exist:

```text
DistributionCurrentPlacementResolver
```

should determine the currently applicable Placement according to explicit domain semantics.

Do not use:

```text
MAX(createdAt)
```

universally.

---

## Placement replacement

Example:

```text
P-10
original LinkedIn post

P-11
corrective repost
supersedes/replaces P-10
```

P-10 remains historical.

---

## Replaced ≠ deleted

Absolute.

---

## Corrective Placement lineage

If supported:

```text
P-11
supersedesPlacementId = P-10
```

or equivalent lineage can make corrections explicit.

---

## Manual Placement

If some channels require off-platform/manual work:

model explicitly:

```text
placementOrigin = MANUAL
```

with:

* actor;
* exact content reference;
* channel;
* URL/object evidence;
* timestamp;
* verification.

Do not fabricate a ChannelExecution/provider event.

---

## Manual Placement ≠ manually verified Placement

Permanent.

Origin and verification method are different concepts.

---

## Performance summary

Design 128 may consume:

```text
PlacementPerformanceSummary
```

from Design 129.

Conceptually:

```text
impressions
clicks
engagement
referrals
calculatedAt
freshness
metric availability
```

This is a projection.

---

## Zero ≠ Unavailable

Absolute.

---

## Metric observedAt ≠ Placement createdAt

Permanent.

---

# 4. Permissions

Design 128 should conceptually distinguish:

```text
distributionPlacement.read
distributionPlacement.openExternal

distributionExecution.read
distributionExecution.retry
distributionExecution.reconcile
distributionExecution.correct

distributionChannel.read
distributionChannel.execute
distributionChannel.manage

distributionVerification.read
distributionVerification.manualVerify
distributionVerification.override

distributionProviderEvidence.read
```

Exact permission keys belong to Phase 3D.

---

## Placement read ≠ external execution

Absolute.

---

## Placement read ≠ raw provider evidence read

Permanent.

Provider payloads may contain sensitive operational details.

---

## Channel read ≠ Channel manage

Permanent.

---

## Channel manage ≠ Integration credential admin

Absolute.

---

## Execute ≠ Retry universally

Potential separate permissions.

---

## Retry ≠ Correction/repost

Permanent.

---

## Reconcile ≠ Execute

Critical.

A user authorized to investigate an uncertain outcome need not be authorized to create another external side effect.

---

## Verification read ≠ Manual verification

Permanent.

---

## Manual verification ≠ Override

Potential stronger separation.

---

## Override ≠ provider evidence editing

Absolute.

---

## Distribution permissions ≠ Publishing permissions

Permanent.

The user cannot modify source Publication because they can investigate its distribution Placement.

---

## Distribution permissions ≠ Outreach permissions

Permanent.

---

## Placement URL visibility can be permission-safe

If a Placement itself is sensitive/private, do not reveal external URLs solely because summary access exists.

---

## External link open ≠ mutable provider authorization

Opening a public Placement requires only applicable safe viewing permission; editing/removing it remains separate.

---

## Direct IDs reauthorize

Every:

* Campaign;
* Item;
* Channel;
* Execution;
* Placement;
* Verification;

must be server-authorized when directly referenced.

---

## Client cannot access internal Design 128

Client-safe projection remains Design 073.

---

## Cross-tenant access prohibited

Absolute.

---

# 5. States

Design 128 must keep **Channel lifecycle, Integration health, Item state, Execution outcome, Provider evidence state, Placement lifecycle, Verification state, and Performance availability** separate.

### Channel lifecycle

Conceptually:

```text
Enabled
Disabled
Archived
Restricted
```

### Integration health

```text
Healthy
Degraded
Unavailable
Unknown
```

### Execution

```text
Pending
Running
Provider Accepted
Retryable Failure
Permanent Failure
Outcome Unknown
Completed
```

### Placement

```text
Not Created
Created
Live
Missing
Mismatch
Replaced
Taken Down
Unknown
```

### Verification

```text
Not Started
Pending
Verified
Mismatch
Not Found
Unknown
Unavailable
Stale
```

### Performance

```text
Available
Partial
Unavailable
Stale
```

These must never collapse into one `placement.status`.

---

## Channel Enabled ≠ Integration Healthy

Permanent.

---

## Integration Healthy ≠ Placement Live

Permanent.

---

## Integration Unavailable ≠ existing Placement Missing

Critical.

The platform may lose API connectivity while the external post/page remains live.

---

## Channel Disabled ≠ Placement Taken Down

Absolute.

---

## Execution Provider Accepted ≠ Placement Created

Absolute.

---

## Placement Created ≠ Placement Verified

Absolute.

---

## Placement Verified ≠ Placement currently live forever

Critical.

Verification has time/freshness.

---

## Placement Missing now ≠ Placement never existed

Permanent.

---

## Mismatch ≠ Missing

Permanent.

---

## Placement Replaced ≠ deleted

Absolute.

---

## Retry pending ≠ previous failure erased

Permanent.

---

## Outcome Unknown ≠ failure

Absolute.

---

## Manual verification ≠ automated verification

Permanent.

---

## Performance unavailable ≠ zero

Absolute.

---

## Performance stale ≠ zero

Absolute.

---

## New PublicationVersion available ≠ Placement stale automatically

Historical Placement remains correct provenance.

Current campaign may require attention separately.

---

## New CampaignVersion available ≠ Placement reassigned

Absolute.

---

## State Coverage

Design 128 inherits Design 150 plus:

```text
Distribution Placement Detail Loading
Distribution Placement Detail Available
Distribution Placement Detail Restricted
Distribution Placement Detail Partial
Distribution Placement Detail Unavailable

Channel Enabled
Channel Disabled
Channel Restricted
Channel State Unknown

Integration Healthy
Integration Degraded
Integration Unavailable
Integration Health Unknown

Distribution Item Ready
Distribution Item Historical
Distribution Item Restricted
Distribution Item State Unknown

Execution Pending
Execution Running
Execution Provider Accepted
Execution Retryable Failure
Execution Permanent Failure
Execution Outcome Unknown
Execution Completed

Provider Event Verified
Provider Event Duplicate
Provider Event Out of Order
Provider Event Unmatched
Provider Event Restricted

Placement Not Created
Placement Created
Placement Live
Placement Missing
Placement Replaced
Placement Taken Down
Placement State Unknown

Verification Not Started
Verification Pending
Verification Verified
Verification Mismatch
Verification Not Found
Verification Unknown
Verification Unavailable
Verification Stale

Manual Placement
Provider Placement

Manual Verification
Provider Reported Verification
Automated Verification

Performance Available
Performance Partial
Performance Unavailable
Performance Stale

New Source Publication Version Available
New Campaign Version Available
Historical Source Version Retained

Placement Updated Elsewhere
Execution Updated Elsewhere
Provider Event Arrived
Channel Updated Elsewhere
Integration Health Updated Elsewhere
Verification Updated Elsewhere
Placement Detail Conflict
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize **provenance → execution → provider evidence → Placement → verification → performance**.

Conceptually:

```text
Placement / Channel Detail
↓
Campaign + exact CampaignVersion
↓
Exact source Publication/artifact
↓
Channel
↓
Current Placement state
↓
Verification
↓
Execution history
↓
Provider evidence
↓
Performance summary
```

Only frozen Design 128 elements should render.

---

## Exact provenance should remain visible

A user should always be able to answer:

> Which CampaignVersion and source PublicationVersion created this Placement?

Example:

> Campaign v2
> Source Publication v3
> LinkedIn payload v2

---

## Channel and Integration health should look separate

Correct:

> Channel: Enabled
> Connection: Degraded

not:

> Channel failed.

---

## Execution and Placement state should look separate

Correct:

> Execution: Provider Accepted
> Placement: Verification Pending

---

## Current vs historical Placement should be obvious

If a correction created a replacement:

> P-11 — Current
> P-10 — Historical / Replaced

Do not hide P-10.

---

## Unknown outcomes require strong caution

If:

> Execution outcome unknown

the Detail should not offer an ordinary blind retry without reconciliation.

---

## Verification provenance should remain visible

Example:

> Verified automatically · Aug 22 10:30

versus:

> Manually verified by authorized user · Aug 22 10:35

They are not equivalent evidence.

---

## External Placement URL should never substitute state

A link can be shown where safe.

But:

> URL available

must not visually imply:

> verified.

---

## Performance summary should show availability/freshness

Correct:

> 12,480 impressions · last updated 2h ago

or:

> Performance unavailable

not silently:

> 0 impressions.

---

## Tablet

Following Design 152:

* Placement summary remains first;
* exact Campaign/source versions remain visible;
* Execution history becomes expandable;
* Provider events move into secondary detail;
* Verification stays prominent;
* performance remains compact.

---

## Mobile

Priority:

```text
Placement status
↓
Channel
↓
Exact source
↓
Campaign version
↓
Verification
↓
Latest execution
↓
Unknown / Failed state
↓
External placement link
↓
Performance summary
↓
Execution history
```

Avoid a wide provider-event debugging table.

---

## Mobile corrective action

Where retry/correction exists:

> Reconcile Partner Placement

or:

> Retry exact Distribution Item v2

is safer than:

> Retry.

---

## Accessibility

A Placement could communicate:

> Placement P-10 on The Perspective LinkedIn Company Page. It was created from Distribution Campaign DC-100 plan version 2 using Publication version 3 and LinkedIn payload version 2. Channel Execution E-12 was accepted by the provider. The Placement was independently verified on August 22. The provider connection is currently degraded, but the last verification still records the Placement as live.

where authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical detail architecture

```text
Design 128
    ↓
Authenticated Workspace Context
    ↓
DistributionPlacementDetailQueryService
    │
    ├── CampaignAdapter
    ├── CampaignVersionAdapter
    ├── DistributionItemAdapter
    ├── SourcePublicationAdapter
    ├── ChannelAdapter
    ├── IntegrationHealthAdapter
    ├── ExecutionAdapter
    ├── ProviderEventAdapter
    ├── PlacementAdapter
    ├── VerificationAdapter
    └── PerformanceSummaryAdapter
    ↓
DistributionPlacementDetailView
```

All mutations go through canonical source services.

---

## Detail query

Conceptually:

```text
getDistributionPlacementDetail(
    placementId,
    currentMembership
)
```

or appropriate channel/item context should:

1. authorize tenant/context;
2. load canonical Placement;
3. load exact Campaign/CampaignVersion;
4. resolve DistributionItem;
5. resolve exact source Publication/artifact;
6. load DistributionChannel;
7. load current safe Integration health;
8. load compact Execution history;
9. load current Verification;
10. load compact Performance summary;
11. permission-filter provider evidence;
12. return source revisions/freshness.

---

## Placement Detail can also exist before Placement creation

Because the frozen title includes **Channel / Placement Detail**, the screen may need to represent:

```text
DistributionItem
+ Channel
+ Execution history
+ no Placement yet
```

without inventing a fake Placement.

Correct:

> No Placement created yet.

Not:

```text
Placement.id = null object
```

treated as successful placement.

---

## Execution history must be append-oriented

Never overwrite:

```text
E1 failure
```

when:

```text
E2 success
```

occurs.

Both remain.

---

## Latest Execution ≠ current Placement state

Critical.

Example:

```text
P-10 is live.

Later:
corrective Execution E-20 fails.
```

Latest Execution = failed.

Current Placement may still be P-10 live.

Do not derive Placement state from `latestExecution.status`.

---

## Execution query optimization

Initial view can load:

* most recent Execution;
* current outcome;
* count/history summary.

Deep provider history loads lazily.

---

## Provider-event raw data

Normal UI should receive normalized safe evidence.

Raw payload access, if supported, should require stronger debugging permission.

---

## Provider callback verification

Callbacks must be:

* authenticated/signature checked where available;
* deduplicated;
* normalized;
* associated using strong provider IDs.

---

## Weak matching prohibited

Do not match inbound provider events to Placements by:

* title;
* URL text only;
* channel name;
* timestamp proximity.

Prefer provider request/object IDs and execution lineage.

---

## Unmatched events

Retain for investigation.

Do not silently discard them or attach to a random Placement.

---

## Outcome reconciliation

For:

```text
ChannelExecution.outcome = UNKNOWN
```

conceptual command:

```text
reconcileDistributionExecution(executionId)
```

should:

1. authorize read/reconciliation;
2. query provider object/status where possible;
3. inspect verified callback evidence;
4. inspect destination Placement where safe;
5. create/resolve canonical Placement if evidence supports it;
6. update derived Execution outcome;
7. never cause a new distribution action.

---

## Reconciliation can discover an existing Placement

Example:

```text
Request response lost.

Provider lookup finds:
object 12345 created successfully.

Result:
Execution → known success
Placement P-10 created/resolved
```

No retry required.

---

## Retry preflight

Before:

```text
retryDistributionExecution(...)
```

server must verify:

```text
previous outcome = safely retryable known failure
```

not:

```text
UNKNOWN
```

---

## Retry uses exact historical intent

Pin:

* CampaignVersion;
* DistributionItem;
* Channel;
* payload fingerprint;
* source PublicationVersion.

---

## Retry never resolves latest content

Absolute.

---

## Correction / repost

If different copy/source is required:

use explicit revised CampaignVersion/DistributionItem or corrective operation.

This preserves historical meaning.

---

## Provider execution idempotency

Same requirement as Design 127.

Use:

* stable execution keys;
* provider idempotency keys where available;
* internal uniqueness/locks.

---

## Placement creation

When provider evidence is strong enough:

```text
DistributionPlacementService.establishPlacement(...)
```

should preserve exact lineage.

---

## Placement creation idempotency

Repeated callback/poll/reconciliation must resolve the same logical Placement, not create duplicates.

Potential uniqueness basis:

```text
provider
+ distributionChannel
+ providerObjectId
```

plus tenant/context where appropriate.

---

## Placement collision handling

If provider object ID is unexpectedly associated with a different Campaign/Item:

do not overwrite.

Raise an investigation/conflict state.

---

## Placement verification

Conceptually:

```text
verifyDistributionPlacement(
    placementId
)
```

should:

1. authorize;
2. resolve expected exact source/payload;
3. choose channel-specific verifier;
4. fetch/query safely;
5. compare expected identity/content;
6. record append-oriented Verification;
7. preserve timestamp/method/evidence.

---

## Verification does not mutate provider content

Observation only.

---

## Automated verification must be channel-aware

Verification may differ between:

* social post;
* newsletter archive;
* PR page;
* partner listing.

Use adapters, not one generic HTML string search.

---

## Safe outbound verification

Where URLs are fetched:

* allow expected schemes;
* enforce provider/domain policy;
* block private/reserved IP ranges;
* limit redirects;
* restrict ports;
* protect DNS rebinding;
* enforce time/size limits.

---

## Mismatch handling

If Placement exists but source/version differs:

record:

```text
MISMATCH
```

with safe evidence.

Do not auto-delete or auto-correct.

---

## Missing placement

If previously verified Placement later disappears:

create a new Verification result showing missing/current status.

Do not delete the historical Verified record.

---

## Verification history

Correct:

```text
Aug 20 VERIFIED
Aug 22 VERIFIED
Aug 25 NOT_FOUND
```

This proves:

> it existed previously but is missing now.

---

## Current Placement state resolver

Derive current state using latest authoritative verification/known provider evidence.

Do not erase historical verification.

---

## Manual verification

If frozen design permits:

```text
recordManualPlacementVerification(
    placementId,
    result,
    evidence,
    reason,
    idempotencyKey
)
```

must record:

* actor;
* method;
* time;
* exact Placement/source;
* evidence.

---

## Manual override

If an operator can accept an unverifiable Placement:

store override separately.

Example:

```text
Verification = UNKNOWN
Operational override = ACCEPTED
```

Do not rewrite:

```text
Verification = VERIFIED
```

unless actual verification evidence exists.

---

## Channel disable

Conceptual command belongs to channel-management/integration domain.

Effects:

* prevent future new executions as policy dictates;
* leave historical Executions/Placements untouched;
* trigger Campaign state recalculation.

---

## Channel disable does not call provider takedown automatically

Absolute.

---

## Integration health

Read from Designs 139/140.

Possible data:

```text
connected
degraded
rate limited
auth expired
unknown
```

Channel Detail can show it.

It cannot rotate tokens itself unless user enters Integration surface.

---

## Connection failure and placement monitoring

Even if provider API is unavailable:

external URL verification might still show Placement live.

Keep both facts:

```text
API connection = unavailable
Placement verification = live
```

where evidence supports it.

---

## Current source update

If Publication v4 replaces v3:

P-10 remains:

```text
source = v3
```

The Detail may warn:

> A newer canonical Publication version is available.

Do not label P-10 incorrect unless campaign policy expects current v4.

---

## Source takedown

If canonical source Publication is taken down:

Distribution can mark the Placement as:

* source unavailable;
* needs attention;

according to policy.

It must not rewrite P-10's historical source identity.

---

## Placement correction lineage

If a corrective DistributionItem produces P-11:

preserve:

```text
P-11 supersedes P-10
```

where applicable.

---

## Performance summary

Design 128 should call a central service:

```text
DistributionPerformanceSummaryService.getPlacementSummary(P-10)
```

ultimately backed by Design 129/038 metric definitions.

---

## Performance metrics remain typed observations

Never store only:

```text
placement.metrics = {
  impressions: 1000
}
```

as timeless truth.

---

## Performance freshness

Return:

```text
value
observedAt
source
metricDefinition
freshness
availability
```

where needed.

---

## Zero handling

Correct:

```text
impressions = 0
availability = AVAILABLE
```

versus:

```text
impressions = null
availability = UNAVAILABLE
```

---

## Design 129 integration

Design 129 must be able to reuse:

* Placement IDs;
* Verification history;
* MetricObservations;
* ChannelExecution history;
* source provenance.

It cannot create another `PerformancePlacement`.

---

## Design 130 integration

Final Distribution Report must retain exact:

* CampaignVersion;
* Placements;
* verification snapshots;
* metric snapshot periods.

Design 128 only supplies canonical evidence.

---

## Client Design 073 integration

Client projection can expose:

```text
safe channel
verified Placement
verified public URL
approved performance summary
```

subject to release/reporting policy.

---

## Client cannot see outcome-unknown operational internals by default

Client-facing wording must be sanitized according to Design 073 policies.

---

## Activity

Design 119 may project:

```text
DistributionExecutionRetried
DistributionPlacementCreated
DistributionPlacementVerified
DistributionPlacementMissing
DistributionPlacementReplaced
```

Activity remains observational.

---

## Audit

Material actions should capture:

* retry;
* reconciliation where governance-relevant;
* manual Placement;
* manual verification;
* verification override;
* correction/repost;
* Channel disable/operational override where appropriate.

---

## Notifications

Design 080 may alert:

* Placement mismatch;
* Placement missing;
* execution outcome unknown;
* provider connection problem.

Notifications never change Placement state.

---

## Search

Design 079 may index safe:

* Campaign;
* channel;
* Placement reference;
* verified state.

Do not index raw provider payloads, tokens, or restricted URLs.

---

## Optimistic concurrency

Critical races:

### Retry while provider callback confirms success

Retry preflight must re-check Execution outcome transactionally.

### Placement verification while correction replaces Placement

Verification pins exact Placement ID.

### Channel disabled while execution begins

Execution eligibility rechecks current Channel state.

### Manual verification while automated verification completes

Both remain separate records; current state resolver applies evidence policy.

---

## Idempotency

Required for:

* reconciliation handling;
* retry;
* Placement creation;
* provider callback processing;
* manual Placement;
* verification;
* corrective lineage.

---

## Caching

Placement Detail cache should vary by:

```text
organizationMembershipId
placementId / distributionItemId
authorizationRevision
campaignRevision
campaignVersionRevision
distributionItemRevision
channelRevision
integrationHealthRevision
executionRevision
providerEventRevision
placementRevision
verificationRevision
performanceSummaryRevision
```

---

## Immutable history caching

Historical:

* CampaignVersion;
* completed Execution;
* ProviderEvent;
* prior Verification;

may be strongly cached.

Current:

* authorization;
* channel health;
* Placement availability;
* metric summary;

requires freshness.

---

## Performance

Use:

* indexed Placement lookup;
* current Verification summary;
* latest Execution summary;
* lazy full Execution history;
* paginated ProviderEvents;
* compact metric summary;
* batched source/campaign resolution.

Avoid loading entire Campaign/provider history on one Placement page.

---

## Partial failure contract

Example:

```text
Placement core       ✓
Campaign lineage     ✓
Execution history    ✓
Provider health      ✕
Verification         ✓
Performance          ✓
```

Correct:

> Placement and verification history are available; current provider connection health is unavailable.

Incorrect:

> Channel disconnected.

Another:

```text
Placement previously VERIFIED
Current verification service ✕
```

Correct:

> Last verified Aug 22. Current verification is unavailable.

Not:

> Placement missing.

Another:

```text
Placement verified ✓
Metrics provider    ✕
```

Correct:

> Placement is verified. Performance data is unavailable.

Not:

> 0 engagement.

Another:

```text
Execution outcome UNKNOWN
Provider API unavailable
```

Correct:

> External execution remains unresolved. Retry is unsafe until reconciliation succeeds.

Not:

> Failed — retry now.

---

## Backend Requirement Matrix

| Requirement                                             | Status                                     |
| ------------------------------------------------------- | ------------------------------------------ |
| Design 032 canonical Distribution reuse                 | **Critical**                               |
| Design 127 same Campaign/Execution backend              | **Critical**                               |
| No PlacementDetail business entity                      | **Critical**                               |
| DistributionChannel/Placement separation                | **Critical**                               |
| Channel/channel-type separation                         | **Critical**                               |
| Channel/IntegrationConnection separation                | **Critical**                               |
| Channel/PublicationTarget separation                    | **Critical**                               |
| Channel lifecycle/connection-health separation          | **Critical**                               |
| Channel disable/Placement takedown separation           | **Critical**                               |
| DistributionItem/Placement separation                   | **Critical**                               |
| DistributionItem/ChannelExecution separation            | **Critical**                               |
| ChannelExecution/Placement separation                   | **Critical**                               |
| Execution/provider-event separation                     | **Critical**                               |
| Execution purpose/outcome separation                    | **Critical**                               |
| Retry/correction separation                             | **Critical**                               |
| Provider event authentication                           | **Critical where supported**               |
| Provider event idempotency                              | **Critical**                               |
| Out-of-order callback handling                          | **Critical**                               |
| Strong provider-object association                      | **Critical**                               |
| Unmatched events retained safely                        | **Critical**                               |
| Placement/provider-object separation                    | **Critical**                               |
| Placement/URL separation                                | **Critical**                               |
| Exact CampaignVersion lineage                           | **Critical**                               |
| Exact source Publication/artifact lineage               | **Critical**                               |
| Latest source does not rewrite Placement                | **Critical**                               |
| Placement/Verification separation                       | **Critical**                               |
| Verification method/provenance                          | **Critical**                               |
| Verification current/history separation                 | **Critical**                               |
| Verified/Mismatch/Missing/Unknown separation            | **Critical**                               |
| Verification freshness                                  | **Critical**                               |
| SSRF-safe verification                                  | **Critical where URL verification occurs** |
| Unknown outcome reconciliation before retry             | **Critical**                               |
| Reconciliation/Retry separation                         | **Critical**                               |
| Retry same exact historical intent                      | **Critical**                               |
| Placement creation idempotency                          | **Critical**                               |
| Historical verified Placement retained if later missing | **Critical**                               |
| Manual/provider Placement distinction                   | **Critical if manual exists**              |
| Manual/automated verification distinction               | **Critical if manual exists**              |
| Override/verification separation                        | **Critical if override exists**            |
| Replacement/supersession preserves old Placement        | **Critical where correction exists**       |
| Design 129 shared Verification/Metric backend           | **Critical architecture**                  |
| Design 130 exact Placement evidence reuse               | **Critical architecture**                  |
| Design 073 client-safe projection reuse                 | **Critical**                               |
| Designs 139–140 integration-state reuse                 | **Critical architecture**                  |
| Performance zero/unavailable separation                 | **Critical**                               |
| Metric provenance/freshness                             | **Critical**                               |
| Target-specific permissions                             | **Critical**                               |
| Cross-tenant Placement access prohibited                | **Critical**                               |
| Optimistic concurrency                                  | **Critical**                               |
| External-side-effect idempotency                        | **Critical**                               |
| Audit/outbox integration                                | **Required**                               |
| Partial dependency failure handling                     | **Critical**                               |

---

# 8. Consolidation

Design 128 creates significant risk if a channel/placement detail page is implemented as a single mutable `placement_url + status + metrics` record.

**Design 127 / Design 128 backend duplication**
Campaign and Placement detail disagree.

**DistributionPlacementDetailView / Placement conflation**
Read projection becomes source truth.

**DistributionChannel / Placement conflation**
Configured destination becomes downstream result.

**DistributionChannel / channel type conflation**
Specific account/property identity disappears.

**Channel / IntegrationConnection conflation**
OAuth reconnect changes campaign destination identity.

**Channel lifecycle / connection health conflation**
API outage disables historical Channel identity.

**Channel disabled / Placement removed conflation**
Future execution setting becomes external takedown.

**DistributionChannel / PublicationTarget conflation**
Publishing and downstream distribution destinations merge.

**DistributionItem / Placement conflation**
Planned campaign action is treated as successful result.

**DistributionItem / ChannelExecution conflation**
Intent and external side effect merge.

**ChannelExecution / Placement conflation**
Provider attempt is assumed to have created content.

**Execution / ProviderEvent conflation**
Callbacks replace internal attempt identity.

**Provider accepted / Placement created conflation**
API response becomes downstream object.

**Placement created / verified conflation**
Object existence becomes correctness proof.

**Placement verified / permanently live conflation**
Historical verification is treated as perpetual current truth.

**Placement URL / Placement identity conflation**
Bare URL loses Campaign/source/provider lineage.

**Provider object ID / Placement ID conflation**
Provider migration/ID collisions break internal identity.

**CampaignVersion / Placement current state conflation**
New Campaign plan rewrites prior Placement.

**Latest Publication / historical Placement source conflation**
New source release changes what was actually promoted.

**Source correction / Placement correction conflation**
Article update silently edits social/newsletter placement.

**Retry / correction conflation**
Changed payload is represented as same attempt.

**Retry / newest CampaignVersion conflation**
Historical intent is lost.

**Retry / newest PublicationVersion conflation**
Different content is accidentally distributed.

**Retry / overwrite previous Execution conflation**
Failure evidence disappears.

**Outcome unknown / failure conflation**
Blind retry creates duplicate downstream content.

**Reconciliation / Retry conflation**
Diagnostic observation causes another side effect.

**Provider callback duplicate / duplicate Placement conflation**
Same external object appears multiple times.

**Out-of-order callback / state regression conflation**
Verified result becomes pending.

**Weak URL/title matching / provider identity conflation**
Events attach to wrong Placement.

**Unmatched ProviderEvent / discard conflation**
Investigation evidence disappears.

**Provider Event received / trusted conflation**
Spoofed event mutates state.

**Placement current state / verification history conflation**
New missing result destroys proof it was previously live.

**Mismatch / missing conflation**
Wrong content is reported absent.

**Unknown / missing conflation**
Verification outage becomes takedown.

**Verification unavailable / failed conflation**
Infrastructure outage becomes business failure.

**Provider-reported / independently verified conflation**
Evidence quality disappears.

**Manual verification / automated verification conflation**
Human judgement appears machine-confirmed.

**Override / verified conflation**
Administrative decision becomes false technical fact.

**Manual Placement / provider Placement conflation**
Human-entered result looks automatically executed.

**Manual Placement / Manual Verification conflation**
Creation origin and validation method merge.

**Placement replacement / overwrite conflation**
Original public content history disappears.

**Replaced / deleted conflation**
Cannot reconstruct earlier campaigns.

**Latest Execution / current Placement conflation**
Failed correction makes older live Placement look gone.

**Channel disconnected / Placement missing conflation**
Existing public content appears offline.

**Integration health / Placement status conflation**
Provider API status overwrites downstream evidence.

**Placement verified / performance available conflation**
Missing metrics become zero.

**Zero performance / unavailable performance conflation**
Reports lie.

**Metric value / timeless field conflation**
No observation period/freshness/provenance.

**Current metric / Report snapshot conflation**
Live analytics rewrites historical reporting.

**Activity event / Placement truth conflation**
“Distributed successfully” text replaces canonical Placement.

**Audit event / ChannelExecution conflation**
Governance evidence becomes provider execution state.

**Notification / Placement state conflation**
Dismissing failure alert changes external truth.

**Search index / current Placement state conflation**
Stale indexed URL becomes verification authority.

**Client Distribution projection / internal detail conflation**
Provider failures/credentials leak externally.

**Client visible URL / verified Placement conflation**
Unsafe/unverified links appear to clients.

**Generic `placement_status` field**
Channel, execution, verification and current availability collapse.

**Generic `placement_url` field**
No exact CampaignVersion/source/provider/evidence lineage.

**Generic `last_execution_status`**
Cannot represent an older still-live Placement after failed correction.

**Generic `metrics JSON`**
No metric provenance/freshness/zero semantics.

**128/032 duplicate Distribution domain**
Placement detail forks from foundation.

**128/073 duplicate Client Placement truth**
Portal/team states diverge.

**128/124–126 duplicate Publishing Target/Placement truth**
Canonical publication and downstream distribution collapse.

**128/127 duplicate ChannelExecution state**
Campaign and detail disagree.

**128/129 duplicate Verification backend**
Two sources decide whether Placement is live.

**128/130 duplicate final-report evidence**
Detail stores frozen reporting metrics independently.

**128/139–140 duplicate Integration health/credentials**
Placement detail becomes connection settings.

No additional screen is required.

These are **channel identity, exact Campaign/source lineage, execution/provider evidence, Placement identity, reconciliation-before-retry, historical/current verification, replacement lineage, Integration separation, performance provenance, and client-safe projection requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL DISTRIBUTION CHANNEL, EXECUTION EVIDENCE, PLACEMENT LINEAGE & PLACEMENT-STATE DETAIL ANCHOR**

**Domain directive:**
**DistributionCampaign ≠ DistributionCampaignVersion ≠ DistributionItem ≠ DistributionChannel ≠ ChannelExecution ≠ ProviderEvent ≠ Placement ≠ PlacementVerification ≠ PlacementPerformance ≠ PublicationTarget ≠ PublicationPlacement ≠ IntegrationConnection ≠ ClientDistributionProjection ≠ DistributionPlacementDetailView.**

**Foundation directive:**
Design 032 remains the single canonical Distribution domain, and Design 128 must reuse the exact Campaign, Item, Execution, Placement and Verification identities introduced through Designs 032/127.

**Detail directive:**
`DistributionPlacementDetailView` is a permission-safe composition only. It never becomes a second writable Placement model.

**Campaign directive:**
every Placement preserves exact DistributionCampaign and `DistributionCampaignVersion` lineage. Later CampaignVersions never rewrite prior execution history.

**Source directive:**
every Placement preserves the exact source PublicationVersion/artifact used by its DistributionItem. Newer source releases never silently alter historical Placement provenance.

**Item directive:**
`DistributionItem` remains planning/execution intent; it never means a Placement exists merely because the Item is ready/scheduled/executed.

**Channel directive:**
`DistributionChannel` is a stable concrete destination/account/property and remains separate from generic channel taxonomy, PublicationTarget, provider connection and credentials.

**Connection directive:**
Designs 139–140 remain IntegrationConnection/health authority. OAuth reconnect, token rotation, provider outage or degraded health never changes historical Channel/Placement identity.

**Channel-state directive:**
Channel enabled/disabled state and Integration healthy/degraded/unavailable state remain independent.

**Disablement directive:**
disabling a Channel prevents future actions according to policy but never implicitly removes, deletes, or marks historical external Placements taken down.

**Execution directive:**
each external side effect is represented by append-oriented `ChannelExecution` with exact CampaignVersion, DistributionItem, Channel, source, payload and execution purpose.

**Execution-history directive:**
new retries/corrections never overwrite prior Executions. Full known-failure/unknown/success history remains reconstructable.

**Provider-event directive:**
external provider callbacks/status evidence are authenticated where supported, deduplicated, normalized, out-of-order safe and associated by strong external identifiers.

**No-weak-match directive:**
provider evidence cannot be assigned to Placements by title similarity, nearby timestamps or URL text alone where stronger provider request/object identities exist.

**Unmatched-event directive:**
unmatched ProviderEvents remain investigation evidence and are never silently discarded or attached to arbitrary Distribution records.

**Placement directive:**
`Placement` is the canonical normalized downstream result of distribution and permanently records CampaignVersion, Item, Channel, exact source and Execution provenance.

**URL directive:**
a bare `placement_url` can never substitute for Placement identity or verification.

**Provider-object directive:**
provider object identifiers are external references, not internal Placement IDs.

**Verification directive:**
`PlacementVerification` independently determines whether the expected Placement exists correctly and remains separate from provider acceptance and Placement creation.

**Verification-history directive:**
verification is append/history preserving. A Placement verified last week and missing today retains both facts.

**Current-state directive:**
current Placement state is derived from the latest authoritative verification/provider evidence without deleting earlier successful verification history.

**Verification-provenance directive:**
provider-reported, automated external, manual and overridden verification methods remain separately identifiable.

**Override directive:**
administrative acceptance of an uncertain Placement does not rewrite technical verification to `VERIFIED`.

**Mismatch directive:**
Placement exists with wrong source/content is `MISMATCH`, not missing, failed execution, or verified.

**Unknown directive:**
verification unavailable/unknown never becomes `NOT_FOUND` or `VERIFIED`.

**Freshness directive:**
verified state carries verification time/freshness where current availability matters.

**Reconciliation directive:**
outcome-unknown Execution is resolved through observation/provider lookup only. Reconciliation never itself sends another external distribution action.

**No-blind-retry directive:**
retry remains prohibited while external outcome is unknown.

**Retry directive:**
retry creates a new ChannelExecution against the same exact CampaignVersion, DistributionItem, Channel, payload and source after a known safely retryable failure.

**Correction directive:**
different content/source/copy requires a new campaign/item version or explicit corrective/repost lineage. It is never disguised as Retry.

**Replacement directive:**
corrective Placement P-11 may supersede P-10, but P-10 remains immutable historical evidence of what existed previously.

**Latest-execution directive:**
the newest Execution outcome must never be used as a substitute for current Placement state; an older Placement may still be live after a failed update/repost.

**Manual-placement directive:**
if off-platform/manual Placement entry is supported, it carries explicit MANUAL origin, actor, exact source/channel/evidence and never pretends provider execution occurred.

**Performance directive:**
Design 129/038 remain the canonical verification/performance metric foundation. Design 128 consumes summarized performance rather than creating another metric store.

**Metric directive:**
performance values preserve definition, source, observation time, freshness and availability; `0` and `Unavailable` remain completely different facts.

**Client directive:**
Design 073 consumes sanitized verified Placement/performance projections only. Raw ProviderEvents, retries, internal errors, credentials and unverified URLs remain internal.

**Publishing directive:**
PublicationTarget/PublicationVerification from Designs 124–126 remain separate from DistributionChannel/PlacementVerification. Canonical release verification and downstream promotion verification can share infrastructure but never domain identity.

**Report directive:**
Design 130 must consume these exact CampaignVersion/Placement/Verification/Metric identities for frozen reporting; Design 128 cannot maintain independent report snapshots.

**Permissions directive:**
read, execute, retry, reconcile, correction, Channel management, ProviderEvidence read, manual verification and override remain independently server-authorized.

**Target-permission directive:**
access/execute rights may be channel-specific. Ability to manage one destination never implies access to every distribution account.

**Tenant directive:**
Campaign, CampaignVersion, Item, Channel, provider connection, Execution, Placement, Verification and source content remain strictly tenant-scoped.

**Idempotency directive:**
Execution callbacks, Placement establishment, reconciliation processing, retry, manual Placement, verification and correction lineage are replay-safe.

**Concurrency directive:**
retry vs late provider callback, Channel disable vs execution, automated vs manual verification, and replacement vs current verification use revision/transactional coordination so state cannot silently race.

**Activity directive:**
Design 119 may summarize Placement creation/verification/missing/replacement actions while canonical Placement/Verification records remain authoritative.

**Audit directive:**
retry, manual Placement, manual Verification, override, reconciliation decisions, correction/repost and material Channel management actions generate actor/source/version-aware Design-039 Audit evidence.

**Caching directive:**
historical CampaignVersions, Executions, ProviderEvents and Verification records can be strongly cached; current authorization, Integration health, Placement availability and performance summaries remain freshness-aware.

**Partial-failure directive:**
Campaign lineage, provider connection, Execution history, Placement verification and metrics can fail independently. `Unavailable` can never be transformed into `Missing`, `Failed`, `0`, `Disconnected`, `Verified`, or “safe to retry.”

**Performance directive:**
load one compact Placement lineage/current-state summary first, then lazy Execution history, ProviderEvents and metric detail to avoid expensive provider/history fan-out.

**Future-reuse directive:**
Design **129 — Distribution Performance & Verification** must reuse the exact canonical `Placement`, `PlacementVerification`, `ChannelExecution`, and metric-observation identities established here. It should aggregate and compare Placements across Campaigns/channels and deepen verification/performance analysis rather than create a second `DistributionPerformancePlacement` or verification engine.

**Overlap directive:**
Designs **032, 073, 124–140** must preserve one continuous **exact source Publication/artifact → DistributionCampaignVersion → DistributionItem → concrete DistributionChannel → idempotent ChannelExecution → authenticated ProviderEvent → canonical Placement → append-oriented PlacementVerification → provenance/freshness-aware performance observations → client-safe projection/final reporting** lineage.

**Consolidation directive:**
**STANDARDIZE ONE DISTRIBUTION CHANNEL & PLACEMENT DETAIL FOUNDATION — DESIGN-032/127 CANONICAL CAMPAIGN/ITEM/CHANNEL IDENTITIES + APPEND-ORIENTED EXACT-PAYLOAD CHANNELEXECUTIONS + AUTHENTICATED DEDUPLICATED PROVIDER EVENTS + STRONG PROVIDER-OBJECT PLACEMENT RESOLUTION + EXACT CAMPAIGN/SOURCE VERSION PROVENANCE + SEPARATE PLACEMENT/VERIFICATION/CURRENT-AVAILABILITY STATE + RECONCILIATION-BEFORE-RETRY + HISTORICAL REPLACEMENT LINEAGE + DISTINCT CHANNEL/INTEGRATION HEALTH + DESIGN-129 SHARED PERFORMANCE/VERIFICATION + CLIENT-SAFE DESIGN-073 PROJECTIONS — AND NEVER ALLOW BARE URLS, LATEST SOURCE VERSIONS, LAST-EXECUTION STATUS, PROVIDER ACCEPTANCE, MANUAL OVERRIDES, CONNECTION HEALTH, ZERO METRICS OR UI BADGES TO SUBSTITUTE FOR OR REWRITE CANONICAL PLACEMENT, VERIFICATION, EXECUTION OR PERFORMANCE TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **128 / 153** |
| **PASS**                                   |                        **128** |
| **STANDARDIZE decisions**                  |                        **126** |
| **Potential implementation-overlap flags** |                        **119** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**128 / 153 = 83.7% audited.**

### Canonical Placement architecture after Design 128

```text
Distribution Campaign DC-100
          │
          ↓
Campaign Version v2
          │
          ↓
Distribution Item DI-20
          │
          ├── Publication v3
          ├── LinkedIn payload v2
          └── Channel CH-10
                    │
                    ↓
             Execution E-12
                    │
             ProviderEvents
                    │
                    ↓
               Placement P-10
                    │
                    ↓
             Verification V-5
                    │
                 VERIFIED
```

The strongest provenance rule is now explicit:

```text
Placement P-10

Campaign Plan = v2
Source Publication = v3
Channel Payload = v2

Later:

Campaign Plan v3 exists
Publication v4 exists

RESULT:

P-10 remains linked to:

Campaign v2
Publication v3
Payload v2

History never changes.
```

Execution and Placement state remain independent:

```text
P-10 currently live

Corrective Execution E-20
fails

LATEST EXECUTION:
FAILED

CURRENT PLACEMENT:
P-10 may still be LIVE

Therefore:

latest Execution status
cannot substitute for
Placement state.
```

Verification history remains append-only:

```text
Aug 20
P-10 VERIFIED

Aug 22
P-10 VERIFIED

Aug 25
P-10 NOT FOUND

RESULT:

Current state may be Missing.

But history still proves
P-10 existed and was verified
on Aug 20 and Aug 22.
```

And Integration health cannot rewrite downstream truth:

```text
Provider API connection:
UNAVAILABLE

Placement:
last independently VERIFIED

These can coexist.

API unavailable
        ≠
Placement missing.
```

## Next Sequential Audit Target

### **Design 129 — Distribution Performance & Verification**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
