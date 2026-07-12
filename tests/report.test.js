import test from "node:test";
import assert from "node:assert/strict";

import { buildSafeReport, serializeSafeReport } from "../assets/js/core/report.js";

const sensitiveFixture = {
  live: {
    browser: { platform: "Test OS", language: "pt-BR", timezone: "Europe/London", userAgent: "SECRET-UA" },
    location: { ip: "203.0.113.42", city: "Secret City" },
    gpu: { supported: true, renderer: "SECRET-GPU" },
    hardware: { cpuThreads: "8 logical threads", deviceMemory: "8 GB browser estimate" },
    refresh: { display: "60 Hz", confidence: "measured" },
    permissions: { states: { camera: "denied" } }
  },
  telemetry: [{ id: "browser-runtime", group: "browser", title: "Browser Runtime", status: "available", items: [] }],
  generatedAt: new Date("2026-07-12T00:00:00.000Z")
};

test("safe report keeps support data and excludes identifying values", () => {
  const report = buildSafeReport(sensitiveFixture);
  const serialized = JSON.stringify(report);

  assert.equal(report.browser.platform, "Test OS");
  assert.equal(report.permissions.camera, "denied");
  assert.equal(report.capabilities.length, 1);
  assert.doesNotMatch(serialized, /203\.0\.113\.42|Secret City|SECRET-UA|SECRET-GPU/);
});

test("serialized report is formatted and newline terminated", () => {
  const serialized = serializeSafeReport(sensitiveFixture);

  assert.match(serialized, /"schema": "faysk-lab-safe-report\/v1"/);
  assert.ok(serialized.endsWith("\n"));
});
