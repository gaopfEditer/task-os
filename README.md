# Task OS：计划 · 执行 · 复盘

一套放在 `/workspace/task-os/` 的轻量任务系统。计划、执行、复盘分文件存放，历史通过固定目录和索引查询。

## 目录结构

```text
/workspace/task-os/
  README.md                 # 系统说明、状态机、Bot 操作规则
  index.md                  # 当前所有任务一览
  log.csv                   # 每次执行/变更的流水
  templates/
    task.md
    plan.md
    execution.md
    review.md
  tasks/
    T-YYYYMMDD-NN-短标题/
      task.md               # 任务卡：目标、状态、时间
      plan.md               # 计划
      execution.md          # 实践记录（只追加）
      review.md             # 复盘
      artifacts/            # 产出文件
```

## 设计原则

- 一个任务一个文件夹，不把所有内容塞进一个超长文档
- 每件事都有稳定 ID，方便说「改 T-20260928-01」
- 状态只写在少数几个地方：任务卡（task.md）+ 总索引（index.md）
- 复盘必须回写到原任务的 review.md，不另开失联文档
- 查询优先走 index.md 和 log.csv，不翻聊天记录

## 状态机

```text
inbox → planned → in_progress → blocked → done → reviewed
         ↑_______________________|
```

| 状态 | 含义 |
|---|---|
| inbox | 刚收进来，尚未计划 |
| planned | plan.md 已写好 |
| in_progress | 正在执行 |
| blocked | 有卡点，等待解除后回到 planned / in_progress |
| done | 执行完成，待复盘 |
| reviewed | 复盘完成，可归档 |

### 状态转换规则

1. 没写计划（plan.md 为空或仅模板），不能标 `in_progress`
2. execution.md 没有至少一条执行记录，不能标 `done`
3. 没有复盘（review.md 未填写），不能标 `reviewed`，也不能从本周任务里归档
4. 任何状态变更都要追加一行到 `log.csv`

## Bot 操作规则

- 新建任务：按 `templates/` 创建文件夹和 4 个文件 + `artifacts/`，更新 index.md，追加 log.csv，返回任务 ID 和路径
- 任务 ID 当天序号 NN 从 01 起递增，先查 index.md 里当天已有的最大序号
- 所有修改直接改原文件，禁止另存副本
- 完成操作后在聊天里简要说明改了哪些文件

## 系统规则（越用越好查）

1. 任务 ID 格式固定：`T-YYYYMMDD-NN`
2. 只改原文件，不创建 `report_v2.md` 这种副本
3. 执行只追加，不删旧记录
4. 状态变更必须同时改 task.md + index.md + log.csv
5. 产出文件放 `artifacts/`，并在 execution.md 里写路径
6. 回答历史问题时，先读 index.md 和 log.csv，再读单个任务文件，不凭记忆回答

<!-- 复盘中沉淀出的可复用规则追加在这里 -->

## log.csv 字段

| 字段 | 说明 |
|---|---|
| time | `YYYY-MM-DD HH:MM`（Asia/Hong_Kong） |
| task_id | 任务 ID |
| action | create / plan / execute / status / review / edit |
| from_status | 变更前状态（无则留空） |
| to_status | 变更后状态（无则留空） |
| summary | 一句话摘要（含逗号时用双引号包裹） |
| file | 相对 task-os 根目录的文件路径 |

## 每日日记（daily/）

除了按任务存放的计划 / 执行 / 复盘，还可以按天记录：每天一个文件 `daily/YYYY-MM-DD.md`，从 `templates/daily.md` 复制。

```text
daily/
  2026-09-30.md
  2026-10-01.md
```

文件格式固定为一个标题加三个小节，小节下面自由写 Markdown：

```markdown
# 2026-09-30

## 计划

## 实践

## 复盘
```

- **计划**：可以提前给未来的日期写（比如周末写好下周每天的计划），文件名就用那一天的日期
- **实践**：当天实际做了什么、执行记录、遇到的问题
- **复盘**：当天结束时的总结、收获和改进
- 提到相关任务时直接写任务 ID，如 `T-20260928-01`，看板会自动链接到对应任务文件夹
- 日记可以随时修改和补充（不像 `execution.md` 那样只追加），直接改原文件，不另存副本
- 日记不改变任务状态：任务状态变更仍按上面的规则同时改 `task.md` + `index.md` + `log.csv`
- 网页看板的「日历」「历史」页读取 `daily/`；在日历里点某一天 →「编辑」可以直接在网页上改这一天的计划 / 实践 / 复盘并提交到 `main` 分支。这需要在看板「设置」里填一个只对本仓库有 Contents 读写权限的 GitHub 细粒度令牌，令牌只保存在该浏览器本地

## 看板

网页看板：<https://gaopfediter.github.io/task-os/>（GitHub Pages，发布自 `main` 分支根目录的 `index.html`）。

- 看板在浏览器里实时读取仓库根目录的 `index.md` 和 `log.csv`，按状态分列显示任务卡片、汇总数量、截止提醒和执行时间线，不存任何副本数据。
- 只要按上面的规则保持 `index.md` 和 `log.csv` 更新，看板就会自动反映最新状态（推送后 Pages 通常 1–2 分钟生效，点「刷新」重新加载）。
- 根目录的 `.nojekyll` 让 Pages 原样提供 `.md` / `.csv` 文件，请勿删除。
