from datetime import datetime, timedelta, timezone
import unittest

from neon_object_storage import BACKUP_PREFIX, retention_candidates


class RetentionCandidateTests(unittest.TestCase):
    def test_selects_only_valid_backup_objects_older_than_cutoff(self):
        now = datetime(2026, 11, 1, tzinfo=timezone.utc)
        old = now - timedelta(days=31)
        recent = now - timedelta(days=29)
        candidates = [
            {"Key": f"{BACKUP_PREFIX}2026-09-30/old.dump.gpg", "LastModified": old},
            {"Key": f"{BACKUP_PREFIX}2026-10-03/recent.dump.gpg", "LastModified": recent},
            {"Key": f"{BACKUP_PREFIX}2026-09-30/notes.txt", "LastModified": old},
            {"Key": "another-prefix/2026-09-30/old.dump.gpg", "LastModified": old},
        ]

        self.assertEqual(
            retention_candidates(candidates, now - timedelta(days=30)),
            [f"{BACKUP_PREFIX}2026-09-30/old.dump.gpg"],
        )

    def test_keeps_object_exactly_at_cutoff(self):
        cutoff = datetime(2026, 10, 2, tzinfo=timezone.utc)
        objects = [
            {"Key": f"{BACKUP_PREFIX}2026-10-02/boundary.dump.gpg", "LastModified": cutoff}
        ]
        self.assertEqual(retention_candidates(objects, cutoff), [])

    def test_ignores_non_backup_object_in_backup_prefix(self):
        cutoff = datetime(2026, 11, 1, tzinfo=timezone.utc)
        objects = [
            {"Key": f"{BACKUP_PREFIX}2026-09-30/unrelated.txt", "LastModified": cutoff - timedelta(days=90)}
        ]
        self.assertEqual(retention_candidates(objects, cutoff - timedelta(days=30)), [])


if __name__ == "__main__":
    unittest.main()
