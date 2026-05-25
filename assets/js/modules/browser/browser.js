import { MODULE_STATUSES } from "../../constants.js";
import { safeRead } from "../../core/utils.js";

export function getBrowserInfo() {
  return {
    id: "browser-info",
    group: "browser",
    groupLabel: "Browser",
    title: "Browser Runtime",
    status: MODULE_STATUSES.available,
    description: "Browser environment overview.",
    items: [
      { label: "User Agent", value: safeRead(() => navigator.userAgent) },
      { label: "Platform", value: safeRead(() => navigator.platform) },
      { label: "Online", value: navigator.onLine ? "yes" : "no" }
    ]
  };
}

export const initBrowser = getBrowserInfo;
