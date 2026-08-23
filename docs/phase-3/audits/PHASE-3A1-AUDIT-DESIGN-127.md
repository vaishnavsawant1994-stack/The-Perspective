# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 127 — Distribution Campaign Management

Design 127 should become the **canonical Team Workspace distribution-campaign planning, channel execution, placement creation, delivery-status, verification-readiness, and multi-channel operations surface** built directly on the Distribution foundation already established by **Design 032 — Distribution Campaign Workspace**.

Design 127 must **not create a second Distribution engine**. Design 032 remains the canonical Distribution domain. Design 127 is the deeper campaign-management surface that coordinates exact published content through distribution channels and execution plans while preserving clean boundaries with Publishing, Outreach, Client Reporting, integrations, and performance measurement.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Publication ≠ DistributionCampaign ≠ DistributionCampaignVersion ≠ DistributionContentReference ≠ DistributionItem ≠ DistributionChannel ≠ DistributionSchedule ≠ ChannelExecution ≠ ProviderEvent ≠ Placement ≠ PlacementVerification ≠ PerformanceMetric ≠ OutreachCampaign ≠ PublicationTarget.**

The central implementation rule is:

> **Distribution begins only from an exact eligible source—normally a verified PublicationVersion/Placement or another explicitly permitted immutable content artifact. Creating a DistributionCampaign never republishes source content, never mutates the Publication, and never means that anything has actually been placed. Campaign plan, channel execution, provider acceptance, placement creation, placement verification, and measured performance are all separate facts. Once campaign execution begins, the exact content/version/channel plan used by those executions must remain historically reproducible; later Publication versions or campaign edits can never silently rewrite what was distributed.**

---

# 1. Classification

| Audit field                             | Classification                                                                                                                                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**                           | **127**                                                                                                                                                                                          |
| **Canonical name**                      | **Distribution Campaign Management**                                                                                                                                                             |
| **Product area**                        | Team Workspace / Distribution / Campaign Operations                                                                                                                                              |
| **User surface**                        | **Authenticated Team Workspace**                                                                                                                                                                 |
| **Screen class**                        | Distribution Operations Workspace / Campaign Management                                                                                                                                          |
| **Classification**                      | **Canonical Distribution Campaign Planning, Multi-Channel Execution & Placement-Orchestration Anchor**                                                                                           |
| **Primary purpose**                     | Plan and manage distribution of exact eligible content across configured channels while tracking execution, placement creation, verification readiness, operational failures, and campaign state |
| **Canonical Distribution foundation**   | **Design 032 — Distribution Campaign Workspace**                                                                                                                                                 |
| **Primary entity**                      | **DistributionCampaign**                                                                                                                                                                         |
| **Campaign revision/release identity**  | `DistributionCampaignVersion` where campaign plans require version freezing                                                                                                                      |
| **Content relation**                    | `DistributionContentReference` / exact campaign source reference                                                                                                                                 |
| **Campaign work unit**                  | **DistributionItem**                                                                                                                                                                             |
| **Destination identity**                | **DistributionChannel** / configured channel target                                                                                                                                              |
| **Scheduling identity**                 | `DistributionSchedule` / item schedule where frozen workflow requires scheduling                                                                                                                 |
| **Execution identity**                  | **ChannelExecution**                                                                                                                                                                             |
| **External evidence**                   | `ProviderEvent`                                                                                                                                                                                  |
| **Result identity**                     | **Placement**                                                                                                                                                                                    |
| **Verification identity**               | `PlacementVerification`                                                                                                                                                                          |
| **Performance identity**                | `PerformanceMetric` / MetricObservation                                                                                                                                                          |
| **Canonical publishing dependency**     | Designs 031 / 124–126                                                                                                                                                                            |
| **Client projection dependency**        | Designs 055 / 073                                                                                                                                                                                |
| **Channel detail dependency**           | Design 128                                                                                                                                                                                       |
| **Performance/verification dependency** | Design 129                                                                                                                                                                                       |
| **Final report dependency**             | Design 130                                                                                                                                                                                       |
| **Reporting dependency**                | Designs 033 / 131–134                                                                                                                                                                            |
| **Analytics dependency**                | Design 038 / 135                                                                                                                                                                                 |
| **Integration dependency**              | Designs 139–140                                                                                                                                                                                  |
| **Outreach boundary**                   | Designs 012–014 / 090–093                                                                                                                                                                        |
| **Activity dependency**                 | Design 119                                                                                                                                                                                       |
| **Audit dependency**                    | Design 039                                                                                                                                                                                       |
| **Primary query service**               | `DistributionCampaignQueryService`                                                                                                                                                               |
| **Campaign service**                    | canonical `DistributionCampaignService`                                                                                                                                                          |
| **Eligibility resolver**                | `DistributionEligibilityResolver`                                                                                                                                                                |
| **Campaign-plan service**               | `DistributionCampaignPlanService`                                                                                                                                                                |
| **Execution service**                   | `DistributionExecutionService`                                                                                                                                                                   |
| **Channel adapter registry**            | `DistributionChannelAdapterRegistry`                                                                                                                                                             |
| **Placement service**                   | `DistributionPlacementService`                                                                                                                                                                   |
| **Verification service**                | `DistributionPlacementVerificationService`                                                                                                                                                       |
| **Aggregate state resolver**            | `DistributionCampaignStateResolver`                                                                                                                                                              |
| **Parent shell**                        | `InternalAppShell` — Design 001                                                                                                                                                                  |
| **Auth**                                | Required                                                                                                                                                                                         |
| **Authorization**                       | Active OrganizationMembership + Distribution campaign/channel/execution permissions                                                                                                              |
| **Implementation priority**             | **Critical Multi-Channel External Execution / Placement Integrity / Distribution Provenance**                                                                                                    |
| **Reuse level**                         | **Extremely High across Client Distribution, Performance, Reporting, Analytics and renewals**                                                                                                    |

Design 127 should answer:

> **“Which exact content are we distributing, under which campaign plan, to which channels, what is scheduled or ready to execute, what has actually been attempted, where did placements get created, what still requires verification, which channels failed or remain uncertain, and what is the campaign’s true operational state?”**

Canonical architecture:

```text
VERIFIED PUBLICATION / ELIGIBLE ARTIFACT
                │
                ↓
       DistributionCampaign
                │
                ↓
    DistributionCampaignVersion
         exact campaign plan
                │
      ┌─────────┼───────────┐
      ↓         ↓           ↓
Distribution Distribution Distribution
   Item A        Item B       Item C
      │            │            │
      ↓            ↓            ↓
 Channel A      Channel B      Channel C
      │            │            │
 Schedule?      Schedule?      Schedule?
      │            │            │
 Execution      Execution      Execution
      │            │            │
 Provider       Provider       Provider
 Evidence       Evidence       Evidence
      │            │            │
 Placement      Placement      UNKNOWN
      │            │
 Verification  Verification
```

---

# 2. Reuse

## Design 032 remains the canonical Distribution foundation

This is Design 127's strongest reuse requirement.

Design 127 must not introduce:

```text
ManagedDistribution
DistributionJob
DistributionProject
DistributionCampaignRecordV2
```

as alternate business identities.

Correct:

```text
DistributionCampaign DC-100
        │
        ├── Design 032 Distribution Workspace
        ├── Design 127 Campaign Management
        ├── Design 128 Channel / Placement Detail
        ├── Design 129 Performance & Verification
        └── Design 130 Final Distribution Report
```

All use the **same canonical DistributionCampaign identity and backend**.

---

## DistributionCampaign ≠ Publication

Absolute.

### Publication

Makes canonical content live.

### DistributionCampaign

Promotes, syndicates, distributes, or places eligible content through downstream channels.

Correct:

```text
Publication PUB-10 v3
VERIFIED LIVE
        │
        ↓
eligible source for
DistributionCampaign DC-20
```

Not:

```text
DistributionCampaign
= Publication
```

---

## Distribution does not republish source content implicitly

A Distribution execution may create:

* a social post;
* newsletter placement;
* platform listing;
* promotional link;
* PR placement;

depending on supported channels.

But the canonical Publication remains independently authoritative.

---

## DistributionCampaign ≠ OutreachCampaign

Critical.

Design 012/090 Campaigns are sales/prospect communications.

Design 127 campaigns distribute media/content.

Correct boundary:

```text
OutreachCampaign
→ leads / contacts / replies / sales engagement

DistributionCampaign
→ published content / placements / channels / performance
```

Do not share a generic writable `Campaign` entity.

Low-level UI primitives may be reused.

Business models must remain separate.

---

## DistributionCampaign ≠ DistributionItem

Permanent.

Campaign is the overall coordinated distribution effort.

`DistributionItem` is one planned content/channel execution unit.

---

## DistributionItem ≠ ChannelExecution

Critical.

### DistributionItem

> What should be distributed through which channel/context?

### ChannelExecution

> What actual attempt was made?

A DistributionItem may have multiple executions due to:

* retry;
* correction;
* scheduled attempt;
* manual re-execution.

---

## ChannelExecution ≠ Placement

Permanent.

Attempting distribution does not prove a resulting placement exists.

---

## Placement ≠ PlacementVerification

Permanent.

A provider may return a placement ID/URL.

That does not prove the placement is:

* accessible;
* correct;
* current;
* carrying the correct content/version.

---

## Design 129 Verification ≠ Publishing Verification

This distinction is critical.

### PublicationVerification

Proves the canonical source release is live at its PublicationTarget.

### Distribution Placement Verification

Proves a downstream promotional/distribution placement exists and correctly references the intended distributed content.

They may reuse generic verification infrastructure.

They must remain separately typed.

---

## Distribution channel ≠ PublicationTarget

Permanent.

Example:

```text
PublicationTarget:
The Perspective main website

DistributionChannel:
LinkedIn company account
newsletter
PR platform
partner media property
```

Some provider types may overlap technologically.

The business meanings do not.

---

## Source Publication version must be exact

DistributionCampaign cannot point to:

```text
Publication PUB-10 → current/latest
```

if execution must be historically reproducible.

Prefer:

```text
PublicationVersion PV-3
```

and, where relevant:

```text
verified Placement LP-10
```

---

## New Publication version does not silently change Campaign

Critical.

Example:

```text
Distribution Campaign DC-20
pins PublicationVersion v3.

Later:
Publication v4 released.
```

Existing DC-20 remains based on v3 unless an explicit campaign revision/replacement action changes future distribution items.

Historical executions remain v3 forever.

---

## Design 055/073 consume client-safe Distribution truth

Client Portal should receive safe projections such as:

* distribution channels;
* verified placements;
* campaign progress;
* approved performance metrics.

It must not own separate campaign states.

---

# 3. Entities

## DistributionCampaign

Stable canonical campaign identity.

Conceptually:

```text
DistributionCampaign
├── id
├── organizationId
├── projectId?
├── clientRelationshipId?
├── name
├── purpose
├── lifecycle
├── currentDraftVersionId?
├── activeVersionId?
├── startedAt?
├── completedAt?
├── createdBy
├── createdAt
└── revision
```

Exact schema belongs to Phase 3D.

---

## DistributionCampaign ≠ CampaignVersion

If the campaign plan can materially change after creation, separate:

```text
DistributionCampaign
       ↓
DistributionCampaignVersion
```

---

## DistributionCampaignVersion

A versioned campaign plan is strongly recommended where execution spans multiple channels and time.

Conceptually:

```text
DistributionCampaignVersion
├── id
├── distributionCampaignId
├── version
├── source content references
├── channel/item plan
├── campaign metadata snapshot
├── createdBy
├── createdAt
└── lifecycle
```

---

## Published/activated campaign plan should become immutable

Once ChannelExecutions use version v2:

do not modify v2's:

* source versions;
* destination channels;
* campaign copy;
* planned placement semantics;

in place.

Create a new campaign version if material plan changes.

---

## Latest campaign version ≠ active execution version

Permanent.

Valid:

```text
v2 = active/executing
v3 = draft
```

Executions already assigned to v2 remain v2.

---

## DistributionContentReference

Typed exact source identity.

Conceptually:

```text
DistributionContentReference
├── sourceType
├── sourceId
├── exactVersionId
├── sourcePlacementId?
├── sourceCanonicalUrl?
├── role
└── integrity/provenance
```

Possible source types should be only those supported by existing domains.

---

## Verified Publication is preferred canonical source where applicable

For public distribution campaigns:

```text
PublicationVersion
+
verified Publication Placement
```

provides strong provenance.

Do not distribute arbitrary mutable draft content merely because a file exists.

---

## Source content ≠ Campaign copy

Critical.

The campaign may generate channel-specific promotional content.

Example:

```text
Source:
Feature article v3

Distribution copy:
“Read our latest executive profile…”
```

The two are different versioned payloads.

---

## DistributionItem

One planned content/channel unit.

Conceptually:

```text
DistributionItem
├── id
├── campaignVersionId
├── contentReference
├── distributionChannelId
├── item type
├── channel payload/version
├── requirement class
├── planned time?
├── lifecycle
└── revision
```

Exact physical model Phase 3D.

---

## DistributionItem ≠ generic Task

Permanent.

It may create operational Tasks where human work is needed, but the distribution item itself is a campaign execution unit.

---

## DistributionChannel

Stable configured destination identity.

Conceptually:

```text
DistributionChannel
├── id
├── organizationId
├── channelType
├── providerConnectionId?
├── property/account/destination reference
├── lifecycle
├── capabilities
└── revision
```

---

## DistributionChannel ≠ provider credential

Absolute.

Credentials remain secure Integration state.

---

## DistributionChannel ≠ channel taxonomy

`LINKEDIN` may be a type.

A specific:

> The Perspective Media LinkedIn Page

is the actual channel/destination.

---

## Required vs optional channels/items

Campaign completion needs policy.

Conceptually:

```text
REQUIRED
OPTIONAL
```

or equivalent.

Do not treat every selected channel identically if business requirements differ.

---

## DistributionSchedule

If Design 127 supports scheduled distribution:

a distinct schedule may exist for DistributionItem execution.

Conceptually:

```text
DistributionSchedule
├── itemId
├── execution window/time
├── timezone
├── lifecycle
└── revision
```

It remains separate from `PublicationSchedule`.

Do not reuse PublicationSchedule for downstream promotion.

---

## ChannelExecution

Canonical external execution attempt.

Conceptually:

```text
ChannelExecution
├── id
├── distributionCampaignId
├── campaignVersionId
├── distributionItemId
├── distributionChannelId
├── exact payload/version
├── executionPurpose
├── attemptNumber
├── providerRequestId?
├── initiatedAt
├── outcomeClass
├── completedAt?
└── revision
```

---

## Execution purpose

Potential distinctions:

```text
INITIAL
RETRY
CORRECTION
REPOST
```

where supported.

Retry and repost/correction are not synonymous.

---

## ProviderEvent

Normalized immutable external evidence.

Provider events should retain:

* provider event ID;
* execution relation;
* external object ID;
* event type;
* occurredAt;
* receivedAt;
* verified authenticity where supported.

---

## Placement

A successful downstream distribution result.

Conceptually:

```text
Placement
├── id
├── campaignId
├── campaignVersionId
├── distributionItemId
├── channelId
├── sourceContentReference
├── executionId
├── providerObjectId?
├── placementUrl/reference?
├── createdAt
├── lifecycle
└── revision
```

---

## Placement must preserve exact source/campaign lineage

A Placement should answer:

> Which exact source PublicationVersion and which CampaignVersion produced me?

---

## Placement URL ≠ Placement identity

Permanent.

URLs may change.

Provider object ID + channel + exact campaign/source context remain stronger.

---

## PlacementVerification

Conceptually:

```text
PlacementVerification
├── id
├── placementId
├── expectedSourceReference
├── verificationMethod
├── result
├── verifiedAt
├── freshness
├── evidence
└── verifier
```

---

## Verification result

Conceptually:

```text
VERIFIED
NOT_VERIFIED
MISMATCH
UNKNOWN
UNAVAILABLE
```

---

## PerformanceMetric

Design 129 becomes the detailed operational authority.

Design 127 may show summary projections only.

Never store:

```text
campaign.likes = 120
```

as one mutable number without:

* metric definition;
* channel;
* observation time;
* provenance;
* freshness.

---

## Metric zero ≠ unavailable

Critical.

This Design 032/038 invariant must continue.

---

# 4. Permissions

Design 127 should conceptually distinguish:

```text
distributionCampaign.read
distributionCampaign.create
distributionCampaign.editDraft
distributionCampaign.activate
distributionCampaign.cancel

distributionItem.read
distributionItem.manage

distributionChannel.read
distributionChannel.execute

distributionSchedule.manage

distributionExecution.retry
distributionExecution.correct

distributionPlacement.read
distributionVerification.read
```

Exact keys belong to Phase 3D.

---

## Campaign read ≠ Campaign edit

Permanent.

---

## Campaign edit ≠ Campaign activation/launch

Critical.

A coordinator may prepare a distribution plan without having external-execution authority.

---

## Campaign activation ≠ provider credential administration

Absolute.

---

## Channel read ≠ Channel execute

Permanent.

---

## Execute one channel ≠ execute every channel

Target-specific authorization may apply.

---

## Retry ≠ correction/repost authority

Permanent.

Retry means same exact execution intent after safely known failure.

Correction/repost may create different public content.

---

## Distribution permission ≠ Publishing permission

Critical.

A user may distribute already-published content without being allowed to change or republish the canonical Publication.

---

## Distribution permission ≠ Outreach permission

Permanent.

---

## Campaign manager ≠ Analytics administrator

Permanent.

---

## Placement read ≠ raw provider-event read

Sensitive debugging evidence may require stronger permission.

---

## Manual verification/override permission should remain separate if present

Do not grant it automatically with ordinary campaign editing.

---

## Direct Campaign ID reauthorizes

Permanent.

---

## Direct Item/Execution/Placement IDs reauthorize

Permanent.

---

## Cross-tenant channel execution prohibited

Absolute.

Campaign, source content, channel, provider connection, Client/Project context and Placement must remain in authorized tenant scope.

---

# 5. States

Design 127 must keep **Campaign lifecycle, CampaignVersion state, item readiness, schedule state, execution state, provider state, placement state, verification state, and performance state** independent.

### Campaign lifecycle

Conceptually:

```text
Draft
Ready
Active
Partially Executed
Completed
Attention Required
Cancelled
```

### CampaignVersion

```text
Draft
Active
Historical
Superseded
```

### DistributionItem

```text
Planned
Ready
Blocked
Scheduled
Executing
Placed
Failed
Outcome Unknown
Cancelled
```

### ChannelExecution

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
Verification Pending
Verified
Mismatch
Missing
Taken Down / Expired
Unknown
```

Exact enums Phase 3D.

---

## Campaign Ready ≠ Campaign Active

Permanent.

---

## Campaign Active ≠ any Placement created

Permanent.

---

## Execution attempted ≠ Placement created

Absolute.

---

## Provider accepted ≠ Placement verified

Absolute.

---

## Placement created ≠ correct placement

Critical.

---

## One Placement verified ≠ Campaign completed

Permanent.

---

## Required channels complete ≠ optional channels complete

Aggregate state must preserve both.

---

## Partial execution ≠ failure

Permanent.

---

## One failed channel ≠ Campaign failed universally

Campaign policy decides aggregate result.

---

## Outcome unknown ≠ failed

Absolute.

---

## Retryable failure ≠ outcome unknown

Critical.

---

## New PublicationVersion available ≠ Campaign source changed

Absolute.

---

## New CampaignVersion draft ≠ active version superseded immediately

Permanent.

---

## Campaign completed ≠ Final Distribution Report generated

Design 130 remains separate.

---

## Campaign completed ≠ performance measurement finished

Performance may continue after execution completion.

---

## Placement verified ≠ performance available

Permanent.

---

## Zero engagement ≠ missing metrics

Critical.

---

## Distribution completed ≠ Publication changed

Absolute.

---

## State Coverage

Design 127 inherits Design 150 plus:

```text
Distribution Campaign Loading
Distribution Campaign Available
Distribution Campaign Empty
Distribution Campaign Restricted
Distribution Campaign Partial
Distribution Campaign Unavailable

Campaign Draft
Campaign Ready
Campaign Active
Campaign Partially Executed
Campaign Completed
Campaign Attention Required
Campaign Cancelled

Campaign Version Draft
Campaign Version Active
Campaign Version Historical
Campaign Version Superseded
Newer Campaign Version Available

Distribution Item Planned
Distribution Item Ready
Distribution Item Blocked
Distribution Item Scheduled
Distribution Item Executing
Distribution Item Placed
Distribution Item Failed
Distribution Item Outcome Unknown
Distribution Item Cancelled

Channel Available
Channel Restricted
Channel Degraded
Channel Unavailable
Channel State Unknown

Execution Pending
Execution Running
Execution Provider Accepted
Execution Retryable Failure
Execution Permanent Failure
Execution Outcome Unknown
Execution Completed

Placement Not Created
Placement Created
Placement Verification Pending
Placement Verified
Placement Mismatch
Placement Missing
Placement State Unknown

Source Publication Verified
Source Publication Historical
Newer Source Version Available
Source Eligibility Unknown

Performance Available
Performance Partial
Performance Unavailable
Performance Freshness Unknown

Campaign Updated Elsewhere
Campaign Version Updated Elsewhere
Distribution Item Updated Elsewhere
Provider Event Arrived
Placement Updated Elsewhere
Verification Updated Elsewhere
Distribution Conflict
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize **campaign identity, exact source, channel plan, execution state, placements, and operational attention**.

Conceptually:

```text
Distribution Campaign DC-100
↓
Campaign source
   Publication v3
↓
Campaign plan/version
↓
Channels / Items
   ├── LinkedIn
   ├── Newsletter
   ├── Partner platform
   └── other frozen channels
↓
Execution state
↓
Placements / Verification
↓
Performance summary
```

Only frozen Design 127 sections should render.

---

## Exact source version must remain visible

Correct:

> Leadership Feature · Publication v3

not:

> Leadership Feature · Latest.

---

## Newer source warning must remain non-destructive

Example:

> Campaign uses Publication v3. Publication v4 is now available.

This must not silently change campaign execution.

---

## Channel status should be individual

Correct:

> LinkedIn — Verified placement
> Newsletter — Scheduled
> Partner Platform — Outcome unknown

not:

> Campaign distributed.

---

## Campaign plan version should remain visible if versioning is used

Example:

> Campaign Plan v2 — Active
> Plan v3 — Draft

---

## Placement and performance must remain separate

Correct:

> Placement verified
> Performance data pending

not:

> Placement successful, 0 engagement

when metrics are unavailable.

---

## Unknown execution must be visibly different from failure

The user needs to know when **retry is unsafe**.

---

## Tablet

Following Design 152:

* campaign/source summary remains first;
* channels/items become stacked operational cards;
* execution/verification details collapse;
* primary campaign actions remain isolated;
* exact source/campaign versions remain visible.

---

## Mobile

Priority:

```text
Campaign
↓
Exact source Publication/version
↓
Campaign state
↓
Channel summary
↓
Failed / Unknown executions
↓
Verified placements
↓
Performance summary
↓
Allowed next action
```

Avoid squeezing the full desktop campaign grid onto phone width.

---

## Mobile retry safety

Where retry exists:

> Retry LinkedIn placement · Campaign v2 · Source Publication v3

is safer than:

> Retry Campaign.

---

## Accessibility

A campaign item could communicate:

> Distribution Campaign DC-100, campaign plan version 2, distributing Publication version 3. LinkedIn placement has been independently verified. Newsletter execution is scheduled. Partner Platform execution has an unknown external outcome and must be reconciled before retry. Publication version 4 exists but is not part of this campaign plan.

where authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical Distribution Campaign architecture

```text
Design 127
    ↓
Authenticated Workspace Context
    ↓
DistributionCampaignQueryService
    │
    ├── CampaignAdapter
    ├── CampaignVersionAdapter
    ├── SourcePublicationAdapter
    ├── DistributionItemAdapter
    ├── ChannelAdapter
    ├── ScheduleAdapter
    ├── ExecutionAdapter
    ├── ProviderEventAdapter
    ├── PlacementAdapter
    ├── VerificationAdapter
    ├── PerformanceSummaryAdapter
    └── IntegrationHealthAdapter
    ↓
DistributionCampaignView
```

All mutations use the canonical Design-032 Distribution services.

---

## Campaign creation

Conceptually:

```text
createDistributionCampaign(
    sourceReferences,
    projectId?,
    clientRelationshipId?,
    purpose,
    idempotencyKey
)
```

should:

1. authenticate/authorize;
2. validate tenant context;
3. validate exact source identities;
4. verify source distribution eligibility;
5. create canonical DistributionCampaign;
6. establish initial draft CampaignVersion where needed;
7. emit Audit/outbox.

---

## Creation idempotency

Critical.

Retries cannot create several identical campaign records for one explicit creation intent.

---

## Distribution eligibility

Central:

```text
DistributionEligibilityResolver.resolve(
    exactSourceReference
)
```

should determine whether source content is valid for downstream distribution.

For Publication-backed distribution it may require:

* exact PublicationVersion;
* required Publication target verified;
* safe canonical live Placement/link;
* distribution permission;
* source not invalidated/taken down.

---

## Eligible ≠ automatically distributed

Absolute.

Eligibility only enables campaign creation/execution.

---

## Source unavailable ≠ ineligible

Return:

```text
UNKNOWN
```

where evidence cannot currently be verified.

---

## CampaignVersion creation

Conceptually:

```text
createDistributionCampaignVersion(
    campaignId,
    sourceReferences,
    itemPlan,
    expectedCampaignRevision,
    idempotencyKey
)
```

should preserve exact:

* source versions;
* channel references;
* campaign copy/payload definitions;
* planned item semantics.

---

## Active CampaignVersion immutability

Once executions start against v2:

material edits to v2 are prohibited.

Create v3 for revised future plan.

---

## Campaign draft/active separation

Critical.

A new Draft version should not alter active executions.

---

## DistributionItem creation

Each Item should pin:

```text
campaignVersionId
exact content reference
channelId
payload version
```

before external execution.

---

## Channel-specific payload

A campaign source may need channel-specific:

* text;
* images;
* link metadata;
* subject/title;
* CTA.

These should be versioned/snapshotted within the Campaign/Item plan before execution.

---

## Payload execution must be deterministic

External execution should use the exact DistributionItem payload used when the execution intent was created.

Do not rebuild from today's editable campaign fields.

---

## Scheduling

Where Distribution scheduling exists:

use durable `DistributionSchedule`.

Do not reuse:

```text
PublicationSchedule
```

for downstream distribution.

---

## Schedule must pin exact DistributionItem/CampaignVersion

Same exact-version principle as Publishing.

---

## Execution-time eligibility

Even if source was valid when campaign created:

revalidate critical conditions before external action.

Example:

* Publication taken down;
* canonical live link replaced;
* channel disabled;
* connection invalid;
* campaign cancelled.

---

## ChannelExecution creation

Conceptually:

```text
executeDistributionItem(
    distributionItemId,
    expectedItemRevision,
    idempotencyKey
)
```

server should:

1. authorize;
2. resolve exact CampaignVersion/Item;
3. revalidate source eligibility;
4. verify channel/configuration;
5. verify no incompatible active execution;
6. create durable ChannelExecution;
7. invoke adapter asynchronously/safely;
8. preserve provider evidence.

---

## Channel adapter registry

Use:

```text
DistributionChannelAdapterRegistry
```

not ad hoc provider calls throughout UI/API code.

Adapters own:

* payload mapping;
* execution;
* provider IDs;
* normalized failures;
* status lookup;
* verification support.

---

## Publishing adapters and Distribution adapters may share infrastructure

But the domain operations must remain typed separately.

Do not reuse:

```text
PublicationAttempt
```

for Distribution.

---

## Credentials

Remain secure Integration configuration.

Never persist provider tokens in:

* Campaign;
* DistributionItem;
* ChannelExecution;
* frontend payload.

---

## Execution idempotency

External distribution is side-effectful.

Use stable execution keys and provider idempotency where available.

---

## Known failure vs unknown outcome

Critical.

### Known retryable failure

Provider clearly did not perform the action.

### Outcome unknown

Request may have succeeded but confirmation was lost.

Unknown must be reconciled before retry.

---

## Reconciliation

Conceptually:

```text
reconcileDistributionExecution(executionId)
```

should inspect:

* provider object/reference;
* callback evidence;
* destination state;
* candidate Placement;

without causing another external side effect.

---

## Reconciliation ≠ Retry

Absolute.

---

## Retry

Conceptually:

```text
retryDistributionExecution(
    executionId,
    idempotencyKey
)
```

requires:

* previous execution safely retryable;
* same exact CampaignVersion;
* same DistributionItem payload;
* same intended Channel.

It creates a new execution record.

---

## Retry ≠ use newest Publication

Absolute.

---

## Retry ≠ use newest CampaignVersion

Absolute.

---

## Corrective/repost operation

If corrected channel content is needed:

create/update a new campaign/item version or explicit corrective execution plan.

Do not call it a retry.

---

## Provider callbacks

Require:

* authentication/signature validation where supported;
* event idempotency;
* out-of-order handling;
* duplicate-event tolerance;
* unmatched-event investigation.

---

## Provider success ≠ Placement Verified

Absolute.

---

## Placement creation

A ChannelExecution that returns provider object/link may create a candidate:

```text
Placement
```

with exact lineage.

---

## Placement should never be created from arbitrary URL paste without provenance by default

If manual/off-platform placement is supported:

record it explicitly as:

```text
Manual Placement
```

with actor/source/evidence.

Do not pretend provider execution produced it.

---

## Verification

Design 129 will deepen this, but canonical service begins here:

```text
DistributionPlacementVerificationService
```

Verification must confirm:

* placement accessible;
* correct source/campaign reference;
* correct version/content where feasible;
* channel identity;
* timestamp/method.

---

## SSRF safety

If verification fetches placement URLs server-side:

apply strict outbound-request protections exactly as required for publishing verification.

---

## Placement verification freshness

A placement verified yesterday may later disappear.

Preserve:

```text
verifiedAt
lastCheckedAt?
freshness
```

where current-state verification matters.

---

## Campaign aggregate resolver

Central:

```text
DistributionCampaignStateResolver.resolve(campaignId)
```

should use:

* active CampaignVersion;
* required/optional Items/channels;
* execution states;
* placement verification;
* unresolved unknown outcomes.

Frontend must not derive campaign completion from raw counts alone.

---

## Campaign completion

Should generally mean:

> all required execution/placement requirements of the active CampaignVersion have reached the defined terminal state.

It does not mean:

* performance observation period ended;
* final report generated;
* Project completed;
* Publication changed.

---

## Performance summary

Design 127 may consume compact summaries from Design 129/Analytics.

Do not calculate metrics independently.

---

## Performance observations need provenance

Examples:

```text
impressions
clicks
engagements
referrals
```

must be associated with:

* Placement;
* channel;
* observation period;
* provider/source;
* freshness.

---

## Zero ≠ unavailable

Absolute.

---

## Metric freshness

Campaign management should not show stale historical metrics as current without freshness context where material.

---

## Design 128 integration

Design 128 should drill into:

* one Channel/Placement;
* executions;
* provider evidence;
* verification;
* channel-specific details.

It must use the same canonical Item/Execution/Placement backend.

---

## Design 129 integration

Design 129 owns deeper:

* placement verification;
* performance observations;
* metrics;
* provenance;
* freshness;
* anomalies.

Design 127 consumes summary projections only.

---

## Design 130 integration

Final report should consume frozen/reconstructable campaign outcome data.

Campaign completion does not automatically mean ReportVersion exists.

---

## Client Portal integration

Design 073 consumes client-safe Distribution projections.

Do not expose:

* raw provider failures;
* credentials;
* internal retries;
* internal campaign notes;
* unverified placement URLs.

---

## Reporting integration

Designs 131–134 can use:

* exact Campaign;
* CampaignVersion;
* Placement;
* verified metrics.

No duplicate report-specific campaign truth.

---

## Archive integration

Project archive does not delete DistributionCampaign.

Historical Campaign/Placements/metrics remain valid evidence.

---

## Publication correction/takedown integration

If a source Publication is corrected or removed:

emit events.

Distribution domain evaluates affected Placements/campaigns.

Do not silently replace their source version.

---

## Source invalidation

A Placement based on Publication v3 remains historical evidence even if v4 later becomes current.

Current campaign/actionability may require attention.

History does not change.

---

## Activity

Design 119 may project:

```text
DistributionCampaignCreated
DistributionCampaignActivated
DistributionExecutionStarted
DistributionPlacementVerified
DistributionExecutionFailed
DistributionCampaignCompleted
```

Activity remains projection.

---

## Audit

Material actions should include:

* Campaign creation/version activation;
* Item/channel changes before activation;
* launch/execution;
* retries;
* manual placement/verification;
* cancellation;
* correction/repost operations;
* exceptional overrides.

---

## Notifications

Design 080 may alert:

* channel failure;
* outcome unknown;
* verification mismatch;
* campaign completion.

Notification state never changes campaign truth.

---

## Integrations

Designs 139–140 remain provider connection/health authority.

Design 127 consumes safe:

* connection state;
* capabilities;
* degradation.

It does not own reconnect/token lifecycle.

---

## Optimistic concurrency

Critical races:

### Campaign v2 executing while editor creates v3

Safe because executions pin v2.

### User retries while provider callback confirms success

Retry preflight must recheck current execution state.

### Channel disabled during scheduled execution

Execution-time validation resolves it.

### Source Publication updated during campaign

Existing exact source references remain unchanged.

---

## Execution locks / uniqueness

Prevent concurrent duplicate external actions for the same DistributionItem execution intent.

---

## Idempotency

Critical for:

* Campaign creation;
* Version creation;
* activation;
* Item scheduling;
* execution;
* provider callbacks;
* reconciliation;
* retry;
* manual placement;
* verification.

---

## Caching

Campaign caches should vary by:

```text
organizationMembershipId
campaignId
authorizationRevision
campaignRevision
campaignVersionRevision
distributionItemRevision
channelRevision
scheduleRevision
executionRevision
providerEventRevision
placementRevision
verificationRevision
metricSummaryRevision
integrationHealthRevision
```

---

## Immutable history caching

Historical CampaignVersions, completed Executions, ProviderEvents and verified historical Placements can be cached strongly.

Current permissions/current verification/current metrics cannot.

---

## Performance

Use:

* campaign-scoped indexed queries;
* current active-version pointer;
* compact per-channel execution summary;
* lazy execution/provider history;
* batched verification/performance summaries;
* cursor pagination for large campaigns.

Avoid loading every metric observation/provider callback on initial campaign open.

---

## Partial failure contract

Example:

```text
Campaign core        ✓
Source Publication   ✓
Channels             ✓
Executions           ✓
Verification         ✕
Performance          ✓
```

Correct:

> Distribution executions are available; current Placement verification is unavailable.

Incorrect:

> Placements failed.

Another:

```text
LinkedIn execution  provider accepted
Placement status    unknown
Provider status API unavailable
```

Correct:

> External outcome remains unknown. Do not retry until reconciled.

Not:

> Failed — Retry.

Another:

```text
Placement verified  ✓
Metrics service     ✕
```

Correct:

> Placement is verified; performance data is currently unavailable.

Not:

> 0 impressions.

---

## Backend Requirement Matrix

| Requirement                                                  | Status                                     |
| ------------------------------------------------------------ | ------------------------------------------ |
| Design 032 canonical Distribution reuse                      | **Critical**                               |
| No second Distribution engine in 127                         | **Critical**                               |
| DistributionCampaign/Publication separation                  | **Critical**                               |
| DistributionCampaign/OutreachCampaign separation             | **Critical**                               |
| Campaign/CampaignVersion separation                          | **Critical where versioned plan exists**   |
| CampaignVersion exact source pinning                         | **Critical**                               |
| Latest Publication/source not used implicitly                | **Critical**                               |
| New Publication Version does not mutate Campaign             | **Critical**                               |
| DistributionContentReference/source entity separation        | **Critical**                               |
| Source content/channel payload separation                    | **Critical**                               |
| DistributionItem/Campaign separation                         | **Critical**                               |
| DistributionItem/Task separation                             | **Critical**                               |
| DistributionItem/ChannelExecution separation                 | **Critical**                               |
| DistributionChannel/channel taxonomy separation              | **Critical**                               |
| DistributionChannel/provider credential separation           | **Critical**                               |
| PublicationTarget/DistributionChannel separation             | **Critical**                               |
| DistributionSchedule/PublicationSchedule separation          | **Critical if scheduling exists**          |
| Schedule pins exact CampaignVersion/Item                     | **Critical if scheduling exists**          |
| ChannelExecution/ProviderEvent separation                    | **Critical**                               |
| ChannelExecution/Placement separation                        | **Critical**                               |
| Provider acceptance/Placement verification separation        | **Critical**                               |
| Placement/PlacementVerification separation                   | **Critical**                               |
| Placement URL/Placement identity separation                  | **Critical**                               |
| Exact source lineage retained on Placement                   | **Critical**                               |
| Publishing Verification/Distribution Verification separation | **Critical**                               |
| Required/optional channel semantics                          | **Critical**                               |
| Partial campaign execution first-class                       | **Critical**                               |
| Known failure/outcome-unknown separation                     | **Critical**                               |
| Reconciliation before retry                                  | **Critical**                               |
| Retry same exact CampaignVersion/Item                        | **Critical**                               |
| Retry/correction/repost separation                           | **Critical**                               |
| Provider callback idempotency                                | **Critical**                               |
| Out-of-order provider-event handling                         | **Critical**                               |
| Manual placement/provider placement separation               | **Critical if manual placement exists**    |
| SSRF-safe Placement verification                             | **Critical where URL verification occurs** |
| Verification freshness                                       | **Critical**                               |
| Performance zero/unavailable separation                      | **Critical**                               |
| Metric provenance/freshness                                  | **Critical**                               |
| Design 128 same backend reuse                                | **Critical architecture**                  |
| Design 129 verification/performance reuse                    | **Critical architecture**                  |
| Design 130 Report separation                                 | **Critical architecture**                  |
| Design 073 client-safe projection reuse                      | **Critical**                               |
| Designs 139–140 Integration reuse                            | **Critical architecture**                  |
| Project Archive does not delete Campaign                     | **Critical**                               |
| Distribution/Project completion separation                   | **Critical**                               |
| Target-specific permissions                                  | **Critical**                               |
| Cross-tenant execution prohibited                            | **Critical**                               |
| Optimistic concurrency                                       | **Critical**                               |
| External-side-effect idempotency                             | **Critical**                               |
| Audit/outbox integration                                     | **Required**                               |
| Partial dependency failure handling                          | **Critical**                               |

---

# 8. Consolidation

Design 127 has substantial overlap with Publishing, Outreach, Integrations, Placement Verification and Reporting, so its main risk is becoming a vague generic “Campaign” engine.

**Design 032 / Design 127 backend duplication**
Two Distribution engines diverge.

**DistributionCampaign / Publication conflation**
Publishing and downstream promotion become one entity.

**DistributionCampaign / OutreachCampaign conflation**
Media distribution and sales outreach share dangerous generic Campaign semantics.

**Campaign / CampaignVersion conflation**
Live execution plan becomes mutable.

**Latest CampaignVersion / active execution Version conflation**
Draft changes alter ongoing executions.

**Distribution source / latest Publication conflation**
Campaign history changes after new release.

**Publication v4 / Distribution v3 lineage conflation**
Cannot prove what was actually promoted.

**DistributionContentReference / source content conflation**
Campaign starts editing editorial Publication state.

**Source content / channel copy conflation**
Promotional payload and article/media content merge.

**DistributionItem / Campaign conflation**
Multi-channel details disappear.

**DistributionItem / Task conflation**
Campaign execution becomes generic work management.

**DistributionItem / ChannelExecution conflation**
Planned placement and actual attempt merge.

**DistributionChannel / channel enum conflation**
Specific accounts/properties cannot be distinguished.

**DistributionChannel / PublicationTarget conflation**
Canonical publishing destination and promotion destination merge.

**DistributionChannel / integration credential conflation**
Secrets leak into campaign records.

**DistributionSchedule / PublicationSchedule conflation**
Publishing time and promotion time become one schedule.

**Schedule / Execution conflation**
Intended timing becomes side-effect evidence.

**Execution / ProviderEvent conflation**
External callbacks overwrite internal attempt identity.

**Provider accepted / Placement created conflation**
API response is treated as actual placement.

**Placement created / Placement verified conflation**
Provider object exists but content may be wrong/unavailable.

**Placement URL / Placement identity conflation**
Bare URL becomes distribution truth.

**Publishing verification / Distribution verification conflation**
Canonical article release and downstream promotional placement lose semantics.

**One verified Placement / Campaign completed conflation**
Other required channels disappear.

**Required / optional channel conflation**
Campaign completion becomes inaccurate.

**Partial execution / Campaign failure conflation**
Successful channels are lost.

**Campaign completed / performance measurement completed conflation**
Metrics may continue accumulating.

**Campaign completed / Final Report generated conflation**
Design 130 is bypassed.

**Provider failure / Campaign cancelled conflation**
Retryable one-channel issue kills campaign.

**Retryable failure / outcome unknown conflation**
Blind retry duplicates posts/placements.

**Reconciliation / Retry conflation**
Observation causes new external side effect.

**Retry / newest CampaignVersion conflation**
Different copy/content gets distributed.

**Retry / newest PublicationVersion conflation**
Campaign suddenly promotes different source content.

**Retry / correction/repost conflation**
Historical intent becomes ambiguous.

**Provider callback duplicate / duplicate Placement conflation**
Repeated webhook creates several placement records.

**Out-of-order callback / state regression conflation**
Verified placement becomes processing.

**Manual Placement / provider Placement conflation**
Human-entered evidence looks provider-generated.

**Manual verification / independent verification conflation**
Confidence/provenance disappears.

**Verification unavailable / Placement missing conflation**
Infrastructure outage appears as failed distribution.

**Placement verified / performance available conflation**
Metrics absence becomes zero performance.

**Zero metric / unavailable metric conflation**
Reporting lies.

**Metric snapshot / current metric conflation**
Stale performance is shown as live.

**Campaign performance / analytics metric definition conflation**
Local formulas disagree with Design 038.

**Publication corrected / Distribution automatically rewritten conflation**
Historical placements change source version.

**Publication taken down / historical Placement deleted conflation**
Past evidence disappears.

**Project archived / Campaign deleted conflation**
Historical distribution is lost.

**Project completed / Distribution completed conflation**
Delivery lifecycle and media promotion merge.

**Client Distribution view / internal Campaign state conflation**
Operational errors/retries leak externally.

**Client visible link / unverified Placement URL conflation**
Portal shows unsafe/unconfirmed placement.

**Integration health / Campaign lifecycle conflation**
Provider outage marks campaign incomplete incorrectly.

**Integration administrator / distribution publisher conflation**
Credential admin gets external execution authority.

**Campaign manager / provider credential admin conflation**
Operational user sees secrets.

**Distribution permission / Publishing permission conflation**
Promoter gains canonical release authority.

**Distribution permission / Outreach permission conflation**
Media ops user gains sales-message authority.

**Activity entry / Placement evidence conflation**
“Distributed to LinkedIn” text substitutes canonical Placement.

**Audit Event / ChannelExecution conflation**
Governance history becomes external attempt truth.

**Search index / Campaign state conflation**
Stale projection controls execution.

**Generic `Campaign` table**
Sales Outreach and Distribution semantics collapse.

**Generic `distributed = true` boolean**
Cannot represent channels, executions, Placements or verification.

**Generic `distribution_status` string**
Campaign, Item, Execution, Verification and performance collapse.

**Generic `placement_url` field**
No source/version/channel/verification lineage.

**127/032 duplicate Distribution backend**
Foundation forks.

**127/073 duplicate Client Distribution truth**
Portal and Team Workspace disagree.

**127/090 duplicate Outreach Campaign engine**
Sales and Distribution campaigns become indistinguishable.

**127/124 duplicate Publication execution**
Distribution starts republishing content.

**127/126 duplicate Publishing Schedule**
Promotion timing alters publication schedule.

**127/128 duplicate ChannelExecution/Placement state**
Campaign and Detail disagree.

**127/129 duplicate Verification/Metric state**
Management and Performance screens calculate different truth.

**127/130 duplicate Report state**
Campaign completion writes final report directly.

**127/139–140 duplicate Integration state**
Distribution stores provider credentials/health separately.

No additional screen is required.

These are **canonical DistributionCampaign identity, exact source/version pinning, CampaignVersion immutability, DistributionItem/Execution separation, channel identity, external side-effect idempotency, Placement/Verification provenance, partial multi-channel state, performance boundaries, Outreach/Publishing separation, and client-safe projection requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL DISTRIBUTION CAMPAIGN PLANNING, MULTI-CHANNEL EXECUTION & PLACEMENT-ORCHESTRATION ANCHOR**

**Domain directive:**
**Publication ≠ DistributionCampaign ≠ DistributionCampaignVersion ≠ DistributionContentReference ≠ DistributionItem ≠ DistributionChannel ≠ DistributionSchedule ≠ ChannelExecution ≠ ProviderEvent ≠ Placement ≠ PlacementVerification ≠ PerformanceMetric ≠ OutreachCampaign ≠ PublicationTarget.**

**Foundation directive:**
Design 032 remains the single canonical Distribution domain. Design 127 is its campaign-management and multi-channel execution surface, not a parallel backend.

**Campaign directive:**
`DistributionCampaign` is stable distribution identity. Where campaign plans materially evolve, `DistributionCampaignVersion` freezes the exact content/channel plan used by external executions.

**Version directive:**
active/executing CampaignVersion and newest Draft version may differ. Existing ChannelExecutions always retain the exact version that produced them.

**Publishing directive:**
Designs 031/124–126 remain canonical Publication authority. Distribution consumes exact eligible PublicationVersion/verified Placement references and never republishes or edits the Publication implicitly.

**Eligibility directive:**
one `DistributionEligibilityResolver` determines whether an exact source artifact/publication is currently eligible for campaign use. Eligibility never starts distribution automatically.

**No-latest directive:**
Campaign creation/execution never resolves `latest Publication` or `latest campaign plan` implicitly. Exact source and campaign versions are pinned.

**Historical-source directive:**
later Publication correction/release never rewrites an earlier DistributionCampaign's source identity or existing Placements.

**Outreach directive:**
DistributionCampaign and OutreachCampaign remain separate bounded contexts. Their UI primitives may be reused; their entities, enrolments, recipients, executions, metrics, replies and permissions must never be merged into a generic Campaign engine.

**Item directive:**
`DistributionItem` represents one planned channel/content unit and remains distinct from canonical Task and actual ChannelExecution.

**Channel directive:**
`DistributionChannel` identifies a concrete distribution destination/account/property and remains distinct from generic channel taxonomy, PublicationTarget and provider credentials.

**Schedule directive:**
if distribution scheduling is present, it uses a separate canonical DistributionSchedule bound to the exact CampaignVersion/DistributionItem. PublicationSchedule is never reused for downstream promotion.

**Payload directive:**
channel-specific promotional copy/media/link payloads are versioned/snapshotted before external execution so later campaign edits cannot alter past executions.

**Execution directive:**
each external side effect creates an append-oriented `ChannelExecution` with exact CampaignVersion, DistributionItem, Channel, payload and execution lineage.

**Provider directive:**
provider-specific execution is isolated behind a `DistributionChannelAdapterRegistry`; provider quirks and credentials do not spread through Campaign domain code.

**Credential directive:**
authentication tokens, passwords and secrets remain in secure Integration infrastructure and are never persisted into DistributionCampaign, DistributionItem, ChannelExecution or frontend payloads.

**Idempotency directive:**
Campaign creation/versioning, scheduling, ChannelExecution, callbacks, reconciliation, retry, manual placement and verification are replay-safe.

**External-idempotency directive:**
provider idempotency mechanisms are used where possible, with internal execution keys/locks where provider support is absent.

**Provider-event directive:**
provider callbacks/events are immutable normalized evidence with deduplication, authentication verification where supported, and out-of-order state protection.

**Outcome-unknown directive:**
if an external execution may have succeeded but confirmation was lost, it becomes `OUTCOME_UNKNOWN`. The system must reconcile before another external attempt is allowed.

**Reconciliation directive:**
reconciliation observes provider/destination state and never itself performs another distribution action.

**Retry directive:**
retry creates a new ChannelExecution against the exact same CampaignVersion/DistributionItem/payload after a known safe retryable failure. It never uses a newer campaign or source Publication version.

**Correction directive:**
changed promotional content/source requires an explicit new campaign/item version or corrective/repost operation. Correction is never disguised as retry.

**Placement directive:**
a successful external execution may create a canonical Placement carrying exact CampaignVersion, source content, Channel and Execution lineage.

**URL directive:**
a placement URL alone is never Placement truth; the system preserves target/provider identity, source lineage and verification evidence.

**Verification directive:**
PlacementVerification proves the downstream placement rather than the canonical Publication itself. Publishing Verification and Distribution Verification remain separately typed even if they share verification infrastructure.

**Verification-provenance directive:**
automated verification, provider-reported success, and manual verification/override remain separately identified by method/actor/evidence.

**SSRF directive:**
any server-side placement URL verification must use strict safe-fetch controls and never follow arbitrary user/provider URLs into private/internal networks.

**Freshness directive:**
current Placement verification and performance observations preserve timestamps/freshness. Historical verification remains evidence but does not guarantee present availability forever.

**Partial-campaign directive:**
multi-channel partial success is first-class. One failed/unknown channel does not erase successful verified Placements on other channels.

**Required-channel directive:**
Campaign aggregate state is based on explicit required/optional channel/item policy rather than raw counts or first-success logic.

**Aggregate directive:**
one `DistributionCampaignStateResolver` computes campaign operational state. Frontend badges/counts never become canonical.

**Performance directive:**
Design 129/Design 038 metric foundations remain authoritative for Placement performance observations and aggregation. Design 127 consumes compact summaries only.

**Metric directive:**
zero performance, unavailable metrics, stale metrics, provider-estimated metrics and verified metric observations remain distinguishable.

**Completion directive:**
DistributionCampaign completion means campaign execution requirements are satisfied according to policy. It does not mean Project completion, Publication change, final performance period closure or Final Report generation.

**Client directive:**
Design 073 consumes only permission-safe Campaign/Placement/performance projections and never raw provider events, internal retries, credentials, or unverified placement URLs as client truth.

**Detail directive:**
Design 128 must reuse these exact canonical DistributionItem, ChannelExecution and Placement identities for detailed placement investigation.

**Verification/performance directive:**
Design 129 must reuse the same Placement/Verification/MetricObservation identities and deepen them rather than building a second distribution analytics backend.

**Report directive:**
Design 130 must build a frozen/reconstructable final outcome report over exact Campaign/Version/Placement/Metric evidence. Campaign completion cannot create or mutate report truth directly.

**Archive directive:**
Design 123 Project archive does not delete DistributionCampaigns, Placements or performance history. Archived Project state remains historical context only.

**Publishing-correction directive:**
when a source Publication changes/takes down, publishing emits canonical events; Distribution evaluates affected campaigns/placements explicitly and never silently rewrites historical source references.

**Integration directive:**
Designs 139–140 remain connection/health authority. Distribution may consume safe provider-health information but never owns integration credentials or lifecycle.

**Permissions directive:**
campaign read/edit, activation, channel execution, retry, correction, manual verification and Integration administration remain independently server-authorized.

**Target-permission directive:**
authorization may be channel-specific; ability to execute one configured destination does not grant every provider/account.

**Concurrency directive:**
campaign version changes, scheduling, executions, retries, source updates and provider callbacks use revision/transactional coordination so external actions cannot race into duplicate or ambiguous Placements.

**Activity directive:**
Design 119 projects meaningful Distribution events but never replaces CampaignVersion, Execution, Placement or verification evidence.

**Audit directive:**
campaign activation, plan/version changes, external execution, retries, manual placement/verification, correction and cancellation produce actor/version/channel-aware Design-039 Audit evidence.

**Caching directive:**
immutable historical CampaignVersions/Executions/ProviderEvents can be strongly cached; current authorization, Placement verification, Integration health and performance summaries remain freshness/revision-aware.

**Partial-failure directive:**
source eligibility, campaign core, channel/provider connection, execution, verification and metric services may fail independently. `Unavailable` can never become `Failed`, `Verified`, `0 performance`, or safe-to-retry without evidence.

**Performance directive:**
initial Campaign Management should use compact channel/execution/placement summaries with lazy provider-event and metric-detail loading rather than retrieving full history on every open.

**Future-reuse directive:**
Design **128 — Distribution Channel / Placement Detail** must drill into one canonical Distribution channel/item/Placement context with exact CampaignVersion, source content, execution Attempts, provider evidence and PlacementVerification. It must not create a separate `DistributionPlacementDetail` business entity or alternate verification engine.

**Overlap directive:**
Designs **032, 055, 073, 090, 124–140** must preserve one continuous **exact verified source Publication/artifact → DistributionCampaign → immutable CampaignVersion → DistributionItem + concrete DistributionChannel → optional DistributionSchedule → idempotent ChannelExecution → ProviderEvent → Placement → PlacementVerification → performance observations → client-safe projections → frozen final report** lineage.

**Consolidation directive:**
**STANDARDIZE ONE DISTRIBUTION-CAMPAIGN FOUNDATION — DESIGN-032 CANONICAL DISTRIBUTIONCAMPAIGN IDENTITY + IMMUTABLE EXECUTING CAMPAIGN VERSIONS + EXACT VERIFIED SOURCE REFERENCES + DISTINCT DISTRIBUTIONITEM/CHANNEL/EXECUTION/PLACEMENT IDENTITIES + SEPARATE DISTRIBUTION SCHEDULING + IDEMPOTENT PROVIDER ADAPTER EXECUTION + OUTCOME-UNKNOWN RECONCILIATION BEFORE RETRY + EXPLICIT REQUIRED/OPTIONAL MULTI-CHANNEL AGGREGATION + VERSIONED PLACEMENT VERIFICATION + PROVENANCE/FRESHNESS-AWARE PERFORMANCE SUMMARY + STRICT PUBLISHING/OUTREACH/INTEGRATION/CLIENT-REPORTING SEPARATION — AND NEVER ALLOW GENERIC CAMPAIGN TABLES, `LATEST` PUBLICATION REFERENCES, PROVIDER ACCEPTANCE, BARE PLACEMENT URLS, RETRY BUTTONS, ACTIVITY STRINGS, ZERO METRICS OR CLIENT-FACING BADGES TO SUBSTITUTE FOR OR REWRITE CANONICAL CAMPAIGN VERSION, EXECUTION, PLACEMENT, VERIFICATION OR PERFORMANCE TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **127 / 153** |
| **PASS**                                   |                        **127** |
| **STANDARDIZE decisions**                  |                        **125** |
| **Potential implementation-overlap flags** |                        **118** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**127 / 153 = 83.0% audited.**

### Canonical Distribution architecture after Design 127

```text
PUBLICATION PUB-100
Release v3
VERIFIED LIVE
       │
       ↓
Distribution Campaign DC-20
       │
       ↓
Campaign Plan v2
       │
   ┌───┼────────────┐
   ↓   ↓            ↓
 LinkedIn        Newsletter       Partner
   │                │               │
Execution         Scheduled      Execution
   │                                │
Placement                         OUTCOME
   │                              UNKNOWN
Verification
   │
VERIFIED
```

The strongest source-version rule is explicit:

```text
Campaign DC-20
uses Publication v3.

Later:
Publication v4 becomes live.

RESULT:

DC-20 history still uses v3.

Existing executions and placements
remain linked to v3.

v4 enters Distribution only through
an explicit new/revised campaign plan.
```

Distribution and Outreach remain separate:

```text
OUTREACH CAMPAIGN
Lead → Email → Reply → Deal

            ≠

DISTRIBUTION CAMPAIGN
Publication → Channel → Placement
→ Verification → Performance
```

External-execution safety also remains mandatory:

```text
Distribution execution sent
        ↓
network response lost
        ↓
Could have created placement
Could have failed

STATE:
OUTCOME UNKNOWN

NEXT:
reconcile

NOT:
blind retry
```

And Placement truth stays layered:

```text
Provider accepted
        ≠
Placement created

Placement created
        ≠
Placement verified

Placement verified
        ≠
Performance data available

Performance unavailable
        ≠
0 performance
```

## Next Sequential Audit Target

### **Design 128 — Distribution Channel / Placement Detail**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
