# 장원영 글 상단 이미지 쿠팡 링크 설계

## 목적

`blog/wonyoung-eider-sheer-jacket-guide.html`의 본문 상단 첫 번째 상품 이미지를 클릭하면 현재 글에서 소개하는 동일한 쿠팡 파트너스 상품으로 이동하게 한다. URL에 Facebook UTM 파라미터가 있거나 없어도 동일하게 동작한다.

## 동작

- `article-hero` 안의 첫 번째 `img`만 링크 영역으로 만든다.
- 링크 목적지는 기존 제품 카드가 사용하는 쿠팡 파트너스 URL과 정확히 같게 유지한다.
- 새 탭에서 열고 `rel="sponsored nofollow"`, `referrerpolicy="unsafe-url"`을 적용한다.
- 기존 클릭 추적기가 인식하도록 `data-coupang-link`를 추가한다.
- 위치 분석을 위해 `data-coupang-placement="article_hero"`를 사용한다.
- `data-coupang-product-type`은 기존 페이지의 `celebrity_wonyoung_eider_dwm26154`를 사용한다.
- `figcaption`은 링크 바깥에 두어 이미지 클릭만 쿠팡 이동으로 처리한다.

## 유지보수

완성 HTML만 직접 수정하지 않고 `scripts/generate-female-celebrity-outfit-guides.js`의 템플릿도 함께 변경한다. 이후 페이지를 재생성해도 링크가 유지되어야 한다.

## 검증

- 테스트는 장원영 글의 첫 `article-hero` 이미지가 쿠팡 앵커 안에 있는지 확인한다.
- 앵커의 URL이 기존 제품 카드 URL과 같은지 확인한다.
- 새 탭, 제휴 관계, 클릭 추적 위치와 제품 유형 속성을 확인한다.
- 생성기에도 같은 속성 문자열이 존재하는지 확인한다.
- 기존 여성 연예인 상품 가이드 테스트와 쿠팡 클릭 추적 테스트를 실행한다.

## 제외 범위

- 이미지나 글 문구는 변경하지 않는다.
- 다른 여성 연예인 글에는 이번 변경을 자동 적용하지 않는다.
- Facebook 카드뉴스 발행 로직과 짧은 링크는 변경하지 않는다.
