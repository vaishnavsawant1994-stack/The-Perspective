# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 145 — Workspace / Organization Administration

Design 145 should become the **canonical Team Workspace tenant-administration, Organization identity, Workspace structure, membership lifecycle, administrative ownership/context, Organization-level governance, and tenant-boundary management surface** built on the canonical Organization, Membership, Settings, workforce, and authorization foundations already established by **Designs 036, 037, 040, and 144**.

Its first architectural responsibility is to eliminate one dangerous ambiguity:

> **Organization and Workspace must not accidentally become two competing tenant roots.**

Phase 3D must lock one of two explicit models:

```text
MODEL A

Organization
= tenant/security boundary
= workspace

or

MODEL B

Organization
= tenant/security boundary

Organization
   └── Workspace(s)
       = subordinate operational containers
```

Design 145 must **never allow both concepts to evolve independently with duplicated users, permissions, settings, billing/security boundaries, or data ownership merely because the UI uses both words**.

The screen should answer:

> **“Which Organization am I administering, what canonical Workspace structure belongs to it, who belongs to it, what state each Membership is in, which Organization-level identity and administrative policies apply, which security Roles are assigned through Design 144, and what tenant-level changes are safe without deleting history, breaking access, or crossing Organization boundaries?”**

It must remain distinct from:

* Design 036 — Team / Employee Management;
* Design 037 / 144 — Role & Permission Administration;
* Design 040 — System / Organization Settings;
* Design 062 — Client Portal Users / Team Access;
* Design 138 — Audit / Compliance;
* Design 149 — Global Settings / Platform Configuration.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **User ≠ Organization ≠ Workspace ≠ OrganizationMembership ≠ EmployeeProfile ≠ TeamMembership ≠ RoleAssignment ≠ Invitation ≠ OrganizationProfile ≠ OrganizationSettings ≠ WorkspaceSettings ≠ ClientPortalOrganization ≠ ClientPortalMembership ≠ PlatformConfiguration.**

The central implementation rule is:

> **The Organization is the tenant/security/data-isolation boundary unless Phase 3D explicitly formalizes Workspace as a subordinate container. Membership administration must operate on canonical OrganizationMembership identities, not duplicate user rows. Organization administration can invite, activate, deactivate, transfer or organize memberships only through governed lifecycle commands; it cannot grant privileges implicitly through titles, workspace labels, ownership badges, or Team membership. Destructive actions must preserve historical business, Audit, Project, Contract, Finance, Publishing, Reporting, Automation, and Integration lineage.**

---

# 1. Classification

| Audit field                                 | Classification                                                                                                                                                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                               | **145**                                                                                                                                                                                                              |
| **Canonical name**                          | **Workspace / Organization Administration**                                                                                                                                                                          |
| **Product area**                            | Team Workspace / Platform Administration / Tenant Management                                                                                                                                                         |
| **User surface**                            | **Authenticated Team Workspace**                                                                                                                                                                                     |
| **Screen class**                            | Organization Administration / Tenant Governance / Membership Administration Workspace                                                                                                                                |
| **Classification**                          | **Canonical Tenant Boundary, Organization Identity, Membership Lifecycle & Workspace Governance Anchor**                                                                                                             |
| **Primary purpose**                         | Administer Organization identity/context, Workspace structure where canonical, membership lifecycle, invitations, administrative ownership/context, and tenant-level governance without duplicating RBAC or Settings |
| **Canonical tenant identity**               | `Organization`                                                                                                                                                                                                       |
| **Workspace identity**                      | `Workspace` only if Phase 3D confirms it is a true subordinate domain object; otherwise UI terminology/projection over Organization                                                                                  |
| **Canonical user identity**                 | `User`                                                                                                                                                                                                               |
| **Canonical tenant participation identity** | `OrganizationMembership`                                                                                                                                                                                             |
| **Invitation identity**                     | `OrganizationInvitation`                                                                                                                                                                                             |
| **Workforce profile dependency**            | Design 036 `EmployeeProfile`                                                                                                                                                                                         |
| **Team membership dependency**              | Design 036                                                                                                                                                                                                           |
| **Authorization dependency**                | Designs 037 / 144                                                                                                                                                                                                    |
| **Organization Settings dependency**        | Design 040                                                                                                                                                                                                           |
| **Audit dependency**                        | Designs 039 / 138                                                                                                                                                                                                    |
| **Client Portal boundary**                  | Design 060 / 062                                                                                                                                                                                                     |
| **Developer access boundary**               | Design 146                                                                                                                                                                                                           |
| **Global platform settings boundary**       | Design 149                                                                                                                                                                                                           |
| **Organization profile identity**           | `OrganizationProfile` / canonical Organization fields                                                                                                                                                                |
| **Workspace settings**                      | only if Workspace is canonical child entity                                                                                                                                                                          |
| **Membership summary projection**           | `OrganizationMembershipAdministrationView`                                                                                                                                                                           |
| **Organization admin projection**           | `OrganizationAdministrationView`                                                                                                                                                                                     |
| **Primary query service**                   | `OrganizationAdministrationQueryService`                                                                                                                                                                             |
| **Organization service**                    | `OrganizationService`                                                                                                                                                                                                |
| **Membership service**                      | `OrganizationMembershipService`                                                                                                                                                                                      |
| **Invitation service**                      | `OrganizationInvitationService`                                                                                                                                                                                      |
| **Workspace service**                       | only if true Workspace entity exists                                                                                                                                                                                 |
| **Administrative safety service**           | `OrganizationAdministrationGuard`                                                                                                                                                                                    |
| **Authorization service**                   | Design-144 canonical evaluator                                                                                                                                                                                       |
| **Parent shell**                            | `InternalAppShell` — Design 001                                                                                                                                                                                      |
| **Auth**                                    | Required                                                                                                                                                                                                             |
| **Authorization**                           | Active OrganizationMembership + Organization-administration Permissions                                                                                                                                              |
| **Implementation priority**                 | **Critical Multi-Tenancy / Membership Security / Data-Isolation Integrity**                                                                                                                                          |
| **Reuse level**                             | **Platform-wide across all authenticated internal domains**                                                                                                                                                          |

Design 145 should answer:

> **“What tenant am I in, who belongs to it, which Memberships are active/invited/deactivated, which Organization identity/settings apply, which Workspace structure is valid, and what administrative mutation can be performed without violating authorization, historical lineage, or tenant isolation?”**

Canonical architecture:

```text
User
 │
 ├───────────────┐
 │               │
 ↓               ↓
Org A          Org B
 │               │
 ↓               ↓
Membership A   Membership B
 │
 ├── EmployeeProfile
 ├── TeamMemberships
 ├── RoleAssignments
 └── Workspace access
      only if Workspace is
      a canonical child scope
```

---

# 2. Reuse

## Organization must remain the canonical tenant boundary

This is the strongest Design-145 rule.

The platform must not drift into:

```text
organizationId
workspaceId
tenantId
companyId
accountId
```

all representing the same security boundary differently across tables.

Phase 3D must define one canonical tenancy contract.

Recommended default from the architecture already established:

```text
Organization
= primary tenant/security boundary
```

---

## Workspace must be resolved explicitly

The word **Workspace** can mean two very different things.

### Possibility A — Workspace is UX terminology

```text
Workspace == Organization
```

Then:

> “Workspace Administration”

is simply a product label over Organization administration.

No separate Workspace table is needed.

### Possibility B — Workspace is a true child container

```text
Organization O-10
    ├── Workspace W-1
    └── Workspace W-2
```

Then Workspace must have an explicit purpose such as:

* operational partition;
* data scope;
* member access scope;
* configuration boundary.

It still cannot become a second tenant root.

---

## Never infer a second Workspace entity just because the title contains “Workspace”

Critical.

Design identity alone is not enough evidence to create:

```text
Workspace
WorkspaceMembership
WorkspaceRole
WorkspaceSettings
WorkspaceBilling
```

as parallel domains.

Phase 3D must decide based on the frozen product architecture.

---

## User ≠ OrganizationMembership

Permanent.

### User

Global authentication identity.

### OrganizationMembership

User's participation in one Organization.

Example:

```text
User U-20

Org A
→ Membership OM-10
→ Editor Role

Org B
→ Membership OM-30
→ Viewer Role
```

Permissions never follow the global User indiscriminately.

---

## OrganizationMembership ≠ EmployeeProfile

Design 036 already locked this.

A Membership can exist before a complete employee/workforce profile.

Employee deactivation/workforce metadata and access membership must remain distinguishable.

---

## OrganizationMembership ≠ TeamMembership

Permanent.

Joining an Organization does not mean joining every Team.

---

## OrganizationMembership ≠ RoleAssignment

Permanent.

Membership says:

> belongs to tenant.

RoleAssignment says:

> has these Permissions in this tenant/scope.

---

## Membership state ≠ authorization Role

Absolute.

An active Membership with no privileged Role remains low/no access according to policy.

---

## Invitation ≠ Membership

Critical.

Before acceptance:

```text
OrganizationInvitation
```

After validated acceptance:

```text
OrganizationMembership
```

Do not create active Memberships prematurely unless invitation architecture explicitly requires a pending Membership record.

---

## Invitation token ≠ Invitation

Permanent.

The token is credential material proving invite possession.

The Invitation is the business identity.

---

## Organization Administration ≠ Team Management

### Design 036

People/workforce operations:

* employee profile;
* Team membership;
* manager;
* workforce context.

### Design 145

Tenant membership/governance:

* belongs to Organization;
* invitation;
* activation/deactivation;
* tenant context.

They can appear in the same UI family but must not share one giant People record.

---

## Organization Administration ≠ Role Administration

Design 145 may show:

> Maya Patel — Admin Role

but Design 144 remains the only authority for Role/Permission assignment semantics.

Design 145 must not expose hidden shortcuts like:

```text
membership.isAdmin = true
```

---

## Organization Administration ≠ Organization Settings

Design 040 remains canonical for:

* locale;
* timezone;
* currency;
* company defaults;
* organization preferences.

Design 145 may link/show summary if frozen.

It must not duplicate settings storage.

---

## Organization profile ≠ Organization settings

Important.

### Organization/Profile

Identity:

* canonical name;
* legal/business identity where supported;
* display metadata.

### OrganizationSettings

Behavior/configuration:

* timezone;
* locale;
* defaults;
* preferences.

Keep separate.

---

## Organization ≠ Client

Absolute.

Your own platform tenant Organization is not the same as CRM Company/Client.

Do not accidentally reuse:

```text
Company
Client
Organization
```

as one entity.

---

## Organization ≠ Client Portal Organization

Critical.

Design 060's Client Organization Settings describes the **client-side company/account context exposed through Client Portal**.

It cannot become your internal tenant's Organization record.

---

## Internal OrganizationMembership ≠ ClientPortalMembership

Absolute.

A Client user cannot gain internal Team Workspace membership because their company exists in CRM or Client Portal.

---

## Workspace member ≠ Client Portal user

Permanent.

---

## Organization ownership label ≠ security authority

If frozen UI contains an “Owner” label:

the backend must explicitly define whether it is:

* legal/business owner;
* administrative owner;
* security-protected owner role;
* display metadata.

Do not infer unrestricted permissions from the label.

---

## Organization creator ≠ permanent super-admin

Critical.

Creating the Organization does not justify immutable hidden authorization forever.

Any founder/owner privilege must be explicitly modeled in the authorization system.

---

## Membership invitation ≠ Role grant automatically

If an invitation includes intended Roles:

the accepted Membership should receive only explicitly authorized/pinned grants through canonical RoleAssignment logic.

Invitation acceptance itself is not an authorization bypass.

---

# 3. Entities

## Organization

Canonical tenant identity.

Conceptually:

```text
Organization
├── id
├── canonicalName
├── displayName
├── lifecycle
├── createdAt
├── createdBy
├── authorizationRevision
└── revision
```

Additional fields belong to Phase 3D.

---

## Organization ID

Must be stable.

Name/domain changes never create a new tenant identity.

---

## Organization lifecycle

Conceptually:

```text
ACTIVE
SUSPENDED
ARCHIVED
```

Potential deletion lifecycle belongs to explicit retention policy.

Do not implement casual hard delete.

---

## Organization suspended ≠ deleted

Absolute.

---

## Organization archived ≠ all business records deleted

Absolute.

---

## Organization name ≠ legal identity

If both exist in the frozen product, store separately.

---

## Workspace

Only if Phase 3D confirms it is canonical.

Conceptually:

```text
Workspace
├── id
├── organizationId
├── name
├── lifecycle
├── purpose/type
├── configurationRevision
└── revision
```

But this must not be created merely to satisfy naming symmetry.

---

## Workspace cannot cross Organizations

Absolute.

```text
Workspace.organizationId
```

must be immutable or carefully governed.

---

## WorkspaceMembership

Do not introduce unless a true Workspace-level access scope exists.

If all Organization members can see the only Workspace:

no extra membership table is necessary.

---

## OrganizationMembership

Canonical internal tenant-participation identity.

Conceptually:

```text
OrganizationMembership
├── id
├── organizationId
├── userId
├── membershipState
├── joinedAt?
├── deactivatedAt?
├── invitedBy?
├── authorizationRevision
└── revision
```

---

## Membership uniqueness

Usually:

```text
organizationId + userId
```

should have one canonical active/history-aware membership identity.

Avoid duplicate active memberships for the same User/Organization.

---

## Reinvite ≠ duplicate membership

Critical.

If a previously deactivated User is re-invited:

policy should determine:

* reactivate canonical Membership;
* create new membership episode tied to same stable relation.

Do not blindly create duplicate active records.

---

## Membership lifecycle

Conceptually:

```text
INVITED
ACTIVE
DEACTIVATED
```

Potential states may include:

* suspended;
* expired invitation;

but Invitation lifecycle should preferably remain separate.

---

## Membership deactivated ≠ User deleted

Absolute.

User may belong to other Organizations.

---

## Membership deactivated ≠ EmployeeProfile deleted

Historical workforce/business records must remain.

---

## Membership deactivated ≠ historical RoleAssignments deleted

Historical security evidence remains.

Active authorization is removed because Membership state overrides roles.

---

## OrganizationInvitation

Canonical invite identity.

Conceptually:

```text
OrganizationInvitation
├── id
├── organizationId
├── invitedEmail / target identity
├── intendedRoleAssignments?
├── invitedByMembershipId
├── status
├── issuedAt
├── expiresAt
├── acceptedAt?
├── revokedAt?
└── revision
```

---

## Invitation secret/token

Should be stored:

* hashed;
* single-use;
* expiry bound;
* organization bound.

Never plaintext retrievable.

---

## Invitation state

Conceptually:

```text
PENDING
ACCEPTED
EXPIRED
REVOKED
```

---

## Invitation accepted ≠ token reusable

Absolute.

---

## Invitation email ≠ User identity forever

If the platform resolves an existing User:

verify the accepted identity matches intended invitation policy.

Do not bind wrong accounts by client-controlled email alone.

---

## Invitation intended Role

If present:

must pin exact intended Role IDs/scope and be validated again at acceptance.

Do not resolve:

> “Admin”

by mutable role name at acceptance time.

---

## Invitation acceptance must revalidate Role safety

Critical.

Between invitation issuance and acceptance:

* Role may be archived;
* Permissions may change;
* inviter may lose delegation authority;
* Organization may change policy.

The acceptance path must use current valid governance.

---

## OrganizationProfile

If useful as separate aggregate:

```text
OrganizationProfile
├── organizationId
├── public/business display metadata
└── revision
```

Do not mix behavioral settings/secrets.

---

## OrganizationSettings

Remain Design 040 canonical.

---

## MembershipAdministrationView

Rebuildable read model.

Conceptually:

```text
OrganizationMembershipAdministrationView
├── membershipId
├── user-safe identity
├── employee profile summary?
├── membership state
├── Team summaries
├── Role summaries
├── joinedAt
├── last relevant access metadata?
└── allowed administration actions
```

Presentation only.

---

## Effective admin status

If UI shows:

> Administrator

derive through Design-144 effective permissions.

Do not persist another:

```text
isAdministrator
```

unless canonical authorization model explicitly requires it.

---

## Organization administrative ownership

If the product needs a protected Owner concept:

it should be explicitly modeled, possibly:

```text
OrganizationOwnerAssignment
```

or a protected Role/invariant.

Do not represent it as:

```text
organization.ownerUserId
```

without lifecycle/transfer/last-owner semantics.

This decision belongs Phase 3D.

---

# 4. Permissions

Design 145 should conceptually distinguish:

```text
organization.read
organization.editProfile
organization.administer

membership.read
membership.invite
membership.activate
membership.deactivate

workspace.read
workspace.manage

organization.transferAdministration
organization.archive
```

Exact keys belong to Phase 3D.

---

## Organization read ≠ Organization administer

Permanent.

---

## Edit profile ≠ manage Memberships

Permanent.

---

## Invite Membership ≠ assign arbitrary Role

Critical.

An inviter's delegation ceiling from Design 144 must constrain any intended RoleAssignments.

---

## Membership deactivate ≠ Role manage

Permanent.

Deactivation removes access through Membership state but does not edit Role definitions.

---

## Workspace manage ≠ Organization manage

If Workspace is a child entity.

---

## Organization administrator ≠ Role administrator automatically

Only if canonical permissions explicitly grant both.

---

## Membership administrator ≠ Team administrator

Permanent.

---

## Membership administrator ≠ Employee/HR administrator

Permanent.

---

## Membership administrator ≠ Client Portal administrator

Absolute.

---

## Organization owner label ≠ permission

Again, server authorization wins.

---

## Invitation link possession ≠ admin permission

Invitation acceptance proves invite entitlement only.

It cannot grant additional admin rights beyond the authorized Invitation intent.

---

## Invitation issuer loses permission

Potentially important.

If an Invitation remains pending after inviter loses `membership.invite`:

the system needs explicit policy.

Safer default:

* invitation remains a durable issued business action;
* acceptance still validates intended grant against current Organization security policy.

Do not silently inherit now-forbidden elevation.

---

## Self-deactivation

Should be guarded similarly to Design 144 lockout concerns.

A last active administrator should not be able to leave/deactivate themselves if that would orphan tenant administration, unless explicit transfer/closure flow exists.

---

## Deactivating another administrator

Must re-run Design-144 `AdministrativeAccessGuard`.

---

## Cross-tenant membership mutations prohibited

Absolute.

---

## Direct User/Membership IDs reauthorize

Client cannot submit:

```text
organizationId
userId
roleId
workspaceId
```

and rely on frontend filtering.

Every reference is tenant-validated.

---

## Membership listing itself may be sensitive

Use permission-safe search/counts.

---

## Organization enumeration prohibited

Users must not discover Organizations they do not belong to/administer.

---

# 5. States

Design 145 must keep **Organization lifecycle, Workspace lifecycle, Membership lifecycle, Invitation lifecycle, User state, employee/workforce state, RoleAssignment state, and administrative safety state** separate.

### Organization

```text
Active
Suspended
Archived
```

### Workspace, if canonical

```text
Active
Archived
Disabled
```

### Membership

```text
Active
Deactivated
Pending/Invited
```

### Invitation

```text
Pending
Accepted
Expired
Revoked
```

### User

Separate authentication/account lifecycle.

### Administrative safety

```text
Allowed
Restricted
Would Orphan Administration
Requires Transfer
Conflict
```

These must never collapse into:

```text
organization_user.status
```

---

## Organization archived ≠ User deactivated

Permanent.

---

## User deactivated globally ≠ Membership manually revoked

Different lifecycle cause/evidence.

---

## Membership deactivated ≠ RoleAssignment deleted

Absolute.

---

## Membership deactivated ≠ TeamMembership history deleted

Absolute.

---

## Invitation expired ≠ Membership deactivated

Permanent.

No membership may have existed yet.

---

## Invitation revoked ≠ User blocked globally

Permanent.

---

## Invitation accepted ≠ Membership fully authorized until canonical acceptance transaction completes

Critical.

---

## Workspace archived ≠ Organization archived

If Workspace exists as child.

---

## Organization suspended ≠ historical data unavailable

Access policy may block new use while preserving historical records.

---

## Organization empty ≠ safe to delete

Critical.

Even if zero active members, the tenant may still contain:

* Clients;
* Projects;
* Contracts;
* Finance;
* Audit;
* Publications;
* Reports;
* Integrations.

---

## No active employee profiles ≠ no Organization Memberships

Permanent.

---

## Member has no Role ≠ inactive Membership

Permanent.

---

## Role revoked ≠ Membership deactivated

Permanent.

---

## Administrative transfer pending ≠ completed

If transfer exists in frozen UI.

---

## State Coverage

Design 145 inherits Design 150 plus:

```text
Organization Administration Loading
Organization Administration Available
Organization Administration Empty
Organization Administration Restricted
Organization Administration Partial
Organization Administration Unavailable

Organization Active
Organization Suspended
Organization Archived

Workspace Active
Workspace Disabled
Workspace Archived
Workspace State Unknown

Membership Active
Membership Invited
Membership Deactivated
Membership State Unknown

Invitation Pending
Invitation Accepted
Invitation Expired
Invitation Revoked
Invitation State Unknown

User Active
User Restricted
User Unavailable

Employee Profile Available
Employee Profile Partial
Employee Profile Unavailable

Role Summary Available
Role Summary Restricted
Role Summary Unavailable

Administration Allowed
Administration Restricted
Administration Would Escalate
Administration Would Orphan Organization
Administration Requires Transfer
Administration Conflict

Organization Updated Elsewhere
Membership Updated Elsewhere
Invitation Updated Elsewhere
Role Assignment Updated Elsewhere
Workspace Updated Elsewhere
Authorization Revision Changed
Administration Projection Stale
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize:

```text
Organization identity
↓
Tenant / Workspace context
↓
Membership overview
↓
Active / invited / deactivated members
↓
Role summaries
↓
Workspace structure if canonical
↓
Administrative actions
↓
Safety / lifecycle warnings
```

Only the sections/actions present in frozen Design 145 should be implemented.

---

## Organization and Workspace must be visually unambiguous

If Workspace is a real child:

> Organization: The Perspective Media Group
> Workspace: Editorial Operations

If Workspace is only product terminology:

do not visually imply a two-level hierarchy that does not exist in the backend.

---

## Membership state must dominate workforce labels

Correct:

> Maya Patel
> Membership: Active
> Employee profile: Editorial Director
> Roles: Publishing Manager

Not:

> Editorial Director = Admin.

---

## Role summary should link back to canonical authorization

Design 145 can display Role labels.

Permission editing belongs Design 144.

---

## Invitation rows should remain distinct from active members

Do not render a pending Invitation exactly like an active employee.

---

## Deactivated members remain historically visible where frozen UI requires

Do not make them disappear if that harms administrative/history understanding.

---

## Destructive actions need exact scope

Safer wording:

> Deactivate Organization Membership

than:

> Delete User

when the real action affects only this tenant.

---

## Organization lifecycle warnings

If archive/suspension exists:

explain that tenant access is affected, while historical data retention follows separate governance.

Do not imply full database deletion.

---

## Tablet

Following Design 152:

* Organization/Workspace context stays top;
* membership summary cards compress;
* member rows stack;
* Role/Team summaries move into expandable detail;
* admin actions remain accessible but separated from everyday employee controls.

---

## Mobile

Priority:

```text
Organization
↓
Workspace context
↓
Membership status
↓
Member identity
↓
Role summary
↓
Team/workforce summary
↓
Allowed administrative action
```

Avoid a wide member/Role/Team matrix.

---

## Mobile member card

Conceptually:

> Maya Patel
> Active member
> Editorial Director
> Publishing Manager
> Editorial Team
> Joined Aug 4
> Manage membership

without implying job title or Team grants security access.

---

## Accessibility

A membership item could communicate:

> Maya Patel has an active Organization Membership in The Perspective Media Group. Her employee title is Editorial Director. She belongs to the Editorial Team and currently receives Publishing Manager access through canonical RoleAssignment RA-20. Deactivating this Membership will remove access to this Organization but will not delete her global User account or historical work records.

where canonical data supports it.

---

# 7. Backend Requirements

## Canonical tenant-administration architecture

```text
Authenticated User
      ↓
OrganizationMembership
      ↓
Organization
      │
      ├── OrganizationProfile
      ├── OrganizationSettings
      │
      ├── Workspace(s)
      │    only if canonical
      │
      ├── Memberships
      │       ├── EmployeeProfile
      │       ├── TeamMembership
      │       └── RoleAssignment
      │
      └── Invitations
```

Design 145:

```text
Design 145
    ↓
OrganizationAdministrationQueryService
    │
    ├── OrganizationService
    ├── MembershipService
    ├── InvitationService
    ├── WorkspaceService? 
    ├── Design-144 AuthorizationEvaluator
    └── AdministrationGuard
```

---

## Canonical tenant context

Every internal request should resolve:

```text
currentUserId
currentOrganizationId
currentMembershipId
```

from trusted session/context.

Never trust a client-provided Organization ID alone.

---

## Tenant membership check before domain permission check

Conceptually:

```text
authenticated?
    ↓
active Membership in Organization?
    ↓
Permission allowed?
    ↓
resource belongs to same Organization?
```

All four matter.

---

## Organization query

Conceptually:

```text
getOrganizationAdministration(
    currentMembership
)
```

should:

1. authenticate;
2. resolve exact tenant;
3. authorize organization-administration read;
4. load Organization profile;
5. resolve Workspace model;
6. load permission-safe Membership summaries;
7. load Invitation summaries;
8. resolve safe Role/Team/workforce projections;
9. resolve allowed administrative actions.

---

## Organization mutation commands

Avoid:

```text
PATCH /organization
{
  owner,
  users,
  roles,
  status,
  settings,
  workspace...
}
```

Use targeted commands.

---

## Organization profile update

Conceptually:

```text
updateOrganizationProfile(
    organizationId,
    profileChanges,
    expectedRevision
)
```

must not update:

* permissions;
* secrets;
* integration state;
* unrelated settings.

---

## Invite membership

Conceptually:

```text
inviteOrganizationMember(
    email/identity,
    intendedRoleAssignments?,
    workspaceScope?,
    idempotencyKey
)
```

should:

1. authorize inviter;
2. resolve Organization;
3. normalize intended identity;
4. detect existing active/pending membership/invite;
5. validate intended Roles against Design-144 delegation policy;
6. validate Workspace scope if canonical;
7. create Invitation;
8. generate high-entropy single-use token;
9. store token hash;
10. send via canonical communication service;
11. emit AuditEvent.

---

## Duplicate invitations

Idempotency/dedup required.

Do not generate dozens of simultaneously active invite tokens accidentally.

---

## Invitation resend

If frozen UI contains Resend:

prefer new delivery against same valid Invitation or deliberate token rotation policy.

Do not create unrelated duplicate Membership intent.

---

## Invitation token

Must be:

* cryptographically random;
* hashed at rest;
* single-use;
* expiry bound;
* Organization bound;
* invitation bound.

---

## Invitation acceptance

Conceptually:

```text
acceptOrganizationInvitation(token, authenticatedUser)
```

should:

1. hash/lookup token;
2. verify not expired/revoked/used;
3. verify Organization active;
4. resolve authenticated User;
5. verify invitation identity policy;
6. detect existing Membership;
7. validate intended Role/Workspace grants under current policy;
8. create/reactivate Membership transactionally;
9. create permitted RoleAssignments through canonical service;
10. mark Invitation accepted;
11. rotate/invalidate token;
12. increment authorization revision;
13. emit AuditEvent.

---

## Acceptance transaction atomicity

Critical.

Do not reach state:

```text
Invitation = ACCEPTED
Membership = missing
```

or:

```text
Membership active
token still reusable
```

---

## Membership activation

If explicit reactivation exists:

use targeted command.

Do not clone Membership.

---

## Membership deactivation

Conceptually:

```text
deactivateOrganizationMembership(
    membershipId,
    expectedRevision
)
```

should:

1. authorize;
2. validate same tenant;
3. re-fetch active membership;
4. invoke Design-144 AdministrativeAccessGuard;
5. prevent last-admin orphaning;
6. mark Membership inactive/deactivated;
7. invalidate authorization/session access;
8. preserve EmployeeProfile/Team/Role history;
9. increment authorization revision;
10. Audit.

---

## Deactivation should immediately remove tenant access

Do not rely on cached frontend state.

---

## Session revocation

A deactivated Membership must not remain usable through stale cached JWT claims.

Reuse Design-144 authorization-revision/session invalidation.

---

## TeamMembership on deactivation

Historical Team memberships should not be destructively erased.

Current operational participation may be ended according to Design-036 policies.

---

## RoleAssignments on deactivation

Can remain historically recorded while effective authorization evaluates false because Membership inactive.

Alternative explicit revocation is possible but history must remain clear.

---

## Task/Project assignments on deactivation

Do not silently reassign or delete work.

Design 145 should surface dependency/impact information if present in frozen UI, but reallocation belongs:

* Design 034;
* Design 112;
* source Project services.

---

## Member deactivation ≠ automatic resource reassignment

Absolute.

---

## Organization archive

If frozen UI supports it:

this is a high-risk lifecycle command.

It should not equal:

```text
DELETE FROM organizations CASCADE
```

---

## Archive policy should define

* new login/access behavior;
* API key/service behavior;
* Automations;
* scheduled reports;
* Publishing;
* webhooks;
* Integrations;
* retention.

These exact cross-domain consequences belong Phase 3D.

---

## Archive should preserve history

Permanent.

---

## Hard deletion

Should be an exceptional separate retention/data-erasure workflow, not normal Design-145 administration.

---

## Organization suspension

If platform-admin-controlled:

that may belong Design 149/platform administration rather than tenant self-admin.

Do not expose it merely because lifecycle supports it.

---

## Workspace creation/update

Only if Workspace is a true canonical child entity.

Conceptually:

```text
createWorkspace(...)
updateWorkspace(...)
archiveWorkspace(...)
```

must always verify parent Organization.

---

## Workspace movement between Organizations

Prefer prohibited.

Cross-tenant transfer of a Workspace containing data is highly complex and should not be assumed.

---

## Workspace-scoped membership

If architecture ultimately supports it:

workspace access must be explicit and subordinate to active OrganizationMembership.

Correct:

```text
OrganizationMembership ACTIVE
        +
Workspace access
```

Never Workspace access without tenant membership.

---

## Organization profile/settings separation

Design 145 may update Organization identity fields.

Design 040 commands update OrganizationSettings.

Do not mix both behind one generic save object.

---

## Role management separation

Design 145 calls Design-144 assignment/query services.

It does not directly write RoleAssignment table through generic Membership update.

---

## Team management separation

Design 145 reads Design-036 TeamMembership summaries.

Team assignment changes remain Design-036 service commands.

---

## Client Portal separation

Client Portal Organizations/users remain client-side access projections/entities.

No automatic internal Membership creation when a Client Portal user is invited.

---

## Current Organization switching

If product shell supports multiple Organizations:

Organization switching should switch:

* active tenant context;
* membership;
* authorization scope;
* cached data namespace.

It must not simply change a frontend label.

---

## Tenant switch security

On switch:

* invalidate tenant-bound caches;
* reinitialize search;
* analytics;
* notifications;
* app navigation;
* websocket/subscription channels.

Avoid cross-tenant residual data.

---

## Organization-scoped cache keys

All relevant caches need `organizationId` plus authorization scope.

---

## Browser state

Do not retain Organization A entities in client state after switching to Organization B without namespacing/clearing.

---

## Background jobs

Every job must carry immutable tenant context.

Never infer Organization from whichever user is currently active later.

---

## Database scoping

Every canonical tenant-owned table should either:

* carry `organizationId`;
* or be provably reachable through an organization-scoped parent.

Phase 3D should enforce this structurally.

---

## Foreign-key tenant integrity

Critical.

Example:

A Project belonging to Org A must not reference a Client from Org B.

Cross-domain services should validate this.

---

## Row-level security

Optional defense-in-depth if chosen in Phase 3D.

Application/service-layer tenant checks remain mandatory regardless.

---

## Organization-level uniqueness

Fields such as:

* Role names;
* Team names;
* certain codes;

should generally be tenant-scoped where appropriate.

Do not enforce global uniqueness unnecessarily.

---

## Organization audit

Design 138 should receive strong Audit events for:

* Organization profile change;
* invite issued/revoked;
* Membership activated/deactivated;
* administration transfer;
* Workspace created/archived if canonical;
* Organization archived.

---

## Invitation secrets never in Audit

Absolute.

Audit:

> Invitation issued to [user@example.com](mailto:user@example.com)

may be acceptable under privacy policy.

Never:

> token=abc123.

---

## Organization Membership history

Audit should preserve:

* actor;
* Membership;
* action;
* reason/context where governance requires.

---

## Administrative ownership transfer

If frozen Design 145 contains transfer ownership/admin control:

use a dedicated guarded command.

Conceptually:

```text
transferOrganizationAdministration(...)
```

must validate:

* target active Membership;
* target required Role/permission eligibility;
* current actor authority;
* last-admin/owner invariants;
* acceptance/confirmation if required.

Do not model it as:

```text
organization.ownerId = newUser
```

without governance.

---

## Organization domain mapping

If custom domains are part of frozen design, they need separate verified-domain semantics.

Do not invent that capability here.

---

## Membership search

Server-side, tenant-scoped, permission-safe.

---

## Counts

Active/Invited/Deactivated counts must derive from canonical Membership/Invitation states.

Do not count EmployeeProfiles instead.

---

## Effective admin count

Should derive from Design-144 effective authorization.

Do not count:

```text
jobTitle = "Admin"
```

or Role name string alone.

---

## Idempotency

Required for:

* Organization creation if applicable;
* Invitations;
* Membership activation/deactivation;
* Workspace creation;
* administration transfer;
* archive commands.

---

## Optimistic concurrency

Required for:

* Organization profile;
* Workspace config;
* membership lifecycle;
* invitation revoke;
* admin transfer.

---

## Last-admin race

Exactly like Design 144.

Two simultaneous member deactivations must not orphan Organization administration.

Use transaction/locking.

---

## Cross-tenant access tests

Must become a major test suite category:

```text
User in Org A
cannot:
read Org B
invite into Org B
change Org B members
use Org B Role IDs
use Org B Workspace IDs
use Org B Projects/Clients
```

---

## Query projection performance

Use:

* indexed OrganizationMemberships;
* batched Role/Team summaries;
* cursor pagination;
* compact member projection.

Do not hydrate each member's full workforce/security graph in the list.

---

## Partial failure contract

Example:

```text
Organization core     ✓
Memberships           ✓
Role summary          ✕
```

Correct:

> Organization and Memberships are available; current Role summaries cannot be loaded.

Incorrect:

> Members have no Roles.

Another:

```text
Membership            ✓
EmployeeProfile       unavailable
```

Correct:

> Member access identity is available; workforce profile is unavailable.

Not:

> Member does not exist.

Another:

```text
Organization          ✓
Workspace service     unavailable
```

If Workspace is canonical:

> Organization administration is partially available; Workspace structure cannot currently be loaded.

Never:

> No Workspaces.

---

## Backend Requirement Matrix

| Requirement                                             | Status                                     |
| ------------------------------------------------------- | ------------------------------------------ |
| One canonical tenant boundary                           | **Critical**                               |
| Explicit Organization/Workspace model                   | **Critical architecture**                  |
| No duplicate tenant roots                               | **Critical**                               |
| User/OrganizationMembership separation                  | **Critical**                               |
| Membership/EmployeeProfile separation                   | **Critical**                               |
| Membership/TeamMembership separation                    | **Critical**                               |
| Membership/RoleAssignment separation                    | **Critical**                               |
| Invitation/Membership separation                        | **Critical**                               |
| Internal Membership/Client Portal Membership separation | **Critical**                               |
| Organization/CRM Company/Client separation              | **Critical**                               |
| OrganizationProfile/OrganizationSettings separation     | **Critical**                               |
| Design 040 Settings reuse                               | **Critical architecture**                  |
| Design 144 RBAC reuse                                   | **Critical**                               |
| Design 036 workforce reuse                              | **Critical**                               |
| Stable Organization ID                                  | **Critical**                               |
| Stable Membership identity                              | **Critical**                               |
| Tenant-scoped membership uniqueness                     | **Critical**                               |
| Invitation token hashing/single-use/expiry              | **Critical**                               |
| Invitation role/scope revalidation                      | **Critical**                               |
| Atomic invitation acceptance                            | **Critical**                               |
| Deactivation/session invalidation                       | **Critical**                               |
| Membership deactivation/history preservation            | **Critical**                               |
| Last-admin/orphan protection                            | **Critical**                               |
| Self-lockout protection                                 | **Critical**                               |
| Deactivation does not delete/reassign work              | **Critical**                               |
| Organization archive/history preservation               | **Critical**                               |
| Hard delete separated from normal administration        | **Critical**                               |
| Workspace subordinate to Organization                   | **Critical if Workspace exists**           |
| Workspace cross-tenant movement prohibited/default      | **Critical if Workspace exists**           |
| Tenant-bound cache namespacing                          | **Critical**                               |
| Tenant switch cache/session isolation                   | **Critical if multi-org switching exists** |
| Tenant context on background jobs                       | **Critical**                               |
| Resource tenant validation                              | **Critical**                               |
| Cross-domain tenant FK integrity                        | **Critical**                               |
| Cross-tenant ID substitution protection                 | **Critical**                               |
| Permission before Membership counts/search              | **Critical**                               |
| Effective admin derived from RBAC                       | **Critical**                               |
| Strong tenant-admin Audit events                        | **Critical**                               |
| Invitation secrets excluded from Audit                  | **Critical**                               |
| Targeted administration commands                        | **Critical**                               |
| No generic Organization mega-PATCH                      | **Critical**                               |
| Optimistic concurrency                                  | **Critical**                               |
| Idempotent Invitations/lifecycle commands               | **Critical**                               |
| Cross-tenant automated test suite                       | **Critical**                               |
| Partial dependency failure handling                     | **Critical**                               |

---

# 8. Consolidation

Design 145 has major overlap potential because **Organization, Workspace, Team, Company, Client, and account** are easy names to misuse interchangeably.

**Organization / Workspace conflation without explicit model**
Two hidden tenant roots emerge.

**Organization / Tenant conflation implemented inconsistently**
Some tables use `tenantId`, others `organizationId`.

**Organization / CRM Company conflation**
Customer companies become platform tenants.

**Organization / Client conflation**
Client relationship becomes security boundary.

**Organization / Client Portal Organization conflation**
External client access contaminates internal tenancy.

**Workspace / Organization conflation while storing both**
Duplicate settings/memberships/roles appear.

**Workspace / Team conflation**
Operational container becomes employee Team.

**Workspace / Project conflation**
Project is treated as tenant partition.

**User / OrganizationMembership conflation**
Global User privileges leak across tenants.

**OrganizationMembership / EmployeeProfile conflation**
Removing employee profile destroys login/access identity.

**OrganizationMembership / TeamMembership conflation**
Joining Team grants tenant membership.

**OrganizationMembership / RoleAssignment conflation**
Active member becomes automatically privileged.

**Membership state / permission conflation**
Active = Admin.

**Job title / administrative authority conflation**
Director/President labels become security Roles.

**Organization creator / permanent super-admin conflation**
Hidden root privilege survives forever.

**Owner label / authorization conflation**
Display metadata becomes unrestricted access.

**Invitation / Membership conflation**
Pending users gain access before acceptance.

**Invitation / token conflation**
Business invitation disappears when token rotates.

**Invitation email / User identity conflation**
Wrong account accepts invite.

**Invitation intended Role name / Role ID conflation**
Renames alter pending grants.

**Invitation issue-time authorization / acceptance-time authorization conflation**
Old invitation bypasses newer security policy.

**Invitation accepted / Membership transaction conflation**
Half-completed activation states appear.

**Invitation resend / duplicate Invitation conflation**
Multiple valid tokens/records proliferate.

**Reinvite / duplicate Membership conflation**
One User has multiple active Memberships in same Org.

**Membership deactivation / User deletion conflation**
User loses access to other Organizations.

**Membership deactivation / EmployeeProfile deletion conflation**
Workforce history disappears.

**Membership deactivation / RoleAssignment deletion conflation**
Security history disappears.

**Membership deactivation / Task reassignment conflation**
Work is silently mutated.

**Membership deactivation / Project removal conflation**
Historical project participation disappears.

**Organization archive / destructive deletion conflation**
Contracts, Reports, Audit and Finance history vanish.

**Organization suspension / archive conflation**
Temporary access block becomes historical closure.

**Organization empty / safe-to-delete conflation**
Tenant still contains business data.

**Organization name / ID conflation**
Rename breaks foreign keys/URLs.

**Workspace name / identity conflation**
Rename creates duplicate Workspace.

**OrganizationProfile / Settings conflation**
Identity and behavioral configuration share one giant blob.

**Design 040 / Design 145 Settings duplication**
Timezone/locale/company defaults fork.

**Design 036 / Design 145 people duplication**
Employee and Membership records diverge.

**Design 144 / Design 145 authorization duplication**
Membership admin writes hidden roles.

**Design 062 / Design 145 Portal membership conflation**
Client users gain internal access.

**Role summary / Role authority conflation**
Design 145 starts editing Permissions.

**Team summary / Team authority conflation**
Design 145 starts editing workforce Teams.

**Current active admin count / Role name string conflation**
“Admin” label is treated as effective authorization.

**Organization switch / frontend label switch conflation**
Org A data remains in cache while UI says Org B.

**Tenant context / client-provided Organization ID conflation**
Cross-tenant API attack becomes possible.

**Resource ID / tenant ownership conflation**
Valid Project ID from Org B bypasses current tenant.

**Background job / current user tenant conflation**
Job executes under wrong Organization later.

**Cache namespace / global cache conflation**
Org A data leaks to Org B.

**Search index / tenant boundary conflation**
Universal Search leaks metadata.

**Analytics aggregate / tenant boundary conflation**
Cross-org KPI leakage.

**Notification channel / tenant context conflation**
Org A Notifications reach Org B members.

**Invitation token / Audit payload conflation**
Secrets leak into compliance evidence.

**Organization ownership transfer / simple ownerId PATCH conflation**
Last-admin/security invariants bypassed.

**Workspace archive / Organization archive conflation**
Child container lifecycle shuts whole tenant.

**Generic `workspace_users` table**
Duplicates OrganizationMembership.

**Generic `organization.users[]` JSON**
No lifecycle/RBAC/history integrity.

**Generic `is_owner` / `is_admin` flags**
Bypass Design 144.

**Generic `status=active`**
Cannot distinguish User, Membership, Invitation, Workspace, Organization states.

**Generic `organization_settings JSON` in Design 145**
Duplicates Design 040.

**Generic organization DELETE cascade**
Historical/business integrity catastrophe.

**Generic `switchWorkspace(workspaceId)` client state**
No authenticated tenant resolution.

**145/036 duplicate employee/member administration**
People identities fork.

**145/040 duplicate Organization Settings**
Configuration forks.

**145/062 duplicate Client Portal access**
Internal/external memberships merge.

**145/144 duplicate Role administration**
Authorization bypass appears.

**145/138 missing tenant-admin Audit**
Critical Membership changes become untraceable.

**145/146 developer credential ownership conflation**
API principals become ordinary users.

**145/149 tenant/platform administration conflation**
One Organization can change global platform configuration.

No additional screen is required.

These are **tenant-boundary definition, Organization/Workspace normalization, canonical Membership lifecycle, secure Invitations, RBAC reuse, historical preservation, tenant-switch isolation, and cross-tenant data-integrity requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL TENANT BOUNDARY, ORGANIZATION IDENTITY, MEMBERSHIP LIFECYCLE & WORKSPACE-GOVERNANCE ANCHOR**

**Domain directive:**
**User ≠ Organization ≠ Workspace ≠ OrganizationMembership ≠ EmployeeProfile ≠ TeamMembership ≠ RoleAssignment ≠ OrganizationInvitation ≠ OrganizationProfile ≠ OrganizationSettings ≠ ClientPortalOrganization ≠ ClientPortalMembership ≠ PlatformConfiguration.**

**Tenant directive:**
`Organization` remains the primary tenant/security/data-isolation boundary unless Phase 3D explicitly formalizes `Workspace` as a subordinate operational container. The implementation must never maintain two ambiguous peer tenant roots.

**Workspace directive:**
before coding, Phase 3D must classify Workspace as either **Organization UX terminology** or a **true Organization-owned child entity**. A separate Workspace domain must not be created merely because the frozen screen title contains the word Workspace.

**No-duplicate-tenant directive:**
`organizationId`, `workspaceId`, `tenantId`, `companyId`, and `accountId` may not become interchangeable security identifiers across modules. One canonical tenancy contract must govern the platform.

**User directive:**
`User` remains global authentication identity while `OrganizationMembership` represents tenant-specific participation and access context.

**Multi-organization directive:**
one User may hold different Memberships, Roles, Teams, and permissions across Organizations; none may leak from one tenant to another.

**Membership directive:**
OrganizationMembership remains the canonical internal participation identity and never becomes EmployeeProfile, TeamMembership, RoleAssignment, or Client Portal membership.

**Workforce directive:**
Design 036 remains EmployeeProfile, TeamMembership, manager, and workforce-structure authority. Design 145 may display those projections without creating duplicate People records.

**Authorization directive:**
Designs 037/144 remain canonical Role/Permission authority. Organization administration can invoke guarded RoleAssignment services but can never implement hidden `isAdmin`, `isOwner`, title-based, Team-based, or Workspace-label authorization.

**Ownership directive:**
if the frozen product includes Organization Owner semantics, Phase 3D must model the ownership/administrative invariant explicitly. A display `owner` label or creator ID cannot silently function as unrestricted root authorization.

**Creator directive:**
creating an Organization never establishes undocumented permanent super-admin privileges outside canonical authorization.

**Invitation directive:**
OrganizationInvitation is a durable business identity distinct from both Membership and invitation token.

**Token directive:**
invitation tokens are cryptographically random, hashed at rest, expiry-bound, Organization-bound, single-use, and never exposed in Audit/logging after issuance.

**Invitation-identity directive:**
acceptance validates the authenticated User against the intended invite identity policy and never trusts browser-supplied email/Organization context alone.

**Invitation-grant directive:**
intended Roles/scopes on an invitation use exact canonical IDs and are revalidated under current Design-144 delegation/escalation policy at acceptance time.

**Atomic-acceptance directive:**
Invitation consumption, Membership creation/reactivation, permitted RoleAssignments, token invalidation, authorization-revision change, and Audit evidence execute transactionally enough to avoid half-accepted states.

**Membership-uniqueness directive:**
the platform prevents duplicate concurrent active Memberships for the same User/Organization relation.

**Reinvite directive:**
reinviting a former member follows an explicit reactivation/new-membership-episode policy and never creates uncontrolled duplicate active identities.

**Deactivation directive:**
deactivating OrganizationMembership revokes current tenant access while preserving global User identity and historical workforce, Role, Project, Task, Contract, Finance, Publishing, Report, Automation, Integration, and Audit lineage.

**No-auto-reassignment directive:**
Membership deactivation never silently reassigns Tasks, Projects, approvals, assets, clients, or delivery responsibilities. Those changes belong to their canonical source services.

**Session directive:**
Membership deactivation immediately invalidates/re-evaluates tenant authorization through Design-144 authorization revisions/session mechanisms rather than relying on stale client/JWT Role state.

**Administrative-safety directive:**
membership deactivation, self-removal, admin transfer and other critical tenant-access changes reuse Design-144 last-administrator/self-lockout safeguards.

**Last-admin directive:**
concurrent changes can never leave the Organization without a viable canonical administration path unless an explicit Organization closure flow intentionally does so.

**Organization-profile directive:**
Organization identity/profile fields remain separate from Design-040 OrganizationSettings and from credentials/integration configuration.

**Settings directive:**
Design 040 remains the canonical Organization settings source for timezone, locale, currency, defaults, and Workspace preferences. Design 145 must not create a second settings JSON blob.

**Workspace-child directive:**
if Workspace is ultimately canonical, every Workspace belongs to exactly one Organization security boundary, cannot grant access independently of an active OrganizationMembership, and does not become a second tenant.

**Workspace-transfer directive:**
cross-Organization Workspace movement must not be assumed. The default implementation should prohibit it unless a dedicated migration architecture is explicitly designed later.

**Client-boundary directive:**
internal Organization/OrganizationMembership and Client Portal Organization/PortalMembership remain separate security domains even when they refer to the same real-world company.

**CRM-boundary directive:**
internal Organization is never interchangeable with CRM Company or Client entities.

**Tenant-context directive:**
every internal request resolves current User, Organization, and OrganizationMembership from trusted server/session context before evaluating permissions or resource ownership.

**Resource-ownership directive:**
every domain command independently validates that referenced Clients, Projects, Deals, Contracts, Reports, Integrations, Automations, Files, etc. belong to the current Organization context.

**Cross-tenant-ID directive:**
possessing a syntactically valid resource ID from another tenant never grants visibility or mutation capability.

**Background-job directive:**
all asynchronous jobs persist immutable Organization/tenant context at creation and never infer tenant from a later currently active user/workspace.

**Cache-isolation directive:**
tenant-owned caches, search, analytics, Notifications, socket subscriptions, and client stores are namespaced by Organization and authorization revision to prevent residual cross-tenant data.

**Tenant-switch directive:**
if the product supports Organization/Workspace switching, switching is a real security-context transition that reloads Membership/permissions and clears or namespaces tenant-bound caches; it is never a frontend-label-only action.

**Database directive:**
tenant-owned records carry `organizationId` directly or inherit it through a structurally enforced canonical parent, with cross-domain foreign-reference tenant validation.

**RLS directive:**
database row-level security may be added as defense in depth, but it never replaces application/service-layer tenant checks.

**Organization-lifecycle directive:**
Active, Suspended, Archived, and any future deletion/erasure state remain separate. Archive/suspension never implies historical record deletion.

**Archive directive:**
normal Organization administration must not implement `DELETE CASCADE` closure of tenant business history. Hard deletion/data erasure belongs a separate explicitly governed retention process.

**Workspace-lifecycle directive:**
if Workspace exists, Workspace archive/disablement remains separate from Organization lifecycle.

**Count directive:**
Active/Invited/Deactivated counts derive from canonical Membership/Invitation identities, not EmployeeProfiles or UI rows.

**Effective-admin directive:**
administrator counts derive from Design-144 effective permissions rather than Role-name strings, job titles, `isAdmin`, or owner labels.

**Command directive:**
Organization profile, invite, revoke invite, activate/deactivate Membership, Workspace changes, administration transfer, and archive use targeted server commands rather than a generic Organization mega-PATCH.

**Concurrency directive:**
Organization, Membership, Invitation, Workspace, and administration-transfer mutations use revision/transaction controls; last-admin invariants receive stronger locking where necessary.

**Idempotency directive:**
Invitation issuance/resend, membership lifecycle, Workspace creation, transfer, and archival use stable idempotency semantics.

**Audit directive:**
Design 138 receives append-oriented evidence for material Organization/Workspace/Membership administration changes while invitation secrets and sensitive credential material remain excluded.

**Search directive:**
Design 079 search results and metadata remain Organization-scoped and are invalidated/re-filtered on tenant/authorization changes.

**Analytics directive:**
Designs 038/135/137 aggregates remain tenant-separated and never combine Organizations unless a future platform-global administrative analytics capability explicitly authorizes it.

**Notification directive:**
internal Notifications resolve OrganizationMembership recipients inside the correct tenant and cannot cross Organization boundaries through stale recipient/cache state.

**Developer-access directive:**
Design 146 API keys/service principals must bind explicitly to Organization/Workspace scopes and cannot be modeled as ordinary employee Memberships merely for convenience.

**Platform-boundary directive:**
Design 149 remains platform/global configuration authority. An Organization administrator cannot mutate global platform settings merely because they administer their own tenant.

**Performance directive:**
use indexed Membership/Invitation records, compact batched Role/Team/workforce summaries, cursor pagination and tenant-scoped projections rather than hydrating every member's full security/work history on list load.

**Testing directive:**
cross-tenant negative testing becomes mandatory: IDs, Memberships, Roles, Workspaces, Projects, Clients, Files, Integrations, Reports and API credentials from Organization B must be rejected when acting under Organization A.

**Partial-failure directive:**
Organization core, Memberships, Employee profiles, Role summaries, Workspace structure, and Invitations may fail independently. `Unavailable` can never become `No members`, `No Roles`, `No Workspace`, `Invitation accepted`, or `Safe to administer` without evidence.

**Future-reuse directive:**
Design **146 — API Keys / Webhooks / Developer Access** must bind all developer/service access to this same canonical Organization/Workspace tenant context while keeping API credentials/service principals separate from human Users, Memberships, and RoleAssignments.

**Overlap directive:**
Designs **036, 037, 040, 062, 138, 144–149** must preserve one continuous **global User → canonical Organization tenant → OrganizationMembership → workforce/Team projections + scoped RoleAssignments → tenant-owned domain resources → OrganizationSettings/Audit**, while Client Portal organizations, CRM Companies, Workspaces, API principals, and platform-global configuration remain explicitly separated according to their real roles.

**Consolidation directive:**
**STANDARDIZE ONE ORGANIZATION / WORKSPACE ADMINISTRATION FOUNDATION — ONE CANONICAL ORGANIZATION TENANT BOUNDARY + EXPLICIT WORKSPACE-AS-ALIAS-OR-CHILD DECISION + GLOBAL USER/TENANT MEMBERSHIP SEPARATION + SECURE VERSIONED INVITATION LIFECYCLE + DESIGN-036 WORKFORCE REUSE + DESIGN-040 SETTINGS REUSE + DESIGN-144 RBAC/ADMIN-GUARD REUSE + TENANT-SCOPED SESSION/CACHE/JOB/RESOURCE VALIDATION + HISTORICAL MEMBERSHIP PRESERVATION + STRONG CROSS-TENANT AUDIT/TESTING — AND NEVER ALLOW GENERIC WORKSPACE USERS, DUPLICATE TENANT IDS, `IS_OWNER`, `IS_ADMIN`, JOB TITLES, ROLE NAME STRINGS, CLIENT PORTAL USERS, CRM COMPANIES, FRONTEND ORGANIZATION SWITCHES, GENERIC MEGA-PATCHES OR DELETE CASCADES TO SUBSTITUTE FOR OR REWRITE CANONICAL TENANT, MEMBERSHIP, AUTHORIZATION OR ORGANIZATION TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **145 / 153** |
| **PASS**                                   |                        **145** |
| **STANDARDIZE decisions**                  |                        **143** |
| **Potential implementation-overlap flags** |                        **136** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**145 / 153 = 94.8% audited.**

### Canonical Organization architecture after Design 145

```text
GLOBAL USER
    │
    ├───────────────────────┐
    ↓                       ↓
ORGANIZATION A          ORGANIZATION B
    │                       │
    ↓                       ↓
MEMBERSHIP A             MEMBERSHIP B
    │                       │
    ├── Roles A             ├── Roles B
    ├── Teams A             ├── Teams B
    └── Access A            └── Access B
```

The strongest tenant rule is now explicit:

```text
User U-10 belongs to:

Organization A
→ Editor

Organization B
→ Viewer


Being Editor in A

MUST NOT make U-10
Editor in B.
```

The Workspace ambiguity is also frozen for later resolution:

```text
PHASE 3D MUST CHOOSE:

A)

Organization
= Workspace
= tenant

OR

B)

Organization
= tenant

   ├── Workspace 1
   └── Workspace 2


NOT:

Organization and Workspace
both acting as unrelated
security/data tenant roots.
```

Membership deactivation remains non-destructive:

```text
Deactivate Membership OM-20

RESULT:

✓ tenant access removed
✓ sessions/permissions invalidated

PRESERVED:

✓ User account
✓ Employee history
✓ Team history
✓ Role history
✓ Projects
✓ Tasks
✓ Contracts
✓ Reports
✓ Publications
✓ Audit history

Deactivate membership
        ≠
Delete person/history.
```

Invitation acceptance also remains security-safe:

```text
Invitation I-20 issued:

Role intended:
Publishing Manager


Before acceptance:

Role permissions change.

Acceptance does NOT blindly
trust the old invitation grant.

It must revalidate:

Organization
Membership
Role
scope
delegation
security policy

before creating access.
```

## Next Sequential Audit Target

### **Design 146 — API Keys / Webhooks / Developer Access**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
