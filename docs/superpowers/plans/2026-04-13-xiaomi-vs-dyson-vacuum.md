# Xiaomi vs Dyson Vacuum Comparison Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new homepage card and a dedicated Xiaomi-vs-Dyson cordless vacuum comparison page with a balanced checkbox-based recommendation widget.

**Architecture:** Reuse the existing homepage card grid and search article pattern. Build one new static article page with small inline JavaScript to score checkbox selections and render Xiaomi, Dyson, or neutral guidance.

**Tech Stack:** Static HTML, shared CSS from `/search/assets/style.css`, inline CSS, vanilla JavaScript.

---

### Task 1: Inspect existing homepage and article patterns

**Files:**
- Modify: `index.html`
- Reference: `search/robot-vacuum-budget-top3.html`

- [ ] **Step 1: Read the homepage card area and locate the insertion point**
Run: `rg -n "category-grid|category-card|robot-vacuum" index.html`
Expected: matching lines showing the existing card grid and a nearby product card block.

- [ ] **Step 2: Read the comparison article pattern to mirror header and section order**
Run: `Get-Content -Path 'search\\robot-vacuum-budget-top3.html'`
Expected: a full static article with shared stylesheet, disclosure block, header, body sections, and footer.

- [ ] **Step 3: Confirm the new page slug does not already exist**
Run: `Test-Path 'search\\xiaomi-vs-dyson-cordless-vacuum.html'`
Expected: `False`

### Task 2: Add the homepage card

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add a new card inside `.category-grid` linking to `/search/xiaomi-vs-dyson-cordless-vacuum.html`**
- [ ] **Step 2: Use the title `샤오미 vs 다이슨 — 무선청소기 뭐가 나을까?`**
- [ ] **Step 3: Use copy that highlights budget, weight, feel, and maintenance tradeoffs**
- [ ] **Step 4: Verify the new slug appears in `index.html` with `rg -n "xiaomi-vs-dyson|샤오미 vs 다이슨" index.html`**

### Task 3: Create the comparison page shell

**Files:**
- Create: `search/xiaomi-vs-dyson-cordless-vacuum.html`

- [ ] **Step 1: Add head metadata, canonical URL, shared stylesheet, header, footer, and article header**
- [ ] **Step 2: Add a short intro that frames Xiaomi as value-oriented and Dyson as premium-feel oriented**
- [ ] **Step 3: Add sections for recommendation widget, comparison table, Xiaomi-fit guidance, Dyson-fit guidance, and FAQ**
- [ ] **Step 4: Verify key headings with `rg -n "내게 맞는 쪽 찾기|핵심 비교표|누구에게 샤오미|누구에게 다이슨|자주 묻는 질문" search\\xiaomi-vs-dyson-cordless-vacuum.html`**

### Task 4: Implement the checkbox recommendation widget

**Files:**
- Modify: `search/xiaomi-vs-dyson-cordless-vacuum.html`

- [ ] **Step 1: Add 5-7 checkbox options covering budget, weight, premium feel, AS familiarity, runtime, and maintenance convenience**
- [ ] **Step 2: Add a result box with an initial helper message**
- [ ] **Step 3: Add inline JavaScript that totals Xiaomi and Dyson scores from `data-*` attributes**
- [ ] **Step 4: Render three result states: Xiaomi recommendation, Dyson recommendation, and neutral guidance**
- [ ] **Step 5: Verify all result strings exist with `rg -n "샤오미|다이슨|중립|조건을 고르지" search\\xiaomi-vs-dyson-cordless-vacuum.html`**

### Task 5: Add comparison content and responsive styling

**Files:**
- Modify: `search/xiaomi-vs-dyson-cordless-vacuum.html`

- [ ] **Step 1: Add a two-column comparison table for price burden, weight feel, brand feel, and maintenance convenience**
- [ ] **Step 2: Add short buyer-guidance paragraphs for Xiaomi-fit and Dyson-fit use cases**
- [ ] **Step 3: Add at least three FAQ entries around value, weight feel, and maintenance**
- [ ] **Step 4: Add minimal inline styles so the widget and table stay readable on mobile widths**

### Task 6: Verify final output

**Files:**
- Verify: `index.html`
- Verify: `search/xiaomi-vs-dyson-cordless-vacuum.html`

- [ ] **Step 1: Confirm both files reference the new slug with `rg -n "xiaomi-vs-dyson-cordless-vacuum" index.html search\\xiaomi-vs-dyson-cordless-vacuum.html`**
- [ ] **Step 2: Start the local server with `node server.js`**
- [ ] **Step 3: Manually verify the homepage card, widget state changes, and narrow-width readability**
- [ ] **Step 4: Review the diff before finalizing**
