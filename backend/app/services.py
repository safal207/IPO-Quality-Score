from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from backend.app.models import (
    FilingRecord,
    FilingVersionRecord,
    IssuerRecord,
    ReportRecord,
    SourceSnapshotRecord,
)
from scripts.validate_reports import validate_cross_fields


class ReportValidationError(ValueError):
    pass


@dataclass(slots=True)
class ImportStats:
    created: int = 0
    updated: int = 0
    unchanged: int = 0

    @property
    def total(self) -> int:
        return self.created + self.updated + self.unchanged


def _parse_datetime(value: str) -> datetime:
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


def _utc_sort(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


def _canonical_hash(value: Any) -> str:
    payload = json.dumps(
        value,
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    ).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()


def validate_report(document: dict[str, Any], schema_path: Path) -> None:
    schema = json.loads(schema_path.read_text(encoding="utf-8"))
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    schema_errors = sorted(
        validator.iter_errors(document), key=lambda item: list(item.path)
    )
    errors = [
        f"schema {'.'.join(map(str, error.path)) or '<root>'}: {error.message}"
        for error in schema_errors
    ]
    errors.extend(validate_cross_fields(document))
    if errors:
        raise ReportValidationError("; ".join(errors))


def _get_or_create_issuer(
    session: Session,
    issuer_document: dict[str, Any],
) -> IssuerRecord:
    issuer = session.scalar(
        select(IssuerRecord).where(
            IssuerRecord.legal_name == issuer_document["legal_name"],
            IssuerRecord.country == issuer_document["country"],
        )
    )
    values = {
        "brand_name": issuer_document.get("brand_name"),
        "industry": issuer_document["industry"],
        "website": issuer_document.get("website"),
    }
    if issuer is None:
        issuer = IssuerRecord(
            legal_name=issuer_document["legal_name"],
            country=issuer_document["country"],
            **values,
        )
        session.add(issuer)
        session.flush()
        return issuer

    for field, value in values.items():
        setattr(issuer, field, value)
    return issuer


def _filing_key(
    issuer_document: dict[str, Any],
    offering: dict[str, Any],
) -> str:
    return _canonical_hash(
        {
            "issuer": issuer_document["legal_name"],
            "country": issuer_document["country"],
            "filing_type": offering["filing_type"],
            "exchange": offering["exchange"],
            "ticker": (offering.get("ticker") or "").upper() or None,
        }
    )


def _get_or_create_filing(
    session: Session,
    issuer: IssuerRecord,
    issuer_document: dict[str, Any],
    offering: dict[str, Any],
) -> FilingRecord:
    filing_key = _filing_key(issuer_document, offering)
    filing = session.scalar(
        select(FilingRecord).where(FilingRecord.filing_key == filing_key)
    )
    values = {
        "filing_type": offering["filing_type"],
        "exchange": offering["exchange"],
        "ticker": (offering.get("ticker") or "").upper() or None,
    }
    if filing is None:
        filing = FilingRecord(
            issuer_id=issuer.id,
            filing_key=filing_key,
            **values,
        )
        session.add(filing)
        session.flush()
        return filing

    for field, value in values.items():
        setattr(filing, field, value)
    return filing


def _sync_filing_version_history(
    session: Session,
    filing_id: int,
) -> None:
    versions = list(
        session.scalars(
            select(FilingVersionRecord)
            .where(FilingVersionRecord.filing_id == filing_id)
            .order_by(FilingVersionRecord.published_at, FilingVersionRecord.id)
        )
    )
    versions.sort(key=lambda item: (_utc_sort(item.published_at), item.id))
    previous: FilingVersionRecord | None = None
    for index, version in enumerate(versions):
        version.supersedes_id = previous.id if previous is not None else None
        version.is_current = index == len(versions) - 1
        previous = version


def _get_or_create_filing_version(
    session: Session,
    filing: FilingRecord,
    offering: dict[str, Any],
) -> FilingVersionRecord:
    source_hash = _canonical_hash(offering)
    version = session.scalar(
        select(FilingVersionRecord).where(
            FilingVersionRecord.filing_id == filing.id,
            FilingVersionRecord.source_hash == source_hash,
        )
    )
    values = {
        "version_label": offering["filing_version"],
        "published_at": _parse_datetime(offering["filing_published_at"]),
        "source_accessed_at": _parse_datetime(offering["source_accessed_at"]),
        "source_url": offering["filing_url"],
    }
    if version is None:
        version = FilingVersionRecord(
            filing_id=filing.id,
            source_hash=source_hash,
            **values,
        )
        session.add(version)
        session.flush()
    else:
        for field, value in values.items():
            setattr(version, field, value)

    _sync_filing_version_history(session, filing.id)
    session.flush()
    return version


def _source_identity(evidence: dict[str, Any]) -> dict[str, Any]:
    return {
        "source_type": evidence["source_type"],
        "source_title": evidence["source_title"],
        "source_url": evidence["source_url"],
        "source_version": evidence.get("source_version"),
        "published_at": evidence["published_at"],
    }


def _get_or_create_source_snapshots(
    session: Session,
    filing_version: FilingVersionRecord,
    evidence_items: list[dict[str, Any]],
) -> list[SourceSnapshotRecord]:
    snapshots: list[SourceSnapshotRecord] = []
    seen_hashes: set[str] = set()

    for evidence in evidence_items:
        identity = _source_identity(evidence)
        content_hash = _canonical_hash(identity)
        if content_hash in seen_hashes:
            continue
        seen_hashes.add(content_hash)

        snapshot = session.scalar(
            select(SourceSnapshotRecord).where(
                SourceSnapshotRecord.filing_version_id == filing_version.id,
                SourceSnapshotRecord.content_hash == content_hash,
            )
        )
        if snapshot is None:
            snapshot = SourceSnapshotRecord(
                filing_version_id=filing_version.id,
                source_type=evidence["source_type"],
                source_title=evidence["source_title"],
                source_url=evidence["source_url"],
                source_version=evidence.get("source_version"),
                published_at=_parse_datetime(evidence["published_at"]),
                accessed_at=_parse_datetime(evidence["accessed_at"]),
                content_hash=content_hash,
                snapshot_document=identity,
            )
            session.add(snapshot)
            session.flush()
        snapshots.append(snapshot)

    return snapshots


def _sync_latest_reports(session: Session, filing_id: int) -> None:
    reports = list(
        session.scalars(
            select(ReportRecord)
            .join(FilingVersionRecord)
            .where(FilingVersionRecord.filing_id == filing_id)
            .order_by(ReportRecord.reviewed_at, ReportRecord.id)
        )
    )
    reports.sort(key=lambda item: (_utc_sort(item.reviewed_at), item.id))
    for index, report in enumerate(reports):
        report.is_latest = index == len(reports) - 1


def upsert_report(
    session: Session,
    document: dict[str, Any],
    schema_path: Path,
) -> str:
    validate_report(document, schema_path)
    report_id = document["report_id"]
    source_hash = _canonical_hash(document)
    record = session.scalar(
        select(ReportRecord).where(ReportRecord.report_id == report_id)
    )
    unchanged = record is not None and record.source_hash == source_hash

    offering = document["offering_state"]
    summary = document["score_summary"]
    review = document["review"]
    issuer_document = document["issuer"]

    issuer = _get_or_create_issuer(session, issuer_document)
    filing = _get_or_create_filing(
        session,
        issuer,
        issuer_document,
        offering,
    )
    filing_version = _get_or_create_filing_version(session, filing, offering)
    snapshots = _get_or_create_source_snapshots(
        session,
        filing_version,
        document["evidence"],
    )

    values = {
        "report_version": document["report_version"],
        "methodology_version": document["methodology_version"],
        "status": document["status"],
        "issuer_name": issuer_document["legal_name"],
        "ticker": (offering.get("ticker") or "").upper() or None,
        "exchange": offering["exchange"],
        "filing_url": offering["filing_url"],
        "filing_published_at": _parse_datetime(offering["filing_published_at"]),
        "filing_version_id": filing_version.id,
        "supersedes_report_id": document.get("supersedes_report_id"),
        "reviewed_at": _parse_datetime(review["reviewed_at"]),
        "normalized_score": float(summary["normalized_score"]),
        "coverage_percent": float(summary["coverage_percent"]),
        "overall_confidence": document["overall_confidence"],
        "source_hash": source_hash,
        "report_document": document,
    }

    if record is None:
        record = ReportRecord(report_id=report_id, **values)
        session.add(record)
        session.flush()
        result = "created"
    else:
        for field, value in values.items():
            setattr(record, field, value)
        result = "unchanged" if unchanged else "updated"

    record.source_snapshots = snapshots
    session.flush()
    _sync_latest_reports(session, filing.id)
    return result


def import_reports(
    session: Session,
    reports_root: Path,
    schema_path: Path,
) -> ImportStats:
    stats = ImportStats()
    for path in sorted(reports_root.glob("**/report.json")):
        document = json.loads(path.read_text(encoding="utf-8"))
        result = upsert_report(session, document, schema_path)
        setattr(stats, result, getattr(stats, result) + 1)
    session.commit()
    return stats


def list_reports(
    session: Session,
    *,
    ticker: str | None,
    status: str | None,
    min_score: float | None,
    limit: int,
    offset: int,
) -> tuple[list[ReportRecord], int]:
    conditions = []
    if ticker:
        conditions.append(ReportRecord.ticker == ticker.upper())
    if status:
        conditions.append(ReportRecord.status == status)
    if min_score is not None:
        conditions.append(ReportRecord.normalized_score >= min_score)

    items = list(
        session.scalars(
            select(ReportRecord)
            .where(*conditions)
            .order_by(ReportRecord.filing_published_at.desc())
            .offset(offset)
            .limit(limit)
        )
    )
    total = session.scalar(
        select(func.count()).select_from(ReportRecord).where(*conditions)
    )
    return items, int(total or 0)


def get_report(session: Session, report_id: str) -> ReportRecord | None:
    return session.scalar(
        select(ReportRecord).where(ReportRecord.report_id == report_id)
    )


def get_latest_report(session: Session, ticker: str) -> ReportRecord | None:
    return session.scalar(
        select(ReportRecord)
        .where(
            ReportRecord.ticker == ticker.upper(),
            ReportRecord.is_latest.is_(True),
        )
        .order_by(ReportRecord.filing_published_at.desc())
        .limit(1)
    )


def get_filing(session: Session, filing_id: int) -> FilingRecord | None:
    return session.get(FilingRecord, filing_id)
