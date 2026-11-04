import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../..");
const dist = join(here, "../dist");
const extrasDir = join(here, "../board-extras");

mkdirSync(dist, { recursive: true });
for (const name of ["index.html", "favicon.svg"]) {
  copyFileSync(join(repoRoot, name), join(dist, name));
}
for (const name of ["taskos-desktop.js", "taskos-desktop.css"]) {
  copyFileSync(join(extrasDir, name), join(dist, name));
}

let html = readFileSync(join(dist, "index.html"), "utf8");
const marker = "taskos-desktop.js";
if (!html.includes(marker)) {
  const inject =
    '<link rel="stylesheet" href="taskos-desktop.css">\n' +
    '<script src="taskos-desktop.js" defer></script>\n';
  html = html.replace("</body>", inject + "</body>");
  writeFileSync(join(dist, "index.html"), html);
}

console.log("Synced board UI + desktop extras to", dist);
