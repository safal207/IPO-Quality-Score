#!/usr/bin/env python3
"""Validate IPO Quality Score JSON reports against schema and cross-field rules."""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
SCHEMA_PATH = ROOT / "schema" / "ipo-report.schema.json"

CANONICAL_WEIGHTS = {
    "revenue_durability": 15,
    "profitability_cash_flow": 15,
    "market_competition": 10,
    "valuation_quality": 15,
    "balance_sheet": 10,
    "use_of_proceeds": 10,
    "insiders_lockup_dilution": 10,
    "governance_rights": 5,
    "legal_regulatory": 5,
    "disclosure_quality": 5,
}


def load_json(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"cannot read valid JSON: {exc}") from exc


def approx_equal(left: float, right: float, tolerance: float = 0.01) -> bool:
    return math.isclose(float(left), float(right), abs_tol=tolerance)


def interpretation_for(score: float) -> str:
    if score >= 80:
        return "strong_due_diligence_candidate"
    if score >= 60:
        return "meaningful_risks"
    if score >= 40:
        return "speculative_or_evidence_limited"
    return "severe_concerns"


def referenced_evidence_ids(report: dict[str, Any]) -> set[str]:
    references: set[str] = set()
    for dimension in report.get("dimensions", []):
        references.update(dimension.get("evidence_ids", []))
    for group in ("red_flags", "positive_signals"):
        for finding in report.get(group, []):
            references.update(finding.get("evidence_ids", []))
    for contradiction in report.get("contradictions", []):
        references.update(contradiction.get("evidence_ids", []))
    return references


def validate_cross_fields(report: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    dimensions = report.get("dimensions", [])
    ids = [dimension.get("id") for dimension in dimensions]

    if len(ids) != len(set(ids)):
        errors.append("dimension IDs must be unique")

    missing = set(CANONICAL_WEIGHTS) - set(ids)
    extra = set(ids) - set(CANONICAL_WEIGHTS)
    if missing:
        errors.append(f"missing dimensions: {sorted(missing)}")
    if extra:
        errors.append(f"unknown dimensions: {sorted(extra)}")

    earned_points = 0.0
    applicable_max = 0.0

    for dimension in dimensions:
        dimension_id = dimension.get("id")
        status = dimension.get("status")
        max_points = dimension.get("max_points")
        earned = dimension.get("earned_points")

        expected_weight = CANONICAL_WEIGHTS.get(dimension_id)
        if expected_weight is not None and max_points != expected_weight:
            errors.append(
                f"{dimension_id}: max_points must be {expected_weight}, got {max_points}"
            )

        if status == "scored":
            if earned is None:
                errors.append(f"{dimension_id}: scored dimension requires earned_points")
                continue
            if earned < 0 or earned > max_points:
                errors.append(
                    f"{dimension_id}: earned_points {earned} must be between 0 and {max_points}"
                )
            if not dimension.get("evidence_ids"):
                errors.append(f"{dimension_id}: scored dimension requires evidence")
            earned_points += float(earned)
            applicable_max += float(max_points)
        elif earned is not None:
            errors.append(
                f"{dimension_id}: {status} dimension must use null earned_points"
            )

    evidence = report.get("evidence", [])
    evidence_ids = [item.get("evidence_id") for item in evidence]
    if len(evidence_ids) != len(set(evidence_ids)):
        errors.append("evidence IDs must be unique")

    missing_refs = referenced_evidence_ids(report) - set(evidence_ids)
    if missing_refs:
        errors.append(f"missing referenced evidence: {sorted(missing_refs)}")

    summary = report.get("score_summary", {})
    normalized = earned_points / applicable_max * 100 if applicable_max else 0.0
    coverage = applicable_max

    expected_summary = {
        "earned_points": earned_points,
        "applicable_max_points": applicable_max,
        "normalized_score": normalized,
        "coverage_percent": coverage,
    }
    for field, expected in expected_summary.items():
        actual = summary.get(field)
        if actual is None or not approx_equal(actual, expected):
            errors.append(f"score_summary.{field} must be {expected:.2f}, got {actual}")

    expected_band = interpretation_for(normalized)
    if summary.get("interpretation_band") != expected_band:
        errors.append(
            "score_summary.interpretation_band must be "
            f"{expected_band}, got {summary.get('interpretation_band')}"
        )

    if report.get("status") == "published":
        review = report.get("review", {})
        if review.get("publication_gate_passed") is not True:
            errors.append("published report requires publication_gate_passed=true")
        if len(report.get("disclaimer", "")) < 100:
            errors.append("published report requires a substantive disclaimer")
        unverified = [
            item.get("evidence_id")
            for item in evidence
            if item.get("review_status") != "verified"
        ]
        if unverified:
            errors.append(
                f"published report contains unverified evidence: {sorted(unverified)}"
            )

    return errors


def report_paths(explicit_paths: list[str]) -> list[Path]:
    if explicit_paths:
        return [Path(path).resolve() for path in explicit_paths]
    return sorted((ROOT / "reports").glob("**/*.json")) + sorted(
        (ROOT / "examples").glob("*.json")
    )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("paths", nargs="*", help="Optional report JSON paths")
    args = parser.parse_args()

    schema = load_json(SCHEMA_PATH)
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema, format_checker=FormatChecker())

    paths = report_paths(args.paths)
    if not paths:
        print("No report JSON files found.")
        return 1

    failed = False
    for path in paths:
        try:
            report = load_json(path)
        except ValueError as exc:
            print(f"FAIL {path.relative_to(ROOT)}: {exc}")
            failed = True
            continue

        schema_errors = sorted(validator.iter_errors(report), key=lambda item: list(item.path))
        cross_errors = validate_cross_fields(report)
        errors = [
            f"schema {'.'.join(map(str, error.path)) or '<root>'}: {error.message}"
            for error in schema_errors
        ] + cross_errors

        if errors:
            failed = True
            print(f"FAIL {path.relative_to(ROOT)}")
            for error in errors:
                print(f"  - {error}")
        else:
            summary = report["score_summary"]
            print(
                f"PASS {path.relative_to(ROOT)} — "
                f"score={summary['normalized_score']:.2f}, "
                f"coverage={summary['coverage_percent']:.2f}%"
            )

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
