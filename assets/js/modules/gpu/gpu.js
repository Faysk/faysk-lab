import { MODULE_STATUSES } from "../../constants.js";
import { readWebGlInfo } from "./webgl.js";

export function getGpuInfo() {
  const info = readWebGlInfo();
  return {
    id: "gpu-runtime",
    group: "gpu",
    groupLabel: "GPU",
    title: "Graphics APIs",
    status: info.supported ? MODULE_STATUSES.available : MODULE_STATUSES.unsupported,
    description: "Graphics runtime diagnostics.",
    items: [
      { label: "WebGL", value: info.supported ? "available" : "unsupported" },
      { label: "Vendor", value: info.vendor },
      { label: "Renderer", value: info.renderer },
      { label: "WebGPU", value: "gpu" in navigator ? "supported" : "unsupported" }
    ]
  };
}

export const initGpu = getGpuInfo;
