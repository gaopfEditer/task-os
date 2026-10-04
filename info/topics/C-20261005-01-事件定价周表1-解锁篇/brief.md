# 选题简报（brief）

- content_id：C-20261005-01
- 标题：事件定价周表 #1（解锁篇）
- 状态：drafting（样稿，供用户评审；不发布）
- related_task：待任务管家创建
- 栏目：事件定价
- channel：X 长推（Premium）+ 币安广场长文（同一正文）
- 数据来源：sources.md MKT-01「交易观察员已核事件表（trading-watch）」——/workspace/trading-watch/unlocks_2026-10-01.csv（快照 sources/unlocks_2026-10-01.snapshot-20261005.csv）；该来源 2026-10-05 登记为已确认（经出海大师转达用户确认）
- 分类（categories.md）：主小类 fundamental.unlock；副小类 calendar.unlock（两个 id 均已在 categories.md 核到）
- 模板：templates/事件定价周表.md（本篇为第 1 期）

## 读者
关注代币解锁、想知道「解锁前后价格实际怎么走」的币圈读者。他们常看到「下周大额解锁」类预告，但很少看到解锁过后的实际数据；同一笔解锁在不同平台的时间、数量、占流通比例还可能不一样（本期 XPL）。

## 一句话结论
同一周 14 个解锁，事前事后走势差别很大，单周样本不能当规律用。（已对照数据：解锁后 8 涨 6 跌，-12.78% 到 +11.47%；解锁前 7 天 10 涨 4 跌，-25.56% 到 +76.01%。数据不与结论矛盾，措辞未改。）

## 形式
- [ ] 短讯
- [x] 深度（长文：1 条 X 长推，同文可发币安广场长文 + 1 张表格图）
- [ ] 脚本

另备：≤280 加权字符的短版主帖 + 2 条跟帖（给非 Premium 账号用，全表放图里）。

## 渠道
X（长推，超过 280 加权字符，需 X Premium）；币安广场（长文）。

## 必引来源
- 已核表：/workspace/trading-watch/unlocks_2026-10-01.csv（unlock_source、price_source 两列）
- unlock_source = PANews/Tokenomist（10 行）：
  - PANews 2026-09-20 快讯（SOSO、H、BIGTIME、XPL、STBL）：https://www.panewslab.com/zh/articles/01a0bea7-77b7-742c-8612-2806cba8b182
  - PANews 2026-09-27 快讯（FF、CARDS、KMNO、SUI、EIGEN）：https://www.panewslab.com/zh/articles/01a0e2d7-22b1-76f5-9456-18803fa3ef69 （trading-watch SOURCES.md 写的是同文英文版 https://www.panews.io/articles/01a0e2d7-22b1-76f5-9456-18803fa3ef69 ）
  - Tokenomist 周报（XPL 63%）：https://tokenomist.ai/research/weekly-unlock-digest-sep-21-27-2026-xpl-unlocks-63-of-circulating-supply-2
- unlock_source = DefiLlama（4 行：ALT、GRASS、ZORA、GUN）：https://defillama.com/unlocks
- price_source：Binance spot 1h klines（https://data-api.binance.vision/api/v3/klines ，8 行）；CoinGecko market_chart days=16 hourly（https://api.coingecko.com/api/v3/coins/{id}/market_chart?vs_currency=usd&days=16 ，6 行）；BTC 基准 Binance BTCUSDT
- XPL 冲突案例：Tokenomist 口径 → PANews 9/20 快讯 + Tokenomist 周报（链接同上）；DefiLlama 口径 → https://defillama.com/unlocks/plasma （trading-watch unlock_tracker 输出的 source_urls）

## 参考竞品
- 待填（本期未做竞品检索）。同题材的「下周解锁」预告：PANews 9/20、9/27 快讯（见必引来源），均为事前预告，没有事后价格。

## 截止
待定（由任务管家排期）。

## 不写什么
- 不写为什么涨/为什么跌（不归因）
- 不算平均数、中位数等派生统计（MKT-01 规则：不做推算）；只写涨跌个数和区间
- 不补样本：已核表之外的解锁（如 tracker 测试输出里的 WAL、B2、MEGA、MAV）不进表
- 不改价位，不用 tracker 的 DefiLlama 锚点重算 XPL 涨跌
- 不写 ENA、HYPE、KGEN 的 10/5–10/7 解锁（C-20261004-01 已覆盖，且本篇只写已发生的 09-24～10-01）
- 不写下一周会怎样、不写「解锁必跌/必涨」之类规律

## 禁止项
- 不编造数据、来源、案例
- 不假装已发布
- 未核实的事实必须标【待核】
- 不写买卖建议、价格目标、仓位；不写规律性断言（如「解锁必跌」）
