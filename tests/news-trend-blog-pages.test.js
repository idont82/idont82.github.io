const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const pages = [
  {
    path: 'blog/rainy-commute-essentials-guide.html',
    keyword: '장마 출근 준비물',
    productType: 'rainy_commute',
  },
  {
    path: 'blog/rainy-season-home-dehumidifying-guide.html',
    keyword: '장마철 제습기 추천',
    productType: 'rainy_dehumidifying',
  },
  {
    path: 'blog/school-zone-safety-goods-guide.html',
    keyword: '어린이 등하굣길 안전용품',
    productType: 'school_zone_safety',
  },
  {
    path: 'blog/long-period-comfort-goods-guide.html',
    keyword: '생리 오래할 때',
    productType: 'period_comfort',
  },
  {
    path: 'blog/soccer-watch-party-essentials-guide.html',
    keyword: '축구 집관 준비물',
    productType: 'soccer_watch_party',
  },
];

test('news trend blog pages expose SEO metadata, ads, and tracked Coupang CTAs', () => {
  for (const page of pages) {
    const html = fs.readFileSync(page.path, 'utf8');

    assert.match(html, /<html lang="ko">/, `${page.path} should be Korean`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page.path} should have one h1`);
    assert.match(html, new RegExp(page.keyword), `${page.path} should contain its main keyword`);
    assert.match(html, /<meta name="description"/, `${page.path} should have a description`);
    assert.match(html, /<link rel="canonical"/, `${page.path} should have canonical`);
    assert.match(html, /BlogPosting/, `${page.path} should have BlogPosting JSON-LD`);
    assert.match(html, /class="mobile-top-ad" data-mobile-top-ad/, `${page.path} should have the mobile top ad`);
    assert.match(html, /widgets\.html\?id=992213/, `${page.path} should have the 380x50 mobile ad iframe`);
    assert.match(html, /article-ad article-ad-frame-block/, `${page.path} should have an in-article ad block`);
    assert.match(html, /widgets\.html\?id=989908&template=carousel/, `${page.path} should have the 300x250 article ad iframe`);
    assert.match(html, /blog-sidebar blog-sidebar-right/, `${page.path} should have a right sidebar`);
    assert.match(html, /class="blog-ad-frame"/, `${page.path} should have the right rail ad frame`);
    assert.match(html, /data-coupang-placement="mobile_summary_card"/, `${page.path} should track mobile CTA clicks`);
    assert.match(html, /data-coupang-placement="product_card"/, `${page.path} should track product card clicks`);
    assert.match(html, new RegExp(`data-coupang-product-type="${page.productType}"`), `${page.path} should tag product type`);
    assert.match(html, /rel="sponsored nofollow"/, `${page.path} should mark affiliate links`);
    assert.match(html, /쿠팡 파트너스 활동으로 일정액의 수수료/, `${page.path} should disclose affiliate relationship`);

    const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    assert.ok(jsonLd, `${page.path} should include JSON-LD`);
    assert.doesNotThrow(() => JSON.parse(jsonLd[1]), `${page.path} JSON-LD should parse`);
  }
});

test('news trend blog pages are discoverable from index and sitemap', () => {
  const index = fs.readFileSync('index.html', 'utf8');
  const sitemap = fs.readFileSync('sitemap.xml', 'utf8');

  for (const page of pages) {
    assert.ok(index.includes(`/${page.path}`), `blog index should link ${page.path}`);
    assert.ok(sitemap.includes(`https://idont82.github.io/${page.path}`), `sitemap should include ${page.path}`);
  }
});

test('health-sensitive news trend article keeps medical caution visible', () => {
  const html = fs.readFileSync('blog/long-period-comfort-goods-guide.html', 'utf8');

  assert.match(html, /진료가 먼저/);
  assert.match(html, /과다출혈|심한 통증|어지럼/);
  assert.doesNotMatch(html, /치료합니다|완치|효과 보장/);
});
