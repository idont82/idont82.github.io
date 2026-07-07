const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const page = 'blog/anti-slip-socks-home-guide.html';

test('anti-slip socks blog page is search-ready and affiliate tracked', () => {
  const html = fs.readFileSync(page, 'utf8');

  assert.match(html, /<html lang="ko">/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /미끄럼 방지 양말 추천/);
  assert.match(html, /<meta name="description"/);
  assert.match(html, /<link rel="canonical" href="https:\/\/idont82\.github\.io\/blog\/anti-slip-socks-home-guide\.html">/);
  assert.match(html, /<meta name="robots" content="index, follow, max-image-preview:large">/);
  assert.match(html, /og:image/);
  assert.match(html, /BlogPosting/);
  assert.match(html, /class="mobile-top-ad" data-mobile-top-ad/);
  assert.match(html, /article-ad article-ad-frame-block/);
  assert.match(html, /blog-sidebar blog-sidebar-right/);
  assert.match(html, /data-coupang-placement="mobile_summary_card"/);
  assert.match(html, /data-coupang-placement="product_card"/);
  assert.match(html, /data-coupang-product-type="anti_slip_socks"/);
  assert.match(html, /rel="sponsored nofollow"/);
  assert.match(html, /쿠팡 파트너스 활동으로 일정액의 수수료/);

  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(jsonLd);
  assert.doesNotThrow(() => JSON.parse(jsonLd[1]));
});

test('anti-slip socks blog page is discoverable from index and sitemap', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  const sitemap = fs.readFileSync('sitemap.xml', 'utf8');

  assert.ok(index.includes('/blog/anti-slip-socks-home-guide.html'));
  assert.ok(sitemap.includes('https://idont82.github.io/blog/anti-slip-socks-home-guide.html'));
});

test('anti-slip socks blog page avoids fall-prevention overclaiming', () => {
  const html = fs.readFileSync(page, 'utf8');

  assert.match(html, /낙상 예방을 보장/);
  assert.match(html, /발바닥 실리콘|사이즈|세탁/);
  assert.doesNotMatch(html, /넘어짐을 완전히 막|치료|100%/);
});
