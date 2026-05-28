# Dehumidifier Top 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first dehumidifier landing page for "원룸·오피스텔 제습기 추천 TOP 3" and wire it into the search hub and sitemap.

**Architecture:** Reuse the existing `/search/` article pattern and shared stylesheet, but add one page-specific visual section for purchase-intent comparison. Keep the implementation static HTML so it matches the rest of the site and can be expanded into the remaining dehumidifier cluster pages later.

**Tech Stack:** Static HTML, shared CSS in `search/assets/style.css`, XML sitemap

---

### Task 1: Map Existing Search Page Pattern

**Files:**
- Modify: `docs/superpowers/plans/2026-04-16-dehumidifier-top3.md`
- Reference: `search/aa-batteries-budget-top3.html`
- Reference: `search/assets/style.css`
- Reference: `search/index.html`

- [ ] **Step 1: Read the existing article template and shared CSS**

```powershell
Get-Content -Raw 'search\aa-batteries-budget-top3.html'
Get-Content -Raw 'search\assets\style.css'
Get-Content -Raw 'search\index.html'
```

Expected: confirm the page needs `disclosure`, `article-header`, `intro`, `compare-table`, `product`, `guide`, and `faq` sections.

- [ ] **Step 2: Lock the implementation file set**

```text
Create: search/dehumidifier-studio-top3.html
Modify: search/index.html
Modify: index.html
Modify: sitemap.xml
```

- [ ] **Step 3: Define the page scope**

```text
Title: 원룸·오피스텔 제습기 추천 TOP 3 (2026) | 소음·제습량·가성비 비교
Audience: purchase-intent users comparing compact dehumidifiers for studios and officetels
Core sections: disclosure, hero intro, comparison table, 3 product cards, situation picks, FAQ, related links
```

- [ ] **Step 4: Commit planning artifact**

```bash
git add docs/superpowers/plans/2026-04-16-dehumidifier-top3.md
git commit -m "docs: add dehumidifier implementation plan"
```

### Task 2: Add a Failing Structural Verification

**Files:**
- Create: `data/search-page-checks/dehumidifier-studio-top3.required.txt`
- Test: `data/search-page-checks/dehumidifier-studio-top3.required.txt`

- [ ] **Step 1: Write the failing structural checklist**

```text
<title>원룸·오피스텔 제습기 추천 TOP 3 (2026) | 소음·제습량·가성비 비교</title>
<h1>원룸·오피스텔 제습기 추천 TOP 3 (2026)</h1>
이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
한눈에 비교표
상황별 추천
자주 묻는 질문
장마철 제습기 추천 TOP 3
빨래건조용 제습기 추천 TOP 3
제습기 전기세 적은 제품 비교
제습기 vs 에어컨 제습 비교
```

- [ ] **Step 2: Run the check before the page exists**

```powershell
Get-Content 'data\search-page-checks\dehumidifier-studio-top3.required.txt' | ForEach-Object {
  Select-String -Path 'search\dehumidifier-studio-top3.html' -Pattern $_ -SimpleMatch
}
```

Expected: FAIL because `search\dehumidifier-studio-top3.html` does not exist yet.

- [ ] **Step 3: Keep the check file as the acceptance contract**

```text
Do not relax the required strings during implementation.
Use the checklist to confirm the final page contains every mandatory SEO and UX block.
```

- [ ] **Step 4: Commit the test artifact**

```bash
git add data/search-page-checks/dehumidifier-studio-top3.required.txt
git commit -m "test: add dehumidifier page structural checks"
```

### Task 3: Build the Dehumidifier Comparison Page

**Files:**
- Create: `search/dehumidifier-studio-top3.html`
- Modify: `search/assets/style.css`
- Test: `data/search-page-checks/dehumidifier-studio-top3.required.txt`

- [ ] **Step 1: Write the minimal page skeleton to satisfy title, disclosure, and section headings**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>원룸·오피스텔 제습기 추천 TOP 3 (2026) | 소음·제습량·가성비 비교</title>
<meta name="description" content="원룸과 오피스텔에서 쓰기 좋은 제습기 TOP 3를 소음, 하루 제습량, 물통 크기, 이동 편의성 기준으로 비교합니다.">
<link rel="canonical" href="https://idont82.github.io/search/dehumidifier-studio-top3.html">
<link rel="stylesheet" href="/search/assets/style.css">
</head>
<body>
<main class="container">
  <div class="disclosure">이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.</div>
  <section class="article-header">
    <h1>원룸·오피스텔 제습기 추천 TOP 3 (2026)</h1>
  </section>
  <h2>한눈에 비교표</h2>
  <h2>상황별 추천</h2>
  <h2>자주 묻는 질문</h2>
</main>
</body>
</html>
```

- [ ] **Step 2: Run the structural check and confirm partial failure turns into targeted gaps**

```powershell
Get-Content 'data\search-page-checks\dehumidifier-studio-top3.required.txt' | ForEach-Object {
  Select-String -Path 'search\dehumidifier-studio-top3.html' -Pattern $_ -SimpleMatch
}
```

Expected: some strings pass, but missing related links and content blocks still fail.

- [ ] **Step 3: Expand the page with complete content**

```html
Add these blocks to the page:
- article metadata with publish/update dates
- purchase-intent intro paragraphs
- comparison table with rows for 가격대, 하루 제습량, 물통 용량, 소음 체감, 이동 편의, 추천 대상
- 3 product cards with one-line verdict, pros, cons, specs, and Coupang CTA
- one page-specific visual section that highlights compact-room buying criteria
- situation-based recommendations
- FAQ with at least 4 questions
- related links section pointing to the 4 future dehumidifier pages
- top and bottom disclosure banners
- Article, FAQPage, and BreadcrumbList structured data
```

- [ ] **Step 4: Add only the CSS needed for the new visual block**

```css
.decision-strip { ... }
.decision-grid { ... }
.decision-card { ... }
.related-cluster { ... }
```

Constraint: reuse existing `.product`, `.compare-table`, `.guide`, `.faq`, and `.cta` classes instead of introducing a new full page design system.

- [ ] **Step 5: Run the structural check again**

```powershell
Get-Content 'data\search-page-checks\dehumidifier-studio-top3.required.txt' | ForEach-Object {
  Select-String -Path 'search\dehumidifier-studio-top3.html' -Pattern $_ -SimpleMatch
}
```

Expected: every required string returns at least one match.

- [ ] **Step 6: Commit the page implementation**

```bash
git add search/assets/style.css search/dehumidifier-studio-top3.html
git commit -m "feat: add studio dehumidifier comparison page"
```

### Task 4: Wire the New Page into Discovery Surfaces

**Files:**
- Modify: `search/index.html`
- Modify: `index.html`
- Modify: `sitemap.xml`

- [ ] **Step 1: Add the page to the `/search/` hub list**

```html
<li>
  <a href="/search/dehumidifier-studio-top3.html">원룸·오피스텔 제습기 추천 TOP 3 (2026)</a>
  <span class="post-desc">원룸 제습기 추천, 오피스텔 제습기 추천, 저소음·빨래건조 겸용 비교를 한 페이지에서 정리</span>
</li>
```

- [ ] **Step 2: Add a card on the main homepage grid**

```html
<a href="/search/dehumidifier-studio-top3.html" class="category-card">
  <div class="card-image"><img src="..." alt="원룸 제습기 대표 이미지"></div>
  <div class="card-content">
    <h3>💧 원룸 제습기</h3>
    <p>소음, 제습량, 전기세 부담까지 비교해 좁은 공간에서 쓰기 좋은 제습기 3종을 정리합니다.</p>
  </div>
</a>
```

- [ ] **Step 3: Add the page URL to the sitemap**

```xml
<url>
  <loc>https://idont82.github.io/search/dehumidifier-studio-top3.html</loc>
  <lastmod>2026-04-16</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
</url>
```

- [ ] **Step 4: Commit the discovery updates**

```bash
git add search/index.html index.html sitemap.xml
git commit -m "feat: surface dehumidifier page in hubs"
```

### Task 5: Verify and Prepare Follow-Up Cluster Work

**Files:**
- Modify: `search/dehumidifier-studio-top3.html`
- Modify: `search/index.html`
- Modify: `index.html`
- Modify: `sitemap.xml`

- [ ] **Step 1: Re-run the structural check**

```powershell
Get-Content 'data\search-page-checks\dehumidifier-studio-top3.required.txt' | ForEach-Object {
  Select-String -Path 'search\dehumidifier-studio-top3.html' -Pattern $_ -SimpleMatch
}
```

Expected: PASS for every required string.

- [ ] **Step 2: Validate cross-file wiring**

```powershell
Select-String -Path 'search\index.html','index.html','sitemap.xml' -Pattern 'dehumidifier-studio-top3'
```

Expected: the new slug appears in all three files.

- [ ] **Step 3: Manual review checklist**

```text
- The title, H1, meta description, canonical, and OG tags reference the same slug and keyword set.
- The page includes 3 product cards and 4 FAQ questions.
- Both disclosure banners use the exact Coupang disclosure sentence.
- The related links section includes the other four dehumidifier topics.
- Mobile layout still stacks correctly using existing shared CSS.
```

- [ ] **Step 4: Commit any verification fixes**

```bash
git add search/dehumidifier-studio-top3.html search/index.html index.html sitemap.xml
git commit -m "chore: polish dehumidifier page copy and metadata"
```
