# Idol Fan Voice Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite five idol shopping guides in a sincere first-person fan voice while preserving factual product guidance and prohibiting invented purchase or usage claims.

**Architecture:** Keep voice-specific editorial copy in `data/idol-shopping-blog-pages.json` and let the existing Node generator render it into all five HTML pages. Extend the existing content contract test so fan identity, emotional recommendation, and the absence of fabricated experience remain enforceable.

**Tech Stack:** JSON, Node.js CommonJS, vanilla HTML, `node:test`

---

### Task 1: Define the fan-voice contract

**Files:**
- Modify: `tests/idol-shopping-blog-pages.test.js`

- [ ] **Step 1: Add a failing test for fan identity and recommendation tone**

Add a test that requires each generated page to contain `팬인 저는`, at least one phrase matching `좋아해서|설레|마음에 들`, and a fan recommendation label. Reject `직접 구매했다`, `직접 샀`, `써보니`, `사용해보니`, and `배송받았다`.

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/idol-shopping-blog-pages.test.js`

Expected: the new fan-voice test fails because the current generated pages use neutral editorial copy.

### Task 2: Rewrite the source content

**Files:**
- Modify: `data/idol-shopping-blog-pages.json`

- [ ] **Step 1: Rewrite each page introduction and summary**

Use first-person fan language specific to BTS, 세븐틴, 아이브, 에스파, and 블랙핑크. Express why the product category is emotionally appealing without claiming ownership or use.

- [ ] **Step 2: Rewrite comparisons and product reasons**

For every comparison and product, explain what makes it attractive to a fan and which fan would appreciate it, then retain the existing factual check.

- [ ] **Step 3: Rewrite cautions and FAQ answers**

Keep official-status, random inclusion, price, and storage warnings, but phrase them as one fan helping another fan avoid disappointment.

### Task 3: Expose fan recommendations in the renderer

**Files:**
- Modify: `scripts/generate-idol-shopping-blog-pages.js`
- Regenerate: `blog/bts-tinytan-goods-guide.html`
- Regenerate: `blog/seventeen-photocard-binder-guide.html`
- Regenerate: `blog/ive-album-photocard-guide.html`
- Regenerate: `blog/aespa-season-greeting-album-guide.html`
- Regenerate: `blog/blackpink-album-photocard-storage-guide.html`

- [ ] **Step 1: Add a visible fan recommendation label**

Change the shared summary and product-card labels to make the fan viewpoint clear while keeping product rank and status visible.

- [ ] **Step 2: Regenerate all five pages**

Run: `node scripts/generate-idol-shopping-blog-pages.js`

Expected: five page paths are printed.

- [ ] **Step 3: Run tests and verify GREEN**

Run: `node --test tests/idol-shopping-blog-pages.test.js`

Expected: all existing and new tests pass.

### Task 4: Final verification

**Files:**
- Verify all files above

- [ ] **Step 1: Check generator syntax and deterministic output**

Run: `node --check scripts/generate-idol-shopping-blog-pages.js`

Expected: exit code 0.

- [ ] **Step 2: Verify local HTTP output**

Request all five pages from `http://localhost:3000` and require HTTP 200, one H1, and the fan-voice marker.

- [ ] **Step 3: Review scoped changes**

Run the relevant test again and inspect scoped status. Do not commit; the user will review the generated pages first.
