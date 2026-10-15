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
    { char: 'trex', name: '티라노', thumbnail: 'trex.webp', link: 'https://link.coupang.com/a/1?subId=clawgame' },
    { char: 'stego', name: '스테고', thumbnail: 'stego.webp', link: 'https://link.coupang.com/a/2?subId=clawgame' },
  ],
};

function okFetch(manifest = MANIFEST) {
  return async () => ({ ok: true, status: 200, json: async () => manifest });
}

test('load fetches the manifest and nothing else', async () => {
  const { createThemeLoader } = await load();
  const seen = [];
  const loader = createThemeLoader({
    fetchImpl: async (url) => {
      seen.push(url);
      return { ok: true, status: 200, json: async () => MANIFEST };
    },
  });

  const result = await loader.load('dino');
  assert.equal(result.theme, 'dino');
  assert.deepEqual(result.manifest, MANIFEST);
  // 모델은 더 이상 내려받지 않는다. 요청은 매니페스트 하나뿐이어야 한다.
  assert.deepEqual(seen, ['assets/models/dino/manifest.json']);
  assert.equal(result.models, undefined);
});

test('load returns null when the manifest request fails', async () => {
  const { createThemeLoader } = await load();
  const errors = [];
  const loader = createThemeLoader({
    fetchImpl: async () => ({ ok: false, status: 404, json: async () => ({}) }),
    onError: (error) => errors.push(error),
  });

  assert.equal(await loader.load('dino'), null);
  assert.equal(errors.length, 1);
});

test('load returns null when fetch itself throws (offline)', async () => {
  const { createThemeLoader } = await load();
  const loader = createThemeLoader({
    fetchImpl: async () => { throw new TypeError('Failed to fetch'); },
  });
  assert.equal(await loader.load('dino'), null);
});

test('load returns null for a malformed manifest', async () => {
  const { createThemeLoader } = await load();
  const errors = [];
  const loader = createThemeLoader({
    fetchImpl: okFetch({ nope: true }),
    onError: (error) => errors.push(error),
  });
  assert.equal(await loader.load('dino'), null);
  assert.match(errors[0].message, /형식이 올바르지 않습니다/);
});

test('an empty item list is still a usable manifest', async () => {
  // 비어 있으면 카드가 안 뜨고 게임은 그대로 돈다 — 404 와 같은 결과다.
  const { createThemeLoader } = await load();
  const loader = createThemeLoader({ fetchImpl: okFetch({ theme: 'dino', items: [] }) });
  const result = await loader.load('dino');
  assert.deepEqual(result.manifest.items, []);
});

test('a stale theme load resolves to null after a newer load starts', async () => {
  const { createThemeLoader } = await load();
  let releaseDino;
  const gate = new Promise((resolve) => { releaseDino = resolve; });

  const loader = createThemeLoader({
    fetchImpl: async (url) => {
      if (url.includes('/dino/')) await gate;
      return {
        ok: true,
        status: 200,
        json: async () => (url.includes('/dino/') ? MANIFEST : { ...MANIFEST, theme: 'loopy', items: [] }),
      };
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
  const loader = createThemeLoader({ fetchImpl: okFetch() });
  assert.equal(loader.current(), null);
  await loader.load('dino');
  assert.equal(loader.current(), 'dino');
});
