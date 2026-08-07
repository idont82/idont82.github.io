# Facebook 카드뉴스 운영 가이드

이 자동화는 하루에 큐 항목 하나만 처리한다. 운영 페이지에 연결하기 전에 별도의 Facebook 테스트 페이지에서 게시·복구·중복 방지를 모두 확인한다.

## 1. Meta 사전 설정

1. Facebook 페이지와 별도의 Facebook 테스트 페이지를 직접 만든다.
2. Meta 개발자 앱을 만들고 Facebook Login과 Pages API를 설정한다.
3. 앱 대시보드에서 다음 권한이 현재도 제공되는지 확인한 뒤 OAuth와 앱 검수 범위를 정한다.
   - `pages_show_list`
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `read_insights`
4. 공식 OAuth 흐름으로 페이지 액세스 토큰을 발급한다. 토큰은 저장소 파일, 터미널 명령 인수, Actions 로그에 붙여 넣지 않는다.
5. 저장소의 Actions secrets에 `META_PAGE_ID`, `META_PAGE_ACCESS_TOKEN`을 등록한다.
6. Actions variable `META_GRAPH_VERSION`을 등록한다. 최초 후보는 `v25.0`이지만 예약 게시를 활성화하기 직전에 Meta 앱 대시보드에서 현재 지원 버전을 확인한다. 이 변수는 실제 게시에서 필수다.

운영 권한 또는 앱 검수에 사업 인증이 요구되는지는 앱 유형, 권한, 사용 대상에 따라 달라질 수 있다. Meta 대시보드에 표시되는 현재 요구사항을 기준으로 처리하고, 검수 전에는 앱 역할이 부여된 계정과 테스트 페이지에서만 확인한다.

## 2. 드라이런 확인

로컬 저장소 루트에서 다음 명령을 실행한다.

```powershell
node scripts/publish-facebook-posts.js --dry-run --now 2026-08-30T00:00:00Z
```

`.facebook-artifacts/20260810-seasonal-neck-fan/`의 `01.png`부터 `05.png`까지 확인한다. 이미지 순서, 한글 줄바꿈, 상품 이미지, 제휴 고지, 링크가 올바른지 검토한다. 드라이런은 Meta 자격증명을 요구하지 않고 큐 상태를 바꾸지 않는다.

GitHub Actions의 `Facebook card news` 워크플로를 `dry_run=true`로 수동 실행한다. 완료 후 `facebook-card-news-preview` 아티팩트를 내려받아 카드 다섯 장을 다시 확인한다.

## 3. 테스트 페이지 게시 게이트

1. `META_PAGE_ID`를 테스트 페이지 ID로 지정하고 `dry_run=false`로 워크플로를 한 번 실행한다.
2. Facebook 모바일 앱과 모바일 브라우저에서 이미지 순서, 한글 표시, 제휴 고지, 클릭 가능한 링크를 확인한다.
3. 링크가 블로그 모드에서는 UTM이 포함된 블로그로, 직접 모드에서는 `subid`가 포함된 쿠팡 링크로 연결되는지 확인한다.
4. 동일 항목을 다시 실행해 기존 추적 ID를 찾고 중복 게시물이 생성되지 않는지 확인한다.
5. 복구 동작을 확인한 뒤에만 테스트한 큐 항목을 초기화한다. 운영 페이지로 전환하기 전 `META_PAGE_ID` secret을 운영 페이지 ID로 교체한다.
6. 위 체크리스트가 모두 통과한 뒤에만 예약 실행을 활성화한다.

실제 페이지 게시 성공 전에는 큐의 `facebookPostId`, `facebookPermalink`, `publishedAt`을 임의로 채우지 않는다.

## 4. 실패 복구

큐 항목이 `failed`가 되면 다음 순서로 복구한다.

1. 해당 항목의 `lastError`를 확인한다.
2. 만료된 토큰, 권한, 콘텐츠 또는 렌더링 문제를 바로잡는다.
3. 그 항목의 `status`만 `failed`에서 `queued`로 변경한다.
4. `attempts`와 `trackingId`는 초기화하지 않는다.
5. 워크플로를 수동 실행한다. 게시 도중 중단됐다면 최근 페이지 게시물의 추적 ID를 조회해 기존 게시물을 복구하고 재업로드하지 않는다.

`failed` 항목이 하나라도 있으면 뒤의 큐는 진행하지 않는다. 원인을 확인하지 않은 채 여러 항목을 일괄 초기화하지 않는다.

## 5. 성과 확인과 보안

자동 수집 지표는 `data/facebook-post-insights.json`에 저장된다. Meta가 지원하지 않는 지표는 `unsupportedMetrics`에 남고 나머지 지표 수집은 계속된다.

쿠팡 파트너스 주문·매출 성과는 공개 제휴 리포트 API가 확인되지 않은 경우 파트너스 포털에서 수동 비교한다. 포털을 스크래핑하거나 로그인 쿠키를 자동화에 저장하지 않는다.

토큰을 Git에 커밋하지 않는다. 토큰이 노출됐다고 의심되면 즉시 Meta에서 폐기·재발급하고 Actions secret을 교체한다.
