# Facebook Laptop Shopping Card Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 가성비·최고성능·문서용 노트북 게시물을 제품별 쇼핑 카드 세 장으로 다시 만들고, 새 게시물을 검증한 뒤 기존 게시물 세 건만 안전하게 삭제한다.

**Architecture:** 기존 카드 콘텐츠와 렌더러에 `shopping-grid` 분기를 추가해 다른 페이스북 큐는 그대로 유지한다. 교체 전용 큐는 새 단축 링크 18~20, 카드별 표시 데이터, 교체 대상 게시 ID를 보관한다. 삭제 도구는 새 게시물 세 건을 Graph API로 재검증한 경우에만 고정된 기존 ID를 삭제한다.

**Tech Stack:** Node.js CommonJS, Python Pillow, JSON, Node 내장 테스트 러너, Meta Graph API

---

### Task 1: 쇼핑 카드 데이터 계약과 콘텐츠 생성

**Files:**
- Modify: `scripts/facebook-post-queue.js`
- Modify: `scripts/facebook-card-content.js`
- Test: `tests/facebook-card-content.test.js`
- Create: `tests/facebook-laptop-shopping-queue.test.js`

- [ ] **Step 1: 쇼핑 카드 큐 검증 실패 테스트 작성**

`shopping-grid` 항목에 `shoppingCards`가 정확히 세 개 있어야 하며 각 카드가 `hook`, `productName`, `imageUrls`, `specs`, `uses`, `disclaimer`를 가져야 한다는 테스트를 작성한다. `specs`는 1~3개, `uses`는 1~4개, 모든 문자열은 비어 있지 않아야 한다.

```js
assert.throws(
  () => validateQueue([{ ...validShoppingItem, shoppingCards: [] }]),
  /shoppingCards must contain exactly three cards/
);
assert.doesNotThrow(() => validateQueue([validShoppingItem]));
```

- [ ] **Step 2: RED 확인**

Run: `node --test tests/facebook-laptop-shopping-queue.test.js tests/facebook-card-content.test.js`

Expected: `shopping-grid` 전용 검증 또는 슬라이드 변환이 없어 FAIL.

- [ ] **Step 3: 최소 데이터 검증과 콘텐츠 변환 구현**

`validateQueue()`에 `cardTemplate === 'shopping-grid'` 분기를 추가한다. `buildPostContent()`는 쇼핑 카드 데이터를 그대로 렌더러 슬라이드로 전달하고 기존 템플릿은 현재 로직을 유지한다.

```js
const slides = queueItem.cardTemplate === 'shopping-grid'
  ? queueItem.shoppingCards.map((card) => ({
      template: 'shopping-grid',
      label: 'GOLD PICK',
      ...card,
    }))
  : buildClassicSlides(queueItem, article);
```

쇼핑형에서도 캡션 첫 줄은 `https://idont82.github.io/g/?n=<id>`이고 제휴 고지를 유지한다.

- [ ] **Step 4: GREEN 확인**

Run: `node --test tests/facebook-laptop-shopping-queue.test.js tests/facebook-card-content.test.js tests/facebook-post-queue.test.js`

Expected: 모든 테스트 PASS.

- [ ] **Step 5: 커밋**

```bash
git add scripts/facebook-post-queue.js scripts/facebook-card-content.js tests/facebook-card-content.test.js tests/facebook-laptop-shopping-queue.test.js
git commit -m "feat: add Facebook shopping card contract"
```

### Task 2: 쇼핑형 Pillow 렌더러

**Files:**
- Modify: `scripts/generate-facebook-cards.py`
- Modify: `tests/facebook-card-renderer.test.js`

- [ ] **Step 1: 쇼핑형 렌더링 실패 테스트 작성**

서로 다른 색의 로컬 제품 이미지 세 개를 만들고 `shopping-grid` 슬라이드 세 개를 렌더링한다. 출력 크기 1080×1350, 카드 수 3, 왼쪽 제품 영역과 오른쪽 패널 영역이 서로 다른 픽셀을 갖는지 확인한다. 필수 필드 누락과 긴 문구는 렌더 전에 실패해야 한다.

```js
assert.deepEqual(pngSize(card), { width: 1080, height: 1350 });
assert.notDeepEqual(sampleRgb(card, 300, 700), sampleRgb(card, 930, 250));
assert.match(invalid.stderr, /shopping card missing hook/);
```

- [ ] **Step 2: RED 확인**

Run: `node --test tests/facebook-card-renderer.test.js`

Expected: 기존 전체 사진 렌더러가 쇼핑형 레이아웃을 만들지 못해 FAIL.

- [ ] **Step 3: 쇼핑형 렌더러 구현**

`render_slide()`가 `slide.template`에 따라 기존 `render_classic_slide()` 또는 새 `render_shopping_slide()`를 호출하게 분리한다. 새 렌더러는 왼쪽 720px 제품 영역, 오른쪽 360px 스펙·용도 패널, Gold Pick 배지, 큰 후킹 문구, 하단 고지를 그린다. 제품 이미지는 흰색 배경을 유지한 채 `ImageOps.contain()`으로 배치하고 잘라내지 않는다.

```python
def render_slide(slide, index, font_path, output_file):
  if slide.get("template") == "shopping-grid":
    return render_shopping_slide(slide, index, font_path, output_file)
  return render_classic_slide(slide, index, font_path, output_file)
```

후킹 문구, 제품명, 스펙, 용도, 고지는 각각 고정된 최대 줄 수로 `fit_text()`를 통과해야 하며 넘치면 축소 한계에서 명시적으로 실패한다.

- [ ] **Step 4: GREEN 및 기존 렌더러 회귀 확인**

Run: `node --test tests/facebook-card-renderer.test.js tests/facebook-laptop-dry-run.test.js`

Expected: 쇼핑형과 기존 카드 렌더 테스트 모두 PASS.

- [ ] **Step 5: 커밋**

```bash
git add scripts/generate-facebook-cards.py tests/facebook-card-renderer.test.js
git commit -m "feat: render Facebook shopping cards"
```

### Task 3: 교체 큐와 단축 링크 18~20

**Files:**
- Create: `data/facebook-laptop-shopping-post-queue.json`
- Modify: `scripts/build-facebook-short-links.js`
- Modify: `tests/facebook-laptop-shopping-queue.test.js`
- Modify: `tests/facebook-short-links.test.js`

- [ ] **Step 1: 실제 큐 계약 테스트 작성**

교체 큐가 가성비·최고성능·문서용 순서, 단축 링크 18·19·20, 서로 다른 아홉 제품 이미지, 고정된 교체 대상 ID 세 개를 갖는지 검증한다. 가격 후킹 카드에는 가격 변동 고지가, 최고성능 카드에는 옵션 확인 고지가 있어야 한다.

```js
assert.deepEqual(queue.map((item) => item.shortLinkId), [18, 19, 20]);
assert.equal(new Set(queue.flatMap((item) => item.shoppingCards.map((card) => card.imageUrls[0]))).size, 9);
assert.deepEqual(queue.map((item) => item.replacesFacebookPostId), EXPECTED_OLD_IDS);
```

- [ ] **Step 2: RED 확인**

Run: `node --test tests/facebook-laptop-shopping-queue.test.js tests/facebook-short-links.test.js`

Expected: 큐 파일과 18~20 매핑이 없어 FAIL.

- [ ] **Step 3: 실제 상품 데이터로 큐 작성**

`data/coupang-laptop-value.json`, `data/coupang-laptop-performance.json`, `data/coupang-laptop-document.json`의 아홉 상품을 순서대로 사용한다. 각 항목에 `cardTemplate`, `shoppingCards`, `replacesFacebookPostId`, 게시 상태 필드를 기록하고 `scheduledAt`은 같은 날짜에 1분 간격으로 둔다. `scripts/build-facebook-short-links.js`가 기존 큐 두 개와 교체 큐를 모두 병합하게 한다.

- [ ] **Step 4: 단축 링크 생성 및 GREEN 확인**

Run: `node scripts/build-facebook-short-links.js`

Run: `node --test tests/facebook-laptop-shopping-queue.test.js tests/facebook-short-links.test.js tests/facebook-post-queue.test.js`

Expected: 링크 18~20이 각 기존 블로그 글의 추적 URL로 해석되고 모든 테스트 PASS.

- [ ] **Step 5: 커밋**

```bash
git add data/facebook-laptop-shopping-post-queue.json scripts/build-facebook-short-links.js g/redirect.js tests/facebook-laptop-shopping-queue.test.js tests/facebook-short-links.test.js
git commit -m "feat: queue laptop shopping posts"
```

### Task 4: 검증 후 제한 삭제 도구

**Files:**
- Modify: `scripts/facebook-graph-api.js`
- Create: `scripts/delete-replaced-facebook-posts.js`
- Create: `tests/facebook-replacement-cleanup.test.js`
- Modify: `tests/facebook-graph-api.test.js`

- [ ] **Step 1: 삭제 안전 조건 실패 테스트 작성**

새 큐 중 하나라도 `published`가 아니거나, 새 게시물 조회 결과의 첫 줄·첨부 카드 수가 다르거나, 기존 ID가 고정 허용 목록과 다르면 삭제 호출이 0회인지 검증한다. 정상인 경우에만 세 ID를 한 번씩 삭제한다.

```js
await assert.rejects(() => cleanupReplacedPosts({ queue: incomplete, graphClient }), /all replacement posts/);
assert.equal(deletes.length, 0);
assert.deepEqual(deletes, EXPECTED_OLD_IDS);
```

- [ ] **Step 2: RED 확인**

Run: `node --test tests/facebook-replacement-cleanup.test.js tests/facebook-graph-api.test.js`

Expected: 조회·삭제 API와 정리 도구가 없어 FAIL.

- [ ] **Step 3: Graph 조회·삭제와 정리 게이트 구현**

`FacebookGraphClient`에 `getPost(id)`와 `deletePost(id)`를 추가한다. 정리 도구는 새 게시물 세 건을 조회해 첫 줄이 각 단축 링크와 일치하고 `subattachments.data`가 세 개인지 확인한 다음에만 `replacesFacebookPostId`를 삭제한다. `--dry-run`은 검증 결과와 삭제 예정 ID만 반환하며 `--confirm` 없이는 실제 삭제하지 않는다. 오류 출력에는 토큰을 포함하지 않는다.

- [ ] **Step 4: GREEN 확인**

Run: `node --test tests/facebook-replacement-cleanup.test.js tests/facebook-graph-api.test.js tests/facebook-publisher.test.js`

Expected: 안전 조건, 삭제 성공, 기존 게시 흐름 모두 PASS.

- [ ] **Step 5: 커밋**

```bash
git add scripts/facebook-graph-api.js scripts/delete-replaced-facebook-posts.js tests/facebook-replacement-cleanup.test.js tests/facebook-graph-api.test.js
git commit -m "feat: safely replace Facebook posts"
```

### Task 5: 로컬 카드 9장 검증

**Files:**
- Generated only: `.facebook-artifacts/laptop-shopping-dry-run/`

- [ ] **Step 1: 드라이런 세 번 실행**

Run: `node scripts/publish-facebook-posts.js --dry-run --queue data/facebook-laptop-shopping-post-queue.json --output-dir .facebook-artifacts/laptop-shopping-dry-run --now 2026-08-22T00:00:00+09:00`

드라이런은 원본 큐를 변경하지 않으므로 각 항목을 한 건짜리 임시 큐로 복사해 실행한다. PowerShell에서 UTF-8로 원본을 읽고 `ConvertTo-Json -Depth 20`으로 `.facebook-artifacts/laptop-shopping-dry-run/queue-1.json`부터 `queue-3.json`까지 만든 뒤, 각 임시 큐에 위 명령을 한 번씩 실행한다. 세 결과 디렉터리는 항목 ID를 이름으로 사용하며 원본 `data/facebook-laptop-shopping-post-queue.json`의 해시는 실행 전후 같아야 한다.

- [ ] **Step 2: 이미지와 문구 검사**

아홉 PNG가 모두 1080×1350이고 각 게시물의 제품 사진이 서로 다른지 확인한다. 원본 크기와 모바일 축소판을 열어 후킹 문구, 스펙, 용도, 고지가 잘리지 않는지 확인한다.

- [ ] **Step 3: 전체 관련 테스트 실행**

Run: `node --test tests/facebook-*.test.js tests/laptop-*.test.js`

Expected: 0 failures.

### Task 6: 실제 게시, 검증, 기존 게시물 삭제

**Files:**
- Modify: `data/facebook-laptop-shopping-post-queue.json` (게시 영수증)

- [ ] **Step 1: 비밀정보와 대상 페이지 확인**

`D:\py_project\claw\idont82.github.io\.facebook-artifacts\meta.env`에서 `META_PAGE_ACCESS_TOKEN`만 환경변수로 읽고 출력하지 않는다. Graph `/me` 응답이 페이지 ID `1243431898854300`, 이름 `Gold Pick`인지 확인한다.

- [ ] **Step 2: 새 게시물 세 건 순차 게시**

Run: `node --use-system-ca scripts/publish-facebook-posts.js --queue data/facebook-laptop-shopping-post-queue.json --output-dir .facebook-artifacts/laptop-shopping-live`

한 건씩 세 번 실행하고, 실패 시 즉시 중단한다. 각 성공 후 게시 ID와 고유 링크만 출력한다.

- [ ] **Step 3: 새 게시물 검증**

Graph API로 세 게시물 각각 첫 줄 링크 18·19·20, 카드 세 장, 페이지 소유자, 접근 가능한 고유 링크를 확인한다.

- [ ] **Step 4: 기존 게시물 제한 삭제**

먼저 `node --use-system-ca scripts/delete-replaced-facebook-posts.js --queue data/facebook-laptop-shopping-post-queue.json --dry-run`으로 세 대상만 표시되는지 확인한다. 이어서 같은 명령에 `--confirm`을 사용해 실제 삭제한다.

- [ ] **Step 5: 삭제와 새 게시물 재검증**

기존 ID 세 개는 더 이상 조회되지 않고 새 ID 세 개는 계속 조회되며 첫 줄 링크와 카드 세 장이 유지되는지 확인한다.

- [ ] **Step 6: 게시 영수증 테스트와 커밋**

Run: `node --test tests/facebook-laptop-shopping-queue.test.js tests/facebook-replacement-cleanup.test.js`

```bash
git add data/facebook-laptop-shopping-post-queue.json tests/facebook-laptop-shopping-queue.test.js
git commit -m "chore: record laptop shopping Facebook posts"
```

### Task 7: 최종 배포와 완료 검증

**Files:**
- No new files

- [ ] **Step 1: 최종 테스트와 작업 트리 검사**

Run: `node --test tests/facebook-*.test.js tests/laptop-*.test.js`

Run: `git diff --check && git status --short`

Expected: 테스트 0 failures, 커밋 후 작업 트리 clean.

- [ ] **Step 2: 원격 main 반영**

원격 `main`이 현재 기능 브랜치의 이전 커밋을 가리키는지 확인한 뒤 fast-forward로 `HEAD:main`을 푸시한다.

- [ ] **Step 3: 원격과 외부 상태 최종 확인**

원격 `main`이 로컬 HEAD와 일치하고, 새 페이스북 고유 링크 세 개가 접근 가능하며, 기존 세 ID만 삭제됐음을 Graph API로 다시 확인한다.
