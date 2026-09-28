-- R6 Communications domain-gap repair: exact sequence pinning and immutable meeting reschedule history.

ALTER TABLE "comms"."outreach_campaigns"
  ADD COLUMN "sequence_version" INTEGER;

UPDATE "comms"."outreach_campaigns" AS campaign
SET "sequence_version" = sequence."current_version"
FROM "comms"."sequences" AS sequence
WHERE sequence."id" = campaign."sequence_id"
  AND sequence."owner_organization_id" = campaign."owner_organization_id";

ALTER TABLE "comms"."outreach_campaigns"
  ALTER COLUMN "sequence_version" SET NOT NULL,
  ALTER COLUMN "sequence_version" SET DEFAULT 1;

ALTER TABLE "comms"."outreach_campaigns"
  ADD CONSTRAINT "outreach_campaigns_sequence_version_check"
  CHECK ("sequence_version" > 0);

CREATE TABLE "comms"."meeting_schedule_history" (
  "id" UUID NOT NULL,
  "owner_organization_id" UUID NOT NULL,
  "meeting_id" UUID NOT NULL,
  "from_starts_at" TIMESTAMPTZ(6) NOT NULL,
  "from_ends_at" TIMESTAMPTZ(6) NOT NULL,
  "from_timezone" TEXT NOT NULL,
  "to_starts_at" TIMESTAMPTZ(6) NOT NULL,
  "to_ends_at" TIMESTAMPTZ(6) NOT NULL,
  "to_timezone" TEXT NOT NULL,
  "actor_membership_id" UUID NOT NULL,
  "meeting_version" INTEGER NOT NULL,
  "reason" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "meeting_schedule_history_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "meeting_schedule_history_version_check" CHECK ("meeting_version" > 0),
  CONSTRAINT "meeting_schedule_history_time_check" CHECK ("to_ends_at" > "to_starts_at")
);

CREATE INDEX "meeting_schedule_history_owner_organization_id_meeting_id_created_at_idx"
  ON "comms"."meeting_schedule_history"("owner_organization_id", "meeting_id", "created_at");

ALTER TABLE "comms"."meeting_schedule_history"
  ADD CONSTRAINT "meeting_schedule_history_meeting_owner_fkey"
  FOREIGN KEY ("meeting_id", "owner_organization_id")
  REFERENCES "comms"."meetings"("id", "owner_organization_id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "comms"."meeting_schedule_history"
  ADD CONSTRAINT "meeting_schedule_history_actor_membership_fkey"
  FOREIGN KEY ("actor_membership_id", "owner_organization_id")
  REFERENCES "iam"."organization_memberships"("id", "organization_id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "comms"."meeting_schedule_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "comms"."meeting_schedule_history" FORCE ROW LEVEL SECURITY;

CREATE POLICY "meeting_schedule_history_tenant_select"
  ON "comms"."meeting_schedule_history"
  FOR SELECT
  USING ("owner_organization_id" = "platform"."current_organization_id"());

CREATE POLICY "meeting_schedule_history_tenant_insert"
  ON "comms"."meeting_schedule_history"
  FOR INSERT
  WITH CHECK ("owner_organization_id" = "platform"."current_organization_id"());

GRANT SELECT, INSERT ON "comms"."meeting_schedule_history" TO perspective_runtime;

CREATE TRIGGER "meeting_schedule_history_immutable_update"
BEFORE UPDATE ON "comms"."meeting_schedule_history"
FOR EACH ROW EXECUTE FUNCTION "platform"."reject_immutable_mutation"();

CREATE TRIGGER "meeting_schedule_history_immutable_delete"
BEFORE DELETE ON "comms"."meeting_schedule_history"
FOR EACH ROW EXECUTE FUNCTION "platform"."reject_immutable_mutation"();
