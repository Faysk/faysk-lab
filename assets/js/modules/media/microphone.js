import { MODULE_STATUSES } from "../../constants.js";

export function getMicrophoneInfo() {
  return {
    id: "media-microphone",
    group: "media",
    groupLabel: "Media",
    title: "Microphone",
    status: navigator.mediaDevices ? MODULE_STATUSES.permissionRequired : MODULE_STATUSES.unsupported,
    description: "Microphone access is never requested during boot or scan.",
    items: [
      { label: "Access", value: "disabled" },
      { label: "Prompt", value: "not triggered" }
    ]
  };
}

export const initMicrophone = getMicrophoneInfo;
