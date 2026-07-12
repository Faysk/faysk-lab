import { MODULE_STATUSES } from "../../constants.js";

export function getLatencyInfo() {
  const latency = window.__fayskLiveDiagnostics?.latency;

  return {
    id: "network-latency",
    group: "network",
    groupLabel: "Network",
    title: "Latency",
    status: MODULE_STATUSES.available,
    description: "Same-origin HTTP latency, preferring a no-store Cloudflare Pages Function.",
    items: [
      { label: "Best", value: latency?.display || "measure in progress" },
      { label: "Median", value: Number.isFinite(latency?.median) ? `${Math.round(latency.median)}ms` : "measure in progress" },
      { label: "p95", value: Number.isFinite(latency?.p95) ? `${Math.round(latency.p95)}ms` : "measure in progress" },
      { label: "Jitter", value: Number.isFinite(latency?.jitter) ? `${latency.jitter.toFixed(1)}ms` : "measure in progress" },
      { label: "Target", value: latency?.source || "measure in progress" }
    ]
  };
}

export const initLatency = getLatencyInfo;
