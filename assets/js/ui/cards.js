import { createElement } from "../core/dom.js";
import { getModuleGuidance } from "../modules/guidance.js?v=0.4.0";

const STATUS_LABELS = {
  available: "ready",
  "action-required": "gated",
  unavailable: "unavailable",
  unsupported: "unsupported"
};

function createValueRows(items) {
  return items.map((item) => createElement("div", {
    className: "card-row",
    children: [
      createElement("span", { className: "card-row-label", text: item.label }),
      createElement("span", { className: "card-row-value", text: item.value })
    ]
  }));
}

export function createTelemetryCard(module) {
  const statusClass = module.status;
  const statusLabel = STATUS_LABELS[module.status] || module.status;
  const guidance = getModuleGuidance(module.id);

  return createElement("article", {
    className: `telemetry-card is-revealed status-${statusClass}`,
    attrs: {
      "data-group": module.group,
      "data-title": module.title.toLowerCase(),
      "aria-label": `${module.title} telemetry card, status ${statusLabel}`
    },
    children: [
      createElement("div", {
        className: "card-top",
        children: [
          createElement("div", {
            children: [
              createElement("div", { className: "card-label", text: module.groupLabel }),
              createElement("h3", { className: "card-title", text: module.title })
            ]
          }),
          createElement("span", {
            className: `status-badge ${statusClass}`,
            text: statusLabel
          })
        ]
      }),
      createElement("p", { className: "card-description", text: module.description }),
      createElement("div", {
        className: "card-value-grid",
        children: createValueRows(module.items)
      }),
      guidance ? createElement("div", {
        className: "card-guidance",
        children: [
          createElement("span", { text: guidance.note }),
          createElement("a", {
            text: "Reference ↗",
            attrs: { href: guidance.href, target: "_blank", rel: "noreferrer" }
          })
        ]
      }) : null,
      createElement("div", {
        className: "card-scanline",
        attrs: { "aria-hidden": "true" }
      })
    ]
  });
}

export function createEmptyState() {
  return createElement("div", {
    className: "empty-state",
    text: "No telemetry modules match this search."
  });
}
