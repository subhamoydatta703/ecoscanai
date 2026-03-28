# EcoScan AI

EcoScan AI is a full-stack repository auditing platform for analyzing codebases through the lens of structural efficiency and sustainable engineering. It scans local folders or remote Git repositories, detects anomalous or resource-intensive code patterns, and presents AI-assisted optimization suggestions through a modern web dashboard.

Author: Subhamoy Datta

## What It Does

- Scans source files across a repository and extracts structural metrics.
- Detects anomalous or energy-hungry files with heuristic analysis plus `IsolationForest`.
- Generates AI-assisted refactoring suggestions for the top anomaly candidates.
- Persists scan history for Reports and Green Patterns views.
- Supports both local project paths and remote `http(s)` Git repository URLs.

## Project Layout

- `backend/`: FastAPI API, repository access, scanning engine, anomaly detection, persistence, and AI suggestion pipeline.
- `frontend/`: Next.js dashboard for audits, reports, and pattern insights.

## Prerequisites

- Python 3.11+
- Node.js 18+
- npm

## Backend Setup

```powershell
cd backend
copy .env.example .env
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## Frontend Setup

```powershell
cd frontend
copy .env.example .env.local
npm install
npm run dev
```

## Environment Variables

### Backend

- `GEMINI_API_KEY`: Google Gemini API key used for AI refactoring suggestions.
- `GEMINI_MODEL`: Optional Gemini model override.
- `ECOSCAN_CORS_ORIGINS`: Comma-separated allowed frontend origins.
- `ECOSCAN_CORS_ORIGIN_REGEX`: Regex for additional dev origins such as LAN IPs.
- `ECOSCAN_MAX_SCAN_FILES`: Maximum files scanned per audit.
- `ECOSCAN_MAX_FILE_SIZE_BYTES`: Maximum file size read during scanning.

### Frontend

- `NEXT_PUBLIC_API_BASE_URL`: Backend API base URL. Defaults to `http://localhost:8000/api`.

## Running Checks

Backend:

```powershell
cd backend
.\venv\Scripts\python.exe -m unittest discover tests
```

Frontend:

```powershell
cd frontend
npm run lint
```

## Repository Notes

- Runtime artifacts such as `venv`, `node_modules`, `.next`, test temp directories, and Python bytecode should stay untracked.
- `backend/.env` and `frontend/.env.local` are local-only files and should not be committed.
- Scan history is runtime data and should not be treated as committed source of truth.

## Summary

EcoScan AI is designed to make repository auditing more actionable by combining structural analysis, anomaly detection, persistent reporting, and AI-assisted remediation in a single workflow. The project is organized as a practical full-stack code intelligence tool, with a FastAPI backend and a Next.js frontend working together to support repeatable engineering reviews.
