import { MODULE_STATUSES } from "../../constants.js";

export function getCookiesInfo() {
  return {
    id: "security-cookies",
    group: "security",
    groupLabel: "Security",
    title: "Cookies",
    status: MODULE_STATUSES.available,
    description: "Cookie capability check.",
    items: [
      { label: "Enabled", value: navigator.cookieEnabled ? "yes" : "no" },
      { label: "Inspection", value: "not performed" }
    ]
  };
}

export const initCookies = getCookiesInfo;
