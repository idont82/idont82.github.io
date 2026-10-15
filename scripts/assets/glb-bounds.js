const { parseGlb } = require('./glb-optimize');

// 생성된 모델이 절차적 인형 자리에 들어갈 수 있는 비율인지 빌드 때 본다.
// gpu3d 는 항상 heightM 만 맞춰 주므로 가로·세로가 퍼진 모델도 같은 높이로 돌아온다.
// 게임은 높이를 기준으로 정규화하니, 가로가 높이의 이 배수를 넘으면 인형이 납작해 보인다.
const MAX_SPREAD_RATIO = 1.8;

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
      reason: `모델 비율 ${ratio.toFixed(2)} 가 한도 ${limit} 를 넘습니다`
        + ` (가로 ${Math.max(size.x, size.z).toFixed(3)}m / 높이 ${size.y.toFixed(3)}m).`,
    };
  }
  return { ok: true, ratio, reason: '' };
}

module.exports = { MAX_SPREAD_RATIO, checkProportion, glbBounds, spreadRatio };
