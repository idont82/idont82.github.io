# Blog Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `blog/` section with a Naver-blog-inspired home page and a first article page for the Hongdae claw machine course, including dedicated blog assets, internal navigation, and embedded Coupang ad placements.

**Architecture:** Keep `blog/` fully separate from `search/` by creating dedicated HTML, CSS, JS, and image assets under `blog/`. Render the first version mostly as static HTML so title, body intro, hero image, and metadata are present in the initial document for SEO, while using a small shared `blog.js` file only for low-risk enhancements such as related-post lists or sidebar hydration. Reuse existing site content and area data as source material, but do not make the blog depend on the `claw-machine-guide.html` hash router.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, existing local Node static server (`node server.js`)

---

## File Map

### New files

- `blog/index.html`
  - Blog home page with header, profile, categories, tags, card-style post list, and right rail ads.
- `blog/hongdae-claw-tour.html`
  - First long-form article for Hongdae claw machine course content.
- `blog/assets/style.css`
  - Blog-only layout, typography, cards, sidebars, article body, and ad styles.
- `blog/assets/blog.js`
  - Small enhancement layer for shared blog interactions and repeated sidebar/related-post rendering.
- `blog/images/`
  - Blog-specific profile image and article/thumbnail assets.
- `data/search-page-checks/blog-home.required.txt`
  - Required text markers for blog home verification.
- `data/search-page-checks/blog-hongdae-claw-tour.required.txt`
  - Required text markers for first article verification.

### Existing files to modify

- `index.html`
  - Add a card or navigation entry pointing to `blog/index.html`.
- `sitemap.xml`
  - Register `blog/index.html` and `blog/hongdae-claw-tour.html`.

### Existing reference files to read during implementation

- `search/hongdae.html`
  - Existing regional search landing content to reuse factual summaries, addresses, and routes.
- `claw-machine-guide.html`
  - Existing tone, metadata, and area summary patterns.
- `data/hongdae.json`
  - Current Hongdae spot data for accurate names, addresses, and order.
- `search/assets/style.css`
  - Existing site content styles to avoid clashing choices and to reuse spacing conventions if helpful.

## Task 1: Build the blog asset structure

**Files:**
- Create: `blog/assets/style.css`
- Create: `blog/assets/blog.js`
- Create: `blog/images/.gitkeep`
- Modify: none
- Test: manual browser verification in `http://localhost:3000/blog/`

- [ ] **Step 1: Create the blog asset folder structure**

Create these files:

```text
blog/assets/style.css
blog/assets/blog.js
blog/images/.gitkeep
```

Expected result:

- The `blog/` directory exists with isolated assets.
- No existing `search/` asset paths are reused directly.

- [ ] **Step 2: Add the base CSS scaffold for blog pages**

Write the initial stylesheet to `blog/assets/style.css` with these sections:

```css
:root{
  --bg:#f5f6f8;
  --surface:#ffffff;
  --surface-soft:#fafafc;
  --line:#e5e7eb;
  --line-strong:#d1d5db;
  --text:#1f2937;
  --muted:#6b7280;
  --muted-2:#9ca3af;
  --accent:#14b85a;
  --accent-soft:#e8fff1;
  --tag:#eef2ff;
  --shadow:0 12px 32px rgba(15,23,42,0.08);
}

*{
  box-sizing:border-box;
}

html{
  scroll-behavior:smooth;
}

body{
  margin:0;
  font-family:"Segoe UI", "Malgun Gothic", sans-serif;
  color:var(--text);
  background:var(--bg);
  line-height:1.6;
}

img{
  display:block;
  max-width:100%;
}

a{
  color:inherit;
}
```

Expected result:

- Blog pages can share one stylesheet.
- The palette supports Naver-like familiarity without copying the original UI directly.

- [ ] **Step 3: Add the base JS scaffold for shared blog behavior**

Write the initial `blog/assets/blog.js` file:

```js
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('blog-ready');
});
```

Expected result:

- The file loads safely even before enhancements are added.
- Blog pages can attach future shared behavior without inline script sprawl.

- [ ] **Step 4: Verify assets load without syntax errors**

Run: `node server.js`

Expected:

- Local server starts on `http://localhost:3000`
- Visiting `http://localhost:3000/blog/` returns 404 for now, but no asset path assumptions are broken because files exist.

- [ ] **Step 5: Commit**

```bash
git add blog/assets/style.css blog/assets/blog.js blog/images/.gitkeep
git commit -m "feat: scaffold blog assets"
```

## Task 2: Build `blog/index.html` as the blog home

**Files:**
- Create: `blog/index.html`
- Modify: `blog/assets/style.css`
- Modify: `blog/assets/blog.js`
- Test: `http://localhost:3000/blog/index.html`

- [ ] **Step 1: Create the static home page shell**

Create `blog/index.html` with this document outline:

```html
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>블로그 | 인형뽑기·굿즈·생활형 추천 정리</title>
    <meta name="description" content="인형뽑기 코스, 굿즈, 콘서트 준비물, 생활형 추천을 정리하는 개인 블로그입니다. 홍대 인형뽑기 동선부터 하나씩 보기 쉽게 정리합니다.">
    <link rel="canonical" href="https://idont82.github.io/blog/index.html">
    <meta name="robots" content="max-image-preview:large">
    <meta property="og:type" content="website">
    <meta property="og:title" content="블로그 | 인형뽑기·굿즈·생활형 추천 정리">
    <meta property="og:description" content="인형뽑기 코스, 굿즈, 콘서트 준비물, 생활형 추천을 정리하는 개인 블로그입니다.">
    <meta property="og:url" content="https://idont82.github.io/blog/index.html">
    <meta property="og:image" content="https://idont82.github.io/blog/images/blog-home-thumbnail.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="https://idont82.github.io/blog/images/blog-home-thumbnail.png">
    <link rel="stylesheet" href="/blog/assets/style.css">
    <script defer src="/blog/assets/blog.js"></script>
  </head>
  <body class="blog-home">
  </body>
</html>
```

Expected result:

- Home page has independent metadata.
- The page is crawlable as a standalone blog section hub.

- [ ] **Step 2: Add the blog header, profile column, center cards, and right ad rail**

Inside `<body class="blog-home">`, add this top-level structure:

```html
<div class="blog-shell">
  <header class="blog-header"></header>
  <main class="blog-layout">
    <aside class="blog-sidebar blog-sidebar-left"></aside>
    <section class="blog-main"></section>
    <aside class="blog-sidebar blog-sidebar-right"></aside>
  </main>
</div>
```

Populate the sections with:

- Header:
  - blog title
  - one-line intro
  - small nav links
- Left sidebar:
  - profile card
  - categories
  - tags
  - recent posts
- Main:
  - card list with at least 4 visible cards
  - first card must link to `blog/hongdae-claw-tour.html`
- Right sidebar:
  - one `300x250` Coupang iframe
  - one supporting promo card

Expected result:

- The home page matches the “Naver feeling + cleaner layout” target.
- The content hierarchy is obvious without JavaScript.

- [ ] **Step 3: Add card content that supports both search and home-feed growth**

Fill the card list with a mix of current and placeholder blog topics:

```html
<article class="blog-card">
  <a href="/blog/hongdae-claw-tour.html" class="blog-card-link">
    <img src="/blog/images/hongdae-claw-tour-thumb.png" alt="홍대 인형뽑기 동선 정리 대표 이미지">
    <div class="blog-card-body">
      <div class="blog-card-meta">인형뽑기 코스 · 2026.05.26</div>
      <h2>홍대 인형뽑기 어디부터 갈까 | 처음 가면 이 순서가 편했습니다</h2>
      <p>상수역 1번 출구부터 메인 골목까지, 홍대 인형뽑기 코스를 한 번에 정리했습니다.</p>
      <div class="blog-card-tags">
        <span>#홍대인형뽑기</span>
        <span>#홍대인형뽑기성지</span>
        <span>#홍대데이트코스</span>
      </div>
    </div>
  </a>
</article>
```

Add at least 3 more cards using current site themes:

- BTS 콘서트 준비물
- 생활형 추천
- 굿즈/인형뽑기 확장

Expected result:

- The page does not look empty on launch day.
- The home can later support mixed-topic posting without redesign.

- [ ] **Step 4: Extend the CSS to support the home layout**

Add concrete rules to `blog/assets/style.css` for:

- `.blog-shell`
- `.blog-header`
- `.blog-layout`
- `.blog-sidebar`
- `.blog-main`
- `.blog-card`
- `.blog-card-link`
- `.blog-card-tags`

Include a desktop three-column layout and a mobile one-column fallback.

Expected result:

- The layout stays readable at desktop widths.
- Sidebars collapse gracefully on mobile.

- [ ] **Step 5: Add minimal shared JS for the recent-post list state**

Update `blog/assets/blog.js` to support a simple “current page” state:

```js
document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('blog-ready');

  const currentPath = window.location.pathname.replace(/\/+$/, '');
  document.querySelectorAll('[data-blog-path]').forEach((link) => {
    if (link.getAttribute('data-blog-path') === currentPath) {
      link.classList.add('is-current');
    }
  });
});
```

Expected result:

- Sidebar links can visibly highlight the current page.
- The script remains tiny and low-risk.

- [ ] **Step 6: Verify the home page manually**

Run: `node server.js`

Check:

- `http://localhost:3000/blog/index.html`
- desktop width around `1440px`
- mobile width around `390px`

Expected:

- Header, left profile, center cards, and right ads all render.
- No overlapping columns.
- First card points to the future Hongdae article URL.

- [ ] **Step 7: Commit**

```bash
git add blog/index.html blog/assets/style.css blog/assets/blog.js
git commit -m "feat: add blog home page"
```

## Task 3: Create the first article `blog/hongdae-claw-tour.html`

**Files:**
- Create: `blog/hongdae-claw-tour.html`
- Modify: `blog/assets/style.css`
- Modify: `blog/assets/blog.js`
- Test: `http://localhost:3000/blog/hongdae-claw-tour.html`

- [ ] **Step 1: Create the article head with SEO-ready metadata**

Create `blog/hongdae-claw-tour.html` and include:

```html
<title>홍대 인형뽑기 어디부터 갈까 | 처음 가면 이 순서가 편했습니다</title>
<meta name="description" content="홍대 인형뽑기 어디부터 가면 좋은지, 상수역 1번 출구부터 메인 골목까지 처음 가는 기준으로 정리한 생활형 코스 글입니다.">
<link rel="canonical" href="https://idont82.github.io/blog/hongdae-claw-tour.html">
<meta property="og:title" content="홍대 인형뽑기 어디부터 갈까 | 처음 가면 이 순서가 편했습니다">
<meta property="og:description" content="상수역 1번 출구부터 메인 골목까지, 홍대 인형뽑기 코스를 보기 편한 순서로 정리했습니다.">
<meta property="og:image" content="https://idont82.github.io/blog/images/hongdae-claw-tour-hero.png">
<meta name="twitter:image" content="https://idont82.github.io/blog/images/hongdae-claw-tour-hero.png">
```

Expected result:

- The article can stand alone in Naver and Google indexing.
- The title targets the long-tail question directly.

- [ ] **Step 2: Write the article body with the agreed structure**

Build the article body with:

- left sidebar
- center article
- right ad rail

Inside the article, include:

1. H1
2. date/category row
3. one-line summary box
4. hero image
5. intro paragraph with a conclusion-first statement
6. at least 4 H2 sections
7. FAQ section
8. related links section

Use this opening paragraph pattern:

```html
<p class="article-lead">
  홍대 인형뽑기는 상수역 1번 출구 쪽에서 시작해 어울마당로 메인 골목으로 올라가는 순서가 가장 보기 편했습니다. 큰 매장과 가챠샵을 같이 보기 좋고, 중간에 쉬거나 방향을 바꾸기도 쉬운 편입니다.
</p>
```

Expected result:

- The article satisfies “conclusion first”.
- The content is visible in static HTML before any JS enhancement.

- [ ] **Step 3: Insert the three required Coupang ad blocks**

Place ads in these positions:

1. after intro section: `300x250 iframe`
2. after middle H2 section: product-card-style ad
3. before related links: `300x250 iframe`

Use the already approved iframe:

```html
<iframe src="https://ads-partners.coupang.com/widgets.html?id=989908&template=carousel&trackingCode=AF7523287&subId=&width=300&height=250&tsource="
  width="300"
  height="250"
  frameborder="0"
  scrolling="no"
  referrerpolicy="unsafe-url"
  browsingtopics
  title="쿠팡 파트너스 관심 배너"></iframe>
```

Expected result:

- The article always shows 3 in-body ads.
- Ads are spaced between content sections instead of clumping together.

- [ ] **Step 4: Add article-specific CSS rules**

Extend `blog/assets/style.css` with:

- `.blog-article-shell`
- `.blog-article-meta`
- `.article-summary-box`
- `.article-hero`
- `.article-body`
- `.article-ad`
- `.faq-list`
- `.related-posts`

Also add styles for:

- floating or sticky right-rail ad behavior on desktop
- disabled sticky behavior on mobile

Expected result:

- The article reads like a blog, not like a landing page template.
- Ad blocks feel embedded, not bolted on.

- [ ] **Step 5: Add related-post and category highlighting support**

Update `blog/assets/blog.js` so both home and article pages can share:

- current-page highlighting
- related-post active styling

Keep the script declarative and minimal.

Expected result:

- The article and home feel like one section.
- Shared nav state works consistently.

- [ ] **Step 6: Verify article layout and reading flow**

Run: `node server.js`

Check:

- `http://localhost:3000/blog/hongdae-claw-tour.html`
- desktop and mobile widths
- all 3 ad slots visible
- hero image and first paragraph visible without scrolling too far

Expected:

- The page looks like a clean personal blog with sidebars.
- The article body stays the visual focus.

- [ ] **Step 7: Commit**

```bash
git add blog/hongdae-claw-tour.html blog/assets/style.css blog/assets/blog.js
git commit -m "feat: add hongdae blog article"
```

## Task 4: Add blog assets and required-text check files

**Files:**
- Create: `blog/images/blog-home-thumbnail.png`
- Create: `blog/images/hongdae-claw-tour-thumb.png`
- Create: `blog/images/hongdae-claw-tour-hero.png`
- Create: `data/search-page-checks/blog-home.required.txt`
- Create: `data/search-page-checks/blog-hongdae-claw-tour.required.txt`
- Test: manual asset loading + required text scan

- [ ] **Step 1: Create the minimum image set**

Prepare:

- one home thumbnail image
- one Hongdae card thumbnail
- one Hongdae hero image

Image requirements:

- actual raster image assets
- filenames include the article topic
- article hero visually supports the keyword “홍대 인형뽑기”

Expected result:

- Blog pages do not rely on missing placeholder graphics.

- [ ] **Step 2: Add required-text check files**

Write `data/search-page-checks/blog-home.required.txt` with lines like:

```text
블로그
홍대 인형뽑기 어디부터 갈까
인형뽑기 코스
굿즈
```

Write `data/search-page-checks/blog-hongdae-claw-tour.required.txt` with lines like:

```text
홍대 인형뽑기 어디부터 갈까
상수역 1번 출구
홍대 인형뽑기 성지
어울마당로
```

Expected result:

- The new section follows the same content validation pattern used elsewhere in the repo.

- [ ] **Step 3: Verify assets and key text exist**

Run:

```bash
Get-Content data\search-page-checks\blog-home.required.txt
Get-Content data\search-page-checks\blog-hongdae-claw-tour.required.txt
```

Expected:

- Required text files are readable.
- The listed markers exist in the HTML pages.

- [ ] **Step 4: Commit**

```bash
git add blog/images data/search-page-checks/blog-home.required.txt data/search-page-checks/blog-hongdae-claw-tour.required.txt
git commit -m "feat: add blog images and checks"
```

## Task 5: Connect the blog section to the rest of the site

**Files:**
- Modify: `index.html`
- Modify: `sitemap.xml`
- Test: local navigation + sitemap XML parse

- [ ] **Step 1: Add a homepage entry to the blog section**

Update `index.html` with one visible link or card that points to:

```text
/blog/index.html
```

Use short copy that matches the new section:

```html
<a href="/blog/index.html">블로그에서 더 보기</a>
```

Expected result:

- The new section is discoverable from the main site.

- [ ] **Step 2: Register blog URLs in `sitemap.xml`**

Add entries for:

- `https://idont82.github.io/blog/index.html`
- `https://idont82.github.io/blog/hongdae-claw-tour.html`

Expected result:

- Search engines can discover the blog section without relying only on internal links.

- [ ] **Step 3: Verify sitemap parsing**

Run:

```bash
[xml]$site = Get-Content sitemap.xml
$site.urlset.url.Count
```

Expected:

- XML parses successfully.
- URL count includes the new 2 blog entries.

- [ ] **Step 4: Verify navigation manually**

Run: `node server.js`

Check:

- `http://localhost:3000/index.html`
- click into `/blog/index.html`
- click into `/blog/hongdae-claw-tour.html`

Expected:

- Navigation works without broken links.
- No `search/` or `claw-machine-guide.html` route is disrupted.

- [ ] **Step 5: Commit**

```bash
git add index.html sitemap.xml
git commit -m "feat: connect blog section"
```

## Task 6: Final verification

**Files:**
- Verify all new blog files
- Verify no unrelated files are accidentally staged

- [ ] **Step 1: Review changed files**

Run:

```bash
git status --short
```

Expected:

- Only intended blog files plus explicitly touched site entry files are modified.

- [ ] **Step 2: Verify core text markers**

Run:

```bash
Select-String -Path blog\index.html -Pattern "홍대 인형뽑기 어디부터 갈까","블로그","굿즈"
Select-String -Path blog\hongdae-claw-tour.html -Pattern "상수역 1번 출구","어울마당로","홍대 인형뽑기 성지","FAQ"
```

Expected:

- Required terms appear in the initial HTML.

- [ ] **Step 3: Verify article metadata**

Run:

```bash
Select-String -Path blog\hongdae-claw-tour.html -Pattern "<title>","meta name=\"description\"","canonical","og:image"
```

Expected:

- All core metadata exists exactly once where appropriate.

- [ ] **Step 4: Verify responsive layout manually**

Run: `node server.js`

Check:

- `http://localhost:3000/blog/index.html`
- `http://localhost:3000/blog/hongdae-claw-tour.html`

Expected:

- Desktop: left profile, center content, right ads
- Mobile: single-column readable layout
- Article in-body ads remain visible and non-overlapping

- [ ] **Step 5: Final commit**

```bash
git add blog index.html sitemap.xml data/search-page-checks
git commit -m "feat: launch blog section"
```

## Spec Coverage Review

- `blog/` separate structure: covered by Tasks 1 and 2.
- Naver-feeling but cleaner layout: covered by Tasks 2 and 3 with dedicated blog CSS.
- Personal lifestyle blogger tone: covered by Task 3 article structure and content.
- Left profile/category, center content, right ad rail: covered by Tasks 2 and 3.
- Three in-body ads: covered by Task 3.
- SEO/AI-summary-friendly structure: covered by Tasks 2, 3, and 4 through metadata, conclusion-first intro, H2/H3 layout, and FAQ.
- Search/home-feed dual readiness: covered by Task 2 card structure and Task 3 article structure.

No uncovered spec sections remain for the first implementation scope.
