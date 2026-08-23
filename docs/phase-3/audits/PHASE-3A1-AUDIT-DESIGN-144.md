# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 144 — Role & Permission Administration

Design 144 should become the **canonical Team Workspace authorization-administration, Role definition, Permission assignment, membership-role binding, scoped-access governance, privilege-review, high-risk change, and authorization-policy inspection surface** built directly on the canonical authorization foundation established by **Design 037 — Roles & Permissions Management**.

Design 144 must **not create a second RBAC system**.

Design 037 already established the permanent platform boundary:

> **User ≠ OrganizationMembership ≠ EmployeeProfile ≠ Role ≠ Permission ≠ RoleAssignment ≠ TeamMembership ≠ JobTitle.**

Design 144 should deepen that architecture into the **administrative/governance surface** for configuring, reviewing, and safely changing authorization without allowing UI labels, Team membership, Project roles, job titles, Alert recipients, or frontend menu visibility to become security authority.

It must preserve:

> **Role ≠ Permission ≠ RoleAssignment ≠ ResourceScope ≠ PolicyCondition ≠ OrganizationMembership ≠ ProjectRole ≠ JobTitle ≠ TeamMembership ≠ PortalRole.**

No exact route is being invented or finalized during Phase 3A.1.

The central implementation rule is:

> **Authorization decisions remain server-authoritative and must be derived from active tenant membership, explicit RoleAssignments, explicit Permission grants, applicable scope/policy, and current account/membership state. Design 144 manages those canonical authorization records, but it must never infer privileges from job title, manager status, Team membership, dashboard visibility, navigation items, client-facing roles, or frontend state. High-risk permission changes require anti-escalation checks, last-admin/lockout protection, concurrency control, audit evidence, and immediate authorization-cache invalidation.**

---

# 1. Classification

| Audit field                            | Classification                                                                                                                                                                                                          |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                          | **144**                                                                                                                                                                                                                 |
| **Canonical name**                     | **Role & Permission Administration**                                                                                                                                                                                    |
| **Product area**                       | Team Workspace / Security / Identity & Access Management                                                                                                                                                                |
| **User surface**                       | **Authenticated Team Workspace**                                                                                                                                                                                        |
| **Screen class**                       | Authorization Administration / RBAC Governance Workspace                                                                                                                                                                |
| **Classification**                     | **Canonical Internal Role, Permission, Scoped Assignment & Privilege-Governance Anchor**                                                                                                                                |
| **Primary purpose**                    | Define and inspect Roles, compose Permission sets, assign Roles to active memberships under allowed scopes, review effective access, and safely administer authorization without privilege escalation or tenant leakage |
| **Canonical authorization foundation** | **Design 037**                                                                                                                                                                                                          |
| **User identity dependency**           | Design 036                                                                                                                                                                                                              |
| **Organization membership dependency** | Designs 036 / 145                                                                                                                                                                                                       |
| **Organization settings boundary**     | Design 040                                                                                                                                                                                                              |
| **Client Portal role boundary**        | Design 062 / Client Portal authorization model                                                                                                                                                                          |
| **Project delivery role boundary**     | Design 112                                                                                                                                                                                                              |
| **Alert recipient-role dependency**    | Design 143                                                                                                                                                                                                              |
| **Audit dependency**                   | Designs 039 / 138                                                                                                                                                                                                       |
| **API/developer access boundary**      | Design 146                                                                                                                                                                                                              |
| **Global settings boundary**           | Design 149                                                                                                                                                                                                              |
| **Primary Role identity**              | `Role`                                                                                                                                                                                                                  |
| **Permission identity**                | `Permission`                                                                                                                                                                                                            |
| **Role-permission binding**            | `RolePermissionGrant`                                                                                                                                                                                                   |
| **Membership-role binding**            | `RoleAssignment`                                                                                                                                                                                                        |
| **Scope representation**               | `AuthorizationScope` / typed resource scope                                                                                                                                                                             |
| **Policy representation**              | `AuthorizationPolicy` where conditional rules are required                                                                                                                                                              |
| **Effective-access projection**        | `EffectivePermissionProjection`                                                                                                                                                                                         |
| **Role summary projection**            | `RoleAdministrationView`                                                                                                                                                                                                |
| **Assignment summary projection**      | `RoleAssignmentView`                                                                                                                                                                                                    |
| **Primary query service**              | `AuthorizationAdministrationQueryService`                                                                                                                                                                               |
| **Role service**                       | `RoleService`                                                                                                                                                                                                           |
| **Permission registry**                | `PermissionRegistry`                                                                                                                                                                                                    |
| **Assignment service**                 | `RoleAssignmentService`                                                                                                                                                                                                 |
| **Effective-access resolver**          | `AuthorizationEvaluator` / `EffectivePermissionResolver`                                                                                                                                                                |
| **Escalation guard**                   | `PrivilegeEscalationGuard`                                                                                                                                                                                              |
| **Lockout guard**                      | `AdministrativeAccessGuard`                                                                                                                                                                                             |
| **Cache invalidation**                 | authorization-revision/session invalidation infrastructure                                                                                                                                                              |
| **Parent shell**                       | `InternalAppShell` — Design 001                                                                                                                                                                                         |
| **Auth**                               | Required                                                                                                                                                                                                                |
| **Authorization**                      | Strong IAM administration permissions + current active OrganizationMembership                                                                                                                                           |
| **Implementation priority**            | **Critical Security / Tenant Isolation / Privilege Escalation Prevention**                                                                                                                                              |
| **Reuse level**                        | **Platform-wide across every internal Team Workspace route, action, API, export, integration, automation, analytics and administration capability**                                                                     |

Design 144 should answer:

> **“Which Roles exist, which exact Permissions each Role grants, which active OrganizationMemberships hold those Roles, under what scope, what effective access results, whether any permission is high-risk or inherited through another assignment, and whether a proposed change is safe to apply without privilege escalation, tenant leakage, or administrative lockout?”**

Canonical architecture:

```text id="r1p7io"
User
  │
  ↓
OrganizationMembership
  │
  ├── RoleAssignment A
  ├── RoleAssignment B
  └── direct/special policy only if canonical
           │
           ↓
          Role
           │
           ↓
   RolePermissionGrant
           │
           ↓
       Permission
           │
      + Scope/Policy
           │
           ↓
 AuthorizationEvaluator
           │
           ↓
EffectivePermissionProjection
```

---

# 2. Reuse

## Design 037 remains the sole authorization foundation

This is the strongest Design-144 rule.

Design 144 must not introduce:

```text id="3w14nt"
AdminRole
SystemPermission
SecurityGroup
AccessLevel
RoleMatrix
PermissionProfile
```

as competing security identities if they duplicate canonical `Role`, `Permission`, and `RoleAssignment`.

Correct:

```text id="qjrq3w"
Role R-10
Permission P-20
RoleAssignment RA-30

same identities used by:
Design 037
Design 144
all server authorization checks
```

---

## Design 037 vs Design 144

### Design 037

Established canonical authorization concepts.

### Design 144

The advanced administrative/governance workspace over those same concepts.

No duplicate evaluator, schema, or permission registry.

---

## PermissionRegistry must be canonical

Permissions should come from one stable registry such as conceptually:

```text id="clu87g"
crm.lead.read
crm.lead.manage
project.read
project.manage
report.release
integration.disconnect
audit.export
role.manage
```

Exact keys belong to Phase 3D.

Do not let each page invent its own strings independently.

---

## Permission ≠ UI action label

Critical.

Button:

> Delete Integration

might map to:

```text id="9hlqln"
integration.disconnect
```

The human label can change.

Permission identity must remain stable.

---

## Permission ≠ route

Permanent.

Access to a route does not equal permission to every action/data operation inside it.

---

## Route visibility ≠ authorization

Absolute.

Hiding:

> Billing

from sidebar does not secure Finance APIs.

---

## Role ≠ JobTitle

Permanent.

Example:

```text id="86y65l"
Job title:
Editorial Director

Role:
Editorial Approver
```

They are independent.

---

## Role ≠ TeamMembership

Absolute.

Belonging to:

> Editorial Team

does not automatically grant:

> publish approval.

---

## Role ≠ ProjectTeamMembership

Critical.

Design 112's:

> Project Editor
> Designer
> Producer

are delivery responsibilities.

They do not automatically become security Roles.

---

## Project role ≠ authorization Role

Even if they share labels such as:

> Editor

the entity types must remain distinct.

---

## Manager ≠ Role

Design 036 Manager relation is organizational structure.

No automatic:

> manager can access all subordinate records

unless an explicit authorization policy says so.

---

## OrganizationMembership ≠ RoleAssignment

One membership can hold:

* zero;
* one;
* multiple;

RoleAssignments according to policy.

---

## User ≠ RoleAssignment

Role is assigned in Organization context, generally to Membership rather than global User.

This is critical for multi-tenancy.

---

## User's Role in Org A ≠ Role in Org B

Absolute.

---

## RoleAssignment ≠ Role

### Role

Reusable permission bundle.

### RoleAssignment

Membership has Role under defined scope.

---

## RolePermissionGrant ≠ Permission

Permanent.

Grant links Role to Permission.

---

## Permission grant ≠ effective permission

Critical.

A Role may grant a Permission, but effective access can still depend on:

* membership active state;
* Organization;
* resource scope;
* policy;
* revocation/deactivation.

---

## EffectivePermissionProjection ≠ persisted truth

Rebuildable/derived.

Do not store:

```text id="0bn095"
user.canDeleteContract = true
```

as independent source truth.

---

## Direct user permissions

Prefer not to create ad hoc user-specific Permissions unless canonical product requirements explicitly need them.

Roles/scoped assignments should remain primary.

If exceptions exist later, model them explicitly, not as hidden JSON.

---

## Client Portal roles remain separate

Design 062's Client Portal Team Access belongs to the Client authorization surface.

Do not use internal Team Workspace Roles directly for Client users.

Shared low-level primitives are fine.

Security domains remain separated.

---

## Alert recipient Roles ≠ permission changes

Design 143 may say:

> notify users holding Integration Administrator Role.

That only reads authorization membership.

It does not modify RoleAssignments.

---

## API keys ≠ user Roles

Design 146 will need separate service/developer access credentials/scopes.

Do not equate:

> API key scope

with human RoleAssignment.

Shared Permission identifiers may be reusable where appropriate.

---

# 3. Entities

## Permission

Stable platform authorization capability.

Conceptually:

```text id="gssmo0"
Permission
├── id / stable key
├── domain
├── action
├── sensitivityClass
├── allowedScopeTypes[]
├── lifecycle
├── description
└── schema/version
```

---

## Permission keys must be stable

Never derive permission identity from UI copy.

---

## Permission sensitivity

Useful governance concept:

```text id="r90y4f"
NORMAL
SENSITIVE
PRIVILEGED
CRITICAL
```

Exact taxonomy Phase 3D.

Examples of higher-risk permissions may include:

* role administration;
* audit export;
* integration credential rotation;
* financial actions;
* API key management.

---

## Permission lifecycle

Permissions may be:

* active;
* deprecated;
* retired.

Removing a Permission from current registry must not make historical Audit evidence impossible to interpret.

---

## Role

Canonical reusable authorization bundle.

Conceptually:

```text id="d3atjg"
Role
├── id
├── organizationId? / system template scope
├── name
├── description
├── roleType
├── lifecycle
├── isSystemManaged
├── createdBy
├── createdAt
└── revision
```

---

## System Role ≠ custom Organization Role

If platform provides baseline predefined Roles:

distinguish:

```text id="fvcglq"
SYSTEM_MANAGED
ORGANIZATION_MANAGED
```

Do not allow protected system semantics to be overwritten accidentally.

---

## System Role template ≠ tenant RoleAssignment

Permanent.

---

## Role name uniqueness

Should likely be tenant-scoped for Organization-managed Roles.

But name ≠ identity.

Renaming Role preserves Role ID.

---

## RolePermissionGrant

Conceptually:

```text id="p12vqr"
RolePermissionGrant
├── roleId
├── permissionId
├── scopePolicy?
├── grantedAt
├── grantedBy
└── revision
```

Could be embedded in RoleVersion/config if the authorization model is versioned.

Exact Phase 3D.

---

## Role versioning

This requires care.

Permissions need auditable history, but every permission edit does not necessarily require immutable RoleVersion entities unless implementation architecture chooses them.

Minimum requirement:

> **historical grant/revocation evidence must be reconstructable.**

Possible architecture:

* revisioned Role;
* append grant/revoke records;
* RoleVersion.

Phase 3D can decide.

Do not over-engineer screen identity now.

---

## Permission removal ≠ deleting Permission

Permanent.

Removing Permission P from Role R removes that grant.

It does not delete P from registry.

---

## RoleAssignment

Canonical membership-to-Role relation.

Conceptually:

```text id="7xjdzj"
RoleAssignment
├── id
├── organizationMembershipId
├── roleId
├── authorizationScope?
├── effectiveFrom
├── expiresAt?
├── assignmentState
├── assignedBy
├── assignedAt
└── revision
```

---

## Assignment state

Could conceptually include:

```text id="yvjbrr"
ACTIVE
EXPIRED
REVOKED
PENDING
```

only where supported.

---

## Expiring RoleAssignment

Useful for temporary access if frozen system supports it.

Do not invent UI controls if absent.

Backend can remain capable where needed later.

---

## RoleAssignment scope

Critical.

Potential scope types:

```text id="dm1hx7"
ORGANIZATION
PROJECT
CLIENT
TEAM
RESOURCE_SET
```

only where canonical permissions actually support them.

Do not turn free-form JSON into scope.

---

## Scope ≠ Team membership

A RoleAssignment can be scoped to Project P-10.

That does not make the user a ProjectTeamMember automatically.

---

## ResourceScope

Conceptually:

```text id="xbjiml"
AuthorizationScope
├── scopeType
├── scopeReferenceId
├── organizationId
└── policyVersion
```

Typed and validated.

---

## Scope hierarchy

If the model supports hierarchical scope:

```text id="o93cv7"
Organization
  ↓
Client
  ↓
Project
```

inheritance rules must be explicit.

Never assume parent/child inheritance from route structure.

---

## EffectivePermissionProjection

Derived.

Conceptually:

```text id="44qnp1"
EffectivePermissionProjection
├── membershipId
├── permissionKey
├── scope
├── grantSources[]
├── restrictions[]
├── effective
├── calculatedAt
└── authorizationRevision
```

---

## Multiple grant sources

Example:

```text id="5bp938"
report.read

granted via:
Role A
Role B
```

Removing Role A must not remove access if Role B still grants it.

This is a critical resolver requirement.

---

## Deny rules

If the platform supports explicit deny semantics:

they require carefully defined precedence.

Do not invent deny rules unless needed.

Simpler allow-only RBAC is safer initially.

---

## Permission inheritance

If Roles can inherit Roles, this creates complexity/cycles.

Do not introduce Role inheritance unless frozen product explicitly requires it.

Prefer explicit Permission grants.

---

## AuthorizationPolicy

Only where contextual conditions are needed.

Examples:

* own records;
* assigned Projects;
* Client-scoped records.

Should use typed policies.

No arbitrary expression code.

---

## PolicyCondition ≠ Permission

Permission says:

> project.read

Policy may narrow:

> only assigned Projects.

---

## Policy evaluation should be centralized

Do not implement:

```text id="5g0nlb"
if (user.department === ...)
```

separately in route handlers.

---

## Administrative capability

Permissions to manage Roles themselves need special protection.

Example conceptual permissions:

```text id="idhoh1"
role.read
role.manage
role.assign
permission.read
authorization.audit
```

---

## PrivilegeEscalationGuard

Not necessarily persistent entity.

Canonical service/policy that evaluates proposed security changes.

---

## AdministrativeAccessGuard

Protects invariants such as:

* at least one authorized administrator remains;
* user cannot remove own last required admin access accidentally;
* tenant cannot become administratively orphaned.

---

## AuthorizationRevision

Strongly useful.

Tenant/membership authorization changes can increment a revision used to invalidate:

* permission caches;
* sessions;
* search indexes/projections.

---

# 4. Permissions

Design 144 is itself one of the most sensitive permission surfaces.

Conceptually distinguish:

```text id="5nvyul"
role.read
role.create
role.edit
role.archive

rolePermission.read
rolePermission.manage

roleAssignment.read
roleAssignment.assign
roleAssignment.revoke

permission.read

authorization.inspectEffective
authorization.managePrivileged

authorization.export
```

Exact identifiers belong to Phase 3D.

---

## Role read ≠ Role edit

Permanent.

---

## Role edit ≠ Permission grant administration

Potentially separate for high-risk controls.

---

## Role create ≠ Role assign

Permanent.

A user may define Roles without being able to assign them to people.

---

## Role assign ≠ assign any Role

Critical.

A user must not be able to assign a Role containing Permissions beyond what they are allowed to delegate.

---

## Delegation ceiling

Strong rule:

> **You cannot grant privileges you are not authorized to delegate.**

This may be stricter than:

> you cannot grant privileges you personally hold.

Explicit delegation policy is safer.

---

## Role modification escalation

A malicious path:

```text id="c9c4z4"
User can edit Role R
↓
adds role.manage
↓
now gains role.manage through own assignment
```

must be prevented.

PrivilegeEscalationGuard evaluates **effective before/after access**, not just individual fields.

---

## Self-assignment

Should be strongly restricted.

A user should not be able to assign themselves elevated Roles merely because they can edit memberships.

---

## Self-role edit

If user holds Role R and edits R:

must check whether the edit would increase their own privileges.

---

## Indirect escalation

Critical.

Example:

```text id="0q0k9v"
User cannot assign Admin Role.

But can edit Editor Role,
which they already hold,
and add Admin permissions.
```

Must be blocked.

---

## Role cloning

If frozen UI allows clone:

cloning does not automatically make the new Role safe to assign.

Permission escalation checks still apply.

---

## Last administrator protection

Critical.

Do not permit changes that leave the Organization with no viable role-administration authority.

---

## Self-lockout protection

An administrator may be allowed to reduce their own access only with explicit safeguards/confirmation and only if another administrator remains.

Exact UX later.

---

## Membership deactivation overrides RoleAssignment

Design 037 already established this.

If Membership is inactive:

Roles cannot restore access.

---

## RoleAssignment active ≠ User authenticated

Permanent.

Both current session/auth and active Membership are required.

---

## Team manager ≠ Role administrator

Absolute.

---

## Organization owner label ≠ permission unless canonical

If the product has an Owner semantic later, its authority must be explicitly modeled.

Do not infer owner power from label alone.

---

## Effective-access inspection may be broader than modification

A compliance/security user may inspect permissions without being allowed to change them.

---

## Sensitive-role visibility

Roles themselves may reveal product security architecture.

Use appropriate read permission.

---

## Permission descriptions ≠ permission grants

Reading available Permission definitions does not grant them.

---

## Client Portal Roles cannot be managed through internal RoleAssignments accidentally

Absolute.

---

## Cross-tenant assignment prohibited

Absolute.

Role, Membership, Scope, Project, Client references must belong to compatible Organization.

---

## Direct IDs reauthorize

Never trust:

```text id="dcq4ef"
roleId
membershipId
scopeId
```

from client.

Validate tenant and assignability.

---

# 5. States

Design 144 must keep **Role lifecycle, RoleAssignment lifecycle, Membership state, Permission registry state, effective permission, administrative safety, and authorization-cache freshness** separate.

### Role lifecycle

```text id="98p3va"
Active
Archived
System Managed
Deprecated
```

### RoleAssignment

```text id="23819d"
Active
Pending
Expired
Revoked
```

where applicable.

### Membership

Canonical:

```text id="wsau28"
Active
Invited
Deactivated
```

or existing lifecycle.

### Permission

```text id="i56ahz"
Active
Deprecated
Retired
```

### Effective access

```text id="nswjpu"
Granted
Not Granted
Restricted By Scope
Unavailable / Unknown
```

These must never collapse into:

```text id="kgulb4"
role.status
```

---

## Role Active ≠ assignment active

Permanent.

---

## Assignment Active ≠ membership active

Critical.

Inactive Membership overrides.

---

## Role archived ≠ historical assignments deleted

Absolute.

---

## Permission deprecated ≠ historical Audit evidence invalid

Permanent.

---

## Permission removed from Role ≠ all users immediately lose permission if another Role grants it

Critical.

Effective resolver must recompute.

---

## User removed from Team ≠ Role revoked automatically unless policy says so

Permanent.

TeamMembership and RoleAssignment are separate.

---

## Project membership removed ≠ scoped authorization necessarily revoked unless explicitly linked by policy

If such relationship exists, it must be explicit.

Do not rely on accidental coupling.

---

## Role renamed ≠ Role changed identity

Permanent.

---

## Permission label changed ≠ permission identity changed

Permanent.

---

## Effective access cache stale ≠ permission truly still granted

Security checks must use authoritative revision-aware evaluation.

---

## Role edit conflict ≠ silent overwrite

Use optimistic concurrency.

---

## State Coverage

Design 144 inherits Design 150 plus:

```text id="vl6jer"
Role Administration Loading
Role Administration Available
Role Administration Empty
Role Administration Restricted
Role Administration Partial
Role Administration Unavailable

Role Active
Role Archived
Role System Managed
Role Deprecated

Role Assignment Active
Role Assignment Pending
Role Assignment Expired
Role Assignment Revoked

Membership Active
Membership Deactivated
Membership Pending

Permission Active
Permission Deprecated
Permission Retired
Permission Restricted

Effective Permission Granted
Effective Permission Not Granted
Effective Permission Scoped
Effective Permission Unknown

Assignment Allowed
Assignment Restricted
Assignment Would Escalate
Assignment Would Lock Out Administration
Assignment Conflict

Role Edit Allowed
Role Edit Restricted
Role Edit Would Escalate
Role Edit Conflict

Authorization Updated Elsewhere
Role Updated Elsewhere
Assignment Updated Elsewhere
Membership Updated Elsewhere
Permission Registry Updated
Authorization Projection Stale
Session Authorization Stale
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize:

```text id="450kxp"
Role identity
↓
Role lifecycle
↓
Permission groups
↓
Scope semantics
↓
Assigned members
↓
Effective access / risk
↓
Administrative actions
```

Only frozen Design-144 sections/actions should render.

---

## Permission matrix must preserve semantic grouping

Potential groups:

* CRM;
* Projects;
* Publishing;
* Finance;
* Integrations;
* Reporting;
* Security/Admin.

Do not expose an undifferentiated wall of hundreds of checkboxes if the frozen design already has grouping hierarchy.

---

## Permission names should be human-readable but keyed canonically

UI:

> Manage integrations

Backend:

```text id="264skj"
integration.manage
```

---

## High-risk permissions should be visually distinguishable

Examples:

* Role administration;
* API keys;
* Integration credential rotation;
* Audit export.

But visual emphasis does not change authorization semantics.

---

## Effective access should explain grant source

Example:

> `report.release` granted through Publishing Manager Role.

If multiple:

> Granted via Publishing Manager + Admin.

This helps avoid accidental removal.

---

## Scope should remain visible

Correct:

> Project Manager — Project P-20 only

not:

> Project Manager

if assignment is scoped.

---

## Assignment UI should identify Membership, not ambiguous name only

Two users may share names.

Use safe contextual identity:

> Maya Patel · maya@... · Editorial

where frozen UI permits.

---

## Job title should not visually look like security Role

Keep:

> Editorial Director — employee title

separate from:

> Publishing Approver — access Role.

---

## Role edit warnings

If proposed permission change would escalate or orphan administration:

the UI should surface server-derived blocking/warning state.

Frontend must not calculate escalation independently.

---

## Tablet

Following Design 152:

* Role name/lifecycle first;
* permission groups become accordions/stacked sections;
* assigned members move below;
* high-risk changes remain visible;
* effective-access detail becomes expandable.

---

## Mobile

Priority:

```text id="qm2bag"
Role
↓
Lifecycle
↓
High-risk permissions
↓
Permission groups
↓
Assignments
↓
Scope
↓
Safe administration action
```

Avoid rendering a desktop permission matrix horizontally.

---

## Mobile Role card

Conceptually:

> Publishing Manager
> Active
> 18 permissions
> 4 privileged
> Assigned to 6 members
> Organization-wide scope
> Manage Role

---

## Accessibility

A Role detail could communicate:

> Publishing Manager is an active Organization-managed Role with eighteen Permissions. It grants report release, publication scheduling, and Distribution management. Four Permissions are classified as privileged. Six active Organization memberships currently hold this Role. Editing the Role would affect all six assignments. You are authorized to edit the Role but not to grant permissions above your delegation level.

where canonical data supports it.

---

# 7. Backend Requirements

## Canonical authorization architecture

```text id="3kma74"
Request / Command
      ↓
Authenticated User
      ↓
OrganizationMembership
      ↓
RoleAssignments
      ↓
Roles
      ↓
RolePermissionGrants
      ↓
Permissions
      +
AuthorizationScopes/Policies
      ↓
AuthorizationEvaluator
      ↓
ALLOW / DENY
```

Design 144 administration:

```text id="54tw5u"
Design 144
   ↓
AuthorizationAdministrationQueryService
   │
   ├── RoleService
   ├── PermissionRegistry
   ├── RoleAssignmentService
   ├── EffectivePermissionResolver
   ├── PrivilegeEscalationGuard
   └── AdministrativeAccessGuard
```

---

## Permission Registry

One centrally defined registry must drive:

* authorization checks;
* Design-144 UI metadata;
* permission grouping;
* descriptions;
* sensitivity;
* valid scope types.

Do not duplicate permission catalogs in frontend and backend manually.

---

## Backend-generated Permission metadata

Prefer server/API-provided canonical metadata.

Frontend can localize labels but stable key comes from backend registry.

---

## Authorization evaluator

Conceptually:

```text id="9vabgs"
can(
    membership,
    permissionKey,
    resourceContext
)
```

must consider:

1. authenticated identity;
2. active OrganizationMembership;
3. RoleAssignments;
4. RolePermissionGrants;
5. scope/policies;
6. resource tenant;
7. deactivation/revocation;
8. current authorization revision.

---

## Do not authorize from frontend store

Absolute.

Zustand/client session Role data may improve UI.

It is never command/API authority.

---

## API middleware ≠ full authorization policy

Authentication middleware can establish identity.

Resource-level permission checks still belong in service/policy layer.

---

## Generic CRUD endpoints are dangerous

The previous project audit already identified generic CRUD authorization risk.

Role/Permission mutations should use targeted commands, not unrestricted generic resource mutation.

---

## Role creation

Conceptually:

```text id="4tu7qq"
createRole(
    name,
    permissionGrants,
    scopePolicy,
    expectedAuthorizationContext,
    idempotencyKey
)
```

must:

1. authorize;
2. validate tenant;
3. validate each Permission key;
4. validate allowed scope types;
5. check delegation ceiling;
6. prevent escalation;
7. create Role/grants transactionally;
8. increment authorization revision;
9. emit AuditEvent.

---

## Role update

Use:

```text id="8ca6hc"
updateRolePermissions(
    roleId,
    proposedPermissions,
    expectedRoleRevision
)
```

not generic Role PATCH.

---

## Before/after effective-access analysis

Critical.

PrivilegeEscalationGuard should evaluate:

```text id="z1h2fc"
who currently holds Role R?
what Permissions will they gain/lose?
does current actor gain new privileges?
does change violate delegation policy?
does any protected administrator lose access?
```

before commit.

---

## Role mutation affects many users

Role edit is not local.

Example:

```text id="mrz4ex"
Role R assigned to 50 members

Add:
audit.export
```

All 50 may gain it.

Server must assess impact.

---

## High-impact confirmation

If frozen UI includes confirmation for such changes, server should provide authoritative impact summary.

Do not invent a new screen.

---

## Assignment creation

Conceptually:

```text id="ukrsg6"
assignRole(
    membershipId,
    roleId,
    scope?,
    expectedMembershipRevision,
    idempotencyKey
)
```

must:

1. authorize actor;
2. validate Membership active/eligible;
3. validate same Organization;
4. validate Role active/assignable;
5. validate scope;
6. check delegation ceiling;
7. prevent indirect escalation;
8. check administrative-lockout rules;
9. create Assignment;
10. bump authorization revision;
11. Audit.

---

## Duplicate assignments

Define uniqueness based on:

```text id="g5vbvl"
membership
+
role
+
scope
```

where appropriate.

Avoid duplicate identical active RoleAssignments.

---

## Role revocation

Conceptually:

```text id="zvxvwf"
revokeRoleAssignment(...)
```

must evaluate:

* last administrator;
* active critical workflows if policy requires awareness;
* effective access after removal.

---

## Last-admin protection

Strong invariant:

```text id="ka758n"
after proposed mutation,
at least one active authorized
administrative membership remains
```

according to Organization governance model.

---

## Organization owner semantics

If a canonical Owner role exists, it may need stricter invariants.

Do not assume one now.

Phase 3D can formalize.

---

## Self-revocation

Can be allowed only under safe conditions.

Server—not frontend—decides.

---

## Role deletion

Prefer archival/deactivation over destructive deletion once historical Assignments/AuditEvents reference it.

---

## Role archive

Should:

* prevent new assignments;
* preserve history;
* define treatment of existing Assignments explicitly.

Possible policies:

1. archived Role keeps existing effective permissions until assignments revoked; or
2. archival revokes effectiveness.

This must be explicit in Phase 3D.

Do not let UI imply one accidentally.

---

## Permission removal

Should trigger immediate authorization revision/invalidation.

---

## Authorization revision

One practical architecture:

```text id="cqudfk"
organization.authorizationRevision
```

and/or:

```text id="a1sfd7"
membership.authorizationRevision
```

increments after security changes.

Used for:

* cache keys;
* session revalidation;
* search/analytics permission caches.

---

## Session invalidation

High-risk changes may require:

* immediate reauth;
* token/session permission refresh;
* forced logout for revoked users;

according to session architecture.

Do not wait for hours-long stale JWT claims to expire if privileges were revoked.

---

## JWT role claims

Avoid treating long-lived JWT-contained Role lists as authoritative after changes.

Use:

* short TTL;
* authorization revision;
* server lookup/introspection.

---

## Authorization cache

Must invalidate on:

* Role permission changes;
* Assignment changes;
* Membership deactivation;
* scope changes;
* Permission registry changes.

---

## Cache fail closed

If authorization state cannot be safely resolved:

high-risk operations should deny rather than assume access.

---

## EffectivePermissionResolver

Conceptually:

```text id="rj5szx"
resolveEffectivePermissions(
    membershipId,
    scopeContext?
)
```

should return:

* grants;
* source Roles;
* scopes;
* current validity.

Useful for Design 144 inspection.

---

## Effective access preview

Before mutation, server can calculate:

> proposed effective access.

This is a preview, not committed truth.

---

## No client-computed privilege preview authority

Frontend can display server result.

---

## Scope evaluation

Use typed scope checks:

```text id="64jctq"
Organization scope
Project scope
Client scope
```

not string prefix matching routes.

---

## Resource tenant validation

Every authorization call must validate resource tenant independently.

Permission:

> project.read

does not permit reading a Project from another tenant.

---

## Cross-resource references

When assigning a scope:

Project/Client/Team references must belong to same Organization.

---

## Permission namespace governance

Avoid permission-key collisions.

Use domain-oriented stable namespaces.

---

## Deprecated permissions

Permission registry migration must define mapping/replacement.

Do not silently reuse deprecated key with new meaning.

---

## No permission key semantic reuse

If:

```text id="k2jgo0"
finance.manage
```

changes meaning materially, version/deprecate rather than silently broadening it.

---

## Role templates

If frozen design includes Role templates:

template ≠ Role.

Creating from template snapshots Permission grants.

Later template changes do not silently mutate existing tenant Role unless explicitly designed.

Do not invent if absent.

---

## Bulk assignment

If frozen UI supports bulk:

each Membership must be individually validated.

Partial result handling:

```text id="b47a8q"
10 selected

8 assigned
1 inactive
1 would violate policy
```

Do not all-or-nothing unless intentional.

---

## Bulk permission editing

Role edits are one transaction against Role.

Impact across Assignments is derived afterward.

---

## AuditEvents

Design 138 should receive strong Audit evidence for:

* Role created;
* Role permission changed;
* Role archived;
* Role assigned/revoked;
* privileged permission granted;
* administrative protection override if allowed.

Safe ChangeSets might show:

```text id="p5mo03"
Role:
Editor

Permissions added:
publication.release
report.release
```

No secrets involved.

---

## Audit actor/history

Historical Role name/permission context should be reconstructable.

Role rename later must not corrupt old Audit meaning.

---

## Activity

Ordinary role/security changes may appear in admin Activity if frozen product supports it.

But Audit is canonical governance evidence.

---

## Notifications

Design 143 may optionally notify on critical Role changes according to explicit Alert Rules.

Role change itself does not rely on Notification for security enforcement.

---

## Alert Rule recipient roles

When Design 143 resolves:

> notify Integration Administrators

it should query canonical active RoleAssignments.

If Role changes, future recipient resolution changes.

Past Notification history remains.

---

## API/Developer Access

Design 146 should reuse PermissionRegistry/scoping primitives where appropriate.

But API credential scopes and human RoleAssignments remain separate entities.

---

## Query service

Conceptually:

```text id="t6dwdv"
getRoleAdministration(
    filters,
    currentMembership
)
```

should:

1. authenticate;
2. resolve tenant;
3. authorize IAM administration read;
4. load Roles;
5. load safe Permission registry metadata;
6. compute assignment counts permission-safely;
7. load selected Assignments;
8. derive effective-access summaries;
9. expose allowed actions.

---

## Assignment counts

Should not leak hidden Memberships.

---

## Role impact count

If current administrator can manage Roles but not view all employee details:

could return aggregate assignment count without names under explicit policy.

Do not accidentally leak identities.

---

## Concurrency

Critical races:

### Two admins edit same Role

Use expected Role revision.

### Admin A revokes user while Admin B grants new Role

Transactions/effective-access guards must evaluate current state.

### Two admins both remove the other last admin

Last-admin guard must serialize/transactionally prevent orphaning.

### Membership deactivated during Role assignment

Assignment revalidates active state before commit.

---

## Authorization changes must be serializable enough

High-risk security invariants deserve strong transaction isolation/locking on relevant Role/Assignment/admin-count rows.

---

## Idempotency

Required for:

* Role create;
* Role assignment;
* revocation;
* archival;
* bulk operations.

---

## Permission management commands

If Permission Registry is code/system-defined:

Design 144 may only assign existing Permissions.

It should not allow admins to invent arbitrary permission strings.

This is the safer default.

---

## Custom Permissions

Do not support arbitrary custom Permission definitions unless the platform later has a genuine extensibility model.

---

## Search indexing

Search index must not retain stale authorization after Role changes.

Design 079 must include authorization revision invalidation.

---

## Analytics permission caches

Design 038/135/137 must invalidate/re-evaluate after Role changes.

---

## File/access signed URLs

Permission revocation should not necessarily revoke already-issued short-lived signed URLs immediately unless security model supports it.

Keep signed URL TTL short and controlled.

---

## Long-running operations

If a user's permission is revoked while a background job they initiated runs:

execution authority must follow that domain's explicit service/authorization policy.

Do not blindly continue as the user forever.

---

## Integration/Automation service actors

Designs 139–142 use governed service execution identities.

Human Role administration must not expose service credentials as user Roles.

---

## Performance

Use:

* indexed RoleAssignments;
* cached effective Permission projections;
* batched assignment summaries;
* stable Permission registry cache;
* lazy member lists;
* revision-keyed authorization caches.

Avoid recalculating every user's entire permission matrix on every Role-list render.

---

## Partial failure contract

Example:

```text id="ew4f4f"
Role definitions      ✓
Permission registry   ✓
Assignment service    ✕
```

Correct:

> Role definitions are available; current assignment details are unavailable.

Incorrect:

> No one is assigned.

Another:

```text id="spzve8"
Role R                ✓
Member profile        unavailable
RoleAssignment        ✓
```

Correct:

> Assignment exists; current member profile cannot be loaded.

Not:

> Assignment invalid.

Another:

```text id="l9v79d"
Effective access resolver unavailable
```

Correct:

> Role configuration is available; effective-access preview cannot currently be verified. Privileged mutation should be blocked until authorization evaluation is available.

Not:

> Assume safe.

---

## Backend Requirement Matrix

| Requirement                                    | Status                    |
| ---------------------------------------------- | ------------------------- |
| Design 037 canonical Role/Permission reuse     | **Critical**              |
| No second RBAC system                          | **Critical**              |
| User/Membership/RoleAssignment separation      | **Critical**              |
| Role/JobTitle separation                       | **Critical**              |
| Role/TeamMembership separation                 | **Critical**              |
| Role/ProjectRole separation                    | **Critical**              |
| Internal Role/Client Portal Role separation    | **Critical**              |
| Role/Permission separation                     | **Critical**              |
| Permission/RolePermissionGrant separation      | **Critical**              |
| RoleAssignment/Role separation                 | **Critical**              |
| Grant/effective-access separation              | **Critical**              |
| Stable Permission Registry                     | **Critical**              |
| Stable permission keys                         | **Critical**              |
| Permission/UI label separation                 | **Critical**              |
| Permission/route separation                    | **Critical**              |
| Server-authoritative authorization             | **Critical**              |
| Permission before data/action access           | **Critical**              |
| Typed AuthorizationScope                       | **Critical**              |
| No route/string-prefix scope logic             | **Critical**              |
| Cross-tenant assignment prohibition            | **Critical**              |
| Resource tenant validation                     | **Critical**              |
| PrivilegeEscalationGuard                       | **Critical**              |
| Self-escalation prevention                     | **Critical**              |
| Indirect Role-edit escalation prevention       | **Critical**              |
| Delegation ceiling                             | **Critical**              |
| Last-admin protection                          | **Critical**              |
| Self-lockout protection                        | **Critical**              |
| Membership deactivation overrides Roles        | **Critical**              |
| Role modification impact analysis              | **Critical**              |
| Multiple grant-source resolution               | **Critical**              |
| No arbitrary Permission creation               | **Critical default**      |
| Role archival/history preservation             | **Critical**              |
| Permission deprecation/history safety          | **Critical**              |
| EffectivePermissionProjection rebuildable      | **Critical**              |
| Authorization revision/cache invalidation      | **Critical**              |
| Stale JWT/Role claim mitigation                | **Critical**              |
| High-risk authorization fail-closed behavior   | **Critical**              |
| Optimistic concurrency                         | **Critical**              |
| Strong transactional admin invariants          | **Critical**              |
| Audit logging of privileged changes            | **Critical**              |
| Design 143 role-recipient reuse                | **Critical architecture** |
| Design 146 scope/permission primitive reuse    | **Critical architecture** |
| Permission-aware Search/Analytics invalidation | **Critical**              |
| Idempotent admin commands                      | **Critical**              |
| Partial dependency failure handling            | **Critical**              |

---

# 8. Consolidation

Design 144 is one of the highest-security screens in the entire 153-design system. The primary risk is not visual duplication; it is **privilege escalation, stale authorization, cross-tenant leakage, and hidden coupling between workforce labels and security authority**.

**Design 037 / Design 144 RBAC duplication**
Two Role/Permission systems emerge.

**User / OrganizationMembership conflation**
Global account receives tenant-global permissions.

**User / RoleAssignment conflation**
Roles follow person across Organizations incorrectly.

**EmployeeProfile / RoleAssignment conflation**
HR profile becomes security identity.

**JobTitle / Role conflation**
"Director" becomes permission grant.

**TeamMembership / Role conflation**
Team membership automatically grants access.

**ProjectTeamMembership / RoleAssignment conflation**
Delivery responsibility becomes security authority.

**Manager / permission conflation**
Manager relation bypasses RBAC.

**Client Portal role / internal Role conflation**
Client users gain internal access.

**Role / Permission conflation**
Single access-level enum replaces granular capability model.

**Role / RoleAssignment conflation**
Reusable security bundle and Membership binding merge.

**Permission / RolePermissionGrant conflation**
Removing one grant deletes Permission definition.

**Role grant / effective Permission conflation**
Multiple Role sources are ignored.

**Direct Role permission / scope conflation**
Organization-wide access leaks from a Project-scoped assignment.

**Scope / route conflation**
URL structure determines access.

**Scope / Team membership conflation**
Being on Team becomes resource authorization.

**Permission key / UI label conflation**
Copy changes break security logic.

**Permission / route visibility conflation**
Hidden sidebar item is treated as security.

**Frontend `can()` / backend authorization conflation**
API accepts actions based on client state.

**Cached Role list / authoritative permission conflation**
Revoked access remains usable.

**JWT claims / current authorization conflation**
Long-lived sessions preserve deleted privileges.

**Role edit / local configuration conflation**
One Role edit silently escalates dozens of users.

**Role edit / actor privilege ceiling conflation**
Editor adds Admin permission to their own Role.

**Role assignment / membership edit conflation**
User with Team-admin permission grants Security-admin Role.

**Role creation / Role assignment conflation**
Defining a Role means user can grant it.

**Role cloning / safe delegation conflation**
Cloned privileged Role bypasses restrictions.

**Self-assignment / normal assignment conflation**
Administrator grants themselves arbitrary power.

**Self-role edit / normal Role edit conflation**
User escalates via Role they already hold.

**Direct escalation / indirect escalation conflation**
System checks target Role name rather than before/after effective permissions.

**Permission possession / delegation authority conflation**
User can grant every Permission they happen to possess.

**Role rename / Role identity conflation**
Audit/history references break.

**Permission rename / Permission identity conflation**
Authorization semantics drift.

**Permission deprecation / deletion conflation**
Historical Audit becomes uninterpretable.

**Role archive / deletion conflation**
Assignment history disappears.

**Role archived / assignments automatically revoked conflation**
Behavior becomes ambiguous.

**Membership deactivated / Role revoked conflation**
Historical RoleAssignment evidence disappears.

**Role revoked / user deleted conflation**
Identity history is corrupted.

**One Role removed / effective access removed conflation**
Another Role still grants Permission.

**Permission removed from Role / Permission removed globally conflation**
Other Roles break.

**Role count / authorized member visibility conflation**
Member information leaks through admin metrics.

**Assignment list / employee directory conflation**
Authorization UI becomes HR directory.

**Role recipient / Alert permission conflation**
Alert role targeting mutates RBAC.

**API key scope / human RoleAssignment conflation**
Service credentials become human users.

**Service actor / RoleAssignment conflation**
Automation credentials appear as Team members.

**Organization owner label / security authority conflation**
Unmodeled label becomes root access.

**System Role / Organization Role conflation**
Tenant admin edits protected platform role.

**System Role template / Role instance conflation**
Template update mutates tenant Roles unexpectedly.

**Role inheritance / simplicity conflation**
Nested Roles introduce cycles/escalation unexpectedly.

**Explicit deny / allow-only semantics conflation**
Policy precedence becomes unpredictable.

**Permission condition / arbitrary code conflation**
Security evaluator executes JS/SQL.

**Policy condition / Permission conflation**
Scope semantics disappear.

**RoleAssignment scope / source business relation conflation**
Project assignment creates ProjectTeamMembership incorrectly.

**EffectivePermissionProjection / source truth conflation**
Cached projection outlives real revocation.

**Authorization cache / ordinary data cache conflation**
Stale permission is tolerated.

**Fail-open / partial service failure conflation**
Permission resolver outage grants access.

**Last admin / ordinary assignment conflation**
Organization becomes locked out.

**Two concurrent admin removals / independent safe edits conflation**
Race eliminates all administrators.

**Generic CRUD / security command conflation**
PATCH API bypasses escalation guards.

**Generic `role.permissions JSON`**
No registry/integrity/delegation semantics.

**Generic `user.role = "admin"`**
Cannot represent multiple scoped Roles.

**Generic `access_level` integer**
Privilege semantics become opaque.

**Generic `is_admin=true`**
Bypasses granular RBAC.

**Generic `permissions[]` from frontend**
Client defines valid authorization universe.

**Generic `scope JSON`**
Cross-tenant arbitrary resource references.

**Generic `manager=true`**
Org chart becomes security model.

**Generic `can_manage=true`**
No domain/action semantics.

**Generic Role PATCH**
Privilege escalation surface.

**144/036 duplicate workforce identity**
Roles and employees merge.

**144/037 duplicate authorization domain**
Canonical RBAC forks.

**144/112 duplicate Project role semantics**
Delivery roles become permissions.

**144/138 missing privileged-change Audit**
Security changes become untraceable.

**144/143 Role recipient coupling**
Alert rules mutate authorization.

**144/146 human/API access conflation**
Developer credentials become RoleAssignments.

**144/149 global configuration conflation**
Platform settings become authorization source.

No additional screen is required.

These are **single RBAC authority, stable Permission Registry, scoped RoleAssignment semantics, privilege-escalation prevention, delegation ceilings, lockout protection, revision-aware authorization invalidation, and strict workforce/project/client/API identity boundaries**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL INTERNAL ROLE, PERMISSION, SCOPED ASSIGNMENT & PRIVILEGE-GOVERNANCE ANCHOR**

**Domain directive:**
**Role ≠ Permission ≠ RolePermissionGrant ≠ RoleAssignment ≠ AuthorizationScope ≠ AuthorizationPolicy ≠ EffectivePermissionProjection ≠ OrganizationMembership ≠ EmployeeProfile ≠ TeamMembership ≠ ProjectTeamMembership ≠ JobTitle ≠ ClientPortalRole.**

**Foundation directive:**
Design 037 remains the single canonical internal authorization foundation. Design 144 is the advanced administrative/governance surface over the same Roles, Permissions, Assignments, scopes, and evaluator.

**Permission-registry directive:**
all product authorization capabilities originate from one stable `PermissionRegistry` with canonical keys, domain ownership, sensitivity classification, valid scope types, lifecycle, and human-readable metadata.

**Stable-key directive:**
permission identity is never derived from page labels, button text, routes, navigation labels, job titles, or frontend strings.

**Role directive:**
`Role` is a reusable bundle of Permission grants and never a user, job title, Team, Project role, or Client Portal identity.

**Membership directive:**
RoleAssignments bind to canonical tenant-scoped OrganizationMembership rather than global User identity, ensuring permissions do not leak across Organizations.

**Assignment directive:**
`RoleAssignment` remains distinct from Role and records who has which Role under which valid scope/effective period.

**Grant directive:**
`RolePermissionGrant` links a Role to a Permission; removing one grant never deletes or redefines the Permission itself.

**Effective-access directive:**
effective authorization is derived from active Membership + active Assignments + Role grants + scope/policy and can have multiple grant sources.

**Multiple-source directive:**
removing one Role does not revoke an effective Permission when another valid Role/Assignment still grants it.

**Scope directive:**
organization/project/client/team/resource scopes are typed canonical resource references and never arbitrary route prefixes, free-form JSON, or client-supplied strings.

**Tenant directive:**
every Role, Membership, Assignment, and scoped resource reference is validated for tenant compatibility before authorization or mutation.

**Workforce directive:**
EmployeeProfile, job title, manager relationship, TeamMembership, and reporting line remain Design-036 workforce concepts and never grant authorization by themselves.

**Project-role directive:**
Design-112 delivery roles and ProjectTeamMembership remain operational Project staffing concepts and cannot silently become security Roles.

**Client-portal directive:**
Client Portal roles/access remain a separate portal authorization domain. Internal Team Workspace RoleAssignments cannot be reused to grant Client users internal privileges.

**Server-authority directive:**
backend service/policy checks remain the only authorization authority. Sidebar visibility, React conditions, client stores, cached user objects, and disabled buttons are presentation only.

**Authentication/authorization directive:**
successful authentication establishes identity; every protected operation still resolves current Membership and Permission scope separately.

**Privilege-escalation directive:**
one central `PrivilegeEscalationGuard` analyzes the **before/after effective authorization impact** of Role edits and assignments rather than checking only the target Role name or UI action.

**Self-escalation directive:**
administrators cannot gain new privileges by assigning themselves elevated Roles, editing Roles they already hold, cloning privileged Roles, or modifying lower Roles to contain higher Permissions.

**Indirect-escalation directive:**
all Role edits consider every currently assigned Membership so a user cannot indirectly escalate themselves or others beyond their authorized delegation ceiling.

**Delegation directive:**
ability to hold a Permission does not automatically grant ability to delegate it; explicit delegation policy/ceiling controls which permissions/roles the actor may assign.

**Assignment directive:**
Role creation, Role editing, Permission composition, Role assignment, and Assignment revocation remain separately authorized capabilities.

**System-role directive:**
system-managed/protected Roles, if present, remain distinguishable from Organization-managed Roles and cannot be silently rewritten by tenant administrators.

**Role-history directive:**
Role rename/archive or Permission deprecation never destroys historical identity, Assignment evidence, or Audit interpretability.

**Role-archive directive:**
archival is a lifecycle action rather than hard deletion; exact treatment of existing active Assignments must be explicit in Phase 3D and never accidental.

**Permission-history directive:**
deprecated/retired Permission keys remain historically interpretable and are never reused later for materially different security semantics.

**Last-admin directive:**
one canonical `AdministrativeAccessGuard` prevents security changes that would leave the Organization without viable authorized administration.

**Self-lockout directive:**
self-revocation/reduction is permitted only under explicit safe policy with server validation and appropriate confirmation where the frozen UI supports it.

**Concurrency directive:**
Role edits, Assignment changes, Membership deactivation, and last-admin checks use revision/transaction/locking controls so concurrent administrators cannot bypass privilege or lockout invariants.

**Membership-state directive:**
deactivated/suspended Membership state overrides active RoleAssignments; Roles can never reactivate access implicitly.

**Authorization-revision directive:**
security mutations increment tenant/membership authorization revisions used to invalidate effective-permission caches, search/analytics visibility caches, and stale session claims.

**Session directive:**
long-lived JWT/session Role claims can never remain authoritative indefinitely after revocation; authorization revision/introspection/short-lived claims must ensure changes take effect promptly.

**Fail-closed directive:**
when high-risk authorization state cannot be resolved reliably, protected operations deny rather than assume access.

**Role-impact directive:**
Role changes are evaluated across every affected active Assignment because adding one Permission to one Role can grant that Permission to many memberships simultaneously.

**Preview directive:**
effective-access and proposed-change impact previews are computed server-side and remain advisory projections until the guarded mutation commits.

**No-generic-CRUD directive:**
Role/Permission/Assignment security mutations use targeted services/commands with authorization, escalation, scope, concurrency, and Audit checks rather than unrestricted generic CRUD/PATCH endpoints.

**Idempotency directive:**
Role creation, assignment, revocation, archival, and bulk security operations use idempotency/uniqueness rules appropriate to the action.

**Audit directive:**
Design 138 receives strong append-oriented AuditEvents for Role creation, Permission-grant changes, Role assignment/revocation, privileged access grants, archive, and any exceptional security override without conflating Audit with current authorization truth.

**Activity directive:**
optional human-friendly admin Activity remains separate from canonical security state and Audit evidence.

**Alert directive:**
Design 143 may resolve alert recipients from canonical active RoleAssignments, but Alert Rules cannot create, change, or infer authorization semantics.

**API-access directive:**
Design 146 may reuse stable Permission identifiers/scoping concepts for API/developer credentials where appropriate, while API keys/service principals remain separate from human OrganizationMembership/RoleAssignment.

**Search directive:**
Design 079 authorized search projections must invalidate/re-filter when authorization revisions change so revoked users do not continue seeing indexed metadata.

**Analytics directive:**
Designs 038/135/137 must never use stale broader-role analytical caches after permission revocation; authorization revisions participate in cache/query scope.

**Integration/Automation directive:**
service actors and Integration/Automation execution authority remain explicit service identities/policies and are not modeled as ordinary employee RoleAssignments unless a canonical service-principal model explicitly says so.

**Bulk directive:**
if frozen Design 144 supports bulk Role assignment/revocation, each target membership is tenant/eligibility/escalation checked independently and partial outcomes remain explicit.

**Query directive:**
Role Administration list/detail/counts are permission-safe; users only see Roles, Membership identities, Assignment counts, effective-access data, and sensitive Permissions they are authorized to inspect.

**Caching directive:**
authorization caches are revision-keyed, aggressively invalidated after security changes, and never treated like tolerant ordinary content caches.

**Performance directive:**
use indexed RoleAssignments, stable Permission Registry caching, batched Assignment summaries, lazily loaded member lists, and rebuildable effective-access projections without compromising live server authorization checks.

**Partial-failure directive:**
Role, Permission Registry, Assignment, Membership-profile, and effective-access services may fail independently. `Unavailable` can never become `No assignments`, `Permission granted`, `Permission safe to delegate`, or `No administrator risk` without evidence; privileged changes fail closed if safety evaluation is unavailable.

**Future-reuse directive:**
Design **145 — Workspace / Organization Administration** must reuse canonical Organization, OrganizationMembership, Team/user governance, Settings, and Design-144 authorization primitives while remaining distinct from Role/Permission administration. Organization administration can manage membership/workspace lifecycle, but it must never substitute organization title/ownership labels or settings flags for canonical RBAC Permissions.

**Overlap directive:**
Designs **036–040, 062, 112, 138, 143–149** must preserve one continuous **authenticated User → tenant OrganizationMembership → explicit scoped RoleAssignments → RolePermissionGrants → stable PermissionRegistry → server AuthorizationEvaluator → effective permission decision → privileged-change AuditEvent**, while workforce titles, Project roles, Client roles, Alert recipient policies, API credentials, Settings, and UI visibility remain separately canonical.

**Consolidation directive:**
**STANDARDIZE ONE INTERNAL RBAC & AUTHORIZATION-ADMINISTRATION FOUNDATION — DESIGN-037 CANONICAL ROLE/PERMISSION/ROLEASSIGNMENT IDENTITIES + ONE STABLE PERMISSION REGISTRY + TENANT MEMBERSHIP-SCOPED ASSIGNMENTS + TYPED RESOURCE SCOPES + SERVER-SIDE EFFECTIVE-PERMISSION EVALUATION + PRIVILEGE-ESCALATION/DELEGATION GUARDS + LAST-ADMIN/SELF-LOCKOUT PROTECTION + ROLE-IMPACT ANALYSIS + AUTHORIZATION REVISION/CACHE/SESSION INVALIDATION + STRONG PRIVILEGED-CHANGE AUDIT — AND NEVER ALLOW JOB TITLES, MANAGER FLAGS, TEAM/PROJECT MEMBERSHIP, CLIENT ROLES, SIDEBAR VISIBILITY, FRONTEND `CAN()` CHECKS, JWT ROLE CLAIMS, GENERIC `IS_ADMIN`, ROLE NAME STRINGS, `ACCESS_LEVEL` INTEGERS, GENERIC CRUD OR ARBITRARY PERMISSION/SCOPE JSON TO SUBSTITUTE FOR OR REWRITE CANONICAL AUTHORIZATION TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **144 / 153** |
| **PASS**                                   |                        **144** |
| **STANDARDIZE decisions**                  |                        **142** |
| **Potential implementation-overlap flags** |                        **135** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**144 / 153 = 94.1% audited.**

### Canonical Authorization architecture after Design 144

```text id="pvpu6z"
USER
  │
  ↓
ORGANIZATION MEMBERSHIP
  │
  ├── RoleAssignment → Role A
  │                       ↓
  │                  Permissions
  │
  └── RoleAssignment → Role B
                          ↓
                     Permissions
                          │
                          ↓
                 Scope / Policy
                          │
                          ↓
               AuthorizationEvaluator
                          │
                          ↓
                    EFFECTIVE ACCESS
```

The strongest security boundary is now explicit:

```text id="krb005"
EmployeeProfile:

Job title = Editorial Director
Team = Editorial
Manager = Yes

This does NOT automatically mean:

publication.release = granted


Only canonical authorization can grant it:

OrganizationMembership
        ↓
RoleAssignment
        ↓
Role
        ↓
Permission
        ↓
Scope / Policy
```

Indirect privilege escalation is also blocked:

```text id="e9jnlk"
User currently holds:

Editor Role

User is allowed to edit
some Role configuration.

Unsafe system:

User edits Editor Role
and adds:

role.manage
audit.export
integration.disconnect

Because the user already holds
Editor Role,
they instantly become privileged.


Correct system:

PrivilegeEscalationGuard
computes BEFORE vs AFTER
effective access

and rejects the mutation.
```

Multiple Role grants remain correct:

```text id="1dh4ja"
Member has:

Role A
→ report.read

Role B
→ report.read
→ report.release


Remove Role B.

RESULT:

report.release = removed

report.read = still granted
through Role A.


Removing one Role
        ≠
removing every Permission
it happened to contain.
```

Administrative lockout is also protected:

```text id="24y60z"
Organization has:

Admin A
Admin B

Both simultaneously attempt
to revoke the other's admin access.


Without transactional guard:

A loses admin
B loses admin
Organization has no administrator.


Correct:

AdministrativeAccessGuard
evaluates/locks the invariant:

at least one valid administrator
must remain.
```

And frontend visibility can no longer be mistaken for security:

```text id="pxoxu7"
Sidebar hides:

Role Administration

BUT:

that does NOT secure the API.


Every backend command must still check:

current Membership
current RoleAssignments
current Permissions
current resource scope
current authorization revision
```

## Next Sequential Audit Target

### **Design 145 — Workspace / Organization Administration**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
