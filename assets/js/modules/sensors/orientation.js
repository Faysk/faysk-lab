export function initOrientation() {
  return {
    id: "sensor-orientation-compat",
    group: "telemetry",
    groupLabel: "Telemetry",
    title: "Orientation Sensor",
    status: "DeviceOrientationEvent" in window ? "permission-required" : "unsupported",
    description: "Compatibility shim for orientation support checks.",
    items: [
      { label: "API", value: "DeviceOrientationEvent" in window ? "available" : "unsupported" },
      { label: "Prompt", value: "not triggered" }
    ]
  };
}

