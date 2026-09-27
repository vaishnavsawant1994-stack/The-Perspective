# Phase 4 — R5 Authorization Pre-Design Audit

**Document:** P4-R5-AUDIT-01  
**Date:** September 26, 2026  
**Planning baseline:** `main@3e9418deb42c449cf3ae97da85a076e51c9c9089`  
**Branch:** `phase4/r5-authorization-contract-20260926`  
**Status:** CONTRACT/DESIGN ONLY — IMPLEMENTATION LOCKED  
**Depends on:** R1–R4 accepted; V1 Master Completion Bible controlled  
**R6+ status:** LOCKED

## 1. Audit purpose

This audit establishes the authority boundary R5 inherits before any authorization implementation begins.

R5 must preserve:

```text
authentication
  != tenant selection
  != authorization
```

R5 is not permission-themed UI work. It is the server-side control layer that later CRM, finance, editorial, publishing, distribution, member and client workflows must rely on.

## 2. Sources reviewed

Primary current sources:

- `docs/THE-PERSPECTIVE-V1-MASTER-COMPLETION-BIBLE.md`
- `docs/phase-2/README.md`
- Phase-2C entity, field, screen/entity and PostgreSQL architecture
- Phase-2D workflow and transition rules
- Phase-2E 151-screen / 153-design sequence
- Phase-2F API and service architecture
- R1–R4 implementation contracts/checkpoints
- current `prisma/schema.prisma`
- current deterministic seed
- request-context types
- R3 authentication/session implementation
- R4 organization-context selection
- R4 restricted PostgreSQL resource context/RLS
- current route proxy/access boundary

Historical recovery was also attempted through repository commit search and retained prior project context.

## 3. Phase-2B provenance result

The repository explicitly records Phase 2B as a frozen input containing:

- **17 launch roles**
- **35 visibility modules**
- critical actions
- scope rules
- client isolation

However, the standalone Phase-2B artifact is not present in the current tree.

Repository code search and commit-message search did not recover the missing source. Retained prior project context also contains references to RBAC/security matrices but not the original R01–R17 matrix itself.

**Classification: PRIMARY SOURCE MISSING / PROVENANCE GAP.**

R5 must not pretend demo seed roles are the launch-role matrix.

A downstream reconstruction can be prepared from Phase-2D/E/F evidence, but it is not authoritative until explicitly approved.

## 4. Existing persisted RBAC primitives

The physical R2–R4 schema already contains the intended authorization spine:

### OrganizationMembership

Provides the selected membership identity and includes:

- organization
- user account
- membership type
- department
- manager membership
- lifecycle status
- joined/ended timestamps

### Role

Organization-scoped role with:

- `key`
- `name`
- `systemRole`
- `defaultScope`
- active/archive status

### Permission

Global permission key with:

- `key`
- `domain`
- `action`
- `riskLevel`

### RolePermission

Role-to-permission edge with:

- ALLOW or DENY effect
- JSON constraints

### MembershipRole

Membership-to-role grant with:

- explicit `RoleScope`
- `validFrom`
- optional `validUntil`

### Resource

Generic resource envelope with:

- owner organization
- optional client organization
- project
- visibility
- sensitivity
- archive state

### AuditEvent

Append-only evidence fields already support:

- organization
- target resource
- actor user
- actor membership
- action
- request/correlation/causation IDs
- before/after hashes
- redacted diff
- IP/device metadata
- reason
- time/idempotency

## 5. Frozen scope vocabulary

The schema and Phase-2F agree on seven scope values:

| Scope | R5 meaning |
|---|---|
| `ORG` | eligible records inside the selected organization |
| `DEPT` | eligible records inside the actor membership's authorized department boundary |
| `ASN` | explicitly assigned records only |
| `OWN` | records owned by the actor/membership according to domain ownership contract |
| `CLIENT` | selected client organization + explicit client-safe visibility/projection |
| `READ` | read-only authority; never implies create/update/delete/approve/publish |
| `NONE` | no resource authority; useful for identity/self or special explicit operations |

R5 must define exact matching semantics. Scope may not be inferred from UI location.

## 6. Current request-context boundary

Current foundation types deliberately distinguish:

```text
anonymous
identity-only
tenant
authorized
```

R4 populates `identity-only` and `tenant`.

The `AuthorizedRequestContext` and `EffectiveAuthorization` types already exist, but no accepted service currently populates `scope: "authorized"`.

**R5 therefore activates the designed authorization stage instead of inventing a parallel request-context model.**

## 7. Current enforcement map

### Authentication

R3 verifies identity, session lifecycle, account state, MFA state where applicable, and selected surface.

### Tenancy

R4 verifies the selected membership belongs to the authenticated account and selected organization/surface.

### Route boundary

The proxy proves a selected Team/Client session exists before protected surfaces render.

It does **not** evaluate roles or permissions.

### Database tenant isolation

R4 provides a restricted `perspective_runtime` database role and transaction-local tenant claims for the generic `platform.resources` envelope.

Current RLS proves organization/client isolation and `CLIENT_SHARED` behavior.

It does **not** implement RBAC, field policy, workflow authority or domain-specific record policy.

### Authorization

No accepted central effective-authority resolver or policy evaluator exists yet.

**This is the intended R5 gap.**

## 8. Seed-state warning

The deterministic R2 seed contains only reference/demo authority:

- Platform Admin Demo
- Client Admin Demo
- `workspace.view`
- `resource.read`

These records exist to verify schema and RLS mechanics.

They are **not** the frozen 17 launch roles and must not become R5 production authority by accident.

## 9. Inherited authorization requirements

Phase-2D/E/F consistently require:

- backend authorization is authoritative;
- hidden navigation is not access control;
- permission + scope + tenant + ownership/assignment + visibility/sensitivity + field policy + workflow state + separation of duty must be evaluated;
- client APIs expose explicit client-safe projections, not unrestricted Team rows;
- permission-filtered search/results;
- no client-supplied authoritative permission/ownership filters;
- role changes are audited and guarded;
- sensitive approvals/publishing/finance actions use higher-risk authority;
- exact versions must be bound for approvals;
- writers/designers cannot self-approve prohibited work;
- tenant/client isolation remains mandatory.

## 10. Derived permission evidence

The frozen Phase-2E screen contracts expose a large Phase-2A permission vocabulary.

Phase-2D adds workflow-command permissions not always named by the UI.

The combined downstream evidence currently yields **166 distinct permission-key candidates**.

This derived catalog is useful R5 input, but must be normalized into one canonical permission registry before code implementation.

## 11. Architectural findings

### F1 — Phase-2B primary role matrix missing

Severity: **BLOCKING FOR IMPLEMENTATION FREEZE**

The role-count/provenance requirement exists but the primary file is absent.

### F2 — Authorization request scope intentionally unimplemented

Severity: **EXPECTED R5 WORK**

`AuthorizedRequestContext` exists but no effective-authority resolver promotes a tenant-scoped request.

### F3 — DENY precedence is not yet defined

Severity: **BLOCKING DESIGN QUESTION**

`PermissionEffect.DENY` exists physically, but conflict semantics across multiple roles must be frozen.

### F4 — Cross-role scope laundering must be prevented

Severity: **HIGH**

A permission from one role must never silently combine with a broader scope from another unrelated role.

Every allow decision must be supported by a complete valid grant path.

### F5 — RolePermission constraints JSON needs a contract

Severity: **HIGH**

Unknown or malformed constraint keys must fail closed. Constraints cannot remain arbitrary untyped JSON.

### F6 — Scope semantics require resource attributes

Severity: **HIGH**

`DEPT`, `ASN`, `OWN`, and `CLIENT` require trusted resource context. A permission key alone cannot prove access.

### F7 — Client projection needs an explicit policy boundary

Severity: **HIGH**

R4 RLS protects generic resource envelopes, but later client-safe serializers/queries must independently exclude internal fields/versions/notes.

### F8 — Authorization freshness must be defined

Severity: **HIGH**

Role or permission removal must affect subsequent requests without requiring logout.

### F9 — Bulk/search/export authorization must be filter-before-count/page/export

Severity: **HIGH**

Post-filtering already-returned rows can leak counts, IDs or fields.

### F10 — Sensitive actions require obligations beyond permission presence

Severity: **HIGH**

Examples include role management, export, destructive actions, finance, publishing and approval. The policy engine must support recent-auth/MFA, reason, separation-of-duty and immutable evidence obligations where the domain contract requires them.

## 12. Authorization Authority Map

```text
Authenticated Person
        |
        v
UserAccount / Identity
        |
        v
Session
        |
        v
selected OrganizationMembership
        |
        v
selected Organization (R4 tenant)
        |
        v
active MembershipRole grants
        |
        v
active organization Role
        |
        v
RolePermission ALLOW / DENY
        |
        v
Permission key
        |
        v
same-grant RoleScope + typed constraints
        |
        v
trusted ResourceContext
        |
        +--> tenant / client boundary
        +--> owner / assignee / department
        +--> project / visibility / sensitivity
        +--> lifecycle/version
        +--> requested fields
        |
        v
Resource / Field / Workflow Policy
        |
        v
obligations (reason / SoD / MFA / exact version / audit)
        |
        v
ALLOW or DENY
        |
        v
execute command/query
        |
        v
Audit / Security Evidence
```

## 13. R5 design rule

An authorization decision is valid only if one complete server-verified authority path proves it.

The system must never construct:

```text
permission from Role A
+ broader scope from Role B
= synthetic authority
```

unless an explicit policy contract says those grants may combine.

## 14. Pre-design conclusion

R5 has a sound schema and R1–R4 security foundation to build on.

The missing work is the actual authoritative policy layer.

Before production implementation can be authorized, R5 must close:

1. launch-role provenance/approval;
2. canonical permission registry;
3. grant/effect/scope semantics;
4. resource + field policy;
5. client-safe policy;
6. revocation/freshness;
7. sensitive-action obligations;
8. threat model;
9. exact test matrix;
10. independent contract review.

No R6+ domain implementation is authorized by this audit.
