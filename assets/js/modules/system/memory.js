import { MODULE_STATUSES } from "../../constants.js";
import { formatBytes } from "../../core/utils.js";

export function getMemoryInfo() {
  const memory = performance.memory;
  return {
    id: "system-memory",
    group: "system",
    groupLabel: "System",
    title: "Memory",
    status: memory ? MODULE_STATUSES.available : MODULE_STATUSES.unsupported,
    description: "JS heap metrics where the browser exposes them.",
    items: [
      { label: "Used Heap", value: memory ? formatBytes(memory.usedJSHeapSize) : "unsupported" },
      { label: "Heap Limit", value: memory ? formatBytes(memory.jsHeapSizeLimit) : "unsupported" }
    ]
  };
}

export const initMemory = getMemoryInfo;
