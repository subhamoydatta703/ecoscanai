import io
import logging
import os
import shutil
import tarfile
import tempfile
import uuid
import zipfile
from urllib.parse import urlparse
from urllib.request import Request, urlopen

try:
    import git
except Exception:  # pragma: no cover - optional dependency in some runtimes
    git = None

logger = logging.getLogger(__name__)


def _github_archive_url(repo_url: str) -> str | None:
    """Convert a GitHub repo URL into an archive download URL."""
    parsed = urlparse(repo_url)
    if parsed.netloc not in {"github.com", "www.github.com"}:
        return None

    path_parts = parsed.path.strip("/").replace(".git", "").split("/")
    if len(path_parts) < 2:
        return None

    owner, repo = path_parts[0], path_parts[1]
    return f"https://api.github.com/repos/{owner}/{repo}/tarball"


def _download_archive(repo_url: str, target_dir: str) -> str:
    """Download and extract a repository archive without requiring git.

    Supports GitHub repos via the API tarball endpoint. Falls back to
    appending ``/archive/refs/heads/main.zip`` for generic hosts.
    """
    archive_url = _github_archive_url(repo_url)
    is_tarball = True

    if archive_url is None:
        # Generic fallback: try the GitHub-style /archive/main.zip URL
        clean = repo_url.rstrip("/").removesuffix(".git")
        archive_url = f"{clean}/archive/refs/heads/main.zip"
        is_tarball = False

    logger.info("Downloading archive from %s", archive_url)
    request = Request(archive_url, headers={"User-Agent": "EcoScanAI/1.0"})
    response = urlopen(request, timeout=45)  # noqa: S310 - URL validated above
    data = response.read()

    os.makedirs(target_dir, exist_ok=True)

    if is_tarball:
        with tarfile.open(fileobj=io.BytesIO(data), mode="r:gz") as tar:
            members = tar.getmembers()
            if not members:
                raise RuntimeError("Archive is empty.")
            # GitHub tarballs wrap everything in a single top-level directory
            prefix = members[0].name.split("/")[0] + "/"
            for member in members:
                if member.name.startswith(prefix):
                    member.name = member.name[len(prefix):]
                if member.name in {"", "."}:
                    continue
                tar.extract(member, target_dir, filter="data")
    else:
        with zipfile.ZipFile(io.BytesIO(data)) as zf:
            names = zf.namelist()
            if not names:
                raise RuntimeError("Archive is empty.")
            prefix = names[0].split("/")[0] + "/"
            for name in names:
                if name.startswith(prefix):
                    relative = name[len(prefix):]
                else:
                    relative = name
                if not relative or relative.endswith("/"):
                    continue
                dest = os.path.join(target_dir, relative)
                os.makedirs(os.path.dirname(dest), exist_ok=True)
                with zf.open(name) as src, open(dest, "wb") as dst:
                    dst.write(src.read())

    return target_dir


class RepoManager:
    def __init__(self, base_dir=None):
        if base_dir is None:
            self.base_dir = os.path.join(tempfile.gettempdir(), "ecoscanai_repos")
        else:
            self.base_dir = base_dir

        os.makedirs(self.base_dir, exist_ok=True)

    def clone_repo(self, repo_url: str) -> str:
        """Clones or downloads a repository into a temporary directory and returns the path."""
        parsed = urlparse(repo_url)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("Only http(s) repository URLs are supported.")

        repo_name = repo_url.rstrip('/').split('/')[-1]
        if repo_name.endswith('.git'):
            repo_name = repo_name[:-4]

        repo_id = str(uuid.uuid4())
        target_dir = os.path.join(self.base_dir, f"{repo_name}_{repo_id}")

        # Try git clone first, fall back to archive download
        if git is not None:
            logger.info("Cloning %s into %s via git", repo_url, target_dir)
            try:
                git.Repo.clone_from(
                    repo_url,
                    target_dir,
                    depth=1,
                    multi_options=["--filter=blob:none"],
                    env={**os.environ, "GIT_TERMINAL_PROMPT": "0"},
                )
                logger.info("Git clone complete.")
                return target_dir
            except Exception as git_error:
                logger.warning("Git clone failed, falling back to archive download: %s", git_error)
                # Clean up any partial clone
                if os.path.exists(target_dir):
                    shutil.rmtree(target_dir, ignore_errors=True)

        # Fallback: download as archive (works on Vercel and other serverless runtimes)
        logger.info("Downloading %s as archive into %s", repo_url, target_dir)
        try:
            return _download_archive(repo_url, target_dir)
        except Exception as archive_error:
            logger.error("Archive download also failed: %s", archive_error)
            raise RuntimeError(
                f"Could not obtain repository. Git clone failed and archive download "
                f"failed: {archive_error}"
            ) from archive_error

    def cleanup(self, path: str):
        """Removes the cloned repository directory."""
        if os.path.exists(path) and path.startswith(self.base_dir):
            try:
                shutil.rmtree(path)
                logger.info("Cleaned up %s", path)
            except Exception as e:
                logger.warning("Error cleaning up %s: %s", path, e)

repo_manager = RepoManager()
