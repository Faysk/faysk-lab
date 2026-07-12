import test from "node:test";
import assert from "node:assert/strict";

import { analyzeRefreshDeltas } from "../assets/js/modules/live/diagnostics.js";

test("recognizes a stable 60 Hz cadence", () => {
  const samples = Array.from({ length: 120 }, (_, index) => 16.67 + (index % 3 - 1) * 0.04);
  const result = analyzeRefreshDeltas(samples, samples, "unit-test");

  assert.equal(result.roundedHz, 60);
  assert.equal(result.display, "60 Hz");
  assert.equal(result.samples, 120);
  assert.ok(result.jitter < 0.1);
});

for (const expectedHz of [120, 144, 165, 240, 280]) {
  test(`does not overestimate a stable ${expectedHz} Hz cadence`, () => {
    const frameMs = 1000 / expectedHz;
    const samples = Array.from({ length: 180 }, (_, index) => frameMs + (index % 5 - 2) * 0.01);
    const result = analyzeRefreshDeltas(samples, samples, "unit-test");

    assert.equal(result.roundedHz, expectedHz);
    assert.equal(result.display, `${expectedHz} Hz`);
    assert.equal(result.confidence, "measured");
  });
}

test("returns a safe empty result when no frames are available", () => {
  const result = analyzeRefreshDeltas([], [], "unit-test");

  assert.equal(result.roundedHz, null);
  assert.equal(result.samples, 0);
  assert.equal(result.confidence, "timeout");
});
