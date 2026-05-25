export function initMotion() {
  return {
    id: "sensor-motion-compat",
    group: "telemetry",
    groupLabel: "Telemetry",
    title: "Motion Sensor",
    status: "DeviceMotionEvent" in window ? "permission-required" : "unsupported",
    description: "Compatibility shim for motion sensor support checks.",
    items: [
      { label: "API", value: "DeviceMotionEvent" in window ? "available" : "unsupported" },
      { label: "Prompt", value: "not triggered" }
    ]
  };
}

