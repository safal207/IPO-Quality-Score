from __future__ import annotations

import logging
from collections.abc import Iterator
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.app.config import Settings
from backend.app.database import Database
from backend.app.models import FilingRecord, ReportRecord
from backend.app.schemas import (
    FilingHistoryResponse,
    FilingSummary,
    FilingVersionSummary,
    HealthResponse,
    IssuerSummary,
    ReportDetail,
    ReportListResponse,
    ReportProvenance,
    ReportSummary,
    SourceSnapshotSummary,
)
from backend.app.services import (
    get_filing,
    get_latest_report,
    get_report,
    import_reports,
    list_reports,
)

logger = logging.getLogger(__name__)


def _summary(record: ReportRecord) -> ReportSummary:
    return ReportSummary.model_validate(record)


def _detail(record: ReportRecord) -> ReportDetail:
    return ReportDetail(
        summary=_summary(record),
        document=record.report_document,
        source_hash=record.source_hash,
        imported_at=record.updated_at,
    )


def _provenance(record: ReportRecord) -> ReportProvenance:
    version = record.filing_version
    if version is None:
        raise HTTPException(status_code=409, detail="report provenance is not linked")
    filing = version.filing
    return ReportProvenance(
        report=_summary(record),
        issuer=IssuerSummary.model_validate(filing.issuer),
        filing=FilingSummary.model_validate(filing),
        filing_version=FilingVersionSummary.model_validate(version),
        sources=[
            SourceSnapshotSummary.model_validate(item)
            for item in sorted(record.source_snapshots, key=lambda source: source.id)
        ],
    )


def _history(filing: FilingRecord) -> FilingHistoryResponse:
    versions = sorted(filing.versions, key=lambda item: (item.published_at, item.id))
    reports = sorted(
        (report for version in versions for report in version.reports),
        key=lambda item: (item.reviewed_at, item.id),
    )
    return FilingHistoryResponse(
        issuer=IssuerSummary.model_validate(filing.issuer),
        filing=FilingSummary.model_validate(filing),
        versions=[FilingVersionSummary.model_validate(item) for item in versions],
        reports=[_summary(item) for item in reports],
    )


def create_app(settings: Settings | None = None) -> FastAPI:
    resolved = settings or Settings.from_env()
    database = Database(resolved.database_url)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.settings = resolved
        app.state.database = database
        if resolved.auto_create_schema:
            database.create_schema()
        if resolved.import_reports_on_startup and resolved.reports_root.exists():
            with database.session_factory() as session:
                stats = import_reports(
                    session,
                    resolved.reports_root,
                    resolved.schema_path,
                )
            logger.info(
                "report import complete: created=%s updated=%s unchanged=%s",
                stats.created,
                stats.updated,
                stats.unchanged,
            )
        yield
        database.dispose()

    app = FastAPI(
        title=resolved.app_name,
        version=resolved.app_version,
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(resolved.cors_origins),
        allow_credentials=False,
        allow_methods=["GET"],
        allow_headers=["*"],
    )

    def get_session(request: Request) -> Iterator[Session]:
        with request.app.state.database.session_factory() as session:
            yield session

    @app.get("/health", response_model=HealthResponse, tags=["system"])
    def health(session: Session = Depends(get_session)) -> HealthResponse:
        count = session.scalar(select(func.count()).select_from(ReportRecord))
        return HealthResponse(
            service=resolved.app_name,
            version=resolved.app_version,
            reports=int(count or 0),
        )

    @app.get(
        "/api/v1/reports",
        response_model=ReportListResponse,
        tags=["reports"],
    )
    def reports_index(
        ticker: str | None = Query(default=None, min_length=1, max_length=32),
        status: str | None = Query(default=None, min_length=1, max_length=32),
        min_score: float | None = Query(default=None, ge=0, le=100),
        limit: int = Query(default=20, ge=1, le=100),
        offset: int = Query(default=0, ge=0),
        session: Session = Depends(get_session),
    ) -> ReportListResponse:
        items, total = list_reports(
            session,
            ticker=ticker,
            status=status,
            min_score=min_score,
            limit=limit,
            offset=offset,
        )
        return ReportListResponse(
            items=[_summary(item) for item in items],
            total=total,
            limit=limit,
            offset=offset,
        )

    @app.get(
        "/api/v1/reports/by-ticker/{ticker}/latest",
        response_model=ReportDetail,
        tags=["reports"],
    )
    def latest_by_ticker(
        ticker: str,
        session: Session = Depends(get_session),
    ) -> ReportDetail:
        record = get_latest_report(session, ticker)
        if record is None:
            raise HTTPException(status_code=404, detail="report not found")
        return _detail(record)

    @app.get(
        "/api/v1/reports/{report_id}/provenance",
        response_model=ReportProvenance,
        tags=["provenance"],
    )
    def report_provenance(
        report_id: str,
        session: Session = Depends(get_session),
    ) -> ReportProvenance:
        record = get_report(session, report_id)
        if record is None:
            raise HTTPException(status_code=404, detail="report not found")
        return _provenance(record)

    @app.get(
        "/api/v1/filings/{filing_id}/history",
        response_model=FilingHistoryResponse,
        tags=["provenance"],
    )
    def filing_history(
        filing_id: int,
        session: Session = Depends(get_session),
    ) -> FilingHistoryResponse:
        filing = get_filing(session, filing_id)
        if filing is None:
            raise HTTPException(status_code=404, detail="filing not found")
        return _history(filing)

    @app.get(
        "/api/v1/reports/{report_id}",
        response_model=ReportDetail,
        tags=["reports"],
    )
    def report_detail(
        report_id: str,
        session: Session = Depends(get_session),
    ) -> ReportDetail:
        record = get_report(session, report_id)
        if record is None:
            raise HTTPException(status_code=404, detail="report not found")
        return _detail(record)

    return app


app = create_app()
