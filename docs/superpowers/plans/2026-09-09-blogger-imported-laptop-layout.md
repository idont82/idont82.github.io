# Blogger Imported Laptop Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the existing Blogger laptop post to match the source page's readable cards, prominent prices, comparison table, and mobile layout without creating a duplicate post.

**Architecture:** The importer will decorate known laptop-page classes with both a scoped stylesheet and inline fallbacks. The Blogger client will update the marker-matched post in place, then the workflow will fetch and validate the saved content and the public page.

**Tech Stack:** Node.js built-ins, `node:test`, Blogger API v3, OAuth 2.0, HTML/CSS.

---

### Task 1: Add Blogger post update support

**Files:**
- Modify: `scripts/blogger-api.js`
- Modify: `tests/blogger-api.test.js`

- [ ] **Step 1: Write the failing update test**

```js
test('updates an existing post by ID', async () => {
  const calls = [];
  const client = new BloggerClient({
    token: 'x',
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return new Response('{"id":"post1"}', { status: 200 });
    },
  });
  await client.updatePost('blog1', 'post1', { title: '제목', content: '<p>본문</p>' });
  assert.match(calls[0].url, /\/blogs\/blog1\/posts\/post1$/);
  assert.equal(calls[0].init.method, 'PUT');
});
```

- [ ] **Step 2: Run the test and verify it fails because `updatePost` is absent**

Run: `node --test tests/blogger-api.test.js`

- [ ] **Step 3: Add the minimal API method**

```js
updatePost(blogId, postId, post) {
  return this.request(`/blogs/${encodeURIComponent(blogId)}/posts/${encodeURIComponent(postId)}`, {
    method: 'PUT',
    body: post,
  });
}
```

- [ ] **Step 4: Run the API tests**

Run: `node --test tests/blogger-api.test.js`
Expected: all tests pass.

- [ ] **Step 5: Commit exact files**

```powershell
git add -- scripts/blogger-api.js tests/blogger-api.test.js
git commit --only scripts/blogger-api.js tests/blogger-api.test.js -m "feat: update existing Blogger posts"
```

### Task 2: Preserve the laptop visual hierarchy

**Files:**
- Modify: `scripts/publish-existing-page-to-blogger.js`
- Modify: `tests/publish-existing-page-to-blogger.test.js`

- [ ] **Step 1: Add failing layout assertions**

```js
test('adds scoped responsive styles and inline laptop fallbacks', () => {
  const post = buildImportedPost(laptopFixtureHtml, sourceUrl);
  assert.match(post.content, /\.goldpick-import \.laptop-product-card/);
  assert.match(post.content, /@media\s*\(max-width:680px\)/);
  assert.equal((post.content.match(/data-blogger-price="prominent"/g) || []).length, 3);
  assert.equal((post.content.match(/data-blogger-product-card="styled"/g) || []).length, 3);
  assert.equal((post.content.match(/data-blogger-buy-button="styled"/g) || []).length, 3);
  assert.ok(post.content.trim().endsWith('이에 따른 일정액의 수수료를 제공받습니다.</p>'));
});
```

- [ ] **Step 2: Run the importer tests and verify the new assertions fail**

Run: `node --test tests/publish-existing-page-to-blogger.test.js`

- [ ] **Step 3: Implement scoped CSS and class-based inline fallbacks**

Add `LAPTOP_SCOPED_CSS`, `addInlineStyle(tag, style)`, and `decorateLaptopLayout(html)`. Style `.laptop-summary`, `.laptop-hero`, `.laptop-table`, `.laptop-product-card`, `.laptop-product-image`, `.laptop-role-label`, `.laptop-price`, `.laptop-buy-button`, `.laptop-caution`, and `.laptop-disclosure`. Add `data-blogger-*` markers to product cards, prices, and buttons. Place the scoped `<style>` before the `.goldpick-import` wrapper and keep the disclosure after the wrapper.

- [ ] **Step 4: Run importer tests**

Run: `node --test tests/publish-existing-page-to-blogger.test.js`
Expected: all tests pass with exactly three styled cards, prices, and buttons.

- [ ] **Step 5: Commit exact files**

```powershell
git add -- scripts/publish-existing-page-to-blogger.js tests/publish-existing-page-to-blogger.test.js
git commit --only scripts/publish-existing-page-to-blogger.js tests/publish-existing-page-to-blogger.test.js -m "fix: preserve Blogger laptop layout"
```

### Task 3: Update and verify the existing live post

**Files:**
- Modify: `scripts/publish-existing-page-to-blogger.js`
- Modify: `tests/publish-existing-page-to-blogger.test.js`
- Update locally: `.blogger-artifacts/imports/blog-best-value-laptop-top3-guide-html.json`

- [ ] **Step 1: Add a failing workflow test**

```js
test('updates a marker-matched post instead of inserting another', async () => {
  const result = await publishExistingPage({ file, sourceUrl, dependencies });
  assert.equal(result.status, 'updated');
  assert.equal(calls.update, 1);
  assert.equal(calls.insert, 0);
});
```

- [ ] **Step 2: Run the workflow test and verify the old `recovered` behavior fails**

Run: `node --test tests/publish-existing-page-to-blogger.test.js`

- [ ] **Step 3: Update in place and strengthen verification**

When the source marker exists, call `client.updatePost(blog.id, existing.id, expected)`, fetch it with `getPost`, and return `status: 'updated'`. Extend `verifyImportedPost` to require three `data-blogger-product-card="styled"`, three `data-blogger-price="prominent"`, three styled buy buttons, the scoped stylesheet, mobile media rule, four images, and bottom disclosure.

- [ ] **Step 4: Run all Blogger tests**

Run: `node --test tests/blogger-*.test.js tests/build-blogger-health-post.test.js tests/publish-blogger-assets.test.js tests/publish-blogger-health-post.test.js tests/publish-existing-page-to-blogger.test.js`
Expected: zero failures.

- [ ] **Step 5: Commit the workflow and run the live update**

```powershell
git add -- scripts/publish-existing-page-to-blogger.js tests/publish-existing-page-to-blogger.test.js
git commit --only scripts/publish-existing-page-to-blogger.js tests/publish-existing-page-to-blogger.test.js -m "fix: update imported Blogger posts in place"
node --use-system-ca scripts/publish-existing-page-to-blogger.js --file blog/best-value-laptop-top3-guide.html --url https://idont82.github.io/blog/best-value-laptop-top3-guide.html
```

Expected: `status` is `updated`, post ID remains `6524190615355725071`, and the URL remains `https://goldpick-choice.blogspot.com/2026/09/top-3.html`.

- [ ] **Step 6: Verify the public page**

Fetch the public Blogger URL with a fresh request and require HTTP 200, three styled product cards, three emphasized prices, four product images, responsive CSS, and the disclosure at the bottom.
