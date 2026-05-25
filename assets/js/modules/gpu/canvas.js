import { MODULE_STATUSES } from "../../constants.js";

export function getCanvasInfo() {
  return {
    id: "gpu-canvas",
    group: "gpu",
    groupLabel: "GPU",
    title: "Canvas",
    status: "HTMLCanvasElement" in window ? MODULE_STATUSES.available : MODULE_STATUSES.unsupported,
    description: "Canvas API support.",
    items: [
      { label: "2D Context", value: "CanvasRenderingContext2D" in window ? "available" : "unsupported" },
      { label: "OffscreenCanvas", value: "OffscreenCanvas" in window ? "available" : "unsupported" }
    ]
  };
}

export const initCanvas = getCanvasInfo;
