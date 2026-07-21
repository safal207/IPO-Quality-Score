# IPO Quality Score Backend v0.2

The backend exposes validated IPO research reports through a read-only HTTP API. It imports canonical `reports/**/report.json` artifacts, validates them against the repository schema and cross-field rules, and stores both indexed summary fields and the complete evidence-first report document.

## Why read-only first

The backend deliberately exposes no public write or admin endpoints. Report publication changes evidence, score, reviewer state, and legal status, so writes should arrive only with authentication, authorization, audit logs, and reviewer workflow.

## Stack

- Python 3.12
- FastAPI
- SQLAlchemy 2.x
- Alembic migrations
- PostgreSQL for the shared backend environment
- SQLite for isolated tests and lightweight local experiments
- Psycopg 3 PostgreSQL driver
- JSON Schema plus deterministic cross-field validation

## Data contract

The `ipo_reports` table stores:

- report and methodology versions;
- issuer, ticker, exchange, and filing date;
- score, coverage, confidence, and status;
- canonical SHA-256 content hash;
- the complete evidence-first JSON report;
- created and updated timestamps.

Indexed columns support fast frontend lists and filters. The complete JSON preserves evidence, unknowns, contradictions, calculations, conflicts, and reviewer state.

## Recommended local run: Docker Compose

From the repository root:

```bash
docker compose up --build
```

This starts PostgreSQL, waits for database health, applies all Alembic migrations, imports the repository reports, and starts the API.

Open:

- API documentation: `http://localhost:8000/docs`
- health: `http://localhost:8000/health`
- reports: `http://localhost:8000/api/v1/reports`

Stop the stack:

```bash
docker compose down
```

Remove the local database volume as well:

```bash
docker compose down --volumes
```

## Manual development run

Create and activate a virtual environment, then install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --requirement backend/requirements-dev.txt
```

Windows PowerShell activation:

```powershell
.venv\Scripts\Activate.ps1
```

Set a database URL. PostgreSQL with Psycopg 3 uses:

```text
postgresql+psycopg://user:password@host:5432/database
```

Apply migrations before starting or importing:

```bash
export IQS_DATABASE_URL=postgresql+psycopg://ipo:ipo@localhost:5432/ipo_quality_score
alembic -c backend/alembic.ini upgrade head
python -m backend.cli import-reports
uvicorn backend.app.main:app --reload
```

For an isolated SQLite experiment:

```bash
export IQS_DATABASE_URL=sqlite:///./ipo_quality_score.db
alembic -c backend/alembic.ini upgrade head
python -m backend.cli import-reports
uvicorn backend.app.main:app --reload
```

`IQS_AUTO_CREATE_SCHEMA` defaults to `false`. Production and shared environments must use Alembic rather than implicit ORM table creation.

## Migration commands

Apply all migrations:

```bash
alembic -c backend/alembic.ini upgrade head
```

Show the current revision:

```bash
alembic -c backend/alembic.ini current
```

Create a new revision after changing models:

```bash
alembic -c backend/alembic.ini revision --autogenerate -m "describe change"
```

Rollback one revision:

```bash
alembic -c backend/alembic.ini downgrade -1
```

Generated migrations must be reviewed before commit. Autogeneration proposes database operations; it does not establish business correctness.

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

### `GET /api/v1/reports/{report_id}`

Returns indexed summary data plus the complete validated report document.

### `GET /api/v1/reports/by-ticker/{ticker}/latest`

Returns the most recent filing-based report for a ticker.

## Environment

Important variables:

- `IQS_DATABASE_URL`
- `IQS_REPORTS_ROOT`
- `IQS_SCHEMA_PATH`
- `IQS_AUTO_CREATE_SCHEMA`
- `IQS_IMPORT_REPORTS_ON_STARTUP`
- `IQS_CORS_ORIGINS`

See `backend/.env.example`.

## Tests

```bash
PYTHONPATH=. pytest backend/tests -q
```

The default suite validates API behavior, idempotent import, and Alembic upgrade/downgrade on SQLite. GitHub Actions additionally starts PostgreSQL, applies migrations, imports the real ITG and Ethos reports, and calls the health endpoint.

## Current boundary

Included now:

- validated and idempotent report import;
- versioned Alembic schema;
- PostgreSQL and SQLite support;
- read-only API;
- CORS configuration;
- Docker image and Compose stack;
- SQLite and PostgreSQL CI.

Next backend increments:

1. issuer, filing, and amendment-history entities;
2. source snapshot and supersession records;
3. authentication, roles, and reviewer workflow;
4. background filing ingestion and change detection;
5. watchlists, alerts, subscriptions, and billing;
6. cached comparison and chart endpoints for the frontend.
