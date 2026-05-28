# Sambaekcho Rhinitis Top 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new `search/sambaekcho-rhinitis-top3.html` page that connects `코엔삼백초` search intent with a `삼백초 비염 영양제` comparison angle.

**Architecture:** Reuse the current `search/sambaekcho-top3.html` comparison structure, but add a short evidence section that explains why 삼백초 is discussed in 비염/코 점막 관리 contexts. Keep the page static, SEO-friendly, and easy to update when affiliate links change.

**Tech Stack:** Static HTML, existing `search/assets/style.css`, JSON-LD, generated thumbnail image, manual verification, source-backed article summary

---

### Task 1: Gather Page Inputs

**Files:**
- Reference: `docs/superpowers/specs/2026-05-11-sambaekcho-rhinitis-top3-design.md`
- Reference: `search/sambaekcho-top3.html`

- [ ] **Step 1: Confirm product set**

Use the same three products unless the operator provides replacements:

```text
1. 닥터파이토 파이토블락 코엔삼백초 60정
2. 이너띵스 삼백초 추출물 맥문동 파이토 골드 HACCP 인증 2개 60정
3. 삼백초 100% 추출물 알약 60회분
```

- [ ] **Step 2: Capture the evidence summary**

Keep only short, supportable points:

```text
- 삼백초는 비염/코 점막 관리 쪽으로 자주 언급된다
- 항알레르기, 항염 관련 표현은 기사 요약 수준으로 쓴다
- LHF618, 코 가려움, 재채기, 콧물, 코막힘 같은 표현을 포함한다
```

### Task 2: Create the New Search Page

**Files:**
- Create: `search/sambaekcho-rhinitis-top3.html`
- Reference: `search/sambaekcho-top3.html`

- [ ] **Step 1: Duplicate the proven comparison structure**

Base the new file on:

```text
search/sambaekcho-top3.html
```

- [ ] **Step 2: Replace the head metadata**

Use:

```html
<title>삼백초 비염 영양제 추천 TOP 3 - 코엔삼백초와 가성비 좋은 제품 비교 (2026)</title>
<meta name="description" content="코엔삼백초를 찾는 분들을 위해 삼백초 비염 영양제 3가지를 1정당 가격과 30일 체감가격 기준으로 비교했습니다.">
<link rel="canonical" href="https://idont82.github.io/search/sambaekcho-rhinitis-top3.html">
```

- [ ] **Step 3: Write the evidence section**

Insert a short section after the intro:

```html
<section class="article-section">
  <h2>삼백초가 비염 영양제로 언급되는 이유</h2>
  <p>삼백초는 항염증 및 항알레르기 성분으로 비염 증상 완화와 코 점막 보호 쪽에서 자주 언급됩니다. 기사와 자료에서는 히스타민, IgE, 코 가려움, 재채기, 콧물, 코막힘 같은 표현이 반복됩니다.</p>
  <p>최근에는 식약처 개별인정형 원료인 LHF618 관련 기사도 함께 보이기 때문에, 코엔삼백초를 찾는 분들이 다른 삼백초 계열 제품까지 같이 비교하는 흐름이 자연스럽습니다.</p>
</section>
```

- [ ] **Step 4: Keep the comparison table and cards**

Retain:

```text
- Same 3 products
- Same affiliate links
- Same compact table structure
- Same 2x2 price cards
```

- [ ] **Step 5: Rewrite FAQ for the rhinitis angle**

FAQ should cover:

```text
삼백초가 왜 비염 영양제로 같이 언급되는가
코엔삼백초를 찾다가 다른 제품도 봐도 되는가
1정당 가격과 한달분 가격은 어떻게 보는가
리뷰가 많은 제품이 더 편한 이유
```

### Task 3: Add Search Integration

**Files:**
- Modify: `search/index.html`
- Modify: `index.html`
- Modify: `sitemap.xml`
- Create: `data/search-page-checks/sambaekcho-rhinitis-top3.required.txt`

- [ ] **Step 1: Add search list entry**

Use:

```html
<a href="/search/sambaekcho-rhinitis-top3.html">31. 삼백초 비염 영양제 추천 TOP 3 - 코엔삼백초와 가성비 좋은 제품 비교 (2026)</a>
```

- [ ] **Step 2: Add root card**

Use:

```html
<h3>🌿 삼백초 비염 영양제</h3>
<p>코엔삼백초와 가성비 좋은 제품 비교</p>
```

- [ ] **Step 3: Add sitemap entry**

Use:

```xml
<loc>https://idont82.github.io/search/sambaekcho-rhinitis-top3.html</loc>
<lastmod>2026-05-11</lastmod>
```

- [ ] **Step 4: Add required text file**

Add:

```text
삼백초 비염 영양제 추천 TOP 3
코엔삼백초
비염 영양제
1정당 가격
30일 체감가격
LHF618
```

### Task 4: Add Dedicated Thumbnail

**Files:**
- Create: `images/sambaekcho-rhinitis-top3-thumbnail.png`
- Modify: `search/sambaekcho-rhinitis-top3.html`

- [ ] **Step 1: Generate a dedicated image**

Requirements:

```text
- 1200x630
- Main text: 삼백초 비염 영양제 TOP 3
- Supporting text: 코엔삼백초 찾는 분께
- Visuals: green supplement bottles + nose/breathing-friendly visual cue
```

- [ ] **Step 2: Wire the image**

Add:

```html
<meta property="og:image" content="https://idont82.github.io/images/sambaekcho-rhinitis-top3-thumbnail.png">
<meta name="twitter:image" content="https://idont82.github.io/images/sambaekcho-rhinitis-top3-thumbnail.png">
```

### Task 5: Verify and Commit

**Files:**
- Verify: `search/sambaekcho-rhinitis-top3.html`
- Verify: `search/index.html`
- Verify: `index.html`
- Verify: `sitemap.xml`

- [ ] **Step 1: Verify required phrases**

Run:

```bash
rg -n "삼백초 비염 영양제 추천 TOP 3|코엔삼백초|비염 영양제|1정당 가격|30일 체감가격|LHF618" search/sambaekcho-rhinitis-top3.html data/search-page-checks/sambaekcho-rhinitis-top3.required.txt
```

- [ ] **Step 2: Verify integration**

Run:

```bash
rg -n "sambaekcho-rhinitis-top3.html" search/index.html index.html sitemap.xml
```

- [ ] **Step 3: Commit**

```bash
git add search/sambaekcho-rhinitis-top3.html search/index.html index.html sitemap.xml data/search-page-checks/sambaekcho-rhinitis-top3.required.txt images/sambaekcho-rhinitis-top3-thumbnail.png
git commit -m "feat: add sambaekcho rhinitis comparison guide"
```
