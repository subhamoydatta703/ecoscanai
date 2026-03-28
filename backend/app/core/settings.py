import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

BACKEND_ROOT = Path(__file__).resolve().parents[2]
ENV_FILE = BACKEND_ROOT / ".env"

load_dotenv(dotenv_path=ENV_FILE, override=True)


def _clean_regex(value: str) -> str:
    return value.replace("\\\\", "\\").strip()


def _parse_csv(value: str | None, default: list[str]) -> list[str]:
    if not value:
        return default
    parsed = [item.strip() for item in value.split(",") if item.strip()]
    valid = [item for item in parsed if "://" in item]
    return valid or default


def _parse_int(name: str, default: int, minimum: int = 1) -> int:
    raw = os.getenv(name)
    if raw in (None, ""):
        return default

    try:
        value = int(raw)
    except ValueError as exc:
        raise ValueError(f"{name} must be an integer.") from exc

    if value < minimum:
        raise ValueError(f"{name} must be at least {minimum}.")

    return value


@dataclass(frozen=True)
class Settings:
    gemini_api_key: str
    gemini_model: str
    supabase_url: str
    supabase_key: str
    supabase_history_table: str
    supabase_storage_bucket: str
    supabase_storage_prefix: str
    cors_origins: list[str]
    cors_origin_regex: str
    history_file_path: str
    max_scan_files: int
    max_file_size_bytes: int


def get_settings() -> Settings:
    return Settings(
        gemini_api_key=os.getenv("GEMINI_API_KEY", "").strip(),
        gemini_model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash").strip() or "gemini-2.5-flash",
        supabase_url=os.getenv("SUPABASE_URL", "").strip(),
        supabase_key=os.getenv("SUPABASE_KEY", "").strip(),
        supabase_history_table=os.getenv("SUPABASE_HISTORY_TABLE", "scan_history").strip() or "scan_history",
        supabase_storage_bucket=os.getenv("SUPABASE_STORAGE_BUCKET", "scan-artifacts").strip() or "scan-artifacts",
        supabase_storage_prefix=os.getenv("SUPABASE_STORAGE_PREFIX", "audits").strip().strip("/") or "audits",
        cors_origins=_parse_csv(
            os.getenv("ECOSCAN_CORS_ORIGINS"),
            ["http://localhost:3000", "http://127.0.0.1:3000"],
        ),
        cors_origin_regex=_clean_regex(
            os.getenv(
                "ECOSCAN_CORS_ORIGIN_REGEX",
                r"^https?://(?:localhost|127\.0\.0\.1|0\.0\.0\.0|192\.168\.\d{1,3}\.\d{1,3})(?::\d+)?$",
            )
        ),
        history_file_path=os.getenv(
            "ECOSCAN_HISTORY_FILE",
            str(BACKEND_ROOT / "data" / "scan_history.json"),
        ),
        max_scan_files=_parse_int("ECOSCAN_MAX_SCAN_FILES", 500, minimum=1),
        max_file_size_bytes=_parse_int("ECOSCAN_MAX_FILE_SIZE_BYTES", 200_000, minimum=1),
    )
