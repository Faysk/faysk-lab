import { CONFIG } from "../config.js";
import { createElement, qs } from "../core/dom.js";
import { onLog } from "../core/logger.js";

export function renderTerminal() {
  return createElement("section", {
    attrs: { id: "live-terminal" },
    children: [
      createElement("div", {
        className: "terminal-header",
        children: [
          createElement("div", {
            children: [
              createElement("div", { className: "terminal-title", text: "LIVE TELEMETRY TERMINAL" }),
              createElement("div", { className: "terminal-subtitle", text: "safe diagnostics stream" })
            ]
          }),
          createElement("div", {
            className: "terminal-controls",
            children: [
              createElement("span", { className: "terminal-dot red" }),
              createElement("span", { className: "terminal-dot yellow" }),
              createElement("span", { className: "terminal-dot green" })
            ]
          })
        ]
      }),
      createElement("div", {
        className: "terminal-toolbar",
        children: [
          createElement("span", { text: "channel: local" }),
          createElement("span", { text: "permissions: passive" }),
          createElement("span", { text: "mode: observer" })
        ]
      }),
      createElement("div", { attrs: { id: "terminal-output" } })
    ]
  });
}

export function appendTerminalLine(entry) {
  const output = qs("#terminal-output");
  if (!output) return;

  const time = entry.timestamp.toLocaleTimeString("pt-BR", { hour12: false });
  output.append(createElement("div", {
    className: "terminal-line",
    attrs: { "data-level": entry.level },
    text: `[${time}] [${entry.level.toUpperCase()}] ${entry.message}`
  }));

  while (output.children.length > CONFIG.maxTerminalLines) {
    output.firstElementChild?.remove();
  }

  output.scrollTop = output.scrollHeight;
}

export function bindTerminal() {
  onLog(appendTerminalLine);
}
