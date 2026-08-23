# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 140 — Integration Detail / Connection Health

Design 140 should become the **canonical Team Workspace single-IntegrationConnection 360, authorization-state inspection, external-account verification, capability-health analysis, credential-lifecycle summary, sync/webhook status, dependency visibility, safe diagnostics, and connection-repair surface** built directly on the platform Integration foundation established by **Design 139 — Integration Center / Connected Services**.

Design 140 must **not create another connection entity, another OAuth/token store, or a generic editable `health` field**. It opens one exact canonical `IntegrationConnection` and explains why that connection is usable, degraded, unavailable, expired, partially capable, or in need of reauthorization.

It must preserve the distinction:

> **Connection exists ≠ authorization valid ≠ credential usable ≠ capability granted ≠ capability healthy ≠ sync healthy ≠ webhook healthy ≠ downstream operation successful.**

Design 140 is the deep diagnostic counterpart to Design 139:

* **139** — Which integrations exist and what is their broad state?
* **140** — What exactly is happening with this connection, what evidence supports that conclusion, and what repair action is safe?

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **IntegrationConnection ≠ ExternalAccountIdentity ≠ AuthorizationGrant ≠ CredentialReference ≠ ConnectionCapability ≠ ConnectionHealthObservation ≠ CurrentConnectionHealth ≠ CapabilityHealth ≠ SyncRun ≠ SyncCursor ≠ WebhookSubscription ≠ ProviderEvent ≠ DiagnosticObservation ≠ ConnectionRepairAttempt ≠ DomainExecution ≠ Incident.**

The central implementation rule is:

> **Design 140 is an evidence-driven connection-detail surface. Current connection health must be derived from timestamped authorization, credential, provider, capability, sync, webhook, and diagnostic evidence—not from a manually editable status badge. Repair actions must be narrowly scoped: reauthorize authorization, rotate credentials, renew a webhook, retry a sync, or reconnect the same external account when safe. None of these actions may rewrite historical domain executions, silently switch external-account identity, expose secret material, or treat an unknown provider outcome as a known failure.**

---

# 1. Classification

| Audit field                          | Classification                                                                                                                                                                                                  |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                        | **140**                                                                                                                                                                                                         |
| **Canonical name**                   | **Integration Detail / Connection Health**                                                                                                                                                                      |
| **Product area**                     | Team Workspace / Platform / Integrations / Diagnostics                                                                                                                                                          |
| **User surface**                     | **Authenticated Team Workspace**                                                                                                                                                                                |
| **Screen class**                     | Entity Detail / Connection 360 / Health & Repair Workspace                                                                                                                                                      |
| **Classification**                   | **Canonical IntegrationConnection Detail, Authorization, Capability-Health & Safe-Repair Anchor**                                                                                                               |
| **Primary purpose**                  | Inspect one exact external-service connection, verify account/auth/capability state, understand current and historical health, inspect sync/webhook dependencies, and initiate narrowly governed repair actions |
| **Canonical Integration foundation** | **Design 139**                                                                                                                                                                                                  |
| **Primary entity**                   | `IntegrationConnection`                                                                                                                                                                                         |
| **External provider identity**       | `ExternalAccountIdentity`                                                                                                                                                                                       |
| **Authorization evidence**           | `AuthorizationGrant`                                                                                                                                                                                            |
| **Credential metadata**              | `ConnectionCredentialReference`                                                                                                                                                                                 |
| **Capability model**                 | `ConnectionCapability`                                                                                                                                                                                          |
| **Health history**                   | `ConnectionHealthObservation`                                                                                                                                                                                   |
| **Current health projection**        | `CurrentConnectionHealth`                                                                                                                                                                                       |
| **Capability-specific health**       | `CapabilityHealthProjection`                                                                                                                                                                                    |
| **Sync dependency**                  | domain-specific `SyncRun` / `SyncState` / `SyncCursor`                                                                                                                                                          |
| **Webhook dependency**               | `WebhookSubscription`                                                                                                                                                                                           |
| **Provider event evidence**          | normalized `ProviderEvent`                                                                                                                                                                                      |
| **Diagnostic evidence**              | `IntegrationDiagnosticObservation` / safe diagnostic projection                                                                                                                                                 |
| **Repair execution**                 | canonical targeted connection/auth/webhook/sync services                                                                                                                                                        |
| **Email dependency**                 | Design 092                                                                                                                                                                                                      |
| **Calendar dependency**              | Designs 035 / 046 / 094                                                                                                                                                                                         |
| **Publishing dependency**            | Designs 124–126                                                                                                                                                                                                 |
| **Distribution dependency**          | Designs 127–129                                                                                                                                                                                                 |
| **Scheduled reporting dependency**   | Design 134                                                                                                                                                                                                      |
| **Operations dependency**            | Design 136                                                                                                                                                                                                      |
| **Audit dependency**                 | Designs 039 / 138                                                                                                                                                                                               |
| **Automation dependency**            | Designs 141–142                                                                                                                                                                                                 |
| **Incident boundary**                | Design 147                                                                                                                                                                                                      |
| **Primary query service**            | `IntegrationConnectionDetailQueryService`                                                                                                                                                                       |
| **Health service**                   | `IntegrationHealthService`                                                                                                                                                                                      |
| **Authorization service**            | `IntegrationAuthorizationService`                                                                                                                                                                               |
| **Credential service**               | `IntegrationCredentialService`                                                                                                                                                                                  |
| **Capability resolver**              | `IntegrationCapabilityResolver`                                                                                                                                                                                 |
| **Sync status adapter**              | `IntegrationSyncStatusAdapter`                                                                                                                                                                                  |
| **Webhook service**                  | `IntegrationWebhookService`                                                                                                                                                                                     |
| **Diagnostic service**               | `IntegrationDiagnosticService`                                                                                                                                                                                  |
| **Repair service**                   | targeted source-specific connection repair services                                                                                                                                                             |
| **Parent shell**                     | `InternalAppShell` — Design 001                                                                                                                                                                                 |
| **Auth**                             | Required                                                                                                                                                                                                        |
| **Authorization**                    | Active OrganizationMembership + Integration read/health/configuration/repair permissions                                                                                                                        |
| **Implementation priority**          | **Critical Provider Reliability / Credential Security / Repair Safety**                                                                                                                                         |
| **Reuse level**                      | **Platform-wide across all provider-backed product modules**                                                                                                                                                    |

Design 140 should answer:

> **“Which exact provider account is this connection bound to, is its authorization still valid, are its credentials usable without exposing them, which capabilities are effectively available, what health evidence supports the current state, are sync/webhooks functioning, which downstream modules depend on the connection, what changed recently, and which repair action is currently safe?”**

Canonical composition:

```text
IntegrationConnection IC-20
        │
        ├── Provider
        ├── ExternalAccountIdentity
        ├── AuthorizationGrant
        ├── Credential metadata
        ├── Configuration
        │
        ├── Capabilities
        │      ├── Email
        │      ├── Calendar
        │      └── Analytics
        │
        ├── Health observations
        ├── Sync state
        ├── Webhook state
        └── Dependencies
                 │
                 ↓
       CurrentConnectionHealth
                 │
        ┌────────┼────────┐
        ↓        ↓        ↓
      Healthy  Degraded  Unavailable
                 │
                 ↓
           Safe repair action
```

---

# 2. Reuse

## Design 139 remains canonical IntegrationConnection authority

Design 140 must open the exact same:

```text
IntegrationConnection IC-20
```

that appears in Design 139.

It must not create:

```text
IntegrationDetail
ConnectionDetail
HealthConnection
ManagedIntegration
```

as new business identities.

---

## Detail view ≠ IntegrationConnection

`IntegrationConnectionDetailView` may compose:

* connection;
* provider;
* external account;
* authorization;
* capabilities;
* health history;
* sync;
* webhook;
* dependencies;
* repair eligibility.

It is a read projection.

---

## ExternalAccountIdentity remains stable

The detail screen may show:

> LinkedIn — The Perspective Media

but business identity should remain anchored to the stable provider-side account/property identifier.

Current display name is presentation.

---

## Current external account label ≠ historical execution account label

If provider account was renamed, historical Publications/Placements remain linked to the exact external account identity used at execution.

---

## AuthorizationGrant ≠ Connection

Critical.

A persisted connection may exist while:

```text
Authorization = EXPIRED
```

Correct UI:

> Connection exists · reauthorization required.

Incorrect backend behavior:

> delete connection because token expired.

---

## CredentialReference ≠ AuthorizationGrant

Credential material may rotate while the provider grant/account identity remains logically the same.

---

## Credential state ≠ Connection health

Example:

```text
Credential valid
Provider API degraded
```

Connection can still be unhealthy despite valid credentials.

---

## Authorization valid ≠ Capability available

Permanent.

A provider grant may omit required scopes for one capability.

---

## Capability granted ≠ Capability enabled

Permanent.

Platform configuration may intentionally disable a granted provider feature.

---

## Capability enabled ≠ Capability healthy

Permanent.

---

## Capability healthy ≠ downstream domain execution successful

Critical.

Example:

```text
LinkedIn publishing capability = HEALTHY

Publication attempt = FAILED
because media asset validation failed
```

Design 140 must not claim the integration failed.

---

## Connection health ≠ Sync health

Permanent.

A provider can be reachable while a data-sync processor fails internally.

---

## Connection health ≠ Webhook health

Permanent.

OAuth may be valid while provider webhook subscription expired.

---

## Webhook subscription ≠ ProviderEvent

Subscription defines event delivery registration.

ProviderEvent is individual received evidence.

---

## ProviderEvent ≠ DomainEvent

Permanent.

Validated external event may cause an internal DomainEvent.

Do not merge them.

---

## DiagnosticObservation ≠ ApplicationLog

Critical.

A diagnostic may safely say:

> OAuth token rejected by provider.

It should not expose:

* raw HTTP Authorization header;
* full provider response body;
* access token;
* stack trace.

Detailed logs remain observability.

---

## Design 136 attention ≠ Integration health

Command Center may show:

> Integration requires reauthorization.

Design 140 remains the canonical place to understand the actual connection evidence and repair it.

Acknowledging the Command Center item does not repair the connection.

---

## Design 147 Incident ≠ Integration degradation

A provider outage can contribute to a system Incident.

But:

> LinkedIn API degraded

does not automatically mean:

> Platform Incident exists.

Incident lifecycle remains separate.

---

## Design 138 Audit ≠ health history

Critical.

Health polling history should not flood global AuditEvents.

Audit records material administrative actions such as:

* connect;
* reauthorize;
* rotate credential;
* configure;
* disconnect.

Health observations remain Integration operational evidence.

---

# 3. Entities

## IntegrationConnection

Same canonical Design-139 entity.

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
├── connectedAt?
├── disconnectedAt?
└── revision
```

---

## ExternalAccountIdentity

Detail should expose safe external account context such as:

* provider;
* provider-side stable ID;
* tenant/workspace/page/property identity;
* current display label;
* verified state.

Do not expose unnecessary provider metadata.

---

## External account verification

Where provider permits:

the platform should be able to verify that the stored external identity still refers to an accessible account/property.

---

## External account unavailable ≠ connection deleted

Permanent.

Possible causes:

* account removed provider-side;
* permission removed;
* temporary provider failure;
* external resource renamed/restructured.

Represent evidence rather than deleting history.

---

## AuthorizationGrant

Detail can safely expose:

```text
auth method
granted scopes/capabilities
grantedAt
expiresAt
revokedAt?
reauthorization state
```

Never expose bearer credentials.

---

## Authorization expiry ≠ Credential expiry universally

Depending on provider:

* grant may be durable;
* access token short-lived;
* refresh token long-lived.

Do not flatten all into one expiration timestamp.

---

## CredentialReference

Safe metadata only.

Conceptually:

```text
ConnectionCredentialReference
├── credentialType
├── version
├── expiresAt?
├── lastRotatedAt?
├── vaultReferenceInternal
├── lifecycle
└── revision
```

The vault reference should not normally be returned to UI.

---

## Credential version

Useful for diagnostics and concurrency.

Example:

```text
credential version 7
```

can help determine which credential was active during a failed health check without exposing secret material.

---

## ConnectionCapability

Capability state should be derivable per capability.

Conceptually:

```text
CapabilityHealthProjection
├── capabilityKey
├── connectorSupported
├── providerGranted
├── platformEnabled
├── health
├── healthCheckedAt
├── effectiveAvailability
└── safeReason?
```

---

## Effective availability

A capability can be unavailable because:

* unsupported;
* not granted;
* disabled;
* authorization expired;
* provider unhealthy;
* configuration invalid.

These causes must not collapse.

---

## ConnectionHealthObservation

Append-oriented operational evidence.

Conceptually:

```text
ConnectionHealthObservation
├── id
├── integrationConnectionId
├── capabilityKey?
├── healthClass
├── checkedAt
├── credentialVersion?
├── providerReachability
├── authorizationUsability
├── externalAccountAvailability
├── latency?
├── normalizedFailureClass?
└── safeEvidence
```

---

## CurrentConnectionHealth

Derived from recent observations and freshness policy.

Never manually edited.

---

## Health history

Design 140 may show recent health history if present in frozen UI.

Historical observations should not be overwritten by the newest check.

---

## Health check type

Could distinguish:

```text
AUTH_CHECK
PROVIDER_REACHABILITY
CAPABILITY_CHECK
ACCOUNT_ACCESS_CHECK
WEBHOOK_CHECK
```

where useful.

Do not overcreate types if provider does not support them.

---

## DiagnosticObservation

A normalized safe diagnostic representation can include:

```text
failureClass
providerCodeSafe
human-readable safe explanation
firstObservedAt
lastObservedAt
occurrenceCount
recommendedRepairClass
```

It should not become the provider raw-error store.

---

## Failure classes

Useful normalized examples:

```text
AUTHORIZATION_EXPIRED
AUTHORIZATION_REVOKED
MISSING_SCOPE
PROVIDER_UNAVAILABLE
RATE_LIMITED
ACCOUNT_NOT_FOUND
WEBHOOK_EXPIRED
SYNC_PROCESSING_FAILURE
CONFIGURATION_INVALID
UNKNOWN
```

Exact taxonomy Phase 3D.

---

## Provider error code ≠ platform failure class

Permanent.

Provider-specific errors should map through adapter normalization.

---

## SyncRun

If this Integration supports synchronization:

each run retains its own identity/history.

Design 140 can summarize recent Runs.

It should not persist:

```text
syncStatus = failed
```

as sole truth.

---

## SyncCursor

Separate from SyncRun and connection state.

---

## WebhookSubscription

Exact provider-side registration.

Conceptually:

```text
WebhookSubscription
├── id
├── integrationConnectionId
├── externalSubscriptionId
├── subscribedEventTypes
├── createdAt
├── expiresAt?
├── lifecycle
└── revision
```

---

## Webhook state ≠ authorization state

Permanent.

---

## ProviderEvent evidence

Design 140 may show safe event-ingestion summaries such as:

* last event received;
* recent verification failures;
* processing lag.

It should not expose raw sensitive payloads in ordinary UI.

---

## Connection dependency projection

Useful read model:

```text
IntegrationDependencySummary
├── dependencyType
├── sourceId
├── capabilityRequired
└── currentImpact
```

Examples:

* SendingAccount;
* PublicationTarget;
* DistributionChannel;
* Scheduled report email delivery.

---

## Dependency summary ≠ domain ownership

Design 140 cannot mutate these downstream entities generically.

---

## ConnectionRepairAttempt

Do not create a generic business repair entity unless a durable repair process actually requires it.

Most repairs should use canonical commands/runs:

* OAuth reauthorization attempt;
* credential rotation;
* webhook renewal;
* sync retry.

If durable repair execution is needed, it should preserve exact type and result rather than one generic "repair" boolean.

---

# 4. Permissions

Design 140 should conceptually distinguish:

```text
integration.read
integrationHealth.read
integrationDiagnostics.read

integration.reauthorize
integration.configure
integration.disable
integration.disconnect

integrationCredential.rotate
integrationCredential.revoke

integrationWebhook.renew
integrationSync.retry
integrationHealth.check
```

Exact names belong to Phase 3D.

---

## Connection read ≠ Diagnostic read

Some provider diagnostics may expose sensitive operational information.

---

## Diagnostic read ≠ credential read

Absolute.

No UI permission should return raw stored credential values.

---

## Health check permission ≠ connection configure

Permanent.

---

## Health check ≠ destructive provider action

Even privileged users should not cause a live email/post/payment as connectivity test.

---

## Reauthorize ≠ Rotate credential

Permanent.

For OAuth, reauthorize may create a new grant/token set.

For API-key connections, credential rotation is different.

---

## Rotate credential ≠ Disconnect

Permanent.

---

## Disconnect ≠ Delete history

Absolute.

---

## Webhook renew ≠ OAuth reauthorize

Permanent.

---

## Sync retry ≠ Connection retry

Permanent.

A failed sync should not trigger OAuth replacement unless evidence shows authorization failure.

---

## Integration manager ≠ downstream domain operator

A user able to repair Microsoft authentication does not automatically gain permission to:

* read Inbox messages;
* send Outreach;
* publish;
* distribute;
* manage Reports.

---

## Dependency visibility permission-safe

If Design 140 shows:

> Used by 3 publishing targets

do not expose names/details of targets the user cannot access unless explicit aggregate-only permission exists.

---

## Cross-tenant references prohibited

Absolute.

---

## Direct connection IDs reauthorize

Permanent.

---

## Repair action descriptors must be server-derived

A button shown in UI is not authorization.

The server validates current connection state and permission again.

---

# 5. States

Design 140 must keep **connection lifecycle, authorization, credential, capability availability, health, health freshness, sync, webhook, diagnostics, repair eligibility, and downstream dependency impact** separate.

### Connection lifecycle

```text
Connected
Disabled
Disconnected
Connecting
Unknown
```

### Authorization

```text
Valid
Expiring
Expired
Revoked
Reauthorization Required
Unknown
```

### Credential

```text
Valid
Expiring
Expired
Revoked
Rotation Required
Unknown
```

### Health

```text
Healthy
Degraded
Unavailable
Unknown
```

### Health freshness

```text
Fresh
Aging
Stale
Unknown
```

### Capability

```text
Available
Partially Available
Not Granted
Disabled
Unsupported
Unavailable
Unknown
```

### Sync

```text
Idle
Running
Succeeded
Failed
Partial
Stale
Unknown
```

### Webhook

```text
Active
Expiring
Expired
Renewal Failed
Disabled
Unknown
```

These must never collapse into one generic `connection.status`.

---

## Connected + Authorization Expired is valid

Permanent.

---

## Connected + Health Unknown is valid

Permanent.

---

## Connected + One capability unavailable is valid

Permanent.

---

## Authorization valid + Provider unavailable is valid

Permanent.

---

## Provider reachable + Missing scope is valid

Permanent.

---

## Credential valid + External account inaccessible is valid

Permanent.

---

## Sync failed + Connection healthy is valid

Permanent.

---

## Webhook expired + API capability healthy is valid

Permanent.

---

## Health stale ≠ unhealthy

A stale health observation means:

> current state is insufficiently known.

Do not automatically label unhealthy.

---

## Health unknown ≠ healthy

Absolute.

---

## Health degraded ≠ disconnected

Permanent.

---

## Rate limited ≠ revoked

Permanent.

---

## Account inaccessible ≠ account deleted conclusively

Could be permission loss or provider outage.

---

## Reauthorization required ≠ reconnect to another account

Critical.

Reauthorization should preserve same intended external identity unless user explicitly chooses otherwise.

---

## Repair succeeded ≠ downstream operation recovered automatically

Example:

OAuth reauthorization succeeds.

A previously failed Publication still remains failed until separately retried/verified.

---

## Repair failed ≠ historical connection invalid

Permanent.

---

## State Coverage

Design 140 inherits Design 150 plus:

```text
Integration Detail Loading
Integration Detail Available
Integration Detail Restricted
Integration Detail Partial
Integration Detail Unavailable

Connection Connected
Connection Disabled
Connection Disconnected
Connection State Unknown

Authorization Valid
Authorization Expiring
Authorization Expired
Authorization Revoked
Reauthorization Required
Authorization Unknown

Credential Valid
Credential Expiring
Credential Expired
Credential Rotation Required
Credential Revoked
Credential State Unknown

Health Healthy
Health Degraded
Health Unavailable
Health Unknown

Health Fresh
Health Aging
Health Stale
Health Freshness Unknown

Capability Available
Capability Partial
Capability Not Granted
Capability Disabled
Capability Unsupported
Capability Unavailable
Capability State Unknown

Sync Idle
Sync Running
Sync Success
Sync Partial
Sync Failed
Sync Stale
Sync State Unknown

Webhook Active
Webhook Expiring
Webhook Expired
Webhook Renewal Failed
Webhook Disabled
Webhook State Unknown

External Account Available
External Account Renamed
External Account Restricted
External Account Unavailable
External Account State Unknown

Repair Available
Repair Restricted
Repair Not Required
Repair In Progress
Repair Failed
Repair Outcome Unknown

Dependency Healthy
Dependency Impacted
Dependency Restricted
Dependency State Unknown

Connection Updated Elsewhere
Credential Rotated Elsewhere
Authorization Updated Elsewhere
Health Updated Elsewhere
Webhook Updated Elsewhere
Sync Updated Elsewhere
Configuration Conflict
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize:

```text
Provider / external account
↓
Connection lifecycle
↓
Authorization
↓
Overall health + last check
↓
Capabilities
↓
Diagnostics
↓
Sync / webhook
↓
Dependencies
↓
Repair actions
↓
History
```

Only sections actually present in frozen Design 140 should render.

---

## External account identity must remain prominent

An operator should never repair:

> "LinkedIn"

without knowing which LinkedIn Page/account/property is affected.

---

## Connection state, authorization and health need separate visual labels

Correct:

> Connected
> Authorization expired
> Health unavailable

Incorrect:

> Error.

---

## Health must show freshness

Better:

> Healthy · checked 4 min ago

than:

> Healthy

when the evidence could be old.

---

## Capability health should be inspectable independently

Example:

> Publishing — Healthy
> Analytics — Missing permission
> Webhooks — Expired

This is substantially safer than:

> LinkedIn connection degraded.

---

## Diagnostics should be human-readable and normalized

Correct:

> Reauthorization required because the provider rejected the current authorization grant.

Avoid exposing:

> HTTP 401 invalid_grant stack trace...

as primary UI.

---

## Raw secrets must never be visually revealable

No:

* eye icon to reveal stored refresh token;
* copy API key after initial creation;
* plaintext credential display.

For manually configured secrets:

> API key configured · rotated 18 days ago

is sufficient.

---

## Repair actions should be precise

Prefer:

* Reauthorize account
* Rotate credential
* Renew webhook
* Retry synchronization
* Check connection health
* Disconnect

Avoid one generic:

> Fix Integration.

---

## Destructive action wording

Disconnect should clearly indicate:

> prevents future provider use but preserves historical platform data.

if frozen UI includes appropriate confirmation.

---

## Tablet

Following Design 152:

* provider/account + status remain first;
* capability cards stack;
* diagnostics and health history become expandable;
* dependencies collapse;
* primary repair actions remain accessible.

---

## Mobile

Priority:

```text
Provider
↓
External account
↓
Authorization
↓
Health + freshness
↓
Capabilities
↓
Primary diagnostic
↓
Safe repair action
↓
Sync / webhook
↓
Dependencies
```

Avoid turning provider health history into an unreadable desktop table.

---

## Mobile diagnostic example

> Microsoft 365
> Editorial Workspace
> Connected
> Reauthorization required
> Last verified 2 hours ago
> Email unavailable
> Calendar unavailable
> Action: Reauthorize account

---

## Accessibility

A connection detail could communicate:

> Microsoft 365 connection IC-20 is connected to Editorial Workspace. The connection record remains active, but the provider authorization expired at 1:20 AM. Email and Calendar capabilities are therefore unavailable. The last successful authorization check was two hours ago. Historical synchronized data remains unaffected. You are authorized to reauthorize this same external account.

where canonical data supports it.

---

# 7. Backend Requirements

## Canonical Connection Detail architecture

```text
Design 140
    ↓
Authenticated Workspace Context
    ↓
IntegrationConnectionDetailQueryService
    │
    ├── IntegrationConnectionAdapter
    ├── ConnectorRegistry
    ├── ExternalAccountAdapter
    ├── AuthorizationGrantAdapter
    ├── CredentialMetadataAdapter
    ├── CapabilityResolver
    ├── HealthObservationAdapter
    ├── SyncStatusAdapter
    ├── WebhookAdapter
    ├── DependencyAdapter
    └── Permission Resolver
    ↓
IntegrationConnectionDetailView
```

---

## Connection detail query

Conceptually:

```text
getIntegrationConnectionDetail(
    connectionId,
    currentMembership
)
```

should:

1. authenticate;
2. resolve tenant;
3. authorize exact IntegrationConnection;
4. load provider/connector definition;
5. resolve external account identity;
6. resolve authorization state;
7. load safe credential metadata;
8. derive capabilities;
9. resolve current health and freshness;
10. load recent health observations;
11. load sync/webhook summaries where applicable;
12. resolve permission-safe downstream dependencies;
13. resolve current allowed repair actions;
14. never return secrets.

---

## Current health must be derived

One centralized:

```text
IntegrationHealthService.resolveCurrentHealth(...)
```

should use:

* recent health observations;
* authorization state;
* provider reachability;
* external account accessibility;
* capability checks;
* freshness policy.

Do not let multiple UI widgets derive their own health.

---

## Health policy version

If health derivation rules materially evolve, keeping a policy/version reference can improve reproducibility/debugging.

Exact persistence Phase 3D.

---

## Background health checks

Routine provider checks should execute asynchronously.

The detail page should display locally stored current evidence.

---

## "Check now"

If frozen Design 140 includes a manual refresh/test:

it should enqueue/execute a safe health check and return a new `ConnectionHealthObservation`.

It must not:

* send a real email;
* publish a real post;
* create a payment;
* mutate provider content.

---

## Health-check idempotency

Repeated manual clicks should not create unsafe provider load.

Use:

* rate limiting;
* coalescing/single-flight;
* freshness window.

---

## Diagnostic normalization

Provider adapters should map raw responses to normalized safe failure classes.

Example:

```text
provider:
invalid_grant

platform:
AUTHORIZATION_REVOKED
```

Raw details remain internal logs if needed.

---

## Credential validation

Provider adapter can test credential usability.

Never return credential content to caller.

---

## Reauthorization flow

Conceptually:

```text
reauthorizeIntegration(connectionId)
```

must preserve:

* intended Organization;
* current IntegrationConnection;
* expected external account identity where provider permits;
* nonce/state;
* desired scope/capabilities.

---

## Reauthorization identity check

Critical.

If reauthorization callback returns a different external account than expected:

do not silently attach it to the existing IntegrationConnection.

Require explicit confirmation/relink/new-connection policy.

---

## Reauthorization does not rewrite history

Absolute.

---

## Authorization scope changes

After successful reauthorization:

recompute:

* granted scopes;
* capability availability;
* health.

Do not assume previous capability set remains valid.

---

## Credential rotation

For API-key/secret integrations:

```text
rotateIntegrationCredential(
    connectionId,
    newCredential,
    expectedRevision
)
```

should:

1. authorize;
2. validate candidate secret;
3. store new version securely;
4. atomically switch active credential;
5. retain only allowed metadata/history;
6. invalidate/revoke old secret if policy/provider permits;
7. perform safe validation;
8. emit secret-free AuditEvent.

---

## Rotation failure

If new credential validation fails:

keep old valid credential active when safe.

Do not break a working connection before successful replacement.

---

## OAuth refresh coordination

Same Design-139 single-flight/locking rule remains mandatory.

---

## Disconnect

Design 140 may initiate disconnect.

Server should:

1. authorize;
2. verify expected revision;
3. determine current grant state;
4. disable future provider execution;
5. attempt external revocation where policy says so;
6. stop sync/webhook scheduling;
7. preserve IntegrationConnection history;
8. preserve downstream domain history;
9. emit AuditEvent.

---

## External revocation outcome unknown

If provider revocation request may have succeeded but confirmation is unavailable:

preserve:

```text
revocationState = UNKNOWN
```

where needed.

Do not claim definitive provider-side revocation.

---

## Webhook detail

Design 140 can expose:

* subscription state;
* expiry;
* last event received;
* verification health;
* renewal eligibility.

Do not expose webhook signing secrets.

---

## Webhook renewal

Should use idempotent provider-specific operation.

If provider returns a new subscription ID:

preserve lineage as needed.

---

## Sync detail

Display:

* last successful Run;
* current Run;
* last failure;
* cursor freshness;
* backlog if canonical.

Do not expose raw queue internals as business sync state.

---

## Retry sync

Conceptually:

```text
retryIntegrationSync(syncRunId / connectionCapability)
```

must preserve:

* exact connection;
* capability/source;
* cursor;
* previous run lineage;
* idempotency.

---

## Retry sync ≠ restart from zero

Unless explicit backfill/full-resync action exists.

---

## Full resync

If frozen Design 140 includes it, this is a high-impact separate action requiring:

* stronger permission;
* confirmation;
* bounded semantics;
* duplication protection.

Do not invent it if absent.

---

## ProviderEvent diagnostic summary

Can expose:

> last webhook event received 3 min ago
> 2 invalid-signature events rejected

if frozen design includes operational diagnostics and disclosure is safe.

---

## Invalid provider events

Must not mutate domain state.

---

## Dependency resolver

Conceptually:

```text
IntegrationDependencyResolver.resolve(connectionId)
```

may return safe references to:

* SendingAccounts;
* PublicationTargets;
* DistributionChannels;
* scheduled deliveries;
* Automation definitions.

---

## Dependency impact

Disconnect/credential loss may affect future executions.

It must not imply past executions are invalid.

---

## Dependency permission filtering

Absolute.

---

## Repair sequencing

Example:

```text
Authorization expired
      ↓
Reauthorize
      ↓
Health check
      ↓
Capabilities recomputed
      ↓
Sync may retry
```

Do not automatically retry every downstream failed Publication/Distribution operation after reauthorization.

Each domain decides retry safety.

---

## Design 136 operational attention

Once Design 140 confirms recovery:

Integration-derived attention projection can resolve.

No manual Command Center `resolved=true` needed.

---

## Design 138 Audit

Material Design-140 actions should audit:

* reauthorization initiated/completed;
* credential rotated;
* configuration changed;
* webhook renewed;
* connection disabled/disconnected.

Routine health checks and sync polling should generally remain operational telemetry unless governance requires otherwise.

---

## Design 141/142 Automation

Automation failures caused by connection problems should retain both:

```text
AutomationRun failure
IntegrationConnection health issue
```

Do not merge them.

After repair, Automation retry remains a separate Automation command.

---

## Design 147 Incident

If many integrations fail because of one provider/global platform event:

Incident service may correlate them.

Design 140 still reports each exact connection's state.

---

## Query freshness

Detail should expose:

```text
connectionStateAsOf
authorizationCheckedAt
healthCheckedAt
syncUpdatedAt
webhookCheckedAt
```

where relevant.

One generic:

> Last updated

is insufficient.

---

## Idempotency

Required for:

* reauthorization completion;
* credential rotation;
* health check triggers;
* webhook renewal;
* sync retry;
* disconnect/revocation.

---

## Optimistic concurrency

Required for:

* configuration;
* credential changes;
* capability enabling/disabling;
* disconnect;
* account relink.

---

## Account relink concurrency

Two admins must not relink one connection to two different external accounts concurrently.

---

## Rate limiting

Manual health checks, reauthorization attempts, sync retries, webhook renewals should have appropriate rate limits.

---

## Caching

Connection Detail cache should vary by:

```text
organizationMembershipId
authorizationRevision
connectionRevision
providerDefinitionRevision
externalAccountRevision
authorizationGrantRevision
credentialMetadataRevision
capabilityRevision
healthRevision
syncRevision
webhookRevision
dependencyRevision
```

---

## Never cache decrypted credentials

Absolute.

---

## Health history pagination

If many observations exist:

use bounded history/cursor pagination.

Do not load years of health checks at once.

---

## Performance

Use:

* locally maintained connection projection;
* precomputed current health;
* compact recent observations;
* lazy diagnostics;
* lazy dependency details;
* background provider checks.

Avoid synchronous provider fan-out on initial render.

---

## Partial failure contract

Example:

```text
Connection core       ✓
Authorization         ✓
Health observations   ✓
Sync service          ✕
```

Correct:

> Connection is authorized and currently healthy; synchronization status cannot presently be loaded.

Incorrect:

> Connection degraded.

Another:

```text
Authorization valid   ✓
Provider health check stale
```

Correct:

> Authorization valid. Current provider health is unknown/stale.

Not:

> Healthy.

Another:

```text
Connection recovered  ✓
Historical Publication failed
```

Correct:

> Connection is healthy now; the historical failed Publication remains failed until Publishing explicitly retries/reconciles it.

Not:

> Publication fixed automatically.

---

## Backend Requirement Matrix

| Requirement                                             | Status                             |
| ------------------------------------------------------- | ---------------------------------- |
| Design 139 same IntegrationConnection identity          | **Critical**                       |
| No ConnectionDetail business entity                     | **Critical**                       |
| Connection/Authorization separation                     | **Critical**                       |
| Authorization/Credential separation                     | **Critical**                       |
| Credential/Health separation                            | **Critical**                       |
| Capability granted/enabled/healthy separation           | **Critical**                       |
| Health/Sync separation                                  | **Critical**                       |
| Health/Webhook separation                               | **Critical**                       |
| Health/downstream execution separation                  | **Critical**                       |
| Timestamped HealthObservation history                   | **Critical**                       |
| Derived current health                                  | **Critical**                       |
| Health freshness                                        | **Critical**                       |
| Capability-specific health                              | **Critical architecture**          |
| Safe normalized diagnostics                             | **Critical**                       |
| Diagnostic/ApplicationLog separation                    | **Critical**                       |
| No raw provider errors/secrets in UI                    | **Critical**                       |
| Stable external account identity                        | **Critical**                       |
| Reauthorization account-identity verification           | **Critical**                       |
| Reauthorization/history preservation                    | **Critical**                       |
| Credential rotation atomicity                           | **Critical**                       |
| Old credential preservation on failed rotation          | **Critical**                       |
| Concurrent refresh/rotation protection                  | **Critical**                       |
| Manual health check non-destructive                     | **Critical**                       |
| Manual check rate limiting/single-flight                | **Critical**                       |
| Disconnect/history preservation                         | **Critical**                       |
| External revocation outcome-unknown support             | **Critical**                       |
| Webhook subscription/auth separation                    | **Critical**                       |
| Webhook renewal idempotency                             | **Critical**                       |
| SyncRun/connection separation                           | **Critical**                       |
| Retry sync/full resync separation                       | **Critical if full resync exists** |
| ProviderEvent/DomainEvent separation                    | **Critical**                       |
| Downstream dependency projection only                   | **Critical**                       |
| Dependency permission filtering                         | **Critical**                       |
| No automatic downstream retry after connection recovery | **Critical**                       |
| Design 136 attention reuse                              | **Critical architecture**          |
| Design 138 secret-safe Audit reuse                      | **Critical**                       |
| Designs 141–142 Automation separation                   | **Critical architecture**          |
| Design 147 Incident separation                          | **Critical architecture**          |
| Direct ID reauthorization                               | **Critical**                       |
| Cross-tenant isolation                                  | **Critical**                       |
| Idempotency                                             | **Critical**                       |
| Optimistic concurrency                                  | **Critical**                       |
| Authorization-aware caching                             | **Critical**                       |
| No decrypted-secret caching                             | **Critical**                       |
| Partial dependency failure handling                     | **Critical**                       |

---

# 8. Consolidation

Design 140's biggest danger is turning connection diagnostics into one mutable `"status/error"` record that mixes authorization, credentials, provider health, sync failures, webhook failures, and downstream application failures.

**Design 139 / Design 140 connection duplication**
Collection and detail use different connection identities.

**IntegrationConnection / Detail entity conflation**
UI projection becomes connection authority.

**Connection lifecycle / authorization conflation**
Expired grant appears disconnected.

**Authorization / credential conflation**
Token rotation changes business connection identity.

**Credential expiry / provider health conflation**
Authentication problem appears provider outage.

**Credential valid / connection healthy conflation**
Reachability/config problems are hidden.

**Authorization valid / capability granted conflation**
Missing provider scope is ignored.

**Capability granted / internally enabled conflation**
Provider permission automatically activates product functionality.

**Capability enabled / capability healthy conflation**
Broken provider operation appears available.

**Capability health / overall health conflation**
One broken feature disables unrelated features.

**Connection health / Sync state conflation**
Processing failure looks like provider failure.

**Connection health / Webhook state conflation**
Expired webhook appears OAuth failure.

**Connection health / Publication execution conflation**
Invalid content payload looks like provider outage.

**Connection health / Distribution execution conflation**
Campaign error looks like broken Integration.

**Health observation / mutable health boolean conflation**
Historical diagnostics disappear.

**Health freshness / health state conflation**
Stale green status appears current.

**Unknown health / Healthy conflation**
Lack of evidence becomes success.

**Rate limited / revoked conflation**
Temporary quota issue causes reauthorization unnecessarily.

**External account unavailable / deleted conflation**
Permission/provider outage is treated as permanent deletion.

**Provider display name / account identity conflation**
Renames alter lineage.

**Reauthorization / account relink conflation**
Different external account silently takes over old history.

**Reconnect / repair all downstream domains conflation**
Connection recovery marks Publications/Automations fixed automatically.

**Credential rotate / reveal credential conflation**
Admin UI exposes secrets.

**Vault reference / credential secret conflation**
Internal secret locator leaks.

**Diagnostic details / raw logs conflation**
Sensitive provider payloads appear in product UI.

**Diagnostic observation / AuditEvent conflation**
Routine provider failures flood compliance evidence.

**Health check / real provider operation conflation**
Connectivity test sends email/posts/pays.

**Manual health check / unlimited provider polling conflation**
Operators cause rate-limit incidents.

**Webhook expiry / OAuth expiry conflation**
Wrong repair action appears.

**Webhook subscription / ProviderEvent conflation**
Registration and event evidence merge.

**ProviderEvent / DomainEvent conflation**
Unverified external input mutates internal state.

**SyncRun / connection state conflation**
One processing error marks connection broken.

**Sync retry / reauthorization conflation**
Unnecessary auth flow is initiated.

**Sync retry / full resync conflation**
Safe retry becomes expensive/destructive re-import.

**Sync cursor / health state conflation**
Cursor corruption appears provider outage.

**Dependency relationship / ownership conflation**
Integration Detail starts editing PublicationTargets/Channels/SendingAccounts.

**Downstream failed operation / connection failure conflation**
Historical business failures are rewritten after repair.

**OperationalAttentionItem / connection health conflation**
Design 136 becomes the health source.

**Incident / degraded connection conflation**
Design 147 and Integration lifecycle fork.

**AutomationRun failure / Integration health conflation**
Automation state disappears.

**AuditEvent / health history conflation**
Compliance store becomes diagnostics database.

**Generic `status=error`**
Cannot explain authorization vs health vs sync vs webhook vs downstream failure.

**Generic `last_error`**
Loses history and may leak secrets.

**Generic `last_checked_at`**
No distinction among auth/health/sync/webhook freshness.

**Generic `repair()` action**
Unsafe cross-provider behavior.

**Generic `reconnect()`**
May switch account identity silently.

**Generic `test connection` with write action**
Can cause real external side effects.

**Generic `tokenExpiresAt` as authorization state**
OAuth/provider semantics are oversimplified.

**140/092 duplicate mailbox diagnostics**
Email connection health forks.

**140/124–129 duplicate provider execution diagnostics**
Publishing/Distribution errors become Integration state.

**140/134 duplicate report-delivery failure state**
Transport failure becomes connection failure.

**140/136 duplicate operational issue state**
Command Center and Integration Detail disagree.

**140/138 duplicate Audit/health evidence**
Governance and diagnostics merge.

**140/141–142 duplicate Automation failures**
Automation and provider health fork.

**140/147 duplicate Incident lifecycle**
Provider degradation creates second Incident system.

No additional screen is required.

These are **single exact IntegrationConnection identity, independent authorization/credential/capability/health/sync/webhook state, timestamped health evidence, safe diagnostics, account-identity-safe reauthorization, targeted repair commands, and strict downstream/Audit/Automation/Incident boundaries**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL INTEGRATIONCONNECTION DETAIL, AUTHORIZATION, CAPABILITY-HEALTH & SAFE-REPAIR ANCHOR**

**Domain directive:**
**IntegrationConnection ≠ ExternalAccountIdentity ≠ AuthorizationGrant ≠ CredentialReference ≠ ConnectionCapability ≠ ConnectionHealthObservation ≠ CurrentConnectionHealth ≠ CapabilityHealth ≠ SyncRun ≠ SyncCursor ≠ WebhookSubscription ≠ ProviderEvent ≠ DiagnosticObservation ≠ ConnectionRepairAttempt ≠ DomainExecution ≠ Incident.**

**Foundation directive:**
Design 139 remains the single canonical IntegrationConnection foundation. Design 140 opens one exact connection and provides deeper evidence/diagnostics rather than creating a separate Detail entity or state machine.

**Identity directive:**
the exact provider-side account/property/workspace identity remains explicit throughout Design 140 so repair actions cannot accidentally target the wrong provider account.

**External-account directive:**
stable provider IDs—not names or handles—anchor connection identity. Provider renames never rewrite connection or historical domain lineage.

**Connection directive:**
IntegrationConnection lifecycle remains independent of authorization, credential validity, health, sync, webhook and downstream operation state.

**Authorization directive:**
expired/revoked authorization requires explicit reauthorization and never deletes the stable IntegrationConnection or historical data.

**Credential directive:**
raw access tokens, refresh tokens, API keys, client secrets and signing secrets remain entirely outside normal Detail queries and UI rendering.

**Credential-metadata directive:**
Design 140 may show credential type, expiry/rotation status and safe lifecycle metadata without exposing vault identifiers or raw material unnecessarily.

**Credential-rotation directive:**
credential replacement is atomic. A candidate replacement must not destroy a working credential before successful validation/storage.

**Refresh-concurrency directive:**
OAuth refresh/rotation uses lease/revision/single-flight controls so simultaneous workers cannot invalidate one another's credential chain.

**Capability directive:**
connector-supported, provider-granted, platform-enabled and currently healthy capability remain independent facts.

**Effective-capability directive:**
effective capability availability is derived rather than manually toggled into truth.

**Health directive:**
current Integration health is derived from timestamped `ConnectionHealthObservation`s under a governed freshness policy and is never a manually editable `isHealthy` field.

**Health-history directive:**
new health checks append/record evidence rather than overwriting the only previous health state.

**Freshness directive:**
Healthy-but-stale is never treated as confidently healthy. Stale or absent checks produce qualified/unknown state.

**Capability-health directive:**
Email, Calendar, Publishing, Analytics or other capabilities can have different current health without forcing all-or-nothing connection state.

**Diagnostic directive:**
provider-specific raw errors are normalized into safe platform failure classes suitable for operators. Raw authorization headers, credentials, sensitive provider payloads and stack traces remain outside the product-facing diagnostic model.

**Log directive:**
Integration diagnostics remain separate from application logs and observability traces.

**Manual-check directive:**
a user-triggered health check, if present in the frozen design, performs safe non-destructive verification and is rate-limited/coalesced to avoid provider abuse.

**No-destructive-test directive:**
routine "Test Connection" operations may never send real email, publish content, initiate payment, create placement or otherwise cause external business side effects solely to test connectivity.

**Reauthorization directive:**
reauthorization is bound to the existing Organization/IntegrationConnection/intended external account where possible and uses the same secure OAuth state/nonce/PKCE protections established by Design 139.

**Relink directive:**
if reauthorization returns a materially different external account/property, the system must not silently attach it to the old connection. Explicit relink/new-connection semantics are required.

**History directive:**
reauthorization, rotation, disablement, disconnect and repair never rewrite historical Messages, Meetings, Publications, Placements, payments, Reports, provider events or Audit evidence.

**Disconnect directive:**
disconnect disables future provider use while preserving the stable IntegrationConnection/history; external grant revocation status may remain separately confirmed or unknown.

**Unknown-revocation directive:**
uncertain provider-side revocation is represented as unknown rather than falsely reported as confirmed success/failure.

**Webhook directive:**
WebhookSubscription lifecycle, expiry, renewal and verification remain separate from OAuth authorization and connection health.

**Webhook-secret directive:**
webhook signing secrets are never displayed or persisted into Audit/diagnostic payloads.

**Provider-event directive:**
provider events remain authenticated, idempotent external evidence and never become internal DomainEvents before verification/normalization.

**Sync directive:**
SyncRun/SyncCursor remain separate from IntegrationConnection. A healthy provider connection may have a failed sync, and a failed sync does not automatically trigger reauthorization.

**Retry directive:**
retry sync, renew webhook, rotate credential, reauthorize connection and retry downstream Publication/Distribution/Automation are all separate commands.

**Full-resync directive:**
if the frozen system contains a full-resync operation, it must be separately permissioned/confirmed and cannot be treated as a normal retry.

**Dependency directive:**
Design 140 may project the SendingAccounts, PublicationTargets, DistributionChannels, scheduled deliveries or Automations that depend on the connection, but those downstream entities remain canonical in their own domains.

**Dependency-history directive:**
connection failure affects future/current execution capability, not the validity of historical downstream records already produced.

**No-auto-retry directive:**
successful connection repair never automatically retries every previously failed downstream operation. Each source domain determines whether retry/reconciliation is safe.

**Operations directive:**
Design 136 consumes derived Integration attention conditions and resolves them when canonical connection evidence recovers; Command Center triage state never overrides Integration truth.

**Audit directive:**
Design 138 records secret-free material administrative actions such as reauthorization, credential rotation, webhook/configuration change, disablement and disconnect. Routine health probes remain operational evidence unless explicitly audit-worthy.

**Automation directive:**
Designs 141–142 retain AutomationRun failure/retry state. A repaired Integration may make an Automation retry eligible but does not rewrite the failed AutomationRun.

**Incident directive:**
Design 147 remains canonical Incident authority. Provider or connection degradation can contribute evidence/impact to an Incident without turning every degraded connection into a duplicate Incident.

**Authorization directive:**
connection read, diagnostics read, health check, reauthorization, credential rotation, configuration, webhook renewal, sync retry, disablement and disconnect remain independently server-authorized.

**Tenant directive:**
connection, external account, authorization grant, credential reference, health observations, sync/webhook state and dependency projections remain strictly tenant scoped.

**Action directive:**
available repair actions are derived server-side from current connection evidence, source state, provider capability and current permissions. Frontend buttons are never authority.

**Current-state directive:**
every repair mutation re-reads the canonical connection revision/state before execution to prevent stale repair operations.

**Idempotency directive:**
reauthorization completion, credential rotation, manual health probes, webhook renewal, sync retry and disconnect/revocation are replay-safe.

**Concurrency directive:**
credential rotation, account relink, configuration change, reauthorization and disconnect use revision/lease/transaction controls.

**Rate-limit directive:**
operator-triggered health/repair operations observe provider and platform rate limits rather than allowing repeated button presses to create provider throttling.

**Caching directive:**
connection-detail caches are scoped by membership/authorization and connection/account/grant/capability/health/sync/webhook revisions; decrypted credential material is never stored in ordinary caches.

**Performance directive:**
Design 140 should load precomputed current health and compact recent history from local projections, using lazy deeper diagnostics and background provider checks instead of synchronous provider fan-out on every page open.

**Partial-failure directive:**
connection core, authorization, health, sync, webhook, dependencies and diagnostics may fail independently. `Unavailable` never becomes `Disconnected`, `Revoked`, `Healthy`, `No dependency`, `Sync failed`, or downstream business failure without evidence.

**Future-reuse directive:**
Design **141 — Automation / Workflow Runs Monitor** must reuse exact IntegrationConnection capability and health references when Automation executions depend on providers, but it must retain a separate canonical `AutomationRun` execution model. Automation run state, Integration health and source-domain outcomes may correlate but must never collapse into one generic automation/integration status.

**Overlap directive:**
Designs **092, 124–147** must preserve one continuous **IntegrationProviderDefinition → tenant-scoped IntegrationConnection → stable ExternalAccountIdentity → AuthorizationGrant/vault credential → effective capabilities → timestamped health evidence → sync/webhook/provider events → domain-specific executions → Design-136/141/147 operational projections**, while every layer retains its own source identity and lifecycle.

**Consolidation directive:**
**STANDARDIZE ONE INTEGRATION DETAIL & HEALTH FOUNDATION — DESIGN-139 EXACT INTEGRATIONCONNECTION IDENTITY + STABLE EXTERNAL ACCOUNT + SEPARATE AUTHORIZATION/CREDENTIAL/CAPABILITY STATE + APPEND/TIMESTAMPED CONNECTION HEALTH OBSERVATIONS + HEALTH FRESHNESS + CAPABILITY-SPECIFIC HEALTH + SAFE NORMALIZED DIAGNOSTICS + EXPLICIT SYNC/WEBHOOK STATE + ACCOUNT-IDENTITY-SAFE REAUTHORIZATION + ATOMIC CREDENTIAL ROTATION + TARGETED REPAIR COMMANDS + DOWNSTREAM DEPENDENCY PROJECTIONS + STRICT DESIGN-136/138/141/147 BOUNDARIES — AND NEVER ALLOW GENERIC `STATUS=ERROR`, `LAST_ERROR`, STALE HEALTH BADGES, RAW PROVIDER RESPONSES, SECRET REVEAL, GENERIC FIX/RECONNECT ACTIONS, HEALTH-CHECK SIDE EFFECTS, DOWNSTREAM AUTO-RETRY OR COMMAND-CENTER/INCIDENT STATE TO SUBSTITUTE FOR OR REWRITE CANONICAL CONNECTION, AUTHORIZATION, CREDENTIAL, CAPABILITY, HEALTH OR DOMAIN-EXECUTION TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **140 / 153** |
| **PASS**                                   |                        **140** |
| **STANDARDIZE decisions**                  |                        **138** |
| **Potential implementation-overlap flags** |                        **131** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**140 / 153 = 91.5% audited.**

### Canonical Integration Detail architecture after Design 140

```text
IntegrationConnection IC-20
          │
          ├── External Account
          ├── Authorization
          ├── Credential metadata
          ├── Capabilities
          │      │
          │      ├── Email
          │      ├── Calendar
          │      └── Analytics
          │
          ├── Health observations
          ├── Sync state
          ├── Webhook state
          └── Dependencies
                    │
                    ↓
           Current Health Resolver
                    │
              ┌─────┼─────┐
              ↓     ↓     ↓
           Healthy Degraded Unknown
                    │
                    ↓
              Safe repair action
```

The strongest health rule is now explicit:

```text
Connection:
CONNECTED

Authorization:
VALID

Credential:
VALID

Publishing:
HEALTHY

Analytics:
MISSING_SCOPE

Webhook:
EXPIRED

Sync:
FAILED

This is a valid state.

It cannot be represented safely by:

status = "ERROR"
```

Reauthorization also preserves provider identity:

```text
IC-20 currently linked to:

LinkedIn Page A

User starts reauthorization.

Provider callback returns:

LinkedIn Page B


CORRECT:

Do not silently replace Page A.

Require explicit relink/new
connection semantics.


INCORRECT:

IC-20 now points to Page B
while all historical executions
still appear to belong to IC-20.
```

Connection repair does not rewrite business failures:

```text
Yesterday:
Publication PA-40 failed
because authorization expired.

Today:
Connection reauthorized successfully.

RESULT:

Integration = healthy

BUT:

PA-40 remains failed/history.

Publishing must explicitly
decide whether PA-40 is safe
to retry.

Connection repair
        ≠
business execution repair.
```

And diagnostics remain safe:

```text
Operator sees:

Authorization revoked
Provider rejected current grant
Reauthorization required

Operator does NOT see:

access_token
refresh_token
client_secret
raw Authorization headers
full provider payloads
```

## Next Sequential Audit Target

### **Design 141 — Automation / Workflow Runs Monitor**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
