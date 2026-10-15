const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { buildTheme, checkBudget } = require('../scripts/assets/build-theme-assets');

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'claw-assets-'));
}

const THEMES = {
  dino: [
    { char: 'trex', name: '티라노', keyword: '티라노 인형', requireKeyword: '인형', minPrice: 1000, maxPrice: 90000 },
    { char: 'stego', name: '스테고', keyword: '스테고 인형', requireKeyword: '인형', minPrice: 1000, maxPrice: 90000 },
  ],
};

function deps(overrides = {}) {
  return {
    themes: THEMES,
    searchProducts: async ({ keyword }) => ({
      items: [{
        rank: 1,
        productName: `${keyword} 봉제`,
        productPrice: 25000,
        isRocket: true,
        productId: keyword.length,
        productImage: `https://img.test/${keyword}.jpg`,
        productUrl: `https://www.coupang.com/vp/products/${keyword.length}`,
      }],
    }),
    downloadImage: async () => Buffer.from('png'),
    generateModel: async () => Buffer.from('glb-bytes'),
    optimizeGlb: (buffer) => ({ buffer: Buffer.concat([buffer, Buffer.from('-opt')]), images: 1 }),
    makeThumbnail: async () => Buffer.from('webp'),
    createDeeplinks: async (urls) => urls.map((url, i) => ({
      originalUrl: url,
      shortenUrl: `https://link.coupang.com/a/s${i}?subId=clawgame`,
    })),
    ...overrides,
  };
}

test('buildTheme writes a glb, a thumbnail and a manifest per character', async () => {
  const out = tempDir();
  const result = await buildTheme('dino', deps(), { outDir: out, asOfDate: '2026-10-15' });

  assert.equal(result.manifest.items.length, 2);
  assert.equal(result.skipped.length, 0);
  assert.ok(fs.existsSync(path.join(out, 'dino', 'trex.glb')));
  assert.ok(fs.existsSync(path.join(out, 'dino', 'trex.webp')));

  const manifest = JSON.parse(fs.readFileSync(path.join(out, 'dino', 'manifest.json'), 'utf8'));
  assert.equal(manifest.theme, 'dino');
  assert.equal(manifest.asOfDate, '2026-10-15');
  for (const item of manifest.items) {
    assert.match(item.link, /[?&]subId=clawgame(&|$)/);
  }
});

test('buildTheme skips a character with no matching product', async () => {
  const out = tempDir();
  const result = await buildTheme('dino', deps({
    searchProducts: async ({ keyword }) => (keyword.includes('스테고') ? { items: [] } : {
      items: [{
        rank: 1, productName: '티라노 인형 봉제', productPrice: 25000, isRocket: true,
        productId: 1, productImage: 'https://img.test/a.jpg', productUrl: 'https://www.coupang.com/vp/products/1',
      }],
    }),
  }), { outDir: out, asOfDate: '2026-10-15' });

  assert.equal(result.manifest.items.length, 1);
  assert.deepEqual(result.skipped, [{ char: 'stego', reason: '조건에 맞는 상품 없음' }]);
  assert.ok(!fs.existsSync(path.join(out, 'dino', 'stego.glb')));
});

test('buildTheme skips a character whose model generation fails', async () => {
  const out = tempDir();
  const result = await buildTheme('dino', deps({
    generateModel: async (_buf, entry) => {
      if (entry.char === 'trex') throw new Error('OOM');
      return Buffer.from('glb-bytes');
    },
  }), { outDir: out, asOfDate: '2026-10-15' });

  assert.equal(result.manifest.items.length, 1);
  assert.equal(result.manifest.items[0].char, 'stego');
  assert.equal(result.skipped[0].char, 'trex');
  assert.match(result.skipped[0].reason, /OOM/);
});

test('buildTheme writes no manifest and removes a stale one when every character is skipped', async () => {
  const out = tempDir();
  const manifestPath = path.join(out, 'dino', 'manifest.json');
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, '{"theme":"dino","items":[{"char":"old"}]}', 'utf8');

  const result = await buildTheme('dino', deps({
    searchProducts: async () => ({ items: [] }),
  }), { outDir: out, asOfDate: '2026-10-15' });

  assert.deepEqual(result.manifest.items, []);
  assert.deepEqual(result.written, []);
  assert.deepEqual(result.skipped.map((entry) => entry.char), ['trex', 'stego']);
  assert.ok(!fs.existsSync(manifestPath));
});

test('buildTheme skips and cleans up a character whose deeplink is missing', async () => {
  const out = tempDir();
  const result = await buildTheme('dino', deps({
    searchProducts: async ({ keyword }) => ({
      items: [{
        rank: 1,
        productName: `${keyword} 봉제`,
        productPrice: 25000,
        isRocket: true,
        productId: keyword,
        productImage: 'https://img.test/a.jpg',
        productUrl: `https://www.coupang.com/vp/products/${encodeURIComponent(keyword)}`,
      }],
    }),
    createDeeplinks: async (urls) => urls
      .filter((url) => url.includes(encodeURIComponent('스테고')))
      .map((url) => ({ originalUrl: url, shortenUrl: 'https://link.coupang.com/a/s?subId=clawgame' })),
  }), { outDir: out, asOfDate: '2026-10-15' });

  // trex 의 딥링크만 응답에서 빠진다.
  assert.deepEqual(result.skipped, [{ char: 'trex', reason: '딥링크 생성 실패' }]);
  assert.ok(!fs.existsSync(path.join(out, 'dino', 'trex.glb')));
  assert.ok(!fs.existsSync(path.join(out, 'dino', 'trex.webp')));
  assert.ok(fs.existsSync(path.join(out, 'dino', 'stego.glb')));
  assert.deepEqual(result.manifest.items.map((item) => item.char), ['stego']);
  assert.ok(result.written.every((file) => !file.includes('trex')));
  const onDisk = JSON.parse(fs.readFileSync(path.join(out, 'dino', 'manifest.json'), 'utf8'));
  assert.deepEqual(onDisk.items.map((item) => item.char), ['stego']);
});

test('buildTheme writes no manifest and removes a stale one when every deeplink is empty', async () => {
  const out = tempDir();
  const manifestPath = path.join(out, 'dino', 'manifest.json');
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, '{"theme":"dino","items":[{"char":"old"}]}', 'utf8');

  const result = await buildTheme('dino', deps({
    createDeeplinks: async () => [],
  }), { outDir: out, asOfDate: '2026-10-15' });

  assert.ok(!fs.existsSync(manifestPath));
  assert.deepEqual(result.manifest.items, []);
  assert.deepEqual(result.written, []);
  assert.deepEqual(result.skipped.map((entry) => entry.char).sort(), ['stego', 'trex']);
  assert.ok(result.skipped.every((entry) => entry.reason === '딥링크 생성 실패'));
  assert.deepEqual(fs.readdirSync(path.join(out, 'dino')), []);
});

test('buildTheme leaves no glb behind when the thumbnail step throws', async () => {
  const out = tempDir();
  const result = await buildTheme('dino', deps({
    makeThumbnail: async (_image) => { throw new Error('썸네일 실패'); },
  }), { outDir: out, asOfDate: '2026-10-15' });

  assert.equal(result.skipped.length, 2);
  assert.match(result.skipped[0].reason, /썸네일 실패/);
  assert.ok(!fs.existsSync(path.join(out, 'dino', 'trex.glb')));
  assert.ok(!fs.existsSync(path.join(out, 'dino', 'stego.glb')));
});

test('buildTheme throws for an unknown theme', async () => {
  await assert.rejects(
    () => buildTheme('nope', deps(), { outDir: tempDir(), asOfDate: '2026-10-15' }),
    /nope/,
  );
});

test('checkBudget passes when every file is inside its limit', () => {
  const result = checkBudget(
    [{ name: 'dino/trex.glb', bytes: 200 * 1024 }, { name: 'dino/stego.glb', bytes: 250 * 1024 }],
    { perModel: 300 * 1024, perTheme: 1.8 * 1024 * 1024 },
  );
  assert.deepEqual(result, { ok: true, violations: [] });
});

test('checkBudget reports a model over the per-file limit', () => {
  const result = checkBudget(
    [{ name: 'dino/trex.glb', bytes: 400 * 1024 }],
    { perModel: 300 * 1024, perTheme: 1.8 * 1024 * 1024 },
  );
  assert.equal(result.ok, false);
  assert.match(result.violations[0], /dino\/trex\.glb/);
});

test('checkBudget reports a theme over the total limit', () => {
  const files = Array.from({ length: 8 }, (_, i) => ({ name: `dino/m${i}.glb`, bytes: 290 * 1024 }));
  const result = checkBudget(files, { perModel: 300 * 1024, perTheme: 1.8 * 1024 * 1024 });
  assert.equal(result.ok, false);
  assert.ok(result.violations.some((line) => /합계/.test(line)));
});
