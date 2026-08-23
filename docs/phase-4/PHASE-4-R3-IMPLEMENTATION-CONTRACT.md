# Phase 4 — R3 Implementation Contract

## Authentication, Sessions, MFA, Invitations & Account Recovery

**Contract:** P4-R3-G0  
**Date:** August 23, 2026  
**Status:** IMPLEMENTED — P4-R3-C1 AWAITING REVIEW  
**Depends on:** Accepted P4-R1-C1 and P4-R2-C1  
**Next stage:** R4 remains locked

## 1. Purpose

R3 replaces the prototype authentication simulations with a real server-side identity and session boundary. It proves identity, manages revocable sessions, consumes explicit invitations, recovers credentials, and establishes TOTP MFA foundations without conflating authentication with tenant selection or permission evaluation.

The governing separation is:

> Person ≠ User Account ≠ Authentication Identity ≠ Credential ≠ Session ≠ Invitation ≠ Recovery Challenge ≠ Membership ≠ Tenant Context ≠ Authorization.

The R1 route registry remains the source of truth for Designs 001–153. R3 preserves the existing visual design, creates no Design 154, and does not connect business fixtures to real domain data.

## 2. Authoritative inputs

- P4-R0 findings F001 and F006;
- the accepted R1 fail-closed route/configuration/request-context boundary;
- the accepted R2 `iam`, `platform`, and `audit` persistence foundation;
- Designs 075–077 and their frozen sign-in, explicit invitation activation, and recovery boundaries;
- the platform identity/session API contract in Phase 2F;
- installed Next.js 16 guidance requiring server validation, server-set cookies, secure data-access checks, and treating Route Handlers as public endpoints;
- current OWASP password, authentication, session, recovery, and MFA guidance;
- RFC 4226/6238 for standards-based TOTP verification.

## 3. Authentication model

R3 supports the existing password identity provider and database sessions:

```text
normalized login identifier
  → UserIdentity(provider = PASSWORD)
  → immutable password-credential version
  → UserAccount state
  → optional TOTP challenge
  → fresh opaque database Session
  → minimum Team/Client membership-surface check
  → protected route
```

- Login identifiers come only from `UserIdentity.providerSubject`, never CRM Contacts, profiles, notification destinations, or email domains.
- Passwords are never stored or logged. They are salted and hashed with Node scrypt using an OWASP-listed profile (`N=32768`, `r=8`, `p=3`) and constant-time comparison.
- Unknown identities perform the same password-hash work and receive the same public failure as wrong passwords, disabled accounts, or unavailable memberships.
- Authentication never accepts browser-supplied role, permission, organization authority, or tenant scope.
- Social/SSO controls remain non-operational until their provider stage; R3 does not fake those providers.

## 4. Session contract

- Generate a new opaque 256-bit random token after successful authentication or completed MFA; never reuse a pre-authentication token.
- Store only a SHA-256 token hash in PostgreSQL.
- Send the raw token only in a server-set `HttpOnly`, `Secure` in production, `SameSite=Lax`, path-scoped, high-priority cookie.
- Verify the session server-side against token hash, expiry, revocation, account state, and minimum Team/Client membership surface.
- Logout revokes the database row before expiring the cookie.
- Password recovery revokes all existing sessions for that account and does not automatically create a new one.
- Protected route access remains fail-closed when authentication configuration or database verification fails.
- Proxy performs the early route check; reusable server-only verification is also available to future data/command boundaries. Proxy is not declared the eventual sole authorization control.

## 5. Minimum membership boundary

R3 may determine only whether an authenticated account has one eligible active membership for the requested surface:

- `STAFF` may enter `/app/*`;
- `CLIENT` may enter `/client/*`;
- suspended, ended, invited-only, cross-surface, missing, or ambiguous membership states fail closed.

R3 does not select an organization/workspace context, set PostgreSQL tenant context, evaluate roles/permissions, or authorize resources. Multiple eligible memberships return a context-selection-required result and remain denied until R4 implements trusted selection.

## 6. Invitations and activation

- Invitation tokens are cryptographically random, stored only as hashes, time-bound, purpose-bound, revocable, and single-use.
- Viewing an activation URL returns only a client-safe invitation projection.
- Acceptance uses one serializable transaction and cannot be replayed.
- New-account activation creates the canonical Person, UserAccount, password identity/credential, explicit membership, intended role assignment, invitation acceptance timestamp, terms timestamp, and audit evidence.
- An existing account must authenticate and explicitly accept; ordinary sign-in never consumes a pending invitation.
- Invitation email/domain knowledge never grants membership.
- R3 implements token validation/consumption; invitation administration and provider delivery remain later authorized work.

## 7. Recovery

- Recovery request responses are generic and timing-resistant whether or not an account exists.
- Per-identifier and per-network throttles prevent unbounded requests without disclosing thresholds.
- Recovery tokens are 256-bit random values stored only as hashes, expire after 60 minutes, and are single-use.
- The raw token is passed only to a server-side delivery port. R3 provides a sealed outbox payload for later delivery integration and never logs or returns it from the public request endpoint.
- Completion validates token, password confirmation/policy, and transactionally adds a new immutable password version, consumes the challenge, revokes all sessions, and records security evidence.
- Recovery cannot create or elevate membership and does not automatically sign the user in.

## 8. MFA foundation

- R3 supports standards-based 6-digit TOTP with a 30-second period and a one-step clock window.
- TOTP seeds are generated from a cryptographically secure source and stored only as authenticated AES-256-GCM ciphertext under a versioned server key.
- Enrollment is pending until a valid code proves possession; disabled/unverified methods never challenge login.
- Password success for an account with an active TOTP method creates a short-lived, single-use MFA challenge—not a session.
- Challenge attempts are strictly limited, expire quickly, are invalidated on success, and are never logged with submitted codes.
- Recovery-code and WebAuthn records remain schema-compatible concepts only unless separately evidenced; R3 does not pretend they are operational.

## 9. HTTP and configuration boundary

R3 may expose only the identity endpoints required by this contract:

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
GET  /api/v1/auth/session
POST /api/v1/auth/mfa/enroll
POST /api/v1/auth/mfa/confirm
POST /api/v1/auth/mfa/verify
GET  /api/v1/auth/invitations/[token]
POST /api/v1/auth/invitations/[token]
POST /api/v1/auth/recovery/request
POST /api/v1/auth/recovery/complete
```

- Every mutation validates JSON/content type, body size, schema, and same-origin request metadata.
- Responses use generic problem details and never serialize password hashes, raw stored tokens, TOTP seeds after enrollment, internal account state, memberships beyond the required client-safe projection, or secrets.
- Auth configuration has two explicit modes: `deny-all` and `sessions`. Missing/invalid session-mode configuration resolves to `deny-all`.
- Session mode requires PostgreSQL, an approved public origin, and versioned server cryptographic key material. Secrets remain server-only and uncommitted.

## 10. Security evidence and throttling

- Authentication attempts are append-only and store normalized-identifier/IP hashes rather than raw values.
- Login, logout, session revocation, MFA enrollment/verification, invitation acceptance, recovery request, and recovery completion create chronological security/audit evidence where an organization/actor can be resolved.
- Rate-limit decisions use persisted attempt evidence and fail closed on security-storage errors.
- Raw passwords, session tokens, invitation tokens, recovery tokens, TOTP seeds, and OTP codes never appear in logs, audit metadata, client props, or exception messages.

## 11. R3 exclusions

- organization/workspace context selection, tenant RLS binding, or cross-tenant resource access (R4);
- role/permission evaluation, field policy, client-safe domain projection, or impersonation (R5);
- CRM, commercial, project, finance, publishing, reporting, automation, or other business workflows;
- external OAuth/OIDC/SAML, email, SMS, push, or secrets-manager provider integrations;
- broad API/domain repositories or business UI data binding;
- visual redesign, Design 154, or mutation of frozen Designs 001–153;
- R4 or any later remediation stage.

## 12. Objective acceptance criteria

P4-R3-C1 may be established only when all criteria are evidenced:

1. P4-R2-C1 is recorded as accepted and R3 remains bounded by this contract.
2. A forward-only R3 migration adds only approved authentication persistence, constraints, indexes, and immutable attempt/credential history; clean deploy and drift checks pass.
3. Password creation/verification uses the locked scrypt profile, unique salts, constant-time comparison, input limits, and no plaintext storage/logging.
4. Login is enumeration-resistant, persistently throttled, account-state aware, surface-membership aware, and creates a fresh revocable database session only after all required factors pass.
5. Session cookies and server verification enforce hash lookup, expiry, revocation, account state, surface, and fail-closed configuration; logout and all-session revocation work.
6. R1 protected routes accept only verified eligible sessions; forged, expired, revoked, wrong-surface, ambiguous-membership, and arbitrary cookies remain denied while public routes remain public.
7. Invitation inspection/acceptance is client-safe, expiring, revocable, atomic, explicit, and single-use; ordinary login never consumes an invitation.
8. Recovery is generic, rate-limited, single-use, expiring, delivery-port isolated, changes credentials atomically, revokes sessions, and never creates membership or an automatic session.
9. TOTP enrollment, encrypted seed storage, confirmation, login challenge, attempt limit, expiry, replay prevention, and session issuance after successful MFA are tested.
10. Security events are append-only/redacted; targeted scans find no committed credentials, raw tokens, OTP seeds/codes, or environment files.
11. Unit, database integration, HTTP/security, browser, R1/R2 regression, ESLint, strict TypeScript, production build, migration/drift, backup-aware, and dependency-security checks pass.
12. P4-R3-C1 records files, routes, schema/migration, security evidence, test/browser results, unresolved risks, and surgical rollback, then stops before R4.

## 13. Gate state

```text
P4-R2-C1 accepted
  → P4-R3-G0 authorized
  → R3 implementation only
  → P4-R3-C1 checkpoint
  → STOP
  → R4 remains locked
```
