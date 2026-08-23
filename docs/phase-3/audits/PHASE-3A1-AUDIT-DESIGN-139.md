# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 139 — Integration Center / Connected Services

Design 139 should become the **canonical Team Workspace integration catalog, connected-service discovery, tenant-scoped connection management, capability visibility, authorization-state summary, connection-health summary, and integration lifecycle surface** for the entire platform.

It must **not become a second copy of every provider-specific integration domain**. Email sending accounts, Publishing targets, Distribution channels, file storage, analytics providers, payment providers, calendar providers, and future external systems should continue to preserve their own domain identities while referencing one standardized platform connection layer.

Design 139 should therefore answer:

> **“Which external services can this Organization connect to, which exact external accounts/properties are currently connected, what capabilities does each connection support and have permission to use, whether its authorization remains valid, whether the connection is operationally healthy, which product modules depend on it, and what safe connection-management action is currently allowed?”**

Design 139 must remain distinct from **Design 140 — Integration Detail / Connection Health**, which will investigate one exact connection in depth.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **IntegrationProviderDefinition ≠ IntegrationConnection ≠ ExternalAccountIdentity ≠ AuthorizationGrant ≠ CredentialSecret ≠ ConnectionCapability ≠ ConnectionConfiguration ≠ ConnectionHealthObservation ≠ CurrentConnectionHealth ≠ SyncRun/SyncState ≠ WebhookSubscription ≠ ProviderEvent ≠ DomainEntity ≠ SendingAccount ≠ DistributionChannel ≠ PublicationTarget.**

The central implementation rule is:

> **A provider being supported does not mean it is connected; a connection existing does not mean its credential is valid; a valid credential does not mean every provider capability is granted; a granted capability does not mean the connection is healthy; a healthy connection does not mean every downstream sync or execution succeeded. Secrets remain write-only and outside normal application payloads. Disconnecting or reconnecting an IntegrationConnection must never rewrite historical provider events, imported records, messages, publications, payments, placements, reports, or other canonical domain history.**

---

# 1. Classification

| Audit field                               | Classification                                                                                                                                                              |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                             | **139**                                                                                                                                                                     |
| **Canonical name**                        | **Integration Center / Connected Services**                                                                                                                                 |
| **Product area**                          | Team Workspace / Platform / Integrations                                                                                                                                    |
| **User surface**                          | **Authenticated Team Workspace**                                                                                                                                            |
| **Screen class**                          | Integration Catalog / Connected Services Collection / Administration Workspace                                                                                              |
| **Classification**                        | **Canonical Integration Catalog, Connection Lifecycle, Capability & Health-Summary Anchor**                                                                                 |
| **Primary purpose**                       | Discover supported external providers, inspect connected accounts/services, understand capability/auth/health state, and initiate governed connection-management operations |
| **Primary catalog identity**              | `IntegrationProviderDefinition` / connector definition                                                                                                                      |
| **Primary tenant connection identity**    | `IntegrationConnection`                                                                                                                                                     |
| **External identity**                     | `ExternalAccountIdentity`                                                                                                                                                   |
| **Authorization identity**                | `AuthorizationGrant` / provider authorization relation                                                                                                                      |
| **Credential identity**                   | safe metadata reference to vault-backed `ConnectionCredential`                                                                                                              |
| **Secret storage**                        | external secure vault/KMS/secret manager; never normal DB plaintext                                                                                                         |
| **Capability model**                      | `ConnectionCapability` / capability grant projection                                                                                                                        |
| **Connection configuration**              | `IntegrationConnectionConfiguration`                                                                                                                                        |
| **Health evidence**                       | `ConnectionHealthObservation`                                                                                                                                               |
| **Current health**                        | derived `CurrentConnectionHealth`                                                                                                                                           |
| **Sync summary dependency**               | canonical domain-specific SyncRun/SyncState where applicable                                                                                                                |
| **Webhook dependency**                    | canonical `WebhookSubscription` / provider-event ingestion infrastructure where applicable                                                                                  |
| **Provider-event dependency**             | normalized immutable/replay-safe `ProviderEvent` evidence                                                                                                                   |
| **Email connection dependency**           | Design 092                                                                                                                                                                  |
| **Inbox dependency**                      | Designs 014 / 093                                                                                                                                                           |
| **Calendar dependency**                   | Designs 035 / 046 / 094                                                                                                                                                     |
| **Publishing dependency**                 | Designs 124–126                                                                                                                                                             |
| **Distribution dependency**               | Designs 127–129                                                                                                                                                             |
| **Scheduled delivery dependency**         | Design 134                                                                                                                                                                  |
| **Audit dependency**                      | Designs 039 / 138                                                                                                                                                           |
| **Authorization dependency**              | Design 037                                                                                                                                                                  |
| **Organization Settings dependency**      | Design 040                                                                                                                                                                  |
| **Platform Settings boundary**            | Design 149                                                                                                                                                                  |
| **Detailed connection/health dependency** | Design 140                                                                                                                                                                  |
| **Automation dependency**                 | Designs 141–142 may consume connection capabilities/health                                                                                                                  |
| **Operational attention dependency**      | Design 136                                                                                                                                                                  |
| **Catalog projection**                    | `IntegrationCatalogEntry`                                                                                                                                                   |
| **Connection list projection**            | `ConnectedServiceSummary`                                                                                                                                                   |
| **Primary query service**                 | `IntegrationCenterQueryService`                                                                                                                                             |
| **Connector registry**                    | `IntegrationConnectorRegistry`                                                                                                                                              |
| **Connection service**                    | `IntegrationConnectionService`                                                                                                                                              |
| **Authorization service**                 | `IntegrationAuthorizationService`                                                                                                                                           |
| **Credential service**                    | `IntegrationCredentialService`                                                                                                                                              |
| **Capability resolver**                   | `IntegrationCapabilityResolver`                                                                                                                                             |
| **Health summary service**                | `IntegrationHealthQueryService`                                                                                                                                             |
| **Parent shell**                          | `InternalAppShell` — Design 001                                                                                                                                             |
| **Auth**                                  | Required                                                                                                                                                                    |
| **Authorization**                         | Active OrganizationMembership + Integration-specific read/connect/configuration permissions                                                                                 |
| **Implementation priority**               | **Critical Integration Security / Credential Isolation / Cross-Domain Reliability**                                                                                         |
| **Reuse level**                           | **Platform-wide across Email, Calendar, Publishing, Distribution, Reporting, Payments, Storage, Analytics and future connectors**                                           |

Canonical high-level architecture:

```text
IntegrationConnectorRegistry
          │
          ├── Google
          ├── Microsoft
          ├── LinkedIn
          ├── Stripe
          ├── Publishing provider
          └── Other supported providers
                    │
                    ↓
           IntegrationConnection
                    │
         ┌──────────┼───────────┐
         ↓          ↓           ↓
 ExternalAccount  Auth Grant  Configuration
         │          │           │
         └──────────┼───────────┘
                    ↓
             Capabilities
                    │
                    ↓
           Connection Health
                    │
       ┌────────────┼────────────┐
       ↓            ↓            ↓
     Email      Publishing   Distribution
       │            │            │
       └────────────┼────────────┘
                    ↓
          Canonical domain records
```

---

# 2. Reuse

## One platform Integration foundation

Design 139 should establish the standardized **platform-level connection layer** reused by specialized domains.

Do not create unrelated connection models such as:

```text
EmailOAuthConnection
PublishingOAuthConnection
DistributionOAuthConnection
CalendarOAuthConnection
ReportingOAuthConnection
```

all independently storing:

* provider;
* tokens;
* expiry;
* external account IDs;
* health;
* refresh state.

That would create security and lifecycle duplication.

Instead:

```text
IntegrationConnection
        │
        ├── Email-domain reference
        ├── Calendar-domain reference
        ├── Publishing-domain reference
        ├── Distribution-domain reference
        └── Reporting-domain reference
```

where provider/account semantics allow reuse.

---

## Design 092 SendingAccount ≠ IntegrationConnection

This distinction must remain.

### `IntegrationConnection`

Represents the authenticated/provider-level external connection.

### `SendingAccount`

Represents the mailbox/sending identity used by Outreach.

Example:

```text
Microsoft connection IC-20
        │
        ├── mailbox account A
        │       ↓
        │   SendingAccount SA-10
        │
        └── calendar capability
                ↓
            Meeting sync
```

Do not collapse:

```text
SendingAccount = OAuth tokens
```

or:

```text
IntegrationConnection = SendingAccount
```

---

## Provider connection naming should be consolidated

Design 092 already established a conceptual `ProviderConnection`.

Phase 3C/3D should standardize this with Design 139 so there is **one platform connection abstraction**, for example:

```text
IntegrationConnection
```

or a consistently named equivalent.

Do not maintain both:

```text
ProviderConnection
IntegrationConnection
```

as semantically identical competing entities.

The specialized `SendingAccount` remains independent.

---

## IntegrationProviderDefinition ≠ IntegrationConnection

Critical.

### Provider Definition

> The platform supports Microsoft 365.

### Integration Connection

> Organization X connected Microsoft tenant/account Y.

Correct:

```text
Microsoft 365
provider definition

        ↓

Org A Microsoft connection
Org B Microsoft connection
Org C Microsoft connection
```

---

## Provider Definition ≠ Provider account

Permanent.

---

## Provider Definition ≠ credential

Absolute.

---

## Connection ≠ ExternalAccountIdentity

A connection links the platform to an exact provider-side identity/property.

Example:

```text
IntegrationConnection IC-30
provider = LinkedIn

ExternalAccountIdentity:
Organization Page 12345
```

The external account identity can have:

* provider object ID;
* handle/name;
* tenant/account/property ID.

Do not use display name as identity.

---

## External account ID ≠ canonical internal entity ID

Absolute.

Provider IDs remain provider namespace identifiers.

---

## Connection ≠ AuthorizationGrant

Critical.

A connection can persist while authorization becomes:

* expired;
* revoked;
* reauthentication required.

Do not delete the IntegrationConnection merely because its current token expired.

---

## AuthorizationGrant ≠ CredentialSecret

Permanent.

The grant describes provider permission/authorization semantics.

The secret is technical credential material.

---

## Credential metadata ≠ secret

Correct:

```text
credential type = OAuth
expiresAt = ...
lastRotatedAt = ...
vaultReference = secret://...
```

Never return:

```text
accessToken
refreshToken
apiKey
clientSecret
```

to the Integration Center.

---

## Connector capability ≠ externally granted capability

Critical three-layer model:

```text
1. Connector supports capability
2. Provider authorization grants capability
3. Platform/domain enables capability
```

Example:

```text
Connector supports:
READ_EMAIL
SEND_EMAIL
READ_CALENDAR

Grant allows:
READ_EMAIL
SEND_EMAIL

Platform enabled:
SEND_EMAIL only
```

These are different facts.

---

## Connection capability ≠ domain permission

A provider grant:

> can publish to LinkedIn

does not mean the current Team user has permission to publish.

Provider capability and platform RBAC remain separate.

---

## Design 037 RBAC remains authoritative

Absolute.

---

## Connection lifecycle ≠ Connection health

Permanent.

A connection can be:

```text
lifecycle = CONNECTED
health = DEGRADED
```

or:

```text
lifecycle = CONNECTED
authorization = EXPIRED
health = UNAVAILABLE
```

One generic `status` cannot model this correctly.

---

## Connection health ≠ downstream execution success

Critical.

Example:

```text
LinkedIn connection healthy

Distribution execution failed
because payload was invalid.
```

Healthy connection ≠ successful campaign.

---

## Connection unhealthy ≠ every historical operation failed

Permanent.

Past Publications/Placements/messages may remain valid.

---

## Connection health ≠ Sync state

Example:

```text
Connection health = HEALTHY
Sync state = FAILED
```

because the provider is reachable but domain data processing failed.

---

## Sync state ≠ domain state

Permanent.

---

## Connection disabled ≠ provider account deleted

Absolute.

---

## Disconnect ≠ data deletion

One of Design 139's strongest rules.

Disconnecting Google/Microsoft/etc. must not delete:

* historical Messages;
* Meetings;
* provider events;
* Publications;
* Placements;
* Reports;
* payments;
* synced canonical records;
* Audit history.

---

## Reconnect ≠ new connection automatically

If the provider identity remains the same:

```text
same provider
same external account identity
```

reconnecting can preserve the existing `IntegrationConnection`.

---

## Reconnect to different external account ≠ silent same connection

Critical.

If user previously connected:

> LinkedIn Company A

and reconnects:

> LinkedIn Company B

do not silently reuse the same account identity.

Use:

* explicit relink semantics;
* or new IntegrationConnection,

according to provider/domain policy.

Historical operations must retain the original account lineage.

---

## Provider display name ≠ identity

Permanent.

Handles/pages can be renamed.

Use provider-side stable IDs where available.

---

## Integration Center ≠ Integration Detail

### Design 139

Collection/catalog level:

* available connectors;
* connected services;
* broad authorization/health summary;
* high-level capability state.

### Design 140

Exact connection investigation:

* account details;
* health history;
* authorization state;
* sync/webhook details;
* errors;
* reconnection/repair.

Do not overstuff Design 139.

---

# 3. Entities

## IntegrationProviderDefinition

Platform-wide connector/catalog definition.

Conceptually:

```text
IntegrationProviderDefinition
├── id / stable key
├── providerKey
├── providerName
├── connectorVersion
├── authMethods
├── supportedCapabilities[]
├── supportedScopes
├── webhookCapabilities
├── syncCapabilities
├── providerCategory
├── lifecycle
└── configurationSchemaVersion
```

This is platform metadata/configuration.

It is not tenant connection state.

---

## Provider definition lifecycle

Conceptually:

```text
AVAILABLE
DEPRECATED
DISABLED
UNSUPPORTED
```

Exact taxonomy Phase 3D.

A deprecated connector does not automatically invalidate historical connections.

---

## Connector version

Strongly recommended.

Provider APIs evolve.

A connection/run should be diagnosable against the connector implementation/config revision that handled it where material.

---

## IntegrationConnection

Canonical organization/provider connection identity.

Conceptually:

```text
IntegrationConnection
├── id
├── organizationId
├── providerDefinitionId
├── connectionScope
├── externalAccountIdentityId
├── lifecycle
├── authorizationGrantId?
├── configurationRevision
├── createdBy
├── createdAt
├── connectedAt?
├── disconnectedAt?
└── revision
```

---

## ConnectionScope

Must be explicit.

Potential concepts:

```text
ORGANIZATION
USER
MAILBOX
PROPERTY
ACCOUNT
WORKSPACE
```

depending on provider semantics.

Do not infer scope from provider name.

---

## Organization connection ≠ personal user connection

Critical.

Example:

```text
Google Workspace org connector
```

is different from:

```text
individual Gmail mailbox authorization
```

These may have different:

* ownership;
* expiry;
* permissions;
* deactivation behavior.

---

## ExternalAccountIdentity

Stable provider-side identity.

Conceptually:

```text
ExternalAccountIdentity
├── provider
├── externalAccountId
├── externalTenantId?
├── externalPropertyId?
├── displayNameSnapshot
├── canonicalProviderReference?
└── verifiedAt
```

---

## External display name changes

Do not create a new connection merely because provider-side name changed.

---

## AuthorizationGrant

Conceptually:

```text
AuthorizationGrant
├── id
├── integrationConnectionId
├── authMethod
├── grantedScopes
├── grantedAt
├── expiresAt?
├── revokedAt?
├── externalGrantId?
├── authorizationPrincipal
└── revision
```

---

## Authorization principal

Should record whose/provider principal authorized access where material.

But authorization principal ≠ current internal permission owner.

---

## Authorizing user deactivated

Important.

If an Organization connection relies on personal delegated authorization and the internal user is deactivated:

the platform needs explicit behavior.

It must not:

* impersonate that user indefinitely;
* or silently delete the IntegrationConnection.

Design 140/Phase 3D should resolve whether the connection:

* remains valid;
* requires ownership transfer;
* requires reauthorization.

---

## CredentialReference

The normal database should store safe reference/metadata, conceptually:

```text
ConnectionCredentialReference
├── integrationConnectionId
├── credentialType
├── vaultSecretReference
├── expiresAt?
├── lastRotatedAt?
├── status
└── revision
```

---

## Secret value

Lives outside normal application payloads.

Never expose it through standard queries.

---

## Write-only secret configuration

For API-key integrations, UI/server may accept a new secret.

After persistence:

the raw secret should not be retrievable through normal APIs.

---

## Authorization scope list

Provider OAuth scope strings can be retained as safe configuration metadata.

But scopes should be mapped to platform capabilities.

---

## ConnectionCapability

Conceptually:

```text
ConnectionCapability
├── capabilityKey
├── connectorSupported
├── externallyGranted
├── platformEnabled
├── health?
└── effectiveAvailability
```

This can be a projection rather than persistent entity.

---

## Effective capability

Derived:

```text
supported
AND authorized
AND enabled
AND connection usable
```

with domain-specific requirements.

---

## Capability ≠ provider scope

Permanent.

One capability can require multiple provider scopes.

One scope may support multiple capabilities.

---

## IntegrationConnectionConfiguration

Stores non-secret configuration.

Examples:

* selected property;
* default folder;
* sender policy;
* webhook mode;
* provider feature toggles.

All fields should be connector-schema validated.

---

## Configuration ≠ credential

Absolute.

---

## Configuration schema version

Strongly recommended.

Providers/connectors evolve.

---

## ConnectionHealthObservation

Prefer append-oriented health observations rather than one mutable boolean.

Conceptually:

```text
ConnectionHealthObservation
├── id
├── integrationConnectionId
├── healthClass
├── checkedAt
├── checkMethod
├── providerReachable?
├── authorizationUsable?
├── latency?
├── failureClass?
└── safeEvidence
```

---

## CurrentConnectionHealth

Derived projection over recent authoritative observations.

Do not permanently lose health history by overwriting:

```text
connection.isHealthy = true
```

---

## Health observation ≠ Application log

Permanent.

The health observation contains normalized operational evidence.

Detailed request traces belong observability.

---

## Sync state

If the Integration supports synchronization:

domain-specific sync execution should remain separate.

Possible generic summaries:

```text
lastSuccessfulSyncAt
lastSyncState
```

can be projected into Design 139.

Do not create a giant platform `SyncRecord` if specialized domains require different semantics.

---

## SyncCursor

Where synchronization requires continuation state:

store it per:

* connection;
* capability/source;
* external stream.

Cursor ≠ health state.

---

## WebhookSubscription

Conceptually:

```text
WebhookSubscription
├── integrationConnectionId
├── providerSubscriptionId
├── eventTypes
├── expiresAt?
├── lifecycle
└── revision
```

Provider subscription is distinct from provider events received through it.

---

## ProviderEvent

Canonical normalized provider evidence.

Conceptually:

```text
ProviderEvent
├── provider
├── integrationConnectionId
├── externalEventId
├── eventType
├── occurredAt
├── receivedAt
├── verificationState
├── safePayloadReference
└── processingState
```

Exact normalization may be integration-specific.

---

## ProviderEvent ≠ DomainEvent

Permanent.

Provider event is external evidence.

A validated provider event can generate internal DomainEvents.

---

## Provider event deduplication

Use provider external event ID/signature/context where available.

Do not duplicate canonical domain changes because the provider retries the same webhook.

---

## IntegrationCatalogEntry

Read projection.

Conceptually:

```text
IntegrationCatalogEntry
├── provider definition
├── availability
├── number of connections
├── capability summary
├── broad health summary
└── allowed user actions
```

Not a writable business entity.

---

## ConnectedServiceSummary

Read projection per exact IntegrationConnection.

Contains only safe summary data.

---

# 4. Permissions

Design 139 should conceptually distinguish:

```text
integration.read
integration.connect
integration.reauthorize
integration.disconnect
integration.disable
integration.configure

integrationHealth.read

integrationCapability.read
integrationCapability.configure

integrationCredential.rotate
integrationCredential.revoke

integrationWebhook.manage
```

Exact identifiers belong to Phase 3D.

---

## Integration Center read ≠ Integration management

Critical.

A user may see:

> Microsoft connected

without being able to revoke it.

---

## Connect ≠ configure

Permanent.

---

## Configure ≠ credential rotate

Permanent.

---

## Reauthorize ≠ disconnect

Permanent.

---

## Disconnect ≠ delete Integration history

Absolute.

---

## Credential rotate ≠ credential read

Critical.

There should generally be **no permission that returns raw stored secrets** through the application.

---

## Integration administrator ≠ source-domain administrator

A user allowed to reconnect LinkedIn does not automatically gain:

* Distribution campaign management;
* Publication release permission;
* Inbox access;
* Finance access.

---

## Domain capability ≠ platform RBAC

Permanent.

---

## Provider scope ≠ platform permission

Absolute.

---

## OAuth authorization requires strong organization context

A user must not accidentally connect a provider account into the wrong Organization.

OAuth state must bind:

* Organization;
* intended connector;
* initiating membership;
* requested connection scope;
* nonce.

---

## Connection picker visibility ≠ access

Direct Connection IDs reauthorize.

---

## External account selector must be permission-safe

If provider returns several pages/workspaces/accounts:

only authorized, eligible provider properties can be linked.

---

## Cross-tenant connection reuse prohibited

Absolute.

An `IntegrationConnection` belongs to the owning organization/context.

---

## Credential vault reference never exposed unnecessarily

Even vault secret identifiers may be sensitive implementation details.

Normal UI should receive high-level credential state only.

---

## Health read ≠ raw provider diagnostic access

Permanent.

Detailed provider errors may contain sensitive data.

Return normalized safe error classes/messages.

---

## Disconnect action requires stronger confirmation

Where frozen UI contains disconnect:

server must revalidate:

* current connection;
* dependent capabilities;
* user's permission;
* expected revision.

---

## Integration counts/facets permission-safe

If Design 139 shows:

> 7 connected services

the user should only count services they are permitted to know exist.

---

# 5. States

Design 139 must keep **provider availability, connection lifecycle, authorization state, credential state, capability state, health, sync state, and webhook state** separate.

### Provider availability

```text
Available
Deprecated
Disabled
Unavailable
```

### Connection lifecycle

Conceptually:

```text
Not Connected
Connecting
Connected
Disconnected
Disabled
```

### Authorization

```text
Authorized
Reauthorization Required
Expired
Revoked
Unknown
```

### Credential state

```text
Valid
Expiring
Expired
Revoked
Unknown
```

### Health

```text
Healthy
Degraded
Unavailable
Unknown
```

### Capability

```text
Available
Partially Available
Not Granted
Disabled
Unsupported
Unknown
```

### Sync

```text
Never Synced
Idle
Syncing
Succeeded
Failed
Stale
Unknown
```

These must never collapse into one generic:

```text
integration.status
```

---

## Connected ≠ Authorized

Critical.

A persisted connection can still require reauthorization.

---

## Authorized ≠ Healthy

Permanent.

---

## Healthy ≠ Sync successful

Permanent.

---

## Sync failed ≠ Connection disconnected

Absolute.

---

## Capability unsupported ≠ authorization denied

Permanent.

---

## Capability not granted ≠ provider does not support capability

Permanent.

---

## Platform-disabled capability ≠ provider grant revoked

Permanent.

---

## Credential expired ≠ connection deleted

Absolute.

---

## Provider temporarily unavailable ≠ disconnected

Permanent.

---

## Health Unknown ≠ Healthy

Absolute.

---

## Health stale ≠ healthy

Permanent.

A last health check from weeks ago should not present as current health.

---

## Disconnect requested ≠ disconnected

If provider revocation is asynchronous/uncertain.

---

## Revoked locally ≠ provider revocation confirmed universally

Where provider revocation confirmation is uncertain, preserve evidence.

---

## Reconnect failed ≠ old historical connection deleted

Absolute.

---

## Provider account renamed ≠ disconnected

Permanent.

---

## Connection disabled ≠ provider authorization revoked

Permanent.

Platform may disable use without revoking external grant.

---

## One capability unhealthy ≠ entire provider connection unusable

Important.

Example:

```text
READ_ANALYTICS healthy
PUBLISH_CONTENT degraded
```

where connector architecture allows capability-specific health.

---

## State Coverage

Design 139 inherits Design 150 plus:

```text
Integration Center Loading
Integration Center Available
Integration Center Empty
Integration Center Restricted
Integration Center Partial
Integration Center Unavailable

Provider Available
Provider Deprecated
Provider Disabled
Provider Unavailable

Connection Not Connected
Connection Connecting
Connection Connected
Connection Disconnected
Connection Disabled
Connection State Unknown

Authorization Valid
Authorization Expiring
Reauthorization Required
Authorization Expired
Authorization Revoked
Authorization Unknown

Credential Valid
Credential Expiring
Credential Expired
Credential Revoked
Credential Unknown

Connection Healthy
Connection Degraded
Connection Unavailable
Connection Health Unknown
Connection Health Stale

Capability Available
Capability Partially Available
Capability Not Granted
Capability Disabled
Capability Unsupported
Capability State Unknown

Sync Never Run
Sync Idle
Sync Running
Sync Successful
Sync Failed
Sync Stale
Sync State Unknown

Webhook Active
Webhook Expiring
Webhook Failed
Webhook Disabled
Webhook State Unknown

External Account Available
External Account Renamed
External Account Restricted
External Account Unavailable

Connection Updated Elsewhere
Authorization Updated Elsewhere
Credential Rotated Elsewhere
Health Updated Elsewhere
Capability Changed Elsewhere
Provider Configuration Changed
Integration Projection Stale
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize:

1. provider/service identity;
2. connected/not-connected state;
3. exact external account/property;
4. authorization state;
5. health;
6. capabilities;
7. permitted management action.

Conceptually:

```text
Integration Center
↓
Connected Services

Microsoft 365
Account: Editorial Workspace
Connection: Connected
Authorization: Valid
Health: Healthy
Capabilities:
Email · Calendar
Action:
Manage

LinkedIn
Page: The Perspective Media
Connection: Connected
Authorization: Valid
Health: Degraded
Capabilities:
Publishing · Analytics
Action:
Review connection
```

Only elements actually present in frozen Design 139 should render.

---

## Provider branding must not replace exact account identity

Bad:

> LinkedIn — Connected

Better:

> LinkedIn
> The Perspective Media Page
> Connected

when account context exists.

This prevents operators from managing the wrong provider property.

---

## Health should not be represented by connection badge alone

Avoid:

> Connected ✓

when the connection is actually degraded.

Prefer conceptually:

> Connected · Health degraded.

---

## Reauthorization should be obvious

Example:

> Microsoft 365
> Connected
> Reauthorization required

not:

> Connected / Healthy.

---

## Capabilities should remain visible but compact

Examples:

* Email;
* Calendar;
* Publish;
* Analytics;
* Files.

Do not expose raw OAuth scopes as primary user-facing labels.

Scopes belong detailed evidence.

---

## Raw provider errors should not dominate list UI

List may show:

> Degraded

Design 140 can provide exact safe diagnostic details.

---

## Provider catalog vs connected services

If frozen Design 139 includes both:

* available integrations;
* connected integrations;

they should use the same ProviderDefinition registry.

Do not maintain two lists manually.

---

## Search/filter

If present, server-backed filters may include:

* category;
* connected/not connected;
* health;
* provider;
* capability.

---

## Tablet

Following Design 152:

* provider/account identity remains first;
* health/authorization stack beneath;
* capabilities wrap;
* secondary provider metadata collapses;
* main management action remains reachable.

---

## Mobile

Priority:

```text
Provider
↓
Connected account/property
↓
Connection state
↓
Authorization
↓
Health
↓
Capabilities
↓
Primary allowed action
```

Avoid a wide integration table.

---

## Mobile connection card

A safe representation could conceptually communicate:

> LinkedIn
> The Perspective Media
> Connected
> Health degraded
> Publishing available
> Analytics currently unavailable
> Manage connection

---

## Accessibility

A connection summary could communicate:

> LinkedIn connection IC-20 is connected to external organization page The Perspective Media. Authorization is currently valid. Overall connection health is degraded because analytics access is unavailable, while publishing remains available. The connection was last health-checked five minutes ago. You are authorized to manage this connection but not to view stored credentials.

where canonical data supports it.

---

# 7. Backend Requirements

## Canonical Integration architecture

```text
Design 139
    ↓
Authenticated Workspace Context
    ↓
IntegrationCenterQueryService
    │
    ├── IntegrationConnectorRegistry
    ├── IntegrationConnectionAdapter
    ├── ExternalAccountAdapter
    ├── AuthorizationGrantAdapter
    ├── CapabilityResolver
    ├── HealthSummaryAdapter
    └── Permission Resolver
    ↓
IntegrationCatalogEntry[]
ConnectedServiceSummary[]
```

Connection lifecycle:

```text
Connect request
     ↓
Authorization initiation
     ↓
Provider authorization
     ↓
Validated callback
     ↓
External identity resolution
     ↓
Credential vault write
     ↓
IntegrationConnection
     ↓
Capability resolution
     ↓
Health verification
```

---

## Connector Registry

One canonical:

```text
IntegrationConnectorRegistry
```

should define provider capabilities and implementation adapters.

Conceptually:

```text
ConnectorDefinition
├── providerKey
├── connectorVersion
├── authentication methods
├── supported capabilities
├── required provider scopes
├── provider API version
├── connection-scope types
├── health-check strategy
├── webhook strategy
├── synchronization capabilities
└── configuration schema
```

---

## Connector registry ≠ tenant configuration

Absolute.

---

## Provider adapters

Provider-specific logic should live behind adapters such as:

```text
OAuthAuthorizationAdapter
ProviderAccountDiscoveryAdapter
ProviderHealthAdapter
WebhookAdapter
DomainCapabilityAdapter
```

Do not spread provider-specific conditional logic throughout UI/API endpoints.

---

## OAuth initiation

Conceptually:

```text
beginIntegrationAuthorization(
    organizationId,
    providerKey,
    intendedScope,
    currentMembership
)
```

must create secure authorization state containing/binding:

* high-entropy nonce;
* Organization ID;
* initiating Membership ID;
* connector/provider;
* intended connection scope;
* return destination;
* expiry.

---

## OAuth state must be signed/opaque

Never trust client-provided:

```text
organizationId=...
provider=...
```

from callback parameters without validated server state.

---

## PKCE

Use PKCE where supported/required.

---

## Redirect URI

Strict allowlist.

No arbitrary user-controlled redirect.

---

## OAuth callback

Conceptually:

```text
completeIntegrationAuthorization(callback)
```

should:

1. validate state/nonce;
2. validate callback expiry;
3. verify intended Organization/membership;
4. exchange authorization code server-side;
5. identify provider account;
6. inspect granted scopes;
7. securely persist credential material;
8. create/reconcile IntegrationConnection;
9. emit Audit/outbox;
10. schedule initial health/capability verification.

---

## Callback idempotency

Critical.

Provider/browser retries must not create multiple duplicate Connections.

---

## Authorization code replay prevention

Absolute.

---

## Connection identity resolution

Use:

```text
organization
+
provider
+
external stable account/property identity
+
connection scope
```

according to connector semantics.

Do not identify connections solely by email/display name.

---

## OAuth credential storage

Access/refresh tokens go to:

* KMS-backed encryption;
* secret manager;
* vault-equivalent secure storage.

Never normal plaintext DB.

---

## Token envelope

Normal DB can hold:

```text
vault reference
credential version
expiry
grant metadata
```

not secret value.

---

## Refresh-token rotation

Provider refresh logic must support providers that rotate refresh tokens.

Use atomic secret replacement.

Do not overwrite the working credential before the new credential is securely committed.

---

## Concurrent refresh protection

Critical.

Two workers must not independently refresh the same rotating credential and invalidate each other.

Use:

* distributed lock;
* credential revision/lease;
* single-flight refresh coordinator.

---

## Refresh failure classes

Distinguish:

```text
temporary provider failure
rate limit
network error
invalid grant
revoked credential
expired credential
```

Do not mark connection disconnected for every transient failure.

---

## Outcome unknown during refresh

If provider state is uncertain, preserve authorization/health as unknown/degraded until verified.

---

## API key integrations

Secret write:

```text
submit secret
↓
validate
↓
store in vault
↓
discard plaintext
```

Normal query afterward:

> API key configured · last rotated ...

not the value.

---

## Secret rotation

Should be a governed command.

Conceptually:

```text
rotateIntegrationCredential(...)
```

with:

* current connection authorization;
* new secret validation;
* atomic credential version change;
* AuditEvent without secret values.

---

## Credential revoke

Credential revocation and connection disabling/disconnect remain separate where provider semantics require.

---

## External account discovery

Some providers expose:

* multiple Organizations;
* pages;
* sites;
* workspaces;
* ad accounts;
* calendars.

Account/property selection should use stable external IDs.

---

## Provider display snapshot

Historical domain actions should pin needed provider account/target context so later rename does not rewrite history.

---

## Capability mapping

Central resolver:

```text
IntegrationCapabilityResolver.resolve(
    connectorDefinition,
    grantedProviderScopes,
    connectionConfiguration,
    health
)
```

should derive effective capability state.

---

## Capability support ≠ authorization

Already mandatory.

---

## Principle of least privilege

Request only provider scopes required for enabled capabilities.

Avoid asking for every provider permission "just in case."

---

## Scope expansion

If a new capability needs additional provider scopes:

perform explicit reauthorization/consent.

Do not silently assume existing grants permit it.

---

## Scope reduction

Revoking a capability internally does not necessarily revoke provider grant externally.

Keep:

* external grant;
* internal enabled capability;

separate.

---

## Health checks

Health must be collected asynchronously/background.

Do not call every provider API when Integration Center loads.

---

## Health-check service

Conceptually:

```text
checkIntegrationConnectionHealth(connectionId)
```

should validate relevant dimensions such as:

* credential usability;
* provider reachability;
* account existence;
* capability-specific access.

---

## Health check ≠ destructive test

Avoid causing side effects just to prove a connection works.

For example, do not send an actual email or publish a post as routine health check.

---

## Current health derivation

Use recent `ConnectionHealthObservation`s and freshness policy.

Do not return:

```text
healthy = true
```

forever because last successful check was months ago.

---

## Health freshness

Should be explicit.

Example:

```text
HEALTHY
checked 3 min ago
```

vs:

```text
last known healthy
checked 5 days ago
freshness = STALE
```

---

## Health partiality

A connection with multiple capabilities may be:

```text
Email = healthy
Calendar = degraded
```

Overall health can be:

> Degraded

without hiding capability detail.

---

## Sync runs

If domain synchronization exists:

keep a separate durable Run identity.

Do not use:

```text
connection.lastSyncSuccess = true
```

as the entire execution record.

---

## Initial sync

Connecting an Integration does not mean data synchronization is complete.

---

## Sync success ≠ all provider data imported

Partial pagination/backfill may still remain.

---

## Sync cursor

Must be:

* connection/capability scoped;
* durable;
* transactionally advanced only after committed processing.

---

## Provider API pagination

Do not advance cursor beyond uncommitted canonical data.

---

## Webhook registration

Where provider supports webhooks:

registration is an explicit provider-side resource.

Track provider subscription IDs and expiry.

---

## Webhook expiration

Some provider subscriptions require renewal.

Subscription expiry ≠ connection authorization expiry.

Keep separate.

---

## Webhook verification

Incoming webhook processing must validate:

* signature;
* timestamp where provider supports it;
* endpoint/token;
* provider account/connection mapping.

---

## Replay protection

Critical.

Provider webhook retries are normal.

Use external event ID/deterministic fingerprint for idempotency.

---

## Provider event order

Callbacks may arrive out of order.

Use:

```text
occurredAt
receivedAt
provider sequence/version
```

where available.

Do not assume arrival order = business order.

---

## ProviderEvent persistence

Store normalized evidence safely.

Do not persist unbounded raw payloads indefinitely without retention/redaction policy.

---

## Provider event → domain command

Only after:

* signature verified;
* tenant/connection resolved;
* event deduplicated;
* semantic validation.

---

## Connection disconnect

Conceptually:

```text
disconnectIntegration(connectionId)
```

should:

1. authorize;
2. revalidate current revision/state;
3. disable future capability use;
4. revoke provider grant where requested/possible;
5. stop/disable webhook/sync scheduling;
6. preserve connection identity/history;
7. preserve all historical canonical domain records;
8. emit Audit/outbox.

---

## Disconnect ≠ delete

Absolute.

---

## Disconnect does not delete ProviderEvents required for history

Permanent.

---

## Reconnect

Should either:

* reactivate/re-authorize same stable external identity;
* or explicitly create/relink a different Connection.

Never silently replace historical account identity.

---

## Downstream domain references

Examples:

### Email

```text
SendingAccount
→ IntegrationConnection
```

### Publishing

```text
PublicationTarget configuration
→ IntegrationConnection / capability
```

where provider connectivity is required.

### Distribution

```text
DistributionChannel
→ IntegrationConnection
```

where execution requires provider authorization.

The target/channel/account domain identities remain separate.

---

## Connection deletion references

Historical source records must never lose lineage because the current connection is disabled.

Prefer stable foreign references/soft lifecycle.

---

## Domain authorization at execution time

A healthy connection does not mean every operation is automatically allowed.

When publishing/sending/etc.:

1. validate platform user/system authorization;
2. validate domain state;
3. validate connection capability;
4. validate current authorization/health;
5. execute provider action.

---

## Design 136 integration

Command Center can receive derived attention conditions such as:

```text
Integration authorization expired
Integration degraded
Webhook renewal failed
```

It does not become Integration state authority.

---

## Design 138 integration

Audit-worthy Integration actions should include:

* connection created;
* external account linked;
* reauthorization completed;
* credential rotated;
* capability/config changed;
* connection disabled;
* connection disconnected.

Audit must never include token/key contents.

---

## Integration events vs AuditEvents

Routine:

* health checks;
* sync pages;
* provider callbacks;

do not automatically flood Audit.

Material administrative lifecycle changes do.

---

## Design 141/142 integration

Generic Automation Runs may depend on Integration capabilities.

Automation should reference:

```text
integrationConnectionId
capability
```

or approved abstraction.

It should not retrieve credentials itself.

---

## Credential access boundary

Only trusted provider adapter/integration runtime receives decrypted secret material for the minimum execution window.

Normal domain services should request:

> execute provider operation using connection IC-20

rather than:

> give me IC-20 refresh token.

---

## Server-side secret access auditing

Sensitive credential access by internal services can be monitored through security/operational mechanisms without logging the secret itself.

---

## Rate limits

Provider rate-limit state should be connection/capability aware.

429 ≠ disconnected.

---

## Provider quotas

Quota exhaustion may cause:

```text
health = DEGRADED
capability = temporarily unavailable
```

without revoking authorization.

---

## Circuit breakers

Repeated provider failures can trigger connector-level circuit breakers.

Circuit breaker open ≠ connection disconnected.

---

## Retry policy

Connection-health retry and downstream business-operation retry remain separate.

Do not let Design 139 initiate arbitrary retry of Publications/Distribution/etc.

---

## Connection Center mutations

If frozen Design 139 has Connect/Disconnect/Reauthorize/Configure actions:

each uses targeted services.

Avoid:

```text
PATCH /integrations/:id
{
  status,
  token,
  scopes,
  health,
  ...
}
```

---

## Integration query

Conceptually:

```text
getIntegrationCenter(
    filters,
    currentMembership
)
```

should:

1. authenticate;
2. resolve tenant;
3. load permitted connector catalog;
4. load authorized IntegrationConnections;
5. load safe external account summaries;
6. derive authorization state;
7. resolve capability summaries;
8. resolve current health/freshness;
9. return allowed actions;
10. never expose secrets.

---

## Catalog availability

Provider Definition may be globally available while:

* disabled for this plan;
* not enabled for this Organization;
* unavailable due provider outage.

Keep these semantics explicit if product supports them.

---

## Partial failure contract

Example:

```text
Connection core       ✓
Authorization state   ✓
Health service        ✕
```

Correct:

> Microsoft is connected and currently authorized; live health status is unavailable.

Incorrect:

> Microsoft disconnected.

Another:

```text
Connection            ✓
Authorization         expired
Historical sync data  ✓
```

Correct:

> Connection requires reauthorization. Historical synchronized data remains available.

Not:

> Integration data deleted.

Another:

```text
Publishing capability   ✓
Analytics capability    ✕
```

Correct:

> Connection is partially available.

Not:

> Entire connection failed.

---

## Idempotency

Required for:

* connection creation;
* OAuth callback completion;
* account linking;
* credential rotation;
* disconnect;
* webhook registration/renewal;
* provider-event processing.

---

## Optimistic concurrency

Critical for:

* connection config edits;
* credential rotation;
* disconnect/reconnect;
* capability changes.

---

## OAuth race

If two administrators begin authorization simultaneously:

the system must not accidentally bind callbacks to the wrong intent/Organization.

Each authorization attempt has its own secure state.

---

## Credential refresh race

Already mandatory: single-flight/locking.

---

## Connection configuration race

Use expected revision.

---

## Caching

Integration Center cache should vary by:

```text
organizationMembershipId
authorizationRevision
connectorRegistryRevision
connectionRevision
externalAccountRevision
authorizationGrantRevision
capabilityRevision
healthRevision/freshness
configurationRevision
```

---

## Never cache decrypted secrets

Absolute.

---

## Health cache

Short-lived/staleness-aware.

---

## Performance

Use:

* cached provider catalog;
* compact connected-service projections;
* asynchronously maintained health summaries;
* lazy detailed diagnostics;
* batched connection queries.

Do not perform synchronous provider calls for every Integration card.

---

## Backend Requirement Matrix

| Requirement                                               | Status                            |
| --------------------------------------------------------- | --------------------------------- |
| One platform Integration connection foundation            | **Critical**                      |
| Design 092 ProviderConnection consolidation               | **Critical architecture**         |
| ProviderDefinition/Connection separation                  | **Critical**                      |
| Connection/ExternalAccountIdentity separation             | **Critical**                      |
| Connection/AuthorizationGrant separation                  | **Critical**                      |
| AuthorizationGrant/CredentialSecret separation            | **Critical**                      |
| Credential metadata/secret-value separation               | **Critical**                      |
| Vault/KMS-backed secret storage                           | **Critical**                      |
| No plaintext tokens/API keys in DB/API                    | **Critical**                      |
| Write-only secret configuration                           | **Critical**                      |
| Connector-supported/granted/enabled capability separation | **Critical**                      |
| Provider scopes/platform capabilities separation          | **Critical**                      |
| Provider capability/platform RBAC separation              | **Critical**                      |
| Connection lifecycle/health separation                    | **Critical**                      |
| Health/sync-state separation                              | **Critical**                      |
| Health/downstream execution separation                    | **Critical**                      |
| Disconnect/data deletion separation                       | **Critical**                      |
| Reconnect/account identity safety                         | **Critical**                      |
| Stable provider external IDs                              | **Critical**                      |
| Explicit connection scope                                 | **Critical**                      |
| Organization/personal connection separation               | **Critical**                      |
| Authorizing-user deactivation policy                      | **Critical architecture**         |
| Connector registry/versioning                             | **Critical architecture**         |
| Provider adapter abstraction                              | **Critical**                      |
| OAuth state/nonce validation                              | **Critical**                      |
| OAuth Organization binding                                | **Critical**                      |
| PKCE where applicable                                     | **Critical**                      |
| Redirect allowlisting                                     | **Critical**                      |
| Authorization-code replay protection                      | **Critical**                      |
| OAuth callback idempotency                                | **Critical**                      |
| Atomic refresh-token rotation                             | **Critical**                      |
| Concurrent credential refresh protection                  | **Critical**                      |
| Least-privilege provider scopes                           | **Critical**                      |
| Explicit scope-expansion consent                          | **Critical**                      |
| Background health checking                                | **Critical**                      |
| Health freshness                                          | **Critical**                      |
| Capability-specific health                                | **Critical architecture**         |
| Health checks without destructive side effects            | **Critical**                      |
| SyncRun/Connection separation                             | **Critical**                      |
| Durable sync cursors                                      | **Critical where sync exists**    |
| WebhookSubscription/ProviderEvent separation              | **Critical where webhooks exist** |
| Provider webhook authentication                           | **Critical**                      |
| Provider event replay protection                          | **Critical**                      |
| Out-of-order provider event safety                        | **Critical**                      |
| ProviderEvent/DomainEvent separation                      | **Critical**                      |
| Target/channel/domain identity separation                 | **Critical**                      |
| Connection disable/history preservation                   | **Critical**                      |
| Connection mutation targeted commands                     | **Critical**                      |
| Design 138 secret-safe Audit reuse                        | **Critical**                      |
| Design 136 attention projection reuse                     | **Critical architecture**         |
| Designs 141–142 capability reuse                          | **Critical architecture**         |
| Cross-tenant isolation                                    | **Critical**                      |
| Permission-safe catalog/list/counts                       | **Critical**                      |
| Optimistic concurrency                                    | **Critical**                      |
| Idempotency                                               | **Critical**                      |
| Authorization-aware caching                               | **Critical**                      |
| No decrypted-secret caching                               | **Critical**                      |
| Partial dependency failure handling                       | **Critical**                      |

---

# 8. Consolidation

Design 139 creates one of the largest security/duplication risks in the platform because nearly every external provider can tempt each product module to implement its own OAuth/token/health logic.

**Email ProviderConnection / platform IntegrationConnection duplication**
OAuth/token infrastructure forks.

**Publishing connection / Distribution connection duplication**
Same provider account gets stored twice.

**ProviderDefinition / Connection conflation**
Supported provider appears automatically connected.

**Provider / ExternalAccountIdentity conflation**
Provider brand becomes account identity.

**External account display name / stable provider ID conflation**
Provider rename breaks historical lineage.

**IntegrationConnection / SendingAccount conflation**
Mailbox identity and provider connection merge.

**IntegrationConnection / DistributionChannel conflation**
Promotional destination and authorization connection merge.

**IntegrationConnection / PublicationTarget conflation**
Publishing destination and provider credential become one object.

**Connection / AuthorizationGrant conflation**
Expired OAuth grant deletes connection identity.

**AuthorizationGrant / CredentialSecret conflation**
Permission semantics and secret material merge.

**Credential metadata / raw credential conflation**
Token leaks through ordinary queries.

**Encryption / safe secret handling conflation**
Encrypted plaintext DB fields are treated as sufficient isolation without access controls.

**UI masking / secure storage conflation**
Secret exists in API but appears as dots.

**API key configured / API key readable conflation**
Platform exposes stored secret after setup.

**Credential rotation / connection replacement conflation**
Historical connection IDs change unnecessarily.

**Refresh failure / disconnect conflation**
Transient provider outage kills connection.

**Provider 429 / disconnected conflation**
Rate limiting becomes authorization failure.

**Credential expiry / data deletion conflation**
Historical synced records disappear.

**Connector supports capability / grant includes capability conflation**
Platform attempts unauthorized provider operations.

**Granted provider scope / platform enabled capability conflation**
Provider permission automatically turns feature on.

**Provider capability / user RBAC conflation**
Having a valid connection grants user permission to publish/send.

**OAuth scope / product capability conflation**
Raw provider scope strings become application business model.

**Connection lifecycle / Health conflation**
Connected card appears healthy despite provider failures.

**Connection health / Sync success conflation**
Healthy provider looks broken due processing error.

**Sync failure / disconnected conflation**
Domain processing breaks provider connection state.

**Health stale / healthy conflation**
Months-old success appears current.

**Health unknown / healthy conflation**
No evidence becomes green status.

**Overall connection health / capability-specific health conflation**
One broken capability disables unrelated working features.

**Connection disabled / provider grant revoked conflation**
Internal disablement modifies external semantics incorrectly.

**Disconnect / Delete conflation**
Historical integration lineage disappears.

**Disconnect / Delete synced domain data conflation**
Messages/meetings/placements/payments vanish.

**Reconnect / new external account conflation**
Different provider property silently inherits old history.

**Reconnect same account / new connection conflation**
Duplicate Connections appear.

**Current external account name / historical account snapshot conflation**
Past publishing/sending history changes labels.

**Organization connection / personal connection conflation**
User deactivation breaks organization integration unpredictably.

**Authorizing user / connection owner conflation**
Removing employee revokes company integration unintentionally.

**Connection owner / authorization authority conflation**
Ownership metadata grants provider operations.

**OAuth callback state / client query parameters conflation**
Attacker connects account to wrong tenant.

**Organization ID from browser / validated OAuth state conflation**
Cross-tenant account-link vulnerability.

**Authorization-code replay / callback retry conflation**
Duplicate connections/tokens created.

**Refresh-token rotation / simple overwrite conflation**
Valid token is lost during concurrent refresh.

**Multiple refresh workers / safe concurrency conflation**
One worker invalidates another's refresh token.

**Provider secret / AuditEvent conflation**
Tokens leak into compliance logs.

**Provider secret / Application log conflation**
Request debugging exposes credentials.

**Credential vault reference / public metadata conflation**
Implementation secret IDs leak unnecessarily.

**Health check / real provider side effect conflation**
Connection test sends email/posts publicly.

**Health observation / ApplicationLog conflation**
Raw trace becomes business health evidence.

**ProviderEvent / DomainEvent conflation**
External callbacks become internal canonical events without validation.

**Webhook received / webhook verified conflation**
Spoofed events mutate domain state.

**Webhook retry / new ProviderEvent conflation**
Duplicate domain mutations occur.

**ReceivedAt / occurredAt conflation**
Out-of-order callbacks corrupt state.

**WebhookSubscription / IntegrationConnection conflation**
Subscription expiry marks whole connection expired.

**Webhook expiry / OAuth expiry conflation**
Different renewal mechanisms merge.

**SyncCursor / Sync status conflation**
Cursor advancement becomes success state.

**Cursor advanced / transaction committed conflation**
Data is skipped after crash.

**Initial connection / synchronization complete conflation**
UI says ready before data import finishes.

**Connection healthy / Publication success conflation**
Invalid publication payload blamed on integration.

**Connection healthy / Distribution success conflation**
Campaign execution semantics disappear.

**IntegrationCenter / downstream command center conflation**
Design 139 retries Publishing/Distribution itself.

**Integration health / Incident conflation**
Provider degradation creates duplicate Incident lifecycle.

**Integration health / OperationalAttentionItem conflation**
Command Center projection becomes Integration truth.

**Integration lifecycle / AutomationRun conflation**
Generic workflow state controls provider connection.

**Routine health check / AuditEvent conflation**
Audit store floods.

**Every webhook / AuditEvent conflation**
Governance signal disappears.

**Generic `integrations` table with token columns**
Secrets and semantics collapse.

**Generic `connected=true`**
Cannot represent authorization/health/capability state.

**Generic `status=error`**
Cannot distinguish auth, provider health, sync, webhook, downstream failure.

**Generic `scopes JSON` as capabilities**
Provider-specific strings leak into domain logic.

**Generic `config JSON` containing secrets**
Configuration/credential boundary collapses.

**Generic `last_sync`**
No run/cursor/failure evidence.

**Generic `last_error`**
Potentially leaks provider-sensitive data and loses history.

**Generic `reconnect()` endpoint**
May silently replace account identity.

**139/092 duplicate provider connection layer**
Email infrastructure forks.

**139/124–129 duplicate publishing/distribution provider connections**
Provider lifecycle diverges.

**139/134 duplicate email delivery connection state**
Scheduled reporting stores mail credentials separately.

**139/138 duplicate integration audit/log storage**
Provider diagnostics become compliance truth.

**139/140 duplicate connection detail state**
Center and Detail use different health/auth data.

**139/141–142 duplicate connector runtime**
Automation gains direct credential access.

**139/147 duplicate health/incident lifecycle**
Provider outage becomes second Incident system.

No additional screen is required.

These are **single connection foundation, secure credential isolation, connector registry/capability semantics, OAuth tenancy safety, stable external identity, health/sync separation, webhook/event integrity, reconnection history, and cross-domain connection reuse requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL INTEGRATION CATALOG, CONNECTION LIFECYCLE, CAPABILITY & HEALTH-SUMMARY ANCHOR**

**Domain directive:**
**IntegrationProviderDefinition ≠ IntegrationConnection ≠ ExternalAccountIdentity ≠ AuthorizationGrant ≠ CredentialSecret ≠ ConnectionCapability ≠ ConnectionConfiguration ≠ ConnectionHealthObservation ≠ CurrentConnectionHealth ≠ SyncRun/SyncState ≠ WebhookSubscription ≠ ProviderEvent ≠ DomainEntity ≠ SendingAccount ≠ DistributionChannel ≠ PublicationTarget.**

**Foundation directive:**
Design 139 establishes one platform-wide provider-connection foundation reused by Email, Calendar, Publishing, Distribution, Reporting, Payments, Analytics, storage and future connectors rather than each domain maintaining its own OAuth/token lifecycle.

**Design-092 directive:**
Design 092's provider-connection concept must be consolidated with the platform IntegrationConnection layer during implementation mapping, while `SendingAccount` remains a distinct email/outreach business identity.

**Provider directive:**
`IntegrationProviderDefinition` represents supported connector metadata/capabilities and never tenant connection state.

**Connection directive:**
`IntegrationConnection` represents one tenant-scoped link to one exact external provider identity/property under an explicit connection scope.

**External-identity directive:**
provider-side stable IDs—not display names, handles, email labels or current titles—anchor external account identity wherever providers supply them.

**Rename directive:**
external provider account/page/workspace renames never create new connection identity or rewrite historical execution lineage.

**Scope directive:**
Organization, user, mailbox, account, property and workspace connections remain explicitly scoped according to provider semantics; they cannot be inferred from provider brand alone.

**Organization/personal directive:**
organization-owned connections and personal delegated connections remain different governance models, especially when the authorizing internal membership is deactivated.

**Authorization directive:**
provider authorization/grant state remains separate from IntegrationConnection lifecycle.

**Credential directive:**
raw access tokens, refresh tokens, API keys, client secrets and equivalent material never reside in ordinary frontend/API responses and should be stored using vault/KMS-backed secret infrastructure.

**Write-only-secret directive:**
API keys or manually supplied secrets are accepted for validation/storage but are not retrievable afterward through normal product interfaces.

**Metadata directive:**
normal database/application models may store credential type, expiry, vault reference/version and rotation metadata without exposing secret values.

**Redaction directive:**
Design 138 AuditEvents, application logs, errors and health observations never contain provider secrets.

**Capability directive:**
connector-supported capability, externally authorized/granted capability, internally enabled capability and current effective capability remain independent facts.

**Scope-to-capability directive:**
provider OAuth scopes are translated through connector logic into platform capabilities; raw provider scope strings never become the sole domain permission model.

**RBAC directive:**
a provider grant never grants an internal user permission to send, publish, distribute, read Inbox data or perform another domain operation. Design 037/source-domain authorization remains authoritative.

**Lifecycle directive:**
Connected, Disconnected and Disabled remain IntegrationConnection lifecycle conditions and must not be overloaded with authorization, health or sync state.

**Health directive:**
Connection health is derived from timestamped health observations and must preserve freshness; stale or unknown health can never display as currently healthy.

**Capability-health directive:**
where providers expose multiple independently usable capabilities, capability-specific health can degrade without automatically disabling the entire connection.

**Sync directive:**
domain synchronization state/run/cursor remains separate from connection lifecycle and health. A healthy connection can have a failed data-processing run.

**History directive:**
disconnecting, disabling, revoking or reauthorizing an IntegrationConnection never deletes historical Messages, Meetings, Contacts, Payments, Publications, Placements, Reports, ProviderEvents or Audit evidence.

**Reconnect directive:**
reauthorizing the same stable external account can preserve the same IntegrationConnection; connecting a materially different external account/property requires explicit relink/new-connection semantics and never silently inherits the former account's history.

**Connector-registry directive:**
one versioned `IntegrationConnectorRegistry` describes authentication methods, capabilities, scope requirements, health checks, webhooks, sync behavior and configuration schemas for supported providers.

**Adapter directive:**
provider-specific authentication, account discovery, health, webhook and API behavior remain behind provider adapters instead of spreading provider conditions across UI/domain code.

**OAuth-state directive:**
OAuth authorization attempts use high-entropy signed/opaque state bound to Organization, initiating membership, provider, intended connection scope, nonce and expiry.

**Cross-tenant OAuth directive:**
provider callbacks can never trust organization/account identifiers supplied directly by the browser without validated server-side authorization state.

**PKCE directive:**
PKCE is used where supported/required, with strict redirect URI allowlisting and authorization-code replay prevention.

**Callback-idempotency directive:**
OAuth callback replay/browser retry does not create duplicate IntegrationConnections or duplicate credential records.

**Least-privilege directive:**
connectors request only the provider scopes required for intended enabled capabilities; scope expansion requires explicit governed reauthorization.

**Refresh directive:**
refresh-token rotation is atomic and revision-aware, with distributed single-flight/locking semantics where necessary so concurrent workers cannot invalidate one another.

**Refresh-failure directive:**
temporary provider failures, rate limits, revoked grants, invalid grants and expiry remain distinguishable; transient provider failures never automatically disconnect the Integration.

**Rate-limit directive:**
provider 429/quota exhaustion is an operational/capability-health condition, not evidence that the connection has been revoked.

**Health-check directive:**
health verification runs asynchronously and must use non-destructive provider operations; loading the Integration Center never triggers a real email/post/payment solely as a connectivity test.

**Webhook directive:**
provider webhook subscriptions remain separate provider-side resources with their own expiry/state. Webhook expiry does not equal OAuth expiry or connection deletion.

**Webhook-security directive:**
incoming provider events require provider-specific authentication/signature verification, tenant/connection resolution, replay protection, idempotency and safe normalization before producing canonical domain actions.

**Provider-event directive:**
external `ProviderEvent` evidence remains separate from internal `DomainEvent` and preserves provider external IDs, occurrence time and received time where available.

**Ordering directive:**
provider events may arrive out of order; downstream processing must not assume arrival order equals business order.

**Sync-cursor directive:**
incremental synchronization cursors advance only after corresponding canonical processing commits, preventing data loss after crashes.

**Connection-query directive:**
Design 139 returns safe catalog/connection/account/capability/auth/health summaries only and never decrypted credentials or unrestricted provider diagnostics.

**Mutation directive:**
connect, reauthorize, configure, credential rotate, disable and disconnect use targeted commands with revision/idempotency checks rather than a generic integration mega-PATCH.

**Disconnect directive:**
disconnecting disables future provider use and optionally revokes external authorization while preserving the stable connection record/history and all canonical downstream records.

**Email directive:**
Design 092 `SendingAccount` references the connection layer but remains the identity actually selected for Outreach sending.

**Publishing directive:**
PublicationTargets remain Publishing-domain targets. They can reference an IntegrationConnection capability but never become connection/credential records.

**Distribution directive:**
DistributionChannels remain Distribution-domain destination identities. They can reference an IntegrationConnection but remain separate from authorization/health state.

**Reporting-delivery directive:**
Design 134's report delivery infrastructure references authorized Integration capabilities rather than storing independent provider credentials.

**Operations directive:**
Design 136 may surface expired/degraded/unavailable Integration conditions through `OperationalAttentionItem` projections while Design 139/140 remain Integration source truth.

**Audit directive:**
Design 138 receives secret-free AuditEvents for privileged Integration lifecycle/configuration operations; routine health checks/provider callbacks remain Integration/observability evidence unless specifically audit-worthy.

**Automation directive:**
Designs 141–142 may invoke allowed connector capabilities using IntegrationConnection references, but Automation runtimes must never fetch/store long-lived credential material as their own domain state.

**Credential-access directive:**
only trusted Integration/provider execution adapters should receive decrypted credentials for the minimum execution scope/time necessary; normal domain services request an operation against a connection rather than requesting its token.

**Authorization directive:**
Integration Center read, connect, reauthorize, configure, capability management, credential rotation/revocation, webhook management and disconnect remain independently server-authorized.

**Tenant directive:**
IntegrationConnections, external identities, provider events, webhooks, health observations and credential references remain strictly tenant/context scoped.

**Permission-before-count directive:**
catalog connection counts, filters and health summaries are permission-filtered before aggregation.

**Idempotency directive:**
authorization completion, connection creation, linking, credential rotation, disconnect, webhook operations and provider-event handling are replay-safe.

**Concurrency directive:**
configuration editing, credential refresh/rotation, disconnect/reconnect and capability changes use revision/lease/transaction safeguards.

**Caching directive:**
Integration Center caching varies by authorization, connector registry, connection, external account, grant, capability, health and configuration revisions, while decrypted secrets are never cached in ordinary application caches.

**Performance directive:**
Design 139 loads cached provider metadata and compact locally maintained connection/auth/health projections; it does not synchronously contact every provider on each page load.

**Partial-failure directive:**
Connection core, authorization, capability, health, webhook and sync services may fail independently. `Unavailable` can never become `Disconnected`, `Revoked`, `No capability`, `Sync success`, or deletion of historical integration data without evidence.

**Future-reuse directive:**
Design **140 — Integration Detail / Connection Health** must open one exact canonical `IntegrationConnection` from Design 139 and provide deeper authorization, account, capability, health-history, synchronization/webhook, safe diagnostic, dependency, and repair context. It must not introduce another `ConnectionDetail` business entity or maintain an independent health/authentication state machine.

**Overlap directive:**
Designs **014, 035, 092, 124–142** must preserve one continuous **versioned connector definition → tenant-scoped IntegrationConnection → stable external account identity → vault-backed authorization credentials → effective capabilities → timestamped health evidence → provider sync/webhook execution → canonical domain entities**, while SendingAccount, PublicationTarget, DistributionChannel, ScheduledReportRun, AutomationRun, AuditEvent and OperationalAttentionItem remain independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE PLATFORM INTEGRATION FOUNDATION — VERSIONED CONNECTOR REGISTRY + TENANT/ACCOUNT-SCOPED INTEGRATIONCONNECTION + STABLE EXTERNAL ACCOUNT IDENTITY + SEPARATE AUTHORIZATION GRANT + VAULT/KMS-BACKED WRITE-ONLY CREDENTIALS + SUPPORTED/GRANTED/ENABLED CAPABILITY SEPARATION + TIMESTAMPED HEALTH OBSERVATIONS/FRESHNESS + DOMAIN-SPECIFIC SYNC RUN/CURSOR + VERIFIED IDEMPOTENT PROVIDER WEBHOOK EVENTS + EXPLICIT DISCONNECT/REAUTHORIZE/RELINK SEMANTICS + DESIGN-092/124–142 SHARED CONNECTION REFERENCES — AND NEVER ALLOW GENERIC `CONNECTED=true`, RAW TOKEN FIELDS, GENERIC `STATUS=ERROR`, PROVIDER DISPLAY NAMES, UI OAUTH PARAMETERS, STALE HEALTH BADGES, `LAST_SYNC`, CREDENTIAL-BEARING CONFIG JSON, DOMAIN TARGETS OR GENERIC RECONNECT ENDPOINTS TO SUBSTITUTE FOR OR REWRITE CANONICAL CONNECTION, AUTHORIZATION, CAPABILITY, HEALTH OR PROVIDER-IDENTITY TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **139 / 153** |
| **PASS**                                   |                        **139** |
| **STANDARDIZE decisions**                  |                        **137** |
| **Potential implementation-overlap flags** |                        **130** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**139 / 153 = 90.8% audited.**

### Canonical Integration architecture after Design 139

```text
PROVIDER
Microsoft 365
      │
      ↓
IntegrationProviderDefinition
      │
      ↓
IntegrationConnection IC-20
      │
 ┌────┼───────────┐
 ↓    ↓           ↓
Account Auth     Config
 ID    Grant
      │
      ↓
Vault Credential
      │
      ↓
Capabilities
      │
 ┌────┴────┐
 ↓         ↓
Email    Calendar
 ↓         ↓
Sending  Meetings
Account
```

The strongest credential-security rule is now explicit:

```text
BAD

IntegrationConnection {
  provider: "Microsoft",
  accessToken: "...",
  refreshToken: "...",
  status: "connected"
}


CORRECT

IntegrationConnection
        │
        ↓
AuthorizationGrant
        │
        ↓
CredentialReference
        │
        ↓
Secure Vault / KMS

Normal UI/API sees:

Authorized
Expires at...
Last rotated...
Reauthorization required...

It NEVER sees
the stored secret value.
```

Connection, authorization, and health are now independently modeled:

```text
Connection:
CONNECTED

Authorization:
VALID

Health:
DEGRADED

Calendar:
AVAILABLE

Email:
UNAVAILABLE


This is valid.

One generic:

status = "ERROR"

is not.
```

Disconnecting also preserves business history:

```text
LinkedIn connection
      ↓
Disconnect

Future publishing:
disabled

Future distribution:
disabled

BUT:

old Publications remain
old Placements remain
old provider events remain
old metrics remain
old AuditEvents remain

Disconnect
      ≠
Delete history
```

And provider connectivity can no longer replace domain identities:

```text
IntegrationConnection
        ≠
SendingAccount
        ≠
PublicationTarget
        ≠
DistributionChannel

Connection answers:

“How do we authenticate
to this provider/account?”

Domain entity answers:

“What mailbox/target/channel
are we actually operating on?”
```

## Next Sequential Audit Target

### **Design 140 — Integration Detail / Connection Health**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
