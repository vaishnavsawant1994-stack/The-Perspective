# Phase 4 — R4 Implementation Contract

## Organization Context Selection & Tenant Isolation

**Contract:** P4-R4-G0  
**Date:** September 26, 2026  
**Status:** AUTHORIZED — IMPLEMENTATION IN PROGRESS  
**Depends on:** Accepted P4-R1-C1, P4-R2-C1, and P4-R3-C1  
**Frozen baseline:** `main@f41485f22d8f6fbed18d9d0a03d8fc1d1ef5a9dd`  
**Next stage:** R5 remains locked

## 1. Purpose

R4 turns the R3 identity-authenticated session into one explicitly selected, server-verified organization context and proves tenant isolation at both the application boundary and PostgreSQL resource boundary.

The governing separation remains:

> authenticated identity ≠ selected organization context ≠ authorization.

R4 selects and binds the tenant. It does not evaluate roles, permissions, field policies, workflow authority, or resource-specific action authority; those remain R5 and later work.

## 2. Authoritative tenant model

Phase 2C defines `iam.organizations` as the durable party and tenant boundary. There is no separate persisted Workspace entity. “Team Workspace” and “Client Portal” are application/API surfaces.

Therefore R4 must not invent a `workspace` table or synthetic workspace identifier.

Each protected request has exactly one active organization context:

- Team surface: an active `STAFF` membership in an active organization.
- Client surface: an active `CLIENT` membership in an active Client organization.
- Multiple eligible memberships require explicit selection after identity proof.
- No organization, membership, role, owner filter, client filter, or permission claim supplied by a browser is trusted without server-side membership verification.

## 3. Session state model

R3 already permits `iam.sessions.active_membership_id` to be nullable.

R4 uses two authenticated session states:

```text
identity authenticated / context unselected
  session.user_account_id = verified account
  session.surface = TEAM | CLIENT
  session.active_membership_id = NULL
  protected business routes remain denied

identity authenticated / context selected
  session.active_membership_id = one currently eligible membership
  membership.organization_id = active organization context
  protected route may cross the tenancy gate
  R5 authorization is still not implied
```

A session with no active membership is not anonymous, but it is not tenant-scoped and cannot access `/app/*` or protected `/client/*`.

## 4. Context discovery and selection

After password/MFA identity proof:

- zero eligible memberships → generic authentication failure;
- one eligible membership → retain the R3 direct selected-session path;
- multiple eligible memberships → issue an identity-authenticated unselected session and return only a client-safe list of eligible contexts.

Client-safe context projection:

```ts
{
  membershipId: string;
  organizationId: string;
  organizationName: string;
  surface: "TEAM" | "CLIENT";
}
```

The browser may request one returned `membershipId`. The server re-resolves that membership from the authenticated session account and surface before changing `active_membership_id`.

Context switching never accepts browser-supplied organization authority or ownership filters.

## 5. HTTP boundary

R4 adds only:

```text
GET  /api/v1/auth/contexts
POST /api/v1/auth/context
```

- `GET /contexts` requires a valid authenticated session, selected or unselected, and returns only eligible memberships for that session account/surface plus the current selected membership ID.
- `POST /context` requires same-origin JSON and one membership ID; it revalidates ownership, surface, membership state, organization state, and session state before selection.
- A successful selection returns the selected client-safe context and keeps the existing opaque session token.
- Invalid, cross-account, ended, suspended, wrong-surface, wrong-organization-type, revoked, or expired selections fail closed.
- Context selection/switches are audited.

## 6. Request-context boundary

R4 refines the request context to the Phase-2 model:

- `organizationId` is the selected tenant boundary;
- `membershipId` is the selected membership;
- `surface` is Team or Client;
- no synthetic `workspaceId` is created.

An authenticated but unselected session resolves to `scope: "identity-only"`.
A selected tenant resolves to `scope: "tenant"`.

R5 will later promote a tenant-scoped context to `scope: "authorized"` only after role/permission/resource policy evaluation.

## 7. PostgreSQL isolation

R2 already created transaction-local tenant claims and RLS on `platform.resources`.

R4 must:

1. install a restricted `perspective_runtime` NOLOGIN role;
2. grant only the minimum schema/table access required for the R4 proof;
3. force RLS on `platform.resources`;
4. provide a server-only helper that begins a transaction, switches locally to the runtime role, binds organization/client claims from the trusted selected session, and executes tenant-scoped queries;
5. prove no-context and cross-client reads return zero protected rows;
6. prove Team owner context and Client `CLIENT_SHARED` context see only permitted resource envelopes.

The application connection may remain the migration/administrative connection for R4 authentication operations; tenant-scoped domain access must use the restricted transaction helper.

## 8. Frozen UI binding

R4 does not create Design 154.

When login/MFA returns `context_selection_required`, the existing frozen Team or Client authentication card may enter a context-selection state, analogous to the existing MFA state. It may show only the server-provided eligible organization names and submit the selected membership ID.

No new tenant dashboard, organization admin screen, role editor, or business workflow is authorized.

## 9. R4 exclusions

- role/permission evaluation, RBAC, field policy, resource action authority, impersonation (R5);
- business repositories and domain APIs beyond the minimum RLS/resource-envelope isolation proof;
- CRM, projects, finance, publishing, reporting, integrations, automation, provider delivery;
- new Workspace persistence model;
- arbitrary browser-supplied organization/client claims;
- Design 154 or visual redesign;
- R5 or later work.

## 10. Objective acceptance criteria

P4-R4-C1 may be established only when:

1. R3 is recorded as accepted and the R4 baseline is frozen.
2. Organization is retained as the canonical tenant; no unsupported Workspace entity is introduced.
3. Identity-authenticated unselected sessions are valid only for context discovery/selection and cannot access protected business routes.
4. Single-membership logins remain backward-compatible and selected automatically.
5. Multiple eligible memberships produce an authenticated selection-required state without leaking contexts before identity/MFA proof.
6. Context listing returns only currently eligible memberships for the authenticated account and surface.
7. Context selection/switch revalidates membership/account/surface/organization state server-side and audits the change.
8. Wrong-account, wrong-surface, ended, suspended, revoked, expired, and fabricated membership IDs fail closed.
9. Request context distinguishes identity-only, tenant-scoped, and future authorized scope without inventing permissions.
10. The restricted PostgreSQL runtime role plus transaction-local tenant binding enforces RLS on `platform.resources`.
11. Tenant-isolation database tests prove no-context, cross-client, client-shared, and Team owner behavior.
12. Unit/database/HTTP/browser/regression/lint/typecheck/build/drift/dependency checks pass and the checkpoint records evidence and rollback.
13. R5 remains locked after P4-R4-C1 until separately reviewed and accepted.

## 11. Gate state

```text
P4-R3-C1 accepted
  → P4-R4-G0 authorized
  → R4 implementation only
  → P4-R4-C1 review checkpoint
  → STOP
  → R5 remains locked
```
