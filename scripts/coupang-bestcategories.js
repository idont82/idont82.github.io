const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

const API_FILE = path.join(__dirname, '..', 'coupang', 'api.txt');
const API_HOST = 'api-gateway.coupang.com';
const METHOD = 'GET';

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

function buildAuthorization(accessKey, secretKey, method, signingTarget) {
  const signedDate = buildSignedDate();
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(`${signedDate}${method}${signingTarget}`, 'utf8')
    .digest('hex');

  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${signedDate}, signature=${signature}`;
}

function formatPriceLabel(price) {
  if (typeof price !== 'number' || Number.isNaN(price)) {
    return '';
  }

  const rounded = Math.round(price / 100) * 100;
  if (rounded >= 10000) {
    const man = Math.floor(rounded / 10000);
    const rest = rounded % 10000;
    if (rest === 0) {
      return `약 ${man}만원`;
    }
    const thousand = Math.round(rest / 1000);
    return `약 ${man}만 ${thousand}천원`;
  }

  return `약 ${rounded.toLocaleString('ko-KR')}원`;
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const parsed = {
    categoryId: '',
    limit: 10,
    insecure: false,
    output: '',
  };

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (token === '--category-id') {
      parsed.categoryId = args[i + 1] || '';
      i += 1;
    } else if (token === '--limit') {
      parsed.limit = Number(args[i + 1] || 10);
      i += 1;
    } else if (token === '--output') {
      parsed.output = args[i + 1] || '';
      i += 1;
    } else if (token === '--insecure') {
      parsed.insecure = true;
    } else if (!parsed.categoryId) {
      parsed.categoryId = token;
    }
  }

  if (!parsed.categoryId) {
    throw new Error('사용법: node scripts/coupang-bestcategories.js --category-id 115573 [--limit 10] [--output 파일] [--insecure]');
  }

  if (!Number.isInteger(parsed.limit) || parsed.limit < 1 || parsed.limit > 100) {
    throw new Error('limit 값은 1~100 사이의 정수여야 합니다.');
  }

  return parsed;
}

function requestJson(options) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
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
    req.end();
  });
}

async function fetchBestCategory(config) {
  const { accessKey, secretKey } = readCredentials(API_FILE);
  const apiPath = `/v2/providers/affiliate_open_api/apis/openapi/v1/products/bestcategories/${config.categoryId}`;
  const queryString = `limit=${config.limit}`;
  const authorization = buildAuthorization(accessKey, secretKey, METHOD, `${apiPath}${queryString}`);

  const result = await requestJson({
    hostname: API_HOST,
    path: `${apiPath}?${queryString}`,
    method: METHOD,
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json;charset=UTF-8',
    },
    rejectUnauthorized: !config.insecure,
  });

  if (result.statusCode !== 200 || !result.data || result.data.rCode !== '0') {
    throw new Error(`베스트 카테고리 조회 실패: ${JSON.stringify(result.data)}`);
  }

  const items = (result.data.data || []).map((item) => ({
    rank: item.rank,
    isRocket: item.isRocket,
    isFreeShipping: item.isFreeShipping,
    productId: item.productId,
    productName: item.productName,
    productPrice: item.productPrice,
    priceLabel: formatPriceLabel(item.productPrice),
    productImage: item.productImage,
    productUrl: item.productUrl,
    categoryName: item.categoryName || '',
  }));

  return {
    categoryId: config.categoryId,
    items,
    raw: result.data,
  };
}

async function main() {
  const config = parseArgs(process.argv);
  const result = await fetchBestCategory(config);
  const text = JSON.stringify(result, null, 2);

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
