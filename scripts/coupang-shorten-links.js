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
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(`${signedDate}${METHOD}${API_PATH}`, 'utf8')
    .digest('hex');

  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${signedDate}, signature=${signature}`;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const parsed = {
    insecure: false,
    output: '',
    urls: [],
  };

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (token === '--insecure') {
      parsed.insecure = true;
    } else if (token === '--output') {
      parsed.output = args[i + 1] || '';
      i += 1;
    } else {
      parsed.urls.push(token);
    }
  }

  if (parsed.urls.length === 0) {
    throw new Error('사용법: node scripts/coupang-shorten-links.js <url1> <url2> ... [--output file] [--insecure]');
  }

  return parsed;
}

function requestJson({ body, insecure }) {
  const { accessKey, secretKey } = readCredentials(API_FILE);
  const authorization = buildAuthorization(accessKey, secretKey);

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
      rejectUnauthorized: !insecure,
    }, (res) => {
      let responseBody = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode || 0,
            data: JSON.parse(responseBody),
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
  const config = parseArgs(process.argv);
  const body = JSON.stringify({ coupangUrls: config.urls });
  const result = await requestJson({
    body,
    insecure: config.insecure,
  });

  if (result.statusCode !== 200 || !result.data || result.data.rCode !== '0') {
    throw new Error(`딥링크 생성 실패: ${JSON.stringify(result.data)}`);
  }

  const text = JSON.stringify(result.data.data, null, 2);
  if (config.output) {
    fs.writeFileSync(config.output, text, 'utf8');
  } else {
    console.log(text);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
