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

// ── swapPlushieMesh: three.js 없이 Box3/Group 규약만 흉내낸다 ──
function fakeTHREE() {
  class Box3 {
    setFromObject(object) {
      const box = object && object.__box;
      this.min = box ? { ...box.min } : { x: 0, y: 0, z: 0 };
      this.max = box ? { ...box.max } : { x: 0, y: 0, z: 0 };
      this.__empty = !box;
      return this;
    }

    isEmpty() { return this.__empty; }
  }

  class Group {
    constructor() {
      this.children = [];
      this.position = { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } };
      this.scale = { value: 1, setScalar(v) { this.value = v; } };
    }

    add(child) { this.children.push(child); }

    remove(child) {
      const at = this.children.indexOf(child);
      if (at >= 0) this.children.splice(at, 1);
    }

    traverse(fn) {
      fn(this);
      for (const child of this.children) {
        if (child.traverse) child.traverse(fn);
        else fn(child);
      }
    }
  }

  return { Box3, Group };
}

function fakeModel(box, stats = { clones: 0 }) {
  const node = {
    __box: box,
    stats,
    position: { x: 0, y: 0, z: 0, set(x, y, z) { this.x = x; this.y = y; this.z = z; } },
    scale: { value: 1, setScalar(v) { this.value = v; } },
  };
  node.clone = () => { stats.clones += 1; return fakeModel(box, stats); };
  return node;
}

// 짱구 프로브(s=1) 를 plushieScale 0.35 로 잰 목표 상자.
const PLACEMENT = { height: 4.45 * 0.35, width: 2.6945 * 0.35, bottomY: -1.6 * 0.35 };
const HIMAWARI = { min: { x: 0, y: 0, z: 0 }, max: { x: 0.1054, y: 0.3, z: 0.184 } };
const STEGO = { min: { x: 0, y: 0, z: 0 }, max: { x: 0.1968, y: 0.2998, z: 0.4952 } };

function proceduralGroup(THREE, disposed) {
  const group = new THREE.Group();
  const mesh = {
    geometry: { dispose() { disposed.push('geometry'); } },
    material: { dispose() { disposed.push('material'); } },
    traverse(fn) { fn(this); },
  };
  group.add(mesh);
  group.userData = { char: 'himawari', radius: 0.42, grabbed: false };
  return { group, mesh };
}

test('swapPlushieMesh fits the model into the box and stands it on the box floor', async () => {
  const { swapPlushieMesh } = await load();
  const THREE = fakeTHREE();
  const disposed = [];
  const { group, mesh } = proceduralGroup(THREE, disposed);
  const prototype = fakeModel(HIMAWARI);

  assert.equal(swapPlushieMesh(THREE, group, prototype, PLACEMENT), true);

  // 절차적 메시는 떨어져 나가고 자원도 돌려준다.
  assert.ok(!group.children.includes(mesh));
  assert.deepEqual(disposed, ['geometry', 'material']);
  assert.equal(group.children.length, 1);

  const clone = group.children[0].children[0];
  const expectedScale = PLACEMENT.width / 0.184; // 가로가 먼저 걸린다
  assert.ok(Math.abs(clone.scale.value - expectedScale) < 1e-9);

  // 바닥이 상자 바닥에 앉는다 — 절차적 인형과 같은 발높이.
  const bottom = clone.position.y + HIMAWARI.min.y * clone.scale.value;
  assert.ok(Math.abs(bottom - PLACEMENT.bottomY) < 1e-9, `바닥이 ${PLACEMENT.bottomY} 가 아니라 ${bottom}`);
  // 가로는 상자를 넘지 않는다.
  assert.ok(Math.abs(0.184 * clone.scale.value - PLACEMENT.width) < 1e-9);
  // userData 는 호출자 것으로 남는다(물리와 수집함이 읽는다).
  assert.equal(group.userData.radius, 0.42);
});

test('swapPlushieMesh leaves the procedural mesh alone when the model fits too small', async () => {
  const { swapPlushieMesh } = await load();
  const THREE = fakeTHREE();
  const disposed = [];
  const { group, mesh } = proceduralGroup(THREE, disposed);
  const prototype = fakeModel(STEGO);

  assert.equal(swapPlushieMesh(THREE, group, prototype, PLACEMENT), false);
  assert.deepEqual(group.children, [mesh], '절차적 메시가 그대로 남아야 한다');
  assert.deepEqual(disposed, [], '절차적 지오메트리를 버리면 인형이 사라진다');
  assert.equal(prototype.stats.clones, 0, '거절될 모델은 복제하지 않는다');
});

test('swapPlushieMesh returns false instead of touching the group on bad input', async () => {
  const { swapPlushieMesh } = await load();
  const THREE = fakeTHREE();
  const disposed = [];
  const { group, mesh } = proceduralGroup(THREE, disposed);

  assert.equal(swapPlushieMesh(THREE, null, fakeModel(HIMAWARI), PLACEMENT), false);
  assert.equal(swapPlushieMesh(THREE, group, null, PLACEMENT), false);
  assert.equal(swapPlushieMesh(THREE, group, fakeModel(HIMAWARI), null), false);
  // 지오메트리가 없는 모델은 빈 상자를 주고, 그러면 교체하지 않는다.
  assert.equal(swapPlushieMesh(THREE, group, fakeModel(null), PLACEMENT), false);
  assert.deepEqual(group.children, [mesh]);
  assert.deepEqual(disposed, []);
});

test('measureBox copies the Box3 and reports an empty object as null', async () => {
  const { measureBox } = await load();
  const THREE = fakeTHREE();

  assert.deepEqual(measureBox(THREE, fakeModel(HIMAWARI)), { min: HIMAWARI.min, max: HIMAWARI.max });
  assert.equal(measureBox(THREE, fakeModel(null)), null);
  assert.equal(measureBox(THREE, null), null);
});
