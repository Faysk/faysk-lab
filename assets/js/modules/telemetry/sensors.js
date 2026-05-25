import { MODULE_STATUSES } from "../../constants.js";

export function getSensorsInfo() {
  return {
    id: "telemetry-sensors",
    group: "telemetry",
    groupLabel: "Telemetry",
    title: "Sensors",
    status: "DeviceMotionEvent" in window || "DeviceOrientationEvent" in window ? MODULE_STATUSES.permissionRequired : MODULE_STATUSES.unsupported,
    description: "Sensor support check only.",
    items: [
      { label: "Motion", value: "DeviceMotionEvent" in window ? "available" : "unsupported" },
      { label: "Orientation", value: "DeviceOrientationEvent" in window ? "available" : "unsupported" }
    ]
  };
}

export const initSensors = getSensorsInfo;
