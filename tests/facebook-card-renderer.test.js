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

function sampleRgb(file, x, y) {
  const result = spawnSync('python', [
    '-c',
    'import json,sys; from PIL import Image; print(json.dumps(Image.open(sys.argv[1]).convert("RGB").getpixel((int(sys.argv[2]),int(sys.argv[3])))))',
    file,
    String(x),
    String(y),
  ], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

function rightFooterEdgeInk(file) {
  const result = spawnSync('python', [
    '-c',
    'import sys; from PIL import Image; im=Image.open(sys.argv[1]).convert("RGB"); bg=im.getpixel((1070,1240)); print(sum(im.getpixel((x,y)) != bg for x in range(1060,1080) for y in range(1260,1330)))',
    file,
  ], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return Number(result.stdout.trim());
}

function whiteImage(dir) {
  const file = path.join(dir, 'white.ppm');
  const pixels = Buffer.alloc(40 * 40 * 3, 255);
  fs.writeFileSync(file, Buffer.concat([Buffer.from('P6\n40 40\n255\n'), pixels]));
  return pathToFileURL(file).href;
}

function colorImage(dir, name, rgb) {
  const file = path.join(dir, `${name}.ppm`);
  const pixels = Buffer.alloc(80 * 60 * 3);
  for (let offset = 0; offset < pixels.length; offset += 3) {
    pixels[offset] = rgb[0];
    pixels[offset + 1] = rgb[1];
    pixels[offset + 2] = rgb[2];
  }
  fs.writeFileSync(file, Buffer.concat([Buffer.from('P6\n80 60\n255\n'), pixels]));
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

function writeShoppingContent(dir, mutate = () => {}) {
  const colors = [[210, 40, 40], [30, 120, 210], [40, 170, 90]];
  const content = {
    id: 'shopping-render-test',
    slides: colors.map((color, index) => {
      const imageUrl = colorImage(dir, `product-${index}`, color);
      return {
        template: 'shopping-grid',
        label: 'GOLD PICK',
        hook: index === 1 ? 'RTX 5090' : `${104 + index}만원대`,
        productName: `테스트 노트북 ${index + 1}`,
        imageUrl,
        imageUrls: [imageUrl],
        specs: ['메모리 16GB', '저장공간 512GB', 'Windows 확인'],
        uses: ['문서 작업', '화상 회의', '멀티태스킹'],
        disclaimer: index === 1 ? '옵션별 GPU · 가격 확인 필요' : '작성일 기준 · 가격 변동 가능',
      };
    }),
  };
  mutate(content);
  const input = path.join(dir, 'shopping-content.json');
  fs.writeFileSync(input, JSON.stringify(content), 'utf8');
  return input;
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

test('renderer loads a root-relative checked-in image', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-local-image-'));
  const input = writeContent(dir);
  const content = JSON.parse(fs.readFileSync(input, 'utf8'));
  for (const slide of content.slides) {
    slide.imageUrl = '/images/summer-diapers-top3-thumbnail.png';
    slide.imageUrls = [slide.imageUrl];
  }
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

test('shopping-grid renderer creates a distinct product area and information panels', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-shopping-grid-'));
  const result = render(writeShoppingContent(dir), dir);
  assert.equal(result.status, 0, result.stderr);
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.cards.length, 3);
  for (const card of manifest.cards) {
    assert.deepEqual(pngSize(card), { width: 1080, height: 1350 });
    assert.notDeepEqual(sampleRgb(card, 250, 1080), sampleRgb(card, 930, 1080));
    assert.equal(rightFooterEdgeInk(card), 0, 'right footer must keep a 20px safe margin');
  }
});

test('shopping-grid renderer rejects a missing hook before writing cards', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-shopping-invalid-'));
  const input = writeShoppingContent(dir, (content) => {
    delete content.slides[0].hook;
  });
  const result = render(input, dir);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /shopping card missing hook/);
});
