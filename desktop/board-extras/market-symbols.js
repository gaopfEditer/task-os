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
  ['USDT', 'USDC', 'FDUSD', 'HYPE', 'ENA', 'WIF', 'BONK', 'UNI', 'MATIC', 'POL', 'KGEN'].forEach(function (s) {
    CRYPTO_KNOWN[s] = true;
  });

  var BINANCE_DATA = 'https://data-api.binance.vision/api/v3/ticker/price?symbol=';
  var BINANCE_COM = 'https://api.binance.com/api/v3/ticker/price?symbol=';
  var BINANCE_FAPI = 'https://fapi.binance.com/fapi/v1/ticker/price?symbol=';
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
    return String(pair).replace(/USDT$/i, '');
  }

  function coingeckoIdForPair(pair) {
    return CG_IDS[String(pair).toUpperCase()] || null;
  }

  /** 美股/ETF 代码（非链上币种），Binance 现货通常无对，需走其它行情源 */
  function isTradfiTicker(sym) {
    sym = normalizeBase(sym);
    if (CRYPTO_KNOWN[sym]) return false;
    return /^[A-Z]{2,5}$/.test(sym);
  }

  function fetchJson(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error(String(r.status));
      return r.json();
    });
  }

  function fetchBinanceSpot(pair) {
    function one(url) {
      return fetchJson(url + pair).then(function (j) {
        var p = parseFloat(j.price);
        if (!isFinite(p)) throw new Error('bad price');
        return p;
      });
    }
    return one(BINANCE_DATA).catch(function () { return one(BINANCE_COM); });
  }

  function fetchBinanceFutures(pair) {
    return fetchJson(BINANCE_FAPI + pair).then(function (j) {
      var p = parseFloat(j.price);
      if (!isFinite(p)) throw new Error('bad price');
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
   * 按优先级拉价：Binance 现货 → Binance U 本位合约 → Gate 现货 → CoinGecko →
   * （仅 tradfi 代码）东方财富美股/ETF。
   */
  function fetchExchangePrice(pair) {
    var base = normalizeBase(pair);
    var steps = [
      function () { return fetchBinanceSpot(pair); },
      function () { return fetchBinanceFutures(pair); },
      function () { return fetchGateSpot(base); },
      function () { return fetchCoingeckoSingle(pair); }
    ];
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

  /** @deprecated 使用 fetchExchangePrice */
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
