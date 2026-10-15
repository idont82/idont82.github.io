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
