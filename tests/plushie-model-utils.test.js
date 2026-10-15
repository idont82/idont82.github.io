const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const modulePath = pathToFileURL(path.join(__dirname, '..', 'assets', 'plushie-model-utils.js')).href;
const load = () => import(modulePath);

test('normalizeTransform scales the longest axis to the target diameter', async () => {
  const { normalizeTransform } = await load();
  const result = normalizeTransform({ min: { x: -1, y: 0, z: -0.5 }, max: { x: 1, y: 4, z: 0.5 } }, 0.84);
  assert.ok(Math.abs(result.scale - 0.21) < 1e-9);
});

test('normalizeTransform centers the model on the origin', async () => {
  const { normalizeTransform } = await load();
  const result = normalizeTransform({ min: { x: 0, y: 0, z: 0 }, max: { x: 2, y: 2, z: 2 } }, 1);
  assert.deepEqual(result.offset, { x: -1, y: -1, z: -1 });
  assert.equal(result.scale, 0.5);
});

test('normalizeTransform returns null for a zero-size box', async () => {
  const { normalizeTransform } = await load();
  assert.equal(normalizeTransform({ min: { x: 1, y: 1, z: 1 }, max: { x: 1, y: 1, z: 1 } }, 0.84), null);
});

test('normalizeTransform returns null for NaN bounds', async () => {
  const { normalizeTransform } = await load();
  assert.equal(normalizeTransform({ min: { x: NaN, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } }, 0.84), null);
});

test('normalizeTransform returns null for Infinite bounds', async () => {
  const { normalizeTransform } = await load();
  assert.equal(
    normalizeTransform({ min: { x: -Infinity, y: 0, z: 0 }, max: { x: Infinity, y: 1, z: 1 } }, 0.84),
    null,
  );
});

test('normalizeTransform returns null for a missing box', async () => {
  const { normalizeTransform } = await load();
  assert.equal(normalizeTransform(null, 0.84), null);
});

test('normalizeTransform returns null for a non-positive target', async () => {
  const { normalizeTransform } = await load();
  assert.equal(normalizeTransform({ min: { x: 0, y: 0, z: 0 }, max: { x: 1, y: 1, z: 1 } }, 0), null);
});

test('url helpers point at the committed asset paths', async () => {
  const { manifestUrl, modelUrl, thumbnailUrl } = await load();
  assert.equal(manifestUrl('dino'), 'assets/models/dino/manifest.json');
  assert.equal(modelUrl('dino', { model: 'trex.glb' }), 'assets/models/dino/trex.glb');
  assert.equal(thumbnailUrl('dino', { thumbnail: 'trex.webp' }), 'assets/models/dino/trex.webp');
});

test('findEntry locates a character and returns null when absent', async () => {
  const { findEntry } = await load();
  const manifest = { theme: 'dino', items: [{ char: 'trex' }, { char: 'stego' }] };
  assert.equal(findEntry(manifest, 'stego').char, 'stego');
  assert.equal(findEntry(manifest, 'ptera'), null);
  assert.equal(findEntry(null, 'trex'), null);
});

test('isUsableManifest rejects malformed payloads', async () => {
  const { isUsableManifest } = await load();
  assert.equal(isUsableManifest({ theme: 'dino', items: [] }), true);
  assert.equal(isUsableManifest({ theme: 'dino' }), false);
  assert.equal(isUsableManifest({ items: [] }), false);
  assert.equal(isUsableManifest('not json'), false);
  assert.equal(isUsableManifest(null), false);
});
