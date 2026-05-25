import { MODULE_STATUSES } from "../../constants.js";

export function getIpInfo() {
  const location = window.__fayskLiveDiagnostics?.location;

  return {
    id: "network-ip",
    group: "network",
    groupLabel: "Network",
    title: "Public IP",
    status: location?.ip && location.ip !== "unavailable" ? MODULE_STATUSES.available : MODULE_STATUSES.permissionRequired,
    description: "Public IP and approximate location from the first-party Cloudflare endpoint, with external fallback during local development.",
    items: [
      { label: "IP", value: location?.ip || "measure in progress" },
      { label: "Location", value: location ? [location.city, location.region, location.country].filter(Boolean).join(", ") || "unavailable" : "measure in progress" },
      { label: "Provider", value: location?.source || "measure in progress" }
    ]
  };
}

export const initIp = getIpInfo;
