// three.js 에 기대지 않는 순수 함수만 둔다. Node 테스트와 브라우저가 같은 파일을 읽는다.

const MODEL_ROOT = 'assets/models';

function finite(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

// 상자에 넣어 본 모델의 높이가 절차적 인형 높이의 이 비율보다 낮으면 모델을 버리고
// 절차적 인형을 그대로 둔다. 모델은 사진에서 구운 인형이라 대체로 키보다 넓고,
// 절차적 인형의 상자는 서 있는 사람 모양이라 세로로 길다(가로/높이 ≈ 0.61).
// 그래서 퍼진 모델은 상자 안에서 가로가 먼저 걸려 키가 확 줄어든다.
//
// 0.7 의 근거: 집게는 내려오다 clawTipY < p.position.y + radius*1.1 = y + 1.32s 에서
// 멈춘다(claw-machine.js). 모델 바닥은 상자 바닥(≈ -1.60s)에 앉으므로, 높이가
// 2.92s(= 상자 높이 4.45s 의 0.656)보다 낮으면 집게가 인형 윗면에 닿기도 전에
// 허공에서 멈춘다 — 사용자가 말한 "잘 안 잡히는" 느낌이 바로 그것이다.
// 0.7 은 그 한계선에 약간의 여유를 둔 값이다.
export const MIN_MODEL_HEIGHT_FRACTION = 0.7;

// 절차적 인형을 three.js Box3 로 실측한 상자(단위 s = plushieScale)를 목표 치수로 바꾼다.
// 여기에 숫자를 적어 두지 않는다 — 절차적 조형이 바뀌면 적어 둔 숫자만 조용히 틀어진다.
export function boxTarget(box) {
  if (!box || !box.min || !box.max) return null;

  const { min, max } = box;
  const coords = [min.x, min.y, min.z, max.x, max.y, max.z];
  if (!coords.every(finite)) return null;

  const height = max.y - min.y;
  // 기계 안에서 인형은 y 축으로 무작위 회전하므로 가로는 x/z 중 넓은 쪽 하나로 본다.
  const width = Math.max(max.x - min.x, max.z - min.z);
  if (!finite(height) || height <= 0) return null;
  if (!finite(width) || width <= 0) return null;

  return { height, width, bottomY: min.y };
}

// s 와 실측 상자를 받아 swapPlushieMesh 에 넘길 목표 상자를 만든다.
export function modelPlacement(s, box) {
  if (!finite(s) || s <= 0) return null;
  const target = boxTarget(box);
  if (!target) return null;
  return { height: target.height * s, width: target.width * s, bottomY: target.bottomY * s };
}

// 모델을 목표 상자 안에 비율 그대로 넣는다(늘이지 않는다). 높이와 가로 중 먼저 걸리는
// 쪽이 배율을 정하고, 바닥은 상자 바닥에 앉혀 절차적 인형과 같은 발높이를 쓴다.
// 맞춰 본 높이가 상자 높이의 minHeightFraction 보다 낮으면 null 을 돌려줘
// 호출자가 절차적 인형을 그대로 두게 한다.
export function fitTransform(box, placement, { minHeightFraction = MIN_MODEL_HEIGHT_FRACTION } = {}) {
  if (!box || !box.min || !box.max || !placement) return null;

  const { height, width, bottomY } = placement;
  if (!finite(height) || height <= 0) return null;
  if (!finite(width) || width <= 0) return null;
  if (!finite(bottomY)) return null;
  if (!finite(minHeightFraction) || minHeightFraction < 0) return null;

  const { min, max } = box;
  const coords = [min.x, min.y, min.z, max.x, max.y, max.z];
  if (!coords.every(finite)) return null;

  const size = { x: max.x - min.x, y: max.y - min.y, z: max.z - min.z };
  const spread = Math.max(size.x, size.z);
  if (!finite(size.y) || size.y <= 0) return null;
  if (!finite(spread) || spread <= 0) return null;

  // 비정상적으로 작은 바운딩 박스는 scale 을 Infinity 로 만든다.
  // setScalar(Infinity) 는 행렬을 망가뜨려 인형이 사라지므로 여기서 막는다.
  const scale = Math.min(height / size.y, width / spread);
  if (!finite(scale) || scale <= 0) return null;

  const fittedHeight = size.y * scale;
  if (!finite(fittedHeight) || fittedHeight < height * minHeightFraction) return null;

  return {
    scale,
    fittedHeight,
    offset: {
      x: -(min.x + max.x) / 2,
      y: bottomY / scale - min.y,
      z: -(min.z + max.z) / 2,
    },
  };
}

// 빌드 게이트가 쓰는 한도. 맞춘 높이는 min(H, W/r) 이므로
// min(H, W/r) >= f*H  ⟺  r <= W/(f*H) 한 줄로 정리된다(r = 가로/높이).
// 즉 fitTransform 이 받아 줄 모델의 비율 상한이 그대로 이 값이다.
export function maxSpreadRatio(target, fraction = MIN_MODEL_HEIGHT_FRACTION) {
  if (!target || !finite(target.width) || !finite(target.height)) return null;
  if (target.height <= 0 || target.width <= 0) return null;
  if (!finite(fraction) || fraction <= 0) return null;
  return target.width / (target.height * fraction);
}

export function manifestUrl(theme) {
  return `${MODEL_ROOT}/${theme}/manifest.json`;
}

export function modelUrl(theme, entry) {
  return `${MODEL_ROOT}/${theme}/${entry.model}`;
}

export function thumbnailUrl(theme, entry) {
  return `${MODEL_ROOT}/${theme}/${entry.thumbnail}`;
}

export function findEntry(manifest, char) {
  if (!manifest || !Array.isArray(manifest.items)) return null;
  return manifest.items.find((item) => item.char === char) || null;
}

export function isUsableManifest(value) {
  return Boolean(value)
    && typeof value === 'object'
    && typeof value.theme === 'string'
    && Array.isArray(value.items);
}
