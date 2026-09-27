-- Phase 4 R6 CRM & Commercial Engine migration verification.
-- Frozen contract: P4-R6-G0@730d2280fafe29c756ba7e0b09ff7e8e5c9496a6

DO $$
DECLARE
  runtime_role record;
  item record;
  rel record;
  policy_count integer;
  expected_count integer;
  actual_count integer;
  trigger_count integer;
BEGIN
  -- R4 runtime role must remain restricted.
  SELECT
    rolcanlogin,
    rolsuper,
    rolcreatedb,
    rolcreaterole,
    rolinherit,
    rolreplication,
    rolbypassrls
  INTO runtime_role
  FROM pg_roles
  WHERE rolname = 'perspective_runtime';

  IF runtime_role IS NULL THEN
    RAISE EXCEPTION 'R6 verification failed: perspective_runtime role is missing';
  END IF;

  IF runtime_role.rolcanlogin
    OR runtime_role.rolsuper
    OR runtime_role.rolcreatedb
    OR runtime_role.rolcreaterole
    OR runtime_role.rolinherit
    OR runtime_role.rolreplication
    OR runtime_role.rolbypassrls
  THEN
    RAISE EXCEPTION 'R6 verification failed: perspective_runtime privileges are too broad';
  END IF;

  -- Exact R6 schema/table inventory.
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'crm')
    OR NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'comms')
    OR NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'commercial')
  THEN
    RAISE EXCEPTION 'R6 verification failed: required schemas are missing';
  END IF;

  SELECT count(*) INTO expected_count
  FROM (VALUES
    ('crm','lead_sources'),('crm','extraction_jobs'),('crm','staged_records'),
    ('crm','enrichment_jobs'),('crm','enrichment_facts'),('crm','companies'),
    ('crm','contacts'),('crm','leads'),('crm','lead_scores'),('crm','lead_status_history'),
    ('crm','lead_lists'),('crm','lead_list_members'),('crm','qualifications'),
    ('crm','duplicate_candidates'),('crm','suppression_entries'),
    ('comms','sending_accounts'),('comms','message_templates'),('comms','message_template_versions'),
    ('comms','outreach_campaigns'),('comms','sequences'),('comms','sequence_steps'),
    ('comms','campaign_recipients'),('comms','message_deliveries'),('comms','conversations'),
    ('comms','conversation_participants'),('comms','messages'),('comms','meetings'),
    ('comms','meeting_participants'),('comms','meeting_notes'),
    ('commercial','deal_pipelines'),('commercial','deal_stages'),('commercial','deals'),
    ('commercial','deal_stage_history'),('commercial','client_accounts'),('commercial','client_relationships')
  ) AS expected(schema_name, table_name);

  SELECT count(*) INTO actual_count
  FROM information_schema.tables
  WHERE table_type = 'BASE TABLE'
    AND table_schema IN ('crm','comms','commercial');

  IF actual_count <> expected_count THEN
    RAISE EXCEPTION
      'R6 verification failed: expected % R6 tables, found %',
      expected_count, actual_count;
  END IF;

  FOR item IN
    SELECT *
    FROM (VALUES
      ('crm','lead_sources'),('crm','extraction_jobs'),('crm','staged_records'),
      ('crm','enrichment_jobs'),('crm','enrichment_facts'),('crm','companies'),
      ('crm','contacts'),('crm','leads'),('crm','lead_scores'),('crm','lead_status_history'),
      ('crm','lead_lists'),('crm','lead_list_members'),('crm','qualifications'),
      ('crm','duplicate_candidates'),('crm','suppression_entries'),
      ('comms','sending_accounts'),('comms','message_templates'),('comms','message_template_versions'),
      ('comms','outreach_campaigns'),('comms','sequences'),('comms','sequence_steps'),
      ('comms','campaign_recipients'),('comms','message_deliveries'),('comms','conversations'),
      ('comms','conversation_participants'),('comms','messages'),('comms','meetings'),
      ('comms','meeting_participants'),('comms','meeting_notes'),
      ('commercial','deal_pipelines'),('commercial','deal_stages'),('commercial','deals'),
      ('commercial','deal_stage_history'),('commercial','client_accounts'),('commercial','client_relationships')
    ) AS expected(schema_name, table_name)
  LOOP
    IF to_regclass(format('%I.%I', item.schema_name, item.table_name)) IS NULL THEN
      RAISE EXCEPTION
        'R6 verification failed: expected table %.% is missing',
        item.schema_name, item.table_name;
    END IF;

    SELECT relrowsecurity, relforcerowsecurity
    INTO rel
    FROM pg_class
    WHERE oid = to_regclass(format('%I.%I', item.schema_name, item.table_name));

    IF NOT rel.relrowsecurity OR NOT rel.relforcerowsecurity THEN
      RAISE EXCEPTION
        'R6 verification failed: %.% does not ENABLE+FORCE RLS',
        item.schema_name, item.table_name;
    END IF;

    SELECT count(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = item.schema_name
      AND tablename = item.table_name
      AND cmd IN ('SELECT','INSERT','UPDATE');

    IF policy_count <> 3 THEN
      RAISE EXCEPTION
        'R6 verification failed: %.% expected SELECT/INSERT/UPDATE RLS policies, found %',
        item.schema_name, item.table_name, policy_count;
    END IF;

    IF NOT has_table_privilege(
      'perspective_runtime',
      format('%I.%I', item.schema_name, item.table_name),
      'SELECT'
    ) THEN
      RAISE EXCEPTION
        'R6 verification failed: perspective_runtime lacks SELECT on %.%',
        item.schema_name, item.table_name;
    END IF;

    IF has_table_privilege(
      'perspective_runtime',
      format('%I.%I', item.schema_name, item.table_name),
      'DELETE'
    ) OR has_table_privilege(
      'perspective_runtime',
      format('%I.%I', item.schema_name, item.table_name),
      'TRUNCATE'
    ) THEN
      RAISE EXCEPTION
        'R6 verification failed: perspective_runtime has destructive privilege on %.%',
        item.schema_name, item.table_name;
    END IF;
  END LOOP;

  -- Owner discriminator must be present on every R6 row/table.
  SELECT count(*) INTO actual_count
  FROM information_schema.columns
  WHERE table_schema IN ('crm','comms','commercial')
    AND column_name = 'owner_organization_id';

  IF actual_count <> expected_count THEN
    RAISE EXCEPTION
      'R6 verification failed: expected owner_organization_id on all % tables, found %',
      expected_count, actual_count;
  END IF;

  -- R7-owned production surfaces must be absent.
  FOR item IN
    SELECT *
    FROM (VALUES
      ('commercial','products'),('commercial','packages'),
      ('commercial','proposals'),('commercial','proposal_versions'),('commercial','proposal_acceptances'),
      ('commercial','contracts'),('commercial','contract_versions'),('commercial','contract_signers'),
      ('commercial','signature_events'),('commercial','invoices'),('commercial','invoice_lines'),
      ('commercial','credit_notes'),('commercial','credit_note_lines'),('commercial','payments'),
      ('commercial','payment_allocations'),('commercial','refunds'),
      ('commercial','ledger_transactions'),('commercial','ledger_entries'),
      ('commercial','subscriptions'),('commercial','entitlements')
    ) AS forbidden(schema_name, table_name)
  LOOP
    IF to_regclass(format('%I.%I', item.schema_name, item.table_name)) IS NOT NULL THEN
      RAISE EXCEPTION
        'R6 verification failed: forbidden R7 table %.% exists',
        item.schema_name, item.table_name;
    END IF;
  END LOOP;

  -- D15: template catalog is runtime read-only and privileged mutation is
  -- gated by explicit reviewed import mode.
  IF to_regprocedure('platform.r6_reject_template_runtime_mutation()') IS NULL THEN
    RAISE EXCEPTION 'R6 verification failed: reviewed template-import guard function is missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE NOT t.tgisinternal
      AND n.nspname = 'comms'
      AND c.relname = 'message_templates'
      AND t.tgname = 'message_templates_reviewed_import_only'
  ) OR NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE NOT t.tgisinternal
      AND n.nspname = 'comms'
      AND c.relname = 'message_template_versions'
      AND t.tgname = 'message_template_versions_reviewed_import_only'
  ) THEN
    RAISE EXCEPTION 'R6 verification failed: reviewed template-import trigger is missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'commercial'
      AND c.relname = 'deal_stages'
      AND con.conname = 'deal_stages_canonical_class_valid'
      AND pg_get_constraintdef(con.oid) LIKE '%PROPOSAL_PREPARATION%'
      AND pg_get_constraintdef(con.oid) NOT LIKE '%PROPOSAL_SENT%'
      AND pg_get_constraintdef(con.oid) NOT LIKE '%CONTRACT_SENT%'
      AND pg_get_constraintdef(con.oid) NOT LIKE '%PAYMENT_PENDING%'
      AND pg_get_constraintdef(con.oid) NOT LIKE '%WON%'
  ) THEN
    RAISE EXCEPTION 'R6 verification failed: deal stage ceiling is not enforced at PROPOSAL_PREPARATION';
  END IF;

  -- D15: template catalog is runtime read-only.
  IF has_table_privilege('perspective_runtime', 'comms.message_templates', 'INSERT')
    OR has_table_privilege('perspective_runtime', 'comms.message_templates', 'UPDATE')
    OR has_table_privilege('perspective_runtime', 'comms.message_templates', 'DELETE')
    OR has_table_privilege('perspective_runtime', 'comms.message_templates', 'TRUNCATE')
    OR has_table_privilege('perspective_runtime', 'comms.message_template_versions', 'INSERT')
    OR has_table_privilege('perspective_runtime', 'comms.message_template_versions', 'UPDATE')
    OR has_table_privilege('perspective_runtime', 'comms.message_template_versions', 'DELETE')
    OR has_table_privilege('perspective_runtime', 'comms.message_template_versions', 'TRUNCATE')
  THEN
    RAISE EXCEPTION 'R6 verification failed: template catalog has runtime mutation privilege';
  END IF;

  -- Representative mutable/evidence grants.
  IF NOT has_table_privilege('perspective_runtime', 'crm.leads', 'INSERT')
    OR NOT has_table_privilege('perspective_runtime', 'crm.leads', 'UPDATE')
    OR NOT has_table_privilege('perspective_runtime', 'comms.outreach_campaigns', 'INSERT')
    OR NOT has_table_privilege('perspective_runtime', 'commercial.deals', 'UPDATE')
    OR NOT has_table_privilege('perspective_runtime', 'crm.lead_scores', 'INSERT')
    OR has_table_privilege('perspective_runtime', 'crm.lead_scores', 'UPDATE')
    OR NOT has_table_privilege('perspective_runtime', 'comms.messages', 'INSERT')
    OR has_table_privilege('perspective_runtime', 'comms.messages', 'UPDATE')
    OR NOT has_table_privilege('perspective_runtime', 'commercial.deal_stage_history', 'INSERT')
    OR has_table_privilege('perspective_runtime', 'commercial.deal_stage_history', 'UPDATE')
  THEN
    RAISE EXCEPTION 'R6 verification failed: runtime DML privilege matrix is incorrect';
  END IF;

  -- R4 resource table remains non-mutable directly.
  IF has_table_privilege('perspective_runtime', 'platform.resources', 'INSERT')
    OR has_table_privilege('perspective_runtime', 'platform.resources', 'UPDATE')
    OR has_table_privilege('perspective_runtime', 'platform.resources', 'DELETE')
    OR has_table_privilege('perspective_runtime', 'platform.resources', 'TRUNCATE')
  THEN
    RAISE EXCEPTION 'R6 verification failed: R4 platform.resources mutation lock was weakened';
  END IF;

  -- Resource helper functions exist and are executable by runtime only through
  -- their constrained API.
  IF to_regprocedure(
    'platform.register_r6_resource(uuid,text,text,uuid,platform."Visibility",platform."Sensitivity")'
  ) IS NULL
    OR to_regprocedure(
      'platform.update_r6_resource(uuid,text,uuid,platform."Visibility",platform."Sensitivity",timestamptz)'
    ) IS NULL
  THEN
    RAISE EXCEPTION 'R6 verification failed: constrained resource helper functions are missing';
  END IF;

  IF NOT has_function_privilege(
    'perspective_runtime',
    'platform.register_r6_resource(uuid,text,text,uuid,platform."Visibility",platform."Sensitivity")',
    'EXECUTE'
  ) OR NOT has_function_privilege(
    'perspective_runtime',
    'platform.update_r6_resource(uuid,text,uuid,platform."Visibility",platform."Sensitivity",timestamptz)',
    'EXECUTE'
  ) THEN
    RAISE EXCEPTION 'R6 verification failed: runtime lacks constrained resource helper execution';
  END IF;

  -- Resource-envelope triggers cover all resource-backed aggregates.
  SELECT count(*) INTO trigger_count
  FROM pg_trigger t
  JOIN pg_class c ON c.oid = t.tgrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE NOT t.tgisinternal
    AND t.tgname LIKE '%_resource_envelope'
    AND n.nspname IN ('crm','comms','commercial');

  IF trigger_count <> 19 THEN
    RAISE EXCEPTION
      'R6 verification failed: expected 19 resource-envelope triggers, found %',
      trigger_count;
  END IF;

  -- Immutable evidence/version triggers.
  FOR item IN
    SELECT *
    FROM (VALUES
      ('crm','lead_scores','lead_scores_immutable'),
      ('crm','lead_status_history','lead_status_history_immutable'),
      ('comms','message_template_versions','message_template_versions_immutable'),
      ('comms','message_deliveries','message_deliveries_immutable'),
      ('comms','messages','messages_immutable'),
      ('commercial','deal_stage_history','deal_stage_history_immutable')
    ) AS immutable(schema_name, table_name, trigger_name)
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE NOT t.tgisinternal
        AND n.nspname = item.schema_name
        AND c.relname = item.table_name
        AND t.tgname = item.trigger_name
    ) THEN
      RAISE EXCEPTION
        'R6 verification failed: immutable trigger % is missing on %.%',
        item.trigger_name, item.schema_name, item.table_name;
    END IF;
  END LOOP;

  -- Composite keys required by tenant-aware cross-schema FKs.
  IF to_regclass('iam.departments_id_organization_id_key') IS NULL
    OR to_regclass('iam.organization_memberships_id_organization_id_key') IS NULL
    OR to_regclass('platform.resources_id_owner_organization_id_key') IS NULL
  THEN
    RAISE EXCEPTION 'R6 verification failed: composite tenant keys are missing';
  END IF;
END
$$;

SELECT
  (SELECT count(*) FROM information_schema.tables
    WHERE table_type = 'BASE TABLE'
      AND table_schema IN ('crm','comms','commercial')) AS r6_table_count,
  (SELECT count(*) FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname IN ('crm','comms','commercial')
      AND c.relkind = 'r'
      AND c.relrowsecurity
      AND c.relforcerowsecurity) AS r6_forced_rls_table_count,
  (SELECT rolbypassrls FROM pg_roles WHERE rolname = 'perspective_runtime') AS runtime_bypass_rls,
  has_table_privilege('perspective_runtime','platform.resources','INSERT') AS runtime_resource_insert,
  has_table_privilege('perspective_runtime','comms.message_templates','UPDATE') AS runtime_template_update,
  to_regclass('commercial.proposals') IS NOT NULL AS proposal_table_exists,
  to_regclass('commercial.contracts') IS NOT NULL AS contract_table_exists,
  to_regclass('commercial.invoices') IS NOT NULL AS invoice_table_exists,
  to_regclass('commercial.payments') IS NOT NULL AS payment_table_exists;


DO $$
BEGIN
  IF to_regprocedure('platform.claim_r6_client_conversion(uuid,text,text,timestamptz)') IS NULL
    OR to_regprocedure('platform.complete_r6_client_conversion(text,text,text)') IS NULL
    OR to_regprocedure('platform.resolve_r6_client_organization(uuid,uuid)') IS NULL
  THEN
    RAISE EXCEPTION 'R6 verification failed: constrained client conversion helpers are missing';
  END IF;

  IF NOT has_function_privilege(
      'perspective_runtime',
      'platform.claim_r6_client_conversion(uuid,text,text,timestamptz)',
      'EXECUTE'
    )
    OR NOT has_function_privilege(
      'perspective_runtime',
      'platform.complete_r6_client_conversion(text,text,text)',
      'EXECUTE'
    )
    OR NOT has_function_privilege(
      'perspective_runtime',
      'platform.resolve_r6_client_organization(uuid,uuid)',
      'EXECUTE'
    )
  THEN
    RAISE EXCEPTION 'R6 verification failed: runtime lacks constrained client conversion helper execution';
  END IF;

  IF has_table_privilege('perspective_runtime', 'iam.organizations', 'INSERT')
    OR has_table_privilege('perspective_runtime', 'iam.organizations', 'UPDATE')
    OR has_table_privilege('perspective_runtime', 'iam.organizations', 'DELETE')
    OR has_table_privilege('perspective_runtime', 'platform.idempotency_receipts', 'INSERT')
    OR has_table_privilege('perspective_runtime', 'platform.idempotency_receipts', 'UPDATE')
    OR has_table_privilege('perspective_runtime', 'platform.idempotency_receipts', 'DELETE')
  THEN
    RAISE EXCEPTION 'R6 verification failed: client conversion weakened IAM/idempotency table privileges';
  END IF;
END
$$;
