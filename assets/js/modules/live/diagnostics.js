import { formatBytes, formatLatency } from "../../core/utils.js";
import { readWebGlInfo } from "../gpu/webgl.js";

const COMMON_REFRESH_RATES = [24, 30, 48, 50, 60, 72, 75, 90, 100, 120, 144, 165, 180, 200, 240, 280, 300, 360, 480];

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

function nearestCommonRate(value) {
  if (!Number.isFinite(value)) return null;
  return COMMON_REFRESH_RATES.reduce((nearest, rate) => {
    return Math.abs(rate - value) < Math.abs(nearest - value) ? rate : nearest;
  }, COMMON_REFRESH_RATES[0]);
}

function formatHz(value) {
  return Number.isFinite(value) ? `${Math.round(value)} Hz` : "--";
}

function frameTolerance(frameMs) {
  return Math.max(0.35, frameMs * 0.18);
}

function getRefreshCandidate(deltas, medianFrameMs) {
  if (!deltas.length) return null;

  const minimumHits = Math.max(12, Math.ceil(deltas.length * 0.1));
  const candidates = COMMON_REFRESH_RATES
    .map((rate) => {
      const expectedFrameMs = 1000 / rate;
      const tolerance = frameTolerance(expectedFrameMs);
      const closeDeltas = deltas.filter((delta) => Math.abs(delta - expectedFrameMs) <= tolerance);
      const support = closeDeltas.length / deltas.length;
      const closeMedian = median(closeDeltas);
      const error = Number.isFinite(closeMedian)
        ? Math.abs(closeMedian - expectedFrameMs) / expectedFrameMs
        : Infinity;

      return {
        rate,
        expectedFrameMs,
        measuredFrameMs: closeMedian,
        hits: closeDeltas.length,
        support,
        error
      };
    })
    .filter((candidate) => {
      return candidate.hits >= minimumHits
        && candidate.error <= 0.18
        && candidate.expectedFrameMs <= medianFrameMs + frameTolerance(candidate.expectedFrameMs);
    })
    .sort((a, b) => {
      if (b.rate !== a.rate) return b.rate - a.rate;
      if (b.support !== a.support) return b.support - a.support;
      return a.error - b.error;
    });

  return candidates[0] || null;
}

function analyzeRefreshDeltas(deltas, timestampDeltas, source) {
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
  const candidate = getRefreshCandidate(cleaned, medianFrameMs);
  const rawHz = Number.isFinite(medianFrameMs) && medianFrameMs > 0 ? 1000 / medianFrameMs : NaN;
  const renderHz = nearestCommonRate(rawHz);
  const selectedHz = candidate?.rate || nearestCommonRate(Number.isFinite(fastFrameMs) ? 1000 / fastFrameMs : rawHz) || rawHz;
  const selectedFrameMs = candidate?.measuredFrameMs || (Number.isFinite(selectedHz) ? 1000 / selectedHz : medianFrameMs);
  const matchingDeltas = candidate
    ? cleaned.filter((delta) => Math.abs(delta - candidate.expectedFrameMs) <= frameTolerance(candidate.expectedFrameMs))
    : cleaned;
  const jitter = matchingDeltas.length
    ? median(matchingDeltas.map((delta) => Math.abs(delta - median(matchingDeltas))))
    : NaN;
  const timestampMedian = median(cleanedTimestamp);
  const cadenceDiffers = Number.isFinite(renderHz) && Number.isFinite(selectedHz) && Math.abs(renderHz - selectedHz) >= 20;

  return {
    hz: selectedHz,
    roundedHz: nearestCommonRate(selectedHz),
    frameMs: selectedFrameMs,
    medianFrameMs,
    fastFrameMs,
    renderHz,
    rawHz,
    jitter,
    timestampFrameMs: timestampMedian,
    confidence: candidate
      ? cadenceDiffers
        ? "display-ceiling"
        : "measured"
      : "measured",
    source,
    samples: cleaned.length,
    support: candidate?.support || 1,
    supportDisplay: candidate ? `${Math.round(candidate.support * 100)}%` : "median",
    renderDisplay: formatHz(renderHz),
    display: formatHz(nearestCommonRate(selectedHz) || selectedHz)
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
    try {
      const fallback = await fetchJson("https://ipapi.co/json/", { timeout: 4500 });
      return {
        source: "ipapi.co",
        ip: fallback.ip || "unavailable",
        city: fallback.city || "unavailable",
        region: fallback.region || "unavailable",
        country: fallback.country_name || fallback.country || "unavailable",
        colo: "external lookup",
        timezone: fallback.timezone || "unavailable",
        asn: fallback.asn || "unavailable",
        org: fallback.org || fallback.network || "unavailable"
      };
    } catch {
      return {
        source: "unavailable",
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
}

export async function measureLatency(samples = 5) {
  const timings = [];

  for (let index = 0; index < samples; index += 1) {
    const start = performance.now();
    try {
      await fetch(`/assets/js/app.js?latency=${Date.now()}-${index}`, {
        cache: "no-store",
        method: "GET"
      });
      timings.push(performance.now() - start);
    } catch {
      timings.push(NaN);
    }
  }

  const valid = timings.filter(Number.isFinite);
  const best = valid.length ? Math.min(...valid) : NaN;
  const med = median(valid);

  return {
    best,
    median: med,
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
