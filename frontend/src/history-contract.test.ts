import { describe, expect, it } from "vitest";
import { parseFilingHistory } from "./history-contract";
import { ethosSummary } from "./test/fixtures";

const validHistory = {
  issuer: {
    id: 1,
    legal_name: ethosSummary.issuer_name,
    brand_name: ethosSummary.ticker,
    country: "United States",
    industry: "Technology",
    website: null,
  },
  filing: {
    id: 1,
    filing_type: "424B4",
    exchange: ethosSummary.exchange,
    ticker: ethosSummary.ticker,
  },
  versions: [
    {
      id: 1,
      version_label: "Final prospectus",
      published_at: ethosSummary.filing_published_at,
      source_accessed_at: "2026-07-21T09:30:00Z",
      source_url: "https://www.sec.gov/example",
      source_hash: "filing-hash",
      is_current: true,
      supersedes_id: null,
    },
  ],
  reports: [ethosSummary],
};

describe("parseFilingHistory", () => {
  it("accepts a complete filing history response", () => {
    const parsed = parseFilingHistory(validHistory);
    expect(parsed.filing.id).toBe(1);
    expect(parsed.versions[0]?.version_label).toBe("Final prospectus");
    expect(parsed.reports[0]?.normalized_score).toBe(61);
  });

  it("rejects an unsafe filing URL", () => {
    expect(() =>
      parseFilingHistory({
        ...validHistory,
        versions: [{ ...validHistory.versions[0], source_url: "javascript:alert(1)" }],
      }),
    ).toThrow(/only http and https URLs are allowed/);
  });

  it("rejects a non-numeric score before rendering", () => {
    expect(() =>
      parseFilingHistory({
        ...validHistory,
        reports: [{ ...ethosSummary, normalized_score: "61" }],
      }),
    ).toThrow(/normalized_score: expected a finite number/);
  });
});
