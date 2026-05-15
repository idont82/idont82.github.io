const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

const API_FILE = path.join(__dirname, '..', 'coupang', 'api.txt');
const API_HOST = 'api-gateway.coupang.com';
const DEEPLINK_PATH = '/v2/providers/affiliate_open_api/apis/openapi/v1/deeplink';
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36';

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

function buildAuthorization(accessKey, secretKey, method, requestPath) {
  const now = new Date();
  const y = String(now.getUTCFullYear()).slice(2);
  const mo = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const h = String(now.getUTCHours()).padStart(2, '0');
  const mi = String(now.getUTCMinutes()).padStart(2, '0');
  const s = String(now.getUTCSeconds()).padStart(2, '0');
  const signedDate = `${y}${mo}${d}T${h}${mi}${s}Z`;
  const message = `${signedDate}${method}${requestPath}`;
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(message, 'utf8')
    .digest('hex');

  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${signedDate}, signature=${signature}`;
}

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function extractMeta(html, property) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, 'i'),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return decodeHtml(match[1]);
    }
  }

  return '';
}

function extractTitle(html) {
  return (
    extractMeta(html, 'og:title') ||
    (() => {
      const match = html.match(/<title>([^<]+)<\/title>/i);
      return match ? decodeHtml(match[1]) : '';
    })()
  );
}

function extractPrice(html) {
  const metaPrice = extractMeta(html, 'product:price:amount');
  if (metaPrice && /^\d+(?:\.\d+)?$/.test(metaPrice)) {
    return Number(metaPrice);
  }

  const patterns = [
    /"finalPrice"\s*:\s*(\d+)/i,
    /"salesPrice"\s*:\s*(\d+)/i,
    /"price"\s*:\s*(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) {
      return Number(match[1]);
    }
  }

  return null;
}

function formatPriceLabel(price) {
  if (!price || Number.isNaN(price)) {
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

function requestJson({ hostname, requestPath, method, headers, body, insecure }) {
  const options = {
    hostname,
    path: requestPath,
    method,
    headers,
    rejectUnauthorized: !insecure,
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
          resolve({
            statusCode: res.statusCode || 0,
            data: JSON.parse(responseBody),
          });
        } catch (error) {
          reject(new Error(`JSON 파싱 실패: ${responseBody}`));
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

function fetchHtml(url, insecure) {
  const target = new URL(url);
  const options = {
    hostname: target.hostname,
    path: `${target.pathname}${target.search}`,
    method: 'GET',
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'text/html,application/xhtml+xml',
    },
    rejectUnauthorized: !insecure,
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseBody = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        resolve(responseBody);
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function createDeepLinks(coupangUrls, insecure) {
  const { accessKey, secretKey } = readCredentials(API_FILE);
  const body = JSON.stringify({ coupangUrls });
  const authorization = buildAuthorization(accessKey, secretKey, 'POST', DEEPLINK_PATH);

  const result = await requestJson({
    hostname: API_HOST,
    requestPath: DEEPLINK_PATH,
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Type': 'application/json;charset=UTF-8',
      'Content-Length': Buffer.byteLength(body),
    },
    body,
    insecure,
  });

  if (result.statusCode !== 200 || !result.data || result.data.rCode !== '0') {
    throw new Error(`딥링크 생성 실패: ${JSON.stringify(result.data)}`);
  }

  return result.data.data;
}

async function collectProducts(urls, insecure) {
  const deepLinks = await createDeepLinks(urls, insecure);
  const linkMap = new Map(deepLinks.map((item) => [item.originalUrl, item]));
  const results = [];

  for (const url of urls) {
    const html = await fetchHtml(url, insecure);
    const title = extractTitle(html);
    const image = extractMeta(html, 'og:image');
    const price = extractPrice(html);
    const linkInfo = linkMap.get(url);

    results.push({
      originalUrl: url,
      affiliateUrl: linkInfo ? linkInfo.shortenUrl : '',
      landingUrl: linkInfo ? linkInfo.landingUrl || '' : '',
      title,
      image,
      price,
      priceLabel: formatPriceLabel(price),
    });
  }

  return results;
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

  return parsed;
}

async function main() {
  const { insecure, output, urls } = parseArgs(process.argv);

  if (urls.length === 0) {
    throw new Error('사용법: node scripts/coupang-collect-products.js [--insecure] [--output 파일] <쿠팡URL...>');
  }

  const results = await collectProducts(urls, insecure);
  const text = JSON.stringify(results, null, 2);

  if (output) {
    fs.writeFileSync(output, text, 'utf8');
  } else {
    console.log(text);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
