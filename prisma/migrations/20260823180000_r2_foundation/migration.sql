-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "audit";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "iam";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "platform";

-- Required for normalized email/domain identity fields.
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateEnum
CREATE TYPE "iam"."OrganizationType" AS ENUM ('PLATFORM', 'CLIENT', 'PARTNER', 'VENDOR');

-- CreateEnum
CREATE TYPE "iam"."RecordStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "iam"."AccountState" AS ENUM ('PENDING', 'ACTIVE', 'LOCKED', 'DISABLED');

-- CreateEnum
CREATE TYPE "iam"."IdentityProvider" AS ENUM ('PASSWORD', 'GOOGLE', 'MICROSOFT', 'SAML', 'OIDC');

-- CreateEnum
CREATE TYPE "iam"."MembershipType" AS ENUM ('STAFF', 'CLIENT', 'PARTNER', 'VENDOR');

-- CreateEnum
CREATE TYPE "iam"."MembershipStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED', 'ENDED');

-- CreateEnum
CREATE TYPE "iam"."RoleScope" AS ENUM ('ORG', 'DEPT', 'ASN', 'OWN', 'CLIENT', 'READ', 'NONE');

-- CreateEnum
CREATE TYPE "iam"."PermissionEffect" AS ENUM ('ALLOW', 'DENY');

-- CreateEnum
CREATE TYPE "iam"."MfaMethodType" AS ENUM ('TOTP', 'WEBAUTHN', 'RECOVERY_CODES');

-- CreateEnum
CREATE TYPE "platform"."Visibility" AS ENUM ('INTERNAL', 'CLIENT_SHARED', 'PUBLIC');

-- CreateEnum
CREATE TYPE "platform"."Sensitivity" AS ENUM ('STANDARD', 'CONFIDENTIAL', 'PII', 'FINANCIAL', 'SECURITY', 'SECRET');

-- CreateEnum
CREATE TYPE "platform"."ProcessingStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED', 'DEAD_LETTER');

-- CreateEnum
CREATE TYPE "platform"."IdempotencyState" AS ENUM ('STARTED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "platform"."CallbackStatus" AS ENUM ('RECEIVED', 'VALIDATED', 'PROCESSED', 'REJECTED', 'FAILED');

-- CreateEnum
CREATE TYPE "platform"."AutomationRunStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'PAUSED', 'CANCELLED', 'NEEDS_ATTENTION');

-- CreateEnum
CREATE TYPE "platform"."IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "platform"."IncidentStatus" AS ENUM ('INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "platform"."ReconciliationStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "audit"."AuditActorType" AS ENUM ('USER', 'SYSTEM', 'SERVICE');

-- CreateTable
CREATE TABLE "iam"."organizations" (
    "id" UUID NOT NULL,
    "organization_type" "iam"."OrganizationType" NOT NULL,
    "legal_name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "normalized_domain" CITEXT,
    "status" "iam"."RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "parent_organization_id" UUID,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."people" (
    "id" UUID NOT NULL,
    "display_name" TEXT NOT NULL,
    "given_name" TEXT,
    "family_name" TEXT,
    "email_original" TEXT,
    "email_normalized" CITEXT,
    "phone_masked" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "people_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."user_accounts" (
    "id" UUID NOT NULL,
    "person_id" UUID NOT NULL,
    "account_state" "iam"."AccountState" NOT NULL DEFAULT 'PENDING',
    "email_verified_at" TIMESTAMPTZ(6),
    "last_login_at" TIMESTAMPTZ(6),
    "locked_until" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."user_identities" (
    "id" UUID NOT NULL,
    "user_account_id" UUID NOT NULL,
    "provider" "iam"."IdentityProvider" NOT NULL,
    "provider_subject" TEXT NOT NULL,
    "credential_reference" TEXT,
    "last_used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_identities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."departments" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parent_department_id" UUID,
    "manager_membership_id" UUID,
    "status" "iam"."RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."organization_memberships" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "user_account_id" UUID NOT NULL,
    "membership_type" "iam"."MembershipType" NOT NULL,
    "title" TEXT,
    "department_id" UUID,
    "manager_membership_id" UUID,
    "status" "iam"."MembershipStatus" NOT NULL DEFAULT 'INVITED',
    "joined_at" TIMESTAMPTZ(6),
    "ended_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "organization_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."roles" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "system_role" BOOLEAN NOT NULL DEFAULT false,
    "default_scope" "iam"."RoleScope" NOT NULL DEFAULT 'NONE',
    "status" "iam"."RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."permissions" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "risk_level" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."role_permissions" (
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "effect" "iam"."PermissionEffect" NOT NULL DEFAULT 'ALLOW',
    "constraints" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id","permission_id")
);

-- CreateTable
CREATE TABLE "iam"."membership_roles" (
    "id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "scope" "iam"."RoleScope" NOT NULL,
    "valid_from" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "membership_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."sessions" (
    "id" UUID NOT NULL,
    "user_account_id" UUID NOT NULL,
    "active_membership_id" UUID,
    "token_hash" TEXT NOT NULL,
    "device_id" TEXT,
    "ip_hash" TEXT,
    "issued_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "revoked_at" TIMESTAMPTZ(6),
    "revoke_reason" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."mfa_methods" (
    "id" UUID NOT NULL,
    "user_account_id" UUID NOT NULL,
    "method_type" "iam"."MfaMethodType" NOT NULL,
    "secret_reference" TEXT,
    "key_fingerprint" TEXT NOT NULL,
    "verified_at" TIMESTAMPTZ(6),
    "last_used_at" TIMESTAMPTZ(6),
    "disabled_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mfa_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."invitations" (
    "id" UUID NOT NULL,
    "organization_id" UUID NOT NULL,
    "email_normalized" CITEXT NOT NULL,
    "intended_role_id" UUID,
    "token_hash" TEXT NOT NULL,
    "inviter_membership_id" UUID,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "accepted_at" TIMESTAMPTZ(6),
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."recovery_challenges" (
    "id" UUID NOT NULL,
    "user_account_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "consumed_at" TIMESTAMPTZ(6),
    "revoked_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recovery_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."resources" (
    "id" UUID NOT NULL,
    "resource_type" TEXT NOT NULL,
    "title" TEXT,
    "owner_organization_id" UUID NOT NULL,
    "client_organization_id" UUID,
    "project_id" UUID,
    "visibility" "platform"."Visibility" NOT NULL DEFAULT 'INTERNAL',
    "sensitivity" "platform"."Sensitivity" NOT NULL DEFAULT 'STANDARD',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived_at" TIMESTAMPTZ(6),

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."idempotency_receipts" (
    "id" UUID NOT NULL,
    "owner_organization_id" UUID NOT NULL,
    "scope" TEXT NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "request_hash" TEXT NOT NULL,
    "state" "platform"."IdempotencyState" NOT NULL DEFAULT 'STARTED',
    "response_status" INTEGER,
    "response_hash" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "idempotency_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."outbox_events" (
    "id" UUID NOT NULL,
    "owner_organization_id" UUID NOT NULL,
    "aggregate_resource_id" UUID,
    "event_type" TEXT NOT NULL,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "payload" JSONB NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "status" "platform"."ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "available_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."outbox_delivery_attempts" (
    "id" UUID NOT NULL,
    "outbox_event_id" UUID NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "status" "platform"."ProcessingStatus" NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "finished_at" TIMESTAMPTZ(6),
    "request_hash" TEXT,
    "response_hash" TEXT,
    "error_code" TEXT,
    "error_summary" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "outbox_delivery_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."callback_receipts" (
    "id" UUID NOT NULL,
    "owner_organization_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "external_event_id" TEXT NOT NULL,
    "connection_reference" TEXT,
    "signature_valid" BOOLEAN NOT NULL,
    "payload_hash" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "platform"."CallbackStatus" NOT NULL DEFAULT 'RECEIVED',
    "received_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMPTZ(6),

    CONSTRAINT "callback_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."callback_attempts" (
    "id" UUID NOT NULL,
    "callback_receipt_id" UUID NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "status" "platform"."ProcessingStatus" NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "finished_at" TIMESTAMPTZ(6),
    "result_hash" TEXT,
    "error_code" TEXT,
    "error_summary" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "callback_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."automation_runs" (
    "id" UUID NOT NULL,
    "owner_organization_id" UUID NOT NULL,
    "workflow_key" TEXT NOT NULL,
    "trigger_key" TEXT NOT NULL,
    "root_run_id" UUID,
    "parent_run_id" UUID,
    "execution_number" INTEGER NOT NULL DEFAULT 1,
    "status" "platform"."AutomationRunStatus" NOT NULL DEFAULT 'QUEUED',
    "input_hash" TEXT NOT NULL,
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."automation_step_attempts" (
    "id" UUID NOT NULL,
    "automation_run_id" UUID NOT NULL,
    "step_key" TEXT NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "status" "platform"."ProcessingStatus" NOT NULL,
    "input_hash" TEXT NOT NULL,
    "output_hash" TEXT,
    "error_code" TEXT,
    "error_summary" TEXT,
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "finished_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_step_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."incidents" (
    "id" UUID NOT NULL,
    "owner_organization_id" UUID NOT NULL,
    "incident_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" "platform"."IncidentSeverity" NOT NULL,
    "status" "platform"."IncidentStatus" NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "resolved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."incident_events" (
    "id" UUID NOT NULL,
    "incident_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "actor_membership_id" UUID,
    "previous_status" TEXT,
    "new_status" TEXT,
    "summary" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."reconciliation_runs" (
    "id" UUID NOT NULL,
    "owner_organization_id" UUID NOT NULL,
    "reconciliation_type" TEXT NOT NULL,
    "scope_key" TEXT NOT NULL,
    "status" "platform"."ReconciliationStatus" NOT NULL DEFAULT 'PENDING',
    "cutoff_at" TIMESTAMPTZ(6),
    "started_at" TIMESTAMPTZ(6),
    "finished_at" TIMESTAMPTZ(6),
    "result_hash" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reconciliation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform"."reconciliation_findings" (
    "id" UUID NOT NULL,
    "reconciliation_run_id" UUID NOT NULL,
    "resource_id" UUID,
    "finding_key" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "expected_hash" TEXT,
    "actual_hash" TEXT,
    "details" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reconciliation_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit"."audit_events" (
    "id" UUID NOT NULL,
    "owner_organization_id" UUID NOT NULL,
    "target_resource_id" UUID,
    "actor_type" "audit"."AuditActorType" NOT NULL,
    "actor_user_id" UUID,
    "actor_membership_id" UUID,
    "action" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "correlation_id" TEXT,
    "causation_id" TEXT,
    "before_hash" TEXT,
    "after_hash" TEXT,
    "redacted_diff" JSONB,
    "ip_hash" TEXT,
    "device_id" TEXT,
    "reason" TEXT,
    "idempotency_key" TEXT,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "organizations_organization_type_status_idx" ON "iam"."organizations"("organization_type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_slug_key" ON "iam"."organizations"("slug");

-- CreateIndex
CREATE INDEX "people_email_normalized_idx" ON "iam"."people"("email_normalized");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_person_id_key" ON "iam"."user_accounts"("person_id");

-- CreateIndex
CREATE INDEX "user_identities_user_account_id_idx" ON "iam"."user_identities"("user_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_identities_provider_provider_subject_key" ON "iam"."user_identities"("provider", "provider_subject");

-- CreateIndex
CREATE INDEX "departments_organization_id_status_idx" ON "iam"."departments"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "departments_organization_id_slug_key" ON "iam"."departments"("organization_id", "slug");

-- CreateIndex
CREATE INDEX "organization_memberships_organization_id_status_idx" ON "iam"."organization_memberships"("organization_id", "status");

-- CreateIndex
CREATE INDEX "organization_memberships_user_account_id_status_idx" ON "iam"."organization_memberships"("user_account_id", "status");

-- CreateIndex
CREATE INDEX "organization_memberships_department_id_status_idx" ON "iam"."organization_memberships"("department_id", "status");

-- CreateIndex
CREATE INDEX "roles_organization_id_status_idx" ON "iam"."roles"("organization_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "roles_organization_id_key_key" ON "iam"."roles"("organization_id", "key");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_key_key" ON "iam"."permissions"("key");

-- CreateIndex
CREATE INDEX "permissions_domain_action_idx" ON "iam"."permissions"("domain", "action");

-- CreateIndex
CREATE INDEX "membership_roles_membership_id_valid_until_idx" ON "iam"."membership_roles"("membership_id", "valid_until");

-- CreateIndex
CREATE INDEX "membership_roles_role_id_idx" ON "iam"."membership_roles"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "iam"."sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_account_id_expires_at_idx" ON "iam"."sessions"("user_account_id", "expires_at");

-- CreateIndex
CREATE INDEX "sessions_active_membership_id_expires_at_idx" ON "iam"."sessions"("active_membership_id", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "mfa_methods_user_account_id_method_type_key_fingerprint_key" ON "iam"."mfa_methods"("user_account_id", "method_type", "key_fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "invitations_token_hash_key" ON "iam"."invitations"("token_hash");

-- CreateIndex
CREATE INDEX "invitations_organization_id_email_normalized_idx" ON "iam"."invitations"("organization_id", "email_normalized");

-- CreateIndex
CREATE UNIQUE INDEX "recovery_challenges_token_hash_key" ON "iam"."recovery_challenges"("token_hash");

-- CreateIndex
CREATE INDEX "recovery_challenges_user_account_id_expires_at_idx" ON "iam"."recovery_challenges"("user_account_id", "expires_at");

-- CreateIndex
CREATE INDEX "resources_owner_organization_id_resource_type_archived_at_idx" ON "platform"."resources"("owner_organization_id", "resource_type", "archived_at");

-- CreateIndex
CREATE INDEX "resources_client_organization_id_visibility_created_at_idx" ON "platform"."resources"("client_organization_id", "visibility", "created_at" DESC);

-- CreateIndex
CREATE INDEX "resources_project_id_resource_type_idx" ON "platform"."resources"("project_id", "resource_type");

-- CreateIndex
CREATE INDEX "idempotency_receipts_owner_organization_id_state_expires_at_idx" ON "platform"."idempotency_receipts"("owner_organization_id", "state", "expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_receipts_owner_organization_id_scope_idempotenc_key" ON "platform"."idempotency_receipts"("owner_organization_id", "scope", "idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "outbox_events_idempotency_key_key" ON "platform"."outbox_events"("idempotency_key");

-- CreateIndex
CREATE INDEX "outbox_events_owner_organization_id_status_available_at_idx" ON "platform"."outbox_events"("owner_organization_id", "status", "available_at");

-- CreateIndex
CREATE INDEX "outbox_delivery_attempts_status_started_at_idx" ON "platform"."outbox_delivery_attempts"("status", "started_at");

-- CreateIndex
CREATE UNIQUE INDEX "outbox_delivery_attempts_outbox_event_id_attempt_number_key" ON "platform"."outbox_delivery_attempts"("outbox_event_id", "attempt_number");

-- CreateIndex
CREATE INDEX "callback_receipts_owner_organization_id_status_received_at_idx" ON "platform"."callback_receipts"("owner_organization_id", "status", "received_at");

-- CreateIndex
CREATE UNIQUE INDEX "callback_receipts_provider_external_event_id_key" ON "platform"."callback_receipts"("provider", "external_event_id");

-- CreateIndex
CREATE UNIQUE INDEX "callback_attempts_callback_receipt_id_attempt_number_key" ON "platform"."callback_attempts"("callback_receipt_id", "attempt_number");

-- CreateIndex
CREATE INDEX "automation_runs_owner_organization_id_status_created_at_idx" ON "platform"."automation_runs"("owner_organization_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "automation_runs_workflow_key_status_created_at_idx" ON "platform"."automation_runs"("workflow_key", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "automation_runs_root_run_id_execution_number_key" ON "platform"."automation_runs"("root_run_id", "execution_number");

-- CreateIndex
CREATE UNIQUE INDEX "automation_step_attempts_automation_run_id_step_key_attempt_key" ON "platform"."automation_step_attempts"("automation_run_id", "step_key", "attempt_number");

-- CreateIndex
CREATE INDEX "incidents_owner_organization_id_status_started_at_idx" ON "platform"."incidents"("owner_organization_id", "status", "started_at");

-- CreateIndex
CREATE UNIQUE INDEX "incidents_owner_organization_id_incident_key_key" ON "platform"."incidents"("owner_organization_id", "incident_key");

-- CreateIndex
CREATE INDEX "incident_events_incident_id_occurred_at_idx" ON "platform"."incident_events"("incident_id", "occurred_at");

-- CreateIndex
CREATE INDEX "reconciliation_runs_owner_organization_id_status_created_at_idx" ON "platform"."reconciliation_runs"("owner_organization_id", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "reconciliation_findings_reconciliation_run_id_finding_key_key" ON "platform"."reconciliation_findings"("reconciliation_run_id", "finding_key");

-- CreateIndex
CREATE UNIQUE INDEX "audit_events_idempotency_key_key" ON "audit"."audit_events"("idempotency_key");

-- CreateIndex
CREATE INDEX "audit_events_owner_organization_id_occurred_at_idx" ON "audit"."audit_events"("owner_organization_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "audit_events_target_resource_id_occurred_at_idx" ON "audit"."audit_events"("target_resource_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "audit_events_actor_user_id_occurred_at_idx" ON "audit"."audit_events"("actor_user_id", "occurred_at" DESC);

-- CreateIndex
CREATE INDEX "audit_events_request_id_idx" ON "audit"."audit_events"("request_id");

-- AddForeignKey
ALTER TABLE "iam"."organizations" ADD CONSTRAINT "organizations_parent_organization_id_fkey" FOREIGN KEY ("parent_organization_id") REFERENCES "iam"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."user_accounts" ADD CONSTRAINT "user_accounts_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "iam"."people"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."user_identities" ADD CONSTRAINT "user_identities_user_account_id_fkey" FOREIGN KEY ("user_account_id") REFERENCES "iam"."user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."departments" ADD CONSTRAINT "departments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "iam"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."departments" ADD CONSTRAINT "departments_parent_department_id_fkey" FOREIGN KEY ("parent_department_id") REFERENCES "iam"."departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."departments" ADD CONSTRAINT "departments_manager_membership_id_fkey" FOREIGN KEY ("manager_membership_id") REFERENCES "iam"."organization_memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."organization_memberships" ADD CONSTRAINT "organization_memberships_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "iam"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."organization_memberships" ADD CONSTRAINT "organization_memberships_user_account_id_fkey" FOREIGN KEY ("user_account_id") REFERENCES "iam"."user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."organization_memberships" ADD CONSTRAINT "organization_memberships_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "iam"."departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."organization_memberships" ADD CONSTRAINT "organization_memberships_manager_membership_id_fkey" FOREIGN KEY ("manager_membership_id") REFERENCES "iam"."organization_memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."roles" ADD CONSTRAINT "roles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "iam"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "iam"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "iam"."permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."membership_roles" ADD CONSTRAINT "membership_roles_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "iam"."organization_memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."membership_roles" ADD CONSTRAINT "membership_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "iam"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."sessions" ADD CONSTRAINT "sessions_user_account_id_fkey" FOREIGN KEY ("user_account_id") REFERENCES "iam"."user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."sessions" ADD CONSTRAINT "sessions_active_membership_id_fkey" FOREIGN KEY ("active_membership_id") REFERENCES "iam"."organization_memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."mfa_methods" ADD CONSTRAINT "mfa_methods_user_account_id_fkey" FOREIGN KEY ("user_account_id") REFERENCES "iam"."user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."invitations" ADD CONSTRAINT "invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "iam"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."invitations" ADD CONSTRAINT "invitations_intended_role_id_fkey" FOREIGN KEY ("intended_role_id") REFERENCES "iam"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."invitations" ADD CONSTRAINT "invitations_inviter_membership_id_fkey" FOREIGN KEY ("inviter_membership_id") REFERENCES "iam"."organization_memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."recovery_challenges" ADD CONSTRAINT "recovery_challenges_user_account_id_fkey" FOREIGN KEY ("user_account_id") REFERENCES "iam"."user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."resources" ADD CONSTRAINT "resources_owner_organization_id_fkey" FOREIGN KEY ("owner_organization_id") REFERENCES "iam"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."resources" ADD CONSTRAINT "resources_client_organization_id_fkey" FOREIGN KEY ("client_organization_id") REFERENCES "iam"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."idempotency_receipts" ADD CONSTRAINT "idempotency_receipts_owner_organization_id_fkey" FOREIGN KEY ("owner_organization_id") REFERENCES "iam"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."outbox_events" ADD CONSTRAINT "outbox_events_owner_organization_id_fkey" FOREIGN KEY ("owner_organization_id") REFERENCES "iam"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."outbox_events" ADD CONSTRAINT "outbox_events_aggregate_resource_id_fkey" FOREIGN KEY ("aggregate_resource_id") REFERENCES "platform"."resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."outbox_delivery_attempts" ADD CONSTRAINT "outbox_delivery_attempts_outbox_event_id_fkey" FOREIGN KEY ("outbox_event_id") REFERENCES "platform"."outbox_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."callback_receipts" ADD CONSTRAINT "callback_receipts_owner_organization_id_fkey" FOREIGN KEY ("owner_organization_id") REFERENCES "iam"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."callback_attempts" ADD CONSTRAINT "callback_attempts_callback_receipt_id_fkey" FOREIGN KEY ("callback_receipt_id") REFERENCES "platform"."callback_receipts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."automation_runs" ADD CONSTRAINT "automation_runs_owner_organization_id_fkey" FOREIGN KEY ("owner_organization_id") REFERENCES "iam"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."automation_runs" ADD CONSTRAINT "automation_runs_root_run_id_fkey" FOREIGN KEY ("root_run_id") REFERENCES "platform"."automation_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."automation_runs" ADD CONSTRAINT "automation_runs_parent_run_id_fkey" FOREIGN KEY ("parent_run_id") REFERENCES "platform"."automation_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."automation_step_attempts" ADD CONSTRAINT "automation_step_attempts_automation_run_id_fkey" FOREIGN KEY ("automation_run_id") REFERENCES "platform"."automation_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."incidents" ADD CONSTRAINT "incidents_owner_organization_id_fkey" FOREIGN KEY ("owner_organization_id") REFERENCES "iam"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."incident_events" ADD CONSTRAINT "incident_events_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "platform"."incidents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."incident_events" ADD CONSTRAINT "incident_events_actor_membership_id_fkey" FOREIGN KEY ("actor_membership_id") REFERENCES "iam"."organization_memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."reconciliation_runs" ADD CONSTRAINT "reconciliation_runs_owner_organization_id_fkey" FOREIGN KEY ("owner_organization_id") REFERENCES "iam"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."reconciliation_findings" ADD CONSTRAINT "reconciliation_findings_reconciliation_run_id_fkey" FOREIGN KEY ("reconciliation_run_id") REFERENCES "platform"."reconciliation_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform"."reconciliation_findings" ADD CONSTRAINT "reconciliation_findings_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "platform"."resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit"."audit_events" ADD CONSTRAINT "audit_events_owner_organization_id_fkey" FOREIGN KEY ("owner_organization_id") REFERENCES "iam"."organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit"."audit_events" ADD CONSTRAINT "audit_events_target_resource_id_fkey" FOREIGN KEY ("target_resource_id") REFERENCES "platform"."resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit"."audit_events" ADD CONSTRAINT "audit_events_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "iam"."user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit"."audit_events" ADD CONSTRAINT "audit_events_actor_membership_id_fkey" FOREIGN KEY ("actor_membership_id") REFERENCES "iam"."organization_memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- R2 custom integrity constraints that Prisma cannot express.
ALTER TABLE "iam"."organizations"
  ADD CONSTRAINT "organizations_parent_not_self" CHECK ("parent_organization_id" IS NULL OR "parent_organization_id" <> "id");

ALTER TABLE "iam"."departments"
  ADD CONSTRAINT "departments_parent_not_self" CHECK ("parent_department_id" IS NULL OR "parent_department_id" <> "id");

ALTER TABLE "iam"."organization_memberships"
  ADD CONSTRAINT "organization_memberships_dates_valid" CHECK ("ended_at" IS NULL OR "joined_at" IS NULL OR "ended_at" >= "joined_at");

CREATE UNIQUE INDEX "organization_memberships_one_live_per_user_org"
  ON "iam"."organization_memberships" ("organization_id", "user_account_id")
  WHERE "ended_at" IS NULL AND "status" <> 'ENDED';

ALTER TABLE "iam"."membership_roles"
  ADD CONSTRAINT "membership_roles_dates_valid" CHECK ("valid_until" IS NULL OR "valid_until" > "valid_from");

CREATE UNIQUE INDEX "membership_roles_one_live_grant"
  ON "iam"."membership_roles" ("membership_id", "role_id")
  WHERE "valid_until" IS NULL;

ALTER TABLE "iam"."sessions"
  ADD CONSTRAINT "sessions_dates_valid" CHECK (
    "expires_at" > "issued_at"
    AND ("revoked_at" IS NULL OR "revoked_at" >= "issued_at")
  );

ALTER TABLE "iam"."invitations"
  ADD CONSTRAINT "invitations_dates_and_terminal_state_valid" CHECK (
    "expires_at" > "created_at"
    AND NOT ("accepted_at" IS NOT NULL AND "revoked_at" IS NOT NULL)
  );

ALTER TABLE "iam"."recovery_challenges"
  ADD CONSTRAINT "recovery_challenges_dates_and_terminal_state_valid" CHECK (
    "expires_at" > "created_at"
    AND NOT ("consumed_at" IS NOT NULL AND "revoked_at" IS NOT NULL)
  );

ALTER TABLE "platform"."resources"
  ADD CONSTRAINT "resources_client_visibility_requires_client" CHECK (
    "visibility" <> 'CLIENT_SHARED' OR "client_organization_id" IS NOT NULL
  );

ALTER TABLE "platform"."idempotency_receipts"
  ADD CONSTRAINT "idempotency_receipts_dates_valid" CHECK (
    "expires_at" > "created_at"
    AND ("completed_at" IS NULL OR "completed_at" >= "created_at")
  );

ALTER TABLE "platform"."outbox_events"
  ADD CONSTRAINT "outbox_events_schema_version_positive" CHECK ("schema_version" > 0);

ALTER TABLE "platform"."outbox_delivery_attempts"
  ADD CONSTRAINT "outbox_delivery_attempts_values_valid" CHECK (
    "attempt_number" > 0
    AND ("finished_at" IS NULL OR "finished_at" >= "started_at")
  );

ALTER TABLE "platform"."callback_attempts"
  ADD CONSTRAINT "callback_attempts_values_valid" CHECK (
    "attempt_number" > 0
    AND ("finished_at" IS NULL OR "finished_at" >= "started_at")
  );

ALTER TABLE "platform"."automation_runs"
  ADD CONSTRAINT "automation_runs_retry_lineage_valid" CHECK (
    (
      "execution_number" = 1
      AND "root_run_id" IS NULL
      AND "parent_run_id" IS NULL
    )
    OR
    (
      "execution_number" > 1
      AND "root_run_id" IS NOT NULL
      AND "parent_run_id" IS NOT NULL
    )
  ),
  ADD CONSTRAINT "automation_runs_not_self_referential" CHECK (
    ("root_run_id" IS NULL OR "root_run_id" <> "id")
    AND ("parent_run_id" IS NULL OR "parent_run_id" <> "id")
  ),
  ADD CONSTRAINT "automation_runs_dates_valid" CHECK (
    "completed_at" IS NULL OR "started_at" IS NULL OR "completed_at" >= "started_at"
  );

ALTER TABLE "platform"."automation_step_attempts"
  ADD CONSTRAINT "automation_step_attempts_values_valid" CHECK (
    "attempt_number" > 0
    AND ("finished_at" IS NULL OR "finished_at" >= "started_at")
  );

ALTER TABLE "platform"."incidents"
  ADD CONSTRAINT "incidents_resolution_valid" CHECK (
    ("status" = 'RESOLVED' AND "resolved_at" IS NOT NULL)
    OR ("status" <> 'RESOLVED' AND "resolved_at" IS NULL)
  );

ALTER TABLE "platform"."reconciliation_runs"
  ADD CONSTRAINT "reconciliation_runs_dates_valid" CHECK (
    "finished_at" IS NULL OR "started_at" IS NULL OR "finished_at" >= "started_at"
  );

ALTER TABLE "audit"."audit_events"
  ADD CONSTRAINT "audit_events_actor_valid" CHECK (
    ("actor_type" = 'USER' AND "actor_user_id" IS NOT NULL)
    OR ("actor_type" <> 'USER')
  );

-- Immutable evidence rows reject UPDATE and DELETE. Mutable aggregate status
-- remains on the parent run/incident/outbox/callback records.
CREATE OR REPLACE FUNCTION "platform"."reject_immutable_mutation"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'immutable evidence table % does not allow %', TG_TABLE_NAME, TG_OP
    USING ERRCODE = '55000';
END;
$$;

CREATE TRIGGER "outbox_delivery_attempts_immutable"
BEFORE UPDATE OR DELETE ON "platform"."outbox_delivery_attempts"
FOR EACH ROW EXECUTE FUNCTION "platform"."reject_immutable_mutation"();

CREATE TRIGGER "callback_attempts_immutable"
BEFORE UPDATE OR DELETE ON "platform"."callback_attempts"
FOR EACH ROW EXECUTE FUNCTION "platform"."reject_immutable_mutation"();

CREATE TRIGGER "automation_step_attempts_immutable"
BEFORE UPDATE OR DELETE ON "platform"."automation_step_attempts"
FOR EACH ROW EXECUTE FUNCTION "platform"."reject_immutable_mutation"();

CREATE TRIGGER "incident_events_immutable"
BEFORE UPDATE OR DELETE ON "platform"."incident_events"
FOR EACH ROW EXECUTE FUNCTION "platform"."reject_immutable_mutation"();

CREATE TRIGGER "reconciliation_findings_immutable"
BEFORE UPDATE OR DELETE ON "platform"."reconciliation_findings"
FOR EACH ROW EXECUTE FUNCTION "platform"."reject_immutable_mutation"();

CREATE TRIGGER "audit_events_immutable"
BEFORE UPDATE OR DELETE ON "audit"."audit_events"
FOR EACH ROW EXECUTE FUNCTION "platform"."reject_immutable_mutation"();

-- Transaction-local claims. Invalid UUID claims fail the statement instead of
-- broadening access; absent claims return NULL and match no protected row.
CREATE OR REPLACE FUNCTION "platform"."current_organization_id"()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.organization_id', true), '')::uuid
$$;

CREATE OR REPLACE FUNCTION "platform"."current_client_organization_id"()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.client_organization_id', true), '')::uuid
$$;

ALTER TABLE "platform"."resources" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resources_select_by_context"
ON "platform"."resources"
FOR SELECT
USING (
  "owner_organization_id" = "platform"."current_organization_id"()
  OR (
    "client_organization_id" = "platform"."current_client_organization_id"()
    AND "visibility" = 'CLIENT_SHARED'
  )
);

CREATE POLICY "resources_mutate_by_owner_context"
ON "platform"."resources"
FOR ALL
USING ("owner_organization_id" = "platform"."current_organization_id"())
WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());
