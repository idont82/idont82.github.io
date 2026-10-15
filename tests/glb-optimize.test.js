const assert = require('node:assert/strict');
const test = require('node:test');

const {
  parseGlb,
  buildGlb,
  convertImageBuffer,
  optimizeGlb,
} = require('../scripts/assets/glb-optimize');

const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;

function pad4(length) {
  return (4 - (length % 4)) % 4;
}

function makeGlb(json, bin) {
  const jsonBytes = Buffer.from(JSON.stringify(json), 'utf8');
  const jsonPad = Buffer.alloc(pad4(jsonBytes.length), 0x20);
  const binPad = Buffer.alloc(pad4(bin.length), 0);
  const jsonLen = jsonBytes.length + jsonPad.length;
  const binLen = bin.length + binPad.length;
  const total = 12 + 8 + jsonLen + 8 + binLen;

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(total, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonLen, 0);
  jsonHeader.writeUInt32LE(JSON_CHUNK, 4);

  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(binLen, 0);
  binHeader.writeUInt32LE(BIN_CHUNK, 4);

  return Buffer.concat([header, jsonHeader, jsonBytes, jsonPad, binHeader, bin, binPad]);
}

// 이미지 bufferView 하나와 메시용 bufferView 하나를 가진 최소 GLB.
function fixtureGlb() {
  const mesh = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]);
  const image = Buffer.from('ORIGINAL-PNG-BYTES');
  const bin = Buffer.concat([mesh, image, Buffer.alloc(pad4(mesh.length + image.length), 0)]);
  const json = {
    asset: { version: '2.0' },
    buffers: [{ byteLength: bin.length }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: mesh.length },
      { buffer: 0, byteOffset: mesh.length, byteLength: image.length },
    ],
    images: [{ bufferView: 1, mimeType: 'image/png' }],
    meshes: [],
  };
  return makeGlb(json, bin);
}

test('parseGlb reads the JSON and BIN chunks', () => {
  const parsed = parseGlb(fixtureGlb());
  assert.equal(parsed.json.asset.version, '2.0');
  assert.equal(parsed.json.images.length, 1);
  assert.equal(parsed.bin.subarray(8, 8 + 18).toString('utf8'), 'ORIGINAL-PNG-BYTES');
});

test('parseGlb rejects a non-GLB buffer', () => {
  assert.throws(() => parseGlb(Buffer.from('not a glb at all')), /GLB/);
});

test('buildGlb round-trips through parseGlb', () => {
  const parsed = parseGlb(fixtureGlb());
  const rebuilt = buildGlb(parsed);
  const reparsed = parseGlb(rebuilt);
  assert.deepEqual(reparsed.json, parsed.json);
  assert.deepEqual([...reparsed.bin], [...parsed.bin]);
  assert.equal(rebuilt.readUInt32LE(8), rebuilt.length);
});

test('optimizeGlb replaces image bytes and rewrites offsets', () => {
  const convert = () => Buffer.from('TINY-WEBP');
  const result = optimizeGlb(fixtureGlb(), { maxSize: 512, quality: 80, convert });

  assert.equal(result.images, 1);
  const parsed = parseGlb(result.buffer);
  assert.equal(parsed.json.images[0].mimeType, 'image/webp');

  const meshView = parsed.json.bufferViews[0];
  const imageView = parsed.json.bufferViews[1];
  assert.equal(meshView.byteOffset, 0);
  assert.equal(meshView.byteLength, 8);
  assert.equal(imageView.byteLength, 9);
  assert.equal(imageView.byteOffset % 4, 0);
  assert.equal(
    parsed.bin.subarray(imageView.byteOffset, imageView.byteOffset + imageView.byteLength).toString('utf8'),
    'TINY-WEBP',
  );
  assert.equal(parsed.json.buffers[0].byteLength, parsed.bin.length);
  assert.ok(result.buffer.length < fixtureGlb().length);
});

test('optimizeGlb leaves a GLB without images untouched', () => {
  const json = {
    asset: { version: '2.0' },
    buffers: [{ byteLength: 8 }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 8 }],
    meshes: [],
  };
  const source = makeGlb(json, Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]));
  const result = optimizeGlb(source, { maxSize: 512, quality: 80, convert: () => { throw new Error('호출되면 안 됨'); } });
  assert.equal(result.images, 0);
  assert.deepEqual(parseGlb(result.buffer).json.bufferViews, json.bufferViews);
});

test('optimizeGlb rejects data-URI images with a clear message', () => {
  const json = {
    asset: { version: '2.0' },
    buffers: [{ byteLength: 4 }],
    bufferViews: [{ buffer: 0, byteOffset: 0, byteLength: 4 }],
    images: [{ uri: 'data:image/png;base64,AAAA' }],
  };
  const source = makeGlb(json, Buffer.from([1, 2, 3, 4]));
  assert.throws(
    () => optimizeGlb(source, { maxSize: 512, quality: 80, convert: () => Buffer.alloc(0) }),
    /bufferView/,
  );
});

test('convertImageBuffer produces a real WebP smaller than the PNG', () => {
  const { execFileSync } = require('node:child_process');
  // 512x512 노이즈 PNG 를 Pillow 로 만든다. 단색이면 압축이 너무 잘 돼 비교가 무의미하다.
  const png = execFileSync('python', ['-I', '-c', [
    'import sys,io,os',
    'from PIL import Image',
    'img = Image.frombytes("RGB", (512,512), os.urandom(512*512*3))',
    'buf = io.BytesIO(); img.save(buf, "PNG")',
    'sys.stdout.buffer.write(buf.getvalue())',
  ].join('\n')], { maxBuffer: 64 * 1024 * 1024 });

  const webp = convertImageBuffer(png, { maxSize: 256, quality: 80 });
  assert.equal(webp.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(webp.subarray(8, 12).toString('ascii'), 'WEBP');
  assert.ok(webp.length < png.length);
});
