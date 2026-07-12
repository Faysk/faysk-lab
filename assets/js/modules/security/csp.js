import { MODULE_STATUSES } from "../../constants.js";

export function getCspInfo() {
  const hasCspMeta = Boolean(document.querySelector("meta[http-equiv='Content-Security-Policy']"));
  return {
    id: "security-csp",
    group: "security",
    groupLabel: "Security",
    title: "CSP",
    status: hasCspMeta ? MODULE_STATUSES.available : MODULE_STATUSES.unsupported,
    description: "Restrictive same-origin policy with explicit blocks for plugins, forms, workers and media.",
    items: [
      { label: "Meta fallback", value: hasCspMeta ? "active" : "not configured" },
      { label: "Production", value: "Cloudflare header configured" },
      { label: "Default source", value: "same origin" }
    ]
  };
}

export const initCsp = getCspInfo;
