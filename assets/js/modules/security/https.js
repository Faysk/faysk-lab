import { MODULE_STATUSES } from "../../constants.js";

export function getHttpsInfo() {
  const secure = window.location.protocol === "https:" || window.location.hostname === "localhost";
  return {
    id: "security-https",
    group: "security",
    groupLabel: "Security",
    title: "HTTPS",
    status: secure ? MODULE_STATUSES.available : MODULE_STATUSES.unsupported,
    description: "Secure transport check.",
    items: [
      { label: "Protocol", value: window.location.protocol },
      { label: "Secure Context", value: window.isSecureContext ? "yes" : "no" }
    ]
  };
}

export const initHttps = getHttpsInfo;
