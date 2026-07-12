import { test, expect } from "@playwright/test";

test("keeps the interface inside the viewport", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#scan-status")).toContainText("no permission prompts", { timeout: 12_000 });

  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    heroButtons: [...document.querySelectorAll(".hero-actions button")]
      .map((button) => button.getBoundingClientRect().width)
  }));

  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
  expect(layout.heroButtons).toHaveLength(3);
  expect(layout.heroButtons.every((width) => width > 0)).toBe(true);
});
