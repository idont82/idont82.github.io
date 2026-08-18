const fs = require('node:fs');
const path = require('node:path');

const { searchProducts } = require('./coupang-search-products');

const QUERY_GROUPS = Object.freeze({
  bedding: ['가을 차렵이불', '세탁 가능 차렵이불', '극세사 담요'],
  humidifier: ['초음파 가습기', '가열식 가습기', '기화식 가습기'],
  closet: ['옷장 압축팩', '옷장 제습제', '논슬립 옷걸이'],
  windbreaker: ['경량 바람막이'],
  trekking: ['경량 트레킹화'],
});

const OUTPUT_FILES = Object.freeze({
  bedding: 'coupang-autumn-bedding.json',
  humidifier: 'coupang-autumn-humidifier.json',
  closet: 'coupang-autumn-closet.json',
  windbreaker: 'coupang-autumn-windbreaker.json',
  trekking: 'coupang-autumn-trekking.json',
});

const ALLOWED_IMAGE_HOSTS = new Set(['ads-partners.coupang.com']);
const ALLOWED_LINK_HOSTS = new Set([
  'ads-partners.coupang.com',
  'link.coupang.com',
  'www.coupang.com',
]);

function hasAllowedHost(value, allowedHosts) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && allowedHosts.has(url.hostname);
  } catch (error) {
    return false;
  }
}

function isValidProduct(product) {
  return Boolean(
    product
    && Number.isSafeInteger(Number(product.productId))
    && String(product.productName || '').trim()
    && Number.isFinite(Number(product.productPrice))
    && Number(product.productPrice) > 0
    && hasAllowedHost(product.productImage, ALLOWED_IMAGE_HOSTS)
    && hasAllowedHost(product.productUrl, ALLOWED_LINK_HOSTS)
  );
}

function selectFirstValid(items, seenProductIds) {
  const product = items.find((item) => (
    isValidProduct(item) && !seenProductIds.has(Number(item.productId))
  ));

  if (!product) {
    return null;
  }

  seenProductIds.add(Number(product.productId));
  return product;
}

async function collectAutumnProducts({
  search = searchProducts,
  now = () => new Date().toISOString(),
} = {}) {
  const output = {};

  for (const [group, keywords] of Object.entries(QUERY_GROUPS)) {
    const seenProductIds = new Set();
    const items = [];

    for (const keyword of keywords) {
      const result = await search({
        keyword,
        limit: 10,
        imageSize: '512x512',
        subId: `autumn-${group}`,
        srpLinkOnly: false,
        insecure: false,
      });
      const selected = selectFirstValid(result.items || [], seenProductIds);

      if (!selected) {
        throw new Error(`유효한 쿠팡 상품을 찾지 못했습니다: ${group} / ${keyword}`);
      }

      items.push({
        ...selected,
        roleKeyword: keyword,
      });
    }

    output[group] = {
      group,
      verifiedAt: now(),
      queries: keywords,
      items,
    };
  }

  return output;
}

function writeProductFiles(groups, rootDir = path.join(__dirname, '..')) {
  for (const [group, data] of Object.entries(groups)) {
    const filename = OUTPUT_FILES[group];
    if (!filename) {
      throw new Error(`알 수 없는 상품 그룹입니다: ${group}`);
    }
    const outputPath = path.join(rootDir, 'data', filename);
    fs.writeFileSync(outputPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  }
}

async function main() {
  const groups = await collectAutumnProducts();
  writeProductFiles(groups);
  console.log(JSON.stringify({
    status: 'ok',
    files: Object.values(OUTPUT_FILES),
    productCount: Object.values(groups).reduce((sum, group) => sum + group.items.length, 0),
  }, null, 2));
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = {
  OUTPUT_FILES,
  QUERY_GROUPS,
  collectAutumnProducts,
  isValidProduct,
  selectFirstValid,
  writeProductFiles,
};
