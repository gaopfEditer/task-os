# 研究笔记（research）

- content_id：C-20261004-01

> 本文件**只放事实与引用**，不写观点、不写成稿。观点写在 brief.md 结论或 draft.md 正文。
> 每条素材固定四行：来源链接、摘录、可信度、用在哪一段。
> 时间统一用 HKT（UTC+8）。带 Z/UTC 的时间已换算；只给日期的按原文写日期，不推算钟点。
> 「占流通」凡未注明出处的，均为本稿自算：解锁数量 ÷ CoinGecko circulating_supply（2026-10-04 22:38:50–22:39:40 HKT 快照，见 R-14）。美元价值 = 数量 × CoinGecko simple/price（last_updated 2026-10-04 22:39:40–22:40:00 HKT）。

## 0. 线索来源与选题过程

### 0.0 数据源与页面「分数」的含义
- 页面：https://gaopfediter.github.io/crypto-news/events.html?type=unlock （交易观察员搭建，curl 于 2026-10-04T22:37 HKT）。
- 数据源：页面 JS 常量 `RAW = "https://raw.githubusercontent.com/gaopfEditer/crypto-news/gh-pages"`，`loadLib()` 同时请求 `./events/unlock.json` 与 `RAW + "/events/unlock.json"`，取 `updated` 较新的一份。实测 gh-pages 的 `./events/unlock.json` 返回 404（GitHub Pages 未发布该路径），实际只靠 raw：https://raw.githubusercontent.com/gaopfEditer/crypto-news/gh-pages/events/unlock.json （200，192,427 字节；`updated` = 1791107353 = 2026-10-04 17:49:13 HKT；79 条事件）。同目录还有 delist.json、perp_listing.json、burn.json。
- **页面没有「分数」字段**。unlock.json 每条只有 event_ts、status（scheduled/occurred/空）、is_future 和 fields（ticker、unlock_time_utc8、amount/unlock_amount、value_usd_at_unlock/computed_value_usd、pct_circ、recipients、unlock_type、sources、flags、price_* 及事后表现字段）。页面默认按事件时间排序；唯一可点的指标列是「相对BTC」（relative_vs_btc_post_pp = 解锁后涨跌 − 同期 BTC 涨跌，单位 pp），对未来事件为空；顶部「相对BTC偏弱/偏强」观察条也只用这个字段。flags 只是质量标记（single_source、date_conflict(Xh)、amount_conflict、short_post_window(Xh)、scheduled）。
- 因此本稿用的「高分」= 替代排序：① 占流通比例（pct_circ，或用 CoinGecko 流通量重算）② 美元价值 ③ 是否 cliff、接收方是否为投资人/团队；另参考交易观察员主看板 data.json 的 score（只有一条解锁新闻上了 hit：PANews「HYPE、ENA 等代币下周将迎来大额解锁」9.0 分，见 R-02）。最后按 filter.md 五维重新打分。
- 窗口：event_ts 在 2026-10-03 22:38 至 2026-10-11 22:38 HKT（过去 24h + 未来 7 天，对应页面「未来7天」按钮）。窗口内页面共 19 条（1 条已发生 LA + 18 条 scheduled）。
- filter.md 时效维度对「日历事件」的解释：事件在 24–72h 内发生记 1（本周事件均满足）；watchlist.md / thesis.md 未提供，按通用主线（BTC/ETH、稳定币、监管、安全）计相关性；交易观察员看板配置的关注代币为 BTC、ETH、SOL、NEAR、HYPE、PUMP、SUI（data.json meta.tokens），仅作参考，未当作用户 watchlist。

### 0.1 候选短名单（合并同币后前 5 + 1 备注；按 filter.md 打分，满分 8）

| # | 代币 | 解锁时间 HKT | 数量 | 占流通 | 美元价值（价格时间/来源） | 接收方 / 类型 | 页面数据 vs 核对 | 相关 | 冲击 | 可信 | 时效 | 可证伪 | 总分 | 主小类 / 副小类 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | ENA | 10/5（钟点各家不一：CMC/页面 08:00；Tokenomist、PANews 15:00；RootData 00:00）【待核】 | 页面 171,875,000（页面值 $40.84M）；官方宣布剩余投资人一次性加速解锁，Tokenomist 测算投资人 ≈1,406,250,000 + 团队 93,750,000 ≈ 1,500,000,000【官方未给枚数，待核】 | 页面 1.70%；按 1.5B 计 14.86%（投资人部分 13.93%） | 按 1.5B 计 ≈ $354.4M；页面 171.875M ≈ $40.6M（$0.236296，CoinGecko 10/4 22:40 HKT） | 投资人（一部分已被基金会回购，数量未披露）+ 团队；投资人部分为一次性 cliff，团队为月度 tranche | **页面严重低估**：只列常规月度额 | 1 | 2 | 2 | 1 | 1 | **7** | calendar.unlock / fundamental.tokenomics、fundamental.unlock |
| 2 | HYPE | Tokenomist：10/6 08:00；Labs 口径：10/7 分给团队 | Tokenomist 9,916,666；联创称 3,750,000（OTC）；DefiLlama 链上：9/6 实发 433,419 | 4.46%（9.92M）/ 1.69%（3.75M） | ≈ $891.7M / ≈ $337.2M（$89.92，CoinGecko 10/4 22:39:40 HKT） | 核心贡献者（团队）；Tokenomist 该币释放类型标 cliff；Labs 称以 OTC 卖给一家机构 | **页面无 HYPE 这一行**（主看板却给 PANews 的 HYPE 解锁新闻 9.0 分） | 1 | 1 | 2 | 1 | 1 | **6** | calendar.unlock / onchain.whale、fundamental.unlock |
| 3 | RAIN | 10/10 20:00（仅 CMC） | 24,754,313,730（仅 CMC） | 页面 3.49% | 页面 $317.4M；按 $0.01207892（CoinGecko 10/4 22:40 HKT）≈ $299.0M | 页面列：贡献者/顾问/伙伴 67.6 亿、营销与发展基金 128.5 亿、团队 47.9 亿、私募 3.45 亿；cliff/linear | **核不到**：DefiLlama 无 upcoming（只追踪 Sablier 领取）；Tokenomist 页称「Rain is fully unlocked」（数据版本 v1，2025-12-11 更新）；CryptoRank 的 rain 页是另一家同名经纪商 | 0 | 1 | 0 | 1 | 0 | **2** | calendar.unlock |
| 4 | KGEN | 10/7 17:00（钟点仅 CMC）【待核】 | 38,040,000（团队与顾问 22,000,000 + 早期购买者 16,040,000，CMC）；官方表 Y1 列 1.6%+2.2%×10 亿 = 3,800 万，基本一致 | 页面 17.12%；按 CoinGecko 流通 198,677,778 算 19.15% | ≈ $6.11M（$0.160586，CoinGecko 10/4 22:40 HKT） | 团队与顾问 + 早期购买者（投资人）；cliff（TGE 满 1 年） | Tokenomist、DefiLlama 均 404 未收录；CryptoRank vesting 需登录 | 0 | 1 | 1 | 1 | 1 | **4** | calendar.unlock / fundamental.unlock |
| 5 | LA (Lagrange) | 10/4 08:00（已发生，距抓取约 14.6h） | 页面 31,796,185.88（CMC）；CryptoRank 29,030,769 | 页面 16.47%；CryptoRank 15.04% | ≈ $2.13M / $1.94M（$0.066837，CoinGecko 10/4 22:40 HKT） | 团队、投资人、社区生态、基金会；页面标 linear | **数量两家不一致**（差 2,765,417 枚） | 0 | 1 | 1 | 1 | 1 | **4** | calendar.unlock |
| 备注 | ADI | 10/9 20:00 | 6,992,669.746 | 页面 74.12% | 页面 $56.6M | 社区基金 4.79M + 储备 2.20M（非投资人/团队） | 仅 CMC 单一来源，未在 Tokenomist/DefiLlama/CryptoRank 核到 | 0 | 1 | 0 | 1 | 0 | **2** | calendar.unlock |

窗口内其余页面条目（均 CMC 或 DefiLlama 单一来源、占流通 <5% 或金额 <$5M，未进短名单）：CC 10/5（0.35%）、POWER 10/6（10.28%，$1.82M，投资人 11.76M）、UAI 10/6（4.96%）、BERA 10/6（3.95%）、JTO 10/7（2.14%）、DJED 10/8（232.75%，见 0.4）、BFT 10/8（占流通为空）、STABLE 10/8（3.42%）、OPEN 10/8（5.78%，$2.28M）、ALLO 10/10（6.03%，$3.22M）、CARV 10/10（6.66%，date_conflict/amount_conflict）、DOS 10/10（7.29%，$3.12M，主要为空投）、RYO 10/11（占流通为空）、HOLO 10/11（4.34%）。

### 0.2 为什么选 ENA、HYPE、KGEN（2–3 条最强）
1. **ENA（7 分，主推）**：窗口内占流通比例最大的主流币解锁（按 Tokenomist 测算约 14.9%），接收方是投资人、一次性 cliff；一手来源齐全（Ethena 官方博客 + SEC 8-K）；且页面和多数日历只写了 1.72 亿枚，有纠错增量。
2. **HYPE（6 分，备选里最高）**：美元价值最大（两种口径 3.37 亿–8.92 亿美元），接收方是团队；页面整条缺失，PANews 快讯把 Tokenomist 的时刻和 Labs 的数量拼在一起，有澄清价值。按 filter.md 6 分属「留 inbox 备选」，是否发由用户定。
3. **KGEN（4 分，默认不发）**：唯一「占流通 ≥5% + cliff + 接收方为团队和投资人」的组合，按 categories.md calendar.unlock「占流通≥5% 必须点明」写成备选稿；但金额仅约 611 万美元、Tokenomist/DefiLlama 未收录，filter 只有 4 分，建议只在用户需要「小币解锁」内容时发。
4. 未选 RAIN：美元价值虽大（约 3 亿美元），但只有 CMC 一家，Tokenomist、DefiLlama 的数据与之矛盾，按规则不能当事实用。未选 LA：已发生、金额约 200 万美元、两家数量不一致。

### 0.3 交易观察员解锁页的数据质量问题（供反馈给交易观察员）
1. **没有分数字段**：「高分」无从排序；页面唯一可排序指标「相对BTC」对未来事件为空。
2. **漏收 HYPE**：unlock.json 79 条里没有 HYPE；同一作者的主看板 data.json 却给「HYPE、ENA 等代币下周将迎来大额解锁」9.0 分（hit）。PANews 同文提到的 BABY（10/10）、MOVE（10/9）也不在页面里。
3. **ENA 数量严重低估**：10/5 只列 CMC 的 171,875,000（团队 93.75M + 投资人 78.125M 月度额），未反映 Ethena 2026-08-27 宣布的「剩余投资人代币 10/5 一次性加速解锁」（Tokenomist 测算 ≈14.06 亿枚投资人 + 0.94 亿团队）。同条 flags 标 single_source，但 Tokenomist、PANews、RootData 均有数据且时刻不同（00:00 / 08:00 / 15:00 HKT），应标 date_conflict。
4. **KGEN 占流通口径**：页面 17.12%（隐含流通约 2.22 亿，CMC 口径）；CoinGecko 流通 198,677,778 → 19.15%。
5. **LA 数量冲突未标**：页面 31.80M / 16.47%（CMC），CryptoRank 29.03M / 15.04%，flags 只写 single_source。
6. **重复/疑似重复条目**：OPN 10/2 08:00 两条完全相同的数量与占流通（一条 status 空、一条 occurred）；STO 10/3 04:42 与 08:00 两条数量几乎相同（21.35M）但占流通一条 4.89%、一条 9.48%；EIGEN 10/1 10:46（DefiLlama，4.09%）与 12:00（PANews/Tokenomist，5.19%）同一笔；FF 9/29 两条数量不同（203.06M vs 77.14M）；SUI 10/1 00:02、10/1 08:00、10/2 03:19 三条（6.07M / 13.26M / 14.72M），疑为同一月度解锁的不同来源口径。
7. **DJED 占流通 232.75%/233.8%**：分母异常（DJED 为稳定币，标 deflationary），明显错误。
8. **字段 schema 不统一**：14 条旧格式（unlock_amount / computed_value_usd / unlock_source，status 为空），65 条新格式（amount / value_usd_at_unlock / sources）；BFT、RYO、KULA 的 pct_circ 为空。
9. **RAIN 3.17 亿美元单一来源**：仅 CMC；DefiLlama、Tokenomist 的数据与之矛盾，建议加 conflict 标记或人工复核。
10. **价格时间**：页面 price_now_time_utc8 为 2026-10-04 17:00/17:37，比本稿 CoinGecko 快照早约 5.5 小时；页面美元值与本稿可能略有出入。

## 素材

### R-01
- 来源链接：https://gaopfediter.github.io/crypto-news/events.html?type=unlock ；数据 https://raw.githubusercontent.com/gaopfEditer/crypto-news/gh-pages/events/unlock.json （快照存档 sources/events-unlock.json.snapshot-20261004T2238.json）
- 摘录：页面 JS：`const RAW = "https://raw.githubusercontent.com/gaopfEditer/crypto-news/gh-pages"`；`unlock: { label: "解锁", file: "unlock.json", ... cols: ticker、unlock_time_utc8、unlock_amount(alt amount)、computed_value_usd(alt value_usd_at_unlock)、pct_circ、pre7d_change_pct、post_unlock_change_pct、btc_post_change_pct、relative_vs_btc_post_pp(sort:1)、unlock_source(alt sources)、flags }`。unlock.json `updated` 1791107353（2026-10-04 17:49:13 HKT）。ENA 条：`"unlock_time_utc8": "2026-10-05 08:00", "amount": 171875000.0, "pct_circ": 1.702522829, "recipients": "Team/Advisors/Contractors:93.75M; Private Sale investor:78.12M", "sources": "CoinMarketCap", "flags": "single_source; scheduled"`。KGEN 条：`"2026-10-07 17:00", "unlock_type": "cliff", "amount": 38040000.0, "pct_circ": 17.12264758, "value_usd_at_unlock": 6148278.555, "recipients": "Team & Advisors:22.00M; Purchasers:16.04M", "sources": "CoinMarketCap"`。
- 可信度：中（交易观察员聚合页，本身是二手数据；用于线索与对照）
- 用在哪一段：短名单 0.1；数据质量 0.3；ENA 跟帖 2/（「日历上的 1.72 亿」）；KGEN 主帖第 2 行与跟帖 2/（17.1%）

### R-02
- 来源链接：https://raw.githubusercontent.com/gaopfEditer/crypto-news/gh-pages/data.json （updated_utc8 2026-10-04 22:29:26）
- 摘录：story「数据：HYPE、ENA等代币下周将迎来大额解锁，其中HYPE解锁价值约3.39亿美元」，time_utc8 2026-10-04 20:00，score 9.0，level hit，reasons「关注代币 HYPE(代码+上下文)+4」「事件 解锁(5,标题)」，url 见 R-07。另有「疑似Ethena团队钱包从CEX提取价值超6800万美元ENA」（PANews 10-04 17:43、Odaily 10-04 17:47），看板分 0.0。
- 可信度：中（看板打分规则见 C-20261003-01 research 0）
- 用在哪一段：0.0 分数说明；0.3 第 2 条（漏收 HYPE）。「疑似 Ethena 团队钱包提取 ENA」属链上推测，不进正文

### R-03
- 来源链接：https://ethena.fi/blog/ethena-ecosystem-update （ethena.fi 前端为客户端渲染，正文取自同文 Ghost 源 https://ethena.ghost.io/ethena-ecosystem-update/ ；存档 sources/Ethena-Ecosystem-Update-2026-08-27.txt）；article:published_time 2026-08-27T14:02:38Z = 2026-08-27 22:02 HKT
- 摘录：「The Ethena Foundation has acquired all of the locked tokens in OTC transactions over the last two weeks from certain investors who were originally allocated >0.25% of the total token supply.」「The foundation purchased all unvested tokens from the investors in group i), other than 0x6e0a…8D74, which declined to sell」「2. Tokenomics following the transaction — All numbers to be updated — As noted above, effective 5 October 2026, all remaining original investor unlocks have been accelerated such that no investor tokens are subject to lockup … Team tokens remain fully subject to their original lockup and vesting schedules」「the ~12% of locked unvested tokens post-transaction relate only to team, ecosystem and foundation holdings」「StablecoinX is one of the top two largest holders of ENA at approximately 20% of total supply」
- 可信度：高（项目官方）；但官方**未给最终解锁枚数**，且注明「All numbers to be updated」
- 用在哪一段：ENA 主帖第 1–2 行、「为何关注」（投资人、部分已归基金会）；跟帖 2/（最终枚数未公布）、3/（约占总量 20%）

### R-04
- 来源链接：https://tokenomist.ai/research/ethena-bought-out-its-sellers-and-deleted-the-investor-unlock-calendar-the-buyback-replacing-it-arms-at-7-5b-usde （2026-09-01，09-02 更新；存档 sources/Tokenomist-research-Ethena-2026-09-01.txt）
- 摘录：「investors received 78,125,000 ENA and core contributors 93,750,000 on the 5th of every month, with the Foundation's 40,625,000 landing on the 2nd」「That single event becomes roughly 1,406,250,000 ENA … The same day also carries the team's routine 93.75M tranche, taking the day's total to exactly 1.5B ENA.」「Ethena itself never states the final unlock's size. The 1.41B figure is arithmetic on the tracked schedule」「Some of it now unlocks to the Foundation itself … How much of the 1.41B that covers is not disclosed.」方法表：「Final unlock, 1,406,250,000 ENA — schedule arithmetic — the September 5 tranche releases as normal; if it does not, the figure is 1,484,375,000」
- 可信度：高（用户收藏的解锁数据源 Tokenomist；数字是其按排期推算，非官方枚数）
- 用在哪一段：ENA 主帖第 3 行（≈15 亿、投资人约 14.06 亿）；跟帖 2/（1.72 亿 = 9375 万 + 7812.5 万；14.06 亿为推算；部分解锁给基金会）

### R-05
- 来源链接：https://www.sec.gov/Archives/edgar/data/2080215/000121390026100751/ea0305686-8k_stablecoinx.htm （存档 sources/StablecoinX-8K-2026-09-17.htm）
- 摘录：「On September 14, 2026, StablecoinX Inc. … entered into a Waiver Letter … with Ethena OpCo Ltd. … and the Ethena Foundation … the Ethena Parties agreed, effective as of October 5, 2026 …, to permanently waive, release and terminate all lock-up, vesting and unlocking restrictions … applicable to the ENA tokens held by, or deliverable to, the Company」「The Waiver Effective Date aligns with the lock-up release date that the Foundation already announced for other ENA token holders.」「To effect a Funding Sale, the Company must provide the Foundation with not less than five (5) business days' prior written notice, during which the Foundation may elect to acquire all or any portion of the ENA at the proposed price」「any sale, transfer or other disposition of ENA by the Company will continue to require the prior written consent (which shall not be unreasonably withheld) of the Foundation」；签署日 2026-09-17。8-K 未写持仓枚数。
- 可信度：高（SEC 申报原文）
- 用在哪一段：ENA 跟帖 3/

### R-06
- 来源链接：https://tokenomist.ai/ethena （JSON-LD 存档 sources/tokenomist-jsonld-hype-ena-20261004.json）
- 摘录：「Next Unlock Date = 2026-10-05T07:00:00Z」（= 10/5 15:00 HKT）「Next Unlock Amount = 171875000 ENA」「Next Unlock Value (USD) = 40576938」「Next Unlock Allocation = Foundation」「Next Unlock Circulating Supply Impact = 1.88 percent」「Circulating Supply Released = 9151562500」；description「Tokenomics version 0, last updated June 11, 2025」；页面 FAQ 却写「Released to Core Contributors」「approximately 10,095,312,500 Ethena … has been unlocked」。
- 可信度：中（代币页结构化数据为旧版本 2025-06-11，未反映 8/27 的加速解锁；接收方标签自相矛盾）
- 用在哪一段：ENA 跟帖 2/（Tokenomist 15:00）；0.3 第 3 条

### R-07
- 来源链接：https://www.panewslab.com/zh/articles/01a106c8-afc6-7152-88f3-0eb7eb7da494 （datePublished 2026-10-04T12:00:00Z = 20:00 HKT）
- 摘录：「Hyperliquid（HYPE）将于北京时间10月6日上午8时解锁约375万枚代币，与流通量的比值约为1.69%，价值约3.39亿美元；Ethena（ENA）将于北京时间10月5日下午3时解锁约1.72亿枚代币，与流通量的比值约为1.88%，价值约4100万美元；Babylon（BABY）将于北京时间10月10日上午8时解锁约1.36亿枚……约4.60%，价值约180万美元；Movement（MOVE）将于北京时间10月9日晚上8时解锁约1.65亿枚……约3.8%，价值约170万美元」
- 可信度：中（中文快讯，未注明数据源；HYPE 一句把 Tokenomist 的时刻与 Labs 的数量拼在一起）
- 用在哪一段：ENA 跟帖 2/（PANews 15:00）；brief 参考竞品；0.3 第 2 条

### R-08
- 来源链接：https://www.chaincatcher.com/en/article/2292606 （datePublished 2026-09-28T03:00:03Z = 11:00 HKT）
- 摘录：「According to the token unlocking data from … RootData, Ethena (ENA) will unlock approximately 171.88 million tokens at 0:00 Beijing time on October 5, with a value of about 46.9 million USD.」
- 可信度：中（转述 RootData）
- 用在哪一段：ENA 跟帖 2/（RootData 00:00）

### R-09
- 来源链接：https://tokenomist.ai/hyperliquid （JSON-LD 存档同 R-06 文件）
- 摘录：「Next Unlock Date = 2026-10-06T00:00:00Z」（= 10/6 08:00 HKT）「Next Unlock Amount = 9916666 HYPE」「Next Unlock Value (USD) = 893392440」「Next Unlock Allocation = Core Contributors」「Next Unlock Circulating Supply Impact = 2.09 percent」「Circulating Supply Released = 474827814」「Vesting Type = cliff（Primary vesting mechanism for Hyperliquid，指该币整体，非单指本次）」；dateModified 2025-12-29，description「Tokenomics version 0, last updated December 29, 2025」；FAQ「The circulating supply of Hyperliquid is 222,445,714 tokens」「Core Contributors at 23.80%」「Released to Core Contributors」。
- 可信度：中（排期推算；分母 474.8M 与 FAQ 的 222.4M 不一致，本稿占流通改用 CoinGecko 222,445,714 自算 4.46%）
- 用在哪一段：HYPE 主帖第 2 行；跟帖 2/

### R-10
- 来源链接：Foresight News 快讯 id 114377（REG-01 公开接口 https://api.foresightnews.pro/v1/dayNews?date=20260930 ，published 2026-09-30 23:34 HKT，is_important=true）；其 source_link：https://discord.com/channels/1029781241702129716/1030197017655394447/1554875254864609311
- 摘录：「Hyperliquid Labs 今日将解除质押 375 万枚 HYPE，并通过场外交易出售给机构」「Hyperliquid 联合创始人 iliensinc 在官方 Discord 频道表示，Hyperliquid Labs 将于今日解除 375 万枚 HYPE 的质押，并于 10 月 7 日分配给团队成员。这批代币属于与一家机构进行的场外交易的一部分，不会在公开市场出售。」
- 可信度：中（已确认来源转述项目联创表态；Discord 原文需登录，未打开核对）
- 用在哪一段：HYPE 主帖第 3 行；跟帖 2/

### R-11
- 来源链接：Foresight News 快讯 id 114380（published 2026-10-01 09:04 HKT）；原帖 https://x.com/EmberCN/status/2105455413076635700
- 摘录：「据余烬监测，Hyperliquid 开发团队 HyperLabs 地址于 8 小时前从质押中申请赎回 375 万枚 HYPE（价值约 3.38 亿美元）。这笔 HYPE 将在 7 天后（10 月 7 日晚上）提取到账，根据此前该团队每月一次的解质押记录，这些 HYPE 会在到账后转给机构交易平台 / 做市商 Flowdesk 进行 OTC 交易。」
- 可信度：中（链上分析人士监测，经 REG-01 转述；Flowdesk 一句为其推测）
- 用在哪一段：HYPE 跟帖 2/（已申请解质押、约 10/7 晚到账）；Flowdesk 推测不进正文

### R-12
- 来源链接：https://cryptobriefing.com/hyperliquid-labs-to-sell-375m-hype-tokens-in-private-deal-on-oct-7/ （datePublished 2026-09-30T17:59:14Z = 10-01 01:59 HKT）
- 摘录：「Hyperliquid Labs has announced a significant token transaction involving the unstaking and private sale of 3.75 million HYPE tokens. This amount is notably 8.65 times larger than the September 6 unlock. According to Hyperliquid's co-founder Iliensinc, the tokens are intended for a private over-the-counter deal with an institution … The transaction is set to take place on October 7」
- 可信度：中（英文媒体，第二个独立转述；「8.65 倍」与 R-13 的 433,419 吻合：3,750,000 ÷ 433,419 ≈ 8.65）
- 用在哪一段：佐证 HYPE 主帖第 3 行与「9/6 实发约 43 万枚」

### R-13
- 来源链接：https://defillama.com/unlocks/hyperliquid （数据 https://defillama-datasets.llama.fi/emissions/hyperliquid ，存档 sources/defillama-hyperliquid-events-20261004.json；付费 API api.llama.fi/emissions 返回 402 未用）
- 摘录：Core Contributors 链上记录（「The Core Contributors allocation tracks HYPE tokens transferred from the HyperLabs address to contributors」）：2025-11-29 1,225,342；2026-01-06 1,125,766；02-06 140,333；03-07 173,217；04-06 333,335；05-06 421,879；06-06 331,757；06-07 201,995；07-07 452,000；08-06 433,024；**09-06 433,419**（均为 08:00 HKT 记账）。页面 `noUpcomingEvent`/`upcomingEvent: []`（不做未来排期）。
- 可信度：高（链上转账追踪；只反映已发生的分发）
- 用在哪一段：HYPE 主帖「为何关注」（9/6 实发约 43 万枚）

### R-14
- 来源链接：https://api.coingecko.com/api/v3/simple/price?ids=hyperliquid,ethena,kgen,lagrange,rain,adi-token&vs_currencies=usd&include_market_cap=true&include_last_updated_at=true ；https://api.coingecko.com/api/v3/coins/{id}（存档 sources/coingecko-simple-price-20261004T2240.json、coingecko-coins-circ-20261004T2239.json）
- 摘录：价格（last_updated）：HYPE $89.92（22:39:40 HKT）；ENA $0.236296、KGEN $0.160586、LA $0.066837、RAIN $0.01207892、ADI $8.07（均 22:40:00 HKT）。流通量（last_updated 22:38:50–22:39:40 HKT）：HYPE 222,445,714.07；ENA 10,095,312,500；KGEN 198,677,778；LA 193,000,000。
- 可信度：高（用户收藏的行情源；价格为单一时点快照）
- 用在哪一段：三条主帖的美元值与占流通；配图

### R-15
- 来源链接：https://kgen.gitbook.io/kgen/kgen-whitepaper/kgen-whitepaper/tokenomics （Markdown 版 .md 存档 sources/KGEN-whitepaper-tokenomics.md；排放表图片存档 sources/KGEN-official-emission-table.jpg，图片文件名 photo_2026-09-03）
- 摘录：「$KGEN token emission is backloaded as investor and team vesting is spread over four years with 10% unlocked after Y1, 20% after Y2, 30% after Y3 and 40% after Y4.」排放表：Early Purchasers 总 16.0%，TGE 0.0%，Y1 1.6%；Team & Advisors 总 22.0%，TGE 0.0%，Y1 2.2%；Community 40.0%（TGE 15.4%，Y1 4.1%）；Treasury 22.0%（TGE 4.5%，Y1 1.0%）。
- 可信度：高（项目官方文档）；文档未写具体日期和钟点
- 用在哪一段：KGEN 主帖「为何关注」；跟帖 2/（Y1：1.6% + 2.2%）

### R-16
- 来源链接：https://cryptorank.io/price/kgen/vesting 、https://cryptorank.io/price/hyperliquid/vesting （__NEXT_DATA__；cryptorank.io/token-unlock 被 Cloudflare 拦，403）
- 摘录：KGEN `vesting.total_start_date / tge_start_date = 2025-10-07`，`links` 指向 https://kgenfoundation.gitbook.io/docs.kgenfoundation.com/tokenomics/usdkgen/usdkgen-allocation-and-unlock-schedule （未打开），`isAuthProtected: true`（分配明细需登录）。页面附带的 upcoming 列表：LA「2026-10-04，nextUnlockPercent 15.04，Foundation 5,384,450 / Investors 7,416,000 / Contributors 10,156,000 / Community & Ecosystem 6,074,319（合计 29,030,769）」。
- 可信度：中（用户收藏的解锁源；KGEN 只核到 TGE 日期）
- 用在哪一段：KGEN「TGE 满一年」；LA 数量冲突（0.1、0.3）

### R-17
- 来源链接：https://defillama.com/unlocks/rain ；https://tokenomist.ai/rain ；https://cryptorank.io/price/rain
- 摘录：DefiLlama：`noUpcomingEvent: true`，notes「Vested allocations are tracked as claims (WithdrawFromLockupStream) from Sablier Lockup streams」「Reserve & Treasury has no on-chain vesting contract yet, it is marked TBD」。Tokenomist：「Version 1 Updated: 11 Dec 2025」「Rain is fully unlocked」「approximately 709,252,079,916 Rain which is 61.67% … has been unlocked」。CryptoRank rain 页描述为「<strong>Rain </strong>is a cryptocurrency brokerage that allows you to buy, sell, swap …」（另一家同名公司）。
- 可信度：中（三家均无法支持页面的 10/10 247.5 亿枚）
- 用在哪一段：0.1 RAIN 不入选理由；0.3 第 9 条

### R-18
- 来源链接：https://www.tokenpost.com/news/business/24933 （Published Sep 28, 2026, 10:03 AM EDT = 9/28 22:03 HKT）
- 摘录：「… single release on Oct. 5, 2026, ending the investor schedule about 17 months earlier than planned.」「… 78.125 million ENA to be released each month through March 2028.」「A holding address identified as StablecoinX contains about 3.03 billion ENA, or roughly 20% of total supply.」
- 可信度：中（媒体；3.03B 未在 8-K 中出现）
- 用在哪一段：佐证 R-03/R-04；3.03B 不进正文（正文只用官方「约占总量 20%」）

## 事实 / 观点 / 未核实 分开

### 事实（有一手或数据源）
- Ethena 基金会 2026-08-27 宣布：自 2026-10-05 起剩余原始投资人解锁全部加速，此后无投资人代币锁仓；团队代币仍按原计划；基金会已通过 OTC 收购部分卖过币的大投资人的全部未归属代币（一个钱包拒绝）。（R-03）
- 官方未公布 10/5 最终解锁枚数；Tokenomist 按原排期推算投资人 ≈1,406,250,000 枚、当日连同团队 93,750,000 共 ≈1,500,000,000 枚。（R-03、R-04）
- StablecoinX 所持 ENA 的锁仓限制自 2026-10-05 起永久解除，但出售须基金会书面同意，Funding Sale 须提前 5 个工作日通知、基金会可按拟定价格收购。（R-05）
- 按 CoinGecko 2026-10-04 22:39–22:40 HKT 快照：1.5B ENA ≈ $354.4M、占流通 14.86%；HYPE 9,916,666 ≈ $891.7M / 4.46%，3,750,000 ≈ $337.2M / 1.69%；KGEN 38,040,000 ≈ $6.11M / 19.15%。（R-14，本稿自算）
- Tokenomist 排期：HYPE 10/6 08:00 HKT 核心贡献者 9,916,666 枚（cliff）。（R-09）
- DefiLlama 链上记录：HyperLabs 向贡献者的分发 2026-09-06 为 433,419 HYPE。（R-13）
- KGeN 官方：投资人与团队 4 年后置释放，Y1 后解锁 10%；排放表 Y1 早期购买者 1.6%、团队与顾问 2.2%（占总量）。（R-15）

### 观点 / 转述（只能以「某人称」出现）
- iliensinc（Hyperliquid 联创）在 Discord 称：375 万枚 HYPE 10/7 分配给团队，属与一家机构的 OTC 交易，不在公开市场出售。（R-10、R-12 转述）
- 余烬：解质押的 HYPE 将转给 Flowdesk 做 OTC（推测，不进正文）。（R-11）
- 「两个数对不上」「多个日历只列 1.72 亿」为编辑归纳（依据 R-01、R-06、R-07、R-08、R-09、R-10）。

## 待核实
> 尚无来源或来源存疑的事实放这里，进 draft 时标【待核】。

- [ ] 【待核】ENA 10/5 最终解锁枚数：官方未给，≈14.06 亿（投资人）/≈15 亿（含团队）为 Tokenomist 推算；其中多少归基金会未披露。正文均以「Tokenomist 测算」限定。
- [ ] 【待核】ENA 10/5 具体时刻：CMC/交易观察员页 08:00、Tokenomist/PANews 15:00、RootData 00:00 HKT；官方只写日期。正文只写「10/5 HKT」。
- [ ] 【待核】StablecoinX 持仓枚数（TokenPost 称约 30.3 亿枚，8-K 未写）；正文只用官方「约占总量 20%」。
- [ ] 【待核】HYPE 10 月实际分发量：Tokenomist 9,916,666（排期）vs Labs 3,750,000（联创口径）；两者是否同一事件、是否另有分发未知。Discord 原文未打开。10/7 后以 DefiLlama/链上记录为准。
- [ ] 【待核】HYPE OTC 买方、价格、锁定期：均未披露。
- [ ] 【待核】KGEN 10/7 的钟点 17:00 HKT 仅 CMC 一家；Tokenomist、DefiLlama 未收录；CryptoRank 明细需登录。另有聚合站（Tokentoria，不在收藏夹）称当日连同社区/金库月度释放共约 5,775 万枚，未核，正文不用。
- [ ] 【待核】KGEN 占流通：17.12%（CMC 口径）vs 19.15%（CoinGecko 口径），正文写「约 19%」并在跟帖交代两种口径。
