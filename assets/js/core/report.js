const SAFE_REPORT_SCHEMA = "faysk-lab-safe-report/v1";

function cleanValue(value, fallback = "unavailable") {
  if (value === undefined || value === null || value === "") return fallback;
  return value;
}

function summarizeCapabilities(telemetry = []) {
  return telemetry.map((module) => ({
    id: module.id,
    group: module.group,
    title: module.title,
    status: module.status
  }));
}

export function buildSafeReport({ live = {}, telemetry = [], generatedAt = new Date() } = {}) {
  return {
    schema: SAFE_REPORT_SCHEMA,
    generatedAt: generatedAt.toISOString(),
    privacy: {
      excluded: ["public IP", "location", "user agent", "GPU renderer", "persistent identifier"],
      storage: "not saved by the lab"
    },
    browser: {
      platform: cleanValue(live.browser?.platform),
      language: cleanValue(live.browser?.language),
      timezone: cleanValue(live.browser?.timezone)
    },
    display: {
      resolution: cleanValue(live.screen?.resolution),
      viewport: cleanValue(live.screen?.viewport),
      pixelRatio: cleanValue(live.screen?.pixelRatio),
      refreshEstimate: cleanValue(live.refresh?.display),
      refreshConfidence: cleanValue(live.refresh?.confidence)
    },
    runtime: {
      logicalThreads: cleanValue(live.hardware?.cpuThreads),
      memoryEstimate: cleanValue(live.hardware?.deviceMemory),
      storageQuota: cleanValue(live.storage?.quota),
      latencyEstimate: cleanValue(live.latency?.display),
      webgl: live.gpu?.supported === true ? "supported" : live.gpu?.supported === false ? "unsupported" : "unavailable"
    },
    permissions: { ...(live.permissions?.states || {}) },
    scan: {
      completedAt: cleanValue(live.scan?.completedAt),
      durationMs: Number.isFinite(live.scan?.durationMs) ? live.scan.durationMs : null
    },
    capabilities: summarizeCapabilities(telemetry)
  };
}

export function serializeSafeReport(input) {
  return `${JSON.stringify(buildSafeReport(input), null, 2)}\n`;
}

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await Promise.race([
        navigator.clipboard.writeText(text),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Clipboard timeout")), 900))
      ]);
      return;
    } catch {
      // Fall through to the synchronous copy path when clipboard access is blocked or stalls.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.append(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard access is unavailable");
}
