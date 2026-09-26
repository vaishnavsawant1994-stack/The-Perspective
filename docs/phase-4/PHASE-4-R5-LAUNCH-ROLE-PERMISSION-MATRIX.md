# Phase 4 — R5 Launch Role → Permission & Delegation Matrix Proposal

**Document:** P4-R5-ROLE-02
**Date:** September 27, 2026
**Baseline:** `main@3e9418deb42c449cf3ae97da85a076e51c9c9089`
**Status:** PROPOSED V1 AUTHORITY BASELINE — OWNER APPROVAL REQUIRED
**Implementation:** LOCKED

## 1. Purpose

This document supplies the missing Gate-A launch role-to-permission/delegation baseline as a **new controlled V1 governance decision**.

It does not claim to recover the missing historical Phase-2B matrix.

The companion permission metadata document remains authoritative for each key's surface, risk, assignability, permitted scopes, policy obligations and activation stage.

## 2. Matrix rules

1. A role grants only the exact keys listed by its bundles/overrides.
2. Bundle membership is exact; there are no wildcard permissions.
3. Every grant is still subject to current MembershipRole scope, resource policy, field policy, workflow state and obligations.
4. Future-stage permissions are dormant until their owning stage is accepted.
5. SELF_ONLY permissions never appear in this role matrix.
6. R01/R02 are not tenant bypass roles.
7. R03–R17 do not receive `role.manage` or `permission.manage`.
8. A role may be assigned only with a MembershipRole scope allowed both by this document and the permission registry.
9. A broad role permission never converts ASN/OWN/DEPT scope into ORG.
10. Explicit applicable DENY remains stronger than ALLOW.

## 3. Exact reusable permission bundles

### B01 — Staff Core

- `workspace.mywork.view`
- `workspace.search`
- `notification.read.own`
- `calendar.view`
- `task.view`
- `file.view`

### B02 — Project Contributor

- `project.view`
- `project.activity.view`
- `task.edit`
- `file.version`
- `message.read`
- `message.send`
- `meeting.view`

### B03 — Research / Lead Intelligence

- `lead.discover`
- `lead.view`
- `lead.edit`
- `lead.enrich`
- `lead.extract.run`
- `lead.import.review`
- `lead.list.manage`
- `lead.review`
- `lead.qualify`
- `company.view`
- `contact.view`

### B04 — Sales Execution

- `company.edit`
- `contact.edit`
- `outreach.dashboard.view`
- `outreach.prepare`
- `campaign.view`
- `campaign.manage`
- `sequence.manage`
- `template.manage`
- `emailaccount.manage`
- `reply.view`
- `reply.handle`
- `inbox.view`
- `meeting.edit`
- `deal.view`
- `deal.edit`
- `deal.move`
- `deal.manage`
- `proposal.view`
- `proposal.edit`
- `proposal.send`

### B05 — Sales Management

- `dashboard.executive.view`
- `outreach.launch`
- `reply.assign`
- `proposal.approve`
- `commercial.exception.approve`
- `contract.view`
- `contract.edit`
- `contract.send`

### B06 — Account / Client Management

- `client.view`
- `client.contact.manage`
- `client.portal.manage`
- `client.portal.provision`
- `project.create`
- `project.manage`
- `project.assign`
- `workflow.move`
- `approval.view`
- `approval.decide`
- `report.create`
- `report.view`
- `report.approve`
- `renewal.view`
- `renewal.edit`
- `renewal.manage`

### B07 — Editorial Writer

- `editorial.view`
- `draft.view`
- `draft.edit`
- `questionnaire.view`
- `questionnaire.edit`

### B08 — Editorial Editor

- `editorial.dashboard.view`
- `editorial.review`
- `approval.view`
- `approval.decide`
- `magazine.view`
- `magazine.proof.review`
- `design.cover.view`

### B09 — Editorial Executive

- `editorial.approve`
- `approval.override`
- `design.approve`
- `magazine.dashboard.view`
- `magazine.reader.publish`
- `publish.dashboard.view`
- `publish.queue.view`
- `publish.schedule`
- `publish.execute`
- `publication.publish`

### B10 — Design Production

- `magazine.dashboard.view`
- `magazine.view`
- `design.cover.view`
- `design.cover.edit`
- `design.layout.manage`
- `magazine.proof.review`

### B11 — Podcast Production

- `podcast.dashboard.view`
- `podcast.guest.manage`
- `podcast.episode.view`
- `podcast.episode.edit`
- `podcast.schedule.manage`
- `podcast.review`

### B12 — Video Production

- `video.dashboard.view`
- `video.view`
- `video.edit`
- `video.schedule.manage`
- `video.review`
- `video.publish.prepare`

### B13 — Events Operations

- `event.dashboard.view`
- `event.view`
- `event.manage`
- `event.participant.manage`
- `event.agenda.manage`
- `event.registration.manage`

### B14 — Publishing & Distribution

- `publish.dashboard.view`
- `publish.queue.view`
- `publish.schedule`
- `publish.execute`
- `publication.publish`
- `distribution.dashboard.view`
- `distribution.campaign.view`
- `distribution.campaign.manage`
- `distribution.launch`
- `analytics.distribution.view`
- `report.view`

### B15 — Finance

- `commercial.exception.approve`
- `package.manage`
- `proposal.view`
- `proposal.approve`
- `contract.view`
- `contract.edit`
- `contract.send`
- `invoice.view`
- `invoice.edit`
- `invoice.send`
- `invoice.issue`
- `payment.view`
- `payment.reconcile`
- `payment.refund`
- `report.view`

### B16 — Operations

- `dashboard.executive.view`
- `team.view`
- `team.manage`
- `department.manage`
- `client.portal.provision`
- `project.view`
- `project.manage`
- `project.assign`
- `workflow.template.manage`
- `report.create`
- `report.view`
- `report.approve`
- `audit.view`
- `settings.manage`

R16's `settings.manage` grant is constrained to approved operational settings. It does not imply security-secret, permission-edge or integration-credential administration.

### B17 — Client User Base

- `client.dashboard.view`
- `client.project.view`
- `client.project.activity.view`
- `client.message.view`
- `client.message.send`
- `client.notification.view`
- `client.task.view`
- `client.task.complete`
- `client.support.manage`
- `client.questionnaire.view`
- `client.questionnaire.edit`
- `client.draft.view`
- `client.design.view`
- `client.asset.upload`
- `client.asset.view`
- `client.approval.view`
- `client.media.view`
- `client.contract.view`
- `client.billing.view`
- `client.publication.view`
- `client.distribution.view`
- `client.report.view`
- `client.renewal.view`

The following are intentionally **not** in B17:

- `approval.client.decide`
- `client.draft.review`
- `client.design.review`
- `client.media.review`
- `client.contract.sign`
- `client.billing.pay`
- `client.org.manage`

Those require explicit client capability roles.

## 4. Launch-role assignment matrix

| Role | Proposed allowed MembershipRole scopes | Exact bundles / explicit permissions |
|---|---|---|
| R01 Super Admin | ORG | **ALL TEAM_ROLE permissions** in P4-R5-PERM-02, including `role.manage` and `permission.manage`, subject to R01 governance constraints |
| R02 Admin | ORG | **ALL TEAM_ROLE permissions** in P4-R5-PERM-02, including `role.manage` and `permission.manage`, but protected from creating/modifying R01-equivalent authority |
| R03 Sales Manager | ORG, DEPT | B01 + B02 + B03 + B04 + B05 + `source.manage` |
| R04 Sales Executive | DEPT, ASN, OWN | B01 + B02 + B03 + B04 |
| R05 Researcher | DEPT, ASN, OWN | B01 + B02 + B03 |
| R06 Account Manager | DEPT, ASN, OWN | B01 + B02 + B04 + B06 + `dashboard.executive.view` |
| R07 Editor-in-Chief | ORG, DEPT | B01 + B02 + B07 + B08 + B09 + `project.manage` + `project.assign` + `report.view` |
| R08 Editor | DEPT, ASN, OWN | B01 + B02 + B07 + B08 |
| R09 Writer | ASN, OWN | B01 + B02 + B07 |
| R10 Designer | ASN, OWN | B01 + B02 + B10 |
| R11 Podcast Producer | DEPT, ASN, OWN | B01 + B02 + B11 + `approval.view` |
| R12 Video Producer | DEPT, ASN, OWN | B01 + B02 + B12 + `approval.view` |
| R13 Events Manager | ORG, DEPT | B01 + B02 + B13 + `project.manage` + `project.assign` + `report.view` |
| R14 Marketing & Distribution | ORG, DEPT | B01 + B02 + B14 |
| R15 Finance Manager | ORG | B01 + B02 + B15 + `dashboard.executive.view` |
| R16 Operations Manager | ORG, DEPT | B01 + B02 + B16 |
| R17 Client User | CLIENT | B17 only |

## 5. R01/R02 broad-role rule

"ALL TEAM_ROLE permissions" is not a wildcard permission.

It is a governance shorthand evaluated against the finite versioned P4-R5-PERM-02 registry.

At freeze time, the exact finite list and registry hash/version must be captured.

A new permission added later is **not automatically inherited** by R01/R02 until the role matrix version is explicitly updated or the approved system-role policy defines a reviewed registry migration.

This prevents accidental authority growth through future registry additions.

## 6. Client capability-role templates

These are organization-local roles outside the R01–R17 launch numbering.

Every grant uses `CLIENT` scope only.

### C01 — client-approver

- `client.draft.review`
- `client.design.review`
- `client.media.review`
- `approval.client.decide`

Conditions:

- exact active shared version/request;
- same client organization/project;
- client-safe projection;
- immutable decision;
- separation-of-duty where applicable.

### C02 — client-signer

- `client.contract.sign`

Conditions:

- named/authorized signer;
- exact contract/envelope/version;
- verified provider evidence;
- immutable signature event.

### C03 — client-billing

- `client.billing.pay`

Conditions:

- authorized billing user;
- own client organization;
- client-safe invoice/payment projection;
- payment/provider evidence.

### C04 — client-admin

- `client.org.manage`

Conditions:

- limited Client Portal membership/preferences administration only;
- cannot grant Team permissions;
- cannot assign R01–R17;
- cannot add TEAM_ROLE permissions;
- cannot alter tenant ownership;
- cannot see Team/internal membership/security metadata.

## 7. Self-service permissions outside RBAC

These remain session/self policy and are not launch-role grants:

### Team self-service

- `staff.auth.signin`
- `staff.auth.mfa`
- `staff.auth.recover`
- `staff.invite.accept`
- `profile.update.own`

### Client self-service

- `client.auth.signin`
- `client.auth.recover`
- `client.invite.accept`
- `client.profile.edit`

Authentication/self-service authority remains R3/R12 policy and never comes from a user claiming a role.

## 8. Explicitly unassigned / custom-only Team permissions

Some specialized keys remain registered but are not included in a specialist launch role by default.

They may be assigned only by R01/R02 to an approved custom Team role within the metadata/delegation ceiling.

Examples include:

- specialized technical `integration.manage`;
- additional `settings.manage` authority beyond R16's constrained operational settings;
- niche source/research-lead management outside R03;
- future specialized publishing/production permissions not represented by the launch job role;
- later support/security/compliance custom roles.

Custom roles cannot include SELF_ONLY, SYSTEM_ONLY or CLIENT_ROLE keys.

## 9. Delegation matrix

| Actor authority | May assign launch roles | May create custom Team roles | May create client capability roles | May mutate RolePermission | Protected ceiling |
|---|---|---|---|---|---|
| R01 | R01–R17 | Yes | Yes | Yes | cannot bypass tenant; R01 mutation requires protected-admin controls |
| R02 | R02–R17 | Yes, below R01-equivalent authority | Yes | Yes, below protected R01 ceiling | cannot create/grant R01-equivalent authority |
| R03–R15 | None | No | No | No | ordinary domain authority only |
| R16 | None | No | No | No | team/department operations only |
| R17 | None | No | No | No | client-safe baseline only |
| client-admin capability | None | No | limited client membership operation only | No | CLIENT_ROLE allowlist only |

## 10. Protected permissions

At minimum these cannot be delegated outside the specified governance path:

- `role.manage`
- `permission.manage`
- `settings.manage`
- `integration.manage`
- `audit.view`
- `approval.override`
- `commercial.exception.approve`
- `invoice.issue`
- `payment.reconcile`
- `payment.refund`
- `publication.publish`
- `publish.execute`
- `distribution.launch`
- `outreach.launch`

P4-R5-PERM-02 risk/obligation metadata still applies.

## 11. No implicit authority from job title

A display title such as "Research Lead", "Department Head", "Security/Compliance", "Publishing", "Support" or "Technical Ops" is not authority.

Such users must receive:

- an approved launch role and scope; and/or
- an approved custom role with exact registered permissions.

This preserves the 17 launch-role model while supporting frozen UI job-function labels.

## 12. Acceptance effect

Owner approval of P4-R5-GOV-01 plus this matrix and P4-R5-PERM-02 would resolve the Gate-A role/permission/delegation design questions as a new controlled V1 decision.

It would **not** satisfy independent review, freeze P4-R5-G0 or authorize implementation.
