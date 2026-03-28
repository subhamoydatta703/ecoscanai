import os
import shutil
import tempfile
import git
import uuid
from urllib.parse import urlparse

class RepoManager:
    def __init__(self, base_dir=None):
        if base_dir is None:
            self.base_dir = os.path.join(tempfile.gettempdir(), "ecoscanai_repos")
        else:
            self.base_dir = base_dir
            
        os.makedirs(self.base_dir, exist_ok=True)
            
    def clone_repo(self, repo_url: str) -> str:
        """Clones a repository into a temporary directory and returns the path."""
        parsed = urlparse(repo_url)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("Only http(s) repository URLs are supported.")

        repo_name = repo_url.rstrip('/').split('/')[-1]
        if repo_name.endswith('.git'):
            repo_name = repo_name[:-4]
            
        repo_id = str(uuid.uuid4())
        target_dir = os.path.join(self.base_dir, f"{repo_name}_{repo_id}")
        
        print(f"Cloning {repo_url} into {target_dir}...")
        try:
            git.Repo.clone_from(
                repo_url,
                target_dir,
                depth=1,
                multi_options=["--filter=blob:none"],
                env={**os.environ, "GIT_TERMINAL_PROMPT": "0"},
            )
            print("Cloning complete.")
            return target_dir
        except Exception as e:
            print(f"Error cloning repository: {e}")
            raise

    def cleanup(self, path: str):
        """Removes the cloned repository directory."""
        if os.path.exists(path) and path.startswith(self.base_dir):
            try:
                shutil.rmtree(path)
                print(f"Cleaned up {path}")
            except Exception as e:
                print(f"Error cleaning up {path}: {e}")

repo_manager = RepoManager()
