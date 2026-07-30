# MBTI 64 Type Matrix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an accessible SVG axis infographic and a complete linked 16×4 comparison matrix to the MBTI 16-vs-64 article.

**Architecture:** Keep the 64-type directory as static semantic HTML so readers and crawlers receive the complete content without JavaScript. Reuse the existing test page’s 16 base-type meanings, apply the article’s A/T and C/S definitions consistently, and style the matrix through the shared blog stylesheet with a horizontally scrollable mobile presentation.

**Tech Stack:** Vanilla HTML5, CSS, SVG, Node.js built-in test runner

---

## File Map

- Modify: `blog/mbti-16-vs-64-personality-types.html` — add the infographic, legend, complete matrix, links, CTA, and heading renumbering.
- Modify: `blog/assets/style.css` — add matrix, legend, sticky header/column, focus, and responsive styles.
- Create: `blog/images/mbti-64-axis-map.svg` — explain how the two extension axes produce four column combinations.
- Modify: `tests/mbti-blog-page.test.js` — verify 64 unique codes, balanced variants, correct links, semantic table markup, SVG, and navigation.

### Task 1: Define the Matrix Contract With Failing Tests

**Files:**
- Modify: `tests/mbti-blog-page.test.js`
- Test: `tests/mbti-blog-page.test.js`

- [ ] **Step 1: Add a test for all 64 codes and result links**

Append:

```js
test('MBTI article exposes all 64 extended types exactly once', () => {
  const html = fs.readFileSync(articlePath, 'utf8');
  const baseTypes = [
    'ISTJ', 'ISFJ', 'INFJ', 'INTJ',
    'ISTP', 'ISFP', 'INFP', 'INTP',
    'ESTP', 'ESFP', 'ENFP', 'ENTP',
    'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'
  ];
  const variants = ['A-C', 'A-S', 'T-C', 'T-S'];
  const expected = baseTypes.flatMap((base) => variants.map((variant) => `${base}-${variant}`));
  const codes = [...html.matchAll(/data-type-code="([A-Z]{4}-[AT]-[CS])"/g)].map((match) => match[1]);

  assert.equal(codes.length, 64);
  assert.equal(new Set(codes).size, 64);
  assert.deepEqual([...codes].sort(), [...expected].sort());

  expected.forEach((code) => {
    assert.match(
      html,
      new RegExp(`href="/tools/64-personality-test\\\\.html\\\\?result=${code}"[^>]*data-type-code="${code}"`)
    );
  });

  variants.forEach((variant) => {
    assert.equal(codes.filter((code) => code.endsWith(variant)).length, 16);
  });
});
```

- [ ] **Step 2: Add semantic table and copy-density assertions**

Append:

```js
test('MBTI 64 matrix is semantic, descriptive, and mobile-scrollable', () => {
  const html = fs.readFileSync(articlePath, 'utf8');

  assert.match(html, /id="type-matrix"/);
  assert.match(html, /class="mbti64-matrix-scroll"[^>]*tabindex="0"/);
  assert.match(html, /aria-describedby="mbti64-scroll-hint"/);
  assert.match(html, /<table class="mbti64-matrix">/);
  assert.match(html, /<caption>MBTI 기본 16유형과 A-C, A-S, T-C, T-S 확장형 비교표<\/caption>/);
  assert.equal((html.match(/<th scope="row"/g) || []).length, 16);
  assert.equal((html.match(/class="mbti64-type-name"/g) || []).length, 64);
  assert.equal((html.match(/class="mbti64-type-copy"/g) || []).length, 64);
  assert.match(html, /좌우로 밀어 4가지 변형 비교/);
  assert.match(html, /공식 MBTI 검사가 아닌 자체 확장 해석/);
});
```

- [ ] **Step 3: Add infographic and navigation assertions**

Append:

```js
test('MBTI article includes the 64-type axis infographic and updated navigation', () => {
  const html = fs.readFileSync(articlePath, 'utf8');
  const svg = fs.readFileSync('blog/images/mbti-64-axis-map.svg', 'utf8');

  assert.match(html, /href="#type-matrix"/);
  assert.match(html, /src="\/blog\/images\/mbti-64-axis-map\.svg"/);
  assert.match(html, /alt="MBTI 16유형에 A\/T와 C\/S 보조축을 더해 64유형으로 확장하는 구조"/);
  assert.match(html, /<figcaption>16개 기본유형 각각이 네 가지 행동 결로 나뉘어 총 64유형이 됩니다\.<\/figcaption>/);
  assert.match(html, /<h2 id="type-matrix">4\. MBTI 64유형 한눈에 보기<\/h2>/);
  assert.match(html, /<h2>5\. INTJ와 INTJ-A-C는 어떻게 다를까\?<\/h2>/);
  assert.match(html, /<h2 id="hexaco">6\. HEXACO 64유형과 MBTI 확장형 64유형은 다르다<\/h2>/);
  assert.match(html, /<h2>7\. 결과는 어떻게 읽으면 좋을까\?<\/h2>/);
  assert.match(html, /<h2 id="test">8\. 직접 64유형 테스트 해보기<\/h2>/);

  assert.match(svg, /<svg/);
  assert.match(svg, /16 기본유형/);
  assert.match(svg, /A-C/);
  assert.match(svg, /A-S/);
  assert.match(svg, /T-C/);
  assert.match(svg, /T-S/);
});
```

- [ ] **Step 4: Run the tests and confirm the new contract fails**

Run:

```powershell
node --test tests/mbti-blog-page.test.js
```

Expected: the three new tests fail because the matrix and SVG do not exist.

- [ ] **Step 5: Commit the failing tests**

```powershell
git add tests/mbti-blog-page.test.js
git commit -m "test: define mbti 64 matrix contract"
```

### Task 2: Create the Axis Infographic

**Files:**
- Create: `blog/images/mbti-64-axis-map.svg`
- Test: `tests/mbti-blog-page.test.js`

- [ ] **Step 1: Create a responsive SVG with exact labels**

Create an SVG with `viewBox="0 0 1200 630"`, `role="img"`, a title, and a
description. Use a central white card labeled `16 기본유형`, two small axis
labels (`A/T 자신감 반응`, `C/S 관계 처리`), and four connected rounded cards:

```xml
<g id="ac">
  <rect x="650" y="70" width="430" height="105" rx="28" fill="#dfe7ff"/>
  <text x="690" y="115" class="code">A-C</text>
  <text x="690" y="150" class="label">확신 있게 조율</text>
</g>
<g id="as">
  <rect x="650" y="200" width="430" height="105" rx="28" fill="#e4f6eb"/>
  <text x="690" y="245" class="code">A-S</text>
  <text x="690" y="280" class="label">확신 있게 자율 실행</text>
</g>
<g id="tc">
  <rect x="650" y="330" width="430" height="105" rx="28" fill="#fff0db"/>
  <text x="690" y="375" class="code">T-C</text>
  <text x="690" y="410" class="label">신중하게 조율</text>
</g>
<g id="ts">
  <rect x="650" y="460" width="430" height="105" rx="28" fill="#f3e5ff"/>
  <text x="690" y="505" class="code">T-S</text>
  <text x="690" y="540" class="label">신중하게 독립 완성</text>
</g>
```

Connect the central card to the four cards with visible paths and arrow markers.
Use system Korean fonts (`Pretendard`, `Noto Sans KR`, `Arial`, sans-serif) and
keep all text at least 24px.

- [ ] **Step 2: Validate the SVG**

Run:

```powershell
[xml](Get-Content -Raw -Encoding UTF8 blog/images/mbti-64-axis-map.svg) | Out-Null
node --test tests/mbti-blog-page.test.js
```

Expected: XML parsing passes; the infographic test still fails only because the
article does not reference the SVG and the matrix tests still fail.

- [ ] **Step 3: Commit the SVG**

```powershell
git add blog/images/mbti-64-axis-map.svg
git commit -m "feat: add mbti 64 axis infographic"
```

### Task 3: Add the 64-Type Matrix to the Article

**Files:**
- Modify: `blog/mbti-16-vs-64-personality-types.html:117-194`
- Test: `tests/mbti-blog-page.test.js`

- [ ] **Step 1: Add the matrix link to the article navigation**

After the existing `64유형 구조` link, add:

```html
<a href="#type-matrix">64유형 표 <span>16×4 비교</span></a>
```

- [ ] **Step 2: Add the infographic, legend, and semantic table shell**

After the current section 3 CTA, insert:

```html
<h2 id="type-matrix">4. MBTI 64유형 한눈에 보기</h2>
<p>아래 표는 <strong>공식 MBTI 검사가 아닌 자체 확장 해석</strong>입니다. 기본 16유형에 A/T와 C/S 보조축을 더해 같은 유형 안의 행동 결을 비교합니다.</p>
<figure class="mbti64-axis-figure">
  <img src="/blog/images/mbti-64-axis-map.svg" alt="MBTI 16유형에 A/T와 C/S 보조축을 더해 64유형으로 확장하는 구조" width="1200" height="630" loading="lazy">
  <figcaption>16개 기본유형 각각이 네 가지 행동 결로 나뉘어 총 64유형이 됩니다.</figcaption>
</figure>
<div class="mbti64-legend" aria-label="64유형 확장코드 범례">
  <div class="mbti64-legend-item mbti64-variant-ac"><strong>A-C</strong><span>확신형 · 협업형</span></div>
  <div class="mbti64-legend-item mbti64-variant-as"><strong>A-S</strong><span>확신형 · 자기주도형</span></div>
  <div class="mbti64-legend-item mbti64-variant-tc"><strong>T-C</strong><span>민감반응형 · 협업형</span></div>
  <div class="mbti64-legend-item mbti64-variant-ts"><strong>T-S</strong><span>민감반응형 · 자기주도형</span></div>
</div>
<p class="mbti64-scroll-hint" id="mbti64-scroll-hint">모바일에서는 좌우로 밀어 4가지 변형 비교</p>
<div class="mbti64-matrix-scroll" tabindex="0" role="region" aria-label="MBTI 64유형 비교표" aria-describedby="mbti64-scroll-hint">
  <table class="mbti64-matrix">
    <caption>MBTI 기본 16유형과 A-C, A-S, T-C, T-S 확장형 비교표</caption>
    <thead>
      <tr>
        <th scope="col">기본유형</th>
        <th scope="col" class="mbti64-variant-ac">A-C<br><span>확신 · 협업</span></th>
        <th scope="col" class="mbti64-variant-as">A-S<br><span>확신 · 자율</span></th>
        <th scope="col" class="mbti64-variant-tc">T-C<br><span>민감 · 협업</span></th>
        <th scope="col" class="mbti64-variant-ts">T-S<br><span>민감 · 자율</span></th>
      </tr>
    </thead>
    <tbody>
      <!-- 16 rows inserted in Step 3 -->
    </tbody>
  </table>
</div>
<p class="mbti64-matrix-cta"><a class="product-detail-btn" href="/tools/64-personality-test.html">내 64유형 직접 확인하기</a></p>
```

- [ ] **Step 3: Add exactly 16 rows and 64 linked cells**

Use this base order and group mapping:

```text
관리자: ISTJ, ISFJ, ESTJ, ESFJ
외교관: INFJ, INFP, ENFJ, ENFP
분석가: INTJ, INTP, ENTJ, ENTP
탐험가: ISTP, ISFP, ESTP, ESFP
```

Keep the existing test page order in the actual table:

```text
ISTJ, ISFJ, INFJ, INTJ,
ISTP, ISFP, INFP, INTP,
ESTP, ESFP, ENFP, ENTP,
ESTJ, ESFJ, ENFJ, ENTJ
```

Use these base labels:

```text
ISTJ 책임 관리자    ISFJ 세심 보호자    INFJ 통찰 설계자    INTJ 전략 설계자
ISTP 실전 해결사    ISFP 감각 표현가    INFP 가치 이상가    INTP 논리 탐구자
ESTP 현장 행동가    ESFP 활력 경험가    ENFP 가능성 탐험가  ENTP 관점 발명가
ESTJ 기준 추진자    ESFJ 관계 조율자    ENFJ 성장 안내자    ENTJ 목표 지휘자
```

Every row must contain the four full cells in this exact order:

```html
<tr class="mbti64-group-analyst">
  <th scope="row"><strong>INTJ</strong><span>전략 설계자</span></th>
  <td class="mbti64-variant-ac">
    <a href="/tools/64-personality-test.html?result=INTJ-A-C" data-type-code="INTJ-A-C">
      <strong>INTJ-A-C</strong>
      <span class="mbti64-type-name">확신 조율 전략가</span>
      <span class="mbti64-type-copy">큰 그림을 믿고 사람들과 방향을 맞춰 실행합니다.</span>
    </a>
  </td>
  <td class="mbti64-variant-as">
    <a href="/tools/64-personality-test.html?result=INTJ-A-S" data-type-code="INTJ-A-S">
      <strong>INTJ-A-S</strong>
      <span class="mbti64-type-name">자율 실행 전략가</span>
      <span class="mbti64-type-copy">구조를 정하면 자기 방식으로 빠르게 밀고 나갑니다.</span>
    </a>
  </td>
  <td class="mbti64-variant-tc">
    <a href="/tools/64-personality-test.html?result=INTJ-T-C" data-type-code="INTJ-T-C">
      <strong>INTJ-T-C</strong>
      <span class="mbti64-type-name">세심 조율 전략가</span>
      <span class="mbti64-type-copy">변수를 깊이 검토하고 의견을 모아 방향을 다듬습니다.</span>
    </a>
  </td>
  <td class="mbti64-variant-ts">
    <a href="/tools/64-personality-test.html?result=INTJ-T-S" data-type-code="INTJ-T-S">
      <strong>INTJ-T-S</strong>
      <span class="mbti64-type-name">신중 독립 전략가</span>
      <span class="mbti64-type-copy">가능성을 오래 점검하며 혼자 깊게 완성도를 높입니다.</span>
    </a>
  </td>
</tr>
```

Apply the same complete four-cell structure to the other 15 rows. Write each
description from the existing base meaning plus the same four behavior rules:

```text
A-C: 기본 강점을 믿고 주변과 방향 또는 속도를 맞춘다.
A-S: 기본 강점을 믿고 자기 방식과 속도로 실행한다.
T-C: 변수와 반응을 세심하게 살피며 함께 조율한다.
T-S: 가능성을 신중하게 점검하며 자기 방식으로 깊게 완성한다.
```

Do not use job suitability, intelligence, illness, superiority, or guaranteed
outcome language.

- [ ] **Step 4: Renumber the remaining headings**

Change the current headings to:

```html
<h2>5. INTJ와 INTJ-A-C는 어떻게 다를까?</h2>
<h2 id="hexaco">6. HEXACO 64유형과 MBTI 확장형 64유형은 다르다</h2>
<h2>7. 결과는 어떻게 읽으면 좋을까?</h2>
<h2 id="test">8. 직접 64유형 테스트 해보기</h2>
```

- [ ] **Step 5: Run the content tests**

Run:

```powershell
node --test tests/mbti-blog-page.test.js
```

Expected: code-count, link, semantic table, infographic-reference, and heading
tests pass. Styling tests are added next.

- [ ] **Step 6: Commit the article**

```powershell
git add blog/mbti-16-vs-64-personality-types.html
git commit -m "feat: add mbti 64 type comparison matrix"
```

### Task 4: Style the Matrix for Desktop and Mobile

**Files:**
- Modify: `blog/assets/style.css`
- Modify: `tests/mbti-blog-page.test.js`
- Test: `tests/mbti-blog-page.test.js`

- [ ] **Step 1: Add a failing style-contract test**

Append:

```js
test('MBTI 64 matrix styles preserve comparison context on small screens', () => {
  const css = fs.readFileSync('blog/assets/style.css', 'utf8');

  assert.match(css, /\.mbti64-matrix-scroll\s*\{[\s\S]*overflow-x:auto/);
  assert.match(css, /\.mbti64-matrix\s*\{[\s\S]*min-width:1040px/);
  assert.match(css, /\.mbti64-matrix thead th\s*\{[\s\S]*position:sticky/);
  assert.match(css, /\.mbti64-matrix th:first-child\s*\{[\s\S]*position:sticky/);
  assert.match(css, /\.mbti64-matrix a:focus-visible/);
  assert.match(css, /@media \(max-width:760px\)[\s\S]*\.mbti64-scroll-hint/);
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```powershell
node --test tests/mbti-blog-page.test.js
```

Expected: only the new style-contract test fails.

- [ ] **Step 3: Add component styles**

Add a dedicated `MBTI 64 type matrix` section near the existing article choice
styles. It must include these exact structural properties:

```css
.mbti64-axis-figure {
  margin: 24px 0;
  padding: 16px;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: #f8fbff;
}

.mbti64-axis-figure img {
  display: block;
  width: 100%;
  height: auto;
}

.mbti64-legend {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin: 20px 0;
}

.mbti64-matrix-scroll {
  max-width: 100%;
  overflow-x: auto;
  margin: 14px 0 22px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: #fff;
  -webkit-overflow-scrolling: touch;
}

.mbti64-matrix {
  width: 100%;
  min-width: 1040px;
  border-collapse: separate;
  border-spacing: 0;
}

.mbti64-matrix thead th {
  position: sticky;
  top: 0;
  z-index: 3;
}

.mbti64-matrix th:first-child {
  position: sticky;
  left: 0;
  z-index: 2;
  width: 118px;
  min-width: 118px;
}

.mbti64-matrix a:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: -3px;
}
```

Add cell typography so codes, names, and descriptions are separate block
elements; make the whole anchor fill the cell with at least 132px height.
Use the approved variant colors:

```css
.mbti64-variant-ac { --mbti64-tint: #eef2ff; --mbti64-accent: #4f6fd8; }
.mbti64-variant-as { --mbti64-tint: #edf8f1; --mbti64-accent: #2f8f5b; }
.mbti64-variant-tc { --mbti64-tint: #fff5e8; --mbti64-accent: #c87824; }
.mbti64-variant-ts { --mbti64-tint: #f7efff; --mbti64-accent: #8a55bd; }
```

Use subtle left borders on row headers to distinguish analyst, diplomat,
sentinel, and explorer groups without relying on color alone.

- [ ] **Step 4: Add mobile rules**

Inside the existing `@media (max-width:760px)` block:

```css
.mbti64-legend {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.mbti64-scroll-hint {
  display: block;
}

.mbti64-matrix {
  min-width: 920px;
}

.mbti64-matrix th:first-child {
  width: 94px;
  min-width: 94px;
}
```

Hide `.mbti64-scroll-hint` by default on wider screens. Ensure sticky row
headers have an opaque background and sticky column headers remain above them.

- [ ] **Step 5: Run both MBTI suites**

Run:

```powershell
node --test tests/mbti-blog-page.test.js tests/64-personality-test.test.js
```

Expected: 14 tests pass with 0 failures.

- [ ] **Step 6: Commit the styles and tests**

```powershell
git add blog/assets/style.css tests/mbti-blog-page.test.js
git commit -m "feat: style responsive mbti 64 matrix"
```

### Task 5: Full Verification

**Files:**
- Verify: `blog/mbti-16-vs-64-personality-types.html`
- Verify: `blog/assets/style.css`
- Verify: `blog/images/mbti-64-axis-map.svg`
- Verify: `tests/mbti-blog-page.test.js`

- [ ] **Step 1: Run the relevant automated tests**

Run:

```powershell
node --test tests/mbti-blog-page.test.js tests/64-personality-test.test.js
```

Expected: 14 tests pass, 0 fail.

- [ ] **Step 2: Validate structured data and SVG XML**

Run:

```powershell
$html = Get-Content -Raw -Encoding UTF8 blog/mbti-16-vs-64-personality-types.html
[regex]::Matches($html, '<script type="application/ld\+json">(?<json>[\s\S]*?)</script>') | ForEach-Object {
  $_.Groups['json'].Value | ConvertFrom-Json | Out-Null
}
[xml](Get-Content -Raw -Encoding UTF8 blog/images/mbti-64-axis-map.svg) | Out-Null
```

Expected: no parse errors.

- [ ] **Step 3: Check scope and whitespace**

Run:

```powershell
git diff --check
git status --short
```

Expected: only the four planned implementation files are changed or committed;
no unrelated worktree files appear.

- [ ] **Step 4: Start the local static server**

Run:

```powershell
node server.js
```

Expected: server listens at `http://localhost:3000`.

- [ ] **Step 5: Verify the article and SVG responses**

Run in a second PowerShell process:

```powershell
$article = Invoke-WebRequest -UseBasicParsing 'http://localhost:3000/blog/mbti-16-vs-64-personality-types.html'
$graphic = Invoke-WebRequest -UseBasicParsing 'http://localhost:3000/blog/images/mbti-64-axis-map.svg'
if ($article.StatusCode -ne 200 -or $graphic.StatusCode -ne 200) { throw 'HTTP verification failed' }
$articleBody = [Text.Encoding]::UTF8.GetString($article.RawContentStream.ToArray())
if (-not $articleBody.Contains('MBTI 64유형 한눈에 보기')) { throw 'Matrix heading missing from response' }
```

Expected: both responses return HTTP 200 and the article contains the matrix heading.

- [ ] **Step 6: Inspect desktop and mobile layouts**

Open the article at approximately 1280px and 390px widths. Confirm:

```text
Desktop: all five columns visible or naturally scrollable; header and row labels align.
Mobile: horizontal swipe works; first column stays visible; no page-level horizontal overflow.
Both: SVG text is readable; every cell shows code, name, and description; focus states are visible.
```

- [ ] **Step 7: Review the final diff**

Run:

```powershell
git diff main...HEAD -- blog/mbti-16-vs-64-personality-types.html blog/assets/style.css blog/images/mbti-64-axis-map.svg tests/mbti-blog-page.test.js
```

Expected: no metadata, canonical, JSON-LD, quiz scoring, affiliate link, or unrelated style changes.
