const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');

const read = (file) => fs.readFileSync(file, 'utf8');

const concertPages = [
  {
    file: 'blog/bts-concert-bag-checklist.html',
    url: 'https://idont82.github.io/blog/bts-concert-bag-checklist.html',
    productType: 'concert_clear_bag'
  },
  {
    file: 'blog/bts-clear-bag-concert-guide.html',
    url: 'https://idont82.github.io/blog/bts-clear-bag-concert-guide.html',
    productType: 'concert_clear_bag'
  },
  {
    file: 'blog/bts-light-stick-concert-checklist.html',
    url: 'https://idont82.github.io/blog/bts-light-stick-concert-checklist.html',
    productType: 'bts_lightstick'
  }
];

for (const page of concertPages) {
  test(`${page.file} is SEO discoverable and has tracked Coupang products`, () => {
    const html = read(page.file);

    assert.match(html, /<html lang="ko">/);
    assert.match(html, new RegExp(`<link rel="canonical" href="${page.url}">`));
    assert.match(html, /BlogPosting/);
    assert.match(html, /article-summary-box/);
    assert.match(html, /article-product-grid/);
    assert.match(html, /data-coupang-link/);
    assert.match(html, /data-coupang-placement="product_card"/);
    assert.match(html, new RegExp(`data-coupang-product-type="${page.productType}"`));
    assert.ok(/쿠팡 파트너스 활동/.test(html) || /荑좏뙜/.test(html));
    assert.ok(/참고한 자료/.test(html) || /李멸퀬/.test(html));
    assert.match(html, /Weverse Shop/);
  });
}

test('BTS clear bag guide has official policy references and practical FAQ', () => {
  const html = read('blog/bts-clear-bag-concert-guide.html');

  assert.match(html, /NFL: Clear Bag Policy/);
  assert.match(html, /BIGHIT MUSIC: BTS 공식 사이트/);
  assert.match(html, /CPSC: 배터리 안전 보관 안내/);
  assert.match(html, /투명백과 작은 백팩/);
  assert.match(html, /공연장, 예매처, 공식 공지/);
  assert.match(html, /data-coupang-product-type="lightstick_bag"/);
  assert.match(html, /data-coupang-product-type="aa_battery"/);
});

test('blackpink lightstick article is refreshed with official-check and tracked product cards', () => {
  const html = read('blog/blackpink-light-stick-concert-checklist.html');

  assert.match(html, /"dateModified": "2026-06-10"/);
  assert.match(html, /data-coupang-product-type="blackpink_lightstick"/);
  assert.match(html, /Pitchfork/);
});

test('home and sitemap expose the BTS concert goods blog pages', () => {
  const index = read('index.html');
  const sitemap = read('sitemap.xml');

  for (const page of concertPages) {
    const path = page.url.replace('https://idont82.github.io', '');

    assert.ok(index.includes(path), `home should link ${path}`);
    assert.ok(sitemap.includes(page.url), `sitemap should include ${page.url}`);
  }

  assert.match(index, /BTS 콘서트 투명가방 규정과 준비물/);
});
