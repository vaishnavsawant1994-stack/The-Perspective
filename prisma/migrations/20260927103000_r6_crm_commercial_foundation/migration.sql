-- Phase 4 R6: CRM & Commercial Engine persistence foundation.
-- Frozen implementation contract: P4-R6-G0@730d2280fafe29c756ba7e0b09ff7e8e5c9496a6
-- Authorized implementation baseline: main@2372418d80fa07f633a0e4adc99a21b1f7d8300a
--
-- R7-owned Proposal/Product/Package/Contract/Invoice/Payment/Subscription/Entitlement
-- tables are intentionally absent.

CREATE SCHEMA IF NOT EXISTS "crm";
CREATE SCHEMA IF NOT EXISTS "comms";
CREATE SCHEMA IF NOT EXISTS "commercial";

-- Composite tenant keys used by R6 database invariant checks.
CREATE UNIQUE INDEX IF NOT EXISTS "departments_id_organization_id_key"
  ON "iam"."departments"("id", "organization_id");
CREATE UNIQUE INDEX IF NOT EXISTS "organization_memberships_id_organization_id_key"
  ON "iam"."organization_memberships"("id", "organization_id");
CREATE UNIQUE INDEX IF NOT EXISTS "resources_id_owner_organization_id_key"
  ON "platform"."resources"("id", "owner_organization_id");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "lead_sources_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lead_sources_resource_id_key" ON "crm"."lead_sources"("resource_id");
CREATE UNIQUE INDEX "lead_sources_id_owner_org_key" ON "crm"."lead_sources"("id", "owner_organization_id");
CREATE INDEX "lead_sources_owner_organization_id_archived_at_idx" ON "crm"."lead_sources"("owner_organization_id", "archived_at");
CREATE INDEX "lead_sources_owner_organization_id_health_idx" ON "crm"."lead_sources"("owner_organization_id", "health");
CREATE INDEX "lead_sources_resource_owner_idx" ON "crm"."lead_sources"("resource_id", "owner_organization_id");

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
  "requested_at" TIMESTAMPTZ(6) NOT NULL,
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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "extraction_jobs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "extraction_jobs_resource_id_key" ON "crm"."extraction_jobs"("resource_id");
CREATE UNIQUE INDEX "extraction_jobs_id_owner_org_key" ON "crm"."extraction_jobs"("id", "owner_organization_id");
CREATE INDEX "extraction_jobs_owner_organization_id_status_requested_at_idx" ON "crm"."extraction_jobs"("owner_organization_id", "status", "requested_at");
CREATE INDEX "extraction_jobs_lead_source_id_status_idx" ON "crm"."extraction_jobs"("lead_source_id", "status");
CREATE INDEX "extraction_jobs_resource_owner_idx" ON "crm"."extraction_jobs"("resource_id", "owner_organization_id");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "staged_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "staged_records_extraction_job_id_source_record_key_key" ON "crm"."staged_records"("extraction_job_id", "source_record_key");
CREATE UNIQUE INDEX "staged_records_id_owner_org_key" ON "crm"."staged_records"("id", "owner_organization_id");
CREATE INDEX "staged_records_owner_organization_id_validation_state_idx" ON "crm"."staged_records"("owner_organization_id", "validation_state");

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
  "requested_at" TIMESTAMPTZ(6) NOT NULL,
  "started_at" TIMESTAMPTZ(6),
  "finished_at" TIMESTAMPTZ(6),
  "error_summary" TEXT,
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "enrichment_jobs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "enrichment_jobs_resource_id_key" ON "crm"."enrichment_jobs"("resource_id");
CREATE UNIQUE INDEX "enrichment_jobs_id_owner_org_key" ON "crm"."enrichment_jobs"("id", "owner_organization_id");
CREATE INDEX "enrichment_jobs_owner_organization_id_target_resource_id_status_idx" ON "crm"."enrichment_jobs"("owner_organization_id", "target_resource_id", "status");
CREATE INDEX "enrichment_jobs_target_resource_id_provider_request_hash_idx" ON "crm"."enrichment_jobs"("target_resource_id", "provider", "request_hash");
CREATE INDEX "enrichment_jobs_resource_owner_idx" ON "crm"."enrichment_jobs"("resource_id", "owner_organization_id");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "enrichment_facts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "enrichment_facts_id_owner_org_key" ON "crm"."enrichment_facts"("id", "owner_organization_id");
CREATE INDEX "enrichment_facts_owner_organization_id_target_resource_id_field_key_idx" ON "crm"."enrichment_facts"("owner_organization_id", "target_resource_id", "field_key");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "companies_resource_id_key" ON "crm"."companies"("resource_id");
CREATE UNIQUE INDEX "companies_id_owner_org_key" ON "crm"."companies"("id", "owner_organization_id");
CREATE INDEX "companies_owner_organization_id_archived_at_idx" ON "crm"."companies"("owner_organization_id", "archived_at");
CREATE INDEX "companies_owner_organization_id_domain_idx" ON "crm"."companies"("owner_organization_id", "domain");
CREATE INDEX "companies_resource_owner_idx" ON "crm"."companies"("resource_id", "owner_organization_id");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "contacts_resource_id_key" ON "crm"."contacts"("resource_id");
CREATE UNIQUE INDEX "contacts_id_owner_org_key" ON "crm"."contacts"("id", "owner_organization_id");
CREATE INDEX "contacts_owner_organization_id_company_id_archived_at_idx" ON "crm"."contacts"("owner_organization_id", "company_id", "archived_at");
CREATE INDEX "contacts_owner_organization_id_email_normalized_idx" ON "crm"."contacts"("owner_organization_id", "email_normalized");
CREATE INDEX "contacts_resource_owner_idx" ON "crm"."contacts"("resource_id", "owner_organization_id");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "leads_resource_id_key" ON "crm"."leads"("resource_id");
CREATE UNIQUE INDEX "leads_converted_deal_id_key" ON "crm"."leads"("converted_deal_id");
CREATE UNIQUE INDEX "leads_id_owner_org_key" ON "crm"."leads"("id", "owner_organization_id");
CREATE INDEX "leads_owner_organization_id_lifecycle_state_archived_at_idx" ON "crm"."leads"("owner_organization_id", "lifecycle_state", "archived_at");
CREATE INDEX "leads_owner_organization_id_company_id_idx" ON "crm"."leads"("owner_organization_id", "company_id");
CREATE INDEX "leads_owner_organization_id_contact_id_idx" ON "crm"."leads"("owner_organization_id", "contact_id");
CREATE INDEX "leads_resource_owner_idx" ON "crm"."leads"("resource_id", "owner_organization_id");

CREATE TABLE "crm"."lead_scores" (
  "id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "lead_id" UUID NOT NULL,
  "model_version" TEXT NOT NULL,
  "score" DECIMAL(12,6) NOT NULL,
  "components" JSONB NOT NULL DEFAULT '{}',
  "calculated_at" TIMESTAMPTZ(6) NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "lead_scores_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lead_scores_lead_id_model_version_calculated_at_key" ON "crm"."lead_scores"("lead_id", "model_version", "calculated_at");
CREATE UNIQUE INDEX "lead_scores_id_owner_org_key" ON "crm"."lead_scores"("id", "owner_organization_id");
CREATE INDEX "lead_scores_owner_organization_id_lead_id_calculated_at_idx" ON "crm"."lead_scores"("owner_organization_id", "lead_id", "calculated_at" DESC);

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "lead_status_history_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lead_status_history_id_owner_org_key" ON "crm"."lead_status_history"("id", "owner_organization_id");
CREATE INDEX "lead_status_history_owner_organization_id_lead_id_occurred_at_idx" ON "crm"."lead_status_history"("owner_organization_id", "lead_id", "occurred_at" DESC);

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "lead_lists_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lead_lists_resource_id_key" ON "crm"."lead_lists"("resource_id");
CREATE UNIQUE INDEX "lead_lists_id_owner_org_key" ON "crm"."lead_lists"("id", "owner_organization_id");
CREATE INDEX "lead_lists_owner_organization_id_owner_membership_id_archived_at_idx" ON "crm"."lead_lists"("owner_organization_id", "owner_membership_id", "archived_at");
CREATE INDEX "lead_lists_resource_owner_idx" ON "crm"."lead_lists"("resource_id", "owner_organization_id");

CREATE TABLE "crm"."lead_list_members" (
  "owner_organization_id" UUID NOT NULL,
  "lead_list_id" UUID NOT NULL,
  "lead_id" UUID NOT NULL,
  "added_at" TIMESTAMPTZ(6) NOT NULL,
  "added_by_membership_id" UUID,
  "removed_at" TIMESTAMPTZ(6),
  "removed_by_membership_id" UUID,
  CONSTRAINT "lead_list_members_pkey" PRIMARY KEY ("lead_list_id", "lead_id")
);

CREATE INDEX "lead_list_members_owner_organization_id_lead_id_removed_at_idx" ON "crm"."lead_list_members"("owner_organization_id", "lead_id", "removed_at");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "qualifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "qualifications_resource_id_key" ON "crm"."qualifications"("resource_id");
CREATE UNIQUE INDEX "qualifications_id_owner_org_key" ON "crm"."qualifications"("id", "owner_organization_id");
CREATE INDEX "qualifications_owner_organization_id_lead_id_reviewed_at_idx" ON "crm"."qualifications"("owner_organization_id", "lead_id", "reviewed_at");
CREATE INDEX "qualifications_owner_organization_id_deal_id_reviewed_at_idx" ON "crm"."qualifications"("owner_organization_id", "deal_id", "reviewed_at");
CREATE INDEX "qualifications_resource_owner_idx" ON "crm"."qualifications"("resource_id", "owner_organization_id");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "duplicate_candidates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "duplicate_candidates_resource_id_key" ON "crm"."duplicate_candidates"("resource_id");
CREATE UNIQUE INDEX "duplicate_candidates_id_owner_org_key" ON "crm"."duplicate_candidates"("id", "owner_organization_id");
CREATE INDEX "duplicate_candidates_owner_organization_id_status_idx" ON "crm"."duplicate_candidates"("owner_organization_id", "status");
CREATE INDEX "duplicate_candidates_resource_owner_idx" ON "crm"."duplicate_candidates"("resource_id", "owner_organization_id");

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
  "effective_at" TIMESTAMPTZ(6) NOT NULL,
  "expires_at" TIMESTAMPTZ(6),
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_by_membership_id" UUID,
  "updated_by_membership_id" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "suppression_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "suppression_entries_resource_id_key" ON "crm"."suppression_entries"("resource_id");
CREATE UNIQUE INDEX "suppression_entries_id_owner_org_key" ON "crm"."suppression_entries"("id", "owner_organization_id");
CREATE INDEX "suppression_entries_owner_organization_id_channel_normalized_destination_hash_idx" ON "crm"."suppression_entries"("owner_organization_id", "channel", "normalized_destination_hash");
CREATE INDEX "suppression_entries_resource_owner_idx" ON "crm"."suppression_entries"("resource_id", "owner_organization_id");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "sending_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sending_accounts_resource_id_key" ON "comms"."sending_accounts"("resource_id");
CREATE UNIQUE INDEX "sending_accounts_id_owner_org_key" ON "comms"."sending_accounts"("id", "owner_organization_id");
CREATE UNIQUE INDEX "sending_accounts_owner_organization_id_provider_address_key" ON "comms"."sending_accounts"("owner_organization_id", "provider", "address");
CREATE INDEX "sending_accounts_owner_organization_id_health_archived_at_idx" ON "comms"."sending_accounts"("owner_organization_id", "health", "archived_at");
CREATE INDEX "sending_accounts_resource_owner_idx" ON "comms"."sending_accounts"("resource_id", "owner_organization_id");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "message_templates_resource_id_key" ON "comms"."message_templates"("resource_id");
CREATE UNIQUE INDEX "message_templates_id_owner_org_key" ON "comms"."message_templates"("id", "owner_organization_id");
CREATE INDEX "message_templates_owner_organization_id_owner_membership_id_archived_at_idx" ON "comms"."message_templates"("owner_organization_id", "owner_membership_id", "archived_at");
CREATE INDEX "message_templates_resource_owner_idx" ON "comms"."message_templates"("resource_id", "owner_organization_id");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "message_template_versions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "message_template_versions_template_id_version_key" ON "comms"."message_template_versions"("template_id", "version");
CREATE UNIQUE INDEX "message_template_versions_id_owner_org_key" ON "comms"."message_template_versions"("id", "owner_organization_id");
CREATE INDEX "message_template_versions_owner_organization_id_template_id_approved_at_idx" ON "comms"."message_template_versions"("owner_organization_id", "template_id", "approved_at");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "outreach_campaigns_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "outreach_campaigns_resource_id_key" ON "comms"."outreach_campaigns"("resource_id");
CREATE UNIQUE INDEX "outreach_campaigns_id_owner_org_key" ON "comms"."outreach_campaigns"("id", "owner_organization_id");
CREATE INDEX "outreach_campaigns_owner_organization_id_status_archived_at_idx" ON "comms"."outreach_campaigns"("owner_organization_id", "status", "archived_at");
CREATE INDEX "outreach_campaigns_resource_owner_idx" ON "comms"."outreach_campaigns"("resource_id", "owner_organization_id");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "sequences_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sequences_resource_id_key" ON "comms"."sequences"("resource_id");
CREATE UNIQUE INDEX "sequences_id_owner_org_key" ON "comms"."sequences"("id", "owner_organization_id");
CREATE INDEX "sequences_owner_organization_id_owner_membership_id_archived_at_idx" ON "comms"."sequences"("owner_organization_id", "owner_membership_id", "archived_at");
CREATE INDEX "sequences_resource_owner_idx" ON "comms"."sequences"("resource_id", "owner_organization_id");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "sequence_steps_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sequence_steps_sequence_id_sequence_version_position_key" ON "comms"."sequence_steps"("sequence_id", "sequence_version", "position");
CREATE UNIQUE INDEX "sequence_steps_id_owner_org_key" ON "comms"."sequence_steps"("id", "owner_organization_id");
CREATE INDEX "sequence_steps_owner_organization_id_sequence_id_sequence_version_idx" ON "comms"."sequence_steps"("owner_organization_id", "sequence_id", "sequence_version");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "campaign_recipients_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "campaign_recipients_id_owner_org_key" ON "comms"."campaign_recipients"("id", "owner_organization_id");
CREATE UNIQUE INDEX "campaign_recipients_campaign_id_lead_id_key" ON "comms"."campaign_recipients"("campaign_id", "lead_id");
CREATE UNIQUE INDEX "campaign_recipients_campaign_id_contact_id_key" ON "comms"."campaign_recipients"("campaign_id", "contact_id");
CREATE INDEX "campaign_recipients_owner_organization_id_campaign_id_state_next_action_at_idx" ON "comms"."campaign_recipients"("owner_organization_id", "campaign_id", "state", "next_action_at");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "message_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "message_deliveries_provider_external_event_id_key" ON "comms"."message_deliveries"("provider", "external_event_id");
CREATE UNIQUE INDEX "message_deliveries_id_owner_org_key" ON "comms"."message_deliveries"("id", "owner_organization_id");
CREATE INDEX "message_deliveries_owner_organization_id_occurred_at_idx" ON "comms"."message_deliveries"("owner_organization_id", "occurred_at" DESC);

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "conversations_resource_id_key" ON "comms"."conversations"("resource_id");
CREATE UNIQUE INDEX "conversations_id_owner_org_key" ON "comms"."conversations"("id", "owner_organization_id");
CREATE UNIQUE INDEX "conversations_owner_organization_id_provider_provider_thread_id_key" ON "comms"."conversations"("owner_organization_id", "provider", "provider_thread_id");
CREATE INDEX "conversations_owner_organization_id_status_last_message_at_idx" ON "comms"."conversations"("owner_organization_id", "status", "last_message_at" DESC);
CREATE INDEX "conversations_resource_owner_idx" ON "comms"."conversations"("resource_id", "owner_organization_id");

CREATE TABLE "comms"."conversation_participants" (
  "id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "conversation_id" UUID NOT NULL,
  "person_id" UUID,
  "address" TEXT NOT NULL,
  "normalized_address" CITEXT NOT NULL,
  "participant_role" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "removed_at" TIMESTAMPTZ(6),
  CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "conversation_participants_conversation_id_normalized_address_key" ON "comms"."conversation_participants"("conversation_id", "normalized_address");
CREATE UNIQUE INDEX "conversation_participants_id_owner_org_key" ON "comms"."conversation_participants"("id", "owner_organization_id");
CREATE INDEX "conversation_participants_owner_organization_id_conversation_id_removed_at_idx" ON "comms"."conversation_participants"("owner_organization_id", "conversation_id", "removed_at");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "messages_resource_id_key" ON "comms"."messages"("resource_id");
CREATE UNIQUE INDEX "messages_id_owner_org_key" ON "comms"."messages"("id", "owner_organization_id");
CREATE UNIQUE INDEX "messages_owner_organization_id_provider_external_id_key" ON "comms"."messages"("owner_organization_id", "provider", "external_id");
CREATE INDEX "messages_owner_organization_id_conversation_id_created_at_idx" ON "comms"."messages"("owner_organization_id", "conversation_id", "created_at");
CREATE INDEX "messages_resource_owner_idx" ON "comms"."messages"("resource_id", "owner_organization_id");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "meetings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "meetings_resource_id_key" ON "comms"."meetings"("resource_id");
CREATE UNIQUE INDEX "meetings_id_owner_org_key" ON "comms"."meetings"("id", "owner_organization_id");
CREATE UNIQUE INDEX "meetings_owner_organization_id_provider_external_event_id_key" ON "comms"."meetings"("owner_organization_id", "provider", "external_event_id");
CREATE INDEX "meetings_owner_organization_id_starts_at_status_idx" ON "comms"."meetings"("owner_organization_id", "starts_at", "status");
CREATE INDEX "meetings_resource_owner_idx" ON "comms"."meetings"("resource_id", "owner_organization_id");

CREATE TABLE "comms"."meeting_participants" (
  "id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "meeting_id" UUID NOT NULL,
  "person_id" UUID,
  "membership_id" UUID,
  "role" TEXT NOT NULL,
  "attendance_state" TEXT NOT NULL DEFAULT 'INVITED',
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "removed_at" TIMESTAMPTZ(6),
  CONSTRAINT "meeting_participants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "meeting_participants_id_owner_org_key" ON "comms"."meeting_participants"("id", "owner_organization_id");
CREATE INDEX "meeting_participants_owner_organization_id_meeting_id_removed_at_idx" ON "comms"."meeting_participants"("owner_organization_id", "meeting_id", "removed_at");

CREATE TABLE "comms"."meeting_notes" (
  "id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "meeting_id" UUID NOT NULL,
  "author_membership_id" UUID NOT NULL,
  "body" TEXT NOT NULL,
  "decisions" JSONB NOT NULL DEFAULT '[]',
  "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
  "row_version" INTEGER NOT NULL DEFAULT 1,
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "meeting_notes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "meeting_notes_id_owner_org_key" ON "comms"."meeting_notes"("id", "owner_organization_id");
CREATE INDEX "meeting_notes_owner_organization_id_meeting_id_created_at_idx" ON "comms"."meeting_notes"("owner_organization_id", "meeting_id", "created_at");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "deal_pipelines_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "deal_pipelines_resource_id_key" ON "commercial"."deal_pipelines"("resource_id");
CREATE UNIQUE INDEX "deal_pipelines_owner_organization_id_name_version_key" ON "commercial"."deal_pipelines"("owner_organization_id", "name", "version");
CREATE UNIQUE INDEX "deal_pipelines_id_owner_org_key" ON "commercial"."deal_pipelines"("id", "owner_organization_id");
CREATE INDEX "deal_pipelines_owner_organization_id_active_archived_at_idx" ON "commercial"."deal_pipelines"("owner_organization_id", "active", "archived_at");
CREATE INDEX "deal_pipelines_resource_owner_idx" ON "commercial"."deal_pipelines"("resource_id", "owner_organization_id");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "deal_stages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "deal_stages_pipeline_id_pipeline_version_key_key" ON "commercial"."deal_stages"("pipeline_id", "pipeline_version", "key");
CREATE UNIQUE INDEX "deal_stages_pipeline_id_pipeline_version_position_key" ON "commercial"."deal_stages"("pipeline_id", "pipeline_version", "position");
CREATE UNIQUE INDEX "deal_stages_id_pipeline_key" ON "commercial"."deal_stages"("id", "pipeline_id");
CREATE UNIQUE INDEX "deal_stages_id_owner_org_key" ON "commercial"."deal_stages"("id", "owner_organization_id");
CREATE INDEX "deal_stages_owner_organization_id_pipeline_id_position_idx" ON "commercial"."deal_stages"("owner_organization_id", "pipeline_id", "position");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "deals_resource_id_key" ON "commercial"."deals"("resource_id");
CREATE UNIQUE INDEX "deals_source_lead_id_key" ON "commercial"."deals"("source_lead_id");
CREATE UNIQUE INDEX "deals_id_owner_org_key" ON "commercial"."deals"("id", "owner_organization_id");
CREATE INDEX "deals_owner_organization_id_pipeline_id_stage_id_archived_at_idx" ON "commercial"."deals"("owner_organization_id", "pipeline_id", "stage_id", "archived_at");
CREATE INDEX "deals_owner_organization_id_expected_close_date_idx" ON "commercial"."deals"("owner_organization_id", "expected_close_date");
CREATE INDEX "deals_resource_owner_idx" ON "commercial"."deals"("resource_id", "owner_organization_id");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "deal_stage_history_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "deal_stage_history_id_owner_org_key" ON "commercial"."deal_stage_history"("id", "owner_organization_id");
CREATE INDEX "deal_stage_history_owner_organization_id_deal_id_occurred_at_idx" ON "commercial"."deal_stage_history"("owner_organization_id", "deal_id", "occurred_at" DESC);

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "client_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "client_accounts_resource_id_key" ON "commercial"."client_accounts"("resource_id");
CREATE UNIQUE INDEX "client_accounts_id_owner_org_key" ON "commercial"."client_accounts"("id", "owner_organization_id");
CREATE INDEX "client_accounts_owner_organization_id_client_organization_id_archived_at_idx" ON "commercial"."client_accounts"("owner_organization_id", "client_organization_id", "archived_at");
CREATE INDEX "client_accounts_resource_owner_idx" ON "commercial"."client_accounts"("resource_id", "owner_organization_id");

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
  "created_at" TIMESTAMPTZ(6) NOT NULL,
  "archived_at" TIMESTAMPTZ(6),
  CONSTRAINT "client_relationships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "client_relationships_id_owner_org_key" ON "commercial"."client_relationships"("id", "owner_organization_id");
CREATE INDEX "client_relationships_owner_organization_id_client_account_id_archived_at_idx" ON "commercial"."client_relationships"("owner_organization_id", "client_account_id", "archived_at");


-- Additional partial uniqueness/race invariants that Prisma does not model.
CREATE UNIQUE INDEX "lead_sources_live_owner_name_key"
  ON "crm"."lead_sources"("owner_organization_id", "name")
  WHERE "archived_at" IS NULL;
CREATE UNIQUE INDEX "companies_live_owner_domain_key"
  ON "crm"."companies"("owner_organization_id", "domain")
  WHERE "archived_at" IS NULL AND "domain" IS NOT NULL;
CREATE UNIQUE INDEX "contacts_live_owner_person_company_key"
  ON "crm"."contacts"("owner_organization_id", "person_id", "company_id")
  WHERE "archived_at" IS NULL AND "person_id" IS NOT NULL;
CREATE UNIQUE INDEX "lead_lists_live_owner_name_owner_key"
  ON "crm"."lead_lists"("owner_organization_id", "name", "owner_membership_id")
  WHERE "archived_at" IS NULL;
CREATE UNIQUE INDEX "suppression_entries_live_destination_key"
  ON "crm"."suppression_entries"("owner_organization_id", "channel", "normalized_destination_hash")
  WHERE "archived_at" IS NULL;
CREATE UNIQUE INDEX "extraction_jobs_active_request_key"
  ON "crm"."extraction_jobs"("owner_organization_id", "lead_source_id", "request_hash")
  WHERE "archived_at" IS NULL AND "request_hash" IS NOT NULL AND "status" IN ('QUEUED','RUNNING');
CREATE UNIQUE INDEX "enrichment_jobs_active_request_key"
  ON "crm"."enrichment_jobs"("owner_organization_id", "target_resource_id", "provider", "request_hash")
  WHERE "archived_at" IS NULL AND "status" IN ('QUEUED','RUNNING');
CREATE UNIQUE INDEX "message_templates_live_owner_name_owner_key"
  ON "comms"."message_templates"("owner_organization_id", "name", "owner_membership_id")
  WHERE "archived_at" IS NULL;
CREATE UNIQUE INDEX "sequences_live_owner_name_owner_key"
  ON "comms"."sequences"("owner_organization_id", "name", "owner_membership_id")
  WHERE "archived_at" IS NULL;
CREATE UNIQUE INDEX "meeting_participants_live_person_key"
  ON "comms"."meeting_participants"("meeting_id", "person_id")
  WHERE "removed_at" IS NULL AND "person_id" IS NOT NULL;
CREATE UNIQUE INDEX "meeting_participants_live_membership_key"
  ON "comms"."meeting_participants"("meeting_id", "membership_id")
  WHERE "removed_at" IS NULL AND "membership_id" IS NOT NULL;
CREATE UNIQUE INDEX "client_accounts_live_client_org_key"
  ON "commercial"."client_accounts"("client_organization_id")
  WHERE "archived_at" IS NULL;
CREATE UNIQUE INDEX "client_relationships_live_person_role_key"
  ON "commercial"."client_relationships"("client_account_id", "person_id", "relationship_role")
  WHERE "archived_at" IS NULL AND "person_id" IS NOT NULL;
CREATE UNIQUE INDEX "client_relationships_live_contact_role_key"
  ON "commercial"."client_relationships"("client_account_id", "contact_id", "relationship_role")
  WHERE "archived_at" IS NULL AND "contact_id" IS NOT NULL;

-- Fail-closed resource-envelope agreement.
CREATE OR REPLACE FUNCTION "platform"."r6_assert_resource_envelope"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  payload jsonb := to_jsonb(NEW);
  resource_id_value uuid;
  owner_id uuid;
  client_id uuid;
  envelope record;
BEGIN
  resource_id_value := NULLIF(payload ->> 'resource_id', '')::uuid;
  IF resource_id_value IS NULL THEN
    RETURN NEW;
  END IF;

  owner_id := NULLIF(payload ->> 'owner_organization_id', '')::uuid;

  SELECT id, resource_type, owner_organization_id, client_organization_id,
         visibility::text AS visibility, sensitivity::text AS sensitivity
  INTO envelope
  FROM "platform"."resources"
  WHERE id = resource_id_value;

  IF envelope IS NULL THEN
    RAISE EXCEPTION 'R6 resource envelope missing for %', resource_id_value
      USING ERRCODE = '23503';
  END IF;

  IF envelope.owner_organization_id IS DISTINCT FROM owner_id THEN
    RAISE EXCEPTION 'R6 resource owner mismatch for %', resource_id_value
      USING ERRCODE = '23514';
  END IF;

  IF envelope.resource_type IS DISTINCT FROM TG_ARGV[0] THEN
    RAISE EXCEPTION 'R6 resource type mismatch for %, expected %, found %',
      resource_id_value, TG_ARGV[0], envelope.resource_type
      USING ERRCODE = '23514';
  END IF;

  IF payload ? 'client_organization_id' THEN
    client_id := NULLIF(payload ->> 'client_organization_id', '')::uuid;
    IF envelope.client_organization_id IS DISTINCT FROM client_id THEN
      RAISE EXCEPTION 'R6 resource client mismatch for %', resource_id_value
        USING ERRCODE = '23514';
    END IF;
  END IF;

  IF payload ? 'visibility'
     AND envelope.visibility IS DISTINCT FROM (payload ->> 'visibility') THEN
    RAISE EXCEPTION 'R6 resource visibility mismatch for %', resource_id_value
      USING ERRCODE = '23514';
  END IF;

  IF payload ? 'sensitivity'
     AND envelope.sensitivity IS DISTINCT FROM (payload ->> 'sensitivity') THEN
    RAISE EXCEPTION 'R6 resource sensitivity mismatch for %', resource_id_value
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

-- Generic same-tenant reference guard. It intentionally complements, rather
-- than replaces, application-level trusted loaders.
CREATE OR REPLACE FUNCTION "platform"."r6_assert_same_tenant_reference"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  payload jsonb := to_jsonb(NEW);
  owner_id uuid := NULLIF(payload ->> 'owner_organization_id', '')::uuid;
  ref_id uuid;
  target_owner uuid;
BEGIN
  ref_id := NULLIF(payload ->> TG_ARGV[0], '')::uuid;
  IF ref_id IS NULL THEN
    RETURN NEW;
  END IF;

  EXECUTE format(
    'SELECT %I FROM %I.%I WHERE id = $1',
    TG_ARGV[3], TG_ARGV[1], TG_ARGV[2]
  )
  INTO target_owner
  USING ref_id;

  IF target_owner IS NULL THEN
    RAISE EXCEPTION 'R6 referenced row missing: %.%.%=%',
      TG_ARGV[1], TG_ARGV[2], TG_ARGV[0], ref_id
      USING ERRCODE = '23503';
  END IF;

  IF target_owner IS DISTINCT FROM owner_id THEN
    RAISE EXCEPTION 'R6 cross-tenant reference denied: %.%.%=%',
      TG_ARGV[1], TG_ARGV[2], TG_ARGV[0], ref_id
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER "lead_sources_r6_resource_envelope"
BEFORE INSERT OR UPDATE ON "crm"."lead_sources"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_resource_envelope"('lead-source');
CREATE TRIGGER "extraction_jobs_r6_resource_envelope"
BEFORE INSERT OR UPDATE ON "crm"."extraction_jobs"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_resource_envelope"('extraction-job');
CREATE TRIGGER "enrichment_jobs_r6_resource_envelope"
BEFORE INSERT OR UPDATE ON "crm"."enrichment_jobs"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_resource_envelope"('enrichment-job');
CREATE TRIGGER "companies_r6_resource_envelope"
BEFORE INSERT OR UPDATE ON "crm"."companies"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_resource_envelope"('company');
CREATE TRIGGER "contacts_r6_resource_envelope"
BEFORE INSERT OR UPDATE ON "crm"."contacts"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_resource_envelope"('contact');
CREATE TRIGGER "leads_r6_resource_envelope"
BEFORE INSERT OR UPDATE ON "crm"."leads"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_resource_envelope"('lead');
CREATE TRIGGER "lead_lists_r6_resource_envelope"
BEFORE INSERT OR UPDATE ON "crm"."lead_lists"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_resource_envelope"('lead-list');
CREATE TRIGGER "qualifications_r6_resource_envelope"
BEFORE INSERT OR UPDATE ON "crm"."qualifications"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_resource_envelope"('qualification');
CREATE TRIGGER "duplicate_candidates_r6_resource_envelope"
BEFORE INSERT OR UPDATE ON "crm"."duplicate_candidates"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_resource_envelope"('duplicate-candidate');
CREATE TRIGGER "suppression_entries_r6_resource_envelope"
BEFORE INSERT OR UPDATE ON "crm"."suppression_entries"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_resource_envelope"('suppression-entry');
CREATE TRIGGER "sending_accounts_r6_resource_envelope"
BEFORE INSERT OR UPDATE ON "comms"."sending_accounts"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_resource_envelope"('sending-account');
CREATE TRIGGER "message_templates_r6_resource_envelope"
BEFORE INSERT OR UPDATE ON "comms"."message_templates"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_resource_envelope"('message-template');
CREATE TRIGGER "outreach_campaigns_r6_resource_envelope"
BEFORE INSERT OR UPDATE ON "comms"."outreach_campaigns"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_resource_envelope"('outreach-campaign');
CREATE TRIGGER "sequences_r6_resource_envelope"
BEFORE INSERT OR UPDATE ON "comms"."sequences"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_resource_envelope"('sequence');
CREATE TRIGGER "conversations_r6_resource_envelope"
BEFORE INSERT OR UPDATE ON "comms"."conversations"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_resource_envelope"('conversation');
CREATE TRIGGER "messages_r6_resource_envelope"
BEFORE INSERT OR UPDATE ON "comms"."messages"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_resource_envelope"('message');
CREATE TRIGGER "meetings_r6_resource_envelope"
BEFORE INSERT OR UPDATE ON "comms"."meetings"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_resource_envelope"('meeting');
CREATE TRIGGER "deal_pipelines_r6_resource_envelope"
BEFORE INSERT OR UPDATE ON "commercial"."deal_pipelines"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_resource_envelope"('deal-pipeline');
CREATE TRIGGER "deals_r6_resource_envelope"
BEFORE INSERT OR UPDATE ON "commercial"."deals"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_resource_envelope"('deal');
CREATE TRIGGER "client_accounts_r6_resource_envelope"
BEFORE INSERT OR UPDATE ON "commercial"."client_accounts"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_resource_envelope"('client-account');

CREATE TRIGGER "extraction_jobs_lead_source_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "crm"."extraction_jobs"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('lead_source_id', 'crm', 'lead_sources', 'owner_organization_id');
CREATE TRIGGER "staged_records_extraction_job_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "crm"."staged_records"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('extraction_job_id', 'crm', 'extraction_jobs', 'owner_organization_id');
CREATE TRIGGER "enrichment_jobs_target_resource_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "crm"."enrichment_jobs"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('target_resource_id', 'platform', 'resources', 'owner_organization_id');
CREATE TRIGGER "enrichment_facts_job_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "crm"."enrichment_facts"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('job_id', 'crm', 'enrichment_jobs', 'owner_organization_id');
CREATE TRIGGER "enrichment_facts_target_resource_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "crm"."enrichment_facts"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('target_resource_id', 'platform', 'resources', 'owner_organization_id');
CREATE TRIGGER "contacts_company_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "crm"."contacts"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('company_id', 'crm', 'companies', 'owner_organization_id');
CREATE TRIGGER "leads_company_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "crm"."leads"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('company_id', 'crm', 'companies', 'owner_organization_id');
CREATE TRIGGER "leads_contact_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "crm"."leads"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('contact_id', 'crm', 'contacts', 'owner_organization_id');
CREATE TRIGGER "leads_lead_source_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "crm"."leads"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('lead_source_id', 'crm', 'lead_sources', 'owner_organization_id');
CREATE TRIGGER "lead_scores_lead_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "crm"."lead_scores"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('lead_id', 'crm', 'leads', 'owner_organization_id');
CREATE TRIGGER "lead_status_history_lead_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "crm"."lead_status_history"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('lead_id', 'crm', 'leads', 'owner_organization_id');
CREATE TRIGGER "lead_list_members_lead_list_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "crm"."lead_list_members"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('lead_list_id', 'crm', 'lead_lists', 'owner_organization_id');
CREATE TRIGGER "lead_list_members_lead_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "crm"."lead_list_members"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('lead_id', 'crm', 'leads', 'owner_organization_id');
CREATE TRIGGER "qualifications_lead_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "crm"."qualifications"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('lead_id', 'crm', 'leads', 'owner_organization_id');
CREATE TRIGGER "qualifications_deal_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "crm"."qualifications"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('deal_id', 'commercial', 'deals', 'owner_organization_id');
CREATE TRIGGER "duplicate_candidates_left_resource_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "crm"."duplicate_candidates"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('left_resource_id', 'platform', 'resources', 'owner_organization_id');
CREATE TRIGGER "duplicate_candidates_right_resource_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "crm"."duplicate_candidates"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('right_resource_id', 'platform', 'resources', 'owner_organization_id');
CREATE TRIGGER "outreach_campaigns_lead_list_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."outreach_campaigns"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('lead_list_id', 'crm', 'lead_lists', 'owner_organization_id');
CREATE TRIGGER "outreach_campaigns_sequence_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."outreach_campaigns"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('sequence_id', 'comms', 'sequences', 'owner_organization_id');
CREATE TRIGGER "outreach_campaigns_sending_account_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."outreach_campaigns"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('sending_account_id', 'comms', 'sending_accounts', 'owner_organization_id');
CREATE TRIGGER "sequence_steps_sequence_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."sequence_steps"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('sequence_id', 'comms', 'sequences', 'owner_organization_id');
CREATE TRIGGER "sequence_steps_template_version_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."sequence_steps"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('template_version_id', 'comms', 'message_template_versions', 'owner_organization_id');
CREATE TRIGGER "campaign_recipients_campaign_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."campaign_recipients"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('campaign_id', 'comms', 'outreach_campaigns', 'owner_organization_id');
CREATE TRIGGER "campaign_recipients_lead_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."campaign_recipients"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('lead_id', 'crm', 'leads', 'owner_organization_id');
CREATE TRIGGER "campaign_recipients_contact_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."campaign_recipients"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('contact_id', 'crm', 'contacts', 'owner_organization_id');
CREATE TRIGGER "message_deliveries_campaign_recipient_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."message_deliveries"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('campaign_recipient_id', 'comms', 'campaign_recipients', 'owner_organization_id');
CREATE TRIGGER "message_deliveries_sequence_step_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."message_deliveries"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('sequence_step_id', 'comms', 'sequence_steps', 'owner_organization_id');
CREATE TRIGGER "message_deliveries_message_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."message_deliveries"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('message_id', 'comms', 'messages', 'owner_organization_id');
CREATE TRIGGER "conversations_lead_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."conversations"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('lead_id', 'crm', 'leads', 'owner_organization_id');
CREATE TRIGGER "conversations_deal_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."conversations"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('deal_id', 'commercial', 'deals', 'owner_organization_id');
CREATE TRIGGER "conversations_client_account_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."conversations"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('client_account_id', 'commercial', 'client_accounts', 'owner_organization_id');
CREATE TRIGGER "conversations_sending_account_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."conversations"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('sending_account_id', 'comms', 'sending_accounts', 'owner_organization_id');
CREATE TRIGGER "conversation_participants_conversation_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."conversation_participants"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('conversation_id', 'comms', 'conversations', 'owner_organization_id');
CREATE TRIGGER "messages_conversation_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."messages"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('conversation_id', 'comms', 'conversations', 'owner_organization_id');
CREATE TRIGGER "meetings_deal_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."meetings"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('deal_id', 'commercial', 'deals', 'owner_organization_id');
CREATE TRIGGER "meetings_client_account_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."meetings"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('client_account_id', 'commercial', 'client_accounts', 'owner_organization_id');
CREATE TRIGGER "meeting_participants_meeting_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."meeting_participants"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('meeting_id', 'comms', 'meetings', 'owner_organization_id');
CREATE TRIGGER "meeting_notes_meeting_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "comms"."meeting_notes"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('meeting_id', 'comms', 'meetings', 'owner_organization_id');
CREATE TRIGGER "deal_stages_pipeline_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "commercial"."deal_stages"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('pipeline_id', 'commercial', 'deal_pipelines', 'owner_organization_id');
CREATE TRIGGER "deals_company_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "commercial"."deals"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('company_id', 'crm', 'companies', 'owner_organization_id');
CREATE TRIGGER "deals_primary_contact_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "commercial"."deals"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('primary_contact_id', 'crm', 'contacts', 'owner_organization_id');
CREATE TRIGGER "deals_source_lead_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "commercial"."deals"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('source_lead_id', 'crm', 'leads', 'owner_organization_id');
CREATE TRIGGER "deals_pipeline_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "commercial"."deals"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('pipeline_id', 'commercial', 'deal_pipelines', 'owner_organization_id');
CREATE TRIGGER "deals_stage_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "commercial"."deals"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('stage_id', 'commercial', 'deal_stages', 'owner_organization_id');
CREATE TRIGGER "deal_stage_history_deal_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "commercial"."deal_stage_history"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('deal_id', 'commercial', 'deals', 'owner_organization_id');
CREATE TRIGGER "deal_stage_history_from_stage_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "commercial"."deal_stage_history"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('from_stage_id', 'commercial', 'deal_stages', 'owner_organization_id');
CREATE TRIGGER "deal_stage_history_to_stage_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "commercial"."deal_stage_history"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('to_stage_id', 'commercial', 'deal_stages', 'owner_organization_id');
CREATE TRIGGER "client_relationships_client_account_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "commercial"."client_relationships"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('client_account_id', 'commercial', 'client_accounts', 'owner_organization_id');
CREATE TRIGGER "client_relationships_contact_id_tenant_guard"
BEFORE INSERT OR UPDATE ON "commercial"."client_relationships"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('contact_id', 'crm', 'contacts', 'owner_organization_id');

CREATE TRIGGER "lead_sources_owner_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."lead_sources"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('owner_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "lead_sources_created_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."lead_sources"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('created_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "lead_sources_updated_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."lead_sources"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('updated_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "extraction_jobs_owner_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."extraction_jobs"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('owner_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "extraction_jobs_created_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."extraction_jobs"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('created_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "extraction_jobs_updated_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."extraction_jobs"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('updated_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "staged_records_reviewed_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."staged_records"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('reviewed_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "enrichment_jobs_owner_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."enrichment_jobs"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('owner_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "enrichment_jobs_created_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."enrichment_jobs"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('created_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "enrichment_jobs_updated_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."enrichment_jobs"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('updated_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "enrichment_facts_accepted_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."enrichment_facts"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('accepted_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "enrichment_facts_rejected_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."enrichment_facts"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('rejected_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "companies_owner_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."companies"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('owner_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "companies_created_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."companies"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('created_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "companies_updated_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."companies"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('updated_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "contacts_owner_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."contacts"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('owner_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "contacts_created_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."contacts"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('created_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "contacts_updated_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."contacts"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('updated_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "leads_owner_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."leads"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('owner_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "leads_created_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."leads"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('created_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "leads_updated_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."leads"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('updated_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "lead_status_history_actor_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."lead_status_history"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('actor_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "lead_lists_owner_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."lead_lists"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('owner_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "lead_lists_created_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."lead_lists"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('created_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "lead_lists_updated_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."lead_lists"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('updated_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "lead_list_members_added_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."lead_list_members"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('added_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "lead_list_members_removed_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."lead_list_members"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('removed_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "qualifications_owner_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."qualifications"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('owner_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "qualifications_reviewer_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."qualifications"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('reviewer_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "qualifications_created_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."qualifications"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('created_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "qualifications_updated_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."qualifications"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('updated_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "duplicate_candidates_owner_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."duplicate_candidates"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('owner_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "duplicate_candidates_resolved_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."duplicate_candidates"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('resolved_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "duplicate_candidates_created_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."duplicate_candidates"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('created_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "duplicate_candidates_updated_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."duplicate_candidates"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('updated_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "suppression_entries_owner_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."suppression_entries"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('owner_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "suppression_entries_created_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."suppression_entries"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('created_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "suppression_entries_updated_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "crm"."suppression_entries"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('updated_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "sending_accounts_owner_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."sending_accounts"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('owner_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "sending_accounts_created_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."sending_accounts"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('created_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "sending_accounts_updated_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."sending_accounts"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('updated_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "message_templates_owner_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."message_templates"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('owner_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "message_templates_created_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."message_templates"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('created_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "message_templates_updated_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."message_templates"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('updated_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "message_template_versions_approved_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."message_template_versions"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('approved_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "outreach_campaigns_owner_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."outreach_campaigns"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('owner_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "outreach_campaigns_approved_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."outreach_campaigns"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('approved_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "outreach_campaigns_created_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."outreach_campaigns"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('created_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "outreach_campaigns_updated_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."outreach_campaigns"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('updated_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "sequences_owner_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."sequences"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('owner_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "sequences_created_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."sequences"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('created_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "sequences_updated_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."sequences"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('updated_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "conversations_owner_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."conversations"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('owner_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "conversations_created_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."conversations"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('created_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "conversations_updated_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."conversations"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('updated_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "messages_sender_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."messages"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('sender_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "meetings_owner_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."meetings"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('owner_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "meetings_created_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."meetings"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('created_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "meetings_updated_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."meetings"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('updated_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "meeting_participants_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."meeting_participants"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "meeting_notes_author_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "comms"."meeting_notes"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('author_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "deal_pipelines_owner_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "commercial"."deal_pipelines"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('owner_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "deal_pipelines_created_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "commercial"."deal_pipelines"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('created_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "deal_pipelines_updated_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "commercial"."deal_pipelines"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('updated_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "deals_owner_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "commercial"."deals"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('owner_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "deals_created_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "commercial"."deals"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('created_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "deals_updated_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "commercial"."deals"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('updated_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "deal_stage_history_actor_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "commercial"."deal_stage_history"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('actor_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "client_accounts_owner_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "commercial"."client_accounts"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('owner_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "client_accounts_account_manager_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "commercial"."client_accounts"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('account_manager_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "client_accounts_created_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "commercial"."client_accounts"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('created_by_membership_id', 'iam', 'organization_memberships', 'organization_id');
CREATE TRIGGER "client_accounts_updated_by_membership_id_membership_guard"
BEFORE INSERT OR UPDATE ON "commercial"."client_accounts"
FOR EACH ROW EXECUTE FUNCTION "platform"."r6_assert_same_tenant_reference"('updated_by_membership_id', 'iam', 'organization_memberships', 'organization_id');

-- D15: template storage is an immutable approved-reference catalog in R6.
CREATE OR REPLACE FUNCTION "comms"."r6_reject_template_runtime_mutation"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF COALESCE(current_setting('app.r6_template_import', true), '') <> 'on' THEN
    RAISE EXCEPTION 'R6 template mutation is dormant; reviewed import mode required'
      USING ERRCODE = '55000';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER "message_templates_r6_import_only"
BEFORE INSERT OR UPDATE OR DELETE ON "comms"."message_templates"
FOR EACH ROW EXECUTE FUNCTION "comms"."r6_reject_template_runtime_mutation"();
CREATE TRIGGER "message_template_versions_r6_import_only"
BEFORE INSERT OR UPDATE OR DELETE ON "comms"."message_template_versions"
FOR EACH ROW EXECUTE FUNCTION "comms"."r6_reject_template_runtime_mutation"();

-- Immutable evidence/history rows never rewrite prior truth.
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

-- R6 command ceiling / basic shape checks.
ALTER TABLE "commercial"."deal_stages"
  ADD CONSTRAINT "deal_stages_r6_canonical_class" CHECK (
    "canonical_class" IN (
      'QUALIFIED','INTERESTED','DISCOVERY_SCHEDULED','DISCOVERY_COMPLETED',
      'PROPOSAL_PREPARATION','LOST','ON_HOLD','FOLLOW_UP_LATER','DISQUALIFIED'
    )
  ),
  ADD CONSTRAINT "deal_stages_probability_range" CHECK (
    "probability" IS NULL OR ("probability" >= 0 AND "probability" <= 1)
  );

ALTER TABLE "commercial"."deals"
  ADD CONSTRAINT "deals_probability_range" CHECK (
    "probability" IS NULL OR ("probability" >= 0 AND "probability" <= 1)
  ),
  ADD CONSTRAINT "deals_amount_nonnegative" CHECK (
    "amount_minor" IS NULL OR "amount_minor" >= 0
  );

ALTER TABLE "comms"."meetings"
  ADD CONSTRAINT "meetings_time_order" CHECK ("ends_at" > "starts_at");

ALTER TABLE "comms"."campaign_recipients"
  ADD CONSTRAINT "campaign_recipient_target_required" CHECK (
    ("lead_id" IS NOT NULL) <> ("contact_id" IS NOT NULL)
  );

ALTER TABLE "crm"."qualifications"
  ADD CONSTRAINT "qualification_target_required" CHECK (
    ("lead_id" IS NOT NULL) <> ("deal_id" IS NOT NULL)
  );

-- Database tenancy boundary: every R6 row has a direct owner discriminator.
GRANT USAGE ON SCHEMA "crm", "comms", "commercial" TO perspective_runtime;
GRANT SELECT ON TABLE "crm"."lead_sources" TO perspective_runtime;
GRANT SELECT ON TABLE "crm"."extraction_jobs" TO perspective_runtime;
GRANT SELECT ON TABLE "crm"."staged_records" TO perspective_runtime;
GRANT SELECT ON TABLE "crm"."enrichment_jobs" TO perspective_runtime;
GRANT SELECT ON TABLE "crm"."enrichment_facts" TO perspective_runtime;
GRANT SELECT ON TABLE "crm"."companies" TO perspective_runtime;
GRANT SELECT ON TABLE "crm"."contacts" TO perspective_runtime;
GRANT SELECT ON TABLE "crm"."leads" TO perspective_runtime;
GRANT SELECT ON TABLE "crm"."lead_scores" TO perspective_runtime;
GRANT SELECT ON TABLE "crm"."lead_status_history" TO perspective_runtime;
GRANT SELECT ON TABLE "crm"."lead_lists" TO perspective_runtime;
GRANT SELECT ON TABLE "crm"."lead_list_members" TO perspective_runtime;
GRANT SELECT ON TABLE "crm"."qualifications" TO perspective_runtime;
GRANT SELECT ON TABLE "crm"."duplicate_candidates" TO perspective_runtime;
GRANT SELECT ON TABLE "crm"."suppression_entries" TO perspective_runtime;
GRANT SELECT ON TABLE "comms"."sending_accounts" TO perspective_runtime;
GRANT SELECT ON TABLE "comms"."message_templates" TO perspective_runtime;
GRANT SELECT ON TABLE "comms"."message_template_versions" TO perspective_runtime;
GRANT SELECT ON TABLE "comms"."outreach_campaigns" TO perspective_runtime;
GRANT SELECT ON TABLE "comms"."sequences" TO perspective_runtime;
GRANT SELECT ON TABLE "comms"."sequence_steps" TO perspective_runtime;
GRANT SELECT ON TABLE "comms"."campaign_recipients" TO perspective_runtime;
GRANT SELECT ON TABLE "comms"."message_deliveries" TO perspective_runtime;
GRANT SELECT ON TABLE "comms"."conversations" TO perspective_runtime;
GRANT SELECT ON TABLE "comms"."conversation_participants" TO perspective_runtime;
GRANT SELECT ON TABLE "comms"."messages" TO perspective_runtime;
GRANT SELECT ON TABLE "comms"."meetings" TO perspective_runtime;
GRANT SELECT ON TABLE "comms"."meeting_participants" TO perspective_runtime;
GRANT SELECT ON TABLE "comms"."meeting_notes" TO perspective_runtime;
GRANT SELECT ON TABLE "commercial"."deal_pipelines" TO perspective_runtime;
GRANT SELECT ON TABLE "commercial"."deal_stages" TO perspective_runtime;
GRANT SELECT ON TABLE "commercial"."deals" TO perspective_runtime;
GRANT SELECT ON TABLE "commercial"."deal_stage_history" TO perspective_runtime;
GRANT SELECT ON TABLE "commercial"."client_accounts" TO perspective_runtime;
GRANT SELECT ON TABLE "commercial"."client_relationships" TO perspective_runtime;

ALTER TABLE "crm"."lead_sources" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crm"."lead_sources" FORCE ROW LEVEL SECURITY;
CREATE POLICY "lead_sources_r6_owner_select" ON "crm"."lead_sources"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "lead_sources_r6_owner_mutate" ON "crm"."lead_sources"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "crm"."extraction_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crm"."extraction_jobs" FORCE ROW LEVEL SECURITY;
CREATE POLICY "extraction_jobs_r6_owner_select" ON "crm"."extraction_jobs"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "extraction_jobs_r6_owner_mutate" ON "crm"."extraction_jobs"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "crm"."staged_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crm"."staged_records" FORCE ROW LEVEL SECURITY;
CREATE POLICY "staged_records_r6_owner_select" ON "crm"."staged_records"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "staged_records_r6_owner_mutate" ON "crm"."staged_records"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "crm"."enrichment_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crm"."enrichment_jobs" FORCE ROW LEVEL SECURITY;
CREATE POLICY "enrichment_jobs_r6_owner_select" ON "crm"."enrichment_jobs"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "enrichment_jobs_r6_owner_mutate" ON "crm"."enrichment_jobs"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "crm"."enrichment_facts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crm"."enrichment_facts" FORCE ROW LEVEL SECURITY;
CREATE POLICY "enrichment_facts_r6_owner_select" ON "crm"."enrichment_facts"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "enrichment_facts_r6_owner_mutate" ON "crm"."enrichment_facts"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "crm"."companies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crm"."companies" FORCE ROW LEVEL SECURITY;
CREATE POLICY "companies_r6_owner_select" ON "crm"."companies"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "companies_r6_owner_mutate" ON "crm"."companies"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "crm"."contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crm"."contacts" FORCE ROW LEVEL SECURITY;
CREATE POLICY "contacts_r6_owner_select" ON "crm"."contacts"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "contacts_r6_owner_mutate" ON "crm"."contacts"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "crm"."leads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crm"."leads" FORCE ROW LEVEL SECURITY;
CREATE POLICY "leads_r6_owner_select" ON "crm"."leads"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "leads_r6_owner_mutate" ON "crm"."leads"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "crm"."lead_scores" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crm"."lead_scores" FORCE ROW LEVEL SECURITY;
CREATE POLICY "lead_scores_r6_owner_select" ON "crm"."lead_scores"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "lead_scores_r6_owner_mutate" ON "crm"."lead_scores"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "crm"."lead_status_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crm"."lead_status_history" FORCE ROW LEVEL SECURITY;
CREATE POLICY "lead_status_history_r6_owner_select" ON "crm"."lead_status_history"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "lead_status_history_r6_owner_mutate" ON "crm"."lead_status_history"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "crm"."lead_lists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crm"."lead_lists" FORCE ROW LEVEL SECURITY;
CREATE POLICY "lead_lists_r6_owner_select" ON "crm"."lead_lists"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "lead_lists_r6_owner_mutate" ON "crm"."lead_lists"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "crm"."lead_list_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crm"."lead_list_members" FORCE ROW LEVEL SECURITY;
CREATE POLICY "lead_list_members_r6_owner_select" ON "crm"."lead_list_members"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "lead_list_members_r6_owner_mutate" ON "crm"."lead_list_members"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "crm"."qualifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crm"."qualifications" FORCE ROW LEVEL SECURITY;
CREATE POLICY "qualifications_r6_owner_select" ON "crm"."qualifications"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "qualifications_r6_owner_mutate" ON "crm"."qualifications"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "crm"."duplicate_candidates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crm"."duplicate_candidates" FORCE ROW LEVEL SECURITY;
CREATE POLICY "duplicate_candidates_r6_owner_select" ON "crm"."duplicate_candidates"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "duplicate_candidates_r6_owner_mutate" ON "crm"."duplicate_candidates"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "crm"."suppression_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "crm"."suppression_entries" FORCE ROW LEVEL SECURITY;
CREATE POLICY "suppression_entries_r6_owner_select" ON "crm"."suppression_entries"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "suppression_entries_r6_owner_mutate" ON "crm"."suppression_entries"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "comms"."sending_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comms"."sending_accounts" FORCE ROW LEVEL SECURITY;
CREATE POLICY "sending_accounts_r6_owner_select" ON "comms"."sending_accounts"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "sending_accounts_r6_owner_mutate" ON "comms"."sending_accounts"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "comms"."message_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comms"."message_templates" FORCE ROW LEVEL SECURITY;
CREATE POLICY "message_templates_r6_owner_select" ON "comms"."message_templates"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "message_templates_r6_owner_mutate" ON "comms"."message_templates"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "comms"."message_template_versions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comms"."message_template_versions" FORCE ROW LEVEL SECURITY;
CREATE POLICY "message_template_versions_r6_owner_select" ON "comms"."message_template_versions"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "message_template_versions_r6_owner_mutate" ON "comms"."message_template_versions"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "comms"."outreach_campaigns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comms"."outreach_campaigns" FORCE ROW LEVEL SECURITY;
CREATE POLICY "outreach_campaigns_r6_owner_select" ON "comms"."outreach_campaigns"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "outreach_campaigns_r6_owner_mutate" ON "comms"."outreach_campaigns"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "comms"."sequences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comms"."sequences" FORCE ROW LEVEL SECURITY;
CREATE POLICY "sequences_r6_owner_select" ON "comms"."sequences"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "sequences_r6_owner_mutate" ON "comms"."sequences"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "comms"."sequence_steps" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comms"."sequence_steps" FORCE ROW LEVEL SECURITY;
CREATE POLICY "sequence_steps_r6_owner_select" ON "comms"."sequence_steps"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "sequence_steps_r6_owner_mutate" ON "comms"."sequence_steps"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "comms"."campaign_recipients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comms"."campaign_recipients" FORCE ROW LEVEL SECURITY;
CREATE POLICY "campaign_recipients_r6_owner_select" ON "comms"."campaign_recipients"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "campaign_recipients_r6_owner_mutate" ON "comms"."campaign_recipients"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "comms"."message_deliveries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comms"."message_deliveries" FORCE ROW LEVEL SECURITY;
CREATE POLICY "message_deliveries_r6_owner_select" ON "comms"."message_deliveries"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "message_deliveries_r6_owner_mutate" ON "comms"."message_deliveries"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "comms"."conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comms"."conversations" FORCE ROW LEVEL SECURITY;
CREATE POLICY "conversations_r6_owner_select" ON "comms"."conversations"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "conversations_r6_owner_mutate" ON "comms"."conversations"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "comms"."conversation_participants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comms"."conversation_participants" FORCE ROW LEVEL SECURITY;
CREATE POLICY "conversation_participants_r6_owner_select" ON "comms"."conversation_participants"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "conversation_participants_r6_owner_mutate" ON "comms"."conversation_participants"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "comms"."messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comms"."messages" FORCE ROW LEVEL SECURITY;
CREATE POLICY "messages_r6_owner_select" ON "comms"."messages"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "messages_r6_owner_mutate" ON "comms"."messages"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "comms"."meetings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comms"."meetings" FORCE ROW LEVEL SECURITY;
CREATE POLICY "meetings_r6_owner_select" ON "comms"."meetings"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "meetings_r6_owner_mutate" ON "comms"."meetings"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "comms"."meeting_participants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comms"."meeting_participants" FORCE ROW LEVEL SECURITY;
CREATE POLICY "meeting_participants_r6_owner_select" ON "comms"."meeting_participants"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "meeting_participants_r6_owner_mutate" ON "comms"."meeting_participants"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "comms"."meeting_notes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comms"."meeting_notes" FORCE ROW LEVEL SECURITY;
CREATE POLICY "meeting_notes_r6_owner_select" ON "comms"."meeting_notes"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "meeting_notes_r6_owner_mutate" ON "comms"."meeting_notes"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "commercial"."deal_pipelines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commercial"."deal_pipelines" FORCE ROW LEVEL SECURITY;
CREATE POLICY "deal_pipelines_r6_owner_select" ON "commercial"."deal_pipelines"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "deal_pipelines_r6_owner_mutate" ON "commercial"."deal_pipelines"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "commercial"."deal_stages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commercial"."deal_stages" FORCE ROW LEVEL SECURITY;
CREATE POLICY "deal_stages_r6_owner_select" ON "commercial"."deal_stages"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "deal_stages_r6_owner_mutate" ON "commercial"."deal_stages"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "commercial"."deals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commercial"."deals" FORCE ROW LEVEL SECURITY;
CREATE POLICY "deals_r6_owner_select" ON "commercial"."deals"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "deals_r6_owner_mutate" ON "commercial"."deals"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "commercial"."deal_stage_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commercial"."deal_stage_history" FORCE ROW LEVEL SECURITY;
CREATE POLICY "deal_stage_history_r6_owner_select" ON "commercial"."deal_stage_history"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "deal_stage_history_r6_owner_mutate" ON "commercial"."deal_stage_history"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "commercial"."client_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commercial"."client_accounts" FORCE ROW LEVEL SECURITY;
CREATE POLICY "client_accounts_r6_owner_select" ON "commercial"."client_accounts"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "client_accounts_r6_owner_mutate" ON "commercial"."client_accounts"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
ALTER TABLE "commercial"."client_relationships" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "commercial"."client_relationships" FORCE ROW LEVEL SECURITY;
CREATE POLICY "client_relationships_r6_owner_select" ON "commercial"."client_relationships"
  FOR SELECT USING ("owner_organization_id" = "platform"."current_organization_id"());
CREATE POLICY "client_relationships_r6_owner_mutate" ON "commercial"."client_relationships"
  FOR ALL USING ("owner_organization_id" = "platform"."current_organization_id"())
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());

-- The restricted role remains read-only on R6 tables. Authorized writes use
-- server-owned transactions with trusted tenant claims; no browser/client value
-- can elevate the runtime role into broad DML.
