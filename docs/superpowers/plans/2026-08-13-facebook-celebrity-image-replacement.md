# Facebook Celebrity Image Replacement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Wonyoung Facebook cards with three person-free, logo-free mint jacket images while preserving all other article, affiliate, and publishing behavior.

**Architecture:** Add an optional queue-level `cardImageUrls` override whose three safe root-relative paths take priority over extracted affiliate images. Teach the Python renderer to resolve root-relative repository images without network access, then generate and visually verify three original jacket assets.

**Tech Stack:** Vanilla Node.js, Python 3 with Pillow, JSON, Node test runner, image generation.

---

## File Map

- `data/facebook-post-queue.json`: assigns the three approved card-only image paths to the Wonyoung item.
- `scripts/facebook-post-queue.js`: validates optional image override shape and path safety.
- `scripts/facebook-card-content.js`: prioritizes queue image overrides and retains article images as fallback candidates.
- `scripts/generate-facebook-cards.py`: opens root-relative checked-in image paths from the repository.
- `images/facebook-card-news/wonyoung-jacket-*.png`: original person-free jacket images.
- `tests/facebook-post-queue.test.js`: tests the optional override contract.
- `tests/facebook-card-content.test.js`: tests override order and fallback behavior.
- `tests/facebook-card-renderer.test.js`: tests root-relative local image loading.

### Task 1: Define the safe queue image override

**Files:**
- Modify: `tests/facebook-post-queue.test.js`
- Modify: `scripts/facebook-post-queue.js`

- [ ] **Step 1: Write failing validation tests**

Add a valid override and reject unsafe or wrongly sized overrides:

```js
test('queue accepts exactly three safe root-relative card image overrides', () => {
  const overridden = structuredClone(queue.slice(0, 1));
  overridden[0].cardImageUrls = [
    '/images/facebook-card-news/front.png',
    '/images/facebook-card-news/detail.png',
    '/images/facebook-card-news/hood.png',
  ];
  assert.doesNotThrow(() => validateQueue(overridden));

  for (const invalid of [
    ['https://example.com/image.png'],
    ['/images/facebook-card-news/one.png'],
    ['/images/facebook-card-news/../secret.png', '/images/a.png', '/images/b.png'],
  ]) {
    const changed = structuredClone(queue.slice(0, 1));
    changed[0].cardImageUrls = invalid;
    assert.throws(() => validateQueue(changed), /cardImageUrls/);
  }
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/facebook-post-queue.test.js`

Expected: FAIL because `validateQueue()` does not validate `cardImageUrls`.

- [ ] **Step 3: Implement optional path validation**

Inside `validateQueue()`, add:

```js
if (item.cardImageUrls !== undefined) {
  const safeImagePath = /^\/images\/facebook-card-news\/[a-z0-9-]+\.png$/;
  if (!Array.isArray(item.cardImageUrls) || item.cardImageUrls.length !== 3
    || item.cardImageUrls.some((imagePath) => typeof imagePath !== 'string'
      || !safeImagePath.test(imagePath))) {
    throw new Error(`${item.id} has invalid cardImageUrls`);
  }
}
```

- [ ] **Step 4: Run the test and verify GREEN**

Run: `node --test tests/facebook-post-queue.test.js`

Expected: all queue tests pass.

- [ ] **Step 5: Commit**

```powershell
git add -- scripts/facebook-post-queue.js tests/facebook-post-queue.test.js
git commit -m "feat: validate facebook card image overrides"
```

### Task 2: Prioritize overrides and load repository images

**Files:**
- Modify: `tests/facebook-card-content.test.js`
- Modify: `scripts/facebook-card-content.js`
- Modify: `tests/facebook-card-renderer.test.js`
- Modify: `scripts/generate-facebook-cards.py`

- [ ] **Step 1: Write failing content override test**

```js
test('queue card image overrides take priority and retain article images as fallback', () => {
  const item = {
    ...queueItem,
    cardImageUrls: ['/images/facebook-card-news/a.png', '/images/facebook-card-news/b.png', '/images/facebook-card-news/c.png'],
  };
  const content = buildPostContent(item, html);
  assert.deepEqual(content.slides.map((slide) => slide.imageUrl), item.cardImageUrls);
  assert.deepEqual(content.slides[0].imageUrls, [item.cardImageUrls[0], productOne, productTwo]);
});
```

- [ ] **Step 2: Run content test and verify RED**

Run: `node --test tests/facebook-card-content.test.js`

Expected: FAIL because extracted article images still remain primary.

- [ ] **Step 3: Implement override candidate construction**

In `buildPostContent()` replace the candidate source with:

```js
const overrideImages = queueItem.cardImageUrls || [];
const imageCandidates = overrideImages.length
  ? overrideImages.map((imageUrl, index) => [
    imageUrl,
    ...overrideImages.filter((_, candidateIndex) => candidateIndex !== index),
    ...article.productImages.filter((candidate) => candidate !== imageUrl),
  ])
  : selectThreeImageCandidates(article.productImages);
```

- [ ] **Step 4: Write failing root-relative renderer test**

Use an existing checked-in PNG and assert a three-slide render succeeds:

```js
test('renderer loads a root-relative checked-in image', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'facebook-local-image-'));
  const input = writeContent(dir);
  const content = JSON.parse(fs.readFileSync(input, 'utf8'));
  for (const slide of content.slides) {
    slide.imageUrl = '/images/summer-diapers-top3-thumbnail.png';
    slide.imageUrls = [slide.imageUrl];
  }
  fs.writeFileSync(input, JSON.stringify(content));
  const result = render(input, dir);
  assert.equal(result.status, 0, result.stderr);
});
```

- [ ] **Step 5: Run renderer test and verify RED**

Run: `node --test tests/facebook-card-renderer.test.js`

Expected: FAIL with unsupported image URL or no image loaded.

- [ ] **Step 6: Implement safe repository path resolution**

In `open_source_image()` before remote URL handling:

```py
  if url.startswith("/images/facebook-card-news/") or url.startswith("/images/"):
    project_root = Path(__file__).resolve().parent.parent
    local_path = (project_root / url.lstrip("/")).resolve()
    images_root = (project_root / "images").resolve()
    if images_root not in local_path.parents:
      raise ValueError("Card image path leaves the images directory")
    return Image.open(local_path).convert("RGB")
```

- [ ] **Step 7: Run focused tests and verify GREEN**

Run: `node --test tests/facebook-card-content.test.js tests/facebook-card-renderer.test.js`

Expected: all focused tests pass.

- [ ] **Step 8: Commit**

```powershell
git add -- scripts/facebook-card-content.js scripts/generate-facebook-cards.py tests/facebook-card-content.test.js tests/facebook-card-renderer.test.js
git commit -m "feat: support local facebook card images"
```

### Task 3: Generate and assign three person-free jacket images

**Files:**
- Create: `images/facebook-card-news/wonyoung-jacket-front.png`
- Create: `images/facebook-card-news/wonyoung-jacket-detail.png`
- Create: `images/facebook-card-news/wonyoung-jacket-hood.png`
- Modify: `data/facebook-post-queue.json`

- [ ] **Step 1: Generate the front product image**

Use the image generation skill with this exact direction:

```text
Portrait 4:5 commercial product photograph of a generic mint lightweight women's hooded windbreaker hanging on a plain wooden hanger, front view, airy pale studio background, realistic nylon texture, no person, no face, no mannequin head, no brand logo, no trademark, no text, no watermark, original unbranded design, ample clean space around the jacket.
```

- [ ] **Step 2: Generate the material-detail image**

```text
Portrait 4:5 macro commercial product photograph of a generic mint lightweight hooded windbreaker, focusing on unbranded zipper, seam, and translucent lightweight fabric texture, softly folded garment, neutral studio background, no person, no face, no body parts, no logo, no trademark, no text, no watermark.
```

- [ ] **Step 3: Generate the hood and silhouette image**

```text
Portrait 4:5 commercial product photograph of a generic mint lightweight women's hooded windbreaker displayed on a headless neutral garment form, three-quarter side view emphasizing hood and airy silhouette, clean studio lighting, no person, no face, no skin, no brand logo, no trademark, no text, no watermark.
```

Save the resulting PNGs under the exact paths listed above. Inspect every source image before use and reject any output containing a person, face, brand, letters, or watermark.

- [ ] **Step 4: Add the queue override**

Add to `20260811-celebrity-wonyoung-eider`:

```json
"cardImageUrls": [
  "/images/facebook-card-news/wonyoung-jacket-front.png",
  "/images/facebook-card-news/wonyoung-jacket-detail.png",
  "/images/facebook-card-news/wonyoung-jacket-hood.png"
],
```

- [ ] **Step 5: Verify all Facebook tests**

Run:

```powershell
$facebookTests = Get-ChildItem tests\facebook-*.test.js | Select-Object -ExpandProperty FullName
node --test $facebookTests
```

Expected: zero Facebook test failures.

- [ ] **Step 6: Render and inspect the next post**

Run:

```powershell
node scripts/publish-facebook-posts.js --dry-run --now 2026-08-30T00:00:00Z --output-dir .facebook-artifacts/safe-photo-preview
```

Expected: three 1080×1350 cards for `20260811-celebrity-wonyoung-eider`. Inspect all three at full size and confirm no person, face, logo, trademark, text baked into the source, or visual artifact appears.

- [ ] **Step 7: Verify repository integrity**

Run:

```powershell
node scripts/build-facebook-short-links.js
git diff --exit-code -- g/index.html g/redirect.js
git diff --check
git status --short
```

Expected: generated short links unchanged, no whitespace errors, and only intentional image replacement changes staged or modified.

- [ ] **Step 8: Commit**

```powershell
git add -- data/facebook-post-queue.json images/facebook-card-news/wonyoung-jacket-front.png images/facebook-card-news/wonyoung-jacket-detail.png images/facebook-card-news/wonyoung-jacket-hood.png
git commit -m "feat: replace celebrity facebook card images"
```

- [ ] **Step 9: Stop before external publication**

Show the three generated card previews to the user. Do not push, merge, deploy, or publish to Facebook without a new explicit approval.
