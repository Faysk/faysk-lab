import { qs } from "./core/dom.js?v=0.4.0";
import { log } from "./core/logger.js?v=0.4.0";
import { subscribe } from "./state.js?v=0.4.0";
import { initUI } from "./ui/ui.js?v=0.4.0";
import { bindTerminal } from "./ui/terminal.js?v=0.4.0";

function boot() {
  const root = qs("#app");

  if (!root) {
    throw new Error("App root not found.");
  }

  bindTerminal();

  const ui = initUI(root);

  subscribe(() => {
    ui.renderTelemetryGrid();
    ui.updateSummary();
    ui.updateGridHeader();
    ui.updateSidebar();
  });

  log("Initializing telemetry systems...");
  log("Preparing browser diagnostics...");
  log("Diagnostics interface ready.");
}

boot();
