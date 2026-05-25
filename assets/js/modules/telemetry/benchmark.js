import { MODULE_STATUSES } from "../../constants.js";

export function getBenchmarkInfo() {
  return {
    id: "telemetry-benchmark",
    group: "telemetry",
    groupLabel: "Telemetry",
    title: "Benchmark",
    status: MODULE_STATUSES.available,
    description: "Benchmark worker placeholder.",
    items: [
      { label: "Worker", value: "available as stub" },
      { label: "Stress Test", value: "not running" }
    ]
  };
}

export const initBenchmark = getBenchmarkInfo;
