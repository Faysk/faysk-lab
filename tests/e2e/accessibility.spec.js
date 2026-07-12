import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("has no axe violations", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator("#scan-status")).toContainText("no permission prompts", { timeout: 12_000 });
  await page.locator("#signals summary").click();

  const results = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-results", {
    body: JSON.stringify(results.violations, null, 2),
    contentType: "application/json"
  });

  expect(results.violations).toEqual([]);
});
