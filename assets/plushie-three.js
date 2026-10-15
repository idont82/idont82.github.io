import { normalizeTransform } from './plushie-model-utils.js';

// GLTFLoader 는 three/addons/ 라는 별도 CDN 경로에서 온다. 그 URL 하나가 죽으면
// 정적 import 는 claw-machine.js 모듈 자체를 실행조차 못 하게 만든다(ES 모듈 그래프는
// 어떤 모듈 본문보다 먼저 해석된다) — 절차적 인형으로 떨어지는 게 아니라 빈 캔버스가 된다.
// 그래서 첫 모델을 받을 때 동적으로 가져오고, 실패는 평범한 로딩 실패로 흘려보낸다.
// 모델이 하나도 없는 테마에서는 아예 내려받지 않는다.
export function createModelLoader(THREE, importLoaderModule) {
  let pending = null;

  function loaderOnce() {
    if (!pending) {
      pending = Promise.resolve()
        .then(importLoaderModule)
        .then((module) => new module.GLTFLoader());
    }
    return pending;
  }

  return async (url) => {
    const loader = await loaderOnce();
    return new Promise((resolve, reject) => {
      loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
    });
  };
}

// 그룹의 자식만 갈아 끼운다. userData 와 position/rotation 은 호출자의 것으로 남는다.
// placement 는 modelPlacement(s) 가 만든 { height, bottomY } 다. 절차적 인형과 같은
// 높이로 줄이고 같은 바닥에 앉혀, 섞인 줄에서도 키와 발높이가 어긋나지 않게 한다.
export function swapPlushieMesh(THREE, group, prototype, placement) {
  if (!group || !prototype || !placement) return false;

  const clone = prototype.clone(true);
  const box = new THREE.Box3().setFromObject(clone);
  const transform = normalizeTransform(
    { min: { x: box.min.x, y: box.min.y, z: box.min.z }, max: { x: box.max.x, y: box.max.y, z: box.max.z } },
    placement.height,
    { axis: 'height', bottomY: placement.bottomY },
  );
  if (!transform) return false;

  clone.position.set(
    transform.offset.x * transform.scale,
    transform.offset.y * transform.scale,
    transform.offset.z * transform.scale,
  );
  clone.scale.setScalar(transform.scale);

  for (let i = group.children.length - 1; i >= 0; i -= 1) {
    const child = group.children[i];
    group.remove(child);
    child.traverse?.((node) => {
      node.geometry?.dispose?.();
      if (Array.isArray(node.material)) node.material.forEach((m) => m.dispose?.());
      else node.material?.dispose?.();
    });
  }

  const holder = new THREE.Group();
  holder.add(clone);
  group.add(holder);
  return true;
}
