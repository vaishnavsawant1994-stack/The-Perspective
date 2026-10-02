DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_roles
     WHERE rolname = 'perspective_runtime'
       AND (rolsuper OR rolbypassrls)
  ) THEN
    RAISE EXCEPTION 'R11 verification failed: perspective_runtime bypasses RLS';
  END IF;
  IF NOT EXISTS (
    SELECT 1
      FROM pg_class AS relation
      JOIN pg_namespace AS namespace ON namespace.oid = relation.relnamespace
     WHERE namespace.nspname = 'growth'
       AND relation.relname = 'observations'
       AND relation.relrowsecurity
       AND relation.relforcerowsecurity
  ) THEN
    RAISE EXCEPTION 'R11 verification failed: observations RLS is not forced';
  END IF;
  IF has_table_privilege('perspective_runtime', 'growth.observations', 'INSERT')
     OR has_table_privilege('perspective_runtime', 'growth.report_runs', 'INSERT')
     OR has_table_privilege('perspective_public', 'growth.observations', 'SELECT')
  THEN
    RAISE EXCEPTION 'R11 verification failed: table privileges are too broad';
  END IF;
  IF NOT has_table_privilege('perspective_runtime', 'growth.observations', 'SELECT')
     OR NOT has_function_privilege('perspective_runtime', 'growth.r11_execute(text,uuid,jsonb,uuid,uuid,text,text,text)', 'EXECUTE')
     OR NOT has_function_privilege('perspective_public', 'growth.r11_public_meta(text)', 'EXECUTE')
  THEN
    RAISE EXCEPTION 'R11 verification failed: required privileges are missing';
  END IF;
END $$;

SELECT true AS r11_verified;
