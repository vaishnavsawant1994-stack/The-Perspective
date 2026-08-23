# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 075 — Client Sign In

Its frozen identity and supplied route annotation **`/client/login`** are locked. Exact route connections remain a **Phase 3B** concern and are not being redesigned here.

Design 075 should become the **canonical Client Portal authentication-entry surface** for validating a user's authentication identity and establishing an authenticated session that can then be evaluated against Client Portal membership and authorization.

Its governing boundary is:

> **User ≠ AuthenticationIdentity ≠ Credential ≠ AuthenticationSession ≠ ClientPortalMembership ≠ Organization ≠ Invitation ≠ Authorization ≠ Recovery State.**

The central implementation rule is:

> **Design 075 proves who the user is. It does not itself prove which Client organization, Projects, Contracts, Messages, billing records, or other resources that authenticated user may access. Authentication must complete first; Client Portal membership and authorization are evaluated separately and server-side.**

---

# 1. Classification

| Audit field                            | Classification                                                                                                                            |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                          | **075**                                                                                                                                   |
| **Canonical name**                     | **Client Sign In**                                                                                                                        |
| **Product area**                       | Client Portal / Authentication / Access Entry                                                                                             |
| **User surface**                       | **Public/Unauthenticated Client Portal Entry**                                                                                            |
| **Screen class**                       | Authentication Entry / Session Establishment                                                                                              |
| **Classification**                     | **Client Authentication Anchor — Portal Sign-In & Session Bootstrap Family**                                                              |
| **Primary purpose**                    | Authenticate a Client user and establish a secure session without conflating authentication with organization membership or authorization |
| **Stable person/account entity**       | **User**                                                                                                                                  |
| **Authentication binding entity**      | **AuthenticationIdentity**                                                                                                                |
| **Secret/authenticator entity**        | **Credential**                                                                                                                            |
| **Session entity**                     | **AuthenticationSession**                                                                                                                 |
| **Portal authorization relationship**  | **ClientPortalMembership** — Design 062                                                                                                   |
| **Organization dependency**            | Designs 021 / 060                                                                                                                         |
| **Personal profile dependency**        | Design 059                                                                                                                                |
| **Invitation dependency**              | Design 076                                                                                                                                |
| **Recovery dependency**                | Design 077                                                                                                                                |
| **Portal shell after authentication**  | Design 002                                                                                                                                |
| **Post-auth authorization dependency** | Designs 037 / 062                                                                                                                         |
| **Audit dependency**                   | Design 039                                                                                                                                |
| **Notification/security dependency**   | Designs 061 / 064 where appropriate                                                                                                       |
| **Primary service**                    | `ClientAuthenticationService`                                                                                                             |
| **Session bootstrap service**          | `ClientPortalSessionBootstrapService`                                                                                                     |
| **Auth**                               | Not required to view; this screen establishes authentication                                                                              |
| **Authorization**                      | Not inferred from credential validation                                                                                                   |
| **Implementation priority**            | **Critical Security / Identity / Portal Entry**                                                                                           |
| **Reuse level**                        | **High with platform identity/Auth foundation but Client-specific membership resolution**                                                 |

Design 075 should answer only:

> **“Can this presented authentication factor be validated as belonging to a canonical User/AuthIdentity, and can a secure authenticated session be established?”**

Then a separate question follows:

> **“Does that authenticated User currently have an active Client Portal membership/context they are allowed to enter?”**

Canonical boundary:

```text
Presented identifier / credential
          ↓
AuthenticationIdentity lookup
          ↓
Credential / authenticator verification
          ↓
Canonical User
          ↓
AuthenticationSession
          ↓
ClientPortalMembership resolution
          ↓
Organization / portal context
          ↓
Authorization
```

These steps must remain distinct.

---

# 2. Reuse

## Reuse Design 059 identity separation

Design 059 established:

> **User Identity ≠ PersonalProfile ≠ UserPreferences ≠ Authentication Credentials.**

Design 075 must preserve that.

A mutable Profile email such as:

> [sarah@newcompany.com](mailto:sarah@newcompany.com)

must not silently become a new login identity unless a governed authentication-identity change process explicitly creates/updates that identity.

---

## Login identifier ≠ CRM Contact email

A CRM Contact may have:

```text
contact.email
```

while AuthenticationIdentity has:

```text
login identifier
```

They may contain the same string.

They remain different concepts.

Do not authenticate against arbitrary CRM Contact data.

---

## Login identifier ≠ notification destination automatically

Design 061 may deliver notifications to a governed destination.

That destination is not automatically a valid authentication identity.

---

## Reuse Design 062 for Portal membership

Successful credential verification leads to:

```text
User U-101
```

Then Design 062's membership foundation determines whether that User has:

```text
ClientPortalMembership M-201
```

for an allowed Client context.

Design 075 must not manufacture membership.

---

## Design 075 ≠ Design 076

### Design 075

Authenticates an already established identity/account.

### Design 076

Consumes a valid Invitation/activation token and establishes/accepts the intended Portal access flow.

Permanent:

> **Signing in with an email that has a pending Invitation must not silently accept the Invitation.**

The Invitation must remain pending until the explicit activation/accept-invite workflow runs.

---

## Design 075 ≠ Design 077

### Design 077

Handles access recovery.

Design 075 may link to recovery where frozen, but it does not:

* reset passwords,
* replace credentials,
* unlock access through ad hoc mutations,
* bypass account-recovery verification.

---

## Reuse Design 037 authorization separately

Authentication says:

> User is authenticated.

Authorization says:

> User may perform action X against resource Y.

Design 075 must not load role/permission logic into password validation.

---

## Reuse Design 002 after secure session bootstrap

`ClientPortalShell` should activate only after:

1. authentication succeeds;
2. session is created;
3. membership/context resolution succeeds according to policy.

Do not render authenticated Client navigation based solely on an email/password success response.

---

## Reuse Design 039 Audit separately

Authentication events may create security/audit records.

But Audit records are not sessions and do not decide authorization.

---

# 3. Entities

## User ≠ AuthenticationIdentity

`User` is the stable person/account identity.

A single User could potentially have multiple AuthenticationIdentities:

```text
User U-101
├── email/password identity
├── Google identity
└── Microsoft identity
```

if the platform supports them.

The audit does not add providers; the architecture should not force one User = one email forever.

---

## AuthenticationIdentity

Conceptually:

```text
AuthenticationIdentity
├── id
├── userId
├── provider / identity type
├── normalized identifier
├── verification state
├── createdAt
└── lifecycle state
```

Exact schema belongs to Phase 3D.

---

## AuthenticationIdentity ≠ Credential

Identity says:

> which login identity belongs to the User.

Credential says:

> what secret/authenticator proves control of it.

For password authentication:

```text
AuthenticationIdentity
      ↓
PasswordCredential
```

For external authentication, the credential relationship may differ.

---

## Credential must never be stored in plaintext

For passwords:

* strong adaptive password hashing,
* per-password salt,
* secure parameter configuration,
* credential rotation semantics.

Do not store reversible plaintext passwords.

---

## User email ≠ Credential

The email/identifier is discoverable identity information.

The password/authenticator is secret.

Never place both in an undifferentiated `user.loginData` object that is broadly returned through APIs.

---

## AuthenticationIdentity ≠ PersonalProfile email

Example:

```text
AuthenticationIdentity.loginEmail
= sarah@example.com

PersonalProfile.communicationEmail
= sarah.office@example.com
```

This can be valid.

Profile edits must not silently alter sign-in identifiers.

---

## AuthenticationIdentity ≠ Contract signer email snapshot

Design 070 remains historical legal evidence.

Changing authentication identity never rewrites historical Signer data.

---

## AuthenticationIdentity ≠ Message sender identity

Design 074's historical sender attribution remains tied to stable User/message evidence.

Authentication-identifier changes do not rewrite old Messages.

---

## AuthenticationIdentity ≠ Client Contact

A CRM Contact can exist without login access.

A login User can exist without being the canonical CRM Contact record.

Explicit linkage is allowed; silent equivalence is not.

---

## AuthenticationSession

A successful credential validation should create an authenticated session.

Conceptually:

```text
AuthenticationSession
├── id
├── userId
├── authentication strength
├── issuedAt
├── expiresAt
├── lastSeenAt where required
├── session revision/version
└── revocation state
```

Exact representation could be server session, signed token plus server checks, or another secure architecture.

---

## AuthenticationSession ≠ ClientPortalMembership

A User may authenticate successfully and have:

* one active Portal membership,
* several memberships,
* only internal workspace membership,
* no active Client Portal membership,
* deactivated Client Portal membership,
* pending Invitation only.

Therefore:

```text
authenticated = true
≠
portalAuthorized = true
```

---

## Membership ≠ session

Deactivating a membership should not require deleting the global User or all identities.

It should invalidate/deny access to the affected Client Portal context.

---

## One User may have multiple ClientPortalMemberships

Architecture must tolerate:

```text
User U1
├── Membership Org A
├── Membership Org B
└── Membership Org C
```

Sign-in authenticates U1 once.

Portal context resolution determines which active membership/context applies.

---

## Membership selection ≠ authentication

If multiple contexts exist, membership/context resolution may occur after login.

That is still authorization/context selection, not credential verification.

No new selection screen is introduced here.

---

## Organization ≠ membership

A User knowing an Organization ID or email domain does not establish membership.

---

## Email domain ≠ Organization authorization

Critical:

> Logging in with `@acme.com` must never grant access to Acme's Portal merely because the domain matches.

Explicit membership is required.

---

## Invitation ≠ membership

A valid pending Invitation says:

> this user/email may be eligible to accept specified access.

It does not say:

> active membership already exists.

---

## Invitation ≠ AuthenticationIdentity

Invitation destination email can match an auth identity, but the Invitation remains a separate grant-intent entity.

---

## Login must not accept Invitation implicitly

Example:

```text
Invitation INV-101
→ jane@acme.com
→ PortalRole CLIENT_ADMIN
```

Jane signs in with an existing User account.

Correct state:

```text
Authenticated User
+
Invitation still pending
```

until Design 076 explicitly validates and accepts it.

---

## Authorization ≠ membership status alone

Even active membership does not mean unrestricted Portal access.

Authorization still evaluates:

* role assignments,
* permission set,
* Project/resource scope,
* subject-specific participation,
* source-domain policies.

---

## Credential validation ≠ authorization

Permanent:

```text
password correct
≠
canReadInvoice
≠
canSignContract
≠
canReadConversation
```

---

## Deactivated membership ≠ deleted User

If membership M1 is deactivated:

```text
User remains
AuthIdentity remains
other memberships may remain
historical evidence remains
```

---

## Deactivated membership ≠ invalid global credential automatically

The same User may still need access to another Organization/service.

Portal policy determines whether a globally disabled User vs one disabled membership is blocked.

Keep the levels distinct.

---

## Disabled User ≠ deactivated membership

A platform-wide User/account suspension can block all authentication/session use.

A ClientPortalMembership deactivation blocks only that Portal relationship/context.

---

## RecoveryState ≠ AuthenticationSession

Recovery process is temporary proof/credential-recovery workflow.

It must not become a durable logged-in session merely because a recovery token exists.

---

## Recovery token ≠ session token

Never interchange them.

---

## Login attempt ≠ AuthenticationSession

An attempted login can fail without session creation.

---

## Authentication event ≠ session

Security/Audit can record successful or failed attempts, but those records do not grant access.

---

## Remembered device ≠ authorization

If the product later supports persistent sessions/trusted devices, those concepts can reduce reauthentication burden but cannot bypass current membership/authorization checks.

No additional feature is introduced here.

---

# 4. Permissions

Authentication and authorization must be deliberately sequenced.

Canonical server flow:

```text
credential verification
      ↓
User resolved
      ↓
session established
      ↓
Client Portal membership resolution
      ↓
membership active?
      ↓
authorization/context evaluation
```

---

## Sign-in endpoint must not trust Organization ID from browser

Dangerous:

```text
POST /login
{
  email,
  password,
  organizationId
}
```

followed by blindly attaching that organization.

If organization/context is supplied for a legitimate flow, server verifies it against actual memberships.

---

## Authentication success ≠ resource permission

After session creation, every resource continues to enforce:

```text
can(actor, action, resource)
```

or equivalent.

---

## Sign-in cannot assign role

Never permit:

```text
POST /login
{
  role: "ADMIN"
}
```

or role inference from form fields/domain names.

---

## Portal membership must be active

Authentication can succeed while Portal access fails because membership is:

* deactivated,
* suspended,
* restricted,
* revoked.

The response must preserve this distinction securely.

---

## Avoid account enumeration

Authentication failure messages should not reveal whether:

* email exists,
* User exists,
* account has Invitation,
* account belongs to a high-value Client,
* membership exists.

Prefer a generic user-facing failure such as:

> Unable to sign in with those credentials.

while internal logs preserve the actual reason.

---

## Timing behavior should avoid obvious enumeration where practical

Do not perform drastically different response paths such as:

```text
unknown email → immediate response
known email → expensive password hash
```

that make account existence easy to infer.

---

## Recovery lookup should also avoid enumeration

Design 077 inherits this security requirement.

---

## Rate limiting

Sign-in should be rate-limited using an appropriate combination of:

* account/identity,
* IP/network signals,
* device/session signals,
* risk policy.

Avoid simplistic global lockouts that enable easy denial-of-service attacks.

---

## Brute-force resistance

Repeated failures should trigger governed protective controls.

Do not expose exact thresholds to the user.

---

## Account locking ≠ membership deactivation

Authentication-level defensive lock/security hold is separate from Design 062 Portal membership state.

---

## MFA/step-up if supported

If the platform requires stronger authentication for:

* signing,
* finance,
* sensitive actions,

those flows should use authentication-strength/session policy.

Do not model them as Portal roles.

No new MFA screen is introduced here.

---

## Session fixation protection

Successful authentication should rotate/create a fresh session identifier.

Do not reuse an unauthenticated session identifier through login without secure rotation.

---

## CSRF protection

If cookie-based sessions are used, sign-in/session-changing operations need appropriate CSRF defenses where applicable.

---

## Secure cookies/session transport

Where cookie sessions are used:

* `HttpOnly`,
* `Secure`,
* appropriate `SameSite`,
* scoped path/domain,
* no secrets in browser-readable storage unnecessarily.

---

## Session revocation

Relevant events should invalidate/deny active Portal sessions promptly enough:

* membership deactivation,
* global User suspension,
* credential reset/change,
* suspicious session revocation,
* major role/scope changes where claims could become stale.

---

## Stale JWT role problem

Do not permanently trust roles/Project grants embedded in long-lived stateless tokens.

Use one of:

* server-side authorization lookup,
* membership/version claims,
* short-lived claims,
* revocation/version checks.

The invariant:

> **Current permission state must be authoritative enough to reflect Design 062 changes.**

---

## Session user ID must be stable

Do not identify session principal only by mutable email.

Use stable User ID.

---

## Multiple memberships must not leak each other

Session bootstrap returns only allowed Client contexts and safe metadata.

No internal Organizations/workspaces are exposed to the Client unnecessarily.

---

# 5. States

Design 075 must keep authentication, identity, session, membership, Invitation and recovery state separate.

### Authentication form state

```text
Idle
Submitting
Authentication Failed
Authentication Temporarily Unavailable
```

### Identity/credential outcome

```text
Credentials Accepted
Credentials Rejected
Additional Verification Required
Credential Expired / Rotation Required
```

where supported.

### Session state

```text
No Session
Session Establishing
Session Active
Session Establishment Failed
Session Revoked
Session Expired
```

### Portal membership outcome

```text
Active Membership Available
No Active Client Portal Membership
Membership Suspended
Membership Deactivated
Membership Restricted
Multiple Contexts Available
```

### Invitation relationship

```text
No Relevant Invitation
Pending Invitation Exists
Invitation Expired
Invitation Revoked
```

but Design 075 must not consume/accept it.

### Recovery relation

```text
Recovery Not In Progress
Recovery Required / Requested
```

without merging into login state.

These must not become one `login.status`.

---

## Invalid credentials ≠ no account

User-facing response should avoid distinguishing them.

---

## Authentication successful ≠ membership active

Permanent.

---

## Active membership ≠ authorized for every resource

Permanent.

---

## Pending Invitation ≠ active membership

Permanent.

---

## Deactivated membership ≠ wrong password

The backend knows the distinction.

User-facing messaging must remain security-conscious while still allowing legitimate account guidance.

---

## User globally suspended ≠ membership deactivated

Separate.

---

## Session establishment failure ≠ credential failure

If credential verification succeeds but session storage fails:

do not claim:

> Wrong password.

Return a safe generic service failure.

---

## Authentication provider unavailable ≠ invalid credentials

Permanent.

---

## Session expired ≠ account deleted

Permanent.

---

## Password recovery requested ≠ password changed

Design 077 owns that progression.

---

## Sign-in while Invitation pending

Correct:

```text
Credentials valid
↓
User authenticated
↓
no active membership for target Portal
↓
pending Invitation remains pending
```

Design 075 should not auto-promote to Active.

---

## Membership revoked while session active

The next authorization/session validation must deny Portal access.

Do not wait until the session naturally expires for a critical revocation.

---

## State Coverage

Design 075 inherits Design 150 plus:

```text
Sign-In Idle
Sign-In Submitting

Credentials Accepted
Authentication Failed
Authentication Temporarily Unavailable

Additional Verification Required
Credential Rotation Required where applicable

Session Establishing
Session Active
Session Establishment Failed
Session Expired
Session Revoked

Active Client Portal Membership
No Active Client Portal Membership
Client Portal Membership Restricted
Client Portal Membership Deactivated

Pending Invitation Exists
Invitation Expired / Invalid
Invitation Must Be Accepted Separately

Recovery Available
Recovery Flow Separate

Too Many Attempts / Temporarily Rate Limited
Security Challenge Required where applicable

Service Partially Unavailable
```

---

# 6. Responsive Behavior

## Desktop

Desktop should remain a focused authentication surface:

```text
Client Sign In
↓
Portal brand/context
↓
Identifier
↓
Credential
↓
Sign In
↓
Recovery / activation links if present in frozen design
↓
safe authentication feedback
```

It should not expose post-login Client data before authentication/membership resolution.

---

## No sensitive account preview before sign-in

Avoid displaying:

* Organization name based solely on typed email,
* user's Projects,
* pending Invoice count,
* Invitation role,

before authentication.

That can enable enumeration.

---

## Tablet

Following Design 152:

* single focused authentication card,
* clear labels,
* keyboard-safe layout,
* no unnecessary two-column complexity if frozen design does not require it,
* validation messages remain adjacent to relevant controls.

---

## Mobile

Priority:

```text
Client Portal
↓
Email / Identifier
↓
Password / Authenticator
↓
Sign In
↓
Recovery / Activation
```

The form should remain fully usable with:

* software keyboard visible,
* password manager,
* autofill,
* zoom/accessibility settings.

---

## Mobile password manager/autofill support

Use correct semantic input types/autocomplete tokens.

Do not block password managers through custom non-semantic fields.

---

## Error messaging

Errors should remain concise and generic enough to avoid enumeration.

Do not show:

> This email exists but has no Portal membership.

unless the user's authenticated state/policy makes that disclosure safe.

---

## Loading behavior

While submitting:

* prevent accidental duplicate form submission,
* do not disable navigation/recovery indefinitely,
* communicate progress accessibly.

---

## Accessibility

Form controls require:

* visible labels,
* programmatic labels,
* accessible error associations,
* keyboard operation,
* focus management on validation failure.

---

## Password field accessibility

Show/hide-password control, if frozen, should have a semantic accessible label and should not change the actual credential value.

---

## Success transition

After session bootstrap succeeds, focus/navigation transitions into the Client Portal should be deterministic without briefly exposing unauthorized shell content.

---

# 7. Backend Requirements

## Authentication architecture

```text
Design 075
    ↓
Authentication Request
    ↓
Login Rate/Risk Controls
    ↓
AuthenticationIdentity Resolver
    ↓
Credential Verifier
    ↓
Canonical User
    ↓
AuthenticationSession Service
    ↓
ClientPortalMembership Resolver
    ↓
Portal Context Bootstrap
    ↓
Authorization Layer
```

---

## AuthenticationIdentity resolver

Conceptually:

```text
resolveAuthenticationIdentity(
    normalizedIdentifier,
    provider/type
)
```

should be separated from Profile/CRM Contact lookup.

---

## Identifier normalization

For email login, normalize appropriately while preserving original display where necessary.

Do not assume every identity type follows email semantics forever.

---

## Credential verification

Password verification should use:

* hardened password hash,
* constant-time/safe comparison behavior through standard libraries,
* current security parameters,
* optional rehash-on-success when hash policy is upgraded.

---

## Dummy-hash behavior for unknown identities

To reduce timing-based enumeration, unknown identities can still perform an equivalent password-hash verification path where practical.

---

## Credential migration

If hash parameters change:

successful sign-in can safely migrate/rehash credentials without changing User identity.

---

## No plaintext credential logs

Never log:

* password,
* recovery secret,
* MFA code,
* raw provider tokens.

---

## Session creation

Conceptually:

```text
createAuthenticationSession(
    userId,
    authenticationContext,
    security metadata
)
```

returns a new secure session.

---

## Session rotation

Authenticate → rotate/create session.

Do not continue using a pre-auth session identifier without protection.

---

## Session storage

If server-side sessions are used:

store stable:

* User ID,
* session status,
* expiry,
* authentication strength,
* revision/security context.

Avoid stuffing full mutable permissions into a forever-lived session payload.

---

## ClientPortalMembership resolver

After User authentication:

```text
resolveActiveClientPortalMemberships(userId)
```

returns only valid memberships.

It does not create them.

---

## No implicit membership creation

Never:

```text
if user email domain matches organization
   create membership
```

or:

```text
if pending invitation email matches
   activate automatically
```

Both are prohibited.

---

## Pending Invitation detection

The system may identify that an Invitation exists and route the user toward Design 076 after authentication where product flow allows.

But:

> detecting Invitation ≠ accepting Invitation.

---

## Membership version/revision

A useful server-side model can maintain:

```text
membershipRevision
```

or authorization version.

Role/scope/deactivation changes can invalidate stale authorization claims.

---

## Session bootstrap

Conceptually:

```text
ClientPortalSessionBootstrapService
├── user safe identity
├── active memberships
├── selected/eligible Client context
├── organization safe projection
├── membership state
└── authorization revision
```

No broad internal User/Organization data.

---

## Multiple active memberships

If User has several Client memberships, bootstrap must not accidentally choose the wrong organization using:

* last email domain,
* first DB row,
* client-supplied org ID without authorization.

Context selection policy must be deterministic and safe.

Exact UX/route treatment Phase 3B.

---

## Session revocation triggers

Consider revocation/revalidation after:

```text
CredentialChanged
PasswordReset
UserSuspended
MembershipDeactivated
MembershipRoleChanged
MembershipScopeChanged
SecuritySessionRevoked
```

depending on policy.

---

## Role/scope change

A role change does not require deleting the User/AuthIdentity.

It requires authorization/session state to reflect current membership.

---

## Login attempt records

Conceptually:

```text
AuthenticationAttempt
├── attemptedAt
├── normalized identity fingerprint/reference
├── outcome class
├── risk metadata
├── source context
└── rate-limit bucket references
```

Sensitive data must be minimized.

---

## Security events and Audit

Material events can include:

```text
AuthenticationSucceeded
AuthenticationFailed
AuthenticationRateLimited
SessionCreated
SessionRevoked
SuspiciousAuthenticationDetected
```

according to Audit/security policy.

Do not store raw credentials.

---

## Account enumeration controls

External responses should map internal reasons such as:

```text
UNKNOWN_IDENTITY
BAD_CREDENTIAL
DEACTIVATED_MEMBERSHIP
NO_CLIENT_MEMBERSHIP
```

to safe user-facing messages according to authenticated/unauthenticated context.

---

## Rate-limiting strategy

Need:

* per-identity limits,
* IP/network limits,
* adaptive/risk-based controls where appropriate,
* cooldown/retry policy,
* monitoring.

Avoid permanent lockout solely from untrusted repeated requests.

---

## Credential stuffing protections

Can include:

* breach-password rejection during credential creation/change,
* risk detection,
* adaptive challenge,
* security alerting.

Exact production controls Phase 3D/3E.

---

## Session lifetime

Define:

* idle expiry,
* absolute expiry,
* refresh semantics,
* revocation.

Sensitive actions may demand recent authentication.

---

## Secure redirect/return handling

If sign-in accepts a return destination:

allow only safe internal/allowlisted destinations.

Do not permit arbitrary:

```text
?returnUrl=https://evil.example
```

open redirects.

---

## CSRF and same-site protections

Login/session endpoints must follow the selected session architecture's CSRF protections.

---

## CORS/origin controls

Authentication endpoints should not become broadly callable from arbitrary origins with session credentials.

---

## No sensitive auth state in URL

Do not place:

* password,
* session token,
* persistent credential secrets

into query parameters.

---

## Auth provider abstraction

Even if initial implementation uses one method, keep a clean contract such as:

```text
AuthenticationProvider
├── authenticate()
├── verifyChallenge()
├── revoke()
└── rotateCredential() where applicable
```

without overengineering extra UI.

---

## Recovery boundary

Design 077 owns:

* recovery request,
* recovery token/challenge,
* credential replacement,
* invalidation of relevant old sessions.

Design 075 should call/link into that flow rather than contain generic password mutation endpoints.

---

## Invitation boundary

Design 076 owns:

```text
acceptClientPortalInvitation()
```

Design 075 must never call this as a side effect of `signIn()`.

---

## Post-login resource authorization

After session establishment, every Designs 041–074 resource continues independent authorization.

Examples:

```text
canReadConversation()
canReadInvoice()
canSignContract()
canReadProof()
canReadDistributionMetrics()
```

Login success grants none of those automatically.

---

## Backend Requirement Matrix

| Requirement                                      | Status                                  |
| ------------------------------------------------ | --------------------------------------- |
| Stable canonical User                            | **Critical**                            |
| AuthenticationIdentity entity                    | **Critical**                            |
| User/AuthIdentity separation                     | **Critical**                            |
| AuthenticationIdentity/Profile email separation  | **Critical**                            |
| AuthIdentity/CRM Contact separation              | **Critical**                            |
| Credential entity/separation                     | **Critical**                            |
| Strong password hashing if passwords used        | **Critical**                            |
| No plaintext credential storage                  | **Critical**                            |
| AuthenticationSession entity                     | **Critical**                            |
| Session/User stable-ID binding                   | **Critical**                            |
| Authentication/Membership separation             | **Critical**                            |
| Authentication/Authorization separation          | **Critical**                            |
| ClientPortalMembership resolver                  | **Critical**                            |
| No implicit membership creation                  | **Critical**                            |
| Invitation/Membership separation                 | **Critical**                            |
| No implicit Invitation acceptance                | **Critical**                            |
| Design 076 activation reuse                      | **Critical**                            |
| Design 077 recovery separation                   | **Critical**                            |
| Membership deactivation/User deletion separation | **Critical**                            |
| Multi-organization membership safety             | **Critical**                            |
| Organization-domain matching prohibited as auth  | **Critical**                            |
| Session rotation/fixation protection             | **Critical**                            |
| Session expiry/revocation                        | **Critical**                            |
| Membership-change authorization refresh          | **Critical**                            |
| Long-lived stale role claims protection          | **Critical**                            |
| Login rate limiting                              | **Critical**                            |
| Brute-force/credential-stuffing protection       | **Critical**                            |
| Account-enumeration-safe responses               | **Critical**                            |
| Timing-enumeration mitigation                    | **Required**                            |
| Secure cookies/session transport                 | **Critical where cookie sessions used** |
| CSRF protection                                  | **Critical where applicable**           |
| Origin/CORS controls                             | **Critical**                            |
| Safe return URL validation                       | **Critical**                            |
| No auth secrets in URLs                          | **Critical**                            |
| Authentication Audit/Security events             | **Critical**                            |
| No sensitive credential logs                     | **Critical**                            |
| Session bootstrap safe projection                | **Critical**                            |
| Post-login server authorization                  | **Critical**                            |
| Sensitive-action reauthentication support        | **Required architecture**               |
| Designs 059/062 reuse                            | **Critical**                            |
| Designs 070–074 historical identity preservation | **Critical**                            |

---

# 8. Consolidation

Design 075 exposes several major implementation risks.

**User / AuthenticationIdentity conflation**
Mutable login email becomes the User's only identity.

**AuthenticationIdentity / Profile email conflation**
Editing Profile unexpectedly changes login credentials.

**AuthenticationIdentity / Client Contact conflation**
CRM email records become authentication credentials.

**AuthenticationIdentity / Notification destination conflation**
Communication settings alter login identity.

**AuthenticationIdentity / Contract signer snapshot conflation**
Login changes rewrite historical legal evidence.

**Credential / User conflation**
Secrets become broadly returned User fields.

**Credential plaintext storage**
Password compromise becomes catastrophic.

**Authentication attempt / session conflation**
Failed request creates authenticated state.

**AuthenticationSession / User conflation**
Deleting a session deletes account identity.

**Session / Membership conflation**
One login session hardcodes one Client organization forever.

**Authentication / authorization conflation**
Correct password grants all Portal resources.

**Credential validation / permission evaluation conflation**
Role logic is embedded into password verification.

**Successful authentication / active membership conflation**
User enters Portal despite no current Client membership.

**Deactivated membership / deleted User conflation**
Removing one Client relationship destroys global identity.

**Membership deactivation / credential invalidation conflation**
One organization's removal disables unrelated organization access.

**Portal membership / Organization conflation**
Organization ID alone grants access.

**Email domain / Organization membership conflation**
`@company.com` users gain company Portal access automatically.

**Invitation / membership conflation**
Pending Invitation already behaves as active access.

**Sign-in / Invitation acceptance conflation**
Logging in silently accepts requested role/scope.

**Invitation email / AuthIdentity conflation**
Invite destination becomes permanent login identity.

**Portal Role / login identity conflation**
Role is selected/inferred during sign-in.

**Job title / authorization conflation**
Profile title controls Portal permissions.

**Recovery token / session token conflation**
Account-recovery link directly becomes durable session.

**Login / recovery mutation conflation**
Sign-in endpoint changes credentials.

**Unknown email / wrong password disclosure**
Login enables account enumeration.

**Unknown account timing differences**
Attacker infers valid identities from response time.

**Membership state leakage pre-authentication**
Login reveals high-value organizations/users.

**No rate limiting**
Brute-force attacks remain unrestricted.

**Naïve account lockout**
Attacker can intentionally lock legitimate users.

**Session fixation**
Pre-auth session remains valid after login.

**Session token in localStorage without need**
Browser script compromise increases session theft risk.

**Session token in URL**
Secrets leak through logs/history/referrers.

**Open redirect after login**
Attacker uses trusted sign-in to redirect to malicious site.

**Long-lived roles in JWT**
Design 062 deactivation/role change takes hours/days to apply.

**Session principal keyed by email**
Email change breaks/stitches account identity incorrectly.

**Multiple memberships / first-row selection**
User is placed in wrong Client organization.

**Client-supplied orgId trusted**
Authenticated user pivots into another organization.

**Portal shell rendered before membership check**
Unauthorized Client metadata flashes/leaks.

**Authentication provider failure / bad credentials conflation**
Service outage tells user password is wrong.

**Session-store failure / bad password conflation**
Credentials are misdiagnosed.

**Membership deactivation / historical record deletion**
Messages, signatures, approvals, audit evidence disappear.

**Login success / Contract signing authority conflation**
Authenticated user can sign any visible Contract.

**Login success / Invoice payment authority conflation**
Authenticated Client automatically gets Finance power.

**Login success / Conversation participation conflation**
Authenticated account reads all Client threads.

**075/059 duplicate identity data**
Profile and Auth each create conflicting User/email truth.

**075/062 duplicate access state**
Sign-in endpoint creates/changes membership independently.

**075/076 duplicate activation logic**
Sign-in silently accepts invitations.

**075/077 duplicate credential-recovery logic**
Login endpoint becomes password-reset service.

No additional screen is required.

These are **identity separation, authentication, session security, membership resolution, authorization, anti-enumeration, revocation, Invitation separation, and recovery-boundary requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT AUTHENTICATION, SESSION ESTABLISHMENT & PORTAL MEMBERSHIP BOOTSTRAP ANCHOR**

**Domain directive:**
**User ≠ AuthenticationIdentity ≠ Credential ≠ AuthenticationSession ≠ ClientPortalMembership ≠ Organization ≠ Invitation ≠ Authorization ≠ RecoveryState.**

**Identity directive:**
User remains the stable canonical person/account identity. Mutable Profile/CRM/contact fields never become implicit authentication identity keys.

**Authentication-identity directive:**
login identifiers belong to explicit AuthenticationIdentity records and are governed separately from PersonalProfile, Organization, CRM Contact, Notification destination, historical Signer, and historical Message data.

**Credential directive:**
passwords/authenticators remain secret Credential material, never plaintext User fields, API payloads, logs, or broadly accessible profile data.

**Authentication directive:**
Design 075 validates authentication factors only. Correct credentials establish identity; they do not establish Portal permission.

**Session directive:**
successful authentication creates/rotates a secure AuthenticationSession bound to stable User ID, with expiry, revocation, and authentication-strength semantics.

**Membership directive:**
after authentication, Design 062's ClientPortalMembership foundation determines whether the User currently has an eligible active Portal relationship. Sign-in never creates membership implicitly.

**Organization directive:**
Organization context must be reached only through verified membership. Email domain, Organization ID, Profile company name, or Invitation destination never substitutes for membership.

**Authorization directive:**
resource authorization happens after session/membership resolution and remains source-specific. Login success does not grant Contract, Invoice, Message, Project, Proof, Publication, or Distribution authority.

**Invitation directive:**
Design 076 exclusively owns Invitation validation and acceptance. Authentication may discover a relevant pending Invitation, but sign-in never silently activates or accepts it.

**Recovery directive:**
Design 077 exclusively owns recovery/challenge/credential-replacement workflows. Design 075 may navigate to recovery but never mutates credentials as a generic login side effect.

**Deactivation directive:**
deactivating a ClientPortalMembership blocks that Portal relationship without deleting the canonical User, AuthIdentity, other memberships, or historical Messages/Approvals/Signatures/Audit evidence.

**Multi-membership directive:**
one authenticated User may have multiple Client memberships. Portal context resolution must be server-authorized and deterministic rather than chosen by email domain, first DB row, or unchecked browser org ID.

**Enumeration directive:**
unauthenticated failures use safe responses that do not expose whether a User, email, membership, Organization, or Invitation exists. Internal diagnostics retain the real failure cause.

**Rate-limit directive:**
sign-in uses rate limiting and brute-force/credential-stuffing controls without equating security lock/hold state to membership deactivation.

**Session-security directive:**
session fixation, open redirect, CSRF/origin issues, long-lived stale claims, credential leakage, and insecure token placement must be explicitly prevented by the selected authentication architecture.

**Revocation directive:**
membership deactivation, global User suspension, credential reset, session revocation, and material access changes must propagate quickly enough that stale sessions cannot preserve revoked Portal authority.

**Claim-freshness directive:**
long-lived tokens must not be the permanent source of role/scope truth. Current membership/authorization state remains authoritative through server checks, revision claims, short-lived tokens, or equivalent mechanisms.

**Historical-evidence directive:**
authentication identity/profile/membership changes never rewrite historical Contract-party/Signer evidence, Message authorship, Approval decisions, Payment evidence, or Audit records.

**Audit directive:**
successful/failed authentication, rate limits, session creation/revocation, and material security events can generate safe Audit/security records while credentials and secrets remain excluded.

**Failure directive:**
invalid credentials, auth-provider outage, session-establishment failure, no active Portal membership, revoked membership, pending Invitation, and recovery requirement remain distinct backend states even where unauthenticated user-facing responses intentionally collapse some details for security.

**Responsive directive:**
desktop, tablet and mobile remain focused accessible authentication surfaces with correct autofill/password-manager semantics, enumeration-safe errors, deterministic loading states, and no pre-auth leakage of Client/Organization data.

**Overlap directive:**
Designs **037, 039, 059–064 and 075–077** must ultimately consume one canonical User + AuthenticationIdentity + Credential + Session + typed Membership + Authorization foundation while preserving Invitation and Recovery as explicit separate workflows.

**Consolidation directive:**
**STANDARDIZE ONE CLIENT AUTHENTICATION FOUNDATION — STABLE USER + EXPLICIT AUTHENTICATIONIDENTITY + SECURE CREDENTIALS + RATE-LIMITED AUTHENTICATION + ROTATED/REVOCABLE AUTHENTICATIONSESSION + POST-AUTH CLIENTPORTALMEMBERSHIP RESOLUTION + CURRENT SERVER-AUTHORITATIVE PERMISSION EVALUATION — WHILE KEEPING ORGANIZATION, INVITATION ACCEPTANCE, PERSONAL/CRM EMAIL, RECOVERY, PORTAL ROLE, PROJECT SCOPE AND HISTORICAL BUSINESS EVIDENCE STRICTLY SEPARATE. SIGN-IN MUST NEVER CREATE MEMBERSHIP, ACCEPT AN INVITATION, OR GRANT RESOURCE AUTHORIZATION AS A SIDE EFFECT OF SUCCESSFUL CREDENTIAL VALIDATION.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **75 / 153** |
| **PASS**                                   |                         **75** |
| **STANDARDIZE decisions**                  |                         **73** |
| **Potential implementation-overlap flags** |                         **66** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**75 / 153 = 49.0% audited.**

### Canonical Client access chain after Design 075

```text
                  USER
                   │
                   ↓
        AuthenticationIdentity
                   │
                   ↓
              Credential
                   │
                   ↓
           AUTHENTICATION
                   │
                   ↓
       AuthenticationSession
                   │
                   ↓
       ClientPortalMembership
                   │
                   ↓
         Organization Context
                   │
                   ↓
             Authorization
                   │
        ┌──────────┼───────────┐
        ↓          ↓           ↓
     Project    Contract    Messages
      access      access       access
```

The most important boundary remains:

```text
Successful Authentication
          ≠
Active Client Portal Membership
          ≠
Authorization to every Portal resource
```

And the upcoming access sequence remains distinct:

```text
Design 075
SIGN IN
“Prove who you are.”
       │
       ↓
Design 076
ACTIVATE / ACCEPT INVITE
“Accept this exact proposed Portal membership/grant.”
       │
       ↓
Design 077
ACCESS RECOVERY
“Recover control of an existing authentication identity safely.”
```

None should absorb the others.

# Next Sequential Audit Target

## **Design 076 — Client Portal Activation / Accept Invite**

Its frozen identity and supplied route annotation **`/client/activate/[token]`** are already locked.

The next audit must preserve the activation boundary:

> **Invitation ≠ ActivationToken ≠ User ≠ AuthenticationIdentity ≠ ClientPortalMembership ≠ PortalRoleAssignment ≠ ResourceScope ≠ AuthenticationSession ≠ Organization.**

It must reconcile **Design 062's Invitation/Membership foundation** with **Design 075 authentication** while preserving:

* Invitation can exist before User,
* Invitation destination email ≠ permanent User/AuthIdentity,
* accepting Invitation ≠ simply authenticating,
* token must bind exact Invitation + Organization + intended role/scope,
* recipient cannot alter proposed role/scope through request tampering,
* existing User should receive/link the Membership rather than creating duplicate User,
* acceptance must be single-use, expiry-aware, revocation-aware, idempotent and transactional,
* raw activation tokens should not be stored/logged in plaintext where avoidable,
* Invitation acceptance creates/activates Membership but never rewrites historical access/evidence.

After Design 076 we continue strictly:

**077 Client Access Recovery**

with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
