const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { MAX_SPREAD_RATIO, checkProportion, glbBounds, spreadRatio } = require('../scripts/assets/glb-bounds');
const { buildGlb } = require('../scripts/assets/glb-optimize');

const root = path.join(__dirname, '..');

// POSITION accessor 의 min/max 만 있으면 바운딩을 읽을 수 있다. BIN 은 필요 없다.
function glbWithBox({ min, max, node = {} }) {
  return buildGlb({
    json: {
      asset: { version: '2.0' },
      scene: 0,
      scenes: [{ nodes: [0] }],
      nodes: [{ mesh: 0, ...node }],
      meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
      accessors: [{ componentType: 5126, count: 2, type: 'VEC3', min, max }],
    },
    bin: Buffer.alloc(0),
  });
}

test('checkProportion rejects a sprawled box', () => {
  // 짱구 모델의 실제 수치: 가로 0.412 / 높이 0.300 / 세로 0.890 → 비율 2.97
  const bounds = { min: { x: -0.206, y: 0, z: -0.445 }, max: { x: 0.206, y: 0.3, z: 0.445 } };
  const result = checkProportion(bounds, MAX_SPREAD_RATIO);

  assert.equal(result.ok, false);
  assert.ok(Math.abs(result.ratio - 0.89 / 0.3) < 1e-9);
  assert.match(result.reason, /비율/);
  assert.match(result.reason, /2\.97/);
});

test('checkProportion accepts a normal plushie box', () => {
  // 공룡 trex 의 실제 수치: 0.309 / 0.300 / 0.188 → 비율 1.03
  const bounds = { min: { x: -0.154, y: 0, z: -0.094 }, max: { x: 0.155, y: 0.3, z: 0.094 } };
  const result = checkProportion(bounds, MAX_SPREAD_RATIO);

  assert.equal(result.ok, true);
  assert.ok(result.ratio < MAX_SPREAD_RATIO);
  assert.equal(result.reason, '');
});

test('checkProportion accepts a long-bodied dinosaur just inside the limit', () => {
  // stego 는 1.65 로 통과해야 한다. 한도를 더 좁히면 정상 모델이 떨어진다.
  const bounds = { min: { x: 0, y: 0, z: 0 }, max: { x: 0.197, y: 0.3, z: 0.495 } };
  assert.equal(checkProportion(bounds, MAX_SPREAD_RATIO).ok, true);
});

test('checkProportion treats the limit itself as passing', () => {
  const bounds = { min: { x: 0, y: 0, z: 0 }, max: { x: 0.18, y: 0.1, z: 0.1 } };
  const result = checkProportion(bounds, 1.8);
  assert.equal(result.ok, true);
  assert.ok(Math.abs(result.ratio - 1.8) < 1e-9);
});

test('checkProportion rejects unreadable or flat bounds', () => {
  assert.equal(checkProportion(null).ok, false);
  assert.equal(checkProportion({ min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 0, z: 1 } }).ok, false);
  assert.equal(checkProportion({ min: { x: 0, y: NaN, z: 0 }, max: { x: 1, y: 1, z: 1 } }).ok, false);
  assert.match(checkProportion(null).reason, /바운딩/);
});

test('spreadRatio returns null instead of dividing by a zero height', () => {
  assert.equal(spreadRatio({ min: { x: 0, y: 1, z: 0 }, max: { x: 1, y: 1, z: 1 } }), null);
  assert.equal(spreadRatio(null), null);
});

test('glbBounds reads the accessor min/max of a single mesh', () => {
  const bounds = glbBounds(glbWithBox({ min: [-1, 0, -2], max: [1, 3, 2] }));
  assert.deepEqual(bounds.min, { x: -1, y: 0, z: -2 });
  assert.deepEqual(bounds.max, { x: 1, y: 3, z: 2 });
});

test('glbBounds applies node translation and scale', () => {
  const bounds = glbBounds(glbWithBox({
    min: [-1, -1, -1],
    max: [1, 1, 1],
    node: { translation: [10, 0, 0], scale: [2, 0.5, 2] },
  }));
  assert.deepEqual(bounds.min, { x: 8, y: -0.5, z: -2 });
  assert.deepEqual(bounds.max, { x: 12, y: 0.5, z: 2 });
});

test('glbBounds applies a node rotation, turning height into depth', () => {
  // x 축 기준 90도 회전: 높이 4 가 세로로 눕는다. 회전을 무시하면 게이트가 속는다.
  const half = Math.SQRT1_2;
  const bounds = glbBounds(glbWithBox({
    min: [-1, -2, -1],
    max: [1, 2, 1],
    node: { rotation: [half, 0, 0, half] },
  }));
  assert.ok(Math.abs((bounds.max.y - bounds.min.y) - 2) < 1e-6);
  assert.ok(Math.abs((bounds.max.z - bounds.min.z) - 4) < 1e-6);
});

test('glbBounds returns null when no primitive carries min/max', () => {
  const buffer = buildGlb({
    json: {
      asset: { version: '2.0' },
      scene: 0,
      scenes: [{ nodes: [0] }],
      nodes: [{ mesh: 0 }],
      meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
      accessors: [{ componentType: 5126, count: 2, type: 'VEC3' }],
    },
    bin: Buffer.alloc(0),
  });
  assert.equal(glbBounds(buffer), null);
  assert.equal(checkProportion(glbBounds(buffer)).ok, false);
});

test('glbBounds measures a real committed model at the pipeline height', () => {
  const buffer = fs.readFileSync(path.join(root, 'assets', 'models', 'dino', 'trex.glb'));
  const bounds = glbBounds(buffer);
  const height = bounds.max.y - bounds.min.y;
  // gpu3d 는 heightM=0.3 으로 굽는다. 그래서 비율 게이트가 높이를 분모로 쓸 수 있다.
  assert.ok(Math.abs(height - 0.3) < 0.01, `높이가 0.3m 가 아니라 ${height}`);
});
