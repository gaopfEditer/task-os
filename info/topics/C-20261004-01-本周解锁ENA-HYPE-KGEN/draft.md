# 成稿（draft）

## 元信息
- content_id：C-20261004-01
- 状态：drafting（样稿，供用户评审；不发布）
- related_task：待定（待任务管家创建）
- channel：X（图文贴文；3 条独立主帖，各带可选跟帖）
- 来源标记说明：事实/数据后附来源；无来源的标【待核】；未核实的整段标「未核实」。发布前清零所有【待核】或删除对应内容。
- 字数口径：按 X 加权计数，汉字及全角标点每个计 2，ASCII 字母/数字/半角符号及「·」计 1，「≈」计 2，链接统一计 23（X 自动转 t.co 短链）；非 Premium 上限 280。计数用脚本逐字计算（twitter-text v3 权重区间），换行计 1。
- 价格与流通量口径：CoinGecko，价格 2026-10-04 22:39:40–22:40:00 HKT，流通量 22:38:50–22:39:40 HKT；「占流通」为本稿自算（解锁量 ÷ CoinGecko 流通量）。**发布前须按发布时价格重算美元值**。
- 发送建议：先发 ENA（filter 7 分，10/5 当天事件），再发 HYPE（6 分，用户决定是否发）；KGEN 为 4 分备选稿，默认不发。

> 本文件**只放成稿**。素材与摘录放 research.md，不在这里另存副本。

## 为什么一个选题装 3 条独立帖，不写汇总帖
三条共用同一批数据源（交易观察员解锁页、Tokenomist、DefiLlama、CoinGecko 快照），主题都是「本周解锁的口径分歧」，所以放一个选题。但每个币都要单独交代口径和【待核】点，一条 280 字符的汇总帖装不下；凑满 5 个币还得用 RAIN、ADI 这种只有 CMC 单一来源、核不到的数字。所以写成按时间顺序发的 3 条独立帖。

---

## 帖 A：ENA（主小类 calendar.unlock；副小类 fundamental.tokenomics、fundamental.unlock｜filter 7）

### 主帖（单条，加权 278/280）

```text
$ENA 10/5 HKT剩余投资人代币一次性解锁,多个日历只列1.72亿
· 据Ethena基金会公告,团队仍按原计划
· Tokenomist测算当日≈15亿枚(投资人约14.06亿);按CoinGecko 10/4 22:40 HKT数据≈3.54亿美元,占流通14.9%
为何关注:一次性cliff,接收方为投资人,部分已归基金会(量未披露)
https://ethena.fi/blog/ethena-ecosystem-update
```

逐行来源（不进推文）：
- 第 1 行：「剩余投资人代币一次性解锁」→ Ethena 官方博客 2026-08-27（R-03）「effective 5 October 2026, all remaining original investor unlocks have been accelerated」；「多个日历只列 1.72 亿」→ 交易观察员页/CMC、Tokenomist 代币页、PANews、RootData（R-01、R-06、R-07、R-08）
- 第 2 行：R-03「Team tokens remain fully subject to their original lockup and vesting schedules」
- 第 3 行：≈15 亿、14.06 亿 → Tokenomist Research（R-04，按排期推算，官方未给枚数）；3.54 亿美元 = 1,500,000,000 × $0.236296，14.9% = 1.5B ÷ 10,095,312,500（R-14，自算）
- 第 4 行：一次性 cliff、接收方为投资人 → R-03；「部分已归基金会（量未披露）」→ R-03（基金会 OTC 收购）、R-04「How much of the 1.41B that covers is not disclosed」
- 第 5 行：官方链接（R-03）

### 可选跟帖（optional，2 条，可整串不发）

跟帖 2/（加权 227/280）

```text
2/ 口径:日历上的1.72亿=团队9375万+投资人原月度7812.5万。Ethena未公布最终枚数(博客注明数字待更新),14.06亿是Tokenomist按原排期推算,其中被回购部分解锁给基金会。时刻各家不一:CMC 08:00、Tokenomist/PANews 15:00、RootData 00:00(均HKT)
```

跟帖 3/（加权 163/280）

```text
3/ 另据StablecoinX的SEC 8-K:其所持ENA(Ethena称约占总量20%)锁仓10/5起解除,但出售仍需基金会书面同意,且须提前5个工作日通知、基金会有优先购买权
https://www.sec.gov/Archives/edgar/data/2080215/000121390026100751/ea0305686-8k_stablecoinx.htm
```

跟帖来源：2/ → R-04（9375 万 + 7812.5 万、推算口径）、R-03（「All numbers to be updated」）、R-01（CMC 08:00）、R-06（Tokenomist 07:00Z = 15:00 HKT）、R-07（PANews 15:00）、R-08（RootData 00:00）；3/ → R-05（8-K 原文）、R-03（约占总量 20%）。

---

## 帖 B：HYPE（主小类 calendar.unlock；副小类 onchain.whale、fundamental.unlock｜filter 6，留 inbox 备选，由用户决定是否发）

### 主帖（单条，加权 277/280）

```text
$HYPE 10月团队解锁,两个数对不上
· Tokenomist日历:10/6 08:00 HKT核心贡献者991.7万枚(≈8.92亿美元,占流通4.5%)
· 联创iliensinc(Discord):375万枚10/7分给团队,以OTC方式卖给一家机构(≈3.37亿美元,占流通1.7%)
为何关注:接收方为团队;DefiLlama记录9/6实发约43万枚
CoinGecko价 10/4 22:40 HKT
```

逐行来源（不进推文）：
- 第 1 行：「两个数对不上」为编辑归纳（依据 R-09 与 R-10/R-12）
- 第 2 行：Tokenomist JSON-LD「Next Unlock Date 2026-10-06T00:00:00Z」「9916666 HYPE」「Core Contributors」（R-09）；8.92 亿美元 = 9,916,666 × $89.92，4.5% = ÷ 222,445,714（R-14，自算；Tokenomist 自己写 2.09%，分母是 4.75 亿「已释放」，不用）
- 第 3 行：Foresight News 114377 转述 iliensinc 在官方 Discord 的表态（R-10），Crypto Briefing 佐证（R-12）；3.37 亿美元 = 3,750,000 × $89.92，1.7% 自算（R-14）
- 第 4 行：接收方 → R-09「Core Contributors」、R-10「分配给团队成员」；9/6 实发 433,419 枚 → DefiLlama 链上记录（R-13）
- 第 5 行：价格时间（R-14）

### 可选跟帖（optional，1 条）

跟帖 2/（加权 213/280）

```text
2/ 口径:991.7万是Tokenomist排期推算;375万来自联创Discord表态(经Foresight News等转述,原文未核),余烬监测HyperLabs地址已申请解质押375万枚、约10/7晚到账。买方、价格、锁定期均未披露。下一观察点:10/7后这批HYPE的链上去向
```

跟帖来源：R-09、R-10、R-11（余烬：已申请赎回、10 月 7 日晚上到账）。「转给 Flowdesk」为余烬推测，未写入。

---

## 帖 C：KGEN（主小类 calendar.unlock；副小类 fundamental.unlock｜filter 4，备选稿，默认不发）

### 主帖（单条，加权 260/280）

```text
$KGEN 10/7 TGE满一年,首次团队/投资人cliff
· 3804万枚:团队与顾问2200万+早期购买者1604万(CMC),17:00 HKT
· 约占流通19%(CoinGecko流通1.99亿),≈611万美元(CoinGecko 10/4 22:40 HKT)
为何关注:占流通≥5%,接收方为团队和投资人;官方文档:团队/投资人4年后置释放,满1年解锁10%
```

逐行来源（不进推文）：
- 第 1 行：TGE 2025-10-07 → CryptoRank tge_start_date（R-16）；「首次团队/投资人 cliff」→ 官方排放表团队与早期购买者 TGE 0%（R-15）、交易观察员页 unlock_type = cliff（R-01）
- 第 2 行：38,040,000 = 22,000,000 + 16,040,000、17:00 HKT → CMC（经 R-01）；17:00 仅一家【待核，已在跟帖交代】
- 第 3 行：19% = 38,040,000 ÷ 198,677,778；611 万美元 = 38,040,000 × $0.160586（R-14，自算）
- 第 4 行：占流通 ≥5% → categories.md calendar.unlock「占流通≥5% 必须点明」；官方文档「investor and team vesting is spread over four years with 10% unlocked after Y1」（R-15）

### 可选跟帖（optional，1 条）

跟帖 2/（加权 197/280）

```text
2/ 口径:交易观察员解锁页按CMC写占流通17.1%,按CoinGecko流通量算约19.1%;17:00这一时刻仅CMC给出。Tokenomist、DefiLlama暂未收录KGEN。官方排期表Y1:早期购买者1.6%+团队2.2%(占总量)
https://kgen.gitbook.io/kgen/kgen-whitepaper/kgen-whitepaper/tokenomics
```

跟帖来源：R-01（17.12%）、R-14（19.15%）、R-15（排放表 Y1 1.6%、2.2%）；Tokenomist、DefiLlama 均 404（research 0.1）。

---

## 配图方案（只描述，不生成）

通用规范：每帖 1 张数据卡，16:9（1600×900），白底；顶部标题、中部对比表/条形、底部来源条（灰字小号）。**不放价格、K 线、涨跌幅、方向判断或「抛压」类字眼**；卡片角标「非投资建议｜数据截至 2026-10-04 22:40 HKT」。

### 图 A：ENA「日历数 vs 官方加速后」
- 标题：「ENA 10/5 解锁：日历 1.72 亿 vs 官方加速后约 15 亿（Tokenomist 测算）」
- 左右对比两栏：左「多数日历」171,875,000 枚（团队 9,375 万 + 投资人月度 7,812.5 万）；右「投资人一次性加速后（测算）」≈1,500,000,000 枚（投资人 ≈14.06 亿 + 团队 0.94 亿），右栏加「官方未公布最终枚数」角标。
- 横向条：占流通 1.7% vs 14.9%（分母 CoinGecko 流通 100.95 亿）。
- 接收方小饼：投资人（含已被基金会收购部分，量未披露）/ 团队。
- 时刻条（灰）：CMC 08:00｜Tokenomist、PANews 15:00｜RootData 00:00（HKT），标「待核」。
- 脚注一行：StablecoinX（约占总量 20%）锁仓 10/5 起解除，出售须基金会书面同意 + 提前 5 个工作日通知（SEC 8-K）。
- 来源行：Ethena 官方博客 2026-08-27｜Tokenomist Research 2026-09-01｜SEC 8-K（StablecoinX）｜CoinGecko 10/4 22:40 HKT

### 图 B：HYPE「三个数」
- 标题：「HYPE 10 月团队解锁：三个口径」
- 三列卡：① Tokenomist 排期：10/6 08:00 HKT，991.7 万枚，占流通 4.5%，≈8.92 亿美元；② 联创 Discord（经转述）：375 万枚，10/7 分给团队，OTC 卖给一家机构，占流通 1.7%，≈3.37 亿美元；③ DefiLlama 链上：9/6 实发 433,419 枚（参照）。
- 底部小柱图：DefiLlama 记录的 2025-11-29 至 2026-09-06 每月核心贡献者分发量（11 根柱，数值见 research R-13），10 月一栏留空标「待链上确认」。
- 状态条：「买方、价格、锁定期未披露」
- 来源行：Tokenomist｜Foresight News（转述 iliensinc）｜DefiLlama｜CoinGecko 10/4 22:40 HKT

### 图 C：KGEN「TGE 满一年 cliff」
- 标题：「KGEN 10/7：首次团队/投资人解锁」
- 分段条：3,804 万枚 = 团队与顾问 2,200 万 + 早期购买者 1,604 万。
- 两个百分比并列：占流通 17.1%（CMC 口径）｜19.1%（CoinGecko 口径）。
- 官方排期小表（占总量）：早期购买者 16% → Y1 1.6%；团队与顾问 22% → Y1 2.2%；释放节奏 10%/20%/30%/40%（Y1–Y4 末）。
- 来源行：KGeN 官方文档｜CMC（经交易观察员解锁页）｜CoinGecko 10/4 22:40 HKT；17:00 HKT 标「仅 CMC」

---

## 自查清单

- [x] 每个数字都能追到来源：ENA → R-03/R-04/R-05/R-14；HYPE → R-09/R-10/R-11/R-13/R-14；KGEN → R-01/R-14/R-15/R-16。自算数（美元值、占流通）均注明 CoinGecko 价格/流通量时间
- [x] 时间均为 HKT：Tokenomist 07:00Z→15:00、00:00Z→08:00；ENA 主帖只写日期（钟点各家不一，跟帖列出）
- [x] 无买卖建议、无目标价、无涨跌预测；「为何关注」只写供给侧事实（占流通、接收方、cliff）
- [x] 未核实内容的处理：ENA 最终枚数以「Tokenomist 测算」限定，HYPE 375 万以「联创 Discord（经转述，原文未核）」限定，KGEN 17:00 注明仅 CMC；Flowdesk 推测、StablecoinX 30.3 亿枚、RAIN/ADI 数字均未进正文
- [x] 观点与事实分开：「两个数对不上」「多个日历只列 1.72 亿」为编辑归纳，已在逐行来源注明依据
- [x] 主帖 278 / 277 / 260，跟帖 227 / 163 / 213 / 197，均 ≤280
- [x] 每帖标签 1 个（$ENA / $HYPE / $KGEN），≤2
- [x] KGEN 占流通 ≥5% 已点明（categories.md calendar.unlock）
- [ ] 发布前需复查：① 按发布时 CoinGecko 价格重算美元值并改价格时间；② Ethena 是否已公布最终解锁枚数/时刻；③ 10/7 后 DefiLlama 是否记录到 HYPE 实际分发量（如已发生，帖 B 需改写为事后口径）；④ KGEN 是否已被 Tokenomist/DefiLlama 收录；⑤ 事件已过则删去「将」类表述或改为事后稿
