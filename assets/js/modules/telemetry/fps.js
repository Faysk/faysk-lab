import { MODULE_STATUSES } from "../../constants.js";

export function getFpsInfo() {
  return {
    id: "telemetry-fps",
    group: "telemetry",
    groupLabel: "Telemetry",
    title: "FPS",
    status: MODULE_STATUSES.available,
    description: "Realtime FPS display placeholder.",
    items: [
      { label: "Target", value: "60 FPS" },
      { label: "Monitor", value: "overlay ready" }
    ]
  };
}

export const initFps = getFpsInfo;
