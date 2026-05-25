import { MODULE_STATUSES } from "../../constants.js";

export function getTouchInfo() {
  return {
    id: "system-touch",
    group: "system",
    groupLabel: "System",
    title: "Touch",
    status: MODULE_STATUSES.available,
    description: "Touch interaction support.",
    items: [
      { label: "Touch Points", value: String(navigator.maxTouchPoints || 0) },
      { label: "Touch Events", value: "ontouchstart" in window ? "available" : "unavailable" }
    ]
  };
}

export const initTouch = getTouchInfo;
