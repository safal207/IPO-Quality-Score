import { describe, expect, it } from "vitest";
import {
  ContractError,
  parseReportDetail,
  parseReportListResponse,
  parseReportProvenance,
} from "./contracts";
import {
  detailsById,
  ethosSummary,
  provenanceById,
  reportsResponse,
} from "./test/fixtures";

describe("frontend API contracts", () => {
  it("accepts valid list, detail, and provenance payloads", () => {
    expect(parseReportListResponse(reportsResponse)).toEqual(reportsResponse);
    expect(parseReportDetail(detailsById[ethosSummary.report_id])).toEqual(
      detailsById[ethosSummary.report_id],
    );
    expect(parseReportProvenance(provenanceById[ethosSummary.report_id])).toEqual(
      provenanceById[ethosSummary.report_id],
    );
  });

  it("rejects malformed scores before React renders them", () => {
    const malformed = structuredClone(reportsResponse) as unknown as {
      items: Array<{ normalized_score: unknown }>;
    };
    malformed.items[0]!.normalized_score = "61";

    expect(() => parseReportListResponse(malformed)).toThrow(ContractError);
    expect(() => parseReportListResponse(malformed)).toThrow(
      "response.items[0].normalized_score: expected a finite number",
    );
  });

  it("rejects unsafe evidence URLs", () => {
    const malformed = structuredClone(detailsById[ethosSummary.report_id]) as unknown as {
      document: { evidence: Array<{ source_url: string }> };
    };
    malformed.document.evidence[0]!.source_url = "javascript:alert(1)";

    expect(() => parseReportDetail(malformed)).toThrow(
      "only http and https URLs are allowed",
    );
  });
});
