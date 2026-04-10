# Add Unique SVG Emoji Favicons to Search Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a unique SVG emoji favicon to each HTML file in the `search/` directory based on its topic.

**Architecture:** Each HTML file in `search/` will have a `<link rel="icon" ...>` tag inserted after its `<link rel="canonical" ...>` tag. The icon will be an inline SVG data URI containing a specific emoji.

**Tech Stack:** HTML5, SVG

---

### Task 1: Add Favicon to AA Batteries Page

**Files:**
- Modify: `search/aa-batteries-budget-top3.html`

- [ ] **Step 1: Insert favicon after canonical link**

Old string:
```html
<link rel="canonical" href="https://idont82.github.io/search/aa-batteries-budget-top3.html">
```

New string:
```html
<link rel="canonical" href="https://idont82.github.io/search/aa-batteries-budget-top3.html">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔋</text></svg>">
```

### Task 2: Add Favicon to Air Purifier Page

**Files:**
- Modify: `search/air-purifier-budget-top3.html`

- [ ] **Step 1: Insert favicon after canonical link**

Old string:
```html
<link rel="canonical" href="https://idont82.github.io/search/air-purifier-budget-top3.html">
```

New string:
```html
<link rel="canonical" href="https://idont82.github.io/search/air-purifier-budget-top3.html">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🍃</text></svg>">
```

### Task 3: Add Favicon to Capsule Detergent Page

**Files:**
- Modify: `search/capsule-detergent-budget-top3.html`

- [ ] **Step 1: Insert favicon after canonical link**

Old string:
```html
<link rel="canonical" href="https://idont82.github.io/search/capsule-detergent-budget-top3.html">
```

New string:
```html
<link rel="canonical" href="https://idont82.github.io/search/capsule-detergent-budget-top3.html">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🧺</text></svg>">
```

### Task 4: Add Favicon to Coffee Mix Page

**Files:**
- Modify: `search/coffee-mix-budget-top3.html`

- [ ] **Step 1: Insert favicon after canonical link**

Old string:
```html
<link rel="canonical" href="https://idont82.github.io/search/coffee-mix-budget-top3.html">
```

New string:
```html
<link rel="canonical" href="https://idont82.github.io/search/coffee-mix-budget-top3.html">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>☕</text></svg>">
```

### Task 5: Add Favicon to Diapers Page

**Files:**
- Modify: `search/diapers-budget-top3.html`

- [ ] **Step 1: Insert favicon after canonical link**

Old string:
```html
<link rel="canonical" href="https://idont82.github.io/search/diapers-budget-top3.html">
```

New string:
```html
<link rel="canonical" href="https://idont82.github.io/search/diapers-budget-top3.html">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>👶</text></svg>">
```

### Task 6: Add Favicon to Multivitamin Page

**Files:**
- Modify: `search/multivitamin-budget-top3.html`

- [ ] **Step 1: Insert favicon after canonical link**

Old string:
```html
<link rel="canonical" href="https://idont82.github.io/search/multivitamin-budget-top3.html">
```

New string:
```html
<link rel="canonical" href="https://idont82.github.io/search/multivitamin-budget-top3.html">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💊</text></svg>">
```

### Task 7: Add Favicon to Power Bank Page

**Files:**
- Modify: `search/power-bank-budget-top3.html`

- [ ] **Step 1: Insert favicon after canonical link**

Old string:
```html
<link rel="canonical" href="https://idont82.github.io/search/power-bank-budget-top3.html">
```

New string:
```html
<link rel="canonical" href="https://idont82.github.io/search/power-bank-budget-top3.html">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>">
```

### Task 8: Add Favicon to Robot Vacuum Page

**Files:**
- Modify: `search/robot-vacuum-budget-top3.html`

- [ ] **Step 1: Insert favicon after canonical link**

Old string:
```html
<link rel="canonical" href="https://idont82.github.io/search/robot-vacuum-budget-top3.html">
```

New string:
```html
<link rel="canonical" href="https://idont82.github.io/search/robot-vacuum-budget-top3.html">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🤖</text></svg>">
```

### Task 9: Add Favicon to Wireless Earbuds Budget Page

**Files:**
- Modify: `search/wireless-earbuds-budget-top3.html`

- [ ] **Step 1: Insert favicon after canonical link**

Old string:
```html
<link rel="canonical" href="https://idont82.github.io/search/wireless-earbuds-budget-top3.html">
```

New string:
```html
<link rel="canonical" href="https://idont82.github.io/search/wireless-earbuds-budget-top3.html">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎧</text></svg>">
```

### Task 10: Add Favicon to Wireless Earbuds Top 3 Page

**Files:**
- Modify: `search/wireless-earbuds-top3.html`

- [ ] **Step 1: Insert favicon after canonical link**

Old string:
```html
<link rel="canonical" href="https://idont82.github.io/search/wireless-earbuds-top3.html">
```

New string:
```html
<link rel="canonical" href="https://idont82.github.io/search/wireless-earbuds-top3.html">
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎧</text></svg>">
```
