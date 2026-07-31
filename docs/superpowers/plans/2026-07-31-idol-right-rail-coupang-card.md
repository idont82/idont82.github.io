# Idol Right-Rail Coupang Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the established 300×250 Coupang recommendation banner to the right sidebar of all five idol shopping guides.

**Architecture:** Extend the existing page contract test first, then update only the shared Node generator and regenerate the five static pages. Reuse existing blog CSS and the established Coupang widget configuration.

**Tech Stack:** Vanilla HTML, Node.js CommonJS, `node:test`

---

### Task 1: Add the failing right-rail contract

**Files:**
- Modify: `tests/idol-shopping-blog-pages.test.js`

- [ ] Require `blog-stack-sticky`, a `blog-ad-frame` iframe using widget ID `989908`, 300×250 dimensions, and an affiliate disclosure inside the right sidebar.
- [ ] Run `node --test tests/idol-shopping-blog-pages.test.js`.
- [ ] Confirm failure because the generated right rail currently has no Coupang iframe.

### Task 2: Add the shared recommendation banner

**Files:**
- Modify: `scripts/generate-idol-shopping-blog-pages.js`
- Regenerate: five idol shopping HTML pages

- [ ] Add the established Coupang iframe and disclosure above related links.
- [ ] Apply `blog-stack-sticky` to the right stack.
- [ ] Regenerate with `node scripts/generate-idol-shopping-blog-pages.js`.
- [ ] Run the test suite and confirm all checks pass.

### Task 3: Verify

- [ ] Run generator syntax validation.
- [ ] Request all five local pages and confirm the right-rail widget markup is present.
- [ ] Run scoped `git diff --check`.
- [ ] Keep all changes uncommitted for user review.
