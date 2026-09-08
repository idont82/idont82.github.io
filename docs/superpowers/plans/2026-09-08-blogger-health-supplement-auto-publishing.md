# Blogger Health Supplement Auto-Publishing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish one evidence-based health-supplement article with three images and a 1,500–2,000 character body directly to Gold Pick Blogger, then make the verified flow reusable.

**Architecture:** A local campaign JSON is validated and converted to Blogger-safe HTML, while a Pillow renderer creates three informative images. A guarded asset publisher commits only that campaign's image directory to `main`, waits for GitHub Pages HTTP 200 responses, and an OAuth-authenticated Blogger client publishes exactly once and verifies the remote post.

**Tech Stack:** Node.js built-ins (`node:test`, `fetch`, `http`, `crypto`, `child_process`), Blogger API v3, OAuth 2.0, Python 3/Pillow, GitHub Pages, existing Coupang Partners scripts.

---

### Task 1: Protect Blogger credentials and define campaign paths

**Files:**
- Modify: `.gitignore`
- Create: `scripts/blogger-paths.js`
- Test: `tests/blogger-paths.test.js`

- [ ] **Step 1: Write the failing path test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { bloggerPaths } = require('../scripts/blogger-paths');

test('keeps credentials outside tracked content', () => {
  const result = bloggerPaths(path.resolve('.'));
  assert.match(result.oauthClient, /\.blogger-artifacts[\\/]oauth-client\.json$/);
  assert.match(result.token, /\.blogger-artifacts[\\/]token\.json$/);
  assert.equal(result.blogUrl, 'https://goldpick-choice.blogspot.com/');
});
```

- [ ] **Step 2: Run the test and verify `MODULE_NOT_FOUND`**

Run: `node --test tests/blogger-paths.test.js`

- [ ] **Step 3: Implement paths and ignore the secret directory**

```js
const path = require('node:path');

function bloggerPaths(root) {
  const privateRoot = path.join(root, '.blogger-artifacts');
  return {
    privateRoot,
    oauthClient: path.join(privateRoot, 'oauth-client.json'),
    token: path.join(privateRoot, 'token.json'),
    blogUrl: 'https://goldpick-choice.blogspot.com/',
  };
}

module.exports = { bloggerPaths };
```

Append `.blogger-artifacts/` to `.gitignore`.

- [ ] **Step 4: Run the test and secret-tracking check**

Run: `node --test tests/blogger-paths.test.js`

Run: `git check-ignore .blogger-artifacts/token.json`
Expected: 1 passing test and the ignored path.

- [ ] **Step 5: Commit only these files**

```powershell
git add -- .gitignore scripts/blogger-paths.js tests/blogger-paths.test.js
git commit --only .gitignore scripts/blogger-paths.js tests/blogger-paths.test.js -m "feat: add Blogger private paths"
```

### Task 2: Implement one-time OAuth and token refresh

**Files:**
- Create: `scripts/blogger-oauth.js`
- Test: `tests/blogger-oauth.test.js`

- [ ] **Step 1: Write failing tests for client parsing and refresh**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseInstalledClient, refreshAccessToken } = require('../scripts/blogger-oauth');

test('accepts Google installed-app credentials', () => {
  const parsed = parseInstalledClient({ installed: {
    client_id: 'id', client_secret: 'secret', redirect_uris: ['http://localhost'],
  }});
  assert.equal(parsed.clientId, 'id');
});

test('refreshes without exposing the refresh token', async () => {
  const fetchImpl = async () => new Response(JSON.stringify({ access_token: 'access', expires_in: 3600 }), {
    status: 200, headers: { 'content-type': 'application/json' },
  });
  const token = await refreshAccessToken({ clientId: 'id', clientSecret: 'secret' }, { refresh_token: 'refresh' }, fetchImpl);
  assert.equal(token.access_token, 'access');
  assert.equal(token.refresh_token, 'refresh');
});
```

- [ ] **Step 2: Run tests and verify missing-module failure**

Run: `node --test tests/blogger-oauth.test.js`

- [ ] **Step 3: Implement OAuth helpers and CLI**

Implement exports `parseInstalledClient(raw)`, `refreshAccessToken(client, token, fetchImpl)`, `authorizeInteractive(paths)`, and `getAccessToken(paths)`. Interactive authorization must use a random state, a loopback server on `127.0.0.1`, scope `https://www.googleapis.com/auth/blogger`, `access_type=offline`, and `prompt=consent`. Save JSON with mode `0o600`; never log client secrets or tokens.

The CLI behavior is:

```js
if (require.main === module) {
  authorizeInteractive(bloggerPaths(path.resolve('.')))
    .then(() => process.stdout.write('Blogger OAuth authorization saved.\n'))
    .catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
}
```

- [ ] **Step 4: Run OAuth unit tests**

Run: `node --test tests/blogger-oauth.test.js`
Expected: all tests pass without opening a browser.

- [ ] **Step 5: Commit OAuth files**

```powershell
git add -- scripts/blogger-oauth.js tests/blogger-oauth.test.js
git commit --only scripts/blogger-oauth.js tests/blogger-oauth.test.js -m "feat: add Blogger OAuth flow"
```

### Task 3: Add a small Blogger API client

**Files:**
- Create: `scripts/blogger-api.js`
- Test: `tests/blogger-api.test.js`

- [ ] **Step 1: Write failing tests for lookup, publish, and retry**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { BloggerClient } = require('../scripts/blogger-api');

test('publishes with isDraft false', async () => {
  const calls = [];
  const client = new BloggerClient({ token: 'x', fetchImpl: async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ id: 'p1', url: 'https://example/post' }), { status: 200 });
  }});
  await client.insertPost('b1', { title: '제목', content: '<p>본문</p>' });
  assert.match(calls[0].url, /isDraft=false/);
  assert.equal(calls[0].init.method, 'POST');
});
```

Add tests proving `getBlogByUrl()` URL-encodes the address, `listPosts()` returns an empty array when `items` is absent, 500 is retried up to three times, and 401 is not retried.

- [ ] **Step 2: Run tests and verify failure**

Run: `node --test tests/blogger-api.test.js`

- [ ] **Step 3: Implement `BloggerClient`**

Provide `request(path, options)`, `getBlogByUrl(url)`, `listPosts(blogId)`, `insertPost(blogId, post)`, and `getPost(blogId, postId)`. Use `https://www.googleapis.com/blogger/v3`, bearer authorization, JSON bodies, sanitized API errors, and bounded retry only for 429/5xx.

- [ ] **Step 4: Run API tests**

Run: `node --test tests/blogger-api.test.js`
Expected: all pass.

- [ ] **Step 5: Commit API files**

```powershell
git add -- scripts/blogger-api.js tests/blogger-api.test.js
git commit --only scripts/blogger-api.js tests/blogger-api.test.js -m "feat: add Blogger API client"
```

### Task 4: Validate and build the health article

**Files:**
- Create: `scripts/build-blogger-health-post.js`
- Test: `tests/build-blogger-health-post.test.js`

- [ ] **Step 1: Write a failing contract test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildPost, textLength } = require('../scripts/build-blogger-health-post');

test('builds a truthful long-form post with three images and bottom disclosure', () => {
  const campaign = require('./fixtures/blogger-health-campaign.json');
  const post = buildPost(campaign, 'https://idont82.github.io/images/blogger/sample');
  assert.ok(textLength(post.content) >= 1500 && textLength(post.content) <= 2000);
  assert.equal((post.content.match(/<img\b/g) || []).length, 3);
  assert.match(post.content, /rel="nofollow sponsored"/);
  assert.ok(post.content.trim().endsWith('이에 따른 일정액의 수수료를 제공받습니다.</p>'));
  assert.doesNotMatch(post.content, /먹어봤|복용해봤|치료|완치|효과를 보장/);
});
```

The fixture must contain `productId`, exact product data, `officialFacts`, `reviewPatterns`, `cautions`, five editorial paragraphs totaling the required range, and three image filenames.

- [ ] **Step 2: Run the test and verify failure**

Run: `node --test tests/build-blogger-health-post.test.js`

- [ ] **Step 3: Implement HTML escaping and validation**

Export `buildPost(campaign, imageBaseUrl)`, `validateCampaign(campaign)`, `textLength(html)`, and `markerFor(productId)`. Build semantic `h2`, `p`, `ul`, three `figure/img/figcaption` blocks, one sponsored Coupang link, a price-change notice, and the exact bottom disclosure. Reject fewer than three distinct image filenames, missing evidence fields, out-of-range text, and prohibited experience/medical phrases.

- [ ] **Step 4: Run builder tests**

Run: `node --test tests/build-blogger-health-post.test.js`
Expected: all pass.

- [ ] **Step 5: Commit builder files**

```powershell
git add -- scripts/build-blogger-health-post.js tests/build-blogger-health-post.test.js tests/fixtures/blogger-health-campaign.json
git commit --only scripts/build-blogger-health-post.js tests/build-blogger-health-post.test.js tests/fixtures/blogger-health-campaign.json -m "feat: build Blogger health articles"
```

### Task 5: Render three Blogger images

**Files:**
- Create: `scripts/render-blogger-health-images.py`
- Test: `tests/test_render_blogger_health_images.py`

- [ ] **Step 1: Write failing renderer tests**

Create a temporary 512×512 product image and campaign JSON, invoke `render_campaign()`, and assert exactly `01-product.png`, `02-facts.png`, and `03-checklist.png` exist, are 1200×900 RGB PNG files, and have nonempty edge-safe content.

- [ ] **Step 2: Run and verify import failure**

Run: `python -m unittest tests/test_render_blogger_health_images.py`

- [ ] **Step 3: Implement the renderer**

Use Pillow and `C:\Windows\Fonts\malgun.ttf`/`malgunbd.ttf`. The product card uses the exact downloaded product image and name; the facts card uses only `officialFacts`; the checklist card separates `reviewPatterns.positive`, `reviewPatterns.caution`, and `cautions`. Implement wrapped Korean text with measured bounding boxes and raise on overflow.

- [ ] **Step 4: Run renderer tests and inspect fixtures**

Run: `python -m unittest tests/test_render_blogger_health_images.py`
Expected: all pass. Open all three fixture outputs at original resolution.

- [ ] **Step 5: Commit renderer files**

```powershell
git add -- scripts/render-blogger-health-images.py tests/test_render_blogger_health_images.py
git commit --only scripts/render-blogger-health-images.py tests/test_render_blogger_health_images.py -m "feat: render Blogger article images"
```

### Task 6: Guard GitHub Pages asset publication

**Files:**
- Create: `scripts/publish-blogger-assets.js`
- Test: `tests/publish-blogger-assets.test.js`

- [ ] **Step 1: Write failing validation tests**

Test `assertSafeAssetDirectory(root, slug, directory)` rejects traversal, paths outside `images/blogger`, and slugs not matching `[a-z0-9-]+`; test `publicImageUrls(slug, files)` returns three `https://idont82.github.io/images/blogger/...` URLs.

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/publish-blogger-assets.test.js`

- [ ] **Step 3: Implement guarded publication**

Export `assertSafeAssetDirectory`, `publicImageUrls`, `commitAssetDirectory`, and `waitForPublicImages`. `commitAssetDirectory` must use `git add -- <exact directory>`, `git diff --cached --check -- <exact directory>`, and `git commit --only <exact directory>`, then `git push origin main`. It must never stage the whole repository. Poll each URL with `cache: 'no-store'` for up to five minutes and require HTTP 200 with an image content type.

- [ ] **Step 4: Run unit tests with mocked command runner and fetch**

Run: `node --test tests/publish-blogger-assets.test.js`
Expected: all pass without committing or using the network.

- [ ] **Step 5: Commit publisher files**

```powershell
git add -- scripts/publish-blogger-assets.js tests/publish-blogger-assets.test.js
git commit --only scripts/publish-blogger-assets.js tests/publish-blogger-assets.test.js -m "feat: publish Blogger image assets"
```

### Task 7: Orchestrate idempotent immediate publication

**Files:**
- Create: `scripts/publish-blogger-health-post.js`
- Test: `tests/publish-blogger-health-post.test.js`

- [ ] **Step 1: Write failing workflow tests**

Test that `--dry-run` creates no Git or Blogger calls; an existing marker returns `recovered`; a new campaign publishes with `isDraft=false`; image publication failure prevents Blogger calls; and remote verification checks title, three image URLs, product link, text range, and bottom disclosure.

- [ ] **Step 2: Run and verify failure**

Run: `node --test tests/publish-blogger-health-post.test.js`

- [ ] **Step 3: Implement the CLI and dependency-injected workflow**

Export `runPublication({ campaignPath, dryRun, dependencies })`. Resolve the blog by URL, check recent posts for `<!-- goldpick-product:<id> -->`, render images, validate HTML, publish assets, refresh OAuth, insert with `isDraft=false`, fetch the post back, verify it, and write `.blogger-artifacts/<slug>/publication.json`. Log only slug, product ID, post ID, URL, and checks.

- [ ] **Step 4: Run all Blogger unit tests**

Run: `node --test tests/blogger-*.test.js tests/build-blogger-health-post.test.js`

Run: `python -m unittest tests/test_render_blogger_health_images.py`
Expected: zero failures.

- [ ] **Step 5: Commit the workflow**

```powershell
git add -- scripts/publish-blogger-health-post.js tests/publish-blogger-health-post.test.js
git commit --only scripts/publish-blogger-health-post.js tests/publish-blogger-health-post.test.js -m "feat: automate Blogger health publication"
```

### Task 8: Research and prepare the first live campaign

**Files:**
- Create: `.blogger-artifacts/<slug>/product-source.json`
- Create: `.blogger-artifacts/<slug>/campaign.json`
- Create: `.blogger-artifacts/<slug>/product.png`
- Create: `images/blogger/<slug>/01-product.png`
- Create: `images/blogger/<slug>/02-facts.png`
- Create: `images/blogger/<slug>/03-checklist.png`

- [ ] **Step 1: Search current products**

Run the existing Coupang search script separately for 유산균, 오메가3, 종합비타민, and 마그네슘 with a campaign-specific subid. Save raw results locally and select one product only after validating exact name, current price, image, affiliate URL, seller/category consistency, and available official label facts.

- [ ] **Step 2: Write the campaign JSON**

Use evidence-backed `officialFacts`, paraphrased review patterns, neutral cautions, 1,500–2,000 characters of original editorial text, three distinct image names, and the exact bottom disclosure. Do not claim first-hand use or medical outcomes.

- [ ] **Step 3: Render and inspect three images**

Run: `python scripts/render-blogger-health-images.py --campaign .blogger-artifacts/<slug>/campaign.json --product .blogger-artifacts/<slug>/product.png --output images/blogger/<slug>`
Expected: three 1200×900 PNG files. Inspect every image at original resolution.

- [ ] **Step 4: Run a dry-run**

Run: `node --use-system-ca scripts/publish-blogger-health-post.js --campaign .blogger-artifacts/<slug>/campaign.json --dry-run`
Expected: validated title, product ID, 1,500–2,000 character count, three images, bottom disclosure, and no external writes.

### Task 9: Authorize and publish exactly one post

**Files:**
- Create locally: `.blogger-artifacts/oauth-client.json`
- Create locally: `.blogger-artifacts/token.json`
- Create locally: `.blogger-artifacts/<slug>/publication.json`

- [ ] **Step 1: Configure Google Cloud manually**

Enable Blogger API v3, configure the OAuth consent screen, create a Desktop OAuth client, and save the downloaded JSON as `.blogger-artifacts/oauth-client.json`.

- [ ] **Step 2: Complete one-time authorization**

Run: `node --use-system-ca scripts/blogger-oauth.js`
Expected: the browser asks for Blogger permission and the CLI reports that authorization was saved without printing tokens.

- [ ] **Step 3: Run the live publisher once**

Run: `node --use-system-ca scripts/publish-blogger-health-post.js --campaign .blogger-artifacts/<slug>/campaign.json`
Expected: image-only commit pushed to `main`, three image URLs return HTTP 200, and one Blogger post URL is returned.

- [ ] **Step 4: Perform fresh remote verification**

Run the same command again. Expected: `recovered`, the same Blogger post ID/URL, no new Git commit, and checks showing the title, three images, product link, text length, and final disclosure all match.

- [ ] **Step 5: Run the complete regression suite**

Run: `node --test tests/blogger-*.test.js tests/build-blogger-health-post.test.js`

Run: `python -m unittest tests/test_render_blogger_health_images.py`

Run: `git status --short`
Expected: all tests pass; unrelated user changes remain untouched; OAuth/token files are absent from Git status.
