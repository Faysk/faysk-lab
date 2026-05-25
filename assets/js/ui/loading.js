export function setLoading(element, isLoading) {
  if (!element) return;
  element.toggleAttribute("aria-busy", isLoading);
}
