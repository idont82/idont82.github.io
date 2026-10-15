const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const modulePath = pathToFileURL(path.join(__dirname, '..', 'assets', 'plushie-three.js')).href;
const load = () => import(modulePath);

// three/addons 의 GLTFLoader 를 흉내낸다. load(url, onLoad, onProgress, onError) 규약만 쓴다.
function fakeLoaderModule({ fail = false, onNew = () => {} } = {}) {
  return {
    GLTFLoader: class {
      constructor() { onNew(); }

      load(url, onLoad, _onProgress, onError) {
        if (fail) onError(new Error(`404 ${url}`));
        else onLoad({ scene: { url } });
      }
    },
  };
}

test('createModelLoader does not touch the addons module until the first load', async () => {
  const { createModelLoader } = await load();
  let imports = 0;
  createModelLoader({}, async () => { imports += 1; return fakeLoaderModule(); });

  assert.equal(imports, 0, '모델이 없는 테마에서는 addons 를 내려받지 않아야 한다');
});

test('createModelLoader imports the addons module once and reuses the loader', async () => {
  const { createModelLoader } = await load();
  let imports = 0;
  let constructed = 0;
  const loadModel = createModelLoader({}, async () => {
    imports += 1;
    return fakeLoaderModule({ onNew: () => { constructed += 1; } });
  });

  const [a, b] = await Promise.all([loadModel('a.glb'), loadModel('b.glb')]);
  await loadModel('c.glb');

  assert.deepEqual(a, { url: 'a.glb' });
  assert.deepEqual(b, { url: 'b.glb' });
  assert.equal(imports, 1);
  assert.equal(constructed, 1);
});

test('a failed addons import rejects the load instead of breaking the module', async () => {
  const { createModelLoader } = await load();
  let imports = 0;
  const loadModel = createModelLoader({}, async () => {
    imports += 1;
    throw new TypeError('Failed to fetch dynamically imported module');
  });

  await assert.rejects(() => loadModel('trex.glb'), /Failed to fetch/);
  // 두 번째 호출도 거부되고, 죽은 CDN 을 매 모델마다 다시 때리지 않는다.
  await assert.rejects(() => loadModel('stego.glb'), /Failed to fetch/);
  assert.equal(imports, 1);
});

test('a synchronous throw from the import callback still becomes a rejection', async () => {
  const { createModelLoader } = await load();
  const loadModel = createModelLoader({}, () => { throw new Error('importmap 누락'); });
  await assert.rejects(() => loadModel('trex.glb'), /importmap 누락/);
});

test('a per-model GLTF error rejects that model only', async () => {
  const { createModelLoader } = await load();
  const loadModel = createModelLoader({}, async () => fakeLoaderModule({ fail: true }));
  await assert.rejects(() => loadModel('trex.glb'), /404 trex\.glb/);
});

test('a rejected model load leaves the theme loader on procedural plushies', async () => {
  const { createModelLoader } = await load();
  const loaderModule = pathToFileURL(path.join(__dirname, '..', 'assets', 'plushie-loader.js')).href;
  const { createThemeLoader } = await import(loaderModule);

  const errors = [];
  const themeLoader = createThemeLoader({
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      json: async () => ({ theme: 'dino', items: [{ char: 'trex', model: 'trex.glb' }] }),
    }),
    loadModel: createModelLoader({}, async () => { throw new TypeError('Failed to fetch'); }),
    onError: (error) => errors.push(error),
  });

  const result = await themeLoader.load('dino');
  assert.equal(result.models.size, 0, '모델이 하나도 안 붙어야 절차적 인형이 남는다');
  assert.equal(errors.length, 1);
});
