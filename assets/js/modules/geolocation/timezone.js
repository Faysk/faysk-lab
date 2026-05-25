import { MODULE_STATUSES } from "../../constants.js";

export function getTimezoneInfo() {
  return {
    id: "geo-timezone",
    group: "geolocation",
    groupLabel: "Geolocation",
    title: "Timezone",
    status: MODULE_STATUSES.available,
    description: "Timezone from Intl API.",
    items: [
      { label: "Zone", value: Intl.DateTimeFormat().resolvedOptions().timeZone || "unavailable" },
      { label: "Offset", value: `${-(new Date().getTimezoneOffset() / 60)}h` }
    ]
  };
}

export const initTimezone = getTimezoneInfo;
