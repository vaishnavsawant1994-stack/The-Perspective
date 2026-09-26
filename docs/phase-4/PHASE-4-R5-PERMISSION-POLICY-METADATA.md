# Phase 4 — R5 Permission Policy Metadata Proposal

**Document:** P4-R5-PERM-02
**Date:** September 27, 2026
**Baseline:** `main@3e9418deb42c449cf3ae97da85a076e51c9c9089`
**Status:** PROPOSED V1 REGISTRY METADATA — OWNER APPROVAL REQUIRED
**Implementation:** LOCKED

## 1. Purpose

This document resolves the Gate-A requirement for explicit per-permission policy metadata.

It is a **new controlled V1 proposal** derived from the frozen permission inventory and R5 policy contract. It does not claim to reproduce the missing historical Phase-2B matrix.

Canonical registry size under the proposed normalization: **170 keys**.

The three new normalized keys are:

- `client.task.complete`
- `client.asset.view`
- `client.media.review`

The Phase-2E shorthand client approval action reuses existing `approval.client.decide`; no duplicate `client.approval.decide` is created.

## 2. Metadata semantics

- **Surface** — where the capability may be evaluated.
- **Risk** — control intensity, not authority.
- **Assignability** — whether a role may receive the key.
- **Scopes** — MembershipRole scopes under which the permission may exist. Scope is an upper bound; permission/resource semantics may narrow it further.
- **Field** — field/projection policy required.
- **Workflow** — workflow/state/version guard required.
- **Obligations** — minimum generic R5 obligations; later stages may add stricter domain rules.
- **Stage** — earliest owning stage allowed to execute the business operation. Registry presence before that stage is dormant vocabulary only.

A role may hold an OWN/ASN-limited projection permission while its MembershipRole scope is ORG or DEPT; permission/resource policy still narrows the effective records. Broader MembershipRole scope never overrides permission semantics.

Self-service permissions are not granted through RolePermission.

## 3. Exhaustive proposed registry

| Permission | Surface | Risk | Assignability | Permitted scopes | Field | Workflow | Minimum obligations | Activation |
|---|---|---|---|---|:---:|:---:|---|---|
| `analytics.distribution.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R11 |
| `approval.client.decide` | CLIENT | HIGH | CLIENT_ROLE | CLIENT | YES | YES | audit, exact-version, SoD, client-safe-projection | R8 |
| `approval.decide` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | audit, exact-version, SoD | R8 |
| `approval.override` | TEAM | CRITICAL | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | audit, reason, recent-auth, MFA, exact-version, SoD | R8 |
| `approval.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R8 |
| `audit.view` | TEAM | HIGH | TEAM_ROLE | ORG, READ | YES | NO | audit | R5 |
| `calendar.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R8 |
| `campaign.manage` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | audit | R6 |
| `campaign.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R6 |
| `client.approval.view` | CLIENT | LOW | CLIENT_ROLE | CLIENT | YES | NO | client-safe-projection | R12 |
| `client.asset.upload` | CLIENT | MEDIUM | CLIENT_ROLE | CLIENT | YES | NO | client-safe-projection | R12 |
| `client.asset.view` | CLIENT | LOW | CLIENT_ROLE | CLIENT | YES | NO | client-safe-projection | R12 |
| `client.auth.recover` | SELF_CLIENT | MEDIUM | SELF_ONLY | NONE, OWN | NO | NO | none | R3/R12 |
| `client.auth.signin` | SELF_CLIENT | HIGH | SELF_ONLY | NONE, OWN | NO | YES | audit | R3/R12 |
| `client.billing.pay` | CLIENT | HIGH | CLIENT_ROLE | CLIENT | YES | YES | audit, financial-evidence, SoD, client-safe-projection | R12 |
| `client.billing.view` | CLIENT | LOW | CLIENT_ROLE | CLIENT | YES | NO | client-safe-projection | R12 |
| `client.contact.manage` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | audit | R6 |
| `client.contract.sign` | CLIENT | HIGH | CLIENT_ROLE | CLIENT | YES | YES | audit, exact-version, client-safe-projection | R12 |
| `client.contract.view` | CLIENT | LOW | CLIENT_ROLE | CLIENT | YES | NO | client-safe-projection | R12 |
| `client.dashboard.view` | CLIENT | LOW | CLIENT_ROLE | CLIENT | YES | NO | client-safe-projection | R12 |
| `client.design.review` | CLIENT | HIGH | CLIENT_ROLE | CLIENT | YES | YES | audit, client-safe-projection | R12 |
| `client.design.view` | CLIENT | LOW | CLIENT_ROLE | CLIENT | YES | YES | client-safe-projection | R12 |
| `client.distribution.view` | CLIENT | LOW | CLIENT_ROLE | CLIENT | YES | NO | client-safe-projection | R12 |
| `client.draft.review` | CLIENT | MEDIUM | CLIENT_ROLE | CLIENT | YES | YES | client-safe-projection | R12 |
| `client.draft.view` | CLIENT | LOW | CLIENT_ROLE | CLIENT | YES | NO | client-safe-projection | R12 |
| `client.invite.accept` | SELF_CLIENT | MEDIUM | SELF_ONLY | NONE, OWN | NO | NO | none | R3/R12 |
| `client.media.review` | CLIENT | MEDIUM | CLIENT_ROLE | CLIENT | YES | YES | client-safe-projection | R12 |
| `client.media.view` | CLIENT | LOW | CLIENT_ROLE | CLIENT | YES | NO | client-safe-projection | R12 |
| `client.message.send` | CLIENT | HIGH | CLIENT_ROLE | CLIENT | YES | YES | audit, client-safe-projection | R12 |
| `client.message.view` | CLIENT | LOW | CLIENT_ROLE | CLIENT | YES | NO | client-safe-projection | R12 |
| `client.notification.view` | CLIENT | LOW | CLIENT_ROLE | CLIENT | YES | NO | client-safe-projection | R12 |
| `client.org.manage` | CLIENT | HIGH | CLIENT_ROLE | CLIENT | YES | NO | audit, client-safe-projection | R12 |
| `client.portal.manage` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | audit | R6 |
| `client.portal.provision` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | audit | R6 |
| `client.profile.edit` | SELF_CLIENT | MEDIUM | SELF_ONLY | NONE, OWN | YES | NO | none | R3/R12 |
| `client.project.activity.view` | CLIENT | LOW | CLIENT_ROLE | CLIENT | YES | NO | client-safe-projection | R12 |
| `client.project.view` | CLIENT | LOW | CLIENT_ROLE | CLIENT | YES | NO | client-safe-projection | R12 |
| `client.publication.view` | CLIENT | LOW | CLIENT_ROLE | CLIENT | YES | NO | client-safe-projection | R12 |
| `client.questionnaire.edit` | CLIENT | MEDIUM | CLIENT_ROLE | CLIENT | YES | NO | client-safe-projection | R12 |
| `client.questionnaire.view` | CLIENT | LOW | CLIENT_ROLE | CLIENT | YES | NO | client-safe-projection | R12 |
| `client.renewal.view` | CLIENT | LOW | CLIENT_ROLE | CLIENT | YES | NO | client-safe-projection | R12 |
| `client.report.view` | CLIENT | LOW | CLIENT_ROLE | CLIENT | YES | NO | client-safe-projection | R12 |
| `client.support.manage` | CLIENT | HIGH | CLIENT_ROLE | CLIENT | YES | NO | audit, client-safe-projection | R12 |
| `client.task.complete` | CLIENT | MEDIUM | CLIENT_ROLE | CLIENT | YES | YES | client-safe-projection | R12 |
| `client.task.view` | CLIENT | LOW | CLIENT_ROLE | CLIENT | YES | NO | client-safe-projection | R12 |
| `client.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R6 |
| `commercial.exception.approve` | TEAM | CRITICAL | TEAM_ROLE | ORG, DEPT | YES | YES | audit, reason, recent-auth, MFA, exact-version, SoD | R7 |
| `company.edit` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R6 |
| `company.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R6 |
| `contact.edit` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R6 |
| `contact.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R6 |
| `contract.edit` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R7 |
| `contract.send` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | audit, exact-version | R7 |
| `contract.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R7 |
| `dashboard.executive.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R5+ |
| `deal.edit` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R6 |
| `deal.manage` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | audit | R6 |
| `deal.move` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | none | R6 |
| `deal.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R6 |
| `department.manage` | TEAM | HIGH | TEAM_ROLE | ORG | YES | NO | audit | R5 |
| `design.approve` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | audit, exact-version, SoD | R9 |
| `design.cover.edit` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | audit | R9 |
| `design.cover.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | YES | none | R9 |
| `design.layout.manage` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | audit | R9 |
| `distribution.campaign.manage` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN | YES | NO | audit | R10 |
| `distribution.campaign.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, READ | YES | NO | none | R10 |
| `distribution.dashboard.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, READ | YES | NO | none | R10 |
| `distribution.launch` | TEAM | CRITICAL | TEAM_ROLE | ORG, DEPT, ASN | YES | YES | audit, reason, recent-auth, MFA, exact-version | R10 |
| `draft.edit` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R8 |
| `draft.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R8 |
| `editorial.approve` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | audit, exact-version, SoD | R8 |
| `editorial.dashboard.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R8 |
| `editorial.review` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | none | R8 |
| `editorial.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R8 |
| `emailaccount.manage` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | audit | R6 |
| `event.agenda.manage` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | audit | R8/R9 |
| `event.dashboard.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R8/R9 |
| `event.manage` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | audit | R8/R9 |
| `event.participant.manage` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | audit | R8/R9 |
| `event.registration.manage` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | audit | R8/R9 |
| `event.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R8/R9 |
| `file.version` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R8 |
| `file.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R8 |
| `inbox.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R6 |
| `integration.manage` | TEAM | CRITICAL | TEAM_ROLE | ORG | YES | NO | audit, reason, recent-auth, MFA | R13 |
| `invoice.edit` | TEAM | MEDIUM | TEAM_ROLE | ORG | YES | NO | none | R7 |
| `invoice.issue` | TEAM | CRITICAL | TEAM_ROLE | ORG | YES | YES | audit, reason, recent-auth, MFA, financial-evidence, SoD | R7 |
| `invoice.send` | TEAM | HIGH | TEAM_ROLE | ORG | YES | YES | audit | R7 |
| `invoice.view` | TEAM | LOW | TEAM_ROLE | ORG, READ | YES | NO | none | R7 |
| `lead.discover` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R6 |
| `lead.edit` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R6 |
| `lead.enrich` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R6 |
| `lead.extract.run` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R6 |
| `lead.import.review` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | none | R6 |
| `lead.list.manage` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | audit | R6 |
| `lead.qualify` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R6 |
| `lead.review` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | none | R6 |
| `lead.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R6 |
| `magazine.dashboard.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R9 |
| `magazine.proof.review` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | none | R9 |
| `magazine.reader.publish` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | audit, exact-version | R9 |
| `magazine.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R9 |
| `meeting.edit` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R6 |
| `meeting.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R6 |
| `message.read` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R6 |
| `message.send` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | audit | R6 |
| `notification.read.own` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R5+ |
| `outreach.dashboard.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R6 |
| `outreach.launch` | TEAM | CRITICAL | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | audit, reason, recent-auth, MFA, exact-version | R6 |
| `outreach.prepare` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | none | R6 |
| `package.manage` | TEAM | HIGH | TEAM_ROLE | ORG | YES | NO | audit | R7 |
| `payment.reconcile` | TEAM | CRITICAL | TEAM_ROLE | ORG | YES | YES | audit, reason, recent-auth, MFA, financial-evidence, SoD | R7 |
| `payment.refund` | TEAM | CRITICAL | TEAM_ROLE | ORG | YES | YES | audit, reason, recent-auth, MFA, financial-evidence, SoD | R7 |
| `payment.view` | TEAM | LOW | TEAM_ROLE | ORG, READ | YES | YES | financial-evidence, SoD | R7 |
| `permission.manage` | TEAM | CRITICAL | TEAM_ROLE | ORG | YES | NO | audit, reason, recent-auth, MFA, no-self, delegation-ceiling, optimistic-concurrency | R5 |
| `podcast.dashboard.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R8/R9 |
| `podcast.episode.edit` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R8/R9 |
| `podcast.episode.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R8/R9 |
| `podcast.guest.manage` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | audit | R8/R9 |
| `podcast.review` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | none | R8/R9 |
| `podcast.schedule.manage` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | audit | R8/R9 |
| `profile.update.own` | SELF_TEAM | MEDIUM | SELF_ONLY | NONE, OWN | YES | NO | none | R3 |
| `project.activity.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R8 |
| `project.assign` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | audit | R8 |
| `project.create` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R8 |
| `project.manage` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | audit | R8 |
| `project.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R8 |
| `proposal.approve` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | audit, exact-version, SoD | R6 |
| `proposal.edit` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R6 |
| `proposal.send` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | audit, exact-version | R6 |
| `proposal.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R6 |
| `publication.publish` | TEAM | CRITICAL | TEAM_ROLE | ORG, DEPT, ASN | YES | YES | audit, reason, recent-auth, MFA, exact-version | R9 |
| `publish.dashboard.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, READ | YES | YES | exact-version | R9 |
| `publish.execute` | TEAM | CRITICAL | TEAM_ROLE | ORG, DEPT, ASN | YES | YES | audit, reason, recent-auth, MFA, exact-version | R9 |
| `publish.queue.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, READ | YES | YES | exact-version | R9 |
| `publish.schedule` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN | YES | YES | audit, exact-version | R9 |
| `questionnaire.edit` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R8 |
| `questionnaire.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R8 |
| `renewal.edit` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R11 |
| `renewal.manage` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | audit | R11 |
| `renewal.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R11 |
| `reply.assign` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | audit | R6 |
| `reply.handle` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R6 |
| `reply.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R6 |
| `report.approve` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | audit, exact-version, SoD | R11 |
| `report.create` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R11 |
| `report.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R11 |
| `role.manage` | TEAM | CRITICAL | TEAM_ROLE | ORG | YES | NO | audit, reason, recent-auth, MFA, no-self, delegation-ceiling, optimistic-concurrency | R5 |
| `sequence.manage` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | audit | R6 |
| `settings.manage` | TEAM | CRITICAL | TEAM_ROLE | ORG | YES | NO | audit, reason, recent-auth, MFA | R13 |
| `source.manage` | TEAM | HIGH | TEAM_ROLE | ORG | YES | NO | audit | R6 |
| `staff.auth.mfa` | SELF_TEAM | MEDIUM | SELF_ONLY | NONE, OWN | NO | NO | none | R3 |
| `staff.auth.recover` | SELF_TEAM | MEDIUM | SELF_ONLY | NONE, OWN | NO | NO | none | R3 |
| `staff.auth.signin` | SELF_TEAM | HIGH | SELF_ONLY | NONE, OWN | NO | YES | audit | R3 |
| `staff.invite.accept` | SELF_TEAM | MEDIUM | SELF_ONLY | NONE, OWN | NO | NO | none | R3 |
| `task.edit` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R8 |
| `task.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R8 |
| `team.manage` | TEAM | HIGH | TEAM_ROLE | ORG | YES | NO | audit | R5 |
| `team.view` | TEAM | LOW | TEAM_ROLE | ORG, READ | YES | NO | none | R5 |
| `template.manage` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | audit | R6+ |
| `video.dashboard.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R8/R9 |
| `video.edit` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | none | R8/R9 |
| `video.publish.prepare` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | audit, exact-version | R8/R9 |
| `video.review` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | none | R8/R9 |
| `video.schedule.manage` | TEAM | HIGH | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | NO | audit | R8/R9 |
| `video.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R8/R9 |
| `workflow.move` | TEAM | MEDIUM | TEAM_ROLE | ORG, DEPT, ASN, OWN | YES | YES | none | R8 |
| `workflow.template.manage` | TEAM | HIGH | TEAM_ROLE | ORG | YES | NO | audit | R8 |
| `workspace.mywork.view` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R5+ |
| `workspace.search` | TEAM | LOW | TEAM_ROLE | ORG, DEPT, ASN, OWN, READ | YES | NO | none | R5+ |

## 4. Registry invariants

1. Permission matching is exact; wildcards are prohibited.
2. Unknown permission, surface, scope, risk or assignability metadata fails closed.
3. SELF_ONLY permissions cannot appear in RolePermission.
4. TEAM_ROLE permissions cannot be assigned to CLIENT-scoped capability roles.
5. CLIENT_ROLE permissions cannot confer Team access.
6. A registered permission whose activation stage has not been accepted is dormant: it cannot make an unimplemented business operation executable.
7. Risk metadata can require stronger controls but cannot widen authority.
8. Permitted scopes define role-grant compatibility. Permission semantics and resource policy may always narrow effective records further.
9. Field and workflow flags are minimum requirements, not bypasses.
10. Later domain contracts may narrow scopes/obligations but may not silently widen them.

## 5. Review items

Independent review must verify at least:

- every key from P4-R5-PERM-01 is present;
- the three normalization keys are present;
- `permission.manage` is present and distinct from `role.manage`;
- no SELF_ONLY key is role-assignable;
- no client capability is Team-assignable merely due to naming;
- financial/admin/publication permissions have sufficient risk/obligation classification;
- dormant-stage behavior prevents R5 from implementing R6+ work.

Owner approval is required before this metadata becomes the frozen production registry.
