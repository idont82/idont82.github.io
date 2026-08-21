const test = require('node:test');
const assert = require('node:assert/strict');

const {
  renderArticle,
  updateBlogIndex,
  updateRootIndex,
  updateSitemap,
  validateInputs,
} = require('../scripts/generate-laptop-blog-pages');

function makePage(index) {
  return {
    slug: `sample-laptop-${index}`,
    productType: `sample_laptop_${index}`,
    keyword: `샘플 노트북 추천 ${index}`,
    productData: `sample-${index}.json`,
    productCount: 3,
    title: `샘플 노트북 추천 ${index}, 선택 기준`,
    description: `샘플 노트북 ${index} 세 가지를 비교합니다.`,
    intro: '가격표만 보지 않고 운영체제와 메모리, 저장공간을 함께 확인합니다.',
    summary: '필요한 프로그램과 예산을 정한 뒤 세부 옵션을 비교하세요.',
    criteria: ['운영체제 포함 여부를 확인합니다.', '메모리와 저장공간을 확인합니다.', '화면과 휴대 조건을 확인합니다.'],
    caution: '같은 모델명도 운영체제와 저장공간 옵션에 따라 구성이 달라질 수 있습니다.',
    faq: [
      ['가격은 고정인가요?', '수집 시점 가격이며 접속 시 달라질 수 있습니다.'],
      ['윈도우가 포함되나요?', '상품명과 상세 옵션을 함께 확인해야 합니다.'],
      ['메모리는 얼마나 필요한가요?', '사용할 프로그램의 권장 사양을 먼저 확인하세요.'],
    ],
    roleLabels: ['균형형', '휴대형', '저장공간형'],
    productNotes: [0, 1, 2].map((item) => ({
      fit: `${item + 1}번 사용 환경에 맞습니다.`,
      specs: `16GB 메모리와 ${item === 0 ? '256GB' : '512GB'} 저장공간이 상품명에 표시됩니다.`,
      limitation: '세부 옵션과 확장 가능 여부는 상품 페이지에서 다시 확인해야 합니다.',
    })),
    sources: [
      ['Microsoft Windows 11 사양', 'https://www.microsoft.com/ko-kr/windows/windows-11-specifications'],
      ['한국소비자원', 'https://www.kca.go.kr/'],
    ],
  };
}

function makeProduct(id) {
  return {
    productId: id,
    productName: `샘플 노트북 ${id}, 512GB, 16GB, WIN11 Home`,
    productPrice: 1000000 + id,
    productImage: `https://ads-partners.coupang.com/${id}.jpg`,
    productUrl: `https://link.coupang.com/a/${id}`,
    roleKeyword: '샘플 노트북',
  };
}

function makeInputs() {
  const manifest = [1, 2, 3].map(makePage);
  const productDataByFile = Object.fromEntries(manifest.map((page, pageIndex) => [
    page.productData,
    {
      group: page.slug,
      verifiedAt: '2026-08-21T01:00:00.000Z',
      items: [1, 2, 3].map((offset) => makeProduct(pageIndex * 3 + offset)),
    },
  ]));
  return { manifest, productDataByFile };
}

test('입력 검증 후 세 상품이 있는 완전한 노트북 글을 렌더링한다', () => {
  const { manifest, productDataByFile } = makeInputs();
  validateInputs(manifest, productDataByFile);
  const page = manifest[0];
  const html = renderArticle(page, productDataByFile[page.productData], manifest);

  assert.equal((html.match(/class="laptop-product-card"/g) || []).length, 3);
  assert.match(html, /data-coupang-placement="article_hero"/);
  assert.match(html, /data-coupang-placement="product_card"/);
  assert.match(html, /data-coupang-placement="mobile_summary_card"/);
  assert.match(html, /BlogPosting/);
  assert.match(html, /수집 시점/);
});

test('잘못된 링크·상품 수·전역 중복 상품을 쓰기 전에 거부한다', () => {
  const { manifest, productDataByFile } = makeInputs();
  const badLinkData = structuredClone(productDataByFile);
  badLinkData[manifest[0].productData].items[0].productUrl = 'https://example.com/product';
  assert.throws(() => validateInputs(manifest, badLinkData), /affiliate URL/);

  const shortData = structuredClone(productDataByFile);
  shortData[manifest[0].productData].items.pop();
  assert.throws(() => validateInputs(manifest, shortData), /상품 개수/);

  const duplicateData = structuredClone(productDataByFile);
  duplicateData[manifest[1].productData].items[0].productId = 1;
  assert.throws(() => validateInputs(manifest, duplicateData), /repeats productId/);
});

test('루트와 블로그 인덱스 카드 묶음을 멱등 삽입한다', () => {
  const { manifest, productDataByFile } = makeInputs();
  const root = '<main><div class="blog-card-list">\n</div></main>';
  const blog = '<html><body><p>이동 안내</p></body></html>';
  const rootOnce = updateRootIndex(root, manifest, productDataByFile);
  const blogOnce = updateBlogIndex(blog, manifest);

  assert.equal(updateRootIndex(rootOnce, manifest, productDataByFile), rootOnce);
  assert.equal(updateBlogIndex(blogOnce, manifest), blogOnce);
  for (const page of manifest) {
    assert.equal((rootOnce.match(new RegExp(page.slug, 'g')) || []).length, 1);
    assert.equal((blogOnce.match(new RegExp(page.slug, 'g')) || []).length, 1);
  }
});

test('사이트맵 노트북 URL 묶음을 멱등 삽입한다', () => {
  const { manifest } = makeInputs();
  const original = '<?xml version="1.0"?><urlset>\n</urlset>';
  const once = updateSitemap(original, manifest);
  const twice = updateSitemap(once, manifest);

  assert.equal(twice, once);
  for (const page of manifest) {
    assert.equal((once.match(new RegExp(page.slug, 'g')) || []).length, 1);
  }
});
