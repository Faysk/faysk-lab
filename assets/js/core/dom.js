export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

export function qsa(selector, scope = document) {
  return [...scope.querySelectorAll(selector)];
}

export function createElement(tag, options = {}) {
  const element = document.createElement(tag);
  const { className, text, html, attrs = {}, children = [] } = options;

  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  if (html !== undefined) element.innerHTML = html;

  Object.entries(attrs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      element.setAttribute(key, String(value));
    }
  });

  children.filter(Boolean).forEach((child) => element.append(child));
  return element;
}

export function clear(element) {
  element.replaceChildren();
}
