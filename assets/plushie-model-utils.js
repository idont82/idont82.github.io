// three.js 에 기대지 않는 순수 함수만 둔다. Node 테스트와 브라우저가 같은 파일을 읽는다.

const MODEL_ROOT = 'assets/models';

function finite(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

// 절차적 인형(createPlushie)의 로컬 바운딩을 s(= plushieScale) 단위로 적은 값이다.
// 몸통 구는 반지름 1.0s·y=0 중심이고 그 아래로 바지와 다리가 ~1.0s 까지 내려가며,
// 머리 그룹은 y=1.4~1.6s 에 반지름 0.85~0.9s 라 머리카락·귀까지 위로 ~2.25s 올라간다.
// 착지 높이 landY = plushieScale * 0.8 (claw-machine.js) 는 이 바닥값 -1.0 에 맞춰진 값이다.
// 모델도 같은 높이·같은 바닥으로 앉혀야 절차적 인형과 한 줄에 섞여도 뜨거나 묻히지 않는다.
export const PROCEDURAL_PLUSHIE_BOUNDS = { bottom: -1.0, top: 2.25 };

// s 를 받아 swapPlushieMesh 에 넘길 목표 높이와 바닥 y 를 만든다.
export function modelPlacement(s) {
  if (!finite(s) || s <= 0) return null;
  const { bottom, top } = PROCEDURAL_PLUSHIE_BOUNDS;
  return { height: (top - bottom) * s, bottomY: bottom * s };
}

// axis: 'longest' 는 가장 긴 축을, 'height' 는 y 축을 targetSize 에 맞춘다.
// gpu3d 는 heightM 만 맞춰 주므로 모델은 높이만 서로 같다. 절차적 인형도 높이가 지배적이라
// 높이를 기준으로 맞추는 쪽이 둘을 같은 크기로 보이게 한다.
// bottomY: 주면 AABB 중심 대신 모델 바닥을 그 y 에 앉힌다(스케일 적용 뒤 로컬 좌표).
export function normalizeTransform(box, targetSize, { axis = 'longest', bottomY = null } = {}) {
  if (!box || !box.min || !box.max) return null;
  if (!finite(targetSize) || targetSize <= 0) return null;
  if (bottomY !== null && !finite(bottomY)) return null;

  const { min, max } = box;
  const coords = [min.x, min.y, min.z, max.x, max.y, max.z];
  if (!coords.every(finite)) return null;

  const size = { x: max.x - min.x, y: max.y - min.y, z: max.z - min.z };
  const reference = axis === 'height' ? size.y : Math.max(size.x, size.y, size.z);
  if (!finite(reference) || reference <= 0) return null;

  // 비정상적으로 작은 바운딩 박스는 scale 을 Infinity 로 만든다.
  // setScalar(Infinity) 는 행렬을 망가뜨려 인형이 사라지므로 여기서 막는다.
  const scale = targetSize / reference;
  if (!finite(scale) || scale <= 0) return null;

  return {
    scale,
    offset: {
      x: -(min.x + max.x) / 2,
      y: bottomY === null ? -(min.y + max.y) / 2 : bottomY / scale - min.y,
      z: -(min.z + max.z) / 2,
    },
  };
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
