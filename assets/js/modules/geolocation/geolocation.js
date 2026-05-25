import { MODULE_STATUSES } from "../../constants.js";

export function getGeolocationInfo() {
  return {
    id: "geo-geolocation",
    group: "geolocation",
    groupLabel: "Geolocation",
    title: "Geolocation",
    status: "geolocation" in navigator ? MODULE_STATUSES.permissionRequired : MODULE_STATUSES.unsupported,
    description: "Support check only; no location permission prompt is triggered.",
    items: [
      { label: "API", value: "geolocation" in navigator ? "available" : "unsupported" },
      { label: "Collection", value: "requires explicit user action" }
    ]
  };
}

export const initGeolocation = getGeolocationInfo;
