# Female Celebrity Outfit Guides Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 수지와 장원영이 실제 착용한 동일 품번의 의류 2개를 팬 시점으로 소개하는 블로그 페이지를 생성한다.

**Architecture:** 검증된 콘텐츠와 쿠팡 API 결과를 하나의 JSON 데이터 파일에 보관하고, 전용 Node 생성기가 기존 블로그 셸을 사용해 두 HTML 페이지를 만든다. Node 내장 테스트가 품번 일치, 출처, 팬 시점 문체, 제휴 고지, 반응형 표와 사이트 노출을 검증한다.

**Tech Stack:** Node.js 내장 모듈, `node:test`, 정적 HTML, CSS, JavaScript

---

## File Map

- Create `data/female-celebrity-outfit-guides.json`: 두 착장의 출처, 품번, 팬 시점 문구, 쿠팡 상품 데이터
- Create `scripts/generate-female-celebrity-outfit-guides.js`: 데이터 검증 및 HTML 생성
- Create `tests/female-celebrity-outfit-guides.test.js`: 생성 결과와 사실성·레이아웃 회귀 검사
- Create `blog/suzy-k2-dry-ice-shirt-guide.html`: 수지 K2 `KWM26452` 글
- Create `blog/wonyoung-eider-sheer-jacket-guide.html`: 장원영 아이더 `DWM26154` 글
- Modify `index.html`: 두 신규 글 카드/링크 추가
- Modify `sitemap.xml`: 두 신규 canonical URL 추가

### Task 1: Failing Contract Tests

**Files:**
- Create: `tests/female-celebrity-outfit-guides.test.js`

- [ ] **Step 1: Write the failing page contract**

테스트에 두 페이지의 경로, 연예인명, 브랜드, 품번과 제품명을 선언하고 다음을 검사한다.

```js
const pages = [
  {
    path: 'blog/suzy-k2-dry-ice-shirt-guide.html',
    celebrity: '수지',
    brand: 'K2',
    model: 'KWM26452',
    product: '시원서커 DRY ICE 반팔 셔츠 W',
  },
  {
    path: 'blog/wonyoung-eider-sheer-jacket-guide.html',
    celebrity: '장원영',
    brand: '아이더',
    model: 'DWM26154',
    product: 'SHEER (시어) 여성 경량 후디 자켓',
  },
];
```

각 HTML에서 `BlogPosting` JSON-LD, canonical, 단일 `h1`, `2026년 7월 31일`, `팬인 저는`, `동일 품번 확인`, `data-coupang-placement="product_card"`, `rel="sponsored nofollow"`, 쿠팡 파트너스 고지를 검사한다.

- [ ] **Step 2: Add truthfulness and layout assertions**

각 페이지가 정확한 품번과 공식 출처 URL을 포함하고 `비슷한 제품`, `판매량 1위`, `최저가 보장`, `직접 구매했다`, `입어보니`를 포함하지 않는지 검사한다. 표에는 `table-layout: fixed`, `max-width: 100%`, `overflow-wrap: anywhere`가 있고 `min-width` 및 `overflow-x: auto`가 없는지 검사한다.

- [ ] **Step 3: Add discovery assertions**

`index.html`에 `/${page.path}`가, `sitemap.xml`에 `https://idont82.github.io/${page.path}`가 정확히 한 번씩 있는지 검사한다.

- [ ] **Step 4: Run the test and verify RED**

Run:

```powershell
node --test tests/female-celebrity-outfit-guides.test.js
```

Expected: 두 HTML 파일을 찾을 수 없어 `ENOENT`로 실패한다.

### Task 2: Verified Content Data

**Files:**
- Create: `data/female-celebrity-outfit-guides.json`

- [ ] **Step 1: Add shared verification metadata**

```json
{
  "verifiedDate": "2026-07-31",
  "verifiedDateKo": "2026년 7월 31일",
  "pages": []
}
```

- [ ] **Step 2: Add the Suzy page record**

`celebrity`, `brand`, `productName`, `model`, `keyword`, SEO 문구, 팬 시점 도입·추천 이유, 제품 특징, 구매 체크, FAQ, 관련 글을 기록한다. 공식 출처는 K2/K.VILLAGE 또는 백화점 상품 정보로, 쿠팡 상품은 API가 반환한 `KWM26452` 상품명·가격·이미지·제휴 URL로 기록한다.

- [ ] **Step 3: Add the Wonyoung page record**

같은 필드를 `DWM26154`에 맞춰 기록한다. 공식 출처는 K.VILLAGE 제품 페이지와 장원영 착용을 명시한 유통사 페이지로, 쿠팡 상품은 품번을 상품명에 명시한 결과만 기록한다.

### Task 3: Generator and Validation

**Files:**
- Create: `scripts/generate-female-celebrity-outfit-guides.js`
- Create: `blog/suzy-k2-dry-ice-shirt-guide.html`
- Create: `blog/wonyoung-eider-sheer-jacket-guide.html`

- [ ] **Step 1: Implement input validation**

생성 전 모든 페이지에서 `celebrity`, `brand`, `productName`, `model`, `sources`, `product`를 확인한다. 쿠팡 상품명에 `page.model`이 없으면 다음 오류를 발생시킨다.

```js
if (!page.product.name.includes(page.model)) {
  throw new Error(`${page.slug}: Coupang product does not contain model ${page.model}`);
}
```

- [ ] **Step 2: Implement escaping and JSON-LD helpers**

`escapeHtml`, `price`, `jsonLd`를 구현한다. `jsonLd`는 `BlogPosting`, 한국어, canonical, API 상품 이미지, 게시일·수정일을 포함한다.

- [ ] **Step 3: Implement the fan article template**

기존 `/blog/assets/style.css`와 `/blog/assets/blog.js`를 연결하고 다음 섹션을 생성한다.

```html
<div class="article-summary-box">동일 품번 확인 · 착용 출처 확인 · 가격 확인일</div>
<h2 id="story">팬이라서 같은 옷을 찾아봤습니다</h2>
<h2 id="identity">동일 제품 확인표</h2>
<h2 id="features">제품 특징과 사이즈</h2>
<h2 id="fan-points">팬 추천 포인트</h2>
<h2 id="check">구매 전 확인사항</h2>
<h2 id="product">쿠팡 동일 품번 상품</h2>
<h2 id="sources">확인 출처</h2>
```

`동일 제품 확인표`는 고정 레이아웃을 사용하며 모바일에서 셀 내용을 줄바꿈한다. 본문은 실제 구매·착용 경험을 주장하지 않는다.

- [ ] **Step 4: Add advertising components**

모바일 상단 광고, 본문 광고, 우측 300×250 sticky 추천 배너를 추가한다. 상품 링크는 `rel="sponsored nofollow"`, `data-coupang-placement="product_card"`와 페이지별 상품 유형을 포함한다.

- [ ] **Step 5: Generate both pages**

Run:

```powershell
node scripts/generate-female-celebrity-outfit-guides.js
```

Expected:

```text
blog\suzy-k2-dry-ice-shirt-guide.html
blog\wonyoung-eider-sheer-jacket-guide.html
```

- [ ] **Step 6: Run the focused test**

Run:

```powershell
node --test tests/female-celebrity-outfit-guides.test.js
```

Expected: 페이지 구조 검사는 통과하고 index/sitemap 검사는 아직 실패한다.

### Task 4: Discovery Integration

**Files:**
- Modify: `index.html`
- Modify: `sitemap.xml`

- [ ] **Step 1: Add two index entries**

기존 블로그 카드 목록의 신규 아이돌 쇼핑 글 주변에 두 링크를 한 번씩 추가한다.

```html
<a href="/blog/suzy-k2-dry-ice-shirt-guide.html">수지 K2 반팔 셔츠 KWM26452</a>
<a href="/blog/wonyoung-eider-sheer-jacket-guide.html">장원영 아이더 시어 자켓 DWM26154</a>
```

- [ ] **Step 2: Add two sitemap URLs**

```xml
<url><loc>https://idont82.github.io/blog/suzy-k2-dry-ice-shirt-guide.html</loc></url>
<url><loc>https://idont82.github.io/blog/wonyoung-eider-sheer-jacket-guide.html</loc></url>
```

기존 사용자 변경을 유지하면서 중복 없이 병합한다.

- [ ] **Step 3: Run the focused test and verify GREEN**

Run:

```powershell
node --test tests/female-celebrity-outfit-guides.test.js
```

Expected: 모든 테스트가 통과한다.

### Task 5: Full Verification

**Files:**
- Verify all files listed in the file map

- [ ] **Step 1: Check deterministic generation**

생성 전후 두 HTML의 SHA-256을 비교한다.

```powershell
$before = Get-FileHash blog/suzy-k2-dry-ice-shirt-guide.html,blog/wonyoung-eider-sheer-jacket-guide.html
node scripts/generate-female-celebrity-outfit-guides.js
$after = Get-FileHash blog/suzy-k2-dry-ice-shirt-guide.html,blog/wonyoung-eider-sheer-jacket-guide.html
Compare-Object $before.Hash $after.Hash
```

Expected: 차이가 없다.

- [ ] **Step 2: Run relevant regression tests**

```powershell
node --test tests/female-celebrity-outfit-guides.test.js tests/idol-shopping-blog-pages.test.js
```

Expected: 모든 테스트가 통과한다.

- [ ] **Step 3: Start or reuse the local server**

```powershell
node server.js
```

두 URL이 HTTP 200인지 확인하고 데스크톱·모바일 너비에서 가로 스크롤, 본문 너비, 우측 추천 카드를 직접 확인한다.

- [ ] **Step 4: Review the final diff**

```powershell
git diff --check
git status --short
```

이번 작업 파일만 별도로 확인하고 기존 사용자 변경은 수정하거나 커밋하지 않는다.
