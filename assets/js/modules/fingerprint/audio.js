import { MODULE_STATUSES } from "../../constants.js";

export function getAudioFingerprintInfo() {
  return {
    id: "fingerprint-audio",
    group: "fingerprint",
    groupLabel: "Fingerprint",
    title: "Audio Fingerprint",
    status: "AudioContext" in window || "webkitAudioContext" in window ? MODULE_STATUSES.available : MODULE_STATUSES.unsupported,
    description: "Audio API support only; no oscillator fingerprint is run.",
    items: [
      { label: "AudioContext", value: "AudioContext" in window || "webkitAudioContext" in window ? "available" : "unsupported" },
      { label: "Fingerprint Run", value: "disabled" }
    ]
  };
}

export const initAudio = getAudioFingerprintInfo;
