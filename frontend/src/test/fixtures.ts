import type {
  ReportDetail,
  ReportListResponse,
  ReportProvenance,
  ReportSummary,
} from "../types";

export const ethosSummary: ReportSummary = {
  report_id: "ethos-2026-01-30-424b4-v0.1",
  report_version: "0.1.0",
  methodology_version: "0.1",
  status: "draft",
  issuer_name: "Ethos Technologies Inc.",
  ticker: "LIFE",
  exchange: "Nasdaq Global Select Market",
  filing_published_at: "2026-01-30T00:00:00Z",
  normalized_score: 61,
  coverage_percent: 100,
  overall_confidence: "medium",
  supersedes_report_id: null,
  is_latest: true,
};

export const itgSummary: ReportSummary = {
  report_id: "itg-2026-07-01-424b4-v0.2",
  report_version: "0.2.0",
  methodology_version: "0.1",
  status: "draft",
  issuer_name: "ITG Incorporated",
  ticker: "ITG",
  exchange: "New York Stock Exchange",
  filing_published_at: "2026-07-01T00:00:00Z",
  normalized_score: 55,
  coverage_percent: 100,
  overall_confidence: "medium",
  supersedes_report_id: null,
  is_latest: true,
};

export const reportsResponse: ReportListResponse = {
  items: [ethosSummary, itgSummary],
  total: 2,
  limit: 100,
  offset: 0,
};

function detailFor(summary: ReportSummary): ReportDetail {
  return {
    summary,
    document: {
      report_id: summary.report_id,
      status: summary.status,
      score_summary: {
        earned_points: summary.normalized_score,
        applicable_max_points: 100,
        normalized_score: summary.normalized_score,
        coverage_percent: summary.coverage_percent,
        interpretation_band: "meaningful_risks",
      },
      dimensions: [
        {
          id: "revenue_durability",
          name: "Revenue growth and durability",
          status: "scored",
          max_points: 15,
          earned_points: 10,
          confidence: "medium",
          judgment: "Growth is attractive but concentration remains material.",
        },
      ],
      red_flags: [
        {
          title: "Customer concentration",
          severity: "high",
          explanation: "A small number of counterparties represent a material share of revenue.",
          evidence_ids: ["EV-001"],
        },
      ],
      positive_signals: [
        {
          title: "Profitable growth",
          severity: "medium",
          explanation: "The company combines revenue growth with positive earnings.",
          evidence_ids: ["EV-001"],
        },
      ],
      unknowns: ["Independent peer benchmarking remains incomplete."],
      evidence: [
        {
          evidence_id: "EV-001",
          source_title: `${summary.issuer_name} final prospectus`,
          source_type: "regulatory_filing",
          source_url: "https://www.sec.gov/example",
          source_version: "Filed 2026-01-30",
          location: "Prospectus summary",
          extracted_fact: "The filing reports revenue growth and positive net income.",
          confidence: "high",
          review_status: "verified",
        },
      ],
    },
    source_hash: `${summary.report_id}-hash`,
    imported_at: "2026-07-21T10:00:00Z",
  };
}

function provenanceFor(summary: ReportSummary, id: number): ReportProvenance {
  return {
    report: summary,
    issuer: {
      id,
      legal_name: summary.issuer_name,
      brand_name: summary.ticker,
      country: "United States",
      industry: "Technology",
      website: null,
    },
    filing: {
      id,
      filing_type: "424B4",
      exchange: summary.exchange,
      ticker: summary.ticker,
    },
    filing_version: {
      id,
      version_label: "Final prospectus",
      published_at: summary.filing_published_at,
      source_accessed_at: "2026-07-21T09:30:00Z",
      source_url: "https://www.sec.gov/example",
      source_hash: `${summary.report_id}-filing-hash`,
      is_current: true,
      supersedes_id: null,
    },
    sources: [
      {
        id,
        source_type: "regulatory_filing",
        source_title: `${summary.issuer_name} final prospectus`,
        source_url: "https://www.sec.gov/example",
        source_version: "Filed 2026-01-30",
        published_at: summary.filing_published_at,
        accessed_at: "2026-07-21T09:30:00Z",
        content_hash: `${summary.report_id}-source-hash`,
      },
    ],
  };
}

export const detailsById: Record<string, ReportDetail> = {
  [ethosSummary.report_id]: detailFor(ethosSummary),
  [itgSummary.report_id]: detailFor(itgSummary),
};

export const provenanceById: Record<string, ReportProvenance> = {
  [ethosSummary.report_id]: provenanceFor(ethosSummary, 1),
  [itgSummary.report_id]: provenanceFor(itgSummary, 2),
};
