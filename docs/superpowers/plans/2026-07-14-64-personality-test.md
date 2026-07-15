# 64 Personality Test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Korean 64-type personality test page that reports both a 16-type MBTI-style result and a 64-type extended result, then shows result-based Coupang affiliate recommendation banners.

**Architecture:** Add a self-contained static page under `tools/` with inline data, scoring, and UI logic. Add Node tests that assert the page contract: 36 questions, six scoring axes, 16/64 result labels, affiliate disclosure, tracked Coupang links, and sitemap discoverability.

**Tech Stack:** Vanilla HTML, CSS, JavaScript, Node built-in `node:test`.

---

### Task 1: Page Contract Test

**Files:**
- Create: `tests/64-personality-test.test.js`

- [ ] **Step 1: Write the failing test**

Create a Node test that reads `tools/64-personality-test.html`, checks for 36 questions, six axes, result rendering hooks, Coupang tracking attributes, and sitemap inclusion.

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/64-personality-test.test.js`

Expected: FAIL because `tools/64-personality-test.html` does not exist yet.

### Task 2: Standalone Test Page

**Files:**
- Create: `tools/64-personality-test.html`
- Modify: `sitemap.xml`

- [ ] **Step 1: Implement the page**

Build a single static HTML file with 36 five-point Likert questions, six-axis scoring, 16-type and 64-type result output, result-section recommendation banners, and required affiliate disclosure.

- [ ] **Step 2: Add sitemap URL**

Add `https://idont82.github.io/tools/64-personality-test.html` with `lastmod` `2026-07-14`.

- [ ] **Step 3: Run verification**

Run: `node --test tests/64-personality-test.test.js`

Expected: PASS.
