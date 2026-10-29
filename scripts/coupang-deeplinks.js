// 수집한 상품 JSON에 쿠팡 파트너스 딥링크(link.coupang.com/a/...)를 채워 넣는다.
// 검색 API가 돌려주는 productUrl은 딥링크 API가 거부하므로 productId로 표준 URL을 만들어 보낸다.
//
// 사용법: node scripts/coupang-deeplinks.js --input data/coupang-winter-padding.json --sub-id winter-padding
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

const API_FILE = path.join(__dirname, '..', 'coupang', 'api.txt');
const API_HOST = 'api-gateway.coupang.com';
const API_PATH = '/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink';
const METHOD = 'POST';
const CANONICAL_PREFIX = 'https://www.coupang.com/vp/products/';
const MAX_URLS_PER_CALL = 10;

function readCredentials() {
  const raw = fs.readFileSync(API_FILE, 'utf8');
  const access = raw.match(/Access Key\s*:\s*([^\r\n]+)/i);
  const secret = raw.match(/Secret Key\s*:\s*([^\r\n]+)/i);
  if (!access || !secret) {
    throw new Error('coupang/api.txt 에서 Access Key 또는 Secret Key를 찾지 못했습니다.');
  }
  return { accessKey: access[1].trim(), secretKey: secret[1].trim() };
}

function buildAuthorization(accessKey, secretKey) {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  const signedDate = `${String(now.getUTCFullYear()).slice(2)}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(`${signedDate}${METHOD}${API_PATH}`, 'utf8')
    .digest('hex');
  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${signedDate}, signature=${signature}`;
}

function canonicalUrl(productId) {
  const id = String(productId).trim();
  if (!/^\d+$/.test(id)) {
    throw new Error(`productId가 숫자가 아닙니다: ${productId}`);
  }
  return `${CANONICAL_PREFIX}${id}`;
}

function dedupeItems(items) {
  const seen = new Set();
  const unique = [];
  for (const item of items) {
    const id = String(item.productId);
    if (seen.has(id)) continue;
    seen.add(id);
    unique.push(item);
  }
  return unique;
}

function assertSubId(subId) {
  if (!/^[a-z0-9-]{3,40}$/.test(String(subId || ''))) {
    throw new Error('subId는 영문 소문자, 숫자, 하이픈 3~40자여야 합니다.');
  }
  return subId;
}

function requestJson(body) {
  const { accessKey, secretKey } = readCredentials();
  const payload = JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: API_HOST,
      path: API_PATH,
      method: METHOD,
      headers: {
        Authorization: buildAuthorization(accessKey, secretKey),
        'Content-Type': 'application/json;charset=UTF-8',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let responseBody = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { responseBody += chunk; });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode || 0, data: JSON.parse(responseBody) });
        } catch {
          reject(new Error(`응답 JSON 파싱 실패: ${responseBody}`));
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function createDeeplinks(urls, subId) {
  const result = await requestJson({ coupangUrls: urls, subId });
  if (result.statusCode !== 200 || !result.data || result.data.rCode !== '0') {
    throw new Error(`딥링크 생성 실패: ${JSON.stringify(result.data)}`);
  }
  const rows = result.data.data || [];
  const byOriginal = new Map();
  for (const row of rows) {
    if (!row.shortenUrl) {
      throw new Error(`딥링크가 비어 있습니다: ${JSON.stringify(row)}`);
    }
    byOriginal.set(row.originalUrl, row.shortenUrl);
  }
  return byOriginal;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const parsed = { input: '', subId: '' };
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--input') { parsed.input = args[i + 1] || ''; i += 1; }
    else if (args[i] === '--sub-id') { parsed.subId = args[i + 1] || ''; i += 1; }
  }
  if (!parsed.input || !parsed.subId) {
    throw new Error('사용법: node scripts/coupang-deeplinks.js --input <파일> --sub-id <채널ID>');
  }
  return parsed;
}

async function annotate(inputPath, subId) {
  assertSubId(subId);
  const absolute = path.resolve(inputPath);
  const payload = JSON.parse(fs.readFileSync(absolute, 'utf8'));
  const items = dedupeItems(payload.items || []);

  const urls = items.map((item) => canonicalUrl(item.productId));
  const links = new Map();
  for (let start = 0; start < urls.length; start += MAX_URLS_PER_CALL) {
    const chunk = urls.slice(start, start + MAX_URLS_PER_CALL);
    const resolved = await createDeeplinks(chunk, subId);
    for (const [original, shortened] of resolved) {
      links.set(original, shortened);
    }
  }

  payload.subId = subId;
  payload.deeplinkedAt = new Date().toISOString().slice(0, 10);
  payload.items = items.map((item) => {
    const deeplink = links.get(canonicalUrl(item.productId));
    if (!deeplink || !deeplink.startsWith('https://link.coupang.com/a/')) {
      throw new Error(`딥링크 형식이 올바르지 않습니다: ${item.productId} -> ${deeplink}`);
    }
    return { ...item, canonicalUrl: canonicalUrl(item.productId), deeplink };
  });
  delete payload.raw;

  fs.writeFileSync(absolute, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return { file: absolute, subId, count: payload.items.length };
}

if (require.main === module) {
  const config = parseArgs(process.argv);
  annotate(config.input, config.subId)
    .then((summary) => console.log(`${summary.count}개 딥링크 적용: ${path.basename(summary.file)} (subId=${summary.subId})`))
    .catch((error) => { console.error(error.message); process.exit(1); });
}

module.exports = { annotate, canonicalUrl, dedupeItems, assertSubId };
