# 研究笔记（research）

- content_id：C-20260929-02

> 本文件**只放事实与引用**，不写观点、不写成稿。观点写在 brief.md 结论或 draft.md 正文。
> 本次为「过去 24 小时」一次性试跑记录（用户授权），按 `filter.md` 三层漏斗筛选打分。不写买卖建议。文中「观点」「指控」均为被引方的说法，不代表本笔记立场。

## 试跑说明

- **时间窗**：约 2026-09-28 15:00 HKT 至 2026-09-29 15:00 HKT。实际检索与打开页面时间：2026-09-29 15:21–15:30 HKT（以 `date -Iseconds` 为准）。
- **来源状态**：`sources.md` 中 12 个来源位均为「待确认」。本次使用的站点**仅为试跑**，不代表已确认，不得据此作为日常来源。
- **相关性口径**：`watchlist.md`、`thesis.md` 尚未由用户提供，相关性按通用主线（BTC/ETH、稳定币、监管、安全）打分。
- **可信度口径**：2 分仅给「本次实际打开的一手来源」（官网公告、监管/国会文件、SEC EDGAR、主交易平台公告、一手数据表）；只打开了媒体转述的给 1 分；只看到搜索摘要或标题、没打开正文的给 0–1 分并标注。
- **时效口径**：发布时间可确认落在窗口内给 1 分；日期在窗口外、或页面只有日期没有时刻而无法确认是否落在窗口内，给 0 分并标注。
- **时间换算**：EDT = UTC−4，HKT = UTC+8（EDT +12 小时）；ET 按 EDT 处理；IST(+05:30) +2.5 小时。页面未标时区的，原样记录并注明「未标时区」。
- **实际打开的页面（WebFetch / curl）**：
  - CoinDesk：BTC 行情（09-29）、Tether 参议院报告（09-28）、美联储 GENIUS 拟议规则（09-24）、Peirce 离任（09-25）；Goldman FTIXX 一文 WebFetch 超时未打开
  - The Block：Bitget CEO 专访（09-28）、Coinbase DCO（09-28）、Tether 参议院报告（09-28）、SEC FAQ（09-25）
  - Cointelegraph：NEAR Intents 拦截 Bitget 黑客资金（09-29）
  - Decrypt：Strategy 买入（09-28）
  - Unchained：Goldman FTIXX/Lynq（09-28）、Coinbase DCO（09-28）
  - TokenPost：清算与行情（09-28 EDT）、CoinEx 停止现货（09-23）
  - Bloomingbit：BTC ETF 流量（09-29）、Kakao 韩元稳定币（09-28）
  - Glassnode Research：BTC Market Pulse Week 40（09-28）
  - Tokenomist：Weekly Unlock Digest（09-28）
  - The Crypto Times：伪 GIWA 链（09-28）
  - Gate News：日本 FSA 稳定币试点（09-29，未标时区）
  - 一手来源：Bitget 支持中心 2 篇公告；Citi 新闻稿；美国参议院 PSI 报告 PDF（hsgac.senate.gov）；SEC EDGAR（Strategy 8-K 及提交时间）；Farside Investors BTC ETF 流量表（curl，2026-09-29 15:27 HKT 读取）
  - 打开失败/不可读：CoinEx 官方公告页（返回的只有 CSS，读不到正文）；CoinGecko API（HTTP 429 限流，未取到价格）
- **局限**：
  1. 没有交易所行情页/数据终端的一手价格；价格数字均来自媒体页面，已标发布时间。
  2. 未检索 X/Twitter（安全公司推文等），安全类只覆盖媒体与交易所官方页面。
  3. 未打开 CFTC、日本 FSA、美联储的官方原文；相关条目可信度按媒体转述计。
  4. 多个页面只有日期没有时刻（Decrypt、Glassnode、Citi、Tokenomist、Cointelegraph），已按规则处理。
  5. WebFetch 可能返回缓存页面；The Block 页面顶部行情条数字无法确认抓取时刻，未作为事实使用。
- **看到的新闻真实日期**：打开页面的发布日期为 2026-09-23 至 2026-09-29（最新为 CoinDesk 2026-09-29 12:17 HKT）；搜索结果中另有 2026-09-17（以太坊基金会博客）。未发现与 2026-09-29 明显不符的「只有旧闻」情况，但有若干窗口外旧闻被重新包装，已标注。

## 候选清单

> 共 29 条（同一事件已合并）。四类 = sources.md 四类来源（市场 / 监管与传统金融 / 安全与风险 / 一手项目研究）；第二层 = 改变四件事中的哪一件。
> 分项：相关(0-2) / 冲击(0-2) / 可信(0-2) / 时效(0-1) / 可证伪(0-1)。

| ID | 标题（简） | 链接 | 发布时间（HKT） | 平台 | 一句话摘要 | 分类 | 第一层 | 四类 / 第二层 | 相关 | 冲击 | 可信 | 时效 | 证伪 | 总分 | 去向 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| C01 | BTC 回落至约 $83,100，10 年期美债 5.25% | https://www.coindesk.com/markets/2026/09/29/bitcoin-holds-usd83-000-as-zec-drops-12-and-oil-climbs-again ；https://www.tokenpost.com/news/investing/25118 | 2026-09-29 12:17（CoinDesk，原文 00:17 EDT）；2026-09-29 09:26（TokenPost，原文 09-28 21:26 EDT） | CoinDesk；TokenPost | CoinDesk：周二亚洲早盘 BTC 刚高于 $83,100，全市场市值约 $2.86T；TokenPost：24h 区间 $82,563–$84,381，ETH $2,676 | 事实（价格）＋观点（FxPro 分析师称跌破 $80K/升破 $90K 的判断；「压力来自债市和油价」为媒体归因） | 通过 | 市场 / 市场结构 | 2 | 1 | 1 | 1 | 1 | 6 | inbox 备选（6 分最高之一） |
| C02 | 24h 全网清算约 $511M，多头 $408M | https://www.tokenpost.com/news/investing/25118 | 2026-09-29 09:26 | TokenPost | 24h 清算 $511M（多 $408M / 空 $103M），12.8 万人被强平，最大单笔为 Binance ETH/USDT $11.82M | 事实（媒体数据，未注明数据商）；其他搜索结果给出 $667M，口径不一 | 通过 | 市场 / 市场结构 | 2 | 1 | 1 | 1 | 1 | 6 | inbox 备选 |
| C03 | 美国现货 BTC ETF 9/28 净流入 $31.0M，连续 8 个交易日净流入 | https://farside.co.uk/btc/ ；https://en.bloomingbit.io/feed/news/121203 | Farside 表格 2026-09-29 15:27 读取；Bloomingbit 标注 2026-09-29 00:17（未标时区，按 KST 约为 09-28 23:17 HKT） | Farside Investors；Bloomingbit | 9/28：IBIT +54.8、FBTC −10.9、GBTC −23.2、BTC Mini +10.3，合计 +31.0（百万美元） | 事实（一手数据表＋媒体） | 通过 | 市场 / 市场结构 | 2 | 1 | 2 | 1 | 1 | **7** | 进日报 |
| C04 | Glassnode 周报：ETF 周流入约 $2.7B，期货 OI $38.9B，永续 CVD −$261.5M | https://research.glassnode.com/btc-market-pulse-week-40-2026/ | 2026-09-28（页面无时刻，无法确认是否在窗口内） | Glassnode Research | 截至 9/27 当周：ETF 周净流入约 $2.7B、期货 OI $38.9B（高于高带）、多头资金费支付降 53.2% 至 $1.2M、永续 CVD −$261.5M | 事实（研究机构数据）＋观点（「多头信心减弱」等解读） | 通过 | 一手研究 / 市场结构 | 2 | 1 | 1 | 0 | 1 | 6 | inbox 备选 |
| C05 | Bitget 约 $387.5M 被盗后续：分阶段恢复提币、保护基金吸收损失 | https://www.theblock.co/news/regulation/2026-09-28-bitget-attacker-tested-risk-controls-small-transfers-388-million-theft-ceo-says-417045 ；https://www.bitget.com/support/articles/12560603896110 ；https://www.bitget.com/support/articles/12560603896108 ；https://cointelegraph.com/news/near-intents-says-it-blocked-50m-tied-to-bitget-hackers | The Block 2026-09-28 23:30（原文 11:30 EDT）；Cointelegraph 2026-09-29（无时刻）；Bitget 公告 2026-09-26 03:55 / 2026-09-25 14:05（均未标时区，窗口外，作背景） | The Block；Bitget 官方；Cointelegraph | 官方确认转出约 $387.5M；BTC 提币 9/28 08:00 UTC（16:00 HKT）恢复，The Block 称首小时处理逾 3,000 BTC；ETH 计划 9/29 08:00 UTC（16:00 HKT）、USDT 9/30、其余 10/2；CEO 称保护基金（9/25 值 $465M）吸收损失、一周内补至不少于 $300M；NEAR Intents 称拦截逾 $50M 转移 | 事实（官方公告、时间表）＋观点（CEO 表态）；归因「同一伙人」未点名 → 未核实 | 通过 | 安全与风险 / 安全风险 | 2 | 2 | 2 | 1 | 1 | **8** | 进日报 |
| C06 | CFTC 批准 Coinbase Clearing LLC 注册为 DCO | https://www.theblock.co/news/business/2026-09-28-coinbase-dco-approval-417105 ；https://unchainedcrypto.com/cftc-approves-coinbases-own-clearinghouse-but-only-for-fully-collateralized-contracts/ | The Block 2026-09-29 10:02（原文 09-28 22:02 EDT）；Unchained 2026-09-29 08:33（原文 09-28 20:33 ET） | The Block；Unchained | 只能清算全额抵押的期货、期货期权和掉期，不能清算杠杆产品；Coinbase 称为「USDC 原生」清算所、7×24 结算 | 事实（媒体转述 CFTC 决定与 Coinbase 声明）；「可能支持 HIP-3 市场」为 The Block 明示的推测 → 未核实 | 通过 | 监管与传统金融 / 监管规则 | 2 | 2 | 1 | 1 | 1 | **7** | 进日报（待补 CFTC 原文链接） |
| C07 | 美参议院 PSI 少数派报告：USDT 是伊朗影子银行核心工具；Tether 称过去一年协助冻结约 $550M | https://www.hsgac.senate.gov/wp-content/uploads/2026-09-28-Crypto-and-Irans-Shadow-Banking-Network.pdf ；https://www.theblock.co/news/regulation/2026-09-28-tethers-usdt-center-iran-shadow-banking-network-new-senate-report-says-417094 ；https://www.coindesk.com/policy/2026/09/28/tether-is-a-lifeline-for-iranian-regime-senate-dems-say-in-new-report | PDF 封面日期 2026-09-28（无时刻）；CoinDesk 2026-09-29 00:16（原文 12:16 EDT）；The Block 2026-09-29 03:10（原文 15:10 EDT） | 美国参议院 PSI；The Block；CoinDesk | 报告分析 846 个与伊朗相关的被制裁/扣押钱包，称 84% 完全或几乎只用 USDT；Blumenthal 致信司法部长和财长要求调查；Tether 博文称协助冻结近 $550M 伊朗相关 USDT | 事实（报告已发布、致信已发出）；报告结论属**指控**（少数派幕僚报告，非执法结论）；Tether 回应属其自述 | 通过 | 监管与传统金融 / 监管规则（稳定币） | 2 | 1 | 2 | 1 | 1 | **7** | 进日报 |
| C08 | Citi 与 Coinbase 扩大合作：企业稳定币收款、法币自动转稳定币 | https://www.citigroup.com/global/news/press-release/2026/citi-coinbase-expand-collaboration-connect-digital-fiat-payments-corporations-consumers | Citi 新闻稿 2026-09-28（无时刻）；The Block 同题 2026-09-29 01:22（原文 13:22 EDT，仅见标题） | Citi 官网 | Coinbase Virtual Accounts 使用 Citi BaaS；Spring by Citi 商户可收稳定币、自动换成法币由 Citi 结算；先在美国推出，未披露上线日期和费率 | 事实（官方新闻稿）；「1.5 亿稳定币持有者」为 Citi 自述 | 通过 | 监管与传统金融 / 市场结构（稳定币） | 2 | 1 | 2 | 1 | 0 | 6 | inbox 备选 |
| C09 | 高盛约 $100B 国债基金 FTIXX 经 Lynq 向加密机构开放（非代币化） | https://unchainedcrypto.com/tzero-brings-goldman-sachs-105-billion-treasury-fund-to-crypto-settlement-network-lynq/ | 2026-09-29 06:09（原文 09-28 18:09 ET）；CoinDesk 同题（搜索显示 09-28 14:00 EDT，打开超时） | Unchained | 只限合格美国客户；Lynq 称有 30 多家机构、逾 $89M 资产；上架的是普通机构份额，不是代币化份额 | 事实（媒体转述 tZERO 公告及 SEC 月报） | 通过 | 监管与传统金融 / 市场结构 | 1 | 1 | 1 | 1 | 1 | 5 | inbox |
| C10 | Strategy 9/21–27 买入 1,665 BTC，持仓 847,666 BTC | https://www.sec.gov/Archives/edgar/data/1050446/000119312526403417/mstr-20260914.htm ；https://decrypt.co/379415/strategy-sets-new-btc-holdings-record-after-143m-bitcoin-purchase | SEC EDGAR 提交时间 2026-09-28 20:00（12:00:16 UTC）；Decrypt 2026-09-28（无时刻） | SEC EDGAR（8-K）；Decrypt | 8-K：1,665 BTC 合计 $142.7M、均价 $85,681；截至 9/27 持有 847,666 BTC、总成本 $63.95B、均价 $75,437；资金来自出售 MSTR 股票；另回购 $151.7M STRC | 事实（监管申报文件） | 通过 | 市场 / 市场结构 | 2 | 1 | 2 | 1 | 1 | **7** | 进日报 |
| C11 | Strive 买入 $94.5M BTC，持仓超过 27,400 BTC | https://www.theblock.co/news/business/2026-09-28-strive-pushes-bitcoin-holdings-above-27400-btc-latest-94-5-million-purchase-417035 | 2026-09-29 00:00（原文 09-28 12:00 EDT，仅在 The Block 列表中看到标题） | The Block（仅标题） | 企业财库继续买入 BTC；正文未打开，细节（1,107 BTC、27,462 BTC）只见于搜索摘要 | 事实（仅标题）；细节未核实 | 通过 | 市场 / 市场结构 | 1 | 0 | 1 | 1 | 1 | 4 | inbox |
| C12 | CoinEx 9/29 停止现货交易，12 月关闭 | https://www.tokenpost.com/news/business/23209 | 2026-09-23 18:50（原文 06:50 EDT，窗口外）；计划执行时间 9/29 02:00 UTC = 10:00 HKT（窗口内） | TokenPost | 9/29 02:00 UTC 起取消挂单、将有外部流动性的非 USDT 资产卖成 USDT；提币开放至 12/22 02:00 UTC | 事实（媒体转述官方公告，官方页未能读取）；「储备率超 100%」未经独立核实 | 通过 | 安全与风险 / 安全风险（交易所停服） | 1 | 1 | 1 | 0 | 1 | 4 | inbox |
| C13 | Kakao 集团公布韩元稳定币业务计划 | https://en.bloomingbit.io/feed/news/121192 | 2026-09-28 21:01（未标时区，按 KST 约为 20:01 HKT） | Bloomingbit | 9/28 在 Next Finance Korea 活动上公布；与 Circle、Fireblocks、x402 Foundation 做过技术验证；提议开放式合作框架；未公布上线日期 | 事实（企业发布）；无时间表 | 通过 | 监管与传统金融 / 市场结构（稳定币） | 1 | 1 | 1 | 1 | 0 | 4 | inbox |
| C14 | 日本金融厅宣布贸易结算稳定币试点 | https://www.gate.com/news/detail/japan-fsa-announces-stablecoin-pilot-for-trade-settlements-24626582 | 2026-09-29 05:43:42（未标时区） | Gate News（聚合） | 称金融厅 9/29 在 FinTech 实证中心/PIP 框架下宣布贸易结算稳定币试点；金融厅原文未打开 | 未核实（仅二手聚合、无官方链接） | 通过 | 监管与传统金融 / 监管规则 | 1 | 0 | 1 | 1 | 0 | 3 | 丢弃（补到官方原文后可重评） |
| C15 | 冒用 GIWA 链 ID 的假 L2 卷走约 766.25 ETH | https://www.cryptotimes.io/2026/09/28/fake-giwa-chain-drained-766-eth-after-1335-addresses-bridged-into-it/ | 2026-09-28 15:44（原文 13:14 +05:30） | The Crypto Times | 据 DYORSWAP：假网络冒用 chain ID 9134，1,335 个地址桥入 767.65 ETH，约 766.25 ETH 被转走；DYORSWAP 称已自掏腰包赔付逾 200 ETH | 事实（单一当事方陈述，经媒体转述）；钱包归属判断为当事方评估 | 通过 | 安全与风险 / 安全风险 | 1 | 1 | 1 | 1 | 1 | 5 | inbox |
| C16 | Bitwise NEAR ETF（NRR）获上市批准，「约 9/29 开始交易」 | https://cryptobriefing.com/bitwise-near-etf-nyse-arca-sec-approval/ （仅搜索摘要）；https://en.cryptonomist.ch/2026/09/28/bitwise-near-etf-trading/ （仅搜索摘要） | 批准日为 9/24（窗口外）；cryptobriefing 2026-09-27 15:21 | Crypto Briefing；Cryptonomist | 9/24 获 NYSE Arca 上市批准、注册生效；首个交易日未确认 | 事实（批准）＋未核实（开盘日期） | 通过 | 监管与传统金融 / 监管规则（ETF） | 1 | 1 | 1 | 0 | 1 | 4 | inbox |
| C17 | SEC 委员 Peirce 10/2 离任，委员会将只剩 2 人 | https://www.coindesk.com/policy/2026/09/25/u-s-sec-s-steadiest-crypto-advocate-hester-peirce-to-depart-next-week | CoinDesk 2026-09-26 06:17（原文 09-25 18:17 EDT，窗口外）；The Block 专访 2026-09-29 00:35（原文 12:35 EDT，仅见标题） | CoinDesk；The Block（标题） | 最后工作日 10/2；离任后只剩 Atkins、Uyeda 两名委员，按规则两人可构成法定人数 | 事实（离任日期）；专访内容为个人观点 | 通过 | 监管与传统金融 / 监管规则 | 2 | 1 | 1 | 0 | 1 | 5 | inbox |
| C18 | 本周美国宏观：PCE 周三公布 | https://www.coindesk.com/markets/2026/09/29/bitcoin-holds-usd83-000-as-zec-drops-12-and-oil-climbs-again | 2026-09-29 12:17 | CoinDesk | 美国商务部周三公布 8 月 PCE；10 年期美债 9/28 触及 2007 年以来最高，布伦特近 $107 | 事实（日程、利率水平）；「PCE 偏热会推高加息预期」为媒体判断 | 通过（相关性按通用主线） | 市场 / 市场结构（间接） | 1 | 1 | 1 | 1 | 1 | 5 | inbox |
| C19 | 美联储发布 GENIUS 法案实施拟议规则 | https://www.coindesk.com/policy/2026/09/24/u-s-federal-reserve-moves-on-proposals-to-implement-genius-act-for-stablecoins | 2026-09-25 06:28（原文 09-24 18:28 EDT，**窗口外**） | CoinDesk | 两项拟议规则，征求意见 60 天；包括储备/资本要求和稳定币收益（奖励）推定禁止条款 | 事实；有聚合站把它当作 9/29 新闻，实为 9/24 | 通过 | 监管与传统金融 / 监管规则 | 2 | 2 | 1 | 0 | 1 | 6 | inbox 备选（窗口外旧闻，不进今日日报） |
| C20 | SEC 公司金融部加密 FAQ（代币回购、网络升级） | https://www.theblock.co/news/regulation/2026-09-25-sec-crypto-faq-addresses-token-buybacks-network-upgrades-promises-profit-416914 | 2026-09-26 04:32（原文 09-25 16:32 EDT，**窗口外**）；Decrypt 9/28「Morning Minute」重新包装（仅搜索标题） | The Block | 已经能用的网络宣布回购，本身不构成投资合同；具体仍看个案 | 事实（媒体转述 SEC 工作人员 FAQ） | 通过 | 监管与传统金融 / 监管规则 | 2 | 1 | 1 | 0 | 0 | 4 | inbox |
| C21 | 本周代币解锁：2Z 10/2 解锁约 $113.23M（占流通 47.69%） | https://tokenomist.ai/research/weekly-unlock-digest-sep-28-oct-4-2026-2z-faces-a-114m-cliff-worth-47-of-float-2 | 2026-09-28（无时刻） | Tokenomist | 本周 45 个代币 cliff 解锁合计约 $198M（按 9/27 价格），前几名 2Z、SUI、ENA、KMNO、CARDS | 事实（数据平台） | 通过（大额解锁） | 安全与风险 / 安全风险（解锁） | 0 | 1 | 1 | 0 | 1 | 3 | 丢弃（watchlist 若含这些代币再重评） |
| C22 | 以太坊 Glamsterdam 10/6 在 Sepolia 测试网激活 | https://blog.ethereum.org/2026/09/17/glamsterdam-testnet-announcement （仅搜索结果）；https://approx.org/2026/09/28/glamsterdam-testnet-announcement-ethereum-foundation-blog/ （9/28 转载） | 原文 2026-09-17（**窗口外**） | 以太坊基金会博客（未打开） | Sepolia 激活时间 10/6 13:53:36 UTC；主网日期未定 | 事实（官方公告，但本次未打开原文） | 通过 | 一手项目 / 我的主线（ETH，待 thesis） | 2 | 1 | 1 | 0 | 1 | 5 | inbox（进日历，不进日报） |
| C23 | ZEC 跌 12%、GRT 涨 18%、IMX 涨近 10% | https://www.coindesk.com/markets/2026/09/29/bitcoin-holds-usd83-000-as-zec-drops-12-and-oil-climbs-again | 2026-09-29 12:17 | CoinDesk | 单个山寨币涨跌幅，文中没有给出涨跌原因 | 事实（涨跌幅） | **排除**：与 watchlist/thesis 无关的山寨行情 | — | — | — | — | — | — | — | 丢弃 |
| C24 | 「Privy Expands Support for TRON…」 | 出现在 The Block 页面侧栏，标注 Sponsored | 2026-09-29 00:14（原文 09-28 12:14 EDT） | The Block（赞助内容） | 赞助稿 | — | **排除**：广告/赞助 | — | — | — | — | — | — | — | 丢弃 |
| C25 | Variational $VAR：32% 创世空投 TGE 时全部解锁 | https://tokenomist.ai/research/weekly-unlock-digest-sep-28-oct-4-2026-2z-faces-a-114m-cliff-worth-47-of-float-2 | 2026-09-28（代币经济学 9/24 发布） | Tokenomist | 空投分配与 TGE 安排 | 事实 | **排除**：空投 | — | — | — | — | — | — | — | 丢弃 |
| C26 | 「本周约 40,000 BTC 离开交易所」 | https://walletinvestor.com/news/crypto-news/bitcoin-slips-toward-83500-as-exchange-outflows-and-corporate-buying-build/ （仅搜索摘要，未打开） | 2026-09-29（无时刻） | WalletInvestor | 搜索摘要里的数字，没看到数据出处 | 未核实 | **排除**：数据无可核来源 | — | — | — | — | — | — | — | 丢弃（转入未核实区） |
| C27 | 「Trump's 2 p.m. Oval Office Announcement: What It Could Mean for Bitcoin」 | The Crypto Times 页面「You may also like」栏（仅标题） | 未知 | The Crypto Times | 借未公布事件猜测对 BTC 的影响 | 观点/猜测 | **排除**：无来源传闻/猜测 | — | — | — | — | — | — | — | 丢弃 |
| C28 | 「HBAR Price Soars 22% as Hedera App Lands on IBM Cloud」 | The Crypto Times 页面「Latest News」栏（仅标题） | 未知 | The Crypto Times | 单币涨幅＋归因 | 观点（涨跌归因） | **排除**：山寨行情＋涨跌归因 | — | — | — | — | — | — | — | 丢弃 |
| C29 | 「BTC/ETH 永续资金费率已转负」 | WebSearch 汇总文字（非页面原文） | — | 搜索引擎摘要 | 搜索汇总称资金费率转负；实际打开 Glassnode 周报只写「多头资金费支付降 53.2%」，没说转负 | 未核实 | **排除**：说法在打开的页面里找不到 | — | — | — | — | — | — | — | 丢弃（转入未核实区） |

## 拟进入日报的 5–8 条（≥7 分）

> 本次 ≥7 分**正好 5 条**，达到下限，未凑数。另列 6 分最高的 2 条作备选（已标明，**不进日报**）。每条均附至少 1 个可核链接，其中 4 条有 2 个以上独立链接。

1. **【8 分｜安全与风险】Bitget 约 $387.5M 被盗后续：分阶段恢复提币**
   - 事实：Bitget 官方确认约 $387.5M 资产被转到攻击者控制的地址（官方公告，2026-09-25 发布）；提币恢复时间表：BTC 9/28 08:00 UTC（16:00 HKT），ETH 9/29 08:00 UTC（16:00 HKT，截至本次读取尚未到点），USDT 9/30，其他代币/法币/P2P 10/2。据 The Block（2026-09-28 23:30 HKT），BTC 提币恢复后首小时处理逾 3,000 BTC；CEO 称保护基金（9/25 值 $465M）吸收损失，一周内从公司储备补至不少于 $300M。据 Cointelegraph（2026-09-29），NEAR Intents 称拦截逾 $50M 相关转移。
   - 观点/未核实：CEO 称「仍是我们怀疑的同一伙人」，未点名，待正式事件报告。
   - 下一步观察：ETH（今天 16:00 HKT）、USDT（明天）提币是否按时恢复；本周正式事件报告。
   - 链接：https://www.bitget.com/support/articles/12560603896110 ；https://www.bitget.com/support/articles/12560603896108 ；https://www.theblock.co/news/regulation/2026-09-28-bitget-attacker-tested-risk-controls-small-transfers-388-million-theft-ceo-says-417045 ；https://cointelegraph.com/news/near-intents-says-it-blocked-50m-tied-to-bitget-hackers

2. **【7 分｜市场】美国现货 BTC ETF 9/28 净流入 $31.0M，连续第 8 个交易日净流入**
   - 事实：Farside 数据（2026-09-29 15:27 HKT 读取）：9/28 IBIT +$54.8M、FBTC −$10.9M、GBTC −$23.2M、BTC Mini +$10.3M，合计 +$31.0M；Bloomingbit（标注 2026-09-29 00:17，未标时区）称连续 8 个交易日净流入。
   - 下一步观察：9/29 的流量数据。
   - 链接：https://farside.co.uk/btc/ ；https://en.bloomingbit.io/feed/news/121203

3. **【7 分｜监管】CFTC 批准 Coinbase Clearing LLC 注册为衍生品清算机构（DCO）**
   - 事实：据 The Block（2026-09-29 10:02 HKT）和 Unchained（2026-09-29 08:33 HKT），CFTC 于美国时间周一批准，只限全额抵押的期货、期货期权和掉期，不含杠杆产品；Coinbase 称其为「USDC 原生」清算所、7×24 结算；保证金类衍生品和计划中的个股永续仍走外部清算伙伴。
   - 未核实：The Block 提到可能支持 HIP-3 市场，文中自己也写明是推测。
   - 下一步观察：CFTC 原文；首批自清算产品。
   - 链接：https://www.theblock.co/news/business/2026-09-28-coinbase-dco-approval-417105 ；https://unchainedcrypto.com/cftc-approves-coinbases-own-clearinghouse-but-only-for-fully-collateralized-contracts/

4. **【7 分｜监管·稳定币】美国参议院 PSI 少数派报告点名 USDT；Tether 回应称协助冻结约 $550M**
   - 事实：美国参议院常设调查小组委员会（PSI）首席少数党成员 Blumenthal 及少数党幕僚发布报告（封面日期 2026-09-28）。报告分析了 846 个因与伊朗相关而被制裁或列为扣押目标的钱包，称其中 84% 完全或几乎只用 USDT；Blumenthal 致信司法部长和财长，要求调查（据 The Block，2026-09-29 03:10 HKT）。Tether 发博文称过去一年协助冻结近 $550M 伊朗相关 USDT（据 CoinDesk，2026-09-29 00:16 HKT）。
   - 性质：报告结论属少数党的**指控**，不是执法结论；Tether 的说法是其自述。
   - 下一步观察：司法部/财政部是否回应；Tether 是否有进一步冻结或披露。
   - 链接：https://www.hsgac.senate.gov/wp-content/uploads/2026-09-28-Crypto-and-Irans-Shadow-Banking-Network.pdf ；https://www.theblock.co/news/regulation/2026-09-28-tethers-usdt-center-iran-shadow-banking-network-new-senate-report-says-417094 ；https://www.coindesk.com/policy/2026/09/28/tether-is-a-lifeline-for-iranian-regime-senate-dems-say-in-new-report

5. **【7 分｜市场】Strategy 9/21–27 买入 1,665 BTC，持仓增至 847,666 BTC**
   - 事实：SEC 8-K（EDGAR 提交时间 2026-09-28 20:00 HKT）：合计 $142.7M、均价 $85,681（含费用）；截至 9/27 持有 847,666 BTC，总成本 $63.95B，均价 $75,437；资金来自出售 MSTR 普通股；同期回购 $151.7M STRC。
   - 下一步观察：下周一的 8-K 是否继续买入或卖出。
   - 链接：https://www.sec.gov/Archives/edgar/data/1050446/000119312526403417/mstr-20260914.htm ；https://decrypt.co/379415/strategy-sets-new-btc-holdings-record-after-143m-bitcoin-purchase

**备选（6 分，不进日报，仅供用户决定）**
- C01 BTC 约 $83,100（CoinDesk 2026-09-29 12:17 HKT）、24h 区间 $82,563–$84,381（TokenPost 2026-09-29 09:26 HKT）：没能读取交易所/数据商一手行情，可信度只能给 1 分。
- C08 Citi × Coinbase 稳定币支付（Citi 新闻稿 2026-09-28）：一手来源，但没有上线日期和数据，可证伪给 0 分。
- （同为 6 分的还有 C02 清算、C04 Glassnode 周报、C19 美联储拟议规则；C19 是 9/24 的窗口外旧闻。）

## 被丢掉的类型举例

| 类型 | 具体例子 | 丢弃原因 |
|---|---|---|
| 广告/赞助 | C24 The Block 侧栏「Privy Expands Support for TRON…」（标注 Sponsored，2026-09-29 00:14 HKT） | 第一层：广告 |
| 空投 | C25 Variational $VAR 32% 创世空投（Tokenomist 9/28） | 第一层：空投 |
| 山寨行情 | C23 ZEC −12%、GRT +18%、IMX +近 10%（CoinDesk 9/29）；C28「HBAR Price Soars 22%…」（仅标题） | 第一层：与 watchlist/thesis 无关，且没有可核的涨跌原因 |
| 无来源猜测 | C27「Trump's 2 p.m. Oval Office Announcement: What It Could Mean for Bitcoin」 | 第一层：借未公布事件做猜测 |
| 数据无出处 | C26「约 40,000 BTC 离开交易所」（WalletInvestor 摘要）；C29「资金费率转负」（搜索汇总，打开的 Glassnode 原文里没有） | 第一层：未核实 |
| 旧闻换标题 | C22 Glamsterdam 测试网公告（EF 原文 9/17，approx.org 9/28 转载）；C20 SEC FAQ（9/25，Decrypt 9/28 重新包装）；C19 美联储拟议规则（9/24，有聚合站当作 9/29 新闻） | 时效 0 分，不进今日日报 |
| 只有二手、无官方原文 | C14 日本金融厅稳定币试点（仅 Gate 聚合，未标时区） | 3 分，丢弃；补到官方原文后可重评 |
| 与通用主线关系弱 | C21 2Z 等本周解锁 | 相关性 0，3 分；watchlist 若含这些代币再重评 |
| 与币圈无关 | 搜索结果中的「Nvidia Launches Platform to Keep AI Agents Contained」（Cointelegraph） | 不在四件事之内，未列入候选 |

## 未核实区

> 尚无来源或来源存疑的说法放这里；若进入 draft，须标【待核】。

- [ ] Bitget 攻击者归属（CEO 称「同一伙人」，未点名，待正式事件报告）。
- [ ] Bitget ETH 提币是否已于 9/29 08:00 UTC（16:00 HKT）恢复：本次读取时（约 15:25 HKT）还没到点。
- [ ] 24h 清算总额口径不一：TokenPost $511M，其他搜索结果 $667M（未打开）；TokenPost 未注明数据商。
- [ ] 「BTC/ETH 永续资金费率转负」：只见于搜索汇总，打开的 Glassnode 周报里没有。
- [ ] 「本周约 40,000 BTC 离开交易所」（WalletInvestor）：未打开，数据出处不明。
- [ ] Coinbase DCO 的 CFTC 原文：未打开；「可能支持 HIP-3」为 The Block 明示推测。
- [ ] Bitwise NEAR ETF（NRR）首个交易日：未确认。
- [ ] 日本金融厅稳定币试点：金融厅官方原文未打开，Gate 页面未标时区。
- [ ] CoinEx 9/29 02:00 UTC 停止现货是否已按计划执行：官方页读不到正文，只有 9/23 的媒体报道；「储备率超 100%」未经独立核实。
- [ ] Strive 买入细节（1,107 BTC、27,462 BTC）：只见于搜索摘要，The Block 正文未打开。
- [ ] ETF 周流入口径不一：Glassnode 周报写截至 9/27 当周约 $2.7B；搜索结果中 The Block（9/26，引 SoSoValue，未打开）写截至 9/25 当周 $2.4B。
- [ ] 高盛 FTIXX 规模：CoinDesk 写「约 $100B」，Unchained 引 SEC 月报写 8 月底约 $105B；CoinDesk 原文打开超时。
- [ ] The Block 页面顶部行情条（BTC $83,051、ETH $2,666.80）：抓取时刻无法确认（可能是缓存），未作为事实使用。

---

## 试跑 2：Foresight News 过去 24 小时（2026-09-28 17:11 至 09-29 16:50 HKT）

> 来源：`sources.md` REG-01 Foresight News（快讯），用户 2026-09-29 确认。按 `filter.md` 三层漏斗筛选打分。不写买卖建议；「指控」「观点」均为被引方说法。
> 本节写于 2026-09-29 17:04 HKT（`date -Iseconds`：2026-09-29T17:04:54+08:00）。topic 状态不变，仍为 researching；本节不代表可发布。

### 覆盖范围与方法

- **目标窗口**：2026-09-28 约 16:55 HKT 至运行时（2026-09-29 约 17:00 HKT）。
- **实际覆盖**：窗口内共 **93 条快讯**，最早 2026-09-28 17:11 HKT（id 114143），最晚 2026-09-29 16:50 HKT（id 114236）。窗口开始前最近一条是 09-28 16:34（id 114142，不计入）。
- **完整性核对**：
  - 用户已存 `/workspace/foresight_24h_raw.json`，93 条（其中站方 `is_important` 28 条）。
  - 用分页接口 `https://api.foresightnews.pro/v1/news?page=N&size=20` 翻 1–6 页（第 6 页已回到 09-28 11:59），2026-09-29 16:5x HKT 抓取：窗口内同样是 93 条，id 与原始文件**完全一致，无缺漏、无多出**，所以没有补条目。2026-09-29 17:01:55 HKT 复查第 1 页，最新一条仍是 16:50（id 114236）。
  - id 114143–114236 之间只缺 114233；详情接口 `/v1/news/114233` 返回「服务器内部错误」，推测已撤稿或删除，**未计入**，也没法核实内容。
  - 注：分页接口返回的 `data.list` 是**第二层** base64+zlib 编码（解两次才是列表）。
- **时间**：`published_at`（unix）换算为 HKT。Foresight 正文里的「16:00」等钟点没标时区，按北京时间（= HKT）理解。
- **条目链接格式**：`https://foresightnews.pro/news/detail/<id>`。**格式已核实**：搜索引擎收录的 Foresight 页面（如 detail/112803、detail/88646）和 Foresight 官方 Nostr 帖子里的链接（detail/102936）都是这个格式。本批 93 条的详情页用 curl 打开时返回 HTTP 567（EdgeOne 防护），**逐条页面没打开**；内容以只读接口 `/v1/news/<id>` 返回的为准（已用 114236 试过，标题/正文/source_link 与列表一致）。
- **相关性口径**：`watchlist.md`、`thesis.md` 仍未提供，相关性按通用主线（BTC/ETH、稳定币、监管、安全）打分。
- **可信度口径**（二手来源规则）：只有追到一手出处（官方公告、监管文件、链上/数据平台、安全公司披露）才给 2 分，追不到最多 1 分。可能 ≥7 分的条目，本次逐条抽查了一手出处（见下文「≥7 分」各条）。<7 分的条目**没有抽查**，它们的可信度按 source_link 类型给分，表中注明「未抽查」。X 推文用 X 官方 oEmbed 接口（publish.twitter.com）读取正文，只证明推文存在、内容和转述一致，**不等于链上数据已独立核实**。
- **合并**：同一事件合并打分（事件分数写在该事件每一行）；与试跑 1 重复的事件并入原条目，不重复计数。

### 各去向数量（按 93 条快讯计）

| 去向 | 条数 | 合并后事件数 | 其中站方「重要」 |
|---|---|---|---|
| 第一层排除 | 30 | — | 8 |
| 第二层丢弃（不改变四件事） | 25 | — | 4 |
| ≥7 分：进日报 | 12 | 6 | 8 |
| 4–6 分：留 inbox | 23 | 21 | 8 |
| ≤3 分：丢弃 | 3 | 3 | 0 |
| 合计 | 93 | — | 28 |

### 候选清单（93 条）

> 分项：相关(0-2) / 冲击(0-2) / 可信(0-2) / 时效(0-1) / 可证伪(0-1)。「站方重要」= Foresight `is_important`。合并事件的分数按事件计，写在每一行。
> 「主小类」「副小类」按 `categories.md`（14 大类 / 79 小类）和 `filter.md`「分类标注」补标，补标时间 2026-09-30T21:40:00+08:00（`date -Iseconds`）；分类只做归纳，**不改变分数和去向**。副小类最多 2 个，无则写「—」。

| ID | 时间（HKT） | 标题（Foresight 原题） | Foresight 链接 | 站方重要 | 第一/二层结果 | 出处与备注 | 分项 | 总分 | 去向 | 主小类 | 副小类 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| F01 | 09-28 17:11 | Bitget BTC 提现开放后处理顺畅，首批约 6900 笔已完成链上确认 | https://foresightnews.pro/news/detail/114143 | 是 | 通过 | Bitget 直播数据，无链接 | 2/2/2/1/1 | **8** | **进日报**（合并 R1 Bitget） | security.hack | security.withdraw |
| F02 | 09-28 17:12 | Bybit 推出事件市场 ByPick | https://foresightnews.pro/news/detail/114144 | — | 第一层排除①广告/拉新活动 | 交易所活动奖池 | — | — | 丢弃 | exchange.airdrop | exchange.product |
| F03 | 09-28 17:21 | Capital B 增持 13 枚 BTC，累计持仓达 3538 枚 | https://foresightnews.pro/news/detail/114145 | — | 第二层丢弃：不改变四件事 | 13 BTC，量太小 | — | — | 丢弃 | people.treasury | — |
| F04 | 09-28 17:44 | GoPlus：Robinhood Chain 上一欺诈 Meme 工厂近 30 天流水超 900 万美元 | https://foresightnews.pro/news/detail/114146 | — | 通过 | 安全公司 X（未抽查）；链与标的不在主线 | 0/0/2/1/1 | 4 | inbox | security.phishing | narrative.meme |
| F05 | 09-28 17:59 | 某地址 4 天内向币安转入 1.3 亿枚 USD1 | https://foresightnews.pro/news/detail/114147 | — | 第二层丢弃：不改变四件事 | 单地址转账，无背景 | — | — | 丢弃 | onchain.whale | structure.exchange_flow |
| F06 | 09-28 18:01 | 币安股票交易将新增 BRUN、GRML、OCTV、USDE、WSE 五只股票 | https://foresightnews.pro/news/detail/114148 | — | 第二层丢弃：不改变四件事 | 交易所上新股票，不属四件事 | — | — | 丢弃 | exchange.listing | metastory.onchain_equity |
| F07 | 09-28 18:04 | Compound 基金会被指挪用 842 万枚 DAI 储备金兑换 COMP 用于治理投票 | https://foresightnews.pro/news/detail/114149 | 是 | 通过 | 治理论坛指控帖；链上可查但属指控 | 1/1/1/1/1 | 5 | inbox | people.founder | — |
| F08 | 09-28 18:10 | Bybit 上线 KII USDT 永续合约 | https://foresightnews.pro/news/detail/114150 | 是 | 第一层排除⑤无关山寨 | 山寨合约上新 | — | — | 丢弃 | exchange.listing | — |
| F09 | 09-28 18:23 | OKX 上线 ETH 专属闪赚 Lite，申购 ETH 可瓜分 400,000 USDT | https://foresightnews.pro/news/detail/114151 | — | 第一层排除②空投 | 空投/理财活动 | — | — | 丢弃 | exchange.airdrop | — |
| F10 | 09-28 18:31 | 路透社：民主党若胜选拟调查特朗普家族加密业务，相关公司已聘律师 | https://foresightnews.pro/news/detail/114152 | — | 通过 | 路透转述，前提是中期选举结果 | 1/0/1/1/0 | 3 | 丢弃 | policy.enforcement | — |
| F11 | 09-28 18:43 | Wintermute 在 Hyperliquid 持有约 1.26 亿美元空单，最大仓位为 ETH 空单 | https://foresightnews.pro/news/detail/114153 | — | 通过 | 链上监测账号；做市商仓位可能是对冲 | 1/0/1/1/1 | 4 | inbox | onchain.whale | narrative.perp_dex |
| F12 | 09-28 19:03 | Ontology 关闭 stONT 流动性质押服务 | https://foresightnews.pro/news/detail/114154 | — | 通过 | 项目官方 X；标的不在主线 | 0/0/2/1/1 | 4 | inbox | infra.staking | — |
| F13 | 09-28 19:11 | ZachXBT：疑似为朝鲜黑客清洗 Bitget 被盗资金的洗钱团伙公开求助 | https://foresightnews.pro/news/detail/114155 | 是 | 通过 | ZachXBT X（已核推文存在） | 2/2/2/1/1 | **8** | **进日报**（合并 R1 Bitget） | security.hack | onchain.flow |
| F14 | 09-28 19:31 | WSJ：花旗与 Coinbase 合作，为企业客户提供稳定币收款服务 | https://foresightnews.pro/news/detail/114156 | 是 | 通过 | Foresight 引 WSJ；一手为试跑 1 已打开的 Citi 新闻稿 | 2/1/2/1/0 | 6 | inbox（并入试跑 1 C08） | metastory.stable_rail | metastory.institutional |
| F15 | 09-28 19:37 | 富兰克林邓普顿与 Bybit 达成战略合作，首项为代币化货币基金场外抵押计划 | https://foresightnews.pro/news/detail/114157 | 是 | 通过 | 富兰克林邓普顿官方 X；无规模/日期 | 1/1/2/1/0 | 5 | inbox | narrative.rwa | metastory.institutional |
| F16 | 09-28 19:58 | Strategy 上周增持 1665 枚 BTC，累计持仓达 847,666 枚 | https://foresightnews.pro/news/detail/114158 | 是 | 通过 | Foresight 引第三方 X；一手为 SEC 8-K（本次已打开） | 2/1/2/1/1 | **7** | **进日报**（合并 R5 Strategy） | people.treasury | — |
| F17 | 09-28 20:00 | 甲骨文将集成 Swift 区块链账本，支持银行跨机构使用代币化存款 | https://foresightnews.pro/news/detail/114159 | — | 第二层丢弃：不改变四件事 | 银行基础设施集成，不改变四件事 | — | — | 丢弃 | metastory.institutional | metastory.stable_rail |
| F18 | 09-28 20:02 | Strive 上周增持 1107 枚 BTC，累计持仓达 27,462 枚 | https://foresightnews.pro/news/detail/114160 | — | 通过 | SEC 8-K（未抽查）；规模小 | 1/0/2/1/1 | 5 | inbox | people.treasury | — |
| F19 | 09-28 20:04 | Tether 与 Shiga 合作，在非洲和海湾地区推出基于 WDK 的自托管金融产品 | https://foresightnews.pro/news/detail/114161 | — | 第二层丢弃：不改变四件事 | 产品合作 | — | — | 丢弃 | metastory.stable_rail | — |
| F20 | 09-28 20:09 | ENS Labs 与 GLEIF 探索将 ENS 域名与可验证法人识别编码关联 | https://foresightnews.pro/news/detail/114162 | — | 第二层丢弃：不改变四件事 | 身份标识探索 | — | — | 丢弃 | 未归类 | — |
| F21 | 09-28 20:17 | Chainlink 宣布 CCIP 2.0 上线，支持机构自行运行跨链验证节点 | https://foresightnews.pro/news/detail/114163 | — | 通过 | Chainlink 博客（未抽查） | 1/0/2/1/1 | 5 | inbox（合并 CCIP/FCR） | security.bridge | metastory.institutional |
| F22 | 09-28 20:24 | DeFi Development 上周增持 47,706 枚 SOL，总持仓达 253.8 万枚 | https://foresightnews.pro/news/detail/114164 | — | 第一层排除⑤无关山寨 | SOL 财库，非主线标的 | — | — | 丢弃 | people.treasury | narrative.l1 |
| F23 | 09-28 20:28 | CoinMarketCap 任命前 CPO 为新任 CEO，前 CEO 转向集团新业务 | https://foresightnews.pro/news/detail/114165 | — | 第二层丢弃：不改变四件事 | 人事 | — | — | 丢弃 | people.founder | — |
| F24 | 09-28 20:31 | BitMine 上周增持 17,362 枚 ETH，总持仓突破 600 万枚 | https://foresightnews.pro/news/detail/114166 | 是 | 通过 | PR Newswire 公司公告（本次已打开） | 2/1/2/1/1 | **7** | **进日报**（R6 BitMine） | people.treasury | — |
| F25 | 09-28 20:39 | BTCS：已完成代币化股票流动性提供的合规准备，拟依据 SEC 豁免开展业务 | https://foresightnews.pro/news/detail/114167 | — | 第二层丢弃：不改变四件事 | 单一公司合规准备，未开展业务 | — | — | 丢弃 | metastory.onchain_equity | policy.sec |
| F26 | 09-28 20:45 | 币安将以每股 4500 韩元预估股息，对 SAMSUNG USDT 永续合约进行股息调整 | https://foresightnews.pro/news/detail/114169 | — | 第二层丢弃：不改变四件事 | 合约股息调整，不属四件事 | — | — | 丢弃 | exchange.product | metastory.onchain_equity |
| F27 | 09-28 20:46 | LSEG 成为 Canton Network 超级验证节点 | https://foresightnews.pro/news/detail/114168 | — | 第二层丢弃：不改变四件事 | 节点角色 | — | — | 丢弃 | metastory.institutional | — |
| F28 | 09-28 21:03 | OKX 将上线 XDP 永续合约 | https://foresightnews.pro/news/detail/114170 | — | 第一层排除⑤无关山寨 | 山寨合约上新 | — | — | 丢弃 | exchange.listing | — |
| F29 | 09-28 21:06 | Circle 与 Volante 支持银行在现有支付系统中测试 USDC 业务流程 | https://foresightnews.pro/news/detail/114171 | — | 第二层丢弃：不改变四件事 | 合作测试，无上线数据 | — | — | 丢弃 | metastory.stable_rail | metastory.institutional |
| F30 | 09-28 21:14 | 塔斯社：白俄罗斯首批两家加密银行注册为高科技园区入驻企业 | https://foresightnews.pro/news/detail/114172 | — | 通过 | 塔斯社转述；机构未具名、无时间表 | 1/0/1/1/0 | 3 | 丢弃 | metastory.institutional | — |
| F31 | 09-28 21:19 | Tether：今年已协助冻结约 5.5 亿美元与伊朗相关的 USDT | https://foresightnews.pro/news/detail/114173 | 是 | 通过 | Tether 官网（本次已打开） | 2/1/2/1/1 | **7** | **进日报**（合并 R4 Tether/PSI） | policy.enforcement | policy.stable |
| F32 | 09-28 21:24 | Polymarket 公布新 Rust CLOB 开发时间表，做市商测试 11 月开放 | https://foresightnews.pro/news/detail/114174 | — | 第二层丢弃：不改变四件事 | 产品开发时间表 | — | — | 丢弃 | exchange.product | — |
| F33 | 09-28 21:30 | Bitget 美股行情：多数下跌，BitMine 涨 0.04%，CEA Industries 跌 4.46% | https://foresightnews.pro/news/detail/114175 | 是 | 第二层丢弃：不改变四件事 | 加密股涨跌表，无结构变化 | — | — | 丢弃 | macro.equities | people.treasury |
| F34 | 09-28 21:43 | BNB Chain 任命 Thomas Chen 为首席商务官，聚焦机构、稳定币与 RWA | https://foresightnews.pro/news/detail/114176 | — | 第二层丢弃：不改变四件事 | 人事 | — | — | 丢弃 | people.founder | narrative.l1 |
| F35 | 09-28 22:04 | HBAR 短时触及 0.1249 USDT，24 小时涨幅 27.6% | https://foresightnews.pro/news/detail/114177 | 是 | 第一层排除⑤无关山寨 | 单币涨幅 | — | — | 丢弃 | 未归类 | — |
| F36 | 09-28 22:13 | 币安 Alpha 将于 22:30 开放空投领取，门槛为 230 积分 | https://foresightnews.pro/news/detail/114178 | — | 第一层排除②空投 | 空投 | — | — | 丢弃 | exchange.airdrop | strategy.airdrop |
| F37 | 09-28 22:31 | 币安 Alpha 上线 Doppler Finance（XDP） | https://foresightnews.pro/news/detail/114179 | 是 | 第一层排除②空投 | 空投 | — | — | 丢弃 | exchange.airdrop | exchange.listing |
| F38 | 09-28 23:01 | WLFI「启动治理参与激励计划」提案投票通过 | https://foresightnews.pro/news/detail/114180 | 是 | 第一层排除⑤无关山寨 | 单币治理 | — | — | 丢弃 | fundamental.tokenomics | — |
| F39 | 09-28 23:24 | REX-Osprey 多只拟发行加密 ETF 生效日定为 10 月 23 日 | https://foresightnews.pro/news/detail/114181 | — | 通过 | 485BXT 申报（未抽查）；9/24 提交，窗口外；仅推迟生效日 | 1/0/2/0/1 | 4 | inbox | policy.etf | — |
| F40 | 09-29 00:26 | 比特币升破 84000 USDT | https://foresightnews.pro/news/detail/114182 | 是 | 通过 | Bitget 行情转述，无链接 | 2/0/1/1/1 | 5 | inbox（合并 BTC 价格） | ta.sr | — |
| F41 | 09-29 08:30 | 今日恐慌贪婪指数降至 73，市场处于「贪婪状态」 | https://foresightnews.pro/news/detail/114183 | 是 | 第二层丢弃：不改变四件事 | 情绪指数 74→73，无结构变化 | — | — | 丢弃 | 未归类 | — |
| F42 | 09-29 08:39 | Aave App 已支持以太坊主网 USDC 及 USDT 存款 | https://foresightnews.pro/news/detail/114184 | 是 | 第二层丢弃：不改变四件事 | 产品功能 | — | — | 丢弃 | exchange.product | — |
| F43 | 09-29 08:44 | 更正：美参议院民主党人指控 Tether 为伊朗政权的「金融生命线」 | https://foresightnews.pro/news/detail/114185 | 是 | 通过 | 参议院 PSI 报告 PDF（本次已打开）；Foresight 标「更正」 | 2/1/2/1/1 | **7** | **进日报**（合并 R4 Tether/PSI） | policy.enforcement | policy.stable |
| F44 | 09-29 08:49 | 消息人士：Blockchain.com 寻求 5 亿美元 IPO，估值或达 60 亿美元 | https://foresightnews.pro/news/detail/114186 | 是 | 第一层排除③无来源/单方爆料 | 彭博「消息人士」，无第二来源/官方文件 | — | — | 丢弃 | metastory.institutional | — |
| F45 | 09-29 08:56 | 美 SEC 更新加密货币常见问题解答：无中央主体的代币回购通常不构成投资合同 | https://foresightnews.pro/news/detail/114187 | 是 | 通过 | 记者 X 转述；SEC 原文未找到【待核】 | 2/1/1/1/1 | 6 | inbox | policy.sec | fundamental.buyback |
| F46 | 09-29 08:59 | World 基金会完成 4900 万美元 WLD 代币场外销售 | https://foresightnews.pro/news/detail/114188 | — | 第一层排除⑤无关山寨 | 单币场外销售 | — | — | 丢弃 | fundamental.tokenomics | fundamental.unlock |
| F47 | 09-29 09:07 | BUN 市值今晨最高触及 1.19 亿美元，24 小时涨幅 49.85% | https://foresightnews.pro/news/detail/114189 | — | 第一层排除⑤无关山寨 | Meme 币市值 | — | — | 丢弃 | narrative.meme | — |
| F48 | 09-29 09:11 | 某聪明钱疑似清仓 1026 万枚「牛来」，获利超 88.5 万美元 | https://foresightnews.pro/news/detail/114190 | — | 第一层排除⑤无关山寨 | Meme 币地址获利 | — | — | 丢弃 | narrative.meme | onchain.flow |
| F49 | 09-29 09:14 | 比特币跌破 83000 USDT | https://foresightnews.pro/news/detail/114191 | — | 通过 | Bitget 行情转述，无链接 | 2/0/1/1/1 | 5 | inbox（合并 BTC 价格） | ta.sr | — |
| F50 | 09-29 09:19 | 慢雾 CISO：苹果或已修复被用于窃取加密钱包的零日漏洞 | https://foresightnews.pro/news/detail/114192 | — | 通过 | 慢雾 CISO X，「或已修复」措辞；苹果原文未打开 | 1/1/1/1/1 | 5 | inbox | security.hack | — |
| F51 | 09-29 09:21 | Polygon Chain 质押奖励预计将于 10 月 1 日升至 7.7% | https://foresightnews.pro/news/detail/114193 | 是 | 第一层排除⑤无关山寨 | 单链质押收益 | — | — | 丢弃 | infra.staking | fundamental.tokenomics |
| F52 | 09-29 09:33 | Strategy 过去 9 小时内转出 3568 枚 BTC，价值约 2.97 亿美元 | https://foresightnews.pro/news/detail/114194 | — | 通过 | Lookonchain 链上监测；转出目的不明（原推自问「卖出还是换钱包」） | 2/1/1/1/1 | 6 | inbox | onchain.whale | people.treasury |
| F53 | 09-29 09:36 | 香港证监会：持牌虚拟资产交易平台 DFX Labs 汇报 4 个欺诈网站 | https://foresightnews.pro/news/detail/114195 | — | 通过 | 香港证监会可疑平台名单（未抽查）；例行警示 | 1/0/2/1/1 | 5 | inbox | security.phishing | — |
| F54 | 09-29 09:38 | Coinbase 获美 CFTC 批准注册清算机构 Coinbase Clearing | https://foresightnews.pro/news/detail/114196 | — | 通过 | Coinbase 官方博客（本次已打开） | 2/2/2/1/1 | **8** | **进日报**（合并 R2 Coinbase DCO） | policy.cftc | — |
| F55 | 09-29 09:51 | Velodrome 与 Aerodrome 定于 10 月 21 日升级为 Aero，xVELO 须于 10 月 15 日前跨回 OP | https://foresightnews.pro/news/detail/114197 | 是 | 第一层排除⑤无关山寨 | DEX 合并 | — | — | 丢弃 | fundamental.tokenomics | calendar.mainnet |
| F56 | 09-29 09:57 | 某以太坊 OG 再次出售 1000 枚 ETH，价值约 268 万美元 | https://foresightnews.pro/news/detail/114198 | — | 第二层丢弃：不改变四件事 | 单地址卖 1000 ETH，量小 | — | — | 丢弃 | onchain.whale | — |
| F57 | 09-29 10:00 | Arbitrum 基金会推出为期 12 个月的安全计划，预算投入约 780 万美元 | https://foresightnews.pro/news/detail/114199 | — | 第二层丢弃：不改变四件事 | 安全资助计划，非风险事件 | — | — | 丢弃 | security.hack | — |
| F58 | 09-29 10:05 | Bitget BTC 保护基金已流出 3215 枚 BTC，价值约 2.66 亿美元 | https://foresightnews.pro/news/detail/114200 | 是 | 通过 | 链上分析师 X（已核推文存在） | 2/2/2/1/1 | **8** | **进日报**（合并 R1 Bitget） | security.hack | security.withdraw、onchain.flow |
| F59 | 09-29 10:07 | 高盛将国债基金 FTIXX 引入 Avalanche 许可链 Lynq | https://foresightnews.pro/news/detail/114201 | — | 通过 | Avalanche X（非高盛一手） | 1/1/1/1/1 | 5 | inbox（并入试跑 1 C09） | narrative.rwa | metastory.institutional |
| F60 | 09-29 10:19 | Paid 上线网页版手续费申领门户，X Money 打款仍暂停 | https://foresightnews.pro/news/detail/114202 | — | 第一层排除⑤无关山寨 | 小项目 | — | — | 丢弃 | exchange.product | — |
| F61 | 09-29 10:26 | Coinbase 预告应用拆卡包功能：每抽对应一张实体卡，可选择放入保管库或寄出 | https://foresightnews.pro/news/detail/114203 | — | 第二层丢弃：不改变四件事 | 产品预告 | — | — | 丢弃 | exchange.product | — |
| F62 | 09-29 10:36 | NMR 今晨最高触及 15.4 USDT，24 小时涨幅 37.36% | https://foresightnews.pro/news/detail/114204 | — | 第一层排除⑤无关山寨 | 单币涨幅 | — | — | 丢弃 | 未归类 | — |
| F63 | 09-29 10:40 | 7 年前建仓 QNT 的地址时隔三年止盈 9000 枚，价值 199.8 万美元 | https://foresightnews.pro/news/detail/114205 | — | 第一层排除⑤无关山寨 | 单币地址止盈 | — | — | 丢弃 | onchain.whale | — |
| F64 | 09-29 10:58 | USV 合伙人推出 Supertake：可用自然语言观点生成投资组合，计划接入加密及预测市场 | https://foresightnews.pro/news/detail/114206 | 是 | 第二层丢弃：不改变四件事 | AI 投资产品封测，不属四件事 | — | — | 丢弃 | narrative.ai | exchange.product |
| F65 | 09-29 11:09 | ZC 24 小时涨逾 47 倍，市值短时触及 2089 万美元 | https://foresightnews.pro/news/detail/114207 | — | 第一层排除⑤无关山寨 | Meme 币涨幅 | — | — | 丢弃 | narrative.meme | — |
| F66 | 09-29 11:16 | MistTrack：Bitget 攻击者试图通过 Chainflip 转移被盗资金被拒 | https://foresightnews.pro/news/detail/114208 | — | 通过 | MistTrack X（安全公司，已核推文） | 2/2/2/1/1 | **8** | **进日报**（合并 R1 Bitget） | security.hack | onchain.flow |
| F67 | 09-29 11:25 | 某独立调查员协调 Circle 冻结约 20.1 万美元 Bitget 被盗相关资金 | https://foresightnews.pro/news/detail/114209 | 是 | 通过 | 独立调查员 X（已核推文存在）；Circle 未单独确认 | 2/2/2/1/1 | **8** | **进日报**（合并 R1 Bitget） | security.hack | onchain.flow |
| F68 | 09-29 11:29 | PAID 24 小时跌逾 45%，市值降至 1400 万美元下方 | https://foresightnews.pro/news/detail/114210 | — | 第一层排除⑤无关山寨 | 单币跌幅 | — | — | 丢弃 | 未归类 | — |
| F69 | 09-29 11:30 | 某巨鲸卖出 2.5 万枚 ZEC 获利超 2700 万美元，价值约 3784 万美元 | https://foresightnews.pro/news/detail/114211 | — | 第一层排除⑤无关山寨 | 单币巨鲸 | — | — | 丢弃 | onchain.whale | — |
| F70 | 09-29 11:47 | Relay API 曾暴露待处理交易信息致用户被夹，将赔付约 31.2 万美元 | https://foresightnews.pro/news/detail/114212 | — | 通过 | 联创 X；标的不在主线，事件 9/12–26 | 0/0/2/1/1 | 4 | inbox | infra.censorship | security.hack |
| F71 | 09-29 11:53 | Variational 未平仓合约量已突破 20 亿美元 | https://foresightnews.pro/news/detail/114213 | — | 第一层排除⑤无关山寨 | 项目自报数据 | — | — | 丢弃 | narrative.perp_dex | ta.oi |
| F72 | 09-29 12:55 | BlockTower 创始人：Coinbase 曾造成 BlockTower 约 2500 万美元损失 | https://foresightnews.pro/news/detail/114214 | — | 通过 | 单方指控，无公开证据，Coinbase 未回应 | 1/1/0/1/0 | 3 | 丢弃 | security.hack | people.kol |
| F73 | 09-29 13:01 | SharpLink 今日质押 4.2 万枚 ETH，价值约 1.128 亿美元 | https://foresightnews.pro/news/detail/114215 | 是 | 通过 | Lookonchain；质押存量资产，非新增买入 | 2/0/1/1/1 | 5 | inbox | people.treasury | infra.staking |
| F74 | 09-29 13:02 | 比特币现货 ETF 昨日总净流入 3107.06 万美元，持续 8 日净流入 | https://foresightnews.pro/news/detail/114216 | — | 通过 | SoSoValue（被 Cloudflare 拦截）；Farside 已核 | 2/1/2/1/1 | **7** | **进日报**（合并 R3 ETF 资金流） | structure.etf_flow | — |
| F75 | 09-29 13:02 | 以太坊现货 ETF 昨日总净流入 1709.59 万美元，持续 7 日净流入 | https://foresightnews.pro/news/detail/114217 | — | 通过 | SoSoValue（被拦截）；Farside 已核 | 2/1/2/1/1 | **7** | **进日报**（合并 R3 ETF 资金流） | structure.etf_flow | — |
| F76 | 09-29 13:14 | Verona AI 代理稳定币 verUSD 获超 1 亿美元机构启动承诺 | https://foresightnews.pro/news/detail/114218 | — | 第二层丢弃：不改变四件事 | 小项目自报承诺额 | — | — | 丢弃 | narrative.ai | metastory.stable_rail |
| F77 | 09-29 13:27 | 某巨鲸一周内净积累约 2.3 万枚 ZEC，价值约 3170 万美元 | https://foresightnews.pro/news/detail/114219 | — | 第一层排除⑤无关山寨 | 单币巨鲸 | — | — | 丢弃 | onchain.whale | — |
| F78 | 09-29 13:44 | Jumper 将于今日在 Legion 开启 JUMP 代币销售 | https://foresightnews.pro/news/detail/114220 | — | 第一层排除①广告/拉新活动 | 代币销售推广 | — | — | 丢弃 | calendar.tge | — |
| F79 | 09-29 13:51 | Q 日内最低触及 0.02 USDT，24 小时跌幅 29.75% | https://foresightnews.pro/news/detail/114221 | — | 第一层排除⑤无关山寨 | 单币跌幅 | — | — | 丢弃 | 未归类 | — |
| F80 | 09-29 13:57 | 某新建地址于 3 小时内从币安提取 9132 枚 ETH，价值约 2437 万美元 | https://foresightnews.pro/news/detail/114222 | — | 第二层丢弃：不改变四件事 | 单地址提币，无背景 | — | — | 丢弃 | onchain.whale | structure.exchange_flow |
| F81 | 09-29 14:05 | 某新地址从 FalconX 提取 1884 万枚 ENA，价值约 491 万美元 | https://foresightnews.pro/news/detail/114223 | — | 第一层排除⑤无关山寨 | 单币提币 | — | — | 丢弃 | onchain.whale | — |
| F82 | 09-29 14:13 | 韩国执政党议员呼吁推迟加密征税，经济部长称仍将按法案于 2027 年 1 月起征 | https://foresightnews.pro/news/detail/114224 | — | 通过 | 韩国时报转述；维持 2027 起征 | 1/1/1/1/1 | 5 | inbox | people.regulator | — |
| F83 | 09-29 14:14 | Bitget PoolX 上线 ETH 锁仓活动 | https://foresightnews.pro/news/detail/114225 | — | 第一层排除①广告/拉新活动 | 交易所理财活动 | — | — | 丢弃 | exchange.airdrop | — |
| F84 | 09-29 14:48 | Ethlabs：FCR 集成 Chainlink CCIP 2.0，相关跨链场景中以太坊确认可降至 12–24 秒 | https://foresightnews.pro/news/detail/114226 | 是 | 通过 | Ethlabs 公告（未抽查） | 1/0/2/1/1 | 5 | inbox（合并 CCIP/FCR） | narrative.l1 | security.bridge |
| F85 | 09-29 14:49 | 某巨鲸以 5 倍杠杆做多 ZEC，浮亏超 45 万美元 | https://foresightnews.pro/news/detail/114227 | — | 第一层排除⑤无关山寨 | 单币杠杆仓位 | — | — | 丢弃 | onchain.whale | narrative.perp_dex |
| F86 | 09-29 15:05 | Liquid Network：Elements v23.3.4 独立外部审计进行中，Federation 正协调更新 PAK 名单 | https://foresightnews.pro/news/detail/114228 | — | 通过 | Liquid 官方 X（未抽查）；Peg-out 暂停起止【待核】 | 1/1/2/1/1 | 6 | inbox | security.bridge | security.withdraw |
| F87 | 09-29 15:35 | Coinbase 任命 Martin Carrica 为稳定币负责人 | https://foresightnews.pro/news/detail/114229 | — | 第二层丢弃：不改变四件事 | 人事 | — | — | 丢弃 | people.founder | metastory.stable_rail |
| F88 | 09-29 15:55 | 数据：过去 24 小时全网爆仓约 3.76 亿美元，多单爆仓约 2.88 亿美元 | https://foresightnews.pro/news/detail/114230 | — | 通过 | CoinAnk 页面为前端渲染，读不到数字【待核】 | 2/1/1/1/1 | 6 | inbox | ta.liquidation | — |
| F89 | 09-29 16:06 | Bybit 上线 Perp Options 活动 | https://foresightnews.pro/news/detail/114231 | — | 第一层排除①广告/拉新活动 | 交易所活动奖池 | — | — | 丢弃 | exchange.airdrop | exchange.product、metastory.onchain_equity |
| F90 | 09-29 16:08 | Kakao Pay Securities 与 Ondo、Dinari 签约探索代币化 | https://foresightnews.pro/news/detail/114232 | — | 第二层丢弃：不改变四件事 | 谅解备忘录 | — | — | 丢弃 | metastory.onchain_equity | narrative.rwa |
| F91 | 09-29 16:18 | 韩国国民银行与纽约梅隆银行签署数字资产结算合作协议 | https://foresightnews.pro/news/detail/114234 | — | 第二层丢弃：不改变四件事 | 银行合作协议 | — | — | 丢弃 | metastory.institutional | metastory.stable_rail |
| F92 | 09-29 16:20 | Bitget PoolX 上线 ETH 锁仓活动，当前 APR 37.11% | https://foresightnews.pro/news/detail/114235 | 是 | 第一层排除①广告/拉新活动 | 交易所理财活动 | — | — | 丢弃 | exchange.airdrop | — |
| F93 | 09-29 16:50 | 以太坊基金会将于 10 月 6 日在 Sepolia 测试网上激活 Glamsterdam 升级 | https://foresightnews.pro/news/detail/114236 | 是 | 通过 | 以太坊基金会博客，原文 9/17 发布（旧闻） | 2/1/2/0/1 | 6 | inbox | calendar.mainnet | — |

### 分类标注汇总（93 条，按主小类计）

> 补标于 2026-09-30T21:40:00+08:00。每条只计 1 次（按主小类）；副小类不计入下表。包含被排除和丢弃的条目。

**按大类**（只列非零；合计 87 条已归类 + 6 条未归类 = 93）

| 大类 | 条数 | 其中 ≥7 分（快讯条数） |
|---|---|---|
| 1. 宏观与传统金融 | 1 | — |
| 2. 监管、政策与司法 | 6 | 3 |
| 3. 市场结构与资金流 | 2 | 2 |
| 4. 币种与板块叙事 | 9 | — |
| 5. 项目与代币基本面 | 3 | — |
| 6. 技术分析与微观结构 | 3 | — |
| 7. 链上分析 | 10 | — |
| 8. 安全、攻击与风险事件 | 12 | 5 |
| 9. 交易所、产品与交易基础设施 | 15 | — |
| 10. 人物、机构与舆论 | 11 | 2 |
| 11. 矿业、质押与基础设施层 | 3 | — |
| 12. 宏观叙事包装 | 10 | — |
| 13. 日历与事件驱动 | 2 | — |
| 未归类 | 6 | — |
| **合计** | **93** | **12** |

主小类为 0 的大类：14. 组合与策略话题。

≥7 分按**事件**计：2. 监管、政策与司法 2 件（R2、R4）；3. 市场结构与资金流 1 件（R3）；8. 安全、攻击与风险事件 1 件（R1，5 条快讯）；10. 人物、机构与舆论 2 件（R5、R6），合计 6 件 / 12 条快讯。

**按主小类**（只列非零，按大类顺序）

| 大类 | 主小类 id | 小类 | 条数 | 条目 |
|---|---|---|---|---|
| 1. 宏观与传统金融 | macro.equities | 美股联动 | 1 | F33 |
| 2. 监管、政策与司法 | policy.sec | SEC / 执法 | 1 | F45 |
| 2. 监管、政策与司法 | policy.etf | ETF 审批 / 政策 | 1 | F39 |
| 2. 监管、政策与司法 | policy.enforcement | 重大执法 / 和解案 | 3 | F10、F31、F43 |
| 2. 监管、政策与司法 | policy.cftc | CFTC / 衍生品监管 | 1 | F54 |
| 3. 市场结构与资金流 | structure.etf_flow | 现货 ETF 流入 | 2 | F74、F75 |
| 4. 币种与板块叙事 | narrative.l1 | L1 / 公链竞争 | 1 | F84 |
| 4. 币种与板块叙事 | narrative.rwa | RWA / 上链国债 | 2 | F15、F59 |
| 4. 币种与板块叙事 | narrative.perp_dex | Perp DEX | 1 | F71 |
| 4. 币种与板块叙事 | narrative.ai | AI x Crypto | 2 | F64、F76 |
| 4. 币种与板块叙事 | narrative.meme | Meme / 文化币 | 3 | F47、F48、F65 |
| 5. 项目与代币基本面 | fundamental.tokenomics | 代币模型变更 | 3 | F38、F46、F55 |
| 6. 技术分析与微观结构 | ta.liquidation | 爆仓 / 清算 cascade | 1 | F88 |
| 6. 技术分析与微观结构 | ta.sr | 支撑 / 阻力 | 2 | F40、F49 |
| 7. 链上分析 | onchain.whale | 鲸鱼 / 大额转账 | 10 | F05、F11、F52、F56、F63、F69、F77、F80、F81、F85 |
| 8. 安全、攻击与风险事件 | security.hack | 黑客 / 漏洞 exploit | 8 | F01、F13、F50、F57、F58、F66、F67、F72 |
| 8. 安全、攻击与风险事件 | security.phishing | 钓鱼 / 假空投 | 2 | F04、F53 |
| 8. 安全、攻击与风险事件 | security.bridge | 跨链桥风险 | 2 | F21、F86 |
| 9. 交易所、产品与交易基础设施 | exchange.listing | 上市 / 下架 | 3 | F06、F08、F28 |
| 9. 交易所、产品与交易基础设施 | exchange.airdrop | 活动 / 空投 | 7 | F02、F09、F36、F37、F83、F89、F92 |
| 9. 交易所、产品与交易基础设施 | exchange.product | 新产品 / 杠杆档位 | 5 | F26、F32、F42、F60、F61 |
| 10. 人物、机构与舆论 | people.treasury | 财库公司 / DAT | 6 | F03、F16、F18、F22、F24、F73 |
| 10. 人物、机构与舆论 | people.regulator | 监管官员讲话 | 1 | F82 |
| 10. 人物、机构与舆论 | people.founder | 创始人 / 团队动态 | 4 | F07、F23、F34、F87 |
| 11. 矿业、质押与基础设施层 | infra.staking | 质押 / 退出队列 | 2 | F12、F51 |
| 11. 矿业、质押与基础设施层 | infra.censorship | 审查 / MEV | 1 | F70 |
| 12. 宏观叙事包装 | metastory.institutional | 机构化 / 合法化 | 5 | F17、F27、F30、F44、F91 |
| 12. 宏观叙事包装 | metastory.onchain_equity | 链上美股 / RWA 权益 | 2 | F25、F90 |
| 12. 宏观叙事包装 | metastory.stable_rail | 稳定币支付轨道 | 3 | F14、F19、F29 |
| 13. 日历与事件驱动 | calendar.tge | TGE / 上所 | 1 | F78 |
| 13. 日历与事件驱动 | calendar.mainnet | 主网 / 升级 | 1 | F93 |

**未归类（6 条，待用户决定是否补类目）**

| ID | 时间（HKT） | 标题 | 去向 | 为什么归不进 |
|---|---|---|---|---|
| F20 | 09-28 20:09 | ENS Labs 与 GLEIF 探索将 ENS 域名与可验证法人识别编码关联 | 丢弃 | 链上身份（ENS 域名 × 法人识别编码），表中没有「身份/域名」类小类 |
| F35 | 09-28 22:04 | HBAR 短时触及 0.1249 USDT，24 小时涨幅 27.6% | 丢弃 | 单币 24 小时涨跌幅，没有关键位、结构或量价内容，ta.* 各小类都不对应；表中没有「单币行情异动」类 |
| F41 | 09-29 08:30 | 今日恐慌贪婪指数降至 73，市场处于「贪婪状态」 | 丢弃 | 恐慌贪婪指数（情绪指数），表中没有「市场情绪指标」类小类 |
| F62 | 09-29 10:36 | NMR 今晨最高触及 15.4 USDT，24 小时涨幅 37.36% | 丢弃 | 同 F35：单币 24 小时涨跌幅 |
| F68 | 09-29 11:29 | PAID 24 小时跌逾 45%，市值降至 1400 万美元下方 | 丢弃 | 同 F35：单币 24 小时跌幅 |
| F79 | 09-29 13:51 | Q 日内最低触及 0.02 USDT，24 小时跌幅 29.75% | 丢弃 | 同 F35：单币 24 小时跌幅 |

**口径说明（归类时的取舍，供用户复核）**

- 同一事件的多条快讯主小类保持一致（如 Bitget 5 条都是 security.hack），副小类按各条内容补。
- 交易所的活动、理财、奖池类（F02、F09、F83、F89、F92 等）统一归 exchange.airdrop（活动 / 空投）；币安 Alpha 空投（F36、F37）同样归此类。
- 无背景的单地址转账、巨鲸买卖（F05、F11、F56、F63、F69、F77、F80、F81、F85）归 onchain.whale；Strategy 转出 3,568 BTC（F52）也归 onchain.whale，副类 people.treasury。
- Meme 币涨幅（F47 BUN、F65 ZC）归 narrative.meme；非 Meme 的单币涨跌（F35、F62、F68、F79）归不进，标「未归类」。BTC 升破 84,000 / 跌破 83,000（F40、F49）按「整数关口」归 ta.sr。
- 韩国经济部长谈加密征税（F82）：表中没有税收类小类，按「官员口径」归 people.regulator。
- 表中没有「DeFi / 应用产品」类小类，Aave App、Polymarket CLOB、Coinbase 拆卡包、Paid 申领门户（F42、F32、F61、F60）暂归 exchange.product（新产品）；Arbitrum 安全计划（F57）暂归 security.hack（漏洞防护）。这几条都是就近归类，用户如补类目可改。
- 路透「民主党若胜选拟调查」（F10）归 policy.enforcement，但前提（中期选举结果）尚未发生。

### ≥7 分：拟进日报（6 条事件，未凑数）

> 本次 ≥7 分共 **6 条事件**（对应 12 条快讯），在 5–8 条的目标范围内。其中 5 条与试跑 1 的 5 条入选**重复**，已合并（下面注明新增信息）；新增 1 条（BitMine）。每条至少 2 个链接；一手出处都是本次实际打开或读取过的。
>
> 按 `filter.md`「分类标注」，下面 6 条按主小类所在大类分组排列（大类按 categories.md 顺序）；R 编号不变。分类不改变分数。

#### 2. 监管、政策与司法（2 条）

**R2【8 分｜监管】CFTC 批准 Coinbase Clearing LLC 注册为衍生品清算机构（DCO）**（合并试跑 1 第 3 条；可信度由 1 升到 2）
- 分项：2 / 2 / 2 / 1 / 1。
- 分类：主 policy.cftc（2. 监管、政策与司法）；副 —
- Foresight：F54 09-29 09:38 https://foresightnews.pro/news/detail/114196
- 一手出处：Coinbase 官方博客 https://www.coinbase.com/blog/coinbase-receives-cftc-approval-for-coinbase-clearing-llc （页面日期 2026-09-28，无时刻；WebFetch 被 Cloudflare 拦截，改用 curl 读到正文）；第二来源：The Block https://www.theblock.co/news/business/2026-09-28-coinbase-dco-approval-417105 （试跑 1 已打开）。
- 一句话：Coinbase 自有清算所获批，可直接创建并结算全额抵押合约，以 USDC 作抵押、7×24 结算。
- 事实：CFTC 批准注册；Coinbase 由此拥有 FCM + DCM + DCO 全套；保证金类衍生品和即将推出的个股永续仍用现有合作伙伴清算。
- 自述：「首个 USDC 原生清算所」是 Coinbase 自己的说法。
- 未核实：CFTC 官方原文仍未打开。
- 下一步观察：首批自清算产品。

**R4【7 分｜监管·稳定币】美国参议院 PSI 少数党报告点名 USDT；Tether 称 2026 年内协助冻结约 $5.5 亿伊朗相关 USDT**（合并试跑 1 第 4 条）
- 分项：2 / 1 / 2 / 1 / 1。
- 分类：主 policy.enforcement（2. 监管、政策与司法）；副 policy.stable
- Foresight：F31 09-28 21:19 https://foresightnews.pro/news/detail/114173 ；F43 09-29 08:44（标题带「更正」）https://foresightnews.pro/news/detail/114185
- 一手出处：参议院 PSI 报告 PDF https://www.hsgac.senate.gov/wp-content/uploads/2026-09-28-Crypto-and-Irans-Shadow-Banking-Network.pdf （本次重新下载，封面日期 2026-09-28，署名 Ranking Member Richard Blumenthal & Minority Staff）；Tether 官网 https://tether.io/news/tether-has-supported-nearly-550-million-in-iran-linked-usd%e2%82%ae-freezes-as-u-s-expands-sanctions-campaign/ （页面日期 2026-09-28）。
- 一句话：少数党报告指控 USDT 是伊朗影子银行的主要支付工具；Tether 同日发文强调配合执法冻结。
- 事实：报告分析 846 个与伊朗及其代理人相关的被制裁/点名钱包，称 84%「完全或几乎只」用 USDT；NBCTF 名单 757 个钱包中 87%、OFAC 名单 101 个钱包中 57% 以 USDT 为主（PDF 原文已核）。Tether：2026 年 4 月协助冻结两个地址逾 $3.44 亿，7 月四个 TRON 地址逾 $1.3 亿，2026 年内合计约 $5.5 亿。
- 性质：报告结论（如「Tether 已成为伊朗主要非法国际支付系统」）是少数党幕僚的**指控**，不是执法结论；Tether 的数字是其自述。
- 口径更正：试跑 1 写成「过去一年协助冻结近 $550M」，Tether 原文是「During 2026 alone」（2026 年内），以原文为准。
- 下一步观察：司法部/财政部是否回应。

#### 3. 市场结构与资金流（1 条）

**R3【7 分｜市场】美国现货 BTC、ETH ETF 9/28 均净流入：BTC +$31.0M（连续 8 个交易日），ETH +$17.1M（连续 7 个交易日）**（合并试跑 1 第 2 条，新增 ETH 部分）
- 分项：2 / 1 / 2 / 1 / 1。
- 分类：主 structure.etf_flow（3. 市场结构与资金流）；副 —
- Foresight：F74 09-29 13:02 https://foresightnews.pro/news/detail/114216 ；F75 09-29 13:02 https://foresightnews.pro/news/detail/114217
- 一手出处：Farside Investors https://farside.co.uk/btc/ 、https://farside.co.uk/eth/ （2026-09-29 17:03 HKT curl 读取，表中还没有 9/29 行）。Foresight 引的 SoSoValue 页面被 Cloudflare 拦截，**没能打开**。
- 事实（Farside，单位百万美元）：BTC 9/28 IBIT +54.8、FBTC −10.9、GBTC −23.2、BTC Mini +10.3，合计 +31.0；从 9/17 起连续 8 个交易日净流入。ETH 9/28 ETHA +15.4、TETH +1.7，合计 +17.1；从 9/18 起连续 7 个交易日净流入。
- 事实（Foresight 转述 SoSoValue）：BTC 合计 +$3,107.06 万，ETH 合计 +$1,709.59 万，与 Farside 一致（四舍五入差异）。
- 下一步观察：9/29 的流量。

#### 8. 安全、攻击与风险事件（1 条）

**R1【8 分｜安全与风险】Bitget 约 $387.5M 被盗后续：BTC 提币已恢复，被盗资金追踪与冻结**（合并试跑 1 第 1 条）
- 分项：相关 2 / 冲击 2 / 可信 2 / 时效 1 / 可证伪 1。
- 分类：主 security.hack（8. 安全、攻击与风险事件）；副 security.withdraw（Bitget 5 条快讯的逐条副类见候选表）
- Foresight：F01 09-28 17:11 https://foresightnews.pro/news/detail/114143 ；F13 09-28 19:11 https://foresightnews.pro/news/detail/114155 ；F58 09-29 10:05 https://foresightnews.pro/news/detail/114200 ；F66 09-29 11:16 https://foresightnews.pro/news/detail/114208 ；F67 09-29 11:25 https://foresightnews.pro/news/detail/114209
- 一手出处：MistTrack 推文 https://x.com/MistTrack_io/status/2104767013117694156 （安全公司，推文日期 2026-09-29，已通过 oEmbed 读取）；Bitget 官方公告 https://www.bitget.com/support/articles/12560603896110 （试跑 1 已打开，作背景）。
- 一句话：BTC 提币按计划 9/28 16:00 HKT 恢复；攻击者经 Chainflip 转移资金被拒；独立调查员称与 Circle 协调冻结约 $20.1 万。
- 事实：MistTrack 称攻击者尝试经 Chainflip 转移被盗资金，被经纪商拒收并退回，资金**没有被冻结**（安全公司披露）。
- 当事方自述：tanuki42 称与 Circle 协调冻结约 $201k（https://x.com/tanuki42_/status/2104760876389519756 ，推文已读取；Circle 方面没有单独确认）。
- 未核实：① Foresight 转述 CEO 直播（F01，无链接）：截至 9/28 16:50 处理约 7,683 笔 BTC 提现、约 3,609 BTC，直播本身没核；② 链上分析师 @ai_9684xtpa（F58）称保护基金 5,500 BTC 中已流出 3,215.28 BTC，链上数据本次没有独立核对；③ 归因：ZachXBT（F13，推文 2026-09-28 已读取）称洗钱团伙替「被指为朝鲜的攻击者」（alleged DPRK）清洗资金，属**指控**，待正式事件报告。
- 下一步观察：ETH 提币原定 9/29 16:00 HKT 开放；**截至 17:01 HKT，窗口内 Foresight 没有相关快讯，是否按时开放【待核】**；USDT 9/30 16:00 HKT；本周正式调查报告。

#### 10. 人物、机构与舆论（2 条）

**R5【7 分｜市场】Strategy 9/21–27 买入 1,665 BTC，持仓 847,666 BTC**（合并试跑 1 第 5 条）
- 分项：2 / 1 / 2 / 1 / 1。
- 分类：主 people.treasury（10. 人物、机构与舆论）；副 —
- Foresight：F16 09-28 19:58 https://foresightnews.pro/news/detail/114158 （Foresight 的 source_link 是第三方 X 账号，不是一手）
- 一手出处：SEC EDGAR 8-K https://www.sec.gov/Archives/edgar/data/1050446/000119312526403417/mstr-20260914.htm （本次重新打开；Date of Report 2026-09-28）；第二来源：Decrypt https://decrypt.co/379415/strategy-sets-new-btc-holdings-record-after-143m-bitcoin-purchase （试跑 1）。
- 事实：1,665 BTC，合计 $142.7M，均价 $85,681（含费用）；截至 9/27 持有 847,666 BTC，总成本 $63.95B，均价 $75,437；资金来自出售 MSTR 股票。
- 相关但未核实：Lookonchain 称 Strategy 过去 9 小时转出 3,568 BTC（F52，09-29 09:33，https://foresightnews.pro/news/detail/114194 ），原推自己也在问「是卖出还是换钱包」，**目的不明**，单列 6 分 inbox，不并入本条。

**R6【7 分｜市场·ETH】BitMine 上周增持 17,362 ETH，持仓 6,001,302 ETH（约占供应 4.9%）**（新增，试跑 1 没有）
- 分项：2 / 1 / 2 / 1 / 1。
- 分类：主 people.treasury（10. 人物、机构与舆论）；副 —
- Foresight：F24 09-28 20:31 https://foresightnews.pro/news/detail/114166
- 一手出处：BitMine 新闻稿（PR Newswire）https://www.prnewswire.com/apac/news-releases/bitmine-immersion-technologies-bmnr-announces-eth-holdings-reach-over-6-million-tokens-with-total-crypto-cash--marketable-securities-holdings-of-17-2-billion-302891187.html （页面标注「28 Sep, 2026, 20:30 CST」，没写 UTC 偏移；如果是中国标准时间，就是 20:30 HKT，和 Foresight 20:31 发布相符）。第二来源：暂无独立媒体链接（只有 Foresight 转述）。
- 事实（公司公告）：截至 2026-09-27 15:00 ET 持有 6,001,302 ETH（按 $2,698/ETH，Coinbase 价），占 1.221 亿 ETH 供应的 4.9%；上周买入 17,362 ETH；质押 5,067,309 ETH；另有 213 BTC、现金及有价证券 $6.72 亿。
- 观点：Tom Lee 称「加密牛市已在进行」「机构仍低配」，是公司董事长观点，不作事实。
- 下一步观察：下周一周报是否继续买入；距「5%」目标的进度。

**备选（6 分，不进日报，供用户决定）**
- F14 花旗 × Coinbase 企业稳定币收款（09-28 19:31，https://foresightnews.pro/news/detail/114156 ）：并入试跑 1 C08；Foresight 引 WSJ，一手是试跑 1 打开的 Citi 新闻稿；仍没有上线日期，可证伪 0。【主小类 metastory.stable_rail】
- F45 SEC 更新加密 FAQ：无中央主体的代币回购通常不构成投资合同（09-29 08:56，https://foresightnews.pro/news/detail/114187 ）：来源是记者 Eleanor Terrett 推文（2026-09-28，已读取），SEC 原文没找到（搜索只找到 9/25 版 FAQ），可信度 1【待核】。找到 SEC 原文可升到 7。【主小类 policy.sec】
- F52 Strategy 9 小时转出 3,568 BTC（见 R5）：目的不明。【主小类 onchain.whale】
- F86 Liquid Network 启动 Elements v23.3.4 外部审计、更新 PAK 名单（09-29 15:05，https://foresightnews.pro/news/detail/114228 ）：措辞暗示 Peg-out 尚未恢复，暂停起止时间【待核】。【主小类 security.bridge】
- F88 过去 24 小时全网爆仓约 $3.76 亿（多单 $2.88 亿）（09-29 15:55，https://foresightnews.pro/news/detail/114230 ）：CoinAnk 页面是前端渲染，读不到数字，【待核】，可信度 1。注意与试跑 1 的 $511M（TokenPost）统计窗口不同，不能直接比。【主小类 ta.liquidation】
- F93 以太坊 Glamsterdam 10/6 在 Sepolia 激活（09-29 16:50，https://foresightnews.pro/news/detail/114236 ）：以太坊基金会原文 9/17 发布，旧闻，时效 0；进日历，不进日报（同试跑 1 C22）。【主小类 calendar.mainnet】

### 被丢掉的类型举例

| 类型 | 例子（Foresight ID / HKT） | 丢弃原因 |
|---|---|---|
| 交易所活动/拉新 | F02 Bybit ByPick 奖池（09-28 17:12）；F83、F92 Bitget PoolX ETH 锁仓（09-29 14:14 / 16:20，F92 站方标「重要」）；F89 Bybit Perp Options 活动 | 第一层①：活动推广 |
| 空投 | F36、F37 币安 Alpha 空投（09-28 22:13 / 22:31，F37 站方标「重要」）；F09 OKX 闪赚 Lite 瓜分 USDT | 第一层② |
| 「消息人士」/单方指控 | F44 Blockchain.com 拟 IPO（彭博「消息人士」，09-29 08:49，站方「重要」）→ 第一层③；F72 Ari Paul 指控 Coinbase 隐瞒黑客事件（09-29 12:55，无公开证据）→ 打分 3 丢弃 | 无第二来源/无证据 |
| 山寨/Meme 行情与巨鲸 | F35 HBAR +27.6%（站方「重要」）；F47 BUN、F65 ZC 涨 47 倍、F62 NMR、F79 Q；F69/F77/F85 ZEC 巨鲸；F48「牛来」；F63 QNT | 第一层⑤：与主线无关 |
| 山寨合约上新/项目治理 | F08 Bybit KII 永续（站方「重要」）；F28 OKX XDP；F38 WLFI 治理激励、F51 Polygon 质押收益、F55 Velodrome/Aerodrome 合并（均站方「重要」） | 第一层⑤ |
| 热度高但不改变结构 | F41 恐慌贪婪指数 74→73、F33 加密美股涨跌表、F42 Aave App 支持存款、F64 Supertake（均站方「重要」）；F23/F34/F87 人事；F05/F56/F80 单地址转账 | 第二层：不改变四件事 |
| 合作/备忘录/试点 | F17 甲骨文 × Swift、F29 Circle × Volante、F90 Kakao Pay × Ondo、F91 KB × BNY | 第二层：无上线数据，不改变结构 |
| 条件性政治新闻 | F10 路透：民主党若胜选拟调查特朗普家族加密业务 | 打分 3：前提未发生，无观察数据 |

### 站方「重要」vs 我们的筛选

- 站方在窗口内标了 **28 条**「重要」（important_tag：重要消息 20、行情异动 3、交易所动态 2、项目重要进展 2、数据追踪 1）。
- 结果：**8 条进了 ≥7**（对应 4 条事件：Bitget 4 条、Strategy、BitMine、Tether/PSI 2 条）；8 条留 inbox（4–6 分：Compound 指控、花旗 × Coinbase、富兰克林 × Bybit、BTC 升破 84,000、SEC FAQ、SharpLink 质押、Ethlabs FCR、Glamsterdam 旧闻）；**8 条第一层排除**（空投 1、交易所理财活动 1、单币涨幅 1、山寨合约上新 1、山寨项目治理/质押/合并 3、「消息人士」1）；4 条第二层丢弃（恐慌贪婪指数、加密美股涨跌表、Aave App、Supertake）。
- 反过来，我们 6 条 ≥7 事件里有 **2 条站方没标「重要」**：CFTC 批准 Coinbase DCO（F54）、BTC/ETH ETF 资金流（F74、F75）；另外 Bitget 事件里 MistTrack 那条（F66）也没标。
- 结论：站方「重要」更像「热度/编辑推荐」，混有交易所活动、空投和单币行情。按条算，28 条里只有 8 条（约 29%）达到进日报标准；我们 12 条 ≥7 快讯中，站方标了 8 条。所以它可以作参考，但**不能替代**三层漏斗，尤其会漏掉监管和 ETF 数据这类「不热闹但改变结构」的消息。

### 与试跑 1 的重合

| 试跑 1 入选 | 本次对应 | 处理 |
|---|---|---|
| 1. Bitget 约 $387.5M 被盗后续（8） | R1（F01/F13/F58/F66/F67） | 合并；新增 Chainflip 拒收、Circle 冻结、ZachXBT 洗钱线索 |
| 2. BTC ETF 9/28 净流入 $31.0M（7） | R3（F74/F75） | 合并；新增 ETH ETF +$17.1M |
| 3. CFTC 批准 Coinbase DCO（7） | R2（F54） | 合并；找到 Coinbase 官方博客，可信度升 2，总分 8 |
| 4. 参议院 PSI 报告点名 USDT（7） | R4（F31/F43） | 合并；更正「过去一年」→「2026 年内」 |
| 5. Strategy 买入 1,665 BTC（7） | R5（F16） | 合并；另列 F52 转出 3,568 BTC 作未核实观察 |
| — | R6 BitMine（F24） | 本次新增 |
| 试跑 1 inbox：C08 花旗、C09 高盛 FTIXX、C11 Strive、C20 SEC FAQ、C22 Glamsterdam | F14、F59、F18、F45、F93 | 并入原条目，仍在 inbox；F18 Strive 本次有 SEC 8-K 链接，C11 由 4 分升到 5 分 |

### 试跑 2 未核实 / 【待核】

- [ ] Bitget ETH 提币是否已于 9/29 16:00 HKT 开放：截至 17:01 HKT，窗口内没有 Foresight 快讯。
- [ ] Bitget CEO 直播数据（7,683 笔 / 3,609 BTC）、保护基金流出 3,215.28 BTC：只有转述或分析师口径，没有独立核对。
- [ ] Bitget 攻击者归属（ZachXBT 称「被指为朝鲜」）：指控，待正式报告。
- [ ] CFTC 批准 Coinbase DCO 的官方原文：仍未打开。
- [ ] SEC 加密 FAQ 9/28 更新（代币回购「无中央主体」条款）：SEC 原文未找到。
- [ ] CoinAnk 24h 爆仓 $3.76 亿：页面读不到数字。
- [ ] Liquid Network Peg-out 暂停起止时间。
- [ ] Strategy 转出 3,568 BTC 的目的。
- [ ] BitMine 新闻稿「CST」的时区。
- [ ] Foresight id 114233：接口报错，内容未知。

### 局限

1. 只有一个来源（Foresight，二手转述）。X 推文只核了推文存在和内容，链上数据没有独立核对。
2. Foresight 详情页被 EdgeOne 拦截（HTTP 567），链接格式靠收录页和官方 Nostr 帖子核实，本批页面没逐条打开。
3. SoSoValue 被 Cloudflare 拦截、CoinAnk 读不到数据；ETF 改用 Farside 核对，爆仓数字未核。Coinbase 博客 WebFetch 被拦，改用 curl 读取。
4. <7 分的条目没有抽查一手出处，可信度按链接类型给分。
5. `watchlist.md`、`thesis.md` 未提供，相关性按通用主线打分；有了清单后，第一层⑤排除的部分条目（如 SOL、ZEC、HYPE 相关）可能需要重评。
6. 只看了快讯，没看 Foresight 的文章/专栏。站方后续更正或删稿（如 114233）可能改变条目。
7. 窗口内没有 CoinGecko/交易所一手行情，BTC 价格只有 Foresight 转述的 Bitget 报价（F40 09-29 00:26 升破 84,000；F49 09-29 09:14 跌破 83,000），可信度 1，没有进日报。
