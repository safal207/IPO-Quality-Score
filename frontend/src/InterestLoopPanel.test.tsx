import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { InterestLoopPanel } from "./components/InterestLoopPanel";
import { clearInterestSignals } from "./interest-signals";
import { ethosSummary, itgSummary } from "./test/fixtures";
import type { FilingHistoryResponse, ReportSummary } from "./types";

const previousEthos: ReportSummary = {
  ...ethosSummary,
  report_id: "ethos-2025-12-15-s1-v0.0",
  report_version: "0.0.1",
  filing_published_at: "2025-12-15T00:00:00Z",
  normalized_score: 54,
  coverage_percent: 82,
  supersedes_report_id: null,
  is_latest: false,
};

const currentEthos: ReportSummary = {
  ...ethosSummary,
  supersedes_report_id: previousEthos.report_id,
};

const history: FilingHistoryResponse = {
  issuer: {
    id: 1,
    legal_name: currentEthos.issuer_name,
    brand_name: currentEthos.ticker,
    country: "United States",
    industry: "Technology",
    website: null,
  },
  filing: {
    id: 1,
    filing_type: "S-1 / 424B4",
    exchange: currentEthos.exchange,
    ticker: currentEthos.ticker,
  },
  versions: [
    {
      id: 1,
      version_label: "Initial registration statement",
      published_at: previousEthos.filing_published_at,
      source_accessed_at: "2026-07-21T09:00:00Z",
      source_url: "https://www.sec.gov/example-initial",
      source_hash: "initial-hash",
      is_current: false,
      supersedes_id: null,
    },
    {
      id: 2,
      version_label: "Final prospectus",
      published_at: currentEthos.filing_published_at,
      source_accessed_at: "2026-07-21T10:00:00Z",
      source_url: "https://www.sec.gov/example-final",
      source_hash: "final-hash",
      is_current: true,
      supersedes_id: 1,
    },
  ],
  reports: [previousEthos, currentEthos],
};

describe("InterestLoopPanel", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    clearInterestSignals();
  });

  it("shows filing history and a descriptive score delta without claiming causation", () => {
    render(
      <InterestLoopPanel
        selected={currentEthos}
        reports={[currentEthos, itgSummary]}
        history={history}
        loading={false}
        error={null}
      />,
    );

    expect(screen.getByRole("heading", { name: "Follow the idea through time." })).toBeVisible();
    expect(screen.getByText("54")).toBeVisible();
    expect(screen.getByText("61")).toBeVisible();
    expect(screen.getByText(/increased by 7 points/i)).toBeVisible();
    expect(screen.getByText(/does not claim which filing fact caused it/i)).toBeVisible();

    fireEvent.click(screen.getByText(/Inspect S-1 \/ 424B4 history/i));
    expect(screen.getByText("Initial registration statement")).toBeVisible();
    expect(screen.getByText("Final prospectus")).toBeVisible();
    expect(screen.getByText("1 session signals")).toBeVisible();
  });

  it("compares two reports and keeps the research trail local and clearable", () => {
    render(
      <InterestLoopPanel
        selected={currentEthos}
        reports={[currentEthos, itgSummary]}
        history={history}
        loading={false}
        error={null}
      />,
    );

    const comparison = screen.getByRole("combobox", { name: /Compare LIFE with/i });
    fireEvent.change(comparison, { target: { value: itgSummary.report_id } });

    expect(screen.getByRole("table", { name: "IPO comparison" })).toBeVisible();
    expect(screen.getByText("+6")).toBeVisible();
    expect(screen.getByText(/Stored only in this browser tab/i)).toBeVisible();
    expect(screen.getByText("1 session signals")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Clear local trail" }));
    expect(screen.getByText("0 session signals")).toBeVisible();
    expect(window.sessionStorage.length).toBe(0);
  });
});
