(function () {
  'use strict';
  if (!(window.__TAURI__ && window.__TAURI__.core)) return;

  var WATCH_KEY = 'taskos.desktop.watchlist';
  var ALERTS_KEY = 'taskos.desktop.alerts';
  var RELAY_BASE_KEY = 'taskos.desktop.priority.baseUrl';
  var RELAY_SECRET_KEY = 'taskos.desktop.priority.secret';
  var RELAY_NOTIFY_KEY = 'taskos.desktop.priority.notify';
  var RELAY_DEFAULT_BASE = 'https://op.g.ezcoin.ink';
  var RELAY_DEFAULT_SOURCE = '胖猫社区';
  var DEFAULT_WATCH = 'BTC,ETH,QQQ,XAU';
  var Q = window.TaskOsQuotes;
  if (!Q) return;
  var POLL_MS = 60 * 1000;

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
        if (
          s === 'BTC,ETH,SOL' ||
          s === 'BTC,ETH,QQQ,SOL' ||
          s === DEFAULT_WATCH.replace(/\s/g, '')
        ) {
          return DEFAULT_WATCH;
        }
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

  var relayMemory = null;
  var relayHydrateGen = 0;

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

  function readLocalRelay() {
    var secret = '';
    var notifyRaw = null;
    try {
      secret = localStorage.getItem(RELAY_SECRET_KEY) || '';
      notifyRaw = localStorage.getItem(RELAY_NOTIFY_KEY);
    } catch (e) {}
    return {
      baseUrl: storedRelayBase() || '',
      secret: String(secret || '').trim(),
      notifyRaw: notifyRaw
    };
  }

  function writeRelayCache(bundle) {
    try {
      if (bundle.baseUrl) localStorage.setItem(RELAY_BASE_KEY, bundle.baseUrl);
      else localStorage.removeItem(RELAY_BASE_KEY);
      if (bundle.secret) localStorage.setItem(RELAY_SECRET_KEY, bundle.secret);
      else localStorage.removeItem(RELAY_SECRET_KEY);
      localStorage.setItem(RELAY_NOTIFY_KEY, bundle.notify === false ? '0' : '1');
    } catch (e) {}
  }

  function relayBundlesEqual(a, b) {
    if (!a || !b) return false;
    return (a.baseUrl || '') === (b.baseUrl || '')
      && (a.secret || '') === (b.secret || '')
      && ((a.notify !== false) === (b.notify !== false));
  }

  function loadPriorityModule() {
    return import('./priority-footer.js');
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
    var baseStored = storedRelayBase();
    var notify = true;
    if (relayMemory) {
      secret = relayMemory.secret || '';
      baseStored = relayMemory.baseUrl || '';
      notify = relayMemory.notify !== false;
    } else {
      try {
        secret = localStorage.getItem(RELAY_SECRET_KEY) || '';
        var rawNotify = localStorage.getItem(RELAY_NOTIFY_KEY);
        if (rawNotify === '0' || rawNotify === 'false' || rawNotify === 'off' || rawNotify === 'no') notify = false;
      } catch (e) {}
    }
    var baseInput = document.getElementById('tcRelayBase');
    var secretInput = document.getElementById('tcRelaySecret');
    var notifyInput = document.getElementById('tcRelayNotify');
    if (baseInput && document.activeElement !== baseInput) baseInput.value = relayBaseForForm(baseStored);
    if (secretInput && document.activeElement !== secretInput) secretInput.value = secret;
    if (notifyInput && document.activeElement !== notifyInput) notifyInput.checked = notify;
    lockRelaySource();
  }

  function persistRelay(bundle) {
    relayMemory = {
      baseUrl: bundle.baseUrl || '',
      secret: bundle.secret || '',
      notify: bundle.notify !== false,
      storePresent: !!bundle.storePresent
    };
    return invoke('save_priority_config', {
      baseUrl: relayMemory.baseUrl,
      secret: relayMemory.secret,
      notify: relayMemory.notify
    }).then(function () {
      relayMemory.storePresent = true;
      writeRelayCache(relayMemory);
    }, function (err) {
      writeRelayCache(relayMemory);
      throw err;
    });
  }

  function hydrateRelay() {
    var gen = ++relayHydrateGen;
    var localRaw = readLocalRelay();
    return loadPriorityModule().then(function (mod) {
      var local = {
        baseUrl: localRaw.baseUrl,
        secret: localRaw.secret,
        notify: mod.parseNotifyFlag(localRaw.notifyRaw)
      };
      return invoke('load_priority_config').then(function (shared) {
        if (gen !== relayHydrateGen) return;
        var next = mod.reconcilePriorityStore(shared, local);
        var writing = next.migrate
          ? persistRelay(next).then(function () { next.storePresent = true; }, function () { relayMemory = next; writeRelayCache(next); })
          : Promise.resolve();
        return writing.then(function () {
          if (gen !== relayHydrateGen) return;
          if (!relayMemory || !relayBundlesEqual(relayMemory, next)) {
            relayMemory = {
              baseUrl: next.baseUrl || '',
              secret: next.secret || '',
              notify: next.notify !== false,
              storePresent: !!next.storePresent
            };
            writeRelayCache(relayMemory);
          } else if (relayMemory) {
            relayMemory.storePresent = !!next.storePresent;
          }
          fillRelayForm();
        });
      }, function () {
        if (gen !== relayHydrateGen) return;
        relayMemory = local;
        fillRelayForm();
      });
    }, function () {
      if (gen !== relayHydrateGen) return;
      relayMemory = {
        baseUrl: localRaw.baseUrl,
        secret: localRaw.secret,
        notify: true
      };
      fillRelayForm();
    });
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
      '<button type="button" class="tc-label tc-config-btn" id="tcOpenConfig" title="设置关注币种">配置</button>' +
      '<div class="tc-prices" id="tcPrices"></div>' +
      '<div class="tc-bar-actions">' +
      '<button type="button" id="tcShowBubble">行情气泡</button>' +
      '<button type="button" id="tcTogglePanel">价格提醒</button>' +
      '</div>';

    var configModal = document.createElement('div');
    configModal.id = 'taskosConfigModal';
    configModal.className = 'tc-modal';
    configModal.setAttribute('role', 'dialog');
    configModal.setAttribute('aria-modal', 'true');
    configModal.setAttribute('aria-labelledby', 'tcConfigModalTitle');
    configModal.innerHTML =
      '<div class="tc-modal-backdrop" id="tcConfigBackdrop"></div>' +
      '<div class="tc-modal-dialog">' +
      '<h2 class="tc-modal-title" id="tcConfigModalTitle">设置币种</h2>' +
      '<label for="tcWatchInput">关注列表（逗号分隔，如 BTC,ETH,QQQ,XAU）</label>' +
      '<input type="text" id="tcWatchInput" spellcheck="false" autocomplete="off">' +
      '<p class="tc-modal-hint">币种：Binance U 本位合约价（非现货）；失败再走 Gate/CG；QQQ 等美股走东方财富。每 1 分钟刷新。</p>' +
      '<div class="tc-modal-actions">' +
      '<button type="button" id="tcConfigCancel">取消</button>' +
      '<button type="button" class="primary" id="tcSaveWatch">保存</button>' +
      '</div>' +
      '</div>';

    var panel = document.createElement('div');
    panel.id = 'taskosCryptoPanel';
    panel.innerHTML =
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
      '<label class="tc-check" for="tcRelayNotify"><input type="checkbox" id="tcRelayNotify" checked> 新卡片系统通知</label>' +
      '<div class="tc-row">' +
      '<button type="button" id="tcSaveRelay">保存优先队列</button>' +
      '</div>' +
      '<p class="tc-note" id="tcRelayHint">来源名称由服务器提供，默认「胖猫社区」，不能在这里修改。未保存地址时使用 https://op.g.ezcoin.ink。地址与密钥保存在系统钥匙串，开发模式和安装包共用。新卡片默认弹出系统通知。</p>' +
      '<p class="tc-note">币种：优先 Binance U 本位合约。QQQ 等为美股 ETF，走东方财富。每 1 分钟刷新。</p>';

    document.body.appendChild(configModal);
    header.insertAdjacentElement('afterend', panel);
    header.insertAdjacentElement('afterend', bar);

    var watchInput = document.getElementById('tcWatchInput');

    function openConfigModal() {
      watchInput.value = loadWatchlist();
      configModal.classList.add('open');
      watchInput.focus();
    }

    function closeConfigModal() {
      configModal.classList.remove('open');
    }

    setupPricesDragScroll(document.getElementById('tcPrices'));

    document.getElementById('tcOpenConfig').addEventListener('click', openConfigModal);
    document.getElementById('tcConfigBackdrop').addEventListener('click', closeConfigModal);
    document.getElementById('tcConfigCancel').addEventListener('click', closeConfigModal);
    configModal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && configModal.classList.contains('open')) closeConfigModal();
    });

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
      closeConfigModal();
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
      var notifyInput = document.getElementById('tcRelayNotify');
      var notify = notifyInput ? !!notifyInput.checked : true;
      var hint = document.getElementById('tcRelayHint');
      lockRelaySource();
      if (baseRaw && !normalizeRelayBase(baseRaw)) {
        if (hint) hint.textContent = '请填写 http(s) 地址。';
        return;
      }
      var base = baseRaw ? normalizeRelayBase(baseRaw) : RELAY_DEFAULT_BASE;
      var keepCustom = !!(baseRaw && base !== RELAY_DEFAULT_BASE);
      var storedBase = !secret && !keepCustom ? '' : base;
      document.getElementById('tcRelayBase').value = !secret && !keepCustom ? RELAY_DEFAULT_BASE : base;
      persistRelay({
        baseUrl: storedBase,
        secret: secret,
        notify: notify,
        storePresent: !!(relayMemory && relayMemory.storePresent)
      }).then(function () {
        if (!hint) return;
        if (!secret) {
          hint.textContent = keepCustom
            ? '已保留地址并清除密钥。'
            : '已清除本机密钥。未保存地址时使用 https://op.g.ezcoin.ink。';
          return;
        }
        hint.textContent = '已保存。行情气泡会连接 ' + base + '。';
      }, function () {
        if (hint) hint.textContent = '钥匙串暂不可用，已写入本机缓存。';
      });
    });
    var relayNotify = document.getElementById('tcRelayNotify');
    if (relayNotify) {
      relayNotify.addEventListener('change', function () {
        if (!relayMemory) {
          relayNotify.checked = true;
          return;
        }
        var nextNotify = {
          baseUrl: relayMemory.baseUrl || '',
          secret: relayMemory.secret || '',
          notify: !!relayNotify.checked,
          storePresent: !!relayMemory.storePresent
        };
        if (!nextNotify.storePresent && !nextNotify.secret && !nextNotify.baseUrl) {
          relayMemory = nextNotify;
          writeRelayCache(relayMemory);
          return;
        }
        persistRelay(nextNotify).catch(function () {});
      });
    }
    window.addEventListener('storage', function (event) {
      if (event.key === RELAY_BASE_KEY || event.key === RELAY_SECRET_KEY || event.key === RELAY_NOTIFY_KEY) {
        hydrateRelay();
      }
    });

    fillRelayForm();
    hydrateRelay();
    renderAlertsList();
    startPolling();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', buildUi);
  else buildUi();
})();
