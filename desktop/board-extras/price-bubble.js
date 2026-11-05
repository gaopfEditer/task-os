(function () {
  'use strict';

  var WATCH_KEY = 'taskos.desktop.watchlist';
  var DEFAULT_WATCH = 'BTC,ETH,SOL';
  var POLL_MS = 3 * 60 * 1000;
  var Q = window.TaskOsQuotes;
  if (!Q) return;

  var prev = Object.create(null);
  var timer = null;
  var listSig = '';

  function loadWatchlist() {
    try {
      var s = localStorage.getItem(WATCH_KEY);
      if (s != null && String(s).trim()) return String(s).trim();
    } catch (e) {}
    return DEFAULT_WATCH;
  }

  function parseSymbols(csv) {
    return Q.parseSymbols(csv);
  }

  function displaySym(pair) {
    return Q.displaySym(pair);
  }

  function fmt(n) {
    var x = Number(n);
    if (!isFinite(x)) return '—';
    if (x >= 1000) return x.toLocaleString(undefined, { maximumFractionDigits: 0 });
    if (x >= 1) return x.toLocaleString(undefined, { maximumFractionDigits: 2 });
    return x.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }

  function setupDragScroll(el) {
    if (!el) return;
    var dragging = false;
    var startY = 0;
    var startScroll = 0;

    function canScroll() {
      return el.scrollHeight > el.clientHeight + 1;
    }

    function markScrollable() {
      el.classList.toggle('is-scrollable', canScroll());
    }

    markScrollable();
    if (typeof ResizeObserver !== 'undefined') {
      var ro = new ResizeObserver(markScrollable);
      ro.observe(el);
    }

    el.addEventListener('mousedown', function (e) {
      if (e.button !== 0 || !canScroll()) return;
      dragging = true;
      startY = e.clientY;
      startScroll = el.scrollTop;
      e.preventDefault();
      e.stopPropagation();
    });

    window.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var dy = e.clientY - startY;
      el.scrollTop = Math.max(0, Math.min(el.scrollHeight - el.clientHeight, startScroll + dy));
    });

    window.addEventListener('mouseup', function () {
      dragging = false;
    });

    el._markScrollable = markScrollable;
  }

  function renderList(syms) {
    var list = document.getElementById('bubbleList');
    if (!list) return;
    var sig = syms.join('|');
    if (sig === listSig) return;
    listSig = sig;
    if (!syms.length) {
      list.innerHTML = '<div class="bubble-row"><span class="sym">—</span><span class="px">无</span></div>';
    } else {
      list.innerHTML = syms.map(function (pair) {
        var sym = displaySym(pair);
        return '<div class="bubble-row" data-pair="' + pair + '"><span class="sym">' + sym +
          '</span><span class="px">…</span></div>';
      }).join('');
    }
    if (list._markScrollable) list._markScrollable();
  }

  function setRow(pair, value, err) {
    var list = document.getElementById('bubbleList');
    if (!list) return;
    var rowEl = list.querySelector('[data-pair="' + pair + '"]');
    if (!rowEl) return;
    var pxEl = rowEl.querySelector('.px');
    if (!pxEl) return;
    if (err || value == null) {
      pxEl.textContent = err ? '!' : '…';
      rowEl.classList.remove('up', 'down');
      return;
    }
    var p = prev[pair];
    rowEl.classList.remove('up', 'down');
    if (p != null) rowEl.classList.add(value >= p ? 'up' : 'down');
    prev[pair] = value;
    pxEl.textContent = fmt(value);
  }

  function loadPrices() {
    var syms = parseSymbols(loadWatchlist());
    renderList(syms);
    return Promise.all(syms.map(function (pair) {
      return Q.fetchExchangePrice(pair)
        .then(function (p) { setRow(pair, p); })
        .catch(function () {});
    }))
      .then(function () {
        var missing = syms.filter(function (pair) {
          var row = document.querySelector('#bubbleList [data-pair="' + pair + '"] .px');
          return !row || row.textContent === '…' || row.textContent === '!';
        });
        if (!missing.length) return;
        return Q.fetchCoinGeckoPrices(missing)
          .then(function (map) {
            missing.forEach(function (pair) {
              if (map[pair] != null) setRow(pair, map[pair]);
              else setRow(pair, null, true);
            });
          })
          .catch(function () {
            missing.forEach(function (pair) { setRow(pair, null, true); });
          });
      });
  }

  function startPoll() {
    if (timer) clearInterval(timer);
    loadPrices();
    timer = setInterval(loadPrices, POLL_MS);
  }

  function openMainWindow() {
    var tauri = window.__TAURI__;
    if (!tauri || !tauri.core) return;
    tauri.core.invoke('focus_main_window').catch(function () {});
  }

  function currentWindowForDrag() {
    var tauri = window.__TAURI__;
    if (!tauri) return null;
    if (tauri.webviewWindow && tauri.webviewWindow.getCurrentWebviewWindow) {
      return tauri.webviewWindow.getCurrentWebviewWindow();
    }
    if (tauri.window && tauri.window.getCurrentWindow) {
      return tauri.window.getCurrentWindow();
    }
    return null;
  }

  function setupWindowDrag() {
    var handle = document.getElementById('bubbleDragHandle');
    if (!handle) return;
    handle.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      var win = currentWindowForDrag();
      if (win && win.startDragging) win.startDragging().catch(function () {});
    });
  }

  function boot() {
    setupDragScroll(document.getElementById('bubbleList'));
    setupWindowDrag();
    document.getElementById('btnOpenMain').addEventListener('click', function (e) {
      e.stopPropagation();
      openMainWindow();
    });
    startPoll();
  }

  document.addEventListener('DOMContentLoaded', boot);
  if (document.readyState !== 'loading') boot();
})();
