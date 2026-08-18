const test = require('node:test');
const assert = require('node:assert/strict');

const {
  renderArticle,
  updateIndex,
  updateSitemap,
  validateInputs,
} = require('../scripts/generate-autumn-blog-pages');

const page = {
  slug: 'sample-autumn-guide',
  productType: 'sample_autumn',
  keyword: '가을 샘플 추천',
  productData: 'sample.json',
  productCount: 1,
  title: '가을 샘플 추천, 고르는 기준',
  description: '가을 샘플을 고르는 기준을 정리했습니다.',
  intro: '가을에 필요한 샘플을 비교합니다.',
  criteria: ['첫 기준을 확인합니다.', '둘째 기준을 확인합니다.', '셋째 기준을 확인합니다.'],
  caution: '표시사항을 우선 확인합니다.',
  faq: [['어떻게 고르나요?', '사용 환경을 먼저 확인합니다.']],
  roleLabels: ['대표 상품'],
  sources: [['공식 자료', 'https://example.com/source']],
};

const productData = {
  group: 'sample',
  verifiedAt: '2026-08-18T00:00:00.000Z',
  items: [{
    productId: 123,
    productName: '가을 샘플 상품',
    productPrice: 19900,
    priceLabel: '약 2만원',
    productImage: 'https://ads-partners.coupang.com/sample.jpg',
    productUrl: 'https://link.coupang.com/a/sample',
    roleKeyword: '가을 샘플',
  }],
};

test('입력 검증 후 완전한 한국어 상품 글을 렌더링한다', () => {
  validateInputs([page], { 'sample.json': productData });
  const html = renderArticle(page, productData, [page]);

  assert.match(html, /<html lang="ko">/);
  assert.match(html, /data-coupang-placement="article_hero"/);
  assert.match(html, /data-coupang-placement="product_card"/);
  assert.match(html, /data-product-id="123"/);
  assert.match(html, /가을 샘플 상품/);
  assert.match(html, /BlogPosting/);
});

test('잘못된 상품 개수나 링크는 쓰기 전에 거부한다', () => {
  assert.throws(
    () => validateInputs([{ ...page, productCount: 2 }], { 'sample.json': productData }),
    /상품 개수/,
  );
  assert.throws(
    () => validateInputs([page], {
      'sample.json': {
        ...productData,
        items: [{ ...productData.items[0], productUrl: 'https://example.com/product' }],
      },
    }),
    /affiliate URL/,
  );
});

test('홈 가을 카드 묶음을 같은 위치에 멱등 삽입한다', () => {
  const original = '<main><div class="blog-card-list">\n</div></main>';
  const once = updateIndex(original, [page], { 'sample.json': productData });
  const twice = updateIndex(once, [page], { 'sample.json': productData });

  assert.equal(once, twice);
  assert.equal((once.match(/blog\/sample-autumn-guide\.html/g) || []).length, 1);
  assert.match(once, /AUTUMN-BLOG-START/);
});

test('사이트맵 항목을 멱등 삽입한다', () => {
  const original = '<?xml version="1.0"?><urlset>\n</urlset>';
  const once = updateSitemap(original, [page]);
  const twice = updateSitemap(once, [page]);

  assert.equal(once, twice);
  assert.equal((once.match(/blog\/sample-autumn-guide\.html/g) || []).length, 1);
  assert.match(once, /AUTUMN-SITEMAP-START/);
});
