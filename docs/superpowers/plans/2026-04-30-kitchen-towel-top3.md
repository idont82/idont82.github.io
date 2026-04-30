# Kitchen Towel TOP 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add page 26 for a kitchen towel guide focused on wet-strength durability and absorbency.

**Architecture:** Create one standalone static HTML page under `search/` using the existing 생활관리/생필품 comparison pattern. Integrate it into `search/index.html`, the root category grid, and `sitemap.xml`, then verify structure with a required-marker text artifact plus a local static review.

**Tech Stack:** Static HTML, existing `/search/assets/style.css`, local Node static server, GitHub Pages.

---

### Task 1: Add the Kitchen Towel Guide

**Files:**
- Create: `search/kitchen-towel-top3.html`
- Create: `data/search-page-checks/kitchen-towel-top3.required.txt`

- [ ] **Step 1: Define required markers**

Create the marker file with the title, three brand names, one FAQ heading, and one cluster-navigation heading expected in the final page.

- [ ] **Step 2: Add the guide page**

Create a static article comparing 크리넥스, 코디, 모나리자 with title metadata, compare table, three product sections, FAQ, and cluster navigation.

### Task 2: Integrate Discovery

**Files:**
- Modify: `search/index.html`
- Modify: `index.html`
- Modify: `sitemap.xml`

- [ ] **Step 1: Add entry 26 to `search/index.html`**

Insert the numbered list entry for `kitchen-towel-top3.html`.

- [ ] **Step 2: Add one root category card**

Add a representative card for the new kitchen towel page near the 생활소모품 series.

- [ ] **Step 3: Add sitemap URL**

Append `https://idont82.github.io/search/kitchen-towel-top3.html` with `lastmod` set to `2026-04-30`.

### Task 3: Verify Static Structure

**Files:**
- Verify: `search/kitchen-towel-top3.html`
- Verify: `search/index.html`
- Verify: `index.html`
- Verify: `sitemap.xml`

- [ ] **Step 1: Run marker verification**

Run:

```powershell
$page = Get-Content 'search\kitchen-towel-top3.html' -Raw
Get-Content 'data\search-page-checks\kitchen-towel-top3.required.txt' | ForEach-Object {
  if ($page -notlike "*$_*") { throw "Missing marker: $_" }
}
```

- [ ] **Step 2: Run structural verification**

Run:

```powershell
$page = Get-Content 'search\kitchen-towel-top3.html' -Raw
$checks = @(
  $page.Contains('<link rel="canonical" href="https://idont82.github.io/search/kitchen-towel-top3.html">'),
  ($page.Split('<article class="product"').Count - 1) -eq 3,
  ($page.Split('<details>').Count - 1) -eq 4,
  (Get-Content 'search\index.html' -Raw).Contains('/search/kitchen-towel-top3.html'),
  (Get-Content 'index.html' -Raw).Contains('/search/kitchen-towel-top3.html'),
  (Get-Content 'sitemap.xml' -Raw).Contains('https://idont82.github.io/search/kitchen-towel-top3.html')
)
if ($checks -contains $false) { throw 'Static structure verification failed.' }
```
