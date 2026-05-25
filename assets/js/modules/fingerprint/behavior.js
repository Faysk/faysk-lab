import { MODULE_STATUSES } from "../../constants.js";

export function getBehaviorInfo() {
  return {
    id: "fingerprint-behavior",
    group: "fingerprint",
    groupLabel: "Fingerprint",
    title: "Behavior",
    status: MODULE_STATUSES.permissionRequired,
    description: "Behavior collection is intentionally disabled in the base build.",
    items: [
      { label: "Tracking", value: "disabled" },
      { label: "Consent", value: "required for future builds" }
    ]
  };
}

export const initBehavior = getBehaviorInfo;
