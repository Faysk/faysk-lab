export function reveal(element) {
  if (!element) return;
  element.classList.add("is-revealed");
}

export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
