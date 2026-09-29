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
