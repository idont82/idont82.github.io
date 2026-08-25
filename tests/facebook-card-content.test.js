const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  buildPostContent,
  buildShortUrl,
  buildSubid,
  buildTrackedBlogUrl,
  extractArticle,
  extractProductImages,
  selectThreeImageCandidates,
} = require('../scripts/facebook-card-content');

const productOne = 'https://example.com/product-1.jpg';
const productTwo = 'https://example.com/product-2.jpg';
const html = `<!doctype html><html><head>
  <meta name="description" content="구매 전에 무게와 보관 공간을 비교하세요.">
  <meta property="og:image" content="https://example.com/hero.jpg">
</head><body>
  <img src="https://example.com/decoration.jpg" alt="장식">
  <article class="blog-article">
    <h1 class="blog-article-title">테스트 상품 구매 가이드</h1>
    <div class="article-summary-box"><p>한 줄 결론입니다.</p></div>
    <h2>구매 전에 놓치기 쉬운 점</h2>
    <h2>핵심 선택 기준</h2>
    <h3>가벼운 구성이 맞는 사람</h3>
    <a data-coupang-link href="https://link.coupang.com/re/AFFSDP?pageKey=1&amp;subid=old">
      <img src="${productOne}" alt="첫 번째 상품">
    </a>
    <a href="https://link.coupang.com/re/AFFSDP?pageKey=2" data-coupang-link>
      <img data-src="${productTwo}" alt="두 번째 상품">
    </a>
    <a data-coupang-link href="https://link.coupang.com/re/AFFSDP?pageKey=3">
      <img src="${productOne}" alt="첫 번째 상품 중복">
    </a>
  </article>
</body></html>`;

const queueItem = {
  id: '20260813-problem-water-size',
  linkMode: 'blog',
  article: '/blog/example.html',
  shortLinkId: 4,
  cardCopy: ['생수 500mL와 2L 비교', '휴대성 · 가격 · 보관 확인', '내 생활에 맞는 용량 보기'],
};

test('article extraction returns clean text, affiliate link, and only unique product images', () => {
  const article = extractArticle(html);
  assert.equal(article.title, '테스트 상품 구매 가이드');
  assert.equal(article.summary, '한 줄 결론입니다.');
  assert.deepEqual(article.points.slice(0, 2), ['구매 전에 놓치기 쉬운 점', '핵심 선택 기준']);
  assert.equal(article.coupangUrl, 'https://link.coupang.com/re/AFFSDP?pageKey=1&subid=old');
  assert.deepEqual(article.productImages, [productOne, productTwo]);
  assert.deepEqual(extractProductImages(html, 'https://example.com/fallback.jpg'), [productOne, productTwo]);
});

test('article extraction ignores navigation headings outside the article body', () => {
  const wrapped = html.replace('<body>', '<body><aside><h2>사이드바 글 순서</h2></aside>');
  assert.equal(extractArticle(wrapped).points.includes('사이드바 글 순서'), false);
});

test('three image candidate lists rotate available product photos and provide fallbacks', () => {
  assert.deepEqual(selectThreeImageCandidates([productOne, productTwo]), [
    [productOne, productTwo],
    [productTwo, productOne],
    [productOne, productTwo],
  ]);
});

test('blog mode produces exactly three reviewed photo cards and one short public link', () => {
  const content = buildPostContent(queueItem, html);
  assert.equal(content.slides.length, 3);
  assert.deepEqual(content.slides.map((slide) => slide.title), queueItem.cardCopy);
  assert.deepEqual(content.slides.map((slide) => slide.imageUrl), [productOne, productTwo, productOne]);
  assert.deepEqual(content.slides.map((slide) => slide.imageUrls), [
    [productOne, productTwo],
    [productTwo, productOne],
    [productOne, productTwo],
  ]);
  assert.equal(content.link, 'https://idont82.github.io/g/?n=4');
  assert.equal(content.duplicateMarker, content.link);
  assert.equal((content.caption.match(/https:\/\/idont82\.github\.io\/g\/\?n=4/g) || []).length, 1);
  const blogLines = content.caption.split('\n');
  assert.equal(blogLines[0], content.link);
  assert.equal(blogLines[1], '');
  assert.ok(blogLines.indexOf(queueItem.cardCopy[0]) > 0);
  assert.equal(content.caption.includes('utm_campaign'), false);
  assert.equal(new URL(content.destinationLink).searchParams.get('utm_content'), queueItem.id);
});

test('queue card image overrides take priority and keep safe local fallbacks first', () => {
  const cardImageUrls = [
    '/images/facebook-card-news/a.png',
    '/images/facebook-card-news/b.png',
    '/images/facebook-card-news/c.png',
  ];
  const content = buildPostContent({ ...queueItem, cardImageUrls }, html);
  assert.deepEqual(content.slides.map((slide) => slide.imageUrl), cardImageUrls);
  assert.deepEqual(content.slides[0].imageUrls, [
    cardImageUrls[0],
    cardImageUrls[1],
    cardImageUrls[2],
    productOne,
    productTwo,
  ]);
});

test('tracking helpers remain stable and direct mode keeps its tracked Coupang destination private', () => {
  assert.equal(buildSubid(queueItem.id), 'fb-20260813-problem-water-size');
  assert.equal(buildShortUrl(4), 'https://idont82.github.io/g/?n=4');
  assert.equal(new URL(buildTrackedBlogUrl(queueItem.article, queueItem.id)).searchParams.get('utm_source'), 'facebook');

  const direct = buildPostContent({ ...queueItem, linkMode: 'direct' }, html);
  assert.equal(direct.link, 'https://idont82.github.io/g/?n=4');
  assert.equal(new URL(direct.destinationLink).searchParams.get('subid'), buildSubid(queueItem.id));
  assert.equal(direct.caption.split('\n')[0], queueItem.cardCopy[0]);
  assert.ok(direct.caption.includes(direct.link));
});

test('shopping-grid mode forwards reviewed product details to three renderer slides', () => {
  const shoppingCards = [1, 2, 3].map((index) => ({
    hook: `${100 + index}만원대`,
    productName: `테스트 노트북 ${index}`,
    imageUrls: [`https://example.com/shopping-${index}.jpg`],
    specs: ['메모리 16GB', '저장공간 512GB'],
    uses: ['문서 작업', '화상 회의'],
    disclaimer: '작성일 기준 · 가격 변동 가능',
  }));
  const content = buildPostContent({
    ...queueItem,
    shortLinkId: 18,
    cardTemplate: 'shopping-grid',
    shoppingCards,
  }, html);

  assert.equal(content.slides.length, 3);
  assert.deepEqual(content.slides.map((slide) => slide.template), [
    'shopping-grid', 'shopping-grid', 'shopping-grid',
  ]);
  assert.deepEqual(content.slides.map((slide) => slide.hook), shoppingCards.map((card) => card.hook));
  assert.deepEqual(content.slides.map((slide) => slide.imageUrl), shoppingCards.map((card) => card.imageUrls[0]));
  assert.equal(content.caption.split('\n')[0], 'https://idont82.github.io/g/?n=18');
  assert.ok(content.caption.includes('쿠팡 파트너스'));
});

test('real celebrity article produces three photo cards with a short link', () => {
  const articleHtml = fs.readFileSync('blog/wonyoung-eider-sheer-jacket-guide.html', 'utf8');
  const content = buildPostContent({
    id: '20260811-celebrity-wonyoung-eider',
    linkMode: 'blog',
    article: '/blog/wonyoung-eider-sheer-jacket-guide.html',
    shortLinkId: 2,
    cardCopy: ['장원영 바람막이 스타일', '색상 · 핏 · 소재 확인', '비슷한 제품 비교하기'],
  }, articleHtml);

  assert.equal(content.slides.length, 3);
  assert.equal(content.link, 'https://idont82.github.io/g/?n=2');
  assert.ok(content.slides.every((slide) => slide.imageUrl));
});

test('direct mode rejects non-Coupang destinations', () => {
  const unsafe = html.replace(/https:\/\/link\.coupang\.com\/re\/AFFSDP\?pageKey=1&amp;subid=old/g, 'https://example.com/product');
  assert.throws(() => buildPostContent({ ...queueItem, linkMode: 'direct' }, unsafe), /Coupang Partners URL/);
});
