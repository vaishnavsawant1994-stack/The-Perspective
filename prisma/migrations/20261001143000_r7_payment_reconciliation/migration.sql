-- Provider payment truth is server-owned.
-- SUCCEEDED allocates only against a finalized invoice and never beyond the
-- remaining balance. Duplicate provider event identity does not create a
-- second payment or a second ledger entry. Refunds are not this slice.
-- perspective_runtime may still insert a CREATED placeholder with no provider
-- event. It cannot write SUCCEEDED, FAILED, CANCELED, or ledger money.

ALTER TABLE commercial.payments
  ADD COLUMN event_hash CHAR(64),
  ADD COLUMN audit_event_id UUID;

ALTER TABLE commercial.payments
  ADD CONSTRAINT payments_status CHECK (
    status IN ('CREATED','PENDING_PROVIDER','SUCCEEDED','FAILED','CANCELED')
  ),
  ADD CONSTRAINT payments_provider_evidence CHECK (
    status NOT IN ('SUCCEEDED','FAILED','CANCELED')
    OR (
      provider_event_id IS NOT NULL
      AND length(btrim(provider_event_id)) BETWEEN 1 AND 500
      AND event_hash ~ '^[0-9a-f]{64}$'
      AND amount_minor > 0
    )
  );

CREATE OR REPLACE FUNCTION commercial.guard_r7_invoice_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF current_user = 'perspective_runtime' THEN
    RAISE EXCEPTION 'R7 invoice writes are server-owned' USING ERRCODE = '42501';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'R7 invoices are immutable records' USING ERRCODE = '42501';
  END IF;
  IF NEW.owner_organization_id IS DISTINCT FROM OLD.owner_organization_id
     OR NEW.client_account_id IS DISTINCT FROM OLD.client_account_id
     OR NEW.resource_id IS DISTINCT FROM OLD.resource_id
     OR NEW.proposal_id IS DISTINCT FROM OLD.proposal_id
     OR NEW.source_contract_id IS DISTINCT FROM OLD.source_contract_id
     OR NEW.source_contract_version_id IS DISTINCT FROM OLD.source_contract_version_id
     OR NEW.source_contract_version IS DISTINCT FROM OLD.source_contract_version
     OR NEW.currency IS DISTINCT FROM OLD.currency
     OR NEW.subtotal_minor IS DISTINCT FROM OLD.subtotal_minor
     OR NEW.tax_minor IS DISTINCT FROM OLD.tax_minor
     OR NEW.total_minor IS DISTINCT FROM OLD.total_minor
     OR NEW.idempotency_key IS DISTINCT FROM OLD.idempotency_key
     OR NEW.request_hash IS DISTINCT FROM OLD.request_hash
     OR (OLD.issue_idempotency_key IS NOT NULL AND NEW.issue_idempotency_key IS DISTINCT FROM OLD.issue_idempotency_key)
     OR (OLD.issue_request_hash IS NOT NULL AND NEW.issue_request_hash IS DISTINCT FROM OLD.issue_request_hash)
     OR (OLD.finalized_at IS NOT NULL AND NEW.finalized_at IS DISTINCT FROM OLD.finalized_at)
  THEN
    RAISE EXCEPTION 'R7 invoice source and financial snapshot are immutable' USING ERRCODE = '42501';
  END IF;
  IF NEW.allocated_minor IS DISTINCT FROM OLD.allocated_minor
     AND (
       NEW.allocated_minor < OLD.allocated_minor
       OR OLD.status NOT IN ('FINALIZED', 'PARTIALLY_PAID')
       OR NEW.status NOT IN ('PARTIALLY_PAID', 'PAID')
     )
  THEN
    RAISE EXCEPTION 'R7 invoice allocation is server-owned' USING ERRCODE = '42501';
  END IF;
  IF NEW.status = 'PAID' AND NEW.allocated_minor <> NEW.total_minor THEN
    RAISE EXCEPTION 'invalid R7 invoice transition' USING ERRCODE = '42501';
  END IF;
  IF NEW.status = 'PARTIALLY_PAID'
     AND (NEW.allocated_minor <= 0 OR NEW.allocated_minor >= NEW.total_minor)
  THEN
    RAISE EXCEPTION 'invalid R7 invoice transition' USING ERRCODE = '42501';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NOT (
       (OLD.status = 'DRAFT' AND NEW.status = 'FINALIZED' AND NEW.allocated_minor = OLD.allocated_minor)
       OR (OLD.status = 'FINALIZED' AND NEW.status IN ('PARTIALLY_PAID', 'PAID'))
       OR (OLD.status = 'PARTIALLY_PAID' AND NEW.status = 'PAID')
     )
  THEN
    RAISE EXCEPTION 'invalid R7 invoice transition' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION commercial.guard_r7_payment_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'R7 payments are immutable records' USING ERRCODE = '42501';
  END IF;
  IF current_user = 'perspective_runtime' THEN
    IF TG_OP <> 'INSERT'
       OR NEW.status <> 'CREATED'
       OR NEW.provider_event_id IS NOT NULL
       OR NEW.event_hash IS NOT NULL
       OR NEW.audit_event_id IS NOT NULL
    THEN
      RAISE EXCEPTION 'R7 payment provider truth is server-owned' USING ERRCODE = '42501';
    END IF;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status IN ('SUCCEEDED', 'FAILED', 'CANCELED') THEN
    RAISE EXCEPTION 'R7 provider payment evidence is immutable' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER payments_mutation_guard
  BEFORE INSERT OR UPDATE OR DELETE ON commercial.payments
  FOR EACH ROW EXECUTE FUNCTION commercial.guard_r7_payment_mutation();

CREATE OR REPLACE FUNCTION commercial.guard_r7_ledger_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION 'R7 ledger is append-only' USING ERRCODE = '42501';
  END IF;
  IF current_user = 'perspective_runtime' THEN
    RAISE EXCEPTION 'R7 ledger writes are server-owned' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER ledger_entries_append_only
  BEFORE INSERT OR UPDATE OR DELETE ON commercial.ledger_entries
  FOR EACH ROW EXECUTE FUNCTION commercial.guard_r7_ledger_mutation();

CREATE OR REPLACE FUNCTION platform.reconcile_r7_payment_event(
  p_payment_id uuid,
  p_audit_event_id uuid,
  p_ledger_id uuid,
  p_provider text,
  p_provider_event_id text,
  p_invoice_id uuid,
  p_currency text,
  p_amount_minor bigint,
  p_event_type text,
  p_normalized_evidence jsonb,
  p_occurred_at timestamptz
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
  v_existing_id uuid;
  v_existing_invoice uuid;
  v_existing_status text;
  v_invoice_id uuid;
  v_invoice_status text;
  v_currency text;
  v_total bigint;
  v_allocated bigint;
  v_next_allocated bigint;
  v_next_status text;
  v_payment_status text;
  v_idempotency text;
BEGIN
  v_owner := platform.current_organization_id();
  IF v_owner IS NULL
     OR p_payment_id IS NULL
     OR p_audit_event_id IS NULL
     OR p_ledger_id IS NULL
     OR p_provider !~ '^[a-z0-9][a-z0-9._-]{0,99}$'
     OR NULLIF(btrim(p_provider_event_id), '') IS NULL
     OR length(p_provider_event_id) > 500
     OR p_invoice_id IS NULL
     OR p_currency !~ '^[A-Z]{3}$'
     OR p_amount_minor IS NULL
     OR p_amount_minor <= 0
     OR p_event_type NOT IN ('PAYMENT_SUCCEEDED', 'PAYMENT_FAILED', 'PAYMENT_CANCELED')
     OR p_normalized_evidence IS NULL
     OR jsonb_typeof(p_normalized_evidence) <> 'object'
     OR p_occurred_at IS NULL
  THEN
    RAISE EXCEPTION 'invalid R7 payment reconciliation' USING ERRCODE = '42501';
  END IF;

  v_hash := encode(platform.digest(convert_to(jsonb_build_object(
    'amountMinor', p_amount_minor::text,
    'currency', p_currency,
    'eventType', p_event_type,
    'invoiceId', p_invoice_id,
    'normalizedEvidence', p_normalized_evidence,
    'occurredAt', to_char(p_occurred_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'provider', p_provider,
    'providerEventId', p_provider_event_id
  )::text, 'UTF8'), 'sha256'), 'hex');
  v_idempotency := 'r7:payment-event:' || v_owner::text || ':' || p_provider || ':' || p_provider_event_id;

  SELECT payment.owner_organization_id, payment.event_hash, payment.id,
         payment.invoice_id, payment.status
    INTO v_existing_owner, v_existing_hash, v_existing_id, v_existing_invoice, v_existing_status
    FROM commercial.payments AS payment
   WHERE payment.provider = p_provider
     AND payment.provider_event_id = p_provider_event_id
   FOR UPDATE;
  IF v_existing_id IS NOT NULL THEN
    IF v_existing_owner <> v_owner OR v_existing_hash IS DISTINCT FROM v_hash THEN
      RAISE EXCEPTION 'R7 payment event evidence conflict' USING ERRCODE = '23505';
    END IF;
    SELECT invoice.status, invoice.allocated_minor
      INTO v_invoice_status, v_allocated
      FROM commercial.invoices AS invoice
     WHERE invoice.id = v_existing_invoice
       AND invoice.owner_organization_id = v_owner;
    RETURN jsonb_build_object(
      'kind', 'ok',
      'code', 'REPLAY',
      'paymentId', v_existing_id,
      'invoiceId', v_existing_invoice,
      'paymentStatus', v_existing_status,
      'invoiceStatus', v_invoice_status,
      'allocatedMinor', COALESCE(v_allocated, 0)::text
    );
  END IF;

  SELECT invoice.id, invoice.status, rtrim(invoice.currency), invoice.total_minor, invoice.allocated_minor
    INTO v_invoice_id, v_invoice_status, v_currency, v_total, v_allocated
    FROM commercial.invoices AS invoice
   WHERE invoice.id = p_invoice_id
     AND invoice.owner_organization_id = v_owner
   FOR UPDATE;
  IF v_invoice_id IS NULL THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;
  IF v_currency <> p_currency THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CORRELATION_DENIED');
  END IF;
  IF v_invoice_status NOT IN ('FINALIZED', 'PARTIALLY_PAID', 'PAID') THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
  END IF;

  IF p_event_type = 'PAYMENT_SUCCEEDED' THEN
    IF v_invoice_status NOT IN ('FINALIZED', 'PARTIALLY_PAID') THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
    END IF;
    IF p_amount_minor > (v_total - v_allocated) THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'OVER_ALLOCATION');
    END IF;
    v_next_allocated := v_allocated + p_amount_minor;
    v_next_status := CASE WHEN v_next_allocated = v_total THEN 'PAID' ELSE 'PARTIALLY_PAID' END;
    v_payment_status := 'SUCCEEDED';
  ELSE
    v_next_allocated := v_allocated;
    v_next_status := v_invoice_status;
    v_payment_status := CASE WHEN p_event_type = 'PAYMENT_FAILED' THEN 'FAILED' ELSE 'CANCELED' END;
  END IF;

  INSERT INTO audit.audit_events (
    id, owner_organization_id, actor_type, action, request_id, correlation_id,
    after_hash, redacted_diff, idempotency_key, occurred_at
  ) VALUES (
    p_audit_event_id, v_owner, 'SYSTEM'::audit."AuditActorType",
    'r7.payment.reconciled', left(v_idempotency, 200), v_idempotency, v_hash,
    jsonb_build_object(
      'outcome', CASE
        WHEN p_event_type <> 'PAYMENT_SUCCEEDED' THEN 'RECORDED'
        WHEN v_next_status = 'PAID' THEN 'PAID'
        ELSE 'ALLOCATED'
      END,
      'provider', p_provider,
      'providerEventId', p_provider_event_id,
      'paymentId', p_payment_id,
      'invoiceId', v_invoice_id,
      'amountMinor', p_amount_minor::text,
      'currency', p_currency,
      'invoiceStatus', v_next_status
    ),
    v_idempotency, p_occurred_at
  );
  INSERT INTO commercial.payments (
    id, owner_organization_id, invoice_id, provider, provider_event_id, status,
    currency, amount_minor, event_hash, audit_event_id, updated_at
  ) VALUES (
    p_payment_id, v_owner, v_invoice_id, p_provider, p_provider_event_id, v_payment_status,
    p_currency, p_amount_minor, v_hash, p_audit_event_id, p_occurred_at
  );
  IF p_event_type = 'PAYMENT_SUCCEEDED' THEN
    INSERT INTO commercial.ledger_entries (
      id, owner_organization_id, invoice_id, payment_id, entry_type, currency, amount_minor
    ) VALUES (
      p_ledger_id, v_owner, v_invoice_id, p_payment_id, 'PAYMENT', p_currency, p_amount_minor
    );
    UPDATE commercial.invoices
       SET allocated_minor = v_next_allocated,
           status = v_next_status,
           row_version = row_version + 1,
           updated_at = p_occurred_at
     WHERE id = v_invoice_id
       AND owner_organization_id = v_owner
       AND status = v_invoice_status
       AND allocated_minor = v_allocated;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'R7 payment reconciliation lost the invoice' USING ERRCODE = '40001';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'kind', 'ok',
    'code', CASE
      WHEN p_event_type <> 'PAYMENT_SUCCEEDED' THEN 'RECORDED'
      WHEN v_next_status = 'PAID' THEN 'PAID'
      ELSE 'ALLOCATED'
    END,
    'paymentId', p_payment_id,
    'invoiceId', v_invoice_id,
    'paymentStatus', v_payment_status,
    'invoiceStatus', v_next_status,
    'allocatedMinor', v_next_allocated::text
  );
EXCEPTION
  WHEN unique_violation THEN
    SELECT payment.owner_organization_id, payment.event_hash, payment.id,
           payment.invoice_id, payment.status
      INTO v_existing_owner, v_existing_hash, v_existing_id, v_existing_invoice, v_existing_status
      FROM commercial.payments AS payment
     WHERE payment.provider = p_provider
       AND payment.provider_event_id = p_provider_event_id;
    IF v_existing_owner = v_owner AND v_existing_hash = v_hash THEN
      SELECT invoice.status, invoice.allocated_minor
        INTO v_invoice_status, v_allocated
        FROM commercial.invoices AS invoice
       WHERE invoice.id = v_existing_invoice
         AND invoice.owner_organization_id = v_owner;
      RETURN jsonb_build_object(
        'kind', 'ok',
        'code', 'REPLAY',
        'paymentId', v_existing_id,
        'invoiceId', v_existing_invoice,
        'paymentStatus', v_existing_status,
        'invoiceStatus', v_invoice_status,
        'allocatedMinor', COALESCE(v_allocated, 0)::text
      );
    END IF;
    RAISE EXCEPTION 'R7 payment event evidence conflict' USING ERRCODE = '23505';
END;
$$;

REVOKE INSERT ON commercial.ledger_entries FROM perspective_runtime;
REVOKE ALL ON FUNCTION commercial.guard_r7_payment_mutation() FROM PUBLIC;
REVOKE ALL ON FUNCTION commercial.guard_r7_ledger_mutation() FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.reconcile_r7_payment_event(
  uuid, uuid, uuid, text, text, uuid, text, bigint, text, jsonb, timestamptz
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.reconcile_r7_payment_event(
  uuid, uuid, uuid, text, text, uuid, text, bigint, text, jsonb, timestamptz
) TO perspective_runtime;
