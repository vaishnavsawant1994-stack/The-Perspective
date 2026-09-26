DO $$
DECLARE
  runtime_role record;
  resource_security record;
BEGIN
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
    RAISE EXCEPTION 'R4 verification failed: perspective_runtime role is missing';
  END IF;

  IF runtime_role.rolcanlogin
    OR runtime_role.rolsuper
    OR runtime_role.rolcreatedb
    OR runtime_role.rolcreaterole
    OR runtime_role.rolinherit
    OR runtime_role.rolreplication
    OR runtime_role.rolbypassrls
  THEN
    RAISE EXCEPTION 'R4 verification failed: perspective_runtime privileges are too broad';
  END IF;

  SELECT relrowsecurity, relforcerowsecurity
  INTO resource_security
  FROM pg_class
  WHERE oid = 'platform.resources'::regclass;

  IF NOT resource_security.relrowsecurity
    OR NOT resource_security.relforcerowsecurity
  THEN
    RAISE EXCEPTION 'R4 verification failed: platform.resources RLS is not enabled and forced';
  END IF;

  IF NOT has_schema_privilege('perspective_runtime', 'platform', 'USAGE') THEN
    RAISE EXCEPTION 'R4 verification failed: runtime role lacks platform schema usage';
  END IF;

  IF NOT has_table_privilege('perspective_runtime', 'platform.resources', 'SELECT') THEN
    RAISE EXCEPTION 'R4 verification failed: runtime role lacks resource select';
  END IF;

  IF has_table_privilege('perspective_runtime', 'platform.resources', 'INSERT')
    OR has_table_privilege('perspective_runtime', 'platform.resources', 'UPDATE')
    OR has_table_privilege('perspective_runtime', 'platform.resources', 'DELETE')
    OR has_table_privilege('perspective_runtime', 'platform.resources', 'TRUNCATE')
  THEN
    RAISE EXCEPTION 'R4 verification failed: runtime role can mutate platform.resources';
  END IF;
END
$$;

SELECT
  (SELECT rolbypassrls FROM pg_roles WHERE rolname = 'perspective_runtime') AS runtime_bypass_rls,
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'platform.resources'::regclass) AS resource_rls_enabled,
  (SELECT relforcerowsecurity FROM pg_class WHERE oid = 'platform.resources'::regclass) AS resource_rls_forced,
  has_table_privilege('perspective_runtime', 'platform.resources', 'SELECT') AS runtime_resource_select,
  (
    has_table_privilege('perspective_runtime', 'platform.resources', 'INSERT')
    OR has_table_privilege('perspective_runtime', 'platform.resources', 'UPDATE')
    OR has_table_privilege('perspective_runtime', 'platform.resources', 'DELETE')
    OR has_table_privilege('perspective_runtime', 'platform.resources', 'TRUNCATE')
  ) AS runtime_resource_mutate;
