import { MODULE_STATUSES } from "../../constants.js";

export function getUsbInfo() {
  return {
    id: "experimental-usb",
    group: "experimental",
    groupLabel: "Experimental",
    title: "USB",
    status: "usb" in navigator ? MODULE_STATUSES.permissionRequired : MODULE_STATUSES.unsupported,
    description: "Support check only; no USB permission prompt is triggered.",
    items: [
      { label: "API", value: "usb" in navigator ? "available" : "unsupported" },
      { label: "Prompt", value: "not triggered" }
    ]
  };
}

export const initUsb = getUsbInfo;
