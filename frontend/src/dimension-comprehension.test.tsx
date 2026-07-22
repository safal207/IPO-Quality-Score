import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getReport } from "./api";
import {
  buildDimensionRows,
  DimensionComprehensionLab,
  evaluateComprehension,
} from "./components/DimensionComprehensionLab";
import { clearInterestSignals, readInterestSignals } from "./interest-signals";
import { detailsById, ethosSummary, itgSummary } from "./test/fixtures";

vi.mock("./api", () => ({
  getReport: vi.fn(),
}));

const ethosDetail = detailsById[ethosSummary.report_id];
const itgDetail = detailsById[itgSummary.report_id];

if (!ethosDetail || !itgDetail) {
  throw new Error("Dimension fixtures are incomplete");
}

describe("dimension comparison and comprehension", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    clearInterestSignals();
    vi.mocked(getReport).mockImplementation((reportId) => {
      const detail = detailsById[reportId];
      return detail ? Promise.resolve(detail) : Promise.reject(new Error("Report not found"));
    });
  });

  it("normalizes dimensions and identifies the widest comparable gap", () => {
    const rows = buildDimensionRows(ethosDetail, itgDetail);
    const governance = rows.find((row) => row.id === "governance");

    expect(governance?.primaryPercent).toBe(50);
    expect(governance?.secondaryPercent).toBe(80);
    expect(governance?.delta).toBe(-30);
    expect(
      evaluateComprehension(ethosSummary, itgSummary, rows, {
        coverage: "equal",
        widest: "governance",
        boundary: "future_returns",
      }),
    ).toBe(3);
  });

  it("keeps unmatched dimensions visible instead of inventing a zero score", () => {
    const secondaryWithoutGovernance = {
      ...itgDetail,
      document: {
        ...itgDetail.document,
        dimensions: itgDetail.document.dimensions?.filter((dimension) => dimension.id !== "governance"),
      },
    };
    const rows = buildDimensionRows(ethosDetail, secondaryWithoutGovernance);
    const governance = rows.find((row) => row.id === "governance");

    expect(governance?.primaryPercent).toBe(50);
    expect(governance?.secondaryPercent).toBeNull();
    expect(governance?.delta).toBeNull();
  });

  it("completes the self-check without storing answers or report identity", async () => {
    const user = userEvent.setup();
    render(<DimensionComprehensionLab selected={ethosSummary} reports={[ethosSummary, itgSummary]} />);

    await user.click(screen.getByText("Inspect dimension comparison"));
    const table = await screen.findByRole("table", { name: "Dimension comparison" });
    const governanceRow = within(table).getByText("Governance and shareholder alignment").closest("article");
    expect(governanceRow).not.toBeNull();
    expect(within(governanceRow as HTMLElement).getByText("50%")).toBeVisible();
    expect(within(governanceRow as HTMLElement).getByText("80%")).toBeVisible();
    expect(within(governanceRow as HTMLElement).getByText("-30 pp")).toBeVisible();

    await user.click(screen.getByLabelText("They are equal"));
    await user.click(screen.getByLabelText("Governance and shareholder alignment"));
    await user.click(screen.getByLabelText("Future returns or an allocation decision"));
    await user.click(screen.getByRole("button", { name: "Check comprehension" }));

    expect(await screen.findByText("3/3 understood")).toBeVisible();
    const signals = readInterestSignals();
    expect(signals.dimension_compared).toBe(1);
    expect(signals.comprehension_completed).toBe(1);

    const stored = Array.from({ length: window.sessionStorage.length }, (_, index) =>
      window.sessionStorage.getItem(window.sessionStorage.key(index) ?? ""),
    ).join(" ");
    expect(stored).not.toContain("governance");
    expect(stored).not.toContain(ethosSummary.report_id);
    expect(stored).not.toContain(itgSummary.report_id);
  });

  it("does not mark an incomplete probe as completed", async () => {
    const user = userEvent.setup();
    render(<DimensionComprehensionLab selected={ethosSummary} reports={[ethosSummary, itgSummary]} />);

    await user.click(screen.getByText("Inspect dimension comparison"));
    await screen.findByRole("table", { name: "Dimension comparison" });
    await user.click(screen.getByRole("button", { name: "Check comprehension" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Answer all three questions");
    expect(readInterestSignals().comprehension_completed).toBe(0);
  });
});
