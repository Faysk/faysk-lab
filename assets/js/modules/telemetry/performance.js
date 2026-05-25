import { MODULE_STATUSES } from "../../constants.js";

export function getPerformanceInfo() {
  const navigation = performance.getEntriesByType("navigation")[0];
  return {
    id: "telemetry-performance",
    group: "telemetry",
    groupLabel: "Telemetry",
    title: "Performance",
    status: MODULE_STATUSES.available,
    description: "Performance Timing API snapshot.",
    items: [
      { label: "Now", value: `${Math.round(performance.now())}ms` },
      { label: "Load Type", value: navigation?.type || "unavailable" }
    ]
  };
}

export const initPerformance = getPerformanceInfo;
