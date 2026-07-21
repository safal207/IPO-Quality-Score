import { expect, test } from "@playwright/test";
import {
  detailsById,
  provenanceById,
  reportsResponse,
} from "../src/test/fixtures";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname === "/api/v1/reports") {
      await route.fulfill({ json: reportsResponse });
      return;
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

test("loads reports, keeps search selection consistent, and exposes audited evidence", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "See the IPO beneath the pitch." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Ethos Technologies Inc." })).toBeVisible();
  await expect(page.getByText("61", { exact: true }).first()).toBeVisible();

  await page.getByRole("searchbox", { name: "Search issuer or ticker" }).fill("ITG");

  await expect(page.getByRole("heading", { name: "ITG Incorporated" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Ethos Technologies Inc\./ })).toHaveCount(0);
  await expect(page.getByText("Final prospectus")).toBeVisible();

  const sourceLink = page.getByRole("link", { name: "Open source ↗" });
  await expect(sourceLink).toHaveAttribute("href", "https://www.sec.gov/example");
  await expect(sourceLink).toHaveAttribute("rel", /noopener/);
});
