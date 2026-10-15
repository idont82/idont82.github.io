const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { pickProduct, buildManifestEntry, buildManifest } = require('../scripts/assets/theme-manifest');

const root = path.join(__dirname, '..');

const ITEMS = [
  { rank: 1, productName: '키링 도라에몽 미니', productPrice: 3900, isRocket: true, productId: 1, productImage: 'a.jpg', productUrl: 'u1' },
  { rank: 2, productName: '도라에몽 정품 봉제인형 30cm', productPrice: 24900, isRocket: true, productId: 2, productImage: 'b.jpg', productUrl: 'u2' },
  { rank: 3, productName: '도라에몽 인형 대형 80cm', productPrice: 89000, isRocket: false, productId: 3, productImage: 'c.jpg', productUrl: 'u3' },
];

test('pickProduct takes the best-ranked item inside the price band', () => {
  const picked = pickProduct(ITEMS, { minPrice: 8000, maxPrice: 60000, requireKeyword: '인형' });
  assert.equal(picked.productId, 2);
});

test('pickProduct skips items missing the required keyword', () => {
  const picked = pickProduct(ITEMS, { minPrice: 1000, maxPrice: 100000, requireKeyword: '봉제' });
  assert.equal(picked.productId, 2);
});

test('pickProduct prefers rocket delivery when ranks tie on price band', () => {
  const items = [
    { rank: 5, productName: '인형 A', productPrice: 20000, isRocket: false, productId: 10 },
    { rank: 5, productName: '인형 B', productPrice: 20000, isRocket: true, productId: 11 },
  ];
  assert.equal(pickProduct(items, { minPrice: 1000, maxPrice: 100000, requireKeyword: '인형' }).productId, 11);
});

test('pickProduct returns null when nothing matches', () => {
  assert.equal(pickProduct(ITEMS, { minPrice: 200000, maxPrice: 300000, requireKeyword: '인형' }), null);
});

test('pickProduct returns null for an empty list', () => {
  assert.equal(pickProduct([], { minPrice: 0, maxPrice: 1e9, requireKeyword: '' }), null);
});

test('buildManifestEntry carries product facts and the deeplink', () => {
  const entry = buildManifestEntry({
    char: 'doraemon',
    name: '도라에몽',
    product: ITEMS[1],
    deeplink: 'https://link.coupang.com/a/xyz?subId=clawgame',
    asOfDate: '2026-10-15',
  });

  assert.deepEqual(entry, {
    char: 'doraemon',
    name: '도라에몽',
    model: 'doraemon.glb',
    thumbnail: 'doraemon.webp',
    productName: '도라에몽 정품 봉제인형 30cm',
    price: 24900,
    priceLabel: '24,900원',
    priceAsOf: '2026-10-15',
    rocket: true,
    link: 'https://link.coupang.com/a/xyz?subId=clawgame',
  });
});

test('buildManifest keeps only entries that have a link', () => {
  const manifest = buildManifest({
    theme: 'doraemon',
    asOfDate: '2026-10-15',
    entries: [
      buildManifestEntry({ char: 'a', name: 'A', product: ITEMS[1], deeplink: 'https://link.coupang.com/a/1?subId=clawgame', asOfDate: '2026-10-15' }),
      { char: 'b', name: 'B', model: 'b.glb', thumbnail: 'b.webp', link: '' },
    ],
  });

  assert.equal(manifest.theme, 'doraemon');
  assert.equal(manifest.asOfDate, '2026-10-15');
  assert.equal(manifest.items.length, 1);
  assert.equal(manifest.items[0].char, 'a');
});

test('every manifest link carries subId=clawgame', () => {
  const manifest = buildManifest({
    theme: 'doraemon',
    asOfDate: '2026-10-15',
    entries: [buildManifestEntry({
      char: 'a', name: 'A', product: ITEMS[1],
      deeplink: 'https://link.coupang.com/a/1?subId=clawgame', asOfDate: '2026-10-15',
    })],
  });
  for (const item of manifest.items) {
    assert.match(item.link, /[?&]subId=clawgame(&|$)/);
  }
});

test('themes.json maps every PLUSHIE_THEMES char to a search keyword', () => {
  const themes = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'assets', 'themes.json'), 'utf8'));
  const game = fs.readFileSync(path.join(root, 'claw-machine.js'), 'utf8');
  const chars = [...game.matchAll(/char:\s*'([^']+)'/g)].map((m) => m[1]);

  assert.ok(chars.length >= 16);
  const mapped = new Set(Object.values(themes).flatMap((list) => list.map((entry) => entry.char)));
  for (const char of chars) {
    assert.ok(mapped.has(char), `themes.json 에 ${char} 가 없습니다.`);
  }
});

const GOOD_ENTRY = buildManifestEntry({
  char: 'a', name: 'A', product: ITEMS[1],
  deeplink: 'https://link.coupang.com/a/1?subId=clawgame', asOfDate: '2026-10-15',
});

test('buildManifest rejects a link with no subId', () => {
  assert.throws(
    () => buildManifest({ theme: 't', asOfDate: '2026-10-15', entries: [{ ...GOOD_ENTRY, link: 'https://coupang.com/raw-url' }] }),
    { message: 'a 링크에 subId=clawgame 이 없습니다.' },
  );
});

test('buildManifest rejects a link with a different subId', () => {
  assert.throws(
    () => buildManifest({ theme: 't', asOfDate: '2026-10-15', entries: [{ ...GOOD_ENTRY, link: 'https://link.coupang.com/a/1?subId=other' }] }),
    { message: 'a 링크에 subId=clawgame 이 없습니다.' },
  );
});

test('buildManifestEntry throws when asOfDate is missing', () => {
  assert.throws(
    () => buildManifestEntry({ char: 'a', name: 'A', product: ITEMS[1], deeplink: 'x?subId=clawgame' }),
    { message: 'a 항목에 가격 기준일(asOfDate)이 없습니다.' },
  );
});

test('buildManifest rejects an entry with no priceAsOf', () => {
  const { priceAsOf, ...undated } = GOOD_ENTRY;
  assert.throws(
    () => buildManifest({ theme: 't', asOfDate: '2026-10-15', entries: [undated] }),
    { message: 'a 항목에 가격 기준일(priceAsOf)이 없습니다.' },
  );
});

test('pickProduct sorts unranked items last and breaks ties by rocket', () => {
  const items = [
    { productName: '인형 무순위', productPrice: 20000, isRocket: true, productId: 20 },
    { rank: 9, productName: '인형 순위', productPrice: 20000, isRocket: false, productId: 21 },
  ];
  assert.equal(pickProduct(items, { requireKeyword: '인형' }).productId, 21);

  const unranked = [
    { productName: '인형 A', productPrice: 20000, isRocket: false, productId: 30 },
    { productName: '인형 B', productPrice: 20000, isRocket: true, productId: 31 },
  ];
  assert.equal(pickProduct(unranked, { requireKeyword: '인형' }).productId, 31);
});

test('pickProduct rejects null, empty, and non-positive prices', () => {
  const items = [null, '', undefined, 0, -5].map((productPrice, i) => (
    { rank: 1, productName: '인형', productPrice, productId: i }
  ));
  assert.equal(pickProduct(items), null);
});

test('pickProduct rejects items without a productName', () => {
  const items = [
    { rank: 1, productPrice: 20000, productId: 40 },
    { rank: 2, productName: '', productPrice: 20000, productId: 41 },
    { rank: 3, productName: '인형', productPrice: 20000, productId: 42 },
  ];
  assert.equal(pickProduct(items).productId, 42);
});
