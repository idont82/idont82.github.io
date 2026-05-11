# Sambaekcho Top 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a new `search/sambaekcho-top3.html` landing page that captures `코엔삼백초` search intent and compares three 삼백초 알약형 alternatives with a clear value-for-money angle.

**Architecture:** Reuse the existing `search/` static landing-page pattern. The page will mention `코엔삼백초` in the title, intro, and FAQ, while the core comparison will stay generic enough to survive future 홈쇼핑 lineup changes. Supporting changes are limited to metadata, search indexes, sitemap, and one required-text check file.

**Tech Stack:** Static HTML, shared `search/assets` CSS, JSON-LD metadata, manual browser verification, optional web research for Naver/Coupang product selection

---

### Task 1: Lock Comparison Targets

**Files:**
- Create: none
- Modify: none
- Reference: `docs/superpowers/specs/2026-05-11-sambaekcho-top3-design.md`
- Reference: `search/kitchen-towel-top3.html`
- Reference: `search/bathroom-silicone-mold-remover-top3.html`

- [ ] **Step 1: Confirm the comparison format**

Use this checklist while reading the spec:

```text
- Main title uses "삼백초 추천 TOP 3 - 코엔삼백초와 가성비 좋은 제품 비교"
- All three products must be 정/알약형 only
- Comparison axes are 1정당 가격 and 한 달분 체감가격
- Intro must mention 코엔삼백초 directly
```

- [ ] **Step 2: Research candidate products on Naver and Coupang**

Run browser/web research with these search phrases:

```text
코엔삼백초
삼백초 정
삼백초 알약
삼백초 추출물 정 쿠팡
```

Expected outcome:

```text
- 3 final products selected
- Each product has a stable purchasable link
- Each product has enough visible pricing info to compare 1정당 가격 and 한 달분 체감가격
```

- [ ] **Step 3: Capture a comparison worksheet**

Record this information before editing HTML:

```text
상품명
정 수
권장 섭취량
총가격
1정당 가격
한 달분 체감가격
링크 종류(쿠팡 제휴/일반)
```

- [ ] **Step 4: Commit the research checkpoint**

```bash
git status --short
```

Expected:

```text
No code changes yet, or only note/spec changes already known to the operator
```

### Task 2: Create the Search Page

**Files:**
- Create: `search/sambaekcho-top3.html`
- Reference: `search/template.html`
- Reference: `search/kitchen-towel-top3.html`
- Reference: `search/bathroom-silicone-mold-remover-top3.html`

- [ ] **Step 1: Copy a close existing pattern**

Use `search/kitchen-towel-top3.html` as the main structure reference and preserve these sections:

```html
<head>...</head>
<main class="container">...</main>
<section class="faq">...</section>
<script type="application/ld+json">...</script>
```

- [ ] **Step 2: Write the page head with direct search intent**

Insert head metadata in this shape:

```html
<title>삼백초 추천 TOP 3 - 코엔삼백초와 가성비 좋은 제품 비교 (2026)</title>
<meta name="description" content="코엔삼백초를 찾는 분들을 위해 삼백초 알약형 제품 3가지를 1정당 가격과 한 달분 체감가격 기준으로 비교했습니다.">
<link rel="canonical" href="https://idont82.github.io/search/sambaekcho-top3.html">
<meta property="og:title" content="삼백초 추천 TOP 3 - 코엔삼백초와 가성비 좋은 제품 비교">
<meta property="og:description" content="코엔삼백초를 찾는 분께, 가성비 좋은 삼백초 알약형 제품 3가지를 정리했습니다.">
```

- [ ] **Step 3: Write the intro and comparison explanation**

Use copy in this direction:

```html
<h1>삼백초 추천 TOP 3 - 코엔삼백초와 가성비 좋은 제품 비교</h1>
<p>홈쇼핑에서 코엔삼백초를 보고 검색하는 분들이 많습니다. 이 페이지는 삼백초 알약형 제품 중에서 가격 비교가 쉬운 대안을 정리한 가이드입니다.</p>
<p>비교 기준은 1정당 가격과 한 달분 체감가격입니다. 차나 분말이 아니라 정/알약형 제품만 모아 같은 포맷끼리 비교합니다.</p>
```

- [ ] **Step 4: Build the summary table and product cards**

The table and product cards must show:

```html
<table>
  <thead>
    <tr>
      <th>제품</th>
      <th>포맷</th>
      <th>정 수</th>
      <th>1정당 가격</th>
      <th>한 달분 체감가격</th>
    </tr>
  </thead>
</table>
```

Each product card must include:

```html
<article id="product-1" class="product-card">
  <a href="COUPANG_OR_PRODUCT_LINK" rel="sponsored nofollow" referrerpolicy="unsafe-url">
    <img src="PRODUCT_IMAGE" alt="상품명">
  </a>
  <h2>1위. 상품명</h2>
  <p>코엔삼백초를 찾는 분께 가장 무난한 기준형.</p>
  <a class="cta-button" href="COUPANG_OR_PRODUCT_LINK" rel="sponsored nofollow" referrerpolicy="unsafe-url">쿠팡에서 보기</a>
</article>
```

- [ ] **Step 5: Write FAQ for direct keyword capture**

Add four FAQ entries covering:

```text
코엔삼백초와 삼백초 정 제품은 어떻게 다른가
삼백초는 차보다 알약형이 편한가
1정당 가격은 어떻게 계산했는가
가성비 제품을 고를 때 무엇을 먼저 봐야 하는가
```

### Task 3: Add SEO Structure and Thumbnail

**Files:**
- Modify: `search/sambaekcho-top3.html`
- Create: `images/sambaekcho-top3-thumbnail.png`

- [ ] **Step 1: Add JSON-LD blocks**

Include these three blocks:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage"
}
</script>
```

- [ ] **Step 2: Create a dedicated thumbnail**

Prepare one `1200x630` image with these visual priorities:

```text
- Main text: 삼백초 추천 TOP 3
- Secondary text: 코엔삼백초 찾는 분께
- Visuals: 녹색 계열 알약병/정제/원료 느낌
- Avoid dense text blocks
```

- [ ] **Step 3: Connect the thumbnail metadata**

Add these lines:

```html
<meta property="og:image" content="https://idont82.github.io/images/sambaekcho-top3-thumbnail.png">
<meta name="twitter:image" content="https://idont82.github.io/images/sambaekcho-top3-thumbnail.png">
```

### Task 4: Wire the Page Into Site Navigation

**Files:**
- Modify: `search/index.html`
- Modify: `index.html`
- Modify: `sitemap.xml`
- Create: `data/search-page-checks/sambaekcho-top3.required.txt`

- [ ] **Step 1: Add the page to `search/index.html`**

Insert a new numbered entry in the existing list format:

```html
<li class="post-item">
  <a href="/search/sambaekcho-top3.html">30. 삼백초 추천 TOP 3 - 코엔삼백초와 가성비 좋은 제품 비교 (2026)</a>
  <span class="post-desc">코엔삼백초를 찾는 분들을 위해 삼백초 알약형 제품 3가지를 1정당 가격과 한 달분 체감가격 기준으로 비교</span>
</li>
```

- [ ] **Step 2: Add a root landing card to `index.html`**

Use the same card style as other published search pages:

```html
<a class="card" href="/search/sambaekcho-top3.html">
  <h3>삼백초 추천 TOP 3</h3>
  <p>코엔삼백초와 가성비 좋은 제품 비교</p>
</a>
```

- [ ] **Step 3: Add the new URL to `sitemap.xml`**

Insert:

```xml
<url>
  <loc>https://idont82.github.io/search/sambaekcho-top3.html</loc>
  <lastmod>2026-05-11</lastmod>
</url>
```

- [ ] **Step 4: Add a required-text check file**

Create `data/search-page-checks/sambaekcho-top3.required.txt` with these lines:

```text
삼백초 추천 TOP 3
코엔삼백초
삼백초 알약형
1정당 가격
한 달분 체감가격
```

### Task 5: Verify the Page Manually

**Files:**
- Verify: `search/sambaekcho-top3.html`
- Verify: `search/index.html`
- Verify: `index.html`
- Verify: `sitemap.xml`

- [ ] **Step 1: Run static checks**

Run:

```bash
rg -n "삼백초 추천 TOP 3|코엔삼백초|삼백초 알약형|1정당 가격|한 달분 체감가격" search/sambaekcho-top3.html data/search-page-checks/sambaekcho-top3.required.txt
```

Expected:

```text
All required phrases appear in the HTML and the check file
```

- [ ] **Step 2: Verify navigation links**

Run:

```bash
rg -n "sambaekcho-top3.html" search/index.html index.html sitemap.xml
```

Expected:

```text
The new page appears in all three files
```

- [ ] **Step 3: Verify structured metadata**

Run:

```bash
rg -n "BreadcrumbList|ItemList|FAQPage|og:image|twitter:image" search/sambaekcho-top3.html
```

Expected:

```text
All SEO markers are present
```

- [ ] **Step 4: Browser-check layout and click targets**

Run:

```bash
node server.js
```

Manual checklist:

```text
- Desktop and mobile widths render without overflow
- Product images and CTA links open the intended targets
- FAQ expands correctly
- Thumbnail path resolves
```

- [ ] **Step 5: Commit the completed feature**

```bash
git add search/sambaekcho-top3.html search/index.html index.html sitemap.xml data/search-page-checks/sambaekcho-top3.required.txt images/sambaekcho-top3-thumbnail.png
git commit -m "feat: add sambaekcho comparison guide"
```

