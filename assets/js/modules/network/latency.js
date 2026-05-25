import { MODULE_STATUSES } from "../../constants.js";

export function getLatencyInfo() {
  return {
    id: "network-latency",
    group: "network",
    groupLabel: "Network",
    title: "Latency",
    status: MODULE_STATUSES.available,
    description: "Client-side latency placeholder.",
    items: [
      { label: "Sample", value: `${Math.round(performance.now() % 100)}ms` },
      { label: "Remote Ping", value: "disabled" }
    ]
  };
}

export const initLatency = getLatencyInfo;
