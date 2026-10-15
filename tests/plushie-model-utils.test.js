const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const modulePath = pathToFileURL(path.join(__dirname, '..', 'assets', 'plushie-model-utils.js')).href;
const load = () => import(modulePath);

test('normalizeTransform scales the longest axis to the target diameter', async () => {
  const { normalizeTransform } = await load();
  const result = normalizeTransform({ min: { x: -1, y: 0, z: -0.5 }, max: { x: 1, y: 4, z: 0.5 } }, 0.84);
  assert.ok(Math.abs(result.scale - 0.21) < 1e-9);
});

test('normalizeTransform centers the model on the origin', async () => {
  const { normalizeTransform } = await load();
  const result = normalizeTransform({ min: { x: 0, y: 0, z: 0 }, max: { x: 2, y: 2, z: 2 } }, 1);
  assert.deepEqual(result.offset, { x: -1, y: -1, z: -1 });
  assert.equal(result.scale, 0.5);
});

test('normalizeTransform returns null for a zero-size box', async () => {
  const { normalizeTransform } = await load();
  assert.equal(normalizeTransform({ min: { x: 1, y: 1, z: 1 }, max: { x: 1, y: 1, z: 1 } }, 0.84), null);
});

test('normalizeTransform returns null for NaN bounds', async () => {
  const { normalizeTransform } = await load();
  assert.equal(normalizeTransform({ min: { x: NaN, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } }, 0.84), null);
});

test('normalizeTransform returns null for Infinite bounds', async () => {
  const { normalizeTransform } = await load();
  assert.equal(
    normalizeTransform({ min: { x: -Infinity, y: 0, z: 0 }, max: { x: Infinity, y: 1, z: 1 } }, 0.84),
    null,
  );
});

test('normalizeTransform returns null for a missing box', async () => {
  const { normalizeTransform } = await load();
  assert.equal(normalizeTransform(null, 0.84), null);
});

test('normalizeTransform returns null for a non-positive target', async () => {
  const { normalizeTransform } = await load();
  assert.equal(normalizeTransform({ min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } }, 0), null);
});

test('normalizeTransform returns null for a subnormal box that would make scale Infinite', async () => {
  const { normalizeTransform } = await load();
  // 5e-324 같은 비정상 수치는 0 보다 크므로 기존 가드를 통과하지만 scale 은 Infinity 가 된다.
  const tiny = Number.MIN_VALUE;
  assert.equal(
    normalizeTransform({ min: { x: 0, y: 0, z: 0 }, max: { x: tiny, y: tiny, z: tiny } }, 0.84),
    null,
  );
  assert.equal(
    normalizeTransform({ min: { x: 0, y: 0, z: 0 }, max: { x: tiny, y: tiny, z: tiny } }, 0.84, { axis: 'height' }),
    null,
  );
});

test("normalizeTransform with axis 'height' scales the y axis, not the longest one", async () => {
  const { normalizeTransform } = await load();
  // 짱구 모델처럼 z 로 퍼진 상자: 가장 긴 축은 z(0.89) 지만 높이(0.3)를 기준으로 맞춘다.
  const box = { min: { x: -0.206, y: 0, z: -0.445 }, max: { x: 0.206, y: 0.3, z: 0.445 } };
  const longest = normalizeTransform(box, 2.4);
  const height = normalizeTransform(box, 2.4, { axis: 'height' });

  assert.ok(Math.abs(longest.scale - 2.4 / 0.89) < 1e-9);
  assert.ok(Math.abs(height.scale - 2.4 / 0.3) < 1e-9);
  // 높이 기준이면 스케일 적용 뒤 높이가 정확히 목표값이 된다.
  assert.ok(Math.abs((box.max.y - box.min.y) * height.scale - 2.4) < 1e-9);
});

test('normalizeTransform seats the model bottom on bottomY instead of centering it', async () => {
  const { normalizeTransform } = await load();
  const box = { min: { x: -1, y: 2, z: -1 }, max: { x: 1, y: 5, z: 1 } };
  const result = normalizeTransform(box, 3, { axis: 'height', bottomY: -1 });

  assert.equal(result.scale, 1);
  // 호출자는 offset * scale 을 position 에 넣는다. 그 뒤 바닥이 bottomY 에 와야 한다.
  const bottomAfter = result.offset.y * result.scale + box.min.y * result.scale;
  assert.ok(Math.abs(bottomAfter - -1) < 1e-9);
  // x/z 는 여전히 원점 중심이다.
  assert.ok(Math.abs(result.offset.x) < 1e-9);
  assert.ok(Math.abs(result.offset.z) < 1e-9);
});

test('normalizeTransform keeps bottomY correct when a scale is applied', async () => {
  const { normalizeTransform } = await load();
  const box = { min: { x: -2, y: -1, z: -2 }, max: { x: 2, y: 2, z: 2 } };
  const result = normalizeTransform(box, 0.6, { axis: 'height', bottomY: -0.35 });

  assert.ok(Math.abs(result.scale - 0.2) < 1e-9);
  const bottomAfter = (result.offset.y + box.min.y) * result.scale;
  assert.ok(Math.abs(bottomAfter - -0.35) < 1e-9, `바닥이 -0.35 가 아니라 ${bottomAfter}`);
});

test('normalizeTransform returns null for a non-finite bottomY', async () => {
  const { normalizeTransform } = await load();
  const box = { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } };
  assert.equal(normalizeTransform(box, 1, { bottomY: NaN }), null);
  assert.equal(normalizeTransform(box, 1, { bottomY: Infinity }), null);
});

test('modelPlacement derives height and bottom from the procedural plushie bounds', async () => {
  const { modelPlacement, PROCEDURAL_PLUSHIE_BOUNDS } = await load();
  const { bottom, top } = PROCEDURAL_PLUSHIE_BOUNDS;
  assert.ok(bottom < 0 && top > 0);

  const placement = modelPlacement(0.35);
  assert.ok(Math.abs(placement.height - (top - bottom) * 0.35) < 1e-9);
  assert.ok(Math.abs(placement.bottomY - bottom * 0.35) < 1e-9);

  // landY = plushieScale * 0.8 이므로 모델 바닥은 절차적 인형과 같은 월드 높이에 온다.
  assert.ok(Math.abs((0.35 * 0.8 + placement.bottomY) - -0.07) < 1e-9);
});

test('modelPlacement returns null for a bad scale', async () => {
  const { modelPlacement } = await load();
  assert.equal(modelPlacement(0), null);
  assert.equal(modelPlacement(-1), null);
  assert.equal(modelPlacement(NaN), null);
  assert.equal(modelPlacement(undefined), null);
});

test('url helpers point at the committed asset paths', async () => {
  const { manifestUrl, modelUrl, thumbnailUrl } = await load();
  assert.equal(manifestUrl('dino'), 'assets/models/dino/manifest.json');
  assert.equal(modelUrl('dino', { model: 'trex.glb' }), 'assets/models/dino/trex.glb');
  assert.equal(thumbnailUrl('dino', { thumbnail: 'trex.webp' }), 'assets/models/dino/trex.webp');
});

test('findEntry locates a character and returns null when absent', async () => {
  const { findEntry } = await load();
  const manifest = { theme: 'dino', items: [{ char: 'trex' }, { char: 'stego' }] };
  assert.equal(findEntry(manifest, 'stego').char, 'stego');
  assert.equal(findEntry(manifest, 'ptera'), null);
  assert.equal(findEntry(null, 'trex'), null);
});

test('isUsableManifest rejects malformed payloads', async () => {
  const { isUsableManifest } = await load();
  assert.equal(isUsableManifest({ theme: 'dino', items: [] }), true);
  assert.equal(isUsableManifest({ theme: 'dino' }), false);
  assert.equal(isUsableManifest({ items: [] }), false);
  assert.equal(isUsableManifest('not json'), false);
  assert.equal(isUsableManifest(null), false);
});
