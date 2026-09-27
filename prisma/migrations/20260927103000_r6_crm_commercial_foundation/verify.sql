DO $$
DECLARE
  runtime_role record;
  table_name text;
  table_security record;
  expected_tables text[] := ARRAY['crm.lead_sources', 'crm.extraction_jobs', 'crm.staged_records', 'crm.enrichment_jobs', 'crm.enrichment_facts', 'crm.companies', 'crm.contacts', 'crm.leads', 'crm.lead_scores', 'crm.lead_status_history', 'crm.lead_lists', 'crm.lead_list_members', 'crm.qualifications', 'crm.duplicate_candidates', 'crm.suppression_entries', 'comms.sending_accounts', 'comms.message_templates', 'comms.message_template_versions', 'comms.outreach_campaigns', 'comms.sequences', 'comms.sequence_steps', 'comms.campaign_recipients', 'comms.message_deliveries', 'comms.conversations', 'comms.conversation_participants', 'comms.messages', 'comms.meetings', 'comms.meeting_participants', 'comms.meeting_notes', 'commercial.deal_pipelines', 'commercial.deal_stages', 'commercial.deals', 'commercial.deal_stage_history', 'commercial.client_accounts', 'commercial.client_relationships']::text[];
  mutable_tables text[] := ARRAY['crm.lead_sources', 'crm.extraction_jobs', 'crm.staged_records', 'crm.enrichment_jobs', 'crm.enrichment_facts', 'crm.companies', 'crm.contacts', 'crm.leads', 'crm.lead_lists', 'crm.lead_list_members', 'crm.qualifications', 'crm.duplicate_candidates', 'crm.suppression_entries', 'comms.sending_accounts', 'comms.outreach_campaigns', 'comms.sequences', 'comms.sequence_steps', 'comms.campaign_recipients', 'comms.conversations', 'comms.conversation_participants', 'comms.meetings', 'comms.meeting_participants', 'comms.meeting_notes', 'commercial.deal_pipelines', 'commercial.deal_stages', 'commercial.deals', 'commercial.client_accounts', 'commercial.client_relationships']::text[];
  append_only_tables text[] := ARRAY['crm.lead_scores', 'crm.lead_status_history', 'comms.message_deliveries', 'comms.messages', 'commercial.deal_stage_history']::text[];
  template_tables text[] := ARRAY['comms.message_templates', 'comms.message_template_versions']::text[];
  prohibited_tables text[] := ARRAY['commercial.products', 'commercial.packages', 'commercial.proposals', 'commercial.proposal_versions', 'commercial.proposal_acceptances', 'commercial.contracts', 'commercial.contract_versions', 'commercial.contract_signers', 'commercial.signature_events', 'commercial.invoices', 'commercial.invoice_lines', 'commercial.credit_notes', 'commercial.credit_note_lines', 'commercial.payments', 'commercial.payment_allocations', 'commercial.refunds', 'commercial.ledger_transactions', 'commercial.ledger_entries']::text[];
BEGIN
  SELECT rolcanlogin, rolsuper, rolcreatedb, rolcreaterole,
         rolinherit, rolreplication, rolbypassrls
  INTO runtime_role
  FROM pg_roles
  WHERE rolname = 'perspective_runtime';

  IF runtime_role IS NULL THEN
    RAISE EXCEPTION 'R6 verification failed: perspective_runtime role is missing';
  END IF;

  IF runtime_role.rolcanlogin OR runtime_role.rolsuper OR runtime_role.rolcreatedb
     OR runtime_role.rolcreaterole OR runtime_role.rolinherit
     OR runtime_role.rolreplication OR runtime_role.rolbypassrls THEN
    RAISE EXCEPTION 'R6 verification failed: perspective_runtime privileges are too broad';
  END IF;

  IF NOT has_schema_privilege('perspective_runtime', 'crm', 'USAGE')
     OR NOT has_schema_privilege('perspective_runtime', 'comms', 'USAGE')
     OR NOT has_schema_privilege('perspective_runtime', 'commercial', 'USAGE') THEN
    RAISE EXCEPTION 'R6 verification failed: runtime schema usage is incomplete';
  END IF;

  FOREACH table_name IN ARRAY expected_tables LOOP
    IF to_regclass(table_name) IS NULL THEN
      RAISE EXCEPTION 'R6 verification failed: expected table % is missing', table_name;
    END IF;

    SELECT relrowsecurity, relforcerowsecurity
    INTO table_security
    FROM pg_class
    WHERE oid = to_regclass(table_name);

    IF NOT table_security.relrowsecurity OR NOT table_security.relforcerowsecurity THEN
      RAISE EXCEPTION 'R6 verification failed: RLS not enabled+forced on %', table_name;
    END IF;

    IF NOT has_table_privilege('perspective_runtime', table_name, 'SELECT') THEN
      RAISE EXCEPTION 'R6 verification failed: runtime SELECT missing on %', table_name;
    END IF;

    IF has_table_privilege('perspective_runtime', table_name, 'DELETE')
       OR has_table_privilege('perspective_runtime', table_name, 'TRUNCATE') THEN
      RAISE EXCEPTION 'R6 verification failed: runtime destructive privilege on %', table_name;
    END IF;
  END LOOP;

  FOREACH table_name IN ARRAY mutable_tables LOOP
    IF NOT has_table_privilege('perspective_runtime', table_name, 'INSERT')
       OR NOT has_table_privilege('perspective_runtime', table_name, 'UPDATE') THEN
      RAISE EXCEPTION 'R6 verification failed: mutable runtime DML missing on %', table_name;
    END IF;
  END LOOP;

  FOREACH table_name IN ARRAY append_only_tables LOOP
    IF NOT has_table_privilege('perspective_runtime', table_name, 'INSERT')
       OR has_table_privilege('perspective_runtime', table_name, 'UPDATE') THEN
      RAISE EXCEPTION 'R6 verification failed: append-only privileges invalid on %', table_name;
    END IF;
  END LOOP;

  FOREACH table_name IN ARRAY template_tables LOOP
    IF has_table_privilege('perspective_runtime', table_name, 'INSERT')
       OR has_table_privilege('perspective_runtime', table_name, 'UPDATE')
       OR has_table_privilege('perspective_runtime', table_name, 'DELETE') THEN
      RAISE EXCEPTION 'R6 verification failed: D15 template mutation privilege exists on %', table_name;
    END IF;
  END LOOP;

  FOREACH table_name IN ARRAY prohibited_tables LOOP
    IF to_regclass(table_name) IS NOT NULL THEN
      RAISE EXCEPTION 'R6 verification failed: R7-owned table % exists in R6', table_name;
    END IF;
  END LOOP;

  IF (
    SELECT count(*)
    FROM information_schema.tables
    WHERE table_schema IN ('crm','comms','commercial')
  ) <> 35 THEN
    RAISE EXCEPTION 'R6 verification failed: unexpected R6 table count';
  END IF;

  IF to_regprocedure('platform.r6_assert_resource_envelope()') IS NULL
     OR to_regprocedure('platform.r6_assert_same_tenant_reference()') IS NULL
     OR to_regprocedure('comms.r6_reject_template_runtime_mutation()') IS NULL THEN
    RAISE EXCEPTION 'R6 verification failed: required R6 invariant function missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'comms.message_templates'::regclass
      AND tgname = 'message_templates_r6_import_only'
      AND NOT tgisinternal
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgrelid = 'comms.message_template_versions'::regclass
      AND tgname = 'message_template_versions_r6_import_only'
      AND NOT tgisinternal
  ) THEN
    RAISE EXCEPTION 'R6 verification failed: D15 template mutation trigger missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'commercial.deal_stages'::regclass
      AND conname = 'deal_stages_r6_canonical_class'
  ) THEN
    RAISE EXCEPTION 'R6 verification failed: deal-stage R6 ceiling constraint missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'commercial'
      AND tablename = 'client_accounts'
      AND indexname = 'client_accounts_live_client_org_key'
  ) THEN
    RAISE EXCEPTION 'R6 verification failed: one-active-client-account invariant missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'crm'
      AND tablename = 'suppression_entries'
      AND indexname = 'suppression_entries_live_destination_key'
  ) THEN
    RAISE EXCEPTION 'R6 verification failed: suppression uniqueness invariant missing';
  END IF;
END
$$;

SELECT
  (SELECT count(*)::int FROM information_schema.tables WHERE table_schema = 'crm') AS r6_crm_tables,
  (SELECT count(*)::int FROM information_schema.tables WHERE table_schema = 'comms') AS r6_comms_tables,
  (SELECT count(*)::int FROM information_schema.tables WHERE table_schema = 'commercial') AS r6_commercial_tables,
  (SELECT count(*)::int FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname IN ('crm','comms','commercial') AND c.relkind = 'r'
       AND c.relrowsecurity AND c.relforcerowsecurity) AS r6_forced_rls_tables,
  (SELECT rolbypassrls FROM pg_roles WHERE rolname = 'perspective_runtime') AS r6_runtime_bypass_rls,
  has_table_privilege('perspective_runtime', 'comms.message_templates', 'INSERT') AS r6_template_runtime_insert,
  (to_regclass('commercial.proposals') IS NOT NULL) AS r6_proposal_table_present;
