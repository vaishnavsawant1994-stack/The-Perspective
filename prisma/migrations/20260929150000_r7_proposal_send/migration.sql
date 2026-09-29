-- Explicit R7 proposal send transaction boundaries. These helpers are narrow
-- SECURITY DEFINER APIs: runtime receives no direct audit, outbox, or receipt
-- table writes for this command.

CREATE OR REPLACE FUNCTION platform.claim_r7_proposal_send(
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
  existing_state platform."IdempotencyState";
BEGIN
  owner_id := platform.current_organization_id();
  IF owner_id IS NULL
     OR NULLIF(btrim(p_idempotency_key), '') IS NULL
     OR NULLIF(btrim(p_request_hash), '') IS NULL
     OR p_expires_at <= clock_timestamp()
     OR p_idempotency_key NOT LIKE 'r7:proposal-send:' || owner_id::text || ':%'
  THEN
    RAISE EXCEPTION 'invalid R7 proposal send idempotency claim' USING ERRCODE = '22023';
  END IF;

  SELECT request_hash, state INTO existing_hash, existing_state
    FROM platform.idempotency_receipts
   WHERE owner_organization_id = owner_id
     AND scope = 'commercial.proposal-send'
     AND idempotency_key = btrim(p_idempotency_key)
   FOR UPDATE;

  IF FOUND THEN
    IF existing_hash IS DISTINCT FROM btrim(p_request_hash) THEN RETURN 'MISMATCH'; END IF;
    IF existing_state = 'COMPLETED' THEN RETURN 'REPLAY'; END IF;
    RETURN 'IN_PROGRESS';
  END IF;

  INSERT INTO platform.idempotency_receipts (
    id, owner_organization_id, scope, idempotency_key, request_hash,
    state, created_at, expires_at
  ) VALUES (
    p_receipt_id, owner_id, 'commercial.proposal-send', btrim(p_idempotency_key),
    btrim(p_request_hash), 'STARTED', clock_timestamp(), p_expires_at
  );
  RETURN 'CLAIMED';
END;
$$;

CREATE OR REPLACE FUNCTION platform.read_r7_proposal_send_replay(p_idempotency_key text)
RETURNS TABLE(
  proposal_id uuid,
  version_id uuid,
  version integer,
  row_version integer,
  currency text,
  total_minor text,
  sent_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, platform, audit
AS $$
  SELECT
    (event.redacted_diff->'proposalSend'->>'proposalId')::uuid,
    (event.redacted_diff->'proposalSend'->>'proposalVersionId')::uuid,
    (event.redacted_diff->'proposalSend'->>'version')::integer,
    (event.redacted_diff->'proposalSend'->>'rowVersion')::integer,
    event.redacted_diff->'proposalSend'->>'currency',
    event.redacted_diff->'proposalSend'->>'totalMinor',
    (event.redacted_diff->'proposalSend'->>'sentAt')::timestamptz
  FROM audit.audit_events AS event
  WHERE event.owner_organization_id = platform.current_organization_id()
    AND event.action = 'r7.proposal.sent'
    AND event.idempotency_key = p_idempotency_key
    AND p_idempotency_key LIKE
      'r7:proposal-send:' || platform.current_organization_id()::text || ':%'
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION platform.complete_r7_proposal_send(
  p_event_id uuid,
  p_owner_organization_id uuid,
  p_target_resource_id uuid,
  p_proposal_id uuid,
  p_proposal_version_id uuid,
  p_actor_user_id uuid,
  p_actor_membership_id uuid,
  p_version integer,
  p_row_version integer,
  p_request_id text,
  p_after_hash text,
  p_redacted_diff jsonb,
  p_idempotency_key text,
  p_currency text,
  p_total_minor text,
  p_sent_at timestamptz
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform, iam, audit, commercial
AS $$
DECLARE
  current_owner uuid;
  membership_user uuid;
  changed integer;
BEGIN
  current_owner := platform.current_organization_id();
  IF current_owner IS NULL OR current_owner <> p_owner_organization_id
     OR NULLIF(btrim(p_request_id), '') IS NULL
     OR p_target_resource_id IS NULL
     OR p_redacted_diff IS NULL
     OR p_after_hash !~ '^[0-9a-f]{64}$'
     OR p_redacted_diff->'proposalSend'->>'proposalId' <> p_proposal_id::text
     OR p_redacted_diff->'proposalSend'->>'proposalVersionId' <> p_proposal_version_id::text
     OR (p_redacted_diff->'proposalSend'->>'version')::integer <> p_version
     OR (p_redacted_diff->'proposalSend'->>'rowVersion')::integer <> p_row_version
     OR p_redacted_diff->'proposalSend'->>'currency' <> btrim(p_currency)
     OR p_redacted_diff->'proposalSend'->>'totalMinor' <> p_total_minor
     OR (p_redacted_diff->'proposalSend'->>'sentAt')::timestamptz <> p_sent_at
     OR p_redacted_diff->'proposalSend'->>'payloadHash' !~ '^[0-9a-f]{64}$'
     OR p_idempotency_key NOT LIKE 'r7:proposal-send:' || current_owner::text || ':%'
  THEN
    RAISE EXCEPTION 'invalid R7 proposal send audit context' USING ERRCODE = '42501';
  END IF;

  SELECT user_account_id INTO membership_user
    FROM iam.organization_memberships
   WHERE id = p_actor_membership_id
     AND organization_id = current_owner
     AND membership_type = 'STAFF'
     AND status = 'ACTIVE'
   FOR SHARE;
  IF membership_user IS DISTINCT FROM p_actor_user_id THEN
    RAISE EXCEPTION 'inactive or mismatched R7 proposal sender' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM commercial.proposals AS proposal
      JOIN commercial.proposal_versions AS version
        ON version.proposal_id = proposal.id
       AND version.owner_organization_id = proposal.owner_organization_id
     WHERE proposal.id = p_proposal_id
       AND proposal.resource_id = p_target_resource_id
       AND proposal.owner_organization_id = current_owner
       AND proposal.status = 'SENT'
       AND proposal.current_version = p_version
       AND proposal.row_version = p_row_version
       AND version.id = p_proposal_version_id
       AND version.version = p_version
       AND version.status = 'SENT'
       AND version.immutable IS TRUE
       AND version.issued_at = p_sent_at
       AND version.currency = btrim(p_currency)::char(3)
       AND version.total_minor::text = p_total_minor
  ) THEN
    RAISE EXCEPTION 'R7 proposal send audit does not match canonical state' USING ERRCODE = '23514';
  END IF;

  INSERT INTO audit.audit_events (
    id, owner_organization_id, target_resource_id, actor_type,
    actor_user_id, actor_membership_id, action, request_id, correlation_id,
    after_hash, redacted_diff, idempotency_key, occurred_at
  ) VALUES (
    p_event_id, current_owner, NULL, 'USER'::audit."AuditActorType",
    p_actor_user_id, p_actor_membership_id, 'r7.proposal.sent',
    p_request_id, p_request_id, p_after_hash, p_redacted_diff,
    p_idempotency_key, p_sent_at
  );

  INSERT INTO platform.outbox_events (
    id, owner_organization_id, aggregate_resource_id, event_type,
    schema_version, payload, idempotency_key, status, available_at, created_at
  ) VALUES (
    gen_random_uuid(), current_owner, NULL, 'r7.proposal.send.requested',
    1, jsonb_build_object(
      'proposalId', p_proposal_id,
      'proposalVersionId', p_proposal_version_id,
      'version', p_version,
      'ownerOrganizationId', current_owner
    ),
    'r7:proposal-send:' || p_proposal_id::text || ':' || p_version::text,
    'PENDING'::platform."ProcessingStatus", p_sent_at, p_sent_at
  );

  UPDATE platform.idempotency_receipts
     SET state = 'COMPLETED', response_status = 200,
         response_hash = p_after_hash, completed_at = clock_timestamp()
   WHERE owner_organization_id = current_owner
     AND scope = 'commercial.proposal-send'
     AND idempotency_key = p_idempotency_key
     AND request_hash = p_redacted_diff->'proposalSend'->>'payloadHash'
     AND state = 'STARTED';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'R7 proposal send idempotency completion mismatch' USING ERRCODE = '23514';
  END IF;

  RETURN 'COMPLETED';
END;
$$;

REVOKE ALL ON FUNCTION platform.claim_r7_proposal_send(uuid,text,text,timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.read_r7_proposal_send_replay(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.complete_r7_proposal_send(uuid,uuid,uuid,uuid,uuid,uuid,uuid,integer,integer,text,text,jsonb,text,text,text,timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.claim_r7_proposal_send(uuid,text,text,timestamptz) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION platform.read_r7_proposal_send_replay(text) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION platform.complete_r7_proposal_send(uuid,uuid,uuid,uuid,uuid,uuid,uuid,integer,integer,text,text,jsonb,text,text,text,timestamptz) TO perspective_runtime;
