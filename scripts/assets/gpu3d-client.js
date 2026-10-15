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
