import { useEffect, useMemo, useState } from "react";
import { getReport, getReportProvenance, getReports } from "./api";
import { ReportCard } from "./components/ReportCard";
import { ScoreBadge } from "./components/ScoreBadge";
import type {
  ReportDetail,
  ReportDimension,
  ReportProvenance,
  ReportSignal,
  ReportSummary,
} from "./types";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function humanize(value: string): string {
  return value.replaceAll("_", " ");
}

function severityClass(severity: string): string {
  const normalized = severity.toLowerCase();
  if (["low", "medium", "high", "critical"].includes(normalized)) {
    return normalized;
  }
  return "medium";
}

function DimensionRow({ dimension }: { dimension: ReportDimension }) {
  const percentage =
    dimension.max_points > 0
      ? Math.round((dimension.earned_points / dimension.max_points) * 100)
      : 0;

  return (
    <article className="dimension-row">
      <div className="dimension-row__header">
        <div>
          <h4>{dimension.name}</h4>
          <span>{humanize(dimension.status)}</span>
        </div>
        <strong>
          {dimension.earned_points}/{dimension.max_points}
        </strong>
      </div>
      <div className="dimension-row__track" aria-hidden="true">
        <span style={{ width: `${percentage}%` }} />
      </div>
      <p>{dimension.judgment}</p>
    </article>
  );
}

function SignalCard({ signal, kind }: { signal: ReportSignal; kind: "risk" | "positive" }) {
  return (
    <article className={`signal-card signal-card--${kind}`}>
      <div className="signal-card__header">
        <h4>{signal.title}</h4>
        <span className={`severity severity--${severityClass(signal.severity)}`}>
          {signal.severity}
        </span>
      </div>
      <p>{signal.explanation}</p>
    </article>
  );
}

function EmptyDetail() {
  return (
    <section className="detail-panel detail-panel--empty">
      <div className="empty-symbol">IQ</div>
      <h2>Select an IPO report</h2>
      <p>Choose a company to inspect its score, evidence coverage, risks, and source provenance.</p>
    </section>
  );
}

function DetailPanel({
  detail,
  provenance,
  loading,
  error,
}: {
  detail: ReportDetail | null;
  provenance: ReportProvenance | null;
  loading: boolean;
  error: string | null;
}) {
  if (loading) {
    return (
      <section className="detail-panel detail-panel--empty" aria-live="polite">
        <div className="spinner" />
        <h2>Loading evidence graph</h2>
        <p>Fetching the complete report and its exact filing provenance.</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="detail-panel detail-panel--empty" role="alert">
        <div className="empty-symbol">!</div>
        <h2>Report detail unavailable</h2>
        <p>{error}</p>
      </section>
    );
  }

  if (!detail) {
    return <EmptyDetail />;
  }

  const { summary, document } = detail;
  const dimensions = document.dimensions ?? [];
  const risks = document.red_flags ?? [];
  const positives = document.positive_signals ?? [];
  const unknowns = document.unknowns ?? [];
  const evidence = document.evidence ?? [];
  const filingState = provenance
    ? provenance.filing_version.is_current
      ? "current"
      : "superseded"
    : "unavailable";

  return (
    <section className="detail-panel">
      <header className="detail-hero">
        <div className="detail-hero__copy">
          <div className="eyebrow-row">
            <span className="ticker">{summary.ticker ?? "PRIVATE"}</span>
            <span>{summary.exchange}</span>
            <span>{formatDate(summary.filing_published_at)}</span>
          </div>
          <h2>{summary.issuer_name}</h2>
          <p className="detail-hero__subtitle">
            Evidence-first IPO assessment. The score is a structured research judgment, not a return forecast.
          </p>
          <div className="pill-row">
            <span className="pill">{humanize(summary.status)}</span>
            <span className="pill">{summary.overall_confidence} confidence</span>
            <span className="pill">methodology {summary.methodology_version}</span>
            {!summary.is_latest ? <span className="pill pill--warning">superseded</span> : null}
          </div>
        </div>
        <ScoreBadge
          score={summary.normalized_score}
          coverage={summary.coverage_percent}
          size="large"
        />
      </header>

      <div className="detail-grid detail-grid--summary">
        <article className="metric-card">
          <span>Evidence coverage</span>
          <strong>{Math.round(summary.coverage_percent)}%</strong>
          <small>Referenced claims with evidence</small>
        </article>
        <article className="metric-card">
          <span>Interpretation</span>
          <strong className="metric-card__text">
            {humanize(document.score_summary.interpretation_band)}
          </strong>
          <small>{document.score_summary.earned_points} earned points</small>
        </article>
        <article className="metric-card">
          <span>Source snapshots</span>
          <strong>{provenance?.sources.length ?? "—"}</strong>
          <small>Deduplicated filing evidence</small>
        </article>
        <article className="metric-card">
          <span>Filing state</span>
          <strong className="metric-card__text">{filingState}</strong>
          <small>{provenance?.filing_version.version_label ?? "Provenance unavailable"}</small>
        </article>
      </div>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Score anatomy</span>
            <h3>Ten-dimension assessment</h3>
          </div>
          <span>{dimensions.length} dimensions</span>
        </div>
        <div className="dimension-list">
          {dimensions.map((dimension) => (
            <DimensionRow key={dimension.id} dimension={dimension} />
          ))}
        </div>
      </section>

      <div className="detail-grid detail-grid--signals">
        <section className="content-section content-section--nested">
          <div className="section-heading">
            <div>
              <span className="section-kicker section-kicker--risk">Risk ledger</span>
              <h3>Red flags</h3>
            </div>
            <span>{risks.length}</span>
          </div>
          <div className="signal-list">
            {risks.length > 0 ? (
              risks.map((signal) => (
                <SignalCard key={signal.title} signal={signal} kind="risk" />
              ))
            ) : (
              <p className="muted-copy">No red flags were recorded in this report.</p>
            )}
          </div>
        </section>

        <section className="content-section content-section--nested">
          <div className="section-heading">
            <div>
              <span className="section-kicker section-kicker--positive">Strength ledger</span>
              <h3>Positive signals</h3>
            </div>
            <span>{positives.length}</span>
          </div>
          <div className="signal-list">
            {positives.length > 0 ? (
              positives.map((signal) => (
                <SignalCard key={signal.title} signal={signal} kind="positive" />
              ))
            ) : (
              <p className="muted-copy">No positive signals were recorded in this report.</p>
            )}
          </div>
        </section>
      </div>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Known unknowns</span>
            <h3>What remains unresolved</h3>
          </div>
          <span>{unknowns.length}</span>
        </div>
        <ol className="unknown-list">
          {unknowns.map((unknown) => (
            <li key={unknown}>{unknown}</li>
          ))}
        </ol>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Audit trail</span>
            <h3>Evidence and provenance</h3>
          </div>
          <span>{evidence.length} evidence items</span>
        </div>
        <div className="evidence-list">
          {evidence.slice(0, 6).map((item) => (
            <article className="evidence-item" key={item.evidence_id}>
              <div className="evidence-item__header">
                <span>{item.evidence_id}</span>
                <span>{item.review_status}</span>
              </div>
              <h4>{item.source_title}</h4>
              <p>{item.extracted_fact}</p>
              <div className="evidence-item__footer">
                <span>{item.location ?? item.source_type}</span>
                <a href={item.source_url} target="_blank" rel="noopener noreferrer">
                  Open source ↗
                </a>
              </div>
            </article>
          ))}
        </div>
        {provenance ? (
          <footer className="provenance-footer">
            <div>
              <span>Filing hash</span>
              <code>{provenance.filing_version.source_hash.slice(0, 16)}…</code>
            </div>
            <div>
              <span>Report hash</span>
              <code>{detail.source_hash.slice(0, 16)}…</code>
            </div>
            <div>
              <span>Imported</span>
              <strong>{formatDate(detail.imported_at)}</strong>
            </div>
          </footer>
        ) : null}
      </section>
    </section>
  );
}

export default function App() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ReportDetail | null>(null);
  const [provenance, setProvenance] = useState<ReportProvenance | null>(null);
  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setListLoading(true);
    setListError(null);

    void getReports({ minScore, limit: 100 }, controller.signal)
      .then((response) => {
        setReports(response.items);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        setReports([]);
        setSelectedId(null);
        setListError(reason instanceof Error ? reason.message : "Unable to load IPO reports");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setListLoading(false);
        }
      });

    return () => controller.abort();
  }, [minScore]);

  const visibleReports = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) {
      return reports;
    }
    return reports.filter((report) =>
      `${report.issuer_name} ${report.ticker ?? ""} ${report.exchange}`
        .toLowerCase()
        .includes(needle),
    );
  }, [reports, search]);

  useEffect(() => {
    if (listLoading) {
      return;
    }
    setSelectedId((current) => {
      if (current && visibleReports.some((item) => item.report_id === current)) {
        return current;
      }
      return visibleReports[0]?.report_id ?? null;
    });
  }, [listLoading, visibleReports]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setProvenance(null);
      setDetailError(null);
      setDetailLoading(false);
      return;
    }

    const controller = new AbortController();
    setDetail(null);
    setProvenance(null);
    setDetailLoading(true);
    setDetailError(null);

    void Promise.all([
      getReport(selectedId, controller.signal),
      getReportProvenance(selectedId, controller.signal),
    ])
      .then(([nextDetail, nextProvenance]) => {
        setDetail(nextDetail);
        setProvenance(nextProvenance);
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        setDetail(null);
        setProvenance(null);
        setDetailError(reason instanceof Error ? reason.message : "Unable to load report detail");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setDetailLoading(false);
        }
      });

    return () => controller.abort();
  }, [selectedId]);

  const averageScore =
    reports.length > 0
      ? Math.round(reports.reduce((sum, report) => sum + report.normalized_score, 0) / reports.length)
      : 0;
  const averageCoverage =
    reports.length > 0
      ? Math.round(reports.reduce((sum, report) => sum + report.coverage_percent, 0) / reports.length)
      : 0;

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="IPO Quality Score home">
          <span className="brand__mark">IQ</span>
          <span>
            <strong>IPO Quality Score</strong>
            <small>Evidence before narrative</small>
          </span>
        </a>
        <nav className="site-header__nav" aria-label="Primary navigation">
          <a href="#reports">Reports</a>
          <a href="#methodology">Methodology</a>
          <span className="tech-pill">TS 7 · React 19</span>
        </nav>
      </header>

      <main id="top">
        <section className="overview">
          <div className="overview__copy">
            <span className="hero-kicker">Public-market research infrastructure</span>
            <h1>See the IPO beneath the pitch.</h1>
            <p>
              Compare business quality, offering alignment, governance, dilution, and evidence confidence without hiding uncertainty behind one number.
            </p>
          </div>
          <div className="overview__metrics" aria-label="Report metrics">
            <article>
              <span>Reports</span>
              <strong>{reports.length}</strong>
            </article>
            <article>
              <span>Average score</span>
              <strong>{averageScore}</strong>
            </article>
            <article>
              <span>Evidence coverage</span>
              <strong>{averageCoverage}%</strong>
            </article>
          </div>
        </section>

        <section className="workspace" id="reports">
          <aside className="report-sidebar">
            <div className="sidebar-heading">
              <div>
                <span className="section-kicker">Research set</span>
                <h2>IPO reports</h2>
              </div>
              <span>{visibleReports.length}</span>
            </div>

            <label className="search-field">
              <span>Search issuer or ticker</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="LIFE, ITG…"
              />
            </label>

            <label className="score-filter">
              <span>
                Minimum score <strong>{minScore}</strong>
              </span>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={minScore}
                onChange={(event) => setMinScore(Number(event.target.value))}
              />
            </label>

            {listError ? (
              <div className="error-banner" role="alert">
                <strong>Report list unavailable</strong>
                <span>{listError}</span>
              </div>
            ) : null}

            <div className="report-list" aria-busy={listLoading}>
              {listLoading ? (
                <div className="list-loading">
                  <div className="spinner" />
                  <span>Loading reports…</span>
                </div>
              ) : visibleReports.length > 0 ? (
                visibleReports.map((report) => (
                  <ReportCard
                    key={report.report_id}
                    report={report}
                    selected={selectedId === report.report_id}
                    onSelect={setSelectedId}
                  />
                ))
              ) : (
                <div className="list-empty">
                  <strong>No matching IPOs</strong>
                  <span>Lower the score threshold or clear the search.</span>
                </div>
              )}
            </div>
          </aside>

          <DetailPanel
            detail={detail}
            provenance={provenance}
            loading={detailLoading}
            error={detailError}
          />
        </section>

        <section className="methodology-strip" id="methodology">
          <div>
            <span className="section-kicker">Methodology boundary</span>
            <h2>Score, coverage, and confidence stay separate.</h2>
          </div>
          <p>
            A high score with weak evidence is not treated as certainty. Superseded filings and reports remain visible instead of being silently overwritten.
          </p>
        </section>
      </main>

      <footer className="site-footer">
        <span>IPO Quality Score · research and educational information</span>
        <span>Not investment advice or a prediction of returns</span>
      </footer>
    </div>
  );
}
