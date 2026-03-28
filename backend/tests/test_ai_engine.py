import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.engine.ai_engine import AIEngine


class _FakeModels:
    def __init__(self):
        self.calls = []

    def generate_content(self, model: str, contents: str):
        self.calls.append(model)
        if model == "missing-model":
            raise Exception("404 NOT_FOUND")

        class _Response:
            text = """```refactored_code
print("optimized")
```
EXPLANATION: Better complexity.
CARBON_SAVING_RATIO: 15%
"""

        return _Response()


class _FakeClient:
    def __init__(self):
        self.models = _FakeModels()


class AIEngineTests(unittest.TestCase):
    def test_falls_back_when_primary_model_is_not_found(self):
        with patch("app.engine.ai_engine.get_settings") as mock_settings, patch("app.engine.ai_engine.genai.Client") as mock_client:
            mock_settings.return_value.gemini_api_key = "fake-key"
            mock_settings.return_value.gemini_model = "missing-model"
            fake_client = _FakeClient()
            mock_client.return_value = fake_client

            engine = AIEngine()
            result = engine.generate_green_code("print('hi')", ["Deeply nested loops detected"])

            self.assertEqual(result["optimized_code"], 'print("optimized")')
            self.assertEqual(result["carbon_saving_ratio"], "15%")
            self.assertIn("missing-model", fake_client.models.calls)
            self.assertIn("gemini-2.5-flash", fake_client.models.calls)


if __name__ == "__main__":
    unittest.main()
