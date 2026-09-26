# Phase 4 — R5 Contract Adversarial Audit

**Document:** P4-R5-REVIEW-01
**Date:** September 26, 2026
**Baseline:** main@3e9418deb42c449cf3ae97da85a076e51c9c9089
**Review target:** R5 contract/design branch
**Review type:** AUTHORING-AGENT ADVERSARIAL REVIEW — NOT INDEPENDENT
**Implementation status:** LOCKED

## 1. Review boundary

This review attacks the R5 design before production code exists.

It is intentionally not represented as the required independent contract review. The final independent-review gate remains open.

The review asks whether the current R5 contract can resist privilege escalation, scope confusion, tenant bypass, client projection leakage, stale authority, bulk/export leakage and administrative self-escalation.

## 2. Findings summary

| ID | Finding | Severity | Status |
|---|---|---:|---|
| C01 | Phase-2B primary 17-role matrix missing | BLOCKING | OPEN |
| C02 | Seven role-code positions are reconstructed, not recovered | BLOCKING | OPEN |
| C03 | Phase-2E role.manage vs Phase-2F permission.manage ambiguity | HIGH | CLOSED IN CONTRACT |
| C04 | Four client slash-shorthand permissions have unrecovered exact names | BLOCKING | OPEN |
| C05 | Role.defaultScope vs MembershipRole.scope runtime precedence unclear | HIGH | CLOSED IN CONTRACT |
| C06 | Flat EffectiveAuthorization.permissions could enable scope laundering | HIGH | CLOSED IN CONTRACT |
| C07 | Multiple roles could accidentally synthesize broader authority | HIGH | CLOSED IN CONTRACT |
| C08 | DENY precedence across roles was undefined | HIGH | CLOSED IN CONTRACT |
| C09 | RolePermission.constraints arbitrary JSON lacked a fail-closed schema | HIGH | CLOSED IN CONTRACT |
| C10 | Role inheritance/wildcards could silently widen authority | HIGH | CLOSED IN CONTRACT |
| C11 | Worker/system authority could be confused with human RBAC | HIGH | CLOSED IN CONTRACT |
| C12 | Client-safe projection exclusions needed to be frozen explicitly | HIGH | CLOSED IN CONTRACT |
| C13 | Cross-request permission caching could retain revoked authority | HIGH | CLOSED IN CONTRACT |
| C14 | Bulk/list/count/search/export paths could leak unauthorized records | HIGH | CLOSED IN CONTRACT |
| C15 | Role administration lacks approved delegation ceiling until role matrix freeze | BLOCKING | OPEN |
| C16 | R17 client role/sub-role strategy is not yet explicitly approved | BLOCKING | OPEN |
| C17 | Permission risk/assignability/scope/obligation metadata is not yet fully mapped for all registry keys | BLOCKING | OPEN |
| C18 | Independent contract review has not occurred | BLOCKING | OPEN |
| C19 | Owner has not explicitly authorized R5 implementation | BLOCKING | OPEN |
| C20 | R5 design could accidentally create R6 entities just to test scopes | HIGH | CLOSED IN CONTRACT |

## 3. Closed finding details

### C03 — role.manage vs permission.manage

Frozen Phase-2E exposes role.manage for the role-management surface.

Frozen Phase-2F separately requires permission.manage to mutate role-permission edges.

The contract now freezes them as distinct authorities:

- role.manage: role lifecycle/assignment administration;
- permission.manage: RolePermission mutation;
- an operation spanning both must satisfy both applicable policies.

### C05 — scope precedence

Role.defaultScope is now explicitly a grant-creation default only.

Runtime authority uses MembershipRole.scope and can only be narrowed by typed RolePermission constraints and resource policy.

### C06/C07 — flat permission and role-combination risk

The contract now prohibits a flat permission-set authorization API.

It requires complete grant-path evidence:

membership -> membership role -> role -> permission edge -> permission -> same-grant scope/constraints.

Permission from one role may not borrow scope from another.

### C08 — DENY precedence

Applicable explicit DENY wins over ALLOW for the requested permission/action/context.

No applicable ALLOW means DENY.

### C09 — arbitrary constraints

RolePermission.constraints must use an allowlisted versioned schema.

Unknown keys, wrong types or widening constraints fail closed.

### C10 — inheritance/wildcards

Initial R5 has no implicit role inheritance and no wildcard permission keys.

Permission matching is exact.

### C11 — worker/system authority

Workers and provider events do not impersonate human launch roles.

Workers execute committed authorized commands or explicit system policy and use separate audit actor identity.

### C12 — Client field leakage

The contract incorporates Phase-2C's always-excluded Client Portal field classes and requires separate explicit client projections.

### C13 — stale authority

Initial R5 resolves current database authority per request/command and does not use cross-request authority caches or embed mutable permission claims in session tokens.

### C14 — collection/export leakage

Authorization predicates must apply before count, aggregate, facet, pagination, search-result exposure and export.

Exports use equal-or-stricter policy and field projection.

### C20 — R6 schema creep

R5 is prohibited from creating CRM/editorial/finance/business entities merely to prove ASN/OWN/DEPT.

R5 can prove policy behavior with R5-owned fixtures/normalized ResourceContext. Later domain releases bind canonical domain ownership/assignment tables.

## 4. Open blocking findings

### C01/C02 — role provenance

The 17-role count is frozen historical input, but the primary Phase-2B document is missing.

Nine code/name relationships are high-confidence downstream recoveries; seven code/name assignments are provisional reconstructions.

**Closure options:**

1. owner explicitly approves the reconstructed R01–R17 registry;
2. original Phase-2B source is recovered and reconciled;
3. owner explicitly redesigns the launch role model as a controlled governance change.

Implementation cannot be authorized before one option is recorded.

### C04 — slash-shorthand permissions

The following Phase-2E strings prove multiple capabilities but not their exact historical normalized second key:

- client.task.view/complete
- client.asset.upload/view
- client.approval.view/decide
- client.media.view/review

**Required closure:** explicit normalization decision or recovered original permission names.

No inferred key should be represented as recovered historical fact.

### C15 — delegation ceiling

Anti-self-escalation is designed, but an administrator's exact maximum delegable permissions/roles depends on the approved launch matrix.

The final matrix must define:

- who can assign each system role;
- who can grant each HIGH/CRITICAL permission;
- whether an actor may delegate a permission they hold;
- whether stronger owner/admin approval is required;
- protected-last-admin behavior.

### C16 — R17 model

Downstream documents use R17 as the client role family, while the Client Portal needs distinct capabilities such as approver, signer, billing user and limited client admin.

The owner-approved contract must decide whether V1 uses:

- one R17 system role with separately persisted client assignments/capability conditions; or
- multiple organization-local client roles under the R17 client role family.

Either way, browser flags are prohibited and Client authority remains same-org/client-safe.

### C17 — permission metadata matrix

The explicit key inventory exists, but contract freeze still requires per-key metadata for production authorization:

- domain/action;
- risk level;
- allowed surface;
- allowed scope values;
- assignable roles/custom-role eligibility;
- field policy requirement;
- workflow policy requirement;
- obligations;
- client-safe/system-only flags.

Future R6+ domain keys may be registered as known vocabulary without authorizing unimplemented business behavior.

### C18 — independent review

The required independent contract audit has not happened.

This authoring-agent review cannot satisfy that gate.

### C19 — explicit implementation authorization

Even after all contract findings are closed, production R5 implementation remains locked until the owner explicitly authorizes it against the exact frozen contract SHA.

## 5. Threat-model coverage review

The current threat model covers sixty explicit attacks including:

- cross-tenant IDOR;
- forged tenant/role/permission/admin claims;
- direct API access despite hidden UI;
- Client-to-Team escalation;
- cross-client resource guessing;
- inactive membership/role and expired grants;
- wrong-organization role;
- scope laundering;
- DENY conflict;
- malformed constraints;
- field smuggling;
- client internal-field leakage;
- bulk/list/count/search/export leakage;
- stale cache/revocation;
- TOCTOU;
- self-grant escalation;
- duplicate grants;
- approval-version and self-approval bypass;
- missing high-risk obligations;
- relation/aggregate leaks;
- signed URL leakage;
- worker/provider authority confusion;
- RLS claim forgery;
- admin-DB tenant-query misuse;
- audit mutation;
- stale role-management writes;
- custom-role system-permission escalation;
- implicit Super Admin global bypass;
- unsupported impersonation;
- missing resource context.

No additional blocker was found outside the open governance/provenance items above.

## 6. Contract completeness review

The contract now covers:

- authority model;
- role lifecycle;
- exact permission semantics;
- risk levels;
- ALLOW/DENY precedence;
- seven scopes;
- scope laundering prevention;
- typed constraints;
- trusted resource context;
- field policy;
- client policy;
- sensitive obligations;
- self-escalation;
- freshness/revocation;
- TOCTOU;
- worker/system actors;
- collection/bulk/export policy;
- errors;
- audit;
- access-administration APIs;
- database policy;
- R4 tenant/RLS coexistence;
- file/search future boundaries;
- implementation slices;
- tests;
- qualification;
- checkpoint;
- rollback;
- R6+ exclusions.

## 7. Review verdict

**DESIGN QUALITY:** suitable to continue contract formation.

**IMPLEMENTATION AUTHORIZATION:** NOT READY.

Blocking items:

1. role-registry owner decision;
2. four permission-name normalization decisions;
3. launch role/permission/delegation metadata matrix approval;
4. R17 strategy approval;
5. independent review;
6. exact contract freeze;
7. explicit owner authorization.

R5 production implementation remains locked.
