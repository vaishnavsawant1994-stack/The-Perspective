-- R11 growth, SEO, analytics, and automation. Does not edit an accepted migration.
-- Runtime remains NOSUPERUSER NOBYPASSRLS. Team mutations go through growth.r11_execute.

CREATE SCHEMA IF NOT EXISTS growth;
GRANT USAGE ON SCHEMA growth TO perspective_runtime, perspective_public;

CREATE TABLE growth.observations (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  subject_type text NOT NULL,
  subject_id uuid NOT NULL,
  slug text NOT NULL,
  dedupe_key text NOT NULL,
  observed_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT observations_subject_check CHECK (subject_type = 'ISSUE'),
  CONSTRAINT observations_dedupe_key UNIQUE (owner_organization_id, subject_id, dedupe_key),
  CONSTRAINT observations_id_owner_key UNIQUE (id, owner_organization_id)
);

CREATE TABLE growth.attributions (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  observation_id uuid NOT NULL UNIQUE,
  campaign_id uuid NOT NULL,
  model text NOT NULL,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT attributions_model_check CHECK (model = 'LAST_TOUCH'),
  CONSTRAINT attributions_observation_fkey FOREIGN KEY (observation_id, owner_organization_id)
    REFERENCES growth.observations (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE growth.report_runs (
  id uuid PRIMARY KEY,
  resource_id uuid NOT NULL UNIQUE,
  owner_organization_id uuid NOT NULL,
  family text NOT NULL,
  range_from timestamptz(6) NOT NULL,
  range_to timestamptz(6) NOT NULL,
  snapshot jsonb NOT NULL,
  state text NOT NULL,
  row_version integer NOT NULL DEFAULT 1,
  created_by uuid NOT NULL,
  approved_by uuid,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT report_runs_family_check CHECK (family IN ('CONTENT', 'DISTRIBUTION', 'GROWTH')),
  CONSTRAINT report_runs_state_check CHECK (state IN ('REPORT_DRAFT', 'REPORT_APPROVED')),
  CONSTRAINT report_runs_range_check CHECK (range_to >= range_from AND range_to <= range_from + interval '366 days'),
  CONSTRAINT report_runs_id_owner_key UNIQUE (id, owner_organization_id)
);

CREATE TABLE growth.signals (
  id uuid PRIMARY KEY,
  resource_id uuid NOT NULL UNIQUE,
  owner_organization_id uuid NOT NULL,
  kind text NOT NULL,
  state text NOT NULL,
  reason text NOT NULL,
  contract_id uuid,
  client_account_id uuid,
  rule_id uuid,
  row_version integer NOT NULL DEFAULT 1,
  created_by uuid,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT signals_kind_check CHECK (kind IN ('RENEWAL', 'UPSELL', 'GROWTH')),
  CONSTRAINT signals_state_check CHECK (state IN ('SIGNAL_CANDIDATE', 'SIGNAL_REVIEWED', 'SIGNAL_ACTED')),
  CONSTRAINT signals_id_owner_key UNIQUE (id, owner_organization_id)
);

CREATE TABLE growth.automation_rules (
  id uuid PRIMARY KEY,
  resource_id uuid NOT NULL UNIQUE,
  owner_organization_id uuid NOT NULL,
  name text NOT NULL,
  trigger_name text NOT NULL,
  condition_field text NOT NULL,
  operator_name text NOT NULL,
  threshold integer NOT NULL,
  action_name text NOT NULL,
  state text NOT NULL,
  row_version integer NOT NULL DEFAULT 1,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT automation_rules_trigger_check CHECK (
    (trigger_name = 'DISTRIBUTION_RECORDED' AND condition_field = 'delivery_count')
    OR (trigger_name = 'SIGNAL_OPEN' AND condition_field = 'open_signal_count')
  ),
  CONSTRAINT automation_rules_operator_check CHECK (operator_name IN ('GT', 'EQ')),
  CONSTRAINT automation_rules_threshold_check CHECK (threshold >= 0 AND threshold <= 1000000),
  CONSTRAINT automation_rules_action_check CHECK (action_name = 'CREATE_GROWTH_SIGNAL'),
  CONSTRAINT automation_rules_state_check CHECK (state IN ('RULE_ACTIVE', 'RULE_DISABLED')),
  CONSTRAINT automation_rules_id_owner_key UNIQUE (id, owner_organization_id)
);

CREATE TABLE growth.automation_executions (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  rule_id uuid NOT NULL,
  trigger_key text NOT NULL,
  result text NOT NULL,
  signal_id uuid,
  created_at timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT automation_executions_result_check CHECK (result IN ('EXECUTED', 'CONDITION_FALSE')),
  CONSTRAINT automation_executions_identity UNIQUE (rule_id, trigger_key),
  CONSTRAINT automation_executions_rule_fkey FOREIGN KEY (rule_id, owner_organization_id)
    REFERENCES growth.automation_rules (id, owner_organization_id) ON DELETE RESTRICT
);

CREATE TABLE growth.search_documents (
  id uuid PRIMARY KEY,
  owner_organization_id uuid NOT NULL,
  kind text NOT NULL,
  slug text NOT NULL,
  title text NOT NULL,
  canonical_path text NOT NULL,
  CONSTRAINT search_documents_kind_check CHECK (kind IN ('issue', 'article')),
  CONSTRAINT search_documents_path_check CHECK (canonical_path ~ '^/(magazine/read|article)/[a-z0-9-]{1,80}$'),
  CONSTRAINT search_documents_identity UNIQUE (owner_organization_id, kind, slug)
);

ALTER TABLE growth.attributions
  ADD CONSTRAINT attributions_campaign_fkey FOREIGN KEY (campaign_id, owner_organization_id)
  REFERENCES distribution.campaigns (id, owner_organization_id) ON DELETE RESTRICT;

CREATE FUNCTION growth.r11_execute(
  p_command text,
  p_actor_membership_id uuid,
  p_payload jsonb,
  p_receipt_id uuid,
  p_audit_id uuid,
  p_idempotency_key text,
  p_request_hash text,
  p_request_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, growth, commercial, distribution, platform, audit, iam
AS $r11$
DECLARE
  v_owner uuid;
  v_now timestamptz;
  v_id uuid;
  v_existing_hash text;
  v_existing_state text;
  v_result jsonb;
  v_actor_user uuid;
  v_from timestamptz;
  v_to timestamptz;
  v_count integer;
  v_version integer;
  v_state text;
  v_created uuid;
  v_status text;
  v_health text;
BEGIN
  v_owner := platform.current_organization_id();
  v_now := clock_timestamp();
  IF v_owner IS NULL
     OR p_actor_membership_id IS NULL
     OR p_receipt_id IS NULL
     OR p_audit_id IS NULL
     OR p_payload IS NULL
     OR NULLIF(btrim(p_request_id), '') IS NULL
     OR p_request_hash !~ '^[0-9a-f]{64}$'
     OR p_command !~ '^[a-z-]{3,40}$'
     OR p_idempotency_key !~ ('^r11:' || p_command || ':' || v_owner::text || ':[A-Za-z0-9._:-]{8,128}$')
     OR p_payload ?| ARRAY['views','count','conversionRate','actor','organizationId','state','url','delivered','trusted','digest','membershipId','reason']
  THEN
    RAISE EXCEPTION 'invalid R11 command' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM iam.organization_memberships AS membership
     WHERE membership.id = p_actor_membership_id
       AND membership.organization_id = v_owner
       AND membership.membership_type = 'STAFF'
       AND membership.status = 'ACTIVE'
       AND membership.ended_at IS NULL
  ) THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND');
  END IF;

  SELECT request_hash, state
    INTO v_existing_hash, v_existing_state
    FROM platform.idempotency_receipts
   WHERE owner_organization_id = v_owner
     AND scope = 'r11.' || p_command
     AND idempotency_key = p_idempotency_key
   FOR UPDATE;
  IF FOUND THEN
    IF v_existing_hash IS DISTINCT FROM p_request_hash THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'IDEMPOTENCY_CONFLICT');
    END IF;
    IF v_existing_state = 'COMPLETED' THEN
      RETURN (
        SELECT jsonb_build_object('kind', 'ok', 'code', 'REPLAY') || event.redacted_diff
          FROM audit.audit_events AS event
         WHERE event.owner_organization_id = v_owner
           AND event.idempotency_key = p_idempotency_key
           AND event.action = 'r11.' || p_command
         LIMIT 1
      );
    END IF;
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
  END IF;

  IF p_command = 'create-report' THEN
    IF p_payload->>'family' NOT IN ('CONTENT', 'DISTRIBUTION', 'GROWTH') THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
    END IF;
    v_from := (p_payload->>'from')::timestamptz;
    v_to := (p_payload->>'to')::timestamptz;
    IF v_from IS NULL OR v_to IS NULL OR v_to < v_from OR v_to > v_from + interval '366 days' THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
    END IF;
    IF p_payload->>'family' = 'CONTENT' THEN
      SELECT count(*)::int INTO v_count FROM growth.observations
       WHERE owner_organization_id = v_owner AND observed_at >= v_from AND observed_at <= v_to;
      v_result := jsonb_build_object('observations', v_count, 'trust', 'INTERNAL_OBSERVATION');
    ELSIF p_payload->>'family' = 'DISTRIBUTION' THEN
      SELECT count(*)::int INTO v_count FROM distribution.delivery_evidence
       WHERE owner_organization_id = v_owner AND verified_at >= v_from AND verified_at <= v_to;
      v_result := jsonb_build_object('deliveries', v_count, 'trust', 'INTERNAL_EVIDENCE');
    ELSE
      SELECT count(*)::int INTO v_count FROM growth.signals
       WHERE owner_organization_id = v_owner AND created_at >= v_from AND created_at <= v_to;
      v_result := jsonb_build_object('signals', v_count, 'trust', 'DERIVED');
    END IF;
    v_id := gen_random_uuid();
    INSERT INTO platform.resources (id, resource_type, title, owner_organization_id, visibility, sensitivity, created_at)
    VALUES (v_id, 'growth-report', p_payload->>'family', v_owner, 'INTERNAL', 'STANDARD', v_now);
    INSERT INTO growth.report_runs (
      id, resource_id, owner_organization_id, family, range_from, range_to, snapshot, state, row_version, created_by, created_at, updated_at
    ) VALUES (
      v_id, v_id, v_owner, p_payload->>'family', v_from, v_to, v_result, 'REPORT_DRAFT', 1, p_actor_membership_id, v_now, v_now
    );
    v_result := jsonb_build_object('reportId', v_id, 'family', p_payload->>'family', 'state', 'REPORT_DRAFT', 'rowVersion', 1, 'snapshot', v_result);

  ELSIF p_command = 'approve-report' THEN
    IF COALESCE(p_payload->>'expectedRowVersion', '') !~ '^[0-9]+$' THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID'); END IF;
    SELECT row_version, state, created_by INTO v_version, v_state, v_created
      FROM growth.report_runs
     WHERE id = (p_payload->>'reportId')::uuid AND owner_organization_id = v_owner
     FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND'); END IF;
    IF v_version <> (p_payload->>'expectedRowVersion')::integer THEN RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE'); END IF;
    IF v_state <> 'REPORT_DRAFT' OR v_created = p_actor_membership_id THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
    END IF;
    UPDATE growth.report_runs
       SET state = 'REPORT_APPROVED', approved_by = p_actor_membership_id, row_version = row_version + 1, updated_at = v_now
     WHERE id = (p_payload->>'reportId')::uuid;
    v_result := jsonb_build_object('reportId', p_payload->>'reportId', 'state', 'REPORT_APPROVED', 'rowVersion', v_version + 1);

  ELSIF p_command = 'open-renewal' THEN
    SELECT status INTO v_status FROM commercial.contracts
     WHERE id = (p_payload->>'contractId')::uuid AND owner_organization_id = v_owner;
    IF NOT FOUND THEN RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND'); END IF;
    v_id := gen_random_uuid();
    INSERT INTO platform.resources (id, resource_type, title, owner_organization_id, visibility, sensitivity, created_at)
    VALUES (v_id, 'growth-signal', 'RENEWAL', v_owner, 'INTERNAL', 'STANDARD', v_now);
    INSERT INTO growth.signals (id, resource_id, owner_organization_id, kind, state, reason, contract_id, row_version, created_by, created_at, updated_at)
    VALUES (v_id, v_id, v_owner, 'RENEWAL', 'SIGNAL_CANDIDATE', 'contract:' || v_status, (p_payload->>'contractId')::uuid, 1, p_actor_membership_id, v_now, v_now);
    v_result := jsonb_build_object('signalId', v_id, 'kind', 'RENEWAL', 'state', 'SIGNAL_CANDIDATE', 'rowVersion', 1);

  ELSIF p_command = 'open-upsell' THEN
    SELECT health INTO v_health FROM commercial.client_accounts
     WHERE id = (p_payload->>'clientAccountId')::uuid AND owner_organization_id = v_owner;
    IF NOT FOUND THEN RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND'); END IF;
    v_id := gen_random_uuid();
    INSERT INTO platform.resources (id, resource_type, title, owner_organization_id, visibility, sensitivity, created_at)
    VALUES (v_id, 'growth-signal', 'UPSELL', v_owner, 'INTERNAL', 'STANDARD', v_now);
    INSERT INTO growth.signals (id, resource_id, owner_organization_id, kind, state, reason, client_account_id, row_version, created_by, created_at, updated_at)
    VALUES (v_id, v_id, v_owner, 'UPSELL', 'SIGNAL_CANDIDATE', 'account:' || v_health, (p_payload->>'clientAccountId')::uuid, 1, p_actor_membership_id, v_now, v_now);
    v_result := jsonb_build_object('signalId', v_id, 'kind', 'UPSELL', 'state', 'SIGNAL_CANDIDATE', 'rowVersion', 1);

  ELSIF p_command IN ('review-signal', 'act-signal') THEN
    IF COALESCE(p_payload->>'expectedRowVersion', '') !~ '^[0-9]+$' THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID'); END IF;
    SELECT row_version, state INTO v_version, v_state FROM growth.signals
     WHERE id = (p_payload->>'signalId')::uuid AND owner_organization_id = v_owner FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND'); END IF;
    IF v_version <> (p_payload->>'expectedRowVersion')::integer THEN RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE'); END IF;
    IF p_command = 'review-signal' AND v_state = 'SIGNAL_CANDIDATE' THEN
      UPDATE growth.signals SET state = 'SIGNAL_REVIEWED', row_version = row_version + 1, updated_at = v_now WHERE id = (p_payload->>'signalId')::uuid;
      v_result := jsonb_build_object('signalId', p_payload->>'signalId', 'state', 'SIGNAL_REVIEWED', 'rowVersion', v_version + 1);
    ELSIF p_command = 'act-signal' AND v_state = 'SIGNAL_REVIEWED' THEN
      UPDATE growth.signals SET state = 'SIGNAL_ACTED', row_version = row_version + 1, updated_at = v_now WHERE id = (p_payload->>'signalId')::uuid;
      v_result := jsonb_build_object('signalId', p_payload->>'signalId', 'state', 'SIGNAL_ACTED', 'rowVersion', v_version + 1);
    ELSE
      RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
    END IF;

  ELSIF p_command = 'create-rule' THEN
    IF NULLIF(btrim(p_payload->>'name'), '') IS NULL
       OR (p_payload->>'trigger' = 'DISTRIBUTION_RECORDED' AND p_payload->>'field' IS DISTINCT FROM 'delivery_count')
       OR (p_payload->>'trigger' = 'SIGNAL_OPEN' AND p_payload->>'field' IS DISTINCT FROM 'open_signal_count')
       OR p_payload->>'trigger' NOT IN ('DISTRIBUTION_RECORDED', 'SIGNAL_OPEN')
       OR p_payload->>'operator' NOT IN ('GT', 'EQ')
       OR COALESCE(p_payload->>'threshold', '') !~ '^[0-9]+$'
    THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
    END IF;
    IF (p_payload->>'threshold')::integer > 1000000 THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID'); END IF;
    IF p_payload ? 'action' AND p_payload->>'action' IS DISTINCT FROM 'CREATE_GROWTH_SIGNAL' THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
    END IF;
    v_id := gen_random_uuid();
    INSERT INTO platform.resources (id, resource_type, title, owner_organization_id, visibility, sensitivity, created_at)
    VALUES (v_id, 'automation-rule', left(btrim(p_payload->>'name'), 200), v_owner, 'INTERNAL', 'STANDARD', v_now);
    INSERT INTO growth.automation_rules (
      id, resource_id, owner_organization_id, name, trigger_name, condition_field, operator_name, threshold, action_name, state, row_version, created_at, updated_at
    ) VALUES (
      v_id, v_id, v_owner, left(btrim(p_payload->>'name'), 200), p_payload->>'trigger', p_payload->>'field', p_payload->>'operator',
      (p_payload->>'threshold')::integer, 'CREATE_GROWTH_SIGNAL', 'RULE_ACTIVE', 1, v_now, v_now
    );
    v_result := jsonb_build_object('ruleId', v_id, 'state', 'RULE_ACTIVE', 'action', 'CREATE_GROWTH_SIGNAL', 'rowVersion', 1);

  ELSIF p_command = 'set-rule' THEN
    IF COALESCE(p_payload->>'expectedRowVersion', '') !~ '^[0-9]+$' OR jsonb_typeof(p_payload->'enabled') <> 'boolean' THEN
      RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
    END IF;
    SELECT row_version INTO v_version FROM growth.automation_rules
     WHERE id = (p_payload->>'ruleId')::uuid AND owner_organization_id = v_owner FOR UPDATE;
    IF NOT FOUND THEN RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND'); END IF;
    IF v_version <> (p_payload->>'expectedRowVersion')::integer THEN RETURN jsonb_build_object('kind', 'error', 'code', 'STALE_WRITE'); END IF;
    UPDATE growth.automation_rules
       SET state = CASE WHEN (p_payload->>'enabled')::boolean THEN 'RULE_ACTIVE' ELSE 'RULE_DISABLED' END,
           row_version = row_version + 1,
           updated_at = v_now
     WHERE id = (p_payload->>'ruleId')::uuid;
    v_result := jsonb_build_object(
      'ruleId', p_payload->>'ruleId',
      'state', CASE WHEN (p_payload->>'enabled')::boolean THEN 'RULE_ACTIVE' ELSE 'RULE_DISABLED' END,
      'rowVersion', v_version + 1
    );

  ELSE
    RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
  END IF;

  IF v_result IS NULL THEN RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID'); END IF;

  INSERT INTO platform.idempotency_receipts (
    id, owner_organization_id, scope, idempotency_key, request_hash,
    state, response_status, response_hash, created_at, completed_at, expires_at
  ) VALUES (
    p_receipt_id, v_owner, 'r11.' || p_command, p_idempotency_key, p_request_hash,
    'COMPLETED', 200, p_request_hash, v_now, v_now, v_now + interval '1 day'
  );
  SELECT membership.user_account_id INTO v_actor_user
    FROM iam.organization_memberships AS membership
   WHERE membership.id = p_actor_membership_id;
  INSERT INTO audit.audit_events (
    id, owner_organization_id, actor_type, actor_user_id, actor_membership_id, action, request_id,
    correlation_id, after_hash, redacted_diff, idempotency_key, occurred_at
  ) VALUES (
    p_audit_id, v_owner, 'USER', v_actor_user, p_actor_membership_id, 'r11.' || p_command,
    left(p_request_id, 200), p_idempotency_key, p_request_hash, v_result, p_idempotency_key, v_now
  );
  RETURN jsonb_build_object('kind', 'ok', 'code', 'CREATED') || v_result;
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
  WHEN check_violation OR invalid_text_representation OR invalid_datetime_format OR datetime_field_overflow THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
END
$r11$;

CREATE FUNCTION growth.r11_public_observe(p_slug text, p_campaign text, p_dedupe text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, growth, production, distribution
AS $observe$
DECLARE
  v_issue_id uuid;
  v_owner uuid;
  v_existing uuid;
  v_id uuid;
  v_campaign uuid;
  v_attributed boolean := false;
BEGIN
  IF p_slug !~ '^[a-z0-9-]{1,80}$' OR p_dedupe !~ '^[A-Za-z0-9._:-]{8,80}$' THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
  END IF;
  IF NULLIF(p_campaign, '') IS NOT NULL AND p_campaign !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
  END IF;
  IF (SELECT count(*) FROM production.issues WHERE slug = p_slug AND state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')) <> 1 THEN
    RETURN NULL;
  END IF;
  SELECT issue.id, issue.owner_organization_id INTO v_issue_id, v_owner
    FROM production.issues AS issue
   WHERE issue.slug = p_slug
     AND issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED');
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  SELECT id INTO v_existing FROM growth.observations
   WHERE owner_organization_id = v_owner AND subject_id = v_issue_id AND dedupe_key = p_dedupe;
  IF FOUND THEN
    RETURN jsonb_build_object('observationId', v_existing, 'replayed', true, 'attributed', EXISTS (
      SELECT 1 FROM growth.attributions WHERE observation_id = v_existing
    ));
  END IF;
  v_id := gen_random_uuid();
  INSERT INTO growth.observations (id, owner_organization_id, subject_type, subject_id, slug, dedupe_key)
  VALUES (v_id, v_owner, 'ISSUE', v_issue_id, p_slug, p_dedupe);
  IF NULLIF(p_campaign, '') IS NOT NULL THEN
    SELECT id INTO v_campaign FROM distribution.campaigns
     WHERE id = p_campaign::uuid
       AND owner_organization_id = v_owner
       AND state IN ('CAMPAIGN_LAUNCHED', 'CAMPAIGN_CLOSED');
    IF FOUND THEN
      INSERT INTO growth.attributions (id, owner_organization_id, observation_id, campaign_id, model)
      VALUES (gen_random_uuid(), v_owner, v_id, v_campaign, 'LAST_TOUCH');
      v_attributed := true;
    END IF;
  END IF;
  RETURN jsonb_build_object('observationId', v_id, 'replayed', false, 'attributed', v_attributed);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
END
$observe$;

CREATE FUNCTION growth.r11_public_meta(p_slug text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, production
AS $$
  SELECT CASE WHEN count(*) = 1 THEN (jsonb_agg(payload))->0 END
    FROM (
      SELECT jsonb_build_object(
        'slug', issue.slug,
        'title', issue.title,
        'description', COALESCE(cover.dek, issue.theme),
        'canonical', '/magazine/read/' || issue.slug,
        'robots', 'index,follow'
      ) AS payload
        FROM production.issues AS issue
        LEFT JOIN production.issue_covers AS cover ON cover.issue_id = issue.id
       WHERE issue.slug = p_slug
         AND issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
    ) AS published;
$$;

CREATE FUNCTION growth.r11_public_search(p_query text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, growth
AS $$
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'slug', document.slug,
    'title', document.title,
    'kind', document.kind,
    'canonical', document.canonical_path
  )), '[]'::jsonb)
    FROM (
      SELECT slug, title, kind, canonical_path
        FROM growth.search_documents
       WHERE title ILIKE '%' || replace(replace(COALESCE(p_query, ''), '%', ''), '_', '') || '%'
       ORDER BY title
       LIMIT 20
    ) AS document;
$$;

CREATE FUNCTION growth.r11_reindex()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, growth, production
AS $reindex$
DECLARE
  v_count integer;
BEGIN
  DELETE FROM growth.search_documents;
  INSERT INTO growth.search_documents (id, owner_organization_id, kind, slug, title, canonical_path)
  SELECT gen_random_uuid(), issue.owner_organization_id, 'issue', issue.slug, left(issue.title, 200), '/magazine/read/' || issue.slug
    FROM production.issues AS issue
   WHERE issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
     AND issue.slug ~ '^[a-z0-9-]{1,80}$';
  INSERT INTO growth.search_documents (id, owner_organization_id, kind, slug, title, canonical_path)
  SELECT gen_random_uuid(), issue.owner_organization_id, 'article', item.article_slug, left(item.title, 200), '/article/' || item.article_slug
    FROM production.publication_snapshot_items AS item
    JOIN production.publication_snapshots AS snapshot ON snapshot.id = item.snapshot_id
    JOIN production.issues AS issue ON issue.id = snapshot.issue_id AND issue.edition_number = snapshot.edition_number
   WHERE issue.state IN ('ISSUE_PUBLISHED', 'ISSUE_ARCHIVED')
     AND item.article_slug ~ '^[a-z0-9-]{1,80}$'
  ON CONFLICT (owner_organization_id, kind, slug) DO NOTHING;
  SELECT count(*)::int INTO v_count FROM growth.search_documents;
  RETURN jsonb_build_object('kind', 'ok', 'documents', v_count);
END
$reindex$;

CREATE FUNCTION growth.r11_run(p_organization_id uuid, p_rule_id uuid, p_trigger_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, growth, distribution, platform, audit
AS $run$
DECLARE
  v_rule growth.automation_rules%ROWTYPE;
  v_count integer;
  v_match boolean;
  v_existing record;
  v_signal uuid;
  v_now timestamptz := clock_timestamp();
BEGIN
  IF p_trigger_key !~ '^[A-Za-z0-9._:-]{8,80}$' THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INVALID');
  END IF;
  SELECT * INTO v_rule FROM growth.automation_rules
   WHERE id = p_rule_id AND owner_organization_id = p_organization_id
   FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('kind', 'error', 'code', 'NOT_FOUND'); END IF;
  IF v_rule.state <> 'RULE_ACTIVE' OR v_rule.action_name <> 'CREATE_GROWTH_SIGNAL' THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'INELIGIBLE');
  END IF;
  SELECT id, result, signal_id INTO v_existing
    FROM growth.automation_executions
   WHERE rule_id = v_rule.id AND trigger_key = p_trigger_key;
  IF FOUND THEN
    RETURN jsonb_build_object('kind', 'ok', 'code', 'REPLAY', 'result', v_existing.result, 'signalId', v_existing.signal_id, 'replayed', true);
  END IF;
  IF v_rule.condition_field = 'delivery_count' THEN
    SELECT count(*)::int INTO v_count FROM distribution.delivery_evidence WHERE owner_organization_id = p_organization_id;
  ELSE
    SELECT count(*)::int INTO v_count FROM growth.signals
     WHERE owner_organization_id = p_organization_id AND state = 'SIGNAL_CANDIDATE';
  END IF;
  v_match := (v_rule.operator_name = 'EQ' AND v_count = v_rule.threshold)
          OR (v_rule.operator_name = 'GT' AND v_count > v_rule.threshold);
  IF v_match THEN
    v_signal := gen_random_uuid();
    INSERT INTO platform.resources (id, resource_type, title, owner_organization_id, visibility, sensitivity, created_at)
    VALUES (v_signal, 'growth-signal', 'GROWTH', p_organization_id, 'INTERNAL', 'STANDARD', v_now);
    INSERT INTO growth.signals (id, resource_id, owner_organization_id, kind, state, reason, rule_id, row_version, created_at, updated_at)
    VALUES (v_signal, v_signal, p_organization_id, 'GROWTH', 'SIGNAL_CANDIDATE', 'rule:' || v_rule.id::text, v_rule.id, 1, v_now, v_now);
    INSERT INTO growth.automation_executions (id, owner_organization_id, rule_id, trigger_key, result, signal_id)
    VALUES (gen_random_uuid(), p_organization_id, v_rule.id, p_trigger_key, 'EXECUTED', v_signal);
    RETURN jsonb_build_object('kind', 'ok', 'code', 'CREATED', 'result', 'EXECUTED', 'signalId', v_signal, 'replayed', false);
  END IF;
  INSERT INTO growth.automation_executions (id, owner_organization_id, rule_id, trigger_key, result)
  VALUES (gen_random_uuid(), p_organization_id, v_rule.id, p_trigger_key, 'CONDITION_FALSE');
  RETURN jsonb_build_object('kind', 'ok', 'code', 'CREATED', 'result', 'CONDITION_FALSE', 'replayed', false);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('kind', 'error', 'code', 'CONFLICT');
END
$run$;

REVOKE ALL ON FUNCTION growth.r11_execute(text, uuid, jsonb, uuid, uuid, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION growth.r11_public_observe(text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION growth.r11_public_meta(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION growth.r11_public_search(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION growth.r11_reindex() FROM PUBLIC;
REVOKE ALL ON FUNCTION growth.r11_run(uuid, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION growth.r11_execute(text, uuid, jsonb, uuid, uuid, text, text, text) TO perspective_runtime;
GRANT EXECUTE ON FUNCTION growth.r11_public_observe(text, text, text) TO perspective_runtime, perspective_public;
GRANT EXECUTE ON FUNCTION growth.r11_public_meta(text) TO perspective_runtime, perspective_public;
GRANT EXECUTE ON FUNCTION growth.r11_public_search(text) TO perspective_runtime, perspective_public;
GRANT EXECUTE ON FUNCTION growth.r11_reindex() TO perspective_runtime;
GRANT EXECUTE ON FUNCTION growth.r11_run(uuid, uuid, text) TO perspective_runtime;

DO $rls$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'observations', 'attributions', 'report_runs', 'signals', 'automation_rules', 'automation_executions', 'search_documents'
  ]
  LOOP
    EXECUTE format('ALTER TABLE growth.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('ALTER TABLE growth.%I FORCE ROW LEVEL SECURITY', table_name);
    EXECUTE format(
      'CREATE POLICY r11_tenant ON growth.%I FOR ALL TO perspective_runtime USING (owner_organization_id = platform.current_organization_id()) WITH CHECK (owner_organization_id = platform.current_organization_id())',
      table_name
    );
    EXECUTE format('REVOKE ALL ON growth.%I FROM PUBLIC, perspective_runtime, perspective_public', table_name);
    EXECUTE format('GRANT SELECT ON growth.%I TO perspective_runtime', table_name);
  END LOOP;
END
$rls$;
