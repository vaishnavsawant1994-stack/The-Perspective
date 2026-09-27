# Phase 4 — R5 Derived Permission Inventory

**Document:** P4-R5-PERM-01  
**Date:** September 26, 2026  
**Baseline:** `main@3e9418deb42c449cf3ae97da85a076e51c9c9089`  
**Status:** DERIVED INPUT FOR R5 CONTRACT — IMPLEMENTATION LOCKED

## 1. Purpose

The primary Phase-2B permission matrix is missing, but frozen downstream documents preserve two independent permission sources:

1. Phase-2E screen contracts quoting the Phase-2A screen permission for each operational surface.
2. Phase-2D transition rules defining higher-risk workflow-command permissions.

The Phase-2D/2E union contains **166 explicit permission keys**. Frozen Phase-2F additionally names `permission.manage`, producing **167 explicit permission keys**. Four Phase-2E client lines use slash shorthand (`client.task.view/complete`, `client.asset.upload/view`, `client.approval.view/decide`, `client.media.view/review`) that prove additional distinct capabilities but do not preserve their exact historical normalized key names; those four names remain unresolved rather than being invented.

This is a derived inventory, not a replacement for the missing role-to-permission matrix.

## 2. Canonical R5 permission model

R5 must treat a permission as a named capability that still requires policy evaluation:

```text
permission key
+ active same-tenant role grant
+ same-grant scope
+ typed constraints
+ resource context
+ field policy
+ workflow/action guard
+ separation-of-duty / obligation checks
= authorization decision
```

A permission never bypasses tenancy.

A permission never means every record or every field.

## 3. Key taxonomy

Preferred key shape:

```text
<domain>.<action>[.<qualifier>]
```

Examples:

- `lead.view`
- `payment.refund`
- `notification.read.own`
- `client.design.review`

R5 should preserve existing frozen keys wherever possible. Renaming requires an alias/migration decision rather than silent drift.

## 4. Capability classes

R5 should distinguish:

- **surface/query capability** — open/list/view/search a product area;
- **record mutation capability** — create/edit/assign/archive;
- **workflow command authority** — approve/send/publish/refund/launch;
- **administrative authority** — team/role/settings/integration management;
- **self-service authority** — own profile/preferences/session actions;
- **client capability** — explicit client-safe projection/action only.

The same domain may legitimately contain both screen/query keys and higher-risk workflow-command keys.

## 5. Derived permission registry

### Additional explicit Phase-2F key

- `permission.manage` — required by Phase-2F for role-permission changes; distinct from the Phase-2E screen capability `role.manage`.

### Unresolved slash-shorthand capabilities

The following frozen UI strings show multiple client capabilities but do not preserve the exact original key spelling for the second capability:

- `client.task.view/complete`
- `client.asset.upload/view`
- `client.approval.view/decide`
- `client.media.view/review`

R5 contract freeze must either recover their original names or record an explicit normalization decision. Until then, no inferred second-key names may be seeded as historical fact.



### analytics

- `analytics.distribution.view` — Phase-2E

### approval

- `approval.client.decide` — Phase-2D
- `approval.decide` — Phase-2E
- `approval.override` — Phase-2D
- `approval.view` — Phase-2E

### audit

- `audit.view` — Phase-2E

### calendar

- `calendar.view` — Phase-2E

### campaign

- `campaign.manage` — Phase-2E
- `campaign.view` — Phase-2E

### client

- `client.approval.view` — Phase-2E
- `client.asset.upload` — Phase-2E
- `client.auth.recover` — Phase-2E
- `client.auth.signin` — Phase-2E
- `client.billing.pay` — Phase-2E
- `client.billing.view` — Phase-2E
- `client.contact.manage` — Phase-2E
- `client.contract.sign` — Phase-2E
- `client.contract.view` — Phase-2E
- `client.dashboard.view` — Phase-2E
- `client.design.review` — Phase-2E
- `client.design.view` — Phase-2E
- `client.distribution.view` — Phase-2E
- `client.draft.review` — Phase-2E
- `client.draft.view` — Phase-2E
- `client.invite.accept` — Phase-2E
- `client.media.view` — Phase-2E
- `client.message.send` — Phase-2E
- `client.message.view` — Phase-2E
- `client.notification.view` — Phase-2E
- `client.org.manage` — Phase-2E
- `client.portal.manage` — Phase-2E
- `client.portal.provision` — Phase-2D
- `client.profile.edit` — Phase-2E
- `client.project.activity.view` — Phase-2E
- `client.project.view` — Phase-2E
- `client.publication.view` — Phase-2E
- `client.questionnaire.edit` — Phase-2E
- `client.questionnaire.view` — Phase-2E
- `client.renewal.view` — Phase-2E
- `client.report.view` — Phase-2E
- `client.support.manage` — Phase-2E
- `client.task.view` — Phase-2E
- `client.view` — Phase-2E

### commercial

- `commercial.exception.approve` — Phase-2D

### company

- `company.edit` — Phase-2E
- `company.view` — Phase-2E

### contact

- `contact.edit` — Phase-2E
- `contact.view` — Phase-2E

### contract

- `contract.edit` — Phase-2E
- `contract.send` — Phase-2E + Phase-2D
- `contract.view` — Phase-2E

### dashboard

- `dashboard.executive.view` — Phase-2E

### deal

- `deal.edit` — Phase-2E
- `deal.manage` — Phase-2D
- `deal.move` — Phase-2E
- `deal.view` — Phase-2E

### department

- `department.manage` — Phase-2E

### design

- `design.approve` — Phase-2D
- `design.cover.edit` — Phase-2E
- `design.cover.view` — Phase-2E
- `design.layout.manage` — Phase-2E

### distribution

- `distribution.campaign.manage` — Phase-2E
- `distribution.campaign.view` — Phase-2E
- `distribution.dashboard.view` — Phase-2E
- `distribution.launch` — Phase-2D

### draft

- `draft.edit` — Phase-2E
- `draft.view` — Phase-2E

### editorial

- `editorial.approve` — Phase-2D
- `editorial.dashboard.view` — Phase-2E
- `editorial.review` — Phase-2E + Phase-2D
- `editorial.view` — Phase-2E

### emailaccount

- `emailaccount.manage` — Phase-2E

### event

- `event.agenda.manage` — Phase-2E
- `event.dashboard.view` — Phase-2E
- `event.manage` — Phase-2E + Phase-2D
- `event.participant.manage` — Phase-2E
- `event.registration.manage` — Phase-2E
- `event.view` — Phase-2E

### file

- `file.version` — Phase-2E
- `file.view` — Phase-2E

### inbox

- `inbox.view` — Phase-2E

### integration

- `integration.manage` — Phase-2E

### invoice

- `invoice.edit` — Phase-2E
- `invoice.issue` — Phase-2D
- `invoice.send` — Phase-2E
- `invoice.view` — Phase-2E

### lead

- `lead.discover` — Phase-2E
- `lead.edit` — Phase-2E
- `lead.enrich` — Phase-2E
- `lead.extract.run` — Phase-2E
- `lead.import.review` — Phase-2E
- `lead.list.manage` — Phase-2E
- `lead.qualify` — Phase-2D
- `lead.review` — Phase-2D
- `lead.view` — Phase-2E

### magazine

- `magazine.dashboard.view` — Phase-2E
- `magazine.proof.review` — Phase-2E
- `magazine.reader.publish` — Phase-2E
- `magazine.view` — Phase-2E

### meeting

- `meeting.edit` — Phase-2E
- `meeting.view` — Phase-2E

### message

- `message.read` — Phase-2E
- `message.send` — Phase-2E

### notification

- `notification.read.own` — Phase-2E

### outreach

- `outreach.dashboard.view` — Phase-2E
- `outreach.launch` — Phase-2D
- `outreach.prepare` — Phase-2D

### package

- `package.manage` — Phase-2E

### payment

- `payment.reconcile` — Phase-2D
- `payment.refund` — Phase-2E + Phase-2D
- `payment.view` — Phase-2E

### podcast

- `podcast.dashboard.view` — Phase-2E
- `podcast.episode.edit` — Phase-2E
- `podcast.episode.view` — Phase-2E
- `podcast.guest.manage` — Phase-2E
- `podcast.review` — Phase-2E
- `podcast.schedule.manage` — Phase-2E

### profile

- `profile.update.own` — Phase-2E

### project

- `project.activity.view` — Phase-2E
- `project.assign` — Phase-2D
- `project.create` — Phase-2E
- `project.manage` — Phase-2D
- `project.view` — Phase-2E

### proposal

- `proposal.approve` — Phase-2E
- `proposal.edit` — Phase-2E
- `proposal.send` — Phase-2D
- `proposal.view` — Phase-2E

### publication

- `publication.publish` — Phase-2D

### publish

- `publish.dashboard.view` — Phase-2E
- `publish.execute` — Phase-2E
- `publish.queue.view` — Phase-2E
- `publish.schedule` — Phase-2E

### questionnaire

- `questionnaire.edit` — Phase-2E
- `questionnaire.view` — Phase-2E

### renewal

- `renewal.edit` — Phase-2E
- `renewal.manage` — Phase-2D
- `renewal.view` — Phase-2E

### reply

- `reply.assign` — Phase-2E
- `reply.handle` — Phase-2E
- `reply.view` — Phase-2E

### report

- `report.approve` — Phase-2D
- `report.create` — Phase-2E
- `report.view` — Phase-2E

### role

- `role.manage` — Phase-2E

### sequence

- `sequence.manage` — Phase-2E

### settings

- `settings.manage` — Phase-2E

### source

- `source.manage` — Phase-2E

### staff

- `staff.auth.mfa` — Phase-2E
- `staff.auth.recover` — Phase-2E
- `staff.auth.signin` — Phase-2E
- `staff.invite.accept` — Phase-2E

### task

- `task.edit` — Phase-2E
- `task.view` — Phase-2E

### team

- `team.manage` — Phase-2E
- `team.view` — Phase-2E

### template

- `template.manage` — Phase-2E

### video

- `video.dashboard.view` — Phase-2E
- `video.edit` — Phase-2E
- `video.publish.prepare` — Phase-2E
- `video.review` — Phase-2E
- `video.schedule.manage` — Phase-2E
- `video.view` — Phase-2E

### workflow

- `workflow.move` — Phase-2E
- `workflow.template.manage` — Phase-2E

### workspace

- `workspace.mywork.view` — Phase-2E
- `workspace.search` — Phase-2E


## 6. Frozen seven-scope vocabulary

| Scope | Record-bound interpretation |
|---|---|
| ORG | selected organization |
| DEPT | actor membership's authorized department |
| ASN | explicit assignment |
| OWN | actor/membership ownership |
| CLIENT | selected client organization and client-safe visibility |
| READ | read-only operation boundary |
| NONE | no generic resource scope |

Scopes do not replace permissions.

## 7. Normalization decisions required by R5

The contract must resolve:

1. UI/query vs workflow-command keys that overlap semantically.
2. `role.manage` vs `permission.manage`: role/screen administration and permission-edge administration must remain distinct; changing `RolePermission` requires `permission.manage`, while `role.manage` governs the role-management surface/role lifecycle as frozen by Phase-2E. An operation affecting both must satisfy both relevant policies.
3. risk level for every production permission.
4. which permissions may use which scope values.
5. which permissions require reason, MFA/recent authentication, exact version, approval or separation of duty.
6. which permissions are Team-only, Client-only, self-service or system-only.
7. which permissions require field-level policies.
8. which permissions are future-domain keys that can be registered now but must not authorize unimplemented R6+ behavior.
9. exact normalization for the four slash-shorthand client capabilities.

## 8. Effect semantics

`RolePermission.effect` already supports ALLOW and DENY.

R5 contract must freeze:

- explicit applicable DENY overrides applicable ALLOW;
- unknown permission = DENY;
- inactive role = no grant;
- expired membership-role grant = no grant;
- malformed constraints = DENY;
- permission from one role cannot borrow scope/constraints from another role.

## 9. Implementation boundary

This inventory may be used to design R5 tables, validators, tests and policy types.

It must **not** be used to seed production role assignments until the launch-role matrix is owner-approved and the R5 contract is independently reviewed/frozen.
