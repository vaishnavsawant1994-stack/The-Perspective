# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 146 — API Keys / Webhooks / Developer Access

Design 146 should become the **canonical Team Workspace machine-access, API credential, service-principal, permission-scope, developer webhook subscription, webhook signing, delivery-history, credential rotation/revocation, and developer-access governance surface** for external systems integrating with the platform.

Its core architectural responsibility is to prevent three dangerous conflations:

> **API credential ≠ human User.**
> **API key record ≠ secret key value.**
> **Developer webhook ≠ provider Integration webhook.**

Design 146 should answer:

> **“Which external systems have programmatic access to this Organization, which stable machine principal is acting, which exact API credentials authenticate it, what permissions/scopes are granted, when credentials expire or were last used, which webhooks receive which external event types, how webhook deliveries are signed and retried, and how access can be rotated or revoked without impersonating a human or leaking secrets?”**

It must remain distinct from:

* Designs 037 / 144 — human RBAC administration;
* Design 145 — Organization / Workspace tenant administration;
* Designs 139–140 — external provider Integration connections and **provider → platform** webhooks;
* Designs 141–142 — Automation Runs;
* Design 138 — Audit evidence;
* Design 143 — internal Alert/Notification delivery;
* Design 149 — platform-global configuration.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **User ≠ OrganizationMembership ≠ ServicePrincipal/DeveloperPrincipal ≠ ApiCredential ≠ ApiCredentialSecretVersion ≠ ApiPermissionGrant ≠ APIRequest ≠ WebhookSubscription ≠ WebhookEndpoint ≠ WebhookSigningSecret ≠ WebhookEvent ≠ WebhookDelivery ≠ WebhookDeliveryAttempt ≠ ProviderWebhookSubscription ≠ ProviderEvent ≠ DomainEvent ≠ AuditEvent.**

The central implementation rule is:

> **External machine access must execute under a stable tenant-scoped service/developer principal rather than impersonating the human who created the key. API secrets and webhook signing secrets are credential material, not retrievable business data. API authorization must reuse canonical Permission semantics while remaining separate from human RoleAssignments. Outbound developer webhooks must emit versioned, permission-filtered external event projections after canonical transactions commit, and every retry must preserve the exact original event/payload lineage rather than regenerate it from current mutable state.**

---

# 1. Classification

| Audit field                           | Classification                                                                                                                                                         |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                         | **146**                                                                                                                                                                |
| **Canonical name**                    | **API Keys / Webhooks / Developer Access**                                                                                                                             |
| **Product area**                      | Team Workspace / Platform / Developer & Machine Access                                                                                                                 |
| **User surface**                      | **Authenticated Team Workspace**                                                                                                                                       |
| **Screen class**                      | Developer Access Administration / Machine Credential & Webhook Management Workspace                                                                                    |
| **Classification**                    | **Canonical Service-Principal, API Credential, Developer Permission & Outbound Webhook Governance Anchor**                                                             |
| **Primary purpose**                   | Create and govern machine identities, API credentials, API permission scopes, webhook event subscriptions, signing secrets, delivery attempts, rotation and revocation |
| **Tenant dependency**                 | Design 145                                                                                                                                                             |
| **Authorization dependency**          | Designs 037 / 144                                                                                                                                                      |
| **Audit dependency**                  | Designs 039 / 138                                                                                                                                                      |
| **Integration boundary**              | Designs 139–140                                                                                                                                                        |
| **Automation dependency**             | Designs 141–142 may invoke APIs or respond to developer events without becoming credential authority                                                                   |
| **Alert/Notification boundary**       | Design 143                                                                                                                                                             |
| **Canonical machine identity**        | `ServicePrincipal` / `DeveloperAccessPrincipal`                                                                                                                        |
| **API credential identity**           | `ApiCredential`                                                                                                                                                        |
| **API secret version**                | `ApiCredentialSecretVersion` / secure verifier metadata                                                                                                                |
| **API permission binding**            | `ServicePermissionGrant` / `ApiPermissionGrant`                                                                                                                        |
| **Developer webhook identity**        | `DeveloperWebhookSubscription`                                                                                                                                         |
| **Destination identity**              | `WebhookEndpoint`                                                                                                                                                      |
| **Signing-secret identity**           | secure `WebhookSigningSecretReference` / version                                                                                                                       |
| **External event schema**             | `WebhookEventTypeDefinition`                                                                                                                                           |
| **Logical emitted event**             | `WebhookEvent`                                                                                                                                                         |
| **Delivery identity**                 | `WebhookDelivery`                                                                                                                                                      |
| **Attempt identity**                  | `WebhookDeliveryAttempt`                                                                                                                                               |
| **API usage observation**             | separate API request/usage telemetry                                                                                                                                   |
| **Primary query service**             | `DeveloperAccessQueryService`                                                                                                                                          |
| **Service-principal service**         | `ServicePrincipalService`                                                                                                                                              |
| **API credential service**            | `ApiCredentialService`                                                                                                                                                 |
| **Developer authorization evaluator** | canonical Permission evaluator extended to machine principals                                                                                                          |
| **Webhook service**                   | `DeveloperWebhookService`                                                                                                                                              |
| **Webhook event registry**            | `WebhookEventTypeRegistry`                                                                                                                                             |
| **Webhook delivery service**          | `WebhookDeliveryService`                                                                                                                                               |
| **Secret service**                    | secure credential/vault infrastructure                                                                                                                                 |
| **Parent shell**                      | `InternalAppShell` — Design 001                                                                                                                                        |
| **Auth**                              | Required for administration                                                                                                                                            |
| **Runtime API authentication**        | Machine credential authentication                                                                                                                                      |
| **Authorization**                     | Organization-scoped machine grants + canonical resource authorization                                                                                                  |
| **Implementation priority**           | **Critical Security / External Access / Secret Protection / Tenant Isolation**                                                                                         |
| **Reuse level**                       | **Platform-wide across every externally exposed API/event capability**                                                                                                 |

Canonical architecture:

```text
ORGANIZATION
     │
     ↓
ServicePrincipal SP-20
     │
     ├── API Credential K-1
     │      └── secret/version
     │
     ├── API Credential K-2
     │      └── secret/version
     │
     ├── Permission Grants
     │
     └── Webhook Subscriptions
              │
              ↓
       External Endpoint
              │
              ↓
       Signed Webhook Events
```

---

# 2. Reuse

## Human authorization and machine authorization must share permission semantics, not identity

Design 144 established canonical `Permission` identities.

Those same stable capabilities can be reused where appropriate:

```text
project.read
report.read
publication.read
```

But this does **not** mean:

```text
API key
    ↓
RoleAssignment
    ↓
Human Role
```

is the correct model.

A machine credential should authenticate a **machine/service principal**, not pretend to be an employee.

---

## ServicePrincipal ≠ User

Critical.

Bad:

```text
API key belongs to User U-20.

Every API request executes forever
as U-20.
```

This breaks when:

* U-20 leaves the company;
* U-20 changes Roles;
* the Integration is actually organization-owned;
* Audit needs to distinguish human vs machine action.

Correct:

```text
Organization O-10
    ↓
ServicePrincipal SP-20
    ↓
API Credential K-5
```

Human creator:

```text
createdByMembershipId = OM-7
```

is administrative provenance.

It is not runtime identity.

---

## ServicePrincipal ≠ OrganizationMembership

Absolute.

Machine integrations must not be inserted into:

* employee directories;
* Team workload analytics;
* HR/manager structures;
* ordinary TeamMembership.

---

## ServicePrincipal ≠ RoleAssignment

Machine access can reuse Permission keys and scope semantics, but machine grants should remain independently identifiable.

This prevents:

> API integration appears as a human Admin Role assignment.

---

## API Credential ≠ ServicePrincipal

A stable service principal may have more than one credential.

This makes zero-downtime rotation possible:

```text
ServicePrincipal SP-20

Key K-1
old / being retired

Key K-2
new / active
```

without changing machine identity.

---

## API Credential ≠ secret value

One of the strongest Design-146 boundaries.

`ApiCredential` contains:

* ID;
* name/label;
* prefix/fingerprint;
* creation/expiry/revocation metadata;
* principal relationship.

The actual secret is credential material.

---

## Secret value should not be normal readable data

Correct:

```text
Create API key
      ↓
display secret once
      ↓
store secure verifier
      ↓
future UI:

pers_7D4A••••
Created Aug 23
Last used...
Expires...
```

Incorrect:

> Click eye icon and retrieve the stored raw API secret through normal API.

Unless an explicitly different secret architecture is frozen later, **rotate rather than reveal** is the safer canonical model.

---

## API permission ≠ API key itself

Do not store:

```text
apiKey = "admin-key"
```

and infer privileges from key type/name.

Authorization must resolve explicit grants.

---

## API scope ≠ human Role

A machine may have:

```text
lead.read
lead.create
```

without inheriting every Permission belonging to an internal Sales Role.

---

## API key label ≠ identity

Names like:

> Zapier Production
> Reporting API

are operator labels.

Stable IDs remain canonical.

---

## API key prefix ≠ authentication secret

A key prefix can safely identify which credential is being used.

It must not provide authentication itself.

---

## API request log ≠ AuditEvent

Critical.

Millions of API requests must not become millions of global Design-138 AuditEvents.

Separate:

### API request/usage telemetry

* endpoint/resource;
* response class;
* latency;
* principal;
* request ID;
* rate limits.

### Audit

Material administrative/security actions:

* key created;
* key rotated;
* scope changed;
* key revoked;
* webhook created;
* signing secret rotated.

---

## API use count ≠ developer authorization truth

`lastUsedAt` and usage count are observations.

They do not determine whether credential is authorized.

---

## Design 145 tenant model remains authoritative

Every ServicePrincipal belongs to:

```text
organizationId
```

and, only if Phase 3D establishes true subordinate Workspaces:

possibly a typed Workspace scope.

Developer access must never create another `developerAccount` tenant.

---

# Developer webhook boundary

## Developer webhook ≠ Integration provider webhook

This is critical.

### Designs 139–140

External provider sends events **into our platform**.

```text
Stripe / Google / LinkedIn
        ↓
The Perspective platform
```

### Design 146 developer webhook

Our platform sends approved events **to an external developer system**.

```text
The Perspective platform
        ↓
Customer/developer endpoint
```

These must not share one ambiguous:

```text
Webhook
```

entity without direction/type.

---

## `DeveloperWebhookSubscription` ≠ `ProviderWebhookSubscription`

Absolute.

They have different:

* trust models;
* authentication direction;
* retry semantics;
* payload contracts;
* signing responsibility;
* security threats.

---

## Internal DomainEvent ≠ external WebhookEvent

Critical.

Never expose raw internal DomainEvents directly to developers.

Instead:

```text
Canonical DomainEvent
       ↓
External event projection
       ↓
WebhookEvent
```

The public event contract should be:

* versioned;
* permission-filtered;
* minimized;
* stable.

---

## WebhookEvent ≠ WebhookDelivery

One logical external event may go to several subscriptions.

```text
WebhookEvent WE-20
    ├── Delivery D-1 → Endpoint A
    └── Delivery D-2 → Endpoint B
```

---

## WebhookDelivery ≠ WebhookDeliveryAttempt

One delivery intent can have several network attempts.

```text
Delivery D-1
   ├── Attempt 1 → timeout
   ├── Attempt 2 → HTTP 503
   └── Attempt 3 → HTTP 204
```

Still one logical event/destination delivery.

---

## Webhook retry ≠ new business event

Absolute.

Retries send the **same immutable event**.

They do not recreate today's version of the resource.

---

## HTTP 2xx ≠ subscriber business success

Correct:

> Endpoint acknowledged delivery.

Not:

> Customer system successfully processed the business event.

The remote system owns its own processing.

---

# 3. Entities

## ServicePrincipal / DeveloperAccessPrincipal

Canonical machine-access identity.

Conceptually:

```text
ServicePrincipal
├── id
├── organizationId
├── name
├── purpose
├── lifecycle
├── createdByMembershipId
├── createdAt
├── disabledAt?
├── authorizationRevision
└── revision
```

---

## Service-principal lifecycle

Conceptually:

```text
ACTIVE
DISABLED
ARCHIVED
```

Exact Phase 3D taxonomy later.

---

## Service principal disabled ≠ credentials deleted

Historical key/admin/API evidence remains.

Effective access becomes unavailable.

---

## ApiCredential

Conceptually:

```text
ApiCredential
├── id
├── servicePrincipalId
├── displayName
├── keyPrefix
├── fingerprint?
├── lifecycle
├── createdAt
├── createdByMembershipId
├── expiresAt?
├── revokedAt?
├── lastUsedAt?   ← derived/observed
└── revision
```

---

## ApiCredentialSecretVersion

Credential secret/version metadata.

Conceptually:

```text
ApiCredentialSecretVersion
├── credentialId
├── version
├── secureVerifier
├── createdAt
├── validFrom
├── expiresAt?
├── revokedAt?
└── state
```

The plaintext API secret is not stored as normal retrievable application data.

---

## Generated key requirements

Keys should be:

* cryptographically random;
* high entropy;
* non-guessable;
* clearly prefixed/versioned for operational identification.

---

## Key lookup

A safe design can use:

```text
public prefix / credential ID
        +
secret component
```

to efficiently locate the secure verifier without storing plaintext.

---

## Secret comparison

Authentication uses secure constant-time verification.

---

## API key only shown once

Preferred model:

```text
Create
 ↓
show secret
 ↓
user copies it
 ↓
dialog closes
 ↓
secret cannot be retrieved again
```

Later:

> rotate/create replacement.

---

## API key expiry

Expiry should be first-class.

```text
expiresAt
```

is different from revocation.

---

## Expired ≠ Revoked

Permanent.

---

## Dormant ≠ Revoked

A key not used recently remains active unless policy says otherwise.

Do not disable based solely on last-used UI inference.

---

## Rotation ≠ Revocation

Critical.

### Rotation

Replace credential safely.

### Revocation

Make credential unusable.

A rotation may temporarily allow old/new versions together only if an explicit grace policy exists.

Do not silently introduce grace periods.

---

## ServicePermissionGrant

Machine authorization binding.

Conceptually:

```text
ServicePermissionGrant
├── id
├── servicePrincipalId
├── permissionId
├── authorizationScope
├── grantedByMembershipId
├── grantedAt
├── expiresAt?
└── revision
```

---

## Machine grants reuse Permission Registry

Design 144 remains authority for canonical Permission definitions.

Do not create:

```text
API_SCOPE_LEADS_READ
```

if canonical:

```text
lead.read
```

already expresses the same business capability.

Developer-specific technical permissions can still have their own stable keys where genuinely different.

---

## Machine grant ≠ human RoleAssignment

Permanent.

---

## Delegation ceiling applies

A human administrator creating developer access cannot grant machine privileges beyond their authorized delegation policy.

This prevents:

> low-privilege admin creates full-admin API key.

---

## Developer-access scope

Uses the same typed Organization/resource scope architecture established by Design 144.

Never free-form:

```text
scope = {"whatever":"*"}
```

---

## WebhookEventTypeDefinition

Canonical public event contract registry.

Conceptually:

```text
WebhookEventTypeDefinition
├── eventTypeKey
├── schemaVersion
├── sourceDomain
├── minimumPermission
├── payloadSchema
├── sensitivityClass
├── lifecycle
└── description
```

Examples should only be added during Phase 3D from actual supported frozen product events.

---

## Event type key ≠ internal class name

Stable external contracts should not expose framework implementation names.

---

## Event schema version

Critical.

Webhook consumers may depend on payload contracts for years.

---

## WebhookSubscription

Conceptually:

```text
DeveloperWebhookSubscription
├── id
├── organizationId
├── servicePrincipalId?
├── endpointId
├── subscribedEventTypes
├── lifecycle
├── configurationRevision
├── createdBy
└── revision
```

---

## WebhookEndpoint

Conceptually:

```text
WebhookEndpoint
├── id
├── subscriptionId / principal context
├── destinationUrl
├── verificationState?
├── createdAt
├── updatedAt
└── revision
```

---

## Endpoint URL ≠ endpoint identity

Changing URL does not need to rewrite historical Delivery records.

Each delivery preserves the destination/configuration used for that attempt lineage.

---

## WebhookSigningSecret

Credential material.

Same security principles as API keys:

* generated securely;
* stored protected;
* versioned;
* never included in logs/Audit;
* rotation explicit.

---

## Signing secret version

A Delivery should know which signing-secret version was used so external verification failures are diagnosable without exposing the secret.

---

## WebhookEvent

Immutable external event projection.

Conceptually:

```text
WebhookEvent
├── id
├── organizationId
├── eventType
├── schemaVersion
├── sourceReference
├── sourceVersionReference?
├── occurredAt
├── createdAt
├── payloadSnapshot
└── causationReference
```

---

## Payload snapshot must be immutable

Critical.

If Client name changes tomorrow:

retrying yesterday's webhook must not silently generate a different payload.

---

## Webhook payload ≠ full canonical entity dump

Absolute.

Use deliberately designed external schemas.

---

## WebhookDelivery

Logical event/subscription delivery.

Conceptually:

```text
WebhookDelivery
├── id
├── webhookEventId
├── subscriptionId
├── subscriptionRevision/config snapshot
├── endpointSnapshot
├── signingSecretVersion
├── deliveryState
├── nextRetryAt?
└── revision
```

---

## WebhookDeliveryAttempt

Append-oriented network attempt.

Conceptually:

```text
WebhookDeliveryAttempt
├── id
├── webhookDeliveryId
├── attemptNumber
├── startedAt
├── completedAt?
├── responseStatus?
├── outcome
├── safeFailureClass?
└── duration?
```

Never store response credentials/sensitive payloads indiscriminately.

---

# 4. Permissions

Design 146 should conceptually distinguish:

```text
developerAccess.read

servicePrincipal.create
servicePrincipal.disable

apiCredential.readMetadata
apiCredential.create
apiCredential.rotate
apiCredential.revoke
apiCredential.managePermissions

developerWebhook.read
developerWebhook.create
developerWebhook.edit
developerWebhook.pause
developerWebhook.rotateSigningSecret

webhookDelivery.read
webhookDelivery.retry
```

Exact keys belong to Phase 3D.

---

## Read metadata ≠ read secret

Absolute.

There should normally be no ordinary:

```text
apiCredential.readSecret
```

permission.

---

## Create key ≠ grant arbitrary permissions

Critical.

---

## Rotate key ≠ modify permission grants

Permanent.

---

## Revoke key ≠ delete ServicePrincipal

Permanent.

---

## Disable principal ≠ delete historical API usage

Permanent.

---

## Webhook create ≠ API credential manage

Permanent.

---

## Webhook signing-secret rotation ≠ endpoint editing

Permanent.

---

## Delivery retry ≠ edit event payload

Absolute.

---

## Machine principal permission ≠ creator permission forever

Once created, ServicePrincipal authorization is its own explicit current policy.

It does not dynamically impersonate creator Roles.

---

## Creator deactivated

An organization-owned ServicePrincipal can remain active if Organization policy permits.

This must not require the former employee's account to remain active.

---

## Creator deactivated ≠ automatic machine privilege escalation

It also cannot inherit new permissions from the departed creator.

---

## API request authorization

Runtime request needs:

1. valid credential;
2. active ServicePrincipal;
3. correct Organization;
4. current machine Permission grants;
5. resource tenant match;
6. source-domain policy.

Authentication alone is insufficient.

---

## API key possession ≠ all-tenant access

Absolute.

---

## Cross-tenant key substitution prohibited

A key for Organization A must never access Organization B even if B resource IDs are known.

---

## Webhook event authorization

A subscription must only receive events for:

* its Organization;
* event types explicitly subscribed;
* data its machine principal/policy is authorized to receive.

---

## Permission revocation should affect future egress

If a webhook/service principal loses permission:

future WebhookEvents/deliveries requiring that permission must stop.

Do not continue sending sensitive data based on stale subscription configuration.

---

## Queued delivery revalidation

Before outbound egress, revalidate:

* subscription active;
* principal active;
* event type still allowed;
* current security policy where required.

Revocation must take effect promptly.

---

# 5. States

Design 146 must keep **ServicePrincipal lifecycle, API credential lifecycle, secret version state, permission-grant state, webhook subscription state, endpoint health/verification, WebhookEvent state, Delivery state, and Attempt state** separate.

### Service principal

```text
Active
Disabled
Archived
```

### API credential

```text
Active
Expiring
Expired
Revoked
```

### Secret rotation

```text
Current
Superseded
Revoked
Expired
```

### Webhook subscription

```text
Active
Paused
Disabled
Archived
```

### Endpoint configuration

```text
Valid
Invalid
Restricted
Unknown
```

### Delivery

```text
Queued
Delivering
Delivered
Retry Scheduled
Failed
Terminal Failure
Blocked
```

### Delivery attempt

```text
Pending
HTTP Acknowledged
Timeout
Transport Failure
Rejected
```

These must never collapse into:

```text
developer_access.status
```

---

## API key Active ≠ principal Active

A valid credential attached to a disabled principal must not authenticate effective access.

---

## Key expired ≠ principal disabled

Permanent.

---

## Key revoked ≠ ServicePrincipal deleted

Permanent.

---

## Secret rotated ≠ permissions changed

Permanent.

---

## Webhook paused ≠ deleted

Permanent.

---

## Endpoint unreachable ≠ subscription permission invalid

Permanent.

---

## Delivery failed ≠ WebhookEvent invalid

Permanent.

---

## HTTP 2xx ≠ subscriber business operation succeeded

Absolute.

It means the endpoint accepted the delivery contract.

---

## Timeout ≠ endpoint definitely did not receive event

Webhook delivery is generally **at-least-once**.

Retries may result in duplicate HTTP deliveries of the same logical event.

Receivers therefore require stable `eventId` deduplication.

---

## Delivery duplicate ≠ duplicate business event

Same `WebhookEvent.id` must remain stable across retries.

---

## Permission revoked ≠ historical WebhookEvent erased

Permanent.

Future egress stops; history remains.

---

## ServicePrincipal disabled ≠ prior Audit actions invalid

Permanent.

---

## State Coverage

Design 146 inherits Design 150 plus:

```text
Developer Access Loading
Developer Access Available
Developer Access Empty
Developer Access Restricted
Developer Access Partial
Developer Access Unavailable

Service Principal Active
Service Principal Disabled
Service Principal Archived

API Credential Active
API Credential Expiring
API Credential Expired
API Credential Revoked

Credential Secret Current
Credential Secret Superseded
Credential Secret Revoked

Permission Grant Active
Permission Grant Expired
Permission Grant Revoked
Permission Grant Restricted

Webhook Subscription Active
Webhook Subscription Paused
Webhook Subscription Disabled
Webhook Subscription Archived

Webhook Endpoint Valid
Webhook Endpoint Invalid
Webhook Endpoint Restricted
Webhook Endpoint Unknown

Webhook Event Ready
Webhook Event Restricted
Webhook Event Historical

Webhook Delivery Queued
Webhook Delivery Sending
Webhook Delivery Delivered
Webhook Delivery Retry Scheduled
Webhook Delivery Failed
Webhook Delivery Terminal Failure
Webhook Delivery Blocked

Webhook Attempt Acknowledged
Webhook Attempt Timeout
Webhook Attempt Transport Failure
Webhook Attempt Rejected

API Key Rotated Elsewhere
API Key Revoked Elsewhere
Permission Grants Changed Elsewhere
Principal Disabled Elsewhere
Webhook Updated Elsewhere
Signing Secret Rotated Elsewhere
Delivery Updated Elsewhere
Developer Access Projection Stale
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize:

```text
Developer access identity
↓
Service principal / key label
↓
Credential lifecycle
↓
Permissions / scope
↓
Last-used / expiry metadata
↓
Webhook subscriptions
↓
Endpoint / event types
↓
Delivery health
↓
Rotation / revocation actions
```

Only sections/actions actually present in frozen Design 146 should render.

---

## API key secret must receive one-time-display treatment

At creation, if the frozen design exposes the newly generated secret:

> Copy this key now. It will not be shown again.

Later list/detail views should show only safe identification metadata.

---

## Never use masked plaintext as proof of secure storage

UI:

```text
pers_••••••••
```

must represent a non-retrievable credential record—not a plaintext secret the frontend could simply request.

---

## Credential and principal should be visually distinct

Example:

> Reporting Integration
> Service principal: Active
> API key: Expires Oct 30

not one badge:

> Active.

---

## Permission scope should be explicit

Correct:

> Reports: Read
> Projects: Read
> Organization scope

not:

> Full API.

unless it truly has complete canonical permission coverage.

---

## High-risk grants should be clear

Machine Permissions such as:

* financial writes;
* Role administration;
* credential management;
* destructive operations;

should receive the same sensitivity awareness as Design 144.

---

## Webhook direction should be explicit

Avoid ambiguous:

> Webhook connected.

Prefer product terminology that communicates:

> Events sent to this endpoint.

This prevents confusion with Integration provider callbacks.

---

## Webhook delivery state and subscription state should remain separate

Correct:

> Subscription: Active
> Last delivery: Failed

not:

> Webhook: Failed.

---

## Delivery history

If present in frozen UI, each row should identify:

* event type;
* event ID;
* time;
* attempt/delivery state;
* destination;
* response class.

Never show signing secrets.

---

## Retry action

If present:

> Retry delivery

must mean:

> deliver the same immutable WebhookEvent again.

Not:

> regenerate event using current entity data.

---

## Tablet

Following Design 152:

* principal/key status remains top;
* grants stack by domain;
* webhook subscriptions become cards;
* delivery details collapse;
* rotate/revoke remain clearly separated.

---

## Mobile

Priority:

```text
Principal / credential
↓
Active / expired / revoked
↓
Permission scope
↓
Expiry / last used
↓
Webhook endpoint
↓
Subscription state
↓
Last delivery
↓
Allowed security action
```

Never expose secret material just to make mobile administration convenient.

---

## Accessibility

A key summary could communicate:

> API credential K-20 authenticates Reporting Integration service principal SP-4 for The Perspective Media Group. The credential is active and expires October 30. It grants report-read and project-read access at Organization scope. The secret itself is not retrievable. Revoking this key will stop future authentication using this credential but will not delete historical API actions.

A webhook summary could communicate:

> Developer webhook subscription WH-8 is active and sends selected approved events to the configured external HTTPS endpoint. The most recent delivery failed after three attempts. The underlying platform event remains valid. Retrying will resend the same event identifier and immutable payload.

where canonical data supports it.

---

# 7. Backend Requirements

## Canonical machine-access architecture

```text
External System
      │
      ↓
API Credential
      │
      ↓
ServicePrincipal
      │
      ↓
Organization
      │
      ↓
ServicePermissionGrants
      │
      ↓
AuthorizationEvaluator
      │
      ↓
Canonical Domain Service
```

Developer webhook architecture:

```text
Canonical domain transaction
        ↓
Transaction commits
        ↓
Domain/outbox event
        ↓
External Webhook Projection
        ↓
Immutable WebhookEvent
        ↓
Matching subscriptions
        ↓
WebhookDelivery
        ↓
DeliveryAttempt(s)
        ↓
External HTTPS endpoint
```

---

## API credential creation

Conceptually:

```text
createApiCredential(
    servicePrincipalId,
    name,
    expiresAt?,
    expectedAuthorizationContext,
    idempotencyKey
)
```

should:

1. authenticate administrator;
2. resolve current Organization;
3. authorize credential administration;
4. validate ServicePrincipal tenant;
5. generate cryptographically strong secret;
6. persist only safe verifier/hash and metadata;
7. return plaintext secret **once**;
8. increment relevant authorization/security revision;
9. emit secret-free AuditEvent.

---

## Plaintext secret must not appear in

* application logs;
* AuditEvents;
* telemetry;
* analytics;
* error traces;
* normal database fields;
* frontend state persisted after creation;
* support exports.

---

## API authentication

Conceptually:

```text
authenticateApiCredential(secret)
```

should:

1. parse safe key prefix/identifier;
2. load credential verifier;
3. constant-time verify secret;
4. ensure credential active/not expired/revoked;
5. ensure ServicePrincipal active;
6. resolve Organization;
7. resolve current machine grants;
8. continue to canonical authorization.

---

## Authentication ≠ authorization

Absolute.

---

## Rate limits

Apply independently from authorization.

Possible dimensions:

* credential;
* ServicePrincipal;
* Organization;
* endpoint/capability.

A `429` does not mean permission denied.

---

## API permission evaluation

Extend the canonical Design-144 evaluator to support a principal type such as:

```text
HumanMembershipPrincipal
ServicePrincipal
```

without merging them.

---

## Service-principal grant administration

Conceptually:

```text
updateServicePrincipalPermissions(
    principalId,
    proposedGrants,
    expectedRevision
)
```

must:

1. authorize current human administrator;
2. validate canonical Permission keys;
3. validate allowed machine-use permissions;
4. validate scope;
5. apply Design-144 delegation ceiling;
6. block privilege escalation;
7. commit;
8. invalidate access caches;
9. Audit.

---

## Not every human Permission should automatically be grantable to machines

Critical.

Some capabilities may require interactive human presence.

The Permission Registry should define:

```text
machineGrantAllowed
```

or an equivalent policy.

Examples of disallowed machine access belong to Phase 3D policy, not this audit.

---

## Key revocation

Conceptually:

```text
revokeApiCredential(
    credentialId,
    expectedRevision
)
```

should:

* be immediate for future authentication;
* invalidate relevant credential caches;
* preserve credential metadata/history;
* preserve ServicePrincipal;
* Audit.

---

## Key rotation

Recommended model:

```text
ServicePrincipal
   ↓
new ApiCredential / secret version
```

rather than mutating and revealing old secret.

If frozen UI has “Rotate”:

the backend must provide controlled replacement semantics.

---

## API request attribution

Every authenticated request should carry:

```text
principalType = SERVICE
servicePrincipalId
apiCredentialId
organizationId
requestId
```

where appropriate.

---

## Audit attribution

If API request performs an audit-worthy business mutation:

Design 138 should record:

> actor = ServicePrincipal SP-20

not:

> actor = employee who originally created K-5.

This is critical forensic integrity.

---

## API request telemetry

Keep separate from Audit.

Potential safe fields:

```text
principal
credential prefix/ID
request time
API operation
result class
latency
rate-limit state
```

Avoid sensitive request/response payload dumps.

---

# Webhook backend

## External event registry

One:

```text
WebhookEventTypeRegistry
```

should define:

* stable event key;
* schema version;
* source domain;
* required machine/event permission;
* allowed external payload fields;
* sensitivity;
* lifecycle.

---

## Internal event → external event projection

Never serialize raw internal event objects directly.

Use:

```text
WebhookExternalProjectionService
```

to construct a deliberate public payload.

---

## Permission filtering occurs before payload persistence

Critical.

Do not create a sensitive payload then hide fields in UI.

---

## Commit-before-webhook

A WebhookEvent representing:

> Project completed

must only be created after canonical Project completion commits.

Use transactional outbox/event publication.

Never send:

> completed

then roll back the Project transaction.

---

## WebhookEvent immutability

Once created:

```text
event ID
event type
schema version
payload snapshot
source reference
occurredAt
```

are immutable.

---

## Schema evolution

Historical events retain their original schema version.

A retry one year later does not silently change to the newest payload schema.

---

## Subscription creation

Conceptually:

```text
createWebhookSubscription(
    endpoint,
    eventTypes,
    principal/scope,
    idempotencyKey
)
```

must:

1. authorize administrator;
2. validate Organization;
3. validate HTTPS destination;
4. validate event types;
5. validate machine/data permission;
6. create signing secret securely;
7. persist secure verifier/reference;
8. create subscription;
9. Audit without secret.

---

## Webhook URL SSRF protection

This is a critical Design-146 backend requirement.

Outbound developer webhook URLs must prevent access to:

* localhost;
* loopback;
* private/internal network ranges;
* link-local ranges;
* cloud metadata endpoints;
* prohibited infrastructure addresses.

---

## DNS rebinding protection

Validate resolved destinations at delivery time, not only at subscription creation.

---

## Redirect handling

Webhook clients must not follow an apparently public URL redirect into a forbidden private/internal destination.

Redirect policy must revalidate destinations.

---

## HTTPS

Production developer webhook delivery should require HTTPS except any explicitly controlled development environment policy defined later.

Do not weaken production security for convenience.

---

## Endpoint verification / test

If the frozen Design 146 has a Test action:

send a dedicated non-business test event.

Do not create or alter a real Project/Payment/Publication just to test the webhook.

---

## Test event ≠ production event

Permanent.

---

## Signing

Webhook deliveries should include enough canonical metadata for recipients to validate:

* payload integrity;
* event ID;
* delivery timestamp;
* signing-secret version/context.

Exact header names/protocol belong to Phase 3D.

---

## Replay protection for consumers

Include a timestamp and stable event/delivery identifier so receivers can implement replay windows and deduplication.

---

## Webhook signing secret rotation

Conceptually:

```text
rotateWebhookSigningSecret(...)
```

must:

* authorize;
* generate new secret securely;
* version it;
* preserve historical delivery metadata;
* define exact activation/grace semantics;
* Audit without secret.

---

## Subscription changes

Changing:

* endpoint;
* subscribed event types;
* signing secret;

affects future delivery configuration.

Historical Delivery records preserve original config/version context.

---

## Automatic retry

Use versioned policy such as:

* exponential backoff;
* bounded attempts;
* terminal failure.

Exact intervals Phase 3D.

---

## Automatic retry always uses same event

Absolute.

---

## Delivery idempotency

A stable:

```text
webhookEventId
+
subscription/config revision
```

or equivalent uniquely identifies delivery intent.

---

## At-least-once semantics

Developer webhooks should assume duplicates are possible.

Receivers must deduplicate by stable event ID.

The platform should document that operational contract later.

---

## Delivery response

A successful HTTP acknowledgement means:

> Endpoint accepted the request.

It does not prove remote business processing succeeded.

---

## Delivery timeout

Unlike uncertain payment/publication side effects, webhook delivery itself can be retried under explicit at-least-once semantics because the receiver is expected to deduplicate the stable event ID.

Still preserve:

> Attempt 1 timed out.

Do not rewrite it.

---

## Manual redelivery

If present in frozen Design 146:

redelivering should preserve the same logical `WebhookEvent`.

If using updated endpoint/signing configuration intentionally, preserve that as new delivery/redelivery lineage rather than rewriting the old historical Delivery.

---

## Endpoint response bodies

Do not persist arbitrary remote response bodies.

They may contain:

* secrets;
* personal information;
* huge payloads.

Store only safe bounded diagnostics where necessary.

---

## Webhook disable/pause

Stopping future deliveries does not delete:

* Event history;
* Delivery history;
* canonical source-domain events.

---

## Permission revocation

If ServicePrincipal/event access is revoked:

future sensitive event egress stops immediately according to current policy.

Historical delivery history remains.

---

## Webhook event filter changes

Future events use current published subscription config.

Past events/deliveries retain the config revision that generated them.

---

## Integration provider webhook isolation

Design 139/140 inbound callbacks must use different handlers/models from Design-146 outbound developer webhooks.

Do not route both through a generic:

```text
/api/webhook
```

business abstraction with ambiguous trust direction.

Exact routes belong later, but the backend separation is mandatory.

---

## Automation interaction

Design 141/142 Automations may consume canonical source events or invoke public APIs through governed internal services.

They must never fetch API key secrets simply because Developer Access exists.

---

## Alert interaction

Design 143 can alert on:

* key expiring;
* repeated webhook delivery failures;

if explicit AlertRules are configured.

Alert acknowledgement does not rotate/revoke keys or fix webhook delivery.

---

## Audit integration

Design 138 should receive strong AuditEvents for:

* ServicePrincipal created/disabled;
* API credential created;
* credential rotated;
* credential revoked;
* machine permissions changed;
* webhook created/paused/disabled;
* endpoint changed;
* signing secret rotated;
* manual delivery retry if governance requires.

Secrets never appear.

---

## Revocation cache invalidation

API key or ServicePrincipal revocation must take effect promptly.

Do not allow a long-lived cached authentication result to preserve revoked access.

---

## Usage data freshness

`lastUsedAt` can be asynchronously updated.

Do not make API authentication transaction depend on analytics update success.

---

## Quotas ≠ authorization

Permanent.

---

## Idempotency

Required for:

* ServicePrincipal creation;
* API credential creation;
* rotation;
* revocation;
* permission grant changes;
* webhook creation;
* event publication;
* Delivery creation;
* manual retry/redelivery.

---

## Optimistic concurrency

Required for:

* machine permission changes;
* webhook endpoint changes;
* event subscriptions;
* secret rotation;
* principal disablement.

---

## Security concurrency

Critical races:

### Key revoked while request is authenticating

Current credential state must be revalidated under proper transaction/cache semantics.

### Principal disabled while several keys remain active

All keys become ineffective.

### Permission revoked while webhook queued

Delivery revalidates sensitive egress authorization.

### Endpoint changed while retries pending

Historical Delivery config remains explicit; no silent target switch.

### Signing secret rotated during delivery

Each Delivery/Attempt knows which valid signing-secret version it uses.

---

## Caching

Developer access caches should vary by:

```text
organizationId
servicePrincipalRevision
credentialRevision
authorizationRevision
permissionGrantRevision
webhookSubscriptionRevision
eventRegistryRevision
signingSecretRevision
```

---

## Never cache plaintext credentials

Absolute.

---

## Performance

Use:

* indexed key prefixes/credential IDs;
* cached ServicePrincipal permissions with revision invalidation;
* asynchronous last-used metrics;
* transactional outbox;
* queue-backed webhook delivery;
* indexed Delivery state/retry time;
* cursor pagination for delivery history.

---

## Partial failure contract

Example:

```text
ServicePrincipal     ✓
API Credential       ✓
Usage telemetry      ✕
```

Correct:

> Credential is active; recent usage information is unavailable.

Incorrect:

> Credential unused.

Another:

```text
Webhook event         ✓
Delivery history      ✓
External endpoint     unavailable
```

Correct:

> Event remains valid. Delivery failed and can follow retry policy.

Not:

> Source business event failed.

Another:

```text
Key metadata          ✓
Secret                intentionally unavailable
```

Correct:

> Secret cannot be retrieved; rotate the credential if a replacement is required.

Not:

> Credential data missing.

---

## Backend Requirement Matrix

| Requirement                                           | Status                      |
| ----------------------------------------------------- | --------------------------- |
| Design 145 canonical tenant binding                   | **Critical**                |
| Design 144 Permission Registry reuse                  | **Critical**                |
| Human User/ServicePrincipal separation                | **Critical**                |
| OrganizationMembership/ServicePrincipal separation    | **Critical**                |
| RoleAssignment/machine grant separation               | **Critical**                |
| ServicePrincipal/API credential separation            | **Critical**                |
| API credential/secret-value separation                | **Critical**                |
| Stable machine identity across rotation               | **Critical**                |
| High-entropy generated API secrets                    | **Critical**                |
| One-way secure credential verification                | **Critical**                |
| One-time secret display                               | **Critical default**        |
| No plaintext key retrieval                            | **Critical**                |
| Credential expiry/revocation separation               | **Critical**                |
| Rotation/revocation separation                        | **Critical**                |
| Machine permission/delegation ceiling                 | **Critical**                |
| Not all human Permissions machine-grantable           | **Critical architecture**   |
| Resource-scope tenant validation                      | **Critical**                |
| Immediate revocation/cache invalidation               | **Critical**                |
| Service-principal Audit attribution                   | **Critical**                |
| API request telemetry/Audit separation                | **Critical**                |
| API rate-limit/authorization separation               | **Critical**                |
| Developer webhook/provider webhook separation         | **Critical**                |
| Internal DomainEvent/external WebhookEvent separation | **Critical**                |
| Stable versioned external event registry              | **Critical**                |
| Permission-filtered payload projection                | **Critical**                |
| Commit-before-webhook/outbox semantics                | **Critical**                |
| Immutable webhook payload snapshot                    | **Critical**                |
| WebhookEvent/Delivery separation                      | **Critical**                |
| Delivery/Attempt separation                           | **Critical**                |
| Same event ID across retries                          | **Critical**                |
| At-least-once delivery semantics                      | **Critical**                |
| SSRF protection                                       | **Critical security**       |
| DNS rebinding protection                              | **Critical security**       |
| Redirect destination revalidation                     | **Critical security**       |
| HTTPS production delivery                             | **Critical security**       |
| Webhook signing-secret protection                     | **Critical**                |
| Signing-secret versioning/rotation                    | **Critical**                |
| Test event/business event separation                  | **Critical if test exists** |
| Bounded response diagnostics                          | **Critical**                |
| Subscription pause/history preservation               | **Critical**                |
| Permission revocation stops future egress             | **Critical**                |
| Queued-delivery authorization revalidation            | **Critical**                |
| Cross-tenant API access prohibited                    | **Critical**                |
| Cross-tenant webhook delivery prohibited              | **Critical**                |
| Optimistic concurrency                                | **Critical**                |
| Idempotency                                           | **Critical**                |
| Secret-safe Audit integration                         | **Critical**                |
| Partial dependency failure handling                   | **Critical**                |

---

# 8. Consolidation

Design 146 has extremely high security overlap because machine identities, human Roles, provider credentials, webhook credentials, Integration webhooks, Automation and Audit can easily collapse into generic `"API access"` infrastructure.

**API key / User conflation**
Machine actions impersonate a human employee forever.

**API key / OrganizationMembership conflation**
Machine integration appears in employee membership.

**ServicePrincipal / employee identity conflation**
Developer integration pollutes workforce analytics.

**API credential / ServicePrincipal conflation**
Rotation changes machine identity.

**Credential record / raw secret conflation**
Secret becomes ordinary retrievable data.

**Masked UI / secure secret storage conflation**
Frontend shows dots while backend still exposes plaintext.

**Key name / authorization identity conflation**
“Admin API Key” grants Admin implicitly.

**API scope / Role conflation**
Machine gets every Permission from human Role.

**Machine grant / RoleAssignment conflation**
Developer access becomes human RBAC record.

**Creator Role / machine runtime authority conflation**
Integration inherits creator privileges forever.

**Creator deactivation / ServicePrincipal disablement conflation**
Organization integration stops because employee left.

**Creator deactivation / privilege preservation conflation**
Machine impersonates former user's stale privileges.

**Key expiry / key revocation conflation**
Security history loses reason/state.

**Rotation / revocation conflation**
Zero-downtime replacement becomes destructive.

**Last used / active state conflation**
Dormant key appears revoked.

**API request log / AuditEvent conflation**
Compliance store floods.

**API usage / employee productivity conflation**
Machine request count becomes human performance data.

**Rate limit / authorization conflation**
429 appears permission failure.

**API key possession / tenant permission conflation**
Valid key accesses arbitrary Organization IDs.

**Workspace scope / Organization tenant conflation**
Developer key crosses tenant root.

**Developer webhook / provider webhook conflation**
Inbound and outbound trust models merge.

**ProviderEvent / WebhookEvent conflation**
External provider evidence gets re-emitted raw.

**DomainEvent / external WebhookEvent conflation**
Internal implementation becomes public API contract.

**Raw domain object / webhook payload conflation**
Sensitive/internal fields leak.

**Current source state / historical webhook payload conflation**
Retry sends different information.

**WebhookEvent / Delivery conflation**
One event duplicated per endpoint.

**Delivery / Attempt conflation**
Retry history disappears.

**Retry / new event conflation**
Subscriber processes business event multiple times as different identities.

**Timeout / new business event conflation**
Retry generates fresh payload/event ID.

**HTTP 2xx / remote business success conflation**
Platform claims subscriber processed event.

**Endpoint URL / WebhookSubscription identity conflation**
URL change rewrites history.

**Current endpoint / historical Delivery endpoint conflation**
Retry silently targets different receiver.

**Signing secret / endpoint config conflation**
Secret leaks through configuration payload.

**Webhook signing secret / API key conflation**
Different trust directions share credentials.

**Webhook secret rotation / subscription replacement conflation**
Historical delivery verification breaks.

**Test delivery / production event conflation**
Testing creates real business activity.

**Endpoint validation / SSRF-safe destination conflation**
Public URL redirects/resolves to internal infrastructure.

**Creation-time DNS validation / delivery-time safety conflation**
DNS rebinding bypasses SSRF protection.

**Webhook response body / diagnostic evidence conflation**
Remote secrets/payloads get persisted.

**Subscription paused / event deleted conflation**
Historical delivery evidence disappears.

**Subscription disabled / source event invalid conflation**
Business event history changes.

**Permission revoked / historical delivery deleted conflation**
Governance evidence disappears.

**Queued delivery / grandfathered authorization conflation**
Sensitive payload still egresses after access revocation.

**Webhook event type / internal class name conflation**
Refactors break developer contracts.

**Schema version / latest schema conflation**
Historical retries change payload shape.

**API key / IntegrationConnection conflation**
External developer calling our API becomes provider credential connection.

**Webhook endpoint / Integration provider account conflation**
Outbound developer delivery becomes provider Integration.

**Developer Access / AutomationRun conflation**
API key execution becomes generic Automation.

**API key scope / Alert recipient policy conflation**
Notification system mutates developer security.

**ServicePrincipal / API key secret conflation**
Audit actor disappears after rotation.

**Generic `api_keys` with plaintext `key` column**
Critical credential failure.

**Generic `scopes JSON`**
Bypasses canonical Permission Registry.

**Generic `is_admin` API key**
Bypasses Design 144.

**Generic `webhooks` table**
Conflates inbound provider and outbound developer webhooks.

**Generic `last_delivery_status`**
No Event/Delivery/Attempt lineage.

**Generic `payload JSON` regenerated on retry**
Historical event corruption.

**Generic `secret` field**
API/webhook credential leak.

**Generic `retry()`**
No distinction between Delivery retry and event regeneration.

**146/138 API logs → Audit duplication**
Governance and telemetry merge.

**146/139–140 webhook duplication**
Inbound provider and outbound developer lifecycle fork.

**146/141–142 Automation credential duplication**
Automations begin storing developer/API secrets.

**146/143 Notification delivery conflation**
Internal Notifications and developer event webhooks merge.

**146/144 human/machine RBAC conflation**
Service access becomes employee RoleAssignment.

**146/145 tenant duplication**
Developer account becomes second Organization hierarchy.

No additional screen is required.

These are **stable service-principal identity, non-retrievable credentials, machine-specific permission binding, tenant-safe API authentication, explicit webhook direction, immutable external event contracts, SSRF-safe delivery, signing/retry lineage, and strict Integration/Automation/Audit boundaries**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL SERVICE-PRINCIPAL, API CREDENTIAL, DEVELOPER PERMISSION & OUTBOUND WEBHOOK GOVERNANCE ANCHOR**

**Domain directive:**
**User ≠ OrganizationMembership ≠ ServicePrincipal ≠ ApiCredential ≠ ApiCredentialSecretVersion ≠ ServicePermissionGrant ≠ APIRequest ≠ DeveloperWebhookSubscription ≠ WebhookEndpoint ≠ WebhookSigningSecret ≠ WebhookEvent ≠ WebhookDelivery ≠ WebhookDeliveryAttempt ≠ ProviderWebhookSubscription ≠ ProviderEvent ≠ DomainEvent ≠ AuditEvent.**

**Tenant directive:**
every machine principal, API credential, Permission grant, webhook subscription, event and delivery belongs to the canonical Design-145 Organization tenant and cannot create a parallel developer tenant/account hierarchy.

**Workspace directive:**
if Phase 3D confirms true subordinate Workspaces, machine access may be explicitly Workspace-scoped while still remaining subordinate to the owning Organization. Otherwise no artificial Workspace credential boundary is created.

**Service-principal directive:**
external systems execute through stable organization-owned ServicePrincipals/DeveloperPrincipals rather than impersonating the human Membership that created the key.

**Human/machine directive:**
ServicePrincipals never become EmployeeProfiles, TeamMemberships, human OrganizationMemberships, workload identities or ordinary human RoleAssignments.

**Creator directive:**
`createdByMembershipId` records administration provenance only. The creator's changing/deactivated human Roles do not silently define runtime machine authority.

**Credential directive:**
ApiCredential authenticates a stable ServicePrincipal and remains separate from the secret material used to prove possession.

**Rotation-identity directive:**
credential rotation changes the credential/secret version without changing the underlying ServicePrincipal identity, preserving stable Audit attribution and downstream ownership.

**Secret directive:**
API key secrets are cryptographically strong and never stored or returned as normal readable product data.

**One-time-display directive:**
the canonical default is secret display at creation only; subsequent recovery uses credential rotation/replacement rather than ordinary secret retrieval.

**No-secret-leak directive:**
raw API secrets and webhook signing secrets never enter AuditEvents, application logs, analytics, Notification payloads, support exports, ordinary caches, or persistent frontend state.

**Authentication directive:**
valid key verification authenticates the ServicePrincipal but does not itself authorize access to any business resource.

**Authorization directive:**
machine requests reuse the canonical Design-144 Permission Registry, typed scopes, tenant checks, and server-side authorization evaluator while maintaining independent machine Permission grants rather than human RoleAssignments.

**Machine-permission directive:**
the Permission Registry must identify which permissions are valid for machine delegation; not every human capability is automatically available to API principals.

**Delegation directive:**
the human administrator creating or editing machine access cannot grant Permissions beyond the Design-144 delegation/escalation policy.

**Scope directive:**
machine permissions use canonical typed Organization/resource scopes and never arbitrary frontend JSON, wildcard strings, route prefixes or user-supplied tenant IDs.

**Revocation directive:**
credential revocation immediately blocks future authentication while preserving ServicePrincipal, historical API activity and Audit evidence.

**Principal-disable directive:**
disabling a ServicePrincipal renders all of its credentials ineffective without destroying historical credentials, requests, events or Audit lineage.

**Expiry directive:**
credential expiry, revocation, rotation and ServicePrincipal disablement remain independently modeled lifecycle facts.

**Rate-limit directive:**
API rate limiting/quota state remains separate from authentication and authorization; throttling never means access was revoked.

**API-telemetry directive:**
high-volume API request/usage observations remain separate from Design-138 AuditEvents.

**API-Audit directive:**
audit-worthy mutations performed through the API attribute the actor to the exact ServicePrincipal/machine identity, never falsely to the human employee who originally created the credential.

**Integration-boundary directive:**
Designs 139–140 remain credentials/connections for external providers that **our platform calls or receives callbacks from**. Design 146 machine access represents external systems calling **our platform** and receiving developer events.

**Webhook-direction directive:**
developer outbound subscriptions and Integration provider inbound webhook subscriptions remain explicitly different entity types/trust directions.

**External-event directive:**
internal DomainEvents are never exposed directly. A versioned `WebhookEventTypeRegistry` defines stable permission-filtered public event contracts.

**Commit directive:**
WebhookEvents are emitted only after canonical business transactions commit, using durable outbox/event orchestration so external systems never receive uncommitted state.

**Payload directive:**
WebhookEvent payloads are deliberately minimized, schema-validated external projections rather than raw canonical entity or DomainEvent dumps.

**Payload-immutability directive:**
each WebhookEvent stores/pins the exact external payload and schema version used for that event; source edits later cannot rewrite historical webhook content.

**Event/version directive:**
webhook schema evolution affects future events only. Historical retries preserve original event type/schema/payload.

**Delivery directive:**
WebhookEvent, WebhookDelivery and WebhookDeliveryAttempt remain distinct so one logical event can safely target multiple subscriptions and produce multiple transport attempts.

**Retry directive:**
automatic/manual Delivery retries resend the same immutable WebhookEvent identity rather than generating a new business event.

**At-least-once directive:**
developer webhook transport must assume duplicate HTTP deliveries are possible; stable event IDs allow external consumers to deduplicate.

**Acknowledgement directive:**
a successful HTTP response means the external endpoint acknowledged receipt, not that the receiver completed its downstream business processing.

**Endpoint-security directive:**
outbound webhook URLs undergo HTTPS policy, SSRF protection, prohibited-address checks, DNS-rebinding protection, and redirect destination revalidation before network egress.

**Test directive:**
if frozen Design 146 exposes Test Webhook, it sends a dedicated non-business test event and never creates/mutates real source-domain records to test connectivity.

**Signing directive:**
Webhook payloads are signed with protected versioned signing secrets sufficient for recipients to verify authenticity/integrity and implement timestamp/replay protections.

**Signing-rotation directive:**
signing-secret rotation preserves historical secret-version metadata needed to explain deliveries without exposing secret material.

**Subscription directive:**
WebhookSubscription lifecycle/configuration affects future events/deliveries and never deletes historical WebhookEvents or DeliveryAttempts.

**Endpoint-change directive:**
historical Delivery records preserve the endpoint/config revision actually used. Updating an endpoint never silently rewrites prior delivery history.

**Egress-authorization directive:**
before sensitive webhook delivery, the backend verifies current Organization, subscription, ServicePrincipal and event-access policy so revoked access does not continue to exfiltrate queued data.

**Response-data directive:**
remote webhook response bodies are not stored indiscriminately; diagnostics are bounded and secret-safe.

**Automation directive:**
Designs 141–142 may interact with canonical APIs/events but cannot retrieve or store Developer API secrets as Automation runtime state.

**Alert directive:**
Design 143 may alert on credential expiry or delivery failures, but Alert acknowledgement cannot rotate credentials, grant permissions or mark webhook delivery successful.

**Audit directive:**
Design 138 records material developer-security changes—principal creation/disablement, key creation/rotation/revocation, permission changes, webhook configuration/signing-secret changes—without secret contents.

**Authorization-revision directive:**
credential, principal and machine Permission changes invalidate authentication/authorization caches promptly so revoked developer access cannot survive in stale server state.

**Concurrency directive:**
key revocation/rotation, principal disablement, permission changes, webhook configuration, signing-secret rotation and queued deliveries use revision/transaction protections against race-based access leakage.

**Idempotency directive:**
principal/key creation, key rotation/revocation, event publication, subscription creation, Delivery creation and retry/redelivery actions use stable idempotency identities.

**API-cache directive:**
machine authorization caches are keyed by Organization, ServicePrincipal, credential and authorization revisions and fail closed on security uncertainty.

**Secret-cache directive:**
plaintext credentials/signing secrets are never placed in ordinary long-lived application caches.

**Performance directive:**
use indexed credential prefixes, revision-aware machine authorization caches, asynchronous API usage aggregation, transactional outbox event creation, queue-backed webhook transport, retry indexes and cursor-paginated Delivery history.

**Partial-failure directive:**
credential metadata, machine authorization, usage telemetry, webhook event storage, Delivery workers and destination availability may fail independently. `Unavailable` can never become `Revoked`, `Unused`, `Delivered`, `No permissions`, `Source event failed`, or `Safe to expose secret` without evidence.

**Future-reuse directive:**
Design **147 — System Health / Status & Incident Management** may consume Developer API/webhook infrastructure health, elevated delivery-failure rates, authentication-service outages, queue failures and other platform reliability signals as Incident evidence, but it must not treat individual API keys/WebhookDeliveries as the Incident lifecycle itself.

**Overlap directive:**
Designs **037, 138–149** must preserve one continuous **canonical Organization → stable ServicePrincipal → non-retrievable ApiCredential → explicit machine Permission grants → server authorization → canonical domain command**, and one separate **committed canonical source event → permission-filtered external WebhookEvent → Subscription → Delivery → Attempt** chain, while human Roles, provider Integrations, Automations, Alerts, Audit and Incidents retain independent canonical identities.

**Consolidation directive:**
**STANDARDIZE ONE DEVELOPER & MACHINE ACCESS FOUNDATION — DESIGN-145 CANONICAL TENANT CONTEXT + STABLE ORGANIZATION-OWNED SERVICEPRINCIPAL + NON-RETRIEVABLE VERSIONED API CREDENTIALS + DESIGN-144 PERMISSION-REGISTRY/DELEGATION REUSE + MACHINE-SPECIFIC GRANTS + IMMEDIATE REVOCATION + EXPLICIT INBOUND-PROVIDER/OUTBOUND-DEVELOPER WEBHOOK SEPARATION + VERSIONED PUBLIC EVENT REGISTRY + COMMIT-AFTER-OUTBOX EMISSION + IMMUTABLE WEBHOOK EVENT PAYLOADS + EVENT/DELIVERY/ATTEMPT LINEAGE + SSRF-SAFE SIGNED AT-LEAST-ONCE DELIVERY + SECRET-SAFE AUDIT — AND NEVER ALLOW HUMAN USER IMPERSONATION, `IS_ADMIN` API KEYS, PLAINTEXT/RETRIEVABLE SECRETS, GENERIC `SCOPES JSON`, RAW DOMAIN EVENTS, RAW ENTITY DUMPS, GENERIC WEBHOOK TABLES, CURRENT-STATE PAYLOAD REGENERATION, FRONTEND TENANT IDS, HTTP 2XX, MASKED PLAINTEXT OR GENERIC RETRY ACTIONS TO SUBSTITUTE FOR OR REWRITE CANONICAL MACHINE-AUTHORIZATION, EVENT OR DELIVERY TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **146 / 153** |
| **PASS**                                   |                        **146** |
| **STANDARDIZE decisions**                  |                        **144** |
| **Potential implementation-overlap flags** |                        **137** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**146 / 153 = 95.4% audited.**

Only **7 frozen designs remain** in Phase 3A.1.

### Canonical developer-access architecture after Design 146

```text
HUMAN ADMINISTRATOR
        │
        │ creates/manages
        ↓
SERVICE PRINCIPAL SP-20
        │
   ┌────┴───────────┐
   ↓                ↓
API Credentials   Permission Grants
   │                │
   └───────┬────────┘
           ↓
  Machine Authentication
           ↓
   AuthorizationEvaluator
           ↓
    Canonical Domain API
```

The strongest machine-identity rule is now explicit:

```text
Employee Maya creates
API key K-20.

BAD:

K-20 permanently acts as Maya.


CORRECT:

Maya = administrative creator.

K-20 authenticates:

ServicePrincipal SP-20.


If Maya leaves:

SP-20 remains or is disabled
according to Organization policy.

It never impersonates Maya.
```

API-key secrecy is equally explicit:

```text
CREATE KEY

Secret:
pers_xxxxxxxxxxxxx

Shown once.

Backend persists:

credential ID
prefix
secure verifier
expiry
revision


Later UI:

pers_ab12••••••
Active
Expires Oct 30


There is no ordinary:

“Reveal secret”
API.
```

And the webhook direction boundary is now frozen:

```text
DESIGNS 139–140

External Provider
       ↓
Our Platform

Provider Webhook


DESIGN 146

Our Platform
       ↓
Developer System

Developer Webhook


Same word:
“Webhook”

Different trust direction,
identity,
security,
and lifecycle.
```

Webhook retries also preserve historical truth:

```text
Project P-20 completed.

External webhook event:

WE-100
schema v2
payload snapshot X


Attempt 1:
timeout

Attempt 2:
HTTP 503

Attempt 3:
HTTP 204


All attempts deliver:

WE-100
schema v2
payload snapshot X


They do NOT regenerate
the Project from today's
current state.
```

## Next Sequential Audit Target

### **Design 147 — System Health / Status & Incident Management**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
