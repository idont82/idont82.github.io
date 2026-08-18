const test = require('node:test');
const assert = require('node:assert/strict');

const {
  QUERY_GROUPS,
  collectAutumnProducts,
  isValidProduct,
  selectFirstValid,
} = require('../scripts/collect-autumn-products');

function validProduct(keyword, productId) {
  return {
    keyword,
    rank: 1,
    productId,
    productName: `${keyword} 상품`,
    productPrice: 29900,
    priceLabel: '약 3만원',
    productImage: 'https://ads-partners.coupang.com/image.jpg',
    productUrl: 'https://link.coupang.com/a/example',
    categoryName: '생활용품',
  };
}

test('필요한 가을 상품 역할 11개를 정의한다', () => {
  const count = Object.values(QUERY_GROUPS)
    .reduce((sum, queries) => sum + queries.length, 0);

  assert.equal(count, 11);
  assert.deepEqual(Object.keys(QUERY_GROUPS), [
    'bedding',
    'humidifier',
    'closet',
    'windbreaker',
    'trekking',
  ]);
});

test('상품 링크와 이미지 호스트를 검증한다', () => {
  assert.equal(isValidProduct(validProduct('가을 차렵이불', 101)), true);
  assert.equal(isValidProduct({
    ...validProduct('가을 차렵이불', 102),
    productImage: 'https://example.com/image.jpg',
  }), false);
  assert.equal(isValidProduct({
    ...validProduct('가을 차렵이불', 103),
    productUrl: 'javascript:alert(1)',
  }), false);
});

test('같은 글 안에서 중복되지 않는 첫 유효 상품을 고른다', () => {
  const seen = new Set([101]);
  const selected = selectFirstValid([
    validProduct('중복', 101),
    { ...validProduct('깨진 상품', 102), productPrice: 0 },
    validProduct('선택 상품', 103),
  ], seen);

  assert.equal(selected.productId, 103);
  assert.equal(seen.has(103), true);
});

test('모든 검색이 성공한 뒤 글별 상품 묶음을 반환한다', async () => {
  let nextId = 1000;
  const search = async ({ keyword }) => ({
    items: [validProduct(keyword, nextId++)],
  });

  const result = await collectAutumnProducts({ search, now: () => '2026-08-18T00:00:00.000Z' });

  assert.equal(result.bedding.items.length, 3);
  assert.equal(result.humidifier.items.length, 3);
  assert.equal(result.closet.items.length, 3);
  assert.equal(result.windbreaker.items.length, 1);
  assert.equal(result.trekking.items.length, 1);
  assert.equal(result.bedding.verifiedAt, '2026-08-18T00:00:00.000Z');
});

test('유효한 후보가 하나라도 없으면 파일 생성 전에 중단한다', async () => {
  const search = async () => ({ items: [] });

  await assert.rejects(
    collectAutumnProducts({ search }),
    /유효한 쿠팡 상품을 찾지 못했습니다/,
  );
});
