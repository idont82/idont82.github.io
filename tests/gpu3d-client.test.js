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
