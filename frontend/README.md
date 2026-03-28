# EcoScan AI Frontend

Next.js frontend for the EcoScan AI dashboard.

## Features

- Dashboard for launching audits against local folders or remote repositories
- Reports view backed by stored audit history
- Green Patterns view that summarizes recurring optimization opportunities

## Setup

```powershell
copy .env.example .env.local
npm install
npm run dev
```

## Environment

- `NEXT_PUBLIC_API_BASE_URL`: Base URL for the FastAPI backend. Defaults to `http://localhost:8000/api`.

## Checks

```powershell
npm run lint
```
