CREATE SCHEMA IF NOT EXISTS ops;

GRANT USAGE ON SCHEMA ops TO perspective_runtime;

CREATE TABLE ops.organization_settings (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL UNIQUE,
  timezone text NOT NULL,
  week_starts_on text NOT NULL,
  support_label text NOT NULL,
  row_version integer NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT organization_settings_timezone_check CHECK (timezone IN ('UTC', 'Asia/Kolkata', 'America/New_York', 'Europe/London')),
  CONSTRAINT organization_settings_week_check CHECK (week_starts_on IN ('MONDAY', 'SUNDAY')),
  CONSTRAINT organization_settings_label_check CHECK (char_length(support_label) BETWEEN 1 AND 80 AND support_label !~ '[[:cntrl:]]'),
  CONSTRAINT organization_settings_version_check CHECK (row_version > 0),
  CONSTRAINT organization_settings_owner_fkey FOREIGN KEY (owner_organization_id) REFERENCES iam.organizations (id)
);

CREATE TABLE ops.integration_declarations (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  integration_type text NOT NULL,
  state text NOT NULL,
  row_version integer NOT NULL,
  declared_at timestamptz,
  disabled_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT integration_type_check CHECK (integration_type IN ('EMAIL', 'STORAGE', 'PAYMENT')),
  CONSTRAINT integration_state_check CHECK (state IN ('DECLARED', 'DISABLED')),
  CONSTRAINT integration_disabled_shape CHECK ((state = 'DISABLED') = (disabled_at IS NOT NULL)),
  CONSTRAINT integration_version_check CHECK (row_version > 0),
  CONSTRAINT integration_owner_fkey FOREIGN KEY (owner_organization_id) REFERENCES iam.organizations (id)
);

CREATE UNIQUE INDEX integration_one_type
  ON ops.integration_declarations (owner_organization_id, integration_type);

CREATE TABLE ops.integration_attempts (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  declaration_id uuid NOT NULL,
  result text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT integration_attempt_result_check CHECK (result = 'PROVIDER_UNAVAILABLE'),
  CONSTRAINT integration_attempt_declaration_fkey FOREIGN KEY (declaration_id) REFERENCES ops.integration_declarations (id),
  CONSTRAINT integration_attempt_owner_fkey FOREIGN KEY (owner_organization_id) REFERENCES iam.organizations (id)
);

ALTER TABLE ops.organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops.organization_settings FORCE ROW LEVEL SECURITY;
ALTER TABLE ops.integration_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops.integration_declarations FORCE ROW LEVEL SECURITY;
ALTER TABLE ops.integration_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops.integration_attempts FORCE ROW LEVEL SECURITY;

CREATE POLICY r13_settings_owner ON ops.organization_settings
  USING (owner_organization_id = platform.current_organization_id());
CREATE POLICY r13_integration_owner ON ops.integration_declarations
  USING (owner_organization_id = platform.current_organization_id());
CREATE POLICY r13_attempt_owner ON ops.integration_attempts
  USING (owner_organization_id = platform.current_organization_id());

GRANT SELECT ON ops.organization_settings, ops.integration_declarations, ops.integration_attempts TO perspective_runtime;

CREATE FUNCTION ops.r13_finish(
  p_owner uuid,
  p_command text,
  p_scope text,
  p_receipt uuid,
  p_audit uuid,
  p_key text,
  p_hash text,
  p_request text,
  p_actor uuid,
  p_user uuid,
  p_result jsonb
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, ops, platform, audit
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
    p_audit, p_owner, 'USER'::audit."AuditActorType", p_user, p_actor, 'r13.' || p_command,
    left(p_request, 200), p_key, p_hash, p_result, p_key, v_now
  );
  RETURN jsonb_build_object('kind', 'ok', 'code', 'CREATED') || p_result;
END
$finish$;

CREATE FUNCTION ops.r13_replay(p_owner uuid, p_scope text, p_key text, p_hash text, p_command text)
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
         AND event.action = 'r13.' || p_command
       LIMIT 1
    );
  END IF;
  RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
END
$replay$;

CREATE FUNCTION ops.r13_read(p_actor uuid, p_command text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, ops, iam, platform
AS $read$
DECLARE
  v_owner uuid;
  v_row ops.organization_settings%ROWTYPE;
  v_result jsonb;
BEGIN
  v_owner := platform.current_organization_id();
  IF v_owner IS NULL OR p_actor IS NULL OR p_command NOT IN ('settings', 'integrations') THEN
    RAISE EXCEPTION 'invalid R13 read' USING ERRCODE = '22023';
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
  IF p_command = 'settings' THEN
    SELECT * INTO v_row FROM ops.organization_settings WHERE owner_organization_id = v_owner;
    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'kind', 'ok', 'code', 'READ', 'configured', false, 'timezone', 'UTC',
        'weekStartsOn', 'MONDAY', 'supportLabel', NULL, 'expectedVersion', 0
      );
    END IF;
    RETURN jsonb_build_object(
      'kind', 'ok', 'code', 'READ', 'configured', true, 'timezone', v_row.timezone,
      'weekStartsOn', v_row.week_starts_on, 'supportLabel', v_row.support_label,
      'expectedVersion', v_row.row_version
    );
  END IF;
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'integrationType', kind.type,
    'state', COALESCE(declaration.state, 'UNCONFIGURED')
  ) ORDER BY kind.type), '[]'::jsonb) INTO v_result
  FROM (VALUES ('EMAIL'), ('PAYMENT'), ('STORAGE')) AS kind(type)
  LEFT JOIN ops.integration_declarations AS declaration
    ON declaration.owner_organization_id = v_owner
   AND declaration.integration_type = kind.type;
  RETURN jsonb_build_object('kind', 'ok', 'code', 'READ', 'result', v_result);
END
$read$;

CREATE FUNCTION ops.r13_command(
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
SET search_path = pg_catalog, ops, iam, platform, audit
AS $command$
DECLARE
  v_owner uuid;
  v_user uuid;
  v_now timestamptz := clock_timestamp();
  v_replay jsonb;
  v_scope text;
  v_version integer;
  v_id uuid;
  v_state text;
  v_type text;
  v_result jsonb;
BEGIN
  v_owner := platform.current_organization_id();
  v_scope := 'r13.' || p_command;
  IF v_owner IS NULL OR p_actor IS NULL OR p_payload IS NULL OR p_receipt IS NULL OR p_audit IS NULL
     OR p_hash !~ '^[0-9a-f]{64}$'
     OR p_command NOT IN ('update-settings', 'declare', 'disable', 'verify')
     OR p_key !~ ('^r13:' || p_command || ':' || v_owner::text || ':[A-Za-z0-9._:-]{8,128}$')
     OR p_payload ?| ARRAY['organizationId','isAdmin','isOwner','role','permissions','verified','status','secret','token','apiKey','webhookSecret','password','delivered','ready','state']
     OR char_length(COALESCE(p_payload->>'reason', '')) NOT BETWEEN 3 AND 200
  THEN
    RAISE EXCEPTION 'invalid R13 command' USING ERRCODE = '22023';
  END IF;
  SELECT membership.user_account_id INTO v_user
    FROM iam.organization_memberships AS membership
   WHERE membership.id = p_actor
     AND membership.organization_id = v_owner
     AND membership.membership_type = 'STAFF'
     AND membership.status = 'ACTIVE'
     AND membership.ended_at IS NULL;
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;
  v_replay := ops.r13_replay(v_owner, v_scope, p_key, p_hash, p_command);
  IF v_replay IS NOT NULL THEN
    RETURN v_replay;
  END IF;

  IF p_command = 'update-settings' THEN
    IF p_payload->>'timezone' NOT IN ('UTC', 'Asia/Kolkata', 'America/New_York', 'Europe/London')
       OR p_payload->>'weekStartsOn' NOT IN ('MONDAY', 'SUNDAY')
       OR char_length(COALESCE(p_payload->>'supportLabel', '')) NOT BETWEEN 1 AND 80
       OR COALESCE(p_payload->>'supportLabel', '') ~ '[[:cntrl:]]'
       OR COALESCE(p_payload->>'expectedVersion', '') !~ '^[0-9]+$'
    THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
    END IF;
    SELECT row_version INTO v_version
      FROM ops.organization_settings
     WHERE owner_organization_id = v_owner
     FOR UPDATE;
    IF NOT FOUND THEN
      IF (p_payload->>'expectedVersion')::integer <> 0 THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
      END IF;
      v_id := gen_random_uuid();
      BEGIN
        INSERT INTO ops.organization_settings (
          id, owner_organization_id, timezone, week_starts_on, support_label, row_version
        ) VALUES (
          v_id, v_owner, p_payload->>'timezone', p_payload->>'weekStartsOn', p_payload->>'supportLabel', 1
        );
      EXCEPTION WHEN unique_violation THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
      END;
      v_result := jsonb_build_object('configured', true, 'expectedVersion', 1, 'timezone', p_payload->>'timezone', 'weekStartsOn', p_payload->>'weekStartsOn', 'supportLabel', p_payload->>'supportLabel');
    ELSIF v_version <> (p_payload->>'expectedVersion')::integer THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE');
    ELSE
      UPDATE ops.organization_settings
         SET timezone = p_payload->>'timezone',
             week_starts_on = p_payload->>'weekStartsOn',
             support_label = p_payload->>'supportLabel',
             row_version = row_version + 1,
             updated_at = v_now
       WHERE owner_organization_id = v_owner
      RETURNING row_version INTO v_version;
      v_result := jsonb_build_object('configured', true, 'expectedVersion', v_version, 'timezone', p_payload->>'timezone', 'weekStartsOn', p_payload->>'weekStartsOn', 'supportLabel', p_payload->>'supportLabel');
    END IF;
  ELSE
    v_type := p_payload->>'integrationType';
    IF v_type NOT IN ('EMAIL', 'STORAGE', 'PAYMENT') THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
    END IF;
    SELECT id, state INTO v_id, v_state
      FROM ops.integration_declarations
     WHERE owner_organization_id = v_owner
       AND integration_type = v_type
     FOR UPDATE;
    IF p_command = 'declare' THEN
      IF NOT FOUND THEN
        v_id := gen_random_uuid();
        BEGIN
          INSERT INTO ops.integration_declarations (
            id, owner_organization_id, integration_type, state, row_version, declared_at
          ) VALUES (
            v_id, v_owner, v_type, 'DECLARED', 1, v_now
          );
        EXCEPTION WHEN unique_violation THEN
          RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
        END;
      ELSE
        UPDATE ops.integration_declarations
           SET state = 'DECLARED', disabled_at = NULL, declared_at = COALESCE(declared_at, v_now),
               row_version = row_version + 1, updated_at = v_now
         WHERE id = v_id;
      END IF;
      v_result := jsonb_build_object('integrationType', v_type, 'state', 'DECLARED');
    ELSIF NOT FOUND THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
    ELSIF p_command = 'disable' THEN
      IF v_state <> 'DECLARED' THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      UPDATE ops.integration_declarations
         SET state = 'DISABLED', disabled_at = v_now, row_version = row_version + 1, updated_at = v_now
       WHERE id = v_id;
      v_result := jsonb_build_object('integrationType', v_type, 'state', 'DISABLED');
    ELSE
      IF v_state <> 'DECLARED' THEN
        RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
      END IF;
      INSERT INTO ops.integration_attempts (id, owner_organization_id, declaration_id, result)
      VALUES (gen_random_uuid(), v_owner, v_id, 'PROVIDER_UNAVAILABLE');
      v_result := jsonb_build_object('integrationType', v_type, 'state', 'DECLARED', 'result', 'PROVIDER_UNAVAILABLE');
    END IF;
  END IF;

  RETURN ops.r13_finish(v_owner, p_command, v_scope, p_receipt, p_audit, p_key, p_hash, p_request, p_actor, v_user, v_result);
END
$command$;

REVOKE ALL ON FUNCTION ops.r13_finish(uuid, text, text, uuid, uuid, text, text, text, uuid, uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.r13_replay(uuid, text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.r13_read(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION ops.r13_command(text, uuid, jsonb, uuid, uuid, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION ops.r13_read(uuid, text) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION ops.r13_command(text, uuid, jsonb, uuid, uuid, text, text, text) TO perspective_runtime;
