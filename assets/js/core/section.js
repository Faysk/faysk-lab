import { createElement } from "./dom.js";

export function createSection({ id, title, className = "", children = [] }) {
  return createElement("section", {
    className,
    attrs: { id },
    children: [
      createElement("h2", { className: "section-title", text: title }),
      ...children
    ]
  });
}
