import { MODULE_STATUSES } from "../../constants.js";

export function getPluginsInfo() {
  return {
    id: "browser-plugins",
    group: "browser",
    groupLabel: "Browser",
    title: "Plugins",
    status: MODULE_STATUSES.available,
    description: "Plugin visibility from the browser runtime.",
    items: [
      { label: "Count", value: String(navigator.plugins?.length ?? 0) },
      { label: "PDF Viewer", value: navigator.pdfViewerEnabled ? "enabled" : "unknown" }
    ]
  };
}

export const initPlugins = getPluginsInfo;
