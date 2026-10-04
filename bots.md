# Bot

各 bot 的职责、负责项目、产出和上下游，看板「Bot」页读取并展示这个文件。每个 `## ` 是一个 bot，下面固定七个小节：一句话职责、负责项目 / 目录、主要产出、所属领域、上下游、边界（不做什么）、状态 / 待补充。「所属领域」只写 areas.md 里的四个领域名（Web3 信号和单子 / Web3 运营 / 软件开发和海外需求 / 成长）；「上下游」写成「- 上游：…」「- 下游：…」两行，多个用顿号分隔。只写核实过的内容，没核实的写「待补充」。

本机还有几个目录没确认归属，确认后填到对应 bot 的「负责项目 / 目录」：`/workspace/crypto-social-reply-assistant/`（币安广场 / OKX / Gate 社交回复 Chrome 扩展）、`/workspace/auto-script-review/`（auto-script `gemma4-model` 分支选币与信号做单逻辑评估）、`/workspace/idea-os/`（money / sources / trading 三个文件，目前只有标题）。

## 任务管家

### 一句话职责

记录要做什么（计划 / 实践 / 复盘），维护 task-os 仓库和这个看板，方便查漏补缺。

### 负责项目 / 目录

- 仓库 `gaopfEditer/task-os` 和看板 `index.html`（GitHub Pages：https://gaopfediter.github.io/task-os/）
- `tasks/`、`index.md`、`log.csv`：任务建档和状态（目前有 T-20260928-01 建立任务系统、T-20260930-01 国庆十天计划）
- `daily/`、`weekly/`、`monthly/`：每日计划 / 实践 / 复盘 / 关键事件，周 / 月总结
- `areas.md`、`bots.md`、`templates/`、`notes/量价案例/`
- 本机 `/workspace/task-os/`（content-os README 里约定的任务管家目录）
- 本机 `/workspace/vpa/`（量价案例分析脚本和图）、`/workspace/pending/insights.md`（提交受阻时暂存的灵感）

### 主要产出

- 每日计划、实践、复盘（`daily/YYYY-MM-DD.md`），周 / 月总结（日 / 周 / 月）
- 灵感、额外收获（追加到周 / 月文件的小节）
- 看板各页：看板 / 日历 / 领域 / 资源 / Bot
- 任务文件与状态变更（task.md + index.md + log.csv 同步改）

### 所属领域

- 成长

### 上下游

- 上游：鹏飞（聊天 / 语音说的计划、灵感）、webhook（记录实践内容）、资讯创作官（稿件里的 related_task）
- 下游：鹏飞（看板查漏补缺、复盘）

### 边界（不做什么）

- 只改原文件，不另存副本；执行记录只追加，不删旧记录
- 不改 `info/`（资讯创作官维护），`info/resources.md` 在看板上只读

### 状态 / 待补充

- webhook「记录实践内容」：不是定时任务，收到 POST 时触发，写进当天「实践」；还没实际测过

## 灵感随笔

### 一句话职责

替代原本零碎的日志，聚合起来便于复盘。

### 负责项目 / 目录

待补充

### 主要产出

待补充

### 所属领域

- 成长

### 上下游

- 上游：鹏飞（零碎日志 / 想法）
- 下游：待补充

### 边界（不做什么）

待补充

### 状态 / 待补充

- bot 资料里还没有职责描述；负责目录、产出、边界都待补充
- 和任务管家「记灵感」怎么分工：待补充
- areas.md 建议过「发布结果回流灵感随笔 / 任务管家复盘」，还没落地

## 资讯创作官

### 一句话职责

按确认过的平台获取币圈资讯，按模板写稿和归档，并记录资源。

### 负责项目 / 目录

- 本机 `/workspace/content-os/`：`inbox/`、`topics/`、`templates/`（brief / research / draft / review）、`sources.md`、`categories.md`、`filter.md`、`calendar.md`、`resources.md`、`index.md`、`log.csv`
- 本仓库 `info/`：content-os 的同步副本（提交名「同步 content-os：…」），含 `info/resources.md`

### 主要产出

- inbox 线索：标题、链接、时间、来源平台、一句话摘要、相关性，按 `categories.md` 标小类、按 `filter.md` 打分
- 选题 `topics/C-YYYYMMDD-NN-短标题/`（brief / research / draft / review），目前 3 个：C-20260929-01 过年把三代人串起来（archived，初始化示例）、C-20260929-02 币圈日报（researching）、C-20261003-01 SEC 批准 3 倍杠杆加密 ETP（drafting，样稿未发布）
- `resources.md` 资源收藏列表（看板「资源」页只读展示）

### 所属领域

- Web3 运营

### 上下游

- 上游：出海大师（简报）、交易观察员（事件线索，C-20261003-01 的线索来自其监控）、鹏飞（确认来源 sources.md 和模板）
- 下游：任务管家（稿件写 related_task，由任务管家建任务排期）、鹏飞（审稿后经 cdp 发布）

### 边界（不做什么）

- 不改 task-os 的任务状态，需要排期只写 related_task
- 不写买卖建议，不碰钱包，不替人下单或授权
- 只用 `sources.md` 里已确认的平台，不自行扩充、不全网乱扫
- 不改模板的标题结构、小节顺序或字段；没有 brief 不写 draft；改稿只改原文件

### 状态 / 待补充

- sources.md 目前只确认了 1 个来源（Foresight News），其余待确认；inbox 目前为空
- areas.md 建议：和交易观察员职责去重（交易观察员管事件与行情数据，资讯创作官管归纳写稿）

## 交易观察员

### 一句话职责

监听解锁、上合约、销毁、下架等事件并核表算前后涨跌，另做币圈资讯抓取程序（输出为网页）。

### 负责项目 / 目录

- 本机 `/workspace/trading-watch/`：
  - `unlock_tracker/unlock_tracker.py`：代币解锁 + 解锁前 7 天逐日涨跌、解锁后表现、相对 BTC
  - `futures_listing_tracker/`、`burn_tracker/`、`delist_tracker/`：上合约、销毁、下架追踪（同一风格）
  - `burn_research/`、`delist_research/`、`futures_research/`、`near_research/`：事件研究数据
  - `news_watch/`：加密新闻重要性过滤（README 写明约每 15 分钟定时跑一次，命中记到 `hits.jsonl`）
  - `news_dashboard/`：加密新闻实时看板网页（本机 `127.0.0.1:5190`，零依赖）
  - `SOURCES.md`：数据来源和口径

### 主要产出

- 四组已核事件表（2026-10-01 一批）：`unlocks_*`、`perp_listings_*`、`burns_*`、`delistings_*`，各带 `*_pre7d_daily_*` 逐日表
- 各 tracker 的 `output/` 窗口结果（如 unlock_tracker 2026-09-24 至 2026-10-04 的几个窗口）
- 新闻命中摘要（中文）和新闻看板网页

### 所属领域

- Web3 信号和单子

### 上下游

- 上游：公开数据源（PANews、Tokenomist、DefiLlama、Binance、CoinGecko 等，见 SOURCES.md）
- 下游：出海大师（10-02 机会备忘的数字全部取自已核表）、资讯创作官（事件线索）、鹏飞（辅助做单）

### 边界（不做什么）

待补充

### 状态 / 待补充

- bot 资料里还没有职责描述；边界待补充（areas.md 建议：只管事件与行情数据，归纳写稿交给资讯创作官）
- 事件模板验证记录（每次预测 vs 实际，跑 20–30 次再判断准不准）是 areas.md 的建议，还没落地

## 出海大师

### 一句话职责

赚钱决策：选题、取舍与建议（动作 / 代价 / 边界 / 验证），给资讯创作官下简报、给代码大师派自动化环节。

### 负责项目 / 目录

- 本机 `/workspace/ops-master/`：`opportunities-2026-10-02.md`（机会决策备忘，当时署名「运营大师」）
- 只读引用 `/workspace/trading-watch/` 和 `/workspace/content-os/`

### 主要产出

- 机会决策备忘：每个候选先归栏目，再判「做 / 观察 / 否」，写清动作、代价、边界、验证。10-02 的结论是把交易观察员的四组已核事件表做成周更「事件定价周报」，第二项是 Upwork 加密数据 / 公告监控开发
- 给资讯创作官的简报、给代码大师的自动化环节

### 所属领域

- Web3 运营

### 上下游

- 上游：交易观察员（已核事件表）、鹏飞（目标和时间安排）
- 下游：资讯创作官（简报）、代码大师（自动化环节）、鹏飞（决策建议）

### 边界（不做什么）

- 不写成稿，不写代码（备忘署名里的说明）
- 不改价位、不加样本、不承诺收益

### 状态 / 待补充

- 原名运营大师，areas.md 里还写的是「运营大师」
- 10-02 备忘里排到下周的代码大师环节（weekly runner、未来事件导出、Upwork demo）是否已派出：待补充

## 代码大师

### 一句话职责

承接出海大师派来的自动化环节。

### 负责项目 / 目录

待补充

### 主要产出

待补充

### 所属领域

- Web3 运营

### 上下游

- 上游：出海大师（自动化环节）
- 下游：待补充

### 边界（不做什么）

待补充

### 状态 / 待补充

- bot 资料里还没有职责描述；负责目录、产出、边界待补充
- 出海大师 10-02 备忘里拟派的环节（都还是计划）：weekly runner（一条命令跑完四个 tracker + compare，合成 `weekly_pack/`）、表格转 PNG 图卡、未来事件导出 `calendar_next7d.csv`、`calendar_vs_actual` 对账脚本、tracker demo

## Grok Bot

### 一句话职责

通用队友，有自己的电脑，接手实际工作。

### 负责项目 / 目录

待补充

### 主要产出

待补充

### 所属领域

待补充

### 上下游

- 上游：鹏飞
- 下游：待补充

### 边界（不做什么）

待补充

### 状态 / 待补充

- 不固定在某个领域；负责项目、产出、领域、边界都待补充
