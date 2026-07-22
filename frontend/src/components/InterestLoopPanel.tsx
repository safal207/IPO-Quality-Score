import { useEffect, useMemo, useState } from "react";
import {
  clearInterestSignals,
  INTEREST_SIGNAL_EVENT,
  readInterestSignals,
  recordInterestSignal,
  type InterestSignalCounts,
} from "../interest-signals";
import type { FilingHistoryResponse, ReportSummary } from "../types";
import { DimensionComprehensionLab } from "./DimensionComprehensionLab";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function signed(value: number): string {
  if (value > 0) {
    return `+${Math.round(value)}`;
  }
  return String(Math.round(value));
}

function scoreMovement(current: ReportSummary, previous: ReportSummary | null): string {
  if (!previous) {
    return "This is the first report in the available history, so there is no earlier score baseline.";
  }

  const scoreDelta = current.normalized_score - previous.normalized_score;
  const coverageDelta = current.coverage_percent - previous.coverage_percent;
  const direction = scoreDelta > 0 ? "increased" : scoreDelta < 0 ? "decreased" : "did not change";

  return `The normalized score ${direction} by ${Math.abs(Math.round(scoreDelta))} points. Evidence coverage moved ${signed(coverageDelta)} percentage points. This describes the change; it does not claim which filing fact caused it.`;
}

function latestReportForVersion(
  reports: ReportSummary[],
  publishedAt: string,
): ReportSummary | null {
  const matches = reports.filter((report) => report.filing_published_at === publishedAt);
  return matches.at(-1) ?? null;
}

export function InterestLoopPanel({
  selected,
  reports,
  history,
  loading,
  error,
}: {
  selected: ReportSummary | null;
  reports: ReportSummary[];
  history: FilingHistoryResponse | null;
  loading: boolean;
  error: string | null;
}) {
  const [signals, setSignals] = useState<InterestSignalCounts>(() => readInterestSignals());

  useEffect(() => {
    const update = (event: Event) => {
      const custom = event as CustomEvent<InterestSignalCounts>;
      setSignals(custom.detail);
    };
    window.addEventListener(INTEREST_SIGNAL_EVENT, update);
    return () => window.removeEventListener(INTEREST_SIGNAL_EVENT, update);
  }, []);

  const orderedReports = useMemo(
    () =>
      [...(history?.reports ?? [])].sort(
        (left, right) =>
          Date.parse(left.filing_published_at) - Date.parse(right.filing_published_at),
      ),
    [history],
  );
  const previousReport = useMemo(() => {
    if (!selected) {
      return null;
    }
    const explicit = selected.supersedes_report_id
      ? orderedReports.find((report) => report.report_id === selected.supersedes_report_id)
      : undefined;
    if (explicit) {
      return explicit;
    }
    const index = orderedReports.findIndex((report) => report.report_id === selected.report_id);
    return index > 0 ? orderedReports[index - 1] ?? null : null;
  }, [orderedReports, selected]);

  const totalSignals = Object.values(signals).reduce((sum, value) => sum + value, 0);

  return (
    <section className="interest-loop" id="interest-loop" aria-labelledby="interest-loop-heading">
      <header className="interest-loop__header">
        <div>
          <span className="section-kicker">Interest Time Vector</span>
          <h2 id="interest-loop-heading">Follow the idea through time.</h2>
        </div>
        <p>
          Compare alternatives, inspect amendments, and keep implementation evidence separate from
          unproven market interest.
        </p>
      </header>

      <div className="interest-loop__grid">
        <article className="interest-card interest-card--wide">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Filing timeline</span>
              <h3>What changed, and when?</h3>
            </div>
            <span>{history?.versions.length ?? 0} versions</span>
          </div>

          {loading ? <p className="muted-copy">Loading filing history…</p> : null}
          {error ? <p className="inline-error" role="alert">{error}</p> : null}
          {!loading && !error && history ? (
            <details
              className="timeline-disclosure"
              onToggle={(event) => {
                if (event.currentTarget.open) {
                  recordInterestSignal("history_inspected");
                }
              }}
            >
              <summary>Inspect {history.filing.filing_type} history</summary>
              <ol className="filing-timeline">
                {history.versions.map((version) => {
                  const report = latestReportForVersion(orderedReports, version.published_at);
                  return (
                    <li key={version.id}>
                      <span className="timeline-dot" aria-hidden="true" />
                      <div>
                        <div className="timeline-title">
                          <strong>{version.version_label}</strong>
                          <span className={version.is_current ? "pill" : "pill pill--warning"}>
                            {version.is_current ? "current" : "superseded"}
                          </span>
                        </div>
                        <span>{formatDate(version.published_at)}</span>
                        {report ? (
                          <p>
                            Report {report.report_version}: score {Math.round(report.normalized_score)},
                            coverage {Math.round(report.coverage_percent)}%.
                          </p>
                        ) : (
                          <p>No report is linked to this filing version in the current dataset.</p>
                        )}
                        <a href={version.source_url} target="_blank" rel="noopener noreferrer">
                          Open filing ↗
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </details>
          ) : null}
        </article>

        <article className="interest-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Score movement</span>
              <h3>Descriptive change</h3>
            </div>
          </div>
          {selected ? (
            <>
              <div className="score-movement">
                <strong>{previousReport ? Math.round(previousReport.normalized_score) : "—"}</strong>
                <span aria-hidden="true">→</span>
                <strong>{Math.round(selected.normalized_score)}</strong>
              </div>
              <p>{scoreMovement(selected, previousReport)}</p>
            </>
          ) : (
            <p className="muted-copy">Select a report to inspect its score history.</p>
          )}
        </article>

        <DimensionComprehensionLab selected={selected} reports={reports} />

        <article className="interest-card">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Local research trail</span>
              <h3>{totalSignals} session signals</h3>
            </div>
          </div>
          <dl className="signal-counts">
            <div><dt>Reports selected</dt><dd>{signals.report_selected}</dd></div>
            <div><dt>Search started</dt><dd>{signals.search_used}</dd></div>
            <div><dt>History inspected</dt><dd>{signals.history_inspected}</dd></div>
            <div><dt>Comparisons changed</dt><dd>{signals.comparison_opened}</dd></div>
            <div><dt>Dimensions inspected</dt><dd>{signals.dimension_compared}</dd></div>
            <div><dt>Comprehension completed</dt><dd>{signals.comprehension_completed}</dd></div>
            <div><dt>Evidence opened</dt><dd>{signals.evidence_opened}</dd></div>
          </dl>
          <p className="privacy-note">
            Stored only in this browser tab. No identifiers, report IDs, answers, timestamps, cookies, or
            network upload.
          </p>
          <button className="secondary-button" type="button" onClick={() => setSignals(clearInterestSignals())}>
            Clear local trail
          </button>
        </article>
      </div>
    </section>
  );
}
