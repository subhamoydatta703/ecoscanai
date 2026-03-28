import os
import shutil
import sys
import unittest
import uuid
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from main import app


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        test_root = Path(__file__).resolve().parents[1] / "test_tmp"
        test_root.mkdir(exist_ok=True)
        self.temp_dir = test_root / f"ecoscan_api_test_{uuid.uuid4().hex}"
        self.temp_dir.mkdir()
        self.history_file = self.temp_dir / "scan_history.json"
        self.env_patcher = patch.dict(
            os.environ,
            {
                "ECOSCAN_HISTORY_FILE": str(self.history_file),
                "ECOSCAN_PERSIST_HISTORY": "true",
                "SUPABASE_URL": "",
                "SUPABASE_KEY": "",
            },
            clear=False,
        )
        self.env_patcher.start()

    def tearDown(self):
        self.env_patcher.stop()
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_rejects_invalid_remote_repository_url(self):
        response = self.client.post("/api/scan", json={"url": "github.com/example/repo", "is_local": False})

        self.assertEqual(response.status_code, 400)
        self.assertIn("http:// or https://", response.json()["detail"])

    def test_allows_cors_preflight_from_local_network_origin(self):
        response = self.client.options(
            "/api/scan",
            headers={
                "Origin": "http://192.168.1.102:3000",
                "Access-Control-Request-Method": "POST",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers.get("access-control-allow-origin"), "http://192.168.1.102:3000")

    def test_scans_valid_local_directory(self):
        (self.temp_dir / "app.py").write_text("print('hello')\n", encoding="utf-8")

        response = self.client.post("/api/scan", json={"url": str(self.temp_dir), "is_local": True})

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["status"], "success")
        self.assertEqual(body["total_files_scanned"], 1)

    def test_reports_route_aggregates_real_scan_history(self):
        (self.temp_dir / "app.py").write_text("for i in range(3):\n    print(i)\n", encoding="utf-8")

        scan_response = self.client.post("/api/scan", json={"url": str(self.temp_dir), "is_local": True})
        self.assertEqual(scan_response.status_code, 200)

        reports_response = self.client.get("/api/reports")
        self.assertEqual(reports_response.status_code, 200)

        reports = reports_response.json()
        self.assertGreaterEqual(reports["repositories_scanned"], 1)
        self.assertEqual(len(reports["history"]), 1)
        self.assertEqual(len(reports["recent_scans"]), 1)

    def test_reset_history_clears_reports_and_patterns(self):
        (self.temp_dir / "app.py").write_text("for i in range(3):\n    print(i)\n", encoding="utf-8")

        scan_response = self.client.post("/api/scan", json={"url": str(self.temp_dir), "is_local": True})
        self.assertEqual(scan_response.status_code, 200)

        reset_response = self.client.post("/api/history/reset")
        self.assertEqual(reset_response.status_code, 200)
        self.assertEqual(reset_response.json()["status"], "success")

        reports_response = self.client.get("/api/reports")
        self.assertEqual(reports_response.status_code, 200)
        self.assertEqual(reports_response.json()["total_scans"], 0)

        patterns_response = self.client.get("/api/patterns")
        self.assertEqual(patterns_response.status_code, 200)
        self.assertTrue(all((pattern.get("times_recommended") or 0) == 0 for pattern in patterns_response.json()["patterns"]))


if __name__ == "__main__":
    unittest.main()
