Unlock list: PANews 2026-09-20 https://www.panewslab.com/zh/articles/01a0bea7-77b7-742c-8612-2806cba8b182 ; PANews 2026-09-27 https://www.panews.io/articles/01a0e2d7-22b1-76f5-9456-18803fa3ef69 (both citing Token Unlocks/Tokenomist);
Tokenomist digest https://tokenomist.ai/research/weekly-unlock-digest-sep-21-27-2026-xpl-unlocks-63-of-circulating-supply-2 ;
DefiLlama https://defillama.com/unlocks (page __NEXT_DATA__, generated 2026-10-01 11:04 UTC+8) ; BeInCrypto https://cn.beincrypto.com/token-unlocks-to-watch-in-september-october/
Prices: Binance spot 1h klines via https://data-api.binance.vision/api/v3/klines ; CoinGecko https://api.coingecko.com/api/v3/coins/{id}/market_chart?vs_currency=usd&days=16
Price at unlock = open of the 1h candle containing unlock time (Binance) or last CoinGecko hourly point at/before unlock. Pre-7d = same rule at unlock-168h. Now = latest point (~2026-10-01 12:40 UTC+8). BTC benchmark = Binance BTCUSDT over identical windows.

## 代币销毁 (2026-09-24 ~ 2026-10-01, 生成 2026-10-01 18:00 UTC+8)
- Part A 脚本: burn_research/part_a.py → burns_2026-10-01.csv, burns_pre7d_daily_2026-10-01.csv
- HYPE 援助基金成交: api.hyperliquid.xyz/info userFillsByTime / spotClearinghouseState (0xfefe…fe) → burn_research/hype_af_fills.json
- PUMP 每日回购: https://pump.fun/pump-token (页面快照 burn_research/pump_token_page_2026-10-01.html)
- STONK: https://www.odaily.news/zh-CN/newsflash/520269 ; https://www.kucoin.com/news/flash/stonkfun-burns-18-of-stonk-token-supply
- POL tx: https://polygonscan.com/tx/0x5665ea8060681b5a6cf6e79484e29019f158cd827f33f753827e7375b65bbe3a (公共RPC核验 区块94312922 2026-09-23 22:41:29)
- SANC 未执行: Solana getTokenSupply CLoUDKc4Ane7HeQcPpE3YHnznRxhMimJ4MyaUqyHFzAu = 999,991,416 (10/01 17:5x)
- 新闻扫描: PANews universal-api /articles?type=NEWS (1100条), Odaily newsflash 519850-521870 逐ID (burn_research/odaily_519850_521870.json)
- Part B: burn_tracker/ (compare_with_manual.py: 0 differences)
