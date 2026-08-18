const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const rootDir = path.join(__dirname, '..');
const manifest = require('../data/autumn-blog-guides.json');

test('가을 블로그 글 5개가 SEO와 제휴 링크 계약을 지킨다', () => {
  assert.equal(manifest.length, 5);

  for (const page of manifest) {
    const html = fs.readFileSync(path.join(rootDir, 'blog', `${page.slug}.html`), 'utf8');
    const productCards = html.match(/class="autumn-product-card"/g) || [];

    assert.match(html, /<html lang="ko">/);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.match(html, new RegExp(page.keyword));
    assert.match(html, /<meta name="description"/);
    assert.match(html, /<link rel="canonical"/);
    assert.match(html, /max-image-preview:large/);
    assert.match(html, /BlogPosting/);
    assert.match(html, /data-coupang-placement="article_hero"/);
    assert.match(html, /data-coupang-placement="product_card"/);
    assert.match(html, new RegExp(`data-coupang-product-type="${page.productType}"`));
    assert.match(html, /rel="sponsored nofollow"/);
    assert.match(html, /쿠팡 파트너스 활동의 일환/);
    assert.equal(productCards.length, page.productCount);
  }
});

test('홈과 사이트맵에 가을 글 5개가 각각 한 번씩 노출된다', () => {
  const home = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  const sitemap = fs.readFileSync(path.join(rootDir, 'sitemap.xml'), 'utf8');

  for (const page of manifest) {
    assert.equal((home.match(new RegExp(`blog/${page.slug}\\.html`, 'g')) || []).length, 1);
    assert.equal((sitemap.match(new RegExp(`blog/${page.slug}\\.html`, 'g')) || []).length, 1);
  }
});
