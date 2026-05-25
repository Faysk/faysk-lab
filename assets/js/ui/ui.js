import { APP_NAME, APP_VERSION, BUILD_NAME, MODULE_GROUPS } from "../constants.js";
import { createElement, qs, clear } from "../core/dom.js";
import { log } from "../core/logger.js";
import { getState, setState } from "../state.js";
import { collectTelemetry } from "../modules/index.js";
import { createEmptyState, createTelemetryCard } from "./cards.js";
import { renderSidebar } from "./sidebar.js";
import { renderTerminal } from "./terminal.js";
import { bindSearch } from "./search.js";

function getTelemetryStats(telemetry) {
  return telemetry.reduce((stats, module) => {
    stats.total += 1;
    stats[module.status] = (stats[module.status] || 0) + 1;
    return stats;
  }, {
    total: 0,
    available: 0,
    unsupported: 0,
    "permission-required": 0
  });
}

function createSearchIndex(module) {
  const itemText = module.items
    .map((item) => `${item.label} ${item.value}`)
    .join(" ");

  return `${module.title} ${module.groupLabel} ${module.description} ${module.status} ${itemText}`.toLowerCase();
}

function renderCommandBar() {
  return createElement("section", {
    className: "command-bar is-revealed",
    children: [
      createElement("div", {
        className: "command-title",
        children: [
          createElement("span", { className: "command-eyebrow", text: "CONTROL CENTER" }),
          createElement("strong", { text: "Passive telemetry interface" })
        ]
      }),
      createElement("div", {
        className: "command-pills",
        children: [
          createElement("span", { text: "No permission prompts" }),
          createElement("span", { text: "ES Modules" }),
          createElement("span", { text: "Static build" })
        ]
      })
    ]
  });
}

function renderHero() {
  const scanButton = createElement("button", {
    className: "primary-button",
    attrs: { id: "scan-button", type: "button" },
    text: "Start Scan"
  });

  const terminalButton = createElement("button", {
    className: "secondary-button",
    attrs: { id: "terminal-button", type: "button" },
    text: "Open Terminal"
  });

  scanButton.addEventListener("click", () => {
    const telemetry = collectTelemetry();
    const nextCount = getState().scanCount + 1;
    setState({ telemetry, scanCount: nextCount });
    log(`Safe scan ${nextCount} completed without permission prompts.`, "info");
  });

  terminalButton.addEventListener("click", () => {
    qs("#live-terminal")?.scrollIntoView({ behavior: "smooth", block: "center" });
    log("Terminal focused.", "info");
  });

  return createElement("section", {
    attrs: { id: "hero" },
    children: [
      createElement("div", {
        className: "hero-left is-revealed",
        children: [
          createElement("div", { className: "hero-badge", text: "Advanced Browser Intelligence" }),
          createElement("h1", {
            className: "hero-title",
            html: "Browser Telemetry <span class=\"hero-highlight\">Reimagined</span>"
          }),
          createElement("p", {
            className: "hero-description",
            text: "A futuristic browser intelligence interface focused on diagnostics, capability checks, privacy-aware telemetry and modular UI systems."
          }),
          createElement("div", {
            className: "hero-meta-grid",
            children: [
              createElement("span", { text: "Safe mode active" }),
              createElement("span", { text: "Local runtime" }),
              createElement("span", { text: "No backend required" })
            ]
          }),
          createElement("div", {
            className: "hero-actions",
            children: [scanButton, terminalButton]
          })
        ]
      }),
      createElement("div", {
        className: "hero-right is-revealed",
        children: [
          createElement("div", {
            className: "scanner-visual",
            attrs: { "aria-hidden": "true" },
            children: [
              createElement("span", { className: "scanner-ring ring-a" }),
              createElement("span", { className: "scanner-ring ring-b" }),
              createElement("span", { className: "scanner-core" }),
              createElement("span", { className: "scanner-sweep" })
            ]
          }),
          createElement("div", {
            className: "hero-stats-grid",
            children: [
              createStat("PRIVACY SCORE", "SAFE", 74),
              createStat("ENTROPY", "READY"),
              createStat("SECURITY", "STABLE"),
              createStat("TELEMETRY", "ACTIVE")
            ]
          })
        ]
      })
    ]
  });
}

function renderModuleSummary() {
  return createElement("section", {
    className: "module-summary",
    attrs: { id: "module-summary", "aria-live": "polite" }
  });
}

function createSummaryCard(label, value, variant = "available") {
  return createElement("div", {
    className: `summary-card summary-${variant}`,
    children: [
      createElement("span", { className: "summary-label", text: label }),
      createElement("strong", { className: "summary-value", text: String(value) })
    ]
  });
}

function createStat(label, value, progress = null) {
  return createElement("div", {
    className: "hero-stat-card",
    children: [
      createElement("div", { className: "stat-label", text: label }),
      createElement("div", { className: "stat-value", text: value }),
      progress === null ? "" : createElement("div", {
        className: "stat-progress",
        children: [
          createElement("div", {
            className: "stat-progress-bar",
            attrs: { style: `width:${progress}%` }
          })
        ]
      })
    ].filter(Boolean)
  });
}

function renderOverlay() {
  return createElement("section", {
    attrs: { id: "performance-overlay" },
    children: [
      createOverlayCard("FPS", "60", "fps-counter"),
      createOverlayCard("LATENCY", "0ms", "latency-counter"),
      createOverlayCard("MEMORY", "--", "memory-counter")
    ]
  });
}

function createOverlayCard(label, value, id) {
  return createElement("div", {
    className: "overlay-card",
    children: [
      createElement("div", { className: "overlay-title", text: label }),
      createElement("div", { attrs: { id }, text: value })
    ]
  });
}

function renderGridHeader() {
  return createElement("div", {
    className: "grid-header",
    attrs: { id: "grid-header" }
  });
}

function renderFooter() {
  return createElement("footer", {
    attrs: { id: "footer" },
    children: [
      createElement("div", {
        className: "footer-left",
        children: [
          createElement("div", { className: "footer-logo", text: APP_NAME }),
          createElement("div", { className: "footer-description", text: "Browser Intelligence & Telemetry Interface" })
        ]
      }),
      createElement("div", {
        className: "footer-right",
        children: [
          createElement("div", { className: "footer-item", text: BUILD_NAME }),
          createElement("div", { className: "footer-item", text: "Vanilla JS" }),
          createElement("div", { className: "footer-item", text: "Experimental" })
        ]
      })
    ]
  });
}

function renderShell() {
  const state = getState();
  const searchInput = createElement("input", {
    attrs: {
      type: "text",
      id: "search-input",
      "aria-label": "Search telemetry modules",
      placeholder: "Search modules...",
      autocomplete: "off"
    }
  });

  const sidebarNav = createElement("nav", { attrs: { id: "sidebar-nav", "aria-label": "Module categories" } });
  sidebarNav.append(renderSidebar({
    activeGroup: state.activeGroup,
    onGroupSelect: (activeGroup) => setState({ activeGroup }),
    modules: state.telemetry
  }));

  const sidebar = createElement("aside", {
    attrs: { id: "sidebar" },
    children: [
      createElement("div", {
        className: "sidebar-top",
        children: [
          createElement("div", {
            className: "logo-container",
            children: [
              createElement("div", { className: "logo-glow" }),
              createElement("h1", { className: "logo-text", text: APP_NAME })
            ]
          }),
          createElement("p", { className: "sidebar-description", text: "Browser Intelligence Interface" })
        ]
      }),
      createElement("div", {
        className: "sidebar-status",
        children: [
          createElement("div", {
            className: "status-card",
            children: [
              createElement("span", { className: "status-dot" }),
              createElement("span", { className: "status-text", text: "ONLINE" })
            ]
          })
        ]
      }),
      createElement("div", { className: "sidebar-search", children: [searchInput] }),
      sidebarNav,
      createElement("div", {
        className: "sidebar-footer",
        children: [
          createElement("div", { className: "sidebar-version", text: APP_VERSION }),
          createElement("div", { className: "sidebar-build", text: BUILD_NAME })
        ]
      })
    ]
  });

  const grid = createElement("section", { attrs: { id: "telemetry-grid", "aria-live": "polite" } });
  const main = createElement("main", {
    attrs: { id: "main-content", tabindex: "-1" },
    children: [renderCommandBar(), renderHero(), renderModuleSummary(), renderTerminal(), renderGridHeader(), grid, renderOverlay(), renderFooter()]
  });

  const shell = createElement("div", {
    className: "app-shell",
    children: [sidebar, main]
  });

  bindSearch(searchInput);
  return shell;
}

function renderTelemetryGrid() {
  const grid = qs("#telemetry-grid");
  if (!grid) return;

  const { telemetry, activeGroup, searchTerm } = getState();
  const filtered = telemetry.filter((module) => {
    const matchesGroup = activeGroup === "all" || module.group === activeGroup;
    const matchesSearch = !searchTerm || createSearchIndex(module).includes(searchTerm);
    return matchesGroup && matchesSearch;
  });

  clear(grid);
  if (!filtered.length) {
    grid.append(createEmptyState());
    return;
  }

  filtered.forEach((module) => grid.append(createTelemetryCard(module)));
}

function updateSummary() {
  const summary = qs("#module-summary");
  if (!summary) return;

  const stats = getTelemetryStats(getState().telemetry);
  clear(summary);
  summary.append(
    createSummaryCard("Modules", stats.total, "total"),
    createSummaryCard("Available", stats.available, "available"),
    createSummaryCard("Permission gated", stats["permission-required"], "permission"),
    createSummaryCard("Unsupported", stats.unsupported, "unsupported")
  );
}

function updateGridHeader() {
  const header = qs("#grid-header");
  if (!header) return;

  const { telemetry, activeGroup, searchTerm } = getState();
  const visible = telemetry.filter((module) => {
    const matchesGroup = activeGroup === "all" || module.group === activeGroup;
    return matchesGroup && (!searchTerm || createSearchIndex(module).includes(searchTerm));
  });
  const activeLabel = activeGroup === "all"
    ? "All modules"
    : MODULE_GROUPS.find((group) => group.id === activeGroup)?.label || activeGroup;

  clear(header);
  header.append(
    createElement("div", {
      children: [
        createElement("span", { className: "grid-eyebrow", text: "Telemetry matrix" }),
        createElement("h2", { className: "grid-title", text: activeLabel })
      ]
    }),
    createElement("div", {
      className: "grid-meta",
      children: [
        createElement("span", { text: `${visible.length} visible` }),
        createElement("span", { text: searchTerm ? `filter: ${searchTerm}` : "no active filter" })
      ]
    })
  );
}

function updateSidebar() {
  const nav = qs("#sidebar-nav");
  if (!nav) return;
  clear(nav);
  nav.append(renderSidebar({
    activeGroup: getState().activeGroup,
    onGroupSelect: (activeGroup) => setState({ activeGroup }),
    modules: getState().telemetry
  }));
}

function updateOverlay() {
  const state = getState();
  const fpsCounter = qs("#fps-counter");
  const latencyCounter = qs("#latency-counter");
  const memoryCounter = qs("#memory-counter");

  if (!fpsCounter || !latencyCounter || !memoryCounter) return;

  fpsCounter.textContent = "60";
  latencyCounter.textContent = `${Math.round(performance.now() % 90)}ms`;
  memoryCounter.textContent = performance.memory
    ? `${Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)} MB`
    : `${state.telemetry.length} modules`;
}

export function initUI(root) {
  clear(root);
  root.append(renderShell());

  setState({ telemetry: collectTelemetry() });
  renderTelemetryGrid();
  updateSummary();
  updateGridHeader();
  updateSidebar();
  updateOverlay();

  return {
    renderTelemetryGrid,
    updateSummary,
    updateGridHeader,
    updateSidebar,
    updateOverlay
  };
}
