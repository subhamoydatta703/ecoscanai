import logging
import time

try:
    from google import genai
except Exception:  # pragma: no cover - optional dependency in some runtimes
    genai = None

from app.core.settings import get_settings

logger = logging.getLogger(__name__)

# Errors that should trigger a fallback to the next model rather than aborting.
_RETRYABLE_ERROR_KEYWORDS = {"RESOURCE_EXHAUSTED", "429", "NOT_FOUND", "404", "quota"}


def _is_retryable(error: Exception) -> bool:
    message = str(error).lower()
    return any(keyword.lower() in message for keyword in _RETRYABLE_ERROR_KEYWORDS)


class AIEngine:
    def __init__(self):
        settings = get_settings()
        api_key = settings.gemini_api_key
        self.primary_model = settings.gemini_model
        # Use diverse models so each has its own free-tier quota bucket.
        self.fallback_models = [
            self.primary_model,
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-2.0-flash-lite",
            "gemini-2.5-pro",
        ]
        if api_key and genai is not None:
            self.client = genai.Client(api_key=api_key)
        else:
            self.client = None

    def _clean_explanation(self, explanation: str) -> str:
        cleaned = explanation.replace("**", "").replace("__", "").strip()
        return "\n".join(line.strip() for line in cleaned.splitlines()).strip()

    def generate_green_code(self, original_code: str, anomaly_reasons: list[str]) -> dict:
        """
        Uses Gemini to suggest sustainable refactoring for anomalous code.
        Falls back through multiple models when one is rate-limited or unavailable.
        """
        if not self.client:
            return {
                "optimized_code": "// Gemini API Key not configured. Unable to generate green code.\n" + original_code,
                "carbon_saving_ratio": "0%",
                "explanation": "Please set GEMINI_API_KEY environment variable."
            }
            
        prompt = f"""
        You are an expert AI software engineer focused on sustainable, "green" computing and low-latency optimizations.
        The following code was flagged by an ML anomaly detector for these reasons: {', '.join(anomaly_reasons)}.
        
        Original Code:
        ```
        {original_code}
        ```
        
        Please provide:
        1. The refactored code that resolves these issues. Make it more computationally efficient.
        2. A brief explanation of why the new code is more "green" (energy-efficient).
        3. An estimated carbon reduction ratio (e.g., "30%").
        
        Format your response exactly like this:
        ```refactored_code
        <your refactored code here>
        ```
        EXPLANATION: <your explanation>
        CARBON_SAVING_RATIO: <percentage>
        """

        try:
            text = None
            last_error = None

            for model_name in dict.fromkeys(self.fallback_models):
                try:
                    logger.info("Trying Gemini model: %s", model_name)
                    response = self.client.models.generate_content(
                        model=model_name,
                        contents=prompt
                    )
                    text = response.text
                    logger.info("Got response from model: %s", model_name)
                    break
                except Exception as model_error:
                    last_error = model_error
                    if _is_retryable(model_error):
                        logger.warning(
                            "Model %s unavailable (%s), trying next model",
                            model_name,
                            type(model_error).__name__,
                        )
                        continue
                    raise

            if text is None:
                raise last_error or RuntimeError("No Gemini model returned a response.")

            optimized_code = original_code
            explanation = "Failed to parse response."
            ratio = "Unknown"
            
            if "```refactored_code" in text:
                parts = text.split("```refactored_code")
                if len(parts) > 1:
                    code_part = parts[1].split("```")[0].strip()
                    optimized_code = code_part
                    
            if "EXPLANATION:" in text:
                explanation = text.split("EXPLANATION:")[1].split("CARBON_SAVING_RATIO:")[0].strip()
                explanation = self._clean_explanation(explanation)
                
            if "CARBON_SAVING_RATIO:" in text:
                ratio = text.split("CARBON_SAVING_RATIO:")[1].strip()
                
            return {
                "optimized_code": optimized_code,
                "carbon_saving_ratio": ratio,
                "explanation": explanation
            }
            
        except Exception as e:
            logger.error("Error calling Gemini: %s", e)
            return {
                "optimized_code": original_code,
                "carbon_saving_ratio": "Error",
                "explanation": f"Failed to generate green code: {str(e)}"
            }
