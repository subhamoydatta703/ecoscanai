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

## Deploying to Vercel

This repository is structured to deploy cleanly as two Vercel projects from the same Git repository:

- `frontend/` as the Next.js dashboard
- `backend/` as the FastAPI API

### Frontend Project

1. Import the repository into Vercel.
2. Set the Root Directory to `frontend`.
3. Add the environment variable:
   `NEXT_PUBLIC_API_BASE_URL=https://your-backend-project.vercel.app/api`
4. Deploy.

### Backend Project

1. Import the same repository into Vercel a second time.
2. Set the Root Directory to `backend`.
3. Vercel will use `backend/index.py` as the FastAPI entrypoint.
4. Add the required environment variables:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL` (optional)
   - `ECOSCAN_CORS_ORIGINS=https://your-frontend-project.vercel.app`
   - `ECOSCAN_CORS_ORIGIN_REGEX` (optional if explicit origins are enough)
   - `ECOSCAN_MAX_SCAN_FILES`
   - `ECOSCAN_MAX_FILE_SIZE_BYTES`
5. Deploy.

### Deployment Notes

- The frontend should call the deployed backend through `NEXT_PUBLIC_API_BASE_URL`.
- The backend should explicitly allow the deployed frontend origin through `ECOSCAN_CORS_ORIGINS`.
- Local runtime files such as `scan_history.json` are intentionally excluded from deployment source control.

## Summary

EcoScan AI is designed to make repository auditing more actionable by combining structural analysis, anomaly detection, persistent reporting, and AI-assisted remediation in a single workflow. The project is organized as a practical full-stack code intelligence tool, with a FastAPI backend and a Next.js frontend working together to support repeatable engineering reviews.
