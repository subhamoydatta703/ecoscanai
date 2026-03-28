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


if __name__ == "__main__":
    unittest.main()
