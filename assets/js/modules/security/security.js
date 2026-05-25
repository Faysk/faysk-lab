import { MODULE_STATUSES } from "../../constants.js";

export function getSecurityInfo() {
  return {
    id: "security-summary",
    group: "security",
    groupLabel: "Security",
    title: "Security Summary",
    status: MODULE_STATUSES.available,
    description: "Safe browser security snapshot.",
    items: [
      { label: "Secure Context", value: window.isSecureContext ? "yes" : "no" },
      { label: "Protocol", value: window.location.protocol }
    ]
  };
}

export const initSecurity = getSecurityInfo;
