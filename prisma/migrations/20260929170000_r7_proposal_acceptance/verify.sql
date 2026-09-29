DO $$
DECLARE
  acceptance_oid regclass;
  acceptance_function regprocedure;
BEGIN
  acceptance_oid := to_regclass('commercial.proposal_acceptances');
  acceptance_function := to_regprocedure(
    'platform.complete_r7_proposal_acceptance(uuid,uuid,uuid,uuid,uuid,uuid,uuid,uuid,uuid,integer,integer,text,text,text,text)'
  );

  IF acceptance_oid IS NULL OR acceptance_function IS NULL THEN
    RAISE EXCEPTION 'R7 proposal acceptance table or command function is missing';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_class WHERE oid = acceptance_oid AND relrowsecurity AND relforcerowsecurity
  ) THEN
    RAISE EXCEPTION 'R7 proposal acceptance evidence must force RLS';
  END IF;
  IF NOT (SELECT prosecdef FROM pg_proc WHERE oid = acceptance_function) THEN
    RAISE EXCEPTION 'R7 proposal acceptance command must be SECURITY DEFINER';
  END IF;
  IF NOT has_function_privilege('perspective_runtime', acceptance_function, 'EXECUTE') THEN
    RAISE EXCEPTION 'R7 proposal acceptance command is not executable by runtime';
  END IF;
  IF has_table_privilege('perspective_runtime', acceptance_oid, 'SELECT')
     OR has_table_privilege('perspective_runtime', acceptance_oid, 'INSERT')
     OR has_table_privilege('perspective_runtime', acceptance_oid, 'UPDATE')
     OR has_table_privilege('perspective_runtime', acceptance_oid, 'DELETE')
  THEN
    RAISE EXCEPTION 'R7 runtime must not access acceptance evidence directly';
  END IF;
END;
$$;
