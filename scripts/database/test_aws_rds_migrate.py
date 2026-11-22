"""Unit-only safety tests for AWS migration (no live DB needed)."""
import importlib.util
from pathlib import Path
from unittest import TestCase, main
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("aws_rds_migrate", Path(__file__).with_name("aws_rds_migrate.py"))
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


class TestMigration(TestCase):
    def test_tls_required(self):
        for mode in ("disable", "allow", "prefer", "require", "verify-ca"):
            with self.subTest(sslmode=mode), self.assertRaises(m.MigrationError):
                m.connection(f"postgresql://u:p@example.com/perspective?sslmode={mode}")

    def test_verify_full_default(self):
        e = m.connection("postgresql://u:p@example.com/perspective")
        self.assertEqual(e["PGSSLMODE"], "verify-full")

    def test_url_encoded_password(self):
        e = m.connection("postgresql://user:a%40b@example.com/perspective?sslmode=verify-full")
        self.assertEqual(e["PGPASSWORD"], "a@b")
        self.assertEqual(e["PGSSLMODE"], "verify-full")

    def test_same_database_blocked(self):
        e = m.connection("postgresql://u:p@example.com/perspective?sslmode=verify-full")
        with self.assertRaises(m.MigrationError):
            m.preflight(e, e)

    def test_nonempty_target_blocked(self):
        a = m.connection("postgresql://u:p@source.example.com/source?sslmode=verify-full")
        b = m.connection("postgresql://u:p@target.example.com/target?sslmode=verify-full")
        with patch.object(m, "identity", return_value={}):
            with patch.object(m, "tables", side_effect=[[("iam", "users")], [("iam", "existing")]]):
                with self.assertRaisesRegex(m.MigrationError, "not empty"):
                    m.preflight(a, b)

    def test_quoted_names(self):
        self.assertEqual(m.quoted('x"y'), '"x""y"')

    def test_row_count_query(self):
        with patch.object(m, "tables", return_value=[("iam", "users")]):
            with patch.object(m, "sql", return_value="iam.users\t3") as sql:
                self.assertEqual(m.counts({}), {"iam.users": 3})
                self.assertIn('FROM "iam"."users"', sql.call_args.args[1])


if __name__ == "__main__":
    main()
