import { normalizeTransform } from './plushie-model-utils.js';

export function createModelLoader(THREE, GLTFLoader) {
  const loader = new GLTFLoader();
  return (url) => new Promise((resolve, reject) => {
    loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
  });
}

// 그룹의 자식만 갈아 끼운다. userData 와 position/rotation 은 호출자의 것으로 남는다.
export function swapPlushieMesh(THREE, group, prototype, targetDiameter) {
  if (!group || !prototype) return false;

  const clone = prototype.clone(true);
  const box = new THREE.Box3().setFromObject(clone);
  const transform = normalizeTransform(
    { min: { x: box.min.x, y: box.min.y, z: box.min.z }, max: { x: box.max.x, y: box.max.y, z: box.max.z } },
    targetDiameter,
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
