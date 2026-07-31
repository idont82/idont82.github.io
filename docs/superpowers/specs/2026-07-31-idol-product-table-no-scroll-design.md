# 아이돌 상품 비교표 가로 스크롤 제거 디자인

## 문제

`idol-product-table`에 `min-width: 680px`가 설정되고 바깥 요소에 `overflow-x: auto`가 적용되어 모바일 화면에서 가로 스크롤이 강제로 생긴다.

## 수정 방식

- 표의 `min-width: 680px`를 제거한다.
- 바깥 요소의 `overflow-x`를 `visible`로 바꾼다.
- 표에 `table-layout: fixed`와 `max-width: 100%`를 적용한다.
- 검색 순서, 구분, 가격 열은 좁은 고정 비율을 사용하고 상품명 열에 가장 넓은 공간을 배분한다.
- 긴 상품명은 `overflow-wrap: anywhere`와 `word-break: keep-all`로 셀 안에서 줄바꿈한다.
- 모바일에서는 셀 패딩과 글자 크기를 줄이되 네 열과 모든 정보를 그대로 표시한다.
- 생성기에서 CSS를 관리하고 다섯 페이지를 다시 생성한다.

## 검증

- 생성된 페이지에 `min-width: 680px`와 `overflow-x: auto`가 없어야 한다.
- `table-layout: fixed`, `max-width: 100%`, 긴 문자열 줄바꿈 규칙이 있어야 한다.
- 기존 SEO, 팬 문체, 상품 링크와 발견성 테스트가 계속 통과해야 한다.
