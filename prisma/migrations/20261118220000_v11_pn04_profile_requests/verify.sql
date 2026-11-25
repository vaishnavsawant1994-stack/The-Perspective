DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema='profiles' AND table_name='profile_requests'
  ) THEN
    RAISE EXCEPTION 'PN-04 verification failed: request table is missing';
  END IF;
  IF has_table_privilege('perspective_runtime','profiles.profile_requests','SELECT')
     OR has_table_privilege('perspective_runtime','profiles.profile_requests','INSERT')
     OR has_table_privilege('perspective_runtime','profiles.profile_requests','UPDATE')
     OR has_table_privilege('perspective_runtime','profiles.profile_requests','DELETE')
     OR has_table_privilege('perspective_public','profiles.profile_requests','SELECT')
     OR has_table_privilege('perspective_public','profiles.profile_requests','INSERT')
     OR has_table_privilege('perspective_public','profiles.profile_requests','UPDATE')
     OR has_table_privilege('perspective_public','profiles.profile_requests','DELETE')
  THEN
    RAISE EXCEPTION 'PN-04 verification failed: request table privileges are too broad';
  END IF;
  IF NOT has_function_privilege('perspective_runtime','profiles.pn04_purge_expired(uuid)','EXECUTE')
     OR has_function_privilege('perspective_public','profiles.pn04_purge_expired(uuid)','EXECUTE')
  THEN
    RAISE EXCEPTION 'PN-04 verification failed: retention function grants are unsafe';
  END IF;
  IF NOT has_function_privilege('perspective_public','profiles.pn04_public_submit(text,text,text,text,text,text,text,text)','EXECUTE')
  THEN
    RAISE EXCEPTION 'PN-04 verification failed: public submission function grant is missing';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc AS procedure
    JOIN pg_namespace AS namespace ON namespace.oid=procedure.pronamespace
    WHERE namespace.nspname='profiles'
      AND procedure.proname='pn04_purge_expired'
      AND procedure.prosecdef
  ) THEN
    RAISE EXCEPTION 'PN-04 verification failed: purge function is not SECURITY DEFINER';
  END IF;
END $$;

SELECT true AS pn04_verified;
