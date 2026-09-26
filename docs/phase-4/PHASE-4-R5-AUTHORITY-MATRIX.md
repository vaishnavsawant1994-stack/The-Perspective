# Phase 4 — R5 Authorization Authority Matrix

**Document:** P4-R5-MATRIX-01
**Date:** September 26, 2026
**Planning baseline:** main@3e9418deb42c449cf3ae97da85a076e51c9c9089
**Status:** CONTRACT/DESIGN INPUT — IMPLEMENTATION LOCKED

## 1. Purpose

This document consolidates the role, permission, resource, action and scope evidence that R5 must turn into one server-side authorization model.

It does not claim that the missing Phase-2B primary matrix was recovered.

Rows marked RECOVERED are directly supported by frozen downstream documents. Rows marked PROVISIONAL require explicit owner approval before implementation.

## 2. Canonical decision dimensions

| Dimension | Source of truth | Browser authority? |
|---|---|---|
| identity | R3 verified session | No |
| membership | R4 selected active membership | No |
| organization | R4 selected organization | No |
| role | active same-organization MembershipRole to Role | No |
| permission | RolePermission to registered Permission | No |
| effect | RolePermission ALLOW/DENY | No |
| scope | MembershipRole.scope, narrowed by constraints | No |
| resource | trusted server ResourceContext/domain loader | ID may be supplied; attributes may not |
| fields | R5 field policy/projection | No |
| workflow state/version | canonical persisted workflow/resource | No |
| obligations | policy engine | No |
| final decision | R5 policy evaluator | No |

## 3. Candidate launch-role registry

| Code | Candidate role | Evidence status | Primary surface | Typical scope family | Important restrictions |
|---|---|---|---|---|---|
| R01 | Super Admin | RECOVERED HIGH | Team | ORG | no implicit cross-tenant bypass; no self-escalation exception |
| R02 | Admin | RECOVERED HIGH | Team | ORG | organization-bound; protected system actions still policy-controlled |
| R03 | Sales Manager | RECOVERED HIGH | Team | ORG/DEPT | commercial/outreach authority only where granted |
| R04 | Sales Executive | RECOVERED HIGH | Team | ASN/OWN | cannot borrow manager ORG scope |
| R05 | Researcher | PROVISIONAL | Team | ASN/DEPT | no outreach-launch authority unless separately granted |
| R06 | Account Manager | RECOVERED HIGH | Team | ASN/OWN | client/account ownership; no automatic finance/admin authority |
| R07 | Editor-in-Chief | RECOVERED HIGH | Team | ORG/DEPT | high editorial/publication authority; SoD still applies |
| R08 | Editor | PROVISIONAL | Team | ASN/DEPT | editorial review; no generic administrative authority |
| R09 | Writer | PROVISIONAL | Team | ASN/OWN | cannot self-publish prohibited own work |
| R10 | Designer | PROVISIONAL | Team | ASN/OWN | cannot self-approve prohibited own design |
| R11 | Podcast Producer | PROVISIONAL | Team | ASN/DEPT | production assignment/resource policy required |
| R12 | Video Producer | PROVISIONAL | Team | ASN/DEPT | production assignment/resource policy required |
| R13 | Events Manager | PROVISIONAL | Team | ORG/DEPT | events domain only unless explicitly granted |
| R14 | Marketing & Distribution | RECOVERED HIGH | Team | ORG/DEPT | publish/distribution authority where exact permission/guards pass |
| R15 | Finance Manager | RECOVERED HIGH | Team | ORG | finance mutation/reconciliation; no tenant bypass |
| R16 | Operations Manager | RECOVERED HIGH | Team | ORG/DEPT | team/client provisioning/operations where granted |
| R17 | Client User / Client role family | RECOVERED HIGH | Client | CLIENT | own client organization/project; client-safe projection only |

The seven provisional role-code assignments remain a freeze blocker.

## 4. High-confidence critical-action matrix

Legend: Y means explicitly supported by frozen downstream evidence. P means a scoped subset may be allowed but the exact role-code mapping is not recovered. A dash means no recovered authority for that action.

| Critical action | R01 | R02 | R03 | R04 | R06 | R07 | R14 | R15 | R16 | R17 | Required policy beyond role |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|---|
| launch outreach | Y | Y | Y | — | — | — | — | — | — | — | outreach.launch, tenant, campaign guards |
| send proposal | Y | Y | Y | Y | Y | — | — | — | — | — | proposal.send, deal/client scope, current version |
| commercial exception / discount approval | Y | Y | Y | — | — | — | — | Y | — | — | exception permission, reason/SoD |
| send/create governed contract | Y | Y | Y | — | — | — | — | Y | — | — | contract.send, exact version, signer/client scope |
| issue invoice | Y | Y | — | — | — | — | — | Y | — | — | invoice.issue, finance/client constraints |
| reconcile/refund payment | Y | Y | — | — | — | — | — | Y | — | — | payment.reconcile/refund, provider evidence, SoD |
| provision Client Portal | Y | Y | — | — | Y | — | — | — | Y | — | client.portal.provision, same client org |
| publish publication | Y | Y | — | — | — | Y | Y | — | — | — | publication.publish, approved manifest/version |
| launch distribution | Y | Y | — | — | — | — | Y | — | — | — | distribution.launch, approved item/provider evidence |
| role administration | Y | Y | — | — | — | — | — | — | — | — | role.manage; anti-self-escalation |
| permission-edge administration | Y* | Y* | — | — | — | — | — | — | — | — | permission.manage; delegation ceiling; owner approval still required |
| team/department administration | Y | Y | — | — | — | — | — | — | P | — | team.manage / department.manage; target policy |
| hard-delete protected administrative record | Y | — | — | — | — | — | — | — | — | — | destructive policy; reason/audit |
| decide client approval | — | — | — | — | — | — | — | — | — | Y | approval.client.decide, own org/project, exact active version |

The R01/R02 permission.manage assignment is a downstream reconstruction and remains owner-approval dependent because the primary Phase-2B matrix is missing.

## 5. Specialist authority families

| Domain | Named authority | Typical actions | Mandatory restrictions |
|---|---|---|---|
| research / lead intelligence | Researcher; Sales Executive/Manager; Admin | review, qualify, discover, enrich | tenant, provenance, DNC/suppression, assigned/department scope |
| sales / outreach | Sales roles; Sales Manager | prepare/launch outreach, deals, proposals | launch permission stronger than edit; assignment/ownership |
| account/client success | Account Manager | client/project/report/renewal work | assigned/owned clients; no unrelated client access |
| editorial | Writer, Editor, EIC | draft, review, approve | writer no prohibited self-publish; exact version; SoD |
| design/magazine | Designer, Editor, EIC/Admin | design/layout/proof/approve | designer no prohibited self-approval; exact proof/version |
| podcast | Podcast Producer/team | guest, schedule, episode edit/review | assignment; shared versions for client |
| video | Video Producer/team | schedule/edit/review/prepare publish | assignment; exact approved media version |
| events | Events Manager | event/agenda/registration/participants | event scope; governed cancellation/refund |
| publishing | EIC; Marketing & Distribution; Admin | validate/schedule/publish | exact approved manifest; publication workflow state |
| distribution | Marketing & Distribution; Admin | campaign launch/retry | provider evidence; authorized publication/item |
| finance | Finance Manager; Admin | invoice/payment/refund/reconcile | immutable provider/accounting evidence; SoD |
| operations | Operations Manager; Admin | departments/team/client provisioning | selected organization; delegation ceiling |
| client | R17 client authority | portal/project/message/questionnaire/review/billing subsets | own client org/project, client-safe fields, active request/version |

## 6. Resource policy families

| Resource/policy family | Tenant relation | Common scope modes | Field/projection rule | Typical actions |
|---|---|---|---|---|
| IAM role/permission/membership | selected organization | ORG; highly restricted | security fields server-only | view, create, assign, revoke, manage permissions |
| generic platform Resource | owner/client org | ORG, CLIENT, READ | visibility/sensitivity policy | read/list |
| person/profile self-service | selected identity/membership | OWN/NONE | own allowlisted profile fields | read/update own |
| organization/team/department | selected organization | ORG/DEPT | no foreign-org membership data | view/manage |
| lead/company/contact | selected organization | ORG/DEPT/ASN/OWN | provenance/suppression restrictions | view/edit/qualify/assign |
| deal/proposal/contract | selected organization + client relation | ORG/DEPT/ASN/OWN | commercial/internal vs client-safe | view/edit/send/approve |
| invoice/payment | selected organization + client relation | ORG | finance/client-safe projections | view/issue/reconcile/refund |
| client/project | owner organization + client organization | ORG/ASN/OWN/CLIENT | internal vs CLIENT_SHARED | view/manage/provision |
| workflow/task/assignment | project/org + assignee | ORG/DEPT/ASN/OWN/CLIENT | client-visible tasks only | view/edit/move/complete |
| editorial/draft/version | org/project/client | DEPT/ASN/OWN/CLIENT | internal comments/versions excluded client-side | view/edit/review/approve |
| design/magazine/proof | org/project/client | DEPT/ASN/OWN/CLIENT | exact shared proof/version | view/edit/review/approve |
| podcast/video/event | org/project/client | DEPT/ASN/OWN/CLIENT | client-safe stages/assets | view/edit/review/manage |
| publication | owner organization | ORG/DEPT/ASN | exact approved manifest | view/schedule/publish |
| distribution | owner organization/client/report relation | ORG/DEPT/ASN/CLIENT | provider config internal; client results safe | view/manage/launch |
| report/analytics | owner/client organization | ORG/DEPT/ASN/OWN/CLIENT/READ | source/cutoff/client-ready version | view/create/approve/deliver |
| files/assets | org/project/client + rights/version | ORG/DEPT/ASN/OWN/CLIENT/READ | signed URL after policy; client-safe versions | view/upload/version/download |
| audit/security evidence | selected organization | ORG/READ, restricted | raw security fields highly restricted | view/export only under explicit policy |

## 7. Action vocabulary

| Action class | Examples | Notes |
|---|---|---|
| discover/list/search | discover, list, search | authorization filters before counts/facets/page |
| read/view | view, read | may still require field masking |
| create | create | cannot set server-owned authority fields |
| update/edit/manage | edit, manage | field allowlist required |
| assign | assign | target actor + delegation policy |
| transition | move, complete, reopen | workflow guard required |
| review | review | exact version/resource required |
| approve/decide | approve, decide, override | SoD/no-self/exact version as applicable |
| send/launch | send, launch | stronger than edit; external side-effect guard |
| publish | publish | approved manifest/version + higher-risk permission |
| reconcile/refund/pay | reconcile, refund, pay | finance/provider evidence |
| export/download | export, download | same-or-stricter record/field policy + audit |
| administer | manage role/permission/team/settings/integration | delegation ceiling + audit |

Generic manage does not imply every stronger semantic action unless the registered permission explicitly represents it.

## 8. Scope compatibility rules

| Scope | Can prove | Cannot prove by itself |
|---|---|---|
| ORG | eligible resource belongs to selected organization | cross-org/global authority |
| DEPT | trusted resource department matches permitted department | arbitrary org-wide access |
| ASN | active trusted assignment matches actor | ownership of unassigned records |
| OWN | trusted owner relation matches actor | assigned/team/department records not owned |
| CLIENT | selected client org + explicit client relationship/projection | Team/internal fields |
| READ | read-only access when record policy passes | mutation/approval/publish/export |
| NONE | identity/self/special explicit operation | generic resource record access |

Role.defaultScope does not participate in runtime widening. Runtime scope comes from the current MembershipRole.scope.

## 9. Field policy classes

R5 field policy must classify fields as needed into public/shared, ordinary authorized Team, client-safe, confidential, PII, financial, security, secret, server-owned and immutable evidence.

Always-excluded Client Portal classes from Phase-2C:

- lead source/enrichment;
- internal sales notes;
- forecasts/margins;
- staff performance/capacity;
- internal editorial/QA comments;
- unshared versions;
- provider/processor secrets;
- raw security/audit data;
- other clients;
- private automation metadata.

## 10. Permission administration matrix

| Operation | Minimum policy requirement |
|---|---|
| view roles | role.manage or an explicit read capability chosen at freeze; tenant-bound |
| create/edit role metadata | role.manage, delegation ceiling, system-role rules, audit |
| archive custom role | role.manage, no protected-role lockout, audit |
| assign/revoke MembershipRole | role.manage + target/delegation policy + tenant-bound |
| view permission matrix | role.manage and/or explicit read policy chosen at freeze |
| mutate RolePermission edge | permission.manage, delegation ceiling, optimistic concurrency, reason/audit |
| grant CRITICAL permission | permission.manage + explicit delegation ceiling + stronger obligation |
| alter protected system role | deny unless frozen R5 role governance explicitly permits controlled mutation |

## 11. Client capability matrix

| Capability family | Required conditions |
|---|---|
| dashboard/project view | R17/client membership + own client org/project + client permission |
| messages | own org/thread + client-shared message; internal notes excluded |
| questionnaire | assigned/authorized questionnaire + lifecycle guard |
| draft/design/media review | exact shared version + active request + approver capability where deciding |
| asset upload | own project + client-safe asset policy + rights/version controls |
| approvals | own client/project + exact active request/version + decision capability |
| contract | client-safe contract; signer capability for signing |
| billing | client-safe invoice/payment projection; billing capability for payment |
| reports/publication/distribution | delivered/client-ready records only |
| client-org administration | limited client-admin subset only; never Team/admin authority |

## 12. Freeze blockers reflected by this matrix

This matrix cannot become implementation-authoritative until:

1. the seven provisional R-code assignments are approved or replaced by recovered source;
2. exact normalization of the four Phase-2E slash-shorthand client permissions is approved;
3. the launch role-to-permission matrix is approved, including delegation ceilings;
4. R17 client role/sub-role strategy is explicitly decided;
5. independent contract review is complete.

Until then this is an audited design input, not production policy.
