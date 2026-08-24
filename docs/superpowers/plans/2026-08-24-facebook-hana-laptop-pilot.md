# Facebook HANA Laptop Pilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a reusable HANA character reference and one review-ready, unpublished three-card laptop Facebook pilot whose caption starts with the blog link.

**Architecture:** Extend the existing Pillow Facebook card renderer with one isolated `lifestyle-hybrid` template supporting three explicit slide roles: lifestyle hook, product proof, and fit/action. Store the stable character reference and generated laptop scene under a dedicated image directory, and keep the pilot's reviewed content in a standalone JSON input so it cannot accidentally enter the live Facebook queue.

**Tech Stack:** Python 3 and Pillow, Node.js built-in test runner, existing static-site assets, Codex `imagegen` for the fictional model images.

---

## File Map

- Create `images/facebook-fictional-model/README.md`: canonical HANA identity, disclosure, prompts, and asset-use rules.
- Create `images/facebook-fictional-model/hana-reference.png`: approved, non-celebrity HANA reference portrait.
- Create `images/facebook-fictional-model/hana-laptop-document-scene.png`: HANA using a generic silver laptop in a natural work setting.
- Modify `scripts/generate-facebook-cards.py`: validate and render the reusable three-role `lifestyle-hybrid` template.
- Create `data/facebook-hana-laptop-pilot.json`: reviewed caption, product facts, product image URL, and the three pilot slides.
- Modify `tests/facebook-card-renderer.test.js`: renderer validation, dimensions, and safe-area checks for the new template.
- Create `tests/facebook-hana-laptop-pilot.test.js`: content contract, first-line link, AI disclosure, real-product proof, and unpublished-state checks.
- Generate `.facebook-artifacts/hana-laptop-pilot/01.png` through `03.png`: ignored review artifacts, not committed.

## Task 1: Create the Stable HANA Asset Contract

**Files:**
- Create: `images/facebook-fictional-model/README.md`
- Create: `images/facebook-fictional-model/hana-reference.png`
- Create: `images/facebook-fictional-model/hana-laptop-document-scene.png`

- [ ] **Step 1: Create the asset rules file**

Create `images/facebook-fictional-model/README.md` with this content:

```markdown
# HANA fictional model assets

HANA is Gold Pick's fictional AI model. She is a friendly, polished Korean woman in her late twenties with long dark-brown hair, natural makeup, a bright healthy expression, and realistic proportions. She must not resemble a real celebrity.

## Required consistency

- Use `hana-reference.png` as the identity reference for every HANA generation.
- Keep face shape, apparent age, hair color, hair length, and natural styling stable.
- Change clothing, pose, and setting only when the product category requires it.
- Avoid sexualized styling, impossible anatomy, fake review gestures, and readable invented brand logos.
- Add `AI 연출 이미지` in the card renderer; do not bake small Korean text into generated photos.

## Laptop pilot

`hana-laptop-document-scene.png` is an illustrative lifestyle scene. The visible laptop must remain generic and logo-free. The actual product photo in the product-proof panel is the only evidence of exact product appearance.
```

- [ ] **Step 2: Generate the HANA reference image**

Invoke the `imagegen` skill, then generate a new image with no real-person reference using this prompt:

```text
Create a photorealistic identity reference portrait for a completely fictional Korean woman named HANA, late twenties, friendly and polished, long dark-brown hair, natural makeup, bright healthy expression, realistic facial proportions and skin texture. Neutral warm-gray studio background, soft daylight, chest-up, facing camera, understated cream blouse, trustworthy lifestyle-shopping editor mood. She must not resemble any celebrity or public figure. No logos, no text, no beauty-filter look, no exaggerated body proportions. Produce one clean reference image suitable for maintaining the same fictional identity in later generations.
```

Save the selected result as `images/facebook-fictional-model/hana-reference.png`.

- [ ] **Step 3: Inspect the reference before continuing**

Use `view_image` on `images/facebook-fictional-model/hana-reference.png` and reject the image if it has distorted eyes, teeth, hands, jewelry, clothing, background artifacts, or a recognizable celebrity resemblance.

Expected: one realistic, non-celebrity adult with the identity traits documented in the README.

- [ ] **Step 4: Generate the laptop lifestyle scene from the approved reference**

Invoke the `imagegen` skill with `hana-reference.png` as the referenced image and use this prompt:

```text
Keep the exact same fictional HANA identity from the reference: same face, apparent age, long dark-brown hair, natural makeup, and friendly polished mood. Create a photorealistic vertical 4:5 lifestyle photo of HANA naturally working at a bright quiet cafe table with a generic thin silver laptop. She is seated in a realistic posture and looking thoughtfully at the screen, wearing a simple charcoal cardigan over a light blouse. Show both hands naturally with correct anatomy. Leave calm uncluttered negative space near the lower third for a product-information panel. The laptop must have no logo, no readable interface text, and no distinctive brand design. Soft daylight, believable Korean lifestyle editorial photography, no text, no watermark, no celebrity resemblance.
```

Save the selected result as `images/facebook-fictional-model/hana-laptop-document-scene.png`.

- [ ] **Step 5: Inspect the lifestyle scene**

Use `view_image` and check HANA identity consistency, face, both hands, laptop geometry, logo absence, and lower-third space.

Expected: a credible 4:5 scene that does not claim to show the exact product.

- [ ] **Step 6: Commit the approved assets**

```powershell
git add images/facebook-fictional-model/README.md images/facebook-fictional-model/hana-reference.png images/facebook-fictional-model/hana-laptop-document-scene.png
git commit -m "feat: add HANA fictional model assets"
```

## Task 2: Specify the Lifestyle-Hybrid Renderer Contract with Tests

**Files:**
- Modify: `tests/facebook-card-renderer.test.js`
- Modify: `scripts/generate-facebook-cards.py`

- [ ] **Step 1: Add a reusable lifestyle fixture to the renderer test**

Add this fixture next to the existing shopping fixture in `tests/facebook-card-renderer.test.js`:

```javascript
const lifestyleContent = {
  id: 'hana-lifestyle-render-test',
  slides: [
    {
      template: 'lifestyle-hybrid',
      role: 'lifestyle-hook',
      label: 'GOLD PICK',
      headline: '매일 들고 다닐 문서용 노트북',
      lifestyleImageUrls: ['/images/facebook-fictional-model/hana-laptop-document-scene.png'],
      productImageUrls: ['/images/facebook-fictional-model/hana-reference.png'],
      productName: '테스트 노트북 16',
      priceBand: '100만원대',
      disclosure: 'AI 연출 이미지',
    },
    {
      template: 'lifestyle-hybrid',
      role: 'product-proof',
      label: 'GOLD PICK',
      productImageUrls: ['/images/facebook-fictional-model/hana-reference.png'],
      productName: '테스트 노트북 16',
      priceBand: '작성일 기준 100만원대',
      specs: ['Ryzen 5', '16GB · 512GB', 'Windows 11'],
      disclaimer: '가격 변동 가능',
    },
    {
      template: 'lifestyle-hybrid',
      role: 'fit-action',
      label: 'GOLD PICK',
      productImageUrls: ['/images/facebook-fictional-model/hana-reference.png'],
      productName: '테스트 노트북 16',
      fits: ['문서 작성', '메일 · 웹', '화상 회의'],
      caution: '16인치 휴대 무게는 확인하세요',
      cta: '자세한 비교는 본문에서',
    },
  ],
};
```

- [ ] **Step 2: Add failing renderer tests**

Append these tests, reusing the file's existing `render`, `pngSize`, `sampleRgb`, and temporary-directory helpers:

```javascript
test('lifestyle-hybrid renderer creates three 1080x1350 role-specific cards', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-lifestyle-hybrid-'));
  const input = path.join(dir, 'content.json');
  fs.writeFileSync(input, JSON.stringify(lifestyleContent), 'utf8');
  const result = render(input, dir);
  assert.equal(result.status, 0, result.stderr);
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.cards.length, 3);
  for (const card of manifest.cards) {
    assert.deepEqual(pngSize(card), { width: 1080, height: 1350 });
  }
  assert.notDeepEqual(sampleRgb(manifest.cards[0], 80, 80), sampleRgb(manifest.cards[0], 540, 1200));
});

test('lifestyle hook rejects a missing AI disclosure', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-lifestyle-invalid-'));
  const input = path.join(dir, 'content.json');
  const invalid = structuredClone(lifestyleContent);
  delete invalid.slides[0].disclosure;
  fs.writeFileSync(input, JSON.stringify(invalid), 'utf8');
  const result = render(input, dir);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /lifestyle hook missing disclosure/);
});
```

- [ ] **Step 3: Run the focused tests and verify failure**

Run:

```powershell
node --test tests/facebook-card-renderer.test.js
```

Expected: existing tests pass and the two new tests fail because `lifestyle-hybrid` is not implemented.

- [ ] **Step 4: Add role validation to the Python renderer**

Add these constants and validation function to `scripts/generate-facebook-cards.py` near `validate_shopping_slide`:

```python
LIFESTYLE_ROLES = ("lifestyle-hook", "product-proof", "fit-action")


def require_fields(slide, fields, context):
  for field in fields:
    value = slide.get(field)
    if value is None or value == "" or value == []:
      raise ValueError(f"{context} missing {field}")


def validate_lifestyle_slide(slide):
  role = slide.get("role")
  if role not in LIFESTYLE_ROLES:
    raise ValueError("lifestyle card has invalid role")
  if role == "lifestyle-hook":
    require_fields(slide, (
        "headline", "lifestyleImageUrls", "productImageUrls", "productName",
        "priceBand", "disclosure",
    ), "lifestyle hook")
    if slide["disclosure"] != "AI 연출 이미지":
      raise ValueError("lifestyle hook disclosure must be AI 연출 이미지")
  elif role == "product-proof":
    require_fields(slide, (
        "productImageUrls", "productName", "priceBand", "specs", "disclaimer",
    ), "product proof")
    if not isinstance(slide["specs"], list) or len(slide["specs"]) != 3:
      raise ValueError("product proof specs must contain exactly three items")
  else:
    require_fields(slide, (
        "productImageUrls", "productName", "fits", "caution", "cta",
    ), "fit action")
    if not isinstance(slide["fits"], list) or not 1 <= len(slide["fits"]) <= 3:
      raise ValueError("fit action fits must contain 1 to 3 items")
```

## Task 3: Implement the Three Lifestyle-Hybrid Card Roles

**Files:**
- Modify: `scripts/generate-facebook-cards.py`
- Test: `tests/facebook-card-renderer.test.js`

- [ ] **Step 1: Add shared card furniture helpers**

Add helpers that draw the Gold Pick badge, `N/3` counter, and fitted left-aligned text. Use the existing `fit_text`, `text_width`, `load_source_image`, and `draw_centered_text` functions; keep all content at least 44 pixels from canvas edges.

```python
def draw_card_header(draw, index, font_path, dark=False):
  label_font = ImageFont.truetype(font_path, 26)
  small_font = ImageFont.truetype(font_path, 22)
  draw.rounded_rectangle((44, 38, 258, 92), radius=27, fill="#f6c342")
  draw.text((67, 49), "GOLD PICK", font=label_font, fill="#17130a")
  counter_fill = "#ffffff" if dark else "#064e3b"
  draw.rounded_rectangle((WIDTH - 132, 34, WIDTH - 30, 82), radius=24, fill="#a7f3d0")
  draw.text((WIDTH - 104, 45), f"{index + 1}/3", font=small_font, fill=counter_fill)


def paste_contained(image, source, box):
  left, top, right, bottom = box
  fitted = ImageOps.contain(
      source, (right - left, bottom - top), method=Image.Resampling.LANCZOS
  )
  x = left + (right - left - fitted.width) // 2
  y = top + (bottom - top - fitted.height) // 2
  image.paste(fitted, (x, y))
```

- [ ] **Step 2: Implement the lifestyle-hook renderer**

```python
def render_lifestyle_hook(slide, index, font_path, output_file):
  scene = load_background(slide["lifestyleImageUrls"])
  image = scene.convert("RGB")
  draw = ImageDraw.Draw(image)
  draw.rectangle((0, 800, WIDTH, HEIGHT), fill="#171a22")
  draw_card_header(draw, index, font_path, dark=True)

  disclosure_font = ImageFont.truetype(font_path, 22)
  disclosure_width = text_width(draw, slide["disclosure"], disclosure_font)
  disclosure_left = WIDTH - disclosure_width - 76
  draw.rounded_rectangle(
      (disclosure_left - 18, 102, WIDTH - 44, 148), radius=20, fill="#20232c"
  )
  draw.text((disclosure_left, 111), slide["disclosure"],
            font=disclosure_font, fill="#ffffff")

  draw_centered_text(
      draw, slide["headline"], (70, 820, WIDTH - 70, 970), font_path,
      "#ffffff", 58, 38, 2,
  )
  panel = (54, 985, WIDTH - 54, 1300)
  draw.rounded_rectangle(panel, radius=30, fill="#ffffff")
  product = load_source_image(slide["productImageUrls"])
  paste_contained(image, product, (78, 1015, 430, 1268))
  draw_centered_text(
      draw, slide["productName"], (450, 1025, WIDTH - 80, 1130), font_path,
      "#252932", 38, 25, 2,
  )
  draw_centered_text(
      draw, slide["priceBand"], (450, 1140, WIDTH - 80, 1255), font_path,
      "#e56f00", 48, 30, 2,
  )
  image.save(output_file, format="PNG", optimize=True)
```

- [ ] **Step 3: Implement the product-proof renderer**

Add this complete renderer:

```python
def render_product_proof(slide, index, font_path, output_file):
  image = Image.new("RGB", (WIDTH, HEIGHT), "#f7f4ed")
  draw = ImageDraw.Draw(image)
  draw_card_header(draw, index, font_path)
  draw_centered_text(
      draw, "실제 상품 정보", (80, 120, WIDTH - 80, 220), font_path,
      "#28241f", 54, 36, 1,
  )
  product = load_source_image(slide["productImageUrls"])
  paste_contained(image, product, (100, 235, WIDTH - 100, 770))
  draw_centered_text(
      draw, slide["productName"], (90, 775, WIDTH - 90, 880), font_path,
      "#28241f", 45, 30, 2,
  )
  draw_centered_text(
      draw, slide["priceBand"], (90, 875, WIDTH - 90, 965), font_path,
      "#e56f00", 42, 28, 1,
  )
  for position, spec in enumerate(slide["specs"]):
    left = 54 + position * 340
    right = left + 312
    draw.rounded_rectangle((left, 990, right, 1160), radius=24, fill="#ffffff",
                           outline="#ded7ca", width=2)
    draw_centered_text(
        draw, spec, (left + 16, 1010, right - 16, 1140), font_path,
        "#28241f", 31, 21, 2,
    )
  draw_centered_text(
      draw, slide["disclaimer"], (70, 1195, WIDTH - 70, 1295), font_path,
      "#6f6a63", 27, 19, 2,
  )
  image.save(output_file, format="PNG", optimize=True)
```

- [ ] **Step 4: Implement the fit/action renderer**

Add this complete renderer; it deliberately does not include HANA:

```python
def render_fit_action(slide, index, font_path, output_file):
  image = Image.new("RGB", (WIDTH, HEIGHT), "#191b2c")
  draw = ImageDraw.Draw(image)
  draw_card_header(draw, index, font_path, dark=True)
  draw_centered_text(
      draw, "이런 분께 잘 맞아요", (60, 130, 620, 270), font_path,
      "#ffffff", 51, 34, 2,
  )
  product = load_source_image(slide["productImageUrls"])
  paste_contained(image, product, (620, 135, 1020, 500))
  draw_centered_text(
      draw, slide["productName"], (80, 285, 610, 405), font_path,
      "#a7f3d0", 36, 25, 2,
  )
  for position, fit in enumerate(slide["fits"]):
    top = 500 + position * 145
    draw.rounded_rectangle((90, top, WIDTH - 90, top + 110), radius=28,
                           fill="#2d3047")
    draw_centered_text(
        draw, fit, (120, top + 12, WIDTH - 120, top + 98), font_path,
        "#ffffff", 39, 27, 1,
    )
  draw.rounded_rectangle((90, 945, WIDTH - 90, 1080), radius=28,
                         fill="#fff0d7")
  draw_centered_text(
      draw, slide["caution"], (120, 965, WIDTH - 120, 1060), font_path,
      "#8a4e00", 34, 23, 2,
  )
  draw_centered_text(
      draw, slide["cta"], (70, 1120, WIDTH - 70, 1295), font_path,
      "#f6c342", 54, 36, 2,
  )
  image.save(output_file, format="PNG", optimize=True)
```

- [ ] **Step 5: Route the new template by role**

Add this dispatcher and update `render_slide`:

```python
def render_lifestyle_slide(slide, index, font_path, output_file):
  validate_lifestyle_slide(slide)
  renderers = {
      "lifestyle-hook": render_lifestyle_hook,
      "product-proof": render_product_proof,
      "fit-action": render_fit_action,
  }
  return renderers[slide["role"]](slide, index, font_path, output_file)


def render_slide(slide, index, font_path, output_file):
  if slide.get("template") == "shopping-grid":
    return render_shopping_slide(slide, index, font_path, output_file)
  if slide.get("template") == "lifestyle-hybrid":
    return render_lifestyle_slide(slide, index, font_path, output_file)
  return render_classic_slide(slide, index, font_path, output_file)
```

- [ ] **Step 6: Run the focused renderer tests**

Run:

```powershell
node --test tests/facebook-card-renderer.test.js
```

Expected: all renderer tests pass, including three 1080x1350 lifestyle cards and missing-disclosure rejection.

- [ ] **Step 7: Commit the renderer**

```powershell
git add scripts/generate-facebook-cards.py tests/facebook-card-renderer.test.js
git commit -m "feat: render lifestyle hybrid facebook cards"
```

## Task 4: Add the Unpublished Laptop Pilot Content

**Files:**
- Create: `data/facebook-hana-laptop-pilot.json`
- Create: `tests/facebook-hana-laptop-pilot.test.js`

- [ ] **Step 1: Write the pilot contract test**

Create `tests/facebook-hana-laptop-pilot.test.js`:

```javascript
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const pilotPath = path.join(__dirname, '..', 'data', 'facebook-hana-laptop-pilot.json');

test('HANA laptop pilot is review-only and starts its caption with the blog link', () => {
  const pilot = JSON.parse(fs.readFileSync(pilotPath, 'utf8'));
  assert.equal(pilot.status, 'draft');
  assert.equal(pilot.publish, false);
  assert.equal(pilot.caption.split('\n')[0], 'https://idont82.github.io/g/?n=20');
  assert.equal(pilot.slides.length, 3);
  assert.deepEqual(pilot.slides.map((slide) => slide.role), [
    'lifestyle-hook', 'product-proof', 'fit-action',
  ]);
  assert.ok(pilot.slides.every((slide) => slide.template === 'lifestyle-hybrid'));
  assert.equal(pilot.slides[0].disclosure, 'AI 연출 이미지');
  assert.match(pilot.caption, /쿠팡 파트너스/);
});

test('HANA lifestyle image is illustrative while product-proof cards use a verified product URL', () => {
  const pilot = JSON.parse(fs.readFileSync(pilotPath, 'utf8'));
  assert.equal(
    pilot.slides[0].lifestyleImageUrls[0],
    '/images/facebook-fictional-model/hana-laptop-document-scene.png'
  );
  const proofUrls = pilot.slides.slice(1).flatMap((slide) => slide.productImageUrls);
  assert.ok(proofUrls.every((url) => /^https:\/\/ads-partners\.coupang\.com\/image1\//.test(url)));
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```powershell
node --test tests/facebook-hana-laptop-pilot.test.js
```

Expected: FAIL with `ENOENT` for `data/facebook-hana-laptop-pilot.json`.

- [ ] **Step 3: Create the reviewed pilot JSON**

Create `data/facebook-hana-laptop-pilot.json` exactly as follows. The long product URL is the verified BasicBook image URL already used by the live laptop shopping queue.

```json
{
  "id": "20260824-hana-laptop-document-pilot",
  "status": "draft",
  "publish": false,
  "caption": "https://idont82.github.io/g/?n=20\n\n문서용 노트북을 고를 때는 매일 쓰는 장면부터 생각해보세요.\n메모리 · 저장공간 · 운영체제와 휴대 크기를 함께 비교했습니다.\n\n이 게시물은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.",
  "slides": [
    {
      "template": "lifestyle-hybrid",
      "role": "lifestyle-hook",
      "label": "GOLD PICK",
      "headline": "매일 쓰기 편한 문서용 노트북",
      "lifestyleImageUrls": [
        "/images/facebook-fictional-model/hana-laptop-document-scene.png"
      ],
      "productImageUrls": [
        "https://ads-partners.coupang.com/image1/hrjd6Dv9jmolyoZlhl-Qw_xsxOVfE4MtCvbKYho9yozlaLE6-NpWXECpLKQMqYSYzfyqNvE4iFevcKRCqZ3skDyuyOXNPZgRO3So4a2ZgF0PFPfHkl0cxNSi-tQqYn4F2oOu5l7HzEq5NORBiv7x85ymt-FN4Z6uZuFeKc67Z1VJxBQLDzlgUzevCc_wjfcqSpc2o8rP8_LgUKltYFiItqb2gKeaMD4u8AkXNgpyE-yZp6maduN6bFvXo-OO40Khjlw-Ws85sYSzGc6uOQAugjbVanQtxbByMOdQDy3e6ag0FNIOsG4PGnNS616Tr1Lh4bUIiUpB2sh0GBg8jmg="
      ],
      "productName": "Basics BasicBook 16 Pro",
      "priceBand": "작성일 기준 100만원대",
      "disclosure": "AI 연출 이미지"
    },
    {
      "template": "lifestyle-hybrid",
      "role": "product-proof",
      "label": "GOLD PICK",
      "productImageUrls": [
        "https://ads-partners.coupang.com/image1/hrjd6Dv9jmolyoZlhl-Qw_xsxOVfE4MtCvbKYho9yozlaLE6-NpWXECpLKQMqYSYzfyqNvE4iFevcKRCqZ3skDyuyOXNPZgRO3So4a2ZgF0PFPfHkl0cxNSi-tQqYn4F2oOu5l7HzEq5NORBiv7x85ymt-FN4Z6uZuFeKc67Z1VJxBQLDzlgUzevCc_wjfcqSpc2o8rP8_LgUKltYFiItqb2gKeaMD4u8AkXNgpyE-yZp6maduN6bFvXo-OO40Khjlw-Ws85sYSzGc6uOQAugjbVanQtxbByMOdQDy3e6ag0FNIOsG4PGnNS616Tr1Lh4bUIiUpB2sh0GBg8jmg="
      ],
      "productName": "Basics BasicBook 16 Pro",
      "priceBand": "작성일 기준 100만원대",
      "specs": [
        "Ryzen 5",
        "16GB · 512GB",
        "Windows 11"
      ],
      "disclaimer": "가격 변동 가능"
    },
    {
      "template": "lifestyle-hybrid",
      "role": "fit-action",
      "label": "GOLD PICK",
      "productImageUrls": [
        "https://ads-partners.coupang.com/image1/hrjd6Dv9jmolyoZlhl-Qw_xsxOVfE4MtCvbKYho9yozlaLE6-NpWXECpLKQMqYSYzfyqNvE4iFevcKRCqZ3skDyuyOXNPZgRO3So4a2ZgF0PFPfHkl0cxNSi-tQqYn4F2oOu5l7HzEq5NORBiv7x85ymt-FN4Z6uZuFeKc67Z1VJxBQLDzlgUzevCc_wjfcqSpc2o8rP8_LgUKltYFiItqb2gKeaMD4u8AkXNgpyE-yZp6maduN6bFvXo-OO40Khjlw-Ws85sYSzGc6uOQAugjbVanQtxbByMOdQDy3e6ag0FNIOsG4PGnNS616Tr1Lh4bUIiUpB2sh0GBg8jmg="
      ],
      "productName": "Basics BasicBook 16 Pro",
      "fits": [
        "문서 작성",
        "메일 · 웹",
        "화상 회의"
      ],
      "caution": "16인치 크기와 휴대 무게는 확인하세요",
      "cta": "자세한 비교는 본문에서"
    }
  ]
}
```

- [ ] **Step 4: Run the pilot and renderer tests**

Run:

```powershell
node --test tests/facebook-hana-laptop-pilot.test.js tests/facebook-card-renderer.test.js
```

Expected: all tests pass.

- [ ] **Step 5: Commit the pilot content**

```powershell
git add data/facebook-hana-laptop-pilot.json tests/facebook-hana-laptop-pilot.test.js
git commit -m "feat: add HANA laptop facebook pilot"
```

## Task 5: Render and Review the Pilot Without Publishing

**Files:**
- Read: `data/facebook-hana-laptop-pilot.json`
- Generate ignored files: `.facebook-artifacts/hana-laptop-pilot/content.json`
- Generate ignored files: `.facebook-artifacts/hana-laptop-pilot/01.png`
- Generate ignored files: `.facebook-artifacts/hana-laptop-pilot/02.png`
- Generate ignored files: `.facebook-artifacts/hana-laptop-pilot/03.png`
- Generate ignored files: `.facebook-artifacts/hana-laptop-pilot/manifest.json`

- [ ] **Step 1: Render the three pilot cards**

Run:

```powershell
python scripts/generate-facebook-cards.py --input data/facebook-hana-laptop-pilot.json --output-dir .facebook-artifacts/hana-laptop-pilot
```

Expected: exit code 0 and three PNG files plus `manifest.json`. This command does not call the Facebook API.

- [ ] **Step 2: Verify dimensions and manifest**

Run:

```powershell
node --test tests/facebook-hana-laptop-pilot.test.js tests/facebook-card-renderer.test.js
```

Expected: all tests pass and every rendered card is 1080x1350.

- [ ] **Step 3: Visually inspect every card**

Use `view_image` on `01.png`, `02.png`, and `03.png`. Confirm:

- card 1 shows the same approved HANA identity;
- `AI 연출 이미지` is legible;
- no hand, face, laptop, or logo artifacts are visible;
- the generated laptop is not presented as exact product proof;
- the real product image, product name, specs, and dated price band are readable;
- all critical text stays inside the mobile-safe margins;
- card 3 includes both the caution and CTA.

If a generated-photo defect exists, regenerate only `hana-laptop-document-scene.png` from the approved reference and render again. If a layout defect exists, add a failing pixel/layout assertion before changing the renderer.

- [ ] **Step 4: Run the Facebook regression suite**

Run:

```powershell
node --test tests/facebook-card-content.test.js tests/facebook-card-renderer.test.js tests/facebook-hana-laptop-pilot.test.js tests/facebook-laptop-shopping-queue.test.js tests/facebook-post-queue.test.js tests/facebook-publisher.test.js
```

Expected: all selected Facebook tests pass.

- [ ] **Step 5: Confirm no publishing state was changed**

Run:

```powershell
git diff -- data/facebook-laptop-shopping-post-queue.json
git status --short
```

Expected: no diff for the live laptop shopping queue; only intended implementation files are changed, and `.facebook-artifacts/hana-laptop-pilot/` remains ignored.

- [ ] **Step 6: Commit any final test-backed layout corrections**

```powershell
git add scripts/generate-facebook-cards.py tests/facebook-card-renderer.test.js
git commit -m "fix: polish HANA facebook pilot layout"
```

Skip this commit when no correction was required.

## Task 6: Final Verification and User Review Gate

**Files:**
- Review: `images/facebook-fictional-model/hana-reference.png`
- Review: `.facebook-artifacts/hana-laptop-pilot/01.png`
- Review: `.facebook-artifacts/hana-laptop-pilot/02.png`
- Review: `.facebook-artifacts/hana-laptop-pilot/03.png`

- [ ] **Step 1: Run the final scoped checks**

```powershell
node --test tests/facebook-card-content.test.js tests/facebook-card-renderer.test.js tests/facebook-hana-laptop-pilot.test.js tests/facebook-laptop-shopping-queue.test.js tests/facebook-post-queue.test.js tests/facebook-publisher.test.js
git diff --check
```

Expected: all tests pass and `git diff --check` reports no whitespace errors.

- [ ] **Step 2: Report the unpublished pilot**

Provide clickable paths to the HANA reference and all three rendered cards. State explicitly that no Facebook API call was made and no existing post was replaced.

- [ ] **Step 3: Wait for explicit publishing direction**

Do not add the pilot to a live queue, read `meta.env`, delete an existing post, or call the Facebook Graph API during this plan. Publishing requires a separate user decision after visual approval.
