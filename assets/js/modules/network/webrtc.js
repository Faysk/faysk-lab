import { MODULE_STATUSES } from "../../constants.js";

export function getWebRtcInfo() {
  return {
    id: "network-webrtc",
    group: "network",
    groupLabel: "Network",
    title: "WebRTC",
    status: "RTCPeerConnection" in window ? MODULE_STATUSES.available : MODULE_STATUSES.unsupported,
    description: "Support check only; no ICE candidate gathering is performed.",
    items: [
      { label: "RTCPeerConnection", value: "RTCPeerConnection" in window ? "available" : "unsupported" },
      { label: "Leak Scan", value: "disabled" }
    ]
  };
}

export const initWebrtc = getWebRtcInfo;
export const initWebRtc = getWebRtcInfo;
