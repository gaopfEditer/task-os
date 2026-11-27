import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  DEFAULT_BASE_URL,
  DEFAULT_SOURCES,
  QUEUE_LIMIT,
  STORAGE_KEYS,
  describeItem,
  isCdpRunSummary,
  isCdpFeedFragment,
  parseCdpItemId,
  enrichCdpSignalFields,
  formatCdpRunMainLine,
  buildCdpPlatformSummary,
  cdpSignalMissingHint,
  displayBaseUrl,
  footerRows,
  formatTime,
  ingestPriorityFrame,
  isTradeCard,
  isSignalCard,
  latestSignalCard,
  truncateChannelName,
  compactHintSymbol,
  compactHintDirection,
  compactHintPrice,
  formatLatestCardHint,
  autoscriptOrderIdentityId,
  markSeen,
  mergeItems,
  normalizeBaseUrl,
  noticeForPriorityArrival,
  noticesForPriorityItems,
  parseNotifyFlag,
  parseOiReportQueue,
  parseQueueItems,
  parseSources,
  mapOiReportItem,
  withOiReportSource,
  arrangePrioritySources,
  isLocalPrioritySourceId,
  AUTOSCRIPT_CARD_SOURCE,
  AUTOSCRIPT_ORDER_SOURCE,
  AUTOSCRIPT_CDP_SOURCE,
  KOLVIP_AUTOTRADE_SOURCES,
  DISPLAY_TIME_ZONE,
  DEFAULT_ITEM_RANGE,
  LIST_FOLD_LIMIT,
  parseRangeKey,
  rangeOptionLabel,
  startOfHongKongDay,
  rangeStartMs,
  itemInRange,
  filterItemsByRange,
  foldList,
  autoscriptFeedSourcesUrl,
  autoscriptFeedWebSocketUrl,
  OI_REPORT_SOURCE,
  oiReportQueueUrl,
  priorityNotice,
  queueUrl,
  reconcilePriorityStore,
  replaceSourceItems,
  resolvePriorityConfig,
  seenSet,
  sourceCounts,
  sourceLabelText,
  sourcesUrl,
  toWebSocketUrl,
} from './priority-footer.js';

const trade = {
  id: 'c1',
  source: 'pangmao',
  createdAt: '2026-11-17T07:30:00.000Z',
  card: { symbol: 'BTC', direction: '多', title: '突破', body: '短线看多' },
  meta: { via: 'ocr', yield_pct: 1.25 },
};

const plain = {
  id: 'm1',
  source: 'pangmao',
  createdAt: '2026-11-17T07:31:00.000Z',
  card: { note: '不是卡片' },
  meta: {},
};

test('storage keys match the main-window crypto panel', () => {
  const src = readFileSync(new URL('./taskos-desktop.js', import.meta.url), 'utf8');
  assert.match(src, new RegExp(STORAGE_KEYS.baseUrl.replace(/\./g, '\\.')));
  assert.match(src, new RegExp(STORAGE_KEYS.secret.replace(/\./g, '\\.')));
});

test('normalizeBaseUrl keeps http(s) origin and path, drops secrets in the URL', () => {
  assert.equal(normalizeBaseUrl(' https://op.g.ezcoin.ink/ '), 'https://op.g.ezcoin.ink');
  assert.equal(normalizeBaseUrl('http://127.0.0.1:3000/'), 'http://127.0.0.1:3000');
  assert.equal(normalizeBaseUrl('https://example.com/relay/'), 'https://example.com/relay');
  assert.equal(normalizeBaseUrl('javascript:alert(1)'), '');
  assert.equal(normalizeBaseUrl('https://user:secret@example.com'), '');
  assert.equal(normalizeBaseUrl(''), '');
});

test('queue and websocket URLs follow the priority protocol', () => {
  assert.equal(
    sourcesUrl('https://op.g.ezcoin.ink/'),
    'https://op.g.ezcoin.ink/queue/priority/sources'
  );
  const page = new URL(queueUrl('https://example.com/relay/', 'pangmao', 500));
  assert.equal(page.origin + page.pathname, 'https://example.com/relay/queue/priority');
  assert.equal(page.searchParams.get('source'), 'pangmao');
  assert.equal(page.searchParams.get('limit'), String(QUEUE_LIMIT));

  const ws = new URL(toWebSocketUrl('https://op.g.ezcoin.ink', 'local-secret'));
  assert.equal(ws.protocol, 'wss:');
  assert.equal(ws.pathname, '/ws/priority');
  assert.equal(ws.searchParams.get('token'), 'local-secret');
  assert.equal(ws.searchParams.get('source'), null);
  assert.equal(ws.searchParams.get('replay'), null);
  assert.equal(ws.searchParams.get('since'), null);
  assert.equal(toWebSocketUrl('http://127.0.0.1:3000', 't').startsWith('ws://127.0.0.1:3000/ws/priority?'), true);
});

test('trade cards are counted separately from plain messages', () => {
  assert.equal(isTradeCard(trade), true);
  assert.equal(isTradeCard({ ...plain, meta: { via: 'text' } }), true);
  assert.equal(isTradeCard({ id: 'x', source: 'pangmao', card: { symbol: 'ETH' }, meta: {} }), true);
  assert.equal(isTradeCard(plain), false);

  const counts = sourceCounts([trade, plain, { ...trade, id: 'c2' }], 'pangmao', { c1: true });
  assert.deepEqual(counts, { messages: 3, newCards: 1 });
});

test('opening the list marks trade cards seen and the new-card count drops', () => {
  const seen = markSeen({}, 'pangmao', ['c1']);
  assert.equal(seenSet(seen, 'pangmao').c1, true);
  const rows = footerRows(
    DEFAULT_SOURCES,
    [trade, plain],
    seen,
    true
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, '胖猫社区');
  assert.equal(rows[0].messages, 2);
  assert.equal(rows[0].newCards, 0);
  assert.equal(rows[0].unconfigured, false);
});

test('missing config renders the source with zero counts', () => {
  const rows = footerRows(DEFAULT_SOURCES, [trade], {}, false);
  assert.deepEqual(rows, [{
    id: 'pangmao',
    name: '胖猫社区',
    messages: 0,
    newCards: 0,
    unconfigured: true,
  }]);
});

test('multiple sources stay independent when the queue page is replaced', () => {
  const other = { ...trade, id: 'o1', source: 'other' };
  const replaced = replaceSourceItems([trade, other], 'pangmao', [
    { ...trade, id: 'c3', card: { symbol: 'SOL' } },
  ]);
  assert.deepEqual(replaced.map((item) => item.id), ['o1', 'c3']);
  const rows = footerRows(
    [{ id: 'pangmao', name: '胖猫社区' }, { id: 'other', name: '其他' }],
    replaced,
    {},
    true
  );
  assert.deepEqual(rows.map((row) => [row.name, row.messages, row.newCards]), [
    ['胖猫社区', 1, 1],
    ['其他', 1, 1],
  ]);
});

test('live frames append without duplicating ids; connected frames are ignored', () => {
  const first = ingestPriorityFrame([], {
    type: 'priority_card',
    id: 'c1',
    source: 'pangmao',
    card: trade.card,
    meta: trade.meta,
    createdAt: trade.createdAt,
  });
  const again = ingestPriorityFrame(first, {
    type: 'priority_card',
    id: 'c1',
    source: 'pangmao',
    card: { symbol: 'BTC' },
    meta: { via: 'text', yield_pct: null },
    createdAt: trade.createdAt,
  });
  assert.equal(again.length, 1);
  assert.equal(again[0].meta.via, 'text');
  assert.equal(ingestPriorityFrame(first, { type: 'connected', channel: 'priority' }).length, 1);
  const merged = mergeItems(again, [plain]);
  assert.deepEqual(merged.map((item) => item.id), ['c1', 'm1']);
});

test('HTTP queue payload parses and describeItem keeps card fields', () => {
  const items = parseQueueItems({
    items: [trade, { id: '', source: 'pangmao' }, { foo: 1 }],
  });
  assert.equal(items.length, 1);
  const view = describeItem(items[0], '胖猫社区');
  assert.equal(view.symbol, 'BTC');
  assert.equal(view.direction, '多');
  assert.equal(view.yieldValue, '1.25%');
  assert.equal(view.text, '突破 短线看多');
  assert.equal(view.via, 'ocr');
  assert.equal(view.sourceName, '胖猫社区');
});

test('sources endpoint ignores blank ids and keeps later sources', () => {
  assert.deepEqual(parseSources({
    sources: [
      { id: 'pangmao', name: '胖猫社区' },
      { id: ' pangmao ', name: '重复' },
      { id: 'vip', name: ' 会员群 ' },
      { id: '   ' },
    ],
  }), [
    { id: 'pangmao', name: '胖猫社区' },
    { id: 'vip', name: '会员群' },
  ]);
});

test('seen ids are capped per source without dropping the newest', () => {
  const seen = markSeen({ pangmao: ['a'] }, 'pangmao', ['a', 'b', 'c'], 2);
  assert.deepEqual(seen.pangmao, ['b', 'c']);
});

test('formatTime uses Asia/Hong_Kong', () => {
  assert.equal(DISPLAY_TIME_ZONE, 'Asia/Hong_Kong');
  assert.equal(formatTime('2026-11-16T23:05:00.000Z'), '11-17 07:05');
  assert.equal(formatTime('not-a-date'), 'not-a-date');
});

test('source names are gray read-only labels', () => {
  const css = readFileSync(new URL('./price-bubble.css', import.meta.url), 'utf8');
  const panelCss = readFileSync(new URL('./taskos-desktop.css', import.meta.url), 'utf8');
  const html = readFileSync(new URL('./price-bubble.html', import.meta.url), 'utf8');
  const desktop = readFileSync(new URL('./taskos-desktop.js', import.meta.url), 'utf8');
  const footer = readFileSync(new URL('./priority-footer.js', import.meta.url), 'utf8');

  assert.match(css, /\.priority-name\s*,\s*\.priority-source-name\s*\{[^}]*color:\s*#8b949e/s);
  assert.doesNotMatch(css, /\.priority-name\s*\{[^}]*#ffb86c/s);
  assert.match(css, /\.priority-panel input\.priority-source-name:disabled\s*\{[^}]*color:\s*#8b949e/s);
  assert.match(panelCss, /#tcRelaySources:disabled|input\.tc-source-name:disabled/);
  assert.match(panelCss, /input\.tc-source-name:disabled\s*\{[^}]*color:\s*#8b949e/s);

  assert.match(html, /id="prioritySourceNames"[^>]*value="胖猫社区"/);
  assert.match(html, /id="prioritySourceNames"[^>]*\bdisabled\b/);
  assert.match(html, /id="prioritySourceNames"[^>]*\breadonly\b/);
  assert.doesNotMatch(html, /<input(?![^>]*\bdisabled\b)[^>]*胖猫社区/);

  assert.match(desktop, /id="tcRelaySources"[^>]*value="胖猫社区"/);
  assert.match(desktop, /id="tcRelaySources"[^>]*\bdisabled\b/);
  assert.match(desktop, /id="tcRelaySources"[^>]*\breadonly\b/);
  assert.match(desktop, /el\.disabled = true/);
  assert.match(desktop, /el\.readOnly = true/);

  assert.match(footer, /name\.className = 'priority-name priority-source-name'/);
  assert.match(footer, /el\.disabled = true/);
  assert.match(footer, /el\.readOnly = true/);
  const saveFn = footer.slice(footer.indexOf('function onSave'), footer.indexOf('function closest'));
  assert.doesNotMatch(saveFn, /prioritySourceNames|tcRelaySources/);

  assert.equal(sourceLabelText(null), '胖猫社区');
  assert.equal(sourceLabelText([]), '胖猫社区');
  assert.equal(sourceLabelText(DEFAULT_SOURCES), '胖猫社区');
  assert.equal(
    sourceLabelText([
      { id: 'pangmao', name: '胖猫社区' },
      { id: 'vip', name: '会员群' },
    ]),
    '胖猫社区、会员群'
  );
});

test('unset base URL defaults to the public relay and auto-connects when a secret is saved', () => {
  assert.equal(DEFAULT_BASE_URL, 'https://op.g.ezcoin.ink');
  assert.equal(displayBaseUrl(null), DEFAULT_BASE_URL);
  assert.equal(displayBaseUrl(''), DEFAULT_BASE_URL);
  assert.equal(displayBaseUrl(' https://example.com/relay/ '), 'https://example.com/relay');

  const fresh = resolvePriorityConfig(null, '');
  assert.equal(fresh.base, 'https://op.g.ezcoin.ink');
  assert.equal(fresh.usedDefault, true);
  assert.equal(fresh.connect, false);

  const ready = resolvePriorityConfig(undefined, 'local-secret');
  assert.equal(ready.base, 'https://op.g.ezcoin.ink');
  assert.equal(ready.usedDefault, true);
  assert.equal(ready.connect, true);
  assert.equal(
    toWebSocketUrl(ready.base, ready.secret),
    'wss://op.g.ezcoin.ink/ws/priority?token=local-secret'
  );

  const saved = resolvePriorityConfig('https://example.com/relay/', 'local-secret');
  assert.equal(saved.base, 'https://example.com/relay');
  assert.equal(saved.usedDefault, false);
  assert.equal(saved.connect, true);
  assert.equal(saved.base.includes('op.g.ezcoin.ink'), false);

  const blank = resolvePriorityConfig('   ', 'local-secret');
  assert.equal(blank.base, DEFAULT_BASE_URL);
  assert.equal(blank.connect, true);

  const invalid = resolvePriorityConfig('javascript:alert(1)', 'local-secret');
  assert.equal(invalid.connect, false);
  assert.equal(invalid.usedDefault, false);

  const footer = readFileSync(new URL('./priority-footer.js', import.meta.url), 'utf8');
  const desktop = readFileSync(new URL('./taskos-desktop.js', import.meta.url), 'utf8');
  assert.match(footer, /state\.networkConfigured = !!cfg\.connect/);
  assert.match(desktop, /RELAY_DEFAULT_BASE = 'https:\/\/op\.g\.ezcoin\.ink'/);
  assert.match(desktop, /if \(!raw\) return RELAY_DEFAULT_BASE/);
  // 45.207.196.71 is the existing Mac FRP path for auto-script /oi, not the msg-relay default.
  assert.doesNotMatch(DEFAULT_BASE_URL, /149\.88\.80\.60/);
  assert.doesNotMatch(desktop, /149\.88\.80\.60/);
  assert.doesNotMatch(footer, /localStorage\.setItem\(STORAGE_KEYS\.baseUrl,\s*DEFAULT_BASE_URL\)/);
});

test('shared keychain config wins; localStorage migrates only while the store is empty', () => {
  assert.equal(STORAGE_KEYS.notify, 'taskos.desktop.priority.notify');
  assert.equal(parseNotifyFlag(null), true);
  assert.equal(parseNotifyFlag(''), true);
  assert.equal(parseNotifyFlag('1'), true);
  assert.equal(parseNotifyFlag('0'), false);
  assert.equal(parseNotifyFlag('off'), false);

  const migrated = reconcilePriorityStore(
    { present: false, baseUrl: '', secret: '', notify: true },
    { baseUrl: 'https://example.com/relay', secret: 'local-secret', notify: true }
  );
  assert.equal(migrated.migrate, true);
  assert.equal(migrated.storePresent, false);
  assert.equal(migrated.secret, 'local-secret');
  assert.equal(migrated.baseUrl, 'https://example.com/relay');
  assert.equal(migrated.notify, true);

  const shared = reconcilePriorityStore(
    { present: true, baseUrl: '', secret: 'shared-secret', notify: false },
    { baseUrl: 'https://stale.example', secret: 'stale-secret', notify: true }
  );
  assert.equal(shared.migrate, false);
  assert.equal(shared.storePresent, true);
  assert.equal(shared.secret, 'shared-secret');
  assert.equal(shared.baseUrl, '');
  assert.equal(shared.notify, false);

  const cleared = reconcilePriorityStore(
    { present: true, baseUrl: '', secret: '', notify: true },
    { baseUrl: 'https://example.com/relay', secret: 'local-secret', notify: true }
  );
  assert.equal(cleared.migrate, false);
  assert.equal(cleared.storePresent, true);
  assert.equal(cleared.secret, '');

  const footer = readFileSync(new URL('./priority-footer.js', import.meta.url), 'utf8');
  const desktop = readFileSync(new URL('./taskos-desktop.js', import.meta.url), 'utf8');
  const html = readFileSync(new URL('./price-bubble.html', import.meta.url), 'utf8');
  for (const src of [footer, desktop]) {
    assert.match(src, /load_priority_config/);
    assert.match(src, /save_priority_config/);
    assert.match(src, /taskos\.desktop\.priority\.notify/);
  }
  assert.match(desktop, /reconcilePriorityStore/);
  assert.match(desktop, /import\('\.\/priority-footer\.js'\)/);
  assert.match(html, /id="priorityNotify"/);
  assert.match(desktop, /id="tcRelayNotify"/);
  assert.match(footer, /localStorage\.setItem\(STORAGE_KEYS\.baseUrl/);
  assert.match(footer, /localStorage\.setItem\(STORAGE_KEYS\.secret/);
});

test('live priority cards notify; snapshot and historical rows do not', () => {
  const note = priorityNotice(trade, '胖猫社区');
  assert.equal(note.title, 'Task OS · 胖猫社区');
  assert.match(note.body, /BTC/);
  assert.match(note.body, /多/);
  assert.equal(note.title.includes('local-secret'), false);
  assert.equal(note.body.includes('local-secret'), false);

  const symbolOnly = priorityNotice(
    { id: 'c9', source: 'pangmao', card: { symbol: 'ETH' }, meta: {} },
    '胖猫社区'
  );
  assert.match(symbolOnly.body, /ETH/);
  assert.equal(symbolOnly.body.includes('多'), false);

  const live = noticesForPriorityItems('live', [trade], {
    notify: true,
    sourceName: '胖猫社区',
  });
  assert.equal(live.length, 1);
  assert.equal(live[0].id, 'c1');
  assert.equal(live[0].title, 'Task OS · 胖猫社区');
  assert.match(live[0].body, /BTC/);
  assert.match(live[0].body, /多/);

  const historical = parseQueueItems({ items: [trade, plain] });
  assert.deepEqual(noticesForPriorityItems('snapshot', historical, { notify: true, sourceName: '胖猫社区' }), []);
  assert.deepEqual(noticesForPriorityItems('backfill', historical, { notify: true }), []);
  assert.equal(noticeForPriorityArrival('snapshot', trade, { sourceName: '胖猫社区' }), null);
  assert.equal(noticeForPriorityArrival('live', trade, { knownIds: { c1: true }, sourceName: '胖猫社区' }), null);
  assert.equal(noticeForPriorityArrival('live', trade, { seenIds: { c1: true }, sourceName: '胖猫社区' }), null);
  assert.equal(noticeForPriorityArrival('live', trade, { notify: false, sourceName: '胖猫社区' }), null);

  const footer = readFileSync(new URL('./priority-footer.js', import.meta.url), 'utf8');
  const noticeFn = footer.slice(footer.indexOf('export function priorityNotice'), footer.indexOf('export function noticeForPriorityArrival'));
  assert.doesNotMatch(noticeFn, /secret|STORAGE_KEYS|token/);
  const showFn = footer.slice(footer.indexOf('function showSystemNotice'), footer.indexOf('function publishNotices'));
  const permissionFn = footer.slice(footer.indexOf('function requestNotificationPermission'), footer.indexOf('export function sourceLabelText'));
  assert.match(showFn, /requestNotificationPermission/);
  assert.match(permissionFn, /Notification\.requestPermission/);
  assert.match(showFn, /show_price_alert/);
  assert.match(showFn, /title: note\.title/);
  assert.match(showFn, /body: note\.body/);
  assert.doesNotMatch(showFn, /secret/);

  const syncFn = footer.slice(footer.indexOf('function syncOnce'), footer.indexOf('function openSocket'));
  assert.match(syncFn, /publishNotices\('snapshot'/);
  assert.match(syncFn, /publishNotices\('live'/);
  const rememberFn = footer.slice(footer.indexOf('function rememberFrame'), footer.indexOf('function syncOnce'));
  assert.match(rememberFn, /publishNotices\('live'/);
  assert.doesNotMatch(rememberFn, /publishNotices\('snapshot'/);
  const applyFn = footer.slice(footer.indexOf('function applySnapshot'), footer.indexOf('function onSave'));
  assert.doesNotMatch(applyFn, /publishNotices|showSystemNotice|show_price_alert/);
});

test('oi report queue sits above channel sources', () => {
  const sources = withOiReportSource(DEFAULT_SOURCES);
  assert.deepEqual(sources.map((row) => row.id), ['oi_report', 'pangmao']);
  assert.equal(sources[0].name, 'BTC/ETH 5m 放量影线');
  const again = withOiReportSource(sources);
  assert.deepEqual(again.map((row) => row.id), ['oi_report', 'pangmao']);
  assert.equal(oiReportQueueUrl('http://127.0.0.1:8765/'), 'http://127.0.0.1:8765/api/report-queue?kind=st_vol_wick&symbols=BTCUSDT,ETHUSDT');
});

test('oi report items expose interval, volume and pattern', () => {
  const items = parseOiReportQueue({
    pending: {
      windowEndMs: 1795005600000,
      items: [{
        id: 'st_vol_wick:BTCUSDT:5m:1',
        kind: 'st_vol_wick',
        symbol: 'BTCUSDT',
        interval: '5m',
        sideLabel: '空',
        pattern: '放量射击之星',
        volumeSurgeLabel: '是',
        volumeSurge: 'yes',
        timeMs: 1795005300000,
        oiAnomaly: false,
      }],
    },
    reports: [{
      windowEndMs: 1795005300000,
      items: [{
        id: 'pattern:AAPLUSDT:4h:double_bottom:1',
        kind: 'pattern',
        symbol: 'AAPLUSDT',
        interval: '4h',
        sideLabel: '多',
        pattern: '底部二次探底确认',
        volumeSurgeLabel: '是',
        volumeSurge: 'yes',
        timeMs: 1795005000000,
        oiAnomaly: false,
      }, {
        id: 'st_vol_wick:ETHUSDT:5m:2',
        kind: 'st_vol_wick',
        symbol: 'ETHUSDT',
        interval: '5m',
        sideLabel: '空',
        pattern: '放量射击之星',
        volumeSurgeLabel: '否',
        volumeSurge: 'no',
        timeMs: 1795005000000,
        oiAnomaly: false,
      }],
    }],
  });
  assert.equal(items.length, 2);
  assert.equal(items[0].source, 'oi_report');
  assert.equal(items[0].card.symbol, 'BTCUSDT');
  assert.equal(items[1].card.symbol, 'ETHUSDT');
  assert.equal(isTradeCard(items[0]), true);
  const view = describeItem(items[0], OI_REPORT_SOURCE.name);
  assert.equal(view.symbol, 'BTCUSDT');
  assert.equal(view.direction, '空');
  assert.equal(view.interval, '5m');
  assert.equal(view.volumeSurge, '是');
  assert.equal(view.pattern, '放量射击之星');
  const rows = footerRows(
    withOiReportSource(DEFAULT_SOURCES),
    items,
    {},
    false,
    { oi_report: true }
  );
  assert.equal(rows[0].id, 'oi_report');
  assert.equal(rows[0].unconfigured, false);
  assert.equal(rows[0].messages, 2);
  assert.equal(rows[1].id, 'pangmao');
  assert.equal(rows[1].unconfigured, true);
});

test('oi report fetch uses the local shell command', () => {
  const footer = readFileSync(new URL('./priority-footer.js', import.meta.url), 'utf8');
  const fn = footer.slice(footer.indexOf('function fetchOiReportQueue'), footer.indexOf('function syncOiReports'));
  assert.match(fn, /oi_report_queue_get/);
  const syncFn = footer.slice(footer.indexOf('function syncOiReports'), footer.indexOf('function startOiPoll'));
  assert.match(syncFn, /fetchOiReportQueue/);
  assert.doesNotMatch(syncFn, /fetch\(url, \{ headers: \{ Accept: 'application\/json' \} \}/);
});

test('autoscript and kolvip rows sit around 胖猫社区', () => {
  const sources = arrangePrioritySources(DEFAULT_SOURCES);
  const ids = sources.map((row) => row.id);
  assert.deepEqual(ids.slice(0, 5), ['oi_report', 'autoscript_cards', 'autoscript_orders', 'autoscript_cdp', 'pangmao']);
  assert.deepEqual(ids.slice(5), KOLVIP_AUTOTRADE_SOURCES.map((row) => row.id));
  assert.equal(ids.includes('kolvip_huajie'), true);
  assert.equal(sources.find((row) => row.id === 'kolvip_lingxia').name, '零下二度VIP禁言群');
  assert.equal(isLocalPrioritySourceId('autoscript_orders'), true);
  assert.equal(isLocalPrioritySourceId('pangmao'), false);
  assert.equal(autoscriptFeedSourcesUrl('http://127.0.0.1:3852/'), 'http://127.0.0.1:3852/queue/priority/sources');
  assert.equal(autoscriptFeedWebSocketUrl('http://127.0.0.1:3852', ''), 'ws://127.0.0.1:3852/ws/priority');
  const again = arrangePrioritySources(sources);
  assert.deepEqual(again.map((row) => row.id), ids);
});

test('parseCdpItemId keeps colonful content_ref job ids and prefers meta.jobId', () => {
  const fromBody = parseCdpItemId('cdp:run_end:body:3913295ed88c:all');
  assert.equal(fromBody.event, 'run_end');
  assert.equal(fromBody.jobId, 'body:3913295ed88c');
  assert.equal(fromBody.tail, 'all');
  const plat = parseCdpItemId('cdp:platform_ok:body:3913295ed88c:gate');
  assert.equal(plat.event, 'platform_ok');
  assert.equal(plat.jobId, 'body:3913295ed88c');
  assert.equal(plat.tail, 'gate');
  const hex = parseCdpItemId('cdp:run_end:791282228fe147959a99977a4d0f65bc:all');
  assert.equal(hex.jobId, '791282228fe147959a99977a4d0f65bc');
  assert.equal(hex.tail, 'all');
  const preferred = parseCdpItemId('cdp:run_end:body-3913295ed88c:all', {
    id: 'cdp:run_end:body-3913295ed88c:all',
    meta: { jobId: 'body:3913295ed88c' }
  });
  assert.equal(preferred.jobId, 'body:3913295ed88c');
});

test('cdp run_end shows signal line and per-platform publish summary', () => {
  const job = '791282228fe147959a99977a4d0f65bc';
  const runEnd = {
    id: 'cdp:run_end:' + job + ':all',
    source: AUTOSCRIPT_CDP_SOURCE.id,
    createdAt: '2026-11-27T02:57:19.000Z',
    card: { title: '发布结束', text: '发布结束 成功 2/4', status: 'ok' },
    meta: {
      kind: 'cdp',
      via: 'cdp',
      event: 'run_end',
      channel: 'FX-黄金信号',
      symbol: 'XAU',
      direction: '做空',
      cardOpenedAt: '2026-11-27T02:50:00.000Z',
      successCount: 2,
      total: 4,
    },
  };
  const siblings = [
    runEnd,
    {
      id: 'cdp:platform_ok:' + job + ':gate',
      source: AUTOSCRIPT_CDP_SOURCE.id,
      createdAt: '2026-11-27T02:55:00.000Z',
      card: { platform: 'gate', text: '发布成功' },
      meta: { kind: 'cdp', event: 'platform_ok' },
    },
    {
      id: 'cdp:platform_fail:' + job + ':bitget',
      source: AUTOSCRIPT_CDP_SOURCE.id,
      createdAt: '2026-11-27T02:56:00.000Z',
      card: { platform: 'bitget', text: '未发出', reason: '编辑区仍在' },
      meta: { kind: 'cdp', event: 'platform_fail' },
    },
  ];
  assert.equal(isCdpRunSummary(runEnd), true);
  const sig = enrichCdpSignalFields(runEnd, siblings);
  assert.equal(sig.channel, 'FX-黄金信号');
  assert.equal(sig.symbol, 'XAU');
  assert.equal(sig.direction, '做空');
  assert.match(formatCdpRunMainLine(sig), /FX-黄金/);
  assert.match(formatCdpRunMainLine(sig), /XAU/);
  assert.match(formatCdpRunMainLine(sig), /做空/);
  assert.match(formatCdpRunMainLine(sig), /开单/);
  const summary = buildCdpPlatformSummary(runEnd, siblings);
  assert.match(summary, /发布汇总 · 成功 2\/4/);
  assert.match(summary, /✓ Gate：done/);
  assert.match(summary, /✗ Bitget：error/);
  assert.doesNotMatch(summary, /发布结束 发布结束/);
  assert.equal(isCdpFeedFragment(siblings[1]), true);
  assert.equal(isCdpFeedFragment(siblings[2]), true);
  assert.equal(isCdpFeedFragment(runEnd), false);
  assert.match(cdpSignalMissingHint({}), /待补：/);
  assert.match(formatCdpRunMainLine({}), /— · — · — · 开单 —/);
});

test('cdp body content_ref ids still group platform rows onto the same run_end', () => {
  const job = 'body:3913295ed88c';
  const runEnd = {
    id: 'cdp:run_end:' + job + ':all',
    source: 'autoscript_cdp',
    createdAt: '2026-11-27T03:50:52.000Z',
    card: { title: '发布结束', text: '发布结束 成功 2/4', status: 'ok' },
    meta: { kind: 'cdp', event: 'run_end', successCount: 2, total: 4, jobId: job }
  };
  const siblings = [
    runEnd,
    {
      id: 'cdp:platform_ok:' + job + ':gate',
      source: 'autoscript_cdp',
      createdAt: '2026-11-27T03:49:55.000Z',
      card: { platform: 'gate', text: '发布成功' },
      meta: { kind: 'cdp', event: 'platform_ok', jobId: job }
    },
    {
      id: 'cdp:platform_fail:' + job + ':bitget',
      source: 'autoscript_cdp',
      createdAt: '2026-11-27T03:50:52.000Z',
      card: { platform: 'bitget', text: '未发出', reason: 'error' },
      meta: { kind: 'cdp', event: 'platform_fail', jobId: job }
    },
    {
      id: 'cdp:platform_ok:body:aaaa1111bbbb:okx',
      source: 'autoscript_cdp',
      createdAt: '2026-11-27T02:29:00.000Z',
      card: { platform: 'okx', text: '发布成功' },
      meta: { kind: 'cdp', event: 'platform_ok', jobId: 'body:aaaa1111bbbb' }
    }
  ];
  const summary = buildCdpPlatformSummary(runEnd, siblings);
  assert.match(summary, /发布汇总 · 成功 2\/4/);
  assert.match(summary, /✓ Gate：done/);
  assert.match(summary, /✗ Bitget：error/);
  assert.doesNotMatch(summary, /OKX/);
});

test('order and cdp items describe status and count as new cards', () => {
  const order = parseQueueItems({
    items: [{
      id: 'tlog:weex:3134:1',
      source: AUTOSCRIPT_ORDER_SOURCE.id,
      createdAt: '2026-11-24T18:42:52.261Z',
      card: {
        symbol: 'XAUUSDT',
        direction: 'SHORT',
        title: 'WEEX failed',
        text: 'invalid_symbol_or_direction',
        status: 'failed',
        exchange: 'weex',
        reason: 'invalid_symbol_or_direction',
        cardId: '3134'
      },
      meta: { kind: 'order', via: 'order' }
    }]
  })[0];
  assert.equal(isTradeCard(order), true);
  const view = describeItem(order, AUTOSCRIPT_ORDER_SOURCE.name);
  assert.equal(view.exchange, 'weex');
  assert.equal(view.status, 'failed');
  assert.equal(view.reason, 'invalid_symbol_or_direction');
  assert.equal(view.cardId, '3134');
  const cdp = parseQueueItems({
    items: [{
      id: 'cdp:platform_fail:j1:x',
      source: AUTOSCRIPT_CDP_SOURCE.id,
      createdAt: '2026-11-24T15:06:09.000Z',
      card: { title: 'X / Twitter 失败', text: 'chrome-error', status: 'fail', platform: 'X / Twitter' },
      meta: { kind: 'cdp', via: 'cdp' }
    }]
  })[0];
  assert.equal(describeItem(cdp).platform, 'X / Twitter');
  assert.equal(isTradeCard(cdp), true);
  const message = parseQueueItems({
    items: [{
      id: 'msg:kolvip_huajie:1',
      source: 'kolvip_huajie',
      createdAt: '2026-11-25T01:00:00.000Z',
      card: { title: '消息', text: 'Coin: #XAUUSDT' },
      meta: { kind: 'message', via: 'message' }
    }]
  })[0];
  assert.equal(isTradeCard(message), false);
  const rows = footerRows(
    arrangePrioritySources(DEFAULT_SOURCES),
    [order, cdp, message],
    {},
    false,
    { autoscript_orders: true, autoscript_cdp: true, kolvip_huajie: true, oi_report: true }
  );
  const orderRow = rows.find((row) => row.id === AUTOSCRIPT_ORDER_SOURCE.id);
  const pangmao = rows.find((row) => row.id === 'pangmao');
  const queen = rows.find((row) => row.id === 'kolvip_huajie');
  assert.equal(orderRow.unconfigured, false);
  assert.equal(orderRow.messages, 1);
  assert.equal(orderRow.newCards, 1);
  assert.ok(rows.indexOf(orderRow) < rows.indexOf(pangmao));
  assert.ok(rows.indexOf(pangmao) < rows.indexOf(queen));
  assert.equal(queen.messages, 1);
  assert.equal(queen.newCards, 0);
});

test('default item range is today from Hong Kong midnight', () => {
  assert.equal(DEFAULT_ITEM_RANGE, 'today');
  assert.equal(parseRangeKey(''), 'today');
  assert.equal(parseRangeKey(null), 'today');
  assert.equal(parseRangeKey('12h'), 'today');
  assert.equal(parseRangeKey('24h'), '24h');
  assert.equal(parseRangeKey('week'), 'week');
  assert.equal(parseRangeKey('all'), 'all');
  assert.equal(rangeOptionLabel('today'), '今天 0 点起');
  const now = new Date('2026-11-24T18:30:00.000Z'); // 2026-11-25 02:30 +08
  assert.equal(startOfHongKongDay(now), Date.parse('2026-11-24T16:00:00.000Z'));
  assert.equal(rangeStartMs('today', now), Date.parse('2026-11-24T16:00:00.000Z'));
  assert.equal(rangeStartMs('24h', now), Date.parse('2026-11-23T18:30:00.000Z'));
  assert.equal(itemInRange({ createdAt: '2026-11-24T15:59:59.000Z' }, 'today', now), false);
  assert.equal(itemInRange({ createdAt: '2026-11-24T16:00:00.000Z' }, 'today', now), true);
  assert.equal(itemInRange({ createdAt: '' }, 'today', now), false);
  assert.equal(itemInRange({ createdAt: '2026-11-24T15:59:59.000Z' }, 'all', now), true);
  assert.equal(itemInRange({ createdAt: Date.parse('2026-11-24T16:00:00.000Z') }, 'today', now), true);
  assert.equal(itemInRange({ created_at: '2026-11-24T16:00:00.000Z' }, 'today', now), true);
  const rows = filterItemsByRange([
    { id: 'old', createdAt: '2026-11-24T15:59:59.000Z' },
    { id: 'new', createdAt: '2026-11-24T16:00:01.000Z' }
  ], 'today', now);
  assert.deepEqual(rows.map((row) => row.id), ['new']);
});

test('long lists fold after four rows until expanded', () => {
  assert.equal(LIST_FOLD_LIMIT, 4);
  const rows = [1, 2, 3, 4, 5].map((n) => ({ id: String(n) }));
  const folded = foldList(rows, 4, false);
  assert.deepEqual(folded.items.map((row) => row.id), ['1', '2', '3', '4']);
  assert.equal(folded.hidden, 1);
  assert.equal(folded.folded, true);
  const open = foldList(rows, 4, true);
  assert.equal(open.items.length, 5);
  assert.equal(open.folded, false);
  assert.equal(foldList(rows.slice(0, 4), 4, false).folded, false);
});

test('bubble settings offer a fetch range and four-line text fold styles', () => {
  const html = readFileSync(new URL('./price-bubble.html', import.meta.url), 'utf8');
  const css = readFileSync(new URL('./price-bubble.css', import.meta.url), 'utf8');
  const footer = readFileSync(new URL('./priority-footer.js', import.meta.url), 'utf8');
  assert.match(html, /id="priorityRangeBar"/);
  assert.match(html, /id="priorityFooterRange"/);
  assert.match(html, /id="prioritySettingsRange"/);
  assert.match(html, /拉取范围/);
  assert.match(footer, /priorityFooterRange/);
  assert.match(css, /priority-item-text\.is-folded[^}]*-webkit-line-clamp:\s*4/s);
  assert.match(footer, /writeRangeKey/);
  assert.match(footer, /prepareTextFolds/);
  assert.match(footer, /展开其余/);
  assert.match(footer, /function wireTextFold/);
  assert.doesNotMatch(footer, /save_priority_config[\s\S]{0,120}range/);
});

test('autoscript and oi feed candidates prefer localhost then the Mac FRP path', () => {
  const footer = readFileSync(new URL('./priority-footer.js', import.meta.url), 'utf8');
  assert.match(footer, /AUTOSCRIPT_FEED_BASE_CANDIDATES/);
  assert.match(footer, /149\.88\.80\.60:39137/);
  assert.match(footer, /OI_WEB_BASE_CANDIDATES/);
  assert.match(footer, /149\.88\.80\.60:39134/);
  assert.match(footer, /priorityFooterError/);
});

test('expanded list panel is not crushed by the compact bubble and uses a thin scrollbar', () => {
  const css = readFileSync(new URL('./price-bubble.css', import.meta.url), 'utf8');
  const footer = readFileSync(new URL('./priority-footer.js', import.meta.url), 'utf8');
  assert.match(footer, /classList\.add\('priority-expanded'\)/);
  assert.match(css, /body\.priority-expanded \.bubble-stage\s*\{[^}]*display:\s*none/s);
  assert.match(css, /body\.priority-expanded \.priority-panel\s*\{[^}]*min-height:\s*280px/s);
  assert.match(css, /body\.priority-expanded \.priority-panel-list\s*\{[^}]*min-height:\s*200px/s);
  assert.match(css, /body\.priority-expanded \.priority-footer\s*\{[^}]*max-height:\s*132px/s);
  assert.match(css, /\.priority-footer::-webkit-scrollbar\s*,\s*\.priority-panel-list::-webkit-scrollbar\s*\{[^}]*width:\s*6px/s);
  assert.match(css, /scrollbar-width:\s*thin/);
});

test('latest signal-card hint summarizes channel, symbol, price, direction and Hong Kong time', () => {
  const card = {
    id: 'card:3148',
    source: AUTOSCRIPT_CARD_SOURCE.id,
    createdAt: '2026-11-24T19:46:26.622Z',
    card: {
      channel: '币安杀手',
      symbol: 'NEAR',
      entry: '2.780 - 2.800',
      direction: '做多',
      title: 'NEAR · 做多',
      text: 'ENTRY: 2.780 - 2.800',
    },
    meta: { kind: 'card', via: 'card' },
  };
  const laterMessage = {
    id: 'msg:1',
    source: 'kolvip_huajie',
    createdAt: '2026-11-25T02:00:00.000Z',
    card: { title: '消息', text: 'hello', channel: '华尔街女王' },
    meta: { kind: 'message', via: 'message' },
  };
  const olderCard = {
    id: 'card:3143',
    source: AUTOSCRIPT_CARD_SOURCE.id,
    createdAt: '2026-11-24T19:13:20.428Z',
    card: { channel: 'FX-黄金信号', symbol: 'XAU', entry: '3568', direction: '做空' },
    meta: { kind: 'card', via: 'card' },
  };
  const order = {
    id: 'tlog:1',
    source: AUTOSCRIPT_ORDER_SOURCE.id,
    createdAt: '2026-11-25T03:00:00.000Z',
    card: { symbol: 'XAUUSDT', direction: 'SHORT', entry: '3568' },
    meta: { kind: 'order', via: 'order' },
  };

  assert.equal(isSignalCard(card), true);
  assert.equal(isSignalCard({ ...card, source: 'kolvip_binance_killer' }), true);
  assert.equal(isSignalCard(laterMessage), false);
  assert.equal(isSignalCard(order), false);
  assert.equal(isSignalCard(plain), false);
  assert.equal(isTradeCard(trade), true);
  assert.equal(isSignalCard(trade), false);

  const view = describeItem(card);
  assert.equal(view.channel, '币安杀手');
  assert.equal(view.symbol, 'NEAR');
  assert.equal(view.entry, '2.780 - 2.800');
  assert.equal(view.price, '');
  assert.equal(view.direction, '做多');

  assert.equal(truncateChannelName('币安杀手'), '币安杀手');
  assert.equal(truncateChannelName('华尔街女王'), '华尔街女王');
  assert.equal(truncateChannelName('零下二度VIP禁言群'), '零下二度V...');
  assert.equal(truncateChannelName(''), '');
  assert.equal(truncateChannelName(null), '');

  assert.equal(
    formatLatestCardHint(card),
    '币安杀手 · NEAR · 2.780 - 2.800 · 做多 · 11-25 03:46'
  );
  assert.equal(
    formatLatestCardHint({
      ...card,
      card: { ...card.card, channel: '华尔街女王' },
    }),
    '华尔街女王 · NEAR · 2.780 - 2.800 · 做多 · 11-25 03:46'
  );
  assert.equal(
    formatLatestCardHint({
      ...card,
      card: { ...card.card, channel: '零下二度VIP禁言群' },
    }),
    '零下二度V... · NEAR · 2.780 - 2.800 · 做多 · 11-25 03:46'
  );

  const priced = {
    ...card,
    card: { ...card.card, price: '2.791', entry: '2.780 - 2.800' },
  };
  assert.equal(
    formatLatestCardHint(priced),
    '币安杀手 · NEAR · 2.791 · 做多 · 11-25 03:46'
  );

  const sparse = {
    id: 'card:3135',
    source: AUTOSCRIPT_CARD_SOURCE.id,
    createdAt: '2026-11-25T01:15:12.222Z',
    card: { symbol: 'BTCUSDT', direction: '做多', title: '卡片 #3135' },
    meta: { kind: 'card', via: 'card' },
  };
  assert.equal(formatLatestCardHint(sparse), 'BTCUSDT · 做多 · 11-25 09:15');
  assert.equal(formatLatestCardHint(null), '');

  const latest = latestSignalCard([laterMessage, olderCard, order, sparse, card]);
  assert.equal(latest.id, 'card:3135');
  assert.equal(formatLatestCardHint(latest), 'BTCUSDT · 做多 · 11-25 09:15');
  assert.doesNotMatch(formatLatestCardHint(card), /最近卡片/);
  const footerSrc = readFileSync(new URL('./priority-footer.js', import.meta.url), 'utf8');
  const hintFn = footerSrc.slice(
    footerSrc.indexOf('export function formatLatestCardHint'),
    footerSrc.indexOf('export function itemInRange')
  );
  assert.doesNotMatch(hintFn, /最近卡片/);

  const tiedKolvip = {
    ...sparse,
    id: 'chcard:kolvip:3135',
    source: 'kolvip_huajie',
  };
  assert.equal(latestSignalCard([tiedKolvip, sparse]).source, AUTOSCRIPT_CARD_SOURCE.id);

  const footer = readFileSync(new URL('./priority-footer.js', import.meta.url), 'utf8');
  const renderFn = footer.slice(
    footer.indexOf('function renderRangeBars'),
    footer.indexOf('function renderSourceField')
  );
  assert.match(renderFn, /formatLatestCardHint\(latestSignalCard\(state\.items/);
  assert.match(renderFn, /classList\.add\('is-latest'\)/);
  assert.match(renderFn, /该时段暂无消息/);
  const css = readFileSync(new URL('./price-bubble.css', import.meta.url), 'utf8');
  assert.match(css, /\.priority-filter-hint\.is-latest\s*\{[^}]*color:\s*#c9d1d9/s);
  assert.match(footer, /该时段暂无消息[\s\S]{0,80}已隐藏/);
});

test('latest-card hint stays a short summary and hides unparsed symbol/direction', () => {
  assert.equal(compactHintSymbol('BTC'), 'BTC');
  assert.equal(compactHintSymbol('ETHUSDT'), 'ETHUSDT');
  assert.equal(compactHintSymbol('比特币 方向：做多 入场：当前5.84-5.89附近'), '');
  assert.equal(compactHintDirection('做多'), '做多');
  assert.equal(compactHintDirection('SHORT'), 'SHORT');
  assert.equal(compactHintDirection('做多 入场：当前5.84-5.89附近 信心度：中 倍数：5倍 仓位：10% 止盈：点位1：6.05万附近（求稳） 点位2：6.22万附近 点位3：6.4万 止损：小幅跌破5.78万一点。 理由：'), '做多');
  assert.equal(compactHintDirection('当前5.84-5.89附近 信心度：中 倍数：5倍'), '');
  assert.equal(compactHintPrice('2.780 - 2.800'), '2.780 - 2.800');
  assert.equal(compactHintPrice('3568'), '3568');
  assert.equal(
    compactHintPrice('当前5.84-5.89附近 信心度：中 倍数：5倍 仓位：10% 止盈：点位1：6.05万附近（求稳） 点位2：6.22万附近 点位3：6.4万 止损：小幅跌破5.78万一点。 理由：'),
    '5.84-5.89'
  );
  assert.doesNotMatch(compactHintPrice('当前5.84-5.89附近 信心度：中 仓位：10% 止盈：6.05万 止损：5.78万 理由：支撑'), /止盈|止损|理由|仓位|信心度/);

  const shuqin = {
    id: 'card:3155',
    source: AUTOSCRIPT_CARD_SOURCE.id,
    createdAt: '2026-11-25T02:47:28.912Z',
    card: {
      channel: '淑琴',
      symbol: 'BTC',
      direction: '做多 入场：当前5.84-5.89附近 信心度：中 倍数：5倍 仓位：10% 止盈：点位1：6.05万附近（求稳） 点位2：6.22万附近 点位3：6.4万 止损：小幅跌破5.78万一点。 理由：',
      entry: '当前5.84-5.89附近 信心度：中 倍数：5倍 仓位：10% 止盈：点位1：6.05万附近（求稳） 点位2：6.22万附近 点位3：6.4万 止损：小幅跌破5.78万一点。 理由：',
      title: '比特币信号',
      text: '比特币 方向：做多 入场：当前5.84-5.89附近 信心度：中 倍数：5倍 仓位：10%',
    },
    meta: { kind: 'card', via: 'card' },
  };
  assert.equal(formatLatestCardHint(shuqin), '淑琴 · BTC · 5.84-5.89 · 做多 · 11-25 10:47');
  assert.doesNotMatch(formatLatestCardHint(shuqin), /止盈|止损|理由|仓位|信心度|倍数|点位|入场/);

  const noDirection = {
    ...shuqin,
    card: { ...shuqin.card, direction: '当前5.84-5.89附近 信心度：中 仓位：10%' },
  };
  assert.equal(formatLatestCardHint(noDirection), '');

  const noSymbol = {
    ...shuqin,
    card: { ...shuqin.card, symbol: '比特币可以在前低附近挂一单，还是老样子' },
  };
  assert.equal(formatLatestCardHint(noSymbol), '');
});

test('autoscript order snapshots and live frames upsert the same venue+card instead of appending', () => {
  const first = {
    id: 'tlog:bitget:3141:2026-11-25T05:12:34.899Z',
    source: AUTOSCRIPT_ORDER_SOURCE.id,
    createdAt: '2026-11-25T05:12:34.899Z',
    card: { symbol: 'MMT', direction: 'long', status: 'tpsl_set', exchange: 'bitget', cardId: '3141' },
    meta: { kind: 'order', via: 'order', event: 'order_persist' },
  };
  const later = {
    id: 'tlog:bitget:3141:2026-11-25T10:44:53.536Z',
    source: AUTOSCRIPT_ORDER_SOURCE.id,
    createdAt: '2026-11-25T10:44:53.536Z',
    card: { symbol: 'MMT', direction: 'long', status: 'tpsl_set', exchange: 'bitget', cardId: '3141' },
    meta: { kind: 'order', via: 'order', event: 'order_persist' },
  };
  const filled = {
    id: 'tlog:bitget:3141:2026-11-25T10:45:00.000Z',
    source: AUTOSCRIPT_ORDER_SOURCE.id,
    createdAt: '2026-11-25T10:45:00.000Z',
    card: { symbol: 'MMT', direction: 'long', status: 'filled', exchange: 'bitget', cardId: '3141' },
    meta: { kind: 'order', via: 'order', event: 'order_persist' },
  };
  assert.equal(autoscriptOrderIdentityId(first), 'order:bitget:3141');
  const parsed = parseQueueItems({ items: [first, later, filled] });
  assert.equal(parsed.length, 1);
  assert.equal(parsed[0].id, 'order:bitget:3141');
  assert.equal(parsed[0].card.status, 'filled');

  let items = ingestPriorityFrame([], { type: 'priority_card', ...first });
  items = ingestPriorityFrame(items, { type: 'priority_card', ...later });
  items = ingestPriorityFrame(items, { type: 'priority_card', ...filled });
  assert.equal(items.length, 1);
  assert.equal(items[0].id, 'order:bitget:3141');
  assert.equal(items[0].card.status, 'filled');

  const weex = {
    id: 'tlog:weex:3141:2026-11-25T05:12:34.899Z',
    source: AUTOSCRIPT_ORDER_SOURCE.id,
    createdAt: '2026-11-25T05:12:34.899Z',
    card: { symbol: 'MMT', direction: 'long', status: 'failed', exchange: 'weex', cardId: '3141' },
    meta: { kind: 'order', via: 'order' },
  };
  const both = parseQueueItems({ items: [first, weex] });
  assert.deepEqual(both.map((row) => row.id).sort(), ['order:bitget:3141', 'order:weex:3141']);
});
