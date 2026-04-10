# Navigation Link Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update navigation links in all HTML files within the `search/` directory to point to the site root (`/`) instead of `/search/` or `index.html`, and rename "전체 글" to "홈".

**Architecture:** Use batch text replacement across all HTML files in the `search/` directory.

**Tech Stack:** Vanilla HTML, Bash/PowerShell.

---

### Task 1: Research and Prepare
- [x] **Step 1: Identify all target files** (Completed: all `.html` files in `search/`)
- [x] **Step 2: Verify existing patterns** (Completed: found `<a href="/search/">전체 글</a>` in multiple files)

### Task 2: Perform Replacements
**Files:**
- `search/aa-batteries-budget-top3.html`
- `search/air-purifier-budget-top3.html`
- `search/capsule-detergent-budget-top3.html`
- `search/coffee-mix-budget-top3.html`
- `search/diapers-budget-top3.html`
- `search/multivitamin-budget-top3.html`
- `search/power-bank-budget-top3.html`
- `search/robot-vacuum-budget-top3.html`
- `search/wireless-earbuds-budget-top3.html`
- `search/wireless-earbuds-top3.html`
- `search/index.html`
- `search/template.html`

- [ ] **Step 1: Replace `<a href="/search/">전체 글</a>` with `<a href="/">홈</a>`**
- [ ] **Step 2: Replace `<a href="index.html" class="back-link">` with `<a href="/" class="back-link">` (if exists)**
- [ ] **Step 3: Check for any other navigation links to `/search/` or `index.html` and update to `/`**

### Task 3: Validation
- [ ] **Step 1: Verify replacements with grep**
- [ ] **Step 2: Check one or two files manually to ensure correct formatting**
