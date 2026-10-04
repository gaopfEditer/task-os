# 研究笔记（research）

- content_id：C-20261005-01

> 本文件**只放事实与引用**，不写观点、不写成稿。观点写在 brief.md 结论或 draft.md 正文。
> 每条素材固定四行：来源链接、摘录、可信度、用在哪一段。
> 时间统一用 UTC+8（HKT）。已核表的时间列名为 unlock_time_utc8 / price_now_time_utc8，本身就是 UTC+8，未做换算。
> 数字规则（sources.md MKT-01）：只用已核表里已有的数字，不改价位，不补样本，不做推算。涨跌幅只做四舍五入到 2 位小数的显示处理；占流通照 CSV 原值写。

## 0. 数据核对（2026-10-05 06:0x HKT）

### 0.1 trading-watch 目录清点（只读）
- 目录存在：/workspace/trading-watch
- *_YYYY-MM-DD.csv 已核表（8 个，都是 2026-10-01 一期）：burns_2026-10-01.csv、burns_pre7d_daily_2026-10-01.csv、delist_pre7d_daily_2026-10-01.csv、delistings_2026-10-01.csv、perp_listings_2026-10-01.csv、perp_listings_pre7d_daily_2026-10-01.csv、unlocks_2026-10-01.csv、unlocks_pre7d_daily_2026-10-01.csv
- tracker output 目录：burn_tracker/output/{noextra_2026-09-24_2026-10-01, test_2026-09-24_2026-10-01}；delist_tracker/output/{test_2026-09-24_2026-10-01, test_extra}；futures_listing_tracker/output/{default_live, test_2026-09-24_2026-10-01}；unlock_tracker/output/{2026-09-25_2026-10-02, 2026-09-26_2026-10-03, 2026-09-27_2026-10-04, live_default, test_2026-09-24_2026-10-01}
- SOURCES.md：存在（快照 sources/trading-watch-SOURCES.snapshot-20261005.md）
- 不算来源：near_research/、raw/、各 *_research/ 与 cache/ 里的原始 JSON（没有已核表）

### 0.2 unlocks_2026-10-01.csv 核对
- 行数：表头 1 行 + 数据 **14 行**（`wc -l` = 15），与预期 14 一致。
- 列数：24 列：ticker, name, unlock_time_utc8, unlock_amount, source_value_usd, computed_value_usd, pct_circ, recipients, unlock_source, price_source, price_7d_before, price_at_unlock, price_24h_after, price_now, price_now_time_utc8, pre7d_change_pct, post_unlock_change_pct, change_24h_after_pct, post_low_vs_unlock_pct, post_high_vs_unlock_pct, btc_pre7d_change_pct, btc_post_change_pct, relative_vs_btc_post_pp, note
- 主表需要的 6 列全部存在：币种 = ticker；解锁时间 = unlock_time_utc8；占流通 % = pct_circ；解锁前 7 天涨跌 = pre7d_change_pct；解锁后涨跌 = post_unlock_change_pct；同期相对 BTC（pp）= relative_vs_btc_post_pp。另有必引列 unlock_source、price_source。这 8 列 14 行都没有空值。
- 时区：UTC+8（列名带 _utc8），不需要换算。
- 窗口：最早 2026-09-24 17:00（SOSO），最晚 2026-10-01 12:00（EIGEN），都在 09-24～10-01 内。
- 数据截止：price_now_time_utc8 = 2026-10-01 12:39 / 12:40（CoinGecko 行）、12:42（Binance 行）；SOURCES.md 写「Now = latest point (~2026-10-01 12:40 UTC+8)」。
- 口径（SOURCES.md）：解锁时价格 = 含解锁时刻的 1h K 线开盘价（Binance）或解锁时刻及之前最后一个 CoinGecko 小时点；前 7 天 = 同一规则取解锁前 168h；BTC 基准 = Binance BTCUSDT 同窗口。「解锁后涨跌」= 解锁时价格到 price_now 的涨跌（不是固定 24h 或 7 天）。
- 校验：relative_vs_btc_post_pp = post_unlock_change_pct − btc_post_change_pct（14 行逐行核对一致，只用于确认列含义，不进正文）。
- 行顺序：CSV 原顺序在 STBL(09-26 18:00)/ALT(09-26 07:29) 和 CARDS(09-30 03:00)/ZORA(09-30 00:17) 两处不按时间；草稿主表按解锁时间排序，数字不变。
- 空值（不在主表 6 列内）：change_24h_after_pct 在 KMNO、SUI、EIGEN 为空；source_value_usd 在 ALT、GRASS、ZORA、GUN 为空；note 在 SOSO、BIGTIME、STBL、KMNO 为空。
- unlock_source：PANews/Tokenomist 10 行（SOSO、H、BIGTIME、XPL、STBL、FF、CARDS、KMNO、SUI、EIGEN）；DefiLlama 4 行（ALT、GRASS、ZORA、GUN，note 写「仅DefiLlama数据」）。
- price_source：Binance spot 1h klines 8 行（BIGTIME、XPL、ALT、FF、GUN、KMNO、SUI、EIGEN）；CoinGecko market_chart days=16 (hourly) 6 行（SOSO、H、STBL、GRASS、CARDS、ZORA）。
- 快照：sources/unlocks_2026-10-01.snapshot-20261005.csv（与原文件 cmp 一致，sha256 5555d002ab8ead8bee342c4cd6604966e8db51641659e0c3f68f1492275fc9a8）

### 0.3 主表（照 CSV；涨跌幅四舍五入 2 位，占流通照原值）

| 币种 | 解锁时间（UTC+8） | 占流通 % | 解锁前 7 天涨跌 | 解锁后涨跌 | 同期相对 BTC（pp） | unlock_source | price_source | note（CSV 原文） |
|---|---|---|---|---|---|---|---|---|
| SOSO | 2026-09-24 17:00 | 5.97 | +10.85% | -4.55% | -4.83 | PANews/Tokenomist | CoinGecko | — |
| H | 2026-09-25 08:00 | 7.34 | -25.56% | +5.36% | +5.97 | PANews/Tokenomist | CoinGecko | DefiLlama记为9/23 21:15，日期有出入 |
| BIGTIME | 2026-09-25 08:00 | 13.34 | +16.16% | +6.30% | +6.91 | PANews/Tokenomist | Binance | — |
| XPL | 2026-09-25 20:00 | 63.2 | +26.06% | -12.78% | -11.97 | PANews/Tokenomist | Binance | 另有9/28 12:00约2972万枚月度释放(RootData) |
| ALT | 2026-09-26 07:29 | 3.27 | +13.82% | -3.22% | -3.00 | DefiLlama | Binance | 仅DefiLlama数据 |
| STBL | 2026-09-26 18:00 | 4.42 | +6.56% | -7.95% | -7.80 | PANews/Tokenomist | CoinGecko | — |
| GRASS | 2026-09-28 03:19 | 2.93 | +76.01% | +11.47% | +12.56 | DefiLlama | CoinGecko | 仅DefiLlama数据；9/28 03:19-09:23分三笔 |
| FF | 2026-09-29 21:00 | 2.51 | -6.95% | +8.05% | +8.57 | PANews/Tokenomist | Binance | DefiLlama数量/时间与Tokenomist不一致 |
| ZORA | 2026-09-30 00:17 | 2.94 | -9.58% | +1.22% | +0.22 | DefiLlama | CoinGecko | 仅DefiLlama数据 |
| CARDS | 2026-09-30 03:00 | 10.62 | +28.04% | -11.19% | -11.50 | PANews/Tokenomist | CoinGecko | Foresight/BeInCrypto写9/29(UTC) |
| GUN | 2026-09-30 09:23 | 6.56 | -6.09% | +2.73% | +2.20 | DefiLlama | Binance | 仅DefiLlama数据 |
| KMNO | 2026-09-30 20:00 | 2.81 | +16.35% | +3.26% | +3.28 | PANews/Tokenomist | Binance | —（change_24h_after_pct 为空） |
| SUI | 2026-10-01 08:00 | 0.32 | +21.27% | +0.68% | +0.35 | PANews/Tokenomist | Binance | 解锁至今仅约5小时 |
| EIGEN | 2026-10-01 12:00 | 5.19 | +5.84% | -0.12% | -0.29 | PANews/Tokenomist | Binance | 解锁至今不足1小时 |

### 0.4 只数个数的观察（不做平均、中位数等派生统计）
- 解锁后：正 8（H、BIGTIME、GRASS、FF、ZORA、GUN、KMNO、SUI），负 6（SOSO、XPL、STBL、ALT、CARDS、EIGEN），无 0；最高 GRASS +11.47%，最低 XPL -12.78%。
- 同期相对 BTC：正 8、负 6，名单与解锁后涨跌的正负名单相同。
- 解锁前 7 天：正 10，负 4（H、FF、ZORA、GUN）；最高 GRASS +76.01%，最低 H -25.56%。
- 占流通 ≥5%（categories.md calendar.unlock「占流通≥5% 必须点明」）：7 个（SOSO 5.97、H 7.34、BIGTIME 13.34、XPL 63.2、CARDS 10.62、GUN 6.56、EIGEN 5.19）；解锁后正 3（H、BIGTIME、GUN）、负 4（SOSO、XPL、CARDS、EIGEN）。
- 刻意没写：平均数、中位数、「前 7 天涨的币解锁后多跌」这类交叉统计（会被读成规律，且属推算）。

### 0.5 与 C-20261004-01 的重叠检查
- C-20261004-01 是前瞻稿：ENA（10/5）、HYPE（10/6–10/7）、KGEN（10/7），短名单另有 RAIN、LA、ADI，窗口 2026-10-03 22:38 至 10-11 22:38 HKT。
- 本篇 14 个币：SOSO、H、BIGTIME、XPL、ALT、STBL、GRASS、FF、ZORA、CARDS、GUN、KMNO、SUI、EIGEN。**两篇的正文币种没有重合**；本篇窗口 09-24～10-01 与对方窗口不重叠。
- 只有一处顺带提到：C-20261004-01 research 0.3 第 6 条（交易观察员解锁页的数据质量问题）提到 EIGEN 10/1、FF 9/29、SUI 10/1 在解锁页上有重复/疑似重复条目。那是对方 research 里对数据源的记录，不是对外正文。
- 另：PANews 9/27 快讯也列了 ENA 2026-10-02 15:00 约 4063 万枚（在本篇窗口之外，已核表没有这一行，本篇不写）。
- 合并判断见 draft.md 末尾与回报；本篇未合并任何内容。

## 素材

### R-01
- 来源链接：/workspace/trading-watch/unlocks_2026-10-01.csv（快照 sources/unlocks_2026-10-01.snapshot-20261005.csv）
- 摘录：见 0.2、0.3。XPL 行：`XPL,Plasma,2026-09-25 20:00,1760000000.0,158000000.0,195483200,63.2,投资人8.33亿+团队8.33亿+生态0.89亿,PANews/Tokenomist,Binance spot 1h klines (data-api.binance.vision),...,26.05833617069573,-12.784730350229589,...,-11.97293256288221,另有9/28 12:00约2972万枚月度释放(RootData)`
- 可信度：中（MKT-01 已确认来源，是「事件定价」栏目唯一数字来源；本身是二手汇总）
- 用在哪一段：主表、观察 1–3、XPL 一节「Tokenomist 口径」

### R-02
- 来源链接：/workspace/trading-watch/SOURCES.md（快照 sources/trading-watch-SOURCES.snapshot-20261005.md）
- 摘录：「Unlock list: PANews 2026-09-20 https://www.panewslab.com/zh/articles/01a0bea7-77b7-742c-8612-2806cba8b182 ; PANews 2026-09-27 https://www.panews.io/articles/01a0e2d7-22b1-76f5-9456-18803fa3ef69 (both citing Token Unlocks/Tokenomist); Tokenomist digest https://tokenomist.ai/research/weekly-unlock-digest-sep-21-27-2026-xpl-unlocks-63-of-circulating-supply-2 ; DefiLlama https://defillama.com/unlocks (page __NEXT_DATA__, generated 2026-10-01 11:04 UTC+8) ; BeInCrypto https://cn.beincrypto.com/token-unlocks-to-watch-in-september-october/」「Prices: Binance spot 1h klines via https://data-api.binance.vision/api/v3/klines ; CoinGecko https://api.coingecko.com/api/v3/coins/{id}/market_chart?vs_currency=usd&days=16」「Price at unlock = open of the 1h candle containing unlock time (Binance) or last CoinGecko hourly point at/before unlock. Pre-7d = same rule at unlock-168h. Now = latest point (~2026-10-01 12:40 UTC+8). BTC benchmark = Binance BTCUSDT over identical windows.」
- 可信度：中（交易观察员自述口径）
- 用在哪一段：「读表」说明、来源段、brief 必引来源

### R-03
- 来源链接：https://www.panewslab.com/zh/articles/01a0bea7-77b7-742c-8612-2806cba8b182 （datePublished 2026-09-20T12:00:00Z = 2026-09-20 20:00 HKT；2026-10-05 06:0x HKT 打开核对）
- 摘录：「PANews 9月20日消息，Token Unlocks数据显示……Plasma（XPL）将于北京时间9月25日晚上8点解锁约17.6亿枚代币，与流通量的比值约为63.20%，价值约1.58亿美元；Humanity Protocol（H）将于北京时间9月25日上午8点解锁约2.66亿枚代币，与流通量的比值约为7.34%……SoSoValue（SOSO）将于北京时间9月24日下午5点解锁约2346万枚代币……约为5.97%……STBL（STBL）将于北京时间9月26日下午6点解锁约2.10亿枚代币……约为4.42%……Big Time（BIGTIME）将于北京时间9月25日上午8点解锁约3.33亿枚代币……约为13.34%」
- 可信度：中（中文快讯，转载 Token Unlocks/Tokenomist 数据）
- 用在哪一段：XPL 一节「Tokenomist 口径」（20:00、约 17.6 亿枚、63.2%）；来源段

### R-04
- 来源链接：https://www.panewslab.com/zh/articles/01a0e2d7-22b1-76f5-9456-18803fa3ef69 （trading-watch SOURCES.md 记的是英文版 https://www.panews.io/articles/01a0e2d7-22b1-76f5-9456-18803fa3ef69 ；本稿打开核对的是英文版，中文版链接取自 unlock_tracker 的 run_meta / source_urls，未单独打开）
- 摘录（英文版）：「PANews reported on September 27 that, according to Token Unlocks data … Sui (SUI) will unlock about 13.26 million tokens at 8:00 am Beijing time on October 1, representing about 0.32% … Kamino (KMNO) will unlock about 229 million tokens at 8:00 pm Beijing time on September 30, representing about 2.81% … Collector Crypt (CARDS) … 59.26 million tokens at 3:00 am Beijing time on September 30, representing about 10.62% … EigenCloud (EIGEN) … 36.82 million tokens at 12:00 pm Beijing time on October 1, representing about 5.19% … Falcon Finance (FF) … 77.14 million tokens at 9:00 pm Beijing time on September 29, representing about 2.51%」
- 可信度：中（同 R-03）
- 用在哪一段：来源段（FF、CARDS、KMNO、SUI、EIGEN 五行的 unlock_source）

### R-05
- 来源链接：https://tokenomist.ai/research/weekly-unlock-digest-sep-21-27-2026-xpl-unlocks-63-of-circulating-supply-2 （页面日期 Sep 21, 2026；2026-10-05 06:0x HKT 打开核对）
- 摘录：「Unlock Spotlight: $XPL — Unlock date: September 25, 2026; Unlock amount: $152.88M; Unlock as % of unlocked supply: 63.20%; Vested allocation: Private Investors, Founder/Team, and Community」「a 63.20% increase in circulating supply in a single day, which is also the chart's figure against unlocked supply, because for XPL the two are the same 2.78 billion tokens」「Dollar figures are marked at September 20, 2026.」
- 可信度：高（Tokenomist 自己的周报）；**注意**：周报正文没写钟点（20:00）和枚数（17.6 亿），这两个数来自 PANews 转载（R-03）；美元值周报写 $152.88M，PANews 写约 1.58 亿美元（本篇不用美元值）
- 用在哪一段：XPL 一节「Tokenomist 口径」（63.2%）；来源段

### R-06
- 来源链接：https://defillama.com/unlocks/plasma （数字取自交易观察员 unlock_tracker 输出：output/2026-09-25_2026-10-02/unlocks.csv 与 output/live_default/unlocks.csv，快照 sources/unlock_tracker-2026-09-25_2026-10-02-unlocks.snapshot-20261005.csv；tracker 读的是 https://defillama.com/unlocks 页面 __NEXT_DATA__）
- 摘录：`XPL,Plasma,2026-09-25 13:48,cliff,1894444444,N/A,217633777.8,41.78921569,insiders:902.78M; privateSale:902.78M; ecosystem:88.89M,DefiLlama,1,yes,single_source,DefiLlama@2026-09-25 13:48,DefiLlama=1.89B,https://defillama.com/unlocks/plasma,...`；summary.md：「| XPL | 09-25 13:48 | 1.89B / $217.63M | 41.79% | … | DefiLlama | single_source |」
- 可信度：中（DefiLlama 单一来源，经 tracker 抓取；2026-10-05 06:0x HKT 打开 DefiLlama plasma 页，页面只显示下一次事件「25 Oct 2026 16:17 UTC」和当前流通 4.533b XPL，没有显示 09-25 这笔历史事件，所以 13:48 / 1.89B / 41.79% 没能在页面上直接核到，只核到 tracker 输出）
- 用在哪一段：XPL 一节「DefiLlama 口径」

### R-07
- 来源链接：/workspace/trading-watch/unlock_tracker/output/test_2026-09-24_2026-10-01/（unlocks.csv 快照 sources/unlock_tracker-test_2026-09-24_2026-10-01-unlocks.snapshot-20261005.csv；summary.md；comparison_vs_manual.csv；run_meta.json）
- 摘录：XPL 合并行 `2026-09-25 20:00 … 1760000000,158000000,…,63.2,…,DefiLlama | news:www.panewslab.com,2,no,date_conflict(6h),news:www.panewslab.com@2026-09-25 20:00 | DefiLlama@2026-09-25 13:48,news:www.panewslab.com=1.76B | DefiLlama=1.89B,https://defillama.com/unlocks/plasma | https://www.panewslab.com/zh/articles/01a0bea7-77b7-742c-8612-2806cba8b182`。该测试输出共 18 个事件，比已核表多 WAL（09-26 04:42）、B2（09-28 18:13）、MEGA（09-29 12:25）、MAV（10-01 04:27）4 个；comparison_vs_manual.csv 只列已核表 14 行，均 found。
- 可信度：中（tracker 自动输出，非已核表）
- 用在哪一段：XPL 一节（两种口径同时出现、tracker 标 date_conflict(6h)）；数据问题清单。tracker 的涨跌数字一律不进正文

### R-08
- 来源链接：https://data-api.binance.vision/api/v3/klines ；https://api.coingecko.com/api/v3/coins/{id}/market_chart?vs_currency=usd&days=16 （均取自 R-02；本稿没有重新拉价格）
- 摘录：price_source 列原文「Binance spot 1h klines (data-api.binance.vision)」「CoinGecko market_chart days=16 (hourly)」
- 可信度：高（行情源；本稿只引用已核表结果，不重算）
- 用在哪一段：来源段

## 事实 / 观点 / 未核实 分开

### 事实（有数据源）
- 已核表 09-24 17:00～10-01 12:00 共 14 个解锁，截止 2026-10-01 12:39–12:42 HKT。（R-01）
- 解锁后 8 正 6 负，-12.78%（XPL）到 +11.47%（GRASS）；解锁前 7 天 10 正 4 负，-25.56%（H）到 +76.01%（GRASS）；占流通 ≥5% 的 7 个解锁后 3 正 4 负。（R-01，计数）
- XPL：已核表按 PANews/Tokenomist 记 09-25 20:00、1,760,000,000 枚、占流通 63.2%（R-01、R-03、R-05）；DefiLlama（经 tracker）记 09-25 13:48、1,894,444,444 枚（1.89B）、占流通 41.79%（R-06）；tracker 合并时标 date_conflict(6h)（R-07）。

### 观点 / 编辑判断（只在 draft 正文出现，并与事实分开）
- 「事前事后走势差别很大，单周样本不能当规律用」——编辑结论，依据 0.4 的个数和区间。
- 「采用 Tokenomist 口径」——编辑选择，理由：MKT-01 规定已核表是唯一数字来源，已核表按此口径记 XPL，且表中 XPL 的涨跌以 20:00 为起点；与表内另外 9 个 PANews/Tokenomist 行口径一致。

## 待核实
> 尚无来源或来源存疑的事实放这里，进 draft 时标【待核】。

- [ ] 【待核】XPL 两种口径差异的原因（时刻差约 6 小时、数量 17.6 亿 vs 18.9 亿、占流通 63.2% vs 41.79%）：两家各自的流通量分母和事件定义未核；正文只写「本表没有核对」，不猜原因。
- [ ] 【待核】DefiLlama 09-25 13:48 / 1.89B / 41.79% 只核到 trading-watch tracker 输出，DefiLlama plasma 页面当前不显示这笔历史事件（R-06）。
- [ ] 【待核】PANews 9/27 中文版链接 https://www.panewslab.com/zh/articles/01a0e2d7-22b1-76f5-9456-18803fa3ef69 本稿未单独打开（取自 tracker run_meta；英文版已打开核对）。
- [ ] 【待核】DefiLlama 4 行（ALT、GRASS、ZORA、GUN）的单币页面链接只来自 tracker 输出（如 https://defillama.com/unlocks/altlayer ），正文来源只写总页 https://defillama.com/unlocks 。
- [ ] 【待核】币安广场长文是否允许外链、能否显示表格：未核；如不允许外链，币安广场版把链接改成来源名称。
- [ ] 【待核】已核表为何不收 tracker 测试输出里的 WAL、B2、MEGA、MAV（交易观察员未写原因）；按规则不补样本。
