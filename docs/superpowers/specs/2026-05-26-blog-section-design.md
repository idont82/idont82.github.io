# Blog Section Design

## Goal

`blog/` 폴더를 새로 만들고, 기존 `search/`와 분리된 생활형 개인 블로그 섹션을 운영한다. 이 섹션은 검색 랜딩보다는 읽는 맛, 체류, 내부 이동, 쿠팡 광고 자연 노출에 더 무게를 둔다.

첫 단계 범위는 아래 두 페이지다.

- `blog/index.html`
- `blog/hongdae-claw-tour.html`

## Why Separate `blog/`

현재 구조에서 `search/`는 비교형, 모아보기형, 상품 유입형 랜딩이 중심이다. 반면 새 블로그는 다음 역할을 맡는다.

- 후기형 또는 정보형 글을 길게 풀어쓰기
- 한 가지 질문에 결론부터 답하는 글 구성
- 좌측 프로필, 카테고리, 최근 글이 있는 블로그형 레이아웃
- 우측 광고와 본문 광고를 함께 쓰는 체류형 구조

루트 `index.html`을 바로 블로그 홈으로 바꾸지 않는 이유는 기존 허브 역할을 유지해야 하기 때문이다. 따라서 `index.html`은 전체 사이트 허브, `search/index.html`은 검색 랜딩 허브, `blog/index.html`은 블로그 허브로 역할을 분리한다.

## Content Principles

블로그 글은 아래 원칙을 따른다.

- 검색 의도에 바로 답한다.
- 첫 문단에서 결론을 먼저 말한다.
- 단락은 짧게 유지한다.
- 과장형 표현보다 생활형 정보 정리 톤을 우선한다.
- 핵심 키워드는 제목과 본문에 자연스럽게 2회 이상 들어가게 한다.
- 이미지, 표, 카드, 광고로 본문을 분산해 가독성을 높인다.
- 대형 키워드보다 의도가 뚜렷한 롱테일 키워드를 우선한다.
- 제목은 키워드 + 후킹 문장을 같이 써서 클릭 이유를 만든다.
- 사례, 수치, 공식 출처 링크가 있으면 적극 포함한다.
- 건강, 계절가전, 침구처럼 과학적 근거가 중요한 글은 공식기관, 시험기관, 제조사 표준 문서, 공공기관 자료를 먼저 확인한다.
- 공식 자료에서 얻은 수치나 시험 기준은 본문 중간에 `근거 카드`로 분리하고, 사용자가 바로 이해할 핵심 문장에는 밑줄이나 손글씨 메모 강조를 쓴다.
- 내부 작업 방식은 본문에 쓰지 않는다. 예를 들어 `쿠팡 API로 가져옴`이 아니라 `최근 많이 찾는 제품`, `구매 전 확인할 제품 사진`처럼 사용자 기준으로 쓴다.
- 쿠팡 파트너스 수수료 문구는 상품 카드 아래에 작고 흐린 안내문으로만 둔다.

주제는 인형뽑기에 한정하지 않는다. 앞으로 아래처럼 섞여 올라갈 수 있다.

- 인형뽑기 지역 코스
- 굿즈 모아보기
- 콘서트 준비물
- 생활용품 후기
- 쇼핑/데이트 동선

즉 주제는 다양하게 두되, 문서 형식과 레이아웃만 통일한다.

## Writing Rules For 2026 Search

2026년 블로그 글은 단순 키워드 반복보다 `AI 요약에 인용되기 쉬운 구조`와 `롱테일 검색 의도 충족`을 함께 잡아야 한다. 이 블로그 섹션은 아래 규칙을 기본 작성 원칙으로 둔다.

## Cross-CLI Content Automation Rules

Claude, Gemini CLI, Codex 등 어떤 도구로 작성하더라도 아래 운영 규칙을 공통 기준으로 둔다. 도구가 바뀌어도 결과물의 품질, SEO 구조, 광고 노출 방식이 흔들리지 않게 하기 위한 규칙이다.

### Keyword Strategy

- 대형 키워드 단독 글은 피한다. 예를 들어 `가성비 노트북 TOP 3`처럼 경쟁이 센 제목보다 `대학생 과제용 가성비 노트북`, `부모님 영상통화용 태블릿`, `자취방 미니 제습기`처럼 상황이 분명한 롱테일 키워드를 우선한다.
- 키워드 조합은 `사용자 상황 + 제품군 + 비교/추천/체크리스트`를 기본형으로 둔다.
- 단가와 전환 가능성이 높은 주제를 우선순위에 둔다.
  - 생활가전
  - 계절가전
  - 전자제품 액세서리
  - 공연/팬덤 준비물
  - 육아/반려/자취 필수품
- 하나의 주제에서 파생 글을 만들 때는 검색 의도를 분리한다. 예를 들어 `유선 선풍기 추천`, `원룸 선풍기`, `에어컨 같이 쓰는 서큘레이터`는 같은 제품군이라도 제목과 결론을 다르게 둔다.

### Source And Evidence Rules

- 상품 추천 글이라도 본문에는 최소 1개 이상의 근거를 넣는다.
- 건강, 안전, 계절가전, 아기용품, 배터리, 전기제품은 공식기관, 공공기관, 시험기관, 제조사 표준 문서를 먼저 참고한다.
- 공식 자료는 `출처 + 핵심 수치/주의점 + 생활 적용` 순서로 풀어 쓴다.
- 자료가 직접 말하지 않는 내용을 임의로 확대 해석하지 않는다.
- 웹 자료를 참고했으면 본문 하단 `참고한 자료`에 링크를 둔다.

### CTA Rules

- 구매 유도 문구는 링크 바로 위나 상품 카드 섹션 도입부에 짧게 넣는다.
- 과도한 공포, 허위 긴급성, 확정 수익 표현은 쓰지 않는다.
- 좋은 CTA는 `지금 안 사면 손해`보다 `구매 전 이 기준만 비교하면 실패 확률을 줄일 수 있습니다`처럼 신뢰형 압박을 쓴다.
- CTA 문장은 50자 안팎으로 짧게 쓴다.
- CTA 예시:
  - `가격보다 사용 상황이 먼저입니다. 아래 기준으로만 비교해도 실패 확률이 줄어듭니다.`
  - `바로 사기보다, 지금 쓰는 공간에 맞는지 먼저 확인해 보세요.`
  - `후기보다 먼저 볼 건 크기, 전력, 보관 방식입니다.`

### Mobile Monetization And Coupang Tracking Rules

- Sitewide rule: every published HTML page that contains a Coupang URL must load either `/assets/coupang-tracking.js` or a page-specific script that emits the same `coupang_click` event shape.
- Search pages, recipe pages, root landing pages, `claw-machine-guide.html`, and `claw-machine.html` are not exceptions. They must be tracked the same way as blog pages.
- Keep `tests/sitewide-coupang-tracking.test.js` passing whenever adding or editing Coupang links outside the blog folder.
- Search pages use one mobile-only top CTA generated from the first product card. Do not add multiple top CTAs; keep the first screen useful rather than ad-heavy.
- Game page ad clicks that are exposed through the coin flow use `data-coupang-placement="game_coin"`.
- Area guide product cards use explicit guide placements such as `guide_area_middle` and `guide_detail_top`.
- 현재 분석 기준으로 블로그 유입은 모바일 비중이 높으므로, 모든 수익형 글은 모바일 첫 화면 전환을 우선한다.
- 제품명 글, 비교 글, 구매 의도 글은 요약 박스 바로 아래에 모바일 전환 카드를 둔다. 히어로 이미지가 CTA를 너무 아래로 밀면 요약 박스 다음에 `mobile-conversion-card`를 먼저 배치한다.
- `mobile-conversion-card`에는 상품 이미지, 짧은 맥락 문장, CTA 버튼을 포함한다.
- 기본 CTA 문구는 `쿠팡에서 구매하기`보다 `현재 가격 확인하기`, `후기와 가격 보기`, `내 조건에 맞는지 보기`를 우선한다.
- 인형뽑기 글은 `미니 인형뽑기 가격 보기`, 건강식품 글은 `함량 기준으로 가격 확인하기`처럼 검색 의도에 맞춘 문구를 쓴다.
- 블로그의 모든 쿠팡 상품 링크에는 다음 속성을 넣는다.
  - `data-coupang-link`
  - `data-coupang-placement`
  - `data-coupang-product-type`
- `data-coupang-placement` 값은 위치를 구분할 수 있어야 한다. 예: `mobile_summary_card`, `product_card`, `faq_before`, `top_banner`, `middle_ad`, `game_coin`.
- `data-coupang-product-type` 값은 상품군을 구분할 수 있어야 한다. 예: `chondroitin`, `vitamin`, `mini_claw`, `diaper`, `fan`, `banner`.
- 공통 JS는 쿠팡 링크 클릭 시 `coupang_click` 이벤트를 전송한다. 가능하면 `gtag`와 `dataLayer`에 모두 보낸다.
- `coupang_click` 이벤트에는 `page_path`, `link_url`, `coupang_placement`, `coupang_product_type`, `outbound: true`를 포함한다.
- 속성이 없는 쿠팡 링크도 `unknown`으로 추적될 수 있지만, 새로 만들거나 수정하는 링크는 `unknown`에 의존하지 않는다.
- 쿠팡 추적 동작을 바꿀 때는 Node 테스트를 추가하거나 갱신한다. 최소 검증은 `blog/assets/blog.js`에 `coupang_click`이 있고, 대상 글에 의미 있는 `data-coupang-link`와 placement가 있는지 확인하는 것이다.
- 쿠팡 파트너스 수수료 문구는 상품 카드 또는 광고 카드 아래에 작고 회색으로 둔다. 모바일 첫 화면을 수수료 문구가 지배하지 않게 한다.

### Publishing Cadence

- 자동화 목표는 하루 2~3개까지 가능하지만, 무검수 대량 발행은 금지한다.
- 최소 발행 단위는 `키워드 선정 -> 근거 확인 -> 상품 확인 -> HTML 생성 -> SEO 검증 -> 링크 검증 -> sitemap 반영`이다.
- 발행 빈도보다 품질과 검색 의도 충족을 우선한다.
- 같은 제품군 글을 연속으로 만들 때는 제목과 첫 문단이 서로 중복되지 않게 한다.

### Required Quality Gate

다른 CLI가 만든 글도 발행 전 아래를 통과해야 한다.

- 고유한 `title`, `description`, `canonical`, `og:image`, `thumbnail`이 있다.
- `H1`은 1개다.
- 첫 문단이 결론형이다.
- 본문에 `H2/H3`, 체크리스트, FAQ가 있다.
- 대표 이미지와 주요 상품 이미지에 `alt`가 있다.
- 쿠팡 상품 링크는 파트너스 정보가 포함된 URL을 쓴다.
- 수수료 문구는 상품 카드 또는 광고 아래에 작고 흐리게 둔다.
- 내부 작업 방식, API 호출 방식, CLI 이름은 사용자 본문에 쓰지 않는다.
- `sitemap.xml`에 신규 URL과 대표 이미지가 추가된다.
- JSON-LD가 파싱된다.
- 로컬 이미지/링크 참조가 깨지지 않는다.

### Long-tail First

- `강남 맛집` 같은 대형 키워드보다 `홍대 인형뽑기 어디부터 갈까`, `BTS 응원봉 가방 뭐가 편한지`처럼 질문형 롱테일 키워드를 우선한다.
- 글 한 편은 질문 하나를 푸는 방식으로 묶는다.
- 제목은 핵심 키워드와 클릭 이유를 같이 담는다.

### AI-friendly Structure

- 첫 문단은 정의형 또는 결론형 문장으로 시작한다.
- 본문은 `H2`, `H3`로 논리를 나눠 AI가 구조를 읽기 쉽게 만든다.
- 글 하단에는 FAQ를 넣어 요약형 검색에 대응한다.
- 표, 체크리스트, 한 줄 요약 박스를 활용해 핵심 문장을 분리한다.
- 근거가 있는 정보는 `출처 + 수치 + 생활 적용` 순서로 쓴다.
- 공식 자료를 인용할 때는 과장하지 않고, 자료가 직접 말하는 범위 안에서만 해석한다.

### Multimedia Rules

- 이미지는 본문 내용과 직접 연결돼야 한다.
- 파일명, `alt`, 캡션에 글의 핵심 키워드를 반영한다.
- 대표 이미지는 글 상단에 실제로 노출되게 둔다.
- 스크린샷이나 지도 이미지를 쓸 때는 설명 문장과 바로 붙여 맥락을 만든다.

### Two-track Operation

이 블로그는 글 구조를 두 갈래로 확장 가능하게 설계한다.

- 검색형 글: 롱테일 키워드, 결론 먼저, FAQ 포함
- 홈피드형 글: 썸네일, 짧은 요약, 감성형 제목, 반응 유도

첫 단계 구현은 검색형 글을 우선하지만, 블로그 홈 카드와 썸네일 구조는 나중에 홈피드형 글도 같이 실을 수 있게 유지한다.

## Approaches Considered

### 1. `search/` 안에 블로그형 페이지를 추가

장점:

- 기존 인덱스 체계를 재사용하기 쉽다.
- CSS를 공유하기 쉽다.

단점:

- 비교형 랜딩과 블로그형 글이 한 폴더에 섞인다.
- 설계 의도가 흐려진다.
- 앞으로 블로그 전용 자산을 늘리기 불편하다.

### 2. 루트 `index.html`을 블로그 홈으로 전환

장점:

- 메인 유입 페이지를 블로그 톤으로 강하게 바꿀 수 있다.

단점:

- 현재 허브 구조를 깨뜨린다.
- 기존 검색/상품/인형뽑기 허브 성격이 약해진다.
- 너무 큰 구조 변경이다.

### 3. `blog/`를 별도 섹션으로 운영

장점:

- 역할이 가장 명확하다.
- 블로그 전용 CSS/이미지/스크립트를 분리할 수 있다.
- 앞으로 글이 늘어나도 구조가 안정적이다.

단점:

- 새 인덱스와 새 디자인을 따로 만들어야 한다.

### Recommendation

`blog/`를 별도 섹션으로 운영한다. `search/`와 성격을 섞지 않고, 루트 허브도 그대로 유지할 수 있다.

## Information Architecture

### Folder Structure

```text
blog/
  index.html
  hongdae-claw-tour.html
  assets/
    style.css
    blog.js
  images/
    ...
```

### Page Roles

#### `blog/index.html`

블로그 홈. 카드형 글 목록을 보여준다.

포함 내용:

- 블로그 헤더
- 운영자 프로필
- 카테고리
- 태그
- 글 카드 목록
- 우측 광고

#### `blog/hongdae-claw-tour.html`

첫 개별 글. 홍대 인형뽑기 동선을 생활형 정보 글로 정리한다.

포함 내용:

- 제목
- 날짜/카테고리
- 한 줄 결론
- 대표 이미지
- 본문 섹션
- 본문 광고 3개
- 관련 글
- 태그

## Visual Direction

디자인은 “네이버 블로그 복제”가 아니라 “네이버 감성 + 자체 정리형”으로 간다.

핵심 방향:

- 레이아웃은 익숙하게
- 타이포와 여백은 더 깔끔하게
- 광고는 보이되 본문보다 튀지 않게

### Overall Layout

- 좌측: 프로필, 카테고리, 최근 글, 태그
- 중앙: 본문 또는 글 카드 목록
- 우측: 광고 레일

데스크톱:

- 3열 구조
- 중앙 본문 `max-width` 고정

모바일:

- 1열 구조
- 좌측/우측 사이드는 본문 아래 또는 위로 접힘
- 우측 광고는 본문 흐름 안으로 내려온다

### Tone

- 운영자는 생활형 개인 블로거
- 인형뽑기만 파는 캐릭터가 아니라 굿즈, 쇼핑, 데이트, 생활용품까지 정리하는 사람
- 문체는 친절하지만 과장되지 않게 유지

## Blog Home Design

## Typography And Emphasis

- 본문 기본 글꼴은 `SUIT` 계열의 정돈된 산세리프로 유지한다.
- 손글씨 느낌 글꼴은 전역 본문에 쓰지 않고, 강조 메모 문구에만 제한적으로 사용한다.
- 손글씨 강조는 섹션마다 1~2개 정도로 제한하고, 페이지 전체에서도 과도하게 반복하지 않는다.
- 역할 분리는 명확하게 둔다.
  - 굵게: 핵심 결론, 매장명, 가격대
  - 밑줄: 기억해야 하는 동선 포인트
  - 손글씨 스타일: 메모, 주의, 체감 포인트
- 손글씨 강조는 빨간색 또는 대비가 분명한 포인트 컬러를 쓸 수 있지만, 가독성을 해치지 않도록 짧은 문장에만 적용한다.
- 시적인 표현을 넣더라도 정보 문장 다음의 짧은 마무리 한 줄 수준으로 제한해, 검색형 글의 명료함을 유지한다.

### Header

- 블로그명
- 한 줄 소개
- 상단 메뉴

후보 요소:

- `글 목록`
- `인형뽑기`
- `굿즈`
- `콘서트 준비물`
- `생활 후기`

### Left Sidebar

- 운영자 프로필 카드
- 카테고리 목록
- 최근 글 목록
- 태그 클러스터

### Center Column

카드형 글 목록을 쓴다.

각 카드 구성:

- 대표 이미지
- 제목
- 한 줄 요약
- 날짜
- 카테고리
- 태그 2~4개

### Right Sidebar

- `300x250` 쿠팡 배너 1개
- 보조 광고 카드 또는 추천 카드 1개

## First Article Design

### URL

- `blog/hongdae-claw-tour.html`

### Title

- `홍대 인형뽑기 어디부터 갈까 | 처음 가면 이 순서가 편했습니다`

### Search Intent

이 글은 아래 질문에 답해야 한다.

- 홍대 인형뽑기 어디부터 보면 좋은가
- 홍대 인형뽑기 성지 코스는 어떻게 도는가
- 상수역 쪽부터 갈지, 메인 골목부터 갈지

### Article Structure

1. 결론 먼저
2. 왜 이 동선이 편한지
3. 큰 매장 먼저 볼지, 가챠샵부터 볼지
4. 상수역 쪽과 어울마당로 메인 골목 차이
5. 같이 보기 좋은 포인트
6. 마무리와 관련 링크

### Ad Placement

광고는 총 3개를 쓴다.

1. 본문 초반: `300x250 iframe`
2. 본문 중간: 상품 카드형 광고
3. 본문 후반: `300x250 iframe`

추가로 데스크톱 우측 사이드 광고 1~2개를 둔다.

모바일 글 페이지는 `hongdae-claw-tour.html`과 동일하게 상단 쿠팡 배너를 둔다.

- `<header>` 바로 아래에 `.mobile-top-ad`를 배치한다.
- 내부 광고 래퍼는 `.article-ad.article-ad-frame-block`을 사용한다.
- 모바일 상단 배너는 `380x50 iframe`을 사용하고, 수수료 문구는 숨긴다.
- 스크롤 시 상단에 붙고, 본문을 약 1/3 이상 내리면 숨겨져 본문 읽기를 방해하지 않게 한다.
- 데스크톱에서는 노출하지 않는다.

좌측은 광고 대신 글 목록을 둔다. 광고를 양쪽에 모두 두면 블로그보다 광고판처럼 보일 가능성이 높기 때문이다.

## SEO Structure

각 글은 독립 HTML 문서로 운영한다. 해시 라우팅이나 JS 상태 전환으로는 운영하지 않는다.

각 글에 포함할 항목:

- 고유한 `title`
- 고유한 `meta description`
- `canonical`
- `og:title`
- `og:description`
- `og:image`
- `twitter:image`
- `H1` 1개
- 초기 HTML에 직접 들어가는 대표 이미지와 본문 일부
- 본문 초반 결론형 문장
- `H2`, `H3` 구조
- FAQ 섹션
- 이미지 `alt`와 키워드 반영 캡션

블로그 홈에도 아래를 둔다.

- 고유 `title`
- 블로그 섹션 설명
- 카드형 내부 링크

## Shared Components

공통 자산은 블로그 전용으로 분리한다.

### `blog/assets/style.css`

역할:

- 블로그 헤더
- 프로필 카드
- 카테고리/태그 UI
- 카드형 목록
- 본문 스타일
- 광고 박스
- 반응형 레이아웃

### `blog/assets/blog.js`

최소 역할:

- 카테고리 활성화
- 최근 글 데이터 주입
- 태그/관련 글 공통 렌더

중요:

본문 핵심 내용은 JS 없이도 HTML에 바로 보여야 한다.

## Data Strategy

첫 단계에서는 정적 HTML 위주로 시작한다.

- 블로그 홈의 카드 목록은 우선 HTML에 직접 작성해도 된다.
- 최근 글/관련 글은 작게 시작하고, 글이 늘어나면 공통 데이터 파일로 분리할 수 있다.

즉 첫 구현에서는 과도한 데이터 자동화보다 “깔끔한 블로그 구조”를 우선한다.

## Internal Linking

블로그 글 안에는 아래 연결을 둔다.

- `search/hongdae.html`
- `claw-machine-guide.html#hongdae`
- 관련 `search/` 글 2~3개

이 구조는 블로그 글이 단독으로 끝나지 않고, 기존 허브와 연결되도록 만든다.

## Risks and Guardrails

### Risks

- 네이버 블로그와 너무 비슷하게 흉내 내면 조잡해 보일 수 있다.
- 광고가 과하면 본문 신뢰도가 떨어질 수 있다.
- 블로그와 `search/` 역할이 섞이면 사이트 구조가 복잡해질 수 있다.

### Guardrails

- 블로그 감성만 참고하고, 컴포넌트는 자체 스타일로 정리한다.
- 광고는 우측 + 본문 3개까지만 허용한다.
- `blog/` 자산은 `search/`와 분리한다.
- 글은 “질문 1개, 결론 먼저” 규칙을 지킨다.

## Acceptance Criteria

아래를 만족하면 첫 단계가 완료된 것으로 본다.

- `blog/index.html`이 카드형 블로그 홈으로 동작한다.
- `blog/hongdae-claw-tour.html`이 개별 글 페이지로 동작한다.
- 블로그 홈과 글 페이지에 좌측 프로필/카테고리, 중앙 콘텐츠, 우측 광고가 있다.
- 글 페이지 본문에 광고 3개가 자연스럽게 삽입된다.
- 모바일에서 한 열 구조로 자연스럽게 접힌다.
- `search/`와 별도 자산 구조를 유지한다.
- `title`, `description`, `og:image`, `canonical` 등 기본 메타가 들어간다.
- 첫 글이 롱테일 키워드 중심 제목, 결론형 도입, FAQ 구조를 갖는다.
