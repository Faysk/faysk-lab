import { MODULE_STATUSES } from "../../constants.js";

export function getStorageInfo() {
  const storage = window.__fayskLiveDiagnostics?.storage;

  return {
    id: "system-storage",
    group: "system",
    groupLabel: "System",
    title: "Storage",
    status: "storage" in navigator ? MODULE_STATUSES.available : MODULE_STATUSES.unsupported,
    description: "Browser storage quota. This is not the physical disk or SSD size.",
    items: [
      { label: "Storage Manager", value: "storage" in navigator ? "available" : "unsupported" },
      { label: "Quota", value: storage?.quota || "measure in progress" },
      { label: "Used", value: storage?.usage || "measure in progress" }
    ]
  };
}

export const initStorage = getStorageInfo;
