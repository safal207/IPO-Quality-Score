from __future__ import annotations

import copy
import json
from pathlib import Path

from fastapi.testclient import TestClient
from sqlalchemy import func, select

from backend.app.config import PROJECT_ROOT, Settings
from backend.app.main import create_app
from backend.app.models import (
    FilingRecord,
    FilingVersionRecord,
    IssuerRecord,
    ReportRecord,
    SourceSnapshotRecord,
)
from backend.app.services import upsert_report


def history_client(tmp_path: Path) -> TestClient:
    settings = Settings(
        database_url=f"sqlite:///{tmp_path / 'history.db'}",
        reports_root=PROJECT_ROOT / "reports",
        schema_path=PROJECT_ROOT / "schema" / "ipo-report.schema.json",
        auto_create_schema=True,
        import_reports_on_startup=True,
        cors_origins=("http://localhost:3000",),
    )
    return TestClient(create_app(settings))


def test_import_builds_normalized_provenance_graph(tmp_path: Path) -> None:
    with history_client(tmp_path) as client:
        database = client.app.state.database
        with database.session_factory() as session:
            assert session.scalar(select(func.count()).select_from(IssuerRecord)) >= 2
            assert session.scalar(select(func.count()).select_from(FilingRecord)) >= 2
            assert session.scalar(select(func.count()).select_from(FilingVersionRecord)) >= 2
            assert session.scalar(select(func.count()).select_from(SourceSnapshotRecord)) >= 2

        response = client.get(
            "/api/v1/reports/ethos-2026-01-30-424b4-v0.1/provenance"
        )
        assert response.status_code == 200
        payload = response.json()
        assert payload["issuer"]["legal_name"] == "Ethos Technologies Inc."
        assert payload["filing"]["ticker"] == "LIFE"
        assert payload["filing_version"]["is_current"] is True
        assert payload["sources"]

        history = client.get(
            f"/api/v1/filings/{payload['filing']['id']}/history"
        )
        assert history.status_code == 200
        history_payload = history.json()
        assert len(history_payload["versions"]) == 1
        assert history_payload["reports"][0]["is_latest"] is True


def test_amendment_preserves_supersession_chain(tmp_path: Path) -> None:
    with history_client(tmp_path) as client:
        database = client.app.state.database
        source_path = PROJECT_ROOT / "reports" / "ethos-2026-01-30" / "report.json"
        original = json.loads(source_path.read_text(encoding="utf-8"))
        amended = copy.deepcopy(original)
        amended["report_id"] = "ethos-2026-02-15-amended-v0.2"
        amended["report_version"] = "0.2.0"
        amended["supersedes_report_id"] = original["report_id"]
        amended["offering_state"]["filing_version"] = "Amended final prospectus"
        amended["offering_state"]["filing_published_at"] = "2026-02-15T00:00:00Z"
        amended["offering_state"]["source_accessed_at"] = "2026-07-21T12:00:00Z"
        amended["offering_state"]["filing_url"] = "https://example.com/ethos-amended"
        amended["review"]["reviewed_at"] = "2026-07-21T12:05:00Z"
        for evidence in amended["evidence"]:
            evidence["source_url"] = "https://example.com/ethos-amended"
            evidence["source_version"] = "Amended 2026-02-15"
            evidence["published_at"] = "2026-02-15T00:00:00Z"
            evidence["accessed_at"] = "2026-07-21T12:00:00Z"

        with database.session_factory() as session:
            result = upsert_report(
                session,
                amended,
                PROJECT_ROOT / "schema" / "ipo-report.schema.json",
            )
            session.commit()
            assert result == "created"

            old_report = session.scalar(
                select(ReportRecord).where(
                    ReportRecord.report_id == original["report_id"]
                )
            )
            new_report = session.scalar(
                select(ReportRecord).where(
                    ReportRecord.report_id == amended["report_id"]
                )
            )
            assert old_report is not None
            assert new_report is not None
            assert old_report.is_latest is False
            assert new_report.is_latest is True
            assert new_report.supersedes_report_id == old_report.report_id
            assert new_report.source_snapshots

            filing_id = new_report.filing_version.filing_id
            versions = list(
                session.scalars(
                    select(FilingVersionRecord)
                    .where(FilingVersionRecord.filing_id == filing_id)
                    .order_by(FilingVersionRecord.published_at)
                )
            )
            assert len(versions) == 2
            assert versions[0].is_current is False
            assert versions[1].is_current is True
            assert versions[1].supersedes_id == versions[0].id

        provenance = client.get(
            "/api/v1/reports/ethos-2026-02-15-amended-v0.2/provenance"
        )
        assert provenance.status_code == 200
        assert provenance.json()["filing_version"]["supersedes_id"] is not None
