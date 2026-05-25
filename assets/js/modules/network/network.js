import { MODULE_STATUSES } from "../../constants.js";

export function getNetworkInfo() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  return {
    id: "network-connection",
    group: "network",
    groupLabel: "Network",
    title: "Connection",
    status: connection ? MODULE_STATUSES.available : MODULE_STATUSES.unsupported,
    description: "Network Information API support.",
    items: [
      { label: "Type", value: connection?.effectiveType || "unavailable" },
      { label: "Downlink", value: connection?.downlink ? `${connection.downlink} Mbps` : "unavailable" },
      { label: "RTT", value: connection?.rtt ? `${connection.rtt}ms` : "unavailable" }
    ]
  };
}

export const initNetwork = getNetworkInfo;
