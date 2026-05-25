import { MODULE_STATUSES } from "../../constants.js";

export function getMediaDevicesInfo() {
  return {
    id: "media-devices",
    group: "media",
    groupLabel: "Media",
    title: "Media Devices",
    status: navigator.mediaDevices ? MODULE_STATUSES.permissionRequired : MODULE_STATUSES.unsupported,
    description: "Support check only; camera and microphone are not requested.",
    items: [
      { label: "mediaDevices", value: navigator.mediaDevices ? "available" : "unsupported" },
      { label: "Enumeration", value: "disabled until explicit action" }
    ]
  };
}

export const initMediaDevices = getMediaDevicesInfo;
