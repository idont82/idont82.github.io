# HANA Cafe Off-Shoulder A2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the existing fictional adult HANA cafe laptop scene with the approved balanced A2 off-shoulder look, then rerender the unpublished Facebook pilot without changing its content or publication state.

**Architecture:** Keep the canonical HANA reference, pilot JSON, renderer, queue, and publisher unchanged. Use the built-in image editor with the canonical HANA reference as the identity/body anchor and the current cafe image as the composition edit target, replace only the tracked cafe source PNG, and verify that the unchanged renderer changes card 1 while reproducing cards 2 and 3 byte-for-byte.

**Tech Stack:** Built-in `image_gen`, local `view_image`, Python Pillow renderer, Node.js built-in test runner, Git.

---

## Execution Location and Safety Boundary

Execute on the current `main` checkout because the user previously selected it explicitly. Preserve every unrelated dirty, staged, and untracked change. Use path-scoped status, add, and commit commands only. Do not sync, merge, push, publish, schedule, call the Facebook API, or read `.facebook-artifacts/meta.env`.

Generated image work is validated through original-detail inspection, file decoding, deterministic rerendering, and the existing renderer tests rather than through a new TDD code test. Do not modify code to accommodate a generated-image defect; regenerate the image instead.

## File Map

- Read only `images/facebook-fictional-model/hana-reference.png`: canonical HANA face, age, hair, expression, skin tone, and balanced body anchor.
- Modify only `images/facebook-fictional-model/hana-laptop-document-scene.png`: A2 cafe lifestyle source.
- Read only `data/facebook-hana-laptop-pilot.json`: unchanged draft pilot contract.
- Regenerate ignored `.facebook-artifacts/hana-laptop-pilot/01.png`: expected visual change.
- Regenerate ignored `.facebook-artifacts/hana-laptop-pilot/02.png`: must remain byte-identical.
- Regenerate ignored `.facebook-artifacts/hana-laptop-pilot/03.png`: must remain byte-identical.
- Regenerate ignored `.facebook-artifacts/hana-laptop-pilot/manifest.json`.

## Task 1: Record the Current Approved Baseline

**Files:**
- Read: `images/facebook-fictional-model/hana-reference.png`
- Read: `images/facebook-fictional-model/hana-laptop-document-scene.png`
- Read: `.facebook-artifacts/hana-laptop-pilot/01.png`
- Read: `.facebook-artifacts/hana-laptop-pilot/02.png`
- Read: `.facebook-artifacts/hana-laptop-pilot/03.png`

- [ ] **Step 1: Confirm the two tracked image paths are clean**

Run:

```powershell
git status --short -- images/facebook-fictional-model/hana-reference.png images/facebook-fictional-model/hana-laptop-document-scene.png
```

Expected: no output. If either path is dirty, stop and identify the unexpected change before continuing.

- [ ] **Step 2: Reproduce the source and card hashes**

Run:

```powershell
Get-FileHash images/facebook-fictional-model/hana-reference.png, images/facebook-fictional-model/hana-laptop-document-scene.png, .facebook-artifacts/hana-laptop-pilot/01.png, .facebook-artifacts/hana-laptop-pilot/02.png, .facebook-artifacts/hana-laptop-pilot/03.png -Algorithm SHA256 | Select-Object Path,Hash
```

Expected:

- reference: `73057D66A9A977A52364F78018248181F19E7074D87A347062530C54540DE6CF`;
- cafe scene: `A92F78C4457E1F49F6C238082B4835FE223F226BD3BCCE4E626804BF383D44D9`;
- card 1: `30DBE578E0ED4A7EA4D3B11DEE78E90E2F4BAB003E931C929222E57223FDE180`;
- card 2: `7A07571F453620E9985B09C626137865FDF36C2E98865D6EFEE1EDFAF954C389`;
- card 3: `BCF9C4B8FF4E92D102BCDB7964C7F4170A85DF9E4242D6FF5BCFE4BFD4B42215`.

Retain these values in the task report; do not create another tracked baseline file.

- [ ] **Step 3: Inspect both source images at original detail**

Use `view_image` with `detail: original` on the reference and cafe source. Record these invariants:

- same HANA face, apparent late-twenties age, long dark-brown hair, warm expression, skin tone, and earrings;
- balanced-curvy silhouette with coherent shoulders, torso, waist, and arms;
- elevated cafe angle, beige chair behind the arms/torso, generic silver laptop, both natural hand interactions, and light-wood table;
- face, hands, wrists, laptop screen, and keyboard above the 60 percent boundary (`y < 841` for a 1402-pixel source);
- clean lower 40 percent tabletop.

Expected: the baseline is sufficiently clear for identity, anatomy, composition, and hash comparison. Make no file changes or commit.

## Task 2: Edit and Commit the A2 Cafe Scene

**Files:**
- Read: `images/facebook-fictional-model/hana-reference.png`
- Modify: `images/facebook-fictional-model/hana-laptop-document-scene.png`

- [ ] **Step 1: Load and label both image roles**

Use `view_image` at original detail on both local files immediately before editing.

- Image 1: canonical HANA identity/body reference;
- Image 2: cafe composition edit target.

Do not use the user's real-person event photograph as an image-generation input. Its approved abstract cues are already translated into the prompt below.

- [ ] **Step 2: Generate the identity-preserving A2 edit**

Invoke the `imagegen` skill and built-in `image_gen` with both local image paths in `referenced_image_paths` and this prompt:

```text
Use case: identity-preserve
Asset type: vertical Facebook cafe lifestyle-card source
Input images: Image 1 = canonical fictional adult HANA identity, balanced body, and face reference; Image 2 = existing cafe laptop composition edit target.
Primary request: Change only HANA's outfit and subtle editorial mood in Image 2. Preserve Image 1's exact fictional HANA face, apparent late-twenties age, skin tone, long dark-brown hair, makeup, small earrings, warm expression, and balanced-curvy proportions. Preserve Image 2's bright quiet cafe, elevated three-quarter camera angle, beige chair behind her, light-wood table, generic silver laptop, seated working action, and two natural hand interactions.
Outfit: remove the charcoal cardigan and current V-neck blouse. Replace them with one fitted matte cream bardot/off-shoulder top suitable for a polished cafe editorial. Both shoulders and collarbones are clearly visible. The upper edge is secure, opaque, structured, and cafe-appropriate. It must look like refined daywear, not eventwear, lingerie, a corset, or a near-strapless garment.
Expression and lighting: calm confident eye contact toward the camera, restrained warm smile, and a subtle warm editorial highlight while preserving the natural cafe daylight.
Composition/framing: keep HANA's complete face, both exposed shoulders, both hands and wrists, recognizable laptop screen, and keyboard entirely above the top 60 percent of the image. Keep the lower 40 percent as clean expendable tabletop for an opaque information panel. Keep the chair rail behind HANA's arms and torso.
Constraints: change only the approved outfit and subtle mood; preserve identity, body proportions, posture, camera, environment, laptop action, and lower-table space. Realistic anatomy, fingers, wrists, fabric tension, seams, chair contact, and laptop geometry. Opaque secure clothing. No low neckline, lingerie styling, transparent fabric, exposed body parts, wardrobe malfunction, suggestive pose, new jewelry, stage background, logos, readable UI, text, watermark, or real-person/celebrity resemblance. Vertical approximately 4:5.
```

Save or copy the selected built-in output into the project at the exact existing path `images/facebook-fictional-model/hana-laptop-document-scene.png`. The user approved replacing this scene through the written design. Do not leave the selected project asset only in the generated-images directory.

- [ ] **Step 3: Inspect and accept or correct once**

Use `view_image` with `detail: original`. Accept only if all conditions hold:

- HANA's face, age, skin tone, hair, earrings, and expression remain recognizable;
- the balanced-curvy silhouette remains coherent without isolated enlargement;
- the cardigan is gone and a single matte cream two-shoulder off-shoulder top is present;
- both shoulders and collarbones are visible while the upper edge remains secure and opaque;
- the outfit reads as polished cafe daywear, not lingerie, corsetry, stagewear, or near-strapless clothing;
- laptop geometry, fingers, wrists, chair overlap, fabric, and anatomy are credible;
- all required content stays above `y = 841` and the bottom 40 percent remains clean tabletop;
- no logo, readable UI, text, watermark, new jewelry, stage background, or real-person resemblance appears.

If exactly one condition fails, make one targeted built-in edit that repeats all identity and composition invariants, then inspect again. If moderation blocks the first request, retry once using only conservative professional-fashion language. If the correction or conservative retry also fails, stop and report the blocker; do not switch to CLI.

- [ ] **Step 4: Verify the replacement PNG**

Run:

```powershell
python -c "from PIL import Image; import hashlib; p='images/facebook-fictional-model/hana-laptop-document-scene.png'; im=Image.open(p); im.verify(); im=Image.open(p); print(im.format, im.mode, im.size, round(im.width/im.height,6)); print(hashlib.sha256(open(p,'rb').read()).hexdigest().upper())"
```

Expected: valid RGB or RGBA PNG, dimensions close to `1122x1402`, aspect ratio close to `0.8`, and a SHA-256 different from the baseline scene hash.

- [ ] **Step 5: Commit only the cafe scene**

Run:

```powershell
git status --short -- images/facebook-fictional-model/hana-reference.png images/facebook-fictional-model/hana-laptop-document-scene.png
git add -- images/facebook-fictional-model/hana-laptop-document-scene.png
git commit --only images/facebook-fictional-model/hana-laptop-document-scene.png -m "feat: restyle HANA cafe scene"
git status --short -- images/facebook-fictional-model/hana-reference.png images/facebook-fictional-model/hana-laptop-document-scene.png
```

Expected: the reference remains untouched; the commit contains only the cafe scene; both paths are clean afterward.

## Task 3: Rerender and Verify the Unpublished Pilot

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

Expected: exit `0`, exactly three PNG cards and one manifest. This command must not read `meta.env` or invoke Facebook.

- [ ] **Step 2: Verify card dimensions and hashes**

Run:

```powershell
python -c "from PIL import Image; from pathlib import Path; import hashlib; p=Path('.facebook-artifacts/hana-laptop-pilot'); fs=sorted(p.glob('0*.png')); print('COUNT',len(fs)); [(lambda im: print(f.name, im.mode, im.size, hashlib.sha256(f.read_bytes()).hexdigest().upper()))(Image.open(f)) for f in fs]"
```

Expected:

- exactly three RGB `1080x1350` cards;
- card 1 hash differs from `30DBE578E0ED4A7EA4D3B11DEE78E90E2F4BAB003E931C929222E57223FDE180`;
- card 2 equals `7A07571F453620E9985B09C626137865FDF36C2E98865D6EFEE1EDFAF954C389`;
- card 3 equals `BCF9C4B8FF4E92D102BCDB7964C7F4170A85DF9E4242D6FF5BCFE4BFD4B42215`.

If card 2 or 3 differs, stop and identify the deterministic input change before accepting the render.

- [ ] **Step 3: Inspect all three cards at original detail**

Use `view_image` on `01.png`, `02.png`, and `03.png`.

Card 1 must show the same HANA in the A2 off-shoulder cafe scene with believable laptop action, visible AI disclosure, intact headline, opaque product panel, product/date copy, counter, and safe margins. Cards 2 and 3 must remain visually unchanged with intact product, specifications, use cases, caution, CTA, and counters.

- [ ] **Step 4: Run the full scoped regression suite**

Run:

```powershell
node --test tests/facebook-card-content.test.js tests/facebook-card-renderer.test.js tests/facebook-hana-laptop-pilot.test.js tests/facebook-post-queue.test.js tests/facebook-publisher.test.js
```

Expected: `42` tests, `42` passed, `0` failed, exit `0`.

- [ ] **Step 5: Verify commit scope and non-publication state**

Run:

```powershell
git diff --check d54fc73..HEAD
git diff-tree --no-commit-id --name-only -r HEAD
git status --short -- images/facebook-fictional-model data/facebook-hana-laptop-pilot.json data/facebook-post-queue.json scripts/publish-facebook-posts.js
git check-ignore -v .facebook-artifacts/hana-laptop-pilot/01.png .facebook-artifacts/hana-laptop-pilot/02.png .facebook-artifacts/hana-laptop-pilot/03.png
$pilot=Get-Content -Raw -Encoding UTF8 data/facebook-hana-laptop-pilot.json | ConvertFrom-Json
Write-Output "STATUS=$($pilot.status) PUBLISH=$($pilot.publish) FIRST_LINE=$(($pilot.caption -split "`r?`n")[0])"
```

Expected:

- diff check exits `0`;
- the implementation commit contains only `images/facebook-fictional-model/hana-laptop-document-scene.png`;
- scoped tracked paths are clean;
- all rendered cards are ignored;
- pilot remains `draft`, `publish: false`, and its tracked HTTPS blog URL remains the caption's first line;
- pilot ID remains absent from `data/facebook-post-queue.json` and the default publisher, as covered by the passing tests.

- [ ] **Step 6: Present the result for subjective visual approval**

Show the final cafe source and all three rendered cards. Report the final prompt, source/card hashes, image commit SHA, and test count. State explicitly that the pilot was not published, queued, pushed, merged, or synchronized and that the dirty divergent `main` checkout still requires a separate integration workflow.
