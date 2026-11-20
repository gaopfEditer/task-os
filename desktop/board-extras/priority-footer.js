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
  seen: 'taskos.desktop.priority.seen',
  notify: 'taskos.desktop.priority.notify',
  // Comma/space-separated tickers. When this key exists it replaces SPECIAL_SYMBOLS.
  specialSymbols: 'taskos.desktop.priority.specialSymbols'
};

/** Public relay on the VPS. Used only when the user has not saved a base URL. */
export var DEFAULT_BASE_URL = 'https://op.g.ezcoin.ink';

export var DEFAULT_SOURCES = Object.freeze([
  Object.freeze({ id: 'pangmao', name: '胖猫社区' })
]);

export var OI_REPORT_SOURCE_ID = 'oi_report';
export var OI_REPORT_SOURCE = Object.freeze({ id: 'oi_report', name: 'BTC/ETH 5m 放量影线' });
export var DEFAULT_OI_WEB_BASE_URL = 'http://127.0.0.1:8765';
export var OI_REPORT_POLL_MS = 15000;

export var QUEUE_LIMIT = 200;
export var SEEN_CAP = 800;

/**
 * Symbols that count as 特别提醒. Leave this empty until a watchlist is filled in.
 * Each entry is a ticker such as "BTC" or "ETHUSDT". Matching ignores case,
 * separators, a trailing ".P", and a quote suffix (USDT / USDC / BUSD / FDUSD / USD).
 * If localStorage has STORAGE_KEYS.specialSymbols, that value replaces this list
 * (an empty saved value means no special hits). Absent key → this list.
 */
export var SPECIAL_SYMBOLS = Object.freeze([]);

var SPECIAL_QUOTE_SUFFIXES = ['USDT', 'USDC', 'BUSD', 'FDUSD', 'USD'];

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

/** Blank / missing means notifications stay on. */
export function parseNotifyFlag(raw) {
  if (raw == null || raw === '') return true;
  var s = String(raw).trim().toLowerCase();
  return !(s === '0' || s === 'false' || s === 'off' || s === 'no');
}

/**
 * The OS keychain is authoritative once `present` is true (including a cleared secret).
 * When nothing has been saved there yet, copy a secret or custom base out of localStorage.
 */
export function reconcilePriorityStore(shared, local) {
  var localSecret = String(local && local.secret != null ? local.secret : '').trim();
  var localBase = String(local && local.baseUrl != null ? local.baseUrl : '').trim();
  var localNotify = !local || local.notify !== false;
  var sharedOk = !!(shared && typeof shared === 'object');
  var present = !!(sharedOk && shared.present);
  if (present) {
    return {
      baseUrl: String(shared.baseUrl == null ? '' : shared.baseUrl).trim(),
      secret: String(shared.secret == null ? '' : shared.secret).trim(),
      notify: shared.notify !== false,
      migrate: false,
      storePresent: true
    };
  }
  if (localSecret || localBase) {
    return {
      baseUrl: localBase,
      secret: localSecret,
      notify: localNotify,
      migrate: true,
      storePresent: false
    };
  }
  return {
    baseUrl: '',
    secret: '',
    notify: localNotify,
    migrate: false,
    storePresent: false
  };
}

export function priorityNotice(item, sourceName) {
  var view = describeItem(item, sourceName || '');
  var name = view.sourceName || '优先队列';
  var title = 'Task OS · ' + name;
  var parts = [];
  if (view.symbol) parts.push(view.symbol);
  if (view.direction) parts.push(view.direction);
  var body = parts.join(' ');
  if (!body) body = view.text || '新优先卡片';
  if (body.length > 180) body = body.slice(0, 180) + '…';
  return { title: title, body: body };
}

/** Live frames only. Snapshot / backfill origins, known ids, and seen ids stay quiet. */
export function noticeForPriorityArrival(origin, item, options) {
  if (origin !== 'live') return null;
  var opts = options || {};
  if (opts.notify === false) return null;
  if (!item || typeof item.id !== 'string' || !item.id) return null;
  if (opts.knownIds && opts.knownIds[item.id]) return null;
  if (opts.seenIds && opts.seenIds[item.id]) return null;
  return priorityNotice(item, opts.sourceName || '');
}

export function noticesForPriorityItems(origin, items, options) {
  if (origin !== 'live') return [];
  var opts = options || {};
  if (opts.notify === false) return [];
  var known = Object.create(null);
  var seed = opts.knownIds || {};
  Object.keys(seed).forEach(function (id) {
    if (id) known[id] = true;
  });
  var out = [];
  (items || []).forEach(function (item) {
    var seen = opts.seenIds || null;
    if (!seen && typeof opts.seenFor === 'function') seen = opts.seenFor(item) || {};
    var sourceName = opts.sourceName || '';
    if (!sourceName && typeof opts.sourceNameFor === 'function') sourceName = opts.sourceNameFor(item) || '';
    var note = noticeForPriorityArrival('live', item, {
      notify: true,
      knownIds: known,
      seenIds: seen || {},
      sourceName: sourceName
    });
    if (!note || !item || !item.id) return;
    out.push({ id: item.id, title: note.title, body: note.body });
    known[item.id] = true;
  });
  return out;
}

function itemIdSet(items) {
  var set = Object.create(null);
  (items || []).forEach(function (item) {
    if (item && typeof item.id === 'string' && item.id) set[item.id] = true;
  });
  return set;
}

function requestNotificationPermission() {
  return new Promise(function (resolve) {
    try {
      if (typeof Notification === 'undefined' || typeof Notification.requestPermission !== 'function') {
        resolve(true);
        return;
      }
      if (Notification.permission === 'granted') {
        resolve(true);
        return;
      }
      Promise.resolve(Notification.requestPermission()).then(function (state) {
        resolve(state === 'granted' || (typeof Notification !== 'undefined' && Notification.permission === 'granted'));
      }, function () {
        resolve(false);
      });
    } catch (e) {
      resolve(true);
    }
  });
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

export function oiReportQueueUrl(base) {
  var root = normalizeBaseUrl(base || DEFAULT_OI_WEB_BASE_URL);
  if (!root) return '';
  return root + '/api/report-queue?kind=st_vol_wick&symbols=BTCUSDT,ETHUSDT';
}

export function normalizeOiPopSymbol(raw) {
  var s = String(raw || '').trim().toUpperCase().replace(/[\/-]/g, '');
  if (s.slice(-2) === '.P') s = s.slice(0, -2);
  if (s === 'BTC' || s === 'ETH') return s + 'USDT';
  return s;
}

export function isOiPopShortItem(item) {
  return isOiVolWickItem(item);
}

export function isOiVolWickItem(item) {
  if (!item || typeof item !== 'object') return false;
  var sym = normalizeOiPopSymbol(item.symbol);
  if (sym !== 'BTCUSDT' && sym !== 'ETHUSDT') return false;
  var kind = String(item.kind || '').trim();
  var pattern = String(item.pattern || '').trim();
  if (kind === 'st_vol_wick') return true;
  return pattern === '放量射击之星' || pattern === '放量倒锤子' || pattern === '放量上影' || pattern === '放量下影';
}

export function isoFromMillis(ms) {
  var n = Number(ms);
  if (!isFinite(n) || n <= 0) return '';
  if (n < 1e12) n *= 1000;
  var d = new Date(n);
  if (isNaN(d.getTime())) return '';
  return d.toISOString();
}

export function mapOiReportItem(item, sourceId, report) {
  if (!item || typeof item.id !== 'string' || !item.id) return null;
  var sid = sourceId || OI_REPORT_SOURCE_ID;
  var interval = String(item.interval || '').trim();
  var pattern = String(item.pattern || item.kind || '').trim();
  var volume = String(item.volumeSurgeLabel || '').trim();
  if (!volume) {
    if (item.volumeSurge === true || item.volumeSurge === 'yes' || item.volumeSurge === 'true') volume = '放量';
    else if (item.volumeSurge === false || item.volumeSurge === 'no') volume = '否';
    else volume = '未知';
  }
  var side = String(item.sideLabel || item.side || '').trim();
  if (side === 'bull' || side === 'long' || side === 'buy') side = '多';
  if (side === 'bear' || side === 'short' || side === 'sell') side = '空';
  var parts = [];
  if (interval) parts.push('周期 ' + interval);
  parts.push('放量 ' + volume);
  if (pattern) parts.push('形态 ' + pattern);
  if (side) parts.push('方向 ' + side);
  if (item.oiAnomaly) parts.push('OI异常');
  var created = isoFromMillis(item.timeMs) || isoFromMillis(report && report.windowEndMs) || '';
  return {
    id: item.id,
    source: sid,
    createdAt: created,
    card: {
      symbol: item.symbol || '',
      direction: side,
      interval: interval,
      pattern: pattern,
      volumeSurgeLabel: volume,
      title: pattern,
      text: parts.join(' · ')
    },
    meta: {
      via: 'oi_report',
      interval: interval,
      pattern: pattern,
      volumeSurgeLabel: volume,
      oiAnomaly: !!item.oiAnomaly
    }
  };
}

export function parseOiReportQueue(body, sourceId) {
  var sid = sourceId || OI_REPORT_SOURCE_ID;
  var reports = body && Array.isArray(body.reports) ? body.reports.slice() : [];
  if (body && body.pending && typeof body.pending === 'object') {
    reports = [body.pending].concat(reports);
  }
  var out = [];
  var seen = Object.create(null);
  reports.forEach(function (report) {
    ((report && report.items) || []).forEach(function (item) {
      if (!isOiVolWickItem(item)) return;
      var mapped = mapOiReportItem(item, sid, report);
      if (mapped && !seen[mapped.id]) {
        seen[mapped.id] = true;
        out.push(mapped);
      }
    });
  });
  return out;
}

export function withOiReportSource(sources) {
  var list = [];
  var seen = Object.create(null);
  function add(source) {
    if (!source || typeof source.id !== 'string' || !source.id) return;
    if (seen[source.id]) return;
    seen[source.id] = true;
    list.push({ id: source.id, name: source.name || source.id });
  }
  add(OI_REPORT_SOURCE);
  (sources && sources.length ? sources : DEFAULT_SOURCES).forEach(add);
  return list;
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
    via: meta.via === 'ocr' || meta.via === 'text' ? meta.via : '',
    interval: stringFrom(firstEntry(card, ['interval', '周期'])) || String(meta.interval || '').trim(),
    volumeSurge: stringFrom(firstEntry(card, ['volumeSurgeLabel', '是否放量'])) || String(meta.volumeSurgeLabel || '').trim(),
    pattern: stringFrom(firstEntry(card, ['pattern', '形态'])) || String(meta.pattern || '').trim()
  };
}

export function formatTime(iso) {
  var d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso || '');
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  return pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

export function normalizeSpecialSymbol(raw) {
  var s = String(raw == null ? '' : raw).trim().toUpperCase();
  if (!s) return '';
  s = s.replace(/\s+/g, '');
  if (s.slice(-2) === '.P') s = s.slice(0, -2);
  s = s.replace(/[^A-Z0-9]/g, '');
  if (!s) return '';
  for (var i = 0; i < SPECIAL_QUOTE_SUFFIXES.length; i++) {
    var quote = SPECIAL_QUOTE_SUFFIXES[i];
    if (s.length > quote.length && s.slice(-quote.length) === quote) {
      s = s.slice(0, -quote.length);
      break;
    }
  }
  return s;
}

export function parseSpecialSymbolList(raw) {
  var parts;
  if (Array.isArray(raw)) parts = raw;
  else parts = String(raw == null ? '' : raw).replace(/[\[\]"'`]/g, ' ').split(/[,，;；\s]+/);
  var seen = Object.create(null);
  var out = [];
  parts.forEach(function (part) {
    var sym = normalizeSpecialSymbol(part);
    if (!sym || seen[sym]) return;
    seen[sym] = true;
    out.push(sym);
  });
  return out;
}

/** A saved string replaces the code list. null/undefined keeps the code list. */
export function effectiveSpecialSymbols(stored, codeList) {
  if (stored == null) return parseSpecialSymbolList(codeList == null ? SPECIAL_SYMBOLS : codeList);
  return parseSpecialSymbolList(stored);
}

function specialSymbolSet(list) {
  var set = Object.create(null);
  parseSpecialSymbolList(list || []).forEach(function (sym) {
    set[sym] = true;
  });
  return set;
}

function itemSpecialSymbol(item) {
  return normalizeSpecialSymbol(describeItem(item, '').symbol);
}

export function sourceCounts(items, sourceId, seenIds, specialSymbols) {
  var messages = 0;
  var fresh = 0;
  var special = 0;
  var specials = specialSymbolSet(specialSymbols);
  (items || []).forEach(function (item) {
    if (!item || item.source !== sourceId) return;
    messages += 1;
    if (!(isTradeCard(item) && item.id && !(seenIds && seenIds[item.id]))) return;
    fresh += 1;
    var sym = itemSpecialSymbol(item);
    if (sym && specials[sym]) special += 1;
  });
  return { messages: messages, newCards: fresh, specialCards: special };
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

export function footerRows(sources, items, seenMap, configured, alwaysOn, specialSymbols) {
  var list = sources && sources.length ? sources : DEFAULT_SOURCES;
  var symbols = specialSymbols == null ? [] : specialSymbols;
  return list.map(function (source) {
    var id = source && source.id ? source.id : 'pangmao';
    var name = source && source.name ? source.name : id;
    var on = !!configured || !!(alwaysOn && alwaysOn[id]);
    if (!on) {
      return { id: id, name: name, messages: 0, newCards: 0, specialCards: 0, unconfigured: true };
    }
    var counts = sourceCounts(items, id, seenSet(seenMap, id), symbols);
    return {
      id: id,
      name: name,
      messages: counts.messages,
      newCards: counts.newCards,
      specialCards: counts.specialCards,
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
  OI_REPORT_SOURCE_ID: OI_REPORT_SOURCE_ID,
  OI_REPORT_SOURCE: OI_REPORT_SOURCE,
  DEFAULT_OI_WEB_BASE_URL: DEFAULT_OI_WEB_BASE_URL,
  oiReportQueueUrl: oiReportQueueUrl,
  parseOiReportQueue: parseOiReportQueue,
  mapOiReportItem: mapOiReportItem,
  withOiReportSource: withOiReportSource,
  normalizeBaseUrl: normalizeBaseUrl,
  sourcesUrl: sourcesUrl,
  queueUrl: queueUrl,
  toWebSocketUrl: toWebSocketUrl,
  isTradeCard: isTradeCard,
  describeItem: describeItem,
  formatTime: formatTime,
  SPECIAL_SYMBOLS: SPECIAL_SYMBOLS,
  normalizeSpecialSymbol: normalizeSpecialSymbol,
  parseSpecialSymbolList: parseSpecialSymbolList,
  effectiveSpecialSymbols: effectiveSpecialSymbols,
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
    sources: withOiReportSource(DEFAULT_SOURCES),
    items: [],
    networkConfigured: false,
    oiConfigured: false,
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

  var memory = null;
  var hydrateGen = 0;
  var connectedOnce = false;

  function tauriInvoke(cmd, payload) {
    var tauri = window.__TAURI__;
    if (!tauri || !tauri.core || !tauri.core.invoke) return null;
    return tauri.core.invoke(cmd, payload || {});
  }

  function readStoredBase() {
    try {
      return localStorage.getItem(STORAGE_KEYS.baseUrl);
    } catch (e) {
      return null;
    }
  }

  function readNotifyRaw() {
    try {
      return localStorage.getItem(STORAGE_KEYS.notify);
    } catch (e) {
      return null;
    }
  }

  function localBundle() {
    var secret = '';
    try {
      secret = localStorage.getItem(STORAGE_KEYS.secret) || '';
    } catch (e) {}
    return {
      baseUrl: readStoredBase() || '',
      secret: String(secret).trim(),
      notify: parseNotifyFlag(readNotifyRaw())
    };
  }

  function bundlesEqual(a, b) {
    if (!a || !b) return false;
    return (a.baseUrl || '') === (b.baseUrl || '')
      && (a.secret || '') === (b.secret || '')
      && ((a.notify !== false) === (b.notify !== false));
  }

  function writeLocalCache(bundle) {
    try {
      if (bundle.baseUrl) localStorage.setItem(STORAGE_KEYS.baseUrl, bundle.baseUrl);
      else localStorage.removeItem(STORAGE_KEYS.baseUrl);
      if (bundle.secret) localStorage.setItem(STORAGE_KEYS.secret, bundle.secret);
      else localStorage.removeItem(STORAGE_KEYS.secret);
      localStorage.setItem(STORAGE_KEYS.notify, bundle.notify === false ? '0' : '1');
    } catch (e) {}
  }

  function readConfig() {
    if (memory) return resolvePriorityConfig(memory.baseUrl, memory.secret);
    var local = localBundle();
    return resolvePriorityConfig(local.baseUrl, local.secret);
  }

  function notificationsEnabled() {
    if (memory) return memory.notify !== false;
    return parseNotifyFlag(readNotifyRaw());
  }

  function persistBundle(bundle) {
    memory = {
      baseUrl: bundle.baseUrl || '',
      secret: bundle.secret || '',
      notify: bundle.notify !== false,
      storePresent: !!bundle.storePresent
    };
    var pending = tauriInvoke('save_priority_config', {
      baseUrl: memory.baseUrl,
      secret: memory.secret,
      notify: memory.notify
    });
    // Cache after the keychain write so the other window does not hydrate a stale entry.
    if (!pending) {
      writeLocalCache(memory);
      return Promise.resolve();
    }
    return pending.then(function () {
      memory.storePresent = true;
      writeLocalCache(memory);
    }, function (err) {
      writeLocalCache(memory);
      throw err;
    });
  }

  function finishHydrate(gen, next) {
    if (gen !== hydrateGen) return;
    var prev = memory;
    var same = !!(prev && bundlesEqual(prev, next));
    if (!same) {
      memory = {
        baseUrl: next.baseUrl || '',
        secret: next.secret || '',
        notify: next.notify !== false,
        storePresent: !!next.storePresent
      };
      writeLocalCache(memory);
    }
    fillSettingsForm();
    var connectionSame = !!(prev && memory
      && (prev.baseUrl || '') === (memory.baseUrl || '')
      && (prev.secret || '') === (memory.secret || ''));
    if (connectionSame && connectedOnce) return;
    connectedOnce = true;
    restart();
  }

  function hydrateConfig() {
    var gen = ++hydrateGen;
    var local = localBundle();
    var pending = tauriInvoke('load_priority_config');
    if (!pending) {
      finishHydrate(gen, local);
      return;
    }
    pending.then(function (shared) {
      if (gen !== hydrateGen) return;
      var next = reconcilePriorityStore(shared, local);
      if (!next.migrate) {
        finishHydrate(gen, next);
        return;
      }
      persistBundle(next).then(function () {
        next.storePresent = true;
        finishHydrate(gen, next);
      }, function () {
        finishHydrate(gen, next);
      });
    }, function () {
      finishHydrate(gen, local);
    });
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

  function readSpecialSymbols() {
    var stored = null;
    try {
      stored = localStorage.getItem(STORAGE_KEYS.specialSymbols);
    } catch (e) {
      stored = null;
    }
    return effectiveSpecialSymbols(stored, SPECIAL_SYMBOLS);
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
    var rows = footerRows(state.sources, state.items, loadSeen(), displayConfigured(), { oi_report: true }, readSpecialSymbols());
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

      var special = document.createElement('span');
      special.className = 'priority-stat priority-special' + (row.specialCards > 0 ? ' is-hot' : '');
      special.title = '特别提醒：观察列表中的新交易卡片';
      var specialLabel = document.createElement('b');
      specialLabel.textContent = '特别';
      special.appendChild(specialLabel);
      special.appendChild(document.createTextNode(String(row.specialCards)));

      el.appendChild(name);
      el.appendChild(messages);
      el.appendChild(fresh);
      el.appendChild(special);
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
      if (listSource === OI_REPORT_SOURCE_ID) {
        empty.textContent = state.oiConfigured ? '暂无 BTC/ETH 5m 放量影线' : '未连接到本机 /oi（127.0.0.1:8765）';
      } else {
        empty.textContent = displayConfigured()
          ? '暂无消息'
          : '填写本机密钥后即可拉取消息。未保存地址时使用 https://op.g.ezcoin.ink。';
      }
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
      if (view.interval || view.volumeSurge || view.pattern) {
        var spec = document.createElement('div');
        spec.className = 'priority-item-main priority-item-oi';
        if (view.interval) {
          var tf = document.createElement('span');
          tf.textContent = '周期 ' + view.interval;
          spec.appendChild(tf);
        }
        if (view.volumeSurge) {
          var vol = document.createElement('span');
          vol.textContent = '放量 ' + view.volumeSurge;
          spec.appendChild(vol);
        }
        if (view.pattern) {
          var pat = document.createElement('span');
          pat.textContent = '形态 ' + view.pattern;
          spec.appendChild(pat);
        }
        article.appendChild(spec);
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
    var notifyInput = document.getElementById('priorityNotify');
    var baseStored = memory ? memory.baseUrl : readStoredBase();
    if (baseInput && document.activeElement !== baseInput) baseInput.value = displayBaseUrl(baseStored);
    if (secretInput && document.activeElement !== secretInput) secretInput.value = cfg.secret;
    if (notifyInput && document.activeElement !== notifyInput) notifyInput.checked = notificationsEnabled();
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

  function showSystemNotice(note) {
    if (!note || !note.title) return;
    var payload = { title: note.title, body: note.body || '' };
    // Ask on first use, then show through the shell. The shell command asks again
    // if permission is still missing. Only the title and body are sent.
    requestNotificationPermission().then(function () {
      var pending = tauriInvoke('show_price_alert', payload);
      if (pending && pending.catch) pending.catch(function () {});
    }, function () {
      var pending = tauriInvoke('show_price_alert', payload);
      if (pending && pending.catch) pending.catch(function () {});
    });
  }

  function publishNotices(origin, items, knownIds) {
    var notes = noticesForPriorityItems(origin, items, {
      notify: notificationsEnabled(),
      knownIds: knownIds || {},
      seenFor: function (item) {
        return seenSet(loadSeen(), item && item.source);
      },
      sourceNameFor: function (item) {
        return sourceName(item && item.source);
      }
    });
    notes.forEach(showSystemNotice);
  }

  function rememberFrame(frame, token) {
    if (token !== session || !frame) return;
    if (syncing) {
      wsBuffer = ingestPriorityFrame(wsBuffer, frame);
      return;
    }
    var known = itemIdSet(state.items);
    var arrived = ingestPriorityFrame([], frame);
    state.items = ingestPriorityFrame(state.items, frame);
    if (frame.source) ensureSource(frame.source);
    publishNotices('live', arrived, known);
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
      var previousIds = itemIdSet(state.items);
      var snapshotItems = nextItems.slice();
      var buffered = wsBuffer.slice();
      if (buffered.length) nextItems = mergeItems(nextItems, buffered);
      wsBuffer = [];
      syncing = false;
      state.lastError = '';
      backoff = 1000;
      var knownSources = Object.create(null);
      nextSources.forEach(function (source) { knownSources[source.id] = true; });
      knownSources[OI_REPORT_SOURCE_ID] = true;
      state.sources = withOiReportSource(nextSources);
      var oiNow = state.items.filter(function (item) {
        return item && item.source === OI_REPORT_SOURCE_ID;
      });
      nextItems = replaceSourceItems(nextItems, OI_REPORT_SOURCE_ID, oiNow);
      state.items = nextItems.filter(function (item) { return item && knownSources[item.source]; });
      var snapshotIds = itemIdSet(snapshotItems);
      // HTTP history is not a live arrival.
      publishNotices('snapshot', snapshotItems, previousIds);
      publishNotices('live', buffered.filter(function (item) {
        return item && item.id && !snapshotIds[item.id];
      }), previousIds);
      render();
    }, function (err) {
      if (token !== session) return;
      syncing = false;
      if (wsBuffer.length) {
        var previousIds = itemIdSet(state.items);
        var buffered = wsBuffer.slice();
        state.items = mergeItems(state.items, buffered);
        wsBuffer = [];
        buffered.forEach(function (item) {
          if (item && item.source) ensureSource(item.source);
        });
        publishNotices('live', buffered, previousIds);
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

  var oiTimer = null;
  var oiReady = false;

  // Packaged bubble pages cannot fetch 127.0.0.1:/oi (no CORS on JSON APIs).
  // The shell GET is limited to local :8765 /api/report-queue.
  function fetchOiReportQueue(url) {
    var tauri = window.__TAURI__;
    if (tauri && tauri.core && tauri.core.invoke) {
      return tauri.core.invoke('oi_report_queue_get', { url: url }).then(function (res) {
        var status = res && res.status;
        if (!status || status < 200 || status >= 300) {
          throw new Error('oi report-queue HTTP ' + (status || 0));
        }
        try {
          return JSON.parse((res && res.body) || '{}');
        } catch (e) {
          throw new Error('oi report-queue invalid json');
        }
      });
    }
    if (typeof fetch !== 'function') {
      return Promise.reject(new Error('oi report-queue fetch unavailable'));
    }
    return fetch(url, { headers: { Accept: 'application/json' } }).then(function (res) {
      if (!res.ok) throw new Error('oi report-queue HTTP ' + res.status);
      return res.json();
    });
  }

  function syncOiReports() {
    var url = oiReportQueueUrl(DEFAULT_OI_WEB_BASE_URL);
    if (!url) {
      state.oiConfigured = false;
      state.sources = withOiReportSource(state.sources);
      render();
      return Promise.resolve();
    }
    return fetchOiReportQueue(url).then(function (body) {
      var items = parseOiReportQueue(body);
      var previous = itemIdSet(state.items.filter(function (item) {
        return item && item.source === OI_REPORT_SOURCE_ID;
      }));
      state.oiConfigured = true;
      state.sources = withOiReportSource(state.sources);
      state.items = replaceSourceItems(state.items, OI_REPORT_SOURCE_ID, items);
      if (oiReady) {
        publishNotices('live', items.filter(function (item) {
          return item && item.id && !previous[item.id];
        }), previous);
      } else {
        publishNotices('snapshot', items, previous);
        oiReady = true;
      }
      render();
    }).catch(function (err) {
      state.oiConfigured = false;
      quietLog(err);
      state.sources = withOiReportSource(state.sources);
      render();
    });
  }

  function startOiPoll() {
    if (oiTimer) clearInterval(oiTimer);
    syncOiReports();
    oiTimer = setInterval(syncOiReports, OI_REPORT_POLL_MS);
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
    state.sources = withOiReportSource(state.networkConfigured ? state.sources : DEFAULT_SOURCES);
    if (!state.networkConfigured) {
      state.items = state.items.filter(function (item) {
        return item && item.source === OI_REPORT_SOURCE_ID;
      });
      render();
      return;
    }
    loop(token);
  }

  function applySnapshot(snap) {
    state.holdSnapshot = true;
    state.lastError = '';
    var sources = parseSources({ sources: snap && snap.sources });
    var snapItems = parseQueueItems({ items: snap && snap.items });
    var oiKeep = state.items.filter(function (item) { return item && item.source === OI_REPORT_SOURCE_ID; });
    state.sources = withOiReportSource(sources.length ? sources : DEFAULT_SOURCES);
    state.items = mergeItems(oiKeep, snapItems);
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
    var notifyInput = document.getElementById('priorityNotify');
    var notify = notifyInput ? !!notifyInput.checked : notificationsEnabled();
    function afterPersist(ok) {
      if (hint) {
        if (!ok) hint.textContent = '钥匙串暂不可用，已写入本机缓存';
        else if (!secret) hint.textContent = keepCustom ? '已保留地址并清除密钥' : '已清除本机密钥';
        else hint.textContent = '已保存，正在连接';
      }
      restart();
    }
    if (!secret) {
      var keepCustom = baseRaw && normalizeBaseUrl(baseRaw) !== DEFAULT_BASE_URL;
      var clearedBase = keepCustom ? normalizeBaseUrl(baseRaw) : '';
      if (baseInput) baseInput.value = keepCustom ? clearedBase : DEFAULT_BASE_URL;
      persistBundle({ baseUrl: clearedBase, secret: '', notify: notify, storePresent: !!(memory && memory.storePresent) }).then(function () {
        afterPersist(true);
      }, function () {
        afterPersist(false);
      });
      return;
    }
    var base = baseRaw ? normalizeBaseUrl(baseRaw) : DEFAULT_BASE_URL;
    if (baseInput) baseInput.value = base;
    persistBundle({ baseUrl: base, secret: secret, notify: notify, storePresent: !!(memory && memory.storePresent) }).then(function () {
      afterPersist(true);
    }, function () {
      afterPersist(false);
    });
  }

  function closest(node, selector) {
    if (!node || !node.closest) return null;
    return node.closest(selector);
  }

  api.applySnapshot = applySnapshot;
  api.openList = openList;
  api.closePanel = closePanel;
  api.footerModel = function () {
    return footerRows(state.sources, state.items, loadSeen(), displayConfigured(), { oi_report: true }, readSpecialSymbols());
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
  var notifyBox = document.getElementById('priorityNotify');
  if (notifyBox) {
    notifyBox.addEventListener('change', function () {
      if (!memory) {
        notifyBox.checked = notificationsEnabled();
        return;
      }
      var nextNotify = {
        baseUrl: memory.baseUrl || '',
        secret: memory.secret || '',
        notify: !!notifyBox.checked,
        storePresent: !!memory.storePresent
      };
      // An empty keychain must stay empty so a secret saved on the other origin can still migrate.
      if (!nextNotify.storePresent && !nextNotify.secret && !nextNotify.baseUrl) {
        memory = nextNotify;
        writeLocalCache(memory);
        return;
      }
      persistBundle(nextNotify).catch(function () {});
    });
  }
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && panelMode) closePanel();
  });
  window.addEventListener('storage', function (event) {
    if (!event.key) return;
    if (event.key === STORAGE_KEYS.baseUrl || event.key === STORAGE_KEYS.secret || event.key === STORAGE_KEYS.notify) {
      hydrateConfig();
    } else if (event.key === STORAGE_KEYS.seen || event.key === STORAGE_KEYS.specialSymbols) render();
  });

  render();
  hydrateConfig();
  startOiPoll();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootFooter);
  else bootFooter();
}
