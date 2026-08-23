# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 037 — Roles & Permissions Management

Design 037 should become the **canonical authorization-administration workspace for the entire Team Workspace**.

Its responsibility is not simply to show a table of roles. It must define, assign, evaluate, inspect, and safely modify **who can do what, on which records, within which organizational scope**, while keeping identity and workforce membership in Design 036 separate from authorization.

| Audit field                  | Classification                                                                                                 |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Design ID**                | **037**                                                                                                        |
| **Canonical name**           | **Roles & Permissions Management**                                                                             |
| **Product area**             | Identity & Access / Authorization / Administration                                                             |
| **User surface**             | Team Workspace                                                                                                 |
| **Screen class**             | Security Administration + Authorization Policy Workspace                                                       |
| **Classification**           | **Unique Anchor — Platform Authorization Administration Family**                                               |
| **Primary purpose**          | Define Roles, permission bundles, assignments, scope restrictions and effective access across the organization |
| **Primary entities**         | **Role, Permission, RoleAssignment**                                                                           |
| **Core supporting entities** | OrganizationMembership, PermissionGrant, PermissionScope, Policy/Constraint, RolePermission, AssignmentHistory |
| **Related entities**         | User, Team, Department, Project, Client, AuditEvent, Integration/API credentials where separately authorized   |
| **Parent shell**             | `InternalAppShell` — Design 001                                                                                |
| **Identity dependency**      | Design 036 — Team / Employee Management                                                                        |
| **Audit dependency**         | Design 039 — Audit Logs                                                                                        |
| **Template family**          | `AuthorizationAdministrationWorkspaceTemplate`                                                                 |
| **Composition**              | `RolesPermissionsComposition`                                                                                  |
| **Auth**                     | Required                                                                                                       |
| **Authorization**            | Extremely restricted administrative authority                                                                  |
| **Implementation priority**  | **Critical Security Foundation**                                                                               |
| **Reuse level**              | **Platform-wide / Maximum**                                                                                    |

The central invariant is:

> **User ≠ OrganizationMembership ≠ Role ≠ Permission ≠ RoleAssignment ≠ Effective Access.**

---

# 1. Functional responsibility

Design 037 must answer:

> **“Which Roles exist, what capabilities does each Role grant, who has each Role, where does that authority apply, what access does a specific person effectively have, and what will change if I modify this policy?”**

Canonical flow:

```text
User / Identity
      ↓
OrganizationMembership
      ↓
RoleAssignment
      ↓
Role
      ↓
Permissions
      ↓
Scope / Policy
      ↓
Effective Authorization
      ↓
Server-side access decision
```

This screen administers authorization configuration.

It does **not** itself become the runtime authorization engine.

---

# 2. Design 036 vs Design 037

This boundary must remain extremely clear.

### Design 036 — Team / Employee Management

Answers:

> Who belongs to the organization?

### Design 037 — Roles & Permissions

Answers:

> What may that member do?

Therefore:

```text
OrganizationMembership
≠
RoleAssignment
```

A user can remain an active employee while their Role changes completely.

---

# 3. Job title ≠ Role

Example:

```text
Job Title:
Editorial Director

Security Role:
Editorial Manager
```

The Role should never be inferred from a free-text job title.

Incorrect:

```ts
if (employee.title.includes("Director")) {
  allowAdmin();
}
```

Correct:

```text
OrganizationMembership
      ↓
explicit RoleAssignment
```

---

# 4. Team membership ≠ Role assignment

A user belonging to:

> Video Production Team

does not automatically imply:

> `video.publish`

unless an explicit policy intentionally grants such access.

Correct:

```text
TeamMembership
≠
RoleAssignment
```

Teams organize people.

Roles authorize actions.

---

# 5. Manager relationship ≠ administrator

Design 036 established manager relationships.

A Manager might receive expanded visibility over their Team, but:

```text
Manager
≠
Organization Administrator
```

A reporting hierarchy must never silently become a security hierarchy.

---

# 6. Role

A canonical Role should conceptually contain:

```text
Role
├── id
├── organization/workspace
├── name
├── description
├── system/custom classification
├── active state
├── permissions
└── metadata
```

Exact schema belongs to Phase 3D.

---

# 7. Permission

A Permission represents a specific capability.

Examples conceptually:

```text
lead.read
lead.edit

contract.read
contract.send

invoice.record_payment

approval.decide

publication.publish

settings.manage
```

Exact permission names must be standardized later.

Do not scatter ad-hoc strings through frontend code.

---

# 8. Role ≠ Permission

Role:

> Editorial Manager

Permissions:

```text
editorial.read
editorial.edit
editorial.assign
draft.review
approval.decide
```

A Role is a reusable authorization bundle.

Permissions remain the atomic capabilities.

---

# 9. RolePermission should be explicit

Conceptually:

```text
Role
   ↓
RolePermission
   ↓
Permission
```

Do not store permissions as uncontrolled comma-separated strings such as:

```text
"edit,delete,admin"
```

The permission catalog needs stable identifiers.

---

# 10. Permission catalog should be centrally registered

Design 037 needs one canonical Permission Registry.

Conceptually:

```text
PermissionRegistry
├── CRM
├── Sales
├── Clients
├── Projects
├── Editorial
├── Magazine
├── Podcast
├── Video
├── Events
├── Finance
├── Publishing
├── Distribution
├── Reporting
├── People
└── Administration
```

The UI can group permissions by module.

The backend must use the same registry.

---

# 11. UI permission names ≠ implementation identifiers

The user may see:

> Publish Content

while the canonical permission may be:

```text
publication.publish
```

Display labels can change.

Permission identifiers should remain stable.

---

# 12. Permission ≠ route access only

Authorization must protect:

* API commands,
* data queries,
* exports,
* files,
* navigation,
* sensitive fields.

Incorrect:

```text
hide /finance menu
=
finance secured
```

Correct:

```text
UI visibility
+
server authorization
+
query scope
+
command authorization
```

---

# 13. Navigation entitlement is derived

TeamShell can use effective permissions to determine which navigation items appear.

But sidebar visibility is only presentation.

A hidden route/API must still reject unauthorized access directly.

---

# 14. RoleAssignment

A canonical assignment conceptually includes:

```text
RoleAssignment
├── memberId
├── roleId
├── organizationId
├── scope if applicable
├── assignedBy
├── assignedAt
├── effective period where supported
└── state/history
```

Assignments should be auditable.

---

# 15. Direct role assignment ≠ role definition

Changing:

```text
Emma → Editorial Manager
```

should not modify the Editorial Manager Role itself.

Likewise editing the Role should affect all assignments according to defined policy.

These are separate commands.

---

# 16. Role changes can have wide blast radius

If:

```text
Editorial Manager
```

is assigned to 24 members and an administrator adds:

```text
contract.cancel
```

the change may immediately affect all 24 users.

Design 037 must therefore treat Role editing as a high-impact security operation.

---

# 17. Role edit preview / impact is backend data, not a new screen

Before sensitive Role changes, the workspace should be able to communicate:

```text
Affected members
Affected Teams/scopes
Added capabilities
Removed capabilities
```

This is an implementation/read-model requirement, not an additional design.

---

# 18. Effective access ≠ assigned Role alone

A member's actual authority may depend on:

```text
Role(s)
+
record scope
+
organization membership
+
ownership/team rules
+
special constraints
```

Therefore:

> **Assigned Role ≠ Effective Permission automatically.**

The runtime authorization service evaluates effective access.

---

# 19. Multiple Roles

Architecture should not assume one Role forever.

Example:

```text
Emma
├── Editorial Manager
└── Publishing Operator
```

may be legitimate.

Phase 3D should decide whether V1 supports:

* one Role,
* multiple additive Roles,
* primary Role + supplemental grants.

The schema should avoid a dead-end `user.role` string.

---

# 20. Multiple Role semantics must be defined

If multiple Roles are supported, clarify whether permissions are:

```text
union / additive
```

and how restrictions interact.

Never invent inconsistent behavior where one screen treats Role B as replacing Role A and another combines them.

---

# 21. Permission scope

Capabilities often need a scope.

Example:

```text
project.read
Scope:
OWN
```

vs:

```text
project.read
Scope:
ORGANIZATION
```

Potential conceptual scopes include:

```text
OWN
ASSIGNED
TEAM
DEPARTMENT
CLIENT
PROJECT
ORGANIZATION
```

Exact allowed scopes vary by permission and belong to Phase 3D.

---

# 22. Permission ≠ scope

Separate:

```text
Capability:
deal.edit

Scope:
team
```

Do not encode combinations into thousands of permission identifiers such as:

```text
deal.edit.team
deal.edit.department
deal.edit.organization
```

unless a deliberate architecture chooses that model.

---

# 23. Scope must be enforced server-side

Example:

```text
Role:
Sales Rep

Permission:
deal.edit

Scope:
OWN
```

The backend query/command layer must enforce:

```text
deal.ownerId == currentUser
```

or the canonical ownership policy.

Frontend filtering is insufficient.

---

# 24. Row-level security semantics

Authorization must eventually answer:

> Can this actor perform this action on **this record**?

Conceptually:

```text
can(actor, "deal.edit", deal)
```

not merely:

```text
hasPermission("deal.edit")
```

for sensitive domain operations.

---

# 25. Field-level permission

Some records contain fields requiring different authority.

Example:

```text
Client:
name         → broad read
financials   → Finance/authorized users
internalRisk → internal only
```

Architecture should support field-safe projections where needed.

Design 037 may manage high-level capabilities; actual field rules can be policy-driven.

---

# 26. Read ≠ edit

Permanent platform rule:

```text
record.read
≠
record.edit
```

Do not create broad permissions such as:

```text
client.manage
```

as the only control when viewing and mutation have different risk.

---

# 27. Edit ≠ delete

Similarly:

```text
asset.edit
≠
asset.delete
```

and:

```text
contract.edit
≠
contract.cancel
```

High-impact/destructive actions need independent authority.

---

# 28. View ≠ export

This principle is especially important for:

* Leads,
* Client data,
* files,
* Event registrants,
* employee data,
* Reports.

A user may view a record without being permitted to export data in bulk.

---

# 29. Edit ≠ approve

Design 029 established:

```text
approval.decide
```

as distinct authority.

An Editor should not automatically approve their own content merely because they can edit it.

---

# 30. Approve ≠ override

Ordinary approval authority must remain separate from:

```text
approval.override
```

if overrides exist.

Override should be rare and audit-heavy.

---

# 31. Prepare ≠ publish

Design 031 established:

```text
publication.prepare
≠
publication.publish
```

Design 037 is where those permission distinctions become administratively visible.

---

# 32. Finance authority needs strong separation

Examples:

```text
invoice.read
invoice.create
invoice.send
payment.record
payment.reconcile
payment.refund
```

should not collapse into one:

```text
finance.admin
```

unless a deliberately high-level Role receives the bundle.

---

# 33. Sensitive administrative permissions

Examples potentially include:

```text
people.deactivate_member
roles.manage
settings.manage
integrations.manage
api_keys.manage
audit.read
```

These deserve explicit classification as high-risk permissions.

---

# 34. System Role vs Custom Role

Architecture may distinguish:

### System Role

Protected/default Role shipped with the platform.

### Custom Role

Organization-defined.

Conceptually:

```text
Role.type
→ SYSTEM
→ CUSTOM
```

Exact naming later.

---

# 35. Protected Role behavior

Critical Roles such as:

> Organization Owner

should not accidentally be deletable or stripped of all authority in ways that lock the organization out.

Backend safeguards are required.

---

# 36. Prevent last-owner/admin lockout

If only one member retains critical administration authority:

the system should reject:

```text
remove final organization owner/admin
```

unless a safe ownership-transfer process occurs.

This is a critical availability/security requirement.

---

# 37. Cannot self-escalate without authority

A user allowed to edit ordinary Team Roles must not be able to assign themselves:

```text
Organization Owner
```

unless they already possess explicit authority to grant that level.

This requires role-assignment constraints.

---

# 38. Grant authority ≠ use authority

A user can potentially have:

```text
publication.publish
```

without:

```text
roles.assign_publication_publish
```

or broad Role administration.

Ability to use a capability and ability to grant it to others are separate security concerns.

---

# 39. Role administration permissions

Potential Phase 3D capability dimensions:

```text
roles.read
roles.create
roles.edit
roles.archive
roles.assign
roles.remove_assignment
roles.view_effective_access
roles.manage_sensitive_permissions
```

Exact names later.

---

# 40. Sensitive-permission assignment guard

Even a Role administrator might need additional authority before adding:

* Finance refunds,
* API key administration,
* organization ownership,
* audit-log administration.

The platform should support guardrails rather than assuming all permissions are equivalent.

---

# 41. Self-modification

The authorization engine must carefully handle administrators editing their own Role.

Example:

```text
Admin removes own roles.manage
```

The change may be valid, but the transaction must correctly compute post-change access.

Another case:

```text
Admin tries to grant self organization owner
```

must respect grant policy.

---

# 42. Changes take effect server-side

After a Role change:

existing sessions may require authorization refresh.

Do not rely on stale client-side permission caches indefinitely.

Runtime authorization should use:

* server session claims with controlled refresh,
* DB/cache lookup,
* policy versioning,

or another safe strategy defined later.

---

# 43. Permission cache invalidation

If Emma loses:

```text
invoice.refund
```

she should not retain it for hours because the browser cached Role configuration.

Role/assignment changes need safe authorization-cache invalidation or short-lived authorization state.

---

# 44. Revocation should prioritize security

Grant propagation can tolerate brief delay more easily than revocation.

If a high-risk permission is removed:

the system should minimize the window in which stale sessions can still use it.

---

# 45. Role deletion ≠ assignment deletion

A Role assigned to active users should not be destructively deleted without understanding the impact.

Possible safe behavior:

```text
archive Role
```

while preserving historical assignments.

Exact lifecycle Phase 3D.

---

# 46. Archived Role ≠ erased history

Audit/reporting should still answer:

> Emma had Role X when she approved this action.

Do not make historical Role names disappear.

---

# 47. Assignment history

Role changes should preserve:

```text
member
old Role(s)
new Role(s)
assigned/removed by
timestamp
```

rather than only current state.

This directly feeds Design 039.

---

# 48. Permission-definition history

For high-value authorization changes, Audit should preserve:

```text
Role X:
added permission invoice.refund

Actor:
Admin Y

At:
timestamp
```

Otherwise later forensic review becomes impossible.

---

# 49. Design 039 dependency

Design 037 should emit audit events for:

* Role created,
* Role edited,
* permission added/removed,
* assignment added/removed,
* sensitive scope changed,
* critical admin transferred.

Design 039 becomes the read/investigation surface.

No separate Role audit engine.

---

# 50. Activity ≠ audit

Human-readable:

> Sarah assigned Editorial Manager to Emma.

Audit-grade:

```text
actor
target member
role
previous assignment
new assignment
timestamp
request/context
result
```

Authorization changes should rely on audit-grade records.

---

# 51. Role clone / duplicate

If supported by the frozen UX:

```text
duplicateRole()
```

can create a new Custom Role using current permissions as starting configuration.

The clone must become independent.

Future edits to original Role should not mutate the clone.

---

# 52. Role template ≠ active Role

If platform defaults/templates exist:

```text
RoleTemplate
     ↓
Organization Role
```

the live organization Role should have deliberate version/configuration semantics.

No invisible upstream mutation.

---

# 53. Permission dependencies

Some permissions may require others.

Example:

```text
invoice.refund
```

likely requires enough:

```text
invoice.read
payment.read
```

context to perform safely.

The permission catalog may encode prerequisite relationships.

The UI should not be solely responsible for consistency.

---

# 54. Permission implication

Some high-level permission may logically imply lower-level capabilities.

For example, a deliberate:

```text
project.admin
```

could imply several Project actions.

If such aggregate permissions exist, implication rules must be centralized.

Avoid duplicating expansion logic across frontend/backend.

---

# 55. Explicit deny vs additive allow

Phase 3D must choose whether the policy model supports:

* allow-only RBAC,
* explicit deny,
* conditional policies.

For V1, simpler is often safer.

But the architecture must not accidentally create contradictory precedence rules.

---

# 56. RBAC vs ABAC

Design 037 is primarily a Role/Permission UI.

Runtime authorization may still use contextual attributes:

```text
role permission
+
record ownership
+
team membership
+
organization
+
Client/Project assignment
```

This is effectively RBAC plus scoped/attribute-aware policy.

Do not force every authorization rule into pure global RBAC.

---

# 57. Ownership ≠ Role

Example:

```text
Deal owner:
Emma
```

can permit Emma to edit her Deal under an OWN scope.

Ownership is record context.

It is not a Role.

---

# 58. Team scope

A manager with:

```text
task.read
scope = TEAM
```

should see Tasks belonging to members of an authorized Team.

The definition of “Team” must use Design 036's canonical Team membership.

No copied permission-side Team tables.

---

# 59. Department scope

Likewise Department-scoped access should consume canonical Department membership from Design 036.

Authorization cannot maintain a separate organizational hierarchy.

---

# 60. Project scope

A user may receive authority only within Projects they are assigned to.

Example:

```text
asset.read
scope = PROJECT_MEMBERSHIP
```

should use Project membership from the canonical Project domain.

---

# 61. Client scope

Account Managers may need access to Clients they own/manage.

Client-scoped authorization should derive from canonical Client relationship/assignment rather than arbitrary UI filters.

---

# 62. Permission matrix

Design 037 can present:

```text
Roles × Permissions
```

or equivalent grouped permissions.

This is a visualization/editor over canonical RolePermission records.

Do not create a separate matrix-specific data store.

---

# 63. Matrix checkbox ≠ direct DB update

Changing a permission:

```text
☑ Contract Send
```

should invoke a command such as:

```text
grantPermissionToRole()
```

with:

* authorization check,
* impact validation,
* safeguards,
* audit.

No blind generic PATCH of a permissions JSON blob.

---

# 64. Unsaved batch edits

If the UI supports modifying many permission cells before Save:

the backend should receive a validated change set.

It should compare:

```text
before
after
```

and record meaningful audit entries.

---

# 65. Concurrency

Two administrators may edit the same Role simultaneously.

Example:

```text
Admin A adds publication.publish
Admin B removes contract.cancel
```

A stale full-object save should not erase the other change.

Use revision/concurrency protection.

---

# 66. Permission edit conflict

If Role revision changes while an admin is editing:

the UI should receive:

> Role changed since you opened it.

and reconcile/reload rather than silently overwrite.

---

# 67. Assignment race

Example:

```text
Admin A removes Role
Admin B simultaneously assigns that Role to another user
```

Backend must evaluate whether the Role is still active/assignable.

---

# 68. Deactivated member assignment

Design 036 membership state must be checked before assignment.

A Role should not ordinarily be assigned to a deactivated/offboarded member as though they have active access.

Historical assignments remain preserved.

---

# 69. Invitation + Role

A pending invitation may have intended Role assignment.

Activation must validate:

* invitation still valid,
* Role still exists,
* inviter/grant policy still allows assignment,
* organization matches.

No stale invitation should resurrect removed privileges.

---

# 70. Permission simulation / effective access

A valuable read capability is:

> What can Emma currently do?

Conceptually:

```text
EffectiveAccessView
├── assigned Roles
├── resulting capabilities
├── scopes
└── relevant constraints
```

This is a read model, not a new persisted domain.

---

# 71. “Why does this user have access?”

For support/security, runtime policy should eventually be explainable.

Example:

```text
Can edit Project 123:
YES

Reason:
Role = Project Manager
Scope = Assigned Projects
Member assigned to Project 123
```

This dramatically improves auditability and debugging.

---

# 72. Permission test ≠ impersonation

A permission-preview/simulation tool must not silently become “log in as user.”

Simulation should evaluate policies without taking unauthorized actions as that person.

No impersonation feature is being introduced.

---

# 73. Roles & Permissions ≠ API keys

Design 146 later owns API Keys/Webhooks/Developer Access.

A service/API credential may use its own permission scopes.

It should consume the same canonical permission vocabulary where appropriate, but human Role assignments and machine credentials remain different subjects.

---

# 74. Human actor ≠ service actor

Architecture should eventually distinguish:

```text
User
ServiceAccount / API Credential
Automation
```

when making authorization/audit decisions.

Design 037 primarily administers human/member Roles unless frozen scope explicitly includes machine access.

---

# 75. Roles & Permissions ≠ Client Portal membership

Client Portal users belong to a separate external-access context.

They should not automatically receive Team Workspace Roles.

Correct:

```text
Internal OrganizationMembership + Role
≠
Client Portal Membership + Client Permissions
```

Low-level authorization primitives can be shared.

Product shells remain separate.

---

# 76. Client user cannot inherit internal Role accidentally

Never allow:

```text
Client Portal User
→ Editor Role
→ Internal Team Workspace
```

merely because both systems have a `roleId` field.

Actor type and membership context must be explicit.

---

# 77. Sensitive data categories

Role configuration must control access to domains such as:

* Finance,
* Contracts,
* employee administration,
* Audit Logs,
* system settings,
* integrations,
* API keys.

These should be clearly grouped in the Permission Registry.

---

# 78. Audit-log access is itself sensitive

Design 039 will expose powerful information.

Therefore:

```text
audit.read
```

should be explicitly permissioned.

A user should not be able to inspect security/administrative events simply because they are a Manager.

---

# 79. Settings authority

Design 040 will use permissions such as conceptually:

```text
organization.settings.read
organization.settings.manage
```

Role administration should not automatically imply all organization-settings authority unless explicitly bundled.

---

# 80. Separation between Designs 037 and 040

### 037

Controls authorization policy.

### 040

Controls organization/system configuration.

Even if an Organization Admin Role usually receives both, the capabilities remain separate.

---

# 81. Relationship to Design 144

Frozen roadmap later contains:

**Design 144 — Role & Permission Administration**

This is a **major overlap checkpoint**.

Current architectural rule:

```text
Canonical Authorization Domain
      │
      ├── Design 037
      │   Roles & Permissions Management
      │
      └── Design 144
          Later Role & Permission Administration
```

We do not merge screens during Phase 3A.1.

But we record a critical implementation rule:

> **037 and 144 must never create separate Role/Permission engines.**

---

# 82. Potential distinction for later audit

Design 144 may turn out to represent deeper platform/security administration while 037 is routine Team Workspace Role management.

Or they may be highly duplicative.

That decision belongs to Design 144's sequential audit.

For now:

**strong overlap flag; no merge decision.**

---

# 83. Relationship to Design 036

Design 037 must consume:

```text
OrganizationMembership
Team
Department
ManagerRelationship
```

from Design 036.

It must not duplicate workforce identity.

---

# 84. Relationship to Design 034

Task permission scopes such as:

```text
task.read
task.assign
task.complete
```

are governed here.

Task records remain in Design 034's Task domain.

---

# 85. Relationship to Design 035

Calendar visibility/rescheduling capabilities are governed here.

The Calendar remains Design 035's scheduling projection.

---

# 86. Relationship to Design 029

Approval capabilities such as:

```text
approval.decide
approval.override
```

are permission definitions managed through this authorization system.

Approval records remain in Design 029.

---

# 87. Relationship to Finance

Designs 007 and 020 rely on strong separation between:

```text
invoice.read
payment.record
payment.reconcile
payment.refund
```

Design 037 makes those distinctions administratively enforceable.

---

# 88. Relationship to Publishing / Distribution

Designs 031–032 rely on:

```text
publication.schedule
publication.publish

distribution.schedule
distribution.execute
distribution.retry
```

being distinct.

Again, permissions are administered here; domain commands remain there.

---

# 89. Role list infrastructure

Design 037 can reuse shared enterprise-list components:

`PageHeader`
`SearchInput`
`FilterBar`
`DataTable`
`StatusBadge`
`SavedViewSelector` where appropriate.

But its security operations require specialized authorization components.

---

# 90. Reusable authorization components

Design 037 establishes:

`RoleList`
`RoleCard`
`RoleStatusBadge`
`PermissionGroup`
`PermissionMatrix`
`PermissionToggle`
`ScopeSelector`
`RoleAssignmentList`
`AssignedMemberList`
`EffectiveAccessSummary`
`RoleImpactSummary`
`SensitivePermissionWarning`
`RoleAssignmentDialog`
`PermissionChangeSummary`

These can be reused in Design 144.

---

# 91. Permissions for Design 037 itself

Potential Phase 3D administration capabilities:

```text
authorization.read_roles
authorization.create_role
authorization.edit_role
authorization.assign_role
authorization.remove_role_assignment
authorization.archive_role
authorization.view_effective_access
authorization.manage_sensitive_permissions
```

Exact naming comes later.

The important hierarchy is that **access to this screen does not automatically grant every mutation within it**.

---

# 92. Read-only security auditor

A user may need:

```text
authorization.read
```

without:

```text
authorization.modify
```

For example:

* Compliance,
* security review,
* management audit.

This is a valid Role.

---

# 93. State coverage

Design 037 inherits Design 150 plus authorization-specific states:

```text
Roles Loading
No Custom Roles

Role Active
Role Archived
System Role / Protected Role

Permission Editing
Unsaved Changes
Saving
Save Failed

Role Assigned
Assignment Failed
Assignment Conflict

Sensitive Permission Warning
Last Admin / Owner Protection

Effective Access Loading
Effective Access Restricted

Concurrent Role Update
Stale Role Revision
Permission Registry Unavailable

Permission Restricted
Partial Service Failure
```

These are not one single Role status enum.

---

# 94. Empty custom Roles ≠ missing system Roles

If no Custom Roles exist:

the UI can legitimately say:

> No custom Roles yet.

That should not imply:

> No Roles exist.

Protected/system Roles may still be available.

---

# 95. Permission registry unavailable ≠ no permissions

If the permission-service/query fails:

do not display an empty matrix.

That could encourage an administrator to save a destructive “zero permission” Role accidentally.

The screen should disable unsafe mutation until authoritative state is available.

---

# 96. Partial failure

Example:

```text
Role definitions        ✓
Permission catalog      ✓
Assignments             ✓
Effective-access query  ✕
Audit preview           ✓
```

Role editing may remain possible if safe.

Only effective-access preview shows unavailable.

Conversely, if canonical permission definitions cannot load reliably, mutation should fail closed.

---

# 97. Fail closed for authorization-sensitive operations

When the authorization system cannot determine:

> Is this actor allowed to grant this capability?

the correct default is generally:

```text
DENY / BLOCK
```

not:

```text
ALLOW
```

Security-sensitive uncertainty should not create privilege escalation.

---

# 98. Responsive — Desktop

Desktop should preserve the dense administration environment:

```text
Roles Header
↓
Role list
+
Selected Role
↓
Permission Groups / Matrix
↓
Scope controls
↓
Assigned Members
↓
Impact / Effective Access
↓
Save / Administrative Actions
```

The matrix benefits strongly from desktop width.

---

# 99. Responsive — Tablet

Following Design 152:

* Role list can collapse to master/detail,
* permission groups stack,
* matrix columns reduce,
* member assignments move into drawers,
* high-risk Save remains prominent,
* touch targets remain clear.

---

# 100. Responsive — Mobile

Following Design 151, prioritize:

```text
Roles
↓
Select Role
↓
Role Summary
↓
Permission Groups
↓
Open Group
↓
Capabilities / Scopes
↓
Assigned Members
↓
Impact Summary
↓
Save
```

Do not squeeze a massive permission matrix horizontally onto a phone.

---

# 101. Mobile security edits

High-risk authorization changes on mobile should clearly show:

```text
Role
Permission being changed
Scope
Affected members
```

before confirmation where appropriate.

No tiny unlabeled toggles for critical privileges.

---

# 102. Accessibility

Permission state must not rely only on:

* checkbox color,
* lock icons,
* hover tooltips.

Every permission should expose:

* label,
* enabled/disabled/inherited state,
* scope,
* accessible description where needed.

Keyboard navigation through permission groups is mandatory.

---

# 103. Read model

A useful composed view:

```text
RolesPermissionsView
├── Roles
├── selected Role
├── Permission Registry
├── RolePermission mappings
├── scopes
├── assigned members
├── affected organizational context
├── effective-access summary
├── security warnings
└── permission-aware actions
```

This is a read composition.

---

# 104. Avoid giant permissions JSON PATCH

Dangerous:

```text
PATCH /roles/:id
{
  permissions: {...everything...}
}
```

from a stale browser.

Prefer explicit commands/change sets such as:

```text
createRole()
renameRole()
grantPermissionToRole()
revokePermissionFromRole()
changePermissionScope()

assignRoleToMember()
removeRoleFromMember()

archiveRole()
```

with concurrency and audit.

A transactional permission-change set may be appropriate for matrix editing.

---

# 105. Runtime authorization architecture

Conceptually:

```text
Request
  ↓
Authenticated Actor
  ↓
Organization Membership
  ↓
Authorization Service
     ├── Role assignments
     ├── Permissions
     ├── Scope
     ├── Record attributes
     └── Policy constraints
  ↓
ALLOW / DENY
```

Design 037 only administers the underlying policy inputs.

---

# 106. Server code must centralize authorization

Avoid hundreds of inconsistent route checks:

```ts
if (user.role === "admin")
```

scattered across APIs.

Use common functions/policies such as conceptually:

```text
can(actor, action, resource)
authorize(...)
scopeQuery(...)
```

Exact implementation belongs Phase 3C/3D.

---

# 107. Query authorization

List APIs require permission-aware scoping before records are returned.

Example:

```text
LeadQueryService
   ↓
AuthorizationScope
   ↓
authorized SQL/query
```

not:

```text
load all leads
↓
filter in browser
```

---

# 108. Command authorization

Every mutation such as:

```text
refundPayment()
publishNow()
approveRequest()
deactivateMember()
```

must independently authorize the actor.

Navigation/UI guards cannot be the security boundary.

---

# 109. Background jobs require authorization context

If a user schedules:

```text
Publication tomorrow
```

the future worker does not simply inherit an unlimited system identity.

The command should preserve:

* initiating actor,
* organization,
* authorized action context,
* policy for execution-time validation.

Exact design later.

---

# 110. Automations/service execution

Later automation functionality may act on records.

Machine/system actors require clearly differentiated policy.

A background service should not implicitly possess every human administrative permission.

---

# 111. Audit integration

Authorization domain should generate immutable events such as:

```text
RoleCreated
RoleUpdated
PermissionGranted
PermissionRevoked
RoleAssigned
RoleAssignmentRemoved
RoleArchived
CriticalAdminTransferred
```

Design 039 will make these searchable/investigable.

---

# 112. Security logging must not expose secrets

Audit events should identify:

* permission,
* Role,
* actor,
* member,
* scope.

They should not store:

* auth tokens,
* passwords,
* secret keys.

Design 039 must consume sanitized events.

---

# 113. Backend requirements

| Requirement                                    | Status                     |
| ---------------------------------------------- | -------------------------- |
| Authentication                                 | **Critical**               |
| Organization/tenant isolation                  | **Critical**               |
| Canonical Role entity                          | **Critical**               |
| Canonical Permission Registry                  | **Critical**               |
| RolePermission relationship                    | **Critical**               |
| RoleAssignment                                 | **Critical**               |
| Stable OrganizationMembership integration      | **Critical**               |
| Permission scopes                              | **Critical**               |
| Server-side effective authorization            | **Critical**               |
| Record-level authorization                     | **Critical**               |
| Permission-aware query scoping                 | **Critical**               |
| Command authorization                          | **Critical**               |
| System/protected Roles                         | **Required**               |
| Custom Roles                                   | **Required**               |
| Multiple-Role architecture                     | **Required normalization** |
| Sensitive-permission safeguards                | **Critical**               |
| Last-owner/admin lockout prevention            | **Critical**               |
| Privilege-escalation protection                | **Critical**               |
| Self-modification rules                        | **Critical**               |
| Role-assignment validation                     | **Critical**               |
| Authorization cache invalidation               | **Critical**               |
| Fast permission revocation                     | **Critical**               |
| Assignment/history preservation                | **Critical**               |
| Role revision/concurrency                      | **Critical**               |
| Effective-access inspection                    | **Required**               |
| Permission-policy explainability               | **Recommended/important**  |
| Audit-event generation                         | **Critical**               |
| Design 039 Audit integration                   | **Critical**               |
| Client/internal actor separation               | **Critical**               |
| Partial service failure / fail-closed behavior | **Critical**               |

---

# 114. Canonical authorization metrics

Only limited operational metrics are appropriate, such as:

**Active Roles**
**Custom Roles**
**Members by Role**
**Unassigned Members** where relevant
**Privileged Members**
**Recent Permission Changes**

Be careful with security dashboards.

A number like:

> Security Score 92%

should not be invented without an independently defined security model.

---

# 115. Main implementation risks

Design 037 exposes some of the highest-risk implementation failures in the entire platform:

**User/Role conflation**
Global `user.role` string becomes the entire authorization model.

**Job-title/permission conflation**
Organizational titles grant system authority.

**Team/Role conflation**
Joining a Team grants hidden privileges.

**Manager/Admin conflation**
Reporting relationships become security administration.

**Route-guard-only security**
APIs remain callable directly.

**Frontend-only permission filtering**
Unauthorized data reaches browser and is merely hidden.

**Permission/scope conflation**
Users receive organization-wide access when only own/team scope was intended.

**View/export conflation**
Read access permits mass exfiltration.

**Edit/approve conflation**
Creators approve their own controlled outputs.

**Publish/override conflation**
Publisher can bypass required approvals/readiness.

**Use/grant conflation**
Someone able to perform an action can also grant the same action to others.

**Last-admin lockout**
Organization removes the final administrative authority.

**Self privilege escalation**
Role admin grants themselves Owner.

**Stale authorization cache**
Revoked privileges remain active.

**Role-delete/history loss**
Historical authorization context disappears.

**Mega-permission JSON race**
Concurrent administrators overwrite each other's changes.

**Assignment to deactivated users**
Offboarded members retain/reacquire authority.

**Internal/client actor conflation**
Portal users accidentally receive Team Workspace Roles.

**Fail-open errors**
Authorization-service outage grants access.

**037/144 duplicate RBAC systems**
Later admin design creates a second Role/Permission engine.

These are **security blockers**, but they are architectural requirements already addressable without changing Design 037.

---

# Design 037 Audit Verdict

## **PASS — PLATFORM AUTHORIZATION & RBAC ADMINISTRATION ANCHOR**

**Identity directive:** **User ≠ OrganizationMembership ≠ RoleAssignment ≠ Role ≠ Permission ≠ Effective Access.**

**Role directive:** Roles are reusable bundles of stable atomic Permission identifiers; job titles, Teams, Departments and manager relationships never substitute for security Roles.

**Scope directive:** capability and data scope remain separate dimensions, enabling own/team/department/project/organization authorization without multiplying uncontrolled permission strings.

**Server-authority directive:** all reads, queries and commands enforce authorization server-side; sidebar visibility and disabled buttons are UX only.

**Record directive:** sensitive permissions must support resource/record-aware access decisions, not just global Role checks.

**Query directive:** unauthorized records are excluded from queries before being returned, rather than fetched and hidden in the browser.

**Privilege directive:** ability to use a permission and authority to grant that permission to others remain separate.

**Sensitive-permission directive:** ownership, Finance, API, audit, settings and override capabilities require stronger grant protections.

**Lockout directive:** the platform must prevent accidental removal of the final critical organization administrator/owner.

**Revocation directive:** permission removal/deactivation should invalidate effective authorization promptly and safely.

**History directive:** Role definitions, assignments and significant Permission changes preserve historical context and generate auditable events.

**Concurrency directive:** Role and Permission editing requires revision/concurrency protection; stale matrix saves must not silently erase another administrator's work.

**Fail-closed directive:** inability to evaluate a security-sensitive permission results in denial/blocking rather than implicit access.

**Client-boundary directive:** external Client Portal memberships must never inherit internal Team Workspace Roles merely because they share authorization primitives.

**Design 036 directive:** Design 037 consumes canonical OrganizationMembership/Team/Department identity from Design 036 instead of duplicating workforce data.

**Design 039 directive:** every material Role/Permission assignment or policy mutation emits canonical audit events consumed by Design 039.

**Overlap directive:** Designs **037 and 144** must ultimately operate over exactly one Role/Permission/Scope/Assignment authorization engine; screen-level consolidation waits until Design 144's audit.

**Consolidation directive:** **STANDARDIZE ONE PLATFORM-WIDE ROLE + PERMISSION REGISTRY + ROLE ASSIGNMENT + SCOPE + EFFECTIVE-AUTHORIZATION + AUDIT INFRASTRUCTURE — DO NOT BUILD SEPARATE RBAC SYSTEMS FOR CRM, FINANCE, PROJECTS, CONTENT PRODUCTION, CLIENTS, PUBLISHING, DISTRIBUTION, SETTINGS OR LATER ADMIN SCREENS.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **37 / 153** |
| **PASS**                                   |                         **37** |
| **STANDARDIZE decisions**                  |                         **35** |
| **Potential implementation-overlap flags** |                         **28** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**37 / 153 = 24.2% audited.**

### Identity and authorization foundation after Design 037

```text
IDENTITY
   ↓
User
   ↓
OrganizationMembership
Design 036
   │
   ├── Department
   ├── Teams
   ├── Manager
   └── Employee Profile
   ↓
RoleAssignment
   ↓
Role
   ↓
Permissions
   ↓
Scope / Policy
   ↓
EFFECTIVE AUTHORIZATION
Design 037
   ↓
Every server query + command
```

And the shared platform-service layer now includes:

```text
029 → Approval
030 → Asset / File
031 → Publishing
032 → Distribution
033 → Reporting
034 → Tasks / Work
035 → Calendar / Scheduling
036 → People / Workforce
037 → Roles / Permissions / Authorization
```

# Next Sequential Audit Target

## **Design 038 — Analytics Workspace**

Its exact frozen identity is already confirmed, so there is **no additional identity-verification gate needed**.

Next we audit Design 038 under the identical contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no redesign, no additional screen and no sequence change.**

