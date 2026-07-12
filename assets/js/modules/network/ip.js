import { MODULE_STATUSES } from "../../constants.js?v=0.4.0";

export function getIpInfo() {
  const location = window.__fayskLiveDiagnostics?.location;

  return {
    id: "network-ip",
    group: "network",
    groupLabel: "Network",
    title: "Public IP",
    status: location?.ip && location.ip !== "unavailable" ? MODULE_STATUSES.available : MODULE_STATUSES.unavailable,
    description: "Public IP and approximate region from the first-party Cloudflare request. No third-party lookup is used.",
    items: [
      { label: "IP", value: location?.ip || "measure in progress" },
      { label: "Location", value: location ? [location.city, location.region, location.country].filter(Boolean).join(", ") || "unavailable" : "measure in progress" },
      { label: "Provider", value: location?.source || "measure in progress" }
    ]
  };
}

export const initIp = getIpInfo;
