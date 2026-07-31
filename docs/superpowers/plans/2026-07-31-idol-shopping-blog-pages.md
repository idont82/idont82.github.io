# Idol Shopping Blog Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build five Korean idol shopping guides that connect current search interest to curated official, licensed, or generic fan products without duplicating existing concert-checklist content.

**Architecture:** Store page-specific editorial and Coupang result data in one JSON file, render five static pages with one vanilla Node generator, and verify the published HTML with a Node test. Reuse the existing blog CSS and JavaScript so the pages inherit the site's desktop and mobile layout.

**Tech Stack:** Vanilla HTML/CSS, Node.js CommonJS, `node:test`, JSON

---

### Task 1: Define the publishing contract

**Files:**
- Create: `tests/idol-shopping-blog-pages.test.js`

- [ ] **Step 1: Write the failing page contract test**

Create a `node:test` suite listing the five expected slugs and asserting that every page has one H1, Korean metadata, canonical URL, `BlogPosting` JSON-LD, mobile and in-article ads, a right sidebar, official/licensed/generic-product guidance, tracked sponsored links, an affiliate disclosure, and links from `index.html` and `sitemap.xml`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/idol-shopping-blog-pages.test.js`

Expected: FAIL because `blog/bts-tinytan-goods-guide.html` and the other new pages do not exist.

### Task 2: Add curated source data and a generator

**Files:**
- Create: `data/idol-shopping-blog-pages.json`
- Create: `scripts/generate-idol-shopping-blog-pages.js`
- Create: `blog/bts-tinytan-goods-guide.html`
- Create: `blog/seventeen-photocard-binder-guide.html`
- Create: `blog/ive-album-photocard-guide.html`
- Create: `blog/aespa-season-greeting-album-guide.html`
- Create: `blog/blackpink-album-photocard-storage-guide.html`

- [ ] **Step 1: Add the five-page data model**

For each page store `slug`, `group`, `title`, `description`, `keyword`, `summary`, three comparison points, three buying checks, sources, related links, and three curated Coupang products with the API verification date.

- [ ] **Step 2: Implement the static generator**

Read the JSON, escape all editorial and product values, build valid `BlogPosting` JSON-LD, render the existing three-column blog shell, add a product comparison table and three product cards, and write each page as UTF-8.

- [ ] **Step 3: Generate the HTML pages**

Run: `node scripts/generate-idol-shopping-blog-pages.js`

Expected: output reports five generated page paths.

- [ ] **Step 4: Run the page contract test**

Run: `node --test tests/idol-shopping-blog-pages.test.js`

Expected: page-level assertions pass while discovery assertions still fail until index and sitemap links are added.

### Task 3: Publish discovery links

**Files:**
- Modify: `index.html`
- Modify: `sitemap.xml`

- [ ] **Step 1: Add five index links without replacing existing work**

Insert one new idol-shopping content section or five cards using the exact generated page URLs. Preserve all existing staged and unstaged content.

- [ ] **Step 2: Add five sitemap entries**

Append five unique `<url>` entries with the canonical locations and `2026-07-31` as `lastmod`, without changing unrelated entries.

- [ ] **Step 3: Run the full page contract test**

Run: `node --test tests/idol-shopping-blog-pages.test.js`

Expected: all tests pass.

### Task 4: Validate generated output

**Files:**
- Verify: all files above

- [ ] **Step 1: Regenerate and confirm deterministic output**

Run: `node scripts/generate-idol-shopping-blog-pages.js`

Expected: the same five paths are written with no errors.

- [ ] **Step 2: Run syntax and content checks**

Run: `node --check scripts/generate-idol-shopping-blog-pages.js`

Expected: exit code 0.

Run: `node --test tests/idol-shopping-blog-pages.test.js`

Expected: all tests pass.

- [ ] **Step 3: Review only scoped diffs**

Run: `git diff -- data/idol-shopping-blog-pages.json scripts/generate-idol-shopping-blog-pages.js tests/idol-shopping-blog-pages.test.js blog/bts-tinytan-goods-guide.html blog/seventeen-photocard-binder-guide.html blog/ive-album-photocard-guide.html blog/aespa-season-greeting-album-guide.html blog/blackpink-album-photocard-storage-guide.html index.html sitemap.xml`

Expected: five complete articles, additive discovery links, and no unrelated rewrites. Commit is intentionally deferred until the user reviews the pages.
