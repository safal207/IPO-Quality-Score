from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Table,
    Text,
    UniqueConstraint,
    true,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


report_source_snapshots = Table(
    "report_source_snapshots",
    Base.metadata,
    Column(
        "report_record_id",
        ForeignKey("ipo_reports.id", ondelete="CASCADE"),
        primary_key=True,
    ),
    Column(
        "source_snapshot_id",
        ForeignKey("source_snapshots.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class IssuerRecord(Base):
    __tablename__ = "issuers"
    __table_args__ = (
        UniqueConstraint(
            "legal_name",
            "country",
            name="uq_issuers_legal_name_country",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    legal_name: Mapped[str] = mapped_column(String(240), index=True)
    brand_name: Mapped[str | None] = mapped_column(String(240), nullable=True)
    country: Mapped[str] = mapped_column(String(120), index=True)
    industry: Mapped[str] = mapped_column(Text)
    website: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )

    filings: Mapped[list["FilingRecord"]] = relationship(back_populates="issuer")


class FilingRecord(Base):
    __tablename__ = "filings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    issuer_id: Mapped[int] = mapped_column(
        ForeignKey("issuers.id", ondelete="RESTRICT"),
        index=True,
    )
    filing_key: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    filing_type: Mapped[str] = mapped_column(String(64), index=True)
    exchange: Mapped[str] = mapped_column(String(160))
    ticker: Mapped[str | None] = mapped_column(String(32), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )

    issuer: Mapped[IssuerRecord] = relationship(back_populates="filings")
    versions: Mapped[list["FilingVersionRecord"]] = relationship(
        back_populates="filing",
        order_by="FilingVersionRecord.published_at",
    )


class FilingVersionRecord(Base):
    __tablename__ = "filing_versions"
    __table_args__ = (
        UniqueConstraint(
            "filing_id",
            "source_hash",
            name="uq_filing_versions_filing_source_hash",
        ),
        Index("ix_filing_versions_filing_current", "filing_id", "is_current"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    filing_id: Mapped[int] = mapped_column(
        ForeignKey("filings.id", ondelete="CASCADE"),
        index=True,
    )
    version_label: Mapped[str] = mapped_column(Text)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    source_accessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    source_url: Mapped[str] = mapped_column(Text)
    source_hash: Mapped[str] = mapped_column(String(64), index=True)
    is_current: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default=true(),
        index=True,
    )
    supersedes_id: Mapped[int | None] = mapped_column(
        ForeignKey("filing_versions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    filing: Mapped[FilingRecord] = relationship(back_populates="versions")
    snapshots: Mapped[list["SourceSnapshotRecord"]] = relationship(
        back_populates="filing_version",
        cascade="all, delete-orphan",
    )
    reports: Mapped[list["ReportRecord"]] = relationship(
        back_populates="filing_version"
    )


class SourceSnapshotRecord(Base):
    __tablename__ = "source_snapshots"
    __table_args__ = (
        UniqueConstraint(
            "filing_version_id",
            "content_hash",
            name="uq_source_snapshots_version_hash",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    filing_version_id: Mapped[int] = mapped_column(
        ForeignKey("filing_versions.id", ondelete="CASCADE"),
        index=True,
    )
    source_type: Mapped[str] = mapped_column(String(64), index=True)
    source_title: Mapped[str] = mapped_column(Text)
    source_url: Mapped[str] = mapped_column(Text)
    source_version: Mapped[str | None] = mapped_column(Text, nullable=True)
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    accessed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    content_hash: Mapped[str] = mapped_column(String(64), index=True)
    snapshot_document: Mapped[dict[str, Any]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    filing_version: Mapped[FilingVersionRecord] = relationship(
        back_populates="snapshots"
    )
    reports: Mapped[list["ReportRecord"]] = relationship(
        secondary=report_source_snapshots,
        back_populates="source_snapshots",
    )


class ReportRecord(Base):
    __tablename__ = "ipo_reports"
    __table_args__ = (
        Index("ix_reports_ticker_filing", "ticker", "filing_published_at"),
        Index("ix_reports_filing_latest", "filing_version_id", "is_latest"),
    )

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
    filing_version_id: Mapped[int | None] = mapped_column(
        ForeignKey("filing_versions.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
    )
    supersedes_report_id: Mapped[str | None] = mapped_column(
        String(160),
        nullable=True,
        index=True,
    )
    is_latest: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        server_default=true(),
        index=True,
    )
    reviewed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    normalized_score: Mapped[float] = mapped_column(Float, index=True)
    coverage_percent: Mapped[float] = mapped_column(Float)
    overall_confidence: Mapped[str] = mapped_column(String(16), index=True)
    source_hash: Mapped[str] = mapped_column(String(64), index=True)
    report_document: Mapped[dict[str, Any]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )

    filing_version: Mapped[FilingVersionRecord | None] = relationship(
        back_populates="reports"
    )
    source_snapshots: Mapped[list[SourceSnapshotRecord]] = relationship(
        secondary=report_source_snapshots,
        back_populates="reports",
    )
