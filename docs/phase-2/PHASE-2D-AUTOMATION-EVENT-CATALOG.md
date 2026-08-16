# Phase 2D — Automation Event Catalog

**Status:** Frozen  
**Purpose:** Canonical domain events that connect workflows to tasks, notifications, email, audit, integrations, analytics, and projections.

## 1. Event envelope

```json
{
  "eventId": "uuid",
  "eventName": "domain.past_tense_action",
  "schemaVersion": 1,
  "occurredAt": "timestamptz",
  "ownerOrganizationId": "uuid",
  "clientOrganizationId": "uuid|null",
  "projectId": "uuid|null",
  "aggregateType": "string",
  "aggregateId": "uuid",
  "resourceId": "uuid",
  "actorUserId": "uuid|null",
  "actorMembershipId": "uuid|null",
  "systemPrincipal": "string|null",
  "correlationId": "uuid",
  "causationId": "uuid|null",
  "idempotencyKey": "string",
  "visibility": "INTERNAL_ONLY|CLIENT_SHARED|PUBLIC",
  "data": { "ids_and_safe_transition_metadata_only": true }
}
```

Events never broadcast raw secrets, unrestricted contact data, internal notes, payment credentials, margins, or full documents. Consumers retrieve sensitive details through authorized services. Producers write the outbox row in the same transaction as the state change. Consumers deduplicate by `eventId` and idempotency key.

## 2. Lead, outreach, and communication events

| Event | Producer | Required payload IDs | Default consumers and effects |
|---|---|---|---|
| `lead.created` | lead service/import | lead, source | activity, dedupe projection |
| `lead.extracted` | extraction/lead workflow | lead, source evidence | dedupe projection; staging activity |
| `lead.enrichment_requested` | lead workflow | lead, enrichment job | provider worker |
| `lead.enriched` | enrichment/lead workflow | lead, accepted fact set/hash | score/dedupe workers |
| `lead.qualification_started` | lead workflow | lead, qualification | Sales task |
| `lead.qualified` | qualification service | lead, qualification | outreach/deal eligibility, owner notification |
| `lead.disposition_recorded` | lead workflow | lead, disposition, follow-up task optional | nurture scheduler |
| `lead.outreach_ready` | lead/outreach workflow | lead, approved audience version | launch eligibility projection |
| `lead.contacted` | verified provider intake | lead, message/send evidence | first-contact projection and SLA |
| `lead.replied` | reply classifier | lead, conversation, message | stop pending sequence steps; owner notification |
| `lead.do_not_contact` | compliance service | lead/contact, suppression | stop all recipient jobs, alert owners |
| `lead.converted` | deal service | lead, deal | CRM projection and attribution |
| `campaign.ready` | outreach service | campaign, version | launch-review queue |
| `campaign.approved` | approval/workflow | campaign, version, decision | scheduling enabled |
| `campaign.scheduled` | outreach workflow | campaign, schedule | scheduler |
| `campaign.started` | campaign runner | campaign, run | recipient execution |
| `campaign.paused` | workflow | campaign, reason | stop future sends |
| `campaign.completed` | runner | campaign, metrics cutoff | reporting projection |
| `campaign.failed` | runner | campaign, error code | Sales/Ops priority notification, retry task |
| `message.sent/delivered/opened/clicked/replied` | provider intake | message/recipient, provider event | recipient projection and analytics |
| `message.bounced/unsubscribed` | provider intake | recipient/contact, provider evidence | suppression/sequence stop |
| `lead.positive_reply` | reply classifier/authorized user | conversation, message, lead | stop sequence; create 4-business-hour Sales task |
| `conversation.assigned/resolved/reopened` | conversation service | conversation, assignee/reason | notifications/activity |
| `meeting.scheduled/rescheduled/cancelled/completed/no_show` | meeting service | meeting, participants | calendars, tasks, deal/client timeline |

## 3. Commercial and finance events

| Event | Producer | Required payload IDs | Consumers/effects |
|---|---|---|---|
| `deal.created` | deal service | deal, source lead/contact | pipeline/read model |
| `deal.stage_changed` | deal workflow | deal, from/to, history | forecast, tasks, activity |
| `deal.won` | deal workflow | deal, accepted proposal/contract/gate evidence | idempotent client/onboarding/project shell command |
| `deal.lost` | deal workflow | deal, reason | forecast, nurture task |
| `proposal.review_requested` | proposal workflow | proposal version, approval | approver notification |
| `proposal.sent/viewed/changes_requested/accepted/declined/expired` | proposal/provider/client workflow | proposal/version and evidence | deal-stage projection, follow-up tasks |
| `contract.review_requested` | contract workflow | contract version, approval | approver notification |
| `contract.sent/viewed/signature_pending/signed/activated` | contract/provider workflow | contract/version/envelope | client notification and production-gate recalculation |
| `contract.declined/expired/terminated/superseded` | workflow/provider | contract/version, reason | commercial/account tasks |
| `invoice.approved/sent/opened/overdue` | invoice workflow/scheduler | invoice, version | immutable legal numbering on send; client notice; Finance/Account overdue alert |
| `invoice.partially_paid/paid/voided/credited` | allocation/accounting | invoice, allocation/credit | balance and production-gate projections |
| `payment.processing/succeeded/failed/cancelled` | verified provider intake | payment, provider event | ledger/allocation, alerts, receipts |
| `payment.partially_refunded/refunded/disputed/dispute_resolved` | finance/provider | payment, refund/dispute | ledger, client-safe status, Finance cases |
| `credit_note.issued` | Finance | credit note, invoice | ledger and client delivery |

## 4. Client, project, production, and approval events

| Event | Producer | Required payload IDs | Consumers/effects |
|---|---|---|---|
| `client.created` | deal/onboarding service | client account, organization | Client 360 projection |
| `client.portal_invited/activated/revoked` | IAM/onboarding | client, membership/invite | welcome/security notifications |
| `client.onboarding_stage_changed/completed` | onboarding workflow | client, workflow/stage | Account/Operations tasks |
| `project.created/started/held/blocked/unblocked/completed/archived` | project workflow | project, state/history | dashboards, notifications, renewal evaluation |
| `workflow.stage_entered/completed/skipped/blocked/reopened` | workflow engine | instance, stage run, iteration | generated tasks, SLA timers, activity |
| `task.created/assigned/due_soon/overdue/completed/reopened` | task/SLA service | task, assignee | notifications and workload projections |
| `questionnaire.sent/opened/submitted/changes_requested/accepted` | questionnaire service | instance/submission | client/editor notifications and stage commands |
| `research.item_verified` | editorial service | research item, verifier | draft readiness calculation |
| `draft.version_created/ready_for_review/approved/changes_requested` | content/approval | draft and exact version | review/revision tasks |
| `deliverable.version_created/internal_ready/client_ready/approved` | delivery/approval | deliverable/version/manifest | stage commands and client notifications |
| `approval.requested` | approval service | request, exact target version/hash | approver notifications and expiry schedule |
| `approval.decided` | approval service | request, step, decision, actor | stage/readiness calculation |
| `approval.overridden` | approval service | request, original decision, override | high-priority audit and stakeholders |
| `approval.expired/superseded/cancelled` | scheduler/version service | request, reason/version | requester notification/new request task |

## 5. Magazine, podcast, video, event, and asset events

| Event family | Canonical events |
|---|---|
| Magazine | `magazine.issue_created`, `magazine.cover_concept_created`, `magazine.cover_approved`, `magazine.design_version_created`, `magazine.proof_ready`, `magazine.proof_approved`, `magazine.reader_build_ready` |
| Podcast | `podcast.guest_invited`, `podcast.guest_confirmed`, `podcast.recording_scheduled`, `podcast.recorded`, `podcast.audio_version_created`, `podcast.transcript_ready`, `podcast.episode_approved`, `podcast.clips_created` |
| Video | `video.shoot_scheduled`, `video.shot`, `video.script_version_created`, `video.version_created`, `video.captions_ready`, `video.thumbnail_ready`, `video.approved`, `video.clips_created` |
| Event | `event.planning_started`, `event.speaker_outreach_started`, `event.speakers_confirmed`, `event.partner_outreach_started`, `event.agenda_ready`, `event.registration_opened`, `event.pre_event_started`, `event.started`, `event.completed`, `event.check_in_recorded`, `event.post_content_ready`, `event.distribution_started`, `event.reporting_started`, `event.closed` |
| Asset | `asset.uploaded`, `asset.processing_started`, `asset.available`, `asset.processing_failed`, `asset.version_replaced`, `asset.review_requested`, `asset.approved`, `asset.rejected`, `asset.rights_cleared`, `asset.rights_expired/revoked` |

Asset-rights expiry/revocation triggers publication/distribution impact assessment; it does not silently delete prior published evidence.

## 6. Publishing, distribution, reporting, delivery, renewal, and support

| Event | Consumers/effects |
|---|---|
| `publication.editorial_ready/technical_ready/approved/ready` | readiness projections and publish queue eligibility |
| `publication.scheduled` | scheduler job |
| `publication.started/published/failed/blocked` | URL verification; Distribution start on published; urgent Ops/Publishing alert on failure |
| `publication.correction_requested/corrected/unpublished/archived` | editorial/publish tasks, redirects, public projection updates |
| `distribution.approved/scheduled/started/completed/partial/failed` | channel jobs, stakeholder notices, report collection |
| `distribution.item_published/failed/skipped/removed` | URL/provider evidence and metrics eligibility |
| `metric.ingested/verified/rejected/stale` | report-readiness calculation and source-health alerts |
| `report.data_incomplete/review_requested/approved/client_ready/delivered/superseded` | analyst/account/client notifications and delivery records |
| `delivery.ready/sent/viewed/acknowledged/completed` | client notification, completion gate, activity |
| `renewal.upcoming/review_required/opportunity_created/contacted/interested/renewed/lost/deferred` | Account/Sales tasks and new linked deal/project on renewal |
| `support.requested/triaged/replied/waiting/resolved/closed/reopened` | SLA timers, requester/assignee notifications, support metrics |

## 7. Automation rule catalog

| Trigger | Command | Guard | Idempotency key |
|---|---|---|---|
| `lead.positive_reply` | stop recipient sequence; create Sales follow-up task | not suppressed; no open equivalent task/opportunity | event + lead + rule version |
| `deal.won` | create/link client, onboarding, and project shell | exact deal gate evidence; no existing linkage | deal + onboarding policy version |
| `contract.signed` | notify owners; recalculate production gate | verified final signature | contract version + event |
| `payment.succeeded` | allocate/reconcile invoice; recalculate gate | verified deduplicated provider event | provider + external event |
| `questionnaire.submitted` | notify editor; create review task | exact immutable submission | submission + workflow stage |
| `draft.ready_for_review` | request internal approval | required citations/assets/checklist | draft version + approval policy |
| `approval.decided:APPROVED` | advance stage or request next/client approval | exact current version and complete approval policy | request + decision set hash |
| `approval.decided:CHANGES_REQUESTED` | create successor revision stage/task | current request and applicable workflow | request + decision |
| `asset.rights_cleared` | recalculate publication readiness | right covers target/channel/date | asset version + target |
| `publication.published` | create/start distribution campaign | verified canonical URL and approved plan | publication version + plan |
| `distribution.completed` | schedule metric collection/reporting | required items terminal | campaign + completion version |
| `report.delivered` | advance client delivery/project gate | exact delivered version | report version + delivery |
| `project.completed` | schedule renewal evaluation | completion gates and eligible package | project + renewal policy |
| `invoice.overdue` | notify Finance/Account; create collection task | open balance and no active grace hold | invoice + due occurrence |
| `approval.requested` | schedule reminder and expiry timers | active request | request + SLA policy version |

### Required canonical aliases

Grouped event-family rows above are emitted as individual canonical events. The following required names are frozen for downstream consumers:

```text
proposal.sent
proposal.accepted
invoice.sent
payment.failed
payment.refunded
client.portal_activated
project.stage_changed
project.blocked
approval.approved
approval.changes_requested
publication.ready
publication.published
publication.failed
renewal.due
renewal.converted
```

- `approval.approved` and `approval.changes_requested` are specialized projections of `approval.decided` and retain the decision ID.
- `project.stage_changed` is emitted with the workflow/stage history ID; `project.blocked` additionally includes the blocker ID.
- `renewal.due` is emitted when the resolved policy moves `NOT_DUE → UPCOMING`; `renewal.converted` is emitted when the renewal links its successor opportunity/deal.
- Family shorthand such as `proposal.sent/viewed/accepted` in this document means distinct events, not a literal slash-containing event name.

## 8. Notification policy

- In-app notification is default for assigned work and non-urgent workflow changes.
- Email is allowed for client-facing requests, approvals, contracts, invoices, events, and configured SLA reminders.
- High-priority channels are reserved for payment, publishing, security, event-live, or production-blocking failures.
- A notification references a resource and safe action URL; it does not duplicate sensitive record contents.
- Client recipients are selected only from the target client organization and explicit project/request participants.

## 9. Event schema governance

1. Event names are stable, lower-case, namespaced, and past tense.
2. Breaking payload changes require a new `schemaVersion`; consumers declare supported versions.
3. Event ordering is guaranteed only per aggregate. Consumers tolerate duplication and reordering.
4. Webhook/provider intake stores the original event before producing normalized domain events.
5. Replay is permitted; side-effect consumers use durable idempotency records.
6. Public analytics events are separate from operational domain events.
7. Audit logs are not reconstructed solely from the event bus; sensitive transitions write audit evidence transactionally.
