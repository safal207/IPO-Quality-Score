import { ScoreBadge } from "./ScoreBadge";
import type { ReportSummary } from "../types";

interface ReportCardProps {
  report: ReportSummary;
  selected: boolean;
  onSelect: (reportId: string) => void;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

export function ReportCard({ report, selected, onSelect }: ReportCardProps) {
  const ticker = report.ticker ?? "PRIVATE";

  return (
    <button
      type="button"
      className={`report-card${selected ? " report-card--selected" : ""}`}
      onClick={() => onSelect(report.report_id)}
      aria-pressed={selected}
    >
      <ScoreBadge
        score={report.normalized_score}
        coverage={report.coverage_percent}
      />
      <span className="report-card__content">
        <span className="report-card__eyebrow">
          <strong>{ticker}</strong>
          <span>{report.exchange}</span>
        </span>
        <span className="report-card__title">{report.issuer_name}</span>
        <span className="report-card__meta">
          <span>{formatDate(report.filing_published_at)}</span>
          <span>{report.overall_confidence} confidence</span>
          {!report.is_latest ? <span className="pill pill--muted">superseded</span> : null}
        </span>
      </span>
      <span className="report-card__arrow" aria-hidden="true">
        →
      </span>
    </button>
  );
}
