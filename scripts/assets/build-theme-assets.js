const fs = require('node:fs');
const path = require('node:path');

const { createJob, readGpu3dConfig, waitForJob } = require('./gpu3d-client');
const { optimizeGlb, convertImageBuffer } = require('./glb-optimize');
const { createDeeplinks } = require('../coupang-deeplink');
const { searchProducts } = require('../coupang-search-products');
const { buildManifest, buildManifestEntry, pickProduct } = require('./theme-manifest');

const SUB_ID = 'clawgame';
const POLYCOUNT = 8000;
const HEIGHT_M = 0.3;
const DEFAULT_OUT = path.join(__dirname, '..', '..', 'assets', 'models');

function checkBudget(sizes, limits) {
  const violations = [];
  let total = 0;

  for (const file of sizes) {
    total += file.bytes;
    if (file.bytes > limits.perModel) {
      violations.push(`${file.name} 이 ${Math.round(file.bytes / 1024)}KB 로 한도 ${Math.round(limits.perModel / 1024)}KB 를 넘습니다.`);
    }
  }
  if (total > limits.perTheme) {
    violations.push(`테마 합계 ${Math.round(total / 1024)}KB 가 한도 ${Math.round(limits.perTheme / 1024)}KB 를 넘습니다.`);
  }

  return { ok: violations.length === 0, violations };
}

async function downloadImageDefault(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`이미지 내려받기 실패 ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function generateModelDefault(imageBuffer, entry) {
  const config = readGpu3dConfig();
  const jobId = await createJob(config, {
    imageBuffer,
    fileName: `${entry.char}.png`,
    kind: 'prop',
    name: entry.char,
    polycount: POLYCOUNT,
    heightM: HEIGHT_M,
  });
  return waitForJob(config, jobId);
}

async function makeThumbnailDefault(imageBuffer) {
  return convertImageBuffer(imageBuffer, { maxSize: 160, quality: 82 });
}

async function buildTheme(theme, deps = {}, options = {}) {
  const themes = deps.themes
    || JSON.parse(fs.readFileSync(path.join(__dirname, 'themes.json'), 'utf8'));
  const entries = themes[theme];
  if (!entries) throw new Error(`알 수 없는 테마: ${theme}`);

  const search = deps.searchProducts || searchProducts;
  const download = deps.downloadImage || downloadImageDefault;
  const generate = deps.generateModel || generateModelDefault;
  const optimize = deps.optimizeGlb || ((buffer) => optimizeGlb(buffer, { maxSize: 512, quality: 80 }));
  const thumbnail = deps.makeThumbnail || makeThumbnailDefault;
  const deeplinks = deps.createDeeplinks || ((urls) => createDeeplinks(urls, SUB_ID));

  const outDir = path.join(options.outDir || DEFAULT_OUT, theme);
  fs.mkdirSync(outDir, { recursive: true });

  const picked = [];
  const skipped = [];
  // 한 상품이 같은 테마의 두 캐릭터에 배정되지 않게 이미 고른 상품 ID 를 기억한다.
  const takenIds = new Set();

  for (const entry of entries) {
    try {
      // buildQueryString 이 limit 과 imageSize 를 항상 읽으므로 둘 다 준다.
      const found = await search({ keyword: entry.keyword, limit: 10, imageSize: '512x512' });
      const product = pickProduct(found.items, { ...entry, excludeProductIds: [...takenIds] });
      if (!product) {
        skipped.push({ char: entry.char, reason: '조건에 맞는 상품 없음' });
        continue;
      }
      takenIds.add(String(product.productId));

      const image = await download(product.productImage);
      const raw = await generate(image, entry);
      const optimized = optimize(raw);

      // 두 버퍼가 모두 만들어진 뒤에만 쓴다. 썸네일 실패가 .glb 고아를 남기지 않게 한다.
      const thumb = await thumbnail(image);
      fs.writeFileSync(path.join(outDir, `${entry.char}.glb`), optimized.buffer);
      fs.writeFileSync(path.join(outDir, `${entry.char}.webp`), thumb);
      picked.push({ entry, product });
    } catch (error) {
      skipped.push({ char: entry.char, reason: error.message });
    }
  }

  const manifestPath = path.join(outDir, 'manifest.json');

  // 빈 매니페스트는 게임 로더가 그대로 믿고 쓰므로, 고른 상품이 없으면 쓰지 않고 이전 것도 지운다.
  const emptyResult = () => {
    fs.rmSync(manifestPath, { force: true });
    return {
      manifest: buildManifest({ theme, entries: [], asOfDate: options.asOfDate }),
      skipped,
      written: [],
    };
  };

  if (picked.length === 0) return emptyResult();

  // 검색 API 의 productUrl 은 이미 link.coupang.com 제휴 링크라 딥링크 API 가 "url convert failed" 로 거부한다.
  // 상품 ID 로 만든 정규 URL 로 변환을 요청한다.
  const canonicalUrl = (product) => (/^https:\/\/www\.coupang\.com\//.test(product.productUrl)
    ? product.productUrl
    : `https://www.coupang.com/vp/products/${product.productId}`);
  const links = await deeplinks(picked.map(({ product }) => canonicalUrl(product)));
  const byOriginal = new Map(links.map((link) => [link.originalUrl, link.shortenUrl]));

  // 딥링크가 없는 상품은 조용히 사라지지 않게 건너뜀 목록으로 옮기고 파일도 지운다.
  for (let i = picked.length - 1; i >= 0; i -= 1) {
    const { entry, product } = picked[i];
    if (byOriginal.get(canonicalUrl(product))) continue;
    picked.splice(i, 1);
    fs.rmSync(path.join(outDir, `${entry.char}.glb`), { force: true });
    fs.rmSync(path.join(outDir, `${entry.char}.webp`), { force: true });
    skipped.push({ char: entry.char, reason: '딥링크 생성 실패' });
  }

  if (picked.length === 0) return emptyResult();

  // buildManifest 가 subId 나 가격 기준일이 빠진 항목에서 던지는 오류는 삼키지 않는다.
  const manifest = buildManifest({
    theme,
    asOfDate: options.asOfDate,
    entries: picked.map(({ entry, product }) => buildManifestEntry({
      char: entry.char,
      name: entry.name,
      product,
      deeplink: byOriginal.get(canonicalUrl(product)),
      asOfDate: options.asOfDate,
    })),
  });

  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  return {
    manifest,
    skipped,
    written: manifest.items.flatMap((item) => [
      path.join(outDir, item.model),
      path.join(outDir, item.thumbnail),
    ]),
  };
}

async function main() {
  const theme = process.argv[2];
  if (!theme) {
    console.error('사용법: node scripts/assets/build-theme-assets.js <theme>');
    process.exit(1);
  }

  const asOfDate = new Date().toISOString().slice(0, 10);
  const result = await buildTheme(theme, {}, { asOfDate });

  const sizes = result.written
    .filter((file) => file.endsWith('.glb'))
    .map((file) => ({ name: path.basename(file), bytes: fs.statSync(file).size }));
  const budget = checkBudget(sizes, { perModel: 300 * 1024, perTheme: 1.8 * 1024 * 1024 });

  console.log(`테마 ${theme}: 상품 ${result.manifest.items.length}개, 건너뜀 ${result.skipped.length}개`);
  for (const item of result.skipped) console.log(`  건너뜀 ${item.char}: ${item.reason}`);
  for (const size of sizes) console.log(`  ${size.name} ${Math.round(size.bytes / 1024)}KB`);
  if (!budget.ok) {
    for (const line of budget.violations) console.error(`  예산 초과: ${line}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { buildTheme, checkBudget };
