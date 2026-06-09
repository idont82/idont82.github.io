const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const read = (file) => fs.readFileSync(file, 'utf8');

const concertPages = [
  {
    file: 'blog/bts-concert-bag-checklist.html',
    url: 'https://idont82.github.io/blog/bts-concert-bag-checklist.html',
    title: 'BTS 콘서트 가방 준비물',
    productType: 'concert_clear_bag'
  },
  {
    file: 'blog/bts-light-stick-concert-checklist.html',
    url: 'https://idont82.github.io/blog/bts-light-stick-concert-checklist.html',
    title: 'BTS 응원봉 아미밤 준비물',
    productType: 'bts_lightstick'
  }
];

for (const page of concertPages) {
  test(`${page.file} is SEO discoverable and has tracked Coupang products`, () => {
    const html = read(page.file);

    assert.match(html, /<html lang="ko">/);
    assert.match(html, new RegExp(`<link rel="canonical" href="${page.url}">`));
    assert.match(html, /BlogPosting/);
    assert.match(html, new RegExp(page.title));
    assert.match(html, /article-summary-box/);
    assert.match(html, /article-product-grid/);
    assert.match(html, /data-coupang-link/);
    assert.match(html, /data-coupang-placement="product_card"/);
    assert.match(html, new RegExp(`data-coupang-product-type="${page.productType}"`));
    assert.match(html, /쿠팡 파트너스 활동/);
    assert.match(html, /참고한 자료/);
    assert.match(html, /Weverse Shop/);
  });
}

test('blackpink lightstick article is refreshed with official-check and tracked product cards', () => {
  const html = read('blog/blackpink-light-stick-concert-checklist.html');

  assert.match(html, /"dateModified": "2026-06-10"/);
  assert.match(html, /공식 채널과 판매처 상세/);
  assert.match(html, /data-coupang-product-type="blackpink_lightstick"/);
  assert.match(html, /BLACKPINK 공식 숍/);
  assert.match(html, /Pitchfork/);
});

test('home and sitemap expose the new BTS concert goods blog pages', () => {
  const index = read('index.html');
  const sitemap = read('sitemap.xml');

  for (const page of concertPages) {
    const path = page.url.replace('https://idont82.github.io', '');

    assert.ok(index.includes(path), `home should link ${path}`);
    assert.ok(sitemap.includes(page.url), `sitemap should include ${page.url}`);
  }

  assert.match(index, /BTS 콘서트 가방 준비물/);
  assert.match(index, /BTS 응원봉 아미밤 준비물/);
});
