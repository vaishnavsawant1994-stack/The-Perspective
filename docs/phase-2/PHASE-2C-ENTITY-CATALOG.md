# Phase 2C Entity Catalog

This catalog makes the Phase 2C master architecture concrete. Names are canonical logical names; physical table naming should use `snake_case` and the schema shown below.

## Requested term to canonical entity map

Phase 2C uses explicit names where the requested business term could otherwise create duplicate identities or ambiguous foreign keys.

| Requested term | Canonical implementation |
|---|---|
| Organization | `iam.organization` |
| User | `iam.user_account` linked to `iam.person` |
| Employee | `iam.organization_membership` + `iam.employee_profile` |
| Team | `iam.team` + `iam.team_membership` |
| UserRole | `iam.membership_role`; roles belong to memberships, not directly to global users |
| ClientPortalUser | Client-type `iam.organization_membership` with a client role; no duplicate client-user table |
| Client | `delivery.client_account` linked to the client `iam.organization` |
| Deadline | Canonical `due_at`/milestone dates on their owning record, projected through `platform.calendar_item`; no disconnected deadline copy |
| Response | `delivery.questionnaire_response` under a versioned submission |
| Revision | A new immutable content/design/media version plus review/change-request history |
| ApprovalVersion | Exact target version/hash on `approvals.approval_request`; decisions never point only to a mutable aggregate |
| MagazineProject | `delivery.project` with type `MAGAZINE` plus `magazine.issue` |
| PodcastProject | `delivery.project` with type `PODCAST` plus `media.podcast_episode` |
| VideoProject | `delivery.project` with type `VIDEO` plus `media.video_project` |
| Deliverable | `delivery.deliverable`; type-specific modules extend it rather than creating competing deliverable tables |

## 1. Common field groups

### Mutable aggregate

`id`, `resource_id`, ownership columns, `status`, `created_at`, `created_by`, `updated_at`, `updated_by`, `row_version`, `archived_at`.

### Immutable version

`id`, parent aggregate ID, `version_number`, `supersedes_id`, content/manifest, `content_hash`, `created_at`, `created_by`. No update/delete through product APIs.

### External-provider projection

`provider`, `provider_account_id`, `external_id`, `idempotency_key`, `raw_event_id`, `synced_at`, `sync_status`.

## 2. IAM and organization

| Entity | Purpose | Core relationships / constraints |
|---|---|---|
| `iam.person` | One human identity across staff, contact, author, guest, speaker, and client | Deduplication keys are normalized email/phone plus reviewed merge links |
| `iam.user_account` | Login identity and account state | Optional one-to-one person; unique auth-provider subject |
| `iam.user_identity` | SSO/OAuth/password identity link | Many per user; provider subject unique |
| `iam.session` | Revocable authenticated session | User, active membership, device, expiry; raw tokens excluded |
| `iam.mfa_method` | MFA enrollment metadata | User-owned; secrets referenced from secure store |
| `iam.organization` | Platform/client/partner/vendor legal-operating identity | Parent organization optional; unique normalized domain where appropriate |
| `iam.organization_membership` | User access to an organization | Unique active user+organization membership; staff/client type |
| `iam.department` | Department and hierarchy | Belongs to platform organization; optional parent |
| `iam.team` | Durable cross-functional or departmental team | Organization, optional department/manager, type, status |
| `iam.team_membership` | Membership in a team | Team + organization membership, team role, active dates |
| `iam.employee_profile` | Staff employment metadata | One per staff membership; manager, skills, capacity, availability |
| `iam.role` | Named launch/custom role | Stable key; system roles protected |
| `iam.permission` | Atomic permission key | Stable `domain.action` key |
| `iam.role_permission` | Permission grants/denies per role | Unique role+permission; optional constraints |
| `iam.membership_role` | Role assignment | Membership, role, scope, valid dates |
| `iam.record_assignment` | Explicit assigned-record scope | Membership + resource + assignment type; unique active tuple |
| `iam.invitation` | Staff/client membership invite | Hashed token, organization, intended role, expiry, acceptance state |

## 3. Shared platform records

| Entity | Purpose | Core relationships / constraints |
|---|---|---|
| `platform.resource` | Typed FK target and security envelope | Resource type, ownership, visibility, sensitivity |
| `platform.comment` | Collaboration note | Resource/version, author membership, explicit visibility, optional parent |
| `platform.activity_event` | Unified human-readable timeline | Resource, actor, event type, client-visible flag, occurred time |
| `platform.notification` | In-app notification | Recipient membership/user, resource, template, priority, read state |
| `platform.notification_preference` | Channel/category delivery preference | User/membership + category + channel unique |
| `platform.calendar_item` | Unified calendar projection | Resource source, participants, start/end, timezone, visibility |
| `platform.support_ticket` | Internal/client support case | Requester, client org, category, status, priority, assignee |
| `platform.support_message` | Support conversation entry | Ticket, author, visibility, immutable body/version |
| `platform.automation_rule` | Trigger/condition/action definition | Versioned; organization/domain scope; enabled state |
| `platform.automation_run` | Rule execution and outcome | Idempotent trigger key; attempts and trace |
| `platform.outbox_event` | Reliable async event publication | Aggregate/resource, event type, payload, delivery state |
| `platform.webhook_subscription` | Outbound webhook endpoint and event allowlist | Organization, URL, secret reference, status, delivery policy |
| `platform.webhook_delivery` | Immutable outbound attempt/result | Subscription, outbox event, attempt, response metadata, next retry |
| `platform.integration_connection` | Connected provider account | Organization, provider, encrypted credential reference, scopes, health |
| `platform.webhook_event` | Immutable provider event intake | Provider event ID unique, signature state, processing state |
| `platform.custom_field_definition` | Controlled extensibility | Organization + resource type + key unique |
| `platform.custom_field_value` | Typed custom field value | Resource + definition unique |
| `audit.audit_event` | Append-only security/sensitive mutation evidence | Actor, action, resource, before/after redacted snapshots/hashes, request metadata |

## 4. CRM and lead operations

| Entity | Purpose | Core relationships / constraints |
|---|---|---|
| `crm.lead_source` | Source configuration and provenance | Organization, source type, terms, health |
| `crm.extraction_job` | Lead collection job | Source, query/config snapshot, requested by, progress, cost |
| `crm.staged_record` | Reviewable raw extracted record | Job, source payload, normalized preview, confidence, dedupe candidate |
| `crm.enrichment_job` | Enrichment request | Lead/company/contact target, provider, fields requested, status |
| `crm.enrichment_fact` | Provenanced field candidate | Target resource, field, value, confidence, source, observed date, accepted state |
| `crm.company` | Canonical company/account identity | Optional organization link when converted; normalized domain unique by policy |
| `crm.contact` | Business contact profile | Person + company; role/title and consent state |
| `crm.lead` | Prospecting/qualification record | Company/contact, source, owner, lifecycle state, score, consent/legal basis |
| `crm.lead_score` | Immutable model/rule score observation | Lead, model version, component evidence, score, calculated time |
| `crm.lead_status_history` | Immutable lifecycle transitions | Lead, from/to, actor, reason, occurred time |
| `crm.lead_list` | Curated lead group | Owner, sharing scope, dynamic/static type |
| `crm.lead_list_member` | Membership in a lead list | Lead+list unique |
| `crm.qualification` | Qualification assessment | Lead/deal, criteria snapshot, score, disposition, reviewer |
| `crm.duplicate_candidate` | Merge-review record | Entity pair, confidence, reasons, resolution |
| `crm.suppression_entry` | Contact/do-not-contact safety list | Channel and normalized destination; reason/source/expiry |

### Lead state

`NEW → REVIEW → ENRICHING → READY → QUALIFYING → QUALIFIED | NURTURE | DISQUALIFIED | SUPPRESSED | CONVERTED`

## 5. Outreach, communication, and meetings

| Entity | Purpose | Core relationships / constraints |
|---|---|---|
| `comms.sending_account` | Connected email/social sender | Integration connection, owner/team, limits, health |
| `comms.message_template` | Reusable message content | Versioned subject/body, channel, ownership |
| `comms.outreach_campaign` | Targeted outreach program | Owner, audience list, sequence, schedule, approval/launch state |
| `comms.sequence` | Ordered outreach workflow | Campaign/template scope, version |
| `comms.sequence_step` | Timed channel action | Sequence, position, delay, stop conditions |
| `comms.campaign_recipient` | Lead/contact campaign state | Campaign+recipient unique; current step/outcome |
| `comms.message_delivery` | Send/delivery/open/reply events | Recipient, step, provider IDs, status chronology |
| `comms.conversation` | Unified thread across channel | Client/lead/contact links, ownership, assignment, visibility |
| `comms.conversation_participant` | Person/address in a thread | Conversation+participant/channel identity unique |
| `comms.message` | Immutable inbound/outbound message | Conversation, sender, channel, external ID, body asset, direction |
| `comms.call` | Call record | Participants, provider, start/end, recording/transcript assets |
| `comms.meeting` | Scheduled/completed meeting | Participants, deal/client/project links, location/link, status |
| `comms.meeting_note` | Structured outcome and follow-up | Meeting, author, explicit visibility |

## 6. Commercial, contracts, and finance

| Entity | Purpose | Core relationships / constraints |
|---|---|---|
| `commercial.product` | Sellable offering | Stable key, category, active state |
| `commercial.package` | Configured offer/package | Product, price/currency, deliverables, timeline, revisions, terms; versioned |
| `commercial.deal_pipeline` | Configurable pipeline | Organization/department, active version |
| `commercial.deal_stage` | Ordered pipeline stage | Pipeline, probability, entry/exit rules |
| `commercial.deal` | Opportunity aggregate | Lead/company/contact, owner, value, stage, forecast, expected close |
| `commercial.deal_stage_history` | Immutable stage movement | Deal, from/to, actor, reason, time |
| `commercial.deal_product` | Product/package on a deal | Quantity, proposed price, discount, margin restricted |
| `commercial.proposal` | Proposal aggregate | Deal/client, status, expiry, owner |
| `commercial.proposal_version` | Immutable proposal snapshot | Terms, items, totals, document asset, approvals |
| `commercial.proposal_acceptance` | Acceptance/rejection evidence | Exact version, actor, organization, timestamp, signature/reference |
| `commercial.client_account` | Commercial/delivery profile of client org | One active per client organization; owner/account manager/onboarding state |
| `commercial.client_relationship` | Contact role for a client | Client account, person/contact, role, primary/billing/approver flags |
| `commercial.contract` | Contract lifecycle aggregate | Client/deal/project links, type, status, dates |
| `commercial.contract_version` | Immutable contract terms/document | Version hash, asset, terms snapshot |
| `commercial.contract_signer` | Required signer and order | Contract version, person, organization, role |
| `commercial.signature_event` | Immutable e-sign status/evidence | Signer, provider event, timestamp, envelope evidence |
| `commercial.invoice` | Billing document aggregate | Client/contract/project, currency, number, issue/due/status |
| `commercial.invoice_line` | Immutable issued line/adjustment | Product/project, quantity, tax, amount minor units |
| `commercial.credit_note` | Issued credit against an invoice | Client/invoice, reason, immutable lines, amount/currency, issued state |
| `commercial.payment` | Provider-confirmed or controlled manual transaction | Client, provider IDs, amount/currency, state, occurred time |
| `commercial.payment_allocation` | Payment/refund application to invoice | Payment+invoice+type+amount; cannot exceed balances |
| `commercial.ledger_entry` | Append-only accounting event | Balanced transaction group, account code, debit/credit minor units |
| `commercial.refund` | Refund request/outcome | Payment, amount, reason, requester, approver, provider status |
| `commercial.renewal_opportunity` | Renewal/upsell candidate | Client/project/deal source, recommended package, owner, due date, state |

### Money invariants

- Issued invoice versions do not mutate; corrections use credit/debit adjustments.
- Provider events are deduplicated before changing payment state.
- `sum(payment_allocation)` determines invoice balance.
- Ledger transaction groups balance in one currency.
- Margin and internal cost never enter client-safe projections.

## 7. Delivery and workflow engine

| Entity | Purpose | Core relationships / constraints |
|---|---|---|
| `delivery.project` | Delivery container | Client, originating deal/contract, package snapshot, owner, dates, health |
| `delivery.project_member` | Team/client participant | Project + membership/person, role, visibility, dates |
| `delivery.project_milestone` | Client/internal milestone | Project, due/completed time, visibility, status |
| `delivery.workflow_template` | Versioned reusable process | Type, version, organization, immutable once instantiated |
| `delivery.workflow_stage_template` | Stage definition | Template version, order, allowed roles, SLA, client visibility |
| `delivery.workflow_transition_rule` | Valid state transition | From/to, permission, guard, generated actions |
| `delivery.workflow_instance` | Running workflow | Project/deliverable, frozen template version, active stage, state |
| `delivery.workflow_stage_run` | Actual stage execution | Instance, template stage, owner, entered/due/completed, outcome |
| `delivery.workflow_transition` | Immutable transition event | Instance, from/to runs, actor, reason, automation run |
| `delivery.task` | Actionable work item | Resource/project/stage, assignee, status, priority, due/SLA, visibility |
| `delivery.task_dependency` | Blocking relationship | Task pair, dependency type; cycle prohibited |
| `delivery.task_checklist_item` | Small completion unit | Task, order, state, completer |
| `delivery.questionnaire_template` | Versioned question set | Product/workflow type, sections, schema |
| `delivery.questionnaire_instance` | Client/staff request | Project, template version, recipient, due, status |
| `delivery.questionnaire_response` | Draft response aggregate | Instance, respondent, current version |
| `delivery.questionnaire_submission` | Immutable submitted snapshot | Instance, answers snapshot/hash, submitter/time |
| `delivery.deliverable` | Common output envelope | Project, type, title, owner, workflow, current version/status |
| `delivery.deliverable_version` | Immutable reviewed/published payload | Manifest/content hash, author, supersedes, change summary |

## 8. Editorial content

| Entity | Purpose | Core relationships / constraints |
|---|---|---|
| `content.editorial_work` | Article/blog/interview/report story aggregate | Deliverable, content type, pitch, editor, access tier |
| `content.draft` | Collaborative editable draft head | Editorial work, current version, lock/concurrency state |
| `content.draft_version` | Immutable body snapshot | Structured document, hash, author, citations snapshot |
| `content.revision` | Change request resolved by a newer immutable draft version | Draft, from/to versions, requester, request comment, resolution time |
| `content.citation` | Source and claim support | Draft version, locator, source metadata, verification status |
| `content.fact_check` | Fact-check run/item | Version, checker, findings, outcome |
| `content.editorial_review` | Structured editorial review | Exact draft version, reviewer, checklist, outcome |
| `content.author_credit` | Person/author attribution | Work, person, credit role, order |
| `content.subject_credit` | Covered person/company/topic | Work, resource/person/company, relationship type |
| `content.taxonomy_term` | Topic/category/tag | Hierarchical, canonical slug |
| `content.work_taxonomy` | Work-to-taxonomy link | Work+term+relationship unique |

## 9. Magazine and Personal Magazine

| Entity | Purpose | Core relationships / constraints |
|---|---|---|
| `magazine.publication` | Magazine title/series | Standard, Premium, or Personal product line |
| `magazine.issue` | Issue aggregate | Publication, client/project optional, volume/number/date/status |
| `magazine.issue_story` | Editorial work included in issue | Issue+work, section, order, page range |
| `magazine.page` | Logical page/spread | Issue, number, section, current layout version |
| `magazine.design_version` | Immutable cover/page/spread design source or export | Design type, page/cover parent, manifest, asset version, hash |
| `magazine.cover` | Cover aggregate | Issue, selected version |
| `magazine.cover_concept` | Named cover direction | Issue, selected design version, creator, status |
| `magazine.proof` | Reviewable compiled proof | Issue, included versions manifest, PDF/reader assets, hash |
| `magazine.reader_build` | Digital Reader release artifact | Issue, manifest, page assets, text-view links, version/status |
| `magazine.print_spec` | Print production specification | Issue, trim/bleed/color/paper/binding/version |
| `magazine.personal_profile` | Personal Magazine subject context | Issue/project/person/client, approved biography/identity fields |

## 10. Podcast and video

| Entity | Purpose | Core relationships / constraints |
|---|---|---|
| `media.podcast_show` | Podcast series/show | Brand, host, topics, public route, status |
| `media.podcast_episode` | Episode aggregate | Show, deliverable/project, guest, recording/publish status |
| `media.podcast_guest` | Guest participation | Episode+person, role, release/consent state |
| `media.recording_session` | Planned/completed recording | Episode/video, participants, calendar, location, technical state |
| `media.recording_asset` | Source recording relation | Session, asset version, channel/track, checksum |
| `media.audio_version` | Immutable audio master candidate | Episode, source manifest, duration, loudness, transcript, creator |
| `media.transcript` | Transcript aggregate | Media target, language, current version |
| `media.transcript_version` | Immutable timed transcript | Segments, speakers, confidence, corrections |
| `media.clip` | Bounded excerpt from an exact audio/video version | Source version, timecodes, title, current asset version, publish state |
| `media.video_project` | Video story/episode aggregate | Deliverable/project, speaker, format, status |
| `media.shoot` | Video shoot plan/execution | Video project, schedule, crew, location, releases |
| `media.script` | Video script aggregate | Video project, current immutable script version |
| `media.script_version` | Immutable structured script | Script, structured body, duration estimate, author, hash |
| `media.video_version` | Immutable edit/master candidate | Video project, source manifest, duration, captions, creator |
| `media.caption_version` | Immutable timed captions/subtitles | Exact media version, language, cues, format, asset version |
| `media.thumbnail_version` | Immutable thumbnail candidate | Media target, asset, text treatment, creator |
| `media.media_release` | Consent/release evidence | Person, project/media, signed asset, usage scope, dates |

## 11. Events

| Entity | Purpose | Core relationships / constraints |
|---|---|---|
| `events.event` | Summit/event aggregate | Client/project optional, venue, dates, capacity, publish status |
| `events.venue` | Physical/virtual venue | Address/timezone/accessibility/connection details |
| `events.event_day` | Program day | Event, date, operating hours |
| `events.agenda_item` | Agenda session, keynote, break, or operating item | Event/day, start/end, room, type, status |
| `events.agenda_participant` | Speaker/moderator/panelist | Agenda item+person, role, order, confirmation |
| `events.speaker` | Speaker relationship profile | Person, organization, biography, contract/release state |
| `events.partner` | Sponsorship/partner relationship | Event+organization, tier, deliverables, owner |
| `events.registration` | Attendee registration | Event, person/user, ticket type, status, source |
| `events.ticket` | Entry credential | Registration, code/QR hash, issued/revoked/checked-in state |
| `events.check_in` | Immutable attendance event | Ticket, scanner/actor, time, location |
| `events.saved_agenda_item` | Attendee agenda selection | Registration/user+agenda item unique |

## 12. Assets and rights

| Entity | Purpose | Core relationships / constraints |
|---|---|---|
| `assets.folder` | Virtual asset organization | Owner/client/project context, optional parent, unique live name within parent |
| `assets.asset` | Logical reusable asset | Owner/client/project, type, title, current version |
| `assets.asset_version` | Immutable binary version | Storage key, hash, MIME, size, dimensions/duration, uploader |
| `assets.asset_rendition` | Derived format | Source version, purpose, storage key, processor metadata |
| `assets.asset_link` | Attach asset to resource | Asset+resource+purpose+visibility unique as appropriate |
| `assets.asset_rights` | License/consent/use constraints | Asset/version/person, channels, territories, dates, credit |
| `assets.asset_usage` | Actual usage record | Asset version + publication/design/distribution resource |
| `assets.upload_session` | Multipart/client upload control | Requester, destination, expiry, virus-scan state |

## 13. Approvals

| Entity | Purpose | Core relationships / constraints |
|---|---|---|
| `approvals.approval_policy` | Versioned approval requirements | Resource/deliverable type, stage, required roles/count/order |
| `approvals.approval_request` | Review request for exact version | Target resource/version/hash, requester, due, status, visibility |
| `approvals.approval_step` | Ordered/parallel decision requirement | Request, sequence, required authority, assignee |
| `approvals.approval_decision` | Immutable decision evidence | Step/request, actor, decision, reason, exact target hash/time |
| `approvals.approval_override` | Explicit superseding authority event | Original decision/request, authorized actor, reason, audit link |

Decision values: `APPROVED`, `APPROVED_WITH_CHANGES`, `CHANGES_REQUESTED`, `REJECTED`. Request lifecycle adds `DRAFT`, `PENDING`, `EXPIRED`, `CANCELLED`, `SUPERSEDED`.

## 14. Publishing and distribution

| Entity | Purpose | Core relationships / constraints |
|---|---|---|
| `publishing.channel` | Channel capability definition such as web, newsletter, social, reader, or partner feed | Stable key and supported content/media capabilities |
| `publishing.publication_target` | Configured destination within a channel | Channel, integration connection, configuration, access and SEO defaults |
| `publishing.publication` | Publish lifecycle for a deliverable and canonical target | Deliverable, target, status, current immutable version, schedule/live times |
| `publishing.publication_version` | Immutable approved release snapshot | Publication, deliverable version, manifest/hash, assets, taxonomy, access tier, route |
| `publishing.publication_job` | Idempotent publish/unpublish execution | Publication version+target idempotency key, attempts/result |
| `publishing.published_url` | Live URL and verification state | Publication version, target/channel, canonical flag, live/verified times |
| `publishing.distribution_campaign` | Multi-channel distribution plan | Publication/project/client, owner, schedule, status |
| `publishing.distribution_item` | One channel creative/copy/output | Campaign, target, asset/copy version, URL/status |
| `publishing.distribution_event` | Delivery/provider event history | Item, event type, external ID, occurred time |

## 15. Reporting and renewals

| Entity | Purpose | Core relationships / constraints |
|---|---|---|
| `reporting.metric_definition` | Stable metric semantics | Key, unit, aggregation, allowed sources |
| `reporting.metric_source` | Provider/data source configuration | Integration, verification rule, freshness SLA |
| `reporting.metric_observation` | Immutable measured value | Resource, definition, source, period, value, verification state |
| `reporting.metric_rollup` | Rebuildable aggregate | Resource/period/dimension; derived from observations |
| `reporting.report` | Client/internal report aggregate | Project/client/type/status/current version |
| `reporting.report_version` | Immutable report snapshot | Metric cutoff, sources, narrative, asset, hash |
| `reporting.delivery_pack` | Final deliverables bundle | Project, manifest of exact versions/assets/links/report |
| `reporting.delivery_receipt` | Client acknowledgement/download | Delivery pack, actor, event/time |

## 16. Screen-module coverage

| Phase 2A screens | Module | Primary schemas |
|---|---|---|
| 1–10 | Staff Identity & Workspace Core | `iam`, `platform`, `audit` |
| 11–22 | Lead Discovery, Extraction & CRM | `crm`, `platform`, `assets` |
| 23–34 | Outreach, Inbox & Communication | `comms`, `crm`, `platform` |
| 35–44 | Deals & Client CRM | `commercial`, `crm`, `comms`, `delivery` |
| 45–52 | Commercial, Contracts & Finance | `commercial`, `approvals`, `audit`, `assets` |
| 53–60 | Projects & Workflow Engine | `delivery`, `platform`, `assets`, `approvals` |
| 61–68 | Editorial Studio | `content`, `delivery`, `approvals`, `assets` |
| 69–75 | Magazine Studio | `magazine`, `content`, `delivery`, `approvals`, `assets` |
| 76–81 | Podcast Studio | `media`, `delivery`, `approvals`, `assets` |
| 82–87 | Video Studio | `media`, `delivery`, `approvals`, `assets` |
| 88–93 | Events Operations | `events`, `delivery`, `commercial`, `assets` |
| 94–101 | Publishing & Distribution | `publishing`, `content`, `magazine`, `media`, `events` |
| 102–106 | Reporting & Renewals | `reporting`, `commercial`, `publishing` |
| 107–120 | Approvals, Tasks, Team & Administration | `approvals`, `delivery`, `iam`, `platform`, `audit` |
| 121–151 | Client Portal | Authorized projections from all relevant schemas; no duplicate domain tables |

Every one of the 151 rows falls into exactly one range above. Cross-schema use is intentional; ownership and authorization stay consistent through `resource`.
