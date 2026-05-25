import { createElement, qs } from "../core/dom.js";

export function notify(message) {
  const root = qs("#notifications-root");
  if (!root) return;

  const item = createElement("div", { className: "notification", text: message });
  root.append(item);
  window.setTimeout(() => item.remove(), 2400);
}
