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
  range: 'taskos.desktop.priority.range',
  debug: 'taskos.desktop.priority.debug'
};

/** Public relay on the VPS. Used only when the user has not saved a base URL. */
export var DEFAULT_BASE_URL = 'https://op.g.ezcoin.ink';

export var DEFAULT_SOURCES = Object.freeze([
  Object.freeze({ id: 'pangmao', name: '胖猫社区' })
]);

export var OI_REPORT_SOURCE_ID = 'oi_report';
export var OI_REPORT_SOURCE = Object.freeze({ id: 'oi_report', name: 'BTC/ETH 5m 放量影线' });
export var DEFAULT_OI_WEB_BASE_URL = 'http://127.0.0.1:8765';
/** Local first; the existing Mac FRP path is used when this machine has no :8765. */
export var OI_WEB_BASE_CANDIDATES = Object.freeze([
  DEFAULT_OI_WEB_BASE_URL,
  'http://45.207.196.71:39134'
]);
export var OI_REPORT_POLL_MS = 15000;

export var DISPLAY_TIME_ZONE = 'Asia/Hong_Kong';
export var DEFAULT_AUTOSCRIPT_FEED_BASE_URL = 'http://127.0.0.1:3852';
/** Local first; the existing Mac FRP path is used when this machine has no :3852. */
export var AUTOSCRIPT_FEED_BASE_CANDIDATES = Object.freeze([
  DEFAULT_AUTOSCRIPT_FEED_BASE_URL,
  'http://45.207.196.71:39137'
]);
export var AUTOSCRIPT_FEED_POLL_MS = 10000;

export var AUTOSCRIPT_CARD_SOURCE = Object.freeze({ id: 'autoscript_cards', name: '信号卡片' });
export var AUTOSCRIPT_ORDER_SOURCE = Object.freeze({ id: 'autoscript_orders', name: '自动挂单/下单' });
export var AUTOSCRIPT_CDP_SOURCE = Object.freeze({ id: 'autoscript_cdp', name: 'CDP 发布' });
export var AUTOSCRIPT_FEED_SOURCES = Object.freeze([
  AUTOSCRIPT_CARD_SOURCE,
  AUTOSCRIPT_ORDER_SOURCE,
  AUTOSCRIPT_CDP_SOURCE
]);
export var KOLVIP_AUTOTRADE_SOURCES = Object.freeze([
  Object.freeze({ id: 'kolvip_huajie', name: '华尔街女王' }),
  Object.freeze({ id: 'kolvip_lingxia', name: '零下二度VIP禁言群' }),
  Object.freeze({ id: 'kolvip_kacang', name: 'kacang-团队' }),
  Object.freeze({ id: 'kolvip_fxgold', name: 'FX-黄金信号' }),
  Object.freeze({ id: 'kolvip_binancekiller', name: '币安杀手' }),
  Object.freeze({ id: 'kolvip_aoying', name: '熬鹰' })
]);

export var QUEUE_LIMIT = 200;
export var SEEN_CAP = 800;
export var DEFAULT_ITEM_RANGE = 'today';
export var ITEM_RANGE_OPTIONS = Object.freeze([
  Object.freeze({ id: 'today', name: '今天 0 点起' }),
  Object.freeze({ id: '24h', name: '最近 24h' }),
  Object.freeze({ id: 'week', name: '最近一周' }),
  Object.freeze({ id: 'all', name: '全部' })
]);
export var LIST_FOLD_LIMIT = 4;
export var TEXT_FOLD_LINES = 4;

var SYMBOL_KEYS = ['symbol', 'pair', 'ticker', 'coin', '币种', '交易对'];
var DIRECTION_KEYS = ['direction', 'side', 'dir', '方向'];
var YIELD_KEYS = ['yield', 'yield_pct', 'pnl', 'profit', '收益', '收益率'];
var TEXT_BODY_KEYS = ['text', 'body', 'content', 'summary', 'message', '内容', '备注'];
var TEXT_TITLE_KEYS = ['title', '摘要'];
var CHANNEL_KEYS = ['channel', 'channelName', 'channel_name', '频道名称', '频道'];
var PRICE_KEYS = ['price', 'currentPrice', 'current_price', 'lastPrice', 'markPrice', '当前价格', '现价'];
var ENTRY_KEYS = ['entry', '入场'];

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
  if (isCdpRunSummary(item)) {
    var sig = enrichCdpSignalFields(item, []);
    var main = formatCdpRunMainLine(sig);
    if (main) parts.push(main);
    var summary = buildCdpPlatformSummary(item, [item]);
    if (summary) parts.push(summary.split('\n')[0]);
  } else {
    if (view.symbol) parts.push(view.symbol);
    if (view.direction) parts.push(view.direction);
  }
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
  if (isCdpFeedFragment(item)) return null;
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

export function isAutoscriptFeedSourceId(id) {
  var s = String(id || '');
  if (AUTOSCRIPT_FEED_SOURCES.some(function (src) { return src.id === s; })) return true;
  return KOLVIP_AUTOTRADE_SOURCES.some(function (src) { return src.id === s; });
}

export function isLocalPrioritySourceId(id) {
  return id === OI_REPORT_SOURCE_ID || isAutoscriptFeedSourceId(id);
}

export function localPriorityAlwaysOn() {
  var map = { oi_report: true };
  AUTOSCRIPT_FEED_SOURCES.forEach(function (src) { map[src.id] = true; });
  KOLVIP_AUTOTRADE_SOURCES.forEach(function (src) { map[src.id] = true; });
  return map;
}

/**
 * 气泡行顺序：OI → 信号卡片/挂单下单/CDP 发布 → 胖猫社区及其他中转来源 → kolvip 白名单频道。
 */
export function arrangePrioritySources(sources) {
  var list = [];
  var seen = Object.create(null);
  function add(source) {
    if (!source || typeof source.id !== 'string' || !source.id) return;
    if (seen[source.id]) return;
    seen[source.id] = true;
    list.push({ id: source.id, name: source.name || source.id });
  }
  add(OI_REPORT_SOURCE);
  AUTOSCRIPT_FEED_SOURCES.forEach(add);
  var incoming = sources && sources.length ? sources : DEFAULT_SOURCES;
  incoming.forEach(function (source) {
    if (!source || isLocalPrioritySourceId(source.id)) return;
    add(source);
  });
  if (!seen.pangmao) add(DEFAULT_SOURCES[0]);
  KOLVIP_AUTOTRADE_SOURCES.forEach(add);
  return list;
}

export function autoscriptFeedSourcesUrl(base) {
  var root = normalizeBaseUrl(base || DEFAULT_AUTOSCRIPT_FEED_BASE_URL);
  if (!root) return '';
  return root + '/queue/priority/sources';
}

export function autoscriptFeedQueueUrl(base, source, limit) {
  return queueUrl(base || DEFAULT_AUTOSCRIPT_FEED_BASE_URL, source, limit);
}

/** Local feed may omit the token when no secret is configured. */
export function autoscriptFeedWebSocketUrl(base, secret) {
  var root = normalizeBaseUrl(base || DEFAULT_AUTOSCRIPT_FEED_BASE_URL);
  if (!root) return '';
  var u = new URL(root + '/ws/priority');
  u.protocol = u.protocol === 'https:' ? 'wss:' : 'ws:';
  u.search = '';
  var token = String(secret || '').trim();
  if (token) u.searchParams.set('token', token);
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
  var kind = String(meta.kind || '').trim();
  if (kind === 'card' || kind === 'order' || kind === 'cdp') return true;
  if (meta.via === 'ocr' || meta.via === 'text' || meta.via === 'card' || meta.via === 'order' || meta.via === 'cdp') return true;
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

var CDP_PLATFORM_LABELS = {
  gate: 'Gate',
  okx: 'OKX',
  binance_square: '币安广场',
  bitget: 'Bitget',
  x: 'X / Twitter',
  twitter: 'X / Twitter'
};

export function parseCdpItemId(id, item) {
  var raw = typeof id === 'string' ? id : (item && typeof item.id === 'string' ? item.id : '');
  if (typeof raw !== 'string' || raw.indexOf('cdp:') !== 0) return null;
  var parts = raw.split(':');
  var event = parts[1] || '';
  var tail = parts.length >= 4 ? parts[parts.length - 1] : '';
  var jobId = parts.length >= 4 ? parts.slice(2, parts.length - 1).join(':') : (parts[2] || '');
  if (item) {
    var metaJob = String((metaOf(item).jobId || metaOf(item).job_id || '')).trim();
    if (metaJob) jobId = metaJob;
  }
  return { event: event, jobId: jobId, tail: tail };
}

function cdpNormalizeJobId(jobId) {
  return String(jobId || '').replace(/:/g, '-');
}

export function isCdpSourceItem(item) {
  return !!(item && item.source === AUTOSCRIPT_CDP_SOURCE.id);
}

export function cdpEventName(item) {
  var meta = metaOf(item);
  if (meta.event) return String(meta.event).trim();
  var parsed = parseCdpItemId(item && item.id, item);
  return parsed ? parsed.event : '';
}

/** 列表里只展示整次发布的 run_end；platform_ok/fail 等碎片仅用于汇总。 */
export function isCdpRunSummary(item) {
  return isCdpSourceItem(item) && cdpEventName(item) === 'run_end';
}

export function isCdpFeedFragment(item) {
  return isCdpSourceItem(item) && !isCdpRunSummary(item);
}

function cdpLabelPlatform(code) {
  var key = String(code == null ? '' : code).trim().toLowerCase();
  if (!key || key === '?' || key === 'all') return '';
  return CDP_PLATFORM_LABELS[key] || String(code).trim();
}

function cdpPickFields(obj, keys) {
  if (!obj || typeof obj !== 'object') return '';
  return stringFrom(firstEntry(obj, keys));
}

function cdpMergeSiblingSignal(target, donor) {
  if (!donor || typeof donor !== 'object') return;
  var card = cardOf(donor);
  var meta = metaOf(donor);
  var nested = meta.signal && typeof meta.signal === 'object' && !Array.isArray(meta.signal) ? meta.signal : null;
  var snap = meta.card && typeof meta.card === 'object' && !Array.isArray(meta.card) ? meta.card : null;
  if (!target.channel) {
    target.channel = cdpPickFields(card, CHANNEL_KEYS)
      || cdpPickFields(nested, CHANNEL_KEYS)
      || cdpPickFields(snap, CHANNEL_KEYS)
      || String(meta.channel || meta.channelName || '').trim();
  }
  if (!target.symbol) {
    target.symbol = compactHintSymbol(
      cdpPickFields(card, SYMBOL_KEYS)
        || cdpPickFields(nested, SYMBOL_KEYS)
        || cdpPickFields(snap, SYMBOL_KEYS)
        || String(meta.symbol || '').trim()
    ) || cdpPickFields(card, SYMBOL_KEYS);
  }
  if (!target.direction) {
    target.direction = compactHintDirection(
      cdpPickFields(card, DIRECTION_KEYS)
        || cdpPickFields(nested, DIRECTION_KEYS)
        || cdpPickFields(snap, DIRECTION_KEYS)
        || String(meta.direction || '').trim()
    ) || cdpPickFields(card, DIRECTION_KEYS);
  }
  if (!target.openedRaw) {
    target.openedRaw = meta.cardOpenedAt || meta.openedAt || meta.signalAt || meta.orderTime
      || cdpPickFields(card, ['openedAt', 'cardOpenedAt', '开单时间', 'signalTime'])
      || cdpPickFields(nested, ['openedAt', 'cardOpenedAt', '开单时间', 'signalTime']);
  }
  if (!target.cardId) {
    target.cardId = cdpPickFields(card, ['cardId', '卡片']) || String(meta.cardId || '').trim();
  }
}

function cdpPlatformDetail(it, ev) {
  if (ev === 'platform_ok') return 'done';
  var view = describeItem(it, '');
  var st = String(view.status || metaOf(it).status || '').toLowerCase();
  if (st === 'ok' || st === 'success' || st === 'filled') return 'done';
  var reason = String(view.reason || '').trim();
  if (!reason || /^error$/i.test(reason) || st === 'fail' || st === 'failed' || st === 'error') {
    return 'error';
  }
  if (/发布成功|done/i.test(reason)) return 'done';
  return 'error';
}

function cdpReadPublishCounts(item) {
  var card = cardOf(item);
  var meta = metaOf(item);
  var sc = meta.successCount != null ? meta.successCount : meta.success_count;
  var tot = meta.total != null ? meta.total : meta.totalCount;
  if (sc != null && tot != null && isFinite(Number(sc)) && isFinite(Number(tot))) {
    return { success: Number(sc), total: Number(tot) };
  }
  var raw = cdpPickFields(card, ['text', 'body', 'message'])
    || cdpPickFields(card, TEXT_TITLE_KEYS)
    || shortText(card);
  var m = String(raw).match(/成功\s*(\d+)\s*\/\s*(\d+)/);
  if (m) return { success: Number(m[1]), total: Number(m[2]) };
  return null;
}

export function enrichCdpSignalFields(item, allItems) {
  var card = cardOf(item);
  var meta = metaOf(item);
  var nested = meta.signal && typeof meta.signal === 'object' && !Array.isArray(meta.signal) ? meta.signal : null;
  var snap = meta.card && typeof meta.card === 'object' && !Array.isArray(meta.card) ? meta.card : null;
  var parsed = parseCdpItemId(item && item.id, item);
  var jobId = parsed && parsed.jobId ? parsed.jobId : '';

  var channel = cdpPickFields(card, CHANNEL_KEYS)
    || cdpPickFields(nested, CHANNEL_KEYS)
    || cdpPickFields(snap, CHANNEL_KEYS)
    || String(meta.channel || meta.channelName || '').trim();
  var symbol = cdpPickFields(card, SYMBOL_KEYS)
    || cdpPickFields(nested, SYMBOL_KEYS)
    || cdpPickFields(snap, SYMBOL_KEYS)
    || String(meta.symbol || '').trim();
  var direction = cdpPickFields(card, DIRECTION_KEYS)
    || cdpPickFields(nested, DIRECTION_KEYS)
    || cdpPickFields(snap, DIRECTION_KEYS)
    || String(meta.direction || '').trim();
  symbol = compactHintSymbol(symbol) || symbol;
  direction = compactHintDirection(direction) || direction;

  var openedRaw = meta.cardOpenedAt || meta.openedAt || meta.signalAt || meta.orderTime
    || cdpPickFields(card, ['openedAt', 'cardOpenedAt', '开单时间', 'signalTime'])
    || cdpPickFields(nested, ['openedAt', 'cardOpenedAt', '开单时间', 'signalTime']);
  var cardId = cdpPickFields(card, ['cardId', '卡片'])
    || String(meta.cardId || '').trim();

  if (allItems && jobId) {
    var bucket = { channel: channel, symbol: symbol, direction: direction, openedRaw: openedRaw, cardId: cardId };
    for (var s = 0; s < allItems.length; s++) {
      var sib = allItems[s];
      if (!sib || sib === item) continue;
      var pj = parseCdpItemId(sib.id, sib);
      if (!pj || cdpNormalizeJobId(pj.jobId) !== cdpNormalizeJobId(jobId)) continue;
      cdpMergeSiblingSignal(bucket, sib);
    }
    channel = bucket.channel;
    symbol = bucket.symbol;
    direction = bucket.direction;
    openedRaw = bucket.openedRaw;
    cardId = bucket.cardId;
  }

  if (allItems && (!channel || !symbol || !direction || !openedRaw) && cardId) {
    for (var i = 0; i < allItems.length; i++) {
      var it = allItems[i];
      if (!it || it.source !== AUTOSCRIPT_CARD_SOURCE.id) continue;
      var cid = cdpPickFields(cardOf(it), ['cardId', '卡片']) || String(metaOf(it).cardId || '').trim();
      if (cid !== cardId && String(it.id) !== 'card:' + cardId && !String(it.id).endsWith(':' + cardId)) continue;
      var linked = describeItem(it, '');
      if (!channel) channel = linked.channel;
      if (!symbol) symbol = compactHintSymbol(linked.symbol) || linked.symbol;
      if (!direction) direction = compactHintDirection(linked.direction) || linked.direction;
      if (!openedRaw && linked.time) openedRaw = linked.time;
      break;
    }
  }

  var openedAt = '';
  if (openedRaw) {
    var ts = itemTimestampMs({ createdAt: openedRaw });
    openedAt = isFinite(ts) ? formatTime(new Date(ts).toISOString()) : String(openedRaw);
  }
  return {
    channel: channel,
    symbol: symbol,
    direction: direction,
    openedAt: openedAt,
    cardId: cardId,
    jobId: jobId
  };
}

export function cdpSignalMissingHint(signal) {
  if (!signal) return '';
  var miss = [];
  if (!signal.channel) miss.push('频道');
  if (!signal.symbol) miss.push('币种');
  if (!signal.direction) miss.push('方向');
  if (!signal.openedAt) miss.push('开单时间');
  if (!miss.length) return '';
  return '待补：' + miss.join('、') + '（3852 run_end 需带 signal/card 或 cardId）';
}

export function formatCdpRunMainLine(signal) {
  if (!signal) signal = {};
  var channel = signal.channel ? truncateChannelName(signal.channel) : '—';
  var symbol = signal.symbol || '—';
  var direction = signal.direction || '—';
  var opened = signal.openedAt ? signal.openedAt : '—';
  return channel + ' · ' + symbol + ' · ' + direction + ' · 开单 ' + opened;
}

export function buildCdpPlatformSummary(item, allItems) {
  var parsed = parseCdpItemId(item && item.id, item);
  var jobId = parsed && parsed.jobId ? parsed.jobId : '';
  var meta = metaOf(item);
  var lines = [];
  var byCode = Object.create(null);

  (allItems || []).forEach(function (it) {
    if (!isCdpSourceItem(it)) return;
    var pi = parseCdpItemId(it.id, it);
    if (!pi || !pi.jobId) return;
    if (jobId && cdpNormalizeJobId(pi.jobId) !== cdpNormalizeJobId(jobId)) return;
    var ev = cdpEventName(it);
    if (ev !== 'platform_ok' && ev !== 'platform_fail' && ev !== 'platform_skip') return;
    var code = (pi.tail || describeItem(it, '').platform || '').trim();
    var label = cdpLabelPlatform(code) || code;
    var mark = ev === 'platform_ok' ? '✓' : (ev === 'platform_fail' ? '✗' : '–');
    var detail = cdpPlatformDetail(it, ev);
    byCode[code || label] = mark + ' ' + label + '：' + detail;
  });

  ['gate', 'okx', 'binance_square', 'bitget', 'x', 'twitter'].forEach(function (code) {
    if (byCode[code]) {
      lines.push(byCode[code]);
      delete byCode[code];
    }
  });
  Object.keys(byCode).sort().forEach(function (code) { lines.push(byCode[code]); });

  var counts = cdpReadPublishCounts(item);
  if (counts) {
    lines.unshift('发布汇总 · 成功 ' + counts.success + '/' + counts.total);
  }

  if (!lines.length && Array.isArray(meta.platforms)) {
    meta.platforms.forEach(function (row) {
      if (!row || typeof row !== 'object') return;
      var name = cdpLabelPlatform(row.platform || row.name) || String(row.platform || row.name || '');
      var ok = row.ok === true || row.status === 'ok' || row.status === 'success';
      lines.push((ok ? '✓ ' : '✗ ') + name);
    });
  }

  if (!lines.length) {
    var fallback = shortText(cardOf(item)).replace(/发布结束\s*/g, '').trim();
    if (fallback) lines.push(fallback);
  }
  return lines.join('\n');
}

export function describeItem(item, sourceName) {
  var card = cardOf(item);
  var meta = metaOf(item);
  return {
    id: item && typeof item.id === 'string' ? item.id : '',
    time: item && typeof item.createdAt === 'string' ? item.createdAt : '',
    sourceName: sourceName || (item && item.source) || '',
    channel: stringFrom(firstEntry(card, CHANNEL_KEYS)),
    symbol: stringFrom(firstEntry(card, SYMBOL_KEYS)),
    direction: stringFrom(firstEntry(card, DIRECTION_KEYS)),
    price: stringFrom(firstEntry(card, PRICE_KEYS)),
    yieldValue: yieldText(card, meta),
    text: shortText(card),
    via: meta.via === 'ocr' || meta.via === 'text' ? meta.via : '',
    interval: stringFrom(firstEntry(card, ['interval', '周期'])) || String(meta.interval || '').trim(),
    volumeSurge: stringFrom(firstEntry(card, ['volumeSurgeLabel', '是否放量'])) || String(meta.volumeSurgeLabel || '').trim(),
    pattern: stringFrom(firstEntry(card, ['pattern', '形态'])) || String(meta.pattern || '').trim(),
    kind: String(meta.kind || meta.via || '').trim(),
    status: stringFrom(firstEntry(card, ['status', '状态'])) || String(meta.result || meta.status || '').trim(),
    exchange: stringFrom(firstEntry(card, ['exchange', '交易所'])) || String(meta.exchange || '').trim(),
    platform: stringFrom(firstEntry(card, ['platform', '平台'])) || String(meta.platform || '').trim(),
    reason: stringFrom(firstEntry(card, ['reason', '原因'])) || String(meta.reason || '').trim(),
    entry: stringFrom(firstEntry(card, ENTRY_KEYS)) || String(meta.entry || '').trim(),
    cardId: stringFrom(firstEntry(card, ['cardId', '卡片'])) || String(meta.cardId || '').trim()
  };
}

export function formatTime(iso, timeZone) {
  var d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso || '');
  var zone = timeZone || DISPLAY_TIME_ZONE;
  var parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: zone,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(d);
  var map = Object.create(null);
  parts.forEach(function (part) { map[part.type] = part.value; });
  return map.month + '-' + map.day + ' ' + map.hour + ':' + map.minute;
}

/** Unset or unknown values use today from 00:00 Asia/Hong_Kong. */
export function parseRangeKey(raw) {
  var s = String(raw == null ? '' : raw).trim().toLowerCase();
  if (s === 'today' || s === '24h' || s === 'week' || s === 'all') return s;
  return DEFAULT_ITEM_RANGE;
}

export function rangeOptionLabel(rangeKey) {
  var key = parseRangeKey(rangeKey);
  for (var i = 0; i < ITEM_RANGE_OPTIONS.length; i++) {
    if (ITEM_RANGE_OPTIONS[i].id === key) return ITEM_RANGE_OPTIONS[i].name;
  }
  return ITEM_RANGE_OPTIONS[0].name;
}

/** Start of the calendar day in Asia/Hong_Kong (no DST, UTC+8). */
export function startOfHongKongDay(now) {
  var d = now instanceof Date ? now : new Date(now || Date.now());
  if (isNaN(d.getTime())) d = new Date();
  var day = new Intl.DateTimeFormat('en-CA', {
    timeZone: DISPLAY_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);
  return new Date(day + 'T00:00:00+08:00').getTime();
}

export function rangeStartMs(rangeKey, now) {
  var key = parseRangeKey(rangeKey);
  var at = now instanceof Date ? now.getTime() : (now != null ? Number(now) : Date.now());
  if (!isFinite(at)) at = Date.now();
  if (key === 'all') return 0;
  if (key === '24h') return at - 24 * 60 * 60 * 1000;
  if (key === 'week') return at - 7 * 24 * 60 * 60 * 1000;
  return startOfHongKongDay(at);
}

export function itemTimestampMs(item) {
  if (!item || typeof item !== 'object') return NaN;
  var raw = item.createdAt;
  if (raw == null || raw === '') raw = item.created_at;
  if ((raw == null || raw === '') && item.meta && item.meta.timeMs != null) raw = item.meta.timeMs;
  if (typeof raw === 'number' && isFinite(raw) && raw > 0) {
    return raw < 1e12 ? raw * 1000 : raw;
  }
  if (typeof raw === 'string' && raw) {
    var ts = Date.parse(raw);
    if (isFinite(ts)) return ts;
    var asNum = Number(raw);
    if (isFinite(asNum) && asNum > 0) return asNum < 1e12 ? asNum * 1000 : asNum;
  }
  return NaN;
}

export function isSignalCard(item) {
  if (!item || typeof item !== 'object') return false;
  if (item.source === AUTOSCRIPT_CARD_SOURCE.id) return true;
  var meta = metaOf(item);
  var kind = String(meta.kind || '').trim();
  var via = String(meta.via || '').trim();
  return kind === 'card' || via === 'card';
}

export function latestSignalCard(items) {
  var list = Array.isArray(items) ? items : [];
  var best = null;
  var bestTs = -Infinity;
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    if (!isSignalCard(item)) continue;
    var ts = itemTimestampMs(item);
    if (!isFinite(ts)) ts = -1;
    var preferSource = best && ts === bestTs
      && item.source === AUTOSCRIPT_CARD_SOURCE.id
      && best.source !== AUTOSCRIPT_CARD_SOURCE.id;
    if (!best || ts > bestTs || preferSource) {
      best = item;
      bestTs = ts;
    }
  }
  return best;
}

/** Compact footer hint for the newest 信号卡片. Missing fields are omitted; entry is used when no current price exists. */
/** First 5 Unicode code points; longer names get a trailing '...'. Blank names stay blank. */
export function truncateChannelName(name) {
  var raw = String(name == null ? '' : name).trim();
  if (!raw) return '';
  var chars = [...raw];
  if (chars.length <= 5) return chars.join('');
  return chars.slice(0, 5).join('') + '...';
}

/** Compact ticker only (BTC, ETHUSDT, XAU/USD). Paragraphs are rejected. */
export function compactHintSymbol(raw) {
  var s = String(raw == null ? '' : raw).trim();
  if (!s) return '';
  if (/^[A-Za-z0-9.$/_-]{1,16}$/.test(s)) return s;
  return '';
}

/** Compact 多/空/做多/LONG etc. Extracts a leading token; rejects a raw paragraph. */
export function compactHintDirection(raw) {
  var s = String(raw == null ? '' : raw).trim();
  if (!s) return '';
  var longTok = s.match(/^(做多|做空|多单|空单|long|short|buy|sell)/i);
  if (longTok) {
    var rest = s.slice(longTok[0].length);
    if (!rest || /^[\s，,。；;：:、]/.test(rest)) return longTok[0];
    return '';
  }
  var shortTok = s.match(/^(多|空)(?=$|[\s，,。；;：:、])/);
  if (shortTok) return shortTok[1];
  return '';
}

/**
 * Short numeric price or range only. If entry is a long brief, take a range
 * clearly at the start (e.g. 当前5.84-5.89附近…). Never keep 止盈/止损/理由/仓位.
 */
export function compactHintPrice(raw) {
  var s = String(raw == null ? '' : raw).trim();
  if (!s) return '';
  if (/止盈|止损|理由|仓位|信心度|倍数|点位/.test(s) || [...s].length > 24) {
    var start = s.replace(/^当前/, '');
    var m = start.match(/^(\d+(?:\.\d+)?)(\s*[-–~至到]\s*)(\d+(?:\.\d+)?)/);
    if (m) return m[1] + '-' + m[3];
    var one = start.match(/^(\d+(?:\.\d+)?)/);
    if (one && [...one[1]].length <= 12) return one[1];
    return '';
  }
  if (/^\d+(?:\.\d+)?(?:\s*[-–~至到]\s*\d+(?:\.\d+)?)?$/.test(s)) return s;
  return '';
}

export function formatLatestCardHint(item) {
  if (!item) return '';
  var view = describeItem(item, '');
  var symbol = compactHintSymbol(view.symbol);
  var direction = compactHintDirection(view.direction);
  if (!symbol || !direction) return '';
  var parts = [];
  var channel = truncateChannelName(view.channel);
  if (channel) parts.push(channel);
  parts.push(symbol);
  var price = compactHintPrice(view.price || view.entry);
  if (price) parts.push(price);
  parts.push(direction);
  var ts = itemTimestampMs(item);
  var time = isFinite(ts) ? formatTime(new Date(ts).toISOString()) : (view.time ? formatTime(view.time) : '');
  if (time) parts.push(time);
  return parts.join(' · ');
}

export function itemInRange(item, rangeKey, now) {
  var key = parseRangeKey(rangeKey);
  if (key === 'all') return true;
  var ts = itemTimestampMs(item);
  if (!isFinite(ts)) return false;
  return ts >= rangeStartMs(key, now);
}

export function filterItemsByRange(items, rangeKey, now) {
  var key = parseRangeKey(rangeKey);
  if (key === 'all') return (items || []).slice();
  return (items || []).filter(function (item) { return itemInRange(item, key, now); });
}

export function foldList(items, limit, expanded) {
  var list = items || [];
  var cap = Number(limit);
  if (!isFinite(cap) || cap <= 0) cap = LIST_FOLD_LIMIT;
  if (expanded || list.length <= cap) {
    return { items: list, hidden: 0, folded: false };
  }
  return { items: list.slice(0, cap), hidden: list.length - cap, folded: true };
}


export function sourceCounts(items, sourceId, seenIds) {
  var messages = 0;
  var fresh = 0;
  (items || []).forEach(function (item) {
    if (!item || item.source !== sourceId) return;
    if (isCdpFeedFragment(item)) return;
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

export function autoscriptOrderIdentityId(item) {
  if (!item || item.source !== AUTOSCRIPT_ORDER_SOURCE.id) {
    return item && typeof item.id === 'string' ? item.id : '';
  }
  var card = item.card && typeof item.card === 'object' && !Array.isArray(item.card) ? item.card : {};
  var meta = item.meta && typeof item.meta === 'object' && !Array.isArray(item.meta) ? item.meta : {};
  var exchange = String(card.exchange || meta.exchange || '').trim().toLowerCase() || 'x';
  var key = String(card.cardId != null && card.cardId !== '' ? card.cardId : (meta.cardId || '')).trim();
  if (key) return 'order:' + exchange + ':' + key;
  if (typeof item.id === 'string' && item.id.indexOf('order:') === 0) return item.id;
  return typeof item.id === 'string' ? item.id : '';
}

export function mergeItems(existing, incoming) {
  var map = Object.create(null);
  var order = [];
  function upsert(item) {
    if (!item || typeof item.id !== 'string' || !item.id) return;
    if (!Object.prototype.hasOwnProperty.call(map, item.id)) {
      order.push(item.id);
      map[item.id] = item;
      return;
    }
    var prev = map[item.id];
    if (item.source === AUTOSCRIPT_ORDER_SOURCE.id && prev && prev.source === AUTOSCRIPT_ORDER_SOURCE.id) {
      var ta = itemTimestampMs(item);
      var tb = itemTimestampMs(prev);
      if (!isFinite(ta)) ta = 0;
      if (!isFinite(tb)) tb = 0;
      map[item.id] = ta >= tb ? item : prev;
    } else {
      map[item.id] = item;
    }
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
  var row = {
    id: frame.id,
    source: frame.source,
    card: card,
    meta: meta,
    createdAt: typeof frame.createdAt === 'string' && frame.createdAt
      ? frame.createdAt
      : (isoFromMillis(frame && frame.createdAt) || isoFromMillis(frame && frame.created_at) || '')
  };
  var stableId = autoscriptOrderIdentityId(row);
  if (stableId) row.id = stableId;
  return mergeItems(items, [row]);
}

export function parseQueueItems(body) {
  var raw = body && Array.isArray(body.items) ? body.items : [];
  var out = [];
  raw.forEach(function (frame) {
    out = ingestPriorityFrame(out, {
      type: 'priority_card',
      id: frame && frame.id,
      source: frame && frame.source,
      card: frame && frame.card,
      meta: frame && frame.meta,
      createdAt: frame && frame.createdAt
    });
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

export function footerRows(sources, items, seenMap, configured, alwaysOn) {
  var list = sources && sources.length ? sources : DEFAULT_SOURCES;
  return list.map(function (source) {
    var id = source && source.id ? source.id : 'pangmao';
    var name = source && source.name ? source.name : id;
    var on = !!configured || !!(alwaysOn && alwaysOn[id]);
    if (!on) {
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
  OI_REPORT_SOURCE_ID: OI_REPORT_SOURCE_ID,
  OI_REPORT_SOURCE: OI_REPORT_SOURCE,
  DEFAULT_OI_WEB_BASE_URL: DEFAULT_OI_WEB_BASE_URL,
  OI_WEB_BASE_CANDIDATES: OI_WEB_BASE_CANDIDATES,
  oiReportQueueUrl: oiReportQueueUrl,
  parseOiReportQueue: parseOiReportQueue,
  mapOiReportItem: mapOiReportItem,
  withOiReportSource: withOiReportSource,
  arrangePrioritySources: arrangePrioritySources,
  isLocalPrioritySourceId: isLocalPrioritySourceId,
  localPriorityAlwaysOn: localPriorityAlwaysOn,
  AUTOSCRIPT_CARD_SOURCE: AUTOSCRIPT_CARD_SOURCE,
  AUTOSCRIPT_ORDER_SOURCE: AUTOSCRIPT_ORDER_SOURCE,
  AUTOSCRIPT_CDP_SOURCE: AUTOSCRIPT_CDP_SOURCE,
  KOLVIP_AUTOTRADE_SOURCES: KOLVIP_AUTOTRADE_SOURCES,
  DEFAULT_AUTOSCRIPT_FEED_BASE_URL: DEFAULT_AUTOSCRIPT_FEED_BASE_URL,
  AUTOSCRIPT_FEED_BASE_CANDIDATES: AUTOSCRIPT_FEED_BASE_CANDIDATES,
  autoscriptFeedSourcesUrl: autoscriptFeedSourcesUrl,
  autoscriptFeedQueueUrl: autoscriptFeedQueueUrl,
  autoscriptFeedWebSocketUrl: autoscriptFeedWebSocketUrl,
  DISPLAY_TIME_ZONE: DISPLAY_TIME_ZONE,
  DEFAULT_ITEM_RANGE: DEFAULT_ITEM_RANGE,
  ITEM_RANGE_OPTIONS: ITEM_RANGE_OPTIONS,
  LIST_FOLD_LIMIT: LIST_FOLD_LIMIT,
  parseRangeKey: parseRangeKey,
  rangeOptionLabel: rangeOptionLabel,
  startOfHongKongDay: startOfHongKongDay,
  itemTimestampMs: itemTimestampMs,
  rangeStartMs: rangeStartMs,
  itemInRange: itemInRange,
  filterItemsByRange: filterItemsByRange,
  foldList: foldList,
  normalizeBaseUrl: normalizeBaseUrl,
  sourcesUrl: sourcesUrl,
  queueUrl: queueUrl,
  toWebSocketUrl: toWebSocketUrl,
  isTradeCard: isTradeCard,
  isSignalCard: isSignalCard,
  latestSignalCard: latestSignalCard,
  truncateChannelName: truncateChannelName,
  compactHintSymbol: compactHintSymbol,
  compactHintDirection: compactHintDirection,
  compactHintPrice: compactHintPrice,
  formatLatestCardHint: formatLatestCardHint,
  parseCdpItemId: parseCdpItemId,
  isCdpSourceItem: isCdpSourceItem,
  isCdpRunSummary: isCdpRunSummary,
  isCdpFeedFragment: isCdpFeedFragment,
  cdpSignalMissingHint: cdpSignalMissingHint,
  enrichCdpSignalFields: enrichCdpSignalFields,
  formatCdpRunMainLine: formatCdpRunMainLine,
  buildCdpPlatformSummary: buildCdpPlatformSummary,
  autoscriptOrderIdentityId: autoscriptOrderIdentityId,
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
    sources: arrangePrioritySources(DEFAULT_SOURCES),
    items: [],
    networkConfigured: false,
    oiConfigured: false,
    autoscriptConfigured: false,
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
  var listExpanded = Object.create(null);
  var textExpanded = Object.create(null);

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
    // A hung macOS keychain read otherwise never reaches finishHydrate, so the
    // footer stays on 未配置 even when this origin already has a secret.
    if (local.secret || local.baseUrl) {
      finishHydrate(gen, local);
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

  function readRangeKey() {
    try {
      return parseRangeKey(localStorage.getItem(STORAGE_KEYS.range));
    } catch (e) {
      return DEFAULT_ITEM_RANGE;
    }
  }

  function writeRangeKey(key) {
    var next = parseRangeKey(key);
    try {
      localStorage.setItem(STORAGE_KEYS.range, next);
    } catch (e) {}
    return next;
  }

  function currentRange() {
    return readRangeKey();
  }

  function visibleItems() {
    return filterItemsByRange(state.items, currentRange(), new Date());
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
    state.sources = arrangePrioritySources(state.sources.concat([{ id: id, name: id }]));
  }

  function writeDebugState() {
    try {
      localStorage.setItem(STORAGE_KEYS.debug, JSON.stringify({
        t: Date.now(),
        hasTauri: !!(window.__TAURI__ && window.__TAURI__.core && window.__TAURI__.core.invoke),
        configured: !!state.networkConfigured,
        lastError: String(state.lastError || '').slice(0, 160),
        sourceCount: (state.sources || []).length,
        itemCount: (state.items || []).length,
        visibleCount: visibleItems().length,
        oi: !!state.oiConfigured,
        autoscript: !!state.autoscriptConfigured,
        autoscriptBase: selectedAutoscriptBase || '',
        oiBase: selectedOiBase || '',
        range: currentRange()
      }));
    } catch (e) {}
  }

  function renderFooter() {
    var host = document.getElementById('priorityRows');
    if (!host) return;
    var rows = footerRows(state.sources, visibleItems(), loadSeen(), displayConfigured(), localPriorityAlwaysOn());
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
    var errEl = document.getElementById('priorityFooterError');
    if (errEl) {
      if (state.lastError) {
        errEl.hidden = false;
        errEl.textContent = '连接中转失败，正在重试（切到「全部」仍可能为空直到连接成功）';
      } else {
        errEl.hidden = true;
        errEl.textContent = '';
      }
    }
    writeDebugState();
  }

  function itemsForList() {
    return visibleItems().filter(function (item) {
      if (!item) return false;
      if (isCdpFeedFragment(item)) return false;
      return !listSource || item.source === listSource;
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
      var ranged = currentRange() !== 'all';
      var hadOlder = ranged && state.items.some(function (item) {
        return item && (!listSource || item.source === listSource);
      });
      if (hadOlder) {
        empty.textContent = '该时段暂无消息（当前：' + rangeOptionLabel(currentRange()) + '）';
      } else if (listSource === OI_REPORT_SOURCE_ID) {
        empty.textContent = state.oiConfigured ? '暂无 BTC/ETH 5m 放量影线' : '未连接到本机 /oi（127.0.0.1:8765）';
      } else if (isAutoscriptFeedSourceId(listSource)) {
        empty.textContent = state.autoscriptConfigured
          ? '暂无记录'
          : '未连接到本机 auto-script 实时源（127.0.0.1:3852）';
      } else {
        empty.textContent = displayConfigured()
          ? '暂无消息'
          : '填写本机密钥后即可拉取消息。未保存地址时使用 https://op.g.ezcoin.ink。';
      }
      list.appendChild(empty);
      return;
    }
    var foldKey = listSource || '*';
    var folded = foldList(items, LIST_FOLD_LIMIT, !!listExpanded[foldKey]);
    folded.items.forEach(function (item) {
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

      if (isCdpRunSummary(item)) {
        var cdpSignal = enrichCdpSignalFields(item, state.items);
        var cdpMain = document.createElement('div');
        cdpMain.className = 'priority-item-main priority-item-cdp-card';
        var cdpHead = document.createElement('b');
        cdpHead.textContent = formatCdpRunMainLine(cdpSignal);
        cdpMain.appendChild(cdpHead);
        var missHint = cdpSignalMissingHint(cdpSignal);
        if (missHint) {
          var cdpMiss = document.createElement('span');
          cdpMiss.className = 'priority-cdp-miss';
          cdpMiss.textContent = missHint;
          cdpMain.appendChild(cdpMiss);
        }
        article.appendChild(cdpMain);
        var cdpSummary = buildCdpPlatformSummary(item, state.items);
        if (cdpSummary) {
          var cdpText = document.createElement('p');
          cdpText.className = 'priority-item-text priority-item-cdp-summary';
          cdpText.textContent = cdpSummary;
          if (item.id) cdpText.setAttribute('data-fold-id', item.id);
          article.appendChild(cdpText);
        }
      } else if (view.symbol || view.direction || view.yieldValue) {
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
      if (!isCdpRunSummary(item) && (view.status || view.exchange || view.platform || view.reason || view.entry || view.cardId)) {
        var trade = document.createElement('div');
        trade.className = 'priority-item-main priority-item-trade';
        if (view.exchange) {
          var ex = document.createElement('span');
          ex.textContent = view.exchange;
          trade.appendChild(ex);
        }
        if (view.platform) {
          var plat = document.createElement('span');
          plat.textContent = view.platform;
          trade.appendChild(plat);
        }
        if (view.status) {
          var st = document.createElement('span');
          st.className = 'priority-status is-' + String(view.status).toLowerCase();
          st.textContent = view.status === 'waiting' ? '待触发区间市价'
            : view.status === 'ok' || view.status === 'filled' ? '成功'
            : view.status === 'failed' || view.status === 'fail' ? '失败'
            : view.status;
          trade.appendChild(st);
        }
        if (view.entry) {
          var en = document.createElement('span');
          en.textContent = '入场 ' + view.entry;
          trade.appendChild(en);
        }
        if (view.cardId) {
          var cid = document.createElement('span');
          cid.textContent = '#' + view.cardId;
          trade.appendChild(cid);
        }
        if (view.reason) {
          var rs = document.createElement('span');
          rs.className = 'priority-reason';
          rs.textContent = view.reason;
          trade.appendChild(rs);
        }
        article.appendChild(trade);
      }
      if (!isCdpRunSummary(item) && view.text) {
        var text = document.createElement('p');
        text.className = 'priority-item-text';
        text.textContent = view.text;
        if (item.id) text.setAttribute('data-fold-id', item.id);
        article.appendChild(text);
      }
      list.appendChild(article);
    });
    if (folded.hidden > 0 || !!listExpanded[foldKey]) {
      var more = document.createElement('button');
      more.type = 'button';
      more.className = 'priority-fold-btn';
      more.textContent = listExpanded[foldKey]
        ? '收起'
        : ('展开其余 ' + folded.hidden + ' 条');
      more.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        listExpanded[foldKey] = !listExpanded[foldKey];
        renderList();
      });
      more.addEventListener('dblclick', function (event) {
        event.preventDefault();
        event.stopPropagation();
      });
      list.appendChild(more);
    }
    prepareTextFolds(list);
  }

  function prepareTextFolds(list) {
    if (!list || typeof requestAnimationFrame !== 'function') return;
    requestAnimationFrame(function () {
      var nodes = list.querySelectorAll('.priority-item-text[data-fold-id]');
      for (var i = 0; i < nodes.length; i++) {
        wireTextFold(nodes[i]);
      }
    });
  }

  function wireTextFold(textEl) {
    if (!textEl || textEl.getAttribute('data-fold-ready') === '1') return;
    var id = textEl.getAttribute('data-fold-id');
    if (!id) return;
    var expanded = !!textExpanded[id];
    textEl.classList.toggle('is-folded', !expanded);
    var overflows;
    if (expanded) {
      textEl.classList.add('is-folded');
      overflows = textEl.scrollHeight > textEl.clientHeight + 1;
      textEl.classList.remove('is-folded');
    } else {
      overflows = textEl.scrollHeight > textEl.clientHeight + 1;
      if (!overflows) textEl.classList.remove('is-folded');
    }
    if (!overflows) return;
    textEl.setAttribute('data-fold-ready', '1');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'priority-more';
    btn.textContent = expanded ? '收起' : '展开';
    btn.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      textExpanded[id] = !textExpanded[id];
      renderList();
    });
    btn.addEventListener('dblclick', function (event) {
      event.preventDefault();
      event.stopPropagation();
    });
    if (textEl.parentNode) textEl.parentNode.insertBefore(btn, textEl.nextSibling);
  }

  function paintRangeButtons(host) {
    if (!host) return;
    host.textContent = '';
    var current = currentRange();
    ITEM_RANGE_OPTIONS.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('data-range', opt.id);
      btn.className = current === opt.id ? 'is-on' : '';
      btn.textContent = opt.name;
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        writeRangeKey(opt.id);
        render();
      });
      btn.addEventListener('dblclick', function (event) {
        event.preventDefault();
        event.stopPropagation();
      });
      host.appendChild(btn);
    });
  }

  function renderRangeBars() {
    var footerBar = document.getElementById('priorityFooterRange');
    var listBar = document.getElementById('priorityRangeBar');
    var hint = document.getElementById('priorityFilterHint');
    if (footerBar) footerBar.hidden = false;
    if (listBar) listBar.hidden = panelMode !== 'list';
    paintRangeButtons(footerBar);
    paintRangeButtons(listBar);
    paintRangeButtons(document.getElementById('prioritySettingsRange'));
    if (hint) {
      var latestHint = formatLatestCardHint(latestSignalCard(state.items || []));
      if (latestHint) {
        hint.hidden = false;
        hint.textContent = latestHint;
        hint.title = latestHint;
        hint.classList.add('is-latest');
      } else {
        hint.classList.remove('is-latest');
        hint.removeAttribute('title');
        var total = (state.items || []).length;
        var visible = visibleItems().length;
        var hiddenCount = total - visible;
        if (currentRange() !== 'all' && hiddenCount > 0 && visible === 0) {
          hint.hidden = false;
          hint.textContent = '该时段暂无消息（当前：' + rangeOptionLabel(currentRange()) + '），已隐藏 ' + hiddenCount + ' 条，可切换范围';
        } else if (currentRange() !== 'all' && hiddenCount > 0) {
          hint.hidden = false;
          hint.textContent = '已按「' + rangeOptionLabel(currentRange()) + '」筛选，另有 ' + hiddenCount + ' 条更早记录';
        } else {
          hint.hidden = true;
          hint.textContent = '';
        }
      }
    }
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
    renderRangeBars();
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
      if (!isCdpFeedFragment(frame)) {
        if (!seenSet(loadSeen(), frame.source)[frame.id]) highlighted[frame.id] = true;
        saveSeen(markSeen(loadSeen(), frame.source, [frame.id]));
      }
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
      Object.keys(localPriorityAlwaysOn()).forEach(function (id) { knownSources[id] = true; });
      state.sources = arrangePrioritySources(nextSources);
      var localNow = state.items.filter(function (item) {
        return item && isLocalPrioritySourceId(item.source);
      });
      var relayOnly = nextItems.filter(function (item) {
        return item && !isLocalPrioritySourceId(item.source);
      });
      nextItems = mergeItems(relayOnly, localNow);
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

  function oiBaseCandidates() {
    var list = [];
    if (selectedOiBase) list.push(selectedOiBase);
    OI_WEB_BASE_CANDIDATES.forEach(function (base) {
      if (list.indexOf(base) === -1) list.push(base);
    });
    return list;
  }

  function syncOiReports() {
    var bases = oiBaseCandidates();
    function tryAt(i) {
      if (i >= bases.length) {
        selectedOiBase = '';
        state.oiConfigured = false;
        state.sources = arrangePrioritySources(state.sources);
        render();
        return Promise.resolve();
      }
      var url = oiReportQueueUrl(bases[i]);
      if (!url) return tryAt(i + 1);
      return fetchOiReportQueue(url).then(function (body) {
        selectedOiBase = bases[i];
        return body;
      }, function () {
        if (selectedOiBase === bases[i]) selectedOiBase = '';
        return tryAt(i + 1);
      });
    }
    return tryAt(0).then(function (body) {
      if (!body) return;
      var items = parseOiReportQueue(body);
      var previous = itemIdSet(state.items.filter(function (item) {
        return item && item.source === OI_REPORT_SOURCE_ID;
      }));
      state.oiConfigured = true;
      state.sources = arrangePrioritySources(state.sources);
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
      state.sources = arrangePrioritySources(state.sources);
      render();
    });
  }

  function startOiPoll() {
    if (oiTimer) clearInterval(oiTimer);
    syncOiReports();
    oiTimer = setInterval(syncOiReports, OI_REPORT_POLL_MS);
  }

  var feedTimer = null;
  var feedSocket = null;
  var feedSession = 0;
  var selectedAutoscriptBase = '';
  var selectedOiBase = '';
  var feedReady = false;

  function fetchAutoscriptFeed(url, secret) {
    var tauri = window.__TAURI__;
    if (tauri && tauri.core && tauri.core.invoke) {
      return tauri.core.invoke('autoscript_live_feed_get', { url: url, secret: secret || '' }).then(function (res) {
        var status = res && res.status;
        if (!status || status < 200 || status >= 300) {
          throw new Error('autoscript feed HTTP ' + (status || 0));
        }
        try {
          return JSON.parse((res && res.body) || '{}');
        } catch (e) {
          throw new Error('autoscript feed invalid json');
        }
      }).catch(function (err) {
        if (typeof fetch !== 'function') throw err;
        var headers = { Accept: 'application/json' };
        if (secret) {
          headers.Authorization = 'Bearer ' + secret;
          headers['X-Relay-Secret'] = secret;
        }
        return fetch(url, { headers: headers, cache: 'no-store', credentials: 'omit' }).then(function (res) {
          if (!res.ok) throw new Error('autoscript feed HTTP ' + res.status);
          return res.json();
        });
      });
    }
    if (typeof fetch !== 'function') {
      return Promise.reject(new Error('autoscript feed fetch unavailable'));
    }
    var headers = { Accept: 'application/json' };
    if (secret) {
      headers.Authorization = 'Bearer ' + secret;
      headers['X-Relay-Secret'] = secret;
    }
    return fetch(url, { headers: headers, cache: 'no-store', credentials: 'omit' }).then(function (res) {
      if (!res.ok) throw new Error('autoscript feed HTTP ' + res.status);
      return res.json();
    });
  }

  function applyAutoscriptItems(nextItems, origin) {
    var previous = itemIdSet(state.items.filter(function (item) {
      return item && isAutoscriptFeedSourceId(item.source);
    }));
    var ids = [];
    AUTOSCRIPT_FEED_SOURCES.forEach(function (src) { ids.push(src.id); });
    KOLVIP_AUTOTRADE_SOURCES.forEach(function (src) { ids.push(src.id); });
    var merged = state.items.filter(function (item) {
      return item && !isAutoscriptFeedSourceId(item.source);
    });
    ids.forEach(function (sid) {
      merged = replaceSourceItems(merged, sid, (nextItems || []).filter(function (item) {
        return item && item.source === sid;
      }));
    });
    state.autoscriptConfigured = true;
    state.sources = arrangePrioritySources(state.sources);
    state.items = merged;
    var arrived = nextItems.filter(function (item) { return item && item.id && !previous[item.id]; });
    if (feedReady) publishNotices(origin || 'live', arrived, previous);
    else {
      publishNotices('snapshot', nextItems, previous);
      feedReady = true;
    }
    render();
  }

  function autoscriptBaseCandidates() {
    var list = [];
    if (selectedAutoscriptBase) list.push(selectedAutoscriptBase);
    AUTOSCRIPT_FEED_BASE_CANDIDATES.forEach(function (base) {
      if (list.indexOf(base) === -1) list.push(base);
    });
    return list;
  }

  function pullAutoscriptFeed(base, secret) {
    var sourcesUrl = autoscriptFeedSourcesUrl(base);
    if (!sourcesUrl) return Promise.reject(new Error('autoscript feed url empty'));
    return fetchAutoscriptFeed(sourcesUrl, secret).then(function (body) {
      var listed = parseSources(body);
      if (!listed.length) listed = AUTOSCRIPT_FEED_SOURCES.concat(KOLVIP_AUTOTRADE_SOURCES);
      return Promise.all(listed.map(function (source) {
        return fetchAutoscriptFeed(autoscriptFeedQueueUrl(base, source.id, QUEUE_LIMIT), secret).then(function (payload) {
          return parseQueueItems(payload).filter(function (item) { return item.source === source.id; });
        }, function () { return []; });
      })).then(function (groups) {
        var next = [];
        groups.forEach(function (g) { next = next.concat(g); });
        selectedAutoscriptBase = base;
        applyAutoscriptItems(next, 'snapshot');
      });
    });
  }

  function syncAutoscriptFeed() {
    var cfg = readConfig();
    var secret = cfg && cfg.secret ? cfg.secret : '';
    var bases = autoscriptBaseCandidates();
    function tryAt(i) {
      if (i >= bases.length) {
        selectedAutoscriptBase = '';
        state.autoscriptConfigured = false;
        state.sources = arrangePrioritySources(state.sources);
        render();
        return Promise.resolve();
      }
      return pullAutoscriptFeed(bases[i], secret).catch(function (err) {
        quietLog(err);
        if (selectedAutoscriptBase === bases[i]) selectedAutoscriptBase = '';
        return tryAt(i + 1);
      });
    }
    return tryAt(0);
  }

  function stopAutoscriptSocket() {
    var ws = feedSocket;
    feedSocket = null;
    if (!ws) return;
    try { ws.close(); } catch (e) {}
  }

  function openAutoscriptSocket(token) {
    var cfg = readConfig();
    var url = autoscriptFeedWebSocketUrl(selectedAutoscriptBase || DEFAULT_AUTOSCRIPT_FEED_BASE_URL, cfg && cfg.secret ? cfg.secret : '');
    if (!url || typeof WebSocket === 'undefined') return;
    var ws;
    try { ws = new WebSocket(url); } catch (e) { return; }
    feedSocket = ws;
    ws.onmessage = function (ev) {
      if (token !== feedSession) return;
      var data;
      try { data = JSON.parse(ev.data); } catch (e) { return; }
      if (!data || data.type !== 'priority_card') return;
      if (!isAutoscriptFeedSourceId(data.source)) return;
      var known = itemIdSet(state.items);
      var arrived = ingestPriorityFrame([], data);
      state.items = ingestPriorityFrame(state.items, data);
      if (data.source) ensureSource(data.source);
      state.autoscriptConfigured = true;
      publishNotices('live', arrived, known);
      render();
    };
    ws.onclose = function () {
      if (feedSocket === ws) feedSocket = null;
    };
  }

  function startAutoscriptFeed() {
    feedSession += 1;
    var token = feedSession;
    stopAutoscriptSocket();
    if (feedTimer) clearInterval(feedTimer);
    syncAutoscriptFeed().then(function () {
      if (token !== feedSession) return;
      openAutoscriptSocket(token);
    });
    feedTimer = setInterval(function () {
      syncAutoscriptFeed();
    }, AUTOSCRIPT_FEED_POLL_MS);
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
    state.sources = arrangePrioritySources(state.networkConfigured ? state.sources : DEFAULT_SOURCES);
    if (!state.networkConfigured) {
      state.items = state.items.filter(function (item) {
        return item && isLocalPrioritySourceId(item.source);
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
    var localKeep = state.items.filter(function (item) { return item && isLocalPrioritySourceId(item.source); });
    state.sources = arrangePrioritySources(sources.length ? sources : DEFAULT_SOURCES);
    state.items = mergeItems(localKeep, snapItems.filter(function (item) {
      return item && !isLocalPrioritySourceId(item.source);
    }));
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
    return footerRows(state.sources, visibleItems(), loadSeen(), displayConfigured(), localPriorityAlwaysOn());
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
    } else if (event.key === STORAGE_KEYS.seen || event.key === STORAGE_KEYS.range) render();
  });

  render();
  hydrateConfig();
  startOiPoll();
  startAutoscriptFeed();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootFooter);
  else bootFooter();
}
