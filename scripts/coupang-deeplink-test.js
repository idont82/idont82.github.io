const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

const API_FILE = path.join(__dirname, '..', 'coupang', 'api.txt');
const API_HOST = 'api-gateway.coupang.com';
const API_PATH = '/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink';
const METHOD = 'POST';

function readCredentials(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const accessMatch = raw.match(/Access Key\s*:\s*([^\r\n]+)/i);
  const secretMatch = raw.match(/Secret Key\s*:\s*([^\r\n]+)/i);

  if (!accessMatch || !secretMatch) {
    throw new Error('coupang/api.txt 에서 Access Key 또는 Secret Key를 찾지 못했습니다.');
  }

  return {
    accessKey: accessMatch[1].trim(),
    secretKey: secretMatch[1].trim(),
  };
}

function buildAuthorization(accessKey, secretKey) {
  const now = new Date();
  const y = String(now.getUTCFullYear()).slice(2);
  const mo = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const h = String(now.getUTCHours()).padStart(2, '0');
  const mi = String(now.getUTCMinutes()).padStart(2, '0');
  const s = String(now.getUTCSeconds()).padStart(2, '0');
  const signedDate = `${y}${mo}${d}T${h}${mi}${s}Z`;
  const message = `${signedDate}${METHOD}${API_PATH}`;
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(message, 'utf8')
    .digest('hex');

  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${signedDate}, signature=${signature}`;
}

function requestDeepLinks(coupangUrls) {
  const { accessKey, secretKey } = readCredentials(API_FILE);
  const body = JSON.stringify({ coupangUrls });
  const authorization = buildAuthorization(accessKey, secretKey);

  const options = {
    hostname: API_HOST,
    path: API_PATH,
    method: METHOD,
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json;charset=UTF-8',
      'Content-Length': Buffer.byteLength(body),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseBody = '';

      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({
            statusCode: res.statusCode,
            data: parsed,
          });
        } catch (error) {
          reject(new Error(`응답 JSON 파싱 실패: ${responseBody}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  const targets = process.argv.slice(2);
  const coupangUrls = targets.length > 0
    ? targets
    : ['https://www.coupang.com/np/search?component=&q=%ED%95%98%EC%B8%A0%EB%84%A4+%EB%AF%B8%EC%BF%A0&channel=user'];

  const result = await requestDeepLinks(coupangUrls);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
