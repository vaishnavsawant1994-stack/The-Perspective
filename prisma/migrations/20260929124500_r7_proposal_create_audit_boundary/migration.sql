-- Narrow audit boundary for atomic R7 proposal creation.
-- Runtime gets function execution only, not direct access to the audit schema.
CREATE OR REPLACE FUNCTION platform.append_r7_proposal_create_audit(
  p_event_id uuid,
  p_owner_organization_id uuid,
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
SET search_path = pg_catalog, platform, iam, audit
AS $$
DECLARE
  current_owner uuid;
  membership_user uuid;
BEGIN
  current_owner := platform.current_organization_id();
  IF current_owner IS NULL OR current_owner <> p_owner_organization_id
     OR NULLIF(btrim(p_request_id), '') IS NULL
     OR NULLIF(btrim(p_idempotency_key), '') IS NULL
     OR p_redacted_diff IS NULL
     OR p_after_hash !~ '^[0-9a-f]{64}$'
     OR p_idempotency_key NOT LIKE 'r7:proposal-create:' || current_owner::text || ':%'
  THEN
    RAISE EXCEPTION 'invalid R7 proposal audit context' USING ERRCODE = '42501';
  END IF;

  SELECT user_account_id INTO membership_user
    FROM iam.organization_memberships
   WHERE id = p_actor_membership_id
     AND organization_id = current_owner
     AND membership_type = 'STAFF'
     AND status = 'ACTIVE'
   FOR SHARE;

  IF membership_user IS DISTINCT FROM p_actor_user_id THEN
    RAISE EXCEPTION 'inactive or mismatched R7 proposal actor' USING ERRCODE = '42501';
  END IF;

  INSERT INTO audit.audit_events (
    id, owner_organization_id, target_resource_id, actor_type,
    actor_user_id, actor_membership_id, action, request_id, correlation_id,
    after_hash, redacted_diff, idempotency_key, occurred_at
  ) VALUES (
    p_event_id, current_owner, NULL, 'USER'::audit."AuditActorType",
    p_actor_user_id, p_actor_membership_id, 'r7.proposal.created',
    p_request_id, p_request_id, p_after_hash, p_redacted_diff,
    p_idempotency_key, p_occurred_at
  );
  RETURN 'APPENDED';
END
$;

CREATE OR REPLACE FUNCTION platform.read_r7_proposal_create_replay(p_idempotency_key text)
RETURNS TABLE(
  proposal_id uuid, version_id uuid, version integer, currency text, total_minor text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, platform, audit
AS $$
  SELECT
    (event.redacted_diff->'proposalCreate'->>'proposalId')::uuid,
    (event.redacted_diff->'proposalCreate'->>'versionId')::uuid,
    (event.redacted_diff->'proposalCreate'->>'version')::integer,
    event.redacted_diff->'proposalCreate'->>'currency',
    event.redacted_diff->'proposalCreate'->>'totalMinor'
  FROM audit.audit_events AS event
  WHERE event.owner_organization_id = platform.current_organization_id()
    AND event.idempotency_key = p_idempotency_key
    AND event.action = 'r7.proposal.created'
    AND p_idempotency_key LIKE
      'r7:proposal-create:' || platform.current_organization_id()::text || ':%'
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION platform.append_r7_proposal_create_audit(uuid,uuid,uuid,uuid,text,text,jsonb,text,timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.read_r7_proposal_create_replay(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.append_r7_proposal_create_audit(uuid,uuid,uuid,uuid,text,text,jsonb,text,timestamptz) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION platform.read_r7_proposal_create_replay(text) TO perspective_runtime;
