import { bindSearch } from "../../ui/search.js";

export { bindSearch };

export function initSearch(input) {
  if (input) {
    bindSearch(input);
  }
}
