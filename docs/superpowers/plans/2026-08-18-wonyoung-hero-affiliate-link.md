# Wonyoung Hero Affiliate Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the first hero image on the Wonyoung jacket article open its existing Coupang Partners product link with standard tracking and affiliate attributes.

**Architecture:** Add a Wonyoung-only hero anchor in the shared female-celebrity page generator, regenerate the pages, and assert that the completed Wonyoung HTML has the same destination as its product card while the Suzy hero remains unlinked.

**Tech Stack:** Vanilla Node.js, static HTML, Node test runner.

---

### Task 1: Link only the Wonyoung article hero image

**Files:**
- Modify: `tests/female-celebrity-outfit-guides.test.js`
- Modify: `scripts/generate-female-celebrity-outfit-guides.js`
- Modify: `blog/wonyoung-eider-sheer-jacket-guide.html`

- [ ] **Step 1: Write the failing hero-link test**

Append this test:

```js
test('Wonyoung hero image links to the same tracked Coupang product as its product card', () => {
  const html = fs.readFileSync('blog/wonyoung-eider-sheer-jacket-guide.html', 'utf8');
  const hero = html.match(/<figure class="article-hero">([\s\S]*?)<\/figure>/)?.[1] || '';
  const heroLink = hero.match(/<a href="([^"]+)"[^>]*data-coupang-link[^>]*data-coupang-placement="article_hero"[^>]*data-coupang-product-type="celebrity_wonyoung_eider_dwm26154"[^>]*>/);
  const productLink = html.match(/<a href="([^"]+)"[^>]*data-coupang-placement="product_card"/);

  assert.ok(heroLink, 'Wonyoung hero should be a tracked affiliate link');
  assert.ok(productLink, 'Wonyoung product card should keep its affiliate link');
  assert.equal(heroLink[1], productLink[1]);
  assert.match(heroLink[0], /target="_blank"/);
  assert.match(heroLink[0], /rel="sponsored nofollow"/);
  assert.match(heroLink[0], /referrerpolicy="unsafe-url"/);

  const suzy = fs.readFileSync('blog/suzy-k2-dry-ice-shirt-guide.html', 'utf8');
  const suzyHero = suzy.match(/<figure class="article-hero">([\s\S]*?)<\/figure>/)?.[1] || '';
  assert.doesNotMatch(suzyHero, /data-coupang-placement="article_hero"/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test tests/female-celebrity-outfit-guides.test.js`

Expected: FAIL because the Wonyoung hero currently contains a bare `img`.

- [ ] **Step 3: Build conditional hero markup in the generator**

Immediately after `const hero = page.product.image;` add:

```js
  const heroImage = `<img src="${escapeHtml(hero)}" alt="${escapeHtml(page.brand)} ${escapeHtml(page.productName)} ${escapeHtml(page.model)} 상품 이미지" width="657" height="657">`;
  const heroMarkup = page.slug === 'wonyoung-eider-sheer-jacket-guide'
    ? `<a href="${escapeHtml(page.product.url)}" target="_blank" rel="sponsored nofollow" referrerpolicy="unsafe-url" data-coupang-link data-coupang-placement="article_hero" data-coupang-product-type="${escapeHtml(page.productType)}">${heroImage}</a>`
    : heroImage;
```

Replace the bare hero `img` in the template with:

```html
            ${heroMarkup}
```

- [ ] **Step 4: Regenerate both celebrity pages**

Run: `node scripts/generate-female-celebrity-outfit-guides.js`

Expected: the Wonyoung HTML gains the hero anchor and the Suzy hero remains a bare image.

- [ ] **Step 5: Run focused and tracking tests**

Run:

```powershell
node --test tests/female-celebrity-outfit-guides.test.js tests/blog-coupang-tracking.test.js
```

Expected: all focused tests pass.

- [ ] **Step 6: Verify generated output is stable**

Run:

```powershell
node scripts/generate-female-celebrity-outfit-guides.js
git diff --check
```

Expected: the second generation creates no additional diff and no whitespace errors.

- [ ] **Step 7: Commit**

```powershell
git add -- scripts/generate-female-celebrity-outfit-guides.js tests/female-celebrity-outfit-guides.test.js blog/wonyoung-eider-sheer-jacket-guide.html
git commit -m "feat: link wonyoung hero to coupang"
```

- [ ] **Step 8: Stop before external publication**

Do not push until the user reviews the completed local change.
