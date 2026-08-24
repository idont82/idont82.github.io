const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const zlib = require('node:zlib');
const test = require('node:test');

function pngSize(file) {
  const buffer = fs.readFileSync(file);
  assert.equal(buffer.subarray(1, 4).toString('ascii'), 'PNG');
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function pngImageData(file) {
  const buffer = fs.readFileSync(file);
  assert.equal(buffer.subarray(1, 4).toString('ascii'), 'PNG');
  assert.equal(buffer.readUInt8(24), 8, 'expected an 8-bit PNG');
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const colorType = buffer.readUInt8(25);
  const bytesPerPixel = colorType === 6 ? 4 : 3;
  assert.ok(colorType === 2 || colorType === 6, 'expected RGB or RGBA PNG');
  let offset = 8;
  const chunks = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.subarray(offset + 4, offset + 8).toString('ascii');
    if (type === 'IDAT') chunks.push(buffer.subarray(offset + 8, offset + 8 + length));
    offset += length + 12;
  }
  const raw = zlib.inflateSync(Buffer.concat(chunks));
  const stride = width * bytesPerPixel;
  const rows = [];
  let source = 0;
  for (let row = 0; row < height; row += 1) {
    const filter = raw[source++];
    const pixels = Buffer.from(raw.subarray(source, source + stride));
    source += stride;
    const previous = rows[row - 1] || Buffer.alloc(stride);
    for (let i = 0; i < stride; i += 1) {
      const left = i >= bytesPerPixel ? pixels[i - bytesPerPixel] : 0;
      const up = previous[i];
      const upLeft = i >= bytesPerPixel ? previous[i - bytesPerPixel] : 0;
      if (filter === 1) pixels[i] = (pixels[i] + left) & 255;
      if (filter === 2) pixels[i] = (pixels[i] + up) & 255;
      if (filter === 3) pixels[i] = (pixels[i] + Math.floor((left + up) / 2)) & 255;
      if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        pixels[i] = (pixels[i] + (pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft)) & 255;
      }
    }
    rows.push(pixels);
  }
  return { bytesPerPixel, rows };
}

function pngPixel(file, x, y) {
  const image = pngImageData(file);
  const pixelOffset = x * image.bytesPerPixel;
  return Array.from(image.rows[y].subarray(pixelOffset, pixelOffset + 3));
}

function hasBrightPixel(file, left, top, right, bottom) {
  const image = pngImageData(file);
  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      const offset = x * image.bytesPerPixel;
      const pixel = image.rows[y];
      if (pixel[offset] > 150 || pixel[offset + 1] > 150 || pixel[offset + 2] > 150) {
        return true;
      }
    }
  }
  return false;
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

function writeLifestyleContent(dir, { disclosure = 'AI \uc5f0\ucd9c \uc774\ubbf8\uc9c0' } = {}) {
  const input = path.join(dir, 'lifestyle-content.json');
  const scene = '/images/facebook-fictional-model/hana-laptop-document-scene.png';
  const product = '/images/facebook-fictional-model/hana-reference.png';
  fs.writeFileSync(input, JSON.stringify({
    id: 'lifestyle-render-test',
    slides: [
      {
        template: 'lifestyle-hybrid',
        role: 'lifestyle-hook',
        label: 'GOLD PICK',
        headline: '\ub9e4\uc77c \ub4e4\uace0 \ub2e4\ub2d0 \ubb38\uc11c\uc6a9 \ub178\ud2b8\ubd81',
        lifestyleImageUrls: [scene],
        productImageUrls: [product],
        productName: '\ud14c\uc2a4\ud2b8 \ub178\ud2b8\ubd81 16',
        priceBand: '100\ub9cc\uc6d0\ub300',
        disclosure,
      },
      {
        template: 'lifestyle-hybrid',
        role: 'product-proof',
        productImageUrls: [product],
        productName: '\ud14c\uc2a4\ud2b8 \ub178\ud2b8\ubd81 16',
        priceBand: '\uc791\uc131\uc77c \uae30\uc900 100\ub9cc\uc6d0\ub300',
        specs: ['Ryzen 5', '16GB \u00b7 512GB', 'Windows 11'],
        disclaimer: '\uac00\uaca9 \ubcc0\ub3d9 \uac00\ub2a5',
      },
      {
        template: 'lifestyle-hybrid',
        role: 'fit-action',
        productImageUrls: [product],
        productName: '\ud14c\uc2a4\ud2b8 \ub178\ud2b8\ubd81 16',
        fits: ['\ubb38\uc11c \uc791\uc131', '\uba54\uc77c \u00b7 \uc6f9', '\ud654\uc0c1 \ud68c\uc758'],
        caution: '16\uc778\uce58 \ud734\ub300 \ubb34\uac8c\ub294 \ud655\uc778\ud558\uc138\uc694',
        cta: '\uc790\uc138\ud55c \ube44\uad50\ub294 \ubcf8\ubb38\uc5d0\uc11c',
      },
    ],
  }), 'utf8');
  return input;
}

test('renderer creates three lifestyle-hybrid role cards with distinct hook regions', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-lifestyle-'));
  const result = render(writeLifestyleContent(dir), dir);
  assert.equal(result.status, 0, result.stderr);
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.cards.length, 3);
  for (const card of manifest.cards) {
    assert.deepEqual(pngSize(card), { width: 1080, height: 1350 });
  }
  const headerSample = pngPixel(manifest.cards[0], 110, 100);
  const lowerPanelSample = pngPixel(manifest.cards[0], 960, 1120);
  assert.ok(headerSample[0] > 220 && headerSample[1] > 160 && headerSample[2] < 130);
  assert.ok(lowerPanelSample.every((channel) => channel > 230));
  assert.notDeepEqual(headerSample, lowerPanelSample);
});

test('renderer rejects a lifestyle hook without its AI image disclosure', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-lifestyle-invalid-'));
  const result = render(writeLifestyleContent(dir, { disclosure: '' }), dir);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /lifestyle hook missing disclosure/);
});

test('renderer keeps lifestyle counters out of the 44px bottom safety edge', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-lifestyle-safe-edge-'));
  const result = render(writeLifestyleContent(dir), dir);
  assert.equal(result.status, 0, result.stderr);
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  assert.equal(hasBrightPixel(manifest.cards[0], 940, 1306, 1040, 1350), false);
  assert.equal(hasBrightPixel(manifest.cards[2], 940, 1306, 1040, 1350), false);
});

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
