# Capsule Coffee Series Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the remaining two capsule coffee series pages, connect the three-page series internally, and register the new pages in the search hub and sitemap.

**Architecture:** Reuse the existing `search/capsule-coffee-machine-top7.html` page structure as the content template for the flavor-focused and Nespresso-focused guides. Keep shared presentation in `search/assets/style.css`, add only minimal new selectors for a series navigation block, and update hub/discovery files so all three guides link to each other.

**Tech Stack:** HTML5, shared CSS in `search/assets/style.css`, static sitemap/index updates

---

### Task 1: Create The Flavor-Focused TOP 7 Page

**Files:**
- Create: `search/capsule-coffee-flavor-top7.html`

- [ ] **Step 1: Copy the proven page shell from the existing machine guide and adapt SEO metadata**
- [ ] **Step 2: Replace summary cards and detailed reviews with seven flavor/theme categories**
- [ ] **Step 3: Add FAQ and series navigation links to the machine and Nespresso guides**

### Task 2: Create The Nespresso-Focused TOP 7 Page

**Files:**
- Create: `search/capsule-coffee-nespresso-top7.html`

- [ ] **Step 1: Copy the same page shell and adapt SEO metadata for Nespresso search intent**
- [ ] **Step 2: Replace summary cards and detailed reviews with seven Nespresso-compatible product picks**
- [ ] **Step 3: Add FAQ and series navigation links to the machine and flavor guides**

### Task 3: Add Shared Series Navigation Styling

**Files:**
- Modify: `search/assets/style.css`

- [ ] **Step 1: Add a compact shared `.series-nav` block and card styles**
- [ ] **Step 2: Ensure mobile layout collapses to one column cleanly**

### Task 4: Register The Two New Pages

**Files:**
- Modify: `search/capsule-coffee-machine-top7.html`
- Modify: `search/index.html`
- Modify: `sitemap.xml`

- [ ] **Step 1: Add the shared series navigation block to the existing machine guide**
- [ ] **Step 2: Add two new entries to `search/index.html`**
- [ ] **Step 3: Add two new URLs to `sitemap.xml` with `2026-04-20` lastmod**

### Task 5: Verify Static Integrity

**Files:**
- Verify: `search/capsule-coffee-machine-top7.html`
- Verify: `search/capsule-coffee-flavor-top7.html`
- Verify: `search/capsule-coffee-nespresso-top7.html`
- Verify: `search/index.html`
- Verify: `sitemap.xml`

- [ ] **Step 1: Confirm all three guide files exist**
- [ ] **Step 2: Confirm cross-links and sitemap/index references point to the correct paths**
- [ ] **Step 3: Confirm each new page has seven summary cards and seven detailed product sections**
