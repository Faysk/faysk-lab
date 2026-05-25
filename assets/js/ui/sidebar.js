import { MODULE_GROUPS } from "../constants.js";
import { createElement } from "../core/dom.js";

function countGroupModules(groupId, modules) {
  if (groupId === "all") return modules.length;
  return modules.filter((module) => module.group === groupId).length;
}

export function renderSidebar({ activeGroup, onGroupSelect, modules = [] }) {
  const list = createElement("ul", { className: "nav-list" });

  const groups = [{ id: "all", label: "All Modules", icon: "AL" }, ...MODULE_GROUPS];

  groups.forEach((group) => {
    const count = countGroupModules(group.id, modules);
    const button = createElement("button", {
      className: `nav-button${activeGroup === group.id ? " is-active" : ""}`,
      attrs: {
        type: "button",
        "data-group": group.id,
        "aria-pressed": activeGroup === group.id ? "true" : "false"
      },
      children: [
        createElement("span", {
          className: "nav-label",
          children: [
            createElement("span", { className: "nav-icon", text: group.icon }),
            createElement("span", { text: group.label })
          ]
        }),
        createElement("span", { className: "nav-count", text: String(count) })
      ]
    });

    button.addEventListener("click", () => onGroupSelect(group.id));
    list.append(createElement("li", { children: [button] }));
  });

  return list;
}
