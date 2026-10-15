import { fitTransform } from './plushie-model-utils.js';

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

// three.js 의 Box3 를 순수 모듈이 읽을 수 있는 평범한 객체로 옮긴다.
// 비어 있는(지오메트리가 하나도 없는) 객체는 ±Infinity 상자를 주므로 null 로 바꾼다.
export function measureBox(THREE, object) {
  if (!object) return null;
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return null;
  return {
    min: { x: box.min.x, y: box.min.y, z: box.min.z },
    max: { x: box.max.x, y: box.max.y, z: box.max.z },
  };
}

// 그룹에서 떼어 낸 절차적 메시의 GPU 자원을 돌려준다.
// 모델 프로토타입의 복제본에는 쓰면 안 된다 — clone 은 지오메트리·머티리얼을 공유한다.
export function disposePlushieTree(object) {
  object?.traverse?.((node) => {
    node.geometry?.dispose?.();
    if (Array.isArray(node.material)) node.material.forEach((m) => m.dispose?.());
    else node.material?.dispose?.();
  });
}

// 그룹의 자식만 갈아 끼운다. userData 와 position/rotation 은 호출자의 것으로 남는다.
// placement 는 modelPlacement(s, 실측상자) 가 만든 { height, width, bottomY } 다.
// 모델을 그 상자 안에 비율 그대로 넣고 같은 바닥에 앉혀, 섞인 줄에서도 키와 발높이가
// 어긋나지 않게 한다. 상자에 넣었을 때 너무 작아지는 모델은 fitTransform 이 null 을
// 주고, 그러면 절차적 인형을 건드리지 않고 그대로 둔다.
export function swapPlushieMesh(THREE, group, prototype, placement) {
  if (!group || !prototype || !placement) return false;

  // 프로토타입을 그대로 잰다. 복제본은 변환까지 같은 상자이므로 결과가 같고,
  // 거절될 모델을 괜히 복제하지 않는다.
  const transform = fitTransform(measureBox(THREE, prototype), placement);
  if (!transform) return false;

  const clone = prototype.clone(true);
  clone.position.set(
    transform.offset.x * transform.scale,
    transform.offset.y * transform.scale,
    transform.offset.z * transform.scale,
  );
  clone.scale.setScalar(transform.scale);

  for (let i = group.children.length - 1; i >= 0; i -= 1) {
    const child = group.children[i];
    group.remove(child);
    disposePlushieTree(child);
  }

  const holder = new THREE.Group();
  holder.add(clone);
  group.add(holder);
  return true;
}
