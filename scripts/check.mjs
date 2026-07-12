import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const failures = [];
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const releaseVersion = packageJson.version;

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

const sourceRoots = ["assets/js", "functions", "scripts", "tests"];
const javascriptFiles = sourceRoots
  .map((directory) => join(root, directory))
  .filter(existsSync)
  .flatMap(walk)
  .filter((file) => [".js", ".mjs"].includes(extname(file)));
const browserFiles = walk(join(root, "assets", "js")).filter((file) => extname(file) === ".js");

for (const file of javascriptFiles) {
  const syntax = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
  if (syntax.status !== 0) failures.push(`${file}: ${syntax.stderr.trim()}`);

  const source = readFileSync(file, "utf8");
  for (const match of source.matchAll(/from\s+["']([^"']+)["']/g)) {
    const specifier = match[1].split("?")[0];
    if (specifier.startsWith(".") && !existsSync(resolve(dirname(file), specifier))) {
      failures.push(`${file}: missing import ${specifier}`);
    }
  }
}

const indexHtml = readFileSync(join(root, "index.html"), "utf8");
for (const match of indexHtml.matchAll(/(?:href|src)="(\.\/[^"?#]+)/g)) {
  if (!existsSync(resolve(root, match[1]))) failures.push(`index.html: missing asset ${match[1]}`);
}

const headers = readFileSync(join(root, "_headers"), "utf8");
for (const requiredHeader of ["Content-Security-Policy", "Permissions-Policy", "X-Content-Type-Options"]) {
  if (!headers.includes(requiredHeader)) failures.push(`_headers: missing ${requiredHeader}`);
}

const allSource = browserFiles.map((file) => readFileSync(file, "utf8")).join("\n");
const versionedSource = `${indexHtml}\n${allSource}`;
for (const match of versionedSource.matchAll(/\?v=([\w.-]+)/g)) {
  if (match[1] !== releaseVersion) {
    failures.push(`asset version ${match[1]} does not match package version ${releaseVersion}`);
  }
}

for (const forbidden of ["ipapi.co", "getUserMedia(", "getCurrentPosition(", "requestDevice(", "requestPort("]) {
  if (allSource.includes(forbidden)) failures.push(`privacy invariant failed: found ${forbidden}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Static checks passed for ${javascriptFiles.length} JavaScript files.`);
}
