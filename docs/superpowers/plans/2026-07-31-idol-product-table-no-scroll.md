# Idol Product Table No-Scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep all four idol product comparison columns visible within the article width without horizontal scrolling.

**Architecture:** Enforce the responsive table contract in the existing Node test, then change only the inline CSS emitted by the existing generator. Regenerate all five pages so the fix remains deterministic.

**Tech Stack:** Vanilla CSS, Node.js CommonJS, `node:test`

---

### Task 1: Add the failing responsive-table contract

**Files:**
- Modify: `tests/idol-shopping-blog-pages.test.js`

- [ ] Add a test requiring `table-layout: fixed`, `max-width: 100%`, and `overflow-wrap: anywhere` while rejecting `min-width: 680px` and `.idol-product-table-wrap { overflow-x: auto`.
- [ ] Run `node --test tests/idol-shopping-blog-pages.test.js`.
- [ ] Confirm the new test fails because the generated pages still force a 680px minimum width.

### Task 2: Fix the generated table CSS

**Files:**
- Modify: `scripts/generate-idol-shopping-blog-pages.js`
- Regenerate: five `blog/*idol*` shopping pages

- [ ] Remove the forced minimum width and horizontal scrolling.
- [ ] Add fixed table layout, 100% maximum width, column width ratios, and safe long-text wrapping.
- [ ] Reduce cell padding and font size under 720px without hiding any column.
- [ ] Run `node scripts/generate-idol-shopping-blog-pages.js`.
- [ ] Run `node --test tests/idol-shopping-blog-pages.test.js` and confirm all tests pass.

### Task 3: Verify

**Files:**
- Verify the generator, tests, and five generated pages

- [ ] Run `node --check scripts/generate-idol-shopping-blog-pages.js`.
- [ ] Confirm all five local URLs return HTTP 200 and contain the new fixed-layout rules.
- [ ] Run `git diff --check` on the scoped files.
- [ ] Leave changes uncommitted for user review.
