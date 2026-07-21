from __future__ import annotations

import os

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient

from backend.app.config import PROJECT_ROOT, Settings
from backend.app.database import Database
from backend.app.main import create_app
from backend.app.services import import_reports


def test_postgres_migration_import_and_health() -> None:
    database_url = os.getenv("IQS_TEST_POSTGRES_URL")
    if not database_url:
        pytest.skip("IQS_TEST_POSTGRES_URL is not configured")

    config = Config(str(PROJECT_ROOT / "backend" / "alembic.ini"))
    config.set_main_option("sqlalchemy.url", database_url.replace("%", "%%"))
    command.upgrade(config, "head")

    database = Database(database_url)
    try:
        with database.session_factory() as session:
            stats = import_reports(
                session,
                PROJECT_ROOT / "reports",
                PROJECT_ROOT / "schema" / "ipo-report.schema.json",
            )
        assert stats.total >= 2

        settings = Settings(
            database_url=database_url,
            reports_root=PROJECT_ROOT / "reports",
            schema_path=PROJECT_ROOT / "schema" / "ipo-report.schema.json",
            auto_create_schema=False,
            import_reports_on_startup=False,
            cors_origins=("http://localhost:3000",),
        )
        with TestClient(create_app(settings)) as client:
            response = client.get("/health")
            assert response.status_code == 200
            assert response.json()["reports"] >= 2
    finally:
        database.dispose()
