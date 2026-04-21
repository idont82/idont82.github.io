# Household Repeat Purchase Cluster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build three linked household repeat-purchase guides for toilet paper, wet tissues, and toothpaste, then register them across site navigation surfaces.

**Architecture:** Reuse the existing `/search/` buying guide template and shared stylesheet so the new pages fit the site visually and structurally. Use one shared household cluster navigation block across all three pages, then expose the cluster in `search/index.html`, `sitemap.xml`, and the root homepage.

**Tech Stack:** HTML5, shared CSS in `search/assets/style.css`, static index/sitemap updates

---

### Task 1: Create The Toilet Paper Guide

**Files:**
- Create: `search/toilet-paper-budget-top3.html`

- [ ] **Step 1: Add SEO metadata and intro copy for the toilet paper guide**
- [ ] **Step 2: Add a TOP 3 comparison section and three detailed reviews**
- [ ] **Step 3: Add FAQ and household cluster navigation**

### Task 2: Create The Wet Tissue Guide

**Files:**
- Create: `search/wet-tissue-top3.html`

- [ ] **Step 1: Add SEO metadata and intro copy for the wet tissue guide**
- [ ] **Step 2: Add three use-case-based recommendations and review sections**
- [ ] **Step 3: Add FAQ and household cluster navigation**

### Task 3: Create The Toothpaste Guide

**Files:**
- Create: `search/toothpaste-top3.html`

- [ ] **Step 1: Add SEO metadata and intro copy for the toothpaste guide**
- [ ] **Step 2: Add three goal-based recommendations and review sections**
- [ ] **Step 3: Add FAQ and household cluster navigation**

### Task 4: Add Shared Cluster Navigation Styling

**Files:**
- Modify: `search/assets/style.css`

- [ ] **Step 1: Add `.cluster-nav` styles that can be reused by all three pages**
- [ ] **Step 2: Keep the layout mobile-safe with a stacked grid below 600px**

### Task 5: Register The New Cluster

**Files:**
- Modify: `search/index.html`
- Modify: `sitemap.xml`
- Modify: `index.html`

- [ ] **Step 1: Add the three new URLs to `search/index.html`**
- [ ] **Step 2: Add the three new URLs to `sitemap.xml` with `2026-04-21` lastmod**
- [ ] **Step 3: Add one representative household supplies card to the root homepage**

### Task 6: Verify Static Integrity

**Files:**
- Verify: `search/toilet-paper-budget-top3.html`
- Verify: `search/wet-tissue-top3.html`
- Verify: `search/toothpaste-top3.html`
- Verify: `search/index.html`
- Verify: `sitemap.xml`
- Verify: `index.html`

- [ ] **Step 1: Confirm all three guide files exist**
- [ ] **Step 2: Confirm each page has exactly three product sections**
- [ ] **Step 3: Confirm all new links appear in `search/index.html`, `sitemap.xml`, and root `index.html`**
