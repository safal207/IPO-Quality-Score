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
    supersedes_report_id: str | None = None
    is_latest: bool = True


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


class IssuerSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    legal_name: str
    brand_name: str | None
    country: str
    industry: str
    website: str | None


class FilingSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    filing_type: str
    exchange: str
    ticker: str | None


class FilingVersionSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    version_label: str
    published_at: datetime
    source_accessed_at: datetime
    source_url: str
    source_hash: str
    is_current: bool
    supersedes_id: int | None


class SourceSnapshotSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    source_type: str
    source_title: str
    source_url: str
    source_version: str | None
    published_at: datetime
    accessed_at: datetime
    content_hash: str


class ReportProvenance(BaseModel):
    report: ReportSummary
    issuer: IssuerSummary
    filing: FilingSummary
    filing_version: FilingVersionSummary
    sources: list[SourceSnapshotSummary]


class FilingHistoryResponse(BaseModel):
    issuer: IssuerSummary
    filing: FilingSummary
    versions: list[FilingVersionSummary]
    reports: list[ReportSummary]
