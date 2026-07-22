import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { InterestLoopPanel } from "./components/InterestLoopPanel";
import { clearInterestSignals, recordInterestSignal } from "./interest-signals";
import { ethosSummary, itgSummary } from "./test/fixtures";
import type { FilingHistoryResponse, ReportSummary } from "./types";

const earlierReport: ReportSummary = {
  ...ethosSummary,
  report_id: "ethos-2025-12-15-s1-v0.0",
  report_version: "0.0.1",
  filing_published_at: "2025-12-15T00:00:00Z",
  normalized_score: 57,
  coverage_percent: 82,
  is_latest: false,
};

const sameFilingOlderReport: ReportSummary = {
  ...ethosSummary,
  report_id: "ethos-2026-01-30-424b4-v0.0",
  report_version: "0.0.9",
  normalized_score: 59,
  coverage_percent: 91,
  is_latest: false,
};

const currentReport: ReportSummary = {
  ...ethosSummary,
  supersedes_report_id: earlierReport.report_id,
};

const duplicateIssuerCurrentReport: ReportSummary = {
  ...currentReport,
  report_id: "ethos-duplicate-current",
  report_version: "0.1.1",
};

const history: FilingHistoryResponse = {
  issuer: {
    id: 1,
    legal_name: currentReport.issuer_name,
    brand_name: currentReport.ticker,
    country: "United States",
    industry: "Technology",
    website: null,
  },
  filing: {
    id: 1,
    filing_type: "S-1 / 424B4",
    exchange: currentReport.exchange,
    ticker: currentReport.ticker,
  },
  versions: [
    {
      id: 10,
      version_label: "Initial S-1",
      published_at: earlierReport.filing_published_at,
      source_accessed_at: "2026-07-20T09:00:00Z",
      source_url: "https://www.sec.gov/initial",
      source_hash: "initial-hash",
      is_current: false,
      supersedes_id: null,
    },
    {
      id: 11,
      version_label: "Final prospectus",
      published_at: currentReport.filing_published_at,
      source_accessed_at: "2026-07-21T09:00:00Z",
      source_url: "https://www.sec.gov/final",
      source_hash: "final-hash",
      is_current: true,
      supersedes_id: 10,
    },
  ],
  reports: [earlierReport, sameFilingOlderReport, currentReport],
};

describe("InterestLoopPanel", () => {
  beforeEach(() => {
    clearInterestSignals();
  });

  it("shows descriptive score movement and the latest report for each filing version", async () => {
    const user = userEvent.setup();
    render(
      <InterestLoopPanel
        selected={currentReport}
        reports={[currentReport, itgSummary]}
        history={history}
        loading={false}
        error={null}
      />,
    );

    expect(screen.getByText(/increased by 4 points/i)).toBeInTheDocument();
    await user.click(screen.getByText(/Inspect S-1 \/ 424B4 history/i));
    expect(screen.getByText("Initial S-1")).toBeVisible();
    expect(screen.getByText("Final prospectus")).toBeVisible();
    expect(screen.getByText(/Report 0\.1\.0: score 61/i)).toBeVisible();
    expect(screen.queryByText(/Report 0\.0\.9: score 59/i)).not.toBeInTheDocument();
    expect(screen.getByText(/This describes the change/i)).toBeInTheDocument();
  });

  it("compares distinct current IPOs without making an allocation claim", async () => {
    const user = userEvent.setup();
    render(
      <InterestLoopPanel
        selected={currentReport}
        reports={[currentReport, duplicateIssuerCurrentReport, itgSummary]}
        history={history}
        loading={false}
        error={null}
      />,
    );

    expect(screen.queryByRole("option", { name: /ethos technologies/i })).not.toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/Compare LIFE with/i), itgSummary.report_id);
    expect(screen.getByRole("table", { name: "IPO comparison" })).toBeInTheDocument();
    expect(screen.getByText(/does not turn the table into an allocation recommendation/i)).toBeInTheDocument();
  });

  it("keeps only aggregate session counts and clears them", async () => {
    const user = userEvent.setup();
    recordInterestSignal("report_selected");
    render(
      <InterestLoopPanel
        selected={currentReport}
        reports={[currentReport, itgSummary]}
        history={history}
        loading={false}
        error={null}
      />,
    );

    expect(
      screen.getByText(/No identifiers, report IDs, answers, timestamps, cookies, or network upload/i),
    ).toBeInTheDocument();
    expect(screen.getByText("1 session signals")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear local trail" }));
    expect(screen.getByText("0 session signals")).toBeInTheDocument();
  });
});
