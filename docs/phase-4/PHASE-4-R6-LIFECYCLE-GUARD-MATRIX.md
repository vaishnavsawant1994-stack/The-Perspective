# Phase 4 — R6 Lifecycle & Guard Matrix

**Record:** P4-R6-LIFECYCLE-01  
**Date:** September 27, 2026  
**Status:** G0 CANDIDATE — IMPLEMENTATION NOT AUTHORIZED  
**Authority:** frozen Phase-2D + owner-approved Gate-A D01–D15

## 0. Rule

R6 lifecycle mutation is command-driven.

Generic `PATCH status=...` is prohibited.

Every successful command atomically writes the new state plus required immutable history/outbox/audit evidence. Every rejected command leaves no success residue.

## 1. Extraction job

Canonical states:

`QUEUED → RUNNING → PAUSED | COMPLETED | PARTIAL | FAILED | CANCELLED`

| Command | Required authority | Minimum guards | Required effects |
|---|---|---|---|
| create | `lead.extract.run` | approved source; selected tenant; valid query snapshot | job + resource + audit as required |
| start | `lead.extract.run` | QUEUED/PAUSED as allowed; source enabled; provider/network policy | RUNNING + attempt/outbox |
| pause | `lead.extract.run` | RUNNING | PAUSED + history |
| retry | `lead.extract.run` | FAILED/PARTIAL policy; idempotency | new attempt; prior evidence unchanged |
| cancel | `lead.extract.run` | nonterminal | CANCELLED; stop future work |
| complete | SYSTEM/provider worker | verified worker outcome | counts/evidence + terminal state |

Retry never erases earlier attempts.

## 2. Staged record review

Candidate states are implementation-specific but must preserve a review boundary equivalent to:

`PENDING_REVIEW → APPROVED | REJECTED | DUPLICATE`

Approval requires:

- `lead.import.review`;
- same-tenant extraction job;
- valid provenance;
- normalized payload;
- dedupe decision;
- exact review target/version where changed concurrently.

Approval may create/link canonical company/contact/lead only in one transaction.

## 3. Enrichment job / fact

Job:

`QUEUED → RUNNING → REVIEW_REQUIRED → ACCEPTED | PARTIAL | FAILED | CANCELLED`

Commands:

| Command | Permission | Guards |
|---|---|---|
| request | `lead.enrich` | authorized target; provider/source policy; requested fields allowed |
| retry | `lead.enrich` | terminal retryable state; idempotency |
| review | `lead.enrich` | REVIEW_REQUIRED; reviewer scope |
| accept fact(s) | `lead.enrich` | exact target/fact version; confidence/policy; current authority |
| reject fact(s) | `lead.enrich` | current authority; reason where required |

Provider output is never canonical merely because the provider returned it.

## 4. Lead lifecycle

Canonical R6 progression:

~~~text
NEW
 -> EXTRACTED
 -> ENRICHMENT_PENDING
 -> ENRICHED
 -> QUALIFICATION_PENDING
 -> QUALIFIED
 -> OUTREACH_READY
 -> CONTACTED
 -> REPLIED
 -> INTERESTED
 -> CONVERTED
~~~

Side/terminal outcomes include:

- NURTURE / FOLLOW-UP according to retained contract;
- DISQUALIFIED;
- DO_NOT_CONTACT / SUPPRESSED.

| Transition | Permission | Guards | Effects |
|---|---|---|---|
| NEW → EXTRACTED | review/import authority | source/provenance; accepted staged record; dedupe | immutable history |
| EXTRACTED → ENRICHMENT_PENDING | `lead.enrich` | minimum identity; permitted legal basis | enrichment job |
| ENRICHMENT_PENDING → ENRICHED | `lead.enrich`/SYSTEM | terminal job; accepted facts | score/dedupe recalculation |
| ENRICHED → QUALIFICATION_PENDING | `lead.review` | owner + rubric | qualification record/task |
| QUALIFICATION_PENDING → QUALIFIED | `lead.qualify` | required criteria pass | eligibility recalc |
| QUALIFIED → OUTREACH_READY | `lead.qualify` / preparation command | contactability + suppression pass | audience eligibility |
| OUTREACH_READY → CONTACTED | SYSTEM | verified send evidence | first-contact timestamp |
| CONTACTED → REPLIED | SYSTEM/reply handler | matched inbound evidence | stop unsafe future steps; classify |
| REPLIED → INTERESTED | `reply.handle` / `lead.qualify` as contracted | positive intent evidence | follow-up task/event |
| QUALIFIED/INTERESTED → CONVERTED | conversion command | `deal.manage`; idempotency; company/contact integrity | exactly one canonical deal link |
| any eligible → DO_NOT_CONTACT | privacy/suppression command or SYSTEM | valid DNC/unsubscribe/legal event | stop active/future outreach |

No caller may directly set score, qualification state, converted deal ID, suppression state, or lifecycle.

## 5. Lead list / audience

Lead-list mutation uses `lead.list.manage`.

Campaign launch does not use a live mutable query as its authority.

Required flow:

`lead-list definition → authorized members → frozen audience snapshot/hash → campaign approval/launch`

After launch approval, changing audience/list inputs invalidates the prior approval/version.

## 6. Campaign lifecycle

Canonical:

`DRAFT → READY → APPROVED → SCHEDULED → RUNNING → PAUSED → COMPLETED`

Exceptional:

- CANCELLED;
- FAILED.

| Transition | Permission | Guards |
|---|---|---|
| create/edit draft | `campaign.manage` | mutable state only; tenant/resource policy |
| DRAFT → READY | `outreach.prepare` | audience, sequence, approved template reference, sender configured |
| READY → APPROVED | `outreach.launch` | current authority; exact version; recent auth; MFA; reason; all safety checks |
| APPROVED → SCHEDULED | `outreach.launch` | exact approved version; valid schedule |
| SCHEDULED → RUNNING | `outreach.launch`/SYSTEM | execution-time sender health, suppression, legal basis, rate/schedule |
| RUNNING → PAUSED | `campaign.manage` | current state | 
| PAUSED → RUNNING | `outreach.launch` | full launch recheck |
| nonterminal → CANCELLED | `campaign.manage` | current authority; reason where required |
| RUNNING → COMPLETED | SYSTEM | no remaining eligible recipients/steps |

Protected input changes after APPROVED return the campaign to READY and invalidate prior launch approval.

## 7. Campaign recipient lifecycle

Canonical:

`QUEUED → SENT → DELIVERED → OPENED → CLICKED → REPLIED`

Terminal alternatives:

- BOUNCED;
- UNSUBSCRIBED;
- STOPPED;
- CONVERTED.

Rules:

- provider event order cannot regress an already stronger/terminal state;
- positive reply stops future automated steps;
- unsubscribe/DNC stops future sends;
- retry/idempotency prevents duplicate provider dispatch;
- recipient identity is unique within campaign/audience contract.

## 8. Conversation lifecycle

Canonical:

`OPEN → PENDING_INTERNAL | WAITING_EXTERNAL → RESOLVED → REOPENED`

Optional terminal/side state:

- ARCHIVED for spam/irrelevant thread.

Commands:

- assign/reassign: `reply.assign`;
- classify/handle/resolve: `reply.handle`;
- send/reply: `message.send`;
- read: `inbox.view` + `message.read` as required.

Internal notes are not outbound messages.

Linking a conversation to lead/deal/client requires authorization to the linked resource.

## 9. Meeting lifecycle

Canonical:

`PROPOSED → SCHEDULED → CONFIRMED → COMPLETED | CANCELLED | NO_SHOW`

Rescheduling is an immutable schedule-change event plus a new current schedule, not history overwrite.

`meeting.edit` governs valid meeting commands; `meeting.view` is read-only.

General `calendar.view` remains R8 and is not activated for R6 convenience.

## 10. Deal lifecycle

Canonical vocabulary retained from Phase-2D:

~~~text
QUALIFIED
 -> INTERESTED
 -> DISCOVERY_SCHEDULED
 -> DISCOVERY_COMPLETED
 -> PROPOSAL_PREPARATION
 -> PROPOSAL_SENT
 -> NEGOTIATION
 -> VERBAL_CONFIRMATION
 -> CONTRACT_SENT
 -> CONTRACT_SIGNED
 -> PAYMENT_PENDING
 -> WON
~~~

Exit states:

- LOST;
- ON_HOLD;
- FOLLOW_UP_LATER;
- DISQUALIFIED.

### R6 owner-approved ceiling

Gate-A D01 Resolution A sets the R6 maximum progression to:

`PROPOSAL_PREPARATION`

R6 may persist the canonical later vocabulary only if useful for compatibility, but R6 commands must deny entry to:

- PROPOSAL_SENT;
- NEGOTIATION where it depends on R7 proposal truth;
- VERBAL_CONFIRMATION where tied to R7 proposal acceptance;
- CONTRACT_SENT;
- CONTRACT_SIGNED;
- PAYMENT_PENDING;
- WON.

R6 must not invent placeholder R7 evidence to cross this ceiling.

### R6 deal guards

| Command | Permission | Guards |
|---|---|---|
| create | `deal.manage` | authorized company/contact/lead; tenant agreement; idempotency if conversion |
| edit draft fields | `deal.edit` | no lifecycle field; optimistic concurrency |
| assign/reassign | `deal.manage` | target membership same tenant; scope/delegation policy |
| move forward | `deal.move` | valid edge; current pipeline/version; required R6 data; stage ≤ R6 ceiling |
| move backward | `deal.move` | valid edge + mandatory reason |
| hold/resume | `deal.move` | valid prior/next state; reason/history |
| lose/disqualify | `deal.move` | reason; no prohibited side effects |
| configure pipeline | `deal.manage` | versioned pipeline; cannot rewrite history semantics |

## 11. Client-account conversion

R6 owns one explicit idempotent conversion command.

Candidate command:

`POST /api/v1/workspace/deals/{dealId}/commands/convert-client`

Required authority:

- `deal.manage`;
- `client.contact.manage` / `client.portal.provision` only for their separate subsequent actions.

Required guards:

1. deal belongs to selected Team organization;
2. deal is at an R6-eligible conversion point defined by implementation contract;
3. company/contact graph is canonical and same tenant;
4. existing CLIENT organization match is resolved safely;
5. idempotency key is present;
6. no conflicting client account exists;
7. actor cannot choose a foreign client organization by raw ID.

Atomic effects:

- resolve/create canonical CLIENT `Organization`;
- link canonical company identity as contracted;
- create at most one active client account;
- create controlled client relationships;
- preserve lead/deal provenance;
- emit conversion history/outbox/audit as required.

Explicitly absent:

- project creation;
- proposal creation;
- product/package truth;
- contract/signature;
- invoice/payment;
- subscription/entitlement.

Portal invitation/provision is a separate command under accepted IAM/tenant/security controls.

## 12. Template boundary under D15

`template.manage` remains `R6+` and dormant.

R6 campaign/sequence preparation may only reference an existing approved immutable template version supplied by trusted repository lookup.

R6 cannot:

- create template;
- edit template;
- create template version;
- publish/approve template via `template.manage`.

Missing approved template reference fails campaign readiness.

## 13. Rejection semantics

Candidate stable outcomes:

| Failure | Outcome |
|---|---|
| no session | 401 |
| wrong/hidden tenant resource | 404 safe concealment or accepted route-specific 403 |
| missing permission/scope/action | 403 |
| inactive owning stage | 403/422 stable workflow-stage code |
| stale row/version | 409/412 according to accepted API convention |
| invalid lifecycle edge | 422 `INVALID_WORKFLOW_TRANSITION` |
| failed guard | 422 `WORKFLOW_GUARD_FAILED` |
| idempotency key reused with changed payload | 409 |
| duplicate canonical conversion | prior idempotent result or conflict according to matching key |
| R7-owned transition/action | fail closed with stable stage-not-active code |

Rejected commands must not create success history/activity/outbox residue.

## 14. Required executable proof

Every transition/guard in this document must map to executable domain/API/database tests.

At minimum:

- every valid edge;
- every invalid skip;
- backward reason requirement;
- R6 deal ceiling;
- DNC/suppression race;
- positive-reply stop race;
- changed campaign input invalidates approval;
- sender health failure at dispatch;
- duplicate lead/deal/client conversion;
- stale optimistic concurrency;
- wrong pipeline/version;
- foreign-resource transition;
- R7 action attempts;
- D15 template mutation attempts.

No lifecycle is considered implemented merely because a UI can display a status label.
