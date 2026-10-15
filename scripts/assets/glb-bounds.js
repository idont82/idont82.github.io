const { parseGlb } = require('./glb-optimize');

// 생성된 모델이 절차적 인형 자리에 들어갈 수 있는 비율인지 빌드 때 본다.
// gpu3d 는 항상 heightM 만 맞춰 주므로 가로·세로가 퍼진 모델도 같은 높이로 돌아온다.
//
// 런타임은 절차적 인형(createPlushie)을 three.js Box3 로 직접 재서 그 상자에 모델을
// 비율 그대로 끼운다(assets/plushie-model-utils.js 의 fitTransform). node 에는 three 가
// 없으므로(의존성 없음) 빌드 게이트는 그 상자의 실측치를 적어 두고 비율만 비교한다.
// 짱구(shin) 프로브를 s=1 로 잰 값 — createPlushie 의 지오메트리에서 그대로 나온다:
//   x [-1.3625, +1.332] = 2.6945 (볼 ↔ 짱구 귀)
//   y [-1.60,   +2.85 ] = 4.45   (신발 밑 -1.45-0.15 ↔ 앞머리 꼭대기 1.6+0.2+1.05)
//   z [-1.15,   +1.21 ] = 2.36
// 가로는 기계 안 무작위 회전 때문에 x/z 중 넓은 쪽 하나로 본다 → 2.6945.
const PROCEDURAL_PLUSHIE_BOX = { width: 2.6945, height: 4.45 };

// assets/plushie-model-utils.js 의 MIN_MODEL_HEIGHT_FRACTION 과 같은 값이어야 한다
// (tests/glb-bounds.test.js 가 두 파일을 맞춰 본다).
const MIN_MODEL_HEIGHT_FRACTION = 0.7;

// 상자에 맞춘 높이는 min(H, W/r) 이므로 min(H, W/r) >= f*H ⟺ r <= W/(f*H).
// 즉 런타임이 받아 줄 비율 상한이 그대로 게이트 한도다 — 2.6945/(4.45*0.7) = 0.865.
// 이 선을 넘는 모델은 구워도 런타임이 거절하니 애초에 만들지 않는다.
const MAX_SPREAD_RATIO = PROCEDURAL_PLUSHIE_BOX.width
  / (PROCEDURAL_PLUSHIE_BOX.height * MIN_MODEL_HEIGHT_FRACTION);

const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

// 열 우선(column-major) 4x4. a 를 나중에, b 를 먼저 적용한다.
function multiply(a, b) {
  const out = new Array(16).fill(0);
  for (let col = 0; col < 4; col += 1) {
    for (let row = 0; row < 4; row += 1) {
      let sum = 0;
      for (let k = 0; k < 4; k += 1) sum += a[k * 4 + row] * b[col * 4 + k];
      out[col * 4 + row] = sum;
    }
  }
  return out;
}

function composeTrs(node) {
  const [tx, ty, tz] = node.translation || [0, 0, 0];
  const [qx, qy, qz, qw] = node.rotation || [0, 0, 0, 1];
  const [sx, sy, sz] = node.scale || [1, 1, 1];

  const x2 = qx + qx;
  const y2 = qy + qy;
  const z2 = qz + qz;
  const xx = qx * x2;
  const xy = qx * y2;
  const xz = qx * z2;
  const yy = qy * y2;
  const yz = qy * z2;
  const zz = qz * z2;
  const wx = qw * x2;
  const wy = qw * y2;
  const wz = qw * z2;

  return [
    (1 - (yy + zz)) * sx, (xy + wz) * sx, (xz - wy) * sx, 0,
    (xy - wz) * sy, (1 - (xx + zz)) * sy, (yz + wx) * sy, 0,
    (xz + wy) * sz, (yz - wx) * sz, (1 - (xx + yy)) * sz, 0,
    tx, ty, tz, 1,
  ];
}

function localMatrix(node) {
  if (Array.isArray(node.matrix) && node.matrix.length === 16) return node.matrix.slice();
  return composeTrs(node);
}

function applyMatrix(m, x, y, z) {
  return [
    m[0] * x + m[4] * y + m[8] * z + m[12],
    m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14],
  ];
}

function finite(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

// glTF 2.0 은 POSITION accessor 에 min/max 를 필수로 요구하므로 정점 버퍼를 풀 필요가 없다.
function primitiveBox(json, primitive) {
  const index = primitive && primitive.attributes && primitive.attributes.POSITION;
  if (typeof index !== 'number') return null;
  const accessor = (json.accessors || [])[index];
  if (!accessor || !Array.isArray(accessor.min) || !Array.isArray(accessor.max)) return null;
  if (accessor.min.length < 3 || accessor.max.length < 3) return null;
  if (![...accessor.min.slice(0, 3), ...accessor.max.slice(0, 3)].every(finite)) return null;
  return { min: accessor.min.slice(0, 3), max: accessor.max.slice(0, 3) };
}

// GLB 의 노드 변환을 적용한 월드 AABB. three.js 없이 glTF JSON 만 읽는다.
function glbBounds(buffer) {
  const { json } = parseGlb(buffer);
  const nodes = json.nodes || [];
  const scene = (json.scenes || [])[typeof json.scene === 'number' ? json.scene : 0];
  const roots = scene && Array.isArray(scene.nodes) ? scene.nodes : nodes.map((_, i) => i);

  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  let found = false;

  const visited = new Set();
  const walk = (index, parentMatrix) => {
    const node = nodes[index];
    if (!node || visited.has(index)) return;
    visited.add(index);

    const world = multiply(parentMatrix, localMatrix(node));
    const mesh = typeof node.mesh === 'number' ? (json.meshes || [])[node.mesh] : null;

    for (const primitive of (mesh && mesh.primitives) || []) {
      const box = primitiveBox(json, primitive);
      if (!box) continue;
      for (let corner = 0; corner < 8; corner += 1) {
        const point = applyMatrix(
          world,
          corner & 1 ? box.max[0] : box.min[0],
          corner & 2 ? box.max[1] : box.min[1],
          corner & 4 ? box.max[2] : box.min[2],
        );
        for (let axis = 0; axis < 3; axis += 1) {
          if (point[axis] < min[axis]) min[axis] = point[axis];
          if (point[axis] > max[axis]) max[axis] = point[axis];
        }
      }
      found = true;
    }

    for (const child of node.children || []) walk(child, world);
  };

  for (const root of roots) walk(root, IDENTITY);
  if (!found) return null;

  return {
    min: { x: min[0], y: min[1], z: min[2] },
    max: { x: max[0], y: max[1], z: max[2] },
  };
}

// 바닥 지름(가로·세로 중 큰 쪽) 대비 높이 비율. 1 보다 크면 높이보다 넓다.
function spreadRatio(bounds) {
  if (!bounds || !bounds.min || !bounds.max) return null;
  const size = {
    x: bounds.max.x - bounds.min.x,
    y: bounds.max.y - bounds.min.y,
    z: bounds.max.z - bounds.min.z,
  };
  if (![size.x, size.y, size.z].every(finite)) return null;
  if (size.y <= 0) return null;
  return { ratio: Math.max(size.x, size.z) / size.y, size };
}

// 비율 게이트. 높이 정규화와 짝이다: 통과한 모델만 절차적 인형 자리에 들어간다.
function checkProportion(bounds, limit = MAX_SPREAD_RATIO) {
  const measured = spreadRatio(bounds);
  if (!measured) {
    return { ok: false, ratio: null, reason: '모델 바운딩 박스를 읽을 수 없습니다.' };
  }
  const { ratio, size } = measured;
  if (ratio > limit) {
    return {
      ok: false,
      ratio,
      reason: `모델 비율 ${ratio.toFixed(2)} 가 한도 ${limit.toFixed(2)} 를 넘습니다`
        + ` (가로 ${Math.max(size.x, size.z).toFixed(3)}m / 높이 ${size.y.toFixed(3)}m)`
        + ` — 절차적 인형 상자 안에서 키가 ${(100 * Math.min(1, (PROCEDURAL_PLUSHIE_BOX.width
          / PROCEDURAL_PLUSHIE_BOX.height) / ratio)).toFixed(0)}% 로 줄어듭니다.`,
    };
  }
  return { ok: true, ratio, reason: '' };
}

module.exports = {
  MAX_SPREAD_RATIO,
  MIN_MODEL_HEIGHT_FRACTION,
  PROCEDURAL_PLUSHIE_BOX,
  checkProportion,
  glbBounds,
  spreadRatio,
};
