DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_roles
     WHERE rolname = 'perspective_runtime'
       AND (rolsuper OR rolbypassrls)
  ) THEN
    RAISE EXCEPTION 'R10 verification failed: perspective_runtime bypasses RLS';
  END IF;
  IF NOT EXISTS (
    SELECT 1
      FROM pg_class AS relation
      JOIN pg_namespace AS namespace ON namespace.oid = relation.relnamespace
     WHERE namespace.nspname = 'media'
       AND relation.relname = 'podcast_shows'
       AND relation.relrowsecurity
       AND relation.relforcerowsecurity
  ) THEN
    RAISE EXCEPTION 'R10 verification failed: podcast_shows RLS is not forced';
  END IF;
  IF has_table_privilege('perspective_runtime', 'media.podcast_shows', 'INSERT')
     OR has_table_privilege('perspective_runtime', 'distribution.delivery_evidence', 'INSERT')
     OR has_table_privilege('perspective_public', 'distribution.delivery_evidence', 'SELECT')
  THEN
    RAISE EXCEPTION 'R10 verification failed: table privileges are too broad';
  END IF;
  IF NOT has_table_privilege('perspective_runtime', 'media.podcast_shows', 'SELECT')
     OR NOT has_function_privilege('perspective_runtime', 'media.r10_execute(text,uuid,jsonb,uuid,uuid,text,text,text)', 'EXECUTE')
     OR NOT has_function_privilege('perspective_public', 'distribution.r10_public_delivery(text)', 'EXECUTE')
  THEN
    RAISE EXCEPTION 'R10 verification failed: required privileges are missing';
  END IF;
END $$;

SELECT true AS r10_verified;
