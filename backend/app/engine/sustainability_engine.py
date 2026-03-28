import os
from typing import Dict, Any
import logging
import time

from app.core.history_store import record_scan_result
from app.data.green_patterns import match_patterns
from app.core.repo_manager import repo_manager
from app.engine.scanner import CodeScanner
from app.engine.ml_engine import MLEngine
from app.engine.ai_engine import AIEngine

logger = logging.getLogger(__name__)

class SustainabilityEngine:
    def __init__(self):
        self.scanner = CodeScanner()
        self.ml_engine = MLEngine()
        self.ai_engine = AIEngine()

    async def audit_repository(self, repo_url_or_path: str, is_local=False) -> Dict[str, Any]:
        """
        Main orchestration method:
        1. Clone/access repo
        2. Scan for metrics
        3. Detect anomalies via ML
        4. Generate AI refactoring for top anomalies
        5. Aggregate and return score
        """
        target_dir = repo_url_or_path
        cleanup_needed = False
        
        try:
            if not is_local:
                target_dir = repo_manager.clone_repo(repo_url_or_path)
                cleanup_needed = True

            logger.info("Scanning directory", extra={"target_dir": target_dir})

            scan_start = time.perf_counter()
            metrics = self.scanner.scan_directory(target_dir)
            scan_duration = time.perf_counter() - scan_start
            logger.info("Repository scan completed", extra={"files_scanned": len(metrics), "duration_seconds": round(scan_duration, 3)})

            ml_start = time.perf_counter()
            analyzed_metrics = self.ml_engine.detect_anomalies(metrics)
            ml_duration = time.perf_counter() - ml_start
            logger.info("Anomaly detection completed", extra={"duration_seconds": round(ml_duration, 3)})

            flagged_files = [m for m in analyzed_metrics if m.get('is_anomaly')]
            flagged_files.sort(key=lambda x: x.get('anomaly_score', 0), reverse=True)

            top_anomalies = flagged_files[:3]
            ai_start = time.perf_counter()
            for file_data in top_anomalies:
                file_data['matched_patterns'] = match_patterns(file_data)
                abs_path = file_data['absolute_path']
                file_data['original_code'] = ""
                file_data['optimized_code'] = ""
                file_data['carbon_saving_ratio'] = "Unavailable"
                file_data['ai_explanation'] = "Source file could not be loaded for AI optimization."

                if not os.path.exists(abs_path):
                    logger.warning("Flagged file no longer exists during AI step", extra={"file_path": file_data['file_path']})
                    continue

                try:
                    with open(abs_path, 'r', encoding='utf-8', errors='ignore') as f:
                        original_code = f.read()
                except OSError as read_error:
                    logger.warning(
                        "Unable to read flagged file during AI step",
                        extra={"file_path": file_data['file_path'], "error": str(read_error)},
                    )
                    file_data['ai_explanation'] = f"Source file could not be read for AI optimization: {read_error}"
                    continue

                file_data['original_code'] = original_code
                logger.info("Generating green code suggestion", extra={"file_path": file_data['file_path']})
                ai_suggestion = self.ai_engine.generate_green_code(
                    original_code,
                    file_data.get('anomaly_reasons', [])
                )

                file_data['optimized_code'] = ai_suggestion['optimized_code']
                file_data['carbon_saving_ratio'] = ai_suggestion['carbon_saving_ratio']
                file_data['ai_explanation'] = ai_suggestion['explanation']
            ai_duration = time.perf_counter() - ai_start
            logger.info(
                "AI suggestion phase completed",
                extra={"files_processed": len(top_anomalies), "duration_seconds": round(ai_duration, 3)}
            )

            total_files = len(analyzed_metrics)
            anomalous_files = len(flagged_files)

            if total_files > 0:
                health_score = max(0, 100 - int((anomalous_files / total_files) * 100))
            else:
                 health_score = 100
                 
            result = {
                 "status": "success",
                 "repository": repo_url_or_path,
                 "health_score": health_score,
                 "total_files_scanned": total_files,
                 "anomalies_found": anomalous_files,
                 "flagged_files": top_anomalies,
                 "timings": {
                     "scan_seconds": round(scan_duration, 3),
                     "ml_seconds": round(ml_duration, 3),
                     "ai_seconds": round(ai_duration, 3),
                 },
            }
            record_scan_result(result)
            return result

        except Exception as e:
            logger.exception("Audit failed")
            return {
                "status": "error",
                "message": str(e)
            }
        finally:
            if cleanup_needed and target_dir:
                repo_manager.cleanup(target_dir)

sustainability_engine = SustainabilityEngine()
