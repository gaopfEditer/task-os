(function () {
  'use strict';
  if (!(window.__TAURI__ && window.__TAURI__.core)) return;

  var WATCH_KEY = 'taskos.desktop.watchlist';
  var ALERTS_KEY = 'taskos.desktop.alerts';
  var RELAY_BASE_KEY = 'taskos.desktop.priority.baseUrl';
  var RELAY_SECRET_KEY = 'taskos.desktop.priority.secret';
  var RELAY_DEFAULT_BASE = 'https://op.g.ezcoin.ink';
  var RELAY_DEFAULT_SOURCE = '胖猫社区';
  var DEFAULT_WATCH = 'BTC,ETH,SOL';
  var Q = window.TaskOsQuotes;
  if (!Q) return;
  var POLL_MS = 3 * 60 * 1000;

  var pollTimer = null;
  var pollGen = 0;
  var prices = Object.create(null);
  var prevPrices = Object.create(null);
  var lastPollAt = null;

  function invoke(cmd, payload) {
    return window.__TAURI__.core.invoke(cmd, payload || {});
  }

  function loadWatchlist() {
    try {
      var s = localStorage.getItem(WATCH_KEY);
      if (s != null && String(s).trim()) {
        s = String(s).trim();
        if (s === 'BTC,ETH,SOL' || s === 'BTC,ETH,QQQ,SOL') return DEFAULT_WATCH;
        return s;
      }
    } catch (e) {}
    return DEFAULT_WATCH;
  }

  function saveWatchlist(s) {
    try { localStorage.setItem(WATCH_KEY, s); } catch (e) {}
  }

  function parseSymbols(csv) {
    return Q.parseSymbols(csv);
  }

  function displaySym(pair) {
    return Q.displaySym(pair);
  }

  function loadAlerts() {
    try {
      var raw = localStorage.getItem(ALERTS_KEY);
      if (!raw) return [];
      var list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
  }

  function saveAlerts(list) {
    try { localStorage.setItem(ALERTS_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function normalizeRelayBase(raw) {
    var s = String(raw || '').trim();
    if (!s) return '';
    try {
      var u = new URL(s);
      if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
      if (u.username || u.password) return '';
      var path = u.pathname.replace(/\/+$/, '');
      if (path === '/') path = '';
      return u.origin + path;
    } catch (e) {
      return '';
    }
  }

  function storedRelayBase() {
    try {
      return localStorage.getItem(RELAY_BASE_KEY);
    } catch (e) {
      return null;
    }
  }

  function relayBaseForForm(stored) {
    var raw = stored == null ? '' : String(stored).trim();
    if (!raw) return RELAY_DEFAULT_BASE;
    return normalizeRelayBase(raw) || raw;
  }

  function lockRelaySource() {
    var el = document.getElementById('tcRelaySources');
    if (!el) return;
    el.value = RELAY_DEFAULT_SOURCE;
    el.disabled = true;
    el.readOnly = true;
    el.tabIndex = -1;
    el.setAttribute('aria-readonly', 'true');
  }

  function fillRelayForm() {
    var secret = '';
    try {
      secret = localStorage.getItem(RELAY_SECRET_KEY) || '';
    } catch (e) {}
    var baseInput = document.getElementById('tcRelayBase');
    var secretInput = document.getElementById('tcRelaySecret');
    if (baseInput) baseInput.value = relayBaseForForm(storedRelayBase());
    if (secretInput) secretInput.value = secret;
    lockRelaySource();
  }

  function uid() {
    return 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function fmtPrice(n) {
    var x = Number(n);
    if (!isFinite(x)) return '—';
    if (x >= 1000) return x.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (x >= 1) return x.toLocaleString(undefined, { maximumFractionDigits: 4 });
    return x.toLocaleString(undefined, { maximumFractionDigits: 6 });
  }

  function fmtTime(d) {
    if (!d) return '';
    try {
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return ''; }
  }

  function notifyAlert(sym, price, target, op) {
    var dir = op === 'gte' ? '≥' : '≤';
    var title = 'Task OS · ' + sym + ' 价格提醒';
    var body = displaySym(sym) + ' 现价 ' + fmtPrice(price) + '，已触及目标 ' + dir + ' ' + fmtPrice(target);
    invoke('show_price_alert', { title: title, body: body }).catch(function () {});
  }

  function checkAlerts(pair, priceStr) {
    var price = parseFloat(priceStr);
    if (!isFinite(price)) return;
    var list = loadAlerts();
    var changed = false;
    list.forEach(function (a) {
      if (!a || !a.active) return;
      var ap = parseSymbols(a.symbol)[0];
      if (!ap || ap !== pair) return;
      var target = Number(a.target);
      if (!isFinite(target)) return;
      var hit = a.op === 'lte' ? price <= target : price >= target;
      if (hit) {
        notifyAlert(pair, price, target, a.op || 'gte');
        a.active = false;
        a.triggeredAt = new Date().toISOString();
        changed = true;
      }
    });
    if (changed) saveAlerts(list);
    renderAlertsList();
  }

  function applyPrice(pair, close) {
    if (prices[pair] != null) prevPrices[pair] = prices[pair];
    prices[pair] = parseFloat(close);
    checkAlerts(pair, close);
  }

  function priceChipHtml(pair) {
    var p = prices[pair];
    var prev = prevPrices[pair];
    var cls = '';
    if (p != null && prev != null) cls = p >= prev ? 'up' : 'down';
    var text = p != null ? fmtPrice(p) : '…';
    return '<span class="tc-chip"><b>' + displaySym(pair) + '</b> <span class="' + cls + '">' + text + '</span></span>';
  }

  function renderPrices() {
    var el = document.getElementById('tcPrices');
    if (!el) return;
    var syms = parseSymbols(loadWatchlist());
    if (!syms.length) {
      el.innerHTML = '<span class="tc-status">未设置关注列表</span>';
      return;
    }
    el.innerHTML = syms.map(priceChipHtml).join('');
    if (el._markScrollable) el._markScrollable();
  }

  function renderAllPrices() {
    renderPrices();
  }

  function setStatus() {}

  function stopPolling() {
    pollGen++;
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function pollOnce(syms, gen) {
    if (!syms.length) return Promise.resolve();
    setStatus('拉取行情…');
    return Promise.all(syms.map(function (pair) {
      return Q.fetchExchangePrice(pair)
        .then(function (p) { applyPrice(pair, p); })
        .catch(function () {});
    }))
      .then(function () {
        if (gen !== pollGen) return;
        var missing = syms.filter(function (p) { return prices[p] == null; });
        if (!missing.length) return;
        return Q.fetchCoinGeckoPrices(missing)
          .then(function (map) {
            missing.forEach(function (pair) {
              if (map[pair] != null) applyPrice(pair, map[pair]);
            });
          })
          .catch(function () {});
      })
      .then(function () {
        if (gen !== pollGen) return;
        lastPollAt = new Date();
        renderAllPrices();
      });
  }

  function startPolling() {
    stopPolling();
    var gen = pollGen;
    var syms = parseSymbols(loadWatchlist());
    if (!syms.length) {
      setStatus('无交易对');
      renderAllPrices();
      return;
    }
    pollOnce(syms, gen);
    pollTimer = setInterval(function () {
      pollOnce(parseSymbols(loadWatchlist()), gen);
    }, POLL_MS);
  }

  function renderAlertsList() {
    var ul = document.getElementById('tcAlertsList');
    if (!ul) return;
    var list = loadAlerts().filter(function (a) { return a && a.active; });
    if (!list.length) {
      ul.innerHTML = '<li class="tc-status">暂无进行中的提醒</li>';
      return;
    }
    ul.innerHTML = list.map(function (a) {
      var sym = parseSymbols(a.symbol)[0] || a.symbol;
      var op = a.op === 'lte' ? '≤' : '≥';
      return '<li>' + displaySym(sym) + ' ' + op + ' ' + fmtPrice(a.target) +
        ' <button type="button" class="link" data-tc-del="' + a.id + '">删除</button></li>';
    }).join('');
    ul.querySelectorAll('[data-tc-del]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-tc-del');
        saveAlerts(loadAlerts().filter(function (x) { return x.id !== id; }));
        renderAlertsList();
      });
    });
  }

  function setupPricesDragScroll(el) {
    if (!el) return;
    var dragging = false;
    var startY = 0;
    var startScroll = 0;

    function canScroll() {
      return el.scrollHeight > el.clientHeight + 1;
    }

    function markScrollable() {
      el.classList.toggle('tc-scrollable', canScroll());
    }

    markScrollable();
    el._markScrollable = markScrollable;
    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(markScrollable);
      ro.observe(el);
    }

    el.addEventListener('mousedown', function (e) {
      if (e.button !== 0 || !canScroll()) return;
      dragging = true;
      startY = e.clientY;
      startScroll = el.scrollTop;
      el.classList.add('tc-scroll-drag');
      e.preventDefault();
    });

    window.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var dy = e.clientY - startY;
      el.scrollTop = Math.max(0, Math.min(el.scrollHeight - el.clientHeight, startScroll + dy));
    });

    window.addEventListener('mouseup', function () {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('tc-scroll-drag');
    });
  }

  function buildUi() {
    var header = document.querySelector('header');
    if (!header || document.getElementById('taskosCryptoBar')) return;

    var bar = document.createElement('div');
    bar.id = 'taskosCryptoBar';
    bar.innerHTML =
      '<span class="tc-label">行情</span>' +
      '<div class="tc-prices" id="tcPrices"></div>' +
      '<div class="tc-bar-actions">' +
      '<button type="button" id="tcShowBubble">行情气泡</button>' +
      '<button type="button" id="tcTogglePanel">关注 / 提醒</button>' +
      '</div>';

    var panel = document.createElement('div');
    panel.id = 'taskosCryptoPanel';
    panel.innerHTML =
      '<label for="tcWatchInput">关注列表（逗号分隔，如 BTC,ETH,SOL）</label>' +
      '<input type="text" id="tcWatchInput" spellcheck="false" autocomplete="off">' +
      '<div class="tc-row">' +
      '<button type="button" class="primary" id="tcSaveWatch">保存并订阅</button>' +
      '</div>' +
      '<label>价格提醒</label>' +
      '<div class="tc-row">' +
      '<input type="text" id="tcAlertSym" placeholder="BTC" aria-label="提醒币种" style="width:5rem">' +
      '<select id="tcAlertOp" aria-label="方向"><option value="gte">涨到 ≥</option><option value="lte">跌到 ≤</option></select>' +
      '<input type="number" id="tcAlertTarget" placeholder="目标价" step="any" aria-label="目标价" style="width:8rem">' +
      '<button type="button" id="tcAddAlert">添加提醒</button>' +
      '</div>' +
      '<div class="tc-alerts"><ul id="tcAlertsList"></ul></div>' +
      '<label for="tcRelaySources">来源（只读）</label>' +
      '<input type="text" id="tcRelaySources" class="tc-source-name" value="胖猫社区" disabled readonly tabindex="-1" aria-readonly="true" spellcheck="false" autocomplete="off">' +
      '<label for="tcRelayBase">优先队列地址</label>' +
      '<input type="text" id="tcRelayBase" spellcheck="false" autocomplete="off" placeholder="https://op.g.ezcoin.ink">' +
      '<label for="tcRelaySecret">优先队列密钥（仅本机）</label>' +
      '<input type="password" id="tcRelaySecret" spellcheck="false" autocomplete="off">' +
      '<div class="tc-row">' +
      '<button type="button" id="tcSaveRelay">保存优先队列</button>' +
      '</div>' +
      '<p class="tc-note" id="tcRelayHint">来源名称由服务器提供，默认「胖猫社区」，不能在这里修改。未保存地址时使用 https://op.g.ezcoin.ink。地址与密钥只存在本机。</p>' +
      '<p class="tc-note">币种：Binance 现货→合约→Gate→CoinGecko。UAI 等新币 Binance 现货可能未上，会走合约/Gate。QQQ 等为美股 ETF，Binance 无 QQQUSDT，最后走东方财富。每 3 分钟刷新。</p>';

    header.insertAdjacentElement('afterend', panel);
    header.insertAdjacentElement('afterend', bar);

    var watchInput = document.getElementById('tcWatchInput');
    watchInput.value = loadWatchlist();
    setupPricesDragScroll(document.getElementById('tcPrices'));

    document.getElementById('tcShowBubble').addEventListener('click', function () {
      invoke('focus_price_bubble').catch(function () {
        alert('无法打开行情悬浮窗，请重启桌面版后再试。');
      });
    });
    document.getElementById('tcTogglePanel').addEventListener('click', function () {
      panel.classList.toggle('open');
    });
    document.getElementById('tcSaveWatch').addEventListener('click', function () {
      saveWatchlist(watchInput.value.trim() || DEFAULT_WATCH);
      startPolling();
    });
    document.getElementById('tcAddAlert').addEventListener('click', function () {
      var sym = document.getElementById('tcAlertSym').value.trim() || 'BTC';
      var target = parseFloat(document.getElementById('tcAlertTarget').value);
      var op = document.getElementById('tcAlertOp').value;
      if (!isFinite(target) || target <= 0) {
        alert('请输入有效的目标价格');
        return;
      }
      var list = loadAlerts();
      list.push({ id: uid(), symbol: sym, target: target, op: op, active: true });
      saveAlerts(list);
      document.getElementById('tcAlertTarget').value = '';
      renderAlertsList();
    });

    document.getElementById('tcSaveRelay').addEventListener('click', function () {
      var baseRaw = document.getElementById('tcRelayBase').value.trim();
      var secret = document.getElementById('tcRelaySecret').value.trim();
      var hint = document.getElementById('tcRelayHint');
      lockRelaySource();
      if (baseRaw && !normalizeRelayBase(baseRaw)) {
        if (hint) hint.textContent = '请填写 http(s) 地址。';
        return;
      }
      var base = baseRaw ? normalizeRelayBase(baseRaw) : RELAY_DEFAULT_BASE;
      var keepCustom = !!(baseRaw && base !== RELAY_DEFAULT_BASE);
      try {
        if (!secret) {
          if (keepCustom) localStorage.setItem(RELAY_BASE_KEY, base);
          else localStorage.removeItem(RELAY_BASE_KEY);
          localStorage.removeItem(RELAY_SECRET_KEY);
        } else {
          localStorage.setItem(RELAY_BASE_KEY, base);
          localStorage.setItem(RELAY_SECRET_KEY, secret);
        }
      } catch (e) {
        if (hint) hint.textContent = '无法写入本机存储。';
        return;
      }
      document.getElementById('tcRelayBase').value = !secret && !keepCustom ? RELAY_DEFAULT_BASE : base;
      if (!secret) {
        if (hint) hint.textContent = keepCustom
          ? '已保留地址并清除密钥。'
          : '已清除本机密钥。未保存地址时使用 https://op.g.ezcoin.ink。';
        return;
      }
      if (hint) hint.textContent = '已保存。行情气泡会连接 ' + base + '。';
    });
    window.addEventListener('storage', function (event) {
      if (event.key === RELAY_BASE_KEY || event.key === RELAY_SECRET_KEY) fillRelayForm();
    });

    fillRelayForm();
    renderAlertsList();
    startPolling();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildUi);
  else buildUi();
})();
