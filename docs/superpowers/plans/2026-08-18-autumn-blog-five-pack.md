# Autumn Blog Five-Pack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, verify, and publish five Korean autumn shopping guides backed by fresh Coupang Partners API product data.

**Architecture:** Export the existing signed Coupang search function, add a focused autumn collector that runs eleven role-specific searches and writes five validated product-data files, then feed those files plus one editorial manifest into a deterministic five-page generator. The generator prepares every page and discovery-file change in memory before writing, so missing data cannot leave a partial set.

**Tech Stack:** Node.js, vanilla HTML/CSS/JavaScript, Node test runner, Coupang Partners API, GitHub Pages

---

### Task 1: Make Coupang search reusable and test the autumn selector

**Files:**
- Modify: `scripts/coupang-search-products.js`
- Create: `scripts/collect-autumn-products.js`
- Create: `tests/autumn-product-collector.test.js`

- [ ] **Step 1: Write selector and query-map failure tests**

Create `tests/autumn-product-collector.test.js` with a mock search function. Assert that:

```js
const assert = require('node:assert/strict');
const test = require('node:test');
const {
  QUERY_GROUPS,
  collectAutumnProducts,
  selectFirstValid,
} = require('../scripts/collect-autumn-products');

const valid = (keyword, id) => ({
  keyword,
  productId: id,
  productName: `${keyword} 상품`,
  productPrice: 19900,
  productImage: `https://ads-partners.coupang.com/image/${id}`,
  productUrl: `https://link.coupang.com/re/AFFSDP?pageKey=${id}`,
});

test('autumn collector defines eleven roles across five pages', () => {
  assert.equal(Object.keys(QUERY_GROUPS).length, 5);
  assert.equal(Object.values(QUERY_GROUPS).flat().length, 11);
});

test('selector rejects incomplete, duplicate, and non-Coupang products', () => {
  const seen = new Set([1]);
  const selected = selectFirstValid([
    valid('duplicate', 1),
    { ...valid('bad link', 2), productUrl: 'https://example.com/2' },
    { ...valid('missing image', 3), productImage: '' },
    valid('usable', 4),
  ], seen);
  assert.equal(selected.productId, 4);
  assert.ok(seen.has(4));
});

test('collector builds exact page counts and fails when a role has no product', async () => {
  const search = async ({ keyword }) => ({ items: [valid(keyword, keyword.length * 100 + keyword.charCodeAt(0))] });
  const output = await collectAutumnProducts({ search });
  assert.deepEqual(Object.fromEntries(Object.entries(output).map(([key, value]) => [key, value.items.length])), {
    bedding: 3,
    humidifier: 3,
    closet: 3,
    windbreaker: 1,
    trekking: 1,
  });
  await assert.rejects(
    collectAutumnProducts({ search: async () => ({ items: [] }) }),
    /No valid Coupang product/,
  );
});
```

- [ ] **Step 2: Run the collector test and verify RED**

Run: `node --test tests/autumn-product-collector.test.js`

Expected: FAIL because `scripts/collect-autumn-products.js` does not exist.

- [ ] **Step 3: Export the existing search function without changing CLI behavior**

Change the bottom of `scripts/coupang-search-products.js` to:

```js
if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = {
  formatPriceLabel,
  parseArgs,
  searchProducts,
};
```

- [ ] **Step 4: Implement the focused autumn collector**

Create `scripts/collect-autumn-products.js` with these exact role searches:

```js
const QUERY_GROUPS = Object.freeze({
  bedding: ['가을 차렵이불', '세탁 가능 차렵이불', '극세사 담요'],
  humidifier: ['초음파 가습기', '가열식 가습기', '기화식 가습기'],
  closet: ['옷장 압축팩', '옷장 제습제', '논슬립 옷걸이'],
  windbreaker: ['경량 바람막이'],
  trekking: ['경량 트레킹화'],
});
```

Implement `isValidProduct`, `selectFirstValid(items, seen)`, and `collectAutumnProducts({ search = searchProducts })`. Search each role with `limit: 10`, `imageSize: '512x512'`, and an article-specific `subId`; select the first valid unique product per role. Only after all eleven roles succeed, write these five files with `JSON.stringify(value, null, 2) + '\n'`:

```text
data/coupang-autumn-bedding.json
data/coupang-autumn-humidifier.json
data/coupang-autumn-closet.json
data/coupang-autumn-windbreaker.json
data/coupang-autumn-trekking.json
```

Export `QUERY_GROUPS`, `collectAutumnProducts`, and `selectFirstValid`, and guard the network CLI with `require.main === module`.

- [ ] **Step 5: Run collector tests and existing search-script smoke checks**

Run:

```powershell
node --test tests/autumn-product-collector.test.js
node scripts/coupang-search-products.js --keyword "가을 차렵이불" --limit 1 --srp-link-only
```

Expected: collector tests PASS; CLI still produces valid JSON when credentials and network are available.

- [ ] **Step 6: Commit only collector files**

```powershell
git add -- scripts/coupang-search-products.js scripts/collect-autumn-products.js tests/autumn-product-collector.test.js
git commit --only -m "feat: collect autumn coupang products" -- scripts/coupang-search-products.js scripts/collect-autumn-products.js tests/autumn-product-collector.test.js
```

### Task 2: Define the five-page editorial manifest and page contract

**Files:**
- Create: `data/autumn-blog-guides.json`
- Create: `tests/autumn-blog-pages.test.js`

- [ ] **Step 1: Create the editorial manifest**

Create `data/autumn-blog-guides.json` with five objects using these immutable identifiers:

```json
[
  {
    "slug": "autumn-bedding-quilt-vs-blanket-guide",
    "productType": "autumn_bedding_quilt_blanket",
    "keyword": "가을 차렵이불 추천",
    "productData": "coupang-autumn-bedding.json",
    "productCount": 3
  },
  {
    "slug": "humidifier-types-autumn-guide",
    "productType": "autumn_humidifier_types",
    "keyword": "가습기 추천",
    "productData": "coupang-autumn-humidifier.json",
    "productCount": 3
  },
  {
    "slug": "autumn-closet-storage-guide",
    "productType": "autumn_closet_storage",
    "keyword": "가을 옷장 정리용품 추천",
    "productData": "coupang-autumn-closet.json",
    "productCount": 3
  },
  {
    "slug": "lightweight-windbreaker-autumn-guide",
    "productType": "autumn_lightweight_windbreaker",
    "keyword": "가을 경량 바람막이 추천",
    "productData": "coupang-autumn-windbreaker.json",
    "productCount": 1
  },
  {
    "slug": "autumn-lightweight-trekking-shoes-guide",
    "productType": "autumn_lightweight_trekking_shoes",
    "keyword": "가을 트레킹화 추천",
    "productData": "coupang-autumn-trekking.json",
    "productCount": 1
  }
]
```

Add the following exact editorial fields to the corresponding objects:

```json
{
  "autumn-bedding-quilt-vs-blanket-guide": {
    "title": "가을 차렵이불 추천, 담요와 비교해 고르는 환절기 침구 기준",
    "description": "가을 차렵이불 추천 제품을 담요와 비교하고 세탁 방법, 충전재, 무게, 보관 크기를 기준으로 환절기 침구 고르는 법을 정리했습니다.",
    "intro": "낮에는 덥고 새벽에는 서늘한 가을에는 두꺼운 겨울 이불보다 꺼내기 쉽고 세탁하기 편한 침구가 실용적입니다. 얇은 차렵이불과 담요의 쓰임을 나눠 비교합니다.",
    "criteria": ["세탁기 사용 가능 여부와 제품 표시사항을 먼저 확인합니다.", "충전재와 겉감, 총중량을 함께 보고 새벽 보온감과 답답함의 균형을 봅니다.", "접었을 때 부피와 보관 가방 유무를 확인해 계절 교체 부담을 줄입니다."],
    "caution": "보온감은 실내 온도와 개인차가 크므로 제품 두께만으로 따뜻함을 보장하지 않습니다.",
    "faq": [["차렵이불과 담요를 같이 써도 되나요?", "얇은 차렵이불을 기본으로 쓰고 서늘한 날 담요를 더하면 온도 변화에 대응하기 쉽습니다."], ["구매 직후 바로 사용해도 되나요?", "제품 표시사항을 확인하고 세탁 또는 충분한 환기 후 사용하는 편이 좋습니다."]],
    "roleLabels": ["가벼운 환절기 차렵이불", "세탁 편의형 차렵이불", "추가 보온용 담요"],
    "sources": [["기상청 2025년 가을철 기후 특성", "https://www.weather.go.kr/kma/news/press_01.jsp?mode=view&num=1194576"], ["한국소비자원", "https://www.kca.go.kr/"]]
  },
  "humidifier-types-autumn-guide": {
    "title": "가습기 추천, 초음파식·가열식·기화식 차이와 청소 기준",
    "description": "가습기 추천 전 초음파식, 가열식, 기화식 차이를 비교하고 물통 청소, 소음, 전력, 과습 주의사항을 정리했습니다.",
    "intro": "건조함이 느껴진다고 분무량만 크게 고르면 청소 부담이나 과습 문제가 생길 수 있습니다. 작동 방식과 매일 관리할 수 있는 구조를 먼저 비교합니다.",
    "criteria": ["물통 입구와 내부 부품을 손으로 세척하기 쉬운지 확인합니다.", "침실에서는 소음과 표시등, 거실에서는 물통 용량과 분무 조절 범위를 봅니다.", "습도계를 함께 사용하고 결로나 곰팡이가 생기지 않도록 과습을 피합니다."],
    "caution": "가습기는 질병 치료 기기가 아닙니다. 물을 오래 방치하지 말고 제조사 청소 지침을 따르며 실내가 지나치게 습해지지 않도록 관리합니다.",
    "faq": [["수돗물과 정수된 물 중 무엇을 쓰나요?", "제품마다 권장 수질이 다르므로 해당 모델의 설명서와 표시사항을 우선합니다."], ["하루 종일 켜도 되나요?", "습도를 확인하지 않은 장시간 운전은 피하고 결로나 눅눅함이 생기면 사용량을 줄입니다."]],
    "roleLabels": ["초음파식", "가열식", "기화식"],
    "sources": [["질병관리청 국가건강정보포털 실내 습도 안내", "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=2047"], ["미국 EPA 가정용 가습기 관리", "https://www.epa.gov/indoor-air-quality-iaq/use-and-care-home-humidifiers"]]
  },
  "autumn-closet-storage-guide": {
    "title": "가을 옷장 정리용품 추천, 압축팩·제습제·논슬립 옷걸이 비교",
    "description": "가을 옷장 정리용품 추천을 위해 부피를 줄이는 압축팩, 습기를 관리하는 제습제, 옷 흘러내림을 줄이는 논슬립 옷걸이를 비교했습니다.",
    "intro": "계절 옷 정리는 물건을 많이 사는 것보다 부피, 습기, 옷걸이 미끄러짐 중 실제 문제를 하나씩 해결하는 편이 효율적입니다.",
    "criteria": ["압축팩은 밸브와 지퍼 밀폐 구조, 재사용 가능 여부를 확인합니다.", "제습제는 사용 공간과 교체 표시, 넘어졌을 때 누수 가능성을 확인합니다.", "논슬립 옷걸이는 어깨 폭과 코팅 마감, 옷 사이 간격을 봅니다."],
    "caution": "젖거나 덜 마른 옷을 밀폐 보관하지 말고, 가죽·다운·형태 유지가 중요한 옷은 압축 가능 여부를 먼저 확인합니다.",
    "faq": [["니트도 옷걸이에 걸어도 되나요?", "늘어짐이 걱정되는 무거운 니트는 접어서 보관하는 편이 안전합니다."], ["제습제는 옷에 바로 닿아도 되나요?", "제품 표시사항에 따라 간격을 두고 넘어지지 않는 위치에 둡니다."]],
    "roleLabels": ["부피 절약용 압축팩", "습기 관리용 제습제", "흘러내림 방지 옷걸이"],
    "sources": [["기상청 날씨누리", "https://www.weather.go.kr/"], ["한국소비자원", "https://www.kca.go.kr/"]]
  },
  "lightweight-windbreaker-autumn-guide": {
    "title": "가을 경량 바람막이 추천, 일교차에 입기 좋은 제품 고르는 법",
    "description": "가을 경량 바람막이 추천 제품을 소재, 무게, 후드와 포켓, 세탁 표시 기준으로 살펴보고 일교차에 활용하는 방법을 정리했습니다.",
    "intro": "가을 겉옷은 한낮에 벗어 들고 다니기 쉬우면서 아침저녁 바람을 막아주는 균형이 중요합니다. 대표 상품 하나를 기준으로 확인할 항목을 짚습니다.",
    "criteria": ["상품명과 표시사항에서 겉감 소재와 안감 유무를 확인합니다.", "접어 들고 다닐 때 부담이 적은지 무게와 부피를 봅니다.", "후드 조절, 지퍼, 포켓처럼 실제 이동 중 쓰는 구성을 확인합니다."],
    "caution": "생활 방수나 방풍 성능은 명시된 시험 정보가 없으면 단정하지 않으며 비 예보가 있으면 별도 우산이나 우의를 준비합니다.",
    "faq": [["바람막이는 크게 입는 게 좋은가요?", "안에 입을 옷의 두께와 상품 실측을 비교하고 활동 시 팔과 어깨가 당기지 않는지 봅니다."], ["세탁기에 넣어도 되나요?", "코팅과 부자재가 제품마다 다르므로 부착된 세탁 표시를 우선합니다."]],
    "roleLabels": ["대표 경량 바람막이"],
    "sources": [["기상청 2025년 가을철 기후 특성", "https://www.weather.go.kr/kma/news/press_01.jsp?mode=view&num=1194576"], ["한국소비자원", "https://www.kca.go.kr/"]]
  },
  "autumn-lightweight-trekking-shoes-guide": {
    "title": "가을 트레킹화 추천, 단풍 나들이용 경량 신발 고르는 기준",
    "description": "가을 트레킹화 추천 제품을 밑창, 발목 지지, 무게, 사이즈 기준으로 살펴보고 단풍길 나들이 전 확인할 점을 정리했습니다.",
    "intro": "가을 단풍길은 포장 산책로부터 흙길과 돌계단까지 노면 차이가 큽니다. 대표 경량 트레킹화 하나를 기준으로 코스와 발에 맞는지 확인합니다.",
    "criteria": ["예정한 코스의 노면에 맞춰 밑창 패턴과 굽 구조를 확인합니다.", "평소 양말 두께를 고려해 발가락 공간과 뒤꿈치 고정을 봅니다.", "장시간 걷기 전에 짧은 거리에서 길들이고 쓸림 여부를 확인합니다."],
    "caution": "신발만으로 미끄럼이나 부상을 막을 수 없습니다. 날씨와 탐방로 상태를 확인하고 젖은 낙엽과 돌길에서는 속도를 줄입니다.",
    "faq": [["운동화로 단풍 산책을 해도 되나요?", "평탄한 포장 산책로는 가능할 수 있지만 흙길이나 경사가 있으면 코스에 맞는 접지와 지지력을 확인합니다."], ["방수 제품이 꼭 필요한가요?", "비 예보와 코스 상태에 따라 다르며 방수 표기가 없는 제품을 방수라고 가정하지 않습니다."]],
    "roleLabels": ["대표 경량 트레킹화"],
    "sources": [["한국관광공사 2025 단풍 지도", "https://korean.visitkorea.or.kr/detail/rem_detail.do?cotid=10b01f3d-cbb4-46c6-904a-f5979114440d"], ["기상청 날씨누리", "https://www.weather.go.kr/"]]
  }
}
```

- [ ] **Step 2: Write the five-page failing contract test**

Create `tests/autumn-blog-pages.test.js`. Load the manifest and, for every entry, assert:

```js
const html = fs.readFileSync(`blog/${page.slug}.html`, 'utf8');
assert.match(html, /<html lang="ko">/);
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert.match(html, new RegExp(page.keyword));
assert.match(html, /<meta name="description"/);
assert.match(html, /<link rel="canonical"/);
assert.match(html, /max-image-preview:large/);
assert.match(html, /BlogPosting/);
assert.match(html, /data-coupang-placement="article_hero"/);
assert.match(html, /data-coupang-placement="product_card"/);
assert.match(html, new RegExp(`data-coupang-product-type="${page.productType}"`));
assert.match(html, /rel="sponsored nofollow"/);
assert.match(html, /쿠팡 파트너스 활동의 일환/);
assert.equal((html.match(/class="autumn-product-card"/g) || []).length, page.productCount);
```

Also parse JSON-LD, assert distinct product IDs from `data-product-id`, assert every product anchor uses an allowed Coupang host, assert the humidifier page contains `청소`, `습도`, and a warning against excessive humidity, and assert each URL occurs exactly once in `index.html` and `sitemap.xml`.

- [ ] **Step 3: Run the page test and verify RED**

Run: `node --test tests/autumn-blog-pages.test.js`

Expected: FAIL because the five HTML pages do not exist.

- [ ] **Step 4: Preserve the verified red test for the implementation cycle**

Do not commit the failing contract yet. Keep `data/autumn-blog-guides.json` and `tests/autumn-blog-pages.test.js` in the working tree until Task 4 generates all five pages and turns this test green.

### Task 3: Implement atomic five-page generation

**Files:**
- Create: `scripts/generate-autumn-blog-pages.js`
- Create: `tests/autumn-blog-generator.test.js`
- Modify: `index.html`
- Modify: `sitemap.xml`
- Generate: `blog/autumn-bedding-quilt-vs-blanket-guide.html`
- Generate: `blog/humidifier-types-autumn-guide.html`
- Generate: `blog/autumn-closet-storage-guide.html`
- Generate: `blog/lightweight-windbreaker-autumn-guide.html`
- Generate: `blog/autumn-lightweight-trekking-shoes-guide.html`

- [ ] **Step 1: Implement configuration and product validation**

In `scripts/generate-autumn-blog-pages.js`, implement:

```js
function validateProduct(product, page, seen) {
  if (!Number.isSafeInteger(product.productId)) throw new Error(`${page.slug} has invalid productId`);
  if (!product.productName || !Number.isFinite(product.productPrice) || product.productPrice <= 0) throw new Error(`${page.slug} has incomplete product`);
  if (!/^https:\/\/ads-partners\.coupang\.com\//.test(product.productImage)) throw new Error(`${page.slug} has invalid image`);
  if (!/^https:\/\/(?:link|www|ads-partners)\.coupang\.com\//.test(product.productUrl)) throw new Error(`${page.slug} has invalid affiliate URL`);
  if (seen.has(product.productId)) throw new Error(`${page.slug} repeats productId ${product.productId}`);
  seen.add(product.productId);
}
```

Validate required manifest strings, arrays, FAQ pairs, source pairs, and exact per-page product counts before creating output.

- [ ] **Step 2: Implement the Gold Pick article renderer**

Build a complete Korean HTML document reusing `/blog/assets/style.css` and `/blog/assets/blog.js`. Include GTM snippets, SEO tags, `BlogPosting` JSON-LD, desktop sidebars, mobile top ad, summary box, linked hero image, criteria section, comparison/specification table, product cards, caution, FAQ, sources, related posts, disclosure, and footer.

Affiliate anchors use:

```html
target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url"
data-coupang-link data-coupang-placement="product_card"
data-coupang-product-type="ARTICLE_PRODUCT_TYPE"
```

The hero uses `data-coupang-placement="article_hero"`, and each product card includes `data-product-id="PRODUCT_ID"`.

- [ ] **Step 3: Implement deterministic index and sitemap insertion**

Create pure functions `updateIndex(html, pages)` and `updateSitemap(xml, pages)`. Remove any existing block between `<!-- AUTUMN_GUIDES_START -->` and `<!-- AUTUMN_GUIDES_END -->`, then insert one regenerated block. Add every article URL once. Build all five page strings plus both discovery strings before calling any `fs.writeFileSync`.

- [ ] **Step 4: Export pure functions and run generator unit tests**

Export `renderArticle`, `updateIndex`, `updateSitemap`, and `validateInputs`. Guard the CLI with `require.main === module`.

Create `tests/autumn-blog-generator.test.js` with in-memory manifest and product fixtures. Assert that `validateInputs` rejects a missing image and a duplicate ID, `renderArticle` returns one valid Korean `h1` and the expected card count, and calling both discovery update functions twice produces the same output with one URL occurrence.

Run: `node --test tests/autumn-blog-generator.test.js`

Expected: all generator unit tests PASS. The end-to-end page contract remains red until Task 4.

- [ ] **Step 5: Commit generator implementation**

```powershell
git add -- scripts/generate-autumn-blog-pages.js tests/autumn-blog-generator.test.js
git commit --only -m "feat: generate autumn blog pages" -- scripts/generate-autumn-blog-pages.js tests/autumn-blog-generator.test.js
```

### Task 4: Collect fresh products and generate the five pages

**Files:**
- Create: `data/coupang-autumn-bedding.json`
- Create: `data/coupang-autumn-humidifier.json`
- Create: `data/coupang-autumn-closet.json`
- Create: `data/coupang-autumn-windbreaker.json`
- Create: `data/coupang-autumn-trekking.json`
- Generate the five `blog/*.html` files named in Task 3
- Modify: `index.html`
- Modify: `sitemap.xml`

- [ ] **Step 1: Run the live collector**

Run: `node --use-system-ca scripts/collect-autumn-products.js`

Expected: eleven successful role searches and five JSON files. If any role fails, adjust only that role's search phrase in `QUERY_GROUPS`, update its test expectation, and rerun the complete collector.

Do not publish a partial set: all eleven product roles and all five page inputs must validate before generation continues.

- [ ] **Step 2: Inspect selected products before generation**

Run:

```powershell
node -e "for(const f of ['bedding','humidifier','closet','windbreaker','trekking']){const x=require('./data/coupang-autumn-'+f+'.json'); console.log(f, x.items.map(p=>({id:p.productId,name:p.productName,price:p.productPrice,url:p.productUrl,image:p.productImage})));}"
```

Expected: 3/3/3/1/1 distinct and relevant products, numeric prices, Coupang URLs, and usable images.

- [ ] **Step 3: Generate all pages atomically**

Run: `node scripts/generate-autumn-blog-pages.js`

Expected: five blog paths printed after all validation succeeds.

- [ ] **Step 4: Run focused tests**

Run:

```powershell
node --test tests/autumn-product-collector.test.js tests/autumn-blog-generator.test.js tests/autumn-blog-pages.test.js tests/blog-coupang-tracking.test.js
git diff --check
```

Expected: all focused tests PASS and `git diff --check` exits 0.

- [ ] **Step 5: Prove deterministic regeneration**

Hash the five pages, `index.html`, and `sitemap.xml`; rerun the generator; hash again; require identical SHA-256 values.

- [ ] **Step 6: Commit product data and generated content only**

Stage the five product JSON files, five pages, generator-related test files, `index.html`, and `sitemap.xml` with explicit pathspecs. Use `git commit --only` so unrelated pre-staged user files remain untouched.

Commit message: `feat: add five autumn shopping guides`.

### Task 5: Visual, link, and publication verification

**Files:**
- Verify the five generated HTML files
- Verify: `index.html`
- Verify: `sitemap.xml`

- [ ] **Step 1: Start the local server and capture all five pages**

Run `node server.js`, then inspect every page at approximately 1440px desktop and 390px mobile width. Confirm no horizontal scroll, clipped heading, broken image, overlapping ad, or unreadable comparison table.

- [ ] **Step 2: Verify outbound links and metadata**

For each page, check canonical URL, Open Graph image, JSON-LD parsing, hero link, every product CTA, disclosure, related links, and exactly one index/sitemap occurrence. Do not expose affiliate credentials or token files.

- [ ] **Step 3: Run final tests and inspect commit scope**

Run:

```powershell
node --test tests/autumn-product-collector.test.js tests/autumn-blog-generator.test.js tests/autumn-blog-pages.test.js tests/blog-coupang-tracking.test.js
git diff --check HEAD^
git show --stat --oneline --summary HEAD
```

Expected: tests PASS; the commit contains only the approved autumn feature files.

- [ ] **Step 4: Push main and verify GitHub Pages**

Run `git push origin main`, confirm `origin/main` equals local HEAD, then request each of the five public URLs and require HTTP 200 plus its canonical marker.

- [ ] **Step 5: Preserve unrelated user work**

Compare `git status --short` with the pre-task status. Existing unrelated staged, unstaged, and untracked files must remain present and uncommitted.
