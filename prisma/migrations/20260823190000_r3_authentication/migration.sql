-- CreateEnum
CREATE TYPE "iam"."AuthSurface" AS ENUM ('TEAM', 'CLIENT');

-- CreateEnum
CREATE TYPE "iam"."AuthAttemptKind" AS ENUM ('LOGIN', 'RECOVERY_REQUEST', 'RECOVERY_COMPLETE', 'MFA_VERIFY', 'INVITATION_ACCEPT');

-- CreateEnum
CREATE TYPE "iam"."AuthAttemptOutcome" AS ENUM ('SUCCEEDED', 'FAILED', 'THROTTLED', 'CHALLENGE_REQUIRED');

-- CreateEnum
CREATE TYPE "iam"."AuthenticationSecretKind" AS ENUM ('TOTP_SEED');

-- CreateEnum
CREATE TYPE "iam"."MfaChallengePurpose" AS ENUM ('LOGIN', 'ENROLLMENT');

-- AlterTable
ALTER TABLE "iam"."invitations" ADD COLUMN     "terms_accepted_at" TIMESTAMPTZ(6);

-- Existing R2 rows were persistence contracts only and were never issued by a
-- real recovery service. Revoke any such row before making the R3 purpose and
-- surface columns mandatory.
ALTER TABLE "iam"."recovery_challenges"
ADD COLUMN "attempt_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "identifier_hash" TEXT,
ADD COLUMN "requested_ip_hash" TEXT,
ADD COLUMN "surface" "iam"."AuthSurface";

UPDATE "iam"."recovery_challenges"
SET "revoked_at" = COALESCE("revoked_at", CURRENT_TIMESTAMP),
    "identifier_hash" = 'legacy-r2:' || "id"::text,
    "surface" = 'CLIENT'
WHERE "identifier_hash" IS NULL OR "surface" IS NULL;

ALTER TABLE "iam"."recovery_challenges"
ALTER COLUMN "identifier_hash" SET NOT NULL,
ALTER COLUMN "surface" SET NOT NULL;

-- R1/R2 issued no verified sessions. Revoke any legacy contract row before R3
-- assigns a conservative surface, so it can never become valid accidentally.
ALTER TABLE "iam"."sessions"
ADD COLUMN "authentication_method" TEXT,
ADD COLUMN "mfa_verified_at" TIMESTAMPTZ(6),
ADD COLUMN "surface" "iam"."AuthSurface";

UPDATE "iam"."sessions"
SET "revoked_at" = COALESCE("revoked_at", CURRENT_TIMESTAMP),
    "revoke_reason" = COALESCE("revoke_reason", 'r3_migration_unverified'),
    "authentication_method" = 'legacy-unverified',
    "surface" = 'TEAM'
WHERE "authentication_method" IS NULL OR "surface" IS NULL;

ALTER TABLE "iam"."sessions"
ALTER COLUMN "authentication_method" SET NOT NULL,
ALTER COLUMN "surface" SET NOT NULL;

-- CreateTable
CREATE TABLE "iam"."password_credentials" (
    "id" UUID NOT NULL,
    "user_identity_id" UUID NOT NULL,
    "password_hash" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."authentication_attempts" (
    "id" UUID NOT NULL,
    "surface" "iam"."AuthSurface" NOT NULL,
    "kind" "iam"."AuthAttemptKind" NOT NULL,
    "outcome" "iam"."AuthAttemptOutcome" NOT NULL,
    "identifier_hash" TEXT NOT NULL,
    "ip_hash" TEXT,
    "user_account_id" UUID,
    "correlation_id" TEXT NOT NULL,
    "evidence" JSONB NOT NULL DEFAULT '{}',
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authentication_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."authentication_secrets" (
    "id" UUID NOT NULL,
    "user_account_id" UUID NOT NULL,
    "secret_kind" "iam"."AuthenticationSecretKind" NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "auth_tag" TEXT NOT NULL,
    "key_version" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "authentication_secrets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "iam"."mfa_challenges" (
    "id" UUID NOT NULL,
    "user_account_id" UUID NOT NULL,
    "mfa_method_id" UUID,
    "purpose" "iam"."MfaChallengePurpose" NOT NULL,
    "token_hash" TEXT NOT NULL,
    "surface" "iam"."AuthSurface" NOT NULL,
    "remember_session" BOOLEAN NOT NULL DEFAULT false,
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "consumed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mfa_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "password_credentials_user_identity_id_created_at_idx" ON "iam"."password_credentials"("user_identity_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "password_credentials_user_identity_id_version_key" ON "iam"."password_credentials"("user_identity_id", "version");

-- CreateIndex
CREATE INDEX "authentication_attempts_identifier_hash_kind_occurred_at_idx" ON "iam"."authentication_attempts"("identifier_hash", "kind", "occurred_at");

-- CreateIndex
CREATE INDEX "authentication_attempts_ip_hash_kind_occurred_at_idx" ON "iam"."authentication_attempts"("ip_hash", "kind", "occurred_at");

-- CreateIndex
CREATE INDEX "authentication_attempts_user_account_id_occurred_at_idx" ON "iam"."authentication_attempts"("user_account_id", "occurred_at");

-- CreateIndex
CREATE INDEX "authentication_secrets_user_account_id_secret_kind_created__idx" ON "iam"."authentication_secrets"("user_account_id", "secret_kind", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "mfa_challenges_token_hash_key" ON "iam"."mfa_challenges"("token_hash");

-- CreateIndex
CREATE INDEX "mfa_challenges_user_account_id_purpose_expires_at_idx" ON "iam"."mfa_challenges"("user_account_id", "purpose", "expires_at");

-- CreateIndex
CREATE INDEX "mfa_challenges_mfa_method_id_expires_at_idx" ON "iam"."mfa_challenges"("mfa_method_id", "expires_at");

-- AddForeignKey
ALTER TABLE "iam"."password_credentials" ADD CONSTRAINT "password_credentials_user_identity_id_fkey" FOREIGN KEY ("user_identity_id") REFERENCES "iam"."user_identities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."authentication_attempts" ADD CONSTRAINT "authentication_attempts_user_account_id_fkey" FOREIGN KEY ("user_account_id") REFERENCES "iam"."user_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."authentication_secrets" ADD CONSTRAINT "authentication_secrets_user_account_id_fkey" FOREIGN KEY ("user_account_id") REFERENCES "iam"."user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."mfa_challenges" ADD CONSTRAINT "mfa_challenges_user_account_id_fkey" FOREIGN KEY ("user_account_id") REFERENCES "iam"."user_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "iam"."mfa_challenges" ADD CONSTRAINT "mfa_challenges_mfa_method_id_fkey" FOREIGN KEY ("mfa_method_id") REFERENCES "iam"."mfa_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- R3 integrity constraints and append-only security evidence.
ALTER TABLE "iam"."password_credentials"
  ADD CONSTRAINT "password_credentials_version_positive" CHECK ("version" > 0),
  ADD CONSTRAINT "password_credentials_scrypt_format" CHECK ("password_hash" LIKE 'scrypt$v=1$%');

ALTER TABLE "iam"."authentication_secrets"
  ADD CONSTRAINT "authentication_secrets_key_version_positive" CHECK ("key_version" > 0);

ALTER TABLE "iam"."sessions"
  ADD CONSTRAINT "sessions_authentication_method_present" CHECK (length(trim("authentication_method")) > 0),
  ADD CONSTRAINT "sessions_mfa_time_valid" CHECK ("mfa_verified_at" IS NULL OR "mfa_verified_at" <= "issued_at");

ALTER TABLE "iam"."invitations"
  ADD CONSTRAINT "invitations_acceptance_terms_valid" CHECK (
    "accepted_at" IS NULL OR "terms_accepted_at" IS NOT NULL
  );

ALTER TABLE "iam"."recovery_challenges"
  ADD CONSTRAINT "recovery_challenges_attempt_count_valid" CHECK ("attempt_count" BETWEEN 0 AND 10);

ALTER TABLE "iam"."mfa_challenges"
  ADD CONSTRAINT "mfa_challenges_state_valid" CHECK (
    "failed_attempts" BETWEEN 0 AND 5
    AND "expires_at" > "created_at"
    AND ("consumed_at" IS NULL OR "consumed_at" >= "created_at")
  ),
  ADD CONSTRAINT "mfa_challenges_method_required" CHECK (
    "purpose" <> 'LOGIN' OR "mfa_method_id" IS NOT NULL
  );

CREATE TRIGGER "password_credentials_immutable"
BEFORE UPDATE OR DELETE ON "iam"."password_credentials"
FOR EACH ROW EXECUTE FUNCTION "platform"."reject_immutable_mutation"();

CREATE TRIGGER "authentication_attempts_immutable"
BEFORE UPDATE OR DELETE ON "iam"."authentication_attempts"
FOR EACH ROW EXECUTE FUNCTION "platform"."reject_immutable_mutation"();

CREATE TRIGGER "authentication_secrets_immutable"
BEFORE UPDATE OR DELETE ON "iam"."authentication_secrets"
FOR EACH ROW EXECUTE FUNCTION "platform"."reject_immutable_mutation"();
