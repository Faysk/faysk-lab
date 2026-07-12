import { test, expect } from "@playwright/test";

test("runs a passive scan and filters the complete catalog", async ({ page }) => {
  const externalRequests = [];
  const dialogs = [];

  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "127.0.0.1") externalRequests.push(url.href);
  });
  page.on("dialog", (dialog) => dialogs.push(dialog.type()));

  await page.goto("/");
  await expect(page.locator("#scan-status")).toContainText("no permission prompts", { timeout: 12_000 });
  await expect(page.locator(".telemetry-card")).toHaveCount(35);
  await expect(page.locator(".card-guidance a")).toHaveCount(35);

  await page.locator("#signals summary").click();
  await page.locator("#search-input").fill("webgpu");
  await expect(page.locator(".telemetry-card")).toHaveCount(1);
  await expect(page.locator(".telemetry-card h3")).toHaveText("Graphics APIs");

  await page.locator("#search-input").fill("");
  await page.locator('.nav-button[data-group="security"]').click();
  const securityCards = page.locator('.telemetry-card[data-group="security"]');
  await expect(securityCards).not.toHaveCount(0);
  await expect(page.locator(".telemetry-card")).toHaveCount(await securityCards.count());

  const scanButton = page.locator("#scan-button");
  await scanButton.click();
  await expect(scanButton).toBeDisabled();
  await expect(scanButton).toBeEnabled({ timeout: 12_000 });
  await expect(page.locator("#scan-status")).toContainText("no permission prompts", { timeout: 12_000 });

  expect(dialogs).toEqual([]);
  expect(externalRequests).toEqual([]);
});

test("exposes a safe, coherent document structure", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("nav[aria-label]")).toHaveCount(2);
  await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveCount(1);
  await expect(page.locator("#report-dialog")).toHaveAttribute("aria-labelledby", "report-dialog-title");
  await expect(page.locator("footer")).toContainText("0.4.0");
});
