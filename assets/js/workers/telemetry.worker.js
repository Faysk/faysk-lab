self.addEventListener("message", (event) => {
  if (event.data?.type !== "telemetry") return;
  self.postMessage({ type: "telemetry:complete", payload: event.data.payload ?? null });
});
