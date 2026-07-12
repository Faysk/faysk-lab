import { MODULE_STATUSES } from "../../constants.js?v=0.4.0";

export function getMediaDevicesInfo() {
  const states = window.__fayskLiveDiagnostics?.permissions?.states || {};

  return {
    id: "media-devices",
    group: "media",
    groupLabel: "Media",
    title: "Media Capture",
    status: navigator.mediaDevices ? MODULE_STATUSES.permissionRequired : MODULE_STATUSES.unsupported,
    description: "Camera and microphone capability check. No device is opened or enumerated.",
    items: [
      { label: "API", value: navigator.mediaDevices ? "supported" : "unsupported" },
      { label: "Camera", value: states.camera || "checking" },
      { label: "Microphone", value: states.microphone || "checking" },
      { label: "Collection", value: "never automatic" }
    ]
  };
}

export const initMediaDevices = getMediaDevicesInfo;
