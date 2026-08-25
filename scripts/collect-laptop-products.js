const fs = require('node:fs');
const path = require('node:path');

const { searchProducts } = require('./coupang-search-products');

const QUERY_GROUPS = Object.freeze({
  value: [
    { keyword: 'HP 2026 라이젠5 노트북 16GB 512GB', required: ['HP', '2026', '라이젠5', '16GB', '512GB'] },
    { keyword: '에이수스 2026 비보북 16GB 512GB', required: ['에이수스', '2026', '비보북', '16GB', '512GB'] },
    { keyword: 'LG전자 2026 그램북 AI 16GB 256GB', required: ['LG전자', '2026', '그램북', '16GB', '256GB'] },
  ],
  performance: [
    { keyword: 'RTX 5090 게이밍 노트북', required: ['RTX 5090'] },
    { keyword: 'RTX 5080 게이밍 노트북', required: ['RTX 5080'] },
    { keyword: 'RTX 5070 Ti 노트북', required: ['RTX 5070 Ti'] },
  ],
  document: [
    { keyword: '베이직스 2026 베이직북 마이크로소프트 16GB WIN11', required: ['베이직북', '마이크로소프트', '16GB', 'WIN11'] },
    { keyword: '삼성 갤럭시북6 16GB WIN11', required: ['갤럭시북6', '16GB', 'WIN11'] },
    { keyword: 'LG 그램 노트북 16GB WIN11', required: ['그램', '16GB', 'WIN11'] },
  ],
});

const OUTPUT_FILES = Object.freeze({
  value: 'coupang-laptop-value.json',
  performance: 'coupang-laptop-performance.json',
  document: 'coupang-laptop-document.json',
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

function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function matchesRole(product, role) {
  const name = normalize(product?.productName);
  const category = normalize(product?.categoryName);
  const laptopPattern = /(노트북|베이직북|비보북|아이디어패드|갤럭시북|그램|옴니북|오멘|리전|rog|프레데터|레이더|어로스)/i;
  if (!laptopPattern.test(name)) {
    return false;
  }
  if (category && category !== '가전디지털') {
    return false;
  }
  return (role.required || []).every((term) => name.includes(normalize(term)));
}

function selectFirstValid(items, seenProductIds, role = { required: [] }) {
  const product = items.find((item) => (
    isValidProduct(item)
    && matchesRole(item, role)
    && !seenProductIds.has(Number(item.productId))
  ));

  if (!product) {
    return null;
  }

  seenProductIds.add(Number(product.productId));
  return product;
}

async function collectLaptopProducts({
  search = searchProducts,
  now = () => new Date().toISOString(),
} = {}) {
  const output = {};
  const seenProductIds = new Set();

  for (const [group, roles] of Object.entries(QUERY_GROUPS)) {
    const items = [];

    for (const role of roles) {
      const result = await search({
        keyword: role.keyword,
        limit: 10,
        imageSize: '512x512',
        subId: `laptop-${group}`,
        srpLinkOnly: false,
        insecure: false,
      });
      const selected = selectFirstValid(result.items || [], seenProductIds, role);

      if (!selected) {
        throw new Error(`유효한 쿠팡 상품을 찾지 못했습니다: ${group} / ${role.keyword}`);
      }

      items.push({
        ...selected,
        roleKeyword: role.keyword,
      });
    }

    output[group] = {
      group,
      verifiedAt: now(),
      queries: roles.map((role) => role.keyword),
      items,
    };
  }

  return output;
}

function writeProductFiles(groups, rootDir = path.join(__dirname, '..')) {
  const dataDir = path.join(rootDir, 'data');
  fs.mkdirSync(dataDir, { recursive: true });

  for (const [group, data] of Object.entries(groups)) {
    const filename = OUTPUT_FILES[group];
    if (!filename) {
      throw new Error(`알 수 없는 상품 그룹입니다: ${group}`);
    }
    fs.writeFileSync(path.join(dataDir, filename), `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  }
}

async function main() {
  const groups = await collectLaptopProducts();
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
  collectLaptopProducts,
  isValidProduct,
  matchesRole,
  selectFirstValid,
  writeProductFiles,
};
