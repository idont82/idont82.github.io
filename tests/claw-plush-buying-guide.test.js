const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const page = 'blog/claw-machine-popular-plush-buying-guide.html';

test('claw plush buying guide is search-ready and affiliate tracked', () => {
  const html = fs.readFileSync(page, 'utf8');

  assert.match(html, /<html lang="ko">/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /인형뽑기 인기 인형 구매/);
  assert.match(html, /산리오|치이카와|포켓몬|카피바라|몰랑이/);
  assert.match(html, /<meta name="description"/);
  assert.match(html, /<link rel="canonical" href="https:\/\/idont82\.github\.io\/blog\/claw-machine-popular-plush-buying-guide\.html">/);
  assert.match(html, /<meta name="robots" content="index, follow, max-image-preview:large">/);
  assert.match(html, /og:image/);
  assert.match(html, /BlogPosting/);
  assert.match(html, /class="mobile-top-ad" data-mobile-top-ad/);
  assert.match(html, /article-ad article-ad-frame-block/);
  assert.match(html, /blog-sidebar blog-sidebar-right/);
  assert.match(html, /data-coupang-placement="mobile_summary_card"/);
  assert.match(html, /data-coupang-placement="product_card"/);
  assert.match(html, /data-coupang-product-type="claw_popular_plush"/);
  assert.match(html, /rel="sponsored nofollow"/);
  assert.match(html, /쿠팡 파트너스 활동으로 일정액의 수수료/);

  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(jsonLd);
  assert.doesNotThrow(() => JSON.parse(jsonLd[1]));
});

test('claw plush buying guide is discoverable from index and sitemap', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  const sitemap = fs.readFileSync('sitemap.xml', 'utf8');

  assert.ok(index.includes('/blog/claw-machine-popular-plush-buying-guide.html'));
  assert.ok(sitemap.includes('https://idont82.github.io/blog/claw-machine-popular-plush-buying-guide.html'));
});

test('claw plush buying guide avoids fake prize and official-goods overclaiming', () => {
  const html = fs.readFileSync(page, 'utf8');

  assert.match(html, /정품 여부|라이선스|상세 페이지/);
  assert.doesNotMatch(html, /무조건 정품|공식 보장|100% 정품/);
});
