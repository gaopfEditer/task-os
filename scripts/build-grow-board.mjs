#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..");
const mirror =
  "/Users/maotouying/.openmausbot/workspaces/81414eac-984c-40f0-a464-bb33d306b30a/grow-operations-board/grow-operations-board.json";

const roles = [
  ["intel", "市场情报研究员", "发现市场、热点、竞品与可运营机会", "机会卡片、热点分析、话题清单"],
  ["user", "用户研究员", "理解用户是谁、痛点与决策行为", "用户画像、痛点库、表达素材"],
  ["strategy", "运营策略师", "把机会转成可执行运营计划", "运营方案、增长路径、任务清单"],
  ["planner", "内容策划师", "选题、栏目、Brief", "选题库、内容日历、创作说明"],
  ["creator", "内容创作师", "可发布内容与多平台适配", "文稿、脚本、素材包"],
  ["channel", "渠道与社区运营", "发布、互动、社区与渠道增长", "发布记录、活动方案、互动索引"],
  ["analytics", "数据分析与运营优化师", "全链路效果与下一轮实验", "看板摘要、归因、优化建议"],
];

const businesses = [
  {
    id: "crypto",
    name: "币圈",
    goal: "社群关注、互动、转化",
    audience: "交易者、行情关注者",
    channels: "X、Telegram、社区",
    metrics: "阅读、转发、关注、社群转化",
    stage: "增长",
  },
  {
    id: "game",
    name: "游戏",
    goal: "活跃、留存、传播",
    audience: "怀旧/攻略/轻度玩家",
    channels: "YouTube、TikTok、论坛",
    metrics: "下载、活跃、留存",
    stage: "启动",
  },
  {
    id: "software",
    name: "软件工具站",
    goal: "搜索流量、注册、付费",
    audience: "开发者、办公用户",
    channels: "SEO、Reddit、Product Hunt",
    metrics: "曝光、点击、注册、付费",
    stage: "探索",
  },
];

const duties = [
  ["intel", "趋势与热点追踪", "Google Trends、行业事件、突发新闻", "进行中", "重点", ""],
  ["intel", "社区情报扫描", "Reddit/X/Discord/TG 可运营话题", "进行中", "重点", ""],
  ["intel", "竞品与商业模式", "竞品动态、变现方式对比", "进行中", "普通", ""],
  ["user", "用户群体划分", "按业务配置拆分画像，禁止跨业务混用", "进行中", "重点", ""],
  ["user", "痛点与需求库", "原话摘录、反复出现的问题", "进行中", "重点", ""],
  ["user", "搜索与决策行为", "搜索意图、参与/付费触发", "待尝试", "普通", ""],
  ["strategy", "阶段目标与定位", "读取情报+用户研究，输出阶段指标", "进行中", "重点", ""],
  ["strategy", "增长与内容节奏", "渠道、活动、转化路径", "进行中", "重点", ""],
  ["strategy", "变现与资源分配", "方案须可拆成具体任务", "待尝试", "普通", ""],
  ["planner", "热点选题池", "价值/时效/竞争评估", "进行中", "重点", ""],
  ["planner", "栏目与系列规划", "长期栏目+系列化", "进行中", "重点", ""],
  ["planner", "内容日历", "关联业务目标与渠道", "进行中", "普通", ""],
  ["creator", "短贴与资讯", "按 Brief 与平台规范", "进行中", "重点", ""],
  ["creator", "深度文与教程", "事实可核验，禁止洗稿多平台伪原创", "进行中", "重点", ""],
  ["creator", "视频脚本与视觉需求", "脚本+配图说明", "待尝试", "普通", ""],
  ["channel", "发布计划与记录", "频率、时段、渠道适配", "进行中", "重点", ""],
  ["channel", "社区互动与活动", "反馈回流用户研究/数据", "进行中", "重点", ""],
  ["channel", "KOL/合作线索", "遵守平台自动化规则", "待尝试", "普通", ""],
  ["analytics", "内容与渠道表现", "曝光→互动→转化分段", "进行中", "重点", ""],
  ["analytics", "实验与 A/B", "必须回答「下一轮改什么」", "进行中", "重点", ""],
  ["analytics", "无效投入识别", "高阅读低转化等内容诊断", "待尝试", "普通", ""],
];

let di = 0;
const data = {
  schema_version: 1,
  meta: {
    system: "发现→理解用户→策略→策划→创作发布→分析优化",
    principle: "通用方法+业务配置切换；业务数据隔离；每事项一个主负责人；重大方向由猫头鹰拍板",
    tab_label: "内容创意",
    openmausbot_mirror: mirror,
    role_bots: {
      intel: "grow·市场情报",
      user: "grow·用户研究",
      strategy: "grow·运营策略",
      planner: "grow·内容策划",
      creator: "grow·内容创作",
      channel: "grow·渠道社区",
      analytics: "grow·数据优化",
    },
    business_config_keys: [
      "goal",
      "audience",
      "product",
      "competitors",
      "channels",
      "style",
      "monetization",
      "risk",
      "stage",
    ],
  },
  roles: roles.map(([id, name, desc, deliverables]) => ({ id, name, desc, goal: desc, deliverables })),
  businesses,
  duties: duties.map(([role_id, name, description, status, priority, business_id]) => ({
    id: "g" + di++,
    role_id,
    business_id: business_id || null,
    name,
    description,
    status,
    priority,
    agent: "",
    collaborators: "",
    archived: false,
    exec_state: "idle",
    exec_note: "",
    exec_at: "",
  })),
  opportunities: [
    { id: "o0", business_id: "crypto", title: "宏观/ETF 事件窗口", kind: "热点", status: "待跟进", priority: "重点" },
    { id: "o1", business_id: "game", title: "怀旧 FC 社区话题", kind: "需求", status: "进行中", priority: "普通" },
    { id: "o2", business_id: "software", title: "文件转换 SEO 长尾", kind: "竞品", status: "进行中", priority: "重点" },
  ],
  items: [],
  logs: [],
};

const out = join(repo, "data/grow-operations-board.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(data, null, 2));
mkdirSync(dirname(mirror), { recursive: true });
writeFileSync(mirror, JSON.stringify(data, null, 2));
console.log("wrote", out);