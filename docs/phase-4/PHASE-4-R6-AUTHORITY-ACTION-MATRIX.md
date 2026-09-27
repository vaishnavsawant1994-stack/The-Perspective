# Phase 4 — R6 Authority / Action / Resource Matrix

**Record:** P4-R6-AUTH-MATRIX-01  
**Date:** September 27, 2026  
**Source permission registry:** accepted P4-R5-C1 registry on `main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`  
**Status:** G0 CANDIDATE — R6 NOT ACTIVE  
**Default R5 active stages:** `R5`

## 0. Purpose

R5 currently action-binds only permissions whose `activationStage === "R5"`.

Therefore R6 may not activate any R6 permission until an explicit R6 action map exists.

This document defines the candidate action/resource floor.

Actions outside the declared family fail closed.

## 1. Action matrix

| Permission | Resource type | Allowed actions | Notes |
|---|---|---|---|
| `source.manage` | lead-source | create, update, disable, enable, test, manage | source approval is server policy; caller cannot self-approve arbitrary destinations |
| `lead.discover` | lead-search / lead-source | discover, search | discovery does not itself promote canonical lead |
| `lead.extract.run` | extraction-job | create, start, retry, pause, cancel | provider/network policy required |
| `lead.import.review` | staged-record | view, review, approve, reject | workflow-bound; accepted row promotion atomic |
| `lead.enrich` | enrichment-job / enrichment-fact | create, request, review, accept, reject, retry | provider fact is untrusted until accepted |
| `lead.view` | lead | read, view, list | no export |
| `lead.edit` | lead | create, update, assign, archive | lifecycle state changes require command-specific permission |
| `lead.review` | lead / duplicate-candidate | review, merge, reject-duplicate | workflow-bound |
| `lead.qualify` | lead / qualification | qualify, nurture, disqualify | explicit lifecycle command |
| `lead.list.manage` | lead-list | create, update, add, remove, freeze-audience, archive | audit required |
| `company.view` | company | read, view, list | no prospect data in Client projection |
| `company.edit` | company | create, update, merge, archive | cross-tenant merge prohibited |
| `contact.view` | contact | read, view, list | PII field policy |
| `contact.edit` | contact | create, update, merge, archive | consent/contactability not caller-authoritative |
| `outreach.dashboard.view` | outreach-dashboard | read, view, list | aggregate projection only |
| `campaign.view` | outreach-campaign | read, view, list | exact audience/sequence version visible per policy |
| `campaign.manage` | outreach-campaign | create, update, submit, pause, cancel, archive | MUST NOT approve/launch; protected input edits invalidate launch approval |
| `outreach.prepare` | outreach-campaign | prepare, validate, submit | workflow-bound |
| `outreach.launch` | outreach-campaign | approve, schedule, launch, resume | CRITICAL; exact version + reason + recent-auth + MFA + dispatch recheck |
| `sequence.manage` | sequence | create, update, create-version, archive | versioned; no mutation of frozen launched version |
| `emailaccount.manage` | sending-account | create, update, verify, disable, test, manage | no secret material in response/audit |
| `reply.view` | reply / conversation | read, view, list | message body may also require message.read |
| `reply.handle` | reply / conversation | classify, stop-sequence, create-follow-up, resolve | sending a reply additionally requires message.send |
| `reply.assign` | reply / conversation | assign, reassign | audit required |
| `inbox.view` | conversation | list, view | thread body projection still field/message governed |
| `message.read` | message / conversation | read, view, list | internal/client visibility enforced |
| `message.send` | message / conversation | send, reply | workflow-bound + audit + suppression/contactability |
| `meeting.view` | meeting | read, view, list | attendee/owner/record scope |
| `meeting.edit` | meeting | create, update, propose, schedule, confirm, reschedule, complete, cancel, mark-no-show | reschedule history immutable |
| `deal.view` | deal | read, view, list | internal amount/forecast field policy |
| `deal.edit` | deal | create, update, assign | no lifecycle movement |
| `deal.move` | deal | move-stage, hold, resume, lose, disqualify | workflow-bound; release stage ceiling |
| `deal.manage` | deal / deal-pipeline | create, update, assign, configure-pipeline, archive | audit required; cannot bypass deal.move lifecycle |
| `client.view` | client-account | read, view, list | internal Team projection only; not Client-surface permission |
| `client.contact.manage` | client-account / client-relationship | create, update, remove, set-primary | cannot grant IAM/client capability by itself |
| `client.portal.manage` | client-account / portal-access | update-access, suspend-access, revoke-access | identity/tenant provisioning remains R3/R4/R5 controlled |
| `client.portal.provision` | client-account / portal-access | invite, provision, reissue | audit required; no automatic admin capability |
| `proposal.view` | proposal | read, view, list | CONDITIONAL on Gate-A D01 |
| `proposal.edit` | proposal | create, update, create-revision, withdraw | CONDITIONAL on D01; sent/accepted version immutable |
| `proposal.send` | proposal | send, resend | CONDITIONAL on D01; exact-version + audit |
| `proposal.approve` | proposal | approve, reject | CONDITIONAL on D01; exact-version + SoD + audit |

## 2. Explicitly forbidden laundering

The following substitutions are prohibited:

- `lead.view` → export;
- `campaign.manage` → launch;
- `outreach.prepare` → launch;
- `deal.edit` → move-stage;
- `deal.manage` → mark-won without lifecycle evidence;
- `client.contact.manage` → client IAM privilege;
- `client.portal.manage` → unrestricted Client Portal read;
- `message.send` → bypass suppression/contactability;
- `proposal.edit` → approve/send;
- ordinary read permission → aggregate/count/export unless explicitly contracted.

## 3. R6 stage-policy implementation rule

Before any R6 permission becomes active, policy must have an explicit 37-key active-permission allowlist plus a map structurally equivalent to:

~~~text
permission key
 -> allowed action set
 -> resource type(s)
 -> field policy
 -> workflow policy
 -> obligations
~~~

Unknown action or resource type denies.

The R5-only action map must not simply be bypassed by setting activeStages to include R6.

## 4. Screen/registry activation mismatch

### G0 finding R6-G02 — Email Templates

Frozen operational screen 27:

`/app/outreach/templates`

expects template create/edit/version behavior.

Accepted R5 registry contains:

`template.manage`

with activation stage:

`R6+`

not `R6`.

Because stage activation uses exact stage strings, `R6+` does not become active merely by activating `R6`.

**Classification:** governance/registry-stage mismatch; no current vulnerability.  
**Gate impact:** BLOCKS final P4-R6-G0 freeze until resolved.

Candidate choices:

A. keep `template.manage` dormant; R6 template screen is read-only/readiness and sequence creation uses only already-approved templates; later release owns template mutation; or  
B. explicit owner amendment changes `template.manage` activation ownership to R6 and qualification re-proves R5/R6 stage dormancy.

No implementation may silently relabel the activation stage.

## 5. Calendar note

`calendar.view` is activation stage R8.

This does not block R6 meeting screens if they use the R6-owned `meeting.view` / `meeting.edit` permissions and meeting-specific projections.

R6 must not activate general `calendar.view` to make meeting pages convenient.

## 6. Proposal note

All four proposal permissions are currently activation stage R6 in the accepted R5 registry.

Gate-A D01 Resolution A is owner-approved and narrows their owning production release to R7. Therefore they remain registered historical vocabulary but are **not members of the R6 active-permission subset**.

R6 candidate active subset = 41 historical R6-stage keys minus:

- `proposal.view`
- `proposal.edit`
- `proposal.send`
- `proposal.approve`

Expected active subset size: **37**.

R6 activation must therefore require both:

1. owning stage is active; and
2. permission key is in the explicit approved active-permission allowlist.

Stage metadata alone is insufficient after an owner-approved scope narrowing.

Owner resolution remains required.

## 7. G0 completion condition

Before freeze:

- every R6 permission above has exact action tests planned;
- D01 proposal ownership resolved;
- G02 template stage ownership resolved;
- resource and field policies frozen;
- negative tests prove action laundering fails;
- R7+ and R6+ permissions remain dormant unless explicitly owned.
