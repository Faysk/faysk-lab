import { MODULE_STATUSES } from "../../constants.js";

export function getPermissionsInfo() {
  return {
    id: "browser-permissions",
    group: "browser",
    groupLabel: "Browser",
    title: "Permissions API",
    status: "permissions" in navigator ? MODULE_STATUSES.available : MODULE_STATUSES.unsupported,
    description: "Safe support check only; no permission prompts are triggered.",
    items: [
      { label: "API", value: "permissions" in navigator ? "available" : "unsupported" },
      { label: "Prompting", value: "disabled during boot" }
    ]
  };
}

export const initPermissions = getPermissionsInfo;
