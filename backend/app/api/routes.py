import logging

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.api.validation import validate_scan_target

router = APIRouter()
logger = logging.getLogger(__name__)

class ScanRequest(BaseModel):
    url: str
    is_local: Optional[bool] = False

@router.post("/scan")
async def scan_repository(request: ScanRequest):
    """
    Endpoint to trigger a full repository scan.
    """
    validation_error = validate_scan_target(request.url, bool(request.is_local))
    if validation_error:
        raise HTTPException(status_code=400, detail=validation_error)

    logger.info("Starting repository scan", extra={"target": request.url, "is_local": request.is_local})
    from app.engine.sustainability_engine import get_sustainability_engine

    result = await get_sustainability_engine().audit_repository(request.url, request.is_local)
    if result.get("status") == "error":
        logger.error("Repository scan failed", extra={"target": request.url, "message": result.get("message", "")})
    return result

@router.get("/reports")
async def get_reports():
    """
    Endpoint to fetch historical sustainability reports.
    """
    from app.core.history_store import build_reports_summary

    return build_reports_summary()

@router.get("/patterns")
async def get_patterns():
    """
    Endpoint to fetch the Green Coding Patterns Library.
    """
    from app.core.history_store import load_scan_history
    from app.core.settings import get_settings
    from app.data.green_patterns import get_pattern_library

    history = load_scan_history()
    return {
        "history_enabled": get_settings().persist_history,
        "patterns": get_pattern_library(history)
    }


@router.post("/history/reset")
async def reset_history():
    """
    Clears stored audit history used by Reports and Green Patterns.
    """
    from app.core.history_store import reset_scan_history

    result = reset_scan_history()
    logger.info("Audit history reset", extra=result)
    return {
        "status": "success",
        **result,
    }
