const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const modulePath = pathToFileURL(path.join(__dirname, '..', 'assets', 'plushie-loader.js')).href;
const load = () => import(modulePath);

const MANIFEST = {
  theme: 'dino',
  asOfDate: '2026-10-15',
  items: [
    { char: 'trex', name: '티라노', model: 'trex.glb', thumbnail: 'trex.webp', link: 'https://link.coupang.com/a/1?subId=clawgame' },
    { char: 'stego', name: '스테고', model: 'stego.glb', thumbnail: 'stego.webp', link: 'https://link.coupang.com/a/2?subId=clawgame' },
  ],
};

function okFetch(manifest = MANIFEST) {
  return async () => ({ ok: true, status: 200, json: async () => manifest });
}

test('load returns the manifest and one model per item', async () => {
  const { createThemeLoader } = await load();
  const seen = [];
  const loader = createThemeLoader({
    fetchImpl: okFetch(),
    loadModel: async (url) => { seen.push(url); return { url }; },
  });

  const result = await loader.load('dino');
  assert.equal(result.theme, 'dino');
  assert.equal(result.models.size, 2);
  assert.deepEqual(result.models.get('trex'), { url: 'assets/models/dino/trex.glb' });
  assert.deepEqual(seen, ['assets/models/dino/trex.glb', 'assets/models/dino/stego.glb']);
});

test('load returns null when the manifest request fails', async () => {
  const { createThemeLoader } = await load();
  const errors = [];
  const loader = createThemeLoader({
    fetchImpl: async () => ({ ok: false, status: 404, json: async () => ({}) }),
    loadModel: async () => { throw new Error('호출되면 안 됨'); },
    onError: (error) => errors.push(error),
  });

  assert.equal(await loader.load('dino'), null);
  assert.equal(errors.length, 1);
});

test('load returns null when fetch itself throws (offline)', async () => {
  const { createThemeLoader } = await load();
  const loader = createThemeLoader({
    fetchImpl: async () => { throw new TypeError('Failed to fetch'); },
    loadModel: async () => ({}),
  });
  assert.equal(await loader.load('dino'), null);
});

test('load returns null for a malformed manifest', async () => {
  const { createThemeLoader } = await load();
  const loader = createThemeLoader({
    fetchImpl: okFetch({ nope: true }),
    loadModel: async () => ({}),
  });
  assert.equal(await loader.load('dino'), null);
});

test('load keeps the models that succeeded when one model fails', async () => {
  const { createThemeLoader } = await load();
  const loader = createThemeLoader({
    fetchImpl: okFetch(),
    loadModel: async (url) => {
      if (url.endsWith('stego.glb')) throw new Error('500');
      return { url };
    },
  });

  const result = await loader.load('dino');
  assert.equal(result.models.size, 1);
  assert.ok(result.models.has('trex'));
  assert.ok(!result.models.has('stego'));
});

test('a stale theme load resolves to null after a newer load starts', async () => {
  const { createThemeLoader } = await load();
  let releaseDino;
  const gate = new Promise((resolve) => { releaseDino = resolve; });

  const loader = createThemeLoader({
    fetchImpl: async (url) => ({
      ok: true,
      status: 200,
      json: async () => (url.includes('/dino/') ? MANIFEST : { ...MANIFEST, theme: 'loopy', items: [] }),
    }),
    loadModel: async (url) => {
      if (url.includes('/dino/')) await gate;
      return { url };
    },
  });

  const slow = loader.load('dino');
  const fast = await loader.load('loopy');
  releaseDino();

  assert.equal(await slow, null, '늦게 끝난 이전 테마는 버려져야 한다');
  assert.equal(fast.theme, 'loopy');
  assert.equal(loader.current(), 'loopy');
});

test('current reports the active theme', async () => {
  const { createThemeLoader } = await load();
  const loader = createThemeLoader({ fetchImpl: okFetch(), loadModel: async () => ({}) });
  assert.equal(loader.current(), null);
  await loader.load('dino');
  assert.equal(loader.current(), 'dino');
});
