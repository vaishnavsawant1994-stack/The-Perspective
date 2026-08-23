# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 077 — Client Access Recovery

Its frozen identity and supplied route annotation **`/client/recover-access`** are locked. Exact route connections remain a **Phase 3B** concern and are not being redesigned here.

Design 077 should become the **canonical Client Portal authentication-access recovery surface** for safely proving control of an existing authentication identity and, where policy allows, replacing or recovering its credential without creating or modifying Client Portal authority.

Its governing boundary is:

> **User ≠ AuthenticationIdentity ≠ Credential ≠ RecoveryRequest ≠ RecoveryToken/Challenge ≠ CredentialReset ≠ AuthenticationSession ≠ ClientPortalMembership ≠ Invitation.**

The central implementation rule is:

> **Recovery restores control of authentication; it does not grant access. A successful credential recovery may allow the User to authenticate again, but ClientPortalMembership, Portal role, Project/resource scope, Invitation state, Contract signing authority, Approval participation, Conversation participation, and every other authorization relationship remain untouched.**

---

# 1. Classification

| Audit field                                        | Classification                                                                                                                                      |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                                      | **077**                                                                                                                                             |
| **Canonical name**                                 | **Client Access Recovery**                                                                                                                          |
| **Product area**                                   | Client Portal / Authentication / Credential Recovery                                                                                                |
| **User surface**                                   | Public/Unauthenticated Client Portal Recovery Entry                                                                                                 |
| **Screen class**                                   | Authentication Identity Recovery / Credential Reset Workflow                                                                                        |
| **Classification**                                 | **Client Authentication Recovery Anchor — Identity Control & Credential Replacement Family**                                                        |
| **Primary purpose**                                | Let a legitimate controller of an existing AuthenticationIdentity recover authentication access without creating or escalating Portal authorization |
| **Stable account entity**                          | **User**                                                                                                                                            |
| **Authentication binding**                         | **AuthenticationIdentity**                                                                                                                          |
| **Authenticator/secret entity**                    | **Credential**                                                                                                                                      |
| **Recovery workflow entity**                       | **RecoveryRequest**                                                                                                                                 |
| **Temporary recovery proof**                       | **RecoveryToken / RecoveryChallenge**                                                                                                               |
| **Completed security operation**                   | **CredentialReset**                                                                                                                                 |
| **Session dependency**                             | **AuthenticationSession**                                                                                                                           |
| **Portal access relationship**                     | **ClientPortalMembership** — unchanged by recovery                                                                                                  |
| **Invitation dependency**                          | Design 076 — separate                                                                                                                               |
| **Authentication dependency**                      | Design 075                                                                                                                                          |
| **Personal profile dependency**                    | Design 059                                                                                                                                          |
| **Membership/access dependency**                   | Design 062                                                                                                                                          |
| **Audit dependency**                               | Design 039                                                                                                                                          |
| **Notification/security communication dependency** | Designs 061 / 064 where applicable                                                                                                                  |
| **Primary service**                                | `AuthenticationRecoveryService`                                                                                                                     |
| **Credential service**                             | `CredentialLifecycleService`                                                                                                                        |
| **Session-security service**                       | `AuthenticationSessionService`                                                                                                                      |
| **Auth requirement**                               | Not required to initiate; recovery itself establishes proof before credential change                                                                |
| **Authorization outcome**                          | None — recovery never creates Portal authorization                                                                                                  |
| **Implementation priority**                        | **Critical Authentication Security / Account Takeover Prevention**                                                                                  |
| **Reuse level**                                    | **Extremely High with Design 075; strict separation from Design 076**                                                                               |

Design 077 should answer:

> **“Can this person safely prove control of an existing AuthenticationIdentity strongly enough to recover its authenticator, and can that Credential be replaced without revealing account existence, creating Portal membership, consuming an Invitation, or corrupting historical identity/security evidence?”**

Canonical flow:

```text
Recovery identifier submitted
          ↓
Enumeration-safe Recovery Request
          ↓
Internal AuthenticationIdentity resolution
          ↓
RecoveryRequest
          ↓
RecoveryToken / Challenge
          ↓
Proof verification
          ↓
CredentialReset
          ↓
New / rotated Credential
          ↓
Existing Sessions revoked/rotated per policy
          ↓
Design 075 authentication
          ↓
ClientPortalMembership evaluation
          ↓
Authorization
```

The most important separation is:

```text
Recovery successful
      ≠
Portal membership active
      ≠
Portal authorization granted
```

---

# 2. Reuse

## Design 075 remains the canonical authentication/session foundation

Design 075 established:

> **User ≠ AuthenticationIdentity ≠ Credential ≠ AuthenticationSession ≠ ClientPortalMembership ≠ Authorization.**

Design 077 must reuse exactly that identity and credential system.

Do **not** create:

```text
RecoveryUser
ResetAccount
ClientRecoveryIdentity
PortalPasswordAccount
```

as parallel account identities.

Correct:

```text
Design 077
Recover control of AuthenticationIdentity
        ↓
Canonical Credential lifecycle
        ↓
Design 075
Authenticate using canonical identity
```

---

## Design 077 does not replace Design 075

Recovery does not mean:

> authenticated forever.

It repairs/replaces the authentication mechanism.

After recovery, normal session establishment and membership evaluation remain governed by Design 075.

---

## Design 076 remains completely separate

Design 076 answers:

> Should this verified recipient receive this pending invitation grant?

Design 077 answers:

> Can this existing authentication identity regain control of its credential?

Permanent:

```text
RecoveryToken
≠
ActivationToken
```

and:

```text
Credential recovery
≠
Invitation acceptance
```

---

## Pending Invitation must remain pending

Example:

```text
User U1
├── AuthenticationIdentity A1
└── pending Invitation I1
```

If U1 resets their password:

```text
Invitation I1 = still PENDING
```

Design 077 must never call the invitation acceptance transaction.

---

## Reuse Design 062 membership unchanged

If the User has:

```text
ClientPortalMembership
status = DEACTIVATED
```

and successfully recovers their password:

```text
Membership remains DEACTIVATED
```

Recovery cannot reactivate it.

---

## Reuse Design 059 identity separation

PersonalProfile communication details are not automatically authentication-recovery authorities.

Recovery must use a verified/governed recovery channel associated with the authentication system.

Do not send password-recovery control to an arbitrary mutable CRM/Profile address merely because it is currently displayed in the Client account.

---

## Reuse Design 039 Audit

Recovery is a material security workflow.

Audit/security records should preserve:

* recovery initiation,
* challenge issuance,
* successful/failed challenge validation where appropriate,
* CredentialReset,
* session revocation.

But Audit is not the credential or recovery token.

---

## Reuse Notifications only as transport/communication

An email or other message containing recovery instructions is a delivery mechanism.

Permanent:

```text
Recovery notification delivered
≠
Recovery proof completed
```

---

# 3. Entities

## User ≠ AuthenticationIdentity

`User` remains the canonical stable account/person identity.

One User may have more than one authentication method or identity.

Recovery must act against the correct AuthenticationIdentity rather than modifying the entire User indiscriminately.

---

## AuthenticationIdentity ≠ Credential

AuthenticationIdentity identifies the login binding.

Credential proves control.

Example:

```text
User U-101
    ↓
AuthenticationIdentity AI-1
    ↓
Credential C-4
```

A recovery changes or replaces the Credential.

It does not create a new User merely to change authentication secrets.

---

## AuthenticationIdentity ≠ recovery identifier submitted by browser

The user might submit:

> [jane@example.com](mailto:jane@example.com)

That input is only a recovery lookup hint.

It is not proof:

* that an account exists,
* that this is the canonical User,
* that the requester controls it.

---

## Recovery identifier ≠ account-existence proof

Permanent:

```text
submitted identifier
≠
valid account
```

Externally, the system must respond safely regardless of whether it resolves internally.

---

## AuthenticationIdentity ≠ PersonalProfile email

If:

```text
login identity:
jane@example.com

profile contact email:
jane.office@example.com
```

recovery should follow the governed authentication/recovery identity system, not blindly choose the Profile field.

---

## AuthenticationIdentity ≠ Invitation destination

Design 076 may contain:

```text
Invitation.destination = jane@example.com
```

That does not make the Invitation token usable for recovery.

---

## Credential

Credential represents the currently valid authenticator.

For password authentication, that means the securely hashed password credential.

For other providers, recovery semantics can vary.

Design 077 should not force every future authentication method into a local password reset.

---

## Credential reset ≠ Credential mutation in place necessarily

A safer lifecycle can preserve:

```text
Credential C3
status = REPLACED

Credential C4
status = ACTIVE
```

or equivalent controlled rotation.

Exact physical modeling belongs to Phase 3D.

The core invariant:

> previous credential history/security evidence must not be silently rewritten.

---

## Raw Credential must never be stored

New passwords/secrets must never appear in:

* plaintext database columns,
* AuditEvent payloads,
* logs,
* analytics,
* tracing,
* error reports.

---

## RecoveryRequest

`RecoveryRequest` represents an internal recovery workflow attempt for an existing identity.

Conceptually:

```text
RecoveryRequest
├── id
├── authenticationIdentityId
├── requestedAt
├── expiresAt
├── purpose
├── status
├── challenge/token generation
└── completion metadata
```

For unknown submitted identifiers, the public endpoint can still return the same generic response without needing to create a real credential-bearing RecoveryRequest.

---

## RecoveryRequest ≠ public success response

The UI may say:

> If an eligible account exists, recovery instructions will be sent.

That does not prove an internal RecoveryRequest was created.

This is necessary for anti-enumeration.

---

## RecoveryRequest ≠ RecoveryToken

RecoveryRequest is the workflow.

RecoveryToken/Challenge is temporary proof used to continue it.

---

## RecoveryToken ≠ RecoveryChallenge conceptually

They may be different technical mechanisms:

* high-entropy link token,
* OTP/challenge,
* provider verification challenge.

Both remain temporary recovery proof rather than durable account state.

---

## RecoveryToken ≠ ActivationToken

This must be structurally enforced.

ActivationToken:

> consume Invitation access grant.

RecoveryToken:

> prove recovery authority for AuthenticationIdentity/Credential.

Neither token should be valid in the other's endpoint/service.

---

## RecoveryToken ≠ AuthenticationSession

Possessing a recovery token must not grant normal Portal API access.

---

## RecoveryToken should bind exact purpose

A token intended for:

```text
PASSWORD_RESET
```

must not also be valid for:

* email change,
* Invitation acceptance,
* membership activation,
* account deletion,
* login session.

Purpose binding reduces token-confusion attacks.

---

## RecoveryToken should bind exact RecoveryRequest

Correct:

```text
RecoveryToken RT-1
→ RecoveryRequest RR-1
→ AuthenticationIdentity AI-1
```

Never:

```text
valid token
+
browser supplies arbitrary userId
```

---

## RecoveryToken should not trust browser-supplied identity

Once the token resolves to RecoveryRequest, the server derives the AuthenticationIdentity/User.

The Client does not choose which account gets reset.

---

## Raw recovery token should not be stored in plaintext where avoidable

Prefer:

```text
raw token
   ↓
secure hash / protected verification representation
   ↓
stored recovery token record
```

Raw token is delivered to the legitimate recovery channel but excluded from routine persistence/logging.

---

## Recovery token must be high entropy

For link-style recovery, cryptographically secure random tokens with sufficient entropy are required.

For shorter OTP-style challenges, strong rate limiting/attempt limits and expiry are mandatory.

---

## RecoveryToken should be single-use

After successful CredentialReset:

```text
RecoveryToken = CONSUMED
```

It cannot reset again.

---

## Expired ≠ consumed

Separate.

---

## Revoked ≠ expired

Separate.

---

## Invalid ≠ expired

Internally distinct even when user-facing messaging is intentionally generic.

---

## New recovery request may supersede prior token

A sensible policy can invalidate older active recovery token generations once a new one is issued.

Exact policy Phase 3D.

The key requirement:

> multiple outstanding recovery tokens must not become uncontrolled permanent credentials.

---

## CredentialReset

`CredentialReset` should represent the completed security operation.

Conceptually:

```text
CredentialReset
├── recoveryRequestId
├── authenticationIdentityId
├── previous credential reference/version
├── new credential reference/version
├── completedAt
├── actor/proof context
└── session-revocation outcome
```

No raw passwords.

---

## CredentialReset ≠ new User

Permanent.

---

## CredentialReset ≠ new AuthenticationIdentity automatically

If the existing identity remains valid, only its credential changes.

Changing the login identifier is a different governed identity operation.

---

## CredentialReset ≠ Membership reset

Permanent.

Do not touch:

```text
ClientPortalMembership
PortalRoleAssignment
ResourceScope
```

---

## CredentialReset ≠ Invitation acceptance

Permanent.

---

## CredentialReset ≠ historical access rewrite

If password resets today:

it does not mean the User authenticated using that password last month.

Historical events retain their original timestamps/evidence.

---

## AuthenticationSession ≠ RecoveryRequest

An active session may or may not exist while recovery is performed.

Recovery does not depend on an old session being valid.

---

## Recovery success ≠ new session necessarily

Depending on frozen UX/security policy, after successful reset the system may:

* require normal sign-in,
* or establish a separately governed fresh authentication session.

The architecture must preserve these as separate operations.

Do not automatically equate token consumption with session creation.

---

## Existing sessions should be considered compromised

A credential reset, especially recovery-originated, should trigger the configured session-security policy.

Typically this means revoking:

* all prior sessions,
* or all relevant sessions except an explicitly established safe replacement,

according to policy.

---

## Session revocation ≠ User deletion

Permanent.

---

## Membership remains unchanged through session revocation

Revoking authentication sessions does not change ClientPortalMembership.

---

## Deactivated Membership stays deactivated

This is one of the strongest Design 077 invariants:

```text
Membership:
DEACTIVATED

Credential:
successfully reset

Result:
Membership still DEACTIVATED
```

---

## Suspended User/account ≠ forgotten password

If global security policy has suspended the User:

a successful recovery challenge should not automatically remove the suspension unless that policy explicitly defines recovery as the remediation.

Do not treat all access failures as credential failures.

---

## Historical Message identity remains stable

Design 074 messages continue to reference the same canonical User/sender evidence.

CredentialReset does not alter old Message authorship.

---

## Historical Contract evidence remains stable

Design 070 Signer snapshots and SignatureEvidence remain unchanged.

---

## Historical Approval evidence remains stable

ApprovalDecision actors/participants remain unchanged.

---

## Historical Audit evidence remains stable

Do not rewrite earlier events from:

> old authentication identity state

to the new credential state.

---

# 4. Permissions

Design 077 is an unauthenticated high-risk security workflow.

It must not use normal Portal authorization as proof of recovery.

Instead it requires:

```text
RecoveryRequest eligibility
+
valid RecoveryToken/Challenge
+
purpose binding
+
expiry
+
single-use status
+
identity binding
+
risk/security policy
```

---

## Recovery endpoint must not reveal whether account exists

For initial request, use an enumeration-safe response equivalent to:

> If an eligible account exists for that information, recovery instructions will be sent.

Do not reveal:

* User exists,
* membership exists,
* Invitation exists,
* Organization name,
* account is deactivated,
* person is a Contract signer.

---

## Same response semantics for inactive/no-account cases

Unauthenticated requester should not learn whether the identifier corresponds to:

* valid User,
* inactive Membership,
* pending Invitation,
* no account.

---

## Timing should also resist enumeration where practical

Unknown-identity path should avoid dramatically faster behavior than known identities.

Use consistent work patterns/dummy verification where appropriate.

---

## Recovery destination must be server-resolved

The browser should not submit:

```text
emailToSendResetTo = attacker@example.com
```

after looking up an account.

Recovery communication goes only to a pre-verified/governed recovery channel.

---

## Browser cannot choose `userId`

Dangerous:

```text
POST /reset
{
  token,
  userId: victimId,
  newPassword
}
```

The token resolves the correct RecoveryRequest/AuthIdentity server-side.

---

## Browser cannot choose Membership/Organization

There should be no meaningful recovery request fields such as:

```text
organizationId
role
projectIds
membershipStatus
```

Credential recovery has no authority over them.

---

## Recovery cannot activate deactivated membership

Even if the user believes:

> I cannot access my Portal.

The recovery service should fix only authentication control.

If authentication succeeds afterward but membership is inactive, Design 075/062 access policy still denies Portal entry.

---

## Recovery cannot accept Invitation

A pending Invitation remains governed by Design 076.

---

## Recovery cannot elevate role

No role changes.

---

## Recovery cannot alter ResourceScope

No Project/resource grant changes.

---

## Rate limiting

Recovery initiation must be rate-limited against abuse such as:

* email bombing,
* identifier enumeration,
* denial-of-service.

Use appropriate combination of:

* normalized identity bucket,
* IP/network,
* device/risk signals.

---

## Challenge verification rate limiting

OTP/challenge verification requires separate rate limits/attempt counters.

High-entropy link tokens still require abuse controls.

---

## Avoid account lockout abuse

Attackers should not be able to permanently disable a User by repeatedly requesting recovery.

Recovery requests themselves should not invalidate the active Credential until successful reset unless security policy deliberately requires otherwise.

---

## Token brute-force protection

Invalid-token/challenge attempts need rate limiting and monitoring.

---

## Password/credential policy

For local password reset, backend should enforce canonical credential policy such as:

* minimum strength,
* maximum reasonable length handling,
* breached-password protection where used,
* no dangerous truncation,
* appropriate normalization policy.

Do not rely on frontend checks.

---

## New password confirmation is UX, not security proof

Matching two input boxes only prevents user typo.

It does not authenticate the requester.

The recovery challenge provides proof.

---

## Existing password should not be required for forgotten-password recovery

If the user knows the current password, that is more properly a credential-change workflow inside an authenticated session.

Design 077's purpose is recovery when normal authentication control is unavailable.

No extra screen is being introduced here.

---

## Recovery response after token validation

Once a valid token/challenge has been proven, the UI may safely reveal only the minimum needed recovery context.

Avoid exposing broader Client Organization/access information.

---

## Cross-site/security protections

Recovery credential-changing operations need protections appropriate to their architecture:

* origin/CSRF defenses where cookies/session context applies,
* safe content types,
* HTTPS only,
* no mixed-content secret submission.

---

## Referrer and URL-token safety

If a recovery token appears in a URL:

* do not load unnecessary third-party resources that receive full referrer,
* use appropriate referrer policy,
* redact token from observability,
* exchange it for server-side temporary recovery state when practical.

---

## Safe redirect after reset

Return targets must be internal/allowlisted.

Recovery must not create an open redirect.

---

# 5. States

Design 077 must keep request, challenge, reset, credential, session, membership, and Invitation states separate.

### Recovery request state

```text
Idle
Submitting Request
Generic Request Accepted
Rate Limited
Service Unavailable
```

The public state intentionally does not reveal identity existence.

### Internal RecoveryRequest state

```text
Pending
Challenge Issued
Verified
Completed
Expired
Revoked
Superseded
```

### RecoveryToken/Challenge state

```text
Valid
Invalid
Expired
Consumed
Revoked
Attempts Exhausted
```

### Credential reset state

```text
Ready to Reset
Resetting
Reset Successful
Reset Failed
Reset Outcome Reconciliation Required
```

### Session state

```text
Existing Sessions Active
Session Revocation Pending
Existing Sessions Revoked
Fresh Authentication Required
```

### Membership state

Untouched:

```text
Active
Restricted
Suspended
Deactivated
```

Recovery does not transition these.

### Invitation state

Untouched:

```text
Pending
Accepted
Expired
Revoked
```

These must never become one `recovery.status`.

---

## Generic recovery request accepted ≠ account exists

Permanent.

---

## Recovery instructions sent ≠ recovery completed

Permanent.

---

## Token valid ≠ Credential reset

Permanent.

---

## Challenge verified ≠ session active

Permanent.

---

## Credential reset ≠ Portal access restored

Critical.

If Membership is deactivated:

```text
Credential reset successful
+
Membership deactivated
=
authentication may work
but Portal access remains denied
```

---

## Credential reset ≠ Invitation accepted

Permanent.

---

## Token expired ≠ account unavailable

The user can request a new recovery flow according to policy.

---

## Token consumed ≠ invalid credentials

Consumed indicates previous use, not account nonexistence.

---

## Reset request timeout ≠ safe to apply reset twice blindly

If credential rotation may have committed:

the backend should reconcile operation status through idempotency/transaction state where appropriate.

---

## Session revocation failure ≠ silently ignore

If policy requires old sessions revoked after reset:

credential-reset completion must reliably coordinate session invalidation.

A reset that leaves known compromised sessions indefinitely active defeats the security objective.

---

## Notification delivery failure ≠ account does not exist

Permanent.

---

## Recovery email provider outage ≠ invalid account

Permanent.

---

## New recovery request ≠ old token still valid forever

Supersession policy should be explicit.

---

## Deactivated membership ≠ recovery failure

Recovery can successfully restore credential control while Portal access remains deactivated.

These must be represented separately internally.

---

## State Coverage

Design 077 inherits Design 150 plus:

```text
Recovery Idle
Recovery Request Submitting
Generic Recovery Request Accepted

Recovery Request Rate Limited
Recovery Service Unavailable

Recovery Token Valid
Recovery Token Invalid
Recovery Token Expired
Recovery Token Consumed
Recovery Token Revoked
Recovery Challenge Attempts Exhausted

Recovery Challenge Verifying
Recovery Challenge Verified
Recovery Challenge Failed

Credential Reset Ready
Credential Reset Processing
Credential Reset Successful
Credential Reset Failed
Credential Reset Outcome Reconciliation Required

Session Revocation Processing
Prior Sessions Revoked
Session Revocation Failed
Fresh Authentication Required

Portal Membership Active
Portal Membership Restricted
Portal Membership Deactivated
— informational after authenticated evaluation, never mutated by recovery

Pending Invitation Unchanged

Partial Recovery Service Failure
```

---

# 6. Responsive Behavior

## Desktop

Desktop should remain a focused security-recovery experience:

```text
Recover Access
↓
Recovery identifier
↓
Submit Recovery Request
↓
Enumeration-safe confirmation

then, after valid recovery proof:

Recovery Verification
↓
New Credential
↓
Confirm Credential
↓
Reset
↓
Recovery Result
```

Only frozen Design 077 elements should render.

---

## Do not reveal Client organization before verification

The initial screen should not say:

> Recover access to Acme Corporation's Executive Portal

based merely on an entered email if doing so reveals account/tenant existence.

Branding that is globally known for the Client Portal is fine; account-specific membership detail is not.

---

## Recovery confirmation should be enumeration-safe

Whether the identifier exists or not, the confirmation treatment should remain materially consistent.

---

## Tablet

Following Design 152:

* single-column security flow remains primary,
* verification/reset fields stay legible,
* error/expiry states stack clearly,
* no overflow from recovery-token-derived state.

---

## Mobile

Priority:

```text
Recover access
↓
Identifier
↓
Send recovery instructions
↓
Generic confirmation
```

and after legitimate challenge verification:

```text
Create new credential
↓
Confirm
↓
Reset
↓
Sign in
```

where consistent with frozen Design 077.

---

## Mobile password managers

For password recovery:

* use correct `autocomplete="new-password"` semantics,
* permit password managers,
* avoid custom controls that break secure autofill.

---

## Token should not be displayed

Even if the route/challenge contains a token, the raw value should not appear in a text field or debug panel.

---

## Expired-token state

Provide a clear recovery restart path only if present in frozen design.

Do not expose:

* User ID,
* internal RecoveryRequest ID,
* Membership details.

---

## Error accessibility

Validation errors need:

* programmatic association,
* predictable focus,
* non-color-only indicators.

---

## Credential-strength guidance

If frozen design shows password requirements, describe the actual backend policy accurately.

Do not show frontend requirements that differ from server enforcement.

---

## Rate-limit messaging

Avoid revealing exact abuse thresholds.

Use a safe message equivalent to:

> Too many attempts. Please try again later.

---

# 7. Backend Requirements

## Recovery initiation architecture

```text
Design 077
    ↓
Recovery Request Endpoint
    ↓
Rate / Risk Controls
    ↓
Normalize identifier
    ↓
Internal AuthenticationIdentity lookup
       ├── found → evaluate recovery eligibility
       └── not found → enumeration-safe dummy path
    ↓
Generic external response
```

---

## RecoveryRequest creation

For eligible existing identities:

```text
createRecoveryRequest(
    authenticationIdentityId,
    purpose
)
```

should establish:

* expiry,
* token/challenge generation,
* security context,
* generation/version.

---

## Do not create account-like records for arbitrary unknown addresses

Unknown identifiers can follow equivalent timing and generic response logic without filling the database with fake Users/AuthIdentities.

---

## Recovery channel selection

Server resolves the authorized verified recovery destination.

Do not trust a destination supplied alongside the recovery request.

---

## Recovery token generation

For link tokens:

```text
cryptographically secure random bytes
        ↓
URL-safe encoded raw token
        ↓
hash stored server-side
```

with sufficient entropy.

---

## Recovery token hashing

Validation:

```text
presented raw token
        ↓
secure token hash
        ↓
lookup/constant-time comparison as appropriate
        ↓
RecoveryRequest
```

---

## Purpose binding

Token/challenge must include or resolve:

```text
purpose = CREDENTIAL_RECOVERY
```

and be rejected by Invitation activation or normal session endpoints.

---

## Expiry

Server clock is authoritative.

---

## Single-use consumption

Successful reset atomically marks the recovery proof consumed.

---

## Token revocation

Support:

* explicit security revocation,
* supersession by newer request where policy chooses,
* completion consumption.

---

## Concurrent reset protection

Two browser tabs using the same token must not perform two independent credential rotations.

Use:

* row locking,
* conditional transition,
* unique completion constraints,
* or equivalent.

---

## Credential-reset transaction

Conceptually:

```text
resetCredential(recoveryProof, newCredential)
        ↓
re-read RecoveryRequest/token
        ↓
verify valid + unexpired + unconsumed
        ↓
resolve exact AuthenticationIdentity
        ↓
validate new credential policy
        ↓
create/rotate Credential
        ↓
record CredentialReset
        ↓
consume recovery token
        ↓
increment credential/security revision
        ↓
schedule/perform required session revocation
        ↓
Audit/outbox
        ↓
commit
```

---

## No User/Membership creation

The reset transaction must not include:

```text
createClientPortalMembership()
acceptInvitation()
assignPortalRole()
grantProjectScope()
```

---

## Credential hashing

For local passwords:

* use established adaptive password hashing,
* secure salt,
* configurable cost,
* current cryptographic best practices.

No custom cryptography.

---

## Credential policy server-side

The backend is authoritative for credential validity.

---

## Optional prior-password reuse controls

If the security policy prohibits immediate reuse of recent credentials, enforce it using secure credential history representation.

Do not store prior plaintext passwords.

This is policy-level, not a new UI requirement.

---

## Credential-security revision

A successful recovery can increment something such as:

```text
credentialRevision
securityRevision
```

to help invalidate stale authentication state.

---

## Session revocation architecture

Conceptually:

```text
CredentialReset completed
       ↓
AuthenticationSessionService
       ↓
revoke sessions according to policy
       ↓
fresh authentication required
```

or establish one explicitly safe replacement session if the canonical authentication policy supports it.

---

## Session revocation should include refresh tokens/derived session credentials

Do not revoke only the visible browser cookie while leaving long-lived refresh credentials active.

---

## Membership stays untouched

Session revocation must not mutate Membership rows.

---

## Authorization caches

Credential reset/session revocation may require session/security cache invalidation.

It does not require rebuilding Portal role/resource scope unless a separate authorization event occurred.

---

## Recovery event idempotency

If reset commits but response is lost:

retry of the same consumed token must not rotate again.

The system should reconcile:

> recovery already completed

without reopening the secret.

---

## Notification after recovery

Security notification such as:

> Your credential was changed.

can be generated after successful reset according to policy.

It should be sent to appropriate verified security contact channels.

Notification failure must not create a second CredentialReset.

---

## Security notification should not contain secrets

No:

* new password,
* raw reset token,
* credential hash.

---

## Audit events

Material events might include:

```text
RecoveryRequested
RecoveryChallengeIssued
RecoveryChallengeVerified
CredentialResetCompleted
AuthenticationSessionsRevoked
RecoveryAttemptRateLimited
RecoveryTokenRevoked
```

according to security logging policy.

---

## Unknown-account attempts

Security telemetry can retain safe hashed/fingerprinted data for abuse detection without creating a canonical User or revealing existence externally.

---

## PII minimization

Recovery telemetry should minimize stored:

* raw email identifiers,
* IP/device data,

according to security, privacy and retention policy.

---

## Logging redaction

Explicitly redact:

* recovery tokens,
* OTP/challenge values,
* new credentials,
* recovery URLs containing secrets.

---

## Email-link scanner problem

Some security/email systems automatically open links.

Recovery should not perform the CredentialReset simply on token GET/open.

The token can establish/validate recovery context, but the sensitive state-changing credential reset requires the deliberate reset operation.

This prevents link scanners from consuming the recovery grant accidentally.

---

## GET must not perform reset

Critical:

```text
GET /recover?token=...
```

must not directly change Credential.

Credential mutation requires explicit protected state-changing request.

---

## CSRF/session architecture

The final CredentialReset mutation needs protections appropriate to the temporary recovery session/token architecture.

Do not rely merely on link possession plus an unprotected cross-site POST.

---

## Token exchange

Where practical:

```text
URL recovery token
      ↓
server validation
      ↓
short-lived server-side recovery context
      ↓
raw URL token no longer propagated
```

reduces leakage.

The exact UX remains frozen.

---

## Rate limiting tiers

Separate limits can govern:

1. recovery initiation;
2. token/challenge validation;
3. credential-reset submission.

This reduces brute force and email bombing.

---

## Enumeration-safe mail failures

Do not alter public response based on:

* mailbox exists,
* provider accepted email,
* account not found.

---

## Design 075 post-reset integration

After completion:

Design 075 performs canonical authentication.

Then:

```text
AuthenticationSession
      ↓
ClientPortalMembership resolver
```

decides Portal access.

---

## Deactivated membership case

Example:

```text
CredentialReset SUCCESS
↓
Sign In SUCCESS
↓
ClientPortalMembership = DEACTIVATED
↓
Portal authorization DENIED
```

This is correct architecture.

---

## Pending Invitation case

Example:

```text
CredentialReset SUCCESS
↓
Sign In SUCCESS
↓
Invitation still PENDING
↓
Design 076 required for explicit acceptance
```

Also correct.

---

## Historical evidence

Credential reset must never mutate:

```text
Message.sender
ContractSigner snapshot
SignatureEvidence
ApprovalDecision actor
Payment actor/history
AuditEvent historical actor
```

---

## Backend Requirement Matrix

| Requirement                                       | Status       |
| ------------------------------------------------- | ------------ |
| Canonical User reuse                              | **Critical** |
| Canonical AuthenticationIdentity reuse            | **Critical** |
| AuthenticationIdentity/Credential separation      | **Critical** |
| Recovery identifier/account existence separation  | **Critical** |
| Enumeration-safe initiation response              | **Critical** |
| Timing-enumeration mitigation                     | **Required** |
| RecoveryRequest entity                            | **Critical** |
| RecoveryRequest/RecoveryToken separation          | **Critical** |
| RecoveryToken/ActivationToken separation          | **Critical** |
| RecoveryToken/AuthenticationSession separation    | **Critical** |
| Purpose-bound recovery proof                      | **Critical** |
| Token bound to exact RecoveryRequest/AuthIdentity | **Critical** |
| High-entropy token                                | **Critical** |
| Secure token hashing/protected storage            | **Critical** |
| No raw token logging                              | **Critical** |
| Token expiry                                      | **Critical** |
| Token revocation                                  | **Critical** |
| Single-use consumption                            | **Critical** |
| Supersession/rotation policy                      | **Critical** |
| Token/challenge brute-force protection            | **Critical** |
| Recovery initiation rate limiting                 | **Critical** |
| Enumeration-safe delivery behavior                | **Critical** |
| Server-resolved recovery channel                  | **Critical** |
| CredentialReset entity/event                      | **Critical** |
| Server-side credential policy                     | **Critical** |
| Strong password hashing where applicable          | **Critical** |
| No plaintext credentials                          | **Critical** |
| Concurrent reset safety                           | **Critical** |
| Reset idempotency/reconciliation                  | **Critical** |
| GET does not mutate credential                    | **Critical** |
| Link-scanner safety                               | **Critical** |
| Session revocation/rotation after reset           | **Critical** |
| Refresh-session invalidation                      | **Critical** |
| Membership untouched by recovery                  | **Critical** |
| Role untouched by recovery                        | **Critical** |
| ResourceScope untouched by recovery               | **Critical** |
| Deactivated membership not reactivated            | **Critical** |
| Invitation untouched by recovery                  | **Critical** |
| No implicit Invitation acceptance                 | **Critical** |
| No new Portal Membership creation                 | **Critical** |
| Design 075 post-reset authentication reuse        | **Critical** |
| Design 076 strict token separation                | **Critical** |
| Safe internal redirect                            | **Critical** |
| CSRF/origin protections where applicable          | **Critical** |
| Recovery-token referrer leakage protection        | **Critical** |
| Audit/security events                             | **Critical** |
| Security notification after reset                 | **Required** |
| PII/log minimization                              | **Critical** |
| Historical evidence immutability                  | **Critical** |

---

# 8. Consolidation

Design 077 exposes several severe identity/security risks.

**User / AuthenticationIdentity conflation**
Changing a login email recreates or misidentifies the account.

**AuthenticationIdentity / Credential conflation**
Resetting password changes account identity.

**AuthenticationIdentity / Profile email conflation**
Mutable contact settings become recovery authority.

**AuthenticationIdentity / Invitation destination conflation**
Invitation email is treated as authentication recovery identity.

**Recovery identifier / account existence conflation**
Recovery form becomes user-enumeration endpoint.

**Generic confirmation / actual RecoveryRequest conflation**
UI confirms internal account existence accidentally.

**RecoveryRequest / RecoveryToken conflation**
Durable workflow and bearer secret become one record.

**RecoveryToken / ActivationToken conflation**
Password-reset link accepts Client Portal invitation.

**RecoveryToken / session token conflation**
Recovery link becomes permanent authenticated session.

**Token purpose confusion**
One secret works across multiple security endpoints.

**Valid token / arbitrary userId conflation**
Attacker resets a different account by changing payload.

**Browser-supplied recovery destination**
Attacker routes victim reset link to their own email.

**Raw recovery token database storage**
Database leak produces immediately usable reset links.

**Raw token logs/analytics**
Observability systems become credential stores.

**Predictable/low-entropy token**
Recovery link can be guessed.

**No expiry**
Old reset links remain valid indefinitely.

**Expired / revoked / consumed conflation**
Security history and replay handling become ambiguous.

**Token reuse**
One recovery link can repeatedly reset credentials.

**Multiple active recovery tokens without policy**
Old emails remain dangerous forever.

**Email scanner / token consumption conflation**
Automated link preview invalidates or executes recovery.

**GET / recovery mutation**
Opening a URL changes credential.

**Recovery request / account lock conflation**
Attacker email-bombs and disables legitimate accounts.

**No rate limiting**
Recovery flow enables enumeration and spam.

**Naïve hard lockout**
Attacker denies victim recovery intentionally.

**Challenge verification / session authentication conflation**
Proving reset authority becomes full Portal session.

**CredentialReset / User creation conflation**
Forgot-password flow creates duplicate User.

**CredentialReset / AuthenticationIdentity creation conflation**
Reset produces second login identity unnecessarily.

**CredentialReset / Membership creation conflation**
Recovery grants Portal access.

**CredentialReset / Membership activation conflation**
Deactivated Client member regains access just by resetting password.

**CredentialReset / PortalRole reset conflation**
Recovery changes permissions.

**CredentialReset / Project scope reset conflation**
Recovery broadens resource access.

**CredentialReset / Invitation acceptance conflation**
Pending invite becomes accepted.

**Credential reset / User suspension removal conflation**
Security suspension is bypassed.

**Session revocation / Membership deletion conflation**
Security response damages authorization relationships.

**Credential reset / existing session preservation**
Attacker with stolen session remains logged in after victim resets password.

**Visible-cookie revocation / refresh-token preservation**
Old session can regenerate itself.

**Reset success / Portal access restored conflation**
User is told everything is fixed even though Membership remains inactive.

**Reset success / sign-in success conflation**
Credential reset automatically creates normal session without policy.

**Reset response timeout / second reset conflation**
Credential rotates multiple times.

**New password confirmation / identity proof conflation**
Matching password fields are treated as authorization.

**Frontend-only password policy**
Invalid/weak Credential reaches backend.

**Plaintext credential logs**
New password leaks through diagnostics.

**Recovery email sent / challenge completed conflation**
Message delivery is considered identity proof.

**Notification failure / recovery failure conflation**
Credential resets twice because security email failed.

**Recovery token in referrer**
Third-party page learns reset secret.

**Open redirect after recovery**
Trusted recovery flow sends user to phishing site.

**Recovery telemetry / PII overcollection**
Sensitive identifier/device data is retained unnecessarily.

**Historical User rewrite**
Reset changes identity attached to old business records.

**Historical Message sender rewrite**
Old communication evidence changes.

**Historical Contract signer rewrite**
Legal signature identity changes after reset.

**Historical Approval actor rewrite**
Approval evidence becomes mutable.

**Historical Audit actor rewrite**
Security/business history loses integrity.

**077/075 duplicate authentication backend**
Recovery builds a second account/credential system.

**077/076 token-system conflation**
Invitation and Recovery tokens can be used interchangeably.

**077/062 access-governance bypass**
Recovery endpoint edits membership/role/scope.

No additional screen is required.

These are **identity recovery, anti-enumeration, recovery-token isolation, credential rotation, session revocation, privilege preservation, anti-replay, historical evidence, and account-takeover prevention requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT AUTHENTICATION-IDENTITY RECOVERY, CREDENTIAL RESET & SESSION-SECURITY ANCHOR**

**Domain directive:**
**User ≠ AuthenticationIdentity ≠ Credential ≠ RecoveryRequest ≠ RecoveryToken/Challenge ≠ CredentialReset ≠ AuthenticationSession ≠ ClientPortalMembership ≠ Invitation.**

**Reuse directive:**
Design 075 remains the single canonical User/AuthIdentity/Credential/Session foundation, Design 076 remains the Invitation acceptance foundation, and Design 077 only provides governed recovery of authentication control.

**Recovery-purpose directive:**
Design 077 recovers control of an existing AuthenticationIdentity. It never creates Client Portal authorization or determines which resources that User may access.

**Enumeration directive:**
the initial recovery response must not reveal whether the submitted identifier maps to a User, AuthenticationIdentity, Membership, Invitation, Organization, or no account at all.

**Identifier directive:**
a recovery identifier is lookup input only and never proof of account existence or ownership.

**Recovery-request directive:**
a canonical RecoveryRequest represents an internal recovery workflow for an eligible existing AuthenticationIdentity, while the public UI remains enumeration-safe even when no such identity exists.

**Token directive:**
RecoveryToken/Challenge is a high-assurance, single-purpose, short-lived recovery proof bound to one RecoveryRequest and AuthenticationIdentity. It is not an ActivationToken or AuthenticationSession.

**Purpose-isolation directive:**
Recovery tokens are explicitly purpose-bound to credential/access recovery and must fail if presented to Invitation activation, normal login/session, or unrelated security endpoints.

**Token-security directive:**
link-style tokens use cryptographically secure entropy, protected/hash-based server storage where appropriate, expiry, revocation, single-use consumption, replay protection and observability redaction.

**Challenge directive:**
shorter challenges/OTPs require strict attempt controls and rate limiting; challenge success proves recovery authority only and does not itself establish Portal authorization.

**Recovery-channel directive:**
the server chooses the verified recovery destination. The requester cannot redirect recovery messages to an arbitrary address through request tampering.

**Credential directive:**
successful recovery creates/rotates the canonical Credential for the existing AuthenticationIdentity using server-side security policy and secure password/authenticator handling. Raw credentials never enter logs, Audit or analytics.

**User directive:**
CredentialReset does not create another User or silently merge accounts.

**Membership directive:**
ClientPortalMembership is outside the CredentialReset transaction. Active, restricted, suspended or deactivated membership state remains exactly as it was.

**Deactivation directive:**
a deactivated Portal membership stays deactivated after successful credential recovery. Resetting a password is never a Portal reactivation mechanism.

**Role directive:**
PortalRoleAssignment remains unchanged.

**Scope directive:**
Project/resource scope remains unchanged.

**Invitation directive:**
pending Invitations remain pending. Recovery cannot consume, accept, regenerate, or modify Design 076 Invitation grants.

**Session directive:**
successful security recovery triggers the configured AuthenticationSession revocation/rotation policy so previously compromised sessions cannot continue indefinitely. Session lifecycle remains separate from Membership lifecycle.

**Fresh-auth directive:**
after recovery, Design 075 remains responsible for normal authentication/session establishment unless the frozen/authentication policy explicitly establishes a separate verified fresh session. Token consumption alone is never treated as durable login.

**Idempotency directive:**
CredentialReset, recovery-token consumption and session-security effects are transactional/replay-safe enough that network retry cannot perform repeated credential rotations.

**Concurrency directive:**
two tabs/requests using the same recovery proof cannot both independently reset the Credential.

**Link-scanner directive:**
opening a recovery link never by itself mutates the Credential; state-changing reset requires a deliberate protected reset operation.

**Rate-limit directive:**
recovery initiation, challenge validation and reset submission have separate abuse controls to reduce enumeration, token brute force, email bombing and denial-of-service.

**Session-revocation directive:**
revocation must include relevant refresh/derived credentials rather than merely deleting one visible browser session token.

**Authorization directive:**
after successful recovery and subsequent authentication, Design 062/current authorization still decides whether the User has an active Client Portal context and which resources are authorized.

**Historical-evidence directive:**
credential recovery never rewrites stable User identity or historical Message authorship, ContractParty/Signer/Signature evidence, Approval actors, Payment evidence, Activity or Audit history.

**Audit directive:**
RecoveryRequest creation where applicable, challenge validation, CredentialReset, token revocation/consumption and session revocation generate safe security evidence without recording recovery secrets or new credentials.

**Notification directive:**
post-reset security notifications are side effects of canonical recovery completion. Their delivery failure never causes another reset and never changes Membership/access state.

**Failure directive:**
account-not-found internally, provider/mail outage, invalid challenge, expired token, consumed token, reset failure, session-revocation failure, inactive Membership and pending Invitation remain separate backend facts even though unauthenticated external messaging intentionally conceals some of them.

**Responsive directive:**
desktop/tablet/mobile preserve a focused enumeration-safe recovery flow, semantic credential fields, password-manager compatibility, accessible validation and clear expiry/failure treatment without exposing account/Organization details prematurely.

**Overlap directive:**
Designs **037, 039, 059, 062 and 075–077** must ultimately consume one canonical User + AuthenticationIdentity + Credential + Session + Membership + Invitation security foundation, with authentication recovery, invitation activation and authorization kept deliberately independent.

**Consolidation directive:**
**STANDARDIZE ONE AUTHENTICATION RECOVERY PIPELINE — CANONICAL USER/AUTHENTICATIONIDENTITY + ENUMERATION-SAFE RECOVERY REQUEST + PURPOSE-BOUND HIGH-ENTROPY RECOVERYTOKEN/CHALLENGE + SINGLE-USE/EXPIRING/REVOCABLE PROOF + SERVER-VALIDATED CREDENTIALRESET + SECURE CREDENTIAL ROTATION + REQUIRED SESSION REVOCATION/SECURITY-REVISION UPDATE + AUDIT/SECURITY NOTIFICATION — WHILE NEVER CREATING, REACTIVATING OR MODIFYING CLIENTPORTALMEMBERSHIP, PORTAL ROLE, RESOURCE SCOPE OR INVITATION STATE. RECOVERY RESTORES AUTHENTICATION CONTROL; IT DOES NOT RESTORE OR ESCALATE AUTHORIZATION.**

---

## Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **77 / 153** |
| **PASS**                                   |                         **77** |
| **STANDARDIZE decisions**                  |                         **75** |
| **Potential implementation-overlap flags** |                         **68** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**77 / 153 = 50.3% audited.**

The locked **Client Portal sequence through Designs 041–077 is now complete**, including its final authentication/access boundary.

Canonical Client access architecture is now:

```text
                         USER
                          │
                          ↓
               AuthenticationIdentity
                          │
              ┌───────────┴───────────┐
              ↓                       ↓
          Credential            RecoveryRequest
              │                       │
              │                 RecoveryToken
              │                       │
              │                 CredentialReset
              │                       │
              └───────────┬───────────┘
                          ↓
               AuthenticationSession
                          │
                          ↓
                ClientPortalMembership
                          │
               ┌──────────┴──────────┐
               ↓                     ↓
        PortalRoleAssignment     ResourceScope
               │                     │
               └──────────┬──────────┘
                          ↓
                     Authorization
```

While Invitation remains a different path:

```text
Invitation
    ↓
ActivationToken
    ↓
Design 076 Acceptance
    ↓
ClientPortalMembership

RecoveryToken can never enter this path.
```

And the final security distinction for Designs 075–077 is:

```text
DESIGN 075 — SIGN IN
Prove who you are.
        │
        ↓
AuthenticationSession

DESIGN 076 — ACCEPT INVITE
Accept one exact pending access grant.
        │
        ↓
ClientPortalMembership / Role / Scope

DESIGN 077 — RECOVER ACCESS
Recover control of an existing authentication identity.
        │
        ↓
CredentialReset / Session Security

Authentication ≠ Activation ≠ Recovery ≠ Authorization
```

## Next Sequential Audit Target

### **Design 078 — My Work / Personal Work Queue**

The next Phase 3A.1 audit now moves beyond the completed Client Portal sequence to **Design 078**, while keeping the audit contract unchanged:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no redesign, no extra screen, no skipping and no sequence change.**
