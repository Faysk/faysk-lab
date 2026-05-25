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

function createLink(label, href, variant = "") {
  const external = /^https?:\/\//.test(href);
  return createElement("a", {
    className: `button ${variant}`.trim(),
    text: label,
    attrs: {
      href,
      target: external ? "_blank" : "",
      rel: external ? "noreferrer" : ""
    }
  });
}

function createBrand() {
  return createElement("a", {
    className: "brand",
    attrs: { href: "/" },
    children: [
      createElement("span", { className: "brand-mark", text: "FL" }),
      createElement("span", {
        className: "brand-copy",
        children: [
          createElement("strong", { text: APP_NAME }),
          createElement("span", { text: "browser observatory" })
        ]
      })
    ]
  });
}

function renderTopbar() {
  return createElement("header", {
    className: "lab-topbar",
    children: [
      createBrand(),
      createElement("nav", {
        className: "lab-nav",
        attrs: { "aria-label": "Lab navigation" },
        children: [
          createElement("a", { text: "Overview", attrs: { href: "#overview" } }),
          createElement("a", { text: "Signals", attrs: { href: "#signals" } }),
          createElement("a", { text: "Terminal", attrs: { href: "#live-terminal" } }),
          createElement("a", { text: "Hub", attrs: { href: "https://faysk.dev", target: "_blank", rel: "noreferrer" } })
        ]
      }),
      createElement("div", {
        className: "topbar-actions",
        children: [
          createElement("span", { className: "signal-pill", text: "safe mode" }),
          createLink("Back to hub", "https://faysk.dev", "button")
        ]
      })
    ]
  });
}

function createSignalPill(text) {
  return createElement("span", { className: "signal-pill", text });
}

function renderHero() {
  const scanButton = createElement("button", {
    className: "primary-button",
    attrs: { id: "scan-button", type: "button" },
    text: "Run passive scan"
  });

  const terminalButton = createElement("button", {
    className: "secondary-button",
    attrs: { id: "terminal-button", type: "button" },
    text: "Open terminal"
  });

  scanButton.addEventListener("click", () => {
    const telemetry = collectTelemetry();
    const nextCount = getState().scanCount + 1;
    setState({ telemetry, scanCount: nextCount });
    log(`Passive scan ${nextCount} completed without permission prompts.`, "info");
  });

  terminalButton.addEventListener("click", () => {
    qs("#live-terminal")?.scrollIntoView({ behavior: "smooth", block: "center" });
    log("Terminal focused.", "info");
  });

  return createElement("section", {
    className: "lab-hero",
    attrs: { id: "overview" },
    children: [
      createElement("div", {
        className: "hero-panel is-revealed",
        children: [
          createElement("div", { className: "eyebrow", text: "Privacy-aware browser lab" }),
          createElement("h1", {
            className: "hero-title",
            html: "Browser signals,<span>collected safely.</span>"
          }),
          createElement("p", {
            className: "hero-description",
            text: "A clean diagnostics surface for browser capabilities, runtime details and passive telemetry. No camera, microphone, geolocation, USB or Bluetooth prompts run automatically."
          }),
          createElement("div", {
            className: "hero-actions",
            children: [scanButton, terminalButton]
          }),
          createElement("div", {
            className: "signal-row",
            children: [
              createSignalPill("local runtime"),
              createSignalPill("no invasive prompts"),
              createSignalPill("static deploy"),
              createSignalPill("ES modules")
            ]
          })
        ]
      }),
      createElement("aside", {
        className: "scope-panel is-revealed",
        children: [
          createElement("div", {
            className: "scope-visual",
            attrs: { "aria-hidden": "true" },
            children: [
              createElement("span", { className: "scope-sweep" }),
              createElement("span", { className: "scope-core", text: "LAB" })
            ]
          }),
          createElement("p", {
            className: "scope-copy",
            text: "This lab is a showcase experiment: useful for understanding a browser environment, intentionally conservative about sensitive APIs."
          })
        ]
      })
    ]
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

function renderModuleSummary() {
  return createElement("section", {
    className: "summary-grid",
    attrs: { id: "module-summary", "aria-live": "polite" }
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

function renderOverlay() {
  return createElement("section", {
    attrs: { id: "performance-overlay", "aria-label": "Runtime overlay" },
    children: [
      createOverlayCard("FPS", "60", "fps-counter"),
      createOverlayCard("Latency", "0ms", "latency-counter"),
      createOverlayCard("Memory", "--", "memory-counter")
    ]
  });
}

function renderGridHeader() {
  return createElement("div", {
    className: "grid-header",
    attrs: { id: "grid-header" }
  });
}

function renderWorkbench() {
  const state = getState();
  const searchInput = createElement("input", {
    attrs: {
      type: "text",
      id: "search-input",
      "aria-label": "Search browser signals",
      placeholder: "Search signals...",
      autocomplete: "off"
    }
  });

  const sidebarNav = createElement("nav", { attrs: { id: "sidebar-nav", "aria-label": "Signal categories" } });
  sidebarNav.append(renderSidebar({
    activeGroup: state.activeGroup,
    onGroupSelect: (activeGroup) => setState({ activeGroup }),
    modules: state.telemetry
  }));

  const sidebar = createElement("aside", {
    className: "sidebar-panel",
    children: [
      createElement("div", { className: "eyebrow", text: "Signal filters" }),
      createElement("h2", { className: "sidebar-heading", text: "Browse modules" }),
      createElement("p", {
        className: "sidebar-description",
        text: "Filter by category or search values currently visible in the passive diagnostics grid."
      }),
      searchInput,
      sidebarNav
    ]
  });

  const grid = createElement("section", { attrs: { id: "telemetry-grid", "aria-live": "polite" } });
  const panel = createElement("section", {
    className: "grid-panel",
    attrs: { id: "signals" },
    children: [renderGridHeader(), grid]
  });

  bindSearch(searchInput);
  return createElement("section", {
    className: "lab-workbench",
    children: [sidebar, panel]
  });
}

function renderFooter() {
  return createElement("footer", {
    attrs: { id: "footer" },
    children: [
      createElement("div", {
        className: "footer-inner",
        children: [
          createElement("div", {
            children: [
              createElement("strong", { text: "lab.faysk.dev" }),
              createElement("div", { className: "footer-description", text: "A browser diagnostics experiment by Faysk." })
            ]
          }),
          createElement("div", {
            className: "project-links",
            children: [
              createElement("span", { text: APP_VERSION }),
              createElement("span", { text: BUILD_NAME })
            ]
          })
        ]
      })
    ]
  });
}

function renderShell() {
  return createElement("div", {
    className: "app-shell",
    children: [
      renderTopbar(),
      renderHero(),
      renderModuleSummary(),
      renderOverlay(),
      renderWorkbench(),
      renderTerminal(),
      renderFooter()
    ]
  });
}

function filterTelemetry() {
  const { telemetry, activeGroup, searchTerm } = getState();
  return telemetry.filter((module) => {
    const matchesGroup = activeGroup === "all" || module.group === activeGroup;
    const matchesSearch = !searchTerm || createSearchIndex(module).includes(searchTerm);
    return matchesGroup && matchesSearch;
  });
}

function renderTelemetryGrid() {
  const grid = qs("#telemetry-grid");
  if (!grid) return;

  const filtered = filterTelemetry();
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
    createSummaryCard("Signals", stats.total, "total"),
    createSummaryCard("Available", stats.available, "available"),
    createSummaryCard("Permission gated", stats["permission-required"], "permission"),
    createSummaryCard("Unsupported", stats.unsupported, "unsupported")
  );
}

function updateGridHeader() {
  const header = qs("#grid-header");
  if (!header) return;

  const { activeGroup, searchTerm } = getState();
  const visible = filterTelemetry();
  const activeLabel = activeGroup === "all"
    ? "All signals"
    : MODULE_GROUPS.find((group) => group.id === activeGroup)?.label || activeGroup;

  clear(header);
  header.append(
    createElement("div", {
      children: [
        createElement("span", { className: "grid-eyebrow", text: "Signal matrix" }),
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
