import { MODULE_STATUSES } from "../../constants.js";

export function getBluetoothInfo() {
  return {
    id: "experimental-bluetooth",
    group: "experimental",
    groupLabel: "Experimental",
    title: "Bluetooth",
    status: "bluetooth" in navigator ? MODULE_STATUSES.permissionRequired : MODULE_STATUSES.unsupported,
    description: "Support check only; no device chooser is opened.",
    items: [
      { label: "API", value: "bluetooth" in navigator ? "available" : "unsupported" },
      { label: "Prompt", value: "not triggered" }
    ]
  };
}

export const initBluetooth = getBluetoothInfo;
