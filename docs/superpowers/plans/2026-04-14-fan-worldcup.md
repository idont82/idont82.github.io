# Fan World Cup Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fan recommendation page that combines search-friendly buying guidance with an 8-player tournament-style chooser and a full list of 10+ candidate products.

**Architecture:** Reuse the homepage card grid and shared `search` article styling. Build one new static page with inline JavaScript to manage tournament rounds, winner display, and candidate data rendering.

**Tech Stack:** Static HTML, shared CSS from `/search/assets/style.css`, inline CSS, vanilla JavaScript.

---

### Task 1: Inspect reusable patterns

**Files:**
- Modify: `index.html`
- Reference: `search/xiaomi-vs-dyson-cordless-vacuum.html`

- [ ] **Step 1: Read the homepage card grid insertion point**
Run: `rg -n "category-grid|category-card" index.html`
Expected: existing card grid block and surrounding cards.

- [ ] **Step 2: Read the current interactive comparison page pattern**
Run: `Get-Content -Path 'search\\xiaomi-vs-dyson-cordless-vacuum.html'`
Expected: static article layout plus inline CSS and JavaScript sections.

### Task 2: Add a homepage card for the fan page

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add a new card linking to `/search/fan-worldcup.html`**
- [ ] **Step 2: Use a title that communicates both recommendation and tournament play**
- [ ] **Step 3: Mention value, wind power, low noise, and cordless convenience in the card copy**
- [ ] **Step 4: Verify with `rg -n "fan-worldcup|선풍기" index.html`**

### Task 3: Create the search-friendly page shell

**Files:**
- Create: `search/fan-worldcup.html`

- [ ] **Step 1: Add metadata, canonical URL, Open Graph tags, and shared stylesheet**
- [ ] **Step 2: Add `Article`, `BreadcrumbList`, and `FAQPage` structured data**
- [ ] **Step 3: Add article header, intro, and fan buying criteria section**
- [ ] **Step 4: Verify headings and metadata with `rg -n "선풍기 추천 월드컵|BLDC|무선 선풍기|FAQPage|Article" search\\fan-worldcup.html`**

### Task 4: Implement the 8-player tournament widget

**Files:**
- Modify: `search/fan-worldcup.html`

- [ ] **Step 1: Define inline JavaScript candidate data for at least 10 products**
- [ ] **Step 2: Select 8 of them for the active bracket and render two cards per round**
- [ ] **Step 3: Show round status (`8강`, `4강`, `결승`) and handle clicks to advance winners**
- [ ] **Step 4: Render a winner state with image, reason summary, buy link, and restart button**
- [ ] **Step 5: Verify all interaction labels exist with `rg -n "8강|4강|결승|다시 하기|우승" search\\fan-worldcup.html`**

### Task 5: Add the 10+ candidate list and buying guide content

**Files:**
- Modify: `search/fan-worldcup.html`

- [ ] **Step 1: Render a full HTML list of 10+ candidate products under the widget**
- [ ] **Step 2: Add short explanatory text around value, wind strength, noise, and cordless convenience**
- [ ] **Step 3: Add FAQ entries for BLDC fans, cordless fans, and room-size fit**
- [ ] **Step 4: Ensure the list content is visible in HTML for SEO, not JS-only text generation**

### Task 6: Add responsive styling and verification

**Files:**
- Modify: `search/fan-worldcup.html`
- Verify: `index.html`

- [ ] **Step 1: Add responsive CSS for duel cards, winner block, and candidate list**
- [ ] **Step 2: Start the local server with `node server.js`**
- [ ] **Step 3: Manually verify homepage card, tournament flow, winner output, and mobile readability**
- [ ] **Step 4: Review diff before finalizing**
