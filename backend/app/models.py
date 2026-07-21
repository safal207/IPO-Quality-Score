from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import JSON, DateTime, Float, Index, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class ReportRecord(Base):
    __tablename__ = "ipo_reports"
    __table_args__ = (Index("ix_reports_ticker_filing", "ticker", "filing_published_at"),)

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    report_id: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    report_version: Mapped[str] = mapped_column(String(32))
    methodology_version: Mapped[str] = mapped_column(String(32), index=True)
    status: Mapped[str] = mapped_column(String(32), index=True)
    issuer_name: Mapped[str] = mapped_column(String(240), index=True)
    ticker: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)
    exchange: Mapped[str] = mapped_column(String(160))
    filing_url: Mapped[str] = mapped_column(Text)
    filing_published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    reviewed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    normalized_score: Mapped[float] = mapped_column(Float, index=True)
    coverage_percent: Mapped[float] = mapped_column(Float)
    overall_confidence: Mapped[str] = mapped_column(String(16), index=True)
    source_hash: Mapped[str] = mapped_column(String(64), index=True)
    report_document: Mapped[dict[str, Any]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
