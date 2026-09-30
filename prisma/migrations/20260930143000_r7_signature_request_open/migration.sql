-- Server-owned outbound signature request.
-- perspective_runtime may execute these functions only. It still cannot write
-- contract or signature tables directly, and this path cannot set SIGNED.

CREATE OR REPLACE FUNCTION platform.reserve_r7_signature_request(
  p_request_row_id uuid,
  p_audit_event_id uuid,
  p_contract_id uuid,
  p_contract_version_id uuid,
  p_expected_version integer,
  p_expected_row_version integer,
  p_document_sha256 text,
  p_provider text,
  p_idempotency_key text,
  p_request_hash text,
  p_request_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform, audit, commercial
AS $$
DECLARE
  v_owner uuid;
  v_existing_id uuid;
  v_existing_hash text;
  v_existing_status text;
  v_existing_provider text;
  v_existing_provider_request text;
  v_existing_contract uuid;
  v_existing_version uuid;
  v_contract_status text;
  v_row_version integer;
  v_current_version integer;
  v_version_id uuid;
  v_version_status text;
  v_version_digest text;
  v_required integer;
  v_valid_required integer;
  v_signers jsonb;
BEGIN
  v_owner := platform.current_organization_id();
  IF v_owner IS NULL
     OR p_request_row_id IS NULL
     OR p_audit_event_id IS NULL
     OR p_contract_id IS NULL
     OR p_contract_version_id IS NULL
     OR p_expected_version IS NULL
     OR p_expected_version < 1
     OR p_expected_row_version IS NULL
     OR p_expected_row_version < 1
     OR p_document_sha256 !~ '^[0-9a-f]{64}$'
     OR p_provider !~ '^[a-z0-9][a-z0-9._-]{0,99}$'
     OR p_idempotency_key !~ ('^r7:signature-request:' || v_owner::text || ':[A-Za-z0-9._:-]{8,128}$')
     OR p_request_hash !~ '^[0-9a-f]{64}$'
     OR NULLIF(btrim(p_request_id), '') IS NULL
  THEN
    RAISE EXCEPTION 'invalid R7 signature request' USING ERRCODE = '22023';
  END IF;

  SELECT request.id, request.request_hash, request.status, request.provider,
         request.provider_request_id, request.contract_id, request.contract_version_id
    INTO v_existing_id, v_existing_hash, v_existing_status, v_existing_provider,
         v_existing_provider_request, v_existing_contract, v_existing_version
    FROM commercial.signature_requests AS request
   WHERE request.owner_organization_id = v_owner
     AND request.idempotency_key = p_idempotency_key
   FOR UPDATE;
  IF v_existing_id IS NOT NULL THEN
    IF v_existing_hash <> p_request_hash
       OR v_existing_provider <> p_provider
       OR v_existing_contract <> p_contract_id
       OR v_existing_version <> p_contract_version_id
    THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'IDEMPOTENCY_CONFLICT');
    END IF;
    IF v_existing_status = 'SENT' THEN
      RETURN jsonb_build_object(
        'kind', 'ok', 'code', 'REPLAY',
        'signatureRequestId', v_existing_id,
        'contractId', v_existing_contract,
        'contractVersionId', v_existing_version,
        'providerRequestId', v_existing_provider_request,
        'contractStatus', 'OUT_FOR_SIGNATURE'
      );
    END IF;
    IF v_existing_status = 'FAILED' THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'PROVIDER_FAILED');
    END IF;
    IF v_existing_status = 'REQUESTED' AND v_existing_provider_request IS NOT NULL THEN
      RETURN jsonb_build_object(
        'kind', 'ok', 'code', 'RETRY_COMMIT',
        'signatureRequestId', v_existing_id,
        'contractId', v_existing_contract,
        'contractVersionId', v_existing_version,
        'providerRequestId', v_existing_provider_request
      );
    END IF;
    RETURN jsonb_build_object('kind', 'error', 'code', 'PROVIDER_AMBIGUOUS');
  END IF;

  SELECT request.id INTO v_existing_id
    FROM commercial.signature_requests AS request
   WHERE request.owner_organization_id = v_owner
     AND request.contract_version_id = p_contract_version_id
   FOR UPDATE;
  IF v_existing_id IS NOT NULL THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
  END IF;

  SELECT contract.status, contract.row_version, contract.current_version
    INTO v_contract_status, v_row_version, v_current_version
    FROM commercial.contracts AS contract
   WHERE contract.id = p_contract_id
     AND contract.owner_organization_id = v_owner
   FOR UPDATE;
  IF v_contract_status IS NULL THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;
  IF v_row_version <> p_expected_row_version OR v_current_version <> p_expected_version THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
  END IF;

  SELECT version.id, version.status, version.document_sha256
    INTO v_version_id, v_version_status, v_version_digest
    FROM commercial.contract_versions AS version
   WHERE version.id = p_contract_version_id
     AND version.owner_organization_id = v_owner
     AND version.contract_id = p_contract_id
     AND version.version = p_expected_version
   FOR UPDATE;
  IF v_version_id IS NULL THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CORRELATION_DENIED');
  END IF;
  IF v_version_digest <> p_document_sha256 THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CORRELATION_DENIED');
  END IF;
  IF v_contract_status <> 'READY_FOR_SIGNATURE' OR v_version_status <> 'READY_FOR_SIGNATURE' THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
  END IF;

  SELECT count(*) FILTER (WHERE signer.required IS TRUE),
         count(*) FILTER (
           WHERE signer.required IS TRUE AND NULLIF(btrim(signer.signer_key), '') IS NOT NULL
         )
    INTO v_required, v_valid_required
    FROM commercial.contract_signers AS signer
   WHERE signer.owner_organization_id = v_owner
     AND signer.contract_version_id = v_version_id;
  IF v_required = 0 OR v_required <> v_valid_required THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
  END IF;
  SELECT COALESCE(jsonb_agg(signer.signer_key ORDER BY signer.signer_key), '[]'::jsonb)
    INTO v_signers
    FROM commercial.contract_signers AS signer
   WHERE signer.owner_organization_id = v_owner
     AND signer.contract_version_id = v_version_id
     AND signer.required IS TRUE;

  INSERT INTO audit.audit_events (
    id, owner_organization_id, actor_type, action, request_id, correlation_id,
    after_hash, redacted_diff, idempotency_key, occurred_at
  ) VALUES (
    p_audit_event_id, v_owner, 'SYSTEM'::audit."AuditActorType",
    'r7.signature.requested', left(p_request_id, 200), p_idempotency_key, p_request_hash,
    jsonb_build_object(
      'outcome', 'RESERVED',
      'contractId', p_contract_id,
      'contractVersionId', p_contract_version_id,
      'documentSha256', p_document_sha256,
      'provider', p_provider,
      'requiredSignerCount', v_required
    ),
    p_idempotency_key, clock_timestamp()
  );
  INSERT INTO commercial.signature_requests (
    id, owner_organization_id, contract_id, contract_version_id, contract_version,
    provider, provider_request_id, status, document_sha256, idempotency_key,
    request_hash, audit_event_id
  ) VALUES (
    p_request_row_id, v_owner, p_contract_id, p_contract_version_id, p_expected_version,
    p_provider, NULL, 'REQUESTED', p_document_sha256, p_idempotency_key,
    p_request_hash, p_audit_event_id
  );
  RETURN jsonb_build_object(
    'kind', 'ok',
    'code', 'RESERVED',
    'signatureRequestId', p_request_row_id,
    'contractId', p_contract_id,
    'contractVersionId', p_contract_version_id,
    'documentSha256', p_document_sha256,
    'signerKeys', v_signers
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
END;
$$;

CREATE OR REPLACE FUNCTION platform.record_r7_signature_provider(
  p_idempotency_key text,
  p_request_hash text,
  p_provider_request_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform, commercial
AS $$
DECLARE
  v_owner uuid;
  v_id uuid;
  v_status text;
  v_provider_request text;
BEGIN
  v_owner := platform.current_organization_id();
  IF v_owner IS NULL
     OR p_request_hash !~ '^[0-9a-f]{64}$'
     OR NULLIF(btrim(p_provider_request_id), '') IS NULL
     OR length(p_provider_request_id) > 200
     OR p_provider_request_id !~ '^[A-Za-z0-9._:-]+$'
  THEN
    RAISE EXCEPTION 'invalid R7 signature request' USING ERRCODE = '22023';
  END IF;

  SELECT request.id, request.status, request.provider_request_id
    INTO v_id, v_status, v_provider_request
    FROM commercial.signature_requests AS request
   WHERE request.owner_organization_id = v_owner
     AND request.idempotency_key = p_idempotency_key
     AND request.request_hash = p_request_hash
   FOR UPDATE;
  IF v_id IS NULL THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;
  IF v_status = 'SENT' AND v_provider_request = p_provider_request_id THEN
    RETURN jsonb_build_object('kind', 'ok', 'code', 'RECORDED', 'signatureRequestId', v_id);
  END IF;
  IF v_status <> 'REQUESTED' THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
  END IF;
  IF v_provider_request IS NOT NULL AND v_provider_request <> p_provider_request_id THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
  END IF;
  UPDATE commercial.signature_requests
     SET provider_request_id = p_provider_request_id
   WHERE id = v_id
     AND owner_organization_id = v_owner
     AND status = 'REQUESTED';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'R7 signature request lost provider correlation' USING ERRCODE = '40001';
  END IF;
  RETURN jsonb_build_object('kind', 'ok', 'code', 'RECORDED', 'signatureRequestId', v_id);
END;
$$;

CREATE OR REPLACE FUNCTION platform.complete_r7_signature_request(
  p_audit_event_id uuid,
  p_idempotency_key text,
  p_request_hash text,
  p_provider_request_id text,
  p_request_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform, audit, commercial
AS $$
DECLARE
  v_owner uuid;
  v_id uuid;
  v_status text;
  v_provider text;
  v_provider_request text;
  v_contract uuid;
  v_version uuid;
  v_version_number integer;
  v_digest text;
  v_version_status text;
  v_issued timestamptz;
BEGIN
  v_owner := platform.current_organization_id();
  IF v_owner IS NULL OR p_audit_event_id IS NULL OR NULLIF(btrim(p_request_id), '') IS NULL THEN
    RAISE EXCEPTION 'invalid R7 signature request' USING ERRCODE = '22023';
  END IF;

  SELECT request.id, request.status, request.provider, request.provider_request_id,
         request.contract_id, request.contract_version_id, request.contract_version,
         request.document_sha256
    INTO v_id, v_status, v_provider, v_provider_request, v_contract, v_version,
         v_version_number, v_digest
    FROM commercial.signature_requests AS request
   WHERE request.owner_organization_id = v_owner
     AND request.idempotency_key = p_idempotency_key
     AND request.request_hash = p_request_hash
   FOR UPDATE;
  IF v_id IS NULL THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;
  IF v_provider_request IS DISTINCT FROM p_provider_request_id THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
  END IF;
  IF v_status = 'SENT' THEN
    RETURN jsonb_build_object(
      'kind', 'ok', 'code', 'REPLAY',
      'signatureRequestId', v_id,
      'contractId', v_contract,
      'contractVersionId', v_version,
      'provider', v_provider,
      'providerRequestId', v_provider_request,
      'contractStatus', 'OUT_FOR_SIGNATURE'
    );
  END IF;
  IF v_status <> 'REQUESTED' THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
  END IF;

  SELECT version.status INTO v_version_status
    FROM commercial.contract_versions AS version
   WHERE version.id = v_version
     AND version.owner_organization_id = v_owner
     AND version.contract_id = v_contract
     AND version.version = v_version_number
     AND version.document_sha256 = v_digest
   FOR UPDATE;
  IF v_version_status IS DISTINCT FROM 'READY_FOR_SIGNATURE' THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
  END IF;

  v_issued := clock_timestamp();
  UPDATE commercial.contract_versions
     SET status = 'OUT_FOR_SIGNATURE',
         issued_at = v_issued
   WHERE id = v_version
     AND owner_organization_id = v_owner
     AND status = 'READY_FOR_SIGNATURE'
     AND document_sha256 = v_digest;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'R7 signature request lost the contract version' USING ERRCODE = '40001';
  END IF;
  UPDATE commercial.contracts
     SET status = 'OUT_FOR_SIGNATURE',
         row_version = row_version + 1,
         updated_at = v_issued
   WHERE id = v_contract
     AND owner_organization_id = v_owner
     AND status = 'READY_FOR_SIGNATURE'
     AND current_version = v_version_number;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'R7 signature request lost the contract' USING ERRCODE = '40001';
  END IF;
  UPDATE commercial.signature_requests
     SET status = 'SENT'
   WHERE id = v_id
     AND owner_organization_id = v_owner
     AND status = 'REQUESTED'
     AND provider_request_id = p_provider_request_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'R7 signature request lost the envelope' USING ERRCODE = '40001';
  END IF;

  INSERT INTO audit.audit_events (
    id, owner_organization_id, actor_type, action, request_id, correlation_id,
    after_hash, redacted_diff, idempotency_key, occurred_at
  ) VALUES (
    p_audit_event_id, v_owner, 'SYSTEM'::audit."AuditActorType",
    'r7.signature.sent', left(p_request_id, 200), p_idempotency_key, p_request_hash,
    jsonb_build_object(
      'outcome', 'SENT',
      'signatureRequestId', v_id,
      'contractId', v_contract,
      'contractVersionId', v_version,
      'documentSha256', v_digest,
      'provider', v_provider,
      'providerRequestId', p_provider_request_id,
      'contractStatus', 'OUT_FOR_SIGNATURE'
    ),
    'r7:signature-request-sent:' || v_owner::text || ':' || v_id::text,
    v_issued
  );
  RETURN jsonb_build_object(
    'kind', 'ok', 'code', 'SENT',
    'signatureRequestId', v_id,
    'contractId', v_contract,
    'contractVersionId', v_version,
    'provider', v_provider,
    'providerRequestId', p_provider_request_id,
    'contractStatus', 'OUT_FOR_SIGNATURE'
  );
END;
$$;

CREATE OR REPLACE FUNCTION platform.fail_r7_signature_request(
  p_audit_event_id uuid,
  p_idempotency_key text,
  p_request_hash text,
  p_request_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform, audit, commercial
AS $$
DECLARE
  v_owner uuid;
  v_id uuid;
  v_status text;
  v_contract uuid;
  v_version uuid;
BEGIN
  v_owner := platform.current_organization_id();
  IF v_owner IS NULL OR p_audit_event_id IS NULL OR NULLIF(btrim(p_request_id), '') IS NULL THEN
    RAISE EXCEPTION 'invalid R7 signature request' USING ERRCODE = '22023';
  END IF;
  SELECT request.id, request.status, request.contract_id, request.contract_version_id
    INTO v_id, v_status, v_contract, v_version
    FROM commercial.signature_requests AS request
   WHERE request.owner_organization_id = v_owner
     AND request.idempotency_key = p_idempotency_key
     AND request.request_hash = p_request_hash
   FOR UPDATE;
  IF v_id IS NULL THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;
  IF v_status = 'FAILED' THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'PROVIDER_FAILED');
  END IF;
  IF v_status <> 'REQUESTED' OR EXISTS (
    SELECT 1 FROM commercial.signature_requests AS request
     WHERE request.id = v_id AND request.provider_request_id IS NOT NULL
  ) THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
  END IF;
  UPDATE commercial.signature_requests
     SET status = 'FAILED'
   WHERE id = v_id
     AND owner_organization_id = v_owner
     AND status = 'REQUESTED'
     AND provider_request_id IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'R7 signature request failure lost the envelope' USING ERRCODE = '40001';
  END IF;
  INSERT INTO audit.audit_events (
    id, owner_organization_id, actor_type, action, request_id, correlation_id,
    after_hash, redacted_diff, idempotency_key, occurred_at
  ) VALUES (
    p_audit_event_id, v_owner, 'SYSTEM'::audit."AuditActorType",
    'r7.signature.request_failed', left(p_request_id, 200), p_idempotency_key,
    p_request_hash,
    jsonb_build_object(
      'outcome', 'FAILED',
      'signatureRequestId', v_id,
      'contractId', v_contract,
      'contractVersionId', v_version
    ),
    'r7:signature-request-failed:' || v_owner::text || ':' || v_id::text,
    clock_timestamp()
  );
  RETURN jsonb_build_object('kind', 'error', 'code', 'PROVIDER_FAILED');
END;
$$;

REVOKE ALL ON FUNCTION platform.reserve_r7_signature_request(
  uuid, uuid, uuid, uuid, integer, integer, text, text, text, text, text
) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.record_r7_signature_provider(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.complete_r7_signature_request(uuid, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.fail_r7_signature_request(uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.reserve_r7_signature_request(
  uuid, uuid, uuid, uuid, integer, integer, text, text, text, text, text
) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION platform.record_r7_signature_provider(text, text, text) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION platform.complete_r7_signature_request(uuid, text, text, text, text) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION platform.fail_r7_signature_request(uuid, text, text, text) TO perspective_runtime;
