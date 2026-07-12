import test from "node:test";
import assert from "node:assert/strict";

import { MODULE_GUIDANCE } from "../assets/js/modules/guidance.js";

test("every visible telemetry module has guidance", () => {
  const expectedIds = [
    "browser-info", "browser-languages", "browser-permissions",
    "system-screen", "system-hardware", "system-memory", "system-battery", "system-storage", "system-touch",
    "gpu-runtime", "gpu-canvas",
    "fingerprint-summary", "fingerprint-audio", "fingerprint-fonts",
    "network-connection", "network-ip", "network-webrtc", "network-latency",
    "geo-geolocation", "geo-timezone", "geo-locale", "media-devices",
    "telemetry-performance", "telemetry-fps", "telemetry-timing", "telemetry-sensors",
    "security-cookies", "security-web-storage", "security-https", "security-csp",
    "experimental-bluetooth", "experimental-usb", "experimental-serial", "experimental-gamepad", "experimental-vr"
  ];

  assert.deepEqual(Object.keys(MODULE_GUIDANCE).sort(), expectedIds.sort());
  Object.values(MODULE_GUIDANCE).forEach(({ href, note }) => {
    assert.match(href, /^https:\/\//);
    assert.ok(note.length >= 24);
  });
});
