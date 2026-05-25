import { MODULE_STATUSES } from "../../constants.js";

export function getFingerprintInfo() {
  return {
    id: "fingerprint-summary",
    group: "fingerprint",
    groupLabel: "Fingerprint",
    title: "Fingerprint Summary",
    status: MODULE_STATUSES.available,
    description: "Non-invasive fingerprinting overview.",
    items: [
      { label: "Mode", value: "safe summary" },
      { label: "Entropy", value: "estimated only" }
    ]
  };
}

export const initFingerprint = getFingerprintInfo;
