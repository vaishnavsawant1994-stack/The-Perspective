-- Server-owned R7 signature reconciliation.
-- perspective_runtime may execute this function only. It still cannot write
-- contract or signature tables directly, and no browser route can set SIGNED.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA platform;

CREATE OR REPLACE FUNCTION platform.reconcile_r7_signature_event(
  p_event_row_id uuid,
  p_audit_event_id uuid,
  p_provider text,
  p_provider_event_id text,
  p_provider_request_id text,
  p_contract_version_id uuid,
  p_document_sha256 text,
  p_event_type text,
  p_signer_key text,
  p_provider_occurred_at timestamptz,
  p_normalized_evidence jsonb,
  p_received_at timestamptz,
  p_verified_at timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform, audit, commercial
AS $$
DECLARE
  v_owner uuid;
  v_hash text;
  v_existing_owner uuid;
  v_existing_hash text;
  v_existing_request uuid;
  v_prior text;
  v_request_id uuid;
  v_request_contract uuid;
  v_request_version uuid;
  v_request_digest text;
  v_version_id uuid;
  v_version_contract uuid;
  v_version_status text;
  v_version_digest text;
  v_required integer;
  v_completed integer;
  v_known boolean;
  v_signer_required boolean;
  v_outcome text;
  v_next_status text;
  v_request_status text;
  v_applied timestamptz;
  v_idempotency text;
  v_inserted boolean := false;
BEGIN
  v_owner := platform.current_organization_id();
  IF v_owner IS NULL
     OR p_event_row_id IS NULL
     OR p_audit_event_id IS NULL
     OR p_provider !~ '^[a-z0-9][a-z0-9._-]{0,99}$'
     OR NULLIF(btrim(p_provider_event_id), '') IS NULL
     OR length(p_provider_event_id) > 500
     OR NULLIF(btrim(p_provider_request_id), '') IS NULL
     OR length(p_provider_request_id) > 500
     OR p_contract_version_id IS NULL
     OR p_document_sha256 !~ '^[0-9a-f]{64}$'
     OR p_event_type NOT IN ('SIGNER_COMPLETED', 'REQUEST_VOIDED', 'REQUEST_EXPIRED')
     OR (p_event_type = 'SIGNER_COMPLETED' AND NULLIF(btrim(p_signer_key), '') IS NULL)
     OR (p_signer_key IS NOT NULL AND (length(p_signer_key) = 0 OR length(p_signer_key) > 500))
     OR p_normalized_evidence IS NULL
     OR jsonb_typeof(p_normalized_evidence) <> 'object'
     OR p_received_at IS NULL
     OR p_verified_at IS NULL
  THEN
    RAISE EXCEPTION 'invalid R7 signature reconciliation context' USING ERRCODE = '42501';
  END IF;

  v_hash := encode(platform.digest(convert_to(jsonb_build_object(
    'contractVersionId', p_contract_version_id,
    'documentSha256', p_document_sha256,
    'eventType', p_event_type,
    'normalizedEvidence', p_normalized_evidence,
    'provider', p_provider,
    'providerEventId', p_provider_event_id,
    'providerOccurredAt', CASE
      WHEN p_provider_occurred_at IS NULL THEN NULL
      ELSE to_char(p_provider_occurred_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
    END,
    'providerRequestId', p_provider_request_id,
    'signerKey', p_signer_key
  )::text, 'UTF8'), 'sha256'), 'hex');
  v_idempotency := 'r7:signature-event:' || v_owner::text || ':' || p_provider || ':' || p_provider_event_id;

  SELECT event.owner_organization_id, event.event_hash, event.signature_request_id
    INTO v_existing_owner, v_existing_hash, v_existing_request
    FROM commercial.signature_events AS event
   WHERE event.provider = p_provider
     AND event.provider_event_id = p_provider_event_id
   FOR UPDATE;
  IF v_existing_owner IS NOT NULL THEN
    IF v_existing_owner <> v_owner OR v_existing_hash <> v_hash THEN
      RAISE EXCEPTION 'R7 signature event evidence conflict' USING ERRCODE = '23505';
    END IF;
    SELECT event.redacted_diff->>'outcome' INTO v_prior
      FROM audit.audit_events AS event
     WHERE event.idempotency_key = v_idempotency
       AND event.owner_organization_id = v_owner;
    RETURN jsonb_build_object(
      'kind', 'ok',
      'code', 'REPLAY',
      'priorCode', COALESCE(v_prior, 'REPLAY'),
      'signatureRequestId', v_existing_request,
      'contractVersionId', p_contract_version_id
    );
  END IF;

  SELECT request.id, request.contract_id, request.contract_version_id, request.document_sha256
    INTO v_request_id, v_request_contract, v_request_version, v_request_digest
    FROM commercial.signature_requests AS request
   WHERE request.owner_organization_id = v_owner
     AND request.provider = p_provider
     AND request.provider_request_id = p_provider_request_id
   FOR UPDATE;
  IF v_request_id IS NULL THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;

  SELECT version.id, version.contract_id, version.status, version.document_sha256
    INTO v_version_id, v_version_contract, v_version_status, v_version_digest
    FROM commercial.contract_versions AS version
   WHERE version.id = v_request_version
     AND version.owner_organization_id = v_owner
     AND version.contract_id = v_request_contract
   FOR UPDATE;
  IF v_version_id IS NULL
     OR v_request_version <> p_contract_version_id
     OR v_version_digest <> v_request_digest
     OR v_request_digest <> p_document_sha256
     OR v_version_contract <> v_request_contract
  THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CORRELATION_DENIED');
  END IF;

  PERFORM 1 FROM commercial.contracts AS contract
   WHERE contract.id = v_request_contract
     AND contract.owner_organization_id = v_owner
   FOR UPDATE;

  IF v_version_status IN ('SIGNED', 'VOID', 'EXPIRED') THEN
    v_outcome := 'IGNORED_TERMINAL';
    v_next_status := v_version_status;
    v_request_status := NULL;
    v_applied := NULL;
  ELSIF v_version_status <> 'OUT_FOR_SIGNATURE' THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
  ELSIF p_event_type = 'REQUEST_VOIDED' THEN
    v_outcome := 'VOIDED';
    v_next_status := 'VOID';
    v_request_status := 'VOID';
    v_applied := p_verified_at;
  ELSIF p_event_type = 'REQUEST_EXPIRED' THEN
    v_outcome := 'EXPIRED';
    v_next_status := 'EXPIRED';
    v_request_status := 'EXPIRED';
    v_applied := p_verified_at;
  ELSE
    SELECT TRUE INTO v_known
      FROM commercial.contract_signers AS signer
     WHERE signer.owner_organization_id = v_owner
       AND signer.contract_version_id = v_version_id
       AND signer.signer_key = p_signer_key;
    IF v_known IS NOT TRUE THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'SIGNER_DENIED');
    END IF;
    SELECT EXISTS (
      SELECT 1
        FROM commercial.contract_signers AS signer
       WHERE signer.owner_organization_id = v_owner
         AND signer.contract_version_id = v_version_id
         AND signer.signer_key = p_signer_key
         AND signer.required IS TRUE
    ) INTO v_signer_required;
    SELECT count(*) INTO v_required
      FROM commercial.contract_signers AS signer
     WHERE signer.owner_organization_id = v_owner
       AND signer.contract_version_id = v_version_id
       AND signer.required IS TRUE;
    IF v_required = 0 THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
    END IF;
    SELECT count(DISTINCT event.signer_key) INTO v_completed
      FROM commercial.signature_events AS event
     WHERE event.owner_organization_id = v_owner
       AND event.signature_request_id = v_request_id
       AND event.event_type = 'SIGNER_COMPLETED'
       AND event.applied_at IS NOT NULL
       AND event.signer_key IN (
         SELECT signer.signer_key
           FROM commercial.contract_signers AS signer
          WHERE signer.owner_organization_id = v_owner
            AND signer.contract_version_id = v_version_id
            AND signer.required IS TRUE
       );
    IF v_signer_required AND NOT EXISTS (
      SELECT 1 FROM commercial.signature_events AS event
       WHERE event.owner_organization_id = v_owner
         AND event.signature_request_id = v_request_id
         AND event.event_type = 'SIGNER_COMPLETED'
         AND event.applied_at IS NOT NULL
         AND event.signer_key = p_signer_key
    ) THEN
      v_completed := v_completed + 1;
    END IF;
    IF v_completed >= v_required THEN
      v_outcome := 'SIGNED';
      v_next_status := 'SIGNED';
      v_request_status := 'COMPLETED';
    ELSE
      v_outcome := 'SIGNER_RECORDED';
      v_next_status := 'OUT_FOR_SIGNATURE';
      v_request_status := NULL;
    END IF;
    v_applied := p_verified_at;
  END IF;

  BEGIN
    INSERT INTO audit.audit_events (
      id, owner_organization_id, actor_type, action, request_id, correlation_id,
      after_hash, redacted_diff, idempotency_key, occurred_at
    ) VALUES (
      p_audit_event_id, v_owner, 'SYSTEM'::audit."AuditActorType",
      'r7.signature.reconciled',
      left(v_idempotency, 200), v_idempotency, v_hash,
      jsonb_build_object(
        'outcome', v_outcome,
        'provider', p_provider,
        'providerEventId', p_provider_event_id,
        'signatureRequestId', v_request_id,
        'contractId', v_request_contract,
        'contractVersionId', v_version_id,
        'documentSha256', p_document_sha256,
        'signerKey', p_signer_key,
        'eventType', p_event_type,
        'contractStatus', v_next_status
      ),
      v_idempotency, p_verified_at
    );
    INSERT INTO commercial.signature_events (
      id, owner_organization_id, signature_request_id, provider, provider_event_id,
      event_type, event_hash, signer_key, provider_occurred_at, received_at,
      verified_at, normalized_evidence, applied_at, audit_event_id
    ) VALUES (
      p_event_row_id, v_owner, v_request_id, p_provider, p_provider_event_id,
      p_event_type, v_hash, p_signer_key, p_provider_occurred_at, p_received_at,
      p_verified_at, p_normalized_evidence, v_applied, p_audit_event_id
    );
    v_inserted := true;
  EXCEPTION
    WHEN unique_violation THEN
      SELECT event.owner_organization_id, event.event_hash, event.signature_request_id
        INTO v_existing_owner, v_existing_hash, v_existing_request
        FROM commercial.signature_events AS event
       WHERE event.provider = p_provider
         AND event.provider_event_id = p_provider_event_id;
      IF v_existing_owner = v_owner AND v_existing_hash = v_hash THEN
        SELECT event.redacted_diff->>'outcome' INTO v_prior
          FROM audit.audit_events AS event
         WHERE event.idempotency_key = v_idempotency
           AND event.owner_organization_id = v_owner;
        RETURN jsonb_build_object(
          'kind', 'ok',
          'code', 'REPLAY',
          'priorCode', COALESCE(v_prior, 'REPLAY'),
          'signatureRequestId', v_existing_request,
          'contractId', v_request_contract,
          'contractVersionId', v_version_id,
          'contractStatus', v_version_status
        );
      END IF;
      RAISE EXCEPTION 'R7 signature event evidence conflict' USING ERRCODE = '23505';
  END;

  IF NOT v_inserted THEN
    RAISE EXCEPTION 'R7 signature reconciliation did not persist' USING ERRCODE = '55000';
  END IF;

  IF v_next_status IS DISTINCT FROM v_version_status THEN
    UPDATE commercial.contract_versions
       SET status = v_next_status,
           signed_at = CASE WHEN v_next_status = 'SIGNED' THEN p_verified_at ELSE signed_at END
     WHERE id = v_version_id
       AND owner_organization_id = v_owner
       AND status = v_version_status;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'R7 signature reconciliation lost the contract version' USING ERRCODE = '40001';
    END IF;
    UPDATE commercial.contracts
       SET status = v_next_status,
           row_version = row_version + 1,
           updated_at = p_verified_at
     WHERE id = v_request_contract
       AND owner_organization_id = v_owner;
  END IF;

  IF v_request_status IS NOT NULL OR v_inserted THEN
    UPDATE commercial.signature_requests
       SET status = COALESCE(v_request_status, status),
           completed_at = CASE
             WHEN v_request_status = 'COMPLETED' THEN p_verified_at
             ELSE completed_at
           END
     WHERE id = v_request_id
       AND owner_organization_id = v_owner;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'R7 signature reconciliation lost the signature request' USING ERRCODE = '40001';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'kind', 'ok',
    'code', v_outcome,
    'signatureRequestId', v_request_id,
    'contractId', v_request_contract,
    'contractVersionId', v_version_id,
    'contractStatus', v_next_status
  );
END;
$$;

REVOKE ALL ON FUNCTION platform.reconcile_r7_signature_event(
  uuid, uuid, text, text, text, uuid, text, text, text, timestamptz, jsonb, timestamptz, timestamptz
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.reconcile_r7_signature_event(
  uuid, uuid, text, text, text, uuid, text, text, text, timestamptz, jsonb, timestamptz, timestamptz
) TO perspective_runtime;
