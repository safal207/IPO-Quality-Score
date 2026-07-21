from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.app.config import PROJECT_ROOT, Settings
from backend.app.main import create_app
from backend.app.services import import_reports


@pytest.fixture()
def client(tmp_path: Path):
    settings = Settings(
        database_url=f"sqlite:///{tmp_path / 'test.db'}",
        reports_root=PROJECT_ROOT / "reports",
        schema_path=PROJECT_ROOT / "schema" / "ipo-report.schema.json",
        auto_create_schema=True,
        import_reports_on_startup=True,
        cors_origins=("http://localhost:3000",),
    )
    app = create_app(settings)
    with TestClient(app) as test_client:
        yield test_client


def test_health_reports_imported(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["reports"] >= 2


def test_list_reports_and_filter(client: TestClient) -> None:
    response = client.get("/api/v1/reports", params={"min_score": 60})
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] >= 1
    assert all(item["normalized_score"] >= 60 for item in payload["items"])


def test_latest_report_by_ticker(client: TestClient) -> None:
    response = client.get("/api/v1/reports/by-ticker/LIFE/latest")
    assert response.status_code == 200
    payload = response.json()
    assert payload["summary"]["ticker"] == "LIFE"
    assert payload["summary"]["normalized_score"] == 61
    assert payload["document"]["score_summary"]["coverage_percent"] == 100


def test_report_not_found(client: TestClient) -> None:
    response = client.get("/api/v1/reports/does-not-exist")
    assert response.status_code == 404


def test_import_is_idempotent(client: TestClient) -> None:
    database = client.app.state.database
    settings = client.app.state.settings
    with database.session_factory() as session:
        stats = import_reports(session, settings.reports_root, settings.schema_path)
    assert stats.created == 0
    assert stats.updated == 0
    assert stats.unchanged >= 2
