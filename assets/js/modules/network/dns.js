import { MODULE_STATUSES } from "../../constants.js";

export function getDnsInfo() {
  return {
    id: "network-dns",
    group: "network",
    groupLabel: "Network",
    title: "DNS",
    status: MODULE_STATUSES.unsupported,
    description: "DNS diagnostics need a backend or controlled endpoint.",
    items: [
      { label: "Resolver", value: "unavailable in browser" },
      { label: "Status", value: "planned" }
    ]
  };
}

export const initDns = getDnsInfo;
