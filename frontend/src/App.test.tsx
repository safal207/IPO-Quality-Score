import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import {
  detailsById,
  ethosSummary,
  provenanceById,
  reportsResponse,
} from "./test/fixtures";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function installFetch(options: { failProvenanceFor?: string } = {}): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(typeof input === "string" ? input : input.toString(), "http://localhost");

      if (url.pathname === "/api/v1/reports") {
        return jsonResponse(reportsResponse);
      }

      const provenanceMatch = url.pathname.match(/^\/api\/v1\/reports\/(.+)\/provenance$/);
      if (provenanceMatch) {
        const reportId = decodeURIComponent(provenanceMatch[1] ?? "");
        if (options.failProvenanceFor === reportId) {
          return jsonResponse({ detail: "Provenance temporarily unavailable" }, 503);
        }
        return jsonResponse(provenanceById[reportId]);
      }

      const detailMatch = url.pathname.match(/^\/api\/v1\/reports\/(.+)$/);
      if (detailMatch) {
        const reportId = decodeURIComponent(detailMatch[1] ?? "");
        return jsonResponse(detailsById[reportId]);
      }

      return jsonResponse({ detail: "Not found" }, 404);
    }),
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("IPO dashboard", () => {
  it("keeps the selected detail synchronized with the visible search result", async () => {
    installFetch();
    const user = userEvent.setup();
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Ethos Technologies Inc." }),
    ).toBeInTheDocument();

    await user.type(screen.getByRole("searchbox", { name: "Search issuer or ticker" }), "ITG");

    expect(
      await screen.findByRole("heading", { name: "ITG Incorporated" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Ethos Technologies Inc\./ })).not.toBeInTheDocument();
  });

  it("shows a detail-only error without claiming the report list is unavailable", async () => {
    installFetch({ failProvenanceFor: ethosSummary.report_id });
    render(<App />);

    expect(
      await screen.findByRole("heading", { name: "Report detail unavailable" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Provenance temporarily unavailable")).toBeInTheDocument();
    expect(screen.queryByText("Report list unavailable")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ethos Technologies Inc\./ })).toBeInTheDocument();
  });

  it("surfaces a malformed backend response as a contract error", async () => {
    const malformed = structuredClone(reportsResponse) as unknown as {
      items: Array<{ normalized_score: unknown }>;
    };
    malformed.items[0]!.normalized_score = "61";
    vi.stubGlobal("fetch", vi.fn(async () => jsonResponse(malformed)));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Report list unavailable")).toBeInTheDocument();
    });
    expect(
      screen.getByText(/Backend response did not match the frontend contract/),
    ).toBeInTheDocument();
  });
});
