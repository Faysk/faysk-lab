import { formatBytes, formatLatency } from "../../core/utils.js";
import { readWebGlInfo } from "../gpu/webgl.js";

const COMMON_REFRESH_RATES = [24, 30, 48, 50, 60, 72, 75, 90, 100, 120, 144, 165, 180, 200, 240, 280, 300, 360, 480];

function median(values) {
  if (!values.length) return NaN;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
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

export async function measureRefreshRate({ frames = 180, warmup = 20, timeout = 6000 } = {}) {
  if (document.visibilityState !== "visible") {
    return {
      hz: NaN,
      roundedHz: null,
      confidence: "tab-hidden",
      samples: 0,
      display: "--"
    };
  }

  return new Promise((resolve) => {
    const timestamps = [];
    const startedAt = performance.now();
    let previous = null;
    let settled = false;
    const timeoutId = setTimeout(() => finish("timeout"), timeout);

    function finish(confidence = "measured") {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      const deltas = timestamps.slice(warmup);
      const med = median(deltas);
      const hz = Number.isFinite(med) && med > 0 ? 1000 / med : NaN;
      const roundedHz = nearestCommonRate(hz);
      const jitter = deltas.length ? median(deltas.map((delta) => Math.abs(delta - med))) : NaN;
      resolve({
        hz,
        roundedHz,
        frameMs: med,
        jitter,
        confidence,
        samples: deltas.length,
        display: formatHz(roundedHz || hz)
      });
    }

    function tick(now) {
      if (settled) return;

      if (previous !== null) {
        const delta = now - previous;
        if (delta > 0 && delta < 80) timestamps.push(delta);
      }
      previous = now;

      if (timestamps.length >= frames + warmup) {
        finish();
        return;
      }

      if (now - startedAt > timeout) {
        finish("timeout");
        return;
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  });
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
