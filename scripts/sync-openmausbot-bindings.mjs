/**
 * 将 OpenMausBot General 部门 bot 绑定写入 Task OS 三看板 JSON（不重建 duties）。
 * Usage: node scripts/sync-openmausbot-bindings.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");

const WORKSPACE =
  "C:\\Users\\eason\\.openmausbot\\workspaces\\9e834061-15eb-43eb-b9f2-911161e85c22";
const MIRrors = {
  command: `${WORKSPACE}\\dispatch-command-center\\command-center.json`,
  work: `${WORKSPACE}\\work-skills-board\\work-skills-board.json`,
  grow: `${WORKSPACE}\\grow-operations-board\\grow-operations-board.json`,
};

const BINDINGS = {
  "dispatch·总调度": {
    bot_id: "afe2ac3d-ba69-4567-aad8-5d8eb798617b",
    openmausbot_name: "总调度",
    role_key: "dispatcher",
    link: "active",
  },
  "work·工作问题收集器": {
    bot_id: "e55d7b04-484d-4b2f-809e-26acb7f09ef7",
    openmausbot_name: "work·工作问题收集器",
    role_key: "collector",
    link: "active",
  },
  "work·技术研究员": {
    bot_id: "eabac058-364b-475a-bdcf-fff9a5c2e0d2",
    openmausbot_name: "技逆向",
    role_key: "researcher",
    link: "active",
    note: "Task OS 职能名 work·技术研究员",
  },
  "work·项目分析师": {
    bot_id: "1ad0da16-7a04-4e3d-b109-94a22ee7c9bc",
    openmausbot_name: "产品设计",
    role_key: "analyst",
    link: "active",
    note: "Task OS 职能名 work·项目分析师",
  },
  "work·工程实践顾问": {
    bot_id: "dc4a4ecb-a50e-4163-814b-f24e2d01128d",
    openmausbot_name: "编码部署",
    role_key: "engineer",
    link: "active",
    note: "Task OS 职能名 work·工程实践顾问",
  },
  "work·技术评审者": {
    bot_id: "83eee851-4e32-4b3b-a6b8-9b1448e24e9a",
    openmausbot_name: "work·技术评审者",
    role_key: "reviewer",
    link: "active",
  },
  "work·技术学习教练": {
    bot_id: "dc3694b6-46e5-4e22-8e63-21cbc16c7f9f",
    openmausbot_name: "work·技术学习教练",
    role_key: "coach",
    link: "active",
  },
  "grow·市场情报": {
    bot_id: "49aa248d-4b1a-4b08-9366-3beb62600fa9",
    openmausbot_name: "源雷达",
    role_key: "intel",
    link: "active",
    note: "暂由源雷达兼任，后续可拆独立 grow·市场情报",
  },
  "grow·用户研究": {
    bot_id: "60364a5b-5234-4016-8409-d7684bff942e",
    openmausbot_name: "grow·用户研究",
    role_key: "user",
    link: "active",
  },
  "grow·运营策略": {
    bot_id: "520cc044-7cd8-4808-988e-1b9ccdd075fd",
    openmausbot_name: "grow·运营策略",
    role_key: "strategy",
    link: "active",
    note: "重大方向拍板仍归我",
  },
  "grow·内容策划": {
    bot_id: "2ddcba47-01d6-4aca-8359-3941a064b74e",
    openmausbot_name: "grow·内容策划",
    role_key: "planner",
    link: "active",
  },
  "grow·内容创作": {
    bot_id: "ca3bf900-9da0-4654-8eb5-51fef593dffd",
    openmausbot_name: "grow·内容创作",
    role_key: "creator",
    link: "active",
  },
  "grow·渠道社区": {
    bot_id: "49aa248d-4b1a-4b08-9366-3beb62600fa9",
    openmausbot_name: "源雷达",
    role_key: "channel",
    link: "proxy",
    note: "发布/互动仍须我确认；待独立 grow·渠道社区",
  },
  "grow·数据优化": {
    bot_id: "f3b28263-e68d-4a85-ad32-dadaf8b23196",
    openmausbot_name: "交易观察员",
    role_key: "analytics",
    link: "proxy",
    note: "币圈度量为主；待 grow·数据优化",
  },
};

const ROLE_AGENT = {
  collector: "work·工作问题收集器",
  researcher: "work·技术研究员",
  analyst: "work·项目分析师",
  engineer: "work·工程实践顾问",
  coach: "work·技术学习教练",
  reviewer: "work·技术评审者",
  intel: "grow·市场情报",
  user: "grow·用户研究",
  strategy: "grow·运营策略",
  planner: "grow·内容策划",
  creator: "grow·内容创作",
  channel: "grow·渠道社区",
  analytics: "grow·数据优化",
};

const ts = "2026-11-20T09:30:00+08:00";

function patchWork(file) {
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  raw.meta.openmausbot_mirror = MIRrors.work;
  raw.meta.openmausbot_bindings = BINDINGS;
  raw.meta.synced_at = ts;
  for (const d of raw.duties) {
    const agent = ROLE_AGENT[d.role_id];
    if (agent) d.agent = agent;
  }
  for (const r of raw.roles) {
    const b = BINDINGS[ROLE_AGENT[r.id]];
    if (b) {
      r.openmausbot = {
        bot_id: b.bot_id,
        name: b.openmausbot_name,
        link: b.link,
        note: b.note || "",
      };
    }
  }
  fs.writeFileSync(file, JSON.stringify(raw, null, 2) + "\n");
}

function patchGrow(file) {
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  raw.meta.openmausbot_mirror = MIRrors.grow;
  raw.meta.openmausbot_bindings = BINDINGS;
  raw.meta.synced_at = ts;
  for (const d of raw.duties) {
    const agent = ROLE_AGENT[d.role_id];
    if (agent) d.agent = agent;
  }
  for (const r of raw.roles) {
    const b = BINDINGS[ROLE_AGENT[r.id]];
    if (b) {
      r.openmausbot = {
        bot_id: b.bot_id,
        name: b.openmausbot_name,
        link: b.link,
        note: b.note || "",
      };
    }
  }
  fs.writeFileSync(file, JSON.stringify(raw, null, 2) + "\n");
}

function patchCommand(file) {
  const raw = JSON.parse(fs.readFileSync(file, "utf8"));
  raw.meta.openmausbot_mirror = MIRrors.command;
  raw.meta.openmausbot_bindings = BINDINGS;
  raw.meta.dispatcher_bot_id = BINDINGS["dispatch·总调度"].bot_id;
  raw.meta.synced_at = ts;
  raw.meta.updated_at = ts;
  const t3 = raw.tasks.find((t) => t.id === "task_003");
  if (t3) {
    t3.status = "in_progress";
    t3.deliverable = "command-center 与 OpenMausBot 绑定已写入 JSON（2026-11-20）";
    t3.updated_at = ts;
  }
  fs.writeFileSync(file, JSON.stringify(raw, null, 2) + "\n");
}

patchWork(path.join(dataDir, "work-skills-board.json"));
patchGrow(path.join(dataDir, "grow-operations-board.json"));
patchCommand(path.join(dataDir, "command-center.json"));

console.log("Synced OpenMausBot bindings to", dataDir);