# IPO Quality Score Backend v0.1

The backend exposes validated IPO research reports through a read-only HTTP API. It imports the canonical `reports/**/report.json` artifacts, validates them against the repository schema and cross-field rules, and stores both indexed summary fields and the complete report document.

## Why read-only first

The first backend version deliberately does not expose public write or admin endpoints. Report publication changes evidence, score, and legal state, so writes should arrive only with authentication, authorization, audit logs, and reviewer workflow.

## Stack

- Python 3.12
- FastAPI
- SQLAlchemy 2.x
- SQLite for local development
- PostgreSQL-compatible SQLAlchemy model for production migration
- JSON Schema plus the existing cross-field report validator

## Data shape

The `ipo_reports` table stores:

- report and methodology versions;
- issuer, ticker, exchange, and filing date;
- score, coverage, confidence, and status;
- canonical content hash;
- the complete evidence-first JSON report.

The denormalized JSON remains the source artifact. Indexed columns support fast list, filter, and latest-report queries for the future frontend.

## Run locally

From the repository root:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --requirement backend/requirements-dev.txt
python -m backend.cli import-reports
uvicorn backend.app.main:app --reload
```

Windows PowerShell activation:

```powershell
.venv\Scripts\Activate.ps1
```

Open:

- API documentation: `http://localhost:8000/docs`
- health: `http://localhost:8000/health`
- reports: `http://localhost:8000/api/v1/reports`

## Endpoints

### `GET /health`

Returns service version and imported report count.

### `GET /api/v1/reports`

Query parameters:

- `ticker`
- `status`
- `min_score`
- `limit` from 1 to 100
- `offset`

The response contains lightweight report summaries for cards, tables, search results, and watchlists.

### `GET /api/v1/reports/{report_id}`

Returns indexed summary data plus the complete validated report document.

### `GET /api/v1/reports/by-ticker/{ticker}/latest`

Returns the most recent filing-based report for a ticker.

## Environment

Copy `backend/.env.example` values into the deployment environment. The application reads variables directly from the process environment.

Important variables:

- `IQS_DATABASE_URL`
- `IQS_REPORTS_ROOT`
- `IQS_SCHEMA_PATH`
- `IQS_IMPORT_REPORTS_ON_STARTUP`
- `IQS_CORS_ORIGINS`

## Tests

```bash
PYTHONPATH=. pytest backend/tests -q
```

Tests verify startup import, health, filtering, latest-by-ticker, 404 behavior, and idempotent imports.

## Container

Build from the repository root:

```bash
docker build -f backend/Dockerfile -t ipo-quality-score-api .
docker run --rm -p 8000:8000 ipo-quality-score-api
```

## Current boundary

Included now:

- validated import;
- idempotent upsert by report ID and canonical hash;
- SQLite persistence;
- read-only API;
- CORS configuration;
- Docker image;
- automated tests.

Next backend increments:

1. Alembic migrations and PostgreSQL CI;
2. issuer and filing entities for amendment history;
3. authentication, roles, and reviewer workflow;
4. background filing ingestion and change detection;
5. watchlists, alerts, subscriptions, and billing;
6. cached comparison endpoints for the frontend.
