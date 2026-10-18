# requirement-trendradar · 状态文档（给另一边 bot）

- **整理时间**：2026-10-18（Asia/Shanghai）
- **整理方**：出海大师（落盘 TaskOS）
- **用途**：跨 bot 同步需求雷达站能力、数据与接手要点；勿写主人真名
- **线上站**：https://gaopfediter.github.io/requirement-trendradar/
- **仓库**：`gaopfEditer/requirement-trendradar`（Pages 由 Actions 从 **main** 的 `public/` 部署，无独立 gh-pages 分支）
- **主落盘**：本文件属于 TaskOS `docs/`；跨 bot 任务/验收状态另见 `docs/任务管家视角-状态同步-2026-10-18.md`
- **ops-master 草稿**：`/workspace/ops-master/需求发现-bot接手文档-2026-10-18.md`（细节草稿；冲突时以本文件 + 线上 `meta.json` 为准）
- **说明**：数字来自线上 `data/meta.json`；过期处标「待确认」

---

## 1) 站点定位与当前功能

**定位**：内部用的海外需求雷达——**短线**看 Freelancer 开放帖（人工投标入口），**长线**看 Trends/排行机会卡（选词灵感，不作本周接单验收）。

### 流水线（已上线）

```
Freelancer 公开 API
  → job ingest（scripts/ingest_job_leads.py）
  → 双轨三关筛选（scripts/lib/dual_track_screen.py）
  → public/data/job_leads.json
  → Pages「接单帖」页展示

并行：Google Trends + Product Hunt/CSV 排行
  → opportunities / weekly_movers
  → Pages 首页机会卡与周榜
```

| 能力 | 状态 | 入口 |
|------|------|------|
| Freelancer 公开帖抓取 | **已上** | API `projects/all`；不登录 |
| 约每 4 小时流水线 | **已上** | Actions `daily-radar.yml`（cron `0 */4 * * *` UTC）+ `job-leads.yml` |
| 双轨三关筛选 → 推荐池 | **已上** | 推荐字段进 `job_leads`；jobs 页筛「推荐」 |
| 公开 Pages 展示 | **已上** | https://gaopfediter.github.io/requirement-trendradar/ |
| 首页中文简介 | **已上**（PR #8，2026-10-18） | `public/index.html` 的 `.site-intro` |
| jobs 面板 UX | **已上**（PR #6/#7） | https://gaopfediter.github.io/requirement-trendradar/jobs.html |
| Fiverr buyer_requests | **跳过** | meta：`fiverr_skipped`，原因 HTTP 403 / bot wall |
| 自动投标 / 登录墙爬取 | **不做** | 边界硬规则 |

### 首页中文简介（上站原文）

这是内部用的海外需求雷达：用公开 API 抓取 Freelancer 开放帖（约每 4 小时刷新），经双轨三关筛选后进入推荐池，在「接单帖」页查看；另一边交叉 Google Trends 与排行变更，在首页看机会卡与周榜。先看 jobs 里「推荐 + Open」再人工投标；Trends 若标演示数据则只作灵感。本站不登录平台、不自动投标。

---

## 2) 数据来源与更新时间

数据文件在线上：`https://gaopfediter.github.io/requirement-trendradar/` 下的 `data/*.json`（部署自 `public/data/`）。

### 最近一次核验（2026-10-18）

来源：`data/meta.json`（香港时区标签）

| 字段 | 值（核验时） |
|------|----------------|
| `updated_at` / `published_at` | **2026-10-18T16:42:11+08:00** |
| `schedule` | `every_4h` |
| `last_run_ok` | true |
| `job_leads_count` | **31** |
| `job_leads_recommend_count` | **10** |
| `trends_source` / `trends_demo_active` | **demo** / true（live Trends 易 400 → 回退演示数据） |
| `fiverr_skipped` | true（403 login/bot wall） |
| `last_job_ingest_ok` | true |

### 源与边界

| 源 | 用途 | 边界 |
|----|------|------|
| Freelancer 公开 API | 开放帖 → 推荐池 | 不登录、不存 cookie、不投标；Closed/Awarded 不进 |
| Google Trends | 机会卡斜率 / 周榜词条 | 演示数据时**只作灵感**，不作付费证据 |
| Product Hunt / CSV 排行 | 排行 Δ 信号 | 种子卡≠买家帖；pay_intent 为【估】 |
| Fiverr | 曾试 buyer_requests | 当前跳过；uploads 合并待做 |

---

## 3) 接手要点（另一边 bot）

### 谁改哪里

| 区域 | 谁写 | 谁不写 |
|------|------|--------|
| `requirement-trendradar` 代码 / Actions / Pages | **代码大师**（云端 PR） | 出海大师不写程序；任务管家不擅自改仓 |
| 搜投取舍、双轨词、三关策略 brief | **出海大师** | 不代投、不写最终帖 |
| 看板验收 / 排期 | **任务管家** | 不改 ops-master 正文；链 TaskOS 本文件 |
| 机会卡「做/观察/否」拍板 | 出海大师（建议）→ 主人确认 | 勿把雷达观察当接单验收 |
| 推荐池/机会卡「做/观察/否」初判素材；长线主题筛选与可行性（可补 Trends/社区/论坛） | **市场先导** | 不改仓、不写代码、不代投、不写最终帖；短线接单验收仍在接单通道，雷达观察不作接单验收 |

### 日常用法（短线）

1. 打开 https://gaopfediter.github.io/requirement-trendradar/jobs.html  
2. 筛 **推荐 + Open**，点标题外链到 Freelancer  
3. **人工**投标；面板「重要/已看」只在本机 localStorage  
4. 首页 Trends 若标演示 → 不据此排验收

### 运维注意

- Pages：push **main** → `Deploy GitHub Pages` 上传 `public/`  
- **勿**对已 upload 的 run 做「Re-run failed jobs」（会双 artifact）；失败用新 dispatch / 空 push  
- URL 对外一律：`https://gaopfediter.github.io/requirement-trendradar/`（完整形态，带结尾斜杠）

### 相关文档

- 跨 bot 总状态：`docs/任务管家视角-状态同步-2026-10-18.md` · Pages https://gaopfediter.github.io/task-os/#docs  
- 需求发现细节草稿：`/workspace/ops-master/需求发现-bot接手文档-2026-10-18.md`  
- 双轨策略计划：`/workspace/ops-master/出海接单策略计划-2026-10-17.md`

---

## 4) 待办

1. **真投闭环**：jobs 推荐池人工投 3–5，吃透 Freelancer 案例（验收仍在接单通道，不在雷达基建）。  
2. **Fiverr**：登录/uploads → `job_leads` 最小合并（现 403）；需主人侧登录能力【待确认】。  
3. **Trends live**：减少 demo 回退频率（配额/限速）；demo 期间周榜只作灵感。  
4. **种子卡清理**：勿把服务名假设卡当买家帖（历史 ranking_ref 错指问题已记录）。  
5. **（可选）** Upwork：主人导出帖 → 三关脚本筛；不登录刮取。  
6. 本文件经 PR 进 `gaopfEditer/task-os` main 后，Pages `#docs` 可点开；数字以线上 `meta.json` 再核。

---

## 5) 优先级（出海视角）

1. **用 jobs 推荐池真投** — 站已可用，价值在人工闭环。  
2. **保持 4h 流水线健康** — meta `last_run_ok`；失败不 Re-run failed。  
3. **Fiverr/uploads** — 有登录再做，不绕墙。  
4. **长线 Trends/建站** — 观察；不占本周接单唯一验收。

---

*落盘：2026-10-18 Asia/Shanghai · TaskOS docs · 推 GitHub 后以 Pages 为准*
