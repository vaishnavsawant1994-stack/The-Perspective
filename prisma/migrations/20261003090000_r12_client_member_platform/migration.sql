-- R12 client portal and member platform. Does not edit an accepted migration.
-- commercial.subscriptions is not a member subscription and is not written here.
-- Runtime remains NOSUPERUSER NOBYPASSRLS and cannot insert these tables.

CREATE SCHEMA IF NOT EXISTS portal;
CREATE SCHEMA IF NOT EXISTS member;
GRANT USAGE ON SCHEMA portal, member TO perspective_runtime;

CREATE TABLE portal.access_grants (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  client_account_id uuid NOT NULL,
  client_organization_id uuid NOT NULL,
  email_normalized text NOT NULL,
  token_hash char(64) NOT NULL,
  state text NOT NULL,
  user_account_id uuid,
  membership_id uuid,
  expires_at timestamptz(6) NOT NULL,
  accepted_at timestamptz(6),
  revoked_at timestamptz(6),
  row_version integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT access_grants_state_check CHECK (state IN ('INVITED', 'ACTIVE', 'REVOKED', 'EXPIRED')),
  CONSTRAINT access_grants_hash_check CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  CONSTRAINT access_grants_email_check CHECK (length(email_normalized) BETWEEN 3 AND 200),
  CONSTRAINT access_grants_active_shape CHECK (
    state <> 'ACTIVE' OR (user_account_id IS NOT NULL AND membership_id IS NOT NULL AND accepted_at IS NOT NULL)
  ),
  CONSTRAINT access_grants_invited_shape CHECK (state <> 'INVITED' OR (user_account_id IS NULL AND accepted_at IS NULL)),
  CONSTRAINT access_grants_revoked_shape CHECK ((state = 'REVOKED') = (revoked_at IS NOT NULL)),
  CONSTRAINT access_grants_account_fkey FOREIGN KEY (client_account_id, owner_organization_id)
    REFERENCES commercial.client_accounts (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX access_grants_one_live_email
  ON portal.access_grants (owner_organization_id, client_account_id, email_normalized)
  WHERE state IN ('INVITED', 'ACTIVE');

CREATE UNIQUE INDEX access_grants_one_active_membership
  ON portal.access_grants (membership_id)
  WHERE state = 'ACTIVE';

CREATE UNIQUE INDEX access_grants_invited_hash
  ON portal.access_grants (token_hash)
  WHERE state = 'INVITED';

CREATE TABLE member.offers (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  code text NOT NULL,
  currency char(3) NOT NULL,
  amount_minor bigint NOT NULL,
  interval text NOT NULL,
  entitlement_key text NOT NULL,
  state text NOT NULL,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT offers_code_key UNIQUE (owner_organization_id, code),
  CONSTRAINT offers_amount_check CHECK (amount_minor >= 0),
  CONSTRAINT offers_interval_check CHECK (interval IN ('MONTH', 'YEAR')),
  CONSTRAINT offers_state_check CHECK (state IN ('OPEN', 'CLOSED'))
);

CREATE TABLE member.checkout_attempts (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  user_account_id uuid NOT NULL,
  offer_id uuid NOT NULL,
  amount_minor bigint NOT NULL,
  currency char(3) NOT NULL,
  state text NOT NULL,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT checkout_attempts_state_check CHECK (state = 'PROVIDER_UNAVAILABLE'),
  CONSTRAINT checkout_attempts_offer_fkey FOREIGN KEY (offer_id)
    REFERENCES member.offers (id) ON DELETE RESTRICT
);

CREATE TABLE member.profiles (
  user_account_id uuid PRIMARY KEY,
  display_name text NOT NULL,
  row_version integer NOT NULL DEFAULT 1,
  updated_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT profiles_name_check CHECK (length(btrim(display_name)) BETWEEN 1 AND 80)
);

CREATE UNIQUE INDEX entitlements_one_active_subject
  ON commercial.entitlements (owner_organization_id, subject_type, subject_id, entitlement_key)
  WHERE active;

ALTER TABLE portal.access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal.access_grants FORCE ROW LEVEL SECURITY;
ALTER TABLE member.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE member.offers FORCE ROW LEVEL SECURITY;
ALTER TABLE member.checkout_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE member.checkout_attempts FORCE ROW LEVEL SECURITY;
ALTER TABLE member.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE member.profiles FORCE ROW LEVEL SECURITY;

CREATE POLICY r12_owner ON portal.access_grants
  USING (owner_organization_id = NULLIF(current_setting('app.organization_id', true), '')::uuid)
  WITH CHECK (owner_organization_id = NULLIF(current_setting('app.organization_id', true), '')::uuid);
CREATE POLICY r12_owner ON member.offers
  USING (owner_organization_id = NULLIF(current_setting('app.organization_id', true), '')::uuid)
  WITH CHECK (owner_organization_id = NULLIF(current_setting('app.organization_id', true), '')::uuid);
CREATE POLICY r12_owner ON member.checkout_attempts
  USING (owner_organization_id = NULLIF(current_setting('app.organization_id', true), '')::uuid)
  WITH CHECK (owner_organization_id = NULLIF(current_setting('app.organization_id', true), '')::uuid);
CREATE POLICY r12_user ON member.profiles
  USING (user_account_id = NULLIF(current_setting('app.user_id', true), '')::uuid)
  WITH CHECK (user_account_id = NULLIF(current_setting('app.user_id', true), '')::uuid);

GRANT SELECT ON portal.access_grants, member.offers, member.checkout_attempts, member.profiles TO perspective_runtime;

CREATE FUNCTION portal.r12_finish(
  p_owner uuid,
  p_command text,
  p_scope text,
  p_receipt uuid,
  p_audit uuid,
  p_key text,
  p_hash text,
  p_request text,
  p_actor uuid,
  p_membership uuid,
  p_result jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, portal, member, platform, audit
AS $finish$
DECLARE
  v_now timestamptz := clock_timestamp();
BEGIN
  INSERT INTO platform.idempotency_receipts (
    id, owner_organization_id, scope, idempotency_key, request_hash,
    state, response_status, response_hash, created_at, completed_at, expires_at
  ) VALUES (
    p_receipt, p_owner, p_scope, p_key, p_hash,
    'COMPLETED', 200, p_hash, v_now, v_now, v_now + interval '1 day'
  );
  INSERT INTO audit.audit_events (
    id, owner_organization_id, actor_type, actor_user_id, actor_membership_id, action, request_id,
    correlation_id, after_hash, redacted_diff, idempotency_key, occurred_at
  ) VALUES (
    p_audit, p_owner, CASE WHEN p_membership IS NULL THEN 'SYSTEM'::audit."AuditActorType" ELSE 'USER'::audit."AuditActorType" END,
    p_actor, p_membership, 'r12.' || p_command,
    left(p_request, 200), p_key, p_hash, p_result, p_key, v_now
  );
  RETURN jsonb_build_object('kind', 'ok', 'code', 'CREATED') || p_result;
END
$finish$;

CREATE FUNCTION portal.r12_replay(p_owner uuid, p_scope text, p_key text, p_hash text, p_command text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, platform, audit
AS $replay$
DECLARE
  v_hash text;
  v_state text;
BEGIN
  SELECT request_hash, state INTO v_hash, v_state
    FROM platform.idempotency_receipts
   WHERE owner_organization_id = p_owner
     AND scope = p_scope
     AND idempotency_key = p_key
   FOR UPDATE;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  IF v_hash IS DISTINCT FROM p_hash THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'IDEMPOTENCY_CONFLICT');
  END IF;
  IF v_state = 'COMPLETED' THEN
    RETURN (
      SELECT jsonb_build_object('kind', 'ok', 'code', 'REPLAY') || event.redacted_diff
        FROM audit.audit_events AS event
       WHERE event.idempotency_key = p_key
         AND event.action = 'r12.' || p_command
       LIMIT 1
    );
  END IF;
  RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
END
$replay$;

CREATE FUNCTION portal.r12_team(
  p_command text,
  p_actor uuid,
  p_payload jsonb,
  p_receipt uuid,
  p_audit uuid,
  p_key text,
  p_hash text,
  p_request text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, portal, commercial, iam, platform, audit
AS $team$
DECLARE
  v_owner uuid;
  v_now timestamptz;
  v_id uuid;
  v_client uuid;
  v_email text;
  v_replay jsonb;
  v_result jsonb;
  v_user uuid;
BEGIN
  v_owner := platform.current_organization_id();
  v_now := clock_timestamp();
  IF v_owner IS NULL OR p_actor IS NULL OR p_receipt IS NULL OR p_audit IS NULL OR p_payload IS NULL
     OR p_hash !~ '^[0-9a-f]{64}$'
     OR p_command NOT IN ('invite', 'revoke')
     OR p_key !~ ('^r12:' || p_command || ':' || v_owner::text || ':[A-Za-z0-9._:-]{8,128}$')
     OR p_payload ?| ARRAY['token','organizationId','entitled','premium','amount','currency','health','notes','views']
  THEN
    RAISE EXCEPTION 'invalid R12 team command' USING ERRCODE = '22023';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM iam.organization_memberships AS membership
     WHERE membership.id = p_actor
       AND membership.organization_id = v_owner
       AND membership.membership_type = 'STAFF'
       AND membership.status = 'ACTIVE'
       AND membership.ended_at IS NULL
  ) THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;
  v_replay := portal.r12_replay(v_owner, 'r12.' || p_command, p_key, p_hash, p_command);
  IF v_replay IS NOT NULL THEN RETURN v_replay; END IF;
  SELECT membership.user_account_id INTO v_user FROM iam.organization_memberships AS membership WHERE membership.id = p_actor;

  IF p_command = 'invite' THEN
    v_email := lower(btrim(p_payload->>'email'));
    IF v_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' OR p_payload->>'tokenHash' !~ '^[0-9a-f]{64}$' THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
    END IF;
    SELECT account.client_organization_id INTO v_client
      FROM commercial.client_accounts AS account
     WHERE account.id = (p_payload->>'clientAccountId')::uuid
       AND account.owner_organization_id = v_owner
       AND account.archived_at IS NULL;
    IF v_client IS NULL THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
    END IF;
    v_id := gen_random_uuid();
    INSERT INTO portal.access_grants (
      id, owner_organization_id, client_account_id, client_organization_id, email_normalized,
      token_hash, state, expires_at, row_version, created_by
    ) VALUES (
      v_id, v_owner, (p_payload->>'clientAccountId')::uuid, v_client, v_email,
      p_payload->>'tokenHash', 'INVITED', v_now + interval '7 days', 1, p_actor
    );
    v_result := jsonb_build_object('grantId', v_id, 'state', 'INVITED');
  ELSE
    UPDATE portal.access_grants
       SET state = 'REVOKED', revoked_at = v_now, row_version = row_version + 1
     WHERE id = (p_payload->>'grantId')::uuid
       AND owner_organization_id = v_owner
       AND state IN ('INVITED', 'ACTIVE')
    RETURNING id INTO v_id;
    IF v_id IS NULL THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
    END IF;
    v_result := jsonb_build_object('grantId', v_id, 'state', 'REVOKED');
  END IF;
  RETURN portal.r12_finish(v_owner, p_command, 'r12.' || p_command, p_receipt, p_audit, p_key, p_hash, p_request, v_user, p_actor, v_result);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
  WHEN check_violation OR invalid_text_representation THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
END
$team$;

CREATE FUNCTION portal.r12_client_read(p_membership uuid, p_command text, p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, portal, production, commercial, iam
AS $read$
DECLARE
  v_grant portal.access_grants%ROWTYPE;
  v_result jsonb;
BEGIN
  IF p_command NOT IN ('dashboard', 'projects', 'project', 'approvals', 'invoices', 'contracts')
     OR p_payload ?| ARRAY['clientAccountId','organizationId','membershipId','health','notes','margin']
  THEN
    RAISE EXCEPTION 'invalid R12 client read' USING ERRCODE = '22023';
  END IF;
  SELECT access_grant.* INTO v_grant
    FROM portal.access_grants AS access_grant
    JOIN iam.organization_memberships AS membership ON membership.id = access_grant.membership_id
   WHERE access_grant.membership_id = p_membership
     AND access_grant.state = 'ACTIVE'
     AND membership.id = p_membership
     AND membership.organization_id = access_grant.client_organization_id
     AND membership.membership_type = 'CLIENT'
     AND membership.status = 'ACTIVE'
     AND membership.ended_at IS NULL;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;

  IF p_command = 'dashboard' THEN
    v_result := jsonb_build_object(
      'projectCount', (SELECT count(*) FROM production.projects WHERE owner_organization_id = v_grant.owner_organization_id AND client_account_id = v_grant.client_account_id),
      'approvalCount', (
        SELECT count(*) FROM production.projects AS project
          JOIN production.editorial_works AS work ON work.project_id = project.id
          JOIN production.drafts AS draft ON draft.work_id = work.id
          JOIN production.draft_versions AS version ON version.draft_id = draft.id
          JOIN production.editorial_approvals AS editorial ON editorial.draft_version_id = version.id
          LEFT JOIN production.client_approvals AS decision ON decision.draft_version_id = version.id
         WHERE project.owner_organization_id = v_grant.owner_organization_id
           AND project.client_account_id = v_grant.client_account_id
           AND project.state = 'CLIENT_REVIEW'
           AND decision.id IS NULL
           AND version.version_number = (SELECT max(latest.version_number) FROM production.draft_versions AS latest WHERE latest.draft_id = draft.id)
      ),
      'invoiceCount', (
        SELECT count(*) FROM commercial.invoices
         WHERE owner_organization_id = v_grant.owner_organization_id
           AND client_account_id = v_grant.client_account_id
           AND status <> 'DRAFT'
      )
    );
  ELSIF p_command = 'projects' THEN
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id', project.id, 'title', project.title,
      'status', CASE
        WHEN project.state = 'CANCELLED' THEN 'CANCELLED'
        WHEN project.state IN ('COMPLETED', 'PUBLISHED', 'DISTRIBUTION') THEN 'COMPLETE'
        WHEN project.state IN ('CLIENT_REVIEW', 'CLIENT_CHANGES_REQUESTED', 'CLIENT_APPROVAL') THEN 'AWAITING_YOU'
        ELSE 'OPEN' END
    ) ORDER BY project.created_at DESC), '[]'::jsonb) INTO v_result
      FROM (
        SELECT * FROM production.projects
         WHERE owner_organization_id = v_grant.owner_organization_id
           AND client_account_id = v_grant.client_account_id
         ORDER BY created_at DESC
         LIMIT 100
      ) AS project;
  ELSIF p_command = 'project' THEN
    SELECT jsonb_build_object(
      'id', project.id, 'title', project.title,
      'status', CASE
        WHEN project.state = 'CANCELLED' THEN 'CANCELLED'
        WHEN project.state IN ('COMPLETED', 'PUBLISHED', 'DISTRIBUTION') THEN 'COMPLETE'
        WHEN project.state IN ('CLIENT_REVIEW', 'CLIENT_CHANGES_REQUESTED', 'CLIENT_APPROVAL') THEN 'AWAITING_YOU'
        ELSE 'OPEN' END,
      'milestones', coalesce((
        SELECT jsonb_agg(jsonb_build_object('kind', milestone.kind, 'complete', milestone.completed_at IS NOT NULL))
          FROM production.milestones AS milestone
         WHERE milestone.project_id = project.id
           AND milestone.kind IN ('CLIENT_APPROVAL', 'PUBLICATION_READY')
      ), '[]'::jsonb)
    ) INTO v_result
      FROM production.projects AS project
     WHERE project.id = (p_payload->>'projectId')::uuid
       AND project.owner_organization_id = v_grant.owner_organization_id
       AND project.client_account_id = v_grant.client_account_id;
    IF v_result IS NULL THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
    END IF;
  ELSIF p_command = 'approvals' THEN
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'projectId', project.id, 'title', project.title,
      'versionId', version.id, 'version', version.version_number
    )), '[]'::jsonb) INTO v_result
      FROM production.projects AS project
      JOIN production.editorial_works AS work ON work.project_id = project.id
      JOIN production.drafts AS draft ON draft.work_id = work.id
      JOIN production.draft_versions AS version ON version.draft_id = draft.id
      JOIN production.editorial_approvals AS editorial ON editorial.draft_version_id = version.id
      LEFT JOIN production.client_approvals AS decision ON decision.draft_version_id = version.id
     WHERE project.owner_organization_id = v_grant.owner_organization_id
       AND project.client_account_id = v_grant.client_account_id
       AND project.state = 'CLIENT_REVIEW'
       AND decision.id IS NULL
       AND version.version_number = (SELECT max(latest.version_number) FROM production.draft_versions AS latest WHERE latest.draft_id = draft.id);
  ELSIF p_command = 'invoices' THEN
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id', invoice.id, 'status', invoice.status, 'currency', invoice.currency,
      'totalMinor', invoice.total_minor,
      'paymentState', CASE
        WHEN invoice.status IN ('VOID', 'CREDITED') THEN 'VOID'
        WHEN invoice.status = 'PAID' OR invoice.allocated_minor = invoice.total_minor THEN 'PAID'
        WHEN invoice.allocated_minor > 0 THEN 'PARTIAL'
        ELSE 'UNPAID' END
    ) ORDER BY invoice.created_at DESC), '[]'::jsonb) INTO v_result
      FROM commercial.invoices AS invoice
     WHERE invoice.owner_organization_id = v_grant.owner_organization_id
       AND invoice.client_account_id = v_grant.client_account_id
       AND invoice.status <> 'DRAFT';
  ELSE
    SELECT coalesce(jsonb_agg(jsonb_build_object(
      'id', contract.id, 'status', contract.status, 'version', contract.current_version
    )), '[]'::jsonb) INTO v_result
      FROM commercial.contracts AS contract
     WHERE contract.owner_organization_id = v_grant.owner_organization_id
       AND contract.client_account_id = v_grant.client_account_id
       AND contract.status IN ('READY_FOR_SIGNATURE', 'OUT_FOR_SIGNATURE', 'SIGNED');
  END IF;
  RETURN jsonb_build_object('kind', 'ok', 'result', v_result);
EXCEPTION
  WHEN invalid_text_representation THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
END
$read$;

CREATE FUNCTION portal.r12_client(
  p_membership uuid,
  p_command text,
  p_payload jsonb,
  p_receipt uuid,
  p_audit uuid,
  p_key text,
  p_hash text,
  p_request text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, portal, production, commercial, iam, platform, audit
AS $client$
DECLARE
  v_membership iam.organization_memberships%ROWTYPE;
  v_grant portal.access_grants%ROWTYPE;
  v_email text;
  v_now timestamptz := clock_timestamp();
  v_version integer;
  v_project production.projects%ROWTYPE;
  v_bridge jsonb;
  v_replay jsonb;
  v_scope text;
  v_stored text;
BEGIN
  IF p_membership IS NULL OR p_payload IS NULL OR p_hash !~ '^[0-9a-f]{64}$'
     OR p_command NOT IN ('accept', 'decide')
     OR p_key !~ '^[A-Za-z0-9._:-]{8,128}$'
     OR p_payload ?| ARRAY['clientAccountId','organizationId','membershipId','entitled','premium','token']
  THEN
    RAISE EXCEPTION 'invalid R12 client command' USING ERRCODE = '22023';
  END IF;
  SELECT * INTO v_membership
    FROM iam.organization_memberships
   WHERE id = p_membership
     AND membership_type = 'CLIENT'
     AND status = 'ACTIVE'
     AND ended_at IS NULL;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;
  SELECT person.email_normalized INTO v_email
    FROM iam.user_accounts AS account
    JOIN iam.people AS person ON person.id = account.person_id
   WHERE account.id = v_membership.user_account_id;

  IF p_command = 'accept' THEN
    IF p_payload->>'tokenHash' !~ '^[0-9a-f]{64}$' THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
    END IF;
    SELECT * INTO v_grant
      FROM portal.access_grants
     WHERE token_hash = p_payload->>'tokenHash'
       AND state = 'INVITED'
     FOR UPDATE;
    IF NOT FOUND OR v_grant.client_organization_id <> v_membership.organization_id OR v_grant.email_normalized IS DISTINCT FROM v_email THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
    END IF;
    IF v_grant.expires_at <= v_now THEN
      UPDATE portal.access_grants SET state = 'EXPIRED', row_version = row_version + 1 WHERE id = v_grant.id;
      RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
    END IF;
    v_scope := 'r12.accept.' || v_grant.id::text;
    v_stored := 'r12:accept:' || v_grant.owner_organization_id::text || ':' || p_key;
    v_replay := portal.r12_replay(v_grant.owner_organization_id, v_scope, v_stored, p_hash, 'accept');
    IF v_replay IS NOT NULL THEN RETURN v_replay; END IF;
    UPDATE portal.access_grants
       SET state = 'ACTIVE', user_account_id = v_membership.user_account_id, membership_id = v_membership.id,
           accepted_at = v_now, row_version = row_version + 1
     WHERE id = v_grant.id AND state = 'INVITED';
    RETURN portal.r12_finish(
      v_grant.owner_organization_id, 'accept', v_scope, p_receipt, p_audit, v_stored, p_hash, p_request,
      v_membership.user_account_id, v_membership.id,
      jsonb_build_object('grantId', v_grant.id, 'state', 'ACTIVE')
    );
  END IF;

  SELECT * INTO v_grant
    FROM portal.access_grants
   WHERE membership_id = p_membership
     AND state = 'ACTIVE'
     AND client_organization_id = v_membership.organization_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;
  PERFORM set_config('app.organization_id', v_grant.owner_organization_id::text, true);
  PERFORM set_config('app.client_organization_id', v_grant.client_organization_id::text, true);
  SELECT project.* INTO v_project
    FROM production.projects AS project
    JOIN production.editorial_works AS work ON work.project_id = project.id
    JOIN production.drafts AS draft ON draft.work_id = work.id
    JOIN production.draft_versions AS version ON version.draft_id = draft.id
   WHERE version.id = (p_payload->>'versionId')::uuid
     AND project.owner_organization_id = v_grant.owner_organization_id
     AND project.client_account_id = v_grant.client_account_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;
  SELECT version.version_number INTO v_version
    FROM production.draft_versions AS version
   WHERE version.id = (p_payload->>'versionId')::uuid;
  IF v_version IS DISTINCT FROM (p_payload->>'expectedVersion')::integer
     OR v_version IS DISTINCT FROM (
       SELECT max(latest.version_number)
         FROM production.draft_versions AS latest
         JOIN production.drafts AS draft ON draft.id = latest.draft_id
         JOIN production.editorial_works AS work ON work.id = draft.work_id
        WHERE work.project_id = v_project.id
     )
  THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
  END IF;
  IF p_payload->>'decision' NOT IN ('APPROVED', 'REJECTED') OR v_project.state <> 'CLIENT_REVIEW' THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
  END IF;
  v_scope := 'r12.decide.' || v_grant.id::text;
  v_stored := 'r12:decide:' || v_grant.owner_organization_id::text || ':' || p_key;
  v_replay := portal.r12_replay(v_grant.owner_organization_id, v_scope, v_stored, p_hash, 'decide');
  IF v_replay IS NOT NULL THEN RETURN v_replay; END IF;
  v_bridge := production.r8_execute(
    'client-decision', p_membership,
    jsonb_build_object('versionId', p_payload->>'versionId', 'decision', p_payload->>'decision'),
    gen_random_uuid(), gen_random_uuid(),
    'r8:client-decision:' || v_grant.owner_organization_id::text || ':g' || replace(v_grant.id::text, '-', '') || left(p_key, 40),
    p_hash, left(p_request, 80)
  );
  IF v_bridge->>'kind' IS DISTINCT FROM 'ok' THEN
    RETURN v_bridge;
  END IF;
  RETURN portal.r12_finish(
    v_grant.owner_organization_id, 'decide', v_scope, p_receipt, p_audit, v_stored, p_hash, p_request,
    v_membership.user_account_id, v_membership.id,
    jsonb_build_object('versionId', p_payload->>'versionId', 'decision', p_payload->>'decision', 'projectId', v_project.id)
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
  WHEN check_violation OR invalid_text_representation THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
END
$client$;

CREATE FUNCTION portal.r12_member_read(p_user uuid, p_command text, p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, member, commercial, production, iam
AS $member_read$
DECLARE
  v_result jsonb;
BEGIN
  IF p_command NOT IN ('library', 'issue', 'profile')
     OR NOT EXISTS (SELECT 1 FROM iam.user_accounts WHERE id = p_user AND account_state = 'ACTIVE')
     OR p_payload ?| ARRAY['entitled','premium','organizationId','amount','currency']
  THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;
  IF p_command = 'profile' THEN
    SELECT jsonb_build_object('displayName', coalesce(profile.display_name, person.display_name))
      INTO v_result
      FROM iam.user_accounts AS account
      JOIN iam.people AS person ON person.id = account.person_id
      LEFT JOIN member.profiles AS profile ON profile.user_account_id = account.id
     WHERE account.id = p_user;
  ELSIF p_command = 'library' THEN
    SELECT coalesce(jsonb_agg(jsonb_build_object('id', issue.id, 'slug', issue.slug, 'title', issue.title)), '[]'::jsonb)
      INTO v_result
      FROM commercial.entitlements AS entitlement
      JOIN production.issues AS issue
        ON issue.owner_organization_id = entitlement.owner_organization_id
       AND issue.id::text = entitlement.entitlement_key
     WHERE entitlement.subject_type = 'USER'
       AND entitlement.subject_id = p_user
       AND entitlement.active
       AND entitlement.revoked_at IS NULL
       AND issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED');
  ELSE
    SELECT jsonb_build_object('id', issue.id, 'slug', issue.slug, 'title', issue.title)
      INTO v_result
      FROM production.issues AS issue
      JOIN commercial.entitlements AS entitlement
        ON entitlement.owner_organization_id = issue.owner_organization_id
       AND entitlement.entitlement_key = issue.id::text
       AND entitlement.subject_type = 'USER'
       AND entitlement.subject_id = p_user
       AND entitlement.active
       AND entitlement.revoked_at IS NULL
     WHERE issue.id = (p_payload->>'issueId')::uuid
       AND issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED');
    IF v_result IS NULL THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
    END IF;
  END IF;
  RETURN jsonb_build_object('kind', 'ok', 'result', v_result);
EXCEPTION
  WHEN invalid_text_representation THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
END
$member_read$;

CREATE FUNCTION portal.r12_member(
  p_user uuid,
  p_command text,
  p_payload jsonb,
  p_receipt uuid,
  p_audit uuid,
  p_key text,
  p_hash text,
  p_request text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, portal, member, commercial, iam, platform, audit
AS $member$
DECLARE
  v_offer member.offers%ROWTYPE;
  v_entitlement commercial.entitlements%ROWTYPE;
  v_name text;
  v_replay jsonb;
  v_stored text;
  v_id uuid;
BEGIN
  IF p_user IS NULL OR p_hash !~ '^[0-9a-f]{64}$' OR p_key !~ '^[A-Za-z0-9._:-]{8,128}$'
     OR p_command NOT IN ('rename', 'checkout', 'cancel')
     OR NOT EXISTS (SELECT 1 FROM iam.user_accounts WHERE id = p_user AND account_state = 'ACTIVE')
     OR p_payload ?| ARRAY['entitled','premium','organizationId','amount','currency','price','subscriptionId']
  THEN
    RAISE EXCEPTION 'invalid R12 member command' USING ERRCODE = '22023';
  END IF;

  IF p_command = 'rename' THEN
    v_name := btrim(p_payload->>'displayName');
    IF v_name IS NULL OR length(v_name) < 1 OR length(v_name) > 80 THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
    END IF;
    UPDATE iam.people AS person
       SET display_name = v_name
      FROM iam.user_accounts AS account
     WHERE account.id = p_user AND person.id = account.person_id;
    INSERT INTO member.profiles (user_account_id, display_name)
    VALUES (p_user, v_name)
    ON CONFLICT (user_account_id) DO UPDATE
      SET display_name = EXCLUDED.display_name, row_version = member.profiles.row_version + 1, updated_at = clock_timestamp();
    RETURN jsonb_build_object('kind', 'ok', 'code', 'CREATED', 'displayName', v_name);
  END IF;

  IF p_command = 'checkout' THEN
    SELECT * INTO v_offer FROM member.offers WHERE id = (p_payload->>'offerId')::uuid AND state = 'OPEN';
    IF NOT FOUND THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
    END IF;
    v_stored := 'r12:checkout:' || v_offer.owner_organization_id::text || ':' || p_key;
    v_replay := portal.r12_replay(v_offer.owner_organization_id, 'r12.checkout', v_stored, p_hash, 'checkout');
    IF v_replay IS NOT NULL THEN RETURN v_replay; END IF;
    v_id := gen_random_uuid();
    INSERT INTO member.checkout_attempts (
      id, owner_organization_id, user_account_id, offer_id, amount_minor, currency, state
    ) VALUES (
      v_id, v_offer.owner_organization_id, p_user, v_offer.id, v_offer.amount_minor, v_offer.currency, 'PROVIDER_UNAVAILABLE'
    );
    RETURN portal.r12_finish(
      v_offer.owner_organization_id, 'checkout', 'r12.checkout', p_receipt, p_audit, v_stored, p_hash, p_request, p_user, NULL,
      jsonb_build_object('attemptId', v_id, 'state', 'PROVIDER_UNAVAILABLE', 'currency', v_offer.currency, 'amountMinor', v_offer.amount_minor)
    );
  END IF;

  SELECT * INTO v_entitlement
    FROM commercial.entitlements
   WHERE id = (p_payload->>'entitlementId')::uuid
     AND subject_type = 'USER'
     AND subject_id = p_user
     AND active
     AND source_type = 'MANUAL'
   FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;
  v_stored := 'r12:cancel:' || v_entitlement.owner_organization_id::text || ':' || p_key;
  v_replay := portal.r12_replay(v_entitlement.owner_organization_id, 'r12.cancel', v_stored, p_hash, 'cancel');
  IF v_replay IS NOT NULL THEN RETURN v_replay; END IF;
  UPDATE commercial.entitlements
     SET active = false, revoked_at = clock_timestamp()
   WHERE id = v_entitlement.id AND active;
  RETURN portal.r12_finish(
    v_entitlement.owner_organization_id, 'cancel', 'r12.cancel', p_receipt, p_audit, v_stored, p_hash, p_request, p_user, NULL,
    jsonb_build_object('entitlementId', v_entitlement.id, 'state', 'REVOKED')
  );
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
  WHEN check_violation OR invalid_text_representation THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
END
$member$;

CREATE FUNCTION portal.r12_worker(
  p_command text,
  p_payload jsonb,
  p_receipt uuid,
  p_audit uuid,
  p_key text,
  p_hash text,
  p_request text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, portal, member, commercial, production, iam, platform, audit
AS $worker$
DECLARE
  v_owner uuid;
  v_replay jsonb;
  v_id uuid;
  v_issue uuid;
BEGIN
  IF p_hash !~ '^[0-9a-f]{64}$'
     OR p_command NOT IN ('open-offer', 'grant', 'revoke')
     OR p_key !~ ('^r12:' || p_command || ':[A-Za-z0-9._:-]{8,160}$')
     OR p_payload ?| ARRAY['entitled','premium','price']
  THEN
    RAISE EXCEPTION 'invalid R12 worker command' USING ERRCODE = '22023';
  END IF;
  v_owner := (p_payload->>'organizationId')::uuid;
  IF NOT EXISTS (SELECT 1 FROM iam.organizations WHERE id = v_owner AND status = 'ACTIVE') THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;
  PERFORM set_config('app.organization_id', v_owner::text, true);
  v_replay := portal.r12_replay(v_owner, 'r12.' || p_command, p_key, p_hash, p_command);
  IF v_replay IS NOT NULL THEN RETURN v_replay; END IF;

  IF p_command = 'open-offer' THEN
    IF p_payload->>'interval' NOT IN ('MONTH', 'YEAR')
       OR (p_payload->>'amountMinor')::bigint < 0
       OR length(p_payload->>'code') < 2
       OR p_payload->>'currency' !~ '^[A-Z]{3}$'
    THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
    END IF;
    v_id := gen_random_uuid();
    INSERT INTO member.offers (
      id, owner_organization_id, code, currency, amount_minor, interval, entitlement_key, state
    ) VALUES (
      v_id, v_owner, p_payload->>'code', p_payload->>'currency', (p_payload->>'amountMinor')::bigint,
      p_payload->>'interval', p_payload->>'entitlementKey', 'OPEN'
    );
    RETURN portal.r12_finish(v_owner, p_command, 'r12.' || p_command, p_receipt, p_audit, p_key, p_hash, p_request, NULL, NULL,
      jsonb_build_object('offerId', v_id, 'state', 'OPEN', 'amountMinor', (p_payload->>'amountMinor')::bigint, 'currency', p_payload->>'currency'));
  ELSIF p_command = 'grant' THEN
    SELECT issue.id INTO v_issue
      FROM production.issues AS issue
     WHERE issue.id = (p_payload->>'issueId')::uuid
       AND issue.owner_organization_id = v_owner
       AND issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED');
    IF v_issue IS NULL OR NOT EXISTS (
      SELECT 1 FROM iam.user_accounts WHERE id = (p_payload->>'userId')::uuid AND account_state = 'ACTIVE'
    ) THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
    END IF;
    v_id := gen_random_uuid();
    INSERT INTO commercial.entitlements (
      id, owner_organization_id, subject_type, subject_id, entitlement_key, source_type, source_id, active
    ) VALUES (
      v_id, v_owner, 'USER', (p_payload->>'userId')::uuid, v_issue::text, 'MANUAL', p_audit, true
    );
    RETURN portal.r12_finish(v_owner, p_command, 'r12.' || p_command, p_receipt, p_audit, p_key, p_hash, p_request, NULL, NULL,
      jsonb_build_object('entitlementId', v_id, 'issueId', v_issue, 'state', 'ACTIVE'));
  END IF;

  UPDATE commercial.entitlements
     SET active = false, revoked_at = clock_timestamp()
   WHERE id = (p_payload->>'entitlementId')::uuid
     AND owner_organization_id = v_owner
     AND active
  RETURNING id INTO v_id;
  IF v_id IS NULL THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;
  RETURN portal.r12_finish(v_owner, p_command, 'r12.' || p_command, p_receipt, p_audit, p_key, p_hash, p_request, NULL, NULL,
    jsonb_build_object('entitlementId', v_id, 'state', 'REVOKED'));
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
  WHEN check_violation OR invalid_text_representation THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
END
$worker$;

REVOKE ALL ON FUNCTION portal.r12_finish(uuid, text, text, uuid, uuid, text, text, text, uuid, uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION portal.r12_replay(uuid, text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION portal.r12_team(text, uuid, jsonb, uuid, uuid, text, text, text) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION portal.r12_client_read(uuid, text, jsonb) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION portal.r12_client(uuid, text, jsonb, uuid, uuid, text, text, text) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION portal.r12_member_read(uuid, text, jsonb) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION portal.r12_member(uuid, text, jsonb, uuid, uuid, text, text, text) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION portal.r12_worker(text, jsonb, uuid, uuid, text, text, text) TO perspective_runtime;
