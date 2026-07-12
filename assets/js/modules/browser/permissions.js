import { MODULE_STATUSES } from "../../constants.js?v=0.4.0";

export function getPermissionsInfo() {
  const permissions = window.__fayskLiveDiagnostics?.permissions;
  const states = permissions?.states || {};

  return {
    id: "browser-permissions",
    group: "browser",
    groupLabel: "Browser",
    title: "Permissions API",
    status: "permissions" in navigator ? MODULE_STATUSES.available : MODULE_STATUSES.unsupported,
    description: "Current states are queried read-only. This never requests access or opens a prompt.",
    items: [
      { label: "API", value: "permissions" in navigator ? "available" : "unsupported" },
      { label: "Location", value: states.geolocation || "checking" },
      { label: "Camera", value: states.camera || "checking" },
      { label: "Microphone", value: states.microphone || "checking" },
      { label: "Notifications", value: states.notifications || "checking" }
    ]
  };
}

export const initPermissions = getPermissionsInfo;
