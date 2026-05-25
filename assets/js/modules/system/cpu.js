import { MODULE_STATUSES } from "../../constants.js";

export function getCpuInfo() {
  return {
    id: "system-cpu",
    group: "system",
    groupLabel: "System",
    title: "CPU",
    status: MODULE_STATUSES.available,
    description: "Lightweight CPU capability hints.",
    items: [
      { label: "Threads", value: String(navigator.hardwareConcurrency || "unavailable") },
      { label: "Benchmark", value: "idle until requested" }
    ]
  };
}

export const initCpu = getCpuInfo;
