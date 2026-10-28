// 쿠팡 파트너스 실적 조회 (클릭 / 주문 / 수익)
// 사용법: node scripts/coupang-report.js [YYYYMMDD] [YYYYMMDD]
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

const API_FILE = path.join(__dirname, '..', 'coupang', 'api.txt');
const API_HOST = 'api-gateway.coupang.com';
const BASE = '/v2/providers/affiliate_open_api/apis/openapi';

function readCredentials() {
  const raw = fs.readFileSync(API_FILE, 'utf8');
  const a = raw.match(/Access Key\s*:\s*([^\r\n]+)/i);
  const s = raw.match(/Secret Key\s*:\s*([^\r\n]+)/i);
  if (!a || !s) throw new Error('coupang/api.txt 키 파싱 실패');
  return { accessKey: a[1].trim(), secretKey: s[1].trim() };
}

function signedDate() {
  const n = new Date();
  const p = (v) => String(v).padStart(2, '0');
  return `${String(n.getUTCFullYear()).slice(2)}${p(n.getUTCMonth() + 1)}${p(n.getUTCDate())}T${p(n.getUTCHours())}${p(n.getUTCMinutes())}${p(n.getUTCSeconds())}Z`;
}

function authorize(creds, method, target) {
  const d = signedDate();
  const sig = crypto.createHmac('sha256', creds.secretKey)
    .update(`${d}${method}${target}`, 'utf8').digest('hex');
  return `CEA algorithm=HmacSHA256, access-key=${creds.accessKey}, signed-date=${d}, signature=${sig}`;
}

function get(creds, pathOnly, query) {
  const target = `${pathOnly}?${query}`;
  const signTarget = `${pathOnly}${query}`;
  return new Promise((resolve, reject) => {
    const req = https.request({
      host: API_HOST, path: target, method: 'GET',
      headers: { Authorization: authorize(creds, "GET", signTarget), 'Content-Type': 'application/json' },
    }, (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        try { resolve({ status: res.statusCode, json: JSON.parse(body) }); }
        catch (e) { resolve({ status: res.statusCode, raw: body }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function ymd(date) {
  const p = (v) => String(v).padStart(2, '0');
  return `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}`;
}

(async () => {
  const creds = readCredentials();
  const today = new Date();
  const start = process.argv[2] || ymd(new Date(today.getTime() - 29 * 86400000));
  const end = process.argv[3] || ymd(today);
  const q = `startDate=${start}&endDate=${end}`;

  for (const kind of ['clicks', 'orders', 'commission']) {
    const r = await get(creds, `${BASE}/v1/reports/${kind}`, q);
    console.log(`=== ${kind} (${start}~${end}) status=${r.status}`);
    const out = JSON.stringify(r.json ?? r.raw);
    console.log(out.length > 4000 ? out.slice(0, 4000) + ' ...[truncated]' : out);
    console.log('');
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
