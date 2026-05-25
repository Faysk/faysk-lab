import { MODULE_STATUSES } from "../../constants.js";

export function getSerialInfo() {
  return {
    id: "experimental-serial",
    group: "experimental",
    groupLabel: "Experimental",
    title: "Serial",
    status: "serial" in navigator ? MODULE_STATUSES.permissionRequired : MODULE_STATUSES.unsupported,
    description: "Support check only; no serial device prompt is triggered.",
    items: [
      { label: "API", value: "serial" in navigator ? "available" : "unsupported" },
      { label: "Prompt", value: "not triggered" }
    ]
  };
}

export const initSerial = getSerialInfo;
