-- Phase 4 R6: CRM & Commercial Engine persistence foundation.
-- Frozen contract: P4-R6-G0@730d2280fafe29c756ba7e0b09ff7e8e5c9496a6
--
-- Scope is deliberately limited to R6 CRM/comms/deal/client-account persistence.
-- Proposal/products/packages/contracts/invoices/payments/subscriptions/entitlements
-- are R7-owned and MUST NOT be created by this migration.

CREATE SCHEMA IF NOT EXISTS "crm";
CREATE SCHEMA IF NOT EXISTS "comms";
CREATE SCHEMA IF NOT EXISTS "commercial";

-- Redundant composite keys allow R6 foreign keys to prove same-tenant ownership
-- without weakening the accepted R4 runtime role or relying on browser input.
CREATE UNIQUE INDEX IF NOT EXISTS "departments_id_organization_id_key"
  ON "iam"."departments" ("id", "organization_id");
CREATE UNIQUE INDEX IF NOT EXISTS "organization_memberships_id_organization_id_key"
  ON "iam"."organization_memberships" ("id", "organization_id");
CREATE UNIQUE INDEX IF NOT EXISTS "resources_id_owner_organization_id_key"
  ON "platform"."resources" ("id", "owner_organization_id");

-- ---------------------------------------------------------------------------
-- CRM
-- ---------------------------------------------------------------------------

CREATE TABLE "crm"."lead_sources" (
  "id" UUID NOT NULL,
  "resource_id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "client_organization_id" UUID,
  "department_id" UUID,
  "owner_membership_id" UUID,
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "sensitivity" TEXT NOT NULL DEFAULT 'CONFIDENTIAL',
  "source_type" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "base_url" TEXT,
  "compliance_notes" TEXT,
  "configuration" JSONB NOT NULL DEFAULT '{}',
  "health" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "lead_sources_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm"."extraction_jobs" (
  "id" UUID NOT NULL,
  "resource_id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "client_organization_id" UUID,
  "department_id" UUID,
  "owner_membership_id" UUID,
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "sensitivity" TEXT NOT NULL DEFAULT 'CONFIDENTIAL',
  "lead_source_id" UUID NOT NULL,
  "query_snapshot" JSONB NOT NULL,
  "request_hash" TEXT,
  "status" TEXT NOT NULL DEFAULT 'QUEUED',
  "attempt" INTEGER NOT NULL DEFAULT 1,
  "root_job_id" UUID,
  "parent_job_id" UUID,
  "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "started_at" TIMESTAMPTZ(6),
  "finished_at" TIMESTAMPTZ(6),
  "requested_count" INTEGER NOT NULL DEFAULT 0,
  "processed_count" INTEGER NOT NULL DEFAULT 0,
  "accepted_count" INTEGER NOT NULL DEFAULT 0,
  "rejected_count" INTEGER NOT NULL DEFAULT 0,
  "error_summary" TEXT,
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "extraction_jobs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm"."staged_records" (
  "id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "extraction_job_id" UUID NOT NULL,
  "source_record_key" TEXT NOT NULL,
  "raw_payload" JSONB NOT NULL,
  "normalized_payload" JSONB NOT NULL,
  "provenance_url" TEXT,
  "confidence" DECIMAL(12,6),
  "validation_state" TEXT NOT NULL DEFAULT 'PENDING',
  "dedupe_resource_id" UUID,
  "reviewed_by_membership_id" UUID,
  "reviewed_at" TIMESTAMPTZ(6),
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "staged_records_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm"."enrichment_jobs" (
  "id" UUID NOT NULL,
  "resource_id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "client_organization_id" UUID,
  "department_id" UUID,
  "owner_membership_id" UUID,
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "sensitivity" TEXT NOT NULL DEFAULT 'CONFIDENTIAL',
  "target_resource_id" UUID NOT NULL,
  "provider" TEXT NOT NULL,
  "requested_fields" JSONB NOT NULL DEFAULT '[]',
  "request_hash" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'QUEUED',
  "attempt" INTEGER NOT NULL DEFAULT 1,
  "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "started_at" TIMESTAMPTZ(6),
  "finished_at" TIMESTAMPTZ(6),
  "error_summary" TEXT,
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "enrichment_jobs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm"."enrichment_facts" (
  "id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "job_id" UUID NOT NULL,
  "target_resource_id" UUID NOT NULL,
  "field_key" TEXT NOT NULL,
  "typed_value" JSONB NOT NULL,
  "source_url" TEXT,
  "confidence" DECIMAL(12,6),
  "observed_at" TIMESTAMPTZ(6) NOT NULL,
  "accepted_at" TIMESTAMPTZ(6),
  "accepted_by_membership_id" UUID,
  "rejected_at" TIMESTAMPTZ(6),
  "rejected_by_membership_id" UUID,
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "enrichment_facts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm"."companies" (
  "id" UUID NOT NULL,
  "resource_id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "client_organization_id" UUID,
  "department_id" UUID,
  "owner_membership_id" UUID,
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "sensitivity" TEXT NOT NULL DEFAULT 'STANDARD',
  "name" TEXT NOT NULL,
  "legal_name" TEXT,
  "domain" CITEXT,
  "website" TEXT,
  "industry" TEXT,
  "size_band" TEXT,
  "revenue_band" TEXT,
  "country" TEXT,
  "linked_organization_id" UUID,
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm"."contacts" (
  "id" UUID NOT NULL,
  "resource_id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "client_organization_id" UUID,
  "department_id" UUID,
  "owner_membership_id" UUID,
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "sensitivity" TEXT NOT NULL DEFAULT 'PII',
  "person_id" UUID,
  "company_id" UUID,
  "title" TEXT,
  "relationship_state" TEXT,
  "consent_state" TEXT,
  "preferred_channel" TEXT,
  "email_original" TEXT,
  "email_normalized" CITEXT,
  "phone_normalized" TEXT,
  "contactability_state" TEXT,
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm"."leads" (
  "id" UUID NOT NULL,
  "resource_id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "client_organization_id" UUID,
  "department_id" UUID,
  "owner_membership_id" UUID,
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "sensitivity" TEXT NOT NULL DEFAULT 'CONFIDENTIAL',
  "company_id" UUID,
  "contact_id" UUID,
  "lead_source_id" UUID,
  "source_record_key" TEXT,
  "lifecycle_state" TEXT NOT NULL DEFAULT 'NEW',
  "fit_score" DECIMAL(12,6),
  "qualification_state" TEXT,
  "legal_basis" TEXT,
  "consent_state" TEXT,
  "last_activity_at" TIMESTAMPTZ(6),
  "converted_deal_id" UUID,
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm"."lead_scores" (
  "id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "lead_id" UUID NOT NULL,
  "model_version" TEXT NOT NULL,
  "score" DECIMAL(12,6) NOT NULL,
  "components" JSONB NOT NULL DEFAULT '{}',
  "calculated_at" TIMESTAMPTZ(6) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lead_scores_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm"."lead_status_history" (
  "id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "lead_id" UUID NOT NULL,
  "from_state" TEXT,
  "to_state" TEXT NOT NULL,
  "actor_membership_id" UUID,
  "reason" TEXT,
  "request_id" TEXT,
  "occurred_at" TIMESTAMPTZ(6) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lead_status_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm"."lead_lists" (
  "id" UUID NOT NULL,
  "resource_id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "client_organization_id" UUID,
  "department_id" UUID,
  "owner_membership_id" UUID,
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "sensitivity" TEXT NOT NULL DEFAULT 'CONFIDENTIAL',
  "name" TEXT NOT NULL,
  "list_type" TEXT NOT NULL DEFAULT 'STATIC',
  "filter_definition" JSONB NOT NULL DEFAULT '{}',
  "member_count" INTEGER NOT NULL DEFAULT 0,
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "lead_lists_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm"."lead_list_members" (
  "owner_organization_id" UUID NOT NULL,
  "lead_list_id" UUID NOT NULL,
  "lead_id" UUID NOT NULL,
  "added_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "added_by_membership_id" UUID,
  "removed_at" TIMESTAMPTZ(6),
  "removed_by_membership_id" UUID,
  CONSTRAINT "lead_list_members_pkey" PRIMARY KEY ("lead_list_id", "lead_id")
);

CREATE TABLE "crm"."qualifications" (
  "id" UUID NOT NULL,
  "resource_id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "client_organization_id" UUID,
  "department_id" UUID,
  "owner_membership_id" UUID,
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "sensitivity" TEXT NOT NULL DEFAULT 'CONFIDENTIAL',
  "lead_id" UUID,
  "deal_id" UUID,
  "criteria_version" TEXT NOT NULL,
  "answers" JSONB NOT NULL DEFAULT '{}',
  "score" DECIMAL(12,6),
  "disposition" TEXT NOT NULL,
  "reviewer_membership_id" UUID,
  "reviewed_at" TIMESTAMPTZ(6),
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "qualifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm"."duplicate_candidates" (
  "id" UUID NOT NULL,
  "resource_id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "client_organization_id" UUID,
  "department_id" UUID,
  "owner_membership_id" UUID,
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "sensitivity" TEXT NOT NULL DEFAULT 'CONFIDENTIAL',
  "entity_type" TEXT NOT NULL,
  "left_resource_id" UUID NOT NULL,
  "right_resource_id" UUID NOT NULL,
  "confidence" DECIMAL(12,6),
  "reasons" JSONB NOT NULL DEFAULT '[]',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "resolved_by_membership_id" UUID,
  "resolved_at" TIMESTAMPTZ(6),
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "duplicate_candidates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "crm"."suppression_entries" (
  "id" UUID NOT NULL,
  "resource_id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "client_organization_id" UUID,
  "department_id" UUID,
  "owner_membership_id" UUID,
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "sensitivity" TEXT NOT NULL DEFAULT 'PII',
  "channel" TEXT NOT NULL,
  "normalized_destination_hash" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "effective_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMPTZ(6),
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "suppression_entries_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Communications
-- ---------------------------------------------------------------------------

CREATE TABLE "comms"."sending_accounts" (
  "id" UUID NOT NULL,
  "resource_id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "client_organization_id" UUID,
  "department_id" UUID,
  "owner_membership_id" UUID,
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "sensitivity" TEXT NOT NULL DEFAULT 'SECURITY',
  "integration_connection_id" UUID,
  "provider" TEXT NOT NULL,
  "address" CITEXT NOT NULL,
  "display_name" TEXT,
  "daily_limit" INTEGER,
  "hourly_limit" INTEGER,
  "health" TEXT NOT NULL DEFAULT 'UNKNOWN',
  "sync_state" TEXT NOT NULL DEFAULT 'DISCONNECTED',
  "last_sync_at" TIMESTAMPTZ(6),
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "sending_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comms"."message_templates" (
  "id" UUID NOT NULL,
  "resource_id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "client_organization_id" UUID,
  "department_id" UUID,
  "owner_membership_id" UUID,
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "sensitivity" TEXT NOT NULL DEFAULT 'STANDARD',
  "name" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "current_version_id" UUID,
  "status" TEXT NOT NULL DEFAULT 'APPROVED',
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comms"."message_template_versions" (
  "id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "template_id" UUID NOT NULL,
  "version" INTEGER NOT NULL,
  "subject" TEXT,
  "body" TEXT NOT NULL,
  "variables" JSONB NOT NULL DEFAULT '[]',
  "compliance_footer" TEXT,
  "content_hash" TEXT NOT NULL,
  "approved_at" TIMESTAMPTZ(6) NOT NULL,
  "approved_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "message_template_versions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comms"."outreach_campaigns" (
  "id" UUID NOT NULL,
  "resource_id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "client_organization_id" UUID,
  "department_id" UUID,
  "owner_membership_id" UUID,
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "sensitivity" TEXT NOT NULL DEFAULT 'CONFIDENTIAL',
  "name" TEXT NOT NULL,
  "lead_list_id" UUID NOT NULL,
  "sequence_id" UUID NOT NULL,
  "sending_account_id" UUID NOT NULL,
  "schedule" JSONB NOT NULL DEFAULT '{}',
  "audience_snapshot_hash" TEXT,
  "approved_snapshot_hash" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "recipient_count" INTEGER NOT NULL DEFAULT 0,
  "sent_count" INTEGER NOT NULL DEFAULT 0,
  "reply_count" INTEGER NOT NULL DEFAULT 0,
  "positive_reply_count" INTEGER NOT NULL DEFAULT 0,
  "approved_at" TIMESTAMPTZ(6),
  "approved_by_membership_id" UUID,
  "scheduled_at" TIMESTAMPTZ(6),
  "launched_at" TIMESTAMPTZ(6),
  "paused_at" TIMESTAMPTZ(6),
  "completed_at" TIMESTAMPTZ(6),
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "outreach_campaigns_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comms"."sequences" (
  "id" UUID NOT NULL,
  "resource_id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "client_organization_id" UUID,
  "department_id" UUID,
  "owner_membership_id" UUID,
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "sensitivity" TEXT NOT NULL DEFAULT 'STANDARD',
  "name" TEXT NOT NULL,
  "current_version" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "sequences_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comms"."sequence_steps" (
  "id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "sequence_id" UUID NOT NULL,
  "sequence_version" INTEGER NOT NULL,
  "position" INTEGER NOT NULL,
  "channel" TEXT NOT NULL,
  "template_version_id" UUID NOT NULL,
  "delay_seconds" INTEGER NOT NULL DEFAULT 0,
  "conditions" JSONB NOT NULL DEFAULT '{}',
  "stop_rules" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "sequence_steps_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comms"."campaign_recipients" (
  "id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "campaign_id" UUID NOT NULL,
  "lead_id" UUID,
  "contact_id" UUID,
  "state" TEXT NOT NULL DEFAULT 'QUEUED',
  "current_step" INTEGER NOT NULL DEFAULT 0,
  "next_action_at" TIMESTAMPTZ(6),
  "outcome" TEXT,
  "stopped_at" TIMESTAMPTZ(6),
  "stop_reason" TEXT,
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "campaign_recipients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comms"."message_deliveries" (
  "id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "campaign_recipient_id" UUID,
  "sequence_step_id" UUID,
  "message_id" UUID,
  "provider" TEXT NOT NULL,
  "external_event_id" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "occurred_at" TIMESTAMPTZ(6) NOT NULL,
  "payload_hash" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "message_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comms"."conversations" (
  "id" UUID NOT NULL,
  "resource_id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "client_organization_id" UUID,
  "department_id" UUID,
  "owner_membership_id" UUID,
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "sensitivity" TEXT NOT NULL DEFAULT 'PII',
  "channel" TEXT NOT NULL,
  "subject" TEXT,
  "lead_id" UUID,
  "deal_id" UUID,
  "client_account_id" UUID,
  "sending_account_id" UUID,
  "provider" TEXT,
  "provider_thread_id" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "last_message_at" TIMESTAMPTZ(6),
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comms"."conversation_participants" (
  "id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "conversation_id" UUID NOT NULL,
  "person_id" UUID,
  "address" TEXT NOT NULL,
  "normalized_address" CITEXT NOT NULL,
  "participant_role" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "removed_at" TIMESTAMPTZ(6),
  CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comms"."messages" (
  "id" UUID NOT NULL,
  "resource_id" UUID,
  "owner_organization_id" UUID NOT NULL,
  "conversation_id" UUID NOT NULL,
  "direction" TEXT NOT NULL,
  "sender_person_id" UUID,
  "sender_membership_id" UUID,
  "body_text" TEXT,
  "body_asset_id" UUID,
  "provider" TEXT,
  "external_id" TEXT,
  "sent_at" TIMESTAMPTZ(6),
  "received_at" TIMESTAMPTZ(6),
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "is_internal_note" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comms"."meetings" (
  "id" UUID NOT NULL,
  "resource_id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "client_organization_id" UUID,
  "department_id" UUID,
  "owner_membership_id" UUID,
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "sensitivity" TEXT NOT NULL DEFAULT 'CONFIDENTIAL',
  "title" TEXT NOT NULL,
  "meeting_type" TEXT NOT NULL,
  "starts_at" TIMESTAMPTZ(6) NOT NULL,
  "ends_at" TIMESTAMPTZ(6) NOT NULL,
  "timezone" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PROPOSED',
  "location_url" TEXT,
  "provider" TEXT,
  "external_event_id" TEXT,
  "deal_id" UUID,
  "client_account_id" UUID,
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comms"."meeting_participants" (
  "id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "meeting_id" UUID NOT NULL,
  "person_id" UUID,
  "membership_id" UUID,
  "role" TEXT NOT NULL,
  "attendance_state" TEXT NOT NULL DEFAULT 'INVITED',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "removed_at" TIMESTAMPTZ(6),
  CONSTRAINT "meeting_participants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "comms"."meeting_notes" (
  "id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "meeting_id" UUID NOT NULL,
  "author_membership_id" UUID NOT NULL,
  "body" TEXT NOT NULL,
  "decisions" JSONB NOT NULL DEFAULT '[]',
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "meeting_notes_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Commercial R6 only
-- ---------------------------------------------------------------------------

CREATE TABLE "commercial"."deal_pipelines" (
  "id" UUID NOT NULL,
  "resource_id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "client_organization_id" UUID,
  "department_id" UUID,
  "owner_membership_id" UUID,
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "sensitivity" TEXT NOT NULL DEFAULT 'CONFIDENTIAL',
  "name" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "deal_pipelines_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "commercial"."deal_stages" (
  "id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "pipeline_id" UUID NOT NULL,
  "pipeline_version" INTEGER NOT NULL,
  "key" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "canonical_class" TEXT NOT NULL,
  "probability" DECIMAL(12,6),
  "entry_rules" JSONB NOT NULL DEFAULT '{}',
  "exit_rules" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "deal_stages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "commercial"."deals" (
  "id" UUID NOT NULL,
  "resource_id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "client_organization_id" UUID,
  "department_id" UUID,
  "owner_membership_id" UUID,
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "sensitivity" TEXT NOT NULL DEFAULT 'FINANCIAL',
  "company_id" UUID,
  "primary_contact_id" UUID,
  "source_lead_id" UUID,
  "pipeline_id" UUID NOT NULL,
  "stage_id" UUID NOT NULL,
  "amount_minor" BIGINT,
  "currency" CHAR(3),
  "probability" DECIMAL(12,6),
  "expected_close_date" DATE,
  "lost_reason" TEXT,
  "won_at" TIMESTAMPTZ(6),
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "commercial"."deal_stage_history" (
  "id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "deal_id" UUID NOT NULL,
  "from_stage_id" UUID,
  "to_stage_id" UUID NOT NULL,
  "actor_membership_id" UUID,
  "reason" TEXT,
  "deal_version" INTEGER NOT NULL,
  "occurred_at" TIMESTAMPTZ(6) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "deal_stage_history_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "commercial"."client_accounts" (
  "id" UUID NOT NULL,
  "resource_id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "client_organization_id" UUID NOT NULL,
  "department_id" UUID,
  "owner_membership_id" UUID,
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "sensitivity" TEXT NOT NULL DEFAULT 'CONFIDENTIAL',
  "account_manager_membership_id" UUID,
  "health" TEXT NOT NULL DEFAULT 'NEW',
  "onboarding_state" TEXT NOT NULL DEFAULT 'NOT_STARTED',
  "billing_contact_id" UUID,
  "portal_state" TEXT NOT NULL DEFAULT 'NOT_PROVISIONED',
  "customer_since" DATE,
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "client_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "commercial"."client_relationships" (
  "id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "client_account_id" UUID NOT NULL,
  "person_id" UUID,
  "contact_id" UUID,
  "relationship_role" TEXT NOT NULL,
  "is_primary" BOOLEAN NOT NULL DEFAULT false,
  "is_billing" BOOLEAN NOT NULL DEFAULT false,
  "is_approver" BOOLEAN NOT NULL DEFAULT false,
  "is_admin" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "client_relationships_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Prisma-declared unique/index structure.
-- ---------------------------------------------------------------------------

CREATE UNIQUE INDEX "lead_sources_resource_id_key" ON "crm"."lead_sources"("resource_id");
CREATE UNIQUE INDEX "lead_sources_id_owner_org_key" ON "crm"."lead_sources"("id","owner_organization_id");
CREATE INDEX "lead_sources_owner_organization_id_archived_at_idx" ON "crm"."lead_sources"("owner_organization_id","archived_at");
CREATE INDEX "lead_sources_owner_organization_id_health_idx" ON "crm"."lead_sources"("owner_organization_id","health");

CREATE UNIQUE INDEX "extraction_jobs_resource_id_key" ON "crm"."extraction_jobs"("resource_id");
CREATE UNIQUE INDEX "extraction_jobs_id_owner_org_key" ON "crm"."extraction_jobs"("id","owner_organization_id");
CREATE INDEX "extraction_jobs_owner_organization_id_status_requested_at_idx" ON "crm"."extraction_jobs"("owner_organization_id","status","requested_at");
CREATE INDEX "extraction_jobs_lead_source_id_status_idx" ON "crm"."extraction_jobs"("lead_source_id","status");

CREATE UNIQUE INDEX "staged_records_extraction_job_id_source_record_key_key" ON "crm"."staged_records"("extraction_job_id","source_record_key");
CREATE UNIQUE INDEX "staged_records_id_owner_org_key" ON "crm"."staged_records"("id","owner_organization_id");
CREATE INDEX "staged_records_owner_organization_id_validation_state_idx" ON "crm"."staged_records"("owner_organization_id","validation_state");

CREATE UNIQUE INDEX "enrichment_jobs_resource_id_key" ON "crm"."enrichment_jobs"("resource_id");
CREATE UNIQUE INDEX "enrichment_jobs_id_owner_org_key" ON "crm"."enrichment_jobs"("id","owner_organization_id");
CREATE INDEX "enrichment_jobs_owner_organization_id_target_resource_id_status_idx" ON "crm"."enrichment_jobs"("owner_organization_id","target_resource_id","status");
CREATE INDEX "enrichment_jobs_target_resource_id_provider_request_hash_idx" ON "crm"."enrichment_jobs"("target_resource_id","provider","request_hash");

CREATE UNIQUE INDEX "enrichment_facts_id_owner_org_key" ON "crm"."enrichment_facts"("id","owner_organization_id");
CREATE INDEX "enrichment_facts_owner_organization_id_target_resource_id_field_key_idx" ON "crm"."enrichment_facts"("owner_organization_id","target_resource_id","field_key");

CREATE UNIQUE INDEX "companies_resource_id_key" ON "crm"."companies"("resource_id");
CREATE UNIQUE INDEX "companies_id_owner_org_key" ON "crm"."companies"("id","owner_organization_id");
CREATE INDEX "companies_owner_organization_id_archived_at_idx" ON "crm"."companies"("owner_organization_id","archived_at");
CREATE INDEX "companies_owner_organization_id_domain_idx" ON "crm"."companies"("owner_organization_id","domain");

CREATE UNIQUE INDEX "contacts_resource_id_key" ON "crm"."contacts"("resource_id");
CREATE UNIQUE INDEX "contacts_id_owner_org_key" ON "crm"."contacts"("id","owner_organization_id");
CREATE INDEX "contacts_owner_organization_id_company_id_archived_at_idx" ON "crm"."contacts"("owner_organization_id","company_id","archived_at");
CREATE INDEX "contacts_owner_organization_id_email_normalized_idx" ON "crm"."contacts"("owner_organization_id","email_normalized");

CREATE UNIQUE INDEX "leads_resource_id_key" ON "crm"."leads"("resource_id");
CREATE UNIQUE INDEX "leads_converted_deal_id_key" ON "crm"."leads"("converted_deal_id");
CREATE UNIQUE INDEX "leads_id_owner_org_key" ON "crm"."leads"("id","owner_organization_id");
CREATE INDEX "leads_owner_organization_id_lifecycle_state_archived_at_idx" ON "crm"."leads"("owner_organization_id","lifecycle_state","archived_at");
CREATE INDEX "leads_owner_organization_id_company_id_idx" ON "crm"."leads"("owner_organization_id","company_id");
CREATE INDEX "leads_owner_organization_id_contact_id_idx" ON "crm"."leads"("owner_organization_id","contact_id");

CREATE UNIQUE INDEX "lead_scores_lead_id_model_version_calculated_at_key" ON "crm"."lead_scores"("lead_id","model_version","calculated_at");
CREATE UNIQUE INDEX "lead_scores_id_owner_org_key" ON "crm"."lead_scores"("id","owner_organization_id");
CREATE INDEX "lead_scores_owner_organization_id_lead_id_calculated_at_idx" ON "crm"."lead_scores"("owner_organization_id","lead_id","calculated_at" DESC);

CREATE UNIQUE INDEX "lead_status_history_id_owner_org_key" ON "crm"."lead_status_history"("id","owner_organization_id");
CREATE INDEX "lead_status_history_owner_organization_id_lead_id_occurred_at_idx" ON "crm"."lead_status_history"("owner_organization_id","lead_id","occurred_at" DESC);

CREATE UNIQUE INDEX "lead_lists_resource_id_key" ON "crm"."lead_lists"("resource_id");
CREATE UNIQUE INDEX "lead_lists_id_owner_org_key" ON "crm"."lead_lists"("id","owner_organization_id");
CREATE INDEX "lead_lists_owner_organization_id_owner_membership_id_archived_idx" ON "crm"."lead_lists"("owner_organization_id","owner_membership_id","archived_at");
CREATE INDEX "lead_list_members_owner_organization_id_lead_id_removed_at_idx" ON "crm"."lead_list_members"("owner_organization_id","lead_id","removed_at");

CREATE UNIQUE INDEX "qualifications_resource_id_key" ON "crm"."qualifications"("resource_id");
CREATE UNIQUE INDEX "qualifications_id_owner_org_key" ON "crm"."qualifications"("id","owner_organization_id");
CREATE INDEX "qualifications_owner_organization_id_lead_id_reviewed_at_idx" ON "crm"."qualifications"("owner_organization_id","lead_id","reviewed_at");
CREATE INDEX "qualifications_owner_organization_id_deal_id_reviewed_at_idx" ON "crm"."qualifications"("owner_organization_id","deal_id","reviewed_at");

CREATE UNIQUE INDEX "duplicate_candidates_resource_id_key" ON "crm"."duplicate_candidates"("resource_id");
CREATE UNIQUE INDEX "duplicate_candidates_id_owner_org_key" ON "crm"."duplicate_candidates"("id","owner_organization_id");
CREATE INDEX "duplicate_candidates_owner_organization_id_status_idx" ON "crm"."duplicate_candidates"("owner_organization_id","status");

CREATE UNIQUE INDEX "suppression_entries_resource_id_key" ON "crm"."suppression_entries"("resource_id");
CREATE UNIQUE INDEX "suppression_entries_id_owner_org_key" ON "crm"."suppression_entries"("id","owner_organization_id");
CREATE INDEX "suppression_entries_owner_organization_id_channel_normalized_dest_idx" ON "crm"."suppression_entries"("owner_organization_id","channel","normalized_destination_hash");

CREATE UNIQUE INDEX "sending_accounts_resource_id_key" ON "comms"."sending_accounts"("resource_id");
CREATE UNIQUE INDEX "sending_accounts_id_owner_org_key" ON "comms"."sending_accounts"("id","owner_organization_id");
CREATE UNIQUE INDEX "sending_accounts_owner_organization_id_provider_address_key" ON "comms"."sending_accounts"("owner_organization_id","provider","address");
CREATE INDEX "sending_accounts_owner_organization_id_health_archived_at_idx" ON "comms"."sending_accounts"("owner_organization_id","health","archived_at");

CREATE UNIQUE INDEX "message_templates_resource_id_key" ON "comms"."message_templates"("resource_id");
CREATE UNIQUE INDEX "message_templates_id_owner_org_key" ON "comms"."message_templates"("id","owner_organization_id");
CREATE INDEX "message_templates_owner_organization_id_owner_membership_archived_idx" ON "comms"."message_templates"("owner_organization_id","owner_membership_id","archived_at");

CREATE UNIQUE INDEX "message_template_versions_template_id_version_key" ON "comms"."message_template_versions"("template_id","version");
CREATE UNIQUE INDEX "message_template_versions_id_owner_org_key" ON "comms"."message_template_versions"("id","owner_organization_id");
CREATE INDEX "message_template_versions_owner_org_template_approved_at_idx" ON "comms"."message_template_versions"("owner_organization_id","template_id","approved_at");

CREATE UNIQUE INDEX "outreach_campaigns_resource_id_key" ON "comms"."outreach_campaigns"("resource_id");
CREATE UNIQUE INDEX "outreach_campaigns_id_owner_org_key" ON "comms"."outreach_campaigns"("id","owner_organization_id");
CREATE INDEX "outreach_campaigns_owner_organization_id_status_archived_at_idx" ON "comms"."outreach_campaigns"("owner_organization_id","status","archived_at");

CREATE UNIQUE INDEX "sequences_resource_id_key" ON "comms"."sequences"("resource_id");
CREATE UNIQUE INDEX "sequences_id_owner_org_key" ON "comms"."sequences"("id","owner_organization_id");
CREATE INDEX "sequences_owner_organization_id_owner_membership_id_archived_idx" ON "comms"."sequences"("owner_organization_id","owner_membership_id","archived_at");

CREATE UNIQUE INDEX "sequence_steps_sequence_id_sequence_version_position_key" ON "comms"."sequence_steps"("sequence_id","sequence_version","position");
CREATE UNIQUE INDEX "sequence_steps_id_owner_org_key" ON "comms"."sequence_steps"("id","owner_organization_id");
CREATE INDEX "sequence_steps_owner_organization_id_sequence_id_version_idx" ON "comms"."sequence_steps"("owner_organization_id","sequence_id","sequence_version");

CREATE UNIQUE INDEX "campaign_recipients_id_owner_org_key" ON "comms"."campaign_recipients"("id","owner_organization_id");
CREATE UNIQUE INDEX "campaign_recipients_campaign_id_lead_id_key" ON "comms"."campaign_recipients"("campaign_id","lead_id");
CREATE UNIQUE INDEX "campaign_recipients_campaign_id_contact_id_key" ON "comms"."campaign_recipients"("campaign_id","contact_id");
CREATE INDEX "campaign_recipients_owner_org_campaign_state_next_action_idx" ON "comms"."campaign_recipients"("owner_organization_id","campaign_id","state","next_action_at");

CREATE UNIQUE INDEX "message_deliveries_provider_external_event_id_key" ON "comms"."message_deliveries"("provider","external_event_id");
CREATE UNIQUE INDEX "message_deliveries_id_owner_org_key" ON "comms"."message_deliveries"("id","owner_organization_id");
CREATE INDEX "message_deliveries_owner_organization_id_occurred_at_idx" ON "comms"."message_deliveries"("owner_organization_id","occurred_at" DESC);

CREATE UNIQUE INDEX "conversations_resource_id_key" ON "comms"."conversations"("resource_id");
CREATE UNIQUE INDEX "conversations_id_owner_org_key" ON "comms"."conversations"("id","owner_organization_id");
CREATE UNIQUE INDEX "conversations_owner_org_provider_thread_key" ON "comms"."conversations"("owner_organization_id","provider","provider_thread_id");
CREATE INDEX "conversations_owner_organization_id_status_last_message_at_idx" ON "comms"."conversations"("owner_organization_id","status","last_message_at" DESC);

CREATE UNIQUE INDEX "conversation_participants_conversation_normalized_address_key" ON "comms"."conversation_participants"("conversation_id","normalized_address");
CREATE UNIQUE INDEX "conversation_participants_id_owner_org_key" ON "comms"."conversation_participants"("id","owner_organization_id");
CREATE INDEX "conversation_participants_owner_org_conversation_removed_idx" ON "comms"."conversation_participants"("owner_organization_id","conversation_id","removed_at");

CREATE UNIQUE INDEX "messages_resource_id_key" ON "comms"."messages"("resource_id");
CREATE UNIQUE INDEX "messages_id_owner_org_key" ON "comms"."messages"("id","owner_organization_id");
CREATE UNIQUE INDEX "messages_owner_organization_id_provider_external_id_key" ON "comms"."messages"("owner_organization_id","provider","external_id");
CREATE INDEX "messages_owner_organization_id_conversation_id_created_at_idx" ON "comms"."messages"("owner_organization_id","conversation_id","created_at");

CREATE UNIQUE INDEX "meetings_resource_id_key" ON "comms"."meetings"("resource_id");
CREATE UNIQUE INDEX "meetings_id_owner_org_key" ON "comms"."meetings"("id","owner_organization_id");
CREATE UNIQUE INDEX "meetings_owner_organization_id_provider_external_event_id_key" ON "comms"."meetings"("owner_organization_id","provider","external_event_id");
CREATE INDEX "meetings_owner_organization_id_starts_at_status_idx" ON "comms"."meetings"("owner_organization_id","starts_at","status");

CREATE UNIQUE INDEX "meeting_participants_id_owner_org_key" ON "comms"."meeting_participants"("id","owner_organization_id");
CREATE INDEX "meeting_participants_owner_organization_id_meeting_removed_idx" ON "comms"."meeting_participants"("owner_organization_id","meeting_id","removed_at");

CREATE UNIQUE INDEX "meeting_notes_id_owner_org_key" ON "comms"."meeting_notes"("id","owner_organization_id");
CREATE INDEX "meeting_notes_owner_organization_id_meeting_id_created_at_idx" ON "comms"."meeting_notes"("owner_organization_id","meeting_id","created_at");

CREATE UNIQUE INDEX "deal_pipelines_resource_id_key" ON "commercial"."deal_pipelines"("resource_id");
CREATE UNIQUE INDEX "deal_pipelines_owner_organization_id_name_version_key" ON "commercial"."deal_pipelines"("owner_organization_id","name","version");
CREATE UNIQUE INDEX "deal_pipelines_id_owner_org_key" ON "commercial"."deal_pipelines"("id","owner_organization_id");
CREATE INDEX "deal_pipelines_owner_organization_id_active_archived_at_idx" ON "commercial"."deal_pipelines"("owner_organization_id","active","archived_at");

CREATE UNIQUE INDEX "deal_stages_pipeline_id_pipeline_version_key_key" ON "commercial"."deal_stages"("pipeline_id","pipeline_version","key");
CREATE UNIQUE INDEX "deal_stages_pipeline_id_pipeline_version_position_key" ON "commercial"."deal_stages"("pipeline_id","pipeline_version","position");
CREATE UNIQUE INDEX "deal_stages_id_pipeline_key" ON "commercial"."deal_stages"("id","pipeline_id");
CREATE UNIQUE INDEX "deal_stages_id_owner_org_key" ON "commercial"."deal_stages"("id","owner_organization_id");
CREATE INDEX "deal_stages_owner_organization_id_pipeline_id_position_idx" ON "commercial"."deal_stages"("owner_organization_id","pipeline_id","position");

CREATE UNIQUE INDEX "deals_resource_id_key" ON "commercial"."deals"("resource_id");
CREATE UNIQUE INDEX "deals_source_lead_id_key" ON "commercial"."deals"("source_lead_id");
CREATE UNIQUE INDEX "deals_id_owner_org_key" ON "commercial"."deals"("id","owner_organization_id");
CREATE INDEX "deals_owner_organization_id_pipeline_id_stage_id_archived_at_idx" ON "commercial"."deals"("owner_organization_id","pipeline_id","stage_id","archived_at");
CREATE INDEX "deals_owner_organization_id_expected_close_date_idx" ON "commercial"."deals"("owner_organization_id","expected_close_date");

CREATE UNIQUE INDEX "deal_stage_history_id_owner_org_key" ON "commercial"."deal_stage_history"("id","owner_organization_id");
CREATE INDEX "deal_stage_history_owner_organization_id_deal_id_occurred_at_idx" ON "commercial"."deal_stage_history"("owner_organization_id","deal_id","occurred_at" DESC);

CREATE UNIQUE INDEX "client_accounts_resource_id_key" ON "commercial"."client_accounts"("resource_id");
CREATE UNIQUE INDEX "client_accounts_id_owner_org_key" ON "commercial"."client_accounts"("id","owner_organization_id");
CREATE INDEX "client_accounts_owner_org_client_org_archived_at_idx" ON "commercial"."client_accounts"("owner_organization_id","client_organization_id","archived_at");

CREATE UNIQUE INDEX "client_relationships_id_owner_org_key" ON "commercial"."client_relationships"("id","owner_organization_id");
CREATE INDEX "client_relationships_owner_org_client_account_archived_idx" ON "commercial"."client_relationships"("owner_organization_id","client_account_id","archived_at");

-- Live uniqueness rules that Prisma cannot represent as partial indexes.
CREATE UNIQUE INDEX "lead_sources_live_owner_name_key"
  ON "crm"."lead_sources"("owner_organization_id","name") WHERE "archived_at" IS NULL;
CREATE UNIQUE INDEX "companies_live_owner_domain_key"
  ON "crm"."companies"("owner_organization_id","domain")
  WHERE "domain" IS NOT NULL AND "archived_at" IS NULL;
CREATE UNIQUE INDEX "lead_lists_live_owner_membership_name_key"
  ON "crm"."lead_lists"("owner_organization_id","owner_membership_id","name")
  WHERE "archived_at" IS NULL;
CREATE UNIQUE INDEX "suppression_entries_live_destination_key"
  ON "crm"."suppression_entries"("owner_organization_id","channel","normalized_destination_hash")
  WHERE "archived_at" IS NULL;
CREATE UNIQUE INDEX "message_templates_live_owner_name_key"
  ON "comms"."message_templates"("owner_organization_id","owner_membership_id","name")
  WHERE "archived_at" IS NULL;
CREATE UNIQUE INDEX "sequences_live_owner_name_key"
  ON "comms"."sequences"("owner_organization_id","owner_membership_id","name")
  WHERE "archived_at" IS NULL;
CREATE UNIQUE INDEX "client_accounts_live_client_org_key"
  ON "commercial"."client_accounts"("client_organization_id")
  WHERE "archived_at" IS NULL;
CREATE UNIQUE INDEX "client_relationships_live_person_role_key"
  ON "commercial"."client_relationships"("client_account_id","person_id","relationship_role")
  WHERE "person_id" IS NOT NULL AND "archived_at" IS NULL;

-- ---------------------------------------------------------------------------
-- Foreign keys and same-tenant proofs.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT *
    FROM (VALUES
      ('crm','lead_sources'),('crm','extraction_jobs'),('crm','staged_records'),
      ('crm','enrichment_jobs'),('crm','enrichment_facts'),('crm','companies'),
      ('crm','contacts'),('crm','leads'),('crm','lead_scores'),
      ('crm','lead_status_history'),('crm','lead_lists'),('crm','lead_list_members'),
      ('crm','qualifications'),('crm','duplicate_candidates'),('crm','suppression_entries'),
      ('comms','sending_accounts'),('comms','message_templates'),
      ('comms','message_template_versions'),('comms','outreach_campaigns'),
      ('comms','sequences'),('comms','sequence_steps'),('comms','campaign_recipients'),
      ('comms','message_deliveries'),('comms','conversations'),
      ('comms','conversation_participants'),('comms','messages'),('comms','meetings'),
      ('comms','meeting_participants'),('comms','meeting_notes'),
      ('commercial','deal_pipelines'),('commercial','deal_stages'),('commercial','deals'),
      ('commercial','deal_stage_history'),('commercial','client_accounts'),
      ('commercial','client_relationships')
    ) AS x(schema_name, table_name)
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (owner_organization_id) REFERENCES iam.organizations(id) ON DELETE RESTRICT ON UPDATE CASCADE',
      item.schema_name, item.table_name, item.table_name || '_owner_organization_id_fkey'
    );
  END LOOP;
END
$$;

DO $$
DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT *
    FROM (VALUES
      ('crm','lead_sources'),('crm','extraction_jobs'),('crm','enrichment_jobs'),
      ('crm','companies'),('crm','contacts'),('crm','leads'),('crm','lead_lists'),
      ('crm','qualifications'),('crm','duplicate_candidates'),('crm','suppression_entries'),
      ('comms','sending_accounts'),('comms','message_templates'),('comms','outreach_campaigns'),
      ('comms','sequences'),('comms','conversations'),('comms','meetings'),
      ('commercial','deal_pipelines'),('commercial','deals'),('commercial','client_accounts')
    ) AS x(schema_name, table_name)
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (resource_id, owner_organization_id) REFERENCES platform.resources(id, owner_organization_id) ON DELETE RESTRICT ON UPDATE CASCADE',
      item.schema_name, item.table_name, item.table_name || '_resource_owner_fkey'
    );
  END LOOP;
END
$$;

ALTER TABLE "comms"."messages"
  ADD CONSTRAINT "messages_resource_owner_fkey"
  FOREIGN KEY ("resource_id","owner_organization_id")
  REFERENCES "platform"."resources"("id","owner_organization_id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

DO $$
DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT *
    FROM (VALUES
      ('crm','lead_sources'),('crm','extraction_jobs'),('crm','enrichment_jobs'),
      ('crm','companies'),('crm','contacts'),('crm','leads'),('crm','lead_lists'),
      ('crm','qualifications'),('crm','duplicate_candidates'),('crm','suppression_entries'),
      ('comms','sending_accounts'),('comms','message_templates'),('comms','outreach_campaigns'),
      ('comms','sequences'),('comms','conversations'),('comms','meetings'),
      ('commercial','deal_pipelines'),('commercial','deals')
    ) AS x(schema_name, table_name)
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (client_organization_id) REFERENCES iam.organizations(id) ON DELETE RESTRICT ON UPDATE CASCADE',
      item.schema_name, item.table_name, item.table_name || '_client_organization_id_fkey'
    );
    EXECUTE format(
      'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (department_id, owner_organization_id) REFERENCES iam.departments(id, organization_id) ON DELETE RESTRICT ON UPDATE CASCADE',
      item.schema_name, item.table_name, item.table_name || '_department_owner_fkey'
    );
    EXECUTE format(
      'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (owner_membership_id, owner_organization_id) REFERENCES iam.organization_memberships(id, organization_id) ON DELETE RESTRICT ON UPDATE CASCADE',
      item.schema_name, item.table_name, item.table_name || '_owner_membership_owner_fkey'
    );
    EXECUTE format(
      'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (created_by_membership_id, owner_organization_id) REFERENCES iam.organization_memberships(id, organization_id) ON DELETE RESTRICT ON UPDATE CASCADE',
      item.schema_name, item.table_name, item.table_name || '_created_by_owner_fkey'
    );
    EXECUTE format(
      'ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (updated_by_membership_id, owner_organization_id) REFERENCES iam.organization_memberships(id, organization_id) ON DELETE RESTRICT ON UPDATE CASCADE',
      item.schema_name, item.table_name, item.table_name || '_updated_by_owner_fkey'
    );
  END LOOP;
END
$$;

ALTER TABLE "commercial"."client_accounts"
  ADD CONSTRAINT "client_accounts_client_organization_id_fkey"
  FOREIGN KEY ("client_organization_id") REFERENCES "iam"."organizations"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "commercial"."client_accounts"
  ADD CONSTRAINT "client_accounts_department_owner_fkey"
  FOREIGN KEY ("department_id","owner_organization_id")
  REFERENCES "iam"."departments"("id","organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "commercial"."client_accounts"
  ADD CONSTRAINT "client_accounts_owner_membership_owner_fkey"
  FOREIGN KEY ("owner_membership_id","owner_organization_id")
  REFERENCES "iam"."organization_memberships"("id","organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "commercial"."client_accounts"
  ADD CONSTRAINT "client_accounts_account_manager_owner_fkey"
  FOREIGN KEY ("account_manager_membership_id","owner_organization_id")
  REFERENCES "iam"."organization_memberships"("id","organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "commercial"."client_accounts"
  ADD CONSTRAINT "client_accounts_created_by_owner_fkey"
  FOREIGN KEY ("created_by_membership_id","owner_organization_id")
  REFERENCES "iam"."organization_memberships"("id","organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "commercial"."client_accounts"
  ADD CONSTRAINT "client_accounts_updated_by_owner_fkey"
  FOREIGN KEY ("updated_by_membership_id","owner_organization_id")
  REFERENCES "iam"."organization_memberships"("id","organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "crm"."extraction_jobs"
  ADD CONSTRAINT "extraction_jobs_lead_source_owner_fkey"
  FOREIGN KEY ("lead_source_id","owner_organization_id")
  REFERENCES "crm"."lead_sources"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "crm"."extraction_jobs"
  ADD CONSTRAINT "extraction_jobs_root_job_owner_fkey"
  FOREIGN KEY ("root_job_id","owner_organization_id")
  REFERENCES "crm"."extraction_jobs"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "crm"."extraction_jobs"
  ADD CONSTRAINT "extraction_jobs_parent_job_owner_fkey"
  FOREIGN KEY ("parent_job_id","owner_organization_id")
  REFERENCES "crm"."extraction_jobs"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "crm"."staged_records"
  ADD CONSTRAINT "staged_records_extraction_job_owner_fkey"
  FOREIGN KEY ("extraction_job_id","owner_organization_id")
  REFERENCES "crm"."extraction_jobs"("id","owner_organization_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crm"."staged_records"
  ADD CONSTRAINT "staged_records_dedupe_resource_owner_fkey"
  FOREIGN KEY ("dedupe_resource_id","owner_organization_id")
  REFERENCES "platform"."resources"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "crm"."staged_records"
  ADD CONSTRAINT "staged_records_reviewer_owner_fkey"
  FOREIGN KEY ("reviewed_by_membership_id","owner_organization_id")
  REFERENCES "iam"."organization_memberships"("id","organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "crm"."enrichment_jobs"
  ADD CONSTRAINT "enrichment_jobs_target_resource_owner_fkey"
  FOREIGN KEY ("target_resource_id","owner_organization_id")
  REFERENCES "platform"."resources"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "crm"."enrichment_facts"
  ADD CONSTRAINT "enrichment_facts_job_owner_fkey"
  FOREIGN KEY ("job_id","owner_organization_id")
  REFERENCES "crm"."enrichment_jobs"("id","owner_organization_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crm"."enrichment_facts"
  ADD CONSTRAINT "enrichment_facts_target_resource_owner_fkey"
  FOREIGN KEY ("target_resource_id","owner_organization_id")
  REFERENCES "platform"."resources"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "crm"."enrichment_facts"
  ADD CONSTRAINT "enrichment_facts_accepted_by_owner_fkey"
  FOREIGN KEY ("accepted_by_membership_id","owner_organization_id")
  REFERENCES "iam"."organization_memberships"("id","organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "crm"."enrichment_facts"
  ADD CONSTRAINT "enrichment_facts_rejected_by_owner_fkey"
  FOREIGN KEY ("rejected_by_membership_id","owner_organization_id")
  REFERENCES "iam"."organization_memberships"("id","organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "crm"."companies"
  ADD CONSTRAINT "companies_linked_organization_id_fkey"
  FOREIGN KEY ("linked_organization_id") REFERENCES "iam"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "crm"."contacts"
  ADD CONSTRAINT "contacts_person_id_fkey"
  FOREIGN KEY ("person_id") REFERENCES "iam"."people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "crm"."contacts"
  ADD CONSTRAINT "contacts_company_owner_fkey"
  FOREIGN KEY ("company_id","owner_organization_id")
  REFERENCES "crm"."companies"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "crm"."leads"
  ADD CONSTRAINT "leads_company_owner_fkey"
  FOREIGN KEY ("company_id","owner_organization_id")
  REFERENCES "crm"."companies"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "crm"."leads"
  ADD CONSTRAINT "leads_contact_owner_fkey"
  FOREIGN KEY ("contact_id","owner_organization_id")
  REFERENCES "crm"."contacts"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "crm"."leads"
  ADD CONSTRAINT "leads_source_owner_fkey"
  FOREIGN KEY ("lead_source_id","owner_organization_id")
  REFERENCES "crm"."lead_sources"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "crm"."lead_scores"
  ADD CONSTRAINT "lead_scores_lead_owner_fkey"
  FOREIGN KEY ("lead_id","owner_organization_id")
  REFERENCES "crm"."leads"("id","owner_organization_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crm"."lead_status_history"
  ADD CONSTRAINT "lead_status_history_lead_owner_fkey"
  FOREIGN KEY ("lead_id","owner_organization_id")
  REFERENCES "crm"."leads"("id","owner_organization_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crm"."lead_status_history"
  ADD CONSTRAINT "lead_status_history_actor_owner_fkey"
  FOREIGN KEY ("actor_membership_id","owner_organization_id")
  REFERENCES "iam"."organization_memberships"("id","organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "crm"."lead_list_members"
  ADD CONSTRAINT "lead_list_members_list_owner_fkey"
  FOREIGN KEY ("lead_list_id","owner_organization_id")
  REFERENCES "crm"."lead_lists"("id","owner_organization_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crm"."lead_list_members"
  ADD CONSTRAINT "lead_list_members_lead_owner_fkey"
  FOREIGN KEY ("lead_id","owner_organization_id")
  REFERENCES "crm"."leads"("id","owner_organization_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crm"."lead_list_members"
  ADD CONSTRAINT "lead_list_members_added_by_owner_fkey"
  FOREIGN KEY ("added_by_membership_id","owner_organization_id")
  REFERENCES "iam"."organization_memberships"("id","organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "crm"."lead_list_members"
  ADD CONSTRAINT "lead_list_members_removed_by_owner_fkey"
  FOREIGN KEY ("removed_by_membership_id","owner_organization_id")
  REFERENCES "iam"."organization_memberships"("id","organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "crm"."qualifications"
  ADD CONSTRAINT "qualifications_lead_owner_fkey"
  FOREIGN KEY ("lead_id","owner_organization_id")
  REFERENCES "crm"."leads"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "crm"."qualifications"
  ADD CONSTRAINT "qualifications_reviewer_owner_fkey"
  FOREIGN KEY ("reviewer_membership_id","owner_organization_id")
  REFERENCES "iam"."organization_memberships"("id","organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "crm"."duplicate_candidates"
  ADD CONSTRAINT "duplicate_candidates_left_resource_owner_fkey"
  FOREIGN KEY ("left_resource_id","owner_organization_id")
  REFERENCES "platform"."resources"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "crm"."duplicate_candidates"
  ADD CONSTRAINT "duplicate_candidates_right_resource_owner_fkey"
  FOREIGN KEY ("right_resource_id","owner_organization_id")
  REFERENCES "platform"."resources"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "crm"."duplicate_candidates"
  ADD CONSTRAINT "duplicate_candidates_resolved_by_owner_fkey"
  FOREIGN KEY ("resolved_by_membership_id","owner_organization_id")
  REFERENCES "iam"."organization_memberships"("id","organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "comms"."message_template_versions"
  ADD CONSTRAINT "message_template_versions_template_owner_fkey"
  FOREIGN KEY ("template_id","owner_organization_id")
  REFERENCES "comms"."message_templates"("id","owner_organization_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comms"."message_template_versions"
  ADD CONSTRAINT "message_template_versions_approved_by_owner_fkey"
  FOREIGN KEY ("approved_by_membership_id","owner_organization_id")
  REFERENCES "iam"."organization_memberships"("id","organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "comms"."message_templates"
  ADD CONSTRAINT "message_templates_current_version_owner_fkey"
  FOREIGN KEY ("current_version_id","owner_organization_id")
  REFERENCES "comms"."message_template_versions"("id","owner_organization_id")
  DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "comms"."outreach_campaigns"
  ADD CONSTRAINT "outreach_campaigns_lead_list_owner_fkey"
  FOREIGN KEY ("lead_list_id","owner_organization_id")
  REFERENCES "crm"."lead_lists"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "comms"."outreach_campaigns"
  ADD CONSTRAINT "outreach_campaigns_sequence_owner_fkey"
  FOREIGN KEY ("sequence_id","owner_organization_id")
  REFERENCES "comms"."sequences"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "comms"."outreach_campaigns"
  ADD CONSTRAINT "outreach_campaigns_sending_account_owner_fkey"
  FOREIGN KEY ("sending_account_id","owner_organization_id")
  REFERENCES "comms"."sending_accounts"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "comms"."outreach_campaigns"
  ADD CONSTRAINT "outreach_campaigns_approved_by_owner_fkey"
  FOREIGN KEY ("approved_by_membership_id","owner_organization_id")
  REFERENCES "iam"."organization_memberships"("id","organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "comms"."sequence_steps"
  ADD CONSTRAINT "sequence_steps_sequence_owner_fkey"
  FOREIGN KEY ("sequence_id","owner_organization_id")
  REFERENCES "comms"."sequences"("id","owner_organization_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comms"."sequence_steps"
  ADD CONSTRAINT "sequence_steps_template_version_owner_fkey"
  FOREIGN KEY ("template_version_id","owner_organization_id")
  REFERENCES "comms"."message_template_versions"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "comms"."campaign_recipients"
  ADD CONSTRAINT "campaign_recipients_campaign_owner_fkey"
  FOREIGN KEY ("campaign_id","owner_organization_id")
  REFERENCES "comms"."outreach_campaigns"("id","owner_organization_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comms"."campaign_recipients"
  ADD CONSTRAINT "campaign_recipients_lead_owner_fkey"
  FOREIGN KEY ("lead_id","owner_organization_id")
  REFERENCES "crm"."leads"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "comms"."campaign_recipients"
  ADD CONSTRAINT "campaign_recipients_contact_owner_fkey"
  FOREIGN KEY ("contact_id","owner_organization_id")
  REFERENCES "crm"."contacts"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "comms"."conversations"
  ADD CONSTRAINT "conversations_lead_owner_fkey"
  FOREIGN KEY ("lead_id","owner_organization_id")
  REFERENCES "crm"."leads"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "comms"."conversations"
  ADD CONSTRAINT "conversations_sending_account_owner_fkey"
  FOREIGN KEY ("sending_account_id","owner_organization_id")
  REFERENCES "comms"."sending_accounts"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "comms"."conversation_participants"
  ADD CONSTRAINT "conversation_participants_conversation_owner_fkey"
  FOREIGN KEY ("conversation_id","owner_organization_id")
  REFERENCES "comms"."conversations"("id","owner_organization_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comms"."conversation_participants"
  ADD CONSTRAINT "conversation_participants_person_id_fkey"
  FOREIGN KEY ("person_id") REFERENCES "iam"."people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "comms"."messages"
  ADD CONSTRAINT "messages_conversation_owner_fkey"
  FOREIGN KEY ("conversation_id","owner_organization_id")
  REFERENCES "comms"."conversations"("id","owner_organization_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comms"."messages"
  ADD CONSTRAINT "messages_sender_person_id_fkey"
  FOREIGN KEY ("sender_person_id") REFERENCES "iam"."people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "comms"."messages"
  ADD CONSTRAINT "messages_sender_membership_owner_fkey"
  FOREIGN KEY ("sender_membership_id","owner_organization_id")
  REFERENCES "iam"."organization_memberships"("id","organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "comms"."message_deliveries"
  ADD CONSTRAINT "message_deliveries_campaign_recipient_owner_fkey"
  FOREIGN KEY ("campaign_recipient_id","owner_organization_id")
  REFERENCES "comms"."campaign_recipients"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "comms"."message_deliveries"
  ADD CONSTRAINT "message_deliveries_sequence_step_owner_fkey"
  FOREIGN KEY ("sequence_step_id","owner_organization_id")
  REFERENCES "comms"."sequence_steps"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "comms"."message_deliveries"
  ADD CONSTRAINT "message_deliveries_message_owner_fkey"
  FOREIGN KEY ("message_id","owner_organization_id")
  REFERENCES "comms"."messages"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "comms"."meeting_participants"
  ADD CONSTRAINT "meeting_participants_meeting_owner_fkey"
  FOREIGN KEY ("meeting_id","owner_organization_id")
  REFERENCES "comms"."meetings"("id","owner_organization_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comms"."meeting_participants"
  ADD CONSTRAINT "meeting_participants_person_id_fkey"
  FOREIGN KEY ("person_id") REFERENCES "iam"."people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "comms"."meeting_participants"
  ADD CONSTRAINT "meeting_participants_membership_owner_fkey"
  FOREIGN KEY ("membership_id","owner_organization_id")
  REFERENCES "iam"."organization_memberships"("id","organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "comms"."meeting_notes"
  ADD CONSTRAINT "meeting_notes_meeting_owner_fkey"
  FOREIGN KEY ("meeting_id","owner_organization_id")
  REFERENCES "comms"."meetings"("id","owner_organization_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comms"."meeting_notes"
  ADD CONSTRAINT "meeting_notes_author_owner_fkey"
  FOREIGN KEY ("author_membership_id","owner_organization_id")
  REFERENCES "iam"."organization_memberships"("id","organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "commercial"."deal_stages"
  ADD CONSTRAINT "deal_stages_pipeline_owner_fkey"
  FOREIGN KEY ("pipeline_id","owner_organization_id")
  REFERENCES "commercial"."deal_pipelines"("id","owner_organization_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "commercial"."deals"
  ADD CONSTRAINT "deals_company_owner_fkey"
  FOREIGN KEY ("company_id","owner_organization_id")
  REFERENCES "crm"."companies"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "commercial"."deals"
  ADD CONSTRAINT "deals_primary_contact_owner_fkey"
  FOREIGN KEY ("primary_contact_id","owner_organization_id")
  REFERENCES "crm"."contacts"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "commercial"."deals"
  ADD CONSTRAINT "deals_source_lead_owner_fkey"
  FOREIGN KEY ("source_lead_id","owner_organization_id")
  REFERENCES "crm"."leads"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "commercial"."deals"
  ADD CONSTRAINT "deals_pipeline_owner_fkey"
  FOREIGN KEY ("pipeline_id","owner_organization_id")
  REFERENCES "commercial"."deal_pipelines"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "commercial"."deals"
  ADD CONSTRAINT "deals_stage_pipeline_fkey"
  FOREIGN KEY ("stage_id","pipeline_id")
  REFERENCES "commercial"."deal_stages"("id","pipeline_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "commercial"."deal_stage_history"
  ADD CONSTRAINT "deal_stage_history_deal_owner_fkey"
  FOREIGN KEY ("deal_id","owner_organization_id")
  REFERENCES "commercial"."deals"("id","owner_organization_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "commercial"."deal_stage_history"
  ADD CONSTRAINT "deal_stage_history_from_stage_owner_fkey"
  FOREIGN KEY ("from_stage_id","owner_organization_id")
  REFERENCES "commercial"."deal_stages"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "commercial"."deal_stage_history"
  ADD CONSTRAINT "deal_stage_history_to_stage_owner_fkey"
  FOREIGN KEY ("to_stage_id","owner_organization_id")
  REFERENCES "commercial"."deal_stages"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "commercial"."deal_stage_history"
  ADD CONSTRAINT "deal_stage_history_actor_owner_fkey"
  FOREIGN KEY ("actor_membership_id","owner_organization_id")
  REFERENCES "iam"."organization_memberships"("id","organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "commercial"."client_accounts"
  ADD CONSTRAINT "client_accounts_billing_contact_owner_fkey"
  FOREIGN KEY ("billing_contact_id","owner_organization_id")
  REFERENCES "crm"."contacts"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "commercial"."client_relationships"
  ADD CONSTRAINT "client_relationships_client_account_owner_fkey"
  FOREIGN KEY ("client_account_id","owner_organization_id")
  REFERENCES "commercial"."client_accounts"("id","owner_organization_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "commercial"."client_relationships"
  ADD CONSTRAINT "client_relationships_person_id_fkey"
  FOREIGN KEY ("person_id") REFERENCES "iam"."people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "commercial"."client_relationships"
  ADD CONSTRAINT "client_relationships_contact_owner_fkey"
  FOREIGN KEY ("contact_id","owner_organization_id")
  REFERENCES "crm"."contacts"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "crm"."leads"
  ADD CONSTRAINT "leads_converted_deal_owner_fkey"
  FOREIGN KEY ("converted_deal_id","owner_organization_id")
  REFERENCES "commercial"."deals"("id","owner_organization_id")
  DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE "crm"."qualifications"
  ADD CONSTRAINT "qualifications_deal_owner_fkey"
  FOREIGN KEY ("deal_id","owner_organization_id")
  REFERENCES "commercial"."deals"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "comms"."conversations"
  ADD CONSTRAINT "conversations_deal_owner_fkey"
  FOREIGN KEY ("deal_id","owner_organization_id")
  REFERENCES "commercial"."deals"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "comms"."conversations"
  ADD CONSTRAINT "conversations_client_account_owner_fkey"
  FOREIGN KEY ("client_account_id","owner_organization_id")
  REFERENCES "commercial"."client_accounts"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "comms"."meetings"
  ADD CONSTRAINT "meetings_deal_owner_fkey"
  FOREIGN KEY ("deal_id","owner_organization_id")
  REFERENCES "commercial"."deals"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "comms"."meetings"
  ADD CONSTRAINT "meetings_client_account_owner_fkey"
  FOREIGN KEY ("client_account_id","owner_organization_id")
  REFERENCES "commercial"."client_accounts"("id","owner_organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Check constraints.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT *
    FROM (VALUES
      ('crm','lead_sources'),('crm','extraction_jobs'),('crm','enrichment_jobs'),
      ('crm','companies'),('crm','contacts'),('crm','leads'),('crm','lead_lists'),
      ('crm','qualifications'),('crm','duplicate_candidates'),('crm','suppression_entries'),
      ('comms','sending_accounts'),('comms','message_templates'),('comms','outreach_campaigns'),
      ('comms','sequences'),('comms','conversations'),('comms','meetings'),
      ('commercial','deal_pipelines'),('commercial','deals'),('commercial','client_accounts')
    ) AS x(schema_name, table_name)
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I ADD CONSTRAINT %I CHECK (row_version > 0)',
      item.schema_name, item.table_name, item.table_name || '_row_version_positive'
    );
    EXECUTE format(
      'ALTER TABLE %I.%I ADD CONSTRAINT %I CHECK (visibility IN (''INTERNAL'',''CLIENT_SHARED'',''PUBLIC''))',
      item.schema_name, item.table_name, item.table_name || '_visibility_valid'
    );
    EXECUTE format(
      'ALTER TABLE %I.%I ADD CONSTRAINT %I CHECK (sensitivity IN (''STANDARD'',''CONFIDENTIAL'',''PII'',''FINANCIAL'',''SECURITY'',''SECRET''))',
      item.schema_name, item.table_name, item.table_name || '_sensitivity_valid'
    );
  END LOOP;
END
$$;

ALTER TABLE "crm"."extraction_jobs" ADD CONSTRAINT "extraction_jobs_status_valid"
  CHECK ("status" IN ('QUEUED','RUNNING','PAUSED','COMPLETED','PARTIAL','FAILED','CANCELLED'));
ALTER TABLE "crm"."extraction_jobs" ADD CONSTRAINT "extraction_jobs_counts_nonnegative"
  CHECK ("attempt" > 0 AND "requested_count" >= 0 AND "processed_count" >= 0 AND "accepted_count" >= 0 AND "rejected_count" >= 0);
ALTER TABLE "crm"."staged_records" ADD CONSTRAINT "staged_records_confidence_valid"
  CHECK ("confidence" IS NULL OR ("confidence" >= 0 AND "confidence" <= 1));
ALTER TABLE "crm"."enrichment_jobs" ADD CONSTRAINT "enrichment_jobs_status_valid"
  CHECK ("status" IN ('QUEUED','RUNNING','REVIEW_REQUIRED','ACCEPTED','PARTIAL','FAILED','CANCELLED'));
ALTER TABLE "crm"."enrichment_jobs" ADD CONSTRAINT "enrichment_jobs_attempt_positive" CHECK ("attempt" > 0);
ALTER TABLE "crm"."enrichment_facts" ADD CONSTRAINT "enrichment_facts_confidence_valid"
  CHECK ("confidence" IS NULL OR ("confidence" >= 0 AND "confidence" <= 1));
ALTER TABLE "crm"."enrichment_facts" ADD CONSTRAINT "enrichment_facts_terminal_review_exclusive"
  CHECK (NOT ("accepted_at" IS NOT NULL AND "rejected_at" IS NOT NULL));
ALTER TABLE "crm"."leads" ADD CONSTRAINT "leads_lifecycle_state_valid"
  CHECK ("lifecycle_state" IN (
    'NEW','EXTRACTED','ENRICHMENT_PENDING','ENRICHED','QUALIFICATION_PENDING',
    'QUALIFIED','OUTREACH_READY','CONTACTED','REPLIED','INTERESTED','NURTURE',
    'DISQUALIFIED','DO_NOT_CONTACT','CONVERTED'
  ));
ALTER TABLE "crm"."leads" ADD CONSTRAINT "leads_fit_score_valid"
  CHECK ("fit_score" IS NULL OR ("fit_score" >= 0 AND "fit_score" <= 100));
ALTER TABLE "crm"."lead_scores" ADD CONSTRAINT "lead_scores_score_valid"
  CHECK ("score" >= 0 AND "score" <= 100);
ALTER TABLE "crm"."lead_lists" ADD CONSTRAINT "lead_lists_member_count_nonnegative" CHECK ("member_count" >= 0);
ALTER TABLE "crm"."qualifications" ADD CONSTRAINT "qualifications_target_present"
  CHECK ("lead_id" IS NOT NULL OR "deal_id" IS NOT NULL);
ALTER TABLE "crm"."duplicate_candidates" ADD CONSTRAINT "duplicate_candidates_distinct_resources"
  CHECK ("left_resource_id" <> "right_resource_id");
ALTER TABLE "crm"."duplicate_candidates" ADD CONSTRAINT "duplicate_candidates_confidence_valid"
  CHECK ("confidence" IS NULL OR ("confidence" >= 0 AND "confidence" <= 1));
ALTER TABLE "crm"."suppression_entries" ADD CONSTRAINT "suppression_entries_dates_valid"
  CHECK ("expires_at" IS NULL OR "expires_at" > "effective_at");

ALTER TABLE "comms"."sending_accounts" ADD CONSTRAINT "sending_accounts_limits_valid"
  CHECK (("daily_limit" IS NULL OR "daily_limit" >= 0) AND ("hourly_limit" IS NULL OR "hourly_limit" >= 0));
ALTER TABLE "comms"."message_template_versions" ADD CONSTRAINT "message_template_versions_version_positive" CHECK ("version" > 0);
ALTER TABLE "comms"."outreach_campaigns" ADD CONSTRAINT "outreach_campaigns_status_valid"
  CHECK ("status" IN ('DRAFT','READY','APPROVED','SCHEDULED','RUNNING','PAUSED','COMPLETED','CANCELLED','FAILED'));
ALTER TABLE "comms"."outreach_campaigns" ADD CONSTRAINT "outreach_campaigns_counts_nonnegative"
  CHECK ("recipient_count" >= 0 AND "sent_count" >= 0 AND "reply_count" >= 0 AND "positive_reply_count" >= 0);
ALTER TABLE "comms"."sequences" ADD CONSTRAINT "sequences_version_positive" CHECK ("current_version" > 0);
ALTER TABLE "comms"."sequence_steps" ADD CONSTRAINT "sequence_steps_values_valid"
  CHECK ("sequence_version" > 0 AND "position" > 0 AND "delay_seconds" >= 0);
ALTER TABLE "comms"."campaign_recipients" ADD CONSTRAINT "campaign_recipients_identity_present"
  CHECK ("lead_id" IS NOT NULL OR "contact_id" IS NOT NULL);
ALTER TABLE "comms"."campaign_recipients" ADD CONSTRAINT "campaign_recipients_state_valid"
  CHECK ("state" IN ('QUEUED','SENT','DELIVERED','OPENED','CLICKED','REPLIED','BOUNCED','UNSUBSCRIBED','STOPPED','CONVERTED'));
ALTER TABLE "comms"."conversations" ADD CONSTRAINT "conversations_status_valid"
  CHECK ("status" IN ('OPEN','PENDING_INTERNAL','WAITING_EXTERNAL','RESOLVED','REOPENED','ARCHIVED'));
ALTER TABLE "comms"."messages" ADD CONSTRAINT "messages_direction_valid"
  CHECK ("direction" IN ('INBOUND','OUTBOUND','INTERNAL'));
ALTER TABLE "comms"."messages" ADD CONSTRAINT "messages_internal_visibility_valid"
  CHECK (NOT "is_internal_note" OR "visibility" = 'INTERNAL');
ALTER TABLE "comms"."meetings" ADD CONSTRAINT "meetings_status_valid"
  CHECK ("status" IN ('PROPOSED','SCHEDULED','CONFIRMED','COMPLETED','CANCELLED','NO_SHOW'));
ALTER TABLE "comms"."meetings" ADD CONSTRAINT "meetings_dates_valid" CHECK ("ends_at" > "starts_at");
ALTER TABLE "comms"."meeting_participants" ADD CONSTRAINT "meeting_participants_identity_present"
  CHECK ("person_id" IS NOT NULL OR "membership_id" IS NOT NULL);
ALTER TABLE "comms"."meeting_notes" ADD CONSTRAINT "meeting_notes_visibility_valid"
  CHECK ("visibility" IN ('INTERNAL','CLIENT_SHARED'));

ALTER TABLE "commercial"."deal_pipelines" ADD CONSTRAINT "deal_pipelines_version_positive" CHECK ("version" > 0);
ALTER TABLE "commercial"."deal_stages" ADD CONSTRAINT "deal_stages_values_valid"
  CHECK ("pipeline_version" > 0 AND "position" > 0 AND ("probability" IS NULL OR ("probability" >= 0 AND "probability" <= 1)));
ALTER TABLE "commercial"."deal_stages" ADD CONSTRAINT "deal_stages_canonical_class_valid"
  CHECK ("canonical_class" IN (
    'QUALIFIED','INTERESTED','DISCOVERY_SCHEDULED','DISCOVERY_COMPLETED',
    'PROPOSAL_PREPARATION','LOST','ON_HOLD','FOLLOW_UP_LATER','DISQUALIFIED'
  ));
ALTER TABLE "commercial"."deals" ADD CONSTRAINT "deals_probability_valid"
  CHECK ("probability" IS NULL OR ("probability" >= 0 AND "probability" <= 1));
ALTER TABLE "commercial"."deals" ADD CONSTRAINT "deals_money_pair_valid"
  CHECK (("amount_minor" IS NULL AND "currency" IS NULL) OR ("amount_minor" IS NOT NULL AND "currency" IS NOT NULL));
ALTER TABLE "commercial"."deal_stage_history" ADD CONSTRAINT "deal_stage_history_version_positive" CHECK ("deal_version" > 0);
ALTER TABLE "commercial"."client_relationships" ADD CONSTRAINT "client_relationships_identity_present"
  CHECK ("person_id" IS NOT NULL OR "contact_id" IS NOT NULL);

-- ---------------------------------------------------------------------------
-- Resource-envelope registration and consistency.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION "platform"."register_r6_resource"(
  p_id uuid,
  p_resource_type text,
  p_title text,
  p_client_organization_id uuid,
  p_visibility "platform"."Visibility",
  p_sensitivity "platform"."Sensitivity"
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  owner_id uuid;
  allowed_types constant text[] := ARRAY[
    'lead-source','extraction-job','enrichment-job','company','contact','lead',
    'lead-list','qualification','duplicate-candidate','suppression-entry',
    'sending-account','message-template','outreach-campaign','sequence',
    'conversation','meeting','deal-pipeline','deal','client-account'
  ];
BEGIN
  owner_id := platform.current_organization_id();
  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'R6 resource registration requires tenant context'
      USING ERRCODE = '42501';
  END IF;

  IF NOT (p_resource_type = ANY(allowed_types)) THEN
    RAISE EXCEPTION 'R6 resource type % is not allowed', p_resource_type
      USING ERRCODE = '22023';
  END IF;

  IF p_visibility = 'CLIENT_SHARED' AND p_client_organization_id IS NULL THEN
    RAISE EXCEPTION 'CLIENT_SHARED R6 resource requires client organization'
      USING ERRCODE = '23514';
  END IF;

  INSERT INTO platform.resources (
    id, resource_type, title, owner_organization_id, client_organization_id,
    visibility, sensitivity, created_at
  ) VALUES (
    p_id, p_resource_type, p_title, owner_id, p_client_organization_id,
    p_visibility, p_sensitivity, CURRENT_TIMESTAMP
  );

  RETURN p_id;
END
$$;

CREATE OR REPLACE FUNCTION "platform"."update_r6_resource"(
  p_id uuid,
  p_title text,
  p_client_organization_id uuid,
  p_visibility "platform"."Visibility",
  p_sensitivity "platform"."Sensitivity",
  p_archived_at timestamptz
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  owner_id uuid;
  changed_id uuid;
BEGIN
  owner_id := platform.current_organization_id();
  IF owner_id IS NULL THEN
    RAISE EXCEPTION 'R6 resource update requires tenant context'
      USING ERRCODE = '42501';
  END IF;

  UPDATE platform.resources
  SET title = p_title,
      client_organization_id = p_client_organization_id,
      visibility = p_visibility,
      sensitivity = p_sensitivity,
      archived_at = p_archived_at
  WHERE id = p_id
    AND owner_organization_id = owner_id
    AND resource_type = ANY(ARRAY[
      'lead-source','extraction-job','enrichment-job','company','contact','lead',
      'lead-list','qualification','duplicate-candidate','suppression-entry',
      'sending-account','message-template','outreach-campaign','sequence',
      'conversation','meeting','deal-pipeline','deal','client-account'
    ])
  RETURNING id INTO changed_id;

  IF changed_id IS NULL THEN
    RAISE EXCEPTION 'R6 resource is missing or not owned by selected tenant'
      USING ERRCODE = '42501';
  END IF;

  RETURN changed_id;
END
$$;

REVOKE ALL ON FUNCTION "platform"."register_r6_resource"(uuid,text,text,uuid,"platform"."Visibility","platform"."Sensitivity") FROM PUBLIC;
REVOKE ALL ON FUNCTION "platform"."update_r6_resource"(uuid,text,uuid,"platform"."Visibility","platform"."Sensitivity",timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION "platform"."register_r6_resource"(uuid,text,text,uuid,"platform"."Visibility","platform"."Sensitivity") TO perspective_runtime;
GRANT EXECUTE ON FUNCTION "platform"."update_r6_resource"(uuid,text,uuid,"platform"."Visibility","platform"."Sensitivity",timestamptz) TO perspective_runtime;

CREATE OR REPLACE FUNCTION "platform"."assert_r6_resource_envelope"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  envelope record;
  expected_type text := TG_ARGV[0];
BEGIN
  SELECT
    resource_type,
    owner_organization_id,
    client_organization_id,
    visibility::text AS visibility,
    sensitivity::text AS sensitivity,
    archived_at
  INTO envelope
  FROM platform.resources
  WHERE id = NEW.resource_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'R6 resource envelope % is missing or concealed', NEW.resource_id
      USING ERRCODE = '23503';
  END IF;

  IF envelope.resource_type <> expected_type
    OR envelope.owner_organization_id <> NEW.owner_organization_id
    OR envelope.client_organization_id IS DISTINCT FROM NEW.client_organization_id
    OR envelope.visibility <> NEW.visibility
    OR envelope.sensitivity <> NEW.sensitivity
    OR envelope.archived_at IS DISTINCT FROM NEW.archived_at
  THEN
    RAISE EXCEPTION 'R6 resource envelope mismatch for %', NEW.resource_id
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END
$$;

CREATE TRIGGER "lead_sources_resource_envelope"
  BEFORE INSERT OR UPDATE ON "crm"."lead_sources"
  FOR EACH ROW EXECUTE FUNCTION "platform"."assert_r6_resource_envelope"('lead-source');
CREATE TRIGGER "extraction_jobs_resource_envelope"
  BEFORE INSERT OR UPDATE ON "crm"."extraction_jobs"
  FOR EACH ROW EXECUTE FUNCTION "platform"."assert_r6_resource_envelope"('extraction-job');
CREATE TRIGGER "enrichment_jobs_resource_envelope"
  BEFORE INSERT OR UPDATE ON "crm"."enrichment_jobs"
  FOR EACH ROW EXECUTE FUNCTION "platform"."assert_r6_resource_envelope"('enrichment-job');
CREATE TRIGGER "companies_resource_envelope"
  BEFORE INSERT OR UPDATE ON "crm"."companies"
  FOR EACH ROW EXECUTE FUNCTION "platform"."assert_r6_resource_envelope"('company');
CREATE TRIGGER "contacts_resource_envelope"
  BEFORE INSERT OR UPDATE ON "crm"."contacts"
  FOR EACH ROW EXECUTE FUNCTION "platform"."assert_r6_resource_envelope"('contact');
CREATE TRIGGER "leads_resource_envelope"
  BEFORE INSERT OR UPDATE ON "crm"."leads"
  FOR EACH ROW EXECUTE FUNCTION "platform"."assert_r6_resource_envelope"('lead');
CREATE TRIGGER "lead_lists_resource_envelope"
  BEFORE INSERT OR UPDATE ON "crm"."lead_lists"
  FOR EACH ROW EXECUTE FUNCTION "platform"."assert_r6_resource_envelope"('lead-list');
CREATE TRIGGER "qualifications_resource_envelope"
  BEFORE INSERT OR UPDATE ON "crm"."qualifications"
  FOR EACH ROW EXECUTE FUNCTION "platform"."assert_r6_resource_envelope"('qualification');
CREATE TRIGGER "duplicate_candidates_resource_envelope"
  BEFORE INSERT OR UPDATE ON "crm"."duplicate_candidates"
  FOR EACH ROW EXECUTE FUNCTION "platform"."assert_r6_resource_envelope"('duplicate-candidate');
CREATE TRIGGER "suppression_entries_resource_envelope"
  BEFORE INSERT OR UPDATE ON "crm"."suppression_entries"
  FOR EACH ROW EXECUTE FUNCTION "platform"."assert_r6_resource_envelope"('suppression-entry');
CREATE TRIGGER "sending_accounts_resource_envelope"
  BEFORE INSERT OR UPDATE ON "comms"."sending_accounts"
  FOR EACH ROW EXECUTE FUNCTION "platform"."assert_r6_resource_envelope"('sending-account');
CREATE TRIGGER "message_templates_resource_envelope"
  BEFORE INSERT OR UPDATE ON "comms"."message_templates"
  FOR EACH ROW EXECUTE FUNCTION "platform"."assert_r6_resource_envelope"('message-template');
CREATE TRIGGER "outreach_campaigns_resource_envelope"
  BEFORE INSERT OR UPDATE ON "comms"."outreach_campaigns"
  FOR EACH ROW EXECUTE FUNCTION "platform"."assert_r6_resource_envelope"('outreach-campaign');
CREATE TRIGGER "sequences_resource_envelope"
  BEFORE INSERT OR UPDATE ON "comms"."sequences"
  FOR EACH ROW EXECUTE FUNCTION "platform"."assert_r6_resource_envelope"('sequence');
CREATE TRIGGER "conversations_resource_envelope"
  BEFORE INSERT OR UPDATE ON "comms"."conversations"
  FOR EACH ROW EXECUTE FUNCTION "platform"."assert_r6_resource_envelope"('conversation');
CREATE TRIGGER "meetings_resource_envelope"
  BEFORE INSERT OR UPDATE ON "comms"."meetings"
  FOR EACH ROW EXECUTE FUNCTION "platform"."assert_r6_resource_envelope"('meeting');
CREATE TRIGGER "deal_pipelines_resource_envelope"
  BEFORE INSERT OR UPDATE ON "commercial"."deal_pipelines"
  FOR EACH ROW EXECUTE FUNCTION "platform"."assert_r6_resource_envelope"('deal-pipeline');
CREATE TRIGGER "deals_resource_envelope"
  BEFORE INSERT OR UPDATE ON "commercial"."deals"
  FOR EACH ROW EXECUTE FUNCTION "platform"."assert_r6_resource_envelope"('deal');
CREATE TRIGGER "client_accounts_resource_envelope"
  BEFORE INSERT OR UPDATE ON "commercial"."client_accounts"
  FOR EACH ROW EXECUTE FUNCTION "platform"."assert_r6_resource_envelope"('client-account');

CREATE TRIGGER "lead_scores_immutable"
  BEFORE UPDATE OR DELETE ON "crm"."lead_scores"
  FOR EACH ROW EXECUTE FUNCTION "platform"."reject_immutable_mutation"();
CREATE TRIGGER "lead_status_history_immutable"
  BEFORE UPDATE OR DELETE ON "crm"."lead_status_history"
  FOR EACH ROW EXECUTE FUNCTION "platform"."reject_immutable_mutation"();
CREATE TRIGGER "message_template_versions_immutable"
  BEFORE UPDATE OR DELETE ON "comms"."message_template_versions"
  FOR EACH ROW EXECUTE FUNCTION "platform"."reject_immutable_mutation"();
CREATE TRIGGER "message_deliveries_immutable"
  BEFORE UPDATE OR DELETE ON "comms"."message_deliveries"
  FOR EACH ROW EXECUTE FUNCTION "platform"."reject_immutable_mutation"();
CREATE TRIGGER "messages_immutable"
  BEFORE UPDATE OR DELETE ON "comms"."messages"
  FOR EACH ROW EXECUTE FUNCTION "platform"."reject_immutable_mutation"();
CREATE TRIGGER "deal_stage_history_immutable"
  BEFORE UPDATE OR DELETE ON "commercial"."deal_stage_history"
  FOR EACH ROW EXECUTE FUNCTION "platform"."reject_immutable_mutation"();

-- D15 Resolution A: the template catalog can be seeded/imported only through an
-- explicit reviewed import transaction. Runtime has no table mutation grants,
-- and even privileged callers fail closed unless this transaction-local flag is
-- deliberately set by the reviewed import path.
CREATE OR REPLACE FUNCTION "platform"."r6_reject_template_runtime_mutation"()
RETURNS trigger
LANGUAGE plpgsql
AS $r6$
BEGIN
  IF current_setting('app.r6_template_import', true) IS DISTINCT FROM 'on' THEN
    RAISE EXCEPTION 'R6 template catalog mutation requires reviewed import mode'
      USING ERRCODE = '55000';
  END IF;

  RETURN COALESCE(NEW, OLD);
END
$r6$;

CREATE TRIGGER "message_templates_reviewed_import_only"
  BEFORE INSERT OR UPDATE OR DELETE ON "comms"."message_templates"
  FOR EACH ROW EXECUTE FUNCTION "platform"."r6_reject_template_runtime_mutation"();

CREATE TRIGGER "message_template_versions_reviewed_import_only"
  BEFORE INSERT OR UPDATE OR DELETE ON "comms"."message_template_versions"
  FOR EACH ROW EXECUTE FUNCTION "platform"."r6_reject_template_runtime_mutation"();

-- ---------------------------------------------------------------------------
-- RLS: every R6 row carries owner_organization_id. Child/evidence owner IDs are
-- constrained to their authoritative parents by same-tenant composite FKs.
-- Client Portal remains R12-locked, so R6 policies expose only the selected
-- Team owner organization.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  item record;
BEGIN
  FOR item IN
    SELECT *
    FROM (VALUES
      ('crm','lead_sources'),('crm','extraction_jobs'),('crm','staged_records'),
      ('crm','enrichment_jobs'),('crm','enrichment_facts'),('crm','companies'),
      ('crm','contacts'),('crm','leads'),('crm','lead_scores'),('crm','lead_status_history'),
      ('crm','lead_lists'),('crm','lead_list_members'),('crm','qualifications'),
      ('crm','duplicate_candidates'),('crm','suppression_entries'),
      ('comms','sending_accounts'),('comms','message_templates'),('comms','message_template_versions'),
      ('comms','outreach_campaigns'),('comms','sequences'),('comms','sequence_steps'),
      ('comms','campaign_recipients'),('comms','message_deliveries'),('comms','conversations'),
      ('comms','conversation_participants'),('comms','messages'),('comms','meetings'),
      ('comms','meeting_participants'),('comms','meeting_notes'),
      ('commercial','deal_pipelines'),('commercial','deal_stages'),('commercial','deals'),
      ('commercial','deal_stage_history'),('commercial','client_accounts'),('commercial','client_relationships')
    ) AS x(schema_name, table_name)
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', item.schema_name, item.table_name);
    EXECUTE format('ALTER TABLE %I.%I FORCE ROW LEVEL SECURITY', item.schema_name, item.table_name);
    EXECUTE format(
      'CREATE POLICY %I ON %I.%I FOR SELECT USING (owner_organization_id = platform.current_organization_id())',
      item.table_name || '_tenant_select', item.schema_name, item.table_name
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I.%I FOR INSERT WITH CHECK (owner_organization_id = platform.current_organization_id())',
      item.table_name || '_tenant_insert', item.schema_name, item.table_name
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I.%I FOR UPDATE USING (owner_organization_id = platform.current_organization_id()) WITH CHECK (owner_organization_id = platform.current_organization_id())',
      item.table_name || '_tenant_update', item.schema_name, item.table_name
    );
  END LOOP;
END
$$;

GRANT USAGE ON SCHEMA "crm", "comms", "commercial" TO perspective_runtime;

-- Explicit R6 SELECT inventory. This deliberately avoids ALL TABLES so a later
-- R7 table added to these schemas cannot silently become readable by R6 runtime.
GRANT SELECT ON
  "crm"."lead_sources","crm"."extraction_jobs","crm"."staged_records",
  "crm"."enrichment_jobs","crm"."enrichment_facts","crm"."companies",
  "crm"."contacts","crm"."leads","crm"."lead_scores","crm"."lead_status_history",
  "crm"."lead_lists","crm"."lead_list_members","crm"."qualifications",
  "crm"."duplicate_candidates","crm"."suppression_entries",
  "comms"."sending_accounts","comms"."message_templates","comms"."message_template_versions",
  "comms"."outreach_campaigns","comms"."sequences","comms"."sequence_steps",
  "comms"."campaign_recipients","comms"."message_deliveries","comms"."conversations",
  "comms"."conversation_participants","comms"."messages","comms"."meetings",
  "comms"."meeting_participants","comms"."meeting_notes",
  "commercial"."deal_pipelines","commercial"."deal_stages","commercial"."deals",
  "commercial"."deal_stage_history","commercial"."client_accounts","commercial"."client_relationships"
TO perspective_runtime;

-- Mutable aggregates/working rows. No DELETE or TRUNCATE is granted.
GRANT INSERT, UPDATE ON
  "crm"."lead_sources","crm"."extraction_jobs","crm"."staged_records",
  "crm"."enrichment_jobs","crm"."enrichment_facts","crm"."companies",
  "crm"."contacts","crm"."leads","crm"."lead_lists","crm"."lead_list_members",
  "crm"."qualifications","crm"."duplicate_candidates","crm"."suppression_entries",
  "comms"."sending_accounts","comms"."outreach_campaigns","comms"."sequences",
  "comms"."sequence_steps","comms"."campaign_recipients","comms"."conversations",
  "comms"."conversation_participants","comms"."meetings","comms"."meeting_participants",
  "comms"."meeting_notes",
  "commercial"."deal_pipelines","commercial"."deal_stages","commercial"."deals",
  "commercial"."client_accounts","commercial"."client_relationships"
TO perspective_runtime;

-- Append-only evidence.
GRANT INSERT ON
  "crm"."lead_scores","crm"."lead_status_history",
  "comms"."message_deliveries","comms"."messages",
  "commercial"."deal_stage_history"
TO perspective_runtime;

-- D15 Resolution A: message_templates and message_template_versions are
-- SELECT-only for perspective_runtime. There is no runtime mutation grant.
--
-- R7 exclusions are intentionally absent:
-- commercial.proposals, commercial.products, commercial.packages,
-- commercial.contracts, commercial.invoices, commercial.payments,
-- subscriptions and entitlements.


-- ---------------------------------------------------------------------------
-- R6 Commercial client-conversion helpers.
--
-- These SECURITY DEFINER functions preserve the R4/R5 rule that
-- perspective_runtime cannot write IAM organizations or the generic
-- idempotency ledger directly. Every helper derives the selected owner tenant
-- from the transaction-local canonical tenant claim.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION "platform"."claim_r6_client_conversion"(
  p_receipt_id uuid,
  p_idempotency_key text,
  p_request_hash text,
  p_expires_at timestamptz
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  owner_id uuid;
  existing_hash text;
  existing_state "platform"."IdempotencyState";
BEGIN
  owner_id := "platform"."current_organization_id"();

  IF owner_id IS NULL
     OR NULLIF(btrim(p_idempotency_key), '') IS NULL
     OR NULLIF(btrim(p_request_hash), '') IS NULL
     OR p_expires_at <= clock_timestamp()
  THEN
    RAISE EXCEPTION 'invalid R6 client conversion idempotency claim'
      USING ERRCODE = '22023';
  END IF;

  SELECT request_hash, state
    INTO existing_hash, existing_state
    FROM "platform"."idempotency_receipts"
   WHERE owner_organization_id = owner_id
     AND scope = 'commercial.client-conversion'
     AND idempotency_key = btrim(p_idempotency_key)
   FOR UPDATE;

  IF FOUND THEN
    IF existing_hash IS DISTINCT FROM btrim(p_request_hash) THEN
      RETURN 'MISMATCH';
    END IF;

    IF existing_state = 'COMPLETED' THEN
      RETURN 'REPLAY';
    END IF;

    RETURN 'IN_PROGRESS';
  END IF;

  INSERT INTO "platform"."idempotency_receipts" (
    id,
    owner_organization_id,
    scope,
    idempotency_key,
    request_hash,
    state,
    created_at,
    expires_at
  ) VALUES (
    p_receipt_id,
    owner_id,
    'commercial.client-conversion',
    btrim(p_idempotency_key),
    btrim(p_request_hash),
    'STARTED',
    clock_timestamp(),
    p_expires_at
  );

  RETURN 'CLAIMED';
END
$$;

CREATE OR REPLACE FUNCTION "platform"."complete_r6_client_conversion"(
  p_idempotency_key text,
  p_request_hash text,
  p_response_hash text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $r6_complete$
DECLARE
  owner_id uuid;
  changed integer;
BEGIN
  owner_id := "platform"."current_organization_id"();

  UPDATE "platform"."idempotency_receipts"
     SET state = 'COMPLETED',
         response_status = 200,
         response_hash = NULLIF(btrim(p_response_hash), ''),
         completed_at = clock_timestamp()
   WHERE owner_organization_id = owner_id
     AND scope = 'commercial.client-conversion'
     AND idempotency_key = btrim(p_idempotency_key)
     AND request_hash = btrim(p_request_hash)
     AND state = 'STARTED';

  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'R6 client conversion idempotency completion mismatch'
      USING ERRCODE = '23514';
  END IF;

  RETURN 'COMPLETED';
END
$r6_complete$;

CREATE OR REPLACE FUNCTION "platform"."resolve_r6_client_organization"(
  p_company_id uuid,
  p_new_organization_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  owner_id uuid;
  company_name text;
  company_legal_name text;
  company_domain text;
  company_linked_organization_id uuid;
  linked_type "iam"."OrganizationType";
  linked_status "iam"."RecordStatus";
  matching_count bigint;
  matching_organization_id uuid;
  generated_slug text;
BEGIN
  owner_id := "platform"."current_organization_id"();

  SELECT
    name,
    legal_name,
    domain::text,
    c.linked_organization_id
  INTO
    company_name,
    company_legal_name,
    company_domain,
    company_linked_organization_id
  FROM "crm"."companies" AS c
  WHERE c.id = p_company_id
    AND c.owner_organization_id = owner_id
    AND c.archived_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'R6 client conversion company not found in selected tenant'
      USING ERRCODE = '23503';
  END IF;

  IF company_linked_organization_id IS NOT NULL THEN
    SELECT organization_type, status
      INTO linked_type, linked_status
      FROM "iam"."organizations"
     WHERE id = company_linked_organization_id;

    IF NOT FOUND
       OR linked_type <> 'CLIENT'
       OR linked_status <> 'ACTIVE'
    THEN
      RAISE EXCEPTION 'R6 linked client organization is invalid'
        USING ERRCODE = '23514';
    END IF;

    RETURN company_linked_organization_id;
  END IF;

  IF NULLIF(btrim(company_domain), '') IS NOT NULL THEN
    SELECT
      count(*),
      min(id::text)::uuid
    INTO matching_count, matching_organization_id
    FROM "iam"."organizations"
    WHERE organization_type = 'CLIENT'
      AND status = 'ACTIVE'
      AND normalized_domain = btrim(company_domain);

    IF matching_count > 1 THEN
      RAISE EXCEPTION 'R6 client organization domain match is ambiguous'
        USING ERRCODE = '23505';
    ELSIF matching_count = 1 THEN
      UPDATE "crm"."companies"
         SET linked_organization_id = matching_organization_id,
             updated_at = clock_timestamp()
       WHERE id = p_company_id
         AND owner_organization_id = owner_id;

      RETURN matching_organization_id;
    END IF;
  END IF;

  IF p_new_organization_id IS NULL THEN
    RAISE EXCEPTION 'R6 client organization identifier is required'
      USING ERRCODE = '22023';
  END IF;

  generated_slug := 'client-' || replace(p_new_organization_id::text, '-', '');

  INSERT INTO "iam"."organizations" (
    id,
    organization_type,
    legal_name,
    display_name,
    slug,
    normalized_domain,
    status,
    settings,
    created_at,
    updated_at
  ) VALUES (
    p_new_organization_id,
    'CLIENT',
    COALESCE(NULLIF(btrim(company_legal_name), ''), company_name),
    company_name,
    generated_slug,
    NULLIF(btrim(company_domain), ''),
    'ACTIVE',
    '{}'::jsonb,
    clock_timestamp(),
    clock_timestamp()
  );

  UPDATE "crm"."companies"
     SET linked_organization_id = p_new_organization_id,
         updated_at = clock_timestamp()
   WHERE id = p_company_id
     AND owner_organization_id = owner_id;

  RETURN p_new_organization_id;
END
$$;

REVOKE ALL ON FUNCTION "platform"."claim_r6_client_conversion"(uuid,text,text,timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION "platform"."complete_r6_client_conversion"(text,text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION "platform"."resolve_r6_client_organization"(uuid,uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "platform"."claim_r6_client_conversion"(uuid,text,text,timestamptz) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION "platform"."complete_r6_client_conversion"(text,text,text) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION "platform"."resolve_r6_client_organization"(uuid,uuid) TO perspective_runtime;
