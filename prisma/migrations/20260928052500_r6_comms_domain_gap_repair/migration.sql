-- R6 Communications repair within the frozen 35-table candidate schema.

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

ALTER TABLE "comms"."conversations"
  ADD COLUMN "assigned_membership_id" UUID;

ALTER TABLE "comms"."conversations"
  ADD CONSTRAINT "conversations_assigned_membership_owner_fkey"
  FOREIGN KEY ("assigned_membership_id","owner_organization_id")
  REFERENCES "iam"."organization_memberships"("id","organization_id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION "platform"."r6_active_tenant_membership"(p_membership_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM iam.organization_memberships AS membership
     WHERE membership.id = p_membership_id
       AND membership.organization_id = "platform"."current_organization_id"()
       AND membership.status = 'ACTIVE'
  )
$$;

REVOKE ALL ON FUNCTION "platform"."r6_active_tenant_membership"(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION "platform"."r6_active_tenant_membership"(uuid) TO perspective_runtime;

CREATE OR REPLACE FUNCTION "platform"."protect_r6_meeting_history_note"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD."visibility" = 'INTERNAL' AND OLD."body" = 'Meeting rescheduled' AND OLD."decisions"->>'kind' = 'MEETING_RESCHEDULE_HISTORY' THEN
    RAISE EXCEPTION 'R6 meeting history is immutable' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END
$$;

CREATE TRIGGER "meeting_notes_history_immutable_update"
BEFORE UPDATE ON "comms"."meeting_notes"
FOR EACH ROW EXECUTE FUNCTION "platform"."protect_r6_meeting_history_note"();

CREATE TRIGGER "meeting_notes_history_immutable_delete"
BEFORE DELETE ON "comms"."meeting_notes"
FOR EACH ROW EXECUTE FUNCTION "platform"."protect_r6_meeting_history_note"();
