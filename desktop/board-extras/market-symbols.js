(function (global) {
  'use strict';

  var CG_IDS = {
    BTCUSDT: 'bitcoin',
    ETHUSDT: 'ethereum',
    SOLUSDT: 'solana',
    BNBUSDT: 'binancecoin',
    DOGEUSDT: 'dogecoin',
    XRPUSDT: 'ripple',
    ADAUSDT: 'cardano',
    AVAXUSDT: 'avalanche-2',
    LINKUSDT: 'chainlink',
    DOTUSDT: 'polkadot',
    LTCUSDT: 'litecoin',
    TRXUSDT: 'tron',
    PEPEUSDT: 'pepe',
    SHIBUSDT: 'shiba-inu',
    TONUSDT: 'the-open-network',
    UAIUSDT: 'unifai-network'
  };

  var CRYPTO_KNOWN = Object.create(null);
  Object.keys(CG_IDS).forEach(function (pair) {
    CRYPTO_KNOWN[pair.replace(/USDT$/i, '')] = true;
  });
  ['USDT', 'USDC', 'FDUSD', 'HYPE', 'ENA', 'WIF', 'BONK', 'UNI', 'MATIC', 'POL', 'KGEN', 'XAU'].forEach(function (s) {
    CRYPTO_KNOWN[s] = true;
  });

  var BINANCE_DATA = 'https://data-api.binance.vision/api/v3/ticker/price?symbol=';
  var BINANCE_COM = 'https://api.binance.com/api/v3/ticker/price?symbol=';
  var BINANCE_FAPI = 'https://fapi.binance.com/fapi/v1/ticker/price?symbol=';
  var BINANCE_FAPI_V2 = 'https://fapi.binance.com/fapi/v2/ticker/price?symbol=';
  var BINANCE_FAPI_MARK = 'https://fapi.binance.com/fapi/v1/premiumIndex?symbol=';
  var GATE_FUTURES = 'https://api.gateio.ws/api/v4/futures/usdt/tickers?contract=';
  var GATE_SPOT = 'https://api.gateio.ws/api/v4/spot/tickers?currency_pair=';
  var COINGECKO = 'https://api.coingecko.com/api/v3/simple/price?ids=';
  var EASTMONEY_LIST = 'https://push2.eastmoney.com/api/qt/ulist.np/get';

  function normalizeBase(sym) {
    sym = String(sym || '').trim().toUpperCase();
    if (sym.endsWith('USDT')) sym = sym.slice(0, -4);
    return sym;
  }

  function parseSymbols(csv) {
    return String(csv || '')
      .split(/[,，\s]+/)
      .map(function (x) { return normalizeBase(x); })
      .filter(Boolean)
      .map(function (sym) { return sym + 'USDT'; });
  }

  function displaySym(pair) {
    if (String(pair).toUpperCase() === 'XAUUSDT') return 'XAU';
    return String(pair).replace(/USDT$/i, '');
  }

  function coingeckoIdForPair(pair) {
    return CG_IDS[String(pair).toUpperCase()] || null;
  }

  function isTradfiTicker(sym) {
    sym = normalizeBase(sym);
    if (CRYPTO_KNOWN[sym]) return false;
    return /^[A-Z]{2,5}$/.test(sym);
  }

  function tauriInvoke() {
    var t = global.__TAURI__;
    if (!t || !t.core || !t.core.invoke) return null;
    return t.core.invoke.bind(t.core);
  }

  /** Gate 无 CORS；币安 fapi 在 1420 开发页常 451/CORS —— 走 Tauri 或 dev /__market。 */
  function marketFetchNeedsProxy(url) {
    try {
      var u = new URL(url);
      if (u.hostname === 'api.gateio.ws') return true;
      if (u.hostname === 'fapi.binance.com') return true;
      return false;
    } catch (e) {
      return false;
    }
  }

  function fetchJsonBrowser(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    });
  }

  function parseMarketHttpBody(res) {
    var status = res && res.status;
    var body = res && res.body;
    if (status == null || status < 200 || status >= 300) {
      throw new Error(String(status || 'market_http'));
    }
    try {
      return JSON.parse(body);
    } catch (e) {
      throw new Error('market bad json');
    }
  }

  function fetchJsonViaDevServer(url) {
    var loc = global.location;
    if (!loc || (loc.hostname !== '127.0.0.1' && loc.hostname !== 'localhost')) {
      return Promise.reject(new Error('no dev market proxy'));
    }
    if (String(loc.port || '') !== '1420') {
      return Promise.reject(new Error('no dev market proxy'));
    }
    var proxyUrl = loc.origin + '/__market?url=' + encodeURIComponent(url);
    return fetch(proxyUrl, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    }).then(parseMarketHttpBody);
  }

  function fetchJsonViaProxy(url) {
    var invoke = tauriInvoke();
    var pending = invoke
      ? invoke('market_http_get', { url: url }).then(parseMarketHttpBody)
      : Promise.reject(new Error('no tauri'));
    return pending.catch(function () { return fetchJsonViaDevServer(url); });
  }

  function fetchJson(url) {
    if (marketFetchNeedsProxy(url)) return fetchJsonViaProxy(url);
    return fetchJsonBrowser(url);
  }

  function rejectBinanceBlocked(j) {
    if (!j || typeof j !== 'object') return;
    if (j.price != null || j.markPrice != null || j.indexPrice != null) return;
    if (j.msg != null && String(j.msg).trim()) {
      throw new Error(String(j.msg));
    }
  }

  function numFrom(j, keys) {
    rejectBinanceBlocked(j);
    for (var i = 0; i < keys.length; i++) {
      var p = parseFloat(j[keys[i]]);
      if (isFinite(p)) return p;
    }
    throw new Error('bad price');
  }

  function fetchBinanceSpot(pair) {
    function one(url) {
      return fetchJson(url + pair).then(function (j) {
        return numFrom(j, ['price']);
      });
    }
    return one(BINANCE_DATA).catch(function () { return one(BINANCE_COM); });
  }

  function fetchBinanceMark(pair) {
    return fetchJson(BINANCE_FAPI_MARK + pair).then(function (j) {
      return numFrom(j, ['markPrice', 'indexPrice']);
    });
  }

  function fetchBinanceFutures(pair) {
    return fetchJson(BINANCE_FAPI + pair)
      .then(function (j) { return numFrom(j, ['price']); })
      .catch(function () {
        return fetchJson(BINANCE_FAPI_V2 + pair).then(function (j) {
          return numFrom(j, ['price']);
        });
      })
      .catch(function () {
        if (tauriInvoke()) return fetchBinanceMark(pair);
        throw new Error('binance futures');
      });
  }

  function fetchGateFutures(base) {
    base = normalizeBase(base);
    return fetchJson(GATE_FUTURES + base + '_USDT').then(function (j) {
      var row = Array.isArray(j) ? j[0] : j;
      var p = row && parseFloat(row.mark_price != null ? row.mark_price : row.last);
      if (!isFinite(p)) throw new Error('bad gate futures price');
      return p;
    });
  }

  function fetchGateSpot(base) {
    base = normalizeBase(base);
    return fetchJson(GATE_SPOT + base + '_USDT').then(function (rows) {
      var row = rows && rows[0];
      var p = row && parseFloat(row.last);
      if (!isFinite(p)) throw new Error('bad gate price');
      return p;
    });
  }

  function fetchEastmoneyTradfi(ticker) {
    ticker = normalizeBase(ticker);
    var url = EASTMONEY_LIST + '?fltt=2&fields=f12,f2&secids=' + encodeURIComponent('105.' + ticker);
    return fetchJson(url).then(function (j) {
      var diff = j.data && j.data.diff;
      var row = diff && diff[0];
      var p = row && row.f2 != null ? Number(row.f2) : NaN;
      if (!isFinite(p)) throw new Error('bad tradfi price');
      return p;
    });
  }

  function fetchCoingeckoSingle(pair) {
    var id = coingeckoIdForPair(pair);
    if (!id) return Promise.reject(new Error('no cg id'));
    return fetchJson(COINGECKO + id + '&vs_currencies=usd').then(function (j) {
      var p = j[id] && j[id].usd;
      if (p == null || !isFinite(Number(p))) throw new Error('no cg price');
      return Number(p);
    });
  }

  /**
   * Binance U 本位合约（最新价 / 标记价）→ Gate U 本位（标记价）→ Gate 现货 → CoinGecko → 东方财富(仅美股/ETF)。
   * 桌面端走 Rust 代理，避免 Gate 等无 CORS 头。
   */
  function fetchExchangePrice(pair) {
    var base = normalizeBase(pair);
    var fetchPair = String(pair).toUpperCase();
    var steps;
    if (fetchPair === 'XAUUSDT') {
      // 币安 U 本位永续符号为 XAUUSDT（fapi）；不可用再 Gate XAU_USDT 合约。
      steps = [
        function () { return fetchBinanceFutures(fetchPair); },
        function () { return fetchBinanceMark(fetchPair); },
        function () { return fetchGateFutures('XAU'); }
      ];
    } else {
      steps = [
        function () { return fetchBinanceFutures(fetchPair); },
        function () { return fetchGateFutures(base); },
        function () { return fetchGateSpot(base); },
        function () { return fetchCoingeckoSingle(fetchPair); }
      ];
    }
    if (isTradfiTicker(base)) {
      steps.push(function () { return fetchEastmoneyTradfi(base); });
    }
    var chain = Promise.reject(new Error('start'));
    steps.forEach(function (step) {
      chain = chain.catch(step);
    });
    return chain;
  }

  function fetchCoinGeckoPrices(pairs) {
    var idToPair = Object.create(null);
    var ids = [];
    pairs.forEach(function (pair) {
      var id = coingeckoIdForPair(pair);
      if (id && ids.indexOf(id) < 0) {
        ids.push(id);
        idToPair[id] = pair;
      }
    });
    if (!ids.length) return Promise.resolve(Object.create(null));
    return fetchJson(COINGECKO + ids.join(',') + '&vs_currencies=usd').then(function (j) {
      var out = Object.create(null);
      ids.forEach(function (id) {
        var p = idToPair[id];
        var v = j[id] && j[id].usd;
        if (p && v != null) out[p] = Number(v);
      });
      return out;
    });
  }

  function fetchBinancePrice(pair) {
    return fetchExchangePrice(pair);
  }

  global.TaskOsQuotes = {
    CG_IDS: CG_IDS,
    parseSymbols: parseSymbols,
    displaySym: displaySym,
    coingeckoIdForPair: coingeckoIdForPair,
    isTradfiTicker: isTradfiTicker,
    fetchExchangePrice: fetchExchangePrice,
    fetchBinancePrice: fetchBinancePrice,
    fetchCoinGeckoPrices: fetchCoinGeckoPrices
  };
})(typeof window !== 'undefined' ? window : globalThis);