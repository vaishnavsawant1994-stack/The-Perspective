# Phase 4 — R5 Owner Governance Decision Proposal

**Document:** P4-R5-GOV-01
**Date:** September 27, 2026
**Planning baseline:** `main@3e9418deb42c449cf3ae97da85a076e51c9c9089`
**Contract branch:** `phase4/r5-authorization-contract-20260926`
**Status:** PROPOSED CONTROLLED V1 DECISION — OWNER APPROVAL REQUIRED
**Historical claim:** NONE. This document does not claim to recover the missing Phase-2B artifact.
**Implementation status:** LOCKED

## 1. Decision purpose

The historical Phase-2B role/permission source is missing.

The repository nevertheless freezes the existence of:

- 17 launch roles;
- seven scope values;
- role/permission separation;
- 35 visibility modules;
- client isolation;
- downstream critical-action restrictions.

Rather than invent historical provenance, R5 will make a new explicit V1 governance decision where the original source cannot be recovered.

Owner approval of this document would establish the controlled V1 authority baseline. It would not change the fact that some mappings are newly decided rather than historically recovered.

## 2. Decision A — 17 launch-role registry

### Proposed decision: APPROVE AS NEW V1 GOVERNANCE

| Code | V1 launch role | Provenance |
|---|---|---|
| R01 | Super Admin | downstream recovered |
| R02 | Admin | downstream recovered |
| R03 | Sales Manager | downstream recovered |
| R04 | Sales Executive | downstream recovered |
| R05 | Researcher | **new controlled V1 decision** |
| R06 | Account Manager | downstream recovered |
| R07 | Editor-in-Chief | downstream recovered |
| R08 | Editor | **new controlled V1 decision** |
| R09 | Writer | **new controlled V1 decision** |
| R10 | Designer | **new controlled V1 decision** |
| R11 | Podcast Producer | **new controlled V1 decision** |
| R12 | Video Producer | **new controlled V1 decision** |
| R13 | Events Manager | **new controlled V1 decision** |
| R14 | Marketing & Distribution | downstream recovered |
| R15 | Finance Manager | downstream recovered |
| R16 | Operations Manager | downstream recovered |
| R17 | Client User | downstream recovered role family; exact sub-authority model decided below |

The seven provisional mappings become authoritative **only after owner approval of this governance record**.

## 3. Decision B — normalize four client shorthand capabilities

### Proposed canonical normalization

Frozen Phase-2E shorthand | Canonical V1 interpretation
---|---
`client.task.view/complete` | `client.task.view` + **`client.task.complete`**
`client.asset.upload/view` | `client.asset.upload` + **`client.asset.view`**
`client.approval.view/decide` | `client.approval.view` + existing **`approval.client.decide`**
`client.media.view/review` | `client.media.view` + **`client.media.review`**

Rationale:

1. preserve already explicit keys;
2. create only three missing exact capabilities;
3. reuse the already frozen Phase-2D `approval.client.decide` instead of creating a duplicate `client.approval.decide`;
4. retain clear action semantics;
5. record this as a V1 normalization decision, not recovered historical spelling.

After approval, the canonical explicit registry contains **170 permission keys**: the existing 167 explicit keys plus the three newly normalized keys above.

## 4. Decision C — R17 client authority model

### Proposed decision: one launch role + restricted client capability roles

R17 remains exactly one of the 17 launch roles:

```text
R17 — Client User
scope: CLIENT
surface: CLIENT only
```

R17 supplies the ordinary client-safe portal baseline.

Higher client authority is represented by **organization-local CLIENT-scoped capability roles**, not by new R-numbers and not by browser flags.

Approved V1 client capability-role templates:

| Capability role key | Purpose | May contain |
|---|---|---|
| `client-approver` | approve/reject exact shared work | client review permissions + `approval.client.decide` |
| `client-signer` | sign authorized contracts | `client.contract.sign` |
| `client-billing` | perform authorized client payment actions | `client.billing.pay` |
| `client-admin` | limited Client Portal organization administration | `client.org.manage` only unless a later accepted Client Portal contract adds another CLIENT_ROLE permission |

Rules:

- these are **not additional launch R01–R17 roles**;
- they are organization-local roles constrained to `CLIENT` scope;
- they can contain only permissions whose registry metadata marks them `CLIENT_ROLE` assignable;
- Team-side keys such as `client.view`, `client.contact.manage`, `client.portal.manage`, and `client.portal.provision` are explicitly forbidden in Client capability roles even though their domain prefix is `client`;
- they cannot contain Team permissions;
- they cannot change tenant selection;
- they cannot expose Team/internal fields;
- they cannot grant themselves or others capabilities unless `client.org.manage` policy explicitly allows the limited client-admin operation;
- contract signing, payment and approval always retain exact resource/workflow/field/obligation policy;
- ordinary R17 client users do not automatically receive signer, billing, approver or client-admin authority.

This preserves the 17 launch-role contract while supporting the frozen Client Portal user types.

## 5. Decision D — launch-role delegation ceilings

### R01 Super Admin

May, inside the selected organization and subject to policy:

- assign/revoke R01–R17;
- create/manage allowed custom Team and Client roles;
- mutate allowed RolePermission edges;
- grant registered assignable permissions.

Cannot:

- bypass tenant isolation;
- assign system-only/self-service permissions;
- bypass field/workflow policy;
- self-escalate through the target operation;
- disable/remove the final protected R01 authority without lockout protection;
- use role administration as impersonation.

Changes to R01 or CRITICAL administrative authority require:

- `role.manage` and/or `permission.manage` as applicable;
- recent authentication/MFA;
- structured reason;
- no-self rule;
- immutable audit evidence;
- optimistic concurrency;
- protected-last-admin check.

### R02 Admin

May:

- assign/revoke R02–R17;
- manage allowed custom roles below the protected R01 boundary;
- mutate role-permission edges for roles below the protected R01 boundary.

Cannot:

- grant or mutate R01;
- create a custom role equivalent to R01;
- grant a permission marked above the R02 delegation ceiling;
- bypass tenant/client/field/workflow policy.

R02 role/permission changes remain HIGH/CRITICAL audited operations.

### R03–R17

Do not receive `role.manage` or `permission.manage` as launch-role authority.

R16 may manage Team membership/department operational data where `team.manage` / `department.manage` permits, but cannot assign launch roles or mutate RolePermission edges.

Client-admin capability roles may perform only the explicitly limited client organization/member operations permitted by CLIENT policy; they cannot manage Team or launch roles.

## 6. Decision E — permission administration separation

Freeze:

- `role.manage`: role lifecycle, role assignment, permitted role metadata administration;
- `permission.manage`: RolePermission edge mutation;
- `team.manage`: organization membership operational administration;
- `department.manage`: department placement/configuration;
- `client.org.manage`: limited CLIENT-surface organization administration only.

No permission aliases another.

An operation spanning multiple authority classes must satisfy every applicable policy.

## 7. Decision F — per-permission metadata contract

Every canonical permission is assigned immutable registry metadata:

- surface: TEAM / CLIENT / SELF_TEAM / SELF_CLIENT / SYSTEM;
- risk: LOW / MEDIUM / HIGH / CRITICAL;
- assignability: TEAM_ROLE / CLIENT_ROLE / SELF_ONLY / SYSTEM_ONLY;
- permitted scope set;
- field-policy requirement;
- workflow-policy requirement;
- obligation set;
- activation stage.

The companion `PHASE-4-R5-PERMISSION-POLICY-METADATA.md` is the proposed exhaustive registry.

Unknown metadata, unknown permission keys, invalid surface/scope combinations and invalid assignment targets fail closed.

## 8. Decision G — role/permission launch matrix

The companion `PHASE-4-R5-LAUNCH-ROLE-PERMISSION-MATRIX.md` is the proposed V1 launch assignment baseline.

The matrix uses exact permission bundles plus explicit critical permissions.

Rules:

- R01/R02 broad administration remains selected-organization-bound;
- specialists receive only domain authority required by frozen workflows;
- client R17 receives client-safe baseline only;
- client approver/signer/billing/admin powers are separate restricted capability roles;
- self-service authentication/profile permissions are not granted through RBAC roles;
- future-domain permissions may be registered before their implementation stage but remain dormant until the owning R6+ stage accepts the business operation.

## 9. Decision H — dormant future-domain authority

R5 defines authorization vocabulary for future stages without implementing their business engines.

Therefore each permission has an activation stage.

Before its owning stage is accepted:

- the key may exist in the registry;
- the key may appear in the approved role design;
- no R5 endpoint may execute the future business operation;
- no generic authorization endpoint may be used to fabricate that missing business workflow.

This prevents the RBAC foundation from becoming accidental R6+ implementation.

## 10. Decision I — role management write protections

All role/permission writes require:

- current R4 selected tenant;
- current R5 authorization;
- target role in same organization;
- protected-system-role policy;
- delegation ceiling;
- optimistic concurrency;
- structured reason for HIGH/CRITICAL changes;
- immutable audit;
- next-request revocation semantics.

Permission-edge writes additionally require `permission.manage`.

Membership-role assignment/revocation additionally requires `role.manage`.

No request body may choose an authoritative actor organization, scope widening, protected status or audit actor.

## 11. Decision J — approval effect

If the owner explicitly approves this governance proposal, the following blockers are considered owner-resolved:

- seven provisional R-code identities;
- four shorthand capability normalization questions;
- R17 model;
- launch-role delegation ceilings;
- role vs permission administration semantics;
- permission metadata baseline;
- launch role-permission baseline.

That approval does **not**:

- satisfy independent review;
- freeze P4-R5-G0;
- authorize R5 implementation;
- merge PR #4;
- authorize R6+.

The next gate would remain genuine independent contract review.

## 12. Owner approval record

**Current state:** PENDING.

Valid approval should explicitly reference:

- `P4-R5-GOV-01`;
- the exact branch/head being approved;
- acceptance of Decisions A–J, or list specific amendments.

Until that happens, this document remains a proposal and all corresponding governance blockers remain open.
