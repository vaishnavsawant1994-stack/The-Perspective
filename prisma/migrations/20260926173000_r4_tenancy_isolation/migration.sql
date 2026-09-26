-- Phase 4 R4: restricted runtime tenant-isolation boundary.
--
-- The application/migration owner connection remains administrative. Tenant-scoped
-- resource reads must SET LOCAL ROLE to this restricted role inside a transaction
-- and bind trusted transaction-local organization claims before querying data.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_roles
    WHERE rolname = 'perspective_runtime'
  ) THEN
    CREATE ROLE perspective_runtime
      NOLOGIN
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      NOREPLICATION
      NOBYPASSRLS;
  ELSE
    ALTER ROLE perspective_runtime
      NOLOGIN
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      NOREPLICATION
      NOBYPASSRLS;
  END IF;
END
$$;

GRANT perspective_runtime TO CURRENT_USER;
GRANT USAGE ON SCHEMA platform TO perspective_runtime;
GRANT SELECT ON TABLE platform.resources TO perspective_runtime;

-- The restricted runtime role never bypasses RLS. FORCE also keeps the table
-- owner from accidentally treating an owner-connection resource query as tenant-safe.
ALTER TABLE platform.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform.resources FORCE ROW LEVEL SECURITY;
