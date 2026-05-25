import { MODULE_STATUSES } from "../../constants.js";

export function getIpInfo() {
  return {
    id: "network-ip",
    group: "network",
    groupLabel: "Network",
    title: "Public IP",
    status: MODULE_STATUSES.unsupported,
    description: "Public IP requires a remote service and is disabled in the static base build.",
    items: [
      { label: "Lookup", value: "disabled" },
      { label: "Backend", value: "not configured" }
    ]
  };
}

export const initIp = getIpInfo;
