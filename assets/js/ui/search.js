import { setState } from "../state.js";

export function bindSearch(input) {
  input.addEventListener("input", () => {
    setState({ searchTerm: input.value.trim().toLowerCase() });
  });
}
