import { MODULE_STATUSES } from "../../constants.js";

export function getStorageInfo() {
  return {
    id: "system-storage",
    group: "system",
    groupLabel: "System",
    title: "Storage",
    status: "storage" in navigator ? MODULE_STATUSES.available : MODULE_STATUSES.unsupported,
    description: "Storage manager support.",
    items: [
      { label: "Storage Manager", value: "storage" in navigator ? "available" : "unsupported" },
      { label: "localStorage", value: "localStorage" in window ? "available" : "unsupported" }
    ]
  };
}

export const initStorage = getStorageInfo;
