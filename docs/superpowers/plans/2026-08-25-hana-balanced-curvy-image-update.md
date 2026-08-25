# HANA Balanced Curvy Image Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update HANA's reusable reference and laptop lifestyle scene with a naturally balanced-curvy adult silhouette and a polished moderate V-neck outfit, then rerender the unpublished Facebook pilot for visual approval.

**Architecture:** Use the built-in image generation editor with the committed HANA images as identity and composition references. Replace only the two tracked source PNGs after original-detail inspection, then feed the unchanged pilot JSON through the existing renderer and verify that only the HANA lifestyle card changes.

**Tech Stack:** Built-in `image_gen`, local `view_image`, Python Pillow renderer, Node.js built-in test runner, Git.

---

## Execution Location

Execute on the current `main` checkout because the user explicitly chose it. Preserve every unrelated dirty or staged change, use path-scoped status/add/commit commands, and do not sync, merge, push, publish, or read `.facebook-artifacts/meta.env` as part of this plan. The local branch diverges from `origin/main`, so remote integration remains separate work requiring its own review.

## File Map

- Modify `images/facebook-fictional-model/hana-reference.png`: canonical HANA identity with the approved balanced-curvy silhouette and V-neck styling.
- Modify `images/facebook-fictional-model/hana-laptop-document-scene.png`: identity-preserved cafe scene using the updated body and outfit.
- Regenerate ignored `.facebook-artifacts/hana-laptop-pilot/01.png`: updated lifestyle hook.
- Regenerate ignored `.facebook-artifacts/hana-laptop-pilot/02.png`: unchanged product-proof card.
- Regenerate ignored `.facebook-artifacts/hana-laptop-pilot/03.png`: unchanged fit/action card.
- Do not modify renderer code, pilot JSON, queues, or publisher files unless an existing test exposes a genuine image-composition regression.

## Task 1: Record the Approved Baseline

**Files:**
- Read: `images/facebook-fictional-model/hana-reference.png`
- Read: `images/facebook-fictional-model/hana-laptop-document-scene.png`
- Read: `.facebook-artifacts/hana-laptop-pilot/01.png`
- Read: `.facebook-artifacts/hana-laptop-pilot/02.png`
- Read: `.facebook-artifacts/hana-laptop-pilot/03.png`

- [ ] **Step 1: Verify the committed source assets are clean**

Run:

```powershell
git status --short -- images/facebook-fictional-model/hana-reference.png images/facebook-fictional-model/hana-laptop-document-scene.png
```

Expected: no output.

- [ ] **Step 2: Record source and card hashes**

Run:

```powershell
Get-FileHash images/facebook-fictional-model/hana-reference.png, images/facebook-fictional-model/hana-laptop-document-scene.png, .facebook-artifacts/hana-laptop-pilot/01.png, .facebook-artifacts/hana-laptop-pilot/02.png, .facebook-artifacts/hana-laptop-pilot/03.png -Algorithm SHA256 | Select-Object Path,Hash
```

Expected: five SHA-256 hashes. Retain them in the task report; do not create a tracked baseline file.

- [ ] **Step 3: Inspect both source images at original detail**

Use `view_image` with `detail: original` on both tracked PNGs. Record the face shape, hair, expression, clothing, hand placement, laptop position, chair intersection, and lower-table negative space that must remain stable.

Expected: both images match the currently approved HANA identity and contain no pre-existing defect that would make identity comparison ambiguous.

## Task 2: Edit the Canonical HANA Reference

**Files:**
- Modify: `images/facebook-fictional-model/hana-reference.png`

- [ ] **Step 1: Load the edit target**

Use `view_image` on `images/facebook-fictional-model/hana-reference.png` immediately before editing so the local image is visible to the built-in image editor.

- [ ] **Step 2: Generate the identity-preserving reference edit**

Invoke the `imagegen` skill and built-in `image_gen` with `images/facebook-fictional-model/hana-reference.png` as the only referenced image and this prompt:

```text
Use case: identity-preserve
Asset type: canonical fictional brand-model reference
Primary request: Edit the existing fictional adult HANA reference while preserving exactly the same face, apparent late-twenties age, long dark-brown hair, natural makeup, friendly expression, skin tone, and photorealistic Korean lifestyle-editorial identity. Give her a clearly fuller but natural balanced-curvy silhouette across shoulders, bust, waist-to-hip transition, and hips. The result must be physically coherent with her head, arms, and torso, not a bust-only enlargement.
Clothing: charcoal cardigan worn open over an opaque fitted cream V-neck blouse. Show collarbones, upper-bust line, and slight natural cleavage. Keep the blouse secure and professionally styled.
Composition/framing: widen the existing portrait to approximately waist-up so the balanced silhouette is visible while HANA remains the only subject.
Lighting/mood: preserve the soft neutral studio daylight and trustworthy shopping-editor mood.
Constraints: adult; same identity; realistic anatomy and fabric tension; non-transparent clothing; no plunging neckline; no exposed bra or underwear; no breast exposure; no wardrobe malfunction; no sexualized pose; no logos; no text; no watermark; no celebrity resemblance; approximately vertical 4:5.
```

Save the selected built-in output into the project as `images/facebook-fictional-model/hana-reference.png`, replacing the current file only because the user explicitly approved this replacement. Do not leave the selected project asset only in the generated-images directory.

- [ ] **Step 3: Inspect and accept or regenerate**

Use `view_image` at original detail. Accept only if:

- the face, hair, apparent age, expression, and skin tone remain recognizably the same;
- the overall silhouette is visibly fuller and balanced, not locally warped;
- the fitted V-neck shows collarbones, upper-bust line, and slight cleavage without becoming a plunging neckline;
- cardigan, blouse, shoulders, arms, waist, and fabric remain anatomically coherent;
- no lingerie, transparent fabric, breast exposure, text, logo, or watermark appears.

If any item fails, issue one targeted identity-preserving correction and inspect again.

- [ ] **Step 4: Verify the replacement file**

Run:

```powershell
python -c "from PIL import Image; p='images/facebook-fictional-model/hana-reference.png'; im=Image.open(p); im.verify(); im=Image.open(p); print(im.format, im.mode, im.size, round(im.width/im.height,4))"
```

Expected: readable PNG, RGB or RGBA, and an aspect ratio close to 0.8.

- [ ] **Step 5: Commit only the updated reference**

```powershell
git add -- images/facebook-fictional-model/hana-reference.png
git commit --only images/facebook-fictional-model/hana-reference.png -m "feat: update HANA body reference"
```

## Task 3: Apply the Updated Identity to the Cafe Scene

**Files:**
- Modify: `images/facebook-fictional-model/hana-laptop-document-scene.png`
- Read: `images/facebook-fictional-model/hana-reference.png`

- [ ] **Step 1: Load both local image roles**

Use `view_image` on the updated `hana-reference.png` and the existing `hana-laptop-document-scene.png`. Treat the reference as the identity/body/outfit reference and the cafe scene as the composition edit target.

- [ ] **Step 2: Generate the cafe-scene edit**

Invoke built-in `image_gen` with both local paths in `referenced_image_paths` and this prompt:

```text
Use case: identity-preserve
Asset type: vertical Facebook lifestyle-card source
Input images: updated HANA reference = identity, balanced-curvy body, and outfit reference; existing cafe laptop image = composition and scene edit target.
Primary request: Preserve the exact updated HANA face, apparent age, hair, expression, balanced-curvy adult silhouette, and moderate V-neck outfit from the reference. Recreate the existing bright quiet cafe laptop scene with the same elevated three-quarter camera angle, chair, table, generic silver laptop, and natural working action.
Clothing: charcoal cardigan open over the opaque fitted cream V-neck blouse. Collarbone, upper-bust line, and slight natural cleavage should remain visible at Facebook mobile size without becoming the main subject.
Composition/framing: keep HANA's complete face, recognizable laptop screen and keyboard, and both natural hand interactions entirely above the top 60 percent of the image. Keep the lower 40 percent as clean expendable tabletop for the opaque information panel.
Constraints: realistic coherent shoulders, bust, waist, hips, arms, wrists, hands, chair, and fabric; no bust-only enlargement; no plunging neckline; no exposed bra/underwear; no transparent fabric; no breast exposure; no sexualized pose; no logo; no readable UI; no text; no watermark; no celebrity resemblance; vertical approximately 4:5.
```

Save the selected output as `images/facebook-fictional-model/hana-laptop-document-scene.png`, replacing only that approved project asset.

- [ ] **Step 3: Inspect the scene at original detail**

Accept only if:

- HANA matches the updated reference face, body, and outfit;
- the balanced silhouette and slight V-neck exposure are visible but professional;
- face, laptop, keyboard, wrists, and hands remain above the 60% boundary;
- the bottom 40% remains expendable tabletop;
- laptop geometry, hands, fabric, chair contact, and anatomy are credible;
- no logo, text, readable UI, watermark, transparent fabric, lingerie, or breast exposure appears.

Regenerate with one targeted correction if any condition fails.

- [ ] **Step 4: Verify and commit only the scene**

Run:

```powershell
python -c "from PIL import Image; p='images/facebook-fictional-model/hana-laptop-document-scene.png'; im=Image.open(p); im.verify(); im=Image.open(p); print(im.format, im.mode, im.size, round(im.width/im.height,4))"
git add -- images/facebook-fictional-model/hana-laptop-document-scene.png
git commit --only images/facebook-fictional-model/hana-laptop-document-scene.png -m "feat: update HANA laptop lifestyle scene"
```

Expected: readable approximately 4:5 PNG and a commit containing only the scene.

## Task 4: Rerender and Compare the Pilot

**Files:**
- Read: `data/facebook-hana-laptop-pilot.json`
- Generate ignored: `.facebook-artifacts/hana-laptop-pilot/01.png`
- Generate ignored: `.facebook-artifacts/hana-laptop-pilot/02.png`
- Generate ignored: `.facebook-artifacts/hana-laptop-pilot/03.png`
- Generate ignored: `.facebook-artifacts/hana-laptop-pilot/manifest.json`

- [ ] **Step 1: Rerender without publishing**

Run:

```powershell
python scripts/generate-facebook-cards.py --input data/facebook-hana-laptop-pilot.json --output-dir .facebook-artifacts/hana-laptop-pilot
```

Expected: exit 0, three PNGs and one manifest. This command must not read `meta.env` or invoke the Facebook API.

- [ ] **Step 2: Verify dimensions and expected hash changes**

Run:

```powershell
python -c "from PIL import Image; from pathlib import Path; p=Path('.facebook-artifacts/hana-laptop-pilot'); fs=sorted(p.glob('0*.png')); print(len(fs)); [print(f.name, Image.open(f).size, Image.open(f).mode) for f in fs]"
Get-FileHash .facebook-artifacts/hana-laptop-pilot/01.png, .facebook-artifacts/hana-laptop-pilot/02.png, .facebook-artifacts/hana-laptop-pilot/03.png -Algorithm SHA256 | Select-Object Path,Hash
```

Expected: exactly three RGB 1080x1350 cards. Card 1 hash differs from the Task 1 baseline. Cards 2 and 3 hashes match their Task 1 baselines; if they differ, visually compare and explain the deterministic source before accepting.

- [ ] **Step 3: Inspect all three cards**

Use `view_image` at original detail on `01.png`, `02.png`, and `03.png`.

Card 1 must show the same HANA face with a clearly fuller balanced silhouette and moderate V-neck exposure, while retaining the AI label, laptop-use action, product panel, copy, date, and safe margins. Cards 2 and 3 must remain visually unchanged and contain no new crop, text, or product-image defect.

- [ ] **Step 4: Run the full scoped regression suite**

Run:

```powershell
node --test tests/facebook-card-content.test.js tests/facebook-card-renderer.test.js tests/facebook-hana-laptop-pilot.test.js tests/facebook-post-queue.test.js tests/facebook-publisher.test.js
git diff --check HEAD~2..HEAD
```

Expected: all current scoped tests pass and the two image commits contain no text whitespace errors.

- [ ] **Step 5: Verify non-publication state**

Run:

```powershell
git status --short -- images/facebook-fictional-model data/facebook-hana-laptop-pilot.json data/facebook-post-queue.json scripts/publish-facebook-posts.js
git check-ignore -v .facebook-artifacts/hana-laptop-pilot/01.png .facebook-artifacts/hana-laptop-pilot/02.png .facebook-artifacts/hana-laptop-pilot/03.png
```

Expected: tracked HANA/pilot/queue/publisher files are clean and all three rendered cards are ignored. The pilot remains `draft`, `publish: false`, and absent from queues.

- [ ] **Step 6: Present both updated source images and all three cards for user approval**

Provide clickable local paths and render the updated reference, cafe scene, and three cards inline. State explicitly that no Facebook post was published or replaced and that remote-main integration remains a separate prerequisite before any push or publication.
