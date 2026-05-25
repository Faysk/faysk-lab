export const APP_NAME = "Faysk Lab";
export const APP_VERSION = "0.1-alpha";
export const BUILD_NAME = "browser-observatory";

export const MODULE_STATUSES = {
  available: "available",
  unsupported: "unsupported",
  permissionRequired: "permission-required"
};

export const MODULE_GROUPS = [
  { id: "browser", label: "Browser", icon: "BR" },
  { id: "system", label: "System", icon: "SY" },
  { id: "gpu", label: "Graphics", icon: "GX" },
  { id: "fingerprint", label: "Fingerprint", icon: "FP" },
  { id: "network", label: "Network", icon: "NW" },
  { id: "geolocation", label: "Locale", icon: "LC" },
  { id: "media", label: "Media", icon: "AV" },
  { id: "telemetry", label: "Runtime", icon: "RT" },
  { id: "security", label: "Security", icon: "SC" },
  { id: "experimental", label: "Experimental", icon: "XP" }
];
