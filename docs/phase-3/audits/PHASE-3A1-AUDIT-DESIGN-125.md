# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 125 — Publication Detail / Release Management

Design 125 should become the **canonical Team Workspace single-Publication 360, exact-version release management, target-level execution history, verification, correction, and live-state investigation surface** built directly on the publishing foundation established by **Design 031** and operationalized by **Design 124**.

Design 125 must **not create a second `PublicationDetail` business entity, a second release-state model, or a second publishing backend**. It should drill into one canonical `Publication` and expose the complete authoritative lineage from exact source artifact to PublicationVersion, PublicationTarget, Schedule, Attempt, ProviderEvent, Verification, and live Placement.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Publication ≠ PublicationVersion ≠ PublicationArtifactReference ≠ PublicationTarget ≠ PublicationSchedule ≠ PublicationAttempt ≠ ProviderEvent ≠ PublicationVerification ≠ LivePlacement ≠ ReleaseCorrection ≠ Takedown/Unpublish Operation ≠ DistributionCampaign ≠ Client Live-Link Projection ≠ PublicationDetailView.**

The central implementation rule is:

> **Design 125 explains and manages one Publication without ever flattening its versions, targets, attempts, provider evidence, and verified live state into one mutable “published” record. Every release action must identify the exact PublicationVersion and exact Target. Historical Attempts and verified placements remain immutable evidence. Corrections, republishing, target removal, or takedown—if present in the frozen design—must be explicit new operations with lineage, never destructive edits to already-executed history.**

---

# 1. Classification

| Audit field                        | Classification                                                                                                                                                                                     |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                      | **125**                                                                                                                                                                                            |
| **Canonical name**                 | **Publication Detail / Release Management**                                                                                                                                                        |
| **Product area**                   | Team Workspace / Publishing / Release Management                                                                                                                                                   |
| **User surface**                   | **Authenticated Team Workspace**                                                                                                                                                                   |
| **Screen class**                   | Entity Detail Variant / Publication 360 / Release Operations                                                                                                                                       |
| **Classification**                 | **Canonical Publication 360, Exact-Version Release, Target Execution & Verified-Live-State Anchor**                                                                                                |
| **Primary purpose**                | Inspect and manage one canonical Publication across its release versions, destinations, schedules, execution attempts, provider events, verified live placements, corrections, and release history |
| **Canonical Publication identity** | **Publication** — Design 031                                                                                                                                                                       |
| **Queue dependency**               | Design 124                                                                                                                                                                                         |
| **Release identity**               | `PublicationVersion`                                                                                                                                                                               |
| **Publishable source**             | exact `PublicationArtifactReference`                                                                                                                                                               |
| **Destination identity**           | `PublicationTarget`                                                                                                                                                                                |
| **Schedule identity**              | `PublicationSchedule`                                                                                                                                                                              |
| **Execution identity**             | `PublicationAttempt`                                                                                                                                                                               |
| **Provider evidence**              | `ProviderEvent`                                                                                                                                                                                    |
| **Verification identity**          | `PublicationVerification`                                                                                                                                                                          |
| **Live result**                    | `LivePlacement` / verified destination reference                                                                                                                                                   |
| **Correction lineage**             | explicit new PublicationVersion / ReleaseCorrection where needed                                                                                                                                   |
| **Takedown boundary**              | explicit operation if frozen design supports it                                                                                                                                                    |
| **Source Deliverable dependency**  | Design 114                                                                                                                                                                                         |
| **Approval dependency**            | Design 115                                                                                                                                                                                         |
| **Client publishing projection**   | Design 072                                                                                                                                                                                         |
| **Publishing Calendar dependency** | Design 126                                                                                                                                                                                         |
| **Distribution dependency**        | Designs 127–130                                                                                                                                                                                    |
| **Integration dependency**         | Designs 139–140                                                                                                                                                                                    |
| **Activity dependency**            | Design 119                                                                                                                                                                                         |
| **Audit dependency**               | Design 039                                                                                                                                                                                         |
| **Primary query service**          | `PublicationDetailQueryService`                                                                                                                                                                    |
| **Publication service**            | canonical `PublicationService`                                                                                                                                                                     |
| **Version service**                | `PublicationVersionService`                                                                                                                                                                        |
| **Target service**                 | `PublicationTargetService`                                                                                                                                                                         |
| **Schedule service**               | `PublicationScheduleService`                                                                                                                                                                       |
| **Execution service**              | `PublicationExecutionService`                                                                                                                                                                      |
| **Verification service**           | `PublicationVerificationService`                                                                                                                                                                   |
| **Aggregate state resolver**       | `PublicationAggregateStateResolver`                                                                                                                                                                |
| **Correction service**             | `PublicationReleaseCorrectionService` if required                                                                                                                                                  |
| **Parent shell**                   | `InternalAppShell` — Design 001                                                                                                                                                                    |
| **Auth**                           | Required                                                                                                                                                                                           |
| **Authorization**                  | Active OrganizationMembership + Publication/Target/Release permissions                                                                                                                             |
| **Implementation priority**        | **Critical External Release Integrity / Historical Traceability / Recovery Safety**                                                                                                                |
| **Reuse level**                    | **Extremely High across Queue, Calendar, Client live links, Distribution, Reporting and Audit**                                                                                                    |

Design 125 should answer:

> **“What exact Publication is this, which release version is current, which version was actually sent to each destination, what happened on every target, what provider evidence exists, what is independently verified live, which failures or uncertain outcomes remain unresolved, and what exact corrective action—if any—is safe to perform next?”**

Canonical composition:

```text
Publication PUB-100
      │
      ├── PublicationVersion v1
      ├── PublicationVersion v2
      └── PublicationVersion v3
                │
                ├── Source Artifact DV-7
                ├── Release metadata snapshot
                └── exact payload definition
                         │
           ┌─────────────┼─────────────┐
           ↓             ↓             ↓
       Target A       Target B       Target C
           │             │             │
        Schedule       Schedule       Schedule
           │             │             │
        Attempt(s)     Attempt(s)     Attempt(s)
           │             │             │
      ProviderEvent   ProviderEvent   ProviderEvent
           │             │             │
      Verification   Verification   Verification
           │             │             │
      LivePlacement  UNKNOWN        FAILED
```

---

# 2. Reuse

## Design 031 remains the sole Publication identity

Design 125 must not create:

```text
PublicationDetail
ReleaseDetail
PublishedItem
LivePublication
```

as independent business entities.

Correct:

```text
Publication PUB-100

same identity in:
Design 031
Design 124
Design 125
Design 126
Design 072 client projection
```

---

## Design 124 and Design 125 share one backend

### Design 124

Operational queue across many Publications.

### Design 125

Deep detail for one Publication.

Correct:

```text
PublishingQueueItem
      ↓
Publication PUB-100
      ↓
PublicationDetailView
```

The queue row and detail view are projections over the same canonical source.

---

## PublicationDetailView ≠ Publication

Permanent.

`PublicationDetailView` is a composition/read model.

All mutations route to source services.

---

## Publication ≠ PublicationVersion

Critical.

One Publication can accumulate several release versions over time.

Example:

```text
PUB-100
├── v1 published
├── v2 corrective release
└── v3 draft
```

Do not overwrite v1 because v3 exists.

---

## Current version ≠ latest created version ≠ published version

Permanent.

Valid:

```text
latest-created = v4
current-approved-release = v3
last-verified-live = v3
historical-target-B-release = v2
```

These are different facts.

---

## PublicationVersion ≠ source Draft/Proof/File version

Critical.

The source artifact is editorial/production truth.

PublicationVersion is the release snapshot/configuration.

Example:

```text
DraftVersion DV-7
      ↓
PublicationVersion PV-3
      ↓
Website payload
```

---

## PublicationVersion can snapshot release metadata

If the publication title, slug, summary, metadata, selected media, or provider payload differs from source editorial content:

those values belong to the PublicationVersion release snapshot.

They must not be dynamically re-read from mutable source records after execution.

---

## Target remains Design 124 canonical target

Design 125 drills into exact:

```text
PublicationTarget PT-10
```

No separate detail-only destination identity.

---

## Target ≠ channel

Permanent.

A publication may target multiple properties on the same channel/provider.

---

## Schedule remains canonical

Design 126 later consumes the same `PublicationSchedule`.

Design 125 must not maintain a target-detail-only `scheduledAt` field independent from that schedule.

---

## Attempt remains canonical execution evidence

A Publication Target can have:

```text
Attempt A1 → failure
Attempt A2 → accepted
Attempt A3 → corrective republish
```

Do not compress them into:

```text
target.lastStatus = SUCCESS
```

as the only history.

---

## ProviderEvent remains evidence

Provider callbacks/status records remain immutable normalized evidence.

Design 125 can show them.

It does not edit them.

---

## Verification remains separate from Attempt success

Critical.

The Detail screen is where this distinction should become especially explicit.

Example:

```text
Attempt A2:
provider accepted

Verification:
MISMATCH
```

This means:

> provider reported success, but externally verified content is wrong.

It does **not** mean successfully published.

---

## LivePlacement ≠ URL string

Permanent.

A verified placement should connect:

* Target;
* PublicationVersion;
* provider object;
* live URL/reference;
* verification evidence.

---

## Design 072 consumes client-safe verified live state

Design 125 may show:

* internal provider IDs;
* retries;
* failures;
* reconciliation notes.

Design 072 must only show:

* safe Publication identity;
* verified release;
* verified public link;
* client-safe publication date/state.

---

## Design 114 remains source Deliverable authority

Design 125 can open the exact source artifact.

It cannot modify Deliverable readiness or source version state directly.

---

## Design 115 remains Approval authority

If a release Version required Approval:

Design 125 references exact Approval evidence.

It must never carry its own:

```text
approvedForPublication = true
```

truth independent of Design 115.

---

## Design 126 remains Calendar projection

Design 125 may edit schedule if frozen design allows it.

The mutation still uses `PublicationScheduleService`.

Calendar will then reflect it.

---

## Distribution remains separate

A verified Publication may become Distribution-eligible.

Design 125 may show:

> Distribution not started / linked campaign

if frozen design contains that relation.

But it cannot manage Distribution placements/performance as Publication state.

---

# 3. Entities

## Publication

Stable canonical identity.

Conceptually:

```text
Publication
├── id
├── organizationId
├── source context
├── publication type
├── lifecycle
├── currentDraftVersionId?
├── currentReleaseVersionId?
├── createdAt
└── revision
```

---

## PublicationVersion

Immutable release definition.

Conceptually:

```text
PublicationVersion
├── id
├── publicationId
├── versionNumber
├── exactSourceArtifactReference
├── releaseMetadataSnapshot
├── payloadDefinition
├── createdBy
├── createdAt
├── lifecycle
└── integrityFingerprint?
```

---

## Draft PublicationVersion may be editable

Before schedule/execution:

target-safe draft edits may remain possible according to frozen UI.

After release intent is committed:

material content should freeze.

---

## Scheduled PublicationVersion should not mutate

Critical.

If metadata/content must change:

create:

```text
v4
```

rather than modifying scheduled:

```text
v3
```

in place.

---

## PublicationVersion lifecycle ≠ Publication lifecycle

Permanent.

Example:

```text
Publication = ACTIVE
v1 = HISTORICAL
v2 = VERIFIED_LIVE
v3 = DRAFT
```

---

## PublicationArtifactReference

Typed exact source relation.

Conceptually:

```text
PublicationArtifactReference
├── sourceType
├── sourceId
├── exactVersionId
├── artifactRole
└── sourceFingerprint/reference
```

---

## PublicationTarget

Stable destination relation.

Conceptually:

```text
PublicationTarget
├── id
├── publicationId
├── targetType
├── property/account reference
├── integrationConnectionId
├── destination configuration
├── requirement class
├── lifecycle
└── revision
```

---

## Target requirement class

Important:

```text
REQUIRED
OPTIONAL
```

or policy equivalent.

This influences aggregate Publication completion.

---

## Target lifecycle ≠ attempt state

A Target may remain configured while its latest Attempt is failed.

---

## PublicationSchedule

Exact intended execution.

Conceptually:

```text
PublicationSchedule
├── id
├── publicationId
├── publicationVersionId
├── targetId
├── scheduledFor
├── timezone
├── lifecycle
├── createdBy
├── createdAt
└── revision
```

---

## Schedule history

If rescheduled:

preserve historical evidence where materially relevant.

Do not overwrite the prior scheduled time with no trace.

---

## PublicationAttempt

Append-oriented external execution attempt.

Conceptually:

```text
PublicationAttempt
├── id
├── publicationId
├── publicationVersionId
├── targetId
├── scheduleId?
├── parentAttemptId?
├── purpose
├── attemptNumber
├── executionKey
├── initiatedBy
├── initiatedAt
├── outcomeClass
├── completedAt?
└── revision
```

---

## Attempt purpose

Useful distinction:

```text
INITIAL_RELEASE
RETRY
CORRECTIVE_REPUBLISH
MANUAL_REEXECUTION
```

where product semantics require it.

Do not use one integer alone to explain why an Attempt exists.

---

## Retry Attempt ≠ corrective republish

Critical.

### Retry

Same exact content/version after a known retryable failure.

### Corrective republish

New exact PublicationVersion intended to replace/fix earlier live content.

---

## ProviderEvent

Immutable normalized external event.

Must retain:

* external event ID;
* provider object ID;
* occurredAt;
* receivedAt;
* normalized type;
* signature verification metadata where supported.

---

## Raw provider payload

If retained for investigation:

store securely with bounded retention/access.

Do not expose raw secrets or sensitive provider data in normal UI.

---

## PublicationVerification

Exact target/version verification evidence.

Conceptually:

```text
PublicationVerification
├── id
├── targetId
├── publicationVersionId
├── attemptId?
├── verificationMethod
├── result
├── verifiedAt
├── evidence
├── freshness
└── verifier identity
```

---

## Manual verification ≠ automated verification

If manual verification is supported:

preserve:

```text
verificationMethod = MANUAL
actor
reason/evidence
```

rather than pretending automation verified it.

---

## Verification override ≠ verified fact

Critical.

If an operator overrides an uncertain state:

the system should preserve:

> manually accepted/overridden

separately from:

> independently verified.

Do not turn governance override into fake technical evidence.

---

## LivePlacement

Conceptually:

```text
LivePlacement
├── id
├── publicationId
├── publicationVersionId
├── targetId
├── providerObjectId
├── liveUrl/reference
├── firstVerifiedAt
├── lastVerifiedAt?
├── lifecycle
└── revision
```

---

## LivePlacement lifecycle

Could include conceptually:

```text
LIVE
MISSING
REPLACED
TAKEN_DOWN
UNKNOWN
```

Exact values Phase 3D.

---

## Placement ≠ PublicationVersion

A release version can have several placements.

---

## Placement replaced by new version

Example:

```text
Target Website:
v3 placement verified Aug 20
v4 corrective release verified Aug 22
```

Do not rewrite v3 as if it never existed.

Preserve placement/version history.

---

## ReleaseCorrection

If the frozen design includes correction/replacement semantics:

an explicit correction relation is safer:

```text
PublicationReleaseCorrection
├── publicationId
├── priorPublicationVersionId
├── replacementPublicationVersionId
├── reason
├── createdBy
└── createdAt
```

This may also be derived from version lineage rather than a separate table.

Do not over-persist if not needed.

---

## Correction ≠ editing history

Absolute.

---

## Takedown / Unpublish operation

If frozen Design 125 includes removal from live destinations:

model it as an explicit operation, not a boolean flip.

Conceptually:

```text
PublicationTakedownRequest
or
PublicationTakedownAttempt
```

with:

* target;
* exact placement;
* reason;
* actor;
* provider attempt;
* verification.

Do not invent this if absent from frozen design.

---

## Unpublish ≠ cancel schedule

Permanent.

---

## Unpublish ≠ delete Publication

Permanent.

Historical release evidence remains.

---

## Takedown verified ≠ provider accepted takedown

Same provider-verification distinction applies in reverse.

---

# 4. Permissions

Design 125 should conceptually distinguish:

```text
publication.read
publicationVersion.read
publicationVersion.create
publicationVersion.editDraft

publicationTarget.read
publicationTarget.manage

publicationSchedule.read
publicationSchedule.manage

publication.publish
publication.retry

publicationVerification.read
publicationVerification.manualConfirm
publicationVerification.override

publication.correct
publication.takedown
```

Exact keys belong to Phase 3D.

---

## Publication read ≠ version edit

Permanent.

---

## Version edit ≠ Publish

Critical.

---

## Publish ≠ retry universally

Potentially separate operational permission.

---

## Retry ≠ correction authority

Permanent.

Retry sends same exact release intent.

Correction creates/uses another exact version.

---

## Schedule manage ≠ Target manage

Permanent.

---

## Target manage ≠ provider credential manage

Absolute.

---

## Verification read ≠ manual verification authority

Permanent.

---

## Manual verification ≠ override authority

Potentially stronger distinction.

---

## Override ≠ publish authority

Permanent.

---

## Takedown authority should be stronger than ordinary read/edit

If present.

Removing public content is externally consequential.

---

## Takedown ≠ delete permission

Absolute.

---

## Client access ≠ internal release management

Permanent.

---

## Project owner ≠ publisher universally

Permanent.

---

## Editor ≠ release operator

Critical separation of duties.

---

## Integration administrator ≠ publisher

Permanent.

---

## Direct PublicationVersion IDs reauthorize

Absolute.

---

## Direct Placement IDs reauthorize

Permanent.

---

## Provider event detail may require sensitive-debug permission

Raw operational provider evidence should not be exposed broadly.

---

## Cross-tenant correction/takedown prohibited

Absolute.

---

# 5. States

Design 125 must keep **Publication lifecycle, Version lifecycle, Target state, Schedule state, Attempt state, Provider evidence, Verification state, Placement state, correction state, and takedown state** separate.

### Publication aggregate

Conceptually:

```text
Draft
Ready
Scheduled
In Progress
Partially Released
Verified Released
Attention Required
Cancelled
```

### Version

```text
Draft
Ready
Scheduled
Executing
Verified Live
Historical
Superseded
```

### Target

```text
Configured
Scheduled
Publishing
Provider Accepted
Verification Pending
Verified
Failed
Outcome Unknown
Disabled
```

### Attempt

```text
Pending
Running
Known Success at Provider
Retryable Failure
Permanent Failure
Outcome Unknown
Cancelled
```

### Placement

```text
Not Established
Live
Missing
Replaced
Taken Down
Unknown
```

### Correction

```text
Not Required
Drafted
Ready
Scheduled
Executing
Verified
Failed
```

if correction workflow exists.

These must never collapse into one generic `release.status`.

---

## Publication verified ≠ all historical versions verified

Permanent.

It means current required release policy is satisfied.

---

## Historical version ≠ invalid version

Permanent.

v2 may be valid evidence of what was live before v3.

---

## Superseded ≠ deleted

Absolute.

---

## Target disabled ≠ prior placement removed

Critical.

Disabling future execution on a target does not automatically take existing content offline.

---

## Provider connection disconnected ≠ current placement removed

Permanent.

Existing content may still be publicly live.

---

## Provider Attempt failed ≠ Placement missing

Permanent.

A prior successful placement may remain live while a later update attempt fails.

---

## Correction failed ≠ prior live release removed

Critical.

Example:

```text
v3 live
v4 corrective Attempt failed
```

Result:

> v3 may still be live.

Not:

> Publication offline.

---

## Takedown requested ≠ taken down

Absolute.

---

## Takedown provider accepted ≠ verified removed

Critical.

---

## Placement missing ≠ Publication deleted

Permanent.

---

## Verification stale ≠ Verification failed

Permanent.

---

## New target added ≠ entire Publication becomes unpublished automatically

Aggregate policy must decide whether the new target is:

* required;
* optional;
* future.

---

## New required target can affect aggregate readiness

But old verified targets remain verified historical facts.

---

## State Coverage

Design 125 inherits Design 150 plus:

```text
Publication Detail Loading
Publication Detail Available
Publication Detail Restricted
Publication Detail Partial
Publication Detail Unavailable

Publication Draft
Publication Ready
Publication Scheduled
Publication In Progress
Publication Partially Released
Publication Verified Released
Publication Attention Required
Publication Cancelled

Version Draft
Version Ready
Version Scheduled
Version Executing
Version Verified Live
Version Historical
Version Superseded
Newer Version Available

Target Configured
Target Scheduled
Target Publishing
Target Provider Accepted
Target Verification Pending
Target Verified
Target Failed
Target Outcome Unknown
Target Disabled

Attempt Pending
Attempt Running
Attempt Provider Success
Attempt Retryable Failure
Attempt Permanent Failure
Attempt Outcome Unknown
Attempt Cancelled

Provider Event Verified
Provider Event Duplicate
Provider Event Out of Order
Provider Event Unmatched
Provider Event Restricted

Verification Not Started
Verification Pending
Verification Verified
Verification Mismatch
Verification Unknown
Verification Stale
Verification Unavailable

Placement Not Established
Placement Live
Placement Missing
Placement Replaced
Placement Taken Down
Placement State Unknown

Correction Not Required
Correction Draft
Correction Scheduled
Correction In Progress
Correction Verified
Correction Failed

Takedown Not Requested
Takedown Requested
Takedown Provider Accepted
Takedown Verified
Takedown Failed
Takedown Outcome Unknown

Publication Updated Elsewhere
Version Updated Elsewhere
Target Updated Elsewhere
Schedule Updated Elsewhere
Provider Event Arrived
Verification Updated Elsewhere
Placement Updated Elsewhere
Release Conflict
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize the Publication's **exact release lineage and per-target operational truth**.

Conceptually:

```text
Publication PUB-100
↓
Current release summary
↓
Publication versions
↓
Targets
   ├── schedule
   ├── latest attempt
   ├── provider outcome
   ├── verification
   └── live placement
↓
Release history / corrections
↓
Frozen-design actions
```

Only controls actually present in the frozen Design 125 should render.

---

## Version identity must stay persistent

The user should always be able to answer:

> Which exact version am I looking at?

Avoid hiding version information when switching tabs/sections.

---

## Current release and historical versions should look different

Correct:

> v3 — Current verified release
> v2 — Historical
> v4 — Draft

not:

> three generic versions.

---

## Per-target state must remain explicit

Example:

> Website
> v3 · Verified live

> Partner Platform
> v3 · Attempt outcome unknown

This is safer than one overall “Published” header.

---

## Provider outcome vs verification

Where the provider says success but independent verification is pending:

show both.

Example:

> Provider: Accepted
> Verification: Pending

---

## Corrective release lineage should be visible

Where applicable:

> v4 corrects v3

without hiding v3.

---

## Live placement history should remain versioned

Correct:

> v2 was live Aug 1–Aug 20
> v3 verified live Aug 20

where canonical evidence supports it.

---

## Error details should be structured

Prefer:

> Authentication expired
> Retry after reconnect

or:

> Outcome unknown
> Reconcile before retry

rather than one generic:

> Failed.

---

## Tablet

Following Design 152:

* Publication/version summary remains top;
* target states become stacked cards;
* Attempts/provider details become expandable;
* live placement remains visible;
* corrective actions remain isolated.

---

## Mobile

Priority:

```text
Publication title
↓
Current exact release version
↓
Overall state
↓
Target cards
↓
Failed / Unknown targets
↓
Verified live links
↓
Version history
↓
Allowed corrective action
```

Do not render a desktop multi-column provider-history table at phone width.

---

## Mobile retry safety

When retry is allowed, it should make the exact scope obvious:

> Retry Website target · Release v3

not:

> Retry Publication.

---

## Accessibility

A target could communicate:

> Website target for Publication PUB-100. Release version 3 was scheduled for August 25 at 9 AM Europe/Berlin. Publication Attempt A-12 was accepted by the provider at 9:00:14. The live page was independently verified at 9:01:22 and is currently recorded as live. Release version 4 exists in draft and has not been published to this target.

where authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical detail architecture

```text
Design 125
    ↓
Authenticated Workspace Context
    ↓
PublicationDetailQueryService
    │
    ├── PublicationAdapter
    ├── PublicationVersionAdapter
    ├── ArtifactAdapter
    ├── ApprovalAdapter
    ├── TargetAdapter
    ├── ScheduleAdapter
    ├── AttemptAdapter
    ├── ProviderEventAdapter
    ├── VerificationAdapter
    ├── PlacementAdapter
    └── IntegrationHealthAdapter
    ↓
PublicationDetailView
```

All writes go through canonical publishing services.

---

## Publication Detail query

Conceptually:

```text
getPublicationDetail(
    publicationId,
    currentMembership
)
```

should:

1. authorize Publication;
2. resolve current version state;
3. load exact historical/current versions;
4. load Targets;
5. load current schedules;
6. load summarized Attempts;
7. load verification/live placements;
8. permission-filter sensitive provider data;
9. return source revisions/freshness.

---

## Avoid N+1 Attempt/Event loading

Load:

* current/latest Attempt summary for each target;
* aggregate history counts;

then lazy-load deep Attempt/provider-event history when requested.

---

## Version selection

Detail UI should request explicit:

```text
publicationVersionId
```

when showing historical release detail.

Do not interpret:

> selected index 2

as business identity.

---

## Create corrective version

If frozen design supports correction:

```text
createCorrectivePublicationVersion(
    publicationId,
    priorPublicationVersionId,
    exactSourceArtifactReference,
    correctionReason,
    expectedPublicationRevision,
    idempotencyKey
)
```

must:

1. authorize;
2. validate prior version;
3. validate exact new source;
4. preserve correction lineage;
5. create new immutable/draft PublicationVersion;
6. not alter prior Attempts/placements.

---

## Correction idempotency

Critical.

Repeated action cannot create several identical corrective versions.

---

## New version does not update current placements

Absolute.

Creating v4 only means v4 exists.

Existing v3 placements remain valid until v4 is successfully published/verified or a takedown occurs.

---

## Publish replacement version

A corrective v4 should execute through the **same** PublicationExecutionService as any other release.

No separate shortcut path.

---

## Placement transition after correction

When v4 verifies successfully on Target A:

the system may mark:

```text
v4 placement = LIVE
v3 placement = REPLACED/HISTORICAL
```

according to target semantics.

Do not delete v3 placement.

---

## Attempt history

Each target detail should provide:

```text
Attempt A1
Attempt A2
Attempt A3
```

with:

* exact version;
* initiator;
* purpose;
* provider evidence;
* outcome;
* verification.

---

## Reconciliation command

For `OUTCOME_UNKNOWN`:

```text
reconcilePublicationAttempt(attemptId)
```

should:

1. authorize;
2. query provider/live evidence;
3. ingest/normalize evidence;
4. determine known success/failure/remaining unknown;
5. update derived Attempt/Target projections;
6. avoid causing another public side effect.

---

## Reconciliation ≠ Retry

Absolute.

Reconciliation observes.

Retry executes.

---

## Manual mark published is prohibited by default

Do not provide a generic:

```text
markPublished()
```

unless the frozen business model explicitly supports manual/off-platform publication.

If off-platform/manual publication must be represented:

create explicit **manual publication evidence** with:

* exact version;
* target;
* live URL/reference;
* actor;
* timestamp;
* verification method;
* reason.

It should never pretend a provider Attempt occurred.

---

## Manual publication ≠ provider publication

Permanent.

---

## Manual verification

If frozen design allows:

```text
recordManualPublicationVerification(...)
```

must preserve:

* actor;
* method;
* evidence;
* exact version/target;
* reason.

---

## Manual verification cannot rewrite ProviderEvents

Absolute.

---

## Target configuration edit

Target modifications should be revisioned.

Changing:

* destination property;
* slug/path;
* required/optional classification;

may affect future releases.

Historical Attempts retain the exact target context used at the time.

---

## Historical target snapshot

If target configuration can change materially:

Attempts/Placements should preserve enough target snapshot/context to explain historical execution.

---

## Disable Target

Disabling a target should:

* prevent future executions;
* not remove existing live placement automatically;
* preserve history.

---

## Delete Target

Hard deletion should generally be prohibited once historical Attempts/Placements reference it.

Archive/deactivate instead.

---

## Schedule edits

Design 125 uses the same schedule commands as Design 124/126.

---

## Attempt creation cannot come from browser directly

The browser requests:

> publish/retry.

Server/service creates canonical Attempt after validation.

Do not allow:

```text
POST /attempts
```

with arbitrary target/version from untrusted client.

---

## ProviderAdapter execution

Same canonical adapter registry from Design 124.

Design 125 never calls providers directly from frontend.

---

## Secrets never enter client payload

Absolute.

---

## Provider Event normalization

Map provider-specific statuses into canonical outcome evidence while retaining raw evidence securely for investigation.

---

## Provider polling

Where callbacks do not exist, worker/service may poll provider status.

Polling state remains infrastructure; canonical ProviderEvents/Attempt evidence capture meaningful results.

---

## Verification scheduling

Verification can run:

* immediately after provider acceptance;
* after delay;
* periodically while pending;
* on manual reconcile.

Use bounded retries/backoff.

---

## Verification mismatch

Example:

```text
Expected:
PublicationVersion v3

Live page:
v2
```

Result:

```text
MISMATCH
```

not:

> Verified because URL exists.

---

## Content fingerprinting

Where practical, verification may compare stable identifiers/fingerprints:

* provider object ID;
* canonical version marker;
* content hash;
* expected metadata.

Do not require byte-identical web HTML where providers transform content.

Exact verification strategy belongs to adapters.

---

## Live URL safety

All external URLs shown to users should be normalized/validated.

Do not treat arbitrary provider callback URL fields as trusted clickable links without validation.

---

## SSRF protection

Same Design 124 requirement applies to server-side verification.

---

## Takedown flow

If frozen design supports unpublish/remove:

conceptual command:

```text
requestPublicationTakedown(
    placementId,
    reason,
    expectedRevision,
    idempotencyKey
)
```

must:

1. authorize elevated action;
2. target exact live Placement;
3. create explicit takedown Attempt;
4. call provider adapter;
5. record ProviderEvents;
6. verify removal;
7. preserve previous Publication/Placement history.

---

## Takedown idempotency

Critical.

---

## Outcome unknown applies to takedown too

If provider may have removed content but response was lost:

reconcile before retry.

---

## Takedown does not delete PublicationVersion

Absolute.

---

## Takedown does not alter source Deliverable

Absolute.

---

## Correction/takedown and Distribution

If a Publication used by an active DistributionCampaign changes or is removed:

emit canonical events.

Distribution decides how to:

* pause;
* relink;
* mark placement stale;
* continue.

Publishing should not directly mutate Distribution campaign records.

---

## Client live-link integration

When a verified placement becomes replaced/taken down:

Design 072's safe projection must update.

Client must not continue seeing a stale “Live” link as verified current state.

---

## Client historical link

Historical reports may still reference prior URL/version according to policy.

Current live-state projection and historical report snapshot remain distinct.

---

## Publication Aggregate State resolver

Central service evaluates:

* current release version;
* required targets;
* placements;
* verification;
* unresolved failures/unknown outcomes.

Frontend does not infer aggregate state.

---

## Current release version selection

The domain needs an explicit resolver/policy.

Do not simply define:

```text
max(versionNumber)
```

as current release.

A newer draft does not become the active published release.

---

## Current release pointer changes only after governed release success

Potentially:

```text
currentVerifiedReleaseVersionId = v3
```

updated after required release policy is satisfied.

Exact implementation Phase 3D.

---

## Partial correction

Example:

```text
v3 is live:
Website ✓
Platform ✓

v4 correction:
Website ✓
Platform ✕
```

Aggregate state may be:

> Partial correction / mixed versions across targets.

This must be representable.

---

## Mixed-version targets are valid operational state

Critical.

Example:

```text
Website         v4 VERIFIED
Platform        v3 VERIFIED
Partner Feed    v4 UNKNOWN
```

Never store only:

```text
publication.currentVersion = v4
```

and assume every target serves v4.

---

## Target current-live-version resolver

Each Target should resolve its currently verified live PublicationVersion independently.

---

## Queue integration

Design 124 should consume this target/aggregate data.

No separate queue calculation.

---

## Calendar integration

Design 126 consumes canonical schedules and exact versions.

---

## Distribution trigger

Only verified exact Placement/release evidence should feed downstream Distribution eligibility.

---

## Reporting

Designs 131–134 should be able to answer:

* version published;
* target;
* verification date;
* correction/takedown history.

Use canonical release records.

---

## Activity

Design 119 may project:

```text
PublicationVersionCreated
PublicationTargetAdded
PublicationAttemptRetried
PublicationVerificationSucceeded
PublicationCorrectionReleased
PublicationTakedownVerified
```

Activity remains summary.

---

## Audit

Strong Audit for:

* Publish Now;
* retry;
* manual verification;
* override;
* correction;
* target configuration change;
* takedown;
* schedule changes.

---

## Integration health

Design 125 consumes Design 140 connection health.

It does not change connection credentials itself unless explicit navigation/deep-link takes user to Integration domain.

---

## Provider troubleshooting

Detail can show normalized error category and remediation hints.

Do not expose provider secrets/raw authentication tokens.

---

## Idempotency

Required for:

* corrective-version creation;
* schedule;
* publish;
* retry;
* reconcile requests where needed;
* manual verification;
* takedown.

---

## Optimistic concurrency

Critical races:

### Two operators publish different Versions to same Target

Server enforces current intent/policy.

### One operator retries while callback confirms prior success

Retry preflight rechecks prior Attempt state.

### Target config changes during active execution

Attempt retains pinned target context/revision.

### v4 correction begins while v3 takedown begins

Server detects incompatible concurrent operations where required.

---

## Target operation lock/lease

External side effects on one Placement/Target may need serialized operation policies.

Avoid simultaneous:

```text
publish v4
takedown v3
retry v3
```

without explicit coordination.

---

## Caching

Detail caches should vary by:

```text
organizationMembershipId
publicationId
authorizationRevision
publicationRevision
publicationVersionRevision
targetRevision
scheduleRevision
attemptRevision
providerEventRevision
verificationRevision
placementRevision
integrationHealthRevision
```

---

## Immutable history caching

Historical PublicationVersions, Attempts, ProviderEvents, and finalized Verification evidence can be cached strongly.

Current authorization and current live-state summary cannot.

---

## Performance

Use:

* one Publication aggregate query;
* batched Targets;
* latest Attempt summary;
* lazy Attempt timeline;
* paginated ProviderEvents;
* compact Placement/Verification summaries;
* cached immutable Versions.

Avoid sending full raw provider history on initial page load.

---

## Partial failure contract

Example:

```text
Publication core       ✓
Versions               ✓
Targets                ✓
Attempts               ✓
Verification           ✓
Integration health     ✕
```

Correct:

> Release history and verified placements are available; current provider connection health is unavailable.

Incorrect:

> Provider disconnected.

Another:

```text
v3 Website placement  VERIFIED
v3 Platform attempt   UNKNOWN
Provider reconciliation unavailable
```

Correct:

> Website is verified live. Platform outcome remains unknown and must not be retried until reconciled.

Not:

> Publication failed.

Another:

```text
v3 live on both targets
v4 corrective release:
Website verified
Platform failed
```

Correct:

> Publication is currently mixed-version: Website serves v4, Platform remains on v3.

Not:

> v4 published everywhere.

---

## Backend Requirement Matrix

| Requirement                                        | Status                                     |
| -------------------------------------------------- | ------------------------------------------ |
| Design 031 canonical Publication reuse             | **Critical**                               |
| Design 124 same backend reuse                      | **Critical**                               |
| No PublicationDetail business entity               | **Critical**                               |
| Publication/Version separation                     | **Critical**                               |
| Current/latest/published Version separation        | **Critical**                               |
| Exact source artifact pinning                      | **Critical**                               |
| Scheduled/executed Version immutability            | **Critical**                               |
| Release metadata snapshotting                      | **Critical**                               |
| Target identity reuse                              | **Critical**                               |
| Target/channel separation                          | **Critical**                               |
| Target/credential separation                       | **Critical**                               |
| Target configuration historical context            | **Critical**                               |
| Target/Attempt separation                          | **Critical**                               |
| Schedule/Attempt separation                        | **Critical**                               |
| Attempt/ProviderEvent separation                   | **Critical**                               |
| Attempt purpose lineage                            | **Critical**                               |
| Retry/corrective republish separation              | **Critical**                               |
| Provider acceptance/Verification separation        | **Critical**                               |
| Verification/override separation                   | **Critical**                               |
| Placement/URL separation                           | **Critical**                               |
| Placement/Version lineage                          | **Critical**                               |
| Mixed-version target state support                 | **Critical**                               |
| Target current-live-version resolver               | **Critical**                               |
| Correction creates new Version                     | **Critical**                               |
| Correction does not mutate prior release           | **Critical**                               |
| Takedown/cancel schedule separation                | **Critical if takedown exists**            |
| Takedown/delete Publication separation             | **Critical if takedown exists**            |
| Takedown verification                              | **Critical if takedown exists**            |
| Outcome unknown reconciliation                     | **Critical**                               |
| Reconciliation/Retry separation                    | **Critical**                               |
| No blind retry                                     | **Critical**                               |
| Manual publication/provider publication separation | **Critical if manual release supported**   |
| Manual verification evidence                       | **Critical if supported**                  |
| Design 114 artifact reuse                          | **Critical**                               |
| Design 115 Approval reuse                          | **Critical where required**                |
| Design 126 same Schedule backend                   | **Critical architecture**                  |
| Design 072 client-safe projection reuse            | **Critical**                               |
| Designs 127–130 Distribution separation            | **Critical**                               |
| Designs 139–140 Integration reuse                  | **Critical architecture**                  |
| Provider callback idempotency                      | **Critical**                               |
| Out-of-order event handling                        | **Critical**                               |
| SSRF-safe verification                             | **Critical where URL verification occurs** |
| Idempotent correction/retry/takedown               | **Critical**                               |
| Optimistic concurrency                             | **Critical**                               |
| Target-operation coordination                      | **Critical**                               |
| Cross-tenant execution prohibition                 | **Critical**                               |
| Audit/outbox integration                           | **Required**                               |
| Partial dependency failure handling                | **Critical**                               |

---

# 8. Consolidation

Design 125 creates significant architectural risk if Publication Detail becomes a mutable release record that overwrites historical Versions, Attempts, provider evidence, and live placements.

**PublicationDetailView / Publication conflation**
Read composition becomes business source.

**Design 124 / Design 125 backend duplication**
Queue and Detail disagree.

**Publication / PublicationVersion conflation**
Historical release content becomes mutable.

**Latest Version / current verified Version conflation**
Draft replaces actual live release.

**Current Publication Version / all Target versions conflation**
Mixed-version releases become impossible.

**Source DraftVersion / PublicationVersion conflation**
Editorial and external release history merge.

**Release metadata / current source metadata conflation**
Published title/slug changes retroactively.

**Target / channel enum conflation**
Specific destination identity disappears.

**Target / provider connection conflation**
Credential reconnect changes release history.

**Target configuration / historical Attempt configuration conflation**
Past execution cannot be reconstructed.

**Schedule / target state conflation**
Scheduled means published.

**Attempt / target state conflation**
Last Attempt overwrites broader live history.

**Attempt / ProviderEvent conflation**
Callback evidence disappears.

**Attempt success / verified Placement conflation**
Provider accepted job becomes public truth.

**Provider success / content correctness conflation**
Wrong version can be called published.

**URL existence / Placement verification conflation**
Stored string becomes evidence.

**Current URL / historical live location conflation**
Earlier releases lose traceability.

**Verification / manual override conflation**
Operator assumption becomes technical evidence.

**Verification stale / verification failed conflation**
Old evidence appears negative.

**Retry / corrective release conflation**
Same-version retry and new-version replacement merge.

**Retry / publish latest conflation**
Different content is sent accidentally.

**Retry / overwrite Attempt conflation**
Failure history disappears.

**Correction / edit prior Version conflation**
Previously published content history changes.

**Corrective v4 / delete v3 history conflation**
Cannot prove what was previously live.

**Correction failed / prior placement removed conflation**
Stable v3 is falsely treated offline.

**Target current-live Version / Publication global Version conflation**
Mixed-version state disappears.

**New required Target / prior target failure conflation**
Existing successful placements are marked failed.

**Target disabled / placement removed conflation**
Future config action changes public content.

**Integration disconnected / Placement offline conflation**
Existing public content is misreported.

**Provider API unavailable / Publication unavailable conflation**
Historical release evidence disappears.

**Provider Event duplicate / new release event conflation**
Counters and transitions repeat.

**Out-of-order callback / state regression conflation**
Verified content becomes processing.

**Reconciliation / Retry conflation**
Observation causes a second external side effect.

**Outcome unknown / failure conflation**
Duplicate public release risk.

**Manual published / provider published conflation**
Audit/evidence becomes misleading.

**Manual verification / automatic verification conflation**
Confidence/evidence level is hidden.

**Takedown requested / taken down conflation**
Content may remain live.

**Provider takedown accepted / verified removed conflation**
External side effect not confirmed.

**Takedown / Publication delete conflation**
History disappears.

**Takedown / source Deliverable delete conflation**
Editorial source is destroyed.

**Cancel schedule / unpublish conflation**
Future intent changes current live placement.

**Client live link / internal URL field conflation**
Unverified link leaks to Portal.

**Client Portal state / internal provider error conflation**
Operational details leak externally.

**DistributionCampaign / Publication correction conflation**
Updating release edits distribution directly.

**Publication verification / Distribution verification conflation**
Canonical release validation and promotional placement validation collapse.

**Activity event / release evidence conflation**
Text “Published” replaces Attempts/Verification.

**Audit event / Attempt conflation**
Governance log becomes provider execution.

**Search index / current live state conflation**
Stale index reports wrong version.

**Generic `publication.status`**
Versions, targets, attempts, verification and placement history collapse.

**Generic `live_url` field**
No version/target/verification lineage.

**Generic `last_attempt_status` only**
Cannot distinguish existing older live placement from failed update.

**Generic Publication mega-PATCH**
Version, target, provider state, live URL and corrections mutate together.

**125/031 duplicate Publication domain**
Detail forks from foundation.

**125/124 duplicate aggregate state resolver**
Queue and Detail show different outcomes.

**125/114 duplicate source content state**
Detail edits artifact.

**125/115 duplicate Approval state**
Release detail owns approval boolean.

**125/126 duplicate schedule state**
Calendar and Detail diverge.

**125/127 duplicate Distribution execution**
Release correction manipulates campaigns.

**125/129 duplicate placement verification**
Publishing and Distribution share one vague verification type.

**125/139–140 duplicate integration state**
Detail owns provider credentials/connection lifecycle.

No additional screen is required.

These are **single-Publication identity, exact-version release history, per-target current-live-version modeling, attempt/provider evidence, reconciliation, correction, optional takedown, verification provenance, integration isolation, and mixed-version operational-state requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PUBLICATION 360, EXACT-VERSION RELEASE, TARGET EXECUTION & VERIFIED-LIVE-STATE ANCHOR**

**Domain directive:**
**Publication ≠ PublicationVersion ≠ PublicationArtifactReference ≠ PublicationTarget ≠ PublicationSchedule ≠ PublicationAttempt ≠ ProviderEvent ≠ PublicationVerification ≠ LivePlacement ≠ ReleaseCorrection ≠ Takedown/Unpublish Operation ≠ DistributionCampaign ≠ Client Live-Link Projection ≠ PublicationDetailView.**

**Foundation directive:**
Design 031 remains the single canonical Publication domain. Design 125 is a deep composition and operational management surface over those exact records.

**Queue/detail directive:**
Designs 124 and 125 must use the same Publication, Version, Target, Schedule, Attempt, ProviderEvent, Verification and aggregate-state services. Queue/detail disagreement is prohibited.

**Projection directive:**
`PublicationDetailView` is rebuildable, permission-safe read composition and never becomes an editable PublicationDetail table.

**Publication directive:**
Publication is stable release identity; PublicationVersion is exact immutable release content/configuration identity.

**Version-state directive:**
latest-created, draft, scheduled, current verified release, historical and superseded PublicationVersions remain independently resolvable.

**Source directive:**
exact editorial/production source versions remain canonical in their source domains. PublicationVersion references them and freezes external-release metadata/payload semantics.

**No-latest directive:**
no Schedule, Retry, Correction or provider Attempt may silently resolve “latest” source/PublicationVersion at execution time.

**Immutability directive:**
once a PublicationVersion participates in scheduled/external execution, material content changes create a new PublicationVersion rather than mutating historical release evidence.

**Target directive:**
PublicationTarget remains a stable concrete destination/property/account context, separate from provider connection credentials and generic channel taxonomy.

**Target-history directive:**
Attempts and Placements preserve enough historical target configuration to explain what destination/configuration was actually used at execution time.

**Per-target-version directive:**
each PublicationTarget independently resolves which exact PublicationVersion is currently verified live. The domain must support mixed-version states across targets.

**Mixed-version directive:**
`Website=v4 verified, Platform=v3 verified, Partner=v4 unknown` is a valid first-class operational state and must never be flattened into `publication.currentVersion=v4` everywhere.

**Schedule directive:**
Design 126 and Design 125 consume the same canonical `PublicationSchedule`. Schedule edits use one ScheduleService and preserve exact Version/Target/timezone lineage.

**Attempt directive:**
every external execution is represented by append-oriented PublicationAttempt evidence with exact Version, Target, initiator, purpose and execution key.

**Retry directive:**
retry creates a new Attempt against the same exact Version/Target after a **known retryable failure**. It never overwrites earlier Attempt evidence and never substitutes a newer Version.

**Correction directive:**
content correction creates a new PublicationVersion with explicit lineage to the prior release and executes through the same canonical publishing engine.

**Correction-history directive:**
successfully releasing a correction does not erase the earlier Version/Placement; it marks historical replacement/supersession while retaining evidence of what was previously live.

**Provider-event directive:**
provider callbacks/status evidence remain immutable, idempotently normalized, safely stored, and resilient to duplicates/out-of-order delivery.

**Provider-acceptance directive:**
provider HTTP success, object creation, or job completion never equals independent public verification.

**Verification directive:**
PublicationVerification records exact Version + Target + method + time + evidence and remains independent from ProviderEvent and manual override.

**Manual-evidence directive:**
if manual/off-platform publication or manual verification exists, it must be explicitly typed with actor/method/reason/evidence and cannot masquerade as provider execution or automated verification.

**Override directive:**
manual governance override remains separate from factual verification. The system must preserve whether something was actually verified versus administratively accepted.

**Placement directive:**
LivePlacement identifies the exact verified external location/object for one PublicationVersion on one Target; a bare `live_url` string is never sufficient as release truth.

**Placement-history directive:**
prior Placements remain historical even after correction, replacement, disappearance or takedown.

**Verification-freshness directive:**
verification records when content was verified; stale verification must not be treated as guaranteed current live state forever.

**Reconciliation directive:**
`OUTCOME_UNKNOWN` is resolved through provider/live-state observation. Reconciliation never causes another publishing side effect.

**No-blind-retry directive:**
retry is prohibited until uncertain external outcome is reconciled to a safely retryable state.

**Takedown directive:**
if frozen Design 125 supports unpublish/takedown, it must be an explicit exact-Placement external operation with Attempt/provider evidence and independent removal verification.

**Takedown-history directive:**
takedown never deletes PublicationVersion, source Deliverable or prior Placement history.

**Cancellation directive:**
cancel future Schedule and remove existing live content remain completely different operations.

**Target-disable directive:**
disabling a Target prevents future release operations but does not imply that existing live content was removed.

**Integration directive:**
Designs 139–140 remain canonical provider connection/health/credential authority. Design 125 consumes safe health metadata only.

**Security directive:**
provider credentials, tokens and secrets never enter Publication Detail client payloads or generic logs.

**Approval directive:**
Design 115/029 remain formal Approval authority. Release Detail only references exact Approval evidence needed for publishing eligibility.

**Artifact directive:**
Design 114 remains Deliverable/artifact authority. Publication corrections never rewrite or relabel source artifacts through release-state mutations.

**Client directive:**
Design 072 consumes only safe verified live Publication/Placement projections and never internal Attempt/provider-error/credential information.

**Client-current-state directive:**
when a Placement is replaced, missing, or verified taken down, client-safe current live-link projections must update without erasing historical reporting evidence.

**Distribution directive:**
Designs 127–130 remain canonical Distribution. Publication correction/takedown emits domain events; it never edits Distribution campaign/placement/performance tables directly.

**Aggregate directive:**
one `PublicationAggregateStateResolver` calculates current Publication state from required/optional Targets, exact currently verified live Versions, unresolved failures and outcome-unknown states.

**No-boolean directive:**
generic `published=true`, `live_url`, or `last_attempt_status` fields can never replace the canonical release graph.

**Current-release directive:**
the current verified release version is established through governed target/release policy, not simply `MAX(versionNumber)`.

**Concurrency directive:**
parallel Version creation, publishing, retry, Target config changes, correction and takedown operations use optimistic/transactional coordination so conflicting external side effects cannot silently race.

**Target-operation directive:**
the backend should serialize or otherwise safely coordinate incompatible operations against the same Target/Placement when required.

**Idempotency directive:**
corrective Version creation, publish, retry, reconciliation command processing, manual verification and takedown operations are replay-safe.

**Tenant directive:**
Publication, Version, Target, provider connection, Schedule, Attempt, ProviderEvent, Verification and Placement remain strictly tenant-scoped.

**Activity directive:**
Design 119 projects meaningful release events but never becomes the authoritative release history.

**Audit directive:**
Publish Now, Retry, manual verification/override, Target configuration, correction and takedown operations produce actor/version/target-aware Design-039 Audit evidence.

**Caching directive:**
immutable Version/Attempt/ProviderEvent history may be strongly cached; current Target live state, integration health and user authorization remain revision-aware and fresh.

**Partial-failure directive:**
Publication core, provider connection, provider-event history, Verification and live-placement resolution may fail independently. A missing dependency never becomes Failed, Verified, Removed, or safe-to-retry without evidence.

**Performance directive:**
initial Publication Detail should load compact Version/Target/Verification summaries with lazy Attempt/provider-event expansion rather than entire external execution history.

**Future-reuse directive:**
Design **126 — Publishing Calendar / Release Schedule** must use the exact same canonical `PublicationSchedule` identities and exact pinned `PublicationVersion`/Target combinations. Calendar movement or rescheduling must invoke `PublicationScheduleService` and can never silently choose a different release version.

**Overlap directive:**
Designs **031, 072, 114–140** must preserve one continuous **exact source artifact → immutable PublicationVersion → concrete PublicationTarget → canonical Schedule → idempotent Attempt → ProviderEvent evidence → independent Verification → versioned LivePlacement → optional correction/takedown lineage → client-safe current live-link → separate Distribution workflow** chain.

**Consolidation directive:**
**STANDARDIZE ONE PUBLICATION-DETAIL & RELEASE-MANAGEMENT FOUNDATION — DESIGN-031 CANONICAL PUBLICATION + IMMUTABLE VERSION HISTORY + CONCRETE TARGETS + SAME DESIGN-124 ATTEMPTS/PROVIDER EVENTS/VERIFICATION + PER-TARGET CURRENT-LIVE-VERSION RESOLUTION + MIXED-VERSION RELEASE SUPPORT + RECONCILIATION-BEFORE-RETRY + EXPLICIT NEW-VERSION CORRECTIONS + OPTIONAL EXACT-PLACEMENT TAKEDOWN OPERATIONS + SAFE MANUAL VERIFICATION PROVENANCE + DESIGN-126 SHARED SCHEDULES + CLIENT-SAFE VERIFIED LIVE-LINK PROJECTIONS + STRICT DISTRIBUTION/INTEGRATION SEPARATION — AND NEVER ALLOW `LATEST`, GENERIC `PUBLISHED` FLAGS, BARE LIVE URLS, LAST-ATTEMPT STATUS, PROVIDER SUCCESS, MANUAL OVERRIDES, TARGET DISABLEMENT OR RELEASE-DETAIL UI STATE TO SUBSTITUTE FOR OR REWRITE CANONICAL VERSION, TARGET, ATTEMPT, VERIFICATION, PLACEMENT OR HISTORICAL RELEASE TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **125 / 153** |
| **PASS**                                   |                        **125** |
| **STANDARDIZE decisions**                  |                        **123** |
| **Potential implementation-overlap flags** |                        **116** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**125 / 153 = 81.7% audited.**

### Canonical Publication Detail architecture after Design 125

```text
PUBLICATION PUB-100
        │
        ├── v1 HISTORICAL
        ├── v2 HISTORICAL
        ├── v3 CURRENT VERIFIED RELEASE
        └── v4 DRAFT
                  │
       ┌──────────┼──────────┐
       ↓          ↓          ↓
    Website    Platform    Partner
       │          │          │
      v3         v3         v3
       │          │          │
 VERIFIED      VERIFIED    UNKNOWN
       │          │          │
 Placement    Placement   reconcile
```

The system must also support mixed-version reality:

```text
Correction v4 released

Website  → v4 VERIFIED
Platform → v3 VERIFIED
Partner  → v4 OUTCOME UNKNOWN

RESULT:

Publication is in a mixed-version /
partial-correction state.

It is NOT correct to say:
“v4 is live everywhere.”
```

Retry and correction remain completely different:

```text
Attempt A1
v3 → Website
known retryable failure
        ↓
RETRY
same v3
new Attempt A2

        ≠

CORRECTION
create v4
publish v4
```

Provider success and live verification remain separate:

```text
Attempt:
Provider says SUCCESS

Verification:
live page contains v2

RESULT:
MISMATCH

NOT:
VERIFIED
```

And if takedown exists:

```text
Takedown requested
        ↓
Provider accepted
        ↓
Verification pending

The Publication is not
“taken down” until external
removal is actually verified.
```

## Next Sequential Audit Target

### **Design 126 — Publishing Calendar / Release Schedule**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
