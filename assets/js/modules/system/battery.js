import { MODULE_STATUSES } from "../../constants.js";

export function getBatteryInfo() {
  return {
    id: "system-battery",
    group: "system",
    groupLabel: "System",
    title: "Battery",
    status: "getBattery" in navigator ? MODULE_STATUSES.available : MODULE_STATUSES.unsupported,
    description: "Battery API support check.",
    items: [
      { label: "API", value: "getBattery" in navigator ? "available" : "unsupported" },
      { label: "Collection", value: "not requested on boot" }
    ]
  };
}

export const initBattery = getBatteryInfo;
