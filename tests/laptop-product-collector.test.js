const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  QUERY_GROUPS,
  collectLaptopProducts,
  isValidProduct,
  matchesRole,
  selectFirstValid,
  writeProductFiles,
} = require('../scripts/collect-laptop-products');

function product(id, name = `노트북 ${id}`) {
  return {
    productId: id,
    productName: name,
    productPrice: 1000000 + id,
    productImage: `https://ads-partners.coupang.com/${id}.jpg`,
    productUrl: `https://link.coupang.com/a/${id}`,
  };
}

test('가성비·최고성능·문서용 역할을 세 개씩 정의한다', () => {
  assert.deepEqual(Object.keys(QUERY_GROUPS), ['value', 'performance', 'document']);
  assert.ok(Object.values(QUERY_GROUPS).every((queries) => queries.length === 3));
});

test('허용 호스트와 필수 상품 필드를 검증한다', () => {
  assert.equal(isValidProduct(product(1)), true);
  assert.equal(isValidProduct({ ...product(1), productUrl: 'https://example.com/1' }), false);
  assert.equal(isValidProduct({ ...product(1), productPrice: 0 }), false);
});

test('검색 역할과 다른 GPU 또는 노트북 액세서리를 거부한다', () => {
  const rtx5090Role = { keyword: 'RTX 5090 게이밍 노트북', required: ['RTX 5090'] };
  assert.equal(matchesRole(product(1, 'HP 오멘 노트북 지포스 RTX 5060'), rtx5090Role), false);
  assert.equal(matchesRole(product(2, '레노버 리전 노트북 지포스 RTX 5090'), rtx5090Role), true);
  assert.equal(matchesRole({
    ...product(3, '360도 회전 접이식 아크릴 독서대'),
    categoryName: '문구/사무용품',
  }, { keyword: '문서용 노트북', required: [] }), false);
});

test('노트북 단어가 없는 HP 옴니북 제품군도 본체로 인정한다', () => {
  const role = {
    keyword: 'HP 2026 라이젠5 노트북 16GB 512GB',
    required: ['HP', '2026', '라이젠5', '16GB', '512GB'],
  };
  assert.equal(matchesRole(product(
    4,
    'HP 2026 옴니북 3 16 라이젠5 라이젠 40 시리즈, 512GB, 16GB, Free DOS',
  ), role), true);
});

test('아홉 역할을 전역 중복 없이 모두 수집한다', async () => {
  let id = 0;
  const groups = await collectLaptopProducts({
    search: async ({ keyword }) => ({ items: [product(++id, `${keyword} 노트북 ${id}`)] }),
    now: () => '2026-08-21T00:00:00.000Z',
  });

  const items = Object.values(groups).flatMap((group) => group.items);
  assert.equal(items.length, 9);
  assert.equal(new Set(items.map((item) => item.productId)).size, 9);
});

test('앞 역할과 중복된 상품은 다음 유효 후보로 건너뛴다', () => {
  const seen = new Set([1]);
  const role = { keyword: '문서용 노트북', required: [] };
  const selected = selectFirstValid([
    product(1, '중복 노트북'),
    product(2, '대안 노트북'),
  ], seen, role);

  assert.equal(selected.productId, 2);
  assert.deepEqual([...seen], [1, 2]);
});

test('한 역할이라도 상품이 없으면 파일을 쓰기 전에 중단한다', async () => {
  await assert.rejects(
    collectLaptopProducts({ search: async () => ({ items: [] }) }),
    /유효한 쿠팡 상품/,
  );
});

test('그룹별 JSON 파일을 UTF-8로 기록한다', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'laptop-products-'));
  const groups = Object.fromEntries(Object.keys(QUERY_GROUPS).map((group, index) => [group, {
    group,
    verifiedAt: '2026-08-21T00:00:00.000Z',
    queries: QUERY_GROUPS[group],
    items: [product(index * 3 + 1), product(index * 3 + 2), product(index * 3 + 3)],
  }]));

  writeProductFiles(groups, root);

  assert.deepEqual(fs.readdirSync(path.join(root, 'data')).sort(), [
    'coupang-laptop-document.json',
    'coupang-laptop-performance.json',
    'coupang-laptop-value.json',
  ]);
});
