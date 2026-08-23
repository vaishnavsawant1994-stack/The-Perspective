# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 061 — Client Notifications / Notification Preferences

Its frozen identity is locked.

Design 061 should become the **canonical Client Portal notification-preference workspace** for controlling which optional notifications an authenticated Client user wants to receive, through which permitted channels, while preserving organization defaults and mandatory delivery policies.

Its governing boundary is:

> **Notification Event ≠ Notification Record ≠ Delivery Attempt ≠ Channel ≠ Notification Preference ≠ Organization Default ≠ Read State ≠ Client Action ≠ Message.**

The most important implementation rule is:

> **A preference determines whether an eligible optional notification should be delivered through a channel. It does not delete the underlying business event, change the source workflow, mark anything complete, or necessarily suppress mandatory security/legal/financial communications.**

---

# 1. Classification

| Audit field                            | Classification                                                                                                                 |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**                          | **061**                                                                                                                        |
| **Canonical name**                     | **Client Notifications / Notification Preferences**                                                                            |
| **Product area**                       | Client Portal / Notifications / Preferences                                                                                    |
| **User surface**                       | **Client Portal**                                                                                                              |
| **Screen class**                       | Personal Notification Preference Settings Workspace                                                                            |
| **Classification**                     | **Portal Settings Anchor — Client Notification Preference Family**                                                             |
| **Primary purpose**                    | Let the authenticated Client user control optional notification categories/channels that are permitted to be user-configurable |
| **Primary source concept**             | **NotificationEvent**                                                                                                          |
| **Inbox/presentation entity**          | **NotificationRecord**                                                                                                         |
| **Execution entity**                   | **NotificationDeliveryAttempt**                                                                                                |
| **Channel entity/config**              | **NotificationChannel / DeliveryChannel**                                                                                      |
| **Preference entity**                  | **UserNotificationPreference**                                                                                                 |
| **Organization default dependency**    | **OrganizationNotificationDefault / OrganizationSettings**                                                                     |
| **Read-state dependency**              | NotificationReadState                                                                                                          |
| **Client Action dependency**           | Design 047                                                                                                                     |
| **Message distinction**                | Designs 045 / 074                                                                                                              |
| **Personal-profile dependency**        | Design 059                                                                                                                     |
| **Organization-settings dependency**   | Design 060                                                                                                                     |
| **Client Notifications Center**        | Design 064                                                                                                                     |
| **Internal notification overlap**      | Design 080                                                                                                                     |
| **Alert-rule overlap**                 | Design 143                                                                                                                     |
| **Authentication/security dependency** | Designs 075–077                                                                                                                |
| **Finance/legal dependencies**         | Designs 052–054 / 070–071                                                                                                      |
| **Parent shell**                       | `ClientPortalShell` — Design 002                                                                                               |
| **Primary read model**                 | `ClientNotificationPreferencesView`                                                                                            |
| **Template family**                    | `NotificationPreferencesSettingsTemplate`                                                                                      |
| **Auth**                               | Required                                                                                                                       |
| **Authorization**                      | Current authenticated user + active Portal membership + self-preference capability                                             |
| **Implementation priority**            | **Critical Communication / Preference Integrity**                                                                              |
| **Reuse level**                        | **Very High across Portal, Notifications, Messaging, Security and Organization Settings**                                      |

Design 061 should answer:

> **“Which optional notifications can I control, which channels are available to me, what defaults does my organization provide, which settings have I overridden personally, and which mandatory communications cannot be disabled?”**

Canonical model:

```text
Business Domain Event
        ↓
NotificationEvent
        ↓
Notification Policy
        │
        ├── mandatory?
        ├── recipient?
        ├── category?
        └── permitted channels?
                ↓
Preference Resolution
        ├── user preference
        ├── organization default
        └── platform/policy default
                ↓
NotificationRecord
        ↓
Delivery Attempt(s)
        ├── In-app
        ├── Email
        └── other supported channels
```

---

# 2. Reuse

## Reuse the shared Notification infrastructure

Design 061 must not create a separate notification system specifically for preference settings.

One canonical infrastructure should serve:

* Design 061 preferences,
* Design 064 Client Notifications Center,
* Design 080 Team Notifications Center,
* source-domain notifications,
* security/account communications where appropriate.

Correct:

```text
Canonical Notification Infrastructure
              │
       ┌──────┼────────┐
       ↓      ↓        ↓
Preferences  Client   Team
Design 061   Center   Center
             064      080
```

---

## Design 061 ≠ Design 064

Their responsibilities are different.

### Design 061

Answers:

> What should I receive and through which optional channels?

### Design 064

Answers:

> What notifications have I received?

Therefore:

```text
Preference
≠
NotificationRecord
```

Do not combine settings and notification history into one data model.

---

## Reuse Design 059 user preference identity

Notification preferences belong to the authenticated User.

Design 059 established the personal-account boundary.

Design 061 should therefore attach preferences to canonical User identity / Portal context rather than creating another:

```text
NotificationProfile
```

user identity.

---

## Reuse Design 060 organization defaults

Organization-wide defaults can establish baseline behavior.

Conceptually:

```text
Platform default
      ↓
Organization default
      ↓
User override
```

but only for settings that permit user override.

Design 061 must not maintain another organization preference table unrelated to Design 060/040 settings infrastructure.

---

## Reuse Design 045 messaging, but do not merge it

A notification like:

> Sarah sent you a message.

may deep-link to Design 045.

But:

```text
Notification
≠
Message
```

The Message is the communication artifact.

The Notification is an attention signal about it.

---

## Reuse Design 047 Client Action resolver

A notification may say:

> Final proof requires your approval.

The underlying action remains:

```text
ApprovalRequest
→ ClientActionView
```

The Notification only points to it.

Marking the Notification read must not complete the ApprovalRequest.

---

## Reuse Design 039 Audit where needed

Preference changes may be auditable where important, especially changes affecting mandatory/regulated communications.

But:

```text
Notification history
≠
Audit history
```

---

## Design 143 relationship

Later:

**Design 143 — System Notifications / Alert Rules Management**

Expected distinction:

```text
061
Individual Client recipient preferences

143
System/admin alert rules and platform alert configuration
```

One notification infrastructure can be shared, but administrative rule authoring is a separate concern.

---

# 3. Entities

## NotificationEvent ≠ NotificationRecord

A source domain may emit:

```text
ApprovalRequested
InvoiceOverdue
ReportReleased
SupportReplyReceived
```

Those are business/domain events.

A `NotificationRecord` is a recipient-specific notification produced from such an event.

Correct:

```text
ApprovalRequested
       ↓
NotificationEvent
       ↓
Recipient resolution
       ↓
NotificationRecord for User A
NotificationRecord for User B
```

Do not store one global unread state on the source event.

---

## NotificationEvent ≠ source business state

An `InvoiceOverdue` notification does not become the Invoice itself.

If the notification disappears, the Invoice remains overdue.

---

## NotificationRecord ≠ DeliveryAttempt

A NotificationRecord answers:

> What notification does this recipient have?

A DeliveryAttempt answers:

> What happened when we attempted delivery through this channel?

Example:

```text
NotificationRecord N-100
├── In-app → available
├── Email Attempt 1 → transient failure
└── Email Attempt 2 → delivered
```

One notification may have several delivery attempts.

---

## DeliveryAttempt ≠ Notification outcome

One failed email attempt does not mean the Notification itself failed completely if:

* in-app succeeded,
* retry succeeded later.

Keep channel execution separate.

---

## Channel ≠ Preference

Channel:

```text
EMAIL
IN_APP
PUSH
SMS
```

where supported.

Preference:

> User wants Approval notifications by EMAIL.

These are different concepts.

---

## Channel ≠ provider account

`EMAIL` is a delivery channel.

The actual provider integration/configuration belongs to infrastructure.

Do not expose provider API/account concepts in Client preferences.

---

## Preference ≠ Organization Default

User-specific:

```text
UserNotificationPreference
```

Organization-level:

```text
OrganizationNotificationDefault
```

must remain distinct.

A user changing their preference cannot rewrite everyone's defaults.

---

## User Preference ≠ platform mandatory policy

Some communications may be non-optional because of:

* authentication/security,
* legal obligations,
* billing/payment events,
* contractual notices,
* account-access recovery,
* critical transactional operations.

For those:

```text
User opt-out
does not override
Mandatory Notification Policy
```

when product/legal policy requires delivery.

---

## Mandatory ≠ high priority

This distinction matters.

A notification can be:

* high priority but optional,
* mandatory but not “urgent,”
* both.

Do not use `priority = critical` as the sole mechanism for whether preferences can suppress it.

---

## Notification category

Conceptual categories might include, if frozen UI represents them:

```text
Projects
Approvals
Messages
Meetings
Billing
Contracts
Publishing
Reports
Support
Account / Security
```

These are notification classification concepts.

They do not replace source-domain entity types.

---

## Category ≠ source domain ownership

A category helps recipient settings/UI.

The canonical event still knows its source, for example:

```text
NotificationEvent
sourceType = APPROVAL_REQUEST
sourceId = AR-120
category = APPROVALS
```

---

## Notification Preference should be granular enough

Conceptually:

```text
UserNotificationPreference
├── userId
├── category/event class
├── channel
├── enabled / inherited
└── revision
```

Exact schema belongs to Phase 3D.

Avoid one huge boolean:

```text
notificationsEnabled = true
```

as the only model.

---

## But avoid uncontrolled per-event complexity

Do not create hundreds of individual toggles unless the frozen UX requires them.

A governed `NotificationTypeDefinition`/category registry can map source events to configurable categories.

---

## NotificationTypeDefinition

A useful platform concept may include:

```text
NotificationTypeDefinition
├── key
├── category
├── allowed channels
├── user configurable?
├── organization configurable?
├── mandatory?
├── default policy
└── source domain
```

Exact implementation later.

This prevents frontend hard-coding of policy.

---

## Preference state should support inheritance

A useful conceptual state is:

```text
INHERIT
ENABLED
DISABLED
```

rather than only true/false, because:

```text
no personal preference
```

can mean:

> use organization default.

---

## Null ≠ disabled

Critical:

```text
no user override
≠
notifications disabled
```

A missing user preference should resolve through organization/platform defaults.

---

## Organization default change

If Organization default changes:

* users who inherit it follow the new default,
* users with explicit allowed overrides retain their personal choice.

---

## Mandatory communication ignores user disable where required

Example:

User preference:

```text
Billing Email = OFF
```

Policy:

```text
Payment failure notice = MANDATORY EMAIL
```

Effective delivery remains enabled for that mandatory event.

The UI should not pretend the user's preference can override it.

---

## Preference ≠ delivery guarantee

User enabling Email means:

> Email delivery is desired/eligible.

It does not guarantee provider delivery.

DeliveryAttempt tracks actual execution.

---

## Preference ≠ channel availability

A user may prefer a channel that is currently unavailable because:

* no verified email,
* push unsupported,
* phone absent,
* provider disabled.

Preference and operational availability remain separate.

---

## Authentication email ≠ notification destination automatically

If email notifications go to a communication address, it may or may not be the same as login credential.

Design 059 established:

```text
login email
≠
profile contact email
```

Notification delivery destination must use the governed destination source.

---

## Verified destination

A channel may require verified contact information before use.

For example:

```text
EMAIL enabled
but email verification pending
```

should not be treated as normal deliverability.

---

## Read State ≠ Notification Preference

Read/unread applies to a NotificationRecord.

Preferences apply before/future delivery.

Turning off a preference must not:

* mark old Notifications read,
* delete history,
* clear unread counts.

---

## Read State ≠ Delivery State

Possible:

```text
Email delivered
In-app unread
```

Both can be true.

---

## Read State should be recipient-specific

If two Client users receive the same source event:

```text
User A → READ
User B → UNREAD
```

Do not place read state on the shared event.

---

## Notification read ≠ Client Action complete

Example:

```text
Notification:
“Approve Final Proof”

User opens/reads notification
```

The associated ApprovalRequest remains pending until Design 052 receives a formal ApprovalDecision.

---

## Notification read ≠ Message read

A Notification about a new Message can be marked read while the Message thread still has unread state, depending on product behavior.

Do not automatically couple them unless explicit policy says so.

---

## Notification ≠ Message

A Notification is concise and system-generated/triggered.

A Message is part of a Conversation.

Never implement Client Notifications Center as another chat inbox.

---

## Notification ≠ Activity

Design 063 Activity records Client-safe account history.

Notification answers:

> What needs my attention?

Activity answers:

> What happened?

The same source event can feed both, but they remain separate projections.

---

## Notification ≠ AuditEvent

Same source event may produce:

* Notification,
* Activity,
* AuditEvent.

Different purposes.

---

## Notification expiry ≠ source action expiry

A notification can become stale or be removed from active presentation.

That does not expire the underlying:

* ApprovalRequest,
* Invoice,
* Contract,
* SupportRequest.

The source domain controls business expiry.

---

## Notification deduplication

One source action should not produce repeated identical visible notifications because a worker retried.

Conceptually:

```text
source event + recipient + notification type
→ dedupe/idempotency identity
```

---

## Notification update/coalescing

Repeated low-value events may optionally be grouped:

> 3 new messages.

But grouping must not lose source lineage.

No grouping feature is added unless frozen UI supports it.

---

## Delivery retry

Email/provider delivery can retry.

Retries belong to DeliveryAttempt history, not new NotificationRecords unless a genuinely new event occurs.

---

## Provider bounce ≠ preference disabled

If email delivery bounces:

the user's preference can still be enabled.

Operational destination/delivery health is separate.

---

## Unsubscribe ≠ account deactivation

Disabling optional communications does not disable Portal membership.

---

## Notification preference ≠ marketing consent

If marketing/marketing-consent concepts exist, they should remain legally distinct from operational notification preferences.

Do not treat:

> disable Project notifications

as consent withdrawal for unrelated marketing, or vice versa.

This audit adds no marketing-consent system.

---

# 4. Permissions

Design 061 should primarily allow a user to manage **their own configurable notification preferences**.

---

## Current user only

The backend derives current User from session.

Do not trust:

```text
userId
```

from the form.

---

## Personal preference edit ≠ organization default edit

Conceptually:

```text
notifications.preferences.update_self
≠
notifications.defaults.manage_org
```

Exact permissions later.

---

## Organization defaults require separate authority

If Organization notification defaults are configured in Design 060 or later admin surface:

only authorized organization administrators can change them.

A normal user should only manage their own override.

---

## Personal preferences ≠ another user's preferences

Even Client Portal administrators should not silently rewrite another user's personal preference unless a specific administrative policy exists.

No such capability is assumed.

---

## Preference update ≠ source-domain access

A user being allowed to toggle:

> Contract notifications

does not mean they are authorized to view Contracts.

Notification preference settings should not grant resource access.

---

## Source-domain authorization still applies

Do not send a Notification to a user who cannot access the referenced source resource merely because they enabled that category.

Recipient resolution must happen after/with authorization rules.

---

## Notification deep link reauthorizes

Even if a NotificationRecord exists:

opening its target must perform fresh source-domain authorization.

A stale notification is never a security token.

---

## Notification preference should not reveal unavailable modules

If a user has no access to Finance, showing advanced Finance notification settings could reveal product/account information unnecessarily.

The Client-safe preference view may be entitlement-aware.

---

## Mandatory categories should be non-disableable

The UI/backend should expose them as:

* always on,
* required,
* managed by policy,

rather than accepting a disable mutation and silently ignoring it.

---

## Security notifications

Examples of potentially mandatory security events may include:

* password/security changes,
* account recovery,
* new credential verification,
* Portal activation,
* suspicious/authentication-sensitive activity where supported.

Exact list belongs to security/product policy.

---

## Legal/contract notifications

Some Contract/signature notices may need mandatory delivery according to workflow/provider/legal requirements.

Design 061 must not override those obligations casually.

---

## Billing notifications

Payment receipts, failed payment confirmations, issued invoice notices, or other transaction communications can have mandatory policy.

Again:

> optional preference layer cannot supersede business/legal obligations.

---

## Internal policy not visible unnecessarily

The Client only needs to know:

> This notification is required and cannot be disabled.

They do not need internal policy engine metadata.

---

## Generic preference PATCH prohibited

Avoid:

```text
PATCH /notification-settings
{
  whatever: ...
}
```

Use validated known preference/type/channel combinations.

---

## Preference mass assignment protection

A malicious user must not be able to modify:

```text
mandatory
organizationDefault
platformPolicy
anotherUserId
channelProviderConfig
verifiedDestination
```

through self-service updates.

---

# 5. States

Design 061 needs separate state dimensions.

### Preference state

```text
Inherited
Enabled
Disabled
Required / Non-configurable
```

### Channel availability

```text
Available
Unavailable
Not Configured
Verification Required
Temporarily Degraded
```

### Preference persistence

```text
Loading
Saving
Saved
Save Failed
Conflict / Updated Elsewhere
```

### Effective policy

```text
Using Organization Default
Using Personal Override
Forced Enabled by Mandatory Policy
Unsupported for Current Account
```

These must not become one notification status enum.

---

## Enabled ≠ delivered

Preference:

> Email enabled

does not mean:

> Email delivered.

---

## Disabled ≠ historical Notifications deleted

Old NotificationRecords remain according to retention policy.

---

## Required ≠ enabled-by-user

A mandatory preference should not appear as if the Client voluntarily chose it.

Explicitly distinguish:

> Required by service policy.

---

## Inherited ≠ enabled explicitly

If Organization default is ON:

```text
User state = INHERIT
Effective = ON
```

This differs from:

```text
User state = ENABLED
Effective = ON
```

because future default changes behave differently.

---

## Channel unavailable ≠ preference disabled

Example:

```text
Preference:
EMAIL = enabled

Channel:
email destination verification pending
```

The UI should show the problem accurately.

---

## Save failed ≠ delivery disabled

If the preference update fails, preserve the last confirmed server state.

Do not optimistically leave a toggle in a misleading saved position.

---

## Partial save

If several preferences are saved independently and one fails, either:

* transactional save all, or
* clearly show field-level failure.

Do not silently mix states.

---

## Organization default unavailable

If the default-resolution service is unavailable:

do not guess the effective setting.

Use degraded/unknown state where required.

---

## Mandatory policy unavailable

For safety-sensitive categories, fail conservatively.

Do not assume optional delivery merely because policy resolution failed.

Exact failure policy belongs to Phase 3D.

---

## No configurable preferences ≠ notification service unavailable

A user might legitimately have no optional controls.

That is different from service failure.

---

## Read state irrelevant here

Design 061 should not show settings as “read/unread.”

That belongs to NotificationRecords in Design 064.

---

# 6. Responsive Behavior

## Desktop

Desktop should preserve a clear preference hierarchy:

```text
Notification Preferences
↓
Notification Category
    ├── In-app
    ├── Email
    └── other supported channels
↓
Organization default / Personal override
↓
Required communications section
↓
Save / autosave state according to frozen design
```

The frozen UI remains authoritative.

Design 061 should not turn into the Notifications Center.

---

## Tablet

Following Design 152:

* category rows can stack,
* channel toggles remain aligned,
* inherited/required labels stay visible,
* explanatory text remains readable,
* no wide configuration matrix overflow.

---

## Mobile

Priority:

```text
Notification Preferences
↓
Category
    ├── effective setting
    ├── In-app toggle/state
    ├── Email toggle/state
    └── Required/Inherited note
↓
Next Category
```

Do not make users horizontally scroll a desktop channel matrix.

---

## Mobile mandatory state

Required notifications should clearly show:

> Required — cannot be disabled

instead of a disabled toggle with no explanation.

---

## Accessibility

Every toggle/control requires:

* category name,
* channel,
* current effective state,
* inheritance/mandatory context.

Screen readers should hear something equivalent to:

> Approvals, Email notifications, enabled, personal override.

or:

> Security notifications, Email, required, cannot be disabled.

---

## Toggle semantics

Use real switch/checkbox semantics rather than clickable decorative cards alone.

---

## Save feedback

Success/failure should be programmatically announced.

Do not rely only on a brief toast if the control state may be ambiguous.

---

# 7. Backend Requirements

## Read architecture

```text
Design 061
    ↓
ClientPortalSessionContext
    ↓
Notification Preference Authorization
    ↓
ClientNotificationPreferencesQueryService
    │
    ├── NotificationTypeDefinitions
    ├── UserNotificationPreferences
    ├── OrganizationNotificationDefaults
    ├── Platform/Mandatory Policies
    ├── Channel availability
    └── destination readiness
    ↓
Effective Preference Resolver
    ↓
ClientNotificationPreferencesView
```

---

## Effective preference resolver

Conceptually:

```text
resolveNotificationPreference(
    user,
    organization,
    notificationType,
    channel
):
    if mandatory policy requires delivery:
        REQUIRED_ENABLED

    if explicit user override allowed:
        use user override

    if organization default exists:
        use organization default

    return platform default
```

Exact precedence Phase 3D.

---

## Event-to-notification pipeline

```text
Source domain event
        ↓
NotificationEvent / Outbox
        ↓
Notification policy
        ↓
Recipient resolution
        ↓
Authorization / entitlement filtering
        ↓
Preference resolution
        ↓
NotificationRecord
        ↓
Channel delivery scheduling
        ↓
DeliveryAttempt
        ↓
Provider result / retry
```

This should be asynchronous/reliable where appropriate.

---

## Source event should be idempotent

Worker retry must not create duplicate NotificationRecords.

Use a stable event/dedupe identity.

---

## Recipient-specific NotificationRecord

A source event sent to 5 users should result in recipient-scoped records/read state.

Do not share one global Notification row with one global `read` flag.

---

## Channel DeliveryAttempt

Conceptually:

```text
NotificationDeliveryAttempt
├── notificationRecordId
├── channel
├── provider reference
├── attempt number
├── state
├── attemptedAt
├── deliveredAt
└── safe failure classification
```

Exact schema later.

---

## Retry logic

Transient delivery failures can retry.

Permanent failures such as invalid destination should transition differently.

Do not retry indefinitely without policy.

---

## Provider abstraction

Email/push/SMS providers should sit behind channel adapters.

Notification domain must not be hard-coded to one provider.

---

## Destination resolution

The backend determines the correct verified destination from canonical account/contact-auth data according to channel policy.

The browser should not submit arbitrary:

```text
send notifications to attacker@example.com
```

inside a preference toggle.

Changing a delivery address belongs to Profile/Auth/contact workflows.

---

## Mandatory policy registry

The backend needs explicit policy for non-configurable notifications.

Conceptually:

```text
NotificationTypeDefinition
mandatoryMode =
  ALWAYS
  CHANNEL_REQUIRED
  CONFIGURABLE
```

or equivalent.

Exact model later.

---

## Source resource authorization

Recipient eligibility should be derived from:

* membership,
* source-domain entitlement,
* participant role,
* event semantics.

Example:

An Approval notification should go only to an authorized ApprovalParticipant, not every Client user who enabled Approval notifications.

---

## Stale authorization

If access is revoked after NotificationRecord creation:

the record may remain according to history policy, but opening its source reauthorizes.

Sensitive notification previews may need safe handling after revocation.

---

## Read state pipeline belongs to Design 064

Design 061 does not need to modify NotificationReadState when preferences change.

---

## Preference writes

Use narrow commands such as:

```text
setMyNotificationPreference()
resetMyNotificationPreferenceToDefault()
```

where frozen UX supports inheritance/reset.

Avoid bulk arbitrary settings mutation.

---

## Concurrency

Two sessions updating preferences should use revision/optimistic concurrency or well-defined last-write semantics.

Silent conflicting UI state should be avoided.

---

## Organization-default cache invalidation

When Design 060 changes an organization default:

effective preference caches must update for users who inherit it.

Explicit personal overrides remain unchanged.

---

## Mandatory policy cache

Mandatory-policy changes should invalidate effective preference caches immediately enough to prevent prohibited opt-outs.

---

## Notification creation should not block core workflow

Example:

Client approves Proof.

Correct:

```text
ApprovalDecision committed
↓
domain event
↓
Notification processing asynchronously
```

If email provider is down, the Approval must not fail merely because a Notification could not be delivered.

---

## Transactional/outbox reliability

For important source events, use an outbox/event mechanism so:

```text
business transaction succeeded
but notification event lost
```

is minimized.

Exact implementation Phase 3D.

---

## Client Action integration

Notification can contain:

```text
sourceActionRef
```

or deep-link context.

But ClientActionResolver remains canonical for action truth.

---

## Notification Center integration

Design 064 consumes:

```text
NotificationRecord
ReadState
source context
```

generated by this shared infrastructure.

It should not query UserNotificationPreference as its source of historical truth.

---

## Activity integration

Some source events can also create Design 063 Activity entries.

Do not derive Activity from Notification delivery success.

Activity should reference the original business event.

---

## Audit integration

Preference changes may emit:

```text
NotificationPreferenceChanged
NotificationPreferenceReset
```

when appropriate.

Mandatory policy changes originate from administrative configuration, not Design 061.

---

## Backend Requirement Matrix

| Requirement                                    | Status                    |
| ---------------------------------------------- | ------------------------- |
| Client Portal authentication                   | **Critical**              |
| Current User derived from session              | **Critical**              |
| Active Portal membership                       | **Critical**              |
| Canonical NotificationEvent model/pipeline     | **Critical**              |
| Recipient-specific NotificationRecord          | **Critical**              |
| NotificationDeliveryAttempt                    | **Critical**              |
| Channel abstraction                            | **Critical**              |
| UserNotificationPreference                     | **Critical**              |
| Organization-default separation                | **Critical**              |
| Platform/mandatory policy layer                | **Critical**              |
| NotificationTypeDefinition registry            | **Critical**              |
| Category/source-domain mapping                 | **Critical**              |
| INHERIT vs ENABLED vs DISABLED semantics       | **Critical**              |
| User override eligibility                      | **Critical**              |
| Mandatory notification override protection     | **Critical**              |
| Security/legal/billing transactional policy    | **Critical**              |
| Channel availability/readiness                 | **Critical**              |
| Verified destination handling                  | **Critical**              |
| Preference vs destination separation           | **Critical**              |
| Read-state separation                          | **Critical**              |
| ClientAction separation                        | **Critical**              |
| Message separation                             | **Critical**              |
| Activity separation                            | **Critical**              |
| Idempotent notification creation               | **Critical**              |
| Delivery retry/idempotency                     | **Critical**              |
| Provider abstraction                           | **Critical**              |
| Source authorization before recipient delivery | **Critical**              |
| Fresh authorization on deep-link open          | **Critical**              |
| Organization-default cache invalidation        | **Required**              |
| Mandatory-policy cache invalidation            | **Critical**              |
| Async/outbox delivery reliability              | **Critical**              |
| Preference concurrency handling                | **Required**              |
| Client-safe preference projection              | **Critical**              |
| Design 059 user preference reuse               | **Critical**              |
| Design 060 org-default integration             | **Critical**              |
| Design 064 Notification Center reuse           | **Critical**              |
| Design 080 Team Center reuse                   | **Critical architecture** |
| Design 143 rule-management reuse               | **Critical architecture** |
| Authentication/security integration            | **Critical**              |
| Audit integration                              | **Required**              |

---

# 8. Consolidation

Design 061 exposes several major implementation risks.

**NotificationEvent / NotificationRecord conflation**
One source event gets one global read state for all recipients.

**NotificationRecord / DeliveryAttempt conflation**
Email retry creates duplicate notifications.

**DeliveryAttempt / delivery guarantee conflation**
Enabled preference is shown as proof delivery succeeded.

**Channel / provider conflation**
Notification system becomes hard-coded to one email/SMS vendor.

**Channel / preference conflation**
Enabling Email is treated as creation/configuration of an email account.

**Preference / OrganizationDefault conflation**
One user changes notification settings for the whole Client.

**Preference / platform policy conflation**
Client disables mandatory security/legal communication.

**Null / Disabled conflation**
Inherited settings are mistaken for explicit opt-out.

**Inherited / explicitly enabled conflation**
Organization default changes unexpectedly ignore user intent.

**Mandatory / priority conflation**
Only “critical”-priority messages bypass preferences even when other legally required notices should too.

**Mandatory / all-channel conflation**
A mandatory event is sent through every possible channel instead of governed required channels.

**Preference / destination conflation**
Changing a toggle silently changes user email/phone.

**Authentication email / notification destination conflation**
Ordinary notification setting mutates login credentials.

**Preference / delivery health conflation**
Email bounce automatically turns preference off without clear semantics.

**Read state / preference conflation**
Disabling category marks historical notifications read.

**Read state / delivery state conflation**
Delivered email means in-app notification becomes read.

**Notification / ClientAction conflation**
Reading “Approve proof” completes the approval.

**Notification / Message conflation**
Notification Center becomes a second Conversation inbox.

**Notification / Activity conflation**
Account history depends on whether delivery succeeded.

**Notification / Audit conflation**
Notification delivery is treated as forensic business history.

**Source access / preference entitlement conflation**
User enabling Contract notifications gains Contract access.

**Organization membership / recipient eligibility conflation**
Every Client user receives every domain notification.

**Approval category / ApprovalParticipant conflation**
All users with Approval notifications enabled receive formal approval requests.

**Notification deep link / authorization token conflation**
Old notification bypasses current resource permissions.

**Optional / mandatory transactional conflation**
Billing receipt or security recovery email is suppressible through a generic toggle.

**Marketing consent / operational notification preference conflation**
Unrelated consent domains are mixed.

**Preference enabled / channel available conflation**
UI claims notifications are working despite unverified destination.

**Provider outage / preference disabled conflation**
Temporary provider outage changes user preference state.

**Source-domain transaction / notification delivery coupling**
Approval or Payment fails because email provider is down.

**Duplicate-event bug**
Worker retry generates multiple identical notifications.

**Organization-default cache staleness**
Inherited users continue with old defaults after admin change.

**Mandatory-policy cache staleness**
Users suppress newly required communication because stale preference cache wins.

**Generic settings PATCH**
Client mutates mandatory/policy/provider fields.

**061/059 duplicate personal preference storage**
Notification preferences exist partly in Profile and partly in Notification settings.

**061/060 duplicate organization defaults**
Company-wide notification defaults drift across settings tables.

**061/064 duplicate notification domain**
Settings and Notification Center each implement different notification identity/state.

**061/080 duplicate Client/Internal infrastructure**
Team and Client notification systems get different core delivery engines.

**061/143 duplicate rule engine**
Alert-rule administration and recipient preferences independently decide which notifications exist.

No additional screen is required.

These are **notification identity, delivery, preference inheritance, mandatory policy, channel execution, authorization and reliability requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT NOTIFICATION PREFERENCE, DELIVERY POLICY & CHANNEL CONTROL ANCHOR**

**Domain directive:**
**NotificationEvent ≠ NotificationRecord ≠ DeliveryAttempt ≠ Channel ≠ UserNotificationPreference ≠ OrganizationDefault ≠ ReadState ≠ ClientAction ≠ Message.**

**Event directive:**
source domains emit canonical business events; notification infrastructure converts eligible events into recipient-specific NotificationRecords without becoming source business truth.

**Record directive:**
each recipient owns their own NotificationRecord/read state. A shared business event never carries one global read flag.

**Delivery directive:**
channel delivery is represented by separate DeliveryAttempts so provider retries/failures never duplicate or rewrite notification identity.

**Channel directive:**
Email, In-app and any other supported channels remain abstract delivery mechanisms rather than provider-specific business entities.

**Preference directive:**
Design 061 owns only the authenticated user's configurable notification choices; it never modifies another user's preference, organization policy or source-domain permissions.

**Inheritance directive:**
effective preference resolves through explicit precedence: mandatory policy → permitted personal override → organization default → platform default, according to governed rules.

**Null directive:**
absence of personal preference means inheritance—not implicit disablement.

**Organization directive:**
Design 060/040 owns organization-level defaults; Design 061 never changes company-wide behavior while saving one user's preferences.

**Mandatory directive:**
security, legal, Contract, billing, access-recovery or other transactional communications identified as mandatory by policy cannot be suppressed by an optional user setting.

**Transparency directive:**
mandatory/non-configurable preferences should be represented as required, not as editable controls that the backend secretly ignores.

**Destination directive:**
preference controls delivery eligibility, not destination identity. Email/phone/contact verification remains owned by the account/authentication/contact subsystem.

**Read-state directive:**
Design 064 owns Notification history/read state. Preference changes never mark historical records read, delete them or complete their source actions.

**Action directive:**
Notifications can point to Design 047 ClientAction/source workflows, but reading/dismissing a Notification never completes Approval, Contract, Payment, Support or other business actions.

**Messaging directive:**
Messages remain Design 045 Conversation entities. A notification about a Message is only an attention signal.

**Authorization directive:**
notification recipient resolution respects current source-domain entitlements and participant roles. Enabling a category never grants access to the underlying resource.

**Deep-link directive:**
opening a Notification always reauthorizes the referenced source resource; a NotificationRecord is never an authorization token.

**Idempotency directive:**
source-event processing and delivery retries are idempotent so one event/recipient does not create duplicate visible notifications.

**Reliability directive:**
core business transactions commit independently of provider delivery. Notification delivery failures remain asynchronous communication failures rather than business-operation failures.

**Provider directive:**
notification providers sit behind channel adapters; Client preference data contains no provider credentials or delivery infrastructure configuration.

**Audit directive:**
material preference changes may feed Design 039 while Notification history and DeliveryAttempt history remain their own operational records.

**Responsive directive:**
desktop can present a category × channel matrix if frozen; tablet/mobile should stack categories while preserving effective/inherited/required state and clear toggle semantics.

**Overlap directive:**
Designs **039, 045, 047, 059–061, 064, 075–080, 143 and relevant source domains** must share one Notification Event + Recipient + Record + Delivery Attempt + Preference + Policy infrastructure.

**Consolidation directive:**
**STANDARDIZE ONE PLATFORM-WIDE NOTIFICATION INFRASTRUCTURE — NOTIFICATIONEVENT + TYPE/POLICY REGISTRY + RECIPIENT RESOLUTION + USER PREFERENCE + ORGANIZATION DEFAULT + MANDATORY POLICY + NOTIFICATIONRECORD + RECIPIENT READ STATE + CHANNEL DELIVERY ATTEMPT + PROVIDER ADAPTER — WITH CLIENT AND INTERNAL PROJECTIONS, AND DO NOT BUILD SEPARATE NOTIFICATION ENGINES FOR PREFERENCES, CLIENT CENTER, TEAM CENTER, SECURITY, BILLING OR ALERT RULES.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **61 / 153** |
| **PASS**                                   |                         **61** |
| **STANDARDIZE decisions**                  |                         **59** |
| **Potential implementation-overlap flags** |                         **52** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**61 / 153 = 39.9% audited.**

### Canonical Notification architecture after Design 061

```text
                SOURCE DOMAIN EVENT
                        │
                        ↓
                NotificationEvent
                        │
                        ↓
               Notification Policy
          ┌─────────────┼──────────────┐
          ↓             ↓              ↓
     Recipient       Mandatory?     Category
     Resolution
          │
          ↓
     Authorization
          │
          ↓
   Preference Resolution
          │
   ┌──────┼───────────────┐
   ↓      ↓               ↓
Mandatory User Override Org Default
Policy                    │
   └──────────┬────────────┘
              ↓
      Effective Preference
              ↓
      NotificationRecord
              │
       ┌──────┴──────┐
       ↓             ↓
   ReadState     DeliveryAttempt
                       │
                 ┌─────┼─────┐
                 ↓     ↓     ↓
               In-app Email Other
```

The Client notification surfaces remain cleanly separated:

```text
Design 061
Notification Preferences
        │
        ↓
“What should be delivered?”

Design 064
Notifications Center
        │
        ↓
“What was delivered / what needs attention?”
```

And source truth remains outside both:

```text
ApprovalRequest
Invoice
Contract
Message
SupportRequest
Report
Publication
etc.
        ↓
Notification may reference them
        ↓
but Notification never replaces them
```

# Next Sequential Audit Target

## **Design 062 — Client Portal Users / Team Access**

Its frozen identity is already locked.

The next audit must preserve the Portal-access boundary:

> **User ≠ Client Portal Membership ≠ Invitation ≠ Organization Membership ≠ Portal Role ≠ Permission ≠ Project Scope ≠ Client Contact ≠ Authentication Identity.**

It will also need to preserve:

* invite ≠ active membership,
* Portal administrator ≠ unrestricted platform administrator,
* role ≠ job title,
* Project/resource access ≠ organization-wide access,
* deactivation ≠ deletion,
* changing Portal access must not rewrite historical signer, approver, Message, Contract, or Audit evidence.

After Design 062 we continue strictly:

**063 Client Activity / Account History → 064 Client Notifications Center → 065 Client Media Projects / Media Center → 066 Client Media Project Detail → … → 077 Client Access Recovery**

with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
