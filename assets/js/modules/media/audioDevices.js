import { MODULE_STATUSES } from "../../constants.js";

export function getAudioDevicesInfo() {
  return {
    id: "media-audio-devices",
    group: "media",
    groupLabel: "Media",
    title: "Audio Devices",
    status: navigator.mediaDevices ? MODULE_STATUSES.permissionRequired : MODULE_STATUSES.unsupported,
    description: "Audio input/output enumeration is gated behind explicit consent.",
    items: [
      { label: "Inputs", value: "not requested" },
      { label: "Outputs", value: "not requested" }
    ]
  };
}

export const initAudioDevices = getAudioDevicesInfo;
