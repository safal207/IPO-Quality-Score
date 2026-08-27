import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { getReport } from "../api";
import { recordInterestSignal } from "../interest-signals";
import type { ReportDetail, ReportDimension, ReportSummary } from "../types";

const detailCache = new Map<string, Promise<ReportDetail>>();

function loadReportDetail(reportId: string): Promise<ReportDetail> {
  const existing = detailCache.get(reportId);
  if (existing) {
    return existing;
  }

  const request = getReport(reportId).catch((error: unknown) => {
    detailCache.delete(reportId);
    throw error;
  });
  detailCache.set(reportId, request);
  return request;
}

function dimensionPercent(dimension: ReportDimension | null): number | null {
  if (!dimension || dimension.status !== "scored" || dimension.max_points <= 0) {
    return null;
  }
  return (dimension.earned_points / dimension.max_points) * 100;
}

function signed(value: number): string {
  if (value > 0) {
    return `+${Math.round(value)}`;
  }
  return String(Math.round(value));
}

export interface DimensionComparisonRow {
  id: string;
  name: string;
  primary: ReportDimension | null;
  secondary: ReportDimension | null;
  primaryPercent: number | null;
  secondaryPercent: number | null;
  delta: number | null;
}

export function buildDimensionRows(
  primary: ReportDetail,
  secondary: ReportDetail,
): DimensionComparisonRow[] {
  const primaryDimensions = primary.document.dimensions ?? [];
  const secondaryDimensions = secondary.document.dimensions ?? [];
  const primaryById = new Map(primaryDimensions.map((dimension) => [dimension.id, dimension]));
  const secondaryById = new Map(secondaryDimensions.map((dimension) => [dimension.id, dimension]));
  const ids = [
    ...primaryDimensions.map((dimension) => dimension.id),
    ...secondaryDimensions
      .map((dimension) => dimension.id)
      .filter((id) => !primaryById.has(id)),
  ];

  return ids.map((id) => {
    const primaryDimension = primaryById.get(id) ?? null;
    const secondaryDimension = secondaryById.get(id) ?? null;
    const primaryPercent = dimensionPercent(primaryDimension);
    const secondaryPercent = dimensionPercent(secondaryDimension);
    return {
      id,
      name: primaryDimension?.name ?? secondaryDimension?.name ?? id,
      primary: primaryDimension,
      secondary: secondaryDimension,
      primaryPercent,
      secondaryPercent,
      delta:
        primaryPercent === null || secondaryPercent === null
          ? null
          : primaryPercent - secondaryPercent,
    };
  });
}

function expectedCoverageAnswer(primary: ReportSummary, secondary: ReportSummary): string {
  if (primary.coverage_percent > secondary.coverage_percent) {
    return "primary";
  }
  if (primary.coverage_percent < secondary.coverage_percent) {
    return "secondary";
  }
  return "equal";
}

function widestDimensionId(rows: DimensionComparisonRow[]): string {
  const comparable = rows.filter((row) => row.delta !== null);
  if (comparable.length === 0) {
    return "none";
  }
  return comparable.reduce((widest, row) =>
    Math.abs(row.delta ?? 0) > Math.abs(widest.delta ?? 0) ? row : widest,
  ).id;
}

export interface ComprehensionAnswers {
  coverage: string;
  widest: string;
  boundary: string;
}

export function evaluateComprehension(
  primary: ReportSummary,
  secondary: ReportSummary,
  rows: DimensionComparisonRow[],
  answers: ComprehensionAnswers,
): number {
  return [
    answers.coverage === expectedCoverageAnswer(primary, secondary),
    answers.widest === widestDimensionId(rows),
    answers.boundary === "future_returns",
  ].filter(Boolean).length;
}

function SummaryMetric({
  label,
  primary,
  secondary,
  delta,
}: {
  label: string;
  primary: string;
  secondary: string;
  delta?: string;
}) {
  return (
    <div className="comparison-metric" role="row">
      <span role="cell">{label}</span>
      <strong role="cell">{primary}</strong>
      <strong role="cell">{secondary}</strong>
      <small role="cell">{delta ?? "—"}</small>
    </div>
  );
}

function DimensionTable({
  primary,
  secondary,
  rows,
}: {
  primary: ReportSummary;
  secondary: ReportSummary;
  rows: DimensionComparisonRow[];
}) {
  return (
    <div className="dimension-comparison-table" role="table" aria-label="Dimension comparison">
      <div className="dimension-comparison-heading" role="row">
        <span role="columnheader">Dimension</span>
        <strong role="columnheader">{primary.ticker ?? primary.issuer_name}</strong>
        <strong role="columnheader">{secondary.ticker ?? secondary.issuer_name}</strong>
        <span role="columnheader">Gap</span>
      </div>
      {rows.map((row) => (
        <article className="dimension-comparison-row" role="row" key={row.id}>
          <div role="cell">
            <strong>{row.name}</strong>
            <small>{row.id.replaceAll("_", " ")}</small>
          </div>
          <div role="cell">
            <strong>{row.primaryPercent === null ? "—" : `${Math.round(row.primaryPercent)}%`}</strong>
            <small>
              {row.primary && row.primaryPercent !== null
                ? `${row.primary.earned_points}/${row.primary.max_points} · ${row.primary.confidence}`
                : "not scored"}
            </small>
          </div>
          <div role="cell">
            <strong>{row.secondaryPercent === null ? "—" : `${Math.round(row.secondaryPercent)}%`}</strong>
            <small>
              {row.secondary && row.secondaryPercent !== null
                ? `${row.secondary.earned_points}/${row.secondary.max_points} · ${row.secondary.confidence}`
                : "not scored"}
            </small>
          </div>
          <div role="cell">
            <strong>{row.delta === null ? "—" : `${signed(row.delta)} pp`}</strong>
            <small>primary minus comparison</small>
          </div>
          <div className="dimension-judgments" role="cell">
            <details>
              <summary>Read judgments</summary>
              <div>
                <p>
                  <strong>{primary.ticker ?? primary.issuer_name}:</strong>{" "}
                  {row.primary?.judgment ?? "No scored judgment is available."}
                </p>
                <p>
                  <strong>{secondary.ticker ?? secondary.issuer_name}:</strong>{" "}
                  {row.secondary?.judgment ?? "No scored judgment is available."}
                </p>
              </div>
            </details>
          </div>
        </article>
      ))}
    </div>
  );
}

function ComprehensionProbe({
  primary,
  secondary,
  rows,
}: {
  primary: ReportSummary;
  secondary: ReportSummary;
  rows: DimensionComparisonRow[];
}) {
  const [answers, setAnswers] = useState<ComprehensionAnswers>({
    coverage: "",
    widest: "",
    boundary: "",
  });
  const [result, setResult] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const completedPairs = useRef(new Set<string>());
  const pairKey = `${primary.report_id}:${secondary.report_id}`;
  const comparableRows = rows.filter((row) => row.delta !== null);

  useEffect(() => {
    setAnswers({ coverage: "", widest: "", boundary: "" });
    setResult(null);
    setFormError(null);
  }, [pairKey]);

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (!answers.coverage || !answers.widest || !answers.boundary) {
      setFormError("Answer all three questions before checking comprehension.");
      return;
    }

    setFormError(null);
    setResult(evaluateComprehension(primary, secondary, rows, answers));
    if (!completedPairs.current.has(pairKey)) {
      completedPairs.current.add(pairKey);
      recordInterestSignal("comprehension_completed");
    }
  }

  return (
    <form className="comprehension-probe" onSubmit={submit}>
      <div className="section-heading">
        <div>
          <span className="section-kicker">Comprehension check</span>
          <h4>Can the reader explain the comparison?</h4>
        </div>
        <span>3 questions</span>
      </div>

      <fieldset>
        <legend>Which report has higher evidence coverage?</legend>
        <label><input type="radio" name="coverage" value="primary" checked={answers.coverage === "primary"} onChange={(event) => setAnswers((current) => ({ ...current, coverage: event.target.value }))} />{primary.ticker ?? primary.issuer_name}</label>
        <label><input type="radio" name="coverage" value="secondary" checked={answers.coverage === "secondary"} onChange={(event) => setAnswers((current) => ({ ...current, coverage: event.target.value }))} />{secondary.ticker ?? secondary.issuer_name}</label>
        <label><input type="radio" name="coverage" value="equal" checked={answers.coverage === "equal"} onChange={(event) => setAnswers((current) => ({ ...current, coverage: event.target.value }))} />They are equal</label>
      </fieldset>

      <fieldset>
        <legend>Which scored dimension has the widest percentage-point gap?</legend>
        {comparableRows.map((row) => (
          <label key={row.id}><input type="radio" name="widest" value={row.id} checked={answers.widest === row.id} onChange={(event) => setAnswers((current) => ({ ...current, widest: event.target.value }))} />{row.name}</label>
        ))}
        {comparableRows.length === 0 ? (
          <label><input type="radio" name="widest" value="none" checked={answers.widest === "none"} onChange={(event) => setAnswers((current) => ({ ...current, widest: event.target.value }))} />No comparable scored dimension</label>
        ) : null}
      </fieldset>

      <fieldset>
        <legend>What does this comparison not prove?</legend>
        <label><input type="radio" name="boundary" value="current_difference" checked={answers.boundary === "current_difference"} onChange={(event) => setAnswers((current) => ({ ...current, boundary: event.target.value }))} />That the current reports differ</label>
        <label><input type="radio" name="boundary" value="future_returns" checked={answers.boundary === "future_returns"} onChange={(event) => setAnswers((current) => ({ ...current, boundary: event.target.value }))} />Future returns or an allocation decision</label>
        <label><input type="radio" name="boundary" value="dimension_scores" checked={answers.boundary === "dimension_scores"} onChange={(event) => setAnswers((current) => ({ ...current, boundary: event.target.value }))} />That dimension scores exist</label>
      </fieldset>

      {formError ? <p className="inline-error" role="alert">{formError}</p> : null}
      <button className="secondary-button" type="submit">Check comprehension</button>
      {result !== null ? (
        <div className="comprehension-result" aria-live="polite">
          <strong>{result}/3 understood</strong>
          <p>
            This self-check tests reading of the current screen. It is not evidence of investment skill,
            product-market fit, or willingness to pay.
          </p>
        </div>
      ) : null}
      <p className="privacy-note">
        Answers stay only in React memory and disappear when this view resets. Session storage receives
        only one aggregate completion count for this pair.
      </p>
    </form>
  );
}

export function DimensionComprehensionLab({
  selected,
  reports,
}: {
  selected: ReportSummary | null;
  reports: ReportSummary[];
}) {
  const comparisonOptions = useMemo(
    () =>
      reports.filter(
        (report) =>
          report.is_latest &&
          report.report_id !== selected?.report_id &&
          report.issuer_name !== selected?.issuer_name,
      ),
    [reports, selected?.issuer_name, selected?.report_id],
  );
  const [comparisonId, setComparisonId] = useState("");
  const [requested, setRequested] = useState(false);
  const [details, setDetails] = useState<{ primary: ReportDetail; secondary: ReportDetail } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!comparisonOptions.some((report) => report.report_id === comparisonId)) {
      setComparisonId(comparisonOptions[0]?.report_id ?? "");
    }
  }, [comparisonId, comparisonOptions]);

  const comparison = comparisonOptions.find((report) => report.report_id === comparisonId) ?? null;

  useEffect(() => {
    if (!requested || !selected || !comparison) {
      setDetails(null);
      return;
    }

    let active = true;
    setLoading(true);
    setError(null);
    setDetails(null);
    void Promise.all([
      loadReportDetail(selected.report_id),
      loadReportDetail(comparison.report_id),
    ])
      .then(([primary, secondary]) => {
        if (active) {
          setDetails({ primary, secondary });
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "Unable to load dimension details");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [comparison, requested, selected]);

  const rows = useMemo(
    () => (details ? buildDimensionRows(details.primary, details.secondary) : []),
    [details],
  );

  return (
    <article className="interest-card interest-card--wide dimension-lab">
      <div className="section-heading">
        <div>
          <span className="section-kicker">Comparison laboratory</span>
          <h3>Two IPOs, then the dimensions beneath them.</h3>
        </div>
      </div>

      {selected && comparisonOptions.length > 0 ? (
        <>
          <label className="comparison-select">
            <span>Compare {selected.ticker ?? selected.issuer_name} with</span>
            <select
              value={comparisonId}
              onChange={(event) => {
                setComparisonId(event.target.value);
                recordInterestSignal("comparison_opened");
              }}
            >
              {comparisonOptions.map((report) => (
                <option key={report.report_id} value={report.report_id}>
                  {report.ticker ?? report.issuer_name} · {report.issuer_name}
                </option>
              ))}
            </select>
          </label>

          {comparison ? (
            <div className="comparison-table" role="table" aria-label="IPO comparison">
              <div className="comparison-heading" role="row">
                <span role="columnheader">Metric</span>
                <strong role="columnheader">{selected.ticker ?? selected.issuer_name}</strong>
                <strong role="columnheader">{comparison.ticker ?? comparison.issuer_name}</strong>
                <span role="columnheader">Delta</span>
              </div>
              <SummaryMetric label="Score" primary={String(Math.round(selected.normalized_score))} secondary={String(Math.round(comparison.normalized_score))} delta={signed(selected.normalized_score - comparison.normalized_score)} />
              <SummaryMetric label="Coverage" primary={`${Math.round(selected.coverage_percent)}%`} secondary={`${Math.round(comparison.coverage_percent)}%`} delta={`${signed(selected.coverage_percent - comparison.coverage_percent)} pp`} />
              <SummaryMetric label="Confidence" primary={selected.overall_confidence} secondary={comparison.overall_confidence} />
              <SummaryMetric label="Status" primary={selected.status} secondary={comparison.status} />
            </div>
          ) : null}

          <details
            className="dimension-lab__disclosure"
            onToggle={(event) => {
              if (event.currentTarget.open) {
                setRequested(true);
                recordInterestSignal("dimension_compared");
              }
            }}
          >
            <summary>Inspect dimension comparison</summary>
            {loading ? <p className="muted-copy">Loading both report documents…</p> : null}
            {error ? <p className="inline-error" role="alert">{error}</p> : null}
            {!loading && !error && details && comparison ? (
              <div className="dimension-lab__content">
                <DimensionTable primary={selected} secondary={comparison} rows={rows} />
                <ComprehensionProbe primary={selected} secondary={comparison} rows={rows} />
              </div>
            ) : null}
          </details>

          <p className="boundary-note">
            Percentage normalization makes dimensions with different maximum points comparable. It does
            not turn the table into an allocation recommendation or return forecast.
          </p>
        </>
      ) : (
        <p className="muted-copy">At least two distinct current IPOs are required for comparison.</p>
      )}
    </article>
  );
}
