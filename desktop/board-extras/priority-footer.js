/**
 * Desktop footer for the msg-relay-service priority queue.
 * Protocol (do not invent another):
 *   GET {base}/queue/priority/sources
 *   GET {base}/queue/priority?source=&limit=  (default 50, max 200, oldest → newest)
 *   WS  {base as ws}/ws/priority?token=       (no replay; live priority_card frames)
 * Auth: Authorization: Bearer / X-Relay-Secret, WS token query param.
 */
export var STORAGE_KEYS = {
  baseUrl: 'taskos.desktop.priority.baseUrl',
  secret: 'taskos.desktop.priority.secret',
  seen: 'taskos.desktop.priority.seen'
};

/** Public relay on the VPS. Used only when the user has not saved a base URL. */
export var DEFAULT_BASE_URL = 'https://op.g.ezcoin.ink';

export var DEFAULT_SOURCES = Object.freeze([
  Object.freeze({ id: 'pangmao', name: '胖猫社区' })
]);

export var QUEUE_LIMIT = 200;
export var SEEN_CAP = 800;

var SYMBOL_KEYS = ['symbol', 'pair', 'ticker', 'coin', '币种', '交易对'];
var DIRECTION_KEYS = ['direction', 'side', 'dir', '方向'];
var YIELD_KEYS = ['yield', 'yield_pct', 'pnl', 'profit', '收益', '收益率'];
var TEXT_BODY_KEYS = ['text', 'body', 'content', 'summary', 'message', '内容', '备注'];
var TEXT_TITLE_KEYS = ['title', '摘要'];

export function normalizeBaseUrl(raw) {
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

/** What the settings field shows. Blank storage shows the public relay; a saved value is kept. */
export function displayBaseUrl(storedBase) {
  var raw = storedBase == null ? '' : String(storedBase).trim();
  if (!raw) return DEFAULT_BASE_URL;
  return normalizeBaseUrl(raw) || raw;
}

/**
 * Connection config. A missing or blank saved base uses DEFAULT_BASE_URL and does not
 * write storage. A saved custom URL is returned unchanged. Connect only when a secret
 * is present — the secret is never defaulted.
 */
export function resolvePriorityConfig(storedBase, storedSecret) {
  var secret = String(storedSecret == null ? '' : storedSecret).trim();
  var raw = storedBase == null ? '' : String(storedBase).trim();
  if (!raw) {
    return {
      base: DEFAULT_BASE_URL,
      secret: secret,
      usedDefault: true,
      connect: !!secret
    };
  }
  var normalized = normalizeBaseUrl(raw);
  if (!normalized) {
    return { base: '', secret: secret, usedDefault: false, connect: false };
  }
  return {
    base: normalized,
    secret: secret,
    usedDefault: false,
    connect: !!secret
  };
}

/** Display labels from the server list. Not a setting the user can rename. */
export function sourceLabelText(sources) {
  var list = sources && sources.length ? sources : DEFAULT_SOURCES;
  var names = [];
  list.forEach(function (source) {
    var name = source && source.name ? String(source.name).trim() : '';
    if (!name && source && source.id) name = String(source.id).trim();
    if (name) names.push(name);
  });
  return names.length ? names.join('、') : DEFAULT_SOURCES[0].name;
}

export function sourcesUrl(base) {
  var root = normalizeBaseUrl(base);
  if (!root) return '';
  return root + '/queue/priority/sources';
}

export function queueUrl(base, source, limit) {
  var root = normalizeBaseUrl(base);
  if (!root) return '';
  var u = new URL(root + '/queue/priority');
  if (source) u.searchParams.set('source', source);
  var n = Number(limit);
  if (!isFinite(n) || n <= 0) n = QUEUE_LIMIT;
  if (n > QUEUE_LIMIT) n = QUEUE_LIMIT;
  u.searchParams.set('limit', String(Math.floor(n)));
  return u.toString();
}

/** Live socket only: no source filter, no replay/since. */
export function toWebSocketUrl(base, secret) {
  var root = normalizeBaseUrl(base);
  var token = String(secret || '').trim();
  if (!root || !token) return '';
  var u = new URL(root + '/ws/priority');
  u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
  u.search = '';
  u.searchParams.set('token', token);
  return u.toString();
}

function firstEntry(obj, keys) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return null;
  for (var i = 0; i < keys.length; i++) {
    if (!Object.prototype.hasOwnProperty.call(obj, keys[i])) continue;
    var value = obj[keys[i]];
    if (value == null) continue;
    if (typeof value === 'string' && !value.trim()) continue;
    if (typeof value === 'number' && !isFinite(value)) continue;
    if (typeof value !== 'string' && typeof value !== 'number') continue;
    return { key: keys[i], value: value };
  }
  return null;
}

function stringFrom(entry) {
  if (!entry) return '';
  if (typeof entry.value === 'number') return String(entry.value);
  return String(entry.value).trim();
}

function cardOf(item) {
  var card = item && item.card;
  if (!card || typeof card !== 'object' || Array.isArray(card)) return {};
  return card;
}

function metaOf(item) {
  var meta = item && item.meta;
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return {};
  return meta;
}

export function isTradeCard(item) {
  if (!item || typeof item !== 'object') return false;
  var card = cardOf(item);
  var meta = metaOf(item);
  if (meta.via === 'ocr' || meta.via === 'text') return true;
  if (firstEntry(card, SYMBOL_KEYS) || firstEntry(card, DIRECTION_KEYS) || firstEntry(card, YIELD_KEYS)) return true;
  if (meta.yield_pct != null && meta.yield_pct !== '' && (typeof meta.yield_pct === 'number' || typeof meta.yield_pct === 'string')) {
    return true;
  }
  return false;
}

function shortText(card) {
  var title = stringFrom(firstEntry(card, TEXT_TITLE_KEYS));
  var body = stringFrom(firstEntry(card, TEXT_BODY_KEYS));
  var text = '';
  if (title && body && title !== body) text = title + ' ' + body;
  else text = body || title || '';
  if (text.length > 160) text = text.slice(0, 160) + '…';
  return text;
}

function yieldText(card, meta) {
  var hit = firstEntry(card, YIELD_KEYS);
  if (hit) {
    var raw = String(hit.value);
    if (hit.key === 'yield_pct' || hit.key === '收益率') return raw + '%';
    return raw;
  }
  if (meta.yield_pct != null && meta.yield_pct !== '' && (typeof meta.yield_pct === 'number' || typeof meta.yield_pct === 'string')) {
    return String(meta.yield_pct) + '%';
  }
  return '';
}

export function describeItem(item, sourceName) {
  var card = cardOf(item);
  var meta = metaOf(item);
  return {
    id: item && typeof item.id === 'string' ? item.id : '',
    time: item && typeof item.createdAt === 'string' ? item.createdAt : '',
    sourceName: sourceName || (item && item.source) || '',
    symbol: stringFrom(firstEntry(card, SYMBOL_KEYS)),
    direction: stringFrom(firstEntry(card, DIRECTION_KEYS)),
    yieldValue: yieldText(card, meta),
    text: shortText(card),
    via: meta.via === 'ocr' || meta.via === 'text' ? meta.via : ''
  };
}

export function formatTime(iso) {
  var d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso || '');
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  return pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

export function sourceCounts(items, sourceId, seenIds) {
  var messages = 0;
  var fresh = 0;
  (items || []).forEach(function (item) {
    if (!item || item.source !== sourceId) return;
    messages += 1;
    if (isTradeCard(item) && item.id && !(seenIds && seenIds[item.id])) fresh += 1;
  });
  return { messages: messages, newCards: fresh };
}

export function seenSet(map, sourceId) {
  var set = Object.create(null);
  var list = map && Array.isArray(map[sourceId]) ? map[sourceId] : [];
  list.forEach(function (id) {
    if (typeof id === 'string' && id) set[id] = true;
  });
  return set;
}

export function markSeen(map, sourceId, ids, cap) {
  var limit = cap || SEEN_CAP;
  var next = {};
  var sourceKeys = map && typeof map === 'object' ? Object.keys(map) : [];
  sourceKeys.forEach(function (key) {
    next[key] = Array.isArray(map[key]) ? map[key].filter(function (id) { return typeof id === 'string' && id; }) : [];
  });
  var list = next[sourceId] ? next[sourceId].slice() : [];
  var have = Object.create(null);
  list.forEach(function (id) { have[id] = true; });
  (ids || []).forEach(function (id) {
    if (typeof id !== 'string' || !id || have[id]) return;
    have[id] = true;
    list.push(id);
  });
  if (list.length > limit) list = list.slice(list.length - limit);
  next[sourceId] = list;
  return next;
}

export function mergeItems(existing, incoming) {
  var map = Object.create(null);
  var order = [];
  function upsert(item) {
    if (!item || typeof item.id !== 'string' || !item.id) return;
    if (!Object.prototype.hasOwnProperty.call(map, item.id)) order.push(item.id);
    map[item.id] = item;
  }
  (existing || []).forEach(upsert);
  (incoming || []).forEach(upsert);
  return order.map(function (id) { return map[id]; });
}

export function replaceSourceItems(existing, sourceId, incoming) {
  var rest = (existing || []).filter(function (item) {
    return item && item.source !== sourceId;
  });
  return mergeItems(rest, incoming || []);
}

function clonePlain(value, fallback) {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (e) {
    return fallback;
  }
}

export function ingestPriorityFrame(items, frame) {
  if (!frame || frame.type !== 'priority_card') return items || [];
  if (typeof frame.id !== 'string' || !frame.id) return items || [];
  if (typeof frame.source !== 'string' || !frame.source) return items || [];
  var card = frame.card && typeof frame.card === 'object' && !Array.isArray(frame.card) ? clonePlain(frame.card, {}) : {};
  var meta = frame.meta && typeof frame.meta === 'object' && !Array.isArray(frame.meta) ? clonePlain(frame.meta, {}) : {};
  return mergeItems(items, [{
    id: frame.id,
    source: frame.source,
    card: card,
    meta: meta,
    createdAt: typeof frame.createdAt === 'string' ? frame.createdAt : ''
  }]);
}

export function parseQueueItems(body) {
  var raw = body && Array.isArray(body.items) ? body.items : [];
  var out = [];
  raw.forEach(function (frame) {
    var next = ingestPriorityFrame([], {
      type: 'priority_card',
      id: frame && frame.id,
      source: frame && frame.source,
      card: frame && frame.card,
      meta: frame && frame.meta,
      createdAt: frame && frame.createdAt
    });
    if (next.length) out.push(next[0]);
  });
  return out;
}

export function parseSources(body) {
  var raw = body && Array.isArray(body.sources) ? body.sources : [];
  var out = [];
  var seen = Object.create(null);
  raw.forEach(function (source) {
    if (!source || typeof source.id !== 'string') return;
    var id = source.id.trim();
    if (!id || seen[id]) return;
    seen[id] = true;
    var name = typeof source.name === 'string' && source.name.trim() ? source.name.trim() : id;
    out.push({ id: id, name: name });
  });
  return out;
}

export function footerRows(sources, items, seenMap, configured) {
  var list = sources && sources.length ? sources : DEFAULT_SOURCES;
  return list.map(function (source) {
    var id = source && source.id ? source.id : 'pangmao';
    var name = source && source.name ? source.name : id;
    if (!configured) {
      return { id: id, name: name, messages: 0, newCards: 0, unconfigured: true };
    }
    var counts = sourceCounts(items, id, seenSet(seenMap, id));
    return {
      id: id,
      name: name,
      messages: counts.messages,
      newCards: counts.newCards,
      unconfigured: false
    };
  });
}

function quietLog(err) {
  try {
    var msg = err && err.message ? err.message : 'priority error';
    console.warn('[taskos priority] ' + msg);
  } catch (e) {}
}

var api = {
  STORAGE_KEYS: STORAGE_KEYS,
  DEFAULT_SOURCES: DEFAULT_SOURCES,
  normalizeBaseUrl: normalizeBaseUrl,
  sourcesUrl: sourcesUrl,
  queueUrl: queueUrl,
  toWebSocketUrl: toWebSocketUrl,
  isTradeCard: isTradeCard,
  describeItem: describeItem,
  formatTime: formatTime,
  sourceCounts: sourceCounts,
  footerRows: footerRows,
  applySnapshot: function () {},
  openList: function () {},
  closePanel: function () {},
  footerModel: function () { return []; }
};

if (typeof window !== 'undefined') window.TaskOsPriority = api;

function bootFooter() {
  if (typeof document === 'undefined') return;
  var footer = document.getElementById('priorityFooter');
  if (!footer || footer.getAttribute('data-priority-ready') === '1') return;
  footer.setAttribute('data-priority-ready', '1');
  try {
    mountFooter(footer);
  } catch (err) {
    quietLog(err);
  }
}

function mountFooter(footer) {
  var state = {
    sources: DEFAULT_SOURCES.slice(),
    items: [],
    networkConfigured: false,
    holdSnapshot: false,
    lastError: ''
  };
  var session = 0;
  var socket = null;
  var retryTimer = null;
  var backoff = 1000;
  var syncing = false;
  var wsBuffer = [];
  var panelMode = null;
  var listSource = null;
  var highlighted = Object.create(null);

  function displayConfigured() {
    return state.networkConfigured || state.holdSnapshot;
  }

  function readStoredBase() {
    try {
      return localStorage.getItem(STORAGE_KEYS.baseUrl);
    } catch (e) {
      return null;
    }
  }

  function readConfig() {
    var storedSecret = null;
    try {
      storedSecret = localStorage.getItem(STORAGE_KEYS.secret);
    } catch (e) {}
    return resolvePriorityConfig(readStoredBase(), storedSecret);
  }

  function writeConfig(base, secret) {
    try {
      if (base) localStorage.setItem(STORAGE_KEYS.baseUrl, base);
      else localStorage.removeItem(STORAGE_KEYS.baseUrl);
      if (secret) localStorage.setItem(STORAGE_KEYS.secret, secret);
      else localStorage.removeItem(STORAGE_KEYS.secret);
    } catch (e) {}
  }

  function loadSeen() {
    try {
      var raw = localStorage.getItem(STORAGE_KEYS.seen);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
      var out = {};
      Object.keys(parsed).forEach(function (key) {
        if (!Array.isArray(parsed[key])) return;
        out[key] = parsed[key].filter(function (id) { return typeof id === 'string' && id; });
      });
      return out;
    } catch (e) {
      return {};
    }
  }

  function saveSeen(map) {
    try {
      localStorage.setItem(STORAGE_KEYS.seen, JSON.stringify(map));
    } catch (e) {}
  }

  function sourceName(id) {
    for (var i = 0; i < state.sources.length; i++) {
      if (state.sources[i].id === id) return state.sources[i].name || id;
    }
    return id || '';
  }

  function ensureSource(id) {
    if (!id) return;
    for (var i = 0; i < state.sources.length; i++) {
      if (state.sources[i].id === id) return;
    }
    state.sources.push({ id: id, name: id });
  }

  function renderFooter() {
    var host = document.getElementById('priorityRows');
    if (!host) return;
    var rows = footerRows(state.sources, state.items, loadSeen(), displayConfigured());
    host.textContent = '';
    rows.forEach(function (row) {
      var el = document.createElement('div');
      el.className = 'priority-row' + (row.unconfigured ? ' is-unconfigured' : '');
      el.setAttribute('data-source', row.id);
      el.title = '双击查看完整列表';

      var name = document.createElement('span');
      name.className = 'priority-name priority-source-name';
      name.setAttribute('aria-readonly', 'true');
      name.textContent = row.name;
      if (row.unconfigured) {
        var tag = document.createElement('small');
        tag.textContent = '未配置';
        name.appendChild(tag);
      }

      var messages = document.createElement('span');
      messages.className = 'priority-stat';
      messages.title = '消息数';
      var messageLabel = document.createElement('b');
      messageLabel.textContent = '消息';
      messages.appendChild(messageLabel);
      messages.appendChild(document.createTextNode(String(row.messages)));

      var fresh = document.createElement('span');
      fresh.className = 'priority-stat priority-new' + (row.newCards > 0 ? ' is-hot' : '');
      fresh.title = '新交易卡片数';
      var freshLabel = document.createElement('b');
      freshLabel.textContent = '新卡';
      fresh.appendChild(freshLabel);
      fresh.appendChild(document.createTextNode(String(row.newCards)));

      el.appendChild(name);
      el.appendChild(messages);
      el.appendChild(fresh);
      host.appendChild(el);
    });
    footer.title = state.lastError
      ? '优先队列暂时不可用，正在重试。双击仍可查看已收到的列表。'
      : '双击查看完整列表';
  }

  function itemsForList() {
    return state.items.filter(function (item) {
      return item && (!listSource || item.source === listSource);
    }).slice().sort(function (a, b) {
      var ta = a.createdAt || '';
      var tb = b.createdAt || '';
      if (ta === tb) return 0;
      return ta < tb ? 1 : -1;
    });
  }

  function renderList() {
    var list = document.getElementById('priorityPanelList');
    var title = document.getElementById('priorityPanelTitle');
    if (title) {
      var titleIsSource = panelMode === 'list' && !!listSource;
      title.classList.toggle('priority-source-name', titleIsSource);
      if (panelMode === 'settings') title.textContent = '优先队列设置';
      else if (!listSource) title.textContent = '全部来源';
      else title.textContent = sourceName(listSource);
    }
    if (!list) return;
    list.hidden = panelMode !== 'list';
    if (panelMode !== 'list') return;
    list.textContent = '';
    var items = itemsForList();
    if (!items.length) {
      var empty = document.createElement('p');
      empty.className = 'priority-empty';
      empty.textContent = displayConfigured()
        ? '暂无消息'
        : '填写本机密钥后即可拉取消息。未保存地址时使用 https://op.g.ezcoin.ink。';
      list.appendChild(empty);
      return;
    }
    items.forEach(function (item) {
      var view = describeItem(item, sourceName(item.source));
      var article = document.createElement('article');
      article.className = 'priority-item' + (highlighted[item.id] ? ' is-new' : '');

      var meta = document.createElement('div');
      meta.className = 'priority-item-meta';
      var time = document.createElement('time');
      time.textContent = formatTime(view.time);
      time.dateTime = view.time || '';
      meta.appendChild(time);
      var src = document.createElement('span');
      src.className = 'priority-source-name';
      src.setAttribute('aria-readonly', 'true');
      src.textContent = view.sourceName || item.source || '';
      meta.appendChild(src);
      if (view.via) {
        var via = document.createElement('span');
        via.textContent = view.via;
        meta.appendChild(via);
      }
      if (highlighted[item.id]) {
        var badge = document.createElement('span');
        badge.className = 'priority-badge';
        badge.textContent = '新';
        meta.appendChild(badge);
      }
      article.appendChild(meta);

      if (view.symbol || view.direction || view.yieldValue) {
        var main = document.createElement('div');
        main.className = 'priority-item-main';
        if (view.symbol) {
          var sym = document.createElement('b');
          sym.textContent = view.symbol;
          main.appendChild(sym);
        }
        if (view.direction) {
          var dir = document.createElement('span');
          dir.textContent = view.direction;
          main.appendChild(dir);
        }
        if (view.yieldValue) {
          var yld = document.createElement('span');
          yld.textContent = '收益 ' + view.yieldValue;
          main.appendChild(yld);
        }
        article.appendChild(main);
      }
      if (view.text) {
        var text = document.createElement('p');
        text.className = 'priority-item-text';
        text.textContent = view.text;
        article.appendChild(text);
      }
      list.appendChild(article);
    });
  }

  function renderSourceField() {
    var el = document.getElementById('prioritySourceNames');
    if (!el) return;
    el.value = sourceLabelText(state.sources);
    el.disabled = true;
    el.readOnly = true;
    el.tabIndex = -1;
    el.setAttribute('aria-readonly', 'true');
  }

  function render() {
    renderFooter();
    renderSourceField();
    if (panelMode) renderList();
  }

  function requestLayout(mode) {
    var tauri = window.__TAURI__;
    if (!tauri || !tauri.core || !tauri.core.invoke) return;
    tauri.core.invoke('set_price_bubble_layout', { mode: mode }).catch(function () {});
  }

  function fillSettingsForm() {
    var cfg = readConfig();
    var baseInput = document.getElementById('priorityBaseUrl');
    var secretInput = document.getElementById('prioritySecret');
    if (baseInput) baseInput.value = displayBaseUrl(readStoredBase());
    if (secretInput) secretInput.value = cfg.secret;
    renderSourceField();
  }

  function showPanel() {
    var panel = document.getElementById('priorityPanel');
    if (!panel) return;
    panel.hidden = false;
    document.body.classList.add('priority-expanded');
    var details = document.getElementById('prioritySettingsDetails');
    if (details) details.open = panelMode === 'settings';
    fillSettingsForm();
    render();
  }

  function closePanel() {
    panelMode = null;
    listSource = null;
    highlighted = Object.create(null);
    var panel = document.getElementById('priorityPanel');
    if (panel) panel.hidden = true;
    document.body.classList.remove('priority-expanded');
    requestLayout('compact');
    renderFooter();
  }

  function markTradeCardsSeen(sourceId) {
    var seenMap = loadSeen();
    var grouped = Object.create(null);
    state.items.forEach(function (item) {
      if (sourceId && item.source !== sourceId) return;
      if (!isTradeCard(item) || !item.id) return;
      var set = seenSet(seenMap, item.source);
      if (!set[item.id]) highlighted[item.id] = true;
      if (!grouped[item.source]) grouped[item.source] = [];
      grouped[item.source].push(item.id);
    });
    Object.keys(grouped).forEach(function (sid) {
      seenMap = markSeen(seenMap, sid, grouped[sid]);
    });
    saveSeen(seenMap);
  }

  function openList(sourceId) {
    panelMode = 'list';
    listSource = sourceId || null;
    highlighted = Object.create(null);
    markTradeCardsSeen(listSource);
    showPanel();
    requestLayout('list');
  }

  function openSettings() {
    panelMode = 'settings';
    listSource = null;
    showPanel();
    requestLayout('settings');
  }

  function stopSocket() {
    var ws = socket;
    socket = null;
    if (!ws) return;
    try { ws.close(); } catch (e) {}
  }

  function interpretHttp(status, bodyText) {
    var body = {};
    if (bodyText) {
      try {
        body = JSON.parse(bodyText);
      } catch (e) {
        throw new Error('priority HTTP ' + status);
      }
    }
    if (status === 422) {
      var code = body && body.error ? String(body.error) : 'invalid';
      throw new Error('priority 422 ' + code);
    }
    if (status < 200 || status >= 300) throw new Error('priority HTTP ' + status);
    return body;
  }

  function browserFetch(url, secret) {
    var opts = {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + secret,
        'X-Relay-Secret': secret,
        Accept: 'application/json'
      },
      cache: 'no-store',
      credentials: 'omit'
    };
    if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
      opts.signal = AbortSignal.timeout(12000);
    }
    return fetch(url, opts).then(function (res) {
      return res.text().then(function (text) {
        return interpretHttp(res.status, text);
      });
    });
  }

  // Packaged bubble pages are cross-origin to the relay, and msg-relay does not
  // send CORS headers. The shell performs the same GET so the secret header works.
  function fetchJson(url, secret) {
    var tauri = window.__TAURI__;
    if (tauri && tauri.core && tauri.core.invoke) {
      return tauri.core.invoke('priority_http_get', { url: url, secret: secret }).then(function (res) {
        return interpretHttp(res && res.status, (res && res.body) || '');
      });
    }
    return browserFetch(url, secret);
  }

  function rememberFrame(frame, token) {
    if (token !== session || !frame) return;
    if (syncing) {
      wsBuffer = ingestPriorityFrame(wsBuffer, frame);
      return;
    }
    state.items = ingestPriorityFrame(state.items, frame);
    if (frame.source) ensureSource(frame.source);
    if (panelMode === 'list' && (!listSource || frame.source === listSource) && isTradeCard(frame) && frame.id) {
      if (!seenSet(loadSeen(), frame.source)[frame.id]) highlighted[frame.id] = true;
      saveSeen(markSeen(loadSeen(), frame.source, [frame.id]));
    }
    render();
  }

  function syncOnce(token) {
    var cfg = readConfig();
    if (!cfg.base || !cfg.secret) return Promise.reject(new Error('priority unconfigured'));
    syncing = true;
    wsBuffer = [];
    var nextSources = null;
    var nextItems = state.items.slice();
    return fetchJson(sourcesUrl(cfg.base), cfg.secret).then(function (body) {
      if (token !== session) return;
      var sources = parseSources(body);
      nextSources = sources.length ? sources : DEFAULT_SOURCES.slice();
      return Promise.all(nextSources.map(function (source) {
        return fetchJson(queueUrl(cfg.base, source.id, QUEUE_LIMIT), cfg.secret).then(function (payload) {
          if (token !== session) return;
          var items = parseQueueItems(payload).filter(function (item) {
            return item.source === source.id;
          });
          nextItems = replaceSourceItems(nextItems, source.id, items);
        });
      }));
    }).then(function () {
      if (token !== session || !nextSources) return;
      if (wsBuffer.length) nextItems = mergeItems(nextItems, wsBuffer);
      wsBuffer = [];
      syncing = false;
      state.lastError = '';
      backoff = 1000;
      var known = Object.create(null);
      nextSources.forEach(function (source) { known[source.id] = true; });
      state.sources = nextSources;
      state.items = nextItems.filter(function (item) { return item && known[item.source]; });
      render();
    }, function (err) {
      if (token !== session) return;
      syncing = false;
      if (wsBuffer.length) {
        state.items = mergeItems(state.items, wsBuffer);
        wsBuffer = [];
        render();
      }
      throw err;
    });
  }

  function openSocket(token) {
    return new Promise(function (resolve, reject) {
      var cfg = readConfig();
      var url = toWebSocketUrl(cfg.base, cfg.secret);
      if (!url) {
        reject(new Error('priority ws skipped'));
        return;
      }
      var ws;
      try {
        ws = new WebSocket(url);
      } catch (e) {
        reject(e);
        return;
      }
      socket = ws;
      var opened = false;
      ws.onopen = function () { opened = true; };
      ws.onmessage = function (ev) {
        if (token !== session) return;
        var data;
        try { data = JSON.parse(ev.data); } catch (e) { return; }
        if (!data || data.type !== 'priority_card') return;
        rememberFrame(data, token);
      };
      ws.onerror = function () {};
      ws.onclose = function () {
        if (socket === ws) socket = null;
        if (token !== session) {
          resolve();
          return;
        }
        if (!opened) reject(new Error('priority ws closed'));
        else resolve();
      };
    });
  }

  function scheduleRetry(token) {
    if (token !== session) return;
    var wait = backoff;
    backoff = Math.min(backoff * 2, 60000);
    retryTimer = setTimeout(function () { loop(token); }, wait);
  }

  function loop(token) {
    if (token !== session) return;
    syncOnce(token).then(function () {
      if (token !== session) return;
      return openSocket(token);
    }).then(function () {
      if (token !== session) return;
      scheduleRetry(token);
    }, function (err) {
      if (token !== session) return;
      state.lastError = err && err.message ? err.message : 'priority error';
      quietLog(err);
      renderFooter();
      scheduleRetry(token);
    });
  }

  function restart() {
    session += 1;
    var token = session;
    if (retryTimer) {
      clearTimeout(retryTimer);
      retryTimer = null;
    }
    stopSocket();
    syncing = false;
    wsBuffer = [];
    backoff = 1000;
    state.holdSnapshot = false;
    var cfg = readConfig();
    state.networkConfigured = !!cfg.connect;
    state.lastError = '';
    if (!state.networkConfigured) {
      state.items = [];
      state.sources = DEFAULT_SOURCES.slice();
      render();
      return;
    }
    loop(token);
  }

  function applySnapshot(snap) {
    state.holdSnapshot = true;
    state.lastError = '';
    var sources = parseSources({ sources: snap && snap.sources });
    state.sources = sources.length ? sources : DEFAULT_SOURCES.slice();
    state.items = parseQueueItems({ items: snap && snap.items });
    render();
  }

  function onSave(event) {
    event.preventDefault();
    var baseInput = document.getElementById('priorityBaseUrl');
    var secretInput = document.getElementById('prioritySecret');
    var hint = document.getElementById('prioritySettingsHint');
    var baseRaw = baseInput ? baseInput.value.trim() : '';
    var secret = secretInput ? secretInput.value.trim() : '';
    if (hint) hint.classList.remove('is-error');
    if (baseRaw && !normalizeBaseUrl(baseRaw)) {
      if (hint) {
        hint.classList.add('is-error');
        hint.textContent = '请填写 http(s) 地址';
      }
      return;
    }
    if (!secret) {
      var keepCustom = baseRaw && normalizeBaseUrl(baseRaw) !== DEFAULT_BASE_URL;
      writeConfig(keepCustom ? normalizeBaseUrl(baseRaw) : '', '');
      if (baseInput) baseInput.value = keepCustom ? normalizeBaseUrl(baseRaw) : DEFAULT_BASE_URL;
      if (hint) hint.textContent = keepCustom ? '已保留地址并清除密钥' : '已清除本机密钥';
      restart();
      return;
    }
    var base = baseRaw ? normalizeBaseUrl(baseRaw) : DEFAULT_BASE_URL;
    writeConfig(base, secret);
    if (baseInput) baseInput.value = base;
    if (hint) hint.textContent = '已保存，正在连接';
    restart();
  }

  function closest(node, selector) {
    if (!node || !node.closest) return null;
    return node.closest(selector);
  }

  api.applySnapshot = applySnapshot;
  api.openList = openList;
  api.closePanel = closePanel;
  api.footerModel = function () {
    return footerRows(state.sources, state.items, loadSeen(), displayConfigured());
  };

  var gear = document.getElementById('prioritySettingsBtn');
  if (gear) {
    gear.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      openSettings();
    });
    gear.addEventListener('dblclick', function (event) {
      event.preventDefault();
      event.stopPropagation();
    });
  }
  footer.addEventListener('dblclick', function (event) {
    if (closest(event.target, '#prioritySettingsBtn')) return;
    var row = closest(event.target, '[data-source]');
    var sourceId = row ? row.getAttribute('data-source') : '';
    if (!sourceId && state.sources.length === 1) sourceId = state.sources[0].id;
    openList(sourceId || null);
  });
  var closeBtn = document.getElementById('priorityPanelClose');
  if (closeBtn) closeBtn.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    closePanel();
  });
  var form = document.getElementById('prioritySettingsForm');
  if (form) form.addEventListener('submit', onSave);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && panelMode) closePanel();
  });
  window.addEventListener('storage', function (event) {
    if (!event.key) return;
    if (event.key === STORAGE_KEYS.baseUrl || event.key === STORAGE_KEYS.secret) restart();
    else if (event.key === STORAGE_KEYS.seen) render();
  });

  render();
  restart();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootFooter);
  else bootFooter();
}
