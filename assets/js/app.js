import { CONFIG } from "./config.js";
import { qs } from "./core/dom.js";
import { log } from "./core/logger.js";
import { subscribe } from "./state.js";
import { initUI } from "./ui/ui.js";
import { bindTerminal } from "./ui/terminal.js";
import { initTheme } from "./ui/theme.js";
import { initParticles } from "./ui/particles.js";
import { initGlow } from "./ui/glow.js";

function boot() {
  const root = qs("#app");

  if (!root) {
    throw new Error("App root not found.");
  }

  initTheme(CONFIG.theme);
  initParticles();
  initGlow();
  bindTerminal();

  const ui = initUI(root);

  subscribe(() => {
    ui.renderTelemetryGrid();
    ui.updateSummary();
    ui.updateGridHeader();
    ui.updateSidebar();
    ui.updateOverlay();
  });

  log("Initializing telemetry systems...");
  log("Preparing browser diagnostics...");
  log("Cyberpunk interface online.");
}

boot();
