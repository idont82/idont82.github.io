const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const modulePath = pathToFileURL(path.join(__dirname, '..', 'assets', 'plushie-model-utils.js')).href;
const load = () => import(modulePath);

// 짱구(shin) 프로브를 s=1 로 잰 절차적 인형 상자. 런타임은 three.js 로 직접 재지만
// (claw-machine.js 의 proceduralPlushieBox), 숫자는 createPlushie 의 지오메트리에서 나온다:
//   x [-1.3625, +1.332] = 2.6945 (볼 ↔ 짱구 귀)
//   y [-1.60,   +2.85 ] = 4.45   (신발 밑 ↔ 앞머리 꼭대기)
//   z [-1.15,   +1.21 ] = 2.36
const PROCEDURAL_BOX = { min: { x: -1.3625, y: -1.6, z: -1.15 }, max: { x: 1.332, y: 2.85, z: 1.21 } };

// gpu3d 가 heightM=0.3 으로 구운 실제 모델 치수(tests/theme-assets-budget.test.js 가 재는 것과 같다).
const HIMAWARI = { min: { x: 0, y: 0, z: 0 }, max: { x: 0.1054, y: 0.3, z: 0.184 } };
const STEGO = { min: { x: 0, y: 0, z: 0 }, max: { x: 0.1968, y: 0.2998, z: 0.4952 } };

test('boxTarget reads the height, the wider horizontal axis, and the floor', async () => {
  const { boxTarget } = await load();
  const target = boxTarget(PROCEDURAL_BOX);

  assert.ok(Math.abs(target.height - 4.45) < 1e-9);
  // 기계 안에서 인형은 y 축으로 돌아가므로 가로는 x(2.6945) 와 z(2.36) 중 넓은 쪽이다.
  assert.ok(Math.abs(target.width - 2.6945) < 1e-9);
  assert.ok(Math.abs(target.bottomY - -1.6) < 1e-9);
});

test('boxTarget rejects a box it cannot use', async () => {
  const { boxTarget } = await load();
  assert.equal(boxTarget(null), null);
  assert.equal(boxTarget({ min: { x: 0, y: 0, z: 0 } }), null);
  // 높이 0 (평평한 상자)
  assert.equal(boxTarget({ min: { x: -1, y: 2, z: -1 }, max: { x: 1, y: 2, z: 1 } }), null);
  // 가로 0 (선 하나)
  assert.equal(boxTarget({ min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 2, z: 0 } }), null);
  assert.equal(boxTarget({ min: { x: NaN, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } }), null);
  assert.equal(boxTarget({ min: { x: -Infinity, y: 0, z: 0 }, max: { x: Infinity, y: 1, z: 1 } }), null);
});

test('modelPlacement scales the measured box by the plushie scale', async () => {
  const { modelPlacement } = await load();
  const placement = modelPlacement(0.35, PROCEDURAL_BOX);

  assert.ok(Math.abs(placement.height - 4.45 * 0.35) < 1e-9);
  assert.ok(Math.abs(placement.width - 2.6945 * 0.35) < 1e-9);
  assert.ok(Math.abs(placement.bottomY - -1.6 * 0.35) < 1e-9);

  // landY = plushieScale * 0.8 이므로 모델 바닥은 절차적 인형 바닥과 같은 월드 높이에 온다.
  const proceduralBottom = 0.35 * 0.8 + -1.6 * 0.35;
  assert.ok(Math.abs((0.35 * 0.8 + placement.bottomY) - proceduralBottom) < 1e-9);
});

test('modelPlacement returns null for a bad scale or a bad box', async () => {
  const { modelPlacement } = await load();
  assert.equal(modelPlacement(0, PROCEDURAL_BOX), null);
  assert.equal(modelPlacement(-1, PROCEDURAL_BOX), null);
  assert.equal(modelPlacement(NaN, PROCEDURAL_BOX), null);
  assert.equal(modelPlacement(undefined, PROCEDURAL_BOX), null);
  assert.equal(modelPlacement(0.35, null), null);
  assert.equal(modelPlacement(0.35, { min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 0, z: 1 } }), null);
});

test('fitTransform seats the fitted model on the box floor and centers x/z', async () => {
  const { boxTarget, fitTransform } = await load();
  const placement = boxTarget(PROCEDURAL_BOX);
  const result = fitTransform(HIMAWARI, placement);

  assert.ok(result, '짱아 모델은 상자 안에 들어가야 한다');
  // 호출자는 position = offset*scale, scale = scale 을 넣는다. 그 뒤 바닥이 상자 바닥이다.
  const bottomAfter = (result.offset.y + HIMAWARI.min.y) * result.scale;
  assert.ok(Math.abs(bottomAfter - -1.6) < 1e-9, `바닥이 -1.6 이 아니라 ${bottomAfter}`);
  // x/z 는 원점 중심이다.
  assert.ok(Math.abs((result.offset.x + (HIMAWARI.min.x + HIMAWARI.max.x) / 2)) < 1e-9);
  assert.ok(Math.abs((result.offset.z + (HIMAWARI.min.z + HIMAWARI.max.z) / 2)) < 1e-9);
});

test('fitTransform is width-limited when the model is wider than the box allows', async () => {
  const { boxTarget, fitTransform } = await load();
  const placement = boxTarget(PROCEDURAL_BOX);
  // 짱아는 z 0.184 / 높이 0.3 → 가로가 먼저 걸린다. 2.6945/0.184 < 4.45/0.3.
  const result = fitTransform(HIMAWARI, placement);

  assert.ok(Math.abs(result.scale - 2.6945 / 0.184) < 1e-9);
  assert.ok(Math.abs(result.fittedHeight - 0.3 * (2.6945 / 0.184)) < 1e-9);
  // 넓은 축이 상자 가로를 꽉 채우고 넘지는 않는다 — 유리벽을 뚫던 원인이 이것이다.
  assert.ok(Math.abs(0.184 * result.scale - 2.6945) < 1e-9);
  assert.ok(result.fittedHeight < 4.45);
});

test('fitTransform is height-limited when the model is taller than it is wide', async () => {
  const { boxTarget, fitTransform } = await load();
  const placement = boxTarget(PROCEDURAL_BOX);
  // 가로/높이 = 0.4 로 상자(0.6055)보다 홀쭉한 모델은 높이가 먼저 걸린다.
  const slim = { min: { x: -0.2, y: 0, z: -0.2 }, max: { x: 0.2, y: 1, z: 0.2 } };
  const result = fitTransform(slim, placement);

  assert.ok(Math.abs(result.scale - 4.45 / 1) < 1e-9);
  assert.ok(Math.abs(result.fittedHeight - 4.45) < 1e-9, '높이 기준이면 상자 높이를 꽉 채운다');
  assert.ok(0.4 * result.scale < 2.6945, '가로는 상자 안에 남는다');
});

test('fitTransform rejects a sprawled model so the procedural plushie stays', async () => {
  const { boxTarget, fitTransform, MIN_MODEL_HEIGHT_FRACTION } = await load();
  const placement = boxTarget(PROCEDURAL_BOX);

  // 스테고(가로 0.4952 / 높이 0.2998, 비율 1.65)는 상자 안에서 높이가 1.63s —
  // 상자 높이의 0.37 밖에 안 된다. 그런 모델은 절차적 인형이 낫다.
  assert.equal(fitTransform(STEGO, placement), null);

  // 실제로 어느 비율에서 걸리는지 숫자로 못박는다.
  const wouldBe = 0.2998 * Math.min(4.45 / 0.2998, 2.6945 / 0.4952);
  assert.ok(wouldBe / 4.45 < MIN_MODEL_HEIGHT_FRACTION);
  assert.ok(Math.abs(wouldBe / 4.45 - 0.3666) < 1e-3, `0.3666 이 아니라 ${wouldBe / 4.45}`);
});

test('fitTransform accepts a model that lands exactly on the fraction', async () => {
  const { boxTarget, fitTransform } = await load();
  const placement = boxTarget(PROCEDURAL_BOX);
  const fraction = 0.5;

  // 높이 1, 가로 = W/(f*H) 인 모델은 정확히 f*H 로 맞춰진다. 경계는 통과여야 한다.
  const width = 2.6945 / (fraction * 4.45);
  const edge = { min: { x: -width / 2, y: 0, z: -0.1 }, max: { x: width / 2, y: 1, z: 0.1 } };
  const result = fitTransform(edge, placement, { minHeightFraction: fraction });

  assert.ok(result, '경계값은 통과해야 한다');
  assert.ok(Math.abs(result.fittedHeight - fraction * 4.45) < 1e-9);
  // 조금만 더 퍼지면 떨어진다.
  const wider = { min: { x: -width * 0.51, y: 0, z: -0.1 }, max: { x: width * 0.51, y: 1, z: 0.1 } };
  assert.equal(fitTransform(wider, placement, { minHeightFraction: fraction }), null);
});

test('maxSpreadRatio is exactly the ratio fitTransform stops accepting', async () => {
  const { boxTarget, fitTransform, maxSpreadRatio, MIN_MODEL_HEIGHT_FRACTION } = await load();
  const placement = boxTarget(PROCEDURAL_BOX);
  const limit = maxSpreadRatio(placement);

  assert.ok(Math.abs(limit - 2.6945 / (4.45 * MIN_MODEL_HEIGHT_FRACTION)) < 1e-9);
  assert.ok(Math.abs(limit - 0.86501) < 1e-5, `0.865 가 아니라 ${limit}`);

  const atLimit = { min: { x: -limit / 2, y: 0, z: -0.1 }, max: { x: limit / 2, y: 1, z: 0.1 } };
  const over = { min: { x: -limit * 0.501, y: 0, z: -0.1 }, max: { x: limit * 0.501, y: 1, z: 0.1 } };
  assert.ok(fitTransform(atLimit, placement), '한도 위의 비율은 통과한다');
  assert.equal(fitTransform(over, placement), null, '한도를 넘으면 떨어진다');
});

test('maxSpreadRatio returns null for a target it cannot use', async () => {
  const { maxSpreadRatio } = await load();
  assert.equal(maxSpreadRatio(null), null);
  assert.equal(maxSpreadRatio({ width: 1, height: 0 }), null);
  assert.equal(maxSpreadRatio({ width: 0, height: 1 }), null);
  assert.equal(maxSpreadRatio({ width: NaN, height: 1 }), null);
  assert.equal(maxSpreadRatio({ width: 1, height: 1 }, 0), null);
  assert.equal(maxSpreadRatio({ width: 1, height: 1 }, NaN), null);
});

test('fitTransform returns null for a missing or malformed model box', async () => {
  const { boxTarget, fitTransform } = await load();
  const placement = boxTarget(PROCEDURAL_BOX);

  assert.equal(fitTransform(null, placement), null);
  assert.equal(fitTransform({ min: { x: 0, y: 0, z: 0 } }, placement), null);
  // 크기 0 인 상자
  assert.equal(fitTransform({ min: { x: 1, y: 1, z: 1 }, max: { x: 1, y: 1, z: 1 } }, placement), null);
  // 높이만 0
  assert.equal(fitTransform({ min: { x: 0, y: 1, z: 0 }, max: { x: 1, y: 1, z: 1 } }, placement), null);
  // 가로만 0
  assert.equal(fitTransform({ min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 1, z: 0 } }, placement), null);
  assert.equal(fitTransform({ min: { x: NaN, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } }, placement), null);
  assert.equal(
    fitTransform({ min: { x: -Infinity, y: 0, z: 0 }, max: { x: Infinity, y: 1, z: 1 } }, placement),
    null,
  );
});

test('fitTransform returns null for a subnormal box that would make scale Infinite', async () => {
  const { boxTarget, fitTransform } = await load();
  const placement = boxTarget(PROCEDURAL_BOX);
  // 5e-324 같은 비정상 수치는 0 보다 크므로 기존 가드를 통과하지만 scale 은 Infinity 가 된다.
  const tiny = Number.MIN_VALUE;
  assert.equal(
    fitTransform({ min: { x: 0, y: 0, z: 0 }, max: { x: tiny, y: tiny, z: tiny } }, placement),
    null,
  );
  // 높이만 비정상이면 scale 은 가로에서 와 유한하지만, 맞춘 높이가 0 이라 비율 가드가 잡는다.
  assert.equal(
    fitTransform({ min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: tiny, z: 1 } }, placement),
    null,
  );
});

test('fitTransform returns null for a placement it cannot use', async () => {
  const { fitTransform } = await load();
  const box = { min: { x: -1, y: 0, z: -1 }, max: { x: 1, y: 3, z: 1 } };

  assert.equal(fitTransform(box, null), null);
  assert.equal(fitTransform(box, { height: 0, width: 1, bottomY: 0 }), null);
  assert.equal(fitTransform(box, { height: 1, width: 0, bottomY: 0 }), null);
  assert.equal(fitTransform(box, { height: NaN, width: 1, bottomY: 0 }), null);
  assert.equal(fitTransform(box, { height: 1, width: Infinity, bottomY: 0 }), null);
  assert.equal(fitTransform(box, { height: 1, width: 1, bottomY: NaN }), null);
  assert.equal(fitTransform(box, { height: 1, width: 1, bottomY: Infinity }), null);
  assert.equal(fitTransform(box, { height: 3, width: 2, bottomY: 0 }, { minHeightFraction: NaN }), null);
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
