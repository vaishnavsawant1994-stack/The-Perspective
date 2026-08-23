DO $$
DECLARE
  missing_count integer;
BEGIN
  SELECT count(*) INTO missing_count
  FROM (
    VALUES
      ('iam', 'password_credentials'),
      ('iam', 'authentication_attempts'),
      ('iam', 'authentication_secrets'),
      ('iam', 'mfa_challenges')
  ) AS expected(schema_name, table_name)
  WHERE to_regclass(format('%I.%I', schema_name, table_name)) IS NULL;

  IF missing_count <> 0 THEN
    RAISE EXCEPTION 'R3 verification failed: % authentication tables are missing', missing_count;
  END IF;

  IF (
    SELECT count(*)
    FROM pg_trigger
    WHERE NOT tgisinternal
      AND tgname IN (
        'password_credentials_immutable',
        'authentication_attempts_immutable',
        'authentication_secrets_immutable'
      )
  ) <> 3 THEN
    RAISE EXCEPTION 'R3 verification failed: immutable authentication triggers are incomplete';
  END IF;

  IF (
    SELECT count(*)
    FROM information_schema.columns
    WHERE table_schema = 'iam'
      AND table_name = 'sessions'
      AND (
        (column_name IN ('surface', 'authentication_method') AND is_nullable = 'NO')
        OR (column_name = 'mfa_verified_at' AND is_nullable = 'YES')
      )
  ) <> 3 THEN
    RAISE EXCEPTION 'R3 verification failed: required session columns are incomplete';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'iam'
      AND table_name = 'mfa_challenges'
      AND column_name = 'remember_session'
      AND is_nullable = 'NO'
  ) THEN
    RAISE EXCEPTION 'R3 verification failed: MFA session intent is missing';
  END IF;
END;
$$;

SELECT
  (SELECT count(*) FROM information_schema.tables
    WHERE table_schema = 'iam'
      AND table_name IN (
        'password_credentials',
        'authentication_attempts',
        'authentication_secrets',
        'mfa_challenges'
      )) AS r3_authentication_table_count,
  (SELECT count(*) FROM pg_trigger
    WHERE NOT tgisinternal
      AND tgname IN (
        'password_credentials_immutable',
        'authentication_attempts_immutable',
        'authentication_secrets_immutable'
      )) AS r3_immutable_trigger_count,
  (SELECT count(*) FROM information_schema.columns
    WHERE table_schema = 'iam'
      AND table_name = 'sessions'
      AND column_name IN ('surface', 'authentication_method', 'mfa_verified_at')) AS r3_required_session_columns;
