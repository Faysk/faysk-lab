import { MODULE_STATUSES } from "../../constants.js?v=0.4.0";

export function getFingerprintInfo() {
  return {
    id: "fingerprint-summary",
    group: "fingerprint",
    groupLabel: "Fingerprint",
    title: "Privacy Surface",
    status: MODULE_STATUSES.available,
    description: "Explains the passive signals this page can expose without creating a persistent identifier.",
    items: [
      { label: "Identifier", value: "not generated" },
      { label: "Persistence", value: "none" },
      { label: "Collection", value: "current page only" }
    ]
  };
}

export const initFingerprint = getFingerprintInfo;
