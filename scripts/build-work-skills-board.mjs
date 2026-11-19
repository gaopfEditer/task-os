#!/usr/bin/env node
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, "..");
const mirror =
  "/Users/maotouying/.openmausbot/workspaces/81414eac-984c-40f0-a464-bb33d306b30a/work-skills-board/work-skills-board.json";

const roles = [
  ["collector", "工作问题收集器", "信息入口：收集→去重→分类→分派，不做深度分析", "不遗漏问题与机会，降低分派成本", "待处理问题列表、分派结果、灵感库索引"],
  ["researcher", "技术研究员", "发现可利用的技术、开源项目与工具机会", "技术机会、可用方案、可运行 Demo", "技术发现卡片、选型对比、技术资源库"],
  ["analyst", "项目分析师", "需求→架构→任务：把模糊想法变成可执行方案", "需求说明、架构设计、开发任务与验收标准", "不为了架构而架构；不确定须标注"],
  ["engineer", "工程实践顾问", "编码、修复、测试、交付可运行成果", "已修改≠已完成：须区分编译/运行/测试/验收", "可运行代码、测试与部署说明"],
  ["coach", "技术学习与成长教练", "从真实工作提炼原理与可迁移能力", "原理解释、知识地图、经验总结", "不把所有工作变成课程"],
  ["reviewer", "技术评审与批判者", "独立审查方案、代码与成果，纠偏", "评审意见、风险清单、验收结果", "按需介入，不刻意找茬"],
];

const duties = [
  ["collector", "技术问题入口", "接收 Bug/兼容/性能等问题，去重后分派主负责人", "进行中", "重点"],
  ["collector", "技术与灵感收录", "链接/截图/语音转写入库，推荐负责角色", "进行中", "重点"],
  ["collector", "事项去重与索引", "对照已有队列，标注重复与关联项目", "进行中", "普通"],
  ["researcher", "AI Agent 技术研究", "LLM、Agent、MCP、Skills、RAG、多 Agent 协作", "进行中", "重点"],
  ["researcher", "GitHub 开源项目挖掘", "成熟度、维护、部署与学习成本评估", "进行中", "重点"],
  ["researcher", "技术 Demo 验证", "小规模验证后可运行 Demo", "进行中", "重点"],
  ["researcher", "前端框架研究", "前端/后端/部署方案对比", "待研究", "普通"],
  ["researcher", "新技术趋势追踪", "观察新兴框架与产品", "暂缓", "普通"],
  ["analyst", "需求澄清与边界", "场景、功能边界、隐含需求与假设", "进行中", "重点"],
  ["analyst", "架构与模块拆分", "接口、依赖、模块边界与取舍说明", "进行中", "重点"],
  ["analyst", "开发任务与验收", "任务顺序、依赖、验收条件", "进行中", "重点"],
  ["analyst", "现有项目结构分析", "目录、技术债务、扩展点", "进行中", "普通"],
  ["engineer", "功能开发与交付", "前后端/接口/业务实现", "进行中", "重点"],
  ["engineer", "Bug 定位与修复", "复现、日志、回归验证", "进行中", "重点"],
  ["engineer", "测试与构建验证", "单测/集成/边界；编译运行分离标注", "进行中", "重点"],
  ["engineer", "工程化与部署", "CI/CD、环境、发布说明", "待尝试", "普通"],
  ["coach", "工作中原理讲解", "由真实问题触发，结合项目代码", "进行中", "重点"],
  ["coach", "知识地图维护", "长期可迁移知识点归档", "待尝试", "普通"],
  ["coach", "能力变化记录", "阶段性可独立运用项", "待尝试", "普通"],
  ["reviewer", "需求与架构评审", "遗漏、过度设计、更简单方案", "进行中", "重点"],
  ["reviewer", "代码与测试评审", "逻辑/边界/只测正常路径", "待尝试", "重点"],
  ["reviewer", "成果验收", "对照原定目标与验收标准", "待尝试", "重点"],
];

const items = [
  ["researcher", "研究 Hermes 浏览器自动化能力", "researcher", "能力分析"],
  ["analyst", "分析工具站技术架构", "analyst", "架构文档"],
  ["engineer", "多格式文件转换模块", "engineer", "可运行模块"],
  ["coach", "文件转换异步机制", "coach", "原理笔记"],
  ["reviewer", "转换任务异常处理", "reviewer", "评审意见"],
];

let i = 0;
const data = {
  schema_version: 1,
  meta: {
    system: "收集器→研究员→分析师→工程顾问→评审者→成长教练→反哺",
    principle: "每事项一个主负责人；简单 Bug 直交工程顾问；重大选型才走全链",
    openmausbot_mirror: mirror,
    role_bots: {
      collector: "work·工作问题收集器",
      researcher: "work·技术研究员",
      analyst: "work·项目分析师",
      engineer: "work·工程实践顾问",
      coach: "work·技术学习教练",
      reviewer: "work·技术评审者",
    },
    routing: [
      { q: "发现 GitHub 项目", owner: "researcher", helpers: ["analyst"] },
      { q: "框架是否适合项目", owner: "researcher", helpers: ["analyst", "reviewer"] },
      { q: "新项目/复杂功能", owner: "analyst", helpers: ["researcher"] },
      { q: "写代码/修 Bug", owner: "engineer", helpers: ["analyst"] },
      { q: "不懂的原理", owner: "coach", helpers: ["researcher"] },
      { q: "检查 AI 代码", owner: "reviewer", helpers: ["engineer"] },
      { q: "随手记问题", owner: "collector", helpers: [] },
    ],
  },
  roles: roles.map(([id, name, desc, goal, deliverables]) => ({ id, name, desc, goal, deliverables })),
  duties: duties.map(([role_id, name, description, status, priority]) => ({
    id: "w" + i++,
    role_id,
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
  items: items.map(([role_id, name, owner, output], j) => ({
    id: "i" + j,
    role_id,
    name,
    owner_role: owner,
    expected_output: output,
    exec_state: "idle",
    exec_note: "",
  })),
  logs: [],
};

const out = join(repo, "data/work-skills-board.json");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(data, null, 2));
mkdirSync(dirname(mirror), { recursive: true });
writeFileSync(mirror, JSON.stringify(data, null, 2));
console.log("Wrote", out, "and mirror", mirror);