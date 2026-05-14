# Adult Claw Characters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a magazine-style character hub for adult claw-machine fans plus a Hatsune Miku goods detail page that can convert readers into related Coupang purchases.

**Architecture:** Add two new `search/` landing pages that reuse the existing search-page structure, then connect them through `search/index.html`, `index.html`, and `sitemap.xml`. Keep the hub page editorial and character-first, and keep product-heavy content on the Hatsune Miku detail page.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, existing `search/assets/style.css`, local bitmap assets in `images/`, XML sitemap.

---

## File Structure

- Create: `search/adult-claw-characters-top5.html`
  - Character hub page with editorial cards for five adult-friendly claw-machine characters
- Create: `search/hatsune-miku-claw-goods-top5.html`
  - Hatsune Miku detail page with TOP 5 goods recommendations and affiliate-ready structure
- Create: `data/search-page-checks/adult-claw-characters-top5.required.txt`
  - Marker checklist for hub content verification
- Create: `data/search-page-checks/hatsune-miku-claw-goods-top5.required.txt`
  - Marker checklist for detail content verification
- Create: `images/adult-claw-characters-top5-thumbnail.png`
  - Search/social thumbnail for hub page
- Create: `images/hatsune-miku-claw-goods-top5-thumbnail.png`
  - Search/social thumbnail for Miku detail page
- Modify: `search/index.html`
  - Add links for the hub and detail page
- Modify: `index.html`
  - Add homepage entry point for the new hub
- Modify: `sitemap.xml`
  - Publish the two new URLs

### Task 1: Create the character hub page

**Files:**
- Create: `search/adult-claw-characters-top5.html`
- Create: `data/search-page-checks/adult-claw-characters-top5.required.txt`
- Create: `images/adult-claw-characters-top5-thumbnail.png`

- [ ] **Step 1: Write the required marker file first**

Create `data/search-page-checks/adult-claw-characters-top5.required.txt` with these exact lines:

```text
어른들이 인형뽑기에서 많이 찾는 캐릭터 TOP 5
하츠네 미쿠
치이카와
쿠로미
짱구
스밋코구라시
누이
피규어
키링
데스크 굿즈
```

- [ ] **Step 2: Create the hub page skeleton with metadata and structured data**

Start `search/adult-claw-characters-top5.html` with this structure:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>어른들이 인형뽑기에서 많이 찾는 캐릭터 TOP 5</title>
  <meta name="description" content="인형뽑기에서 어른들이 많이 찾는 캐릭터 5가지를 매거진형으로 정리했습니다. 누이, 피규어, 키링, 데스크 굿즈 중심으로 보기 쉽게 소개합니다.">
  <link rel="canonical" href="https://idont82.github.io/search/adult-claw-characters-top5.html">
  <meta property="og:type" content="article">
  <meta property="og:title" content="어른들이 인형뽑기에서 많이 찾는 캐릭터 TOP 5">
  <meta property="og:description" content="하츠네 미쿠부터 치이카와, 쿠로미까지 어른 취향 굿즈 캐릭터를 매거진형으로 정리했습니다.">
  <meta property="og:url" content="https://idont82.github.io/search/adult-claw-characters-top5.html">
  <meta property="og:image" content="https://idont82.github.io/images/adult-claw-characters-top5-thumbnail.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://idont82.github.io/images/adult-claw-characters-top5-thumbnail.png">
  <link rel="stylesheet" href="/search/assets/style.css">
</head>
<body>
```

Include `BreadcrumbList` and `ItemList` JSON-LD, following the same pattern as other `search/*.html` pages.

- [ ] **Step 3: Build the hero and intro copy**

Use this content structure near the top of the page:

```html
<main class="container article-page">
  <nav class="breadcrumb"><a href="/">홈</a> <span>/</span> <a href="/search/">구매 가이드</a></nav>

  <section class="article-header">
    <h1>어른들이 인형뽑기에서 많이 찾는 캐릭터 TOP 5</h1>
    <div class="article-meta">게시일: 2026-05-14 · 최종 업데이트: 2026-05-14</div>
  </section>

  <p class="intro">
    인형뽑기 경품은 이제 아이들만의 취향이 아니라 <strong>책상 위에 두고 싶고, 가방에 달고 싶고, 피규어로 모으고 싶은 어른 취향 굿즈</strong>로도 많이 소비됩니다.
    이 페이지에서는 실제로 인형뽑기 매장과 굿즈 소비 흐름에서 반응이 좋은 캐릭터 5가지를 매거진형으로 정리했습니다.
  </p>
```

- [ ] **Step 4: Add five magazine cards with tags and detail CTA**

Use a repeated card pattern like this:

```html
<section class="product-grid">
  <article class="product-card">
    <a class="product-image-link" href="/search/hatsune-miku-claw-goods-top5.html">
      <img src="/images/adult-claw-characters-top5-thumbnail.png" alt="하츠네 미쿠 굿즈 카드 대표 이미지">
    </a>
    <h2>하츠네 미쿠</h2>
    <p>피규어, 누들스토퍼, 키링까지 경품 감성이 가장 잘 살아나는 대표 캐릭터입니다.</p>
    <div class="tag-row">
      <span class="tag">피규어</span>
      <span class="tag">키링</span>
      <span class="tag">데스크 굿즈</span>
    </div>
    <p><a class="buy-button" href="/search/hatsune-miku-claw-goods-top5.html">상세 보기</a></p>
  </article>
</section>
```

Repeat the same pattern for:

- 치이카와
- 쿠로미
- 짱구
- 스밋코구라시

For the four pages not yet built, keep the CTA text as `상세 준비 중` and use `href="/search/adult-claw-characters-top5.html#coming-soon"` for now.

- [ ] **Step 5: Add related guidance section and footer disclosure-free close**

Add a small closeout section:

```html
<section class="faq-section" id="coming-soon">
  <h2>다음으로 이어질 캐릭터 가이드</h2>
  <p>하츠네 미쿠를 시작으로 치이카와, 쿠로미, 짱구, 스밋코구라시도 같은 흐름으로 순차 공개할 예정입니다.</p>
</section>
```

Do not add affiliate buttons or disclosure text on the hub page.

- [ ] **Step 6: Run marker checks for the hub**

Run:

```powershell
Get-Content 'data/search-page-checks/adult-claw-characters-top5.required.txt' | ForEach-Object {
  Select-String -Path 'search/adult-claw-characters-top5.html' -Pattern $_ -SimpleMatch
}
```

Expected: every required line returns a match.

- [ ] **Step 7: Commit the hub page**

```bash
git add data/search-page-checks/adult-claw-characters-top5.required.txt search/adult-claw-characters-top5.html images/adult-claw-characters-top5-thumbnail.png
git commit -m "feat: add adult claw characters hub"
```

### Task 2: Create the Hatsune Miku detail page

**Files:**
- Create: `search/hatsune-miku-claw-goods-top5.html`
- Create: `data/search-page-checks/hatsune-miku-claw-goods-top5.required.txt`
- Create: `images/hatsune-miku-claw-goods-top5-thumbnail.png`

- [ ] **Step 1: Write the required marker file**

Create `data/search-page-checks/hatsune-miku-claw-goods-top5.required.txt` with:

```text
하츠네 미쿠 인형뽑기 굿즈 추천 TOP 5
봉제 인형
피규어
키링
누들스토퍼
데스크 굿즈
쿠팡에서 구매
```

- [ ] **Step 2: Create the detail page metadata and page shell**

Use this top structure:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>하츠네 미쿠 인형뽑기 굿즈 추천 TOP 5</title>
  <meta name="description" content="하츠네 미쿠 굿즈를 찾는 분을 위해 인형뽑기 경품 감성과 잘 맞는 봉제 인형, 피규어, 키링, 누들스토퍼, 데스크 굿즈를 정리했습니다.">
  <link rel="canonical" href="https://idont82.github.io/search/hatsune-miku-claw-goods-top5.html">
  <meta property="og:type" content="article">
  <meta property="og:title" content="하츠네 미쿠 인형뽑기 굿즈 추천 TOP 5">
  <meta property="og:description" content="어른 취향 경품 감성이 잘 살아나는 하츠네 미쿠 굿즈 타입 5가지를 보기 쉽게 정리했습니다.">
  <meta property="og:url" content="https://idont82.github.io/search/hatsune-miku-claw-goods-top5.html">
  <meta property="og:image" content="https://idont82.github.io/images/hatsune-miku-claw-goods-top5-thumbnail.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="https://idont82.github.io/images/hatsune-miku-claw-goods-top5-thumbnail.png">
  <link rel="stylesheet" href="/search/assets/style.css">
</head>
```

Also add `BreadcrumbList`, `ItemList`, and `FAQPage` JSON-LD.

- [ ] **Step 3: Write the intro and goods-type guidance**

Use this opening:

```html
<section class="article-header">
  <h1>하츠네 미쿠 인형뽑기 굿즈 추천 TOP 5</h1>
  <div class="article-meta">게시일: 2026-05-14 · 최종 업데이트: 2026-05-14</div>
</section>

<p class="intro">
  하츠네 미쿠는 인형뽑기 경품으로 풀렸을 때도 <strong>색감이 잘 살아나고, 책상 위 장식으로 두기 좋아서 어른 취향 굿즈 반응이 특히 좋은 캐릭터</strong>입니다.
  이 글에서는 실제로 많이 찾는 굿즈 축을 기준으로 입문하기 좋은 타입부터 책상 위에 오래 두기 좋은 타입까지 5가지로 나눠 정리했습니다.
</p>
```

- [ ] **Step 4: Add five goods recommendation cards**

Use the existing `search` product-card structure with placeholder affiliate-ready links:

```html
<article class="product-card">
  <a class="product-image-link" href="https://www.coupang.com/np/search?component=&q=%ED%95%98%EC%B8%A0%EB%84%A4+%EB%AF%B8%EC%BF%A0+%EB%B4%89%EC%A0%9C+%EC%9D%B8%ED%98%95" rel="sponsored nofollow" target="_blank">
    <img src="/images/hatsune-miku-claw-goods-top5-thumbnail.png" alt="하츠네 미쿠 봉제 인형 추천 이미지">
  </a>
  <div class="product-rank">1위</div>
  <h2>봉제 인형</h2>
  <p>가방 옆이나 침대 머리맡에 두기 좋은 가장 무난한 입문형입니다.</p>
  <div class="pros-cons">
    <div><strong>장점</strong><br>입문용으로 부담이 적다</div>
    <div><strong>단점</strong><br>디테일은 피규어보다 단순할 수 있다</div>
  </div>
  <p><a class="buy-button" href="https://www.coupang.com/np/search?component=&q=%ED%95%98%EC%B8%A0%EB%84%A4+%EB%AF%B8%EC%BF%A0+%EB%B4%89%EC%A0%9C+%EC%9D%B8%ED%98%95" rel="sponsored nofollow" target="_blank">쿠팡에서 구매</a></p>
  <p class="affiliate-note">이 페이지에는 쿠팡 링크가 포함되어 있으며, 링크를 통해 구매가 발생하면 일정액의 수수료를 제공받을 수 있습니다.</p>
</article>
```

Repeat and adapt the same pattern for:

- 피규어
- 키링
- 누들스토퍼
- 데스크 굿즈

- [ ] **Step 5: Add FAQ focused on buyer questions**

Use four FAQ items like:

```html
<section class="faq-section">
  <h2>자주 묻는 질문</h2>
  <details>
    <summary>하츠네 미쿠 굿즈는 어떤 타입부터 사는 게 무난한가요?</summary>
    <p>처음이라면 봉제 인형이나 키링처럼 부담이 적은 타입부터 시작하는 것이 무난합니다.</p>
  </details>
</section>
```

Include questions for:

- 입문용 추천
- 책상 위 전시용 추천
- 휴대하기 좋은 굿즈
- 인형뽑기 경품 감성에 가까운 타입

- [ ] **Step 6: Run marker checks for the detail page**

Run:

```powershell
Get-Content 'data/search-page-checks/hatsune-miku-claw-goods-top5.required.txt' | ForEach-Object {
  Select-String -Path 'search/hatsune-miku-claw-goods-top5.html' -Pattern $_ -SimpleMatch
}
```

Expected: every marker is found.

- [ ] **Step 7: Commit the Miku detail page**

```bash
git add data/search-page-checks/hatsune-miku-claw-goods-top5.required.txt search/hatsune-miku-claw-goods-top5.html images/hatsune-miku-claw-goods-top5-thumbnail.png
git commit -m "feat: add hatsune miku claw goods guide"
```

### Task 3: Connect hub and detail into site navigation

**Files:**
- Modify: `search/index.html`
- Modify: `index.html`
- Modify: `sitemap.xml`

- [ ] **Step 1: Add both pages to `search/index.html`**

Insert two new cards near related character or hobby-style entries using this pattern:

```html
<article class="guide-card">
  <a href="/search/adult-claw-characters-top5.html">
    <img src="/images/adult-claw-characters-top5-thumbnail.png" alt="어른들이 인형뽑기에서 많이 찾는 캐릭터 TOP 5 썸네일">
    <h3>어른들이 인형뽑기에서 많이 찾는 캐릭터 TOP 5</h3>
    <p>인형뽑기 경품 감성과 잘 맞는 어른 취향 캐릭터를 매거진형으로 정리했습니다.</p>
  </a>
</article>
```

Add a second card for `하츠네 미쿠 인형뽑기 굿즈 추천 TOP 5`.

- [ ] **Step 2: Add a homepage entry to `index.html`**

Add one homepage card linking to the hub:

```html
<a class="feature-card" href="/search/adult-claw-characters-top5.html">
  <img src="/images/adult-claw-characters-top5-thumbnail.png" alt="어른들이 인형뽑기에서 많이 찾는 캐릭터 TOP 5">
  <div class="feature-copy">
    <h3>어른들이 인형뽑기에서 많이 찾는 캐릭터</h3>
    <p>하츠네 미쿠, 치이카와, 쿠로미처럼 굿즈 소비력이 강한 캐릭터를 모았습니다.</p>
  </div>
</a>
```

- [ ] **Step 3: Add both URLs to `sitemap.xml`**

Insert:

```xml
<url>
  <loc>https://idont82.github.io/search/adult-claw-characters-top5.html</loc>
</url>
<url>
  <loc>https://idont82.github.io/search/hatsune-miku-claw-goods-top5.html</loc>
</url>
```

Keep the formatting consistent with the existing sitemap.

- [ ] **Step 4: Verify all links and sitemap entries**

Run:

```powershell
Select-String -Path 'search/index.html','index.html','sitemap.xml' -Pattern 'adult-claw-characters-top5|hatsune-miku-claw-goods-top5'
```

Expected: both slugs appear in all intended files.

- [ ] **Step 5: Commit the navigation wiring**

```bash
git add search/index.html index.html sitemap.xml
git commit -m "feat: wire claw character guides into navigation"
```

### Task 4: Final verification and cleanup

**Files:**
- Verify: `search/adult-claw-characters-top5.html`
- Verify: `search/hatsune-miku-claw-goods-top5.html`
- Verify: `search/index.html`
- Verify: `index.html`
- Verify: `sitemap.xml`

- [ ] **Step 1: Verify page metadata and thumbnails**

Run:

```powershell
Select-String -Path 'search/adult-claw-characters-top5.html','search/hatsune-miku-claw-goods-top5.html' -Pattern 'og:image|twitter:image|canonical|<title>'
```

Expected: each page returns all four meta fields and points to its own PNG thumbnail.

- [ ] **Step 2: Verify no accidental affiliate disclosure on the hub page**

Run:

```powershell
Select-String -Path 'search/adult-claw-characters-top5.html' -Pattern '수수료|쿠팡에서 구매'
```

Expected: no matches.

- [ ] **Step 3: Verify affiliate disclosure exists on the Miku detail page**

Run:

```powershell
Select-String -Path 'search/hatsune-miku-claw-goods-top5.html' -Pattern '쿠팡에서 구매|수수료'
```

Expected: product CTA buttons and disclosure lines are present.

- [ ] **Step 4: Manual browser check**

Run:

```powershell
node server.js
```

Check manually at desktop and mobile widths:

- `/search/adult-claw-characters-top5.html`
- `/search/hatsune-miku-claw-goods-top5.html`

Confirm:

- hub looks magazine-like rather than coupon-like
- Miku detail page reads naturally as a buying guide
- images load
- buttons work
- thumbnails and metadata are correct

- [ ] **Step 5: Final commit**

```bash
git add search/adult-claw-characters-top5.html search/hatsune-miku-claw-goods-top5.html data/search-page-checks/adult-claw-characters-top5.required.txt data/search-page-checks/hatsune-miku-claw-goods-top5.required.txt images/adult-claw-characters-top5-thumbnail.png images/hatsune-miku-claw-goods-top5-thumbnail.png search/index.html index.html sitemap.xml
git commit -m "feat: add adult claw character guides"
```
