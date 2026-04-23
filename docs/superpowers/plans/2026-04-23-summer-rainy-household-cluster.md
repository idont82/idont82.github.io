# Summer Rainy Household Cluster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build pages 23 to 25 for mosquito traps, mosquito repellents, and moisture absorbers.

**Architecture:** Add three standalone static HTML pages under `search/` using the existing TOP 3 guide pattern. Integrate the pages into the search index, root representative card grid, and sitemap for crawl discovery.

**Tech Stack:** Static HTML, existing `/search/assets/style.css`, GitHub Pages.

---

### Task 1: Create Three Guide Pages

**Files:**
- Create: `search/mosquito-killer-top3.html`
- Create: `search/mosquito-repellent-top3.html`
- Create: `search/moisture-absorber-top3.html`

- [ ] **Step 1: Add mosquito trap guide**

Create `search/mosquito-killer-top3.html` with title, metadata, compare table, three product cards, four FAQ items, and cluster navigation.

- [ ] **Step 2: Add mosquito repellent guide**

Create `search/mosquito-repellent-top3.html` with title, metadata, compare table, three product cards, four FAQ items, and cluster navigation.

- [ ] **Step 3: Add moisture absorber guide**

Create `search/moisture-absorber-top3.html` with title, metadata, compare table, three product cards, four FAQ items, and cluster navigation.

### Task 2: Integrate Discovery Links

**Files:**
- Modify: `search/index.html`
- Modify: `index.html`
- Modify: `sitemap.xml`

- [ ] **Step 1: Add entries 23 to 25 to `search/index.html`**

Add:
- `23. 가정용 모기퇴치기 추천 TOP 3 (2026)`
- `24. 모기기피제 추천 TOP 3 (2026)`
- `25. 제습제/습기제거제 추천 TOP 3 (2026)`

- [ ] **Step 2: Add root representative card**

Add one root card pointing to `/search/mosquito-killer-top3.html` as the representative page for the summer/rainy-season cluster.

- [ ] **Step 3: Add sitemap URLs**

Add:
- `https://idont82.github.io/search/mosquito-killer-top3.html`
- `https://idont82.github.io/search/mosquito-repellent-top3.html`
- `https://idont82.github.io/search/moisture-absorber-top3.html`

### Task 3: Verify Static Structure

**Files:**
- Verify: `search/mosquito-killer-top3.html`
- Verify: `search/mosquito-repellent-top3.html`
- Verify: `search/moisture-absorber-top3.html`
- Verify: `search/index.html`
- Verify: `sitemap.xml`

- [ ] **Step 1: Run static verification**

Run:

```powershell
@'
from pathlib import Path
pages = [
  'search/mosquito-killer-top3.html',
  'search/mosquito-repellent-top3.html',
  'search/moisture-absorber-top3.html',
]
for page in pages:
    s = Path(page).read_text(encoding='utf-8')
    print(page, s.count('<article class="product"'), s.count('class="table-rank rank-'), s.count('<details>'), '<link rel="canonical"' in s, 'property="og:image"' in s)
idx = Path('search/index.html').read_text(encoding='utf-8')
print('index 23-25:', all(f'>{i}. ' in idx for i in range(23, 26)))
sitemap = Path('sitemap.xml').read_text(encoding='utf-8')
print('sitemap:', all(name in sitemap for name in ['mosquito-killer-top3.html','mosquito-repellent-top3.html','moisture-absorber-top3.html']))
'@ | python -
```

Expected:
- each page prints `3 3 4 True True`
- index and sitemap checks print `True`

- [ ] **Step 2: Check staging scope**

Run:

```powershell
git status --short
```

Expected: Only new summer/rainy-season pages, index/root/sitemap, and the new plan/spec docs are intended for this feature. Existing unrelated 2026-04-14 and 2026-04-16 untracked docs must not be staged.
