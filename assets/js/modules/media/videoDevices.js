import { MODULE_STATUSES } from "../../constants.js";

export function getVideoDevicesInfo() {
  return {
    id: "media-video-devices",
    group: "media",
    groupLabel: "Media",
    title: "Video Devices",
    status: navigator.mediaDevices ? MODULE_STATUSES.permissionRequired : MODULE_STATUSES.unsupported,
    description: "Camera enumeration is disabled in the base build.",
    items: [
      { label: "Cameras", value: "not requested" },
      { label: "Permission", value: "required" }
    ]
  };
}

export const initVideoDevices = getVideoDevicesInfo;
