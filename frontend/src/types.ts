export type Confidence = "low" | "medium" | "high" | string;
export type Severity = "low" | "medium" | "high" | "critical" | string;

export interface ReportSummary {
  report_id: string;
  report_version: string;
  methodology_version: string;
  status: string;
  issuer_name: string;
  ticker: string | null;
  exchange: string;
  filing_published_at: string;
  normalized_score: number;
  coverage_percent: number;
  overall_confidence: Confidence;
  supersedes_report_id: string | null;
  is_latest: boolean;
}

export interface ReportListResponse {
  items: ReportSummary[];
  total: number;
  limit: number;
  offset: number;
}

export interface ReportDimension {
  id: string;
  name: string;
  status: string;
  max_points: number;
  earned_points: number;
  confidence: Confidence;
  judgment: string;
}

export interface ReportSignal {
  title: string;
  severity: Severity;
  explanation: string;
  evidence_ids?: string[];
}

export interface EvidenceItem {
  evidence_id: string;
  source_title: string;
  source_type: string;
  source_url: string;
  source_version?: string | null;
  location?: string | null;
  extracted_fact: string;
  confidence: Confidence;
  review_status: string;
}

export interface ReportDocument {
  report_id: string;
  status: string;
  score_summary: {
    earned_points: number;
    applicable_max_points: number;
    normalized_score: number;
    coverage_percent: number;
    interpretation_band: string;
  };
  dimensions?: ReportDimension[];
  red_flags?: ReportSignal[];
  positive_signals?: ReportSignal[];
  unknowns?: string[];
  evidence?: EvidenceItem[];
}

export interface ReportDetail {
  summary: ReportSummary;
  document: ReportDocument;
  source_hash: string;
  imported_at: string;
}

export interface IssuerSummary {
  id: number;
  legal_name: string;
  brand_name: string | null;
  country: string;
  industry: string;
  website: string | null;
}

export interface FilingSummary {
  id: number;
  filing_type: string;
  exchange: string;
  ticker: string | null;
}

export interface FilingVersionSummary {
  id: number;
  version_label: string;
  published_at: string;
  source_accessed_at: string;
  source_url: string;
  source_hash: string;
  is_current: boolean;
  supersedes_id: number | null;
}

export interface SourceSnapshotSummary {
  id: number;
  source_type: string;
  source_title: string;
  source_url: string;
  source_version: string | null;
  published_at: string;
  accessed_at: string;
  content_hash: string;
}

export interface ReportProvenance {
  report: ReportSummary;
  issuer: IssuerSummary;
  filing: FilingSummary;
  filing_version: FilingVersionSummary;
  sources: SourceSnapshotSummary[];
}
