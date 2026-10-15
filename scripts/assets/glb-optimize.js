const { execFileSync } = require('node:child_process');

const MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;

function pad4(length) {
  return (4 - (length % 4)) % 4;
}

function parseGlb(buffer) {
  if (buffer.length < 20 || buffer.readUInt32LE(0) !== MAGIC) {
    throw new Error('GLB 파일이 아닙니다.');
  }

  let offset = 12;
  let json = null;
  let bin = Buffer.alloc(0);

  while (offset + 8 <= buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    const chunk = buffer.subarray(start, start + chunkLength);

    if (chunkType === JSON_CHUNK) json = JSON.parse(chunk.toString('utf8'));
    else if (chunkType === BIN_CHUNK) bin = Buffer.from(chunk);

    offset = start + chunkLength;
  }

  if (!json) throw new Error('GLB 에 JSON 청크가 없습니다.');
  return { json, bin };
}

function buildGlb({ json, bin }) {
  const jsonBytes = Buffer.from(JSON.stringify(json), 'utf8');
  const jsonPad = Buffer.alloc(pad4(jsonBytes.length), 0x20);
  const binPad = Buffer.alloc(pad4(bin.length), 0);
  const jsonLen = jsonBytes.length + jsonPad.length;
  const binLen = bin.length + binPad.length;
  const total = 12 + 8 + jsonLen + (binLen > 0 ? 8 + binLen : 0);

  const header = Buffer.alloc(12);
  header.writeUInt32LE(MAGIC, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(total, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonLen, 0);
  jsonHeader.writeUInt32LE(JSON_CHUNK, 4);

  const parts = [header, jsonHeader, jsonBytes, jsonPad];
  if (binLen > 0) {
    const binHeader = Buffer.alloc(8);
    binHeader.writeUInt32LE(binLen, 0);
    binHeader.writeUInt32LE(BIN_CHUNK, 4);
    parts.push(binHeader, bin, binPad);
  }
  return Buffer.concat(parts);
}

// Pillow 로 축소 + WebP 변환. -I 로 현재 디렉터리의 모듈을 읽지 않게 한다.
function convertImageBuffer(buffer, { maxSize = 512, quality = 80, pythonBin = 'python' } = {}) {
  const script = [
    'import sys, io',
    'from PIL import Image',
    'data = sys.stdin.buffer.read()',
    'img = Image.open(io.BytesIO(data))',
    'img = img.convert("RGBA" if "A" in img.getbands() else "RGB")',
    `limit = ${maxSize}`,
    'if max(img.size) > limit:',
    '    ratio = limit / max(img.size)',
    '    img = img.resize((max(1, round(img.width * ratio)), max(1, round(img.height * ratio))), Image.LANCZOS)',
    'out = io.BytesIO()',
    `img.save(out, "WEBP", quality=${quality}, method=6)`,
    'sys.stdout.buffer.write(out.getvalue())',
  ].join('\n');

  return execFileSync(pythonBin, ['-I', '-c', script], {
    input: buffer,
    maxBuffer: 128 * 1024 * 1024,
  });
}

const WEBP_EXTENSION = 'EXT_texture_webp';

// WebP 로 바뀐 이미지를 가리키는 텍스처를 EXT_texture_webp 로 옮긴다.
// core glTF 는 image.mimeType 으로 png/jpeg 만 허용하므로 확장으로 선언해야 한다.
// extensionsRequired 에 올리면 core texture.source 는 생략해도 된다.
function markWebpTextures(json, convertedImages) {
  let wired = false;
  for (const texture of json.textures || []) {
    if (!convertedImages.has(texture.source)) continue;
    texture.extensions = { ...texture.extensions, [WEBP_EXTENSION]: { source: texture.source } };
    delete texture.source;
    wired = true;
  }
  if (!wired) return;

  for (const key of ['extensionsUsed', 'extensionsRequired']) {
    const list = Array.isArray(json[key]) ? json[key] : [];
    if (!list.includes(WEBP_EXTENSION)) list.push(WEBP_EXTENSION);
    json[key] = list;
  }
}

function optimizeGlb(buffer, options = {}) {
  const convert = options.convert
    || ((bytes) => convertImageBuffer(bytes, options));
  const { json, bin } = parseGlb(buffer);
  const images = Array.isArray(json.images) ? json.images : [];

  if (images.length === 0) return { buffer: buildGlb({ json, bin }), images: 0 };

  const replacements = new Map();
  const convertedImages = new Set();
  for (const [imageIndex, image] of images.entries()) {
    if (typeof image.bufferView !== 'number') {
      throw new Error('bufferView 가 아닌 이미지(data URI 등)는 지원하지 않습니다.');
    }
    const view = json.bufferViews[image.bufferView];
    const bytes = bin.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
    replacements.set(image.bufferView, convert(Buffer.from(bytes)));
    image.mimeType = 'image/webp';
    convertedImages.add(imageIndex);
  }
  markWebpTextures(json, convertedImages);

  // BIN 을 처음부터 다시 쌓는다. 이미지가 줄어든 만큼 뒤쪽 bufferView 의 offset 이 전부 바뀐다.
  const chunks = [];
  let cursor = 0;
  json.bufferViews.forEach((view, index) => {
    const source = replacements.has(index)
      ? replacements.get(index)
      : Buffer.from(bin.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength));

    const padding = pad4(cursor);
    if (padding > 0) {
      chunks.push(Buffer.alloc(padding, 0));
      cursor += padding;
    }

    view.byteOffset = cursor;
    view.byteLength = source.length;
    chunks.push(source);
    cursor += source.length;
  });

  // BIN 청크는 4바이트 정렬되므로 꼬리 패딩까지 포함한 길이를 buffer 길이로 적는다.
  const unpaddedBin = Buffer.concat(chunks);
  const nextBin = Buffer.concat([unpaddedBin, Buffer.alloc(pad4(unpaddedBin.length), 0)]);
  json.buffers[0].byteLength = nextBin.length;

  return { buffer: buildGlb({ json, bin: nextBin }), images: images.length };
}

module.exports = {
  buildGlb,
  convertImageBuffer,
  optimizeGlb,
  parseGlb,
};
