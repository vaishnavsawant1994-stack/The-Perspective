DO $$
DECLARE
  missing_count integer;
BEGIN
  SELECT count(*) INTO missing_count
  FROM (
    VALUES
      ('iam', 'organizations'),
      ('iam', 'people'),
      ('iam', 'user_accounts'),
      ('iam', 'organization_memberships'),
      ('iam', 'sessions'),
      ('platform', 'resources'),
      ('platform', 'idempotency_receipts'),
      ('platform', 'outbox_events'),
      ('platform', 'outbox_delivery_attempts'),
      ('platform', 'callback_receipts'),
      ('platform', 'callback_attempts'),
      ('platform', 'automation_runs'),
      ('platform', 'automation_step_attempts'),
      ('platform', 'incidents'),
      ('platform', 'incident_events'),
      ('platform', 'reconciliation_runs'),
      ('platform', 'reconciliation_findings'),
      ('audit', 'audit_events')
  ) AS expected(schema_name, table_name)
  WHERE to_regclass(format('%I.%I', schema_name, table_name)) IS NULL;

  IF missing_count <> 0 THEN
    RAISE EXCEPTION 'R2 verification failed: % required tables are missing', missing_count;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'citext'
  ) THEN
    RAISE EXCEPTION 'R2 verification failed: citext extension is missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'platform'
      AND tablename = 'resources'
      AND policyname = 'resources_select_by_context'
  ) THEN
    RAISE EXCEPTION 'R2 verification failed: resource select RLS policy is missing';
  END IF;

  IF (
    SELECT count(*)
    FROM pg_trigger
    WHERE NOT tgisinternal
      AND tgname IN (
        'outbox_delivery_attempts_immutable',
        'callback_attempts_immutable',
        'automation_step_attempts_immutable',
        'incident_events_immutable',
        'reconciliation_findings_immutable',
        'audit_events_immutable'
      )
  ) <> 6 THEN
    RAISE EXCEPTION 'R2 verification failed: immutable evidence triggers are incomplete';
  END IF;
END;
$$;

SELECT
  (SELECT count(*) FROM information_schema.tables WHERE table_schema IN ('iam', 'platform', 'audit')) AS foundation_table_count,
  (SELECT count(*) FROM pg_policies WHERE schemaname = 'platform' AND tablename = 'resources') AS resource_policy_count,
  (SELECT count(*) FROM pg_trigger WHERE NOT tgisinternal AND tgname LIKE '%_immutable') AS immutable_trigger_count;
