# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 072 — Client Publishing / Live Links Detail

Its frozen identity and supplied route annotation **`/client/publishing`** are locked. Exact route connections remain a **Phase 3B** concern and are not being redesigned here.

Design 072 should become the **canonical Client Portal publishing-status and verified-live-link detail surface** for Client-visible Publications, their exact released artifacts/versions, configured destinations, schedules, publication attempts, resulting placements, and the current verification state of those placements.

Its governing boundary is:

> **Publication ≠ PublicationVersion/Artifact ≠ PublicationTarget ≠ Schedule ≠ PublicationAttempt ≠ ProviderAcceptance ≠ Placement ≠ Verification ≠ LiveLink ≠ Distribution ≠ ClientAction.**

The central implementation rule is:

> **Design 072 reports canonical release truth; it does not manufacture it. A publication is not live merely because content is ready, scheduled, submitted to a provider, or accepted by an API. A Client-visible live link must resolve from an exact placement of an exact published version whose availability has been verified according to a governed verification policy.**

---

# 1. Classification

| Audit field                               | Classification                                                                                                                                                 |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                             | **072**                                                                                                                                                        |
| **Canonical name**                        | **Client Publishing / Live Links Detail**                                                                                                                      |
| **Product area**                          | Client Portal / Publishing / Release Delivery                                                                                                                  |
| **User surface**                          | **Client Portal**                                                                                                                                              |
| **Screen class**                          | Publishing Status + Placement + Live-Link Detail Workspace                                                                                                     |
| **Classification**                        | **Portal Delivery Detail Anchor — Client Publication & Verified Live Placement Family**                                                                        |
| **Primary purpose**                       | Show what Client media has actually been released, where it was intended to publish, what has genuinely gone live, and which live links are currently verified |
| **Canonical Publishing foundation**       | Design 031                                                                                                                                                     |
| **Client publishing overview foundation** | Design 055                                                                                                                                                     |
| **Project/media dependencies**            | Designs 023 / 043 / 065 / 066                                                                                                                                  |
| **Primary canonical entity**              | **Publication**                                                                                                                                                |
| **Exact release-content entity**          | **PublicationVersion / PublicationArtifact**                                                                                                                   |
| **Destination entity**                    | **PublicationTarget**                                                                                                                                          |
| **Scheduling entity**                     | **PublicationSchedule / Schedule**                                                                                                                             |
| **Execution entity**                      | **PublicationAttempt**                                                                                                                                         |
| **Provider response concept**             | **ProviderAcceptance / ProviderEvent**                                                                                                                         |
| **Resulting destination entity**          | **Placement**                                                                                                                                                  |
| **Evidence entity**                       | **Verification / PlacementVerification**                                                                                                                       |
| **Client-facing link projection**         | **LiveLink**                                                                                                                                                   |
| **Distribution dependency**               | Designs 032 / 055 / next 073                                                                                                                                   |
| **Asset/File dependency**                 | Design 030                                                                                                                                                     |
| **Client Action dependency**              | Design 047 where applicable                                                                                                                                    |
| **Notification dependency**               | Designs 061 / 064                                                                                                                                              |
| **Activity dependency**                   | Design 063                                                                                                                                                     |
| **Internal publishing overlap**           | Designs 124–126                                                                                                                                                |
| **Parent shell**                          | `ClientPortalShell` — Design 002                                                                                                                               |
| **Primary read model**                    | `ClientPublishingDetailView`                                                                                                                                   |
| **Template family**                       | `ClientPublicationDeliveryDetailTemplate`                                                                                                                      |
| **Auth**                                  | Required                                                                                                                                                       |
| **Authorization**                         | Active Portal membership + Project/Publication visibility + placement/link entitlement                                                                         |
| **Implementation priority**               | **Critical Delivery Truth / Release Verification / Client Trust**                                                                                              |
| **Reuse level**                           | **Extremely High with Designs 031 and 055**                                                                                                                    |

Design 072 should answer:

> **“Which exact media version was released, which destinations were targeted, what was merely scheduled or attempted, which placements are actually live, when were those placements last verified, which links can I safely open now, and what remains unpublished or unverifiable?”**

Canonical architecture:

```text
Production / Media Domain
        ↓
Approved exact artifact/version
        ↓
Publication
        ↓
PublicationVersion
        │
        ├── exact content/artifact references
        └── exact release metadata
                 │
                 ↓
          PublicationTarget(s)
                 │
          ┌──────┴──────┐
          ↓             ↓
       Schedule     Immediate release
          │             │
          └──────┬──────┘
                 ↓
        PublicationAttempt
                 ↓
          Provider response
                 ↓
              Placement
                 ↓
            Verification
                 ↓
        Client-safe LiveLink
                 ↓
             Design 072
```

---

# 2. Reuse

## Design 031 remains the canonical Publishing engine

Design 031 already established:

> **Publication ≠ PublicationVersion/Artifact ≠ Target ≠ Schedule ≠ Attempt.**

It also established the critical rule:

> **Production-ready ≠ published, scheduled ≠ published, provider accepted ≠ verified live.**

Design 072 must consume that same Publishing domain directly.

Do **not** create:

```text
ClientPublication
PortalPublication
ClientLivePublication
PublishedMediaRecord
```

as parallel business truth.

Correct:

```text
Design 031
Canonical Publishing domain
        │
        ├── Design 055
        │   Client publishing/distribution overview
        │
        └── Design 072
            Client publication/live-link detail
```

---

## Design 055 remains the Client publishing overview

Design 055 answers broadly:

> What has been published/distributed for this Client?

Design 072 goes deeper into the Publishing side:

> Which exact Publication/version/targets/placements are live and verified?

Both surfaces must agree on:

* publication identity,
* release state,
* verification state,
* live-link availability.

---

## Design 065 / 066 provide media context, not release truth

Design 065 may show:

> Magazine published.

Design 066 may show:

> Publication live.

But both must consume the same Design 031 result that Design 072 exposes in more detail.

Correct:

```text
Publication P-101
      │
      ├── Design 065 summary
      ├── Design 066 media detail
      ├── Design 072 publishing detail
      └── Design 073 distribution detail
```

Same Publication.

---

## Reuse exact approved production artifacts

A PublicationVersion should point to exact production outputs such as:

* Magazine reader build,
* exact approved PDF,
* exact Podcast media version,
* exact VideoVersion,
* exact approved event/media artifact,

according to its specialized production domain.

Do not publish “whatever is latest.”

---

## Reuse Design 030 for release artifacts

PublicationVersion may reference:

```text
Asset
FileVersion
ReaderBuild
MediaVersion
```

as appropriate.

The publishing system pins exact versions.

It must not copy/mutate source media independently.

---

## Reuse Design 047 ClientAction only where a genuine Client obligation exists

If the frozen Design shows actions such as:

* approve required release information,
* provide missing publication input,

those can be sourced from Design 047.

But a Publishing status such as:

> Verification pending

is not automatically a ClientAction.

---

## Reuse Design 063 Activity

Meaningful release events may produce:

> Magazine published.

> Website placement verified live.

But Activity remains history projection.

---

## Reuse Design 064 Notifications

Notifications can alert:

> Your magazine is now live.

That message should originate only after the canonical release/verification policy says it is appropriate.

Notification does not establish publication truth.

---

## Design 072 ≠ Design 073

This distinction is fundamental.

### Design 072 — Publishing

Answers:

> Did the canonical media/content release succeed, and where is the resulting live placement?

### Design 073 — Distribution

Answers:

> How was that published content subsequently distributed/amplified across channels, placements, campaigns, and performance contexts?

Therefore:

> **Publication ≠ Distribution.**

---

# 3. Entities

## Publication ≠ PublicationVersion

`Publication` is the stable release identity/workstream.

`PublicationVersion` identifies the exact content/artifact release version.

Conceptually:

```text
Publication PUB-101
├── PublicationVersion v1
├── PublicationVersion v2
└── PublicationVersion v3
```

Do not make Publication itself the mutable content payload.

---

## PublicationVersion should pin exact source content

Conceptually:

```text
PublicationVersion
├── publicationId
├── source domain
├── source entity/version
├── exact Asset/FileVersion
├── title/copy snapshot
├── release metadata
└── created/frozen timestamp
```

Exact schema belongs to Phase 3D.

---

## PublicationVersion ≠ latest production artifact

Critical example:

```text
Latest internal Magazine ReaderBuild:
RB-9

Approved/release-selected ReaderBuild:
RB-7
```

Publication must release **RB-7** if that is the explicitly approved version.

Never resolve source content dynamically using:

```text
latest
```

during execution.

---

## PublicationVersion ≠ PublicationArtifact necessarily

A PublicationVersion can logically represent the exact release package.

One or more exact artifacts may support it.

Example:

```text
PublicationVersion PV-3
├── Web HTML representation
├── Cover image FileVersion
├── downloadable PDF FileVersion
└── ReaderBuild RB-7
```

Do not force all publishing models into one file.

---

## Production-ready ≠ Publication

A media output may satisfy all production gates.

That only means:

> eligible to create/release a Publication.

It does not prove one exists.

---

## Publication ≠ Schedule

A Publication can exist without a future schedule if released immediately.

A Schedule is intent:

> Publish this PublicationVersion at time T.

---

## Schedule ≠ published

Permanent:

```text
scheduledAt = Aug 30 10:00
≠
Published
```

---

## Schedule needs time-zone semantics

A scheduled release should preserve:

* intended local time where relevant,
* canonical instant,
* timezone,
* daylight-saving handling.

Do not schedule from an ambiguous display string.

---

## Schedule modification ≠ PublicationVersion modification

Changing release time should not change the content version being published unless explicitly reconfigured.

---

## Cancelled schedule ≠ cancelled Publication

A scheduled attempt can be cancelled/rescheduled while the Publication remains valid.

---

## PublicationTarget ≠ Publication

One PublicationVersion may target multiple destinations.

Example:

```text
Publication PUB-101 / v3
├── Target: Perspective Website
├── Target: Digital Magazine Reader
└── Target: Syndication destination
```

Each target has its own execution/result state.

---

## One Publication ≠ one destination

Architecture must support:

```text
1 Publication
→ N PublicationTargets
```

without cloning the Publication into unrelated records.

---

## Target ≠ Placement

`PublicationTarget` says:

> where we intend to publish.

`Placement` says:

> where the published result actually exists.

Example:

```text
Target:
Corporate Website

Placement:
https://example.com/magazine/executive-issue
```

---

## Target configuration ≠ provider credentials

A Client-facing target can safely show:

> Website

without exposing:

* OAuth tokens,
* CMS credentials,
* API account secrets.

---

## PublicationAttempt ≠ Publication

Each target can require one or more execution attempts.

Conceptually:

```text
PublicationTarget T1
├── Attempt A1 — timeout
└── Attempt A2 — succeeded
```

Do not overwrite attempt history.

---

## PublicationAttempt ≠ Schedule

A Schedule can create an Attempt when due.

The scheduled intent and actual execution remain separate.

---

## PublicationAttempt ≠ ProviderAcceptance

Attempt is internal execution identity.

ProviderAcceptance is one provider outcome/event associated with that attempt.

---

## Provider acceptance ≠ Placement

The provider can accept a request before the final public resource is accessible.

Example:

```text
API:
202 Accepted

        ≠

Actual live page exists
```

---

## Provider acceptance ≠ published

Permanent.

A provider may accept processing and fail later.

---

## Provider acceptance ≠ verified live

Even a provider response saying:

> published

does not necessarily prove the public URL resolves correctly.

Verification is a distinct step.

---

## ProviderEvent ≠ canonical Publication state

Raw provider callbacks/status values must be normalized.

Do not spread provider-specific strings such as:

```text
PUBLISHED_OK
POST_ACTIVE
RESOURCE_READY
```

through core product logic.

---

## Placement is the resulting external/internal release location

Conceptually:

```text
Placement
├── publicationVersionId
├── targetId
├── provider/account reference
├── canonical external resource ID
├── canonical URL
├── firstPublishedAt
└── lifecycle
```

Exact schema later.

---

## Placement ≠ LiveLink

`Placement` is the business record describing where release exists.

`LiveLink` is a Client-safe navigational projection from that Placement.

This matters because:

* URLs can change,
* verification can become stale,
* access policy can change.

---

## LiveLink should not be raw user-entered free text

A Client-visible live link should originate from:

* verified provider result,
* validated placement URL,
* governed manual placement entry with provenance,

not arbitrary frontend input.

---

## LiveLink binds exact PublicationVersion / Placement

Critical:

> A link must not say “Live” without identifying which exact released version it represents.

Conceptually:

```text
LiveLink
→ Placement PL-20
→ PublicationVersion PV-3
```

---

## New PublicationVersion ≠ mutate old Placement blindly

If v4 replaces v3 at the same external URL:

the system must preserve release/version history.

Current Placement projection can show v4 while historical publication evidence retains v3 lineage.

Do not rewrite:

> v3 was always v4.

---

## Stable URL ≠ same PublicationVersion

The same URL can host successively updated content.

Therefore:

```text
URL equality
≠
Version identity
```

---

## Placement ≠ Verification

Placement says:

> we believe/record that content exists here.

Verification says:

> evidence checked this placement at time T and found a specific result.

---

## Verification should be evidence-oriented

Conceptually:

```text
PlacementVerification
├── placementId
├── checkedAt
├── method
├── result
├── observed URL/status
├── observed content/version evidence
├── provenance
└── freshness/expiry semantics
```

Exact schema Phase 3D.

---

## Verified ≠ permanently verified

This is one of Design 072's most important requirements.

A URL verified yesterday may be:

* removed,
* redirected incorrectly,
* expired,
* access-restricted,
* replaced,
* broken today.

Therefore verification must carry freshness.

---

## `verifiedAt` without freshness policy is insufficient

The system needs an explicit concept equivalent to:

```text
VERIFIED_CURRENT
VERIFICATION_STALE
BROKEN
UNREACHABLE
UNKNOWN
```

or a timestamp + policy resolver.

Exact enum later.

---

## Stale verification ≠ broken

Important:

### Stale

The last successful check is older than policy allows.

### Broken

A recent check explicitly failed.

Do not treat both as the same state.

---

## Unable to verify ≠ broken

A verifier outage or provider rate limit can produce:

> Verification unavailable.

That does not prove the external link is broken.

---

## Broken ≠ unpublished historically

If a placement was previously verified live and later disappears:

historical truth remains:

> It was live at time T.

Current state becomes:

> no longer verified/broken.

Do not erase publication history.

---

## Retraction / unpublish ≠ deletion

If content is deliberately taken down:

keep:

* Publication,
* PublicationVersion,
* Placement,
* past verification evidence,
* unpublish/retraction event.

Do not hard-delete the release history.

---

## Placement removal ≠ Publication never happened

Same principle.

---

## Verification method provenance

Verification could come from:

* direct HTTP check,
* provider API,
* CMS confirmation,
* manual verified evidence,

depending on target.

These methods should preserve provenance.

---

## Manual verification ≠ automated verification

If the system permits manually asserting a placement:

mark provenance distinctly.

Do not represent human confirmation as automated technical verification.

---

## Verification ≠ content correctness necessarily

A 200 response alone may prove:

> URL resolves.

It may not prove:

> correct publication/version appears there.

Higher-confidence verification may compare:

* external resource ID,
* title,
* content fingerprint,
* publication/version metadata,

where possible.

---

## LiveLink display should reflect verification confidence/freshness

Client-safe examples might be:

* Live — verified recently
* Verification pending
* Link requires recheck
* Link currently unavailable

according to frozen UI.

Do not show a permanent green “Live” based solely on historical success.

---

## Publication aggregate state ≠ one target state

For multi-target Publication:

```text
Website          VERIFIED LIVE
Reader           VERIFIED LIVE
Syndication      FAILED
```

The overall Publication cannot simply be:

> Failed

or:

> Fully live

without a governed aggregate policy.

---

## Per-target state is authoritative at destination level

Design 072 should preserve each target's state.

A higher-level summary can be derived.

---

## Partially published should be possible conceptually

If some required targets succeed and others do not:

the system may need:

> Partially Published / Partially Verified

as a projection.

Do not collapse everything into one boolean.

---

## Required target ≠ optional target

If release policies distinguish target criticality:

overall completion should use policy rather than simple count.

Exact policy Phase 3D.

---

## Publication ≠ DistributionCampaign

Permanent.

Example:

```text
Publication:
Magazine issue is live on The Perspective website.

Distribution:
Promote the live publication via LinkedIn, Newsletter, Medium, PR, etc.
```

---

## PublicationTarget ≠ DistributionChannel automatically

Some destinations may conceptually look similar.

The business intent determines whether an operation is:

* primary publication,
* downstream distribution.

Do not decide based only on provider name.

---

## Distribution should consume published/verified placement references

Design 073 should be able to reference:

```text
Publication
PublicationVersion
Placement
LiveLink
```

without re-creating them.

---

## ClientAction ≠ Publication status

A ClientAction might exist if Client input is required.

But:

```text
Verification pending
```

does not automatically become a Client action.

---

## Notification ≠ publication state

A notification:

> Your publication is live

must be generated from canonical verified release truth.

Reading/dismissing it never alters Placement.

---

## Activity ≠ verification evidence

Design 063 may show:

> Magazine published.

But verification records remain the evidence.

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
Publication visibility
+
PublicationVersion visibility
+
Placement/link visibility
```

---

## Project read ≠ Publication detail automatically

A user may know a Project exists without being entitled to:

* embargoed release URLs,
* unreleased PublicationVersions,
* confidential destinations.

---

## Publication read ≠ publish authority

Client visibility should never imply internal capabilities such as:

```text
publish
retry publication
reschedule
unpublish
change target
```

unless explicitly part of frozen Client functionality.

Design 072 is primarily Client-safe delivery detail.

---

## Same Client ≠ same live-link access

Some releases may be:

* Project restricted,
* private,
* embargoed,
* role-scoped.

Do not expose every Publication to every Client Portal member.

---

## Embargoed placement

A valid Placement can exist before public disclosure.

Client-safe visibility must respect embargo/release policy.

---

## Preview URL ≠ live public link

Internal/provider preview links must never be labeled Live.

Keep:

```text
Preview
≠
Placement
≠
Verified LiveLink
```

---

## Provider management data must remain hidden

No Client DTO should expose:

* OAuth tokens,
* CMS credentials,
* provider tenant IDs unnecessarily,
* raw API errors containing secrets,
* webhook secrets.

---

## Live-link URL must be safe

Backend should validate/sanitize URLs.

Do not allow arbitrary dangerous schemes such as:

```text
javascript:
data:
file:
```

through a stored placement link.

---

## Redirect handling

If a verified URL redirects:

verification policy should determine whether the canonical Client LiveLink updates to the final safe URL or preserves original plus observed redirect.

Do not blindly follow/accept unsafe redirect destinations.

---

## Direct Placement ID reauthorization

Knowing a Placement ID must not expose a restricted link.

---

## Direct PublicationVersion ID reauthorization

Same for unreleased/internal PublicationVersions.

---

## Artifact download permission

Publication visibility does not automatically mean download rights to:

* source files,
* production assets,
* master media.

Design 030/051 rules remain.

---

## Verification evidence visibility

Clients may see:

* verified status,
* last verified time,
* safe link.

Raw verifier logs/provider diagnostics remain internal.

---

# 5. States

Design 072 requires separate dimensions for production readiness, scheduling, attempts, placement, verification, aggregate release, and Client action.

### Production/release eligibility

```text
Not Ready
Production Ready
Release Eligible
```

from upstream domains.

### Schedule state

```text
Not Scheduled
Scheduled
Rescheduled
Cancelled
Schedule Due
```

### PublicationAttempt state

```text
Not Started
Queued
Processing
Provider Accepted
Outcome Pending
Succeeded
Failed
Cancelled
Outcome Unknown
```

### Placement state

```text
No Placement Yet
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

### Aggregate publication state

Potential projection:

```text
Not Published
Publishing
Partially Published
Published / Verification Pending
Verified Live
Partially Verified
No Longer Fully Live
```

Exact labels remain Phase 3D/frozen UI dependent.

### Client action

```text
No Action
Client Input Required
Waiting on Publishing
Action Restricted
Action State Unavailable
```

These must never collapse into one `publication.status`.

---

## Production Ready ≠ Scheduled

Permanent.

---

## Scheduled ≠ Publishing

A future schedule has not executed yet.

---

## Publishing ≠ provider accepted

Processing can precede acceptance.

---

## Provider accepted ≠ placement created

Permanent.

---

## Placement created ≠ verified live

Permanent.

---

## Verified live ≠ permanently live

Permanent.

---

## Verification stale ≠ broken

Permanent.

---

## Verification unavailable ≠ broken

Critical.

---

## Broken ≠ never published

Historical publication remains.

---

## One target live ≠ all targets live

Critical for multi-target Publication.

---

## One target failed ≠ whole Publication necessarily failed

Aggregate policy determines result.

---

## Schedule missed ≠ automatically failed publication

A delayed queue/provider can still publish later.

Preserve:

* intended schedule,
* actual execution,
* actual published time.

---

## scheduledAt ≠ publishedAt

Permanent.

---

## providerAcceptedAt ≠ publishedAt

Permanent.

---

## publishedAt ≠ verifiedAt

Permanent.

---

## Verification timestamp should be explicit

This enables:

> Last verified 10 minutes ago.

rather than timeless green status.

---

## Reverification in progress ≠ unavailable

A previously verified link can remain historically known while current check runs.

---

## Updated externally

A placement may change outside the platform.

Periodic or event-driven verification must detect drift.

---

## Deleted externally

If provider content disappears:

state becomes broken/retracted/unknown according to evidence.

Do not silently leave Verified.

---

## Provider service unavailable ≠ Publication absent

Known placements and historical verification can remain visible.

---

## Verification service unavailable ≠ no live links

Show known link with appropriate verification freshness state rather than deleting it.

---

## State Coverage

Design 072 inherits Design 150 plus:

```text
Publishing Detail Loading
Publishing Detail Available
Publishing Detail Restricted

Production Ready
Not Yet Scheduled

Publication Scheduled
Publication Rescheduled
Schedule Cancelled

Publication Queued
Publishing In Progress
Provider Accepted
Publication Outcome Pending
Publication Outcome Unknown
Publication Attempt Failed

Placement Created
Placement Active
Placement Removed / Retracted

Verification Pending
Verified Live
Verification Stale
Placement Broken
Placement Unreachable
Verification Unavailable

Partially Published
Partially Verified
All Required Placements Verified

Live Link Available
Live Link Temporarily Unverified
Live Link Unavailable

Client Input Required
No Client Action Required
Client Action State Unavailable

Partial Publishing Service Failure
```

---

# 6. Responsive Behavior

## Desktop

Desktop should emphasize release truth by target/placement.

Conceptually:

```text
Publishing / Live Links
↓
Publication Summary
├── media / Project
├── exact PublicationVersion
├── current aggregate release state
└── published / verified timestamps
↓
Targets / Placements
    ├── destination
    ├── scheduled state
    ├── attempt/result
    ├── placement status
    ├── verification status
    ├── last verified
    └── Open Live Link
↓
Published Artifact / related context
```

Only sections in the frozen design should render.

---

## Desktop should not expose internal publishing operations

No Client-facing:

* webhook replay,
* force publish,
* provider credentials,
* raw HTTP responses,
* internal retry queues,
* CMS admin URLs,
* internal diagnostics.

---

## Per-target status should remain visible

For multi-target release:

```text
Website       Verified Live
Reader        Verified Live
Partner Site  Verification Pending
```

is much safer than one ambiguous:

> Published.

---

## Tablet

Following Design 152:

* target rows become compact structured cards where needed,
* destination name and status remain together,
* link CTA stays associated with correct target,
* verification freshness remains visible,
* no horizontal overflow from long URLs.

---

## Mobile

Priority:

```text
Publishing
↓
Publication / Media title
↓
Overall release state
↓
Destination Card
   ├── target
   ├── publication state
   ├── verification state
   ├── last verified
   └── Open Live Link
↓
Next destination
```

---

## Mobile URLs

Do not display long raw URLs as the primary UI if they destroy layout.

Use:

> Open live article
> Open magazine reader
> View published video

while retaining accessible destination information.

---

## Verification freshness on mobile

A green badge alone is insufficient.

Use semantic text:

> Verified live 18 minutes ago.

or:

> Last verification is stale.

where frozen design allows the timestamp/state.

---

## Broken-link state

Do not leave an active primary CTA saying:

> View Live

when recent verification proves the placement is broken.

The CTA/state should reflect current canonical verification.

---

## Accessibility

A placement card should communicate something equivalent to:

> The Perspective Website. Publication succeeded. Verified live on August 22 at 12:40 PM. Open live publication.

where canonical evidence supports it.

---

## External-link accessibility/security

Client-facing external links should clearly indicate they open the published destination and use safe browser behavior.

---

# 7. Backend Requirements

## Read architecture

```text
Design 072
    ↓
ClientPortalSessionContext
    ↓
Publication Authorization
    ↓
ClientPublishingDetailQueryService
    │
    ├── Publication
    ├── exact PublicationVersion
    ├── source Project/media reference
    ├── PublicationTargets
    ├── Schedules
    ├── PublicationAttempts
    ├── normalized provider outcomes
    ├── Placements
    ├── Verification records/freshness
    ├── Client-safe LiveLinks
    └── current ClientAction where relevant
    ↓
ClientPublishingDetailView
```

---

## Exact release-version resolver

Conceptually:

```text
resolveClientPublicationVersion(
    publicationId,
    membershipId
)
```

must return the exact released/current Client-visible PublicationVersion.

Never select based solely on:

```text
MAX(version)
```

or source media `latest`.

---

## Publication creation should pin source versions

When publication is prepared:

```text
createPublicationVersion()
```

should persist exact references to:

* approved media/artifact version,
* exact copy/title metadata,
* exact publication assets,
* intended target configuration.

This protects publication history.

---

## Schedule service

Use one canonical scheduling service shared with Design 031/126.

Requirements:

* timezone-aware,
* DST-safe,
* cancellable/reschedulable,
* idempotent execution handoff,
* durable queue/outbox behavior.

---

## Due schedule should generate execution once

A scheduler retry must not create several duplicate publication attempts for the same intended execution.

Use stable schedule/execution idempotency.

---

## PublicationAttempt idempotency

Conceptually:

```text
target
+
publicationVersion
+
execution intent
```

forms part of a stable idempotency boundary.

Repeated worker retries should not create duplicate external content where provider supports idempotency.

---

## Uncertain publishing outcome must be verified before retry

Same high-integrity principle as Design 071 payment execution.

Example:

```text
Publish request sent
        ↓
provider received it
        ↓
network timeout
```

Do not immediately publish again.

First:

```text
query provider / inspect target
        ↓
determine whether placement already exists
```

Otherwise duplicate public posts/pages can be created.

---

## Provider adapter

Use something conceptually like:

```text
PublicationProviderAdapter
├── createPublication()
├── updatePublication() where policy allows
├── getStatus()
├── fetchPlacement()
├── verifyPlacement()
├── unpublish() where allowed
└── normalizeProviderEvent()
```

Exact operations vary by provider.

---

## Provider adapters must not own core state semantics

Providers return normalized outcomes.

The Publishing domain decides:

* attempt state,
* placement creation,
* verification state.

---

## Provider event verification

For webhook/event-capable providers:

* authenticate callback,
* replay-protect,
* map expected provider account,
* map attempt/target/version,
* idempotently process event.

---

## Provider acceptance normalization

Never set:

```text
publication.status = LIVE
```

merely because provider request returned HTTP 200/202.

---

## Placement creation

Placement should be created only with enough evidence to identify the actual released external/internal resource.

Potential identifiers:

```text
providerResourceId
canonicalUrl
targetId
publicationVersionId
firstObservedAt
```

---

## URL canonicalization

The system should normalize:

* scheme,
* canonical host,
* query/tracking parameters according to policy,
* redirects,

without destroying provider-specific required URLs.

Exact policy Phase 3D.

---

## Safe URL validation

Only accepted protocols/domains/patterns appropriate for target/provider are allowed.

This also prevents malicious Client-facing links.

---

## Verification service

A central service should perform:

```text
verifyPlacement(placementId)
```

using target-specific verification strategy.

---

## Verification strategy registry

Conceptually:

```text
PlacementVerificationAdapter
├── WebsiteVerification
├── ReaderVerification
├── VideoPlatformVerification
├── PodcastPlatformVerification
└── ManualEvidenceVerification
```

where needed.

---

## Verification result should include freshness metadata

Conceptually:

```text
VerificationResult
├── status
├── checkedAt
├── expiresOrStalesAt
├── method
├── observedResourceId
├── observedUrl
└── evidence summary
```

---

## Reverification scheduling

Live placements need appropriate periodic/event-driven reverification.

Not necessarily every minute.

Frequency can depend on:

* channel,
* expected stability,
* provider capability,
* publication age.

Exact operational cadence Phase 3D.

---

## Staleness resolver

Centralize:

```text
resolveVerificationFreshness(
    latestVerification,
    targetPolicy,
    now
)
```

Do not let each UI decide its own “stale after X” rule.

---

## Broken-link detection

A failed verification should distinguish:

```text
404 / removed
403 / access restricted
5xx / provider issue
timeout
redirect mismatch
content/version mismatch
verification system failure
```

internally.

Client projection can map these to safe states.

---

## Avoid false broken state

One transient timeout should not necessarily turn a previously valid placement into permanently Broken.

Verification policy may use:

* retry,
* threshold,
* confidence,
* failure classification.

---

## LiveLink resolver

Conceptually:

```text
resolveClientLiveLink(
    placement,
    verification,
    membership
)
```

returns:

* safe URL,
* destination label,
* current verification state,
* last verified time,
* allowed CTA.

---

## LiveLink is a read projection

Do not create a separate manually editable Client LiveLink database.

It derives from Placement + verification + access policy.

---

## Multi-target aggregation

A central publication aggregate resolver should consider:

```text
Target state[]
+
required/optional target policy
+
placement state[]
+
verification state[]
```

to derive a safe Client summary.

Frontend must not calculate:

```text
if any target live => publication live
```

or:

```text
if one target failed => publication failed
```

arbitrarily.

---

## Publishing timestamp semantics

Preserve separately:

```text
scheduledAt
attemptedAt
providerAcceptedAt
placementCreatedAt
publishedAt
verifiedAt
```

where applicable.

Do not reduce all to `date`.

---

## Placement lifecycle

If content is updated/unpublished externally or internally:

retain placement history and transition state.

Avoid hard delete.

---

## Version replacement

When PublicationVersion v4 replaces v3:

* new execution/placement relationship is recorded,
* prior version history remains,
* current Client view can resolve v4,
* historical release evidence stays attributable to v3.

---

## Distribution handoff

Design 073 should consume canonical:

```text
Publication
PublicationVersion
Placement
Verification
LiveLink projection
```

rather than deriving release state from provider URLs again.

---

## ClientAction resolver

Where frozen Client action exists:

```text
Publication
+
required Client dependency
+
current member
        ↓
ClientActionResolver
```

Verification or internal retry work should not become Client action unless the Client truly must do something.

---

## Notifications

Safe canonical events might include:

```text
PublicationScheduled
PublicationVerifiedLive
PlacementNoLongerVerified
PublicationRetracted
```

according to notification policy.

Avoid notifying:

> Live

before verification policy is satisfied.

---

## Activity

Meaningful events can feed Design 063:

> Magazine published.

> Publication was taken offline.

Again, derived from canonical Publishing events.

---

## Audit

Material publishing operations should produce Audit events such as:

```text
PublicationVersionCreated
PublicationScheduled
PublicationAttemptStarted
PlacementCreated
PlacementVerified
PlacementVerificationFailed
PublicationRetracted
```

without exposing credentials.

---

## Permission-safe caching

Cache keys may include:

```text
membershipId
publicationId
publicationVersionId
target revision
placement revision
verification revision
permission revision
```

Do not reuse broad-access Admin payloads for restricted Portal members.

---

## Partial failure handling

Example:

```text
Publication metadata    ✓
Targets                 ✓
Placements              ✓
Verification service    ✕
```

Design 072 should still show known placements with:

> Verification temporarily unavailable.

It must not downgrade them automatically to:

> Not published.

---

## Backend Requirement Matrix

| Requirement                                            | Status                        |
| ------------------------------------------------------ | ----------------------------- |
| Client Portal authentication                           | **Critical**                  |
| Active Portal membership                               | **Critical**                  |
| Canonical Publication reuse                            | **Critical**                  |
| Publication/PublicationVersion separation              | **Critical**                  |
| Exact source artifact/version pinning                  | **Critical**                  |
| Internal/latest vs release-selected version separation | **Critical**                  |
| Production-ready/Publication separation                | **Critical**                  |
| Publication/Schedule separation                        | **Critical**                  |
| Timezone/DST-safe scheduling                           | **Critical**                  |
| Schedule/execution idempotency                         | **Critical**                  |
| One Publication → multiple Targets                     | **Critical**                  |
| PublicationTarget/Placement separation                 | **Critical**                  |
| PublicationAttempt entity                              | **Critical**                  |
| Attempt/provider-acceptance separation                 | **Critical**                  |
| Provider acceptance/Published separation               | **Critical**                  |
| Provider acceptance/Verification separation            | **Critical**                  |
| Provider abstraction                                   | **Critical**                  |
| Provider-event normalization                           | **Critical**                  |
| Provider webhook authenticity/replay protection        | **Critical where applicable** |
| Publication attempt idempotency                        | **Critical**                  |
| Uncertain outcome verification before retry            | **Critical**                  |
| Duplicate external publication prevention              | **Critical**                  |
| Placement entity                                       | **Critical**                  |
| Exact Placement/PublicationVersion linkage             | **Critical**                  |
| URL canonicalization                                   | **Critical**                  |
| Safe URL validation                                    | **Critical**                  |
| Placement/Verification separation                      | **Critical**                  |
| Verification evidence entity                           | **Critical**                  |
| Verification provenance                                | **Critical**                  |
| Verification freshness/staleness                       | **Critical**                  |
| Reverification capability                              | **Critical**                  |
| Broken/stale/unavailable separation                    | **Critical**                  |
| Transient-failure protection                           | **Critical**                  |
| LiveLink as safe projection                            | **Critical**                  |
| LiveLink/Placement separation                          | **Critical**                  |
| Current verification reflected in CTA                  | **Critical**                  |
| Multi-target aggregate resolver                        | **Critical**                  |
| Required/optional target policy support                | **Required architecture**     |
| Publication/Distribution separation                    | **Critical**                  |
| Design 032/073 handoff reuse                           | **Critical**                  |
| Design 030 Asset/FileVersion reuse                     | **Critical**                  |
| Source-file/download permission separation             | **Critical**                  |
| Design 047 ClientAction reuse                          | **Required where actionable** |
| Notification integration                               | **Required**                  |
| Activity integration                                   | **Required**                  |
| Audit integration                                      | **Critical**                  |
| Permission-safe caching                                | **Critical**                  |
| Partial provider/verifier failure handling             | **Critical**                  |
| Designs 124–126 future internal reuse                  | **Critical architecture**     |

---

# 8. Consolidation

Design 072 exposes several major implementation risks.

**Production-ready / published conflation**
Approved media is labeled Live before release.

**Publication / PublicationVersion conflation**
Release history loses exact content identity.

**PublicationVersion / latest source version conflation**
A newly edited internal artifact silently becomes the released version.

**PublicationVersion / generic Artifact conflation**
Exact release package cannot be reconstructed.

**Schedule / Publication conflation**
Future intent becomes release fact.

**Scheduled / published conflation**
Calendar entry produces Live status.

**scheduledAt / publishedAt conflation**
Actual release timing becomes inaccurate.

**Cancelled schedule / cancelled Publication conflation**
Rescheduling destroys Publication identity.

**Publication / PublicationTarget conflation**
Architecture only supports one destination.

**PublicationTarget / Placement conflation**
Configured destination is treated as actual live result.

**Target / provider credential conflation**
Client payload exposes sensitive connection data.

**PublicationAttempt / Publication conflation**
Retry overwrites release history.

**Attempt / Schedule conflation**
Execution records cannot distinguish intent from actual run.

**Provider acceptance / Publication success conflation**
HTTP 200/202 is treated as published.

**Provider acceptance / Placement conflation**
API acknowledgement invents an external URL/resource.

**Provider “published” / verified-live conflation**
Provider state is trusted without external verification.

**ProviderEvent / canonical state conflation**
Vendor strings become business enums.

**Unverified webhook / canonical Publication mutation**
Spoofed/replayed provider event changes release state.

**Uncertain attempt / blind retry**
Timeout creates duplicate public posts/pages.

**Placement / LiveLink conflation**
URL becomes the entire publication-result identity.

**URL / PublicationVersion conflation**
Same URL hosting newer content erases version history.

**URL equality / resource identity conflation**
Redirects/version replacements become ambiguous.

**LiveLink / arbitrary free-text URL conflation**
Unsafe/unverified Client links enter the Portal.

**Preview URL / LiveLink conflation**
Internal preview is presented as public release.

**Placement / Verification conflation**
Creating/storing a URL marks it Live.

**Verification / permanent certification conflation**
A one-time check creates eternal green status.

**Stale / broken conflation**
Old verification is treated as current failure.

**Verifier unavailable / broken conflation**
Infrastructure outage marks valid publication offline.

**One transient timeout / broken conflation**
False outage shown to Client.

**200 OK / correct content conflation**
Wrong page at valid URL is considered verified publication.

**Manual verification / automated verification conflation**
Evidence provenance is lost.

**Broken now / never published conflation**
Historical release evidence disappears.

**Unpublish / deletion conflation**
Past Placement and verification history are destroyed.

**One target live / all targets live conflation**
Multi-target Publication gets false overall success.

**One target failed / Publication failed conflation**
Optional target failure makes entire release appear unsuccessful.

**Target count / completion policy conflation**
Required and optional targets have equal weight.

**Publication / Distribution conflation**
Primary release and promotional amplification become one workflow.

**PublicationTarget / DistributionChannel conflation**
Destination identity determines business workflow incorrectly.

**Distribution recreates Placement truth**
Design 073 independently checks links instead of consuming Publishing placements.

**Project/media status / Publication status conflation**
Designs 065/066 invent release truth from production stages.

**ClientAction / publishing state conflation**
Internal verification work appears as Client obligation.

**Notification / verification evidence conflation**
“Now live” alert becomes release proof.

**Activity / Placement evidence conflation**
Timeline event substitutes for Verification.

**Project access / Publication access conflation**
Restricted/embargoed releases leak.

**Publication read / publish authority conflation**
Client viewer can retry/reschedule/unpublish.

**LiveLink / source asset access conflation**
Published output visibility exposes source files.

**Direct Placement ID bypass**
Restricted link becomes accessible via guessed ID.

**Unsafe URL scheme**
Stored placement becomes a phishing/script vector.

**Redirect trust**
Verification follows arbitrary redirects to unsafe destinations.

**Long raw URL / identity conflation**
Presentation depends entirely on mutable external text.

**Verification service outage / no live placements conflation**
Existing release vanishes from Client Portal.

**Cache / verification freshness conflation**
Old green status remains long after link failure.

**072/031 duplicate Publishing engine**
Client detail implements separate release/scheduling logic.

**072/055 duplicate Client publication state**
Overview and detail disagree on Live status.

**072/065–066 duplicate media-release logic**
Media cards independently infer Publication state.

**072/073 duplicate Placement model**
Publishing and Distribution each create their own external-link records.

**072/124–126 duplicate internal publishing backend**
Client and Team surfaces diverge in Schedule/Attempt/Placement truth.

No additional screen is required.

These are **exact release-version identity, scheduling, target execution, provider normalization, idempotency, placement evidence, verification freshness, live-link safety, multi-target aggregation, and Publishing/Distribution separation requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT EXACT-VERSION PUBLICATION, PLACEMENT & VERIFIED LIVE-LINK DETAIL ANCHOR**

**Domain directive:**
**Publication ≠ PublicationVersion/Artifact ≠ PublicationTarget ≠ Schedule ≠ PublicationAttempt ≠ ProviderAcceptance ≠ Placement ≠ Verification ≠ LiveLink ≠ Distribution ≠ ClientAction.**

**Reuse directive:**
Design 031 remains the single canonical Publishing engine, Design 055 remains the Client overview, and Design 072 becomes the Client-safe detailed projection of those same canonical release entities.

**Production directive:**
production completion/readiness only establishes release eligibility. It never establishes scheduling, publication, placement, or verified-live status.

**Version directive:**
every release pins an exact PublicationVersion and exact source Artifact/FileVersion/media version. “Latest production asset” is prohibited as an execution selector.

**Artifact directive:**
PublicationVersion can reference one or multiple exact release artifacts while preserving the exact source/version lineage required to reconstruct what was actually published.

**Target directive:**
one PublicationVersion can have multiple PublicationTargets. Target intent and actual resulting Placement remain separate.

**Schedule directive:**
Schedule represents future execution intent, not release truth. Scheduling uses timezone/DST-safe canonical instants and durable idempotent execution semantics.

**Attempt directive:**
every PublicationAttempt remains explicit and retryable/idempotent without overwriting prior attempts. Processing/acceptance/failure history is preserved.

**Uncertain-outcome directive:**
when an attempt's outcome is ambiguous, the system verifies the provider/target before retrying. Blind retry is prohibited because it can create duplicate public placements.

**Provider directive:**
providers remain behind normalized adapters. HTTP success, provider acknowledgement, or provider-specific “published” status never directly becomes verified Client-facing Live state.

**Placement directive:**
a Placement is created only when there is sufficient evidence identifying the actual released resource and its exact PublicationVersion/target lineage.

**Verification directive:**
Placement and Verification remain separate. “Live” requires governed verification evidence rather than merely storing a URL or receiving provider acceptance.

**Freshness directive:**
verification is time-bound. `Verified Current`, `Verification Stale`, `Broken`, `Unreachable`, and `Verification Unavailable` remain distinct conditions. A link never stays permanently green because it succeeded once.

**Historical directive:**
a placement that was live historically remains historical evidence even if it later breaks, is removed, redirected, superseded, or deliberately unpublished.

**Live-link directive:**
`LiveLink` is a safe Client projection over an authorized Placement + latest governed Verification. It is not an independently editable URL record or source of release truth.

**URL-security directive:**
Client-facing links are canonicalized and validated; unsafe schemes, untrusted redirect outcomes, preview/admin URLs, and provider secrets are never surfaced as LiveLinks.

**Multi-target directive:**
Design 072 shows target-level state and derives overall publication state through a central required/optional-target policy. One successful or failed target never arbitrarily decides the whole Publication.

**Timestamp directive:**
scheduled time, attempted time, provider acceptance, placement creation, actual publication, and verification time remain separately stored and displayed where relevant.

**Distribution directive:**
Design 073 consumes canonical PublicationVersions, Placements, Verification and safe LiveLinks from Publishing. It does not recreate Publishing or determine whether primary release is live.

**Project/media directive:**
Designs 065–066 consume the same canonical Publishing summary; they never infer Live from production-ready media state.

**Authorization directive:**
Project entitlement, Publication visibility, exact PublicationVersion access, Placement visibility, LiveLink access, artifact download and internal publication-management authority remain separate server-enforced concerns.

**ClientAction directive:**
Design 047 is used only when the Client genuinely has something to provide/do. Internal provider retry, placement verification, and release operations do not become Client actions by default.

**Notification directive:**
Designs 061/064 can notify Clients of scheduled or verified release events according to policy, but “Live” notifications should derive from governed canonical release/verification state rather than provider acceptance.

**Activity directive:**
Design 063 may record publication/retraction milestones but remains historical projection rather than release evidence.

**Audit directive:**
Publication-version creation, scheduling, attempts, placement creation, verification and retraction should produce auditable events without exposing provider secrets.

**Failure directive:**
provider outage, verifier outage, stale verification, broken placement, missing artifact, unknown attempt result and actual unpublished state remain independently represented. Unknown must never silently become `Not Published` or `Broken`.

**Performance directive:**
cross-target status, placement and verification should be composed through batched/read-model architecture with permission-sensitive caching rather than browser-side provider querying.

**Internal reuse directive:**
future Designs 124–126 must consume the same Publication, Version, Target, Schedule, Attempt, Placement and Verification foundation; internal surfaces expose deeper controls, not different truth.

**Responsive directive:**
desktop presents exact publication/version plus destination-by-destination release/verification evidence; mobile prioritizes Publication identity → overall status → each target's current verification → safe LiveLink.

**Overlap directive:**
Designs **030–032, 043, 047, 055, 063–066, 072–073 and later 124–130** must ultimately consume one exact-version Publishing + Placement + Verification foundation without rebuilding live-state logic in each surface.

**Consolidation directive:**
**STANDARDIZE ONE PUBLISHING EXECUTION & VERIFICATION FOUNDATION — CANONICAL PUBLICATION + IMMUTABLE PUBLICATIONVERSION/EXACT ARTIFACT REFERENCES + MULTI-TARGET RELEASE INTENT + TIMEZONE-SAFE SCHEDULE + IDEMPOTENT PUBLICATIONATTEMPTS + NORMALIZED PROVIDER OUTCOMES + VERSION-BOUND PLACEMENTS + EVIDENCE-BASED REPEATABLE VERIFICATION + FRESHNESS-AWARE CLIENT LIVELINK PROJECTION — AND NEVER ALLOW PRODUCTION READINESS, SCHEDULE, PROVIDER ACCEPTANCE, STORED URLS, OR HISTORICAL ONE-TIME VERIFICATION TO BECOME PERMANENT “LIVE” TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **72 / 153** |
| **PASS**                                   |                         **72** |
| **STANDARDIZE decisions**                  |                         **70** |
| **Potential implementation-overlap flags** |                         **63** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**72 / 153 = 47.1% audited.**

### Canonical Publishing architecture after Design 072

```text
                APPROVED PRODUCTION OUTPUT
                          │
                          ↓
                     Publication
                          │
                          ↓
                  PublicationVersion
                  exact + immutable
                          │
               ┌──────────┼──────────┐
               ↓          ↓          ↓
            Target A   Target B   Target C
               │          │          │
            Schedule   Schedule   Immediate
               │          │          │
               ↓          ↓          ↓
             Attempt    Attempt    Attempt
               │          │          │
               ↓          ↓          ↓
          Provider     Provider     Provider
               │          │          │
               ↓          ↓          ↓
           Placement  Placement  Placement
               │          │          │
               ↓          ↓          ↓
          Verification Verification Verification
               │          │          │
               ↓          ↓          ↓
            LiveLink    LiveLink    LiveLink
```

The release-truth ladder remains:

```text
Production Ready
      ↓
Scheduled
      ↓
Attempt Started
      ↓
Provider Accepted
      ↓
Placement Identified
      ↓
Placement Verified
      ↓
Verified Live

Every step is distinct.
```

And verification remains time-sensitive:

```text
Verified at T1
      │
      ↓
Freshness Window
   ┌──┴───────────────┐
   ↓                  ↓
still current      becomes stale
                      │
                      ↓
                Reverification
                 ┌────┴────┐
                 ↓         ↓
             Verified    Broken /
             Current     Unreachable
```

# Next Sequential Audit Target

## **Design 073 — Client Distribution Detail**

Its frozen identity and supplied route annotation **`/client/distribution`** are already locked.

The next audit must preserve the distribution-detail boundary:

> **Publication ≠ DistributionCampaign ≠ DistributionItem ≠ ChannelExecution ≠ Placement ≠ Verification ≠ PerformanceMetric ≠ MetricObservation/Aggregate ≠ Report ≠ ClientAction.**

It must reconcile the canonical Distribution foundation from **Design 032**, the Client overview from **Design 055**, and Design 072's verified Publication/Placement foundation while preserving:

* distribution starts from canonical release/artifact references rather than recreating Publication,
* campaign ≠ individual distribution item,
* channel execution ≠ verified placement,
* attempted delivery ≠ successful placement,
* verified placement ≠ metric availability,
* zero performance ≠ unavailable performance,
* VERIFIED / ESTIMATED / MANUAL / UNAVAILABLE metric provenance remains explicit,
* metrics from different channels are not naively comparable,
* historical distribution evidence must remain version/placement-bound.

After Design 073 we continue strictly:

**074 Client Message Thread Detail → 075 Client Sign In → 076 Client Portal Activation / Accept Invite → 077 Client Access Recovery**

with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
