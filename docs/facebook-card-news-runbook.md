# Facebook 카드뉴스 운영 가이드

이 자동화는 하루에 큐 항목 하나만 처리한다. 운영 페이지에 연결하기 전에 별도의 Facebook 테스트 페이지에서 게시·복구·중복 방지를 확인한다.

## 1. Meta 사전 설정

1. Facebook 페이지와 별도의 테스트 페이지를 만든다.
2. Meta 개발자 앱에서 Facebook Login과 Pages API를 설정한다.
3. `pages_show_list`, `pages_manage_posts`, `pages_read_engagement`, `read_insights` 권한을 확인한다.
4. 공식 OAuth 흐름으로 페이지 액세스 토큰을 발급한다. 토큰은 파일, 명령 인수, Actions 로그에 넣지 않는다.
5. Actions secrets에 `META_PAGE_ID`, `META_PAGE_ACCESS_TOKEN`을 등록한다.
6. Actions variable `META_GRAPH_VERSION`에 현재 지원되는 Graph API 버전을 등록한다.

## 2. 큐와 짧은 링크 관리

새 큐 항목에는 사용하지 않은 양의 정수 `shortLinkId`와 검수된 `cardCopy` 세 문구를 넣는다. 문구 하나는 28자 이하, 최대 두 줄이어야 한다.

큐를 변경한 뒤 허용 목록을 다시 생성한다.

```powershell
node scripts/build-facebook-short-links.js
node --test tests/facebook-short-links.test.js
```

`g/redirect.js`는 큐에 등록된 목적지만 허용한다. URL 파라미터를 목적지로 직접 사용하거나 임의 URL을 추가하지 않는다.

## 3. 드라이런 확인

```powershell
node --use-system-ca scripts/publish-facebook-posts.js --dry-run --now 2026-08-30T00:00:00Z
```

생성 폴더의 `01.png`부터 `03.png`까지 확인한다.

- 세 장 모두 상품 사진이 화면 전체에 보이는지 확인한다.
- 중앙 반투명 검정 띠와 큰 문구가 읽히는지 확인한다.
- 문구는 최대 두 줄이고 이미지 안에 URL이나 긴 설명이 없어야 한다.
- 게시글에는 `https://idont82.github.io/g/?n=번호`가 한 번만 표시되어야 한다.
- 쿠팡 파트너스 제휴 고지가 게시글에 포함되어야 한다.

드라이런은 Meta 자격증명을 요구하지 않고 큐 상태를 바꾸지 않는다. GitHub Actions의 `Facebook card news` 워크플로도 `dry_run=true`로 실행해 `facebook-card-news-preview` 아티팩트의 세 장을 확인할 수 있다.

## 4. 테스트 페이지 게시 검증

1. `META_PAGE_ID`를 테스트 페이지 ID로 설정하고 `dry_run=false`로 한 번 실행한다.
2. Facebook 모바일 앱과 브라우저에서 세 장의 순서, 글자, 사진 크롭을 확인한다.
3. 게시글의 짧은 링크를 눌러 블로그 모드는 UTM이 붙은 블로그로, 직접 모드는 `subid`가 붙은 쿠팡 링크로 이동하는지 확인한다.
4. 동일 항목을 재실행해 짧은 링크를 찾고 중복 게시물이 생기지 않는지 확인한다.
5. 모든 확인이 끝난 뒤에만 운영 페이지 ID로 전환하고 예약 실행을 활성화한다.

실제 페이지 게시 성공 전에는 큐의 `facebookPostId`, `facebookPermalink`, `publishedAt`을 임의로 채우지 않는다.

## 5. 실패 복구

큐 항목이 `failed`가 되면 다음 순서로 복구한다.

1. 해당 항목의 `lastError`를 확인한다.
2. 만료 토큰, 권한, 콘텐츠 또는 렌더링 문제를 수정한다.
3. 해당 항목의 `status`만 `failed`에서 `queued`로 바꾼다.
4. `attempts`와 `trackingId`는 초기화하지 않는다.
5. 워크플로를 수동 실행한다. 게시 도중 중단됐다면 짧은 링크를 조회해 기존 게시물을 복구하고 재업로드하지 않는다.

`failed` 항목이 하나라도 있으면 뒤의 큐는 진행되지 않는다.

## 6. 성과와 보안

자동 수집 지표는 `data/facebook-post-insights.json`에 저장된다. 쿠팡 주문·매출은 파트너스 사이트에서 수동 비교하며 세션 쿠키나 로그인 정보를 자동화에 저장하지 않는다.

토큰은 Git에 커밋하지 않는다. 노출이 의심되면 Meta에서 즉시 폐기·재발급하고 Actions secret을 교체한다.
