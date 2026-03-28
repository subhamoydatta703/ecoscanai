import traceback

from fastapi import FastAPI

try:
    from main import app as main_app
    app = main_app
except Exception as exc:  # pragma: no cover - only used for deployment diagnostics
    startup_error = {
        "status": "error",
        "message": "Backend startup failed during import.",
        "error_type": exc.__class__.__name__,
        "detail": str(exc),
        "traceback": traceback.format_exc().splitlines(),
    }

    app = FastAPI(title="EcoScan AI Backend Startup Error")

    @app.get("/")
    async def startup_failure_root():
        return startup_error

    @app.get("/api/reports")
    async def startup_failure_reports():
        return startup_error
