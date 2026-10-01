-- invoice.send records delivery intent only. It does not change invoice
-- status, money, source, or row version. A finalized, partially paid, or paid
-- invoice may be delivered. Draft, void, and credited invoices cannot.

CREATE OR REPLACE FUNCTION platform.send_r7_invoice(
  p_receipt_id uuid,
  p_audit_id uuid,
  p_outbox_id uuid,
  p_invoice_id uuid,
  p_expected_row_version integer,
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
  v_existing_hash text;
  v_existing_state platform."IdempotencyState";
  v_invoice uuid;
  v_status text;
  v_currency text;
  v_total bigint;
  v_row integer;
  v_now timestamptz;
BEGIN
  v_owner := platform.current_organization_id();
  IF v_owner IS NULL
     OR p_receipt_id IS NULL
     OR p_audit_id IS NULL
     OR p_outbox_id IS NULL
     OR p_invoice_id IS NULL
     OR p_expected_row_version IS NULL
     OR p_expected_row_version < 1
     OR NULLIF(btrim(p_request_id), '') IS NULL
     OR p_request_hash !~ '^[0-9a-f]{64}$'
     OR p_idempotency_key !~ ('^r7:invoice-send:' || v_owner::text || ':[A-Za-z0-9._:-]{8,128}$')
  THEN
    RAISE EXCEPTION 'invalid R7 invoice send' USING ERRCODE = '22023';
  END IF;

  SELECT request_hash, state
    INTO v_existing_hash, v_existing_state
    FROM platform.idempotency_receipts
   WHERE owner_organization_id = v_owner
     AND scope = 'commercial.invoice-send'
     AND idempotency_key = p_idempotency_key
   FOR UPDATE;
  IF FOUND THEN
    IF v_existing_hash IS DISTINCT FROM p_request_hash THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'IDEMPOTENCY_CONFLICT');
    END IF;
    IF v_existing_state = 'COMPLETED' THEN
      RETURN (
        SELECT jsonb_build_object(
          'kind', 'ok',
          'code', 'REPLAY',
          'invoiceId', event.redacted_diff->>'invoiceId',
          'status', event.redacted_diff->>'status',
          'currency', event.redacted_diff->>'currency',
          'totalMinor', event.redacted_diff->>'totalMinor',
          'rowVersion', (event.redacted_diff->>'rowVersion')::integer
        )
        FROM audit.audit_events AS event
        WHERE event.owner_organization_id = v_owner
          AND event.idempotency_key = p_idempotency_key
          AND event.action = 'r7.invoice.sent'
        LIMIT 1
      );
    END IF;
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
  END IF;

  SELECT invoice.id, invoice.status, rtrim(invoice.currency),
         invoice.total_minor, invoice.row_version
    INTO v_invoice, v_status, v_currency, v_total, v_row
    FROM commercial.invoices AS invoice
   WHERE invoice.id = p_invoice_id
     AND invoice.owner_organization_id = v_owner
     AND invoice.archived_at IS NULL
   FOR UPDATE;
  IF v_invoice IS NULL THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;
  IF v_status NOT IN ('FINALIZED', 'PARTIALLY_PAID', 'PAID') THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
  END IF;
  IF v_row <> p_expected_row_version THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
  END IF;

  v_now := clock_timestamp();
  INSERT INTO platform.idempotency_receipts (
    id, owner_organization_id, scope, idempotency_key, request_hash,
    state, response_status, response_hash, created_at, completed_at, expires_at
  ) VALUES (
    p_receipt_id, v_owner, 'commercial.invoice-send', p_idempotency_key, p_request_hash,
    'COMPLETED', 202, p_request_hash, v_now, v_now, v_now + interval '1 day'
  );
  INSERT INTO audit.audit_events (
    id, owner_organization_id, actor_type, action, request_id, correlation_id,
    after_hash, redacted_diff, idempotency_key, occurred_at
  ) VALUES (
    p_audit_id, v_owner, 'SYSTEM'::audit."AuditActorType",
    'r7.invoice.sent', left(p_request_id, 200), p_idempotency_key, p_request_hash,
    jsonb_build_object(
      'invoiceId', v_invoice,
      'status', v_status,
      'currency', v_currency,
      'totalMinor', v_total::text,
      'rowVersion', v_row,
      'delivery', 'QUEUED'
    ),
    p_idempotency_key, v_now
  );
  INSERT INTO platform.outbox_events (
    id, owner_organization_id, aggregate_resource_id, event_type,
    schema_version, payload, idempotency_key, status, available_at, created_at
  ) VALUES (
    p_outbox_id, v_owner, NULL, 'r7.invoice.send.requested',
    1, jsonb_build_object(
      'invoiceId', v_invoice,
      'status', v_status,
      'currency', v_currency,
      'totalMinor', v_total::text
    ),
    p_idempotency_key, 'PENDING'::platform."ProcessingStatus",
    v_now, v_now
  );

  RETURN jsonb_build_object(
    'kind', 'ok',
    'code', 'SENT',
    'invoiceId', v_invoice,
    'status', v_status,
    'currency', v_currency,
    'totalMinor', v_total::text,
    'rowVersion', v_row
  );
END;
$$;

REVOKE ALL ON FUNCTION platform.send_r7_invoice(uuid, uuid, uuid, uuid, integer, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.send_r7_invoice(uuid, uuid, uuid, uuid, integer, text, text, text) TO perspective_runtime;
