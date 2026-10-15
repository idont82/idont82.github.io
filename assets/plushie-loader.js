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

    const models = new Map();
    for (const entry of manifest.items) {
      try {
        const model = await loadModel(modelUrl(theme, entry));
        if (mine !== generation) return null;
        models.set(entry.char, model);
      } catch (error) {
        onError(error);
      }
    }

    if (mine !== generation) return null;
    return { theme, manifest, models };
  }

  return { load, current: () => activeTheme };
}
