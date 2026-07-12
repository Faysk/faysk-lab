import { APP_NAME, APP_VERSION, BUILD_NAME, MODULE_GROUPS } from "../constants.js?v=0.4.0";
import { createElement, qs, clear } from "../core/dom.js?v=0.4.0";
import { log } from "../core/logger.js?v=0.4.0";
import { getState, setState } from "../state.js?v=0.4.0";
import { collectTelemetry } from "../modules/index.js?v=0.4.0";
import {
  getBatterySummary,
  getBrowserSummary,
  getClientLocation,
  getConnectionInfo,
  getGpuSummary,
  getHardwareSummary,
  getPermissionStates,
  getScreenSummary,
  getStorageSummary,
  measureLatency,
  measureRefreshRate
} from "../modules/live/diagnostics.js?v=0.4.0";
import { copyText, serializeSafeReport } from "../core/report.js?v=0.4.0";
import { createEmptyState, createTelemetryCard } from "./cards.js?v=0.4.0";
import { renderSidebar } from "./sidebar.js?v=0.4.0";
import { renderTerminal } from "./terminal.js?v=0.4.0";
import { bindSearch } from "./search.js?v=0.4.0";

let liveScanPromise = null;

function setScanStatus(message, state = "idle") {
  const status = qs("#scan-status");
  if (!status) return;
  status.textContent = message;
  status.dataset.state = state;
}

function setScanControl(isScanning) {
  const button = qs("#scan-button");
  if (!button) return;
  button.disabled = isScanning;
  button.textContent = isScanning ? "Scanning…" : "Run passive scan";
  button.setAttribute("aria-busy", isScanning ? "true" : "false");
}

function formatDuration(durationMs) {
  if (!Number.isFinite(durationMs)) return "--";
  return durationMs < 1000 ? `${durationMs}ms` : `${(durationMs / 1000).toFixed(1)}s`;
}

function formatClock(isoTimestamp) {
  return new Date(isoTimestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function showReportFallback(report) {
  const dialog = qs("#report-dialog");
  const output = qs("#report-output");
  if (!dialog || !output) return;

  output.value = report;
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
  output.focus();
  output.select();
}

function getTelemetryStats(telemetry) {
  return telemetry.reduce((stats, module) => {
    stats.total += 1;
    stats[module.status] = (stats[module.status] || 0) + 1;
    return stats;
  }, {
    total: 0,
    available: 0,
    unsupported: 0,
    unavailable: 0,
    "action-required": 0
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
  const detailsLink = createElement("a", { text: "Details", attrs: { href: "#signals" } });
  detailsLink.addEventListener("click", () => {
    const catalog = qs("#signals");
    if (catalog) catalog.open = true;
  });

  return createElement("header", {
    className: "lab-topbar",
    children: [
      createBrand(),
      createElement("nav", {
        className: "lab-nav",
        attrs: { "aria-label": "Lab navigation" },
        children: [
          createElement("a", { text: "Overview", attrs: { href: "#overview" } }),
          createElement("a", { text: "Snapshot", attrs: { href: "#live-overview" } }),
          detailsLink
        ]
      }),
      createElement("div", {
        className: "topbar-actions",
        children: [
          createLink("Back to hub", "https://faysk.dev", "button")
        ]
      })
    ]
  });
}

function createSignalPill(text) {
  return createElement("span", { className: "signal-pill", text });
}

function formatPair(label, value) {
  return createElement("div", {
    className: "live-pair",
    children: [
      createElement("span", { text: label }),
      createElement("strong", { text: value || "unavailable" })
    ]
  });
}

function createLiveCard(id, label, value = "measuring...", detail = "Collecting live signal", pairs = []) {
  return createElement("article", {
    className: "live-card",
    attrs: { id: `live-${id}` },
    children: [
      createElement("span", { className: "live-label", text: label }),
      createElement("strong", { className: "live-value", text: value }),
      createElement("p", { className: "live-detail", text: detail }),
      createElement("div", {
        className: "live-pairs",
        children: pairs.map((pair) => formatPair(pair.label, pair.value))
      })
    ]
  });
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

  const reportButton = createElement("button", {
    className: "secondary-button report-button",
    attrs: { id: "report-button", type: "button" },
    text: "Copy safe report"
  });

  scanButton.addEventListener("click", async () => {
    if (scanButton.disabled) return;

    const nextCount = getState().scanCount + 1;
    setState({ scanCount: nextCount });
    log(`Passive scan ${nextCount} started without permission prompts.`, "info");

    await refreshLiveDashboard({ trigger: "manual", scanNumber: nextCount });
    log(`Passive scan ${nextCount} updated live and advanced signals.`, "info");
  });

  terminalButton.addEventListener("click", () => {
    const terminal = qs("#live-terminal");
    if (terminal) terminal.open = true;
    terminal?.scrollIntoView({ behavior: "smooth", block: "center" });
    log("Diagnostic log opened.", "info");
  });

  reportButton.addEventListener("click", async () => {
    if (reportButton.disabled) return;
    reportButton.disabled = true;
    reportButton.textContent = "Copying…";

    const report = serializeSafeReport({
      live: window.__fayskLiveDiagnostics || {},
      telemetry: getState().telemetry
    });

    try {
      await copyText(report);
      setScanStatus("Safe report copied — IP, location, user agent and GPU renderer excluded.", "success");
      log("Sanitized support report copied to clipboard.", "info");
    } catch {
      showReportFallback(report);
      setScanStatus("Clipboard unavailable — the safe report is open for manual copy.", "idle");
      log("Clipboard unavailable; sanitized report opened for manual copy.", "warn");
    } finally {
      reportButton.disabled = false;
      reportButton.textContent = "Copy safe report";
    }
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
            html: "See what your browser<span>reveals.</span>"
          }),
          createElement("p", {
            className: "hero-description",
            text: "A transparent snapshot of browser capabilities and runtime signals. No camera, microphone, precise location or device prompts. No persistent fingerprint."
          }),
          createElement("div", {
            className: "hero-actions",
            children: [scanButton, reportButton, terminalButton]
          }),
          createElement("p", {
            className: "scan-status",
            attrs: { id: "scan-status", role: "status", "aria-live": "polite" },
            text: "Starting a passive scan in this tab…"
          }),
          createElement("div", {
            className: "signal-row",
            children: [
              createSignalPill("passive by default"),
              createSignalPill("first-party network data"),
              createSignalPill("no stored profile")
            ]
          })
        ]
      }),
      createElement("aside", {
        className: "scope-panel is-revealed",
        children: [
          createElement("div", {
            className: "scope-visual",
            attrs: { "aria-hidden": "true", "data-hz": "measuring" },
            children: [
              createElement("span", { className: "scope-sweep" }),
              createElement("span", { className: "scope-core", text: "LAB" })
            ]
          }),
          createElement("p", {
            className: "scope-copy",
            text: "Values are browser-reported estimates, not authoritative hardware specifications. Open the details only when you need the raw signals."
          })
        ]
      })
    ]
  });
}

function renderReportDialog() {
  const closeButton = createElement("button", {
    className: "secondary-button",
    attrs: { type: "button" },
    text: "Close report"
  });

  closeButton.addEventListener("click", () => {
    const dialog = qs("#report-dialog");
    if (typeof dialog?.close === "function") dialog.close();
    else dialog?.removeAttribute("open");
  });

  return createElement("dialog", {
    className: "report-dialog",
    attrs: { id: "report-dialog", "aria-labelledby": "report-dialog-title" },
    children: [
      createElement("div", {
        className: "report-dialog-header",
        children: [
          createElement("div", {
            children: [
              createElement("span", { className: "eyebrow", text: "Sanitized export" }),
              createElement("h2", { attrs: { id: "report-dialog-title" }, text: "Safe support report" })
            ]
          }),
          closeButton
        ]
      }),
      createElement("p", {
        className: "report-dialog-copy",
        text: "IP, location, user agent and the exact GPU renderer are excluded. Select the text below to copy it manually."
      }),
      createElement("textarea", {
        attrs: {
          id: "report-output",
          readonly: "",
          rows: "18",
          "aria-label": "Sanitized support report"
        }
      })
    ]
  });
}

function renderMethodology() {
  const notes = [
    {
      label: "Estimated",
      title: "Browser-reported, not hardware truth",
      copy: "Memory, logical threads, connection and refresh can be rounded, limited or affected by the current tab."
    },
    {
      label: "First-party",
      title: "Network identity stays on this site",
      copy: "IP and approximate region come only from the Cloudflare request serving the lab. Local development shows them as unavailable."
    },
    {
      label: "Gated",
      title: "Sensitive APIs remain closed",
      copy: "Permission states may be read, but camera, microphone, precise location and device choosers are never opened automatically."
    }
  ];

  return createElement("section", {
    className: "methodology-section",
    attrs: { "aria-labelledby": "methodology-title" },
    children: [
      createElement("div", {
        className: "methodology-heading",
        children: [
          createElement("span", { className: "eyebrow", text: "Method" }),
          createElement("h2", { attrs: { id: "methodology-title" }, text: "How to read these results" })
        ]
      }),
      createElement("div", {
        className: "methodology-grid",
        children: notes.map((note) => createElement("article", {
          className: "methodology-card",
          children: [
            createElement("span", { className: "methodology-label", text: note.label }),
            createElement("h3", { text: note.title }),
            createElement("p", { text: note.copy })
          ]
        }))
      })
    ]
  });
}

function renderLiveDashboard() {
  return createElement("section", {
    className: "live-section",
    attrs: { id: "live-overview", "aria-live": "polite" },
    children: [
      createElement("div", {
        className: "section-heading",
        children: [
          createElement("div", { className: "eyebrow", text: "Live overview" }),
          createElement("h2", { className: "section-title", text: "What this browser can actually report." }),
          createElement("p", {
            className: "section-copy",
            text: "A quick snapshot from browser APIs, first-party Cloudflare request metadata and timing loops. Approximate or unavailable values are labeled as such."
          })
        ]
      }),
      createElement("div", {
        className: "live-grid",
        children: [
          createLiveCard("refresh", "Display refresh", "measuring...", "requestAnimationFrame timing"),
          createLiveCard("network", "Network", "measuring...", "IP, route and latency"),
          createLiveCard("hardware", "Hardware", "reading...", "browser-exposed device hints"),
          createLiveCard("gpu", "Graphics", "reading...", "WebGL renderer information"),
          createLiveCard("storage", "Storage", "reading...", "browser storage quota"),
          createLiveCard("screen", "Screen", "reading...", "viewport and display data")
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
        text: "Filter by category or search the values collected in this page."
      }),
      searchInput,
      sidebarNav
    ]
  });

  const grid = createElement("section", { attrs: { id: "telemetry-grid", "aria-live": "polite" } });
  const panel = createElement("section", {
    className: "grid-panel",
    attrs: { id: "signal-grid-panel" },
    children: [
      createElement("div", {
        className: "advanced-heading",
        children: [
          createElement("span", { className: "eyebrow", text: "Advanced" }),
          createElement("p", {
            className: "section-copy",
            text: "Raw capability checks and browser-reported values. Gated modules are never opened automatically."
          })
        ]
      }),
      renderGridHeader(),
      grid
    ]
  });

  bindSearch(searchInput);
  const disclosure = createElement("details", {
    className: "catalog-disclosure",
    attrs: { id: "signals" },
    children: [
      createElement("summary", {
        className: "catalog-summary",
        children: [
          createElement("span", {
            children: [
              createElement("span", { className: "eyebrow", text: "Deep dive" }),
              createElement("strong", { attrs: { id: "catalog-count" }, text: "Explore detailed signals" })
            ]
          }),
          createElement("span", { className: "catalog-summary-copy", text: "Search and filter the raw capability matrix" })
        ]
      }),
      createElement("section", {
        className: "lab-workbench",
        children: [sidebar, panel]
      })
    ]
  });

  disclosure.addEventListener("toggle", () => {
    if (!disclosure.open || disclosure.dataset.mounted === "true") return;
    disclosure.dataset.mounted = "true";
    renderTelemetryGrid();
  });

  return disclosure;
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
      createElement("main", {
        attrs: { id: "main-content" },
        children: [
          renderHero(),
          renderLiveDashboard(),
          renderModuleSummary(),
          renderMethodology(),
          renderWorkbench(),
          renderTerminal(),
          renderReportDialog()
        ]
      }),
      renderFooter()
    ]
  });
}

function setLiveCard(id, { value, detail, pairs = [] }) {
  const card = qs(`#live-${id}`);
  if (!card) return;

  const valueEl = card.querySelector(".live-value");
  const detailEl = card.querySelector(".live-detail");
  const pairsEl = card.querySelector(".live-pairs");

  if (valueEl) valueEl.textContent = value || "--";
  if (detailEl) detailEl.textContent = detail || "";
  if (pairsEl) {
    pairsEl.replaceChildren(...pairs.map((pair) => formatPair(pair.label, pair.value)));
  }
}

function setRadarRefresh(refresh) {
  const visual = qs(".scope-visual");
  if (!visual) return;

  const hz = refresh.roundedHz || refresh.hz;
  if (!Number.isFinite(hz)) return;

  const duration = Math.max(0.22, Math.min(2.2, 60 / hz));
  visual.style.setProperty("--sweep-duration", `${duration.toFixed(2)}s`);
  visual.setAttribute("data-hz", `${Math.round(hz)} Hz`);
}

function mergeLiveDiagnostics(partial) {
  const current = window.__fayskLiveDiagnostics || {};
  window.__fayskLiveDiagnostics = {
    ...current,
    ...partial,
    collectedAt: new Date()
  };

  return window.__fayskLiveDiagnostics;
}

function updateRefreshCard(refresh) {
  setRadarRefresh(refresh);
  const hasMeasurement = Number.isFinite(refresh.roundedHz || refresh.hz);
  const value = hasMeasurement
    ? refresh.display
    : refresh.confidence === "tab-hidden"
      ? "tab hidden"
      : "rAF paused";
  const detail = hasMeasurement
    ? `${refresh.samples || 0} frame samples, ${refresh.confidence || "measured"}`
    : "No animation frames received. Keep the tab visible to measure refresh rate.";
  const visual = qs(".scope-visual");

  if (!hasMeasurement && visual) {
    visual.setAttribute("data-hz", refresh.confidence === "tab-hidden" ? "tab hidden" : "rAF paused");
  }

  setLiveCard("refresh", {
    value,
    detail,
    pairs: [
      { label: "Frame time", value: Number.isFinite(refresh.frameMs) ? `${refresh.frameMs.toFixed(2)} ms` : "--" },
      { label: "Render cadence", value: refresh.renderDisplay || "--" },
      { label: "Support", value: refresh.supportDisplay || "--" },
      { label: "Jitter", value: Number.isFinite(refresh.jitter) ? `${refresh.jitter.toFixed(2)} ms` : "--" }
    ]
  });
}

function updateNetworkCard(data) {
  const location = data.location || {};
  const latency = data.latency || {};
  const locationParts = [location.city, location.region, location.country]
    .filter((value) => value && value !== "unavailable");
  const primaryValue = location.ip && location.ip !== "unavailable"
    ? location.ip
    : latency.display || "measuring...";

  setLiveCard("network", {
    value: primaryValue,
    detail: locationParts.length ? locationParts.join(", ") : "IP route lookup pending or unavailable",
    pairs: [
      { label: "Latency", value: latency.display || "measuring..." },
      { label: "ASN/Org", value: location.org || "pending" },
      { label: "Provider", value: location.source || "pending" }
    ]
  });
}

function updateHardwareCard(data) {
  const battery = data.battery || { level: "reading", status: "battery API" };

  setLiveCard("hardware", {
    value: data.hardware.cpuThreads,
    detail: data.hardware.deviceMemory,
    pairs: [
      { label: "Connection", value: data.connection.effectiveType },
      { label: "Downlink", value: data.connection.downlink },
      { label: "Battery", value: `${battery.level} / ${battery.status}` }
    ]
  });
}

function updateGpuCard(data) {
  setLiveCard("gpu", {
    value: data.gpu.renderer,
    detail: data.gpu.vendor,
    pairs: [
      { label: "WebGL", value: data.gpu.supported ? "available" : "unsupported" },
      { label: "Platform", value: data.browser.platform }
    ]
  });
}

function updateStorageCard(storage) {
  setLiveCard("storage", {
    value: storage.quota,
    detail: "Browser storage quota, not physical disk size",
    pairs: [
      { label: "Used", value: storage.usage },
      { label: "Usage", value: storage.percent }
    ]
  });
}

function updateScreenCard(data) {
  setLiveCard("screen", {
    value: data.screen.resolution,
    detail: `${data.screen.viewport} viewport / ${data.screen.pixelRatio} DPR`,
    pairs: [
      { label: "Color depth", value: data.screen.colorDepth },
      { label: "Timezone", value: data.browser.timezone },
      { label: "Language", value: data.browser.language }
    ]
  });
}

function refreshTelemetryFromLive() {
  setState({ telemetry: collectTelemetry() });
  renderTelemetryGrid();
  updateSummary();
  updateGridHeader();
  updateSidebar();
}

async function runLiveDashboard({ updateModules = true, trigger = "automatic", scanNumber = 0 } = {}) {
  const startedAt = Date.now();
  setScanControl(true);
  setScanStatus(trigger === "manual" ? `Running passive scan ${scanNumber}…` : "Running the initial passive scan…", "scanning");
  log("Measuring live browser signals...", "info");

  setLiveCard("refresh", { value: "measuring...", detail: "requestAnimationFrame timing", pairs: [] });
  setLiveCard("network", { value: "measuring...", detail: "IP, route and latency", pairs: [] });
  setLiveCard("storage", { value: "reading...", detail: "browser storage quota", pairs: [] });

  const initialData = mergeLiveDiagnostics({
    browser: getBrowserSummary(),
    connection: getConnectionInfo(),
    gpu: getGpuSummary(),
    hardware: getHardwareSummary(),
    screen: getScreenSummary()
  });

  updateHardwareCard(initialData);
  updateGpuCard(initialData);
  updateScreenCard(initialData);

  const tasks = [
    measureRefreshRate({ timeout: 6200 })
      .then((refresh) => {
        const data = mergeLiveDiagnostics({ refresh });
        updateRefreshCard(refresh);
        if (Number.isFinite(refresh.roundedHz || refresh.hz)) {
          log(`Display refresh measured at ${refresh.display} via ${refresh.source}.`, "info");
        } else {
          log(`Display refresh measurement did not receive animation frames (${refresh.confidence}).`, "info");
        }
        return data;
      })
      .catch((error) => {
        setLiveCard("refresh", {
          value: "unavailable",
          detail: "Refresh measurement failed safely",
          pairs: [{ label: "Reason", value: error.message }]
        });
      }),
    measureLatency(5)
      .then((latency) => {
        const data = mergeLiveDiagnostics({ latency });
        updateNetworkCard(data);
        return data;
      })
      .catch((error) => {
        const data = mergeLiveDiagnostics({ latency: { display: "--" } });
        updateNetworkCard(data);
        log(`Latency probe failed safely: ${error.message}`, "error");
      }),
    getClientLocation()
      .then((location) => {
        const data = mergeLiveDiagnostics({ location });
        updateNetworkCard(data);
        return data;
      }),
    getStorageSummary()
      .then((storage) => {
        mergeLiveDiagnostics({ storage });
        updateStorageCard(storage);
        return storage;
      })
      .catch((error) => {
        const storage = { usage: "unsupported", quota: "unsupported", percent: error.message };
        mergeLiveDiagnostics({ storage });
        updateStorageCard(storage);
      }),
    getBatterySummary()
      .then((battery) => {
        const data = mergeLiveDiagnostics({ battery });
        updateHardwareCard(data);
        return battery;
      })
      .catch(() => {
        const data = mergeLiveDiagnostics({ battery: { status: "unsupported", level: "unsupported" } });
        updateHardwareCard(data);
      })
    ,
    getPermissionStates()
      .then((permissions) => {
        mergeLiveDiagnostics({ permissions });
        return permissions;
      })
  ];

  await Promise.allSettled(tasks);

  if (updateModules) {
    refreshTelemetryFromLive();
  }

  const durationMs = Date.now() - startedAt;
  const completedAt = new Date().toISOString();
  const data = mergeLiveDiagnostics({
    scan: { trigger, scanNumber, durationMs, completedAt }
  });
  setScanStatus(`Updated ${formatClock(completedAt)} in ${formatDuration(durationMs)} — no permission prompts.`, "success");
  log(`Live scan complete: ${data.refresh?.display || "--"}, ${data.latency?.display || "--"} latency.`, "info");
  return data;
}

async function refreshLiveDashboard(options = {}) {
  if (!liveScanPromise) {
    liveScanPromise = runLiveDashboard(options)
      .catch((error) => {
        setScanStatus("The scan stopped early; available values were kept.", "error");
        log(`Live diagnostics failed safely: ${error.message}`, "error");
      })
      .finally(() => {
        setScanControl(false);
        liveScanPromise = null;
      });
  }

  return liveScanPromise;
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
  const catalog = qs("#signals");
  if (catalog?.dataset.mounted !== "true") return;

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
  const catalogCount = qs("#catalog-count");
  clear(summary);
  summary.append(
    createSummaryCard("Signals", stats.total, "total"),
    createSummaryCard("Ready", stats.available, "available"),
    createSummaryCard("Gated by design", stats["action-required"], "permission"),
    createSummaryCard("Unavailable", stats.unsupported + stats.unavailable, "unsupported")
  );
  if (catalogCount) catalogCount.textContent = `${stats.total} detailed signals`;
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

export function initUI(root) {
  clear(root);
  root.append(renderShell());

  setState({ telemetry: collectTelemetry() });
  updateSummary();
  updateGridHeader();
  updateSidebar();
  refreshLiveDashboard({ trigger: "automatic" });

  return {
    renderTelemetryGrid,
    updateSummary,
    updateGridHeader,
    updateSidebar,
    refreshLiveDashboard
  };
}
