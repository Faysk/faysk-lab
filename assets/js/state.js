const state = {
  activeGroup: "all",
  searchTerm: "",
  telemetry: [],
  scanCount: 0,
  startedAt: Date.now()
};

const listeners = new Set();

export function getState() {
  return { ...state, telemetry: [...state.telemetry] };
}

export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach((listener) => listener(getState()));
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
