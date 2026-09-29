DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc AS proc
    JOIN pg_namespace AS n ON n.oid = proc.pronamespace
    WHERE n.nspname = 'platform'
      AND proc.proname = 'claim_r7_proposal_send'
      AND proc.prosecdef IS TRUE
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_proc AS proc
    JOIN pg_namespace AS n ON n.oid = proc.pronamespace
    WHERE n.nspname = 'platform'
      AND proc.proname = 'read_r7_proposal_send_replay'
      AND proc.prosecdef IS TRUE
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_proc AS proc
    JOIN pg_namespace AS n ON n.oid = proc.pronamespace
    WHERE n.nspname = 'platform'
      AND proc.proname = 'complete_r7_proposal_send'
      AND proc.prosecdef IS TRUE
  ) THEN
    RAISE EXCEPTION 'R7 proposal send SECURITY DEFINER helpers are missing';
  END IF;

  IF NOT has_function_privilege(
       'perspective_runtime',
       'platform.claim_r7_proposal_send(uuid,text,text,timestamptz)', 'EXECUTE'
     ) OR NOT has_function_privilege(
       'perspective_runtime',
       'platform.read_r7_proposal_send_replay(text)', 'EXECUTE'
     ) OR NOT has_function_privilege(
       'perspective_runtime',
       'platform.complete_r7_proposal_send(uuid,uuid,uuid,uuid,uuid,uuid,uuid,integer,integer,text,text,jsonb,text,text,text,timestamptz)',
       'EXECUTE'
     ) THEN
    RAISE EXCEPTION 'R7 proposal send runtime function grants are missing';
  END IF;

  IF has_table_privilege('perspective_runtime', 'audit.audit_events', 'INSERT')
     OR has_table_privilege('perspective_runtime', 'platform.outbox_events', 'INSERT')
     OR has_table_privilege('perspective_runtime', 'platform.idempotency_receipts', 'INSERT')
  THEN
    RAISE EXCEPTION 'R7 proposal send widened direct runtime evidence grants';
  END IF;
END;
$$;
