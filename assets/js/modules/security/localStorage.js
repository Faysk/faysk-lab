import { MODULE_STATUSES } from "../../constants.js?v=0.4.0";

export function getLocalStorageInfo() {
  const local = "localStorage" in window;
  const session = "sessionStorage" in window;

  return {
    id: "security-web-storage",
    group: "security",
    groupLabel: "Security",
    title: "Web Storage",
    status: local || session ? MODULE_STATUSES.available : MODULE_STATUSES.unsupported,
    description: "Availability only. Stored values are never inspected.",
    items: [
      { label: "localStorage", value: local ? "available" : "unsupported" },
      { label: "sessionStorage", value: session ? "available" : "unsupported" },
      { label: "Content scan", value: "never" }
    ]
  };
}

export const initLocalStorage = getLocalStorageInfo;
