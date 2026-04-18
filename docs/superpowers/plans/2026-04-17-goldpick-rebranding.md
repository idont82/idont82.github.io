# '황금 가성비 골드픽' 리브랜딩 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 '스마트 쇼핑 큐레이션' 브랜드를 '황금 가성비 골드픽'으로 전면 교체하고 시각적 테마를 골드 톤으로 업데이트합니다.

**Architecture:** CSS 변수 수정, HTML 메타 태그 및 텍스트 일괄 치환, JSON-LD 구조화 데이터 업데이트를 포함합니다.

**Tech Stack:** HTML5, Vanilla CSS

---

### Task 1: 전역 스타일 업데이트 (골드 테마 적용)

**Files:**
- Modify: `search/assets/style.css`
- Modify: `index.html`

- [ ] **Step 1: CSS 변수 수정 (`search/assets/style.css`)**
  - `--accent` 변수를 `#2563eb`에서 `#d4a017`로 변경합니다.

- [ ] **Step 2: 메인 페이지 내부 스타일 수정 (`index.html`)**
  - `<style>` 태그 내의 `#007bff` 색상을 `#d4a017`로 변경합니다.

- [ ] **Step 3: 시각적 확인 (검수)**
  - 브라우저에서 버튼 및 링크 색상이 골드 톤으로 바뀌었는지 확인합니다.

- [ ] **Step 4: Commit**
  ```bash
  git add search/assets/style.css index.html
  git commit -m "style: update theme color to gold (#d4a017)"
  ```

### Task 2: 파비콘 및 기본 메타 정보 업데이트

**Files:**
- Modify: `index.html`
- Modify: `search/*.html` (전체 파일)
- Modify: `claw-machine-guide.html`

- [ ] **Step 1: 파비콘 이모지 교체**
  - `🛒`을 `🏆`로 일괄 치환합니다. (단, `🎮`, `🕹️`는 유지)

- [ ] **Step 2: 사이트 이름 메타 태그 업데이트**
  - `스마트 쇼핑 큐레이션`을 `황금 가성비 골드픽`으로 일괄 치환합니다. 대상: `<title>`, `og:site_name`, `og:title` 등.

- [ ] **Step 3: Commit**
  ```bash
  git add index.html search/*.html claw-machine-guide.html
  git commit -m "feat: update favicon to trophy and site name to Gold Pick"
  ```

### Task 3: 메인 페이지 및 구조화 데이터 콘텐츠 업데이트

**Files:**
- Modify: `index.html`
- Modify: `claw-machine-guide.html`
- Modify: `search/*.html`

- [ ] **Step 1: 메인 히어로 섹션 문구 수정 (`index.html`)**
  - `<h1>똑똑한 소비의 시작, TOP 3 가이드</h1>` -> `<h1>가성비의 정점, 황금 가성비 골드픽</h1>`
  - `<p>` 설명 문구를 브랜드 컨셉에 맞춰 보강합니다.

- [ ] **Step 2: 구조화 데이터(JSON-LD) 업데이트**
  - `isPartOf` 내의 `name` 필드를 `황금 가성비 골드픽`으로 수정합니다.

- [ ] **Step 3: 푸터 및 기타 텍스트 업데이트**
  - 페이지 하단 저작권 표시 및 소개 문구의 명칭을 변경합니다.

- [ ] **Step 4: Commit**
  ```bash
  git add index.html search/*.html claw-machine-guide.html
  git commit -m "content: update branding copy and JSON-LD metadata"
  ```

### Task 4: 최종 검수 및 정리

- [ ] **Step 1: 전체 검색을 통한 누락 확인**
  - `grep`을 사용하여 `스마트 쇼핑 큐레이션`이나 `#007bff`가 남아있는지 확인합니다.

- [ ] **Step 2: 최종 Commit 및 문서 정리**
  ```bash
  git commit -m "docs: complete goldpick rebranding"
  ```
