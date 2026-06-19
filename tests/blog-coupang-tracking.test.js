const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const read = (file) => fs.readFileSync(file, 'utf8');

test('blog.js tracks Coupang affiliate clicks with placement metadata', () => {
  const script = read('blog/assets/blog.js');

  assert.match(script, /function trackCoupangClick/);
  assert.match(script, /\[data-coupang-link\]/);
  assert.match(script, /coupang_click/);
  assert.match(script, /coupang_placement/);
  assert.match(script, /coupang_product_type/);
});

test('chondroitin article has a mobile-first Coupang CTA after the summary', () => {
  const html = read('blog/yevester-porcine-chondroitin-1200.html');
  const summaryIndex = html.indexOf('article-summary-box');
  const mobileCtaIndex = html.indexOf('mobile-conversion-card');

  assert.ok(summaryIndex > -1, 'summary box should exist');
  assert.ok(mobileCtaIndex > summaryIndex, 'mobile CTA should appear after the summary');
  assert.match(html, /data-coupang-link/);
  assert.match(html, /data-coupang-placement="mobile_summary_card"/);
  assert.match(html, /data-coupang-product-type="chondroitin"/);
  assert.match(html, /현재 가격 확인하기/);
});

test('water size guide has tracked product links and is discoverable', () => {
  const html = read('blog/water-500ml-vs-2l-guide.html');
  const index = read('index.html');
  const sitemap = read('sitemap.xml');
  const summaryIndex = html.indexOf('article-summary-box');
  const mobileCtaIndex = html.indexOf('mobile-conversion-card');

  assert.ok(summaryIndex > -1, 'summary box should exist');
  assert.ok(mobileCtaIndex > summaryIndex, 'mobile CTA should appear after the summary');
  assert.match(html, /자취생 생수 500ml vs 2L/);
  assert.match(html, /data-coupang-placement="mobile_summary_card"/);
  assert.match(html, /data-coupang-placement="product_card"/);
  assert.match(html, /data-coupang-product-type="bottled_water"/);
  assert.match(html, /쿠팡 파트너스 활동/);
  assert.ok(index.includes('/blog/water-500ml-vs-2l-guide.html'), 'root blog home should link water guide');
  assert.ok(sitemap.includes('https://idont82.github.io/blog/water-500ml-vs-2l-guide.html'), 'sitemap should include water guide');
});

test('instant rice size guide has tracked product links and is discoverable', () => {
  const html = read('blog/instant-rice-210g-vs-130g-guide.html');
  const index = read('index.html');
  const sitemap = read('sitemap.xml');
  const summaryIndex = html.indexOf('article-summary-box');
  const mobileCtaIndex = html.indexOf('mobile-conversion-card');

  assert.ok(summaryIndex > -1, 'summary box should exist');
  assert.ok(mobileCtaIndex > summaryIndex, 'mobile CTA should appear after the summary');
  assert.match(html, /즉석밥 210g vs 130g/);
  assert.match(html, /data-coupang-placement="mobile_summary_card"/);
  assert.match(html, /data-coupang-placement="product_card"/);
  assert.match(html, /data-coupang-product-type="instant_rice"/);
  assert.match(html, /쿠팡 파트너스 활동/);
  assert.ok(index.includes('/blog/instant-rice-210g-vs-130g-guide.html'), 'root blog home should link instant rice guide');
  assert.ok(sitemap.includes('https://idont82.github.io/blog/instant-rice-210g-vs-130g-guide.html'), 'sitemap should include instant rice guide');
});

for (const file of [
  'blog/seoul-claw-machine-guide.html',
  'blog/hongdae-claw-tour.html'
]) {
  test(`${file} has mobile mini-claw Coupang CTA tracking`, () => {
    const html = read(file);
    const summaryIndex = html.indexOf('article-summary-box');
    const mobileCtaIndex = html.indexOf('mobile-conversion-card');

    assert.ok(summaryIndex > -1, 'summary box should exist');
    assert.ok(mobileCtaIndex > summaryIndex, 'mobile CTA should appear after the summary');
    assert.match(html, /data-coupang-link/);
    assert.match(html, /data-coupang-placement="mobile_summary_card"/);
    assert.match(html, /data-coupang-product-type="mini_claw"/);
    assert.match(html, /미니 인형뽑기 가격 보기/);
  });
}

test('jongro claw tour blog page is SEO discoverable and map based', () => {
  const html = read('blog/jongro-claw-tour.html');
  const index = read('index.html');
  const sitemap = read('sitemap.xml');

  assert.match(html, /<html lang="ko">/);
  assert.match(html, /종각\/종로 인형뽑기/);
  assert.match(html, /data-area-map="jongro"/);
  assert.match(html, /BlogPosting/);
  assert.match(html, /data-coupang-placement="mobile_summary_card"/);
  assert.match(html, /data-coupang-product-type="mini_claw"/);
  assert.match(html, /<aside class="blog-sidebar blog-sidebar-right">/);
  assert.match(html, /추천 배너/);
  assert.match(html, /쿠팡 파트너스 활동/);
  assert.match(html, /와쿠와쿠 종각점/);
  assert.match(html, /20260603_143336\.jpg/);
  assert.doesNotMatch(html, /사용자 촬영 기준/);
  assert.doesNotMatch(html, /GPS는 주변 매장/);
  assert.match(html, /2층까지/);
  assert.match(html, /모모스테이션 종각점은 2층까지/);
  assert.match(html, /2층은 주로 가챠/);

  const cactiSection = html.match(/<h3>7\. 캑티 가챠샵 종각점[\s\S]*?<\/section>/)?.[0] || '';
  const wakuwakuSection = html.match(/<h3>8\. 와쿠와쿠 종각점[\s\S]*?<\/section>/)?.[0] || '';
  assert.ok((cactiSection.match(/article-photo-card/g) || []).length >= 4, 'cacti section should show at least 4 photos');
  assert.ok((wakuwakuSection.match(/article-photo-card/g) || []).length >= 4, 'wakuwaku section should show at least 4 photos');

  assert.ok(index.includes('/blog/jongro-claw-tour.html'), 'root blog home should link jongro article');
  assert.ok(sitemap.includes('https://idont82.github.io/blog/jongro-claw-tour.html'), 'sitemap should include jongro article');
});
