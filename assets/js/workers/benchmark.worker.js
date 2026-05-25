self.addEventListener("message", (event) => {
  if (event.data?.type !== "benchmark") return;
  self.postMessage({ type: "benchmark:complete", score: 0, status: "stub" });
});
