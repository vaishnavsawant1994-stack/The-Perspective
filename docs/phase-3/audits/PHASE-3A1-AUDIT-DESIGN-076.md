# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 076 — Client Portal Activation / Accept Invite

Its frozen identity and supplied route annotation **`/client/activate/[token]`** are locked. Exact route connections remain a **Phase 3B** concern and are not being redesigned here.

Design 076 should become the **canonical Client Portal invitation-acceptance and membership-activation surface** for consuming one valid invitation grant, securely resolving the intended recipient, and establishing the exact ClientPortalMembership/access grant originally authorized by the inviter.

Its governing boundary is:

> **Invitation ≠ ActivationToken ≠ User ≠ AuthenticationIdentity ≠ ClientPortalMembership ≠ PortalRoleAssignment ≠ ResourceScope ≠ AuthenticationSession ≠ Organization.**

The central implementation rule is:

> **An Invitation is a pending grant of access; an ActivationToken is temporary proof for that invitation; accepting it establishes or activates the intended Membership only after all identity, token, organization, role, scope, expiry, revocation and anti-replay checks succeed. Authentication alone never accepts an invitation, and possession of the token alone must never grant unrestricted Portal access.**

---

# 1. Classification

| Audit field                              | Classification                                                                                                                     |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                            | **076**                                                                                                                            |
| **Canonical name**                       | **Client Portal Activation / Accept Invite**                                                                                       |
| **Product area**                         | Client Portal / Identity / Membership / Access Activation                                                                          |
| **User surface**                         | Public-to-authenticated Client Portal transition                                                                                   |
| **Screen class**                         | Invitation Acceptance / Membership Activation Workflow                                                                             |
| **Classification**                       | **Client Access Activation Anchor — Invitation-to-Membership Establishment Family**                                                |
| **Primary purpose**                      | Validate a specific invitation and securely establish the exact proposed Client Portal membership, role and allowed resource scope |
| **Canonical Invitation foundation**      | Design 062                                                                                                                         |
| **Authentication foundation**            | Design 075                                                                                                                         |
| **Stable person/account entity**         | **User**                                                                                                                           |
| **Authentication entity**                | **AuthenticationIdentity**                                                                                                         |
| **Pending access entity**                | **Invitation**                                                                                                                     |
| **Temporary proof entity**               | **ActivationToken**                                                                                                                |
| **Activated authorization relationship** | **ClientPortalMembership**                                                                                                         |
| **Role entity**                          | **PortalRoleAssignment**                                                                                                           |
| **Scope entity**                         | **ResourceScope / MembershipResourceGrant** where applicable                                                                       |
| **Organization entity**                  | Canonical Organization                                                                                                             |
| **Session entity**                       | **AuthenticationSession**                                                                                                          |
| **Recovery dependency**                  | Design 077                                                                                                                         |
| **Audit dependency**                     | Design 039                                                                                                                         |
| **Notification dependency**              | Designs 061 / 064                                                                                                                  |
| **Parent after successful activation**   | `ClientPortalShell` — Design 002                                                                                                   |
| **Primary workflow service**             | `ClientPortalInvitationAcceptanceService`                                                                                          |
| **Auth requirement**                     | Depends on invite/account state, but identity verification is mandatory before authority is granted                                |
| **Authorization requirement**            | Invitation grant itself + verified recipient identity + server-side role/scope policy                                              |
| **Implementation priority**              | **Critical Security / Tenant Isolation / Authorization Establishment**                                                             |
| **Reuse level**                          | **Extremely High with Designs 062 and 075**                                                                                        |

Design 076 should answer:

> **“Is this invitation still valid, does this person legitimately control the intended recipient identity, what exact Organization/role/resource scope was granted, and can that grant be atomically converted into one valid ClientPortalMembership without creating duplicate Users or allowing privilege escalation?”**

Canonical flow:

```text
Invitation
    │
    ├── Organization
    ├── intended recipient
    ├── proposed Portal role
    ├── proposed resource scope
    ├── inviter
    └── expiry
          │
          ↓
    ActivationToken
          │
          ↓
 Token validation
          │
          ↓
 Recipient identity verification
          │
    ┌─────┴─────────┐
    ↓               ↓
Existing User     New User
    │               │
    └───────┬───────┘
            ↓
AuthenticationIdentity
            ↓
ClientPortalMembership
            │
      ┌─────┴─────┐
      ↓           ↓
PortalRole    ResourceScope
            │
            ↓
      Invitation Accepted
            ↓
       Token Consumed
```

---

# 2. Reuse

## Design 062 remains the canonical Invitation and Membership foundation

Design 062 established:

> **User ≠ ClientPortalMembership ≠ Invitation ≠ PortalRole ≠ Permission ≠ ResourceScope.**

Design 076 must consume exactly those entities.

Do **not** create:

```text
ActivatedClient
PortalInviteUser
ClientActivationAccount
InviteMembershipV2
```

as parallel access systems.

Correct:

```text
Design 062
Team Access Administration
     │
     ↓
Invitation created
     │
     ↓
Design 076
Invitation accepted
     │
     ↓
same ClientPortalMembership foundation
```

---

## Design 075 remains the authentication foundation

Design 075 answers:

> Who is this User?

Design 076 answers:

> Should this verified User receive this exact pending Portal access grant?

These must remain separate.

```text
Authentication success
        ≠
Invitation acceptance
```

and:

```text
Invitation token valid
        ≠
Authenticated identity
```

unless the specific activation security policy deliberately uses another verified identity mechanism.

---

## Sign-in must never auto-accept a pending Invitation

Permanent:

```text
User signs in
   ↓
User authenticated
   ↓
Invitation remains PENDING
```

until Design 076 performs the explicit acceptance transaction.

---

## Activation does not create a second User when one already exists

Correct:

```text
Existing User U-100
+
Invitation I-20
      ↓
new ClientPortalMembership M-70
```

Not:

```text
Existing User U-100

plus

New User U-101
created because invitation email matched
```

---

## Reuse canonical Organization

The Invitation points to an existing canonical Organization.

Design 076 must not create another:

```text
PortalOrganization
InviteOrganization
```

record.

---

## Reuse Portal roles from the authorized Client role registry

The role in an Invitation must reference an allowed Client-facing Portal role.

Internal Team Workspace/platform administrator roles must never become assignable through this flow.

---

## Reuse resource-scope architecture

Where the Invitation includes Project/resource restrictions:

Design 076 creates/applies those exact authorized grants.

It must not interpret:

> Member of Organization

as automatically:

> Access to every Project and every Client resource.

---

## Reuse Design 039 Audit

Invitation acceptance is a material authorization event.

Audit should record it independently from the Membership record itself.

---

## Reuse Notification infrastructure

Activation/invite communications can use Designs 061/064.

But email delivery success is not Invitation acceptance.

---

## Design 076 ≠ Design 077

Design 077 recovers control of an existing authentication identity/access path.

Design 076 establishes a pending invitation grant.

Recovery must never be used as an alternate invitation-acceptance path.

---

# 3. Entities

## Invitation

`Invitation` represents pending authorization intent.

Conceptually:

```text
Invitation
├── id
├── organizationId
├── intended destination / recipient hint
├── proposed PortalRole
├── proposed ResourceScope
├── invitedBy
├── issuedAt
├── expiresAt
├── status
└── acceptance lineage
```

Exact schema belongs to Phase 3D.

---

## Invitation can exist before User

Critical:

```text
Invitation
→ jane@company.com

User record
→ may not exist yet
```

This is valid.

Do not create placeholder User accounts just to store every Invitation unless there is a deliberate identity architecture requiring it.

---

## Invitation ≠ User

A pending invite recipient is not yet necessarily a platform account.

---

## Invitation destination email ≠ permanent User identity

The invited address helps bind/verify recipient intent.

It must not become the User's immutable identity key forever.

Example:

```text
Invitation destination:
jane@oldcompany.com

Later AuthenticationIdentity:
jane@newcompany.com
```

Historical Invitation evidence remains unchanged.

---

## Invitation ≠ AuthenticationIdentity

Even when strings match:

```text
Invitation.destinationEmail
=
AuthenticationIdentity.identifier
```

they remain different entities.

---

## Invitation ≠ ClientPortalMembership

Permanent:

```text
PENDING invitation
≠
ACTIVE membership
```

Prefer not to represent pending invite rows as actual active Memberships internally merely for UI convenience.

Design 062 can project Invitations and Memberships together.

---

## ActivationToken ≠ Invitation

Invitation is the durable pending grant.

ActivationToken is temporary proof allowing a holder to invoke the acceptance flow.

Conceptually:

```text
ActivationToken
├── invitationId
├── token hash/reference
├── issuedAt
├── expiresAt
├── consumedAt
├── revokedAt
└── generation/version
```

---

## Raw token should not be stored in plaintext

Prefer:

```text
raw token
→ delivered to recipient
→ hash stored server-side
```

or a cryptographically signed/opaque token model with equivalent safety.

Never persist raw activation secrets casually in:

* database fields,
* application logs,
* analytics,
* AuditEvent payloads.

---

## Token in the locked route must not propagate unnecessarily

Because the frozen route includes `[token]`, the implementation should avoid carrying that raw token into:

* unrelated redirect URLs,
* analytics payloads,
* error-reporting metadata,
* referrer leakage,
* frontend logs.

After successful validation/exchange, subsequent state should use safe server-side identifiers rather than repeatedly propagating the raw secret.

---

## ActivationToken ≠ AuthenticationSession

Possessing a valid invitation token must never automatically become a general authenticated Portal session.

---

## Token validity ≠ Invitation validity

Both must be checked.

A technically valid token can point to an Invitation that has since become:

* Revoked,
* Accepted,
* Superseded,
* otherwise ineligible.

---

## Token must bind exact Invitation

Never accept:

```text
token validates
+
browser supplies invitationId = different invite
```

The token resolves its canonical Invitation server-side.

---

## Token must bind Organization

The recipient cannot modify:

```text
organizationId
```

during acceptance.

Organization comes from the signed/server-side Invitation.

---

## Token must bind intended role

The browser cannot submit:

```text
role = ADMIN
```

to replace the role in the Invitation.

---

## Token must bind intended ResourceScope

Same for Project/resource grants.

Dangerous:

```text
POST /accept
{
  token,
  projectIds: ["all projects"]
}
```

unless those values are merely confirming server-resolved grants and cannot alter them.

---

## Proposed role/scope ≠ recipient preference

The invitee accepts or declines the grant.

They do not negotiate/escalate its authorization payload through request tampering.

---

## User ≠ AuthenticationIdentity

The accepted grant should bind to stable User identity after recipient verification.

It should not bind forever to mutable email strings.

---

## Existing User path

Correct flow:

```text
Invitation
      ↓
recipient verified
      ↓
existing AuthenticationIdentity → User U1
      ↓
create/link ClientPortalMembership for U1
```

---

## New User path

Where frozen activation flow supports new-account establishment:

```text
Invitation
      ↓
recipient verified
      ↓
create canonical User
      ↓
create verified AuthenticationIdentity
      ↓
establish credential/auth mechanism
      ↓
create Membership
```

These operations must remain governed.

Do not infer extra UI beyond the frozen design.

---

## User creation ≠ Membership creation conceptually

They may occur in one transaction/workflow, but identities remain distinct.

---

## ClientPortalMembership

Conceptually:

```text
ClientPortalMembership
├── userId
├── organizationId
├── lifecycle state
├── createdAt
├── activatedAt
└── authorization revision
```

---

## Membership uniqueness

The system should prevent duplicate active memberships for the same:

```text
organizationId + userId
```

under the chosen membership model.

---

## Existing active membership + new Invitation

This case must not silently create a duplicate Membership.

The backend needs explicit reconciliation.

Possible outcomes depend on policy:

* invitation is redundant,
* invitation proposes different governed access,
* invitation is rejected as invalid/conflicting,
* invitation applies a deliberate new role/scope change.

Whatever policy is chosen, it must be explicit and escalation-safe.

---

## Invitation acceptance ≠ unrestricted Organization access

Membership can still carry restricted:

```text
PortalRoleAssignment
+
ResourceScope
```

---

## PortalRoleAssignment ≠ Membership

Membership establishes relationship.

RoleAssignment grants a role within that relationship.

---

## PortalRoleAssignment ≠ Permission

A role resolves to a set of permissions.

Do not write hundreds of unchecked permissions directly from invitation request payload.

---

## Role ≠ job title

Permanent.

Invitation:

> Client Admin

does not mean:

> CEO

and vice versa.

---

## Portal role ≠ platform administrator

A Client Portal administrator remains scoped to allowed Client Portal administration.

It must never become internal/global platform administrator.

---

## ResourceScope ≠ Organization

Membership in Acme does not inherently imply every Project/resource in Acme.

---

## ResourceScope should use canonical server-managed references

If scope includes Project P101:

the backend validates:

* Project belongs to Organization,
* inviter was allowed to grant it,
* recipient role is allowed that scope.

---

## Invitation creator cannot grant more than allowed

Design 062 invariant continues:

> **No privilege escalation through invitation.**

The inviter cannot assign capabilities/scopes they are not authorized to grant.

Design 076 should revalidate the grant at acceptance where policy requires rather than trusting stale historical privilege blindly.

---

## Invitation acceptance ≠ historical authorization rewrite

If access is accepted today:

it must not make the user appear to have had access yesterday.

Preserve:

```text
membership.activatedAt
```

and historical event timestamps.

---

## Acceptance ≠ historical signer/approver participation

Accepting Portal access does not retroactively make the user:

* ContractSigner,
* ApprovalParticipant,
* MessageParticipant,
* Payment authority.

Those remain subject-specific entities/policies.

---

## Acceptance ≠ Message history ownership

If Membership grants future Project access, historical Conversation access still depends on ConversationParticipant policy.

---

## Acceptance ≠ existing Audit actor rewrite

Past Audit events continue to reference their original actors.

---

## Invitation acceptance should be single-use

Once accepted:

```text
Invitation.status = ACCEPTED
ActivationToken = CONSUMED
```

or equivalent.

Reusing the same token must not create another Membership.

---

## Accepted token replay should be idempotent

If the acceptance request succeeded but the browser timed out:

retrying the same token should resolve safely to the already-accepted result where security policy permits.

It must not produce:

* duplicate Membership,
* duplicate RoleAssignment,
* duplicate ResourceGrant.

---

## Expired ≠ revoked

Separate states.

### Expired

Time window ended.

### Revoked

An authorized actor intentionally invalidated access offer.

---

## Revoked ≠ accepted

Obviously distinct, but concurrency makes it important.

Acceptance and revocation racing must resolve atomically.

---

## Superseded invitation

If invitation is resent/replaced:

old tokens should no longer be active.

Preserve historical Invitation lineage.

---

## Resend ≠ duplicate grant

Design 062 must not generate multiple parallel active grants just because an email was resent.

---

# 4. Permissions

Design 076 is a security-sensitive grant-establishment workflow.

The acceptance operation must validate:

```text
ActivationToken
+
Invitation status
+
Invitation expiry
+
Organization
+
intended recipient
+
identity proof
+
proposed PortalRole
+
ResourceScope
+
current grant policy
```

before creating authority.

---

## Token possession alone should not necessarily be enough

Where authentication/identity verification is required, possession of the link must not let a forwarded token grant access to the wrong person.

---

## Existing authenticated User

If a User is already signed in:

backend must verify that this User is eligible to accept the Invitation.

Do not simply accept any token presented by any authenticated account.

---

## Email matching alone may be insufficient in higher-risk flows

The server should apply the Invitation's recipient-binding policy.

At minimum, the authenticated identity/destination relationship must satisfy the expected grant rules.

---

## Existing wrong account

Example:

```text
Invitation → jane@acme.com
Currently signed in → bob@acme.com
```

The system must not attach Jane's invitation to Bob merely because Bob possesses the link.

---

## No client-supplied role authority

Server must ignore/reject attempts to modify:

* PortalRole,
* permissions,
* Organization,
* Project scope,
* inviter,
* membership state.

---

## No cross-tenant Invitation substitution

An attacker cannot combine:

```text
valid token from Org A
+
organizationId Org B
```

to create access in Org B.

Organization is token/invitation bound.

---

## Revalidate assignability where necessary

If the invitation was created legitimately but, before acceptance:

* role was deprecated,
* Project was removed,
* inviter lost grant authority,
* Organization policy changed,

the backend should apply deliberate acceptance policy.

Never blindly grant now-invalid privilege because it was encoded months ago.

---

## Invite acceptance does not grant subject-specific authority automatically

Even a Portal admin still requires canonical:

* ApprovalParticipant,
* ContractSigner,
* ConversationParticipant,

where those domains require it.

---

## Last-admin rules belong Membership governance, not activation bypass

If acceptance creates an administrator, that remains within the Portal role policy.

It never bypasses Design 062 access-governance invariants.

---

## Rate limiting

Token validation/acceptance should be rate-limited to reduce:

* token brute forcing,
* enumeration,
* replay abuse.

---

## Enumeration-safe invalid token response

Do not reveal unnecessary details such as:

> This was an invitation to Acme CEO Jane Smith with Admin access.

before token validity/recipient identity is safely established.

---

## Referrer/log safety

Because token is security-sensitive:

* avoid third-party resources that unnecessarily receive full activation URL,
* sanitize server/request logging,
* avoid analytics capturing raw route parameters.

---

# 5. States

Design 076 must keep Invitation, Token, identity, Membership, role/scope and session states separate.

### Invitation lifecycle

```text
Pending
Accepted
Expired
Revoked
Superseded
```

### ActivationToken state

```text
Valid
Expired
Consumed
Revoked / Rotated
Invalid
```

### Recipient identity state

```text
Identity Not Yet Established
Existing User Identified
Authentication Required
Authenticated Matching User
Recipient Mismatch
New Account Establishment Required
```

where applicable.

### Acceptance operation

```text
Ready to Accept
Accepting
Accepted
Already Accepted
Acceptance Failed
Acceptance Outcome Reconciliation Required
```

### Membership state

```text
No Membership
Membership Creating
Active
Restricted where granted
Activation Failed
Existing Membership Detected
```

### Session relationship

```text
No Session
Authenticated Session Present
New Session Required / Established
```

These must never become one `activation.status`.

---

## Token valid ≠ Invitation acceptable

Permanent.

---

## Invitation pending ≠ identity verified

Permanent.

---

## Identity authenticated ≠ Invitation accepted

Permanent.

---

## Invitation accepted ≠ unrestricted role

The exact role/scope controls authority.

---

## Membership created ≠ session necessarily created

Depending on flow, acceptance can establish Membership while session handling remains Design 075/Auth responsibility.

Do not conflate the records.

---

## Expired ≠ revoked

Permanent.

---

## Revoked ≠ invalid-format token

Backend can distinguish them internally.

User-facing messaging can remain appropriately safe.

---

## Consumed ≠ expired

A consumed token is no longer reusable because acceptance already occurred.

---

## Already accepted ≠ failure

If the original acceptance completed and the user retries because of a timeout, idempotent handling should recognize the result.

---

## Acceptance timeout ≠ safe to create again

Critical:

```text
Accept clicked
↓
Membership transaction commits
↓
browser connection times out
```

Retry must reconcile existing acceptance rather than duplicate the Membership.

---

## Existing User ≠ existing Membership

Permanent.

---

## Existing Membership ≠ duplicate Membership creation

Permanent.

---

## Existing Membership with different scope ≠ blind overwrite

Must follow explicit grant reconciliation policy.

---

## Role unavailable ≠ default to broader role

Critical.

If intended Portal role no longer exists:

do not fall back to:

> Client Admin.

Fail safely or use governed policy.

---

## Resource unavailable ≠ grant Organization-wide access

Critical.

If invited Project no longer exists or is no longer grantable:

never broaden the scope automatically.

---

## Notification failure ≠ activation failure

If welcome email fails after Membership acceptance:

membership remains accepted.

Notification retries separately.

---

## Audit failure handling

Material authorization events need reliable audit/outbox semantics.

Do not report success while irrecoverably losing the authorization-change record where system policy requires audit durability.

---

## State Coverage

Design 076 inherits Design 150 plus:

```text
Activation Loading
Invitation Valid
Invitation Invalid
Invitation Expired
Invitation Revoked
Invitation Superseded
Invitation Already Accepted

Authentication Required
Existing Account Recognized
Authenticated Recipient Confirmed
Recipient Mismatch
New Account Establishment Required

Ready to Accept
Activation Processing
Activation Successful
Activation Failed
Activation Outcome Reconciliation Required

Membership Creating
Membership Active
Existing Membership Detected
Membership Conflict
Role/Scope No Longer Grantable

Token Consumed
Token Rotated / Invalidated

Service Temporarily Unavailable
Partial Post-Acceptance Notification Failure
```

---

# 6. Responsive Behavior

## Desktop

Desktop should preserve grant clarity before acceptance.

Conceptually:

```text
Portal Invitation
↓
Safe Organization context
↓
Invited access summary
├── organization
├── Portal role
└── Project/resource scope where frozen
↓
Identity/account state
↓
Accept Invitation
```

Only information present in the frozen design should render.

---

## Client should understand what is being accepted

Where the frozen design exposes it, clearly communicate:

* Organization,
* Portal access role,
* limited Project/resource scope.

Avoid an ambiguous:

> Continue

when the user is actually accepting an authorization grant.

---

## Do not expose internal permission internals

A Client invite may display:

> Administrator

or:

> Project Member

but should not dump:

* internal permission keys,
* platform admin roles,
* database scope IDs.

---

## Tablet

Following Design 152:

* invitation summary remains legible,
* role/scope information stacks cleanly,
* acceptance CTA remains obvious,
* error/expiry states do not require horizontal layouts.

---

## Mobile

Priority:

```text
You're invited
↓
Organization
↓
Your Portal access
↓
Identity/account state
↓
Accept Invitation
```

The user should know:

1. which organization is inviting them;
2. what broad access they are accepting;
3. which account will receive the membership.

---

## Mobile token handling

The raw token should not be displayed to the user.

No copyable secret field is needed merely because the route contains it.

---

## Expired/revoked state

Use clear accessible language without revealing unnecessary internal security details.

---

## Recipient mismatch

If the wrong account is authenticated, the UI should not silently transfer the Invitation.

It should require the correct identity/auth flow according to the frozen experience.

---

## Accessibility

The acceptance control should communicate its effect, e.g. equivalent to:

> Accept invitation to The Perspective Client Portal for Acme Corporation as Project Member.

where those frozen details are intentionally visible.

---

# 7. Backend Requirements

## Read/validation architecture

```text
Design 076
    ↓
Activation Token Resolver
    ↓
Invitation Validation Service
    │
    ├── token integrity/hash
    ├── Invitation status
    ├── expiry
    ├── revocation/supersession
    ├── Organization
    ├── intended recipient
    ├── PortalRole
    └── ResourceScope
    ↓
safe ActivationView
```

---

## Acceptance architecture

```text
acceptClientPortalInvitation(token, currentIdentityContext)
        ↓
resolve token → Invitation
        ↓
lock/re-read Invitation
        ↓
validate Pending + unexpired + unrevoked
        ↓
verify intended recipient identity
        ↓
resolve existing User or establish new canonical User
        ↓
resolve/create AuthenticationIdentity as governed
        ↓
check existing Membership
        ↓
validate assignable PortalRole
        ↓
validate ResourceScope
        ↓
create/activate Membership
        ↓
apply RoleAssignment
        ↓
apply ResourceGrant(s)
        ↓
mark Invitation ACCEPTED
        ↓
consume ActivationToken
        ↓
Audit/outbox events
        ↓
commit atomically
```

---

## Transactional acceptance

The critical authorization changes should commit as one logical transaction.

Avoid:

```text
create Membership ✓
assign Role ✕
mark Invitation accepted ✕
```

leaving ambiguous partially activated access.

---

## Membership + role + scope atomicity

At minimum, the resulting access state must never temporarily become:

> Active Membership with missing intended restrictions and therefore default broad access.

Default-deny is mandatory.

---

## Database constraints

Useful constraints include:

```text
unique active membership (organizationId, userId)
```

under the chosen membership model, plus uniqueness/consumption protection for Invitation acceptance.

Exact implementation Phase 3D.

---

## Row locking / compare-and-set

Concurrent acceptance requests should not both create authority.

Use:

* transaction row lock,
* conditional update,
* unique constraints,
* or equivalent atomic mechanisms.

---

## Acceptance idempotency

The same valid acceptance intent should be safely replayable.

The server should recognize:

```text
Invitation already accepted
→ same User
→ expected Membership exists
```

and return a reconciled successful state where policy allows.

---

## Do not make token globally reusable after acceptance

Idempotency means:

> same legitimate acceptance can reconcile safely.

It does **not** mean:

> consumed token becomes a permanent login/access credential.

---

## Token hashing

For random opaque tokens:

```text
rawToken
    ↓
secure hash
    ↓
stored tokenHash
```

Validation hashes presented token and compares safely.

---

## Token entropy

Activation tokens require cryptographically secure randomness and enough entropy to resist guessing.

---

## Token rotation on resend

If invitation is resent with a new token:

prefer invalidating/superseding prior active token generations according to policy.

Old links must not remain indefinitely valid.

---

## Revocation

`revokeClientPortalInvitation()` from Design 062 should invalidate all active acceptance tokens for that Invitation.

---

## Expiry

Server time is authoritative.

Do not trust browser time for expiry decisions.

---

## Recipient-binding resolver

Conceptually:

```text
canIdentityAcceptInvitation(
    authenticatedUser,
    authenticationIdentities,
    invitationRecipientBinding
)
```

must decide whether this User can consume the grant.

---

## Existing User lookup

Do not create a duplicate User solely because invitation address capitalization/normalization differs.

Use governed identity resolution.

---

## Avoid unsafe account merging

Conversely, do not merge Users merely because two Contact/Profile emails resemble each other.

AuthenticationIdentity ownership must be proven.

---

## New User establishment

Where required:

User/AuthIdentity creation must use the same canonical identity system as Design 075.

No activation-only user table.

---

## Role validation

Before applying the invited role:

```text
AssignablePortalRoleResolver
```

should ensure:

* role is Client-assignable,
* role belongs to correct policy/domain,
* role is still valid,
* accepting it cannot become internal/platform admin.

---

## ResourceScope validation

Every resource grant must verify:

```text
resource belongs to invited Organization
+
resource type is grantable
+
grant is compatible with Portal role
+
invitation authorized that exact scope
```

---

## Default deny

If resource-scope parsing/validation fails:

do not fall back to unrestricted Organization access.

Fail safely.

---

## Historical-access timing

Record:

```text
invitedAt
acceptedAt
membershipActivatedAt
roleAssignedAt
```

where needed.

This prevents retrospective access ambiguity.

---

## Session interaction

If acceptance occurs inside an authenticated session:

after successful Membership activation:

* refresh membership/context authorization,
* update authorization revision,
* avoid trusting stale pre-activation session claims.

---

## New session creation remains authentication-governed

Membership acceptance should not mint an authentication session for an unidentified user merely because token is valid.

---

## Authorization cache invalidation

After acceptance:

invalidate/rebuild relevant:

* membership caches,
* organization member lists,
* Portal access projections.

---

## Design 062 synchronization

The Team Access screen should immediately reconcile:

```text
Pending Invitation
      ↓
Accepted
      ↓
Active Membership
```

without showing both a pending invite and a duplicate active member indefinitely.

---

## Audit events

Material events should include:

```text
InvitationValidated
InvitationAccepted
MembershipCreated / Activated
PortalRoleAssigned
ResourceScopeGranted
InvitationRevoked
InvitationExpired
InvitationSuperseded
```

as appropriate.

Do not record raw ActivationToken.

---

## Notification/outbox events

After commit, async side effects may include:

* welcome/access notification,
* inviter confirmation,
* Client Activity projection.

These should use transactional outbox/event patterns where appropriate.

---

## Side-effect failure ≠ authorization rollback by default

If membership acceptance committed successfully but welcome email fails:

do not create a second Membership on retry.

Retry the notification separately.

---

## Abuse/risk controls

Activation endpoint should support:

* rate limiting,
* token brute-force protection,
* replay detection,
* anomaly logging.

---

## No raw token in observability

Ensure:

* tracing,
* request logging,
* analytics,
* error reporting

redact the route token.

---

## Safe redirect after acceptance

Any post-activation destination must be allowlisted/internal.

Do not allow token-linked open redirects.

---

## Backend Requirement Matrix

| Requirement                                       | Status       |
| ------------------------------------------------- | ------------ |
| Canonical Invitation reuse                        | **Critical** |
| Invitation/User separation                        | **Critical** |
| Invitation/Membership separation                  | **Critical** |
| Invitation can predate User                       | **Critical** |
| ActivationToken entity/semantics                  | **Critical** |
| Token/Invitation separation                       | **Critical** |
| Raw token non-persistence where avoidable         | **Critical** |
| Cryptographically secure token entropy            | **Critical** |
| Token hashing/signature integrity                 | **Critical** |
| Token expiry                                      | **Critical** |
| Token revocation                                  | **Critical** |
| Token single-use consumption                      | **Critical** |
| Token rotation/supersession on resend             | **Critical** |
| Token/Organization binding                        | **Critical** |
| Token/role binding                                | **Critical** |
| Token/ResourceScope binding                       | **Critical** |
| Recipient identity verification                   | **Critical** |
| Existing User reuse                               | **Critical** |
| Duplicate User prevention                         | **Critical** |
| Unsafe account-merge prevention                   | **Critical** |
| AuthenticationIdentity reuse                      | **Critical** |
| Authentication/acceptance separation              | **Critical** |
| No implicit sign-in acceptance                    | **Critical** |
| Membership uniqueness                             | **Critical** |
| Existing Membership reconciliation                | **Critical** |
| PortalRoleAssignment separation                   | **Critical** |
| Client role/platform-admin separation             | **Critical** |
| ResourceScope/Organization-wide access separation | **Critical** |
| Server-side assignable-role validation            | **Critical** |
| Server-side ResourceScope validation              | **Critical** |
| No request-payload privilege escalation           | **Critical** |
| Transactional acceptance                          | **Critical** |
| Membership/role/scope atomicity                   | **Critical** |
| Default-deny on partial failure                   | **Critical** |
| Concurrent-acceptance safety                      | **Critical** |
| Acceptance idempotency                            | **Critical** |
| Replay protection                                 | **Critical** |
| Server-authoritative expiry time                  | **Critical** |
| Session/auth revision refresh after activation    | **Critical** |
| Authorization cache invalidation                  | **Critical** |
| Historical activation timestamps                  | **Critical** |
| Historical evidence non-rewrite                   | **Critical** |
| Audit without token leakage                       | **Critical** |
| Notification/outbox separation                    | **Required** |
| Rate limiting/brute-force protection              | **Critical** |
| Raw-token log/analytics redaction                 | **Critical** |
| Safe post-activation redirect                     | **Critical** |
| Design 062 synchronization                        | **Critical** |
| Design 075 authentication reuse                   | **Critical** |
| Design 077 recovery separation                    | **Critical** |

---

# 8. Consolidation

Design 076 exposes several serious access-control risks.

**Invitation / Membership conflation**
Pending invitation grants active Portal access before acceptance.

**Invitation / User conflation**
Every invite creates a fake/duplicate account.

**Invitation destination / AuthIdentity conflation**
Temporary invitation email becomes permanent identity.

**ActivationToken / Invitation conflation**
Durable grant metadata is encoded only in a token with no canonical Invitation record.

**ActivationToken / AuthenticationSession conflation**
Invitation link becomes a general login token.

**Token possession / unrestricted access conflation**
Forwarded link grants Portal authority to wrong person.

**Authentication / Invitation acceptance conflation**
Signing in silently accepts role/scope.

**Invitation acceptance / authentication conflation**
Valid token creates a session for an unidentified user.

**Invitation / Organization conflation**
Browser-supplied Organization ID changes target tenant.

**Invitation role / request role conflation**
Invitee submits `ADMIN` and escalates privilege.

**Invitation scope / request scope conflation**
Invitee changes allowed Projects to `ALL`.

**Portal role / platform-admin conflation**
Client administrator becomes internal administrator.

**Role / Permission conflation**
Unvalidated permission arrays are accepted from browser.

**Organization membership / all-resource access conflation**
Activated user gains every Project automatically.

**Missing resource / broad fallback conflation**
Deleted Project causes fallback to Organization-wide scope.

**Existing User / new User conflation**
Activation duplicates a pre-existing account.

**Same email / same User conflation**
Unsafe automatic account merge occurs.

**Existing Membership / duplicate Membership conflation**
Same User appears twice in same Client Organization.

**Existing Membership / blind role overwrite conflation**
New invite silently escalates existing user.

**Resend / new grant conflation**
Every resend creates another active Invitation/Membership.

**Expired / revoked conflation**
Security/event history becomes ambiguous.

**Superseded / accepted conflation**
Old invitation token can still grant access after replacement.

**Consumed token / permanent credential conflation**
Used invite link remains reusable indefinitely.

**Idempotency / token reuse conflation**
Replay-safe acceptance is mistaken for permanent bearer authority.

**Client-side expiry / server expiry conflation**
User changes device clock to accept expired invite.

**Concurrent acceptance race**
Two requests create duplicate Membership/role grants.

**Acceptance / partial transaction conflation**
Membership activates without intended restrictions.

**Role assignment failure / broad default conflation**
User becomes overly privileged because intended role was not applied.

**Scope assignment failure / Organization-wide fallback**
Restricted invite becomes unrestricted.

**Inviter historical authority / current grant validity conflation**
Stale/deprecated roles are granted without policy checks.

**Membership acceptance / signer authority conflation**
Activated Client user becomes ContractSigner retroactively.

**Membership acceptance / ApprovalParticipant conflation**
User gains formal approval rights on historical requests.

**Membership acceptance / ConversationParticipant conflation**
New Portal member reads old private threads automatically.

**Membership acceptance / historical access rewrite**
System reports user as authorized before `acceptedAt`.

**Membership deactivation/reactivation / historical actor rewrite**
Past evidence changes with current access state.

**Raw token database storage**
Database compromise exposes usable invite links.

**Raw token logging**
Logs/analytics become credential stores.

**Token in referrer leakage**
Third-party assets receive activation secret.

**Predictable tokens**
Attackers guess invitations.

**No rate limiting**
Activation tokens can be brute-forced.

**Open redirect after acceptance**
Activation flow sends user to malicious site.

**Notification failure / activation retry conflation**
Failed welcome email creates duplicate Membership on retry.

**076/062 duplicate Invitation backend**
Activation creates its own pending-access model.

**076/075 duplicate authentication system**
Invitation flow creates separate user/password/session logic.

**076/077 duplicate recovery logic**
Activation token is repurposed as recovery credential.

No additional screen is required.

These are **Invitation identity, token security, recipient verification, transactional Membership creation, role/scope integrity, idempotency, tenant isolation, session refresh, and historical-access requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT PORTAL INVITATION ACCEPTANCE, MEMBERSHIP ACTIVATION & SECURE ACCESS-GRANT ANCHOR**

**Domain directive:**
**Invitation ≠ ActivationToken ≠ User ≠ AuthenticationIdentity ≠ ClientPortalMembership ≠ PortalRoleAssignment ≠ ResourceScope ≠ AuthenticationSession ≠ Organization.**

**Reuse directive:**
Design 062 remains the single canonical Invitation/Membership governance engine, while Design 075 remains the canonical authentication/session engine. Design 076 only bridges a valid pending Invitation into an authorized Membership.

**Invitation directive:**
Invitation is a durable pending access grant that can exist before a User account and preserves Organization, recipient, intended Portal role, ResourceScope, inviter, issuance, expiry and status.

**Token directive:**
ActivationToken is temporary single-purpose proof for one Invitation. It is high-entropy, expiry-aware, revocable, single-use/replay-safe, invitation-bound and never a general Portal session credential.

**Token-storage directive:**
raw activation secrets should not be stored or logged in plaintext where avoidable; token hashes/signed opaque claims and log/analytics redaction protect the acceptance credential.

**Identity directive:**
Invitation destination email is recipient-binding data, not permanent User identity. Existing canonical Users/AuthIdentities are reused rather than duplicated, and account merging never occurs merely from loosely matching Profile/Contact emails.

**Authentication directive:**
authentication proves identity; Invitation acceptance grants a pending Membership. Neither substitutes for the other.

**Sign-in directive:**
Design 075 must never implicitly consume an Invitation merely because the authenticated email matches its destination.

**Recipient directive:**
the authenticated/verified recipient must satisfy the Invitation's intended-recipient binding. Forwarding a token to another logged-in user must not transfer the grant.

**Organization directive:**
the Organization comes exclusively from the canonical Invitation/token binding. Browser-supplied organization identifiers cannot redirect the grant into another tenant.

**Role directive:**
the exact proposed Client Portal role is resolved from the Invitation and revalidated as Client-assignable. The invitee cannot alter it, and Client Portal Administrator never becomes unrestricted platform administrator.

**Scope directive:**
Project/resource access is applied only from the Invitation's authorized ResourceScope. Missing/invalid scope must fail closed rather than broaden to Organization-wide access.

**Privilege directive:**
acceptance cannot grant more authority than the invitation legitimately carries, and stale/deprecated roles or invalid resources are handled by governed policy rather than unsafe fallback.

**Membership directive:**
acceptance creates or activates exactly one canonical ClientPortalMembership for the verified User/Organization relationship. Existing Memberships are reconciled rather than duplicated.

**Atomicity directive:**
Membership creation/activation, PortalRoleAssignment, ResourceScope grants, Invitation acceptance, token consumption, and required authorization Audit/outbox state commit transactionally or fail closed.

**Concurrency directive:**
simultaneous clicks/retries are protected by transactional locks/constraints/idempotency so one Invitation cannot produce duplicate Memberships, role grants or Project scopes.

**Idempotency directive:**
if the original acceptance succeeded but the response was lost, replay resolves to the same accepted Membership where safe. Idempotency never makes the token a permanent credential.

**Expiry/revocation directive:**
Pending, Accepted, Expired, Revoked and Superseded Invitation states remain distinct. Resending/rotation invalidates prior token generations according to policy.

**Session directive:**
accepting a Membership does not itself identify an unauthenticated person. If an authenticated session already exists, its membership/authorization revision is refreshed after activation so stale pre-activation claims cannot be used.

**Authorization directive:**
activation establishes only the Membership/role/resource grants encoded by the Invitation. Contract signing, Approval participation, Message participation, Finance authority, and other subject-specific permissions remain canonical in their own domains.

**Historical-evidence directive:**
acceptance establishes access from the recorded activation time forward; it never retroactively rewrites prior Messages, Contract Signers, Approval Participants, Audit actors, or other historical evidence.

**Audit directive:**
Invitation acceptance, Membership creation, role assignment and resource grants create durable security/audit evidence without including raw activation tokens.

**Notification directive:**
welcome/inviter notifications occur after canonical acceptance through the shared Notification/outbox infrastructure. Notification failure does not recreate or roll back an already committed Membership.

**Failure directive:**
invalid token, expired token, revoked Invitation, recipient mismatch, authentication requirement, role/scope conflict, existing Membership, transaction failure and post-acceptance notification failure remain distinct backend states rather than one vague activation failure.

**Responsive directive:**
desktop/tablet/mobile clearly communicate the safe Organization/access grant being accepted, recipient/account state and activation result without displaying the raw token or internal permission implementation.

**Recovery directive:**
Design 077 remains the only recovery path. ActivationToken must never be reused as a password-reset, account-recovery, or persistent authentication credential.

**Overlap directive:**
Designs **037, 039, 059–064 and 075–077** must ultimately consume one stable User + AuthenticationIdentity + Invitation + Membership + PortalRole + ResourceScope + Session + Authorization foundation while keeping grant intent, identity proof and current authorization separate.

**Consolidation directive:**
**STANDARDIZE ONE INVITATION-TO-MEMBERSHIP ACTIVATION PIPELINE — CANONICAL INVITATION + SECURE SINGLE-USE ACTIVATIONTOKEN + VERIFIED RECIPIENT IDENTITY + EXISTING-USER REUSE/SAFE NEW-USER ESTABLISHMENT + UNIQUE CLIENTPORTALMEMBERSHIP + SERVER-VALIDATED PORTALROLEASSIGNMENT + EXACT RESOURCE SCOPE + ATOMIC ACCEPTANCE/TOKEN CONSUMPTION + AUDIT/OUTBOX + AUTHORIZATION-REVISION REFRESH — AND NEVER ALLOW TOKEN POSSESSION, SIGN-IN SUCCESS, EMAIL MATCHING, BROWSER-SUPPLIED ROLE/SCOPE, OR PARTIAL TRANSACTION FAILURE TO CREATE OR ESCALATE PORTAL AUTHORITY.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **76 / 153** |
| **PASS**                                   |                         **76** |
| **STANDARDIZE decisions**                  |                         **74** |
| **Potential implementation-overlap flags** |                         **67** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**76 / 153 = 49.7% audited.**

### Canonical invitation-to-access architecture after Design 076

```text
                 INVITATION
                     │
          ┌──────────┼───────────┐
          ↓          ↓           ↓
    Organization   Role      ResourceScope
          │
          ↓
      ActivationToken
      temporary secret
          │
          ↓
   Recipient Verification
          │
          ↓
          User
          │
          ↓
 AuthenticationIdentity
          │
          ↓
 ClientPortalMembership
          │
      ┌───┴───────────┐
      ↓               ↓
PortalRole        ResourceGrant
      │               │
      └───────┬───────┘
              ↓
       Authorization
```

The critical boundary remains:

```text
Invitation
   = pending grant

ActivationToken
   = temporary proof for that grant

Authentication
   = proof of identity

Membership
   = active relationship

Role / ResourceScope
   = granted authority

Session
   = authenticated continuity

None are interchangeable.
```

And the acceptance transaction remains:

```text
Validate Token
      ↓
Validate Invitation
      ↓
Verify Recipient
      ↓
Resolve/Re-use User
      ↓
Create/Resolve Membership
      ↓
Apply Exact Role
      ↓
Apply Exact Resource Scope
      ↓
Mark Invitation Accepted
      ↓
Consume Token
      ↓
Audit / Outbox
      ↓
COMMIT
```

No partial privilege establishment is acceptable.

# Next Sequential Audit Target

## **Design 077 — Client Access Recovery**

Its frozen identity and supplied route annotation **`/client/recover-access`** are already locked.

The final audit in this Client Portal sequence must preserve the recovery boundary:

> **User ≠ AuthenticationIdentity ≠ Credential ≠ RecoveryRequest ≠ RecoveryToken/Challenge ≠ CredentialReset ≠ AuthenticationSession ≠ ClientPortalMembership ≠ Invitation.**

It will need to reconcile **Design 075 authentication** and **Design 076 invitation activation** while preserving:

* recovery proves control of an existing authentication identity; it does not create Portal membership,
* recovery identifier ≠ proof that an account exists,
* recovery responses must resist account enumeration,
* RecoveryToken ≠ ActivationToken ≠ AuthenticationSession,
* recovery token must be high-entropy, single-use, expiry-aware and revocable,
* successful credential reset should revoke/rotate affected sessions according to policy,
* Membership/role/Project scope remains untouched by credential recovery,
* deactivated Portal membership must not be reactivated by password/access recovery,
* recovery must never rewrite historical User, Message, Contract, Approval or Audit evidence.

After Design 077, this locked Client Portal sequence is complete, and the next sequential Phase 3A.1 target becomes **Design 078 — My Work / Personal Work Queue**, without changing the audit contract.
