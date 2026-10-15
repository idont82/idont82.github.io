const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { buildTheme, canonicalUrl, checkBudget } = require('../scripts/assets/build-theme-assets');

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
        productId: keyword.charCodeAt(0),
        productImage: `https://img.test/${keyword}.jpg`,
        productUrl: `https://www.coupang.com/vp/products/${keyword.charCodeAt(0)}`,
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
    // 비율 게이트는 실제 GLB 를 읽는다. 가짜 버퍼를 쓰는 테스트는 측정만 주입한다.
    measureBounds: () => ({ min: { x: -0.1, y: 0, z: -0.1 }, max: { x: 0.1, y: 0.3, z: 0.1 } }),
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

test('buildTheme never assigns the same product to two characters', async () => {
  const out = tempDir();
  const product = (id, rank) => ({
    rank, productName: `공룡 인형 ${id}`, productPrice: 25000, isRocket: true, productId: id,
    productImage: `https://img.test/${id}.jpg`, productUrl: `https://www.coupang.com/vp/products/${id}`,
  });
  const result = await buildTheme('dino', deps({
    // 두 검색 모두 상품 7 을 1순위로 돌려주고, 8 은 2순위로만 있다.
    searchProducts: async () => ({ items: [product(7, 1), product(8, 2)] }),
  }), { outDir: out, asOfDate: '2026-10-15' });

  const names = result.manifest.items.map((item) => item.productName);
  assert.equal(new Set(names).size, names.length);
  assert.deepEqual([...names].sort(), ['공룡 인형 7', '공룡 인형 8']);
});

test('buildTheme skips a character whose only match was already taken', async () => {
  const out = tempDir();
  const result = await buildTheme('dino', deps({
    searchProducts: async () => ({
      items: [{
        rank: 1, productName: '공룡 인형', productPrice: 25000, isRocket: true, productId: 7,
        productImage: 'https://img.test/7.jpg', productUrl: 'https://www.coupang.com/vp/products/7',
      }],
    }),
  }), { outDir: out, asOfDate: '2026-10-15' });

  assert.equal(result.manifest.items.length, 1);
  assert.equal(result.skipped.length, 1);
  assert.ok(!fs.existsSync(path.join(out, 'dino', `${result.skipped[0].char}.glb`)));
});

test('buildTheme skips and cleans up a character whose model is too sprawled', async () => {
  const out = tempDir();
  const sprawled = { min: { x: -0.2, y: 0, z: -0.45 }, max: { x: 0.2, y: 0.3, z: 0.45 } };
  const upright = { min: { x: -0.1, y: 0, z: -0.1 }, max: { x: 0.1, y: 0.3, z: 0.1 } };

  // 이전 빌드가 남긴 파일이 있어도 건너뛴 캐릭터의 잔재는 지워져야 한다.
  fs.mkdirSync(path.join(out, 'dino'), { recursive: true });
  fs.writeFileSync(path.join(out, 'dino', 'trex.glb'), 'stale');
  fs.writeFileSync(path.join(out, 'dino', 'trex.webp'), 'stale');

  const result = await buildTheme('dino', deps({
    generateModel: async (_image, entry) => Buffer.from(entry.char),
    measureBounds: (buffer) => (buffer.toString().startsWith('trex') ? sprawled : upright),
  }), { outDir: out, asOfDate: '2026-10-15' });

  assert.deepEqual(result.manifest.items.map((item) => item.char), ['stego']);
  assert.equal(result.skipped.length, 1);
  assert.equal(result.skipped[0].char, 'trex');
  assert.match(result.skipped[0].reason, /비율/);
  assert.ok(!fs.existsSync(path.join(out, 'dino', 'trex.glb')));
  assert.ok(!fs.existsSync(path.join(out, 'dino', 'trex.webp')));
  assert.ok(fs.existsSync(path.join(out, 'dino', 'stego.glb')));
});

test('buildTheme keeps a character whose model is within the proportion limit', async () => {
  const out = tempDir();
  const result = await buildTheme('dino', deps({
    // 비율 1.75 — 한도 1.8 바로 아래는 통과한다.
    measureBounds: () => ({ min: { x: 0, y: 0, z: 0 }, max: { x: 0.525, y: 0.3, z: 0.1 } }),
  }), { outDir: out, asOfDate: '2026-10-15' });

  assert.equal(result.skipped.length, 0);
  assert.deepEqual(result.manifest.items.map((item) => item.char), ['trex', 'stego']);
});

test('buildTheme skips a character whose model bounds cannot be read', async () => {
  const out = tempDir();
  const result = await buildTheme('dino', deps({
    measureBounds: () => null,
  }), { outDir: out, asOfDate: '2026-10-15' });

  assert.equal(result.manifest.items.length, 0);
  assert.equal(result.skipped.length, 2);
  assert.ok(result.skipped.every((entry) => /바운딩/.test(entry.reason)));
});

test('buildTheme measures the optimized buffer, not the raw one', async () => {
  const out = tempDir();
  const seen = [];
  await buildTheme('dino', deps({
    measureBounds: (buffer) => {
      seen.push(buffer.toString());
      return { min: { x: -0.1, y: 0, z: -0.1 }, max: { x: 0.1, y: 0.3, z: 0.1 } };
    },
  }), { outDir: out, asOfDate: '2026-10-15' });

  assert.equal(seen.length, 2);
  assert.ok(seen.every((text) => text.endsWith('-opt')), `측정 대상: ${seen.join(', ')}`);
});

test('canonicalUrl keeps www.coupang.com urls and rebuilds everything else from the product id', () => {
  const www = 'https://www.coupang.com/vp/products/55?itemId=1';
  assert.equal(canonicalUrl({ productId: 55, productUrl: www }), www);
  assert.equal(
    canonicalUrl({ productId: 55, productUrl: 'https://link.coupang.com/re/AFFSDP?lptag=x&pageKey=55' }),
    'https://www.coupang.com/vp/products/55',
  );
  assert.equal(canonicalUrl({ productId: 55, productUrl: '' }), 'https://www.coupang.com/vp/products/55');
  assert.equal(canonicalUrl({ productId: 55 }), 'https://www.coupang.com/vp/products/55');
});

test('buildTheme sends the deeplink API canonical urls even when search returns affiliate links', async () => {
  const out = tempDir();
  const received = [];
  const result = await buildTheme('dino', deps({
    searchProducts: async ({ keyword }) => ({
      items: [{
        rank: 1, productName: `${keyword} 봉제`, productPrice: 25000, isRocket: true,
        productId: keyword.charCodeAt(0),
        productImage: 'https://img.test/a.jpg',
        productUrl: `https://link.coupang.com/re/AFFSDP?pageKey=${keyword.charCodeAt(0)}`,
      }],
    }),
    createDeeplinks: async (urls) => {
      received.push(...urls);
      for (const url of urls) {
        assert.match(url, /^https:\/\/www\.coupang\.com\/vp\/products\/\d+$/);
      }
      return urls.map((url, i) => ({ originalUrl: url, shortenUrl: `https://link.coupang.com/a/s${i}?subId=clawgame` }));
    },
  }), { outDir: out, asOfDate: '2026-10-15' });

  assert.equal(received.length, 2);
  assert.equal(result.manifest.items.length, 2);
  assert.equal(result.skipped.length, 0);
});

test('buildTheme asks the search API for at most 10 results', async () => {
  const out = tempDir();
  const calls = [];
  await buildTheme('dino', deps({
    searchProducts: async (params) => {
      calls.push(params);
      return { items: [] };
    },
  }), { outDir: out, asOfDate: '2026-10-15' });

  assert.ok(calls.length > 0);
  for (const params of calls) assert.equal(params.limit, 10);
});

test('buildTheme honours excludeKeywords from the theme entry', async () => {
  const out = tempDir();
  const themes = { dino: [{ ...THEMES.dino[0], excludeKeywords: ['해골'] }] };
  const result = await buildTheme('dino', deps({
    themes,
    searchProducts: async () => ({
      items: [{
        rank: 1, productName: '해골 인형', productPrice: 25000, isRocket: true, productId: 9,
        productImage: 'https://img.test/9.jpg', productUrl: 'https://www.coupang.com/vp/products/9',
      }],
    }),
  }), { outDir: out, asOfDate: '2026-10-15' });

  assert.equal(result.manifest.items.length, 0);
  assert.equal(result.skipped[0].char, 'trex');
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

test('checkBudget counts webp thumbnails toward the theme total, like the suite does', () => {
  const result = checkBudget(
    [{ name: 'trex.glb', bytes: 1.7 * 1024 * 1024 }, { name: 'trex.webp', bytes: 200 * 1024 }],
    { perModel: 2 * 1024 * 1024, perTheme: 1.8 * 1024 * 1024 },
  );
  assert.equal(result.ok, false);
  assert.ok(result.violations.some((line) => /합계/.test(line)));
  // 300KB 한도는 모델에만 걸린다. 썸네일은 합계에만 들어간다.
  assert.ok(result.violations.every((line) => !/trex\.webp/.test(line)));
});

test('checkBudget reports the cross-theme total when it is given one', () => {
  const limits = { perModel: 300 * 1024, perTheme: 1.8 * 1024 * 1024, total: 4.8 * 1024 * 1024 };
  assert.equal(checkBudget([], { ...limits, overallBytes: 4.7 * 1024 * 1024 }).ok, true);

  const over = checkBudget([], { ...limits, overallBytes: 5 * 1024 * 1024 });
  assert.equal(over.ok, false);
  assert.ok(over.violations.some((line) => /전체 합계/.test(line)), over.violations.join(' | '));
});

test('checkBudget reports a theme over the total limit', () => {
  const files = Array.from({ length: 8 }, (_, i) => ({ name: `dino/m${i}.glb`, bytes: 290 * 1024 }));
  const result = checkBudget(files, { perModel: 300 * 1024, perTheme: 1.8 * 1024 * 1024 });
  assert.equal(result.ok, false);
  assert.ok(result.violations.some((line) => /합계/.test(line)));
});
