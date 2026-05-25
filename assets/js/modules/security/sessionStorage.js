import { MODULE_STATUSES } from "../../constants.js";

export function getSessionStorageInfo() {
  return {
    id: "security-session-storage",
    group: "security",
    groupLabel: "Security",
    title: "sessionStorage",
    status: "sessionStorage" in window ? MODULE_STATUSES.available : MODULE_STATUSES.unsupported,
    description: "Session storage availability.",
    items: [
      { label: "API", value: "sessionStorage" in window ? "available" : "unsupported" },
      { label: "Content Scan", value: "disabled" }
    ]
  };
}

export const initSessionStorage = getSessionStorageInfo;
