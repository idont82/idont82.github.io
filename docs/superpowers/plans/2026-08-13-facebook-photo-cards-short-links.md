# Facebook Photo Cards and Short Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace text-heavy five-card Facebook posts with three full-photo cards and route caption clicks through safe, numbered `/g/?n=` links.

**Architecture:** The queue becomes the reviewed source for `shortLinkId` and three short card phrases. The content builder extracts only product images nested inside Coupang links, assigns three deterministic image candidates, and keeps the public short link separate from the tracked destination. A small generator produces a committed browser allowlist for `g/index.html`; the renderer creates three full-bleed images with a centered translucent text band, while the existing publisher and Graph client continue to handle state and upload orchestration.

**Tech Stack:** Node.js 24 built-ins, vanilla browser JavaScript/HTML, Python 3 with Pillow, Node test runner, static GitHub Pages hosting.

---

## File responsibility map

- `data/facebook-post-queue.json`: reviewed scheduling data, immutable `shortLinkId`, and exactly three reviewed `cardCopy` strings per item.
- `scripts/facebook-post-queue.js`: validates queue-level short-link and copy invariants.
- `scripts/facebook-card-content.js`: extracts article/product data and produces three slide records, short public URL, tracked destination, and duplicate marker.
- `scripts/build-facebook-short-links.js`: deterministically converts queue/article data into the browser allowlist.
- `g/redirect.js`: generated allowlist plus a small pure resolver usable by browser and tests.
- `g/index.html`: reads `n` and replaces the current location with the resolver result.
- `scripts/generate-facebook-cards.py`: renders three full-bleed product cards with the centered translucent band.
- `scripts/publish-facebook-posts.js`: searches duplicates using `duplicateMarker` and otherwise keeps the existing publish/recovery sequence.
- `tests/facebook-post-queue.test.js`: queue schema, uniqueness, and reviewed-copy contracts.
- `tests/facebook-card-content.test.js`: product-image selection, three-slide output, and caption/link behavior.
- `tests/facebook-short-links.test.js`: generator determinism, every queue mapping, invalid input fallback, and open-redirect prevention.
- `tests/facebook-card-renderer.test.js`: three PNGs, dimensions, band contrast, image fallback, and two-line overflow.
- `tests/facebook-publisher.test.js`: duplicate lookup uses the short-link marker.
- `docs/facebook-card-news-runbook.md`: preview and live-post checklist for the new layout.

## Task 1: Add reviewed queue metadata and validation

**Files:**
- Modify: `data/facebook-post-queue.json`
- Modify: `scripts/facebook-post-queue.js`
- Modify: `tests/facebook-post-queue.test.js`

- [ ] **Step 1: Write failing queue contract tests**

Add these assertions to `tests/facebook-post-queue.test.js`:

```js
test('queue has immutable unique short links and three reviewed card phrases', () => {
  assert.deepEqual(queue.map((item) => item.shortLinkId),
    Array.from({ length: 14 }, (_, index) => index + 1));
  for (const item of queue) {
    assert.equal(item.cardCopy.length, 3, `${item.id} must have three card phrases`);
    for (const copy of item.cardCopy) {
      assert.ok(copy.length <= 28, `${item.id} copy must be at most 28 characters`);
      assert.ok((copy.match(/\n/g) || []).length <= 1, `${item.id} copy must be at most two lines`);
    }
  }
});

test('queue rejects duplicate short ids and invalid reviewed copy', () => {
  const duplicate = structuredClone(queue.slice(0, 2));
  duplicate[1].shortLinkId = duplicate[0].shortLinkId;
  assert.throws(() => validateQueue(duplicate), /Duplicate Facebook short link id/);

  const tooLong = structuredClone(queue.slice(0, 1));
  tooLong[0].cardCopy = ['가'.repeat(29), '기준', '비교'];
  assert.throws(() => validateQueue(tooLong), /cardCopy/);
});
```

- [ ] **Step 2: Run the test and verify the metadata failure**

Run:

```powershell
node --test tests/facebook-post-queue.test.js
```

Expected: FAIL because `shortLinkId` and `cardCopy` do not exist.

- [ ] **Step 3: Extend queue validation**

In `validateQueue()` add `shortLinkId` and `cardCopy` to the required contract and track short IDs separately:

```js
const shortLinkIds = new Set();

for (const item of queue) {
  for (const field of [
    'id', 'category', 'article', 'linkMode', 'scheduledAt', 'status',
    'shortLinkId', 'cardCopy',
  ]) {
    if (item[field] === undefined || item[field] === null || item[field] === '') {
      throw new Error(`${item.id || 'queue item'} missing ${field}`);
    }
  }
  if (!Number.isSafeInteger(item.shortLinkId) || item.shortLinkId < 1) {
    throw new Error(`${item.id} has invalid shortLinkId`);
  }
  if (shortLinkIds.has(item.shortLinkId)) {
    throw new Error(`Duplicate Facebook short link id: ${item.shortLinkId}`);
  }
  shortLinkIds.add(item.shortLinkId);
  if (!Array.isArray(item.cardCopy) || item.cardCopy.length !== 3) {
    throw new Error(`${item.id} cardCopy must contain exactly three phrases`);
  }
  for (const copy of item.cardCopy) {
    if (typeof copy !== 'string' || !copy.trim() || copy.length > 28
      || (copy.match(/\n/g) || []).length > 1) {
      throw new Error(`${item.id} has invalid cardCopy`);
    }
  }
```

Do not require the IDs to remain contiguous in the validator; uniqueness and positive integers allow future entries without reusing removed IDs.

- [ ] **Step 4: Add reviewed metadata to all 14 items**

Assign `shortLinkId` 1 through 14 in current queue order and use these exact reviewed strings:

```json
[
  ["요즘 보이는 넥밴드 선풍기", "배터리 · 무게 · 소음 확인", "구매 전 비교 기준 보기"],
  ["장원영 바람막이 스타일", "색상 · 핏 · 소재 확인", "비슷한 제품 비교하기"],
  ["블랙핑크 포토카드 보관", "슬리브 · 바인더 · 크기 확인", "안전한 보관 기준 보기"],
  ["생수 500mL와 2L 비교", "휴대성 · 가격 · 보관 확인", "내 생활에 맞는 용량 보기"],
  ["인기 뽑기 인형 고르기", "크기 · 촉감 · 마감 확인", "구매 전 비교 기준 보기"],
  ["여름 자외선 차단 우산", "차단율 · 무게 · 크기 확인", "양산 선택 기준 보기"],
  ["수지 여름 셔츠 스타일", "소재 · 통기성 · 핏 확인", "비슷한 제품 비교하기"],
  ["세븐틴 포토카드 바인더", "포켓 · 크기 · 보관량 확인", "바인더 선택 기준 보기"],
  ["즉석밥 210g과 130g", "양 · 칼로리 · 가격 확인", "내 식사량에 맞춰 보기"],
  ["잠실 방이 인형뽑기 투어", "동선 · 기계 · 경품 확인", "방문 전 코스 확인하기"],
  ["여름 모기 기피제 고르기", "성분 · 사용법 · 지속시간", "구매 전 주의사항 보기"],
  ["아이브 포토카드 보관", "슬리브 · 포켓 · 크기 확인", "보관용품 비교하기"],
  ["장마철 출퇴근 준비물", "방수 · 휴대성 · 건조 확인", "비 오는 날 준비하기"],
  ["워터파크 준비물 체크", "방수팩 · 신발 · 수건 확인", "빠뜨린 준비물 확인하기"]
]
```

Place these fields after `scheduledAt` in every item:

```json
"shortLinkId": 1,
"cardCopy": [
  "요즘 보이는 넥밴드 선풍기",
  "배터리 · 무게 · 소음 확인",
  "구매 전 비교 기준 보기"
],
```

- [ ] **Step 5: Run the queue tests**

Run:

```powershell
node --test tests/facebook-post-queue.test.js
```

Expected: all queue tests PASS, including the already-published first item.

- [ ] **Step 6: Commit the queue contract**

```powershell
git add -- data/facebook-post-queue.json scripts/facebook-post-queue.js tests/facebook-post-queue.test.js
git commit -m "feat: add facebook card copy metadata"
```

## Task 2: Build three-slide photo content

**Files:**
- Modify: `scripts/facebook-card-content.js`
- Modify: `tests/facebook-card-content.test.js`

- [ ] **Step 1: Replace five-slide expectations with failing photo-card tests**

Update the HTML fixture so product images are nested inside affiliate anchors and a non-product image exists outside them:

```js
const html = `<!doctype html><html><head>
  <meta name="description" content="구매 전에 무게와 보관 공간을 비교하세요.">
  <meta property="og:image" content="https://example.com/hero.jpg">
</head><body>
  <article class="blog-article">
    <h1 class="blog-article-title">테스트 상품 구매 가이드</h1>
    <div class="article-summary-box"><p>한 줄 결론입니다.</p></div>
    <img src="https://example.com/decoration.jpg" alt="장식">
    <h2>구매 전에 놓치기 쉬운 점</h2>
    <h2>핵심 선택 기준</h2>
    <h3>가벼운 구성이 맞는 사람</h3>
    <a data-coupang-link href="https://link.coupang.com/re/AFFSDP?pageKey=1&amp;subid=old">
      <img src="https://example.com/product-1.jpg" alt="상품 1">
    </a>
    <a data-coupang-link href="https://link.coupang.com/re/AFFSDP?pageKey=2">
      <img src="https://example.com/product-2.jpg" alt="상품 2">
    </a>
  </article>
</body></html>`;
```

Use this shared queue item:

```js
const queueItem = {
  id: '20260813-problem-water-size',
  linkMode: 'blog',
  article: '/blog/example.html',
  shortLinkId: 4,
  cardCopy: ['생수 용량 비교', '휴대성 · 가격 · 보관', '내 생활에 맞는 용량'],
};
```

Add these tests:

```js
test('article extraction selects only unique affiliate product images', () => {
  const article = extractArticle(html);
  assert.deepEqual(article.imageUrls, [
    'https://example.com/product-1.jpg',
    'https://example.com/product-2.jpg',
  ]);
});

test('content creates three full-photo slides and one short public link', () => {
  const content = buildPostContent(queueItem, html);
  assert.deepEqual(content.slides.map((slide) => slide.title), queueItem.cardCopy);
  assert.deepEqual(content.slides.map((slide) => slide.imageUrl), [
    'https://example.com/product-1.jpg',
    'https://example.com/product-2.jpg',
    'https://example.com/product-1.jpg',
  ]);
  assert.deepEqual(content.slides.map((slide) => slide.imageUrls), [
    ['https://example.com/product-1.jpg', 'https://example.com/product-2.jpg'],
    ['https://example.com/product-2.jpg', 'https://example.com/product-1.jpg'],
    ['https://example.com/product-1.jpg', 'https://example.com/product-2.jpg'],
  ]);
  assert.equal(content.link, 'https://idont82.github.io/g/?n=4');
  assert.match(content.destinationLink, /utm_content=20260813-problem-water-size/);
  assert.equal(content.duplicateMarker, content.link);
  assert.equal(content.caption.split(content.link).length - 1, 1);
  assert.doesNotMatch(content.caption, /utm_campaign/);
});
```

Keep the unsafe direct-Coupang test and change every expected slide count from 5 to 3.

- [ ] **Step 2: Run the content tests and verify failure**

Run:

```powershell
node --test tests/facebook-card-content.test.js
```

Expected: FAIL because `imageUrls`, `destinationLink`, `duplicateMarker`, and three-slide behavior do not exist.

- [ ] **Step 3: Implement product-image extraction**

Add a helper that inspects only affiliate anchor bodies:

```js
function extractProductImages(articleBody, fallbackImage) {
  const images = [];
  const anchors = articleBody.matchAll(
    /<a\b(?=[^>]*\bdata-coupang-link\b)[^>]*>([\s\S]*?)<\/a>/gi
  );
  for (const anchor of anchors) {
    const source = decodeHtml(anchor[1].match(/<img\b[^>]*\bsrc="([^"]+)"/i)?.[1] || '').trim();
    if (/^https?:\/\//i.test(source) && !images.includes(source)) images.push(source);
  }
  if (!images.length && /^https?:\/\//i.test(fallbackImage)) images.push(fallbackImage);
  return images;
}

function selectThreeImageCandidates(imageUrls) {
  if (!imageUrls.length) return [[], [], []];
  if (imageUrls.length === 1) return [[imageUrls[0]], [imageUrls[0]], [imageUrls[0]]];
  const primary = [imageUrls[0], imageUrls[1], imageUrls[2] || imageUrls[0]];
  return primary.map((first) => [first, ...imageUrls.filter((url) => url !== first)]);
}
```

In `extractArticle()`, retain `imageUrl` for compatibility and add:

```js
const imageUrls = extractProductImages(articleBody, imageUrl);
```

Return both `imageUrl` and `imageUrls`.

- [ ] **Step 4: Implement short caption and three-slide output**

Add:

```js
function buildShortUrl(shortLinkId) {
  if (!Number.isSafeInteger(shortLinkId) || shortLinkId < 1) {
    throw new Error('Facebook post requires a valid shortLinkId');
  }
  return `${SITE}/g/?n=${shortLinkId}`;
}
```

Replace the slide/caption section of `buildPostContent()` with:

```js
if (!Array.isArray(queueItem.cardCopy) || queueItem.cardCopy.length !== 3) {
  throw new Error('Facebook post requires exactly three reviewed card phrases');
}
const destinationLink = queueItem.linkMode === 'blog'
  ? buildTrackedBlogUrl(queueItem.article, queueItem.id)
  : buildDirectUrl(article.coupangUrl, queueItem.id);
const link = buildShortUrl(queueItem.shortLinkId);
const imageCandidates = selectThreeImageCandidates(article.imageUrls);
const slides = queueItem.cardCopy.map((title, index) => ({
  label: 'GOLD PICK',
  title,
  imageUrl: imageCandidates[index][0] || '',
  imageUrls: imageCandidates[index],
}));
const caption = `${queueItem.cardCopy[0]}\n\n${queueItem.cardCopy[1]}\n\n${link}\n\n${DISCLOSURE}`;
return {
  id: queueItem.id,
  link,
  destinationLink,
  duplicateMarker: link,
  trackingId: queueItem.linkMode === 'blog' ? queueItem.id : buildSubid(queueItem.id),
  caption,
  slides,
};
```

Export `buildShortUrl`, `extractProductImages`, and `selectThreeImageCandidates` for focused tests.

- [ ] **Step 5: Run content tests and all real queue articles**

Run:

```powershell
node --test tests/facebook-card-content.test.js
node -e "const fs=require('fs'); const {buildPostContent}=require('./scripts/facebook-card-content'); const q=require('./data/facebook-post-queue.json'); for(const x of q){const html=fs.readFileSync('.'+x.article,'utf8'); const c=buildPostContent(x,html); if(c.slides.length!==3||c.slides.some(s=>!s.imageUrl||!s.imageUrls.length)) throw Error(x.id);} console.log('ALL_QUEUE_ITEMS=3_PHOTO_SLIDES')"
```

Expected: tests PASS and `ALL_QUEUE_ITEMS=3_PHOTO_SLIDES`.

- [ ] **Step 6: Commit the content format**

```powershell
git add -- scripts/facebook-card-content.js tests/facebook-card-content.test.js
git commit -m "feat: build three facebook photo cards"
```

## Task 3: Add safe numbered redirect pages

**Files:**
- Create: `scripts/build-facebook-short-links.js`
- Create: `g/index.html`
- Create: `g/redirect.js`
- Create: `tests/facebook-short-links.test.js`

- [ ] **Step 1: Write failing resolver and generator tests**

Create `tests/facebook-short-links.test.js`:

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const queue = require('../data/facebook-post-queue.json');

test('short-link allowlist covers every queue item and resolves exact destinations', () => {
  const { SHORT_LINKS, resolveShortLink } = require('../g/redirect');
  assert.equal(Object.keys(SHORT_LINKS).length, queue.length);
  for (const item of queue) {
    const destination = resolveShortLink(String(item.shortLinkId));
    if (item.linkMode === 'blog') {
      const url = new URL(destination);
      assert.equal(url.pathname, item.article);
      assert.equal(url.searchParams.get('utm_source'), 'facebook');
      assert.equal(url.searchParams.get('utm_content'), item.id);
    } else {
      assert.match(destination, /^https:\/\/(?:link|www|ads-partners)\.coupang\.com\//);
      assert.equal(new URL(destination).searchParams.get('subid'), `fb-${item.id}`);
    }
  }
});

test('short-link resolver rejects malformed and unregistered values', () => {
  const { resolveShortLink } = require('../g/redirect');
  for (const value of [undefined, '', '0', '-1', '1.0', '01', 'abc', '999', 'https://evil.test']) {
    assert.equal(resolveShortLink(value), '/');
  }
});

test('committed allowlist matches deterministic generator output', () => {
  const { buildRedirectSource } = require('../scripts/build-facebook-short-links');
  assert.equal(fs.readFileSync('g/redirect.js', 'utf8'), buildRedirectSource({ root: process.cwd(), queue }));
});

test('redirect page uses replace and never accepts a destination query', () => {
  const html = fs.readFileSync('g/index.html', 'utf8');
  assert.match(html, /redirect\.js/);
  assert.match(html, /location\.replace\(resolveShortLink/);
  assert.doesNotMatch(html, /[?&](?:url|target|redirect)=/i);
});
```

- [ ] **Step 2: Run the test and verify missing files**

Run:

```powershell
node --test tests/facebook-short-links.test.js
```

Expected: FAIL with missing `g/redirect.js` or generator module.

- [ ] **Step 3: Implement the deterministic allowlist generator**

Create `scripts/build-facebook-short-links.js`:

```js
const fs = require('node:fs');
const path = require('node:path');

const { buildDirectUrl, buildTrackedBlogUrl, extractArticle } = require('./facebook-card-content');
const { validateQueue } = require('./facebook-post-queue');

function buildMappings({ root, queue }) {
  validateQueue(queue);
  return Object.fromEntries(queue.map((item) => {
    if (item.linkMode === 'blog') {
      return [item.shortLinkId, buildTrackedBlogUrl(item.article, item.id)];
    }
    const html = fs.readFileSync(path.join(root, item.article.replace(/^\//, '')), 'utf8');
    return [item.shortLinkId, buildDirectUrl(extractArticle(html).coupangUrl, item.id)];
  }));
}

function buildRedirectSource({ root, queue }) {
  const mappings = JSON.stringify(buildMappings({ root, queue }), null, 2);
  return `const SHORT_LINKS = Object.freeze(${mappings});\n\n`
    + `function resolveShortLink(value) {\n`
    + `  if (!/^[1-9]\\d*$/.test(value || '')) return '/';\n`
    + `  return SHORT_LINKS[value] || '/';\n`
    + `}\n\n`
    + `if (typeof module !== 'undefined') module.exports = { SHORT_LINKS, resolveShortLink };\n`;
}

function main() {
  const root = path.resolve(__dirname, '..');
  const queue = JSON.parse(fs.readFileSync(path.join(root, 'data/facebook-post-queue.json'), 'utf8'));
  fs.mkdirSync(path.join(root, 'g'), { recursive: true });
  fs.writeFileSync(path.join(root, 'g/redirect.js'), buildRedirectSource({ root, queue }), 'utf8');
}

if (require.main === module) main();

module.exports = { buildMappings, buildRedirectSource };
```

- [ ] **Step 4: Generate the allowlist and create the redirect page**

Run:

```powershell
node scripts/build-facebook-short-links.js
```

Create `g/index.html`:

```html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex, nofollow">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Gold Pick 링크 이동</title>
</head>
<body>
  <p>Gold Pick 콘텐츠로 이동하고 있습니다.</p>
  <script src="redirect.js"></script>
  <script>
    const number = new URLSearchParams(location.search).get('n');
    location.replace(resolveShortLink(number));
  </script>
</body>
</html>
```

- [ ] **Step 5: Run redirect tests and local HTTP check**

Run:

```powershell
node --test tests/facebook-short-links.test.js
$server = Start-Process node -ArgumentList 'server.js' -WindowStyle Hidden -PassThru
try {
  $response = Invoke-WebRequest 'http://localhost:3000/g/?n=1'
  if ($response.StatusCode -ne 200) { throw 'short link page did not load' }
} finally {
  Stop-Process -Id $server.Id
}
```

Expected: all tests PASS and the local page returns 200. Browser JavaScript performs the redirect; `Invoke-WebRequest` only verifies static serving.

- [ ] **Step 6: Commit the safe redirects**

```powershell
git add -- scripts/build-facebook-short-links.js g/index.html g/redirect.js tests/facebook-short-links.test.js
git commit -m "feat: add facebook short links"
```

## Task 4: Render three full-bleed photo cards

**Files:**
- Modify: `scripts/generate-facebook-cards.py`
- Modify: `tests/facebook-card-renderer.test.js`

- [ ] **Step 1: Replace the renderer fixture and write failing visual-contract tests**

Change `writeContent()` to create exactly three slides:

```js
function writeContent(dir, title = '배터리 · 무게 · 소음 확인', imageUrl = '') {
  const input = path.join(dir, 'content.json');
  fs.writeFileSync(input, JSON.stringify({
    id: 'render-test',
    slides: Array.from({ length: 3 }, () => ({
      label: 'GOLD PICK',
      title,
      imageUrl,
      imageUrls: imageUrl ? [imageUrl] : [],
    })),
  }), 'utf8');
  return input;
}
```

Rename the first test and assert three files:

```js
test('renderer creates three 1080x1350 full-photo cards and a manifest', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-cards-'));
  const result = render(writeContent(dir), dir);
  assert.equal(result.status, 0, result.stderr);
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.cards.length, 3);
  for (const card of manifest.cards) {
    assert.deepEqual(pngSize(card), { width: 1080, height: 1350 });
  }
});
```

Add a two-line limit test:

```js
test('renderer rejects reviewed copy that cannot fit in two lines', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-overflow-'));
  const result = render(writeContent(dir, '가'.repeat(80)), dir);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Text does not fit card/);
});
```

Import `pathToFileURL` from `node:url`, then add deterministic helpers and tests for the central band and candidate fallback:

```js
const { pathToFileURL } = require('node:url');

function createWhiteImage(dir) {
  const file = path.join(dir, 'white.png');
  const result = spawnSync('python', [
    '-c',
    'from PIL import Image; import sys; Image.new("RGB", (1080, 1350), "white").save(sys.argv[1])',
    file,
  ], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return file;
}

function pixelLuminance(file, x, y) {
  const result = spawnSync('python', [
    '-c',
    'from PIL import Image; import sys; p=Image.open(sys.argv[1]).convert("RGB").getpixel((int(sys.argv[2]),int(sys.argv[3]))); print(sum(p)/3)',
    file, String(x), String(y),
  ], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  return Number(result.stdout.trim());
}

test('renderer darkens the centered text band over a full-bleed photo', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-band-'));
  const sourceUrl = pathToFileURL(createWhiteImage(dir)).href;
  const result = render(writeContent(dir, '상품 선택 기준', sourceUrl), dir);
  assert.equal(result.status, 0, result.stderr);
  const card = path.join(dir, '01.png');
  assert.ok(pixelLuminance(card, 10, 200) - pixelLuminance(card, 10, 675) >= 80);
});

test('renderer tries the next image candidate after a download failure', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-fallback-'));
  const sourceUrl = pathToFileURL(createWhiteImage(dir)).href;
  const input = writeContent(dir, '상품 선택 기준');
  const content = JSON.parse(fs.readFileSync(input, 'utf8'));
  for (const slide of content.slides) {
    slide.imageUrls = ['https://127.0.0.1:1/missing.png', sourceUrl];
  }
  fs.writeFileSync(input, JSON.stringify(content), 'utf8');
  const result = render(input, dir);
  assert.equal(result.status, 0, result.stderr);
  assert.ok(pixelLuminance(path.join(dir, '01.png'), 10, 200) >= 245);
});
```

- [ ] **Step 2: Run renderer tests and verify the five-slide contract fails**

Run:

```powershell
node --test tests/facebook-card-renderer.test.js
```

Expected: FAIL because the renderer requires five slides and uses partial cover/text-body layout.

- [ ] **Step 3: Replace image loading with candidate-safe full-bleed loading**

Import `unquote`, `urlparse`, and `url2pathname`:

```python
from urllib.parse import unquote, urlparse
from urllib.request import Request, url2pathname, urlopen
```

Replace `cover_image()` with:

```python
def load_background(urls):
  for url in urls:
    if not isinstance(url, str):
      continue
    try:
      if url.startswith(("http://", "https://")):
        request = Request(url, headers={"User-Agent": "Mozilla/5.0 CardRenderer/1.0"})
        with urlopen(request, timeout=10) as response:
          source = Image.open(BytesIO(response.read())).convert("RGB")
      elif url.startswith("file://"):
        local_path = url2pathname(unquote(urlparse(url).path))
        source = Image.open(local_path).convert("RGB")
      else:
        continue
      return ImageOps.fit(source, (WIDTH, HEIGHT), method=Image.Resampling.LANCZOS)
    except Exception:
      continue
  return None
```

`file://` exists only to make deterministic renderer tests possible; production content generation emits only HTTP(S) URLs.

- [ ] **Step 4: Render the centered translucent band**

Replace `render_slide()` with a full-photo layout:

```python
def render_slide(slide, index, font_path, output_file):
  candidates = slide.get("imageUrls") or [slide.get("imageUrl", "")]
  background = load_background(candidates)
  image = background or Image.new("RGB", (WIDTH, HEIGHT), PALETTE[index % len(PALETTE)])
  overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
  overlay_draw = ImageDraw.Draw(overlay)
  band_top = 470
  band_bottom = 880
  overlay_draw.rectangle((0, band_top, WIDTH, band_bottom), fill=(0, 0, 0, 168))
  image = Image.alpha_composite(image.convert("RGBA"), overlay)
  draw = ImageDraw.Draw(image)

  badge_font = ImageFont.truetype(font_path, 28)
  draw.rounded_rectangle((64, 60, 274, 112), radius=26, fill="#f6c85f")
  draw.text((88, 69), "GOLD PICK", font=badge_font, fill="#17152f")

  font, wrapped, spacing = fit_text(
      draw, slide.get("title", ""), font_path,
      WIDTH - 160, band_bottom - band_top - 120, 86, 58,
      spacing_ratio=0.24, max_lines=2,
  )
  box = draw.multiline_textbbox((0, 0), wrapped, font=font, spacing=spacing, align="center")
  text_width = box[2] - box[0]
  text_height = box[3] - box[1]
  draw.multiline_text(
      ((WIDTH - text_width) / 2, band_top + (band_bottom - band_top - text_height) / 2),
      wrapped, font=font, fill="#ffffff", spacing=spacing, align="center",
  )
  image.convert("RGB").save(output_file, format="PNG", optimize=True)
```

Extend `fit_text()` with `max_lines=None` and reject candidates when:

```python
if max_lines is not None and len(wrapped.splitlines()) > max_lines:
  continue
```

Change `load_content()` to require exactly three slides:

```python
if not isinstance(slides, list) or len(slides) != 3:
  raise ValueError("Card content must contain exactly three slides")
```

- [ ] **Step 5: Run renderer and combined content tests**

Run:

```powershell
node --test tests/facebook-card-renderer.test.js tests/facebook-card-content.test.js
```

Expected: all tests PASS; each manifest contains `01.png` through `03.png` only.

- [ ] **Step 6: Generate and inspect a real preview**

Run:

```powershell
node scripts/publish-facebook-posts.js --dry-run --now 2026-08-30T00:00:00Z --output-dir .facebook-artifacts/photo-preview
```

Open all three generated cards for `20260811-celebrity-wonyoung-eider` with the local image viewer. Confirm three distinct product images when the article supplies them, the full-bleed crop keeps the product visible, the band is centered, and each phrase is readable at thumbnail size.

- [ ] **Step 7: Commit the renderer**

```powershell
git add -- scripts/generate-facebook-cards.py tests/facebook-card-renderer.test.js
git commit -m "feat: render full-photo facebook cards"
```

## Task 5: Use the short link as duplicate marker

**Files:**
- Modify: `scripts/publish-facebook-posts.js`
- Modify: `tests/facebook-publisher.test.js`

- [ ] **Step 1: Write a failing duplicate-marker test**

In the normal-run graph stub capture the marker:

```js
let duplicateMarker = '';
const graphClient = {
  token: 'secret-token',
  findDuplicate: async (marker) => {
    duplicateMarker = marker;
    return null;
  },
  publishCarousel: async ({ files, message }) => {
    assert.equal(files.length, 3);
    assert.match(message, /https:\/\/idont82\.github\.io\/g\/\?n=1/);
    return { id: 'page_post', permalink_url: 'https://facebook.test/page_post' };
  },
};
```

Add after the run:

```js
assert.equal(duplicateMarker, 'https://idont82.github.io/g/?n=1');
```

Update `createFixture()` with `shortLinkId: 1` and three valid `cardCopy` strings, and change `fakeRenderer()` to create three files.

- [ ] **Step 2: Run publisher tests and verify marker failure**

Run:

```powershell
node --test tests/facebook-publisher.test.js
```

Expected: FAIL because the publisher still passes `trackingId` and test fixtures still observe the old behavior.

- [ ] **Step 3: Change duplicate lookup to the public short-link marker**

Replace both duplicate lookup references with:

```js
const duplicate = await graphClient.findDuplicate(content.duplicateMarker);
```

Continue persisting `trackingId: content.trackingId`; do not rename or discard that historical field.

- [ ] **Step 4: Run publisher and Graph tests**

Run:

```powershell
node --test tests/facebook-publisher.test.js tests/facebook-graph-api.test.js
```

Expected: all tests PASS and carousel upload expects three files.

- [ ] **Step 5: Commit publisher integration**

```powershell
git add -- scripts/publish-facebook-posts.js tests/facebook-publisher.test.js
git commit -m "fix: deduplicate facebook short links"
```

## Task 6: Update operational checks and workflow contract

**Files:**
- Modify: `.github/workflows/facebook-card-news.yml`
- Modify: `docs/facebook-card-news-runbook.md`
- Modify: `tests/facebook-workflow.test.js`

- [ ] **Step 1: Write a failing generated-allowlist workflow test**

Add to `tests/facebook-workflow.test.js`:

```js
assert.match(yaml, /build-facebook-short-links\.js/);
assert.match(yaml, /git diff --exit-code -- g\/redirect\.js/);
```

- [ ] **Step 2: Run workflow test and verify failure**

Run:

```powershell
node --test tests/facebook-workflow.test.js
```

Expected: FAIL because workflow does not regenerate/check the short-link allowlist.

- [ ] **Step 3: Add deterministic allowlist validation to CI**

Immediately before Facebook automation tests, add:

```yaml
      - name: Verify generated Facebook short links
        shell: bash
        run: |
          node scripts/build-facebook-short-links.js
          git diff --exit-code -- g/redirect.js
```

This step fails if queue metadata or article affiliate destinations change without committing the regenerated allowlist.

- [ ] **Step 4: Update the runbook**

Change every five-card check to three cards and add these exact operator checks:

```markdown
- `01.png`부터 `03.png`까지 세 장이 생성됐는지 확인한다.
- 세 장 모두 상품 사진이 전체 배경에 보이고 중앙 문구가 두 줄 이내인지 확인한다.
- 게시글에는 `/g/?n=` 링크가 한 번만 표시되고 카드 이미지에는 URL이 없어야 한다.
- 새 큐 항목을 추가하면 사용하지 않은 `shortLinkId`와 검수된 `cardCopy` 3개를 넣고 `node scripts/build-facebook-short-links.js`를 실행한다.
- 실제 게시 전에 짧은 링크를 열어 의도한 블로그 또는 승인된 쿠팡 파트너스 주소로 이동하는지 확인한다.
```

- [ ] **Step 5: Run workflow test and commit**

Run:

```powershell
node --test tests/facebook-workflow.test.js
```

Expected: PASS.

Commit:

```powershell
git add -- .github/workflows/facebook-card-news.yml docs/facebook-card-news-runbook.md tests/facebook-workflow.test.js
git commit -m "ci: verify facebook short links"
```

## Task 7: Full verification and live visual gate

**Files:**
- Modify only if a new feature defect is exposed: files from Tasks 1–6
- Do not modify: `index.html`, `tests/root-blog-home.test.js`

- [ ] **Step 1: Run all Facebook tests**

Run:

```powershell
$facebookTests = Get-ChildItem tests\facebook-*.test.js | Select-Object -ExpandProperty FullName
node --test $facebookTests
```

Expected: all Facebook tests PASS with zero failures.

- [ ] **Step 2: Run two deterministic dry-runs**

Run:

```powershell
$before = (Get-FileHash data/facebook-post-queue.json -Algorithm SHA256).Hash
node scripts/publish-facebook-posts.js --dry-run --now 2026-08-30T00:00:00Z --output-dir .facebook-artifacts/photo-run-a
node scripts/publish-facebook-posts.js --dry-run --now 2026-08-30T00:00:00Z --output-dir .facebook-artifacts/photo-run-b
$after = (Get-FileHash data/facebook-post-queue.json -Algorithm SHA256).Hash
Write-Output "QUEUE_UNCHANGED=$($before -eq $after)"
```

Expected: each selected item directory has exactly three 1080×1350 PNGs and `QUEUE_UNCHANGED=True`.

- [ ] **Step 3: Inspect the three cards at Facebook-grid scale**

Open `01.png`, `02.png`, and `03.png` from one dry-run. Also resize copies to approximately 232×290 only for inspection, without committing them. Verify product silhouettes remain visible, the centered phrases are legible, no URL/body text appears, and no important product region is completely cropped.

- [ ] **Step 4: Run the complete repository suite**

Run:

```powershell
$allTests = Get-ChildItem tests\*.test.js | Select-Object -ExpandProperty FullName
node --test $allTests
```

Expected baseline: the Facebook tests all pass. The only allowed unrelated failure is `root blog home prioritizes claw tour articles`, with the same idol-versus-claw ordering difference documented before this work. Any additional failure must be fixed test-first within feature scope.

- [ ] **Step 5: Verify secrets, generated files, and worktree scope**

Run:

```powershell
rg -n "EA[A-Za-z0-9]{40,}|META_PAGE_ACCESS_TOKEN\s*[:=]\s*[^$]" .github scripts data docs tests g --glob '!docs/superpowers/**'
node scripts/build-facebook-short-links.js
git diff --exit-code -- g/redirect.js
git diff --check
git status --short
```

Expected: no literal Meta token, generated allowlist unchanged, no whitespace error, `.facebook-artifacts/` absent from status, and only intentional feature changes present.

- [ ] **Step 6: Publish one new-format post to the Gold Pick test page**

Do this only after the user confirms the preview. First assert that the next selected item is the expected queued Wonyoung item; if it is not, stop without changing queue state:

```powershell
node -e "const {selectDuePost}=require('./scripts/facebook-post-queue'); const q=require('./data/facebook-post-queue.json'); const x=selectDuePost(q,new Date('2026-08-30T00:00:00Z')); if(x?.id!=='20260811-celebrity-wonyoung-eider'||x.status!=='queued') throw Error('Unexpected live candidate: '+JSON.stringify({id:x?.id,status:x?.status})); console.log('LIVE_CANDIDATE_CONFIRMED')"
```

Then load the three values from the Windows user environment without printing them and execute one publisher run with the Windows certificate store:

```powershell
$env:META_PAGE_ID = [Environment]::GetEnvironmentVariable('META_PAGE_ID', 'User')
$env:META_PAGE_ACCESS_TOKEN = [Environment]::GetEnvironmentVariable('META_PAGE_ACCESS_TOKEN', 'User')
$env:META_GRAPH_VERSION = [Environment]::GetEnvironmentVariable('META_GRAPH_VERSION', 'User')
node --use-system-ca scripts/publish-facebook-posts.js --now 2026-08-30T00:00:00Z
```

Expected: Graph returns a confirmed post ID and permalink. The queue records `published`; a read-only duplicate lookup using the `/g/?n=` marker returns the same post ID.

- [ ] **Step 7: User verifies the live Facebook layout and link**

Ask the user to check the live post on mobile for:

- three clearly visible product photos;
- readable centered phrases;
- no long URL inside images;
- one clickable short link in caption;
- correct destination and visible affiliate disclosure.

If the user rejects the visual result, add a failing renderer/content test for the specific defect before changing code. Do not delete or replace a live post without explicit user approval.

- [ ] **Step 8: Inspect final history and worktree**

If verification exposes a defect, stop this task and create a new test-first correction task naming the exact failing test and files; do not improvise an untested verification commit. If no correction is needed, do not create an empty commit.

Finally run:

```powershell
git log --oneline --decorate -10
git status --short
```

Expected: focused commits, a clean worktree, and no unrelated homepage change.
