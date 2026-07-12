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
  const renderCadence = live?.renderDisplay || "measure in progress";
  const support = live?.supportDisplay || "measure in progress";
  const range = live?.rangeDisplay || "measure in progress";

  return {
    id: "telemetry-fps",
    group: "telemetry",
    groupLabel: "Telemetry",
    title: "Observed Cadence",
    status: MODULE_STATUSES.available,
    description: "Animation cadence observed in this tab. It is not a fixed claim about the monitor's native refresh rate.",
    items: [
      { label: "Observed", value: measured },
      { label: "Frame Time", value: frameMs },
      { label: "Render Cadence", value: renderCadence },
      { label: "Range", value: range },
      { label: "Stability", value: support },
      { label: "Method", value: "iframe rAF probe" }
    ]
  };
}

export const initFps = getFpsInfo;
