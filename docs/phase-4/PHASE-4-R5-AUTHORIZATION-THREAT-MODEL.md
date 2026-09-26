# Phase 4 — R5 Authorization Threat Model & Attack Matrix

**Document:** P4-R5-THREAT-01  
**Date:** September 26, 2026  
**Baseline:** `main@3e9418deb42c449cf3ae97da85a076e51c9c9089`  
**Status:** CONTRACT/DESIGN ATTACK MODEL — IMPLEMENTATION LOCKED

## 1. Security objective

R5 must ensure that no request can gain authority from browser-supplied claims, route visibility, stale grants, unrelated roles, guessed IDs or client-safe UI assumptions.

Primary invariant:

> No demonstrated server-side authorization = DENY.

Secondary invariant:

> Every ALLOW decision must be explainable by one complete, current, same-tenant authority path plus the required resource/field/workflow checks.

## 2. Protected assets

- organization-scoped data;
- client-safe vs internal data boundaries;
- roles and permissions;
- membership-role grants;
- security/admin configuration;
- commercial/financial records;
- editorial/publication approvals;
- files/assets and exports;
- audit/security evidence;
- workflow state;
- future provider-backed actions.

## 3. Trust boundaries

```text
Browser / client input
        |
        v
HTTP/schema/origin boundary
        |
        v
R3 authenticated identity
        |
        v
R4 selected organization membership
        |
        v
R5 effective authority resolver
        |
        v
R5 resource/field/workflow policy
        |
        v
application service / repository
        |
        v
R4/R5 database tenant enforcement
        |
        v
audit/security evidence
```

The browser is never an authority source.

## 4. Mandatory attack cases

| ID | Attack | Expected result / contract control |
|---|---|---|
| A01 | Cross-tenant IDOR with valid permission | DENY/not-found; tenant filter before record disclosure |
| A02 | Forge `organizationId` in body/query/header | Ignore as authority; selected R4 tenant is canonical |
| A03 | Forge `role=OWNER`, `isAdmin=true`, permission list | Ignore/reject; roles resolved from DB |
| A04 | Direct API call when UI button is hidden | Same server policy; DENY if unauthorized |
| A05 | Client session calls Team endpoint | DENY before resource evaluation |
| A06 | Team session calls Client endpoint with unrelated client ID | DENY unless explicit Team policy exists; no client projection bypass |
| A07 | R17 guesses another client/project/resource ID | DENY/not-found; own client org + CLIENT_SHARED + relationship required |
| A08 | Permission exists but membership inactive/ended | DENY |
| A09 | Permission exists but role inactive | DENY |
| A10 | MembershipRole `validUntil` expired | DENY |
| A11 | Role belongs to a different organization | DENY; same-tenant role invariant |
| A12 | Permission from Role A + broader scope from Role B | DENY unless one complete grant path proves access |
| A13 | Applicable DENY plus ALLOW from another role | DENY |
| A14 | Unknown permission key | DENY |
| A15 | Malformed/unknown RolePermission constraint | DENY and security telemetry |
| A16 | DEPT scope with forged department ID | Trusted actor membership/resource department only |
| A17 | ASN scope with forged assignee ID | Assignment loaded server-side |
| A18 | OWN scope with forged owner field | Owner loaded server-side; client value ignored |
| A19 | READ scope attempts mutation | DENY |
| A20 | NONE scope attempts generic record access | DENY |
| A21 | Field smuggling / mass assignment | Reject forbidden fields; server-owned fields never accepted |
| A22 | Read allowed but sensitive field requested | Return explicit allowlisted projection only |
| A23 | Client requests internal notes/margins/staff comments | Omit/deny through client-safe projection |
| A24 | Bulk update includes one unauthorized record | Default atomic DENY for entire command unless endpoint explicitly defines per-item results |
| A25 | List query filters after pagination/count | Prohibited; authorization predicate applied before count/page |
| A26 | Export bypasses normal list policy | DENY; export uses same/equal or stricter policy + field projection |
| A27 | Search index returns unauthorized hit/count/facet | Server-derived tenant/visibility/permission filters before ranking/results |
| A28 | Role revoked while session remains authenticated | Next request sees revocation; authentication may remain but authority disappears |
| A29 | Stale cross-request authorization cache | Prohibited in initial R5; later cache needs revision/invalidation proof |
| A30 | TOCTOU: role revoked between check and sensitive mutation | Sensitive command revalidates authority/resource in transaction or equivalent atomic boundary |
| A31 | Self-grant R01/R02 or privilege escalation through role API | DENY unless explicit higher authority + SoD; no self-escalation path |
| A32 | Actor disables/removes the last protected administrator | Guarded policy; prevent lockout unless controlled emergency procedure exists |
| A33 | Duplicate MembershipRole grants | Must not multiply or widen authority; resolver de-duplicates by grant path |
| A34 | Role constraint JSON supplies unknown `scopeOverride` | DENY; typed allowlisted constraint schema only |
| A35 | Client switches tenant then reuses old resource URL | Re-evaluate against current selected membership; no sticky resource authority |
| A36 | Resource archived/inactive but permission exists | Domain/resource policy decides; permission alone insufficient |
| A37 | Approval against superseded version | DENY; exact active version/request required |
| A38 | Writer/designer self-approves prohibited own work | DENY via separation-of-duty rule |
| A39 | High-risk action without required reason/recent auth/MFA | DENY with obligation reason |
| A40 | Refund/publish/role-change endpoint called with ordinary edit permission | DENY; workflow-command permission is distinct |
| A41 | Error message reveals existence of inaccessible foreign record | Return non-enumerating not-found/denial contract |
| A42 | Unauthorized relation expansion leaks nested object | Projection/loader policy applies to nested relations too |
| A43 | Count/aggregate reveals foreign tenant population | Authorization predicate before aggregate |
| A44 | File signed URL generated for inaccessible asset | DENY before URL generation; scope/rights/version checked |
| A45 | Old signed URL survives authority revocation beyond acceptable TTL | short-lived scoped URL + storage policy; no durable bearer authority |
| A46 | Background job trusts browser/user permission snapshot as new authority | Job acts only on committed authorized command/system policy; no browser claims |
| A47 | Worker operates on resource whose tenant relation changed | Re-load canonical tenant/resource state before consequential side effect |
| A48 | Webhook/provider payload claims organization/user | Provider identity/evidence does not confer membership authority |
| A49 | RLS transaction claim derived from request body | Prohibited; claim derived only from verified selected session/resource policy |
| A50 | Application uses admin DB connection for tenant-scoped domain query | Prohibited where R4/R5 restricted path is required |
| A51 | Audit entry can be updated/deleted by ordinary role | DENY; audit remains append-only |
| A52 | Authorization denial itself contains secrets/forbidden fields | Structured reason codes only; no protected payload |
| A53 | Permission-management endpoint changes role without optimistic concurrency | DENY/retry; stale policy write prohibited |
| A54 | Role removed after list page loaded, then old UI submits command | Server reauthorization at command time |
| A55 | Client passes `fields=internalMargin` or GraphQL-like expansion | Server field policy wins; forbidden fields rejected/omitted |
| A56 | Public/member endpoint accidentally reuses Team serializer | Separate explicit projection contract |
| A57 | Custom role attempts forbidden system-only permission | Role-management policy denies unassignable capabilities |
| A58 | Super Admin assumes global cross-tenant bypass | DENY by default; R01 is not a tenant-isolation bypass |
| A59 | Support/impersonation claimed through R01 | Not authorized in R5 unless separately designed and audited |
| A60 | Missing resource context on protected resource action | DENY; no “permission-only” fallback |

## 5. Decision-logic attacks

### DENY precedence

If an applicable explicit DENY exists for the requested permission/action under the current constraints, the decision is DENY.

### Grant-path integrity

A successful decision must identify a complete path:

```text
membership
 -> active membershipRole
 -> active same-organization role
 -> applicable ALLOW rolePermission
 -> permission key
 -> scope from that same grant
 -> constraints from that same rolePermission
 -> matching resource/field/workflow policy
```

The resolver may evaluate multiple complete paths but may not synthesize a stronger path from fragments.

### Field authority

Resource `update` never implies unrestricted field mutation.

Policy outputs must be able to express:

- readable fields;
- mutable fields;
- masked fields;
- server-owned fields;
- client-safe fields.

## 6. Freshness and revocation

Initial R5 policy:

- effective authority is resolved on every protected request/command;
- cache may exist only within the current request/transaction;
- session tokens do not embed authoritative role/permission claims;
- role/membership/permission changes affect the next request;
- sensitive commands re-check authority at the execution boundary;
- later cross-request caching requires a separately tested revision/invalidation mechanism.

This chooses correctness over premature optimization.

## 7. Client Portal attack boundary

Client access requires all applicable conditions:

```text
CLIENT surface
+ selected client organization
+ active client membership
+ active eligible client role/grant
+ explicit client permission
+ same client organization/project relationship
+ visibility == CLIENT_SHARED where resource model uses visibility
+ explicit client-safe field projection
+ workflow/version guard
= possible ALLOW
```

Failure of any condition denies.

Internal notes, margins, employee-only comments, hidden versions, unrelated clients and administrative metadata are never made safe merely by hiding them in the UI.

## 8. High-risk obligation model

The R5 policy result must support obligations such as:

- reason required;
- recent authentication required;
- MFA verified/recent;
- exact version/hash required;
- separation-of-duty check;
- second approval required by later domain policy;
- immutable audit required;
- no-self-action;
- export watermark/manifest;
- client-safe projection;
- transaction-bound authority recheck.

R5 creates the capability to enforce these obligations. R6+ defines domain-specific business cases where needed.

## 9. Security test rule

A positive test is insufficient unless a paired negative test proves the adjacent escalation path is denied.

Examples:

```text
same tenant + permission + matching scope      -> ALLOW
same tenant + permission + wrong scope         -> DENY
wrong tenant + otherwise valid role            -> DENY
client-safe field                              -> ALLOW
internal field on same client record           -> DENY/OMIT
active role                                    -> ALLOW if policy passes
same request after role revocation             -> DENY
```

## 10. Threat-model gate

This threat model is a required appendix to the R5 implementation contract.

Contract freeze requires every attack class to map to:

- a design control;
- an implementation responsibility;
- at least one planned negative test;
- audit/telemetry behavior where relevant.

R5 implementation remains locked until the contract is reviewed and frozen.
