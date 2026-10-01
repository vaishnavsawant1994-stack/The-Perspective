-- Invoice drafts come only from one immutable SIGNED ContractVersion.
-- ContractVersion stores aggregate money, not lines. Lines are copied from the
-- ACCEPTED proposal version that version pins, recomputed, and must equal its
-- subtotal. proposal_id is not a source. There is no invoice.finalize key.
-- perspective_runtime cannot write invoice tables.

ALTER TABLE commercial.invoices
  ADD COLUMN source_contract_id UUID,
  ADD COLUMN source_contract_version_id UUID,
  ADD COLUMN source_contract_version INTEGER,
  ADD COLUMN subtotal_minor BIGINT,
  ADD COLUMN tax_minor BIGINT,
  ADD COLUMN idempotency_key TEXT,
  ADD COLUMN request_hash CHAR(64),
  ADD COLUMN issue_idempotency_key TEXT,
  ADD COLUMN issue_request_hash CHAR(64);

ALTER TABLE commercial.invoices
  ADD CONSTRAINT invoices_status CHECK (
    status IN ('DRAFT','FINALIZED','PARTIALLY_PAID','PAID','VOID','CREDITED')
  ),
  ADD CONSTRAINT invoices_finalized_timestamp CHECK ((status = 'DRAFT') = (finalized_at IS NULL)),
  ADD CONSTRAINT invoices_source_shape CHECK (
    (
      source_contract_id IS NULL
      AND source_contract_version_id IS NULL
      AND source_contract_version IS NULL
      AND subtotal_minor IS NULL
      AND tax_minor IS NULL
      AND idempotency_key IS NULL
      AND request_hash IS NULL
      AND issue_idempotency_key IS NULL
      AND issue_request_hash IS NULL
    )
    OR (
      source_contract_id IS NOT NULL
      AND source_contract_version_id IS NOT NULL
      AND source_contract_version > 0
      AND proposal_id IS NULL
      AND subtotal_minor >= 0
      AND tax_minor >= 0
      AND total_minor = subtotal_minor + tax_minor
      AND idempotency_key IS NOT NULL
      AND request_hash ~ '^[0-9a-f]{64}$'
      AND (
        (issue_idempotency_key IS NULL AND issue_request_hash IS NULL)
        OR (issue_idempotency_key IS NOT NULL AND issue_request_hash ~ '^[0-9a-f]{64}$')
      )
    )
  ),
  ADD CONSTRAINT invoices_source_contract_version_fkey
    FOREIGN KEY (source_contract_version_id, source_contract_id, owner_organization_id, source_contract_version)
    REFERENCES commercial.contract_versions(id, contract_id, owner_organization_id, version)
    ON DELETE RESTRICT;

CREATE UNIQUE INDEX invoices_source_version_once
  ON commercial.invoices (owner_organization_id, source_contract_version_id)
  WHERE source_contract_version_id IS NOT NULL;

CREATE UNIQUE INDEX invoices_draft_idempotency
  ON commercial.invoices (owner_organization_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE UNIQUE INDEX invoices_issue_idempotency
  ON commercial.invoices (owner_organization_id, issue_idempotency_key)
  WHERE issue_idempotency_key IS NOT NULL;

CREATE TABLE commercial.invoice_lines (
  id UUID PRIMARY KEY,
  owner_organization_id UUID NOT NULL,
  invoice_id UUID NOT NULL,
  position INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_amount_minor BIGINT NOT NULL,
  line_total_minor BIGINT NOT NULL,
  CONSTRAINT invoice_lines_position UNIQUE (invoice_id, position),
  CONSTRAINT invoice_lines_qty CHECK (quantity >= 1),
  CONSTRAINT invoice_lines_amounts CHECK (
    unit_amount_minor >= 0
    AND line_total_minor = quantity::bigint * unit_amount_minor
  ),
  CONSTRAINT invoice_lines_invoice_fkey
    FOREIGN KEY (invoice_id, owner_organization_id)
    REFERENCES commercial.invoices(id, owner_organization_id)
    ON DELETE RESTRICT
);

ALTER TABLE commercial.invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial.invoice_lines FORCE ROW LEVEL SECURITY;
CREATE POLICY r7_tenant ON commercial.invoice_lines
  USING (owner_organization_id = NULLIF(current_setting('app.organization_id', true), '')::uuid)
  WITH CHECK (owner_organization_id = NULLIF(current_setting('app.organization_id', true), '')::uuid);

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
     OR NEW.allocated_minor IS DISTINCT FROM OLD.allocated_minor
     OR NEW.idempotency_key IS DISTINCT FROM OLD.idempotency_key
     OR NEW.request_hash IS DISTINCT FROM OLD.request_hash
     OR (OLD.issue_idempotency_key IS NOT NULL AND NEW.issue_idempotency_key IS DISTINCT FROM OLD.issue_idempotency_key)
     OR (OLD.issue_request_hash IS NOT NULL AND NEW.issue_request_hash IS DISTINCT FROM OLD.issue_request_hash)
     OR (OLD.finalized_at IS NOT NULL AND NEW.finalized_at IS DISTINCT FROM OLD.finalized_at)
  THEN
    RAISE EXCEPTION 'R7 invoice source and financial snapshot are immutable' USING ERRCODE = '42501';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status
     AND (OLD.status <> 'DRAFT' OR NEW.status <> 'FINALIZED')
  THEN
    RAISE EXCEPTION 'invalid R7 invoice transition' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER invoices_mutation_guard
  BEFORE UPDATE OR DELETE ON commercial.invoices
  FOR EACH ROW EXECUTE FUNCTION commercial.guard_r7_invoice_mutation();

CREATE OR REPLACE FUNCTION commercial.guard_r7_invoice_line_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND current_user = 'perspective_runtime' THEN
    RAISE EXCEPTION 'R7 invoice writes are server-owned' USING ERRCODE = '42501';
  END IF;
  IF TG_OP <> 'INSERT' THEN
    RAISE EXCEPTION 'R7 invoice lines are immutable' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER invoice_lines_immutable
  BEFORE INSERT OR UPDATE OR DELETE ON commercial.invoice_lines
  FOR EACH ROW EXECUTE FUNCTION commercial.guard_r7_invoice_line_mutation();

CREATE OR REPLACE FUNCTION platform.create_r7_invoice_draft(
  p_invoice_id uuid,
  p_audit_event_id uuid,
  p_contract_id uuid,
  p_contract_version_id uuid,
  p_expected_version integer,
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
  v_existing_contract uuid;
  v_existing_version uuid;
  v_existing_status text;
  v_existing_currency text;
  v_existing_subtotal bigint;
  v_existing_tax bigint;
  v_existing_total bigint;
  v_existing_row integer;
  v_existing_lines integer;
  v_contract_id uuid;
  v_client_account uuid;
  v_current_version integer;
  v_contract_status text;
  v_version_contract uuid;
  v_version_number integer;
  v_version_status text;
  v_currency text;
  v_subtotal bigint;
  v_tax bigint;
  v_total bigint;
  v_proposal_version uuid;
  v_proposal_currency text;
  v_proposal_status text;
  v_proposal_immutable boolean;
  v_sum bigint;
  v_count integer;
  v_distinct integer;
  v_lines_ok boolean;
  v_resource_id uuid;
BEGIN
  v_owner := platform.current_organization_id();
  IF v_owner IS NULL
     OR p_invoice_id IS NULL
     OR p_audit_event_id IS NULL
     OR p_contract_id IS NULL
     OR p_contract_version_id IS NULL
     OR p_expected_version IS NULL
     OR p_expected_version < 1
     OR p_idempotency_key !~ ('^r7:invoice-draft:' || v_owner::text || ':[A-Za-z0-9._:-]{8,128}$')
     OR p_request_hash !~ '^[0-9a-f]{64}$'
     OR NULLIF(btrim(p_request_id), '') IS NULL
  THEN
    RAISE EXCEPTION 'invalid R7 invoice draft' USING ERRCODE = '22023';
  END IF;

  SELECT invoice.id, invoice.request_hash, invoice.source_contract_id, invoice.source_contract_version_id,
         invoice.status, invoice.currency, invoice.subtotal_minor, invoice.tax_minor, invoice.total_minor,
         invoice.row_version
    INTO v_existing_id, v_existing_hash, v_existing_contract, v_existing_version,
         v_existing_status, v_existing_currency, v_existing_subtotal, v_existing_tax, v_existing_total,
         v_existing_row
    FROM commercial.invoices AS invoice
   WHERE invoice.owner_organization_id = v_owner
     AND invoice.idempotency_key = p_idempotency_key
   FOR UPDATE;
  IF v_existing_id IS NOT NULL THEN
    IF v_existing_hash <> p_request_hash
       OR v_existing_contract IS DISTINCT FROM p_contract_id
       OR v_existing_version IS DISTINCT FROM p_contract_version_id
    THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'IDEMPOTENCY_CONFLICT');
    END IF;
    SELECT count(*) INTO v_existing_lines
      FROM commercial.invoice_lines AS line
     WHERE line.invoice_id = v_existing_id
       AND line.owner_organization_id = v_owner;
    RETURN jsonb_build_object(
      'kind', 'ok',
      'code', 'REPLAY',
      'invoiceId', v_existing_id,
      'contractId', v_existing_contract,
      'contractVersionId', v_existing_version,
      'status', v_existing_status,
      'currency', v_existing_currency,
      'subtotalMinor', v_existing_subtotal::text,
      'taxMinor', v_existing_tax::text,
      'totalMinor', v_existing_total::text,
      'rowVersion', v_existing_row,
      'lineCount', v_existing_lines
    );
  END IF;

  SELECT version.contract_id, version.version, version.status, version.currency,
         version.subtotal_minor, version.tax_minor, version.total_minor, version.source_proposal_version_id
    INTO v_version_contract, v_version_number, v_version_status, v_currency,
         v_subtotal, v_tax, v_total, v_proposal_version
    FROM commercial.contract_versions AS version
   WHERE version.id = p_contract_version_id
     AND version.owner_organization_id = v_owner
   FOR UPDATE;
  IF v_version_contract IS NULL THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;
  IF v_version_contract <> p_contract_id OR v_version_number <> p_expected_version THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CORRELATION_DENIED');
  END IF;

  SELECT contract.id, contract.client_account_id, contract.current_version, contract.status
    INTO v_contract_id, v_client_account, v_current_version, v_contract_status
    FROM commercial.contracts AS contract
   WHERE contract.id = v_version_contract
     AND contract.owner_organization_id = v_owner
   FOR UPDATE;
  IF v_contract_id IS NULL
     OR v_current_version <> v_version_number
     OR v_contract_status <> 'SIGNED'
     OR v_version_status <> 'SIGNED'
  THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
  END IF;

  SELECT version.currency, version.status, version.immutable
    INTO v_proposal_currency, v_proposal_status, v_proposal_immutable
    FROM commercial.proposal_versions AS version
   WHERE version.id = v_proposal_version
     AND version.owner_organization_id = v_owner
   FOR UPDATE;
  IF v_proposal_currency IS NULL
     OR v_proposal_status <> 'ACCEPTED'
     OR v_proposal_immutable IS NOT TRUE
  THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
  END IF;
  IF v_proposal_currency <> v_currency THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CORRELATION_DENIED');
  END IF;

  PERFORM 1
    FROM commercial.proposal_lines AS line
   WHERE line.owner_organization_id = v_owner
     AND line.proposal_version_id = v_proposal_version
   FOR UPDATE;

  SELECT COALESCE(sum(line.line_total_minor), 0), count(*), count(DISTINCT line.position),
         bool_and(
           line.quantity >= 1
           AND line.position >= 1
           AND line.unit_amount_minor >= 0
           AND NULLIF(btrim(line.description), '') IS NOT NULL
           AND length(line.description) <= 4000
           AND (line.quantity::numeric * line.unit_amount_minor::numeric) <= 9223372036854775807
           AND line.line_total_minor = (line.quantity::numeric * line.unit_amount_minor::numeric)
         )
    INTO v_sum, v_count, v_distinct, v_lines_ok
    FROM commercial.proposal_lines AS line
   WHERE line.owner_organization_id = v_owner
     AND line.proposal_version_id = v_proposal_version;
  IF v_count = 0 OR v_count <> v_distinct OR v_lines_ok IS NOT TRUE THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
  END IF;
  IF v_sum <> v_subtotal OR v_total <> v_subtotal + v_tax THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CORRELATION_DENIED');
  END IF;

  PERFORM 1
    FROM commercial.invoices AS invoice
   WHERE invoice.owner_organization_id = v_owner
     AND invoice.source_contract_version_id = p_contract_version_id
   FOR UPDATE;
  IF FOUND THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
  END IF;

  v_resource_id := gen_random_uuid();
  INSERT INTO audit.audit_events (
    id, owner_organization_id, actor_type, action, request_id, correlation_id,
    after_hash, redacted_diff, idempotency_key, occurred_at
  ) VALUES (
    p_audit_event_id, v_owner, 'SYSTEM'::audit."AuditActorType",
    'r7.invoice.drafted', left(p_request_id, 200), p_idempotency_key, p_request_hash,
    jsonb_build_object(
      'outcome', 'DRAFTED',
      'contractId', p_contract_id,
      'contractVersionId', p_contract_version_id,
      'currency', v_currency,
      'subtotalMinor', v_subtotal::text,
      'taxMinor', v_tax::text,
      'totalMinor', v_total::text,
      'lineCount', v_count
    ),
    p_idempotency_key, clock_timestamp()
  );
  INSERT INTO commercial.invoices (
    id, resource_id, owner_organization_id, client_account_id, proposal_id,
    source_contract_id, source_contract_version_id, source_contract_version,
    status, currency, subtotal_minor, tax_minor, total_minor, allocated_minor,
    idempotency_key, request_hash, row_version
  ) VALUES (
    p_invoice_id, v_resource_id, v_owner, v_client_account, NULL,
    p_contract_id, p_contract_version_id, v_version_number,
    'DRAFT', v_currency, v_subtotal, v_tax, v_total, 0,
    p_idempotency_key, p_request_hash, 1
  );
  INSERT INTO commercial.invoice_lines (
    id, owner_organization_id, invoice_id, position, description, quantity,
    unit_amount_minor, line_total_minor
  )
  SELECT gen_random_uuid(), v_owner, p_invoice_id, line.position, line.description,
         line.quantity, line.unit_amount_minor, line.line_total_minor
    FROM commercial.proposal_lines AS line
   WHERE line.owner_organization_id = v_owner
     AND line.proposal_version_id = v_proposal_version;

  RETURN jsonb_build_object(
    'kind', 'ok',
    'code', 'CREATED',
    'invoiceId', p_invoice_id,
    'contractId', p_contract_id,
    'contractVersionId', p_contract_version_id,
    'status', 'DRAFT',
    'currency', v_currency,
    'subtotalMinor', v_subtotal::text,
    'taxMinor', v_tax::text,
    'totalMinor', v_total::text,
    'rowVersion', 1,
    'lineCount', v_count
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
END;
$$;

CREATE OR REPLACE FUNCTION platform.issue_r7_invoice(
  p_audit_event_id uuid,
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
  v_existing_id uuid;
  v_existing_hash text;
  v_existing_invoice uuid;
  v_existing_status text;
  v_existing_row integer;
  v_existing_total bigint;
  v_id uuid;
  v_status text;
  v_row integer;
  v_total bigint;
  v_source uuid;
  v_currency text;
BEGIN
  v_owner := platform.current_organization_id();
  IF v_owner IS NULL
     OR p_audit_event_id IS NULL
     OR p_invoice_id IS NULL
     OR p_expected_row_version IS NULL
     OR p_expected_row_version < 1
     OR p_idempotency_key !~ ('^r7:invoice-issue:' || v_owner::text || ':[A-Za-z0-9._:-]{8,128}$')
     OR p_request_hash !~ '^[0-9a-f]{64}$'
     OR NULLIF(btrim(p_request_id), '') IS NULL
  THEN
    RAISE EXCEPTION 'invalid R7 invoice issue' USING ERRCODE = '22023';
  END IF;

  SELECT invoice.id, invoice.issue_request_hash, invoice.id, invoice.status, invoice.row_version, invoice.total_minor
    INTO v_existing_id, v_existing_hash, v_existing_invoice, v_existing_status, v_existing_row, v_existing_total
    FROM commercial.invoices AS invoice
   WHERE invoice.owner_organization_id = v_owner
     AND invoice.issue_idempotency_key = p_idempotency_key
   FOR UPDATE;
  IF v_existing_id IS NOT NULL THEN
    IF v_existing_hash <> p_request_hash OR v_existing_invoice <> p_invoice_id THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'IDEMPOTENCY_CONFLICT');
    END IF;
    RETURN jsonb_build_object(
      'kind', 'ok',
      'code', 'REPLAY',
      'invoiceId', v_existing_id,
      'status', v_existing_status,
      'rowVersion', v_existing_row,
      'totalMinor', v_existing_total::text
    );
  END IF;

  SELECT invoice.id, invoice.status, invoice.row_version, invoice.total_minor,
         invoice.source_contract_version_id, invoice.currency
    INTO v_id, v_status, v_row, v_total, v_source, v_currency
    FROM commercial.invoices AS invoice
   WHERE invoice.id = p_invoice_id
     AND invoice.owner_organization_id = v_owner
   FOR UPDATE;
  IF v_id IS NULL THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;
  IF v_row <> p_expected_row_version THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
  END IF;
  IF v_status <> 'DRAFT' OR v_source IS NULL OR v_currency IS NULL THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
  END IF;

  INSERT INTO audit.audit_events (
    id, owner_organization_id, actor_type, action, request_id, correlation_id,
    after_hash, redacted_diff, idempotency_key, occurred_at
  ) VALUES (
    p_audit_event_id, v_owner, 'SYSTEM'::audit."AuditActorType",
    'r7.invoice.issued', left(p_request_id, 200), p_idempotency_key, p_request_hash,
    jsonb_build_object(
      'outcome', 'FINALIZED',
      'invoiceId', v_id,
      'totalMinor', v_total::text,
      'currency', v_currency
    ),
    p_idempotency_key, clock_timestamp()
  );
  UPDATE commercial.invoices
     SET status = 'FINALIZED',
         finalized_at = clock_timestamp(),
         row_version = row_version + 1,
         issue_idempotency_key = p_idempotency_key,
         issue_request_hash = p_request_hash,
         updated_at = clock_timestamp()
   WHERE id = v_id
     AND owner_organization_id = v_owner
     AND status = 'DRAFT'
     AND row_version = p_expected_row_version;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'R7 invoice issue lost the draft' USING ERRCODE = '40001';
  END IF;

  RETURN jsonb_build_object(
    'kind', 'ok',
    'code', 'ISSUED',
    'invoiceId', v_id,
    'status', 'FINALIZED',
    'rowVersion', p_expected_row_version + 1,
    'totalMinor', v_total::text
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
END;
$$;

REVOKE INSERT, UPDATE ON commercial.invoices FROM perspective_runtime;
REVOKE ALL ON commercial.invoice_lines FROM PUBLIC;
GRANT SELECT ON commercial.invoice_lines TO perspective_runtime;
REVOKE ALL ON FUNCTION commercial.guard_r7_invoice_mutation() FROM PUBLIC;
REVOKE ALL ON FUNCTION commercial.guard_r7_invoice_line_mutation() FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.create_r7_invoice_draft(uuid, uuid, uuid, uuid, integer, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform.issue_r7_invoice(uuid, uuid, integer, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.create_r7_invoice_draft(uuid, uuid, uuid, uuid, integer, text, text, text) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION platform.issue_r7_invoice(uuid, uuid, integer, text, text, text) TO perspective_runtime;
