# 研究笔记（research）

- content_id：C-20261003-01

> 本文件**只放事实与引用**，不写观点、不写成稿。观点写在 brief.md 结论或 draft.md 正文。
> 每条素材固定四行：来源链接、摘录、可信度、用在哪一段。
> 时间统一用 HKT（UTC+8）。美国文件只写日期的，按原文写「美东日期」，不推算成 HKT 具体钟点。

## 0. 线索来源与选题过程

- 数据：交易观察员监控页 data.json（https://raw.githubusercontent.com/gaopfEditer/crypto-news/gh-pages/data.json），重新下载于 2026-10-03T23:28 HKT；updated_utc8 = 2026-10-03 23:20:22；322 条，保留 48h；看板统计 big 16 / hit 12 / low 294；阈值 threshold 7、big_threshold 7。
- 看板「热度」规则（据 data.json 字段与 index.html 前端代码）：score = 关注代币权重（BTC/ETH 2、SOL 3、NEAR/HYPE/PUMP/SUI 4）+ 事件关键词分（漏洞/被盗 10、ETF/监管执法 7、监管动态 5 等，标题命中满分，摘要命中打折）+ 多源确认 +1 + Breaking +1；事件属于 big 类（hack/delist/etf/regulation）且过阈值记「重大 big」，过阈值其余记「命中 hit」，其余「低分 low」。默认按 big > hit > low、再按 score 排序。
- 窗口：取 ts 在 2026-10-02 23:28 至 2026-10-03 23:28 HKT（24h）内的 big/hit 及 ≥6 分条目，同一事件跨来源合并后按 filter.md 重新打分。
- watchlist.md / thesis.md 未提供，按 filter.md 规定以通用主线（BTC/ETH、稳定币、监管、安全）计相关性。

### 0.1 候选短名单（合并后，按 filter.md 打分；满分 8）

| # | 事件（合并） | 看板信号 | 首见 HKT | 相关 | 冲击 | 可信 | 时效 | 可证伪 | 总分 | 主小类 / 副小类 | 一手来源 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | SEC 批准 Cboe BZX 上市 6 只 3 倍杠杆 ETP（含 BTC、ETH） | 两条 big：11.5（Odaily+PANews）、11.1（Odaily，误并入一条 Canary Pepe ETF 快讯） | 10-03 05:57 | 2 | 2 | 2 | 1 | 1 | **8** | policy.etf / exchange.product、metastory.institutional | SEC 批准令 34-106577（已读全文） |
| 2 | ICBA 起诉 OCC，挑战向加密企业发放国家信托银行牌照 | 两条 big：8.5（CoinDesk）、8.45（Odaily+PANews），未合并 | 10-03 05:23 | 2 | 1 | 2 | 1 | 1 | **7** | metastory.institutional / policy.enforcement（无精确小类，就近归类） | ICBA 新闻稿（已读）https://www.icba.org/w/occ-release-oct-2026 ；起诉状 https://www.icba.org/documents/d/asset-library-45247/icba-v-occ-as-filed-complaint-c （仅见搜索摘录，未下载全文） |
| 3 | Arbitrum 安全委员会暂停 Arbitrum One/Nova 新 Stylus 合约激活 | low 6.9（Odaily+PANews） | 10-03 20:04（执行于 10-02 约 23:30） | 1 | 1 | 2 | 1 | 1 | **6** | infra.sequencer / security.hack | Arbitrum 论坛 https://forum.arbitrum.foundation/t/security-council-emergency-action-2-10-2026/31530 ；文档 https://docs.arbitrum.io/notices/stylus-activation-pause-notice.md （均见搜索摘录） |
| 4 | Coinbase Clearing 获 CFTC 衍生品清算组织（DCO）注册 | low 7.2（看板标「多源确认」，但第二条成员是无关的「Coinbase 首席会计官退休」） | 10-03 16:46（Odaily） | 2 | 1 | 2 | **0** | 1 | **6** | policy.cftc / exchange.product | CFTC DCO 名录 https://www.cftc.gov/IndustryOversight/IndustryFilings/ClearingOrganizations （搜索结果显示注册日期为美东 2026-09-28，属旧闻换标题，时效记 0） |
| 5 | Velocity（原 Drift）开放 4 月被盗事件补偿申领，首批兑付约为损失的 1% | 两条 big：12.35（The Block+PANews）、11.35（Odaily），未合并 | 10-03 01:10 | 1 | 1 | 1 | 1 | 1 | **5** | security.hack / narrative.perp_dex | 未追到 Velocity/Drift 官方公告，仅 The Block 转述 https://www.theblock.co/news/ecosystems/2026-10-02-drift-opens-exploit-recovery-claims-initial-payouts-just-over-1-user-losses-417581 |

未进短名单（同窗口内看板 big/hit 条目）：
- 微软官方 X 账号被盗推 meme 币（看板 big 10.6，仅 PANews 转述 Bitcoin.com，单源、冲击 0）：约 3 分，security.phishing。
- 美国 HYPE 现货 ETF 单日净流入 337.09 万美元（hit 9.0）：4 分，留 inbox 级，structure.etf_flow；单只山寨 ETF 小额流入，不改变结构。
- 2 名交易者 PUMP 爆仓 361 万美元（hit 9.0）：≤3，ta.liquidation；单币爆仓。
- 希腊警方捣毁加密诈骗团伙（big 8.0）：3 分，policy.enforcement；本地刑案。
- Bitget PoolX 锁仓 BTC 解锁 CT 空投（hit 7.45）：第一层排除（交易所活动/空投），exchange.airdrop。
- NEAR Intents 被盗 380 万美元及 48 小时归还期限（看板分数最高 16.5/15.45/15.0）：首报 10-01 22:18、最新 10-02 18:02 HKT，均超出 24h 窗口，未计入。

### 0.2 为什么选 #1
1. filter.md 分数最高（8/8），同时落在「监管规则」和「市场结构」两件事上。
2. 可核：SEC 批准令原文已全文读过并存档（sources/SEC-34-106577-order.pdf），关键事实都能对到原文段落；S-1 和 EDGAR 状态也能直接查。
3. 有 ≥2 个独立来源：SEC 原文 + 中文媒体（Odaily、PANews）+ 英文媒体（Crypto Briefing、TokenPost、Coin Edition）。
4. 有增量价值：中文快讯普遍写「依据《1933 年证券法》批准」，与原文（《1934 年证券交易法》第 19(b)(2) 条）不符；也普遍没交代「S-1 未生效、上市日未定」，正好可以用一手文件纠正和补充。
5. #2 ICBA 诉 OCC 分数 7，也可写，但诉讼刚立案、结果和时间都未定，冲击记 1，留作备选。

## 素材

### R-01
- 来源链接：https://www.sec.gov/files/rules/sro/cboebzx/2026/34-106577.pdf （本地存档 sources/SEC-34-106577-order.pdf，下载于 2026-10-03T23:29 HKT）
- 摘录：「[Release No. 34-106577; File No. SR-CboeBZX-2026-065] … Order Granting Approval of a Proposed Rule Change to List and Trade Shares of the 3x Gold ETF, 3x Silver ETF, 3x Bitcoin ETF, 3x Ether ETF, 3x Crude Oil ETF, and 3x Natural Gas ETF, Each a Series of the VS Trust … October 2, 2026.」「On August 10, 2026, Cboe BZX Exchange … filed … pursuant to Section 19(b)(1) of the Securities Exchange Act of 1934」「published for comment in the Federal Register on August 19, 2026 … This order approves the Proposal.」脚注 4：「Securities Exchange Act Release No. 106137 (Aug. 14, 2026) … The Commission has received no comments on the Proposal.」脚注 5：「Although each Fund has "ETF" in its name, the Funds are Commodity-Based Trust Shares and therefore ETPs.」
- 可信度：高（监管原文）
- 用在哪一段：主帖第 1–2 行（6 只、含 BTC/ETH、批准令编号、美东 10/2 签发）；跟帖 2/、3/（时间线、零评论、名称含 ETF 但属 ETP）

### R-02
- 来源链接：同 R-01（第 2 页、脚注 7、脚注 18、第 9 页）
- 摘录：「each Fund seeks daily investment results, before fees and expenses, that correspond to three times (3x) the daily performance of … bitcoin, ether … as measured by the daily changes in the price of a specified portfolio of first- and second-month futures contracts」；脚注 7：「The sponsor of the Trust is Volatility Shares LLC」；脚注 18 列举现有杠杆产品：「Volatility Shares 2x Bitcoin ETF (BITX) … Volatility Shares 2x Ether ETF (ETHU)」；结尾：「IT IS THEREFORE ORDERED, pursuant to Section 19(b)(2) of the Act … approved. For the Commission, by the Division of Trading and Markets, pursuant to delegated authority.」
- 可信度：高（监管原文）
- 用在哪一段：主帖第 3 行（发起人、基于期货、单日 3 倍）；跟帖 2/（近月及次月期货、现有同类为 2 倍 BITX/ETHU）；跟帖 3/（交易与市场部授权批准、法律依据为 1934 年法第 19(b)(2) 条）

### R-03
- 来源链接：https://www.sec.gov/Archives/edgar/data/1793497/000121390026090839/ea0291255-s1_vstrust.htm （EDGAR 索引：https://www.sec.gov/Archives/edgar/data/1793497/000121390026090839/0001213900-26-090839-index.htm ）
- 摘录：Form S-1，VS Trust，File No. 333-298396，「Subject to Completion Dated August 17, 2026」；拟登记代码「3x Gold ETF (GLDU) / 3x Silver ETF (SLVK) / 3x Bitcoin ETF (BITH) / 3x Ether ETF (ETHK) / 3x Crude Oil ETF (OILY) / 3x Natural Gas ETF (NATX)」；「We may not sell these securities until the registration statement filed with the Securities and Exchange Commission is effective.」；「Each Fund pays the Sponsor a management fee … equal to 1.85% per annum of its average daily net assets.」EDGAR 受理时间 2026-08-17T21:30:19Z = 2026-08-18 05:30 HKT。
- 可信度：高（发行人向 SEC 递交的原文；属初稿，最终条款以生效版本为准）
- 用在哪一段：主帖第 4 行（S-1 未生效）；跟帖 2/（拟用代码）；跟帖 4/（管理费 1.85%）；配图 2

### R-04
- 来源链接：https://data.sec.gov/submissions/CIK0001793497.json （EDGAR 申报列表，VS Trust，CIK 0001793497）
- 摘录：2026-10-03T23:32 HKT 查询，File No. 333-298396 名下只有 2026-08-17 的 S-1 一份，无 EFFECT（生效通知）或 S-1/A 修订；该 Trust 最新一份申报为 2026-09-15 的 424B3（属另一注册号 333-248430）。
- 可信度：高（自查记录；EDGAR 列表可能有短暂延迟）
- 用在哪一段：主帖第 4 行「S-1 未生效，上市日未定（截至 10/3 23:30 HKT）」；跟帖 4/「下一观察点」

### R-05
- 来源链接：https://www.odaily.news/zh-CN/newsflash/522239
- 摘录：「2026-10-03 05:57 (UTC+8) … 彭博 ETF 分析师 Eric Balchunas 在 X 平台发文表示，美国证券交易委员会（SEC）刚刚依据《1933 年证券法》批准 3 倍做多比特币、以太坊、黄金、白银、原油及天然气 ETP。」
- 可信度：中（中文媒体转述分析师推文）；其中「依据《1933 年证券法》批准」与 R-02 原文不符
- 用在哪一段：跟帖 3/（中文快讯最早见报时间 05:57 HKT；更正法律依据）

### R-06
- 来源链接：https://www.panewslab.com/zh/articles/01a0ff24-84b3-769f-abbc-9feae1ef661a
- 摘录：「PANews 10月3日消息，彭博 ETF 分析师 Eric Balchunas 发文表示，美国证券交易委员会（SEC）依据《1933 年证券法》批准 3 倍做多比特币、以太坊、黄金、白银、原油及天然气 ETP。」datePublished 2026-10-03T00:22:00Z = 08:22 HKT。
- 可信度：中（同 R-05，表述同样有误）
- 用在哪一段：跟帖 3/ 的更正说明（佐证）

### R-07
- 来源链接：https://www.odaily.news/zh-CN/newsflash/522274
- 摘录：「2026-10-03 10:25 (UTC+8) … ETF Store 总裁 Nate Geraci 表示，美国 SEC 已批准首批 3 倍杠杆比特币及以太坊 ETF 上市交易。」
- 可信度：中（人物表态的转述；「首批」为其说法）
- 用在哪一段：不进正文（「首批」未在 SEC 原文核到，见待核实）

### R-08
- 来源链接：https://cryptobriefing.com/sec-approves-3x-leveraged-bitcoin-ether-etps/
- 摘录：「Published: 2026-10-03T01:46:52Z」（= 09:46 HKT）「Trading cannot start until a separate Form S-1 registration statement under the Securities Act of 1933 becomes effective. The approval did not disclose any timeline for that.」「This marks the first US approval of triple-leveraged ETPs linked to Bitcoin and Ether」
- 可信度：中（英文媒体，有署名；S-1 部分与 R-03、R-04 一致；「first US approval」未核）
- 用在哪一段：佐证主帖第 4 行；「首次」说法不采用

### R-09
- 来源链接：https://www.tokenpost.com/news/regulation/26498
- 摘录：「Published Oct 2, 2026, 8:18 PM EDT」（= 10-03 08:18 HKT）「The SEC approved a Cboe BZX exchange rule change to list and trade six 3x leveraged exchange-traded products, including funds tied to Bitcoin (BTC) and Ether (ETH).」「The supplied materials do not give a launch date.」
- 可信度：中（英文媒体，第二个独立来源；仅见于搜索摘录）
- 用在哪一段：佐证主帖第 1 行、第 4 行

## 事实 / 观点 / 未核实 分开

### 事实（均有一手来源）
- SEC 于 2026-10-02（美东日期）发布批准令 34-106577，批准 Cboe BZX 上市交易 6 只 3 倍 ETP（黄金、白银、比特币、以太坊、原油、天然气），均为 VS Trust 系列，发起人 Volatility Shares LLC。（R-01、R-02）
- 法律依据为《1934 年证券交易法》第 19(b)(2) 条；由交易与市场部依授权签发；提案期间未收到评论意见。（R-01、R-02）
- 产品追求扣费前单日 3 倍，按近月及次月期货组合衡量，持有期货与现金；名称含 ETF，但 SEC 明确其属 ETP（Commodity-Based Trust Shares）。（R-01、R-02）
- 时间线：2026-08-10 递交 → 08-14 SEC 发通知（Release 106137）→ 08-19 登联邦公报 → 10-02 批准（均为美东日期）。（R-01）
- S-1（333-298396）递交于 2026-08-17，拟用代码 BITH（3x Bitcoin）、ETHK（3x Ether）等，管理费 1.85%/年；截至 2026-10-03 23:32 HKT，EDGAR 无生效记录。（R-03、R-04）
- SEC 批准令脚注 18 列举的现有 BTC/ETH 杠杆产品为 2 倍的 BITX、ETHU。（R-02）
- 中文快讯最早见报：Odaily 2026-10-03 05:57 HKT。（R-05）

### 观点（只能以「某人称」或编辑判断出现）
- Nate Geraci：「首批 3 倍杠杆比特币及以太坊 ETF」；「不到 3 年前 SEC 与灰度诉讼尚未结束，如今监管环境显著变化」。（R-07）
- Eric Balchunas 推文原文未直接打开，只见于 R-05/R-06 转述。
- draft 中「监管口径再放宽」为编辑判断，非事实。

## 待核实
> 尚无来源或来源存疑的事实放这里，进 draft 时标【待核】。

- [ ] 「美国首批/首次 3 倍 BTC/ETH 产品」：仅 Geraci 和 Crypto Briefing 这么说，SEC 原文未写，正文不用。
- [ ] SEC 在 sec.gov 发布批准令的具体钟点（HKT）：原文只有日期，未核到具体发布时间。正文只写「美东 10/2 签发」。
- [ ] 上市日期：未公布，S-1 生效时间未知。
- [ ] Eric Balchunas 推文原文（X 链接）：未打开核对。
- [ ] 最终代码与费率：以 S-1 生效版本为准（目前是初稿）。
