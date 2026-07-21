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

from backend.app.models import ReportRecord
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


def _canonical_hash(document: dict[str, Any]) -> str:
    payload = json.dumps(
        document,
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

    if record is not None and record.source_hash == source_hash:
        return "unchanged"

    offering = document["offering_state"]
    summary = document["score_summary"]
    review = document["review"]
    issuer = document["issuer"]

    values = {
        "report_version": document["report_version"],
        "methodology_version": document["methodology_version"],
        "status": document["status"],
        "issuer_name": issuer["legal_name"],
        "ticker": (offering.get("ticker") or "").upper() or None,
        "exchange": offering["exchange"],
        "filing_url": offering["filing_url"],
        "filing_published_at": _parse_datetime(offering["filing_published_at"]),
        "reviewed_at": _parse_datetime(review["reviewed_at"]),
        "normalized_score": float(summary["normalized_score"]),
        "coverage_percent": float(summary["coverage_percent"]),
        "overall_confidence": document["overall_confidence"],
        "source_hash": source_hash,
        "report_document": document,
    }

    if record is None:
        session.add(ReportRecord(report_id=report_id, **values))
        return "created"

    for field, value in values.items():
        setattr(record, field, value)
    return "updated"


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
        .where(ReportRecord.ticker == ticker.upper())
        .order_by(ReportRecord.filing_published_at.desc())
        .limit(1)
    )
