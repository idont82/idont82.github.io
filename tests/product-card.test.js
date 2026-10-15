const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const modulePath = pathToFileURL(path.join(__dirname, '..', 'assets', 'product-card.js')).href;
const load = () => import(modulePath);

const ENTRY = {
  char: 'trex',
  name: '티라노',
  thumbnail: 'trex.webp',
  productName: '공룡 인형 티라노 40cm',
  priceLabel: '25,000원',
  priceAsOf: '2026-10-15',
  rocket: true,
  link: 'https://link.coupang.com/a/one?subId=clawgame',
};

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
  };
}

test('markSuccessCardShown is true once per session', async () => {
  const { markSuccessCardShown } = await load();
  const storage = memoryStorage();
  assert.equal(markSuccessCardShown(storage), true);
  assert.equal(markSuccessCardShown(storage), false);
  assert.equal(markSuccessCardShown(storage), false);
});

test('markSuccessCardShown returns false when storage reads throw', async () => {
  const { markSuccessCardShown } = await load();
  const blocked = {
    getItem() { throw new DOMException('blocked'); },
    setItem() { throw new DOMException('blocked'); },
  };
  assert.equal(markSuccessCardShown(blocked), false);
});

test('markSuccessCardShown returns false when storage is absent', async () => {
  const { markSuccessCardShown } = await load();
  assert.equal(markSuccessCardShown(null), false);
  assert.equal(markSuccessCardShown(undefined), false);
});

test('cardHtml renders name, price, as-of date and the link', async () => {
  const { cardHtml } = await load();
  const html = cardHtml(ENTRY, { placement: 'game_success' });
  assert.match(html, /공룡 인형 티라노 40cm/);
  assert.match(html, /25,000원/);
  assert.match(html, /2026-10-15 기준/);
  assert.match(html, /로켓배송/);
  assert.match(html, /href="https:\/\/link\.coupang\.com\/a\/one\?subId=clawgame"/);
  assert.match(html, /data-coupang-placement="game_success"/);
  assert.match(html, /rel="[^"]*nofollow[^"]*sponsored[^"]*"/);
  assert.match(html, /target="_blank"/);
});

test('cardHtml escapes HTML in product names', async () => {
  const { cardHtml } = await load();
  const html = cardHtml({ ...ENTRY, productName: '인형 <script>alert(1)</script>' }, { placement: 'game_success' });
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});

test('cardHtml omits the rocket badge when the product is not rocket', async () => {
  const { cardHtml } = await load();
  assert.doesNotMatch(cardHtml({ ...ENTRY, rocket: false }, { placement: 'game_coin' }), /로켓배송/);
});

test('cardHtml returns an empty string for a missing entry or link', async () => {
  const { cardHtml } = await load();
  assert.equal(cardHtml(null, { placement: 'game_success' }), '');
  assert.equal(cardHtml({ ...ENTRY, link: '' }, { placement: 'game_success' }), '');
});

test('cardsHtml renders up to the limit and drops unusable entries', async () => {
  const { cardsHtml } = await load();
  const items = [ENTRY, { ...ENTRY, char: 'b' }, { ...ENTRY, char: 'c' }, { ...ENTRY, char: 'd', link: '' }];
  const html = cardsHtml(items, { placement: 'game_coin', limit: 3 });
  assert.equal((html.match(/data-coupang-link/g) || []).length, 3);
});

test('cardsHtml returns an empty string for an empty list', async () => {
  const { cardsHtml } = await load();
  assert.equal(cardsHtml([], { placement: 'game_coin', limit: 3 }), '');
  assert.equal(cardsHtml(null, { placement: 'game_coin', limit: 3 }), '');
});
