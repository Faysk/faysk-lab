import { MODULE_STATUSES } from "../../constants.js?v=0.4.0";

export function getGeolocationInfo() {
  const permission = window.__fayskLiveDiagnostics?.permissions?.states?.geolocation;

  return {
    id: "geo-geolocation",
    group: "geolocation",
    groupLabel: "Geolocation",
    title: "Geolocation",
    status: "geolocation" in navigator ? MODULE_STATUSES.permissionRequired : MODULE_STATUSES.unsupported,
    description: "Support check only; no location permission prompt is triggered.",
    items: [
      { label: "API", value: "geolocation" in navigator ? "supported" : "unsupported" },
      { label: "Permission", value: permission || "checking" },
      { label: "Collection", value: "never automatic" }
    ]
  };
}

export const initGeolocation = getGeolocationInfo;
