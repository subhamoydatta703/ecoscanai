import json
import logging
from datetime import datetime, timezone
from functools import lru_cache
from typing import Any
from uuid import uuid4

from app.core.settings import get_settings

try:
    from supabase import Client, create_client
except Exception:  # pragma: no cover - exercised by fallback behavior
    Client = Any  # type: ignore[assignment]
    create_client = None

logger = logging.getLogger(__name__)


def is_supabase_configured() -> bool:
    settings = get_settings()
    return bool(settings.supabase_url and settings.supabase_key and create_client is not None)


@lru_cache(maxsize=1)
def get_supabase_client() -> Client | None:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_key or create_client is None:
        return None
    return create_client(settings.supabase_url, settings.supabase_key)


def _normalize_scanned_at(value: str | None) -> str:
    if not value:
        return datetime.now(timezone.utc).isoformat()
    return value


def _sanitize_history_entry(entry: dict[str, Any]) -> dict[str, Any]:
    return {
        "repository": entry.get("repository", ""),
        "repository_label": entry.get("repository_label", ""),
        "health_score": int(entry.get("health_score", 0) or 0),
        "total_files_scanned": int(entry.get("total_files_scanned", 0) or 0),
        "anomalies_found": int(entry.get("anomalies_found", 0) or 0),
        "critical_patterns_detected": int(entry.get("critical_patterns_detected", 0) or 0),
        "pattern_counts": entry.get("pattern_counts", {}) or {},
        "artifact_path": entry.get("artifact_path"),
        "storage_bucket": entry.get("storage_bucket"),
        "scanned_at": _normalize_scanned_at(entry.get("scanned_at")),
    }


def _bucket_exists(client: Client, bucket_name: str) -> bool:
    try:
        client.storage.get_bucket(bucket_name)
        return True
    except Exception:
        return False


def ensure_storage_bucket() -> bool:
    client = get_supabase_client()
    if client is None:
        return False

    settings = get_settings()
    if _bucket_exists(client, settings.supabase_storage_bucket):
        return True

    try:
        client.storage.create_bucket(
            settings.supabase_storage_bucket,
            options={"public": False, "file_size_limit": "5242880", "allowed_mime_types": ["application/json"]},
        )
        return True
    except Exception as exc:  # pragma: no cover - depends on external Supabase state
        logger.warning("Unable to create Supabase storage bucket: %s", exc)
        return False


def upload_scan_artifact(scan_result: dict[str, Any]) -> dict[str, str] | None:
    client = get_supabase_client()
    if client is None or not ensure_storage_bucket():
        return None

    settings = get_settings()
    repository_label = str(scan_result.get("repository", "audit")).rstrip("/").split("/")[-1] or "audit"
    safe_repository = "".join(character if character.isalnum() or character in {"-", "_"} else "-" for character in repository_label).strip("-") or "audit"
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    object_path = f"{settings.supabase_storage_prefix}/{timestamp}-{safe_repository}-{uuid4().hex}.json"
    payload = json.dumps(scan_result, ensure_ascii=True, indent=2).encode("utf-8")

    try:
        client.storage.from_(settings.supabase_storage_bucket).upload(
            object_path,
            payload,
            file_options={"content-type": "application/json", "x-upsert": "false"},
        )
        return {
            "storage_bucket": settings.supabase_storage_bucket,
            "artifact_path": object_path,
        }
    except Exception as exc:  # pragma: no cover - depends on external Supabase availability
        logger.warning("Unable to upload scan artifact to Supabase Storage: %s", exc)
        return None


class SupabaseHistoryStore:
    def __init__(self) -> None:
        self._settings = get_settings()
        self._client = get_supabase_client()
        if self._client is None:
            raise RuntimeError("Supabase is not configured.")

    def load(self) -> list[dict[str, Any]]:
        response = self._client.table(self._settings.supabase_history_table).select("*").execute()
        rows = response.data or []
        normalized = []
        for row in rows:
            cleaned = dict(row)
            cleaned.pop("id", None)
            if isinstance(cleaned.get("scanned_at"), datetime):
                cleaned["scanned_at"] = cleaned["scanned_at"].astimezone(timezone.utc).isoformat()
            normalized.append(_sanitize_history_entry(cleaned))
        normalized.sort(key=lambda entry: entry.get("scanned_at", ""))
        return normalized

    def save(self, entries: list[dict[str, Any]]) -> None:
        self.reset()
        if entries:
            self._client.table(self._settings.supabase_history_table).insert(
                [_sanitize_history_entry(entry) for entry in entries]
            ).execute()

    def append(self, entry: dict[str, Any]) -> None:
        self._client.table(self._settings.supabase_history_table).insert(_sanitize_history_entry(entry)).execute()

    def reset(self) -> dict[str, int]:
        rows = self._client.table(self._settings.supabase_history_table).select("id,artifact_path").execute().data or []
        if not rows:
            return {"cleared_entries": 0}

        artifact_paths = [row.get("artifact_path") for row in rows if row.get("artifact_path")]
        if artifact_paths:
            try:
                self._client.storage.from_(self._settings.supabase_storage_bucket).remove(artifact_paths)
            except Exception as exc:  # pragma: no cover - depends on external Supabase availability
                logger.warning("Unable to delete Supabase storage artifacts during reset: %s", exc)

        ids = [row["id"] for row in rows if row.get("id")]
        if ids:
            self._client.table(self._settings.supabase_history_table).delete().in_("id", ids).execute()

        return {"cleared_entries": len(rows)}
