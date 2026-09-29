-- R7 provider-neutral contract/signature persistence foundation.
-- Mutations are intentionally unavailable to perspective_runtime until a
-- qualified server-owned command/reconciliation boundary is added.

CREATE TABLE commercial.contracts (
  id UUID PRIMARY KEY,
  resource_id UUID NOT NULL UNIQUE,
  owner_organization_id UUID NOT NULL,
  client_account_id UUID NOT NULL,
  source_proposal_id UUID NOT NULL,
  source_proposal_version_id UUID NOT NULL,
  source_proposal_version INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  current_version INTEGER NOT NULL DEFAULT 1,
  row_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT contracts_id_owner_org_key UNIQUE (id, owner_organization_id),
  CONSTRAINT contracts_source_proposal_version UNIQUE (source_proposal_id, source_proposal_version),
  CONSTRAINT contracts_source_identity_key UNIQUE (id, owner_organization_id, source_proposal_id, source_proposal_version_id, source_proposal_version),
  CONSTRAINT contracts_status CHECK (status IN ('DRAFT','READY_FOR_SIGNATURE','OUT_FOR_SIGNATURE','SIGNED','VOID','EXPIRED')),
  CONSTRAINT contracts_versions_positive CHECK (current_version > 0 AND row_version > 0),
  CONSTRAINT contracts_client_account_fkey FOREIGN KEY (client_account_id, owner_organization_id)
    REFERENCES commercial.client_accounts(id, owner_organization_id) ON DELETE RESTRICT,
  CONSTRAINT contracts_source_proposal_fkey FOREIGN KEY (source_proposal_id, owner_organization_id)
    REFERENCES commercial.proposals(id, owner_organization_id) ON DELETE RESTRICT,
  CONSTRAINT contracts_source_proposal_version_fkey
    FOREIGN KEY (source_proposal_version_id, source_proposal_id, owner_organization_id, source_proposal_version)
    REFERENCES commercial.proposal_versions(id, proposal_id, owner_organization_id, version) ON DELETE RESTRICT
);

CREATE TABLE commercial.contract_versions (
  id UUID PRIMARY KEY,
  owner_organization_id UUID NOT NULL,
  contract_id UUID NOT NULL,
  version INTEGER NOT NULL,
  source_proposal_id UUID NOT NULL,
  source_proposal_version_id UUID NOT NULL,
  source_proposal_version INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  immutable BOOLEAN NOT NULL DEFAULT TRUE,
  document_snapshot JSONB NOT NULL,
  document_sha256 CHAR(64) NOT NULL,
  currency CHAR(3) NOT NULL,
  subtotal_minor BIGINT NOT NULL,
  tax_minor BIGINT NOT NULL DEFAULT 0,
  total_minor BIGINT NOT NULL,
  created_audit_event_id UUID NOT NULL REFERENCES audit.audit_events(id) ON DELETE RESTRICT,
  issued_at TIMESTAMPTZ(6),
  signed_at TIMESTAMPTZ(6),
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT contract_versions_contract_version UNIQUE (contract_id, version),
  CONSTRAINT contract_versions_reference_key UNIQUE (id, contract_id, owner_organization_id, version),
  CONSTRAINT contract_versions_status CHECK (status IN ('DRAFT','READY_FOR_SIGNATURE','OUT_FOR_SIGNATURE','SIGNED','VOID','EXPIRED')),
  CONSTRAINT contract_versions_version_positive CHECK (version > 0),
  CONSTRAINT contract_versions_immutable CHECK (immutable IS TRUE),
  CONSTRAINT contract_versions_hash CHECK (document_sha256 ~ '^[0-9a-f]{64}$'),
  CONSTRAINT contract_versions_totals CHECK (subtotal_minor >= 0 AND tax_minor >= 0 AND total_minor >= 0),
  CONSTRAINT contract_versions_total_matches CHECK (total_minor = subtotal_minor + tax_minor),
  CONSTRAINT contract_versions_signed_timestamp CHECK ((status = 'SIGNED') = (signed_at IS NOT NULL)),
  CONSTRAINT contract_versions_issued_timestamp CHECK (status NOT IN ('OUT_FOR_SIGNATURE','SIGNED') OR issued_at IS NOT NULL),
  CONSTRAINT contract_versions_contract_fkey FOREIGN KEY (contract_id, owner_organization_id, source_proposal_id, source_proposal_version_id, source_proposal_version)
    REFERENCES commercial.contracts(id, owner_organization_id, source_proposal_id, source_proposal_version_id, source_proposal_version) ON DELETE RESTRICT,
  CONSTRAINT contract_versions_source_version_fkey
    FOREIGN KEY (source_proposal_version_id, source_proposal_id, owner_organization_id, source_proposal_version)
    REFERENCES commercial.proposal_versions(id, proposal_id, owner_organization_id, version) ON DELETE RESTRICT
);

ALTER TABLE commercial.contracts
  ADD CONSTRAINT contracts_current_version_fkey
  FOREIGN KEY (id, current_version)
  REFERENCES commercial.contract_versions(contract_id, version)
  DEFERRABLE INITIALLY DEFERRED;

CREATE TABLE commercial.contract_signers (
  id UUID PRIMARY KEY,
  owner_organization_id UUID NOT NULL,
  contract_id UUID NOT NULL,
  contract_version_id UUID NOT NULL,
  contract_version INTEGER NOT NULL,
  signer_key TEXT NOT NULL,
  signer_kind TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT TRUE,
  provider_signer_id TEXT,
  CONSTRAINT contract_signers_id_owner_org_key UNIQUE (id, owner_organization_id),
  CONSTRAINT contract_signers_version_signer UNIQUE (contract_version_id, signer_key),
  CONSTRAINT contract_signers_kind CHECK (signer_kind IN ('TEAM','CLIENT')),
  CONSTRAINT contract_signers_version_fkey
    FOREIGN KEY (contract_version_id, contract_id, owner_organization_id, contract_version)
    REFERENCES commercial.contract_versions(id, contract_id, owner_organization_id, version) ON DELETE RESTRICT
);

CREATE TABLE commercial.signature_requests (
  id UUID PRIMARY KEY,
  owner_organization_id UUID NOT NULL,
  contract_id UUID NOT NULL,
  contract_version_id UUID NOT NULL,
  contract_version INTEGER NOT NULL,
  provider TEXT NOT NULL,
  provider_request_id TEXT,
  status TEXT NOT NULL DEFAULT 'REQUESTED',
  document_sha256 CHAR(64) NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_hash CHAR(64) NOT NULL,
  audit_event_id UUID NOT NULL REFERENCES audit.audit_events(id) ON DELETE RESTRICT,
  requested_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ(6),
  CONSTRAINT signature_requests_id_owner_org_key UNIQUE (id, owner_organization_id),
  CONSTRAINT signature_requests_version_once UNIQUE (contract_version_id),
  CONSTRAINT signature_requests_provider_request UNIQUE (provider, provider_request_id),
  CONSTRAINT signature_requests_owner_idempotency UNIQUE (owner_organization_id, idempotency_key),
  CONSTRAINT signature_requests_status CHECK (status IN ('REQUESTED','SENT','COMPLETED','VOID','EXPIRED','FAILED')),
  CONSTRAINT signature_requests_hashes CHECK (document_sha256 ~ '^[0-9a-f]{64}$' AND request_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT signature_requests_version_fkey
    FOREIGN KEY (contract_version_id, contract_id, owner_organization_id, contract_version)
    REFERENCES commercial.contract_versions(id, contract_id, owner_organization_id, version) ON DELETE RESTRICT
);

CREATE TABLE commercial.signature_events (
  id UUID PRIMARY KEY,
  owner_organization_id UUID NOT NULL,
  signature_request_id UUID NOT NULL,
  provider TEXT NOT NULL,
  provider_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_hash CHAR(64) NOT NULL,
  signer_key TEXT,
  provider_occurred_at TIMESTAMPTZ(6),
  received_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified_at TIMESTAMPTZ(6) NOT NULL,
  normalized_evidence JSONB NOT NULL,
  applied_at TIMESTAMPTZ(6),
  audit_event_id UUID NOT NULL REFERENCES audit.audit_events(id) ON DELETE RESTRICT,
  CONSTRAINT signature_events_id_owner_org_key UNIQUE (id, owner_organization_id),
  CONSTRAINT signature_events_provider_event UNIQUE (provider, provider_event_id),
  CONSTRAINT signature_events_hash CHECK (event_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT signature_events_request_fkey FOREIGN KEY (signature_request_id, owner_organization_id)
    REFERENCES commercial.signature_requests(id, owner_organization_id) ON DELETE RESTRICT
);

CREATE INDEX contracts_owner_client_status
  ON commercial.contracts(owner_organization_id, client_account_id, status);
CREATE INDEX contract_versions_owner_status
  ON commercial.contract_versions(owner_organization_id, status, contract_id);
CREATE INDEX contract_signers_owner_contract_version
  ON commercial.contract_signers(owner_organization_id, contract_id, contract_version);
CREATE INDEX signature_requests_owner_status
  ON commercial.signature_requests(owner_organization_id, status, requested_at);
CREATE INDEX signature_events_owner_request
  ON commercial.signature_events(owner_organization_id, signature_request_id, received_at);

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['contracts','contract_versions','contract_signers','signature_requests','signature_events']
  LOOP
    EXECUTE format('ALTER TABLE commercial.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE commercial.%I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format(
      $policy$CREATE POLICY r7_tenant ON commercial.%I USING (owner_organization_id = NULLIF(current_setting('app.organization_id', true), '')::uuid) WITH CHECK (owner_organization_id = NULLIF(current_setting('app.organization_id', true), '')::uuid)$policy$,
      t
    );
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION platform.guard_r7_contract_version_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $r7_contract_version$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'R7 ContractVersion content is immutable' USING ERRCODE = '55000';
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id
     OR NEW.owner_organization_id IS DISTINCT FROM OLD.owner_organization_id
     OR NEW.contract_id IS DISTINCT FROM OLD.contract_id
     OR NEW.version IS DISTINCT FROM OLD.version
     OR NEW.source_proposal_id IS DISTINCT FROM OLD.source_proposal_id
     OR NEW.source_proposal_version_id IS DISTINCT FROM OLD.source_proposal_version_id
     OR NEW.source_proposal_version IS DISTINCT FROM OLD.source_proposal_version
     OR NEW.document_snapshot IS DISTINCT FROM OLD.document_snapshot
     OR NEW.document_sha256 IS DISTINCT FROM OLD.document_sha256
     OR NEW.currency IS DISTINCT FROM OLD.currency
     OR NEW.subtotal_minor IS DISTINCT FROM OLD.subtotal_minor
     OR NEW.tax_minor IS DISTINCT FROM OLD.tax_minor
     OR NEW.total_minor IS DISTINCT FROM OLD.total_minor
     OR NEW.created_at IS DISTINCT FROM OLD.created_at
     OR NEW.immutable IS DISTINCT FROM TRUE
  THEN
    RAISE EXCEPTION 'R7 ContractVersion content is immutable' USING ERRCODE = '55000';
  END IF;

  IF OLD.status = 'SIGNED' AND NEW.signed_at IS DISTINCT FROM OLD.signed_at THEN
    RAISE EXCEPTION 'signed_at evidence is immutable' USING ERRCODE = '55000';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status AND NOT (
    (OLD.status = 'DRAFT' AND NEW.status = 'READY_FOR_SIGNATURE')
    OR (OLD.status = 'READY_FOR_SIGNATURE' AND NEW.status IN ('OUT_FOR_SIGNATURE','VOID'))
    OR (OLD.status = 'OUT_FOR_SIGNATURE' AND NEW.status IN ('SIGNED','VOID','EXPIRED'))
  ) THEN
    RAISE EXCEPTION 'invalid R7 ContractVersion lifecycle transition' USING ERRCODE = '23514';
  END IF;

  IF NEW.status = 'SIGNED' AND (NEW.signed_at IS NULL OR OLD.status <> 'OUT_FOR_SIGNATURE') THEN
    RAISE EXCEPTION 'SIGNED requires verified reconciliation from OUT_FOR_SIGNATURE' USING ERRCODE = '42501';
  END IF;

  IF NEW.status <> 'SIGNED' AND NEW.signed_at IS NOT NULL THEN
    RAISE EXCEPTION 'only SIGNED ContractVersion may have signed_at' USING ERRCODE = '23514';
  END IF;

  IF NEW.issued_at IS DISTINCT FROM OLD.issued_at
     AND NOT (OLD.status = 'READY_FOR_SIGNATURE' AND NEW.status = 'OUT_FOR_SIGNATURE' AND NEW.issued_at IS NOT NULL)
  THEN
    RAISE EXCEPTION 'issued_at is set only when a version is sent for signature' USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$r7_contract_version$;

CREATE TRIGGER contract_versions_lifecycle_guard
BEFORE UPDATE OR DELETE ON commercial.contract_versions
FOR EACH ROW EXECUTE FUNCTION platform.guard_r7_contract_version_mutation();

CREATE TRIGGER signature_events_immutable
BEFORE UPDATE OR DELETE ON commercial.signature_events
FOR EACH ROW EXECUTE FUNCTION platform.reject_immutable_mutation();

REVOKE ALL ON commercial.contracts, commercial.contract_versions,
  commercial.contract_signers, commercial.signature_requests,
  commercial.signature_events FROM PUBLIC, perspective_runtime;
GRANT SELECT ON commercial.contracts, commercial.contract_versions,
  commercial.contract_signers, commercial.signature_requests,
  commercial.signature_events TO perspective_runtime;
