# /search/ 쿠팡 파트너스 콘텐츠 사이트 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `idont82.github.io/search/` 하위에 SEO로 유입을 받아 쿠팡 파트너스 링크로 전환시키는 독립 콘텐츠 사이트의 MVP(공통 스타일, 템플릿, 허브, 샘플 페이지 1개, 사이트맵 갱신)를 만든다.

**Architecture:** 페이지 하나 = HTML 파일 하나. 모든 콘텐츠는 HTML에 inline으로 박혀 있어 구글·네이버 크롤러가 JS 실행 없이 읽을 수 있다. 공통 스타일 하나(`search/assets/style.css`)만 외부 참조하고, 헤더/푸터 마크업은 각 페이지에 복붙한다. 빌드 단계 없음.

**Tech Stack:** 바닐라 HTML5 + CSS3 (프레임워크/빌드/패키지 없음). `server.js`(기존 로컬 정적 서버)를 통해 `http://localhost:3000`에서 확인. GitHub Pages로 배포.

---

## 사전 결정사항 (스펙 "열린 질문" 해소)

| 질문 | 결정 | 이유 |
|---|---|---|
| 샘플 페이지 카테고리 | **무선 블루투스 이어폰** | 누구나 아는 범용 카테고리, 스펙 비교가 명확, 제품명은 가상("Sample Earbuds A/B/C")으로 플레이스홀더 처리 |
| `partners.js` 클릭 트래킹 | **MVP 제외** (YAGNI) | 당장 분석 대상 트래픽이 없음. 이후 이터레이션에서 GA 또는 자체 스크립트로 추가 가능 |
| 허브 페이지 목록 갱신 | **완전 수동 HTML** | JS 렌더링 리스크 없음, 새 글 추가 시 두 파일(`index.html` + `sitemap.xml`)만 손대면 되므로 충분 |

## 테스팅 방식에 대한 안내

이 프로젝트는 자동화된 테스트 인프라가 없다(패키지 매니저·테스트 러너 없음, 순수 정적 HTML). 따라서 이 계획의 "검증" 스텝은 자동화된 테스트가 아니라 **구체적인 수동/명령줄 확인**으로 구성된다:

- `grep`으로 필수 문자열 존재 확인 (고지문구, `rel="sponsored nofollow"`, JSON-LD 태그 등)
- `node server.js` 기동 후 브라우저에서 페이지 로딩 확인
- XML 구문 유효성 확인(`xmllint` 없으면 육안)

이는 이 프로젝트의 기존 관행과 일치한다(기존 커밋들도 수동 검증 방식).

## 파일 구조

**생성:**
- `search/assets/style.css` — 모든 페이지가 공유하는 스타일시트
- `search/template.html` — 새 글 작성용 복사 원본. 플레이스홀더(`{{CATEGORY}}` 등) 포함
- `search/index.html` — 허브 페이지. 발행된 글 목록을 수동 HTML로 나열
- `search/wireless-earbuds-top3.html` — 템플릿을 실제로 채운 샘플 페이지. 가상 제품 3개

**수정:**
- `sitemap.xml` — `/search/` 하위 URL 4개 추가

**변경 없음 (중요):**
- `index.html` (기존 인형뽑기 가이드 루트)
- `claw-machine.html`, `claw-machine.js`, `claw-machine.css`
- `data/*.json`
- `robots.txt` (이미 `Allow: /` 상태 — 추가 조치 불필요)

---

## Task 1: 공통 스타일시트 생성

**Files:**
- Create: `search/assets/style.css`

이 스타일시트는 모든 `/search/` 페이지에서 `<link>`로 참조된다. 디자인 목표는 "정보성·신뢰감 있는 밝은 톤"(기존 다크 아케이드 테마와 완전 분리).

- [ ] **Step 1: 디렉토리 생성 및 파일 작성**

`search/assets/style.css` 를 아래 내용으로 생성한다. 반응형(모바일 우선), 시스템 폰트, Coupang 브랜드 색 회피를 위한 중립 블루 액센트.

```css
/* /search/ Coupang Partners content site — shared stylesheet */

:root {
  --bg: #ffffff;
  --bg-soft: #f7f8fa;
  --text: #1f2430;
  --text-muted: #5a6273;
  --border: #e4e7ee;
  --accent: #2563eb;
  --accent-dark: #1d4ed8;
  --cta: #16a34a;
  --cta-dark: #15803d;
  --warn-bg: #fff8e1;
  --warn-border: #f5d97a;
  --warn-text: #7a5a00;
  --gold: #d4a017;
  --silver: #9aa3b2;
  --bronze: #b07840;
  --radius: 10px;
  --shadow: 0 2px 8px rgba(20, 30, 60, 0.06);
  --max-w: 760px;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
               "Noto Sans KR", "Malgun Gothic", sans-serif;
  font-size: 16px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

.container {
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 0 20px;
}

/* Header / Footer */
.site-header {
  padding: 18px 0;
  border-bottom: 1px solid var(--border);
  background: var(--bg-soft);
}
.site-header .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.site-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}
.site-nav a { margin-left: 16px; font-size: 14px; color: var(--text-muted); }

.site-footer {
  margin-top: 60px;
  padding: 30px 0;
  border-top: 1px solid var(--border);
  background: var(--bg-soft);
  color: var(--text-muted);
  font-size: 13px;
  text-align: center;
}

/* Disclosure banner (쿠팡 파트너스 의무 고지문구) */
.disclosure {
  margin: 20px 0;
  padding: 12px 16px;
  background: var(--warn-bg);
  border: 1px solid var(--warn-border);
  color: var(--warn-text);
  border-radius: var(--radius);
  font-size: 14px;
  line-height: 1.5;
}

/* Article heading block */
.article-header {
  margin: 30px 0 20px;
}
.article-header h1 {
  font-size: 28px;
  line-height: 1.3;
  margin: 0 0 10px;
}
.article-meta {
  font-size: 13px;
  color: var(--text-muted);
}

/* Intro paragraph */
.intro {
  margin: 20px 0 30px;
  font-size: 16px;
  color: var(--text);
}

/* Comparison table */
.compare-table {
  width: 100%;
  border-collapse: collapse;
  margin: 30px 0;
  background: var(--bg);
  box-shadow: var(--shadow);
  border-radius: var(--radius);
  overflow: hidden;
}
.compare-table th, .compare-table td {
  padding: 12px 10px;
  border-bottom: 1px solid var(--border);
  text-align: left;
  font-size: 14px;
  vertical-align: top;
}
.compare-table thead th {
  background: var(--bg-soft);
  font-weight: 700;
}
.compare-table tr:last-child td { border-bottom: none; }

/* Rank badge */
.rank-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  margin-right: 8px;
}
.rank-1 { background: var(--gold); }
.rank-2 { background: var(--silver); }
.rank-3 { background: var(--bronze); }

/* Product section */
.product {
  margin: 40px 0;
  padding: 24px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  box-shadow: var(--shadow);
}
.product h2 {
  margin: 0 0 12px;
  font-size: 22px;
  line-height: 1.3;
}
.product img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 10px 0;
  background: var(--bg-soft);
}
.product .one-liner {
  font-size: 15px;
  color: var(--text-muted);
  margin-bottom: 16px;
}
.pros-cons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 16px 0;
}
.pros-cons ul {
  margin: 0;
  padding-left: 20px;
  font-size: 14px;
}
.pros h3, .cons h3 {
  font-size: 14px;
  margin: 0 0 6px;
}
.pros h3 { color: var(--cta-dark); }
.cons h3 { color: #b91c1c; }

.specs {
  margin: 16px 0;
  padding: 12px;
  background: var(--bg-soft);
  border-radius: 8px;
  font-size: 14px;
}
.specs dt { font-weight: 700; display: inline; }
.specs dd { margin: 0 0 4px 0; display: inline; }
.specs dd::after { content: ""; display: block; }

/* CTA button */
.cta {
  display: inline-block;
  padding: 14px 24px;
  background: var(--cta);
  color: #fff !important;
  font-weight: 700;
  font-size: 16px;
  border-radius: 8px;
  text-decoration: none;
  margin-top: 10px;
}
.cta:hover { background: var(--cta-dark); text-decoration: none; }

/* Guide + FAQ */
.guide, .faq {
  margin: 40px 0;
  padding: 24px;
  background: var(--bg-soft);
  border-radius: var(--radius);
}
.guide h2, .faq h2 {
  margin-top: 0;
  font-size: 20px;
}
.faq details {
  margin: 10px 0;
  padding: 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
}
.faq summary {
  font-weight: 700;
  cursor: pointer;
}
.faq details[open] { box-shadow: var(--shadow); }

/* Hub (index.html) listing */
.post-list {
  list-style: none;
  padding: 0;
  margin: 30px 0;
}
.post-list li {
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
}
.post-list a {
  font-size: 17px;
  font-weight: 700;
}
.post-list .post-desc {
  display: block;
  font-size: 14px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* Mobile */
@media (max-width: 600px) {
  .article-header h1 { font-size: 22px; }
  .product { padding: 16px; }
  .pros-cons { grid-template-columns: 1fr; }
  .compare-table th, .compare-table td { font-size: 13px; padding: 8px 6px; }
}
```

- [ ] **Step 2: 파일이 생성되고 필수 클래스들이 포함되었는지 확인**

Run: `grep -E "^\.(disclosure|compare-table|product|cta|post-list)" search/assets/style.css`

Expected output (각 클래스 최소 1회 매칭):
```
.disclosure {
.compare-table {
.product {
.cta {
.post-list {
```

- [ ] **Step 3: 커밋**

```bash
git add search/assets/style.css
git commit -m "feat(search): add shared stylesheet for coupang partners content site"
```

---

## Task 2: 재사용 템플릿 파일 생성

**Files:**
- Create: `search/template.html`

이 파일은 새 글을 쓸 때 복사해서 내용만 교체하는 원본이다. 플레이스홀더는 `{{...}}` 형태로 표기해 **검색/치환이 쉽게** 한다. 이 파일 자체는 배포되어도 무방하지만(`noindex`로 색인만 제외) 허브 목록에는 노출하지 않는다.

- [ ] **Step 1: 템플릿 파일 작성**

Create `search/template.html`:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{CATEGORY}} 비교 TOP 3 추천 ({{YEAR}}) | 구매 가이드</title>
<meta name="description" content="{{CATEGORY}} 비교 TOP 3. 가격·성능·장단점을 한눈에 비교하고 나에게 맞는 제품을 고르세요. ({{YEAR}} 최신)">
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="https://idont82.github.io/search/{{SLUG}}.html">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:title" content="{{CATEGORY}} 비교 TOP 3 추천 ({{YEAR}})">
<meta property="og:description" content="{{CATEGORY}} TOP 3 비교 — 가격·성능·장단점 한눈에">
<meta property="og:url" content="https://idont82.github.io/search/{{SLUG}}.html">

<link rel="stylesheet" href="/search/assets/style.css">

<!-- ItemList structured data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "{{PRODUCT_1_NAME}}" },
    { "@type": "ListItem", "position": 2, "name": "{{PRODUCT_2_NAME}}" },
    { "@type": "ListItem", "position": 3, "name": "{{PRODUCT_3_NAME}}" }
  ]
}
</script>

<!-- FAQPage structured data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "{{FAQ_Q1}}",
      "acceptedAnswer": { "@type": "Answer", "text": "{{FAQ_A1}}" }
    },
    {
      "@type": "Question",
      "name": "{{FAQ_Q2}}",
      "acceptedAnswer": { "@type": "Answer", "text": "{{FAQ_A2}}" }
    }
  ]
}
</script>
</head>
<body>

<header class="site-header">
  <div class="container">
    <div class="site-title">구매 가이드</div>
    <nav class="site-nav">
      <a href="/search/">전체 글</a>
    </nav>
  </div>
</header>

<main class="container">

  <div class="disclosure">
    이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
  </div>

  <section class="article-header">
    <h1>{{CATEGORY}} 비교 TOP 3 추천 ({{YEAR}})</h1>
    <div class="article-meta">게시일: {{PUBLISH_DATE}} · 최종 업데이트: {{UPDATE_DATE}}</div>
  </section>

  <p class="intro">
    {{INTRO_PARAGRAPH}}
  </p>

  <h2>한눈에 비교표</h2>
  <table class="compare-table">
    <thead>
      <tr>
        <th>항목</th>
        <th>🥇 {{PRODUCT_1_NAME}}</th>
        <th>🥈 {{PRODUCT_2_NAME}}</th>
        <th>🥉 {{PRODUCT_3_NAME}}</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>가격대</td><td>{{P1_PRICE}}</td><td>{{P2_PRICE}}</td><td>{{P3_PRICE}}</td></tr>
      <tr><td>{{SPEC_ROW_1_LABEL}}</td><td>{{P1_SPEC1}}</td><td>{{P2_SPEC1}}</td><td>{{P3_SPEC1}}</td></tr>
      <tr><td>{{SPEC_ROW_2_LABEL}}</td><td>{{P1_SPEC2}}</td><td>{{P2_SPEC2}}</td><td>{{P3_SPEC2}}</td></tr>
      <tr><td>추천 대상</td><td>{{P1_TARGET}}</td><td>{{P2_TARGET}}</td><td>{{P3_TARGET}}</td></tr>
    </tbody>
  </table>

  <!-- Product 1 -->
  <article class="product">
    <h2><span class="rank-badge rank-1">1위</span>{{PRODUCT_1_NAME}}</h2>
    <img src="{{P1_IMAGE_URL}}" alt="{{PRODUCT_1_NAME}} 제품 이미지">
    <p class="one-liner">{{P1_ONELINER}}</p>

    <div class="pros-cons">
      <div class="pros">
        <h3>✅ 장점</h3>
        <ul>
          <li>{{P1_PRO_1}}</li>
          <li>{{P1_PRO_2}}</li>
          <li>{{P1_PRO_3}}</li>
        </ul>
      </div>
      <div class="cons">
        <h3>❌ 단점</h3>
        <ul>
          <li>{{P1_CON_1}}</li>
          <li>{{P1_CON_2}}</li>
        </ul>
      </div>
    </div>

    <dl class="specs">
      <dt>{{SPEC_ROW_1_LABEL}}:</dt><dd>{{P1_SPEC1}}</dd>
      <dt>{{SPEC_ROW_2_LABEL}}:</dt><dd>{{P1_SPEC2}}</dd>
      <dt>가격대:</dt><dd>{{P1_PRICE}}</dd>
    </dl>

    <a class="cta" href="{{P1_COUPANG_LINK}}" rel="sponsored nofollow" target="_blank">쿠팡에서 보기 →</a>
  </article>

  <!-- Product 2 -->
  <article class="product">
    <h2><span class="rank-badge rank-2">2위</span>{{PRODUCT_2_NAME}}</h2>
    <img src="{{P2_IMAGE_URL}}" alt="{{PRODUCT_2_NAME}} 제품 이미지">
    <p class="one-liner">{{P2_ONELINER}}</p>

    <div class="pros-cons">
      <div class="pros">
        <h3>✅ 장점</h3>
        <ul>
          <li>{{P2_PRO_1}}</li>
          <li>{{P2_PRO_2}}</li>
          <li>{{P2_PRO_3}}</li>
        </ul>
      </div>
      <div class="cons">
        <h3>❌ 단점</h3>
        <ul>
          <li>{{P2_CON_1}}</li>
          <li>{{P2_CON_2}}</li>
        </ul>
      </div>
    </div>

    <dl class="specs">
      <dt>{{SPEC_ROW_1_LABEL}}:</dt><dd>{{P2_SPEC1}}</dd>
      <dt>{{SPEC_ROW_2_LABEL}}:</dt><dd>{{P2_SPEC2}}</dd>
      <dt>가격대:</dt><dd>{{P2_PRICE}}</dd>
    </dl>

    <a class="cta" href="{{P2_COUPANG_LINK}}" rel="sponsored nofollow" target="_blank">쿠팡에서 보기 →</a>
  </article>

  <!-- Product 3 -->
  <article class="product">
    <h2><span class="rank-badge rank-3">3위</span>{{PRODUCT_3_NAME}}</h2>
    <img src="{{P3_IMAGE_URL}}" alt="{{PRODUCT_3_NAME}} 제품 이미지">
    <p class="one-liner">{{P3_ONELINER}}</p>

    <div class="pros-cons">
      <div class="pros">
        <h3>✅ 장점</h3>
        <ul>
          <li>{{P3_PRO_1}}</li>
          <li>{{P3_PRO_2}}</li>
          <li>{{P3_PRO_3}}</li>
        </ul>
      </div>
      <div class="cons">
        <h3>❌ 단점</h3>
        <ul>
          <li>{{P3_CON_1}}</li>
          <li>{{P3_CON_2}}</li>
        </ul>
      </div>
    </div>

    <dl class="specs">
      <dt>{{SPEC_ROW_1_LABEL}}:</dt><dd>{{P3_SPEC1}}</dd>
      <dt>{{SPEC_ROW_2_LABEL}}:</dt><dd>{{P3_SPEC2}}</dd>
      <dt>가격대:</dt><dd>{{P3_PRICE}}</dd>
    </dl>

    <a class="cta" href="{{P3_COUPANG_LINK}}" rel="sponsored nofollow" target="_blank">쿠팡에서 보기 →</a>
  </article>

  <section class="guide">
    <h2>💡 어떤 분께 어떤 제품을 추천할까?</h2>
    <p>{{GUIDE_PARAGRAPH_1}}</p>
    <p>{{GUIDE_PARAGRAPH_2}}</p>
  </section>

  <section class="faq">
    <h2>자주 묻는 질문</h2>
    <details>
      <summary>{{FAQ_Q1}}</summary>
      <p>{{FAQ_A1}}</p>
    </details>
    <details>
      <summary>{{FAQ_Q2}}</summary>
      <p>{{FAQ_A2}}</p>
    </details>
  </section>

  <div class="disclosure">
    이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
  </div>

</main>

<footer class="site-footer">
  <div class="container">
    © idont82.github.io · 구매 가이드
  </div>
</footer>

</body>
</html>
```

**중요한 템플릿 규칙:**
- 파일 상단에 `<meta name="robots" content="noindex, nofollow">` — 템플릿 자체는 색인되면 안 됨. 실제 글을 만들 때 이 메타 태그는 **삭제**해야 함.
- 모든 플레이스홀더는 `{{UPPER_CASE}}` 형태. 새 글 작성 시 에디터 찾아바꾸기로 일괄 교체.
- 쿠팡 링크는 반드시 `rel="sponsored nofollow"` + `target="_blank"`.
- 고지문구는 상단·하단 두 번.

- [ ] **Step 2: 필수 요소 존재 확인**

Run: `grep -c "이 포스팅은 쿠팡 파트너스" search/template.html`
Expected: `2` (상단·하단 두 번 노출)

Run: `grep -c 'rel="sponsored nofollow"' search/template.html`
Expected: `3` (제품 3개 각각의 CTA)

Run: `grep -c 'application/ld+json' search/template.html`
Expected: `2` (ItemList + FAQPage)

Run: `grep 'noindex' search/template.html`
Expected: `<meta name="robots" content="noindex, nofollow">` 한 줄

- [ ] **Step 3: 로컬 서버에서 렌더링 확인**

서버가 이미 돌고 있지 않다면: `node server.js` (기존 서버가 있다면 그대로 사용)

브라우저에서 `http://localhost:3000/search/template.html` 열기.

확인 항목:
- 페이지가 에러 없이 렌더링됨
- CSS가 적용되어 상단 헤더 띠, 노란색 고지 배너, 제품 카드 3개, 비교표가 보임
- 브라우저 콘솔에 에러 없음
- 플레이스홀더 문자열(`{{PRODUCT_1_NAME}}` 등)이 그대로 보이는 것이 정상

- [ ] **Step 4: 커밋**

```bash
git add search/template.html
git commit -m "feat(search): add reusable TOP 3 article template with noindex meta"
```

---

## Task 3: 샘플 페이지 작성 (wireless-earbuds-top3.html)

**Files:**
- Create: `search/wireless-earbuds-top3.html`

이 파일은 템플릿이 실제로 동작하는지 검증하고, 향후 실제 글 작성 시 참고할 수 있는 완성된 예시이다. 제품명은 가상("Sample Earbuds A/B/C")이므로 상표 문제 없음. 쿠팡 링크는 **아직 파트너스 승인 전이므로 쿠팡 검색 URL(`https://www.coupang.com/np/search?q=...`)을 플레이스홀더로 사용**한다. 실제 파트너스 링크로 교체는 별도 작업.

- [ ] **Step 1: 샘플 페이지 작성**

Create `search/wireless-earbuds-top3.html`:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>무선 블루투스 이어폰 비교 TOP 3 추천 (2026) | 구매 가이드</title>
<meta name="description" content="무선 블루투스 이어폰 비교 TOP 3. 가격·음질·노이즈 캔슬링·배터리를 한눈에 비교하고 나에게 맞는 이어폰을 고르세요. (2026 최신)">
<link rel="canonical" href="https://idont82.github.io/search/wireless-earbuds-top3.html">

<!-- Open Graph -->
<meta property="og:type" content="article">
<meta property="og:title" content="무선 블루투스 이어폰 비교 TOP 3 추천 (2026)">
<meta property="og:description" content="무선 이어폰 TOP 3 비교 — 가격·음질·노이즈 캔슬링·배터리 한눈에">
<meta property="og:url" content="https://idont82.github.io/search/wireless-earbuds-top3.html">

<link rel="stylesheet" href="/search/assets/style.css">

<!-- ItemList structured data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Sample Earbuds A" },
    { "@type": "ListItem", "position": 2, "name": "Sample Earbuds B" },
    { "@type": "ListItem", "position": 3, "name": "Sample Earbuds C" }
  ]
}
</script>

<!-- FAQPage structured data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "무선 이어폰은 어떤 기준으로 고르는 게 좋나요?",
      "acceptedAnswer": { "@type": "Answer", "text": "가장 먼저 사용 환경(출퇴근·운동·재택)에 맞는 착용감과 방수 등급을 확인하세요. 그다음 노이즈 캔슬링 유무, 배터리 지속시간, 코덱 지원을 순서대로 비교하면 선택이 쉬워집니다." }
    },
    {
      "@type": "Question",
      "name": "저가형과 고가형의 체감 차이가 큰가요?",
      "acceptedAnswer": { "@type": "Answer", "text": "가장 크게 체감되는 부분은 노이즈 캔슬링 성능과 통화 품질입니다. 순수 음질은 10만원대에서도 만족도가 높으며, 그 이상은 ANC·멀티포인트 같은 부가기능 차이가 주를 이룹니다." }
    }
  ]
}
</script>
</head>
<body>

<header class="site-header">
  <div class="container">
    <div class="site-title">구매 가이드</div>
    <nav class="site-nav">
      <a href="/search/">전체 글</a>
    </nav>
  </div>
</header>

<main class="container">

  <div class="disclosure">
    이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
  </div>

  <section class="article-header">
    <h1>무선 블루투스 이어폰 비교 TOP 3 추천 (2026)</h1>
    <div class="article-meta">게시일: 2026-04-06 · 최종 업데이트: 2026-04-06</div>
  </section>

  <p class="intro">
    무선 이어폰을 고를 때 가장 중요한 건 <strong>착용감·노이즈 캔슬링·배터리</strong> 세 가지입니다.
    이 글에서는 서로 다른 가격대의 대표 모델 3종을 직접 비교해 어떤 상황에 어떤 제품이 가장 알맞은지 정리했습니다.
    통근길·운동·재택근무 등 사용 환경에 맞춰 고르면 후회할 확률이 크게 줄어듭니다.
  </p>

  <h2>한눈에 비교표</h2>
  <table class="compare-table">
    <thead>
      <tr>
        <th>항목</th>
        <th>🥇 Sample Earbuds A</th>
        <th>🥈 Sample Earbuds B</th>
        <th>🥉 Sample Earbuds C</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>가격대</td><td>20만원대</td><td>10만원대</td><td>5만원대</td></tr>
      <tr><td>노이즈 캔슬링</td><td>강력 (ANC)</td><td>중간 (ANC)</td><td>없음</td></tr>
      <tr><td>배터리(ANC on)</td><td>6시간</td><td>5시간</td><td>7시간</td></tr>
      <tr><td>추천 대상</td><td>지하철 출퇴근·몰입형</td><td>가성비 밸런스형</td><td>가벼운 일상용</td></tr>
    </tbody>
  </table>

  <!-- Product 1 -->
  <article class="product">
    <h2><span class="rank-badge rank-1">1위</span>Sample Earbuds A</h2>
    <img src="https://via.placeholder.com/600x360?text=Sample+Earbuds+A" alt="Sample Earbuds A 제품 이미지">
    <p class="one-liner">ANC 성능과 음질 균형이 뛰어난 플래그십 급 무선 이어폰.</p>

    <div class="pros-cons">
      <div class="pros">
        <h3>✅ 장점</h3>
        <ul>
          <li>지하철·버스에서도 조용해지는 강력한 노이즈 캔슬링</li>
          <li>중저음이 단단한 밸런스형 음질</li>
          <li>멀티포인트 지원으로 폰·노트북 동시 연결</li>
        </ul>
      </div>
      <div class="cons">
        <h3>❌ 단점</h3>
        <ul>
          <li>가격대가 높은 편</li>
          <li>ANC 사용 시 배터리가 다소 짧음</li>
        </ul>
      </div>
    </div>

    <dl class="specs">
      <dt>노이즈 캔슬링:</dt><dd>강력 (ANC)</dd>
      <dt>배터리(ANC on):</dt><dd>6시간</dd>
      <dt>가격대:</dt><dd>20만원대</dd>
    </dl>

    <a class="cta" href="https://www.coupang.com/np/search?q=%EB%AC%B4%EC%84%A0%20%EC%9D%B4%EC%96%B4%ED%8F%B0" rel="sponsored nofollow" target="_blank">쿠팡에서 보기 →</a>
  </article>

  <!-- Product 2 -->
  <article class="product">
    <h2><span class="rank-badge rank-2">2위</span>Sample Earbuds B</h2>
    <img src="https://via.placeholder.com/600x360?text=Sample+Earbuds+B" alt="Sample Earbuds B 제품 이미지">
    <p class="one-liner">가격과 성능의 균형이 가장 좋은 가성비 올라운더.</p>

    <div class="pros-cons">
      <div class="pros">
        <h3>✅ 장점</h3>
        <ul>
          <li>10만원대에서 ANC까지 모두 갖춤</li>
          <li>가벼운 착용감으로 장시간 사용 편함</li>
          <li>앱 연동으로 이퀄라이저 조정 가능</li>
        </ul>
      </div>
      <div class="cons">
        <h3>❌ 단점</h3>
        <ul>
          <li>ANC 강도는 플래그십 대비 약함</li>
          <li>통화 품질이 조용한 환경에 유리</li>
        </ul>
      </div>
    </div>

    <dl class="specs">
      <dt>노이즈 캔슬링:</dt><dd>중간 (ANC)</dd>
      <dt>배터리(ANC on):</dt><dd>5시간</dd>
      <dt>가격대:</dt><dd>10만원대</dd>
    </dl>

    <a class="cta" href="https://www.coupang.com/np/search?q=%EB%AC%B4%EC%84%A0%20%EC%9D%B4%EC%96%B4%ED%8F%B0" rel="sponsored nofollow" target="_blank">쿠팡에서 보기 →</a>
  </article>

  <!-- Product 3 -->
  <article class="product">
    <h2><span class="rank-badge rank-3">3위</span>Sample Earbuds C</h2>
    <img src="https://via.placeholder.com/600x360?text=Sample+Earbuds+C" alt="Sample Earbuds C 제품 이미지">
    <p class="one-liner">5만원대에서 만족도가 높은 입문용 가볍게 쓰기 좋은 모델.</p>

    <div class="pros-cons">
      <div class="pros">
        <h3>✅ 장점</h3>
        <ul>
          <li>부담 없는 가격</li>
          <li>장시간 배터리</li>
          <li>가벼운 일상·재택 근무에 충분한 음질</li>
        </ul>
      </div>
      <div class="cons">
        <h3>❌ 단점</h3>
        <ul>
          <li>노이즈 캔슬링 미지원</li>
          <li>저음 양감이 다소 아쉬울 수 있음</li>
        </ul>
      </div>
    </div>

    <dl class="specs">
      <dt>노이즈 캔슬링:</dt><dd>없음</dd>
      <dt>배터리(ANC on):</dt><dd>7시간</dd>
      <dt>가격대:</dt><dd>5만원대</dd>
    </dl>

    <a class="cta" href="https://www.coupang.com/np/search?q=%EB%AC%B4%EC%84%A0%20%EC%9D%B4%EC%96%B4%ED%8F%B0" rel="sponsored nofollow" target="_blank">쿠팡에서 보기 →</a>
  </article>

  <section class="guide">
    <h2>💡 어떤 분께 어떤 제품을 추천할까?</h2>
    <p><strong>지하철·버스에서 매일 쓴다면</strong> 1위 Sample Earbuds A가 가장 낫습니다. ANC 성능 차이가 체감상 가장 크게 느껴지는 환경이기 때문입니다.</p>
    <p><strong>가격과 성능의 밸런스를 원한다면</strong> 2위 Sample Earbuds B, <strong>가벼운 재택·산책 위주라면</strong> 3위 Sample Earbuds C로 충분합니다. 가격 차이가 두 배 이상 나므로 사용 환경을 먼저 정한 뒤 고르는 게 합리적입니다.</p>
  </section>

  <section class="faq">
    <h2>자주 묻는 질문</h2>
    <details>
      <summary>무선 이어폰은 어떤 기준으로 고르는 게 좋나요?</summary>
      <p>가장 먼저 사용 환경(출퇴근·운동·재택)에 맞는 착용감과 방수 등급을 확인하세요. 그다음 노이즈 캔슬링 유무, 배터리 지속시간, 코덱 지원을 순서대로 비교하면 선택이 쉬워집니다.</p>
    </details>
    <details>
      <summary>저가형과 고가형의 체감 차이가 큰가요?</summary>
      <p>가장 크게 체감되는 부분은 노이즈 캔슬링 성능과 통화 품질입니다. 순수 음질은 10만원대에서도 만족도가 높으며, 그 이상은 ANC·멀티포인트 같은 부가기능 차이가 주를 이룹니다.</p>
    </details>
  </section>

  <div class="disclosure">
    이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
  </div>

</main>

<footer class="site-footer">
  <div class="container">
    © idont82.github.io · 구매 가이드
  </div>
</footer>

</body>
</html>
```

**주의:**
- 템플릿에 있던 `<meta name="robots" content="noindex, nofollow">`는 **삭제**됨 (실제 색인되어야 하는 페이지이므로)
- 제품 이미지는 `via.placeholder.com` 외부 서비스를 임시로 사용 (실제 운영 시 자체 이미지로 교체 필요)
- CTA 링크는 쿠팡 검색 URL (파트너스 승인 전 임시)

- [ ] **Step 2: 필수 SEO·컴플라이언스 요소 확인**

Run: `grep -c "이 포스팅은 쿠팡 파트너스" search/wireless-earbuds-top3.html`
Expected: `2`

Run: `grep -c 'rel="sponsored nofollow"' search/wireless-earbuds-top3.html`
Expected: `3`

Run: `grep -c 'application/ld+json' search/wireless-earbuds-top3.html`
Expected: `2`

Run: `grep 'noindex' search/wireless-earbuds-top3.html`
Expected: (no output — noindex 태그가 없어야 함)

Run: `grep '<title>' search/wireless-earbuds-top3.html`
Expected: `<title>무선 블루투스 이어폰 비교 TOP 3 추천 (2026) | 구매 가이드</title>`

Run: `grep 'rel="canonical"' search/wireless-earbuds-top3.html`
Expected: `<link rel="canonical" href="https://idont82.github.io/search/wireless-earbuds-top3.html">`

- [ ] **Step 3: 브라우저 시각 확인**

`node server.js`가 떠 있는지 확인 후 `http://localhost:3000/search/wireless-earbuds-top3.html` 열기.

체크리스트:
- 페이지가 완전히 렌더링됨(헤더 → 고지문구 → 제목 → 인트로 → 비교표 → 제품 3개 → 가이드 → FAQ → 하단 고지 → 푸터)
- 각 제품 카드에 이미지 자리(placeholder.com 이미지)가 보이고, ✅/❌ 장단점이 2열로 분할됨
- "쿠팡에서 보기 →" 버튼이 녹색으로 보이고 클릭 시 쿠팡 검색 결과 페이지 새 탭으로 열림
- 모바일 뷰(개발자 도구로 축소)에서 레이아웃이 1열로 재배치됨
- 브라우저 콘솔에 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add search/wireless-earbuds-top3.html
git commit -m "feat(search): add sample TOP 3 article for wireless earbuds category"
```

---

## Task 4: 허브 페이지 (`search/index.html`) 작성

**Files:**
- Create: `search/index.html`

`idont82.github.io/search/` 루트로 접근했을 때 보이는 목록 페이지. 초기엔 샘플 페이지 1개만 노출. 글을 추가할 때마다 이 파일에 `<li>` 한 줄을 수동으로 추가한다.

- [ ] **Step 1: 허브 페이지 작성**

Create `search/index.html`:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>구매 가이드 — TOP 3 비교 모음</title>
<meta name="description" content="카테고리별로 엄선한 TOP 3 비교 가이드. 제품 선택을 쉽게 도와드립니다.">
<link rel="canonical" href="https://idont82.github.io/search/">

<meta property="og:type" content="website">
<meta property="og:title" content="구매 가이드 — TOP 3 비교 모음">
<meta property="og:description" content="카테고리별 TOP 3 비교 가이드">
<meta property="og:url" content="https://idont82.github.io/search/">

<link rel="stylesheet" href="/search/assets/style.css">
</head>
<body>

<header class="site-header">
  <div class="container">
    <div class="site-title">구매 가이드</div>
    <nav class="site-nav">
      <a href="/search/">전체 글</a>
    </nav>
  </div>
</header>

<main class="container">

  <section class="article-header">
    <h1>카테고리별 TOP 3 비교 가이드</h1>
    <div class="article-meta">제품 선택에 필요한 핵심 정보만 엄선해 정리했습니다.</div>
  </section>

  <p class="intro">
    카테고리별로 대표적인 제품 3개를 장단점·가격·스펙 기준으로 비교해 정리했습니다.
    구매 전 결정이 어려운 분들께 도움이 되기를 바랍니다.
  </p>

  <ul class="post-list">
    <li>
      <a href="/search/wireless-earbuds-top3.html">무선 블루투스 이어폰 비교 TOP 3 추천 (2026)</a>
      <span class="post-desc">가격·노이즈 캔슬링·배터리 비교 · 출퇴근/가성비/입문용</span>
    </li>
    <!-- 새 글 추가 시 여기에 <li> 한 줄 추가 -->
  </ul>

  <div class="disclosure">
    이 사이트는 쿠팡 파트너스 활동을 포함하고 있으며, 이에 따른 일정액의 수수료를 제공받을 수 있습니다.
  </div>

</main>

<footer class="site-footer">
  <div class="container">
    © idont82.github.io · 구매 가이드
  </div>
</footer>

</body>
</html>
```

- [ ] **Step 2: 필수 요소 확인**

Run: `grep 'wireless-earbuds-top3.html' search/index.html`
Expected: 샘플 페이지 링크 `<li>` 줄이 매칭됨

Run: `grep '쿠팡 파트너스' search/index.html`
Expected: 고지문구 한 줄 매칭

- [ ] **Step 3: 브라우저 확인**

`http://localhost:3000/search/` 열기 (index.html 자동 서빙).

체크리스트:
- 허브 페이지가 렌더링됨
- "무선 블루투스 이어폰…" 링크가 보이고, 클릭 시 샘플 페이지로 이동
- 샘플 페이지 상단의 "전체 글" 링크를 누르면 다시 허브로 돌아옴
- CSS 스타일이 적용된 모습(헤더 띠, 리스트 구분선 등)

- [ ] **Step 4: 커밋**

```bash
git add search/index.html
git commit -m "feat(search): add hub page listing published TOP 3 articles"
```

---

## Task 5: sitemap.xml 갱신

**Files:**
- Modify: `sitemap.xml`

기존 `sitemap.xml` 파일 끝부분(`</urlset>` 직전)에 `/search/` URL들을 추가한다. 기존 항목은 건드리지 않는다.

- [ ] **Step 1: 기존 sitemap.xml 읽고 엔트리 삽입**

`sitemap.xml`의 `</urlset>` 직전에 아래 블록을 추가한다. 들여쓰기는 기존 엔트리와 동일(2칸 스페이스).

추가할 블록:
```xml
  <url>
    <loc>https://idont82.github.io/search/</loc>
    <lastmod>2026-04-06</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://idont82.github.io/search/wireless-earbuds-top3.html</loc>
    <lastmod>2026-04-06</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
```

편집 후 파일 끝부분은 다음과 같이 되어야 한다:

```xml
  <url>
    <loc>https://idont82.github.io/claw-machine.html</loc>
    <lastmod>2026-03-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>https://idont82.github.io/search/</loc>
    <lastmod>2026-04-06</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>https://idont82.github.io/search/wireless-earbuds-top3.html</loc>
    <lastmod>2026-04-06</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

**중요:** `template.html`은 `noindex` 메타 때문에 사이트맵에 **넣지 않는다**.

- [ ] **Step 2: XML 구조 유효성 확인**

Run: `grep -c '<url>' sitemap.xml`
Expected: `10` (기존 8개 + 추가 2개)

Run: `grep -c '</url>' sitemap.xml`
Expected: `10`

Run: `grep -c '</urlset>' sitemap.xml`
Expected: `1`

Run: `grep '/search/' sitemap.xml`
Expected: 두 줄 매칭 (`/search/`, `/search/wireless-earbuds-top3.html`)

- [ ] **Step 3: 브라우저에서 XML 확인**

`http://localhost:3000/sitemap.xml` 열기.

체크리스트:
- XML 파싱 에러 없이 표시됨
- `/search/` URL 두 개가 목록 끝에 나타남
- 기존 URL들은 순서/내용 변경 없음

- [ ] **Step 4: 커밋**

```bash
git add sitemap.xml
git commit -m "feat(search): register /search/ hub and sample article in sitemap"
```

---

## Task 6: 통합 최종 검증

**Files:**
- 없음 (검증 전용 태스크, 코드 변경 X)

MVP가 완성된 상태에서 전체 흐름을 end-to-end로 확인한다.

- [ ] **Step 1: 서버 기동 상태 확인**

`node server.js`가 떠 있는지 확인. 아니면 기동.

- [ ] **Step 2: 기존 사이트 간섭 없음 확인**

브라우저로 다음 URL을 순차 방문:
- `http://localhost:3000/` → 기존 인형뽑기 가이드가 **변경 없이** 렌더링되는지 확인 (지역 목록 보여야 함)
- `http://localhost:3000/#area/hongdae` → 해시 라우터 정상 동작
- `http://localhost:3000/claw-machine.html` → 3D 게임 페이지 정상 로딩

이 중 하나라도 문제가 생기면 Task를 되돌아가 기존 파일을 건드린 부분이 없는지 확인.

- [ ] **Step 3: /search/ 전체 흐름 확인**

- `http://localhost:3000/search/` 열기 → 허브 페이지 표시
- "무선 블루투스 이어폰…" 링크 클릭 → 샘플 페이지로 이동
- 샘플 페이지 상단 "전체 글" 링크 클릭 → 허브 페이지로 복귀
- 샘플 페이지의 "쿠팡에서 보기 →" 버튼 클릭 → 새 탭으로 쿠팡 검색 결과 열림
- 상·하단 고지문구 모두 표시됨
- 모바일 뷰(개발자 도구)에서 레이아웃 붕괴 없음

- [ ] **Step 4: 템플릿 색인 제외 확인**

Run: `grep 'noindex' search/template.html`
Expected: `<meta name="robots" content="noindex, nofollow">`

Run: `grep '/search/template.html' sitemap.xml`
Expected: (no output) — 사이트맵에 등록되지 않았음을 확인

- [ ] **Step 5: 전체 파일 목록 확인**

Run: `ls search/`
Expected:
```
assets
index.html
template.html
wireless-earbuds-top3.html
```

Run: `ls search/assets/`
Expected:
```
style.css
```

- [ ] **Step 6: git 상태 청결 확인**

Run: `git status`
Expected: `working tree clean` (모든 작업이 커밋됨)

- [ ] **Step 7: 최종 커밋 태그 (선택)**

전부 문제없다면 별도 커밋 필요 없음. 이 태스크는 검증만 수행한다.

---

## Completion Criteria

모든 태스크가 끝난 뒤 다음이 모두 참이어야 한다:

- [x] `search/assets/style.css` — 공통 스타일 존재
- [x] `search/template.html` — `noindex` 메타 포함, 복사 가능한 원본
- [x] `search/index.html` — 샘플 글 1개 링크가 노출되는 허브
- [x] `search/wireless-earbuds-top3.html` — SEO 요소·고지문구·`sponsored nofollow` 전부 갖춘 샘플
- [x] `sitemap.xml` — `/search/` + 샘플 URL 등록 (`template.html`은 제외)
- [x] 기존 인형뽑기 가이드·3D 게임 페이지는 **변경 없이** 정상 작동
- [x] `robots.txt` 수정 없음 (`Allow: /` 유지)
- [x] 빌드 단계 없음, npm/package.json 없음

## 비범위 확인 (이 계획에서 의도적으로 제외한 것들)

스펙 8절과 동일. 이후 이터레이션에서 별도 계획으로 진행:

- 실제 카테고리 콘텐츠(이 샘플 외의 실제 글) 작성
- 쿠팡 파트너스 계정 가입·승인 후 실제 파트너스 링크로 교체
- `partners.js` 클릭 트래킹
- 댓글·뉴스레터·애널리틱스
- 카테고리 자동 태깅·검색 기능
- 기존 인형뽑기 가이드와의 교차 링크
