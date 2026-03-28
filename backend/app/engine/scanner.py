import os
import ast
from app.core.settings import get_settings

class CodeScanner:
    def __init__(self):
        self.ignore_dirs = {'.git', 'node_modules', 'venv', '__pycache__', '.next', 'build', 'dist'}
        self.supported_exts = {
            '.py', '.js', '.ts', '.jsx', '.tsx', 
            '.java', '.c', '.cpp', '.cs', '.go', '.rb', '.php', '.swift', '.kt', '.rs', '.html'
        }
        settings = get_settings()
        self.max_scan_files = settings.max_scan_files
        self.max_file_size_bytes = settings.max_file_size_bytes

    def scan_directory(self, dir_path: str) -> list[dict]:
        """Recursively walks the directory and extracts metrics from supported files."""
        file_metrics = []
        for root, dirs, files in os.walk(dir_path):
            dirs[:] = [d for d in dirs if d not in self.ignore_dirs]
            
            for file in files:
                if len(file_metrics) >= self.max_scan_files:
                    return file_metrics

                ext = os.path.splitext(file)[1]
                if ext in self.supported_exts:
                    file_path = os.path.join(root, file)
                    if self._should_skip_file(file_path):
                        continue
                    metrics = self.analyze_file(file_path, ext)
                    if metrics:
                        rel_path = os.path.relpath(file_path, dir_path)
                        metrics['file_path'] = rel_path
                        metrics['absolute_path'] = file_path
                        file_metrics.append(metrics)
                        
        return file_metrics

    def _should_skip_file(self, file_path: str) -> bool:
        try:
            if os.path.getsize(file_path) > self.max_file_size_bytes:
                return True

            with open(file_path, 'rb') as f:
                sample = f.read(1024)
            return b'\x00' in sample
        except OSError:
            return True

    def analyze_file(self, file_path: str, ext: str) -> dict:
        """Analyzes a single file and extracts efficiency metrics."""
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
            metrics = {
                'file_size': len(content),
                'lines_of_code': len(content.splitlines()),
                'loop_depth': 0,
                'sync_api_calls': 0,
                'computational_complexity': 0
            }
            
            if ext == '.py':
                try:
                    tree = ast.parse(content)
                    metrics.update(self._analyze_python_ast(tree))
                except SyntaxError:
                    pass
                    
            else:
                metrics.update(self._analyze_generic_heuristics(content))
                
            return metrics
            
        except Exception as e:
            print(f"Error reading file {file_path}: {e}")
            return None

    def _analyze_python_ast(self, tree: ast.AST) -> dict:
        loop_depth = 0
        sync_api_calls = 0
        complexity = 0
        
        class MetricVisitor(ast.NodeVisitor):
            def __init__(self):
                self.current_depth = 0
                self.max_depth = 0
                self.api_calls = 0
                self.complexity = 0
                
            def visit_For(self, node):
                self.current_depth += 1
                self.max_depth = max(self.max_depth, self.current_depth)
                self.complexity += 2
                self.generic_visit(node)
                self.current_depth -= 1
                
            def visit_While(self, node):
                self.current_depth += 1
                self.max_depth = max(self.max_depth, self.current_depth)
                self.complexity += 2
                self.generic_visit(node)
                self.current_depth -= 1
                
            def visit_Call(self, node):
                if isinstance(node.func, ast.Name):
                    if node.func.id in ['requests', 'get', 'post', 'urlopen']:
                        self.api_calls += 1
                elif isinstance(node.func, ast.Attribute):
                    if node.func.attr in ['get', 'post', 'request']:
                        self.api_calls += 1
                self.complexity += 1
                self.generic_visit(node)

        visitor = MetricVisitor()
        visitor.visit(tree)
        
        return {
            'loop_depth': visitor.max_depth,
            'sync_api_calls': visitor.api_calls,
            'computational_complexity': visitor.complexity
        }

    def _analyze_generic_heuristics(self, content: str) -> dict:
        loops = content.count('for (') + content.count('while (') + content.count('forEach(') + content.count('for ') + content.count('while ')
        api_calls = content.count('fetch(') + content.count('axios.') + content.count('XMLHttpRequest') + content.count('http.') + content.count('requests.')
        
        depth = 1 if loops > 0 else 0
        if content.count('for (') > content.count('}'):
             depth = 2 if loops > 3 else 1
        
        return {
            'loop_depth': depth,
            'sync_api_calls': api_calls,
            'computational_complexity': loops * 2 + api_calls
        }
