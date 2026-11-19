#!/usr/bin/env node
/** Copy OpenMausBot 职能看板 JSON ↔ task-os/data（保留 task-os 侧的 exec_* 字段） */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..");
const taskOsJson = join(repoRoot, "data/business-function-board.json");
const mirror = process.env.OPENMAUSBOT_BOARD_JSON ||
  "/Users/maotouying/.openmausbot/workspaces/81414eac-984c-40f0-a464-bb33d306b30a/base-business-board/business-function-board.json";

const dir = process.argv[2] || "to-taskos";
if (!["to-taskos", "to-openmausbot"].includes(dir)) {
  console.error("Usage: node scripts/sync-business-board.mjs [to-taskos|to-openmausbot]");
  process.exit(1);
}

function readJson(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}

function mergeExec(target, source) {
  const byId = new Map((source.duties || []).map((d) => [d.id, d]));
  for (const d of target.duties || []) {
    const old = byId.get(d.id);
    if (!old) continue;
    for (const k of ["exec_state", "exec_note", "exec_at"]) {
      if (old[k] != null && old[k] !== "") d[k] = old[k];
    }
  }
  if (source.logs) target.logs = source.logs;
  return target;
}

if (dir === "to-taskos") {
  if (!existsSync(mirror)) {
    console.error("Missing mirror:", mirror);
    process.exit(1);
  }
  const incoming = readJson(mirror);
  let out = incoming;
  if (existsSync(taskOsJson)) out = mergeExec(incoming, readJson(taskOsJson));
  out.schema_version = Math.max(2, out.schema_version || 2);
  out.meta = {
    ...(out.meta || {}),
    openmausbot_mirror: mirror,
    role_bots: (out.meta && out.meta.role_bots) || {
      ops: "base·币圈运营", trade: "base·币圈交易", market: "base·市场机会研究", dev: "base·软件开发",
      content: "base·内容运营", tech: "base·技术学习", money: "base·赚钱实践", partners: "base·合作拓展",
      growth: "base·个人成长", audit: "base·批判审核",
    },
  };
  for (const d of out.duties || []) {
    d.exec_state = d.exec_state || "idle";
    d.exec_note = d.exec_note || "";
    d.exec_at = d.exec_at || "";
  }
  writeFileSync(taskOsJson, JSON.stringify(out, null, 2));
  console.log("Synced →", taskOsJson);
} else {
  if (!existsSync(taskOsJson)) {
    console.error("Missing", taskOsJson);
    process.exit(1);
  }
  writeFileSync(mirror, readFileSync(taskOsJson));
  console.log("Synced →", mirror);
}