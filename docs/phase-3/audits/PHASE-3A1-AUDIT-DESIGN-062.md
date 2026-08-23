# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 062 — Client Portal Users / Team Access

Its frozen identity is locked.

Design 062 should become the **canonical Client Portal membership and access-administration workspace** for authorized Client-side administrators to invite people, inspect Portal membership, assign permitted Portal roles/scopes, and deactivate access without changing the underlying person's identity or historical business evidence.

Its governing boundary is:

> **User ≠ Client Portal Membership ≠ Invitation ≠ Organization Membership ≠ Portal Role ≠ Permission ≠ Project Scope ≠ Client Contact ≠ Authentication Identity.**

The most important implementation rule is:

> **Design 062 administers access relationships, not people themselves. Inviting, activating, changing scope, or deactivating a Portal member must never rewrite the canonical User, CRM Contact, Contract signer evidence, Approval decisions, Messages, historical authorship, or Audit history.**

---

# 1. Classification

| Audit field                               | Classification                                                                                                                                        |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                             | **062**                                                                                                                                               |
| **Canonical name**                        | **Client Portal Users / Team Access**                                                                                                                 |
| **Product area**                          | Client Portal / Access Administration / Team                                                                                                          |
| **User surface**                          | **Client Portal**                                                                                                                                     |
| **Screen class**                          | Portal Membership + Invitation + Scoped Access Administration Workspace                                                                               |
| **Classification**                        | **Portal Administration Anchor — Client Membership & Access Family**                                                                                  |
| **Primary purpose**                       | Let authorized Client administrators invite and manage Portal access for people in their Client organization without granting platform-wide authority |
| **Canonical person entity**               | **User**                                                                                                                                              |
| **Portal-access entity**                  | **ClientPortalMembership**                                                                                                                            |
| **Invitation entity**                     | **PortalInvitation**                                                                                                                                  |
| **Organization relationship**             | **OrganizationMembership / Client relationship context**                                                                                              |
| **Role entity**                           | **PortalRole / RoleAssignment**                                                                                                                       |
| **Permission entity**                     | **Permission / Entitlement**                                                                                                                          |
| **Resource-scope entity**                 | **ProjectScope / ResourceGrant**                                                                                                                      |
| **CRM relationship**                      | **Contact**                                                                                                                                           |
| **Authentication dependency**             | **AuthIdentity**                                                                                                                                      |
| **Identity foundation**                   | Design 036                                                                                                                                            |
| **Authorization foundation**              | Design 037                                                                                                                                            |
| **Client foundation**                     | Design 021                                                                                                                                            |
| **Personal-profile dependency**           | Design 059                                                                                                                                            |
| **Organization dependency**               | Design 060                                                                                                                                            |
| **Notification dependency**               | Design 061                                                                                                                                            |
| **Project-access dependencies**           | Designs 042–043                                                                                                                                       |
| **Approval historical dependency**        | Design 052                                                                                                                                            |
| **Contract signer historical dependency** | Design 053                                                                                                                                            |
| **Message historical dependency**         | Design 045                                                                                                                                            |
| **Audit dependency**                      | Design 039                                                                                                                                            |
| **Activation dependency**                 | Design 076                                                                                                                                            |
| **Authentication/recovery dependency**    | Designs 075 / 077                                                                                                                                     |
| **Future internal RBAC overlap**          | Design 144                                                                                                                                            |
| **Future organization-admin overlap**     | Design 145                                                                                                                                            |
| **Parent shell**                          | `ClientPortalShell` — Design 002                                                                                                                      |
| **Primary read model**                    | `ClientPortalUsersAccessView`                                                                                                                         |
| **Template family**                       | `PortalMembershipAdministrationTemplate`                                                                                                              |
| **Auth**                                  | Required                                                                                                                                              |
| **Authorization**                         | Active Portal membership + explicit Client-side access-administration entitlement                                                                     |
| **Implementation priority**               | **Critical Security / Tenant Isolation / Client Administration**                                                                                      |
| **Reuse level**                           | **Extremely High with Designs 036–037 and 059–060**                                                                                                   |

Design 062 should answer:

> **“Who currently has Portal access to our Client organization, who has only been invited, what role and resource scope does each person have, what can I safely administer, and how can access be changed or revoked without altering historical business records?”**

Canonical architecture:

```text
                   CANONICAL USER
                        │
                        ↓
                 AuthIdentity
                        │
                        ↓
             ClientPortalMembership
               ┌────────┼────────┐
               ↓        ↓        ↓
          PortalRole  Scope   Access State
               │        │
               ↓        ↓
          Permissions Projects/resources

PortalInvitation
       │
       └── can create/activate Membership
           after acceptance/identity checks
```

And critically:

```text
CRM Contact
Contract Signer
Approval Participant
Message Author
Audit Actor

        ≠

ClientPortalMembership
```

even when they refer to the same human being.

---

# 2. Reuse

## Reuse Design 036 for canonical User identity

Design 036 already established the broader people identity principle:

> **User ≠ OrganizationMembership ≠ EmployeeProfile ≠ TeamMembership ≠ RoleAssignment.**

Design 062 applies the equivalent separation to Client Portal access.

Correct:

```text
User U-101
   │
   ├── AuthIdentity
   │
   └── ClientPortalMembership M-501
           ↓
        Client A
```

Do not create a duplicate person simply because they are invited to a Client Portal.

---

## Reuse Design 037 for Role and Permission infrastructure

Design 037 remains the platform authorization foundation.

Design 062 should administer a **strict Client-safe subset** of that authorization model.

It must not create a second permission engine such as:

```text
ClientPermission
PortalPermissionV2
CustomerAccessRule
```

with unrelated semantics.

Correct:

```text
Canonical Permission Registry
          │
          ↓
Client-safe Portal Roles
          │
          ↓
ClientPortalMembership
```

---

## Design 037 ≠ Design 062

Their responsibilities differ.

### Design 037

Internal/platform authorization administration.

### Design 062

Client-side administration of **only permitted Client Portal roles and scopes**.

Therefore:

> **Portal administrator ≠ platform RBAC administrator.**

---

## Reuse Design 021 Client identity

Design 021 remains authoritative for:

* Client relationship,
* company/account association.

Design 062 does not create another Client organization when inviting users.

---

## Reuse Design 059 personal profile

Design 059 owns:

> My personal profile/preferences.

Design 062 may display a safe summary of another Portal member but must not become a general profile editor for them.

Correct separation:

```text
Design 059
User edits own profile

Design 062
Authorized admin manages access relationship
```

---

## Reuse Design 060 organization context

Design 060 owns Client organization/profile/settings.

Design 062 uses that organization context when managing Portal membership.

It must not alter company identity while inviting users.

---

## Reuse Design 061 notification preferences

Inviting a user may generate invitation/account notifications.

But Design 062 must not manipulate their personal notification preferences.

---

## Reuse Designs 075–077 for authentication lifecycle

Later:

* 075 Client Sign In
* 076 Client Portal Activation / Accept Invite
* 077 Client Access Recovery

These screens use the same AuthIdentity/Invitation/Membership infrastructure.

Design 062 initiates and administers invitations.

Design 076 executes the invite-acceptance/activation experience.

No duplicate invitation system.

---

## Design 144 relationship

Later:

**Design 144 — Role & Permission Administration**

Expected relationship:

```text
ONE AUTHORIZATION ENGINE
          │
    ┌─────┴─────┐
    ↓           ↓
Design 062   Design 144
Client-safe  Internal/platform
access admin RBAC admin
```

Same Permission truth.

Different allowed role/policy surface.

---

## Design 145 relationship

Design 145 will operate the broader internal Workspace / Organization Administration surface.

Design 062 remains Client-side scoped administration.

Again:

> same organizations and memberships, different authority.

---

# 3. Entities

## User ≠ ClientPortalMembership

`User` is the stable person/application identity.

`ClientPortalMembership` answers:

> What relationship does this User have to this Client Portal organization?

Conceptually:

```text
User
├── stable user ID
├── profile linkage
└── auth identities

ClientPortalMembership
├── userId
├── organization/client context
├── access state
├── role assignments
├── resource scopes
└── membership lifecycle
```

Do not put Client-specific role directly on global User.

---

## One User can have multiple memberships

Conceptually:

```text
User U1
├── ClientPortalMembership → Organization A
└── ClientPortalMembership → Organization B
```

if multi-organization participation is allowed.

Therefore:

```text
user.portalRole
```

as a global field is unsafe.

---

## Membership ≠ Authentication identity

A person's authentication account may remain valid while one Client membership is revoked.

Correct:

```text
AuthIdentity ACTIVE

Client A Membership ACTIVE
Client B Membership DEACTIVATED
```

The User should still be able to access Client A.

---

## Authentication Identity ≠ User Profile

Credentials/login factors remain Design 075–077/Auth subsystem.

Membership administration cannot directly change passwords, MFA, or recovery data.

---

## Invitation ≠ User

An Invitation can exist before the person has:

* a registered User,
* an AuthIdentity,
* active membership.

Conceptually:

```text
PortalInvitation
├── organization
├── intended recipient
├── intended Portal role
├── intended resource scope
├── invitedBy
├── issuedAt
├── expiresAt
└── state
```

It is not a User record.

---

## Invitation ≠ active membership

This is non-negotiable.

```text
INVITED
≠
ACTIVE
```

A Client admin should not see the invited person counted as a fully active Portal member until acceptance/activation succeeds.

---

## Invitation acceptance ≠ merely clicking a link

Activation may require:

* valid invitation token,
* expiry check,
* identity/authentication setup,
* correct recipient verification,
* organization context,
* security checks.

Design 076 later owns the UX.

---

## Invitation token ≠ Invitation identity

Store token securely.

Do not use the raw invitation token as the business primary key.

Token should generally be:

* high entropy,
* expiring,
* single-use or appropriately revocable,
* stored hashed where architecture allows.

Exact security implementation Phase 3D.

---

## Invitation email ≠ stable User identity

An invitation can be sent to:

```text
name@example.com
```

but the canonical resulting User gets a stable internal ID.

Email cannot become permanent identity truth.

---

## Invitation recipient ≠ CRM Contact automatically

The invited email may match a CRM Contact.

That can establish linkage only through controlled resolution.

Do not blindly merge any matching email into a Contact/User identity.

---

## Contact ≠ Portal User

Permanent distinction.

A CRM Contact can exist without Portal access.

A Portal User can have access without needing to become an enriched CRM sales Contact in every context.

---

## Contact role ≠ Portal role

CRM Contact title:

> CFO

does not determine access.

Portal role:

> Finance Viewer

is an authorization concept.

---

## Job title ≠ PortalRole

Permanent:

```text
CEO
Director
Marketing Manager
```

are descriptive titles.

They must not automatically produce:

```text
PORTAL_ADMIN
APPROVER
FINANCE_MANAGER
```

---

## PortalRole ≠ Permission

A Role is a bundle/assignment abstraction.

Permissions remain canonical capabilities.

Conceptually:

```text
PortalRole:
Client Finance Admin

Permissions:
billing.read
payments.initiate
reports.read
```

Role name is not backend enforcement by itself.

---

## RoleAssignment ≠ Role definition

The Role defines capabilities.

RoleAssignment says:

> This membership has this role.

Do not mutate the role definition when editing one user's access.

---

## PortalRole must be Client-safe

Design 062 should only expose roles intentionally available for Client administration.

It must never expose platform/internal roles such as:

```text
SYSTEM_ADMIN
INTERNAL_FINANCE_ADMIN
EDITORIAL_ADMIN
TENANT_SUPER_ADMIN
```

unless intentionally designed, which this audit does not introduce.

---

## Portal administrator ≠ unrestricted administrator

A Client Portal admin can perhaps:

* invite Client users,
* deactivate Client users,
* assign permitted Portal roles/scopes,

according to policy.

They must not gain:

* internal Team Workspace access,
* system configuration,
* platform API administration,
* Audit administration,
* other organizations.

---

## Permission ≠ Project scope

A Permission answers:

> What kind of action is possible?

Scope answers:

> On which resources?

Example:

```text
Permission:
projects.read

Scope:
Project P101
Project P104
```

These remain different dimensions.

---

## Organization-wide access ≠ Project-scoped access

A membership may have:

```text
Projects:
P101 only
```

without access to every Project belonging to the Client.

---

## ProjectScope ≠ Project membership record necessarily

Exact schema Phase 3D may use:

* access grants,
* resource scopes,
* Project memberships.

But it must preserve explicit authorization lineage.

---

## Project read ≠ every Project subresource

Design 043 already established:

> Project access ≠ all subresource access.

A user with Project access may still lack:

* Finance,
* Contracts,
* approvals,
* Reports,
* specific Conversations.

Design 062 must not imply one Project checkbox grants everything.

---

## Organization-wide role ≠ unrestricted subresource authority

Even a Client organization-wide role remains constrained by the Portal permission catalog.

It can never bypass internal/private data boundaries.

---

## Resource scope ≠ UI filter

Critical:

```text
Project Scope
≠
currently selected Project filter
```

Scope is a security constraint enforced on the backend.

---

## Membership lifecycle

A membership should have its own lifecycle.

Conceptually:

```text
PENDING_INVITE
ACTIVE
SUSPENDED
DEACTIVATED
```

or equivalent.

Exact enum later.

Do not overload User/AuthIdentity status.

---

## Invite state and membership state stay separate

Possible:

```text
Invitation:
ACCEPTED

Membership:
ACTIVE
```

Or after failure:

```text
Invitation:
ACCEPTED
Membership provisioning:
FAILED / pending reconciliation
```

The activation operation needs transaction/idempotency protection.

---

## Invitation expired ≠ membership deactivated

An expired invitation never became active access.

Do not create an unnecessary deactivated membership merely to represent expiry unless audit/history policy requires a placeholder relationship.

---

## Invitation revoked ≠ user deactivated

A Client admin can revoke a pending invitation.

If the User has another membership, their User identity remains unaffected.

---

## Resend invitation ≠ new person

A resend should generally reference the same invitation lifecycle or deliberately create a replacement invitation while preserving lineage.

Do not create multiple active memberships.

---

## Duplicate invitation prevention

The system should prevent:

```text
Invite email A
Invite email A
Invite email A
```

from creating three active memberships for the same organization/person.

Need idempotency/uniqueness rules.

---

## Changed invite email

If the invitation was issued to the wrong address:

prefer revoke/reissue semantics.

Do not silently mutate an already-issued security token's intended identity.

---

## Invite role snapshot

The Invitation should preserve intended role/scope at issuance.

If those intended permissions change before acceptance, the system needs explicit policy:

* update pending invitation safely, or
* revoke and reissue.

Do not let the activation endpoint accept arbitrary role values from the invitee's browser.

---

## Invitee cannot elevate role during activation

Critical security rule.

Design 076 must derive role/scope from server-side Invitation.

Never trust:

```text
role = ADMIN
```

from activation form.

---

## Membership creation must be atomic/idempotent

Invitation acceptance should not produce:

* two User records,
* two memberships,
* duplicate role assignments,

when activation is retried.

---

## OrganizationMembership ≠ ClientPortalMembership

The boundary supplied explicitly includes both.

A broader `OrganizationMembership` may represent canonical organizational association.

`ClientPortalMembership` represents Portal access specifically.

Depending on final model:

```text
OrganizationMembership
        ↓
ClientPortalMembership/access projection
```

or they may be related membership types.

But do not assume:

> Anyone associated with the company has Portal access.

---

## Employee/contact relationship ≠ Portal access

An organization may have hundreds of employees.

Only explicitly provisioned Portal members receive access.

---

## Portal Membership ≠ Account ownership

One Portal member being an administrator does not make them the sole owner of the canonical Client relationship.

---

## Membership deactivation ≠ User deletion

Permanent rule:

```text
ClientPortalMembership DEACTIVATED
≠
User deleted
```

Historical identity remains.

---

## Membership deactivation ≠ Contact deletion

CRM relationship/history remains.

---

## Membership deactivation ≠ Personal Profile deletion

Design 059 Profile may remain retained according to account/data policy.

---

## Membership deactivation ≠ AuthIdentity deletion automatically

If the User has other valid memberships/services, global login identity may remain.

---

## Deactivation ≠ historical signer revocation

Suppose a user signed Contract v3 last month.

Today their Portal access is revoked.

Historical result remains:

```text
Signer evidence:
SIGNED
```

Access revocation cannot undo legal history.

---

## Deactivation ≠ historical ApprovalDecision removal

If they approved Proof v5:

```text
ApprovalDecision
→ preserved forever according to policy
```

Deactivating membership only blocks future decisions.

---

## Deactivation ≠ Message deletion

Messages remain authored by that stable User/participant identity.

---

## Deactivation ≠ Audit actor removal

Audit history must still say who performed historical actions.

---

## Deactivation ≠ Client Activity deletion

Client-safe history can retain prior events subject to retention policy.

---

## Removing Project scope ≠ deleting Project activity

The person loses future access.

Their historical involvement remains.

---

## Role change ≠ rewriting old actions

If User was:

> Approver

yesterday and:

> Viewer

today,

yesterday's valid ApprovalDecision remains valid.

---

## Permission revocation affects future authorization

The change should apply to future:

* reads,
* mutations,
* deep links,
* downloads,
* approval actions,
* signing actions.

Existing session/caches must refresh accordingly.

---

## Role effective timing matters

Material access changes should capture:

```text
changedAt
changedBy
old assignment
new assignment
```

for governance.

---

## Temporary access ≠ permanent membership necessarily

If product later supports expiration, membership/resource grants may have expiry.

Do not infer or add this capability unless frozen/product policy requires it.

Architecture should not rely on access being eternal.

---

## Project scope can change independently from role

Example:

```text
Role:
Project Viewer

Before:
Project A, B

After:
Project B only
```

No role redefinition is required.

---

## Approval authority should use ApprovalParticipant

Even if a Portal role has a capability to participate in approvals:

actual ApprovalRequest participation remains Design 052's explicit ApprovalParticipant truth.

A role must not mean:

> automatically an approver on all approval requests.

---

## Contract signing authority should use Signer

Same principle:

```text
portal.contracts.sign
```

is only a broad capability.

The exact ContractVersion must still designate the user as an eligible Signer.

---

## Finance payment authority

A Portal role can grant payment-initiation capability.

The Invoice/payment workflow still evaluates:

* authorized invoice,
* current balance,
* actor scope.

---

## Conversation access

Adding someone to a Project does not automatically add them to all historical Conversations.

Design 045 participant access remains explicit.

---

## Historical Conversation visibility policy

When a new Portal member is added:

the system must explicitly define whether they can see:

* existing Project Conversations,
* only future messages,
* only Conversations they are participants in.

Do not expose history by accident merely from organization membership.

---

# 4. Permissions

Design 062 is itself an authorization-sensitive administrative surface.

The key rule is:

> **A Client Portal administrator may grant only permissions/scopes that the policy allows them to grant and only within the organization/resources they themselves are authorized to administer.**

---

## Access-management permission

Conceptually:

```text
portal.users.read
portal.users.invite
portal.users.manage_access
portal.users.deactivate
```

Exact names Phase 3D.

---

## Read ≠ invite

A Client user may be allowed to see their team roster without being able to invite new users.

---

## Invite ≠ role administration

A user may be permitted to invite someone into a default role but not select elevated roles.

---

## Manage access ≠ unrestricted permission editing

Client admins should choose from predefined permitted Portal roles/scopes.

They should not assemble arbitrary low-level platform permissions unless frozen architecture explicitly supports it.

---

## Cannot grant more than delegated authority

Privilege escalation prevention is mandatory.

Example:

Current user can administer:

```text
Project A
```

They must not assign another user:

```text
All Projects
Finance Admin
Contract Signer
```

unless their delegated administration policy authorizes those grants.

---

## Admin role cannot grant internal roles

Server must reject internal/system Role IDs even if Client manipulates requests manually.

---

## Organization scope is mandatory

Every management command verifies:

```text
actor membership
target membership/invite
same allowed Client organization
```

Cross-tenant user management is prohibited.

---

## Target user ID alone is insufficient

Dangerous:

```text
POST /memberships/U-101/role
```

without organization scope.

Authorization must include explicit membership/resource context.

---

## Membership existence ≠ authorization to manage it

Knowing another membership ID never grants management rights.

---

## Self-demotion / self-deactivation

If the last Client Portal administrator removes their own administrative access, the organization could become unmanageable.

The backend may need policy such as:

> prevent removal of the final required administrator

if the product requires one.

Exact rule Phase 3D.

This is not a new screen.

---

## Last-admin protection ≠ hard-coded role name

Use capability/policy:

> organization still has another authorized access administrator.

Do not rely only on:

```text
role.name === "Admin"
```

---

## Separation of duties

If certain capabilities are particularly sensitive:

* Contract signer assignment,
* Finance authority,
* legal approval,

they may require stronger controls.

Design 062 should not casually map all of them to one broad `Admin`.

---

## PortalRole assignment ≠ ApprovalParticipant assignment

Already important enough to repeat.

Design 062 sets broad authorization.

Design 052's ApprovalRequest determines exact approvers.

---

## PortalRole assignment ≠ ContractSigner assignment

Design 053 determines exact Signer.

Design 062 never makes a person signer merely by setting role.

---

## PortalRole assignment ≠ Client Contact role

CRM title/relationship remains separate.

---

## Organization settings admin ≠ Team Access admin necessarily

Design 060 and 062 can have different capabilities.

---

## Project scope administration

If frozen UI allows assigning Project access:

the server validates every selected Project belongs to the Client and is administrable by the actor.

Never accept arbitrary Project IDs.

---

## Project scope removal must apply immediately enough

After scope is removed:

* Project queries,
* file downloads,
* report access,
* deep links,
* Conversations,

must perform fresh authorization and deny future access accordingly.

---

## Session invalidation / entitlement refresh

Role/deactivation changes may require:

* entitlement cache invalidation,
* token/session refresh,
* forced reauthorization.

Do not rely on frontend hiding menu items.

---

## Existing browser tab

If a deactivated user already has Project page open:

their next data request or mutation must fail authorization.

Client-side cached UI cannot be security truth.

---

## Download URLs after revocation

Any already-issued long-lived signed file URLs create risk.

Design 051 established short-lived/controlled delivery principles.

Access revocation must integrate with that architecture.

---

## Invitation permission ≠ authentication management

Client admins can initiate an invitation.

They must not:

* set invitee password,
* inspect MFA,
* set recovery secret.

---

## Resend invitation

Only authorized access admins can resend.

Rate-limit to prevent abuse/spam.

---

## Invitation enumeration privacy

Invitation errors should not unnecessarily reveal whether an email already has an account elsewhere in the platform.

Exact UX/security wording later.

---

## Account takeover protection

If an invited email already belongs to an existing User:

the system should attach the new membership only after that authenticated/verified User accepts the invitation.

Do not silently grant access based solely on email match.

---

## Contact matching does not authorize Portal access

CRM knows:

> [jane@example.com](mailto:jane@example.com)

That is insufficient to grant Portal membership.

Invitation/activation still required.

---

## Role/Permission lookup must be server-side bounded

Do not send all internal Role definitions to Client Portal and merely hide some options.

Return only Client-assignable roles.

---

# 5. States

Design 062 requires several independent state dimensions.

### Invitation state

```text
Invitation Preparing
Invitation Sent
Invitation Pending
Invitation Accepted
Invitation Expired
Invitation Revoked
Invitation Delivery Failed
Invitation Superseded
```

### Membership state

```text
Membership Provisioning
Active
Suspended
Deactivated
Access Restricted
```

### Role/access state

```text
Role Assigned
Scope Limited
Organization-wide Portal Scope
Access Change Pending
Access Changed
Access Change Failed
```

### Authentication/activation state

```text
Account Activation Required
Authentication Identity Active
Activation Failed / Requires Retry
Recovery Required
```

where safe to expose.

These must not become one `user.status`.

---

## Invited ≠ Active

The UI must clearly distinguish:

> Invitation pending

from:

> Active Portal user.

---

## Invitation Sent ≠ Delivered

Email provider accepted delivery attempt does not prove recipient received/opened it.

Do not call the user active.

---

## Invitation viewed ≠ accepted

Opening activation link is not enough.

---

## Accepted ≠ fully active until provisioning succeeds

Membership/role provisioning should be transactionally safe.

---

## Expired ≠ Revoked

Expired:

> time window ended.

Revoked:

> authorized administrator intentionally invalidated it.

---

## Revoked ≠ Deactivated

Revoke applies to pending Invitation.

Deactivate applies to existing Membership.

---

## Suspended ≠ Deactivated

If the product uses suspension:

* suspended can be temporary,
* deactivated can represent access removal.

Exact semantics Phase 3D.

---

## Deactivated ≠ Deleted

Permanent.

---

## Role change pending ≠ completed

If authorization propagation/caches are asynchronous, avoid showing success before canonical persistence.

---

## Invitation delivery failed ≠ Invitation invalid necessarily

The Invitation may exist even if email delivery failed.

An authorized admin might resend.

---

## Authentication problem ≠ Membership missing

A member can be active but unable to authenticate because of a credential/recovery issue.

Design 077 handles access recovery.

---

## No users ≠ membership service unavailable

An organization legitimately might have only the current user or no additional managed team members.

Technical failure must be different.

---

## No invitations ≠ no users

Pending invitations and active memberships are different collections/views.

---

## Restricted actor state

If current user loses access-management permission while screen is open:

the page should transition to restricted/permission state.

Do not retain mutation controls.

---

## Conflict state

Two administrators can edit the same membership simultaneously.

Example:

```text
Admin A → remove Finance role
Admin B → add Project B
```

Updates need revision/current-state checks so one operation does not silently restore removed privileges.

---

## Last-admin constraint state

If a requested update would leave the organization without an eligible access administrator:

return a specific policy error.

Do not silently accept and lock out the Client.

---

## Duplicate invite state

If an active/pending membership already exists:

the UI should explain the canonical state rather than creating duplicate access records.

---

## State Coverage

Design 062 inherits Design 150 plus access-specific states such as:

```text
Team Access Loading
Team Access Available

No Additional Members
No Pending Invitations

Invitation Creating
Invitation Sent
Invitation Delivery Failed
Invitation Pending
Invitation Expired
Invitation Revoked
Invitation Accepted

Member Active
Member Suspended
Member Deactivated

Role Update Saving
Role Update Saved
Role Update Failed
Role Changed Elsewhere

Project Scope Updating
Project Scope Updated
Project Scope Failed

Insufficient Administration Permission
Cannot Grant Requested Role
Cannot Grant Requested Project Scope
Last Administrator Protection

Membership Restricted
Current Administrator Access Revoked

Activation Pending
Authentication / Recovery Required

Partial Access Service Failure
```

Again, these are separate dimensions, not one mega enum.

---

# 6. Responsive Behavior

## Desktop

Desktop should preserve a clear Client-team administration structure:

```text
Portal Users / Team Access
↓
Current Members
    ├── Person
    ├── safe profile/title
    ├── Portal role
    ├── Project/resource scope
    ├── access state
    └── permitted actions
↓
Pending Invitations
    ├── recipient
    ├── intended role
    ├── intended scope
    ├── invited date
    ├── expiry/status
    └── resend/revoke if frozen
↓
Invite / Access Management
```

It should **not** resemble internal system RBAC administration.

---

## Tablet

Following Design 152:

* member table can become compact cards,
* role and Project scope remain visible,
* actions move into safe overflow/context controls,
* pending invitations remain distinct from active users,
* role/scope editors can use focused panels.

---

## Mobile

Priority:

```text
Team Access
↓
Active Members
↓
Member Card
   ├── Name
   ├── Role
   ├── Scope summary
   ├── Access state
   └── Manage
↓
Pending Invitations
↓
Invite User
```

Avoid horizontally compressed permission matrices.

---

## Mobile role-change safety

Before high-impact changes such as:

* Administrator role,
* Finance authority,
* removing access,

the interface should clearly identify:

```text
Person
Organization
Current role
New role
Resource scope
```

No ambiguous icon-only destructive actions.

---

## Mobile deactivation

If deactivation is present in frozen UI:

explicitly communicate:

> Removes future Portal access. Historical actions and records are preserved.

The UI should not imply account history is deleted.

---

## Accessibility

Member cards/rows need explicit labels for:

* member name,
* membership status,
* role,
* Project scope,
* available action.

Do not communicate elevated access only through badge color.

---

## Role description

Where the frozen UI displays role choices, accessible text should explain practical scope.

A role name alone such as:

> Admin

may be insufficient if multiple admin levels exist.

---

## Invitation status

Use text:

> Invitation pending
> Expires August 30
> Invitation expired
> Active member

rather than relying only on icons.

---

# 7. Backend Requirements

## Read architecture

```text
Design 062
    ↓
ClientPortalSessionContext
    ↓
Access Administration Authorization
    ↓
ClientPortalUsersQueryService
    │
    ├── canonical Users
    ├── ClientPortalMemberships
    ├── safe PersonalProfile summaries
    ├── pending Invitations
    ├── Client-assignable PortalRoles
    ├── effective Permissions
    ├── Project/resource scopes
    └── safe activation/account state
    ↓
ClientPortalUsersAccessView
```

---

## Invite architecture

```text
Client Admin selects Invite
        ↓
authenticate actor
        ↓
authorize organization access administration
        ↓
validate recipient
        ↓
validate assignable PortalRole
        ↓
validate requested Project/resource scope
        ↓
prevent duplicate active/pending relationship
        ↓
create PortalInvitation
        ↓
generate secure token
        ↓
queue invitation communication
        ↓
Audit / Activity
```

---

## Activation architecture

Later Design 076:

```text
Invitation token
       ↓
validate token / expiry / revocation
       ↓
resolve or create canonical User
       ↓
establish AuthIdentity if required
       ↓
verify intended recipient
       ↓
create/activate ClientPortalMembership
       ↓
apply server-side invitation role/scope
       ↓
mark Invitation accepted
       ↓
Audit / Notification
```

This flow must be idempotent.

---

## Existing User acceptance

If User already exists:

```text
existing User
    ↓
authenticate / verify
    ↓
accept new Client membership
```

Do not create a duplicate User simply because the same person receives another invitation.

---

## New User acceptance

If no User exists:

```text
Invitation
    ↓
identity/account creation
    ↓
AuthIdentity setup
    ↓
Membership provisioning
```

The resulting User is canonical beyond this one membership.

---

## Invitation token security

Requirements should include:

* high entropy,
* expiration,
* revocation,
* replay protection,
* recipient/context binding,
* no plaintext token leakage in logs,
* appropriate hashing/storage strategy.

---

## Invitation abuse protection

Need:

* rate limits,
* resend cooldown,
* organization-scoped quotas/policy where appropriate,
* audit trail.

---

## Membership management commands

Prefer explicit commands such as:

```text
invitePortalMember()
resendPortalInvitation()
revokePortalInvitation()

assignPortalRole()
changePortalMemberScope()
deactivatePortalMembership()
reactivatePortalMembership() // only if product/policy supports
```

Do not expose:

```text
PATCH /user/:id
{
  admin: true,
  permissions: [...],
  organizationId: ...
}
```

---

## Role assignment validation

`assignPortalRole()` must verify:

```text
actor can manage access
target belongs to same Client context
requested role is Client-assignable
actor may delegate that role
target membership state supports change
policy invariants remain satisfied
```

---

## Scope assignment validation

For every Project/resource:

```text
resource belongs to Client
actor may administer resource
role permits relevant permission
```

Do not allow arbitrary resource IDs.

---

## Effective authorization

Conceptually:

```text
EffectiveAccess
=
Membership active
+
Role permissions
+
Resource scope
+
source-domain participant constraints
+
current policy
```

A PortalRole alone is not sufficient.

---

## Permission evaluation remains server-side

Every protected API/query should evaluate effective access.

Design 062 exists to administer access configuration; it is not enforcement itself.

---

## Cache invalidation

Changing:

* role,
* Project scope,
* membership state,

must invalidate relevant:

* permission caches,
* Portal BFF caches,
* search scope caches,
* file/download entitlements.

---

## Session/token strategy

If sessions embed entitlements:

authorization changes need timely token/session refresh or server-side lookup.

Avoid long-lived tokens that preserve revoked privileges for hours/days.

Exact implementation Phase 3D.

---

## Deactivation architecture

```text
deactivatePortalMembership()
        ↓
validate actor authority
        ↓
validate target/context
        ↓
check last-admin policy
        ↓
mark Membership inactive
        ↓
invalidate authorization/session state
        ↓
preserve User/history
        ↓
emit Audit / Notification
```

---

## Historical records must reference stable identity

After deactivation:

```text
ApprovalDecision.actorId
ContractSigner.actor linkage
Message.senderId
AuditEvent.actorId
```

continue resolving to meaningful historical identity.

No cascade delete.

---

## Foreign-key/cascade safety

Database design must not allow:

```text
delete membership
→ delete messages
→ delete approvals
→ delete signatures
```

Historical business records should have safe references/snapshots.

---

## Role change audit

Material access changes should generate Design 039 AuditEvents such as conceptually:

```text
PortalMemberInvited
PortalInvitationRevoked
PortalMembershipActivated
PortalRoleChanged
PortalProjectScopeChanged
PortalMembershipDeactivated
```

with:

* actor,
* target member,
* organization,
* old/new role/scope,
* timestamp,
* outcome.

---

## Sensitive audit payloads

Do not include:

* invitation token,
* password data,
* recovery secrets,
* authentication secrets.

---

## Activity integration

Design 063 may show safe Client-facing events such as:

> Sarah joined the Client Portal.

> Team access updated.

Exact visibility policy matters; sensitive permission detail may stay Audit-only.

---

## Notification integration

Potential Notifications:

```text
You've been invited
Your Portal access is active
Your Project access changed
Your Portal access was removed
```

according to policy.

Notification is not Membership truth.

---

## Design 061 preference interaction

Invitation/security/access communications may be mandatory.

User notification preference must not suppress required access lifecycle emails where policy requires them.

---

## Project query integration

Designs 042–043 must filter Projects according to current effective scope.

A role/scope change in 062 must affect those queries consistently.

---

## Search integration

Design 079 later universal search must use current membership/resource scope.

A user removed from Project A must stop receiving Project A search results/snippets.

---

## Files integration

Design 051 secure download authorization must honor changed scope immediately enough.

---

## Reports integration

Design 056 Report visibility similarly depends on current entitlement.

---

## Conversations integration

Design 045 must reauthorize Conversation participation; Project scope alone may not be enough.

---

## Approval integration

Design 052:

```text
portal approval permission
+
ApprovalParticipant eligibility
```

still required.

Design 062 role assignment does not rewrite ApprovalParticipant history.

---

## Contract integration

Design 053:

```text
portal contract signing capability
+
exact Signer eligibility
```

still required.

Role changes do not rewrite existing Signer evidence.

---

## Backend Requirement Matrix

| Requirement                                  | Status                    |
| -------------------------------------------- | ------------------------- |
| Client Portal authentication                 | **Critical**              |
| Stable canonical User identity               | **Critical**              |
| AuthIdentity separation                      | **Critical**              |
| ClientPortalMembership entity                | **Critical**              |
| Organization context                         | **Critical**              |
| OrganizationMembership distinction           | **Critical**              |
| PortalInvitation entity                      | **Critical**              |
| Invitation vs Membership separation          | **Critical**              |
| Secure invitation token lifecycle            | **Critical**              |
| Invitation expiry/revocation                 | **Critical**              |
| Duplicate invitation prevention              | **Critical**              |
| Idempotent activation                        | **Critical**              |
| Existing-user resolution                     | **Critical**              |
| New-user creation integration                | **Critical**              |
| Client-safe PortalRole registry              | **Critical**              |
| Canonical Permission registry reuse          | **Critical**              |
| RoleAssignment separation                    | **Critical**              |
| Role vs job-title separation                 | **Critical**              |
| Resource/Project scope model                 | **Critical**              |
| Permission vs scope separation               | **Critical**              |
| Organization-wide vs Project-scoped access   | **Critical**              |
| Project/subresource authorization separation | **Critical**              |
| Delegated administration policy              | **Critical**              |
| Privilege-escalation prevention              | **Critical**              |
| Cross-tenant protection                      | **Critical**              |
| Client-assignable-role filtering             | **Critical**              |
| Last-admin protection if required            | **Critical**              |
| Membership deactivation without deletion     | **Critical**              |
| Historical User identity preservation        | **Critical**              |
| Historical signer evidence protection        | **Critical**              |
| Historical approval evidence protection      | **Critical**              |
| Historical Message authorship protection     | **Critical**              |
| Historical Audit actor protection            | **Critical**              |
| Session/entitlement invalidation             | **Critical**              |
| Permission-cache invalidation                | **Critical**              |
| Fresh source-domain authorization            | **Critical**              |
| Invitation abuse/rate limiting               | **Critical**              |
| Design 059 Profile separation                | **Critical**              |
| Design 060 Organization separation           | **Critical**              |
| Design 061 preference integration            | **Required**              |
| Designs 075–077 Auth integration             | **Critical**              |
| Design 037 authorization reuse               | **Critical**              |
| Designs 144–145 future reuse                 | **Critical architecture** |
| Activity integration                         | **Required**              |
| Notification integration                     | **Required**              |
| Audit integration                            | **Critical**              |
| Concurrency/current-state validation         | **Critical**              |
| Partial service failure handling             | **Critical**              |

---

# 8. Consolidation

Design 062 exposes several especially high-risk security and identity errors.

**User / Membership conflation**
Client-specific access state is stored directly on global User.

**User / AuthenticationIdentity conflation**
Deactivating Client membership destroys login identity globally.

**Membership / Invitation conflation**
Sending invitation instantly grants active Portal access.

**Invitation / User conflation**
Every invite creates duplicate User records.

**Invitation email / identity conflation**
Email becomes permanent User ID.

**Invitation / CRM Contact conflation**
Matching email silently merges sales/contact identity.

**Contact / Portal User conflation**
Every CRM Contact is treated as Portal-enabled.

**OrganizationMembership / PortalMembership conflation**
Anyone associated with the company automatically gets Portal access.

**PortalRole / job title conflation**
“CEO” or “Director” grants administrative rights.

**PortalRole / Permission conflation**
Role label becomes authorization instead of underlying capabilities.

**Role definition / RoleAssignment conflation**
Editing one member modifies role behavior for everyone.

**Portal administrator / platform administrator conflation**
Client admin receives internal/system authority.

**Permission / ProjectScope conflation**
Can-read permission automatically means all Projects.

**ProjectScope / UI filter conflation**
Security is implemented as a selected Project dropdown.

**Project access / subresource access conflation**
Project viewer automatically sees Contracts, Finance and private Conversations.

**Organization-wide Portal access / internal visibility conflation**
Client admin sees internal-only Project/CRM data.

**Invitation pending / active membership conflation**
Pending invite appears as active user in counts/security.

**Invitation sent / delivered conflation**
Email provider acceptance treated as recipient receipt.

**Invitation viewed / accepted conflation**
Opening link grants access.

**Invitation expired / revoked conflation**
Security history loses whether time or admin action ended invitation.

**Invitation revoked / membership deactivated conflation**
Pending access and previously active access share one state.

**Activation/browser role tampering**
Invitee submits a higher role than the Invitation granted.

**Duplicate activation**
Retry creates duplicate Membership/RoleAssignments.

**Duplicate invitation**
Multiple invites create multiple memberships.

**Email matching/account takeover**
Existing User receives access without authenticated acceptance because email matched.

**Portal role / ApprovalParticipant conflation**
Any role-capable user becomes approver for every ApprovalRequest.

**Portal role / ContractSigner conflation**
Finance/admin role makes user a legal signer automatically.

**Portal role / payment eligibility conflation**
Finance role bypasses Invoice/payment validation.

**Organization membership / Conversation participation conflation**
New users suddenly see private historical Messages.

**Role change / historical action rewrite**
Past Approval/signature evidence reflects today's role.

**Deactivation / User deletion conflation**
Person/history disappears.

**Deactivation / Contact deletion conflation**
CRM relationship is erased.

**Deactivation / Message deletion conflation**
Historical communication disappears.

**Deactivation / signer revocation conflation**
Executed Contract signature becomes invalid because Portal access ended.

**Deactivation / ApprovalDecision deletion conflation**
Past formal approvals disappear.

**Deactivation / Audit actor deletion conflation**
Forensic traceability is lost.

**Scope removal / history deletion conflation**
Past Project activity is destroyed rather than merely becoming inaccessible.

**Frontend authorization**
Menu visibility is treated as access control.

**Stale-session privilege**
Deactivated user continues accessing resources through cached/token permissions.

**Long-lived signed URL privilege**
File links remain usable after access revocation.

**Cross-tenant membership management**
Client administrator edits another Client's user by manipulating IDs.

**Arbitrary internal-role assignment**
Client sends an internal Role ID via API.

**Privilege delegation escalation**
Client admin grants capabilities they do not have authority to delegate.

**Last-admin lockout**
Final access administrator removes themselves/others, leaving organization unmanaged.

**Generic User PATCH**
One endpoint modifies profile, membership, roles, authentication and organization.

**Invitation token leakage**
Tokens appear in logs/Audit/provider metadata.

**Invitation resend abuse**
Portal admin can spam recipients without controls.

**Notification preference / mandatory invite communication conflation**
Invite/access-security emails are suppressed as optional marketing-like communication.

**062/059 duplicate User/Profile domain**
Team Access starts editing personal identity.

**062/060 duplicate Organization domain**
Membership administration creates Client organizations.

**062/061 duplicate communication settings**
Invitations alter personal preferences.

**062/075–077 duplicate authentication lifecycle**
Access administration implements sign-in/activation/recovery separately.

**062/037/144 duplicate RBAC engines**
Client and internal roles use incompatible authorization truth.

**062/145 duplicate organization-membership administration**
Client and internal admin use different membership identities.

No additional screen is required.

These are **identity, invitation, membership, authorization, delegated administration, scope, tenant isolation and historical-evidence requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT PORTAL MEMBERSHIP, INVITATION & SCOPED ACCESS ADMINISTRATION ANCHOR**

**Domain directive:**
**User ≠ ClientPortalMembership ≠ Invitation ≠ OrganizationMembership ≠ PortalRole ≠ Permission ≠ ProjectScope ≠ ClientContact ≠ AuthenticationIdentity.**

**Identity directive:**
one stable canonical User represents the person. Portal membership, AuthIdentity, Contact linkage and organization access remain separate relationships around that identity.

**Membership directive:**
Client Portal access lives in an explicit ClientPortalMembership scoped to the Client/organization. Global User state must never be used as a substitute for tenant-specific access.

**Invitation directive:**
Invitation is a pending access offer, not an active Membership. It preserves recipient, organization, intended role/scope, issuer, expiry and lifecycle independently.

**Activation directive:**
Design 076 consumes the same Invitation and Auth infrastructure. Invite acceptance performs verified, secure and idempotent provisioning and never trusts role/scope values supplied by the invitee.

**Existing-user directive:**
an existing User accepting another Client invitation receives another authorized membership rather than a duplicate User identity.

**Contact directive:**
CRM Contact records remain separate from Portal access. Email matching alone never grants membership or merges identities.

**Role directive:**
PortalRole is an authorization bundle, not a job title. CEO, CFO, Director and other descriptive positions never automatically imply Portal capabilities.

**Permission directive:**
backend authorization evaluates canonical Permissions rather than trusting role labels or UI state.

**Scope directive:**
Permission and resource scope remain separate. A membership can have `projects.read` while being restricted to a defined subset of Projects/resources.

**Subresource directive:**
Project entitlement does not automatically expose Contracts, Finance, Reports, Approvals, Conversations or files unless those domain permissions/entitlements also allow access.

**Administration directive:**
Client Portal administrators may administer only Client-safe roles/scopes they are explicitly authorized to delegate. They are never unrestricted platform/System administrators.

**Escalation directive:**
server-side commands reject internal Role IDs, cross-tenant targets, unauthorized Projects and any grant exceeding delegated authority.

**Approval directive:**
Design 062 may grant broad approval capability, but Design 052's explicit ApprovalParticipant still determines who can decide each exact ApprovalRequest.

**Signer directive:**
Design 062 never makes someone a legal Signer by role assignment. Design 053's exact Signer/SignatureRequest remains authoritative.

**Authentication directive:**
password, MFA, sessions, activation and recovery remain dedicated Auth concerns handled with Designs 075–077. Client access administrators never manage user credentials directly.

**Deactivation directive:**
membership deactivation revokes future access; it does not delete User/Profile/Contact identity or historical actions.

**Historical-evidence directive:**
Contract signer evidence, ApprovalDecision actors, Message authorship, Project history, Client Activity and AuditEvents remain stable after role changes, scope changes or deactivation.

**Session directive:**
role/scope/deactivation changes invalidate authorization caches/sessions sufficiently quickly that an already-open browser cannot continue exercising revoked authority.

**File directive:**
secure download authorization from Design 051 must honor current membership/scope and avoid long-lived access that survives revocation unnecessarily.

**Invitation-security directive:**
tokens are high-entropy, expiring, revocable and replay-safe; invitation creation/resend is rate-limited and auditable.

**Idempotency directive:**
invitation creation, acceptance, role change and membership provisioning tolerate retries without duplicate Users, Memberships, Roles or Project grants.

**Concurrency directive:**
simultaneous membership administration uses current-state/revision validation so one administrator cannot silently reintroduce privileges another just removed.

**Last-admin directive:**
where organization operability requires at least one authorized access administrator, that constraint is enforced as backend policy rather than UI convention.

**Notification directive:**
invite/access lifecycle communications use the shared Notification system, with security/activation messages remaining mandatory where policy requires regardless of optional preferences.

**Audit directive:**
invites, activation, role changes, scope changes, suspension/deactivation and other material access operations feed Design 039 with actor/target/old-new scope lineage while never logging secrets or tokens.

**Responsive directive:**
desktop provides active-members + pending-invitations + role/scope administration; mobile reduces this to member cards and focused access editors without exposing an internal RBAC permission matrix.

**Overlap directive:**
Designs **021, 036–037, 039, 042–045, 051–053, 056, 059–062, 075–077, 079, 144–145** must ultimately consume one User + AuthIdentity + ClientPortalMembership + Invitation + Role/Permission + ResourceScope foundation while keeping business-domain participant/evidence records independently authoritative.

**Consolidation directive:**
**STANDARDIZE ONE PORTAL ACCESS FOUNDATION — STABLE USER + AUTHIDENTITY + CLIENTPORTALMEMBERSHIP + SECURE INVITATION + CLIENT-SAFE PORTAL ROLE + CANONICAL PERMISSIONS + RESOURCE/PROJECT SCOPE + DELEGATED ADMINISTRATION + SESSION/CACHE INVALIDATION + HISTORICAL-ACTOR PRESERVATION — AND DO NOT BUILD CLIENT ACCESS AS A SECOND USER DIRECTORY, CONTACT SYSTEM, AUTH SYSTEM OR RBAC ENGINE.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **62 / 153** |
| **PASS**                                   |                         **62** |
| **STANDARDIZE decisions**                  |                         **60** |
| **Potential implementation-overlap flags** |                         **53** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**62 / 153 = 40.5% audited.**

### Canonical Portal-access architecture after Design 062

```text
                       USER
                        │
              ┌─────────┴─────────┐
              ↓                   ↓
         AuthIdentity          Profile
                               Design 059
              │
              ↓
     ClientPortalMembership
              │
      ┌───────┼────────┐
      ↓       ↓        ↓
 PortalRole Scope   Access State
      │       │
      ↓       ↓
 Permission Projects/resources
```

Invitation remains deliberately before Membership:

```text
PortalInvitation
      │
      ├── recipient
      ├── Client organization
      ├── intended role
      ├── intended scope
      ├── expiry
      └── secure token
              │
              ↓
        Design 076
   Accept / Activate Invite
              │
              ↓
       Verified User/Auth
              │
              ↓
    ClientPortalMembership
```

And historical identity remains protected:

```text
ROLE / SCOPE / MEMBERSHIP CHANGES TODAY
                    │
                    ↓
           FUTURE ACCESS CHANGES

                    ≠

      HISTORICAL BUSINESS EVIDENCE
      ├── Contract signatures
      ├── Approval decisions
      ├── Messages
      ├── Project activity
      └── Audit events

Historical evidence is preserved.
```

# Next Sequential Audit Target

## **Design 063 — Client Activity / Account History**

Its frozen identity is already locked.

The next audit must preserve the history boundary:

> **Activity Event ≠ AuditEvent ≠ Notification ≠ Message ≠ Source-Domain Record ≠ State Change ≠ Timeline Projection ≠ Client-visible Account History.**

It will also need to ensure that Client Activity is a **safe projection of canonical domain events**, not an alternate source of truth, while excluding internal-only operational, security, employee, Sales, and Audit details.

After Design 063 we continue strictly:

**064 Client Notifications Center → 065 Client Media Projects / Media Center → 066 Client Media Project Detail → 067 Client Questionnaires Library → … → 077 Client Access Recovery**

with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
