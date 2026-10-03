DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_roles
     WHERE rolname = 'perspective_runtime'
       AND (rolsuper OR rolbypassrls)
  ) THEN
    RAISE EXCEPTION 'R13 verification failed: perspective_runtime bypasses RLS';
  END IF;
  IF NOT EXISTS (
    SELECT 1
      FROM pg_class AS relation
      JOIN pg_namespace AS namespace ON namespace.oid = relation.relnamespace
     WHERE namespace.nspname = 'ops'
       AND relation.relname = 'integration_declarations'
       AND relation.relrowsecurity
       AND relation.relforcerowsecurity
  ) THEN
    RAISE EXCEPTION 'R13 verification failed: integration RLS is not forced';
  END IF;
  IF has_table_privilege('perspective_runtime', 'ops.organization_settings', 'INSERT')
     OR has_table_privilege('perspective_runtime', 'ops.integration_declarations', 'UPDATE')
     OR has_table_privilege('perspective_runtime', 'ops.integration_attempts', 'INSERT')
  THEN
    RAISE EXCEPTION 'R13 verification failed: table privileges are too broad';
  END IF;
  IF NOT has_function_privilege('perspective_runtime', 'ops.r13_read(uuid,text)', 'EXECUTE')
     OR NOT has_function_privilege('perspective_runtime', 'ops.r13_command(text,uuid,jsonb,uuid,uuid,text,text,text)', 'EXECUTE')
  THEN
    RAISE EXCEPTION 'R13 verification failed: required privileges are missing';
  END IF;
END $$;

SELECT true AS r13_verified;
