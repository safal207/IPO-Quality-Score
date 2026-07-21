import type {
  EvidenceItem,
  FilingSummary,
  FilingVersionSummary,
  IssuerSummary,
  ReportDetail,
  ReportDimension,
  ReportDocument,
  ReportListResponse,
  ReportProvenance,
  ReportSignal,
  ReportSummary,
  SourceSnapshotSummary,
} from "./types";

type JsonRecord = Record<string, unknown>;

export class ContractError extends Error {
  constructor(path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = "ContractError";
  }
}

function record(value: unknown, path: string): JsonRecord {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new ContractError(path, "expected an object");
  }
  return value as JsonRecord;
}

function stringValue(value: unknown, path: string): string {
  if (typeof value !== "string") {
    throw new ContractError(path, "expected a string");
  }
  return value;
}

function nullableString(value: unknown, path: string): string | null {
  if (value === null) {
    return null;
  }
  return stringValue(value, path);
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

function arrayValue(value: unknown, path: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new ContractError(path, "expected an array");
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

function field(source: JsonRecord, key: string, path: string): unknown {
  if (!(key in source)) {
    throw new ContractError(`${path}.${key}`, "missing required field");
  }
  return source[key];
}

function parseSummary(value: unknown, path = "report"): ReportSummary {
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

function parseDimension(value: unknown, path: string): ReportDimension {
  const source = record(value, path);
  return {
    id: stringValue(field(source, "id", path), `${path}.id`),
    name: stringValue(field(source, "name", path), `${path}.name`),
    status: stringValue(field(source, "status", path), `${path}.status`),
    max_points: numberValue(field(source, "max_points", path), `${path}.max_points`),
    earned_points: numberValue(field(source, "earned_points", path), `${path}.earned_points`),
    confidence: stringValue(field(source, "confidence", path), `${path}.confidence`),
    judgment: stringValue(field(source, "judgment", path), `${path}.judgment`),
  };
}

function parseSignal(value: unknown, path: string): ReportSignal {
  const source = record(value, path);
  const evidenceIds = source.evidence_ids;
  return {
    title: stringValue(field(source, "title", path), `${path}.title`),
    severity: stringValue(field(source, "severity", path), `${path}.severity`),
    explanation: stringValue(field(source, "explanation", path), `${path}.explanation`),
    ...(evidenceIds === undefined
      ? {}
      : {
          evidence_ids: arrayValue(evidenceIds, `${path}.evidence_ids`).map((item, index) =>
            stringValue(item, `${path}.evidence_ids[${index}]`),
          ),
        }),
  };
}

function parseEvidence(value: unknown, path: string): EvidenceItem {
  const source = record(value, path);
  const sourceVersion = source.source_version;
  const location = source.location;
  return {
    evidence_id: stringValue(field(source, "evidence_id", path), `${path}.evidence_id`),
    source_title: stringValue(field(source, "source_title", path), `${path}.source_title`),
    source_type: stringValue(field(source, "source_type", path), `${path}.source_type`),
    source_url: externalUrl(field(source, "source_url", path), `${path}.source_url`),
    ...(sourceVersion === undefined
      ? {}
      : { source_version: nullableString(sourceVersion, `${path}.source_version`) }),
    ...(location === undefined ? {} : { location: nullableString(location, `${path}.location`) }),
    extracted_fact: stringValue(field(source, "extracted_fact", path), `${path}.extracted_fact`),
    confidence: stringValue(field(source, "confidence", path), `${path}.confidence`),
    review_status: stringValue(field(source, "review_status", path), `${path}.review_status`),
  };
}

function optionalArray<T>(
  source: JsonRecord,
  key: string,
  path: string,
  parser: (value: unknown, itemPath: string) => T,
): T[] | undefined {
  const value = source[key];
  if (value === undefined) {
    return undefined;
  }
  return arrayValue(value, `${path}.${key}`).map((item, index) =>
    parser(item, `${path}.${key}[${index}]`),
  );
}

function parseDocument(value: unknown, path = "document"): ReportDocument {
  const source = record(value, path);
  const score = record(field(source, "score_summary", path), `${path}.score_summary`);
  const dimensions = optionalArray(source, "dimensions", path, parseDimension);
  const redFlags = optionalArray(source, "red_flags", path, parseSignal);
  const positiveSignals = optionalArray(source, "positive_signals", path, parseSignal);
  const evidence = optionalArray(source, "evidence", path, parseEvidence);
  const unknowns = source.unknowns;

  return {
    report_id: stringValue(field(source, "report_id", path), `${path}.report_id`),
    status: stringValue(field(source, "status", path), `${path}.status`),
    score_summary: {
      earned_points: numberValue(
        field(score, "earned_points", `${path}.score_summary`),
        `${path}.score_summary.earned_points`,
      ),
      applicable_max_points: numberValue(
        field(score, "applicable_max_points", `${path}.score_summary`),
        `${path}.score_summary.applicable_max_points`,
      ),
      normalized_score: numberValue(
        field(score, "normalized_score", `${path}.score_summary`),
        `${path}.score_summary.normalized_score`,
      ),
      coverage_percent: numberValue(
        field(score, "coverage_percent", `${path}.score_summary`),
        `${path}.score_summary.coverage_percent`,
      ),
      interpretation_band: stringValue(
        field(score, "interpretation_band", `${path}.score_summary`),
        `${path}.score_summary.interpretation_band`,
      ),
    },
    ...(dimensions === undefined ? {} : { dimensions }),
    ...(redFlags === undefined ? {} : { red_flags: redFlags }),
    ...(positiveSignals === undefined ? {} : { positive_signals: positiveSignals }),
    ...(unknowns === undefined
      ? {}
      : {
          unknowns: arrayValue(unknowns, `${path}.unknowns`).map((item, index) =>
            stringValue(item, `${path}.unknowns[${index}]`),
          ),
        }),
    ...(evidence === undefined ? {} : { evidence }),
  };
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

function parseFilingVersion(value: unknown, path: string): FilingVersionSummary {
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

function parseSource(value: unknown, path: string): SourceSnapshotSummary {
  const source = record(value, path);
  return {
    id: integerValue(field(source, "id", path), `${path}.id`),
    source_type: stringValue(field(source, "source_type", path), `${path}.source_type`),
    source_title: stringValue(field(source, "source_title", path), `${path}.source_title`),
    source_url: externalUrl(field(source, "source_url", path), `${path}.source_url`),
    source_version: nullableString(field(source, "source_version", path), `${path}.source_version`),
    published_at: dateString(field(source, "published_at", path), `${path}.published_at`),
    accessed_at: dateString(field(source, "accessed_at", path), `${path}.accessed_at`),
    content_hash: stringValue(field(source, "content_hash", path), `${path}.content_hash`),
  };
}

export function parseReportListResponse(value: unknown): ReportListResponse {
  const source = record(value, "response");
  return {
    items: arrayValue(field(source, "items", "response"), "response.items").map((item, index) =>
      parseSummary(item, `response.items[${index}]`),
    ),
    total: integerValue(field(source, "total", "response"), "response.total"),
    limit: integerValue(field(source, "limit", "response"), "response.limit"),
    offset: integerValue(field(source, "offset", "response"), "response.offset"),
  };
}

export function parseReportDetail(value: unknown): ReportDetail {
  const source = record(value, "response");
  return {
    summary: parseSummary(field(source, "summary", "response"), "response.summary"),
    document: parseDocument(field(source, "document", "response"), "response.document"),
    source_hash: stringValue(field(source, "source_hash", "response"), "response.source_hash"),
    imported_at: dateString(field(source, "imported_at", "response"), "response.imported_at"),
  };
}

export function parseReportProvenance(value: unknown): ReportProvenance {
  const source = record(value, "response");
  return {
    report: parseSummary(field(source, "report", "response"), "response.report"),
    issuer: parseIssuer(field(source, "issuer", "response"), "response.issuer"),
    filing: parseFiling(field(source, "filing", "response"), "response.filing"),
    filing_version: parseFilingVersion(
      field(source, "filing_version", "response"),
      "response.filing_version",
    ),
    sources: arrayValue(field(source, "sources", "response"), "response.sources").map(
      (item, index) => parseSource(item, `response.sources[${index}]`),
    ),
  };
}
