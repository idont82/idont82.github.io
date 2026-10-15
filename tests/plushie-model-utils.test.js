const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const modulePath = pathToFileURL(path.join(__dirname, '..', 'assets', 'plushie-model-utils.js')).href;
const load = () => import(modulePath);

test('url helpers point at the committed asset paths', async () => {
  const { manifestUrl, thumbnailUrl } = await load();
  assert.equal(manifestUrl('dino'), 'assets/models/dino/manifest.json');
  assert.equal(thumbnailUrl('dino', { thumbnail: 'trex.webp' }), 'assets/models/dino/trex.webp');
});

test('the model placement maths is gone with the model path', async () => {
  // 모델을 절차적 인형 상자에 끼우던 계산(boxTarget/modelPlacement/fitTransform/
  // maxSpreadRatio/modelUrl)은 게임이 모델을 읽지 않게 되면서 전부 죽은 코드가 됐다.
  // 되살아나면 모델 경로가 함께 돌아온 것이다.
  const utils = await load();
  for (const name of ['boxTarget', 'modelPlacement', 'fitTransform', 'maxSpreadRatio', 'modelUrl', 'MIN_MODEL_HEIGHT_FRACTION']) {
    assert.equal(utils[name], undefined, `${name} 이 남아 있습니다.`);
  }
});

test('findEntry locates a character and returns null when absent', async () => {
  const { findEntry } = await load();
  const manifest = { theme: 'dino', items: [{ char: 'trex' }, { char: 'stego' }] };
  assert.equal(findEntry(manifest, 'stego').char, 'stego');
  assert.equal(findEntry(manifest, 'ptera'), null);
  assert.equal(findEntry(null, 'trex'), null);
  assert.equal(findEntry({ theme: 'dino' }, 'trex'), null);
});

test('isUsableManifest rejects malformed payloads', async () => {
  const { isUsableManifest } = await load();
  assert.equal(isUsableManifest({ theme: 'dino', items: [] }), true);
  assert.equal(isUsableManifest({ theme: 'dino' }), false);
  assert.equal(isUsableManifest({ items: [] }), false);
  assert.equal(isUsableManifest('not json'), false);
  assert.equal(isUsableManifest(null), false);
});
