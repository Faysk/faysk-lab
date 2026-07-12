import { formatBytes, formatLatency } from "../../core/utils.js";
import { readWebGlInfo } from "../gpu/webgl.js";

function median(values) {
  if (!values.length) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function percentile(values, ratio) {
  if (!values.length) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * ratio)));
  return sorted[index];
}

function roundHz(value) {
  return Number.isFinite(value) ? Math.round(value * 10) / 10 : null;
}

function formatHz(value) {
  const rounded = roundHz(value);
  return rounded === null ? "--" : `${rounded} Hz`;
}

function clusterFrameDeltas(values) {
  const clusters = [];

  [...values].sort((a, b) => a - b).forEach((value) => {
    let closest = null;
    let closestDistance = Infinity;

    clusters.forEach((cluster) => {
      const distance = Math.abs(value - cluster.center);
      const tolerance = Math.max(0.12, cluster.center * 0.045);
      if (distance <= tolerance && distance < closestDistance) {
        closest = cluster;
        closestDistance = distance;
      }
    });

    if (closest) {
      closest.values.push(value);
      closest.center = median(closest.values);
    } else {
      clusters.push({ center: value, values: [value] });
    }
  });

  return clusters.sort((a, b) => {
    if (b.values.length !== a.values.length) return b.values.length - a.values.length;
    return a.center - b.center;
  });
}

export function analyzeRefreshDeltas(deltas, timestampDeltas, source = "test") {
  const cleaned = deltas.filter((delta) => Number.isFinite(delta) && delta >= 1.8 && delta < 80);
  const cleanedTimestamp = timestampDeltas.filter((delta) => Number.isFinite(delta) && delta >= 1.8 && delta < 80);

  if (!cleaned.length) {
    return {
      hz: NaN,
      roundedHz: null,
      frameMs: NaN,
      medianFrameMs: NaN,
      renderHz: null,
      jitter: NaN,
      confidence: "timeout",
      source,
      samples: 0,
      support: 0,
      display: "--"
    };
  }

  const medianFrameMs = median(cleaned);
  const fastFrameMs = percentile(cleaned, 0.1);
  const dominantCluster = clusterFrameDeltas(cleaned)[0];
  const dominantFrameMs = median(dominantCluster?.values || cleaned);
  const rawHz = Number.isFinite(medianFrameMs) && medianFrameMs > 0 ? 1000 / medianFrameMs : NaN;
  const observedHz = Number.isFinite(dominantFrameMs) && dominantFrameMs > 0 ? 1000 / dominantFrameMs : rawHz;
  const support = dominantCluster ? dominantCluster.values.length / cleaned.length : 1;
  const stableWindow = cleaned.filter((delta) => {
    return delta >= dominantFrameMs * 0.65 && delta <= dominantFrameMs * 1.55;
  });
  const lowerFrameMs = percentile(stableWindow, 0.1);
  const upperFrameMs = percentile(stableWindow, 0.9);
  const spread = Number.isFinite(lowerFrameMs) && Number.isFinite(upperFrameMs)
    ? (upperFrameMs - lowerFrameMs) / dominantFrameMs
    : 0;
  const confidence = support >= 0.55 && spread <= 0.08
    ? "measured"
    : spread <= 0.24
      ? "variable"
      : "unstable";
  const jitter = dominantCluster?.values.length
    ? median(dominantCluster.values.map((delta) => Math.abs(delta - dominantFrameMs)))
    : NaN;
  const timestampMedian = median(cleanedTimestamp);
  const minimumHz = Number.isFinite(upperFrameMs) && upperFrameMs > 0 ? 1000 / upperFrameMs : NaN;
  const maximumHz = Number.isFinite(lowerFrameMs) && lowerFrameMs > 0 ? 1000 / lowerFrameMs : NaN;

  return {
    hz: observedHz,
    roundedHz: roundHz(observedHz),
    frameMs: dominantFrameMs,
    medianFrameMs,
    fastFrameMs,
    renderHz: rawHz,
    rawHz,
    jitter,
    timestampFrameMs: timestampMedian,
    confidence,
    source,
    samples: cleaned.length,
    support,
    supportDisplay: `${Math.round(support * 100)}% stable cluster`,
    range: { minimumHz, maximumHz },
    rangeDisplay: Number.isFinite(minimumHz) && Number.isFinite(maximumHz)
      ? `${formatHz(minimumHz)}–${formatHz(maximumHz)}`
      : "--",
    renderDisplay: formatHz(rawHz),
    display: formatHz(observedHz)
  };
}

export function getConnectionInfo() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!connection) {
    return {
      effectiveType: "unavailable",
      downlink: "unavailable",
      rtt: "unavailable"
    };
  }

  return {
    effectiveType: connection.effectiveType || "unknown",
    downlink: Number.isFinite(connection.downlink) ? `${connection.downlink} Mbps` : "unavailable",
    rtt: Number.isFinite(connection.rtt) ? formatLatency(connection.rtt) : "unavailable"
  };
}

export function getScreenSummary() {
  return {
    resolution: `${screen.width} x ${screen.height}`,
    viewport: `${window.innerWidth} x ${window.innerHeight}`,
    pixelRatio: `${window.devicePixelRatio || 1}x`,
    colorDepth: `${screen.colorDepth || "--"} bit`
  };
}

export function getBrowserSummary() {
  const uaData = navigator.userAgentData;
  const platform = uaData?.platform || navigator.platform || "unavailable";
  const brands = uaData?.brands?.map((brand) => `${brand.brand} ${brand.version}`).join(", ");

  return {
    platform,
    brands: brands || "unavailable",
    language: navigator.language || "unavailable",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unavailable"
  };
}

export function getHardwareSummary() {
  return {
    cpuThreads: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} logical threads` : "unavailable",
    deviceMemory: navigator.deviceMemory ? `${navigator.deviceMemory} GB browser estimate` : "unavailable",
    maxTouchPoints: `${navigator.maxTouchPoints || 0}`,
    online: navigator.onLine ? "online" : "offline"
  };
}

export async function getStorageSummary() {
  if (!navigator.storage?.estimate) {
    return {
      usage: "unsupported",
      quota: "unsupported",
      percent: "unsupported"
    };
  }

  const estimate = await navigator.storage.estimate();
  const usage = estimate.usage || 0;
  const quota = estimate.quota || 0;
  const percent = quota ? `${Math.round((usage / quota) * 100)}% used` : "unavailable";

  return {
    usage: formatBytes(usage),
    quota: formatBytes(quota),
    percent
  };
}

export async function getBatterySummary() {
  if (!navigator.getBattery) {
    return {
      status: "unsupported",
      level: "unsupported"
    };
  }

  const battery = await navigator.getBattery();
  return {
    status: battery.charging ? "charging" : "discharging",
    level: `${Math.round(battery.level * 100)}%`
  };
}

const PASSIVE_PERMISSION_NAMES = ["geolocation", "camera", "microphone", "notifications"];

export async function getPermissionStates() {
  if (!navigator.permissions?.query) {
    return { supported: false, states: {} };
  }

  const entries = await Promise.all(PASSIVE_PERMISSION_NAMES.map(async (name) => {
    try {
      const result = await navigator.permissions.query({ name });
      return [name, result.state || "unknown"];
    } catch {
      return [name, "not-queryable"];
    }
  }));

  return {
    supported: true,
    states: Object.fromEntries(entries),
    checkedAt: new Date().toISOString()
  };
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || 4000);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: { accept: "application/json" }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("json")) throw new Error("non-json response");

    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

export async function getClientLocation() {
  try {
    const firstParty = await fetchJson(`/api/client?ts=${Date.now()}`, { timeout: 3000 });
    return {
      source: firstParty.source || "cloudflare",
      ip: firstParty.ip || "unavailable",
      city: firstParty.city || "unavailable",
      region: firstParty.region || "unavailable",
      country: firstParty.country || "unavailable",
      colo: firstParty.colo || "unavailable",
      timezone: firstParty.timezone || "unavailable",
      asn: firstParty.asn || "unavailable",
      org: firstParty.org || "unavailable"
    };
  } catch {
    return {
      source: "first-party endpoint unavailable",
      ip: "unavailable",
      city: "unavailable",
      region: "unavailable",
      country: "unavailable",
      colo: "unavailable",
      timezone: "unavailable",
      asn: "unavailable",
      org: "unavailable"
    };
  }
}

export async function measureLatency(samples = 5) {
  async function sampleEndpoint(urlFactory) {
    const timings = [];
    for (let index = 0; index < samples; index += 1) {
      const start = performance.now();
      try {
        const response = await fetch(urlFactory(index), { cache: "no-store", method: "GET" });
        if (!response.ok) return [];
        timings.push(performance.now() - start);
      } catch {
        return [];
      }
    }
    return timings;
  }

  let source = "Pages Function";
  let timings = await sampleEndpoint((index) => `/api/ping?latency=${Date.now()}-${index}`);
  if (!timings.length) {
    source = "static asset fallback";
    timings = await sampleEndpoint((index) => `/assets/js/app.js?latency=${Date.now()}-${index}`);
  }

  const valid = timings.filter(Number.isFinite);
  const best = valid.length ? Math.min(...valid) : NaN;
  const med = median(valid);
  const p95 = percentile(valid, 0.95);
  const jitter = valid.length ? median(valid.map((value) => Math.abs(value - med))) : NaN;

  return {
    best,
    median: med,
    p95,
    jitter,
    source,
    samples: valid.length,
    display: Number.isFinite(best) ? formatLatency(best) : "--"
  };
}

function createRefreshProbeFrame() {
  const frame = document.createElement("iframe");
  frame.className = "refresh-probe-frame";
  frame.setAttribute("aria-hidden", "true");
  frame.setAttribute("tabindex", "-1");
  frame.srcdoc = `<!doctype html>
<html>
  <head>
    <style>
      html, body {
        width: 100%;
        height: 100%;
        margin: 0;
        overflow: hidden;
        background: #05070a;
      }
      body::before {
        content: "";
        position: absolute;
        inset: 12px;
        border-radius: 999px;
        background: #82e8ff;
        transform: translate3d(0, 0, 0);
      }
    </style>
  </head>
  <body></body>
</html>`;
  document.body.append(frame);
  return frame;
}

function waitForFrameLoad(frame) {
  return new Promise((resolve) => {
    const done = () => resolve(frame.contentWindow || window);

    if (frame.contentDocument?.readyState === "complete") {
      done();
      return;
    }

    frame.addEventListener("load", done, { once: true });
    setTimeout(done, 120);
  });
}

function waitForPaints(targetWindow, count = 6) {
  return new Promise((resolve) => {
    let remaining = count;
    let settled = false;
    const timeout = setTimeout(done, 700);

    function done() {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      resolve();
    }

    function tick() {
      if (settled) return;
      remaining -= 1;
      if (remaining <= 0) {
        done();
        return;
      }

      targetWindow.requestAnimationFrame(tick);
    }

    targetWindow.requestAnimationFrame(tick);
  });
}

function sampleRefreshWindow(targetWindow, {
  minDuration = 1350,
  minSamples = 90,
  timeout = 5200
} = {}) {
  return new Promise((resolve) => {
    const deltas = [];
    const timestampDeltas = [];
    let previousArrival = null;
    let previousTimestamp = null;
    let startedAt = null;
    let settled = false;
    const timeoutId = setTimeout(() => finish("timeout"), timeout);

    function finish(reason = "measured") {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve({ deltas, timestampDeltas, reason });
    }

    function tick(timestamp) {
      if (settled) return;

      const arrival = targetWindow.performance.now();
      if (startedAt === null) startedAt = arrival;

      if (previousArrival !== null) {
        const arrivalDelta = arrival - previousArrival;
        const timestampDelta = timestamp - previousTimestamp;
        if (arrivalDelta > 0 && arrivalDelta < 80) deltas.push(arrivalDelta);
        if (timestampDelta > 0 && timestampDelta < 80) timestampDeltas.push(timestampDelta);
      }

      previousArrival = arrival;
      previousTimestamp = timestamp;

      if ((arrival - startedAt >= minDuration && deltas.length >= minSamples) || arrival - startedAt >= timeout) {
        finish(arrival - startedAt >= timeout ? "timeout" : "measured");
        return;
      }

      targetWindow.requestAnimationFrame(tick);
    }

    targetWindow.requestAnimationFrame(tick);
  });
}

export async function measureRefreshRate({ timeout = 6200 } = {}) {
  if (document.visibilityState !== "visible") {
    return {
      hz: NaN,
      roundedHz: null,
      confidence: "tab-hidden",
      source: "visibility",
      samples: 0,
      support: 0,
      display: "--"
    };
  }

  const root = document.documentElement;
  const frame = createRefreshProbeFrame();
  root.classList.add("is-measuring-refresh");

  try {
    const targetWindow = await waitForFrameLoad(frame);
    await waitForPaints(targetWindow, 8);
    const sample = await sampleRefreshWindow(targetWindow, { timeout });
    const result = analyzeRefreshDeltas(sample.deltas, sample.timestampDeltas, "iframe-probe");

    return {
      ...result,
      confidence: result.samples ? result.confidence : sample.reason
    };
  } finally {
    root.classList.remove("is-measuring-refresh");
    frame.remove();
  }
}

export function getGpuSummary() {
  const gl = readWebGlInfo();

  return {
    supported: gl.supported,
    vendor: gl.vendor,
    renderer: gl.renderer
  };
}

export async function collectLiveDiagnostics() {
  const [refresh, latency, location, storage, battery] = await Promise.all([
    measureRefreshRate(),
    measureLatency(),
    getClientLocation(),
    getStorageSummary(),
    getBatterySummary().catch(() => ({ status: "unsupported", level: "unsupported" }))
  ]);

  const hardware = getHardwareSummary();
  const screenSummary = getScreenSummary();
  const browser = getBrowserSummary();
  const connection = getConnectionInfo();
  const gpu = getGpuSummary();

  return {
    refresh,
    latency,
    location,
    storage,
    battery,
    gpu,
    hardware,
    screen: screenSummary,
    browser,
    connection,
    collectedAt: new Date()
  };
}
