export const APP_NAME = "lab.faysk.dev";
export const APP_VERSION = "0.1-alpha";
export const BUILD_NAME = "lab-build";

export const MODULE_STATUSES = {
  available: "available",
  unsupported: "unsupported",
  permissionRequired: "permission-required"
};

export const MODULE_GROUPS = [
  { id: "browser", label: "Browser", icon: "BR" },
  { id: "system", label: "System", icon: "SY" },
  { id: "gpu", label: "GPU", icon: "GP" },
  { id: "fingerprint", label: "Fingerprint", icon: "FP" },
  { id: "network", label: "Network", icon: "NW" },
  { id: "geolocation", label: "Geolocation", icon: "GL" },
  { id: "media", label: "Media", icon: "AV" },
  { id: "telemetry", label: "Telemetry", icon: "TM" },
  { id: "security", label: "Security", icon: "SC" },
  { id: "experimental", label: "Experimental", icon: "XP" }
];
