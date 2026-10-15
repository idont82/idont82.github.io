import { isUsableManifest, manifestUrl, modelUrl } from './plushie-model-utils.js';

export function createThemeLoader({ fetchImpl = fetch, loadModel, onError = () => {} } = {}) {
  let generation = 0;
  let activeTheme = null;

  async function load(theme) {
    const mine = ++generation;
    activeTheme = theme;

    let manifest = null;
    try {
      const response = await fetchImpl(manifestUrl(theme));
      if (!response.ok) throw new Error(`매니페스트 응답 ${response.status}`);
      manifest = await response.json();
    } catch (error) {
      onError(error);
      return null;
    }

    if (!isUsableManifest(manifest)) {
      onError(new Error(`${theme} 매니페스트 형식이 올바르지 않습니다.`));
      return null;
    }
    if (mine !== generation) return null;

    // 직렬로 받으면 기본 테마가 왕복 2번, dino 는 5번이다. 모바일 콜드 캐시에서는
    // 그 차이가 "모델이 보인다" 와 "한 판 끝나도 안 온다" 의 차이가 된다.
    // allSettled 라서 하나가 깨져도 나머지는 그대로 들어온다.
    const settled = await Promise.allSettled(
      manifest.items.map((entry) => loadModel(modelUrl(theme, entry))),
    );
    if (mine !== generation) return null;

    const models = new Map();
    settled.forEach((outcome, index) => {
      if (outcome.status === 'fulfilled') models.set(manifest.items[index].char, outcome.value);
      else onError(outcome.reason);
    });

    return { theme, manifest, models };
  }

  return { load, current: () => activeTheme };
}
