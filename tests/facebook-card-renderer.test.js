const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

function pngSize(file) {
  const buffer = fs.readFileSync(file);
  assert.equal(buffer.subarray(1, 4).toString('ascii'), 'PNG');
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function writeContent(dir, body = '구매 전에 무게와 크기, 보관 공간을 함께 확인하세요.') {
  const input = path.join(dir, 'content.json');
  fs.writeFileSync(input, JSON.stringify({
    id: 'render-test',
    slides: Array.from({ length: 5 }, (_, index) => ({
      label: `카드 ${index + 1}`,
      title: '한글 카드뉴스 제목',
      body,
      imageUrl: '',
    })),
  }), 'utf8');
  return input;
}

function render(input, dir, env = process.env) {
  return spawnSync('python', [
    'scripts/generate-facebook-cards.py',
    '--input', input,
    '--output-dir', dir,
  ], {
    encoding: 'utf8',
    env,
  });
}

test('renderer creates five 1080x1350 PNG cards and a manifest', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-cards-'));
  const result = render(writeContent(dir), dir);
  assert.equal(result.status, 0, result.stderr);
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.cards.length, 5);
  for (const card of manifest.cards) {
    assert.deepEqual(pngSize(card), { width: 1080, height: 1350 });
  }
});

test('renderer rejects text that cannot fit inside a card', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-overflow-'));
  const result = render(writeContent(dir, '가'.repeat(20000)), dir);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Text does not fit card/);
});

test('renderer falls back to an installed Korean font when override is missing', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-font-'));
  const input = writeContent(dir);
  const result = render(input, dir, {
    ...process.env,
    FACEBOOK_CARD_FONT: path.join(dir, 'missing-font.ttf'),
  });
  assert.equal(result.status, 0, result.stderr);
});
