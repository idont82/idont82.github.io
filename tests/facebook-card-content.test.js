const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const {
  buildPostContent,
  buildSubid,
  buildTrackedBlogUrl,
  extractArticle,
} = require('../scripts/facebook-card-content');

const html = `<!doctype html><html><head>
  <meta name="description" content="구매 전에 무게와 보관 공간을 비교하세요.">
  <meta property="og:image" content="https://example.com/hero.jpg">
</head><body>
  <h1 class="blog-article-title">테스트 상품 구매 가이드</h1>
  <div class="article-summary-box"><p>한 줄 결론입니다.</p></div>
  <h2>구매 전에 놓치기 쉬운 점</h2>
  <h2>핵심 선택 기준</h2>
  <h3>가벼운 구성이 맞는 사람</h3>
  <h3>대용량 구성이 맞는 사람</h3>
  <a data-coupang-link href="https://link.coupang.com/re/AFFSDP?pageKey=1&amp;subid=old">상품</a>
</body></html>`;

test('article extraction returns clean Korean text and the first affiliate link', () => {
  const article = extractArticle(html);
  assert.equal(article.title, '테스트 상품 구매 가이드');
  assert.equal(article.summary, '한 줄 결론입니다.');
  assert.deepEqual(article.points.slice(0, 2), ['구매 전에 놓치기 쉬운 점', '핵심 선택 기준']);
  assert.equal(article.coupangUrl, 'https://link.coupang.com/re/AFFSDP?pageKey=1&subid=old');
});

test('article extraction ignores navigation headings outside the article body', () => {
  const wrapped = html.replace('<body>', '<body><aside><h2>사이드바 글 순서</h2></aside><article class="blog-article">')
    .replace('</body>', '</article></body>');
  assert.equal(extractArticle(wrapped).points.includes('사이드바 글 순서'), false);
});

test('blog and direct modes produce stable post-level tracking identifiers', () => {
  const id = '20260813-problem-water-size';
  assert.equal(buildSubid(id), 'fb-20260813-problem-water-size');
  const blogUrl = new URL(buildTrackedBlogUrl('/blog/example.html', id));
  assert.equal(blogUrl.searchParams.get('utm_source'), 'facebook');
  assert.equal(blogUrl.searchParams.get('utm_medium'), 'social');
  assert.equal(blogUrl.searchParams.get('utm_campaign'), 'card_news');
  assert.equal(blogUrl.searchParams.get('utm_content'), id);

  const direct = buildPostContent({ id, linkMode: 'direct', article: '/blog/example.html' }, html);
  assert.equal(new URL(direct.link).searchParams.get('subid'), buildSubid(id));
  assert.match(direct.caption, /쿠팡 파트너스 활동/);
  assert.ok(direct.caption.includes(direct.link));
  assert.equal(direct.slides.length, 5);
  assert.match(direct.slides[4].body, /수수료/);
});

test('real celebrity article produces five blog-mode cards and a tracked link', () => {
  const articleHtml = fs.readFileSync('blog/wonyoung-eider-sheer-jacket-guide.html', 'utf8');
  const content = buildPostContent({
    id: '20260811-celebrity-wonyoung-eider',
    linkMode: 'blog',
    article: '/blog/wonyoung-eider-sheer-jacket-guide.html',
  }, articleHtml);

  assert.equal(content.slides.length, 5);
  assert.ok(/[가-힣]/.test(content.slides[0].title));
  assert.equal(new URL(content.link).searchParams.get('utm_content'), '20260811-celebrity-wonyoung-eider');
});

test('direct mode rejects non-Coupang destinations', () => {
  const unsafe = html.replace('https://link.coupang.com/re/AFFSDP?pageKey=1&amp;subid=old', 'https://example.com/product');
  assert.throws(() => buildPostContent({
    id: 'unsafe-link',
    linkMode: 'direct',
    article: '/blog/example.html',
  }, unsafe), /Coupang Partners URL/);
});
