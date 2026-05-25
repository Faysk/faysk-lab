import { MODULE_STATUSES } from "../../constants.js";

export function getVrInfo() {
  return {
    id: "experimental-vr",
    group: "experimental",
    groupLabel: "Experimental",
    title: "VR / XR",
    status: "xr" in navigator ? MODULE_STATUSES.permissionRequired : MODULE_STATUSES.unsupported,
    description: "WebXR support check only.",
    items: [
      { label: "WebXR", value: "xr" in navigator ? "available" : "unsupported" },
      { label: "Session", value: "not requested" }
    ]
  };
}

export const initVr = getVrInfo;
