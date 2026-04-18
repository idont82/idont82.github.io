# 메인 페이지 및 구조화 데이터 콘텐츠 업데이트 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 브랜드 컨셉 고도화를 위해 메인 페이지(index.html)의 히어로 섹션 문구를 수정하고, claw-machine-guide.html의 브랜드명 일관성을 재확인합니다.

**Architecture:** HTML 파일 내의 텍스트 콘텐츠 및 JSON-LD 메타데이터 수정.

**Tech Stack:** HTML, JSON-LD

---

### Task 1: 메인 페이지(index.html) 히어로 섹션 업데이트

**Files:**
- Modify: `D:\scrab\workspace\claw\index.html`

- [ ] **Step 1: 히어로 타이틀 및 설명 수정**

```html
<<<<
  <section class="hero">
    <h1>똑똑한 소비의 시작, TOP 3 가이드</h1>
    <p>수많은 상품 중 무엇을 살지 고민되시나요? 실제 성능, 가격, 리뷰를 바탕으로 카테고리별 가장 합리적인 제품 3가지만 딱 골라드립니다.</p>
  </section>
====
  <section class="hero">
    <h1>가성비의 정점, 황금 가성비 골드픽</h1>
    <p>넘쳐나는 광고 속에서 진짜 보석을 찾아드립니다. 성능과 가격을 정밀 분석하여 엄선한 황금 가성비 아이템들을 확인하세요.</p>
  </section>
>>>>
```

- [ ] **Step 2: 변경 사항 확인**

파일을 열어 문구가 정확히 반영되었는지 확인합니다.

---

### Task 2: claw-machine-guide.html 브랜드명 재확인 및 수정

**Files:**
- Modify: `D:\scrab\workspace\claw\claw-machine-guide.html`

- [ ] **Step 1: 구조화 데이터(isPartOf) 확인 및 수정**

`isPartOf` 내의 `name`이 `스마트 쇼핑 큐레이션`이라면 `황금 가성비 골드픽`으로 수정합니다.

- [ ] **Step 2: 본문 내 사이트 소개 문구 확인 및 수정**

`스마트 쇼핑 큐레이션`이라는 문구가 남아있다면 `황금 가성비 골드픽`으로 수정합니다.

---

### Task 3: 작업 완료 및 커밋

- [ ] **Step 1: 변경 사항 스테이징**

```bash
git add index.html claw-machine-guide.html
```

- [ ] **Step 2: 커밋 수행**

```bash
git commit -m "content: update branding copy and JSON-LD metadata"
```
