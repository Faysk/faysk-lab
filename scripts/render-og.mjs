import { chromium } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve(import.meta.dirname, "../assets/img/og-card.svg");
const output = resolve(import.meta.dirname, "../assets/img/og-card.png");
const browser = await chromium.launch({ headless: true });

try {
  const markup = await readFile(source, "utf8");
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`<style>html, body { width: 1200px; height: 630px; margin: 0; overflow: hidden; } svg { display: block; width: 1200px; height: 630px; }</style>${markup}`);
  await page.screenshot({ path: output, type: "png" });
  console.log(`Rendered ${output}`);
} finally {
  await browser.close();
}
