import test from "node:test";
import assert from "node:assert/strict";

import { analyzeRefreshDeltas } from "../assets/js/modules/live/diagnostics.js";

for (const expectedHz of [59.94, 73.42, 97.3, 137.2, 143.85, 167.33, 239.76]) {
  test(`measures an arbitrary stable ${expectedHz} Hz cadence without presets`, () => {
    const frameMs = 1000 / expectedHz;
    const samples = Array.from({ length: 180 }, (_, index) => frameMs + (index % 5 - 2) * 0.01);
    const result = analyzeRefreshDeltas(samples, samples, "unit-test");

    assert.ok(Math.abs(result.hz - expectedHz) < 0.5);
    assert.equal(result.roundedHz, Math.round(expectedHz * 10) / 10);
    assert.equal(result.confidence, "measured");
    assert.ok(result.jitter < 0.1);
  });
}

test("keeps the observed cadence when some animation frames are missed", () => {
  const expectedHz = 143.37;
  const frameMs = 1000 / expectedHz;
  const samples = Array.from({ length: 180 }, (_, index) => {
    if (index % 10 === 0) return frameMs * 2;
    return frameMs + (index % 5 - 2) * 0.01;
  });
  const result = analyzeRefreshDeltas(samples, samples, "unit-test");

  assert.ok(Math.abs(result.hz - expectedHz) < 0.5);
  assert.equal(result.confidence, "measured");
  assert.ok(result.support > 0.8);
});

test("labels a variable cadence instead of forcing a fixed rate", () => {
  const samples = Array.from({ length: 240 }, (_, index) => {
    const hz = 130 + Math.sin(index / 9) * 20;
    return 1000 / hz;
  });
  const result = analyzeRefreshDeltas(samples, samples, "unit-test");

  assert.notEqual(result.confidence, "measured");
  assert.ok(result.range.minimumHz < result.range.maximumHz);
  assert.notEqual(result.rangeDisplay, "--");
});

test("returns a safe empty result when no frames are available", () => {
  const result = analyzeRefreshDeltas([], [], "unit-test");

  assert.equal(result.roundedHz, null);
  assert.equal(result.samples, 0);
  assert.equal(result.confidence, "timeout");
});
