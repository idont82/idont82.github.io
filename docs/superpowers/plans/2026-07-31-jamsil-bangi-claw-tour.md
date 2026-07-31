# 잠실역 방이먹자골목 인형뽑기 코스 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 실제 촬영 사진과 공개 매장 정보를 바탕으로 잠실역 방이먹자골목 6개 인형뽑기 매장 코스 글을 만든다.

**Architecture:** `blog/hongdae-claw-tour.html`의 정적 블로그 구조와 기존 Leaflet 지역 데이터 로더를 재사용한다. 매장 좌표와 경로는 `data/jamsil.json`, 글과 사진 설명은 새 HTML, 게시용 이미지는 GPS가 제거된 최적화 JPEG로 분리한다.

**Tech Stack:** Vanilla HTML/CSS/JavaScript, JSON, Node.js 내장 테스트 러너, ExifTool, FFmpeg

---

### Task 1: 페이지 계약 테스트

**Files:**
- Create: `tests/jamsil-bangi-claw-tour.test.js`

- [ ] **Step 1: 페이지와 6개 매장의 검색·지도 계약을 테스트에 작성한다**

```js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const pagePath = 'blog/jamsil-bangi-claw-tour.html';

test('Jamsil Bangi claw tour is search-ready and covers six visited stores', () => {
  const html = fs.readFileSync(pagePath, 'utf8');
  const stores = ['캐치팡 프리미엄', '미션클리어 방이점', '캑티 가챠샵 방이점', '대빵오락실 방이점', '사격팡 방이점', 'Koala'];

  assert.match(html, /<title>[^<]*잠실역 인형뽑기/);
  assert.match(html, /rel="canonical" href="https:\/\/idont82\.github\.io\/blog\/jamsil-bangi-claw-tour\.html"/);
  assert.match(html, /data-area-map="jamsil"/);
  stores.forEach((store) => assert.match(html, new RegExp(store)));
});
```

- [ ] **Step 2: 데이터와 이미지 안전 계약을 작성한다**

```js
test('Jamsil data exposes six geolocated stores', () => {
  const area = JSON.parse(fs.readFileSync('data/jamsil.json', 'utf8'));
  assert.equal(area.spots.length, 6);
  area.spots.forEach((spot) => {
    assert.equal(typeof spot.lat, 'number');
    assert.equal(typeof spot.lng, 'number');
    assert.ok(spot.address);
  });
});
```

- [ ] **Step 3: 테스트를 실행해 새 페이지와 데이터가 없어서 실패하는지 확인한다**

Run: `node --test tests/jamsil-bangi-claw-tour.test.js`

Expected: FAIL with `ENOENT` for the new page.

### Task 2: GPS 기반 지역 데이터

**Files:**
- Create: `data/jamsil.json`
- Modify: `data/areas.json`
- Modify: `blog/assets/blog.js`
- Test: `tests/jamsil-bangi-claw-tour.test.js`

- [ ] **Step 1: EXIF 외관 좌표를 6개 매장 좌표로 기록한다**

```json
{
  "id": "jamsil",
  "name": "잠실역 방이먹자골목",
  "station": "잠실역",
  "exit": "10번 출구",
  "route": {
    "steps": [
      "잠실역 10번 출구에서 방이먹자골목 방향으로 이동합니다.",
      "캐치팡 프리미엄을 시작으로 오금로11길을 따라 동쪽으로 걷습니다.",
      "Koala까지 확인한 뒤 같은 길로 돌아오면 6곳을 한 번에 비교할 수 있습니다."
    ],
    "totalDistance": "약 500m"
  },
  "spots": []
}
```

각 `spots` 항목은 촬영 순서, 공개 주소, 외관 GPS 좌표, 사진에서 확인되는 특징을 포함한다.

- [ ] **Step 2: `data/areas.json`의 잠실 항목을 실제 코스로 바꾼다**

`spotCount`를 6으로 바꾸고 `Coming Soon` 문구를 제거하며 방이먹자골목, 역세권, 가챠 키워드를 넣는다.

- [ ] **Step 3: 지도 로딩 문구를 지역 공통 표현으로 바꾼다**

```js
container.innerHTML = '<div class="article-map-loading">매장 지도를 불러오는 중입니다…</div>';
```

- [ ] **Step 4: 데이터 테스트를 실행한다**

Run: `node --test tests/jamsil-bangi-claw-tour.test.js`

Expected: 페이지 계약만 FAIL하고 데이터 계약은 PASS.

### Task 3: 게시용 사진 최적화

**Files:**
- Create: `blog/images/jamsil/*.jpg`
- Test: `tests/jamsil-bangi-claw-tour.test.js`

- [ ] **Step 1: 매장별 외관과 내부 사진을 선별한다**

선별 기준은 간판 가독성, 방문자 얼굴 노출 최소화, 기계 구성 설명 가능성이다. 매장당 외관 1장과 내부 1장을 기본으로 하며, 대빵오락실과 캑티처럼 층·업종 구성이 다른 경우 내부 사진을 1장 더 사용한다.

- [ ] **Step 2: 긴 변 1600px, JPEG 품질 약 82로 축소하고 메타데이터를 제거한다**

```powershell
ffmpeg -y -i <source.jpg> -map_metadata -1 -vf "scale='if(gt(iw,ih),min(1600,iw),-2)':'if(gt(iw,ih),-2,min(1600,ih))'" -q:v 3 <destination.jpg>
```

- [ ] **Step 3: 대표·OG·썸네일 이미지를 만든다**

대표 이미지는 외관 간판이 보이도록 16:9, OG는 1200×630, 썸네일은 블로그 카드 비율로 만든다. 얼굴이 크게 잡힌 부분은 크롭 영역에서 제외한다.

- [ ] **Step 4: 이미지 크기와 GPS 제거 테스트를 추가한다**

ExifTool JSON을 Node에서 실행해 `ImageWidth <= 1600 || ImageHeight <= 1600`과 GPS 태그 부재를 검사한다.

- [ ] **Step 5: 이미지 테스트를 실행한다**

Run: `node --test tests/jamsil-bangi-claw-tour.test.js`

Expected: 모든 게시 이미지 크기와 메타데이터 검사 PASS.

### Task 4: 잠실 방이먹자골목 블로그 글

**Files:**
- Create: `blog/jamsil-bangi-claw-tour.html`
- Test: `tests/jamsil-bangi-claw-tour.test.js`

- [ ] **Step 1: 홍대 코스의 메타데이터와 3단 레이아웃을 잠실 글에 맞게 만든다**

```html
<title>잠실역 인형뽑기 6곳 코스 | 방이먹자골목 직접 걸어본 순서</title>
<link rel="canonical" href="https://idont82.github.io/blog/jamsil-bangi-claw-tour.html">
```

BlogPosting JSON-LD에는 2026-07-25 촬영일, 2026-07-31 수정일, 1200×630 OG 이미지를 기록한다.

- [ ] **Step 2: 지도와 도보 순서를 작성한다**

```html
<div id="blogJamsilMap" class="article-map-canvas" data-area-map="jamsil"></div>
```

잠실역 출구, 방이먹자골목 진입, 서쪽에서 동쪽으로 이어지는 6개 매장 순서를 요약한다.

- [ ] **Step 3: 6개 매장 섹션을 현장 사진과 검증 정보로 작성한다**

각 섹션은 매장명, 공개 주소, 사진으로 확인되는 특징, 외관·내부 사진, 정보 확인 기준을 포함한다. 집게 힘이나 당첨 확률을 단정하지 않는다.

- [ ] **Step 4: 비교 팁, FAQ, 관련 글을 추가한다**

대형 오락실과 가챠 중심 매장의 차이, 예상 체류 시간, 영업시간 재확인 안내, 잠실새내·서울 전체 가이드 링크를 포함한다.

- [ ] **Step 5: 페이지 테스트를 실행한다**

Run: `node --test tests/jamsil-bangi-claw-tour.test.js`

Expected: PASS, 0 failures.

### Task 5: 검색 연결과 브라우저 검증

**Files:**
- Modify: `index.html`
- Modify: `sitemap.xml`
- Test: `tests/jamsil-bangi-claw-tour.test.js`

- [ ] **Step 1: 블로그 홈과 사이트맵에 잠실 글을 추가한다**

기존 사용자 변경을 보존하고 잠실 글 카드·URL만 추가한다. 테스트는 두 파일에 `/blog/jamsil-bangi-claw-tour.html`이 존재하는지 확인한다.

- [ ] **Step 2: 관련 테스트를 실행한다**

Run: `node --test tests/jamsil-bangi-claw-tour.test.js tests/root-blog-home.test.js`

Expected: 잠실 관련 검사는 PASS. 기존 카드 우선순위 실패가 남으면 이번 변경과 분리해 보고한다.

- [ ] **Step 3: 로컬 서버에서 데스크톱과 모바일을 확인한다**

Run: `node server.js`

Expected: 지도에 6개 핀이 표시되고, 사진 비율과 3단 레이아웃이 데스크톱에서 정상이며 390px 모바일에서 문서 가로 넘침이 없다.

- [ ] **Step 4: 전체 테스트를 실행한다**

Run: `node --test tests/*.test.js`

Expected: 이번 변경 관련 테스트는 모두 통과한다. 기존 사용자 작업에서 발생한 무관한 실패는 목록으로 분리한다.

- [ ] **Step 5: 커밋하지 않고 변경 파일과 로컬 화면을 사용자에게 제시한다**

사용자 승인 전에는 `git add`, `git commit`, `git push`를 실행하지 않는다.
