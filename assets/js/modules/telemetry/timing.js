import { MODULE_STATUSES } from "../../constants.js";

export function getTimingInfo() {
  return {
    id: "telemetry-timing",
    group: "telemetry",
    groupLabel: "Telemetry",
    title: "Timing",
    status: MODULE_STATUSES.available,
    description: "High resolution timer support.",
    items: [
      { label: "performance.now", value: "available" },
      { label: "Time Origin", value: Math.round(performance.timeOrigin).toString() }
    ]
  };
}

export const initTiming = getTimingInfo;
