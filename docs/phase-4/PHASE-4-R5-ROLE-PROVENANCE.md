# Phase 4 — R5 Role Provenance & Launch-Role Decision Record

**Document:** P4-R5-ROLE-01  
**Date:** September 26, 2026  
**Baseline:** `main@3e9418deb42c449cf3ae97da85a076e51c9c9089`  
**Status:** PROVISIONAL RECONSTRUCTION — OWNER APPROVAL REQUIRED  
**Implementation use:** PROHIBITED UNTIL APPROVED

## 1. Provenance finding

The Phase-2 documentation repeatedly states that Phase 2B froze **17 launch roles**, **35 visibility modules**, critical actions, seven scopes and client isolation.

The standalone Phase-2B file is not present in the repository and was not recovered from repository history or retained prior project context.

Therefore:

- the 17-role count is authoritative;
- several role-code/name relationships are recoverable from downstream frozen documents;
- the full exact R01–R17 mapping is **not** currently a recovered primary-source artifact;
- demo seed roles are not authoritative;
- R5 implementation must not silently declare a reconstructed list to be historical fact.

## 2. High-confidence role-code recovery

Frozen Phase-2D and Phase-2E documents allow several codes to be recovered by intersection.

| Code | Recovered role | Confidence | Evidence logic |
|---|---|---:|---|
| R01 | Super Admin | HIGH | hard-delete/admin restrictions and every high-risk allow set begin R01/R02; roles screen is Super Admin/Admin |
| R02 | Admin | HIGH | same downstream allow sets; roles/settings/admin screens |
| R03 | Sales Manager | HIGH | outreach launch is R01/R02/R03; Phase-2D says Super Admin/Admin/Sales Manager |
| R04 | Sales Executive | HIGH | proposal send R01/R02/R03/R04/R06; Phase-2D names Sales Executive/Manager + Account Manager + Admin |
| R06 | Account Manager | HIGH | proposal send and client-portal provisioning intersections |
| R07 | Editor-in-Chief | HIGH | publication allow set R01/R02/R07/R14; Phase-2D names EIC + Marketing & Distribution |
| R14 | Marketing & Distribution | HIGH | publication/distribution intersections |
| R15 | Finance Manager | HIGH | finance mutation R01/R02/R15; Phase-2D names Finance Manager |
| R16 | Operations Manager | HIGH | client portal/admin/departments intersection |
| R17 | Client User / Client Portal role family | HIGH | all client authorization references use R17 own client org/project |

## 3. Unresolved code positions

Downstream Phase-2E contains **zero direct R-code references** for:

- R05
- R08
- R09
- R10
- R11
- R12
- R13

The frozen downstream product/workflow documents repeatedly name seven specialist role families that logically fill those seven launch-role positions:

- Researcher
- Editor
- Writer
- Designer
- Podcast Producer
- Video Producer
- Events Manager

A plausible historical ordering is therefore:

| Code | Provisional candidate | Status |
|---|---|---|
| R05 | Researcher | PROVISIONAL |
| R08 | Editor | PROVISIONAL |
| R09 | Writer | PROVISIONAL |
| R10 | Designer | PROVISIONAL |
| R11 | Podcast Producer | PROVISIONAL |
| R12 | Video Producer | PROVISIONAL |
| R13 | Events Manager | PROVISIONAL |

**This ordering is a reconstruction, not recovered primary-source fact.**

## 4. Candidate 17-role registry

Subject to explicit approval, the complete candidate launch set is:

| Code | Candidate launch role | Surface | Typical base scope | Authority class |
|---|---|---|---|---|
| R01 | Super Admin | Team | ORG | highest platform/org administration |
| R02 | Admin | Team | ORG | broad organization administration |
| R03 | Sales Manager | Team | ORG/DEPT | commercial management |
| R04 | Sales Executive | Team | ASN/OWN | sales execution |
| R05 | Researcher | Team | ASN/DEPT | research/lead intelligence |
| R06 | Account Manager | Team | ASN/OWN | client/commercial ownership |
| R07 | Editor-in-Chief | Team | ORG/DEPT | editorial approval/publication authority |
| R08 | Editor | Team | ASN/DEPT | editorial review/production |
| R09 | Writer | Team | ASN/OWN | editorial drafting, no prohibited self-publish |
| R10 | Designer | Team | ASN/OWN | magazine/design production, no prohibited self-approval |
| R11 | Podcast Producer | Team | ASN/DEPT | podcast production |
| R12 | Video Producer | Team | ASN/DEPT | video production |
| R13 | Events Manager | Team | ORG/DEPT | event operations |
| R14 | Marketing & Distribution | Team | ORG/DEPT | publication distribution/growth |
| R15 | Finance Manager | Team | ORG | finance mutation/reconciliation |
| R16 | Operations Manager | Team | ORG/DEPT | operations/team/client provisioning |
| R17 | Client User | Client | CLIENT | own client organization + explicit client-safe resources |

The “typical base scope” column is also a design proposal; specific permissions can be narrower and must be evaluated per grant.

## 5. Functions that are not proven standalone launch roles

Frozen UI text also names functions such as:

- Security/Compliance
- Department Head
- Publishing
- Social/Marketing
- support
- client approver
- client signer
- client billing user
- client admin subset
- podcast/video team/editor variants

These may represent:

- a launch role under a different name;
- a department/team assignment;
- a permission subset;
- a scoped/custom role;
- a client-side entitlement/assignment;
- a future role.

R5 must not expand the 17-role launch set merely because a UI description uses a job-function label.

## 6. R17 client role strategy

The frozen system uses R17 as the client authorization family, but the Client Portal contains distinct capabilities:

- ordinary portal viewing;
- questionnaire editing;
- approvals;
- contract signing;
- billing/payment;
- limited client organization management.

R5 should model these as **permissions/assignments/conditions within the client organization**, not as browser flags.

Whether R17 remains one system role with permission subsets or multiple organization-local client roles is an explicit R5 decision. The launch-role count must not be silently altered.

## 7. System role rules proposed for R5

If the candidate registry is approved:

- launch role keys are stable;
- role identity is separate from display title;
- system roles cannot be hard-deleted;
- custom roles may be introduced only if the approved product permits them;
- custom roles cannot bypass R5 policy;
- R01/R02 role-management power is still constrained by anti-self-escalation and separation-of-duty rules;
- no role, including R01, bypasses the selected organization boundary by default;
- cross-client support/impersonation requires a separately designed, audited mechanism and is not implied by Super Admin.

## 8. Required owner decision before R5 implementation freeze

Choose one:

### Decision A — approve the reconstructed registry

The candidate R01–R17 mapping becomes the controlled launch-role source for R5.

### Decision B — supply/recover the original Phase-2B matrix

The recovered source supersedes provisional mappings after reconciliation.

### Decision C — explicitly redesign the launch roles

This is a product/governance change, not historical recovery. It requires a controlled decision record and updates to downstream role references.

Until one decision is recorded, R5 contract design may proceed, but **R5 implementation authorization remains blocked**.
