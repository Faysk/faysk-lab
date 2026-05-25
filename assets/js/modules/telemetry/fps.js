import { MODULE_STATUSES } from "../../constants.js";

export function getFpsInfo() {
  const live = window.__fayskLiveDiagnostics?.refresh;
  const hasMeasurement = Number.isFinite(live?.roundedHz || live?.hz);
  const measured = hasMeasurement
    ? live.display
    : live
      ? live.confidence || "rAF unavailable"
      : "measure in progress";
  const frameMs = Number.isFinite(live?.frameMs) ? `${live.frameMs.toFixed(2)} ms` : "measure in progress";

  return {
    id: "telemetry-fps",
    group: "telemetry",
    groupLabel: "Telemetry",
    title: "Refresh Rate",
    status: MODULE_STATUSES.available,
    description: "Display refresh estimated from requestAnimationFrame timing.",
    items: [
      { label: "Measured", value: measured },
      { label: "Frame Time", value: frameMs },
      { label: "Method", value: "requestAnimationFrame median" }
    ]
  };
}

export const initFps = getFpsInfo;
