import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  DEFAULT_SOURCES,
  QUEUE_LIMIT,
  STORAGE_KEYS,
  describeItem,
  footerRows,
  formatTime,
  ingestPriorityFrame,
  isTradeCard,
  markSeen,
  mergeItems,
  normalizeBaseUrl,
  parseQueueItems,
  parseSources,
  queueUrl,
  replaceSourceItems,
  seenSet,
  sourceCounts,
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
