const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const test = require('node:test');

function pngSize(file) {
  const buffer = fs.readFileSync(file);
  assert.equal(buffer.subarray(1, 4).toString('ascii'), 'PNG');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function whiteImage(dir) {
  const file = path.join(dir, 'white.ppm');
  const pixels = Buffer.alloc(40 * 40 * 3, 255);
  fs.writeFileSync(file, Buffer.concat([Buffer.from('P6\n40 40\n255\n'), pixels]));
  return pathToFileURL(file).href;
}

function writeContent(dir, title = '상품 사진 위에 들어가는 큰 문구') {
  const imageUrl = whiteImage(dir);
  const input = path.join(dir, 'content.json');
  fs.writeFileSync(input, JSON.stringify({
    id: 'render-test',
    slides: Array.from({ length: 3 }, (_, index) => ({
      label: 'GOLD PICK',
      title: index === 1 ? '두 번째 선택 기준' : title,
      imageUrl,
      imageUrls: [imageUrl],
    })),
  }), 'utf8');
  return input;
}

function render(input, dir, env = process.env) {
  return spawnSync('python', [
    'scripts/generate-facebook-cards.py', '--input', input, '--output-dir', dir,
  ], { encoding: 'utf8', env });
}

test('renderer creates exactly three 1080x1350 photo cards and a manifest', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-cards-'));
  const result = render(writeContent(dir), dir);
  assert.equal(result.status, 0, result.stderr);
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.cards.length, 3);
  for (const card of manifest.cards) {
    assert.deepEqual(pngSize(card), { width: 1080, height: 1350 });
  }
});

test('renderer rejects a phrase that cannot fit in two lines', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-overflow-'));
  const result = render(writeContent(dir, '가'.repeat(200)), dir);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /two lines|Text does not fit card/);
});

test('renderer uses the next image candidate when the primary image fails', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-fallback-'));
  const input = writeContent(dir);
  const content = JSON.parse(fs.readFileSync(input, 'utf8'));
  content.slides[0].imageUrls.unshift('file:///definitely-missing.jpg');
  content.slides[0].imageUrl = content.slides[0].imageUrls[0];
  fs.writeFileSync(input, JSON.stringify(content));
  const result = render(input, dir);
  assert.equal(result.status, 0, result.stderr);
});

test('renderer falls back to an installed Korean font when override is missing', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-font-'));
  const result = render(writeContent(dir), dir, {
    ...process.env,
    FACEBOOK_CARD_FONT: path.join(dir, 'missing-font.ttf'),
  });
  assert.equal(result.status, 0, result.stderr);
});
