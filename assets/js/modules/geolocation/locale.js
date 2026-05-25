import { MODULE_STATUSES } from "../../constants.js";

export function getLocaleInfo() {
  const options = Intl.DateTimeFormat().resolvedOptions();
  return {
    id: "geo-locale",
    group: "geolocation",
    groupLabel: "Geolocation",
    title: "Locale",
    status: MODULE_STATUSES.available,
    description: "Locale formatting profile.",
    items: [
      { label: "Locale", value: options.locale || navigator.language || "unavailable" },
      { label: "Calendar", value: options.calendar || "unavailable" },
      { label: "Numbering", value: options.numberingSystem || "unavailable" }
    ]
  };
}

export const initLocale = getLocaleInfo;
