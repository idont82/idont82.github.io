// three.js 에 기대지 않는 순수 함수만 둔다. Node 테스트와 브라우저가 같은 파일을 읽는다.

const MODEL_ROOT = 'assets/models';

function finite(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function normalizeTransform(box, targetDiameter) {
  if (!box || !box.min || !box.max) return null;
  if (!finite(targetDiameter) || targetDiameter <= 0) return null;

  const { min, max } = box;
  const coords = [min.x, min.y, min.z, max.x, max.y, max.z];
  if (!coords.every(finite)) return null;

  const size = { x: max.x - min.x, y: max.y - min.y, z: max.z - min.z };
  const longest = Math.max(size.x, size.y, size.z);
  if (!finite(longest) || longest <= 0) return null;

  return {
    scale: targetDiameter / longest,
    offset: {
      x: -(min.x + max.x) / 2,
      y: -(min.y + max.y) / 2,
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
