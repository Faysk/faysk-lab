import { MODULE_STATUSES } from "../../constants.js";

export function getHardwareInfo() {
  return {
    id: "system-hardware",
    group: "system",
    groupLabel: "System",
    title: "Hardware",
    status: MODULE_STATUSES.available,
    description: "Browser-exposed hardware hints.",
    items: [
      { label: "CPU Threads", value: String(navigator.hardwareConcurrency || "unavailable") },
      { label: "Device Memory", value: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "unavailable" }
    ]
  };
}

export const initHardware = getHardwareInfo;
