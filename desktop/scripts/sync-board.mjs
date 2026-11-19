import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../..");
const dist = join(here, "../dist");
const extrasDir = join(here, "../board-extras");

mkdirSync(dist, { recursive: true });
for (const name of ["index.html", "favicon.svg", "function-board.css", "function-board.js"]) {
  const src = join(repoRoot, name);
  if (!existsSync(src)) {
    console.error("Missing source:", src);
    process.exit(1);
  }
  copyFileSync(src, join(dist, name));
}
for (const name of [
  "market-symbols.js",
  "taskos-desktop.js",
  "taskos-desktop.css",
  "price-bubble.html",
  "price-bubble.js",
  "price-bubble.css",
  "priority-footer.js",
]) {
  const src = join(extrasDir, name);
  if (!existsSync(src)) {
    console.error("Missing extra:", src);
    process.exit(1);
  }
  copyFileSync(src, join(dist, name));
}

let html = readFileSync(join(dist, "index.html"), "utf8");
const marker = "taskos-desktop.js";
if (!html.includes(marker)) {
  const inject =
    '<link rel="stylesheet" href="taskos-desktop.css">\n' +
    '<script src="market-symbols.js" defer></script>\n' +
    '<script src="taskos-desktop.js" defer></script>\n';
  html = html.replace("</body>", inject + "</body>");
} else if (!html.includes("market-symbols.js")) {
  html = html.replace(
    '<script src="taskos-desktop.js" defer></script>',
    '<script src="market-symbols.js" defer></script>\n<script src="taskos-desktop.js" defer></script>'
  );
}
writeFileSync(join(dist, "index.html"), html);

mkdirSync(join(dist, "data"), { recursive: true });
for (const name of [
  "command-center.json",
  "business-function-board.json",
  "work-skills-board.json",
  "grow-operations-board.json",
  "live_watch.json",
]) {
  const src = join(repoRoot, "data", name);
  if (existsSync(src)) copyFileSync(src, join(dist, "data", name));
}
for (const name of ["index.md", "log.csv", "annotations.json"]) {
  const src = join(repoRoot, name);
  if (existsSync(src)) copyFileSync(src, join(dist, name));
}

const required = [
  "index.html",
  "market-symbols.js",
  "taskos-desktop.js",
  "taskos-desktop.css",
  "price-bubble.html",
  "priority-footer.js",
];
for (const name of required) {
  const p = join(dist, name);
  if (!existsSync(p)) {
    console.error("Build frontend failed, missing:", p);
    process.exit(1);
  }
}

console.log("Built static frontend at", dist);
