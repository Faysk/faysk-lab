export function readWebGlInfo() {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

  if (!gl) {
    return { supported: false, vendor: "unsupported", renderer: "unsupported" };
  }

  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  return {
    supported: true,
    vendor: debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
    renderer: debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)
  };
}

export function initWebgl() {
  const info = readWebGlInfo();

  return {
    id: "gpu-webgl-compat",
    group: "gpu",
    groupLabel: "GPU",
    title: "WebGL",
    status: info.supported ? "available" : "unsupported",
    description: "Compatibility shim for WebGL diagnostics.",
    items: [
      { label: "Vendor", value: info.vendor },
      { label: "Renderer", value: info.renderer }
    ]
  };
}

export const initWebGl = initWebgl;
