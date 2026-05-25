import { MODULE_STATUSES } from "../../constants.js";

export function getLocalStorageInfo() {
  return {
    id: "security-local-storage",
    group: "security",
    groupLabel: "Security",
    title: "localStorage",
    status: "localStorage" in window ? MODULE_STATUSES.available : MODULE_STATUSES.unsupported,
    description: "Storage API availability.",
    items: [
      { label: "API", value: "localStorage" in window ? "available" : "unsupported" },
      { label: "Content Scan", value: "disabled" }
    ]
  };
}

export const initLocalStorage = getLocalStorageInfo;
