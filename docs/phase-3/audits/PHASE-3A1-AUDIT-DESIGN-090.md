# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 090 — Outreach Campaign Detail / Campaign 360

Design 090 should become the **canonical Team Workspace Outreach Campaign 360 composition surface** built on the campaign domain established in Design 012, the Sequence engine from Design 013, Inbox/Messaging from Design 014, and the stable audience-selection model from Design 088.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **OutreachCampaign ≠ CampaignVersion/Configuration ≠ SequenceVersion ≠ AudienceSnapshot ≠ Enrollment ≠ Lead ≠ Message ≠ Conversation/Reply ≠ SendingAccount ≠ DeliveryAttempt/Event ≠ CampaignMetric/Aggregate.**

The central implementation rule is:

> **Campaign 360 composes one canonical OutreachCampaign and its pinned configuration, sequence, audience, enrollments, Messages, replies, sending infrastructure and derived performance. It must never become a second Campaign entity or a giant mutable object containing copied Leads, Messages, provider events, metrics or live Segment membership.**

---

# 1. Classification

| Audit field                        | Classification                                                                                                                          |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                      | **090**                                                                                                                                 |
| **Canonical name**                 | **Outreach Campaign Detail / Campaign 360**                                                                                             |
| **Product area**                   | Team Workspace / Outreach / Campaign Operations                                                                                         |
| **User surface**                   | **Authenticated Team Workspace**                                                                                                        |
| **Screen class**                   | Entity Detail / Campaign Operations 360 Workspace                                                                                       |
| **Classification**                 | **Canonical Outreach Campaign Detail, Enrollment & Delivery Composition Anchor**                                                        |
| **Primary purpose**                | Present one Campaign's configuration, pinned audience/sequence, enrollment progress, message execution, replies and derived performance |
| **Primary entity**                 | **OutreachCampaign** — Design 012                                                                                                       |
| **Campaign configuration/version** | **CampaignVersion / CampaignConfiguration**                                                                                             |
| **Sequence dependency**            | **SequenceVersion** — Design 013                                                                                                        |
| **Audience dependency**            | **AudienceSnapshot** — Design 088                                                                                                       |
| **Enrollment entity**              | **CampaignEnrollment / OutreachEnrollment**                                                                                             |
| **Lead dependency**                | Designs 011 / 089                                                                                                                       |
| **Message dependency**             | Design 014                                                                                                                              |
| **Conversation/reply dependency**  | Designs 014 / 093 later                                                                                                                 |
| **Sending infrastructure**         | Design 092 later                                                                                                                        |
| **Delivery dependency**            | DeliveryAttempt / normalized provider event                                                                                             |
| **Metric dependency**              | CampaignMetric / aggregate projection                                                                                                   |
| **Primary query service**          | `OutreachCampaign360QueryService`                                                                                                       |
| **Campaign service**               | `OutreachCampaignService`                                                                                                               |
| **Enrollment service**             | `CampaignEnrollmentService`                                                                                                             |
| **Delivery service**               | `OutreachDeliveryService`                                                                                                               |
| **Analytics service**              | `CampaignMetricsService`                                                                                                                |
| **Parent shell**                   | `InternalAppShell` — Design 001                                                                                                         |
| **Auth**                           | Required                                                                                                                                |
| **Authorization**                  | Active OrganizationMembership + campaign/enrollment/message/provider/metric permissions                                                 |
| **Implementation priority**        | **Critical Outreach Execution / Delivery Integrity / Audience Reproducibility**                                                         |
| **Reuse level**                    | **Extremely High across Designs 012–014, 088–093**                                                                                      |

Design 090 should answer:

> **“What exact Campaign is this, which Campaign configuration and SequenceVersion is it running, which frozen audience was selected, which Leads became enrolled, what Messages and delivery attempts resulted, which replies/conversations exist, and what derived performance can currently be trusted?”**

Canonical structure:

```text
OutreachCampaign
      │
      ├── CampaignVersion
      ├── SequenceVersion
      ├── AudienceSnapshot
      │
      ├── Enrollment[]
      │      │
      │      ├── Lead
      │      └── Message[]
      │              │
      │              └── DeliveryAttempt[]
      │
      ├── Conversation / Reply projections
      ├── SendingAccount references
      └── CampaignMetric aggregates
                    │
                    ↓
             Campaign360View
              read composition
```

---

# 2. Reuse

## Design 012 remains the canonical Campaign domain

Design 090 must consume the same:

```text
OutreachCampaign.id
```

established by Design 012.

Do not create:

```text
Campaign360
CampaignDetailRecord
RunningCampaign
CampaignAnalyticsCampaign
```

as parallel business entities.

`Campaign360View` is acceptable only as a read model.

---

## Design 013 remains the Sequence engine

Campaign configuration may reference:

```text
SequenceVersion SV-4
```

but:

> **CampaignVersion ≠ SequenceVersion.**

Campaign configuration can contain Campaign-specific settings while the SequenceVersion owns the actual versioned sequence definition.

---

## Published SequenceVersion must remain immutable for enrolled execution

If Campaign C1 is pinned to:

```text
SequenceVersion v3
```

and the template/sequence later becomes v4:

existing enrollments remain on v3 unless an explicit migration policy exists.

Do not silently move active enrollments.

---

## Design 088 remains the audience foundation

Correct:

```text
Segment / LeadList
      ↓
AudienceSnapshot A1
      ↓
Campaign C1
```

Campaign C1 should not continuously query the live source Segment as its execution truth.

---

## AudienceSnapshot ≠ live Segment membership

Critical.

If a dynamic Segment changes tomorrow:

the Campaign's original pinned audience does not silently rewrite itself.

---

## Design 089 remains canonical Lead detail

An Enrollment references:

```text
Lead L-100
```

It does not create:

```text
CampaignLead
```

as a second Lead identity.

---

## Design 014 remains canonical Messaging / Inbox

Messages and replies belong to canonical communication infrastructure.

Campaign 360 may show:

* sent message summary,
* reply count,
* conversation state,

but must not create a second messaging backend.

---

## Design 092 later owns Sending Accounts / Email Connections

Design 090 consumes the sending-account identity and health needed for this Campaign.

It does not store provider credentials itself.

---

## Design 093 later owns Reply Queue / Outreach Response Review

Campaign 360 can expose reply summaries and links into reply review.

The reply-review lifecycle remains separate.

---

# 3. Entities

## OutreachCampaign

`OutreachCampaign` is the durable campaign identity.

Conceptually:

```text
OutreachCampaign
├── id
├── organizationId
├── name
├── lifecycle
├── current/pinned campaignVersion
├── createdAt
├── owner
└── revision
```

Exact schema belongs to Phase 3D.

---

## OutreachCampaign ≠ CampaignVersion

Campaign is stable identity.

CampaignVersion/configuration represents an exact configuration revision.

Example:

```text
Campaign C1
├── CampaignVersion v1
└── CampaignVersion v2
```

Historical execution should remain attributable to the exact version used.

---

## CampaignVersion ≠ SequenceVersion

Permanent.

`CampaignVersion` may contain things such as:

* campaign name/settings,
* sending policy,
* audience relationship,
* operational configuration.

`SequenceVersion` owns sequence steps/content/timing rules.

Do not collapse them into one mega-version entity.

---

## Campaign configuration changes must not rewrite historical execution

If Campaign changes:

* sender,
* schedule,
* configuration,
* exclusions,

historical Enrollments/Messages remain tied to the version/context actually used.

---

## AudienceSnapshot

AudienceSnapshot represents the exact selected Lead membership at audience-preparation time.

It must preserve:

* source list/segment lineage,
* evaluation/version,
* included Lead IDs.

---

## AudienceSnapshot ≠ Enrollment

Audience selection says:

> these Leads were selected.

Enrollment says:

> this Lead actually entered this Campaign execution.

A Lead may be excluded before enrollment because of:

* suppression,
* duplicate enrollment,
* missing/invalid communication channel,
* policy restrictions.

---

## AudienceSnapshot ≠ live Lead copy

Audience members reference canonical Leads.

Historical message personalization/delivery snapshots belong downstream at the appropriate Message/version boundary.

---

## Enrollment

`CampaignEnrollment` is the canonical relationship between a Campaign execution context and a Lead.

Conceptually:

```text
CampaignEnrollment
├── id
├── campaignId
├── campaignVersionId
├── sequenceVersionId
├── audienceSnapshotId
├── leadId
├── enrolledAt
├── lifecycle
├── current step/progress
└── execution context
```

---

## One Campaign can have many Enrollments

Permanent.

---

## Enrollment ≠ Lead

Permanent.

A Lead can potentially have multiple historical campaign enrollments according to policy.

---

## Enrollment lifecycle ≠ Lead lifecycle

Examples:

```text
Lead = QUALIFIED
Enrollment = PAUSED
```

or:

```text
Lead = ACTIVE
Enrollment = COMPLETED
```

Both valid.

---

## Enrollment stopped ≠ Lead disqualified

Permanent.

---

## Lead disqualified ≠ historical Enrollment deleted

Permanent.

Current sending policy may stop future execution, but historical enrollment remains.

---

## Enrollment should pin exact execution versions

At minimum conceptually:

```text
campaignVersionId
sequenceVersionId
audienceSnapshotId
```

so later edits do not rewrite what this Enrollment actually executed.

---

## Enrollment ≠ current Sequence step definition

The Enrollment should reference its pinned SequenceVersion and current progression.

Do not evaluate active Enrollment against today's latest Sequence template.

---

## Message

One Enrollment may create many Messages.

```text
Enrollment E1
├── Message M1
├── Message M2
└── Message M3
```

Each Message remains canonical communication content/execution.

---

## Message ≠ Sequence step

The step defines intended behavior/content.

The Message is the concrete communication instance generated/sent for one recipient/enrollment.

---

## Message should preserve exact generated content/version context

Historical message content must not change when:

* template edited,
* Lead profile changes,
* Contact email changes,
* SequenceVersion changes.

---

## Message ≠ DeliveryAttempt

Permanent.

A Message can have multiple transport attempts.

---

## DeliveryAttempt

Conceptually:

```text
DeliveryAttempt
├── messageId
├── sendingAccountId
├── provider
├── attemptNumber
├── providerMessageId
├── state
├── attemptedAt
└── normalized result
```

---

## Retry ≠ new Message automatically

A transport retry of the same message should generally produce a new DeliveryAttempt, not duplicate Message content/business identity.

---

## DeliveryAttempt ≠ provider event

Provider callbacks/events may update/append normalized delivery evidence.

They should not become the DeliveryAttempt identity themselves.

---

## Provider event ≠ Campaign state

Permanent.

---

## Provider accepted ≠ delivered

Permanent.

---

## Delivered ≠ replied

Permanent.

---

## Open/click ≠ reply

Permanent.

---

## Delivery failed ≠ Campaign failed globally

One Message failure can exist inside a healthy Campaign.

---

## Conversation / Reply

Reply handling remains canonical in the Inbox/Messaging domain.

Conceptually:

```text
Message sent
    ↓
external reply
    ↓
Conversation / Message
    ↓
Reply review
```

Campaign 360 can summarize the relationship.

It does not own reply truth.

---

## Reply ≠ Enrollment completion automatically

A domain policy may:

* pause,
* stop,
* mark responded,

but that must be an explicit Enrollment/Campaign rule.

The reply itself is still a Message/Conversation event.

---

## Conversation read state ≠ Campaign state

Permanent.

---

## SendingAccount

`SendingAccount` represents the configured external sending identity/connection.

It is separate from:

* Campaign,
* Enrollment,
* Message.

---

## One Campaign may use one or several SendingAccounts

Depending on frozen configuration/policy.

Do not assume sender identity is stored directly as one mutable campaign string forever.

---

## SendingAccount credential ≠ Campaign configuration

Campaign references an account/selection policy.

Secrets remain isolated in integration/connection infrastructure.

---

## SendingAccount health ≠ Campaign status

Example:

```text
Campaign = ACTIVE
SendingAccount = DEGRADED
```

Valid.

---

## SendingAccount disabled ≠ historical Messages deleted

Permanent.

---

## CampaignMetric / Aggregate

Campaign metrics are derived.

Examples may include, if frozen design supports them:

* selected audience,
* enrolled,
* sent,
* delivered,
* replied,
* bounced,
* completed.

These counts come from canonical records/events.

---

## Metric ≠ source truth

Permanent.

Do not mutate Enrollment state by editing a dashboard metric.

---

## Sent count ≠ delivered count

Permanent.

---

## Delivered count ≠ unique recipient count necessarily

Definitions must be explicit.

---

## Reply rate denominator must be defined centrally

Possible denominators include:

* sent,
* delivered,
* enrolled.

Do not allow each UI widget to invent its own rate.

---

## Metric freshness matters

A Campaign may be operationally current while metrics are delayed.

Do not interpret delayed metric projection as execution failure.

---

## Zero ≠ unavailable

Permanent.

---

# 4. Permissions

Design 090 requires section/action-specific authorization.

Conceptually:

```text
campaign.read
campaign.edit
campaign.pauseResume
campaign.audience.read

campaignEnrollment.read
campaignEnrollment.manage

message.read
conversation.read

sendingAccount.readSafeState

campaignMetrics.read
```

Exact keys belong to Phase 3D.

---

## Campaign read ≠ edit

Permanent.

---

## Campaign edit ≠ Sequence edit

Design 013 remains separately governed.

---

## Campaign read ≠ full Lead access

An operator can potentially inspect Campaign enrollment summary without full Lead 360 access.

Related Lead drill-down reauthorizes.

---

## Campaign read ≠ raw Message content access necessarily

Message content may require communication permission.

---

## Campaign read ≠ Conversation access

Replies can contain sensitive communication.

---

## Campaign read ≠ SendingAccount credential access

Absolute.

Campaign detail may show:

> Sender account connected

but never raw credentials/tokens.

---

## Campaign Metrics read ≠ operational edit

Permanent.

---

## Audience visibility ≠ unrestricted CRM export

Audience membership/field access remains permission-scoped.

---

## Enrollment action permission

Pausing/stopping/skipping an Enrollment must be separately authorized from viewing the Campaign.

---

## Bulk Enrollment operations need row-level validation

A Campaign-level action must still respect each Enrollment's current state and server policy.

---

## Current source authorization on Lead drill-down

Historical Campaign membership never becomes permanent Lead-access entitlement.

---

## Conversation deep links reauthorize current participant/source permissions

Permanent.

---

## SendingAccount references must be tenant-scoped

A malicious request cannot attach another Organization's SendingAccount.

---

## Provider webhook authorization

External callbacks require:

* signature/auth verification,
* provider account binding,
* replay protection.

No browser permission model substitutes for webhook verification.

---

# 5. States

Design 090 must keep **Campaign lifecycle, CampaignVersion, Enrollment lifecycle, Message state, Delivery state, reply state, SendingAccount health, audience state, and metric freshness** separate.

### Campaign lifecycle

Conceptually:

```text
Draft
Ready
Scheduled
Active
Paused
Completed
Cancelled
Archived
```

Exact canonical enum remains governed by the Outreach domain.

### Enrollment lifecycle

Conceptually:

```text
Pending
Active
Paused
Completed
Stopped
Failed / Attention Required
```

### Message state

```text
Draft/Generated
Queued
Sent
Failed
Cancelled
```

### Delivery state

```text
Pending
Provider Accepted
Delivered
Bounced
Rejected
Deferred
Unknown
```

### Conversation/reply state

Canonical Messaging semantics.

### SendingAccount state

```text
Connected
Degraded
Disconnected
Expired
Rate Limited
Unavailable
```

### Metric state

```text
Current
Delayed/Stale
Partial
Unavailable
```

These must not collapse into one `campaign.status`.

---

## Campaign active ≠ every Enrollment active

Permanent.

---

## Campaign paused ≠ Lead paused

Permanent.

---

## Campaign completed ≠ every Message delivered

Permanent.

---

## Enrollment completed ≠ Lead converted

Permanent.

---

## Message sent ≠ delivered

Permanent.

---

## Delivery succeeded ≠ reply received

Permanent.

---

## Reply received ≠ Conversation reviewed

Permanent.

---

## SendingAccount failed ≠ Campaign deleted

Permanent.

---

## Metric delayed ≠ Campaign inactive

Permanent.

---

## Audience snapshot ready ≠ all members enrolled

Permanent.

---

## Zero replies ≠ reply service unavailable

Critical.

---

## Zero deliveries ≠ provider metrics unavailable

Critical.

---

## Provider callback delay ≠ delivery failure

Permanent.

---

## Unknown provider outcome ≠ failed

Reconcile before retrying when duplication risk exists.

---

## Partial Campaign failure

Example:

```text
Campaign core     ✓
Audience          ✓
Enrollments       ✓
Messages          ✓
Provider status   ✕
Replies           ✓
Metrics           ✕
```

Campaign 360 remains available.

Provider status/Metrics become explicitly unavailable.

---

## State Coverage

Design 090 inherits Design 150 plus:

```text
Campaign Loading
Campaign Available
Campaign Restricted
Campaign Archived
Campaign No Longer Accessible

Campaign Draft
Campaign Ready
Campaign Scheduled
Campaign Active
Campaign Paused
Campaign Completed
Campaign Cancelled

Campaign Version Available
Campaign Version Historical

Audience Available
Audience Snapshot Ready
Audience Partially Available
Audience Service Unavailable

Enrollments Loading
Enrollments Available
No Enrollments
Enrollments Restricted
Enrollment Service Unavailable

Enrollment Pending
Enrollment Active
Enrollment Paused
Enrollment Completed
Enrollment Stopped
Enrollment Attention Required

Messages Available
No Messages Yet
Messages Restricted
Messaging Service Unavailable

Delivery Pending
Provider Accepted
Delivered
Bounced
Rejected
Deferred
Delivery Unknown

Replies Available
No Replies
Replies Restricted
Reply Service Unavailable

Sending Account Connected
Sending Account Degraded
Sending Account Disconnected
Sending Account Rate Limited
Sending Account State Unavailable

Metrics Current
Metrics Stale
Metrics Partial
Metrics Unavailable

Campaign Updated Elsewhere
Partial Campaign 360 Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should make Campaign identity/execution state primary and separate the operational dimensions clearly.

Conceptually:

```text
Campaign identity / lifecycle
↓
Configuration + SequenceVersion
↓
Audience snapshot
↓
Enrollment progress
↓
Messages / delivery
↓
Replies / Conversations
↓
Sending infrastructure
↓
Metrics
```

Only frozen-design sections should render.

---

## Version context should be understandable

If the frozen design exposes it, distinguish:

* Campaign configuration,
* Sequence version,
* Audience snapshot.

Do not label all three simply:

> Campaign version.

---

## Enrollment rows remain Lead-linked execution records

A row can show:

* Lead,
* Enrollment state,
* current sequence progress,
* Message summary,

but the Lead remains canonical CRM identity.

---

## Delivery state should not visually replace Enrollment state

Example:

> Enrollment Active · Latest Message Delivered

is valid.

One green “Success” badge is not enough.

---

## Reply state remains communication context

A reply should visibly remain:

> Reply / Conversation

not a generic Campaign completion indicator.

---

## Tablet

Following Design 152:

* summary/KPI cards compact,
* enrollment table can become structured rows/cards,
* campaign/version/audience context remains available,
* state dimensions stay distinguishable.

---

## Mobile

Priority:

```text
Campaign
↓
Campaign lifecycle
↓
Sequence / audience context
↓
Enrollment summary
↓
Enrollment cards
↓
Messages / delivery
↓
Replies
↓
Metrics
```

Do not compress a wide delivery-monitor table onto mobile.

---

## Mobile Enrollment card

Conceptually:

```text
Lead
Enrollment state
Current step
Latest Message state
Reply state
```

where frozen design includes these fields.

---

## Accessibility

A Campaign summary could communicate:

> Executive Leaders Q4 campaign. Active. Audience snapshot contains 500 selected Leads. 462 enrolled. 410 Messages sent. Delivery metrics delayed. 27 replies received.

where current authorized data supports it.

---

# 7. Backend Requirements

## Campaign 360 composition architecture

```text
Design 090
    ↓
Authenticated Workspace Context
    ↓
OutreachCampaign360QueryService
    │
    ├── CampaignAdapter
    ├── CampaignVersionAdapter
    ├── SequenceVersionAdapter
    ├── AudienceSnapshotAdapter
    ├── EnrollmentAdapter
    ├── MessageAdapter
    ├── ConversationAdapter
    ├── SendingAccountAdapter
    ├── DeliveryAdapter
    └── MetricsAdapter
    ↓
Campaign360View
```

This is a read composition.

---

## Query anchors on canonical Campaign ID

Conceptually:

```text
getCampaign360(campaignId, currentMembership)
```

First authorize Campaign.

Then authorize sensitive sections separately.

---

## No giant Campaign360 record

Avoid canonical storage such as:

```text
Campaign360Record {
  campaign,
  audienceJson,
  leadsJson,
  messagesJson,
  repliesJson,
  metricsJson
}
```

A materialized read model may exist only if rebuildable and revision-aware.

---

## CampaignVersion pinning

Campaign execution should preserve exact configuration revision.

Changes after execution begins must not silently rewrite active/historical Enrollment context.

---

## SequenceVersion pinning

Every applicable Enrollment should know the exact SequenceVersion under which it operates.

Published versions should be immutable.

---

## AudienceSnapshot pinning

Campaign launch/enrollment generation should reference one stable audience snapshot/evaluation.

Do not repeatedly query live Segment membership during execution as the historical audience definition.

---

## Enrollment uniqueness

A policy should prevent duplicate equivalent enrollment:

```text
UNIQUE(campaignId, leadId, execution context)
```

or equivalent governed constraint.

Exact semantics depend on whether re-enrollment is supported.

---

## Enrollment creation should be idempotent

Repeated audience-processing jobs must not duplicate Enrollment rows.

---

## Enrollment state machine

Transitions should be server-authoritative.

Avoid generic:

```text
PATCH enrollment.status
```

without validation.

---

## Enrollment progression

Progress should derive from:

* pinned SequenceVersion,
* executed Messages,
* timing rules,
* pause/stop/reply conditions.

---

## Sequence timing scheduler

Scheduled steps need durable jobs/timers.

Worker retries must be idempotent.

---

## Message generation idempotency

A Sequence step for Enrollment E1 must not create duplicate Message M1 on worker retry.

Use a stable identity such as conceptually:

```text
enrollmentId
+
sequenceVersionId
+
stepId
+
occurrence
```

---

## Message generation should snapshot exact content

Once generated/issued, content should remain historically reconstructable.

---

## DeliveryAttempt idempotency

Transport retry creates another attempt under the same Message where appropriate.

Do not duplicate Messages simply because provider call timed out.

---

## Provider outcome reconciliation

If request outcome is unknown:

query/reconcile using provider message/idempotency IDs before retrying.

This prevents duplicate sends.

---

## Provider callback normalization

External callbacks should become canonical normalized events linked to:

```text
SendingAccount
Message
DeliveryAttempt
```

where resolvable.

---

## Webhook deduplication

Use provider event IDs/content fingerprint + account context as appropriate.

Repeated callbacks must be idempotent.

---

## Out-of-order provider events

Critical.

Possible arrival:

```text
Delivered
then
ProviderAccepted
```

or delayed bounce later.

State resolver must use event semantics/timestamps rather than naïve last-write-wins.

---

## Raw provider event ≠ normalized business state

Store safe raw provider evidence separately where required.

Canonical delivery state should be normalized.

---

## SendingAccount service

Campaign resolves sender through Design 092's canonical account/connection infrastructure.

No secrets in Campaign DTOs.

---

## Sending account state changes mid-Campaign

If account becomes:

* disconnected,
* rate-limited,
* expired,

future sends should pause/defer/fail safely according to policy.

Historical deliveries remain intact.

---

## Conversation/reply integration

Inbound reply resolution should associate:

* external thread/message,
* Conversation,
* Campaign Enrollment where safely attributable.

Do not infer solely from current email if reliable provider/message/thread IDs exist.

---

## Reply policy

If a reply should stop/pause the Enrollment:

use explicit policy/service command.

Example:

```text
ReplyReceived
      ↓
EnrollmentReplyPolicy
      ↓
pause/stop enrollment
```

The Message event itself remains independent.

---

## Campaign metrics service

Metrics derive from canonical:

* AudienceSnapshot,
* Enrollments,
* Messages,
* DeliveryAttempts/events,
* Conversations/replies.

---

## Metric definitions must be centralized

Example:

```text
deliveryRate =
unique successfully delivered messages
/
eligible sent messages
```

or another governed definition.

The formula must not live independently in each frontend widget.

---

## Metric provenance/freshness

Each aggregate should conceptually support:

```text
definitionVersion
computedAt
freshness
source completeness
```

where necessary.

---

## Metric rebuildability

If metrics storage/cache is lost:

recompute from canonical operational events/records.

---

## Campaign metrics ≠ Design 038 general analytics source truth

Design 038 can consume Campaign metrics/definitions.

Operational Campaign records remain canonical here.

---

## Section-level partial failure

A Campaign query should support:

```text
campaign
+
sections
+
availability/freshness
```

rather than all-or-nothing response.

---

## Source-specific mutations

Examples:

```text
pause Campaign
→ OutreachCampaignService

stop Enrollment
→ CampaignEnrollmentService

retry Message delivery
→ OutreachDeliveryService

open reply
→ ConversationService

change sender configuration
→ campaign/version workflow
```

Never generic `PATCH Campaign360`.

---

## Campaign pause

Pausing Campaign should prevent future applicable scheduled execution.

It must not:

* unsend Messages,
* delete Enrollments,
* remove replies,
* rewrite provider events.

---

## Campaign cancel

Cancellation similarly preserves history.

Current/in-flight provider operations need reconciliation.

---

## Campaign edit while active

Material execution changes should create or pin new CampaignVersion semantics according to domain policy.

Do not silently mutate historical configuration under active Enrollments.

---

## Events/outbox

Useful events:

```text
CampaignCreated
CampaignVersionPublished
CampaignActivated
CampaignPaused
AudienceSnapshotAttached

EnrollmentCreated
EnrollmentStarted
EnrollmentPaused
EnrollmentCompleted
EnrollmentStopped

MessageGenerated
MessageQueued
MessageSent
DeliveryStateChanged

ReplyReceived
ConversationLinked
```

---

## Audit

Material user actions should be audited:

* campaign activate/pause/cancel,
* configuration changes,
* Enrollment manual stop/resume,
* sender changes.

High-volume provider delivery callbacks belong operational event history, not necessarily compliance Audit.

---

## Caching

Campaign360 cache should vary by:

```text
organizationMembershipId
campaignId
authorization revision
campaign revision
enrollment revision
message/delivery revision
metrics revision
```

Do not cache solely by Campaign ID.

---

## Performance

Use:

* indexed Campaign/Enrollment queries,
* paginated Enrollment list,
* aggregate Message/Delivery counters,
* lazy Conversation details,
* materialized/rebuildable metrics,
* batch Lead summaries.

Avoid one query/request per Enrollment.

---

## Backend Requirement Matrix

| Requirement                                      | Status                    |
| ------------------------------------------------ | ------------------------- |
| Authenticated Team Workspace                     | **Critical**              |
| Canonical Campaign reuse from 012                | **Critical**              |
| Campaign360View as projection                    | **Critical**              |
| Campaign/CampaignVersion separation              | **Critical**              |
| CampaignVersion/SequenceVersion separation       | **Critical**              |
| Immutable/pinned SequenceVersion                 | **Critical**              |
| AudienceSnapshot/live Segment separation         | **Critical**              |
| Stable Campaign audience lineage                 | **Critical**              |
| Audience/Enrollment separation                   | **Critical**              |
| Canonical Enrollment entity                      | **Critical**              |
| One Campaign → many Enrollments                  | **Critical**              |
| Enrollment/Lead separation                       | **Critical**              |
| Enrollment/Lead lifecycle separation             | **Critical**              |
| Enrollment uniqueness/idempotency                | **Critical**              |
| Enrollment pins CampaignVersion                  | **Critical**              |
| Enrollment pins SequenceVersion                  | **Critical**              |
| One Enrollment → many Messages                   | **Critical**              |
| Message/SequenceStep separation                  | **Critical**              |
| Message immutable generated content              | **Critical**              |
| Message/DeliveryAttempt separation               | **Critical**              |
| Multiple DeliveryAttempts                        | **Critical**              |
| DeliveryAttempt/provider-event separation        | **Critical**              |
| Provider callbacks idempotent                    | **Critical**              |
| Out-of-order event resolution                    | **Critical**              |
| Unknown provider outcome reconciliation          | **Critical**              |
| No duplicate sends on retry                      | **Critical**              |
| Conversation/reply reuse from 014                | **Critical**              |
| Reply/Enrollment state separation                | **Critical**              |
| SendingAccount separate from Campaign            | **Critical**              |
| No credentials in Campaign DTO                   | **Critical**              |
| SendingAccount health/Campaign status separation | **Critical**              |
| Campaign metrics as derived projections          | **Critical**              |
| Metric definition registry                       | **Critical**              |
| Metric freshness/provenance                      | **Critical**              |
| Metrics rebuildable                              | **Critical**              |
| Zero/unavailable distinction                     | **Critical**              |
| Section-level source authorization               | **Critical**              |
| Partial Campaign360 composition                  | **Critical**              |
| Source-specific mutation services                | **Critical**              |
| No generic Campaign360 mega-PATCH                | **Critical**              |
| Durable scheduling                               | **Critical**              |
| Scheduler worker idempotency                     | **Critical**              |
| Event/outbox integration                         | **Required**              |
| Permission-safe caching                          | **Critical**              |
| Enrollment pagination/batching                   | **Required at scale**     |
| Audit integration                                | **Required**              |
| Design 092 SendingAccount reuse                  | **Critical architecture** |
| Design 093 Reply Queue reuse                     | **Critical architecture** |

---

# 8. Consolidation

Design 090 exposes significant Outreach-domain risks.

**Campaign / Campaign360View conflation**
Read composition becomes campaign truth.

**Campaign / CampaignVersion conflation**
Editing config rewrites historical execution.

**CampaignVersion / SequenceVersion conflation**
Campaign settings and sequence steps become inseparable.

**Latest Sequence / pinned SequenceVersion conflation**
Active enrollments silently change behavior.

**AudienceSnapshot / live Segment conflation**
Campaign audience changes after launch.

**Audience member / Enrollment conflation**
Every selected Lead is assumed enrolled.

**Enrollment / Lead conflation**
Campaign lifecycle mutates CRM Lead lifecycle.

**Enrollment paused / Lead inactive conflation**
Outreach control alters Sales CRM.

**Enrollment complete / Lead converted conflation**
Communication progression creates Deal state.

**Campaign status / Enrollment status conflation**
One Campaign state cannot describe every recipient.

**Campaign active / every Enrollment active conflation**
Paused/stopped recipients disappear.

**Enrollment / Message conflation**
One Message is treated as entire recipient execution.

**Sequence step / Message conflation**
Template edits rewrite historical communication.

**Message / DeliveryAttempt conflation**
Retries duplicate user-facing Messages.

**Transport retry / new Message conflation**
Timeout causes duplicate sends.

**DeliveryAttempt / provider callback conflation**
Repeated webhooks create duplicate attempts.

**Provider accepted / delivered conflation**
API acceptance shown as confirmed delivery.

**Delivered / replied conflation**
Transport success becomes engagement.

**Bounce / Campaign failure conflation**
One recipient failure damages whole Campaign state.

**Reply / Enrollment completion conflation**
Inbound communication silently changes execution without policy.

**Reply / Lead conversion conflation**
Positive response creates Deal automatically.

**Conversation read / Campaign progress conflation**
Inbox action changes Campaign state.

**Campaign / SendingAccount conflation**
Provider credentials/config live inside Campaign.

**SendingAccount disconnected / Campaign deleted conflation**
Connection failure destroys execution history.

**SendingAccount health / Campaign status conflation**
Provider state becomes Campaign lifecycle.

**AudienceSnapshot / permanent Lead authorization conflation**
Historical audience leaks CRM access.

**Campaign audience / Campaign enrollment conflation**
Suppression/eligibility is bypassed.

**Campaign enrollment / current Segment match conflation**
Lead falling out of segment silently exits history.

**Campaign Metric / source truth conflation**
Dashboard counters control execution.

**Sent / delivered conflation**
Performance is overstated.

**Delivered / unique recipient conflation**
Retries distort rates.

**Metric stale / zero conflation**
Delayed analytics appear as no activity.

**Metric service unavailable / Campaign failed conflation**
Analytics outage hides working Campaign.

**Metric formula drift**
Different widgets calculate different rates.

**Provider callback last-write-wins**
Late/out-of-order events regress delivery state.

**Unknown send result / failed send conflation**
Retry causes duplicate communication.

**Campaign pause / historical deletion conflation**
Existing Messages/Enrollments disappear.

**Campaign cancel / retract sent message conflation**
Past communication history is rewritten.

**Campaign edit while active / in-place execution mutation**
Recipients operate under inconsistent configuration.

**Campaign read / Message access conflation**
Sensitive communication leaks.

**Campaign read / SendingAccount credential access conflation**
Provider secrets leak.

**Campaign read / Lead full access conflation**
Audience membership bypasses CRM policy.

**Aggregate count / harmless metadata conflation**
Restricted Lead/reply populations leak.

**Campaign360 mega-record**
Lead/Message/reply/metric state becomes stale copied truth.

**Campaign360 mega-PATCH**
One endpoint mutates Campaign, Enrollment, Message, Sequence and provider state.

**Cache by Campaign ID only**
Privileged Campaign details leak to restricted users.

**090/012 duplicate Campaign backend**
Campaign Hub and Campaign Detail diverge.

**090/013 duplicate Sequence state**
Campaign owns another sequence implementation.

**090/014 duplicate Message/Reply backend**
Campaign Detail creates parallel Inbox truth.

**090/088 duplicate audience model**
Campaign stores live Segment membership.

**090/089 duplicate Lead state**
Campaign Enrollment becomes Lead lifecycle.

**090/092 duplicate SendingAccount backend**
Connection/provider credentials appear inside Campaign.

**090/093 duplicate Reply-review lifecycle**
Campaign Detail starts owning response triage.

No additional screen is required.

These are **Campaign identity/versioning, pinned audience/sequence execution, Enrollment lifecycle, Message/delivery lineage, reply separation, sending infrastructure, metrics, idempotency and partial-failure requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL OUTREACH CAMPAIGN 360, ENROLLMENT, DELIVERY & PERFORMANCE COMPOSITION ANCHOR**

**Domain directive:**
**OutreachCampaign ≠ CampaignVersion/Configuration ≠ SequenceVersion ≠ AudienceSnapshot ≠ Enrollment ≠ Lead ≠ Message ≠ Conversation/Reply ≠ SendingAccount ≠ DeliveryAttempt/Event ≠ CampaignMetric/Aggregate.**

**Identity directive:**
Design 012 remains the sole canonical OutreachCampaign identity. Design 090 composes around that ID and never introduces a second Campaign360 business record.

**Projection directive:**
`Campaign360View` is a permission-safe, rebuildable composition of Campaign, execution, communication, delivery and analytics domains.

**Version directive:**
CampaignVersion/Configuration remains distinct from SequenceVersion. Both exact revisions must be identifiable for historical execution.

**Sequence directive:**
published SequenceVersions used by Enrollments are immutable/pinned. Later sequence edits never silently alter active or historical recipient execution.

**Audience directive:**
Design 088 remains canonical for LeadList/Segment evaluation and AudienceSnapshot. Campaign execution pins the exact AudienceSnapshot rather than continuously consuming live Segment membership.

**Selection directive:**
Audience membership represents selection, not Enrollment and not sending eligibility.

**Enrollment directive:**
CampaignEnrollment is the canonical Campaign↔Lead execution relationship. One Campaign can contain many Enrollments and one Lead can have multiple historical campaign contexts where policy permits.

**Lead directive:**
Enrollment lifecycle never becomes Lead lifecycle. Pausing, stopping, completing or failing Campaign execution does not qualify, disqualify, convert or delete the Lead automatically.

**Execution-version directive:**
each Enrollment remains tied to the exact CampaignVersion, SequenceVersion and relevant AudienceSnapshot/execution context that governed it.

**Message directive:**
one Enrollment may generate multiple canonical Messages. Messages preserve exact generated content and context; sequence/template changes cannot rewrite historical communication.

**Delivery directive:**
Message and DeliveryAttempt remain separate. Transport retries append governed DeliveryAttempts and must not duplicate Message identity or produce duplicate sends.

**Provider directive:**
provider acceptance, delivery, bounce, rejection, deferment and unknown outcome remain distinct normalized states. Raw provider events are evidence, not Campaign state.

**Idempotency directive:**
scheduler execution, Message generation, provider send requests, retries and provider callbacks must all be idempotent/replay-safe.

**Unknown-outcome directive:**
when send outcome is uncertain, reconcile provider state using provider/idempotency identifiers before retrying. `Unknown` must never automatically become `Failed`.

**Ordering directive:**
out-of-order provider events are resolved using canonical event semantics/timestamps rather than naïve last-write-wins.

**Reply directive:**
Design 014 remains canonical Conversation/Message infrastructure. Reply events can trigger explicit Enrollment policy, but reply/read state never becomes Campaign/Lead lifecycle by itself.

**Reply-review directive:**
later Design 093 owns response-review/triage operations. Campaign 360 consumes reply summaries and navigation rather than creating another reply workflow.

**Sending-account directive:**
later Design 092 remains canonical for sending identities/connections/provider state. Campaigns reference SendingAccount IDs/configuration but never hold raw credentials.

**Provider-health directive:**
SendingAccount health and Campaign lifecycle remain independent. Account outage can pause/defer future sends while preserving all historical Campaign execution.

**Metric directive:**
CampaignMetric/Aggregate is a derived read model sourced from AudienceSnapshots, Enrollments, Messages, delivery evidence and replies. Metrics never control operational truth.

**Metric-definition directive:**
sent, delivered, bounced, replied and rate calculations use centralized versioned definitions. UI widgets cannot invent independent formulas.

**Freshness directive:**
metric projections carry freshness/completeness semantics. `0`, `stale`, `partial`, `unknown`, and `unavailable` remain distinguishable.

**Authorization directive:**
Campaign page access never grants automatic access to full Lead records, Message bodies, Conversations, provider credentials or sensitive metric detail. Each section remains server-authorized.

**Partial-failure directive:**
Campaign core, Audience, Enrollments, Messages, provider delivery, Conversations and Metrics can fail independently. Failure of one subsystem never makes the canonical Campaign appear missing.

**Mutation directive:**
Campaign 360 actions call canonical domain services. A generic `PATCH Campaign360` that can mutate Campaign, Sequence, Enrollment, Message, provider and reply state is prohibited.

**Pause/cancel directive:**
pausing/cancelling Campaign execution affects future applicable work but never deletes historical AudienceSnapshots, Enrollments, Messages, replies or provider events.

**Concurrency directive:**
Campaign configuration changes, active execution, scheduler workers and provider callbacks require revision/idempotency protection so recipients never execute under silently mixed versions.

**Caching directive:**
Campaign360 caches vary by OrganizationMembership, authorization revision, Campaign/version revisions, Enrollment state, communication state and metric revision. Campaign ID alone is insufficient.

**Performance directive:**
use paginated Enrollment queries, batched Lead summaries, aggregate delivery projections, lazy Conversation loading and rebuildable materialized metrics rather than N+1 loading every recipient/message/provider event.

**Audit directive:**
campaign activation/pause/cancel, configuration changes, manual Enrollment actions and sender changes generate appropriate Audit evidence. High-volume provider delivery events remain operational delivery evidence instead of generic compliance-log noise.

**Future-reuse directive:**
Designs **091–093** must reuse this exact Campaign/Sequence/Message/SendingAccount/reply foundation rather than introducing feature-specific duplicates.

**Overlap directive:**
Designs **012–014, 079, 088–093** must ultimately share one continuous **Audience → Campaign → Enrollment → SequenceVersion → Message → Delivery → Reply** execution lineage while Lead, Conversation, SendingAccount and Metric remain independent canonical domains.

**Consolidation directive:**
**STANDARDIZE ONE OUTREACH CAMPAIGN EXECUTION FOUNDATION — CANONICAL OUTREACHCAMPAIGN + VERSIONED CAMPAIGN CONFIGURATION + IMMUTABLE PINNED SEQUENCEVERSION + FROZEN AUDIENCESNAPSHOT + IDEMPOTENT PER-LEAD ENROLLMENT + VERSIONED MESSAGE INSTANCES + APPEND-ORIENTED DELIVERYATTEMPTS/PROVIDER EVENTS + CANONICAL CONVERSATION/REPLY LINKAGE + EXTERNAL SENDINGACCOUNT REFERENCES + REBUILDABLE METRIC PROJECTIONS — AND NEVER ALLOW LIVE SEGMENT CHANGES, LEAD LIFECYCLE, PROVIDER CALLBACKS, REPLIES OR ANALYTICS COUNTERS TO REDEFINE HISTORICAL CAMPAIGN EXECUTION TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **90 / 153** |
| **PASS**                                   |                         **90** |
| **STANDARDIZE decisions**                  |                         **88** |
| **Potential implementation-overlap flags** |                         **81** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**90 / 153 = 58.8% audited.**

### Canonical Campaign architecture after Design 090

```text
                        OUTREACH CAMPAIGN
                         canonical identity
                               │
              ┌────────────────┼────────────────┐
              ↓                ↓                ↓
       CampaignVersion   SequenceVersion   AudienceSnapshot
              │                │                │
              └────────────────┼────────────────┘
                               ↓
                         ENROLLMENTS
                               │
                  ┌────────────┼────────────┐
                  ↓            ↓            ↓
               Lead L1      Lead L2      Lead L3
                  │
                  ↓
                Message
                  │
          ┌───────┴─────────┐
          ↓                 ↓
   DeliveryAttempt 1   DeliveryAttempt 2
          │
          ↓
 normalized provider events
```

Replies remain a separate canonical branch:

```text
Sent Message
     ↓
External Reply
     ↓
Conversation / Message
     ↓
Reply Review

NOT:
Reply = Campaign state
NOT:
Reply = Lead conversion
```

And the frozen-audience invariant is now explicit:

```text
Segment S1 at T1
      ↓
Evaluation E1
      ↓
AudienceSnapshot A1
      ↓
Campaign C1
      ↓
Enrollments

Segment S1 changes at T2.

A1 remains historical and unchanged.
```

Likewise, Campaign metrics remain derived:

```text
Enrollments
Messages
DeliveryAttempts
Provider Events
Replies
      │
      ↓
Campaign Metrics

Metrics describe execution.

Metrics NEVER control execution truth.
```

# Next Sequential Audit Target

## **Design 091 — Outreach Templates Library**

The next audit should preserve the template boundary:

> **OutreachTemplate ≠ TemplateVersion ≠ Sequence ≠ SequenceVersion ≠ Message ≠ Campaign ≠ Enrollment ≠ PersonalizationVariable ≠ GeneratedContent/RenderedMessage.**

It should reconcile Designs 012–013 and 090 while preserving:

* Template is reusable authored content/configuration, not a sent Message,
* TemplateVersion is immutable once used/published where history requires,
* editing a Template never rewrites Messages already generated/sent,
* Campaign/Sequence references exact template/version context rather than mutable latest content,
* template variables are typed/validated rather than arbitrary executable expressions,
* preview/rendered content ≠ canonical TemplateVersion,
* personalization failure must not silently send broken placeholders,
* deleting/archiving a Template must not destroy SequenceVersion/Message history,
* Templates must reuse the same sequence/message-generation engine rather than a parallel campaign-content backend.

The sequence continues strictly with **Design 091 only next**, under the unchanged audit contract.
