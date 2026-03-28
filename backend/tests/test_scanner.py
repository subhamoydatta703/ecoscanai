import shutil
import sys
import unittest
import uuid
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.engine.scanner import CodeScanner


class ScannerTests(unittest.TestCase):
    def setUp(self):
        test_root = Path(__file__).resolve().parents[1] / "test_tmp"
        test_root.mkdir(exist_ok=True)
        self.temp_dir = test_root / f"ecoscan_scanner_test_{uuid.uuid4().hex}"
        self.temp_dir.mkdir()
        self.scanner = CodeScanner()

    def tearDown(self):
        shutil.rmtree(self.temp_dir, ignore_errors=True)

    def test_scans_supported_text_files(self):
        sample = self.temp_dir / "sample.py"
        sample.write_text("for i in range(3):\n    print(i)\n", encoding="utf-8")

        results = self.scanner.scan_directory(str(self.temp_dir))

        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["file_path"], "sample.py")
        self.assertGreaterEqual(results[0]["computational_complexity"], 1)

    def test_skips_binary_files(self):
        sample = self.temp_dir / "sample.py"
        sample.write_bytes(b"\x00\x01\x02")

        results = self.scanner.scan_directory(str(self.temp_dir))

        self.assertEqual(results, [])


if __name__ == "__main__":
    unittest.main()
