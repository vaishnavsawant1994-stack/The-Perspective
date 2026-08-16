# Phase 2C Entity Fields, Primary Keys & Foreign Keys

**Status:** Architecture freeze candidate  
**Companion:** [Entity Catalog](./PHASE-2C-ENTITY-CATALOG.md)

This document freezes the fields and key relationships required to implement the Phase 2C logical model. The companion catalog explains purpose and behavior; this file defines implementation-level shape.

## 1. Type and naming contract

| Logical type | PostgreSQL | Prisma | Notes |
|---|---|---|---|
| Entity ID | `uuid` | `String @db.Uuid` | Application-generated UUIDv7 |
| Instant | `timestamptz(6)` | `DateTime @db.Timestamptz(6)` | UTC only |
| Local date | `date` | `DateTime @db.Date` | No timezone conversion |
| Money | `bigint` + `char(3)` | `BigInt` + `String` | Minor units and ISO-4217 currency |
| Rate | `numeric(12,6)` | `Decimal` | No floating point |
| Normalized email/domain | `citext` | `String` with extension/native type | Preserve original separately when needed |
| Flexible provider snapshot | `jsonb` | `Json` | Immutable/bounded; not core relationships |
| Searchable body | `text` | `String` | Structured content may also have JSON manifest |
| Status/type | database enum or checked text | enum | Stable API value; UI labels are separate |

Names use singular Prisma models and plural `snake_case` database tables. Foreign keys use `<entity>_id`. Join tables use both entity names. Provider keys use `external_id`, never a primary key.

## 2. Standard field profiles

### 2.1 Mutable tenant aggregate (`MTA`)

| Field | Null | Rule |
|---|---:|---|
| `id` | No | PK, UUIDv7 |
| `resource_id` | Usually no | Unique FK → `platform.resources.id` |
| `owner_organization_id` | No | FK → `iam.organizations.id` |
| `client_organization_id` | Yes | FK → `iam.organizations.id`; required for client delivery/commercial records |
| `project_id` | Yes | FK → `delivery.projects.id` |
| `owner_membership_id` | Yes | FK → `iam.organization_memberships.id` |
| `assigned_membership_id` | Yes | FK → `iam.organization_memberships.id` |
| `department_id` | Yes | FK → `iam.departments.id` |
| `visibility` | No | `INTERNAL`, `CLIENT_SHARED`, `PUBLIC` |
| `sensitivity` | No | `STANDARD`, `CONFIDENTIAL`, `PII`, `FINANCIAL`, `SECURITY`, `SECRET` |
| `status` | No | Entity-specific enum |
| `created_at`, `created_by_membership_id` | No / actor nullable only for system bootstrap | Creator FK |
| `updated_at`, `updated_by_membership_id` | No / actor nullable for system job | Last updater FK |
| `row_version` | No | Optimistic concurrency integer |
| `archived_at`, `archived_by_membership_id` | Yes | Archive pair; partial index on live rows |

### 2.2 Immutable version (`IV`)

`id` PK, parent FK, `version_number`, `supersedes_id`, `content_hash`, typed snapshot/manifest fields, `created_at`, `created_by_membership_id`, optional `change_summary`. Unique `(parent_id, version_number)` and usually unique `(parent_id, content_hash)`.

### 2.3 Immutable event (`IE`)

`id` PK, aggregate/resource FK, `event_type`, actor/system principal, `occurred_at`, `idempotency_key`, correlation/causation IDs, redacted `payload`, source/provider metadata. Product APIs never update event rows.

## 3. Organization and access

| Entity | Required fields beyond standard profile | Primary/unique keys | Foreign keys |
|---|---|---|---|
| `iam.people` | `display_name`, `given_name`, `family_name`, `primary_email`, `primary_phone`, `locale`, `timezone`, `avatar_asset_id` | PK `id`; unique normalized verified email where policy permits | avatar → asset |
| `iam.user_accounts` | `person_id`, `account_state`, `last_login_at`, `locked_until`, `email_verified_at` | PK; unique `person_id` when one account/person | person |
| `iam.user_identities` | `user_account_id`, `provider`, `provider_subject`, `credential_ref`, `last_used_at` | PK; unique `(provider, provider_subject)` | user account |
| `iam.sessions` | `user_account_id`, `active_membership_id`, `token_hash`, `device_id`, `ip_hash`, `expires_at`, `revoked_at` | PK; unique `token_hash` | user, membership |
| `iam.mfa_methods` | `user_account_id`, `method_type`, `secret_ref`, `verified_at`, `last_used_at`, `disabled_at` | PK; unique active `(user_account_id, method_type, secret_ref)` | user |
| `iam.organizations` | `organization_type`, `legal_name`, `display_name`, `slug`, `domain`, `status`, `parent_organization_id`, `settings` | PK; unique live `slug`; optional unique normalized domain | parent self-FK |
| `iam.organization_memberships` | `organization_id`, `user_account_id`, `membership_type`, `title`, `department_id`, `manager_membership_id`, `status`, `joined_at`, `ended_at` | PK; unique active `(organization_id, user_account_id)` | organization, user, department, manager self-FK |
| `iam.departments` | `organization_id`, `name`, `slug`, `parent_department_id`, `manager_membership_id`, `status` | PK; unique live `(organization_id, slug)` | organization, parent, manager |
| `iam.teams` | `organization_id`, `department_id`, `name`, `slug`, `team_type`, `manager_membership_id`, `status` | PK; unique live `(organization_id, slug)` | organization, department, manager |
| `iam.team_memberships` | `team_id`, `organization_membership_id`, `team_role`, `valid_from`, `valid_until` | PK; unique active `(team_id, organization_membership_id)` | team, organization membership |
| `iam.employee_profiles` | `membership_id`, `employee_number`, `employment_type`, `capacity_minutes_week`, `availability_state`, `skills`, `start_date`, `end_date` | PK; unique `membership_id`; unique `(organization, employee_number)` | membership |
| `iam.roles` | `organization_id`, `key`, `name`, `description`, `system_role`, `default_scope`, `status` | PK; unique `(organization_id, key)` | organization |
| `iam.permissions` | `key`, `domain`, `action`, `description`, `risk_level` | PK; unique `key` | — |
| `iam.role_permissions` | `role_id`, `permission_id`, `effect`, `constraints` | Composite unique `(role_id, permission_id)` | role, permission |
| `iam.membership_roles` | `membership_id`, `role_id`, `scope`, `valid_from`, `valid_until` | Composite unique active `(membership_id, role_id)` | membership, role |
| `iam.record_assignments` | `resource_id`, `membership_id`, `assignment_type`, `starts_at`, `ends_at` | Unique active `(resource_id, membership_id, assignment_type)` | resource, membership |
| `iam.invitations` | `organization_id`, `email`, `intended_role_id`, `token_hash`, `inviter_membership_id`, `expires_at`, `accepted_at`, `revoked_at` | PK; unique `token_hash` | organization, role, inviter |

## 4. Platform core

| Entity | Required fields | Primary/unique keys | Foreign keys |
|---|---|---|---|
| `platform.resources` | `resource_type`, ownership/context, visibility, sensitivity, timestamps | PK `id`; index type/context | organizations, project |
| `platform.comments` | `resource_id`, `version_resource_id`, `parent_comment_id`, `author_membership_id`, `body`, `visibility`, `resolved_at` | PK | resource(s), parent, author |
| `platform.activity_events` | `resource_id`, `client_organization_id`, `event_type`, `summary`, `actor_membership_id`, `visibility`, `occurred_at`, `metadata` | PK; dedupe key optional | resource, org, actor |
| `platform.notifications` | `recipient_user_id`, `recipient_membership_id`, `resource_id`, `category`, `priority`, `title`, `body`, `action_url`, `read_at`, `expires_at` | PK; unique optional delivery dedupe | user, membership, resource |
| `platform.notification_preferences` | `user_account_id`, `membership_id`, `category`, `channel`, `enabled`, `digest`, `quiet_hours` | Unique `(user, membership, category, channel)` | user, membership |
| `platform.calendar_items` | `resource_id`, `source_type`, `title`, `starts_at`, `ends_at`, `timezone`, `location`, `visibility`, `external_event_id` | PK; unique provider key | resource |
| `platform.support_tickets` | MTA + `ticket_number`, `requester_user_id`, `category`, `priority`, `subject`, `status`, `assignee_membership_id`, `resolved_at` | PK; unique `ticket_number` | user, assignee, client/project context |
| `platform.support_messages` | `ticket_id`, `author_user_id`, `author_membership_id`, `body`, `visibility`, `created_at` | PK | ticket, author |
| `platform.automation_rules` | MTA + `key`, `trigger_type`, `conditions`, `actions`, `version`, `enabled` | Unique `(owner_org, key, version)` | organization/resource |
| `platform.automation_runs` | `rule_id`, `trigger_event_id`, `status`, `started_at`, `finished_at`, `attempt`, `trace`, `error_code` | Unique `(rule_id, trigger_event_id, attempt)` | rule, outbox/audit context |
| `platform.outbox_events` | `aggregate_resource_id`, `event_type`, `schema_version`, `payload`, `idempotency_key`, `available_at`, `published_at`, `attempts` | PK; unique idempotency key | resource |
| `platform.webhook_subscriptions` | MTA + `name`, `endpoint_url`, `secret_ref`, `event_types`, `status`, `retry_policy` | PK; unique live `(owner_org, endpoint_url)` | organization |
| `platform.webhook_deliveries` | `subscription_id`, `outbox_event_id`, `attempt`, `status`, request/response hashes and codes, `next_attempt_at`, timestamps | Unique `(subscription, outbox_event, attempt)` | subscription, outbox event |
| `platform.integration_connections` | MTA + `provider`, `connection_type`, `credential_ref`, `scopes`, `health`, `sync_cursor`, `last_sync_at`, `last_error_code` | Unique live `(owner_org, provider, connection_type, owner_membership)` | organization/membership |
| `platform.webhook_events` | `provider`, `external_event_id`, `connection_id`, `signature_valid`, `payload`, `received_at`, `processed_at`, `status` | Unique `(provider, external_event_id)` | connection |
| `audit.audit_events` | IE + `action`, `target_resource_id`, `actor_user_id`, `actor_membership_id`, `impersonator_user_id`, `before_hash`, `after_hash`, `redacted_diff`, `request_id`, `ip_hash`, `device_id`, `reason` | PK; append-only | users, membership, resource |

## 5. Lead, sales, and communication

| Entity | Required fields | Primary/unique keys | Foreign keys |
|---|---|---|---|
| `crm.lead_sources` | MTA + `source_type`, `name`, `base_url`, `compliance_notes`, `configuration`, `health` | Unique live `(owner_org, name)` | integration optional |
| `crm.extraction_jobs` | MTA + `lead_source_id`, `query_snapshot`, `status`, `requested_at`, `started_at`, `finished_at`, counts, `error_summary` | PK | source, requester |
| `crm.staged_records` | `extraction_job_id`, `source_record_key`, `raw_payload`, `normalized_payload`, `provenance_url`, `confidence`, `validation_state`, `dedupe_resource_id` | Unique `(job, source_record_key)` | job, candidate resource |
| `crm.enrichment_jobs` | MTA + `target_resource_id`, `provider`, `requested_fields`, `status`, timestamps | Unique active `(target, provider, request hash)` | resource |
| `crm.enrichment_facts` | `job_id`, `target_resource_id`, `field_key`, `typed_value`, `source_url`, `confidence`, `observed_at`, `accepted_at`, `accepted_by` | PK; index target/field | job, resource, membership |
| `crm.companies` | MTA + `name`, `legal_name`, `domain`, `website`, `industry`, `size_band`, `revenue_band`, `country`, `linked_organization_id` | Unique reviewed domain within owner org | organization optional |
| `crm.contacts` | MTA + `person_id`, `company_id`, `title`, `relationship_state`, `consent_state`, `preferred_channel` | Unique reviewed `(owner_org, person, company)` | person, company |
| `crm.leads` | MTA + `company_id`, `contact_id`, `lead_source_id`, `lifecycle_state`, `fit_score`, `qualification_state`, `last_activity_at`, `converted_deal_id` | PK; no duplicate active source identity after review | company, contact, source, deal |
| `crm.lead_scores` | `lead_id`, `model_version`, `score`, `components`, `calculated_at` | Unique `(lead, model_version, calculated_at)` | lead |
| `crm.lead_lists` | MTA + `name`, `list_type`, `filter_definition`, `member_count` | Unique live `(owner_org, name, owner)` | owner membership |
| `crm.lead_list_members` | `lead_list_id`, `lead_id`, `added_at`, `added_by` | Composite PK/unique `(list, lead)` | list, lead, membership |
| `crm.qualifications` | `lead_id`, `deal_id`, `criteria_version`, `answers`, `score`, `disposition`, `reviewer_membership_id`, `reviewed_at` | PK | lead/deal, reviewer |
| `crm.suppression_entries` | `owner_organization_id`, `channel`, `normalized_destination_hash`, `reason`, `source`, `effective_at`, `expires_at` | Unique active `(owner_org, channel, destination hash)` | organization |
| `comms.sending_accounts` | MTA + `integration_connection_id`, `address`, `display_name`, limits, `health`, `sync_state` | Unique `(provider connection, address)` | integration, owner |
| `comms.message_templates` | MTA + `name`, `channel`, `current_version_id`, `status` | Unique live `(owner_org, name, owner)` | version |
| `comms.message_template_versions` | IV + `template_id`, `subject`, `body`, `variables`, `compliance_footer` | Unique `(template, version)` | template |
| `comms.outreach_campaigns` | MTA + `name`, `lead_list_id`, `sequence_id`, `sending_account_id`, `schedule`, `audience_snapshot_hash`, `status`, KPI counters | PK | list, sequence, sender |
| `comms.sequences` | MTA + `name`, `current_version`, `status` | Unique live name per owner | owner |
| `comms.sequence_steps` | `sequence_id`, `sequence_version`, `position`, `channel`, `template_version_id`, `delay_seconds`, `conditions`, `stop_rules` | Unique `(sequence, version, position)` | sequence, template version |
| `comms.campaign_recipients` | `campaign_id`, `lead_id`, `contact_id`, `state`, `current_step`, `next_action_at`, `outcome` | Unique `(campaign, lead/contact)` | campaign, lead/contact |
| `comms.message_deliveries` | `campaign_recipient_id`, `sequence_step_id`, `message_id`, provider keys, `event_type`, `occurred_at` | Provider event unique | recipient, step, message |
| `comms.conversations` | MTA + `channel`, `subject`, `lead_id`, `deal_id`, `client_account_id`, `status`, `last_message_at` | Provider thread key unique by connection | lead/deal/client |
| `comms.conversation_participants` | `conversation_id`, `person_id`, `address`, `participant_role` | Unique `(conversation, normalized address)` | conversation, person |
| `comms.messages` | IE + `conversation_id`, `direction`, `sender_person_id`, `body_text`, `body_asset_id`, `external_id`, `sent_at`, `received_at` | Unique provider message key | conversation, person, asset |
| `comms.meetings` | MTA + `title`, `meeting_type`, `starts_at`, `ends_at`, `timezone`, `status`, `location_url`, `deal_id`, `client_account_id` | Provider event key optional | deal/client/resource |
| `comms.meeting_participants` | `meeting_id`, `person_id`, `membership_id`, `role`, `attendance_state` | Unique `(meeting, person/membership)` | meeting, person/membership |
| `comms.meeting_notes` | `meeting_id`, `author_membership_id`, `body`, `decisions`, `visibility`, `created_at` | PK | meeting, author |

## 6. Client, commercial, and finance

| Entity | Required fields | Primary/unique keys | Foreign keys |
|---|---|---|---|
| `commercial.products` | MTA + `key`, `name`, `category`, `description`, `active` | Unique `(owner_org, key)` | organization |
| `commercial.packages` | MTA + `product_id`, `name`, `version`, `price_minor`, `currency`, `deliverables`, `timeline_days`, `revision_limit`, `payment_terms`, `renewal_type` | Unique `(product, name, version)` | product |
| `commercial.deal_pipelines` | MTA + `name`, `version`, `active` | Unique `(owner_org, name, version)` | organization |
| `commercial.deal_stages` | `pipeline_id`, `pipeline_version`, `key`, `name`, `position`, `canonical_class`, `probability`, `entry_rules`, `exit_rules` | Unique `(pipeline, version, key/position)` | pipeline |
| `commercial.deals` | MTA + `company_id`, `primary_contact_id`, `source_lead_id`, `pipeline_id`, `stage_id`, `amount_minor`, `currency`, `probability`, `expected_close_date`, `lost_reason`, `won_at` | PK | company/contact/lead/pipeline/stage |
| `commercial.deal_products` | `deal_id`, `package_id`, quantity, list/net/internal cost minor units, discount, tax | Unique `(deal, package, line_number)` | deal, package |
| `commercial.proposals` | MTA + `deal_id`, `client_account_id`, `proposal_number`, `current_version_id`, `status`, `expires_at`, `sent_at` | Unique `(owner_org, proposal_number)` | deal/client/version |
| `commercial.proposal_versions` | IV + `proposal_id`, item/term snapshot, subtotal/tax/total minor units, `currency`, `document_asset_version_id` | Unique `(proposal, version)` | proposal, asset version |
| `commercial.proposal_acceptances` | IE + `proposal_version_id`, `person_id`, `organization_id`, `decision`, `evidence`, `decided_at` | One terminal acceptance per exact version/org | version, person, organization |
| `commercial.client_accounts` | MTA + `organization_id`, `account_manager_membership_id`, `health`, `onboarding_state`, `billing_contact_id`, `portal_state`, `customer_since` | Unique active `organization_id` | organization, manager, contact |
| `commercial.client_relationships` | `client_account_id`, `person_id`, `contact_id`, `relationship_role`, primary/billing/approver/admin flags | Unique active `(client, person, role)` | client, person/contact |
| `commercial.contracts` | MTA + `client_account_id`, `deal_id`, `project_id`, `contract_number`, `current_version_id`, `status`, `effective_date`, `expiry_date` | Unique `(owner_org, contract_number)` | client/deal/project/version |
| `commercial.contract_versions` | IV + `contract_id`, `terms_snapshot`, `document_asset_version_id`, `provider_envelope_id` | Unique `(contract, version)` | contract, asset |
| `commercial.contract_signers` | `contract_version_id`, `person_id`, `organization_id`, `signing_order`, `role`, `required` | Unique `(version, person, role)` | version, person, org |
| `commercial.signature_events` | IE + `contract_signer_id`, `provider`, `external_event_id`, `event_type`, `evidence_asset_id` | Unique provider event | signer, asset |
| `commercial.invoices` | MTA + `client_account_id`, `contract_id`, `project_id`, `invoice_number`, `currency`, `issue_date`, `due_date`, `status`, derived totals/balance | Unique `(owner_org, invoice_number)` | client, contract, project |
| `commercial.invoice_lines` | `invoice_id`, `line_number`, `product_id`, `project_id`, `description`, quantity, unit/subtotal/tax/total minor units | Unique `(invoice, line_number)` | invoice, product, project |
| `commercial.credit_notes` | MTA + `client_account_id`, `invoice_id`, `credit_number`, `currency`, `reason`, `status`, `issued_at`, derived amount | Unique `(owner_org, credit_number)` | client/invoice |
| `commercial.credit_note_lines` | `credit_note_id`, `line_number`, `invoice_line_id`, `description`, amount/tax/total minor units | Unique `(credit_note, line_number)` | credit note/invoice line |
| `commercial.payments` | MTA + `client_account_id`, `provider`, `external_payment_id`, `amount_minor`, `currency`, `method_type`, `status`, `processed_at`, fee | Unique `(provider, external_payment_id)` | client |
| `commercial.payment_allocations` | `payment_id`, `invoice_id`, `allocation_type`, `amount_minor`, `allocated_at` | PK; unique idempotency key | payment, invoice |
| `commercial.refunds` | MTA + `payment_id`, `external_refund_id`, `amount_minor`, `currency`, `reason`, `status`, requester/approver | Unique provider refund ID | payment, memberships |
| `commercial.ledger_transactions` | `id`, `owner_org`, `idempotency_key`, `description`, `posted_at`, `source_resource_id` | PK; unique idempotency key | organization/resource |
| `commercial.ledger_entries` | `transaction_id`, `line_number`, `account_code`, `currency`, `debit_minor`, `credit_minor`, `client_account_id`, `project_id` | Unique `(transaction, line_number)`; balanced transaction check | transaction/client/project |
| `commercial.renewal_opportunities` | MTA + `client_account_id`, `source_project_id`, `recommended_package_id`, `amount_minor`, `currency`, `renewal_date`, `next_action_at`, `status` | PK | client/project/package |

## 7. Projects, workflows, tasks, and editorial

| Entity | Required fields | Primary/unique keys | Foreign keys |
|---|---|---|---|
| `delivery.projects` | MTA + `client_account_id`, `deal_id`, `contract_id`, `package_version_id`, `project_number`, `project_type`, `name`, `health`, `starts_on`, `target_due_on`, `completed_at` | Unique `(owner_org, project_number)` | client/deal/contract/package |
| `delivery.project_members` | `project_id`, `membership_id`, `person_id`, `project_role`, `visibility`, dates | Unique active `(project, membership/person, role)` | project, membership/person |
| `delivery.project_milestones` | MTA + `project_id`, `name`, `due_at`, `completed_at`, `position`, `visibility` | Unique live `(project, position)` | project |
| `delivery.workflow_templates` | `owner_org`, `key`, `name`, `product_type`, `version`, `status`, `configuration` | Unique `(owner_org, key, version)` | organization |
| `delivery.workflow_stage_templates` | `workflow_template_id`, `key`, `name`, `position`, `default_role_id`, `sla_minutes`, `client_visibility`, `entry/exit_rules` | Unique `(template, key/position)` | template, role |
| `delivery.workflow_transition_rules` | `workflow_template_id`, `from_stage_id`, `to_stage_id`, `permission_key`, `guard_expression`, generated actions | Unique `(template, from, to)` | template/stages |
| `delivery.workflow_instances` | MTA + `project_id`, `deliverable_id`, `workflow_template_id`, `active_stage_run_id`, `status`, timestamps | One active per configured project/deliverable | project/deliverable/template |
| `delivery.workflow_stage_runs` | `workflow_instance_id`, `stage_template_id`, `iteration`, `status`, `owner_membership_id`, entered/due/completed timestamps, outcome | Unique `(instance, stage, iteration)` | workflow/stage/owner |
| `delivery.stage_transitions` | IE + `workflow_instance_id`, `from_stage_run_id`, `to_stage_run_id`, `reason`, `automation_run_id` | PK | workflow/runs/automation |
| `delivery.tasks` | MTA + `project_id`, `workflow_stage_run_id`, `title`, `description`, `priority`, `due_at`, `completed_at`, `status` | PK | project/stage/assignee |
| `delivery.task_dependencies` | `task_id`, `depends_on_task_id`, `dependency_type` | Composite PK; no self/cycles | task self-FKs |
| `delivery.questionnaire_templates` | `owner_org`, `key`, `name`, `version`, `schema`, `status` | Unique `(owner_org, key, version)` | org |
| `delivery.questionnaire_instances` | MTA + `project_id`, `template_id`, `recipient_user_id`, `due_at`, `status`, `current_response_id` | PK | project/template/user |
| `delivery.questionnaire_responses` | `instance_id`, `respondent_user_id`, `draft_answers`, `row_version`, timestamps | Unique active per instance/respondent | instance/user |
| `delivery.questionnaire_submissions` | IV-like + `instance_id`, `submission_number`, `answers_snapshot`, `content_hash`, `submitted_by_user_id`, `submitted_at` | Unique `(instance, submission_number/hash)` | instance/user |
| `delivery.deliverables` | MTA + `project_id`, `deliverable_type`, `title`, `current_version_id`, `workflow_instance_id`, `status`, `due_at` | PK | project/version/workflow |
| `delivery.deliverable_versions` | IV + `deliverable_id`, `payload`, `manifest`, `source_asset_versions`, `change_summary` | Unique `(deliverable, version/hash)` | deliverable/assets |
| `content.research_items` | MTA + `editorial_work_id`, `source_type`, `title`, `url`, `publisher`, `published_at`, `notes`, `verification_state` | PK | work |
| `content.editorial_works` | MTA + `deliverable_id`, `content_type`, `working_title`, `pitch`, `access_tier`, `commissioned_at`, `editor_membership_id` | Unique `deliverable_id` | deliverable/editor |
| `content.drafts` | MTA + `editorial_work_id`, `current_version_id`, `collaboration_state` | Unique `editorial_work_id` | work/version |
| `content.draft_versions` | IV + `draft_id`, `structured_body`, `plain_text`, `word_count`, `source_manifest` | Unique `(draft, version/hash)` | draft |
| `content.revisions` | `draft_id`, `from_version_id`, `to_version_id`, `requested_by`, `request_comment_id`, `resolved_at` | PK | draft/versions/comment |
| `content.citations` | `draft_version_id`, `locator`, `claim_text`, `source_url`, `source_asset_id`, `verification_state` | PK; index version/locator | version/asset |
| `content.editorial_reviews` | MTA + `draft_version_id`, `reviewer_membership_id`, `checklist_snapshot`, `decision`, `summary`, `completed_at` | Unique reviewer/round/version | version/reviewer |
| `content.author_credits` | `editorial_work_id`, `person_id`, `credit_role`, `position` | Unique `(work, person, role)` and `(work, position)` | work/person |
| `content.taxonomy_terms` | `owner_org`, `parent_id`, `term_type`, `name`, `slug`, `status` | Unique live `(owner_org, term_type, slug)` | parent |
| `content.work_taxonomy` | `editorial_work_id`, `taxonomy_term_id`, `relationship_type` | Composite PK | work/term |

## 8. Studio-specific entities

### Magazine

| Entity | Required fields | Keys / FKs |
|---|---|---|
| `magazine.publications` | MTA + `key`, `name`, `publication_type`, `slug`, `status` | Unique owner/key and public slug |
| `magazine.issues` | MTA + `publication_id`, `project_id`, `issue_key`, volume/number/date, `title`, `page_count`, current proof/reader IDs | Unique `(publication, issue_key)`; FKs project/proof/reader |
| `magazine.issue_stories` | `issue_id`, `editorial_work_id`, `section`, `position`, page range | Unique issue/work and issue/position |
| `magazine.pages` | MTA + `issue_id`, `page_number`, `spread_key`, `section`, `current_layout_version_id`, `status` | Unique `(issue, page_number)` |
| `magazine.design_versions` | IV + `design_type`, `issue_id`, `page_id`, `cover_concept_id`, `asset_version_id`, `design_manifest` | Parent-specific unique version |
| `magazine.cover_concepts` | MTA + `issue_id`, `name`, `current_design_version_id`, `status` | Unique live `(issue, name)` |
| `magazine.proofs` | IV + `issue_id`, included version manifest, PDF asset version, unresolved count, `proof_type` | Unique `(issue, version/hash)` |
| `magazine.reader_builds` | IV + `issue_id`, page manifest, text-view manifest, navigation, build status | Unique `(issue, version/hash)` |
| `magazine.personal_profiles` | `issue_id`, `project_id`, `person_id`, approved identity/biography snapshot | Unique `(issue, person)` |

### Podcast and video

| Entity | Required fields | Keys / FKs |
|---|---|---|
| `media.podcast_shows` | MTA + title, slug, host person, description, cadence, status | Unique public slug |
| `media.podcast_episodes` | MTA + deliverable/project/show, episode number, title, guest, recording/publish dates, current audio/transcript | Unique `(show, episode_number)` |
| `media.podcast_guests` | episode, person/contact, guest role, invitation/release status | Unique `(episode, person, role)` |
| `media.recording_sessions` | MTA + episode/video resource, calendar/meeting, location, start/end, technical status | PK; external event unique optional |
| `media.audio_versions` | IV + episode, source asset manifest, master asset, duration, loudness, transcript version | Unique episode/version/hash |
| `media.transcripts` | MTA + target resource, language, current version | Unique `(target, language)` |
| `media.transcript_versions` | IV + transcript, timed segments, speaker map, confidence | Unique transcript/version/hash |
| `media.clips` | MTA + source media version, start/end timecodes, title, current asset version, publish state | PK |
| `media.video_projects` | MTA + deliverable/project, speaker person, format, current script/video/thumbnail, status | Unique deliverable |
| `media.shoots` | MTA + video project, meeting/calendar, location, crew/equipment snapshot, status | PK |
| `media.scripts` | MTA + video project, current version | Unique video project |
| `media.script_versions` | IV + script, structured body, duration estimate | Unique script/version/hash |
| `media.video_versions` | IV + video project, source manifest, master asset, duration, dimensions, caption version | Unique video/version/hash |
| `media.captions` | IV + target media version, language, cues, format, asset version | Unique `(media version, language, version)` |
| `media.thumbnail_versions` | IV + target resource, asset version, text treatment, crop manifest | Unique target/version/hash |
| `media.media_releases` | person, project/media resource, signed asset, usage scope, effective/expiry/revoked dates | PK; active uniqueness by person/scope |

### Events

| Entity | Required fields | Keys / FKs |
|---|---|---|
| `events.events` | MTA + project/client, title, slug, type, timezone, starts/ends, venue, capacity, registration/publication state | Unique owner/slug |
| `events.venues` | owner org, name, type, address/coordinates or virtual URL, timezone, accessibility | PK |
| `events.event_days` | event, local date, starts/ends | Unique `(event, date)` |
| `events.agenda_items` | MTA + event/day, title, type, starts/ends, venue/room, description, status, visibility | Unique event/day/position or time+room rule |
| `events.speakers` | MTA + event, person/contact, role, invite/confirmation/release state | Unique `(event, person, role)` |
| `events.partners` | MTA + event, organization/company, tier, package/deal, deliverables, status | Unique active `(event, org/company)` |
| `events.agenda_participants` | agenda item, speaker, role, position | Unique `(agenda, speaker, role)` |
| `events.registrations` | MTA + event, person/user, ticket type, payment/comp status, consent, registration status | Unique `(event, person/user)` |
| `events.tickets` | registration, ticket code hash, QR payload hash, issued/revoked/checked-in times | Unique ticket code hash; one active ticket/registration/type |
| `events.check_ins` | IE + ticket, scanner membership/device, location | One accepted check-in per policy |

## 9. Files, approvals, publishing, distribution, and reporting

| Entity | Required fields | Primary/unique keys | Foreign keys |
|---|---|---|---|
| `assets.folders` | MTA + `parent_folder_id`, `name`, `path_key` | Unique live `(context, parent, name)` | parent/project/client |
| `assets.assets` | MTA + `folder_id`, `asset_type`, `title`, `current_version_id`, `rights_state` | PK | folder/version |
| `assets.asset_versions` | IV + `asset_id`, `storage_key`, `sha256`, `mime_type`, `byte_size`, dimensions/duration, scan state | Unique `(asset, version)`; unique storage key/hash policy | asset |
| `assets.asset_renditions` | `source_version_id`, `rendition_type`, `storage_key`, format/dimensions, processor metadata | Unique `(source, rendition_type, config hash)` | asset version |
| `assets.asset_links` | `asset_id`, `resource_id`, `purpose`, `visibility`, `position` | Unique contextual link | asset/resource |
| `assets.asset_rights` | `asset_id/version_id`, licensor/person, license/consent type, territories/channels, effective/expiry, credit, restrictions, status | PK | asset/version/person |
| `assets.asset_usage` | `asset_version_id`, `resource_id`, `usage_type`, `destination`, `used_at` | PK | version/resource |
| `approvals.approval_policies` | owner org, key, version, resource/deliverable type, stage, required authority/order/count, rules | Unique `(owner, key, version)` |
| `approvals.approval_requests` | MTA + target resource/version/hash, policy, requester, due, status | PK; one active matching request unless policy allows | resource/policy |
| `approvals.approval_steps` | request, position/group, required role/permission/org, assignee, status | Unique `(request, position, authority)` |
| `approvals.approval_decisions` | IE + request/step, target hash, actor, represented org, decision, reason, decided at | Idempotent `(step, actor, target hash)` | request/step/actor/org |
| `approvals.approval_overrides` | IE + original decision/request, authorized actor, reason, replacement decision | PK | decisions/actors |
| `publishing.channels` | key, name, channel type, capability schema, active | Unique key | — |
| `publishing.publication_targets` | MTA + channel, integration connection, configuration, default access/SEO | Unique owner/channel/config key | channel/integration |
| `publishing.publications` | MTA + deliverable, current release version, canonical target, status, scheduled/published timestamps | Unique deliverable+target active | deliverable/target |
| `publishing.publication_versions` | IV + publication, payload/metadata/asset/taxonomy snapshot, canonical route, access tier | Unique publication/version/hash | publication |
| `publishing.publication_jobs` | publication version, target, idempotency key, status, attempts, result URL/error | Unique idempotency key | version/target |
| `publishing.published_urls` | publication/version, target/channel, URL, canonical flag, live/verified timestamps, status | Unique active URL; unique canonical per publication | version/target |
| `publishing.distribution_campaigns` | MTA + publication/project/client, name, schedule, status, current plan version | PK | publication/project/client |
| `publishing.distribution_items` | MTA + campaign, channel/target, copy/asset version, scheduled/published time, external ID, published URL, status | Provider external ID unique | campaign/target/assets |
| `reporting.metric_definitions` | key, name, unit, aggregation, dimensions schema, allowed sources | Unique key | — |
| `reporting.metric_sources` | owner org, definition, integration connection, verification rule, freshness SLA, status | Unique contextual source | definition/integration |
| `reporting.metric_observations` | resource, definition/source, period, dimensions, numeric/text value, verification state, observed/ingested time, provider event | Unique source observation identity | resource/definition/source |
| `reporting.analytics_snapshots` | resource/client/project, period, cutoff, metric manifest/hash, generated at | Unique `(resource, period, cutoff)` | resource/context |
| `reporting.reports` | MTA + client/project, report type, period, current version, delivery state | PK | client/project/version |
| `reporting.report_versions` | IV + report, analytics snapshot, narrative, live-link/deliverable manifest, asset version | Unique report/version/hash | report/snapshot/asset |
| `reporting.delivery_packs` | MTA + project/client, exact deliverable/report/asset/publication manifest, current version | PK | project/client |

## 10. Cascade and referential-action policy

| Relationship type | Database action |
|---|---|
| Parent-owned draft children before external use | `ON DELETE CASCADE` only during draft lifecycle |
| Organization/client/project to business records | `RESTRICT`; archive parent instead |
| User/person referenced by history | `RESTRICT` or anonymize presentation fields; preserve evidence |
| Version to approvals/publications/usages | `RESTRICT` permanently |
| Payment/invoice/ledger/contract/signature/audit | `RESTRICT`; no product deletion |
| Optional assignment/owner departure | `SET NULL` only when reassignment/history fields preserve accountability |
| Rebuildable cache/search projection | May cascade/rebuild; never canonical |

## 11. Database constraints that must not live only in code

- Organization types referenced as clients must be `CLIENT`.
- Client/project context must agree (`project.client_account_id` matches contextual `client_organization_id`).
- Client-shared records require a non-null client organization.
- Version numbers increase per parent and content hashes cannot be overwritten.
- Approval target hash equals the exact reviewed version hash.
- Invoice/ledger currencies and allocation amounts are consistent and non-negative by transaction type.
- Ledger debits equal credits per transaction/currency.
- Task dependency cannot reference itself; cycle prevention runs in transaction.
- Event end is after start; agenda room/time conflicts require an explicit override.
- Publication canonical routes and active URLs are unique per locale/site.
- Asset use is blocked when required rights are missing, expired, or revoked.
- Role/membership validity windows and active uniqueness do not overlap.
