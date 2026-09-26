# Phase 4 — R3 Checkpoint

## Authentication, Sessions, MFA, Invitations & Account Recovery

**Checkpoint:** P4-R3-C1  
**Date:** August 23, 2026  
**Status:** REVIEWED AND ACCEPTED  
**Authorized scope:** R3 only  
**R4 status:** AUTHORIZED — R4 ONLY

R3 replaces the protected Team Workspace and Client Portal authentication fixtures with a real server-side password, session, invitation, recovery, and TOTP boundary. It preserves the frozen Designs 001–153 and introduces no Design 154, tenant selector, RBAC evaluator, business workflow, or provider integration.

P4-R3-C1 has now been independently re-reviewed and accepted on September 26, 2026 after source-level remediation, repeatable GitHub qualification, and real Chromium inspection against the production build. The earlier browser-runtime limitation is resolved by a dedicated GitHub Actions Chromium harness with retained screenshots. R4 is now authorized as the next stage only; this checkpoint does not implement R4.

## 1. Acceptance summary

| # | R3 acceptance criterion | Result | Evidence |
| --- | --- | --- | --- |
| 1 | Accepted R2 baseline and bounded R3 contract | PASS | P4-R2-C1 records R3 authorization; `PHASE-4-R3-IMPLEMENTATION-CONTRACT.md` freezes scope and keeps R4/R5 separate. |
| 2 | Forward-only authentication migration, clean deploy, status, verification, and drift | PASS | Clean PostgreSQL 16.13 rebuild applied R2 then `20260823190000_r3_authentication`; verification reports 31 total tables, 4 R3 auth tables, 9 immutable triggers; status is current and drift reports no difference. |
| 3 | Locked scrypt password profile, unique salts, input policy, no plaintext storage | PASS | Node scrypt `N=32768, r=8, p=3`, 16-byte salt, 32-byte result, constant-time verification, malformed-input rejection, dummy-hash path; unit and database tests pass. |
| 4 | Enumeration-resistant, throttled, state/surface-aware login | PASS | Unknown/wrong credentials share the same result; persistent identifier/IP throttles pass; active account, organization, membership, single-surface context, and MFA checks occur before session issuance. |
| 5 | Opaque revocable sessions and secure cookies | PASS | 256-bit random token, SHA-256 database hash, fresh issuance, 12-hour/30-day expiry, `HttpOnly`, production `Secure`, `SameSite=Lax`, host-scoped cookie; expiry, forgery, account/org state, revocation, logout, and recovery revocation are tested. |
| 6 | R1 protected routes accept only verified eligible sessions | PASS | Production HTTP verification proves anonymous denial, real authenticated `/app/*` access, forged/revoked denial, wrong-surface denial, public auth availability, and no Proxy bypass for an arbitrary route. |
| 7 | Explicit, atomic, client-safe, single-use invitations | PASS | Hashed 256-bit tokens, safe inspection, expiry/revocation checks, serializable acceptance, terms timestamp, intended role, audit evidence, replay denial, existing-account proof, and ordinary-login non-consumption are tested. |
| 8 | Generic, expiring, single-use recovery with global revocation | PASS | Known/unknown public responses match; token is hash-stored and AES-GCM sealed in outbox; immutable credential version advances atomically; prior credential remains; sessions revoke; replay and old password fail. |
| 9 | Encrypted TOTP enrollment and login challenge | PASS | RFC 6238 vector, secure seed generation, AES-256-GCM at rest, enrollment proof, short-lived single-use challenge, failed-attempt cap, replay denial, and MFA-bound session issuance are tested. |
| 10 | Append-only/redacted security evidence and secret scan | PASS | Three new immutable triggers reject update/delete; raw values are absent from attempt/audit evidence; no environment file is tracked; targeted secret-logging scan is clean. |
| 11 | Unit, database, HTTP, browser, regression, build, security, and backup checks | PASS | Exact-head GitHub qualification run `36256956008` passes database/security/build/dependency gates. Chromium run `36256955997` passes 13 screenshot/interaction scenarios against production `next start`, with zero substantive console errors and zero unexpected network failures. |
| 12 | Checkpoint records scope, evidence, risks, rollback, and stop | PASS | This document. R4 is explicitly not authorized. |

## 2. Implemented authentication boundary

```text
normalized password identity
  → immutable credential version
  → active user account
  → exactly one eligible Team or Client membership
  → optional single-use TOTP challenge
  → fresh opaque database session
  → server-set session cookie
  → R1 protected route
```

Identity proof remains separate from later boundaries:

```text
R3 identity-authenticated context
  ≠ R4 selected tenant/workspace context
  ≠ R5 effective role/permission authorization
```

R3 permits only the minimum membership distinction needed to deny invalid, suspended, ended, cross-surface, missing, or ambiguous access. It does not claim that a user is authorized to read or mutate a domain resource.

## 3. HTTP surface

R3 adds only the authorized identity endpoints:

| Method | Route | Responsibility |
| --- | --- | --- |
| `POST` | `/api/v1/auth/login` | Password proof, persistent throttling, optional MFA challenge, session issue |
| `POST` | `/api/v1/auth/logout` | Database revocation and cookie expiry |
| `GET` | `/api/v1/auth/session` | Client-safe verified-session projection |
| `POST` | `/api/v1/auth/mfa/enroll` | Begin authenticated TOTP enrollment |
| `POST` | `/api/v1/auth/mfa/confirm` | Prove and activate pending TOTP method |
| `POST` | `/api/v1/auth/mfa/verify` | Consume login challenge and issue MFA session |
| `GET` | `/api/v1/auth/invitations/[token]` | Client-safe invitation inspection |
| `POST` | `/api/v1/auth/invitations/[token]` | Explicit single-use invitation acceptance |
| `POST` | `/api/v1/auth/recovery/request` | Generic request and sealed outbox handoff |
| `POST` | `/api/v1/auth/recovery/complete` | Atomic credential rotation and all-session revocation |

Every mutation requires same-origin JSON, validates body size and schema, returns no-store responses, and uses generic problem details. Unconfigured Google/Microsoft controls are disabled rather than simulated.

## 4. Persistence and integrity changes

The R3 migration adds:

- `iam.password_credentials` — immutable salted password versions;
- `iam.authentication_attempts` — append-only hashed attempt evidence;
- `iam.authentication_secrets` — immutable versioned AES-GCM ciphertext;
- `iam.mfa_challenges` — expiring single-use enrollment/login challenges;
- required session surface and authentication-method columns;
- optional session MFA verification timestamp;
- invitation terms-acceptance timestamp;
- recovery surface, identifier/IP hashes, and bounded attempt count;
- required constraints, indexes, foreign keys, and three immutable triggers.

The clean migration rehearsal caught and corrected a pre-application constraint defect: MFA verification occurs immediately **before** session issuance, so `mfa_verified_at` must be less than or equal to `issued_at`. The erroneous ordering was corrected in the reviewed migration, the disposable database was rebuilt from empty, and the full suite then passed. No shared database received the incorrect constraint.

## 5. Password and session security

- Passwords accept at most 1,024 UTF-8 bytes and new passwords require at least 12 characters and reject a small common-password blocklist.
- Every password version receives a unique 16-byte salt and the locked scrypt work profile.
- Unknown identities execute the same expensive dummy-hash verification path.
- Attempt evidence stores keyed hashes of normalized identifiers and IP signals, not raw identifiers or passwords.
- Session tokens contain 32 random bytes; only SHA-256 hashes are stored.
- Session verification checks token hash, expiry, revocation, account state/lock, active membership, surface, membership end state, and organization state.
- Missing or invalid session configuration resolves to `deny-all`.
- Recovery rotates the credential reference, preserves prior immutable versions, revokes every active session, and creates no replacement session.

## 6. Invitation, recovery, and MFA evidence

### Invitations

- inspection reveals only organization name, intended role name, expiry, and surface;
- a new account, identity, credential, membership, role assignment, terms timestamp, and session are created in one serializable transaction;
- an existing account must present its own verified session before acceptance;
- a Team session may prove the same identity accepting a Client invitation without converting that Team session into Client access;
- accepting an already-held active role does not create a duplicate live role grant;
- replay, revoked, expired, or already-consumed tokens fail.

### Recovery

- known and unknown requests both return the same `202` response;
- a 256-bit recovery token is hash-stored and delivered only as an AES-GCM-sealed outbox payload;
- only the delivery worker with the server key can recover the raw token;
- completion is single-use and atomic, increments immutable credential history, and revokes sessions;
- provider delivery remains deferred; R3 does not fake email delivery.

### TOTP

- secure 20-byte seed, Base32 encoding, HMAC-SHA1 HOTP/TOTP, six digits, 30-second period, ±1 step;
- authenticated encryption binds the seed to secret and account IDs;
- enrollment remains unverified until the user supplies a valid current code;
- successful password proof creates a challenge rather than a session when TOTP is active;
- challenge expiry, attempt limit, consumption, replay prevention, and `password+totp` session evidence are enforced.

## 7. Production HTTP and semantic-render evidence

The repeatable verifier ran against a production `next start` process and disposable PostgreSQL database:

```text
20 checks passed
public Team sign-in: pass
frozen Team/Client sign-in, activation, and recovery HTML: pass
sample activation password absent: pass
anonymous protected-route denial: pass
same-origin/content-type boundary: pass
wrong/unknown credential response equivalence: pass
secure session-cookie attributes: pass
authenticated Team route: pass
arbitrary unmapped route remains 404 after auth: pass
Team session denied from Client surface: pass
known/unknown recovery response equivalence: pass
logout database revocation: pass
```

The production server and disposable `.env.local` used for this check were stopped and removed afterward. No environment file is tracked.

## 8. Database, backup, and dependency evidence

| Evidence | Result |
| --- | --- |
| PostgreSQL | `16.13` disposable local container |
| Clean migration order | R2 foundation → R3 authentication |
| Catalog | 31 total foundation/auth tables, 2 resource RLS policies, 9 immutable triggers |
| R3 catalog | 4 authentication tables, 3 R3 immutable triggers, 3 required session columns |
| Drift | No difference detected |
| Backup format | PostgreSQL custom format, no owner/privileges |
| Backup SHA-256 | `9f3f5747d9a26766d8571a6639a9f0188652be03efd7677ac02cea9b6e1f768e` |
| Restored source/target counts | attempts 32, sessions 10, credentials 8, audit events 21 — exact match |
| Restored verification | PASS for R2 and R3 catalog/integrity checks |
| Dependency audit | `npm audit --omit=dev` — 0 vulnerabilities |

The backup artifact and restore database were disposable validation resources, not production backups. Production encryption, off-site retention, schedules, and RTO/RPO remain later certification work.

## 9. Automated validation evidence

| Command / check | Result |
| --- | --- |
| `npm run db:validate` | PASS — schema valid |
| `npm run db:generate` | PASS — Prisma 7.9.1 client generated |
| Clean `npm run db:migrate:deploy` | PASS — R2 and R3 from empty PostgreSQL 16.13 |
| `npm run db:migrate:status` | PASS — up to date |
| `npm run db:verify` | PASS — R2 and R3 catalog checks |
| `npm run db:drift` | PASS — no difference detected |
| `npm test` | PASS — 10 files, 61 tests |
| `npm run test:db` | PASS — 2 files, 20 live PostgreSQL tests |
| R3 production HTTP verifier | PASS — 20 checks |
| `npm run lint` | PASS — exit 0 |
| `npm run typecheck` | PASS — strict TypeScript, exit 0 |
| `npm run build` | PASS — Next.js 16.3.0, 428 routes, Proxy present |
| `npm audit --omit=dev --audit-level=high` | PASS — 0 vulnerabilities |
| Native backup/restore | PASS — restored verification and row parity |
| Targeted secret-logging scan | PASS — no raw credential/token/OTP logging pattern |
| Tracked environment-file check | PASS — none |
| Interactive browser screenshot/visual check | PASS — Chromium run `36256955997`, 13 retained screenshots, production `next start` |

### September 26 review addendum

- Exact accepted review head before closure-doc updates: `c03c4eb97675a189837ca31cebeafb0fef79eb13`.
- GitHub R3 Review Qualification run: `36256956008` — PASS.
- GitHub R3 Browser Qualification run: `36256955997` — PASS.
- Browser artifact: `r3-browser-evidence`, artifact ID `10911062071`, SHA-256 digest `f20a15d8784bb829a80f8b3a77aea436aab3cd95e736d1513a8ee08315bb1952`.
- 13 screenshots cover desktop/mobile Team login, Client login, invitation before/after acceptance, recovery, authenticated destinations, cross-surface denial, and anonymous protected-route redirect.
- Review remediation also upgraded the accepted dependency graph to `next@16.3.6`, `mysql2@3.24.4` override, and `sharp@0.35.4` override after current advisories were detected.
- Invitation terms layout was visually repaired before acceptance.
- The speculative `/app/projects` prefetch gap is explicitly deferred outside R3.

## 10. Files changed by R3

### Contract and checkpoint

- `docs/phase-4/PHASE-4-R2-CHECKPOINT.md`
- `docs/phase-4/PHASE-4-R3-IMPLEMENTATION-CONTRACT.md`
- `docs/phase-4/PHASE-4-R3-CHECKPOINT.md`
- `docs/phase-4/README.md`

### Schema and verification

- `prisma/schema.prisma`
- `prisma/migrations/20260823190000_r3_authentication/migration.sql`
- `prisma/migrations/20260823190000_r3_authentication/verify.sql`
- `prisma/migrations/20260823190000_r3_authentication/DEPLOYMENT.md`
- `scripts/database/verify-database.ts`
- `src/modules/persistence/r2-foundation.database.test.ts`

### Authentication runtime

- `src/modules/authentication/index.ts`
- `src/modules/authentication/types.ts`
- `src/modules/authentication/configuration.ts`
- `src/modules/authentication/request-context.ts`
- `src/modules/authentication/service.ts`
- `src/modules/authentication/crypto/password.ts`
- `src/modules/authentication/crypto/tokens.ts`
- `src/modules/authentication/crypto/sealed-secret.ts`
- `src/modules/authentication/crypto/totp.ts`
- `src/modules/authentication/http/request-security.ts`
- `src/modules/authentication/http/session-cookie.ts`

### Routes and R1 integration

- `src/app/api/v1/auth/**`
- `src/proxy.ts`
- `src/modules/foundation/request-context.ts`
- `src/modules/foundation/config/security-boundary.ts`
- `src/modules/README.md`

### Frozen auth-screen binding

- `src/components/auth/auth-forms.tsx`
- `src/components/auth/auth-page.tsx`
- `src/app/forgot-password/page.tsx`
- `src/components/workspace/client-auth-screens.tsx`
- `src/app/client/login/page.tsx`
- `src/app/client/activate/[token]/page.tsx`
- `src/app/client/recover-access/page.tsx`

### Tests and repeatable validation

- `src/modules/authentication/configuration.test.ts`
- `src/modules/authentication/crypto/password.test.ts`
- `src/modules/authentication/crypto/authentication-crypto.test.ts`
- `src/modules/authentication/r3-authentication.database.test.ts`
- `src/modules/foundation/config/security-boundary.test.ts`
- `src/proxy.test.ts`
- `src/testing/server-only.ts`
- `vitest.config.mts`
- `vitest.database.config.mts`
- `scripts/authentication/create-r3-http-fixture.ts`
- `scripts/authentication/verify-r3-http.ts`

The worktree also contains substantial pre-existing design, audit, R1, and R2 changes. R3 did not reset, delete, or claim unrelated user work.

## 11. Unresolved risks and deliberate deferrals

1. **Workspace route completeness remains broader than R3.** Chromium recorded a speculative prefetch 404 for `/app/projects`; the shell references that root but repository history contains no root page. Direct R3 navigation/API/asset checks have zero unexpected failures. The missing Projects index is a pre-existing workspace follow-up and must not be misrepresented as R3 authentication work.
2. **R4 tenant/workspace selection is not implemented.** Multiple eligible memberships fail closed instead of being selected implicitly.
3. **R5 authorization is not implemented.** An authenticated session is not evidence of role, permission, record, field, export, approval, or financial authority.
4. **Provider delivery is not implemented.** Recovery produces a sealed outbox event; no email/SMS provider or worker was authorized.
5. **OAuth/OIDC/SAML and WebAuthn are not operational.** Corresponding UI controls remain disabled or deferred.
6. **TOTP enrollment has an API but no broad settings-page binding.** Adding that business/settings UI was outside R3.
7. **The public editorial member/signup experience remains a separate prototype.** Its email-only `localStorage` fixture is not trusted by `/app` or `/client`, but it requires its own later product decision and implementation stage.
8. **The cryptographic key boundary supports version tagging but not a multi-version keyring.** Production rotation/retirement procedures remain hardening work.
9. **Forwarded IP metadata requires a trusted reverse-proxy deployment contract.** Application throttling must not trust arbitrary client-supplied forwarding headers in production.
10. **Proxy is only the early route boundary.** R4/R5 data and command boundaries must independently bind tenant and authorization context.
11. **The database evidence used the owner connection.** R4 must install and prove the restricted runtime role and tenant context.
12. **The wider application remains fixture-backed.** R3 does not make CRM, projects, finance, publishing, reporting, or operations production-backed.
13. **The worktree is not clean.** Pre-existing uncommitted work prevents a safe automatic standalone R3 Git checkpoint.

## 12. Rollback instructions

Prefer a reviewed `git revert` after R3 is committed separately. Until then, avoid broad reset, checkout, clean, or recursive deletion because the worktree contains unrelated user work.

Immediate safe containment:

1. set `PERSPECTIVE_AUTH_BOUNDARY_MODE=deny-all` and restart the application;
2. confirm `/app/*` and protected `/client/*` return to the R1 fail-closed redirect behavior;
3. revoke active database sessions with a reviewed forward operation if any were issued outside disposable validation;
4. preserve authentication attempts, audit events, password history, and encrypted secret evidence.

Surgical pre-commit rollback:

1. restore only the R3 modifications listed in Section 10, preserving accepted R1/R2 content;
2. restore R1 Proxy behavior and request-context contracts only after setting the boundary to `deny-all`;
3. remove only the R3 API routes, authentication module, R3 tests/scripts, UI bindings, contract, and checkpoint;
4. reconcile Prisma generated output and rerun R1/R2 validations;
5. never use a destructive down migration on a shared database.

If the R3 migration has reached a shared database, use an explicitly reviewed forward recovery migration or restore to a separately provisioned verified R2 database. Do not delete immutable security evidence in place.

## 13. Review gate

```text
P4-R2-C1 accepted
  → P4-R3-G0 authorized
  → R3 implementation complete
  → R3 remediation and requalification complete
  → Chromium visual/browser qualification PASS
  → P4-R3-C1 reviewed and accepted
  → R4 authorized — R4 only
```

This checkpoint authorizes **R4 tenancy/workspace isolation only** as the next stage. R5 authorization, business workflows, provider integrations, and Design 154 remain unauthorized.
