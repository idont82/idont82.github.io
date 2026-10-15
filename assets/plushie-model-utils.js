// three.js 에 기대지 않는 순수 함수만 둔다. Node 테스트와 브라우저가 같은 파일을 읽는다.
//
// 예전에는 여기에 모델을 절차적 인형 상자에 끼우는 계산(boxTarget/modelPlacement/
// fitTransform/maxSpreadRatio)도 있었다. 생성된 GLB 모델이 손으로 만든 절차적 인형보다
// 못생겨서 게임이 모델을 더 이상 읽지 않으므로 그 계산은 모두 지웠다.
// 빌드 게이트가 쓰던 같은 규칙은 scripts/assets/glb-bounds.js 에 독립적으로 남아 있다.
// 지금 남은 것은 상품 카드·수집함이 매니페스트를 찾아 읽는 데 필요한 것뿐이다.

const MODEL_ROOT = 'assets/models';

export function manifestUrl(theme) {
  return `${MODEL_ROOT}/${theme}/manifest.json`;
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
