import { CONFIG } from "../config.js";

const subscribers = new Set();

export function log(message, level = "info") {
  const entry = {
    level,
    message,
    timestamp: new Date()
  };

  if (CONFIG.debug) {
    console[level === "error" ? "error" : "log"](`[${level.toUpperCase()}] ${message}`);
  }

  subscribers.forEach((subscriber) => subscriber(entry));
  return entry;
}

export function onLog(subscriber) {
  subscribers.add(subscriber);
  return () => subscribers.delete(subscriber);
}
