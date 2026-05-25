import { MODULE_STATUSES } from "../../constants.js";

export function getCameraInfo() {
  return {
    id: "media-camera",
    group: "media",
    groupLabel: "Media",
    title: "Camera",
    status: navigator.mediaDevices ? MODULE_STATUSES.permissionRequired : MODULE_STATUSES.unsupported,
    description: "Camera access is never requested during boot or scan.",
    items: [
      { label: "Access", value: "disabled" },
      { label: "Prompt", value: "not triggered" }
    ]
  };
}

export const initCamera = getCameraInfo;
