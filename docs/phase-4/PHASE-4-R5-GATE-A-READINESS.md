# Phase 4 — R5 Gate A Governance Readiness

**Document:** P4-R5-GATE-A-01
**Date:** September 27, 2026
**Planning baseline:** `main@3e9418deb42c449cf3ae97da85a076e51c9c9089`
**Status:** OWNER-DECISION READY — NOT OWNER-APPROVED
**Implementation:** LOCKED

## 1. Gate A package

The owner-governance decision package now consists of:

1. `PHASE-4-R5-OWNER-GOVERNANCE-DECISIONS.md`
2. `PHASE-4-R5-PERMISSION-POLICY-METADATA.md`
3. `PHASE-4-R5-LAUNCH-ROLE-PERMISSION-MATRIX.md`
4. existing role-provenance, permission-inventory, authority-matrix, threat-model and implementation-contract documents.

The package explicitly treats unrecoverable Phase-2B details as **new controlled V1 governance decisions**, not reconstructed historical fact.

## 2. Proposed decisions

The package proposes:

- approve R05 Researcher;
- approve R08 Editor;
- approve R09 Writer;
- approve R10 Designer;
- approve R11 Podcast Producer;
- approve R12 Video Producer;
- approve R13 Events Manager;
- keep R17 as one base Client User launch role;
- use CLIENT-scoped organization-local capability roles for client approver, signer, billing and limited client-admin authority;
- normalize the four shorthand capabilities into three new keys plus reuse of existing `approval.client.decide`;
- freeze 170 canonical permission keys;
- separate `role.manage` from `permission.manage`;
- freeze R01/R02 delegation ceilings;
- prohibit role administration for R03–R17;
- keep self-service authentication/profile permissions outside RolePermission;
- keep future-stage permissions dormant until their owning release is accepted.

## 3. Proposed client shorthand normalization

| Frozen shorthand | Proposed canonical V1 |
|---|---|
| `client.task.view/complete` | `client.task.view` + `client.task.complete` |
| `client.asset.upload/view` | `client.asset.upload` + `client.asset.view` |
| `client.approval.view/decide` | `client.approval.view` + existing `approval.client.decide` |
| `client.media.view/review` | `client.media.view` + `client.media.review` |

Canonical registry size after approval: **170**.

## 4. Mechanical consistency validation

A machine consistency pass was run across the proposed permission metadata and launch-role matrix.

Results:

| Check | Result |
|---|---:|
| canonical permission metadata rows | 170 |
| exact launch-role bundles | 17 |
| launch roles | 17 |
| unknown permission references | 0 |
| CLIENT capability roles containing non-CLIENT_ROLE permissions | 0 |
| SELF_ONLY permissions incorrectly placed in RBAC bundles | 0 |
| R17 containing Team-only permissions | 0 |
| Team launch roles containing Client-only permissions | 0 |
| role-permission scope with zero allowed-scope overlap | 0 |
| unresolved hard consistency findings | 0 |

## 5. Least-privilege corrections made during Gate A preparation

The audit corrected several proposal-level issues before owner approval:

1. `client.contact.manage` remains Team-side client management and is not granted to Client Portal client-admin capability roles.
2. Account Manager does not inherit the full outbound campaign/sending-account bundle merely to receive deal/proposal authority.
3. Operations Manager is ORG-scoped because its frozen team/department/settings/audit responsibilities are organization-level.
4. Read/projection permissions allow compatible broader role scopes while their resource policy still narrows records to OWN/ASN/client-safe semantics.
5. Sales commercial-exception authority can be DEPT-scoped for Sales Manager without becoming cross-organization authority.
6. Sending-account management supports scoped Sales authority instead of being forced to an organization-global permission.

## 6. What owner approval would close

Approval of the Gate-A package would close the current owner-governance blockers:

- seven provisional launch-role identities;
- shorthand permission normalization;
- R17 capability model;
- launch-role permission baseline;
- delegation ceilings;
- per-permission risk/surface/scope/obligation/assignability metadata.

It would **not** close:

- independent contract review;
- findings from that independent review;
- exact P4-R5-G0 freeze;
- explicit R5 implementation authorization.

## 7. Required owner approval form

A valid owner decision should state substantially:

```text
I approve P4-R5-GOV-01 and the Gate-A package on the exact R5 contract
candidate head identified in Draft PR #4, including the 17-role registry,
170-key permission normalization/metadata, R17 capability-role model,
launch role-permission matrix, and delegation ceilings.

This approval resolves Gate A only. It does not authorize R5 implementation,
merge PR #4, or authorize R6+.
```

Specific amendments may be listed instead.

## 8. Gate state

```text
Gate A package prepared          ✅
Mechanical consistency           ✅
Owner approval                    ⏳
Independent review                LOCKED UNTIL OWNER DECISION IS INCORPORATED
R5 implementation                 LOCKED
R6+                               LOCKED
```
