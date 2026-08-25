const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const rootDir = path.join(__dirname, '..');
const manifest = require('../data/laptop-blog-guides.json');

function read(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

test('노트북 글 세 편이 SEO와 제휴 링크 계약을 지킨다', () => {
  assert.equal(manifest.length, 3);

  for (const page of manifest) {
    const html = read(`blog/${page.slug}.html`);
    assert.equal((html.match(/class="laptop-product-card"/g) || []).length, 3);
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.match(html, /<html lang="ko">/);
    assert.match(html, /<meta name="description"/);
    assert.match(html, /<link rel="canonical"/);
    assert.match(html, /max-image-preview:large/);
    assert.match(html, /BlogPosting/);
    assert.match(html, /data-coupang-placement="article_hero"/);
    assert.match(html, /data-coupang-placement="product_card"/);
    assert.match(html, /data-coupang-placement="mobile_summary_card"/);
    assert.match(html, new RegExp(`data-coupang-product-type="${page.productType}"`));
    assert.match(html, /rel="sponsored nofollow"/);
    assert.match(html, /쿠팡 파트너스 활동의 일환/);
    assert.doesNotMatch(html, /직접 사용|써보니|벤치마크 1위|배터리 종일/);
  }
});

test('세 글은 서로 다른 아홉 상품을 사용한다', () => {
  const productIds = new Set();
  for (const page of manifest) {
    const html = read(`blog/${page.slug}.html`);
    const ids = [...html.matchAll(/data-product-id="(\d+)"/g)].map((match) => match[1]);
    assert.equal(ids.length, 3);
    ids.forEach((id) => productIds.add(id));
  }
  assert.equal(productIds.size, 9);
});

test('각 글은 다른 두 노트북 가이드를 함께 읽기로 연결한다', () => {
  for (const page of manifest) {
    const html = read(`blog/${page.slug}.html`);
    const relatedSlugs = manifest.filter((candidate) => candidate.slug !== page.slug);
    for (const related of relatedSlugs) {
      assert.match(html, new RegExp(`/blog/${related.slug}\\.html`));
    }
  }
});

test('루트·블로그 인덱스·사이트맵에 각 글이 정확히 한 번 노출된다', () => {
  const root = read('index.html');
  const blogIndex = read('blog/index.html');
  const sitemap = read('sitemap.xml');

  for (const page of manifest) {
    const pattern = new RegExp(`blog/${page.slug}\\.html`, 'g');
    assert.equal((root.match(pattern) || []).length, 1);
    assert.equal((blogIndex.match(pattern) || []).length, 1);
    assert.equal((sitemap.match(pattern) || []).length, 1);
  }
});

test('고성능 글과 문서용 글이 옵션별 핵심 주의를 명시한다', () => {
  const performance = read('blog/highest-performance-laptop-top3-guide.html');
  const document = read('blog/document-work-laptop-top3-guide.html');

  assert.match(performance, /GPU 전력/);
  assert.match(performance, /냉각 설계/);
  assert.match(performance, /RAM 확장/);
  assert.match(performance, /어댑터 무게/);
  assert.match(document, /Office 제품/);
  assert.match(document, /Windows/);
  assert.match(document, /라이선스/);
});
