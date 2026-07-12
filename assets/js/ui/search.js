import { setState } from "../state.js?v=0.4.0";

export function bindSearch(input) {
  input.addEventListener("input", () => {
    setState({ searchTerm: input.value.trim().toLowerCase() });
  });
}
