import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  DEFAULT_BASE_URL,
  DEFAULT_SOURCES,
  QUEUE_LIMIT,
  STORAGE_KEYS,
  describeItem,
  displayBaseUrl,
  footerRows,
  formatTime,
  ingestPriorityFrame,
  isTradeCard,
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

test('formatTime uses the local calendar', () => {
  const local = new Date(2026, 10, 17, 7, 5);
  assert.equal(formatTime(local.toISOString()), '11-17 07:05');
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
  assert.doesNotMatch(footer, /149\.88\.80\.60/);
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

