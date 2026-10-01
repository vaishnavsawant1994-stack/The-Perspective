-- Proposal creation uses the tenant-bound receipt pattern without granting
-- perspective_runtime direct writes to the shared idempotency table.
CREATE OR REPLACE FUNCTION platform.claim_r7_proposal_create(
  p_receipt_id uuid, p_idempotency_key text, p_request_hash text, p_expires_at timestamptz
)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  owner_id uuid;
  existing_hash text;
  existing_state platform."IdempotencyState";
BEGIN
  owner_id := platform.current_organization_id();
  IF owner_id IS NULL OR NULLIF(btrim(p_idempotency_key), '') IS NULL
     OR NULLIF(btrim(p_request_hash), '') IS NULL
     OR p_expires_at <= clock_timestamp()
  THEN
    RAISE EXCEPTION 'invalid R7 proposal create idempotency claim' USING ERRCODE = '22023';
  END IF;
  SELECT request_hash, state INTO existing_hash, existing_state
    FROM platform.idempotency_receipts
   WHERE owner_organization_id = owner_id
     AND scope = 'commercial.proposal-create'
     AND idempotency_key = btrim(p_idempotency_key)
   FOR UPDATE;
  IF FOUND THEN
    IF existing_hash IS DISTINCT FROM btrim(p_request_hash) THEN RETURN 'MISMATCH'; END IF;
    IF existing_state = 'COMPLETED' THEN RETURN 'REPLAY'; END IF;
    RETURN 'IN_PROGRESS';
  END IF;
  INSERT INTO platform.idempotency_receipts
    (id,owner_organization_id,scope,idempotency_key,request_hash,state,created_at,expires_at)
  VALUES
    (p_receipt_id,owner_id,'commercial.proposal-create',btrim(p_idempotency_key),
     btrim(p_request_hash),'STARTED',clock_timestamp(),p_expires_at);
  RETURN 'CLAIMED';
END
$$;

CREATE OR REPLACE FUNCTION platform.complete_r7_proposal_create(
  p_idempotency_key text, p_request_hash text, p_response_hash text
)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, platform
AS $$
DECLARE
  owner_id uuid;
  changed integer;
BEGIN
  owner_id := platform.current_organization_id();
  UPDATE platform.idempotency_receipts
     SET state='COMPLETED', response_status=201,
         response_hash=NULLIF(btrim(p_response_hash), ''),
         completed_at=clock_timestamp()
   WHERE owner_organization_id=owner_id
     AND scope='commercial.proposal-create'
     AND idempotency_key=btrim(p_idempotency_key)
     AND request_hash=btrim(p_request_hash)
     AND state='STARTED';
  GET DIAGNOSTICS changed = ROW_COUNT;
  IF changed <> 1 THEN
    RAISE EXCEPTION 'R7 proposal create idempotency completion mismatch' USING ERRCODE = '23514';
  END IF;
  RETURN 'COMPLETED';
END
$$;

REVOKE ALL ON FUNCTION platform.claim_r7_proposal_create(uuid,text,text,timestamptz) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.complete_r7_proposal_create(text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.claim_r7_proposal_create(uuid,text,text,timestamptz) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION platform.complete_r7_proposal_create(text,text,text) TO perspective_runtime;
