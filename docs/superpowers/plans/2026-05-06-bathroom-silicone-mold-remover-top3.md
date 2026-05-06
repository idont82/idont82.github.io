# Bathroom Silicone Mold Remover TOP 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add page 27 for a bathroom silicone mold remover guide focused on bathroom problem-solving search intent.

**Architecture:** Create one standalone static HTML page under `search/` using the existing seasonal household guide pattern. Integrate it into `search/index.html` and `sitemap.xml`, then verify structure with a required-marker text artifact.

**Tech Stack:** Static HTML, existing `/search/assets/style.css`, local Node static server, GitHub Pages.

---

### Task 1: Add the Bathroom Mold Guide

**Files:**
- Create: `search/bathroom-silicone-mold-remover-top3.html`
- Create: `data/search-page-checks/bathroom-silicone-mold-remover-top3.required.txt`

- [ ] **Step 1: Define required markers**

Create the marker file with the page title, three product names, the FAQ heading, and the rainy-season cluster heading.

- [ ] **Step 2: Add the guide page**

Create a static article for `앤클루션 바르는 실리콘 곰팡이 제거젤`, `생활공작소 뿌리는 곰팡이 제거제`, and `유한락스 주방 욕실 곰팡이 제거제` with problem-solving introduction, compare table, three product sections, FAQ, and cluster navigation.

### Task 2: Integrate Discovery

**Files:**
- Modify: `search/index.html`
- Modify: `sitemap.xml`

- [ ] **Step 1: Add entry 27 to `search/index.html`**

Insert the numbered list entry for `bathroom-silicone-mold-remover-top3.html`.

- [ ] **Step 2: Add sitemap URL**

Append `https://idont82.github.io/search/bathroom-silicone-mold-remover-top3.html` with `lastmod` set to `2026-05-06`.

### Task 3: Verify Static Structure

**Files:**
- Verify: `search/bathroom-silicone-mold-remover-top3.html`
- Verify: `search/index.html`
- Verify: `sitemap.xml`

- [ ] **Step 1: Run marker verification**

Run:

```powershell
$page = Get-Content 'search\bathroom-silicone-mold-remover-top3.html' -Raw
Get-Content 'data\search-page-checks\bathroom-silicone-mold-remover-top3.required.txt' | ForEach-Object {
  if ($page -notlike "*$_*") { throw "Missing marker: $_" }
}
```

- [ ] **Step 2: Run structural verification**

Run:

```powershell
$page = Get-Content 'search\bathroom-silicone-mold-remover-top3.html' -Raw
$checks = [ordered]@{
  canonical = $page.Contains('<link rel="canonical" href="https://idont82.github.io/search/bathroom-silicone-mold-remover-top3.html">')
  products = (($page | Select-String -Pattern '<article class="product"' -AllMatches).Matches.Count -eq 3)
  faq = (($page | Select-String -Pattern '<details>' -AllMatches).Matches.Count -eq 4)
  searchIndex = (Get-Content 'search\index.html' -Raw).Contains('/search/bathroom-silicone-mold-remover-top3.html')
  sitemap = (Get-Content 'sitemap.xml' -Raw).Contains('https://idont82.github.io/search/bathroom-silicone-mold-remover-top3.html')
}
if ($checks.Values -contains $false) { throw 'Static structure verification failed.' }
```
