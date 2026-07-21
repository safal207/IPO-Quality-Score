import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { getFilingHistory, getReportProvenance, getReports } from "../api";
import { recordInterestSignal } from "../interest-signals";
import type { FilingHistoryResponse, ReportSummary } from "../types";
import { InterestLoopPanel } from "./InterestLoopPanel";

function ensureHost(): HTMLElement {
  const existing = document.getElementById("interest-loop-root");
  if (existing) {
    return existing;
  }

  const host = document.createElement("div");
  host.id = "interest-loop-root";
  const methodology = document.getElementById("methodology");
  const main = document.querySelector("main");
  if (methodology?.parentElement) {
    methodology.parentElement.insertBefore(host, methodology);
  } else if (main) {
    main.append(host);
  } else {
    document.body.append(host);
  }
  return host;
}

export function InterestLoopExperience() {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<FilingHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const nextHost = ensureHost();
    const trackEvidenceClick = (event: Event) => {
      const target = event.target;
      if (target instanceof Element && target.closest("a[href]")) {
        recordInterestSignal("evidence_opened");
      }
    };
    nextHost.addEventListener("click", trackEvidenceClick);
    setHost(nextHost);
    return () => {
      nextHost.removeEventListener("click", trackEvidenceClick);
      nextHost.remove();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    void getReports({ minScore: 0, limit: 100 }, controller.signal)
      .then((response) => {
        setReports(response.items);
        setSelectedId((current) => current || response.items[0]?.report_id || "");
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "Unable to load reports");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  const visibleReports = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) {
      return reports;
    }
    return reports.filter((report) =>
      `${report.issuer_name} ${report.ticker ?? ""}`.toLowerCase().includes(needle),
    );
  }, [reports, search]);

  useEffect(() => {
    if (selectedId && visibleReports.some((report) => report.report_id === selectedId)) {
      return;
    }
    setSelectedId(visibleReports[0]?.report_id ?? "");
  }, [selectedId, visibleReports]);

  useEffect(() => {
    if (!selectedId) {
      setHistory(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setHistory(null);
    void getReportProvenance(selectedId, controller.signal)
      .then((provenance) => getFilingHistory(provenance.filing.id, controller.signal))
      .then(setHistory)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "Unable to load filing history");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [selectedId]);

  const selected = reports.find((report) => report.report_id === selectedId) ?? null;

  if (!host) {
    return null;
  }

  return createPortal(
    <div className="interest-loop-shell">
      <div className="interest-loop-toolbar" aria-label="Interest loop report selector">
        <label>
          <span>Find an IPO</span>
          <input
            type="search"
            value={search}
            placeholder="Ticker or issuer"
            onChange={(event) => {
              const next = event.target.value;
              if (!search.trim() && next.trim()) {
                recordInterestSignal("search_used");
              }
              setSearch(next);
            }}
          />
        </label>
        <label>
          <span>Timeline subject</span>
          <select
            value={selectedId}
            onChange={(event) => {
              setSelectedId(event.target.value);
              recordInterestSignal("report_selected");
            }}
          >
            {visibleReports.map((report) => (
              <option key={report.report_id} value={report.report_id}>
                {report.ticker ?? "PRIVATE"} · {report.issuer_name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <InterestLoopPanel
        selected={selected}
        reports={reports}
        history={history}
        loading={loading}
        error={error}
      />
    </div>,
    host,
  );
}
