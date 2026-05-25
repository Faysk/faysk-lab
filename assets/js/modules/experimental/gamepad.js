import { MODULE_STATUSES } from "../../constants.js";

export function getGamepadInfo() {
  return {
    id: "experimental-gamepad",
    group: "experimental",
    groupLabel: "Experimental",
    title: "Gamepad",
    status: "getGamepads" in navigator ? MODULE_STATUSES.available : MODULE_STATUSES.unsupported,
    description: "Gamepad API support check.",
    items: [
      { label: "API", value: "getGamepads" in navigator ? "available" : "unsupported" },
      { label: "Polling", value: "disabled" }
    ]
  };
}

export const initGamepad = getGamepadInfo;
