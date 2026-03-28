from typing import Any
from collections import Counter, defaultdict


PATTERN_LIBRARY: list[dict[str, Any]] = [
    {
        "id": "async-io",
        "title": "Asynchronous I/O Operations",
        "icon": "Zap",
        "description": "Replace blocking network and disk calls with asynchronous equivalents to reduce idle CPU time.",
        "impact": "High",
        "category": "I/O",
        "match_notes": [
            "High number of API calls",
            "Synchronous request-heavy code paths",
        ],
    },
    {
        "id": "generator-streaming",
        "title": "Generator Over List Comprehension",
        "icon": "TreePine",
        "description": "Use generators and streaming iteration for large data flows to reduce memory pressure.",
        "impact": "Medium",
        "category": "Memory",
        "match_notes": [
            "Excessively large file",
            "Memory-heavy transformations",
        ],
    },
    {
        "id": "algorithm-big-o",
        "title": "Algorithm Big-O Reduction",
        "icon": "RefreshCw",
        "description": "Refactor nested loops and repeated lookups into indexed or linear-time operations wherever possible.",
        "impact": "Critical",
        "category": "Complexity",
        "match_notes": [
            "Deeply nested loops detected",
            "Structural complexity anomaly",
        ],
    },
]

IMPACT_WEIGHTS = {
    "Critical": 3,
    "High": 2,
    "Medium": 1,
}


def get_pattern_library(history_entries: list[dict[str, Any]] | None = None) -> list[dict[str, Any]]:
    usage: Counter[str] = Counter()
    repositories_seen: dict[str, set[str]] = defaultdict(set)
    last_seen_at: dict[str, str] = {}

    for entry in history_entries or []:
        repository_label = entry.get("repository_label") or entry.get("repository", "")
        scanned_at = entry.get("scanned_at", "")
        for pattern_id, count in entry.get("pattern_counts", {}).items():
            usage[pattern_id] += count
            if repository_label:
                repositories_seen[pattern_id].add(repository_label)
            if scanned_at:
                previous = last_seen_at.get(pattern_id)
                last_seen_at[pattern_id] = max(previous, scanned_at) if previous else scanned_at

    enriched_patterns: list[dict[str, Any]] = []
    for pattern in PATTERN_LIBRARY:
        enriched_patterns.append(
            {
                **pattern,
                "times_recommended": usage.get(pattern["id"], 0),
                "repositories_seen": len(repositories_seen.get(pattern["id"], set())),
                "last_seen_at": last_seen_at.get(pattern["id"]),
            }
        )
    return enriched_patterns


def match_patterns(file_metric: dict[str, Any]) -> list[dict[str, Any]]:
    matches: list[dict[str, Any]] = []

    if file_metric.get("sync_api_calls", 0) > 0:
        matches.append(PATTERN_LIBRARY[0])

    if file_metric.get("file_size", 0) > 50_000:
        matches.append(PATTERN_LIBRARY[1])

    if file_metric.get("loop_depth", 0) > 1 or file_metric.get("computational_complexity", 0) > 20:
        matches.append(PATTERN_LIBRARY[2])

    if not matches and file_metric.get("is_anomaly"):
        matches.append(PATTERN_LIBRARY[2])

    seen: set[str] = set()
    unique_matches: list[dict[str, Any]] = []
    for pattern in matches:
        if pattern["id"] in seen:
            continue
        seen.add(pattern["id"])
        unique_matches.append(pattern)

    return unique_matches
