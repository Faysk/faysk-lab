import { MODULE_STATUSES } from "../../constants.js";
import { readWebGlInfo } from "./webgl.js";

export function getGpuInfo() {
  const info = readWebGlInfo();
  return {
    id: "gpu-runtime",
    group: "gpu",
    groupLabel: "GPU",
    title: "WebGL GPU",
    status: info.supported ? MODULE_STATUSES.available : MODULE_STATUSES.unsupported,
    description: "Graphics runtime diagnostics.",
    items: [
      { label: "Vendor", value: info.vendor },
      { label: "Renderer", value: info.renderer }
    ]
  };
}

export const initGpu = getGpuInfo;
