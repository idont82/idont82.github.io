# HANA Autumn Facebook Pair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish two verified HANA-led autumn product carousels to the Gold Pick Facebook Page from `main`.

**Architecture:** A tracked JSON file defines the two three-slide posts. Existing Python card rendering and Facebook Graph client code generate and publish the carousels; a local token file supplies credentials without entering Git.

**Tech Stack:** JSON, Node.js test runner, Python/Pillow renderer, Meta Graph API, built-in image generation.

---

### Task 1: Lock the post contract

**Files:**
- Create: `tests/facebook-hana-autumn-posts.test.js`
- Create: `data/facebook-hana-autumn-posts.json`

- [ ] **Step 1: Write a failing contract test**

Assert exactly two IDs, exact first-line tracked URLs, three ordered `lifestyle-hybrid` roles, AI disclosure, affiliate disclosure, valid local HANA scene paths, verified Coupang image hosts, and no publication fields before posting.

- [ ] **Step 2: Run the test and confirm the fixture is missing**

Run: `node --test tests/facebook-hana-autumn-posts.test.js`

Expected: FAIL because `data/facebook-hana-autumn-posts.json` does not exist.

- [ ] **Step 3: Add the two post definitions**

Use IDs `20260826-hana-autumn-windbreaker` and `20260826-hana-autumn-trekking`. Use the product names, images, and price bands in `data/coupang-autumn-windbreaker.json` and `data/coupang-autumn-trekking.json`.

- [ ] **Step 4: Run the contract test**

Run: `node --test tests/facebook-hana-autumn-posts.test.js`

Expected: 2 or more assertions pass with zero failures.

### Task 2: Produce the HANA autumn scenes

**Files:**
- Create: `images/facebook-fictional-model/hana-autumn-windbreaker-scene.png`
- Create: `images/facebook-fictional-model/hana-autumn-trekking-scene.png`

- [ ] **Step 1: Inspect the existing HANA reference**

Open `images/facebook-fictional-model/hana-reference.png` and preserve the established fictional adult identity.

- [ ] **Step 2: Generate the windbreaker scene**

Create a portrait editorial photo of HANA in a lightweight neutral windbreaker in an autumn urban park. No text, logos, or watermark.

- [ ] **Step 3: Generate the trekking scene**

Create a portrait editorial photo of HANA in practical autumn hiking attire on a gentle woodland trail, with the shoes visible. No text, logos, or watermark.

- [ ] **Step 4: Inspect both images**

Verify adult appearance, consistent identity, safe composition, seasonal relevance, and unobstructed card-safe lower composition.

### Task 3: Render and verify six cards

**Files:**
- Read: `data/facebook-hana-autumn-posts.json`
- Output: `.facebook-artifacts/hana-autumn-windbreaker/`
- Output: `.facebook-artifacts/hana-autumn-trekking/`

- [ ] **Step 1: Run contract and renderer tests**

Run: `node --test tests/facebook-hana-autumn-posts.test.js tests/facebook-card-renderer.test.js tests/facebook-graph-api.test.js`

Expected: zero failures.

- [ ] **Step 2: Render both JSON slide sets**

Run the existing `scripts/generate-facebook-cards.py` once per post and produce `01.png`, `02.png`, `03.png`, and `manifest.json`.

- [ ] **Step 3: Review both contact sheets**

Check text fit, product visibility, AI disclosure, 44-pixel edge safety, and distinct visual roles.

### Task 4: Publish and prove the live result

**Files:**
- Read: `.facebook-artifacts/meta.env`
- Modify: `data/facebook-hana-autumn-posts.json`
- Create: `.facebook-artifacts/hana-autumn-publication.json`

- [ ] **Step 1: Validate credentials without printing secrets**

Load page ID, token, and Graph version from `.facebook-artifacts/meta.env`; only print whether required values exist.

- [ ] **Step 2: Publish one carousel at a time**

For each post, first search the recent Page feed for its exact first-line URL. Reuse an existing match or publish three unpublished photos followed by one feed post.

- [ ] **Step 3: Read both posts back**

Verify two distinct post IDs, exact first-line tracked URLs, three attached photos each, and non-empty permalinks.

- [ ] **Step 4: Persist sanitized confirmation**

Store post ID, permalink, publication time, and verification count without tokens. Update the tracked JSON publication fields.

- [ ] **Step 5: Run final verification**

Run: `node --test tests/facebook-hana-autumn-posts.test.js tests/facebook-card-renderer.test.js tests/facebook-graph-api.test.js`

Expected: zero failures and a clean diff for only the planned files.

