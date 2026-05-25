import { getBrowserInfo } from "./browser/browser.js";
import { getLanguagesInfo } from "./browser/languages.js";
import { getPluginsInfo } from "./browser/plugins.js";
import { getPermissionsInfo } from "./browser/permissions.js";
import { getScreenInfo } from "./system/screen.js";
import { getHardwareInfo } from "./system/hardware.js";
import { getMemoryInfo } from "./system/memory.js";
import { getCpuInfo } from "./system/cpu.js";
import { getBatteryInfo } from "./system/battery.js";
import { getStorageInfo } from "./system/storage.js";
import { getTouchInfo } from "./system/touch.js";
import { getGpuInfo } from "./gpu/gpu.js";
import { getCanvasInfo } from "./gpu/canvas.js";
import { getFingerprintInfo } from "./fingerprint/fingerprint.js";
import { getAudioFingerprintInfo } from "./fingerprint/audio.js";
import { getFontsInfo } from "./fingerprint/fonts.js";
import { getEntropyInfo } from "./fingerprint/entropy.js";
import { getBehaviorInfo } from "./fingerprint/behavior.js";
import { getNetworkInfo } from "./network/network.js";
import { getIpInfo } from "./network/ip.js";
import { getWebRtcInfo } from "./network/webrtc.js";
import { getLatencyInfo } from "./network/latency.js";
import { getDnsInfo } from "./network/dns.js";
import { getGeolocationInfo } from "./geolocation/geolocation.js";
import { getTimezoneInfo } from "./geolocation/timezone.js";
import { getLocaleInfo } from "./geolocation/locale.js";
import { getMediaDevicesInfo } from "./media/mediaDevices.js";
import { getAudioDevicesInfo } from "./media/audioDevices.js";
import { getVideoDevicesInfo } from "./media/videoDevices.js";
import { getMicrophoneInfo } from "./media/microphone.js";
import { getCameraInfo } from "./media/camera.js";
import { getPerformanceInfo } from "./telemetry/performance.js";
import { getBenchmarkInfo } from "./telemetry/benchmark.js";
import { getFpsInfo } from "./telemetry/fps.js";
import { getTimingInfo } from "./telemetry/timing.js";
import { getSensorsInfo } from "./telemetry/sensors.js";
import { getSecurityInfo } from "./security/security.js";
import { getCookiesInfo } from "./security/cookies.js";
import { getLocalStorageInfo } from "./security/localStorage.js";
import { getSessionStorageInfo } from "./security/sessionStorage.js";
import { getHttpsInfo } from "./security/https.js";
import { getCspInfo } from "./security/csp.js";
import { getBluetoothInfo } from "./experimental/bluetooth.js";
import { getUsbInfo } from "./experimental/usb.js";
import { getSerialInfo } from "./experimental/serial.js";
import { getGamepadInfo } from "./experimental/gamepad.js";
import { getVrInfo } from "./experimental/vr.js";

const collectors = [
  getBrowserInfo,
  getLanguagesInfo,
  getPluginsInfo,
  getPermissionsInfo,
  getScreenInfo,
  getHardwareInfo,
  getMemoryInfo,
  getCpuInfo,
  getBatteryInfo,
  getStorageInfo,
  getTouchInfo,
  getGpuInfo,
  getCanvasInfo,
  getFingerprintInfo,
  getAudioFingerprintInfo,
  getFontsInfo,
  getEntropyInfo,
  getBehaviorInfo,
  getNetworkInfo,
  getIpInfo,
  getWebRtcInfo,
  getLatencyInfo,
  getDnsInfo,
  getGeolocationInfo,
  getTimezoneInfo,
  getLocaleInfo,
  getMediaDevicesInfo,
  getAudioDevicesInfo,
  getVideoDevicesInfo,
  getMicrophoneInfo,
  getCameraInfo,
  getPerformanceInfo,
  getBenchmarkInfo,
  getFpsInfo,
  getTimingInfo,
  getSensorsInfo,
  getSecurityInfo,
  getCookiesInfo,
  getLocalStorageInfo,
  getSessionStorageInfo,
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
      return collector();
    } catch (error) {
      return createCollectorError(collector, error);
    }
  });
}
