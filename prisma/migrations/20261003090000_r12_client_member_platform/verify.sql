DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_roles
     WHERE rolname = 'perspective_runtime'
       AND (rolsuper OR rolbypassrls)
  ) THEN
    RAISE EXCEPTION 'R12 verification failed: perspective_runtime bypasses RLS';
  END IF;
  IF NOT EXISTS (
    SELECT 1
      FROM pg_class AS relation
      JOIN pg_namespace AS namespace ON namespace.oid = relation.relnamespace
     WHERE namespace.nspname = 'portal'
       AND relation.relname = 'access_grants'
       AND relation.relrowsecurity
       AND relation.relforcerowsecurity
  ) THEN
    RAISE EXCEPTION 'R12 verification failed: access grant RLS is not forced';
  END IF;
  IF has_table_privilege('perspective_runtime', 'portal.access_grants', 'INSERT')
     OR has_table_privilege('perspective_runtime', 'member.offers', 'INSERT')
     OR has_table_privilege('perspective_runtime', 'member.checkout_attempts', 'UPDATE')
     OR has_table_privilege('perspective_runtime', 'member.profiles', 'INSERT')
  THEN
    RAISE EXCEPTION 'R12 verification failed: table privileges are too broad';
  END IF;
  IF NOT has_function_privilege('perspective_runtime', 'portal.r12_client_read(uuid,text,jsonb)', 'EXECUTE')
     OR NOT has_function_privilege('perspective_runtime', 'portal.r12_worker(text,jsonb,uuid,uuid,text,text,text)', 'EXECUTE')
  THEN
    RAISE EXCEPTION 'R12 verification failed: required privileges are missing';
  END IF;
END $$;

SELECT true AS r12_verified;
