import type {
  FilingHistoryResponse,
  FilingSummary,
  FilingVersionSummary,
  IssuerSummary,
  ReportSummary,
} from "./types";
import { ContractError } from "./contracts";

type JsonRecord = Record<string, unknown>;

function record(value: unknown, path: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ContractError(path, "expected an object");
  }
  return value as JsonRecord;
}

function field(source: JsonRecord, key: string, path: string): unknown {
  if (!(key in source)) {
    throw new ContractError(`${path}.${key}`, "missing required field");
  }
  return source[key];
}

function stringValue(value: unknown, path: string): string {
  if (typeof value !== "string") {
    throw new ContractError(path, "expected a string");
  }
  return value;
}

function nullableString(value: unknown, path: string): string | null {
  return value === null ? null : stringValue(value, path);
}

function numberValue(value: unknown, path: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ContractError(path, "expected a finite number");
  }
  return value;
}

function integerValue(value: unknown, path: string): number {
  const parsed = numberValue(value, path);
  if (!Number.isInteger(parsed)) {
    throw new ContractError(path, "expected an integer");
  }
  return parsed;
}

function booleanValue(value: unknown, path: string): boolean {
  if (typeof value !== "boolean") {
    throw new ContractError(path, "expected a boolean");
  }
  return value;
}

function dateString(value: unknown, path: string): string {
  const parsed = stringValue(value, path);
  if (Number.isNaN(Date.parse(parsed))) {
    throw new ContractError(path, "expected an ISO-compatible date string");
  }
  return parsed;
}

function externalUrl(value: unknown, path: string): string {
  const parsed = stringValue(value, path);
  let url: URL;
  try {
    url = new URL(parsed);
  } catch {
    throw new ContractError(path, "expected an absolute URL");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new ContractError(path, "only http and https URLs are allowed");
  }
  return parsed;
}

function arrayValue(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new ContractError(path, "expected an array");
  }
  return value;
}

function parseIssuer(value: unknown, path: string): IssuerSummary {
  const source = record(value, path);
  return {
    id: integerValue(field(source, "id", path), `${path}.id`),
    legal_name: stringValue(field(source, "legal_name", path), `${path}.legal_name`),
    brand_name: nullableString(field(source, "brand_name", path), `${path}.brand_name`),
    country: stringValue(field(source, "country", path), `${path}.country`),
    industry: stringValue(field(source, "industry", path), `${path}.industry`),
    website: nullableString(field(source, "website", path), `${path}.website`),
  };
}

function parseFiling(value: unknown, path: string): FilingSummary {
  const source = record(value, path);
  return {
    id: integerValue(field(source, "id", path), `${path}.id`),
    filing_type: stringValue(field(source, "filing_type", path), `${path}.filing_type`),
    exchange: stringValue(field(source, "exchange", path), `${path}.exchange`),
    ticker: nullableString(field(source, "ticker", path), `${path}.ticker`),
  };
}

function parseVersion(value: unknown, path: string): FilingVersionSummary {
  const source = record(value, path);
  const supersedes = field(source, "supersedes_id", path);
  return {
    id: integerValue(field(source, "id", path), `${path}.id`),
    version_label: stringValue(field(source, "version_label", path), `${path}.version_label`),
    published_at: dateString(field(source, "published_at", path), `${path}.published_at`),
    source_accessed_at: dateString(
      field(source, "source_accessed_at", path),
      `${path}.source_accessed_at`,
    ),
    source_url: externalUrl(field(source, "source_url", path), `${path}.source_url`),
    source_hash: stringValue(field(source, "source_hash", path), `${path}.source_hash`),
    is_current: booleanValue(field(source, "is_current", path), `${path}.is_current`),
    supersedes_id: supersedes === null ? null : integerValue(supersedes, `${path}.supersedes_id`),
  };
}

function parseReport(value: unknown, path: string): ReportSummary {
  const source = record(value, path);
  return {
    report_id: stringValue(field(source, "report_id", path), `${path}.report_id`),
    report_version: stringValue(field(source, "report_version", path), `${path}.report_version`),
    methodology_version: stringValue(
      field(source, "methodology_version", path),
      `${path}.methodology_version`,
    ),
    status: stringValue(field(source, "status", path), `${path}.status`),
    issuer_name: stringValue(field(source, "issuer_name", path), `${path}.issuer_name`),
    ticker: nullableString(field(source, "ticker", path), `${path}.ticker`),
    exchange: stringValue(field(source, "exchange", path), `${path}.exchange`),
    filing_published_at: dateString(
      field(source, "filing_published_at", path),
      `${path}.filing_published_at`,
    ),
    normalized_score: numberValue(
      field(source, "normalized_score", path),
      `${path}.normalized_score`,
    ),
    coverage_percent: numberValue(
      field(source, "coverage_percent", path),
      `${path}.coverage_percent`,
    ),
    overall_confidence: stringValue(
      field(source, "overall_confidence", path),
      `${path}.overall_confidence`,
    ),
    supersedes_report_id: nullableString(
      field(source, "supersedes_report_id", path),
      `${path}.supersedes_report_id`,
    ),
    is_latest: booleanValue(field(source, "is_latest", path), `${path}.is_latest`),
  };
}

export function parseFilingHistory(value: unknown): FilingHistoryResponse {
  const source = record(value, "response");
  return {
    issuer: parseIssuer(field(source, "issuer", "response"), "response.issuer"),
    filing: parseFiling(field(source, "filing", "response"), "response.filing"),
    versions: arrayValue(field(source, "versions", "response"), "response.versions").map(
      (item, index) => parseVersion(item, `response.versions[${index}]`),
    ),
    reports: arrayValue(field(source, "reports", "response"), "response.reports").map(
      (item, index) => parseReport(item, `response.reports[${index}]`),
    ),
  };
}
