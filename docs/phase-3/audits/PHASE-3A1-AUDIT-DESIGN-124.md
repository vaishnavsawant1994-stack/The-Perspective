# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 124 — Publishing Queue / Publication Management Workspace

Design 124 should become the **canonical Team Workspace operational publishing queue, multi-target scheduling, release-readiness, execution-attempt, provider-state, and verification surface** built on the single Publication domain already established by **Design 031 — Publishing Hub / Publication Queue**.

Design 124 must **not create a second publishing engine**. Design 031 remains the canonical Publication foundation; Design 124 is the deeper operational management surface that composes its Publications, exact release versions/artifacts, publication targets, schedules, execution attempts, provider events, and verified live-placement state.

It must also preserve the boundaries with:

* Design 114 — Project Files / Deliverables;
* Design 121 — Final Handover;
* Design 123 — Archived Project Detail;
* Design 125 — Publication Detail / Release Management;
* Design 126 — Publishing Calendar;
* Designs 127–130 — Distribution;
* Designs 139–140 — Integration connection/health;
* Client publishing views 055/072.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Publication ≠ PublicationVersion/PublicationArtifact ≠ PublicationTarget ≠ PublicationSchedule ≠ PublicationAttempt ≠ ProviderEvent ≠ ProviderAcceptance ≠ Verification ≠ Placement/LiveLocation ≠ PublishingQueueItem ≠ SourceDeliverable ≠ FinalHandover ≠ DistributionCampaign ≠ Project.**

The central implementation rule is:

> **Publishing must always execute an exact immutable release version/artifact against an exact PublicationTarget. “Ready,” “Scheduled,” “Publishing,” “Provider accepted,” “Live,” and “Verified” are different facts. A queue row is only a projection. A provider HTTP 200 or accepted job does not prove that content is publicly live. New source content versions never silently replace an already scheduled or executing release. Unknown provider outcomes must be reconciled before retrying, and publication must remain completely separate from downstream Distribution.**

---

# 1. Classification

| Audit field                          | Classification                                                                                                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                        | **124**                                                                                                                                                                         |
| **Canonical name**                   | **Publishing Queue / Publication Management Workspace**                                                                                                                         |
| **Product area**                     | Team Workspace / Publishing / Release Operations                                                                                                                                |
| **User surface**                     | **Authenticated Team Workspace**                                                                                                                                                |
| **Screen class**                     | Publishing Operations Workspace / Queue / Multi-Target Release Management                                                                                                       |
| **Classification**                   | **Canonical Publication Queue Execution, Scheduling & Release-Operations Variant over Design 031**                                                                              |
| **Primary purpose**                  | Coordinate publication-ready content through exact release versions, targets, schedules, execution attempts, provider responses, live verification and failure/retry operations |
| **Canonical Publication foundation** | **Design 031 — Publishing Hub / Publication Queue**                                                                                                                             |
| **Primary entity**                   | **Publication**                                                                                                                                                                 |
| **Release identity**                 | `PublicationVersion` / immutable release artifact                                                                                                                               |
| **Publishable content**              | `PublicationArtifact` / exact typed source artifact                                                                                                                             |
| **Destination entity**               | `PublicationTarget`                                                                                                                                                             |
| **Scheduling entity**                | `PublicationSchedule`                                                                                                                                                           |
| **Execution entity**                 | `PublicationAttempt`                                                                                                                                                            |
| **External evidence**                | `ProviderEvent`                                                                                                                                                                 |
| **Live-state evidence**              | `PublicationVerification` / verified Placement                                                                                                                                  |
| **Queue representation**             | `PublishingQueueItem` — read projection only                                                                                                                                    |
| **Source Deliverable dependency**    | Design 114                                                                                                                                                                      |
| **Approval dependency**              | Designs 029 / 115 where required                                                                                                                                                |
| **Final Handover boundary**          | Design 121                                                                                                                                                                      |
| **Archived Project boundary**        | Design 123                                                                                                                                                                      |
| **Client publishing projections**    | Designs 055 / 072                                                                                                                                                               |
| **Publishing Detail dependency**     | Design 125                                                                                                                                                                      |
| **Publishing Calendar dependency**   | Design 126                                                                                                                                                                      |
| **Distribution boundary**            | Designs 032 / 127–130                                                                                                                                                           |
| **Integration dependency**           | Designs 139–140                                                                                                                                                                 |
| **Activity dependency**              | Design 119                                                                                                                                                                      |
| **Audit dependency**                 | Design 039                                                                                                                                                                      |
| **Primary query service**            | `PublishingQueueQueryService`                                                                                                                                                   |
| **Publication service**              | canonical `PublicationService` from Design 031                                                                                                                                  |
| **Readiness resolver**               | `PublicationReadinessResolver`                                                                                                                                                  |
| **Schedule service**                 | `PublicationScheduleService`                                                                                                                                                    |
| **Execution service**                | `PublicationExecutionService`                                                                                                                                                   |
| **Target adapter registry**          | `PublicationTargetAdapterRegistry`                                                                                                                                              |
| **Verification service**             | `PublicationVerificationService`                                                                                                                                                |
| **Aggregate state resolver**         | `PublicationAggregateStateResolver`                                                                                                                                             |
| **Parent shell**                     | `InternalAppShell` — Design 001                                                                                                                                                 |
| **Auth**                             | Required                                                                                                                                                                        |
| **Authorization**                    | Active OrganizationMembership + publishing/target/release permissions                                                                                                           |
| **Implementation priority**          | **Critical Public-Release Integrity / External Side-Effect Safety**                                                                                                             |
| **Reuse level**                      | **Extremely High across Publishing Detail, Calendar, Client live-links, Distribution, Reporting and Analytics**                                                                 |

Design 124 should answer:

> **“Which exact releases are waiting to publish, whether they are actually ready, when and where they are scheduled, what happened on each destination, which attempts succeeded or failed, which outcomes are uncertain, and what has been independently verified as live?”**

Canonical architecture:

```text
Source Project / Content Domain
          │
          ↓
exact approved Deliverable /
DraftVersion / ProofVersion /
MediaVersion / ReportVersion
          │
          ↓
     Publication
          │
          ↓
 PublicationVersion
   exact release snapshot
          │
    ┌─────┼─────────┐
    ↓     ↓         ↓
 Target A Target B Target C
    │     │         │
 Schedule Schedule Schedule
    │     │         │
 Attempt Attempt   Attempt
    │     │         │
 Provider events / responses
    │     │         │
 Verification / live placement
          │
          ↓
 Publishing Queue Projection
```

---

# 2. Reuse

## Design 031 remains the canonical Publication foundation

This is the strongest reuse requirement.

Design 124 must **not** introduce:

```text
ManagedPublication
QueuedPublication
PublishingJob
ReleaseRecord
```

as alternate Publication business identities.

Correct:

```text
Publication PUB-100
      │
      ├── Design 031 Publishing Hub
      ├── Design 124 Publishing Queue
      ├── Design 125 Publication Detail
      └── Design 126 Publishing Calendar
```

All four surfaces use the **same Publication IDs and services**.

---

## PublishingQueueItem ≠ Publication

Permanent.

A queue entry may combine:

* Publication;
* current release version;
* target counts;
* schedule;
* readiness;
* aggregate execution state.

It is a read projection.

Do not persist it as a second writable release entity.

---

## Publication ≠ PublicationVersion

Critical.

### Publication

Stable release/business identity.

### PublicationVersion

Exact immutable release revision/configuration/artifact snapshot.

Example:

```text
Publication PUB-10
├── PublicationVersion v1
├── PublicationVersion v2
└── PublicationVersion v3
```

---

## Scheduled version ≠ latest version

Absolute.

Example:

```text
Latest draft/release version = v4
Scheduled publication       = v3
```

Until explicitly rescheduled/replaced:

> v3 remains the scheduled release.

---

## New source version does not mutate scheduled release

Critical.

If:

```text
DraftVersion 8
```

produces:

```text
PublicationVersion 4
```

while PublicationVersion 3 is already scheduled, v3 remains pinned.

The system may warn:

> A newer version exists.

It cannot silently publish v4.

---

## PublicationArtifact ≠ mutable source entity

A PublicationVersion should pin the exact source content/artifact being released.

Example:

```text
PublicationVersion PV-3
    ↓
DraftVersion DV-7
    ↓
rendered publishable artifact
```

or:

```text
PublicationVersion PV-5
    ↓
PodcastMediaVersion MV-4
```

Never:

```text
Publication → current project draft
```

at execution time.

---

## Design 114 remains Deliverable authority

A Publication may originate from a Project Deliverable.

But:

```text
Deliverable
≠
Publication
```

Deliverable readiness means:

> content/output is prepared.

Publication means:

> exact output is being released externally.

---

## Final Handover ≠ Publication

Design 121 remains separate.

The Client may receive an artifact without it being public.

The public may receive content without a formal Client Handover occurring at that moment.

---

## Archived Project ≠ Publication cancellation

Design 123 established this explicitly.

A scheduled Publication referencing a completed/archived Project's immutable approved artifact should not require copying or reopening the Project merely because release happens later.

Correct:

```text
Project = ARCHIVED
Publication = SCHEDULED
```

can be valid where policy permits.

---

## PublicationTarget ≠ channel name

Critical.

A target should represent the actual configured destination, potentially including:

* provider;
* property/account/site;
* environment/context;
* destination identifier.

Do not use only:

```text
channel = WEBSITE
```

where several Website properties/accounts exist.

---

## PublicationTarget ≠ integration credential

Permanent.

Target references a provider connection/account configuration.

Credentials remain Designs 139–140 / secure secret infrastructure.

---

## PublicationSchedule ≠ Publication

Permanent.

A Publication can exist before it is scheduled.

---

## PublicationSchedule ≠ Calendar event

Design 126 and Design 035 may project the schedule.

The canonical schedule remains `PublicationSchedule`.

---

## PublicationSchedule ≠ execution attempt

Permanent.

Scheduled:

> should execute at this time.

Attempt:

> execution actually occurred.

---

## PublicationAttempt ≠ provider event

Critical.

One internal attempt may produce:

* initial API response;
* callback;
* webhook;
* later status poll.

Those provider events are evidence about the attempt.

---

## PublicationAttempt ≠ final live state

Permanent.

An attempt can be accepted by a provider but never become publicly visible.

---

## Provider accepted ≠ Published

One of the strongest permanent publishing invariants.

```text
Provider HTTP 200
        ≠
Provider job completed
        ≠
Public URL exists
        ≠
Correct content visible
        ≠
Verified publication
```

---

## Verification ≠ provider response

Verification should confirm externally meaningful state.

It may use:

* provider status;
* known live identifier;
* safe fetch/inspection;
* destination-specific evidence.

Exact strategy varies by target adapter.

---

## Publication ≠ Distribution

Critical.

### Publishing

Makes the content live at canonical publication destinations.

### Distribution

Promotes/distributes already-published content through campaigns, placements, channels and performance tracking.

Correct:

```text
Publication verified live
         ↓
eligible for Distribution
```

not:

```text
Publication = DistributionCampaign
```

---

## Designs 055/072 reuse publication truth

Client Portal publishing views consume safe projections over:

* Publication;
* exact published version;
* verified live targets/links.

They never maintain their own published booleans.

---

# 3. Entities

## Publication

Stable canonical release identity from Design 031.

Conceptually:

```text
Publication
├── id
├── organizationId
├── sourceProjectId?
├── publicationType
├── lifecycle
├── currentDraftVersionId?
├── currentReleaseVersionId?
├── createdAt
└── revision
```

Exact schema belongs to Phase 3D.

---

## Publication lifecycle ≠ target state

Critical.

A Publication may have:

```text
Target A = VERIFIED
Target B = FAILED
Target C = SCHEDULED
```

Aggregate Publication state must be derived according to release policy.

Do not force all target state into one boolean.

---

## PublicationVersion

Exact immutable release definition.

Conceptually:

```text
PublicationVersion
├── id
├── publicationId
├── version
├── sourceArtifactReference
├── content/payload snapshot
├── publication metadata snapshot
├── target-specific configuration refs
├── createdBy
├── createdAt
└── fingerprint/checksum?
```

---

## Published/issued PublicationVersion should be immutable

Once used by an external execution attempt:

material release content should not mutate in place.

Correction/update should create a new version where business semantics require it.

---

## Release payload snapshot

Strongly recommended.

Provider execution must not dynamically rebuild mutable release fields such as:

* title;
* summary;
* body;
* media selection;
* publication metadata;

from today's source records after scheduling.

Execution should use the exact pinned release version/payload.

---

## PublicationArtifact

Conceptual typed relation to publishable source.

```text
PublicationArtifactReference
├── sourceType
├── sourceId
├── exactVersionId
├── artifactRole
└── integrity/reference
```

Possible types depend on existing production domains.

---

## Source version ≠ rendered/provider payload

Important.

For example:

```text
DraftVersion DV-7
      ↓
PublicationVersion PV-3
      ↓
Website provider payload snapshot
```

All three have different semantics.

---

## PublicationTarget

Conceptually:

```text
PublicationTarget
├── id
├── publicationId
├── destination type
├── provider/account/property reference
├── lifecycle
├── target configuration
└── revision
```

---

## Target ≠ provider account

A provider connection/account can support multiple PublicationTargets/Publications.

---

## Target ≠ PublicationAttempt

Permanent.

A Target may have several attempts because of retries/corrections.

---

## PublicationSchedule

Conceptually:

```text
PublicationSchedule
├── id
├── publicationId
├── publicationVersionId
├── publicationTargetId
├── scheduledFor
├── timezone
├── lifecycle
├── createdBy
├── createdAt
└── revision
```

Depending on domain, one schedule may apply to several targets, but exact version/target resolution must remain unambiguous.

---

## Schedule pins exact PublicationVersion

Absolute.

Do not store:

```text
publicationId + scheduledFor
```

and choose latest version at execution time.

---

## Timezone is part of schedule semantics

Critical.

Store enough data to preserve:

> Publish at 9:00 AM Europe/Berlin

rather than silently interpreting date/time according to whichever server happens to execute the job.

---

## Schedule time ≠ provider execution time

Permanent.

A scheduler may claim the job at 09:00 and provider may finish at 09:02.

Keep actual timing evidence separately.

---

## PublicationAttempt

Conceptually:

```text
PublicationAttempt
├── id
├── publicationId
├── publicationVersionId
├── publicationTargetId
├── scheduleId?
├── attemptNumber
├── initiatedBy
├── initiatedAt
├── lifecycle
├── providerRequestId?
├── outcome class
├── completedAt?
└── revision
```

---

## Attempt number ≠ retry count universally

A later attempt may be:

* retry after known failure;
* explicit republish;
* corrected version.

Preserve purpose/lineage.

---

## ProviderEvent

Immutable normalized external evidence.

Conceptually:

```text
ProviderEvent
├── id
├── provider
├── externalEventId
├── publicationAttemptId?
├── providerObjectId
├── eventType
├── occurredAt
├── receivedAt
├── verifiedSignature/auth evidence
├── normalizedPayload
└── raw evidence reference
```

---

## ProviderEvent should be idempotent

Unique external/provider event identifiers should prevent duplicate state processing.

---

## ProviderEvent ≠ normalized Publication state

Provider events are evidence.

A state resolver determines their effect.

---

## Provider callbacks can be out of order

Critical.

Example:

```text
10:01 COMPLETED callback
10:02 PROCESSING callback arrives late
```

The late callback must not regress a verified successful release back to processing.

---

## Provider acceptance

Provider-specific acknowledgement:

> job accepted / object created / request queued.

This is distinct from verified live state.

---

## PublicationVerification

Conceptually:

```text
PublicationVerification
├── id
├── publicationTargetId
├── publicationVersionId
├── placement/live reference
├── verification method
├── result
├── verifiedAt
├── freshness
└── evidence
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

Exact states Phase 3D.

---

## Placement / Live Location

After successful publication, target may resolve:

```text
live URL
provider object ID
canonical placement identifier
```

This evidence must remain version-aware.

---

## Live URL ≠ verification

Permanent.

A URL string existing in the database does not prove it currently serves correct content.

---

## Queue Item

`PublishingQueueItem` should be rebuildable:

```text
PublishingQueueItem
├── publicationId
├── release version
├── readiness
├── aggregate schedule
├── target summary
├── execution summary
├── verification summary
└── next allowed action
```

No independent mutable lifecycle.

---

## Aggregate publication state

Derived from target-specific state and policy.

Example:

```text
3 required targets

Target A VERIFIED
Target B VERIFIED
Target C FAILED

Aggregate = PARTIAL / ATTENTION REQUIRED
```

not:

```text
published = true
```

merely because one destination succeeded.

---

# 4. Permissions

Design 124 should conceptually distinguish:

```text
publication.read
publication.create
publication.editDraft

publication.schedule
publication.reschedule
publication.cancelSchedule

publication.publish
publication.retry

publicationTarget.read
publicationTarget.manage

publicationVerification.read
publicationVerification.manage

publishingQueue.read
```

Exact permission identifiers belong to Phase 3D.

---

## Queue read ≠ Publication mutation

Permanent.

---

## Publication edit ≠ Publish authority

Critical.

An editor may prepare content without being authorized to publicly release it.

---

## Schedule permission ≠ Publish-now permission

Potentially separate.

---

## Publish permission ≠ integration credential management

Absolute.

Publishing operators must not automatically see/manage provider secrets.

---

## Integration admin ≠ Publication approver

Permanent.

---

## PublicationTarget manage ≠ credential access

Permanent.

---

## Retry permission ≠ content edit permission

A release operator may retry an exact existing version without being authorized to modify its content.

---

## Retry cannot select a new version implicitly

Critical.

Retry means:

> retry the same exact release intent/version after a known retryable failure.

Publishing a new version is a different operation.

---

## Cancel schedule ≠ unpublish

Absolute.

Cancelling a future execution does not remove an already-live placement.

---

## Approval authority remains separate

Where publication requires approval:

the publishing operator cannot fabricate Approval through Design 124.

---

## Project archive permission ≠ Publication permission

Design 123 boundary remains.

---

## Client portal access ≠ internal publication authority

Absolute.

---

## Direct Publication ID reauthorizes

Permanent.

---

## Direct PublicationVersion ID reauthorizes

Permanent.

---

## Direct Target ID reauthorizes

Permanent.

---

## Direct Attempt ID reauthorizes

Permanent.

---

## Cross-tenant target execution prohibited

Absolute.

Publication, artifact, Target, provider connection/account and Project context must remain in authorized tenant scope.

---

## Target/account visibility may be restricted

A user may be authorized to publish to:

> Website A

but not:

> Executive LinkedIn account B

even within the same organization.

---

# 5. States

Design 124 must keep **source readiness, Publication lifecycle, release-version state, schedule state, target execution state, Attempt state, provider outcome, verification state, and aggregate queue state** independent.

### Source/release readiness

Conceptually:

```text
Not Ready
Ready
Blocked
Unknown
```

### Publication lifecycle

Conceptually:

```text
Draft
Ready
Scheduled
In Progress
Partially Released
Released / Completed
Cancelled
```

Exact taxonomy Phase 3D.

### Schedule

```text
Unscheduled
Scheduled
Due
Claimed
Cancelled
Superseded
```

### Attempt

```text
Pending
Running
Succeeded at provider
Failed
Outcome Unknown
Cancelled
```

### Verification

```text
Not Started
Pending
Verified
Not Verified
Mismatch
Unknown
Unavailable
```

These must never collapse into one generic `publication.status`.

---

## Ready ≠ Scheduled

Absolute.

---

## Scheduled ≠ Publishing

Permanent.

---

## Due ≠ executed

Permanent.

---

## Scheduler claimed ≠ provider accepted

Permanent.

---

## Provider accepted ≠ live

Absolute.

---

## Live ≠ verified correct

Critical.

---

## Verified target ≠ all targets verified

Permanent.

---

## One target failed ≠ entire Publication failed automatically

Aggregate state depends on required-target policy.

---

## Partially published ≠ published everywhere

Absolute.

---

## Attempt failed ≠ Publication cancelled

Permanent.

---

## Outcome unknown ≠ failure

Critical.

---

## Outcome unknown ≠ success

Absolute.

Reconcile.

---

## Retry pending ≠ previous Attempt erased

Permanent.

Attempt history remains.

---

## Rescheduled ≠ old Schedule deleted

Historical schedule changes should remain explainable.

---

## Schedule cancelled ≠ Publication cancelled universally

Permanent.

Publication may be rescheduled later.

---

## Newer version exists ≠ scheduled version obsolete automatically

Absolute.

---

## Source Project archived ≠ Publication cancelled

Absolute.

---

## Distribution not started ≠ Publication incomplete

Permanent.

---

## Provider unavailable ≠ content not ready

Permanent.

---

## Verification service unavailable ≠ not published

Critical.

Correct:

> Provider accepted release; independent verification unavailable.

Not:

> Failed.

---

## Queue projection unavailable ≠ Publications deleted

Absolute.

---

## State Coverage

Design 124 inherits Design 150 plus:

```text
Publishing Queue Loading
Publishing Queue Available
Publishing Queue Empty
Publishing Queue Restricted
Publishing Queue Partial
Publishing Queue Unavailable

Publication Draft
Publication Ready
Publication Scheduled
Publication In Progress
Publication Partially Released
Publication Released
Publication Cancelled

Release Version Current
Release Version Scheduled
Release Version Historical
Newer Release Version Available

Publication Readiness Ready
Publication Readiness Blocked
Publication Readiness Unknown
Publication Readiness Unavailable

Target Unscheduled
Target Scheduled
Target Due
Target Publishing
Target Provider Accepted
Target Verification Pending
Target Verified
Target Failed
Target Outcome Unknown
Target Cancelled

Attempt Pending
Attempt Running
Attempt Provider Accepted
Attempt Failed Retryable
Attempt Failed Permanent
Attempt Outcome Unknown
Attempt Superseded

Provider Connection Healthy
Provider Connection Degraded
Provider Connection Unavailable
Provider Connection State Unknown

Verification Pending
Verification Verified
Verification Failed / Mismatch
Verification Unknown
Verification Unavailable

All Required Targets Verified
Some Targets Verified
No Targets Verified
Required Target Failed
Aggregate State Unknown

Publication Updated Elsewhere
Schedule Updated Elsewhere
Target Updated Elsewhere
Provider Event Arrived
Verification Updated Elsewhere
Queue Projection Stale
Publishing Conflict
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize **release identity, exact version, schedule, targets, execution state, and next safe action**.

Conceptually:

```text
Publishing Queue
↓
Publication
   ├── exact release version
   ├── readiness
   ├── schedule
   ├── required targets
   ├── verified / pending / failed counts
   ├── next action
   └── frozen-design controls
```

Only the frozen Design 124 UI should render.

---

## Exact release version must remain visible

Correct:

> Leadership Feature · Release v3

not:

> Leadership Feature · Latest.

Especially when:

```text
v3 scheduled
v4 draft available
```

the distinction should be obvious.

---

## Schedule timezone should remain explicit where ambiguity exists

Example:

> Aug 25 · 09:00 · Europe/Berlin

rather than:

> 09:00

with no context.

---

## Target-level partial state must not disappear behind one badge

Correct:

> Website — Verified
> Magazine Platform — Verification pending
> Partner Feed — Failed

not simply:

> Published.

---

## Provider accepted and verified should look different

This protects operators from treating an API response as confirmed public release.

---

## Unknown outcome must demand reconciliation, not blind retry

Where frozen UI includes retry controls:

> Verify status before retry

or an equivalent guarded workflow is safer than a generic Retry button on uncertain outcomes.

---

## Newer release warning

Where applicable:

> v3 is scheduled. v4 exists but is not scheduled.

Never silently switch the row to v4.

---

## Desktop queue filtering

If filters exist in the frozen design, likely dimensions should map to canonical states such as:

* readiness;
* schedule;
* target;
* verification;
* attention/failure.

Filters must query the canonical queue projection rather than local browser state.

---

## Tablet

Following Design 152:

* Publication identity/version remains first;
* schedule and target summary stack;
* target-level status becomes expandable;
* primary queue action remains clear;
* failure/unknown state is not hidden in overflow.

---

## Mobile

Priority:

```text
Publication title
↓
Exact release version
↓
Readiness
↓
Scheduled date/time
↓
Target summary
↓
Failed / Unknown targets
↓
Primary allowed action
```

Avoid squeezing a large publishing table horizontally.

---

## Mobile target detail

Example:

> 3 targets
> 1 Verified · 1 Pending · 1 Failed

with drill-in to exact target details is safer than a single aggregate badge.

---

## Accessibility

A queue entry could communicate:

> Publication PUB-100, Leadership Interview release version 3. Scheduled for August 25 at 9 AM Europe/Berlin. Three required targets. Website is verified live. Magazine platform is awaiting verification. Partner feed failed on its first attempt. A newer release version 4 exists but is not scheduled.

where authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical publishing architecture

```text
Design 124
    ↓
Authenticated Workspace Context
    ↓
PublishingQueueQueryService
    │
    ├── PublicationAdapter
    ├── PublicationVersionAdapter
    ├── ArtifactAdapter
    ├── ReadinessAdapter
    ├── TargetAdapter
    ├── ScheduleAdapter
    ├── AttemptAdapter
    ├── ProviderEventAdapter
    ├── VerificationAdapter
    └── IntegrationHealthAdapter
    ↓
PublishingQueueView
```

Mutations remain in canonical Publication services.

---

## Publication creation

Conceptually:

```text
createPublication(
    sourceContext,
    exactArtifactReference,
    publicationType,
    idempotencyKey
)
```

must:

1. authenticate/authorize;
2. resolve exact source artifact;
3. validate tenant/project context;
4. establish canonical Publication;
5. create initial exact release version where appropriate;
6. emit Audit/outbox.

---

## Creation idempotency

Repeated user/network requests cannot produce multiple duplicate Publications for one explicit creation intent.

Do not over-dedupe genuinely distinct publication releases.

---

## PublicationVersion creation

Conceptually:

```text
createPublicationVersion(
    publicationId,
    exactSourceArtifactReference,
    releaseMetadata,
    expectedPublicationRevision,
    idempotencyKey
)
```

should pin:

* exact source version;
* release metadata;
* immutable provider-independent payload inputs.

---

## Published/scheduled version immutability

Once a version has been scheduled/executed:

material edits create a new version.

Do not patch v3 after an attempt used it.

---

## Publication readiness

Central:

```text
PublicationReadinessResolver.resolve(
    publicationId,
    publicationVersionId,
    targetSet
)
```

may validate:

* exact artifact exists;
* artifact safe/processed;
* required Approval satisfied;
* target-specific required metadata;
* required provider/account configuration;
* provider connection not known-invalid;
* content constraints satisfied.

Exact requirements depend on Publication type/target.

---

## Readiness ≠ provider availability

Important.

A publication may be content-ready while provider is temporarily unavailable.

Keep:

```text
Content readiness
Provider/target operational readiness
```

separately explainable.

---

## Structured readiness blockers

Examples:

```text
ARTIFACT_MISSING
ARTIFACT_UNSAFE
APPROVAL_PENDING
TARGET_CONFIGURATION_INVALID
REQUIRED_METADATA_MISSING
PROVIDER_CONNECTION_UNAVAILABLE
SOURCE_VERSION_RESTRICTED
```

rather than only:

> Not ready.

---

## Schedule command

Conceptually:

```text
schedulePublication(
    publicationId,
    publicationVersionId,
    targetIds[],
    scheduledFor,
    timezone,
    expectedRevision,
    idempotencyKey
)
```

must:

1. authorize;
2. load exact version;
3. validate targets;
4. fresh-check scheduling readiness;
5. normalize schedule/timezone;
6. create durable schedule records;
7. emit events/outbox.

---

## Schedule idempotency

Critical.

Retry cannot create several jobs scheduled for the same exact PublicationVersion/Target/intention.

---

## Scheduler must be durable

Do not rely on:

* browser timers;
* in-memory setTimeout;
* one application server's local memory.

Use durable:

* queue/scheduler;
* DB-backed due records;
* leases/claiming.

---

## Scheduler claim

Workers should claim due schedules atomically.

Only one worker should create the active execution Attempt for a given due schedule/target/version.

---

## At-most-one active Attempt for one execution intent

Use:

* unique execution key;
* lease/lock;
* transaction.

This prevents duplicate public releases.

---

## Publish Now

If frozen Design 124 includes immediate publication:

```text
publishNow(
    publicationId,
    publicationVersionId,
    targets[],
    expectedRevision,
    idempotencyKey
)
```

must perform the same fresh readiness and exact-version checks as scheduled publication.

---

## Stale UI cannot publish wrong version

Absolute.

If the browser displays v3 but v4 becomes current:

the command still explicitly says v3.

The server never substitutes v4.

---

## PublicationAttempt creation

Conceptually:

```text
PublicationAttempt
executionKey =
publicationId
+ publicationVersionId
+ targetId
+ schedule/intentId
```

or equivalent durable uniqueness.

---

## Provider Adapter Registry

Use canonical abstraction:

```text
PublicationTargetAdapterRegistry
├── adapter A
├── adapter B
└── adapter C
```

Each adapter handles:

* payload mapping;
* authentication integration;
* execute;
* status;
* normalize errors;
* verify live state.

---

## Provider-specific fields must not leak throughout domain

Keep provider quirks behind adapter/config boundaries.

---

## Credentials

Never store provider secrets in Publication/Attempt rows.

Use secure Integration/credential infrastructure.

---

## Provider request idempotency

Where provider supports idempotency keys:

send deterministic execution keys.

Where provider does not:

use internal reconciliation/duplicate prevention.

---

## Attempt outcome classes

Normalize errors into classes such as:

```text
SUCCESS_ACCEPTED
RETRYABLE_FAILURE
PERMANENT_FAILURE
AUTH_FAILURE
RATE_LIMITED
OUTCOME_UNKNOWN
```

Exact enum Phase 3D.

---

## Rate limit ≠ disconnected

Permanent.

A provider `429` does not mean connection is broken.

---

## Auth failure ≠ content invalid

Permanent.

---

## Retryable failure ≠ unknown outcome

Critical.

### Retryable failure

Known not to have published.

### Unknown outcome

Could have published.

Unknown must be reconciled before retry.

---

## Reconciliation

Conceptually:

```text
reconcilePublicationAttempt(attemptId)
```

uses:

* provider request ID;
* destination query;
* callback evidence;
* verified placement lookup.

Only when state is resolved should retry become eligible.

---

## Blind retry is prohibited on uncertain external side effects

This is a production-critical rule.

---

## Retry command

Conceptually:

```text
retryPublicationAttempt(
    failedAttemptId,
    expectedRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. verify prior outcome is safely retryable;
3. use same exact PublicationVersion;
4. create new Attempt with lineage;
5. never erase previous Attempt.

---

## Retry ≠ publish latest version

Absolute.

---

## Provider callbacks

Must support:

* signature verification where provider offers it;
* idempotency;
* out-of-order arrival;
* repeated callbacks;
* unknown/unmatched events.

---

## Unmatched provider events

Retain for investigation/reconciliation.

Do not attach them to a Publication based on weak text matching.

---

## Provider event ordering

State reducer must not regress final/high-confidence states because of a delayed lower-state callback.

---

## Verification Service

After provider success/acceptance:

```text
PublicationVerificationService.verify(
    publicationVersionId,
    targetId,
    attemptId
)
```

should confirm externally meaningful live state.

---

## Verification may be asynchronous

Correct flow:

```text
Attempt accepted
      ↓
Verification pending
      ↓
Verified live
```

rather than blocking provider call for an arbitrary amount of time.

---

## Safe URL verification

If verification fetches a live URL:

protect against SSRF.

Require:

* trusted target/provider host policy;
* private/reserved IP blocking;
* redirect limits;
* scheme restrictions;
* DNS-rebinding defenses where appropriate.

---

## Placement identity

Verified release should preserve:

```text
provider object ID
live URL
canonical target
publicationVersion
verifiedAt
```

so Client/live-link views do not rely on arbitrary strings.

---

## Verification freshness

A release verified last month may not prove the page is live today.

Keep:

```text
verifiedAt
verification method
freshness
```

where current live status matters.

---

## “Published” aggregate resolver

Use centralized:

```text
PublicationAggregateStateResolver.resolve(publicationId)
```

based on:

* required targets;
* optional targets;
* exact current release version;
* Attempt state;
* verification state.

---

## No manual `published=true`

Absolute.

---

## Required vs optional targets

Critical.

Example:

```text
Website = required
Partner Feed = optional
```

Optional failure should not necessarily make aggregate release incomplete.

This must be defined by target/release policy rather than hard-coded counts.

---

## Partial publication

First-class state.

Example:

```text
Website verified       ✓
Magazine destination   ✓
Partner destination    ✕

Aggregate:
PARTIAL / ATTENTION
```

Preserve target detail.

---

## Cancellation

For future schedules:

```text
cancelPublicationSchedule(...)
```

should cancel only eligible pending schedule entries.

---

## Cancellation requested ≠ cancelled

If a worker already claimed/executed the job, cancellation may race.

The service must resolve actual execution state.

---

## Cancel Schedule ≠ Unpublish

Absolute.

After content is live, removing/taking down content is a separate release-management operation if the frozen product supports it, likely under Design 125.

---

## Reschedule

Rescheduling should create/update schedule history with expected revisions.

Do not simply rewrite timestamps without historical trace where material.

---

## Design 126 integration

Publishing Calendar consumes the same `PublicationSchedule` records.

An edit made from Calendar routes through the same ScheduleService.

No duplicate Calendar schedule entity.

---

## Design 125 integration

Design 125 should inspect one Publication deeply:

* versions;
* targets;
* attempts;
* verification;
* live locations;
* corrections/takedowns if supported.

Design 124 remains queue/operations overview.

---

## Design 127 integration

After required Publication targets become verified:

emit:

```text
PublicationVerified
```

or equivalent.

Distribution can consume it.

---

## Distribution must not be executed inside Publication Attempt

Absolute.

Do not:

```text
publish
then immediately PATCH distribution tables
inside same transaction
```

Use canonical events/workflows.

---

## Distribution eligibility ≠ Distribution started

Permanent.

---

## Client Portal integration

Design 072 should receive:

* safe Publication title;
* exact verified release version;
* verified live link/placement;
* publication date.

It must not expose:

* provider errors;
* internal retry data;
* credentials;
* internal target configuration.

---

## Project archive integration

Publication execution should reference immutable release/artifact identities.

An archived source Project can remain historical context.

Publication engine should not need to reopen Project merely to send a previously approved exact artifact.

---

## Activity

Design 119 may project:

```text
PublicationCreated
PublicationScheduled
PublicationRescheduled
PublicationAttemptStarted
PublicationTargetVerified
PublicationTargetFailed
PublicationCompleted
```

Activity remains projection.

---

## Audit

Material publishing actions should capture:

* Publication/release-version creation;
* schedule/reschedule/cancellation;
* Publish Now;
* retry;
* manual verification/override if supported;
* correction/takedown if later supported.

---

## System actor

Scheduled execution should record:

```text
initiatedBy = SYSTEM/SCHEDULER
```

while retaining:

```text
scheduledBy = human actor
```

These are different responsibilities.

---

## Notification

Design 080 may notify operators about:

* publish failure;
* unknown outcome;
* verification failure;
* completed publication.

Notification state never changes Publication state.

---

## Search

Design 079 may index:

* Publication title;
* source context;
* release state;
* verified destinations.

Search index is not release authority.

---

## Integration health

Designs 139/140 later become the authoritative connected-service/health surface.

Design 124 may consume:

```text
connection status
health
last error
```

but never own provider credentials or integration lifecycle.

---

## Connection health unavailable ≠ target invalid

Return unknown/degraded state appropriately.

---

## Optimistic concurrency

Critical races:

### Editor creates v4 while operator schedules v3

Safe because schedule pins v3.

### Operator reschedules while scheduler claims job

Use revision/state transition protection.

### Two operators click Publish Now

Execution key/idempotency prevents duplicates.

### Callback says completed while manual retry begins

Retry eligibility must recheck current Attempt/provider state transactionally.

---

## Idempotency

Critical for:

* Publication creation;
* release-version creation;
* schedule;
* Publish Now;
* scheduler claim;
* provider execution;
* callback processing;
* retry;
* verification.

---

## Outbox

Use reliable outbox for internal cross-domain events such as:

```text
PublicationScheduled
PublicationAttemptStarted
PublicationVerified
PublicationFailed
```

---

## Queue projection

The Queue should be rebuildable from canonical entities.

Do not update queue rows manually as source truth.

---

## Projection lag

If Publication succeeds but queue projection is briefly stale:

source Publication/Attempt remains correct.

UI may indicate refreshing rather than re-executing.

---

## Caching

Publishing Queue cache should vary by:

```text
organizationMembershipId
authorizationRevision
publicationRevision
publicationVersionRevision
targetRevision
scheduleRevision
attemptRevision
providerEventRevision
verificationRevision
integrationHealthRevision
filters/sort/cursor
```

---

## Cached readiness is never publish authority

Absolute.

---

## Performance

Use:

* indexed queue-state queries;
* precomputed target summaries;
* current release-version pointers;
* batched integration health;
* lazy Attempt/provider-event history;
* cursor pagination;
* bounded queue windows.

Do not load every historical Attempt/provider event for every queue row.

---

## Partial failure contract

Example:

```text
Publication core      ✓
Schedules             ✓
Attempts              ✓
Provider health       ✓
Verification service  ✕
```

Correct:

> Provider accepted the release; live verification is currently unavailable.

Incorrect:

> Published successfully.

Another:

```text
Website target       VERIFIED
Platform target      VERIFIED
Partner target       FAILED
```

Correct:

> 2 of 3 required targets verified; Publication requires attention.

Not:

> Published.

Another:

```text
Attempt response     UNKNOWN
Provider status API  unavailable
```

Correct:

> Publication outcome is unknown. Do not retry until reconciled.

Not:

> Failed — Retry.

---

## Backend Requirement Matrix

| Requirement                                   | Status                                     |
| --------------------------------------------- | ------------------------------------------ |
| Design 031 canonical Publication reuse        | **Critical**                               |
| No second publishing engine in 124            | **Critical**                               |
| QueueItem/Publication separation              | **Critical**                               |
| Publication/PublicationVersion separation     | **Critical**                               |
| PublicationVersion/source artifact separation | **Critical**                               |
| Exact source-version pinning                  | **Critical**                               |
| Scheduled/latest version separation           | **Critical**                               |
| Scheduled release cannot silently upgrade     | **Critical**                               |
| PublicationTarget/provider-account separation | **Critical**                               |
| Target/Attempt separation                     | **Critical**                               |
| Schedule/Attempt separation                   | **Critical**                               |
| Schedule pins exact version                   | **Critical**                               |
| Timezone-safe scheduling                      | **Critical**                               |
| Durable scheduler                             | **Critical**                               |
| Atomic job claiming                           | **Critical**                               |
| Provider adapter registry                     | **Critical**                               |
| Credentials outside Publication domain        | **Critical**                               |
| Attempt/ProviderEvent separation              | **Critical**                               |
| Provider-event idempotency                    | **Critical**                               |
| Out-of-order callback handling                | **Critical**                               |
| Provider acceptance/live-state separation     | **Critical**                               |
| Live/verified separation                      | **Critical**                               |
| Verification evidence/freshness               | **Critical**                               |
| Safe SSRF-resistant verification              | **Critical where URL verification occurs** |
| Required/optional target semantics            | **Critical**                               |
| Target state/aggregate state separation       | **Critical**                               |
| Partial publication first-class               | **Critical**                               |
| Outcome-unknown/retryable-failure separation  | **Critical**                               |
| Unknown outcome reconciliation before retry   | **Critical**                               |
| Retry same exact version                      | **Critical**                               |
| Retry preserves prior Attempt                 | **Critical**                               |
| Cancellation/unpublish separation             | **Critical**                               |
| Schedule cancellation race handling           | **Critical**                               |
| Design 114 Deliverable reuse                  | **Critical**                               |
| Design 115 Approval reuse                     | **Critical when required**                 |
| Design 121 Handover separation                | **Critical**                               |
| Design 123 Archive separation                 | **Critical**                               |
| Design 125 same Publication backend           | **Critical architecture**                  |
| Design 126 same PublicationSchedule backend   | **Critical architecture**                  |
| Designs 127–130 Distribution separation       | **Critical architecture**                  |
| Designs 055/072 client-safe projection reuse  | **Critical**                               |
| Designs 139/140 Integration-health reuse      | **Critical architecture**                  |
| Publish/schedule/retry permissions separated  | **Critical**                               |
| Cross-tenant target execution prohibited      | **Critical**                               |
| Optimistic concurrency                        | **Critical**                               |
| Idempotency across external side effects      | **Critical**                               |
| Audit/outbox integration                      | **Required**                               |
| Partial dependency failure handling           | **Critical**                               |

---

# 8. Consolidation

Design 124 has one of the highest external-side-effect risks in the platform because publishing can produce irreversible or duplicate public releases.

**Design 031 / Design 124 Publication duplication**
Two publishing backends diverge.

**PublishingQueueItem / Publication conflation**
Read-model status becomes release truth.

**Publication / PublicationVersion conflation**
Release history becomes mutable.

**PublicationVersion / source DraftVersion conflation**
Editorial revision and provider release identity collapse.

**PublicationArtifact / current source entity conflation**
Execution publishes whatever is latest.

**Latest version / scheduled version conflation**
Last-minute draft silently replaces approved release.

**Scheduled version / published version conflation**
Schedule intent becomes execution evidence.

**Publication / Deliverable conflation**
Project output is treated as automatically public.

**Deliverable ready / Publication ready conflation**
Target/provider requirements disappear.

**Final Handover / Publication conflation**
Client delivery publishes content publicly.

**Archived Project / cancelled Publication conflation**
Historical Project state stops scheduled release.

**PublicationTarget / channel enum conflation**
Multiple properties/accounts cannot be distinguished.

**PublicationTarget / provider credential conflation**
Publishing records contain secrets.

**Provider connection / Target conflation**
Reconnect breaks target identity.

**Schedule / Publication conflation**
Every Publication must have one mutable date.

**Schedule / Calendar event conflation**
Calendar becomes another publication scheduler.

**Schedule / Attempt conflation**
Intended time and execution evidence disappear.

**Schedule due / Attempt started conflation**
Worker delays are hidden.

**Timezone / server local time conflation**
Release happens at wrong hour.

**Date-time / date-only conflation**
Calendar shifts occur.

**Scheduler job / Publication domain entity conflation**
Infrastructure queue message becomes business truth.

**Scheduler retry / duplicate publication conflation**
Same content goes live twice.

**Attempt / Publication conflation**
Failed provider call makes whole Publication permanently failed.

**Attempt / ProviderEvent conflation**
Callback history disappears.

**Provider HTTP 200 / Published conflation**
Accepted request is treated as public success.

**Provider job completed / Verified live conflation**
Public destination may still be unavailable/wrong.

**Live URL present / Verification conflation**
Stored URL string becomes proof.

**Verification / provider status conflation**
Independent confidence disappears.

**Verification freshness / permanent truth conflation**
Old verification claims page still live forever.

**One target verified / all targets published conflation**
Multi-target partial state disappears.

**Required / optional targets conflation**
Optional failure blocks release or required failure is ignored.

**Target failure / Publication cancellation conflation**
Successful targets lose historical success.

**Partial publication / full publication conflation**
Operators cannot see missing destinations.

**Attempt failure / unknown outcome conflation**
Blind retries create duplicates.

**Outcome unknown / retryable failure conflation**
External side effect is repeated unsafely.

**Retry / republish latest conflation**
Retry sends changed content.

**Retry / overwrite Attempt conflation**
Operational history disappears.

**Rate limit / disconnected account conflation**
Healthy connection is marked broken.

**Auth error / content validation failure conflation**
Wrong remediation is suggested.

**Callback received / callback trusted conflation**
Unverified external events mutate state.

**Duplicate webhook / duplicate state transition conflation**
Counters/events repeat.

**Out-of-order callback / lifecycle regression conflation**
Completed release becomes Processing again.

**Provider object ID / Publication ID conflation**
Provider migration breaks business identity.

**Cancellation / Unpublish conflation**
Stopping future schedule removes live content.

**Cancel requested / cancelled conflation**
Race with worker hides actual public release.

**Reschedule / overwrite history conflation**
Cannot explain why release changed.

**Publication / DistributionCampaign conflation**
Publishing and promotion become one engine.

**Publication verified / Distribution completed conflation**
No downstream distribution actually occurred.

**Distribution target / PublicationTarget conflation**
Canonical publishing destination and promotional placement lose boundaries.

**Client live link / stored URL conflation**
Unverified internal string appears in Portal.

**Internal provider error / Client Portal status conflation**
Operational details leak externally.

**Integration health / Publication lifecycle conflation**
Provider outage marks content not ready.

**Integration admin / publisher conflation**
Credential administrator gains release authority.

**Content editor / publisher conflation**
Editorial user can make content public.

**Schedule permission / Publish Now permission conflation**
Planning role can bypass release governance.

**Project archive permission / publishing permission conflation**
Archive administrator controls public release.

**Search index / publication authority conflation**
Stale search result drives execution.

**Notification / Publication state conflation**
Failure alert acknowledgement changes release.

**Activity event / publication evidence conflation**
“Published” timeline text replaces provider/verification evidence.

**Audit event / PublicationAttempt conflation**
Governance log becomes release execution record.

**Queue projection lag / publish failure conflation**
Operator re-publishes because row is stale.

**Cached readiness / current readiness conflation**
Changed Approval/artifact is ignored.

**Generic `published = true` boolean**
Cannot represent targets, attempts, verification or partial release.

**Generic `publishing_status` string**
Readiness, schedule, attempt, provider and verification collapse.

**Generic Publication mega-PATCH**
Version, schedule, target, execution, live URL and status mutate together.

**124/031 duplicate Publication engine**
Original Publishing Hub and new Queue disagree.

**124/114 duplicate final-artifact state**
Publishing chooses another “final” file.

**124/115 duplicate Approval state**
Queue marks source approved.

**124/121 duplicate Handover state**
Publishing claims client delivery.

**124/123 duplicate Project lifecycle**
Archived Project becomes release state.

**124/125 duplicate Attempt/verification truth**
Queue and detail disagree.

**124/126 duplicate schedule backend**
Queue and Calendar publish at different times.

**124/127 duplicate Distribution execution**
Publication Attempt creates campaigns directly.

**124/129 duplicate verification semantics**
Publishing live verification and Distribution-placement verification collapse.

**124/139–140 duplicate provider connection state**
Queue stores its own connection/secret lifecycle.

No additional screen is required.

These are **Publication identity, exact release-version pinning, multi-target execution, scheduling, provider abstraction, idempotency, unknown-outcome reconciliation, external verification, partial release, Distribution separation, and client-safe projection requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PUBLICATION QUEUE EXECUTION, MULTI-TARGET SCHEDULING & RELEASE-OPERATIONS SURFACE ON THE DESIGN-031 FOUNDATION**

**Domain directive:**
**Publication ≠ PublicationVersion/PublicationArtifact ≠ PublicationTarget ≠ PublicationSchedule ≠ PublicationAttempt ≠ ProviderEvent ≠ ProviderAcceptance ≠ Verification ≠ Placement/LiveLocation ≠ PublishingQueueItem ≠ SourceDeliverable ≠ FinalHandover ≠ DistributionCampaign ≠ Project.**

**Foundation directive:**
Design 031 remains the single canonical Publication domain. Design 124 is its operational queue/release-management composition and must not create a parallel Publication service, status model, target model, or execution engine.

**Queue directive:**
`PublishingQueueItem` is a permission-safe rebuildable read projection. It never owns Publication state or becomes a generic writable work item.

**Publication directive:**
`Publication` is stable release identity; `PublicationVersion` represents one exact release configuration/content revision.

**Version directive:**
every scheduled or executing release pins an exact immutable PublicationVersion. “Current,” “latest draft,” “scheduled,” and “published” versions may legitimately differ.

**No-latest directive:**
scheduler/worker/provider adapters never resolve `latest` at execution time. They execute the exact version stored by the scheduling/release intent.

**Source-artifact directive:**
Design 114 and specialized production domains remain authoritative for exact source Deliverables/DraftVersions/ProofVersions/media versions. Publishing references them without becoming another content-authoring domain.

**Immutability directive:**
once a PublicationVersion has been scheduled/executed, material edits create another version rather than rewriting the content that historical Attempts used.

**Payload directive:**
provider execution uses a deterministic exact release payload/snapshot derived from the pinned PublicationVersion so later source metadata edits cannot alter an already scheduled release.

**Target directive:**
`PublicationTarget` identifies the concrete destination/property/account context and remains distinct from provider connection credentials and generic channel labels.

**Integration directive:**
provider credentials, connection lifecycle and health remain the secure Integration domains later surfaced by Designs 139–140. Publishing only consumes authorized references/health.

**Schedule directive:**
`PublicationSchedule` pins exact PublicationVersion + Target + timezone-aware scheduled time and remains distinct from Calendar projection and execution Attempt.

**Calendar directive:**
Design 126 consumes the same canonical PublicationSchedule. Queue and Calendar edits converge on one ScheduleService.

**Durability directive:**
scheduling uses durable database/queue mechanisms with atomic worker claiming—not browser timers, server-memory timers, or client-side state.

**Execution directive:**
every external publishing side effect is represented through a stable `PublicationAttempt` with exact PublicationVersion and Target lineage.

**Idempotency directive:**
Publication creation, version creation, scheduling, Publish Now, worker claiming, provider requests, callbacks, retry and verification are all replay-safe.

**External-idempotency directive:**
provider idempotency keys are used where available; where absent, internal execution keys and reconciliation prevent duplicate live releases.

**Provider-event directive:**
external callbacks/events are immutable evidence, signature/auth verified where supported, deduplicated and normalized before affecting state.

**Ordering directive:**
duplicate and out-of-order provider events cannot regress already established stronger states.

**Acceptance directive:**
provider HTTP success/job acceptance means only provider acceptance. It can never be treated as verified live publication by itself.

**Verification directive:**
`PublicationVerificationService` independently determines whether the exact release version is publicly/live correctly on the target and preserves verification method/time/evidence.

**Freshness directive:**
where current live status matters, verification retains freshness; a months-old verification is not automatically current proof.

**SSRF directive:**
server-side URL/live-page verification must enforce strict outbound-request security and never fetch arbitrary user-controlled private-network destinations.

**Attempt-state directive:**
retryable failure, permanent failure, provider-auth failure, rate limiting, provider acceptance and outcome-unknown remain different states with different remediation.

**Unknown-outcome directive:**
if external publication may have occurred but confirmation was lost, the system enters `OUTCOME_UNKNOWN` and must reconcile before retrying.

**No-blind-retry directive:**
blind retry on uncertain external side effects is prohibited because it can create duplicate articles/posts/releases.

**Retry directive:**
retry means another Attempt against the **same exact PublicationVersion/Target execution intent**. It never silently publishes a newer release version.

**History directive:**
new Attempts preserve earlier Attempt/provider-event evidence. Retry never overwrites the failed/unknown Attempt.

**Partial-release directive:**
multi-target publication is first-class. Individual Target states remain visible and an aggregate state is derived according to required/optional target policy.

**Aggregate directive:**
one centralized `PublicationAggregateStateResolver` computes Publication queue state; frontend counts or `published=true` booleans are never authoritative.

**Required-target directive:**
required and optional targets are distinct so an optional placement failure cannot incorrectly block a complete release and a mandatory destination cannot be ignored.

**Cancellation directive:**
cancelling a future schedule is different from cancelling the Publication and completely different from taking down/unpublishing already-live content.

**Race directive:**
schedule cancellation/reschedule and scheduler execution must use revision/claim-state safeguards so operators know whether a release actually executed.

**Approval directive:**
Design 115/029 remain formal Approval authority. Where Approval is required to publish, readiness resolves exact Approval evidence and never copies an approval boolean into Publication.

**Readiness directive:**
`PublicationReadinessResolver` freshly validates exact artifact, required Approval, metadata, target configuration and current known operational constraints before schedule/publish execution.

**Cached-state directive:**
cached Ready status is never publication authority. Publish/Schedule commands perform fresh server validation.

**Handover directive:**
Design 121 remains final Client-delivery authority. Handed over does not mean published and published does not mean formally handed over.

**Archive directive:**
Design 123 remains Project archive authority. An archived source Project does not become a publication state and should not require cloning/reopening merely to execute a legitimate scheduled exact artifact.

**Client directive:**
Designs 055/072 consume safe exact verified publication/live-link projections. They never receive internal provider errors, retry records, credentials or mutable unverified links as public truth.

**Detail directive:**
Design 125 must use these exact Publication/Version/Target/Schedule/Attempt/Verification records for detailed release management. It cannot introduce a second detailed Publication backend.

**Distribution directive:**
Designs 032/127–130 remain canonical Distribution authority. Publishing ends with externally verified release state; Distribution begins as a separate campaign/placement/performance process.

**Event directive:**
verified publication can emit canonical events consumed by Distribution, Reporting, Client Portal, Activity and analytics without directly mutating those domains inside the provider transaction.

**Activity directive:**
Design 119 projects publishing events chronologically but Activity text never substitutes for Attempts/ProviderEvents/Verification evidence.

**Audit directive:**
material human/system actions—scheduling, rescheduling, cancellation, Publish Now, retry, manual verification/override and later correction/takedown where supported—produce actor/version-aware Design-039 Audit evidence.

**System-actor directive:**
scheduled worker execution uses explicit SYSTEM/SCHEDULER actor identity while preserving which human scheduled/authorized the release.

**Notification directive:**
Design 080 may alert operators of failures, unknown outcomes or successful verification, but Notification read/dismiss state never changes Publication.

**Permission directive:**
read, content preparation, scheduling, Publish Now, retry, target management, provider integration administration and verification overrides remain independently server-authorized.

**Tenant directive:**
Publication, exact artifact, Target, provider account/connection, Schedule, Attempt and Placement remain strictly tenant-scoped.

**Concurrency directive:**
version creation, schedule edits, Publish Now, worker claims, retries and provider callbacks use optimistic/transactional safeguards so parallel operators and workers cannot duplicate or silently alter releases.

**Caching directive:**
Queue caches vary by authorization and Publication/Version/Target/Schedule/Attempt/ProviderEvent/Verification/Integration-health revisions. Cached queue rows never authorize external side effects.

**Partial-failure directive:**
Publication core, integration health, provider execution and verification services may fail independently. `Unavailable` can never become `Failed`, `Verified`, `No targets`, or “safe to retry” without evidence.

**Performance directive:**
use indexed queue summaries, precomputed target aggregates, batched connection/verification state, lazy Attempt/provider-event histories and cursor pagination rather than loading complete release histories for every row.

**Future-reuse directive:**
Design **125 — Publication Detail / Release Management** must drill into one canonical Publication and its exact Versions, Targets, Schedules, Attempts, ProviderEvents, verified live placements and release history. It must not create a separate `PublicationDetail` business entity or different publication status engine.

**Overlap directive:**
Designs **031, 055, 072, 114–129, 139–140** must preserve one continuous **exact approved source artifact → Publication → immutable PublicationVersion → PublicationTarget + PublicationSchedule → idempotent PublicationAttempt → verified ProviderEvent/outcome → PublicationVerification/live placement → client-safe live-link projection → separate Distribution workflow** lineage.

**Consolidation directive:**
**STANDARDIZE ONE PUBLISHING FOUNDATION — DESIGN-031 CANONICAL PUBLICATION IDENTITY + IMMUTABLE EXACT PUBLICATIONVERSIONS/ARTIFACT REFERENCES + CONCRETE PUBLICATIONTARGETS + TIMEZONE-SAFE DURABLE SCHEDULES + IDEMPOTENT ATTEMPT/PROVIDER ADAPTER EXECUTION + VERIFIED/DUPLICATE-SAFE PROVIDER EVENTS + EXPLICIT OUTCOME-UNKNOWN RECONCILIATION + INDEPENDENT LIVE VERIFICATION + REQUIRED/OPTIONAL MULTI-TARGET AGGREGATION + SAME BACKEND FOR QUEUE/DETAIL/CALENDAR/CLIENT LIVE-LINKS + STRICT DISTRIBUTION/INTEGRATION/PROJECT/HANDOVER SEPARATION — AND NEVER ALLOW “LATEST” CONTENT, PROVIDER HTTP SUCCESS, QUEUE BADGES, CALENDAR ITEMS, RETRY BUTTONS, STORED LIVE URLs, ARCHIVED PROJECT STATE OR GENERIC `PUBLISHED=true` FLAGS TO SUBSTITUTE FOR OR REWRITE CANONICAL PUBLICATION VERSION, TARGET EXECUTION, VERIFICATION OR DISTRIBUTION TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **124 / 153** |
| **PASS**                                   |                        **124** |
| **STANDARDIZE decisions**                  |                        **122** |
| **Potential implementation-overlap flags** |                        **115** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**124 / 153 = 81.0% audited.**

### Canonical publishing architecture after Design 124

```text
EXACT SOURCE ARTIFACT
Draft / Proof / Deliverable Version
             │
             ↓
       PUBLICATION
             │
             ↓
   PUBLICATION VERSION v3
             │
      ┌──────┼──────┐
      ↓      ↓      ↓
   Target A Target B Target C
      │      │      │
   Schedule Schedule Schedule
      │      │      │
   Attempt  Attempt Attempt
      │      │      │
 Provider evidence/events
      │      │      │
 Verification
      │      │      │
   VERIFIED PENDING FAILED
             │
             ↓
     Aggregate Queue State
        = PARTIAL
```

The exact-version rule is absolute:

```text
Publication v3
scheduled for Aug 25

Later:

Publication v4 created

RESULT:

Aug 25 schedule still publishes v3.

v4 is not substituted automatically.
```

External-provider safety is also explicit:

```text
Provider API returned:
200 OK

        ≠

Public release verified.

Correct flow:

API accepted
    ↓
Provider processing
    ↓
Live placement detected
    ↓
Correct version verified
    ↓
VERIFIED
```

Unknown outcomes must never be blindly retried:

```text
Attempt A-10 sent
      ↓
network response lost
      ↓
Could be published
Could be not published

STATE:
OUTCOME UNKNOWN

NEXT:
reconcile provider/live state

NOT:
immediately retry
```

And publishing remains distinct from distribution:

```text
Publication verified live
          ↓
content becomes eligible
for Distribution

          ≠

Distribution Campaign started
          ≠
Distribution Placement verified
          ≠
Distribution performance measured
```

## Next Sequential Audit Target

### **Design 125 — Publication Detail / Release Management**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
