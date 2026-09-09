# Publish Collagen Post to Blogger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the existing low-molecular collagen guide to Blogger with the already-tested responsive legacy product layout.

**Architecture:** Reuse `scripts/publish-existing-page-to-blogger.js` without production code changes. Validate the transformed source locally, publish or update by its stable source marker, and verify the public page through Blogger API checks and a 430px Chrome screenshot.

**Tech Stack:** Node.js CommonJS, `node:test`, Blogger API v3, headless Chrome

---

## File Structure

- Read only: `blog/collagen-retinol-home-shopping-guide.html`
- Execute unchanged: `scripts/publish-existing-page-to-blogger.js`
- Runtime record: `.blogger-artifacts/imports/blog-collagen-retinol-home-shopping-guide-html.json`
- Runtime screenshot: `.blogger-artifacts/layout-audit/blogger-collagen-mobile.png`
- No source or test file changes are expected.

### Task 1: Verify the existing importer supports the collagen source

**Files:**
- Read: `blog/collagen-retinol-home-shopping-guide.html`
- Test: `tests/publish-existing-page-to-blogger.test.js`

- [ ] **Step 1: Run the complete importer tests**

```powershell
node --test tests/publish-existing-page-to-blogger.test.js
```

Expected: all tests pass, including legacy article extraction, disclosure normalization, three product markers, and mobile overflow prevention.

- [ ] **Step 2: Validate the source structure without writing files**

```powershell
rg -c 'class="product-detail-card"' blog/collagen-retinol-home-shopping-guide.html
rg -c 'class="product-detail-price"' blog/collagen-retinol-home-shopping-guide.html
rg -c 'class="product-detail-btn"' blog/collagen-retinol-home-shopping-guide.html
rg -c '쿠팡 파트너스' blog/collagen-retinol-home-shopping-guide.html
```

Expected: exactly three product cards, prices, and buttons, plus at least one qualifying affiliate notice.

### Task 2: Publish without creating duplicates

**Files:**
- Runtime: `.blogger-artifacts/imports/blog-collagen-retinol-home-shopping-guide-html.json`

- [ ] **Step 1: Run the existing publisher**

```powershell
node --use-system-ca scripts/publish-existing-page-to-blogger.js --file blog/collagen-retinol-home-shopping-guide.html --url https://idont82.github.io/blog/collagen-retinol-home-shopping-guide.html
```

Expected: JSON with `status` equal to `published` or `updated`; `images` at least 3; `productCards`, `prominentPrices`, and `purchaseButtons` equal to 3; and `responsive` equal to true.

- [ ] **Step 2: Verify the private publication record**

Read `.blogger-artifacts/imports/blog-collagen-retinol-home-shopping-guide-html.json` and confirm its `sourceUrl`, `postId`, public `url`, and status match the publisher output.

### Task 3: Verify mobile rendering and finish

**Files:**
- Runtime: `.blogger-artifacts/layout-audit/blogger-collagen-mobile.png`

- [ ] **Step 1: Capture the public page at 430px**

Run Chrome headless with a fresh `--user-data-dir`, software rendering flags, `--window-size=430,6000`, and the public Blogger URL. Save the screenshot to `.blogger-artifacts/layout-audit/blogger-collagen-mobile.png`.

- [ ] **Step 2: Inspect the screenshot**

Confirm that the title wraps inside the viewport, images remain within the article, three product cards form one column, each price and purchase button is visible, fixed-width iframe content is absent, and the page has no horizontal overflow.

- [ ] **Step 3: Run final verification**

```powershell
node --test tests/blogger-*.test.js tests/build-blogger-health-post.test.js tests/publish-blogger-assets.test.js tests/publish-blogger-health-post.test.js tests/publish-existing-page-to-blogger.test.js
git diff --check -- scripts/publish-existing-page-to-blogger.js tests/publish-existing-page-to-blogger.test.js
git status -sb
```

Expected: zero test failures, no task-file whitespace errors, no production code changes, and no unrelated user files staged.
