import { isUsableManifest, manifestUrl } from './plushie-model-utils.js';

// 테마의 상품 매니페스트만 받아 온다. 예전에는 매니페스트에 적힌 GLB 모델까지 내려받아
// 절차적 인형의 메시를 갈아 끼웠지만, 생성된 모델이 손으로 만든 절차적 인형보다
// 못생겨서 모델 경로를 걷어냈다. 매니페스트는 그대로 필요하다 — 상품명·가격·쿠팡
// 링크가 전부 여기서 온다.
//
// 지키는 성질 세 가지:
//  - 세대(generation) 가드: 늦게 끝난 이전 테마의 응답은 null 로 버린다.
//  - 실패는 null: 404·오프라인·형식 오류 모두 onError 로 알리고 null 을 돌려준다.
//  - 매니페스트가 없어도 게임은 그대로 돈다(테마 3개는 애초에 매니페스트가 없다).
export function createThemeLoader({ fetchImpl = fetch, onError = () => {} } = {}) {
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

    return { theme, manifest };
  }

  return { load, current: () => activeTheme };
}
