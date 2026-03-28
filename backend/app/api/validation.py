from pathlib import Path
from urllib.parse import urlparse


def validate_scan_target(url: str, is_local: bool) -> str | None:
    target = url.strip()
    if not target:
        return "Repository URL or local path is required."

    if is_local:
        candidate = Path(target).expanduser()
        if not candidate.exists():
            return "Local path does not exist."
        if not candidate.is_dir():
            return "Local path must point to a directory."
        return None

    parsed = urlparse(target)
    if parsed.scheme not in {"http", "https"}:
        return "Remote repository URL must start with http:// or https://."
    if not parsed.netloc:
        return "Remote repository URL is invalid."
    return None
