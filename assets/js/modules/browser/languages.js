import { MODULE_STATUSES } from "../../constants.js";

export function getLanguagesInfo() {
  return {
    id: "browser-languages",
    group: "browser",
    groupLabel: "Browser",
    title: "Languages",
    status: MODULE_STATUSES.available,
    description: "Language and locale preferences.",
    items: [
      { label: "Primary", value: navigator.language || "unavailable" },
      { label: "List", value: navigator.languages?.join(", ") || "unavailable" }
    ]
  };
}

export const initLanguages = getLanguagesInfo;
