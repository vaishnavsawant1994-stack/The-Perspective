# Phase 4 — R4 Acceptance Checkpoint

## P4-R4-C1 — Organization Context Selection & Tenant Isolation

**Date:** September 26, 2026  
**Repository:** `vaishnavsawant1994-stack/The-Perspective`  
**Branch:** `phase4/r4-tenancy-isolation-20260926`  
**Frozen R3 baseline:** `f41485f22d8f6fbed18d9d0a03d8fc1d1ef5a9dd`  
**Qualified R4 implementation head:** `1b9af3efef5a14498e95cec3497c9b7f57370eb0`  
**Checkpoint:** P4-R4-C1  
**Status:** ACCEPTED  
**R5 status:** NOT YET IMPLEMENTED — separately authorized only after this checkpoint is merged

## 1. Scope accepted

R4 establishes the organization-context and tenant-isolation boundary between authenticated identity and future R5 authorization.

The accepted model is:

```text
identity proof
  → authenticated session
  → zero/one/multiple eligible memberships
  → explicit organization context when required
  → selected membership + organization bound server-side
  → tenant-scoped request context
  → restricted PostgreSQL runtime role + transaction-local tenant claims
  → RLS-enforced resource visibility
  → R5 authorization remains separate
```

No persisted `Workspace` entity was introduced. Per the Phase-2 data architecture, `Organization` remains the durable tenant boundary; Team Workspace and Client Portal remain product/API surfaces.

## 2. Authentication/context behavior accepted

R4 now supports two authenticated session states:

- `selection-required`: identity is authenticated but no organization context is selected;
- `selected`: one server-verified membership and organization are bound to the session.

Accepted behavior:

- zero eligible memberships fail closed;
- one eligible membership preserves the R3 direct-login behavior;
- multiple eligible memberships create an authenticated but unselected session;
- unselected sessions cannot access protected Team/Client business routes;
- eligible contexts are returned only after identity/MFA proof;
- the browser submits only a membership ID for context selection;
- the server revalidates account ownership, surface, membership state, organization state, session state and expiry;
- fabricated, foreign-account, wrong-surface, suspended and ended memberships are rejected;
- context selection and switching generate audit events;
- selected context persists through protected browser navigation and page reload.

## 3. HTTP/API boundary accepted

R4 adds:

```text
GET  /api/v1/auth/contexts
POST /api/v1/auth/context
```

The endpoints expose only the client-safe eligible-context projection and never trust browser-supplied organization ownership or permission claims.

Existing login/MFA/session endpoints were extended only to represent context-selection state.

## 4. Request-context boundary accepted

The request context now distinguishes:

```text
anonymous
authenticated / identity-only
authenticated / tenant-scoped
authenticated / authorized   (reserved for R5)
```

R4 does not grant permissions. A selected tenant context is not equivalent to authorization.

## 5. PostgreSQL isolation accepted

Migration `20260926173000_r4_tenancy_isolation` establishes:

- permanent `perspective_runtime` role;
- `NOLOGIN`;
- no superuser/database/role creation;
- `NOINHERIT`;
- `NOBYPASSRLS`;
- minimum schema/table access;
- SELECT-only access to the R4 resource envelope;
- RLS enabled and forced on `platform.resources`;
- explicit administrative ability to `SET LOCAL ROLE perspective_runtime`.

The server-only tenant resource helper:

1. starts a transaction;
2. switches locally to the restricted role;
3. derives tenant claims from the verified selected session;
4. binds transaction-local PostgreSQL claims;
5. performs the resource query under RLS.

The browser cannot provide authoritative RLS claims directly.

## 6. Database isolation proof

Live PostgreSQL tests prove:

- no tenant claims → zero protected resource rows;
- Team selected organization → owner resource envelopes only;
- Client A → only Client A `CLIENT_SHARED` resource;
- Client A cannot see Client B;
- Client A cannot see internal resource envelopes;
- Client B cannot see Client A;
- the restricted role cannot mutate the resource table;
- RLS is enabled and forced.

## 7. Exact-head automated qualification

### R4 Tenancy Qualification

**Run ID:** `36260150982`  
**Qualified head:** `1b9af3efef5a14498e95cec3497c9b7f57370eb0`  
**Conclusion:** SUCCESS

Passed:

- dependency installation;
- Prisma validation/generation;
- isolated shadow database;
- R2–R4 migration deploy/status/verification/drift;
- unit tests;
- deterministic seed;
- seed assertions;
- live PostgreSQL tests;
- ESLint;
- strict TypeScript;
- production Next.js build;
- production dependency audit at high/critical threshold.

## 8. Exact-head Chromium qualification

### R4 Browser Qualification

**Run ID:** `36260150981`  
**Qualified head:** `1b9af3efef5a14498e95cec3497c9b7f57370eb0`  
**Conclusion:** SUCCESS

Browser evidence:

```json
{
  "verified": true,
  "browser": "chromium",
  "screenshots": 3,
  "identitySessionWithoutTenant": "pass",
  "protectedBeforeSelection": "pass",
  "fabricatedContextDenied": "pass",
  "contextSelection": "pass",
  "selectedPortalAccess": "pass",
  "contextSwitch": "pass",
  "substantiveConsoleErrors": 0,
  "unexpectedNetworkFailures": 0
}
```

The production-built application was exercised with real PostgreSQL fixtures and a multi-organization Client identity.

## 9. Defects found and repaired during R4 qualification

Qualification intentionally exposed and closed:

- TypeScript union ambiguity between selected and unselected login results;
- brittle `networkidle` browser completion logic;
- auxiliary Playwright request-context behavior that did not represent the real page session;
- ambiguous duplicate “Welcome Back” heading selection in strict Playwright mode.

The final gate uses real browser navigation, protected-route redirects, rendered portal state and page reload rather than weakened assertions.

## 10. Scope review

Compared with the frozen R3 baseline, R4 changes are limited to:

- authentication context state;
- organization-context discovery/selection;
- request-context tenancy binding;
- existing Team/Client auth-card organization chooser;
- restricted PostgreSQL tenant role;
- RLS enforcement;
- tenant isolation tests;
- browser qualification;
- R4 documentation and CI.

R4 does not implement:

- RBAC/permissions;
- role-policy evaluation;
- resource action authorization;
- CRM/domain services;
- contracts/invoices/payments;
- editorial workflows;
- publishing/distribution;
- R5 or later stage functionality.

## 11. Acceptance decision

P4-R4-C1 is **ACCEPTED**.

The R4 implementation satisfies the approved tenancy contract and has exact-head automated, database and real-browser evidence.

The next permitted transition is:

```text
P4-R4-C1 accepted
  → merge R4
  → freeze merged R4 baseline
  → establish Master V1.0 Completion Bible
  → authorize R5 separately
```

R5 must not be implemented on the R4 branch.
