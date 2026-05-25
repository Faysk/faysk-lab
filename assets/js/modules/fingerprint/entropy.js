import { MODULE_STATUSES } from "../../constants.js";

export function getEntropyInfo() {
  return {
    id: "fingerprint-entropy",
    group: "fingerprint",
    groupLabel: "Fingerprint",
    title: "Entropy",
    status: MODULE_STATUSES.available,
    description: "Placeholder for future entropy scoring.",
    items: [
      { label: "Score", value: "pending model" },
      { label: "Inputs", value: "safe metadata only" }
    ]
  };
}

export const initEntropy = getEntropyInfo;
