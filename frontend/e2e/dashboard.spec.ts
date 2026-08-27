import { expect, test } from "@playwright/test";
import {
  detailsById,
  ethosSummary,
  itgSummary,
  provenanceById,
  reportsResponse,
} from "../src/test/fixtures";

const historiesById = {
  "1": {
    issuer: provenanceById[ethosSummary.report_id]?.issuer,
    filing: provenanceById[ethosSummary.report_id]?.filing,
    versions: [provenanceById[ethosSummary.report_id]?.filing_version],
    reports: [ethosSummary],
  },
  "2": {
    issuer: provenanceById[itgSummary.report_id]?.issuer,
    filing: provenanceById[itgSummary.report_id]?.filing,
    versions: [provenanceById[itgSummary.report_id]?.filing_version],
    reports: [itgSummary],
  },
};

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname === "/api/v1/reports") {
      await route.fulfill({ json: reportsResponse });
      return;
    }

    const historyMatch = url.pathname.match(/^\/api\/v1\/filings\/(\d+)\/history$/);
    if (historyMatch) {
      const payload = historiesById[historyMatch[1] as keyof typeof historiesById];
      if (payload) {
        await route.fulfill({ json: payload });
        return;
      }
    }

    const provenanceMatch = url.pathname.match(/^\/api\/v1\/reports\/(.+)\/provenance$/);
    if (provenanceMatch) {
      const reportId = decodeURIComponent(provenanceMatch[1] ?? "");
      const payload = provenanceById[reportId];
      if (payload) {
        await route.fulfill({ json: payload });
        return;
      }
    }

    const detailMatch = url.pathname.match(/^\/api\/v1\/reports\/(.+)$/);
    if (detailMatch) {
      const reportId = decodeURIComponent(detailMatch[1] ?? "");
      const payload = detailsById[reportId];
      if (payload) {
        await route.fulfill({ json: payload });
        return;
      }
    }

    await route.fulfill({ status: 404, json: { detail: "Not found" } });
  });
});

test("loads reports and completes the evidence, time, dimension, and comprehension loop", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "See the IPO beneath the pitch." })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Ethos Technologies Inc.", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("61", { exact: true }).first()).toBeVisible();

  await page.getByRole("searchbox", { name: "Search issuer or ticker" }).fill("ITG");

  await expect(
    page.getByRole("heading", { name: "ITG Incorporated", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Ethos Technologies Inc\./ })).toHaveCount(0);
  await expect(page.getByText("Final prospectus", { exact: true }).first()).toBeVisible();

  const sourceLink = page.getByRole("link", { name: "Open source ↗" });
  await expect(sourceLink).toHaveAttribute("href", "https://www.sec.gov/example");
  await expect(sourceLink).toHaveAttribute("rel", /noopener/);
  const popupPromise = page.waitForEvent("popup");
  await sourceLink.click();
  const popup = await popupPromise;
  await popup.close();

  await expect(page.getByRole("heading", { name: "Follow the idea through time." })).toBeVisible();
  await page.getByText("Inspect 424B4 history").click();
  await expect(page.getByRole("link", { name: "Open filing ↗" })).toBeVisible();
  await expect(page.getByRole("table", { name: "IPO comparison" })).toBeVisible();

  await page.getByText("Inspect dimension comparison").click();
  const dimensionTable = page.getByRole("table", { name: "Dimension comparison" });
  await expect(dimensionTable).toBeVisible();
  const governanceRow = dimensionTable.locator(".dimension-comparison-row").filter({
    hasText: "Governance and shareholder alignment",
  });
  await expect(governanceRow).toContainText("50%");
  await expect(governanceRow).toContainText("80%");
  await expect(governanceRow).toContainText("-30 pp");

  await page.getByLabel("They are equal").check();
  await page.getByLabel("Governance and shareholder alignment").check();
  await page.getByLabel("Future returns or an allocation decision").check();
  await page.getByRole("button", { name: "Check comprehension" }).click();
  await expect(page.getByText("3/3 understood")).toBeVisible();

  await expect(page.getByText(/Stored only in this browser tab/i)).toBeVisible();
  await expect(
    page.locator(".signal-counts div").filter({ hasText: "Evidence opened" }).locator("dd"),
  ).toHaveText("1");
  await expect(
    page.locator(".signal-counts div").filter({ hasText: "Dimensions inspected" }).locator("dd"),
  ).toHaveText("1");
  await expect(
    page.locator(".signal-counts div").filter({ hasText: "Comprehension completed" }).locator("dd"),
  ).toHaveText("1");
});
