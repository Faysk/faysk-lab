import { MODULE_STATUSES } from "../../constants.js";

export function getLatencyInfo() {
  const latency = window.__fayskLiveDiagnostics?.latency;

  return {
    id: "network-latency",
    group: "network",
    groupLabel: "Network",
    title: "Latency",
    status: MODULE_STATUSES.available,
    description: "Best-of-sample fetch latency to a same-origin static asset.",
    items: [
      { label: "Best", value: latency?.display || "measure in progress" },
      { label: "Median", value: Number.isFinite(latency?.median) ? `${Math.round(latency.median)}ms` : "measure in progress" },
      { label: "Method", value: "fetch timing" }
    ]
  };
}

export const initLatency = getLatencyInfo;
