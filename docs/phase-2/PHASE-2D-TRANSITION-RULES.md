# Phase 2D — Transition Rules

**Status:** Frozen  
**Authority:** Phase 2B determines role and record scope; this document adds workflow-stage guards. A role name below is shorthand for the corresponding permission evaluated with organization, department, assignment, ownership, or client scope.

## 1. Transition command contract

Every command must provide:

```text
machineKey, aggregateId, expectedState, targetState, expectedRowVersion,
actorUserId, actorMembershipId, reason?, idempotencyKey, requestId
```

The transition service evaluates:

```text
tenant + permission + record scope + assignment + current state
+ required fields + exact target version + approvals + dependency guards
+ client visibility + separation of duties + idempotency
```

On success it atomically writes the new state, immutable transition history, `platform.activity_event`, sensitive `audit.audit_event`, and `platform.outbox_event`. On failure it writes no partial domain mutation.

## 2. Permission keys

| Permission | Normally held by |
|---|---|
| `lead.review`, `lead.qualify` | Researcher, Sales Executive/Manager, Admin |
| `outreach.prepare` | Sales roles in scope |
| `outreach.launch` | Super Admin, Admin, Sales Manager |
| `deal.manage` | Sales Executive/Manager, Account Manager, Admin |
| `proposal.send` | Phase 2B approved commercial roles |
| `commercial.exception.approve` | Super Admin, Admin, Sales Manager, Finance Manager |
| `contract.send` | Super Admin, Admin, Sales Manager, Finance Manager |
| `invoice.issue` | Super Admin, Admin, Finance Manager |
| `payment.reconcile`, `payment.refund` | Super Admin, Admin, Finance Manager |
| `client.portal.provision` | Super Admin, Admin, Account Manager, Operations Manager |
| `project.manage`, `project.assign` | Project owner plus authorities fixed in Phase 2B |
| `editorial.review` | Editor, Editor-in-Chief, Admin |
| `editorial.approve` | Editor/Editor-in-Chief according to policy; no prohibited self-approval |
| `design.approve` | Editor-in-Chief, Admin |
| `approval.client.decide` | Client user in same organization and request scope |
| `approval.override` | Super Admin, Admin, Editor-in-Chief |
| `publication.publish` | Super Admin, Admin, Editor-in-Chief, Marketing & Distribution |
| `distribution.launch` | Super Admin, Admin, Marketing & Distribution |
| `event.manage` | Events Manager and authorized Admin/Operations roles |
| `report.approve` | Account/Operations/authorized domain owner; policy-specific |
| `renewal.manage` | Account Manager, Sales Manager/Executive in scope |

## 3. Lead and enrichment

| Current → target | Permission | Required conditions/fields | Blockers | Side effects, tasks, notifications, event | Visibility | Reopen/rollback |
|---|---|---|---|---|---|---|
| `NEW → EXTRACTED` | `lead.review` | source, provenance, accepted extraction result | suppressed source | extraction evidence; dedupe check; `lead.extracted` | internal | archive bad extraction; never erase source evidence |
| `EXTRACTED → ENRICHMENT_PENDING` | `lead.review` | minimum identity and permitted enrichment fields | duplicate already merged, DNC | enrichment job; researcher notified; `lead.enrichment_requested` | internal | cancel job → `EXTRACTED` |
| `ENRICHMENT_PENDING → ENRICHED` | `lead.review` or system | terminal job, accepted facts recorded | unresolved blocking conflict | score job; `lead.enriched` | internal | new evidence may create another enrichment attempt |
| `ENRICHED → QUALIFICATION_PENDING` | `lead.qualify` | owner and qualification rubric | no owner, DNC | qualification record/task; `lead.qualification_started` | internal | return to `ENRICHED` with reason |
| `QUALIFICATION_PENDING → QUALIFIED` | `lead.qualify` | required criteria pass, contactability | DNC, invalid contact | owner notified; `lead.qualified` | internal | correction creates a new qualification decision |
| `QUALIFIED → OUTREACH_READY` | `outreach.launch` or approved audience command | suppression and sender policy pass | DNC, invalid contact | freeze audience membership; `lead.outreach_ready` | internal | remove from audience → `QUALIFIED` with reason |
| `OUTREACH_READY → CONTACTED` | system from verified send | send/provider evidence | missing message evidence | first-contact facts; `lead.contacted` | internal | no rollback; record delivery correction |
| `CONTACTED → REPLIED → INTERESTED` | system then owner classification | matched inbound reply; positive intent for `INTERESTED` | spam/auto-reply/negative reply | stop sequence; follow-up task; `lead.replied`, `lead.positive_reply` | internal | reclassify via a new decision, preserving old evidence |
| `QUALIFICATION_PENDING → NOT_QUALIFIED/FOLLOW_UP_LATER` | `lead.qualify` | disposition/reason; follow-up date when applicable | none | nurture/follow-up task; `lead.disposition_recorded` | internal | `FOLLOW_UP_LATER → ENRICHED` on due date/command |
| `* → INVALID_CONTACT/DUPLICATE/DO_NOT_CONTACT` | `lead.review`; DNC may be system | evidence; duplicate survivor or suppression reason | none | stop sequences; suppression/merge task; matching event | internal | only privacy/admin correction; DNC never silently reversed |
| `QUALIFIED/CONTACTED/REPLIED/INTERESTED → CONVERTED` | `deal.manage` | idempotent deal/client linkage | active duplicate conversion | create/link deal; `lead.converted` | internal | no rollback; correct linkage via audited merge |
| nonterminal `* → ARCHIVED` | `lead.manage` | archive reason | legal/operational hold | remove from active views; `lead.archived` | internal | restore to prior recorded state by authority |

Extraction job states are `QUEUED → RUNNING → PAUSED/COMPLETED/PARTIAL/FAILED/CANCELLED`; enrichment jobs are `QUEUED → RUNNING → REVIEW_REQUIRED → ACCEPTED/PARTIAL/FAILED/CANCELLED`. Retry creates a new attempt, never erases a result.

## 4. Outreach, recipient, conversation, and meeting

| Current → target | Permission | Required conditions | Blockers | Effects/event | Visibility | Reopen/retry |
|---|---|---|---|---|---|---|
| Campaign `DRAFT → READY` | `outreach.prepare` | frozen audience/sequence/sender draft | validation errors | validation report; `campaign.ready` | internal | edit returns `DRAFT` |
| `READY → APPROVED` | `outreach.launch` | healthy sender, consent/suppression check, approved copy | compliance/limit failure | approval evidence; `campaign.approved` | internal | material edit → `DRAFT` |
| `APPROVED → SCHEDULED` | `outreach.launch` | start time, timezone, limits | expired approval/sender issue | enqueue schedule; `campaign.scheduled` | internal | cancel or reschedule with reason |
| `SCHEDULED/PAUSED → RUNNING` | `outreach.launch` | still valid audience and sender | suppression scan/health failure | recipient jobs; Sales notified; `campaign.started` | internal | `RUNNING → PAUSED`; no send rollback |
| `RUNNING → COMPLETED` | system | all recipients terminal | pending retries | final metrics; `campaign.completed` | internal | immutable completion; create successor campaign |
| nonterminal `* → CANCELLED/FAILED` | launch authority/system | reason/error evidence | none | stop future jobs; urgent alert on failure | internal | failed jobs retry by new attempt only |
| Recipient `QUEUED → SENT → DELIVERED → OPENED/CLICKED → REPLIED` | verified provider event/system | deduplicated external event and chronology | stopped/suppressed recipient | delivery event; engagement metrics | internal | out-of-order events retained and projection reconciled |
| Recipient `* → BOUNCED/UNSUBSCRIBED/STOPPED` | provider/system/authorized user | evidence/reason | none | suppression where required; cancel future steps | internal | resubscribe requires new lawful evidence |
| Recipient `REPLIED → CONVERTED` | `deal.manage` | positive reply classification and idempotent linkage | duplicate opportunity | stop automation; qualification/deal task; `lead.positive_reply` | internal | classification correction preserves original message |
| Conversation `OPEN ↔ PENDING_INTERNAL/WAITING_EXTERNAL → RESOLVED` | assigned sales/account/support role | owner and outcome on resolve | unresolved required task | assignment/follow-up notifications | explicit internal/client shared | new message `RESOLVED → REOPENED` |
| Meeting `PROPOSED → SCHEDULED → CONFIRMED → COMPLETED` | meeting owner/assigned role | participants, timezone, time; outcome on completion | conflict or missing consent | calendar invites/tasks; meeting events | explicit | reschedule writes immutable change; cancelled/no-show terminal but reschedulable to new occurrence |

Positive reply is a hard automation stop for remaining outreach steps.

## 5. Deal and proposal

| Current → target | Permission | Required fields/conditions | Blockers | Effects/event | Visibility | Reopen/rollback |
|---|---|---|---|---|---|---|
| Deal `QUALIFIED → INTERESTED` | `deal.manage` | qualified lead/contact, owner | suppression | stage history; `deal.stage_changed` | internal | backward with reason |
| `INTERESTED → DISCOVERY_SCHEDULED → DISCOVERY_COMPLETED` | `deal.manage` | meeting then completed outcome/needs | missing primary contact | tasks and stage events | internal | reschedule meeting; stage rollback with reason |
| `DISCOVERY_COMPLETED → PROPOSAL_PREPARATION` | `deal.manage` | needs, value/currency, package candidate | incomplete qualification | proposal task | internal | backward with reason |
| `PROPOSAL_PREPARATION → PROPOSAL_SENT` | `proposal.send` | exact approved proposal version | pricing exception unapproved | send evidence; client notification; `proposal.sent` | client sees sent version | edit creates successor and returns preparation/review |
| `PROPOSAL_SENT → NEGOTIATION → VERBAL_CONFIRMATION` | `deal.manage` | client activity/notes; confirmation evidence | expired/withdrawn proposal | follow-up tasks; stage events | commercial only | backward with reason |
| `VERBAL_CONFIRMATION → CONTRACT_SENT → CONTRACT_SIGNED` | `contract.send` then verified system | approved/sent contract; verified signatures | missing signer/evidence | contract events; production gate recalc | client-safe contract fields | new contract version supersedes prior; signed immutable |
| `CONTRACT_SIGNED → PAYMENT_PENDING → WON` | deal authority/system | configured gate: contract plus required payment or approved override | unpaid required deposit, unresolved exception | create/link client and project shell; `deal.won` | internal; resulting client records safe | no rollback; correction/change order/new deal |
| open `* → LOST/ON_HOLD/FOLLOW_UP_LATER/DISQUALIFIED` | `deal.manage` | reason; follow-up date if applicable | none | forecast update, task, `deal.lost/held` | internal | reopen creates history and requires authority |
| Proposal `DRAFT → INTERNAL_REVIEW → APPROVED` | author then commercial approver | complete exact version, price/terms | discount exception or missing data | approval request/decision | internal | material edit creates version and new review |
| `APPROVED → SENT → VIEWED → CLIENT_REVIEW → ACCEPTED` | `proposal.send`; client/system evidence | recipient, expiry, exact version | superseded/expired version | immutable acceptance; `proposal.accepted` | client-visible version | no mutation; successor proposal for changes |
| `CLIENT_REVIEW → CHANGES_REQUESTED` | client in scope | active request and comment | newer version | revision task; sales/account notifications | client shared | successor version re-enters review |
| applicable `* → DECLINED/EXPIRED/WITHDRAWN/SUPERSEDED` | client/system/authorized owner | reason/evidence | none | terminal event and follow-up | appropriate scope | only successor version can proceed |

## 6. Contract, invoice, payment, refund, and credit

| Current → target | Permission | Required conditions | Blockers | Effects/event | Visibility | Reopen/rollback |
|---|---|---|---|---|---|---|
| Contract `DRAFT → INTERNAL_REVIEW → APPROVED` | prepare then `contract.send` authority | complete exact version, signer order | policy/terms exception | approval evidence | commercial/internal | edit creates new version |
| `APPROVED → SENT → VIEWED → SIGNATURE_PENDING → SIGNED → ACTIVE` | `contract.send`; provider/system | verified envelope and all required signer events; effective date | superseded/expired envelope | notifications, production gate recalc, `contract.signed/activated` | client-safe signed contract | signed version immutable; amendment is new version/contract |
| `* → CHANGES_REQUESTED/DECLINED/EXPIRED/CANCELLED/TERMINATED/SUPERSEDED` | scoped commercial/client/system | reason and authority/evidence | signed contract cannot be edited | tasks/notifications and matching event | client-safe result | amendment/reissue, never overwrite |
| Invoice `DRAFT → APPROVED → SENT/OPEN` | `invoice.issue` | client, legal number, currency, immutable lines, due date | missing tax/billing data | ledger/issue event; client notified | client-safe invoice | issued invoice corrected by credit/debit note |
| `OPEN/OVERDUE → PARTIALLY_PAID → PAID` | system projection | verified payment allocations equal balance | unverified provider event | receipt, gate recalc, `invoice.paid` | client-safe balance | allocation reversal is new accounting event |
| `OPEN → OVERDUE` | scheduler/system | due date passed and balance open | active approved grace/hold | Finance + Account alert; `invoice.overdue` | client-visible per policy | returns open/paid through evidence, not manual reset |
| Invoice `* → VOID/CANCELLED/PARTIALLY_REFUNDED/REFUNDED` | Finance authority/system | reason and corresponding credit/refund evidence | settled amount without correction | accounting entries and notifications | client-safe | compensating records only |
| Payment `PENDING → PROCESSING → SUCCEEDED` | verified provider/system or controlled Finance command | provider event/evidence, amount, currency, identity | duplicate/idempotency conflict | ledger/allocation, invoice projection, `payment.succeeded` | restricted processor fields; safe status to client | no deletion/rollback |
| `PENDING/PROCESSING → FAILED/CANCELLED` | provider/system/Finance | verified failure/reason | none | retry task and alert; `payment.failed` | safe status to client | retry creates new attempt/payment event |
| `SUCCEEDED → PARTIALLY_REFUNDED → REFUNDED` | `payment.refund` + provider | approved refund, amount within unrefunded balance | self-approval/policy failure | refund, ledger, allocations; `payment.refunded` | client-safe amount/status | compensating charge only |
| `SUCCEEDED → DISPUTED → WON/LOST` | verified provider/system | dispute evidence | none | Finance priority case; ledger reserve/result | restricted | immutable dispute event stream |

## 7. Client onboarding and generic project lifecycle

| Current → target | Permission | Required conditions | Blockers | Effects/event | Visibility | Reopen/rollback |
|---|---|---|---|---|---|---|
| Onboarding `NOT_STARTED → PORTAL_INVITED → PORTAL_ACTIVATED` | `client.portal.provision`; client acceptance | primary client contact, role, valid invite | wrong client org/expired invite | membership, welcome tasks/events | client shared | revoke membership; reissue invite |
| `PORTAL_ACTIVATED → COMMERCIAL_COMPLETE` | Account/Operations | contract/payment gate satisfied or waiver | missing evidence | project setup unlocked | client sees milestone, not internals | gate recalculates; waiver expires |
| `COMMERCIAL_COMPLETE → QUESTIONNAIRE_PENDING/ASSETS_PENDING/KICKOFF_PENDING` | project manager | workflow dependencies/configuration | missing project owner/template | parallel client tasks and reminders | client shared | dependency-aware; no forced universal ordering |
| dependency states → `IN_PROGRESS → COMPLETED` | project/account authority | required branches complete/waived | open required task/approval | onboarding completion event | client shared summary | new onboarding change task, not history overwrite |
| Project `DRAFT → PLANNED → ACTIVE` | `project.manage` | client/package context, owner, workflow instance, team | production gate or missing workflow | assignments/tasks; `project.started` | client sees allowed summary | return planned only before work; otherwise hold |
| `ACTIVE → REVIEW → APPROVAL → PUBLICATION_READY` | workflow/stage authority | required deliverables and exact approvals | blockers/open mandatory stages | stage events/readiness recalculation | stage-specific | changes create revision loop |
| `PUBLICATION_READY → PUBLISHED → DISTRIBUTING → DELIVERY → COMPLETED` | publish/distribute/project completion authorities | verified publication/URLs, distribution, delivery pack/report policy | failed jobs, open approval/task | downstream commands; completion/renewal events | client-safe status/outputs | completed reopens as new stage iteration/change order |
| nonterminal `* → ON_HOLD/BLOCKED` | project authority/system | reason, blocker owner, next review | none | blocker task and notifications | client summary only if explicitly shared | resolve → recorded prior/next valid state |
| nonterminal `* → CANCELLED/ARCHIVED` | authorized project/admin role | reason, commercial/retention checks | legal hold/open financial obligation | cancel future tasks/jobs; archive event | safe summary | archive restore by authority; cancelled work requires new project/change order |

Project health (`ON_TRACK`, `AT_RISK`, `OFF_TRACK`) remains a separate derived dimension.

## 8. Workflow stage, task, questionnaire, and deliverable

| Current → target | Permission | Guards and effects | Visibility/reopen |
|---|---|---|---|
| Workflow `NOT_STARTED → RUNNING`; stage `PENDING → READY → IN_PROGRESS` | stage owner/project manager | dependencies met; owner assigned; stage-entered event and generated tasks | template visibility; rollback with reason before dependent work |
| Stage `IN_PROGRESS → INTERNAL_REVIEW → CLIENT_REVIEW → COMPLETE` | producer/reviewer/client as applicable | exact artifact version, policy-required decisions, exit checklist | internal/client states distinct; changes create new iteration/version |
| Stage `* → BLOCKED/SKIPPED/CANCELLED` | scoped manager and template permission | structured reason; skip/waiver authority; downstream recomputation | client visibility explicit; unblock resumes recorded path |
| Task `BACKLOG → READY → IN_PROGRESS → REVIEW → DONE` | assignee/reviewer | dependencies, assignment, completion checklist; no self-completing approval task | client task must be `CLIENT_SHARED`; reopen records actor/reason |
| Questionnaire `DRAFT → SENT → OPENED → IN_PROGRESS → SUBMITTED` | project team then client/respondent | recipient, due date, template version; submission snapshot/hash | client shared; autosave mutable response only |
| `SUBMITTED → ACCEPTED` | assigned editor/account role | exact submission reviewed | immutable accepted submission |
| `SUBMITTED → CHANGES_REQUESTED → RESUBMITTED` | reviewer then respondent | visible comment/request; successor submission | prior submission preserved |
| Deliverable `PLANNED → IN_PRODUCTION → INTERNAL_REVIEW → CLIENT_REVIEW → APPROVED` | producer, internal approver, scoped client | exact version, assignment, applicable approval policy | client sees only shared request/version; revision creates successor |
| `APPROVED → PUBLICATION_READY → PUBLISHED → DELIVERED → ARCHIVED` | publish/project authority | rights, target, verified URL, delivery evidence | publish snapshot immutable; unpublish/archive separate states |

## 9. Editorial and studio production workflows

These are workflow-stage machines under the generic project/deliverable lifecycle. Each arrow requires the stage owner or the specialist permission for that stage; approval/publish transitions use the higher-risk permissions above.

### Article/blog

`PROJECT_CREATED → BRIEF_READY → QUESTIONNAIRE_PENDING? → RESEARCH → WRITER_ASSIGNED → DRAFTING → INTERNAL_REVIEW → INTERNAL_REVISION* → CLIENT_REVIEW? → CLIENT_REVISION* → CLIENT_APPROVED? → SEO_REVIEW → PUBLICATION_READY → SCHEDULED? → PUBLISHED → DISTRIBUTED → COMPLETED`

- `?` stages are included only by the frozen workflow template.
- Skipping client review needs a template rule, not an ad hoc UI shortcut.
- Each revision creates a new `content.draft_version`.

### Magazine / Personal Magazine

`PROJECT_CREATED → COVER_SLOT_RESERVED → EDITORIAL_BRIEF → QUESTIONNAIRE_CREATED → QUESTIONNAIRE_SENT → QUESTIONNAIRE_RECEIVED → INTERVIEW_SCHEDULED → INTERVIEW_COMPLETED → ASSETS_REQUESTED → ASSETS_RECEIVED → ARTICLE_DRAFTING → EDITORIAL_REVIEW → CLIENT_ARTICLE_REVIEW? → ARTICLE_APPROVED → COVER_CONCEPT → COVER_INTERNAL_REVIEW → COVER_CLIENT_REVIEW? → COVER_APPROVED → PAGE_DESIGN → INTERNAL_DESIGN_REVIEW → CLIENT_DESIGN_REVIEW? → DESIGN_REVISION* → FINAL_PROOF → FINAL_CLIENT_APPROVAL? → DIGITAL_READER_BUILD → PUBLICATION_READY → PUBLISHED → DISTRIBUTION → CLIENT_DELIVERY → COMPLETED`

Cover, article, page design, proof, reader build, and print master have separate immutable versions and approval targets.

### Podcast

`PROSPECT → INVITED → INTERESTED → CONFIRMED → ONBOARDING → BIO_ASSETS_PENDING → TOPIC_PENDING → TALKING_POINTS_REVIEW → SCHEDULING → RECORDING_SCHEDULED → RECORDED → EDITING → INTERNAL_REVIEW → GUEST_REVIEW? → APPROVED → PUBLICATION_READY → PUBLISHED → CLIPS_CREATED → DISTRIBUTED → COMPLETED`

Alternatives: `DECLINED`, `RESCHEDULE_REQUIRED`, `CANCELLED`, `NO_SHOW`. Rescheduling creates a new recording occurrence; it does not erase the missed/cancelled one.

### Video

`IDEA → BRIEF → GUEST_CONFIRMED? → SCRIPTING → PRE_PRODUCTION → SHOOT_SCHEDULED → SHOT → EDITING → INTERNAL_REVIEW → CLIENT_REVIEW? → APPROVED → THUMBNAIL_READY → METADATA_READY → PUBLICATION_READY → PUBLISHED → CLIPS_CREATED → DISTRIBUTED → COMPLETED`

Each script, edit, caption, thumbnail, and master is independently versioned.

## 10. Event and speaker workflows

| Current → target | Permission/guard | Side effects and exceptional behavior |
|---|---|---|
| Event `PLANNING → SPEAKER_OUTREACH → SPEAKERS_CONFIRMED` | `event.manage`; speaker targets then required confirmations | invitations/tasks; no false confirmation from invite send |
| `SPEAKERS_CONFIRMED → PARTNER_OUTREACH → AGENDA_BUILDING → REGISTRATION_OPEN` | Events Manager; venue/date/capacity/agenda/publication checks | public registration publication and notifications |
| `REGISTRATION_OPEN → PRE_EVENT → LIVE → COMPLETED` | Events Manager/system; time, readiness, check-in gates | reminders, live operations, attendance evidence |
| `COMPLETED → POST_EVENT_CONTENT → DISTRIBUTION → REPORTING → CLOSED` | production/distribution/report authorities | deliverables, recordings, reports, partner/client delivery |
| nonterminal `* → POSTPONED/CANCELLED` | Events Manager/Admin; reason and attendee policy | notify registrants, refund workflow if applicable; reschedule preserves original occurrence |
| Speaker `IDENTIFIED → INVITED → INTERESTED → CONFIRMED → ASSETS_PENDING → SESSION_CONFIRMED → LOGISTICS_COMPLETE → ATTENDED → COMPLETED` | Events Manager; explicit confirmations/assets/session/logistics | speaker tasks and reminders; `DECLINED/WITHDRAWN/NO_SHOW` retain evidence |
| Registration `PENDING/WAITLISTED → CONFIRMED → TICKET_ISSUED → CHECKED_IN → ATTENDED` | registration system/events role | capacity/payment/eligibility then immutable check-in | cancel/refund/no-show are evidence-backed alternatives |

## 11. Approval and asset rules

| Current → target | Permission and exact guards | Effects/reopen |
|---|---|---|
| Approval `DRAFT → REQUESTED → IN_REVIEW` | requester then assigned approver; exact resource/version/hash and active policy | steps/notifications; request expiry schedule |
| `IN_REVIEW → APPROVED/CHANGES_REQUESTED/REJECTED` | required role/scope; client must match client org and visible request; no prohibited self-approval | immutable decision with request/version/actor/time/comment/role/visibility; downstream tasks/event |
| request `* → CANCELLED/EXPIRED/SUPERSEDED` | requester/system/version service | no decision transferred to newer version; create new request to reopen |
| Asset `UPLOADED → PROCESSING → AVAILABLE → IN_REVIEW → APPROVED` | uploader/system/reviewer; virus scan, metadata, exact version, rights | renditions/review events; approval applies only to version |
| asset `* → REJECTED/REPLACED/ARCHIVED/PROCESSING_FAILED` | reviewer/uploader/system as applicable | replacement creates new immutable version; retry is new processing attempt |

Approval overrides require `approval.override`, reason, policy evidence, immutable override record, and high-priority audit notification. They never rewrite the original decision.

## 12. Publishing and distribution

| Current → target | Permission/guards | Effects and recovery |
|---|---|---|
| Publication `DRAFT → EDITORIAL_READY → TECHNICAL_READY → APPROVED` | editorial/technical/publish authorities; exact manifest, SEO, route, media, rights, access tier | validation results and approval evidence |
| `APPROVED → READY_TO_PUBLISH → SCHEDULED → PUBLISHING → PUBLISHED` | `publication.publish`; schedule/target and idempotent job | immutable publication version, job, URL verification; publication events |
| `PUBLISHING → FAILED/BLOCKED` | system | high-priority alert; failure evidence; retry creates new job attempt |
| `PUBLISHED → CORRECTION_PENDING → PUBLISHED` | editorial + publish authority | successor publication version and correction note; prior snapshot retained |
| `PUBLISHED → UNPUBLISHED → ARCHIVED` | publish authority | reason, URL/redirect state, notifications; republish uses approved successor/version |
| Distribution `DRAFT → ASSETS_READY → APPROVED → SCHEDULED → RUNNING → COMPLETED` | distribution prepare then `distribution.launch` | channel items/jobs, metrics collection, events |
| Item `PENDING → SCHEDULED → PUBLISHING → PUBLISHED` | system/authorized distributor | provider ID/URL evidence; metrics eligibility |
| Item `* → FAILED/SKIPPED/REMOVED` | system/authorized distributor | error or reason; retry new attempt; published removal retained |

## 13. Reporting, client delivery, renewal, and support

| Current → target | Permission/guards | Effects/reopen |
|---|---|---|
| Report `COLLECTING_DATA → DRAFT → INTERNAL_REVIEW → APPROVED → CLIENT_READY → DELIVERED` | analyst/owner/reviewer; metric cutoff, sources and verification status | immutable report version, client notification, `report.delivered` |
| `COLLECTING_DATA/DRAFT → DATA_INCOMPLETE` | system/analyst with evidence | collection task/escalation; resume when source verified |
| delivered report `→ SUPERSEDED/ARCHIVED` | report owner | successor version/link; original remains accessible per retention |
| Delivery `PREPARING → READY → SENT → VIEWED → ACKNOWLEDGED → COMPLETED` | project/account role then client evidence | freeze delivery manifest; notifications/activity; successor delivery for corrections |
| Renewal `NOT_DUE → UPCOMING → REVIEW_REQUIRED → OPPORTUNITY_CREATED → OUTREACH → INTERESTED → PROPOSAL → NEGOTIATION → RENEWED` | scheduler/account/sales roles | tasks, new linked deal/project on renewal; never mutate completed old project |
| Renewal `* → DECLINED/LOST/DEFERRED/EXPIRED` | account/sales/system | reason/future review date; reopen by new opportunity/history entry |
| Support `OPEN → TRIAGED → IN_PROGRESS → WAITING_ON_CLIENT/WAITING_INTERNAL → RESOLVED → CLOSED` | support/assigned role; resolution on resolve | SLA timers, messages, notifications; client sees only shared thread |
| `RESOLVED/CLOSED → REOPENED` | client/support with new information | new SLA cycle/history; never delete prior resolution |

## 14. Rejected transition responses

| Failure | API outcome |
|---|---|
| Wrong tenant/client | `404` safe non-disclosure or `403` according to route contract |
| Missing permission/scope | `403 WORKFLOW_PERMISSION_DENIED` |
| Stale state/version | `409 WORKFLOW_STATE_CONFLICT` with safe current-state metadata |
| Guard or required field failed | `422 WORKFLOW_GUARD_FAILED` with structured field/guard codes |
| Superseded/expired approval | `409 APPROVAL_TARGET_SUPERSEDED` / `410 APPROVAL_EXPIRED` |
| Duplicate command | Return prior idempotent result; do not repeat side effects |
| Invalid transition edge | `422 INVALID_WORKFLOW_TRANSITION` |

Rejected commands are observable in security telemetry when sensitive, but do not create misleading business activity.
