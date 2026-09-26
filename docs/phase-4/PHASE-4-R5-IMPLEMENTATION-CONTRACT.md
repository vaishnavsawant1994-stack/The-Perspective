# Phase 4 — R5 Authorization / RBAC / Resource Policy Implementation Contract

**Contract:** P4-R5-G0  
**Version:** 0.9-enhanced-qualification-candidate  
**Date:** September 26, 2026  
**Planning baseline:** `main@3e9418deb42c449cf3ae97da85a076e51c9c9089`  
**Branch:** `phase4/r5-authorization-contract-20260926`  
**Status:** GATE-B ENHANCED QUALIFICATION CANDIDATE — IMPLEMENTATION NOT AUTHORIZED  
**Depends on:** P4-R1-C1, P4-R2-C1, P4-R3-C1, P4-R4-C1, V1 Master Completion Bible  
**R6+ status:** LOCKED

## 0. Mission

R5 establishes the canonical server-side authorization layer for The Perspective.

It promotes an already authenticated, already tenant-scoped R4 request into an explicitly authorized request only when current database authority and resource policy prove the requested action.

R5 must preserve:

```text
authentication != tenant selection != authorization
```

R5 is a security/control release.

It does not implement CRM, finance, editorial, publishing, payments or any R6+ business workflow.

## 1. Frozen inherited architecture

R5 must preserve accepted R1–R4 behavior:

- `Organization` remains the durable tenant boundary.
- Team Workspace is a product/API surface, not a persisted Workspace entity.
- R3 owns identity/session/MFA/invitation/recovery.
- R4 owns explicit selected organization membership and tenant isolation.
- R4 restricted database role/RLS remains the tenant safety floor.
- Browser-supplied organization, role, permission, scope, ownership or admin claims are never authoritative.
- The request-context state sequence remains:
  - anonymous
  - identity-only
  - tenant
  - authorized
- no R5 design may weaken R3/R4 checks for convenience.

## 2. Required companion documents

This contract incorporates:

- `PHASE-4-R5-AUTHORIZATION-PREDESIGN-AUDIT.md`
- `PHASE-4-R5-ROLE-PROVENANCE.md`
- `PHASE-4-R5-PERMISSION-INVENTORY.md`
- `PHASE-4-R5-AUTHORIZATION-THREAT-MODEL.md`
- `PHASE-4-R5-AUTHORITY-MATRIX.md`
- `PHASE-4-R5-CONTRACT-ADVERSARIAL-AUDIT.md` (authoring-agent review; not independent)
- `PHASE-4-R5-OWNER-GOVERNANCE-DECISIONS.md` (Gate-A proposal; owner approval required)
- `PHASE-4-R5-PERMISSION-POLICY-METADATA.md` (170-key proposed metadata registry)
- `PHASE-4-R5-LAUNCH-ROLE-PERMISSION-MATRIX.md` (proposed launch/delegation matrix)
- `PHASE-4-R5-GATE-A-READINESS.md`
- `PHASE-4-R5-GATE-A-OWNER-APPROVAL.md`
- `PHASE-4-R5-GATE-B-ENHANCED-QUALIFICATION-WAIVER.md`
- `PHASE-4-R5-GATE-B-ENHANCED-AUDIT.md`
- `../GOVERNANCE-REVIEW-POLICY.md` (program-level GOV-REVIEW-01 on main@1d4e387a9f9a6d43274bd0b05e175f49b8bf0718)

The V1 Master Completion Bible remains program authority.

## 3. Contract blockers before implementation authorization

The following must be closed before this document may become `1.0-frozen`:

1. Gate-A owner governance approval — **CLOSED** at `99bb2ba1f94a9007314f208f7830553c231db700`;
2. Gate-B independent-review dependency — **OWNER-WAIVED** under GOV-REVIEW-01; independent external review was **NOT PERFORMED**;
3. R5 Gate-B enhanced qualification — REQUIRED and must be green on one exact contract candidate SHA;
4. closure of all blocking/high contract findings;
5. exact frozen contract SHA recorded;
6. separate owner acceptance of the frozen P4-R5-G0 contract;
7. explicit owner authorization to begin R5 implementation.

Until then: **production R5 implementation is prohibited.**

## 4. Authority model

Canonical path:

```text
Person
 -> UserAccount / Identity
 -> Session
 -> selected OrganizationMembership
 -> selected Organization
 -> active MembershipRole
 -> active same-organization Role
 -> RolePermission effect/constraints
 -> Permission
 -> same-grant RoleScope
 -> trusted ResourceContext
 -> resource policy
 -> field policy
 -> workflow/action policy
 -> obligations / separation of duty
 -> ALLOW | DENY
 -> execution
 -> audit/security evidence
```

Every ALLOW must identify one complete grant path.

## 5. Role model

### 5.1 Organization scoped

Roles remain organization-scoped records.

A membership may use only roles belonging to the same selected organization.

### 5.2 Launch roles

The system preserves a 17-role launch contract.

The primary historical Phase-2B source is missing.

The candidate registry in `PHASE-4-R5-ROLE-PROVENANCE.md` is therefore not implementation-authoritative until owner-approved.

### 5.3 System vs custom roles

R5 policy must support:

- system launch roles;
- organization-local custom roles only if explicitly permitted;
- stable immutable system role keys;
- display-name changes separate from stable authority key;
- no hard deletion of protected system roles;
- no custom-role bypass of R5 policy;
- no R01/R02 implicit cross-tenant bypass.

### 5.4 Runtime scope precedence

`Role.defaultScope` is a **grant-creation default**, not runtime authority.

At runtime the authoritative scope for a grant is `MembershipRole.scope`, further narrowed by `RolePermission.constraints` and resource policy. Constraints may narrow but never widen that scope.

If a MembershipRole row is missing a valid scope or the scope is incompatible with the permission registry, the grant is inapplicable and therefore denies.

### 5.5 Role combination and inheritance

R5 has **no implicit role hierarchy or inheritance**.

A membership may hold multiple active roles. Each role grant is evaluated as an independent complete authority path. Multiple roles may provide multiple valid ALLOW paths, but authority fragments may not be combined to create a stronger synthetic path.

Future role inheritance, if ever required, needs a separate explicit contract and cycle/precedence tests.

### 5.6 Membership-role lifecycle

An eligible grant requires:

- membership active;
- membership belongs to current user and selected organization;
- role active;
- role belongs to selected organization;
- grant `validFrom <= now`;
- `validUntil` absent or future.

Expired/revoked grants confer no authority.

## 6. Permission model

### 6.1 Registry

The frozen downstream documents currently preserve **167 explicit permission keys** when Phase-2F `permission.manage` is included. Four Phase-2E client permission strings also contain slash shorthand proving additional capabilities whose exact normalized historical names are not recoverable from the retained source.

R5 implementation must materialize one validated registry and identify for each production permission:

- stable key;
- domain;
- action;
- risk level;
- allowed surfaces;
- allowed scope values;
- whether client-safe;
- whether field policy required;
- whether workflow policy required;
- obligations;
- whether assignable to custom roles.

### 6.2 Exact-match permission keys

Permission keys are exact registry identifiers.

- wildcard/glob permissions such as `*`, `domain.*` or prefix matching are prohibited in R5;
- aliases require an explicit compatibility map and may not silently widen authority;
- unknown keys fail closed;
- custom roles may only reference registered assignable permissions.

### 6.3 Permission risk classification

Every registered permission has one frozen risk level:

- `LOW`
- `MEDIUM`
- `HIGH`
- `CRITICAL`

Unknown risk values are invalid. Risk level does not grant authority; it drives stronger administration, testing, audit and obligation requirements.

### 6.4 Permission does not equal authorization

```text
permission alone -> insufficient
```

A valid decision additionally requires tenant, scope, resource, fields, lifecycle and obligations.

### 6.5 Unknown permissions

Unknown/unregistered permission keys fail closed.

### 6.6 Role vs permission administration

`role.manage` and `permission.manage` are not aliases.

- `role.manage` governs access to role administration and role lifecycle/assignment operations according to the approved role matrix.
- `permission.manage` governs mutation of role-permission edges, as frozen by Phase-2F.
- an operation that changes both role metadata and permission edges must satisfy both applicable policies.
- neither permission permits self-escalation or delegation beyond the actor's delegation ceiling.

### 6.7 Workflow authority

High-risk business transitions use explicit command permissions rather than generic edit capability.

Examples already present in frozen Phase-2D:

- `outreach.launch`
- `proposal.send`
- `contract.send`
- `invoice.issue`
- `payment.refund`
- `editorial.approve`
- `approval.override`
- `publication.publish`
- `distribution.launch`

Later R6+ releases implement the business workflows; R5 defines how such authority is evaluated.

## 7. Permission effect semantics

`RolePermission.effect` supports ALLOW and DENY.

Frozen R5 semantics:

1. if no complete applicable ALLOW path exists → DENY;
2. if an applicable explicit DENY exists for the same requested permission/action/context → DENY;
3. explicit DENY takes precedence over ALLOW;
4. malformed/unknown constraints make that edge inapplicable and produce DENY if no other safe path exists;
5. deny cannot be bypassed by another role through scope laundering.

The implementation must return machine-readable internal reason codes without leaking protected resource facts to the caller.

## 8. Scope semantics

### ORG

May match an eligible resource only when the resource belongs to the selected organization under the domain ownership contract.

### DEPT

Requires a trusted department relation.

Actor department comes from current membership/profile data; target department comes from trusted resource/domain data.

No request-supplied department is authoritative.

### ASN

Requires an active explicit assignment relation.

Assignment is loaded server-side.

### OWN

Requires trusted ownership relation to the actor membership/user according to the domain contract.

### CLIENT

Requires:

- CLIENT surface or explicit Team client-policy use;
- selected client organization where applicable;
- matching client organization/project relation;
- client-safe visibility;
- client-safe field projection.

### READ

Read-only authority.

It cannot prove create/update/delete/approve/publish/refund/assign/export unless a separate explicit permission proves that action.

### NONE

No generic resource scope.

Used only where the permission/policy is inherently self/identity/system-specific.

## 9. No scope laundering

The evaluator must not flatten roles into:

```text
all permissions union
+ broadest scopes union
```

Instead it evaluates complete authority paths.

Example:

```text
Role A: invoice.view + READ
Role B: task.edit + ORG
```

must never become:

```text
invoice.view + ORG
```

unless an actual grant path proves it.

## 10. Typed constraint model

`RolePermission.constraints` remains the persisted extension point, but R5 must define an allowlisted schema.

Supported constraint families may include:

- allowed resource types;
- allowed sensitivity maximum;
- allowed project types;
- required assignment;
- required ownership;
- allowed field groups;
- denied field groups;
- client-safe-only;
- allowed lifecycle states;
- require reason;
- require recent authentication/MFA;
- no-self-action;
- require separation of duty.

Rules:

- unknown keys: fail closed;
- wrong types: fail closed;
- constraints cannot widen the grant scope;
- persisted constraint schema is versioned;
- arbitrary code/expression evaluation is prohibited.

## 11. Trusted ResourceContext

R5 must introduce a server-only normalized resource context that can represent, where applicable:

- resource ID/type;
- owner organization;
- client organization;
- project;
- department;
- owner user/membership;
- assignments;
- visibility;
- sensitivity;
- lifecycle/state;
- version/hash;
- requested fields;
- target actor if an administrative operation;
- relevant immutable approval/signature/publication references.

Resource context is produced by trusted loaders/repositories.

The browser may identify a target resource ID but never supplies authoritative policy attributes.

## 12. Policy decision contract

A canonical decision input should conceptually include:

```ts
{
  requestContext,
  permissionKey,
  action,
  resourceContext?,
  requestedFields?,
  commandContext?
}
```

Decision output must conceptually include:

```ts
{
  decision: "ALLOW" | "DENY",
  reasonCode,
  matchedGrant?,
  effectiveScope?,
  obligations[],
  readableFields?,
  mutableFields?
}
```

Caller-visible errors must avoid resource enumeration.

## 13. EffectiveAuthorization representation

The existing `EffectiveAuthorization.permissions` set must **not** become the resource authorization API by itself.

R5 must retain server-only complete grant-path evidence for policy evaluation, including role, MembershipRole scope, RolePermission effect/constraints and permission metadata.

A flattened permission set may be exposed inside server request context only as a coarse capability summary for navigation/query planning. It is never sufficient to authorize a resource/action/field.

The implementation may extend or replace the current `EffectiveAuthorization` shape to preserve grant paths, but must keep the accepted `anonymous -> identity-only -> tenant -> authorized` state model.

## 14. Request authorization promotion

R4 currently returns a tenant-scoped request.

R5 may promote it to `AuthorizedRequestContext` only after effective authority is resolved.

`EffectiveAuthorization` should contain useful resolved authority metadata but must not become a long-lived bearer credential.

No browser/JWT/session cookie receives an authoritative mutable permission list.

## 15. Effective-authority resolver

Initial R5 resolver behavior:

1. require tenant-scoped R4 request;
2. re-read/validate selected membership as active;
3. load active time-valid `MembershipRole` grants;
4. load same-organization active roles;
5. load role-permission edges + registered permissions;
6. validate typed constraints;
7. treat `MembershipRole.scope` as runtime scope; `Role.defaultScope` is not consulted to widen an existing grant;
8. build request-local complete grant paths;
9. do not persist/cache the result across requests in initial R5;
10. expose only server-side structures.

Role changes affect the next request.

## 16. Resource policy evaluation

A generic protected operation follows:

```text
authenticate
 -> selected tenant
 -> effective grant paths
 -> trusted resource load
 -> tenant relation
 -> required permission
 -> grant-path scope match
 -> visibility/sensitivity
 -> field policy
 -> workflow state/action guard
 -> separation of duty / obligations
 -> ALLOW or DENY
```

Permission may not be checked after an unrestricted resource load that already leaked data.

## 17. Field-level policy

R5 explicitly separates:

- record access;
- action access;
- field access.

### Reads

Queries/serializers return explicit allowlisted fields.

Forbidden fields are never loaded into client projections where practical.

### Writes

Mutation schemas are explicit allowlists.

Forbidden/security/server-owned fields are rejected rather than silently accepted.

Examples of server-owned authority fields include:

- organization ownership;
- permission/role authority not being explicitly administered under role policy;
- approval actor/evidence;
- payment truth;
- publication truth;
- audit actor/time.

### Client fields

Client serializers are separate explicit projections, not Team DTOs with CSS-hidden fields.

## 18. Client Portal policy

Client authorization is a separate policy surface.

Base requirements:

- CLIENT session surface;
- selected active client organization membership;
- eligible client role/grant;
- explicit `client.*` permission where defined;
- same client organization/project relationship;
- `CLIENT_SHARED` visibility where the generic envelope applies;
- explicit client-safe fields;
- active version/request where workflow action requires it.

R17/client authority does not imply Team permissions.

Internal notes, margins, internal comments, employee data, hidden versions and unrelated client metadata remain inaccessible.

Phase-2C freezes the following classes as **always excluded from client output** unless a later accepted contract explicitly replaces that rule:

- lead-source/enrichment data;
- internal sales notes;
- forecast and margin;
- staff performance/capacity;
- internal editorial/QA comments;
- unshared versions;
- processor/provider secrets;
- raw security/audit data;
- other clients;
- private automation metadata.

## 19. Sensitive action policy

R5 must support policy obligations beyond permission presence.

High-risk classes include:

- role/permission/membership administration;
- organization/security configuration;
- destructive operations;
- sensitive exports;
- financial mutation/refund;
- contract/signature authority;
- approval override;
- publication;
- provider credential/integration changes.

Possible obligations:

- structured reason;
- recent authentication;
- MFA freshness;
- exact version/hash;
- no-self-action;
- separation of duty;
- second approval under later domain policy;
- immutable audit evidence;
- optimistic concurrency.

R5 implements generic obligation enforcement primitives only for the R5 authorization/admin scope. Future domain releases attach their business rules.

## 20. Anti-self-escalation rules

Role administration must not allow an actor to:

- grant themselves R01/R02-equivalent authority without explicit permitted governance;
- grant a role containing permissions they are forbidden to delegate;
- use `role.manage` as a substitute for `permission.manage` when changing RolePermission edges;
- delegate a permission above the actor's explicit delegation ceiling;
- edit a system role to bypass protected policy;
- change a target's organization to escape tenancy;
- use a custom role to bypass unassignable system permissions;
- delete/disable protected final administrative authority without a controlled lockout-prevention path.

The exact owner/admin delegation matrix depends on the approved 17-role decision.

## 21. Freshness, cache and revocation

Initial R5:

- no cross-request authority cache;
- no permission claims embedded in session bearer tokens;
- authorization resolved from current DB state per protected request/command;
- request-local memoization is allowed;
- role/permission removal affects next request;
- sensitive commands revalidate in the execution transaction/equivalent;
- session may remain authenticated after role removal, but command authority disappears;
- membership/session invalidation remains R3/R4 responsibility.

Later caching requires a separate authority revision/invalidation contract and tests.

## 22. TOCTOU / transactional policy

For consequential mutations:

- load authority and target resource in the command transaction where feasible;
- use optimistic concurrency/version checks where defined;
- revalidate workflow state/version;
- fail if role/membership/resource state changed;
- never enqueue a consequential side effect before the authorization-backed command commits.

Workers act on committed authorized commands/system policy, not on browser-supplied role claims.

## 23. System / worker actor separation

Human RBAC and system execution are separate authority classes.

- background workers do not impersonate R01/R02 or any human role;
- a worker may execute only a committed command/event that was authorized at creation, or an explicit system policy operation;
- worker/system actor identity is recorded separately in audit evidence;
- provider/webhook identity does not become a user membership;
- browser-supplied actor/system flags are ignored/rejected;
- consequential worker side effects re-load canonical tenant/resource state when the operation can become stale.

## 24. List/search/count/pagination policy

Authorization filters must be applied before:

- count;
- aggregation;
- pagination;
- sorting result exposure;
- facets;
- search ranking output;
- export.

Post-filtering unauthorized rows after database retrieval is not an accepted security boundary for tenant-sensitive queries.

## 25. Bulk command policy

Default behavior:

- authorize every target;
- if any target is unauthorized, fail the atomic bulk command;
- do not leak which inaccessible foreign IDs exist.

Endpoints may explicitly define per-item results only if their contract prevents enumeration and applies policy independently per item.

## 26. Export policy

Exports are protected commands.

They require:

- explicit export permission if/when defined;
- same record scope as interactive views;
- equal or stricter field policy;
- server-generated tenant filter;
- audit event;
- bounded time/download access.

No “download all” bypass.

## 27. Error contract

Recommended internal reason families:

- AUTH_REQUIRED
- TENANT_REQUIRED
- MEMBERSHIP_INACTIVE
- ROLE_INACTIVE
- GRANT_EXPIRED
- PERMISSION_MISSING
- PERMISSION_DENIED
- SCOPE_DENIED
- RESOURCE_DENIED
- FIELD_DENIED
- CLIENT_PROJECTION_DENIED
- WORKFLOW_DENIED
- SEPARATION_OF_DUTY_DENIED
- OBLIGATION_REQUIRED
- POLICY_INVALID

Caller response may intentionally collapse several cases to 404/403 to prevent enumeration.

## 28. Audit and security evidence

### Mandatory immutable audit

Record at minimum:

- role creation/change/archive;
- role-permission change;
- membership-role assignment/change/revocation;
- protected system-role/config changes;
- successful sensitive action authorized through R5;
- privileged export;
- privileged override.

Use existing `AuditEvent` where sufficient.

### Denial telemetry

Authorization denials produce structured security telemetry.

High-risk escalation attempts should additionally create durable audit/security evidence according to the event policy.

Do not store secrets or full protected payloads in audit.

## 29. Role/permission administration API design

R5 may implement only the authorization-admin endpoints necessary to administer/test R5 itself, aligned with Phase-2F:

```text
GET/POST /api/v1/workspace/roles
GET/PUT  /api/v1/workspace/roles/{roleId}/permissions
membership-role assignment/revocation endpoint(s) required by the approved R5 contract
```

Rules:

- Team surface only;
- selected organization only;
- `role.manage` for role lifecycle/assignment operations;
- `permission.manage` for RolePermission mutation;
- both where one command changes both classes of authority;
- optimistic concurrency;
- reason for sensitive changes;
- anti-self-escalation;
- audit;
- no arbitrary organization target.

This does not authorize R6 business APIs.

## 30. Database rules

R5 reuses existing IAM tables.

Schema changes are permitted only when required to express the frozen authorization contract.

Likely implementation needs may include:

- typed policy metadata/versioning;
- indexes for active membership-role/role-permission resolution;
- authority revision/invalidation support only if needed;
- additional RLS/policies for R5-owned access-management records.

R5 must **not** create R6 business-domain entities merely to demonstrate `ASN`, `OWN` or `DEPT`. Those scopes are frozen at the normalized ResourceContext/policy layer and may be proven with R5-owned fixtures; later domain releases bind their canonical assignment/ownership tables to that contract.

R5 must not introduce a parallel authorization database.

## 31. Database tenant enforcement

R4 tenant RLS remains mandatory.

R5 application authorization is additive.

Conceptually:

```text
application RBAC/resource policy
AND
database tenant isolation
```

Neither substitutes for the other.

R5 must prove:

- role/permission resolution cannot cross organization;
- client role data cannot cross client organization;
- role-admin queries are tenant-bound;
- restricted domain/resource access uses the correct database boundary where applicable.

## 32. Client-safe projection architecture

Team and Client serializers/repositories remain separate policy projections.

A client projection is not:

```text
Team record - some hidden fields in React
```

It is:

```text
authorized canonical record
 -> explicit client-safe projection policy
 -> client DTO
```

Nested relationships obey the same rule.

## 33. Search and future indexes

Any search/index document later used by R6+ must carry sufficient policy metadata such as:

- organization;
- client organization;
- project;
- visibility;
- sensitivity;
- type;
- owner;
- department/assignment if needed.

Server-derived authorization filters apply before results/counts/facets.

R5 only freezes this requirement; R11 implements production search.

## 34. File/media policy

R5 policy must be capable of authorizing:

- asset metadata read;
- version read;
- upload/replace;
- rights confirmation;
- signed URL generation;
- export/download.

Storage signing occurs only after authorization.

R13 may implement the provider-backed storage operations.

## 35. Authorization module boundaries

Expected implementation responsibility, subject to frozen contract:

```text
src/modules/authorization/
  registry/
  resolver/
  policy/
  constraints/
  resource-context/
  fields/
  obligations/
  audit/
  errors/
  tests/
```

Exact filenames are not frozen by this contract.

The architecture must remain modular and server-only.

## 36. Planned implementation slices after authorization

Only after P4-R5-G0 is frozen and owner-authorized:

1. authorization contracts/types;
2. canonical permission registry, including explicit reconciliation of `permission.manage` and unresolved slash-shorthand client capabilities;
3. approved launch-role seed/config;
4. effective grant-path resolver;
5. typed constraint parser;
6. resource-context resolver;
7. policy engine;
8. request authorization guard/promotion;
9. field-policy enforcement;
10. Client-safe policy;
11. freshness/revocation behavior;
12. audit/security evidence;
13. access-administration API integration;
14. database enforcement/indexes/tests;
15. browser/security qualification.

No R6 feature implementation belongs in these slices.

## 37. Required tests

### Unit

- permission registry validation;
- `role.manage` / `permission.manage` separation;
- `Role.defaultScope` cannot widen `MembershipRole.scope`;
- flattened permission summaries cannot authorize resources;
- DENY precedence;
- same-grant scope;
- typed constraints;
- field policy;
- client projection;
- obligations;
- reason-code mapping.

### Database/integration

- active/inactive membership;
- same/cross organization role;
- active/inactive role;
- valid/expired membership-role;
- ALLOW/DENY combinations;
- duplicate grants;
- tenant isolation;
- role-admin tenant isolation;
- R4 RLS regression.

### API

- forged org/role/permission ignored;
- direct hidden action denied;
- role administration anti-self-escalation;
- malformed constraints;
- optimistic concurrency;
- denial response does not enumerate foreign resource.

### Resource policy

- ORG/DEPT/ASN/OWN/CLIENT/READ/NONE;
- wrong scope;
- field smuggling;
- bulk;
- pagination/count;
- export;
- nested relation;
- lifecycle/version;
- SoD.

### Client

- client same org/shared record allowed;
- client internal field denied/omitted;
- cross-client denied;
- Team endpoint denied;
- exact approval version required.

### Regression

- R3 authentication suite;
- R3 browser suite;
- R4 tenancy suite;
- R4 browser suite;
- migration/drift/database verifier;
- lint/typecheck/build;
- dependency/security audit.

## 38. Qualification

Final R5 implementation candidate requires one exact SHA.

Required gates on that SHA:

```text
clean install
Prisma validate/generate
migration deploy/status
database verifier
drift
unit tests
authorization/security tests
database/integration tests
API tests
R3 regressions
R4 regressions
R5 browser/E2E
lint
strict TypeScript
production build
dependency audit
```

Any repair creates a new candidate SHA and affected gates rerun.

## 39. R5 checkpoint

P4-R5-C1 must record:

- frozen R5 baseline;
- exact implementation candidate SHA;
- changed files;
- migrations;
- approved R01–R17 registry source/decision;
- permission registry version/count;
- authority algorithm;
- scope semantics;
- field/client policies;
- security invariants;
- attack-matrix evidence;
- workflow IDs/results;
- known limitations;
- rollback;
- confirmation R6 work has not started.

## 40. Rollback strategy

R5 changes must be reversible without weakening R1–R4:

- authorization migrations have forward/restore guidance;
- role/permission seed changes are versioned;
- no destructive replacement of R3/R4 membership/session structures;
- rollback must return protected business authorization to fail-closed behavior, not open access;
- R4 tenant isolation remains intact.

## 41. Explicit exclusions

R5 does **not** authorize implementation of:

- leads/CRM/deals/outreach;
- proposals/contracts business engine;
- invoices/payments/subscriptions/entitlements;
- editorial project workflow;
- magazine/publishing engine;
- distribution;
- production search;
- analytics/growth automation;
- production Client Portal business data binding;
- enterprise provider integrations;
- advanced AI;
- production deployment certification;
- Design 154.

R6–R14 remain locked.

## 42. Contract attack checklist

Before freeze, the Gate-B enhanced qualification must explicitly test the design against all cases in `PHASE-4-R5-AUTHORIZATION-THREAT-MODEL.md`, including:

- cross-tenant IDOR;
- browser-forged authority;
- wrong surface;
- inactive/ended membership;
- role expiry/revocation;
- DENY conflict;
- scope laundering;
- client-to-Team escalation;
- field bypass;
- bulk/search/export leakage;
- stale authorization;
- TOCTOU;
- self-escalation;
- duplicate grants;
- malformed constraints;
- audit mutation.

## 43. Acceptance criteria for contract freeze

P4-R5-G0 may be frozen only when:

1. baseline is `3e9418deb42c449cf3ae97da85a076e51c9c9089`;
2. role provenance gap is resolved by explicit owner decision;
3. canonical launch-role registry is recorded;
4. permission inventory is reconciled/normalized, including `permission.manage` and the four slash-shorthand capabilities;
5. runtime precedence of `MembershipRole.scope` over `Role.defaultScope` is frozen;
6. effective authorization retains complete grant-path evidence and forbids flat-permission authorization;
7. all seven scopes have frozen semantics;
8. DENY precedence and same-grant rule are frozen;
9. resource-context contract is frozen;
10. field/client policy is frozen;
11. freshness/revocation semantics are frozen;
12. sensitive-action obligations are frozen;
13. threat model has a control/test mapping;
14. R5 Gate-B review requirement is satisfied under GOV-REVIEW-01 by the owner-approved enhanced qualification waiver; the record must state that independent external review was NOT PERFORMED;
15. second enhanced adversarial/falsification audit is complete;
16. dedicated R5 contract machine-consistency qualification is green on the exact candidate SHA;
17. inherited R3/R4 core/browser regressions are green on that same exact candidate SHA;
18. all blocking/high contract findings are closed;
19. exact frozen contract SHA is recorded;
20. owner separately accepts the frozen P4-R5-G0 contract;
21. owner explicitly authorizes implementation.

## 44. Current gate state

```text
R1 accepted
 -> R2 accepted
 -> R3 accepted
 -> R4 accepted
 -> Master Bible accepted
 -> R5 planning baseline frozen
 -> pre-design audit complete
 -> role provenance reconstruction prepared
 -> permission inventory prepared
 -> threat model prepared
 -> P4-R5-G0 audit candidate prepared
 -> authoring-agent adversarial audit complete
 -> authority matrix prepared
 -> Gate-A governance package prepared and mechanically consistent
 -> OWNER GATE-A DECISION APPROVED at 99bb2ba1f94a9007314f208f7830553c231db700
 -> GOV-REVIEW-01 merged on main@1d4e387a9f9a6d43274bd0b05e175f49b8bf0718
 -> R5 Gate-B independent review OWNER-WAIVED (independent review NOT PERFORMED)
 -> second enhanced adversarial audit complete
 -> dedicated enhanced qualification REQUIRED
 -> findings closure REQUIRED
 -> freeze REQUIRED
 -> explicit implementation authorization REQUIRED
 -> R5 implementation remains LOCKED
```

This document intentionally stops before implementation.
