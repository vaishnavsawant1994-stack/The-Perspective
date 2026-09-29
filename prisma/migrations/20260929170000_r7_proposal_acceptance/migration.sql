-- Authenticated CLIENT acceptance is one atomic, auditable command. The browser
-- receives execute access to a narrow SECURITY DEFINER transaction boundary;
-- it cannot write acceptance, proposal, audit, or idempotency tables directly.

ALTER TABLE commercial.proposal_versions
  ADD CONSTRAINT proposal_versions_acceptance_reference_key
  UNIQUE (id, proposal_id, owner_organization_id, version);

CREATE TABLE commercial.proposal_acceptances (
  id UUID PRIMARY KEY,
  owner_organization_id UUID NOT NULL,
  client_organization_id UUID NOT NULL,
  client_account_id UUID NOT NULL,
  proposal_id UUID NOT NULL,
  proposal_version_id UUID NOT NULL,
  proposal_version INTEGER NOT NULL,
  expected_row_version INTEGER NOT NULL,
  accepted_row_version INTEGER NOT NULL,
  actor_user_id UUID NOT NULL,
  actor_membership_id UUID NOT NULL,
  accepted_at TIMESTAMPTZ(6) NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  after_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT proposal_acceptances_id_owner_org_key UNIQUE (id, owner_organization_id),
  CONSTRAINT proposal_acceptances_proposal_once UNIQUE (proposal_id),
  CONSTRAINT proposal_acceptances_client_idempotency UNIQUE (client_organization_id, idempotency_key),
  CONSTRAINT proposal_acceptances_row_versions CHECK (
    expected_row_version > 0 AND accepted_row_version = expected_row_version + 1
  ),
  CONSTRAINT proposal_acceptances_version_positive CHECK (proposal_version > 0),
  CONSTRAINT proposal_acceptances_hashes CHECK (
    request_hash ~ '^[0-9a-f]{64}$' AND after_hash ~ '^[0-9a-f]{64}$'
  ),
  CONSTRAINT proposal_acceptances_proposal_owner_fkey
    FOREIGN KEY (proposal_id, owner_organization_id)
    REFERENCES commercial.proposals(id, owner_organization_id) ON DELETE RESTRICT,
  CONSTRAINT proposal_acceptances_version_reference_fkey
    FOREIGN KEY (proposal_version_id, proposal_id, owner_organization_id, proposal_version)
    REFERENCES commercial.proposal_versions(id, proposal_id, owner_organization_id, version)
    ON DELETE RESTRICT,
  CONSTRAINT proposal_acceptances_client_account_fkey
    FOREIGN KEY (client_account_id, owner_organization_id)
    REFERENCES commercial.client_accounts(id, owner_organization_id) ON DELETE RESTRICT,
  CONSTRAINT proposal_acceptances_actor_user_fkey
    FOREIGN KEY (actor_user_id) REFERENCES iam.user_accounts(id) ON DELETE RESTRICT,
  CONSTRAINT proposal_acceptances_actor_membership_fkey
    FOREIGN KEY (actor_membership_id) REFERENCES iam.organization_memberships(id) ON DELETE RESTRICT,
  CONSTRAINT proposal_acceptances_client_organization_fkey
    FOREIGN KEY (client_organization_id) REFERENCES iam.organizations(id) ON DELETE RESTRICT
);

CREATE INDEX proposal_acceptances_owner_proposal_idx
  ON commercial.proposal_acceptances(owner_organization_id, proposal_id, accepted_at);

ALTER TABLE commercial.proposal_acceptances ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial.proposal_acceptances FORCE ROW LEVEL SECURITY;
CREATE POLICY r7_client_acceptance ON commercial.proposal_acceptances
  USING (client_organization_id = platform.current_client_organization_id())
  WITH CHECK (client_organization_id = platform.current_client_organization_id());

CREATE TRIGGER proposal_acceptances_immutable
BEFORE UPDATE OR DELETE ON commercial.proposal_acceptances
FOR EACH ROW EXECUTE FUNCTION platform.reject_immutable_mutation();

REVOKE ALL ON commercial.proposal_acceptances FROM PUBLIC, perspective_runtime;

CREATE OR REPLACE FUNCTION platform.complete_r7_proposal_acceptance(
  p_evidence_id uuid,
  p_audit_event_id uuid,
  p_receipt_id uuid,
  p_client_organization_id uuid,
  p_owner_organization_id uuid,
  p_actor_user_id uuid,
  p_actor_membership_id uuid,
  p_proposal_id uuid,
  p_proposal_version_id uuid,
  p_proposal_version integer,
  p_expected_row_version integer,
  p_request_id text,
  p_idempotency_key text,
  p_request_hash text,
  p_after_hash text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform, iam, audit, commercial
AS $$
DECLARE
  v_client_organization_id uuid;
  v_actor_user_id uuid;
  v_owner_organization_id uuid;
  v_client_account_id uuid;
  v_proposal_resource_id uuid;
  v_proposal_status text;
  v_current_version integer;
  v_row_version integer;
  v_version_id uuid;
  v_version_number integer;
  v_version_status text;
  v_version_immutable boolean;
  v_issued_at timestamptz;
  v_creator_user_id uuid;
  v_existing_hash text;
  v_existing_state platform."IdempotencyState";
  v_claimed boolean;
  v_accepted_at timestamptz;
  v_result jsonb;
BEGIN
  v_client_organization_id := platform.current_client_organization_id();
  IF v_client_organization_id IS NULL
     OR p_owner_organization_id IS NULL
     OR platform.current_organization_id() <> p_owner_organization_id
     OR v_client_organization_id <> p_client_organization_id
     OR NULLIF(btrim(p_idempotency_key), '') IS NULL
     OR p_idempotency_key NOT LIKE 'r7:proposal-accept:' || v_client_organization_id::text || ':%'
     OR p_request_hash !~ '^[0-9a-f]{64}$'
     OR p_after_hash !~ '^[0-9a-f]{64}$'
     OR p_proposal_version <= 0
     OR p_expected_row_version <= 0
  THEN
    RAISE EXCEPTION 'invalid R7 customer acceptance authority' USING ERRCODE = '42501';
  END IF;

  SELECT membership.user_account_id INTO v_actor_user_id
    FROM iam.organization_memberships AS membership
   WHERE membership.id = p_actor_membership_id
     AND membership.organization_id = v_client_organization_id
     AND membership.user_account_id = p_actor_user_id
     AND membership.membership_type = 'CLIENT'
     AND membership.status = 'ACTIVE'
   FOR SHARE;
  IF v_actor_user_id IS NULL THEN
    RAISE EXCEPTION 'inactive or mismatched R7 customer membership' USING ERRCODE = '42501';
  END IF;

  SELECT proposal.owner_organization_id, proposal.client_account_id,
         proposal.resource_id, proposal.status, proposal.current_version,
         proposal.row_version
    INTO v_owner_organization_id, v_client_account_id, v_proposal_resource_id,
         v_proposal_status, v_current_version, v_row_version
    FROM commercial.proposals AS proposal
    JOIN commercial.client_accounts AS account
      ON account.id = proposal.client_account_id
     AND account.owner_organization_id = proposal.owner_organization_id
     AND account.client_organization_id = v_client_organization_id
     AND account.archived_at IS NULL
   WHERE proposal.id = p_proposal_id
     AND proposal.owner_organization_id = p_owner_organization_id
     AND proposal.archived_at IS NULL
   FOR UPDATE OF proposal
   FOR SHARE OF account;
  IF v_owner_organization_id IS NULL THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;

  SELECT membership.user_account_id INTO v_creator_user_id
    FROM commercial.proposals AS proposal
    JOIN iam.organization_memberships AS membership
      ON membership.id = proposal.created_by_membership_id
     AND membership.organization_id = proposal.owner_organization_id
   WHERE proposal.id = p_proposal_id
     AND proposal.owner_organization_id = v_owner_organization_id
   FOR SHARE OF membership;
  IF v_creator_user_id IS NULL OR v_creator_user_id = v_actor_user_id THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'SEPARATION_OF_DUTY_DENIED');
  END IF;

  SELECT version.id, version.version, version.status, version.immutable, version.issued_at
    INTO v_version_id, v_version_number, v_version_status, v_version_immutable, v_issued_at
    FROM commercial.proposal_versions AS version
   WHERE version.proposal_id = p_proposal_id
     AND version.owner_organization_id = v_owner_organization_id
     AND version.version = v_current_version
   FOR UPDATE;
  IF v_version_id IS NULL THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
  END IF;

  SELECT request_hash, state INTO v_existing_hash, v_existing_state
    FROM platform.idempotency_receipts
   WHERE owner_organization_id = v_client_organization_id
     AND scope = 'commercial.proposal-accept'
     AND idempotency_key = btrim(p_idempotency_key)
   FOR UPDATE;
  IF FOUND THEN
    IF v_existing_hash IS DISTINCT FROM btrim(p_request_hash) THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'IDEMPOTENCY_CONFLICT');
    END IF;
    IF v_existing_state = 'COMPLETED' THEN
      SELECT jsonb_build_object(
        'kind', 'ok', 'replayed', true,
        'proposalId', evidence.proposal_id,
        'versionId', evidence.proposal_version_id,
        'version', evidence.proposal_version,
        'status', 'ACCEPTED',
        'acceptedAt', evidence.accepted_at
      ) INTO v_result
        FROM commercial.proposal_acceptances AS evidence
       WHERE evidence.client_organization_id = v_client_organization_id
         AND evidence.idempotency_key = btrim(p_idempotency_key)
         AND evidence.request_hash = btrim(p_request_hash)
         AND evidence.proposal_id = p_proposal_id
         AND evidence.proposal_version_id = p_proposal_version_id
         AND evidence.proposal_version = p_proposal_version
         AND evidence.actor_user_id = p_actor_user_id
         AND evidence.actor_membership_id = p_actor_membership_id;
      IF v_result IS NOT NULL THEN RETURN v_result; END IF;
    END IF;
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
  END IF;

  IF v_proposal_status NOT IN ('SENT', 'VIEWED') THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'TRANSITION_DENIED');
  END IF;
  IF v_row_version <> p_expected_row_version
     OR v_current_version <> p_proposal_version
     OR v_version_id <> p_proposal_version_id
     OR v_version_number <> p_proposal_version
     OR v_version_status NOT IN ('SENT', 'VIEWED')
     OR v_version_immutable IS DISTINCT FROM TRUE
     OR v_issued_at IS NULL
  THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
  END IF;

  INSERT INTO platform.idempotency_receipts (
    id, owner_organization_id, scope, idempotency_key, request_hash,
    state, created_at, expires_at
  ) VALUES (
    p_receipt_id, v_client_organization_id, 'commercial.proposal-accept',
    btrim(p_idempotency_key), btrim(p_request_hash), 'STARTED',
    clock_timestamp(), clock_timestamp() + interval '1 day'
  ) ON CONFLICT (owner_organization_id, scope, idempotency_key) DO NOTHING
  RETURNING TRUE INTO v_claimed;
  IF v_claimed IS DISTINCT FROM TRUE THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
  END IF;

  v_accepted_at := clock_timestamp();
  UPDATE commercial.proposal_versions
     SET status = 'ACCEPTED'
   WHERE id = v_version_id AND proposal_id = p_proposal_id
     AND owner_organization_id = v_owner_organization_id
     AND version = p_proposal_version AND status IN ('SENT', 'VIEWED')
     AND immutable IS TRUE AND issued_at IS NOT NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'R7 acceptance version transition lost concurrency race' USING ERRCODE = '40001';
  END IF;

  UPDATE commercial.proposals
     SET status = 'ACCEPTED', row_version = row_version + 1,
         updated_at = v_accepted_at
   WHERE id = p_proposal_id AND owner_organization_id = v_owner_organization_id
     AND status IN ('SENT', 'VIEWED') AND current_version = p_proposal_version
     AND row_version = p_expected_row_version AND archived_at IS NULL;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'R7 acceptance proposal transition lost concurrency race' USING ERRCODE = '40001';
  END IF;

  INSERT INTO commercial.proposal_acceptances (
    id, owner_organization_id, client_organization_id, client_account_id,
    proposal_id, proposal_version_id, proposal_version, expected_row_version,
    accepted_row_version, actor_user_id, actor_membership_id, accepted_at,
    idempotency_key, request_hash, after_hash
  ) VALUES (
    p_evidence_id, v_owner_organization_id, v_client_organization_id,
    v_client_account_id, p_proposal_id, p_proposal_version_id,
    p_proposal_version, p_expected_row_version, p_expected_row_version + 1,
    p_actor_user_id, p_actor_membership_id, v_accepted_at,
    btrim(p_idempotency_key), btrim(p_request_hash), btrim(p_after_hash)
  );

  -- Validate request/audit context after state and evidence writes begin. Any
  -- rejection aborts this function call and rolls back all preceding writes.
  IF NULLIF(btrim(p_request_id), '') IS NULL THEN
    RAISE EXCEPTION 'R7 acceptance audit request id is required' USING ERRCODE = '42501';
  END IF;
  INSERT INTO audit.audit_events (
    id, owner_organization_id, target_resource_id, actor_type, actor_user_id,
    actor_membership_id, action, request_id, correlation_id, after_hash,
    redacted_diff, idempotency_key, occurred_at
  ) VALUES (
    p_audit_event_id, v_owner_organization_id, NULL, 'USER'::audit."AuditActorType",
    p_actor_user_id, p_actor_membership_id, 'r7.proposal.accepted',
    p_request_id, p_request_id, btrim(p_after_hash),
    jsonb_build_object('proposalAcceptance', jsonb_build_object(
      'proposalId', p_proposal_id, 'proposalVersionId', p_proposal_version_id,
      'version', p_proposal_version, 'clientAccountId', v_client_account_id,
      'clientOrganizationId', v_client_organization_id,
      'actorUserId', p_actor_user_id, 'actorMembershipId', p_actor_membership_id,
      'acceptedAt', v_accepted_at, 'expectedRowVersion', p_expected_row_version,
      'acceptedRowVersion', p_expected_row_version + 1,
      'requestHash', btrim(p_request_hash)
    )), btrim(p_idempotency_key), v_accepted_at
  );

  UPDATE platform.idempotency_receipts
     SET state = 'COMPLETED', response_status = 200,
         response_hash = btrim(p_after_hash), completed_at = clock_timestamp()
   WHERE owner_organization_id = v_client_organization_id
     AND scope = 'commercial.proposal-accept'
     AND idempotency_key = btrim(p_idempotency_key)
     AND request_hash = btrim(p_request_hash)
     AND state = 'STARTED';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'R7 acceptance idempotency completion mismatch' USING ERRCODE = '23514';
  END IF;

  RETURN jsonb_build_object(
    'kind', 'ok', 'replayed', false,
    'proposalId', p_proposal_id,
    'versionId', p_proposal_version_id,
    'version', p_proposal_version,
    'status', 'ACCEPTED',
    'acceptedAt', v_accepted_at
  );
END;
$$;

REVOKE ALL ON FUNCTION platform.complete_r7_proposal_acceptance(uuid,uuid,uuid,uuid,uuid,uuid,uuid,uuid,uuid,integer,integer,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION platform.complete_r7_proposal_acceptance(uuid,uuid,uuid,uuid,uuid,uuid,uuid,uuid,uuid,integer,integer,text,text,text,text) TO perspective_runtime;
