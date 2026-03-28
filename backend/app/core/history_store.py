import json
import logging
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
import tempfile
from typing import Any

from app.core.settings import get_settings
from app.core.supabase_store import SupabaseHistoryStore, is_supabase_configured, upload_scan_artifact
from app.data.green_patterns import get_pattern_library

logger = logging.getLogger(__name__)


def _history_enabled() -> bool:
    return get_settings().persist_history


class FileHistoryStore:
    def __init__(self, history_file_path: str) -> None:
        self._history_file = Path(history_file_path)

    def _ensure_history_file(self) -> Path:
        try:
            self._history_file.parent.mkdir(parents=True, exist_ok=True)
            if not self._history_file.exists():
                self._history_file.write_text("[]", encoding="utf-8")
            return self._history_file
        except OSError as exc:
            logger.warning("Configured history file is not writable, falling back to temp storage: %s", exc)
            fallback = Path(tempfile.gettempdir()) / "ecoscanai_scan_history.json"
            fallback.parent.mkdir(parents=True, exist_ok=True)
            if not fallback.exists():
                fallback.write_text("[]", encoding="utf-8")
            self._history_file = fallback
            return self._history_file

    def load(self) -> list[dict[str, Any]]:
        history_file = self._ensure_history_file()
        try:
            return json.loads(history_file.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            history_file.write_text("[]", encoding="utf-8")
            return []

    def save(self, entries: list[dict[str, Any]]) -> None:
        history_file = self._ensure_history_file()
        history_file.write_text(json.dumps(entries, indent=2), encoding="utf-8")

    def append(self, entry: dict[str, Any]) -> None:
        history = self.load()
        history.append(entry)
        self.save(history)

    def reset(self) -> dict[str, int]:
        cleared_entries = len(self.load())
        self.save([])
        return {"cleared_entries": cleared_entries}


def _history_store():
    settings = get_settings()
    if is_supabase_configured():
        try:
            return SupabaseHistoryStore()
        except Exception as exc:  # pragma: no cover - depends on external Supabase availability
            logger.warning("Supabase history unavailable, falling back to local file storage: %s", exc)
    return FileHistoryStore(settings.history_file_path)


def _temp_history_store() -> FileHistoryStore:
    return FileHistoryStore(str(Path(tempfile.gettempdir()) / "ecoscanai_scan_history.json"))


def load_scan_history() -> list[dict[str, Any]]:
    if not _history_enabled():
        return []

    store = _history_store()
    try:
        return store.load()
    except Exception as exc:
        logger.warning("History load failed, falling back to temp file storage: %s", exc)
        return _temp_history_store().load()


def save_scan_history(entries: list[dict[str, Any]]) -> None:
    if not _history_enabled():
        return

    store = _history_store()
    try:
        store.save(entries)
    except Exception as exc:
        logger.warning("History save failed, falling back to temp file storage: %s", exc)
        _temp_history_store().save(entries)


def append_scan_history(entry: dict[str, Any]) -> None:
    if not _history_enabled():
        return

    store = _history_store()
    try:
        store.append(entry)
    except Exception as exc:
        logger.warning("History append failed, falling back to temp file storage: %s", exc)
        _temp_history_store().append(entry)


def reset_scan_history() -> dict[str, int]:
    if not _history_enabled():
        return {"cleared_entries": 0}

    store = _history_store()
    try:
        return store.reset()
    except Exception as exc:
        logger.warning("History reset failed, falling back to temp file storage: %s", exc)
        return _temp_history_store().reset()


def build_reports_summary() -> dict[str, Any]:
    if not _history_enabled():
        return {
            "history_enabled": False,
            "total_scans": 0,
            "repositories_scanned": 0,
            "average_health_score": 0,
            "latest_health_score": 0,
            "health_delta": "0",
            "total_files_scanned": 0,
            "total_anomalies_found": 0,
            "critical_patterns_detected": 0,
            "chart_status": "History is disabled in one-time audit mode.",
            "history": [],
            "recent_scans": [],
            "pattern_usage": [],
        }

    history = load_scan_history()

    if not history:
        return {
            "history_enabled": True,
            "total_scans": 0,
            "repositories_scanned": 0,
            "average_health_score": 0,
            "latest_health_score": 0,
            "health_delta": "0",
            "total_files_scanned": 0,
            "total_anomalies_found": 0,
            "critical_patterns_detected": 0,
            "chart_status": "No scans yet. Run your first audit to populate the report.",
            "history": [],
            "recent_scans": [],
            "pattern_usage": [],
        }

    total_scans = len(history)
    total_files_scanned = sum(entry.get("total_files_scanned", 0) for entry in history)
    total_anomalies_found = sum(entry.get("anomalies_found", 0) for entry in history)
    total_critical = sum(
        entry.get("critical_patterns_detected", 0)
        or entry.get("critical_patterns_fixed", 0)
        for entry in history
    )
    repositories_scanned = len({entry.get("repository") for entry in history if entry.get("repository")})
    avg_health = sum(entry.get("health_score", 0) for entry in history) / len(history)
    average_health_score = int(round(avg_health))

    latest_health = history[-1].get("health_score", 0)
    previous_health = history[-2].get("health_score", latest_health) if len(history) > 1 else latest_health
    health_delta = latest_health - previous_health

    pattern_usage: Counter[str] = Counter()
    for entry in history:
        pattern_usage.update(entry.get("pattern_counts", {}))

    timeline = [
        {
            "label": entry.get("repository_label", "Scan"),
            "health_score": entry.get("health_score", 0),
            "anomalies_found": entry.get("anomalies_found", 0),
            "total_files_scanned": entry.get("total_files_scanned", 0),
            "scanned_at": entry.get("scanned_at"),
        }
        for entry in history[-8:]
    ]

    recent_scans = [
        {
            "repository": entry.get("repository", ""),
            "repository_label": entry.get("repository_label", "Scan"),
            "health_score": entry.get("health_score", 0),
            "total_files_scanned": entry.get("total_files_scanned", 0),
            "anomalies_found": entry.get("anomalies_found", 0),
            "critical_patterns_detected": entry.get("critical_patterns_detected", entry.get("critical_patterns_fixed", 0)),
            "pattern_counts": entry.get("pattern_counts", {}),
            "scanned_at": entry.get("scanned_at"),
        }
        for entry in reversed(history[-5:])
    ]
    enriched_patterns = [
        pattern for pattern in get_pattern_library(history)
        if pattern.get("times_recommended", 0) > 0
    ]
    enriched_patterns.sort(key=lambda pattern: pattern["times_recommended"], reverse=True)

    return {
        "history_enabled": True,
        "total_scans": total_scans,
        "repositories_scanned": repositories_scanned,
        "average_health_score": average_health_score,
        "latest_health_score": latest_health,
        "health_delta": f"{health_delta:+d}",
        "total_files_scanned": total_files_scanned,
        "total_anomalies_found": total_anomalies_found,
        "critical_patterns_detected": total_critical,
        "chart_status": "Health score over recent audits",
        "history": timeline,
        "recent_scans": recent_scans,
        "pattern_usage": enriched_patterns,
    }


def make_scan_history_entry(result: dict[str, Any]) -> dict[str, Any]:
    repository = result.get("repository", "")
    flagged_files = result.get("flagged_files", [])
    pattern_counts: Counter[str] = Counter()

    for file_data in flagged_files:
        for pattern in file_data.get("matched_patterns", []):
            pattern_counts[pattern["id"]] += 1

    critical_patterns_detected = sum(
        count for pattern_id, count in pattern_counts.items() if pattern_id == "algorithm-big-o"
    )

    repository_label = repository.rstrip("/").split("/")[-1] or repository

    return {
        "repository": repository,
        "repository_label": repository_label,
        "health_score": result.get("health_score", 0),
        "total_files_scanned": result.get("total_files_scanned", 0),
        "anomalies_found": result.get("anomalies_found", 0),
        "critical_patterns_detected": critical_patterns_detected,
        "pattern_counts": dict(pattern_counts),
        "scanned_at": datetime.now(timezone.utc).isoformat(),
    }


def record_scan_result(result: dict[str, Any]) -> dict[str, Any]:
    entry = make_scan_history_entry(result)
    if not _history_enabled():
        return entry

    artifact_reference = upload_scan_artifact(result)
    if artifact_reference:
        entry.update(artifact_reference)
    append_scan_history(entry)
    return entry
