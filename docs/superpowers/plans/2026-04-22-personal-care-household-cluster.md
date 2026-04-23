# Personal Care Household Cluster Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build pages 20 to 22 for shampoo, fabric softener, and dish soap search-led buying guides.

**Architecture:** Add three standalone static HTML pages under `search/` using the existing TOP 3 article pattern. Integrate them into `search/index.html`, root `index.html`, and `sitemap.xml` so search engines and users can discover them.

**Tech Stack:** Static HTML, existing `/search/assets/style.css`, GitHub Pages.

---

### Task 1: Create Three Guide Pages

**Files:**
- Create: `search/scalp-shampoo-top3.html`
- Create: `search/fabric-softener-top3.html`
- Create: `search/dish-soap-top3.html`

- [ ] **Step 1: Add the shampoo guide page**

Create `search/scalp-shampoo-top3.html` with:
- title: `탈모/두피 샴푸 추천 TOP 3 (2026) | 지성·민감두피`
- three product sections: 민감두피형, 지성두피형, 대용량 데일리형
- four FAQ items
- cluster nav linking pages 20, 21, and 22

- [ ] **Step 2: Add the fabric softener guide page**

Create `search/fabric-softener-top3.html` with:
- title: `섬유유연제 추천 TOP 3 (2026) | 향 지속·실내건조`
- three product sections: 향 지속형, 실내건조형, 민감피부형
- four FAQ items
- cluster nav linking pages 20, 21, and 22

- [ ] **Step 3: Add the dish soap guide page**

Create `search/dish-soap-top3.html` with:
- title: `주방세제 추천 TOP 3 (2026) | 기름때·젖병·대용량`
- three product sections: 기름때 세정형, 젖병겸용형, 대용량 실속형
- four FAQ items
- cluster nav linking pages 20, 21, and 22

### Task 2: Integrate Discovery Links

**Files:**
- Modify: `search/index.html`
- Modify: `index.html`
- Modify: `sitemap.xml`

- [ ] **Step 1: Add list entries to `search/index.html`**

Add numbered entries after page 19:
- `20. 탈모/두피 샴푸 추천 TOP 3 (2026)`
- `21. 섬유유연제 추천 TOP 3 (2026)`
- `22. 주방세제 추천 TOP 3 (2026)`

- [ ] **Step 2: Add a root representative card**

Add one root card pointing to `/search/scalp-shampoo-top3.html` as the representative page for the new personal-care household cluster.

- [ ] **Step 3: Add sitemap URLs**

Add the following URLs with `lastmod` `2026-04-22` and priority `0.8`:
- `https://idont82.github.io/search/scalp-shampoo-top3.html`
- `https://idont82.github.io/search/fabric-softener-top3.html`
- `https://idont82.github.io/search/dish-soap-top3.html`

### Task 3: Verify Static Requirements

**Files:**
- Verify: `search/scalp-shampoo-top3.html`
- Verify: `search/fabric-softener-top3.html`
- Verify: `search/dish-soap-top3.html`
- Verify: `search/index.html`
- Verify: `sitemap.xml`

- [ ] **Step 1: Run structure verification**

Run:

```powershell
@'
from pathlib import Path
pages = [
  'search/scalp-shampoo-top3.html',
  'search/fabric-softener-top3.html',
  'search/dish-soap-top3.html',
]
for page in pages:
    text = Path(page).read_text(encoding='utf-8')
    print(page, text.count('<article class="product"'), text.count('class="table-rank rank-'), text.count('<details>'), '<link rel="canonical"' in text)
idx = Path('search/index.html').read_text(encoding='utf-8')
print('index 20-22:', all(f'>{i}. ' in idx for i in range(20, 23)))
sitemap = Path('sitemap.xml').read_text(encoding='utf-8')
print('sitemap:', all(name in sitemap for name in ['scalp-shampoo-top3.html','fabric-softener-top3.html','dish-soap-top3.html']))
'@ | python -
```

Expected output:
- each page shows `3 3 4 True`
- `index 20-22: True`
- `sitemap: True`

- [ ] **Step 2: Check Git staging scope before commit**

Run:

```powershell
git status --short
```

Expected staged/modified files should be limited to this feature plus the plan/spec docs already created for it. Existing unrelated untracked 2026-04-14 and 2026-04-16 docs should not be staged.
