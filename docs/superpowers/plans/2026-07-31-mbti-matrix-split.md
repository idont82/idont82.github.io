# MBTI 64유형 표 분할 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** MBTI 64유형 비교표를 A 계열과 T 계열의 2개 표로 분리하고 내부 가로·세로 스크롤을 제거한다.

**Architecture:** 기존 16행×4변형 데이터를 새 데이터 계층으로 옮기지 않고 정적 HTML 표 두 개로 재구성한다. 공통 표 스타일은 유지하되 컨테이너의 스크롤 제한과 표 최소 너비를 제거하며, 모바일에서는 열 너비와 타이포그래피만 조정한다.

**Tech Stack:** Vanilla HTML, CSS, Node.js 내장 테스트 러너

---

### Task 1: 분할 표 구조 회귀 테스트

**Files:**
- Modify: `tests/mbti-blog-page.test.js`
- Test: `tests/mbti-blog-page.test.js`

- [ ] **Step 1: 기존 단일 5열 표 기대값을 2개 3열 표 기대값으로 바꾸기**

```js
test('MBTI 64 matrix is split into complete A and T tables', () => {
  const html = fs.readFileSync('blog/mbti-16-vs-64-personality-types.html', 'utf8');
  const sections = [...html.matchAll(/<div\b[^>]*class="[^"]*\bmbti64-matrix-panel\b[^"]*"[^>]*>([\s\S]*?)<\/div>/g)];

  assert.equal(sections.length, 2);
  assert.match(sections[0][1], /A-C/);
  assert.match(sections[0][1], /A-S/);
  assert.doesNotMatch(sections[0][1], /T-C|T-S/);
  assert.match(sections[1][1], /T-C/);
  assert.match(sections[1][1], /T-S/);
  assert.doesNotMatch(sections[1][1], /A-C|A-S/);
});
```

- [ ] **Step 2: 각 표에 16개 기본유형과 32개 결과 링크가 있는지 검사하기**

```js
for (const section of sections) {
  assert.equal((section[1].match(/<tr class="mbti64-group-/g) || []).length, 16);
  assert.equal((section[1].match(/data-type-code=/g) || []).length, 32);
}
```

- [ ] **Step 3: 테스트를 실행해 현재 단일 표 때문에 실패하는지 확인하기**

Run: `node --test tests/mbti-blog-page.test.js`

Expected: FAIL — `mbti64-matrix-panel` 2개를 찾지 못한다.

### Task 2: 표 HTML 분할

**Files:**
- Modify: `blog/mbti-16-vs-64-personality-types.html`
- Test: `tests/mbti-blog-page.test.js`

- [ ] **Step 1: 스크롤 안내 문구를 제거하기**

```html
<!-- mbti64-scroll-hint 문단을 삭제한다. -->
```

- [ ] **Step 2: A 계열 표를 만들기**

```html
<section class="mbti64-matrix-section" aria-labelledby="mbti64-a-title">
  <h3 id="mbti64-a-title">A형: 확신을 바탕으로 행동하는 유형</h3>
  <div class="mbti64-matrix-panel" role="region" aria-label="A-C와 A-S 유형 비교표">
    <table class="mbti64-matrix">
      <caption>MBTI 기본 16유형과 A-C, A-S 확장형 비교표</caption>
      <!-- 기본유형, A-C, A-S 열과 16개 행 -->
    </table>
  </div>
</section>
```

- [ ] **Step 3: T 계열 표를 만들기**

```html
<section class="mbti64-matrix-section" aria-labelledby="mbti64-t-title">
  <h3 id="mbti64-t-title">T형: 세심하게 점검하며 행동하는 유형</h3>
  <div class="mbti64-matrix-panel" role="region" aria-label="T-C와 T-S 유형 비교표">
    <table class="mbti64-matrix">
      <caption>MBTI 기본 16유형과 T-C, T-S 확장형 비교표</caption>
      <!-- 기본유형, T-C, T-S 열과 16개 행 -->
    </table>
  </div>
</section>
```

- [ ] **Step 4: 기존 64개 링크와 설명을 해당 표로 손실 없이 이동하기**

각 기존 행의 `th`는 양쪽 표에 복제하고 A 표에는 `A-C`, `A-S` 셀을, T 표에는 `T-C`, `T-S` 셀을 넣는다. `href`, `data-type-code`, 유형명, 설명은 변경하지 않는다.

- [ ] **Step 5: 테스트를 실행해 HTML 구조가 통과하는지 확인하기**

Run: `node --test tests/mbti-blog-page.test.js`

Expected: CSS 기대값을 제외한 HTML 구조 테스트 PASS.

### Task 3: 스크롤 없는 반응형 스타일

**Files:**
- Modify: `blog/assets/style.css`
- Modify: `tests/mbti-blog-page.test.js`
- Test: `tests/mbti-blog-page.test.js`

- [ ] **Step 1: 스크롤 제거 CSS 기대값을 테스트에 추가하기**

```js
assert.match(css, /\.mbti64-matrix-panel\s*\{[^}]*overflow:\s*visible\s*;/s);
assert.match(css, /\.mbti64-matrix\s*\{[^}]*min-width:\s*0\s*;/s);
assert.doesNotMatch(css, /\.mbti64-matrix-scroll\s*\{/);
```

- [ ] **Step 2: 테스트가 기존 스크롤 CSS 때문에 실패하는지 확인하기**

Run: `node --test tests/mbti-blog-page.test.js`

Expected: FAIL — 새 패널 스타일이 없고 기존 스크롤 스타일이 남아 있다.

- [ ] **Step 3: 컨테이너와 표를 본문 너비에 맞추기**

```css
.mbti64-matrix-section{
  margin-top:22px;
}

.mbti64-matrix-section h3{
  margin:0 0 10px;
}

.mbti64-matrix-panel{
  max-width:100%;
  overflow:visible;
  border:1px solid var(--line);
  border-radius:18px;
  background:#ffffff;
}

.mbti64-matrix{
  width:100%;
  min-width:0;
}
```

- [ ] **Step 4: 내부 스크롤에만 필요했던 sticky 속성을 제거하기**

`thead th`와 첫 번째 열에서 `position: sticky`, `top`, `left`, 관련 `z-index`와 그림자를 제거한다.

- [ ] **Step 5: 모바일 3열 표가 390px 안에 들어오도록 조정하기**

```css
@media (max-width: 760px){
  .mbti64-matrix th:first-child{
    width:72px;
    min-width:72px;
  }

  .mbti64-matrix td a{
    padding:12px 9px;
  }

  .mbti64-type-copy{
    font-size:11px;
  }
}
```

- [ ] **Step 6: 관련 테스트를 모두 실행하기**

Run: `node --test tests/mbti-blog-page.test.js tests/personality-test-page.test.js`

Expected: PASS, 0 failures.

### Task 4: 브라우저 검증과 배포

**Files:**
- Verify: `blog/mbti-16-vs-64-personality-types.html`
- Verify: `blog/assets/style.css`

- [ ] **Step 1: 로컬 서버로 데스크톱과 모바일 레이아웃 확인하기**

Run: `node server.js`

Expected: 데스크톱과 390px 모바일에서 문서, 두 패널 모두 `scrollWidth === clientWidth`이며 16개 행 전체가 펼쳐진다.

- [ ] **Step 2: 전체 테스트를 실행하기**

Run: `node --test tests/*.test.js`

Expected: 변경 대상 관련 테스트는 모두 통과한다. 기존 사용자 작업으로 인한 무관한 실패가 있으면 항목과 원인을 별도로 기록한다.

- [ ] **Step 3: 대상 파일만 커밋하기**

```powershell
git add -- blog/mbti-16-vs-64-personality-types.html blog/assets/style.css tests/mbti-blog-page.test.js docs/superpowers/plans/2026-07-31-mbti-matrix-split.md
git commit -m "fix: split mbti matrix without scrollbars" -- blog/mbti-16-vs-64-personality-types.html blog/assets/style.css tests/mbti-blog-page.test.js docs/superpowers/plans/2026-07-31-mbti-matrix-split.md
```

- [ ] **Step 4: 현재 main을 원격 main으로 푸시하고 커밋 일치 확인하기**

Run: `git push origin main`

Expected: 원격 `refs/heads/main`이 로컬 `HEAD`와 일치한다.
