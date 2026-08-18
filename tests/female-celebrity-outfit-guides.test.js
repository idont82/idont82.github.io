const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const pages = [
  {
    path: 'blog/suzy-k2-dry-ice-shirt-guide.html',
    celebrity: '수지',
    brand: 'K2',
    model: 'KWM26452',
    product: '시원서커 DRY ICE 반팔 셔츠 W',
    productType: 'celebrity_suzy_k2_kwm26452',
    sourceHosts: ['k-village.co.kr', 'lotteon.com'],
  },
  {
    path: 'blog/wonyoung-eider-sheer-jacket-guide.html',
    celebrity: '장원영',
    brand: '아이더',
    model: 'DWM26154',
    product: 'SHEER (시어) 여성 경량 후디 자켓',
    productType: 'celebrity_wonyoung_eider_dwm26154',
    sourceHosts: ['k-village.co.kr', 'gsshop.com'],
  },
];

function occurrences(text, marker) {
  return text.split(marker).length - 1;
}

test('celebrity outfit pages expose complete SEO and article structure', () => {
  for (const page of pages) {
    const html = fs.readFileSync(page.path, 'utf8');

    assert.match(html, /<html lang="ko">/, `${page.path} should be Korean`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page.path} should have one h1`);
    assert.match(html, new RegExp(page.celebrity), `${page.path} should name the celebrity`);
    assert.match(html, new RegExp(page.brand), `${page.path} should name the brand`);
    assert.match(html, new RegExp(page.product.replace(/[()[\]]/g, '\\$&')), `${page.path} should name the product`);
    assert.match(html, /<meta name="description"/, `${page.path} should have a description`);
    assert.match(html, /<link rel="canonical"/, `${page.path} should have canonical`);
    assert.match(html, /<meta name="robots" content="index, follow, max-image-preview:large">/, `${page.path} should be indexable`);
    assert.match(html, /class="mobile-top-ad" data-mobile-top-ad/, `${page.path} should have a mobile ad`);
    assert.match(html, /article-ad article-ad-frame-block/, `${page.path} should have an article ad`);

    const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(jsonLd, `${page.path} should include JSON-LD`);
    const parsed = JSON.parse(jsonLd[1]);
    assert.equal(parsed['@type'], 'BlogPosting', `${page.path} should use BlogPosting`);
    assert.equal(parsed.inLanguage, 'ko-KR', `${page.path} should identify Korean`);
  }
});

test('celebrity outfit pages prove the exact worn product without unsupported claims', () => {
  const fabricatedExperience = /직접 구매했다|직접 샀|입어보니|배송받았다/;
  const unsupportedClaims = /비슷한 제품|판매량 1위|최저가 보장|무조건 정품/;

  for (const page of pages) {
    const html = fs.readFileSync(page.path, 'utf8');

    assert.match(html, new RegExp(page.model), `${page.path} should show the exact model`);
    assert.match(html, /동일 품번 확인/, `${page.path} should explain product identity`);
    assert.match(html, /2026년 7월 31일/, `${page.path} should show the verification date`);
    assert.match(html, /검색 결과 노출 순서/, `${page.path} should qualify the API rank`);
    assert.match(html, /가격과 재고/, `${page.path} should disclose volatility`);
    assert.match(html, /팬인 저는/, `${page.path} should use the fan viewpoint`);
    assert.match(html, /팬 추천 포인트/, `${page.path} should label fan reasons`);
    assert.doesNotMatch(html, fabricatedExperience, `${page.path} should not invent a purchase or fitting`);
    assert.doesNotMatch(html, unsupportedClaims, `${page.path} should avoid unsupported claims`);

    for (const host of page.sourceHosts) {
      assert.match(html, new RegExp(host.replaceAll('.', '\\.')), `${page.path} should cite ${host}`);
    }
  }
});

test('celebrity outfit pages expose affiliate cards and a right-rail recommendation', () => {
  for (const page of pages) {
    const html = fs.readFileSync(page.path, 'utf8');
    const sidebar = html.match(/<aside class="blog-sidebar blog-sidebar-right">([\s\S]*?)<\/aside>/);

    assert.match(html, /data-coupang-placement="product_card"/, `${page.path} should track the product card`);
    assert.match(html, new RegExp(`data-coupang-product-type="${page.productType}"`), `${page.path} should tag the product`);
    assert.match(html, /rel="sponsored nofollow"/, `${page.path} should mark affiliate links`);
    assert.match(html, /쿠팡 파트너스 활동으로/, `${page.path} should disclose affiliate activity`);
    assert.ok(sidebar, `${page.path} should have a right sidebar`);
    assert.match(sidebar[1], /blog-stack blog-stack-sticky/, `${page.path} should keep the rail sticky`);
    assert.match(sidebar[1], /<h2>추천 배너<\/h2>/, `${page.path} should label the banner`);
    assert.match(sidebar[1], /widgets\.html\?id=989908(?:&|&amp;)template=carousel/, `${page.path} should use the established widget`);
    assert.match(sidebar[1], /width="300" height="250"/, `${page.path} should use a 300 by 250 banner`);
  }
});

test('exact product table fits without a horizontal scroller', () => {
  for (const page of pages) {
    const html = fs.readFileSync(page.path, 'utf8');

    assert.match(html, /\.outfit-identity-table\s*\{[^}]*table-layout:\s*fixed/s, `${page.path} should use fixed layout`);
    assert.match(html, /\.outfit-identity-table\s*\{[^}]*max-width:\s*100%/s, `${page.path} should fit the article`);
    assert.match(html, /\.outfit-identity-table th,\s*\.outfit-identity-table td\s*\{[^}]*overflow-wrap:\s*anywhere/s, `${page.path} should wrap cells`);
    assert.doesNotMatch(html, /min-width:\s*\d+px/, `${page.path} should not force a minimum width`);
    assert.doesNotMatch(html, /overflow-x:\s*auto/, `${page.path} should not create a horizontal scroller`);
  }
});

test('celebrity outfit pages are discoverable exactly once', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  const sitemap = fs.readFileSync('sitemap.xml', 'utf8');

  for (const page of pages) {
    const indexUrl = `/${page.path}`;
    const sitemapUrl = `https://idont82.github.io/${page.path}`;
    assert.equal(occurrences(index, indexUrl), 1, `index should link ${page.path} once`);
    assert.equal(occurrences(sitemap, sitemapUrl), 1, `sitemap should include ${page.path} once`);
  }
});

test('Wonyoung guide selects the color-coded listing near the official price', () => {
  const html = fs.readFileSync('blog/wonyoung-eider-sheer-jacket-guide.html', 'utf8');

  assert.match(html, /DWM26154G2/, 'Wonyoung guide should show the exact mint color code');
  assert.match(html, /164,680원/, 'Wonyoung guide should show the verified comparable listing price');
  assert.doesNotMatch(html, /284,550원/, 'Wonyoung guide should avoid the overpriced search listing');
});

test('Wonyoung hero image links to the same tracked Coupang product as its product card', () => {
  const html = fs.readFileSync('blog/wonyoung-eider-sheer-jacket-guide.html', 'utf8');
  const hero = html.match(/<figure class="article-hero">([\s\S]*?)<\/figure>/)?.[1] || '';
  const heroLink = hero.match(/<a href="([^"]+)"[^>]*data-coupang-link[^>]*data-coupang-placement="article_hero"[^>]*data-coupang-product-type="celebrity_wonyoung_eider_dwm26154"[^>]*>/);
  const productLink = html.match(/<a href="([^"]+)"[^>]*data-coupang-placement="product_card"/);

  assert.ok(heroLink, 'Wonyoung hero should be a tracked affiliate link');
  assert.ok(productLink, 'Wonyoung product card should keep its affiliate link');
  assert.equal(heroLink[1], productLink[1]);
  assert.match(heroLink[0], /target="_blank"/);
  assert.match(heroLink[0], /rel="sponsored nofollow"/);
  assert.match(heroLink[0], /referrerpolicy="unsafe-url"/);

  const suzy = fs.readFileSync('blog/suzy-k2-dry-ice-shirt-guide.html', 'utf8');
  const suzyHero = suzy.match(/<figure class="article-hero">([\s\S]*?)<\/figure>/)?.[1] || '';
  assert.doesNotMatch(suzyHero, /data-coupang-placement="article_hero"/);
});
