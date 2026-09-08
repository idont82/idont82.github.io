const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const {
  assertSafeAssetDirectory,
  commitAssetDirectory,
  publicImageUrls,
  waitForPublicImages,
} = require('../scripts/publish-blogger-assets');

test('accepts only the exact campaign directory below images/blogger', () => {
  const root = path.resolve('D:/site');
  const safe = path.join(root, 'images', 'blogger', 'omega3-guide');

  assert.equal(assertSafeAssetDirectory(root, 'omega3-guide', safe), safe);
  assert.throws(
    () => assertSafeAssetDirectory(root, '../outside', safe),
    /safe lowercase slug/,
  );
  assert.throws(
    () => assertSafeAssetDirectory(root, 'omega3-guide', path.join(root, 'images')),
    /exact campaign directory/,
  );
});

test('builds three stable GitHub Pages image URLs', () => {
  assert.deepEqual(
    publicImageUrls('omega3-guide', ['01-product.png', '02-facts.png', '03-checklist.png']),
    [
      'https://idont82.github.io/images/blogger/omega3-guide/01-product.png',
      'https://idont82.github.io/images/blogger/omega3-guide/02-facts.png',
      'https://idont82.github.io/images/blogger/omega3-guide/03-checklist.png',
    ],
  );
});

test('commits and pushes only the exact relative campaign directory', async () => {
  const calls = [];
  const root = path.resolve('D:/site');
  const directory = path.join(root, 'images', 'blogger', 'omega3-guide');
  const commandRunner = async (command, args, options) => {
    calls.push({ command, args, options });
    if (args.includes('--quiet')) {
      return { exitCode: 1, stdout: '', stderr: '' };
    }
    return { exitCode: 0, stdout: '', stderr: '' };
  };

  const result = await commitAssetDirectory(root, 'omega3-guide', directory, commandRunner);

  assert.equal(result.committed, true);
  assert.deepEqual(calls.map((call) => call.args), [
    ['add', '--', 'images/blogger/omega3-guide'],
    ['diff', '--cached', '--check', '--', 'images/blogger/omega3-guide'],
    ['diff', '--cached', '--quiet', '--', 'images/blogger/omega3-guide'],
    ['commit', '--only', 'images/blogger/omega3-guide', '-m', 'feat: publish Blogger assets for omega3-guide'],
    ['push', 'origin', 'main'],
  ]);
});

test('waits until every public URL is an image', async () => {
  let requestCount = 0;
  const fetchImpl = async () => {
    requestCount += 1;
    if (requestCount === 1) {
      return new Response('not ready', { status: 404 });
    }
    return new Response('png', {
      status: 200,
      headers: { 'content-type': 'image/png' },
    });
  };

  const result = await waitForPublicImages(
    ['https://example.test/1.png', 'https://example.test/2.png'],
    { fetchImpl, sleepImpl: async () => {}, timeoutMs: 1000 },
  );

  assert.equal(result.length, 2);
  assert.ok(requestCount >= 3);
});
