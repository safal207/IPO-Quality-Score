from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str
    version: str
    reports: int = 0


class ReportSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    report_id: str
    report_version: str
    methodology_version: str
    status: str
    issuer_name: str
    ticker: str | None
    exchange: str
    filing_published_at: datetime
    normalized_score: float
    coverage_percent: float
    overall_confidence: str


class ReportListResponse(BaseModel):
    items: list[ReportSummary]
    total: int
    limit: int = Field(ge=1, le=100)
    offset: int = Field(ge=0)


class ReportDetail(BaseModel):
    summary: ReportSummary
    document: dict[str, Any]
    source_hash: str
    imported_at: datetime
