# IPO Quality Score Backend v0.3

The backend exposes validated IPO research through a read-only HTTP API. It imports canonical `reports/**/report.json` artifacts, validates them, and stores both fast summary fields and the complete evidence-first report document.

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

## Provenance graph

The database now preserves the research lineage explicitly:

```text
issuer
  -> filing
      -> filing version
          -> source snapshots
          -> reports
```

### `issuers`

Stores the legal identity, country, industry, brand, and website once rather than copying them into every history row.

### `filings`

Represents one offering or filing stream for an issuer, exchange, ticker, and filing type.

### `filing_versions`

Stores every exact filing state with:

- version label;
- publication and access timestamps;
- filing URL;
- canonical content hash;
- `supersedes_id` link;
- one deterministic `is_current` version per filing.

### `source_snapshots`

Deduplicates source identities used by reports. Each snapshot stores the source type, title, URL, version, publication time, access time, and canonical hash.

### `ipo_reports`

Retains the complete report JSON and fast indexed fields. Each report now links to its exact filing version, source snapshots, prior report ID, and deterministic `is_latest` state.

The older denormalized report fields remain available so frontend list and card queries stay simple while provenance is normalized behind them.

## Recommended local run

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

Remove the local database volume:

```bash
docker compose down --volumes
```

## Manual development run

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install --requirement backend/requirements-dev.txt
export IQS_DATABASE_URL=postgresql+psycopg://ipo:ipo@localhost:5432/ipo_quality_score
alembic -c backend/alembic.ini upgrade head
python -m backend.cli import-reports
uvicorn backend.app.main:app --reload
```

Windows PowerShell activation:

```powershell
.venv\Scripts\Activate.ps1
```

For isolated SQLite experiments:

```bash
export IQS_DATABASE_URL=sqlite:///./ipo_quality_score.db
alembic -c backend/alembic.ini upgrade head
python -m backend.cli import-reports
uvicorn backend.app.main:app --reload
```

`IQS_AUTO_CREATE_SCHEMA` defaults to `false`. Production and shared environments must use Alembic rather than implicit ORM table creation.

## Migration commands

```bash
alembic -c backend/alembic.ini upgrade head
alembic -c backend/alembic.ini current
alembic -c backend/alembic.ini downgrade -1
```

Create a reviewed migration after changing models:

```bash
alembic -c backend/alembic.ini revision --autogenerate -m "describe change"
```

Autogeneration proposes database operations; it does not establish business correctness.

## Endpoints

### `GET /health`

Returns service version and imported report count.

### `GET /api/v1/reports`

Supports `ticker`, `status`, `min_score`, `limit`, and `offset`.

### `GET /api/v1/reports/{report_id}`

Returns indexed summary data plus the complete validated report document.

### `GET /api/v1/reports/by-ticker/{ticker}/latest`

Returns the current report selected by the stored history state rather than merely assuming the newest filename is current.

### `GET /api/v1/reports/{report_id}/provenance`

Returns the report together with its issuer, filing, exact filing version, and linked source snapshots.

### `GET /api/v1/filings/{filing_id}/history`

Returns all filing versions and reports in chronological order, including `supersedes_id`, `is_current`, `supersedes_report_id`, and `is_latest`.

## Import behavior

Import remains idempotent by report ID and canonical report hash. It also backfills the normalized graph for already-known reports, so adding the history migration does not require changing the canonical JSON artifacts.

When a new amendment is imported:

1. the issuer and filing are reused;
2. a new filing version is created;
3. the previous version becomes non-current;
4. `supersedes_id` points to the previous exact version;
5. the new report becomes latest;
6. previous report and source links remain queryable.

## Tests

```bash
PYTHONPATH=. pytest backend/tests -q
```

The suite verifies:

- API behavior and idempotent import;
- Alembic upgrade, downgrade, and ORM drift;
- normalized issuer and filing creation;
- source snapshot links;
- amendment supersession chains;
- SQLite and PostgreSQL integration.

## Current boundary

Included now:

- validated and idempotent report import;
- versioned Alembic schema;
- PostgreSQL and SQLite support;
- issuer, filing, filing-version, source-snapshot, and report history;
- read-only provenance API;
- Docker image and Compose stack;
- SQLite and PostgreSQL CI.

Next backend increments:

1. immutable raw source content or object-storage references;
2. authentication, reviewer roles, and audit events;
3. background SEC filing ingestion and change detection;
4. watchlists, alerts, subscriptions, and billing;
5. cached comparison and chart endpoints for the frontend.
