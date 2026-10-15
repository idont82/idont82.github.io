# 인형뽑기 게임 3D 전면 재설계 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 인형뽑기 게임의 인형 16개와 기계를 쿠팡 정품 상품 사진에서 만든 GLB 모델로 교체하고, 뽑은 인형을 그 상품의 제휴 링크로 연결한다.

**Architecture:** 에셋 제작은 오프라인 Node CLI 파이프라인(쿠팡 검색 → 사내 gpu3d 서버 → GLB 최적화 → 매니페스트)이고, 게임 런타임은 커밋된 GLB만 읽는다. 게임은 기존 procedural 캐릭터로 즉시 시작한 뒤 GLB가 도착하는 대로 메시만 바꾼다. 로딩 실패는 procedural 상태 유지로 흡수한다.

**Tech Stack:** Node 24 (CommonJS, `node:test`), Three.js 0.162 (CDN importmap, GLTFLoader), Python Pillow 12 (텍스처 변환), 쿠팡 파트너스 Open API, 사내 gpu3d 서버

**Spec:** `docs/superpowers/specs/2026-10-15-claw-machine-3d-redesign-design.md`

## Global Constraints

- 웹 앱에 npm 런타임 의존을 추가하지 않는다. Three.js는 CDN importmap, 버전 `0.162.0` 고정.
- 빌드 단계를 도입하지 않는다. `assets/*.js`는 브라우저가 그대로 읽는 파일이다.
- 사내 gpu3d 서버 주소와 토큰은 `gpu3d/api.txt`에서만 읽는다. 커밋 대상 파일(코드·테스트·문서·픽스처)에 주소나 토큰을 적지 않는다.
- `gpu3d/`를 `.gitignore`에 추가한다.
- 쿠팡 제휴 링크는 전부 `subId=clawgame`, iframe 위젯은 `subId=clawwidget`.
- 용량 예산: 기계 GLB 2.0MB, 환경맵 0.1MB, 인형 1개 0.3MB, 테마 1개 1.8MB, 인형 16개 합계 4.8MB.
- `claw-machine.html`의 `<title>`, `<meta>`, 본문 텍스트, URL을 바꾸지 않는다. 검색 순위가 걸린 자산이다.
- 게임의 유한상태기계, 진자 물리, 집기 확률, 조작계, localStorage 수집함 스키마를 바꾸지 않는다.
- 쿠팡 파트너스 고지 문구와 위치를 바꾸지 않는다.
- 사용자의 다른 미커밋 파일을 수정하거나 스테이징하지 않는다.
- 테스트 실행: `node --test tests/<file>.test.js`.

## Review Focus

1. **GLB·매니페스트 요청 실패(오프라인, 404, 타임아웃)** — 게임은 procedural 인형으로 계속 돌아가야 하고 콘솔 에러로 멈추면 안 된다. Task 5에서 테스트.
2. **바운딩 박스가 비거나 비정상인 모델** — 0 크기나 NaN이 들어오면 스케일이 NaN이 되어 인형이 사라진다. 교체를 건너뛰어야 한다. Task 5에서 테스트.
3. **로딩 중 테마 재전환** — 이전 테마의 GLB가 늦게 도착해 새 테마 인형에 붙으면 안 된다. Task 6에서 테스트.
4. **`sessionStorage` 접근 차단(시크릿 모드·쿠키 차단)** — 성공 카드 판정에서 예외가 나면 뽑기 성공 처리 전체가 멈춘다. Task 9에서 테스트.
5. **매니페스트에 상품이 없는 캐릭터** — 단종·검색 실패로 빠진 캐릭터는 카드를 띄우지 않고 게임만 정상 동작해야 한다. Task 9에서 테스트.

---

### Task 1: gpu3d 클라이언트

**Files:**
- Create: `scripts/assets/gpu3d-client.js`
- Create: `tests/gpu3d-client.test.js`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `readGpu3dConfig(filePath) -> {base: string, token: string}`
  - `createJob(config, {imageBuffer, fileName, kind, name, polycount, heightM}, fetchImpl) -> Promise<string>` (jobId)
  - `pollJob(config, jobId, fetchImpl) -> Promise<{status, stage, progress, error}>`
  - `downloadResult(config, jobId, fetchImpl) -> Promise<Buffer>`
  - `waitForJob(config, jobId, fetchImpl, {intervalMs, timeoutMs, sleep}) -> Promise<Buffer>`

- [ ] **Step 1: Write the failing test**

Create `tests/gpu3d-client.test.js`:

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  readGpu3dConfig,
  createJob,
  pollJob,
  downloadResult,
  waitForJob,
} = require('../scripts/assets/gpu3d-client');

function tempFile(contents) {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'gpu3d-')), 'api.txt');
  fs.writeFileSync(file, contents, 'utf8');
  return file;
}

test('readGpu3dConfig reads base and token', () => {
  const file = tempFile('base=http://example.test:8790\ntoken=abc123\n');
  assert.deepEqual(readGpu3dConfig(file), { base: 'http://example.test:8790', token: 'abc123' });
});

test('readGpu3dConfig trims trailing slash on base', () => {
  const file = tempFile('base=http://example.test:8790/\ntoken=abc123\n');
  assert.equal(readGpu3dConfig(file).base, 'http://example.test:8790');
});

test('readGpu3dConfig fails loudly when token missing', () => {
  const file = tempFile('base=http://example.test:8790\n');
  assert.throws(() => readGpu3dConfig(file), /token/);
});

test('createJob posts multipart and returns jobId', async () => {
  const config = { base: 'http://example.test:8790', token: 'abc123' };
  let seen = null;
  const fetchImpl = async (url, options) => {
    seen = { url, options };
    return { ok: true, status: 200, json: async () => ({ jobId: 'job-1' }) };
  };

  const jobId = await createJob(config, {
    imageBuffer: Buffer.from('png-bytes'),
    fileName: 'trex.png',
    kind: 'prop',
    name: 'trex',
    polycount: 8000,
    heightM: 0.3,
  }, fetchImpl);

  assert.equal(jobId, 'job-1');
  assert.equal(seen.url, 'http://example.test:8790/jobs');
  assert.equal(seen.options.method, 'POST');
  assert.equal(seen.options.headers.Authorization, 'Bearer abc123');
  const form = seen.options.body;
  assert.equal(form.get('kind'), 'prop');
  assert.equal(form.get('name'), 'trex');
  assert.equal(form.get('polycount'), '8000');
  assert.equal(form.get('heightM'), '0.3');
});

test('createJob throws with server error code', async () => {
  const config = { base: 'http://example.test:8790', token: 'abc123' };
  const fetchImpl = async () => ({
    ok: false,
    status: 400,
    json: async () => ({ error: { code: 'BAD_IMAGE' } }),
  });

  await assert.rejects(
    () => createJob(config, {
      imageBuffer: Buffer.from('x'), fileName: 'a.png', kind: 'prop', name: 'a',
      polycount: 8000, heightM: 0.3,
    }, fetchImpl),
    /BAD_IMAGE/,
  );
});

test('pollJob returns status payload', async () => {
  const config = { base: 'http://example.test:8790', token: 'abc123' };
  const fetchImpl = async (url, options) => {
    assert.equal(url, 'http://example.test:8790/jobs/job-1');
    assert.equal(options.headers.Authorization, 'Bearer abc123');
    return { ok: true, status: 200, json: async () => ({ status: 'running', stage: 'generate', progress: 0.4 }) };
  };

  assert.deepEqual(await pollJob(config, 'job-1', fetchImpl), {
    status: 'running', stage: 'generate', progress: 0.4,
  });
});

test('downloadResult returns the GLB bytes', async () => {
  const config = { base: 'http://example.test:8790', token: 'abc123' };
  const fetchImpl = async (url) => {
    assert.equal(url, 'http://example.test:8790/jobs/job-1/result');
    return { ok: true, status: 200, arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer };
  };

  const buf = await downloadResult(config, 'job-1', fetchImpl);
  assert.ok(Buffer.isBuffer(buf));
  assert.deepEqual([...buf], [1, 2, 3]);
});

test('waitForJob polls until done then downloads', async () => {
  const config = { base: 'http://example.test:8790', token: 'abc123' };
  const statuses = ['queued', 'running', 'done'];
  let call = 0;
  const fetchImpl = async (url) => {
    if (url.endsWith('/result')) {
      return { ok: true, status: 200, arrayBuffer: async () => new Uint8Array([9]).buffer };
    }
    const status = statuses[Math.min(call++, statuses.length - 1)];
    return { ok: true, status: 200, json: async () => ({ status }) };
  };

  const buf = await waitForJob(config, 'job-1', fetchImpl, {
    intervalMs: 0, timeoutMs: 10000, sleep: async () => {},
  });
  assert.deepEqual([...buf], [9]);
  assert.equal(call, 3);
});

test('waitForJob rejects when the job fails', async () => {
  const config = { base: 'http://example.test:8790', token: 'abc123' };
  const fetchImpl = async () => ({
    ok: true, status: 200,
    json: async () => ({ status: 'failed', error: { code: 'OOM' } }),
  });

  await assert.rejects(
    () => waitForJob(config, 'job-1', fetchImpl, { intervalMs: 0, timeoutMs: 1000, sleep: async () => {} }),
    /OOM/,
  );
});

test('waitForJob rejects on timeout', async () => {
  const config = { base: 'http://example.test:8790', token: 'abc123' };
  const fetchImpl = async () => ({ ok: true, status: 200, json: async () => ({ status: 'running' }) });
  let now = 0;

  await assert.rejects(
    () => waitForJob(config, 'job-1', fetchImpl, {
      intervalMs: 1000, timeoutMs: 3000, sleep: async () => { now += 1000; }, nowFn: () => now,
    }),
    /시간이 초과/,
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/gpu3d-client.test.js`
Expected: FAIL with "Cannot find module '../scripts/assets/gpu3d-client'"

- [ ] **Step 3: Write minimal implementation**

Create `scripts/assets/gpu3d-client.js`:

```js
const fs = require('node:fs');
const path = require('node:path');

const CONFIG_FILE = path.join(__dirname, '..', '..', 'gpu3d', 'api.txt');

function readGpu3dConfig(filePath = CONFIG_FILE) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const baseMatch = raw.match(/^\s*base\s*=\s*([^\r\n]+)/mi);
  const tokenMatch = raw.match(/^\s*token\s*=\s*([^\r\n]+)/mi);

  if (!baseMatch) throw new Error(`${filePath} 에서 base 를 찾지 못했습니다.`);
  if (!tokenMatch) throw new Error(`${filePath} 에서 token 를 찾지 못했습니다.`);

  return {
    base: baseMatch[1].trim().replace(/\/+$/, ''),
    token: tokenMatch[1].trim(),
  };
}

function authHeaders(config) {
  return { Authorization: `Bearer ${config.token}` };
}

async function errorMessage(response, fallback) {
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  const code = body && body.error && body.error.code;
  return `${fallback} (HTTP ${response.status}${code ? `, ${code}` : ''})`;
}

async function createJob(config, job, fetchImpl = fetch) {
  const form = new FormData();
  form.append('image', new Blob([job.imageBuffer]), job.fileName);
  form.append('kind', job.kind);
  form.append('name', job.name);
  form.append('polycount', String(job.polycount));
  form.append('heightM', String(job.heightM));

  const response = await fetchImpl(`${config.base}/jobs`, {
    method: 'POST',
    headers: authHeaders(config),
    body: form,
  });

  if (!response.ok) throw new Error(await errorMessage(response, '작업 생성 실패'));
  const body = await response.json();
  if (!body.jobId) throw new Error('작업 생성 응답에 jobId 가 없습니다.');
  return body.jobId;
}

async function pollJob(config, jobId, fetchImpl = fetch) {
  const response = await fetchImpl(`${config.base}/jobs/${jobId}`, { headers: authHeaders(config) });
  if (!response.ok) throw new Error(await errorMessage(response, '작업 조회 실패'));
  return response.json();
}

async function downloadResult(config, jobId, fetchImpl = fetch) {
  const response = await fetchImpl(`${config.base}/jobs/${jobId}/result`, { headers: authHeaders(config) });
  if (!response.ok) throw new Error(await errorMessage(response, '결과 내려받기 실패'));
  return Buffer.from(await response.arrayBuffer());
}

async function waitForJob(config, jobId, fetchImpl = fetch, options = {}) {
  const intervalMs = options.intervalMs ?? 3000;
  const timeoutMs = options.timeoutMs ?? 15 * 60 * 1000;
  const sleep = options.sleep || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const nowFn = options.nowFn || Date.now;
  const started = nowFn();

  for (;;) {
    const job = await pollJob(config, jobId, fetchImpl);
    if (job.status === 'done') return downloadResult(config, jobId, fetchImpl);
    if (job.status === 'failed') {
      const code = job.error && job.error.code ? job.error.code : 'UNKNOWN';
      throw new Error(`작업 실패: ${code}`);
    }
    if (nowFn() - started >= timeoutMs) {
      throw new Error(`작업 ${jobId} 대기 시간이 초과되었습니다.`);
    }
    await sleep(intervalMs);
  }
}

module.exports = {
  CONFIG_FILE,
  createJob,
  downloadResult,
  pollJob,
  readGpu3dConfig,
  waitForJob,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/gpu3d-client.test.js`
Expected: PASS, 9 tests

- [ ] **Step 5: Ignore the credential directory**

Append to `.gitignore`:

```
gpu3d/
```

Verify it is ignored: `git check-ignore -v gpu3d/api.txt`
Expected: a line naming `.gitignore` and the `gpu3d/` pattern.

- [ ] **Step 6: Commit**

```bash
git add scripts/assets/gpu3d-client.js tests/gpu3d-client.test.js .gitignore
git commit -m "feat: add gpu3d job client for asset pipeline"
```

---

### Task 2: GLB 텍스처 최적화

TRELLIS가 돌려주는 GLB는 1024px PNG 텍스처를 품고 있어 인형 1개가 1MB를 넘는다. 예산 0.3MB에 맞추려면 텍스처를 512px WebP로 바꿔야 한다. GLB는 헤더 12바이트 뒤에 JSON 청크와 BIN 청크가 오는 단순한 형식이라 외부 라이브러리 없이 다룰 수 있다.

**Files:**
- Create: `scripts/assets/glb-optimize.js`
- Create: `tests/glb-optimize.test.js`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `parseGlb(buffer) -> {json: object, bin: Buffer}`
  - `buildGlb({json, bin}) -> Buffer`
  - `convertImageBuffer(buffer, {maxSize, quality, pythonBin}) -> Buffer` (WebP 바이트)
  - `optimizeGlb(buffer, {maxSize, quality, convert}) -> {buffer: Buffer, images: number}`

- [ ] **Step 1: Write the failing test**

Create `tests/glb-optimize.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/glb-optimize.test.js`
Expected: FAIL with "Cannot find module '../scripts/assets/glb-optimize'"

- [ ] **Step 3: Write minimal implementation**

Create `scripts/assets/glb-optimize.js`:

```js
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

function optimizeGlb(buffer, options = {}) {
  const convert = options.convert
    || ((bytes) => convertImageBuffer(bytes, options));
  const { json, bin } = parseGlb(buffer);
  const images = Array.isArray(json.images) ? json.images : [];

  if (images.length === 0) return { buffer: buildGlb({ json, bin }), images: 0 };

  const replacements = new Map();
  for (const image of images) {
    if (typeof image.bufferView !== 'number') {
      throw new Error('bufferView 가 아닌 이미지(data URI 등)는 지원하지 않습니다.');
    }
    const view = json.bufferViews[image.bufferView];
    const bytes = bin.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
    replacements.set(image.bufferView, convert(Buffer.from(bytes)));
    image.mimeType = 'image/webp';
  }

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

  const nextBin = Buffer.concat(chunks);
  json.buffers[0].byteLength = nextBin.length;

  return { buffer: buildGlb({ json, bin: nextBin }), images: images.length };
}

module.exports = {
  buildGlb,
  convertImageBuffer,
  optimizeGlb,
  parseGlb,
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/glb-optimize.test.js`
Expected: PASS, 7 tests

- [ ] **Step 5: Commit**

```bash
git add scripts/assets/glb-optimize.js tests/glb-optimize.test.js
git commit -m "feat: shrink GLB textures to WebP for asset budget"
```

---

### Task 3: 쿠팡 딥링크 모듈

`scripts/coupang-shorten-links.js`는 CLI 전용이라 import할 수 없다. 파이프라인이 쓸 수 있게 재사용 가능한 모듈로 분리하고, subId를 붙이는 책임을 여기에 둔다.

**Files:**
- Create: `scripts/coupang-deeplink.js`
- Create: `tests/coupang-deeplink.test.js`

**Interfaces:**
- Consumes: `readCredentials` from `scripts/coupang-search-products.js`
- Produces:
  - `appendSubId(url, subId) -> string`
  - `createDeeplinks(urls, subId, requestImpl) -> Promise<Array<{originalUrl, shortenUrl}>>`

- [ ] **Step 1: Write the failing test**

Create `tests/coupang-deeplink.test.js`:

```js
const assert = require('node:assert/strict');
const test = require('node:test');

const { appendSubId, createDeeplinks } = require('../scripts/coupang-deeplink');

test('appendSubId adds the parameter to a bare URL', () => {
  assert.equal(
    appendSubId('https://link.coupang.com/a/abc', 'clawgame'),
    'https://link.coupang.com/a/abc?subId=clawgame',
  );
});

test('appendSubId keeps existing query parameters', () => {
  assert.equal(
    appendSubId('https://link.coupang.com/a/abc?x=1', 'clawgame'),
    'https://link.coupang.com/a/abc?x=1&subId=clawgame',
  );
});

test('appendSubId replaces an existing subId', () => {
  assert.equal(
    appendSubId('https://link.coupang.com/a/abc?subId=old', 'clawgame'),
    'https://link.coupang.com/a/abc?subId=clawgame',
  );
});

test('appendSubId returns the url unchanged when subId is empty', () => {
  assert.equal(appendSubId('https://link.coupang.com/a/abc', ''), 'https://link.coupang.com/a/abc');
});

test('createDeeplinks sends the urls and appends subId to the results', async () => {
  let seenBody = null;
  const requestImpl = async (body) => {
    seenBody = JSON.parse(body);
    return {
      rCode: '0',
      data: [
        { originalUrl: 'https://www.coupang.com/vp/products/1', shortenUrl: 'https://link.coupang.com/a/one' },
        { originalUrl: 'https://www.coupang.com/vp/products/2', shortenUrl: 'https://link.coupang.com/a/two' },
      ],
    };
  };

  const result = await createDeeplinks(
    ['https://www.coupang.com/vp/products/1', 'https://www.coupang.com/vp/products/2'],
    'clawgame',
    requestImpl,
  );

  assert.deepEqual(seenBody, {
    coupangUrls: ['https://www.coupang.com/vp/products/1', 'https://www.coupang.com/vp/products/2'],
  });
  assert.deepEqual(result, [
    { originalUrl: 'https://www.coupang.com/vp/products/1', shortenUrl: 'https://link.coupang.com/a/one?subId=clawgame' },
    { originalUrl: 'https://www.coupang.com/vp/products/2', shortenUrl: 'https://link.coupang.com/a/two?subId=clawgame' },
  ]);
});

test('createDeeplinks throws when the API reports a failure', async () => {
  const requestImpl = async () => ({ rCode: '400', rMessage: 'url convert failed' });
  await assert.rejects(
    () => createDeeplinks(['https://www.coupang.com/vp/products/1'], 'clawgame', requestImpl),
    /url convert failed/,
  );
});

test('createDeeplinks returns an empty list without calling the API', async () => {
  const requestImpl = async () => { throw new Error('호출되면 안 됨'); };
  assert.deepEqual(await createDeeplinks([], 'clawgame', requestImpl), []);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/coupang-deeplink.test.js`
Expected: FAIL with "Cannot find module '../scripts/coupang-deeplink'"

- [ ] **Step 3: Write minimal implementation**

Create `scripts/coupang-deeplink.js`:

```js
const crypto = require('node:crypto');
const https = require('node:https');
const path = require('node:path');

const { readCredentials } = require('./coupang-search-products');

const API_FILE = path.join(__dirname, '..', 'coupang', 'api.txt');
const API_HOST = 'api-gateway.coupang.com';
const API_PATH = '/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink';
const METHOD = 'POST';

function appendSubId(url, subId) {
  if (!subId) return url;
  const parsed = new URL(url);
  parsed.searchParams.set('subId', subId);
  return parsed.toString();
}

function buildSignedDate() {
  const now = new Date();
  const y = String(now.getUTCFullYear()).slice(2);
  const mo = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const h = String(now.getUTCHours()).padStart(2, '0');
  const mi = String(now.getUTCMinutes()).padStart(2, '0');
  const s = String(now.getUTCSeconds()).padStart(2, '0');
  return `${y}${mo}${d}T${h}${mi}${s}Z`;
}

function requestJson(body) {
  const { accessKey, secretKey } = readCredentials(API_FILE);
  const signedDate = buildSignedDate();
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(`${signedDate}${METHOD}${API_PATH}`, 'utf8')
    .digest('hex');
  const authorization = `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${signedDate}, signature=${signature}`;

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: API_HOST,
      path: API_PATH,
      method: METHOD,
      headers: {
        Authorization: authorization,
        'Content-Type': 'application/json;charset=UTF-8',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function createDeeplinks(urls, subId, requestImpl = requestJson) {
  if (!urls || urls.length === 0) return [];

  const data = await requestImpl(JSON.stringify({ coupangUrls: urls }));
  if (!data || data.rCode !== '0') {
    throw new Error(`딥링크 생성 실패: ${(data && data.rMessage) || JSON.stringify(data)}`);
  }

  return (data.data || []).map((entry) => ({
    originalUrl: entry.originalUrl,
    shortenUrl: appendSubId(entry.shortenUrl, subId),
  }));
}

module.exports = { appendSubId, createDeeplinks };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/coupang-deeplink.test.js`
Expected: PASS, 7 tests

- [ ] **Step 5: Commit**

```bash
git add scripts/coupang-deeplink.js tests/coupang-deeplink.test.js
git commit -m "feat: add reusable Coupang deeplink module with subId"
```

---

### Task 4: 테마 매니페스트 빌더

**Files:**
- Create: `scripts/assets/theme-manifest.js`
- Create: `tests/theme-manifest.test.js`
- Create: `scripts/assets/themes.json`

**Interfaces:**
- Consumes: `appendSubId` from `scripts/coupang-deeplink.js`
- Produces:
  - `pickProduct(items, {minPrice, maxPrice, requireKeyword}) -> item | null`
  - `buildManifestEntry({char, name, product, deeplink, asOfDate}) -> object`
  - `buildManifest({theme, entries, asOfDate}) -> object`

`scripts/assets/themes.json`은 캐릭터 키를 쿠팡 검색어로 잇는 표다. 상품을 못 찾은 캐릭터는 매니페스트에서 빠지고 게임은 procedural 을 유지한다.

- [ ] **Step 1: Write the failing test**

Create `tests/theme-manifest.test.js`:

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { pickProduct, buildManifestEntry, buildManifest } = require('../scripts/assets/theme-manifest');

const root = path.join(__dirname, '..');

const ITEMS = [
  { rank: 1, productName: '키링 도라에몽 미니', productPrice: 3900, isRocket: true, productId: 1, productImage: 'a.jpg', productUrl: 'u1' },
  { rank: 2, productName: '도라에몽 정품 봉제인형 30cm', productPrice: 24900, isRocket: true, productId: 2, productImage: 'b.jpg', productUrl: 'u2' },
  { rank: 3, productName: '도라에몽 인형 대형 80cm', productPrice: 89000, isRocket: false, productId: 3, productImage: 'c.jpg', productUrl: 'u3' },
];

test('pickProduct takes the best-ranked item inside the price band', () => {
  const picked = pickProduct(ITEMS, { minPrice: 8000, maxPrice: 60000, requireKeyword: '인형' });
  assert.equal(picked.productId, 2);
});

test('pickProduct skips items missing the required keyword', () => {
  const picked = pickProduct(ITEMS, { minPrice: 1000, maxPrice: 100000, requireKeyword: '봉제' });
  assert.equal(picked.productId, 2);
});

test('pickProduct prefers rocket delivery when ranks tie on price band', () => {
  const items = [
    { rank: 5, productName: '인형 A', productPrice: 20000, isRocket: false, productId: 10 },
    { rank: 5, productName: '인형 B', productPrice: 20000, isRocket: true, productId: 11 },
  ];
  assert.equal(pickProduct(items, { minPrice: 1000, maxPrice: 100000, requireKeyword: '인형' }).productId, 11);
});

test('pickProduct returns null when nothing matches', () => {
  assert.equal(pickProduct(ITEMS, { minPrice: 200000, maxPrice: 300000, requireKeyword: '인형' }), null);
});

test('pickProduct returns null for an empty list', () => {
  assert.equal(pickProduct([], { minPrice: 0, maxPrice: 1e9, requireKeyword: '' }), null);
});

test('buildManifestEntry carries product facts and the deeplink', () => {
  const entry = buildManifestEntry({
    char: 'doraemon',
    name: '도라에몽',
    product: ITEMS[1],
    deeplink: 'https://link.coupang.com/a/xyz?subId=clawgame',
    asOfDate: '2026-10-15',
  });

  assert.deepEqual(entry, {
    char: 'doraemon',
    name: '도라에몽',
    model: 'doraemon.glb',
    thumbnail: 'doraemon.webp',
    productName: '도라에몽 정품 봉제인형 30cm',
    price: 24900,
    priceLabel: '24,900원',
    priceAsOf: '2026-10-15',
    rocket: true,
    link: 'https://link.coupang.com/a/xyz?subId=clawgame',
  });
});

test('buildManifest keeps only entries that have a link', () => {
  const manifest = buildManifest({
    theme: 'doraemon',
    asOfDate: '2026-10-15',
    entries: [
      buildManifestEntry({ char: 'a', name: 'A', product: ITEMS[1], deeplink: 'https://link.coupang.com/a/1?subId=clawgame', asOfDate: '2026-10-15' }),
      { char: 'b', name: 'B', model: 'b.glb', thumbnail: 'b.webp', link: '' },
    ],
  });

  assert.equal(manifest.theme, 'doraemon');
  assert.equal(manifest.asOfDate, '2026-10-15');
  assert.equal(manifest.items.length, 1);
  assert.equal(manifest.items[0].char, 'a');
});

test('every manifest link carries subId=clawgame', () => {
  const manifest = buildManifest({
    theme: 'doraemon',
    asOfDate: '2026-10-15',
    entries: [buildManifestEntry({
      char: 'a', name: 'A', product: ITEMS[1],
      deeplink: 'https://link.coupang.com/a/1?subId=clawgame', asOfDate: '2026-10-15',
    })],
  });
  for (const item of manifest.items) {
    assert.match(item.link, /[?&]subId=clawgame(&|$)/);
  }
});

test('themes.json maps every PLUSHIE_THEMES char to a search keyword', () => {
  const themes = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'assets', 'themes.json'), 'utf8'));
  const game = fs.readFileSync(path.join(root, 'claw-machine.js'), 'utf8');
  const chars = [...game.matchAll(/char:\s*'([^']+)'/g)].map((m) => m[1]);

  assert.ok(chars.length >= 16);
  const mapped = new Set(Object.values(themes).flatMap((list) => list.map((entry) => entry.char)));
  for (const char of chars) {
    assert.ok(mapped.has(char), `themes.json 에 ${char} 가 없습니다.`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/theme-manifest.test.js`
Expected: FAIL with "Cannot find module '../scripts/assets/theme-manifest'"

- [ ] **Step 3: Write minimal implementation**

Create `scripts/assets/theme-manifest.js`:

```js
function formatPriceLabel(price) {
  return `${Number(price).toLocaleString('ko-KR')}원`;
}

function pickProduct(items, { minPrice = 0, maxPrice = Infinity, requireKeyword = '' } = {}) {
  const candidates = (items || []).filter((item) => {
    const price = Number(item.productPrice);
    if (!Number.isFinite(price) || price < minPrice || price > maxPrice) return false;
    if (requireKeyword && !String(item.productName || '').includes(requireKeyword)) return false;
    return true;
  });

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    if (a.rank !== b.rank) return a.rank - b.rank;
    return (b.isRocket ? 1 : 0) - (a.isRocket ? 1 : 0);
  });

  return candidates[0];
}

function buildManifestEntry({ char, name, product, deeplink, asOfDate }) {
  return {
    char,
    name,
    model: `${char}.glb`,
    thumbnail: `${char}.webp`,
    productName: product.productName,
    price: Number(product.productPrice),
    priceLabel: formatPriceLabel(product.productPrice),
    priceAsOf: asOfDate,
    rocket: Boolean(product.isRocket),
    link: deeplink,
  };
}

function buildManifest({ theme, entries, asOfDate }) {
  return {
    theme,
    asOfDate,
    items: (entries || []).filter((entry) => entry && entry.link),
  };
}

module.exports = { buildManifest, buildManifestEntry, formatPriceLabel, pickProduct };
```

- [ ] **Step 4: Write the theme keyword table**

Read the character list first so nothing is missed:

```bash
grep -o "char:'[a-z]*'\|char: '[a-z]*'" claw-machine.js | sed "s/.*'\(.*\)'/\1/" | sort -u
```

Create `scripts/assets/themes.json` covering every char the command printed. Each entry needs `char`, `name`, `keyword` (쿠팡 검색어), `requireKeyword`, `minPrice`, `maxPrice`:

```json
{
  "shinchan": [
    { "char": "shin", "name": "짱구", "keyword": "짱구 인형 정품", "requireKeyword": "인형", "minPrice": 8000, "maxPrice": 80000 },
    { "char": "himawari", "name": "짱아", "keyword": "짱구는 못말려 짱아 인형", "requireKeyword": "인형", "minPrice": 8000, "maxPrice": 80000 }
  ],
  "cinnamoroll": [
    { "char": "cinna", "name": "시나모롤", "keyword": "산리오 시나모롤 인형 정품", "requireKeyword": "인형", "minPrice": 8000, "maxPrice": 80000 },
    { "char": "mocha", "name": "모카", "keyword": "산리오 모카 인형", "requireKeyword": "인형", "minPrice": 8000, "maxPrice": 80000 },
    { "char": "espresso", "name": "에스프레소", "keyword": "산리오 에스프레소 인형", "requireKeyword": "인형", "minPrice": 8000, "maxPrice": 80000 }
  ],
  "dino": [
    { "char": "trex", "name": "티라노", "keyword": "티라노사우루스 공룡 인형", "requireKeyword": "인형", "minPrice": 8000, "maxPrice": 80000 },
    { "char": "trice", "name": "트리케라", "keyword": "트리케라톱스 공룡 인형", "requireKeyword": "인형", "minPrice": 8000, "maxPrice": 80000 },
    { "char": "brachi", "name": "브라키오", "keyword": "브라키오사우루스 공룡 인형", "requireKeyword": "인형", "minPrice": 8000, "maxPrice": 80000 },
    { "char": "stego", "name": "스테고", "keyword": "스테고사우루스 공룡 인형", "requireKeyword": "인형", "minPrice": 8000, "maxPrice": 80000 },
    { "char": "ptera", "name": "프테라", "keyword": "프테라노돈 공룡 인형", "requireKeyword": "인형", "minPrice": 8000, "maxPrice": 80000 },
    { "char": "baby", "name": "아기공룡", "keyword": "아기 공룡 인형", "requireKeyword": "인형", "minPrice": 8000, "maxPrice": 80000 }
  ],
  "maenggu": [
    { "char": "maenggu", "name": "맹구", "keyword": "짱구는 못말려 맹구 인형", "requireKeyword": "인형", "minPrice": 8000, "maxPrice": 80000 }
  ],
  "hangyodon": [
    { "char": "hangyodon", "name": "한교동", "keyword": "산리오 한교동 인형 정품", "requireKeyword": "인형", "minPrice": 8000, "maxPrice": 80000 }
  ],
  "doraemon": [
    { "char": "doraemon", "name": "도라에몽", "keyword": "도라에몽 인형 정품", "requireKeyword": "인형", "minPrice": 8000, "maxPrice": 80000 }
  ],
  "loopy": [
    { "char": "loopy", "name": "루피", "keyword": "뽀로로 루피 인형 정품", "requireKeyword": "인형", "minPrice": 8000, "maxPrice": 80000 },
    { "char": "pororo", "name": "뽀로로", "keyword": "뽀로로 인형 정품", "requireKeyword": "인형", "minPrice": 8000, "maxPrice": 80000 }
  ]
}
```

위 `grep` 결과에 여기 없는 char 가 나오면 그 테마와 항목을 같은 모양으로 추가한다. 테스트가 누락을 잡는다.

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/theme-manifest.test.js`
Expected: PASS, 9 tests

- [ ] **Step 6: Commit**

```bash
git add scripts/assets/theme-manifest.js scripts/assets/themes.json tests/theme-manifest.test.js
git commit -m "feat: build theme manifests from Coupang product picks"
```

---

### Task 5: 런타임 모델 수학 (순수 함수)

브라우저 모듈은 Node 테스트에서 `three` 를 못 읽는다. 그래서 수학과 판단 로직을 `three` 의존 없는 파일로 떼어 내고, 테스트는 여기에 건다. Review Focus 1·2가 이 Task 에서 닫힌다.

**Files:**
- Create: `assets/plushie-model-utils.js`
- Create: `tests/plushie-model-utils.test.js`

**Interfaces:**
- Consumes: 없음
- Produces (ES module, 브라우저와 Node 공용):
  - `normalizeTransform(box, targetDiameter) -> {scale, offset:{x,y,z}} | null`
  - `manifestUrl(theme) -> string`
  - `modelUrl(theme, entry) -> string`
  - `thumbnailUrl(theme, entry) -> string`
  - `findEntry(manifest, char) -> entry | null`
  - `isUsableManifest(value) -> boolean`

- [ ] **Step 1: Write the failing test**

Create `tests/plushie-model-utils.test.js`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/plushie-model-utils.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

Create `assets/plushie-model-utils.js`:

```js
// three.js 에 기대지 않는 순수 함수만 둔다. Node 테스트와 브라우저가 같은 파일을 읽는다.

const MODEL_ROOT = 'assets/models';

function finite(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function normalizeTransform(box, targetDiameter) {
  if (!box || !box.min || !box.max) return null;
  if (!finite(targetDiameter) || targetDiameter <= 0) return null;

  const { min, max } = box;
  const coords = [min.x, min.y, min.z, max.x, max.y, max.z];
  if (!coords.every(finite)) return null;

  const size = { x: max.x - min.x, y: max.y - min.y, z: max.z - min.z };
  const longest = Math.max(size.x, size.y, size.z);
  if (!finite(longest) || longest <= 0) return null;

  return {
    scale: targetDiameter / longest,
    offset: {
      x: -(min.x + max.x) / 2,
      y: -(min.y + max.y) / 2,
      z: -(min.z + max.z) / 2,
    },
  };
}

export function manifestUrl(theme) {
  return `${MODEL_ROOT}/${theme}/manifest.json`;
}

export function modelUrl(theme, entry) {
  return `${MODEL_ROOT}/${theme}/${entry.model}`;
}

export function thumbnailUrl(theme, entry) {
  return `${MODEL_ROOT}/${theme}/${entry.thumbnail}`;
}

export function findEntry(manifest, char) {
  if (!manifest || !Array.isArray(manifest.items)) return null;
  return manifest.items.find((item) => item.char === char) || null;
}

export function isUsableManifest(value) {
  return Boolean(value)
    && typeof value === 'object'
    && typeof value.theme === 'string'
    && Array.isArray(value.items);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/plushie-model-utils.test.js`
Expected: PASS, 10 tests

- [ ] **Step 5: Commit**

```bash
git add assets/plushie-model-utils.js tests/plushie-model-utils.test.js
git commit -m "feat: add plushie model normalization helpers"
```

---

### Task 6: 테마 모델 로더

Review Focus 3(로딩 중 테마 재전환)이 이 Task 에서 닫힌다. 로더는 세대 번호(generation)를 들고 있다가, 도착한 응답이 현재 세대가 아니면 버린다.

**Files:**
- Create: `assets/plushie-loader.js`
- Create: `tests/plushie-loader.test.js`

**Interfaces:**
- Consumes: `isUsableManifest`, `manifestUrl` from `assets/plushie-model-utils.js`
- Produces:
  - `createThemeLoader({fetchImpl, loadModel, onError}) -> loader`
  - `loader.load(theme) -> Promise<{theme, manifest, models: Map<char, object>} | null>`
  - `loader.current() -> string | null`

`loadModel(url)` 은 GLTFLoader 를 감싼 콜백으로, Task 7 에서 실제 three.js 구현을 끼운다. 테스트는 가짜를 넣는다.

- [ ] **Step 1: Write the failing test**

Create `tests/plushie-loader.test.js`:

```js
const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const modulePath = pathToFileURL(path.join(__dirname, '..', 'assets', 'plushie-loader.js')).href;
const load = () => import(modulePath);

const MANIFEST = {
  theme: 'dino',
  asOfDate: '2026-10-15',
  items: [
    { char: 'trex', name: '티라노', model: 'trex.glb', thumbnail: 'trex.webp', link: 'https://link.coupang.com/a/1?subId=clawgame' },
    { char: 'stego', name: '스테고', model: 'stego.glb', thumbnail: 'stego.webp', link: 'https://link.coupang.com/a/2?subId=clawgame' },
  ],
};

function okFetch(manifest = MANIFEST) {
  return async () => ({ ok: true, status: 200, json: async () => manifest });
}

test('load returns the manifest and one model per item', async () => {
  const { createThemeLoader } = await load();
  const seen = [];
  const loader = createThemeLoader({
    fetchImpl: okFetch(),
    loadModel: async (url) => { seen.push(url); return { url }; },
  });

  const result = await loader.load('dino');
  assert.equal(result.theme, 'dino');
  assert.equal(result.models.size, 2);
  assert.deepEqual(result.models.get('trex'), { url: 'assets/models/dino/trex.glb' });
  assert.deepEqual(seen, ['assets/models/dino/trex.glb', 'assets/models/dino/stego.glb']);
});

test('load returns null when the manifest request fails', async () => {
  const { createThemeLoader } = await load();
  const errors = [];
  const loader = createThemeLoader({
    fetchImpl: async () => ({ ok: false, status: 404, json: async () => ({}) }),
    loadModel: async () => { throw new Error('호출되면 안 됨'); },
    onError: (error) => errors.push(error),
  });

  assert.equal(await loader.load('dino'), null);
  assert.equal(errors.length, 1);
});

test('load returns null when fetch itself throws (offline)', async () => {
  const { createThemeLoader } = await load();
  const loader = createThemeLoader({
    fetchImpl: async () => { throw new TypeError('Failed to fetch'); },
    loadModel: async () => ({}),
  });
  assert.equal(await loader.load('dino'), null);
});

test('load returns null for a malformed manifest', async () => {
  const { createThemeLoader } = await load();
  const loader = createThemeLoader({
    fetchImpl: okFetch({ nope: true }),
    loadModel: async () => ({}),
  });
  assert.equal(await loader.load('dino'), null);
});

test('load keeps the models that succeeded when one model fails', async () => {
  const { createThemeLoader } = await load();
  const loader = createThemeLoader({
    fetchImpl: okFetch(),
    loadModel: async (url) => {
      if (url.endsWith('stego.glb')) throw new Error('500');
      return { url };
    },
  });

  const result = await loader.load('dino');
  assert.equal(result.models.size, 1);
  assert.ok(result.models.has('trex'));
  assert.ok(!result.models.has('stego'));
});

test('a stale theme load resolves to null after a newer load starts', async () => {
  const { createThemeLoader } = await load();
  let releaseDino;
  const gate = new Promise((resolve) => { releaseDino = resolve; });

  const loader = createThemeLoader({
    fetchImpl: async (url) => ({
      ok: true,
      status: 200,
      json: async () => (url.includes('/dino/') ? MANIFEST : { ...MANIFEST, theme: 'loopy', items: [] }),
    }),
    loadModel: async (url) => {
      if (url.includes('/dino/')) await gate;
      return { url };
    },
  });

  const slow = loader.load('dino');
  const fast = await loader.load('loopy');
  releaseDino();

  assert.equal(await slow, null, '늦게 끝난 이전 테마는 버려져야 한다');
  assert.equal(fast.theme, 'loopy');
  assert.equal(loader.current(), 'loopy');
});

test('current reports the active theme', async () => {
  const { createThemeLoader } = await load();
  const loader = createThemeLoader({ fetchImpl: okFetch(), loadModel: async () => ({}) });
  assert.equal(loader.current(), null);
  await loader.load('dino');
  assert.equal(loader.current(), 'dino');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/plushie-loader.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

Create `assets/plushie-loader.js`:

```js
import { isUsableManifest, manifestUrl, modelUrl } from './plushie-model-utils.js';

export function createThemeLoader({ fetchImpl = fetch, loadModel, onError = () => {} } = {}) {
  let generation = 0;
  let activeTheme = null;

  async function load(theme) {
    const mine = ++generation;
    activeTheme = theme;

    let manifest = null;
    try {
      const response = await fetchImpl(manifestUrl(theme));
      if (!response.ok) throw new Error(`매니페스트 응답 ${response.status}`);
      manifest = await response.json();
    } catch (error) {
      onError(error);
      return null;
    }

    if (!isUsableManifest(manifest)) {
      onError(new Error(`${theme} 매니페스트 형식이 올바르지 않습니다.`));
      return null;
    }
    if (mine !== generation) return null;

    const models = new Map();
    for (const entry of manifest.items) {
      try {
        const model = await loadModel(modelUrl(theme, entry));
        if (mine !== generation) return null;
        models.set(entry.char, model);
      } catch (error) {
        onError(error);
      }
    }

    if (mine !== generation) return null;
    return { theme, manifest, models };
  }

  return { load, current: () => activeTheme };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/plushie-loader.test.js`
Expected: PASS, 7 tests

- [ ] **Step 5: Commit**

```bash
git add assets/plushie-loader.js tests/plushie-loader.test.js
git commit -m "feat: load theme models with stale-response guarding"
```

---

### Task 7: 파이프라인 오케스트레이터 CLI

**Files:**
- Create: `scripts/assets/build-theme-assets.js`
- Create: `tests/build-theme-assets.test.js`

**Interfaces:**
- Consumes: `waitForJob`/`createJob`/`readGpu3dConfig` (Task 1), `optimizeGlb` (Task 2), `createDeeplinks` (Task 3), `pickProduct`/`buildManifestEntry`/`buildManifest` (Task 4), `searchProducts` from `scripts/coupang-search-products.js`
- Produces:
  - `buildTheme(theme, deps, options) -> Promise<{manifest, written: string[], skipped: Array<{char, reason}>}>`
  - `checkBudget(sizes, limits) -> {ok: boolean, violations: string[]}`

- [ ] **Step 1: Write the failing test**

Create `tests/build-theme-assets.test.js`:

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { buildTheme, checkBudget } = require('../scripts/assets/build-theme-assets');

function tempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'claw-assets-'));
}

const THEMES = {
  dino: [
    { char: 'trex', name: '티라노', keyword: '티라노 인형', requireKeyword: '인형', minPrice: 1000, maxPrice: 90000 },
    { char: 'stego', name: '스테고', keyword: '스테고 인형', requireKeyword: '인형', minPrice: 1000, maxPrice: 90000 },
  ],
};

function deps(overrides = {}) {
  return {
    themes: THEMES,
    searchProducts: async ({ keyword }) => ({
      items: [{
        rank: 1,
        productName: `${keyword} 봉제`,
        productPrice: 25000,
        isRocket: true,
        productId: keyword.length,
        productImage: `https://img.test/${keyword}.jpg`,
        productUrl: `https://www.coupang.com/vp/products/${keyword.length}`,
      }],
    }),
    downloadImage: async () => Buffer.from('png'),
    generateModel: async () => Buffer.from('glb-bytes'),
    optimizeGlb: (buffer) => ({ buffer: Buffer.concat([buffer, Buffer.from('-opt')]), images: 1 }),
    makeThumbnail: async () => Buffer.from('webp'),
    createDeeplinks: async (urls) => urls.map((url, i) => ({
      originalUrl: url,
      shortenUrl: `https://link.coupang.com/a/s${i}?subId=clawgame`,
    })),
    ...overrides,
  };
}

test('buildTheme writes a glb, a thumbnail and a manifest per character', async () => {
  const out = tempDir();
  const result = await buildTheme('dino', deps(), { outDir: out, asOfDate: '2026-10-15' });

  assert.equal(result.manifest.items.length, 2);
  assert.equal(result.skipped.length, 0);
  assert.ok(fs.existsSync(path.join(out, 'dino', 'trex.glb')));
  assert.ok(fs.existsSync(path.join(out, 'dino', 'trex.webp')));

  const manifest = JSON.parse(fs.readFileSync(path.join(out, 'dino', 'manifest.json'), 'utf8'));
  assert.equal(manifest.theme, 'dino');
  assert.equal(manifest.asOfDate, '2026-10-15');
  for (const item of manifest.items) {
    assert.match(item.link, /[?&]subId=clawgame(&|$)/);
  }
});

test('buildTheme skips a character with no matching product', async () => {
  const out = tempDir();
  const result = await buildTheme('dino', deps({
    searchProducts: async ({ keyword }) => (keyword.includes('스테고') ? { items: [] } : {
      items: [{
        rank: 1, productName: '티라노 인형 봉제', productPrice: 25000, isRocket: true,
        productId: 1, productImage: 'https://img.test/a.jpg', productUrl: 'https://www.coupang.com/vp/products/1',
      }],
    }),
  }), { outDir: out, asOfDate: '2026-10-15' });

  assert.equal(result.manifest.items.length, 1);
  assert.deepEqual(result.skipped, [{ char: 'stego', reason: '조건에 맞는 상품 없음' }]);
  assert.ok(!fs.existsSync(path.join(out, 'dino', 'stego.glb')));
});

test('buildTheme skips a character whose model generation fails', async () => {
  const out = tempDir();
  const result = await buildTheme('dino', deps({
    generateModel: async (_buf, entry) => {
      if (entry.char === 'trex') throw new Error('OOM');
      return Buffer.from('glb-bytes');
    },
  }), { outDir: out, asOfDate: '2026-10-15' });

  assert.equal(result.manifest.items.length, 1);
  assert.equal(result.manifest.items[0].char, 'stego');
  assert.equal(result.skipped[0].char, 'trex');
  assert.match(result.skipped[0].reason, /OOM/);
});

test('buildTheme throws for an unknown theme', async () => {
  await assert.rejects(
    () => buildTheme('nope', deps(), { outDir: tempDir(), asOfDate: '2026-10-15' }),
    /nope/,
  );
});

test('checkBudget passes when every file is inside its limit', () => {
  const result = checkBudget(
    [{ name: 'dino/trex.glb', bytes: 200 * 1024 }, { name: 'dino/stego.glb', bytes: 250 * 1024 }],
    { perModel: 300 * 1024, perTheme: 1.8 * 1024 * 1024 },
  );
  assert.deepEqual(result, { ok: true, violations: [] });
});

test('checkBudget reports a model over the per-file limit', () => {
  const result = checkBudget(
    [{ name: 'dino/trex.glb', bytes: 400 * 1024 }],
    { perModel: 300 * 1024, perTheme: 1.8 * 1024 * 1024 },
  );
  assert.equal(result.ok, false);
  assert.match(result.violations[0], /dino\/trex\.glb/);
});

test('checkBudget reports a theme over the total limit', () => {
  const files = Array.from({ length: 8 }, (_, i) => ({ name: `dino/m${i}.glb`, bytes: 290 * 1024 }));
  const result = checkBudget(files, { perModel: 300 * 1024, perTheme: 1.8 * 1024 * 1024 });
  assert.equal(result.ok, false);
  assert.ok(result.violations.some((line) => /합계/.test(line)));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/build-theme-assets.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

Create `scripts/assets/build-theme-assets.js`:

```js
const fs = require('node:fs');
const path = require('node:path');

const { createJob, readGpu3dConfig, waitForJob } = require('./gpu3d-client');
const { optimizeGlb, convertImageBuffer } = require('./glb-optimize');
const { createDeeplinks } = require('../coupang-deeplink');
const { searchProducts } = require('../coupang-search-products');
const { buildManifest, buildManifestEntry, pickProduct } = require('./theme-manifest');

const SUB_ID = 'clawgame';
const POLYCOUNT = 8000;
const HEIGHT_M = 0.3;
const DEFAULT_OUT = path.join(__dirname, '..', '..', 'assets', 'models');

function checkBudget(sizes, limits) {
  const violations = [];
  let total = 0;

  for (const file of sizes) {
    total += file.bytes;
    if (file.bytes > limits.perModel) {
      violations.push(`${file.name} 이 ${Math.round(file.bytes / 1024)}KB 로 한도 ${Math.round(limits.perModel / 1024)}KB 를 넘습니다.`);
    }
  }
  if (total > limits.perTheme) {
    violations.push(`테마 합계 ${Math.round(total / 1024)}KB 가 한도 ${Math.round(limits.perTheme / 1024)}KB 를 넘습니다.`);
  }

  return { ok: violations.length === 0, violations };
}

async function downloadImageDefault(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`이미지 내려받기 실패 ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function generateModelDefault(imageBuffer, entry) {
  const config = readGpu3dConfig();
  const jobId = await createJob(config, {
    imageBuffer,
    fileName: `${entry.char}.png`,
    kind: 'prop',
    name: entry.char,
    polycount: POLYCOUNT,
    heightM: HEIGHT_M,
  });
  return waitForJob(config, jobId);
}

async function makeThumbnailDefault(imageBuffer) {
  return convertImageBuffer(imageBuffer, { maxSize: 160, quality: 82 });
}

async function buildTheme(theme, deps = {}, options = {}) {
  const themes = deps.themes
    || JSON.parse(fs.readFileSync(path.join(__dirname, 'themes.json'), 'utf8'));
  const entries = themes[theme];
  if (!entries) throw new Error(`알 수 없는 테마: ${theme}`);

  const search = deps.searchProducts || searchProducts;
  const download = deps.downloadImage || downloadImageDefault;
  const generate = deps.generateModel || generateModelDefault;
  const optimize = deps.optimizeGlb || ((buffer) => optimizeGlb(buffer, { maxSize: 512, quality: 80 }));
  const thumbnail = deps.makeThumbnail || makeThumbnailDefault;
  const deeplinks = deps.createDeeplinks || ((urls) => createDeeplinks(urls, SUB_ID));

  const outDir = path.join(options.outDir || DEFAULT_OUT, theme);
  fs.mkdirSync(outDir, { recursive: true });

  const picked = [];
  const skipped = [];

  for (const entry of entries) {
    try {
      // buildQueryString 이 limit 과 imageSize 를 항상 읽으므로 둘 다 준다.
      const found = await search({ keyword: entry.keyword, limit: 20, imageSize: '512x512' });
      const product = pickProduct(found.items, entry);
      if (!product) {
        skipped.push({ char: entry.char, reason: '조건에 맞는 상품 없음' });
        continue;
      }

      const image = await download(product.productImage);
      const raw = await generate(image, entry);
      const optimized = optimize(raw);

      fs.writeFileSync(path.join(outDir, `${entry.char}.glb`), optimized.buffer);
      fs.writeFileSync(path.join(outDir, `${entry.char}.webp`), await thumbnail(image));
      picked.push({ entry, product });
    } catch (error) {
      skipped.push({ char: entry.char, reason: error.message });
    }
  }

  const links = await deeplinks(picked.map(({ product }) => product.productUrl));
  const byOriginal = new Map(links.map((link) => [link.originalUrl, link.shortenUrl]));

  const manifest = buildManifest({
    theme,
    asOfDate: options.asOfDate,
    entries: picked.map(({ entry, product }) => buildManifestEntry({
      char: entry.char,
      name: entry.name,
      product,
      deeplink: byOriginal.get(product.productUrl) || '',
      asOfDate: options.asOfDate,
    })),
  });

  fs.writeFileSync(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  return {
    manifest,
    skipped,
    written: manifest.items.flatMap((item) => [
      path.join(outDir, item.model),
      path.join(outDir, item.thumbnail),
    ]),
  };
}

async function main() {
  const theme = process.argv[2];
  if (!theme) {
    console.error('사용법: node scripts/assets/build-theme-assets.js <theme>');
    process.exit(1);
  }

  const asOfDate = new Date().toISOString().slice(0, 10);
  const result = await buildTheme(theme, {}, { asOfDate });

  const sizes = result.written
    .filter((file) => file.endsWith('.glb'))
    .map((file) => ({ name: path.basename(file), bytes: fs.statSync(file).size }));
  const budget = checkBudget(sizes, { perModel: 300 * 1024, perTheme: 1.8 * 1024 * 1024 });

  console.log(`테마 ${theme}: 상품 ${result.manifest.items.length}개, 건너뜀 ${result.skipped.length}개`);
  for (const item of result.skipped) console.log(`  건너뜀 ${item.char}: ${item.reason}`);
  for (const size of sizes) console.log(`  ${size.name} ${Math.round(size.bytes / 1024)}KB`);
  if (!budget.ok) {
    for (const line of budget.violations) console.error(`  예산 초과: ${line}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { buildTheme, checkBudget };
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/build-theme-assets.test.js`
Expected: PASS, 7 tests

- [ ] **Step 5: Commit**

```bash
git add scripts/assets/build-theme-assets.js tests/build-theme-assets.test.js
git commit -m "feat: orchestrate theme asset build with budget check"
```

---

### Task 8: 게임에 모델 로딩 붙이기

여기서 처음으로 `claw-machine.js` 와 `claw-machine.html` 을 만진다. procedural 생성 코드는 지우지 않는다. 모델이 오면 그룹의 자식만 갈아 끼운다.

**Files:**
- Modify: `claw-machine.html` (importmap, 모듈 프리로드)
- Modify: `claw-machine.js` (로더 연결, 메시 교체)
- Create: `assets/plushie-three.js`
- Create: `tests/claw-machine-model-wiring.test.js`

**Interfaces:**
- Consumes: `createThemeLoader` (Task 6), `normalizeTransform`, `findEntry` (Task 5)
- Produces:
  - `createModelLoader(THREE, GLTFLoader) -> (url) => Promise<THREE.Object3D>`
  - `swapPlushieMesh(THREE, group, prototype, targetDiameter) -> boolean`

- [ ] **Step 1: Write the failing test**

`three` 없이 검증할 수 있는 것은 배선 사실이다. 교체 자체의 수학은 Task 5 가 이미 덮는다.

Create `tests/claw-machine-model-wiring.test.js`:

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const html = () => fs.readFileSync(path.join(root, 'claw-machine.html'), 'utf8');
const js = () => fs.readFileSync(path.join(root, 'claw-machine.js'), 'utf8');

test('importmap pins three and its addons to 0.162.0', () => {
  const source = html();
  assert.match(source, /"three":\s*"https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.162\.0\/build\/three\.module\.js"/);
  assert.match(source, /"three\/addons\/":\s*"https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.162\.0\/examples\/jsm\/"/);
});

test('the game imports the theme loader and the three glue', () => {
  const source = js();
  assert.match(source, /import\s*\{[^}]*createThemeLoader[^}]*\}\s*from\s*'\.\/assets\/plushie-loader\.js'/);
  assert.match(source, /from\s*'\.\/assets\/plushie-three\.js'/);
});

test('procedural createPlushie is kept as the fallback', () => {
  assert.match(js(), /function createPlushie\(/);
});

test('model swapping preserves userData used by the physics code', () => {
  const source = fs.readFileSync(path.join(root, 'assets', 'plushie-three.js'), 'utf8');
  // userData 를 다시 대입하거나 지우면 radius/char/theme 이 사라져 물리와 수집함이 깨진다.
  assert.doesNotMatch(source, /\.userData\s*=\s*\{/);
  assert.match(source, /normalizeTransform/);
});

test('the page still carries its SEO head and the partners disclosure', () => {
  const source = html();
  assert.match(source, /<title>[^<]*인형뽑기[^<]*<\/title>/);
  assert.match(source, /쿠팡 파트너스 활동의 일환으로 수수료를 제공받습니다/);
});

test('no banner image markup is left behind once cards replace it', () => {
  // Task 10 에서 카드로 바뀐 뒤에도 이 테스트가 지켜 준다.
  assert.doesNotMatch(html(), /image\d*\.coupangcdn\.com\/image\/affiliate\/banner/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/claw-machine-model-wiring.test.js`
Expected: FAIL — addons importmap 항목 없음, `plushie-three.js` 없음, 배너 마크업 남아 있음

- [ ] **Step 3: Write the three.js glue**

Create `assets/plushie-three.js`:

```js
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
```

- [ ] **Step 4: Add the addons importmap entry**

In `claw-machine.html`, replace the importmap script with:

```html
<script type="importmap">
{"imports":{
  "three":"https://cdn.jsdelivr.net/npm/three@0.162.0/build/three.module.js",
  "three/addons/":"https://cdn.jsdelivr.net/npm/three@0.162.0/examples/jsm/"
}}
</script>
```

- [ ] **Step 5: Wire the loader into the game**

In `claw-machine.js`, add after the existing `import * as THREE from 'three';`:

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createThemeLoader } from './assets/plushie-loader.js';
import { createModelLoader, swapPlushieMesh } from './assets/plushie-three.js';
import { findEntry } from './assets/plushie-model-utils.js';

let themeManifest = null;
const themeModels = new Map();

const themeLoader = createThemeLoader({
  loadModel: createModelLoader(THREE, GLTFLoader),
  onError: (error) => console.warn('[plushie] 모델 로딩 건너뜀:', error.message),
});

// 게임은 로딩을 기다리지 않는다. 도착하면 그때 메시만 바꾼다.
function applyLoadedTheme(result) {
  if (!result || result.theme !== currentTheme) return;
  themeManifest = result.manifest;
  themeModels.clear();
  for (const [char, model] of result.models) themeModels.set(char, model);

  for (const plushie of plushies) {
    const model = themeModels.get(plushie.userData.char);
    if (model) swapPlushieMesh(THREE, plushie, model, plushieScale * 2.4);
  }
}

function requestThemeModels() {
  themeLoader.load(currentTheme).then(applyLoadedTheme).catch(() => {});
}
```

Call `requestThemeModels()` on the line right after the first `spawnPlushies();` call at `claw-machine.js:1443`, and again inside the theme-switch handler at `claw-machine.js:1450-1455` right after the `spawnPlushies();` on line 1455. Do **not** add it to the `spawnPlushies()` at line 2333 (machine-size toggle) — the theme has not changed there and the models are already cached. In `createPlushie`, after `g.userData = {...}` at line 1260, add:

```js
  const loadedModel = themeModels.get(t.char);
  if (loadedModel) swapPlushieMesh(THREE, g, loadedModel, s * 2.4);
```

- [ ] **Step 6: Run test to verify it passes**

Run: `node --test tests/claw-machine-model-wiring.test.js`
Expected: 배너 테스트 1건만 FAIL (Task 10 이 닫는다), 나머지 PASS.

Mark the banner test skipped until Task 10 by changing that test's first line to `test('no banner image markup is left behind once cards replace it', { skip: 'Task 10 에서 켠다' }, () => {`.

Re-run: `node --test tests/claw-machine-model-wiring.test.js`
Expected: PASS, 5 tests + 1 skipped

- [ ] **Step 7: Verify in the browser**

Run: `node server.js`, open `http://localhost:3000/claw-machine.html`.
Expected: 게임이 즉시 시작되고 조작된다. 콘솔에 `[plushie] 모델 로딩 건너뜀: 매니페스트 응답 404` 가 보이고(아직 에셋이 없으므로 정상) 게임은 procedural 인형으로 정상 동작한다.

- [ ] **Step 8: Commit**

```bash
git add claw-machine.html claw-machine.js assets/plushie-three.js tests/claw-machine-model-wiring.test.js
git commit -m "feat: swap plushie meshes when theme models arrive"
```

---

### Task 9: 상품 카드와 수익 연결

Review Focus 4(`sessionStorage` 차단)와 5(매니페스트에 없는 캐릭터)가 이 Task 에서 닫힌다.

**Files:**
- Create: `assets/product-card.js`
- Create: `tests/product-card.test.js`
- Modify: `claw-machine.js`

**Interfaces:**
- Consumes: `findEntry` (Task 5)
- Produces:
  - `markSuccessCardShown(storage) -> boolean` (이번 세션에 처음이면 true)
  - `cardHtml(entry, {placement}) -> string`
  - `cardsHtml(items, {placement, limit}) -> string`

- [ ] **Step 1: Write the failing test**

Create `tests/product-card.test.js`:

```js
const assert = require('node:assert/strict');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

const modulePath = pathToFileURL(path.join(__dirname, '..', 'assets', 'product-card.js')).href;
const load = () => import(modulePath);

const ENTRY = {
  char: 'trex',
  name: '티라노',
  thumbnail: 'trex.webp',
  productName: '공룡 인형 티라노 40cm',
  priceLabel: '25,000원',
  priceAsOf: '2026-10-15',
  rocket: true,
  link: 'https://link.coupang.com/a/one?subId=clawgame',
};

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
  };
}

test('markSuccessCardShown is true once per session', async () => {
  const { markSuccessCardShown } = await load();
  const storage = memoryStorage();
  assert.equal(markSuccessCardShown(storage), true);
  assert.equal(markSuccessCardShown(storage), false);
  assert.equal(markSuccessCardShown(storage), false);
});

test('markSuccessCardShown returns false when storage reads throw', async () => {
  const { markSuccessCardShown } = await load();
  const blocked = {
    getItem() { throw new DOMException('blocked'); },
    setItem() { throw new DOMException('blocked'); },
  };
  assert.equal(markSuccessCardShown(blocked), false);
});

test('markSuccessCardShown returns false when storage is absent', async () => {
  const { markSuccessCardShown } = await load();
  assert.equal(markSuccessCardShown(null), false);
  assert.equal(markSuccessCardShown(undefined), false);
});

test('cardHtml renders name, price, as-of date and the link', async () => {
  const { cardHtml } = await load();
  const html = cardHtml(ENTRY, { placement: 'game_success' });
  assert.match(html, /공룡 인형 티라노 40cm/);
  assert.match(html, /25,000원/);
  assert.match(html, /2026-10-15 기준/);
  assert.match(html, /로켓배송/);
  assert.match(html, /href="https:\/\/link\.coupang\.com\/a\/one\?subId=clawgame"/);
  assert.match(html, /data-coupang-placement="game_success"/);
  assert.match(html, /rel="[^"]*nofollow[^"]*sponsored[^"]*"/);
  assert.match(html, /target="_blank"/);
});

test('cardHtml escapes HTML in product names', async () => {
  const { cardHtml } = await load();
  const html = cardHtml({ ...ENTRY, productName: '인형 <script>alert(1)</script>' }, { placement: 'game_success' });
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;script&gt;/);
});

test('cardHtml omits the rocket badge when the product is not rocket', async () => {
  const { cardHtml } = await load();
  assert.doesNotMatch(cardHtml({ ...ENTRY, rocket: false }, { placement: 'game_coin' }), /로켓배송/);
});

test('cardHtml returns an empty string for a missing entry or link', async () => {
  const { cardHtml } = await load();
  assert.equal(cardHtml(null, { placement: 'game_success' }), '');
  assert.equal(cardHtml({ ...ENTRY, link: '' }, { placement: 'game_success' }), '');
});

test('cardsHtml renders up to the limit and drops unusable entries', async () => {
  const { cardsHtml } = await load();
  const items = [ENTRY, { ...ENTRY, char: 'b' }, { ...ENTRY, char: 'c' }, { ...ENTRY, char: 'd', link: '' }];
  const html = cardsHtml(items, { placement: 'game_coin', limit: 3 });
  assert.equal((html.match(/data-coupang-link/g) || []).length, 3);
});

test('cardsHtml returns an empty string for an empty list', async () => {
  const { cardsHtml } = await load();
  assert.equal(cardsHtml([], { placement: 'game_coin', limit: 3 }), '');
  assert.equal(cardsHtml(null, { placement: 'game_coin', limit: 3 }), '');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/product-card.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Write minimal implementation**

Create `assets/product-card.js`:

```js
const SESSION_KEY = 'clawSuccessCardShown';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 시크릿 모드나 쿠키 차단에서 sessionStorage 접근은 던진다. 그때는 카드를 띄우지 않고 게임만 돌린다.
export function markSuccessCardShown(storage) {
  if (!storage) return false;
  try {
    if (storage.getItem(SESSION_KEY)) return false;
    storage.setItem(SESSION_KEY, '1');
    return true;
  } catch {
    return false;
  }
}

export function cardHtml(entry, { placement }) {
  if (!entry || !entry.link) return '';

  const rocket = entry.rocket ? '<span class="pc-rocket">로켓배송</span>' : '';
  return [
    `<a class="pc-card" href="${escapeHtml(entry.link)}" target="_blank"`,
    ' rel="nofollow sponsored noopener" referrerpolicy="unsafe-url" data-coupang-link',
    ` data-coupang-placement="${escapeHtml(placement)}" data-coupang-product-type="mini_claw">`,
    `<img class="pc-thumb" src="${escapeHtml(entry.thumbnail)}" alt="${escapeHtml(entry.name)}" loading="lazy">`,
    `<span class="pc-name">${escapeHtml(entry.productName)}</span>`,
    `<span class="pc-price">${escapeHtml(entry.priceLabel)}</span>`,
    `<span class="pc-asof">${escapeHtml(entry.priceAsOf)} 기준</span>`,
    rocket,
    '<span class="pc-cta">쿠팡에서 보기</span>',
    '</a>',
  ].join('');
}

export function cardsHtml(items, { placement, limit = 3 }) {
  if (!Array.isArray(items)) return '';
  return items
    .filter((entry) => entry && entry.link)
    .slice(0, limit)
    .map((entry) => cardHtml(entry, { placement }))
    .join('');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/product-card.test.js`
Expected: PASS, 9 tests

- [ ] **Step 5: Wire the cards into the game**

In `claw-machine.js`, import the helpers and store the thumbnail path resolved against the theme folder:

```js
import { cardHtml, cardsHtml, markSuccessCardShown } from './assets/product-card.js';
import { thumbnailUrl } from './assets/plushie-model-utils.js';

function entryForCard(char) {
  const entry = findEntry(themeManifest, char);
  if (!entry) return null;
  return { ...entry, thumbnail: thumbnailUrl(currentTheme, entry) };
}

function sessionStorageSafe() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function showSuccessCard(char) {
  const entry = entryForCard(char);
  if (!entry) return;
  if (!markSuccessCardShown(sessionStorageSafe())) return;

  const adFooter = document.getElementById('gameAdFooter');
  const bannerContainer = document.getElementById('bannerContainer');
  if (!adFooter || !bannerContainer) return;

  bannerContainer.dataset.bannerMode = 'success';
  bannerContainer.innerHTML = cardHtml(entry, { placement: 'game_success' });
  adFooter.classList.add('visible');
  triggerAdFooterFlyIn(adFooter);
}
```

At the win site (`claw-machine.js:2292`, right after `addToCollection(...)`), add:

```js
      showSuccessCard(p.userData.char);
```

- [ ] **Step 6: Replace the COIN banners with cards**

Replace the `FOOTER_TRIPLE_BANNERS_HTML` constant body with a function that renders from the manifest, falling back to nothing when the manifest has not arrived:

```js
function footerCardsHtml() {
  if (!themeManifest) return '';
  const items = themeManifest.items.map((entry) => ({
    ...entry,
    thumbnail: thumbnailUrl(currentTheme, entry),
  }));
  return cardsHtml(items, { placement: 'game_coin', limit: 3 });
}
```

Update `setRandomFooterBanner` so it uses `footerCardsHtml()` when it returns a non-empty string, and otherwise uses `FOOTER_IFRAME_BANNER_HTML`. Change the iframe URL's `subId=` to `subId=clawwidget`. Delete `FOOTER_TRIPLE_BANNERS_HTML` and the three `<a class="q-banner">` blocks in `claw-machine.html` (lines 128-136), leaving `#bannerContainer` empty.

- [ ] **Step 7: Add the card styles**

Add to the `<style>` block in `claw-machine.html`:

```css
.pc-card{display:flex;flex-direction:column;align-items:center;gap:4px;width:150px;padding:10px;
  background:#15151f;border:1px solid #333;border-radius:10px;color:#eee;text-decoration:none;font-size:12px}
.pc-thumb{width:120px;height:120px;object-fit:contain;border-radius:8px;background:#fff}
.pc-name{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-align:center;line-height:1.3}
.pc-price{color:#ff9900;font-weight:700;font-size:15px}
.pc-asof{color:#888;font-size:10px}
.pc-rocket{color:#00c3ff;font-size:11px}
.pc-cta{margin-top:4px;padding:6px 12px;background:#ff5722;border-radius:6px;font-weight:700}
@media (max-width:480px){.pc-card{width:46vw}.pc-thumb{width:100%;height:30vw}}
```

- [ ] **Step 8: Enable the banner-removal test**

Remove the `{ skip: ... }` argument added in Task 8 Step 6.

Run: `node --test tests/claw-machine-model-wiring.test.js tests/product-card.test.js`
Expected: PASS, 6 + 9 tests, no skips

- [ ] **Step 9: Commit**

```bash
git add claw-machine.html claw-machine.js assets/product-card.js tests/product-card.test.js tests/claw-machine-model-wiring.test.js
git commit -m "feat: show Coupang product cards on win and coin"
```

---

### Task 10: dino 테마 에셋 생성과 검증

첫 실제 생성이다. dino 는 타사 IP 가 아니므로 파이프라인 품질과 용량만 본다.

**Files:**
- Create: `gpu3d/api.txt` (커밋 안 함)
- Create: `assets/models/dino/*.glb`, `*.webp`, `manifest.json`
- Create: `tests/theme-assets-budget.test.js`

**Interfaces:**
- Consumes: `buildTheme`, `checkBudget` (Task 7)
- Produces: `assets/models/dino/manifest.json`

- [ ] **Step 1: Write the failing test**

Create `tests/theme-assets-budget.test.js`:

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const modelsRoot = path.join(root, 'assets', 'models');

const PER_MODEL = 300 * 1024;
const PER_THEME = 1.8 * 1024 * 1024;
const TOTAL = 4.8 * 1024 * 1024;

function themeDirs() {
  if (!fs.existsSync(modelsRoot)) return [];
  return fs.readdirSync(modelsRoot).filter((name) => fs.statSync(path.join(modelsRoot, name)).isDirectory());
}

test('at least the dino theme has been built', () => {
  assert.ok(themeDirs().includes('dino'), 'assets/models/dino 가 없습니다.');
});

test('every manifest is well formed and links carry subId=clawgame', () => {
  for (const theme of themeDirs()) {
    const manifest = JSON.parse(fs.readFileSync(path.join(modelsRoot, theme, 'manifest.json'), 'utf8'));
    assert.equal(manifest.theme, theme);
    assert.match(manifest.asOfDate, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(manifest.items.length > 0, `${theme} 매니페스트가 비었습니다.`);

    for (const item of manifest.items) {
      assert.match(item.link, /^https:\/\/link\.coupang\.com\/a\//);
      assert.match(item.link, /[?&]subId=clawgame(&|$)/);
      assert.ok(item.productName && item.priceLabel, `${theme}/${item.char} 상품 정보가 비었습니다.`);
      assert.ok(fs.existsSync(path.join(modelsRoot, theme, item.model)), `${theme}/${item.model} 이 없습니다.`);
      assert.ok(fs.existsSync(path.join(modelsRoot, theme, item.thumbnail)), `${theme}/${item.thumbnail} 이 없습니다.`);
    }
  }
});

test('every model file is a real GLB', () => {
  for (const theme of themeDirs()) {
    const manifest = JSON.parse(fs.readFileSync(path.join(modelsRoot, theme, 'manifest.json'), 'utf8'));
    for (const item of manifest.items) {
      const head = Buffer.alloc(4);
      const fd = fs.openSync(path.join(modelsRoot, theme, item.model), 'r');
      fs.readSync(fd, head, 0, 4, 0);
      fs.closeSync(fd);
      assert.equal(head.toString('ascii'), 'glTF', `${theme}/${item.model} 이 GLB 가 아닙니다.`);
    }
  }
});

test('asset sizes stay inside the budget', () => {
  let total = 0;

  for (const theme of themeDirs()) {
    let themeTotal = 0;
    const dir = path.join(modelsRoot, theme);
    for (const name of fs.readdirSync(dir)) {
      const bytes = fs.statSync(path.join(dir, name)).size;
      themeTotal += bytes;
      if (name.endsWith('.glb')) {
        assert.ok(bytes <= PER_MODEL, `${theme}/${name} ${Math.round(bytes / 1024)}KB > 300KB`);
      }
    }
    assert.ok(themeTotal <= PER_THEME, `${theme} 합계 ${Math.round(themeTotal / 1024)}KB > 1800KB`);
    total += themeTotal;
  }

  assert.ok(total <= TOTAL, `전체 ${Math.round(total / 1024)}KB > ${Math.round(TOTAL / 1024)}KB`);
});

test('no gpu3d credential file is tracked by git', () => {
  const { execFileSync } = require('node:child_process');
  const tracked = execFileSync('git', ['ls-files', 'gpu3d'], { cwd: root, encoding: 'utf8' }).trim();
  assert.equal(tracked, '', `gpu3d 아래 파일이 추적되고 있습니다: ${tracked}`);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/theme-assets-budget.test.js`
Expected: FAIL with "assets/models/dino 가 없습니다."

- [ ] **Step 3: Write the credential file**

Create `gpu3d/api.txt` with the server address and token from the kccai project's `config/application-default.properties` (`gpu3d.api.base`, `gpu3d.api.token`):

```
base=<gpu3d.api.base 의 값>
token=<gpu3d.api.token 의 값>
```

Verify it is ignored: `git check-ignore -v gpu3d/api.txt`
Expected: 패턴 `gpu3d/` 에 걸린다는 출력.

- [ ] **Step 4: Run the pipeline for dino**

Run: `node scripts/assets/build-theme-assets.js dino`
Expected: 각 캐릭터의 GLB 크기가 출력되고 예산 초과 메시지가 없다. 6개 중 일부가 "건너뜀" 으로 빠질 수 있다 — 그 캐릭터는 procedural 로 남는다.

예산을 넘기면 `scripts/assets/build-theme-assets.js` 의 `POLYCOUNT` 를 6000 으로, `optimizeGlb` 의 `maxSize` 를 384 로 낮춰 다시 돌린다.

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test tests/theme-assets-budget.test.js`
Expected: PASS, 5 tests

- [ ] **Step 6: Verify in the browser**

Run `node server.js`, open `http://localhost:3000/claw-machine.html`.

확인할 것:
1. 모델이 도착하기 전에도 게임이 시작되고 조작된다.
2. 모델이 도착하면 인형이 바뀌고, 집기·떨어뜨리기·경품구 판정이 그대로 동작한다.
3. 뽑기에 성공하면 그 인형의 상품 카드가 뜬다. 같은 세션에서 두 번째 성공에는 안 뜬다.
4. COIN 을 누르면 상품 카드 3개가 뜬다.
5. DevTools Network 를 Offline 으로 바꾸고 새로고침하면 procedural 인형으로 정상 동작한다.
6. 카드의 모든 링크에 `subId=clawgame` 이 붙어 있다.

- [ ] **Step 7: Commit**

```bash
git add assets/models/dino tests/theme-assets-budget.test.js
git commit -m "feat: build dino theme models from Coupang products"
```

---

### Task 11: 기계와 조명 교체

**Files:**
- Create: `assets/models/machine/cabinet.glb`
- Create: `assets/models/machine/env.hdr`
- Modify: `claw-machine.js`
- Create: `tests/machine-model.test.js`

**Interfaces:**
- Consumes: `createModelLoader` (Task 8)
- Produces: 없음 (게임 내부 배선)

- [ ] **Step 1: Write the failing test**

Create `tests/machine-model.test.js`:

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const machineDir = path.join(root, 'assets', 'models', 'machine');

test('the cabinet GLB exists and is inside its 2MB budget', () => {
  const file = path.join(machineDir, 'cabinet.glb');
  assert.ok(fs.existsSync(file), 'assets/models/machine/cabinet.glb 가 없습니다.');
  const bytes = fs.statSync(file).size;
  assert.ok(bytes <= 2 * 1024 * 1024, `cabinet.glb ${Math.round(bytes / 1024)}KB > 2048KB`);
  const head = Buffer.alloc(4);
  const fd = fs.openSync(file, 'r');
  fs.readSync(fd, head, 0, 4, 0);
  fs.closeSync(fd);
  assert.equal(head.toString('ascii'), 'glTF');
});

test('the environment map exists and is inside its 100KB budget', () => {
  const file = path.join(machineDir, 'env.hdr');
  assert.ok(fs.existsSync(file), 'assets/models/machine/env.hdr 가 없습니다.');
  assert.ok(fs.statSync(file).size <= 100 * 1024);
});

test('the game loads the cabinet and keeps the large-mode toggle', () => {
  const source = fs.readFileSync(path.join(root, 'claw-machine.js'), 'utf8');
  assert.match(source, /assets\/models\/machine\/cabinet\.glb/);
  assert.match(source, /isLargeMode/);
});

test('cabinet loading failure leaves the procedural frame in place', () => {
  const source = fs.readFileSync(path.join(root, 'claw-machine.js'), 'utf8');
  // 로딩에 성공했을 때만 기존 프레임을 숨긴다.
  assert.match(source, /loadCabinet[\s\S]{0,600}catch/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/machine-model.test.js`
Expected: FAIL with "cabinet.glb 가 없습니다."

- [ ] **Step 3: Generate the cabinet model**

실제 인형뽑기 기계 사진 한 장을 `assets/src/machine/cabinet.png` 로 둔다. 매장에서 직접 찍은 사진이나 저작권이 자유로운 사진을 쓴다.

Run:

```bash
node -e "
const fs=require('node:fs');
const {readGpu3dConfig,createJob,waitForJob}=require('./scripts/assets/gpu3d-client');
const {optimizeGlb}=require('./scripts/assets/glb-optimize');
(async()=>{
  const config=readGpu3dConfig();
  const image=fs.readFileSync('assets/src/machine/cabinet.png');
  const jobId=await createJob(config,{imageBuffer:image,fileName:'cabinet.png',kind:'prop',name:'cabinet',polycount:60000,heightM:1.8});
  const raw=await waitForJob(config,jobId);
  const out=optimizeGlb(raw,{maxSize:1024,quality:82});
  fs.mkdirSync('assets/models/machine',{recursive:true});
  fs.writeFileSync('assets/models/machine/cabinet.glb',out.buffer);
  console.log('cabinet.glb',Math.round(out.buffer.length/1024)+'KB');
})().catch(e=>{console.error(e.message);process.exit(1);});
"
```

2MB 를 넘으면 `polycount` 를 40000 으로, `maxSize` 를 512 로 낮춰 다시 돌린다.

- [ ] **Step 4: Add the environment map**

Poly Haven 의 CC0 실내 HDRI 를 256px 로 받는다:

```bash
mkdir -p assets/models/machine
curl -L -o assets/models/machine/env.hdr \
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/256/studio_small_09_256.hdr"
ls -l assets/models/machine/env.hdr
```

100KB 를 넘으면 같은 URL 의 `256` 을 `128` 로 바꿔 다시 받는다.

- [ ] **Step 5: Wire the cabinet into the game**

In `claw-machine.js`, add after the loader setup from Task 8:

```js
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';

// claw-machine.js:135-260 의 holeRimGroup, wall*Outer, trim*, frameMat 기둥과 가로바,
// xRailGeo/zRailGeo 레일을 만드는 코드가 지금은 scene 에 직접 붙는다.
// 그 add 대상을 전부 proceduralCabinet 으로 바꾸고, scene 에는 이 그룹 하나만 넣는다.
// craneGroup, clawPivot, indicatorGroup, plushieGroup 은 옮기지 않는다 — 집게는 계속 움직여야 한다.
const proceduralCabinet = new THREE.Group();
scene.add(proceduralCabinet);

async function loadCabinet() {
  try {
    const loadModel = createModelLoader(THREE, GLTFLoader);
    const cabinet = await loadModel('assets/models/machine/cabinet.glb');
    const box = new THREE.Box3().setFromObject(cabinet);
    const height = box.max.y - box.min.y;
    if (!Number.isFinite(height) || height <= 0) return;

    cabinet.scale.setScalar(BOX_H / height);
    scene.add(cabinet);
    proceduralCabinet.visible = false;

    const env = await new Promise((resolve, reject) => {
      new RGBELoader().load('assets/models/machine/env.hdr', resolve, undefined, reject);
    });
    env.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = env;
  } catch (error) {
    console.warn('[cabinet] 모델 로딩 건너뜀:', error.message);
  }
}

loadCabinet();
```

`isLargeMode` 전환에서 `cabinet.scale` 도 함께 조정한다.

- [ ] **Step 6: Run test to verify it passes**

Run: `node --test tests/machine-model.test.js`
Expected: PASS, 4 tests

- [ ] **Step 7: Verify in the browser**

Run `node server.js`, open the page.
Expected: 기계가 새 모델로 보이고 유리 너머 인형이 보인다. 집게가 인형에 닿는 위치가 전과 같다. `assets/models/machine/cabinet.glb` 의 이름을 잠시 바꾸고 새로고침하면 기존 프레임으로 정상 동작한다. 큰 인형 모드 전환이 동작한다.

- [ ] **Step 8: Commit**

```bash
git add assets/models/machine claw-machine.js tests/machine-model.test.js
git commit -m "feat: replace cabinet with photo-derived model"
```

---

### Task 12: 나머지 6개 테마

**Files:**
- Create: `assets/models/{shinchan,cinnamoroll,maenggu,hangyodon,doraemon,loopy}/*`

**Interfaces:**
- Consumes: `buildTheme` (Task 7)
- Produces: 테마별 `manifest.json`

- [ ] **Step 1: Build each theme, one at a time**

For each theme in `shinchan`, `cinnamoroll`, `maenggu`, `hangyodon`, `doraemon`, `loopy`:

Run: `node scripts/assets/build-theme-assets.js <theme>`
Expected: 예산 초과 없음. "건너뜀" 으로 빠진 캐릭터는 procedural 로 남으므로 괜찮다.

상품이 하나도 안 잡히면 `scripts/assets/themes.json` 의 그 캐릭터 `keyword` 를 손으로 고쳐 다시 돌린다.

- [ ] **Step 2: Run the budget test after each theme**

Run: `node --test tests/theme-assets-budget.test.js`
Expected: PASS. 전체 합계가 4.8MB 를 넘으면 그 테마의 `POLYCOUNT` 와 `maxSize` 를 낮춰 다시 만든다.

- [ ] **Step 3: Verify each theme in the browser**

Run `node server.js`, open the page, 테마를 하나씩 바꿔 가며 확인한다.

확인할 것: 각 테마의 인형이 바뀌는지, 테마를 빠르게 연속으로 바꿔도 이전 테마 인형이 섞이지 않는지, 수집함 썸네일이 보이는지, 집기가 정상인지.

- [ ] **Step 4: Commit each theme separately**

```bash
git add assets/models/<theme>
git commit -m "feat: build <theme> theme models from Coupang products"
```

- [ ] **Step 5: Run the whole suite**

Run: `node --test tests/`
Expected: 기존 테스트를 포함해 전부 PASS.

- [ ] **Step 6: Final commit**

```bash
git add -A assets/models
git commit -m "feat: complete photo-derived plushie models for all themes"
```
