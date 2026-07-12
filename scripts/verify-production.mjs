import { readFileSync } from "node:fs";

const baseUrl = new URL(process.env.LAB_URL || "https://lab.faysk.dev/");
const failures = [];
const releaseVersion = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
).version;

const pageResponse = await fetch(baseUrl, { cache: "no-store" });
const html = await pageResponse.text();

if (!pageResponse.ok) failures.push(`homepage returned HTTP ${pageResponse.status}`);
if (!html.includes(`assets/js/app.js?v=${releaseVersion}`)) {
  failures.push(`homepage is not serving the ${releaseVersion} asset set`);
}

const expectedHeaders = {
  "content-security-policy": ["default-src 'self'", "frame-ancestors 'none'", "object-src 'none'"],
  "permissions-policy": ["camera=()", "microphone=()", "geolocation=()"],
  "x-content-type-options": ["nosniff"]
};

for (const [header, expectedValues] of Object.entries(expectedHeaders)) {
  const value = pageResponse.headers.get(header) || "";
  if (!value) failures.push(`homepage is missing ${header}`);
  for (const expected of expectedValues) {
    if (!value.includes(expected)) failures.push(`${header} is missing ${expected}`);
  }
}

const assetPaths = [...html.matchAll(/(?:href|src|content)="((?:\.\/|https:\/\/lab\.faysk\.dev\/assets\/)[^"?#]+)/g)]
  .map((match) => match[1])
  .filter((path, index, paths) => paths.indexOf(path) === index);

const assetResults = await Promise.all(assetPaths.map(async (path) => {
  const url = new URL(path, baseUrl);
  const response = await fetch(url, { cache: "no-store" });
  return { path, status: response.status };
}));

for (const asset of assetResults) {
  if (asset.status !== 200) failures.push(`${asset.path} returned HTTP ${asset.status}`);
}

const pingUrl = new URL("api/ping", baseUrl);
const pingResponse = await fetch(pingUrl, { cache: "no-store" });
if (pingResponse.status !== 204) failures.push(`/api/ping returned HTTP ${pingResponse.status}`);
if (pingResponse.headers.get("cache-control") !== "no-store") failures.push("/api/ping is not marked no-store");

const clientUrl = new URL("api/client", baseUrl);
const clientResponse = await fetch(clientUrl, { cache: "no-store" });
if (clientResponse.status !== 200) failures.push(`/api/client returned HTTP ${clientResponse.status}`);
if (clientResponse.headers.get("cache-control") !== "no-store") failures.push("/api/client is not marked no-store");

if (clientResponse.ok) {
  const client = await clientResponse.json().catch(() => null);
  if (!client || client.source !== "cloudflare-pages-function") {
    failures.push("/api/client returned an invalid payload");
  }
}

if (failures.length) {
  console.error(`Production verification failed for ${baseUrl.href}:\n${failures.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Production verification passed for ${baseUrl.href}.`);
}
