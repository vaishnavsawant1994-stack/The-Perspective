# Phase 4 — R5 Gate-B Enhanced Adversarial Audit

**Document:** P4-R5-REVIEW-02  
**Date:** September 27, 2026  
**Review type:** ENHANCED AUTHORING-AGENT FALSIFICATION REVIEW — NOT INDEPENDENT  
**Policy basis:** GOV-REVIEW-01 / P4-R5-GATE-B-WAIVER-01  
**Implementation:** LOCKED

## 1. Objective

This second review exists specifically because external independent review was owner-waived for R5 Gate B.

It does not claim independence. Its purpose is to increase falsification pressure before contract freeze.

## 2. Re-tested invariants

The design was re-attacked against these invariants:

- authentication != tenant selection != authorization;
- Organization is the hard tenant boundary;
- R01/R02 never imply cross-tenant bypass;
- every ALLOW requires a complete current same-grant path;
- applicable DENY wins;
- MembershipRole.scope is runtime grant scope;
- permission/resource policy may narrow but never widen a grant;
- flat permission sets cannot authorize a resource;
- browser-provided role, permission, organization, owner, scope or admin claims are non-authoritative;
- Team, Client and SELF permission classes cannot cross;
- client-safe projection is server-side and explicit;
- role administration cannot self-escalate;
- future-stage permissions remain dormant;
- system/worker authority is distinct from human RBAC;
- list/count/search/export authorization occurs before exposure;
- revocation applies on subsequent protected requests;
- R6+ business implementation remains out of scope.

## 3. Gate-A findings reconciliation

Gate-A owner approval at `99bb2ba1f94a9007314f208f7830553c231db700` closes the design-decision findings that were previously open because historical Phase-2B evidence was missing:

- C01/C02 — role provenance gap resolved by explicit new V1 governance decision;
- C04 — shorthand permission names resolved by owner-approved normalization;
- C15 — delegation ceilings resolved by owner-approved launch/delegation matrix;
- C16 — R17 model resolved by owner-approved base-role + CLIENT capability-role model;
- C17 — per-permission metadata resolved by the owner-approved 170-key registry.

C18 — independent review remains factually NOT PERFORMED, but the requirement is OWNER-WAIVED for R5 Gate B under GOV-REVIEW-01.

C19 — separate owner implementation authorization remains OPEN and intentionally blocks R5 code.

## 4. Enhanced attack review

### Authority composition

No design path permits permission from one role to borrow broader scope from another role. The runtime model retains complete grant paths rather than authorizing from a flattened union.

### Role/default scope

`Role.defaultScope` is only a grant-creation default. Runtime authority comes from `MembershipRole.scope`; typed constraints and resource policy may only narrow.

### R01/R02 escalation

R01 remains organization-bound. R02 cannot create or mutate R01-equivalent authority. Protected-admin operations require reason, recent authentication/MFA where specified, no-self controls, audit and optimistic concurrency.

### Client boundary

R17 provides baseline client-safe access only. Client approver/signer/billing/admin capabilities are separate CLIENT-scoped organization-local roles and cannot contain Team permissions.

### Permission registry

The V1 registry is finite and exact. Wildcards are prohibited. SELF_ONLY permissions remain outside RolePermission. Future-stage permissions are dormant until the owning release is accepted.

### Collection leakage

Count, aggregate, facet, pagination, search ranking/output and export must apply authorization predicates before exposure. Post-filtering is explicitly rejected as a security boundary.

### Freshness / revocation

Initial R5 resolves authority from current DB state per protected request/command with no cross-request authority cache and no authoritative permission list embedded in session bearer state.

### TOCTOU

Consequential commands revalidate authority/resource/workflow state in the transaction or equivalent execution boundary before side effects.

### Worker/system authority

Workers do not impersonate human launch roles. They act on committed authorized commands or explicit system policy and record separate actor evidence.

## 5. Findings from second audit

| ID | Finding | Severity | Status |
|---|---|---:|---|
| E01 | External independent review absent | GOVERNANCE | OWNER-WAIVED under GOV-REVIEW-01 |
| E02 | Gate-A historical provenance gaps | BLOCKING | CLOSED by explicit owner V1 governance decision |
| E03 | Permission shorthand ambiguity | BLOCKING | CLOSED by 170-key normalization |
| E04 | R17 sub-authority ambiguity | BLOCKING | CLOSED by CLIENT capability-role model |
| E05 | Delegation ceiling ambiguity | BLOCKING | CLOSED by R01/R02 matrix |
| E06 | Permission metadata incompleteness | BLOCKING | CLOSED by P4-R5-PERM-02 |
| E07 | Scope laundering risk | HIGH | CLOSED by same-grant path rule |
| E08 | Flat permission authorization risk | HIGH | CLOSED by grant-path policy |
| E09 | Client field leakage | HIGH | CLOSED by explicit client-safe projection rules |
| E10 | Stale authority/cache | HIGH | CLOSED by per-request resolution policy |
| E11 | R6+ scope creep | HIGH | CLOSED by dormant activation stages + explicit exclusions |
| E12 | Implementation authorization | BLOCKING | OPEN — separate owner authorization required after P4-R5-G0 freeze |

## 6. Threat-matrix disposition

The 60-case threat model remains the minimum attack set for implementation.

For contract freeze, machine validation must confirm all A01–A60 identifiers remain present and the contract retains the associated design controls.

For implementation, each applicable attack must map to at least one executable negative test before P4-R5-C1.

## 7. Enhanced audit verdict

**Contract design:** suitable for exact-head enhanced qualification.

**Blocking/high design findings:** none remain open after owner Gate-A decisions.

**Independent review:** not performed; owner-waived for R5 Gate B.

**Implementation authorization:** NOT READY because P4-R5-G0 is not yet frozen and separate owner implementation authorization remains mandatory.
