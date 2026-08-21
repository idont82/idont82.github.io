# Laptop Blog Three-Pack and Facebook Publication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish three Korean laptop TOP 3 guides from fresh Coupang data and then publish three Facebook carousel posts consecutively with each blog link on the first caption line.

**Architecture:** A laptop-specific collector produces three validated product JSON files, and a deterministic generator combines those files with editorial configuration to create three static pages and discovery entries. A separate three-item Facebook queue avoids older pending posts in the existing experiment queue; the current publisher is reused, while short-link generation reads both queues and blog captions place the short URL first.

**Tech Stack:** Node.js built-in modules and test runner, vanilla HTML/CSS/JavaScript, existing Coupang search wrapper, existing Facebook Graph API publisher, Python/Pillow card renderer.

**Working directory:** `D:\py_project\claw\idont82.github.io\.worktrees\laptop-blog-three-pack`

**Known baseline failures:** `tests/facebook-short-links.test.js` fails because generated line endings differ, and `tests/root-blog-home.test.js` expects an obsolete first-card order. These pre-existing failures are excluded from feature acceptance; all focused tests and every other relevant regression test must pass.

---

## File Map

- Create `scripts/collect-laptop-products.js`: define nine search roles, validate candidates, enforce global product uniqueness, and write three collected data files.
- Create `tests/laptop-product-collector.test.js`: unit-test collector validation, role selection, all-or-nothing behavior, and file output.
- Create `data/coupang-laptop-value.json`: fresh three-product value-laptop result.
- Create `data/coupang-laptop-performance.json`: fresh three-product performance-laptop result.
- Create `data/coupang-laptop-document.json`: fresh three-product document-work result.
- Create `data/laptop-blog-guides.json`: Korean editorial copy, supported specification notes, selection criteria, limitations, FAQ, and sources.
- Create `scripts/generate-laptop-blog-pages.js`: validate inputs, render three pages, and idempotently update both indexes and sitemap.
- Create `tests/laptop-blog-generator.test.js`: unit-test validation, global uniqueness, rendering, and idempotent insertions.
- Create `tests/laptop-blog-pages.test.js`: integration-test generated pages, nine products, discovery, claims, and cross-links.
- Create three files under `blog/`: generated value, performance, and document-work guides.
- Modify `index.html`, `blog/index.html`, and `sitemap.xml`: add a marker-owned laptop card/URL block exactly once.
- Modify `scripts/facebook-card-content.js`: put the short blog URL on the first caption line while preserving direct-post behavior.
- Modify `tests/facebook-card-content.test.js`: lock the blog-first-line contract and unchanged direct caption order.
- Create `data/facebook-laptop-post-queue.json`: three due, sequential, blog-mode laptop posts using short-link IDs 15–17.
- Modify `scripts/build-facebook-short-links.js`: merge the existing queue and laptop queue before generating browser mappings.
- Modify `tests/facebook-short-links.test.js`: verify IDs 15–17 and deterministic output across both queue files.
- Create `tests/facebook-laptop-queue.test.js`: validate the three-item isolated queue and consecutive due selection.
- Create `tests/facebook-laptop-dry-run.test.js`: render and inspect all three laptop carousel posts without mutating the queue.
- Regenerate `g/links.js` and `g/index.html`: include the three laptop destinations.

### Task 1: Collect Nine Fresh Laptop Listings

**Files:**
- Create: `tests/laptop-product-collector.test.js`
- Create: `scripts/collect-laptop-products.js`
- Create after tests pass: `data/coupang-laptop-value.json`
- Create after tests pass: `data/coupang-laptop-performance.json`
- Create after tests pass: `data/coupang-laptop-document.json`

- [ ] **Step 1: Write the failing collector tests**

Create fixtures with allowed Coupang hosts and test the exported contract:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  QUERY_GROUPS,
  collectLaptopProducts,
  isValidProduct,
  writeProductFiles,
} = require('../scripts/collect-laptop-products');

function product(id, name = `노트북 ${id}`) {
  return {
    productId: id,
    productName: name,
    productPrice: 1000000 + id,
    productImage: `https://ads-partners.coupang.com/${id}.jpg`,
    productUrl: `https://link.coupang.com/a/${id}`,
  };
}

test('가성비·최고성능·문서용 역할을 세 개씩 정의한다', () => {
  assert.deepEqual(Object.keys(QUERY_GROUPS), ['value', 'performance', 'document']);
  assert.ok(Object.values(QUERY_GROUPS).every((queries) => queries.length === 3));
});

test('허용 호스트와 필수 상품 필드를 검증한다', () => {
  assert.equal(isValidProduct(product(1)), true);
  assert.equal(isValidProduct({ ...product(1), productUrl: 'https://example.com/1' }), false);
  assert.equal(isValidProduct({ ...product(1), productPrice: 0 }), false);
});

test('아홉 역할을 전역 중복 없이 모두 수집한다', async () => {
  let id = 0;
  const groups = await collectLaptopProducts({
    search: async ({ keyword }) => ({ items: [product(++id, `${keyword} ${id}`)] }),
    now: () => '2026-08-21T00:00:00.000Z',
  });
  assert.equal(Object.values(groups).flatMap((group) => group.items).length, 9);
  assert.equal(new Set(Object.values(groups).flatMap((group) => group.items.map((item) => item.productId))).size, 9);
});

test('한 역할이라도 상품이 없으면 파일을 쓰기 전에 중단한다', async () => {
  await assert.rejects(
    collectLaptopProducts({ search: async () => ({ items: [] }) }),
    /유효한 쿠팡 상품/,
  );
});

test('그룹별 JSON 파일을 UTF-8로 기록한다', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'laptop-products-'));
  const groups = Object.fromEntries(Object.keys(QUERY_GROUPS).map((group, index) => [group, {
    group,
    verifiedAt: '2026-08-21T00:00:00.000Z',
    queries: QUERY_GROUPS[group],
    items: [product(index * 3 + 1), product(index * 3 + 2), product(index * 3 + 3)],
  }]));
  writeProductFiles(groups, root);
  assert.equal(fs.readdirSync(path.join(root, 'data')).length, 3);
});
```

- [ ] **Step 2: Run the collector test and verify it fails**

Run: `node --test tests/laptop-product-collector.test.js`

Expected: FAIL with `Cannot find module '../scripts/collect-laptop-products'`.

- [ ] **Step 3: Implement the minimal collector**

Create `scripts/collect-laptop-products.js` using the existing `searchProducts` function and this public contract:

```js
const fs = require('node:fs');
const path = require('node:path');
const { searchProducts } = require('./coupang-search-products');

const QUERY_GROUPS = Object.freeze({
  value: ['가성비 노트북 16GB 512GB', '라이젠 노트북 16GB', '인텔 코어 울트라 노트북'],
  performance: ['RTX 5090 게이밍 노트북', 'RTX 5080 게이밍 노트북', 'RTX 5070 Ti 노트북'],
  document: ['문서용 노트북', '사무용 노트북 16GB', '초경량 업무용 노트북'],
});
const OUTPUT_FILES = Object.freeze({
  value: 'coupang-laptop-value.json',
  performance: 'coupang-laptop-performance.json',
  document: 'coupang-laptop-document.json',
});
```

Implement `isValidProduct(product)`, `selectFirstValid(items, seenProductIds)`, `collectLaptopProducts({ search, now })`, and `writeProductFiles(groups, rootDir)`. Pass `limit: 10`, `imageSize: '512x512'`, `subId: laptop-${group}`, `srpLinkOnly: false`, and `insecure: false` to each search. Use one `seenProductIds` set across all groups and add `roleKeyword` to each selected item. Create `rootDir/data` before writes so the isolated write test succeeds.

- [ ] **Step 4: Run tests and verify the collector passes**

Run: `node --test tests/laptop-product-collector.test.js`

Expected: 5 tests pass, 0 fail.

- [ ] **Step 5: Run the live Coupang collection**

Run: `node scripts/collect-laptop-products.js`

Expected: JSON output with `status: "ok"`, three filenames, and `productCount: 9`. Inspect all nine product names and reject accessories, duplicate model variants, or listings whose titles do not expose useful laptop specifications; refine only the affected query and rerun if necessary.

- [ ] **Step 6: Commit the collector and collected data**

```powershell
git add -- scripts/collect-laptop-products.js tests/laptop-product-collector.test.js data/coupang-laptop-value.json data/coupang-laptop-performance.json data/coupang-laptop-document.json
git commit -m "feat: collect laptop guide products"
```

### Task 2: Generate the Three Laptop Guides

**Files:**
- Create: `tests/laptop-blog-generator.test.js`
- Create: `scripts/generate-laptop-blog-pages.js`
- Create: `data/laptop-blog-guides.json`

- [ ] **Step 1: Write failing generator unit tests**

Build one sample page containing `slug`, `productType`, `keyword`, `productData`, `title`, `description`, `intro`, three `criteria`, three `roleLabels`, three `productNotes` objects (`fit`, `specs`, `limitation`), `caution`, `faq`, and `sources`. Assert:

```js
validateInputs([page], { 'sample.json': productData });
const html = renderArticle(page, productData, [page]);
assert.match(html, /class="laptop-product-card"/);
assert.equal((html.match(/class="laptop-product-card"/g) || []).length, 3);
assert.match(html, /data-coupang-placement="article_hero"/);
assert.match(html, /data-coupang-placement="product_card"/);
assert.match(html, /BlogPosting/);
assert.match(html, /수집 시점/);
```

Also assert `validateInputs` rejects a non-Coupang URL, a page with two products, and duplicate product IDs across two different pages. Assert `updateRootIndex`, `updateBlogIndex`, and `updateSitemap` are idempotent and insert a sample slug exactly once between laptop-specific markers.

- [ ] **Step 2: Run the generator test and verify it fails**

Run: `node --test tests/laptop-blog-generator.test.js`

Expected: FAIL with `Cannot find module '../scripts/generate-laptop-blog-pages'`.

- [ ] **Step 3: Implement validated deterministic generation**

Create `scripts/generate-laptop-blog-pages.js` by following the proven autumn generator structure, with these constants and exports:

```js
const PUBLISHED_DATE = '2026-08-21';
const AFFILIATE_DISCLOSURE = '이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';
const ROOT_INDEX_START = '<!-- LAPTOP-BLOG-START -->';
const ROOT_INDEX_END = '<!-- LAPTOP-BLOG-END -->';
const BLOG_INDEX_START = '<!-- LAPTOP-BLOG-INDEX-START -->';
const BLOG_INDEX_END = '<!-- LAPTOP-BLOG-INDEX-END -->';
const SITEMAP_START = '<?LAPTOP-SITEMAP-START?>';
const SITEMAP_END = '<?LAPTOP-SITEMAP-END?>';

module.exports = {
  generate,
  renderArticle,
  updateBlogIndex,
  updateRootIndex,
  updateSitemap,
  validateInputs,
};
```

Validate exactly three manifest pages, exactly three products and three product notes per page, and nine globally unique numeric product IDs. Render the standard Gold Pick navigation, unique SEO and social metadata, `BlogPosting` JSON-LD, summary, hero, criteria, comparison table, three product cards, fit/specification/limitation copy, caution, FAQ, references, related links to the other two laptop pages, disclosure, mobile CTA, and `/blog/assets/blog.js`. Use laptop-specific CSS class names and a responsive one-column product-card layout below 680 px.

`generate()` must first compute all six outputs in memory—three pages, root index, blog index, sitemap—and only then write them. Marker helpers must replace their own existing block before reinsertion and preserve unrelated content.

- [ ] **Step 4: Write the complete Korean editorial manifest**

Create `data/laptop-blog-guides.json` with these slugs and product sources:

```json
[
  {
    "slug": "best-value-laptop-top3-guide",
    "productType": "laptop_value_top3",
    "keyword": "가성비 노트북 추천",
    "productData": "coupang-laptop-value.json",
    "productCount": 3
  },
  {
    "slug": "highest-performance-laptop-top3-guide",
    "productType": "laptop_performance_top3",
    "keyword": "최고성능 노트북 추천",
    "productData": "coupang-laptop-performance.json",
    "productCount": 3
  },
  {
    "slug": "document-work-laptop-top3-guide",
    "productType": "laptop_document_top3",
    "keyword": "문서용 노트북 추천",
    "productData": "coupang-laptop-document.json",
    "productCount": 3
  }
]
```

Expand every entry with final Korean title, description, intro, three role labels, three criteria, caution, at least three FAQ pairs, at least two authoritative source pairs, and three product-note objects matched to the collected listing titles. Mention only specifications present in those titles/data. Do not state benchmark rankings, tested battery life, thermal superiority, or personal-use experience. For performance models, explicitly state that GPU wattage, cooling design, display option, RAM expansion, and adapter weight require final detail-page confirmation. For document models, state that office software inclusion and Windows inclusion vary by option.

- [ ] **Step 5: Run generator tests, generate pages, and re-run determinism check**

Run the generator once, snapshot hashes, run it again, and compare hashes:

```powershell
node --test tests/laptop-blog-generator.test.js
node scripts/generate-laptop-blog-pages.js
$paths = @('blog/best-value-laptop-top3-guide.html','blog/highest-performance-laptop-top3-guide.html','blog/document-work-laptop-top3-guide.html','index.html','blog/index.html','sitemap.xml')
$before = $paths | ForEach-Object { (Get-FileHash -Algorithm SHA256 -LiteralPath $_).Hash }
node scripts/generate-laptop-blog-pages.js
$after = $paths | ForEach-Object { (Get-FileHash -Algorithm SHA256 -LiteralPath $_).Hash }
if (Compare-Object $before $after) { throw 'Laptop generator is not deterministic' }
```

Expected: the hash comparison is empty, proving deterministic regeneration.

- [ ] **Step 6: Commit the generator, configuration, pages, and discovery changes**

```powershell
git add -- scripts/generate-laptop-blog-pages.js tests/laptop-blog-generator.test.js data/laptop-blog-guides.json blog/best-value-laptop-top3-guide.html blog/highest-performance-laptop-top3-guide.html blog/document-work-laptop-top3-guide.html index.html blog/index.html sitemap.xml
git commit -m "feat: add laptop buying guide three pack"
```

### Task 3: Lock Page-Level Content and Discovery Contracts

**Files:**
- Create: `tests/laptop-blog-pages.test.js`
- Modify if the test exposes a defect: `scripts/generate-laptop-blog-pages.js`
- Modify if editorial data is incomplete: `data/laptop-blog-guides.json`

- [ ] **Step 1: Write page integration tests**

Create tests that load the manifest and all three generated pages, then assert:

```js
assert.equal(manifest.length, 3);
assert.equal(allProductIds.size, 9);
assert.equal((html.match(/class="laptop-product-card"/g) || []).length, 3);
assert.equal((html.match(/<h1\b/g) || []).length, 1);
assert.match(html, /<meta name="description"/);
assert.match(html, /<link rel="canonical"/);
assert.match(html, /max-image-preview:large/);
assert.match(html, /BlogPosting/);
assert.match(html, /data-coupang-placement="article_hero"/);
assert.match(html, /data-coupang-placement="mobile_summary_card"/);
assert.match(html, /rel="sponsored nofollow"/);
assert.match(html, /쿠팡 파트너스 활동의 일환/);
```

Assert every page links to the other two laptop slugs, every slug occurs exactly once in `index.html`, `blog/index.html`, and `sitemap.xml`, and no page contains `직접 사용`, `써보니`, `벤치마크 1위`, or `배터리 종일`. Add category-specific assertions for performance confirmation cautions and document-work OS/Office option cautions.

- [ ] **Step 2: Run the integration test and fix only concrete failures**

Run: `node --test tests/laptop-blog-pages.test.js`

Expected: all tests pass. If a failure occurs, update the generator or editorial manifest, regenerate all three pages, and rerun both laptop generator and page tests.

- [ ] **Step 3: Run affiliate and sitemap regressions**

Run:

```powershell
node --test tests/laptop-blog-generator.test.js tests/laptop-blog-pages.test.js tests/blog-coupang-tracking.test.js tests/sitewide-coupang-tracking.test.js tests/sitemap.test.js
```

Expected: all selected tests pass.

- [ ] **Step 4: Commit the integration contract**

```powershell
git add -- tests/laptop-blog-pages.test.js scripts/generate-laptop-blog-pages.js data/laptop-blog-guides.json blog/best-value-laptop-top3-guide.html blog/highest-performance-laptop-top3-guide.html blog/document-work-laptop-top3-guide.html
git commit -m "test: verify laptop guide content"
```

### Task 4: Put Blog Links on the First Facebook Caption Line

**Files:**
- Modify: `tests/facebook-card-content.test.js`
- Modify: `scripts/facebook-card-content.js`

- [ ] **Step 1: Write a failing first-line caption test**

Extend the existing blog-mode test with:

```js
const blogLines = content.caption.split('\n');
assert.equal(blogLines[0], content.link);
assert.equal(blogLines[1], '');
assert.equal((content.caption.match(new RegExp(content.link.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length, 1);
assert.ok(blogLines.indexOf(queueItem.cardCopy[0]) > 0);
```

Extend the direct-mode test to assert `direct.caption.split('\n')[0] === queueItem.cardCopy[0]`, preserving its current ordering.

- [ ] **Step 2: Run the focused test and verify it fails**

Run: `node --test tests/facebook-card-content.test.js`

Expected: the new blog first-line assertion fails because the current first line is `cardCopy[0]`.

- [ ] **Step 3: Implement mode-specific caption construction**

Replace the single caption template in `buildPostContent` with:

```js
const caption = queueItem.linkMode === 'blog'
  ? `${link}\n\n${queueItem.cardCopy[0]}\n${queueItem.cardCopy[1]}\n\n${DISCLOSURE}`
  : `${queueItem.cardCopy[0]}\n${queueItem.cardCopy[1]}\n\n${link}\n\n${DISCLOSURE}`;
```

Do not change `destinationLink`, `duplicateMarker`, carousel slides, or direct affiliate URL handling.

- [ ] **Step 4: Run Facebook content and publisher regressions**

Run:

```powershell
node --test tests/facebook-card-content.test.js tests/facebook-publisher.test.js tests/facebook-workflow.test.js
```

Expected: all selected tests pass.

- [ ] **Step 5: Commit the caption change**

```powershell
git add -- scripts/facebook-card-content.js tests/facebook-card-content.test.js
git commit -m "fix: lead Facebook blog posts with links"
```

### Task 5: Add an Isolated Three-Post Laptop Queue and Short Links

**Files:**
- Create: `tests/facebook-laptop-queue.test.js`
- Create: `data/facebook-laptop-post-queue.json`
- Modify: `scripts/build-facebook-short-links.js`
- Modify: `tests/facebook-short-links.test.js`
- Modify generated: `g/links.js`
- Modify generated: `g/index.html`

- [ ] **Step 1: Write failing laptop queue tests**

Test that the new queue contains exactly three items, validates with `validateQueue`, uses IDs and short links `[15, 16, 17]`, has three distinct article paths, all `linkMode` values equal `blog`, and all `scheduledAt` values are due on 2026-08-21. Repeatedly call `selectDuePost`, transition the selected item through `rendered`, `publishing`, and `published`, and assert selection order is value → performance → document.

- [ ] **Step 2: Create the three-item queue**

Create `data/facebook-laptop-post-queue.json` with this shape and final Korean card copy of at most 28 characters per phrase:

```json
[
  {
    "id": "20260821-laptop-value-top3",
    "category": "laptop",
    "article": "/blog/best-value-laptop-top3-guide.html",
    "linkMode": "blog",
    "scheduledAt": "2026-08-21T09:00:00+09:00",
    "shortLinkId": 15,
    "cardCopy": ["가성비 노트북 TOP 3", "가격 · 메모리 · 저장공간 비교", "예산에 맞는 선택 기준"],
    "status": "queued",
    "attempts": 0,
    "facebookPostId": null,
    "facebookPermalink": null,
    "publishedAt": null,
    "lastError": null,
    "trackingId": null
  }
]
```

Add analogous performance and document entries scheduled one minute apart, using short IDs 16 and 17.

- [ ] **Step 3: Run queue tests**

Run: `node --test tests/facebook-laptop-queue.test.js tests/facebook-post-queue.test.js`

Expected: both suites pass; the existing initial experiment remains exactly 14 items because it is not modified.

- [ ] **Step 4: Write a failing combined-short-link test**

Update `tests/facebook-short-links.test.js` to assert the generated mapping contains IDs 1–17, and IDs 15–17 resolve to tracked URLs for the three laptop articles. Normalize generated text to `\n` before deterministic comparison so the known Windows line-ending baseline issue does not mask actual content determinism.

- [ ] **Step 5: Merge both queues in the short-link builder**

Change `scripts/build-facebook-short-links.js` from one required queue to:

```js
const queues = [
  require('../data/facebook-post-queue.json'),
  require('../data/facebook-laptop-post-queue.json'),
];
const queue = queues.flat();
validateQueue(queue);
```

Keep destination construction, safe resolver behavior, and generated browser redirect behavior unchanged.

- [ ] **Step 6: Regenerate and verify short links**

Run:

```powershell
node scripts/build-facebook-short-links.js
node --test tests/facebook-short-links.test.js tests/facebook-laptop-queue.test.js tests/facebook-post-queue.test.js
```

Expected: all selected tests pass and generated mappings contain 17 immutable IDs.

- [ ] **Step 7: Commit the queue and link mappings**

```powershell
git add -- data/facebook-laptop-post-queue.json tests/facebook-laptop-queue.test.js scripts/build-facebook-short-links.js tests/facebook-short-links.test.js g/links.js g/index.html
git commit -m "feat: queue laptop Facebook posts"
```

### Task 6: Verify Pages, Dry-Run Cards, and Integrate the Branch

**Files:**
- Verification only unless a focused failure requires a task-scoped correction.
- Create: `tests/facebook-laptop-dry-run.test.js`

- [ ] **Step 1: Run the complete task-focused suite**

Run:

```powershell
node --test tests/laptop-product-collector.test.js tests/laptop-blog-generator.test.js tests/laptop-blog-pages.test.js tests/blog-coupang-tracking.test.js tests/sitewide-coupang-tracking.test.js tests/sitemap.test.js tests/facebook-card-content.test.js tests/facebook-laptop-queue.test.js tests/facebook-post-queue.test.js tests/facebook-short-links.test.js tests/facebook-publisher.test.js tests/facebook-workflow.test.js
```

Expected: all selected tests pass.

- [ ] **Step 2: Verify deterministic generation and clean diffs**

Run:

```powershell
node scripts/generate-laptop-blog-pages.js
node scripts/build-facebook-short-links.js
git diff --exit-code
git diff --check
git status --short
```

Expected: no generator diff, no whitespace errors, and a clean feature worktree.

- [ ] **Step 3: Write and run a three-post dry-run test without queue mutation**

Create `tests/facebook-laptop-dry-run.test.js` that loads every laptop queue item, reads its article, builds content, renders cards into a temporary directory, and verifies the first line:

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const queue = require('../data/facebook-laptop-post-queue.json');
const { buildPostContent } = require('../scripts/facebook-card-content');
const { renderWithPython } = require('../scripts/publish-facebook-posts');

test('노트북 게시물 세 건을 링크 첫 줄로 모두 렌더링한다', () => {
  const root = path.join(__dirname, '..');
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'laptop-facebook-dry-run-'));
  for (const item of queue) {
    const html = fs.readFileSync(path.join(root, item.article.replace(/^\//, '')), 'utf8');
    const content = buildPostContent(item, html);
    const files = renderWithPython(content, path.join(outputRoot, item.id), root);
    assert.equal(content.caption.split('\n')[0], `https://idont82.github.io/g/?n=${item.shortLinkId}`);
    assert.equal(files.length, 3);
  }
});
```

Run: `node --test tests/facebook-laptop-dry-run.test.js`

Expected: 1 test passes, all three items render three 1080×1350 cards, and the checked-in queue remains unchanged.

- [ ] **Step 4: Run local HTTP and visual checks**

Start `node server.js`, request all three URLs at `http://localhost:3000`, and verify HTTP 200. Inspect desktop and mobile widths for Korean text, one `h1`, hero image containment, comparison-table horizontal safety, stacked mobile product cards, fixed mobile CTA, and working related/affiliate links. Stop the server after inspection.

- [ ] **Step 5: Perform an independent code review**

Review the branch diff against `docs/superpowers/specs/2026-08-21-laptop-blog-three-pack-facebook-design.md`, focusing on unsupported laptop claims, nine-product uniqueness, index marker safety, caption ordering, queue isolation, and whether any unrelated file entered a commit. For each verified defect, add a failing focused assertion, implement the smallest correction, rerun the affected suite, and commit the test with its fix.

- [ ] **Step 6: Merge the feature branch without touching unrelated main-worktree changes**

From the main worktree, verify `git status --short`, then merge `feat/laptop-blog-three-pack` into `main` with a non-interactive merge. If main advanced, rebase or merge main into the feature worktree and rerun the focused suite before integration. Do not stage, stash, or commit unrelated main-worktree files.

### Task 7: Deploy and Publish Three Consecutive Facebook Posts

**Files:**
- Modify during publishing: `data/facebook-laptop-post-queue.json`

- [ ] **Step 1: Push the verified main branch**

Run `git push origin main` only after confirming local `main` contains the integrated feature commits and all focused verification is green.

- [ ] **Step 2: Verify public deployment**

Request these public URLs with a cache-busting query and require HTTP 200 plus the expected `h1` and `data-coupang-placement="article_hero"` marker:

```text
https://idont82.github.io/blog/best-value-laptop-top3-guide.html?verify=20260821
https://idont82.github.io/blog/highest-performance-laptop-top3-guide.html?verify=20260821
https://idont82.github.io/blog/document-work-laptop-top3-guide.html?verify=20260821
```

Do not publish Facebook posts until all three checks succeed.

- [ ] **Step 3: Publish the value post**

Load `META_PAGE_ID`, `META_PAGE_ACCESS_TOKEN`, and `META_GRAPH_VERSION` from user environment variables, then run:

```powershell
node --use-system-ca scripts/publish-facebook-posts.js --queue data/facebook-laptop-post-queue.json --output-dir .facebook-artifacts/laptop-live --now 2026-08-21T09:05:00+09:00
```

Require `status: "published"` or `"recovered"`, confirm queue item 15 has a Facebook post ID/permalink, and verify its published message begins with `https://idont82.github.io/g/?n=15`.

- [ ] **Step 4: Publish performance and document posts consecutively**

Repeat the same command twice. Because each successful call marks one queue item published, selection advances to IDs 16 and 17. Stop immediately on any failure. Require both persisted post confirmations and first-line links `?n=16` and `?n=17`.

- [ ] **Step 5: Commit publication receipts and push**

```powershell
git add -- data/facebook-laptop-post-queue.json
git commit -m "chore: record laptop Facebook posts"
git push origin main
```

Report all three public blog URLs, Facebook permalinks, product verification timestamp, test command/result, and the two explicitly excluded pre-existing baseline failures.
