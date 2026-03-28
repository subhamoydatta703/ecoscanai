import os
import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.settings import get_settings


class SettingsTests(unittest.TestCase):
    def test_reads_cors_origins_from_environment(self):
        with patch.dict(
            os.environ,
            {
                "ECOSCAN_CORS_ORIGINS": "http://example.com,http://127.0.0.1:3000",
                "ECOSCAN_CORS_ORIGIN_REGEX": r"^https?://example\.com$",
            },
            clear=False,
        ):
            settings = get_settings()

        self.assertEqual(settings.cors_origins, ["http://example.com", "http://127.0.0.1:3000"])
        self.assertEqual(settings.cors_origin_regex, r"^https?://example\.com$")

    def test_reads_supabase_configuration_from_environment(self):
        with patch.dict(
            os.environ,
            {
                "SUPABASE_URL": "https://example.supabase.co",
                "SUPABASE_KEY": "service-role-key",
                "SUPABASE_HISTORY_TABLE": "audit_history",
                "SUPABASE_STORAGE_BUCKET": "ecoscan-artifacts",
                "SUPABASE_STORAGE_PREFIX": "reports",
            },
            clear=False,
        ):
            settings = get_settings()

        self.assertEqual(settings.supabase_url, "https://example.supabase.co")
        self.assertEqual(settings.supabase_key, "service-role-key")
        self.assertEqual(settings.supabase_history_table, "audit_history")
        self.assertEqual(settings.supabase_storage_bucket, "ecoscan-artifacts")
        self.assertEqual(settings.supabase_storage_prefix, "reports")


if __name__ == "__main__":
    unittest.main()
