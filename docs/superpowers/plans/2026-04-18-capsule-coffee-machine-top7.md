# 내 머신에 딱! 머신별 호환 캡슐커피 TOP 7 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 네스프레소, 버츄오, 돌체구스토, 일리 등 주요 머신별 최적의 캡슐 7종을 제안하는 고퀄리티 구매 가이드 페이지 제작.

**Architecture:** 기존 가성비 가이드 템플릿을 기반으로 하되, 상단에 이미지가 강조된 '카드형 요약 비교 섹션'을 새롭게 도입하여 비주얼 중심의 UI 구성.

**Tech Stack:** HTML5, Vanilla CSS, JS (Navigation/Smooth Scroll)

---

### Task 1: 기본 HTML 구조 및 메타데이터 설정

**Files:**
- Create: `search/capsule-coffee-machine-top7.html`

- [ ] **Step 1: HTML5 기본 템플릿 작성 및 SEO 메타 태그 설정**
- [ ] **Step 2: 외부 스타일시트 (`/search/assets/style.css`) 연결**
- [ ] **Step 3: 커밋**
```bash
git add search/capsule-coffee-machine-top7.html
git commit -m "feat: setup basic structure for capsule coffee machine guide"
```

### Task 2: 카드형 요약 비교 섹션 (Visual Summary) 구현

**Files:**
- Modify: `search/capsule-coffee-machine-top7.html`

- [ ] **Step 1: 상단 헤더 아래에 7개 카드가 포함된 그리드 섹션 추가**
- [ ] **Step 2: 각 카드에 제품 이미지(Placeholders), 머신 호환 배지, 짧은 요약 텍스트 포함**
- [ ] **Step 3: 카드 클릭 시 본문 상세 섹션으로 이동하는 앵커 링크 설정**
- [ ] **Step 4: 커밋**
```bash
git commit -m "feat: add visual card summary section for 7 products"
```

### Task 3: 7개 제품 상세 리뷰 섹션 구현

**Files:**
- Modify: `search/capsule-coffee-machine-top7.html`

- [ ] **Step 1: 네스프레소 오리지널 3종 상세 내용 작성 (스타벅스, 일리, 던킨)**
- [ ] **Step 2: 네스프레소 버츄오 1종 상세 내용 작성 (정품)**
- [ ] **Step 3: 돌체구스토 2종 및 일리 전용 1종 상세 내용 작성**
- [ ] **Step 4: 각 제품별 강도, 산미, 바디감 지표 시각화(CSS Bar 활용)**
- [ ] **Step 5: 쿠팡 파트너스 기본 링크 및 버튼 적용**
- [ ] **Step 6: 커밋**
```bash
git commit -m "feat: implement detailed review sections for all 7 products"
```

### Task 4: UI 스타일링 및 반응형 최적화

**Files:**
- Modify: `search/assets/style.css` (필요 시 인라인 `<style>`로 추가 후 통합)

- [ ] **Step 1: 카드형 섹션의 그리드 레이아웃 설정 (모바일 2열, PC 4열 등)**
- [ ] **Step 2: 이미지 위 배지 오버레이 및 호버 효과 추가**
- [ ] **Step 3: 모바일 가독성을 위한 폰트 크기 및 여백 조정**
- [ ] **Step 4: 커밋**
```bash
git commit -m "style: optimize card grid and responsive layout"
```

### Task 5: 내비게이션 및 사이트 연결

**Files:**
- Modify: `search/index.html`
- Modify: `sitemap.xml`

- [ ] **Step 1: `search/index.html`의 포스트 리스트 14번째에 새 가이드 링크 추가**
- [ ] **Step 2: `sitemap.xml`에 새 페이지 URL 등록**
- [ ] **Step 3: 최종 브라우저 테스트 및 링크 작동 확인**
- [ ] **Step 4: 커밋**
```bash
git add search/index.html sitemap.xml
git commit -m "feat: update navigation and sitemap for new guide"
```
