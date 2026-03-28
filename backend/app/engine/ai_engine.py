from google import genai
from app.core.settings import get_settings

class AIEngine:
    def __init__(self):
        settings = get_settings()
        api_key = settings.gemini_api_key
        self.primary_model = settings.gemini_model
        self.fallback_models = [
            self.primary_model,
            "gemini-2.5-flash",
            "gemini-2.5-pro",
            "gemini-flash-latest",
        ]
        if api_key:
            self.client = genai.Client(api_key=api_key)
        else:
            self.client = None

    def _clean_explanation(self, explanation: str) -> str:
        cleaned = explanation.replace("**", "").replace("__", "").strip()
        return "\n".join(line.strip() for line in cleaned.splitlines()).strip()

    def generate_green_code(self, original_code: str, anomaly_reasons: list[str]) -> dict:
        """
        Uses Gemini to suggest sustainable refactoring for anomalous code.
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
                    response = self.client.models.generate_content(
                        model=model_name,
                        contents=prompt
                    )
                    text = response.text
                    break
                except Exception as model_error:
                    last_error = model_error
                    if "NOT_FOUND" not in str(model_error) and "404" not in str(model_error):
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
            print(f"Error calling Gemini: {e}")
            return {
                "optimized_code": original_code,
                "carbon_saving_ratio": "Error",
                "explanation": f"Failed to generate green code: {str(e)}"
            }
