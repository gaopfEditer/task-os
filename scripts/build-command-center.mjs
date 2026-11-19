#!/usr/bin/env node
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..");
const src = join(repo, "data/command-center.json");
const mirror =
  "/Users/maotouying/.openmausbot/workspaces/81414eac-984c-40f0-a464-bb33d306b30a/dispatch-command-center/command-center.json";

mkdirSync(dirname(mirror), { recursive: true });
copyFileSync(src, mirror);
console.log("synced command-center.json →", mirror);