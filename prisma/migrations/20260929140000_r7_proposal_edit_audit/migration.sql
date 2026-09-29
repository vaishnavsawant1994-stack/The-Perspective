-- Proposal edits use a narrow SECURITY DEFINER audit append boundary.
-- The business mutation and this evidence insert share the caller transaction.
CREATE OR REPLACE FUNCTION platform.append_r7_proposal_edit_audit(
  p_event_id uuid,
  p_owner_organization_id uuid,
  p_target_resource_id uuid,
  p_actor_user_id uuid,
  p_actor_membership_id uuid,
  p_request_id text,
  p_after_hash text,
  p_redacted_diff jsonb,
  p_idempotency_key text,
  p_occurred_at timestamptz
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform, iam, audit, commercial
AS $$
DECLARE
  current_owner uuid;
  membership_user uuid;
  event_proposal_id uuid;
BEGIN
  current_owner := platform.current_organization_id();
  IF current_owner IS NULL OR current_owner <> p_owner_organization_id
     OR NULLIF(btrim(p_request_id), '') IS NULL
     OR p_redacted_diff IS NULL
     OR p_target_resource_id IS NULL
     OR p_after_hash !~ '^[0-9a-f]{64}$'
     OR p_redacted_diff->'proposalEdit'->>'proposalId' IS NULL
     OR p_redacted_diff->'proposalEdit'->>'rowVersion' IS NULL
     OR p_idempotency_key !~ '^r7:proposal-edit:[0-9a-f-]{36}:[1-9][0-9]*$'
     OR p_idempotency_key <> 'r7:proposal-edit:' ||
       (p_redacted_diff->'proposalEdit'->>'proposalId') || ':' ||
       (p_redacted_diff->'proposalEdit'->>'rowVersion')
  THEN
    RAISE EXCEPTION 'invalid R7 proposal edit audit context' USING ERRCODE = '42501';
  END IF;

  SELECT user_account_id INTO membership_user
    FROM iam.organization_memberships
   WHERE id = p_actor_membership_id
     AND organization_id = current_owner
     AND membership_type = 'STAFF'
     AND status = 'ACTIVE'
   FOR SHARE;
  IF membership_user IS DISTINCT FROM p_actor_user_id THEN
    RAISE EXCEPTION 'inactive or mismatched R7 proposal edit actor' USING ERRCODE = '42501';
  END IF;

  BEGIN
    event_proposal_id := (p_redacted_diff->'proposalEdit'->>'proposalId')::uuid;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'invalid R7 proposal edit target' USING ERRCODE = '42501';
  END;
  IF NOT EXISTS (
    SELECT 1
      FROM commercial.proposals AS proposal
      JOIN commercial.proposal_versions AS version
        ON version.proposal_id = proposal.id
       AND version.owner_organization_id = proposal.owner_organization_id
     WHERE proposal.id = event_proposal_id
       AND proposal.resource_id = p_target_resource_id
       AND proposal.owner_organization_id = current_owner
       AND proposal.current_version = version.version
       AND proposal.row_version = (p_redacted_diff->'proposalEdit'->>'rowVersion')::integer
       AND version.id = (p_redacted_diff->'proposalEdit'->>'proposalVersionId')::uuid
       AND version.version = (p_redacted_diff->'proposalEdit'->>'version')::integer
       AND proposal.currency = (p_redacted_diff->'proposalEdit'->>'afterCurrency')::char(3)
       AND version.total_minor = (p_redacted_diff->'proposalEdit'->>'afterTotalMinor')::bigint
  ) THEN
    RAISE EXCEPTION 'R7 proposal edit audit does not match canonical state' USING ERRCODE = '23514';
  END IF;

  INSERT INTO audit.audit_events (
    id, owner_organization_id, target_resource_id, actor_type,
    actor_user_id, actor_membership_id, action, request_id, correlation_id,
    after_hash, redacted_diff, idempotency_key, occurred_at
  ) VALUES (
    p_event_id, current_owner, p_target_resource_id, 'USER'::audit."AuditActorType",
    p_actor_user_id, p_actor_membership_id, 'r7.proposal.edited',
    p_request_id, p_request_id, p_after_hash, p_redacted_diff,
    p_idempotency_key, p_occurred_at
  );
  RETURN 'APPENDED';
END;
$$;

REVOKE ALL ON FUNCTION platform.append_r7_proposal_edit_audit(uuid,uuid,uuid,uuid,uuid,text,text,jsonb,text,timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.append_r7_proposal_edit_audit(uuid,uuid,uuid,uuid,uuid,text,text,jsonb,text,timestamptz) TO perspective_runtime;
