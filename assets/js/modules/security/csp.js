import { MODULE_STATUSES } from "../../constants.js";

export function getCspInfo() {
  const hasCspMeta = Boolean(document.querySelector("meta[http-equiv='Content-Security-Policy']"));
  return {
    id: "security-csp",
    group: "security",
    groupLabel: "Security",
    title: "CSP",
    status: hasCspMeta ? MODULE_STATUSES.available : MODULE_STATUSES.unsupported,
    description: "Content Security Policy presence check.",
    items: [
      { label: "Meta Policy", value: hasCspMeta ? "present" : "not configured" },
      { label: "Header Policy", value: "not visible to static JS" }
    ]
  };
}

export const initCsp = getCspInfo;
