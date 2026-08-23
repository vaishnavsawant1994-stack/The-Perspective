# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 092 — Sending Accounts / Email Connections

Design 092 should become the **canonical Team Workspace sending-identity, provider-connection, credential isolation, health, and delivery-governance surface** for the Outreach system established by Designs 012–014 and refined through Designs 090–091.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **SendingAccount ≠ ProviderConnection ≠ Credential/Token ≠ MailboxIdentity ≠ Campaign ≠ Enrollment ≠ Message ≠ DeliveryAttempt ≠ ProviderEvent ≠ ConnectionHealth ≠ SendingPolicy/Limit.**

The central implementation rule is:

> **A SendingAccount is a stable reusable outbound-sending resource. Its current provider connection, credential material, mailbox identity, health, and sending limits are related but independent concepts. Campaigns and Messages may reference the SendingAccount, but they never own its credentials. Credential rotation, reconnection, provider outages, rate limiting, or account-health changes must not rewrite historical Messages or DeliveryAttempts, and retries must never generate duplicate sends merely because the transport outcome was uncertain.**

---

# 1. Classification

| Audit field                     | Classification                                                                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**                   | **092**                                                                                                                                                      |
| **Canonical name**              | **Sending Accounts / Email Connections**                                                                                                                     |
| **Product area**                | Team Workspace / Outreach / Messaging Infrastructure                                                                                                         |
| **User surface**                | **Authenticated Team Workspace**                                                                                                                             |
| **Screen class**                | Integration Resource / Sending Identity / Connection Operations Workspace                                                                                    |
| **Classification**              | **Canonical Sending Account, Provider Connection & Delivery Governance Anchor**                                                                              |
| **Primary purpose**             | Configure and inspect reusable sending identities/connections while isolating secrets, provider state, health and sending limits from Campaign/Message state |
| **Primary entity**              | **SendingAccount**                                                                                                                                           |
| **Provider integration entity** | **ProviderConnection**                                                                                                                                       |
| **Secret entity**               | **Credential / Token / SecretReference**                                                                                                                     |
| **Address/identity entity**     | **MailboxIdentity**                                                                                                                                          |
| **Health projection**           | **ConnectionHealth**                                                                                                                                         |
| **Policy entity/configuration** | **SendingPolicy / SendingLimit**                                                                                                                             |
| **Campaign dependency**         | Designs 012 / 090                                                                                                                                            |
| **Sequence dependency**         | Design 013                                                                                                                                                   |
| **Message dependency**          | Design 014 / 090                                                                                                                                             |
| **Template dependency**         | Design 091                                                                                                                                                   |
| **Enrollment dependency**       | Design 090                                                                                                                                                   |
| **Delivery entity**             | **DeliveryAttempt**                                                                                                                                          |
| **Provider evidence**           | **ProviderEvent**                                                                                                                                            |
| **Reply dependency**            | Design 014 / upcoming Design 093                                                                                                                             |
| **Primary query service**       | `SendingAccountQueryService`                                                                                                                                 |
| **Connection service**          | `ProviderConnectionService`                                                                                                                                  |
| **Secret service**              | `CredentialVaultService` / secret manager abstraction                                                                                                        |
| **Sending-account service**     | `SendingAccountService`                                                                                                                                      |
| **Delivery coordination**       | `OutreachDeliveryService`                                                                                                                                    |
| **Rate/limit service**          | `SendingPolicyService` / `SendingLimitCoordinator`                                                                                                           |
| **Health service**              | `SendingAccountHealthService`                                                                                                                                |
| **Parent shell**                | `InternalAppShell` — Design 001                                                                                                                              |
| **Auth**                        | Required                                                                                                                                                     |
| **Authorization**               | Active OrganizationMembership + sending-account/connection/credential/policy permissions                                                                     |
| **Implementation priority**     | **Critical Security / Deliverability / Duplicate-Send Prevention / Provider Reliability**                                                                    |
| **Reuse level**                 | **Extremely High across Campaign, Message, Delivery and Reply domains**                                                                                      |

Design 092 should answer:

> **“Which outbound sending identities are available to this workspace, which mailbox/provider does each represent, is the connection currently usable, what sending policy applies, and can Campaign execution use it safely without exposing credentials or creating duplicate delivery?”**

Canonical structure:

```text
SendingAccount
      │
      ├── MailboxIdentity
      │
      ├── ProviderConnection
      │        │
      │        └── CredentialReference
      │
      ├── ConnectionHealth
      │
      └── SendingPolicy / Limits
               │
               ↓
        Campaign / Enrollment
               │
               ↓
             Message
               │
               ↓
        DeliveryAttempt[]
               │
               ↓
         ProviderEvent[]
```

---

# 2. Reuse

## Designs 012 and 090 remain Campaign authority

Campaigns may reference:

```text
sendingAccountId
```

or a governed account-selection policy.

They must never own:

* OAuth refresh tokens,
* SMTP passwords,
* provider API secrets,
* webhook secrets.

Correct:

```text
Campaign
   ↓
SendingAccount reference
   ↓
ProviderConnection
   ↓
SecretReference
```

Not:

```text
Campaign {
  gmailRefreshToken: ...
}
```

---

## Design 013 remains Sequence authority

A Sequence step may define:

> send an email

but the Sequence does not own provider credentials or mailbox connectivity.

Sequence behavior remains reusable independent of which permitted SendingAccount eventually executes it.

---

## Design 014 remains canonical Message/Conversation authority

Design 092 transports canonical Messages.

It does not create provider-specific duplicates such as:

```text
GmailMessage
MicrosoftMessage
SMTPMessage
```

as independent business Message identities.

Provider-specific metadata belongs to delivery/integration evidence.

---

## Design 090 remains Campaign delivery composition authority

Design 090 already established:

```text
Campaign
→ Enrollment
→ Message
→ DeliveryAttempt
```

Design 092 provides the canonical SendingAccount and provider infrastructure beneath that chain.

---

## Design 091 remains canonical content/rendering authority

Provider adapters must transport the exact generated Message.

They must **not** re-run template logic or reinterpret personalization.

Permanent:

```text
Template rendering
→ Design 091

Transport
→ Design 092
```

---

## Provider adapter ≠ content engine

A Gmail adapter and Microsoft adapter must not produce different personalized wording from the same canonical Message.

They can transform only necessary transport representation.

---

## SendingAccount ≠ Campaign

One SendingAccount can support many Campaigns over time.

One Campaign may use one or more SendingAccounts if the frozen configuration/policy permits.

Neither entity owns the other.

---

## SendingAccount ≠ Team User

A User may:

* connect the account,
* administer it,
* use it,

but the SendingAccount is not the User.

---

## SendingAccount ≠ Contact

A CRM Contact email cannot automatically become a SendingAccount.

Outbound sending identity is infrastructure, not CRM person identity.

---

# 3. Entities

## SendingAccount

`SendingAccount` should be the stable platform identity representing a reusable outbound sending resource.

Conceptually:

```text
SendingAccount
├── id
├── organizationId
├── displayName
├── mailboxIdentityId
├── providerConnectionId/current connection relation
├── lifecycle
├── sendingPolicyId
├── createdAt
├── createdBy
└── revision
```

Exact schema belongs to Phase 3D.

---

## SendingAccount ≠ mailbox email string

Permanent.

An email address may identify the visible mailbox, but the SendingAccount needs a stable platform identity.

---

## Reconnecting must not recreate SendingAccount unnecessarily

Example:

```text
SendingAccount SA-10
Mailbox: sales@acme.com

OAuth token expires
      ↓
Reconnect
      ↓
new credential/token context

SendingAccount remains SA-10
```

Historical Message/Delivery relationships remain intact.

---

## Credential rotation ≠ SendingAccount recreation

Permanent.

---

## Provider outage ≠ SendingAccount deletion

Permanent.

---

## SendingAccount lifecycle ≠ ConnectionHealth

Example:

```text
SendingAccount = ACTIVE
ConnectionHealth = DEGRADED
```

Valid.

---

## SendingAccount archived ≠ historical Message deletion

Absolute.

---

## ProviderConnection

`ProviderConnection` represents the configured relationship to an external sending provider/service.

Conceptually:

```text
ProviderConnection
├── id
├── sendingAccountId
├── providerType
├── providerAccountReference
├── connection lifecycle
├── secretReference
├── connectedAt
├── refreshed/reconnectedAt
└── revision
```

---

## ProviderConnection ≠ Credential

Permanent.

The connection contains metadata describing the integration.

Credential material lives separately in protected secret storage.

---

## ProviderConnection ≠ MailboxIdentity

A connection says:

> how this platform talks to the provider.

MailboxIdentity says:

> which external sender/mailbox identity is represented.

Different concepts.

---

## Connection replacement can preserve mailbox identity

Example:

```text
MailboxIdentity MI-10
sales@acme.com

ProviderConnection PC-1
expired

ProviderConnection PC-2
reconnected

Mailbox identity remains MI-10
```

where provider semantics support that continuity.

---

## Provider type ≠ Message domain

Switching from one provider integration implementation to another must not create new canonical Messages.

---

## Credential / Token

Credential material includes provider-specific authentication secrets such as:

* access token,
* refresh token,
* SMTP credential,
* application secret,

depending on connection type.

These must not be ordinary application-domain fields.

---

## Credential should use secret references

Conceptually:

```text
ProviderConnection
      ↓
CredentialReference
      ↓
Vault / KMS / encrypted secret store
```

Not:

```text
providerConnection.refreshToken
```

returned through normal DTOs.

---

## Credential ≠ connection lifecycle

A connection can exist while credential state is:

* valid,
* expired,
* revoked,
* missing,
* unknown.

---

## Credential version/rotation

Secret rotation should create/update protected secret versions while recording non-secret metadata such as:

* rotatedAt,
* credential revision/version reference,
* status.

Never preserve plaintext old secrets for historical Delivery evidence.

---

## Historical delivery does not need historical secret value

Critical.

Historical Message/Delivery evidence should preserve:

* SendingAccount ID,
* MailboxIdentity,
* provider,
* provider Message ID,
* attempt outcome,

but **not** the credential token used.

---

## Credential revoked ≠ historical sends invalid

Permanent.

---

## MailboxIdentity

`MailboxIdentity` represents the visible external sender identity.

Conceptually:

```text
MailboxIdentity
├── id
├── provider/native account identifier where available
├── email/address
├── display name
├── alias/reply identity where supported
├── verification state
├── observedAt
└── provider metadata
```

Exact fields depend on provider support.

---

## MailboxIdentity ≠ platform User

Critical.

Even if:

```text
User.email = editor@company.com
MailboxIdentity.email = editor@company.com
```

these remain separate identities.

---

## MailboxIdentity ≠ Contact

Permanent.

---

## MailboxIdentity ≠ AuthenticationIdentity

Permanent.

A platform login email is not automatically proof of mailbox control.

---

## Mailbox email change ≠ User email change

Permanent.

---

## Provider-native account ID is stronger than email string where available

Email/display values can change.

Provider-native identity can help confirm reconnection to the intended mailbox.

---

## Mailbox alias ≠ new SendingAccount necessarily

If provider supports aliases, model their sending semantics deliberately.

Do not automatically create separate canonical accounts for every alias unless product policy requires it.

---

## Campaign

Campaign references an available permitted SendingAccount.

It does not embed connection state.

---

## CampaignVersion may pin sender-selection context

If exact sender matters to reproducibility, Campaign/Enrollment execution should preserve which SendingAccount or sender-selection rule governed the Message.

---

## Campaign active ≠ SendingAccount healthy

Permanent.

---

## SendingAccount unhealthy ≠ Campaign completed/failed automatically

Future delivery may:

* defer,
* pause,
* fail specific attempts,

according to policy.

Campaign lifecycle remains separate.

---

## Enrollment

Enrollment may eventually use a SendingAccount through its Campaign execution context.

Enrollment itself does not own credentials.

---

## Message

Message is concrete outbound communication.

Conceptually it should preserve:

```text
Message
├── id
├── enrollmentId
├── exact generated content
├── recipient evidence
├── sender/SendingAccount reference or snapshot
└── generation context
```

---

## Message ≠ DeliveryAttempt

Permanent.

---

## One Message can have multiple DeliveryAttempts

Example:

```text
Message M-100
├── Attempt A1 — network timeout / outcome unknown
├── Attempt A2 — reconciled retry
└── provider delivery evidence
```

But retry semantics must ensure A2 does not create a duplicate external message.

---

## Retry ≠ new Message

Permanent for a transport retry of the same outbound communication intent.

---

## Deliberately resend as a new communication ≠ retry

A genuine second outreach message should be a new Message.

Do not hide it as another transport attempt.

---

## DeliveryAttempt

Conceptually:

```text
DeliveryAttempt
├── id
├── messageId
├── sendingAccountId
├── providerConnection context
├── attemptNumber
├── transport idempotency key
├── providerMessageId if known
├── startedAt
├── completedAt
├── outcome
└── failure classification
```

---

## DeliveryAttempt should preserve SendingAccount identity

Even after reconnection:

historical attempt should still show which SendingAccount/mailbox identity was used.

---

## DeliveryAttempt ≠ Credential version as business identity

Credential revision can be recorded as non-secret operational metadata if needed for debugging, but historical transport truth does not require retaining credentials.

---

## Provider accepted ≠ delivered

Permanent.

Provider API acknowledgment may only mean:

> accepted for processing.

---

## Delivered ≠ recipient read

Permanent.

---

## Delivered ≠ replied

Permanent.

---

## Deferred ≠ failed

Permanent.

---

## Unknown ≠ failed

Critical.

---

## ProviderEvent

`ProviderEvent` should preserve normalized/raw provider callback evidence.

Conceptually:

```text
ProviderEvent
├── provider
├── providerEventId
├── sendingAccount context
├── providerMessageId
├── eventType
├── providerOccurredAt
├── receivedAt
├── signature verification metadata
├── normalized linkage
└── safe/raw evidence reference where retained
```

---

## ProviderEvent ≠ DeliveryAttempt

Permanent.

One attempt can receive multiple events:

```text
Accepted
Delivered
Opened
Bounced
```

depending on provider capabilities.

---

## ProviderEvent ≠ canonical delivery state directly

Canonical state is resolved from event history.

Do not simply set:

```text
delivery.status = latestWebhook.type
```

---

## ProviderEvent should be append-oriented

Repeated provider callbacks should not mutate prior evidence into a different event.

---

## Duplicate webhook ≠ duplicate business event

Use provider event IDs/fingerprints to dedupe.

---

## Out-of-order events

Provider events can arrive:

```text
Delivered at 10:01
Accepted callback received at 10:02
```

Canonical delivery must not regress from Delivered → Accepted because the callback arrived later.

---

## ConnectionHealth

`ConnectionHealth` is a derived/current operational assessment.

Conceptually it can consider:

* credential validity,
* provider reachability,
* recent authentication errors,
* rate-limit pressure,
* connection probes,
* delivery failure patterns.

---

## ConnectionHealth ≠ ProviderConnection

Permanent.

The connection is canonical configuration.

Health is an assessment/projection.

---

## Health ≠ credential state alone

Credential can be valid while provider is unavailable.

---

## Health ≠ Campaign status

Permanent.

---

## Healthy ≠ unlimited sending capacity

Permanent.

A healthy account can still be at its sending limit.

---

## ConnectionHealth should carry freshness

Conceptually:

```text
health
assessedAt
reason/category
freshness
```

A week-old health result must not appear current.

---

## Unknown health ≠ healthy

Critical.

---

## SendingPolicy / Limit

Sending limits must remain first-class governance/configuration.

Conceptually:

```text
SendingPolicy
├── sendingAccountId / policy scope
├── enabled channels
├── per-window limit
├── concurrency limit
├── provider constraints
├── organization constraints
├── policy revision
└── effective dates
```

Exact limits/operators belong to Phase 3D.

---

## SendingPolicy ≠ provider's actual capacity

Provider limits can change externally.

Effective sending permission may need to consider:

```text
workspace policy
∩
SendingAccount policy
∩
provider constraints
∩
Campaign policy
```

with exact precedence defined later.

---

## Limit ≠ current usage

Permanent.

A policy might allow:

> 500/day.

Current utilization might be:

> 420 used.

Separate concepts.

---

## Rate-limit counter ≠ Campaign metric

Sending-capacity usage is infrastructure state.

Campaign “sent count” is analytics.

Do not use one for the other.

---

## Manual send/campaign action must not bypass policy

Absolute.

Every outbound transport path must pass through the same centralized enforcement layer.

---

# 4. Permissions

Design 092 should distinguish at least conceptually:

```text
sendingAccount.read
sendingAccount.create
sendingAccount.edit
sendingAccount.enableDisable
sendingAccount.archive

providerConnection.manage
providerConnection.reconnect

sendingCredential.rotate
sendingCredential.revoke

sendingPolicy.read
sendingPolicy.manage

sendingAccount.use
sendingAccount.health.read
```

Exact names belong to Phase 3D.

---

## SendingAccount read ≠ credential read

Absolute.

Ordinary application users should generally never receive raw credential values at all.

---

## Credential management ≠ secret reveal

Even a credential administrator usually needs:

* rotate,
* reconnect,
* revoke,

rather than:

> show me the refresh token.

---

## SendingAccount use ≠ connection administration

A Campaign operator can use an approved account without changing OAuth/SMTP configuration.

---

## Connection administration ≠ Campaign access

Permanent.

---

## Sending-policy management ≠ Campaign launch authority

Permanent.

---

## SendingAccount edit ≠ mailbox ownership proof

Changing display metadata does not verify mailbox control.

---

## Connection creation requires current provider authorization

OAuth/other setup must bind:

* current tenant,
* current actor,
* intended SendingAccount,
* expected callback state.

---

## OAuth callback protection

Where OAuth is used, protect against:

* callback CSRF/state mismatch,
* connection substitution,
* tenant mix-up,
* replay.

Use provider-appropriate secure flows.

---

## Redirect/callback must not trust browser account IDs

The backend resolves the authenticated provider identity and verifies it against the intended connection context.

---

## Cross-tenant SendingAccount use prohibited

Absolute.

Campaign C from Organization A cannot specify SendingAccount B belonging to Organization B.

---

## Direct connection/credential IDs reauthorize

Knowing IDs grants no access.

---

## Health detail can contain sensitive provider information

A Sales user may see:

> Connection needs attention

without seeing internal provider diagnostics.

---

## Provider diagnostics ≠ credential visibility

Permanent.

---

## Policy counters can leak operational capacity

Detailed send limits/utilization may be restricted separately from basic account usability.

---

## Webhooks do not use Team permissions

External provider callbacks authenticate through:

* signatures,
* shared verification secret,
* provider-specific validation,

not OrganizationMembership.

---

# 5. States

Design 092 must keep **SendingAccount lifecycle, ProviderConnection state, Credential state, MailboxIdentity state, ConnectionHealth, SendingPolicy/limit state, and Delivery execution state** independent.

### SendingAccount lifecycle

Conceptually:

```text
Active
Disabled
Archived
```

### ProviderConnection state

```text
Connecting
Connected
Disconnected
Needs Reauthorization
Revoked
Error
Unknown
```

### Credential state

```text
Valid
Expiring
Expired
Revoked
Missing
Unknown
```

### MailboxIdentity state

```text
Detected
Verified / Confirmed
Changed
Unavailable
Conflict
```

### ConnectionHealth

```text
Healthy
Degraded
Failing
Unknown
Stale
```

### Sending-capacity state

```text
Available
Near Limit
Limit Reached
Rate Limited
Policy Blocked
Usage Unknown
```

### DeliveryAttempt state

```text
Queued
Sending
Provider Accepted
Delivered
Deferred
Bounced
Rejected
Failed
Outcome Unknown
```

These must not become one `sendingAccount.status`.

---

## SendingAccount active ≠ connected

Permanent.

---

## Connected ≠ credential healthy forever

Permanent.

---

## Credential valid ≠ provider reachable

Permanent.

---

## Provider reachable ≠ mailbox permitted to send

Permanent.

---

## Healthy ≠ under limit

Permanent.

---

## Rate limited ≠ disconnected

Permanent.

---

## Limit reached ≠ Campaign failed

Permanent.

Future deliveries wait/stop according to policy.

---

## Disabled account ≠ credential revoked necessarily

Permanent.

An operator can intentionally disable use while preserving the provider connection.

---

## Credential expired ≠ historical DeliveryAttempts failed

Permanent.

---

## Reconnected ≠ historical attempts re-evaluated

Permanent.

---

## Mailbox identity changed unexpectedly

This should be explicit and may require review.

Do not silently continue sending from a different external identity under the old SendingAccount if provider identity continuity cannot be established.

---

## Provider accepted ≠ delivered

Permanent.

---

## Provider accepted + no callback ≠ delivered

Permanent.

Outcome may remain:

> accepted/unknown.

---

## Provider callback missing ≠ provider failure automatically

Permanent.

---

## Duplicate ProviderEvent ≠ duplicate delivery

Permanent.

---

## Zero send capacity ≠ connection unavailable

Permanent.

---

## Usage unavailable ≠ zero usage

Critical.

---

## Health probe unavailable ≠ unhealthy necessarily

Use `Unknown`/`Stale`, not false failure.

---

## State Coverage

Design 092 inherits Design 150 plus:

```text
Sending Accounts Loading
Sending Accounts Available
Sending Accounts Empty
Sending Accounts Restricted

Sending Account Active
Sending Account Disabled
Sending Account Archived

Connection Starting
Connection Connected
Connection Disconnected
Connection Needs Reauthorization
Connection Revoked
Connection Error
Connection Unknown

Credential Valid
Credential Expiring
Credential Expired
Credential Revoked
Credential Missing
Credential Unknown

Mailbox Identity Confirmed
Mailbox Identity Changed
Mailbox Identity Conflict
Mailbox Identity Unavailable

Connection Healthy
Connection Degraded
Connection Failing
Connection Health Unknown
Connection Health Stale

Sending Capacity Available
Sending Capacity Near Limit
Sending Limit Reached
Provider Rate Limited
Sending Policy Blocked
Usage Unknown

Delivery Queued
Delivery Sending
Provider Accepted
Delivered
Deferred
Bounced
Rejected
Delivery Failed
Delivery Outcome Unknown

Provider Callback Verified
Provider Callback Duplicate
Provider Callback Invalid
Provider Callback Unlinked

Account Updated Elsewhere
Partial Sending Infrastructure Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should emphasize **sending identity, connection safety and operational readiness**, not Campaign analytics.

Conceptually:

```text
Sending Accounts
↓
Account rows/cards
   ├── mailbox identity
   ├── provider
   ├── connection state
   ├── health
   ├── sending capacity/policy summary
   └── allowed account action

Selected account, if present in frozen design
   ├── connection metadata
   ├── health
   ├── limits
   └── safe operational diagnostics
```

Only frozen-design elements should render.

---

## Mailbox identity should remain distinct from connected User

Correct visual semantics:

> [sales@perspective.com](mailto:sales@perspective.com)
> Microsoft 365
> Connected

not:

> Vaishnav's user account

unless that is explicitly the mailbox's label.

---

## Credential values must never render

Use states such as:

> Connected
> Needs reauthorization

not:

> Refresh token: eyJ...

---

## Connection health and sending capacity need separate indicators

Example:

```text
Connection: Healthy
Daily capacity: Near limit
```

A single green/red badge would lose critical meaning.

---

## Campaign usage should remain contextual

If frozen design shows which Campaigns use an account, those are references.

Do not make Campaign status part of the SendingAccount state.

---

## Tablet

Following Design 152:

* account rows can become cards,
* mailbox/provider remain primary,
* health/limit states remain separate,
* reconnect/disable actions stay explicit.

---

## Mobile

Priority:

```text
Sending Account
↓
Mailbox identity
↓
Provider
↓
Connection state
↓
Health
↓
Sending capacity
↓
Allowed action
```

No wide technical provider table compressed onto mobile.

---

## Mobile credential management

Actions such as reconnect/reauthorize should remain deliberate.

Never expose secret values because there is less screen space.

---

## Accessibility

An account card could communicate:

> Sales mailbox, [sales@perspective.com](mailto:sales@perspective.com). Microsoft 365. Connected. Connection healthy. Sending capacity near daily limit. Available for Campaign use.

where canonical authorized data supports it.

---

# 7. Backend Requirements

## Canonical SendingAccount architecture

```text
Design 092
    ↓
Authenticated Workspace Context
    ↓
SendingAccountQueryService
    │
    ├── SendingAccount
    ├── MailboxIdentity safe projection
    ├── ProviderConnection safe projection
    ├── Credential state metadata
    ├── ConnectionHealth
    ├── SendingPolicy
    └── utilization/capacity projection
    ↓
SendingAccountView[]
```

---

## Connection write architecture

```text
SendingAccountService
        │
        ├── createSendingAccount()
        ├── enableSendingAccount()
        ├── disableSendingAccount()
        └── archiveSendingAccount()

ProviderConnectionService
        │
        ├── beginConnection()
        ├── completeConnection()
        ├── reconnect()
        └── revokeConnection()
```

Credential material remains inside the secret-management boundary.

---

## No generic credentials CRUD

Prohibit ordinary API patterns such as:

```text
GET /credentials/:id
```

returning secrets.

Credential operations should be purpose-specific:

```text
rotate
reconnect
revoke
```

---

## Secret storage

Use:

* encrypted secret storage,
* KMS/vault-backed references,
* strict service access,
* no plaintext logs.

---

## Token encryption

OAuth refresh/access tokens must be encrypted at rest and protected in memory/logging boundaries according to implementation platform.

---

## Secret redaction

Never expose secrets in:

* Audit events,
* error stacks,
* provider request logs,
* analytics,
* frontend DTOs,
* search index,
* Activity feed.

---

## Connection setup transaction

A connection workflow should:

1. authorize actor;
2. create purpose-bound connection intent;
3. bind tenant + SendingAccount;
4. execute provider auth;
5. verify callback/state;
6. discover/confirm mailbox identity;
7. store secret material securely;
8. persist ProviderConnection;
9. evaluate initial ConnectionHealth;
10. emit Audit/event.

---

## Mailbox identity confirmation

Where provider provides stable account identity:

record it.

If reconnection authenticates a different mailbox unexpectedly:

do not silently replace the old MailboxIdentity.

Require governed resolution.

---

## Provider abstraction

Use typed provider adapters, conceptually:

```text
SendingProviderAdapter
├── connect
├── refresh
├── validateConnection
├── sendMessage
├── reconcileMessage
├── verifyWebhook
├── normalizeProviderEvent
└── readProviderLimits where supported
```

No provider-specific duplicate Campaign/Message business model.

---

## Canonical Message input

Provider adapter receives something like:

```text
SendRequest
├── messageId
├── exact recipient
├── exact sender identity
├── exact generated content
├── transport idempotency key
└── allowed provider metadata
```

It does not fetch mutable Template content and generate a different Message.

---

## Centralized send command

All outbound Campaign delivery should pass conceptually through:

```text
OutreachDeliveryService.send(messageId)
```

which:

1. reloads canonical Message;
2. validates execution state;
3. resolves SendingAccount;
4. authorizes/system-validates account use;
5. checks health/policy;
6. reserves sending capacity;
7. creates/reuses DeliveryAttempt;
8. sends through provider adapter;
9. records provider identifiers/outcome;
10. emits normalized events.

---

## Sending-policy enforcement before transport

Critical.

Every send path must pass through:

```text
SendingLimitCoordinator
```

or equivalent.

No special/manual endpoint may directly invoke provider adapter.

---

## Rate limits need atomic enforcement

Concurrent workers must not each believe capacity is available and exceed:

* per-account,
* workspace,
* provider,

limits.

Use appropriate:

* atomic counters,
* reservation/lease semantics,
* Redis/database coordination,
* provider reconciliation,

depending on architecture.

---

## Rate-limit window semantics

Define centrally:

* window type,
* timezone/provider window,
* resets,
* burst/concurrency semantics.

Do not calculate them separately in UI.

---

## Provider `429` ≠ generic failure

Normalize as:

> rate-limited

with retry-after/backoff semantics.

---

## Manual retry obeys rate limits

Absolute.

---

## Scheduler obeys rate limits

Absolute.

---

## Campaign Resume obeys rate limits

Absolute.

---

## DeliveryAttempt creation

Create attempt identity before or atomically with provider send intent.

This supports uncertain-result reconciliation.

---

## Idempotency key

Each transport attempt/intended provider send should use stable provider-supported idempotency where available.

Conceptually derive from:

```text
messageId
+
send occurrence / attempt intent
```

according to provider semantics.

---

## Worker retry ≠ new transport intent

At-least-once queue redelivery must reuse the same attempt/idempotency context when the prior attempt may still be in flight.

---

## Unknown send outcome

Example:

```text
provider request submitted
network connection breaks before response
```

Do not immediately issue another send.

State becomes:

```text
OUTCOME_UNKNOWN
```

then:

```text
reconcileMessage()
```

using:

* provider message identifier where known,
* idempotency key,
* provider API/search support,

before deciding retry.

---

## Provider reconciliation

Needed to prevent:

> timeout → duplicate email.

---

## New DeliveryAttempt after confirmed failure

Only after confirming the previous attempt did not succeed or safe retry semantics allow it.

---

## Provider message IDs

Store provider IDs in provider-scoped namespaces.

Do not assume IDs are globally unique.

Conceptually:

```text
providerType
providerAccountId
providerMessageId
```

---

## ProviderEvent ingestion

Conceptually:

```text
ProviderWebhook
      ↓
verify
      ↓
deduplicate
      ↓
persist event evidence
      ↓
normalize
      ↓
resolve SendingAccount/Message/Attempt
      ↓
delivery-state projector
```

---

## Webhook verification

Critical.

Validate provider-specific:

* signature,
* timestamp,
* secret,
* replay window,

where available.

---

## Invalid callback

Must never update delivery state.

---

## Unknown/unlinked callback

Store or quarantine safely for investigation/reconciliation if policy requires.

Do not attach to a random Message based on email alone.

---

## Replay protection

Repeated valid provider event should be idempotent.

---

## Event normalization

Provider-specific event names map to canonical semantics.

Example:

```text
provider A: "delivered"
provider B: "success"
```

may both normalize to the platform's canonical delivery event.

---

## Provider raw event ≠ canonical enum

Keep adapter-specific interpretation at integration boundary.

---

## Out-of-order callback resolver

Canonical state should derive from allowed transitions/event chronology.

Do not permit:

```text
DELIVERED
→ ACCEPTED
```

just because an older Accepted callback arrived later.

---

## Conflicting provider evidence

If provider reports contradictory states:

preserve events and surface:

```text
UNKNOWN / RECONCILIATION REQUIRED
```

according to canonical policy.

Do not silently discard inconvenient evidence.

---

## Credential refresh

OAuth access-token refresh should occur inside the provider connection layer.

Campaign/Message code should not know token details.

---

## Refresh failure

Can move:

```text
credential state
connection state
health
```

without changing Campaign/Message history.

---

## Credential rotation/reconnection

Historical:

```text
Message M1
DeliveryAttempt A1
SendingAccount SA1
MailboxIdentity MI1
```

remains intact.

No attempt should be rewritten to say it used the new credential.

---

## ConnectionHealth service

Should derive current health from signals such as:

* auth validity,
* last successful provider call,
* recent provider failures,
* provider availability,
* rate-limit condition.

---

## Health should be a projection

If lost:

recompute.

Do not store it as only evidence of connection state.

---

## Health probe ≠ send

Connection testing should not accidentally create an outbound business Message unless explicitly designed as a test send.

---

## SendingPolicy

Should be centrally queryable and revision-aware.

Campaign execution can ask:

```text
canSend(
  sendingAccountId,
  campaignId,
  messageId,
  currentTime
)
```

returning:

* allowed,
* defer until,
* blocked reason,
* unknown.

---

## Unknown policy state ≠ allowed

Fail safe according to policy.

---

## Provider limits vs configured limits

Effective capacity resolver should combine both rather than overwriting configured policy when provider reports a temporary restriction.

---

## Utilization counters

Counters must be recoverable/reconcilable with canonical DeliveryAttempts where feasible.

A Redis loss must not permanently reset historical sent counts and permit unlimited duplicate sending.

---

## Capacity reservation

At high concurrency, reserve capacity before provider send.

On definite failed-before-send conditions, release appropriately.

On unknown outcome, retain/reconcile conservatively.

---

## Campaign selection

Campaign execution references SendingAccount or selection policy.

If a selected account becomes unavailable:

do not silently switch sender identities unless a governed sender-selection/fallback policy explicitly permits it.

This prevents unexpected sender changes.

---

## Sender fallback ≠ automatic arbitrary failover

Critical.

A recipient should not receive from a completely different mailbox simply because the original account failed unless Campaign policy explicitly allowed it.

---

## Provider-specific Message backend prohibited

Do not create:

```text
GmailOutboundMessage
MicrosoftOutboundMessage
SMTPOutboundMessage
```

as business sources of truth.

Use adapters around canonical Message/DeliveryAttempt.

---

## Provider-specific Campaign backend prohibited

Same.

---

## Reply routing

Incoming provider replies/events should ultimately feed canonical Conversation/Message infrastructure.

Design 092 handles provider transport linkage, not reply-triage workflow.

---

## Design 093 reuse

Design 093 should consume canonical:

```text
Conversation
Reply Message
Campaign/Enrollment linkage
```

rather than provider-specific inbox items.

---

## Events/outbox

Useful events include:

```text
SendingAccountCreated
SendingAccountConnected
SendingAccountDisconnected
SendingAccountReauthorized
SendingAccountDisabled

CredentialRotated
CredentialExpired

ConnectionHealthChanged
SendingLimitReached

DeliveryAttemptStarted
ProviderAcceptedMessage
DeliveryAttemptFailed
DeliveryOutcomeUnknown
DeliveryReconciled

ProviderEventReceived
ProviderEventNormalized
```

---

## Audit

Material user/security actions should be audited:

* connect account,
* reconnect,
* rotate/revoke connection,
* enable/disable,
* policy changes.

Do not place:

* raw tokens,
* full auth headers,
* provider webhook payload secrets

inside Audit.

---

## Operational telemetry

Track:

* provider latency,
* auth-refresh failures,
* send throughput,
* rate-limit incidence,
* unknown-outcome count,
* reconciliation latency,
* webhook verification failures,
* connection-health freshness.

This is observability, not business truth.

---

## Search

Design 079 may index safe SendingAccount metadata if frozen product needs discoverability.

Never index:

* tokens,
* provider secrets,
* raw webhook payloads.

---

## Caching

Connection/health/policy read models should be:

* tenant scoped,
* authorization aware,
* freshness aware.

Secrets should not pass through ordinary application caches.

---

## Partial failure contract

Example:

```text
SendingAccount core     ✓
MailboxIdentity         ✓
Connection metadata     ✓
Health service          ✕
Usage/limit counters    ✕
```

Return:

```text
Account available
Health unknown
Usage unavailable
```

Not:

```text
Account disconnected
0 sends used
```

---

## Backend Requirement Matrix

| Requirement                                               | Status                    |
| --------------------------------------------------------- | ------------------------- |
| Authenticated Team Workspace                              | **Critical**              |
| Canonical SendingAccount identity                         | **Critical**              |
| SendingAccount/Campaign separation                        | **Critical**              |
| SendingAccount/User separation                            | **Critical**              |
| SendingAccount/Contact separation                         | **Critical**              |
| SendingAccount/ProviderConnection separation              | **Critical**              |
| ProviderConnection/Credential separation                  | **Critical**              |
| ProviderConnection/MailboxIdentity separation             | **Critical**              |
| MailboxIdentity/User separation                           | **Critical**              |
| MailboxIdentity/AuthIdentity separation                   | **Critical**              |
| Stable account identity across reconnect                  | **Critical**              |
| Credential rotation/history separation                    | **Critical**              |
| Protected secret references                               | **Critical**              |
| Encryption at rest                                        | **Critical**              |
| Secret/log/Audit redaction                                | **Critical**              |
| Purpose-bound connection flow                             | **Critical**              |
| Provider callback/state validation                        | **Critical**              |
| Mailbox identity confirmation                             | **Critical**              |
| Typed Provider Adapter Registry                           | **Critical**              |
| No provider-specific Campaign backend                     | **Critical**              |
| No provider-specific Message backend                      | **Critical**              |
| Canonical Message transport input                         | **Critical**              |
| Message/DeliveryAttempt separation                        | **Critical**              |
| One Message → many attempts                               | **Critical**              |
| Retry/new Message separation                              | **Critical**              |
| DeliveryAttempt idempotency                               | **Critical**              |
| Queue redelivery replay safety                            | **Critical**              |
| Unknown-outcome reconciliation                            | **Critical**              |
| Duplicate-send prevention                                 | **Critical**              |
| Provider scoped Message IDs                               | **Critical**              |
| Provider acceptance/delivery separation                   | **Critical**              |
| Delivery/reply separation                                 | **Critical**              |
| ProviderEvent/DeliveryAttempt separation                  | **Critical**              |
| Verified provider callbacks                               | **Critical**              |
| Webhook deduplication                                     | **Critical**              |
| Replay protection                                         | **Critical**              |
| Out-of-order event handling                               | **Critical**              |
| Event normalization                                       | **Critical**              |
| ConnectionHealth as projection                            | **Critical**              |
| Health freshness                                          | **Critical**              |
| Health/Campaign lifecycle separation                      | **Critical**              |
| SendingPolicy first-class                                 | **Critical**              |
| SendingPolicy/current usage separation                    | **Critical**              |
| Centralized limit enforcement                             | **Critical**              |
| Atomic rate-limit coordination                            | **Critical**              |
| Manual actions cannot bypass limits                       | **Critical**              |
| Provider 429 normalized separately                        | **Critical**              |
| Capacity reservation/reconciliation                       | **Critical at scale**     |
| Sender fallback governed explicitly                       | **Critical**              |
| No arbitrary sender switching                             | **Critical**              |
| Historical Message evidence survives reconnect            | **Critical**              |
| Historical Delivery evidence survives credential rotation | **Critical**              |
| Design 090 Campaign reuse                                 | **Critical**              |
| Design 091 render/content reuse                           | **Critical**              |
| Design 014 Conversation reuse                             | **Critical**              |
| Design 093 reply-review reuse                             | **Critical architecture** |
| Tenant isolation                                          | **Critical**              |
| Audit integration                                         | **Required**              |
| Operational telemetry                                     | **Required**              |
| Partial subsystem failure handling                        | **Critical**              |

---

# 8. Consolidation

Design 092 exposes some of the highest-risk security and duplicate-send problems in the Outreach architecture.

**SendingAccount / Campaign conflation**
Campaign stores provider connectivity and credentials.

**SendingAccount / User conflation**
Mailbox identity becomes application account identity.

**SendingAccount / Contact conflation**
CRM person's email is treated as transport infrastructure.

**MailboxIdentity / User conflation**
Mailbox control is inferred from matching login email.

**MailboxIdentity / AuthenticationIdentity conflation**
CRM/outbound mailbox changes mutate login credentials.

**MailboxIdentity / ProviderConnection conflation**
Reauthorization creates a new sender identity unnecessarily.

**ProviderConnection / Credential conflation**
Tokens become ordinary integration fields.

**Credential / SendingAccount conflation**
Token rotation creates another account.

**Credential expiry / account deletion conflation**
Historical sender resource disappears.

**Credential rotation / historical send rewrite conflation**
Old attempts appear to use new secrets.

**Connection lifecycle / Credential lifecycle conflation**
Valid connection metadata is lost because one token expires.

**ConnectionHealth / ProviderConnection conflation**
Temporary provider outage is stored as permanent disconnection.

**ConnectionHealth / Campaign state conflation**
Campaign becomes Failed because account is degraded.

**Healthy / unlimited capacity conflation**
Provider limit is ignored.

**Rate limited / disconnected conflation**
Temporary capacity condition triggers reauthorization incorrectly.

**SendingPolicy / current usage conflation**
Daily limit and sent count overwrite each other.

**SendingPolicy / Campaign metric conflation**
Campaign's “sent” count is used as infrastructure capacity counter.

**Manual send / rate-policy bypass**
Operator action exceeds provider/workspace limits.

**Campaign resume / rate-policy bypass**
Paused Campaign floods provider immediately.

**Multiple worker limit race**
Concurrent workers all see available quota and exceed it.

**Redis/counter loss / unlimited sending conflation**
Infrastructure reset bypasses policy.

**Campaign / ProviderConnection ownership conflation**
Deleting Campaign removes reusable mailbox connection.

**Sequence / sender connection conflation**
Reusable workflow becomes bound to credentials.

**Template / provider formatting conflation**
Transport adapter changes personalized content.

**Message / provider Message conflation**
Each provider creates its own canonical Message model.

**Message / DeliveryAttempt conflation**
Transport retries duplicate communication identity.

**Delivery retry / new Message conflation**
Timeout creates duplicate outbound emails.

**Worker retry / new attempt intent conflation**
Queue redelivery sends twice.

**Network timeout / failed send conflation**
Unknown outcome is retried blindly.

**Provider accepted / delivered conflation**
API acknowledgment overstates delivery.

**Deferred / failed conflation**
Temporary transport condition becomes permanent failure.

**Delivered / replied conflation**
Transport success becomes engagement.

**DeliveryAttempt / ProviderEvent conflation**
Every callback becomes another send attempt.

**Repeated webhook / repeated delivery conflation**
Provider retries callback and platform counts twice.

**Webhook arrival order / delivery chronology conflation**
Late Accepted callback regresses Delivered state.

**Raw provider event / canonical delivery enum conflation**
Provider-specific semantics leak across system.

**ProviderEvent / Campaign state conflation**
One bounce marks Campaign failed.

**Invalid webhook / valid event conflation**
Unverified external request mutates Message state.

**Webhook endpoint / Team authorization conflation**
External provider cannot authenticate correctly.

**Unknown provider event / random Message association**
Email-string matching corrupts delivery history.

**Provider message ID / globally unique ID conflation**
Different providers/accounts collide.

**Mailbox email / provider account identity conflation**
Reconnected different mailbox silently replaces sender.

**Mailbox identity change / harmless metadata edit conflation**
Campaign sends from unexpected account.

**Automatic sender failover / harmless retry conflation**
Recipient unexpectedly receives from another identity.

**Disabled SendingAccount / revoked credential conflation**
Administrative pause destroys provider connection.

**Archived account / historical Messages deletion conflation**
Communication lineage disappears.

**Connection test / business send conflation**
Health probe creates a real customer Message.

**Health stale / healthy conflation**
Old green status permits unsafe Campaign launch.

**Health unknown / failed conflation**
Temporary health-service outage disables account incorrectly.

**Usage unavailable / zero usage conflation**
Limit counters reset to zero and permit oversending.

**SendingAccount read / credential read conflation**
Sales user receives provider secrets.

**Connection admin / secret reveal conflation**
Admin UI exposes raw refresh tokens.

**Campaign user / connection admin conflation**
Sales rep can revoke organizational mailbox.

**Sending-policy admin / Campaign admin conflation**
Marketing role changes infrastructure rate policy.

**Cross-tenant SendingAccount reference**
Campaign sends from another customer's mailbox.

**Cross-tenant OAuth callback binding**
Provider account is attached to wrong workspace.

**OAuth state mismatch**
Attacker substitutes connection callback.

**Credential leakage through Audit**
Secret appears in immutable logs.

**Credential leakage through errors**
Provider request headers expose tokens.

**Credential leakage through Search**
Integration tokens become indexable.

**Provider-specific Campaign backend**
Gmail/Microsoft Campaign execution diverges.

**Provider-specific Message backend**
Inbox cannot reconcile one canonical communication history.

**Provider callback / reply workflow conflation**
Delivery infrastructure begins owning reply triage.

**092/090 duplicate delivery engine**
Campaign 360 and Sending Accounts execute sends differently.

**092/091 duplicate content rendering**
Provider adapter re-personalizes Template.

**092/014 duplicate messaging backend**
Provider records become canonical Messages.

**092/093 duplicate reply backend**
Connection layer starts managing response review.

No additional screen is required.

These are **sending identity, provider integration, secret isolation, mailbox identity, rate policy, delivery attempts, webhook integrity, duplicate-send prevention, health, historical evidence and multi-provider abstraction requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL SENDING ACCOUNT, PROVIDER CONNECTION, DELIVERY GOVERNANCE & SECRET-ISOLATION ANCHOR**

**Domain directive:**
**SendingAccount ≠ ProviderConnection ≠ Credential/Token ≠ MailboxIdentity ≠ Campaign ≠ Enrollment ≠ Message ≠ DeliveryAttempt ≠ ProviderEvent ≠ ConnectionHealth ≠ SendingPolicy/Limit.**

**SendingAccount directive:**
`SendingAccount` is the stable tenant-scoped reusable outbound-sending identity. It persists across routine credential refresh/rotation and reconnection when the same mailbox identity remains valid.

**Mailbox directive:**
`MailboxIdentity` represents the external sender/mailbox identity and remains separate from Team User, CRM Contact and AuthenticationIdentity. Matching email strings never make those records equivalent.

**Provider-connection directive:**
`ProviderConnection` describes how the system integrates with an external provider and remains distinct from both MailboxIdentity and secret material.

**Credential directive:**
OAuth tokens, SMTP passwords and comparable secrets live behind protected secret references/vault/KMS abstractions. Raw credentials must never enter ordinary frontend DTOs, Search, Activity, Analytics or Audit.

**Rotation directive:**
credential refresh, rotation, expiration, revocation or reconnection never rewrites historical Messages, DeliveryAttempts, sender identity evidence or Campaign lineage.

**Campaign directive:**
Designs 012/090 remain authoritative for Campaign execution. Campaigns reference a SendingAccount or governed selection policy and never own provider credentials.

**Sequence directive:**
Design 013 remains independent of provider infrastructure. Sequence steps define intended communication behavior, not connectivity or authentication.

**Template directive:**
Design 091 remains authoritative for generated Message content. Provider adapters transport exact canonical content and never implement a second personalization/template engine.

**Message directive:**
Design 014 remains the canonical Message identity. Provider-specific Gmail/Microsoft/SMTP records are transport metadata/evidence rather than independent business Messages.

**Attempt directive:**
one Message can have multiple DeliveryAttempts, but worker retries or transport retries must preserve the same Message identity and must not duplicate user-facing communication.

**Retry directive:**
a transport retry creates/continues governed attempt lineage only after prior outcome is known or safely reconciled. A deliberate new communication creates a new Message rather than masquerading as a retry.

**Idempotency directive:**
scheduler redelivery, worker retries, provider send requests and provider callbacks must be idempotent/replay-safe using stable Message/attempt/provider identifiers.

**Unknown-outcome directive:**
network timeout or missing provider response becomes `Outcome Unknown`, not automatically `Failed`. Provider state must be reconciled before a resend is attempted when duplicate delivery is possible.

**Provider-state directive:**
provider accepted, deferred, delivered, bounced, rejected, failed and unknown remain separate. Provider acceptance never implies confirmed delivery.

**Event directive:**
`ProviderEvent` is append-oriented external evidence. Provider-specific events are verified, deduplicated, normalized and linked to canonical Message/DeliveryAttempt records without becoming those entities themselves.

**Webhook directive:**
callbacks require provider-specific signature/authentication verification, replay protection and tenant/account binding. Invalid or unlinked events must never mutate canonical delivery state.

**Ordering directive:**
out-of-order callbacks are resolved by canonical event semantics/occurrence time rather than last-write-wins arrival order.

**Connection-health directive:**
`ConnectionHealth` is a freshness-aware operational projection and remains independent from SendingAccount lifecycle, Credential state, provider connectivity, Campaign lifecycle and sending capacity.

**Limit directive:**
`SendingPolicy/Limit` is separately modeled from current usage and Campaign metrics. Effective send capability must honor workspace, account, provider and Campaign policies according to one centralized resolver.

**Central-enforcement directive:**
every outbound Message path—automatic scheduler, Campaign resume, manual retry or other execution—must pass through the same SendingLimitCoordinator/DeliveryService. No action may bypass limits by calling a provider adapter directly.

**Concurrency directive:**
rate/capacity checks require atomic coordination/reservation so multiple workers cannot oversubscribe the same account concurrently.

**Provider-rate directive:**
provider `429`/rate-limit responses remain a distinct operational condition with explicit backoff/retry-after handling rather than generic account disconnection.

**Fallback directive:**
provider/SendingAccount failure must not silently substitute another sender identity unless a previously governed Campaign sender-selection/fallback policy explicitly permits it.

**Historical-evidence directive:**
archiving/disabling/reconnecting SendingAccounts never deletes or rewrites historical Message, DeliveryAttempt, ProviderEvent, Conversation or Campaign evidence.

**Authorization directive:**
SendingAccount read, use, enable/disable, connection management, credential rotation/revocation, policy administration and diagnostics remain separately enforced. Credential management does not imply raw-secret reveal.

**OAuth/security directive:**
connection flows must be purpose-bound to the authenticated actor, tenant and intended SendingAccount, with secure callback state and provider-identity verification to prevent connection substitution.

**Tenant directive:**
SendingAccounts, provider connections, mailbox identities, limits and provider callbacks remain tenant-bound. Cross-tenant sender selection or callback attachment is prohibited.

**Reply directive:**
incoming replies continue into Design 014's Conversation/Message infrastructure. Design 092 provides provider linkage only; Design 093 later owns reply review/triage.

**Observability directive:**
provider latency, refresh errors, rate-limit pressure, send throughput, webhook verification failures, unknown outcomes and reconciliation latency are monitored independently from canonical Campaign/Message state and without leaking secrets.

**Partial-failure directive:**
SendingAccount core, MailboxIdentity, connection metadata, Health, usage counters and provider diagnostics may fail independently. `Unknown`/`Unavailable` must never silently become `Disconnected`, `Healthy`, or `0 used`.

**Performance directive:**
use indexed account/connection metadata, freshness-aware health/capacity projections and centralized provider adapters while keeping secrets outside ordinary caches and list queries.

**Audit directive:**
connection, reconnect, revoke, disable/enable, credential-rotation and sending-policy changes generate safe Audit evidence without tokens, auth headers or sensitive provider payloads.

**Future-reuse directive:**
Design 093 must consume the exact Conversation/Reply linkage produced by this Campaign/Message/provider pipeline and must not introduce provider-specific inbox/reply records as canonical truth.

**Overlap directive:**
Designs **012–014 and 090–093** must share one continuous **Campaign → Enrollment → Message → SendingAccount → DeliveryAttempt → ProviderEvent → Conversation/Reply** lineage while keeping provider secrets, MailboxIdentity, ConnectionHealth and SendingPolicy as distinct concerns.

**Consolidation directive:**
**STANDARDIZE ONE OUTBOUND DELIVERY INFRASTRUCTURE — STABLE SENDINGACCOUNT + DISTINCT MAILBOXIDENTITY + TYPED PROVIDERCONNECTION + VAULTED CREDENTIAL REFERENCES + FRESH CONNECTIONHEALTH + CENTRALIZED SENDINGPOLICY/LIMIT ENFORCEMENT + CANONICAL MESSAGE REFERENCES + IDEMPOTENT DELIVERYATTEMPTS + VERIFIED/REPLAY-SAFE NORMALIZED PROVIDEREVENTS + UNKNOWN-OUTCOME RECONCILIATION — AND NEVER ALLOW CAMPAIGNS, USERS, EMAIL STRINGS, PROVIDER TOKENS, WEBHOOK CALLBACKS, RATE COUNTERS OR TRANSPORT RETRIES TO BECOME MESSAGE/CAMPAIGN IDENTITY, BYPASS SECURITY, OR CREATE DUPLICATE SENDS.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **92 / 153** |
| **PASS**                                   |                         **92** |
| **STANDARDIZE decisions**                  |                         **90** |
| **Potential implementation-overlap flags** |                         **83** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**92 / 153 = 60.1% audited.**

### Canonical outbound-delivery architecture after Design 092

```text
                         SENDING ACCOUNT
                         stable identity
                               │
                ┌──────────────┼──────────────┐
                ↓              ↓              ↓
        MailboxIdentity   ProviderConnection  SendingPolicy
                               │                   │
                               ↓                   ↓
                       CredentialReference      Limits
                               │
                               ↓
                         Vault / Secrets

Campaign
   ↓
Enrollment
   ↓
Message
   ↓
SendingAccount
   ↓
DeliveryAttempt
   ↓
Provider
   ↓
ProviderEvent
   ↓
Canonical Delivery State
```

The identity/security boundary is now explicit:

```text
Mailbox email
     ≠
Platform User
     ≠
AuthenticationIdentity
     ≠
CRM Contact

and

ProviderConnection
     ≠
Credential
```

Credential rotation behaves like:

```text
SendingAccount SA-10
Mailbox sales@company.com
Credential v1
      ↓ expires
Reconnect / rotate
      ↓
Credential v2

SA-10 remains SA-10.

Historical Messages and DeliveryAttempts remain unchanged.
```

The retry boundary is also strict:

```text
Message M-100
   ↓
DeliveryAttempt A1
   ↓
network timeout
   ↓
OUTCOME UNKNOWN
   ↓
RECONCILE PROVIDER STATE

Only after safe reconciliation:

confirmed not sent
   ↓
new DeliveryAttempt if allowed

NOT:
timeout → immediately send duplicate Message
```

And every send path remains governed:

```text
Campaign scheduler
Manual retry
Campaign resume
Other approved send path
        │
        └─────────────┐
                      ↓
             SendingPolicy /
             Limit Coordinator
                      ↓
                DeliveryService
                      ↓
               Provider Adapter
```

There is **no bypass path** directly from Campaign UI to provider transport.

# Next Sequential Audit Target

## **Design 093 — Reply Queue / Outreach Response Review**

The next audit should preserve the response-review boundary:

> **Conversation ≠ Message/Reply ≠ OutreachEnrollment ≠ Lead ≠ ReplyClassification ≠ ReviewDecision ≠ Assignment ≠ FollowUp/Task ≠ Campaign ≠ Notification.**

It should reconcile Designs **014, 090 and 092** while preserving:

* inbound provider reply becomes canonical Message within Conversation rather than a provider-specific reply entity,
* Conversation/Reply identity remains separate from Campaign/Enrollment state,
* one reply can be associated with Campaign/Enrollment lineage without becoming that Enrollment,
* reply classification ≠ Lead lifecycle/status,
* automated classification ≠ human review decision,
* assigning a reply for review ≠ assigning the Lead,
* marking review complete ≠ marking Conversation read or Lead converted,
* creating FollowUp/Task from a reply must create canonical work entities rather than embedding “next action” into reply state,
* negative/positive response handling must go through explicit governed Lead/Enrollment commands,
* provider callback retry must not duplicate inbound Messages,
* partial failure in Lead, Campaign, classification or work services must not make the canonical reply disappear.

The sequence continues strictly with **Design 093 only next**, under the unchanged audit contract.
