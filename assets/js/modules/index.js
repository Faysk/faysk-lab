import { getBrowserInfo } from "./browser/browser.js";
import { getLanguagesInfo } from "./browser/languages.js";
import { getPermissionsInfo } from "./browser/permissions.js?v=0.4.0";
import { getScreenInfo } from "./system/screen.js";
import { getHardwareInfo } from "./system/hardware.js";
import { getMemoryInfo } from "./system/memory.js";
import { getBatteryInfo } from "./system/battery.js";
import { getStorageInfo } from "./system/storage.js";
import { getTouchInfo } from "./system/touch.js";
import { getGpuInfo } from "./gpu/gpu.js?v=0.4.0";
import { getCanvasInfo } from "./gpu/canvas.js";
import { getFingerprintInfo } from "./fingerprint/fingerprint.js?v=0.4.0";
import { getAudioFingerprintInfo } from "./fingerprint/audio.js";
import { getFontsInfo } from "./fingerprint/fonts.js";
import { getNetworkInfo } from "./network/network.js";
import { getIpInfo } from "./network/ip.js?v=0.4.0";
import { getWebRtcInfo } from "./network/webrtc.js";
import { getLatencyInfo } from "./network/latency.js?v=0.4.0";
import { getGeolocationInfo } from "./geolocation/geolocation.js?v=0.4.0";
import { getTimezoneInfo } from "./geolocation/timezone.js";
import { getLocaleInfo } from "./geolocation/locale.js";
import { getMediaDevicesInfo } from "./media/mediaDevices.js?v=0.4.0";
import { getPerformanceInfo } from "./telemetry/performance.js";
import { getFpsInfo } from "./telemetry/fps.js";
import { getTimingInfo } from "./telemetry/timing.js";
import { getSensorsInfo } from "./telemetry/sensors.js";
import { getCookiesInfo } from "./security/cookies.js";
import { getLocalStorageInfo } from "./security/localStorage.js?v=0.4.0";
import { getHttpsInfo } from "./security/https.js";
import { getCspInfo } from "./security/csp.js?v=0.4.0";
import { getBluetoothInfo } from "./experimental/bluetooth.js";
import { getUsbInfo } from "./experimental/usb.js";
import { getSerialInfo } from "./experimental/serial.js";
import { getGamepadInfo } from "./experimental/gamepad.js";
import { getVrInfo } from "./experimental/vr.js";

const collectors = [
  getBrowserInfo,
  getLanguagesInfo,
  getPermissionsInfo,
  getScreenInfo,
  getHardwareInfo,
  getMemoryInfo,
  getBatteryInfo,
  getStorageInfo,
  getTouchInfo,
  getGpuInfo,
  getCanvasInfo,
  getFingerprintInfo,
  getAudioFingerprintInfo,
  getFontsInfo,
  getNetworkInfo,
  getIpInfo,
  getWebRtcInfo,
  getLatencyInfo,
  getGeolocationInfo,
  getTimezoneInfo,
  getLocaleInfo,
  getMediaDevicesInfo,
  getPerformanceInfo,
  getFpsInfo,
  getTimingInfo,
  getSensorsInfo,
  getCookiesInfo,
  getLocalStorageInfo,
  getHttpsInfo,
  getCspInfo,
  getBluetoothInfo,
  getUsbInfo,
  getSerialInfo,
  getGamepadInfo,
  getVrInfo
];

function createCollectorError(collector, error) {
  return {
    id: `collector-error-${collector.name || "unknown"}`,
    group: "telemetry",
    groupLabel: "Telemetry",
    title: collector.name || "Telemetry Collector",
    status: "unsupported",
    description: "This module failed safely and did not stop the interface.",
    items: [
      { label: "Error", value: error?.message || "unknown failure" },
      { label: "Fallback", value: "isolated" }
    ]
  };
}

export function collectTelemetry() {
  return collectors.map((collector) => {
    try {
      const module = collector();
      return {
        ...module,
        status: module.status === "permission-required" ? "action-required" : module.status
      };
    } catch (error) {
      return createCollectorError(collector, error);
    }
  });
}
