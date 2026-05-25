import { MODULE_STATUSES } from "../../constants.js";

export function getScreenInfo() {
  return {
    id: "system-screen",
    group: "system",
    groupLabel: "System",
    title: "Screen",
    status: MODULE_STATUSES.available,
    description: "Display metrics.",
    items: [
      { label: "Viewport", value: `${window.innerWidth}x${window.innerHeight}` },
      { label: "Screen", value: `${window.screen.width}x${window.screen.height}` },
      { label: "Pixel Ratio", value: String(window.devicePixelRatio || 1) }
    ]
  };
}

export const initScreen = getScreenInfo;
