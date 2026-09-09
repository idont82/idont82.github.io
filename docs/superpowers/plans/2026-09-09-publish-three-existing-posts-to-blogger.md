# Publish Three Existing Posts to Blogger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish two laptop guides and one Lactofit guide from the existing static site to Blogger with no duplicate posts and no mobile horizontal overflow.

**Architecture:** Extend the current source-marker-based importer with a focused extraction path for legacy `blog-article-shell` pages, canonical disclosure normalization, and scoped responsive styles for their product cards. Reuse the existing Blogger update-or-insert workflow, then verify each public page through API checks and 430px Chrome screenshots.

**Tech Stack:** Node.js CommonJS, `node:test`, Blogger API v3, vanilla HTML/CSS, headless Chrome

---

## File Structure

- Modify `scripts/publish-existing-page-to-blogger.js`: extract legacy article shells, remove fixed-width embeds, normalize disclosures, decorate legacy product cards, and validate responsive output.
- Modify `tests/publish-existing-page-to-blogger.test.js`: add realistic legacy article fixtures and regression tests.
- Create private publication records under ignored `.blogger-artifacts/imports/` through the existing publisher; these are runtime artifacts, not committed files.
- Do not modify the three source HTML pages.

### Task 1: Extract the legacy article without sidebars or embeds

**Files:**
- Modify: `scripts/publish-existing-page-to-blogger.js`
- Test: `tests/publish-existing-page-to-blogger.test.js`

- [ ] **Step 1: Write the failing extraction test**

Add this fixture containing `blog-layout`, left and right sidebars, `blog-article-shell`, three product cards, repeated disclosures, and an iframe:

```js
const legacySourceUrl = 'https://idont82.github.io/blog/lactofit-guide.html';
const DISCLOSURE_TEXT_FOR_TEST = '이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';
const legacyHtml = `<!doctype html><html><head><title>락토핏 유산균 추천 | 골드픽 노트</title></head><body>
  <main class="blog-layout">
    <aside>왼쪽 사이드바</aside>
    <section class="blog-main"><article class="blog-article-shell">
      <h1>락토핏 유산균 추천</h1>
      <p>가족용 유산균 선택 기준을 확인합니다.</p>
      <iframe src="https://ads.example/widget" width="380"></iframe>
      <div class="article-product-detail-list">
        <section class="product-detail-card"><img src="/images/one.jpg"><div class="product-detail-price"><strong>10,000원</strong></div><a class="product-detail-btn" href="/one">비교하기</a><p class="blog-ad-disclosure">쿠팡 파트너스 활동으로 일정액의 수수료를 제공받을 수 있습니다.</p></section>
        <section class="product-detail-card"><img src="/images/two.jpg"><div class="product-detail-price"><strong>20,000원</strong></div><a class="product-detail-btn" href="/two">비교하기</a><p class="blog-ad-disclosure">쿠팡 파트너스 활동으로 일정액의 수수료를 제공받을 수 있습니다.</p></section>
        <section class="product-detail-card"><img src="/images/three.jpg"><div class="product-detail-price"><strong>30,000원</strong></div><a class="product-detail-btn" href="/three">비교하기</a><p class="blog-ad-disclosure">쿠팡 파트너스 활동으로 일정액의 수수료를 제공받을 수 있습니다.</p></section>
      </div>
    </article></section>
    <aside>오른쪽 사이드바</aside>
  </main>
</body></html>`;

test('imports only the legacy article shell and removes fixed-width embeds', () => {
  const post = buildImportedPost(legacyHtml, legacySourceUrl);

  assert.equal(post.title, '락토핏 유산균 추천');
  assert.match(post.content, /가족용 유산균 선택 기준/);
  assert.doesNotMatch(post.content, /왼쪽 사이드바|오른쪽 사이드바|<iframe\b/i);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```powershell
node --test --test-name-pattern="legacy article shell" tests/publish-existing-page-to-blogger.test.js
```

Expected: FAIL because the current importer copies the complete `<main>` including sidebars.

- [ ] **Step 3: Implement focused extraction and embed removal**

Add helpers that prefer `blog-article-shell` and remove iframe blocks before decoration:

```js
function extractArticleContent(html) {
  const legacy = String(html).match(/<article\b[^>]*class=(['"])[^'"]*\bblog-article-shell\b[^'"]*\1[^>]*>([\s\S]*?)<\/article>/i);
  if (legacy) return legacy[2];
  return extractMain(html);
}

function removeFixedEmbeds(html) {
  return html.replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '');
}
```

Use `extractArticleContent()` and `removeFixedEmbeds()` inside `buildImportedPost()`.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run the command from Step 2. Expected: PASS.

- [ ] **Step 5: Commit the extraction change**

```powershell
git add -- scripts/publish-existing-page-to-blogger.js tests/publish-existing-page-to-blogger.test.js
git commit --only scripts/publish-existing-page-to-blogger.js tests/publish-existing-page-to-blogger.test.js -m "feat: import legacy Blogger article shells"
```

### Task 2: Normalize disclosure text to one bottom notice

**Files:**
- Modify: `scripts/publish-existing-page-to-blogger.js`
- Test: `tests/publish-existing-page-to-blogger.test.js`

- [ ] **Step 1: Write the failing disclosure test**

Use the legacy fixture with several `.blog-ad-disclosure` paragraphs. Assert that the canonical disclosure appears exactly once and is the final element.

```js
test('normalizes legacy Coupang disclosures to one notice at the bottom', () => {
  const post = buildImportedPost(legacyHtml, legacySourceUrl);
  const count = post.content.split(DISCLOSURE_TEXT_FOR_TEST).length - 1;

  assert.equal(count, 1);
  assert.ok(post.content.trim().endsWith(`${DISCLOSURE_TEXT_FOR_TEST}</p>`));
});
```

- [ ] **Step 2: Run the focused test and verify RED**

```powershell
node --test --test-name-pattern="normalizes legacy Coupang" tests/publish-existing-page-to-blogger.test.js
```

Expected: FAIL because only the current exact disclosure variant is accepted and removed.

- [ ] **Step 3: Implement disclosure normalization**

Collect all paragraph elements whose class contains `disclosure`, require at least one to contain `쿠팡 파트너스`, remove them all, and append the existing `DISCLOSURE_TEXT` once at the end. Keep the existing failure for pages with no qualifying notice.

- [ ] **Step 4: Run the focused and complete importer tests**

```powershell
node --test tests/publish-existing-page-to-blogger.test.js
```

Expected: all importer tests PASS.

- [ ] **Step 5: Commit the normalization change**

```powershell
git add -- scripts/publish-existing-page-to-blogger.js tests/publish-existing-page-to-blogger.test.js
git commit --only scripts/publish-existing-page-to-blogger.js tests/publish-existing-page-to-blogger.test.js -m "fix: normalize imported affiliate disclosures"
```

### Task 3: Add responsive legacy product-card styling

**Files:**
- Modify: `scripts/publish-existing-page-to-blogger.js`
- Test: `tests/publish-existing-page-to-blogger.test.js`

- [ ] **Step 1: Write the failing mobile layout test**

Assert that legacy output has three decorated cards and scoped mobile rules that collapse grids and contain media.

```js
test('renders legacy product cards without mobile overflow', () => {
  const post = buildImportedPost(legacyHtml, legacySourceUrl);

  assert.equal((post.content.match(/data-blogger-product-card="styled"/g) || []).length, 3);
  assert.match(post.content, /\.goldpick-import \.product-detail-card/);
  assert.match(post.content, /@media\s*\(max-width:680px\)[\s\S]*\.product-detail-card\{display:block!important/);
  assert.doesNotMatch(post.content, /<iframe\b/i);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

```powershell
node --test --test-name-pattern="legacy product cards" tests/publish-existing-page-to-blogger.test.js
```

Expected: FAIL because the current decorator only recognizes laptop card classes.

- [ ] **Step 3: Implement scoped styles and inline fallbacks**

Extend the scoped stylesheet for `.article-summary-box`, `.article-hero`, `.article-choice-grid`, `.article-product-detail-list`, `.product-detail-card`, `.product-detail-media`, `.product-detail-info`, `.product-detail-price`, and `.product-detail-btn`. At 680px or below, force cards and grids to one column, set all media to `max-width:100%`, and allow long text to wrap with `overflow-wrap:anywhere`.

Decorate exactly three `.product-detail-card` elements with `data-blogger-product-card="styled"`, their prices with `data-blogger-price="prominent"`, and their buttons with `data-blogger-buy-button="styled"`.

- [ ] **Step 4: Extend remote verification**

When expected content contains `.product-detail-card`, require three card, price, and button markers plus the legacy scoped mobile rule. Return `responsive: true` only after those checks pass.

- [ ] **Step 5: Run all Blogger tests and verify GREEN**

```powershell
node --test tests/blogger-*.test.js tests/build-blogger-health-post.test.js tests/publish-blogger-assets.test.js tests/publish-blogger-health-post.test.js tests/publish-existing-page-to-blogger.test.js
```

Expected: all tests PASS with zero failures.

- [ ] **Step 6: Commit the responsive styling**

```powershell
git add -- scripts/publish-existing-page-to-blogger.js tests/publish-existing-page-to-blogger.test.js
git commit --only scripts/publish-existing-page-to-blogger.js tests/publish-existing-page-to-blogger.test.js -m "fix: make legacy Blogger cards responsive"
```

### Task 4: Publish the selected posts without duplicates

**Files:**
- Runtime only: `.blogger-artifacts/imports/*.json`

- [ ] **Step 1: Publish the highest-performance laptop guide**

```powershell
node --use-system-ca scripts/publish-existing-page-to-blogger.js --file blog/highest-performance-laptop-top3-guide.html --url https://idont82.github.io/blog/highest-performance-laptop-top3-guide.html
```

Expected: JSON with `status` equal to `published` or `updated`, four images, three cards, three prices, three buttons, and `responsive: true`.

- [ ] **Step 2: Publish the document-work laptop guide**

```powershell
node --use-system-ca scripts/publish-existing-page-to-blogger.js --file blog/document-work-laptop-top3-guide.html --url https://idont82.github.io/blog/document-work-laptop-top3-guide.html
```

Expected: the same validation shape as Step 1.

- [ ] **Step 3: Publish the Lactofit guide**

```powershell
node --use-system-ca scripts/publish-existing-page-to-blogger.js --file blog/lactofit-probiotics-home-shopping-guide.html --url https://idont82.github.io/blog/lactofit-probiotics-home-shopping-guide.html
```

Expected: JSON with `status` equal to `published` or `updated`, at least three images, three styled product cards, one bottom disclosure, and `responsive: true`.

- [ ] **Step 4: Confirm three distinct source markers and URLs**

Read the three ignored publication records and verify that every record has a different `slug`, `postId`, and public Blogger URL.

### Task 5: Verify public mobile rendering

**Files:**
- Runtime screenshots: `.blogger-artifacts/layout-audit/`

- [ ] **Step 1: Capture each public page at 430px**

Run headless Chrome with a fresh `--user-data-dir`, `--window-size=430,2600`, software rendering flags, and each Blogger URL. Save one PNG per post under `.blogger-artifacts/layout-audit/`.

- [ ] **Step 2: Inspect each screenshot**

Confirm that titles wrap, images stay inside the article, comparison tables have no horizontal scrollbar, product cards use one column, prices and buttons are legible, and content continues to the bottom without clipping.

- [ ] **Step 3: Run final automated verification**

```powershell
node --test tests/blogger-*.test.js tests/build-blogger-health-post.test.js tests/publish-blogger-assets.test.js tests/publish-blogger-health-post.test.js tests/publish-existing-page-to-blogger.test.js
git diff --check
git status -sb
```

Expected: zero test failures, no whitespace errors in task files, and no unrelated user files staged.
