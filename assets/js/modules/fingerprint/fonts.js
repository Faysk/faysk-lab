import { MODULE_STATUSES } from "../../constants.js";

export function getFontsInfo() {
  return {
    id: "fingerprint-fonts",
    group: "fingerprint",
    groupLabel: "Fingerprint",
    title: "Fonts",
    status: "fonts" in document ? MODULE_STATUSES.available : MODULE_STATUSES.unsupported,
    description: "Font Loading API support.",
    items: [
      { label: "FontFaceSet", value: "fonts" in document ? "available" : "unsupported" },
      { label: "Enumeration", value: "not performed" }
    ]
  };
}

export const initFonts = getFontsInfo;
